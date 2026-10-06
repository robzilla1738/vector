// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, type PageTarget } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage, makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";

const initial = useStore.getState(),
  windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
const url = "http://127.0.0.1:3210/original";
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
  const runs = ["a", "b"].map((chat) =>
    makeRun({
      runId: `run-${chat}`,
      config: { chatId: chat },
      pageIds: [`closed-${chat}`],
      status: "completed",
    }),
  );
  const observation = (chat: string) => ({
    pageId: `closed-${chat}`,
    url,
    title: "Original page",
    documentEpoch: 1,
    revision: 1,
    text: "Original",
    refs: [],
  });
  useStore.setState(
    {
      ...initial,
      runs,
      steps: {},
      pages: [],
      connected: true,
      toasts: [],
      pendingTurns: [],
      prompt: null,
      conversationContexts: {},
      observations: { "run-a": observation("a"), "run-b": observation("b") },
      conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" },
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "invoke").mockImplementation(async (method, params) => {
    const chat = (params as { chatId?: string }).chatId;
    if (method === "runs.list") return runs.filter((run) => run.config?.chatId === chat);
    if (method === "runs.get")
      return {
        run: useStore.getState().runs.find((run) => run.runId === (params as { runId: string }).runId)!,
        steps: [],
        suspension: null,
      };
    if (method === "conversations.get") return { title: "Archived", archived: true };
    if (method === "conversations.archive") return { chatId: chat, archived: false };
    if (method === "runs.messages.list") return [];
    if (method === "conversations.artifacts.get") return { artifacts: [] };
    if (method === "conversations.images.get") return { images: [] };
    if (method === "conversations.attachments.get") return { attachments: [] };
    if (method === "conversations.sources.get") return { sources: [] };
    if (method === "runs.context.get") return { entries: [], historyEnabled: true };
    return { workspace: null, memory: null };
  });
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
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
  await act(async () => root.render(<Conversation chatId={chat} embedded />));
}
function button(reopen = false) {
  return host.querySelector<HTMLButtonElement>(
    `[data-command-id="${reopen ? "reopen-conversation-page" : "restore-archived-conversation"}"]`,
  )!;
}
async function dispatch(reopen = false) {
  button(reopen).focus();
  let completion!: Promise<unknown>;
  await act(async () => {
    completion = executeCommand(reopen ? "reopen-conversation-page" : "restore-archived-conversation");
    void completion.catch(() => {});
  });
  return { completion };
}
function heldRestore() {
  const pending: { resolve(value: unknown): void; reject(reason: unknown): void }[] = [];
  const fallback = vi.mocked(bridge.invoke).getMockImplementation()!;
  vi.mocked(bridge.invoke).mockImplementation((method, params) =>
    method === "conversations.archive"
      ? new Promise((resolve, reject) => pending.push({ resolve, reject }))
      : fallback(method, params),
  );
  return pending;
}
function heldOpen() {
  const pending: { resolve(value: PageTarget | null): void; reject(reason: unknown): void }[] = [];
  const newTab = vi.fn<(url?: string) => Promise<PageTarget | null>>(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  );
  useStore.setState({ newTab });
  return { pending, newTab };
}
it("Restore returns the actual original ACK, retains drafts and the original archive arguments", async () => {
  await render();
  const pending = heldRestore(),
    call = await dispatch();
  const ack = { chatId: "a", archived: false };
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(call.completion).resolves.toBe(ack);
  });
  expect(button()).toBeNull();
  expect(useStore.getState().conversationDrafts).toEqual({
    "chat:a": "Keep A draft",
    "chat:b": "Keep B draft",
  });
  expect(bridge.invoke).toHaveBeenCalledWith("conversations.archive", { chatId: "a", archived: false });
});
it("focused remapped Restore remains available disconnected", async () => {
  useStore.setState({
    connected: false,
    settings: {
      shortcutOverrides: { "restore-archived-conversation": [{ key: "j", command: true, alt: true }] },
    },
  });
  await render();
  button().focus();
  await act(async () => {
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(button()).toBeNull();
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("Restore synchronously reserves same-tick native clicks", async () => {
  await render();
  const pending = heldRestore(),
    original = button();
  await act(async () => {
    original.click();
    original.click();
  });
  expect(pending).toHaveLength(1);
  expect(button().disabled).toBe(true);
  await act(async () => pending[0]!.resolve({ chatId: "a", archived: false }));
  expect(button()).toBeNull();
});
it("an old Restore ACK after A to B to A cannot restore the current archive or clear newer busy", async () => {
  await render();
  const pending = heldRestore(),
    old = await dispatch();
  await render("b");
  await render("a");
  const fresh = await dispatch();
  const ack = { chatId: "a", archived: false };
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(old.completion).resolves.toBe(ack);
  });
  expect(button().disabled).toBe(true);
  expect(host.textContent).toContain("This conversation is archived.");
  await act(async () => {
    pending[1]!.resolve(ack);
    await expect(fresh.completion).resolves.toBe(ack);
  });
  expect(button()).toBeNull();
});
it("Restore preserves retired rejection without toast or clearing newer busy, and current failure reports once", async () => {
  await render();
  const pending = heldRestore(),
    old = await dispatch();
  await render("b");
  await render("a");
  await act(async () => button().click());
  const error = new Error("Original retired restore");
  await act(async () => {
    pending[0]!.reject(error);
    await expect(old.completion).rejects.toBe(error);
  });
  expect(button().disabled).toBe(true);
  expect(useStore.getState().toasts).toEqual([]);
  await act(async () => pending[1]!.reject(new Error("Current restore failed")));
  expect(button().disabled).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
});
it("Restore refuses a foreign acknowledgment without publishing a successful archive change", async () => {
  await render();
  const pending = heldRestore(),
    original = await dispatch();
  await act(async () => {
    pending[0]!.resolve({ chatId: "b", archived: false });
    await expect(original.completion).rejects.toThrow("acknowledgment");
  });
  expect(button().disabled).toBe(false);
  expect(host.textContent).toContain("This conversation is archived.");
});
it("Reopen returns the original newTab ACK and selects its page and exact original run", async () => {
  await render();
  const { pending, newTab } = heldOpen(),
    open = vi.spyOn(useStore.getState(), "openConversation"),
    original = await dispatch(true);
  const page = makePage(0, { url });
  await act(async () => {
    pending[0]!.resolve(page);
    await expect(original.completion).resolves.toBe(page);
  });
  expect(newTab).toHaveBeenCalledExactlyOnceWith(url);
  expect(useStore.getState().conversationContexts["chat:a"]).toBe(page.pageId);
  expect(open).toHaveBeenCalledExactlyOnceWith("run-a");
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("Reopen reserves same-tick clicks and leaves an old A ACK out of the new chat and busy operation", async () => {
  await render();
  const { pending, newTab } = heldOpen(),
    originalButton = button(true);
  await act(async () => {
    originalButton.click();
    originalButton.click();
  });
  expect(newTab).toHaveBeenCalledTimes(1);
  await render("b");
  await render("a");
  const fresh = await dispatch(true),
    page = makePage(0, { url });
  await act(async () => pending[0]!.resolve(page));
  expect(useStore.getState().conversationContexts["chat:a"]).toBeUndefined();
  expect(button(true).disabled).toBe(true);
  await act(async () => {
    pending[1]!.resolve(page);
    await expect(fresh.completion).resolves.toBe(page);
  });
  expect(useStore.getState().conversationContexts["chat:a"]).toBe(page.pageId);
});
it("held Reopen refuses changed original observation and preserves its actual page ACK", async () => {
  await render();
  const { pending } = heldOpen(),
    open = vi.spyOn(useStore.getState(), "openConversation"),
    original = await dispatch(true);
  await act(async () =>
    useStore.setState((state) => ({
      observations: {
        ...state.observations,
        "run-a": { ...state.observations["run-a"]!, url: "http://127.0.0.1:3210/new" },
      },
    })),
  );
  const page = makePage(0, { url });
  await act(async () => {
    pending[0]!.resolve(page);
    await expect(original.completion).resolves.toBe(page);
  });
  expect(open).not.toHaveBeenCalled();
  expect(useStore.getState().conversationContexts["chat:a"]).toBeUndefined();
  expect(button(true).disabled).toBe(false);
});
it("observed foreign-window ABA cannot grant recovery again or publish a held original ACK", async () => {
  await render();
  const pending = heldRestore(),
    original = await dispatch();
  bridge.windowId = "foreign";
  button(true).focus();
  await expect(executeCommand("reopen-conversation-page")).rejects.toThrow();
  bridge.windowId = windowId;
  const ack = { chatId: "a", archived: false };
  await act(async () => {
    pending[0]!.resolve(ack);
    await expect(original.completion).resolves.toBe(ack);
  });
  expect(host.textContent).toContain("This conversation is archived.");
  await expect(executeCommand("reopen-conversation-page")).rejects.toThrow();
  expect(useStore.getState().conversationContexts["chat:a"]).toBeUndefined();
});
it("retired Reopen leaves the original authorized tab creation intact but cannot open the old conversation", async () => {
  await render();
  const pending: { resolve(value: unknown): void }[] = [];
  vi.spyOn(bridge, "tabCommand").mockImplementation(
    () => new Promise((resolve) => pending.push({ resolve })),
  );
  vi.spyOn(bridge, "bindTabSpace").mockResolvedValue({
    spaceId: initial.layout.activeSpaceId,
    workspaceId: "workspace",
  });
  const open = vi.spyOn(useStore.getState(), "openConversation"),
    original = await dispatch(true);
  const created = useStore.getState().pages.find((page) => page.url === url)!;
  expect(created).toBeDefined();
  await render("b");
  await act(async () => {
    pending[0]!.resolve({ status: "accepted", pageId: created.pageId });
    await original.completion;
  });
  expect(useStore.getState().pages.some((page) => page.pageId === created.pageId)).toBe(true);
  expect(open).not.toHaveBeenCalled();
  expect(useStore.getState().conversationContexts["chat:a"]).toBeUndefined();
  expect(useStore.getState().conversationDrafts["chat:b"]).toBe("Keep B draft");
});
it("Reopen retains original current and retired rejection identities and suppresses retired delivery", async () => {
  await render();
  const { pending } = heldOpen(),
    old = await dispatch(true);
  await render("b");
  await render("a");
  await act(async () => button(true).click());
  const reason = new Error("Retired original page open");
  await act(async () => {
    pending[0]!.reject(reason);
    await expect(old.completion).rejects.toBe(reason);
  });
  expect(button(true).disabled).toBe(true);
  expect(useStore.getState().toasts).toEqual([]);
  await act(async () => pending[1]!.reject(new Error("Current original page open")));
  expect(button(true).disabled).toBe(false);
  expect(useStore.getState().toasts).toHaveLength(1);
});
it("Reopen reuses an original usable person page without a duplicate open and remains callable disconnected", async () => {
  const page = makePage(0, { url, ownedByRuntime: false, viewStatus: "hidden" });
  useStore.setState({ connected: false, pages: [page] });
  await render();
  const newTab = vi.fn();
  useStore.setState({ newTab });
  const original = await dispatch(true);
  await expect(original.completion).resolves.toBe(page);
  expect(newTab).not.toHaveBeenCalled();
  expect(useStore.getState().conversationContexts["chat:a"]).toBe(page.pageId);
});
for (const changed of ["run", "observation"] as const)
  it(`Reopen rejects synchronous ${changed} drift before any page producer starts`, async () => {
    await render();
    const { newTab } = heldOpen();
    newTab.mockResolvedValue(makePage(0, { url }));
    button(true).focus();
    let completion!: Promise<unknown>;
    await act(async () => {
      useStore.setState((state) =>
        changed === "run"
          ? {
              runs: [
                ...state.runs,
                makeRun({
                  runId: "new-current-a",
                  config: { chatId: "a" },
                  pageIds: ["closed-new"],
                  status: "completed",
                  createdAt: state.runs.find((run) => run.runId === "run-a")!.createdAt + 1,
                }),
              ],
            }
          : {
              observations: {
                ...state.observations,
                "run-a": { ...state.observations["run-a"]!, url: "http://127.0.0.1:3210/replaced" },
              },
            },
      );
      completion = executeCommand("reopen-conversation-page");
      await expect(completion).rejects.toThrow("current conversation page");
    });
    expect(newTab).not.toHaveBeenCalled();
    expect(useStore.getState().conversationContexts["chat:a"]).toBeUndefined();
    expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
  });
it("both recovery rows remain normal scoped remappable controls", () => {
  for (const id of ["restore-archived-conversation", "reopen-conversation-page"])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});
