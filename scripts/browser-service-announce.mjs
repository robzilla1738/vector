/**
 * Parse `ve-shell --gui --service` / `--service` stdout for the shared
 * page-authority bind address (Gate B).
 */
export function parseBrowserServiceAnnouncement(line) {
  const text = String(line ?? "").trim();
  if (!text) return undefined;
  try {
    const v = JSON.parse(text);
    const addr = typeof v?.VECTOR_BROWSER_SERVICE === "string" ? v.VECTOR_BROWSER_SERVICE.trim() : "";
    return addr.length > 0 ? addr : undefined;
  } catch {
    return undefined;
  }
}

export function consumeBrowserServiceStdout(buf, chunk) {
  const next = `${buf}${chunk}`;
  const lines = next.split(/\r?\n/);
  const rest = lines.pop() ?? "";
  for (const line of lines) {
    const addr = parseBrowserServiceAnnouncement(line);
    if (addr) return { addr, rest: "" };
  }
  return { addr: undefined, rest };
}
