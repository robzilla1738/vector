import { randomUUID } from "node:crypto";
import { AuxError, type RpcChannel, type SafetyAction } from "@aux/contracts";
import { z } from "zod";
import type { ApprovalStore } from "../safety/approval.js";

const token = z.string().min(1).max(160);
const context = z
  .object({
    windowId: token,
    documentToken: token,
    ownerIncarnation: token,
    connectionGeneration: z.string().regex(/^[1-9][0-9]*$/),
  })
  .strict();
const prepare = z.object({ approvalId: token, expectedTurnId: token, context }).strict();
const complete = prepare.extend({ challengeId: z.string().uuid() });
type Request = z.infer<typeof prepare>;
type Challenge = Request & { fingerprint: string; expiresAt: number; policyRevision: number };

export interface NativeDeviceConfirmationDeps {
  readonly approvals: ApprovalStore;
  profileId: string;
  current: () => boolean;
  policyRevision: () => number;
  confirmed: (action: SafetyAction, approvalId: string) => Promise<void>;
}

/** Registered only on the authenticated native socket, never the public API. */
export function registerNativeDeviceConfirmation(
  channel: Pick<RpcChannel, "onMethod">,
  deps: NativeDeviceConfirmationDeps,
) {
  const challenges = new Map<string, Challenge>();
  let stopped = false;
  let usedApprovals: ApprovalStore | undefined;
  const requireCurrent = () => {
    if (stopped || !deps.current()) throw new AuxError("ref_stale", "The original runtime connection ended.");
  };
  const prune = (now: number) => {
    for (const [id, challenge] of challenges) if (challenge.expiresAt <= now) challenges.delete(id);
  };
  const sameContext = (a: Request["context"], b: Request["context"]) =>
    a.windowId === b.windowId &&
    a.documentToken === b.documentToken &&
    a.ownerIncarnation === b.ownerIncarnation &&
    a.connectionGeneration === b.connectionGeneration;
  const take = (raw: unknown) => {
    requireCurrent();
    const request = complete.parse(raw);
    const challenge = challenges.get(request.challengeId);
    // Consume before an authentication result or continuation can reenter.
    challenges.delete(request.challengeId);
    if (
      !challenge ||
      challenge.expiresAt <= Date.now() ||
      challenge.policyRevision !== deps.policyRevision() ||
      challenge.approvalId !== request.approvalId ||
      challenge.expectedTurnId !== request.expectedTurnId ||
      !sameContext(challenge.context, request.context)
    )
      throw new AuxError("ref_stale", "This device confirmation ended or changed.");
    return { request, challenge };
  };
  channel.onMethod("safety.deviceAuth.prepare", (raw) => {
    requireCurrent();
    const request = prepare.parse(raw);
    const now = Date.now();
    prune(now);
    const approvals = deps.approvals;
    usedApprovals = approvals;
    const pending = approvals.prepareDevice(request.approvalId, request.expectedTurnId, now);
    if (pending.policyRevision !== deps.policyRevision())
      throw new AuxError("ref_stale", "Agent permissions changed since this approval was requested.");
    if (pending.action.profileId !== deps.profileId)
      throw new AuxError("permission_denied", "The pending approval belongs to another Profile.");
    for (const [id, challenge] of challenges)
      if (challenge.approvalId === request.approvalId) challenges.delete(id);
    if (challenges.size >= 64) throw new AuxError("conflict", "Too many device confirmations are pending.");
    const challengeId = randomUUID();
    const expiresAt = Math.min(pending.expiresAt, now + 120_000);
    challenges.set(challengeId, {
      ...request,
      fingerprint: pending.fingerprint,
      policyRevision: pending.policyRevision,
      expiresAt,
    });
    const action = pending.action;
    const destination = (action.origin ? new URL(action.origin).host : action.recipient)?.replace(
      /[\x00-\x1f\x7f]/g,
      " ",
    );
    const reason = `Approve Aux ${action.category ?? action.effect}${action.amount === undefined ? "" : ` (amount ${action.amount})`}${destination ? ` at ${destination}` : ""}`;
    return { challengeId, expiresAt, reason };
  });
  channel.onMethod("safety.deviceAuth.cancel", (raw) => {
    take(raw);
    return { ok: true };
  });
  channel.onMethod("safety.deviceAuth.confirm", async (raw) => {
    const { request, challenge } = take(raw);
    const action = deps.approvals.confirmDevice(
      request.approvalId,
      request.expectedTurnId,
      challenge.fingerprint,
    );
    await deps.confirmed(action, request.approvalId);
    requireCurrent();
    if (challenge.policyRevision !== deps.policyRevision())
      throw new AuxError("ref_stale", "Agent permissions changed during device confirmation.");
    return { ok: true, approvalId: request.approvalId, turnId: request.expectedTurnId };
  });
  return () => {
    stopped = true;
    challenges.clear();
    usedApprovals?.clearDeviceAuthentication();
  };
}
