const PAGINATION_TARGET_SIZE = 44;
const PAGINATION_RING_CLEARANCE = 8;
const MAX_PAGINATION_WINDOW = 9;

export const getVisiblePaginationIndices = (
  eventCount: number,
  currentIndex: number,
  paginationWidth: number
) => {
  if (eventCount < 2) return [];

  const capacity = Math.max(
    1,
    Math.floor(
      (paginationWidth - PAGINATION_RING_CLEARANCE) / PAGINATION_TARGET_SIZE
    )
  );
  const limitedCapacity = Math.min(capacity, MAX_PAGINATION_WINDOW);
  const windowSize =
    eventCount <= capacity
      ? eventCount
      : Math.max(
          1,
          limitedCapacity % 2 === 0 ? limitedCapacity - 1 : limitedCapacity
        );
  const start = Math.min(
    Math.max(currentIndex - Math.floor(windowSize / 2), 0),
    eventCount - windowSize
  );

  return Array.from({ length: windowSize }, (_, offset) => start + offset);
};
