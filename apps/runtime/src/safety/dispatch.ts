import { exactOrigin } from "@aux/contracts/util/exact-origin";
import type { ValidatedTaskRead } from "@aux/contracts";
import { createHash } from "node:crypto";
import {
  AuxError,
  agentPolicyCategoryFor,
  EffectRequestSchema,
  type EffectRequest,
  type AuthorizationProvenance,
  type EffectCategory,
  type ConfirmationLevel,
  type FinalReviewArtifact,
  type OriginRule,
  type SafetyAction,
  type SavedCredentialTarget,
  type Step,
  type SuspensionRequest,
} from "@aux/contracts";
import type { ObservedActionTarget } from "./observed-target.js";
import { ApprovalStore } from "./approval.js";
import { decide, DecisionJournal, effectRequestForStep, type DecideDeps } from "./decide.js";
import type { OriginPolicyAudit } from "./origin-policy.js";
import type { SuspensionStore } from "./suspensions.js";

export interface StepSafetyContext {
  taskRead?: ValidatedTaskRead;
  profileId: string;
  scope: SafetyAction["scope"];
  turnId: string;
  threadId: string;
  runId?: string;
  pageId?: string;
  observedTarget?: ObservedActionTarget;
  /** Validated native metadata from the original executable attachment. */
  credentialTarget?: SavedCredentialTarget;
  actor?: "builtin_agent" | "subagent" | "code_mode" | "external_token" | "user";
  sessionId?: string;
  approvalId?: string;
  review?: FinalReviewArtifact;
  turnToolCallCount?: number;
  sensitiveData?: boolean;
  restrictedRetry?: boolean;
  /** Trusted-source programs (allowEval) may evaluate; the flag travels with the program, not the step. */
  trustedEval?: boolean;
}

export interface SafetyDispatchDeps {
  approvals: ApprovalStore;
  journal: DecisionJournal;
  /** Durable parking for ask decisions; without it the run still gets needs_input. */
  suspensions?: SuspensionStore;
  managedRules: () => readonly OriginRule[];
  agentPolicy: DecideDeps["agentPolicy"];
  audit: (decision: OriginPolicyAudit | Record<string, unknown>) => void;
  /** User-facing confirmation. Fired when an approval is waiting on the shell. */
  onConfirmation?: (confirmation: {
    approvalId?: string;
    turnId: string;
    threadId: string;
    instruction: string;
    action: string;
    origin: string;
    category: EffectCategory;
    confirmation: ConfirmationLevel;
    kind: "approval" | "touch-id" | "handoff";
    policyCategory: import("@aux/contracts").AgentPolicyCategory;
    site: string;
    amount?: number;
    pageId?: string;
  }) => void;
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
    const source = input.context.taskRead;
    if (source) {
      if (
        source.provenance.pageId !== input.context.pageId ||
        source.provenance.sessionId !== input.context.sessionId
      )
        throw new AuxError("permission_denied", "The task read proof belongs to another step attachment.");
      source.check();
    }
    const request = effectRequestForStep({
      step: input.step,
      origin: input.origin,
      profileId: input.context.profileId,
      scope: input.context.scope,
      turnId: input.context.turnId,
      threadId: input.context.threadId,
      ...(input.context.runId ? { runId: input.context.runId } : {}),
      ...(input.context.actor ? { actor: input.context.actor } : {}),
      observedTarget: input.context.observedTarget,
      credentialTarget: input.context.credentialTarget,
      digest: createHash("sha256").update(JSON.stringify(input.step)).digest("hex"),
    });
    return this.checkRequest(request, input.context, input.phase, input.origin);
  }

  /** Internal producer route; the authenticated native permission controller owns this request. */
  checkTrustedEffect(
    request: EffectRequest,
    context: StepSafetyContext,
  ): Promise<AuthorizationProvenance | undefined> {
    return this.checkRequest(EffectRequestSchema.parse(request), context, "dispatch", request.origin ?? "");
  }

  /** The caller supplies the actual runtime read operation and current attachment, never model metadata. */
  async checkRead(input: {
    action: string;
    origin: string;
    document: { pageId: string; sessionId: string; documentEpoch: number; url: string };
    context: StepSafetyContext;
  }): Promise<() => void> {
    const request = EffectRequestSchema.parse({
      profileId: input.context.profileId,
      scope: input.context.scope,
      actor: input.context.actor ?? "builtin_agent",
      effect: "read",
      category: "read",
      action: input.action,
      origin: input.origin,
      dataClasses: [],
      provenance: "page",
      invocationDigest: createHash("sha256")
        .update(JSON.stringify([input.action, input.document]))
        .digest("hex"),
      turnId: input.context.turnId,
      threadId: input.context.threadId,
      runId: input.context.runId,
      requestedAt: Date.now(),
    });
    const source = input.context.taskRead;
    if (
      source &&
      (source.provenance.pageId !== input.document.pageId ||
        source.provenance.sessionId !== input.document.sessionId ||
        source.provenance.documentEpoch !== input.document.documentEpoch)
    )
      throw new AuxError("permission_denied", "The read task source belongs to another attachment.");
    source?.check();
    const fence = this.policySnapshot();
    await this.checkRequest(
      request,
      { ...input.context, pageId: input.document.pageId },
      "dispatch",
      input.origin,
    );
    return () => {
      source?.check();
      if (this.policySnapshot() !== fence)
        throw new AuxError(
          "permission_denied",
          "Site agent policy changed while reading this page. Retry against its current rules.",
        );
    };
  }

  /** Publish and retain an already-decided suspension without deciding or consuming approval again. */
  park(
    request: EffectRequest,
    context: Pick<StepSafetyContext, "turnId" | "threadId" | "runId" | "pageId">,
    suspension: SuspensionRequest,
    origin = request.origin ?? "",
  ): void {
    const site = exactOrigin(origin);
    const saved = suspension.approvalId
      ? this.deps.approvals
          .pending(context.threadId)
          .find((value) => value.approvalId === suspension.approvalId)?.action
      : undefined;
    const category = saved?.category ?? request.category;
    const action = saved?.action ?? request.action;
    const amount = saved?.amount ?? request.amount;
    const presented: SuspensionRequest = {
      ...suspension,
      context: {
        ...(context.pageId ? { pageId: context.pageId } : {}),
        ...(site ? { site } : {}),
        policyCategory: agentPolicyCategoryFor(category, action),
        category,
        action,
        ...(amount !== undefined ? { amount } : {}),
      },
    };
    if (
      ((suspension.kind === "approval" || suspension.kind === "touch-id") && suspension.approvalId) ||
      suspension.kind === "handoff"
    ) {
      if (
        (suspension.kind === "approval" || suspension.kind === "touch-id") &&
        (!saved?.category || !saved.confirmation)
      )
        throw new AuxError("needs_input", "This approval must be refreshed.");
      this.deps.onConfirmation?.({
        ...(suspension.approvalId ? { approvalId: suspension.approvalId } : {}),
        turnId: context.turnId,
        threadId: context.threadId,
        instruction: suspension.instruction,
        kind:
          suspension.kind === "touch-id"
            ? "touch-id"
            : suspension.kind === "handoff"
              ? "handoff"
              : "approval",
        policyCategory: agentPolicyCategoryFor(category, action),
        site: site ?? "",
        ...(amount !== undefined ? { amount } : {}),
        action,
        origin,
        category,
        confirmation: suspension.kind === "handoff" ? "handoff" : (saved?.confirmation ?? "action"),
        ...(context.pageId ? { pageId: context.pageId } : {}),
      });
    }
    if (this.deps.suspensions && context.runId) {
      this.deps.suspensions.park({
        runId: context.runId,
        threadId: context.threadId,
        turnId: context.turnId,
        kind: suspension.kind,
        request: presented,
      });
    }
  }

  private policySnapshot(): string {
    return JSON.stringify([this.deps.managedRules(), this.deps.agentPolicy()]);
  }

  /** Synchronous live fence retained through action preparation and the final dispatch. */
  policyRevision(): number {
    return this.deps.agentPolicy().agentPolicyRevision;
  }

  policyFence(): () => void {
    const snapshot = this.policySnapshot();
    return () => {
      if (this.policySnapshot() !== snapshot)
        throw new AuxError(
          "permission_denied",
          "Agent permissions changed while preparing this action. Retry against the current policy.",
        );
    };
  }

  private async checkRequest(
    request: EffectRequest,
    context: StepSafetyContext,
    phase: "preflight" | "dispatch",
    origin: string,
  ): Promise<AuthorizationProvenance | undefined> {
    const decision = await decide(
      request,
      {
        approvals: this.deps.approvals,
        journal: this.deps.journal,
        managedRules: this.deps.managedRules,
        agentPolicy: this.deps.agentPolicy,
        audit: this.deps.audit,
      },
      {
        phase: phase,
        taskRead: context.taskRead,
        ...(context.sessionId ? { sessionId: context.sessionId } : {}),
        ...(context.approvalId ? { approvalId: context.approvalId } : {}),
        ...(context.review ? { review: context.review } : {}),
        turnToolCallCount: context.turnToolCallCount,
        sensitiveData: context.sensitiveData,
        restrictedRetry: context.restrictedRetry,
        trustedEval: context.trustedEval === true,
      },
    );
    if (decision.status === "allow") return decision.authorizedBy;
    if (decision.status === "deny") {
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    }
    const { suspension } = decision;
    this.park(request, context, suspension, origin);
    throw new AuxError("needs_input", suspension.instruction || suspension.guidance, {
      suspensionKind: suspension.kind,
      ...(suspension.approvalId ? { requestId: suspension.approvalId } : {}),
    });
  }
}
