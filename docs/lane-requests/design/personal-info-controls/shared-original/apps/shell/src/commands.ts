import {
  COMMANDS,
  SCOPED_COMMANDS,
  effectiveShortcuts,
  matchShortcut,
  type ShellCommandId,
  type CommandDef,
  type ShortcutOverrides,
} from "@aux/contracts";
import type { RefObject } from "react";
import { openCommandSurface, closeCommandSurface } from "./command-surface-state";
import { COMMAND_SURFACE_ACTIONS } from "./command-surface-actions";
import { commandExecutor } from "./command-execution";
import { invokeScopedControl } from "./scoped-control-commands";
import { RUN_CONTROL_COMMANDS, invokeRunControlCommand } from "./run-control-commands";
import { bridge } from "./bridge";
import { decideAgentAction, dismissAgentHandoff, takeOverAgentAction } from "./action-approval";
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
  settingsRoute?: boolean;
  findInput?: RefObject<HTMLInputElement | null>;
  tabSwitcher?: ReturnType<typeof createTabSwitcher>;
}
type CommandAction = (state: StoreState, context: CommandContext) => unknown;
const defaultSwitcher = createTabSwitcher();
const takingPageControl = new Map<string, Promise<unknown>>();
function controlledPage(st: StoreState, { payload }: CommandContext, returning: boolean): string {
  const pageId = payload && "pageId" in payload ? payload.pageId : st.activePageId;
  const page = st.pages.find(item => item.pageId === pageId);
  if (!page || page.pageId !== st.activePageId ||
      !(returning ? page.controller === "human" : page.controller === "agent" || page.controller === "external") ||
      ["detached", "crashed"].includes(page.viewStatus ?? ""))
    throw new Error("The selected page changed. Refresh before changing control.");
  return page.pageId;
}

function featureCommands<const T extends readonly ShellCommandId[]>(...ids: T) {
  return Object.fromEntries(ids.map<[ShellCommandId, CommandAction]>(id => [id, () => {
    throw new Error(`${COMMANDS.find(command => command.id === id)?.label ?? id} is unavailable in this window`);
  }])) as { [K in T[number]]: CommandAction };
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
  ...Object.fromEntries(SCOPED_COMMANDS.map(({ id }) => [id, (_state: StoreState, context: CommandContext) => invokeScopedControl(id, context)])) as Record<(typeof SCOPED_COMMANDS)[number]["id"], CommandAction>,


  ...Object.fromEntries(RUN_CONTROL_COMMANDS.map(id => [id, (_state: StoreState, context: CommandContext) => invokeRunControlCommand(id, context)])) as Record<(typeof RUN_CONTROL_COMMANDS)[number], CommandAction>,
  ...featureCommands(
    "set-site-agent-access",
    "delete-site-agent-rule",
    "revoke-site-agent-grant",
    "allow-agent-action-for-origin",
    "set-agent-effect-grants",
    "mention-insert",
    "mention-remove",
    "export-demonstration",
    "record-demonstration",
    "pause-demonstration",
    "resume-demonstration",
    "stop-demonstration",
    "discard-demonstration",
    "save-demonstration",
    "queue-for-tonight",
    "review-overnight",
    "review-overnight-item",
    "configure-night-shift",
    "prepare-skill-replay",
    "test-skill-replay",
    "check-skill-replay",
    "propose-skill-repair",
    "approve-skill-repair",
    "undo-download-rename",
    "set-download-naming",
    "show-download-settings",
    "create-browser-profile",
    "open-browser-profile",
    "rename-browser-profile",
    "archive-browser-profile",
    "delete-browser-profile",
    "set-profile-appearance",
    "refresh-browser-profiles",
    "save-link-routing",
    "test-link-routing",
    "resolve-link-routing",
    "refresh-link-routing",
    "set-javascript-apple-events",
    "focus-profile-space",
    "move-tab-to-profile",
    "show-profiles",
    "show-link-routing",
    "split-separate",
    "split-resize",
    "minimal-ui",
    "pin-tab",
    "extension-action",
    "pin-extension-action",
    "show-extensions",
    "close-extension-panel",
    "set-extension-command-shortcut",
    "install-store-extension",
    "install-unpacked-extension",
    "update-extension",
    "reload-extension",
    "set-extension-enabled",
    "remove-extension",
    "reset-pinned-app",
    "toggle-pin-keep-awake",
    "open-pinned-app",
    "pin-open-new-tab",
    "pin-open-background",
    "pin-copy-url",
    "pin-reorder",
    "pin-unpin",
    "clear-today",
    "make-live-folder",
    "refresh-live-folder",
    "open-live-folder-item",
    "connect-github",
    "revoke-github",
    "archive-restore",
    "archive-restore-all",
    "archive-delete",
    "archive-undo",
    "acknowledge-auto-archive",
    "configure-auto-archive",
    "save-live-folder",
    "set-auto-archive-policy",
    "little-window",
    "promote-tab",
    "picture-in-picture",
    "split-add",
    "split-close",
    "split-next",
    "split-previous",
    "split-swap",
    "split-flip",
    "profile-1",
    "profile-2",
    "profile-3",
    "profile-4",
    "profile-5",
    "profile-6",
    "profile-7",
    "profile-8",
    "profile-9",
    "claim-tab",
    "show-tab-window",
    "little-space-picker",
    "little-downloads",
    "set-external-link-target",
    "show-archived-tabs",
  ),
  "approve-agent-action": (_st, { payload }) => {
    if (!payload || !("approvalId" in payload) || !("turnId" in payload)) throw new Error("This approval is unavailable.");
    return decideAgentAction(payload, "accept");
  },
  "deny-agent-action": (_st, { payload }) => {
    if (!payload || !("turnId" in payload)) throw new Error("This approval is unavailable.");
    return "approvalId" in payload ? decideAgentAction(payload, "decline") : dismissAgentHandoff(payload.turnId);
  },
  "take-over-agent-action": (st, { payload }) => {
    if (!payload || !("pageId" in payload) || !("turnId" in payload)) throw new Error("The requested page is unavailable.");
    return takeOverAgentAction(payload, id => st.activate(id));
  },
  "return-agent-control": (st, context) => st.returnControl(controlledPage(st, context, true)),
  "take-page-control": (st, context) => {
    const pageId = controlledPage(st, context, false);
    const pending = takingPageControl.get(pageId);
    if (pending) return pending;
    const operation = call("pages.takeover", { pageId }).finally(() => takingPageControl.delete(pageId));
    takingPageControl.set(pageId, operation);
    return operation;
  },

  ...COMMAND_SURFACE_ACTIONS,
  "command-switch-space": (st, context) => {
    const spaceId = context.payload && "spaceId" in context.payload ? context.payload.spaceId : undefined;
    if (!spaceId || !st.layout.spaces.some(space => space.id === spaceId)) throw new Error("The Space is no longer available.");
    return st.switchSpace(spaceId);
  },
  "command-borrow-chrome": () => openCommandSurface({ mode: "command", provider: "chrome" }),
  "command-borrow-tab": (_st, context) => {
    const value = context.payload;
    if (!value || !("targetId" in value) || !("url" in value)) throw new Error("Choose an attached Chrome tab.");
    return call("pages.open", { url: value.url, backend: "chrome", targetId: value.targetId, activate: true });
  },


  "mute-tab": (st, context) => {
    const pageId = context.payload && "pageId" in context.payload ? context.payload.pageId : st.activePageId;
    const audio = pageId ? st.tabAudio[pageId] : undefined;
    if (!pageId || !audio) return st.toast("Audio state is unavailable for this tab");
    return tabCommand({ kind: "setMuted", pageId, muted: !audio.muted });
  },

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
  "new-chat": st => st.openConversation(null),
  "quick-ask": () => bridge.quickAsk("open"),

  "new-tab": () => openCommandSurface({ mode: "new-tab" }),
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
  reload: (st, context) =>
    (context.settingsRoute ?? st.overlay === "settings")
      ? window.dispatchEvent(new Event("aux-settings-refresh"))
      : st.activePageId && tabCommand({ kind: "reload", pageId: st.activePageId }).catch(errToast),
  "hard-reload": (st, context) =>
    (context.settingsRoute ?? st.overlay === "settings")
      ? window.location.reload()
      : st.activePageId && bridge.hardReload(st.activePageId).catch(errToast),
  "actual-size": (st) => st.activePageId && st.zoomPage(st.activePageId, { reset: true }).catch(errToast),
  "zoom-in": (st) => st.activePageId && st.zoomPage(st.activePageId, { direction: "in" }).catch(errToast),
  "zoom-out": (st) => st.activePageId && st.zoomPage(st.activePageId, { direction: "out" }).catch(errToast),
  reader: (st) => st.setOverlay(st.overlay === "reader" ? null : "reader"),
  sidebar: (st) => st.toggleSidebar(),
  "sidebar-hide": (st) => st.setSidebar("hidden"),
  overview: (st) => st.setMode(st.mode === "overview" ? "focus" : "overview"),
  devtools: (st) => st.activePageId && bridge.devTools(st.activePageId),
  "inspect-element": (st) => st.activePageId && bridge.devTools(st.activePageId, "inspect"),
  "view-source": (st) => {
    const p = st.pages.find((x) => x.pageId === st.activePageId);
    if (p?.url.startsWith("http")) void st.navigatePage(p.pageId, `view-source:${p.url}`).catch(errToast);
  },
  back: (st, context) =>
    (context.settingsRoute ?? st.overlay === "settings")
      ? window.history.back()
      : st.activePageId && tabCommand({ kind: "back", pageId: st.activePageId }).catch(errToast),
  forward: (st, context) =>
    (context.settingsRoute ?? st.overlay === "settings")
      ? window.history.forward()
      : st.activePageId && tabCommand({ kind: "forward", pageId: st.activePageId }).catch(errToast),
  "open-address": () => openCommandSurface({ mode: "edit" }),
  palette: (st) =>
    st.overlay === "command-surface" ? closeCommandSurface() : openCommandSurface({ mode: "command" }),
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

const executor = commandExecutor<CommandContext>((id, context) => {
  const command = COMMANDS.find(command => command.id === id);
  if (!command) return undefined;
  const state = context.state ?? useStore.getState();
  if ((command as CommandDef).windows && !(command as CommandDef).windows!.includes(bridge.windowKind)) return undefined;
  if (command.handler === "native") return () => bridge.dispatchCommand(command.id);
  return () => {
    const feature = runFeatureCommand(id, state, context);
    return feature.handled ? feature.result : COMMAND_ACTIONS[command.id](state, context);
  };
}, errToast);

export function runCommand(id: string, context: CommandContext = {}): boolean {
  return executor.run(id, context);
}

/** Mutation surfaces await this result before closing or presenting success. */
export function executeCommand(id: string, context: CommandContext = {}): Promise<unknown> {
  return executor.execute(id, context);
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
  const advisory = "Press again to use this shortcut on the website";
  if (shortcut.websitePassThrough !== undefined)
    for (const toast of state.toasts) if (toast.text === advisory) state.dismissToast(toast.id);
  if (shortcut.websitePassThrough === true) {
    state.setOverlay(null);
    return true;
  }
  if (shortcut.websitePassThrough === false) state.toast(advisory);
  const id =
    shortcut.commandId ??
    matchShortcut(
      effectiveShortcuts(state.settings.shortcutOverrides as ShortcutOverrides | undefined),
      shortcut,
      { platform: bridge.platform },
    )?.id;
  return id ? runCommand(id, { ...context, state }) : false;
}
