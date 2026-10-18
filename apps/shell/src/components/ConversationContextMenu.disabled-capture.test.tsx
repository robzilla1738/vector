import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomeAsk from "./HomeAsk";
import { Conversation } from "./Conversation";
import { makePage } from "../mock/fixtures";
import { draftKey } from "../conversation-drafts";
import { bridge } from "../bridge";
import { useStore } from "../store";
const initial = useStore.getState();
const originalKind = bridge.windowKind,
  originalWindow = bridge.windowId;
const modal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"),
  close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
  scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, style: HTMLStyleElement;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
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
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = true;
      this.querySelector<HTMLElement>("button,input")?.focus();
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.open = false;
    },
  });
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  useStore.setState({
    agentDraft: "Original page-free question",
    railOpen: false,
    runs: [],
    pendingTurns: [],
    pages: normalizePages([]),
    connected: true,
    conversationId: null,
  });
  vi.spyOn(bridge, "focusShell").mockResolvedValue(null);
  vi.spyOn(bridge, "dictationStatus").mockResolvedValue({ available: true });
  vi.spyOn(bridge, "startDictation");
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "conversations.list" || method === "runs.messages.list")
      return [] as never;
    if (method === "conversations.get") return { title: "Archived original", archived: true } as never;
    if (method === "conversations.artifacts.get") return { artifacts: [] } as never;
    if (method === "conversations.images.get") return { images: [] } as never;
    if (method === "conversations.attachments.get") return { attachments: [] } as never;
    if (method === "conversations.sources.get") return { sources: [] } as never;
    if (method === "runs.context.get") return { entries: [], historyEnabled: true } as never;
    return { workspace: null, memory: null } as never;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  style = document.createElement("style");
  document.head.append(style);
  const menu = readFileSync("apps/shell/src/components/ConversationContextMenu.css", "utf8");
  // Keep the actual menu rules; jsdom does not implement their enclosing layer.
  style.textContent = menu.replace(/^@layer components\s*\{\s*/, "").replace(/\}\s*$/, "");
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  useStore.setState(initial, true);
  bridge.windowKind = originalKind;
  bridge.windowId = originalWindow;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  for (const [prototype, key, descriptor] of [
    [HTMLDialogElement.prototype, "showModal", modal],
    [HTMLDialogElement.prototype, "close", close],
    [HTMLElement.prototype, "scrollIntoView", scroll],
  ] as const) {
    if (descriptor) Object.defineProperty(prototype, key, descriptor);
    else Reflect.deleteProperty(prototype, key);
  }
});
it("distinguishes unavailable page capture from enabled attachments in the real page-free menu", async () => {
  await act(async () => root.render(<HomeAsk onSearch={vi.fn()} />));
  const input = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')!,
    opener = host.querySelector<HTMLButtonElement>('.home-tools-trigger > button[aria-label="Add context"]')!;
  await act(async () => opener.click());
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Add context"]')!;
  const button = (command: string) =>
    dialog.querySelector<HTMLButtonElement>(`[data-command-id="${command}"]`)!;
  const capture = button("capture-conversation-page"),
    region = button("select-conversation-image-region"),
    image = button("choose-conversation-image"),
    documentButton = button("attach-conversation-document");
  expect(capture.textContent).toBe("Capture");
  expect(region.textContent).toBe("Select area");
  expect(capture.disabled).toBe(true);
  expect(region.disabled).toBe(true);
  expect(capture.title).not.toBe("");
  expect(region.title).toBe("Show this page by itself to select an area");
  expect(image.disabled).toBe(false);
  expect(documentButton.disabled).toBe(false);
  const selector = readFileSync("apps/shell/src/components/ConversationContextMenu.css", "utf8").match(
    /(\.home-tools-menu \.capture-triggers > button[^{}]*):hover\s*\{/,
  )![1]!;
  expect(image.matches(selector)).toBe(true);
  expect(documentButton.matches(selector)).toBe(true);
  expect(capture.matches(selector)).toBe(false);
  expect(region.matches(selector)).toBe(false);
  documentButton.focus();
  expect(document.activeElement).toBe(documentButton);
  await act(async () => capture.click());
  expect(dialog.open).toBe(true);
  expect(input.value).toBe("Original page-free question");
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
  expect(bridge.invoke).not.toHaveBeenCalledWith("images.capture", expect.anything());
  await act(async () => dialog.dispatchEvent(new Event("cancel", { bubbles: false, cancelable: true })));
  expect(document.activeElement).toBe(opener);
  expect(input.value).toBe("Original page-free question");
});

it("hands the real Quick Ask composer to existing expansion with its draft intact and no page read", async () => {
  bridge.windowKind = "quick-ask";
  bridge.windowId = "original-quick-window";
  const source = makePage(0, {
    pageId: "main-source",
    windowId: "main-window",
    windowKind: "normal",
    url: "https://example.test/",
    sessionId: "main-session",
  });
  useStore.setState({
    pages: normalizePages([source]),
    conversationContexts: { new: source.pageId },
    activePageId: source.pageId,
  });
  const expand = vi.fn();
  await act(async () => root.render(<Conversation embedded quickAsk={{ onExpand: expand }} />));
  const send = host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')!;
  expect(send.disabled).toBe(false);
  await act(async () => send.click());
  expect(host.textContent).toContain("Open in Aux to use browser tabs");
  expect(bridge.invoke).not.toHaveBeenCalledWith("browser.recovery.list", expect.anything());
  expect(bridge.invoke).not.toHaveBeenCalledWith("pages.capture", expect.anything());
  expect(bridge.invoke).not.toHaveBeenCalledWith("runs.start", expect.anything());
  expect(useStore.getState().agentDraft).toBe("Original page-free question");
  const handback = host.querySelector<HTMLButtonElement>(
    '[data-command-id="open-quick-ask-browser-context"]',
  )!;
  await act(async () => handback.click());
  expect(expand).toHaveBeenCalledOnce();
  const state = useStore.getState();
  expect(state.conversationId).toBeTruthy();
  expect(state.conversationDrafts[draftKey(state.conversationId!)]).toBe("Original page-free question");
  expect(state.conversationContexts[draftKey(state.conversationId!)]).toBe(source.pageId);
});
