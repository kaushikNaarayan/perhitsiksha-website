#!/usr/bin/env node

import net from 'node:net';
import process from 'node:process';

const port = Number(process.argv[2]);
if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
  console.error(`::error::Expected a valid TCP port, received ${process.argv[2]}`);
  process.exitCode = 1;
} else {
  const server = net.createServer();
  let settled = false;
  const finish = (error, message) => {
    if (settled) return;
    settled = true;
    clearTimeout(timeout);
    if (error) {
      console.error(`::error::${message}: ${error.message}`);
      process.exitCode = 1;
    } else {
      console.log(`port ${port} is clean`);
    }
  };
  const timeout = setTimeout(
    () => finish(new Error('probe timed out'), `port ${port} could not be verified`),
    1_000
  );
  server.once('error', error =>
    finish(error, `port ${port} is occupied or could not be probed`)
  );
  server.listen(port, () =>
    server.close(error => finish(error, `port ${port} could not be released`))
  );
}
