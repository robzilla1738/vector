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
  documentEpoch?: number;
  checkOwner?: () => void;
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
    reviewedBatch?: boolean;
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
      digest: createHash("sha256")
        .update(
          JSON.stringify([
            input.step,
            input.context.pageId,
            input.context.sessionId,
            input.context.documentEpoch,
            input.context.observedTarget,
          ]),
        )
        .digest("hex"),
    });
    return this.checkRequest(request, input.context, input.phase, input.origin);
  }

  async prepareBatch(inputs: Parameters<SafetyDispatchGate["check"]>[0][]): Promise<void> {
    const identities = inputs.map((input) => JSON.stringify([input.step.id, input.origin]));
    if (new Set(identities).size !== identities.length)
      throw new AuxError("invalid_params", "Each reviewed action needs a distinct step ID.");
    const needed: SafetyAction[] = [];
    const summaries: NonNullable<SafetyAction["reviewedActions"]> = [];
    let firstRequest: EffectRequest | undefined;
    let firstContext: StepSafetyContext | undefined;
    for (const input of inputs) {
      input.context.checkOwner?.();
      const request = effectRequestForStep({
        step: input.step,
        origin: input.origin,
        profileId: input.context.profileId,
        scope: input.context.scope,
        turnId: input.context.turnId,
        threadId: input.context.threadId,
        runId: input.context.runId,
        actor: input.context.actor,
        observedTarget: input.context.observedTarget,
        digest: createHash("sha256")
          .update(
            JSON.stringify([
              input.step,
              input.context.pageId,
              input.context.sessionId,
              input.context.documentEpoch,
              input.context.observedTarget,
            ]),
          )
          .digest("hex"),
      });
      const decision = await decide(
        request,
        { ...this.deps },
        { phase: "preflight", runId: input.context.runId, taskRead: input.context.taskRead },
      );
      input.context.checkOwner?.();
      if (decision.status === "deny") throw new AuxError("permission_denied", decision.guidance);
      if (decision.status === "ask") {
        if (decision.suspension.kind !== "approval" || !decision.suspension.approvalId) {
          this.park(request, input.context, decision.suspension);
          throw new AuxError("needs_input", decision.suspension.instruction, {
            suspensionKind: decision.suspension.kind,
            requestId: decision.suspension.approvalId,
          });
        }
        const category = agentPolicyCategoryFor(request.category, request.action);
        if (["submit", "send", "post"].includes(category) && !input.context.observedTarget?.form) {
          if (needed.length) break;
          this.park(request, input.context, {
            ...decision.suspension,
            instruction: "Review the draft and recipient on this page before allowing this action.",
          });
          throw new AuxError("needs_input", "Review this action on the page.", {
            suspensionKind: "approval",
            requestId: decision.suspension.approvalId,
          });
        }
        const saved = this.deps.approvals
          .pending(input.context.threadId)
          .find((approval) => approval.approvalId === decision.suspension.approvalId);
        if (!saved) throw new AuxError("conflict", "This action review changed.");
        needed.push(saved.action);
        firstRequest ??= request;
        firstContext ??= input.context;
      }
      const { id, ...argumentsValue } = input.step;
      summaries.push({
        action: input.step.op,
        target:
          input.context.observedTarget?.name || ("target" in input.step ? String(input.step.target) : ""),
        arguments: JSON.stringify(argumentsValue),
        destination: input.context.observedTarget?.destination ?? input.origin,
      });
    }
    if (!needed.length) return;
    inputs.forEach((input) => input.context.checkOwner?.());
    const approvalId = this.deps.approvals.issueBatch(needed, summaries);
    const suspension: SuspensionRequest = {
      kind: "approval",
      approvalId,
      instruction: "Review these actions before Aux continues.",
      guidance: "Approve only the displayed actions; changed targets need another review.",
    };
    this.park(firstRequest!, firstContext!, suspension);
    throw new AuxError("needs_input", suspension.instruction, {
      suspensionKind: "approval",
      requestId: approvalId,
    });
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
        ...(saved?.reviewedChanges || saved?.reviewedActions ? { reviewedBatch: true } : {}),
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

  private policySnapshot(runId?: string): string {
    const policy = this.deps.approvals.effectivePolicy(this.deps.agentPolicy(runId), runId);
    return JSON.stringify([this.deps.managedRules(), policy.agentMode, policy.agentPolicies]);
  }

  /** Synchronous live fence retained through action preparation and the final dispatch. */
  policyRevision(): number {
    return this.deps.agentPolicy().agentPolicyRevision;
  }

  policyFence(runId?: string): () => void {
    const snapshot = this.policySnapshot(runId);
    const authorityRevision = this.deps.approvals.runAuthorityRevision(runId);
    return () => {
      if (
        this.policySnapshot(runId) !== snapshot ||
        this.deps.approvals.runAuthorityRevision(runId) !== authorityRevision
      )
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
    context.checkOwner?.();
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
        runId: context.runId,
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
    context.checkOwner?.();
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
