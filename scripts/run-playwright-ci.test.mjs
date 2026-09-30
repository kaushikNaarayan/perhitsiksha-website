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
  await assert.rejects(stat(result.results), { code: 'ENOENT' });

  // Give the kernel a short interval to release the listener after SIGTERM.
  await new Promise(resolve => setTimeout(resolve, 100));
  assert.equal(
    await canConnect(port),
    false,
    `runner left an orphan listener on port ${port}`
  );
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
