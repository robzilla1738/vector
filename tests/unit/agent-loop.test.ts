import { markModelUndispatched } from "../../apps/runtime/dist/agent/model-client.js";
import type { ExecContext } from "../../apps/runtime/src/execution/executor.js";
import { fixturePage, fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AuxError } from "@aux/contracts";
import { z } from "zod";
import { mkdtempSync, rmSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  MockModelClient,
  GoalService,
  RunFundingService,
  resourceFundingAccounting,
  TaskService,
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
afterEach(() => {
  for (const fn of cleanup.splice(0).reverse()) fn();
});

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
      toolCallId: "c1",
      toolName: "ask_user_question",
      suspension: { kind: "ask-user-question", instruction: "What color?" },
      pendingResults: [{ toolCallId: "c1", toolName: "ask_user_question", parked: true }],
    });
    expect(transcript.openPark("r1")?.toolCallId).toBe("c1");
    expect(new TranscriptStore(db).openPark("r1")?.suspension).toEqual({
      kind: "ask-user-question",
      instruction: "What color?",
    });
    expect(() => transcript.park("r1", { toolCallId: "c2", toolName: "x", pendingResults: [] })).toThrow(
      /already has a parked/,
    );
    const toolMessage: ModelMessage = {
      role: "tool",
      content: [
        {
          type: "tool-result",
          toolCallId: "c1",
          toolName: "ask_user_question",
          output: { type: "json", value: { answer: "yes" } },
        },
      ],
    } as ModelMessage;
    transcript.resolvePark("r1", toolMessage);
    expect(transcript.openPark("r1")).toBeUndefined();
    expect(() => transcript.resolvePark("r1", toolMessage)).toThrow(/park already resolved/);
    expect(transcript.load("r1").at(-1)).toMatchObject({ role: "tool" });
  });
});

describe("runAgentLoop (S5)", () => {
  it("publishes optional tools only when their original run implementation is present", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([{ text: "Done" }]);
    const calls = vi.spyOn(model, "toolCallStep");
    expect(await runAgentLoop({ ...baseOpts(transcript), model })).toMatchObject({ kind: "done" });
    const absent = calls.mock.calls[0]![0].tools;
    for (const name of [
      "x_operation",
      "google_operation",
      "linkedin_workflow",
      "desktop_context_search",
      "desktop_context_read",
      "pdf_sources",
      "pdf_render",
      "image_generate",
      "page_summary",
      "calendar_events_list",
      "memory_search",
      "memory_read",
      "history_search",
      "subagent",
      "read_file",
      "read_artifact_text",
      "notification",
      "write_todos",
    ])
      expect(absent).not.toHaveProperty(name);
    expect(absent).toHaveProperty("snapshot");

    transcript.append("run-2", [userTask]);
    const connected = new MockModelClient().scriptToolSteps([{ text: "Connected" }]);
    const connectedCalls = vi.spyOn(connected, "toolCallStep");
    const xOperation = vi.fn<NonNullable<LoopToolDeps["xOperation"]>>();
    expect(
      await runAgentLoop({ ...baseOpts(transcript, { xOperation }), runId: "run-2", model: connected }),
    ).toMatchObject({ kind: "done" });
    expect(connectedCalls.mock.calls[0]![0].tools).toHaveProperty("x_operation");
    expect(xOperation).not.toHaveBeenCalled();
  });
  it("withdraws optional tools before resuming a parked execution", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    let available = true;
    const execute = vi.fn(async () => ({
      park: { kind: "handoff" as const, instruction: "Review" },
    }));
    const tools = {
      optional: {
        description: "Optional",
        byline: "Fixture",
        inputSchema: buildToolManifest().get_time!.inputSchema,
        available: () => available,
        execute,
      },
    };
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [{ toolCallId: "optional-call", toolName: "optional", input: {} }],
      },
      { text: "Stopped optional work" },
    ]);
    const opts = { ...baseOpts(transcript), tools, model };
    // A real execution continuation is only stored for an explicitly retriable parked call.
    execute.mockImplementation(async () => ({
      park: {
        kind: "handoff",
        instruction: "Review",
        detail: { retryCall: true },
      },
    }));
    expect(await runAgentLoop(opts)).toMatchObject({ kind: "parked" });
    available = false;
    expect(await resumeAgentLoop(opts, "Continue")).toMatchObject({
      kind: "done",
    });
    expect(execute).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(transcript.load("run-1"))).toContain("Unknown tool: optional");
  });
  it("publishes only canonical captured operation branches without expanding execution grants", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const grantId = "00000000-0000-4000-8000-000000000001";
    const googleOperation = vi.fn<NonNullable<LoopToolDeps["googleOperation"]>>(async (input) => {
      if (input.operation !== "gmail.search") throw new AuxError("permission_denied", "Not captured");
      return { output: { messages: [] } };
    });
    const xOperation = vi.fn<NonNullable<LoopToolDeps["xOperation"]>>(async (input) => {
      if (input.operation !== "posts.search") throw new AuxError("permission_denied", "Not captured");
      return { output: { posts: [] } };
    });
    const googleOperations: import("@aux/contracts/google").GoogleOperation[] = ["gmail.search"];
    const xOperations = ["posts.search"] as const;
    const tools = buildToolManifest({ googleOperations, xOperations });
    googleOperations.push("gmail.send");
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "forged",
            toolName: "google_operation",
            input: {
              grantId,
              operation: "gmail.send",
              args: { to: ["fixture@example.test"], subject: "Fixture", text: "Fixture" },
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "captured-read",
            toolName: "google_operation",
            input: { grantId, operation: "gmail.search", args: { query: "in:inbox" } },
          },
        ],
      },
      { text: "No message sent" },
    ]);
    const calls = vi.spyOn(model, "toolCallStep");
    expect(
      await runAgentLoop({ ...baseOpts(transcript, { googleOperation, xOperation }), tools, model }),
    ).toMatchObject({ kind: "done" });
    const published = calls.mock.calls[0]![0].tools;
    const googleSchema = JSON.stringify(z.toJSONSchema(published.google_operation!.inputSchema));
    const xSchema = JSON.stringify(z.toJSONSchema(published.x_operation!.inputSchema));
    expect(googleSchema).toContain("gmail.search");
    expect(googleSchema).not.toContain("gmail.send");
    expect(xSchema).toContain("posts.search");
    expect(xSchema).not.toContain("messages.send");
    expect(googleOperation).toHaveBeenCalledTimes(1);
    expect(googleOperation.mock.calls[0]![0].operation).toBe("gmail.search");
    expect(xOperation).not.toHaveBeenCalled();
    expect(JSON.stringify(transcript.load("run-1"))).toContain("No matching discriminator");
    expect(buildToolManifest({ googleOperations: [], xOperations: [] })).not.toHaveProperty(
      "google_operation",
    );
    expect(buildToolManifest({ googleOperations: [], xOperations: [] })).not.toHaveProperty("x_operation");
  });
  it("parks a proven unsent model admission and resumes without inventing a tool transcript", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const park = {
      kind: "approval" as const,
      instruction: "Review account rule",
      approvalId: "original-review",
    };
    let waiting = true;
    const cancel = vi.fn(),
      failed = vi.fn();
    const model = new MockModelClient().scriptToolSteps([{ text: "Done" }]);
    const original = model.toolCallStep.bind(model);
    const toolCallStep = vi.spyOn(model, "toolCallStep").mockImplementation(async (options) => {
      if (waiting) throw markModelUndispatched(new AuxError("needs_input", park.instruction));
      return original(options);
    });
    const opts = {
      ...baseOpts(transcript, { pendingPark: () => (waiting ? park : undefined) }),
      model,
      beforeModelCall: () => "reservation",
      onModelAdmissionCancelled: cancel,
      onModelFailure: failed,
    };
    expect(await runAgentLoop(opts)).toEqual({ kind: "model_admission", park });
    expect(cancel).toHaveBeenCalledWith("reservation");
    expect(failed).not.toHaveBeenCalled();
    expect(transcript.openPark("run-1")).toBeUndefined();
    expect(transcript.load("run-1")).toEqual([userTask]);
    waiting = false;
    expect(await runAgentLoop(opts)).toMatchObject({ kind: "done", text: "Done" });
    expect(toolCallStep).toHaveBeenCalledTimes(2);
    expect(transcript.load("run-1").map((message) => message.role)).toEqual(["user", "assistant"]);

    waiting = true;
    toolCallStep.mockRejectedValueOnce(new AuxError("needs_input", "Untrusted provider message"));
    expect(await runAgentLoop(opts)).toMatchObject({ kind: "failed" });
    expect(failed).toHaveBeenCalledTimes(1);
    expect(cancel).toHaveBeenCalledTimes(1);
    const stop = new AbortController();
    stop.abort();
    expect(await runAgentLoop({ ...opts, signal: stop.signal })).toMatchObject({
      kind: "failed",
      error: { code: "cancelled" },
    });
    expect(toolCallStep).toHaveBeenCalledTimes(3);
  });
  it("rejects a trailing download waiter before dispatching its preceding click", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const act = vi.fn(async () => ({ output: { status: "completed" } }));
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "a1",
            toolName: "act",
            input: {
              steps: [
                { id: "click", op: "click", target: "r1" },
                { id: "wait", op: "expectDownload" },
              ],
            },
          },
        ],
      },
      { text: "The download was not triggered." },
    ]);
    await runAgentLoop({ ...baseOpts(transcript, { act }), model });
    expect(act).not.toHaveBeenCalled();
    expect(JSON.stringify(transcript.load("run-1"))).toContain("no page action was dispatched");
  });

  it("returns fresh citable progress when a first-turn script fails after changing the page", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const repl = vi.fn(async () => {
      throw new Error("Record link name was ambiguous");
    });
    const replProgress = vi.fn(async () => ({
      pageId: "page-1",
      observationId: "obs-after-nav",
      revision: 2,
      text: 'url: http://x.test/records?page=2\nr10 link "Record 15" href=/records/rec-15',
    }));
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'page.followLinkByName("2"); submitResult("done")',
              answerLabel: "",
            },
          },
        ],
      },
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
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: { code: 'submitResult("done")', answerLabel: "" },
          },
        ],
      },
      { text: "The page could not be observed." },
    ]);
    await runAgentLoop({
      ...baseOpts(transcript, {
        repl: async () => {
          throw new Error("original script failure");
        },
        replProgress: async () => {
          throw new Error("snapshot unavailable");
        },
      }),
      model,
    });
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
      {
        toolCalls: [
          {
            toolCallId: "c1",
            toolName: "repl",
            input: { code: "sleep(40); submitResult('done')", yieldTimeMs: 0 },
          },
        ],
      },
      { toolCalls: [{ toolCallId: "c2", toolName: "repl_wait", input: { cellId } }] },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript, { repl, replWait }), model });
    expect(outcome).toMatchObject({ kind: "done", result: { report: "done" } });
    expect(repl).toHaveBeenCalledOnce();
    expect(replWait).toHaveBeenCalledOnce();
    expect(transcript.load("run-1").filter((message) => message.role === "tool")).toHaveLength(2);
  });
  it("offers the same full tools from the first page turn through a safe fallback", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const seen: string[][] = [];
    let turn = 0;
    const model: NonNullable<AgentLoopOptions["model"]["toolCallStep"]> = async ({ tools }) => {
      seen.push(Object.keys(tools));
      turn++;
      const toolCalls =
        turn === 1
          ? [
              {
                toolCallId: "g1",
                toolName: "goal_program",
                input: { code: "page.navigateMatching('rec-14')", answerLabel: "" },
              },
            ]
          : [{ toolCallId: "s1", toolName: "submit_result", input: { report: "fallback" } }];
      return { message: { role: "assistant", content: [] } as ModelMessage, toolCalls, durationMs: 0 };
    };
    const result = await runAgentLoop({
      ...baseOpts(transcript, {
        repl: async () => {
          throw new Error("should not execute incomplete program");
        },
        submitResult: async ({ report }) => ({ ok: true, result: { report } }),
      }),
      model: { toolCallStep: model },
    });
    expect(result).toMatchObject({ kind: "done", text: "fallback" });
    expect(seen[0]).toEqual(seen[1]);
    expect(seen[0]).toContain("goal_program");
    expect(seen[0]).toContain("snapshot");
    expect(seen[0]).toContain("repl");
    expect(seen[1]).toContain("snapshot");
    expect(seen[1]).toContain("repl");
  });

  it("closes an unanswered call after a crash without replaying its effect", async () => {
    const { transcript, db } = fixture();
    transcript.append("run-1", [
      userTask,
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "write-1",
            toolName: "webfetch",
            input: { url: "https://example.com" },
          },
        ],
      } as ModelMessage,
    ]);
    let executions = 0;
    let sawRecovery = false;
    const model: NonNullable<AgentLoopOptions["model"]["toolCallStep"]> = async ({ messages }) => {
      sawRecovery = messages.some(
        (message) => message.role === "tool" && JSON.stringify(message).includes("outcome is unknown"),
      );
      return {
        message: {
          role: "assistant",
          content: [{ type: "text", text: "I need to inspect the state." }],
        } as ModelMessage,
        toolCalls: [],
        text: "I need to inspect the state.",
        finishReason: "stop",
        durationMs: 0,
      };
    };
    const outcome = await runAgentLoop({
      ...baseOpts(new TranscriptStore(db), {
        webFetch: async () => {
          executions++;
          return { output: "unexpected" };
        },
      }),
      model: { toolCallStep: model },
    });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(sawRecovery).toBe(true);
    expect(executions).toBe(0);
    expect(transcript.load("run-1").map((message) => message.role)).toEqual([
      "user",
      "assistant",
      "tool",
      "assistant",
    ]);
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
      webFetch: async (url) => {
        seen.url = url;
        return { output: { title: "Example" } };
      },
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
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: {
              report: "verified answer",
              citations: [{ pageId: "page-1", quote: "x" }],
              textProposal: "A reviewed draft.",
            },
          },
        ],
      },
      { text: "unreached" },
    ]);
    const seen: unknown[] = [];
    const deps: LoopToolDeps = {
      submitResult: async (input) => {
        seen.push(input);
        return { ok: true, result: { report: input.report, verified: true } };
      },
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({
      kind: "done",
      text: "verified answer",
      result: { report: "verified answer", verified: true },
    });
    expect(seen[0]).toMatchObject({ report: "verified answer", textProposal: "A reviewed draft." });
    // The terminal call's result is the honest {accepted:true} — pairing holds.
    const toolMsg = transcript.load("run-1").find((m) => m.role === "tool");
    expect(JSON.stringify(toolMsg?.content)).toMatch(/accepted/);
  });

  it("keeps looping when submit_result verification rejects — the error is the model's to fix", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "done", citations: [{ pageId: "page-1", quote: "fabricated" }] },
          },
        ],
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
    const outcome = await runAgentLoop({
      ...baseOpts(transcript, { webFetch: async () => ({ output: "unreached" }) }),
      model,
    });
    expect(outcome).toMatchObject({ kind: "done" });
    const result = (transcript.load("run-1")[1]!.content as unknown[])[0] as {
      output: { type: string; value: unknown };
    };
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
    const result = (transcript.load("run-1")[1]!.content as unknown[])[0] as {
      output: { type: string; value: unknown };
    };
    expect(String(result.output.value)).toMatch(/Unknown tool/);
  });

  it("enforces requiresSoloCall on suspension tools", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "ask_user_question", input: { question: "which?" } },
          { toolCallId: "a2", toolName: "get_time", input: {} },
        ],
      },
      { text: "ok" },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(transcript.openPark("run-1")).toBeUndefined();
    const results = transcript.load("run-1")[1]!.content as {
      toolCallId: string;
      output: { type: string; value: unknown };
    }[];
    const solo = results.find((r) => r.toolCallId === "a1")!;
    expect(solo.output.type).toBe("error-text");
    expect(String(solo.output.value)).toMatch(/only tool call/);
    const other = results.find((r) => r.toolCallId === "a2")!;
    expect(JSON.stringify(other.output.value)).toMatch(/iso|unixMs/);
  });

  it("parks on ask_user_question and resumes with the answer as the tool result", async () => {
    const { transcript, db } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [{ toolCallId: "q1", toolName: "ask_user_question", input: { question: "blue or red?" } }],
      },
      { text: "picked blue" },
    ]);
    const parked = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(parked).toMatchObject({
      kind: "parked",
      toolCallId: "q1",
      park: { kind: "ask-user-question", instruction: "blue or red?" },
    });
    expect(transcript.openPark("run-1")).toMatchObject({ toolCallId: "q1" });

    // simulate restart: new store over the same db still finds the open park
    expect(new TranscriptStore(db).openPark("run-1")).toMatchObject({ toolCallId: "q1" });

    const resumed = await resumeAgentLoop({ ...baseOpts(transcript), model }, "blue");
    expect(resumed).toMatchObject({ kind: "done", text: "picked blue" });
    const toolMessage = transcript.load("run-1").find((m) => m.role === "tool")!;
    const part = (
      toolMessage.content as { toolCallId: string; output: { type: string; value: unknown } }[]
    )[0]!;
    expect(part.toolCallId).toBe("q1");
    expect(part.output).toMatchObject({ type: "text", value: "blue" });
  });

  it("resumes the exact governed call after restart and another decision without replaying prior calls", async () => {
    const { transcript, db } = fixture();
    let approval = 0,
      writes = 0,
      prior = 0;
    const calls: string[] = [];
    const deps: LoopToolDeps = {
      codingTool: async (_name, input, context) => {
        calls.push(context.toolCallId!);
        if (approval < 2)
          throw new AuxError("needs_input", "Review write", {
            park: {
              kind: "action-confirmation",
              instruction: "Review write",
              approvalId: `approval-${approval}`,
            },
          });
        writes++;
        return { output: { written: input } };
      },
    };
    const options = baseOpts(transcript, deps);
    options.tools.get_time!.execute = () => {
      prior++;
      return { output: { time: 1 } };
    };
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "prior", toolName: "get_time", input: {} },
          {
            toolCallId: "write",
            toolName: "apply_changes",
            input: { changes: [{ kind: "create", path: "/project/a", content: "x" }] },
          },
        ],
      },
      { text: "done" },
    ]);
    expect((await runAgentLoop({ ...options, model })).kind).toBe("parked");
    approval = 1;
    const reopened = new TranscriptStore(db);
    expect((await resumeAgentLoop({ ...options, transcript: reopened, model }, "approved")).kind).toBe(
      "parked",
    );
    approval = 2;
    expect((await resumeAgentLoop({ ...options, transcript: reopened, model }, "approved")).kind).toBe(
      "done",
    );
    expect(prior).toBe(1);
    expect(writes).toBe(1);
    expect(calls).toEqual(["write", "write", "write"]);
    const results = reopened.load("run-1").filter((message) => message.role === "tool");
    expect(results).toHaveLength(1);
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
      ...baseOpts(transcript),
      model,
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
    const outcome = await runAgentLoop({
      ...baseOpts(transcript),
      model: new MockModelClient(),
      signal: controller.signal,
    });
    expect(outcome).toMatchObject({ kind: "failed" });
  });

  it("executes leaked submit_result markup in the same model turn", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      {
        text: '<atem:function_calls><atem:invoke name="default.submit_result"><atem:parameter name="report">Jordan Lee</atem:parameter><atem:parameter name="citations">[{"observationId": "art_1", "quote": "Jordan Lee"}]</atem:parameter></atem:invoke></atem:function_calls>',
      },
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
    expect(seen).toEqual([
      { report: "Jordan Lee", citations: [{ observationId: "art_1", quote: "Jordan Lee" }] },
    ]);
    expect(transcript.load("run-1").some((m) => String(m.content).includes("should not be called"))).toBe(
      false,
    );
  });

  it("nudges when leaked markup is not a complete tool call", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([
      { text: "<atem:function_calls>not an invoke</atem:function_calls>" },
      { text: "real answer" },
    ]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done", text: "real answer" });
    const nudge = transcript
      .load("run-1")
      .find((m) => m.role === "user" && String(m.content).includes("function-call markup"));
    expect(nudge).toBeTruthy();
  });

  it("does not complete a run from an empty assistant turn", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([{ text: "" }, { text: "42" }]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done", text: "42" });
    expect(
      transcript
        .load("run-1")
        .some((m) => m.role === "user" && String(m.content).includes("no tool call or answer")),
    ).toBe(true);
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
        webFetch: async (url) => {
          order.push(`fetch:${url}`);
          return { output: { title: "Example" } };
        },
        submitResult: async (input) => {
          order.push(`submit:${input.report}`);
          return { ok: true, result: { report: input.report } };
        },
      }),
      model,
    });
    expect(outcome).toMatchObject({ kind: "done", text: "fetched" });
    expect(order).toEqual(["fetch:https://example.com/a", "submit:fetched"]);
  });

  it("pairs skipped calls when an accepted submit_result ends a multi-call turn", async () => {
    const { transcript } = fixture();
    let executions = 0;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "s1", toolName: "submit_result", input: { report: "done" } },
          { toolCallId: "s2", toolName: "submit_result", input: { report: "stale" } },
        ],
      },
    ]);
    const result = await runAgentLoop({
      ...baseOpts(transcript, {
        submitResult: async () => {
          executions++;
          return { ok: true, result: { report: "done" } };
        },
      }),
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

  it("releases admission after a proven credential refusal but retains ambiguous dispatch accounting", async () => {
    const { transcript } = fixture();
    const cancelled = vi.fn(async () => {}),
      failed = vi.fn(async () => {});
    const error = markModelUndispatched(new Error("Original credential retired"));
    await runAgentLoop({
      ...baseOpts(transcript),
      model: {
        toolCallStep: async () => {
          throw error;
        },
      },
      onModelAdmissionCancelled: cancelled,
      onModelFailure: failed,
    });
    expect(cancelled).toHaveBeenCalledOnce();
    expect(failed).not.toHaveBeenCalled();
    await runAgentLoop({
      ...baseOpts(transcript),
      model: {
        toolCallStep: async () => {
          throw new Error("Network outcome unknown");
        },
      },
      onModelAdmissionCancelled: cancelled,
      onModelFailure: failed,
    });
    expect(failed).toHaveBeenCalledOnce();
    expect(cancelled).toHaveBeenCalledOnce();
  });

  it("beforeModelCall gates the step — a spent budget fails the run without billing a call", async () => {
    const { transcript } = fixture();
    const model = new MockModelClient().scriptToolSteps([{ text: "unreached" }]);
    const outcome = await runAgentLoop({
      ...baseOpts(transcript),
      model,
      beforeModelCall: () => {
        throw new AuxError("permission_denied", "The user-set run budget is spent.");
      },
    });
    expect(outcome).toMatchObject({ kind: "failed", error: { code: "permission_denied" } });
    expect(transcript.count("run-1")).toBe(0); // no assistant step was billed or persisted
  });

  it("fails before billing when protected task instructions exceed the working budget", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [{ role: "user", content: "x".repeat(200_000) }]);
    let calls = 0;
    const outcome = await runAgentLoop({
      ...baseOpts(transcript),
      model: {
        toolCallStep: async () => {
          calls++;
          throw new Error("unreachable");
        },
      },
    });
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
    const db = openDb(join(directory, "shared.sqlite"));
    cleanup.push(() => db.close());
    const store = new TranscriptStore(db);
    store.append("r", [userTask]);
    expect(store.count("r")).toBe(1);
  });
});

// ---------- runToolLoop: the coordinator host (engine "agent-loop") ----------

import type { Observation, PlanStep, StepOutcome } from "@aux/contracts";
import { ArtifactStore, EventBus, Repo, RunCoordinator } from "@aux/runtime";

const pageObs = (): Observation =>
  ({
    pageId: "p1",
    documentEpoch: 1,
    revision: 1,
    observedAt: Date.now(),
    scope: "full",
    content: {
      url: "http://x.test/order",
      title: "Order",
      viewport: { width: 1, height: 1, scale: 1 },
      scroll: { y: 0, maxY: 0 },
      frames: [],
      text: "Order page",
      headings: [],
      elements: [{ ref: "r1", tag: "button", role: "button", name: "Save", frame: "main" }],
      formFields: [],
      tables: [],
      links: [],
      dialogs: [],
      truncated: false,
      stats: { elementsTotal: 1, elementsShown: 1 },
    },
  }) as unknown as Observation;

function coordinatorHarness(
  model: MockModelClient,
  execute?: (
    program: { steps: PlanStep[] },
    ctx?: ExecContext,
  ) => { status: string; steps: StepOutcome[]; observation?: Observation },
) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const repo = new Repo(db);
  const events = new EventBus(repo);
  const dispatch = vi.fn(
    async (program: { steps: PlanStep[] }, ctx?: ExecContext) =>
      execute?.(program, ctx) ?? { status: "completed", steps: [] },
  );
  const pages = {
    observe: vi.fn(async () => pageObs()),
    execute: vi.fn(async (program: { steps: PlanStep[] }, ctx?: ExecContext) => {
      const resumed: StepOutcome[] = [];
      const steps = program.steps.filter((step) => {
        const outcome = ctx?.resumeStep?.(step);
        if (!outcome) return true;
        resumed.push(outcome);
        ctx?.onStep?.(outcome, step);
        return false;
      });
      if (!steps.length && resumed.length) return { status: "completed", steps: resumed };
      const emitted = new Set<string>();
      // A mocked driver outcome is its dispatch boundary. Admission failures never dispatch;
      // dispatched failures still begin and settle a real durable intent, as the executor does.
      const emit: NonNullable<ExecContext["onStep"]> = (outcome, step) => {
        if (emitted.has(step.id)) return;
        emitted.add(step.id);
        if (outcome.error?.code !== "needs_input") {
          ctx?.beforeJournal?.();
          ctx?.beforeDispatch?.(step);
          ctx?.settleStep?.(outcome, step);
        }
        ctx?.onStep?.(outcome, step);
      };
      const result = await dispatch({ ...program, steps }, { ...ctx, onStep: emit });
      for (const [index, outcome] of result.steps.entries()) {
        const step = steps[index];
        if (step) emit(outcome, step);
      }
      return { ...result, steps: [...resumed, ...result.steps] };
    }),
    livePageIds: () => ["p1"],
    get: (fixturePageId: string): import("@aux/contracts").PageTarget => ({
      ...fixturePage(fixturePageId, "http://x.test/order", 1),
      viewStatus: "visible",
      documentEpoch: 1,
      url: "http://x.test/order",
    }),
  };
  const modelCalls: { role: string; modelId: string; error?: string }[] = [];
  const coordinator = new RunCoordinator({
    turnMentions: fixtureTurnMentions((pageId) => pages.get(pageId)),
    repo,
    events,
    pages: pages as never,
    model: () => model,
    defaultModel: () => "test/agent",

    recordModelCall: (call: {
      runId: string;
      role: string;
      modelId: string;
      durationMs: number;
      error?: string;
    }) => {
      modelCalls.push(call);
      repo.saveModelCall({
        callId: randomUUID(),
        ...call,
        role: call.role as "agent",
        createdAt: Date.now(),
      });
    },
  });
  return { db, repo, coordinator, pages, dispatch, modelCalls };
}

async function settle(repo: Repo, runId: string) {
  for (let i = 0; i < 400; i++) {
    const run = repo.getRun(runId)!;
    if (["completed", "partially_completed", "failed", "cancelled", "interrupted"].includes(run.status))
      return run;
    await new Promise((r) => setTimeout(r, 10));
  }
  throw new Error("run did not settle");
}

describe("runToolLoop (S5 host integration)", () => {
  it("waits for an original model admission review and continues the same run without a tool park", async () => {
    const model = new MockModelClient().scriptToolSteps([{ text: "Account admitted" }]);
    const h = coordinatorHarness(model);
    vi.spyOn(model, "toolCallStep").mockImplementationOnce(async () => {
      const runId = h.repo.listRuns()[0]!.runId;
      h.coordinator.suspensions.park({
        runId,
        turnId: runId,
        threadId: "chat-1",
        kind: "approval",
        request: {
          kind: "approval",
          approvalId: "original-account-review",
          instruction: "Review account rule",
          guidance: "Wait.",
        },
      });
      throw markModelUndispatched(new AuxError("needs_input", "Review account rule"));
    });
    const run = await h.coordinator.start({ goal: "Read the page", pageIds: ["p1"], chatId: "chat-1" });
    await vi.waitFor(() => expect(h.repo.getRun(run.runId)?.status).toBe("needs_input"));
    const transcript = new TranscriptStore(h.db);
    expect(transcript.openPark(run.runId)).toBeUndefined();
    expect(h.modelCalls).toHaveLength(0);
    await h.coordinator.answer(run.runId, "Approved");
    expect(await settle(h.repo, run.runId)).toMatchObject({
      status: "completed",
      result: { report: "Account admitted" },
    });
    expect(h.modelCalls).toHaveLength(1);
    expect(transcript.load(run.runId).some((message) => message.role === "tool")).toBe(false);
    expect(h.coordinator.suspensions.pending(run.runId)).toBeUndefined();
  });
  it("restores the saved current plan as bounded harness context before the next model call", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "plan",
            toolName: "write_todos",
            input: { todos: ["Update parser", "Check changed behavior"] },
          },
        ],
      },
      { text: "Plan saved" },
    ]);
    const calls = vi.spyOn(model, "toolCallStep");
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "Update parser", pageIds: [], chatId: "chat-1" });
    await settle(h.repo, run.runId);
    expect(JSON.stringify(calls.mock.calls[1]?.[0])).toContain("Current durable plan:");
    expect(JSON.stringify(calls.mock.calls[1]?.[0])).toContain("Update parser\\nCheck changed behavior");
  });

  it("persists a fork prefix with its own task before the actual child SDK dispatch", async () => {
    const model = new MockModelClient().scriptToolSteps([{ text: "Child findings" }]);
    const nextStep = model.toolCallStep.bind(model);
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    const entered = vi.fn((request: Parameters<typeof model.toolCallStep>[0]) => request);
    model.toolCallStep = async (request) => {
      entered(request);
      await held;
      return nextStep(request);
    };
    const h = coordinatorHarness(model);
    const transcript = new TranscriptStore(h.db, h.repo.columnCipher);
    const prefix: ModelMessage[] = [
      { role: "user", content: "Original source task" },
      {
        role: "assistant",
        content: [{ type: "tool-call", toolCallId: "source-read", toolName: "snapshot", input: {} }],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "source-read",
            toolName: "snapshot",
            output: { type: "json", value: { title: "Source findings" } },
          },
        ],
      },
    ];
    const run = await h.coordinator.start({
      goal: "Follow the findings",
      pageIds: [],
      modelId: "test/source-model",
      forkTranscript: prefix,
    });
    try {
      await vi.waitFor(() => expect(entered).toHaveBeenCalledOnce());
      const persisted = new TranscriptStore(h.db, h.repo.columnCipher).load(run.runId);
      expect(persisted.slice(0, prefix.length)).toEqual(prefix);
      expect(persisted[prefix.length]).toEqual({ role: "user", content: "Task: Follow the findings" });
      expect(entered.mock.calls[0]?.[0].messages.slice(0, prefix.length + 1)).toEqual(persisted);
      expect(h.repo.getRun(run.runId)?.config?.modelId).toBe("test/source-model");
      expect(h.repo.getRun(run.runId)?.config).not.toHaveProperty("forkTranscript");
      expect(h.pages.execute).not.toHaveBeenCalled();
      expect(h.pages.observe).not.toHaveBeenCalled();
      expect(transcript.load(run.runId)).toEqual(persisted);
    } finally {
      release();
      await settle(h.repo, run.runId);
    }
    expect(h.repo.getRun(run.runId)?.status).toBe("completed");
    expect(h.pages.execute).not.toHaveBeenCalled();
  });

  it("publishes a page-free live answer before completion through the existing answer event", async () => {
    const model = new MockModelClient().scriptToolSteps([{ text: "Complete page-free answer" }]);
    const nextStep = model.toolCallStep.bind(model);
    let release!: () => void;
    const held = new Promise<void>((resolve) => {
      release = resolve;
    });
    model.toolCallStep = async (opts) => {
      (opts as typeof opts & { onText?: (text: string) => void }).onText?.("Live page-free answer");
      await held;
      (opts as typeof opts & { onText?: (text: string) => void }).onText?.("Complete page-free answer");
      return nextStep(opts);
    };
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({ goal: "Chat without a page", pageIds: [] });
    try {
      await vi.waitFor(() =>
        expect(
          h.coordinator.deps.events
            .since(0)
            .events.some(
              (event) => event.type === "run.answer.delta" && event.payload.text === "Live page-free answer",
            ),
        ).toBe(true),
      );
      expect(h.repo.getRun(run.runId)?.status).toBe("running");
      expect(h.pages.observe).not.toHaveBeenCalled();
      expect(h.pages.execute).not.toHaveBeenCalled();
    } finally {
      release();
      await settle(h.repo, run.runId);
    }
    expect(h.repo.getRun(run.runId)?.result).toMatchObject({ report: "Complete page-free answer" });
    expect(
      h.coordinator.deps.events
        .since(0)
        .events.filter((event) => event.type === "run.answer.delta")
        .at(-1)?.payload,
    ).toMatchObject({ text: "Complete page-free answer", seq: 2 });
  });

  it.each([
    {
      target: "safe-host",
      status: "needs_input",
      gateCount: 1,
      calls: 1,
      checkEvidence: (evidence: { pending: unknown; park: unknown; row: unknown; transcript: string }) => {
        expect(evidence.pending).toMatchObject({ kind: "approval" });
        expect(evidence.park).toMatchObject({ toolCallId: "first-chat-open-real-url" });
        expect(evidence.row).toEqual({ n: 1 });
      },
    },
    {
      target: "private-address",
      status: "needs_input",
      gateCount: 0,
      calls: 3,
      checkEvidence: (evidence: { pending: unknown; park: unknown; row: unknown; transcript: string }) => {
        expect(evidence.pending).toMatchObject({
          kind: "budget",
          request: { budget: { reason: "model_calls", limit: 3 } },
        });
        expect(evidence.transcript).toContain("Web tools cannot contact a private or local network address.");
        expect(evidence.transcript).not.toContain("redeclaration");
      },
    },
  ])(
    "enforces the actual page-free streamed REPL openTab boundary for $target",
    async ({ target, status, gateCount, calls, checkEvidence }) => {
      const { createRequire } = await import("node:module");
      const { createFixture } = await import("../support/fixture.mjs");
      const { createModelFixture } = await import("../support/model-fixture.mjs");
      const runtimeRequire = createRequire(new URL("../../apps/runtime/package.json", import.meta.url));
      const { createOpenAI } = await import(runtimeRequire.resolve("@ai-sdk/openai"));
      const { streamText } = await import(runtimeRequire.resolve("ai"));
      const fixture = await createFixture();
      const transport = createModelFixture(fixture);
      const destination =
        target === "safe-host"
          ? "http://aux-recovery.fixture.test/first-chat/opened"
          : `${fixture.url}/first-chat/opened`;
      const code = `const opened = openTab(${JSON.stringify(destination)}); display(opened); submitResult("Explicit tool destination opened.");`;
      transport.respond(() => ({
        tool_calls: [
          {
            id: "first-chat-open-real-url",
            type: "function",
            function: { name: "repl", arguments: JSON.stringify({ code }) },
          },
        ],
      }));
      try {
        const provider = createOpenAI({ apiKey: "synthetic-loopback-only", baseURL: transport.endpoint });
        const decoded = streamText({
          model: provider.chat("fixture-model"),
          prompt: "Open synthetic destination",
          maxRetries: 0,
          tools: { repl: { inputSchema: buildToolManifest().repl!.inputSchema } },
        });
        for await (const _part of decoded.fullStream) {
          /* Consume the actual SDK transport before dispatch. */
        }
        const toolCalls = await decoded.toolCalls;
        expect(toolCalls).toHaveLength(1);
        expect(toolCalls[0]).toMatchObject({
          toolCallId: "first-chat-open-real-url",
          toolName: "repl",
          input: { code },
        });
        const model = new MockModelClient().scriptToolSteps([{ toolCalls }]);
        const h = coordinatorHarness(model);
        let gateCalls = 0;
        h.coordinator.deps.agentLoop = {
          repl: {
            openTab: async (url, ctx) => {
              expect(url).toBe(destination);
              gateCalls++;
              // Controlled gate response; no site grant or native consent is fabricated.
              h.coordinator.suspensions.park({
                runId: ctx.runId,
                threadId: ctx.threadId,
                turnId: ctx.turnId,
                kind: "approval",
                request: {
                  kind: "approval",
                  approvalId: "ap-first-chat",
                  instruction: "Approve this destination?",
                  guidance: "Wait for actual person input.",
                },
              });
              return {
                park: {
                  kind: "approval",
                  approvalId: "ap-first-chat",
                  instruction: "Approve this destination?",
                },
              };
            },
          },
        };
        const run = await h.coordinator.start({
          goal: "Open the synthetic destination",
          pageIds: [],
          maxModelCalls: 3,
        });
        try {
          await vi.waitFor(() =>
            expect(["needs_input", "failed"]).toContain(h.repo.getRun(run.runId)?.status),
          );
          const transcript = new TranscriptStore(h.db).load(run.runId);
          expect(h.repo.getRun(run.runId)?.pageIds).toEqual([]);
          expect(h.pages.observe).not.toHaveBeenCalled();
          expect(h.pages.execute).not.toHaveBeenCalled();
          expect(h.repo.getRun(run.runId)?.status).toBe(status);
          expect(gateCalls).toBe(gateCount);
          expect(h.modelCalls).toHaveLength(calls);
          checkEvidence({
            pending: h.coordinator.suspensions.pending(run.runId),
            park: new TranscriptStore(h.db).openPark(run.runId),
            row: h.db.prepare("SELECT COUNT(*) AS n FROM safety_suspensions WHERE run_id=?").get(run.runId),
            transcript: JSON.stringify(transcript),
          });
        } finally {
          await h.coordinator.cancel(run.runId);
        }
      } finally {
        transport.close();
        await fixture.close();
      }
    },
  );

  it("funds a real Goal turn and only completes on accepted submit_result", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "done", toolName: "submit_result", input: { report: "Fixture result" } }] },
    ]);
    model.inputTokens = 20;
    model.outputTokens = 10;
    const h = coordinatorHarness(model);
    const space = new TaskService(h.repo, new EventBus(h.repo)).createWorkspace("Goal fixture");
    const runs = {
      start: (input: {
        deliveryRunId: string;
        goal: string;
        pageIds: string[];
        chatId?: string;
        maxCostUsd?: number;
        deadlineMs?: number;
      }) =>
        h.coordinator.start({
          runId: input.deliveryRunId,
          goal: input.goal,
          pageIds: input.pageIds,
          chatId: input.chatId,
          maxCostUsd: input.maxCostUsd,
          deadlineMs: input.deadlineMs,
        }),
      pause: (runId: string) => h.coordinator.pause(runId),
      resume: (runId: string) => h.coordinator.resume(runId),
      cancel: (runId: string) => h.coordinator.cancel(runId),
    } as unknown as ConstructorParameters<typeof GoalService>[1];
    const goals = new GoalService(h.repo, runs);
    h.coordinator.deps.funding = new RunFundingService(
      h.repo,
      resourceFundingAccounting(h.repo),
      async () => [{ id: "test/agent", source: "configured", inputUsdPerMTok: 1, outputUsdPerMTok: 1 }],
    );
    const goal = goals.create({
      workspaceId: space.workspaceId,
      chatId: "chat-goal",
      objective: "Read fixture",
      budget: { maxTokens: 200_000, maxCostUsd: 1 },
    });
    const started = await goals.start(goal.goalId, ["p1"]);
    const completed = await settle(h.repo, started.runId!);
    expect(completed).toMatchObject({ status: "completed", result: { report: "Fixture result" } });
    expect(goals.get(goal.goalId)).toMatchObject({ status: "completed", usedTokens: 30, reservedTokens: 0 });
    expect(h.modelCalls).toHaveLength(1);
    model.scriptToolSteps([{ text: "I think it is done" }]);
    const second = goals.create({
      workspaceId: space.workspaceId,
      chatId: "chat-goal",
      objective: "Need proof",
      budget: { maxTokens: 200_000 },
    });
    const unverified = await goals.start(second.goalId, ["p1"]);
    expect((await settle(h.repo, unverified.runId!)).status).toBe("failed");
    expect(goals.get(second.goalId).status).toBe("failed");
    const before = h.modelCalls.length;
    const tooSmall = goals.create({
      workspaceId: space.workspaceId,
      chatId: "chat-goal",
      objective: "x".repeat(10_000),
      budget: { maxTokens: 20_000 },
    });
    const rejected = await goals.start(tooSmall.goalId, ["p1"]);
    await vi.waitFor(() => expect(h.repo.getRun(rejected.runId!)?.status).toBe("needs_input"));
    expect(h.coordinator.suspensions.pending(rejected.runId!)).toMatchObject({
      kind: "budget",
      request: {
        budget: { reason: "tokens", limit: 20_000, funding: { kind: "goal", ownerId: tooSmall.goalId } },
      },
    });
    expect(h.modelCalls).toHaveLength(before);
  });

  it("interrupts a model turn for takeover and observes again before resuming", async () => {
    const model = new MockModelClient().scriptToolSteps([{ text: "after takeover" }]);
    const nextStep = model.toolCallStep.bind(model);
    let started!: () => void;
    const pending = new Promise<void>((resolve) => {
      started = resolve;
    });
    let calls = 0;
    model.toolCallStep = async (opts) => {
      if (++calls === 1) {
        started();
        await new Promise<void>((_resolve, reject) =>
          (opts as typeof opts & { signal?: AbortSignal }).signal?.addEventListener(
            "abort",
            () => reject(new AuxError("cancelled", "takeover interrupted this turn")),
            { once: true },
          ),
        );
        throw new Error("unreachable");
      }
      return nextStep(opts);
    };
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({
      goal: "read after owner",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    await pending;
    await h.coordinator.pause(run.runId);
    h.coordinator.interruptForTakeover(run.runId);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(h.repo.getRun(run.runId)?.status).toBe("paused");
    await h.coordinator.resume(run.runId);
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "after takeover" });
    expect(h.pages.observe).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).toContain(
      "fresh page snapshot after takeover",
    );
  });
  it.each([false, true])("selects an unchecked radio with a check receipt, batched=%s", async (batched) => {
    const before = {
      ...pageObs(),
      content: {
        ...pageObs().content,
        text: "Pro plan",
        elements: [
          { ref: "r2", tag: "input", role: "textbox", name: "Name", value: "", frame: "main" },
          { ref: "r11", tag: "input", role: "radio", name: "Pro", checked: false, frame: "main" },
        ],
      },
    } as Observation;
    const after = {
      ...before,
      revision: 2,
      content: {
        ...before.content,
        elements: [{ ref: "r11", tag: "input", role: "radio", name: "Pro", checked: true, frame: "main" }],
      },
    } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "a1",
            toolName: "act",
            input: {
              steps: [
                ...(batched ? [{ id: "fill-name", op: "fill", target: "r2", value: "Morgan Vale" }] : []),
                { id: "select-pro", op: "click", target: "r11" },
              ],
            },
          },
        ],
      },
      { toolCalls: [{ toolCallId: "done", toolName: "submit_result", input: { report: "Pro selected" } }] },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((step) => ({
        stepId: step.id,
        op: step.op,
        status: "ok" as const,
        startedAt: 1,
        durationMs: 1,
        effect: "observed" as const,
        before: step.op === "fill" ? { value: "" } : { checked: false },
        after: step.op === "fill" ? { value: "Morgan Vale" } : { checked: true },
        receipt: {
          observed: "control value changed after action",
          remoteConfirmed: false,
          uncertain: false,
          dispatchedBeforeTakeover: false,
        },
      }));
      for (const [i, step] of program.steps.entries()) ctx?.onStep?.(steps[i]!, step);
      return { status: "completed", steps, observation: after };
    });
    h.pages.observe.mockResolvedValue(before);
    const run = await h.coordinator.start({
      goal: "Select Pro plan",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    await settle(h.repo, run.runId);
    expect(h.pages.execute).toHaveBeenCalledOnce();
    expect(h.pages.execute.mock.calls[0]?.[0].steps.map((step) => step.op)).toEqual(
      batched ? ["fill", "check"] : ["check"],
    );
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").all(run.runId)).toEqual(
      Array.from({ length: batched ? 2 : 1 }, () => ({ status: "confirmed" })),
    );
  });

  it.each([
    { write: "type", prefix: false, suffix: false },
    { write: "fill", prefix: false, suffix: false },
    { write: "type", prefix: true, suffix: false },
    { write: "fill", prefix: true, suffix: false },
    { write: "type", prefix: false, suffix: true },
    { write: "fill", prefix: false, suffix: true },
    { write: "type", prefix: true, suffix: true },
    { write: "fill", prefix: true, suffix: true },
  ] as const)(
    "rejects a rich-text focus click before $write without partial dispatch (prefix=$prefix, suffix=$suffix)",
    async ({ write, prefix, suffix }) => {
      const before = {
        ...pageObs(),
        content: {
          ...pageObs().content,
          text: "Bio (rich text)",
          elements: [
            { ref: "r12", tag: "div", name: "Bio (rich text)", frame: "main" },
            ...["r2", "r3", "r4", "r6", "r7", "r11", "r14"].map((ref) => ({
              ref,
              tag: "input",
              frame: "main",
            })),
          ],
          formFields: [{ ref: "r12", label: "Bio (rich text)", value: "" }],
        },
      } as Observation;
      const after = {
        ...before,
        revision: 2,
        content: {
          ...before.content,
          text: "Bio (rich text)\nDesign systems for teams",
          formFields: [
            {
              ref: "r12",
              label: "Bio (rich text)",
              value: "Design systems for teams",
            },
          ],
        },
      } as Observation;
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [
            {
              toolCallId: "b1",
              toolName: "act",
              input: {
                steps: [
                  ...(prefix
                    ? [
                        {
                          id: "name",
                          op: "fill",
                          target: "r2",
                          value: "Morgan Vale",
                        },
                        {
                          id: "email",
                          op: "fill",
                          target: "r3",
                          value: "morgan@example.com",
                        },
                        {
                          id: "role",
                          op: "select",
                          target: "r4",
                          value: "Designer",
                        },
                        {
                          id: "department",
                          op: "type",
                          target: "r6",
                          value: "Virtual Design",
                        },
                        { id: "preference", op: "check", target: "r7" },
                        { id: "plan", op: "check", target: "r11" },
                      ]
                    : []),
                  { id: "click", op: "click", target: "r12" },
                  {
                    id: "write",
                    op: write,
                    target: "r12",
                    value: "Design systems for teams",
                  },
                  ...(suffix
                    ? [
                        {
                          id: "date",
                          op: "fill",
                          target: "r14",
                          value: "2026-10-15",
                        },
                      ]
                    : []),
                ],
              },
            },
          ],
        },
        {
          toolCalls: [
            {
              toolCallId: "b2",
              toolName: "act",
              input: {
                steps: [
                  {
                    id: "write-only",
                    op: write,
                    target: "r12",
                    value: "Design systems for teams",
                  },
                ],
              },
            },
          ],
        },
        {
          toolCalls: [
            {
              toolCallId: "done",
              toolName: "submit_result",
              input: { report: "Bio entered" },
            },
          ],
        },
      ]);
      const h = coordinatorHarness(model, (program, ctx) => {
        const steps = program.steps.map((step) => ({
          stepId: step.id,
          op: step.op,
          status: "ok" as const,
          startedAt: 1,
          durationMs: 1,
          effect: "observed" as const,
          before: { value: "" },
          after: { value: "Design systems for teams" },
          receipt: {
            observed: "control value changed after action",
            remoteConfirmed: false,
            uncertain: false,
            dispatchedBeforeTakeover: false,
          },
        }));
        for (const [i, step] of program.steps.entries()) ctx?.onStep?.(steps[i]!, step);
        return { status: "completed", steps, observation: after };
      });
      h.pages.observe.mockResolvedValue(before);
      const run = await h.coordinator.start({
        goal: "Enter the bio",
        pageIds: ["p1"],
        chatId: "chat-1",
      });
      await settle(h.repo, run.runId);
      expect(h.pages.execute).toHaveBeenCalledOnce();
      expect(h.pages.execute.mock.calls[0]?.[0].steps.map((step) => step.op)).toEqual([write]);
      expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).toContain("no action was dispatched");
      expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").all(run.runId)).toEqual([
        { status: "confirmed" },
      ]);
    },
  );

  it.each([
    {
      kind: "standalone",
      steps: [{ id: "click", op: "click", target: "r12" }],
    },
    {
      kind: "nonadjacent",
      steps: [
        { id: "click", op: "click", target: "r12" },
        { id: "other", op: "fill", target: "r2", value: "name" },
        { id: "write", op: "type", target: "r12", value: "bio" },
      ],
    },
    {
      kind: "different-ref",
      steps: [
        { id: "click", op: "click", target: "r12" },
        { id: "write", op: "fill", target: "r2", value: "name" },
      ],
    },
    {
      kind: "postcondition",
      steps: [
        {
          id: "click",
          op: "click",
          target: "r12",
          expect: [{ kind: "textVisible", text: "Editor opened" }],
        },
        { id: "write", op: "type", target: "r12", value: "bio" },
      ],
    },
    {
      kind: "right-click",
      steps: [
        { id: "click", op: "click", target: "r12", button: "right" },
        { id: "write", op: "type", target: "r12", value: "bio" },
      ],
    },
    {
      kind: "button",
      steps: [
        { id: "click", op: "click", target: "r12" },
        { id: "write", op: "type", target: "r12", value: "bio" },
      ],
    },
    {
      kind: "link",
      steps: [
        { id: "click", op: "click", target: "r12" },
        { id: "write", op: "type", target: "r12", value: "bio" },
      ],
    },
    {
      kind: "unobserved-field",
      steps: [
        { id: "click", op: "click", target: "r12" },
        { id: "write", op: "type", target: "r12", value: "bio" },
      ],
    },
  ] satisfies { kind: string; steps: PlanStep[] }[])(
    "does not reject distinct $kind clicks as redundant rich-text focus",
    async ({ kind, steps }) => {
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [{ toolCallId: "a1", toolName: "act", input: { steps } }],
        },
        { text: "Action dispatched" },
      ]);
      const h = coordinatorHarness(model);
      h.pages.observe.mockResolvedValue({
        ...pageObs(),
        content: {
          ...pageObs().content,
          elements: [
            {
              ref: "r12",
              tag: kind === "button" ? "button" : kind === "link" ? "a" : "div",
              frame: "main",
            },
            { ref: "r2", tag: "input", frame: "main" },
          ],
          formFields: kind === "unobserved-field" ? [] : [{ ref: "r12", label: "Bio", value: "" }],
        },
      } as Observation);
      const run = await h.coordinator.start({
        goal: "Use the editor",
        pageIds: ["p1"],
        chatId: "chat-1",
      });
      await settle(h.repo, run.runId);
      expect(h.pages.execute).toHaveBeenCalledOnce();
      expect(h.pages.execute.mock.calls[0]?.[0].steps.map(({ id: _id, ...step }) => step)).toEqual(
        steps.map(({ id: _id, ...step }) => step),
      );
      expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).not.toContain(
        "no action was dispatched",
      );
    },
  );

  it("gives a goal program visible body text and headings without browser-title or element duplicates", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'var s=snapshot(); if(s.headings[0]!=="Record 15 — Alpha project") throw new Error("wrong heading"); if(s.bodyText.match(/Priya Patel/g).length!==1) throw new Error("duplicated owner"); submitResult(s.headings[0],[{observationId:s.observationId,quote:s.headings[0]}])',
              answerLabel: "",
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockResolvedValue({
      ...pageObs(),
      content: {
        ...pageObs().content,
        title: "Record 15 — Alpha project — Records",
        text: "Record 15 — Alpha project\nRecord 03\tPriya Patel\tapproved",
        headings: ["Record 15 — Alpha project", "Hidden dialog title"],
        elements: [{ ref: "r1", tag: "link", role: "link", name: "Priya Patel", frame: "main" }],
      },
    } as Observation);
    const run = await h.coordinator.start({
      goal: "Report the exact record title",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "Record 15 — Alpha project" });
    expect(h.modelCalls).toHaveLength(1);
  });

  it("rejects an unsupported quotation before accepting original observation evidence", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'submitResult("Record 15 — Alpha project — Records",[{pageId:"p1",revision:1,quote:"Record 15 — Unsupported project"}])',
              answerLabel: "",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "s1",
            toolName: "submit_result",
            input: {
              report: "Record 15 — Alpha project",
              citations: [{ pageId: "p1", revision: 1, quote: "Record 15 — Alpha project" }],
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockResolvedValue({
      ...pageObs(),
      content: {
        ...pageObs().content,
        title: "Record 15 — Alpha project — Records",
        text: "Record 15 — Alpha project\nOwner: Alex Rivera",
        headings: ["Record 15 — Alpha project"],
      },
    } as Observation);
    const run = await h.coordinator.start({
      goal: "Open rec-15 and report its exact title",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "Record 15 — Alpha project" });
    expect(h.modelCalls).toHaveLength(2);
    expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).toContain(
      "quote not found in the cited snapshot",
    );
  });

  it("persists failed failover attempts against the run budget without a tool replay", async () => {
    const model = new MockModelClient();
    model.toolCallStep = async () => {
      const error = new Error("provider unavailable");
      Object.defineProperty(error, Symbol.for("aux.modelAttempts"), {
        value: [
          {
            durationMs: 5,
            modelId: "test/fallback",
            inputTokens: 12,
            error: "first route failed",
          },
          {
            durationMs: 7,
            modelId: "test/agent",
            inputTokens: 9,
            outputTokens: 2,
            error: "final route failed",
          },
        ],
      });
      throw error;
    };
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({
      goal: "read",
      pageIds: ["p1"],
      chatId: "chat-1",
      maxModelCalls: 2,
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("failed");
    expect(h.repo.listModelCalls(run.runId)).toHaveLength(2);
    expect(h.repo.listModelCalls(run.runId).map((call) => call.modelId)).toEqual([
      "test/fallback",
      "test/agent",
    ]);
    expect(h.repo.listModelCalls(run.runId).every((call) => !!call.error)).toBe(true);
    expect(h.pages.execute).not.toHaveBeenCalled();
  });

  it("retains a cancelled provider's known billed attempt without a phantom requested-model row", async () => {
    const model = new MockModelClient();
    const h = coordinatorHarness(model);
    model.toolCallStep = async () => {
      await h.coordinator.cancel(h.repo.listRuns()[0]!.runId);
      const error = new Error("provider cancelled after billed work");
      Object.defineProperty(error, Symbol.for("aux.modelAttempts"), {
        value: [
          {
            durationMs: 7,
            modelId: "test/served",
            inputTokens: 9,
            outputTokens: 2,
            providerMetadata: { gateway: { cost: "0.125" } },
            error: "cancelled",
          },
        ],
      });
      throw error;
    };
    const run = await h.coordinator.start({
      goal: "read",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    await vi.waitFor(() => expect(h.repo.listModelCalls(run.runId)).toHaveLength(1));
    expect(h.repo.listModelCalls(run.runId)[0]).toMatchObject({
      modelId: "test/served",
      inputTokens: 9,
      outputTokens: 2,
    });
    expect(h.repo.getRun(run.runId)?.status).toBe("cancelled");
    expect(h.pages.execute).not.toHaveBeenCalled();
  });

  it("finishes a corroborated record route and dialog in one goal-program model call", async () => {
    let current = {
      ...pageObs(),
      content: {
        ...pageObs().content,
        url: "http://x.test/records",
        text: "Records",
        elements: [
          { ref: "r1", tag: "a", role: "link", name: "Record 01", href: "/records/rec-01", frame: "main" },
          { ref: "r2", tag: "a", role: "link", name: "Record 02", href: "/records/rec-02", frame: "main" },
        ],
      },
    } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'page.navigateMatching("rec-14"); page.clickByName("Details", "button"); var s=snapshot(); var m=s.text.match(/Internal reference: ([^\\n]+)/); if(!m) throw new Error("label absent"); submitResult(m[1], [{observationId:s.observationId, quote:m[0]}])',
              answerLabel: "",
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockImplementation(async () => current);
    h.dispatch.mockImplementation(
      async (
        program: { steps: PlanStep[] },
        ctx?: {
          onStep?: (o: StepOutcome, s: PlanStep) => void;
          journaled?: boolean;
          journalIntentId?: string;
          journalPerStep?: boolean;
          beforeDispatch?: unknown;
          settleStep?: unknown;
        },
      ) => {
        if (
          ctx?.journaled &&
          !ctx.journalIntentId &&
          !(ctx.journalPerStep && ctx.beforeDispatch && ctx.settleStep)
        )
          throw new Error("A pre-journaled browser write requires its durable intent ID");
        const op = program.steps[0]?.op;
        current =
          op === "navigate"
            ? ({
                ...current,
                revision: 2,
                content: {
                  ...current.content,
                  url: "http://x.test/records/rec-14",
                  text: "Record rec-14",
                  elements: [{ ref: "r3", tag: "button", role: "button", name: "Details", frame: "main" }],
                },
              } as Observation)
            : ({
                ...current,
                revision: 3,
                content: {
                  ...current.content,
                  text: "Internal ref rec-14.",
                  elements: [
                    {
                      ref: "r3",
                      tag: "button",
                      role: "button",
                      name: "Details",
                      frame: "main",
                      occluded: true,
                    },
                    { ref: "r4", tag: "button", role: "button", name: "Close", frame: "main" },
                  ],
                },
              } as Observation);
        const steps = program.steps.map((step) => ({
          stepId: step.id,
          op: step.op,
          status: "ok" as const,
          startedAt: 1,
          durationMs: 1,
          receipt: { remoteConfirmed: true, uncertain: false, dispatchedBeforeTakeover: false },
          effect: "dispatched" as const,
        }));
        for (const [index, step] of program.steps.entries()) ctx?.onStep?.(steps[index]!, step);
        return { status: "completed", steps, observation: current };
      },
    );
    const run = await h.coordinator.start({
      goal: "Find rec-14, open its detail page and Details dialog, then report the internal reference shown inside the dialog only.",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status, final.error).toBe("completed");
    expect(final.result).toMatchObject({ report: "rec-14" });
    expect(h.modelCalls).toHaveLength(1);
    expect(h.pages.execute).toHaveBeenCalledTimes(2);
  });
  it("stops a goal program at its first uncertain action before the next click", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'page.click("r1"); page.click("r1"); submitResult("saved")',
              answerLabel: "",
            },
          },
        ],
      },
      { text: "The click outcome is uncertain." },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "failed" as const,
        startedAt: 1,
        durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps };
    });
    const run = await h.coordinator.start({
      goal: "save",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).not.toBe("completed");
    expect(h.pages.execute).toHaveBeenCalledOnce();
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      status: "uncertain",
    });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(
      transcript.some(
        (message) =>
          message.role === "tool" && JSON.stringify(message.content).includes("Action outcome uncertain"),
      ),
    ).toBe(true);
  });
  it("explicitly navigates an observed same-origin pagination link without a write intent", async () => {
    let current = {
      ...pageObs(),
      content: {
        ...pageObs().content,
        url: "http://x.test/records",
        elements: [{ ref: "r17", tag: "a", role: "link", name: "2", href: "?page=2", frame: "main" }],
      },
    } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'page.followLinkByName("2"); const s = snapshot(); submitResult(s.text, [{observationId:s.observationId, quote:"url: http://x.test/records?page=2"}])',
              answerLabel: "",
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockImplementation(async () => current);
    h.dispatch.mockImplementation(
      async (
        program: { steps: PlanStep[] },
        ctx?: {
          onStep?: (o: StepOutcome, s: PlanStep) => void;
          journaled?: boolean;
          journalIntentId?: string;
          journalPerStep?: boolean;
          beforeDispatch?: unknown;
          settleStep?: unknown;
        },
      ) => {
        if (
          ctx?.journaled &&
          !ctx.journalIntentId &&
          !(ctx.journalPerStep && ctx.beforeDispatch && ctx.settleStep)
        )
          throw new Error("A pre-journaled browser write requires its durable intent ID");
        current = {
          ...current,
          revision: 2,
          content: { ...current.content, url: "http://x.test/records?page=2", text: "Page 2 records" },
        } as Observation;
        const steps = program.steps.map((s) => ({
          stepId: s.id,
          op: s.op,
          status: "ok" as const,
          startedAt: 1,
          durationMs: 1,
        }));
        for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
        return { status: "completed", steps, observation: current };
      },
    );
    const run = await h.coordinator.start({
      goal: "open page 2",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.pages.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        steps: [expect.objectContaining({ op: "navigate", url: "http://x.test/records?page=2" })],
      }),
      expect.anything(),
      expect.anything(),
    );
    expect(h.db.prepare("SELECT count(*) AS n FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      n: 0,
    });
  });
  it("shows the reached page after a later GoalProgram lookup fails", async () => {
    let current = {
      ...pageObs(),
      content: {
        ...pageObs().content,
        url: "http://x.test/records",
        elements: [{ ref: "r17", tag: "a", role: "link", name: "2", href: "?page=2", frame: "main" }],
      },
    } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "g1",
            toolName: "goal_program",
            input: {
              code: 'page.followLinkByName("2"); page.followLinkByName("Missing"); submitResult("done")',
              answerLabel: "",
            },
          },
        ],
      },
      { text: "Page 2 reached; the remaining link needs inspection." },
    ]);
    const h = coordinatorHarness(model);
    h.pages.observe.mockImplementation(async () => current);
    h.dispatch.mockImplementation(
      async (program: { steps: PlanStep[] }, ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void }) => {
        current = {
          ...current,
          revision: 2,
          content: {
            ...current.content,
            url: "http://x.test/records?page=2",
            text: "Record 15",
            elements: [
              {
                ref: "r10",
                tag: "a",
                role: "link",
                name: "Record 15",
                href: "/records/rec-15",
                frame: "main",
              },
            ],
          },
        } as Observation;
        const steps = program.steps.map((s) => ({
          stepId: s.id,
          op: s.op,
          status: "ok" as const,
          startedAt: 1,
          durationMs: 1,
        }));
        for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
        return { status: "completed", steps, observation: current };
      },
    );
    const run = await h.coordinator.start({
      goal: "find record 15",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
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
    const run = await h.coordinator.start({
      goal: "read the page",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
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
      {
        toolCalls: [{ toolCallId: "q1", toolName: "ask_user_question", input: { question: "blue or red?" } }],
      },
      { text: "blue it is" },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({
      goal: "pick",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    for (let i = 0; i < 400 && h.repo.getRun(run.runId)!.status !== "needs_input"; i++)
      await new Promise((r) => setTimeout(r, 10));
    expect(h.repo.getRun(run.runId)!.status).toBe("needs_input");
    const pending = h.coordinator.suspensions.pending(run.runId);
    expect(pending?.kind).toBe("ask-user-question");
    expect(new TranscriptStore(h.db).openPark(run.runId)).toMatchObject({ toolCallId: "q1" });
    await h.coordinator.answer(run.runId, "blue");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "blue it is" });
    expect(h.coordinator.suspensions.pending(run.runId)).toBeUndefined();
    expect(h.pages.observe).toHaveBeenCalledTimes(1);
  });

  it("observes the page after a handoff and does not run the parked action again", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      { text: "the person finished it" },
    ]);
    const h = coordinatorHarness(model, (_program, ctx) => {
      h.coordinator.suspensions.park({
        runId: ctx?.runId ?? "",
        threadId: "chat-1",
        turnId: ctx?.runId ?? "",
        kind: "handoff",
        request: { kind: "handoff", instruction: "Finish the code in the page.", guidance: "Wait." },
      });
      return {
        status: "failed",
        steps: [
          {
            stepId: "s1",
            op: "click",
            status: "failed",
            startedAt: 1,
            durationMs: 1,
            error: { code: "needs_input", message: "Finish the code in the page." },
          },
        ],
      };
    });
    const run = await h.coordinator.start({
      goal: "enter the code",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    for (let i = 0; i < 400 && h.repo.getRun(run.runId)!.status !== "needs_input"; i++)
      await new Promise((r) => setTimeout(r, 10));
    expect(h.repo.getRun(run.runId)!.status).toBe("needs_input");
    expect(h.coordinator.suspensions.pending(run.runId)?.kind).toBe("handoff");
    const observationsBefore = h.pages.observe.mock.calls.length;
    const executesBefore = h.pages.execute.mock.calls.length;
    await h.coordinator.answer(run.runId, "I finished the handoff.");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "the person finished it" });
    expect(h.pages.observe.mock.calls.length).toBe(observationsBefore + 1);
    expect(h.pages.execute.mock.calls.length).toBe(executesBefore);
    const transcript = JSON.stringify(new TranscriptStore(h.db).load(run.runId));
    expect(transcript).toContain("fresh page snapshot");
    expect(transcript).toContain("Do not retry the action they just completed.");
  });

  it("parks on a gate-created approval suspension inside act, not a second record", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      { text: "approved and done" },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const answered = h.db
        .prepare("SELECT state FROM safety_suspensions WHERE run_id=? AND kind='approval'")
        .get(ctx?.runId ?? "") as { state: string } | undefined;
      if (answered?.state === "answered")
        return {
          status: "completed",
          steps: program.steps.map((step) => ({
            stepId: step.id,
            op: step.op,
            status: "ok" as const,
            startedAt: 1,
            durationMs: 1,
          })),
        };
      // What the real gate does on `ask`: park a typed suspension, fail the step needs_input.
      h.coordinator.suspensions.park({
        runId: ctx?.runId ?? "",
        threadId: "chat-1",
        turnId: ctx?.runId ?? "",
        kind: "approval",
        request: {
          kind: "approval",
          approvalId: "ap-9",
          instruction: "Approve the click?",
          guidance: "Wait.",
        },
      });
      return {
        status: "failed",
        steps: [
          {
            stepId: "s1",
            op: "click",
            status: "failed",
            startedAt: 1,
            durationMs: 1,
            error: { code: "needs_input", message: "Approve the click?" },
          },
        ],
      };
    });
    const run = await h.coordinator.start({
      goal: "check out",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    for (let i = 0; i < 400 && h.repo.getRun(run.runId)!.status !== "needs_input"; i++)
      await new Promise((r) => setTimeout(r, 10));
    const pending = h.coordinator.suspensions.pending(run.runId);
    expect(h.repo.getRun(run.runId)!.status).toBe("needs_input");
    // The loop waited on the GATE's approval suspension — no second record.
    expect(pending?.kind).toBe("approval");
    expect(
      h.db.prepare("SELECT COUNT(*) AS n FROM safety_suspensions WHERE run_id=?").get(run.runId),
    ).toEqual({ n: 1 });
    expect(h.db.prepare("SELECT count(*) AS n FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      n: 0,
    });
    const reviewedSteps = h.pages.execute.mock.calls[0]![0].steps;
    const resolved = h.coordinator.suspensions.resolveByApprovalId("ap-9", "answered");
    expect(resolved?.runId).toBe(run.runId);
    await h.coordinator.answer(run.runId, "The user approved.");
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.dispatch).toHaveBeenCalledTimes(2);
    expect(h.pages.execute.mock.calls[1]![0].steps).toEqual(reviewedSteps);
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").all(run.runId)).toEqual([
      { status: "confirmed" },
    ]);
    expect(
      h.db.prepare("SELECT count(*) AS n FROM safety_suspensions WHERE run_id=?").get(run.runId),
    ).toEqual({ n: 1 });
  });

  it("runs code-mode page ops through the governed act path", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "c1", toolName: "repl", input: { code: `page.click("r1")` } }] },
      { text: "clicked" },
    ]);
    const h = coordinatorHarness(model, (program) => ({
      status: "completed",
      steps: program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "ok" as const,
        startedAt: 1,
        durationMs: 1,
      })),
    }));
    const run = await h.coordinator.start({
      goal: "click the button",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.pages.execute).toHaveBeenCalled();
  });

  it("finishes a named page action and verified read in one model call", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "r1",
            toolName: "repl",
            input: {
              code: `page.clickByName("Save", "button"); const s = snapshot(); submitResult("Order page", [{ observationId: s.observationId, quote: "Order page" }])`,
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({
      goal: "Report the page title",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
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
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: {
              report: "The order page is open.",
              citations: [{ pageId: "p1", quote: "Order page" }],
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({
      goal: "summarize the page",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({
      report: "The order page is open.",
      citations: [{ pageId: "p1", quote: "Order page" }],
    });
    // The terminal call's tool result persisted for transcript pairing.
    const transcript = new TranscriptStore(h.db).load(run.runId);
    const toolMsg = transcript.find(
      (m) => m.role === "tool" && JSON.stringify(m.content).includes("submit_result"),
    );
    expect(JSON.stringify(toolMsg?.content)).toMatch(/accepted/);
  });

  it("rejects an unverifiable citation so the model can re-cite and resubmit", async () => {
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "s1", toolName: "snapshot", input: {} }] },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "done", citations: [{ pageId: "p1", quote: "fabricated quote" }] },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f2",
            toolName: "submit_result",
            input: { report: "done", citations: [{ pageId: "p1", quote: "Order page" }] },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model);
    const run = await h.coordinator.start({
      goal: "summarize",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "done" });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    const rejected = transcript.find(
      (m) => m.role === "tool" && JSON.stringify(m.content).includes("Unverifiable citations"),
    );
    expect(rejected).toBeTruthy();
  });

  it("marks a completed write unconfirmed until its effect is actually observed", async () => {
    const postObs = { ...pageObs(), revision: 2 } as Observation;
    const execConfirmed = (
      program: { steps: PlanStep[] },
      ctx?: { onStep?: (o: StepOutcome, s: PlanStep) => void },
    ) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "ok" as const,
        startedAt: 1,
        durationMs: 1,
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps, observation: postObs };
    };
    const cited = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Order page" }] },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(cited, execConfirmed);
    const run = await h.coordinator.start({
      goal: "click save",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({
      unconfirmedWrites: [h.pages.execute.mock.calls[0]![0].steps[0]!.id],
    });

    // The completed executor receipt confirms the write independently.
    const bare = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "clicked" },
          },
        ],
      },
    ]);
    const h2 = coordinatorHarness(bare, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "ok" as const,
        startedAt: 1,
        durationMs: 1,
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps };
    });
    const run2 = await h2.coordinator.start({
      goal: "click save",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final2 = await settle(h2.repo, run2.runId);
    expect(final2.status).toBe("completed");
    expect(final2.result).toMatchObject({
      unconfirmedWrites: [h2.pages.execute.mock.calls[0]![0].steps[0]!.id],
    });
  });

  it("blocks submit_result while an uncertain dispatch is in the ledger", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "done" },
          },
        ],
      },
      { text: "blocked" },
      { text: "still blocked" },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "failed" as const,
        startedAt: 1,
        durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps };
    });
    const run = await h.coordinator.start({
      goal: "click save",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    const transcript = new TranscriptStore(h.db).load(run.runId);
    // submit_result rejected while the uncertain dispatch stood…
    const rejected = transcript.find(
      (m) => m.role === "tool" && JSON.stringify(m.content).includes("uncertain dispatch"),
    );
    expect(rejected).toBeTruthy();
    // …and it cannot claim success while the durable intent stays uncertain.
    expect(final.status).not.toBe("completed");
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      status: "uncertain",
    });
  });

  it("rejects same-page boilerplate and reconciles only a new effect line", async () => {
    const postObs = { ...pageObs(), revision: 2 } as Observation;
    postObs.content.text = "Order page\nNotifications 1\nSaving...\nSaved";
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Order page" }] },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "r1",
            toolName: "reconcile_action",
            input: {
              citation: { pageId: "p1", revision: 2, quote: "Order page" },
              effect: "Order page",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "r3",
            toolName: "reconcile_action",
            input: {
              citation: { pageId: "p1", revision: 2, quote: "Notifications 1" },
              effect: "Notifications 1",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "r4",
            toolName: "reconcile_action",
            input: {
              citation: { pageId: "p1", revision: 2, quote: "Saving..." },
              effect: "Saving...",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "r2",
            toolName: "reconcile_action",
            input: {
              citation: { pageId: "p1", revision: 2, quote: "Saved" },
              effect: "Saved",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f2",
            toolName: "submit_result",
            input: {
              report: "clicked",
              citations: [{ pageId: "p1", revision: 2, quote: "Saved" }],
            },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "failed" as const,
        startedAt: 1,
        durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: {
          remoteConfirmed: false,
          uncertain: true,
          unconfirmed: false,
          dispatchedBeforeTakeover: false,
        },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: postObs };
    });
    const run = await h.coordinator.start({
      goal: "click save",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "clicked" });
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      status: "confirmed",
    });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(
      transcript.some(
        (message) =>
          message.role === "tool" && JSON.stringify(message.content).includes("already visible before"),
      ),
    ).toBe(true);
    expect(
      transcript.some(
        (message) =>
          message.role === "tool" &&
          JSON.stringify(message.content).includes("does not confirm the click completed"),
      ),
    ).toBe(true);
  });

  it.each([
    { modalOpen: true, headingVisibleBefore: false, shouldReconcile: true },
    { modalOpen: false, headingVisibleBefore: false, shouldReconcile: false },
    { modalOpen: true, headingVisibleBefore: true, shouldReconcile: false },
  ])(
    "reconciles Details only from a newly visible modal heading and content (%o)",
    async ({ modalOpen, headingVisibleBefore, shouldReconcile }) => {
      const before = {
        ...pageObs(),
        content: {
          ...pageObs().content,
          text: headingVisibleBefore ? "Record 15\nRecord details" : "Record 15",
          // The heading index includes hidden dialogs even before they render.
          headings: ["Record 15", "Record details"],
          elements: [{ ref: "r5", tag: "button", role: "button", name: "Details…", frame: "main" }],
        },
      } as Observation;
      const after = {
        ...before,
        revision: 2,
        content: {
          ...before.content,
          text: "Record 15\nRecord details\nCreated by the fixture seed. Internal ref rec-15.",
          headings: ["Record 15", "Record details"],
          elements: modalOpen
            ? [
                { ref: "r5", tag: "button", role: "button", name: "Details…", frame: "main", occluded: true },
                { ref: "r9", tag: "button", role: "button", name: "Close", frame: "main" },
              ]
            : before.content.elements,
        },
      } as Observation;
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [
            {
              toolCallId: "a1",
              toolName: "act",
              input: { steps: [{ id: "s1", op: "click", target: "r5" }] },
            },
          ],
        },
        {
          toolCalls: [
            {
              toolCallId: "r1",
              toolName: "reconcile_action",
              input: {
                citation: {
                  pageId: "p1",
                  revision: 2,
                  quote: "Created by the fixture seed. Internal ref rec-15.",
                },
                effect: "Opened the Record details dialog",
              },
            },
          ],
        },
        { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "rec-15" } }] },
        { text: "Cannot prove the dialog opened." },
      ]);
      const h = coordinatorHarness(model, (program, ctx) => {
        const steps = program.steps.map((s) => ({
          stepId: s.id,
          op: s.op,
          status: "failed" as const,
          startedAt: 1,
          durationMs: 1,
          error: { code: "condition_timeout", message: "timed out" },
          effect: "uncertain" as const,
          receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false },
        }));
        for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
        return { status: "failed", steps, observation: after };
      });
      h.pages.observe.mockImplementation(async () => before);
      const run = await h.coordinator.start({
        goal: "open Details and read internal ref",
        pageIds: ["p1"],
        chatId: "chat-1",
      });
      const final = await settle(h.repo, run.runId);
      expect(final.status === "completed").toBe(shouldReconcile);
      expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
        status: shouldReconcile ? "confirmed" : "uncertain",
      });
    },
  );

  it.each([
    { headingVisibleBefore: false, shouldReconcile: true },
    { headingVisibleBefore: true, shouldReconcile: false },
  ])(
    "reconciles Edit only when an inline form and its controls newly render (%o)",
    async ({ headingVisibleBefore, shouldReconcile }) => {
      const before = {
        ...pageObs(),
        content: {
          ...pageObs().content,
          text: headingVisibleBefore ? "Record 04\nEdit record" : "Record 04\nEdit record Details…",
          headings: ["Record 04", "Edit record"],
          elements: [{ ref: "r5", tag: "button", role: "button", name: "Edit record", frame: "main" }],
        },
      } as Observation;
      const after = {
        ...before,
        revision: 2,
        content: {
          ...before.content,
          text: "Record 04\nEdit record\nTitle\nStatus\napproved\nSave record Cancel",
        },
      } as Observation;
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [
            {
              toolCallId: "a1",
              toolName: "act",
              input: { steps: [{ id: "s1", op: "click", target: "r5" }] },
            },
          ],
        },
        {
          toolCalls: [
            {
              toolCallId: "r1",
              toolName: "reconcile_action",
              input: {
                citation: { pageId: "p1", revision: 2, quote: "Save record Cancel" },
                effect: "Edit record form opened",
              },
            },
          ],
        },
        { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "edit opened" } }] },
        { text: "Cannot prove the edit form opened." },
      ]);
      const h = coordinatorHarness(model, (program, ctx) => {
        const steps = program.steps.map((s) => ({
          stepId: s.id,
          op: s.op,
          status: "failed" as const,
          startedAt: 1,
          durationMs: 1,
          error: { code: "condition_timeout", message: "timed out" },
          effect: "uncertain" as const,
          receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false },
        }));
        for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
        return { status: "failed", steps, observation: after };
      });
      h.pages.observe.mockImplementation(async () => before);
      const run = await h.coordinator.start({
        goal: "open the edit form",
        pageIds: ["p1"],
        chatId: "chat-1",
      });
      const final = await settle(h.repo, run.runId);
      expect(final.status === "completed").toBe(shouldReconcile);
      expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
        status: shouldReconcile ? "confirmed" : "uncertain",
      });
    },
  );

  it.each([
    { editTarget: true, formVisibleBefore: false, shouldSettle: true },
    { editTarget: false, formVisibleBefore: false, shouldSettle: false },
    { editTarget: true, formVisibleBefore: true, shouldSettle: false },
  ])(
    "settles one Edit click from a fresh same-page inline form transition (%o)",
    async ({ editTarget, formVisibleBefore, shouldSettle }) => {
      const before = {
        ...pageObs(),
        content: {
          ...pageObs().content,
          text: formVisibleBefore
            ? "Record 04\nEdit record\nSave record Cancel"
            : "Record 04\nEdit record Details…",
          elements: [
            {
              ref: "r4",
              tag: "button",
              role: "button",
              name: editTarget ? "Edit record" : "Details…",
              frame: "main",
            },
          ],
        },
      } as Observation;
      const after = {
        ...before,
        revision: 2,
        observedAt: Date.now() + 10_000,
        content: { ...before.content, text: "Record 04\nEdit record\nTitle\nStatus\nSave record Cancel" },
      } as Observation;
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [
            {
              toolCallId: "a1",
              toolName: "act",
              input: { steps: [{ id: "s1", op: "click", target: "r4" }] },
            },
          ],
        },
        { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "form opened" } }] },
        { text: "The click remains uncertain." },
      ]);
      const h = coordinatorHarness(model, (program, ctx) => {
        const steps = program.steps.map((s) => ({
          stepId: s.id,
          op: s.op,
          status: "ok" as const,
          startedAt: 1,
          durationMs: 1,
          effect: "uncertain" as const,
          receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false },
        }));
        for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
        return { status: "completed", steps, observation: after };
      });
      h.pages.observe.mockImplementation(async () => before);
      const run = await h.coordinator.start({
        goal: "open the edit form",
        pageIds: ["p1"],
        chatId: "chat-1",
      });
      const final = await settle(h.repo, run.runId);
      expect(final.status === "completed").toBe(shouldSettle);
      expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
        status: shouldSettle ? "confirmed" : "uncertain",
      });
    },
  );

  it.each([
    {
      control: "Create record",
      postOwner: "Priya Patel",
      postUrl: "http://x.test/records/rec-31",
      shouldSettle: true,
    },
    {
      control: "Other action",
      postOwner: "Priya Patel",
      postUrl: "http://x.test/records/rec-31",
      shouldSettle: false,
    },
    {
      control: "Create record",
      postOwner: "Morgan Diaz",
      postUrl: "http://x.test/records/rec-31",
      shouldSettle: false,
    },
    {
      control: "Create record",
      postOwner: "Priya Patel",
      postUrl: "http://other.test/records/rec-31",
      shouldSettle: false,
    },
  ])(
    "settles Create only from a new matching same-origin record (%o)",
    async ({ control, postOwner, postUrl, shouldSettle }) => {
      const before = {
        ...pageObs(),
        content: {
          ...pageObs().content,
          url: "http://x.test/new",
          text: "New record\nTitle\nOwner\nStatus\nCreate record",
          elements: [{ ref: "r7", tag: "button", role: "button", name: control, frame: "main" }],
          formFields: [
            { ref: "r4", label: "Title", type: "text", value: "Aux launch review" },
            { ref: "r5", label: "Owner", type: "select", value: "Priya Patel" },
            { ref: "r6", label: "Status", type: "select", value: "in review" },
          ],
        },
      } as Observation;
      const after = {
        ...before,
        documentEpoch: 2,
        revision: 2,
        observedAt: Date.now() + 10_000,
        content: {
          ...before.content,
          url: postUrl,
          text: `Aux launch review\nOwner: ${postOwner}\nStatus: in review\nid=rec-31 · updated 2026-09-29`,
          headings: ["Aux launch review"],
          formFields: [],
        },
      } as Observation;
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [
            {
              toolCallId: "a1",
              toolName: "act",
              input: { steps: [{ id: "create", op: "click", target: "r7" }] },
            },
          ],
        },
        { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "rec-31" } }] },
        { text: "Creation cannot be verified." },
      ]);
      const h = coordinatorHarness(model, (program, ctx) => {
        const steps = program.steps.map((s) => ({
          stepId: s.id,
          op: s.op,
          status: "ok" as const,
          startedAt: 1,
          durationMs: 1,
          effect: "uncertain" as const,
          receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: false },
        }));
        for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
        return { status: "completed", steps, observation: after };
      });
      h.pages.observe.mockImplementation(async () => before);
      const run = await h.coordinator.start({
        goal: "create one matching record",
        pageIds: ["p1"],
        chatId: "chat-1",
      });
      const final = await settle(h.repo, run.runId);
      expect(final.status === "completed").toBe(shouldSettle);
      expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
        status: shouldSettle ? "confirmed" : "uncertain",
      });
    },
  );

  it("reconciles an uncertain link click only from its recorded destination URL", async () => {
    const before = {
      ...pageObs(),
      content: {
        ...pageObs().content,
        url: "http://x.test/records",
        elements: [{ ref: "r2", tag: "a", role: "link", name: "2", href: "?page=2", frame: "main" }],
      },
    } as Observation;
    const after = {
      ...before,
      revision: 2,
      content: {
        ...before.content,
        url: "http://x.test/records?page=2",
        text: "Record 15\nurl: http://x.test/records?page=3",
      },
    } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r2" }] } },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "r1",
            toolName: "reconcile_action",
            input: {
              citation: { pageId: "p1", revision: 2, quote: "url: http://x.test/records?page=3" },
              effect: "Navigated to page 3",
            },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "r2",
            toolName: "reconcile_action",
            input: {
              citation: { pageId: "p1", revision: 2, quote: "url: http://x.test/records?page=2" },
              effect: "Navigated to page 2",
            },
          },
        ],
      },
      { toolCalls: [{ toolCallId: "f1", toolName: "submit_result", input: { report: "page 2" } }] },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "failed" as const,
        startedAt: 1,
        durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: { remoteConfirmed: false, uncertain: true, dispatchedBeforeTakeover: true },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: after };
    });
    h.pages.observe.mockImplementation(async () => before);
    const run = await h.coordinator.start({
      goal: "open page 2",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      status: "confirmed",
    });
    const transcript = new TranscriptStore(h.db).load(run.runId);
    expect(
      transcript.some(
        (message) =>
          message.role === "tool" && JSON.stringify(message.content).includes("Cite the observed page URL"),
      ),
    ).toBe(true);
  });

  it("does not settle an uncertain write from a post-dispatch page title alone", async () => {
    const postObs = { ...pageObs(), revision: 2 } as Observation;
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "a1", toolName: "act", input: { steps: [{ id: "s1", op: "click", target: "r1" }] } },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "clicked", citations: [{ pageId: "p1", revision: 2, quote: "Order page" }] },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "failed" as const,
        startedAt: 1,
        durationMs: 1,
        error: { code: "condition_timeout", message: "timed out" },
        effect: "uncertain" as const,
        receipt: {
          remoteConfirmed: false,
          uncertain: true,
          unconfirmed: false,
          dispatchedBeforeTakeover: false,
        },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "failed", steps, observation: postObs };
    });
    const run = await h.coordinator.start({
      goal: "click save",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).not.toBe("completed");
    expect(h.db.prepare("SELECT status FROM action_intents WHERE run_id=?").get(run.runId)).toEqual({
      status: "uncertain",
    });
  });

  it("rehydrates the pending action summary from the durable ledger after restart", () => {
    const { db } = fixture();
    const first = new DurableWriteLedger(db);
    const { intent } = first.begin({
      runId: "run-1",
      pageId: "p1",
      documentEpoch: 1,
      signature: "click-save",
      summary: { ops: ["click"], actionLabels: ["Save"], beforeLineHashes: ["pre-action-line-hash"] },
    });
    first.fail(intent.id);
    const restarted = new DurableWriteLedger(db);
    expect(restarted.getById(intent.id)).toMatchObject({
      status: "uncertain",
      createdAt: expect.any(Number),
      summary: { ops: ["click"], actionLabels: ["Save"], beforeLineHashes: ["pre-action-line-hash"] },
    });
    expect(restarted.unresolved("run-1")).toHaveLength(1);
  });

  it("never counts navigation as an uncertain write", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          {
            toolCallId: "a1",
            toolName: "act",
            input: { steps: [{ id: "n1", op: "navigate", url: "http://x.test/next" }] },
          },
        ],
      },
      {
        toolCalls: [
          {
            toolCallId: "f1",
            toolName: "submit_result",
            input: { report: "navigated" },
          },
        ],
      },
    ]);
    const h = coordinatorHarness(model, (program, ctx) => {
      const steps = program.steps.map((s) => ({
        stepId: s.id,
        op: s.op,
        status: "ok" as const,
        startedAt: 1,
        durationMs: 1,
        effect: "uncertain" as const,
        receipt: {
          remoteConfirmed: false,
          uncertain: true,
          unconfirmed: false,
          dispatchedBeforeTakeover: false,
        },
      }));
      for (const [i, s] of program.steps.entries()) ctx?.onStep?.(steps[i]!, s);
      return { status: "completed", steps };
    });
    const run = await h.coordinator.start({
      goal: "go to the next page",
      pageIds: ["p1"],
      chatId: "chat-1",
    });
    const final = await settle(h.repo, run.runId);
    expect(final.status).toBe("completed");
    expect(final.result).toMatchObject({ report: "navigated" });
  });
});

describe("run-owned downloaded text affordance", () => {
  it.each(["tool", "repl"])(
    "keeps the native download artifact ID and reads its CSV through %s without Bash",
    async (surface) => {
      const dir = mkdtempSync(join(tmpdir(), "aux-agent-artifact-"));
      cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
      const model = new MockModelClient().scriptToolSteps([
        {
          toolCalls: [
            {
              toolCallId: "download",
              toolName: "act",
              input: { steps: [{ id: "download", op: "navigate", url: "http://x.test/rec-10.csv" }] },
            },
          ],
        },
      ]);
      let artifactId = "";
      const h = coordinatorHarness(model, (program, ctx) => {
        const artifact = artifacts.save({
          runId: ctx!.runId,
          pageId: "p1",
          label: "rec-10-data.csv",
          mediaType: "text/plain",
          buffer: Buffer.from("item,amount\na,4\nb,6\n"),
        });
        artifactId = artifact.artifactId;
        const step = program.steps[0]!;
        const outcome: StepOutcome = {
          stepId: step.id,
          op: step.op,
          status: "ok",
          startedAt: 1,
          durationMs: 1,
          effect: "observed",
          artifactIds: [artifactId],
          detail: "downloaded rec-10-data.csv",
          receipt: {
            observed: "downloaded rec-10-data.csv",
            remoteConfirmed: false,
            uncertain: false,
            dispatchedBeforeTakeover: false,
          },
        };
        ctx?.onStep?.(outcome, step);
        return { status: "completed", steps: [outcome], artifactIds: [artifactId], observation: pageObs() };
      });
      const artifacts = new ArtifactStore(dir, h.repo, h.coordinator.deps.events);
      const read = vi.fn(
        async ({
          runId,
          signal,
          checkOwner,
          ...input
        }: Parameters<
          NonNullable<
            import("../../apps/runtime/src/agent/loop/host.js").AgentLoopHostDeps["readArtifactText"]
          >
        >[0]) => artifacts.readText(input, { runId, signal, checkCurrent: checkOwner }),
      );
      h.coordinator.deps.agentLoop = { readArtifactText: read };
      const next = model.toolCallStep.bind(model);
      const modelViews: { tools: string[]; messages: string }[] = [];
      let calls = 0;
      model.toolCallStep = async (options) => {
        modelViews.push({ tools: Object.keys(options.tools), messages: JSON.stringify(options.messages) });
        if (++calls === 2) {
          model.scriptToolSteps([
            {
              toolCalls: [
                {
                  toolCallId: "read",
                  toolName: surface === "tool" ? "read_artifact_text" : "repl",
                  input:
                    surface === "tool"
                      ? { artifactId }
                      : {
                          code: `const downloaded = await artifacts.readText({artifactId:${JSON.stringify(artifactId)}}); display(downloaded);`,
                        },
                },
              ],
            },
            {
              toolCalls: [{ toolCallId: "finish", toolName: "submit_result", input: { report: "Total 10" } }],
            },
          ]);
        }
        return next(options);
      };
      const run = await h.coordinator.start({ goal: "Download the CSV and sum amount", pageIds: ["p1"] });
      expect(await settle(h.repo, run.runId)).toMatchObject({
        status: "completed",
        result: { report: "Total 10" },
      });
      expect(read).toHaveBeenCalledOnce();
      expect(read.mock.calls[0]?.[0].runId).toBe(run.runId);
      expect(modelViews).toHaveLength(3);
      expect(modelViews[1]!.tools).toContain("read_artifact_text");
      expect(modelViews[1]!.messages).toContain(artifactId);
      expect(modelViews[1]!.messages).toContain('"artifactIds"');
      expect(modelViews[1]!.messages).toContain('"mediaType":"text/plain"');
      expect(modelViews[1]!.messages).not.toContain(dir);
      expect(modelViews[2]!.messages).toContain("item,amount");
      expect(modelViews[2]!.messages).toContain("untrusted_artifact");
      expect(h.pages.execute).toHaveBeenCalledOnce();
      expect(h.coordinator.suspensions.pending(run.runId)).toBeUndefined();
      const transcript = JSON.stringify(new TranscriptStore(h.db).load(run.runId));
      expect(transcript).not.toContain('"toolName":"bash"');
    },
  );

  it("checks original owner again after the artifact backend returns", async () => {
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "read", toolName: "read_artifact_text", input: { artifactId: "known-artifact" } },
        ],
      },
      { text: "Cannot read a retired source" },
    ]);
    const h = coordinatorHarness(model);
    h.coordinator.deps.agentLoop = {
      readArtifactText: async ({ runId }) => {
        const run = h.repo.getRun(runId)!;
        h.repo.saveRun({ ...run, config: { ...run.config, contextMemoryRevoked: true } });
        h.coordinator.controls.get(runId)!.abort.abort();
        return {
          source: "untrusted_artifact",
          artifact: {
            artifactId: "known-artifact",
            filename: "fixture.csv",
            mediaType: "text/plain",
            size: 11,
            status: "complete",
          },
          sha256: "0".repeat(64),
          offset: 0,
          content: "SECRET-TEST",
          eof: true,
        };
      },
    };
    const run = await h.coordinator.start({ goal: "Read the existing result", pageIds: [] });
    await vi.waitFor(() => expect(h.repo.getRun(run.runId)?.config?.contextMemoryRevoked).toBe(true));
    await h.coordinator.close();
    expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).not.toContain("SECRET-TEST");
  });
});

it("revalidates an artifact on an actual durable REPL replay instead of reviving its cached bytes", async () => {
  const dir = mkdtempSync(join(tmpdir(), "aux-artifact-replay-"));
  cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  const model = new MockModelClient().scriptToolSteps([
    {
      toolCalls: [
        {
          toolCallId: "download",
          toolName: "act",
          input: { steps: [{ id: "download", op: "navigate", url: "http://x.test/fixture.csv" }] },
        },
      ],
    },
  ]);
  let artifactId = "";
  const h = coordinatorHarness(model, (program) => {
    const runId = h.repo.listRuns()[0]!.runId;
    artifactId = artifacts.save({
      runId,
      label: "fixture.csv",
      mediaType: "text/plain",
      buffer: Buffer.from("REPLAY-SOURCE-SECRET"),
    }).artifactId;
    return {
      status: "completed",
      steps: [
        {
          stepId: program.steps[0]!.id,
          op: "navigate",
          status: "ok",
          startedAt: 1,
          durationMs: 1,
          effect: "observed",
          artifactIds: [artifactId],
        },
      ],
      observation: pageObs(),
    };
  });
  const artifacts = new ArtifactStore(dir, h.repo, h.coordinator.deps.events);
  const read = vi.fn<
    NonNullable<import("../../apps/runtime/src/agent/loop/host.js").AgentLoopHostDeps["readArtifactText"]>
  >(async ({ runId, signal, checkOwner, ...input }) =>
    artifacts.readText(input, { runId, signal, checkCurrent: checkOwner }),
  );
  h.coordinator.deps.agentLoop = { readArtifactText: read };
  const next = model.toolCallStep.bind(model);
  const latestToolResults: (string | undefined)[] = [];
  let calls = 0;
  model.toolCallStep = async (options) => {
    latestToolResults.push(JSON.stringify(options.messages.findLast((message) => message.role === "tool")));
    if (++calls === 2) {
      const replay = {
        toolCallId: "same-original-read",
        toolName: "repl",
        input: { code: `display(artifacts.readText({artifactId:${JSON.stringify(artifactId)}}))` },
      };
      model.scriptToolSteps([
        { toolCalls: [replay] },
        { toolCalls: [replay] },
        {
          toolCalls: [
            {
              toolCallId: "finish",
              toolName: "submit_result",
              input: { report: "The original artifact was removed; no replacement read." },
            },
          ],
        },
      ]);
    }
    if (calls === 3) h.repo.db.prepare("DELETE FROM artifacts WHERE artifact_id=?").run(artifactId);
    return next(options);
  };
  const run = await h.coordinator.start({
    goal: "Read a downloaded text once, then inspect deletion",
    pageIds: ["p1"],
  });
  expect(await settle(h.repo, run.runId)).toMatchObject({ status: "completed" });
  expect(read).toHaveBeenCalledTimes(2);
  expect(latestToolResults).toHaveLength(4);
  expect(latestToolResults[3]).toContain("no longer available for replay");
  expect(latestToolResults[3]).not.toContain("REPLAY-SOURCE-SECRET");
  expect(h.pages.execute).toHaveBeenCalledOnce();
});

it("the real REPL profile mapping cannot expand into artifact reads", async () => {
  const model = new MockModelClient().scriptToolSteps([
    {
      toolCalls: [
        {
          toolCallId: "repl-read",
          toolName: "repl",
          input: { code: 'artifacts.readText({artifactId:"known"})' },
        },
      ],
    },
    {
      toolCalls: [
        {
          toolCallId: "finish",
          toolName: "submit_result",
          input: { report: "Artifact reading is unavailable to this profile" },
        },
      ],
    },
  ]);
  const h = coordinatorHarness(model);
  const read =
    vi.fn<
      NonNullable<import("../../apps/runtime/src/agent/loop/host.js").AgentLoopHostDeps["readArtifactText"]>
    >();
  h.coordinator.deps.agentLoop = { readArtifactText: read };
  const run = await h.coordinator.start({
    goal: "Read a known artifact",
    pageIds: [],
    agentProfile: {
      name: "restricted",
      prompt: "Only use the listed tools.",
      tools: ["repl", "submit_result"],
      workspace: "shared",
      packages: [],
    },
  });
  expect(await settle(h.repo, run.runId)).toMatchObject({ status: "completed" });
  expect(read).not.toHaveBeenCalled();
  expect(JSON.stringify(new TranscriptStore(h.db).load(run.runId))).toContain(
    "does not permit read_artifact_text",
  );
});
