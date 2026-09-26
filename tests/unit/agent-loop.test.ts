import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import {
  MockModelClient,
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
    const { transcript } = fixture();
    transcript.append("r1", [userTask]);
    transcript.park("r1", {
      toolCallId: "c1", toolName: "ask_user_question",
      pendingResults: [{ toolCallId: "c1", toolName: "ask_user_question", parked: true }],
    });
    expect(transcript.openPark("r1")?.toolCallId).toBe("c1");
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
});

describe("buildSystemPrompt (S5 conditional docs)", () => {
  it("includes page docs only when the run claims a page", () => {
    const withPage = buildSystemPrompt({ hasPage: true, webEnabled: true });
    const withoutPage = buildSystemPrompt({ hasPage: false, webEnabled: false });
    expect(withPage).toMatch(/snapshot/);
    expect(withoutPage).not.toMatch(/Page tools/);
    expect(withPage).toMatch(/webfetch/);
    expect(withoutPage).not.toMatch(/Web tools/);
    // suspensions are always documented
    expect(withoutPage).toMatch(/ask_user_question/);
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
  execute?: (program: { steps: PlanStep[] }, ctx?: { runId?: string }) => { status: string; steps: StepOutcome[] },
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
});
