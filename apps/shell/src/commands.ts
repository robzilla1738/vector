import {
  COMMANDS,
  effectiveShortcuts,
  matchShortcut,
  type ShellCommandId,
  type CommandDef,
  type ShortcutOverrides,
} from "@aux/contracts";
import type { RefObject } from "react";
import { bridge } from "./bridge";
import { useStore, call, errToast, tabCommand } from "./store";
import { runFeatureCommand, type CommandInvocation } from "./features/registry";
import { savePagePdf, printCurrentPage } from "./page-export";
import { openLocalFile } from "./open-local-file";
import { closeSelectedTabs } from "./use-tab-selection";
import { bookmarkWebUrl } from "./bookmark-files";
import { isTab, tabsInSpace } from "./workspace";
import { createTabSwitcher, type TabSwitcherOrder } from "./tab-switcher";

type StoreState = ReturnType<typeof useStore.getState>;
export interface CommandContext extends CommandInvocation {
  state?: StoreState;
  findInput?: RefObject<HTMLInputElement | null>;
  tabSwitcher?: ReturnType<typeof createTabSwitcher>;
}
type CommandAction = (state: StoreState, context: CommandContext) => unknown;
const defaultSwitcher = createTabSwitcher();
function featureCommand(id: ShellCommandId, state: StoreState) {
  state.toast(`${COMMANDS.find((command) => command.id === id)?.label ?? id} is unavailable in this window`);
}
function findAgain(st: StoreState, forward: boolean) {
  if (st.overlay === "reader") {
    useStore.setState({ readerFindOpen: true });
    if (st.findText) return st.find(st.findText, true, forward);
    return;
  }
  st.setOverlay("find");
  if (st.findText) return st.find(st.findText, true, forward);
}
function activateOrdinal(st: StoreState, n: number) {
  const tabs = tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId);
  const page = n === 9 ? tabs.at(-1) : tabs[n - 1];
  if (page) return st.activate(page.pageId);
}
function switchSpaceOrdinal(st: StoreState, n: number) {
  const space = st.layout.spaces[n - 1];
  if (space) return st.switchSpace(space.id);
}
function cycleTab(st: StoreState, direction: 1 | -1, context: CommandContext) {
  const page = (context.tabSwitcher ?? defaultSwitcher)(
    tabsInSpace(st.layout, st.pages, st.layout.activeSpaceId),
    st.activePageId,
    direction,
    (st.settings.tabSwitcherOrder as TabSwitcherOrder | undefined) ?? "sidebar",
  );
  if (page) return st.activate(page);
}
function bookmarkAll(st: StoreState) {
  const bookmarks = [
    ...new Map(
      st.pages
        .filter((page) => isTab(page) && bookmarkWebUrl(page.url))
        .map((page) => [page.url, { url: page.url, title: page.title.slice(0, 1000) }]),
    ).values(),
  ];
  if (!bookmarks.length) return st.toast("No web tabs to bookmark");
  return call("bookmarks.import", { bookmarks }).then((result) =>
    st.toast(
      result.added
        ? `Bookmarked ${result.added} tab${result.added === 1 ? "" : "s"}`
        : "All tabs already bookmarked",
    ),
  );
}
export const COMMAND_ACTIONS = {
  "minimal-ui": (st) => featureCommand("minimal-ui", st),
  "pin-tab": (st) => featureCommand("pin-tab", st),
  "little-window": (st) => featureCommand("little-window", st),
  "promote-tab": (st) => featureCommand("promote-tab", st),
  "picture-in-picture": (st) => featureCommand("picture-in-picture", st),
  "split-add": (st) => featureCommand("split-add", st),
  "split-close": (st) => featureCommand("split-close", st),
  "split-next": (st) => featureCommand("split-next", st),
  "split-previous": (st) => featureCommand("split-previous", st),
  "split-swap": (st) => featureCommand("split-swap", st),
  "split-flip": (st) => featureCommand("split-flip", st),
  "profile-1": (st) => featureCommand("profile-1", st),
  "profile-2": (st) => featureCommand("profile-2", st),
  "profile-3": (st) => featureCommand("profile-3", st),
  "profile-4": (st) => featureCommand("profile-4", st),
  "profile-5": (st) => featureCommand("profile-5", st),
  "profile-6": (st) => featureCommand("profile-6", st),
  "profile-7": (st) => featureCommand("profile-7", st),
  "profile-8": (st) => featureCommand("profile-8", st),
  "profile-9": (st) => featureCommand("profile-9", st),
  "space-1": (st) => switchSpaceOrdinal(st, 1),
  "space-2": (st) => switchSpaceOrdinal(st, 2),
  "space-3": (st) => switchSpaceOrdinal(st, 3),
  "space-4": (st) => switchSpaceOrdinal(st, 4),
  "space-5": (st) => switchSpaceOrdinal(st, 5),
  "space-6": (st) => switchSpaceOrdinal(st, 6),
  "space-7": (st) => switchSpaceOrdinal(st, 7),
  "space-8": (st) => switchSpaceOrdinal(st, 8),
  "space-9": (st) => switchSpaceOrdinal(st, 9),
  "copy-url": (st) => {
    const page = st.pages.find((page) => page.pageId === st.activePageId);
    if (page) return navigator.clipboard.writeText(page.url).then(() => st.toast("Link copied"));
  },
  "quick-ask": () => bridge.quickAsk("open"),
  "show-archived-tabs": (st) => {
    featureCommand("show-archived-tabs", st);
  },

  "new-tab": (st) => st.newTab(),
  "open-file": () => openLocalFile().catch(errToast),
  "reopen-closed-tab": (st) => st.reopenClosedTab(),
  "close-window": () => bridge.closeWindow(),
  print: (st) => printCurrentPage(st.activePageId).catch(errToast),
  "save-pdf": (st) => savePagePdf(st.activePageId).catch(errToast),
  find: (st, context) => {
    if (st.overlay === "reader") useStore.setState({ readerFindOpen: true });
    else st.setOverlay("find");
    void bridge
      .focusShell()
      .then(() => {
        context.findInput?.current?.focus();
        context.findInput?.current?.select();
      })
      .catch(errToast);
  },
  "find-next": (st) => findAgain(st, true),
  "find-previous": (st) => findAgain(st, false),
  reload: (st) =>
    st.overlay === "settings"
      ? window.dispatchEvent(new Event("aux-settings-refresh"))
      : st.activePageId && tabCommand({ kind: "reload", pageId: st.activePageId }).catch(errToast),
  "hard-reload": (st) =>
    st.overlay === "settings"
      ? window.location.reload()
      : st.activePageId && bridge.hardReload(st.activePageId).catch(errToast),
  "actual-size": (st) => st.activePageId && st.zoomPage(st.activePageId, { reset: true }).catch(errToast),
  "zoom-in": (st) => st.activePageId && st.zoomPage(st.activePageId, { direction: "in" }).catch(errToast),
  "zoom-out": (st) => st.activePageId && st.zoomPage(st.activePageId, { direction: "out" }).catch(errToast),
  reader: (st) => st.setOverlay(st.overlay === "reader" ? null : "reader"),
  sidebar: (st) => st.toggleSidebar(),
  overview: (st) => st.setMode(st.mode === "overview" ? "focus" : "overview"),
  devtools: (st) => st.activePageId && bridge.devTools(st.activePageId),
  "inspect-element": (st) => st.activePageId && bridge.devTools(st.activePageId, "inspect"),
  "view-source": (st) => {
    const p = st.pages.find((x) => x.pageId === st.activePageId);
    if (p?.url.startsWith("http")) void st.navigatePage(p.pageId, `view-source:${p.url}`).catch(errToast);
  },
  back: (st) =>
    st.overlay === "settings"
      ? window.history.back()
      : st.activePageId && tabCommand({ kind: "back", pageId: st.activePageId }).catch(errToast),
  forward: (st) =>
    st.overlay === "settings"
      ? window.history.forward()
      : st.activePageId && tabCommand({ kind: "forward", pageId: st.activePageId }).catch(errToast),
  "open-address": (st) => st.focusCommandBar(),
  palette: (st) =>
    bridge.privateMode ? undefined : st.setOverlay(st.overlay === "palette" ? null : "palette"),
  settings: (st) => (bridge.privateMode ? undefined : st.setOverlay("settings")),
  history: (st) => st.setOverlay("history"),
  downloads: (st) => st.setOverlay("downloads"),
  bookmark: (st) => {
    const p = st.pages.find((x) => x.pageId === st.activePageId);
    if (!p || !isTab(p) || !bookmarkWebUrl(p.url)) return;
    void st.toggleBookmark(p.url, p.title).catch(errToast);
  },
  "bookmark-all": (st) => bookmarkAll(st),
  "agent-rail": (st) => (bridge.privateMode ? undefined : st.toggleRail()),
  "clear-history": (st) => st.setOverlay("clear-history"),
  "tab-next": (st, context) => cycleTab(st, 1, context),
  "tab-previous": (st, context) => cycleTab(st, -1, context),
  "close-tab": (st) => {
    if (st.overlay) return st.setOverlay(null);
    if (!st.activePageId) return void bridge.closeWindow();
    if (st.mode === "focus")
      return void closeSelectedTabs()
        .then((handled) => {
          if (!handled && st.activePageId) return st.closeTab(st.activePageId);
        })
        .catch(errToast);
    return void st.closeTab(st.activePageId);
  },
  "tab-1": (st) => activateOrdinal(st, 1),
  "tab-2": (st) => activateOrdinal(st, 2),
  "tab-3": (st) => activateOrdinal(st, 3),
  "tab-4": (st) => activateOrdinal(st, 4),
  "tab-5": (st) => activateOrdinal(st, 5),
  "tab-6": (st) => activateOrdinal(st, 6),
  "tab-7": (st) => activateOrdinal(st, 7),
  "tab-8": (st) => activateOrdinal(st, 8),
  "tab-9": (st) => activateOrdinal(st, 9),
} satisfies Record<ShellCommandId, CommandAction>;

export function runCommand(id: string, context: CommandContext = {}): boolean {
  const command = COMMANDS.find((command) => command.id === id);
  if (!command) return false;
  const state = context.state ?? useStore.getState();
  const windowKind = bridge.windowKind;
  if ((command as CommandDef).windows && !(command as CommandDef).windows!.includes(windowKind)) return false;
  if (command.handler === "native") {
    void bridge.dispatchCommand(command.id).catch(errToast);
    return true;
  }
  try {
    const feature = runFeatureCommand(id, state, context);
    const result = feature.handled ? feature.result : COMMAND_ACTIONS[command.id](state, context);
    void Promise.resolve(result).catch(errToast);
  } catch (error) {
    errToast(error);
  }
  return true;
}
export function dispatchShortcut(
  shortcut: {
    commandId?: string;
    key: string;
    meta: boolean;
    ctrl?: boolean;
    shift: boolean;
    alt: boolean;
    websitePassThrough?: boolean;
  },
  context: CommandContext = {},
): boolean {
  const state = context.state ?? useStore.getState();
  if (shortcut.websitePassThrough === true) {
    state.setOverlay(null);
    return true;
  }
  if (shortcut.websitePassThrough === false) state.toast("Press again to use this shortcut on the website");
  const id =
    shortcut.commandId ??
    matchShortcut(
      effectiveShortcuts(state.settings.shortcutOverrides as ShortcutOverrides | undefined),
      shortcut,
      { platform: bridge.platform },
    )?.id;
  return id ? runCommand(id, { ...context, state }) : false;
}
