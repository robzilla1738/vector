import { afterEach, expect, it } from "vitest";
import { EffectRequestSchema } from "@aux/contracts";
import { ApprovalStore, DecisionJournal, Repo, SettingsService, decide, openDb } from "@aux/runtime";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});
function fixture() {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  repo.setSetting("agentMode", "ask");
  const settings = new SettingsService(repo, "/nonexistent/site-policy-fixture.json", {});
  const approvals = new ApprovalStore(
    db,
    () => {},
    (action) => settings.allowAgentSite(action),
  );
  const deps = {
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    agentPolicy: () => settings.agentPolicy(),
    audit: () => {},
  };
  const request = EffectRequestSchema.parse({
    profileId: "p",
    scope: { kind: "task", id: "first" },
    actor: "builtin_agent",
    effect: "write",
    action: "send",
    category: "send",
    origin: "https://example.test/mail",
    dataClasses: [],
    provenance: "page",
    invocationDigest: "a".repeat(64),
    turnId: "first",
    threadId: "chat",
    requestedAt: 1,
  });
  return { deps, request, settings };
}
it("site consent applies only to the exact category and origin and revocation restores the prompt", async () => {
  const { deps, request, settings } = fixture();
  const first = await decide(request, deps, { phase: "preflight" });
  if (first.status !== "ask" || !first.suspension.approvalId) throw new Error("Missing approval");
  deps.approvals.decideLocal(
    { decision: "acceptForOrigin", approvalId: first.suspension.approvalId },
    request.turnId,
  );
  const next = { ...request, turnId: "next", invocationDigest: "b".repeat(64) };
  expect(await decide(next, deps, { phase: "dispatch" })).toMatchObject({
    status: "allow",
    authorizedBy: { authorizedBy: "policy" },
  });
  for (const change of [{ category: "delete" as const }, { origin: "https://other.test/mail" }]) {
    expect(await decide({ ...next, ...change }, deps, { phase: "dispatch" })).toMatchObject({
      status: "ask",
    });
  }
  await settings.set({ agentPolicies: [], agentPolicyRevision: 1 });
  expect(await decide(next, deps, { phase: "preflight" })).toMatchObject({ status: "ask" });
});
it("an accepted exact action that expires before dispatch requires a fresh approval", async () => {
  const { deps, request } = fixture();
  let clock = 1000;
  const timed = { ...deps, now: () => clock };
  const first = await decide(request, timed, { phase: "preflight" });
  if (first.status !== "ask" || !first.suspension.approvalId) throw new Error("Missing approval");
  const id = first.suspension.approvalId;
  const expiresAt = deps.approvals.pending("chat", clock)[0]!.expiresAt;
  deps.approvals.decideLocal({ decision: "accept", approvalId: id }, request.turnId, clock);
  clock = expiresAt + 1;
  const result = await decide(request, timed, { phase: "dispatch", approvalId: id });
  expect(result).toMatchObject({ status: "ask", suspension: { kind: "approval" } });
  if (result.status !== "ask") throw new Error("Expected fresh approval");
  expect(result.suspension.approvalId).not.toBe(id);
  expect(deps.approvals.pending("chat", clock)).toHaveLength(1);
});
it("headless work uses the same exact site policy and retains unapproved consequences for review", async () => {
  const { deps, request, settings } = fixture();
  await settings.set({
    agentPolicies: [{ category: "send", site: "https://example.test", access: "allow" }],
    agentPolicyRevision: 0,
  });
  expect(await decide(request, deps, { phase: "dispatch", headless: true })).toMatchObject({
    status: "allow",
  });
  const parked = await decide({ ...request, origin: "https://other.test/" }, deps, {
    phase: "dispatch",
    headless: true,
  });
  expect(parked).toMatchObject({ status: "ask", suspension: { kind: "approval" } });
  expect(deps.approvals.pending("chat")).toHaveLength(1);
  expect(
    await decide({ ...request, category: "password_change" }, deps, { phase: "dispatch", headless: true }),
  ).toMatchObject({ status: "ask", suspension: { kind: "handoff" } });
});
