import { describe, expect, it } from "vitest";
import { canDiscard, canFreeze, createPausedAgentTracker, freezeBlockedReason, type FreezeSignals } from "../../apps/desktop/main/page-lifecycle.js";

const live: FreezeSignals = {
  popup: false, runtimeOwned: false, agentPaused: false, focused: false, split: false,
  offscreenHold: false, downloading: false, mediaAllowed: false, busy: false,
  audible: false, loading: false, captured: false, destroyed: false,
};

describe("freezeBlockedReason", () => {
  it("allows a plain hidden page", () => {
    expect(canFreeze(live)).toBe(true);
  });
  it("blocks every protected reason", () => {
    for (const [field, reason] of [
      ["destroyed", "destroyed"], ["focused", "focused"], ["split", "split"], ["popup", "popup"],
      ["offscreenHold", "offscreen-hold"], ["downloading", "downloading"], ["mediaAllowed", "media-permission"],
      ["busy", "busy"], ["audible", "audible"], ["loading", "loading"], ["captured", "captured"],
    ] as const) {
      expect(freezeBlockedReason({ ...live, [field]: true })).toBe(reason);
    }
  });
  it("keeps an active agent page live but frees a paused one", () => {
    expect(freezeBlockedReason({ ...live, runtimeOwned: true })).toBe("agent-active");
    expect(canFreeze({ ...live, runtimeOwned: true, agentPaused: true })).toBe(true);
  });
});

describe("canDiscard", () => {
  it("allows a hidden human page and blocks every protection", () => {
    const s = { popup: false, runtimeOwned: false, agentPaused: false, focused: false, split: false, offscreenHold: false, downloading: false, destroyed: false };
    expect(canDiscard(s)).toBe(true);
    for (const field of ["destroyed", "focused", "split", "popup", "offscreenHold", "downloading"] as const) {
      expect(canDiscard({ ...s, [field]: true })).toBe(false);
    }
    // Agent pages are never discarded — a paused run freezes, it never unloads.
    expect(canDiscard({ ...s, runtimeOwned: true, agentPaused: true })).toBe(false);
  });
});

describe("paused agent tracker", () => {
  it("marks run pages paused and reports the released set on resume", () => {
    const tracker = createPausedAgentTracker();
    expect(tracker.observe("run-1", ["p1", "p2"], "paused")).toEqual([]);
    expect(tracker.isPaused("p1")).toBe(true);
    expect(tracker.isPaused("p2")).toBe(true);
    expect(tracker.observe("run-1", ["p1", "p2"], "running")).toEqual(["p1", "p2"]);
    expect(tracker.isPaused("p1")).toBe(false);
  });
  it("returns pages that leave a still-paused run so callers can wake them", () => {
    const tracker = createPausedAgentTracker();
    tracker.observe("run-1", ["p1", "p2"], "paused");
    expect(tracker.observe("run-1", ["p1"], "paused")).toEqual(["p2"]);
    expect(tracker.isPaused("p1")).toBe(true);
    expect(tracker.isPaused("p2")).toBe(false);
  });
  it("keeps a page paused while any paused run still lists it", () => {
    const tracker = createPausedAgentTracker();
    tracker.observe("run-1", ["p1"], "paused");
    tracker.observe("run-2", ["p1"], "paused");
    tracker.observe("run-1", ["p1"], "running");
    expect(tracker.isPaused("p1")).toBe(true);
    tracker.observe("run-2", ["p1"], "completed");
    expect(tracker.isPaused("p1")).toBe(false);
  });
  it("forget clears the page across runs", () => {
    const tracker = createPausedAgentTracker();
    tracker.observe("run-1", ["p1"], "paused");
    tracker.forget("p1");
    expect(tracker.isPaused("p1")).toBe(false);
  });
});
