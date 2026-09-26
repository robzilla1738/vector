import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_safety_approvals_pending(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Approval requests are available in Aux.");
  return approvals.pending(params.threadId);
}
async function h_safety_approvals_decide(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params, s, suspensions } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Only the Aux interface can decide an approval.");
  approvals.decideLocal(params.decision, params.expectedTurnId);
  const approved = params.decision.decision === "accept" || params.decision.decision === "acceptForSession";
  const resolved = suspensions.resolveByApprovalId(
    params.decision.approvalId,
    approved ? "answered" : "cancelled",
  );
  // The parked run waits on an answer — wake it with the decision so the
  // planner sees consent (retries through decide() and is authorized) or
  // refusal (chooses a different action) instead of a silent timeout.
  if (resolved) {
    try {
      s.runs.coordinator.answer(
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
  return { revoked: approvals.revoke(params) };
}

export const safetyMethods: Partial<Record<MethodName, MethodHandler>> = {
  "safety.approvals.pending": h_safety_approvals_pending,
  "safety.approvals.decide": h_safety_approvals_decide,
  "safety.grants.list": h_safety_grants_list,
  "safety.grants.revoke": h_safety_grants_revoke,
};
