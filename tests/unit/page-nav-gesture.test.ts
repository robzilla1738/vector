/// <reference lib="dom" />
// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
  NAV_GESTURE_BINDING,
  consumesHorizontalWheel,
  createOverscrollTracker,
  navGestureScript,
} from "../../apps/desktop/main/page-nav-gesture.js";

afterEach(() => {
  document.body.innerHTML = "";
  vi.restoreAllMocks();
  delete (globalThis as Record<string, unknown>)[NAV_GESTURE_BINDING];
});

/* ---------------------------------- tracker ---------------------------------- */

it("fires once per overscroll run and needs an idle gap to re-arm", () => {
  const tracker = createOverscrollTracker({ threshold: 100, gapMs: 300 });
  expect(tracker.feed(40, 0, false, 0)).toBeNull();
  expect(tracker.feed(70, 0, false, 50)).toBe("forward");
  // Momentum tail keeps accumulating but cannot fire again.
  expect(tracker.feed(400, 0, false, 100)).toBeNull();
  // A fresh gesture after the gap fires again.
  expect(tracker.feed(60, 0, false, 500)).toBeNull();
  expect(tracker.feed(60, 0, false, 550)).toBe("forward");
});

it("fires back for negative deltas, resets on flips, consumption, and idle gaps", () => {
  const tracker = createOverscrollTracker({ threshold: 100, gapMs: 300 });
  expect(tracker.feed(-120, 0, false, 0)).toBe("back");
  // Direction flip restarts accumulation from zero.
  expect(tracker.feed(-60, 0, false, 400)).toBeNull();
  expect(tracker.feed(60, 0, false, 450)).toBeNull();
  expect(tracker.feed(60, 0, false, 500)).toBe("forward");
  // A consumed delta claims the gesture for the page entirely.
  expect(tracker.feed(80, 0, false, 800)).toBeNull();
  expect(tracker.feed(80, 0, true, 850)).toBeNull();
  expect(tracker.feed(80, 0, false, 900)).toBeNull();
  // Idle gap restarts too — no spillover accumulation.
  expect(tracker.feed(80, 0, false, 2000)).toBeNull();
  expect(tracker.feed(80, 0, false, 2050)).toBe("forward");
});

it("ignores vertical-dominant deltas without clearing horizontal progress", () => {
  const tracker = createOverscrollTracker({ threshold: 100, gapMs: 300 });
  expect(tracker.feed(60, 0, false, 0)).toBeNull();
  expect(tracker.feed(10, 50, false, 50)).toBeNull();
  expect(tracker.feed(60, 10, false, 100)).toBe("forward");
});

/* ----------------------------- scroll consumption ---------------------------- */

function scroller(style: string, metrics: { scrollWidth?: number; clientWidth?: number; scrollLeft?: number }) {
  const el = document.createElement("div");
  el.setAttribute("style", style);
  for (const [key, value] of Object.entries(metrics)) Object.defineProperty(el, key, { value, configurable: true });
  document.body.append(el);
  return el;
}

it("a horizontally scrollable ancestor owns the delta until it reaches the edge", () => {
  const el = scroller("overflow-x: auto", { scrollWidth: 500, clientWidth: 200, scrollLeft: 100 });
  expect(consumesHorizontalWheel([el], 10)).toBe(true);
  expect(consumesHorizontalWheel([el], -10)).toBe(true);
  Object.defineProperty(el, "scrollLeft", { value: 300, configurable: true });
  expect(consumesHorizontalWheel([el], 10)).toBe(false);
  expect(consumesHorizontalWheel([el], -10)).toBe(true);
  Object.defineProperty(el, "scrollLeft", { value: 0, configurable: true });
  expect(consumesHorizontalWheel([el], -10)).toBe(false);
});

it("negative scrollLeft in RTL consumes toward zero and -range", () => {
  const el = scroller("overflow-x: auto; direction: rtl", { scrollWidth: 500, clientWidth: 200, scrollLeft: -150 });
  expect(consumesHorizontalWheel([el], 10)).toBe(true);
  expect(consumesHorizontalWheel([el], -10)).toBe(true);
  Object.defineProperty(el, "scrollLeft", { value: 0, configurable: true });
  expect(consumesHorizontalWheel([el], 10)).toBe(false);
  Object.defineProperty(el, "scrollLeft", { value: -300, configurable: true });
  expect(consumesHorizontalWheel([el], -10)).toBe(false);
});

it("non-scrollable and vertical-only ancestors never consume", () => {
  const plain = scroller("overflow-x: hidden", { scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
  const fitted = scroller("overflow-x: auto", { scrollWidth: 200, clientWidth: 200, scrollLeft: 0 });
  const vertical = scroller("overflow-y: auto", { scrollWidth: 500, clientWidth: 200, scrollLeft: 0 });
  expect(consumesHorizontalWheel([plain], 10)).toBe(false);
  expect(consumesHorizontalWheel([fitted], 10)).toBe(false);
  expect(consumesHorizontalWheel([vertical], 10)).toBe(false);
  expect(consumesHorizontalWheel([document.body, document.documentElement, document, window], 10)).toBe(false);
});

/* ------------------------------ injected script ------------------------------ */

function wheelOn(target: EventTarget, init: WheelEventInit) {
  target.dispatchEvent(new WheelEvent("wheel", { bubbles: true, composed: true, cancelable: true, ...init }));
}

it("the injected listener turns unconsumed edge runs into one binding call", () => {
  const send = vi.fn();
  (globalThis as Record<string, unknown>)[NAV_GESTURE_BINDING] = send;
  // oxlint-disable-next-line no-eval — exercising the real serialized script.
  (0, eval)(navGestureScript(NAV_GESTURE_BINDING));
  for (let i = 0; i < 12; i++) wheelOn(document.body, { deltaX: 30 });
  expect(send).toHaveBeenCalledTimes(1);
  expect(send).toHaveBeenCalledWith("forward");
  // A consumed delta ends the gesture — a new run reports again, backward.
  const carousel = scroller("overflow-x: auto", { scrollWidth: 800, clientWidth: 200, scrollLeft: 100 });
  wheelOn(carousel, { deltaX: 30 });
  for (let i = 0; i < 12; i++) wheelOn(document.body, { deltaX: -30 });
  expect(send).toHaveBeenCalledTimes(2);
  expect(send).toHaveBeenLastCalledWith("back");
});

it("a mid-scroll carousel consumes the gesture instead of navigating", () => {
  const send = vi.fn();
  (globalThis as Record<string, unknown>)[NAV_GESTURE_BINDING] = send;
  // oxlint-disable-next-line no-eval — exercising the real serialized script.
  (0, eval)(navGestureScript(NAV_GESTURE_BINDING));
  const carousel = scroller("overflow-x: auto", { scrollWidth: 800, clientWidth: 200, scrollLeft: 100 });
  const card = document.createElement("div");
  carousel.append(card);
  for (let i = 0; i < 12; i++) wheelOn(card, { deltaX: 30 });
  expect(send).not.toHaveBeenCalled();
  // At the carousel's right edge the same run becomes navigation.
  Object.defineProperty(carousel, "scrollLeft", { value: 600, configurable: true });
  for (let i = 0; i < 12; i++) wheelOn(card, { deltaX: 30 });
  expect(send).toHaveBeenCalledWith("forward");
});

it("pinch-zoom wheel deltas (ctrlKey) never navigate", () => {
  const send = vi.fn();
  (globalThis as Record<string, unknown>)[NAV_GESTURE_BINDING] = send;
  // oxlint-disable-next-line no-eval — exercising the real serialized script.
  (0, eval)(navGestureScript(NAV_GESTURE_BINDING));
  for (let i = 0; i < 20; i++) wheelOn(document.body, { deltaX: 60, ctrlKey: true });
  expect(send).not.toHaveBeenCalled();
});
