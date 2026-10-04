import { AuxError, type AuxErrorCode, type BrowserSpace, EventTypes, type PageTarget, type PageWindowMove, newPageId } from "@aux/contracts";
import type { ActivationPolicy } from "./activation.js";
import type { PageLanes } from "./lanes.js";
import type { PageRegistry } from "./registry.js";

export class PageNavigation {
  constructor(private pages: PageRegistry, private lanes: PageLanes, private activation: ActivationPolicy) {}

  async close(pageId: string) {
    const lp = this.pages.live.get(pageId);
    if (lp?.target.backend === "aux" && this.pages.deps.native.available()) {
      const ack = await this.pages.deps.native.tabCommand({ commandId: `agent-${newPageId()}`, windowId: lp.target.windowId ?? "main", command: { kind: "close", pageId } });
      // not_found/wrong_window mean the tab is already gone in main — converge
      // locally rather than keeping a driver attached to a dead view.
      if (ack.status === "rejected" && ack.error?.code !== "not_found" && ack.error?.code !== "wrong_window") return { ok: false };
      if (this.pages.live.get(pageId) !== lp) return { ok: true };
    }
    if (lp && this.pages.live.get(pageId) === lp) {
      lp.target.viewStatus = "detached";
      this.pages.persist(lp);
      this.pages.live.delete(pageId);
      await lp.driver?.dispose().catch(() => {});
    }
    const windowId = lp?.target.windowId ?? "main";
    const returnTarget = this.activation.takeReturnTarget(pageId);
    const wasWindowActive = this.pages.activeByWindow.get(windowId) === pageId;
    if (wasWindowActive) this.pages.activeByWindow.delete(windowId);
    const wasActive = this.pages.activeId === pageId;
    if (wasActive) this.pages.activeId = null;
    const next = wasActive || wasWindowActive ? this.activation.successor(windowId, returnTarget) : undefined;
    if (next) void this.activation.activate(next.target.pageId).catch(() => {});
    else if (wasActive) this.pages.deps.events.emit(EventTypes.PageUpdated, { pageId, activePageId: null });
    this.pages.deps.events.emit(EventTypes.PageRemoved, { pageId });
    return { ok: true };
  }

  async moveToWindow(input: PageWindowMove, space: BrowserSpace): Promise<PageTarget> {
    return this.lanes.enqueue(input.pageId, async () => {
      const page = this.pages.live.get(input.pageId);
      if (!page) throw new AuxError("not_found", "This tab no longer exists.");
      if (page.target.ownedByRuntime || page.target.controller === "agent" || page.target.controller === "external") {
        throw new AuxError("conflict", "Take control of this tab before moving it to another window.");
      }
      if (!this.pages.deps.native.movePage) throw new AuxError("backend_unavailable", "Moving live tabs requires the Aux desktop browser.");
      const fromWindowId = page.target.windowId ?? "main";
      if (input.windowId === fromWindowId) return page.target;
      const moved = await this.pages.deps.native.movePage(input.pageId, input.windowId, input.activate);
      page.target.windowId = moved.windowId;
      if (moved.sourceActivePageId) this.pages.activeByWindow.set(fromWindowId, moved.sourceActivePageId);
      else this.pages.activeByWindow.delete(fromWindowId);
      this.pages.activeByWindow.set(moved.windowId, moved.activePageId ?? input.pageId);
      if (input.activate !== false) this.pages.activeId = input.pageId;
      this.pages.persist(page);
      this.pages.deps.repo.setSetting(`tab-placement:${input.pageId}`, { spaceId: input.spaceId, folder: input.folder });
      this.pages.deps.events.emit("page.moved", {
        page: page.target, fromWindowId, toWindowId: moved.windowId,
        sourceActivePageId: moved.sourceActivePageId, activePageId: moved.activePageId ?? input.pageId, activate: input.activate !== false, spaceId: input.spaceId, space, folder: input.folder,
      });
      return page.target;
    });
  }

  async navigate(pageId: string, url: string): Promise<PageTarget> {
    // An in-flight program keeps the page lane, including a long wait.
    // Playwright's page.goto is a navigation action and cancels that wait;
    // the shell's tab load is a browser navigation, which the wait keeps
    // polling through. Queueing here would also freeze the owner until the
    // program finished.
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("target_detached", `page ${pageId} detached during navigation`);
    const native = await navigateNativePage(this.pages, pageId, url);
    if (native) return native;
    const dp = this.pages.driverPageLenient(pageId);
    await dp.navigate(url);
    const after = this.pages.live.get(pageId);
    if (!after) throw new AuxError("target_detached", `page ${pageId} detached during navigation`);
    after.target.url = url;
    this.pages.persist(after);
    return after.target;
  }


  async back(pageId: string) {
    return this.lanes.enqueue(pageId, async () => {
      const lp = this.pages.live.get(pageId);
      if (lp?.target.navigationError && lp.target.backend === "aux" && this.pages.deps.native.available()) {
        const ack = await this.pages.deps.native.tabCommand({ commandId: `agent-${newPageId()}`,
          windowId: lp.target.windowId ?? "main", command: { kind: "back", pageId } });
        if (ack.status === "rejected") throw new AuxError("target_detached", ack.error?.message ?? "The native tab is no longer available");
        return this.pages.get(pageId);
      }
      await this.pages.driverPageLenient(pageId).back();
      return this.pages.get(pageId);
    });
  }
  async forward(pageId: string) {
    return this.lanes.enqueue(pageId, async () => {
      await this.pages.driverPageLenient(pageId).forward();
      return this.pages.get(pageId);
    });
  }
  async reload(pageId: string) {
    return this.lanes.enqueue(pageId, async () => {
      const lp = this.pages.live.get(pageId);
      if (lp?.target.viewStatus === "crashed" && lp.target.backend === "aux" && this.pages.deps.native.recoverPage) {
        const previousDriver = lp.driver, previousSession = lp.target.sessionId;
        const recovered = await this.pages.deps.native.recoverPage(pageId, lp.target.url);
        if (this.pages.live.get(pageId) !== lp || (lp.driver !== previousDriver && lp.driver !== null) || (lp.target.sessionId !== previousSession && lp.target.sessionId !== undefined))
          throw new AuxError("target_detached", "This tab changed while recovering.");
        if (!recovered.ok) throw new AuxError("target_detached", "The native tab is no longer available");
        const driver = this.pages.driverFor("aux");
        if (!driver) throw new AuxError("backend_unavailable", "Browser connection is unavailable");
        lp.driver = null;
        delete lp.target.sessionId;
        this.pages.persist(lp);
        await previousDriver?.dispose();
        try {
          const attached = await (driver.recoverPage ? driver.recoverPage(lp.target.targetId, pageId, lp.target.documentEpoch) : driver.attach(lp.target.targetId, pageId));
          try { this.pages.installDriver(lp, attached); }
          catch (error) { await attached.dispose().catch(() => {}); throw error; }
        } catch (error) {
          if (this.pages.live.get(pageId) !== lp || lp.driver) throw error;
          lp.target.viewStatus = "crashed";
          lp.target.error = "The page reloaded, but its browser connection could not be restored.";
          this.pages.persist(lp);
          if (!this.pages.restoring) this.pages.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
          throw error;
        }
        this.pages.resetDocumentState(lp);
      } else if (lp?.target.navigationError && lp.target.backend === "aux" && this.pages.deps.native.recoverPage) {
        // A renderer can recover in Electron while Playwright retains its
        // crashed Page flag. The native view owns retries for failed loads.
        const recovered = await this.pages.deps.native.recoverPage(pageId, lp.target.url);
        if (!recovered.ok) throw new AuxError("target_detached", "The native tab is no longer available");
      } else {
        const driver = lp?.target.viewStatus === "crashed" && lp.driver ? lp.driver : this.pages.driverPageLenient(pageId);
        await driver.reload();
      }
      return this.pages.get(pageId);
    });
  }
  async stop(pageId: string) {
    return this.lanes.enqueue(pageId, async () => {
      // webContents.stop() halts the load without the renderer's event loop —
      // the only reliable stop when a page never finishes loading
      if (this.pages.live.get(pageId)?.target.backend === "aux" && this.pages.deps.native.available()) {
        await this.pages.deps.native.stopPage(pageId).catch(() => {});
      }
      await this.pages.driverPageLenient(pageId).stop();
      return this.pages.get(pageId);
    });
  }
}

function sameDocumentUrl(actual: string, requested: string): boolean {
  try { return new URL(actual).href === new URL(requested).href; }
  catch { return false; }
}

/** Original native navigation ACK + current committed person document, without CDP. */
export async function navigateNativePage(pages: PageRegistry, pageId: string, url: string, signal?: AbortSignal): Promise<PageTarget | undefined> {
  const original = pages.live.get(pageId);
  if (!original) throw new AuxError("target_detached", `page ${pageId} detached during navigation`);
  if (original.target.backend !== "aux" || !pages.deps.native.available()) return undefined;
  const windowId = original.target.windowId, controllerEpoch = original.target.controllerEpoch;
  const current = () => !signal?.aborted && !pages.closing && pages.live.get(pageId) === original &&
    original.target.windowId === windowId && original.target.controllerEpoch === controllerEpoch &&
    !["detached", "crashed"].includes(original.target.viewStatus);
  if (!current()) throw new AuxError("target_detached", "The original native navigation retired before dispatch.");
  const ack = await pages.deps.native.tabCommand({
    commandId: `agent-${newPageId()}`, windowId: windowId ?? "main",
    command: { kind: "navigate", pageId, url },
  });
  if (!current()) throw new AuxError("target_detached", "The original page retired during native navigation.");
  const missed = ack.status === "rejected" && (ack.error?.code === "not_found" || ack.error?.code === "wrong_window");
  if (missed) return undefined;
  if (ack.status === "rejected") {
    const raw = ack.error?.code;
    const code: AuxErrorCode = raw === "invalid_params" ? "invalid_params"
      : raw === "forbidden" ? "permission_denied"
      : raw === "stale_tab" ? "conflict" : "target_detached";
    throw new AuxError(code, ack.error?.message ?? "The native tab is no longer available");
  }
  const deadline = Date.now() + 8_000;
  for (;;) {
    if (!current()) throw new AuxError("target_detached", "The original page retired before its navigation committed.");
    if (original.target.navigationError) throw new AuxError("target_detached", "The native page did not load that address.");
    const driver = original.driver?.isAttached() ? original.driver : undefined;
    if (driver) {
      let committed = "";
      try { committed = driver.url(); } catch {}
      if (committed === url || sameDocumentUrl(committed, url)) {
        original.target.url = committed; pages.persist(original); return original.target;
      }
    } else {
      if (original.target.ownedByRuntime || original.target.agentIsolation ||
          !["none", "human"].includes(original.target.controller))
        throw new AuxError("permission_denied", "A protected page requires its original control attachment.");
      // An applied command only initiated navigation. The catalog must first
      // publish its actual committed URL, then the fixed native context reader
      // must agree on that current document. Never write the requested URL.
      if (original.target.url === url || sameDocumentUrl(original.target.url, url)) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) throw new AuxError("target_detached", "The page did not load that address");
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([pages.prepareReadPage(pageId), new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new AuxError("target_detached", "The page did not load that address")), remaining);
          })]);
          if (!current() || Date.now() >= deadline) throw new AuxError("target_detached", "The original navigation deadline expired.");
          return original.target;
        } catch (error) {
          if (!current() || Date.now() >= deadline) throw error;
          if (!(error instanceof AuxError) || !["ref_stale", "backend_unavailable", "permission_denied"].includes(error.code)) throw error;
        } finally { if (timer) clearTimeout(timer); }
      }
    }
    if (Date.now() >= deadline) throw new AuxError("target_detached", "The page did not load that address");
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}
