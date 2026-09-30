import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const REPO = 'kaushikNaarayan/perhitsiksha-website';
export const MAX_SUCCESS_AGE_MS = 48 * 60 * 60 * 1000;
export const MAX_FIRST_PARENTS = 12;
const HEADERS = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'perhitsiksha-run-recency-detector',
  'X-GitHub-Api-Version': '2022-11-28',
};

export function evaluateSuccessfulRunRecency(checks, now = Date.now()) {
  const check = checks
    .filter(c => c.conclusion === 'success' && c.completed_at)
    .sort((a, b) => Date.parse(b.completed_at) - Date.parse(a.completed_at))[0];
  if (!check)
    return {
      ok: false,
      reason: 'No relevant successful self-hosted Deploy job exists.',
    };
  const ageMs = now - Date.parse(check.completed_at);
  return {
    ok: ageMs <= MAX_SUCCESS_AGE_MS,
    ageMs,
    latestSuccessAt: check.completed_at,
    latestRunUrl: check.details_url,
    reason:
      ageMs <= MAX_SUCCESS_AGE_MS
        ? 'Latest relevant self-hosted Deploy job is fresh.'
        : 'Latest relevant self-hosted Deploy job is older than 48 hours.',
  };
}

export async function loadImmutableDeployChecks({
  now = Date.now(),
  fetchImpl = fetch,
  execImpl = execFileSync,
  maxCommits = MAX_FIRST_PARENTS,
} = {}) {
  const output = execImpl(
    'git',
    ['ls-remote', `https://github.com/${REPO}.git`, 'refs/heads/main'],
    { encoding: 'utf8' }
  );
  let sha = output.match(/^([0-9a-f]{40})\s+refs\/heads\/main$/m)?.[1];
  if (!sha) throw new Error('Personal main ref was missing or malformed.');
  for (let depth = 0; depth < maxCommits; depth += 1) {
    const checksResponse = await fetchImpl(
      `https://api.github.com/repos/${REPO}/commits/${sha}/check-runs?per_page=100`,
      { headers: HEADERS }
    );
    if (!checksResponse.ok)
      throw new Error(
        `Immutable check-runs request returned ${checksResponse.status}.`
      );
    const payload = await checksResponse.json();
    if (!Array.isArray(payload.check_runs))
      throw new Error('Immutable check-runs payload was malformed.');
    const checks = payload.check_runs.filter(
      c =>
        c.conclusion === 'success' &&
        /^(build-and-deploy|post-deploy-monitoring)$/i.test(c.name || '')
    );
    if (checks.length) return { checks, depth, source: 'immutable-check-runs' };
    const commitResponse = await fetchImpl(
      `https://api.github.com/repos/${REPO}/commits/${sha}`,
      { headers: HEADERS }
    );
    if (!commitResponse.ok)
      throw new Error(
        `Immutable commit history request returned ${commitResponse.status}.`
      );
    const commitPayload = await commitResponse.json();
    const committedAt = Date.parse(commitPayload.commit?.author?.date);
    if (!Number.isFinite(committedAt))
      throw new Error('Immutable commit timestamp was malformed.');
    if (now - committedAt > MAX_SUCCESS_AGE_MS) break;
    const parents = commitPayload.parents;
    if (!Array.isArray(parents))
      throw new Error('Immutable commit history payload was malformed.');
    if (parents.length === 0) break;
    if (!/^[0-9a-f]{40}$/.test(parents[0]?.sha || ''))
      throw new Error('Immutable first-parent history was malformed.');
    sha = parents[0].sha;
  }
  return { checks: [], source: 'immutable-check-runs' };
}

export function loadFixtureChecks({
  fixturePath = process.env.PERSONAL_RUNS_FIXTURE,
  readFileImpl = readFileSync,
} = {}) {
  if (!fixturePath) return null;
  return JSON.parse(readFileImpl(fixturePath, 'utf8')).checks;
}

async function main() {
  const now = process.env.RUN_RECENCY_NOW
    ? Date.parse(process.env.RUN_RECENCY_NOW)
    : Date.now();
  const fixtureChecks = loadFixtureChecks();
  if (fixtureChecks) {
    const checks = fixtureChecks;
    const result = evaluateSuccessfulRunRecency(checks, now);
    console.log(JSON.stringify(result));
    if (!result.ok) process.exitCode = 1;
    return;
  }
  const { checks, source, depth } = await loadImmutableDeployChecks({ now });
  const result = {
    ...evaluateSuccessfulRunRecency(checks, now),
    source,
    depth,
  };
  console.log(JSON.stringify(result));
  if (!result.ok) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
