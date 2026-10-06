/** Shared browser zoom stops. Levels use Chromium's logarithmic 1.2 scale. */
export const PAGE_ZOOM_PERCENTAGES = [
  25, 33, 50, 67, 75, 90, 100, 110, 125, 150, 175, 200, 250, 300, 400, 500,
] as const;
export type PageZoomDirection = "in" | "out";
export function steppedZoomLevel(level: number, direction: PageZoomDirection): number {
  const percentage = Math.round(100 * 1.2 ** level);
  const next =
    direction === "in"
      ? (PAGE_ZOOM_PERCENTAGES.find((step) => step > percentage) ?? 500)
      : (PAGE_ZOOM_PERCENTAGES.findLast((step) => step < percentage) ?? 25);
  return Math.log(next / 100) / Math.log(1.2);
}
