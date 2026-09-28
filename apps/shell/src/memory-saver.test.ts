// @vitest-environment jsdom
import { expect, it } from "vitest";
import type { PageTarget } from "@aux/contracts";
import { nextMemorySaverAction } from "./memory-saver";
import { memorySaverSummary } from "./memory-saver-report";

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
      page("audible"), page("sleeping", { lifecycle: "discarded" }),
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
