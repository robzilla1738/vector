import { afterEach, expect, it, vi } from "vitest";
import type { BrowserContext, Page } from "playwright-core";
import { AuxError, type Observation, type PlanStep } from "@aux/contracts";
import type { LinkedInWorkflowInput, LinkedInWorkflowSource } from "@aux/contracts/linkedin";
import type { DriverPage, PreparedContextAction } from "@aux/chromium-driver";
import {
  EventBus,
  NullNativeBridge,
  openDb,
  Repo,
  DurableWriteLedger,
  TranscriptStore,
  MockModelClient,
  buildToolManifest,
  runAgentLoop,
  resumeAgentLoop,
} from "@aux/runtime";
import { LinkedInWorkflows } from "../../apps/runtime/src/agent/linkedin-workflows.js";
import { sheetsInputsUndispatched } from "../../apps/runtime/src/agent/sheets-workflows.js";
import { AuxWorld } from "../../packages/chromium-driver/src/aux-world.js";
import { initializeFieldCodec } from "../../apps/runtime/src/store/field-codec.js";
import { profileSecrets } from "../support/profile-secrets.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { DecisionJournal } from "../../apps/runtime/src/safety/decide.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { guardedExecute } from "../../apps/runtime/src/agent/guarded-dispatch.js";
import { PageRegistry } from "../../apps/runtime/src/services/pages/registry.js";
import { ProgramExecutor } from "../../apps/runtime/src/services/pages/executor.js";
import { PageLanes } from "../../apps/runtime/src/services/pages/lanes.js";
import { ControlAuthority } from "../../apps/runtime/src/services/pages/control.js";
import { ObservationService } from "../../apps/runtime/src/services/pages/observation.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import type { LoopToolResult } from "../../apps/runtime/src/agent/loop/types.js";
const url = "https://www.linkedin.com/in/alex/";
const message: LinkedInWorkflowInput = {
  operation: "draft-message",
  recipientUrl: url,
  text: "Hello Alex",
  scopeRef: "r1",
};
function fixture() {
  const observation: Observation = {
    observationId: "native-1",
    pageId: "page",
    profileId: "profile",
    documentEpoch: 2,
    revision: 3,
    observedAt: Date.now(),
    scope: "subtree",
    content: {
      url,
      title: "Message Alex",
      viewport: { width: 1000, height: 700, scale: 1 },
      scroll: { x: 0, y: 0, maxY: 0 },
      frames: [],
      text: "Alex\nHello Alex\nSend",
      headings: ["Alex"],
      elements: [
        { ref: "r2", tag: "a", frame: "main", name: "Alex", href: url, selector: {} },
        {
          ref: "r3",
          tag: "textarea",
          frame: "main",
          role: "textbox",
          name: "Write a message",
          value: "Hello Alex",
          selector: {},
        },
        { ref: "r4", tag: "button", frame: "main", role: "button", name: "Send", selector: {} },
      ],
      formFields: [{ ref: "r3", label: "Write a message", value: "Hello Alex" }],
      tables: [],
      links: [{ ref: "r2", text: "Alex", href: url }],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 3, elementsShown: 3, textChars: 20, approxTokens: 5 },
    },
  };
  const source: LinkedInWorkflowSource = {
    authorityDigest: "a".repeat(64),
    runId: "run",
    profileId: "profile",
    workspaceId: "space",
    sessionId: "session",
    pageId: "page",
    url,
    documentEpoch: 2,
    observationId: "native-1",
    observationRevision: 3,
    task: { taskId: "task", revision: 4 },
  };
  return {
    source,
    observation,
    observedScopeRef: "r1",
    observedScopeRole: "dialog",
    unresolvedEffects: false,
  };
}

const repos: Repo[] = [];
afterEach(() => {
  for (const repo of repos.splice(0)) repo.close();
});
async function harness() {
  const db = openDb(":memory:");
  const repo = new Repo(
    db,
    await initializeFieldCodec(db, profileSecrets("linkedin-approval").native, "linkedin-approval"),
  );
  repos.push(repo);
  repo.saveRun({
    runId: "run",
    goal: "Send exact reviewed message",
    status: "running",
    pageIds: ["page"],
    createdAt: Date.now(),
    config: { implementation: "builtin-agent", chatId: "chat", contextWorkspaceId: "space" },
  });
  const policy = {
    agentMode: "ask" as const,
    agentPolicyRevision: 0,
    agentPolicies: [{ category: "send" as const, access: "ask" as const }],
  };
  const approvals = new ApprovalStore(
    repo.db,
    () => {},
    undefined,
    () => policy,
    (id) => repo.getRun(id),
    repo,
  );
  const suspensions = new SuspensionStore(repo.db),
    ledger = new DurableWriteLedger(repo.db);
  const gate = new SafetyDispatchGate({
    approvals,
    suspensions,
    journal: new DecisionJournal(repo.db),
    managedRules: () => [],
    agentPolicy: () => policy,
    audit: () => {},
  });
  let current = fixture(),
    cancelled = false,
    leaseCurrent = true,
    inputEvents = 0,
    nativeNow = 0,
    tokenCount = 0,
    uncertain = false,
    lost = false;
  const liveIds = new Set([1, 2, 3, 4]);
  const tickets = new Map<string, { expiresAt: number; retired: boolean }>();
  const approvalsAtPrepare: unknown[][] = [];
  const send = vi.fn(async (method: string, params: Record<string, unknown> = {}): Promise<unknown> => {
    if (method === "Page.getFrameTree") return { frameTree: { frame: { id: "main" } } };
    if (method === "Page.createIsolatedWorld") return { executionContextId: 7 };
    if (method === "Runtime.evaluate") {
      const ref = /\("(r\d+)"\)/.exec(String(params.expression))?.[1];
      return { result: { objectId: ref } };
    }
    if (method === "DOM.describeNode")
      return { node: { backendNodeId: Number(String(params.objectId).slice(1)) } };
    if (method === "Input.prepareAuxContextAction") {
      const ids = params.context as Record<string, number>;
      if (
        !leaseCurrent ||
        [ids.rootNodeId, ids.recipientNodeId, ids.editorNodeId, ids.actionNodeId].some(
          (id) => !liveIds.has(id!),
        )
      )
        throw new Error("Original native source/nodes retired");
      approvalsAtPrepare.push(repo.db.prepare("SELECT state FROM safety_approval_requests").all());
      const token = (++tokenCount).toString(16).toUpperCase().padStart(32, "0");
      tickets.set(token, { expiresAt: nativeNow + 2000, retired: false });
      return { token };
    }
    if (method === "Input.retireAuxContextAction") {
      tickets.get(String(params.token))!.retired = true;
      return {};
    }
    if (method === "Input.applyAuxContextAction") {
      const ticket = tickets.get(String(params.token));
      if (!ticket || ticket.retired || nativeNow >= ticket.expiresAt || !leaseCurrent || liveIds.size !== 4)
        return { state: "refused" };
      ticket.retired = true;
      inputEvents++;
      if (lost) throw new Error("ACK lost after input");
      return { state: uncertain ? "uncertain" : "applied" };
    }
    return {};
  });
  const session = { on: vi.fn(), send, detach: vi.fn(async () => {}) };
  const world = await AuxWorld.open(
    { newCDPSession: async () => session } as unknown as BrowserContext,
    {} as Page,
  );
  let admitted: PreparedContextAction | undefined;
  const driver = {
    identity: { backend: "aux", pageId: "page", targetId: "target" },
    isAttached: () => true,
    url: () => url,
    title: async () => "LinkedIn",
    setEvents: () => {},
    originForTarget: async () => new URL(url).origin,
    actionTarget: vi.fn(async () => ({
      origin: new URL(url).origin,
      tag: "button",
      type: "button",
      autocomplete: "",
      name: "Send",
    })),
    captureLinkedInContext: vi.fn(world.captureContextAction.bind(world)),
    withContextAction: async <T>(proof: PreparedContextAction, execute: () => Promise<T>) => {
      admitted = proof;
      try {
        return await execute();
      } finally {
        admitted = undefined;
        await proof.retire();
      }
    },
    click: async () => {
      if (!admitted) throw new Error("Missing actual input proof");
      await admitted.apply();
    },
    waitFor: async () => ({ ok: true, timedOut: false }),
  } as unknown as DriverPage;
  const prepareEgress = vi.fn(async () => {});
  const pages: PageRegistry = new PageRegistry({
    repo,
    events: new EventBus(repo),
    native: new NullNativeBridge(),
    profileId: "profile",
    turnMentions: fixtureTurnMentions((id) => pages.get(id)),
    drivers: () => ({ aux: null, chrome: null }),
    safetyGate: gate,
    durableWrites: ledger,
    prepareAgentEgress: prepareEgress,
  });
  pages.addLive(
    {
      ...fixturePage("page", url, 2),
      sessionId: "session",
      workspaceId: "space",
      controller: "agent",
      controllerEpoch: 1,
    },
    driver,
  );
  current.source.sessionId = pages.get("page").sessionId!;
  const executor = new ProgramExecutor(
    pages,
    new PageLanes(pages),
    new ObservationService(pages, new PageLanes(pages)),
    new ControlAuthority(pages),
  );
  const check = () => {
    if (cancelled) throw new AuxError("cancelled", "Original source retired");
  };
  const capture = vi.fn(async () => ({ ...structuredClone(current), checkOwner: check }));
  const act = vi.fn(
    async (
      steps: PlanStep[],
      actionId: string,
      sourceCheck?: () => void,
      precondition?: import("@aux/contracts/linkedin").LinkedInActionPrecondition,
      native?: import("@aux/chromium-driver").ContextActionCapture,
    ): Promise<LoopToolResult> => {
      try {
        const result = await guardedExecute(
          { pages: { execute: executor.execute.bind(executor) }, durable: ledger },
          {
            runId: "run",
            actionId,
            pageId: "page",
            steps,
            observation: current.observation.content,
            url,
            documentEpoch: 2,
            exec: {
              runId: "run",
              sourcePageCheck: sourceCheck,
              linkedInPrecondition: precondition,
              linkedInCapture: native,
            },
          },
        );
        if (result.kind !== "ran") return { output: { [result.kind]: result.reason } };
        return {
          output: {
            status: result.result.status,
            steps: result.result.steps,
            uncertainIntentIds: ledger.unresolved("run").map((i) => i.id),
          },
        };
      } catch (error) {
        const pending = suspensions.pending("run");
        if (error instanceof AuxError && error.code === "needs_input" && pending)
          return {
            park: {
              kind: pending.kind,
              instruction: pending.request.instruction ?? error.message,
              approvalId: pending.request.approvalId,
            },
          };
        throw error;
      }
    },
  );
  const service = new LinkedInWorkflows({
    checkOwner: check,
    capture,
    act,
    approval: (id) => approvals.continuation(id, { runId: "run", turnId: "run", threadId: "chat" }),
    undispatched: (steps, id) => sheetsInputsUndispatched(ledger, steps, id),
  });
  const prepare = async () => {
    const result = await service.invoke({ action: "prepare", request: message }, "prepare");
    if (!("output" in result)) throw Error("Unexpected park");
    return (result.output as { recipeId: string }).recipeId;
  };
  const accept = () => {
    const pending = approvals.pending("chat");
    expect(pending).toHaveLength(1);
    approvals.decideLocal({ approvalId: pending[0]!.approvalId, decision: "accept" }, "run");
    return pending[0]!.approvalId;
  };
  return {
    repo,
    ledger,
    service,
    act,
    capture,
    send,
    driver,
    tickets,
    prepare,
    accept,
    approvals,
    suspensions,
    inputEvents: () => inputEvents,
    advance: () => {
      nativeNow += 60_000;
    },
    replace: (id: number) => liveIds.delete(id),
    cancel: () => {
      cancelled = true;
    },
    retireLease: () => {
      leaseCurrent = false;
    },
    uncertain: () => {
      uncertain = true;
    },
    lost: () => {
      lost = true;
    },
    changeSource: () => {
      current.source.documentEpoch++;
    },
    pages,
    policy,
    prepareEgress,
    approvalsAtPrepare,
  };
}

it("resumes the original tool through real encrypted approval/gate/transcript loop without resolving refs again", async () => {
  const f = await harness(),
    recipeId = await f.prepare();
  const transcript = new TranscriptStore(f.repo.db, f.repo.columnCipher),
    tools = buildToolManifest();
  transcript.append("run", [{ role: "user", content: "Send this exact reviewed message" }]);
  const model = new MockModelClient().scriptToolSteps([
    {
      toolCalls: [
        { toolCallId: "send", toolName: "linkedin_workflow", input: { action: "execute", recipeId } },
      ],
    },
    { text: "Finished" },
  ]);
  const opts = {
    runId: "run",
    threadId: "chat",
    modelId: "mock",
    tools,
    transcript,
    model,
    pageId: "page",
    deps: {
      linkedInWorkflow: (input: unknown, ctx: { actionId: string }) => f.service.invoke(input, ctx.actionId),
    },
  };
  expect(await runAgentLoop(opts)).toMatchObject({ kind: "parked" });
  expect(f.inputEvents()).toBe(0);
  expect(f.tickets.size).toBe(1);
  expect([...f.tickets.values()][0]!.retired).toBe(true);
  const rawApproval = f.repo.db.prepare("SELECT action_json FROM safety_approval_requests").get() as {
    action_json: string;
  };
  expect(rawApproval.action_json).not.toContain("Hello Alex");
  const captures = f.capture.mock.calls.length;
  const targetReads = vi.mocked(f.driver.actionTarget!).mock.calls.length;
  expect(await f.service.invoke({ action: "execute", recipeId }, "run:send:linkedin")).toMatchObject({
    park: { kind: "approval" },
  });
  expect(f.capture).toHaveBeenCalledTimes(captures);
  expect(f.tickets.size).toBe(1);
  f.advance();
  const approvalId = f.accept();
  expect(await resumeAgentLoop(opts, "The user approved the requested action.")).toMatchObject({
    kind: "done",
  });
  expect(f.inputEvents()).toBe(1);
  expect(vi.mocked(f.driver.actionTarget!)).toHaveBeenCalledTimes(targetReads);
  expect(f.tickets.size).toBe(2);
  expect(f.prepareEgress).toHaveBeenCalledTimes(1);
  expect(f.approvalsAtPrepare).toEqual([[], [{ state: "consumed" }]]);
  expect(f.capture).toHaveBeenCalledTimes(captures);
  expect(f.send.mock.calls.filter(([method]) => method === "DOM.describeNode")).toHaveLength(4);
  expect(
    f.repo.db.prepare("SELECT state FROM safety_approval_requests WHERE approval_id=?").get(approvalId),
  ).toEqual({ state: "consumed" });
  await expect(f.service.invoke({ action: "execute", recipeId }, "run:send:linkedin")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.inputEvents()).toBe(1);
});

it.each([1, 2, 3, 4])(
  "refuses replacement original backend node %s without resolving another ref",
  async (id) => {
    const f = await harness(),
      recipeId = await f.prepare();
    expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
      park: { kind: "approval" },
    });
    f.replace(id);
    f.accept();
    expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
      output: { status: "failed", uncertainIntentIds: [] },
    });
    expect(f.inputEvents()).toBe(0);
    expect(f.send.mock.calls.filter(([method]) => method === "DOM.describeNode")).toHaveLength(4);
    await expect(f.service.invoke({ action: "execute", recipeId }, "action")).rejects.toMatchObject({
      code: "ref_stale",
    });
  },
);
it.each(["source", "lease", "close", "deny", "expire"])(
  "retires %s approval continuation without input",
  async (kind) => {
    const f = await harness(),
      recipeId = await f.prepare();
    const parked = await f.service.invoke({ action: "execute", recipeId }, "action");
    if (!("park" in parked)) throw Error("Expected approval");
    if (kind === "deny")
      f.approvals.decideLocal({ approvalId: parked.park.approvalId!, decision: "decline" }, "run");
    else f.accept();
    if (kind === "source") f.cancel();
    if (kind === "lease") f.retireLease();
    if (kind === "close") f.service.close();
    if (kind === "expire") f.repo.db.prepare("UPDATE safety_approval_requests SET expires_at=0").run();
    const outcome = await f.service.invoke({ action: "execute", recipeId }, "action").catch((error) => error);
    expect(outcome).toMatchObject(
      kind === "lease"
        ? { output: { status: "failed", uncertainIntentIds: [] } }
        : { code: kind === "source" ? "cancelled" : "ref_stale" },
    );
    expect(f.inputEvents()).toBe(0);
  },
);
it.each(["uncertain", "lost"])("preserves %s native effect receipt and cannot resume twice", async (kind) => {
  const f = await harness(),
    recipeId = await f.prepare();
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    park: { kind: "approval" },
  });
  f.accept();
  if (kind === "uncertain") f.uncertain();
  else f.lost();
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    output: { status: "failed" },
  });
  expect(f.inputEvents()).toBe(1);
  expect(f.ledger.unresolved("run")).toHaveLength(1);
  await expect(f.service.invoke({ action: "execute", recipeId }, "action")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(f.inputEvents()).toBe(1);
});

it.each(["policy", "authority", "action", "stopDuringAcceptance"])(
  "refuses %s mutation during accepted original continuation",
  async (kind) => {
    const f = await harness(),
      recipeId = await f.prepare();
    expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
      park: { kind: "approval" },
    });
    f.accept();
    if (kind === "policy") f.policy.agentPolicyRevision++;
    if (kind === "authority") f.approvals.revokeRunGrants("run");
    const resumed = f.service.invoke(
      { action: "execute", recipeId },
      kind === "action" ? "foreign-call" : "action",
    );
    if (kind === "stopDuringAcceptance") f.service.close();
    await expect(resumed).rejects.toBeInstanceOf(Error);
    expect(f.inputEvents()).toBe(0);
    expect(f.tickets.size).toBe(1);
  },
);

it("does not allow concurrent accepted resumes to prepare or apply a second input", async () => {
  const f = await harness(),
    recipeId = await f.prepare();
  expect(await f.service.invoke({ action: "execute", recipeId }, "action")).toMatchObject({
    park: { kind: "approval" },
  });
  f.accept();
  const first = f.service.invoke({ action: "execute", recipeId }, "action");
  await expect(f.service.invoke({ action: "execute", recipeId }, "action")).rejects.toMatchObject({
    code: "ref_stale",
  });
  expect(await first).toMatchObject({ output: { status: "completed" } });
  expect(f.inputEvents()).toBe(1);
  expect(f.tickets.size).toBe(2);
});
