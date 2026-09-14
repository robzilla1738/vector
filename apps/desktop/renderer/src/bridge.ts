/**
 * Typed access to the preload bridge. In a plain browser (vite dev without
 * electron) we expose a stub so the UI renders for visual development.
 */
import type { VectorEvent } from "@vector/contracts";

export interface VectorBridge {
  invoke(method: string, params?: unknown): Promise<unknown>;
  onEvent(cb: (e: VectorEvent) => void): () => void;
  onShortcut(cb: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }) => void): () => void;
  onDownload(cb: (d: unknown) => void): () => void;
  onLoading(cb: (s: { pageId: string; loading: boolean }) => void): () => void;
  setStage(pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null): Promise<boolean>;
  overlay(open: boolean): Promise<boolean>;
  preview(pageId: string): Promise<string | null>;
  contextMenu(pageId: string | null): Promise<boolean>;
  openExternal(url: string): Promise<unknown>;
  revealPath(p: string): Promise<boolean>;
  openPath(p: string): Promise<string>;
  saveFile(name: string, content: string): Promise<string | null>;
  printPage(pageId: string): Promise<boolean>;
  devTools(pageId: string): Promise<boolean>;
  hardReload(pageId: string): Promise<boolean>;
  closeWindow(): Promise<boolean>;
  openFile(): Promise<string | null>;
  dataDir(): Promise<string>;
}

const noop = () => () => {};
const stub: VectorBridge = {
  invoke: async () => {
    throw new Error("Vector bridge unavailable — running outside Electron");
  },
  onEvent: noop,
  onShortcut: noop,
  onDownload: noop,
  onLoading: noop,
  setStage: async () => true,
  overlay: async () => true,
  preview: async () => null,
  contextMenu: async () => true,
  openExternal: async (url) => window.open(url, "_blank"),
  revealPath: async () => true,
  openPath: async () => "",
  saveFile: async () => null,
  printPage: async () => true,
  devTools: async () => true,
  hardReload: async () => true,
  closeWindow: async () => true,
  openFile: async () => null,
  dataDir: async () => "",
};

export const bridge: VectorBridge = (window as unknown as { vector?: VectorBridge }).vector ?? stub;
export const inElectron = !!(window as unknown as { vector?: VectorBridge }).vector;
