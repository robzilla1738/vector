import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import type { OriginRule, Step } from "@aux/contracts";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import {
  categoryForOp,
  decide,
  DecisionJournal,
  effectRequestForStep,
  type DecideDeps,
} from "../../apps/runtime/src/safety/decide.js";
import { EffectRequestSchema, type EffectRequest } from "@aux/contracts";
import { AgentWebTools, type WebTransport } from "../../apps/runtime/src/agent/web-tools.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

const step: Step = { id: "s1", op: "click", target: "#buy" };
const digest = createHash("sha256").update(JSON.stringify(step)).digest("hex");

function fixture(userRules: OriginRule[] = [], ceiling: "never" | "ask" | "always" = "ask") {
  const db = openDb(":memory:"); databases.push(db);
  const approvals = new ApprovalStore(db);
  const journal = new DecisionJournal(db);
  const deps: DecideDeps = {
    approvals, journal,
    managedRules: () => [], userRules: () => userRules,
    localCeiling: () => ceiling, audit: () => {},
  };
  const request = effectRequestForStep({
    step, origin: "https://shop.test/checkout",
    profileId: "p1", scope: { kind: "task", id: "t1" },
    turnId: "turn-1", threadId: "thread-1", digest, at: 500,
  });
  return { db, approvals, journal, deps, request };
}

const decisions = (db: ReturnType<typeof openDb>) =>
  db.prepare("SELECT status, source FROM safety_decisions ORDER BY at").all() as { status: string; source: string }[];

describe("S3 decide()", () => {
  it("maps every step op to a stable category", () => {
    expect(categoryForOp("navigate")).toBe("navigate");
    expect(categoryForOp("fill")).toBe("input");
    expect(categoryForOp("click")).toBe("interact");
    expect(categoryForOp("submit")).toBe("submit");
    expect(categoryForOp("fillCredential")).toBe("credential");
    expect(categoryForOp("evaluate")).toBe("evaluate");
    expect(categoryForOp("upload")).toBe("upload");
    expect(categoryForOp("screenshot")).toBe("read");
  });

  it("asks the person to allow a direct page action, then dispatches that approval once", async () => {
    const { deps, request } = fixture();
    const pending = await decide(request, deps, { phase: "preflight" });
    expect(pending).toMatchObject({ status: "ask", suspension: { kind: "approval", instruction: "Allow this action before it runs." } });
    const approvalId = pending.status === "ask" ? pending.suspension.approvalId : undefined;
    expect(approvalId).toBeTruthy();
    deps.approvals.decideLocal({ decision: "accept", approvalId: approvalId! }, "turn-1");
    const allowed = await decide(request, deps, { phase: "dispatch", approvalId });
    expect(allowed).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "approval", approvalId } });
    await expect(decide(request, deps, { phase: "dispatch", approvalId })).resolves.toMatchObject({ status: "ask" });
  });

  it("runs a direct page action once after the person allows it, without the caller presenting the approval", async () => {
    const { deps, request } = fixture();
    const pending = await decide(request, deps, { phase: "preflight" });
    const approvalId = pending.status === "ask" ? pending.suspension.approvalId : undefined;
    expect(approvalId).toBeTruthy();
    deps.approvals.decideLocal({ decision: "accept", approvalId: approvalId! }, "turn-1");
    await expect(decide(request, deps, { phase: "preflight" })).resolves.toMatchObject({
      status: "allow", authorizedBy: { authorizedBy: "approval", approvalId },
    });
    await expect(decide(request, deps, { phase: "dispatch" })).resolves.toMatchObject({
      status: "allow", authorizedBy: { authorizedBy: "approval", approvalId },
    });
    await expect(decide(request, deps, { phase: "dispatch" })).resolves.toMatchObject({ status: "ask" });
  });

  it("asks for action-time confirmation on unruled consequential ops and journals the source", async () => {
    const { db, deps, request } = fixture();
    const decision = await decide(request, deps, { phase: "dispatch", turnToolCallCount: 0 });
    expect(decision).toMatchObject({ status: "ask", suspension: { kind: "action-confirmation" } });
    expect(decisions(db)).toEqual([{ status: "ask", source: "default" }]);
  });

  it("denies untrusted origins and records the refusal", async () => {
    const { db, deps, request } = fixture();
    const decision = await decide({ ...request, origin: "javascript:alert(1)" }, deps, { phase: "dispatch" });
    expect(decision).toMatchObject({ status: "deny", refusalId: "untrusted_origin" });
    expect(decisions(db)).toEqual([{ status: "deny", source: "origin_resolver" }]);
  });

  it("keeps evaluate unreachable for agent callers but allows trusted-source programs", async () => {
    const { db, deps } = fixture();
    const evalRequest = (origin = "https://shop.test/checkout") => {
      const evalStep: Step = { id: "e1", op: "evaluate", expression: "1+1" };
      return effectRequestForStep({
        step: evalStep, origin,
        profileId: "p1", scope: { kind: "task", id: "t1" },
        turnId: "turn-1", threadId: "thread-1",
        digest: createHash("sha256").update(JSON.stringify(evalStep)).digest("hex"), at: 500,
      });
    };
    // Model/MCP callers get a named refusal — no approval can unlock evaluate.
    const denied = await decide(evalRequest(), deps, { phase: "dispatch" });
    expect(denied).toMatchObject({ status: "deny", refusalId: "evaluate_unreachable" });
    // Trusted-source programs run, journaled with trusted provenance.
    const allowed = await decide(evalRequest(), deps, { phase: "dispatch", trustedEval: true });
    expect(allowed).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "policy" } });
    // An explicit deny rule still stops trusted eval.
    const ruled = await decide(evalRequest(), { ...deps, userRules: () => [{ origin: "https://shop.test/", effects: { destructive: "deny" }, access: "ask" }] }, { phase: "dispatch", trustedEval: true });
    expect(ruled).toMatchObject({ status: "deny", refusalId: "origin_policy_denied" });
    expect(decisions(db)).toEqual([
      { status: "deny", source: "origin_resolver" },
      { status: "allow", source: "trusted_source" },
      { status: "deny", source: "user_rule" },
    ]);
  });

  it("issues an approval suspension when consent is required and no grant exists", async () => {
    const { db, deps, request } = fixture([{ origin: "https://shop.test/", access: "allow", confirmation: "action" }]);
    const decision = await decide(request, deps, {
      phase: "dispatch", turnToolCallCount: 1,
      review: { artifactId: "r1", turnId: "turn-1", action: "click", effect: "write",
        invocationDigest: digest, dataDescription: "Cart", destination: "shop.test",
        consequence: "Place order", createdAt: 400 },
    });
    expect(decision.status).toBe("ask");
    const suspension = decision.status === "ask" ? decision.suspension : undefined;
    expect(suspension).toMatchObject({ kind: "approval", approvalId: expect.any(String) });
    expect(decisions(db)).toEqual([{ status: "ask", source: "approval" }]);
  });

  it("hands off credentials rather than approving them", async () => {
    const credStep: Step = { id: "c1", op: "fillCredential", passwordSelector: "#pw" };
    const { db, deps } = fixture();
    const request = effectRequestForStep({
      step: credStep, origin: "https://shop.test/login",
      profileId: "p1", scope: { kind: "task", id: "t1" },
      turnId: "turn-1", threadId: "thread-1",
      digest: createHash("sha256").update(JSON.stringify(credStep)).digest("hex"), at: 500,
    });
    const decision = await decide(request, deps, { phase: "dispatch" });
    expect(decision).toMatchObject({ status: "ask", suspension: { kind: "handoff" } });
    expect("approvalId" in (decision.status === "ask" ? decision.suspension : {})).toBe(false);
    expect(decisions(db)).toEqual([{ status: "ask", source: "default" }]);
  });

  it("collapses asks into a deny when no UI is attached", async () => {
    const { db, deps, request } = fixture();
    const decision = await decide(request, deps, { phase: "dispatch", turnToolCallCount: 0, headless: true });
    expect(decision).toMatchObject({ status: "deny", refusalId: "headless_no_ui" });
    expect(decisions(db)).toEqual([
      { status: "ask", source: "default" },
      { status: "deny", source: "origin_resolver" },
    ]);
  });

  it("allows matched allow-rules with policy provenance", async () => {
    const { db, deps, request } = fixture([{ origin: "https://shop.test/", access: "allow", confirmation: "none" }], "always");
    const decision = await decide(request, deps, { phase: "dispatch" });
    expect(decision).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "policy" } });
    expect(decisions(db)).toEqual([{ status: "allow", source: "default" }]);
  });

  it("denies explicitly denied origins even after the defaults flip", async () => {
    const { deps, request } = fixture([{ origin: "https://shop.test/", access: "deny" }]);
    const decision = await decide(request, deps, { phase: "dispatch" });
    expect(decision).toMatchObject({ status: "deny", refusalId: "origin_policy_denied" });
  });

  it("routes runtime web egress through decide() on every redirect hop", async () => {
    const { db, deps } = fixture();
    const egressRequest = (url: URL): EffectRequest => EffectRequestSchema.parse({
      profileId: "p1", scope: { kind: "task", id: "t1" },
      actor: "external_token", effect: "egress", category: "external_tool",
      action: "agent.web.fetch", origin: url.origin,
      destination: url.href.slice(0, 2048), dataClasses: [], provenance: "template",
      invocationDigest: createHash("sha256").update(JSON.stringify(["agent.web.fetch", url.href])).digest("hex"),
      turnId: "rpc:c1", threadId: "rpc:c1", requestedAt: 600,
    });
    const hops: string[] = [];
    const transport: WebTransport = async (url) => {
      hops.push(url.href);
      return url.hostname === "first.test"
        ? { status: 302, location: "https://second.test/page", contentType: "text/html", body: "" }
        : { status: 200, contentType: "text/plain", body: "hello" };
    };
    const web = new AgentWebTools(async (url) => {
      const decision = await decide(egressRequest(url), { ...deps, localCeiling: () => "always" }, { phase: "dispatch", headless: true });
      return decision.status === "allow";
    }, transport);
    const page = await web.fetch("https://first.test/start");
    expect(page.url).toBe("https://second.test/page");
    // Both the entry URL and the redirect target produced journaled decisions.
    expect(decisions(db)).toEqual([
      { status: "allow", source: "default" },
      { status: "allow", source: "default" },
    ]);
    expect(db.prepare("SELECT DISTINCT origin FROM safety_decisions").all().map(row => (row as { origin: string }).origin).sort())
      .toEqual(["https://first.test", "https://second.test"]);

    // A denied destination never reaches the transport.
    const denied = new AgentWebTools(async (url) => {
      const decision = await decide(
        egressRequest(new URL(url.href.replace(url.hostname, "blocked.test"))),
        { ...deps, userRules: () => [{ origin: "https://blocked.test/", access: "deny" }] },
        { phase: "dispatch", headless: true },
      );
      return decision.status === "allow";
    }, transport);
    await expect(denied.fetch("https://first.test/other")).rejects.toThrow(/not granted|permission/i);
    expect(hops).toHaveLength(2);
  });
});
