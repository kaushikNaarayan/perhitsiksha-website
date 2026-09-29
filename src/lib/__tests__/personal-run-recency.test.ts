import { describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const detectorModulePath = '../../../scripts/check-personal-run-recency.mjs';
const { evaluateSuccessfulRunRecency, loadWorkflowRuns } = await import(
  detectorModulePath
);

const NOW = Date.parse('2026-09-29T06:00:00Z');

function successfulRun(updatedAt: string) {
  return {
    conclusion: 'success',
    created_at: updatedAt,
    updated_at: updatedAt,
    html_url: `https://example.test/${updatedAt}`,
  };
}

function apiResponse(workflowRuns: object[], ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => ({ workflow_runs: workflowRuns }),
  } as Response;
}

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
  it('makes one no-cache request when the first response is fresh', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(apiResponse([successfulRun('2026-09-29T05:30:00Z')]));

    const result = await loadWorkflowRuns({
      now: NOW,
      fetchImpl,
      cacheBustFactory: (attempt: number) => `attempt-${attempt}`,
    });

    expect(result.attemptCount).toBe(1);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls[0][0]).toContain('cache_bust=attempt-1');
    expect(fetchImpl.mock.calls[0][1].headers).toMatchObject({
      'Cache-Control': 'no-cache, no-store',
      Pragma: 'no-cache',
    });
  });

  it('retries a stale response and passes when a later response is fresh', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        apiResponse([successfulRun('2026-09-27T05:00:00Z')])
      )
      .mockResolvedValueOnce(
        apiResponse([successfulRun('2026-09-29T05:30:00Z')])
      );

    const result = await loadWorkflowRuns({
      now: NOW,
      fetchImpl,
      cacheBustFactory: (attempt: number) => `attempt-${attempt}`,
    });

    expect(result.attemptCount).toBe(2);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(evaluateSuccessfulRunRecency(result.workflowRuns, NOW)).toMatchObject({
      ok: true,
    });
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual(
      expect.arrayContaining([
        expect.stringContaining('cache_bust=attempt-1'),
        expect.stringContaining('cache_bust=attempt-2'),
      ])
    );
  });

  it('fails after three stale responses', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(apiResponse([successfulRun('2026-09-27T05:00:00Z')]));

    const result = await loadWorkflowRuns({
      now: NOW,
      fetchImpl,
      cacheBustFactory: (attempt: number) => `attempt-${attempt}`,
    });

    expect(result.attemptCount).toBe(3);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
    expect(
      evaluateSuccessfulRunRecency(result.workflowRuns, NOW)
    ).toMatchObject({
      ok: false,
    });
  });

  it('fails after three persistent API errors', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(apiResponse([], false, 503));

    await expect(
      loadWorkflowRuns({
        now: NOW,
        fetchImpl,
        cacheBustFactory: (attempt: number) => `attempt-${attempt}`,
      })
    ).rejects.toThrow('GitHub Actions API returned 503.');

    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

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
