import { afterEach, expect, it } from "vitest";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { SafetyActionSchema } from "@aux/contracts";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
const action = (category = "send", confirmation = "preapprovable") =>
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
const settings = { agentMode: "ask" as const, agentPolicyRevision: 0, agentPolicies: [] };
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
      settings,
      approvalId,
      now: 12,
    }).status,
  ).toBe("ask");
  expect(store.authorize({ action: saved, settings, approvalId, now: 12 }).status).toBe("authorized");
});
