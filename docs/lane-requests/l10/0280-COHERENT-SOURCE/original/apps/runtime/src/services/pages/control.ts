import { AuxError, EventTypes, type PageTarget } from "@aux/contracts";
import type { PageRegistry } from "./registry.js";

export class ControlAuthority {
  constructor(private pages: PageRegistry) {}

  /** Execution bookkeeping; only the native producer distinguishes physical from synthetic input. */
  programInflight = new Set<string>();

  // ---------- takeover ----------

  /** Human takeover — flips the local controller so in-process execute is blocked. */
  async takeover(pageId: string): Promise<PageTarget> {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    if (lp.target.controller === "human") return lp.target;
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
    if (lp.target.controller !== "human")
      throw new AuxError("conflict", "This page is no longer held by the person. Refresh before returning control.");
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
    // The native producer must authenticate physical pointer/key input. An
    // in-flight program is precisely when the epoch fence matters most.
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
