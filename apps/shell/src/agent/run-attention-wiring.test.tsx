// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import type { AuxEvent } from "@aux/contracts";
import { makeRun } from "../mock/fixtures";
import { useStore } from "../store";
import { reduceRunEvent } from "../store/events";
import { RunNoticeBanner, RunNoticePreference } from "./RunNoticeControls";
import { foregroundRunId } from "./run-notifications";
import { readInAppNoticePreference, writeInAppNoticePreference, readSystemTaskNotices, writeSystemTaskNotices,
  readTaskFocusMode, writeTaskFocusMode } from "./run-notice-preference";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

it("does not steal a queued or steered composer when another run needs input", () => {
  const current = makeRun({ runId: "current", status: "running", config: { chatId: "chat-a" } });
  const other = makeRun({ runId: "other", status: "needs_input", statusMessage: "Private question",
    config: { chatId: "chat-b" } });
  const before = { ...useStore.getState(), runs: [current], mode: "conversation" as const,
    conversationId: "chat-a", railOpen: false, railView: { kind: "home" as const },
    conversationDrafts: { "chat:chat-a": "Keep this steer" } };
  const event: AuxEvent = { type: "run.status", payload: { run: other }, seq: 1, streamId: "stream", ts: 1 };
  const change = reduceRunEvent(before, event)!;
  expect(change.runs).toContain(other);
  expect(change.prompt).toEqual({ runId: "other", question: "Private question" });
  expect(change).not.toHaveProperty("railOpen");
  expect(change).not.toHaveProperty("railView");
  expect(change).not.toHaveProperty("conversationId");
  expect(change).not.toHaveProperty("conversationDrafts");
});

it("treats only the selected newest turn as foreground and respects overlays", () => {
  const older = makeRun({ runId: "old", createdAt: 1, config: { chatId: "chat" } });
  const newer = makeRun({ runId: "new", createdAt: 2, config: { chatId: "chat" } });
  const view = { mode: "conversation", overlay: null, conversationId: "chat", railOpen: false,
    railView: { kind: "home" }, runs: [older, newer] };
  expect(foregroundRunId(view)).toBe("new");
  expect(foregroundRunId({ ...view, mode: "focus", railOpen: true, railView: { kind: "run", runId: "old" } })).toBe("old");
  expect(foregroundRunId({ ...view, overlay: "tasks" })).toBeNull();
});

it("offers a local notice preference and a keyboard-dismissible review banner", async () => {
  const initial = readInAppNoticePreference();
  const review = vi.fn();
  const dismiss = vi.fn();
  const host = document.createElement("div");
  const root = createRoot(host);
  try {
    await act(async () => root.render(<><RunNoticePreference /><RunNoticeBanner notice={{ kind: "question",
      runId: "r1", identity: "s1", title: "Aux needs your answer", body: "Open Aux to review a question.", tag: "aux-question-r1" }}
      onReview={review} onDismiss={dismiss} /></>));
    const toggle = host.querySelector<HTMLButtonElement>(".run-notice-preference")!;
    await act(async () => toggle.click());
    expect(readInAppNoticePreference()).toBe(initial === "all" ? "off" : "all");
    const button = host.querySelector<HTMLButtonElement>(".run-notice-banner .primary")!;
    await act(async () => button.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })));
    expect(dismiss).toHaveBeenCalledTimes(1);
    await act(async () => button.click());
    expect(review).toHaveBeenCalledWith("r1");
  } finally {
    await act(async () => root.unmount());
    writeInAppNoticePreference(initial);
  }
});

it("persists explicit system opt-in and Focus Mode independently", () => {
  const originalSystem = readSystemTaskNotices();
  const originalFocus = readTaskFocusMode();
  try {
    writeSystemTaskNotices(true);
    writeTaskFocusMode(true);
    expect(readSystemTaskNotices()).toBe(true);
    expect(readTaskFocusMode()).toBe(true);
    writeTaskFocusMode(false);
    expect(readSystemTaskNotices()).toBe(true);
    expect(readTaskFocusMode()).toBe(false);
  } finally {
    writeSystemTaskNotices(originalSystem);
    writeTaskFocusMode(originalFocus);
  }
});
