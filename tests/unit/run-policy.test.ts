import { afterEach, expect, it } from "vitest";
import type { AgentPolicySettings, Run } from "@aux/contracts";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { decide, DecisionJournal } from "../../apps/runtime/src/safety/decide.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => databases.splice(0).forEach((db) => db.close()));
function fixture(defaultMode: "ask" | "full", runMode: "ask" | "full") {
  const db = openDb(":memory:");
  databases.push(db);
  const settings: AgentPolicySettings = { agentMode: defaultMode, agentPolicyRevision: 0, agentPolicies: [] };
  const run: Pick<Run, "status" | "config"> = { status: "running", config: { agentMode: runMode } };
  const approvals = new ApprovalStore(
    db,
    undefined,
    undefined,
    () => settings,
    (id) => (id === "run" ? run : undefined),
  );
  const deps = {
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    agentPolicy: () => settings,
    audit: () => {},
  };
  const request = {
    profileId: "profile",
    scope: { kind: "task" as const, id: "task" },
    actor: "builtin_agent" as const,
    effect: "write" as const,
    category: "file_write" as const,
    action: "fs.writeFile",
    recipient: "project",
    dataClasses: [],
    provenance: "user" as const,
    invocationDigest: "a".repeat(64),
    turnId: "run",
    threadId: "chat",
    requestedAt: Date.now(),
  };
  return { approvals, deps, request, settings, run };
}
it("uses the saved run mode in both policy evaluations without changing the default", async () => {
  const fast = fixture("ask", "full");
  expect(await decide(fast.request, fast.deps, { phase: "dispatch", runId: "run" })).toMatchObject({
    status: "allow",
  });
  expect(fast.settings.agentMode).toBe("ask");
  const reviewed = fixture("full", "ask");
  expect(await decide(reviewed.request, reviewed.deps, { phase: "dispatch", runId: "run" })).toMatchObject({
    status: "ask",
  });
});
it("journals run grants, isolates them, and invalidates them on revision and revocation", async () => {
  const f = fixture("ask", "ask");
  const result = await decide(f.request, f.deps, { phase: "dispatch", runId: "run" });
  if (result.status !== "ask" || !result.suspension.approvalId) throw new Error("Expected approval");
  f.approvals.decideLocal({ decision: "acceptForRun", approvalId: result.suspension.approvalId }, "run");
  const changed = { ...f.request, invocationDigest: "b".repeat(64) };
  expect(await decide(changed, f.deps, { phase: "dispatch", runId: "run" })).toMatchObject({
    status: "allow",
    authorizedBy: { authorizedBy: "standing" },
  });
  expect(await decide(changed, f.deps, { phase: "dispatch", runId: "other" })).toMatchObject({
    status: "ask",
  });
  f.settings.agentPolicies = [{ category: "file_write", access: "block" }];
  expect(await decide(changed, f.deps, { phase: "dispatch", runId: "run" })).toMatchObject({
    status: "deny",
  });
  f.settings.agentPolicies = [];
  f.approvals.revokeRunGrants("run");
  expect(await decide(changed, f.deps, { phase: "dispatch", runId: "run" })).toMatchObject({ status: "ask" });
});
it("does not trust a request-provided run identity to elevate its mode", async () => {
  const f = fixture("ask", "full");
  expect(await decide({ ...f.request, runId: "run" }, f.deps, { phase: "dispatch" })).toMatchObject({
    status: "ask",
  });
});
it("approves the displayed mixed file batch once, and blocks any forbidden category", async () => {
  const f = fixture("ask", "ask");
  const context = {
    phase: "dispatch" as const,
    runId: "run",
    policyCategories: ["file_write" as const, "file_delete" as const],
    reviewedChanges: [{ path: "/project/file", before: "old", after: "new" }],
  };
  const pending = await decide(f.request, f.deps, context);
  if (pending.status !== "ask" || !pending.suspension.approvalId) throw new Error("Expected review");
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.suspension.approvalId }, "run");
  expect(await decide(f.request, f.deps, context)).toMatchObject({
    status: "allow",
    authorizedBy: { authorizedBy: "approval" },
  });
  expect(
    await decide(f.request, f.deps, {
      ...context,
      reviewedChanges: [{ path: "/project/file", before: "old", after: "different" }],
    }),
  ).toMatchObject({ status: "ask" });
  f.settings.agentPolicies = [{ category: "file_delete", access: "block" }];
  expect(await decide(f.request, f.deps, context)).toMatchObject({ status: "deny" });
});
it("journals an explicit user undo while respecting category blocks", async () => {
  const f = fixture("ask", "ask");
  f.run.status = "completed";
  const request = { ...f.request, actor: "user" as const };
  expect(
    await decide(request, f.deps, { phase: "dispatch", runId: "run", trustedUserAction: true }),
  ).toMatchObject({ status: "allow" });
  f.settings.agentPolicies = [{ category: "file_write", access: "block" }];
  expect(
    await decide(request, f.deps, { phase: "dispatch", runId: "run", trustedUserAction: true }),
  ).toMatchObject({ status: "deny" });
});
it("redeems each concrete browser action once without approving target drift or a late reply", async () => {
  const { SafetyDispatchGate } = await import("../../apps/runtime/src/safety/dispatch.js");
  const f = fixture("ask", "ask");
  const gate = new SafetyDispatchGate(f.deps);
  const context = {
    profileId: "profile",
    scope: f.request.scope,
    turnId: "run",
    runId: "run",
    threadId: "chat",
    pageId: "page",
    sessionId: "session",
    documentEpoch: 1,
  };
  const inputs = ["one", "two"].map((id) => ({
    step: { id, op: "click" as const, target: `#${id}` },
    origin: "https://example.test",
    phase: "preflight" as const,
    context: {
      ...context,
      observedTarget: {
        origin: "https://example.test",
        tag: "button",
        type: "button",
        autocomplete: "",
        name: "Send",
        nodeIdentity: id,
        stateDigest: "a",
        form: { action: "https://example.test/send", method: "post", fields: [] },
      },
    },
  }));
  await expect(gate.prepareBatch(inputs)).rejects.toMatchObject({ code: "needs_input" });
  const [pending] = f.approvals.pending("chat");
  expect(pending!.action.reviewedActions).toHaveLength(2);
  expect(() =>
    f.approvals.decideLocal({ decision: "acceptForRun", approvalId: pending!.approvalId }, "run"),
  ).toThrow(/displayed batch/);
  f.approvals.decideLocal({ decision: "accept", approvalId: pending!.approvalId }, "run");
  await expect(gate.check({ ...inputs[0]!, phase: "dispatch" })).resolves.toMatchObject({
    authorizedBy: "approval",
  });
  await expect(
    gate.check({
      ...inputs[1]!,
      phase: "dispatch",
      context: {
        ...inputs[1]!.context,
        observedTarget: { ...inputs[1]!.context.observedTarget, stateDigest: "changed" },
      },
    }),
  ).rejects.toMatchObject({ code: "needs_input" });
  await expect(gate.check({ ...inputs[1]!, phase: "dispatch" })).resolves.toMatchObject({
    authorizedBy: "approval",
  });
  await expect(gate.check({ ...inputs[0]!, phase: "dispatch" })).rejects.toMatchObject({
    code: "needs_input",
  });
  const [late] = f.approvals.pending("chat");
  f.run.status = "cancelled";
  expect(() => f.approvals.decideLocal({ decision: "accept", approvalId: late!.approvalId }, "run")).toThrow(
    /ended/,
  );
});
