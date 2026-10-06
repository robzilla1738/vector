import { afterEach, expect, it, vi } from "vitest";
import { memoryTransportPair, RpcChannel, SafetyActionSchema } from "@aux/contracts";
import { ApprovalStore, openDb } from "@aux/runtime";
import { registerNativeDeviceConfirmation } from "../../apps/runtime/src/services/native-device-confirmation.js";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const dispose of cleanup.splice(0)) dispose();
  vi.useRealTimers();
});
function fixture(profileId = "profile") {
  const db = openDb(":memory:");
  let policyRevision = 0;
  const approvals = new ApprovalStore(db, undefined, undefined, () => ({
    agentMode: "auto",
    agentPolicyRevision: policyRevision,
    agentPolicies: [],
  }));
  const action = SafetyActionSchema.parse({
    profileId,
    scope: { kind: "task", id: "task" },
    effect: "write",
    action: "click",
    category: "purchase",
    authentication: "touch_id",
    amount: 42,
    origin: "https://shop.test",
    invocationDigest: "a".repeat(64),
    turnId: "turn",
    threadId: "thread",
    requestedAt: Date.now(),
  });
  const approvalId = approvals.issue(action, "turn");
  const [native, runtime] = memoryTransportPair();
  const caller = new RpcChannel(native),
    channel = new RpcChannel(runtime);
  let current = true;
  const confirmed = vi.fn(async () => {});
  const stop = registerNativeDeviceConfirmation(channel, {
    approvals,
    profileId: "profile",
    current: () => current,
    confirmed,
    policyRevision: () => policyRevision,
  });
  cleanup.push(() => {
    stop();
    db.close();
  });
  const request = {
    approvalId,
    expectedTurnId: "turn",
    context: {
      windowId: "window",
      documentToken: "document",
      ownerIncarnation: "owner",
      connectionGeneration: "1",
    },
  };
  const prepare = () =>
    caller.call<{ challengeId: string; expiresAt: number; reason: string }>(
      "safety.deviceAuth.prepare",
      request,
    );
  const complete = (challengeId: string) => ({ ...request, challengeId });
  return {
    db,
    approvals,
    action,
    approvalId,
    caller,
    confirmed,
    request,
    prepare,
    complete,
    stop,
    changePolicy: () => {
      policyRevision++;
    },
    disconnect: () => {
      current = false;
    },
  };
}

it("confirms only the saved action and resumes its original turn once", async () => {
  const f = fixture();
  const proof = await f.prepare();
  expect(proof.reason).toBe("Approve Aux purchase (amount 42) at shop.test");
  expect(() => f.approvals.decideLocal({ decision: "accept", approvalId: f.approvalId }, "turn")).toThrow(
    /device authentication/,
  );
  expect(await f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId))).toEqual({
    ok: true,
    approvalId: f.approvalId,
    turnId: "turn",
  });
  expect(f.confirmed).toHaveBeenCalledExactlyOnceWith(f.action, f.approvalId);
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
});

it("retires a challenge on changed native document identity, including replay", async () => {
  const f = fixture(),
    proof = await f.prepare();
  await expect(
    f.caller.call("safety.deviceAuth.confirm", {
      ...f.complete(proof.challengeId),
      context: { ...f.request.context, documentToken: "replacement" },
    }),
  ).rejects.toMatchObject({ code: "ref_stale" });
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.approvals.pending("thread")).toHaveLength(1);
  expect(f.confirmed).not.toHaveBeenCalled();
});

it("replaces an earlier challenge and cancellation never accepts the action", async () => {
  const f = fixture(),
    first = await f.prepare(),
    second = await f.prepare();
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(first.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(await f.caller.call("safety.deviceAuth.cancel", f.complete(second.challengeId))).toEqual({
    ok: true,
  });
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(second.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.approvals.pending("thread")).toHaveLength(1);
});

it("refuses a changed saved fingerprint before invoking the continuation", async () => {
  const f = fixture(),
    proof = await f.prepare();
  f.db
    .prepare("UPDATE safety_approval_requests SET fingerprint=? WHERE approval_id=?")
    .run("b".repeat(64), f.approvalId);
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId)),
  ).rejects.toMatchObject({ code: "internal" });
  expect(f.confirmed).not.toHaveBeenCalled();
});

it("expires the OS challenge independently of the pending approval", async () => {
  vi.useFakeTimers();
  const f = fixture(),
    proof = await f.prepare();
  vi.setSystemTime(proof.expiresAt);
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.approvals.pending("thread")).toHaveLength(1);
  expect(f.confirmed).not.toHaveBeenCalled();
});

it("refuses another Profile and retires original connection and disposed handlers", async () => {
  const foreign = fixture("other");
  await expect(foreign.prepare()).rejects.toMatchObject({ code: "permission_denied" });
  const f = fixture(),
    proof = await f.prepare();
  f.disconnect();
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
  f.stop();
  await expect(f.prepare()).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.confirmed).not.toHaveBeenCalled();
});

it("retires a valid native challenge when agent permissions change", async () => {
  const f = fixture(),
    proof = await f.prepare();
  f.changePolicy();
  await expect(
    f.caller.call("safety.deviceAuth.confirm", f.complete(proof.challengeId)),
  ).rejects.toMatchObject({ code: "ref_stale" });
  expect(f.confirmed).not.toHaveBeenCalled();
  expect(f.approvals.pending("thread")).toHaveLength(1);
});
