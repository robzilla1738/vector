// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { nextMemorySaverAction } from "./memory-saver";
import { memorySaverSummary, readMemorySaverCycles, recordMemorySaverCycle } from "./memory-saver-report";

const page = (pageId: string, overrides: Partial<PageTarget> = {}): PageTarget => ({
  pageId, windowId: "main", backend: "aux", targetId: `atab-${pageId}`,
  url: `https://example.com/${pageId}`, title: pageId, documentEpoch: 0,
  lastRevision: 0, viewStatus: "hidden", lifecycle: "live", controller: "none",
  controllerEpoch: 0, ownedByRuntime: false, createdAt: 1000,
  lastActiveAt: 1000, ...overrides,
});

it("schedules the oldest eligible background tab and respects native-safety prefilters", () => {
  const state = {
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

it("keeps a bounded report for this window when Profile storage rejects a write", () => {
  vi.stubGlobal("localStorage", { getItem: () => null, setItem: () => { throw new Error("storage unavailable"); } });
  try {
    recordMemorySaverCycle(page("clean"), { slept: true, estimatedSavedBytes: 4 * 1024 * 1024 });
    expect(readMemorySaverCycles()[0]).toMatchObject({ pageId: "clean", estimatedSavedBytes: 4 * 1024 * 1024 });
  } finally {
    vi.unstubAllGlobals();
  }
});
