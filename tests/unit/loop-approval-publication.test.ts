import { afterEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { EffectRequestSchema } from "@aux/contracts";
import { startRuntime } from "../../apps/runtime/src/main.js";
import { openDb } from "../../apps/runtime/src/store/db.js";
import { ApprovalStore } from "../../apps/runtime/src/safety/approval.js";
import { DecisionJournal, decide } from "../../apps/runtime/src/safety/decide.js";
import { SafetyDispatchGate } from "../../apps/runtime/src/safety/dispatch.js";
import { SuspensionStore } from "../../apps/runtime/src/safety/suspensions.js";
import { vi } from "vitest";

const cleanups: (() => void | Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanups.splice(0).reverse()) await close();
});

it("publishes actual page-free REPL openTab consent while retaining the parked destination", async () => {
  const { createFixture } = await import("../host/lib/fixture.mjs");
  const { createModelFixture } = await import("../host/lib/model-fixture.mjs");
  const fixture = await createFixture();
  cleanups.push(() => fixture.close());
  const model = createModelFixture(fixture);
  const destination = "http://aux-recovery.fixture.test/first-chat/opened";
  model.respond(() => ({
    tool_calls: [
      {
        id: "open-owned-destination",
        type: "function",
        function: {
          name: "repl",
          arguments: JSON.stringify({
            code: `const opened = openTab(${JSON.stringify(destination)}); display(opened); submitResult("Opened.");`,
          }),
        },
      },
    ],
  }));
  const dataDir = mkdtempSync(join(tmpdir(), "aux-loop-approval-"));
  cleanups.push(() => rmSync(dataDir, { recursive: true, force: true }));
  const runtime = await startRuntime({
    AUX_DATA_DIR: dataDir,
    AUX_STANDALONE: "0",
    AUX_IPC: "0",
    AUX_API_PORT: "0",
    AUX_LOAD_DOTENV: "0",
  });
  cleanups.push(() => runtime.close());
  await runtime.invoke("settings.set", {
    modelProvider: "openai-compatible",
    compatibleEndpoint: model.endpoint,
    plannerModel: model.model,
  });
  const run = (await runtime.invoke("runs.start", {
    goal: "Open the explicit synthetic destination",
    pageIds: [],
    maxModelCalls: 2,
  })) as { runId: string };
  await vi.waitFor(async () => {
    const actual = (await runtime.invoke("runs.get", { runId: run.runId })) as {
      run: { status: string; pageIds: string[] };
    };
    expect(actual.run.status).toBe("needs_input");
    expect(actual.run.pageIds).toEqual([]);
  });
  const events = (await runtime.invoke("events.since", { sinceSeq: 0, limit: 2000 })) as {
    events: { type: string; payload: Record<string, unknown> }[];
  };
  const confirmations = events.events.filter((event) => event.type === "safety.confirmation");
  expect(confirmations).toHaveLength(1);
  expect(confirmations[0]!.payload).toMatchObject({
    turnId: run.runId,
    action: "agent.tab.open",
    origin: new URL(destination).origin,
    category: "read",
  });
  expect(confirmations[0]!.payload.approvalId).toBeTypeOf("string");
  expect(await runtime.invoke("pages.list", {})).toEqual([]);
  expect(model.errors).toEqual([]);
  await expect(
    runtime.invoke("safety.approvals.decide", {
      expectedTurnId: run.runId,
      decision: { decision: "accept", approvalId: confirmations[0]!.payload.approvalId },
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  await runtime.invoke("runs.cancel", { runId: run.runId });
});

it("publishes one already-decided approval and consumes its acceptance only at exact dispatch", async () => {
  const db = openDb(":memory:");
  cleanups.push(() => db.close());
  const approvals = new ApprovalStore(db),
    suspensions = new SuspensionStore(db);
  const onConfirmation = vi.fn();
  const deps = {
    approvals,
    journal: new DecisionJournal(db),
    managedRules: () => [],
    userRules: () => [],
    localCeiling: () => "ask" as const,
    audit: () => {},
  };
  const gate = new SafetyDispatchGate({ ...deps, suspensions, onConfirmation });
  const request = EffectRequestSchema.parse({
    profileId: "fixture-profile",
    scope: { kind: "workspace", id: "fixture-workspace" },
    actor: "builtin_agent",
    effect: "egress",
    category: "read",
    action: "agent.tab.open",
    origin: "http://aux-recovery.fixture.test",
    destination: "http://aux-recovery.fixture.test/first-chat/opened",
    dataClasses: [],
    provenance: "template",
    invocationDigest: "a".repeat(64),
    turnId: "run",
    threadId: "thread",
    runId: "run",
    requestedAt: Date.now(),
  });
  const decision = await decide(request, deps, { phase: "dispatch" });
  expect(decision.status).toBe("ask");
  if (decision.status !== "ask") throw new Error("Expected actual approval");
  gate.park(request, request, decision.suspension);
  expect(onConfirmation).toHaveBeenCalledOnce();
  const pending = approvals.pending(request.threadId);
  expect(pending).toHaveLength(1);
  expect(suspensions.pending(request.runId!)).toMatchObject({
    request: { approvalId: pending[0]!.approvalId },
  });
  expect(db.prepare("SELECT COUNT(*) AS n FROM safety_decisions").get()).toEqual({ n: 1 });
  approvals.decideLocal({ decision: "accept", approvalId: pending[0]!.approvalId }, request.turnId);
  suspensions.resolveByApprovalId(pending[0]!.approvalId, "answered");
  expect(await decide(request, deps, { phase: "dispatch", headless: true })).toMatchObject({
    status: "deny",
  });
  expect(await decide(request, deps, { phase: "dispatch", standingOnly: true })).toMatchObject({
    status: "ask",
  });
  expect(
    await decide({ ...request, invocationDigest: "b".repeat(64) }, deps, { phase: "dispatch" }),
  ).toMatchObject({ status: "ask" });
  expect(await decide(request, deps, { phase: "dispatch" })).toMatchObject({
    status: "allow",
    authorizedBy: { authorizedBy: "approval", approvalId: pending[0]!.approvalId },
  });
  expect(await decide(request, deps, { phase: "dispatch" })).toMatchObject({ status: "ask" });
  expect(onConfirmation).toHaveBeenCalledOnce();
});
