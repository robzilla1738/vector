import { afterEach, expect, it } from "vitest";
import {
  CredentialHandoffRequestSchema,
  NativeCredentialContextSchema,
  NativeCredentialFillParamsSchema,
  SafetyActionSchema,
  SavedCredentialTargetSchema,
} from "@aux/contracts";
import { ApprovalStore, openDb } from "@aux/runtime";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
const target = {
  pageId: "page",
  sessionId: "session",
  documentEpoch: 3,
  expectedUrl: "https://login.test/account?continue=1",
  passwordSelector: "#password",
  nativeContext: {
    documentToken: "original-document",
    windowId: "1",
    ownerIncarnation: "owner",
    connectionGeneration: "2",
  },
};
it("keeps opaque admission receipts out of public credential input", () => {
  const request = {
    pageId: target.pageId,
    expectedUrl: target.expectedUrl,
    passwordSelector: target.passwordSelector,
  };
  const receiptId = "d2becd5f-3d44-4c52-bcb7-4eaf80b5d29a";
  expect(CredentialHandoffRequestSchema.safeParse({ ...request, receiptId }).success).toBe(false);
  expect(NativeCredentialFillParamsSchema.parse({ ...request, receiptId })).toEqual({
    ...request,
    receiptId,
  });
  expect(NativeCredentialFillParamsSchema.safeParse({ ...request, authenticated: true }).success).toBe(false);
  expect(
    NativeCredentialFillParamsSchema.safeParse({ ...request, password: "synthetic-secret" }).success,
  ).toBe(false);
});
it("describes only the exact native document and retains canonical login paths", () => {
  expect(SavedCredentialTargetSchema.parse(target)).toEqual(target);
  const context = { pageId: target.pageId, expectedUrl: target.expectedUrl, ...target.nativeContext };
  expect(NativeCredentialContextSchema.parse(context)).toEqual(context);
  expect(NativeCredentialContextSchema.safeParse({ ...context, passwordSelector: "#password" }).success).toBe(
    false,
  );
  expect(
    SavedCredentialTargetSchema.safeParse({
      ...target,
      expectedUrl: "https://user:secret@login.test/account",
    }).success,
  ).toBe(false);
});
it("cannot redeem the original device approval against a replacement native document", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const settings = {
    agentMode: "auto" as const,
    agentPolicyRevision: 0,
    agentPolicies: [{ category: "credentials" as const, access: "ask" as const }],
  };
  const approvals = new ApprovalStore(db, undefined, undefined, () => settings);
  const action = SafetyActionSchema.parse({
    profileId: "profile",
    scope: { kind: "task", id: "task" },
    effect: "write",
    action: "fillCredential",
    category: "credential",
    authentication: "touch_id",
    policyRevision: 0,
    invocationDigest: "a".repeat(64),
    origin: "https://login.test",
    turnId: "turn",
    threadId: "thread",
    requestedAt: Date.now(),
    credentialTarget: target,
  });
  const approvalId = approvals.issue(action, "turn");
  const pending = approvals.prepareDevice(approvalId, "turn");
  expect(pending.action.credentialTarget).toEqual(target);
  approvals.confirmDevice(approvalId, "turn", pending.fingerprint);
  const replacement = {
    ...action,
    credentialTarget: {
      ...target,
      nativeContext: { ...target.nativeContext, documentToken: "replacement-document" },
    },
  };
  expect(approvals.authorize({ action: replacement, settings, approvalId })).toMatchObject({
    status: "touch_id",
  });
  expect(approvals.authorize({ action, settings, approvalId })).toMatchObject({
    status: "authorized",
    provenance: { authorizedBy: "approval", approvalId },
  });
});
