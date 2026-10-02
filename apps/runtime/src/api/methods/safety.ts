import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { resumeSkillApproval } from "../../services/skill-continuation.js";

async function h_safety_approvals_pending(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Approval requests are available in Aux.");
  return approvals.pending(params.threadId);
}
async function h_safety_approvals_decide(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params, s, suspensions } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Only the Aux interface can decide an approval.");
  const parked = suspensions.pendingAll().find(item => item.request.approvalId === params.decision.approvalId);
  if (parked && s.repo.getRun(parked.runId)?.config?.nightShiftItemId)
    throw new AuxError("permission_denied", "Apply this overnight result before deciding its foreground approval.");
  const action = approvals.decideLocal(params.decision, params.expectedTurnId);
  const approved = params.decision.decision === "accept" || params.decision.decision === "acceptForSession" || params.decision.decision === "acceptForOrigin";
  const resolved = suspensions.resolveByApprovalId(
    params.decision.approvalId,
    approved ? "answered" : "cancelled",
  );
  // The parked run waits on an answer — wake it with the decision so the
  // planner sees consent (retries through decide() and is authorized) or
  // refusal (chooses a different action) instead of a silent timeout.
  if (resolved) {
    try {
      if (action.action === "browser.request") {
        // The native request is already waiting. Do not queue an answer that
        // could accidentally answer the run's next unrelated user question.
        if (s.repo.getRun(resolved.runId)?.status === "needs_input")
          await s.runs.coordinator.setStatus(resolved.runId, "running", approved ? "Browser request approved" : "Browser request declined");
      } else if (await resumeSkillApproval({ repo: s.repo, pages: s.pages, events: s.events }, resolved.runId, params.decision.approvalId, approved)) {
        // Continue only the pending reviewed step through its actual safety gate.
      } else await s.runs.coordinator.answer(
        resolved.runId,
        approved
          ? "The user approved the requested action."
          : "The user declined the requested action. Do not retry it; choose a different action.",
      );
    } catch {
      /* the run ended between park and decision */
    }
  }
  return { ok: true };
}
async function h_safety_grants_list(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Safety grants are managed in Aux.");
  return approvals.listGrants(params.profileId);
}
async function h_safety_grants_revoke(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Safety grants are managed in Aux.");
  const grants = approvals.listGrants(params.profileId).filter(grant =>
    (!params.scope || grant.scope.kind === params.scope.kind && grant.scope.id === params.scope.id) &&
    (!params.effect || grant.effect === params.effect) && (!params.grantId || grant.grantId === params.grantId));
  const revoked = approvals.revoke(params);
  await ctx.s.safetyAuthority.grants(grants);
  return { revoked };
}

export const safetyMethods: Partial<Record<MethodName, MethodHandler>> = {
  "safety.approvals.pending": h_safety_approvals_pending,
  "safety.approvals.decide": h_safety_approvals_decide,
  "safety.grants.list": h_safety_grants_list,
  "safety.grants.revoke": h_safety_grants_revoke,
};
