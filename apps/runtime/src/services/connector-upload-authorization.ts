import { AuxError, EffectRequestSchema, type AgentPolicyCategory } from "@aux/contracts";
import { decide, type DecideDeps } from "../safety/decide.js";
import type { SafetyDispatchGate } from "../safety/dispatch.js";
import type { ConnectorUploadAuthorization, ConnectorUploadEffect } from "./connector-file-transfers.js";
/** Host-only factory. The original run controller supplies context; tool arguments cannot construct authority. */
export function connectorUploadAuthorizer(deps: {
  decide: DecideDeps;
  gate: SafetyDispatchGate;
  retireUnemittedApproval(
    approvalId: string,
    owner: { runId: string; turnId: string; threadId: string },
    invocationDigest: string,
  ): boolean;
  context(runId: string): { profileId: string; turnId: string; threadId: string; checkCurrent(): void };
}) {
  return async (
    effect: ConnectorUploadEffect,
    signal: AbortSignal,
  ): Promise<ConnectorUploadAuthorization> => {
    const { job } = effect,
      original = deps.context(job.runId);
    const current = () => {
      signal.throwIfAborted();
      original.checkCurrent();
    };
    current();
    const destination = new URL(effect.destination);
    if (destination.protocol !== "https:" || destination.username || destination.password)
      throw new AuxError("permission_denied", "The connector upload has no supported secure destination.");
    const categories: AgentPolicyCategory[] =
      job.phase === "upload"
        ? ["upload", "external_tool"]
        : job.phase === "completion" && job.slack?.channelId
          ? ["upload", "send", "external_tool"]
          : ["external_tool"];
    // Signed allocation paths/queries/headers remain private in the encrypted transfer record.
    // The exact destination and byte/tool input are nevertheless bound by the immutable phase digest.
    const request = EffectRequestSchema.parse({
      profileId: original.profileId,
      scope: { kind: "task", id: job.taskId },
      actor: "builtin_agent",
      effect: job.phase === "upload" ? "egress" : "external_tool",
      category:
        job.phase === "upload"
          ? "upload"
          : job.phase === "completion" && job.slack?.channelId
            ? "send"
            : "external_tool",
      action: `connector.file.${job.phase}`,
      origin: destination.origin,
      destination: destination.origin,
      dataClasses: ["file"],
      provenance: "template",
      invocationDigest: effect.digest,
      turnId: original.turnId,
      threadId: original.threadId,
      runId: job.runId,
      requestedAt: Date.now(),
    });
    const park = (
      approvalId: string,
      identity: string,
      instruction: string,
    ): ConnectorUploadAuthorization => {
      deps.gate.park(
        request,
        { ...original, runId: job.runId },
        {
          kind: "approval",
          approvalId,
          instruction,
          guidance:
            "Review the exact original file and destination. No transfer phase is replayed after an uncertain outcome.",
        },
      );
      return { state: "waiting", approvalId, identity, park: { kind: "approval", approvalId, instruction } };
    };
    const owner = { runId: job.runId, turnId: original.turnId, threadId: original.threadId };
    if (job.approval) {
      const continuation = deps.decide.approvals.continuation(job.approval.approvalId, owner);
      if (!continuation || continuation.identity !== job.approval.identity)
        throw new AuxError(
          "permission_denied",
          "The original file-upload approval retired; it cannot authorize a replacement phase.",
        );
      if (continuation.state === "pending")
        return park(
          job.approval.approvalId,
          continuation.identity,
          `Review ${job.source.filename} (${job.source.size} bytes) for ${job.provider}.`,
        );
    }
    const fence = JSON.stringify([
      deps.decide.agentPolicy(job.runId),
      deps.decide.managedRules(),
      deps.decide.approvals.runAuthorityRevision(job.runId),
    ]);
    const decision = await decide(request, deps.decide, {
      phase: "dispatch",
      runId: job.runId,
      policyCategories: categories,
      ...(job.approval ? { approvalId: job.approval.approvalId } : {}),
      reviewedActions: [
        {
          action: `Upload: ${job.phase}`,
          target: job.slack?.channelId ?? job.provider,
          destination: destination.origin,
          arguments: JSON.stringify({
            filename: job.source.filename,
            mediaType: job.source.mediaType,
            size: job.source.size,
            sha256: job.source.sha256,
            phase: job.phase,
            ...(job.slack?.initialComment ? { initialComment: job.slack.initialComment } : {}),
          }),
        },
      ],
    });
    current();
    if (decision.status === "deny") throw new AuxError("permission_denied", decision.guidance);
    if (decision.status === "ask") {
      const approvalId = decision.suspension.approvalId;
      if (job.approval) {
        if (approvalId && approvalId !== job.approval.approvalId)
          deps.retireUnemittedApproval(approvalId, owner, effect.digest);
        throw new AuxError(
          "permission_denied",
          "The original upload approval expired or changed; a replacement request was not adopted.",
        );
      }
      if (decision.suspension.kind !== "approval" || !approvalId)
        throw new AuxError("needs_input", decision.suspension.instruction);
      const continuation = deps.decide.approvals.continuation(approvalId, owner);
      if (!continuation)
        throw new AuxError("permission_denied", "The original upload approval is unavailable.");
      return park(approvalId, continuation.identity, decision.suspension.instruction);
    }
    return {
      state: "allowed",
      checkCurrent() {
        current();
        if (
          JSON.stringify([
            deps.decide.agentPolicy(job.runId),
            deps.decide.managedRules(),
            deps.decide.approvals.runAuthorityRevision(job.runId),
          ]) !== fence
        )
          throw new AuxError(
            "permission_denied",
            "The original file-upload policy changed before publication.",
          );
      },
    };
  };
}
