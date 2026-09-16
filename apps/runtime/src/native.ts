import { VectorError, type RpcChannel } from "@vector/contracts";

/**
 * Calls into the Electron main process, which owns all native surfaces.
 * In standalone mode (tests, external-only use) the bridge is absent and
 * vector page creation returns an explicit error.
 */
export interface NativeBridge {
  createPage(opts: { pageId: string; marker: string; url: string; background: boolean }): Promise<{ ok: true }>;
  closePage(pageId: string): Promise<{ ok: boolean }>;
  showPage(pageId: string, bounds: { x: number; y: number; width: number; height: number }): Promise<{ ok: boolean }>;
  hidePage(pageId: string): Promise<{ ok: boolean }>;
  focusPage(pageId: string): Promise<{ ok: boolean }>;
  /** Stop an in-flight load without needing the renderer's event loop. */
  stopPage(pageId: string): Promise<{ ok: boolean }>;
  /** Temporarily show a hidden page's view while pointer steps run — serialized. */
  acquireStage(pageId: string): Promise<{ ok: boolean }>;
  releaseStage(pageId: string): Promise<{ ok: boolean }>;
  capturePage(pageId: string, scale: number): Promise<{ dataUrl: string }>;
  openExternal(url: string): Promise<{ ok: boolean }>;
  findInPage(pageId: string, text: string, forward: boolean, findNext: boolean): Promise<{ matches: number; activeMatch?: number }>;
  stopFind(pageId: string, action: "clear" | "keep"): Promise<{ ok: boolean }>;
  setZoom(pageId: string, level?: number, delta?: number, reset?: boolean): Promise<{ level: number }>;
  /** Write cookies into the shared profile partition. Returns count set. */
  setCookies(cookies: unknown[]): Promise<{ ok: boolean; count: number }>;
  /** Persist a secret via Electron safeStorage (plan A22). */
  storeSecret(name: string, value: string): Promise<{ ok: true }>;
  readSecret(name: string): Promise<{ value?: string }>;
  available(): boolean;
}

export class ChannelNativeBridge implements NativeBridge {
  constructor(private channel: RpcChannel) {}
  available() {
    return true;
  }
  createPage(o: { pageId: string; marker: string; url: string; background: boolean }) {
    return this.channel.call<{ ok: true }>("native.createPage", o);
  }
  closePage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.closePage", { pageId });
  }
  showPage(pageId: string, bounds: { x: number; y: number; width: number; height: number }) {
    return this.channel.call<{ ok: boolean }>("native.showPage", { pageId, bounds });
  }
  hidePage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.hidePage", { pageId });
  }
  focusPage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.focusPage", { pageId });
  }
  stopPage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.stopPage", { pageId });
  }
  acquireStage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.acquireStage", { pageId });
  }
  releaseStage(pageId: string) {
    return this.channel.call<{ ok: boolean }>("native.releaseStage", { pageId });
  }
  capturePage(pageId: string, scale: number) {
    return this.channel.call<{ dataUrl: string }>("native.capturePage", { pageId, scale });
  }
  openExternal(url: string) {
    return this.channel.call<{ ok: boolean }>("native.openExternal", { url });
  }
  findInPage(pageId: string, text: string, forward: boolean, findNext: boolean) {
    return this.channel.call<{ matches: number; activeMatch?: number }>("native.findInPage", { pageId, text, forward, findNext });
  }
  stopFind(pageId: string, action: "clear" | "keep") {
    return this.channel.call<{ ok: boolean }>("native.stopFind", { pageId, action });
  }
  setZoom(pageId: string, level?: number, delta?: number, reset?: boolean) {
    return this.channel.call<{ level: number }>("native.setZoom", { pageId, level, delta, reset });
  }
  setCookies(cookies: unknown[]) {
    return this.channel.call<{ ok: boolean; count: number }>("native.setCookies", { cookies });
  }
  storeSecret(name: string, value: string) {
    return this.channel.call<{ ok: true }>("native.storeSecret", { name, value });
  }
  readSecret(name: string) {
    return this.channel.call<{ value?: string }>("native.readSecret", { name });
  }
}

export class NullNativeBridge implements NativeBridge {
  available() {
    return false;
  }
  private fail(): never {
    throw new VectorError(
      "backend_unavailable",
      "No native surface: the runtime is not attached to a Vector desktop shell",
    );
  }
  createPage(): never { this.fail(); }
  closePage(): never { this.fail(); }
  showPage(): never { this.fail(); }
  hidePage(): never { this.fail(); }
  focusPage(): never { this.fail(); }
  stopPage(): never { this.fail(); }
  acquireStage(): never { this.fail(); }
  releaseStage(): never { this.fail(); }
  capturePage(): never { this.fail(); }
  openExternal(): never { this.fail(); }
  findInPage(): never { this.fail(); }
  stopFind(): never { this.fail(); }
  setZoom(): never { this.fail(); }
  setCookies(): never { this.fail(); }
  async storeSecret() { return { ok: true as const }; }
  async readSecret() { return { value: undefined as string | undefined }; }
}
