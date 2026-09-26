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

  it("denies page-JS evaluation by default even on an https origin", async () => {
    const { db, deps } = fixture();
    const evalStep: Step = { id: "e1", op: "evaluate", expression: "1+1" };
    const request = effectRequestForStep({
      step: evalStep, origin: "https://shop.test/checkout",
      profileId: "p1", scope: { kind: "task", id: "t1" },
      turnId: "turn-1", threadId: "thread-1",
      digest: createHash("sha256").update(JSON.stringify(evalStep)).digest("hex"), at: 500,
    });
    const decision = await decide(request, deps, { phase: "dispatch" });
    expect(decision).toMatchObject({ status: "deny", refusalId: "origin_policy_denied" });
    expect(decisions(db)).toEqual([{ status: "deny", source: "default" }]);
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
});
