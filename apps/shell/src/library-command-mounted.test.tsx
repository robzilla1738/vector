// @vitest-environment jsdom
import { act } from "react";
import { createRoot } from "react-dom/client";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { Toolbar } from "./components/Toolbar";
import { Sidebar } from "./components/Sidebar";
import { bridge } from "./bridge";
import { useStore } from "./store";
import * as commands from "./commands";
import { registerScopedControl } from "./scoped-control-commands";
import { makePage } from "./mock/fixtures";
import { shortcutLabel } from "./use-shortcut-label";
let host: HTMLDivElement, root: ReturnType<typeof createRoot>;
let originalScroll: PropertyDescriptor | undefined;
let original: ReturnType<typeof useStore.getState>, originalPrivate: boolean, originalKind: typeof bridge.windowKind, originalWindowId: string;
const overrides = { "command-bookmarks": [{ key: "l", command: true, alt: true }] };
beforeEach(() => {
  original = useStore.getState(); originalPrivate = bridge.privateMode; originalKind = bridge.windowKind; originalWindowId = bridge.windowId;
  vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
  const data = new Map<string, string>();
  const storage: Storage = { get length() { return data.size; }, key: index => [...data.keys()][index] ?? null,
    getItem: key => data.get(key) ?? null, setItem: (key, value) => { data.set(key, value); }, removeItem: key => { data.delete(key); }, clear: () => data.clear() };
  vi.stubGlobal("localStorage", storage);
  vi.spyOn(window, "localStorage", "get").mockReturnValue(storage);
  originalScroll = Object.getOwnPropertyDescriptor(Element.prototype, "scrollIntoView");
  Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, writable: true, value: vi.fn() });
  vi.stubGlobal("ResizeObserver", class { observe() {} disconnect() {} });
  vi.stubGlobal("matchMedia", () => ({ matches: true, addEventListener() {}, removeEventListener() {} }));
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([{ width: 200, height: 30 }] as unknown as DOMRectList);
  vi.spyOn(bridge, "overlay").mockResolvedValue(true);
  bridge.privateMode = false; bridge.windowKind = "normal";
  useStore.setState({ pages: [], activePageId: null, overlay: null, sidebar: "hidden", sidebarPeek: false,
    sidebarSections: { bookmarks: true, chats: false, tabs: true }, bookmarks: [], runs: [], programs: [], sets: [],
    settings: { ...original.settings, tabLayout: "vertical", shortcutOverrides: overrides } });
  host = document.createElement("div"); document.body.append(host); root = createRoot(host);
});
afterEach(async () => { await act(async () => root.unmount()); host.remove(); useStore.setState(original, true);
  bridge.privateMode = originalPrivate; bridge.windowKind = originalKind; bridge.windowId = originalWindowId;
  if (originalScroll) Object.defineProperty(Element.prototype, "scrollIntoView", originalScroll);
  else Reflect.deleteProperty(Element.prototype, "scrollIntoView");
  vi.restoreAllMocks(); vi.unstubAllGlobals(); });
function button(label: string): HTMLButtonElement {
  const rows = [...document.querySelectorAll<HTMLButtonElement>("button")].filter(node => node.getAttribute("aria-label") === label);
  expect(rows).toHaveLength(1); return rows[0]!;
}
it("hidden-sidebar Toolbar Library and remapped shortcut execute the same genuine registered overlay action", async () => {
  const run = vi.spyOn(commands, "runCommand"); await act(async () => root.render(<Toolbar />));
  const library = button("Library"); expect(library.dataset.commandId).toBe("command-bookmarks");
  expect(library.title).toBe(`Library (${shortcutLabel("command-bookmarks", overrides)})`);
  await act(async () => library.click()); expect(run).toHaveBeenCalledWith("command-bookmarks");
  expect(useStore.getState().overlay).toBe("bookmarks");
  await act(async () => useStore.getState().setOverlay(null));
  await act(async () => { expect(commands.dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true); });
  expect(useStore.getState().overlay).toBe("bookmarks");
});
it("Sidebar More Library closes its real mounted menu and reaches the registered Library action", async () => {
  useStore.setState({ sidebar: "expanded" }); const run = vi.spyOn(commands, "runCommand");
  await act(async () => root.render(<Sidebar />)); const more = button("More"); await act(async () => more.click());
  expect(more.getAttribute("aria-expanded")).toBe("true"); const library = button("Library");
  expect(library.getAttribute("role")).toBe("menuitem");
  expect(library.querySelector("kbd")?.textContent).toBe(shortcutLabel("command-bookmarks", overrides));
  await act(async () => library.click());
  expect(run).toHaveBeenCalledWith("command-bookmarks"); expect(useStore.getState().overlay).toBe("bookmarks");
  expect(more.getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector('[role="menuitem"][aria-label="Library"]')).toBeNull();
});
it("bookmark Show all invokes the genuine command without changing saved bookmarks", async () => {
  const bookmarks = Array.from({ length: 5 }, (_, i) => ({ url: `https://example.test/saved/${i}`, title: `Saved ${i}`, createdAt: i }));
  useStore.setState({ sidebar: "expanded", bookmarks }); const run = vi.spyOn(commands, "runCommand");
  await act(async () => root.render(<Sidebar />));
  const rows = [...host.querySelectorAll<HTMLButtonElement>("button")].filter(node => node.textContent === "Show all 5");
  expect(rows).toHaveLength(1); expect(rows[0]!.dataset.commandId).toBe("command-bookmarks");
  await act(async () => rows[0]!.click()); expect(run).toHaveBeenCalledWith("command-bookmarks");
  expect(useStore.getState().overlay).toBe("bookmarks"); expect(useStore.getState().bookmarks).toEqual(bookmarks);
});
it("Private controls stay absent and real registry eligibility is preserved; unavailable IDs cannot open Library", async () => {
  bridge.privateMode = true; bridge.windowKind = "private";
  await act(async () => root.render(<><Toolbar /><Sidebar /></>));
  expect(document.querySelector('[data-command-id="command-bookmarks"]')).toBeNull();
  expect(document.querySelector('[aria-label="More"]')).toBeNull();
  // Original command-bookmarks metadata has no window-kind restriction.
  await act(async () => { expect(commands.dispatchShortcut({ key: "l", meta: true, alt: true, shift: false })).toBe(true); });
  expect(useStore.getState().overlay).toBe("bookmarks"); await act(async () => useStore.getState().setOverlay(null));
  expect(commands.runCommand("unavailable-library-command")).toBe(false);
  await expect(commands.executeCommand("unavailable-library-command")).rejects.toThrow();
  expect(useStore.getState().overlay).toBeNull();
});

it.each([
  ["Downloads", "downloads", "downloads"],
  ["Settings", "settings", "settings"],
] as const)("More→%s closes the actual menu and opens the original registered overlay", async (label, id, overlay) => {
  useStore.setState({ sidebar: "expanded" });
  const run = vi.spyOn(commands, "runCommand");
  await act(async () => root.render(<Sidebar />));
  const more = button("More"); await act(async () => more.click());
  const item = button(label); expect(item.dataset.commandId).toBe(id);
  await act(async () => item.click());
  expect(run).toHaveBeenCalledWith(id); expect(useStore.getState().overlay).toBe(overlay);
  expect(more.getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector(`[role="menuitem"][aria-label="${label}"]`)).toBeNull();
});
it.each([false, true])("Sidebar overview uses real registered toggle in Private=%s", async privateMode => {
  bridge.privateMode = privateMode; bridge.windowKind = privateMode ? "private" : "normal";
  useStore.setState({ sidebar: "expanded", mode: "focus" });
  const run = vi.spyOn(commands, "runCommand");
  await act(async () => root.render(<Sidebar />));
  if (!privateMode) await act(async () => button("More").click());
  const overview = button("Tab overview"); expect(overview.dataset.commandId).toBe("overview");
  await act(async () => overview.click());
  expect(run).toHaveBeenCalledWith("overview"); expect(useStore.getState().mode).toBe("overview");
  expect(document.querySelector("button[aria-label=More]")?.getAttribute("aria-expanded") ?? null).toBe(privateMode ? null : "false");
  if (!privateMode) await act(async () => button("More").click());
  await act(async () => button("Tab overview").click());
  expect(useStore.getState().mode).toBe("focus");
});
it.each([
  ["Bookmark this page", "bookmark", "bookmarks.add", { url: "https://example.test/current", title: "Original current page" }],
  ["Add to reading list", "command-reading-list", "bookmarks.readingList", { url: "https://example.test/current", title: "Original current page", readingList: true }],
] as const)("More→%s dispatches the current page to the original runtime producer and retires busy only after ACK", async (label, id, method, params) => {
  const page = makePage(0, { pageId: "library-current-page", url: params.url, title: params.title, viewStatus: "visible" });
  useStore.setState({ sidebar: "expanded", pages: [page], activePageId: page.pageId, bookmarkPending: {}, toasts: [] });
  let complete!: (value: never) => void;
  const held = new Promise<never>(resolve => { complete = resolve; });
  const invoke = vi.spyOn(bridge, "invoke").mockImplementation(name => name === method ? held : Promise.resolve([]) as never);
  const run = vi.spyOn(commands, "runCommand");
  await act(async () => root.render(<Sidebar />)); await act(async () => button("More").click());
  const item = button(label); expect(item.disabled).toBe(false); expect(item.dataset.commandId).toBe(id);
  await act(async () => item.click());
  expect(run).toHaveBeenCalledWith(id); expect(button("More").getAttribute("aria-expanded")).toBe("false");
  expect(invoke.mock.calls.filter(([name]) => name === method)).toEqual([[method, params]]);
  expect(useStore.getState().bookmarkPending[page.url]).toBe(true);
  expect(useStore.getState().toasts).toHaveLength(0);
  await act(async () => complete(undefined as never));
  expect(useStore.getState().bookmarkPending[page.url]).toBeUndefined();
  expect(useStore.getState().toasts.map(item => item.text)).toEqual([id === "bookmark" ? "Bookmarked" : "Added to reading list"]);
  expect(useStore.getState().bookmarks).toEqual([]); // Original runtime event owns the list.
});
it.each([false, true])("missing/non-web page (%s) keeps original bookmark/readLater controls disabled without dispatch or RPC", async nonWeb => {
  const page = makePage(0, { url: "about:blank", title: "Blank", viewStatus: "visible" });
  useStore.setState({ sidebar: "expanded", pages: nonWeb ? [page] : [], activePageId: nonWeb ? page.pageId : null });
  const invoke = vi.spyOn(bridge, "invoke").mockResolvedValue([]);
  const run = vi.spyOn(commands, "runCommand");
  await act(async () => root.render(<Sidebar />)); await act(async () => button("More").click()); run.mockClear();
  for (const label of ["Bookmark this page", "Add to reading list"]) {
    const item = button(label); expect(item.disabled).toBe(true); await act(async () => item.click());
  }
  expect(run).not.toHaveBeenCalled();
  expect(invoke.mock.calls.filter(([method]) => method.startsWith("bookmarks."))).toEqual([]);
  expect(button("More").getAttribute("aria-expanded")).toBe("true");
});

const moreChord = { key: "m", meta: true, alt: true, shift: false };
async function mountMore() {
  useStore.setState({ sidebar: "expanded", settings: { ...useStore.getState().settings, shortcutOverrides: {
    ...overrides, "toggle-sidebar-more": [{ key: "m", command: true, alt: true }],
    "open-chat-history": [{ key: "h", command: true, alt: true }], "open-tasks": [{ key: "t", command: true, alt: true }],
  } } });
  await act(async () => root.render(<Sidebar />)); return button("More");
}
it("registered Chats preserves the original draft and reaches history rather than a new chat through click and remap", async () => {
  const drafts = { "chat:original": "Keep my unsent draft" };
  useStore.setState({ conversationDrafts: drafts, agentDraft: "Keep my home draft" });
  const more = await mountMore(); await act(async () => more.click());
  const chats = button("Chats"); expect(chats.dataset.commandId).toBe("open-chat-history");
  expect(chats.querySelector("kbd")?.textContent).toBe(shortcutLabel("open-chat-history", useStore.getState().settings.shortcutOverrides as Parameters<typeof shortcutLabel>[1]));
  await act(async () => chats.click());
  expect(more.getAttribute("aria-expanded")).toBe("false");
  expect(useStore.getState()).toMatchObject({ mode: "conversation", conversationId: "history", overlay: null, agentDraft: "Keep my home draft" });
  expect(useStore.getState().conversationDrafts).toBe(drafts); expect(useStore.getState().runs).toEqual([]);
  await act(async () => { commands.runCommand("new-chat"); }); expect(useStore.getState().conversationId).toBeNull();
  await act(async () => { expect(commands.dispatchShortcut({ key: "h", meta: true, alt: true, shift: false })).toBe(true); });
  expect(useStore.getState().conversationId).toBe("history"); expect(useStore.getState().conversationDrafts).toBe(drafts);
});
it("registered Tasks closes the original menu and remaps to the same actual overlay without task mutation", async () => {
  const more = await mountMore(), programs = useStore.getState().programs;
  await act(async () => more.click()); const tasks = button("Tasks"); expect(tasks.dataset.commandId).toBe("open-tasks");
  await act(async () => tasks.click()); expect(more.getAttribute("aria-expanded")).toBe("false");
  expect(useStore.getState().overlay).toBe("tasks"); expect(useStore.getState().programs).toBe(programs);
  await act(async () => useStore.getState().setOverlay(null));
  await act(async () => { expect(commands.dispatchShortcut({ key: "t", meta: true, alt: true, shift: false })).toBe(true); });
  expect(useStore.getState().overlay).toBe("tasks");
});
it("original More native click and focused remap use actual scoped dispatch while unrelated focus refuses", async () => {
  const more = await mountMore(); expect(more.dataset.commandId).toBe("toggle-sidebar-more");
  await act(async () => more.click()); expect(more.getAttribute("aria-expanded")).toBe("true");
  more.focus(); await act(async () => { expect(commands.dispatchShortcut(moreChord)).toBe(true); });
  expect(more.getAttribute("aria-expanded")).toBe("false");
  const foreign = document.createElement("button"); host.append(foreign); foreign.focus();
  await expect(commands.executeCommand("toggle-sidebar-more")).rejects.toThrow("focused control");
  expect(more.getAttribute("aria-expanded")).toBe("false"); foreign.remove();
});
it("scoped More refuses actual ambiguous ownership without invoking either callback", async () => {
  const more = await mountMore(); more.focus(); const foreign = vi.fn();
  const retire = registerScopedControl(more, "toggle-sidebar-more", "foreign", foreign);
  try { await expect(commands.executeCommand("toggle-sidebar-more")).rejects.toThrow("focused control");
    expect(foreign).not.toHaveBeenCalled(); expect(more.getAttribute("aria-expanded")).toBe("false");
  } finally { retire(); }
  await act(async () => { await commands.executeCommand("toggle-sidebar-more"); });
  expect(more.getAttribute("aria-expanded")).toBe("true");
});
it("hidden and detached actual More owners cannot toggle through retained events", async () => {
  const more = await mountMore(), event = new MouseEvent("click", { bubbles: true });
  Object.defineProperty(event, "target", { value: more });
  await act(async () => useStore.getState().setSidebar("hidden"));
  await expect(commands.executeCommand("toggle-sidebar-more", { nativeInputEvent: event })).rejects.toThrow();
  expect(more.getAttribute("aria-expanded")).toBe("false");
  await act(async () => root.render(null));
  await expect(commands.executeCommand("toggle-sidebar-more", { nativeInputEvent: event })).rejects.toThrow();
});
it("Private registry eligibility refuses Chats Tasks and More without state mutation", async () => {
  await mountMore(); bridge.privateMode = true; bridge.windowKind = "private";
  await act(async () => root.render(<Sidebar key="committed-private" />)); expect(host.querySelector('[aria-label="More"]')).toBeNull();
  for (const command of ["open-chat-history", "open-tasks", "toggle-sidebar-more"]) await expect(commands.executeCommand(command)).rejects.toThrow();
  expect(useStore.getState().overlay).toBeNull(); expect(useStore.getState().conversationId).toBe(original.conversationId);
});
it("observing a foreign native window permanently retires the original More registration without a rerender", async () => {
  const more = await mountMore(); more.focus(); bridge.windowId = "foreign-native-window";
  await expect(commands.executeCommand("toggle-sidebar-more")).rejects.toThrow("original browser tools");
  bridge.windowId = originalWindowId;
  await expect(commands.executeCommand("toggle-sidebar-more")).rejects.toThrow("original browser tools");
  expect(more.getAttribute("aria-expanded")).toBe("false");
});

it("original Agent rail button invokes the existing registered action and toggles actual rail state", async () => {
  await mountMore(); useStore.setState({ railOpen: false });
  const rail = button("Toggle agent rail"); expect(rail.dataset.commandId).toBe("agent-rail");
  await act(async () => rail.click()); expect(useStore.getState().railOpen).toBe(true);
  await act(async () => rail.click()); expect(useStore.getState().railOpen).toBe(false);
});

it.each(["history", "downloads", "settings"] as const)("original Space menu %s callback reaches its existing real registered overlay and closes the menu", async id => {
  await mountMore(); const trigger = host.querySelector<HTMLButtonElement>('button[title="Switch space"]'); expect(trigger).not.toBeNull();
  await act(async () => trigger!.click());
  const menu = document.querySelector('[role="menu"][aria-label="Spaces and browser controls"]'); expect(menu).not.toBeNull();
  const item = [...menu!.querySelectorAll<HTMLButtonElement>('button')].find(node => node.textContent?.trim().startsWith(id[0]!.toUpperCase() + id.slice(1)));
  expect(item).toBeDefined(); await act(async () => item!.click());
  expect(useStore.getState().overlay).toBe(id); expect(trigger!.getAttribute("aria-expanded")).toBe("false");
  expect(document.querySelector('[role="menu"][aria-label="Spaces and browser controls"]')).toBeNull();
});
it("committed window ABA and remount cannot borrow a detached original More event", async () => {
  const more = await mountMore(), originalEvent = new MouseEvent("click", { bubbles: true });
  Object.defineProperty(originalEvent, "target", { value: more });
  bridge.windowId = "committed-other-window";
  await act(async () => root.render(<Sidebar key="other-window" />));
  bridge.windowId = originalWindowId;
  await act(async () => root.render(<Sidebar key="original-window-returned" />));
  await expect(commands.executeCommand("toggle-sidebar-more", { nativeInputEvent: originalEvent })).rejects.toThrow();
  const fresh = button("More"); expect(fresh).not.toBe(more); expect(fresh.getAttribute("aria-expanded")).toBe("false");
  await act(async () => fresh.click()); expect(fresh.getAttribute("aria-expanded")).toBe("true");
});
