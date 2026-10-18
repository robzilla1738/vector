// @vitest-environment jsdom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { normalizePages } from "../store/pages";
import { makePage } from "../mock/fixtures";
vi.mock("../bridge", async (original) => {
  const actual = await original<typeof import("../bridge")>();
  return {
    ...actual,
    inNativeHost: true,
    bridge: { ...actual.bridge, windowId: "quick-context", windowKind: "quick-ask" },
  };
});
import { bridge } from "../bridge";
import { useStore } from "../store";
import { QuickAsk } from "./QuickAsk";
import { executeCommand } from "../commands";
const initial = useStore.getState();
const originalScroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: Root;
const frames = new Map<number, FrameRequestCallback>();
const expand = vi.fn();
async function flushFrames() {
  await act(async () => {
    for (let i = 0; frames.size && i < 8; i++) {
      const batch = [...frames.values()];
      frames.clear();
      for (const callback of batch) callback(0);
    }
  });
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  frames.clear();
  let nextFrame = 0;
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    frames.set(++nextFrame, callback);
    return nextFrame;
  });
  vi.stubGlobal("cancelAnimationFrame", (id: number) => frames.delete(id));
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 440, height: 30 },
  ] as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockImplementation(function (this: HTMLElement) {
    return this instanceof HTMLDialogElement ? 280 : 32;
  });
  HTMLElement.prototype.scrollIntoView = vi.fn();
  const page = makePage(0, {
    url: "https://example.test/context",
    title: "Original browser source",
    windowId: "original-browser",
  });
  useStore.setState(
    {
      ...initial,
      runs: [],
      steps: {},
      connected: true,
      pages: normalizePages([page]),
      activePageId: page.pageId,
      conversationId: "quick-chat",
      conversationDrafts: { "chat:quick-chat": "Keep Quick Ask draft" },
      conversationContexts: { "chat:quick-chat": "none" },
      pendingTurns: [],
      prompt: null,
      toasts: [],
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "quickAskLayout").mockResolvedValue(true);
  vi.spyOn(bridge, "quickAsk").mockResolvedValue(true);
  vi.spyOn(bridge, "invoke").mockImplementation(async (method) => {
    if (method === "runs.list" || method === "runs.messages.list" || method === "browser.recovery.list")
      return [];
    if (method === "pages.list") return [page];
    if (method === "conversations.get") return { title: "Original Quick Ask draft", archived: false };
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
  expand.mockReset();
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  if (originalScroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", originalScroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const add = () => host.querySelector<HTMLButtonElement>('[aria-label="Add context"]')!;
const dialog = (label: string) => document.querySelector<HTMLDialogElement>(`dialog[aria-label="${label}"]`)!;
async function escape(node: HTMLElement) {
  await act(async () =>
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  await flushFrames();
}
it("opens Quick Ask context with truthful browser handback, restores focus and retains its draft/92px empty layout", async () => {
  await act(async () => root.render(<QuickAsk onExpand={expand} />));
  await flushFrames();
  const input = host.querySelector("textarea")!,
    opener = add();
  expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 92 });
  await act(async () => {
    opener.focus();
    opener.click();
  });
  await flushFrames();
  expect(dialog("Add context").open).toBe(true);
  expect(opener.getAttribute("aria-expanded")).toBe("true");
  expect(vi.mocked(bridge.quickAskLayout).mock.calls.at(-1)![0].draftHeight).toBeGreaterThan(92);
  expect(dialog("Add context").querySelector('[aria-label="Browser context"]')).toBeNull();
  expect(
    dialog("Add context").querySelector('[data-command-id="open-quick-ask-browser-context"]'),
  ).not.toBeNull();
  expect(useStore.getState().conversationContexts["chat:quick-chat"]).toBe("none");
  await escape(dialog("Add context"));
  expect(dialog("Add context")).toBeNull();
  expect(document.activeElement).toBe(opener);
  expect(host.querySelector("textarea")).toBe(input);
  expect(input.value).toBe("Keep Quick Ask draft");
  expect(bridge.quickAskLayout).toHaveBeenLastCalledWith({ conversation: false, draftHeight: 92 });
  expect(bridge.quickAsk).not.toHaveBeenCalledWith("dismiss");
  expect(expand).not.toHaveBeenCalled();
  await expect(executeCommand("select-conversation-steer")).rejects.toThrow();
});
it("offers a concrete Open in Aux path while keeping unsupported on-page lasso disabled", async () => {
  await act(async () => root.render(<QuickAsk onExpand={expand} />));
  await flushFrames();
  await act(async () => add().click());
  await flushFrames();
  const popup = dialog("Add context");
  const lasso = popup.querySelector<HTMLButtonElement>(
    '[data-command-id="select-conversation-image-region"]',
  )!;
  expect(lasso.disabled).toBe(true);
  expect(lasso.title).toContain("Open in Aux");
  const open = popup.querySelector<HTMLButtonElement>('[data-command-id="open-quick-ask-browser-context"]')!;
  await act(async () => open.click());
  expect(expand).toHaveBeenCalledTimes(1);
  expect(dialog("Add context")).toBeNull();
  expect(useStore.getState().conversationDrafts["chat:quick-chat"]).toBe("Keep Quick Ask draft");
});
