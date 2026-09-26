import type { BrowserContext, CDPSession, Page } from "playwright-core";
import { collectObservation } from "./observe-script.js";

/**
 * The driver's isolated world. Observation, the live ref map, mutation
 * tracking and action targeting run here rather than in the page's world:
 * page scripts share the DOM but not these globals, so they cannot redirect
 * a ref, fake readiness, or detect the agent through patched builtins.
 *
 * Installed per top-level document with Page.addScriptToEvaluateOnNewDocument
 * and lazily into a document that predates the attach. Child frames keep the
 * main-world path (see PlaywrightDriverPage.observe) — OOPIFs would each need
 * their own session and world.
 */
export const AUX_WORLD = "aux";
const MISSING = "__aux_missing__";

/** Serialized into the world. Must stay self-contained. */
function installAuxWorld(collect: (args: unknown) => unknown) {
  const g = globalThis as any;
  if (g.__aux || g.top !== g) return;
  const st = { id: Math.random().toString(36).slice(2, 10), mutations: 0, last: null as number | null };
  // registered at DOMContentLoaded: nodes the parser inserts are present when
  // navigation returns, so only post-load activity has to go quiet
  const track = () => {
    const root = document.documentElement;
    if (!root) {
      setTimeout(track, 0);
      return;
    }
    new MutationObserver(() => {
      st.mutations++;
      st.last = performance.now();
    }).observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", track, { once: true });
  else track();

  const live = (ref: string): any => {
    const el = g.__auxStore?.refs.get(ref);
    return el && el.isConnected ? el : null;
  };
  const within = (hit: any, el: any) => {
    for (let n = hit; n; n = n.parentNode ?? n.host) if (n === el) return true;
    return false;
  };
  const disabled = (el: any) => !!(el.matches?.(":disabled") || el.closest?.("[aria-disabled=true]"));
  const centerIn = (r: any) => {
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    return x >= 0 && y >= 0 && x < innerWidth && y < innerHeight;
  };
  const frame = () =>
    new Promise<boolean>((r) => {
      let done = false;
      const fin = (real: boolean) => {
        if (!done) {
          done = true;
          r(real);
        }
      };
      try {
        requestAnimationFrame(() => fin(true));
      } catch {
        /* no rAF — timer below */
      }
      setTimeout(() => fin(false), 20);
    });
  const TEXT_INPUTS = ["", "text", "search", "email", "password", "tel", "url"];

  g.__aux = {
    collect: (args: unknown) => JSON.stringify(collect(args)),
    /**
     * Everything an observation depends on that the MutationObserver cannot
     * see: control values (not attributes), focus, scroll, viewport, URL.
     * The world id makes a fresh document never match an old fingerprint.
     */
    fingerprint: () => {
      const d = document;
      let values = "";
      const controls = d.querySelectorAll("input,textarea,select");
      for (let i = 0; i < controls.length && i < 400; i++) {
        const c = controls[i] as HTMLInputElement;
        values += c.type === "checkbox" || c.type === "radio" ? (c.checked ? "1" : "0") : `${c.value.length}:${c.value.slice(0, 32)}`;
        values += "|";
      }
      const a = d.activeElement;
      const focus = a ? `${a.tagName}#${a.id}.${String(a.className)}` : "";
      return [st.id, st.mutations, location.href, d.title, Math.round(scrollX), Math.round(scrollY), innerWidth, innerHeight, d.readyState, controls.length, values, focus].join("\u0001");
    },
    /** Two frames, then DOM mutation-free for `quietMs` — or false at the deadline. */
    settle: async (timeoutMs: number, quietMs: number) => {
      const deadline = performance.now() + timeoutMs;
      if (await frame()) await frame();
      for (;;) {
        const now = performance.now();
        if (st.last === null || now - st.last >= quietMs) return true;
        if (now >= deadline) return false;
        await new Promise((r) => setTimeout(r, Math.max(5, Math.min(25, deadline - now))));
      }
    },
    /** Viewport point that lands on the ref's element, scrolling it in if needed — or why not. */
    point: (ref: string): [number, number] | string => {
      const el = live(ref);
      if (!el) return "gone";
      if (disabled(el)) return "disabled";
      if (getComputedStyle(el).visibility !== "visible") return "hidden";
      let r = el.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return "hidden";
      if (!centerIn(r)) {
        el.scrollIntoView({ block: "center", inline: "center", behavior: "instant" });
        r = el.getBoundingClientRect();
        if (!centerIn(r)) return "offscreen";
      }
      const x = r.left + r.width / 2;
      const y = r.top + r.height / 2;
      let hit: any = document.elementFromPoint(x, y);
      while (hit?.shadowRoot) {
        const inner = hit.shadowRoot.elementFromPoint(x, y);
        if (!inner || inner === hit) break;
        hit = inner;
      }
      return hit && within(hit, el) ? [x, y] : "occluded";
    },
    /** Focus the ref's element; for fill also require a plain editable and select its content. */
    focus: (ref: string, fill: boolean): string => {
      const el = live(ref);
      if (!el) return "gone";
      if (fill) {
        if (disabled(el)) return "disabled";
        const tag = el.tagName;
        if (tag === "INPUT") {
          if (!TEXT_INPUTS.includes((el.getAttribute("type") || "").toLowerCase()) || el.readOnly) return "kind";
        } else if (tag === "TEXTAREA") {
          if (el.readOnly) return "kind";
        } else if (!el.isContentEditable) return "kind";
        const r = el.getBoundingClientRect();
        if (r.width <= 0 || r.height <= 0 || getComputedStyle(el).visibility !== "visible") return "hidden";
      }
      el.focus();
      if (!fill) return "ok";
      let active: any = document.activeElement;
      while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
      if (active !== el) return "focus";
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") el.select();
      else {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
      }
      return "ok";
    },
    /** A fresh css path for the ref's live node — the bridge to Playwright's locator path. */
    css: (ref: string): string | null => {
      const el = live(ref);
      return el && g.__auxStore.cssPath ? g.__auxStore.cssPath(el) : null;
    },
    /**
     * Before-state for setter steps (S4): value/checked/selected of the ref's
     * control. Credential and payment controls report "{redacted}", matching
     * the observation mask — before-state lands in the step ledger.
     */
    state: (ref: string): Record<string, unknown> | string => {
      const el = live(ref);
      if (!el) return "gone";
      const tag = el.tagName;
      const type = String(el.type ?? el.getAttribute?.("type") ?? "").toLowerCase();
      const autocomplete = String(el.getAttribute?.("autocomplete") ?? "").toLowerCase();
      const protectedCtl = type === "password" || /current-password|new-password|one-time-code|cc-number|cc-csc|cc-exp/.test(autocomplete);
      if (tag === "SELECT")
        return { selected: Array.from(el.selectedOptions ?? []).map((o: any) => o.label ?? o.value).join("|") };
      if (type === "checkbox" || type === "radio") return { checked: !!el.checked };
      if (tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable)
        return { value: protectedCtl ? (el.value || el.innerText ? "{redacted}" : "") : (el.isContentEditable ? el.innerText : el.value) ?? "" };
      return {};
    },
  };
}

export const AUX_WORLD_SOURCE = `(${installAuxWorld.toString()})(${collectObservation.toString()})`;

/** One CDP session per page that evaluates in the aux world and dispatches raw input. */
export class AuxWorld {
  /** aux-world context id per frame, learned from Runtime events as documents create their world. */
  private worlds = new Map<string, number>();
  private creating: Promise<number> | null = null;
  private frameId = "";

  private constructor(private session: CDPSession) {
    session.on("Runtime.executionContextCreated", ({ context }) => {
      const frameId = (context.auxData as { frameId?: string } | undefined)?.frameId;
      if (context.name === AUX_WORLD && frameId) this.worlds.set(frameId, context.id);
    });
    session.on("Runtime.executionContextDestroyed", ({ executionContextId }) => {
      for (const [frameId, id] of this.worlds) if (id === executionContextId) this.worlds.delete(frameId);
    });
    session.on("Runtime.executionContextsCleared", () => this.worlds.clear());
  }

  static async open(context: BrowserContext, page: Page): Promise<AuxWorld> {
    const session = await context.newCDPSession(page);
    const world = new AuxWorld(session);
    try {
      // pipelined: the session processes commands in order
      const [, { frameTree }] = await Promise.all([
        session.send("Page.enable"),
        session.send("Page.getFrameTree"),
        session.send("Page.addScriptToEvaluateOnNewDocument", { source: AUX_WORLD_SOURCE, worldName: AUX_WORLD }),
        session.send("Runtime.enable"),
      ]);
      world.frameId = frameTree.frame.id;
      return world;
    } catch (e) {
      await session.detach().catch(() => {});
      throw e;
    }
  }

  private get known(): number | null {
    return this.worlds.get(this.frameId) ?? null;
  }

  /** Known id when the document already made its world; otherwise ask for it (slow on a busy renderer). */
  private contextId(): Promise<number> {
    if (this.known !== null) return Promise.resolve(this.known);
    this.creating ??= this.session
      .send("Page.createIsolatedWorld", { frameId: this.frameId, worldName: AUX_WORLD })
      .then((r) => r.executionContextId)
      .finally(() => {
        this.creating = null;
      });
    return this.creating;
  }

  /** Evaluate `expression` (which may use `__aux`) in the world, by value. */
  async call<T>(expression: string, awaitPromise = false): Promise<T> {
    for (let attempt = 0; ; attempt++) {
      let contextId: number | undefined;
      try {
        contextId = await this.contextId();
        const res = await this.session.send("Runtime.evaluate", {
          expression: `globalThis.__aux ? ${expression} : "${MISSING}"`,
          contextId,
          returnByValue: true,
          awaitPromise,
        });
        if (res.exceptionDetails) throw new Error(res.exceptionDetails.exception?.description ?? res.exceptionDetails.text);
        if (res.result.value !== MISSING) return res.result.value as T;
        // a document that predates the attach (or the init script) gets the world now
        await this.session.send("Runtime.evaluate", { expression: AUX_WORLD_SOURCE, contextId });
        if (attempt >= 2) throw new Error("aux world could not be installed");
      } catch (e) {
        // navigation destroyed the context between calls — take the new document's
        if (attempt >= 2 || !/context|frame|world/i.test(e instanceof Error ? e.message : String(e))) throw e;
        if (this.known === contextId) this.worlds.delete(this.frameId);
      }
    }
  }

  /** Raw trusted input on this page's session — bypasses Playwright's actionability waits. */
  input(method: "Input.dispatchMouseEvent" | "Input.dispatchKeyEvent" | "Input.insertText", params: Record<string, unknown>): Promise<unknown> {
    return this.session.send(method, params as never);
  }

  async dispose() {
    this.worlds.clear();
    await this.session.detach().catch(() => {});
  }
}
