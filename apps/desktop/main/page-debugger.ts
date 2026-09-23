import type { WebContents } from "electron";

/**
 * One in-process debugger session per page, shared by every document-start
 * helper (tab marker, nav gestures, credential detection, cosmetic filter):
 * one attach, one Page.enable/Runtime.enable, one `message` listener that
 * dispatches `Runtime.bindingCalled` by binding name.
 *
 * Both enables are load-bearing — measured on Electron 43: without Page.enable
 * `addScriptToEvaluateOnNewDocument` never runs, and without Runtime.enable no
 * `bindingCalled` is delivered. The session stays attached so other callers
 * can still `sendCommand` on `wc.debugger`.
 */

export type BindingHandler = (payload: string, executionContextId?: number) => void;

interface PageSession { bindings: Map<string, BindingHandler>; enabled: Promise<void> }
const sessions = new WeakMap<WebContents, PageSession>();

function session(wc: WebContents): PageSession | undefined {
  const existing = sessions.get(wc);
  if (existing) return existing;
  if (wc.isDestroyed()) return undefined;
  try { if (!wc.debugger.isAttached()) wc.debugger.attach("1.3"); } catch { return undefined; }
  const bindings = new Map<string, BindingHandler>();
  wc.debugger.on("message", (_event, method, params?: { name?: string; payload?: string; executionContextId?: number }) => {
    if (method !== "Runtime.bindingCalled" || !params?.name) return;
    bindings.get(params.name)?.(params.payload ?? "", params.executionContextId);
  });
  const enabled = Promise.all([wc.debugger.sendCommand("Page.enable"), wc.debugger.sendCommand("Runtime.enable")]).then(() => {});
  enabled.catch(() => {});
  const created = { bindings, enabled };
  sessions.set(wc, created);
  return created;
}

/** Evaluate `source` at the start of every new document (main world unless `worldName`). */
export function addDocumentScript(wc: WebContents, source: string, worldName?: string): Promise<boolean> {
  const page = session(wc);
  if (!page) return Promise.resolve(false);
  return page.enabled
    .then(() => wc.debugger.sendCommand("Page.addScriptToEvaluateOnNewDocument", { source, ...(worldName ? { worldName } : {}) }))
    .then(() => true, () => false);
}

/** Register `name` as a CDP binding routed to `handler`, then install its document-start script. */
export function addDocumentBinding(wc: WebContents, name: string, handler: BindingHandler, script: { source: string; worldName: string }): Promise<boolean> {
  const page = session(wc);
  if (!page) return Promise.resolve(false);
  page.bindings.set(name, handler);
  return page.enabled
    // Scoped to the helper's isolated world: page scripts cannot see or forge the binding.
    .then(() => wc.debugger.sendCommand("Runtime.addBinding", { name, executionContextName: script.worldName }))
    .then(() => wc.debugger.sendCommand("Page.addScriptToEvaluateOnNewDocument", { source: script.source, worldName: script.worldName }))
    .then(() => true, () => false);
}
