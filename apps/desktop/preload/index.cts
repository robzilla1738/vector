/**
 * Preload for the Vector shell renderer. Compiled to index.cjs (CommonJS)
 * so Electron loads it as a classic preload regardless of package type.
 */
import { contextBridge, ipcRenderer } from "electron";

const vector = {
  /** call a versioned runtime method */
  invoke: (method: string, params?: unknown) =>
    ipcRenderer.invoke("api.invoke", method, params ?? {}) as Promise<unknown>,

  /** runtime event stream */
  onEvent: (cb: (e: unknown) => void) => {
    const l = (_e: unknown, ev: unknown) => cb(ev);
    ipcRenderer.on("event", l);
    return () => ipcRenderer.removeListener("event", l);
  },
  /** app shortcuts forwarded from focused native page views */
  onShortcut: (cb: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }) => void) => {
    const l = (_e: unknown, s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }) => cb(s);
    ipcRenderer.on("shortcut", l);
    return () => ipcRenderer.removeListener("shortcut", l);
  },
  onDownload: (cb: (d: unknown) => void) => {
    const l = (_e: unknown, d: unknown) => cb(d);
    ipcRenderer.on("download", l);
    return () => ipcRenderer.removeListener("download", l);
  },
  onLoading: (cb: (s: { pageId: string; loading: boolean }) => void) => {
    const l = (_e: unknown, s: { pageId: string; loading: boolean }) => cb(s);
    ipcRenderer.on("view.loading", l);
    return () => ipcRenderer.removeListener("view.loading", l);
  },

  /** position the visible native page inside the stage rectangle (CSS px); `radius` rounds its corners to match the stage card */
  setStage: (pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null, radius?: number) =>
    ipcRenderer.invoke("ui.setStage", pageId, bounds, split, radius),
  /** hide native pages while a DOM overlay (palette/menus/overview) is up */
  overlay: (open: boolean) => ipcRenderer.invoke("ui.overlay", open),
  /** thumbnail data-url for a native page */
  preview: (pageId: string) => ipcRenderer.invoke("ui.preview", pageId) as Promise<string | null>,
  contextMenu: (pageId: string | null) => ipcRenderer.invoke("ui.contextMenu", pageId),
  openExternal: (url: string) => ipcRenderer.invoke("ui.openExternal", url),
  revealPath: (p: string) => ipcRenderer.invoke("ui.revealPath", p),
  openPath: (p: string) => ipcRenderer.invoke("ui.openPath", p) as Promise<string>,
  saveFile: (name: string, content: string) => ipcRenderer.invoke("ui.saveFile", name, content) as Promise<string | null>,
  /** print the native page (⌘P) */
  printPage: (pageId: string) => ipcRenderer.invoke("ui.print", pageId),
  /** Chromium devtools for the native page (⌥⌘I) */
  devTools: (pageId: string) => ipcRenderer.invoke("ui.devTools", pageId),
  /** reload bypassing cache (⇧⌘R) */
  hardReload: (pageId: string) => ipcRenderer.invoke("ui.hardReload", pageId),
  /** close the whole window (⇧⌘W, or ⌘W on the last tab) */
  closeWindow: () => ipcRenderer.invoke("ui.closeWindow"),
  /** file picker for ⌘O — returns a path or null */
  openFile: () => ipcRenderer.invoke("ui.openFile") as Promise<string | null>,
  dataDir: () => ipcRenderer.invoke("app.dataDir") as Promise<string>,
};

export type VectorBridge = typeof vector;
contextBridge.exposeInMainWorld("vector", vector);
