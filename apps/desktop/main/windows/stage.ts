import { splitWidths } from "@aux/contracts/split-layout";
import { BaseWindow, nativeTheme } from "electron";
import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { offscreen, profile, registry } from "../app/services.js";
import { exitPageFullscreen, fullscreenContents } from "../page-fullscreen.js";
import { boundsContaining, inputEventFor, readPagePointer } from "../page-pointer.js";
import { scheduleIdleFreeze, wakeIfIdle, wakePage } from "../tabs/lifecycle-controller.js";
import { ensureTabView } from "../tabs/materialize.js";
import type { ViewEntry } from "../target-registry.js";
import { syncToolbarGlass } from "../toolbar-glass.js";
import { glassActive, windowFill } from "./appearance.js";
import { type RegularWindowState, stateForWindowId, toolbarEdges } from "./registry.js";

export function clearPreviewWatch(state: RegularWindowState) {
  const watch = state.previewWatch;
  if (!watch) return;
  state.previewWatch = null;
  watch.stop();
  if (offscreen.endPreview(watch.pageId) && !state.win.isDestroyed()) applyStage(state);
}

// ---------- stage layout ----------

export function windowPageTitle(state: RegularWindowState, title?: string) {
  const contents = registry.get(state.focusedPageId ?? "")?.view.webContents;
  if (!contents || contents.isDestroyed()) return "New Tab";
  const url = contents.getURL();
  if (!url || url === "about:blank") return "New Tab";
  const label = (title ?? contents.getTitle()).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (label && label !== url) return label.slice(0, 160);
  try { return new URL(url).hostname || "New Tab"; } catch { return "New Tab"; }
}

export function updateWindowTitle(state: RegularWindowState, pageTitle?: string) {
  if (state.win.isDestroyed()) return;
    const title = state.quickAsk ? `Ask Aux — ${profile.name}` : `${windowPageTitle(state, pageTitle)} — Aux — ${profile.name}`;
  if (state.win.getTitle() !== title) state.win.setTitle(title);
}

/** What applyStage last applied to each view — native setters run only on change. */
export interface Placement { x: number; y: number; width: number; height: number; visible: boolean; radius: number; beneath: boolean }
export const placements = new WeakMap<ViewEntry, Placement>();
/** Something outside applyStage moved, raised or hid the view. */
export const forgetPlacement = (entry?: ViewEntry) => { if (entry) placements.delete(entry); };
export function place(win: BaseWindow, entry: Extract<ViewEntry, { popup?: undefined }>, radius: number, bounds: Electron.Rectangle | null, beneath = false) {
  const prior = placements.get(entry);
  if (prior?.radius !== radius) entry.view.setBorderRadius(radius);
  if (beneath && !prior?.beneath) win.contentView.addChildView(entry.view, 0);
  if (bounds && (!prior || prior.x !== bounds.x || prior.y !== bounds.y || prior.width !== bounds.width || prior.height !== bounds.height)) entry.view.setBounds(bounds);
  if (prior?.visible !== !!bounds) entry.view.setVisible(!!bounds);
  placements.set(entry, { ...(bounds ?? { x: prior?.x ?? 0, y: prior?.y ?? 0, width: prior?.width ?? 0, height: prior?.height ?? 0 }), visible: !!bounds, radius, beneath: beneath || (!!prior?.beneath && !bounds) });
}

export function applyStage(state = stateForWindowId(PRIMARY_WINDOW_ID)) {
  if (!state) return;
  const syncToolbarEdge = () => toolbarEdges.get(state.id)?.sync();
  updateWindowTitle(state);
  const { win } = state;
  const bounds = state.stageBounds ?? win.getContentBounds();
  const shown = state.stagePageId;
  let fullscreen=fullscreenContents(win);
  if(fullscreen && (state.overlayOpen || registry.get(shown??"")?.view.webContents!==fullscreen)) {
    exitPageFullscreen(win);fullscreen=undefined;
  }
  if(fullscreen) {
    const size=win.getContentBounds();
    for(const entry of registry.all()) {
      if(entry.popup || (entry.windowId??PRIMARY_WINDOW_ID)!==state.id)continue;
      const shown=entry.view.webContents===fullscreen;
      forgetPlacement(entry);
      entry.view.setVisible(shown);
      if(shown){wakePage(entry);entry.view.setBounds({x:0,y:0,width:size.width,height:size.height});entry.view.setBorderRadius(0);win.contentView.addChildView(entry.view);}
    }
    syncToolbarEdge();
    syncToolbarGlass(state.id, [], false, nativeTheme.shouldUseDarkColors, nativeTheme.prefersReducedTransparency);
    return;
  }
  // The tab the stage wants must exist — restored/discarded records
  // materialize here so the active tab loads before anything else does.
  if (shown && !registry.get(shown)) ensureTabView(shown);
  // Deliberate two-page inspection: a split companion shares the stage beside
  // the focused page.
  if (state.splitPageId && !registry.get(state.splitPageId)) ensureTabView(state.splitPageId);
  const companion = state.splitPageId ? registry.get(state.splitPageId) : undefined;
  const split = shown && !state.overlayOpen && companion && companion.pageId !== shown
    && !companion.popup && !companion.runtimeOwned
    && (companion.windowId ?? PRIMARY_WINDOW_ID) === state.id
    && !companion.view.webContents.isDestroyed() && !companion.view.webContents.isCrashed()
    && (companion.showBlankDocument || (!!companion.view.webContents.getURL() && companion.view.webContents.getURL() !== "about:blank"))
    ? companion.pageId : null;
  // Working pages that are not on the stage render at stage bounds *beneath*
  // the shell view (child index 0): laid out, producing frames, receiving
  // trusted input, covered by the opaque shell. A view outside the window
  // would get an empty visible rect and Chromium collapses its viewport.
  for (const entry of registry.all()) {
    if (entry.popup) continue; // Independent windows never participate in the tab stage.
    if ((entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) continue;
    const radius = state.stageRadius;
    if (entry.pageId === shown && !state.overlayOpen) {
      wakeIfIdle(entry);
      place(win, entry, radius, split ? { ...bounds, width: splitWidths(bounds.width, state.splitRatio).left } : bounds);
    } else if (split && entry.pageId === split) {
      wakeIfIdle(entry);
      const w = splitWidths(bounds.width, state.splitRatio).right;
      place(win, entry, radius, { x: bounds.x + bounds.width - w, y: bounds.y, width: w, height: bounds.height });
    } else if (offscreen.holds(entry.pageId)) {
      wakeIfIdle(entry);
      place(win, entry, radius, bounds, true);
    } else {
      place(win, entry, radius, null);
      if(entry.pageId!==state.focusedPageId&&entry.pageId!==state.splitPageId)scheduleIdleFreeze(entry);
    }
  }
  placeChrome(state);
  syncToolbarEdge();
  syncToolbarGlass(state.id, stageWebContents(state), state.toolbarOverlay, nativeTheme.shouldUseDarkColors, nativeTheme.prefersReducedTransparency);
}

export function stageWebContents(state: RegularWindowState): Electron.WebContents[] {
  return [state.stagePageId, state.splitPageId].flatMap(id => {
    const entry = id ? registry.get(id) : undefined;
    if (!entry || entry.popup || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id || entry.view.webContents.isDestroyed() || !entry.view.getVisible()) return [];
    return [entry.view.webContents];
  });
}

export function placeChrome(state: RegularWindowState) {
  const fill = windowFill(state.quickAsk || state.toolbarOverlay || glassActive());
  if (state.paintedFill !== fill) {
    state.paintedFill = fill;
    state.shellView.setBackgroundColor(fill);
  }
  if (state.win.isDestroyed()) return;
  // The address bar lives in the shell. Raise that view while it is open so it paints over the page instead of pushing the page down.
  if (state.toolbarOverlay) {
    state.chromeOnTop = true;
    state.win.contentView.addChildView(state.shellView);
    return;
  }
  if (!state.chromeOnTop) return;
  state.chromeOnTop = false;
  for (const pageId of [state.stagePageId, state.splitPageId]) {
    const entry = pageId ? registry.get(pageId) : undefined;
    if (!entry || entry.popup || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) continue;
    state.win.contentView.addChildView(entry.view);
  }
}

export function deliverPagePointer(state: RegularWindowState, value: unknown) {
  if (!state.toolbarOverlay || state.overlayOpen) return;
  const message = readPagePointer(value);
  if (!message) return;
  const visible = [state.splitPageId, state.stagePageId].flatMap(pageId => {
    const entry = pageId ? registry.get(pageId) : undefined;
    if (!entry || entry.popup || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id || !entry.view.getVisible()) return [];
    return [{ entry, ...entry.view.getBounds() }];
  });
  const hit = boundsContaining(message.x, message.y, visible);
  if (!hit || hit.entry.view.webContents.isDestroyed()) return;
  const input = inputEventFor(message, hit.x, hit.y);
  if (!input) return;
  if (message.kind === "down") hit.entry.view.webContents.focus();
  hit.entry.view.webContents.sendInputEvent(input);
}
