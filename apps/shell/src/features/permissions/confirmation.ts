import type { Suspension } from "@aux/contracts";
import type { TrustConfirmation } from "../trust/confirmation";
/** Restore only the exact context persisted by the runtime's original effect producer. */
export function confirmationFromSuspension(value: Suspension): TrustConfirmation | null {
  const context = value.request.context;
  if (
    value.state !== "pending" ||
    value.turnId !== value.runId ||
    !context ||
    value.kind === "ask-user-question" ||
    (value.kind !== "handoff" && !value.request.approvalId)
  )
    return null;
  return {
    approvalId: value.request.approvalId,
    turnId: value.turnId,
    threadId: value.threadId,
    instruction: value.request.instruction,
    action: context.action,
    origin: context.site ?? "",
    site: context.site ?? "",
    category: context.category,
    policyCategory: context.policyCategory,
    kind: value.kind === "touch-id" ? "touch-id" : value.kind === "handoff" ? "handoff" : "approval",
    confirmation: value.kind === "handoff" ? "handoff" : "action",
    ...(context.pageId ? { pageId: context.pageId } : {}),
    ...(context.amount !== undefined ? { amount: context.amount } : {}),
  };
}
