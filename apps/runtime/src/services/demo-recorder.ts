import { randomUUID } from "node:crypto";
import { AuxError, DemonstrationSchema, DemonstrationStepSchema, type Demonstration } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

export interface RecorderObserver {
  send(method: string, params?: Record<string, unknown>): Promise<Record<string, unknown>>;
  on(event: string, listener: (params: Record<string, unknown>) => void): () => void;
  close(): Promise<void>;
}
export interface RecorderPage {
  attached: boolean;
  ownedByRuntime: boolean;
  sessionId?: string;
  url: string;
  controller?: string;
}

function safeCaptureUrl(raw: string): boolean {
  try {
    const url = new URL(raw);
    return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password
      && ![...url.searchParams.keys()].some(key => /password|passwd|token|secret|credential|api.?key|authorization|session|otp|code/i.test(key))
      && !/(?:password|token|secret|credential|api.?key|authorization|session|otp|code)=/i.test(url.hash);
  } catch { return false; }
}

/** Runs only in an isolated world. Secret controls are classified before value access. */
export const RECORDER_SOURCE = String.raw`(() => {
  if (globalThis.__auxRecorderInstalled) return;
  globalThis.__auxRecorderInstalled = true;
  const sensitive = el => {
    const tokens=(el.autocomplete || '').toLowerCase().split(/\s+/);
    if(tokens.includes('new-password')) return 'sensitive';
    if(el.type === 'password') return 'password';
    if(tokens.some(token=>token.startsWith('cc-'))) return 'payment';
    if(tokens.includes('one-time-code')) return 'otp';
    return /password|passphrase|secret|token|cvv|cvc|ssn/i.test([el.name,el.id,el.getAttribute('aria-label')].join(' ')) ? 'sensitive' : null;
  };
  const label = el => (el.labels?.[0]?.textContent || el.getAttribute('aria-label') || el.name || el.id || '').trim().slice(0,200);
  const target = el => {
    const candidates = [];
    const add = (selector,count) => { if (selector && selector.length <= 2000) candidates.push({selector,matches:count}); };
    if (el.id) add('css:#'+CSS.escape(el.id), document.querySelectorAll('#'+CSS.escape(el.id)).length);
    const testid = el.getAttribute('data-testid');
    if (testid) add('testid:'+testid, [...document.querySelectorAll('[data-testid]')].filter(x=>x.getAttribute('data-testid')===testid).length);
    if (el.name) add('name:'+el.name,[...document.querySelectorAll('[name]')].filter(x=>x.name===el.name).length);
    const name = (el.labels?.[0]?.textContent || el.getAttribute('aria-label') || '').trim().slice(0,200);
    if (name) add('label:'+name,[...document.querySelectorAll('input,textarea,select,button')].filter(x=>label(x)===name).length);
    const role = el.getAttribute('role') || ({BUTTON:'button',A:'link',INPUT:'textbox',TEXTAREA:'textbox'})[el.tagName];
    const text = (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0,200);
    if (text) add('text:'+text,[...document.querySelectorAll(el.tagName)].filter(x=>(x.textContent||'').trim()===text).length);
    if (role && text) add('role:'+role+'|'+text,[...document.querySelectorAll(el.tagName)].filter(x=>(x.getAttribute('aria-label')||x.textContent||'').trim()===text).length);
    return candidates.length ? {candidates:candidates.slice(0,12)} : null;
  };
  const listeners = [];
  globalThis.__auxRecorderStop = () => { for (const [event, listener] of listeners) document.removeEventListener(event, listener, true); globalThis.__auxRecorderInstalled = false; };
  let entered;
  for (const event of ['click','input','change','keydown']) { const listener=e=>{
    if (!e.isTrusted || !(e.target instanceof Element)) return;
    const el=e.target.closest('input,textarea,select,button,a,[role]') || e.target;
    if(event==='click' && e.detail===0 && entered && Date.now()-entered.at<300 && (entered.el===el || entered.form && entered.form===el.form)) return;
    const t=target(el); if (!t) return;
    let step;
    if (event==='input'||event==='change') { if(['checkbox','radio'].includes(el.type)) return; const secretType=sensitive(el); step=secretType?{kind:'credentialFill',secretType,target:t}:{kind:'input',control:el.tagName==='SELECT'?'select':'text',target:t,value:String(el.value||'').slice(0,4000),label:label(el)}; }
    else if(event==='keydown') { if(!['Enter','Tab','Escape'].includes(e.key))return; if(e.key==='Enter')entered={at:Date.now(),el,form:el.form}; step={kind:'key',target:t,key:e.key}; }
    else step={kind:event,target:t};
    globalThis.__auxRec(JSON.stringify(step));
  }; listeners.push([event,listener]); document.addEventListener(event,listener,true); }
})()`;

export class DemoRecorder {
  private closed = false;
  private starting = new Set<string>();
  private active = new Map<string, { demo: Demonstration; observer: RecorderObserver; sessionId: string; scriptId?: string; contextIds: Set<number>; cleanup: (() => void)[] }>();
  constructor(private readonly repo: Repo, private readonly page: (id: string) => RecorderPage,
    private readonly attach: (id: string) => Promise<RecorderObserver>, private readonly emit: (demo: Demonstration) => void,
    private readonly now: () => number = Date.now) {
    repo.db.exec("CREATE TABLE IF NOT EXISTS demonstrations(id TEXT PRIMARY KEY,page_id TEXT NOT NULL,state TEXT NOT NULL,payload TEXT NOT NULL,started_at INTEGER NOT NULL)");
  }
  private save(demo: Demonstration) {
    if (!this.repo.columnCipher) throw new AuxError("backend_unavailable", "Recording requires protected Profile storage.");
    const payload = this.repo.columnCipher.encrypt("demonstrations", JSON.stringify([demo.id]), "payload", JSON.stringify(demo));
    this.repo.db.prepare("INSERT INTO demonstrations VALUES(?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET state=excluded.state,payload=excluded.payload")
      .run(demo.id, demo.pageId, demo.state, payload, demo.startedAt);
    this.emit(DemonstrationSchema.parse(demo));
  }
  get(id: string): Demonstration {
    const row = this.repo.db.prepare("SELECT payload FROM demonstrations WHERE id=?").get(id) as { payload: string } | undefined;
    if (!row || !this.repo.columnCipher) throw new AuxError("not_found", "Recording is unavailable.");
    return DemonstrationSchema.parse(JSON.parse(this.repo.columnCipher.decrypt("demonstrations", JSON.stringify([id]), "payload", row.payload)));
  }
  async start(pageId: string) {
    if (this.closed) throw new AuxError("feature_unavailable", "Recording stopped in this Profile.");
    if (!this.repo.columnCipher) throw new AuxError("backend_unavailable", "Recording requires protected Profile storage.");
    const initial = this.page(pageId);
    if (!safeCaptureUrl(initial.url)) throw new AuxError("permission_denied", "Recording cannot include credentials or secret URL parameters.");
    if (!initial.attached || initial.ownedByRuntime || ["agent", "external"].includes(initial.controller ?? "") || !initial.sessionId || !/^https?:\/\//.test(initial.url))
      throw new AuxError("conflict", "Choose an attached browser tab to record.");
    if (this.starting.size || this.active.size) throw new AuxError("conflict", "This tab is already recording.");
    this.starting.add(pageId);
    let observer: RecorderObserver;
    try { observer = await this.attach(pageId); }
    catch (error) { this.starting.delete(pageId); throw error; }
    const demo: Demonstration = { id: randomUUID(), pageId, state: "recording", steps: [{ kind: "navigate", url: initial.url }], startedAt: this.now() };
    const item = { demo, observer, sessionId: initial.sessionId, scriptId: undefined as string | undefined, contextIds: new Set<number>(), cleanup: [] as (() => void)[] };
    const current = () => {
      try { const page = this.page(pageId); return !this.closed && page.attached && page.sessionId === item.sessionId && !page.ownedByRuntime && !["agent", "external"].includes(page.controller ?? ""); }
      catch { return false; }
    };
    let armed = false;
    const append = (raw: unknown) => {
      if (!armed || !current() || demo.state !== "recording") return;
      const parsed = DemonstrationStepSchema.safeParse(raw);
      if (!parsed.success) return;
      if (parsed.data.kind === "navigate") {
        if (!safeCaptureUrl(parsed.data.url)) { void this.control(demo.id, "stopped"); return; }
      }
      const last = demo.steps.at(-1);
      if ((parsed.data.kind === "input" || parsed.data.kind === "credentialFill") && last?.kind === parsed.data.kind
        && "target" in last && JSON.stringify(last.target) === JSON.stringify(parsed.data.target)) demo.steps[demo.steps.length - 1] = parsed.data;
      else {
        if (demo.steps.length === 49) { void this.control(demo.id, "stopped"); return; }
        demo.steps.push(parsed.data);
      }
      this.save(demo);
    };
    try {
      let mainFrameId: string | undefined;
      const contexts = new Map<number, string>();
      item.cleanup.push(observer.on("Runtime.executionContextCreated", params => {
        const context = params.context as { id?: number; name?: string; auxData?: { frameId?: string } } | undefined;
        if (context?.name === "aux-recorder" && typeof context.id === "number" && context.auxData?.frameId) {
          contexts.set(context.id, context.auxData.frameId);
          if (context.auxData.frameId === mainFrameId) item.contextIds.add(context.id);
        }
      }));
      item.cleanup.push(observer.on("Runtime.executionContextDestroyed", params => {
        if (typeof params.executionContextId === "number") { contexts.delete(params.executionContextId); item.contextIds.delete(params.executionContextId); }
      }));
      item.cleanup.push(observer.on("Runtime.bindingCalled", params => {
        if (typeof params.executionContextId !== "number" || !item.contextIds.has(params.executionContextId)) return;
        if (params.name !== "__auxRec" || typeof params.payload !== "string" || params.payload.length > 16000) return;
        try { append(JSON.parse(params.payload)); } catch { /* Invalid messages never reach protected storage. */ }
      }));
      item.cleanup.push(observer.on("Page.frameNavigated", params => {
        const frame = params.frame as { parentId?: string; url?: string } | undefined;
        if (!frame?.parentId && frame?.url && /^https?:\/\//.test(frame.url)) append({ kind: "navigate", url: frame.url });
      }));
      await observer.send("Runtime.enable"); await observer.send("Page.enable");
      await observer.send("Runtime.addBinding", { name: "__auxRec", executionContextName: "aux-recorder" });
      const script = await observer.send("Page.addScriptToEvaluateOnNewDocument", { source: RECORDER_SOURCE, worldName: "aux-recorder", runImmediately: true });
      item.scriptId = typeof script.identifier === "string" ? script.identifier : undefined;
      const tree = await observer.send("Page.getFrameTree");
      const frameId = (tree.frameTree as { frame?: { id?: string } } | undefined)?.frame?.id;
      if (!frameId || !current()) throw new AuxError("target_detached", "This tab changed while recording started.");
      mainFrameId = frameId;
      for (const [id, contextFrameId] of contexts) if (contextFrameId === frameId) item.contextIds.add(id);
      const world = await observer.send("Page.createIsolatedWorld", { frameId, worldName: "aux-recorder" });
      if (typeof world.executionContextId !== "number") throw new AuxError("backend_unavailable", "The recording world could not be created.");
      item.contextIds.add(world.executionContextId);
      await observer.send("Runtime.evaluate", { expression: RECORDER_SOURCE, contextId: world.executionContextId });
      this.active.set(demo.id, item); armed = true; this.save(demo); return demo;
    } catch (error) {
      for (const cleanup of item.cleanup) cleanup();
      for (const contextId of item.contextIds) await observer.send("Runtime.evaluate", { expression: "globalThis.__auxRecorderStop?.()", contextId }).catch(() => {});
      if (item.scriptId) await observer.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: item.scriptId }).catch(() => {});
      await observer.send("Runtime.removeBinding", { name: "__auxRec" }).catch(() => {});
      await observer.close(); throw error;
    }
    finally { this.starting.delete(pageId); }
  }
  async control(id: string, state: "paused" | "recording" | "stopped") {
    const item = this.active.get(id);
    if (!item || item.demo.state === "stopped") throw new AuxError("conflict", "Recording is no longer active.");
    if (state === "recording" && item.demo.state !== "paused") throw new AuxError("conflict", "Only paused recordings can resume.");
    item.demo.state = state; this.save(item.demo);
    if (state === "stopped") await this.detach(id);
    return this.get(id);
  }
  private async detach(id: string) {
    const item = this.active.get(id); if (!item) return;
    this.active.delete(id); for (const cleanup of item.cleanup) cleanup();
    try {
      for (const contextId of item.contextIds) await item.observer.send("Runtime.evaluate", { expression: "globalThis.__auxRecorderStop?.()", contextId }).catch(() => {});
      await item.observer.send("Runtime.removeBinding", { name: "__auxRec" }).catch(() => {});
      if (item.scriptId) await item.observer.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: item.scriptId });
    }
    finally { await item.observer.close(); }
  }
  async discard(id: string) { this.get(id); await this.detach(id); this.repo.db.prepare("DELETE FROM demonstrations WHERE id=?").run(id); return { ok: true as const }; }
  async close() { this.closed = true; for (const id of this.active.keys()) await this.control(id, "stopped"); }
}
