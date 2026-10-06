// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { beforeEach, afterEach, expect, it, vi } from "vitest";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { Conversation } from "./Conversation";
let root: ReturnType<typeof createRoot>, host: HTMLDivElement;
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
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
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({
    connected: true,
    settings: { modelConfigured: true },
    pages: [],
    runs: [],
    pendingTurns: [],
    conversationId: "original",
    toasts: [],
    conversationDrafts: { "chat:original": "Original question", "chat:other": "Other question" },
  });
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "runs.messages.list") return [];
    if (method === "conversations.get") return { title: "Original chat", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
it.each(["same", "new-draft", "other-chat"])(
  "actual owning store delivers original start failure to composer (%s)",
  async (scenario) => {
    const realStart = useStore.getState().startRun;
    let reject!: (reason: Error) => void;
    const originalError = new Error(
      "The original selected browser tab changed. Review its context before sending.",
    );
    const invoke = vi.mocked(bridge.invoke),
      fallback = invoke.getMockImplementation()!;
    invoke.mockImplementation((method, params) =>
      method === "runs.start"
        ? new Promise((_resolve, fail) => {
            reject = fail;
          })
        : fallback(method, params),
    );
    await act(async () => root.render(<Conversation chatId="original" />));
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.click());
    expect(useStore.getState().startRun).toBe(realStart);
    expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toHaveLength(1);
    expect(useStore.getState().pendingTurns).toMatchObject([
      { goal: "Original question", chatId: "original" },
    ]);
    expect(useStore.getState().conversationDrafts["chat:original"] ?? "").toBe("");
    if (scenario === "new-draft")
      await act(async () => useStore.getState().setConversationDraft("original", "New question"));
    if (scenario === "other-chat") await act(async () => root.render(<Conversation chatId="other" />));
    await act(async () => reject(originalError));
    const stayed = scenario !== "other-chat",
      alert = host.querySelector('[role="alert"]'),
      details = alert?.parentElement?.querySelector("details");
    expect(alert?.textContent ?? null).toBe(
      stayed ? "Your message couldn’t be sent. Try sending it again. Your reply is kept." : null,
    );
    expect(details?.textContent ?? null).toBe(stayed ? `Details${originalError.message}` : null);
    expect(details?.open ?? null).toBe(stayed ? false : null);
    expect(useStore.getState().pendingTurns).toEqual([]);
    expect(useStore.getState().runs).toEqual([]);
    expect(useStore.getState().pages).toEqual([]);
    expect(useStore.getState().toasts).toEqual([]);
    expect(useStore.getState().conversationDrafts["chat:original"]).toBe(
      scenario === "new-draft" ? "New question" : "Original question",
    );
    expect(useStore.getState().conversationDrafts["chat:other"]).toBe("Other question");
    expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe(
      scenario === "other-chat"
        ? "Other question"
        : scenario === "new-draft"
          ? "New question"
          : "Original question",
    );
    expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!.disabled).toBe(false);
  },
);
it("ordinary store caller retains null, toast and its owned draft recovery", async () => {
  vi.mocked(bridge.invoke).mockRejectedValue(new Error("original runtime refusal"));
  const result = await useStore
    .getState()
    .startRun("Ordinary question", { chatId: "original", pageId: null, scope: "new" });
  expect(result).toBeNull();
  expect(useStore.getState().pendingTurns).toEqual([]);
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe("Ordinary question");
});
