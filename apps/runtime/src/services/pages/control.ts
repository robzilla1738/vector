import { AuxError, EventTypes, type PageTarget } from "@aux/contracts";
import type { PageRegistry } from "./registry.js";

export class ControlAuthority {
  constructor(private pages: PageRegistry) {}

  /** pages with an in-flight program — Playwright input is not a human takeover */
  programInflight = new Set<string>();

  // ---------- takeover ----------

  /** Human takeover — flips the local controller so in-process execute is blocked. */
  async takeover(pageId: string): Promise<PageTarget> {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    lp.target.controller = "human";
    lp.target.controllerEpoch++;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "human", controllerEpoch: lp.target.controllerEpoch });
    return lp.target;
  }

  /** Release human takeover. */
  async resume(pageId: string): Promise<PageTarget> {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    lp.target.controller = "none";
    lp.target.controllerEpoch++;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "none" });
    return lp.target;
  }

  /** main -> runtime: user interacted with a native view directly. */
  onNativeTakeover(pageId: string) {
    const lp = this.pages.live.get(pageId);
    if (!lp) return;
    if (this.programInflight.has(pageId)) return;
    // Only agent/external-controlled pages hand control to the human —
    // ordinary browsing must not pin the page as human-owned forever.
    if (lp.target.controller === "agent" || lp.target.controller === "external") {
      void this.takeover(pageId);
    }
  }

  /** Run finished — drop agent control if the human did not take the page. */
  releaseAgent(pageId: string) {
    const lp = this.pages.live.get(pageId);
    if (!lp || lp.target.controller !== "agent") return;
    lp.target.controller = "none";
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "none" });
  }
}
