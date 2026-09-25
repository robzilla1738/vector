import { pageShortcut } from "./page-shortcuts.js";
import { NAV_GESTURE_BINDING, NAV_GESTURE_WORLD, navGestureScript } from "./page-nav-gesture.js";
import { showPageMenu } from "./page-menu.js";
import { captureImageAt } from "./image-capture.js";
import { installCredentialWatch } from "./credential-detect.js";
import { installCosmeticFilter } from "./cosmetic-filter.js";
import { addDocumentBinding, addDocumentScript } from "./page-debugger.js";
import { noteSwallowed } from "./swallowed.js";
import { popupCommand } from './popup-commands.js';
import { session, WebContentsView, type BaseWindow, type WebContents } from "electron";
import { randomUUID } from "node:crypto";
import { SESSION_PARTITIONS, type PageQuickAction } from "@aux/contracts";
import type { TargetRegistry, ViewEntry } from "./target-registry.js";

export interface ViewHooks {
  onExternalLink?(entry: ViewEntry, url: string): boolean;
  onFullscreenReady?(entry: ViewEntry): void;
  onBrowserShortcut?(entry: ViewEntry): void;
  onPageAction?(action: PageQuickAction): void;
  onNavigated(pageId: string, url: string): void;
  onTitle(pageId: string, title: string): void;
  onFavicon(pageId: string, favicon: string): void;
  onLoading(pageId: string, loading: boolean): void;
  onAudio?(pageId:string,state:{muted:boolean;audible:boolean}):void;
  onNavState(pageId: string, canGoBack: boolean, canGoForward: boolean): void;
  onCrashed(pageId: string): void;
  onUnresponsive?(pageId:string):void;
  onNavigationError(pageId: string, error: { url: string; code: number; message: string } | null): void;
  onNavigationStarted?(webContentsId: number): void;
  onDestroyed(pageId: string, webContents: Electron.WebContents): void;
  onPopup(entry: ViewEntry, activate?: boolean): void;
  onTakeover(pageId: string): void;
  confirmUnload?(entry: ViewEntry): boolean;
  /** Tab/window close: ask without blocking the main process. Resolves true to leave. */
  confirmUnloadAsync?(entry: ViewEntry): Promise<boolean>;
  openAsTab(url: string, options?: { windowId?: string; background?: boolean; referrer?: Electron.Referrer }): void;
  /** app-level shortcuts pressed while a page view is focused */
  sendShortcut(s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }, pageId: string): void;
  onCursor?(pageId: string, cursor: string): void;
  /** A horizontal gesture on this page asks for history navigation. */
  onNavGesture?(pageId: string, direction: "back" | "forward"): void;
  /** The context menu asked to fill this frame's form with saved personal info. */
  onAutofill?(frame: Electron.WebFrameMain): void;
  /** Vault items matching the frame's page origin (context-menu fill list). */
  onCredentials?(frame: Electron.WebFrameMain): Promise<{ itemId: string; label: string; username?: string }[]>;
  /** A password-form submit was detected on this page (vault save offer). */
  onCredentialOffer?(pageId: string, offer: { username: string; origin: string }): void;
  /** Cosmetic ad filtering — whether this page's host stays filtered. */
  cosmeticFiltered?(hostname: string): boolean;
  cookieSelectors?(hostname: string): readonly string[];
  /** Explicit page/selection translation through the configured model. */
  onTranslatePage?(pageId: string): void;
  onTranslateSelection?(pageId: string, text: string, x: number, y: number): void;
  /** Fill a vault credential into the page's login form. */
  onVaultFill?(pageId: string, frame: Electron.WebFrameMain, itemId: string): void;
}

// Persisted profile identity; changing this before migration would hide existing logins.
const PROFILE_PARTITION = SESSION_PARTITIONS.browsing;

/**
 * Inject the Aux target marker into a webContents — every document. The
 * runtime finds tabs by reading `globalThis.__auxTid` in the main world, so
 * the value is fixed for the document: a page cannot rename or remove it.
 * Resolves once the current document carries the marker.
 */
const markerSource = (marker: string) => `Object.defineProperty(globalThis, "__auxTid", {value: ${JSON.stringify(marker)}, configurable: false, writable: false});`;

/** Mark the current document now; resolves true once it carries `marker`. */
export function markDocument(wc: WebContents, marker: string): Promise<boolean> {
  if (wc.isDestroyed()) return Promise.resolve(false);
  return wc.executeJavaScript(`${markerSource(marker)} globalThis.__auxTid === ${JSON.stringify(marker)}`, true)
    .then(ok => ok === true, () => wc.isDestroyed() ? false : wc.executeJavaScript(`globalThis.__auxTid === ${JSON.stringify(marker)}`, true).then(ok => ok === true, () => false));
}

export function installMarker(view: Pick<WebContentsView, "webContents">, marker: string): Promise<boolean> {
  const wc = view.webContents;
  const src = markerSource(marker);
  const injectNow = () => markDocument(wc, marker);
  // The initial document may predate the new-document script — dom-ready
  // marks it once (about:blank tabs never navigate). Later documents get the
  // marker from the new-document script before any page script runs.
  wc.once("dom-ready", () => void injectNow());
  void addDocumentScript(wc, src).then(registered => {
    if (registered || wc.isDestroyed()) return;
    // No debugger session: fall back to marking each committed document.
    wc.on("did-navigate", () => void injectNow());
    wc.on("dom-ready", () => void injectNow());
  });
  return injectNow();
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
  referrer?: Electron.Referrer;
  hooks: ViewHooks;
}): ViewEntry {
  // Human and agent tabs share the same browser profile. Control ownership is
  // enforced by the runtime; changing who drives a page must not change its
  // cookies, storage, permissions, cache, or service workers.
  const view = new WebContentsView({
    webPreferences: {
      partition: PROFILE_PARTITION,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      spellcheck: true,
    },
  });
  const entry: ViewEntry = {
    pageId: opts.pageId,
    windowId: opts.windowId,
    marker: opts.marker,
    view,
    owned: true,
    runtimeOwned:opts.ownedByRuntime,
  };
  // Trackpad pinch zoom is a visual (compositor) zoom — Electron leaves the
  // limits at 1/1 until a view opts in. Ephemeral per document, like Chrome.
  void view.webContents.setVisualZoomLevelLimits(1, 3).catch(() => noteSwallowed("view.zoomLimits"));
  opts.registry.add(entry);
  installMarker(view, opts.marker);
  wireEvents(entry, opts.hooks);
  opts.win.contentView.addChildView(view);
  if (!opts.background) view.webContents.focus();
  if (opts.url) {
    const load = () => { if (!view.webContents.isDestroyed()) view.webContents.loadURL(opts.url, opts.referrer ? { httpReferrer: opts.referrer } : undefined).catch(() => {}); };
    if (pageLoadGate) void pageLoadGate.then(load); else load();
  }
  return entry;
}

let pageLoadGate: Promise<unknown> | null = null;
/** Hold page-view loads until `ready` settles (profile extensions loading at startup). */
export function gatePageLoads(ready: Promise<unknown>) {
  const gate = ready.catch(() => {}).then(() => { if (pageLoadGate === gate) pageLoadGate = null; });
  pageLoadGate = gate;
}

function wireEvents(entry: ViewEntry, hooks: ViewHooks) {
  const wc = entry.view.webContents;
  const id = entry.pageId;
  wc.on("will-navigate",(event,url)=>{if(hooks.onExternalLink?.(entry,url))event.preventDefault();});
  hooks.onFullscreenReady?.(entry);
  wc.on("will-prevent-unload", event => {
    const closing = closingPages.get(wc);
    if (closing && hooks.confirmUnloadAsync) {
      // A close is pending: keep it pending behind an async prompt instead of
      // freezing every window (and every tab's network callbacks) on a sync
      // dialog. Leaving closes without re-running beforeunload.
      closing.hold();
      void hooks.confirmUnloadAsync(entry).then(
        leave => { if (wc.isDestroyed()) return; if (leave) wc.close({ waitForBeforeUnload: false }); else closing.finish(false); },
        () => closing.finish(false),
      );
      return;
    }
    // Navigation away from a dirty page: Chromium cannot resume a
    // renderer-initiated navigation after the fact, so this decision is sync.
    try {
      if (hooks.confirmUnload?.(entry)) { event.preventDefault(); return; }
    } catch { /* No usable confirmation surface: keep the document. */ }
    cancelPageClose(wc);
  });
  const audio=()=>hooks.onAudio?.(id,{muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()});
  wc.on('audio-state-changed',audio);wc.on('dom-ready',audio);audio();
  const navState = () => hooks.onNavState(id, wc.navigationHistory.canGoBack(), wc.navigationHistory.canGoForward());
  wc.on("did-start-navigation", (_event, _url, _inPlace, isMainFrame) => {
    if (isMainFrame) { hooks.onNavigationStarted?.(wc.id); hooks.onNavigationError(id, null); }
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
  wc.on("destroyed", () => hooks.onDestroyed(id, wc));
  wc.on("cursor-changed", (_event, type) => hooks.onCursor?.(id, type));
  wc.on("input-event", (_e, input) => {
    // a human typing/clicking in an agent-driven page takes control of it
    if (input.type === "keyDown" || input.type === "mouseDown") hooks.onTakeover(id);
  });
  wc.on("did-create-window", (popup) => {
    const pageId = `pop_${randomUUID()}`;
    const marker = `atab-${pageId}`;
    const child: ViewEntry = { showBlankDocument: true, pageId, windowId: entry.windowId, marker, popup, view: { webContents: popup.webContents }, owned: true };
    installMarker(child.view, marker);
    wireEvents(child, hooks);
    // Popup windows are real BrowserWindows — they get their own gesture
    // surface; the overscroll listener already arrived through wireEvents.
    popup.on("swipe", (_e, direction) => {
      if (direction === "left" || direction === "right") hooks.onNavGesture?.(pageId, direction === "left" ? "forward" : "back");
    });
    popup.on("app-command", (_e, command) => {
      if (command === "browser-backward" || command === "browser-forward") hooks.onNavGesture?.(pageId, command === "browser-backward" ? "back" : "forward");
    });
    hooks.onPopup(child);
  });
  wc.setWindowOpenHandler((details) => {
    if(hooks.onExternalLink?.(entry,details.url))return {action:"deny"};
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
        const marker = `atab-${pageId}`;
        const child: ViewEntry = { showBlankDocument: true, pageId, windowId: entry.windowId, marker, view, owned: true };
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
  wc.on("context-menu", (_e, params) => {
    const frame = params.frame ?? wc.mainFrame;
    const finish = (credentials: { items: { itemId: string; label: string; username?: string }[]; fill: (itemId: string) => void } | undefined) => showPageMenu(entry.view.webContents, params, {
      openAsTab: (url, referrer) => hooks.openAsTab(url, { windowId: entry.windowId, referrer }),
      onAudio: () => hooks.onAudio?.(entry.pageId, {muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()}),
      onPageAction: hooks.onPageAction && !entry.runtimeOwned ? action => hooks.onPageAction?.({pageId:entry.pageId,...action}) : undefined,
      captureImage: hooks.onPageAction && !entry.runtimeOwned ? (x, y, srcURL, frame) => captureImageAt(entry.view.webContents, frame, { x, y, srcURL }) : undefined,
      autofill: hooks.onAutofill ? f => hooks.onAutofill?.(f) : undefined,
      translatePage: hooks.onTranslatePage ? () => hooks.onTranslatePage?.(entry.pageId) : undefined,
      translateSelection: hooks.onTranslateSelection ? (text, x, y) => hooks.onTranslateSelection?.(entry.pageId, text, x, y) : undefined,
      credentials,
    });
    // The vault lookup only runs for right-clicks inside form fields — the
    // one context where credential fill is a relevant action.
    if (params.isEditable && hooks.onCredentials && hooks.onVaultFill) {
      void hooks.onCredentials(frame)
        .then(items => finish(items.length ? { items, fill: itemId => hooks.onVaultFill?.(entry.pageId, frame, itemId) } : undefined))
        .catch(() => finish(undefined));
    } else finish(undefined);
  });
  wc.on("before-input-event", (event, input) => {
    const shortcut = pageShortcut(input);
    if (!shortcut) return;
    event.preventDefault();
    hooks.onBrowserShortcut?.(entry);
    if (!entry.popup || !popupCommand(entry.popup, shortcut)) hooks.sendShortcut(shortcut, id);
  });
  installNavGesture(wc, (dir) => hooks.onNavGesture?.(entry.pageId, dir));
  if (hooks.onCredentialOffer) installCredentialWatch(wc, offer => hooks.onCredentialOffer?.(entry.pageId, offer));
  if (hooks.cosmeticFiltered) installCosmeticFilter(wc, { filtered: hooks.cosmeticFiltered, selectors: hooks.cookieSelectors });
}

/**
 * Edge-of-content horizontal gestures report through an isolated-world wheel
 * listener: deltas the page cannot consume accumulate into one back/forward
 * signal per gesture, delivered over a CDP binding so the page cannot listen
 * for or forge the channel. Shared by regular and private views; the debugger
 * is reused when the target marker already attached it.
 */
export function installNavGesture(wc: WebContents, onGesture: (direction: "back" | "forward") => void) {
  void addDocumentBinding(wc, NAV_GESTURE_BINDING, raw => {
    try {
      const dir = raw === "back" || raw === "forward" ? raw : JSON.parse(raw);
      if (dir === "back" || dir === "forward") onGesture(dir);
    } catch { /* not our payload */ }
  }, { source: navGestureScript(NAV_GESTURE_BINDING), worldName: NAV_GESTURE_WORLD });
}


const closingPages = new Map<WebContents, { promise: Promise<boolean>; finish(ok: boolean): void; hold(): void }>();

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
  let timer = setTimeout(() => finish(false), 45_000);
  // the user is answering a leave prompt: the close waits for them, not a timer
  const hold = () => { clearTimeout(timer); timer = setTimeout(() => finish(false), 30 * 60_000); };
  closingPages.set(wc, { promise, finish, hold });
  wc.once("destroyed", destroyed);
  try { wc.close({ waitForBeforeUnload: true }); } catch { finish(wc.isDestroyed()); }
  return promise;
}

/** The shared profile partition human page views run in (cookies, cache, storage). */
export function profileSession() {
  return session.fromPartition(PROFILE_PARTITION);
}
