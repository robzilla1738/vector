import { afterEach, expect, it } from "vitest";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { SafetyActionSchema } from "@aux/contracts";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
const action = (category = "login", confirmation = "preapprovable") =>
  SafetyActionSchema.parse({
    profileId: "p",
    scope: { kind: "task", id: "first" },
    effect: "write",
    action: "submit",
    category,
    confirmation,
    origin: "https://example.test/",
    invocationDigest: "a".repeat(64),
    turnId: "t",
    threadId: "chat",
    requestedAt: 1,
  });
const policy = {
  access: "ask" as const,
  confirmation: "preapprovable" as const,
  source: "default" as const,
  origin: "https://example.test",
  effect: "write" as const,
  approvalLifetime: "turn" as const,
  grantLifetime: "always" as const,
  reason: "fixture",
};
it("persists an exact origin/category grant across runs and revokes it immediately", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const store = new ApprovalStore(db),
    saved = action();
  const approvalId = store.issue(saved, "turn", 10);
  store.decideLocal({ decision: "acceptForOrigin", approvalId }, "t", 11);
  const restored = new ApprovalStore(db),
    next = { ...saved, scope: { kind: "task" as const, id: "next" }, turnId: "next", threadId: "other" };
  const allowed = restored.authorize({ action: next, policy, ceiling: "ask", now: 12 });
  expect(allowed).toMatchObject({ status: "authorized", provenance: { authorizedBy: "standing" } });
  expect(
    restored.authorize({
      action: { ...next, origin: "https://other.test/" },
      policy,
      ceiling: "ask",
      now: 12,
    }).status,
  ).toBe("ask");
  expect(
    restored.authorize({
      action: { ...next, category: "delete", confirmation: "action" },
      policy,
      ceiling: "ask",
      approvalOnly: true,
      now: 12,
    }).status,
  ).toBe("ask");
  expect(
    restored.authorize({ action: { ...next, profileId: "other" }, policy, ceiling: "ask", now: 12 }).status,
  ).toBe("ask");
  for (const confirmation of ["action", "handoff"] as const) {
    expect(
      restored.authorize({ action: { ...saved, confirmation }, policy, ceiling: "ask", now: 12 }).status,
    ).toBe("ask");
    expect(
      restored.authorize({ action: { ...next, confirmation }, policy, ceiling: "ask", now: 12 }).status,
    ).toBe("ask");
  }
  const grant = restored.listGrants("p")[0]!;
  expect(grant).toMatchObject({ category: "login", lifetime: "always", origin: saved.origin });
  expect(restored.revoke({ profileId: "p", grantId: grant.grantId }, 13)).toBe(1);
  expect(restored.authorize({ action: next, policy, ceiling: "ask", now: 14 }).status).toBe("ask");
});
it("rejects delete, sensitive login and handoff preapprovals without consuming the pending request", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const store = new ApprovalStore(db);
  for (const saved of [action("delete", "action"), action("login", "action"), action("login", "handoff")]) {
    const approvalId = store.issue(saved, "turn", 10);
    expect(() => store.decideLocal({ decision: "acceptForOrigin", approvalId }, "t", 11)).toThrow(
      "Only login",
    );
    expect(store.pending("chat", 12).some((request) => request.approvalId === approvalId)).toBe(true);
  }
  expect(store.listGrants("p")).toEqual([]);
});
it("does not let a changed category or tier reuse a one-time acceptance", () => {
  const db = openDb(":memory:");
  databases.push(db);
  const store = new ApprovalStore(db),
    saved = action();
  const approvalId = store.issue(saved, "turn", 10);
  store.decideLocal({ decision: "accept", approvalId }, "t", 11);
  expect(
    store.authorize({
      action: { ...saved, category: "delete", confirmation: "action" },
      policy,
      ceiling: "ask",
      approvalId,
      now: 12,
    }).status,
  ).toBe("ask");
  expect(store.authorize({ action: saved, policy, ceiling: "ask", approvalId, now: 12 }).status).toBe(
    "authorized",
  );
});
