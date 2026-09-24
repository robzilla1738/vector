import { BaseWindow, WebContentsView, nativeTheme } from "electron";
import { randomUUID } from "node:crypto";
import { join } from "node:path";
import { DATA_DIR, desktopEnv, log } from "../app/bootstrap.js";
import { exitApproved, requestExit, requestRegularWindowClose } from "../app/exit.js";
import { isWebUrl } from "../app/external-urls.js";
import { browserProfiles, offscreen, profile } from "../app/services.js";
import { notifyRuntime } from "../runtime/supervisor.js";
import { isShellDocument } from "../shell-origin.js";
import { releaseWindowPreviews } from "../result-preview-protocol.js";
import { attachToolbarEdgeWatch } from "../toolbar-edge-watch.js";
import { trafficLights } from "../traffic-lights.js";
import { viewHooks } from "../views/hooks.js";
import { setWindowMaterial } from "../window-material.js";
import { glassActive, readStoredAppearance, setRequestedAppearance, windowFill } from "./appearance.js";
import { type RegularWindowState, regularWindows, toolbarEdges } from "./registry.js";
import { applyStage } from "./stage.js";

export async function createRegularWindow(id = `window-${randomUUID()}`, quickAsk = false, onCreated?: () => void): Promise<RegularWindowState> {
  const existing = regularWindows.get(id);
  if (existing) { existing.win.show(); existing.win.focus(); return existing; }
  const { theme, translucent, material } = readStoredAppearance(DATA_DIR);
  setRequestedAppearance(translucent, material);
  nativeTheme.themeSource = theme;
  const glass = glassActive(translucent);
  const backgroundColor = windowFill(glass);
  const regularWindow = new BaseWindow({
    width: quickAsk ? 580 : 1440, height: quickAsk ? 500 : 960, minWidth: quickAsk ? 420 : 900, minHeight: quickAsk ? 360 : 640,
    backgroundColor: quickAsk ? "#00000000" : backgroundColor,
    // CSS and WebContentsView alpha also need a transparent native window.
    transparent: process.platform === "darwin",
    visualEffectState: "active",
    // Shown once the shell document is up — a transparent window must not appear empty.
    show: false,
    // A square system shadow sits outside the rounded panel. The panel draws its own.
    hasShadow: quickAsk ? false : undefined,
    title: `${quickAsk ? "Ask Aux" : "Aux"} — ${profile.name}`, titleBarStyle: "hiddenInset", trafficLightPosition: quickAsk ? { x: 30, y: 26 } : trafficLights, roundedCorners: true,
  });
  const regularShell = new WebContentsView({ webPreferences: {
    preload: join(import.meta.dirname, "..", "preload", "index.cjs"),
    additionalArguments: [`--aux-window-id=${encodeURIComponent(id)}`, ...(quickAsk ? ["--aux-quick-ask"] : [])],
    contextIsolation: true, sandbox: true, nodeIntegration: false,
    // A hidden shell would boot at background priority; throttling returns once it shows.
    backgroundThrottling: false,
  }});
  regularShell.setBackgroundColor(quickAsk ? "#00000000" : backgroundColor);
  regularShell.webContents.once("dom-ready", () => {
    if (!quickAsk && !regularWindow.isDestroyed()) regularWindow.show();
    if (!regularShell.webContents.isDestroyed()) regularShell.webContents.setBackgroundThrottling(true);
  });
  const state: RegularWindowState = { id, quickAsk, win: regularWindow, shellView: regularShell, overlayOpen: false, toolbarOverlay: false, toolbarOverlaySeq: 0, paintedFill: backgroundColor, chromeOnTop: false,
    stageBounds: null, stagePageId: null, focusedPageId: null, splitPageId: null, splitRatio: .5, stageRadius: 0, closeApproved: false, previewWatch: null };
  toolbarEdges.set(id, attachToolbarEdgeWatch(regularWindow, regularShell.webContents, () => ({
    page: !!state.stagePageId && !state.overlayOpen,
    stage: state.stageBounds,
  })));
  regularWindows.set(id, state);
  browserProfiles.noteActive(browserProfiles.currentId);
  onCreated?.();

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const isShellUrl = (url: string) => isShellDocument(url, join(import.meta.dirname, "..", "renderer", "index.html"), devUrl);
  regularShell.webContents.on("will-navigate", (event, url) => {
    if (!isShellUrl(url)) { event.preventDefault(); log("blocked shell navigation to", url); }
  });
  // HTML results are isolated subframes of the shell. They may run local script,
  // but cannot turn themselves into a normal web page in the shell session.
  regularShell.webContents.on("will-frame-navigate", details => {
    if (!details.isMainFrame && !details.url.startsWith("aux-result://preview/")) details.preventDefault();
  });
  regularShell.webContents.on("destroyed", () => releaseWindowPreviews(regularShell.webContents.id));
  // The shell is chrome UI only — page WebContents live in their own processes,
  // so reloading a crashed shell never discards the user's tabs.
  regularShell.webContents.on("render-process-gone", (_event, details) => {
    log(`shell renderer gone (${details.reason}); reloading`);
    if (!regularShell.webContents.isDestroyed()) regularShell.webContents.reload();
  });
  regularShell.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) viewHooks.openAsTab(url, { windowId: id });
    return { action: "deny" };
  });
  regularWindow.contentView.addChildView(regularShell);
  if (!quickAsk) setWindowMaterial(regularWindow, glass ? material : null);
  const layout = () => {
    const { width, height } = regularWindow.getContentBounds();
    regularShell.setBounds({ x: 0, y: 0, width, height });
    applyStage(state);
  };
  regularWindow.on("resize", layout);
  layout();
  // A shell that fails to load still shows (its crash/reload path takes over).
  const reveal = setTimeout(() => { if (!quickAsk && !regularWindow.isDestroyed()) regularWindow.show(); }, 4000);
  try {
    if (devUrl) await regularShell.webContents.loadURL(devUrl);
    else await regularShell.webContents.loadFile(join(import.meta.dirname, "..", "renderer", "index.html"));
  } finally {
    clearTimeout(reveal);
    if (!quickAsk && !regularWindow.isDestroyed() && !regularWindow.isVisible()) regularWindow.show();
  }
  void regularShell.webContents.executeJavaScript(`document.documentElement.dataset.theme = ${JSON.stringify(theme)}`);
  if (desktopEnv.AUX_DEVTOOLS === "1") regularShell.webContents.openDevTools({ mode: "detach" });
  regularWindow.on("focus", () => {
    if (state.focusedPageId) notifyRuntime("view.windowFocused", {pageId: state.focusedPageId, windowId: state.id});
  });
  // Gesture navigation lands on the focused page: 3-finger swipes (macOS)
  // and the Win/Linux app-command keys/mouse buttons share the tab port so
  // history guards, wake and takeover stay identical to menu/shortcut nav.
  // Edge-overscroll wheel runs reach the same port through onNavGesture.
  regularWindow.on("swipe", (_event, direction) => {
    if (direction === "left" || direction === "right") viewHooks.onNavGesture?.(state.stagePageId ?? "", direction === "left" ? "forward" : "back");
  });
  regularWindow.on("app-command", (_event, command) => {
    if (command === "browser-backward" || command === "browser-forward") viewHooks.onNavGesture?.(state.stagePageId ?? "", command === "browser-backward" ? "back" : "forward");
  });
  regularWindow.on("close", event => {
    if (exitApproved || state.closeApproved) return;
    event.preventDefault();
    if (state.quickAsk && [...regularWindows.values()].some(window => !window.quickAsk)) { state.win.hide(); return; }
    if ([...regularWindows.values()].filter(window => !window.quickAsk).length <= 1) void requestExit();
    else void requestRegularWindowClose(state);
  });
  regularWindow.on("closed", () => {
    state.previewWatch?.stop();
    if (state.previewWatch) offscreen.forget(state.previewWatch.pageId);
    state.previewWatch = null;
    toolbarEdges.get(id)?.stop();
    toolbarEdges.delete(id);
    regularWindows.delete(id);
  });
  return state;
}
