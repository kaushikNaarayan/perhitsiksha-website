#!/usr/bin/env node

import { execFileSync, spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_TIMEOUT_MS = 12 * 60 * 1000;
const DEFAULT_KILL_GRACE_MS = 5 * 1000;

function positiveInteger(value, fallback, name) {
  if (value === undefined) return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) {
    throw new Error(`${name} must be a positive integer, received ${value}`);
  }
  return parsed;
}

function commandFromEnvironment() {
  const command =
    process.env.PLAYWRIGHT_CI_COMMAND ??
    path.join(process.cwd(), 'node_modules', '.bin', 'playwright');
  const rawArgs = process.env.PLAYWRIGHT_CI_ARGS_JSON;
  const args =
    rawArgs === undefined
      ? ['test', '--reporter=list,json']
      : JSON.parse(rawArgs);

  if (!Array.isArray(args) || args.some(arg => typeof arg !== 'string')) {
    throw new Error('PLAYWRIGHT_CI_ARGS_JSON must be a JSON array of strings');
  }
  return { command, args };
}

function signalProcessTree(child, signal) {
  try {
    // detached creates a dedicated process group on Linux. Signalling the
    // negative pid terminates Playwright and its browser/webServer children.
    if (process.platform !== 'win32') process.kill(-child.pid, signal);
    else if (child.exitCode === null && child.signalCode === null)
      child.kill(signal);
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error;
  }
}

function processSnapshot(pid) {
  try {
    const stat = readFileSync(`/proc/${pid}/stat`, 'utf8');
    const fields = stat.slice(stat.lastIndexOf(')') + 2).trim().split(/\s+/);
    const status = readFileSync(`/proc/${pid}/status`, 'utf8');
    const uid = status.match(/^Uid:\s+(\d+)/m)?.[1] ?? null;
    return {
      pid: Number(pid),
      command: readFileSync(`/proc/${pid}/cmdline`, 'utf8')
        .split('\0')
        .filter(Boolean)
        .join(' '),
      uid,
      ppid: Number(fields[1]),
      pgid: Number(fields[2]),
      sid: Number(fields[3]),
      state: fields[0],
      wchan: readFileSync(`/proc/${pid}/wchan`, 'utf8').trim(),
      cgroup: readFileSync(`/proc/${pid}/cgroup`, 'utf8').trim(),
    };
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    return { pid: Number(pid), snapshotError: error.message };
  }
}

function tokenOwnedProcesses(token) {
  return readdirSync('/proc', { withFileTypes: true })
    .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map(entry => entry.name)
    .filter(pid => {
      try {
        return readFileSync(`/proc/${pid}/environ`, 'utf8')
          .split('\0')
          .includes(`PLAYWRIGHT_CI_RUN_TOKEN=${token}`);
      } catch (error) {
        return false;
      }
    })
    .map(processSnapshot)
    .filter(Boolean);
}

function listenerSnapshots(port) {
  if (port === undefined) return [];
  if (!/^\d+$/.test(port)) {
    throw new Error(`PLAYWRIGHT_CI_PORT must be a numeric TCP port, received ${port}`);
  }
  try {
    const command = process.env.PLAYWRIGHT_CI_LISTENER_PROBE_COMMAND ?? 'lsof';
    const args = process.env.PLAYWRIGHT_CI_LISTENER_PROBE_ARGS_JSON
      ? JSON.parse(process.env.PLAYWRIGHT_CI_LISTENER_PROBE_ARGS_JSON).map(arg =>
          arg
            .replaceAll('{port}', port)
            .replaceAll(
              '{readyPath}',
              process.env.PLAYWRIGHT_CI_LISTENER_PROBE_READY_PATH ?? ''
            )
        )
      : ['-ti', `tcp:${port}`];
    if (!Array.isArray(args) || args.some(arg => typeof arg !== 'string')) {
      throw new Error('PLAYWRIGHT_CI_LISTENER_PROBE_ARGS_JSON must be a JSON array of strings');
    }
    // Timeout diagnostics run on shared self-hosted runners. A stalled probe
    // must be recorded as an error, never allowed to defeat the harness bound.
    return execFileSync(command, args, {
      encoding: 'utf8',
      timeout: 500,
      killSignal: 'SIGKILL',
    })
      .split(/\s+/)
      .filter(Boolean)
      .map(processSnapshot)
      .filter(Boolean);
  } catch (error) {
    // A missing listener is clean. Any probe failure remains an explicit
    // diagnostic and is not equivalent to observing a listener.
    if (error.status === 1) return [];
    return [{ listenerSnapshotError: error.message }];
  }
}

function signalTokenOwnedProcesses(token, signal, terminationLog, port) {
  const before = tokenOwnedProcesses(token);
  const listenersBefore = listenerSnapshots(port);
  const signals = before.map(snapshot => {
    try {
      process.kill(snapshot.pid, signal);
      return { pid: snapshot.pid, result: 'sent' };
    } catch (error) {
      return { pid: snapshot.pid, result: 'failed', error: error.message };
    }
  });
  const after = tokenOwnedProcesses(token);
  const listenersAfter = listenerSnapshots(port);
  terminationLog.push({
    at: new Date().toISOString(),
    signal,
    before,
    listenersBefore,
    signals,
    after,
    listenersAfter,
  });
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function main() {
  const { command, args } = commandFromEnvironment();
  const timeoutMs = positiveInteger(
    process.env.PLAYWRIGHT_CI_TIMEOUT_MS,
    DEFAULT_TIMEOUT_MS,
    'PLAYWRIGHT_CI_TIMEOUT_MS'
  );
  const killGraceMs = positiveInteger(
    process.env.PLAYWRIGHT_CI_KILL_GRACE_MS,
    DEFAULT_KILL_GRACE_MS,
    'PLAYWRIGHT_CI_KILL_GRACE_MS'
  );
  const diagnosticsPath =
    process.env.PLAYWRIGHT_CI_DIAGNOSTICS ?? 'playwright-ci-diagnostics.json';
  const monitoredPort = process.env.PLAYWRIGHT_CI_PORT;
  const runToken = randomUUID();
  const startedAt = new Date();
  const terminationLog = [];

  console.log(
    `[playwright-ci] starting ${command} ${args.join(' ')}; ` +
      `hard timeout ${timeoutMs}ms`
  );

  const child = spawn(command, args, {
    detached: process.platform !== 'win32',
    // Every descendant gets a unique, job-local ownership marker. Unlike a
    // process group, this survives a child calling setsid() or reparenting.
    env: { ...process.env, PLAYWRIGHT_CI_RUN_TOKEN: runToken },
    stdio: 'inherit',
  });

  let timedOut = false;
  let forcedKillTimer;
  const timeout = setTimeout(() => {
    timedOut = true;
    console.error(
      `[playwright-ci] hard timeout reached after ${timeoutMs}ms; ` +
        'terminating the complete Playwright process group'
    );
    signalProcessTree(child, 'SIGTERM');
    signalTokenOwnedProcesses(
      runToken,
      'SIGTERM',
      terminationLog,
      monitoredPort
    );
    forcedKillTimer = setTimeout(() => {
      console.error(
        `[playwright-ci] process group did not exit within ${killGraceMs}ms; sending SIGKILL`
      );
      signalProcessTree(child, 'SIGKILL');
      signalTokenOwnedProcesses(
        runToken,
        'SIGKILL',
        terminationLog,
        monitoredPort
      );
    }, killGraceMs);
  }, timeoutMs);

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => {
      console.error(
        `[playwright-ci] received ${signal}; terminating process group`
      );
      signalProcessTree(child, signal);
    });
  }

  const result = await new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });

  clearTimeout(timeout);
  if (forcedKillTimer) clearTimeout(forcedKillTimer);
  // The group leader can obey SIGTERM while a browser or webServer child
  // ignores it. Reap the group once more after the leader exits so those
  // descendants cannot outlive a timed-out run.
  if (timedOut) {
    // The process-group leader can exit before the grace timer while an
    // escaped Vite/browser child ignores TERM. Wait out that grace, then
    // reap every remaining process bearing this run's token.
    await delay(killGraceMs);
    signalProcessTree(child, 'SIGKILL');
    signalTokenOwnedProcesses(
      runToken,
      'SIGKILL',
      terminationLog,
      monitoredPort
    );
  }

  const finishedAt = new Date();
  const diagnostics = {
    command,
    args,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    timeoutMs,
    timedOut,
    exitCode: result.code,
    signal: result.signal,
    runToken,
    termination: terminationLog,
    remainingTokenOwnedProcesses: tokenOwnedProcesses(runToken),
  };
  await writeFile(diagnosticsPath, `${JSON.stringify(diagnostics, null, 2)}\n`);

  if (timedOut) {
    console.error(
      `[playwright-ci] timed out; diagnostics written to ${diagnosticsPath}`
    );
    process.exitCode = 124;
  } else if (result.code !== null) {
    console.log(
      `[playwright-ci] exited with code ${result.code}; diagnostics written to ${diagnosticsPath}`
    );
    process.exitCode = result.code;
  } else {
    console.error(
      `[playwright-ci] exited from signal ${result.signal}; diagnostics written to ${diagnosticsPath}`
    );
    process.exitCode = 1;
  }
}

main().catch(error => {
  console.error(`[playwright-ci] fatal harness error: ${error.stack ?? error}`);
  process.exitCode = 1;
});
