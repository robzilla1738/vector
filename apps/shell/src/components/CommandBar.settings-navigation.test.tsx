// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { TabRecord } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore } from "../store";
import { nativePageId } from "../chrome";
import { emptyLayout } from "../workspace";
import { useSettingsRoute } from "../app/use-settings-route";
import { executeCommand } from "../commands";
import { useMemoryDrafts } from "../memory-drafts";
import { nativeOmniboxFixture } from "../test-native-omnibox";
import { CommandBar } from "./CommandBar";
import { Settings } from "./Settings";

vi.mock("../bridge", async (original) => ({
  ...(await original<typeof import("../bridge")>()),
  inNativeHost: true,
}));
vi.mock("../use-feature", () => ({ useFeature: () => false }));
vi.mock("../features/registry", async (original) => ({
  ...(await original<typeof import("../features/registry")>()),
  featureSettingsAvailable: () => false,
  FeatureSettings: () => null,
}));
const originalBridge = {
  windowId: bridge.windowId,
  windowKind: bridge.windowKind,
  privateMode: bridge.privateMode,
};
const originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
const originalState = useStore.getState(),
  originalDrafts = useMemoryDrafts.getState(),
  originalPath = window.location.href;
const url = "http://127.0.0.1:4826/";
const tab: TabRecord = {
  pageId: "human-page",
  windowId: "settings-navigation",
  windowKind: "normal",
  url: "https://original.example/",
  title: "Original page",
  loading: false,
  muted: false,
  audible: false,
  canGoBack: true,
  canGoForward: false,
  popup: false,
  crashed: false,
  runtimeOwned: false,
  generation: 1,
  createdAt: 1,
  lastActiveAt: 1,
};
let host: HTMLDivElement,
  root: ReturnType<typeof createRoot>,
  native: ReturnType<typeof nativeOmniboxFixture>;
function Harness() {
  useSettingsRoute();
  const overlay = useStore((state) => state.overlay);
  return (
    <>
      <CommandBar compact />
      {overlay === "settings" && <Settings />}
    </>
  );
}
function publishNavigation() {
  const state = useStore.getState();
  state.applyTabsPatch({
    baseVersion: state.catalogVersion,
    version: state.catalogVersion + 1,
    ts: 2,
    ops: [{ op: "upsert", tab: { ...tab, url, title: "Readiness record" } }],
  });
}
function visibleNativePage() {
  const state = useStore.getState(),
    page = state.pages.byId[state.activePageId ?? ""];
  return nativePageId({
    mode: state.mode,
    overlay: state.overlay,
    activePageId: state.activePageId,
    url: page?.url,
    backend: page?.backend,
    viewStatus: page?.viewStatus,
  });
}
const type = (input: HTMLInputElement, value: string) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
};
async function mount() {
  await act(async () => root.render(<Harness />));
  await act(async () => vi.dynamicImportSettled());
}
async function address() {
  const input = host.querySelector<HTMLInputElement>('input[role="combobox"]')!;
  await act(async () => {
    input.focus();
    type(input, url);
  });
  return input;
}
async function submit(input: HTMLInputElement, metaKey = false) {
  await act(async () =>
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true, metaKey }),
    ),
  );
}
beforeEach(() => {
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() });
  bridge.windowId = tab.windowId;
  bridge.windowKind = "normal";
  bridge.privateMode = false;
  const layout = emptyLayout();
  useStore.setState(
    {
      ...originalState,
      layout,
      connected: false,
      mode: "focus",
      overlay: "settings",
      settingsCategory: "Archived chats",
      settingsPageTitle: "Archived chats",
      settings: {},
      runs: [],
      programs: [],
      bookmarks: [],
      closedTabs: [],
      toasts: [],
      restoringTabs: false,
      catalogVersion: 0,
    },
    true,
  );
  useStore.getState().syncTabsSnapshot({
    version: 1,
    tabs: [tab],
    windows: [{ windowId: tab.windowId, activePageId: tab.pageId, order: [tab.pageId] }],
  });
  window.history.replaceState(null, "", "/");
  window.history.pushState(null, "", "/settings/archived-chats");
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  vi.spyOn(bridge, "focusShell").mockResolvedValue(undefined);
  vi.spyOn(bridge, "invoke").mockResolvedValue([] as never);
  vi.spyOn(bridge, "extensions").mockResolvedValue([]);
  vi.spyOn(bridge, "tabCommand").mockImplementation(async (command) => {
    if (command.kind === "navigate") publishNavigation();
    return {
      commandId: "human-command",
      status: "applied",
      catalogVersion: useStore.getState().catalogVersion,
    };
  });
  native = nativeOmniboxFixture([{ id: "record", title: "Readiness record", type: "history", url }]);
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(originalState, true);
  useMemoryDrafts.setState(originalDrafts, true);
  Object.assign(bridge, originalBridge);
  window.history.replaceState(null, "", originalPath);
  vi.restoreAllMocks();
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  vi.unstubAllGlobals();
});
it("reveals accepted native URL navigation from actual Archived Chats Settings while runtime is unavailable", async () => {
  await mount();
  expect(host.querySelector('[aria-label="Settings"]')).not.toBeNull();
  expect(visibleNativePage()).toBeNull();
  useMemoryDrafts.getState().write("retained-note", { revision: 7, content: "Unsent owner draft" });
  native.open.mockImplementation(async () => {
    publishNavigation();
    return true;
  });
  const input = await address();
  await submit(input);
  expect(native.open).toHaveBeenCalledWith(expect.objectContaining({ disposition: "current-tab" }));
  expect(useStore.getState().pages.byId[tab.pageId]?.title).toBe("Readiness record");
  expect(useStore.getState().overlay).toBeNull();
  expect(host.querySelector('[aria-label="Settings"]')).toBeNull();
  expect(window.location.pathname).toBe("/");
  expect(visibleNativePage()).toBe(tab.pageId);
  expect(bridge.overlay).toHaveBeenLastCalledWith(false);
  expect(useMemoryDrafts.getState().drafts["retained-note"]).toEqual({
    revision: 7,
    content: "Unsent owner draft",
  });
  expect(bridge.invoke).not.toHaveBeenCalledWith("pages.navigate", expect.anything());
});
it("reveals a selected native history link through the same original overlay retirement", async () => {
  await mount();
  const input = await address();
  await act(async () => type(input, "readiness"));
  native.open.mockImplementation(async () => {
    publishNavigation();
    return true;
  });
  const row = [...host.querySelectorAll<HTMLElement>('[role="option"]')].find((node) =>
    node.textContent?.includes("Readiness record"),
  )!;
  expect(row).toBeTruthy();
  await act(async () => row.click());
  expect(native.open).toHaveBeenCalledWith(
    expect.objectContaining({ match: expect.objectContaining({ url }), disposition: "current-tab" }),
  );
  expect(useStore.getState().overlay).toBeNull();
  expect(visibleNativePage()).toBe(tab.pageId);
  expect(host.querySelector(".cb-display .cb-title")?.textContent).toContain("127.0.0.1");
});
it("keeps Settings painted on native refusal, then retires it only on an accepted foreground retry", async () => {
  await mount();
  const input = await address();
  native.open.mockResolvedValueOnce(false).mockImplementation(async () => {
    publishNavigation();
    return true;
  });
  await submit(input);
  expect(useStore.getState().overlay).toBe("settings");
  expect(window.location.pathname).toBe("/settings/archived-chats");
  await submit(input);
  expect(useStore.getState().overlay).toBeNull();
  expect(window.location.pathname).toBe("/");
});
it("does not dismiss Settings for a native background open", async () => {
  await mount();
  let open!: ReturnType<typeof import("./omnibox/use-native-omnibox").useNativeOmnibox>["openInput"];
  // The explicit new-tab surface owns Cmd+Return's background disposition; its native hook is the same producer.
  function Background() {
    const native = useNativeOmnibox(true, url, 1);
    open = native.openInput;
    return null;
  }
  const { useNativeOmnibox } = await import("./omnibox/use-native-omnibox");
  const extra = document.createElement("div");
  document.body.append(extra);
  const background = createRoot(extra);
  try {
    await act(async () => background.render(<Background />));
    await act(async () => open("new-background-tab"));
    expect(native.open).toHaveBeenLastCalledWith(
      expect.objectContaining({ disposition: "new-background-tab" }),
    );
    expect(useStore.getState().overlay).toBe("settings");
    expect(window.location.pathname).toBe("/settings/archived-chats");
  } finally {
    await act(async () => background.unmount());
    extra.remove();
  }
});
it("does not dismiss a newer same-category Settings editor after an original native acknowledgement", async () => {
  await mount();
  const input = await address();
  let finish!: (accepted: boolean) => void;
  native.open.mockImplementationOnce(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  await submit(input);
  await act(async () => useStore.getState().setOverlay(null));
  await act(async () => useStore.getState().setOverlay("settings"));
  await act(async () => vi.dynamicImportSettled());
  const search = host.querySelector<HTMLInputElement>('input[aria-label="Search settings"]')!;
  expect(search).toBeTruthy();
  await act(async () => {
    search.focus();
    type(search, "New unsaved edit");
  });
  await act(async () => finish(true));
  expect(useStore.getState().overlay).toBe("settings");
  expect(window.location.pathname).toBe("/settings/archived-chats");
  expect(search.isConnected).toBe(true);
  expect(search.value).toBe("New unsaved edit");
  expect(document.activeElement).toBe(search);
});
it("keeps the current Settings route when a pending native accept belongs to a previous category", async () => {
  await mount();
  const input = await address();
  let finish!: (accepted: boolean) => void;
  native.open.mockImplementationOnce(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  await submit(input);
  await act(async () => {
    window.history.pushState(null, "", "/settings/quick-ask");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  await act(async () => finish(true));
  expect(useStore.getState().overlay).toBe("settings");
  expect(window.location.pathname).toBe("/settings/quick-ask");
});
it("keeps ordinary store-based links and shell Back on their existing runtime-independent route path", async () => {
  await mount();
  await act(async () => useStore.getState().navigatePage(tab.pageId, url));
  expect(useStore.getState().overlay).toBeNull();
  expect(window.location.pathname).toBe("/");
  expect(visibleNativePage()).toBe(tab.pageId);
  await act(async () => {
    window.history.pushState(null, "", "/settings/archived-chats");
    window.dispatchEvent(new PopStateEvent("popstate"));
  });
  expect(useStore.getState().overlay).toBe("settings");
  await act(async () => executeCommand("back", { settingsRoute: true }));
  await act(async () => new Promise((resolve) => setTimeout(resolve, 20)));
  expect(useStore.getState().overlay).toBeNull();
  expect(window.location.pathname).toBe("/");
  await act(async () => executeCommand("back", { settingsRoute: false }));
  expect(bridge.tabCommand).toHaveBeenCalledWith(
    expect.objectContaining({ kind: "back", pageId: tab.pageId }),
    expect.anything(),
  );
});

it("preserves new edits inside the same Settings view while its original browser acceptance is pending", async () => {
  await mount();
  const input = await address();
  let finish!: (accepted: boolean) => void;
  native.open.mockImplementationOnce(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  await submit(input);
  const search = host.querySelector<HTMLInputElement>('input[aria-label="Search settings"]')!;
  await act(async () => {
    search.focus();
    type(search, "New owner edit");
  });
  await act(async () => finish(true));
  expect(useStore.getState().overlay).toBe("settings");
  expect(window.location.pathname).toBe("/settings/archived-chats");
  expect(search.isConnected).toBe(true);
  expect(search.value).toBe("New owner edit");
  expect(document.activeElement).toBe(search);
});
it("retains the original view when the native window owner changes before acceptance", async () => {
  await mount();
  const input = await address();
  let finish!: (accepted: boolean) => void;
  native.open.mockImplementationOnce(
    () =>
      new Promise<boolean>((resolve) => {
        finish = resolve;
      }),
  );
  await submit(input);
  bridge.windowId = "new-native-owner";
  await act(async () => finish(true));
  expect(useStore.getState().overlay).toBe("settings");
  expect(window.location.pathname).toBe("/settings/archived-chats");
});
