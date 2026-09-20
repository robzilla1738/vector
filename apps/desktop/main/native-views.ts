import { popupCommand } from './popup-commands.js';
import { clipboard, Menu, session, WebContentsView, type BaseWindow, type WebContents, type MenuItemConstructorOptions } from "electron";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { TargetRegistry, ViewEntry } from "./target-registry.js";

export interface ViewHooks {
  onNavigated(pageId: string, url: string): void;
  onTitle(pageId: string, title: string): void;
  onFavicon(pageId: string, favicon: string): void;
  onLoading(pageId: string, loading: boolean): void;
  onAudio?(pageId:string,state:{muted:boolean;audible:boolean}):void;
  onNavState(pageId: string, canGoBack: boolean, canGoForward: boolean): void;
  onCrashed(pageId: string): void;
  onUnresponsive?(pageId:string):void;
  onNavigationError(pageId: string, error: { url: string; code: number; message: string } | null): void;
  onDestroyed(pageId: string): void;
  onPopup(entry: ViewEntry, activate?: boolean): void;
  onTakeover(pageId: string): void;
  confirmUnload?(entry: ViewEntry): boolean;
  openAsTab(url: string, options?: { windowId?: string; background?: boolean; referrer?: Electron.Referrer }): void;
  /** app-level shortcuts pressed while a page view is focused */
  sendShortcut(s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }, pageId: string): void;
}

const ENGINE_PAINT_HTML = `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html>
<meta charset=utf-8>
<title>Aux Engine</title>
<style>html,body{margin:0;height:100%;background:#fff;overflow:hidden}img{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}</style>
<body tabindex=0><img id=f alt=""></body>
<script>document.body.focus();</script>
`)}`;

// Persisted profile identity; changing this before migration would hide existing logins.
const PROFILE_PARTITION = "persist:vector-default";

/** Inject the Aux target marker into a webContents — every document. */
export function installMarker(view: Pick<WebContentsView, "webContents">, marker: string) {
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
  windowId?: string;
  marker: string;
  url: string;
  background: boolean;
  ownedByRuntime?:boolean;
  kind?: "chromium" | "engine";
  referrer?: Electron.Referrer;
  hooks: ViewHooks;
}): ViewEntry {
  const enginePaint = opts.kind === "engine";
  // Human and agent tabs share the same browser profile. Control ownership is
  // enforced by the runtime; changing who drives a page must not change its
  // cookies, storage, permissions, cache, or service workers.
  const partition = enginePaint ? "persist:vector-engine-paint" : PROFILE_PARTITION;
  const view = new WebContentsView({
    webPreferences: {
      partition,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: !enginePaint,
      preload: enginePaint ? join(import.meta.dirname, "..", "preload", "engine-paint.cjs") : undefined,
    },
  });
  const entry: ViewEntry = {
    pageId: opts.pageId,
    windowId: opts.windowId,
    marker: opts.marker,
    view,
    owned: true,
    runtimeOwned:opts.ownedByRuntime,
    kind: enginePaint ? "engine" : "chromium",
  };
  opts.registry.add(entry);
  if (!enginePaint) installMarker(view, opts.marker);
  wireEvents(entry, opts.hooks);
  opts.win.contentView.addChildView(view);
  if (!opts.background) view.webContents.focus();
  if (enginePaint) {
    view.webContents.loadURL(ENGINE_PAINT_HTML).catch(() => {});
    opts.hooks.onNavigated(opts.pageId, opts.url);
  } else if (opts.url) {
    view.webContents.loadURL(opts.url, opts.referrer ? { httpReferrer: opts.referrer } : undefined).catch(() => {});
  }
  return entry;
}

function wireEvents(entry: ViewEntry, hooks: ViewHooks) {
  const wc = entry.view.webContents;
  const id = entry.pageId;
  wc.on("will-prevent-unload", event => {
    try {
      if (hooks.confirmUnload?.(entry)) { event.preventDefault(); return; }
    } catch { /* No usable confirmation surface: keep the document. */ }
    cancelPageClose(wc);
  });
  const audio=()=>hooks.onAudio?.(id,{muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()});
  if(entry.kind!=='engine'){wc.on('audio-state-changed',audio);wc.on('dom-ready',audio);audio();}
  const navState = () => hooks.onNavState(id, wc.navigationHistory.canGoBack(), wc.navigationHistory.canGoForward());
  wc.on("did-start-navigation", (_event, _url, _inPlace, isMainFrame) => {
    if (isMainFrame) hooks.onNavigationError(id, null);
  });
  wc.on("did-fail-load", (_event, code, message, url, isMainFrame) => {
    if (isMainFrame && code !== -3) hooks.onNavigationError(id, { url, code, message });
  });
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
  wc.on("unresponsive",()=>hooks.onUnresponsive?.(id));
  wc.on("destroyed", () => hooks.onDestroyed(id));
  wc.on("input-event", (_e, input) => {
    // a human typing/clicking in an agent-driven page takes control of it
    if (input.type === "keyDown" || input.type === "mouseDown") hooks.onTakeover(id);
  });
  wc.on("did-create-window", (popup) => {
    const pageId = `pop_${randomUUID()}`;
    const marker = `vtab-${pageId}`;
    const child: ViewEntry = { pageId, windowId: entry.windowId, marker, popup, view: { webContents: popup.webContents }, owned: true, kind: "chromium" };
    installMarker(child.view, marker);
    wireEvents(child, hooks);
    hooks.onPopup(child);
  });
  wc.setWindowOpenHandler((details) => {
    const features = details.features ?? "";
    const wantsWindow = /width=|height=|popup/i.test(features) || details.disposition === "new-window";
    if (wantsWindow) {
      // Register the real popup after Electron has created its BrowserWindow;
      // it must share the profile partition or it loses cookies/storage
      return {
        action: "allow",
        overrideBrowserWindowOptions: {
          autoHideMenuBar: true,
          webPreferences: { partition: PROFILE_PARTITION, sandbox: true, contextIsolation: true },
        },
      };
    }
    if (details.disposition === "background-tab") {
      // Electron can deadlock when a pointer-opened background tab is adopted
      // through createWindow. Deny that child synchronously, then create the
      // equivalent Aux tab on the next main-loop turn with its request referrer.
      setImmediate(() => hooks.openAsTab(details.url, { windowId: entry.windowId, background: true, referrer: details.referrer }));
      return { action: "deny" };
    }
    // Preserve Chromium's opener, POST body and initial about:blank document.
    // Reopening only the URL loses all three (and breaks common login flows).
    return {
      action: "allow",
      createWindow: (options) => {
        // Electron supplies the existing child here; its public constructor type
        // does not yet declare this documented creation-hook field.
        const childContents = (options as typeof options & { webContents?: WebContents }).webContents;
        const view = new WebContentsView({
          webContents: childContents,
          webPreferences: { ...options.webPreferences, partition: PROFILE_PARTITION,
            sandbox: true, contextIsolation: true, nodeIntegration: false },
        });
        const pageId = `pop_${randomUUID()}`;
        const marker = `vtab-${pageId}`;
        const child: ViewEntry = { pageId, windowId: entry.windowId, marker, view, owned: true, kind: "chromium" };
        installMarker(view, marker);
        wireEvents(child, hooks);
        // Parenting the view and notifying the runtime inside Chromium's
        // synchronous creation callback can deadlock pointer-opened background
        // tabs. Finish adoption on the next main-loop turn.
        setImmediate(() => {
          if (!view.webContents.isDestroyed()) hooks.onPopup(child, details.disposition !== "background-tab");
        });
        // Chromium owns the pending navigation for the WebContents returned by
        // this hook. Starting a second load here deadlocks middle-click background
        // tabs and would discard request metadata such as the referrer.
        return view.webContents;
      },
    };
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
      const shortcut = { key: input.key, meta, shift: input.shift, alt: input.alt, ctrl: !!input.control };
      if (!entry.popup || !popupCommand(entry.popup, shortcut)) hooks.sendShortcut(shortcut, id);
    }
  });
}

/** Native right-click menu for page views — links, images, editing, nav, inspect. */
function showPageMenu(entry: ViewEntry, p: Electron.ContextMenuParams, hooks: ViewHooks) {
  const wc = entry.view.webContents;
  const t: MenuItemConstructorOptions[] = [];
  if(entry.kind!=='engine')t.push({label:wc.isAudioMuted()?'Unmute tab':'Mute tab',click:()=>{wc.setAudioMuted(!wc.isAudioMuted());hooks.onAudio?.(entry.pageId,{muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()});}},{type:'separator'});

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
      { label: "Open Link in New Tab", click: () => hooks.openAsTab(p.linkURL, { windowId: entry.windowId, referrer: { url: p.frameURL || wc.getURL(), policy: "strict-origin-when-cross-origin" } }) },
      { label: "Copy Link", click: () => clipboard.writeText(p.linkURL) },
      { type: "separator" },
    );
  }

  if (p.mediaType === "image" && p.srcURL) {
    t.push(
      { label: "Open Image in New Tab", click: () => hooks.openAsTab(p.srcURL, { windowId: entry.windowId }) },
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

export function setEngineFrame(entry: ViewEntry, dataUrl: string) {
  if (entry.kind !== "engine") return;
  const src = JSON.stringify(dataUrl);
  entry.view.webContents
    .executeJavaScript(`(function(){var i=document.getElementById("f"); if(i) i.src=${src};})()`)
    .catch(() => {});
}

const closingPages = new Map<WebContents, { promise: Promise<boolean>; finish(ok: boolean): void }>();

export function cancelPageClose(contents: WebContents) {
  closingPages.get(contents)?.finish(false);
}

/** Keep the view and runtime identity intact until Chromium really closes it. */
export function destroyPageView(entry: ViewEntry, win: BaseWindow): Promise<boolean> {
  const wc = entry.view.webContents;
  if (wc.isDestroyed()) return Promise.resolve(true);
  const existing = closingPages.get(wc);
  if (existing) return existing.promise;
  let resolve!: (ok: boolean) => void;
  const promise = new Promise<boolean>(done => { resolve = done; });
  const finish = (ok: boolean) => {
    if (!closingPages.delete(wc)) return;
    clearTimeout(timer);
    wc.removeListener("destroyed", destroyed);
    if (ok && !entry.popup && !win.isDestroyed()) win.contentView.removeChildView(entry.view);
    resolve(ok);
  };
  const destroyed = () => finish(true);
  const timer = setTimeout(() => finish(false), 45_000);
  closingPages.set(wc, { promise, finish });
  wc.once("destroyed", destroyed);
  try { wc.close({ waitForBeforeUnload: true }); } catch { finish(wc.isDestroyed()); }
  return promise;
}

export function downloadsSession() {
  return session.fromPartition(PROFILE_PARTITION);
}

/** The shared profile partition human page views run in (cookies, cache, storage). */
export function profileSession() {
  return session.fromPartition(PROFILE_PARTITION);
}

/** Compatibility alias: agent-driven pages use the shared browsing profile. */
export function agentSession() {
  return session.fromPartition(PROFILE_PARTITION);
}
