// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi, beforeEach, afterEach } from "vitest";
import { dispatchShortcut, executeCommand } from "../commands";
import type { AuxEvent } from "@aux/contracts";
import { makeRun } from "../mock/fixtures";
import { useStore } from "../store";
import { reduceRunEvent } from "../store/events";
import { RunNoticeBanner, RunNoticePreference } from "./RunNoticeControls";
import { TaskAttentionSettings } from "./TaskAttentionSettings";
import { foregroundRunId } from "./run-notifications";
import {
  readInAppNoticePreference,
  writeInAppNoticePreference,
  readSystemTaskNotices,
  writeSystemTaskNotices,
  readTaskFocusMode,
  writeTaskFocusMode,
} from "./run-notice-preference";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
});
afterEach(() => {
  vi.restoreAllMocks();
});

it("does not steal a queued or steered composer when another run needs input", () => {
  const current = makeRun({ runId: "current", status: "running", config: { chatId: "chat-a" } });
  const other = makeRun({
    runId: "other",
    status: "needs_input",
    statusMessage: "Private question",
    config: { chatId: "chat-b" },
  });
  const before = {
    ...useStore.getState(),
    runs: [current],
    mode: "conversation" as const,
    conversationId: "chat-a",
    railOpen: false,
    railView: { kind: "home" as const },
    conversationDrafts: { "chat:chat-a": "Keep this steer" },
  };
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
  const view = {
    mode: "conversation",
    overlay: null,
    conversationId: "chat",
    railOpen: false,
    railView: { kind: "home" },
    runs: [older, newer],
  };
  expect(foregroundRunId(view)).toBe("new");
  expect(
    foregroundRunId({ ...view, mode: "focus", railOpen: true, railView: { kind: "run", runId: "old" } }),
  ).toBe("old");
  expect(foregroundRunId({ ...view, overlay: "tasks" })).toBeNull();
});

it("offers a local notice preference and a keyboard-dismissible review banner", async () => {
  const initial = readInAppNoticePreference();
  const review = vi.fn();
  const dismiss = vi.fn();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <>
          <RunNoticePreference />
          <RunNoticeBanner
            notice={{
              kind: "question",
              runId: "r1",
              identity: "s1",
              title: "Aux needs your answer",
              body: "Open Aux to review a question.",
              tag: "aux-question-r1",
            }}
            onReview={review}
            onDismiss={dismiss}
          />
        </>,
      ),
    );
    const toggle = host.querySelector<HTMLButtonElement>(".run-notice-preference")!;
    await act(async () => toggle.click());
    expect(readInAppNoticePreference()).toBe(initial === "all" ? "off" : "all");
    const button = host.querySelector<HTMLButtonElement>(".run-notice-banner .primary")!;
    await act(async () =>
      button.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true })),
    );
    expect(dismiss).toHaveBeenCalledTimes(1);
    await act(async () => button.click());
    expect(review).toHaveBeenCalledWith("r1");
  } finally {
    await act(async () => root.unmount());
    host.remove();
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

it("routes focused and remapped notices to the current run and rejects hidden or retired controls", async () => {
  const review = vi.fn(() => ({ accepted: true }));
  const dismiss = vi.fn();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  const render = async (runId: string) =>
    act(async () =>
      root.render(
        <RunNoticeBanner
          notice={{
            kind: "question",
            runId,
            identity: runId,
            title: "Aux needs your answer",
            body: "Review this question.",
            tag: runId,
          }}
          onReview={review}
          onDismiss={dismiss}
        />,
      ),
    );
  try {
    await render("old");
    await expect(executeCommand("review-task-notice")).rejects.toThrow();
    const original = host.querySelector<HTMLButtonElement>(".primary")!;
    original.focus();
    await act(async () => expect(await executeCommand("review-task-notice")).toEqual({ accepted: true }));
    expect(review).toHaveBeenLastCalledWith("old");
    await render("new");
    host.querySelector<HTMLButtonElement>(".primary")!.focus();
    await act(async () =>
      expect(
        dispatchShortcut({ commandId: "review-task-notice", key: "r", meta: true, shift: true, alt: false }),
      ).toBe(true),
    );
    expect(review).toHaveBeenLastCalledWith("new");
    await act(async () => expect(await executeCommand("dismiss-task-notice")).toBeUndefined());
    expect(dismiss).toHaveBeenCalledTimes(1);
    host.hidden = true;
    await expect(executeCommand("review-task-notice")).rejects.toThrow();
    expect(review).toHaveBeenCalledTimes(2);
    host.hidden = false;
    await act(async () => root.unmount());
    await expect(executeCommand("review-task-notice")).rejects.toThrow();
  } finally {
    if (host.firstChild) await act(async () => root.unmount());
    host.remove();
  }
});

it("preserves original notice rejection and uses the latest saved local preference", async () => {
  const initial = readInAppNoticePreference();
  const reason = new Error("original review refusal");
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () =>
      root.render(
        <>
          <RunNoticePreference />
          <RunNoticeBanner
            notice={{
              kind: "question",
              runId: "r",
              identity: "r",
              title: "Question",
              body: "Review",
              tag: "r",
            }}
            onReview={() => {
              throw reason;
            }}
            onDismiss={() => {}}
          />
        </>,
      ),
    );
    host.querySelector<HTMLButtonElement>(".primary")!.focus();
    await act(async () => expect(executeCommand("review-task-notice")).rejects.toBe(reason));
    host.querySelector<HTMLButtonElement>(".run-notice-preference")!.focus();
    await act(async () => {
      writeInAppNoticePreference("off");
      await executeCommand("toggle-task-notices");
      expect(readInAppNoticePreference()).toBe("all");
      await executeCommand("toggle-task-notices");
      expect(readInAppNoticePreference()).toBe("off");
    });
  } finally {
    await act(async () => root.unmount());
    host.remove();
    writeInAppNoticePreference(initial);
  }
});

it("routes original system and Focus switches independently without granting OS permission", async () => {
  const initialSystem = readSystemTaskNotices(),
    initialFocus = readTaskFocusMode();
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  try {
    await act(async () => {
      writeSystemTaskNotices(false);
      writeTaskFocusMode(false);
      root.render(<TaskAttentionSettings />);
    });
    const system = host.querySelector<HTMLInputElement>('[aria-label="System task notifications"]')!;
    const focus = host.querySelector<HTMLInputElement>('[aria-label="Focus Mode"]')!;
    await act(async () => system.click());
    expect(readSystemTaskNotices()).toBe(true);
    expect(readTaskFocusMode()).toBe(false);
    expect(system.checked).toBe(true);
    focus.focus();
    await act(async () =>
      expect(
        dispatchShortcut({
          commandId: "toggle-task-focus-mode",
          key: "f",
          meta: true,
          shift: true,
          alt: false,
        }),
      ).toBe(true),
    );
    expect(readTaskFocusMode()).toBe(true);
    expect(readSystemTaskNotices()).toBe(true);
    expect(focus.checked).toBe(true);
    system.focus();
    host.hidden = true;
    await expect(executeCommand("toggle-system-task-notices")).rejects.toThrow();
    expect(readSystemTaskNotices()).toBe(true);
  } finally {
    await act(async () => root.unmount());
    host.remove();
    writeSystemTaskNotices(initialSystem);
    writeTaskFocusMode(initialFocus);
  }
});
