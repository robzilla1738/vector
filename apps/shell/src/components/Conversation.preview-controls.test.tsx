import { normalizePages, orderedPages } from "../store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage, makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";

vi.mock("../bridge", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../bridge")>()),
  inMock: true,
}));

const initial = useStore.getState(),
  windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 100 },
  ] as unknown as DOMRectList);
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1100);
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
  const pages = [0, 1].map((index) =>
    makePage(index, {
      windowId,
      url: `http://127.0.0.1:3210/source-${index}`,
      title: `Original source ${index}`,
    }),
  );
  const layout = {
    ...initial.layout,
    activeSpaceId: initial.layout.spaces[0]!.id,
    tabSpace: Object.fromEntries(pages.map((page) => [page.pageId, initial.layout.spaces[0]!.id])),
    splitGroups: [],
  };
  const runs = ["a", "b"].map((chat) =>
    makeRun({
      runId: `run-${chat}`,
      goal: `Original ${chat}`,
      config: { chatId: chat },
      pageIds: [],
      status: "completed",
    }),
  );
  useStore.setState(
    {
      ...initial,
      runs,
      steps: {},
      pages: normalizePages(pages),
      layout,
      activePageId: pages[1]!.pageId,
      connected: true,
      toasts: [],
      pendingTurns: [],
      prompt: null,
      conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" },
      conversationContexts: { "chat:a": pages[0]!.pageId, "chat:b": pages[0]!.pageId },
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "preview").mockResolvedValue(null);
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    const chat = (params as { chatId?: string }).chatId;
    if (method === "runs.list") return runs.filter((run) => run.config?.chatId === chat);
    if (method === "runs.get")
      return {
        run: useStore.getState().runs.find((run) => run.runId === (params as { runId: string }).runId)!,
        steps: [],
        suspension: null,
      };
    if (method === "conversations.get") return { title: "Original chat", archived: false };
    if (method === "runs.messages.list") return [];
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(initial, true);
  bridge.windowId = windowId;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (scroll) Object.defineProperty(HTMLElement.prototype, "scrollIntoView", scroll);
  else delete (HTMLElement.prototype as Partial<HTMLElement>).scrollIntoView;
});
async function render(chat = "a") {
  await act(async () => root.render(<Conversation chatId={chat} />));
}
const title = () => host.querySelector<HTMLButtonElement>(".conversation-preview-open")!;
const thumbnail = () => host.querySelector<HTMLButtonElement>(".conversation-preview-live")!;
const menu = () => document.querySelector<HTMLDialogElement>('[aria-label="Open browser preview"]');
const action = (command: string) =>
  menu()!.querySelector<HTMLButtonElement>(`[data-command-id="${command}"]`)!;
async function open() {
  await act(async () => {
    title().focus();
    title().click();
  });
}
async function dispatch(command: string) {
  let completion!: Promise<unknown>;
  await act(async () => {
    action(command).focus();
    completion = executeCommand(command);
    void completion.catch(() => {});
  });
  return { completion };
}
function heldActivate() {
  const pending: { resolve(): void; reject(reason: unknown): void }[] = [];
  const activate = vi.fn(
    (_pageId: string) => new Promise<void>((resolve, reject) => pending.push({ resolve, reject })),
  );
  act(() => useStore.setState({ activate }));
  return { activate, pending };
}
it("title retains toggle and thumbnail retains show-menu through the same registered command", async () => {
  await render();
  await open();
  expect(menu()).not.toBeNull();
  expect(title().getAttribute("aria-expanded")).toBe("true");
  await act(async () => title().click());
  expect(menu()).toBeNull();
  await act(async () => thumbnail().click());
  expect(menu()).not.toBeNull();
  await act(async () => thumbnail().click());
  expect(menu()).not.toBeNull();
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("original Menu Escape/cancel returns focus to original title trigger", async () => {
  await render();
  await open();
  await act(async () =>
    menu()!.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, cancelable: true })),
  );
  expect(menu()).toBeNull();
  expect(document.activeElement).toBe(title());
  await open();
  await act(async () => menu()!.dispatchEvent(new Event("cancel", { cancelable: true })));
  expect(menu()).toBeNull();
  expect(document.activeElement).toBe(title());
});
it("Open in tab dispatch retains exact original activate argument and ACK while disconnected", async () => {
  useStore.setState({ connected: false });
  await render();
  const { activate, pending } = heldActivate();
  await open();
  const original = await dispatch("activate-conversation-preview-page");
  expect(activate).toHaveBeenCalledExactlyOnceWith("page-1");
  expect(menu()).toBeNull();
  await act(async () => {
    pending[0]!.resolve();
    await expect(original.completion).resolves.toBeUndefined();
  });
  expect(useStore.getState().conversationContexts["chat:a"]).toBe("page-1");
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("Split activates original primary then executes real registered split with original companion", async () => {
  await render();
  const { activate, pending } = heldActivate();
  const tab = vi.spyOn(bridge, "tabCommand").mockResolvedValue({ status: "applied" } as never);
  await open();
  const original = await dispatch("split-conversation-preview-page");
  expect(activate).toHaveBeenCalledExactlyOnceWith("page-2");
  await act(async () => {
    pending[0]!.resolve();
    await original.completion;
  });
  expect(
    tab.mock.calls.some(
      ([request]) =>
        request.kind === "split" && JSON.stringify(request.pageIds) === JSON.stringify(["page-2", "page-1"]),
    ),
  ).toBe(true);
  expect(useStore.getState().layout.splitGroups?.[0]?.panes).toEqual(["page-2", "page-1"]);
  await act(async () => pending[1]?.resolve());
});
it.each(["chat", "document", "membership"])(
  "held activation after original %s drift cannot start a split",
  async (drift) => {
    await render();
    const { pending } = heldActivate();
    const tab = vi.spyOn(bridge, "tabCommand");
    await open();
    const original = await dispatch("split-conversation-preview-page");
    if (drift === "chat") {
      await render("b");
      await render("a");
    } else
      await act(async () => {
        if (drift === "document")
          useStore.setState((state) => ({
            pages: normalizePages(
              orderedPages(state.pages).map((page) =>
                page.pageId === "page-1" ? { ...page, documentEpoch: page.documentEpoch! + 1 } : page,
              ),
            ),
          }));
        else
          useStore.setState((state) => ({
            layout: { ...state.layout, tabSpace: { ...state.layout.tabSpace, "page-1": "foreign-space" } },
          }));
      });
    await act(async () => {
      pending[0]!.resolve();
      await original.completion;
    });
    expect(tab).not.toHaveBeenCalled();
    expect(useStore.getState().layout.splitGroups).toEqual([]);
  },
);
it("committed membership A to B to A permanently retires the original pending split", async () => {
  await render();
  const { pending } = heldActivate();
  const tab = vi.spyOn(bridge, "tabCommand");
  await open();
  const original = await dispatch("split-conversation-preview-page");
  const originalLayout = useStore.getState().layout;
  await act(async () =>
    useStore.setState({
      layout: { ...originalLayout, tabSpace: { ...originalLayout.tabSpace, "page-1": "foreign-space" } },
    }),
  );
  await act(async () => useStore.setState({ layout: originalLayout }));
  await act(async () => {
    pending[0]!.resolve();
    await original.completion;
  });
  expect(tab).not.toHaveBeenCalled();
  expect(useStore.getState().layout.splitGroups).toEqual([]);
});
it("incidental page title publication keeps original pending activation usable", async () => {
  await render();
  const { pending } = heldActivate();
  await open();
  const original = await dispatch("activate-conversation-preview-page");
  await act(async () =>
    useStore.setState((state) => ({
      pages: normalizePages(
        orderedPages(state.pages).map((page) => ({ ...page, title: `${page.title} refreshed` })),
      ),
    })),
  );
  await act(async () => {
    pending[0]!.resolve();
    await expect(original.completion).resolves.toBeUndefined();
  });
  expect(useStore.getState().toasts).toEqual([]);
});
it("retired activation failure keeps exact rejection without delivering a current toast", async () => {
  await render();
  const { pending } = heldActivate();
  await open();
  const original = await dispatch("activate-conversation-preview-page");
  await render("b");
  const error = new Error("Original activate failed");
  await act(async () => {
    pending[0]!.reject(error);
    await expect(original.completion).rejects.toBe(error);
  });
  expect(useStore.getState().toasts).toEqual([]);
});
it("current original click activation failure reports once", async () => {
  await render();
  const { pending } = heldActivate();
  await open();
  await act(async () => action("activate-conversation-preview-page").click());
  await act(async () => pending[0]!.reject(new Error("Original active failure")));
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().toasts[0]!.text).toContain("Original active failure");
});
it("real original activation may select the target before its rejected native ACK and still reports once", async () => {
  await render();
  const tab = vi.spyOn(bridge, "tabCommand").mockResolvedValue({
    status: "rejected",
    error: { message: "Original native activation refused" },
  } as never);
  await open();
  await act(async () => action("activate-conversation-preview-page").click());
  expect(tab).toHaveBeenCalledWith({ kind: "activate", pageId: "page-1" }, undefined);
  expect(useStore.getState().activePageId).toBe("page-1");
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().toasts[0]!.text).toContain("Original native activation refused");
});
it("focused remap preserves original title toggle and exact menu action", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: {
        "toggle-conversation-preview-menu": [{ key: "j", command: true, alt: true }],
        "activate-conversation-preview-page": [{ key: "k", command: true, alt: true }],
      },
    },
  });
  await render();
  const { activate, pending } = heldActivate();
  await act(async () => {
    title().focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(menu()).not.toBeNull();
  await act(async () => {
    action("activate-conversation-preview-page").focus();
    expect(dispatchShortcut({ key: "k", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(activate).toHaveBeenCalledExactlyOnceWith("page-1");
  await act(async () => pending[0]!.resolve());
});
it("hidden and observed foreign-window ABA refuse, while a newer committed chat owner remains usable", async () => {
  await render();
  const { activate } = heldActivate();
  title().hidden = true;
  title().focus();
  await expect(executeCommand("toggle-conversation-preview-menu")).rejects.toThrow();
  title().hidden = false;
  title().focus();
  bridge.windowId = "foreign";
  await expect(executeCommand("toggle-conversation-preview-menu")).rejects.toThrow();
  bridge.windowId = windowId;
  await expect(executeCommand("toggle-conversation-preview-menu")).rejects.toThrow();
  expect(menu()).toBeNull();
  expect(activate).not.toHaveBeenCalled();
  await render("b");
  await open();
  expect(menu()).not.toBeNull();
});
it("actual source selection drift before scoped dispatch refuses without activation", async () => {
  await render();
  const { activate } = heldActivate();
  await open();
  const original = action("activate-conversation-preview-page");
  original.focus();
  await act(async () => {
    useStore.setState({ conversationContexts: { "chat:a": "page-2" } });
    await expect(executeCommand("activate-conversation-preview-page")).rejects.toThrow(
      "current conversation preview",
    );
  });
  expect(activate).not.toHaveBeenCalled();
});
it("actual foreign-window clicks and focused shortcut refuse without a stale toast", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: { "toggle-conversation-preview-menu": [{ key: "j", command: true, alt: true }] },
    },
  });
  await render();
  const { activate } = heldActivate();
  await act(async () => {
    title().focus();
    bridge.windowId = "foreign";
    title().click();
  });
  expect(menu()).toBeNull();
  expect(useStore.getState().toasts).toEqual([]);
  bridge.windowId = windowId;
  await act(async () => title().click());
  expect(useStore.getState().toasts).toEqual([]);
  await act(async () => {
    title().focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(useStore.getState().toasts).toEqual([]);
  await expect(executeCommand("toggle-conversation-preview-menu")).rejects.toThrow(
    "current conversation preview",
  );
  expect(activate).not.toHaveBeenCalled();
});
it("all three commands retain normal scoped remappable policy", () => {
  for (const id of [
    "toggle-conversation-preview-menu",
    "activate-conversation-preview-page",
    "split-conversation-preview-page",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});
