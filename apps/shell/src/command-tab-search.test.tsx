// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
vi.mock("./bridge", async (original) => ({
  ...(await original<typeof import("./bridge")>()),
  inNativeHost: true,
}));
vi.mock("./use-feature", () => ({ useFeature: () => true }));
import { bridge } from "./bridge";
import { COMMAND_ACTIONS } from "./commands";
import { COMMAND_SURFACE_ACTIONS } from "./command-surface-actions";
import { closeCommandSurface, openCommandSurface, useCommandSurfaceRequest } from "./command-surface-state";
import { CommandSurface } from "./components/CommandSurface";
import { useStore } from "./store";
import { normalizePages } from "./store/pages";
import { nativeOmniboxFixture } from "./test-native-omnibox";

const page = {
  pageId: "current",
  url: "https://current.test/",
  title: "Current page",
  backend: "aux",
  viewStatus: "visible",
  ownedByRuntime: false,
};
let host: HTMLDivElement;
let root: ReturnType<typeof createRoot>;
const settle = () => act(async () => new Promise((resolve) => setTimeout(resolve, 130)));
const type = (input: HTMLInputElement, text: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, text);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
const key = (input: HTMLInputElement, name: string, options: KeyboardEventInit = {}) =>
  input.dispatchEvent(
    new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...options }),
  );

function CurrentSurface() {
  const request = useCommandSurfaceRequest();
  return request && <CommandSurface request={request} executeCommand={vi.fn()} />;
}
const open = async () => {
  await act(async () => root.render(<CurrentSurface />));
  await act(async () => COMMAND_SURFACE_ACTIONS["command-tabs"]());
  await settle();
  return host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
};

beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  Element.prototype.scrollIntoView ??= () => {};
  useStore.setState({
    pages: normalizePages([
      page,
      { ...page, pageId: "guide", title: "Guide tab", url: "https://tab.test/" },
    ] as never),
    activePageId: page.pageId,
    bookmarks: [],
    closedTabs: [{ pageId: "closed", title: "Guide closed", url: "https://closed.test/", closedAt: 1 }],
    programs: [],
    runs: [{ runId: "chat", goal: "Guide chat", status: "completed", createdAt: 1 }],
    settings: {},
    conversationDrafts: {},
    overlay: null,
  } as never);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  vi.spyOn(bridge, "extensions").mockResolvedValue([
    { key: "guide", name: "Guide extension", enabled: true, loaded: true, version: "1" },
  ] as never);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  closeCommandSurface();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

it("opens a quiet compact entry with recent browser objects and exposes filters when selected", async () => {
  nativeOmniboxFixture([]);
  const input = await open();
  expect(host.querySelector('[data-presentation="tab-search"]')).not.toBeNull();
  expect(input.placeholder).toBe("Search tabs, chats, history, bookmarks or extensions");
  expect(host.querySelector('[role="listbox"]')?.textContent).toContain("Current page");
  expect([...host.querySelectorAll(".cb-section")].map((node) => node.textContent)).toEqual([
    "Open Tabs",
    "Recently Closed",
    "Recent Chat",
  ]);
  expect(host.querySelector(".cb-results-footer")).toBeNull();
  expect(host.querySelector('[role="option"]')?.querySelector(".search-result-detail")).toBeNull();
  await act(async () => key(input, "2", { altKey: true }));
  expect([...host.querySelectorAll(".cb-provider-scopes button")].map((node) => node.textContent)).toEqual([
    "All",
    "Open Tabs",
    "Recently Closed",
    "Bookmarks",
    "History",
    "Extensions",
    "Sites",
    "Work",
    "Ranking",
  ]);
  expect(host.querySelector('.cb-provider-scopes [aria-pressed="true"]')?.textContent).toBe("Open Tabs");
  await act(async () => key(input, "Escape"));
  expect(host.querySelector(".cb-results-footer")).toBeNull();
});

it("closes native tab search without discarding a replacement new-tab draft", async () => {
  nativeOmniboxFixture([]);
  await open();
  await act(async () => COMMAND_ACTIONS["close-tab-search"]());
  expect(useStore.getState().overlay).toBeNull();
  await act(async () => openCommandSurface({ mode: "new-tab", seed: "Unfinished draft" }));
  await settle();
  await act(async () => COMMAND_ACTIONS["close-tab-search"]());
  expect(useStore.getState().overlay).toBe("command-surface");
  expect(host.querySelector<HTMLInputElement>('input[role="combobox"]')?.value).toBe("Unfinished draft");
});

it("keeps all browser-object providers and accepts the selected native row without reclassifying it", async () => {
  const native = nativeOmniboxFixture([
    { id: "search", type: "search", title: "Search the web for guide", url: "https://search.test/?q=guide" },
    { id: "bookmark", type: "bookmark", title: "Guide bookmark", url: "https://bookmark.test/" },
    { id: "history", type: "history", title: "Guide history", url: "https://history.test/", index: 7 },
  ]);
  const input = await open();
  await act(async () => type(input, "guide"));
  await settle();
  for (const title of [
    "Guide extension",
    "Guide tab",
    "Guide closed",
    "Guide chat",
    "Guide bookmark",
    "Guide history",
  ])
    expect(host.querySelector('[role="listbox"]')?.textContent).toContain(title);
  expect(host.querySelector('[role="listbox"]')?.textContent).not.toContain("Search the web for guide");
  await act(async () => key(input, "5", { altKey: true }));
  await act(async () => key(input, "Enter", { isComposing: true }));
  expect(native.open).not.toHaveBeenCalled();
  await act(async () => key(input, "Enter"));
  expect(native.open).toHaveBeenCalledWith(
    expect.objectContaining({
      disposition: "new-foreground-tab",
      match: expect.objectContaining({ index: 7, url: "https://history.test/" }),
    }),
  );
});

it("keeps unmatched text editable and leaves Cmd-L on its ordinary address route", async () => {
  const native = nativeOmniboxFixture([]);
  useStore.setState({ settings: { tabLayout: "horizontal" } });
  const input = await open();
  await act(async () => type(input, "@no-existing-object"));
  await settle();
  expect(input.value).toBe("@no-existing-object");
  expect(host.querySelectorAll('[role="option"]')).toHaveLength(0);
  await act(async () => key(input, "Enter"));
  expect(native.open).not.toHaveBeenCalled();
  expect(host.querySelector('[data-presentation="tab-search"]')).not.toBeNull();
  await act(async () => COMMAND_ACTIONS["open-address"]());
  expect(host.querySelector('[data-presentation="tab-search"]')).toBeNull();
  expect(host.querySelector(".command-surface")?.getAttribute("data-mode")).toBe("edit");
  expect(host.querySelector<HTMLInputElement>("input")!.value).toBe(page.url);
});
