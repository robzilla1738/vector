// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
it("keeps the complete original pending user question and its narrow wrap rule without creating a page", async () => {
  const question = `Please inspect this original URL:\nhttps://aux-owned.invalid/${"UnbrokenOriginalQuestion".repeat(40)}`;
  useStore.getState().setConversationDraft("original", question);
  let reject!: (reason: Error) => void;
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
  const message = host.querySelector<HTMLElement>(".conversation-turn.pending .user-message")!;
  expect(message.textContent).toBe(question);
  expect(useStore.getState().pendingTurns[0]?.goal).toBe(question);
  expect(useStore.getState().pages).toEqual([]);
  const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../styles/workspace.css"), "utf8");
  const rule = css.match(/^\.user-message \{[^}]+\}/m)?.[0];
  expect(rule).toContain("max-width: min(78%, 420px)");
  const style = document.createElement("style");
  style.textContent = rule!;
  document.head.append(style);
  // Actual component/source checks; jsdom cannot establish painted native geometry.
  expect(getComputedStyle(message).whiteSpace).toBe("pre-wrap");
  expect(getComputedStyle(message).overflowWrap).toBe("anywhere");
  style.remove();
  const error = new Error("Original transport refusal");
  await act(async () => reject(error));
  expect(useStore.getState().pendingTurns).toEqual([]);
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe(question);
  expect(host.querySelector<HTMLTextAreaElement>("textarea")!.value).toBe(question);
  expect(host.querySelector('[role="alert"]')?.textContent).toContain("Your reply is kept.");
  expect(useStore.getState().pages).toEqual([]);
  expect(useStore.getState().runs).toEqual([]);
});
