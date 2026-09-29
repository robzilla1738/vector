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
    profileId: "p1", runId: "r1", taskRevision: 4, tabId: "tab-1", frameId: "main",
    documentEpoch: 3, sourceOrigin: "https://source.test", recipientOrigins: ["https://api.test"],
  });
  const send = (destination: string, body = "", overrides: Record<string, unknown> = {}) => {
    const evidence = {
      leaseId: lease.leaseId, profileId: "p1", runId: "r1", taskRevision: 4,
      tabId: "tab-1", frameId: "main", documentEpoch: 3, destination,
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
