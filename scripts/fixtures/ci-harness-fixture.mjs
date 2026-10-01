import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import net from 'node:net';
import process from 'node:process';

const [mode, outputPath, readyPath, portValue] = process.argv.slice(2);

if (mode === 'pass' || mode === 'fail') {
  await writeFile(outputPath, JSON.stringify({ stats: { expected: 1 } }));
  process.exit(mode === 'pass' ? 0 : 7);
}

if (mode === 'server') {
  // Prove that the runner escalates beyond a cooperative group leader: this
  // descendant deliberately ignores SIGTERM and must still be reaped.
  process.on('SIGTERM', () => {});
  const server = net.createServer(() => {});
  server.listen(Number(portValue), '127.0.0.1', async () => {
    await writeFile(readyPath, 'ready\n');
  });
  await new Promise(() => {});
}

if (mode === 'hang') {
  spawn(
    process.execPath,
    [
      new URL(import.meta.url).pathname,
      'server',
      outputPath,
      readyPath,
      portValue,
    ],
    {
      // Escape the runner's original process group to reproduce the CI
      // failure: token-based cleanup, not group cleanup, must reap it.
      detached: true,
      stdio: 'inherit',
    }
  ).unref();
  // A detached/unref'd child no longer keeps this parent's event loop alive.
  // Keep the intentional hang alive until the runner's timeout terminates it.
  setInterval(() => {}, 1_000);
  await new Promise(() => {});
}

throw new Error(`unknown fixture mode: ${mode}`);
