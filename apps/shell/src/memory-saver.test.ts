// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { installMemorySaver, nextMemorySaverAction } from "./memory-saver";
import {
  memorySaverCyclesKey, memorySaverSummary, readMemorySaverCycles, recordMemorySaverCycle,
} from "./memory-saver-report";

const harness = vi.hoisted(() => ({
  tabsUnsavedWork: vi.fn(),
  tabSleep: vi.fn(),
  state: {
    layout: { pins: {} },
    pages: [] as PageTarget[],
    activePageId: null as string | null,
    splitPageId: null as string | null,
    tabAudio: {} as Record<string, { audible: boolean }>,
    settings: { memorySaverMinutes: 0 } as Record<string, unknown>,
    connected: true,
    restoringTabs: false,
  },
}));
vi.mock("./bridge", () => ({
  inNativeHost: true,
  bridge: {
    windowId: "main",
    privateMode: false,
    windowKind: "normal",
    tabsUnsavedWork: harness.tabsUnsavedWork,
    tabSleep: harness.tabSleep,
  },
}));
vi.mock("./store", () => ({
  useStore: { getState: () => harness.state, subscribe: () => () => {} },
}));
vi.mock("./use-feature", () => ({ featureStage: () => "on" }));

const page = (pageId: string, overrides: Partial<PageTarget> = {}): PageTarget => ({
  pageId, windowId: "main", backend: "aux", targetId: `atab-${pageId}`,
  url: `https://example.com/${pageId}`, title: pageId, documentEpoch: 0,
  lastRevision: 0, viewStatus: "hidden", lifecycle: "live", controller: "none",
  controllerEpoch: 0, ownedByRuntime: false, createdAt: 1000,
  lastActiveAt: 1000, ...overrides,
});

it("schedules the oldest eligible background tab and respects native-safety prefilters", () => {
  const state = {
    layout: { pins: {} },
    pages: [page("active"), page("agent", { ownedByRuntime: true }),
      page("borrowed", { controller: "agent" }), page("split"),
      page("audible"), page("detached", { viewStatus: "detached" }),
      page("sleeping", { lifecycle: "discarded" }),
      page("clean", { lastActiveAt: 2000 }), page("newer", { lastActiveAt: 3000 })],
    activePageId: "active", splitPageId: "split", tabAudio: { audible: { audible: true } },
    settings: { memorySaverMinutes: 1 }, connected: true, restoringTabs: false,
  };
  expect(nextMemorySaverAction(state, new Map())?.pageId).toBe("clean");
  expect(nextMemorySaverAction(state, new Map())?.dueAt).toBe(62_000);
  expect(nextMemorySaverAction(state, new Map([["clean\nhttps://example.com/clean", 70_000]]))?.pageId).toBe("newer");
  expect(nextMemorySaverAction({ ...state, restoringTabs: true }, new Map())).toBeNull();
  expect(nextMemorySaverAction({ ...state, settings: { memorySaverMinutes: 0 } }, new Map())).toBeNull();
});

it("leaves dirty and unknown pages awake and still schedules a page the unsaved map does not list", () => {
  const state = {
    layout: { pins: {} },
    pages: [page("active", { createdAt: 0, lastActiveAt: 100 }), page("dirty", { createdAt: 0, lastActiveAt: 200 }),
      page("unknown", { createdAt: 0, lastActiveAt: 300 }), page("missing", { createdAt: 0, lastActiveAt: 400 }),
      page("clean", { createdAt: 0, lastActiveAt: 500 })],
    activePageId: "active", splitPageId: null, tabAudio: {},
    settings: { memorySaverMinutes: 1 }, connected: true, restoringTabs: false,
  };
  const unsaved: Record<string, "clean" | "dirty" | "unknown"> = {
    active: "clean", dirty: "dirty", unknown: "unknown", clean: "clean",
  };
  expect(nextMemorySaverAction(state, new Map(), unsaved)).toEqual({
    pageId: "missing", url: "https://example.com/missing", dueAt: 60_400,
  });
  expect(nextMemorySaverAction(state, new Map(), { ...unsaved, missing: "clean" })).toEqual({
    pageId: "missing", url: "https://example.com/missing", dueAt: 60_400,
  });
  expect(nextMemorySaverAction(state, new Map(), { ...unsaved, missing: "dirty" })).toEqual({
    pageId: "clean", url: "https://example.com/clean", dueAt: 60_500,
  });
  expect(nextMemorySaverAction(state, new Map(), { ...unsaved, missing: "unknown" })).toEqual({
    pageId: "clean", url: "https://example.com/clean", dueAt: 60_500,
  });
  expect(nextMemorySaverAction(state, new Map(), { ...unsaved, missing: "dirty", clean: "unknown" })).toBeNull();
  expect(nextMemorySaverAction(state, new Map([["missing\nhttps://example.com/missing", 70_000]]), unsaved)?.pageId)
    .toBe("clean");
  expect(nextMemorySaverAction(state, new Map())).toEqual({
    pageId: "dirty", url: "https://example.com/dirty", dueAt: 60_200,
  });
});

it("reports estimated savings only for cycles with a native estimate", () => {
  const summary = memorySaverSummary([
    { at: 3, pageId: "red", site: "example.com", slept: true, estimatedSavedBytes: 12 * 1024 * 1024 },
    { at: 2, pageId: "blue", site: "example.com", slept: true },
    { at: 1, pageId: "dirty", site: "example.com", slept: false, reason: "Unsaved work" },
  ]);
  expect(summary.slept).toBe(2);
  expect(summary.measured).toBe(1);
  expect(summary.estimatedSavedBytes).toBe(12 * 1024 * 1024);
});


it("persists only bounded native estimates and fixed refusal reasons", () => {
  let stored: string | null = null;
  vi.stubGlobal("localStorage", { getItem: () => stored, setItem: (_key: string, value: string) => { stored = value; } });
  recordMemorySaverCycle(page("dirty"), { slept: false, reason: "private page text / secret" });
  recordMemorySaverCycle(page("large"), { slept: true, estimatedSavedBytes: 2 ** 42 });
  recordMemorySaverCycle(page("audible"), { slept: false, reason: "Playing audio keeps this tab awake." });
  const rows = readMemorySaverCycles();
  expect(rows[0]?.reason).toBe("Playing audio keeps this tab awake.");
  expect(rows[1]?.estimatedSavedBytes).toBeUndefined();
  expect(rows[2]?.reason).toBeUndefined();
  expect(JSON.stringify(rows)).not.toContain("secret");
  expect(stored).not.toContain("secret");
  vi.unstubAllGlobals();
});

it("rehydrates an estimated sleep and a protected-tab refusal from Profile storage", async () => {
  const saved = new Map<string, string>();
  vi.stubGlobal("localStorage", { getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => { saved.set(key, value); } });
  try {
    recordMemorySaverCycle(page("clean"), { slept: true, estimatedSavedBytes: 8 * 1024 * 1024 });
    recordMemorySaverCycle(page("protected"), { slept: false, reason: "This tab has unload handlers and stays awake." });
    vi.resetModules();
    const restarted = await import("./memory-saver-report");
    const cycles = restarted.readMemorySaverCycles();
    expect(cycles.map(cycle => cycle.slept)).toEqual([false, true]);
    expect(cycles[0]?.reason).toBe("This tab has unload handlers and stays awake.");
    expect(restarted.memorySaverSummary(cycles)).toMatchObject({ slept: 1, measured: 1, estimatedSavedBytes: 8 * 1024 * 1024 });
    saved.clear();
    expect(restarted.readMemorySaverCycles()).toEqual([]);
  } finally {
    vi.unstubAllGlobals();
  }
});

it("queries unsaved work before sleep and retries a dirty, unknown, or failed check", async () => {
  const saved = new Map<string, string>([[memorySaverCyclesKey, "[]"]]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => { saved.set(key, value); },
  });
  vi.useFakeTimers();
  vi.setSystemTime(60_000);
  harness.tabsUnsavedWork.mockReset();
  harness.tabSleep.mockReset();
  harness.tabsUnsavedWork
    .mockResolvedValueOnce({ idle: "dirty" })
    .mockResolvedValueOnce({ idle: "unknown" })
    .mockRejectedValueOnce(new Error("unsaved work unavailable"))
    .mockResolvedValueOnce({ idle: "clean" })
    .mockResolvedValueOnce({});
  harness.tabSleep.mockResolvedValue({ slept: true, estimatedSavedBytes: 4 * 1024 });
  Object.assign(harness.state, {
    pages: [page("active", { createdAt: 0, lastActiveAt: 0 }), page("idle", { createdAt: 0, lastActiveAt: 0 })],
    activePageId: "active", splitPageId: null, tabAudio: {},
    settings: { memorySaverMinutes: 1 }, connected: true, restoringTabs: false,
  });
  const stop = installMemorySaver();
  const candidate = [{ pageId: "idle", url: "https://example.com/idle" }];
  const quiet = 10 * 60_000;
  try {
    await vi.advanceTimersByTimeAsync(0);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledTimes(1);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledWith(candidate);
    expect(harness.tabSleep).not.toHaveBeenCalled();
    expect(readMemorySaverCycles()).toEqual([]);

    await vi.advanceTimersByTimeAsync(quiet - 1);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledTimes(2);
    expect(harness.tabsUnsavedWork).toHaveBeenLastCalledWith(candidate);
    expect(harness.tabSleep).not.toHaveBeenCalled();
    expect(readMemorySaverCycles()).toEqual([]);

    await vi.advanceTimersByTimeAsync(quiet);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledTimes(3);
    expect(harness.tabSleep).not.toHaveBeenCalled();
    expect(readMemorySaverCycles()).toEqual([]);

    await vi.advanceTimersByTimeAsync(quiet);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledTimes(4);
    expect(harness.tabSleep).toHaveBeenCalledTimes(1);
    expect(harness.tabSleep).toHaveBeenCalledWith("idle", "https://example.com/idle");
    expect(readMemorySaverCycles()).toMatchObject([{ pageId: "idle", slept: true, estimatedSavedBytes: 4 * 1024 }]);

    await vi.advanceTimersByTimeAsync(quiet);
    expect(harness.tabsUnsavedWork).toHaveBeenCalledTimes(5);
    expect(harness.tabsUnsavedWork).toHaveBeenLastCalledWith(candidate);
    expect(harness.tabSleep).toHaveBeenCalledTimes(2);
    expect(readMemorySaverCycles()).toHaveLength(2);
    expect(readMemorySaverCycles()[0]).toMatchObject({ pageId: "idle", slept: true, estimatedSavedBytes: 4 * 1024 });
  } finally {
    stop();
    harness.state.pages = [];
    harness.state.settings = { memorySaverMinutes: 0 };
    vi.useRealTimers();
    vi.unstubAllGlobals();
  }
});

it("keeps a bounded report for this window when Profile storage rejects a write", () => {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("storage unavailable"); } });
  try {
    recordMemorySaverCycle(page("clean"), { slept: true, estimatedSavedBytes: 4 * 1024 * 1024 });
    expect(readMemorySaverCycles()[0]).toMatchObject({ pageId: "clean", estimatedSavedBytes: 4 * 1024 * 1024 });
  } finally {
    vi.unstubAllGlobals();
  }
});

it("protects only the bound keep-awake pin, even after URL drift", () => {
  const state = { layout: { pins: { work: [{ url: "https://original.test", title: "App", pageId: "kept", keepAwake: true }] } }, pages: [page("kept"), page("eligible")], activePageId: null, splitPageId: null, tabAudio: {}, settings: { memorySaverMinutes: 1 }, connected: true, restoringTabs: false };
  expect(nextMemorySaverAction(state, new Map())?.pageId).toBe("eligible");
  state.layout.pins.work[0]!.keepAwake = false;
  expect(nextMemorySaverAction(state, new Map())?.pageId).toBe("kept");
});
