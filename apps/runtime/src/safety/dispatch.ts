import { createHash } from "node:crypto";
import { AuxError, SafetyActionSchema, type AuthorizationProvenance, type FinalReviewArtifact, type OriginRule, type SafetyAction, type Step } from "@aux/contracts";
import { classifyStep } from "../agent/permissions.js";
import { ApprovalStore, type LocalCeiling } from "./approval.js";
import { confirmationLevelForAction, decideConfirmation } from "./confirmation.js";
import { reviewGuardian, type GuardianJudge, type UntrustedOutput } from "./guardian.js";
import { evaluateOriginPolicy, exactOrigin, type OriginPolicyAudit } from "./origin-policy.js";

export interface StepSafetyContext {
  profileId: string;
  scope: SafetyAction["scope"];
  turnId: string;
  threadId: string;
  sessionId?: string;
  approvalId?: string;
  review?: FinalReviewArtifact;
  turnToolCallCount?: number;
  sensitiveData?: boolean;
  restrictedRetry?: boolean;
  untrusted?: readonly UntrustedOutput[];
}

export interface SafetyDispatchDeps {
  approvals: ApprovalStore;
  managedRules: () => readonly OriginRule[];
  userRules: () => readonly OriginRule[];
  localCeiling: (action: SafetyAction) => LocalCeiling;
  audit: (decision: OriginPolicyAudit | Record<string, unknown>) => void;
  judge?: GuardianJudge;
}

function sensitiveStep(step: Step): boolean {
  if (step.op === "fillCredential") return true;
  if (!("target" in step) || typeof step.target !== "string") return false;
  return /pass(?:word)?|token|secret|credit.?card|card.?number|\bssn\b/i.test(step.target);
}

/** One safety decision for preflight, then a fresh decision at the actual dispatch boundary. */
export class SafetyDispatchGate {
  constructor(private readonly deps: SafetyDispatchDeps) {}

  async check(input: {
    step: Step;
    origin: string;
    context: StepSafetyContext;
    phase: "preflight" | "dispatch";
  }): Promise<AuthorizationProvenance | undefined> {
    const classified = classifyStep(input.step.op);
    if (classified === "read") return undefined;
    const exact = exactOrigin(input.origin);
    if (!exact) throw new AuxError("permission_denied", "This action has no trustworthy http(s) origin.");
    const effect = input.step.op === "fillCredential" ? "credential" : classified;
    const action = SafetyActionSchema.parse({
      profileId: input.context.profileId,
      scope: input.context.scope,
      effect,
      action: input.step.op,
      invocationDigest: createHash("sha256").update(JSON.stringify(input.step)).digest("hex"),
      origin: `${exact}/`,
      turnId: input.context.turnId,
      threadId: input.context.threadId,
      requestedAt: Date.now(),
    });
    const evaluate = () => evaluateOriginPolicy({
      url: `${exact}/`, effect, action: input.step.op,
      managed: this.deps.managedRules(), user: this.deps.userRules(), audit: this.deps.audit,
    });
    const policy = evaluate();
    if (policy.access === "deny") throw new AuxError("permission_denied", "Origin policy denied this action.", { effect, origin: `${exact}/` });
    const level = confirmationLevelForAction({
      policyLevel: policy.confirmation,
      sensitiveData: input.context.sensitiveData || sensitiveStep(input.step),
    });
    if (level === "handoff") throw new AuxError("needs_input", "Complete this action directly in the site.");
    const requiresApproval = level === "action" || level === "preapprovable";
    if (requiresApproval) {
      const confirmation = decideConfirmation({
        level, action, review: input.context.review,
        turnToolCallCount: input.context.turnToolCallCount ?? 0,
      });
      if (confirmation.status === "invalid") throw new AuxError("needs_input", `A review artifact is required: ${confirmation.reason}`);
    }
    const authorize = (currentPolicy: typeof policy, consume: boolean) => {
      const localCeiling = this.deps.localCeiling(action);
      return this.deps.approvals.authorize({
        action, policy: currentPolicy,
        // A permissive local ceiling never substitutes for action-time consent.
        ceiling: requiresApproval && localCeiling === "always" ? "ask" : localCeiling,
        approvalOnly: level === "action",
        sessionId: input.context.sessionId, approvalId: input.context.approvalId, consume,
      });
    };
    const authorization = authorize(policy, false);
    if (authorization.status === "denied") throw new AuxError("permission_denied", authorization.guidance);
    if (authorization.status === "ask") {
      const approvalId = this.deps.approvals.issue(action, policy.approvalLifetime);
      throw new AuxError("needs_input", authorization.guidance, { requestId: approvalId });
    }
    if (input.phase === "preflight") return authorization.provenance;
    // The judge sees only typed, bounded untrusted envelopes; it cannot change policy or provenance.
    const review = await reviewGuardian({
      action,
      authorization: authorization.provenance.authorizedBy === "approval" ? "high" : "medium",
      restrictedRetry: input.context.restrictedRetry,
      untrusted: input.context.untrusted,
      judge: this.deps.judge,
    });
    this.deps.audit({ kind: "guardian_decision", at: Date.now(), status: review.status, action: action.action,
      effect: action.effect, findings: review.findings.map(finding => ({ category: finding.category, severity: finding.severity, reason: finding.reason })) });
    if (review.status === "deny") throw new AuxError("permission_denied", review.guidance);
    if (review.status === "authorization_required") throw new AuxError("needs_input", review.guidance);
    // Guardian can await a model. Policy and local grants may change during that
    // await, so consume approval only after a fresh decision at dispatch.
    const finalPolicy = evaluate();
    if (finalPolicy.access === "deny") throw new AuxError("permission_denied", "Origin policy denied this action.");
    const final = authorize(finalPolicy, true);
    if (final.status === "denied") throw new AuxError("permission_denied", final.guidance);
    if (final.status === "ask") {
      const approvalId = this.deps.approvals.issue(action, finalPolicy.approvalLifetime);
      throw new AuxError("needs_input", final.guidance, { requestId: approvalId });
    }
    return final.provenance;
  }
}
