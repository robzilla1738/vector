import { describe, expect, it } from "vitest";
import { AgentEgressGuard } from "../../apps/runtime/src/safety/egress.js";

function fixture() {
  let now = 1000;
  let revision: number | null = 4;
  const audits: unknown[] = [];
  const received: string[] = [];
  const guard = new AgentEgressGuard({
    now: () => now,
    currentTaskRevision: () => revision,
    audit: (decision) => audits.push(decision),
  });
  const lease = guard.issue({
    controlGeneration: "fixture-native-generation",
    isolationId: "isolated-run", profileId: "p1", runId: "r1", taskRevision: 4, tabId: "tab-1", frameId: "main",
    documentEpoch: 3, documentToken: "native-document-1", sourceOrigin: "https://source.test", recipientOrigins: ["https://api.test"],
  });
  const send = (destination: string, body = "", overrides: Record<string, unknown> = {}) => {
    const evidence = {
      leaseId: lease.leaseId, isolationId: "isolated-run", profileId: "p1", runId: "r1", taskRevision: 4,
      tabId: "tab-1", frameId: "main", documentEpoch: 3, documentToken: "native-document-1", destination,
      kind: "fetch" as const, method: "POST" as const, byteCount: Buffer.byteLength(body),
      bodyComplete: true, observedAt: now, ...overrides,
    };
    const decision = guard.decide(evidence, body);
    if (decision.status === "allow") received.push(destination);
    return decision;
  };
  return { guard, lease, send, received, audits, setNow: (value: number) => { now = value; }, setRevision: (value: number | null) => { revision = value; } };
}

describe("agent request-path egress guard", () => {
  it("retains credential protection through original document continuation without inheriting recipient approval", () => {
    const f = fixture();
    f.guard.taint(f.lease.leaseId, "synthetic-document-secret", "credential");
    const continueDocument = f.guard.captureDocumentContinuation(f.lease.leaseId);
    f.guard.revoke(f.lease.leaseId);
    const { leaseId: _id, issuedAt: _issued, expiresAt: _expires, ...original } = f.lease;
    const next = continueDocument.issue({ ...original, expiresAt: 2000,
      controlGeneration: "next-original-native-generation", documentEpoch: 4,
      documentToken: "next-original-native-document", sourceOrigin: "https://next.test", recipientOrigins: [] });
    const send = (body: string, destination = "https://next.test") => f.guard.decide({
      leaseId: next.leaseId, isolationId: next.isolationId, profileId: next.profileId,
      runId: next.runId, taskRevision: next.taskRevision, tabId: next.tabId,
      frameId: next.frameId, documentEpoch: next.documentEpoch, documentToken: next.documentToken,
      destination, kind: "fetch", method: "POST", byteCount: Buffer.byteLength(body),
      bodyComplete: true, observedAt: 1000,
    }, body);
    expect(send("synthetic-document-secret")).toMatchObject({ status: "deny", reason: "protected_overlap", protectedClass: "credential" });
    expect(send("public", "https://api.test")).toMatchObject({ status: "deny", reason: "recipient_denied" });
    expect(send("public")).toMatchObject({ status: "allow", reason: "same_origin" });
    expect(JSON.stringify(f.audits)).not.toContain("synthetic-document-secret");
  });

  it.each(["active", "foreign", "epoch", "recipient", "run-retired", "expired", "extended"])("refuses %s document protection continuation", kind => {
    const f = fixture();
    const { leaseId: _id, issuedAt: _issued, expiresAt: _expires, ...original } = f.lease;
    const continueDocument = f.guard.captureDocumentContinuation(f.lease.leaseId);
    const next = { ...original, expiresAt: 2000, documentEpoch: 4,
      documentToken: "new-document", recipientOrigins: [] as string[] };
    if (kind !== "active") f.guard.revoke(f.lease.leaseId);
    if (kind === "foreign") next.runId = "foreign";
    if (kind === "epoch") next.documentEpoch = 5;
    if (kind === "recipient") next.recipientOrigins = ["https://api.test"];
    if (kind === "run-retired") f.guard.revokeRun("r1");
    if (kind === "expired") f.setNow(f.lease.expiresAt);
    if (kind === "extended") next.expiresAt = f.lease.expiresAt + 1;
    expect(() => continueDocument.issue(next)).toThrow("retired original");
  });

  it("discards captured protection when the original command is cancelled", () => {
    const f = fixture();
    const { leaseId: _id, issuedAt: _issued, expiresAt: _expires, ...original } = f.lease;
    const continuation = f.guard.captureDocumentContinuation(f.lease.leaseId);
    continuation.discard();
    f.guard.revoke(f.lease.leaseId);
    expect(() => continuation.issue({ ...original, expiresAt: 2000, documentEpoch: 4,
      documentToken: "new-document", recipientOrigins: [] })).toThrow("retired original");
  });

  it("consumes original document protection only once", () => {
    const f = fixture();
    const { leaseId: _id, issuedAt: _issued, expiresAt: _expires, ...original } = f.lease;
    const continueDocument = f.guard.captureDocumentContinuation(f.lease.leaseId);
    f.guard.revoke(f.lease.leaseId);
    const next = { ...original, expiresAt: 2000, documentEpoch: 4,
      documentToken: "new-document", recipientOrigins: [] };
    expect(continueDocument.issue(next).documentToken).toBe("new-document");
    expect(() => continueDocument.issue(next)).toThrow("retired original");
  });

  it("allows authorized same-origin and public recipient traffic", () => {
    const f = fixture();
    expect(f.send("https://source.test/next")).toMatchObject({ status: "allow", reason: "same_origin" });
    expect(f.send("https://api.test/lookup", "public query")).toMatchObject({ status: "allow", reason: "authorized_recipient" });
    expect(f.received).toHaveLength(2);
  });

  it("blocks protected URL/body overlap across redirect, worker and subresource requests", () => {
    const f = fixture();
    f.guard.taint(f.lease.leaseId, "correct-horse-battery", "credential");
    const cases = [
      f.send("https://api.test/collect?x=correct-horse-battery"),
      f.send("https://api.test/collect?x=correct-horse-battery".replaceAll("-", "%2D"), "", { kind: "redirect" }),
      f.send("https://api.test/collect", Buffer.from("correct-horse-battery").toString("base64"), { kind: "worker" }),
      f.send("https://api.test/collect", "correct-horse-battery", { kind: "subresource" }),
    ];
    for (const decision of cases) expect(decision).toMatchObject({ status: "deny", reason: "protected_overlap", protectedClass: "credential" });
    expect(f.received).toHaveLength(0);
    expect(JSON.stringify(f.audits)).not.toContain("correct-horse-battery");
  });

  it("refuses unapproved recipients, incomplete bodies, stale revision, expired and revoked leases", () => {
    const f = fixture();
    expect(f.send("https://evil.test/collect")).toMatchObject({ status: "deny", reason: "recipient_denied" });
    expect(f.send("https://api.test/collect", "x", { bodyComplete: false })).toMatchObject({ status: "deny", reason: "incomplete_body" });
    expect(f.send("https://api.test/collect", "", { documentEpoch: 5 })).toMatchObject({ status: "deny", reason: "identity_mismatch" });
    f.setRevision(5);
    expect(f.send("https://api.test/collect")).toMatchObject({ status: "deny", reason: "stale_lease" });
    f.setRevision(4);
    f.setNow(f.lease.expiresAt);
    expect(f.send("https://api.test/collect")).toMatchObject({ status: "deny", reason: "stale_lease" });
    f.guard.revokeRun("r1");
    expect(f.send("https://api.test/collect")).toMatchObject({ status: "deny", reason: "revoked_lease" });
    expect(f.received).toHaveLength(0);
  });

  it("revokes authority when a protected value cannot be inspected", () => {
    const f = fixture();
    expect(() => f.guard.taint(f.lease.leaseId, "short", "credential")).toThrow(/inspectable/);
    expect(f.send("https://api.test/collect")).toMatchObject({ status: "deny", reason: "revoked_lease" });
  });

  it("fails closed after restart or missing lease and refuses stale Profile/frame identity", () => {
    const f = fixture();
    expect(f.send("https://api.test", "", { profileId: "p2" })).toMatchObject({ status: "deny", reason: "identity_mismatch" });
    expect(f.send("https://api.test", "", { frameId: "other" })).toMatchObject({ status: "deny", reason: "identity_mismatch" });
    expect(f.send("https://api.test", "", { leaseId: "lost-on-restart" })).toMatchObject({ status: "deny", reason: "missing_lease" });
  });
});
