#!/usr/bin/env node

import { spawn } from 'node:child_process';
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
  const startedAt = new Date();

  console.log(
    `[playwright-ci] starting ${command} ${args.join(' ')}; ` +
      `hard timeout ${timeoutMs}ms`
  );

  const child = spawn(command, args, {
    detached: process.platform !== 'win32',
    env: process.env,
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
    forcedKillTimer = setTimeout(() => {
      console.error(
        `[playwright-ci] process group did not exit within ${killGraceMs}ms; sending SIGKILL`
      );
      signalProcessTree(child, 'SIGKILL');
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
  if (timedOut) signalProcessTree(child, 'SIGKILL');

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
