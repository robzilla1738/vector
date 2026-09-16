/**
 * WebDriver BiDi adapter (VEC-020).
 *
 * Tool schemas, descriptions, and outputs are untrusted. Page-declared tools
 * cannot bypass user authorization. Draft WebMCP stays behind a flag.
 */
export type BidiCommand =
  | { method: "session.new"; params?: Record<string, unknown> }
  | { method: "browsingContext.navigate"; params: { context: string; url: string } }
  | { method: "script.evaluate"; params: { expression: string } }
  | { method: "input.performActions"; params: { actions: unknown[] } };

export interface BidiResult {
  ok: boolean;
  untrusted: true;
  value?: unknown;
  error?: string;
}

export interface BidiSession {
  id: string;
  protocol: "webdriver-bidi";
  webmcp: boolean;
}

export function negotiate(opts: { webmcp?: boolean; bidi?: boolean }): BidiSession {
  return {
    id: `bidi-${Date.now().toString(36)}`,
    protocol: "webdriver-bidi",
    webmcp: Boolean(opts.webmcp),
  };
}

export function authorizePageTool(name: string, userGranted: readonly string[]): boolean {
  return userGranted.includes(name);
}

export function dispatch(cmd: BidiCommand, authorize: (c: BidiCommand) => boolean): BidiResult {
  if (!authorize(cmd)) {
    return { ok: false, untrusted: true, error: "user authorization required" };
  }
  if (cmd.method === "script.evaluate") {
    return { ok: false, untrusted: true, error: "evaluate is not exposed through BiDi without allowEval" };
  }
  return { ok: true, untrusted: true, value: { method: cmd.method, accepted: true } };
}
