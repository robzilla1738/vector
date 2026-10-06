/**
 * Refusal registry (S3): every deny decision names a stable refusalId whose
 * text is written for the model — what didn't happen, why, the no-retry
 * condition, what to do instead, and when retrying becomes OK.
 */
import { z } from "zod";

export const RefusalIdSchema = z.enum([
  "untrusted_origin",
  "origin_policy_denied",
  "authorization_denied",
  "guardian_denied",
  "headless_no_ui",
  "suspension_cancelled",
  "evaluate_unreachable",
]);
export type RefusalId = z.infer<typeof RefusalIdSchema>;

export const RefusalDefinitionSchema = z
  .object({
    refusalId: RefusalIdSchema,
    /** What did not happen. */
    outcome: z.string().trim().min(1).max(400),
    /** Why it was refused. */
    reason: z.string().trim().min(1).max(400),
    /** The condition under which retrying is pointless. */
    noRetryUntil: z.string().trim().min(1).max(400),
    /** What to do instead. */
    instead: z.string().trim().min(1).max(400),
    /** When retrying becomes acceptable. */
    retryWhen: z.string().trim().min(1).max(400),
  })
  .strict();
export type RefusalDefinition = z.infer<typeof RefusalDefinitionSchema>;

export const REFUSAL_REGISTRY = {
  untrusted_origin: {
    refusalId: "untrusted_origin",
    outcome: "No action was dispatched to the page.",
    reason: "The destination is not a trustworthy http(s) origin.",
    noRetryUntil: "Do not retry against this destination; it cannot be made trustworthy.",
    instead: "Navigate to the site's real https origin, then retry the action.",
    retryWhen: "Retry only after the page is on an exact https origin.",
  },
  origin_policy_denied: {
    refusalId: "origin_policy_denied",
    outcome: "No action was dispatched to the page.",
    reason: "An origin policy rule denies this effect on this origin.",
    noRetryUntil: "Do not retry while the denying rule stands.",
    instead: "Ask the user to change the rule, or choose a permitted action.",
    retryWhen: "Retry only after the user changes the origin policy.",
  },
  authorization_denied: {
    refusalId: "authorization_denied",
    outcome: "No action was dispatched to the page.",
    reason: "No standing grant or single-use approval authorizes this action.",
    noRetryUntil: "Do not retry while this action is denied.",
    instead: "Ask the user to approve the action or choose a permitted action.",
    retryWhen: "Retry only after the user grants authorization.",
  },
  guardian_denied: {
    refusalId: "guardian_denied",
    outcome: "No action was dispatched to the page.",
    reason: "The guardian review judged this action unsafe for the current context.",
    noRetryUntil: "Do not retry the same action against the same context.",
    instead: "Choose a different action that does not carry the flagged risk.",
    retryWhen: "Retry only with a materially different action or context.",
  },
  headless_no_ui: {
    refusalId: "headless_no_ui",
    outcome: "No action was dispatched to the page.",
    reason: "The action needs confirmation but no interface is attached to answer it.",
    noRetryUntil: "Do not retry actions that need confirmation in this session.",
    instead: "Choose an action that does not need confirmation, or run with a UI attached.",
    retryWhen: "Retry only when a user interface is attached.",
  },
  suspension_cancelled: {
    refusalId: "suspension_cancelled",
    outcome: "No action was dispatched to the page.",
    reason: "The pending confirmation was cancelled before it was answered.",
    noRetryUntil: "Do not retry the cancelled suspension.",
    instead: "Start a new turn if the action is still wanted.",
    retryWhen: "Retry only as a fresh action the user can confirm again.",
  },
  evaluate_unreachable: {
    refusalId: "evaluate_unreachable",
    outcome: "No page script ran.",
    reason: "Page JavaScript evaluation is never reachable by model or MCP callers.",
    noRetryUntil: "Do not retry evaluate steps; no approval can unlock them.",
    instead: "Use the page, extraction, and operation tools instead of page script.",
    retryWhen: "This surface never becomes available; only trusted runtime code evaluates.",
  },
} as const satisfies Record<RefusalId, RefusalDefinition>;

/** Compose refusal guidance for the model from the registry entry. */
export function refusalGuidance(refusalId: RefusalId, detail?: string): string {
  const def = REFUSAL_REGISTRY[refusalId];
  const parts: string[] = [def.outcome, def.reason];
  if (detail) parts.push(detail);
  parts.push(def.noRetryUntil, def.instead, def.retryWhen);
  return parts.join(" ");
}
