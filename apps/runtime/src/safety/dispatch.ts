import { createHash } from "node:crypto";
import { AuxError, type AuthorizationProvenance, type FinalReviewArtifact, type OriginRule, type SafetyAction, type Step } from "@aux/contracts";
import { classifyStep } from "../agent/permissions.js";
import { ApprovalStore, type LocalCeiling } from "./approval.js";
import { decide, DecisionJournal, effectRequestForStep } from "./decide.js";
import type { GuardianJudge, UntrustedOutput } from "./guardian.js";
import type { OriginPolicyAudit } from "./origin-policy.js";

export interface StepSafetyContext {
  profileId: string;
  scope: SafetyAction["scope"];
  turnId: string;
  threadId: string;
  runId?: string;
  actor?: "builtin_agent" | "subagent" | "code_mode" | "external_token" | "user";
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
  journal: DecisionJournal;
  managedRules: () => readonly OriginRule[];
  userRules: () => readonly OriginRule[];
  localCeiling: (action: SafetyAction) => LocalCeiling;
  audit: (decision: OriginPolicyAudit | Record<string, unknown>) => void;
  judge?: GuardianJudge;
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
    if (input.step.op !== "fillCredential" && classifyStep(input.step.op) === "read") {
      return undefined;
    }
    const request = effectRequestForStep({
      step: input.step, origin: input.origin,
      profileId: input.context.profileId, scope: input.context.scope,
      turnId: input.context.turnId, threadId: input.context.threadId,
      ...(input.context.runId ? { runId: input.context.runId } : {}),
      ...(input.context.actor ? { actor: input.context.actor } : {}),
      digest: createHash("sha256").update(JSON.stringify(input.step)).digest("hex"),
    });
    const decision = await decide(request, {
      approvals: this.deps.approvals, journal: this.deps.journal,
      managedRules: this.deps.managedRules, userRules: this.deps.userRules,
      localCeiling: this.deps.localCeiling, audit: this.deps.audit,
      ...(this.deps.judge ? { judge: this.deps.judge } : {}),
    }, {
      phase: input.phase,
      ...(input.context.sessionId ? { sessionId: input.context.sessionId } : {}),
      ...(input.context.approvalId ? { approvalId: input.context.approvalId } : {}),
      ...(input.context.review ? { review: input.context.review } : {}),
      turnToolCallCount: input.context.turnToolCallCount,
      sensitiveData: input.context.sensitiveData,
      restrictedRetry: input.context.restrictedRetry,
      untrusted: input.context.untrusted,
    });
    if (decision.status === "allow") return decision.authorizedBy;
    if (decision.status === "deny") {
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    }
    const { suspension } = decision;
    throw new AuxError("needs_input", suspension.instruction || suspension.guidance,
      suspension.approvalId ? { requestId: suspension.approvalId } : undefined);
  }
}
