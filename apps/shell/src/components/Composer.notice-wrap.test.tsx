// @vitest-environment jsdom
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Conversation } from "./Conversation";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { makeRun } from "../mock/fixtures";
const initial = useStore.getState();
const instruction = `Review this original URL before answering:\nhttps://aux-owned.invalid/${"UnbrokenQuestion".repeat(40)}`;
const error = `This queued reply needs attention: ${"OriginalNativeDeliveryDiagnostic".repeat(30)}`;
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal("cancelAnimationFrame", () => {});
  HTMLElement.prototype.scrollIntoView = vi.fn();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "Conversation.css"), "utf8");
  const rules = css.match(
    /(?:\.composer-question p|\.composer-queue \.queued-message-state > span\[role="alert"\]) \{[^}]+\}/g,
  );
  assert.equal(rules?.length, 2);
  // Source rule/component checks only: jsdom does not establish native wrap geometry or pixels.
  style = document.createElement("style");
  style.textContent = rules!.join("\n");
  document.head.append(style);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
function source() {
  const run = makeRun({
    runId: "notice-run",
    config: { chatId: "notice-chat" },
    status: "needs_input",
    statusMessage: instruction,
    pageIds: [],
  });
  const message = {
    messageId: "original-queued",
    chatId: "notice-chat",
    targetRunId: run.runId,
    deliveryRunId: "next",
    mode: "queue",
    status: "needs_attention",
    error,
    text: "Original queued follow-up",
    pageIds: [],
    contextPageRefs: [],
    expectedRevision: 0,
    createdAt: 1,
    updatedAt: 1,
  };
  useStore.setState({
    runs: [run],
    steps: { [run.runId]: [] },
    pages: [],
    connected: true,
    prompt: null,
    pendingTurns: [],
    conversationDrafts: { "chat:notice-chat": "Kept separate follow-up" },
    runAnswerDrafts: { [run.runId]: { question: instruction, text: "Original answer" } },
  } as never);
  return vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list") return [run];
    if (method === "runs.get")
      return {
        run,
        suspension: {
          suspensionId: "original-suspension",
          runId: run.runId,
          turnId: run.runId,
          threadId: "original-thread",
          state: "pending",
          kind: "ask-user-question",
          request: { kind: "ask-user-question", instruction, guidance: "Keep the question intact." },
          createdAt: 1,
        },
        steps: [],
      };
    if (method === "runs.messages.list") return [message];
    if (method === "runs.message.cancel") return { ...message, status: "cancelled" };
    if (method === "conversations.get") return { title: "Original notice chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
}
it.each([false, true])(
  "preserves complete durable question and queued diagnostic in actual Conversation embedded=%s",
  async (embedded) => {
    const invoke = source();
    await act(async () => root.render(<Conversation chatId="notice-chat" embedded={embedded} />));
    const question = host.querySelector<HTMLElement>(".composer-question p")!;
    expect(question.textContent).toBe(instruction);
    expect(getComputedStyle(question).whiteSpace).toBe("pre-wrap");
    expect(getComputedStyle(question).overflowWrap).toBe("anywhere");
    const alert = host.querySelector<HTMLElement>('.composer-queue [role="alert"]')!;
    expect(alert.textContent).toBe(error);
    expect(getComputedStyle(alert).overflowWrap).toBe("anywhere");
    expect(getComputedStyle(alert).minWidth).toBe("0");
    const input = host.querySelector<HTMLTextAreaElement>('[aria-label="Reply to conversation"]')!;
    expect(input.value).toBe("Original answer");
    input.focus();
    expect(document.activeElement).toBe(input);
    expect(useStore.getState().conversationDrafts["chat:notice-chat"]).toBe("Kept separate follow-up");
    expect(invoke.mock.calls.some(([method]) => method === "runs.answer" || method === "runs.start")).toBe(
      false,
    );
  },
);
it("retains exact queued cancellation and editing while preserving the separate answer draft", async () => {
  const invoke = source();
  await act(async () => root.render(<Conversation chatId="notice-chat" embedded />));
  const button = (label: string) =>
    [...host.querySelectorAll<HTMLButtonElement>("button")].find((item) => item.textContent === label)!;
  await act(async () => button("Queue next").click());
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe("Kept separate follow-up");
  button("Edit").focus();
  expect(document.activeElement).toBe(button("Edit"));
  await act(async () => button("Edit").click());
  expect(invoke.mock.calls.filter(([method]) => method === "runs.message.cancel")).toEqual([
    ["runs.message.cancel", { messageId: "original-queued" }],
  ]);
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe(
    "Kept separate follow-up\n\nOriginal queued follow-up",
  );
  expect(useStore.getState().runAnswerDrafts["notice-run"]?.text).toBe("Original answer");
  expect(invoke.mock.calls.some(([method]) => method === "runs.answer" || method === "runs.start")).toBe(
    false,
  );
});
