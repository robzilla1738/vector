import type { CDPSession } from "playwright-core";
import { AuxError } from "@aux/contracts";
import { RECORDER_SOURCE } from "./recorder-script.js";
import type { RecorderObserver } from "./types.js";

/** Standalone Chromium transport for the same fixed recording producer. */
export class ScriptRecorderObserver implements RecorderObserver {
  private closed = false;
  private started = false;
  private armed = false;
  private scriptId?: string;
  private mainFrameId?: string;
  private contexts = new Map<number, string>();
  private listeners: Array<() => void> = [];
  private closing?: Promise<void>;
  private starting?: Promise<void>;
  constructor(private readonly session: CDPSession, private readonly current: () => boolean) {}

  private checkCurrent() {
    if (this.closed || !this.current()) throw new AuxError("target_detached", "The recording tab detached.");
  }
  private on(event: string, listener: (params: Record<string, unknown>) => void) {
    this.session.on(event as never, listener as never);
    this.listeners.push(() => this.session.off(event as never, listener as never));
  }
  async start(onStep: (step: unknown) => void) {
    this.checkCurrent();
    if (this.started) throw new AuxError("conflict", "Recording already started.");
    this.started = true;
    this.on("Runtime.executionContextCreated", params => {
      const context = params.context as { id?: number; name?: string; auxData?: { frameId?: string } } | undefined;
      if (context?.name === "aux-recorder" && typeof context.id === "number" && context.auxData?.frameId)
        this.contexts.set(context.id, context.auxData.frameId);
    });
    this.on("Runtime.executionContextsCleared", () => { this.contexts.clear(); });
    this.on("Runtime.executionContextDestroyed", params => {
      if (typeof params.executionContextId === "number") this.contexts.delete(params.executionContextId);
    });
    this.on("Runtime.bindingCalled", params => {
      if (!this.armed || this.closed || !this.current() || typeof params.executionContextId !== "number"
        || this.contexts.get(params.executionContextId) !== this.mainFrameId
        || params.name !== "__auxRec" || typeof params.payload !== "string" || params.payload.length > 16000) return;
      try { onStep(JSON.parse(params.payload)); } catch { /* Invalid capture never enters storage. */ }
    });
    this.on("Page.frameNavigated", params => {
      const frame = params.frame as { id?: string; parentId?: string; url?: string } | undefined;
      if (this.armed && !this.closed && this.current() && frame && frame.id === this.mainFrameId && !frame.parentId && frame.url)
        onStep({ kind: "navigate", url: frame.url });
    });
    this.starting = this.capture();
    try { await this.starting; }
    catch (error) {
      try { await this.close(); }
      catch (cleanup) { throw new AggregateError([error, cleanup], "Recording transport and cleanup failed."); }
      throw error;
    }
  }
  private async capture() {
      await this.session.send("Runtime.enable"); this.checkCurrent();
      await this.session.send("Page.enable"); this.checkCurrent();
      await this.session.send("Runtime.addBinding", { name: "__auxRec", executionContextName: "aux-recorder" }); this.checkCurrent();
      const script = await this.session.send("Page.addScriptToEvaluateOnNewDocument", { source: RECORDER_SOURCE, worldName: "aux-recorder", runImmediately: true });
      this.scriptId = script.identifier; this.checkCurrent();
      const tree = await this.session.send("Page.getFrameTree"); this.checkCurrent();
      this.mainFrameId = tree.frameTree.frame.id;
      const world = await this.session.send("Page.createIsolatedWorld", { frameId: this.mainFrameId, worldName: "aux-recorder" });
      this.contexts.set(world.executionContextId, this.mainFrameId); this.checkCurrent();
      await this.session.send("Runtime.evaluate", { expression: RECORDER_SOURCE, contextId: world.executionContextId });
      this.checkCurrent(); this.armed = true;
  }

  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true; this.armed = false;
    for (const off of this.listeners.splice(0)) off();
    this.closing = this.cleanup();
    return this.closing;
  }
  private async cleanup() {
    await this.starting?.catch(() => {});
    const errors: unknown[] = [];
    for (const [contextId, frameId] of this.contexts) {
      if (frameId === this.mainFrameId)
        await this.session.send("Runtime.evaluate", { expression: "globalThis.__auxRecorderStop?.()", contextId }).catch(() => {});
    }
    await this.session.send("Runtime.removeBinding", { name: "__auxRec" }).catch(() => {});
    try {
      if (this.scriptId) await this.session.send("Page.removeScriptToEvaluateOnNewDocument", { identifier: this.scriptId });
    } catch (error) { errors.push(error); }
    try { await this.session.detach(); }
    catch (error) { errors.push(error); }
    if (errors.length > 1) throw new AggregateError(errors, "Recording removal and detach failed.");
    if (errors.length === 1) throw errors[0];
  }
}
