/** Shared shell/native geometry leaves a real, interactive gutter between pages. */
export const SPLIT_GUTTER = 8;
export function splitRatio(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? Math.max(0.25, Math.min(0.75, value)) : 0.5;
}
export function splitWidths(width: number, ratio: unknown) {
  const total = Math.max(0, Math.floor(Number.isFinite(width) ? width : 0));
  const gutter = Math.min(SPLIT_GUTTER, total);
  const available = total - gutter;
  const minimum = Math.min(160, Math.floor(available / 2));
  const left = Math.max(minimum, Math.min(available - minimum, Math.round(available * splitRatio(ratio))));
  return { left, gutter, right: available - left };
}
