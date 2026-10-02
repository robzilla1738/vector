import type { ValidatedTaskRead } from "@aux/contracts";
import { createHash } from "node:crypto";
import {
  AuxError,
  EffectRequestSchema,
  type EffectRequest,
  type AuthorizationProvenance,
  type EffectCategory,
  type ConfirmationLevel,
  type FinalReviewArtifact,
  type OriginRule,
  type SafetyAction,
  type Step,
} from "@aux/contracts";
import type { ObservedActionTarget } from "./observed-target.js";
import { ApprovalStore, type LocalCeiling } from "./approval.js";
import { actionFor, decide, DecisionJournal, effectRequestForStep, type DecideDeps } from "./decide.js";
import type { GuardianJudge, UntrustedOutput } from "./guardian.js";
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
  actor?: "builtin_agent" | "subagent" | "code_mode" | "external_token" | "user";
  sessionId?: string;
  approvalId?: string;
  review?: FinalReviewArtifact;
  turnToolCallCount?: number;
  sensitiveData?: boolean;
  restrictedRetry?: boolean;
  untrusted?: readonly UntrustedOutput[];
  /** Trusted-source programs (allowEval) may evaluate; the flag travels with the program, not the step. */
  trustedEval?: boolean;
  standingOnly?: boolean;
}

export interface SafetyDispatchDeps {
  approvals: ApprovalStore;
  journal: DecisionJournal;
  /** Durable parking for ask decisions; without it the run still gets needs_input. */
  suspensions?: SuspensionStore;
  managedRules: () => readonly OriginRule[];
  userRules: () => readonly OriginRule[];
  localCeiling: (action: SafetyAction) => LocalCeiling;
  settingsGrants?: DecideDeps["settingsGrants"];
  audit: (decision: OriginPolicyAudit | Record<string, unknown>) => void;
  judge?: GuardianJudge;
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
      if (source.provenance.pageId !== input.context.pageId || source.provenance.sessionId !== input.context.sessionId)
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
    if (source && (source.provenance.pageId !== input.document.pageId || source.provenance.sessionId !== input.document.sessionId ||
        source.provenance.documentEpoch !== input.document.documentEpoch))
      throw new AuxError("permission_denied", "The read task source belongs to another attachment.");
    source?.check();
    const action = actionFor(request, input.origin);
    const fence = this.policySnapshot(action);
    await this.checkRequest(
      request,
      { ...input.context, pageId: input.document.pageId },
      "dispatch",
      input.origin,
    );
    return () => {
      source?.check();
      if (this.policySnapshot(action) !== fence)
        throw new AuxError(
          "permission_denied",
          "Site agent policy changed while reading this page. Retry against its current rules.",
        );
    };
  }

  private policySnapshot(action: Parameters<DecideDeps["localCeiling"]>[0]): string {
    return JSON.stringify([
      this.deps.managedRules(),
      this.deps.userRules(),
      this.deps.settingsGrants?.(),
      this.deps.localCeiling(action),
    ]);
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
        userRules: this.deps.userRules,
        localCeiling: this.deps.localCeiling,
        settingsGrants: this.deps.settingsGrants,
        audit: this.deps.audit,
        ...(this.deps.judge ? { judge: this.deps.judge } : {}),
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
        untrusted: context.untrusted,
        trustedEval: context.trustedEval === true,
        standingOnly: context.standingOnly === true,
      },
    );
    if (decision.status === "allow") return decision.authorizedBy;
    if (decision.status === "deny") {
      throw new AuxError("permission_denied", decision.guidance, { refusalId: decision.refusalId });
    }
    const { suspension } = decision;
    if ((suspension.kind === "approval" && suspension.approvalId) || suspension.kind === "handoff") {
      const saved = suspension.approvalId
        ? this.deps.approvals
            .pending(context.threadId)
            .find((value) => value.approvalId === suspension.approvalId)?.action
        : undefined;
      if (suspension.kind === "approval" && (!saved?.category || !saved.confirmation))
        throw new AuxError("needs_input", "This approval must be refreshed.");
      this.deps.onConfirmation?.({
        ...(suspension.approvalId ? { approvalId: suspension.approvalId } : {}),
        turnId: context.turnId,
        threadId: context.threadId,
        instruction: suspension.instruction,
        action: request.action,
        origin,
        category: saved?.category ?? request.category,
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
        request: suspension,
      });
    }
    throw new AuxError("needs_input", suspension.instruction || suspension.guidance, {
      suspensionKind: suspension.kind,
      ...(suspension.approvalId ? { requestId: suspension.approvalId } : {}),
    });
  }
}
