import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import HomeAsk from "./HomeAsk";
import { Conversation } from "./Conversation";
import { bridge } from "../bridge";
import { useStore } from "../store";
const initial = useStore.getState();
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
  const menu = readFileSync("apps/shell/src/components/ConversationContextMenu.css", "utf8"),
    conversation = readFileSync("apps/shell/src/components/Conversation.css", "utf8");
  const hit = readFileSync("apps/shell/src/tokens.css", "utf8").match(/--hit:\s*(\d+px)/)![1]!;
  const opener = menu.match(/\.home-tools-trigger > button\s*\{[^}]+\}/)![0];
  const narrow = conversation.match(/\.composer-send-actions \.dictation-trigger\s*\{[^}]+\}/)![0];
  // Source-selected narrow rule activation; jsdom does not implement physical container queries.
  style.textContent = [opener, narrow].join("\n").replaceAll("var(--hit)", hit);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  style.remove();
  useStore.setState(initial, true);
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
it("keeps the page-free Add context opener's label, draft and modal focus at the established target", async () => {
  await act(async () => root.render(<HomeAsk onSearch={vi.fn()} />));
  const input = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')!,
    opener = host.querySelector<HTMLButtonElement>('.home-tools-trigger > button[aria-label="Add context"]')!;
  expect(input.value).toBe("Original page-free question");
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
  expect(getComputedStyle(opener).width).toBe("32px");
  expect(getComputedStyle(opener).height).toBe("32px");
  opener.focus();
  expect(document.activeElement).toBe(opener);
  await act(async () => opener.click());
  const dialog = document.querySelector<HTMLDialogElement>('dialog[aria-label="Add context"]')!;
  expect(dialog.open).toBe(true);
  expect(dialog.contains(document.activeElement)).toBe(true);
  await act(async () => dialog.dispatchEvent(new Event("cancel", { bubbles: false, cancelable: true })));
  expect(document.activeElement).toBe(opener);
  expect(input.value).toBe("Original page-free question");
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
  expect(bridge.startDictation).not.toHaveBeenCalled();
  const selector = readFileSync("apps/shell/src/components/Conversation.css", "utf8").match(
    /(\.home-tools-trigger > button[^,{]+):hover \{/,
  )![1]!;
  expect(opener.matches(selector)).toBe(true);
  opener.disabled = true;
  expect(opener.matches(selector)).toBe(false);
  opener.disabled = false;
});
it("retains original disabled Dictate and glyph while the actual narrow footer target remains32", async () => {
  await act(async () => root.render(<Conversation chatId="archived-fixture" embedded />));
  const dictation = host.querySelector<HTMLButtonElement>(".composer-send-actions .dictation-trigger")!;
  expect(dictation.textContent).toContain("Dictate");
  expect(dictation.disabled).toBe(true);
  expect(getComputedStyle(dictation).width).toBe("32px");
  expect(getComputedStyle(dictation).height).toBe("32px");
  expect(getComputedStyle(dictation).minWidth).toBe("32px");
  expect(dictation.querySelector("svg")!.getAttribute("width")).toBe("15");
  expect(dictation.querySelector("svg")!.getAttribute("height")).toBe("15");
  await act(async () => dictation.click());
  expect(bridge.startDictation).not.toHaveBeenCalled();
});
