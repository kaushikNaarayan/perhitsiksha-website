/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck -- the detector is a plain Node ESM script exercised as a black box.
import { describe, expect, it, vi } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
// @ts-ignore The production detector is intentionally plain Node ESM.
import {
  evaluateSuccessfulRunRecency,
  loadFixtureChecks,
  loadImmutableDeployChecks,
  MAX_SUCCESS_AGE_MS,
} from '../../../scripts/check-personal-run-recency.mjs';

const now = Date.parse('2026-09-30T10:00:00Z');
const sha = 'a'.repeat(40);
const parent = 'b'.repeat(40);
const deploy = (completed_at: string, name = 'build-and-deploy') => ({
  name,
  conclusion: 'success',
  completed_at,
  details_url: 'https://example.test/run',
});
const response = (body: object, ok = true, status = 200) =>
  ({ ok, status, json: async () => body }) as Response;
const lsRemote = () => `${sha}\trefs/heads/main\n`;

describe('immutable personal deploy recency detector', () => {
  it('passes a fresh current-head self-hosted Deploy check', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValue(
        response({ check_runs: [deploy('2026-09-30T09:50:05Z')] })
      );
    const result = await loadImmutableDeployChecks({
      fetchImpl,
      execImpl: lsRemote,
    });
    expect(evaluateSuccessfulRunRecency(result.checks, now)).toMatchObject({
      ok: true,
    });
  });
  it('walks first parent when current head is pending', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          check_runs: [{ name: 'build-and-deploy', conclusion: null }],
        })
      )
      .mockResolvedValueOnce(
        response({
          commit: { author: { date: '2026-09-30T09:55:00Z' } },
          parents: [{ sha: parent }],
        })
      )
      .mockResolvedValueOnce(
        response({ check_runs: [deploy('2026-09-30T09:50:05Z')] })
      );
    const result = await loadImmutableDeployChecks({
      now,
      fetchImpl,
      execImpl: lsRemote,
    });
    expect(result).toMatchObject({ depth: 1, source: 'immutable-check-runs' });
    expect(result.checks).toHaveLength(1);
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual([
      expect.stringContaining(`/commits/${sha}/check-runs`),
      expect.stringContaining(`/commits/${sha}`),
      expect.stringContaining(`/commits/${parent}/check-runs`),
    ]);
    expect(evaluateSuccessfulRunRecency(result.checks, now).ok).toBe(true);
  });
  it('fails stale deploy and ignores unrelated Pages success', async () => {
    expect(
      evaluateSuccessfulRunRecency([deploy('2026-09-27T09:00:00Z')], now).ok
    ).toBe(false);
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        response({
          check_runs: [
            deploy('2026-09-30T09:55:00Z', 'pages-build-deployment'),
          ],
        })
      )
      .mockResolvedValueOnce(
        response({
          commit: { author: { date: '2026-09-30T09:55:00Z' } },
          parents: [],
        })
      );
    expect(
      (await loadImmutableDeployChecks({ now, fetchImpl, execImpl: lsRemote }))
        .checks
    ).toEqual([]);
  });
  it.each([
    [() => '', 'missing or malformed'],
    [
      () => `${sha}\trefs/heads/main\n`,
      'Immutable check-runs request returned 503.',
    ],
  ])(
    'fails closed on malformed ref or bounded network data',
    async (execImpl, message) => {
      const fetchImpl = vi.fn().mockResolvedValue(response({}, false, 503));
      await expect(
        loadImmutableDeployChecks({ fetchImpl, execImpl })
      ).rejects.toThrow(message);
    }
  );

  it('rejects malformed check-runs at the check boundary after one request', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response({ check_runs: null }));
    await expect(
      loadImmutableDeployChecks({ fetchImpl, execImpl: lsRemote })
    ).rejects.toThrow('check-runs payload was malformed');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual([
      expect.stringContaining(`/commits/${sha}/check-runs`),
    ]);
  });

  it('reaches and fails at malformed history', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ check_runs: [] }))
      .mockResolvedValueOnce(
        response({ commit: {}, parents: [{ sha: parent }] })
      );
    await expect(
      loadImmutableDeployChecks({ fetchImpl, execImpl: lsRemote })
    ).rejects.toThrow('commit timestamp was malformed');
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual([
      expect.stringContaining('/check-runs'),
      expect.stringContaining(`/commits/${sha}`),
    ]);
  });

  it('fails closed when first-parent history request fails', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ check_runs: [] }))
      .mockResolvedValueOnce(response({}, false, 503));
    await expect(
      loadImmutableDeployChecks({ fetchImpl, execImpl: lsRemote })
    ).rejects.toThrow('history request returned 503');
    expect(fetchImpl.mock.calls[1][0]).toContain(`/commits/${sha}`);
  });

  it('walks a commit exactly at the 48-hour horizon', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ check_runs: [] }))
      .mockResolvedValueOnce(
        response({
          commit: {
            author: {
              date: new Date(now - MAX_SUCCESS_AGE_MS).toISOString(),
            },
          },
          parents: [{ sha: parent }],
        })
      )
      .mockResolvedValueOnce(
        response({ check_runs: [deploy('2026-09-30T09:50:05Z')] })
      );
    const result = await loadImmutableDeployChecks({
      now,
      fetchImpl,
      execImpl: lsRemote,
    });
    expect(result).toMatchObject({ depth: 1, source: 'immutable-check-runs' });
    expect(result.checks).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it('stops just outside the 48-hour horizon without fetching a parent', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response({ check_runs: [] }))
      .mockResolvedValueOnce(
        response({
          commit: {
            author: {
              date: new Date(now - MAX_SUCCESS_AGE_MS - 1).toISOString(),
            },
          },
          parents: [{ sha: parent }],
        })
      );
    const result = await loadImmutableDeployChecks({
      now,
      fetchImpl,
      execImpl: lsRemote,
    });
    expect(result.checks).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it('enforces the max-12 first-parent bound with exact call count', async () => {
    const fetchImpl = vi.fn();
    const chain = Array.from({ length: 13 }, (_, index) =>
      index.toString(16).padEnd(40, 'a')
    );
    const boundedLsRemote = () => `${chain[0]}\trefs/heads/main\n`;
    for (let i = 0; i < 12; i += 1) {
      fetchImpl.mockResolvedValueOnce(response({ check_runs: [] }));
      fetchImpl.mockResolvedValueOnce(
        response({
          commit: { author: { date: '2026-09-30T09:55:00Z' } },
          parents: [{ sha: chain[i + 1] }],
        })
      );
    }
    await loadImmutableDeployChecks({
      now,
      fetchImpl,
      execImpl: boundedLsRemote,
    });
    expect(fetchImpl).toHaveBeenCalledTimes(24);
    expect(fetchImpl.mock.calls.map(call => call[0])).toEqual(
      chain
        .slice(0, 12)
        .flatMap(commitSha => [
          `https://api.github.com/repos/kaushikNaarayan/perhitsiksha-website/commits/${commitSha}/check-runs?per_page=100`,
          `https://api.github.com/repos/kaushikNaarayan/perhitsiksha-website/commits/${commitSha}`,
        ])
    );
    expect(fetchImpl.mock.calls[24]).toBeUndefined();
  });

  it('runs the real entrypoint and exits 1 for a deterministic stale fixture', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'recency-')), 'stale.json');
    writeFileSync(
      file,
      JSON.stringify({ checks: [deploy('2026-09-27T09:00:00Z')] })
    );
    try {
      execFileSync(
        process.execPath,
        ['scripts/check-personal-run-recency.mjs'],
        {
          cwd: process.cwd(),
          env: {
            ...process.env,
            PERSONAL_RUNS_FIXTURE: file,
            RUN_RECENCY_NOW: '2026-09-30T10:00:00Z',
          },
          encoding: 'utf8',
        }
      );
    } catch (error) {
      expect(error.status).toBe(1);
      const output = JSON.parse(error.stdout);
      expect(output).toMatchObject({ ok: false });
      expect(output.reason).toContain('older than 48 hours');
      return;
    }
    throw new Error('stale detector unexpectedly exited 0');
  });

  it('rejects malformed fixture JSON through the real entrypoint', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'recency-')), 'invalid.json');
    writeFileSync(file, '{not valid JSON');
    const result = spawnSync(
      process.execPath,
      ['scripts/check-personal-run-recency.mjs'],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PERSONAL_RUNS_FIXTURE: file,
          RUN_RECENCY_NOW: '2026-09-30T10:00:00Z',
        },
        encoding: 'utf8',
      }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/JSON|Expected|Unexpected/);
  });

  it('only activates the fixture seam when a fixture path is explicit', () => {
    const readFileImpl = vi.fn(() => '{"checks":[]}');
    expect(loadFixtureChecks({ fixturePath: '', readFileImpl })).toBeNull();
    expect(readFileImpl).not.toHaveBeenCalled();
  });
});
