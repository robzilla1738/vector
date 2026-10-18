// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { MentionRef, Run, Suspension } from "@aux/contracts";
import { Conversation } from "./Conversation";
import { makePage, makeRun } from "../mock/fixtures";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { normalizePages } from "../store/pages";
import { sourceRef } from "../browser-context-sources";
import { writeMentionDraft, clearMentionDraft, mentionComposerId } from "../mentions/drafts";
const initial = useStore.getState(),
  originalKind = bridge.windowKind,
  originalWindow = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
const page = makePage(0, {
  pageId: "main-page",
  windowId: "main-window",
  windowKind: "normal",
  url: "https://example.test/",
  sessionId: "read-session",
});
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, run: Run, suspension: Suspension | null;
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
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  bridge.windowKind = "quick-ask";
  bridge.windowId = "quick-window";
  run = makeRun({
    runId: "original-run",
    status: "running",
    pageIds: [page.pageId],
    config: { chatId: "original-chat", contextPageRefs: [sourceRef(page)], messageRevision: 2 },
  });
  suspension = null;
  useStore.setState(
    {
      ...initial,
      runs: [run],
      steps: { [run.runId]: [] },
      pages: normalizePages([page]),
      connected: true,
      pendingTurns: [],
      prompt: null,
      toasts: [],
      conversationDrafts: { "chat:original-chat": "Original follow-up" },
      conversationContexts: {},
      conversationBrowserSources: {},
      settings: { ...initial.settings, followUpBehavior: "queue" },
    },
    true,
  );
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    if (method === "runs.list") return [run];
    if (method === "runs.get") return { run, suspension, steps: [] };
    if (method === "runs.messages.list") return [];
    if (method === "runs.messages.order")
      return { chatId: "original-chat", revision: "f".repeat(64), messageIds: [] };
    if (method === "conversations.get") return { title: "Original", archived: false };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    if (method === "runs.queue" || method === "runs.steer")
      return { ...params, status: "accepted", createdAt: 1, updatedAt: 1 };
    return { workspace: null, memory: null };
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  clearMentionDraft(mentionComposerId("original-chat"));
  clearMentionDraft(mentionComposerId("original-chat", run.runId));
  bridge.windowKind = originalKind;
  bridge.windowId = originalWindow;
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll);
  else Reflect.deleteProperty(HTMLElement.prototype, "scrollIntoView");
});
async function render() {
  await act(async () =>
    root.render(<Conversation chatId="original-chat" embedded quickAsk={{ onExpand: vi.fn() }} />),
  );
}
async function send() {
  const button = host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!;
  expect(button.disabled).toBe(false);
  await act(async () => button.click());
}
const ref: MentionRef = {
  kind: "tab",
  pageId: page.pageId,
  url: page.url,
  documentEpoch: page.documentEpoch,
  sessionId: page.sessionId!,
  access: "read",
  title: page.title,
};
it.each(["queue", "steer", "answer"] as const)(
  "keeps a saved tab/group mention out of the real Quick Ask %s producer before acknowledgement",
  async (mode) => {
    const answering = mode === "answer";
    if (answering) {
      run = { ...run, status: "needs_input", statusMessage: "Which source?" };
      suspension = {
        suspensionId: "original-question",
        runId: run.runId,
        turnId: run.runId,
        threadId: "thread",
        state: "pending",
        kind: "ask-user-question",
        request: { kind: "ask-user-question", instruction: "Which source?", guidance: "Choose" },
        createdAt: 1,
      };
      useStore.setState({
        runs: [run],
        runAnswerDrafts: { [run.runId]: { question: run.statusMessage!, text: "@Source " } },
      });
    } else
      useStore.setState({
        settings: { ...initial.settings, followUpBehavior: mode },
        conversationDrafts: { "chat:original-chat": "@Source " },
      });
    const selected: MentionRef =
      mode === "steer"
        ? {
            kind: "group",
            groupId: "original-group",
            members: [
              {
                pageId: page.pageId,
                url: page.url,
                title: page.title,
                documentEpoch: page.documentEpoch,
                sessionId: page.sessionId!,
                access: "read",
              },
            ],
          }
        : ref;
    writeMentionDraft(mentionComposerId("original-chat", answering ? run.runId : undefined), {
      text: "@Source ",
      tokens: [{ start: 0, end: 7, text: "@Source", ref: selected }],
    });
    await render();
    await send();
    for (const method of ["runs.queue", "runs.steer", "runs.answer", "browser.recovery.list", "runs.start"])
      expect(bridge.invoke).not.toHaveBeenCalledWith(method, expect.anything());
    expect(host.textContent).toContain("Open in Aux to use browser tabs");
    expect(
      host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')?.value,
    ).toBe("@Source ");
    expect(
      answering
        ? useStore.getState().runAnswerDrafts[run.runId]?.text
        : useStore.getState().conversationDrafts["chat:original-chat"],
    ).toBe("@Source ");
  },
);
it.each(["primary", "additional"] as const)(
  "preserves an explicit saved %s browser selection rather than silently queueing without it",
  async (kind) => {
    useStore.setState(
      kind === "primary"
        ? { conversationContexts: { "chat:original-chat": page.pageId } }
        : { conversationBrowserSources: { "chat:original-chat": [sourceRef(page)] } },
    );
    await render();
    await send();
    expect(bridge.invoke).not.toHaveBeenCalledWith("runs.queue", expect.anything());
    expect(bridge.invoke).not.toHaveBeenCalledWith("runs.steer", expect.anything());
    expect(useStore.getState().conversationDrafts["chat:original-chat"]).toBe("Original follow-up");
    expect(host.textContent).toContain("Open in Aux to use browser tabs");
  },
);
it("queues plain text with inherited original-run pages without inventing a new Quick Ask source choice", async () => {
  await render();
  await send();
  expect(bridge.invoke).toHaveBeenCalledWith(
    "runs.queue",
    expect.objectContaining({
      runId: run.runId,
      text: "Original follow-up",
      pageIds: run.pageIds,
      contextPageRefs: run.config?.contextPageRefs,
      mentions: [],
    }),
  );
  expect(useStore.getState().conversationDrafts["chat:original-chat"] ?? "").toBe("");
});
