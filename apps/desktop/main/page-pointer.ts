export type PointerModifier = "shift" | "control" | "alt" | "meta" | "leftbuttondown" | "middlebuttondown" | "rightbuttondown";

export interface PagePointer {
  kind: "down" | "up" | "move" | "wheel";
  x: number;
  y: number;
  button: "left" | "middle" | "right";
  clickCount: number;
  deltaX: number;
  deltaY: number;
  modifiers: PointerModifier[];
}

export type PageInputEvent =
  | { type: "mouseDown" | "mouseUp" | "mouseMove"; x: number; y: number; button: PagePointer["button"]; clickCount: number; modifiers: PointerModifier[] }
  | { type: "mouseWheel"; x: number; y: number; button: PagePointer["button"]; deltaX: number; deltaY: number; hasPreciseScrollingDeltas: true; canScroll: true; modifiers: PointerModifier[] };

const PAGE_CHROME = ".toolbar, .sidebar, .rail, .menu, .cb-pop, .palette, .sheet, .drawer, .ctx-menu, .toast, .findbar, .reader-view, .settings-page, .tasks-page, .split-divider, .conversation, .site-controls-card, .library, .scrim-soft, .downloads";
const MODIFIERS = new Set<PointerModifier>(["shift", "control", "alt", "meta", "leftbuttondown", "middlebuttondown", "rightbuttondown"]);
const KINDS = new Set<PagePointer["kind"]>(["down", "up", "move", "wheel"]);
const CURSORS = new Set([
  "default", "pointer", "text", "wait", "crosshair", "progress", "not-allowed", "zoom-in", "zoom-out",
  "grab", "grabbing", "move", "ns-resize", "ew-resize", "nesw-resize", "nwse-resize", "col-resize",
  "row-resize", "all-scroll", "alias", "copy", "none", "cell", "vertical-text", "context-menu",
]);

function finite(value: unknown, limit: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || Math.abs(value) > limit) return null;
  return value;
}

/** Shell events are untrusted. Reject anything that is not a pointer over this window. */
export function readPagePointer(value: unknown): PagePointer | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.kind !== "string" || !KINDS.has(record.kind as PagePointer["kind"])) return null;
  const x = finite(record.x, 16000);
  const y = finite(record.y, 16000);
  if (x == null || y == null) return null;
  const button = record.button === "middle" || record.button === "right" ? record.button : "left";
  const clicks = finite(record.clickCount, 8);
  const deltaX = finite(record.deltaX, 8000) ?? 0;
  const deltaY = finite(record.deltaY, 8000) ?? 0;
  const modifiers = Array.isArray(record.modifiers)
    ? record.modifiers.filter((item): item is PointerModifier => typeof item === "string" && MODIFIERS.has(item as PointerModifier))
    : [];
  return {
    kind: record.kind as PagePointer["kind"],
    x, y, button,
    clickCount: clicks == null ? 1 : Math.max(0, Math.round(clicks)),
    deltaX, deltaY, modifiers,
  };
}

export function boundsContaining<T extends { x: number; y: number; width: number; height: number }>(x: number, y: number, items: readonly T[]): T | undefined {
  return items.find(item => x >= item.x && y >= item.y && x < item.x + item.width && y < item.y + item.height);
}

/** DOM wheel deltaY is positive when the page should move down. Chromium's input event is the opposite. */
export function chromiumWheelDelta(deltaX: number, deltaY: number): { deltaX: number; deltaY: number } {
  return { deltaX: -deltaX, deltaY: -deltaY };
}

export function inputEventFor(message: PagePointer, originX: number, originY: number): PageInputEvent | null {
  const x = Math.round(message.x - originX);
  const y = Math.round(message.y - originY);
  if (x < -40 || y < -40 || x > 20000 || y > 20000) return null;
  if (message.kind === "wheel") {
    const delta = chromiumWheelDelta(message.deltaX, message.deltaY);
    return { type: "mouseWheel", x, y, button: message.button, ...delta, hasPreciseScrollingDeltas: true, canScroll: true, modifiers: message.modifiers };
  }
  const type = message.kind === "down" ? "mouseDown" : message.kind === "up" ? "mouseUp" : "mouseMove";
  return { type, x, y, button: message.button, clickCount: message.clickCount || 1, modifiers: message.modifiers };
}

export function pointerHitsPage(target: { closest(selector: string): unknown } | null, insideStage: boolean): boolean {
  if (!insideStage) return false;
  if (!target) return true;
  return !target.closest(PAGE_CHROME);
}

export function cssCursor(type: string): string {
  if (type === "hand") return "pointer";
  if (type === "i-beam" || type === "ibeam") return "text";
  return CURSORS.has(type) ? type : "auto";
}
