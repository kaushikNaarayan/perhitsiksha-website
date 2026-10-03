export const normalizeLoopPosition = (position: number, halfWidth: number) => {
  if (halfWidth <= 0) return position;

  let normalized = position;
  while (normalized <= -halfWidth) normalized += halfWidth;
  while (normalized > 0) normalized -= halfWidth;
  return normalized;
};
