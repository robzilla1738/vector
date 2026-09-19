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
    const token = typeof v?.VECTOR_BROWSER_SERVICE_TOKEN === "string"
      ? v.VECTOR_BROWSER_SERVICE_TOKEN.trim()
      : "";
    return addr.length > 0 && token.length > 0 ? { addr, token } : undefined;
  } catch {
    return undefined;
  }
}

export function consumeBrowserServiceStdout(buf, chunk) {
  const next = `${buf}${chunk}`;
  const lines = next.split(/\r?\n/);
  const rest = lines.pop() ?? "";
  for (const line of lines) {
    const service = parseBrowserServiceAnnouncement(line);
    if (service) return { ...service, rest: "" };
  }
  return { addr: undefined, token: undefined, rest };
}
