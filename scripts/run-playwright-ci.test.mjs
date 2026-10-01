import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import test from 'node:test';

const runner = new URL('./run-playwright-ci.mjs', import.meta.url).pathname;
const fixture = new URL('./fixtures/ci-harness-fixture.mjs', import.meta.url)
  .pathname;
const slowListenerProbe = new URL(
  './fixtures/slow-listener-probe.mjs',
  import.meta.url
).pathname;
const fastListenerProbe = new URL(
  './fixtures/fast-listener-probe.mjs',
  import.meta.url
).pathname;
const portCheck = new URL('./assert-port-clean.mjs', import.meta.url).pathname;
const verifier = new URL('./verify-playwright-results.mjs', import.meta.url)
  .pathname;

function runFixture(mode, directory, extraEnv = {}, port = '3100') {
  const results = path.join(directory, 'playwright-results.json');
  const diagnostics = path.join(directory, 'diagnostics.json');
  const ready = path.join(directory, 'server-ready');
  const args = [fixture, mode, results, ready, port];
  const child = spawn(process.execPath, [runner], {
    env: {
      ...process.env,
      PLAYWRIGHT_CI_COMMAND: process.execPath,
      PLAYWRIGHT_CI_ARGS_JSON: JSON.stringify(args),
      PLAYWRIGHT_CI_DIAGNOSTICS: diagnostics,
      PLAYWRIGHT_CI_PORT: port,
      PLAYWRIGHT_CI_LISTENER_PROBE_READY_PATH: ready,
      ...extraEnv,
    },
    stdio: 'pipe',
  });

  return new Promise((resolve, reject) => {
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk;
    });
    child.stderr.on('data', chunk => {
      output += chunk;
    });
    child.once('error', reject);
    child.once('exit', (code, signal) =>
      resolve({ code, signal, output, results, diagnostics, ready })
    );
  });
}

function runVerifier(resultsPath) {
  const child = spawn(process.execPath, [verifier, resultsPath], {
    stdio: 'pipe',
  });
  return new Promise((resolve, reject) => {
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk;
    });
    child.stderr.on('data', chunk => {
      output += chunk;
    });
    child.once('error', reject);
    child.once('exit', code => resolve({ code, output }));
  });
}

function runPortCheck(port) {
  const child = spawn(process.execPath, [portCheck, String(port)], {
    stdio: 'pipe',
  });
  return new Promise((resolve, reject) => {
    let output = '';
    child.stdout.on('data', chunk => {
      output += chunk;
    });
    child.stderr.on('data', chunk => {
      output += chunk;
    });
    child.once('error', reject);
    child.once('exit', code => resolve({ code, output }));
  });
}

async function temporaryDirectory(t) {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), 'playwright-ci-harness-')
  );
  t.after(() => rm(directory, { force: true, recursive: true }));
  return directory;
}

async function canConnect(port) {
  return new Promise(resolve => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('error', () => resolve(false));
  });
}

async function availablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(error => (error ? reject(error) : resolve(port)));
    });
  });
}

test('good suite input exits zero and retains a nonzero result', async t => {
  const directory = await temporaryDirectory(t);
  const result = await runFixture('pass', directory);
  assert.equal(result.code, 0, result.output);
  const report = JSON.parse(await readFile(result.results, 'utf8'));
  const diagnostics = JSON.parse(await readFile(result.diagnostics, 'utf8'));
  assert.equal(report.stats.expected, 1);
  assert.equal(diagnostics.timedOut, false);
  assert.equal(diagnostics.exitCode, 0);
  const verification = await runVerifier(result.results);
  assert.equal(verification.code, 0, verification.output);
});

test('failing suite input stays nonzero and retains diagnostics', async t => {
  const directory = await temporaryDirectory(t);
  const result = await runFixture('fail', directory);
  assert.equal(result.code, 7, result.output);
  await stat(result.results);
  const diagnostics = JSON.parse(await readFile(result.diagnostics, 'utf8'));
  assert.equal(diagnostics.timedOut, false);
  assert.equal(diagnostics.exitCode, 7);
});

test('hung no-result process tree is killed within the inner bound and frees its server port', async t => {
  const port = await availablePort();
  const directory = await temporaryDirectory(t);
  const startedAt = Date.now();
  const result = await runFixture(
    'hang',
    directory,
    {
      PLAYWRIGHT_CI_TIMEOUT_MS: '750',
      PLAYWRIGHT_CI_KILL_GRACE_MS: '250',
      PLAYWRIGHT_CI_LISTENER_PROBE_COMMAND: process.execPath,
      PLAYWRIGHT_CI_LISTENER_PROBE_ARGS_JSON: JSON.stringify([
        fastListenerProbe,
        '{readyPath}',
      ]),
    },
    String(port)
  );

  assert.equal(result.code, 124, result.output);
  assert.ok(
    Date.now() - startedAt < 5_000,
    'hung fixture exceeded the explicit test bound'
  );
  const diagnostics = JSON.parse(await readFile(result.diagnostics, 'utf8'));
  assert.equal(diagnostics.timedOut, true);
  assert.ok(
    diagnostics.termination.some(attempt =>
      attempt.listenersBefore.some(snapshot => Number.isSafeInteger(snapshot.pid))
    ),
    'timeout diagnostics should capture the escaped listener before signalling'
  );
  assert.ok(
    diagnostics.termination.some(attempt => attempt.signal === 'SIGTERM'),
    'timeout should record TERM ownership diagnostics'
  );
  assert.ok(
    diagnostics.termination.some(attempt => attempt.signal === 'SIGKILL'),
    'escaped descendant should require token-scoped KILL cleanup'
  );
  assert.deepEqual(diagnostics.remainingTokenOwnedProcesses, []);
  await assert.rejects(stat(result.results), { code: 'ENOENT' });

  // Give the kernel a short interval to release the listener after SIGTERM.
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(
    await canConnect(port),
    false,
    `runner left an orphan listener on port ${port}`
  );
});

test('a stalled listener probe is recorded as an error without extending the lifecycle bound', async t => {
  const port = await availablePort();
  const directory = await temporaryDirectory(t);
  const startedAt = Date.now();
  const result = await runFixture(
    'hang',
    directory,
    {
      PLAYWRIGHT_CI_TIMEOUT_MS: '750',
      PLAYWRIGHT_CI_KILL_GRACE_MS: '250',
      PLAYWRIGHT_CI_LISTENER_PROBE_COMMAND: process.execPath,
      PLAYWRIGHT_CI_LISTENER_PROBE_ARGS_JSON: JSON.stringify([
        slowListenerProbe,
        '{port}',
      ]),
    },
    String(port)
  );

  assert.equal(result.code, 124, result.output);
  assert.ok(
    Date.now() - startedAt < 5_000,
    'stalled listener probe exceeded the explicit lifecycle bound'
  );
  const diagnostics = JSON.parse(await readFile(result.diagnostics, 'utf8'));
  assert.ok(
    diagnostics.termination.some(attempt =>
      attempt.listenersBefore.some(snapshot => snapshot.listenerSnapshotError)
    ),
    'stalled probe must be recorded as an error rather than a listener'
  );
  assert.deepEqual(diagnostics.remainingTokenOwnedProcesses, []);
  await assert.rejects(stat(result.results), { code: 'ENOENT' });
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(await canConnect(port), false);
});

test('bounded port probe accepts a free port and rejects an occupied one', async () => {
  const port = await availablePort();
  const free = await runPortCheck(port);
  assert.equal(free.code, 0, free.output);

  const listener = net.createServer();
  await new Promise((resolve, reject) => {
    listener.once('error', reject);
    listener.listen(port, resolve);
  });
  try {
    const occupied = await runPortCheck(port);
    assert.equal(occupied.code, 1, occupied.output);
    assert.match(occupied.output, /occupied or could not be probed/);
  } finally {
    await new Promise((resolve, reject) =>
      listener.close(error => (error ? reject(error) : resolve()))
    );
  }
});

test('missing results fail verification', async t => {
  const directory = await temporaryDirectory(t);
  const verification = await runVerifier(
    path.join(directory, 'missing-results.json')
  );
  assert.equal(verification.code, 1, verification.output);
  assert.match(verification.output, /Invalid or missing Playwright results/);
});

test('zero executed tests fail verification', async t => {
  const directory = await temporaryDirectory(t);
  const emptyResults = path.join(directory, 'zero-results.json');
  await writeFile(
    emptyResults,
    JSON.stringify({ stats: { expected: 0, unexpected: 0, flaky: 0 } })
  );
  const verification = await runVerifier(emptyResults);
  assert.equal(verification.code, 1, verification.output);
  assert.match(verification.output, /0 tests executed/);
});

test('flaky retry results fail verification even when Playwright exits zero', async t => {
  const directory = await temporaryDirectory(t);
  const flakyResults = path.join(directory, 'flaky-results.json');
  await writeFile(
    flakyResults,
    JSON.stringify({ stats: { expected: 82, unexpected: 0, flaky: 1 } })
  );
  const verification = await runVerifier(flakyResults);
  assert.equal(verification.code, 1, verification.output);
  assert.match(verification.output, /1 flaky retry result/);
});

test('unexpected results fail verification', async t => {
  const directory = await temporaryDirectory(t);
  const unexpectedResults = path.join(directory, 'unexpected-results.json');
  await writeFile(
    unexpectedResults,
    JSON.stringify({ stats: { expected: 82, unexpected: 1, flaky: 0 } })
  );
  const verification = await runVerifier(unexpectedResults);
  assert.equal(verification.code, 1, verification.output);
  assert.match(verification.output, /1 unexpected test failure/);
});
