import { safetyActivity } from "./safety-activity.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { resumeApproval } from "../../services/approval-continuation.js";
import { withRunAuthorityMutation } from "../../services/overnight-authority.js";

async function h_safety_decisions_list(ctx: MethodCtx): Promise<unknown> {
  return safetyActivity(ctx);
}
async function h_safety_approvals_pending(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Approval requests are available in Aux.");
  return approvals.pending(params.threadId);
}
async function h_safety_approvals_decide(ctx: MethodCtx): Promise<unknown> {
  const { approvals, client, params, s, suspensions } = ctx;
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Only the Aux interface can decide an approval.");
  const action = params.decision.decision === "acceptForOrigin"
    ? await withRunAuthorityMutation(s.repo, () => Promise.resolve(approvals.decideLocal(params.decision, params.expectedTurnId)))
    : approvals.decideLocal(params.decision, params.expectedTurnId);
  const approved =
    params.decision.decision === "accept" ||
    params.decision.decision === "acceptForOrigin";
  await resumeApproval({ repo: s.repo, pages: s.pages, events: s.events, runs: s.runs, suspensions }, action, params.decision.approvalId, approved);
  return { ok: true };
}
export const safetyMethods: Partial<Record<MethodName, MethodHandler>> = {
  "safety.decisions.list": h_safety_decisions_list,
  "safety.approvals.pending": h_safety_approvals_pending,
  "safety.approvals.decide": h_safety_approvals_decide,
};
