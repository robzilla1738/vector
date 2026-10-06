import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import type { AgentPolicySettings, Step } from "@aux/contracts";
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
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

const step: Step = { id: "s1", op: "click", target: "#buy" };
const digest = createHash("sha256").update(JSON.stringify(step)).digest("hex");

function fixture(settings: AgentPolicySettings = { agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }) {
  const db = openDb(":memory:");
  databases.push(db);
  const approvals = new ApprovalStore(db);
  const journal = new DecisionJournal(db);
  const deps: DecideDeps = {
    approvals, journal, managedRules: () => [], agentPolicy: () => settings, audit: () => {},
  };
  const request = effectRequestForStep({
    step,
    origin: "https://shop.test/checkout",
    profileId: "p1",
    scope: { kind: "task", id: "t1" },
    turnId: "turn-1",
    threadId: "thread-1",
    digest,
    at: 500,
  });
  return { db, approvals, journal, deps, request };
}

const decisions = (db: ReturnType<typeof openDb>) =>
  db.prepare("SELECT status, source FROM safety_decisions ORDER BY at").all() as {
    status: string;
    source: string;
  }[];

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
        step: evalStep,
        origin,
        profileId: "p1",
        scope: { kind: "task", id: "t1" },
        turnId: "turn-1",
        threadId: "thread-1",
        digest: createHash("sha256").update(JSON.stringify(evalStep)).digest("hex"),
        at: 500,
      });
    };
    // Model/MCP callers get a named refusal — no approval can unlock evaluate.
    const denied = await decide(evalRequest(), deps, { phase: "dispatch" });
    expect(denied).toMatchObject({ status: "deny", refusalId: "evaluate_unreachable" });
    // Trusted-source programs run, journaled with trusted provenance.
    const allowed = await decide(evalRequest(), deps, { phase: "dispatch", trustedEval: true });
    expect(allowed).toMatchObject({ status: "allow", authorizedBy: { authorizedBy: "policy" } });
    // An explicit deny rule still stops trusted eval.
    const ruled = await decide(
      evalRequest(),
      {
        ...deps,
        managedRules: () => [{ origin: "https://shop.test/", effects: { destructive: "deny" }, access: "ask" }],
      },
      { phase: "dispatch", trustedEval: true },
    );
    expect(ruled).toMatchObject({ status: "deny", refusalId: "origin_policy_denied" });
    expect(decisions(db)).toEqual([
      { status: "deny", source: "origin_resolver" },
      { status: "allow", source: "trusted_source" },
      { status: "deny", source: "managed_policy" },
    ]);
  });

  it("routes runtime web egress through decide() on every redirect hop", async () => {
    const { db, deps } = fixture();
    const egressRequest = (url: URL): EffectRequest =>
      EffectRequestSchema.parse({
        profileId: "p1",
        scope: { kind: "task", id: "t1" },
        actor: "external_token",
        effect: "egress",
        category: "read",
        action: "agent.web.fetch",
        origin: url.origin,
        destination: url.href.slice(0, 2048),
        dataClasses: [],
        provenance: "template",
        invocationDigest: createHash("sha256")
          .update(JSON.stringify(["agent.web.fetch", url.href]))
          .digest("hex"),
        turnId: "rpc:c1",
        threadId: "rpc:c1",
        requestedAt: 600,
      });
    const hops: string[] = [];
    const transport: WebTransport = async (url) => {
      hops.push(url.href);
      return url.hostname === "first.test"
        ? { status: 302, location: "https://second.test/page", contentType: "text/html", body: "" }
        : { status: 200, contentType: "text/plain", body: "hello" };
    };
    const web = new AgentWebTools(async (url) => {
      const decision = await decide(
        egressRequest(url),
        deps,
        { phase: "dispatch", headless: true },
      );
      return decision.status === "allow";
    }, transport);
    const page = await web.fetch("https://first.test/start");
    expect(page.url).toBe("https://second.test/page");
    // Both the entry URL and the redirect target produced journaled decisions.
    expect(decisions(db)).toEqual([
      { status: "allow", source: "default" },
      { status: "allow", source: "default" },
    ]);
    expect(
      db
        .prepare("SELECT DISTINCT origin FROM safety_decisions")
        .all()
        .map((row) => (row as { origin: string }).origin)
        .sort(),
    ).toEqual(["https://first.test", "https://second.test"]);

    // A denied destination never reaches the transport.
    const denied = new AgentWebTools(async (url) => {
      const decision = await decide(
        egressRequest(new URL(url.href.replace(url.hostname, "blocked.test"))),
        { ...deps, agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [{ category: "read", site: "https://blocked.test", access: "block" }] }) },
        { phase: "dispatch", headless: true },
      );
      return decision.status === "allow";
    }, transport);
    await expect(denied.fetch("https://first.test/other")).rejects.toThrow(/not granted|permission/i);
    expect(hops).toHaveLength(2);
  });
});
