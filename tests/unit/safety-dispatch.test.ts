import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { EventBus, NullNativeBridge, PageService, Repo, openDb } from "@aux/runtime";
import type { BrowserDriver, DriverPage } from "@aux/chromium-driver";
import type { Step } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

function fixture() {
  const db = openDb(":memory:"); databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const approvals = new ApprovalStore(db);
  const calls: string[] = [];
  let current = "https://allowed.test/form";
  let access: "allow" | "deny" = "allow";
  const gate = new SafetyDispatchGate({
    approvals,
    managedRules: () => [],
    userRules: () => [{ origin: "https://allowed.test/", access, confirmation: "none" }],
    localCeiling: () => "always",
    audit: () => {},
  });
  const driver: BrowserDriver = {
    backend: "aux", connect: async () => {}, disconnect: async () => {}, isConnected: () => true,
    listTargets: async () => [], createTarget: async () => "target-1",
    attach: async (_targetId, pageId) => ({
      identity: { pageId, targetId: "target-1", backend: "aux" },
      url: () => current, title: async () => "Form", isAttached: () => true,
      navigate: async (url: string) => { current = url; },
      click: async () => { calls.push("click"); if (calls.length === 1) current = "https://blocked.test/"; },
      observe: async () => ({ url: current, title: "Form", viewport: { width: 800, height: 600, scale: 1 },
        scroll: { x: 0, y: 0, maxY: 0 }, frames: [{ frame: "main", url: current, sameOrigin: true }],
        text: "Form", headings: [], elements: [], formFields: [], tables: [], links: [], dialogs: [], console: [],
        truncated: false, stats: { elementsTotal: 0, elementsShown: 0, textChars: 4, approxTokens: 1 } }),
      setEvents: () => {}, dispose: async () => {},
    }) as unknown as DriverPage,
  };
  const pages = new PageService({ repo, events, native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }), grants: ["effect:read", "effect:write"],
    profileId: "profile-1", safetyGate: gate });
  return { pages, calls, approvals, gate, setAccess: (value: "allow" | "deny") => { access = value; } };
}

describe("B5 live dispatch gate", () => {
  it("records policy authorization and blocks a second step after an origin change", async () => {
    const { pages, calls } = fixture();
    const page = await pages.open({ url: "https://allowed.test/form", background: true, ownedByRuntime: true });
    const result = await pages.execute({ pageId: page.pageId, steps: [
      { id: "step-1", op: "click", target: "#save" },
      { id: "step-2", op: "click", target: "#save-again" },
    ] });
    expect(calls).toEqual(["click"]);
    expect(result.steps[0]).toMatchObject({ status: "ok", authorization: { authorizedBy: "policy", policySource: "user" } });
    expect(result.steps[1]).toMatchObject({ status: "failed", error: { code: "permission_denied" } });
  });

  it("fails closed before dispatch when an origin policy is revoked", async () => {
    const { pages, calls, setAccess } = fixture();
    const page = await pages.open({ url: "https://allowed.test/form", background: true, ownedByRuntime: true });
    setAccess("deny");
    await expect(pages.execute({ pageId: page.pageId, steps: [{ id: "step-1", op: "click", target: "#save" }] }))
      .rejects.toMatchObject({ code: "permission_denied" });
    expect(calls).toEqual([]);
  });

  it("rechecks grants after an asynchronous Guardian decision", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const approvals = new ApprovalStore(db);
    const step: Step = { id: "step-race", op: "click", target: "#submit" };
    let release!: () => void;
    let judging!: () => void;
    const entered = new Promise<void>(resolve => { judging = resolve; });
    const pending = new Promise<void>(resolve => { release = resolve; });
    const gate = new SafetyDispatchGate({
      approvals, managedRules: () => [],
      userRules: () => [{ origin: "https://allowed.test/", access: "allow", confirmation: "none" }],
      localCeiling: () => "ask", audit: () => {},
      judge: async () => { judging(); await pending; return []; },
    });
    const context = { profileId: "profile-1", scope: { kind: "task" as const, id: "task-1" },
      turnId: "turn-1", threadId: "thread-1", restrictedRetry: true };
    const grant = approvals.grant({ profileId: context.profileId, scope: context.scope, turnId: context.turnId,
      threadId: context.threadId, effect: "write", action: "click", invocationDigest: "0".repeat(64),
      origin: "https://allowed.test/", requestedAt: 1 }, "always");
    const dispatch = gate.check({ step, origin: "https://allowed.test/form", context, phase: "dispatch" });
    await entered;
    approvals.revoke({ profileId: context.profileId, grantId: grant.grantId });
    release();
    await expect(dispatch).rejects.toMatchObject({ code: "needs_input" });
  });

  it("binds an action-time review and one-time approval to the exact invocation", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const approvals = new ApprovalStore(db);
    const gate = new SafetyDispatchGate({ approvals, managedRules: () => [],
      userRules: () => [{ origin: "https://allowed.test/", access: "allow", confirmation: "action" }],
      localCeiling: () => "ask", audit: () => {} });
    const step: Step = { id: "step-review", op: "click", target: "#submit" };
    const digest = createHash("sha256").update(JSON.stringify(step)).digest("hex");
    const base = { profileId: "profile-1", scope: { kind: "task" as const, id: "task-1" },
      turnId: "turn-1", threadId: "thread-1", turnToolCallCount: 1,
      review: { artifactId: "review-1", turnId: "turn-1", action: "click", effect: "write" as const,
        invocationDigest: digest, dataDescription: "Form fields", destination: "allowed.test",
        consequence: "Submit the form", createdAt: Date.now() } };
    const input = { step, origin: "https://allowed.test/form", context: base, phase: "preflight" as const };
    await expect(gate.check({ ...input, context: { ...base, review: { ...base.review, invocationDigest: "0".repeat(64) } } }))
      .rejects.toMatchObject({ code: "needs_input" });
    const request = await gate.check(input).catch(error => error) as { detail?: { requestId?: string } };
    const approvalId = request.detail?.requestId;
    expect(approvalId).toBeTruthy();
    expect(approvals.pending("thread-1")).toHaveLength(1);
    approvals.decideLocal({ decision: "accept", approvalId: approvalId! }, "turn-1");
    const approved = { ...input, context: { ...base, approvalId } };
    expect(await gate.check(approved)).toMatchObject({ authorizedBy: "approval", approvalId });
    expect(await gate.check({ ...approved, phase: "dispatch" })).toMatchObject({ authorizedBy: "approval", approvalId });
    await expect(gate.check({ ...approved, phase: "dispatch" })).rejects.toMatchObject({ code: "needs_input" });
  });
});
