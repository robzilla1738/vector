import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Conversation } from "./Conversation";
import { Tasks } from "./Tasks";
import { Library } from "./Library";
import { deferSurface } from "./DeferredSurface";
import { executeCommand } from "../commands";
import { bridge } from "../bridge";
import { useStore } from "../store";
vi.mock("./TaskResources", () => ({ TaskResources: () => null }));
vi.mock("./CalendarTaskGrants", () => ({ CalendarTaskGrants: () => null }));
vi.mock("./Routines", () => ({ Routines: () => null }));
vi.mock("./Goals", () => ({ Goals: () => null }));
vi.mock("./Hooks", () => ({ Hooks: () => null }));
const DeferredTasks = deferSurface(async () => ({ default: Tasks }), "Tasks");
const DeferredLibrary = deferSurface(async () => ({ default: Library }), "Library");
const initial = useStore.getState();
const modal = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal"),
  close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close"),
  scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView"),
  scrollTo = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollTo");
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
  Object.defineProperty(HTMLElement.prototype, "scrollTo", { configurable: true, value: vi.fn() });
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
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
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
    return [] as never;
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
  style = document.createElement("style");
  document.head.append(style);
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
    [HTMLElement.prototype, "scrollTo", scrollTo],
  ] as const) {
    if (descriptor) Object.defineProperty(prototype, key, descriptor);
    else Reflect.deleteProperty(prototype, key);
  }
});

function Shell({ surface }: { surface: "Tasks" | "Library" }) {
  const overlay = useStore((state) => state.overlay);
  const selected = surface === "Tasks" ? "tasks" : "bookmarks";
  return (
    <>
      <button
        aria-label="Original surface opener"
        onClick={() => void executeCommand(surface === "Tasks" ? "open-tasks" : "command-bookmarks")}
      >
        {surface}
      </button>
      <button aria-label="Original New chat" onClick={() => void executeCommand("new-chat")}>
        New chat
      </button>
      <button aria-label="External newer owner">External newer owner</button>
      <div inert={overlay === selected}>
        <Conversation />
      </div>
      {overlay === selected && (surface === "Tasks" ? <DeferredTasks /> : <DeferredLibrary />)}
    </>
  );
}
async function mount(surface: "Tasks" | "Library") {
  useStore.setState({
    mode: "conversation",
    overlay: null,
    focusRequest: 0,
    focusSlot: "toolbar",
    runs: [],
    pendingTurns: [],
    conversationId: null,
    bookmarks: [],
  });
  await act(async () => root.render(<Shell surface={surface} />));
}
const input = () => host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')!;
const opener = () => host.querySelector<HTMLButtonElement>('[aria-label="Original surface opener"]')!;
async function open(surface: "Tasks" | "Library") {
  opener().focus();
  await act(async () => opener().click());
  expect(host.querySelector(`[aria-label="${surface}"]`)).not.toBeNull();
}
it.each(["Tasks", "Library"] as const)(
  "%s to registered New chat retains original composer and draft focus",
  async (surface) => {
    await mount(surface);
    const original = input();
    await open(surface);
    expect(document.activeElement).not.toBe(original);
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Original New chat"]')!.click());
    expect(useStore.getState().overlay).toBeNull();
    expect(input()).toBe(original);
    expect(document.activeElement).toBe(original);
    expect(original.value).toBe("Original page-free question");
    expect(orderedPages(useStore.getState().pages)).toEqual([]);
  },
);
it.each(["Tasks", "Library"] as const)("ordinary %s Close restores its original opener", async (surface) => {
  await mount(surface);
  await open(surface);
  const close = host.querySelector<HTMLButtonElement>(
    `[aria-label="${surface === "Tasks" ? "Close tasks" : "Close library"}"]`,
  )!;
  expect(close).not.toBeNull();
  await act(async () => close.click());
  expect(useStore.getState().overlay).toBeNull();
  expect(document.activeElement).toBe(opener());
  expect(useStore.getState().focusRequest).toBe(0);
});
it.each(["Tasks", "Library"] as const)(
  "%s retirement preserves original newer outside focus",
  async (surface) => {
    await mount(surface);
    await open(surface);
    const external = host.querySelector<HTMLButtonElement>('[aria-label="External newer owner"]')!;
    await act(async () => {
      external.focus();
      useStore.getState().setOverlay(null);
    });
    expect(document.activeElement).toBe(external);
    expect(input().value).toBe("Original page-free question");
  },
);
it.each(["Tasks", "Library"] as const)(
  "%s retirement preserves connected newer modal focus",
  async (surface) => {
    await mount(surface);
    await open(surface);
    const dialog = document.createElement("dialog"),
      button = document.createElement("button");
    button.textContent = "Original newer modal";
    dialog.append(button);
    document.body.append(dialog);
    try {
      await act(async () => {
        dialog.showModal();
        useStore.getState().setOverlay(null);
      });
      expect(document.activeElement).toBe(button);
      expect(dialog.isConnected).toBe(true);
    } finally {
      dialog.close();
      dialog.remove();
    }
  },
);
