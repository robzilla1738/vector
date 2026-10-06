import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { act, useRef, type ComponentProps } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { CommandSurface } from "./CommandSurface";
import { openCommandSurface, useCommandSurfaceRequest } from "../command-surface-state";
import { Conversation } from "./Conversation";
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

const DeferredConversation = deferSurface<NonNullable<ComponentProps<typeof Conversation>>>(
  async () => ({ default: Conversation }),
  "Conversation",
  true,
);
function PaletteShell() {
  const composerRef = useRef<HTMLTextAreaElement>(null);
  const overlay = useStore((state) => state.overlay),
    mode = useStore((state) => state.mode);
  const request = useCommandSurfaceRequest();
  return (
    <>
      <button
        aria-label="Original palette"
        onClick={() => {
          useStore.getState().setMode("focus");
          openCommandSurface({ mode: "command", seed: "Bookmarks and history" });
        }}
      >
        Commands
      </button>
      <button aria-label="Original New chat" onClick={() => void executeCommand("new-chat")}>
        New chat
      </button>
      <button aria-label="Newer external owner">Outside</button>
      {mode === "conversation" && (
        <div inert={!!overlay}>
          <DeferredConversation composerRef={composerRef} />
        </div>
      )}
      {request && <CommandSurface request={request} executeCommand={executeCommand} />}
      {overlay === "bookmarks" && <DeferredLibrary />}
    </>
  );
}
it.each([false, true])(
  "registered palette Library to fresh New chat keeps draft/focus (scrim dismissal first: %s)",
  async (dismissFirst) => {
    useStore.setState({
      mode: "conversation",
      overlay: null,
      focusRequest: 0,
      focusSlot: "toolbar",
      bookmarks: [],
    });
    await act(async () => root.render(<PaletteShell />));
    const initialInput = host.querySelector<HTMLTextAreaElement>(
      'textarea[aria-label="Reply to conversation"]',
    )!;
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Original palette"]')!.click());
    expect(initialInput.isConnected).toBe(false);
    const command = host.querySelector<HTMLInputElement>(".command-surface input")!;
    expect(command).not.toBeNull();
    await act(async () =>
      command.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })),
    );
    expect(host.querySelector('[aria-label="Library"]')).not.toBeNull();
    if (dismissFirst)
      await act(async () =>
        host
          .querySelector<HTMLElement>(".overlay-scrim")!
          .dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true })),
      );
    expect(useStore.getState().focusRequest).toBe(0);
    expect(useStore.getState().overlay).toBe(dismissFirst ? null : "bookmarks");
    await act(async () => host.querySelector<HTMLButtonElement>('[aria-label="Original New chat"]')!.click());
    const input = host.querySelector<HTMLTextAreaElement>('textarea[aria-label="Reply to conversation"]')!;
    expect(input).not.toBe(initialInput);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("Original page-free question");
    expect(orderedPages(useStore.getState().pages)).toEqual([]);
  },
);
