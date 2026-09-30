#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import process from 'node:process';

const resultsPath = process.argv[2] ?? 'playwright-results.json';

try {
  const results = JSON.parse(await readFile(resultsPath, 'utf8'));
  const stats = results.stats ?? {};
  const executed = ['expected', 'unexpected', 'flaky']
    .map(key => Number(stats[key] ?? 0))
    .reduce((sum, count) => sum + count, 0);

  console.log(`Playwright ran ${executed} test(s): ${JSON.stringify(stats)}`);
  if (executed === 0) {
    throw new Error('0 tests executed; refusing a false-green E2E gate');
  }
} catch (error) {
  console.error(
    `::error::Invalid or missing Playwright results at ${resultsPath}: ${error.message}`
  );
  process.exitCode = 1;
}
