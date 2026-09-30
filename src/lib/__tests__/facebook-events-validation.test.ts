import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const projectRoot = process.cwd();
const blockedEventId = '103024869002738-936085909054447';
const blockedImage = '103024869002738-936085909054447-936093189053719.jpg';

const safeEvent = {
  id: 'safe-event',
  title: 'Safe event',
  description: 'A safe text event.',
  date: 'Sep 30, 2026',
  mediaType: 'text',
  ctaText: 'View on Facebook',
  ctaLink: 'https://example.test/event',
};

function validateFixture(events: object[]) {
  const fixturePath = join(
    mkdtempSync(join(tmpdir(), 'facebook-events-')),
    'events.json'
  );
  writeFileSync(fixturePath, JSON.stringify(events));
  return spawnSync('npm', ['run', 'validate:events'], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: { ...process.env, EVENTS_DATA_FILE: fixturePath },
  });
}

describe('Facebook events validation and workflow PII routing', () => {
  it('keeps safe, ordinary-invalid, and denylisted event exits distinct', () => {
    const safe = validateFixture([safeEvent]);
    expect(safe.status).toBe(0);
    expect(safe.stdout).toContain('All validations passed');

    const ordinaryInvalid = validateFixture([
      { ...safeEvent, id: 'ordinary-invalid', mediaType: 'image' },
    ]);
    expect(ordinaryInvalid.status).toBe(1);
    expect(ordinaryInvalid.stdout).toContain('PII denylist check passed');
    expect(ordinaryInvalid.stderr).not.toContain('PII DENYLIST VIOLATION');

    const denylistedId = validateFixture([
      { ...safeEvent, id: blockedEventId },
    ]);
    expect(denylistedId.status).toBe(2);
    expect(denylistedId.stderr).toContain('PII DENYLIST VIOLATION');

    const denylistedImage = validateFixture([
      {
        ...safeEvent,
        id: 'blocked-image',
        image: `/fb-events/${blockedImage}`,
      },
    ]);
    expect(denylistedImage.status).toBe(2);
    expect(denylistedImage.stderr).toContain(blockedImage);
  });

  it('retains the PII exit for malformed denylisted data', () => {
    const result = validateFixture([
      // This invalid media element makes the later consistency validator
      // throw. The PII result found first must still determine the exit code.
      { ...safeEvent, id: blockedEventId, title: '', media: [null] },
    ]);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain('PII DENYLIST VIOLATION');
    expect(result.stderr).toContain('Structure validation failed');
  });

  it('keeps the workflow discriminator and routes both failures explicitly', () => {
    const workflow = readFileSync(
      join(projectRoot, '.github/workflows/sync-facebook-events.yml'),
      'utf8'
    );

    const validateStep = workflow.match(
      /- name: Validate events data([\s\S]*?)(?=\n\s{6}- name: Detect PII denylist trip)/
    )?.[1];
    const piiStep = workflow.match(
      /- name: Detect PII denylist trip([\s\S]*?)(?=\n\s{6}- name: Check for changes)/
    )?.[1];
    const piiAlertAndFail = workflow.match(
      /- name: Alert on PII denylist trip([\s\S]*?)- name: Fail job on PII denylist trip([\s\S]*?)(?=\n\s{6}- name: Create issue on failure)/
    );
    const ordinaryFailureStep = workflow.match(
      /- name: Create issue on failure([\s\S]*?)(?=\n\s{6}- name: Report success)/
    )?.[1];

    expect(workflow).toContain('runs-on: [self-hosted, gt2]');
    expect(validateStep).toContain('continue-on-error: true');
    expect(validateStep).toContain('echo "exit_code=$rc" >> "$GITHUB_OUTPUT"');
    expect(piiStep).toContain('steps.validate.outputs.exit_code }}" = "2"');
    expect(piiAlertAndFail?.[1]).toContain(
      "if: steps.pii-check.outputs.is_pii_trip == 'true'"
    );
    expect(piiAlertAndFail?.[2]).toContain(
      "if: steps.pii-check.outputs.is_pii_trip == 'true'"
    );
    expect(ordinaryFailureStep).toContain(
      "if: steps.validate.outcome == 'failure' && steps.pii-check.outputs.is_pii_trip != 'true'"
    );
    expect(ordinaryFailureStep).not.toContain('failure()');
  });
});
