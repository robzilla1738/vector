import { steppedZoomLevel, type PageZoomDirection } from "@vector/contracts";
import type { WebContents } from "electron";

const MIN_LEVEL = Math.log(0.25) / Math.log(1.2);
const MAX_LEVEL = Math.log(5) / Math.log(1.2);

/** Identical limits and absolute/relative semantics in regular and private pages. */
export function setPageZoom(contents: Pick<WebContents, "getZoomLevel" | "setZoomLevel" | "isDestroyed">, options: { level?: number; delta?: number; reset?: boolean; direction?: PageZoomDirection }) {
  if (contents.isDestroyed()) throw new Error("This tab is no longer available.");
  if (options.level !== undefined && !Number.isFinite(options.level) || options.delta !== undefined && !Number.isFinite(options.delta)) throw new Error("Invalid page zoom.");
  const current = contents.getZoomLevel();
  const next = options.reset ? 0 : options.direction ? steppedZoomLevel(current, options.direction) : options.level ?? (options.delta === undefined ? current : current + options.delta);
  if (options.direction || options.reset || options.level !== undefined || options.delta !== undefined) contents.setZoomLevel(Math.max(MIN_LEVEL, Math.min(MAX_LEVEL, next)));
  return { level: contents.getZoomLevel() };
}
