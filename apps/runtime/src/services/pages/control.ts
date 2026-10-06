import { AuxError, EgressContextSchema, EventTypes, type PageTarget } from "@aux/contracts";
import type { PageRegistry } from "./registry.js";

export class ControlAuthority {
  constructor(private pages: PageRegistry) {}

  /** Execution bookkeeping; only the native producer distinguishes physical from synthetic input. */
  programInflight = new Set<string>();

  // ---------- takeover ----------

  /** Human takeover — flips the local controller so in-process execute is blocked. */
  private async hold(pageId: string, nativeRunId?: string): Promise<PageTarget> {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    if (lp.target.controller === "human") return lp.target;
    lp.target.controller = "human";
    lp.target.controllerEpoch++;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageTakeover, {
      pageId,
      controller: "human",
      controllerEpoch: lp.target.controllerEpoch,
      ...(nativeRunId ? { nativeRunId } : {}),
    });
    return lp.target;
  }

  takeover(pageId: string): Promise<PageTarget> {
    return this.hold(pageId);
  }

  /** Host-only caller has already checked its original native scope and ACK. */
  takeoverFromNative(pageId: string, runId: string): Promise<PageTarget> {
    return this.hold(pageId, runId);
  }

  /** Release human takeover. */
  async resume(pageId: string, nativePersonResume?: string): Promise<PageTarget> {
    const lp = this.pages.live.get(pageId);
    if (!lp) throw new AuxError("not_found", `no page ${pageId}`);
    if (lp.target.controller !== "human")
      throw new AuxError(
        "conflict",
        "This page is no longer held by the person. Refresh before returning control.",
      );
    if (lp.target.backend === "aux") {
      const original = structuredClone(lp.target);
      const localDeadline = performance.now() + 8_000;
      let expiresAt: number | undefined;
      const current = () => {
        const now = this.pages.live.get(pageId);
        if (
          performance.now() >= localDeadline ||
          (expiresAt !== undefined && Date.now() >= expiresAt) ||
          now !== lp ||
          now.target.controller !== "human" ||
          now.target.controllerEpoch !== original.controllerEpoch ||
          now.target.documentEpoch !== original.documentEpoch ||
          now.target.sessionId !== original.sessionId ||
          now.target.url !== original.url ||
          JSON.stringify(now.target.agentIsolation) !== JSON.stringify(original.agentIsolation) ||
          ["detached", "crashed"].includes(now.target.viewStatus ?? "")
        )
          throw new AuxError("ref_stale", "The selected page changed. Refresh before returning control.");
      };
      const native = this.pages.deps.native;
      if (!native.egressResumePerson || !native.egressContext)
        throw new AuxError("permission_denied", "Native Return control verification is unavailable.");
      if (!nativePersonResume)
        throw new AuxError("permission_denied", "Return control through the Aux browser interface.");
      current();
      const reply = await native.egressResumePerson({ pageId, ticketId: nativePersonResume });
      expiresAt = reply.expiresAt;
      current();
      const context = EgressContextSchema.parse(reply.context);
      const isolation = original.agentIsolation;
      if (
        reply.accepted !== true ||
        context.personControlled ||
        context.tabId !== pageId ||
        !isolation ||
        context.isolation?.isolationId !== isolation.isolationId ||
        context.isolation.runId !== isolation.runId ||
        context.isolation.taskId !== isolation.taskId ||
        context.isolation.taskRevision !== isolation.taskRevision ||
        context.profileId !== this.pages.deps.profileId
      )
        throw new AuxError("ref_stale", "The original person-held task is no longer available.");
      const confirmed = EgressContextSchema.parse(
        await native.egressContext({ tabId: pageId, expectedUrl: original.url }),
      );
      current();
      if (JSON.stringify(confirmed) !== JSON.stringify(context))
        throw new AuxError("ref_stale", "The native page changed before Return control completed.");
    }
    lp.target.controller = "none";
    lp.target.controllerEpoch++;
    this.pages.persist(lp);
    this.pages.deps.events.emit(EventTypes.PageTakeover, { pageId, controller: "none" });
    return lp.target;
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
