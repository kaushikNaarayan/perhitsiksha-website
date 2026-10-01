import { expect, test } from '@playwright/test';

test('deliberate CI harness negative control', () => {
  expect('the harness must preserve this failure').toBe('a passing assertion');
});
