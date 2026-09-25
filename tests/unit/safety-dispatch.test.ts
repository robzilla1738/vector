import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { EventBus, NullNativeBridge, PageService, Repo, openDb } from "@aux/runtime";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { Step } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SafetyDispatchGate, type SafetyDispatchDeps } from "../../apps/runtime/src/safety/dispatch.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

function fixture(judge?: SafetyDispatchDeps["judge"]) {
  const db = openDb(":memory:"); databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const approvals = new ApprovalStore(db);
  const calls: string[] = [];
  let current = "https://allowed.test/form";
  let driverEvents: DriverPageEvents = {};
  let access: "allow" | "deny" = "allow";
  const gate = new SafetyDispatchGate({
    approvals,
    managedRules: () => [],
    userRules: () => [{ origin: "https://allowed.test/", access, confirmation: "none" }],
    localCeiling: () => "always",
    audit: () => {},
    judge,
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
      setEvents: (value: DriverPageEvents) => { driverEvents = value; }, dispose: async () => {},
    }) as unknown as DriverPage,
  };
  const pages = new PageService({ repo, events, native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }), grants: ["effect:read", "effect:write"],
    profileId: "profile-1", safetyGate: gate });
  return { pages, calls, approvals, gate, setAccess: (value: "allow" | "deny") => { access = value; },
    navigateExternally: (url: string, epoch: number) => { current = url; driverEvents.onNavigated?.(url, epoch); } };
}

describe("B5 live dispatch gate", () => {
  it("requires a one-time credential approval even when the origin rule says none", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const approvals = new ApprovalStore(db);
    const gate = new SafetyDispatchGate({ approvals, managedRules: () => [],
      userRules: () => [{ origin: "https://allowed.test/", access: "allow", confirmation: "none" }],
      localCeiling: () => "always", audit: () => {} });
    const step: Step = { id: "saved-password", op: "fillCredential", passwordSelector: "#password" };
    const digest = createHash("sha256").update(JSON.stringify(step)).digest("hex");
    const context = { profileId: "profile-1", scope: { kind: "task" as const, id: "task-1" },
      turnId: "turn-1", threadId: "thread-1", turnToolCallCount: 1,
      review: { artifactId: "review-1", turnId: "turn-1", action: "fillCredential", effect: "credential" as const,
        invocationDigest: digest, dataDescription: "Saved password", destination: "allowed.test",
        consequence: "Fill the active sign-in form", createdAt: Date.now() } };
    const request = await gate.check({ step, origin: "https://allowed.test/form", context, phase: "preflight" })
      .catch(error => error) as { detail?: { requestId?: string } };
    const approvalId = request.detail?.requestId;
    expect(approvalId).toBeTruthy();
    approvals.decideLocal({ decision: "accept", approvalId: approvalId! }, "turn-1");
    expect(await gate.check({ step, origin: "https://allowed.test/form",
      context: { ...context, approvalId }, phase: "dispatch" })).toMatchObject({ authorizedBy: "approval", approvalId });
  });

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

  it("does not click a replaced same-origin document after Guardian awaits", async () => {
    let release!: () => void;
    let entered!: () => void;
    const judging = new Promise<void>(resolve => { entered = resolve; });
    const pending = new Promise<void>(resolve => { release = resolve; });
    const { pages, calls, navigateExternally } = fixture(async () => { entered(); await pending; return []; });
    const page = await pages.open({ url: "https://allowed.test/form", background: true, ownedByRuntime: true });
    const run = pages.execute({ pageId: page.pageId, steps: [{ id: "step-stale", op: "click", target: "#submit" }] },
      { safety: { steps: { "step-stale": { restrictedRetry: true } } } });
    await judging;
    navigateExternally("https://allowed.test/next-document", (pages.get(page.pageId).documentEpoch ?? 0) + 1);
    release();
    const result = await run;
    expect(calls).toEqual([]);
    expect(result.steps[0]).toMatchObject({ status: "failed", error: { code: "ref_stale" } });
  });

  it("requires an exact action approval even with an always ceiling or standing grant", async () => {
    const db = openDb(":memory:"); databases.push(db);
    const approvals = new ApprovalStore(db);
    const gate = new SafetyDispatchGate({ approvals, managedRules: () => [],
      userRules: () => [{ origin: "https://allowed.test/", access: "allow", confirmation: "action" }],
      localCeiling: () => "always", audit: () => {} });
    const step: Step = { id: "step-consent", op: "click", target: "#submit" };
    const digest = createHash("sha256").update(JSON.stringify(step)).digest("hex");
    const context = { profileId: "profile-1", scope: { kind: "task" as const, id: "task-1" },
      turnId: "turn-1", threadId: "thread-1", sessionId: "session-1", turnToolCallCount: 1,
      review: { artifactId: "review-1", turnId: "turn-1", action: "click", effect: "write" as const,
        invocationDigest: digest, dataDescription: "Form fields", destination: "allowed.test",
        consequence: "Submit", createdAt: Date.now() } };
    approvals.grant({ profileId: context.profileId, scope: context.scope, turnId: context.turnId,
      threadId: context.threadId, effect: "write", action: "click", invocationDigest: digest,
      origin: "https://allowed.test/", requestedAt: 1 }, "always");
    const input = { step, origin: "https://allowed.test/form", context, phase: "dispatch" as const };
    const pending = await gate.check(input).catch(error => error) as { detail?: { requestId?: string } };
    const approvalId = pending.detail?.requestId;
    expect(approvalId).toBeTruthy();
    approvals.decideLocal({ decision: "accept", approvalId: approvalId! }, "turn-1");
    expect(await gate.check({ ...input, context: { ...context, approvalId } })).toMatchObject({ authorizedBy: "approval", approvalId });
    await expect(gate.check({ ...input, context: { ...context, approvalId } })).rejects.toMatchObject({ code: "needs_input" });
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
