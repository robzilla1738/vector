import { afterEach, describe, expect, it } from "vitest";
import { AuxError } from "@aux/contracts";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  MockModelClient,
  DurableWriteLedger,
  TranscriptStore,
  buildSystemPrompt,
  buildToolManifest,
  openDb,
  resumeAgentLoop,
  runAgentLoop,
  type AgentLoopOptions,
  type LoopToolDeps,
} from "@aux/runtime";
import type { ModelMessage } from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-loop-"));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  const db = openDb(join(directory, "state.sqlite"));
  cleanup.push(() => db.close());
  return { db, transcript: new TranscriptStore(db) };
}

function baseOpts(transcript: TranscriptStore, deps: LoopToolDeps = {}): Omit<AgentLoopOptions, "model"> {
  return {
    modelId: "mock",
    tools: buildToolManifest(),
    transcript,
    runId: "run-1",
    threadId: "chat-1",
    pageId: "page-1",
    deps,
  };
}

const userTask: ModelMessage = { role: "user", content: "do the task" };

describe("TranscriptStore (S5)", () => {
  it("appends messages durably and rebuilds them after reopen", () => {
    const { transcript, db } = fixture();
    transcript.append("r1", [userTask]);
    transcript.append("r1", [{ role: "assistant", content: [{ type: "text", text: "hi" }] } as ModelMessage]);
    expect(transcript.count("r1")).toBe(2);
    // simulate restart: a fresh store over the same db sees the same history
    const reopened = new TranscriptStore(db);
    const messages = reopened.load("r1");
    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ role: "user" });
    expect((messages[1]!.content as unknown[])[0]).toMatchObject({ type: "text", text: "hi" });
  });

  it("parks once, resolves transactionally, and refuses double resolve", () => {
    const { transcript, db } = fixture();
    transcript.append("r1", [userTask]);
    transcript.park("r1", {
      toolCallId: "c1", toolName: "ask_user_question",
      suspension: { kind: "ask-user-question", instruction: "What color?" },
      pendingResults: [{ toolCallId: "c1", toolName: "ask_user_question", parked: true }],
    });
    expect(transcript.openPark("r1")?.toolCallId).toBe("c1");
    expect(new TranscriptStore(db).openPark("r1")?.suspension).toEqual({ kind: "ask-user-question", instruction: "What color?" });
    expect(() => transcript.park("r1", { toolCallId: "c2", toolName: "x", pendingResults: [] })).toThrow(/already has a parked/);
    const toolMessage: ModelMessage = {
      role: "tool",
      content: [{ type: "tool-result", toolCallId: "c1", toolName: "ask_user_question", output: { type: "json", value: { answer: "yes" } } }],
    } as ModelMessage;
    transcript.resolvePark("r1", toolMessage);
    expect(transcript.openPark("r1")).toBeUndefined();
    expect(() => transcript.resolvePark("r1", toolMessage)).toThrow(/park already resolved/);
    expect(transcript.load("r1").at(-1)).toMatchObject({ role: "tool" });
  });
});

describe("runAgentLoop (S5)", () => {
  it("closes an unanswered call after a crash without replaying its effect", async () => {
    const { transcript, db } = fixture();
    transcript.append("run-1", [userTask, {
      role: "assistant",
      content: [{ type: "tool-call", toolCallId: "write-1", toolName: "webfetch", input: { url: "https://example.com" } }],
    } as ModelMessage]);
    let executions = 0;
    let sawRecovery = false;
    const model: NonNullable<AgentLoopOptions["model"]["toolCallStep"]> = async ({ messages }) => {
      sawRecovery = messages.some((message) => message.role === "tool" && JSON.stringify(message).includes("outcome is unknown"));
      return {
        message: { role: "assistant", content: [{ type: "text", text: "I need to inspect the state." }] } as ModelMessage,
        toolCalls: [], text: "I need to inspect the state.", finishReason: "stop", durationMs: 0,
      };
    };
    const outcome = await runAgentLoop({
      ...baseOpts(new TranscriptStore(db), { webFetch: async () => { executions++; return { output: "unexpected" }; } }),
      model: { toolCallStep: model },
    });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(sawRecovery).toBe(true);
    expect(executions).toBe(0);
    expect(transcript.load("run-1").map((message) => message.role)).toEqual(["user", "assistant", "tool", "assistant"]);
  });

  it("ends the turn when the model answers with text", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([{ text: "all done" }]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done", text: "all done" });
    const messages = transcript.load("run-1");
    expect(messages.at(-1)).toMatchObject({ role: "assistant" });
  });

  it("executes tool calls, appends results, and feeds them back to the model", async () => {
    const { transcript } = fixture();
    const seen: { url?: string } = {};
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "f1", toolName: "webfetch", input: { url: "https://example.com" } }] },
      { text: "fetched it" },
    ]);
    const deps: LoopToolDeps = {
      webFetch: async (url) => { seen.url = url; return { output: { title: "Example" } }; },
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done", text: "fetched it" });
    expect(seen.url).toBe("https://example.com");
    const messages = transcript.load("run-1");
    expect(messages).toHaveLength(3); // assistant(calls) → tool(results) → assistant(text)
    expect(messages[1]).toMatchObject({ role: "tool" });
  });

  it("ends via submit_result with the verified result, pairing the tool call honestly", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "verified answer", citations: [{ pageId: "page-1", quote: "x" }] },
        }],
      },
      { text: "unreached" },
    ]);
    const seen: unknown[] = [];
    const deps: LoopToolDeps = {
      submitResult: async (input) => { seen.push(input); return { ok: true, result: { report: input.report, verified: true } }; },
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done", text: "verified answer", result: { report: "verified answer", verified: true } });
    expect(seen[0]).toMatchObject({ report: "verified answer" });
    // The terminal call's result is the honest {accepted:true} — pairing holds.
    const toolMsg = transcript.load("run-1").find((m) => m.role === "tool");
    expect(JSON.stringify(toolMsg?.content)).toMatch(/accepted/);
  });

  it("keeps looping when submit_result verification rejects — the error is the model's to fix", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "done", citations: [{ pageId: "page-1", quote: "fabricated" }] },
        }],
      },
      { text: "gave up the cite" },
    ]);
    const deps: LoopToolDeps = {
      submitResult: async () => ({ ok: false, error: "citation 1: quote not found in the cited snapshot" }),
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done", text: "gave up the cite" });
    const toolMsg = transcript.load("run-1").find((m) => m.role === "tool");
    expect(JSON.stringify(toolMsg?.content)).toMatch(/quote not found/);
  });

  it("surfaces tool input validation failures to the model instead of throwing", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "b1", toolName: "webfetch", input: { url: "not-a-url" } }] },
      { text: "fixed" },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript, { webFetch: async () => ({ output: "unreached" }) }), model });
    expect(outcome).toMatchObject({ kind: "done" });
    const result = (transcript.load("run-1")[1]!.content as unknown[])[0] as { output: { type: string; value: unknown } };
    expect(result.output.type).toBe("error-text");
    expect(String(result.output.value)).toMatch(/invalid|expected/i);
  });

  it("rejects unknown tools as capability_unsupported, not a crash", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "u1", toolName: "teleport", input: {} }] },
      { text: "ok" },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done" });
    const result = (transcript.load("run-1")[1]!.content as unknown[])[0] as { output: { type: string; value: unknown } };
    expect(String(result.output.value)).toMatch(/Unknown tool/);
  });

  it("enforces requiresSoloCall on suspension tools", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [
        { toolCallId: "a1", toolName: "ask_user_question", input: { question: "which?" } },
        { toolCallId: "a2", toolName: "get_time", input: {} },
      ] },
      { text: "ok" },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(transcript.openPark("run-1")).toBeUndefined();
    const results = transcript.load("run-1")[1]!.content as { toolCallId: string; output: { type: string; value: unknown } }[];
    const solo = results.find((r) => r.toolCallId === "a1")!;
    expect(solo.output.type).toBe("error-text");
    expect(String(solo.output.value)).toMatch(/only tool call/);
    const other = results.find((r) => r.toolCallId === "a2")!;
    expect(JSON.stringify(other.output.value)).toMatch(/iso|unixMs/);
  });

  it("parks on ask_user_question and resumes with the answer as the tool result", async () => {
    const { transcript, db } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "q1", toolName: "ask_user_question", input: { question: "blue or red?" } }] },
      { text: "picked blue" },
    ]);
    const parked = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(parked).toMatchObject({ kind: "parked", toolCallId: "q1", park: { kind: "ask-user-question", instruction: "blue or red?" } });
    expect(transcript.openPark("run-1")).toMatchObject({ toolCallId: "q1" });

    // simulate restart: new store over the same db still finds the open park
    expect(new TranscriptStore(db).openPark("run-1")).toMatchObject({ toolCallId: "q1" });

    const resumed = await resumeAgentLoop({ ...baseOpts(transcript), model }, "blue");
    expect(resumed).toMatchObject({ kind: "done", text: "picked blue" });
    const toolMessage = transcript.load("run-1").find((m) => m.role === "tool")!;
    const part = (toolMessage.content as { toolCallId: string; output: { type: string; value: unknown } }[])[0]!;
    expect(part.toolCallId).toBe("q1");
    expect(part.output).toMatchObject({ type: "text", value: "blue" });
  });

  it("fails a resume when no park is open", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient();
    const outcome = await resumeAgentLoop({ ...baseOpts(transcript), model }, "x");
    expect(outcome).toMatchObject({ kind: "failed" });
  });

  it("stops for a steer before the next model call", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "t1", toolName: "get_time", input: {} }] },
      { text: "should not reach" },
    ]);
    let calls = 0;
    const outcome = await runAgentLoop({
      ...baseOpts(transcript), model,
      steerCheck: () => ++calls > 1, // first check pre-step passes, post-execution check steers
    });
    expect(outcome).toMatchObject({ kind: "steered" });
    // executed call still got an honest result in the transcript
    const messages = transcript.load("run-1");
    expect(messages.at(-1)).toMatchObject({ role: "tool" });
  });

  it("honors abort signals", async () => {
    const { transcript } = fixture();
    const controller = new AbortController();
    controller.abort();
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model: new MockModelClient(), signal: controller.signal });
    expect(outcome).toMatchObject({ kind: "failed" });
  });

  it("executes leaked submit_result markup in the same model turn", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { text: '<atem:function_calls><atem:invoke name="default.submit_result"><atem:parameter name="report">Jordan Lee</atem:parameter><atem:parameter name="citations">[{"observationId": "art_1", "quote": "Jordan Lee"}]</atem:parameter></atem:invoke></atem:function_calls>' },
      { text: "should not be called" },
    ]);
    const seen: unknown[] = [];
    const outcome = await runAgentLoop({
      ...baseOpts(transcript, {
        submitResult: async (input) => {
          seen.push(input);
          return { ok: true, result: { report: input.report, citations: input.citations } };
        },
      }),
      model,
    });
    expect(outcome).toMatchObject({ kind: "done", text: "Jordan Lee" });
    expect(seen).toEqual([{ report: "Jordan Lee", citations: [{ observationId: "art_1", quote: "Jordan Lee" }] }]);
    expect(transcript.load("run-1").some((m) => String(m.content).includes("should not be called"))).toBe(false);
  });

  it("nudges when leaked markup is not a complete tool call", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { text: '<atem:function_calls>not an invoke</atem:function_calls>' },
      { text: "real answer" },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done", text: "real answer" });
    const nudge = transcript.load("run-1").find((m) => m.role === "user" && String(m.content).includes("function-call markup"));
    expect(nudge).toBeTruthy();
  });

  it("runs the work in a turn before submit_result, even when submit is listed first", async () => {
    const { transcript } = fixture();
    const order: string[] = [];
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "f1", toolName: "submit_result", input: { report: "fetched" } },
          { toolCallId: "w1", toolName: "webfetch", input: { url: "https://example.com/a" } },
        ],
      },
      { text: "should not be called" },
    ]);
    const outcome = await runAgentLoop({
      ...baseOpts(transcript, {
        webFetch: async (url) => { order.push(`fetch:${url}`); return { output: { title: "Example" } }; },
        submitResult: async (input) => { order.push(`submit:${input.report}`); return { ok: true, result: { report: input.report } }; },
      }),
      model,
    });
    expect(outcome).toMatchObject({ kind: "done", text: "fetched" });
    expect(order).toEqual(["fetch:https://example.com/a", "submit:fetched"]);
  });

  it("pairs skipped calls when an accepted submit_result ends a multi-call turn", async () => {
    const { transcript } = fixture();
    let executions = 0;
    const model = new MockModelClient().scriptToolSteps([{
      toolCalls: [
        { toolCallId: "s1", toolName: "submit_result", input: { report: "done" } },
        { toolCallId: "s2", toolName: "submit_result", input: { report: "stale" } },
      ],
    }]);
    const result = await runAgentLoop({
      ...baseOpts(transcript, { submitResult: async () => { executions++; return { ok: true, result: { report: "done" } }; } }),
      model,
    });
    expect(result).toMatchObject({ kind: "done" });
    expect(executions).toBe(1);
    const tool = transcript.load("run-1").find((message) => message.role === "tool");
    expect(JSON.stringify(tool)).toContain('"toolCallId":"s1"');
    expect(JSON.stringify(tool)).toContain('"toolCallId":"s2"');
    expect(JSON.stringify(tool)).toContain("before this call ran");
  });

  it("caps runaway loops at maxSteps", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "t1", toolName: "get_time", input: {} }] },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model, maxSteps: 3 });
    expect(outcome).toMatchObject({ kind: "exhausted" });
  });

  it("fails cleanly when the client lacks toolCallStep", async () => {
    const { transcript } = fixture();
    const bare = {} as Pick<import("@aux/runtime").ModelClient, "toolCallStep">;
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model: bare });
    expect(outcome).toMatchObject({ kind: "failed" });
  });

  it("beforeModelCall gates the step — a spent budget fails the run without billing a call", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([{ text: "unreached" }]);
    const outcome = await runAgentLoop({
      ...baseOpts(transcript),
      model,
      beforeModelCall: () => { throw new AuxError("permission_denied", "The user-set run budget is spent."); },
    });
    expect(outcome).toMatchObject({ kind: "failed", error: { code: "permission_denied" } });
    expect(transcript.count("run-1")).toBe(0); // no assistant step was billed or persisted
  });
});

describe("buildSystemPrompt (S5 conditional docs)", () => {
  it("includes page docs only when the run claims a page", () => {
    const withPage = buildSystemPrompt({ hasPage: true, webEnabled: true });
    const withoutPage = buildSystemPrompt({ hasPage: false, webEnabled: false });
    expect(withPage).toMatch(/snapshot/);
    expect(withoutPage).not.toMatch(/Page tools/);
    expect(withPage).toMatch(/webfetch/);
    expect(withPage).toMatch(/same turn/);
    expect(withoutPage).not.toMatch(/Web tools/);
    // suspensions are always documented
    expect(withoutPage).toMatch(/ask_user_question/);
    expect(withPage).not.toMatch(/page\.webmcp\.tools/);
    const withTools = buildSystemPrompt({ hasPage: true, webEnabled: true, webmcp: true });
    expect(withTools).toMatch(/page\.webmcp\.tools\(\)/);
    expect(withTools).toMatch(/page\.webmcp\.call\(name, input\)/);
  });
});

describe("TranscriptStore misc", () => {
  it("shares a db with unrelated runtime tables without collisions", () => {
    const directory = mkdtempSync(join(tmpdir(), "aux-loop2-"));
    cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
    const db = new DatabaseSync(join(directory, "shared.sqlite"));
    cleanup.push(() => db.close());
    const store = new TranscriptStore(db);
    store.append("r", [userTask]);
    expect(store.count("r")).toBe(1);
  });
});

// ---------- runToolLoop: the coordinator host (engine "agent-loop") ----------

import { vi } from "vitest";
import type { Observation, PlanStep, StepOutcome } from "@aux/contracts";
import { EventBus, Repo, RunCoordinator } from "@aux/runtime";

const pageObs = (): Observation =>
  ({
    pageId: "p1", documentEpoch: 1, revision: 1, observedAt: Date.now(), scope: "full",
    content: {
      url: "http://x.test/order", title: "Order",
      viewport: { width: 1, height: 1, scale: 1 }, scroll: { y: 0, maxY: 0 },
      frames: [], text: "Order page", headings: [],
      elements: [{ ref: "r1", tag: "button", role: "button", name: "Save", frame: "main" }],
      formFields: [], tables: [], links: [], dialogs: [], truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

function coordinatorHarness(
  model: MockModelClient,
  execute?: (program: { steps: PlanStep[] }, ctx?: { runId?: string; onStep?: (o: StepOutcome, s: PlanStep) => void }) => { status: string; steps: StepOutcome[]; observation?: Observation },
) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const pages = {
    observe: vi.fn(async () => pageObs()),
    execute: vi.fn(async (program: { steps: PlanStep[] }, ctx?: { runId?: string }) =>
      execute?.(program, ctx) ?? { status: "completed", steps: [] }),
    livePageIds: () => ["p1"],
    get: () => ({ viewStatus: "visible", documentEpoch: 1, url: "http://x.test/order" }),
  };
  const modelCalls: { role: string }[] = [];
  const coordinator = new RunCoordinator({
    repo, events, pages: pages as never,
    model: () => model,
    defaultModel: () => "test/agent",
    recoveryModel: () => undefined,
    recordModelCall: (call: { role: string }) => modelCalls.push(call),
    grants: ["effect:read", "effect:write", "effect:egress"],
  });
  return { db, repo, coordinator, pages, modelCalls };
}

async function settle(repo: Repo, runId: string) {
  for (let i = 0; i < 400; i++) {
    const run = repo.getRun(runId)!;
    if (["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(run.status)) return run;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error("run did not settle");
}

describe("runToolLoop (S5 host integration)", () => {
  it("completes a text turn and seeds the task into the durable transcript", async () => {
    const model = new MockModelClient().scriptToolSteps([{ text: "ship it" }]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "read the page", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "ship it" });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(transcript[0]).toMatchObject({ role: "user" });
    expect(String(transcript[0]!.content)).toMatch(/read the page/);
    expect(String(transcript[1]!.content)).toMatch(/Current page snapshot/);
    expect(String(transcript[1]!.content)).toMatch(/Order page/);
    expect(h.pages.observe).toHaveBeenCalledTimes(1);
    expect(h.modelCalls[0]).toMatchObject({ role: "agent" });
  });

  it("parks needs_input on ask_user_question and resumes with the answer", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "q1", toolName: "ask_user_question", input: { question: "blue or red?" } }] },
      { text: "blue it is" },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "pick", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    for (let i = 0; i < 400 && h.repo.getRun(run.runId)!.status !== "needs_input"; i++) await new Promise((r) => setTimeout(r, 10));
    expect(h.repo.getRun(run.runId)!.status).toBe("needs_input");
    const pending = h.coordinator.suspensions.pending(run.runId);
    expect(pending?.kind).toBe("ask-user-question");
    expect(new TranscriptStore(h.db).openPark(run.runId)).toMatchObject({ toolCallId: "q1" });
    h.coordinator.answer(run.runId, "blue");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "blue it is" });
    expect(h.coordinator.suspensions.pending(run.runId)).toBeUndefined();
  });

  it("parks on a gate-created approval suspension inside act, not a second record", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } }] },
      { text: "approved and done" },
    ]);
    const h = coordinatorHarness(model, (_program, ctx) => {
      // What the real gate does on `ask`: park a typed suspension, fail the step needs_input.
      h.coordinator.suspensions.park({
        runId: ctx?.runId ?? "", threadId: "chat-1", turnId: ctx?.runId ?? "", kind: "approval",
        request: { kind: "approval", approvalId: "ap-9", instruction: "Approve the click?", guidance: "Wait." },
      });
      return { status: "failed", steps: [{ stepId: "s1", op: "click", status: "failed", startedAt: 1, durationMs: 1, error: { code: "needs_input", message: "Approve the click?" } }] };
    });
    const run = await h.coordinator.start({ goal: "check out", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    for (let i = 0; i < 400 && h.repo.getRun(run.runId)!.status !== "needs_input"; i++) await new Promise((r) => setTimeout(r, 10));
    const pending = h.coordinator.suspensions.pending(run.runId);
    expect(h.repo.getRun(run.runId)!.status).toBe("needs_input");
    // The loop waited on the GATE's approval suspension — no second record.
    expect(pending?.kind).toBe("approval");
    expect(h.db.prepare("SELECT COUNT(*) AS n FROM safety_suspensions WHERE run_id=?").get(run.runId)).toEqual({ n: 1 });
    const resolved = h.coordinator.suspensions.resolveByApprovalId("ap-9", "answered");
    expect(resolved?.runId).toBe(run.runId);
    h.coordinator.answer(run.runId, "The user approved.");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
  });

  it("runs code-mode page ops through the governed act path", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "c1", toolName: "repl", input: { code: `page.click("r1")` } }] },
      { text: "clicked" },
    ]);
    const h = coordinatorHarness(model, (program) => ({
      status: "completed",
      steps: program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok" as const, startedAt: 1, durationMs: 1 })),
    }));
    const run = await h.coordinator.start({ goal: "click the button", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.pages.execute).toHaveBeenCalled();
  });

  it("finishes a named page action and verified read in one model call", async () => {
    const model = new MockModelClient().scriptToolSteps([{
      toolCalls: [{ toolCallId: "r1", toolName: "repl", input: {
        code: `page.clickByName("Save", "button"); const s = snapshot(); submitResult("Order page", [{ observationId: s.observationId, quote: "Order page" }])`,
      } }],
    }]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "Report the page title", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "Order page" });
    expect(h.modelCalls).toHaveLength(1);
    expect(h.pages.execute).toHaveBeenCalled();
  });

  it("completes via submit_result with verified snapshot citations", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "s1", toolName: "snapshot", input: {} }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: {
            report: "The order page is open.",
            citations: [{ pageId: "p1", quote: "Order page" }],
          },
        }],
      },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "summarize the page", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "The order page is open.", citations: [{ pageId: "p1", quote: "Order page" }] });
    // The terminal call's tool result persisted for transcript pairing.
    const transcript = new TranscriptStore(h.db).load(run.runId);
    const toolMsg = transcript.find((m) => m.role === "tool" && JSON.stringify(m.content).includes("submit_result"));
    expect(JSON.stringify(toolMsg?.content)).toMatch(/accepted/);
  });

  it("rejects an unverifiable citation so the model can re-cite and resubmit", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "s1", toolName: "snapshot", input: {} }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "done", citations: [{ pageId: "p1", quote: "fabricated quote" }] },
        }],
      },
      {
        toolCalls: [{
          toolCallId: "f2",
          toolName: "submit_result",
          input: { report: "done", citations: [{ pageId: "p1", quote: "Order page" }] },
        }],
      },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "summarize", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "done" });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    const rejected = transcript.find((m) => m.role === "tool" && JSON.stringify(m.content).includes("Unverifiable citations"));
    expect(rejected).toBeTruthy();
  });

  it("completes a confirmed write with or without a post-state citation", async () => {
    const postObs = { ...pageObs(), revision: 2 } as Observation;
    const execConfirmed = (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void }) => {
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok" as const, startedAt: 1, durationMs: 1 }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps, observation: postObs };
    };
    const cited = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Order page" }] },
        }],
      },
    ]);
    const h = coordinatorHarness(cited, execConfirmed);
    const run = await h.coordinator.start({ goal: "click save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).not.toMatchObject({ unconfirmedWrites: ["s1"] });

    // The completed executor receipt confirms the write independently.
    const bare = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "clicked" },
        }],
      },
    ]);
    const h2 = coordinatorHarness(bare, (program, ctx) => {
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok" as const, startedAt: 1, durationMs: 1 }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps };
    });
    const run2 = await h2.coordinator.start({ goal: "click save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final2 = await settle(h2.repo, run2.runId);
    expect(final2.status).toBe("completed");
    expect(final2.result).toMatchObject({ report: "clicked" });
  });

  it("blocks submit_result while an uncertain dispatch is in the ledger", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "done" },
        }],
      },
      { text: "blocked" },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id, op: s.op, status: "ok" as const, startedAt: 1, durationMs: 1,
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps };
    });
    const run = await h.coordinator.start({ goal: "click save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    const transcript = new TranscriptStore(h.db).load(run.runId);
    // submit_result rejected while the uncertain dispatch stood…
    const rejected = transcript.find((m) => m.role === "tool" && JSON.stringify(m.content).includes("uncertain dispatch"));
    expect(rejected).toBeTruthy();
    // …and the run could not reach completed — it stopped partially with the
    // write surfaced, never claiming success.
    expect(final.status).toBe("partially_completed");
    expect(final.result).toMatchObject({ unconfirmedWrites: ["s1"] });
  });

  it("rejects same-page boilerplate and reconciles only a new effect line", async () => {
    const postObs = { ...pageObs(), revision: 2 } as Observation;
    postObs.content.text = "Order page\nNotifications 1\nSaving...\nSaved";
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Order page" }] },
        }],
      },
      { toolCalls: [{ toolCallId: "r1", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "Order page" }, effect: "Order page",
      } }] },
      { toolCalls: [{ toolCallId: "r3", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "Notifications 1" }, effect: "Notifications 1",
      } }] },
      { toolCalls: [{ toolCallId: "r4", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "Saving..." }, effect: "Saving...",
      } }] },
      { toolCalls: [{ toolCallId: "r2", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "Saved" }, effect: "Saved",
      } }] },
      { toolCalls: [{ toolCallId: "f2", toolName: "submit_result", input: {
        report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Saved" }],
      } }] },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id, op: s.op, status: "failed" as const, startedAt: 1, durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, unconfirmed: false, dispatchedBeforeTakeover: false },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: postObs };
    });
    const run = await h.coordinator.start({ goal: "click save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "clicked" });
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: "confirmed" });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(transcript.some((message) => message.role === "tool" && JSON.stringify(message.content).includes("already visible before"))).toBe(true);
    expect(transcript.some((message) => message.role === "tool" && JSON.stringify(message.content).includes("does not confirm the click completed"))).toBe(true);
  });

  it("does not settle an uncertain write from a post-dispatch page title alone", async () => {
    const postObs = { ...pageObs(), revision: 2 } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Order page" }] },
        }],
      },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id, op: s.op, status: "failed" as const, startedAt: 1, durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, unconfirmed: false, dispatchedBeforeTakeover: false },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: postObs };
    });
    const run = await h.coordinator.start({ goal: "click save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).not.toBe("completed");
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: "uncertain" });
  });

  it("rehydrates the pending action summary from the durable ledger after restart", () => {
    const { db } = fixture();
    const first = new DurableWriteLedger(db);
    const { intent } = first.begin({ runId: "run-1", pageId: "p1", documentEpoch: 1, signature: "click-save",
      summary: { ops: ["click"], actionLabels: ["Save"], beforeLineHashes: ["pre-action-line-hash"] } });
    first.fail(intent.id);
    const restarted = new DurableWriteLedger(db);
    expect(restarted.getById(intent.id)).toMatchObject({
      status: "uncertain", createdAt: expect.any(Number),
      summary: { ops: ["click"], actionLabels: ["Save"], beforeLineHashes: ["pre-action-line-hash"] },
    });
    expect(restarted.unresolved("run-1")).toHaveLength(1);
  });

  it("never counts navigation as an uncertain write", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "n1", op: "navigate", url: "http://x.test/next" }] } }] },
      {
        toolCalls: [{
          toolCallId: "f1",
          toolName: "submit_result",
          input: { report: "navigated" },
        }],
      },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id, op: s.op, status: "ok" as const, startedAt: 1, durationMs: 1,
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, unconfirmed: false, dispatchedBeforeTakeover: false },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps };
    });
    const run = await h.coordinator.start({ goal: "go to the next page", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "navigated" });
  });
});
