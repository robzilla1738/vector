import { BaseWindow, WebContentsView, ipcMain } from "electron";
import { join } from "node:path";
import { PRIMARY_WINDOW_ID } from "../app/bootstrap.js";
import { registry } from "../app/services.js";
import { isShellDocument } from "../shell-origin.js";
import type { ViewEntry } from "../target-registry.js";
import { attachToolbarEdgeWatch } from "../toolbar-edge-watch.js";

export interface RegularWindowState {
  /** Native page requested by the renderer; null while shell content owns the stage. */
  stagePageId: string | null;
  quickAsk: boolean;
  id: string;
  win: BaseWindow;
  shellView: WebContentsView;
  overlayOpen: boolean;
  toolbarOverlay: boolean;
  toolbarOverlaySeq: number;
  paintedFill: string;
  chromeOnTop: boolean;
  stageBounds: { x: number; y: number; width: number; height: number } | null;
  focusedPageId: string | null;
  splitPageId: string | null;
  splitRatio: number;
  stageRadius: number;
  closeApproved: boolean;
  previewWatch: { pageId: string; stop: () => void } | null;
}
export const regularWindows = new Map<string, RegularWindowState>();
export const toolbarEdges = new Map<string, ReturnType<typeof attachToolbarEdgeWatch>>();
export const pageWindowOwners = new Map<string, string>();
export const stateForWindowId = (id?: string) => regularWindows.get(id ?? PRIMARY_WINDOW_ID) ?? regularWindows.get(PRIMARY_WINDOW_ID) ?? regularWindows.values().next().value;
export const stateForEntry = (entry?: ViewEntry) => stateForWindowId(entry?.windowId);


export const stateForShell = (contentsId: number) => [...regularWindows.values()].find(state => state.shellView.webContents.id === contentsId);
export const focusedRegularWindow = () => {
  const focused = BaseWindow.getFocusedWindow();
  return [...regularWindows.values()].find(state => state.win === focused) ?? stateForWindowId(PRIMARY_WINDOW_ID);
};
export const shellForPage = (pageId: string) => regularWindows.get(pageWindowOwners.get(pageId) ?? PRIMARY_WINDOW_ID)?.shellView;
export const broadcastToShells = (channelName: string, payload: unknown) => {
  for (const state of regularWindows.values()) {
    if (!state.shellView.webContents.isDestroyed()) state.shellView.webContents.send(channelName, payload);
  }
};
export const requireOwnedEntry = (state: RegularWindowState, pageId: unknown, message = "This browser tab is no longer available.") => {
  const entry = typeof pageId === "string" ? registry.get(pageId) : undefined;
  if (!entry || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id || entry.view.webContents.isDestroyed()) throw new Error(message);
  return entry;
};

/** Register a renderer handler that only the Aux shell document of a regular window may call. */
export function handleShell<A extends unknown[]>(channel: string, fn: (state: RegularWindowState, ...args: A) => unknown) {
  ipcMain.handle(channel, (event, ...args) => fn(requireShellUi(event), ...(args as A)));
}

export const requireShellUi = (event: Electron.IpcMainInvokeEvent) => {
  const state = stateForShell(event.sender.id);
  if (!state || event.senderFrame !== state.shellView.webContents.mainFrame
    || !isShellDocument(event.senderFrame.url, join(import.meta.dirname, "..", "renderer", "index.html"), process.env.VITE_DEV_SERVER_URL)) throw new Error("These controls require the Aux interface");
  return state;
};

export function notifyHttpAuthChanged() {
  for (const state of regularWindows.values()) {
    if (!state.shellView.webContents.isDestroyed()) state.shellView.webContents.send('http-auth-changed');
  }
}
