export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Keep a native page visible beside a shell menu by cutting the smallest edge that clears it. */
export function stageAvoiding(stage: Box, obstacles: Box[]): Box {
  let left = stage.x;
  let top = stage.y;
  let right = stage.x + stage.width;
  let bottom = stage.y + stage.height;
  for (const item of obstacles) {
    const itemRight = item.x + item.width;
    const itemBottom = item.y + item.height;
    if (Math.min(right, itemRight) <= Math.max(left, item.x)) continue;
    if (Math.min(bottom, itemBottom) <= Math.max(top, item.y)) continue;
    const cuts = [
      { area: Math.max(0, itemRight - left) * (bottom - top), apply: () => { left = Math.max(left, itemRight); } },
      { area: Math.max(0, right - item.x) * (bottom - top), apply: () => { right = Math.min(right, item.x); } },
      { area: Math.max(0, itemBottom - top) * (right - left), apply: () => { top = Math.max(top, itemBottom); } },
      { area: Math.max(0, bottom - item.y) * (right - left), apply: () => { bottom = Math.min(bottom, item.y); } },
    ].filter(cut => cut.area > 0);
    cuts.sort((a, b) => a.area - b.area);
    cuts[0]?.apply();
  }
  return { x: Math.round(left), y: Math.round(top), width: Math.max(1, Math.round(right - left)), height: Math.max(1, Math.round(bottom - top)) };
}

const reporters = new Set<() => void>();

export function requestStageReport() {
  for (const report of reporters) report();
}

export function onStageReport(report: () => void) {
  reporters.add(report);
  return () => reporters.delete(report);
}
