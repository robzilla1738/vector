import { normalizePages } from "./store/pages";
// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Sidebar } from "./components/Sidebar";
import { bridge } from "./bridge";
import { useStore } from "./store";
import { makePage } from "./mock/fixtures";
import * as commands from "./commands";
import { registerScopedControl } from "./scoped-control-commands";
import * as membership from "./use-tab-membership";
const persisted = vi.hoisted(() => {
  const values = new Map<string, string>();
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  return { values, storage };
});
vi.mock("./store/persistence", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  storage: persisted.storage,
}));
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let originalScroll: PropertyDescriptor | undefined;
let original: ReturnType<typeof useStore.getState>,
  originalPrivate: boolean,
  originalKind: typeof bridge.windowKind,
  originalWindowId: string;
const overrides = {
  "toggle-sidebar-section": [{ key: "j", command: true, alt: true }],
  "toggle-sidebar-spaces": [{ key: "k", command: true, alt: true }],
};
beforeEach(() => {
  persisted.values.clear();
  original = useStore.getState();
  originalPrivate = bridge.privateMode;
  originalKind = bridge.windowKind;
  originalWindowId = bridge.windowId;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const data = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return data.size;
    },
    key: (index) => [...data.keys()][index] ?? null,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => {
      data.set(key, value);
    },
    removeItem: (key) => {
      data.delete(key);
    },
    clear: () => data.clear(),
  };
  vi.stubGlobal("localStorage", storage);
  vi.spyOn(window, "localStorage", "get").mockReturnValue(storage);
  originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
  Object.defineProperty(Element.prototype, "scrollIntoView", {
    configurable: true,
    writable: true,
    value: vi.fn(),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    { width: 200, height: 30 },
  ] as unknown as DOMRectList);
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  bridge.privateMode = false;
  bridge.windowKind = "normal";
  useStore.setState({
    pages: normalizePages([]),
    activePageId: null,
    overlay: null,
    sidebar: "expanded",
    sidebarPeek: false,
    sidebarSections: { bookmarks: true, chats: false, tabs: true },
    bookmarks: [],
    runs: [],
    programs: [],
    sets: [],
    settings: { ...original.settings, tabLayout: "vertical", shortcutOverrides: overrides },
  });
  host = document.createElement("div");
  document.body.append(host);
  root = createRoot(host);
});
afterEach(async () => {
  await act(async () => root.unmount());
  host.remove();
  useStore.setState(original, true);
  bridge.privateMode = originalPrivate;
  bridge.windowKind = originalKind;
  bridge.windowId = originalWindowId;
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

async function mount() {
  await act(async () => root.render(<Sidebar />));
}
function heading(title: string) {
  const node = host.querySelector<HTMLButtonElement>(`section[aria-label="${title}"] > button`);
  expect(node).not.toBeNull();
  return node!;
}
function chooser() {
  const node = host.querySelector<HTMLButtonElement>('[data-command-id="toggle-sidebar-spaces"]');
  expect(node).not.toBeNull();
  return node!;
}
function originalEvent(target: HTMLElement) {
  const event = new MouseEvent("click", { bubbles: true });
  Object.defineProperty(event, "target", { value: target });
  return event;
}
it.each(["Bookmarks", "Chats", "Tabs"])(
  "mounted %s heading click and remap preserve exact original storage key and disclosure",
  async (title) => {
    await mount();
    const control = heading(title),
      key = title.toLowerCase() as "bookmarks" | "chats" | "tabs";
    const before = useStore.getState().sidebarSections[key];
    expect(control.dataset.commandId).toBe("toggle-sidebar-section");
    const body = document.getElementById(control.getAttribute("aria-controls")!)!;
    await act(async () => control.click());
    expect(useStore.getState().sidebarSections[key]).toBe(!before);
    expect(persisted.values.get(`aux.sidebar.${key}`)).toBe(before ? "closed" : "open");
    expect(body.getAttribute("aria-hidden")).toBe(String(before));
    control.focus();
    await act(async () => {
      expect(commands.dispatchShortcut({ key: "j", meta: true, alt: true, shift: false })).toBe(true);
    });
    expect(useStore.getState().sidebarSections[key]).toBe(before);
    expect(persisted.values.get(`aux.sidebar.${key}`)).toBe(before ? "open" : "closed");
  },
);
it("section shortcuts refuse foreign focus, ambiguous original owners and hidden headings", async () => {
  await mount();
  const control = heading("Tabs"),
    snapshot = useStore.getState().sidebarSections;
  const foreign = document.createElement("button");
  host.append(foreign);
  foreign.focus();
  await expect(commands.executeCommand("toggle-sidebar-section")).rejects.toThrow("focused control");
  foreign.remove();
  control.focus();
  const other = vi.fn(),
    retire = registerScopedControl(control, "toggle-sidebar-section", "foreign", other);
  try {
    await expect(commands.executeCommand("toggle-sidebar-section")).rejects.toThrow();
    expect(other).not.toHaveBeenCalled();
  } finally {
    retire();
  }
  control.hidden = true;
  await expect(
    commands.executeCommand("toggle-sidebar-section", { nativeInputEvent: originalEvent(control) }),
  ).rejects.toThrow();
  expect(useStore.getState().sidebarSections).toBe(snapshot);
  control.hidden = false;
});
it("Private exposes session Chats and Agent beside native browsing controls, without Bookmarks", async () => {
  bridge.privateMode = true;
  bridge.windowKind = "private";
  await mount();
  expect(host.querySelector('section[aria-label="Bookmarks"]')).toBeNull();
  expect(host.querySelector('section[aria-label="Chats"]')).not.toBeNull();
  expect(host.querySelector('[aria-label="Toggle agent rail"]')).not.toBeNull();
  const chats = heading("Chats"),
    chatsBefore = useStore.getState().sidebarSections.chats;
  await act(async () => chats.click());
  expect(useStore.getState().sidebarSections.chats).toBe(!chatsBefore);
  expect(chats.getAttribute("aria-expanded")).toBe(String(!chatsBefore));
  expect(host.querySelector('[data-command-id="new-chat"]')).not.toBeNull();
  expect(host.querySelector(".sb-show-all")).toBeNull();
  const chatOptions = host.querySelector<HTMLButtonElement>('[aria-label="Chat options"]')!;
  await act(async () => chatOptions.click());
  expect(document.body.textContent).toContain("All private chats");
  const tabs = heading("Tabs"),
    before = useStore.getState().sidebarSections.tabs;
  await act(async () => tabs.click());
  expect(useStore.getState().sidebarSections.tabs).toBe(!before);
  const trigger = chooser();
  await act(async () => trigger.click());
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.querySelector('[role="menu"][aria-label="Spaces and browser controls"]')).not.toBeNull();
});
it("a retired page clears a still-mounted tab row before its list projection catches up", async () => {
  const page = makePage(1, { windowId: bridge.windowId, ownedByRuntime: false });
  vi.spyOn(membership, "useTabMembership").mockReturnValue([
    { pageId: page.pageId, viewStatus: "visible", ownedByRuntime: false },
  ]);
  useStore.setState({ pages: normalizePages([page]), connected: false });
  await mount();
  expect(host.querySelectorAll('[role="tab"]')).toHaveLength(1);
  await act(async () => useStore.setState({ pages: normalizePages([]) }));
  expect(host.querySelectorAll('[role="tab"]')).toHaveLength(0);
  expect(host.querySelector('[aria-label="Sidebar"]')).not.toBeNull();
});
it("original Space chooser click and focused remap retain menu and current layout identity", async () => {
  await mount();
  const trigger = chooser(),
    layout = useStore.getState().layout;
  await act(async () => trigger.click());
  expect(trigger.getAttribute("aria-expanded")).toBe("true");
  expect(document.querySelector('[role="menu"][aria-label="Spaces and browser controls"]')).not.toBeNull();
  trigger.focus();
  await act(async () => {
    expect(commands.dispatchShortcut({ key: "k", meta: true, alt: true, shift: false })).toBe(true);
  });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(useStore.getState().layout).toBe(layout);
  expect(document.querySelector('[role="menu"][aria-label="Spaces and browser controls"]')).toBeNull();
});
it.each(["toggle-sidebar-section", "toggle-sidebar-spaces"])(
  "%s refuses observed foreign window permanently and detached old event after ABA",
  async (id) => {
    await mount();
    const control = id === "toggle-sidebar-section" ? heading("Tabs") : chooser(),
      event = originalEvent(control);
    bridge.windowId = "foreign-window";
    await expect(commands.executeCommand(id, { nativeInputEvent: event })).rejects.toThrow("original");
    bridge.windowId = originalWindowId;
    await expect(commands.executeCommand(id, { nativeInputEvent: event })).rejects.toThrow("original");
    await act(async () => root.render(<Sidebar key="fresh-window" />));
    await expect(commands.executeCommand(id, { nativeInputEvent: event })).rejects.toThrow();
    const fresh = id === "toggle-sidebar-section" ? heading("Tabs") : chooser();
    await act(async () => {
      await commands.executeCommand(id, { nativeInputEvent: originalEvent(fresh) });
    });
  },
);
it("Space chooser refuses original active Space transfer and ambiguous or hidden trigger", async () => {
  await mount();
  const trigger = chooser(),
    event = originalEvent(trigger);
  const foreign = document.createElement("button");
  host.append(foreign);
  foreign.focus();
  await expect(commands.executeCommand("toggle-sidebar-spaces")).rejects.toThrow("focused control");
  foreign.remove();
  const retire = registerScopedControl(trigger, "toggle-sidebar-spaces", "foreign", vi.fn());
  trigger.focus();
  try {
    await expect(commands.executeCommand("toggle-sidebar-spaces")).rejects.toThrow();
  } finally {
    retire();
  }
  trigger.hidden = true;
  await expect(
    commands.executeCommand("toggle-sidebar-spaces", { nativeInputEvent: event }),
  ).rejects.toThrow();
  trigger.hidden = false;
  const layout = useStore.getState().layout;
  await act(async () => useStore.setState({ layout: { ...layout, activeSpaceId: "foreign-space" } }));
  await expect(
    commands.executeCommand("toggle-sidebar-spaces", { nativeInputEvent: event }),
  ).rejects.toThrow();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

it.each(["toggle-sidebar-section", "toggle-sidebar-spaces"])(
  "%s permanently retires observed Private transition without permitting normal return revival",
  async (id) => {
    await mount();
    const control = id === "toggle-sidebar-section" ? heading("Tabs") : chooser(),
      event = originalEvent(control);
    bridge.privateMode = true;
    bridge.windowKind = "private";
    await expect(commands.executeCommand(id, { nativeInputEvent: event })).rejects.toThrow("original");
    bridge.privateMode = false;
    bridge.windowKind = "normal";
    await expect(commands.executeCommand(id, { nativeInputEvent: event })).rejects.toThrow("original");
  },
);
it.each(["toggle-sidebar-section", "toggle-sidebar-spaces"])(
  "%s refuses actual hidden sidebar without removing or dispatching original mounted control",
  async (id) => {
    await mount();
    const control = id === "toggle-sidebar-section" ? heading("Tabs") : chooser(),
      event = originalEvent(control);
    const sections = useStore.getState().sidebarSections;
    await act(async () => useStore.getState().setSidebar("hidden"));
    expect(control.isConnected).toBe(true);
    await expect(commands.executeCommand(id, { nativeInputEvent: event })).rejects.toThrow();
    expect(useStore.getState().sidebarSections).toBe(sections);
    expect(chooser().getAttribute("aria-expanded")).toBe("false");
  },
);

it("pins dropped tabs once, keeps bookmarks separate, and ignores the retired sort preference", async () => {
  const spaceId = original.layout.activeSpaceId;
  const pages = [
    {
      pageId: "pin-a",
      url: "https://example.com",
      title: "Example",
      viewStatus: "visible",
      ownedByRuntime: false,
      lastActiveAt: 1,
    },
    {
      pageId: "pin-b",
      url: "https://example.com",
      title: "Duplicate",
      viewStatus: "visible",
      ownedByRuntime: false,
      lastActiveAt: 5,
    },
    {
      pageId: "pin-internal",
      url: "chrome://newtab",
      title: "New Tab",
      viewStatus: "visible",
      ownedByRuntime: false,
      lastActiveAt: 10,
    },
  ] as import("@aux/contracts").PageTarget[];
  persisted.values.set("aux.sidebar-tab-order", "recently-used");
  useStore.setState({
    layout: {
      ...original.layout,
      activeSpaceId: spaceId,
      pins: {},
      folders: [],
      order: pages.map((p) => p.pageId),
      tabSpace: {},
    },
    pages: normalizePages(pages),
    connected: false,
  });
  await mount();
  expect(host.textContent).not.toContain("Last used");
  expect([...host.querySelectorAll('[role="tab"]')].map((node) => node.textContent)).toEqual([
    expect.stringContaining("Example"),
    expect.stringContaining("Duplicate"),
    expect.stringContaining("New Tab"),
  ]);
  const drop = () => {
    const event = new Event("drop", { bubbles: true, cancelable: true });
    Object.defineProperty(event, "dataTransfer", {
      value: {
        types: ["application/x-aux-tabs"],
        getData: () => "pin-a\npin-b\npin-internal",
      },
    });
    host.querySelector('[aria-label="Pinned tabs"]')!.dispatchEvent(event);
  };
  await act(async () => drop());
  expect(useStore.getState().layout.pins[spaceId]).toEqual([
    { url: "https://example.com", title: "Example", pageId: "pin-a" },
  ]);
  expect(useStore.getState().bookmarks).toEqual([]);
  await act(async () => drop());
  expect(useStore.getState().layout.pins[spaceId]).toHaveLength(1);
  expect(host.querySelectorAll('[role="tab"]')).toHaveLength(2);
});

it("announces a native sleeping tab even when an older loading flag remains", async () => {
  const page = makePage(1, {
    windowId: bridge.windowId,
    lifecycle: "discarded",
    loading: true,
    viewStatus: "hidden",
    ownedByRuntime: false,
  });
  const layout = useStore.getState().layout;
  useStore.setState({
    pages: normalizePages([page]),
    layout: {
      ...layout,
      order: [page.pageId],
      folders: [],
      tabSpace: { [page.pageId]: layout.activeSpaceId },
    },
  });
  await mount();
  const tab = host.querySelector<HTMLElement>('[role="tab"]')!;
  expect(tab.getAttribute("aria-description")).toContain("Sleeping. Reloads when opened.");
  expect(tab.querySelector('[role="img"][aria-label="Sleeping tab"]')).not.toBeNull();
  expect(tab.querySelector(".spin")).toBeNull();
});
