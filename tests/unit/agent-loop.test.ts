import { afterEach, describe, expect, it } from "vitest";
import { AuxError } from "@aux/contracts";
import { mkdtempSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
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
  it("rejects a trailing download waiter before dispatching its preceding click", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const act = vi.fn(async () => ({ output: { status: "completed" } }));
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [
        { id: "click", op: "click", target: "r1" }, { id: "wait", op: "expectDownload" },
      ] } }] },
      { text: "The download was not triggered." },
    ]);
    await runAgentLoop({ ...baseOpts(transcript, { act }), model });
    expect(act).not.toHaveBeenCalled();
    expect(JSON.stringify(transcript.load("run-1"))).toContain("no page action was dispatched");
  });

  it("returns fresh citable progress when a first-turn script fails after changing the page", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const repl = vi.fn(async () => { throw new Error("Record link name was ambiguous"); });
    const replProgress = vi.fn(async () => ({ pageId: "page-1", observationId: "obs-after-nav", revision: 2,
      text: "url: http://x.test/records?page=2\nr10 link \"Record 15\" href=/records/rec-15" }));
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: {
        code: 'page.followLinkByName("2"); submitResult("done")', answerLabel: "",
      } }] },
      { text: "I am on page 2." },
    ]);
    await runAgentLoop({ ...baseOpts(transcript, { repl, replProgress }), model });
    expect(repl).toHaveBeenCalledOnce();
    expect(replProgress).toHaveBeenCalledOnce();
    const toolResult = transcript.load("run-1").find((message) => message.role === "tool");
    expect(JSON.stringify(toolResult)).toContain("obs-after-nav");
    expect(JSON.stringify(toolResult)).toContain("records?page=2");
    expect(JSON.stringify(toolResult)).toContain("Record link name was ambiguous");
  });

  it("preserves the original script error when a progress observation fails", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: { code: 'submitResult("done")', answerLabel: "" } }] },
      { text: "The page could not be observed." },
    ]);
    await runAgentLoop({ ...baseOpts(transcript, {
      repl: async () => { throw new Error("original script failure"); },
      replProgress: async () => { throw new Error("snapshot unavailable"); },
    }), model });
    const toolResult = transcript.load("run-1").find((message) => message.role === "tool");
    expect(JSON.stringify(toolResult)).toContain("original script failure");
    expect(JSON.stringify(toolResult)).not.toContain("snapshot unavailable");
  });
  it("joins a yielded REPL cell through repl_wait before accepting its verified result", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const cellId = "123e4567-e89b-42d3-a456-426614174000";
    const repl = vi.fn(async () => ({ output: { running: true, cellId } }));
    const replWait = vi.fn(async () => ({ finish: { result: { report: "done" } } }));
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "c1", toolName: "repl", input: { code: "sleep(40); submitResult('done')", yieldTimeMs: 0 } }] },
      { toolCalls: [{ toolCallId: "c2", toolName: "repl_wait", input: { cellId } }] },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript, { repl, replWait }), model });
    expect(outcome).toMatchObject({ kind: "done", result: { report: "done" } });
    expect(repl).toHaveBeenCalledOnce();
    expect(replWait).toHaveBeenCalledOnce();
    expect(transcript.load("run-1").filter((message) => message.role === "tool")).toHaveLength(2);
  });
  it("offers a complete goal program on the first page turn, then all tools after a safe fallback", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const seen: string[][] = [];
    let turn = 0;
    const model: NonNullable<AgentLoopOptions["model"]["toolCallStep"]> = async ({ tools }) => {
      seen.push(Object.keys(tools));
      turn++;
      const toolCalls = turn === 1
        ? [{ toolCallId: "g1", toolName: "goal_program", input: { code: "page.navigateMatching('rec-14')", answerLabel: "" } }]
        : [{ toolCallId: "s1", toolName: "submit_result", input: { report: "fallback" } }];
      return { message: { role: "assistant", content: [] } as ModelMessage, toolCalls, durationMs: 0 };
    };
    const result = await runAgentLoop({ ...baseOpts(transcript, { repl: async () => { throw new Error("should not execute incomplete program"); },
      submitResult: async ({ report }) => ({ ok: true, result: { report } }) }), model: { toolCallStep: model } });
    expect(result).toMatchObject({ kind: "done", text: "fallback" });
    expect(seen[0]).toEqual(["goal_program", "submit_result", "ask_user_question"]);
    expect(seen[1]).toContain("snapshot");
    expect(seen[1]).toContain("repl");
  });

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
          input: { report: "verified answer", citations: [{ pageId: "page-1", quote: "x" }], textProposal: "A reviewed draft." },
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
    expect(seen[0]).toMatchObject({ report: "verified answer", textProposal: "A reviewed draft." });
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

  it("does not complete a run from an empty assistant turn", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([{ text: "" }, { text: "42" }]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done", text: "42" });
    expect(transcript.load("run-1").some((m) => m.role === "user" && String(m.content).includes("no tool call or answer"))).toBe(true);
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

  it("compacts an oversized recent tail durably before the next model call", async () => {
    const { transcript, db } = fixture();
    transcript.append("run-1", [userTask, ...Array.from({ length: 10 }, (_, i) => ({
      role: "user" as const, content: `${i}: ${"é".repeat(18_000)}`,
    }))]);
    let sentBytes = 0;
    const model: NonNullable<AgentLoopOptions["model"]["toolCallStep"]> = async ({ messages }) => {
      sentBytes = Buffer.byteLength(JSON.stringify(messages), "utf8");
      return { message: { role: "assistant", content: "done" } as ModelMessage,
        toolCalls: [], text: "done", durationMs: 0 };
    };
    const outcome = await runAgentLoop({ ...baseOpts(new TranscriptStore(db)), model: { toolCallStep: model } });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(sentBytes).toBeLessThanOrEqual(192 * 1024);
    const persisted = new TranscriptStore(db).load("run-1");
    expect(String(persisted[1]!.content)).toContain("compacted");
    expect(String(persisted[10]!.content)).toContain("é");
  });

  it("fails before billing when even durable compaction cannot fit the task", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [{ role: "user", content: "x".repeat(200_000) }]);
    let calls = 0;
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model: { toolCallStep: async () => {
      calls++;
      throw new Error("unreachable");
    } } });
    expect(outcome).toMatchObject({ kind: "failed", error: { code: "model_error" } });
    expect(calls).toBe(0);
    expect(transcript.load("run-1")[0]!.content).toHaveLength(200_000);
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
    execute: vi.fn(async (program: { steps: PlanStep[] }, ctx?: { runId?: string; onStep?: (o: StepOutcome, s: PlanStep) => void }) =>
      execute?.(program, ctx) ?? { status: "completed", steps: [] }),
    livePageIds: () => ["p1"],
    get: () => ({ viewStatus: "visible", documentEpoch: 1, url: "http://x.test/order" }),
  };
  const modelCalls: { role: string; modelId: string; error?: string }[] = [];
  const coordinator = new RunCoordinator({
    repo, events, pages: pages as never,
    model: () => model,
    defaultModel: () => "test/agent",
    recoveryModel: () => undefined,
    recordModelCall: (call: { runId: string; role: string; modelId: string; durationMs: number; error?: string }) => {
      modelCalls.push(call);
      repo.saveModelCall({ callId: randomUUID(), ...call, role: call.role as "agent", createdAt: Date.now() });
    },
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
  it("gives a goal program visible body text and headings without browser-title or element duplicates", async () => {
    const model = new MockModelClient().scriptToolSteps([{ toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: {
      code: 'var s=snapshot(); if(s.headings[0]!=="Record 15 — Alpha project") throw new Error("wrong heading"); if(s.bodyText.match(/Priya Patel/g).length!==1) throw new Error("duplicated owner"); submitResult(s.headings[0],[{observationId:s.observationId,quote:s.headings[0]}])',
      answerLabel: "",
    } }] }]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockResolvedValue({ ...pageObs(), content: { ...pageObs().content,
      title: "Record 15 — Alpha project — Records",
      text: "Record 15 — Alpha project\nRecord 03\tPriya Patel\tapproved",
      headings: ["Record 15 — Alpha project", "Hidden dialog title"],
      elements: [{ ref: "r1", tag: "link", role: "link", name: "Priya Patel", frame: "main" }],
    } } as Observation);
    const run = await h.coordinator.start({ goal: "Report the exact record title", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "Record 15 — Alpha project" });
    expect(h.modelCalls).toHaveLength(1);
  });

  it("rejects a site-suffixed browser title when the user requested the exact visible title", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: {
        code: 'submitResult("Record 15 — Alpha project — Records",[{pageId:"p1",revision:1,quote:"title: Record 15 — Alpha project — Records"}])',
        answerLabel: "",
      } }] },
      { toolCalls: [{ toolCallId: "s1", toolName: "submit_result", input: { report: "Record 15 — Alpha project",
        citations: [{ pageId: "p1", revision: 1, quote: "Record 15 — Alpha project" }] } }] },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockResolvedValue({ ...pageObs(), content: { ...pageObs().content,
      title: "Record 15 — Alpha project — Records", text: "Record 15 — Alpha project\nOwner: Alex Rivera",
      headings: ["Record 15 — Alpha project"],
    } } as Observation);
    const run = await h.coordinator.start({ goal: "Open rec-15 and report its exact title", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "Record 15 — Alpha project" });
    expect(h.modelCalls).toHaveLength(2);
    expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).toContain("browser title includes surrounding site text");
  });

  it("persists failed failover attempts against the run budget without a tool replay", async () => {
    const model = new MockModelClient();
    model.toolCallStep = async () => {
      const error = new Error("provider unavailable");
      Object.defineProperty(error, Symbol.for("aux.modelAttempts"), { value: [{
        durationMs: 5, modelId: "test/fallback", inputTokens: 12,
        error: "first route failed",
      }] });
      throw error;
    };
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "read", pageIds: ["p1"], chatId: "chat-1",
      engine: "agent-loop", maxModelCalls: 2 });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("failed");
    expect(h.repo.listModelCalls(run.runId)).toHaveLength(2);
    expect(h.repo.listModelCalls(run.runId).map((call) => call.modelId)).toEqual(["test/fallback", "test/agent"]);
    expect(h.repo.listModelCalls(run.runId).every((call) => !!call.error)).toBe(true);
    expect(h.pages.execute).not.toHaveBeenCalled();
  });

  it("finishes a corroborated record route and dialog in one goal-program model call", async () => {
    let current = { ...pageObs(), content: { ...pageObs().content,
      url: "http://x.test/records", text: "Records",
      elements: [
        { ref: "r1", tag: "a", role: "link", name: "Record 01", href: "/records/rec-01", frame: "main" },
        { ref: "r2", tag: "a", role: "link", name: "Record 02", href: "/records/rec-02", frame: "main" },
      ],
    } } as Observation;
    const model = new MockModelClient().scriptToolSteps([{ toolCalls: [{
      toolCallId: "g1", toolName: "goal_program", input: { code: 'page.navigateMatching("rec-14"); page.clickByName("Details", "button"); var s=snapshot(); var m=s.text.match(/Internal reference: ([^\\n]+)/); if(!m) throw new Error("label absent"); submitResult(m[1], [{observationId:s.observationId, quote:m[0]}])', answerLabel: "" },
    }] }]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockImplementation(async () => current);
    h.pages.execute.mockImplementation(async (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void;
      journaled?: boolean; journalIntentId?: string }) => {
      if (ctx?.journaled && !ctx.journalIntentId) throw new Error("A pre-journaled browser write requires its durable intent ID");
      const op = program.steps[0]?.op;
      current = op === "navigate"
        ? { ...current, revision: 2, content: { ...current.content, url: "http://x.test/records/rec-14", text: "Record rec-14", elements: [
          { ref: "r3", tag: "button", role: "button", name: "Details", frame: "main" },
        ] } } as Observation
        : { ...current, revision: 3, content: { ...current.content, text: "Internal ref rec-14.", elements: [
          { ref: "r3", tag: "button", role: "button", name: "Details", frame: "main", occluded: true },
          { ref: "r4", tag: "button", role: "button", name: "Close", frame: "main" },
        ] } } as Observation;
      const steps = program.steps.map((step) => ({ stepId: step.id, op: step.op, status: "ok" as const, startedAt: 1, durationMs: 1,
        receipt: { remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false }, effect: "dispatched" as const }));
      for (const [index, step] of program.steps.entries()) ctx?.onStep?.(steps[index]!, step);
      return { status: "completed", steps, observation: current };
    });
    const run = await h.coordinator.start({ goal: "Find rec-14, open its detail page and Details dialog, then report the internal reference shown inside the dialog only.", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "rec-14" });
    expect(h.modelCalls).toHaveLength(1);
    expect(h.pages.execute).toHaveBeenCalledTimes(2);
  });
  it("stops a goal program at its first uncertain action before the next click", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: {
        code: 'page.click("r1"); page.click("r1"); submitResult("saved")', answerLabel: "",
      } }] },
      { text: "The click outcome is uncertain." },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "failed" as const,
        startedAt: 1, durationMs: 1, error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const, receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps };
    });
    const run = await h.coordinator.start({ goal: "save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).not.toBe("completed");
    expect(h.pages.execute).toHaveBeenCalledOnce();
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: "uncertain" });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(transcript.some((message) => message.role === "tool" && JSON.stringify(message.content).includes("Action outcome uncertain"))).toBe(true);
  });
  it("explicitly navigates an observed same-origin pagination link without a write intent", async () => {
    let current = { ...pageObs(), content: { ...pageObs().content,
      url: "http://x.test/records", elements: [{ ref: "r17", tag: "a", role: "link", name: "2", href: "?page=2", frame: "main" }],
    } } as Observation;
    const model = new MockModelClient().scriptToolSteps([{ toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: {
      code: 'page.followLinkByName("2"); const s = snapshot(); submitResult(s.text, [{observationId:s.observationId, quote:"url: http://x.test/records?page=2"}])', answerLabel: "",
    } }] }]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockImplementation(async () => current);
    h.pages.execute.mockImplementation(async (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void;
      journaled?: boolean; journalIntentId?: string }) => {
      if (ctx?.journaled && !ctx.journalIntentId) throw new Error("A pre-journaled browser write requires its durable intent ID");
      current = { ...current, revision: 2, content: { ...current.content,
        url: "http://x.test/records?page=2", text: "Page 2 records",
      } } as Observation;
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok" as const,
        startedAt: 1, durationMs: 1 }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps, observation: current };
    });
    const run = await h.coordinator.start({ goal: "open page 2", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.pages.execute).toHaveBeenCalledWith(expect.objectContaining({ steps: [expect.objectContaining({ op: "navigate", url: "http://x.test/records?page=2" })] }), expect.anything(), expect.anything());
    expect(h.db.prepare("SELECT count(*) AS n FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ n: 0 });
  });
  it("shows the reached page after a later GoalProgram lookup fails", async () => {
    let current = { ...pageObs(), content: { ...pageObs().content,
      url: "http://x.test/records", elements: [{ ref: "r17", tag: "a", role: "link", name: "2", href: "?page=2", frame: "main" }],
    } } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "g1", toolName: "goal_program", input: {
        code: 'page.followLinkByName("2"); page.followLinkByName("Missing"); submitResult("done")', answerLabel: "",
      } }] },
      { text: "Page 2 reached; the remaining link needs inspection." },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockImplementation(async () => current);
    h.pages.execute.mockImplementation(async (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void }) => {
      current = { ...current, revision: 2, content: { ...current.content,
        url: "http://x.test/records?page=2", text: "Record 15", elements: [
          { ref: "r10", tag: "a", role: "link", name: "Record 15", href: "/records/rec-15", frame: "main" },
        ],
      } } as Observation;
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "ok" as const, startedAt: 1, durationMs: 1 }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps, observation: current };
    });
    const run = await h.coordinator.start({ goal: "find record 15", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    await settle(h.repo, run.runId);
    expect(h.pages.execute).toHaveBeenCalledOnce();
    const transcript = new TranscriptStore(h.db).load(run.runId);
    const toolResult = transcript.find((message) => message.role === "tool");
    expect(JSON.stringify(toolResult)).toContain("http://x.test/records?page=2");
    expect(JSON.stringify(toolResult)).toContain("Record 15");
    expect(JSON.stringify(toolResult)).toContain("No control named");
  });
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

  it("marks a completed write unconfirmed until its effect is actually observed", async () => {
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
    expect(final.result).toMatchObject({ unconfirmedWrites: ["s1"] });

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
    expect(final2.result).toMatchObject({ unconfirmedWrites: ["s1"] });
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
      { text: "still blocked" },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id, op: s.op, status: "failed" as const, startedAt: 1, durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps };
    });
    const run = await h.coordinator.start({ goal: "click save", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    const transcript = new TranscriptStore(h.db).load(run.runId);
    // submit_result rejected while the uncertain dispatch stood…
    const rejected = transcript.find((m) => m.role === "tool" && JSON.stringify(m.content).includes("uncertain dispatch"));
    expect(rejected).toBeTruthy();
    // …and it cannot claim success while the durable intent stays uncertain.
    expect(final.status).not.toBe("completed");
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: "uncertain" });
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

  it.each([
    { modalOpen: true, headingVisibleBefore: false, shouldReconcile: true },
    { modalOpen: false, headingVisibleBefore: false, shouldReconcile: false },
    { modalOpen: true, headingVisibleBefore: true, shouldReconcile: false },
  ])("reconciles Details only from a newly visible modal heading and content (%o)", async ({ modalOpen, headingVisibleBefore, shouldReconcile }) => {
    const before = { ...pageObs(), content: { ...pageObs().content,
      text: headingVisibleBefore ? "Record 15\nRecord details" : "Record 15",
      // The heading index includes hidden dialogs even before they render.
      headings: ["Record 15", "Record details"],
      elements: [{ ref: "r5", tag: "button", role: "button", name: "Details…", frame: "main" }],
    } } as Observation;
    const after = { ...before, revision: 2, content: { ...before.content,
      text: "Record 15\nRecord details\nCreated by the fixture seed. Internal ref rec-15.",
      headings: ["Record 15", "Record details"],
      elements: modalOpen ? [
        { ref: "r5", tag: "button", role: "button", name: "Details…", frame: "main", occluded: true },
        { ref: "r9", tag: "button", role: "button", name: "Close", frame: "main" },
      ] : before.content.elements,
    } } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r5" }] } }] },
      { toolCalls: [{ toolCallId: "r1", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "Created by the fixture seed. Internal ref rec-15." },
        effect: "Opened the Record details dialog",
      } }] },
      { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "rec-15" } }] },
      { text: "Cannot prove the dialog opened." },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "failed" as const,
        startedAt: 1, durationMs: 1, error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const, receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: after };
    });
    h.pages.observe.mockImplementation(async () => before);
    const run = await h.coordinator.start({ goal: "open Details and read internal ref", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status === "completed").toBe(shouldReconcile);
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: shouldReconcile ? "confirmed" : "uncertain" });
  });

  it.each([
    { headingVisibleBefore: false, shouldReconcile: true },
    { headingVisibleBefore: true, shouldReconcile: false },
  ])("reconciles Edit only when an inline form and its controls newly render (%o)", async ({ headingVisibleBefore, shouldReconcile }) => {
    const before = { ...pageObs(), content: { ...pageObs().content,
      text: headingVisibleBefore ? "Record 04\nEdit record" : "Record 04\nEdit record Details…",
      headings: ["Record 04", "Edit record"],
      elements: [{ ref: "r5", tag: "button", role: "button", name: "Edit record", frame: "main" }],
    } } as Observation;
    const after = { ...before, revision: 2, content: { ...before.content,
      text: "Record 04\nEdit record\nTitle\nStatus\napproved\nSave record Cancel",
    } } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r5" }] } }] },
      { toolCalls: [{ toolCallId: "r1", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "Save record Cancel" }, effect: "Edit record form opened",
      } }] },
      { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "edit opened" } }] },
      { text: "Cannot prove the edit form opened." },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "failed" as const,
        startedAt: 1, durationMs: 1, error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const, receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: after };
    });
    h.pages.observe.mockImplementation(async () => before);
    const run = await h.coordinator.start({ goal: "open the edit form", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status === "completed").toBe(shouldReconcile);
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: shouldReconcile ? "confirmed" : "uncertain" });
  });

  it("reconciles an uncertain link click only from its recorded destination URL", async () => {
    const before = { ...pageObs(), content: { ...pageObs().content,
      url: "http://x.test/records", elements: [{ ref: "r2", tag: "a", role: "link", name: "2", href: "?page=2", frame: "main" }],
    } } as Observation;
    const after = { ...before, revision: 2, content: { ...before.content,
      url: "http://x.test/records?page=2", text: "Record 15\nurl: http://x.test/records?page=3",
    } } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r2" }] } }] },
      { toolCalls: [{ toolCallId: "r1", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "url: http://x.test/records?page=3" }, effect: "Navigated to page 3",
      } }] },
      { toolCalls: [{ toolCallId: "r2", toolName: "reconcile_action", input: {
        citation: { pageId: "p1", revision: 2, quote: "url: http://x.test/records?page=2" }, effect: "Navigated to page 2",
      } }] },
      { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "page 2" } }] },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({ stepId: s.id, op: s.op, status: "failed" as const,
        startedAt: 1, durationMs: 1, error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: after };
    });
    h.pages.observe.mockImplementation(async () => before);
    const run = await h.coordinator.start({ goal: "open page 2", pageIds: ["p1"], chatId: "chat-1", engine: "agent-loop" });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({ status: "confirmed" });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(transcript.some((message) => message.role === "tool" && JSON.stringify(message.content).includes("Cite the observed page URL"))).toBe(true);
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
