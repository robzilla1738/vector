import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import { EventBus, NullNativeBridge, PageService, Repo, openDb, DurableWriteLedger } from "@aux/runtime";
import type { BrowserDriver, DriverPage, DriverPageEvents } from "@aux/chromium-driver";
import type { Step } from "@aux/contracts";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";

const databases: ReturnType<typeof openDb>[] = [];
afterEach(() => {
  for (const db of databases.splice(0)) db.close();
});

function fixture(
  prepareOrigin?: () => Promise<string>,
  initialAccess: "allow" | "ask" | "block" = "ask",
  journal = false,
  onNavigate?: (url: string) => void,
) {
  const db = openDb(":memory:");
  databases.push(db);
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const durable = journal ? new DurableWriteLedger(db) : undefined;
  const approvals = new ApprovalStore(db);
  const calls: string[] = [];
  let current = "https://allowed.test/form";
  let driverEvents: DriverPageEvents = {};
  let access: "allow" | "ask" | "block" = initialAccess;
  const confirmations: string[] = [];
  const gate = new SafetyDispatchGate({
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    agentPolicy: () => ({
      agentMode: "auto",
      agentPolicyRevision: 0,
      agentPolicies: [{ category: "click", access }],
    }),
    audit: () => {},
    onConfirmation: (value) => {
      if (!value.approvalId) throw new Error("Expected an actual approval");
      confirmations.push(value.approvalId);
    },
  });
  const driver: BrowserDriver = {
    backend: "aux",
    connect: async () => {},
    disconnect: async () => {},
    isConnected: () => true,
    listTargets: async () => [],
    createTarget: async () => "target-1",
    attach: async (_targetId, pageId) =>
      ({
        identity: { pageId, targetId: "target-1", backend: "aux" },
        url: () => current,
        title: async () => "Form",
        isAttached: () => true,
        navigate: async (url: string) => {
          current = url;
          onNavigate?.(url);
        },
        originForTarget: prepareOrigin,
        click: async () => {
          calls.push("click");
          if (calls.length === 1) current = "https://blocked.test/";
        },
        observe: async () => ({
          url: current,
          title: "Form",
          viewport: { width: 800, height: 600, scale: 1 },
          scroll: { x: 0, y: 0, maxY: 0 },
          frames: [{ frame: "main", url: current, sameOrigin: true }],
          text: "Form",
          headings: [],
          elements: [],
          formFields: [],
          tables: [],
          links: [],
          dialogs: [],
          console: [],
          truncated: false,
          stats: { elementsTotal: 0, elementsShown: 0, textChars: 4, approxTokens: 1 },
        }),
        setEvents: (value: DriverPageEvents) => {
          driverEvents = value;
        },
        dispose: async () => {},
      }) as unknown as DriverPage,
  };
  const pages = new PageService({
    turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
      pages.get(pageId),
    ),
    repo,
    events,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: driver, chrome: null }),
    profileId: "profile-1",
    safetyGate: gate,
    durableWrites: durable,
  });
  return {
    repo,
    durable,
    pages,
    calls,
    approvals,
    gate,
    confirmations,
    setAccess: (value: "allow" | "ask" | "block") => {
      access = value;
    },
    navigateExternally: (url: string, epoch: number) => {
      current = url;
      driverEvents.onNavigated?.(url, epoch);
    },
  };
}

describe("B5 live dispatch gate", () => {
  it("does not click a direct page action until the person allows it, then clicks once", async () => {
    const db = openDb(":memory:");
    databases.push(db);
    const repo = new Repo(db);
    const approvals = new ApprovalStore(db);
    const confirmations: string[] = [];
    const calls: string[] = [];
    const gate = new SafetyDispatchGate({
      approvals,
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({
        agentMode: "ask",
        agentPolicyRevision: 0,
        agentPolicies: [{ category: "click", access: "ask" }],
      }),
      audit: () => {},
      onConfirmation: (confirmation) => {
        if (!confirmation.approvalId) throw new Error("Expected an actual approval");
        confirmations.push(confirmation.approvalId);
      },
    });
    const driver: BrowserDriver = {
      backend: "aux",
      connect: async () => {},
      disconnect: async () => {},
      isConnected: () => true,
      listTargets: async () => [],
      createTarget: async () => "target-1",
      attach: async (_targetId, pageId) =>
        ({
          identity: { pageId, targetId: "target-1", backend: "aux" },
          url: () => "https://shop.test/form",
          title: async () => "Form",
          isAttached: () => true,
          navigate: async () => {},
          click: async () => {
            calls.push("click");
          },
          observe: async () => ({
            url: "https://shop.test/form",
            title: "Form",
            viewport: { width: 800, height: 600, scale: 1 },
            scroll: { x: 0, y: 0, maxY: 0 },
            frames: [{ frame: "main", url: "https://shop.test/form", sameOrigin: true }],
            text: "Form",
            headings: [],
            elements: [],
            formFields: [],
            tables: [],
            links: [],
            dialogs: [],
            console: [],
            truncated: false,
            stats: { elementsTotal: 0, elementsShown: 0, textChars: 4, approxTokens: 1 },
          }),
          setEvents: () => {},
          dispose: async () => {},
        }) as unknown as DriverPage,
    };
    const pages = new PageService({
      turnMentions: fixtureTurnMentions((pageId: string): import("@aux/contracts").PageTarget | undefined =>
        pages.get(pageId),
      ),
      repo,
      events: new EventBus(repo),
      native: new NullNativeBridge(),
      drivers: () => ({ aux: driver, chrome: null }),
      profileId: "profile-1",
      safetyGate: gate,
    });
    const page = await pages.open({ url: "https://shop.test/form", background: true, ownedByRuntime: true });
    const program = {
      pageId: page.pageId,
      steps: [{ id: "submit-form", op: "click" as const, target: "css:#send" }],
    };
    await expect(pages.execute(program)).rejects.toMatchObject({ code: "needs_input" });
    expect(calls).toEqual([]);
    expect(confirmations).toHaveLength(1);
    approvals.decideLocal({ decision: "accept", approvalId: confirmations[0]! }, `direct:${page.pageId}`);
    const result = await pages.execute(program);
    expect(result.steps[0]).toMatchObject({ status: "ok" });
    expect(calls).toEqual(["click"]);
    expect(confirmations).toHaveLength(1);
    await expect(pages.execute(program)).rejects.toMatchObject({ code: "needs_input" });
    expect(calls).toEqual(["click"]);
    expect(confirmations).toHaveLength(2);
  });

  it("requires trusted device proof for a credential fill", async () => {
    const db = openDb(":memory:");
    databases.push(db);
    const approvals = new ApprovalStore(db);
    const gate = new SafetyDispatchGate({
      approvals,
      journal: new DecisionJournal(db),
      managedRules: () => [],
      agentPolicy: () => ({ agentMode: "auto", agentPolicyRevision: 0, agentPolicies: [] }),
      audit: () => {},
    });
    const step: Step = { id: "saved-password", op: "fillCredential", passwordSelector: "#password" };
    const digest = createHash("sha256").update(JSON.stringify(step)).digest("hex");
    const context = {
      profileId: "profile-1",
      scope: { kind: "task" as const, id: "task-1" },
      turnId: "turn-1",
      threadId: "thread-1",
      turnToolCallCount: 1,
      review: {
        artifactId: "review-1",
        turnId: "turn-1",
        action: "fillCredential",
        effect: "credential" as const,
        invocationDigest: digest,
        dataDescription: "Saved password",
        destination: "allowed.test",
        consequence: "Fill the active sign-in form",
        createdAt: Date.now(),
      },
    };
    const request = (await gate
      .check({ step, origin: "https://allowed.test/form", context, phase: "preflight" })
      .catch((error) => error)) as { detail?: { requestId?: string } };
    const approvalId = request.detail?.requestId;
    expect(approvalId).toBeTruthy();
    const proof = approvals.prepareDevice(approvalId!, "turn-1");
    approvals.confirmDevice(approvalId!, "turn-1", proof.fingerprint);
    expect(
      await gate.check({
        step,
        origin: "https://allowed.test/form",
        context: { ...context, approvalId },
        phase: "dispatch",
      }),
    ).toMatchObject({ authorizedBy: "approval", approvalId });
  });

  it("consumes exact approval at the first origin and asks again after an origin change", async () => {
    const { pages, calls, approvals, confirmations } = fixture();
    const page = await pages.open({
      url: "https://allowed.test/form",
      background: true,
      ownedByRuntime: true,
    });
    const program = {
      pageId: page.pageId,
      steps: [
        { id: "step-1", op: "click" as const, target: "#save" },
        { id: "step-2", op: "click" as const, target: "#save-again" },
      ],
    };
    await expect(pages.execute(program)).rejects.toMatchObject({ code: "needs_input" });
    expect(calls).toEqual([]);
    expect(confirmations).toHaveLength(1);
    const approvalId = confirmations[0]!;
    approvals.decideLocal({ decision: "accept", approvalId }, `direct:${page.pageId}`);
    const result = await pages.execute(program);
    expect(calls).toEqual(["click"]);
    expect(result.steps[0]).toMatchObject({
      status: "ok",
      authorization: { authorizedBy: "approval", approvalId },
    });
    expect(result.steps[1]).toMatchObject({ status: "failed", error: { code: "needs_input" } });
    expect(confirmations).toHaveLength(2);
    expect(approvals.pending(`page:${page.pageId}`).map((value) => value.action.origin)).toEqual([
      "https://blocked.test/",
    ]);
  });

  it("fails closed before dispatch when an origin policy is revoked", async () => {
    const { pages, calls, setAccess } = fixture();
    const page = await pages.open({
      url: "https://allowed.test/form",
      background: true,
      ownedByRuntime: true,
    });
    setAccess("block");
    await expect(
      pages.execute({ pageId: page.pageId, steps: [{ id: "step-1", op: "click", target: "#save" }] }),
    ).rejects.toMatchObject({ code: "permission_denied" });
    expect(calls).toEqual([]);
  });

  it.each(["policy", "document"] as const)(
    "rechecks actual %s authority after asynchronous target-origin preparation",
    async (change) => {
      let release!: () => void, entered!: () => void;
      const pending = new Promise<void>((resolve) => {
        release = resolve;
      });
      const preparing = new Promise<void>((resolve) => {
        entered = resolve;
      });
      const f = fixture(async () => {
        entered();
        await pending;
        return "https://allowed.test";
      }, "allow");
      const page = await f.pages.open({
        url: "https://allowed.test/form",
        background: true,
        ownedByRuntime: true,
      });
      const dispatch = f.pages.execute({
        pageId: page.pageId,
        steps: [{ id: "prepared", op: "click", target: "css:#submit" }],
      });
      await preparing;
      if (change === "policy") f.setAccess("block");
      else
        f.navigateExternally(
          "https://allowed.test/next-document",
          (f.pages.get(page.pageId).documentEpoch ?? 0) + 1,
        );
      release();
      const result = await dispatch;
      expect(f.calls).toEqual([]);
      expect(result.steps[0]).toMatchObject({
        status: "failed",
        error: { code: change === "policy" ? "permission_denied" : "ref_stale" },
      });
    },
  );
});

it("resumes an approved guarded batch without replaying its confirmed prefix and isolates uncertainty", async () => {
  const { guardedExecute } = await import("../../apps/runtime/src/agent/guarded-dispatch.js");
  const f = fixture(undefined, "ask", true);
  const page = await f.pages.open({
    url: "https://allowed.test/form",
    background: true,
    ownedByRuntime: true,
  });
  f.repo.db
    .prepare("INSERT INTO runs(run_id,goal,status,created_at) VALUES(?,?,?,?)")
    .run("batch-run", "send", "running", 1);
  const obs = (await f.pages.observe(page.pageId, { scope: "full" })).content;
  const opts = {
    runId: "batch-run",
    actionId: "original-toolcall",
    pageId: page.pageId,
    steps: [
      { id: "one", op: "click" as const, target: "css:#one" },
      { id: "two", op: "click" as const, target: "css:#two" },
    ],
    observation: obs,
    url: obs.url,
    documentEpoch: page.documentEpoch ?? 0,
    exec: { runId: "batch-run", sourcePageCheck: () => {} },
  };
  const dispatch = () => guardedExecute({ pages: f.pages, durable: f.durable }, opts);
  await expect(dispatch()).rejects.toMatchObject({ code: "needs_input" });
  expect(f.calls).toEqual([]);
  expect(f.durable!.unresolved("batch-run")).toEqual([]);
  expect(f.approvals.pending(`page:${page.pageId}`)[0]!.action.reviewedActions).toHaveLength(2);
  f.approvals.decideLocal({ decision: "accept", approvalId: f.confirmations[0]! }, "batch-run");
  const partial = await dispatch();
  expect(partial.kind).toBe("ran");
  expect(f.calls).toEqual(["click"]);
  expect(f.repo.db.prepare("SELECT status FROM action_intents ORDER BY created_at").all()).toEqual([
    { status: "confirmed" },
  ]);
  const pending = f.approvals.pending(`page:${page.pageId}`)[0]!;
  f.approvals.decideLocal({ decision: "accept", approvalId: pending.approvalId }, "batch-run");
  const resumed = await dispatch();
  expect(resumed.kind).toBe("ran");
  expect(f.calls).toEqual(["click", "click"]);
  const unresolved = f.durable!.unresolved("batch-run");
  expect(unresolved).toHaveLength(1);
  expect(unresolved[0]!.summary?.ops).toEqual(["click"]);
  expect(unresolved[0]!.status).toBe("uncertain");
  await expect(dispatch()).rejects.toMatchObject({ code: "conflict" });
  expect(f.calls).toHaveLength(2);
  const transitions = f.repo.db.prepare("SELECT intent_id,status FROM action_transitions ORDER BY seq").all();
  expect(transitions.map((row) => row.status)).toEqual(["pending", "confirmed", "pending", "uncertain"]);
});

it("resolves a destination-only action after navigation instead of preflighting the old document", async () => {
  let navigated = false;
  const f = fixture(
    async () => {
      if (!navigated) throw new Error("Destination target does not exist in the source document");
      return "https://allowed.test";
    },
    "allow",
    false,
    () => {
      navigated = true;
    },
  );
  const page = await f.pages.open({
    url: "https://allowed.test/start",
    background: true,
    ownedByRuntime: true,
  });
  const result = await f.pages.execute({
    pageId: page.pageId,
    steps: [
      { id: "navigate", op: "navigate", url: "https://allowed.test/destination" },
      { id: "destination-action", op: "click", target: "css:#destination-only" },
    ],
  });
  expect(result.status).toBe("completed");
  expect(navigated).toBe(true);
  expect(f.calls).toEqual(["click"]);
});
