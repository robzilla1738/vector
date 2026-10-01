import { isConsequential } from "../agent/permissions.js";
import { ConfirmationRequestSchema, type ConfirmationRequest, type ConfirmationLevel, type EffectCategory, type EffectRequest } from "@aux/contracts";


/** Immutable consequence floor. Site rules can tighten this table, never loosen it. */
export const CONFIRMATION_TIERS = Object.freeze({
  password_change: "handoff", two_factor: "handoff", captcha: "handoff", bot_block: "handoff", paywall_bypass: "handoff",
  delete: "action", purchase: "action", payment: "action", send: "action", post: "action", install: "action",
  external_tool: "action", credential: "action", submit: "action", account: "action", security: "action",
  login: "preapprovable", upload: "preapprovable", permission: "preapprovable",
  cookie: "none", download: "none", read: "none", navigate: "none", input: "none", evaluate: "none",
  interact: "action", dialog: "action",
} satisfies Record<EffectCategory, ConfirmationLevel>);
const TIER_RANK: Record<ConfirmationLevel, number> = { none: 0, preapprovable: 1, action: 2, handoff: 3 };
export function stricterConfirmation(a: ConfirmationLevel, b: ConfirmationLevel): ConfirmationLevel {
  return TIER_RANK[a] >= TIER_RANK[b] ? a : b;
}
export function confirmationTierFor(request: Pick<EffectRequest, "category" | "effect" | "dataClasses"> & { recipient?: string; action?: string }): ConfirmationLevel {
  const tier = CONFIRMATION_TIERS[request.category];
  const operation = request.action?.split(".").at(-1)?.replace(/[-_]/g, "").toLowerCase();
  if (operation && ["passwordchange", "twofactor", "captcha", "botblock", "paywallbypass"].includes(operation)) return "handoff";
  if (tier === "handoff") return tier;
  if (operation && ["delete", "remove", "purchase", "payment", "pay", "send", "sendmessage", "post", "install"].includes(operation)) return "action";
  // Semantic login, cookie and permission categories come from the observed target,
  // but cannot override a different operation such as sending or deleting.
  if (request.action && isConsequential(request.action.split(".").at(-1) ?? request.action) && (request.category === "read" || request.category === "evaluate")) return "action";
  if (request.recipient) return "action";
  if (request.effect === "destructive" || request.dataClasses.some(value => value === "sensitive" || value === "credential" || value === "payment")) return "action";
  return tier;
}
export function preapprovableCategory(category: string | undefined): boolean {
  return category === "login" || category === "upload" || category === "permission";
}

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
