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
  const action = ["acceptForOrigin", "acceptGlobally", "acceptForRun"].includes(params.decision.decision)
    ? await withRunAuthorityMutation(s.repo, () =>
        Promise.resolve(approvals.decideLocal(params.decision, params.expectedTurnId)),
      )
    : approvals.decideLocal(params.decision, params.expectedTurnId);
  const approved =
    params.decision.decision === "accept" ||
    ["acceptForOrigin", "acceptForRun", "acceptGlobally"].includes(params.decision.decision);
  await resumeApproval(
    { repo: s.repo, pages: s.pages, events: s.events, runs: s.runs, suspensions },
    action,
    params.decision.approvalId,
    approved,
  );
  return { ok: true };
}
async function h_safety_grants_revokeRun(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Run permissions are managed through Aux.");
  const runId = ctx.params.runId;
  ctx.s.runs.coordinator.get(runId);
  const pending = ctx.suspensions.pending(runId);
  if (pending && ["approval", "touch-id"].includes(pending.kind) && pending.request.approvalId) {
    ctx.approvals.retireTurn(pending.turnId, pending.threadId);
    ctx.suspensions.resolveByApprovalId(pending.request.approvalId, "cancelled");
    await ctx.s.runs.coordinator.answer(
      runId,
      "The user reset this run’s permissions. Recheck authorization before continuing.",
    );
  } else ctx.approvals.revokeRunGrants(runId);
  return { ok: true };
}
export const safetyMethods: Partial<Record<MethodName, MethodHandler>> = {
  "safety.grants.revokeRun": h_safety_grants_revokeRun,
  "safety.decisions.list": h_safety_decisions_list,
  "safety.approvals.pending": h_safety_approvals_pending,
  "safety.approvals.decide": h_safety_approvals_decide,
};
