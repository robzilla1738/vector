/**
 * WebDriver BiDi adapter (VEC-020).
 *
 * Tool schemas, descriptions, and outputs are untrusted. Page-declared tools
 * cannot bypass user authorization. Draft WebMCP stays behind a flag.
 */
export type BidiCommand =
  | { method: "session.new"; params?: Record<string, unknown> }
  | { method: "browsingContext.navigate"; params: { context: string; url: string } }
  | { method: "session.status"; params?: Record<string, unknown> }
  | { method: "browsingContext.create"; params?: { type?: string } }
  | { method: "browsingContext.close"; params: { context: string } }
  | { method: "browsingContext.getTree"; params?: { root?: string } }
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

export interface BidiHandler {
  navigate?: (context: string, url: string) => { url: string; pageId?: string };
  performActions?: (actions: unknown[]) => { accepted: boolean };
}

const sessions = new Map<string, BidiSession & { contexts: Map<string, { url: string; pageId?: string }> }>();
let handler: BidiHandler | undefined;

/** Attach the live page runtime. Without this, navigate is recorded but not executed. */
export function attachBidiRuntime(next?: BidiHandler): void {
  handler = next;
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
  if (cmd.method === "session.new") {
    const session = negotiate({
      bidi: true,
      webmcp: Boolean(cmd.params?.webmcp),
    });
    sessions.set(session.id, { ...session, contexts: new Map() });
    return { ok: true, untrusted: true, value: session };
  }
  if (cmd.method === "session.status") {
    return { ok: true, untrusted: true, value: { ready: true, message: "Vector BiDi" } };
  }
  if (cmd.method === "browsingContext.create") {
    const id = `ctx-${Date.now().toString(36)}`;
    for (const s of sessions.values()) {
      s.contexts.set(id, { url: "about:blank" });
    }
    return { ok: true, untrusted: true, value: { context: id } };
  }
  if (cmd.method === "browsingContext.close") {
    for (const s of sessions.values()) {
      s.contexts.delete(cmd.params.context);
    }
    return { ok: true, untrusted: true, value: { closed: cmd.params.context } };
  }
  if (cmd.method === "browsingContext.getTree") {
    const trees = [...sessions.values()].map((s) => ({
      context: s.id,
      children: [...s.contexts.entries()].map(([id, c]) => ({ context: id, url: c.url })),
    }));
    return { ok: true, untrusted: true, value: { contexts: trees } };
  }
  if (cmd.method === "browsingContext.navigate") {
    const url = cmd.params.url;
    if (handler?.navigate) {
      const executed = handler.navigate(cmd.params.context, url);
      return { ok: true, untrusted: true, value: { method: cmd.method, ...executed, executed: true } };
    }
    return {
      ok: true,
      untrusted: true,
      value: { method: cmd.method, url, executed: false, reason: "no browsing session attached" },
    };
  }
  if (cmd.method === "input.performActions") {
    if (handler?.performActions) {
      const executed = handler.performActions(cmd.params.actions);
      return { ok: true, untrusted: true, value: { method: cmd.method, ...executed, executed: true } };
    }
    return {
      ok: true,
      untrusted: true,
      value: { method: cmd.method, executed: false, reason: "no browsing session attached" },
    };
  }
  return { ok: true, untrusted: true, value: { method: (cmd as { method: string }).method, accepted: true } };
}
