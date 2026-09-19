/**
 * Vector desktop — Electron main process.
 *
 * Owns: windows, native WebContentsViews, the persistent profile session,
 * downloads, context menus, keyboard forwarding, and the forked runtime.
 * The runtime (separate process) is the execution authority; this process
 * exposes native.* methods to it over fork IPC and forwards its event
 * stream to the renderer.
 */
import { app, BaseWindow, BrowserWindow, dialog, ipcMain, Menu, nativeTheme, safeStorage, shell, WebContentsView } from "electron";
import { mkdirSync, readFileSync, readdirSync, existsSync, writeFileSync, chmodSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { RpcChannel, type Transport } from "@vector/contracts";
import { TargetRegistry, type ViewEntry } from "./target-registry.js";
import { createPageView, destroyPageView, downloadsSession, installMarker, profileSession, setEngineFrame } from "./native-views.js";
import { spawnRuntime } from "./runtime-proc.js";

const CDP_PORT_FILE = "devtools-port";

const DATA_DIR = process.env.VECTOR_DATA_DIR ?? join(homedir(), "Library", "Application Support", "Vector");
mkdirSync(DATA_DIR, { recursive: true });

const WINDOW_BG = { dark: "#1c1c1e", light: "#e4e4e1" } as const;

function readStoredTheme(): "dark" | "light" {
  try {
    const raw = JSON.parse(readFileSync(join(DATA_DIR, "settings.json"), "utf8")) as { theme?: string };
    return raw.theme === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

function applyAppearance(theme: "dark" | "light") {
  nativeTheme.themeSource = theme;
  const bg = WINDOW_BG[theme];
  try {
    win?.setBackgroundColor(bg);
  } catch {
    /* BaseWindow may not expose setBackgroundColor on every build */
  }
  shellView?.setBackgroundColor(bg);
}

async function loadProfileExtensions() {
  const configured = (process.env.VECTOR_EXTENSION_PATHS ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .map((path) => path.trim())
    .filter(Boolean);
  const managedRoot = join(DATA_DIR, "extensions");
  mkdirSync(managedRoot, { recursive: true });
  const managed = readdirSync(managedRoot)
    .map((name) => join(managedRoot, name))
    .filter((path) => {
      try {
        return statSync(path).isDirectory() && existsSync(join(path, "manifest.json"));
      } catch {
        return false;
      }
    });
  const paths = [...new Set([...configured, ...managed])];
  for (const path of paths) {
    try {
      const extension = await profileSession().loadExtension(path, { allowFileAccess: false });
      log("loaded extension", extension.name, extension.id);
    } catch (error) {
      log("extension failed", path, error instanceof Error ? error.message : String(error));
    }
  }
}

// CDP must be enabled before app ready. Port 0 → OS picks; the real port is
// written to <userData>/DevToolsActivePort. Bind loopback only (plan A22).
app.commandLine.appendSwitch("remote-debugging-address", "127.0.0.1");
app.commandLine.appendSwitch("remote-debugging-port", "0");

let win: BaseWindow | null = null;
let shellView: WebContentsView | null = null;
const registry = new TargetRegistry();
let channel: RpcChannel | null = null;
let overlayOpen = false;
let stageBounds: { x: number; y: number; width: number; height: number } | null = null;
let focusedPageId: string | null = null;
// Pointer input only lands on a visible, laid-out view. Pages a program is
// driving are kept visible *offscreen* (stage-sized, just outside the window)
// instead of hidden, so Chromium keeps them laid out and rendering while the
// human's focused tab stays on the stage. Any number of pages can be active
// at once — there is no global lease (plan A8). A `setVisible(false)` view
// stops producing frames and Playwright's stability checks stall on it.
const offscreenActive = new Set<string>();
let splitPageId: string | null = null;
// corner radius of the stage card — page views are clipped to match it
let stageRadius = 0;
// pages whose find session has emitted found-in-page at least once —
// cold sessions need a re-issue, warm ones must not be reset
const warmFind = new Set<string>();

function log(...args: unknown[]) {
  process.stdout.write(`[main] ${args.join(" ")}\n`);
}

/**
 * Only web URLs may be handed to the OS. `file:`, `smb:`, custom schemes
 * etc. reach arbitrary local handlers — never from a page or the renderer.
 */
function isWebUrl(u: unknown): u is string {
  if (typeof u !== "string") return false;
  try {
    const p = new URL(u).protocol;
    return p === "http:" || p === "https:";
  } catch {
    return false;
  }
}

const AUTO_PAGE_PERMISSIONS = new Set(["fullscreen"]);
const PROMPTABLE_PAGE_PERMISSIONS = new Set([
  "clipboard-read",
  "clipboard-sanitized-write",
  "media",
  "geolocation",
  "notifications",
  "display-capture",
  "pointerLock",
  "idle-detection",
]);
const SITE_PERMISSIONS_FILE = join(DATA_DIR, "site-permissions.json");
type PermissionDecision = "allow" | "deny";
let sitePermissions: Record<string, Record<string, PermissionDecision>> = (() => {
  try {
    return JSON.parse(readFileSync(SITE_PERMISSIONS_FILE, "utf8")) as Record<string, Record<string, PermissionDecision>>;
  } catch {
    return {};
  }
})();

function permissionOrigin(url: string): string | undefined {
  try {
    const origin = new URL(url).origin;
    return origin === "null" ? undefined : origin;
  } catch {
    return undefined;
  }
}

function saveSitePermissions() {
  writeFileSync(SITE_PERMISSIONS_FILE, JSON.stringify(sitePermissions, null, 2), { mode: 0o600 });
  try {
    chmodSync(SITE_PERMISSIONS_FILE, 0o600);
  } catch {
    /* non-POSIX fs */
  }
}

function configurePagePermissions() {
  const ses = profileSession();
  ses.setPermissionRequestHandler((webContents, permission, callback, details) => {
    if (AUTO_PAGE_PERMISSIONS.has(permission)) {
      callback(true);
      return;
    }
    const origin = permissionOrigin(details.requestingUrl || webContents.getURL());
    const saved = origin ? sitePermissions[origin]?.[permission] : undefined;
    if (saved) {
      callback(saved === "allow");
      return;
    }
    if (!origin || !PROMPTABLE_PAGE_PERMISSIONS.has(permission) || !win) {
      callback(false);
      return;
    }
    void dialog.showMessageBox(win, {
      type: "question",
      buttons: ["Don’t Allow", "Allow"],
      defaultId: 0,
      cancelId: 0,
      title: "Site permission",
      message: `${origin} wants permission to use ${permission}.`,
      detail: "This decision applies to the shared human and agent browsing profile.",
    }).then(({ response }) => {
      const decision: PermissionDecision = response === 1 ? "allow" : "deny";
      sitePermissions = {
        ...sitePermissions,
        [origin]: { ...sitePermissions[origin], [permission]: decision },
      };
      saveSitePermissions();
      callback(decision === "allow");
    }).catch(() => callback(false));
  });
  ses.setPermissionCheckHandler((webContents, permission, requestingOrigin) => {
    if (AUTO_PAGE_PERMISSIONS.has(permission)) return true;
    const origin = permissionOrigin(requestingOrigin || webContents?.getURL() || "");
    return origin ? sitePermissions[origin]?.[permission] === "allow" : false;
  });
}

function readCdpPort(): number {
  const f = join(app.getPath("userData"), "DevToolsActivePort");
  for (let i = 0; i < 50; i++) {
    if (existsSync(f)) {
      const [port] = readFileSync(f, "utf8").split("\n");
      const n = Number(port);
      if (n > 0) {
        try {
          chmodSync(f, 0o600);
        } catch {
          /* non-POSIX fs */
        }
        return n;
      }
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
  throw new Error("DevToolsActivePort never appeared");
}

// ---------- native.* surface (called by the runtime) ----------

function notifyRuntime(type: string, payload: unknown) {
  channel?.notify(type, payload);
}

const viewHooks = {
  onNavigated: (pageId: string, url: string) => notifyRuntime("view.navigated", { pageId, url }),
  onTitle: (pageId: string, title: string) => notifyRuntime("view.titleChanged", { pageId, title }),
  onFavicon: (pageId: string, favicon: string) => notifyRuntime("view.faviconChanged", { pageId, favicon }),
  onLoading: (pageId: string, loading: boolean) => {
    shellView?.webContents.send("view.loading", { pageId, loading });
    notifyRuntime("view.loading", { pageId, loading });
  },
  onNavState: (pageId: string, canGoBack: boolean, canGoForward: boolean) =>
    notifyRuntime("view.navState", { pageId, canGoBack, canGoForward }),
  onCrashed: (pageId: string) => notifyRuntime("view.crashed", { pageId }),
  onDestroyed: (pageId: string) => notifyRuntime("view.removed", { pageId }),
  onPopup: (entry: ViewEntry) => notifyRuntime("view.popup", { pageId: entry.pageId, marker: entry.marker, url: entry.view.webContents.getURL() }),
  onTakeover: (pageId: string) => {
    // acquireStage is held for the whole program, including when the human is
    // watching the same tab. Playwright clicks land as mouseDown/keyDown and
    // must not steal the page. A real click after the program still takeovers.
    if (offscreenActive.has(pageId)) return;
    notifyRuntime("view.takeover", { pageId });
  },
  openAsTab: (url: string) => {
    void channel?.call("api.invoke", { method: "pages.open", params: { url } }).then((t) => {
      const page = t as { pageId: string };
      void channel?.call("api.invoke", { method: "pages.activate", params: { pageId: page.pageId } });
    });
  },
  sendShortcut: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }) =>
    shellView?.webContents.send("shortcut", s),
};

function registerNativeHandlers(ch: RpcChannel) {
  ch.onMethod("native.createPage", (p) => {
    const { pageId, marker, url, background, kind } = p as {
      pageId: string;
      marker: string;
      url: string;
      background: boolean;
      kind?: "chromium" | "engine";
    };
    if (!win) throw new Error("no window");
    createPageView({ win, registry, pageId, marker, url, background, kind, hooks: viewHooks });
    applyStage();
    const wc = registry.get(pageId)?.view.webContents;
    if (wc) notifyRuntime("view.navState", { pageId, canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() });
    return { ok: true };
  });
  ch.onMethod("native.closePage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (entry && win) {
      destroyPageView(entry, win);
      registry.remove(pageId);
    }
    // a closed page can't stay focused, split, or hold the stage lease —
    // stale pointers would leave every other view hidden
    if (focusedPageId === pageId) focusedPageId = null;
    if (splitPageId === pageId) splitPageId = null;
    offscreenActive.delete(pageId);
    applyStage();
    return { ok: true };
  });
  ch.onMethod("native.showPage", (p) => {
    const { pageId, bounds } = p as { pageId: string; bounds: { x: number; y: number; width: number; height: number } | null };
    const entry = registry.get(pageId);
    if (!entry || !win) return { ok: false };
    if (bounds) {
      entry.visibleBounds = bounds;
      stageBounds = bounds;
      applyStage();
    }
    return { ok: true };
  });
  ch.onMethod("native.hidePage", (p) => {
    const { pageId } = p as { pageId: string };
    if (!offscreenActive.has(pageId)) registry.get(pageId)?.view.setVisible(false);
    return { ok: true };
  });
  ch.onMethod("native.stopPage", (p) => {
    const { pageId } = p as { pageId: string };
    const wc = registry.get(pageId)?.view.webContents;
    if (!wc) return { ok: false };
    wc.stop();
    return { ok: true };
  });
  ch.onMethod("native.focusPage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (!entry || !win) return { ok: false };
    focusedPageId = pageId;
    win.contentView.addChildView(entry.view); // re-add → top of z-order
    applyStage();
    entry.view.webContents.focus();
    const wc = entry.view.webContents;
    notifyRuntime("view.navState", { pageId, canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() });
    return { ok: true };
  });
  // A program with pointer/keyboard steps is starting on this page: keep the
  // view laid out (offscreen if it is not the focused tab). Returns at once —
  // parallel programs on different pages never wait on each other.
  ch.onMethod("native.acquireStage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (!entry || !win) return { ok: false };
    offscreenActive.add(pageId);
    applyStage();
    return { ok: true };
  });
  ch.onMethod("native.releaseStage", (p) => {
    const { pageId } = p as { pageId: string };
    if (offscreenActive.delete(pageId)) applyStage();
    return { ok: true };
  });
  ch.onMethod("native.capturePage", async (p) => {
    const { pageId, scale } = p as { pageId: string; scale: number };
    const entry = registry.get(pageId);
    if (!entry) throw new Error(`no view for ${pageId}`);
    const img = await entry.view.webContents.capturePage();
    const size = img.getSize();
    const resized = scale < 1 ? img.resize({ width: Math.round(size.width * scale) }) : img;
    return { dataUrl: resized.toDataURL() };
  });
  ch.onMethod("native.setEngineFrame", (p) => {
    const { pageId, dataUrl } = p as { pageId: string; dataUrl: string };
    const entry = registry.get(pageId);
    if (!entry) return { ok: false };
    setEngineFrame(entry, dataUrl);
    return { ok: true };
  });
  ch.onMethod("native.openExternal", (p) => {
    const { url } = p as { url: unknown };
    if (!isWebUrl(url)) return { ok: false, error: "only http(s) URLs can be opened externally" };
    void shell.openExternal(url);
    return { ok: true };
  });
  ch.onMethod("native.findInPage", async (p) => {
    const { pageId, text, forward, findNext } = p as { pageId: string; text: string; forward: boolean; findNext: boolean };
    const entry = registry.get(pageId);
    if (!entry) return { matches: 0 };
    const wc = entry.view.webContents;
    // Chromium findInPage requires a visible, laid-out view — hidden pages
    // (background tabs, agent-driven pages) report 0 matches — and the first
    // request on a fresh webContents silently initializes the find session
    // without ever emitting found-in-page. The DOM scan below is the
    // authoritative match count in both cases; findInPage additionally gives
    // visible pages real match highlighting.
    const domScan = () =>
      wc
        .executeJavaScript(
          `(() => { const t = ${JSON.stringify(text.toLowerCase())};
             if (!document.body) return 0;
             const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
             let c = 0, n; while ((n = w.nextNode())) { const v = n.nodeValue.toLowerCase();
               let i = 0; while ((i = v.indexOf(t, i)) !== -1) { c++; i += t.length; } } return c; })()`,
          true,
        )
        .catch(() => 0);
    const bounds = entry.view.getBounds();
    const laidOut = entry.view.getVisible() && bounds.width > 0 && bounds.height > 0;
    if (!laidOut) return { matches: await domScan() };
    return new Promise((resolve) => {
      let done = false;
      let sawEvent = false;
      const finish = (r: { matches: number; activeMatch?: number }) => {
        if (done) return;
        done = true;
        wc.removeListener("found-in-page", handler);
        clearInterval(retry);
        clearTimeout(giveUp);
        resolve(r);
      };
      const handler = (_e: unknown, result: { matches: number; activeMatchOrdinal: number; finalUpdate: boolean }) => {
        sawEvent = true;
        warmFind.add(pageId);
        if (!result.finalUpdate) return;
        finish({ matches: result.matches, activeMatch: result.activeMatchOrdinal });
      };
      wc.on("found-in-page", handler);
      wc.findInPage(text, { forward, findNext });
      // re-issue only while the session is cold — on a warm session a
      // findNext:false retry would reset the active match before the real
      // result arrives (⌘G cycling showed 0/N forever)
      const retry = setInterval(() => {
        if (!sawEvent && !warmFind.has(pageId)) wc.findInPage(text, { forward, findNext: false });
      }, 400);
      // if Chromium never reports, answer honestly from the DOM
      const giveUp = setTimeout(() => void domScan().then((m) => finish({ matches: m })), 1200);
    });
  });
  ch.onMethod("native.stopFind", (p) => {
    const { pageId, action } = p as { pageId: string; action: "clear" | "keep" };
    const entry = registry.get(pageId);
    entry?.view.webContents.stopFindInPage(action === "clear" ? "clearSelection" : "keepSelection");
    return { ok: true };
  });
  ch.onMethod("native.setZoom", (p) => {
    const { pageId, level, delta, reset } = p as { pageId: string; level?: number; delta?: number; reset?: boolean };
    const entry = registry.get(pageId);
    if (!entry) return { level: 0 };
    const wc = entry.view.webContents;
    if (reset) wc.setZoomLevel(0);
    else if (level !== undefined) wc.setZoomLevel(level);
    else if (delta !== undefined) wc.setZoomLevel(wc.getZoomLevel() + delta);
    return { level: wc.getZoomLevel() };
  });
  ch.onMethod("native.print", (p) => {
    const { pageId } = p as { pageId: string };
    registry.get(pageId)?.view.webContents.print();
    return { ok: true };
  });
  ch.onMethod("native.setCookies", async (p) => {
    // cookie values flow through but are never logged or persisted to disk
    // beyond Chromium's own encrypted profile store
    const { cookies } = p as {
      cookies: {
        name: string;
        value: string;
        domain: string;
        path: string;
        secure: boolean;
        httpOnly: boolean;
        sameSite?: "Strict" | "Lax" | "None";
        expires?: number;
      }[];
    };
    const ses = profileSession();
    let count = 0;
    for (const c of cookies) {
      const bare = c.domain.replace(/^\./, "");
      try {
        await ses.cookies.set({
          url: `${c.secure ? "https" : "http"}://${bare}${c.path || "/"}`,
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path || "/",
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite:
            c.sameSite === "None" ? "no_restriction" : c.sameSite === "Strict" ? "strict" : c.sameSite === "Lax" ? "lax" : "unspecified",
          ...(c.expires ? { expirationDate: c.expires } : {}),
        });
        count++;
      } catch {
        // a cookie that fails validation (bad domain for url etc.) is skipped,
        // not fatal to the batch
      }
    }
    return { ok: true, count };
  });
  ch.onMethod("native.storeSecret", (p) => {
    const { name, value } = p as { name: string; value: string };
    const dir = join(DATA_DIR, "secrets");
    mkdirSync(dir, { recursive: true });
    const path = join(dir, name.replace(/[^a-zA-Z0-9._-]/g, "_"));
    const payload = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(value)
      : Buffer.from(value, "utf8");
    writeFileSync(path, payload, { mode: 0o600 });
    try {
      chmodSync(path, 0o600);
    } catch {
      /* non-POSIX fs */
    }
    return { ok: true };
  });
  ch.onMethod("native.readSecret", (p) => {
    const { name } = p as { name: string };
    const path = join(DATA_DIR, "secrets", name.replace(/[^a-zA-Z0-9._-]/g, "_"));
    if (!existsSync(path)) return { value: undefined };
    const raw = readFileSync(path);
    try {
      const value = safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(raw)
        : raw.toString("utf8");
      return { value };
    } catch {
      return { value: undefined };
    }
  });
}

// ---------- stage layout ----------

function applyStage() {
  if (!win) return;
  const bounds = stageBounds ?? win.getContentBounds();
  const shown = focusedPageId;
  // Deliberate two-page inspection: a split companion shares the stage beside
  // the focused page.
  const split = !overlayOpen && splitPageId && splitPageId !== shown ? splitPageId : null;
  // Working pages that are not on the stage render at stage bounds *beneath*
  // the shell view (child index 0): laid out, producing frames, receiving
  // trusted input, covered by the opaque shell. A view outside the window
  // would get an empty visible rect and Chromium collapses its viewport.
  for (const entry of registry.all()) {
    // WebContentsView.setBorderRadius exists in current Electron; guard for the popup pseudo-views
    const rounded = entry.view as { setBorderRadius?: (r: number) => void };
    if (typeof rounded.setBorderRadius === "function") {
      try {
        rounded.setBorderRadius(stageRadius);
      } catch {
        /* unsupported on this platform */
      }
    }
    if (entry.pageId === shown && !overlayOpen) {
      if (split) {
        const w = Math.floor(bounds.width / 2);
        entry.view.setBounds({ x: bounds.x, y: bounds.y, width: w, height: bounds.height });
      } else {
        entry.view.setBounds(bounds);
      }
      entry.view.setVisible(true);
    } else if (split && entry.pageId === split) {
      const w = bounds.width - Math.floor(bounds.width / 2);
      entry.view.setBounds({ x: bounds.x + bounds.width - w, y: bounds.y, width: w, height: bounds.height });
      entry.view.setVisible(true);
    } else if (offscreenActive.has(entry.pageId)) {
      win.contentView.addChildView(entry.view, 0);
      entry.view.setBounds(bounds);
      entry.view.setVisible(true);
    } else {
      entry.view.setVisible(false);
    }
  }
}

// ---------- renderer IPC ----------

function wireRendererIpc() {
  ipcMain.on("engine-input", (event, payload: { type?: string; x?: number; y?: number; button?: number; key?: string }) => {
    const entry = registry.byWebContentsId(event.sender.id);
    if (!entry) return;
    notifyRuntime("view.engineInput", { pageId: entry.pageId, ...payload });
    viewHooks.onTakeover(entry.pageId);
  });
  ipcMain.handle("api.invoke", async (_e, method: string, params: unknown) => {
    if (!channel) throw new Error("runtime not connected");
    return channel.call("api.invoke", { method, params }, 60_000);
  });
  ipcMain.handle("ui.setStage", (_e, pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null, radius?: number) => {
    stageBounds = bounds;
    focusedPageId = pageId;
    splitPageId = split ?? null;
    if (typeof radius === "number" && Number.isFinite(radius)) stageRadius = Math.max(0, Math.min(24, Math.round(radius)));
    applyStage();
    return true;
  });
  ipcMain.handle("ui.overlay", (_e, open: boolean) => {
    overlayOpen = open;
    applyStage();
    return true;
  });
  ipcMain.handle("ui.preview", async (_e, pageId: string) => {
    const entry = registry.get(pageId);
    if (!entry) return null;
    try {
      const img = await entry.view.webContents.capturePage();
      const size = img.getSize();
      return img.resize({ width: Math.max(160, Math.round(size.width * 0.25)) }).toDataURL();
    } catch {
      return null;
    }
  });
  ipcMain.handle("ui.contextMenu", (_e, pageId: string | null) => {
    const entry = pageId ? registry.get(pageId) : undefined;
    const wc = entry?.view.webContents;
    // page context → nav + edit + inspect on the page; chrome/input context
    // (null pageId) → edit roles on the focused shell + inspect the shell
    const template: Electron.MenuItemConstructorOptions[] = wc
      ? [
          { label: "Back", enabled: wc.navigationHistory.canGoBack(), click: () => wc.goBack() },
          { label: "Forward", enabled: wc.navigationHistory.canGoForward(), click: () => wc.goForward() },
          { label: "Reload", click: () => wc.reload() },
          { type: "separator" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Open DevTools", click: () => wc.openDevTools({ mode: "detach" }) },
        ]
      : [
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Inspect", click: () => shellView?.webContents.openDevTools({ mode: "detach" }) },
        ];
    Menu.buildFromTemplate(template).popup();
    return true;
  });
  ipcMain.handle("ui.openExternal", (_e, url: unknown) => {
    if (!isWebUrl(url)) return false;
    return shell.openExternal(url).then(() => true);
  });
  ipcMain.handle("ui.print", (_e, pageId: string) => {
    registry.get(pageId)?.view.webContents.print();
    return true;
  });
  ipcMain.handle("ui.devTools", (_e, pageId: string) => {
    registry.get(pageId)?.view.webContents.openDevTools({ mode: "detach" });
    return true;
  });
  ipcMain.handle("ui.hardReload", (_e, pageId: string) => {
    registry.get(pageId)?.view.webContents.reloadIgnoringCache();
    return true;
  });
  ipcMain.handle("ui.closeWindow", () => {
    win?.close();
    return true;
  });
  ipcMain.handle("ui.openFile", async () => {
    if (!win) return null;
    const r = await dialog.showOpenDialog(win, { properties: ["openFile"] });
    return r.canceled || r.filePaths.length === 0 ? null : r.filePaths[0];
  });
  ipcMain.handle("ui.revealPath", (_e, p: string) => {
    shell.showItemInFolder(p);
    return true;
  });
  ipcMain.handle("ui.openPath", async (_e, p: string) => shell.openPath(p));
  ipcMain.handle("ui.saveFile", async (_e, name: string, content: string) => {
    if (!win) return null;
    const r = await dialog.showSaveDialog(win, { defaultPath: join(app.getPath("downloads"), name) });
    if (r.canceled || !r.filePath) return null;
    writeFileSync(r.filePath, content, "utf8");
    return r.filePath;
  });
  ipcMain.handle("app.dataDir", () => DATA_DIR);
  ipcMain.handle("app.sitePermissions", () => sitePermissions);
  ipcMain.handle("app.clearSitePermission", (_e, origin: unknown, permission?: unknown) => {
    if (typeof origin !== "string" || !sitePermissions[origin]) return false;
    if (typeof permission === "string") {
      const next = { ...sitePermissions[origin] };
      delete next[permission];
      sitePermissions = { ...sitePermissions, [origin]: next };
      if (Object.keys(next).length === 0) delete sitePermissions[origin];
    } else {
      const next = { ...sitePermissions };
      delete next[origin];
      sitePermissions = next;
    }
    saveSitePermissions();
    return true;
  });
  ipcMain.handle("ui.setAppearance", (_e, theme: unknown) => {
    applyAppearance(theme === "light" ? "light" : "dark");
    return true;
  });
}

// ---------- downloads ----------

function wireDownloads() {
  downloadsSession().on("will-download", (_event, item, webContents) => {
    const entry = registry.byWebContentsId(webContents?.id ?? -1);
    const filename = item.getFilename();
    const dir = join(DATA_DIR, "downloads");
    mkdirSync(dir, { recursive: true });
    const savePath = join(dir, `${Date.now()}-${filename}`);
    item.setSavePath(savePath);
    const dl = {
      id: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pageId: entry?.pageId,
      filename,
      path: savePath,
      size: 0,
      totalBytes: item.getTotalBytes() > 0 ? item.getTotalBytes() : undefined,
      startedAt: Date.now(),
    };
    notifyRuntime("view.downloadStarted", { ...dl, state: "started" });
    shellView?.webContents.send("download", { ...dl, state: "started" });
    item.on("updated", (_e, state) => {
      shellView?.webContents.send("download", {
        ...dl,
        state: state === "interrupted" ? "interrupted" : "progressing",
        size: item.getReceivedBytes(),
      });
    });
    item.once("done", (_e, state) => {
      const final = { ...dl, state, size: item.getReceivedBytes(), endedAt: Date.now() };
      notifyRuntime("view.downloadFinished", final);
      shellView?.webContents.send("download", final);
    });
  });
}

// ---------- popup windows (window.open with window features) ----------

function wirePopupAdoption() {
  app.on("web-contents-created", (_e, contents) => {
    // WebContentsView webContents also report getType()==="window" in modern
    // Electron — only adopt contents that live in a real popup BrowserWindow.
    if (!BrowserWindow.fromWebContents(contents)) return;
    if (registry.byWebContentsId(contents.id)) return;
    const pageId = `pop_${Date.now().toString(36)}${Math.floor(Math.random() * 999)}`;
    const marker = `vtab-${pageId}`;
    const fakeView = { webContents: contents } as unknown as WebContentsView;
    const entry: ViewEntry = { pageId, marker, view: fakeView, owned: true };
    registry.add(entry);
    installMarker(fakeView, marker);
    contents.on("did-navigate", (_e2, url) => notifyRuntime("view.navigated", { pageId, url }));
    contents.on("page-title-updated", (_e2, title) => notifyRuntime("view.titleChanged", { pageId, title }));
    contents.on("destroyed", () => notifyRuntime("view.removed", { pageId }));
    contents.once("did-finish-load", () => {
      notifyRuntime("view.popup", { pageId, marker, url: contents.getURL() });
    });
  });
}

// ---------- boot ----------

async function boot() {
  const cdpPort = readCdpPort();
  log("cdp port", cdpPort);
  try {
    writeFileSync(join(DATA_DIR, CDP_PORT_FILE), String(cdpPort), { mode: 0o600 });
    chmodSync(join(DATA_DIR, CDP_PORT_FILE), 0o600);
  } catch {
    /* non-POSIX fs */
  }

  await loadProfileExtensions();

  // spawn the runtime — forked under ELECTRON_RUN_AS_NODE
  const runtime = spawnRuntime({
    dataDir: DATA_DIR,
    cdpPort,
    onExit: (code) => log("runtime exited", code),
  });
  const transport: Transport = {
    send: (m) => runtime.proc.send(m as never),
    onMessage: (cb) => runtime.proc.on("message", cb),
  };
  channel = new RpcChannel(transport, "shell->runtime");
  registerNativeHandlers(channel);
  channel.onNotify((type, payload) => {
    if (type === "runtime.ready") log("runtime ready", JSON.stringify(payload));
    if (type === "event") shellView?.webContents.send("event", payload);
  });

  const theme = readStoredTheme();
  nativeTheme.themeSource = theme;
  win = new BaseWindow({
    width: 1440,
    height: 960,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: WINDOW_BG[theme],
    title: "Vector",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 18 },
    roundedCorners: true,
  });

  shellView = new WebContentsView({
    webPreferences: {
      preload: join(import.meta.dirname, "..", "preload", "index.cjs"),
      contextIsolation: true,
      // the preload uses only contextBridge/ipcRenderer, so it runs sandboxed
      sandbox: true,
      nodeIntegration: false,
    },
  });
  shellView.setBackgroundColor(WINDOW_BG[theme]);
  // The shell renderer is the app UI, not a browser: it may only ever show
  // the bundled renderer (or the Vite dev server). Any other navigation —
  // e.g. an injected link inside the chrome — is blocked, and window.open
  // never spawns a window from it.
  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const shellOrigin = devUrl ? new URL(devUrl).origin : null;
  const isShellUrl = (u: string) => {
    try {
      const url = new URL(u);
      return url.protocol === "file:" || (shellOrigin !== null && url.origin === shellOrigin);
    } catch {
      return false;
    }
  };
  shellView.webContents.on("will-navigate", (event, url) => {
    if (!isShellUrl(url)) {
      event.preventDefault();
      log("blocked shell navigation to", url);
    }
  });
  shellView.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) viewHooks.openAsTab(url);
    return { action: "deny" };
  });
  win.contentView.addChildView(shellView);

  configurePagePermissions();
  const layoutShell = () => {
    if (!win || !shellView) return;
    const { width, height } = win.getContentBounds();
    shellView.setBounds({ x: 0, y: 0, width, height });
  };
  win.on("resize", layoutShell);
  layoutShell();

  if (devUrl) {
    await shellView.webContents.loadURL(devUrl);
  } else {
    await shellView.webContents.loadFile(join(import.meta.dirname, "..", "renderer", "index.html"));
  }
  void shellView.webContents.executeJavaScript(`document.documentElement.dataset.theme = ${JSON.stringify(theme)}`);
  if (process.env.VECTOR_DEVTOOLS === "1") shellView.webContents.openDevTools({ mode: "detach" });

  wireRendererIpc();
  wireDownloads();
  wirePopupAdoption();
  installMenu();

  // "close" fires before the page views are destroyed — the runtime freezes
  // its tab snapshot here so teardown removals don't wipe the restore list.
  win.on("close", () => {
    try {
      channel?.notify("app.closing");
    } catch {
      /* runtime already gone */
    }
  });
  win.on("closed", () => {
    win = null;
  });
}

function installMenu() {
  // Browser commands route through the same shortcut dispatcher the keyboard
  // uses — one code path, correct regardless of which view holds focus. The
  // menu's accelerator consumes the key before the focused webContents, so the
  // click handler re-sends it to the shell renderer for dispatch.
  const send = (key: string, opt: { shift?: boolean; alt?: boolean; ctrl?: boolean } = {}) => () =>
    shellView?.webContents.send("shortcut", { key, meta: !opt.ctrl, shift: !!opt.shift, alt: !!opt.alt, ctrl: !!opt.ctrl });
  const cmd = (label: string, key: string, accelerator: string, opt: { shift?: boolean; alt?: boolean; ctrl?: boolean } = {}) =>
    ({ label, accelerator, click: send(key, opt) }) satisfies Electron.MenuItemConstructorOptions;

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Vector",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "hide" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "File",
      submenu: [
        cmd("New Tab", "t", "CmdOrCtrl+T"),
        cmd("Open File…", "o", "CmdOrCtrl+O"),
        cmd("Reopen Closed Tab", "t", "CmdOrCtrl+Shift+T", { shift: true }),
        { type: "separator" },
        cmd("Close Tab", "w", "CmdOrCtrl+W"),
        { label: "Close Window", accelerator: "CmdOrCtrl+Shift+W", click: () => win?.close() },
        { type: "separator" },
        cmd("Print…", "p", "CmdOrCtrl+P"),
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "selectAll" },
        { type: "separator" },
        cmd("Find…", "f", "CmdOrCtrl+F"),
        cmd("Find Next", "g", "CmdOrCtrl+G"),
        cmd("Find Previous", "g", "CmdOrCtrl+Shift+G", { shift: true }),
      ],
    },
    {
      label: "View",
      submenu: [
        cmd("Reload", "r", "CmdOrCtrl+R"),
        cmd("Hard Reload", "r", "CmdOrCtrl+Shift+R", { shift: true }),
        { type: "separator" },
        cmd("Actual Size", "0", "CmdOrCtrl+0"),
        cmd("Zoom In", "=", "CmdOrCtrl+="),
        cmd("Zoom Out", "-", "CmdOrCtrl+-"),
        { type: "separator" },
        cmd("Toggle Sidebar", "s", "CmdOrCtrl+S"),
        cmd("Tab Overview", "a", "CmdOrCtrl+Shift+A", { shift: true }),
        { type: "separator" },
        cmd("Developer Tools", "i", "CmdOrCtrl+Alt+I", { alt: true }),
        cmd("View Source", "u", "CmdOrCtrl+Alt+U", { alt: true }),
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        cmd("Back", "[", "CmdOrCtrl+["),
        cmd("Forward", "]", "CmdOrCtrl+]"),
        { type: "separator" },
        cmd("Select Next Tab", "right", "CmdOrCtrl+Alt+Right", { alt: true }),
        cmd("Select Previous Tab", "left", "CmdOrCtrl+Alt+Left", { alt: true }),
        { type: "separator" },
        cmd("History", "y", "CmdOrCtrl+Y"),
        cmd("Downloads", "j", "CmdOrCtrl+Shift+J", { shift: true }),
        { type: "separator" },
        cmd("Bookmark This Page", "d", "CmdOrCtrl+D"),
        cmd("Bookmark All Tabs", "d", "CmdOrCtrl+Shift+D", { shift: true }),
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "front" }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(boot).catch((e) => {
  console.error("boot failed:", e);
  app.exit(1);
});

app.on("window-all-closed", () => {
  app.quit();
});
app.on("will-quit", () => {
  // the forked runtime gets SIGTERM via process tree teardown; make it explicit
  try {
    channel?.notify("app.quitting");
  } catch {
    /* already gone */
  }
});
