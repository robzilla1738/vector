import { clipboard, Menu, session, WebContentsView, type BaseWindow, type MenuItemConstructorOptions } from "electron";
import type { TargetRegistry, ViewEntry } from "./target-registry.js";

export interface ViewHooks {
  onNavigated(pageId: string, url: string): void;
  onTitle(pageId: string, title: string): void;
  onFavicon(pageId: string, favicon: string): void;
  onLoading(pageId: string, loading: boolean): void;
  onNavState(pageId: string, canGoBack: boolean, canGoForward: boolean): void;
  onCrashed(pageId: string): void;
  onDestroyed(pageId: string): void;
  onPopup(entry: ViewEntry): void;
  onTakeover(pageId: string): void;
  openAsTab(url: string): void;
  /** app-level shortcuts pressed while a page view is focused */
  sendShortcut(s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }): void;
}

const PROFILE_PARTITION = "persist:vector-default";
const AGENT_PARTITION = "persist:vector-agent";

/** Inject the Vector target marker into a webContents — every document. */
export function installMarker(view: WebContentsView, marker: string) {
  const wc = view.webContents;
  const src = `Object.defineProperty(globalThis, "__vectorTid", {value: ${JSON.stringify(marker)}, configurable: true, writable: true});`;
  const injectNow = () => wc.executeJavaScript(src, true).catch(() => {});
  injectNow();
  // dom-ready covers the initial document — a first-shot executeJavaScript can
  // race the frame being ready, and a view that never navigates (about:blank
  // tabs) gets no did-navigate to retry on
  wc.on("dom-ready", injectNow);
  wc.on("did-navigate", injectNow);
  wc.on("did-navigate-in-page", injectNow);
  try {
    if (!wc.debugger.isAttached()) wc.debugger.attach("1.3");
    void wc.debugger
      .sendCommand("Page.enable")
      .then(() => wc.debugger.sendCommand("Page.addScriptToEvaluateOnNewDocument", { source: src }))
      .catch(() => {});
  } catch {
    /* marker re-injection on navigate still covers identity */
  }
}

export function createPageView(opts: {
  win: BaseWindow;
  registry: TargetRegistry;
  pageId: string;
  marker: string;
  url: string;
  background: boolean;
  hooks: ViewHooks;
}): ViewEntry {
  const partition = opts.background ? AGENT_PARTITION : PROFILE_PARTITION;
  const view = new WebContentsView({
    webPreferences: {
      partition,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });
  const entry: ViewEntry = {
    pageId: opts.pageId,
    marker: opts.marker,
    view,
    owned: true,
  };
  opts.registry.add(entry);
  installMarker(view, opts.marker);
  wireEvents(entry, opts.hooks);
  opts.win.contentView.addChildView(view);
  if (!opts.background) view.webContents.focus();
  // loadURL even for about:blank — the navigation is what reliably triggers
  // did-navigate → marker injection → the runtime's target attach
  if (opts.url) {
    view.webContents.loadURL(opts.url).catch(() => {});
  }
  return entry;
}

function wireEvents(entry: ViewEntry, hooks: ViewHooks) {
  const wc = entry.view.webContents;
  const id = entry.pageId;
  const navState = () => hooks.onNavState(id, wc.navigationHistory.canGoBack(), wc.navigationHistory.canGoForward());
  wc.on("did-navigate", (_e, url) => {
    hooks.onNavigated(id, url);
    navState();
  });
  wc.on("did-navigate-in-page", (_e, url) => {
    hooks.onNavigated(id, url);
    navState();
  });
  wc.on("page-title-updated", (_e, title) => hooks.onTitle(id, title));
  wc.on("page-favicon-updated", (_e, favicons) => hooks.onFavicon(id, favicons[0] ?? ""));
  wc.on("did-start-loading", () => hooks.onLoading(id, true));
  wc.on("did-stop-loading", () => {
    hooks.onLoading(id, false);
    navState();
  });
  wc.on("render-process-gone", (_e, details) => {
    if (details.reason !== "clean-exit" && details.reason !== "killed") hooks.onCrashed(id);
  });
  wc.on("destroyed", () => hooks.onDestroyed(id));
  wc.on("input-event", (_e, input) => {
    // a human typing/clicking in an agent-driven page takes control of it
    if (input.type === "keyDown" || input.type === "mouseDown") hooks.onTakeover(id);
  });
  wc.setWindowOpenHandler((details) => {
    const features = details.features ?? "";
    const wantsWindow = /width=|height=|popup/i.test(features);
    if (wantsWindow) {
      // real popup window — web-contents-created tags it for the registry;
      // it must share the profile partition or it loses cookies/storage
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: { partition: PROFILE_PARTITION, sandbox: true, contextIsolation: true },
        },
      };
    }
    // tab-style popup → becomes a Vector tab
    if (details.url && details.url !== "about:blank") hooks.openAsTab(details.url);
    return { action: "deny" };
  });
  wc.on("context-menu", (_e, params) => showPageMenu(entry, params, hooks));
  wc.on("before-input-event", (event, input) => {
    if (!input.key || input.type !== "keyDown") return;
    // ⌘ drives app shortcuts on macOS; Ctrl only counts off-platform so
    // websites keep their own Ctrl-based keybindings on the Mac.
    const meta = input.meta || (input.control && process.platform !== "darwin");
    const k = input.key.toLowerCase().replace(/^arrow/, "");
    const metaKeys = [
      "l", "t", "w", "k", "f", "r", "d", "y", ",", "s", "g", "o", "p", "e",
      "[", "]", "{", "}", "=", "+", "-", "_", "0",
      "1", "2", "3", "4", "5", "6", "7", "8", "9",
    ];
    const forward =
      (meta && metaKeys.includes(k)) ||
      // shift-gated letters — the unshifted key still belongs to the page
      // (⌘C copy, ⌘B bold, ⌘I italic, ⌫ editing all keep working)
      (meta && input.shift && ["a", "j", "c", "backspace"].includes(k)) ||
      // alt-gated — ⌘I/⌘U alone stay with the page's editor
      (meta && input.alt && ["u", "i"].includes(k)) ||
      // ⌃⇥ tab cycling — a browser-level binding, safe to take from pages
      (input.control && k === "tab") ||
      // ⌥← / ⌥→ and ⌘⌥← / ⌘⌥→ — the renderer splits nav vs. tab cycling
      (input.alt && ["left", "right"].includes(k));
    if (forward) {
      event.preventDefault();
      hooks.sendShortcut({ key: input.key, meta, shift: input.shift, alt: input.alt, ctrl: !!input.control });
    }
  });
}

/** Native right-click menu for page views — links, images, editing, nav, inspect. */
function showPageMenu(entry: ViewEntry, p: Electron.ContextMenuParams, hooks: ViewHooks) {
  const wc = entry.view.webContents;
  const t: MenuItemConstructorOptions[] = [];

  if (p.misspelledWord) {
    for (const s of p.dictionarySuggestions.slice(0, 5)) {
      t.push({ label: s, click: () => wc.replaceMisspelling(s) });
    }
    if (p.dictionarySuggestions.length === 0) t.push({ label: "No suggestions", enabled: false });
    t.push({ label: "Learn Spelling", click: () => wc.session.addWordToSpellCheckerDictionary(p.misspelledWord) });
    t.push({ type: "separator" });
  }

  if (p.linkURL) {
    t.push(
      { label: "Open Link in New Tab", click: () => hooks.openAsTab(p.linkURL) },
      { label: "Copy Link", click: () => clipboard.writeText(p.linkURL) },
      { type: "separator" },
    );
  }

  if (p.mediaType === "image" && p.srcURL) {
    t.push(
      { label: "Open Image in New Tab", click: () => hooks.openAsTab(p.srcURL) },
      { label: "Copy Image", click: () => wc.copyImageAt(p.x, p.y) },
      { label: "Save Image…", click: () => wc.downloadURL(p.srcURL) },
      { type: "separator" },
    );
  }

  if (p.isEditable) {
    t.push(
      { role: "undo" }, { role: "redo" }, { type: "separator" },
      { role: "cut", enabled: p.editFlags.canCut },
      { role: "copy", enabled: p.editFlags.canCopy },
      { role: "paste", enabled: p.editFlags.canPaste },
      { role: "selectAll", enabled: p.editFlags.canSelectAll },
      { type: "separator" },
    );
  } else if (p.selectionText) {
    t.push({ role: "copy", label: "Copy" }, { type: "separator" });
  }

  if (!p.isEditable) {
    t.push(
      { label: "Back", enabled: wc.navigationHistory.canGoBack(), click: () => wc.goBack() },
      { label: "Forward", enabled: wc.navigationHistory.canGoForward(), click: () => wc.goForward() },
      { label: "Reload", click: () => wc.reload() },
      { type: "separator" },
    );
  }

  t.push({
    label: "Inspect Element",
    click: () => {
      wc.inspectElement(p.x, p.y);
      if (!wc.isDevToolsOpened()) wc.openDevTools({ mode: "detach" });
    },
  });
  Menu.buildFromTemplate(t).popup();
}

export function destroyPageView(entry: ViewEntry, win: BaseWindow) {
  try {
    win.contentView.removeChildView(entry.view);
    entry.view.webContents.debugger?.detach();
    entry.view.webContents.close({ waitForBeforeUnload: false });
  } catch {
    /* view already gone */
  }
}

export function downloadsSession() {
  return session.fromPartition(PROFILE_PARTITION);
}

/** The shared profile partition human page views run in (cookies, cache, storage). */
export function profileSession() {
  return session.fromPartition(PROFILE_PARTITION);
}

/** Isolated partition for background agent workers (plan A22). */
export function agentSession() {
  return session.fromPartition(AGENT_PARTITION);
}
