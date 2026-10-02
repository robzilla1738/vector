import { egressApprovalText, EffectRequestSchema, type Run } from "@aux/contracts";
import type { EventBus } from "../events.js";
import type { SuspensionStore } from "./suspensions.js";
import { decide, type DecideDeps } from "./decide.js";
import type { BrowserEgressDeps } from "./browser-egress.js";

/** Uses the existing native approval surface without persisting request bytes. */
export function browserEgressApproval(deps: {
  profileId: string;
  decide: DecideDeps;
  suspensions: SuspensionStore;
  events: EventBus;
  run(runId: string): Run | undefined;
  setStatus(runId: string, status: Run["status"], message: string): void | Promise<void>;
}): BrowserEgressDeps["approve"] {
  return async input => {
    if (input.signal.aborted || deps.suspensions.pending(input.runId)) return false;
    const request = EffectRequestSchema.parse({
      profileId: deps.profileId,
      scope: input.taskId ? { kind: "task", id: input.taskId } : { kind: "workspace", id: deps.run(input.runId)?.config?.contextWorkspaceId ?? "default" },
      actor: deps.run(input.runId)?.config?.implementation === "external-agent" ? "external_token" : "builtin_agent", effect: "egress", category: "send", action: "browser.request",
      origin: input.destinationOrigin, destination: input.destinationOrigin,
      recipient: input.destinationOrigin,
      dataClasses: [], provenance: "page", invocationDigest: input.digest,
      turnId: input.runId, threadId: input.threadId, runId: input.runId, requestedAt: Date.now(),
    });
    // Action-time approval is required even when a general egress rule allows
    // the origin. The digest binds this native request, its bytes and document.
    const decision = await decide(request, deps.decide, { phase: "dispatch", sensitiveData: true });
    if (decision.status !== "ask" || decision.suspension.kind !== "approval" || !decision.suspension.approvalId) return false;
    const approvalId = decision.suspension.approvalId;
    const cancelApproval = () => {
      try { deps.decide.approvals.decideLocal({ decision: "cancel", approvalId }, input.runId); }
      catch { /* Already answered, consumed, or expired; it cannot authorize a different digest. */ }
    };
    if (input.signal.aborted || deps.suspensions.pending(input.runId)) { cancelApproval(); return false; }
    const copy = egressApprovalText(input.sourceOrigin, input.destinationOrigin, input.pageContent);
    const suspension = deps.suspensions.park({
      runId: input.runId, turnId: input.runId, threadId: input.threadId, kind: "approval",
      request: { kind: "approval", approvalId, ...copy },
    });
    try {
      await deps.setStatus(input.runId, "needs_input", copy.instruction);
    } catch (error) {
      cancelApproval();
      if (deps.suspensions.pending(input.runId)?.suspensionId === suspension.suspensionId)
        deps.suspensions.resolve(suspension.suspensionId, "cancelled");
      throw error;
    }
    const currentRun = deps.run(input.runId);
    if (input.signal.aborted || !currentRun || !["running", "planning", "needs_input"].includes(currentRun.status)
      || deps.suspensions.pending(input.runId)?.suspensionId !== suspension.suspensionId) {
      cancelApproval();
      if (deps.suspensions.pending(input.runId)?.suspensionId === suspension.suspensionId) {
        deps.suspensions.resolve(suspension.suspensionId, "cancelled");
        if (currentRun?.status === "needs_input")
          await deps.setStatus(input.runId, "running", "The browser request expired without being sent.");
      }
      return false;
    }
    deps.events.emit("safety.confirmation", {
      approvalId, turnId: input.runId, threadId: input.threadId,
      instruction: copy.instruction, action: "browser.request", origin: input.destinationOrigin,
    }, input.runId);
    const accepted = await new Promise<boolean>(resolve => {
      let done = false;
      let unsubscribe = () => {};
      const finish = (value: boolean) => {
        if (done) return;
        done = true;
        unsubscribe();
        input.signal.removeEventListener("abort", cancelled);
        resolve(value);
      };
      const cancelled = () => finish(false);
      const check = () => {
        const run = deps.run(input.runId);
        if (!run || !["running", "planning", "needs_input"].includes(run.status)) { finish(false); return; }
        const pending = deps.suspensions.pending(input.runId);
        if (!pending) { finish(true); return; }
        if (pending.suspensionId !== suspension.suspensionId) finish(false);
      };
      unsubscribe = deps.events.subscribe(event => { if (event.runId === input.runId) check(); });
      input.signal.addEventListener("abort", cancelled, { once: true });
      if (input.signal.aborted) cancelled(); else check();
    });
    if (!accepted || input.signal.aborted) {
      cancelApproval();
      if (deps.suspensions.pending(input.runId)?.suspensionId === suspension.suspensionId) {
        deps.suspensions.resolve(suspension.suspensionId, "expired");
        if (deps.run(input.runId)?.status === "needs_input")
          await deps.setStatus(input.runId, "running", "The browser request expired without being sent.");
      }
      return false;
    }
    const approved = await decide(request, deps.decide, {
      phase: "dispatch", sensitiveData: true, approvalId,
    });
    return approved.status === "allow" && approved.authorizedBy.authorizedBy === "approval";
  };
}
