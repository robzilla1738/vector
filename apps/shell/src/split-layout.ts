import type { SplitGroup } from "@aux/contracts";

export const SPLIT_INSET = 8;
export const SPLIT_GUTTER = 8;
export const SPLIT_RADIUS = 6;
export const SPLIT_HEADER = 24;
export const SPLIT_SNAP = 15;
export const SPLIT_SPRING = { stiffness: 400, damping: 34 } as const;
export interface Box { x: number; y: number; width: number; height: number }
export interface Divider extends Box { index: number; axis: "x" | "y"; origin: number; available: number; minimum: number; ratio: number }

/** A binary cut gives N panes exactly N−1 independent dividers. */
export function paneRects(box: Box, group: SplitGroup, inset = SPLIT_INSET) {
  const bounds = { x: box.x + inset, y: box.y + inset, width: Math.max(0, box.width - inset * 2), height: Math.max(0, box.height - inset * 2) };
  const panes: Box[] = [], dividers: Divider[] = [];
  function cut(area: Box, axis: "x" | "y", index: number, firstCount = 1, secondCount = 1): [Box, Box] {
    const size = axis === "x" ? area.width : area.height;
    const gutter = Math.min(SPLIT_GUTTER, size), available = size - gutter;
    const minimum = Math.max(200, size * .1);
    const low = Math.min(minimum * firstCount + SPLIT_GUTTER * (firstCount - 1), available * firstCount / (firstCount + secondCount));
    const high = available - Math.min(minimum * secondCount + SPLIT_GUTTER * (secondCount - 1), available * secondCount / (firstCount + secondCount));
    const length = Math.max(low, Math.min(high, available * (group.ratios[index] ?? .5)));
    const first = { ...area, [axis === "x" ? "width" : "height"]: length };
    const second = { ...area, [axis]: area[axis] + length + gutter, [axis === "x" ? "width" : "height"]: available - length };
    dividers.push({ ...area, index, axis, [axis]: area[axis] + length, [axis === "x" ? "width" : "height"]: gutter,
      origin: area[axis], available, minimum, ratio: available ? length / available : .5 });
    return [first, second];
  }
  if (group.layout === "row" || group.layout === "column") panes.push(...cut(bounds, group.layout === "row" ? "x" : "y", 0));
  else if (group.layout === "columns") {
    const [first, rest] = cut(bounds, "x", 0, 1, 2); panes.push(first, ...cut(rest, "x", 1));
  } else if (group.layout === "one-plus-two") {
    const [first, rest] = cut(bounds, "x", 0); panes.push(first, ...cut(rest, "y", 1));
  } else {
    const [top, bottom] = cut(bounds, "y", 0); panes.push(...cut(top, "x", 1), ...cut(bottom, "x", 2));
  }
  return { panes, dividers };
}

export function dividerRatio(divider: Divider, coordinate: number) {
  if (!divider.available) return .5;
  const offset = coordinate - divider.origin - SPLIT_GUTTER / 2;
  return Math.abs(offset - divider.available / 2) <= SPLIT_SNAP ? .5 : Math.max(.1, Math.min(.9, offset / divider.available));
}

/** Critically close damped spring, integrated in seconds and capped after stalls. */
export function springStep(position: number, velocity: number, target: number, elapsed: number) {
  let remaining = Math.min(.064, Math.max(0, elapsed));
  while (remaining > 0) {
    const dt = Math.min(remaining, 1 / 240);
    velocity += (SPLIT_SPRING.stiffness * (target - position) - SPLIT_SPRING.damping * velocity) * dt;
    position += velocity * dt; remaining -= dt;
  }
  return { position, velocity };
}
