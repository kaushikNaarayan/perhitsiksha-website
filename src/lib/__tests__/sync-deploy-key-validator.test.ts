import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const workflow = readFileSync(
  join(projectRoot, '.github/workflows/sync-to-personal.yml'),
  'utf8'
);
const fixture = (name: string) =>
  readFileSync(
    join(projectRoot, 'scripts/fixtures/sync-deploy-key', name),
    'utf8'
  );
const diagnostic =
  'SYNC_DEPLOY_KEY is absent or malformed; refusing personal-repo sync before network access.';

function extractPreflight() {
  const match = workflow.match(
    / {6}- name: Preflight sync deploy key before network access\n[\s\S]*? {8}run: \|\n([\s\S]*?)\n\n {6}- name: Checkout/
  );

  if (!match) {
    throw new Error(
      'Could not extract the pre-checkout sync deploy key preflight.'
    );
  }

  return match[1].replace(/^ {10}/gm, '');
}

const preflight = extractPreflight();

function runPreflight(env: Record<string, string | undefined> = {}) {
  return spawnSync('/bin/sh', ['-c', preflight], {
    cwd: projectRoot,
    env: { PATH: process.env.PATH, ...env },
    encoding: 'utf8',
  });
}

describe('pre-checkout sync deploy key preflight', () => {
  it('accepts a structurally valid inert fixture', () => {
    const result = runPreflight({
      SYNC_DEPLOY_KEY: fixture('valid-inert.fixture'),
    });

    expect(result.status).toBe(0);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe('');
  });

  it.each([
    ['absent', {}],
    ['blank', { SYNC_DEPLOY_KEY: '   ' }],
    [
      'malformed envelope',
      { SYNC_DEPLOY_KEY: fixture('malformed-envelope.fixture') },
    ],
    [
      'explicit invalid-fixture mode',
      {
        SYNC_DEPLOY_KEY: fixture('valid-inert.fixture'),
        SYNC_DEPLOY_KEY_INVALID_FIXTURE: '1',
      },
    ],
  ])('rejects %s through the same workflow entrypoint', (_name, env) => {
    const result = runPreflight(env);

    expect(result.status).toBe(1);
    expect(result.stdout).toBe('');
    expect(result.stderr).toBe(`${diagnostic}\n`);
  });

  it('keeps the exact preflight pure and free of network or subprocess APIs', () => {
    expect(preflight).not.toMatch(
      /child_process|fetch\(|https?:\/\/|\bssh\b|\bgit\b|\bcurl\b|\bapi\b/i
    );
  });

  it('runs preflight before checkout and SSH setup and preserves a fatal push diagnostic', () => {
    const preflightStep = workflow.indexOf(
      'name: Preflight sync deploy key before network access'
    );
    const checkoutStep = workflow.indexOf('name: Checkout');
    const configureStep = workflow.indexOf('name: Configure SSH deploy key');
    const pushStep = workflow.indexOf('name: Push to personal repo');

    expect(preflightStep).toBeGreaterThanOrEqual(0);
    expect(preflightStep).toBeLessThan(checkoutStep);
    expect(checkoutStep).toBeLessThan(configureStep);
    expect(configureStep).toBeLessThan(pushStep);
    expect(workflow.slice(0, preflightStep)).toContain('steps:');
    expect(workflow.slice(0, preflightStep)).not.toContain('uses:');
    expect(workflow.slice(pushStep)).toContain(
      'Personal-repo sync failed; public domain was not deployed.'
    );
    expect(workflow.slice(pushStep)).toContain(
      'git push personal main --force'
    );
    expect(workflow).not.toContain('continue-on-error');
  });
});
