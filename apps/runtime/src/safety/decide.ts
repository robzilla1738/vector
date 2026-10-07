import { AuxError, TaskReadProvenanceSchema, type ValidatedTaskRead } from "@aux/contracts";
/**
 * One effect decision function (S3/D4): every actor's consequential call flows
 * through `decide`, which composes managed restrictions, mode/category/site
 * policy, device authentication and exceptional single-use approvals —
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
import { classifyStep, isConsequential } from "../agent/permissions.js";
import { ApprovalStore } from "./approval.js";
import { agentPolicyCategoryFor, policyForCategories, type AgentPolicySettings } from "@aux/contracts";
import { exactOrigin, type OriginPolicyAudit } from "./origin-policy.js";

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
  | "task_resource"
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
  constructor(private readonly db: DatabaseSync) {}

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
  agentPolicy: (runId?: string) => AgentPolicySettings;
  audit: (decision: OriginPolicyAudit | Record<string, unknown>) => void;
  now?: () => number;
}

export interface DecideContext {
  trustedUserAction?: boolean;
  runId?: string;
  policyCategories?: import("@aux/contracts").AgentPolicyCategory[];
  reviewedChanges?: import("@aux/contracts").SafetyAction["reviewedChanges"];
  reviewedActions?: import("@aux/contracts").SafetyAction["reviewedActions"];
  taskRead?: ValidatedTaskRead;
  phase: "preflight" | "dispatch";
  sessionId?: string;
  approvalId?: string;
  review?: FinalReviewArtifact;
  turnToolCallCount?: number;
  sensitiveData?: boolean;
  restrictedRetry?: boolean;
  /** Headless callers retain the same durable suspension as interactive runs. */
  headless?: boolean;
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
  credentialTarget?: EffectRequest["credentialTarget"];
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
    ...(input.step.op === "fillCredential" && input.credentialTarget
      ? { credentialTarget: input.credentialTarget }
      : {}),
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
    runId: request.runId,
    turnId: request.turnId,
    threadId: request.threadId,
    requestedAt: request.requestedAt,
    ...(request.amount !== undefined ? { amount: request.amount } : {}),
    ...(request.credentialTarget ? { credentialTarget: request.credentialTarget } : {}),
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
        kind: "approval" | "action-confirmation" | "touch-id" | "handoff" | "ask-user-question";
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

/** Shared mode policy leads; a fresh decision is made at the actual dispatch boundary. */
export async function decide(
  request: EffectRequest,
  deps: DecideDeps,
  context: DecideContext,
): Promise<Decision> {
  const at = deps.now?.() ?? Date.now();
  const parsed = EffectRequestSchema.parse(request);
  const exact = parsed.origin ? exactOrigin(parsed.origin) : null;
  if (parsed.origin && !exact)
    return deny(
      deps.journal,
      parsed,
      REFUSAL.untrustedOrigin,
      "origin_resolver",
      "This action has no trustworthy HTTP(S) origin.",
      at,
    );
  if (parsed.category === "evaluate" && context.trustedEval !== true)
    return deny(
      deps.journal,
      parsed,
      REFUSAL.evaluateUnreachable,
      "origin_resolver",
      "Page JavaScript is not available to agent callers.",
      at,
    );
  if (
    parsed.actor !== "user" &&
    /^(settings\.|safety\.(?:policies|grants)|agent\.policy)/.test(parsed.action)
  )
    return deny(
      deps.journal,
      parsed,
      REFUSAL.authorizationDenied,
      "managed_policy",
      "Agent permissions must be changed in Aux Settings.",
      at,
    );
  const managed = exact ? deps.managedRules().filter((rule) => exactOrigin(rule.origin) === exact) : [];
  if (managed.some((rule) => rule.access === "deny" || rule.effects?.[parsed.effect] === "deny"))
    return deny(deps.journal, parsed, REFUSAL.originPolicyDenied, "managed_policy", DENIED_GUIDANCE, at);
  if (parsed.category === "evaluate")
    return allow(
      deps.journal,
      parsed,
      { authorizedBy: "policy", policySource: "managed" },
      "trusted_source",
      at,
    );

  const runId = context.runId;
  const settings = deps.approvals.effectivePolicy(deps.agentPolicy(runId), runId);
  const category = parsed.dataClasses.includes("credential")
    ? "credentials"
    : agentPolicyCategoryFor(parsed.category, parsed.action);
  const modePolicy = policyForCategories({
    mode: settings.agentMode,
    categories: context.policyCategories ?? [category],
    site: exact ?? undefined,
    amount: parsed.amount,
    overrides: settings.agentPolicies,
  });
  const source = modePolicy.source === "user" ? "user_rule" : "default";
  if (modePolicy.disposition === "block")
    return deny(deps.journal, parsed, REFUSAL.authorizationDenied, source, DENIED_GUIDANCE, at);
  if (modePolicy.disposition === "handoff" || managed.some((rule) => rule.confirmation === "handoff"))
    return ask(
      deps.journal,
      parsed,
      {
        kind: "handoff",
        instruction: "Complete this action directly in the site, then return to Aux.",
        guidance: ASK_GUIDANCE,
      },
      source,
      at,
    );
  const trustedUserAction =
    context.trustedUserAction === true &&
    parsed.actor === "user" &&
    (context.policyCategories ?? [category]).every(
      (value) => value === "file_write" || value === "file_delete",
    );
  const action = SafetyActionSchema.parse({
    ...actionFor(parsed, exact ?? undefined),
    runId,
    runAuthorityRevision: deps.approvals.runAuthorityRevision(runId),
    policyCategories: context.policyCategories,
    reviewedChanges: context.reviewedChanges,
    reviewedActions: context.reviewedActions,
    policyRevision: settings.agentPolicyRevision,
    category: category === "credentials" ? "credential" : parsed.category,
    confirmation: modePolicy.disposition === "allow" || trustedUserAction ? "none" : "action",
    ...(modePolicy.disposition === "touch_id" ? { authentication: "touch_id" } : {}),
  });
  const approvalId = context.approvalId ?? deps.approvals.acceptedFor(action, "turn", at);
  const authorization = deps.approvals.authorize({
    action,
    settings,
    trustedUserAction,
    approvalId,
    consume: context.phase === "dispatch",
    now: at,
  });
  if (authorization.status === "denied")
    return deny(deps.journal, parsed, REFUSAL.authorizationDenied, source, authorization.guidance, at);
  if (authorization.status === "handoff")
    return ask(
      deps.journal,
      parsed,
      { kind: "handoff", instruction: authorization.guidance, guidance: ASK_GUIDANCE },
      source,
      at,
    );
  if (authorization.status === "ask" || authorization.status === "touch_id") {
    const pendingId = deps.approvals.issue(action, "turn", at);
    return ask(
      deps.journal,
      parsed,
      {
        kind: authorization.status === "touch_id" ? "touch-id" : "approval",
        approvalId: pendingId,
        instruction:
          authorization.status === "touch_id"
            ? authorization.guidance
            : action.reviewedChanges?.length
              ? "Review these file changes before Aux continues."
              : (action.reviewedActions?.length ?? 0) > 1
                ? "Review these actions before Aux continues."
                : "Review this action before Aux continues.",
        guidance: ASK_GUIDANCE,
      },
      "approval",
      at,
    );
  }
  context.taskRead?.check();
  if (context.taskRead && parsed.effect === "read" && category === "read") {
    const provenance = TaskReadProvenanceSchema.parse(context.taskRead.provenance);
    if (action.scope.kind !== "task" || action.scope.id !== provenance.taskId)
      throw new AuxError("permission_denied", "The read action belongs to another task source.");
    return allow(deps.journal, parsed, provenance, "task_resource", at);
  }
  return allow(
    deps.journal,
    parsed,
    authorization.provenance,
    sourceForProvenance(authorization.provenance),
    at,
  );
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
