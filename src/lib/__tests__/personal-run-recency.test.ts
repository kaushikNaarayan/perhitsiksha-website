import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function runFixture(workflowRuns: object[]) {
  const fixtureDir = mkdtempSync(join(tmpdir(), 'personal-run-recency-'));
  const fixturePath = join(fixtureDir, 'runs.json');
  writeFileSync(fixturePath, JSON.stringify({ workflow_runs: workflowRuns }));

  try {
    return JSON.parse(
      execFileSync(
        process.execPath,
        ['scripts/check-personal-run-recency.mjs'],
        {
          cwd: process.cwd(),
          encoding: 'utf8',
          env: {
            ...process.env,
            PERSONAL_RUNS_FIXTURE: fixturePath,
            RUN_RECENCY_NOW: '2026-09-29T06:00:00Z',
          },
        }
      )
    );
  } catch (error) {
    const output = (error as { stdout?: string }).stdout;
    return JSON.parse(output ?? '{}');
  }
}

describe('personal successful-run recency detector', () => {
  it('passes for a fresh successful run', () => {
    expect(
      runFixture([
        {
          conclusion: 'success',
          created_at: '2026-09-28T07:00:00Z',
          updated_at: '2026-09-28T08:00:00Z',
          html_url: 'https://example.test/fresh',
        },
      ])
    ).toMatchObject({ ok: true, latestRunUrl: 'https://example.test/fresh' });
  });

  it('fails for a deliberately stale successful-run fixture', () => {
    const result = runFixture([
      {
        conclusion: 'success',
        created_at: '2026-09-27T05:59:59Z',
        updated_at: '2026-09-27T05:59:59Z',
        html_url: 'https://example.test/stale',
      },
    ]);
    expect(result).toMatchObject({
      ok: false,
      latestRunUrl: 'https://example.test/stale',
    });
    expect(result.reason).toContain('older than 48 hours');
  });
});
