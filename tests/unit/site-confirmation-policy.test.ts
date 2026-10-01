import { afterEach, expect, it } from "vitest";
import { EffectRequestSchema, type OriginRule } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { decide, DecisionJournal, type DecideDeps } from "../../apps/runtime/src/safety/decide.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });
function fixture() {
  const db = openDb(":memory:"); databases.push(db); const approvals = new ApprovalStore(db);
  let rules: OriginRule[] = [{ origin: "https://example.test/", access: "allow", confirmation: "none" }];
  const deps: DecideDeps = { approvals, journal: new DecisionJournal(db), managedRules: () => [], userRules: () => rules, localCeiling: () => "always", audit: () => {} };
  const request = EffectRequestSchema.parse({ profileId: "p", scope: { kind: "task", id: "first" }, actor: "builtin_agent", effect: "write", action: "click", category: "login", origin: "https://example.test/login", dataClasses: [], provenance: "page", invocationDigest: "a".repeat(64), turnId: "first", threadId: "chat", requestedAt: 1 });
  return { deps, request, setRules: (next: OriginRule[]) => { rules = next; } };
}
it("always-origin consent removes only repeated preapprovable sheets; delete still asks and revoke restores the sheet", async () => {
  const { deps, request } = fixture();
  const first = await decide(request, deps, { phase: "preflight" });
  expect(first).toMatchObject({ status: "ask", suspension: { kind: "approval" } });
  if (first.status !== "ask" || !first.suspension.approvalId) throw new Error("Missing approval");
  deps.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: first.suspension.approvalId }, request.turnId);
  const next = { ...request, scope: { kind: "task" as const, id: "next" }, turnId: "next", invocationDigest: "b".repeat(64) };
  expect(await decide(next, deps, { phase: "preflight" })).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "standing" } });
  expect(await decide({ ...next, category: "delete" }, deps, { phase: "preflight" })).toMatchObject({ status: "ask" });
  deps.approvals.revoke({ profileId: "p", grantId: deps.approvals.listGrants("p")[0]!.grantId });
  expect(await decide(next, deps, { phase: "preflight" })).toMatchObject({ status: "ask" });
});
it("stores final policy and context-sensitive tiers so login cannot bypass escalation", async () => {
  const { deps, request, setRules } = fixture();
  setRules([{ origin: "https://example.test/", access: "allow", confirmation: "action" }]);
  const restricted = await decide(request, deps, { phase: "preflight" });
  expect(restricted.status).toBe("ask");
  expect(deps.approvals.pending("chat")[0]!.action.confirmation).toBe("action");
  setRules([{ origin: "https://example.test/", access: "allow", confirmation: "none" }]);
  const sensitive = { ...request, turnId: "sensitive", invocationDigest: "b".repeat(64) };
  expect(await decide(sensitive, deps, { phase: "preflight", sensitiveData: true })).toMatchObject({ status: "ask" });
  const pending = deps.approvals.pending("chat").find(item => item.action.turnId === "sensitive")!;
  expect(pending.action.confirmation).toBe("action");
  expect(() => deps.approvals.decideLocal({ decision: "acceptForOrigin", approvalId: pending.approvalId }, "sensitive")).toThrow("Only login");
});

it("rejects approval that expires while Guardian is awaiting the dispatch decision", async () => {
  const { deps, request } = fixture();
  let clock = 1000;
  deps.now = () => clock;
  const first = await decide(request, deps, { phase: "preflight" });
  if (first.status !== "ask" || !first.suspension.approvalId) throw new Error("Missing approval");
  const approvalId = first.suspension.approvalId;
  const expiresAt = deps.approvals.pending("chat", clock)[0]!.expiresAt;
  deps.approvals.decideLocal({ decision: "accept", approvalId }, request.turnId, clock);
  let release!: () => void, entered!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  const judging = new Promise<void>(resolve => { entered = resolve; });
  deps.judge = async () => { entered(); await held; return []; };
  const dispatch = decide(request, deps, { phase: "dispatch", approvalId, restrictedRetry: true });
  await judging;
  clock = expiresAt + 1;
  release();
  const result = await dispatch;
  expect(result).toMatchObject({ status: "ask", suspension: { kind: "approval" } });
  if (result.status !== "ask") throw new Error("Expected a fresh approval");
  expect(result.suspension.approvalId).not.toBe(approvalId);
  expect(deps.approvals.pending("chat", clock)).toHaveLength(1);
});
