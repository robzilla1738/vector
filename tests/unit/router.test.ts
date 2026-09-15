/**
 * Engine/Chromium router (architecture §11): decision matrix, the
 * needs-chromium table with TTL + persistence, classification → fallback
 * mapping, and replay planning after a mid-program capability gap.
 */
import { describe, it, expect } from "vitest";
import { Router, MemoryRouterStore, isFallbackError, originOf, stepTargetsRef, NEEDS_CHROMIUM_TTL_MS, type NeedsChromiumEntry } from "@vector/runtime";
import { VectorError, type EngineMode, type Step } from "@vector/contracts";

function make(opts: { mode?: EngineMode; engine?: boolean; store?: MemoryRouterStore; now?: () => number; ttlMs?: number } = {}) {
  let mode: EngineMode = opts.mode ?? "auto";
  let engine = opts.engine ?? true;
  const logs: { message: string; attrs: Record<string, unknown> }[] = [];
  const router = new Router({
    mode: () => mode,
    engineAvailable: () => engine,
    store: opts.store,
    now: opts.now,
    ttlMs: opts.ttlMs,
    log: (message, attrs) => logs.push({ message, attrs }),
  });
  return { router, logs, setMode: (m: EngineMode) => (mode = m), setEngine: (e: boolean) => (engine = e) };
}

describe("Router.decide", () => {
  it("honours explicit backends and the engine mode", () => {
    const { router, setMode, setEngine } = make({ mode: "off" });
    expect(router.decide("https://a.test/", undefined)).toEqual({ backend: "vector", reason: "engine-mode-off", fallbackAllowed: false });
    expect(router.decide("https://a.test/", "vector")).toMatchObject({ backend: "vector", reason: "engine-mode-off" });
    expect(router.decide("https://a.test/", "chrome")).toMatchObject({ backend: "chrome", reason: "explicit-backend:chrome", fallbackAllowed: false });
    // explicit engine wins even when the mode is off — no fallback for an explicit placement
    expect(router.decide("https://a.test/", "vector-engine")).toMatchObject({ backend: "vector-engine", fallbackAllowed: false });

    setMode("always");
    expect(router.decide("https://a.test/", undefined)).toMatchObject({ backend: "vector-engine", reason: "engine-always", fallbackAllowed: false });

    setMode("auto");
    expect(router.decide("https://a.test/", undefined)).toEqual({ backend: "vector-engine", reason: "engine-first", fallbackAllowed: true });
    expect(router.decide("https://a.test/", "vector")).toMatchObject({ backend: "vector-engine", reason: "engine-first" });
    setEngine(false);
    expect(router.decide("https://a.test/", undefined)).toMatchObject({ backend: "vector", reason: "engine-unavailable" });
  });

  it("keeps unsupported schemes and unparseable urls on Chromium in auto mode", () => {
    const { router } = make();
    expect(router.decide("chrome://settings", undefined).reason).toBe("unsupported-scheme:chrome:");
    expect(router.decide("not a url", undefined).reason).toBe("unparseable-url");
    expect(router.decide("file:///tmp/x.html", undefined).backend).toBe("vector-engine");
    expect(router.decide("data:text/html,<p>x</p>", undefined).backend).toBe("vector-engine");
  });

  it("logs every decision with its reason", () => {
    const { router, logs } = make();
    router.decide("https://a.test/", undefined);
    expect(logs).toEqual([{ message: "router.decide", attrs: expect.objectContaining({ url: "https://a.test/", reason: "engine-first" }) }]);
  });
});

describe("needs-chromium table", () => {
  it("records origins, routes them to Chromium, expires after the TTL and persists", () => {
    let now = 1_000_000;
    const store = new MemoryRouterStore();
    const { router } = make({ store, now: () => now });

    expect(router.needsChromium("https://spa.test/app")).toBeUndefined();
    const entry = router.recordNeedsChromium("https://spa.test/app?x=1", "thin-body-with-external-script");
    expect(entry).toEqual({ origin: "https://spa.test", reason: "thin-body-with-external-script", recordedAt: now, expiresAt: now + NEEDS_CHROMIUM_TTL_MS });
    expect(router.decide("https://spa.test/other", undefined)).toMatchObject({
      backend: "vector",
      reason: "needs-chromium-table:thin-body-with-external-script",
      fallbackAllowed: false,
    });
    // a different origin (port counts) is unaffected
    expect(router.decide("https://spa.test:8443/", undefined).backend).toBe("vector-engine");
    // persisted through the store
    expect(store.load()).toHaveLength(1);
    const reloaded = make({ store, now: () => now }).router;
    expect(reloaded.needsChromium("https://spa.test/")).toBeTruthy();

    // refresh keeps one row per origin
    now += 1000;
    router.recordNeedsChromium("https://spa.test/", "mid-program:hover");
    expect(router.entries()).toHaveLength(1);
    expect(router.entries()[0]?.reason).toBe("mid-program:hover");

    // TTL: 24 h after the refresh the engine gets another try, and the table is pruned + saved
    now += NEEDS_CHROMIUM_TTL_MS + 1;
    expect(router.decide("https://spa.test/", undefined).backend).toBe("vector-engine");
    expect(router.entries()).toHaveLength(0);
    expect(store.load()).toHaveLength(0);
  });

  it("prunes expired rows on load and supports forget()", () => {
    const store = new MemoryRouterStore();
    const stale: NeedsChromiumEntry = { origin: "https://old.test", reason: "x", recordedAt: 0, expiresAt: 10 };
    const fresh: NeedsChromiumEntry = { origin: "https://new.test", reason: "y", recordedAt: 0, expiresAt: 10_000 };
    store.save([stale, fresh]);
    const { router } = make({ store, now: () => 100 });
    expect(router.entries().map((e) => e.origin)).toEqual(["https://new.test"]);
    expect(store.load()).toHaveLength(1);
    expect(router.forget("https://new.test/anything")).toBe(true);
    expect(router.forget("https://new.test/anything")).toBe(false);
    expect(router.entries()).toHaveLength(0);
  });

  it("does not record origin-less urls", () => {
    const { router } = make();
    expect(router.recordNeedsChromium("data:text/html,<p>x</p>", "r")).toBeUndefined();
    expect(router.recordNeedsChromium("about:blank", "r")).toBeUndefined();
    expect(router.recordNeedsChromium("file:///tmp/a.html", "r")?.origin).toBe("file://");
    expect(originOf("https://A.test:443/x")).toBe("https://a.test");
    expect(originOf("garbage")).toBeNull();
  });
});

describe("classification → fallback mapping", () => {
  it("turns a requiresScript classification into capability_unsupported with the reason", () => {
    const { router } = make();
    expect(router.classify(undefined)).toBeNull();
    expect(router.classify({ requiresScript: false })).toBeNull();
    const err = router.classify({ requiresScript: true, reason: "empty-app-root(#root)", kind: "requiresScript" });
    expect(err).toBeInstanceOf(VectorError);
    expect(err?.code).toBe("capability_unsupported");
    expect(isFallbackError(err)).toBe(true);
    expect(Router.fallbackReason(err)).toBe("empty-app-root(#root)");
    const content = router.classify({ requiresScript: true, reason: "canvas-only", kind: "unsupportedContent" });
    expect(content?.message).toContain("unsupportedContent");
    expect(Router.fallbackReason(new VectorError("capability_unsupported", "hover"))).toBe("hover");
    expect(isFallbackError(new VectorError("step_failed", "x"))).toBe(false);
    expect(isFallbackError(new Error("x"))).toBe(false);
  });
});

describe("replay planning", () => {
  const steps: Step[] = [
    { id: "a", op: "navigate", url: "https://x.test/" },
    { id: "b", op: "hover", target: "css:#menu" },
    { id: "c", op: "click", target: "css:#item" },
    { id: "d", op: "extract", fields: [{ name: "t", selector: "h1" }] },
  ];

  it("finds the fallback index and replays selector-only remainders", () => {
    const { router } = make();
    const outcomes = [
      { status: "ok" },
      { status: "failed", error: { code: "capability_unsupported" } },
      { status: "skipped" },
      { status: "skipped" },
    ];
    expect(Router.fallbackIndex(outcomes)).toBe(1);
    expect(Router.fallbackIndex([{ status: "failed", error: { code: "not_found" } }])).toBe(-1);
    const plan = router.planReplay(steps, 1);
    expect(plan.remaining.map((s) => s.id)).toEqual(["b", "c", "d"]);
    expect(plan.repair).toBe(false);
    expect(plan.refSteps).toEqual([]);
  });

  it("flags ref-targeted remainders for REPAIR", () => {
    const { router } = make();
    const withRefs: Step[] = [
      steps[0]!,
      { id: "h", op: "hover", target: "r12" },
      { id: "f", op: "fill", target: "css:#q", value: "x" },
      { id: "w", op: "waitFor", condition: { kind: "refReady", ref: "r13" } },
      { id: "g", op: "dragTo", target: "css:#a", to: "r7" },
      { id: "e", op: "click", target: "css:#b", expect: [{ kind: "refReady", ref: "r9" }] },
    ];
    const plan = router.planReplay(withRefs, 1);
    expect(plan.repair).toBe(true);
    expect(plan.refSteps).toEqual(["h", "w", "g", "e"]);
    expect(stepTargetsRef(withRefs[2]!)).toBe(false);
    expect(stepTargetsRef({ id: "s", op: "scroll", direction: "down" })).toBe(false);
    // steps before the failure are never replayed
    expect(router.planReplay(withRefs, 2).refSteps).toEqual(["w", "g", "e"]);
    expect(router.planReplay(withRefs, 99).remaining).toEqual([]);
  });
});
