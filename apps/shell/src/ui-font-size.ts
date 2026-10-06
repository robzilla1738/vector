/** Interface type scale. Changes `--ui-font-size` only; never `html` font-size. */
export const UI_FONT_SIZES = [12, 13, 14] as const;
export type UiFontSize = (typeof UI_FONT_SIZES)[number];
const KEY = "aux.ui.fontSize";

export function readUiFontSize(): UiFontSize {
  try {
    const value = Number(localStorage.getItem(KEY));
    if (value === 12 || value === 13 || value === 14) return value;
  } catch {
    /* Storage unavailable; keep the default 14px body. */
  }
  return 14;
}

export function applyUiFontSize(size: UiFontSize = readUiFontSize()): void {
  document.documentElement.style.setProperty("--ui-font-size", `${size}px`);
}

export function writeUiFontSize(size: UiFontSize): void {
  try {
    localStorage.setItem(KEY, String(size));
  } catch {
    /* Preference stays in this session. */
  }
  applyUiFontSize(size);
}
