import { AuxError, TaskReadProvenanceSchema, type ValidatedTaskRead } from "@aux/contracts";
/**
 * One effect decision function (S3/D4): every actor's consequential call flows
 * through `decide`, which composes managed policy, user rules, the origin
 * resolver, standing grants, single-use approvals and the guardian judge —
 * returning a typed Decision instead of throwing. The dispatch gate adapts
 * non-allow decisions to the existing AuxError contract at the boundary.
 */
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import {
  type AuthorizationProvenance,
  type Decision,
  type EffectCategory,
  EffectRequestSchema,
  type EffectRequest,
  type FinalReviewArtifact,
  type OriginRule,
  SafetyActionSchema,
  type SafetyAction,
  type Step,
} from "@aux/contracts";
import { observedCategory, type ObservedActionTarget } from "./observed-target.js";
import {
  classifyStep,
  grantAllows,
  isConsequential,
  parseGrant,
  resolveGrants,
  type EffectClass,
  type GrantInput,
} from "../agent/permissions.js";
import { ApprovalStore, type LocalCeiling } from "./approval.js";
import {
  confirmationLevelForAction,
  confirmationTierFor,
  stricterConfirmation,
  decideConfirmation,
} from "./confirmation.js";
import { reviewGuardian, type GuardianJudge, type UntrustedOutput } from "./guardian.js";
import {
  evaluateOriginPolicy,
  exactOrigin,
  type OriginPolicyAudit,
  type OriginPolicyDecision,
} from "./origin-policy.js";

/** Refusal ids are registered in packages/contracts/src/refusals.ts. */
export const REFUSAL = {
  untrustedOrigin: "untrusted_origin",
  originPolicyDenied: "origin_policy_denied",
  authorizationDenied: "authorization_denied",
  guardianDenied: "guardian_denied",
  evaluateUnreachable: "evaluate_unreachable",
} as const;

export type DecisionSource =
  | "managed_policy"
  | "user_rule"
  | "origin_resolver"
  | "standing_grant"
  | "approval"
  | "guardian"
  | "trusted_source"
  | "default";

export interface DecisionRecord {
  decisionId: string;
  request: EffectRequest;
  decision: Decision;
  source: DecisionSource;
  at: number;
}

/** Durable audit of every decision. One row per decide() call. */
export class DecisionJournal {
  constructor(private readonly db: DatabaseSync) {
    db.exec(`CREATE TABLE IF NOT EXISTS safety_decisions(
      decision_id TEXT PRIMARY KEY, at INTEGER NOT NULL,
      profile_id TEXT NOT NULL, scope_kind TEXT NOT NULL, scope_id TEXT NOT NULL,
      actor TEXT NOT NULL, effect TEXT NOT NULL, category TEXT NOT NULL, action TEXT NOT NULL,
      origin TEXT, destination TEXT, status TEXT NOT NULL, source TEXT NOT NULL,
      authorized_by TEXT, refusal_id TEXT, suspension_kind TEXT, request_json TEXT NOT NULL, decision_json TEXT NOT NULL);
      CREATE INDEX IF NOT EXISTS idx_safety_decisions_run ON safety_decisions(profile_id, action, at);`);
  }

  record(
    request: EffectRequest,
    decision: Decision,
    source: DecisionSource,
    at = Date.now(),
  ): DecisionRecord {
    const record: DecisionRecord = { decisionId: randomUUID(), request, decision, source, at };
    this.db
      .prepare(
        `INSERT INTO safety_decisions(
      decision_id,at,profile_id,scope_kind,scope_id,actor,effect,category,action,origin,destination,
      status,source,authorized_by,refusal_id,suspension_kind,request_json,decision_json)
      VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      )
      .run(
        record.decisionId,
        at,
        request.profileId,
        request.scope.kind,
        request.scope.id,
        request.actor,
        request.effect,
        request.category,
        request.action,
        request.origin ?? null,
        request.destination ?? null,
        decision.status,
        source,
        decision.status === "allow" ? decision.authorizedBy.authorizedBy : null,
        decision.status === "deny" ? decision.refusalId : null,
        decision.status === "ask" ? decision.suspension.kind : null,
        JSON.stringify(request),
        JSON.stringify(decision),
      );
    return record;
  }
}

export interface DecideDeps {
  approvals: ApprovalStore;
  journal: DecisionJournal;
  managedRules: () => readonly OriginRule[];
  userRules: () => readonly OriginRule[];
  localCeiling: (action: SafetyAction) => LocalCeiling;
  /** Session-level effect grants (settings.permission sheet) — standing grants by another name. */
  settingsGrants?: () => readonly GrantInput[];
  audit: (decision: OriginPolicyAudit | Record<string, unknown>) => void;
  judge?: GuardianJudge;
  now?: () => number;
}

export interface DecideContext {
  taskRead?: ValidatedTaskRead;
  phase: "preflight" | "dispatch";
  sessionId?: string;
  approvalId?: string;
  review?: FinalReviewArtifact;
  turnToolCallCount?: number;
  sensitiveData?: boolean;
  restrictedRetry?: boolean;
  untrusted?: readonly UntrustedOutput[];
  /** No UI is attached: any `ask` collapses to a deny-with-refusal. */
  headless?: boolean;
  /** Actual Night Shift producer: confirmation may use durable category grants only. */
  standingOnly?: boolean;
  /** The program came from a trusted source (runtime-authored). Only this
   * unlocks `evaluate` — model and MCP callers can never reach page JS. */
  trustedEval?: boolean;
}

/** Deterministic op → category mapping. Semantic subcategories assert at plan time; dispatch maps mechanically. */
export function categoryForOp(op: string): EffectCategory {
  switch (op) {
    case "navigate":
    case "back":
    case "forward":
    case "reload":
    case "stop":
      return "navigate";
    case "fill":
    case "type":
    case "select":
    case "check":
    case "uncheck":
      return "input";
    case "submit":
      return "submit";
    case "fillCredential":
      return "credential";
    case "evaluate":
      return "evaluate";
    case "upload":
      return "upload";
    case "expectDownload":
      return "download";
    case "dialog":
      return "dialog";
    case "click":
    case "dblclick":
    case "press":
    case "hover":
    case "scroll":
    case "dragTo":
    case "clickPoint":
      return "interact";
    default:
      return "read";
  }
}

const SENSITIVE_TARGET = /pass(?:word)?|token|secret|credit.?card|card.?number|\bssn\b/i;

export function sensitiveStep(step: Step): boolean {
  if (step.op === "fillCredential") return true;
  if (!("target" in step) || typeof step.target !== "string") return false;
  return SENSITIVE_TARGET.test(step.target);
}

/** Build the v2 request for a program step; the action payload is derived, never model-authored. */
export function effectRequestForStep(input: {
  step: Step;
  origin: string;
  profileId: string;
  scope: SafetyAction["scope"];
  turnId: string;
  threadId: string;
  runId?: string;
  actor?: EffectRequest["actor"];
  digest: string;
  observedTarget?: ObservedActionTarget;
  at?: number;
}): EffectRequest {
  const category = input.observedTarget
    ? (observedCategory(input.step, input.observedTarget) ?? categoryForOp(input.step.op))
    : categoryForOp(input.step.op);
  const dataClasses: EffectRequest["dataClasses"] = [];
  if (sensitiveStep(input.step)) dataClasses.push("sensitive");
  if (input.step.op === "fillCredential") dataClasses.push("credential");
  if (input.step.op === "upload") dataClasses.push("file");
  return EffectRequestSchema.parse({
    profileId: input.profileId,
    scope: input.scope,
    actor: input.actor ?? "builtin_agent",
    effect:
      input.step.op === "fillCredential" || category === "credential"
        ? "credential"
        : classifyStep(input.step.op),
    category,
    action: input.step.op,
    origin: input.origin,
    dataClasses,
    provenance: "page",
    invocationDigest: input.digest,
    turnId: input.turnId,
    threadId: input.threadId,
    ...(input.runId ? { runId: input.runId } : {}),
    requestedAt: input.at ?? Date.now(),
  });
}

export function actionFor(request: EffectRequest, normalizedOrigin?: string): SafetyAction {
  return SafetyActionSchema.parse({
    profileId: request.profileId,
    scope: request.scope,
    effect: request.effect,
    action: request.action,
    category: request.category,
    invocationDigest: request.invocationDigest,
    ...(normalizedOrigin ? { origin: `${normalizedOrigin}/` } : {}),
    ...(request.recipient ? { recipient: request.recipient } : {}),
    turnId: request.turnId,
    threadId: request.threadId,
    requestedAt: request.requestedAt,
  });
}

function deny(
  journal: DecisionJournal,
  request: EffectRequest,
  refusalId: string,
  source: DecisionSource,
  guidance: string,
  at: number,
): Decision {
  const decision: Decision = { status: "deny", refusalId, guidance };
  journal.record(request, decision, source, at);
  return decision;
}

function allow(
  journal: DecisionJournal,
  request: EffectRequest,
  authorizedBy: AuthorizationProvenance,
  source: DecisionSource,
  at: number,
): Decision {
  const decision: Decision = { status: "allow", authorizedBy };
  journal.record(request, decision, source, at);
  return decision;
}

function ask(
  journal: DecisionJournal,
  request: EffectRequest,
  suspension: Decision & { status: "ask" } extends never
    ? never
    : {
        kind: "approval" | "action-confirmation" | "handoff" | "ask-user-question";
        approvalId?: string;
        instruction: string;
        guidance: string;
      },
  source: DecisionSource,
  at: number,
): Decision {
  const decision: Decision = { status: "ask", suspension };
  journal.record(request, decision, source, at);
  return decision;
}

const DENIED_GUIDANCE =
  "Do not retry while this action is denied. Ask the user to change the permission or choose a permitted action.";
const ASK_GUIDANCE =
  "Pause this action and request approval from the user. Do not dispatch or retry while approval is pending.";

/**
 * Compose one decision. The order is fixed: managed policy and user rules
 * resolve through the origin policy (deny < ask < allow), standing grants and
 * single-use approvals authorize, and the guardian judges at dispatch.
 */
export async function decide(
  request: EffectRequest,
  deps: DecideDeps,
  context: DecideContext,
): Promise<Decision> {
  let at = deps.now?.() ?? Date.now();
  const parsed = EffectRequestSchema.parse(request);
  const finish = (decision: Decision): Decision => {
    if (context.headless && decision.status === "ask") {
      return deny(
        deps.journal,
        parsed,
        "headless_no_ui",
        "origin_resolver",
        "No interface is attached to answer this request. Choose an action that does not need confirmation.",
        at,
      );
    }
    return decision;
  };

  const exact = parsed.origin ? exactOrigin(parsed.origin) : null;
  if (parsed.origin && !exact) {
    return finish(
      deny(
        deps.journal,
        parsed,
        REFUSAL.untrustedOrigin,
        "origin_resolver",
        "This action has no trustworthy http(s) origin.",
        at,
      ),
    );
  }
  let action = actionFor(parsed, exact ?? undefined);

  // Recipient-scoped effects (external tools addressed to a service, not a page
  // origin) bypass origin rules and always confirm.
  const recipientPolicy: OriginPolicyDecision = {
    access: "ask",
    confirmation: "action",
    approvalLifetime: "turn",
    grantLifetime: "session",
    source: "default",
    reason: "recipient_scoped",
    origin: "recipient",
    effect: parsed.effect,
  };
  const evaluate = () =>
    exact
      ? evaluateOriginPolicy({
          url: `${exact}/`,
          effect: parsed.effect,
          action: parsed.action,
          managed: deps.managedRules(),
          user: deps.userRules(),
          audit: deps.audit,
          now: at,
        })
      : recipientPolicy;
  let suppliedApprovalId = context.standingOnly ? undefined : context.approvalId;
  const authorize = (
    policy: OriginPolicyDecision,
    consume: boolean,
    requiresApproval: boolean,
    approvalOnly: boolean,
  ) => {
    const result = deps.approvals.authorize({
      action,
      policy,
      // A permissive local ceiling never substitutes for action-time consent.
      ceiling: requiresApproval && deps.localCeiling(action) === "always" ? "ask" : deps.localCeiling(action),
      approvalOnly,
      standingOnly: context.standingOnly,
      sessionId: context.sessionId,
      approvalId: suppliedApprovalId,
      consume,
      now: at,
    });
    if (
      result.status === "ask" &&
      context.taskRead &&
      parsed.effect === "read" &&
      parsed.category === "read" &&
      action.confirmation === "none" &&
      !requiresApproval &&
      !approvalOnly &&
      policy.access === "allow" &&
      deps.localCeiling(action) !== "never"
    ) {
      const source = TaskReadProvenanceSchema.parse(context.taskRead.provenance);
      if (action.scope.kind !== "task" || action.scope.id !== source.taskId)
        throw new AuxError("permission_denied", "The read action belongs to another task source.");
      context.taskRead.check();
      return { status: "authorized" as const, provenance: source };
    }
    // Session-level effect grants are standing consent: they authorize only
    // what ApprovalStore could not, and never substitute for action-time
    // confirmation (approvalOnly stays exclusive to review artifacts).
    if (
      result.status === "ask" &&
      !context.standingOnly &&
      !requiresApproval &&
      !approvalOnly &&
      exact &&
      deps.settingsGrants
    ) {
      const needed = ["read", "write", "destructive", "egress"].includes(parsed.effect)
        ? (parsed.effect as EffectClass)
        : null;
      const granted =
        needed &&
        resolveGrants(deps.settingsGrants())
          .map(parseGrant)
          .some((grant) => grant != null && grantAllows(grant, needed, exact, at));
      if (granted)
        return {
          status: "authorized" as const,
          provenance: { authorizedBy: "standing" as const, grantId: `settings:${needed}` },
        };
    }
    return result;
  };
  const policySource = (policy: OriginPolicyDecision): DecisionSource =>
    policy.source === "managed" ? "managed_policy" : policy.source === "user" ? "user_rule" : "default";

  // Page JS is never reachable by model or MCP callers. Runtime-authored
  // programs (allowEval) still honor explicit deny rules before running.
  if (parsed.category === "evaluate") {
    if (context.trustedEval !== true) {
      return finish(
        deny(
          deps.journal,
          parsed,
          REFUSAL.evaluateUnreachable,
          "origin_resolver",
          "Page JavaScript is not available to agent callers. Use page, extraction, or operation tools instead.",
          at,
        ),
      );
    }
    const evalPolicy = evaluate();
    // Only an explicit rule stops trusted runtime eval — the unruled default
    // deny exists for model callers, which never reach this branch.
    if (evalPolicy.reason === "explicit_deny") {
      return finish(
        deny(
          deps.journal,
          parsed,
          REFUSAL.originPolicyDenied,
          policySource(evalPolicy),
          "Origin policy denied this action. " + DENIED_GUIDANCE,
          at,
        ),
      );
    }
    return finish(
      allow(
        deps.journal,
        parsed,
        {
          authorizedBy: "policy",
          policySource:
            evalPolicy.source === "managed" ? "managed" : evalPolicy.source === "user" ? "user" : "default",
        },
        "trusted_source",
        at,
      ),
    );
  }

  const policy = evaluate();
  if (policy.access === "deny") {
    return finish(
      deny(
        deps.journal,
        parsed,
        REFUSAL.originPolicyDenied,
        policySource(policy),
        "Origin policy denied this action. " + DENIED_GUIDANCE,
        at,
      ),
    );
  }

  // With no matching rule the default is derived from the category; a matched
  // rule's confirmation level wins, escalated by sensitive data or handoff.
  const floor = confirmationTierFor(parsed);
  const policyLevel = policy.source === "default" ? floor : stricterConfirmation(floor, policy.confirmation);
  const level = confirmationLevelForAction({
    policyLevel,
    sensitiveData: context.sensitiveData || parsed.dataClasses.includes("sensitive"),
  });
  action = SafetyActionSchema.parse({ ...action, confirmation: level });
  if (level === "handoff") {
    return finish(
      ask(
        deps.journal,
        parsed,
        {
          kind: "handoff",
          instruction: "Complete this action directly in the site, then return to Aux.",
          guidance: ASK_GUIDANCE,
        },
        policySource(policy),
        at,
      ),
    );
  }

  // Direct programs resume only the exact saved acceptance. Policy and the
  // confirmation floor above remain authoritative; final dispatch consumes it.
  if (
    !suppliedApprovalId &&
    !context.headless &&
    !context.standingOnly &&
    context.turnToolCallCount === undefined
  ) {
    suppliedApprovalId = deps.approvals.acceptedFor(action, policy.approvalLifetime, at);
  }
  const requiresApproval = level === "action" || level === "preapprovable";
  if (
    requiresApproval &&
    !suppliedApprovalId &&
    !(level === "preapprovable" && authorize(policy, false, true, false).status === "authorized")
  ) {
    const confirmation = decideConfirmation({
      level,
      action,
      review: context.review,
      turnToolCallCount: context.turnToolCallCount ?? 0,
    });
    if (confirmation.status === "invalid") {
      // A direct page program has no model turn to attach a review artifact.
      // The person confirms it. The same action can then run once on that acceptance.
      if (context.turnToolCallCount === undefined) {
        if (!suppliedApprovalId) {
          const approvalId = deps.approvals.issue(action, policy.approvalLifetime, at);
          return finish(
            ask(
              deps.journal,
              parsed,
              {
                kind: "approval",
                approvalId,
                instruction: "Allow this action before it runs.",
                guidance: ASK_GUIDANCE,
              },
              "approval",
              at,
            ),
          );
        }
      } else {
        return finish(
          ask(
            deps.journal,
            parsed,
            {
              kind: "action-confirmation",
              instruction: `Produce a final confirmation turn with a review artifact (${confirmation.reason}).`,
              guidance:
                "End the turn after calling exactly one tool that carries a typed review artifact for this action.",
            },
            "default",
            at,
          ),
        );
      }
    }
  }

  const authorization = authorize(policy, false, requiresApproval, level === "action");
  if (authorization.status === "denied") {
    return finish(
      deny(
        deps.journal,
        parsed,
        REFUSAL.authorizationDenied,
        policySource(policy),
        authorization.guidance,
        at,
      ),
    );
  }
  if (authorization.status === "ask") {
    const approvalId = deps.approvals.issue(action, policy.approvalLifetime, at);
    return finish(
      ask(
        deps.journal,
        parsed,
        {
          kind: "approval",
          approvalId,
          instruction: authorization.guidance,
          guidance: ASK_GUIDANCE,
        },
        "approval",
        at,
      ),
    );
  }
  if (context.phase === "preflight") {
    return finish(
      allow(
        deps.journal,
        parsed,
        authorization.provenance,
        sourceForProvenance(authorization.provenance),
        at,
      ),
    );
  }

  // The judge sees only typed, bounded untrusted envelopes; it cannot change policy or provenance.
  const review = await reviewGuardian({
    runId: parsed.runId,
    action,
    authorization: authorization.provenance.authorizedBy === "approval" ? "high" : "medium",
    restrictedRetry: context.restrictedRetry,
    untrusted: context.untrusted,
    judge: deps.judge,
  });
  deps.audit({
    kind: "guardian_decision",
    at,
    status: review.status,
    action: action.action,
    effect: action.effect,
    findings: review.findings.map((finding) => ({
      category: finding.category,
      severity: finding.severity,
      reason: finding.reason,
    })),
  });
  if (review.status === "deny") {
    return finish(deny(deps.journal, parsed, REFUSAL.guardianDenied, "guardian", review.guidance, at));
  }
  if (review.status === "authorization_required") {
    return finish(
      ask(
        deps.journal,
        parsed,
        {
          kind: "approval",
          instruction: review.guidance,
          guidance: ASK_GUIDANCE,
        },
        "guardian",
        at,
      ),
    );
  }

  // Policy and grants may have changed during the guardian await; decide again
  // at the dispatch boundary and consume the single-use approval only now.
  at = deps.now?.() ?? Date.now();
  const finalPolicy = evaluate();
  if (finalPolicy.access === "deny") {
    return finish(
      deny(
        deps.journal,
        parsed,
        REFUSAL.originPolicyDenied,
        policySource(finalPolicy),
        "Origin policy denied this action. " + DENIED_GUIDANCE,
        at,
      ),
    );
  }
  const finalLevel = confirmationLevelForAction({
    policyLevel:
      finalPolicy.source === "default" ? floor : stricterConfirmation(floor, finalPolicy.confirmation),
    sensitiveData: context.sensitiveData || parsed.dataClasses.includes("sensitive"),
  });
  action = SafetyActionSchema.parse({ ...action, confirmation: finalLevel });
  if (finalLevel === "handoff")
    return finish(
      ask(
        deps.journal,
        parsed,
        {
          kind: "handoff",
          instruction: "Complete this action directly in the site, then return to Aux.",
          guidance: ASK_GUIDANCE,
        },
        policySource(finalPolicy),
        at,
      ),
    );
  const final = authorize(finalPolicy, true, finalLevel !== "none", finalLevel === "action");
  if (final.status === "denied") {
    return finish(
      deny(deps.journal, parsed, REFUSAL.authorizationDenied, policySource(finalPolicy), final.guidance, at),
    );
  }
  if (final.status === "ask") {
    const approvalId = deps.approvals.issue(action, finalPolicy.approvalLifetime, at);
    return finish(
      ask(
        deps.journal,
        parsed,
        {
          kind: "approval",
          approvalId,
          instruction: final.guidance,
          guidance: ASK_GUIDANCE,
        },
        "approval",
        at,
      ),
    );
  }
  return finish(allow(deps.journal, parsed, final.provenance, sourceForProvenance(final.provenance), at));
}

function sourceForProvenance(provenance: AuthorizationProvenance): DecisionSource {
  if (provenance.authorizedBy === "standing") return "standing_grant";
  if (provenance.authorizedBy === "approval") return "approval";
  return "default";
}

/** Consequential ops still confirm at action time; reads and viewport moves are free. */
export function confirmsAtAction(op: string): boolean {
  return isConsequential(op);
}
