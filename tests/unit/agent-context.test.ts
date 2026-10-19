import { annotateToolFailure, codingResumeSummary } from "../../apps/runtime/dist/agent/loop/context.js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  MockModelClient,
  TranscriptStore,
  buildToolManifest,
  prepareWorkingContext,
  openDb,
  pruneMedia,
  runAgentLoop,
  type AgentLoopOptions,
  type LoopToolDeps,
  type ModelMessage,
} from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => {
  vi.useRealTimers();
  for (const fn of cleanup.splice(0).reverse()) fn();
});

function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-ctx-"));
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

const actStep = { steps: [{ id: "s1", op: "click", target: "r1" }] };

const userTask: ModelMessage = { role: "user", content: "do the task" };
const toolMsg = (id: string, output: unknown, toolName = "act"): ModelMessage =>
  ({
    role: "tool",
    content: [{ type: "tool-result", toolCallId: id, toolName, output: { type: "json", value: output } }],
  }) as ModelMessage;

describe("context management — pruneMedia", () => {
  it("replaces oversized data URLs anywhere in the output, keeps the rest", () => {
    const big = `data:image/png;base64,${"A".repeat(20_000)}`;
    const output = { shot: big, nested: [{ media: big, keep: "yes" }], text: "plain" };
    const pruned = pruneMedia(output) as Record<string, unknown>;
    expect(pruned.shot).toMatchObject({ prunedMedia: true, bytes: big.length, mime: "image/png" });
    expect((pruned.nested as Record<string, unknown>[])[0]!.media).toMatchObject({ prunedMedia: true });
    expect((pruned.nested as Record<string, unknown>[])[0]!.keep).toBe("yes");
    expect(pruned.text).toBe("plain");
  });

  it("leaves small data URLs and non-media strings alone", () => {
    expect(pruneMedia({ s: "data:image/png;base64,abc", t: "x".repeat(50_000) })).toMatchObject({
      s: "data:image/png;base64,abc",
    });
  });
});

it("keeps resume diffs bounded and points to independent interrupted-command evidence", () => {
  const files = Array.from({ length: 30 }, (_, i) => ({
    receiptId: `receipt-${i}`,
    actionId: `action-${i}`,
    runId: "run",
    createdAt: i,
    status: "confirmed" as const,
    before: [{ path: `/project/${i}`, content: "prefix".repeat(4000) + "old", version: "old" }],
    after: [{ path: `/project/${i}`, content: "prefix".repeat(4000) + "new", version: "new" }],
  }));
  const processes = [
    {
      processId: "process",
      runId: "run",
      actionId: "command",
      requestHash: "hash",
      command: "test",
      workdir: "/project",
      startedAt: 0,
      state: "interrupted" as const,
      logPath: "/logs",
      artifactId: "logs",
      undoAvailable: false as const,
    },
  ];
  const summary = codingResumeSummary(files, processes);
  expect(Buffer.byteLength(summary)).toBeLessThanOrEqual(8192);
  const parsed = JSON.parse(summary);
  expect(parsed.fileCount).toBe(30);
  expect(parsed.note).toContain("unknown outcomes");
  expect(summary).toContain("new");
});

const workingOptions = { contextTokens: 16_000, maxOutputTokens: 1000, system: "system", toolsBytes: 500 };
const callMsg = (id: string, toolName: string, input: unknown): ModelMessage => ({
  role: "assistant",
  content: [{ type: "tool-call", toolCallId: id, toolName, input }],
});

describe("model working context", () => {
  it("uses the selected window, schema/system cost and output reserve without rewriting messages", () => {
    const messages = [
      userTask,
      toolMsg("read", { url: "https://example.com", text: "source".repeat(20_000) }, "webfetch"),
    ];
    const original = JSON.stringify(messages);
    const small = prepareWorkingContext(messages, workingOptions);
    expect(small.estimatedInputTokens).toBeLessThanOrEqual(small.inputBudgetTokens);
    expect(JSON.stringify(small.messages)).toContain('"contextElided":true');
    const large = prepareWorkingContext(messages, { ...workingOptions, contextTokens: 200_000 });
    expect(large.messages).toEqual(messages);
    expect(JSON.stringify(messages)).toBe(original);
    const moreOverhead = prepareWorkingContext(messages, {
      ...workingOptions,
      toolsBytes: 3500,
      maxOutputTokens: 2000,
    });
    expect(moreOverhead.inputBudgetTokens).toBe(small.inputBudgetTokens - 1000);
    expect(moreOverhead.estimatedInputTokens).toBe(small.estimatedInputTokens + 1000);
    expect(
      prepareWorkingContext([userTask], { ...workingOptions, contextTokens: 1_000_000 }).inputBudgetTokens,
    ).toBe(128_000);
  });

  it("compacts stale observations first and keeps current evidence, user constraints and decisions exact", () => {
    const constraint: ModelMessage = {
      role: "user",
      content: "detail ".repeat(100) + "Never send the draft.",
    };
    const decision: ModelMessage = {
      role: "assistant",
      content: "reason ".repeat(100) + "Use the selected account only.",
    };
    const current = toolMsg(
      "latest",
      {
        pageId: "p1",
        observationId: "obs-new",
        content: { url: "https://example.com/new", text: "new".repeat(6000) },
      },
      "snapshot",
    );
    const messages = [
      userTask,
      toolMsg(
        "old",
        {
          pageId: "p1",
          observationId: "obs-old",
          content: { url: "https://example.com/old", text: "old".repeat(20_000) },
        },
        "snapshot",
      ),
      constraint,
      decision,
      current,
    ];
    const projected = prepareWorkingContext(messages, workingOptions).messages;
    expect(projected[2]).toEqual(constraint);
    expect(projected[3]).toEqual(decision);
    expect(projected[4]).toEqual(current);
    expect(JSON.stringify(projected[1])).toContain('"observationId":"obs-old"');
    expect(JSON.stringify(projected[1])).toContain('"url":"https://example.com/old"');
  });

  it("replaces exact redundant reads with explicit references while keeping the latest original", () => {
    const output = { url: "https://example.com", text: "source ".repeat(160) };
    const messages = [
      userTask,
      ...Array.from({ length: 60 }, (_, i) => toolMsg(`read-${i}`, output, "webfetch")),
    ];
    const projected = prepareWorkingContext(messages, workingOptions);
    expect(projected.estimatedInputTokens).toBeLessThanOrEqual(projected.inputBudgetTokens);
    expect(projected.messages[1]).toMatchObject({
      content: [{ toolCallId: "read-0", output: { value: { identicalResultToolCallId: "read-59" } } }],
    });
    expect(projected.messages.at(-1)).toEqual(messages.at(-1));
  });

  it("retains every nested source and effect reference and failure diagnostics in explicit excerpts", () => {
    const sources = Array.from({ length: 30 }, (_, i) => ({
      title: `source-${i}`,
      url: `https://example.com/${i}`,
      text: "x".repeat(2000),
    }));
    const receiptIds = Array.from({ length: 30 }, (_, i) => `receipt-${i}-${"r".repeat(600)}`);
    const output = annotateToolFailure({
      sources,
      receiptIds,
      processId: "process",
      artifactId: "logs",
      exitCode: 1,
      stdout: "x".repeat(100_000) + "assertion failed",
      stderr: "diagnostic",
    });
    const projected = prepareWorkingContext([userTask, toolMsg("effect", output)], {
      ...workingOptions,
      contextTokens: 20_000,
    });
    expect(projected.messages[1]).toMatchObject({
      content: [
        {
          output: {
            value: {
              evidence: {
                receiptIds,
                sources: sources.map(({ title, url }) => ({ title, url })),
                diagnostic: { excerpt: expect.stringContaining("assertion failed"), exitCode: 1 },
              },
              recovery: expect.stringContaining("Do not repeat effects"),
            },
          },
        },
      ],
    });
  });

  it.each([{ status: "uncertain" }, { interrupted: true }])(
    "keeps unresolved effects %j and unanswered inputs exact while compacting other results",
    (state) => {
      const unresolved = toolMsg("effect", {
        ...state,
        receiptId: "receipt",
        content: "uncertain".repeat(1000),
      });
      const effect = callMsg("effect", "act", { command: "original".repeat(1000) });
      const pending = callMsg("pending", "repl", { code: "pending".repeat(500) });
      const messages = [
        userTask,
        effect,
        unresolved,
        toolMsg("read", "x".repeat(100_000), "webfetch"),
        pending,
      ];
      const projected = prepareWorkingContext(messages, workingOptions).messages;
      expect(projected[1]).toEqual(effect);
      expect(projected[2]).toEqual(unresolved);
      expect(projected[4]).toEqual(pending);
      expect(() =>
        prepareWorkingContext(
          [userTask, callMsg("pending", "repl", { code: "x".repeat(100_000) })],
          workingOptions,
        ),
      ).toThrow("larger context");
    },
  );

  it("keeps a yielded program's original input while its cell is still running", () => {
    const messages = [
      userTask,
      callMsg("cell", "repl", { code: "original program ".repeat(7000) }),
      toolMsg("cell", { cellId: "active-cell", running: true }, "repl"),
    ];
    expect(() => prepareWorkingContext(messages, workingOptions)).toThrow(
      "unresolved effects were preserved",
    );
    expect(messages[1]).toEqual(callMsg("cell", "repl", { code: "original program ".repeat(7000) }));
  });

  it("preserves owner answers and plan decisions carried by tools, including instructions at the end", () => {
    const answer = toolMsg(
      "answer",
      { answer: "context ".repeat(500) + "Do not publish." },
      "ask_user_question",
    );
    const plan = callMsg("plan", "write_todos", { todos: ["details ".repeat(500) + "Wait for my review."] });
    const messages = [
      userTask,
      answer,
      plan,
      toolMsg("plan", { written: true }, "write_todos"),
      toolMsg("read", "x".repeat(100_000), "webfetch"),
    ];
    const projected = prepareWorkingContext(messages, workingOptions).messages;
    expect(projected[1]).toEqual(answer);
    expect(projected[2]).toEqual(plan);
  });

  it("can compact completed bulky programs without losing pairing or altering the durable input", () => {
    const input = { code: "x".repeat(120_000) };
    const messages = [
      userTask,
      callMsg("program", "repl", input),
      toolMsg("program", { status: "confirmed", receiptId: "receipt" }),
    ];
    const projected = prepareWorkingContext(messages, workingOptions).messages;
    expect(projected[1]).toMatchObject({
      content: [
        { type: "tool-call", toolCallId: "program", input: { contextElided: true, toolCallId: "program" } },
      ],
    });
    expect(projected[2]).toEqual(messages[2]);
    expect(messages[1]).toEqual(callMsg("program", "repl", input));
  });

  it("preserves reasoning text and signed provider data rather than silently rewriting decisions", () => {
    const reasoning: ModelMessage = {
      role: "assistant",
      content: [
        {
          type: "reasoning",
          text: "decision".repeat(100),
          providerOptions: { gateway: { signature: "signed".repeat(500) } },
        },
      ],
    };
    const messages = [userTask, reasoning, toolMsg("read", "x".repeat(100_000), "webfetch")];
    expect(prepareWorkingContext(messages, workingOptions).messages[1]).toEqual(reasoning);
  });
});

describe("runAgentLoop — context integration", () => {
  it("replaces embedded media with artifact markers before persisting results", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "s1", toolName: "act", input: actStep },
          { toolCallId: "s2", toolName: "act", input: actStep },
        ],
      },
      { text: "done" },
    ]);
    const deps: LoopToolDeps = {
      act: async () => ({
        output: { shot: `data:image/png;base64,${"B".repeat(60_000)}`, extra: "e".repeat(10_000) },
      }),
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done" });
    const toolMessage = transcript.load("run-1")[2]!; // task → assistant(calls) → tool(results)
    const parts = toolMessage.content as { output: { value: Record<string, unknown> } }[];
    // the 60 KB data URL prunes to a marker; the rest stays verbatim under the cap
    const shot = parts[0]!.output.value.shot as { prunedMedia?: boolean };
    expect(shot.prunedMedia).toBe(true);
    expect(JSON.stringify(toolMessage).length).toBeLessThan(90_000);
  });

  it("keeps full large results durably and projects a smaller request after restart", async () => {
    const { transcript, db } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([
      {
        toolCalls: [
          { toolCallId: "s1", toolName: "act", input: actStep },
          { toolCallId: "s2", toolName: "act", input: actStep },
        ],
      },
      { text: "done" },
    ]);
    const requests: ModelMessage[][] = [];
    const wrapped = {
      toolCallStep: async (request: Parameters<typeof model.toolCallStep>[0]) => {
        requests.push(request.messages);
        return model.toolCallStep(request);
      },
    };
    const deps: LoopToolDeps = {
      act: async () => ({ output: { text: "w".repeat(90_000), receiptId: "receipt", status: "confirmed" } }),
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model: wrapped });
    expect(outcome).toMatchObject({ kind: "done" });
    const original = new TranscriptStore(db).load("run-1");
    expect(original[2]).toMatchObject({
      content: Array.from({ length: 2 }, () => ({ output: { value: { text: "w".repeat(90_000) } } })),
    });
    expect(JSON.stringify(requests[1])).toContain('"contextElided":true');
    requests.length = 0;
    await runAgentLoop({ ...baseOpts(new TranscriptStore(db)), model: wrapped });
    expect(JSON.stringify(requests[0])).toContain('"contextElided":true');
    expect(new TranscriptStore(db).load("run-1").slice(0, original.length)).toEqual(original);
  });

  it("fails before provider admission when protected instructions cannot fit and allows a larger route", async () => {
    const { transcript } = fixture();
    const constraint = {
      role: "user",
      content: "Never submit until I review. ".repeat(4000),
    } as ModelMessage;
    transcript.append("run-1", [constraint]);
    const model = new MockModelClient().scriptToolSteps([{ text: "done" }]);
    let admissions = 0;
    const options = {
      ...baseOpts(transcript),
      model,
      beforeModelCall: () => {
        admissions++;
        return undefined;
      },
    };
    const outcome = await runAgentLoop({ ...options, contextTokens: 64_000 });
    expect(outcome).toMatchObject({
      kind: "failed",
      error: { code: "model_error", message: expect.stringContaining("larger context") },
    });
    expect(admissions).toBe(0);
    expect(transcript.load("run-1")).toEqual([constraint]);
    expect(await runAgentLoop({ ...options, contextTokens: 200_000 })).toMatchObject({ kind: "done" });
    expect(admissions).toBe(1);
    expect(
      await runAgentLoop({
        ...options,
        contextTokens: 200_000,
        deps: {
          recall: async () => async () => ({
            hits: [
              { title: "Large optional source", url: "https://example.com", text: "extra".repeat(100_000) },
            ],
            admit: () => {
              throw new Error("Oversized optional recall must be omitted");
            },
          }),
        },
      }),
    ).toMatchObject({ kind: "done" });
    expect(transcript.load("run-1")[0]).toEqual(constraint);
  });

  it("rehydrates recall per provider boundary and on resume without persisting snippets", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "s1", toolName: "act", input: actStep }] },
      { text: "done" },
    ]);
    const requests: ModelMessage[][] = [];
    let preparations = 0,
      readers = 0,
      admissions = 0;
    let text = "expired snippet";
    const deps: LoopToolDeps = {
      recall: async (query, context) => {
        preparations++;
        expect(query).toBe("do the task");
        expect(context.signal.aborted).toBe(false);
        return async () => {
          readers++;
          const original = text;
          return {
            hits: [{ title: "Note", url: "https://example.com", text: original }],
            admit: () => original === text,
          };
        };
      },
      act: async () => ({ output: "clicked" }),
    };
    const wrapped = {
      toolCallStep: async (request: Parameters<typeof model.toolCallStep>[0]) => {
        requests.push(request.messages);
        return model.toolCallStep(request);
      },
    };
    const outcome = await runAgentLoop({
      ...baseOpts(transcript, deps),
      model: wrapped,
      beforeModelCall: () => {
        if (++admissions === 1) text = "fresh snippet";
        return undefined;
      },
    });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(preparations).toBe(1);
    expect(readers).toBe(2);
    expect(JSON.stringify(requests[0])).not.toContain("snippet");
    expect(JSON.stringify(requests[1])).toContain("fresh snippet");
    expect(JSON.stringify(transcript.load("run-1"))).not.toContain("snippet");
    requests.length = 0;
    await runAgentLoop({ ...baseOpts(transcript, deps), model: wrapped });
    expect(preparations).toBe(2);
    expect(JSON.stringify(requests[0])).toContain("fresh snippet");
    expect(JSON.stringify(transcript.load("run-1"))).not.toContain("Auto-recalled");
  });

  it("waits at most 150 ms initially and bounds later readers while accepting ready recall", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    let release!: () => void;
    const ready = new Promise<void>((resolve) => {
      release = resolve;
    });
    const requests: ModelMessage[][] = [];
    let reads = 0;
    let slowSignal: AbortSignal | undefined;
    const model = new MockModelClient().scriptToolSteps([
      { toolCalls: [{ toolCallId: "s1", toolName: "act", input: actStep }] },
      { toolCalls: [{ toolCallId: "s2", toolName: "act", input: actStep }] },
      { text: "done" },
    ]);
    const pending = runAgentLoop({
      ...baseOpts(transcript, {
        recall: async () => {
          await ready;
          return async (signal) => {
            if (++reads > 1) {
              slowSignal = signal;
              return new Promise(() => {});
            }
            return {
              hits: [{ title: "Note", url: "https://example.com", text: "late snippet" }],
              admit: () => true,
            };
          };
        },
        act: async () => {
          release();
          await ready;
          return { output: "clicked" };
        },
      }),
      model: {
        toolCallStep: async (request) => {
          requests.push(request.messages);
          return model.toolCallStep(request);
        },
      },
    });
    await vi.advanceTimersByTimeAsync(149);
    expect(requests).toHaveLength(0);
    await vi.advanceTimersByTimeAsync(1);
    expect(requests).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(150);
    expect(slowSignal?.aborted).toBe(true);
    expect(await pending).toMatchObject({ kind: "done" });
    expect(JSON.stringify(requests[0])).not.toContain("late snippet");
    expect(JSON.stringify(requests[1])).toContain("late snippet");
    expect(JSON.stringify(requests[2])).not.toContain("late snippet");
    expect(JSON.stringify(transcript.load("run-1"))).not.toContain("late snippet");
  });

  it("cancels outstanding recall when the loop stops", async () => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const controller = new AbortController();
    let lifetime!: AbortSignal, boundary!: AbortSignal;
    let calls = 0;
    const pending = runAgentLoop({
      ...baseOpts(transcript, {
        recall: async (_query, context) => {
          lifetime = context.signal;
          return async (signal) => {
            boundary = signal;
            return new Promise(() => {});
          };
        },
      }),
      signal: controller.signal,
      model: {
        toolCallStep: async () => {
          calls++;
          throw new Error("must not dispatch");
        },
      },
    });
    await vi.advanceTimersByTimeAsync(10);
    controller.abort();
    expect(await pending).toMatchObject({ kind: "failed", error: { code: "cancelled" } });
    expect(lifetime.aborted).toBe(true);
    expect(boundary.aborted).toBe(true);
    expect(calls).toBe(0);
    expect(transcript.load("run-1")).toEqual([userTask]);
  });

  it("recall failure never blocks the run", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([{ text: "done" }]);
    const deps: LoopToolDeps = {
      recall: async () => {
        throw new Error("memory down");
      },
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(
      transcript.load("run-1").filter((m) => String(m.content).includes("Auto-recalled memory")),
    ).toHaveLength(0);
  });
});

it("retains bounded unresolved references beyond the recent receipts and diagnoses stopped commands", () => {
  const unresolved = {
    total: 85,
    receipts: [{ kind: "file", receiptId: "old-uncertain", state: "uncertain" }],
    nextOffset: 1,
    omittedCount: 84,
  };
  const summary = JSON.parse(codingResumeSummary([], [], 100, unresolved));
  expect(summary.unresolved).toEqual(unresolved);
  expect(summary.note).toContain("coding_state");
  const result = annotateToolFailure({
    command: "npm test",
    workdir: "/project",
    state: "stopped",
    signal: "SIGKILL",
    exitCode: null,
    stderr: "Interrupted test",
  });
  expect(result).toMatchObject({
    diagnostic: {
      command: "npm test",
      workdir: "/project",
      state: "stopped",
      signal: "SIGKILL",
      exitCode: null,
      excerpt: "Interrupted test",
    },
  });
});
