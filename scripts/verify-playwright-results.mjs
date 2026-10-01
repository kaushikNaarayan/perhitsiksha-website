#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const resultsPath = process.argv[2] ?? 'playwright-results.json';

try {
  const results = JSON.parse(await readFile(resultsPath, 'utf8'));
  const stats = results.stats ?? {};
  const expected = Number(stats.expected ?? 0);
  const unexpected = Number(stats.unexpected ?? 0);
  const flaky = Number(stats.flaky ?? 0);
  const executed = ['expected', 'unexpected', 'flaky']
    .map(key => Number(stats[key] ?? 0))
    .reduce((sum, count) => sum + count, 0);

  console.log(`Playwright ran ${executed} test(s): ${JSON.stringify(stats)}`);
  for (const [name, count] of Object.entries({ expected, unexpected, flaky })) {
    if (!Number.isSafeInteger(count) || count < 0) {
      throw new Error(`invalid ${name} count in Playwright results: ${count}`);
    }
  }
  if (executed === 0) {
    throw new Error('0 tests executed; refusing a false-green E2E gate');
  }
  if (unexpected > 0) {
    throw new Error(
      `${unexpected} unexpected test failure(s); refusing a false-green E2E gate`
    );
  }
  if (flaky > 0) {
    throw new Error(
      `${flaky} flaky retry result(s); refusing a false-green E2E gate`
    );
  }
} catch (error) {
  console.error(
    `::error::Invalid or missing Playwright results at ${resultsPath}: ${error.message}`
  );
  process.exitCode = 1;
}
