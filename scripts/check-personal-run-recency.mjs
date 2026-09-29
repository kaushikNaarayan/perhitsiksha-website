import { readFileSync } from 'node:fs';

const PERSONAL_REPOSITORY = 'kaushikNaarayan/perhitsiksha-website';
const MAX_SUCCESS_AGE_MS = 48 * 60 * 60 * 1000;

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

async function loadWorkflowRuns() {
  if (process.env.PERSONAL_RUNS_FIXTURE) {
    return JSON.parse(readFileSync(process.env.PERSONAL_RUNS_FIXTURE, 'utf8'))
      .workflow_runs;
  }

  const response = await fetch(
    `https://api.github.com/repos/${PERSONAL_REPOSITORY}/actions/runs?status=success&per_page=20`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'perhitsiksha-run-recency-detector',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );
  if (!response.ok) {
    throw new Error(`GitHub Actions API returned ${response.status}.`);
  }
  return (await response.json()).workflow_runs;
}

async function main() {
  const now = process.env.RUN_RECENCY_NOW
    ? new Date(process.env.RUN_RECENCY_NOW).getTime()
    : Date.now();
  if (!Number.isFinite(now)) {
    throw new Error('RUN_RECENCY_NOW must be a valid ISO timestamp.');
  }

  const result = evaluateSuccessfulRunRecency(await loadWorkflowRuns(), now);
  console.log(JSON.stringify(result));
  if (!result.ok) process.exitCode = 1;
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});

export { MAX_SUCCESS_AGE_MS, evaluateSuccessfulRunRecency };
