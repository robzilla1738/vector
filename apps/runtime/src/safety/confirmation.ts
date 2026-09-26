import { ConfirmationRequestSchema, type ConfirmationRequest } from "@aux/contracts";

export type ConfirmationResult =
  | { status: "not_required" }
  | { status: "requires_handoff"; instruction: string }
  | { status: "requires_approval"; review: NonNullable<ConfirmationRequest["review"]> }
  | { status: "invalid"; reason: string };

/** Filling sensitive data is an action-time transmission, even before form submission. */
export function confirmationLevelForAction(input: {
  policyLevel: ConfirmationRequest["level"];
  sensitiveData?: boolean;
  captchaOrBotBlock?: boolean;
}): ConfirmationRequest["level"] {
  if (input.captchaOrBotBlock) return "handoff";
  if (input.policyLevel === "handoff") return "handoff";
  if (input.sensitiveData) return "action";
  return input.policyLevel;
}

/** Final confirmation is a terminal, single-tool-call turn with a reviewable artifact. */
export function decideConfirmation(raw: unknown): ConfirmationResult {
  const parsed = ConfirmationRequestSchema.safeParse(raw);
  if (!parsed.success) return { status: "invalid", reason: "invalid_confirmation_request" };
  const request = parsed.data;
  if (request.level === "none") return { status: "not_required" };
  if (request.level === "handoff") return { status: "requires_handoff", instruction: "Complete this action directly in the site, then return to Aux." };
  if (!request.review || request.review.turnId !== request.action.turnId || request.review.action !== request.action.action
    || request.review.effect !== request.action.effect || request.review.invocationDigest !== request.action.invocationDigest)
    return { status: "invalid", reason: "missing_or_mismatched_review_artifact" };
  if (request.level === "action" && request.turnToolCallCount !== 1) return { status: "invalid", reason: "final_confirmation_must_be_sole_tool_call" };
  if (request.level === "preapprovable" && request.turnToolCallCount > 1) return { status: "invalid", reason: "confirmation_must_be_sole_tool_call" };
  return { status: "requires_approval", review: request.review };
}
