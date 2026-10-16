const relative = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

export function relativeChatTime(updatedAt: number, now = Date.now()): string {
  const seconds = Math.max(0, (now - updatedAt) / 1000);
  if (seconds < 60) return "Just now";
  for (const [unit, size] of [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ] as const) {
    if (seconds >= size) return relative.format(-Math.floor(seconds / size), unit);
  }
  return "Just now";
}
