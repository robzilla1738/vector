import { normalizePages, orderedPages } from "../store/pages";
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
  Object.defineProperty(HTMLElement.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  useStore.setState({
    connected: true,
    settings: { modelConfigured: true },
    pages: normalizePages([]),
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
it("keeps raw restored-history diagnostics in one closed Details panel, then retries without a tab or new run", async () => {
  const failure = new Error("not_found: pageUUID 9a813723-3967-4a04-89e4-fda886915433");
  const invoke = vi.mocked(bridge.invoke),
    fallback = invoke.getMockImplementation()!;
  let failed = true;
  invoke.mockImplementation((method, params) =>
    method === "runs.list" && failed ? Promise.reject(failure) : fallback(method, params),
  );
  await act(async () => root.render(<Conversation chatId="original" />));
  const alerts = host.querySelectorAll('[role="alert"]');
  expect(alerts).toHaveLength(1);
  expect(alerts[0]?.textContent).toBe("Conversation history couldn’t be loaded. Your draft is kept.");
  const details = alerts[0]?.parentElement?.querySelector("details");
  expect(details?.textContent).toBe(`Details${String(failure)}`);
  expect(details?.open).toBe(false);
  expect(useStore.getState().toasts).toEqual([]);
  expect(host.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe("Original question");
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')?.disabled).toBe(true);
  const retry = [...host.querySelectorAll<HTMLButtonElement>("button")].filter(
    (button) => button.textContent === "Try again",
  );
  expect(retry).toHaveLength(1);
  failed = false;
  await act(async () => retry[0]!.click());
  expect(invoke.mock.calls.filter(([method]) => method === "runs.list")).toHaveLength(2);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.querySelector("details")).toBeNull();
  expect(host.querySelector<HTMLButtonElement>('[aria-label="Send message"]')?.disabled).toBe(false);
  expect(host.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe("Original question");
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
  expect(useStore.getState().runs).toEqual([]);
  expect(invoke.mock.calls.filter(([method]) => method === "runs.start")).toEqual([]);
});
it("does not deliver an old history rejection into a different restored chat", async () => {
  let reject!: (reason: Error) => void;
  const invoke = vi.mocked(bridge.invoke),
    fallback = invoke.getMockImplementation()!;
  invoke.mockImplementation((method, params) =>
    method === "runs.list" && (params as { chatId?: string }).chatId === "original"
      ? new Promise((_resolve, fail) => {
          reject = fail;
        })
      : fallback(method, params),
  );
  await act(async () => root.render(<Conversation chatId="original" />));
  await act(async () => root.render(<Conversation chatId="other" />));
  await act(async () => reject(new Error("not_found: old pageUUID")));
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(host.textContent).not.toContain("old pageUUID");
  expect(host.querySelector<HTMLTextAreaElement>("textarea")?.value).toBe("Other question");
  expect(useStore.getState().conversationDrafts["chat:original"]).toBe("Original question");
  expect(useStore.getState().toasts).toEqual([]);
});
it("a fresh no-tab chat does not request history or present a transport error", async () => {
  await act(async () => root.render(<Conversation chatId={null} />));
  expect(vi.mocked(bridge.invoke).mock.calls.filter(([method]) => method === "runs.list")).toEqual([]);
  expect(host.querySelector('[role="alert"]')).toBeNull();
  expect(orderedPages(useStore.getState().pages)).toEqual([]);
  expect(useStore.getState().toasts).toEqual([]);
});
