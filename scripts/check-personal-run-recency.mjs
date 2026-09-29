import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const PERSONAL_REPOSITORY = 'kaushikNaarayan/perhitsiksha-website';
const MAX_SUCCESS_AGE_MS = 48 * 60 * 60 * 1000;
const MAX_API_ATTEMPTS = 3;

function evaluateSuccessfulRunRecency(workflowRuns, now = Date.now()) {
  const successfulRuns = workflowRuns
    .filter(
      run => run.conclusion === 'success' && (run.updated_at || run.created_at)
    )
    .map(run => ({
      ...run,
      successfulAt: run.updated_at || run.created_at,
      completedAt: new Date(run.updated_at || run.created_at).getTime(),
    }))
    .filter(run => Number.isFinite(run.completedAt))
    .sort((a, b) => b.completedAt - a.completedAt);

  const latest = successfulRuns[0];
  if (!latest) {
    return {
      ok: false,
      reason: 'No successful personal-repository workflow run exists.',
    };
  }

  const ageMs = now - latest.completedAt;
  return {
    ok: ageMs <= MAX_SUCCESS_AGE_MS,
    ageMs,
    latestSuccessAt: latest.successfulAt,
    latestRunUrl: latest.html_url,
    reason:
      ageMs <= MAX_SUCCESS_AGE_MS
        ? 'Latest successful personal-repository run is fresh.'
        : 'Latest successful personal-repository run is older than 48 hours.',
  };
}

function cacheBustForAttempt(attempt, now = Date.now()) {
  return `${now}-${attempt}-${Math.random().toString(36).slice(2)}`;
}

async function loadWorkflowRuns({
  now = Date.now(),
  fetchImpl = fetch,
  cacheBustFactory = cacheBustForAttempt,
} = {}) {
  if (process.env.PERSONAL_RUNS_FIXTURE) {
    return {
      workflowRuns: JSON.parse(
        readFileSync(process.env.PERSONAL_RUNS_FIXTURE, 'utf8')
      ).workflow_runs,
      attemptCount: 0,
    };
  }

  let lastStaleRuns;
  let lastError;
  for (let attempt = 1; attempt <= MAX_API_ATTEMPTS; attempt += 1) {
    const cacheBust = encodeURIComponent(cacheBustFactory(attempt, now));
    try {
      const response = await fetchImpl(
        `https://api.github.com/repos/${PERSONAL_REPOSITORY}/actions/runs?status=success&per_page=20&cache_bust=${cacheBust}`,
        {
          headers: {
            Accept: 'application/vnd.github+json',
            'Cache-Control': 'no-cache, no-store',
            Pragma: 'no-cache',
            'User-Agent': 'perhitsiksha-run-recency-detector',
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );
      if (!response.ok) {
        throw new Error(`GitHub Actions API returned ${response.status}.`);
      }

      const workflowRuns = (await response.json()).workflow_runs;
      if (evaluateSuccessfulRunRecency(workflowRuns, now).ok) {
        return { workflowRuns, attemptCount: attempt };
      }
      lastStaleRuns = workflowRuns;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastStaleRuns) {
    return { workflowRuns: lastStaleRuns, attemptCount: MAX_API_ATTEMPTS };
  }
  throw lastError ?? new Error('GitHub Actions API returned no usable response.');
}

async function main() {
  const now = process.env.RUN_RECENCY_NOW
    ? new Date(process.env.RUN_RECENCY_NOW).getTime()
    : Date.now();
  if (!Number.isFinite(now)) {
    throw new Error('RUN_RECENCY_NOW must be a valid ISO timestamp.');
  }

  const { workflowRuns, attemptCount } = await loadWorkflowRuns({ now });
  const result = {
    ...evaluateSuccessfulRunRecency(workflowRuns, now),
    attemptCount,
  };
  console.log(JSON.stringify(result));
  if (!result.ok) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
  });
}

export {
  MAX_API_ATTEMPTS,
  MAX_SUCCESS_AGE_MS,
  evaluateSuccessfulRunRecency,
  loadWorkflowRuns,
};
