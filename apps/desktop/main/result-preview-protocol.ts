import { protocol, session } from "electron";
import { randomBytes } from "node:crypto";

const SCHEME = "aux-result";
const CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; media-src 'none'; frame-src 'none'; object-src 'none'; form-action 'none'; base-uri 'none'";
const previews = new Map<string, { html: string; owner: number; expiresAt: number }>();

/** Must run before app.ready; grants no storage, service-worker or CSP bypass privilege. */
export function registerResultPreviewScheme(): void {
  protocol.registerSchemesAsPrivileged([{ scheme: SCHEME, privileges: { standard: true, secure: true } }]);
}

export function wireResultPreviewProtocol(): void {
  session.defaultSession.protocol.handle(SCHEME, request => {
    let token: string;
    try {
      const url = new URL(request.url);
      if (url.host !== "preview" || !/^\/[a-f0-9]{48}$/.test(url.pathname) || request.method !== "GET") throw new Error();
      token = url.pathname.slice(1);
    } catch { return new Response("Not found", { status: 404 }); }
    const value = previews.get(token);
    if (!value || value.expiresAt < Date.now()) { previews.delete(token); return new Response("Not found", { status: 404 }); }
    return new Response(value.html, { status: 200, headers: {
      "Content-Type": "text/html; charset=utf-8", "Content-Security-Policy": CSP,
      "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer",
      "Permissions-Policy": "camera=(), microphone=(), geolocation=(), display-capture=()",
    } });
  });
}

export function createResultPreview(owner: number, html: string): string {
  if (typeof html !== "string" || !html || html.includes("\0") || Buffer.byteLength(html, "utf8") > 256 * 1024)
    throw new Error("HTML preview must contain text up to 256 KB.");
  for (const [token, value] of previews) if (value.expiresAt < Date.now()) previews.delete(token);
  if (previews.size >= 32) throw new Error("Close an existing HTML preview before opening another.");
  const token = randomBytes(24).toString("hex");
  previews.set(token, { html, owner, expiresAt: Date.now() + 10 * 60_000 });
  return `${SCHEME}://preview/${token}`;
}

export function releaseResultPreview(owner: number, url: string): void {
  let token: string;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== `${SCHEME}:` || parsed.host !== "preview") return;
    token = parsed.pathname.slice(1);
  } catch { return; }
  if (previews.get(token)?.owner === owner) previews.delete(token);
}

export function releaseWindowPreviews(owner: number): void {
  for (const [token, value] of previews) if (value.owner === owner) previews.delete(token);
}
