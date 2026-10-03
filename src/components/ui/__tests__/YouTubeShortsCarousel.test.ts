import { describe, expect, it } from 'vitest';
import { normalizeLoopPosition } from '../../../lib/carouselLoop';

describe('normalizeLoopPosition', () => {
  const halfWidth = 1440;
  const pitch = 288;

  it('preserves previous-card overshoot from the zero boundary', () => {
    expect(normalizeLoopPosition(pitch, halfWidth)).toBe(-1152);
  });

  it('preserves next-card overshoot from the negative-half boundary', () => {
    expect(normalizeLoopPosition(-halfWidth - pitch, halfWidth)).toBe(-288);
  });

  it('keeps exact boundary positions within the duplicated loop', () => {
    expect(normalizeLoopPosition(0, halfWidth)).toBe(0);
    expect(normalizeLoopPosition(-halfWidth, halfWidth)).toBe(0);
  });
});
