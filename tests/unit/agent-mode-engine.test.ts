import { afterEach, expect, it, vi } from "vitest";
import { EffectRequestSchema, type EffectRequest } from "@aux/contracts";
import { ApprovalStore, DecisionJournal, Repo, SettingsService, SafetyDispatchGate, decide, openDb } from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const dispose of cleanup.splice(0)) dispose(); });
function fixture(mode: "auto" | "ask" | "full" = "auto") {
  const db = openDb(":memory:");
  const repo = new Repo(db);
  repo.setSetting("agentMode", mode);
  const settings = new SettingsService(repo, "/nonexistent/aux-policy-test-settings.json", {});
  const approvals = new ApprovalStore(db, () => {}, (action) => settings.allowAgentSite(action), () => settings.agentPolicy());
  const deps = { approvals, journal: new DecisionJournal(db), managedRules: () => [], agentPolicy: () => settings.agentPolicy(), audit: vi.fn() };
  cleanup.push(() => { repo.flush(); db.close(); });
  const request = (category: EffectRequest["category"], extra: Partial<EffectRequest> = {}) => EffectRequestSchema.parse({
    profileId: "profile", scope: { kind: "task", id: "task" }, actor: "builtin_agent", effect: "write", category,
    action: "click", origin: "https://site.test/", dataClasses: [], provenance: "page", invocationDigest: "a".repeat(64),
    turnId: "turn", threadId: "thread", requestedAt: Date.now(), ...extra,
  });
  return { db, repo, settings, approvals, deps, request };
}

it("allows Auto consequences, asks in Ask mode, and retains the same headless suspension", async () => {
  const f = fixture();
  expect(await decide(f.request("send"), f.deps, { phase: "dispatch" })).toMatchObject({ status: "allow" });
  await f.settings.set({ agentMode: "ask", agentPolicyRevision: 0 });
  const result = await decide(f.request("send"), f.deps, { phase: "dispatch", headless: true });
  expect(result).toMatchObject({ status: "ask", suspension: { kind: "approval" } });
  expect(f.approvals.pending("thread")).toHaveLength(1);
});

it("requires exact native device authentication and consumes it once, rejecting ordinary accept and changed fingerprints", async () => {
  const f = fixture();
  const request = f.request("purchase", { amount: 42 });
  const pending = await decide(request, f.deps, { phase: "dispatch" });
  if (pending.status !== "ask" || !pending.suspension.approvalId) throw new Error("Expected device suspension");
  expect(pending.suspension.kind).toBe("touch-id");
  const id = pending.suspension.approvalId;
  expect(() => f.approvals.decideLocal({ decision: "accept", approvalId: id }, "turn")).toThrow(/device authentication/);
  expect(() => f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: id }, "turn")).toThrow(/device authentication/);
  const proof = f.approvals.prepareDevice(id, "turn");
  expect(() => f.approvals.confirmDevice(id, "turn", "b".repeat(64))).toThrow();
  f.approvals.confirmDevice(id, "turn", proof.fingerprint);
  expect(await decide({ ...request, amount: 43 }, f.deps, { phase: "dispatch", approvalId: id })).toMatchObject({ status: "ask", suspension: { kind: "touch-id" } });
  expect(await decide(request, f.deps, { phase: "dispatch", approvalId: id })).toMatchObject({ status: "allow" });
  expect(await decide(request, f.deps, { phase: "dispatch", approvalId: id })).toMatchObject({ status: "ask" });
});

it("persists site Always allow as policy atomically and rejects stale settings revisions", async () => {
  const f = fixture("ask");
  const pending = await decide(f.request("send"), f.deps, { phase: "dispatch" });
  if (pending.status !== "ask" || !pending.suspension.approvalId) throw new Error("Expected approval");
  f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: pending.suspension.approvalId }, "turn");
  expect(f.settings.agentPolicy()).toMatchObject({ agentPolicyRevision: 1, agentPolicies: [{ category: "send", site: "https://site.test", access: "allow" }] });
  expect(await decide(f.request("send", { invocationDigest: "b".repeat(64) }), f.deps, { phase: "dispatch" })).toMatchObject({ status: "allow" });
  await expect(f.settings.set({ agentMode: "full", agentPolicyRevision: 0 })).rejects.toMatchObject({ code: "conflict" });
  const failing = new ApprovalStore(f.db, () => {}, () => { throw new Error("policy write failed"); }, () => f.settings.agentPolicy());
  // A separate asked category proves a failed writer cannot consume its acceptance.
  const other = await decide(f.request("post"), f.deps, { phase: "dispatch" });
  if (other.status !== "ask" || !other.suspension.approvalId) throw new Error("Expected approval");
  expect(() => failing.decideLocal({ decision: "acceptForOrigin", approvalId: other.suspension.approvalId! }, "turn")).toThrow("policy write failed");
  expect(f.approvals.pending("thread").some((item) => item.approvalId === other.suspension.approvalId)).toBe(true);
});

it("retains unconditional model-evaluate and permission mutation denies plus account-security handoff", async () => {
  const f = fixture("full");
  expect(await decide(f.request("evaluate", { action: "evaluate" }), f.deps, { phase: "dispatch" })).toMatchObject({ status: "deny", refusalId: "evaluate_unreachable" });
  expect(await decide(f.request("external_tool", { action: "settings.set" }), f.deps, { phase: "dispatch" })).toMatchObject({ status: "deny" });
  expect(await decide(f.request("password_change"), f.deps, { phase: "dispatch" })).toMatchObject({ status: "ask", suspension: { kind: "handoff" } });
});

it("fences mode changes through field preparation", async () => {
  const f = fixture();
  const gate = new SafetyDispatchGate(f.deps);
  const fence = gate.policyFence();
  await f.settings.set({ agentMode: "ask", agentPolicyRevision: 0 });
  expect(fence).toThrow(/permissions changed/);
  await f.settings.set({ agentMode: "auto", agentPolicyRevision: 1 });

});

it("requires device proof for money and credentials asked by mode or explicit override", async () => {
  for (const category of ["purchase", "credential"] as const) {
    const f = fixture("ask");
    for (const explicit of [false, true]) {
      if (explicit) await f.settings.set({ agentMode: "full", agentPolicyRevision: 0, agentPolicies: [{ category: category === "purchase" ? "money" : "credentials", access: "ask" }] });
      const result = await decide(f.request(category), f.deps, { phase: "dispatch" });
      if (result.status !== "ask" || !result.suspension.approvalId) throw new Error("Expected device approval");
      expect(result.suspension.kind).toBe("touch-id");
      expect(() => f.approvals.decideLocal({ decision: "accept", approvalId: result.suspension.approvalId! }, "turn")).toThrow(/device authentication/);
    }
  }
});

it("fences ordinary acceptance, Always allow, and prepared native proof by the actual policy revision", async () => {
  const f = fixture("ask");
  const ordinary = await decide(f.request("send"), f.deps, { phase: "dispatch" });
  const device = await decide(f.request("purchase"), f.deps, { phase: "dispatch" });
  if (ordinary.status !== "ask" || !ordinary.suspension.approvalId || device.status !== "ask" || !device.suspension.approvalId) throw new Error("Expected pending actions");
  const proof = f.approvals.prepareDevice(device.suspension.approvalId, "turn");
  expect(proof.policyRevision).toBe(0);
  await f.settings.set({ agentMode: "ask", agentPolicyRevision: 0 });
  expect(() => f.approvals.decideLocal({ decision: "accept", approvalId: ordinary.suspension.approvalId! }, "turn")).toThrow(/permissions changed/);
  expect(() => f.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: ordinary.suspension.approvalId! }, "turn")).toThrow(/permissions changed/);
  expect(() => f.approvals.confirmDevice(device.suspension.approvalId!, "turn", proof.fingerprint)).toThrow(/permissions changed/);
  expect(f.settings.agentPolicy().agentPolicies).toEqual([]);
  const fresh = await decide(f.request("send"), f.deps, { phase: "dispatch", approvalId: ordinary.suspension.approvalId });
  expect(fresh).toMatchObject({ status: "ask" });
  if (fresh.status !== "ask") throw new Error("Expected fresh action");
  expect(fresh.suspension.approvalId).not.toBe(ordinary.suspension.approvalId);
});

it("authenticates credentials once per exact Profile site in Auto while retaining Ask, money, and lock fences", async () => {
  const f = fixture();
  const credential = f.request("credential", { action: "fillCredential" });
  const first = await decide(credential, f.deps, { phase: "dispatch" });
  if (first.status !== "ask" || !first.suspension.approvalId) throw new Error("Expected device request");
  const proof = f.approvals.prepareDevice(first.suspension.approvalId, "turn");
  f.approvals.confirmDevice(first.suspension.approvalId, "turn", proof.fingerprint);
  expect(await decide(credential, f.deps, { phase: "dispatch" })).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "approval" } });
  f.approvals.retireTurn("turn", "thread");
  expect(await decide({ ...credential, turnId: "next", invocationDigest: "b".repeat(64) }, f.deps, { phase: "dispatch" })).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "policy" } });
  for (const change of [{ profileId: "other-profile" }, { origin: "https://other.test/" }, { origin: "http://site.test/" }])
    expect(await decide({ ...credential, ...change }, f.deps, { phase: "dispatch" })).toMatchObject({ status: "ask", suspension: { kind: "touch-id" } });
  expect(await decide(f.request("purchase"), f.deps, { phase: "dispatch" })).toMatchObject({ status: "ask", suspension: { kind: "touch-id" } });
  await f.settings.set({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [{ category: "credentials", access: "ask" }] });
  expect(await decide(credential, f.deps, { phase: "dispatch" })).toMatchObject({ status: "ask", suspension: { kind: "touch-id" } });
  f.approvals.clearDeviceAuthentication();
  await f.settings.set({ agentMode: "auto", agentPolicyRevision: 1, agentPolicies: [] });
  expect(await decide(credential, f.deps, { phase: "dispatch" })).toMatchObject({ status: "ask", suspension: { kind: "touch-id" } });
});
