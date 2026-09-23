import { BaseWindow, type WebContents, WebContentsView } from "electron";
import { exitPageFullscreen, fullscreenContents } from "../page-fullscreen.js";
import { boundsContaining, inputEventFor, readPagePointer } from "../page-pointer.js";
import { glassActive, windowFill } from "./appearance.js";

/** Process-neutral stage pieces shared by regular and private windows. */
export interface ChromeHost { win: BaseWindow; shellView: WebContentsView; paintedFill: string; chromeOnTop: boolean; toolbarOverlay: boolean }

/**
 * The address bar lives in the shell. Raise that view while it is open so it
 * paints over the page instead of pushing the page down; lower it again by
 * re-raising the stage views.
 */
export function placeChrome(host: ChromeHost, stageViews: WebContentsView[], transparent = false) {
  const fill = windowFill(transparent || host.toolbarOverlay || glassActive());
  if (host.paintedFill !== fill) {
    host.paintedFill = fill;
    host.shellView.setBackgroundColor(fill);
  }
  if (host.win.isDestroyed()) return;
  if (host.toolbarOverlay) {
    host.chromeOnTop = true;
    host.win.contentView.addChildView(host.shellView);
    return;
  }
  if (!host.chromeOnTop) return;
  host.chromeOnTop = false;
  for (const view of stageViews) host.win.contentView.addChildView(view);
}

/** Replay an untrusted shell pointer event onto whichever visible stage view it lands in. */
export function forwardPagePointer(value: unknown, views: WebContentsView[]) {
  const message = readPagePointer(value);
  if (!message) return;
  const hit = boundsContaining(message.x, message.y, views.map(view => ({ view, ...view.getBounds() })));
  if (!hit || hit.view.webContents.isDestroyed()) return;
  const input = inputEventFor(message, hit.x, hit.y);
  if (!input) return;
  if (message.kind === "down") hit.view.webContents.focus();
  hit.view.webContents.sendInputEvent(input);
}

/** The page holding HTML fullscreen, once overlays or a stage change haven't ended it. */
export function stageFullscreen(win: BaseWindow, overlayOpen: boolean, stageContents: WebContents | undefined) {
  const fullscreen = fullscreenContents(win);
  if (fullscreen && (overlayOpen || stageContents !== fullscreen)) { exitPageFullscreen(win); return undefined; }
  return fullscreen;
}

export function fillWindow(win: BaseWindow, view: WebContentsView) {
  const size = win.getContentBounds();
  view.setBounds({ x: 0, y: 0, width: size.width, height: size.height });
  view.setBorderRadius(0);
  win.contentView.addChildView(view);
}
