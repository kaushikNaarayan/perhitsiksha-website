import { describe, expect, it } from 'vitest';
import { getVisiblePaginationIndices } from './eventsPagination';

describe('getVisiblePaginationIndices', () => {
  it('renders all event targets when they fit', () => {
    expect(getVisiblePaginationIndices(10, 4, 1128)).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('uses a seven-target, edge-clamped mobile window', () => {
    expect(getVisiblePaginationIndices(10, 0, 342)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
    expect(getVisiblePaginationIndices(10, 4, 342)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
    expect(getVisiblePaginationIndices(10, 9, 342)).toEqual([
      3, 4, 5, 6, 7, 8, 9,
    ]);
  });

  it('never renders a pagination control for fewer than two events', () => {
    expect(getVisiblePaginationIndices(0, 0, 342)).toEqual([]);
    expect(getVisiblePaginationIndices(1, 0, 342)).toEqual([]);
  });

  it('keeps exact target counts at the two, seven, and eight-event boundaries', () => {
    expect(getVisiblePaginationIndices(2, 0, 342)).toEqual([0, 1]);
    expect(getVisiblePaginationIndices(7, 3, 342)).toEqual([
      0, 1, 2, 3, 4, 5, 6,
    ]);
    expect(getVisiblePaginationIndices(8, 4, 342)).toEqual([
      1, 2, 3, 4, 5, 6, 7,
    ]);
  });

  it('caps crowded windows at nine and keeps a stable odd center', () => {
    expect(getVisiblePaginationIndices(20, 10, 400)).toEqual([
      7, 8, 9, 10, 11, 12, 13,
    ]);
  });
});
