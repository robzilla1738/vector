import { AuxError, type BrowserSpace, EventTypes, type PageTarget, type PageWindowMove, newPageId } from "@aux/contracts";
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
    return this.lanes.enqueue(pageId, async () => {
      const dp = this.pages.driverPageLenient(pageId);
      await dp.navigate(url);
      const lp = this.pages.live.get(pageId);
      if (!lp) throw new AuxError("target_detached", `page ${pageId} detached during navigation`);
      lp.target.url = url;
      this.pages.persist(lp);
      return lp.target;
    });
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
        const recovered = await this.pages.deps.native.recoverPage(pageId, lp.target.url);
        if (!recovered.ok) throw new AuxError("target_detached", "The native tab is no longer available");
        const driver = this.pages.driverFor("aux");
        if (!driver) throw new AuxError("backend_unavailable", "Browser connection is unavailable");
        await lp.driver?.dispose();
        try {
          lp.driver = await (driver.recoverPage ? driver.recoverPage(lp.target.targetId, pageId, lp.target.documentEpoch) : driver.attach(lp.target.targetId, pageId));
        } catch (error) {
          lp.target.viewStatus = "crashed";
          lp.target.error = "The page reloaded, but its browser connection could not be restored.";
          this.pages.persist(lp);
          if (!this.pages.restoring) this.pages.deps.events.emit(EventTypes.PageUpdated, { page: lp.target });
          throw error;
        }
        lp.lastObs = undefined;
        lp.lastObservationId = undefined;
        lp.history = [];
        this.pages.wireDriverEvents(lp);
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
