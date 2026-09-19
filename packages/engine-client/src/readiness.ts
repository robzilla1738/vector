/**
 * Quiescence readiness signal (speed P1-8). An init script installed on every
 * document tracks in-flight fetch/XHR requests and the time of the last DOM
 * post-load DOM mutation; `settledProbe` then waits — bounded — for two
 * animation frames, no in-flight requests, and a short mutation-free window. This is a
 * readiness *signal*, not a fixed sleep: it resolves the moment the page is
 * quiet and gives up at the deadline so a live ticker cannot stall a step.
 *
 * Both snippets are serialized into the page, so they must stay
 * self-contained (no imports, no closures over module state).
 */

export const READINESS_GLOBAL = "__vectorReady";

/** Default bound for the implicit post-navigation wait. */
export const POST_NAVIGATION_SETTLE_MS = 500;
/** Default bound for an explicit `waitFor { kind: "settled" }`. */
export const SETTLED_CONDITION_MS = 2_000;
/** DOM must be mutation-free for this long. */
export const SETTLED_QUIET_MS = 100;

export const READINESS_INIT_SCRIPT = `(() => {
  const g = globalThis;
  if (g.${READINESS_GLOBAL}) return;
  // lastMutation is null until a post-load mutation happens (a 0 would make
  // the quiet check "the document is 100 ms old"). The observer is registered
  // at DOMContentLoaded: nodes the parser inserts are already present when
  // navigation returns, so only post-load activity (async renders, fetch
  // completions) has to go quiet. Observer callbacks are microtasks, so a
  // readyState check inside the callback would still count the last parse batch.
  const st = { inflight: 0, lastMutation: null, mutations: 0, requests: 0 };
  g.${READINESS_GLOBAL} = st;
  const touch = () => { st.lastMutation = performance.now(); };
  const done = () => { st.inflight = Math.max(0, st.inflight - 1); touch(); };
  const of = g.fetch;
  if (typeof of === "function") {
    g.fetch = function () {
      st.inflight++; st.requests++;
      let p;
      try { p = of.apply(this, arguments); } catch (e) { done(); throw e; }
      return Promise.resolve(p).then((r) => { done(); return r; }, (e) => { done(); throw e; });
    };
  }
  const X = g.XMLHttpRequest;
  if (X && X.prototype && typeof X.prototype.send === "function") {
    const os = X.prototype.send;
    X.prototype.send = function () {
      st.inflight++; st.requests++;
      let fin = false;
      const end = () => { if (!fin) { fin = true; done(); } };
      try { this.addEventListener("loadend", end, { once: true }); } catch {}
      try { return os.apply(this, arguments); } catch (e) { end(); throw e; }
    };
  }
  const observe = () => {
    const root = document.documentElement;
    if (!root) { setTimeout(observe, 0); return; }
    try {
      new MutationObserver(() => { st.mutations++; touch(); })
        .observe(root, { childList: true, subtree: true, attributes: true, characterData: true });
    } catch {}
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", observe, { once: true });
  else observe();
})();`;

/**
 * Evaluated in the page for the observation cache (plan A6). Everything an
 * observation depends on that the MutationObserver cannot see is folded in:
 * form control values (the `value` property is not an attribute), the
 * focused element, scroll offsets, viewport and URL. Costs one small
 * evaluate instead of the full observe walk.
 */
export function observationFingerprint(): string {
  const st = (globalThis as unknown as Record<string, { mutations?: number } | undefined>)["__vectorReady"];
  const d = document;
  let values = "";
  const controls = d.querySelectorAll("input,textarea,select");
  for (let i = 0; i < controls.length && i < 400; i++) {
    const c = controls[i] as HTMLInputElement;
    values += c.type === "checkbox" || c.type === "radio" ? (c.checked ? "1" : "0") : `${c.value.length}:${c.value.slice(0, 32)}`;
    values += "|";
  }
  const a = d.activeElement;
  const focus = a ? `${a.tagName}#${a.id}.${a.className}` : "";
  const w = globalThis as unknown as Window;
  return [
    st?.mutations ?? "nomo",
    location.href,
    d.title,
    Math.round(w.scrollX),
    Math.round(w.scrollY),
    w.innerWidth,
    w.innerHeight,
    d.readyState,
    controls.length,
    values,
    focus,
  ].join("\u0001");
}

export interface SettledProbeArgs {
  timeoutMs: number;
  quietMs: number;
}

/**
 * Evaluated in the page; resolves true when settled, false at the deadline.
 * rAF is raced against a one-frame timer so a throttled or non-rendering
 * (headless, hidden) renderer cannot hang the probe; when no frame arrives
 * at all the second frame wait is skipped — the renderer is not producing
 * frames, so there is nothing more to wait for. Without the init script
 * (document attached before install) only the frame wait applies.
 */
export function settledProbe(args: SettledProbeArgs): Promise<boolean> {
  const st = (globalThis as unknown as Record<string, { inflight: number; lastMutation: number | null } | undefined>)["__vectorReady"];
  const deadline = performance.now() + args.timeoutMs;
  /** resolves true when a real animation frame fired, false on the fallback timer */
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
  return (async () => {
    if (await frame()) await frame();
    for (;;) {
      const now = performance.now();
      if (!st || (st.inflight <= 0 && (st.lastMutation === null || now - st.lastMutation >= args.quietMs))) return true;
      if (now >= deadline) return false;
      await new Promise((r) => setTimeout(r, Math.max(5, Math.min(25, deadline - now))));
    }
  })();
}
