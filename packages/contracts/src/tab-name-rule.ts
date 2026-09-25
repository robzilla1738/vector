/** Keep the tab-label rule usable by the boot shell without loading Zod. */
export const TAB_NAME_MIN_LENGTH = 2;
export const TAB_NAME_MAX_LENGTH = 60;
export const TAB_NAME_PATTERN = /^[^\p{Cc}\p{Cf}]+$/u;

export function normalizeTabName(value: string): string | null {
  const name = value.trim();
  return name.length >= TAB_NAME_MIN_LENGTH &&
    name.length <= TAB_NAME_MAX_LENGTH &&
    TAB_NAME_PATTERN.test(name)
    ? name
    : null;
}
