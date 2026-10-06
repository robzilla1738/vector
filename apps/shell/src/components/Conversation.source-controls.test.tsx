// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { COMMANDS, type ConversationSource } from "@aux/contracts";
import { bridge, type BrowserProfile } from "../bridge";
import { useStore } from "../store";
import { executeCommand, dispatchShortcut } from "../commands";
import { makePage, makeRun } from "../mock/fixtures";
import { Conversation } from "./Conversation";

const initial = useStore.getState(),
  windowId = bridge.windowId;
const scroll = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "scrollIntoView");
let host: HTMLDivElement, root: ReturnType<typeof createRoot>, sources: ConversationSource[];
const url = "http://127.0.0.1:3210/original-source";
const profiles: BrowserProfile[] = [
  { id: "own-profile", name: "Personal", current: true },
  { id: "work-profile", name: "Work", current: false },
];
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
  sources = [
    {
      kind: "browser",
      sourceId: "original-source",
      runId: "run-a",
      pageId: "page-1",
      url,
      title: "Original recorded source",
      documentEpoch: 7,
      revision: 3,
      observedAt: 1,
    },
  ];
  const runs = ["a", "b"].map((chat) =>
    makeRun({
      runId: `run-${chat}`,
      config: { chatId: chat },
      pageIds: [],
      status: "completed",
      result: { answer: `[Read recorded source](${url})` },
    }),
  );
  useStore.setState(
    {
      ...initial,
      runs,
      steps: {},
      pages: [makePage(0, { url, documentEpoch: 7, windowId })],
      activePageId: "page-1",
      connected: true,
      toasts: [],
      pendingTurns: [],
      prompt: null,
      conversationDrafts: { "chat:a": "Keep A draft", "chat:b": "Keep B draft" },
      conversationContexts: {},
    },
    true,
  );
  vi.spyOn(bridge, "onEvent").mockImplementation(() => () => {});
  vi.spyOn(bridge, "overlay").mockResolvedValue(false);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "browserProfiles").mockResolvedValue(profiles);
  vi.spyOn(bridge, "openBrowserProfileUrl").mockResolvedValue(true);
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
    if (method === "conversations.sources.get") return { sources: chat === "a" ? sources : [] };
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
const disclosure = () => host.querySelector<HTMLElement>('[data-command-id="toggle-conversation-sources"]')!;
const list = () => host.querySelector<HTMLDetailsElement>(".conversation-sources")!;
const row = () => list().querySelector<HTMLButtonElement>(".ui-list-open")!;
const openButton = () =>
  host.querySelector<HTMLButtonElement>('[data-command-id="open-conversation-recorded-source"]')!;
const chooser = () => document.querySelector<HTMLDialogElement>('[aria-label="Open Calendar source"]');
async function select() {
  await act(async () => {
    disclosure().click();
    row().focus();
    row().click();
  });
}
async function dispatch(command = "open-conversation-recorded-source", control = openButton()) {
  let completion!: Promise<unknown>;
  await act(async () => {
    control.focus();
    completion = executeCommand(command);
    void completion.catch(() => {});
  });
  return { completion };
}
function calendar(profileId?: string) {
  sources = [
    {
      kind: "calendar",
      sourceId: "calendar-source",
      runId: "run-a",
      connectionId: "original-connection",
      accountKey: "alice@example.test",
      title: "Original Calendar event",
      url: "https://calendar.google.com/calendar/u/0/r/eventedit/original",
      start: "2026-10-04",
      end: "2026-10-05",
      observedAt: 1,
      ...(profileId ? { profileId } : {}),
    },
  ];
}
function heldProfiles() {
  const pending: { resolve(value: BrowserProfile[]): void; reject(reason: unknown): void }[] = [];
  vi.mocked(bridge.browserProfiles).mockImplementation(
    () => new Promise((resolve, reject) => pending.push({ resolve, reject })),
  );
  return pending;
}
it("registered disclosure and recorded-row selection retain provenance, transcript, draft and focus", async () => {
  await render();
  const input = host.querySelector("textarea"),
    state = useStore.getState().conversationDrafts;
  const pointer = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => {
    expect(disclosure().dispatchEvent(pointer)).toBe(false);
  });
  expect(pointer.defaultPrevented).toBe(true);
  expect(list().open).toBe(true);
  await act(async () => {
    row().focus();
    row().click();
  });
  expect(list().open).toBe(true);
  expect(host.querySelector(".supporting-content")!.textContent).toContain(url);
  expect(host.querySelector("textarea")).toBe(input);
  expect(useStore.getState().conversationDrafts).toBe(state);
  await act(async () => {
    disclosure().focus();
    await executeCommand("toggle-conversation-sources");
  });
  expect(list().open).toBe(false);
});
it("recorded browser source reuses only exact original page URL/document and retains actual activate ACK", async () => {
  await render();
  await select();
  const ack = { original: "activation" };
  const activate = vi.fn(async () => ack);
  act(() => useStore.setState({ activate } as never));
  const original = await dispatch();
  await expect(original.completion).resolves.toBe(ack);
  expect(activate).toHaveBeenCalledExactlyOnceWith("page-1");
});
it("changed live document opens original recorded URL in new tab without pretending it is current", async () => {
  useStore.setState((state) => ({ pages: state.pages.map((page) => ({ ...page, documentEpoch: 8 })) }));
  await render();
  await select();
  const ack = makePage(2, { url, windowId });
  const newTab = vi.fn(async () => ack);
  act(() => useStore.setState({ newTab }));
  const original = await dispatch();
  await expect(original.completion).resolves.toBe(ack);
  expect(newTab).toHaveBeenCalledExactlyOnceWith(url);
});
it("saved Memory source retains original owning Profile route and actual ACK", async () => {
  sources = [
    {
      kind: "memory",
      sourceId: "memory-source",
      runId: "run-a",
      memoryId: "original-memory",
      workspaceId: "original-workspace",
      pageId: "page-1",
      profileId: "work-profile",
      documentEpoch: 7,
      url,
      title: "Original Memory source",
      observedAt: 1,
    },
  ];
  await render();
  await select();
  const original = await dispatch();
  await expect(original.completion).resolves.toBe(true);
  expect(bridge.openBrowserProfileUrl).toHaveBeenCalledExactlyOnceWith("work-profile", url);
});
it("Calendar source with exact recorded noncurrent Profile retains original routing and ACK", async () => {
  calendar("work-profile");
  await render();
  await select();
  const original = await dispatch();
  await expect(original.completion).resolves.toBe(true);
  expect(bridge.openBrowserProfileUrl).toHaveBeenCalledExactlyOnceWith("work-profile", sources[0]!.url);
  expect(chooser()).toBeNull();
});
it.each(["chat", "window"])(
  "held original Profile read after %s retirement cannot open source or publish chooser",
  async (drift) => {
    calendar();
    await render();
    await select();
    const pending = heldProfiles(),
      original = await dispatch();
    if (drift === "chat") {
      await render("b");
      await render("a");
    } else {
      bridge.windowId = "foreign";
      await act(async () => {
        openButton().focus();
        openButton().click();
      });
      bridge.windowId = windowId;
    }
    await act(async () => {
      pending[0]!.resolve(profiles);
      await original.completion;
    });
    expect(bridge.openBrowserProfileUrl).not.toHaveBeenCalled();
    expect(chooser()).toBeNull();
    expect(useStore.getState().toasts).toEqual([]);
  },
);
it("same-tick duplicate original source admission cannot start a second Profile read", async () => {
  calendar("work-profile");
  await render();
  await select();
  const pending = heldProfiles();
  const before = vi.mocked(bridge.browserProfiles).mock.calls.length;
  const original = await dispatch();
  await expect(executeCommand("open-conversation-recorded-source")).rejects.toThrow(
    "Wait for the original source",
  );
  expect(bridge.browserProfiles).toHaveBeenCalledTimes(before + 1);
  await act(async () => {
    pending[0]!.resolve(profiles);
    await original.completion;
  });
});
it("Calendar account choice preserves real text, explicit Cancel command, Escape and opener focus", async () => {
  calendar();
  await render();
  await select();
  const opener = openButton();
  await dispatch();
  expect(chooser()?.textContent).toContain("alice@example.test");
  expect(chooser()?.textContent).toContain("Choose the browser Profile signed in to this account.");
  const cancel = chooser()!.querySelector<HTMLButtonElement>(
    '[data-command-id="cancel-conversation-source-profile"]',
  )!;
  expect(document.activeElement).toBe(cancel);
  await act(async () => cancel.click());
  expect(chooser()).toBeNull();
  expect(document.activeElement).toBe(opener);
  await dispatch();
  await act(async () => chooser()!.dispatchEvent(new Event("cancel", { cancelable: true })));
  expect(chooser()).toBeNull();
  expect(document.activeElement).toBe(opener);
});
it("explicit original Calendar Profile choice revalidates metadata and retains chosen URL/ACK", async () => {
  calendar();
  await render();
  await select();
  await dispatch();
  const choice = [...chooser()!.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Work",
  )!;
  const original = await dispatch("choose-conversation-source-profile", choice);
  await expect(original.completion).resolves.toBe(true);
  expect(bridge.openBrowserProfileUrl).toHaveBeenCalledExactlyOnceWith("work-profile", sources[0]!.url);
  expect(chooser()).toBeNull();
});
it("held Calendar choice Profile read after owner retirement cannot issue chosen URL open", async () => {
  calendar();
  await render();
  await select();
  await dispatch();
  const pending = heldProfiles();
  const choice = [...chooser()!.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Work",
  )!;
  const original = await dispatch("choose-conversation-source-profile", choice);
  await render("b");
  await act(async () => {
    pending[0]!.resolve(profiles);
    await original.completion;
  });
  expect(bridge.openBrowserProfileUrl).not.toHaveBeenCalled();
  expect(useStore.getState().toasts).toEqual([]);
});
it("foreign changed or archived chosen Profile refuses without replacing its original route", async () => {
  calendar();
  await render();
  await select();
  await dispatch();
  vi.mocked(bridge.browserProfiles).mockResolvedValue([{ ...profiles[1]!, archived: true }]);
  const choice = [...chooser()!.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Work",
  )!;
  const original = await dispatch("choose-conversation-source-profile", choice);
  await expect(original.completion).rejects.toThrow("chosen Calendar source Profile changed");
  expect(bridge.openBrowserProfileUrl).not.toHaveBeenCalled();
});
it("retired original Profile read failure preserves rejection identity without stale toast", async () => {
  calendar("work-profile");
  await render();
  await select();
  const pending = heldProfiles(),
    original = await dispatch();
  await render("b");
  const error = new Error("Original Profile read failed");
  await act(async () => {
    pending[0]!.reject(error);
    await expect(original.completion).rejects.toBe(error);
  });
  expect(useStore.getState().toasts).toEqual([]);
});
async function heldNativeOpen() {
  calendar("work-profile");
  await render();
  await select();
  let resolve!: (value: boolean) => void, reject!: (reason: unknown) => void;
  vi.mocked(bridge.openBrowserProfileUrl).mockImplementation(
    () =>
      new Promise((yes, no) => {
        resolve = yes;
        reject = no;
      }),
  );
  const original = await dispatch();
  expect(bridge.openBrowserProfileUrl).toHaveBeenCalledExactlyOnceWith("work-profile", sources[0]!.url);
  await render("b");
  return { original, resolve, reject };
}
it("admitted native Profile open retains original actual ACK after retirement", async () => {
  const { original, resolve } = await heldNativeOpen();
  await act(async () => {
    resolve(true);
    await expect(original.completion).resolves.toBe(true);
  });
  expect(useStore.getState().toasts).toEqual([]);
  expect(chooser()).toBeNull();
});
it("admitted native Profile open retains identical original rejection after retirement", async () => {
  const { original, reject } = await heldNativeOpen();
  const error = new Error("Original native open failed");
  await act(async () => {
    reject(error);
    await expect(original.completion).rejects.toBe(error);
  });
  expect(useStore.getState().toasts).toEqual([]);
  expect(chooser()).toBeNull();
});
it("current native source click reports original rejection exactly once", async () => {
  calendar("work-profile");
  await render();
  await select();
  vi.mocked(bridge.openBrowserProfileUrl).mockRejectedValue(new Error("Original route failed"));
  await act(async () => openButton().click());
  expect(useStore.getState().toasts).toHaveLength(1);
  expect(useStore.getState().toasts[0]!.text).toContain("Original route failed");
});
it("focused remapped Sources and exact row selection stay available while disconnected", async () => {
  useStore.setState({
    settings: {
      shortcutOverrides: {
        "toggle-conversation-sources": [{ key: "j", command: true, alt: true }],
        "select-conversation-source": [{ key: "k", command: true, alt: true }],
      },
    },
  });
  await render();
  await act(async () => useStore.setState({ connected: false }));
  await act(async () => {
    disclosure().focus();
    expect(dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(list().open).toBe(true);
  await act(async () => {
    row().focus();
    expect(dispatchShortcut({ key: "k", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(host.querySelector(".supporting-content")!.textContent).toContain(url);
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("hidden original source control and observed foreign-window click refuse with no stale presentation", async () => {
  await render();
  await select();
  openButton().hidden = true;
  openButton().focus();
  await expect(executeCommand("open-conversation-recorded-source")).rejects.toThrow();
  openButton().hidden = false;
  await act(async () => {
    bridge.windowId = "foreign";
    openButton().click();
  });
  bridge.windowId = windowId;
  await act(async () => openButton().click());
  expect(useStore.getState().toasts).toEqual([]);
  expect(bridge.openBrowserProfileUrl).not.toHaveBeenCalled();
});
it("original modifier citation keeps background navigation arguments and exact recorded URL", async () => {
  useStore.setState({ pages: [] });
  await render();
  const ack = makePage(2, { url, windowId });
  const background = vi.fn(async () => ack);
  act(() => useStore.setState({ openBackgroundTab: background }));
  const link = host.querySelector<HTMLAnchorElement>(`a[href="${url}"]`)!;
  expect(link).not.toBeNull();
  await act(async () =>
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, metaKey: true })),
  );
  expect(background).toHaveBeenCalledExactlyOnceWith(url, useStore.getState().layout.activeSpaceId, false);
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
it("all five source actions are normal scoped and remappable", () => {
  for (const id of [
    "toggle-conversation-sources",
    "select-conversation-source",
    "open-conversation-recorded-source",
    "choose-conversation-source-profile",
    "cancel-conversation-source-profile",
  ])
    expect(COMMANDS.find((row) => row.id === id)).toMatchObject({
      windows: ["normal"],
      palette: false,
      bindings: [],
      intercept: true,
    });
});

it("retired original Sources pointer prevents browser disclosure default without stale presentation", async () => {
  await render();
  const summary = disclosure(),
    details = list();
  expect(summary.dataset.commandId).toBe("toggle-conversation-sources");
  expect(details.open).toBe(false);
  const pointer = new MouseEvent("click", { bubbles: true, cancelable: true });
  await act(async () => {
    bridge.windowId = "foreign";
    summary.dispatchEvent(pointer);
  });
  expect(details.open).toBe(false);
  expect(pointer.defaultPrevented).toBe(true);
  bridge.windowId = windowId;
  await act(async () => summary.click());
  expect(details.open).toBe(false);
  expect(useStore.getState().toasts).toEqual([]);
  expect(useStore.getState().conversationDrafts["chat:a"]).toBe("Keep A draft");
});
