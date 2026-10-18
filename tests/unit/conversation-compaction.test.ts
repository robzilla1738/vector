import { afterEach, describe, expect, it, vi } from "vitest";
import { AuxError, type RunContextState } from "@aux/contracts";
import { openDb, TranscriptStore, runAgentLoop, type ModelMessage, type ModelClient } from "@aux/runtime";
import {
  prepareConversationContext,
  contextAuthorityHash,
  contextOverflow,
  type ConversationContextOwner,
} from "../../apps/runtime/dist/agent/loop/compaction.js";
import { projectWorkingContext } from "../../apps/runtime/dist/agent/loop/working-context.js";
import { presentRun } from "../../apps/runtime/dist/services/run-presentation.js";
import { redactedPageRecallConfig } from "@aux/contracts/portable-page-recall";

const cleanup: (() => void)[] = [];
afterEach(() => {
  for (const close of cleanup.splice(0)) close();
});
const options = {
  contextTokens: 14_000,
  maxOutputTokens: 1_000,
  system: "Follow the task and current user instructions.",
  toolsBytes: 0,
};
function fixture() {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const transcript = new TranscriptStore(db);
  transcript.append("r", [
    { role: "user", content: "Prepare a draft; never send it. Keep account A." },
    ...Array.from({ length: 20 }, (_, index): ModelMessage => ({
      role: "assistant",
      content: `${index}: ${"Historical reasoning. ".repeat(100)}`,
    })),
  ]);
  let state: RunContextState | undefined;
  let authority = "original";
  const owner: ConversationContextOwner = {
    control: {},
    read: () => state,
    publish: (next) => {
      state = next;
    },
    authority: () => contextAuthorityHash(authority),
    check: () => {},
  };
  const summarize = vi.fn(
    async () => "The draft is prepared for account A. It has not been sent; review and finish the draft.",
  );
  const prepare = (extra: Partial<Parameters<typeof prepareConversationContext>[0]> = {}) =>
    prepareConversationContext({
      runId: "r",
      modelId: "model",
      transcript,
      options,
      owner,
      summarize,
      ...extra,
    });
  return {
    db,
    transcript,
    owner,
    summarize,
    prepare,
    state: () => state,
    changeAuthority: () => {
      authority = "changed";
    },
  };
}

describe("semantic conversation compaction", () => {
  it("counts one materialized document, Todos, image and recall suffix at the automatic threshold", async () => {
    const f = fixture();
    f.db.prepare("DELETE FROM run_transcript WHERE run_id='r'").run();
    f.transcript.append("r", [
      { role: "user", content: "Research the selected document without sending it." },
      { role: "assistant", content: "Historical reasoning. ".repeat(330) },
    ]);
    const bounded = { ...options, contextTokens: 20_000, maxOutputTokens: 500 };
    const suffix: ModelMessage[] = [
      { role: "user", content: "Selected document evidence: " + "D".repeat(38_100) },
      { role: "user", content: "Current durable plan: Review the selected source." },
      { role: "user", content: [{ type: "image", image: new Uint8Array([1, 2, 3]) }] },
      { role: "user", content: "Auto-recalled memory: exact retained source." },
    ];
    const raw = f.transcript.entries("r");
    const full = projectWorkingContext([...f.transcript.load("r"), ...suffix], bounded);
    expect(projectWorkingContext(f.transcript.load("r"), bounded).estimatedInputTokens).toBeLessThan(3_000);
    expect(full.estimatedInputTokens).toBeGreaterThanOrEqual(17_000);
    expect(full.estimatedInputTokens).toBeLessThan(full.inputBudgetTokens);
    const states: RunContextState[] = [];
    const publish = f.owner.publish;
    f.owner.publish = (state) => {
      states.push(state);
      publish(state);
    };
    const materialize = vi.fn(async (view: ModelMessage[]) => [...view, ...suffix]);
    const projected = await f.prepare({ options: bounded, materialize });
    expect(materialize).toHaveBeenCalledTimes(1);
    expect(f.summarize).toHaveBeenCalled();
    expect(states[0]!.stats.estimatedInputTokens).toBe(full.estimatedInputTokens);
    expect(states[0]!.stats.outputReserveTokens).toBe(500);
    expect(states[0]!.stats.inputBudgetTokens).toBe(17_500);
    for (const message of suffix) expect(projected).toContain(message);
    expect(f.state()?.stats.estimatedInputTokens).toBe(
      projectWorkingContext(projected, bounded).estimatedInputTokens,
    );
    expect(f.state()?.stats.occupancy).toBe(
      projectWorkingContext(projected, bounded).estimatedInputTokens / 17_500,
    );
    expect(f.transcript.entries("r")).toEqual(raw);
    expect(f.state()?.projection?.prefixHash).toBe(
      contextAuthorityHash(raw.filter(({ seq }) => seq <= f.state()!.projection!.boundarySeq)),
    );
    expect(
      f.summarize.mock.calls.every((args) => !JSON.stringify(args).includes("Selected document evidence")),
    ).toBe(true);
  });

  it("does not pretend compaction can remove an oversized admitted source", async () => {
    const f = fixture();
    await expect(
      f.prepare({
        materialize: async (view) => [
          ...view,
          { role: "user", content: "Selected evidence. ".repeat(5_000) },
        ],
      }),
    ).rejects.toMatchObject({ code: "model_error" });
    expect(f.state()?.stats.compaction.status).toBe("failed");
    expect(f.state()?.stats.estimatedInputTokens).toBeGreaterThan(f.state()!.stats.inputBudgetTokens);
    // The raw history can first compact, but source text is never itself summarized.
    expect(f.summarize.mock.calls.every((args) => !JSON.stringify(args).includes("Selected evidence"))).toBe(
      true,
    );
  });

  it("retains exact source identity carried only by a completed tool's original input", async () => {
    const f = fixture();
    f.transcript.append("r", [
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "input-reference",
            toolName: "webfetch",
            input: {
              url: "https://input-only.test/exact-source",
              sourceId: "source-input-only",
              startLine: 7,
              endLine: 19,
            },
          },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "input-reference",
            toolName: "webfetch",
            output: { type: "json", value: { status: "completed", text: "Fetched source text" } },
          },
        ],
      },
      ...Array.from({ length: 12 }, (): ModelMessage => ({
        role: "assistant",
        content: "Later completed research. ".repeat(100),
      })),
    ]);
    const projected = await f.prepare();
    expect(f.state()?.stats.compaction.status).toBe("completed");
    expect(JSON.stringify(projected)).toContain("https://input-only.test/exact-source");
    expect(JSON.stringify(projected)).toContain("source-input-only");
    const evidence = projected.find(
      (message) =>
        message.role === "user" &&
        typeof message.content === "string" &&
        message.content.startsWith("Exact historical source/effect references"),
    );
    expect(evidence?.content).toContain('"startLine":7');
  });

  it("keeps exact protected records and source references independently of summaries without changing history", async () => {
    const f = fixture();
    const protectedMessages: ModelMessage[] = [
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "pending",
            toolName: "act",
            input: { actionId: "effect-1", steps: ["send"] },
          },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "pending",
            toolName: "act",
            output: { type: "json", value: { status: "uncertain", intentId: "effect-1" } },
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "todos",
            toolName: "write_todos",
            input: { todos: ["Review the draft"] },
          },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "todos",
            toolName: "write_todos",
            output: { type: "json", value: { todos: ["Review the draft"] } },
          },
        ],
      },
      {
        role: "assistant",
        content: [
          {
            type: "tool-call",
            toolCallId: "read",
            toolName: "webfetch",
            input: { url: "https://source.test/doc" },
          },
        ],
      },
      {
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: "read",
            toolName: "webfetch",
            output: {
              type: "json",
              value: {
                url: "https://source.test/doc",
                revision: 7,
                quote: "Exact source quote",
                text: "read data",
              },
            },
          },
        ],
      },
      { role: "user", content: "Use account B instead; still do not send." },
    ];
    f.transcript.append("r", protectedMessages);
    f.transcript.append(
      "r",
      Array.from({ length: 12 }, (): ModelMessage => ({
        role: "assistant",
        content: "More completed research. ".repeat(100),
      })),
    );
    const raw = f.transcript.entries("r");
    const projected = await f.prepare();
    expect(f.summarize).toHaveBeenCalled();
    expect(f.state()?.stats.compaction.status).toBe("completed");
    expect(projected).toContainEqual(raw[0]!.message);
    for (const message of protectedMessages.slice(0, 4)) expect(projected).toContainEqual(message);
    expect(projected).toContainEqual(protectedMessages[6]);
    expect(JSON.stringify(projected)).toContain("Exact source quote");
    expect(JSON.stringify(projected)).toContain("effect-1");
    expect(f.transcript.entries("r")).toEqual(raw);
    expect(new TranscriptStore(f.db).forkEntries("r")).toEqual(raw);
    expect(f.state()?.projection?.prefixHash).toMatch(/^[a-f0-9]{64}$/);
    expect(f.state()!.stats.estimatedInputTokens).toBeLessThan(f.state()!.stats.inputBudgetTokens);
  });

  it("uses the existing projection after reopen and invalidates its exact prefix proof on edits", async () => {
    const f = fixture();
    await f.prepare();
    const projection = structuredClone(f.state()!.projection);
    f.summarize.mockClear();
    await f.prepare({ transcript: new TranscriptStore(f.db) });
    expect(f.state()!.projection).toEqual(projection);
    expect(f.summarize).not.toHaveBeenCalled();
    f.db
      .prepare("UPDATE run_transcript SET message=? WHERE run_id='r' AND seq=1")
      .run(JSON.stringify({ role: "assistant", content: "Changed source." }));
    await f.prepare();
    expect(f.state()!.projection?.prefixHash).not.toBe(projection?.prefixHash);
  });

  it.each(["authority", "append", "cancel", "stop"])(
    "rejects a summary after %s even when its provider ignores cancellation",
    async (change) => {
      const f = fixture();
      const abort = new AbortController();
      let ready!: () => void;
      let complete!: (value: string) => void;
      const started = new Promise<void>((resolve) => {
        ready = resolve;
      });
      f.summarize.mockImplementationOnce(() => {
        ready();
        return new Promise<string>((resolve) => {
          complete = resolve;
        });
      });
      const work = f.prepare({ signal: abort.signal });
      await started;
      if (change === "authority") f.changeAuthority();
      if (change === "append") f.transcript.append("r", [{ role: "user", content: "New exact constraint." }]);
      if (change === "cancel") f.owner.control.active!.cancel.abort(new AuxError("cancelled", "Cancelled"));
      if (change === "stop") abort.abort(new AuxError("cancelled", "Stopped"));
      complete("Stale summary must never publish.");
      await expect(work).rejects.toBeDefined();
      expect(f.state()?.projection).toBeUndefined();
      expect(JSON.stringify(f.transcript.load("r"))).not.toContain("Stale summary");
    },
  );

  it("refuses unbounded protected instructions before making a provider call", async () => {
    const f = fixture();
    f.transcript.append("r", [{ role: "user", content: "Never send. ".repeat(10_000) }]);
    await expect(f.prepare()).rejects.toMatchObject({ code: "model_error" });
    expect(f.summarize).not.toHaveBeenCalled();
  });

  it("adapts the complete recent tail to a smaller context and preserves original messages", async () => {
    const f = fixture();
    await f.prepare();
    const before = f.transcript.load("r");
    f.changeAuthority();
    await f.prepare({ options: { ...options, contextTokens: 8_000, maxOutputTokens: 512 } });
    expect(f.state()?.stats.compaction.status).toBe("completed");
    expect(f.state()!.stats.estimatedInputTokens).toBeLessThanOrEqual(6_688);
    expect(f.transcript.load("r")).toEqual(before);
  });

  it.each([
    { conversation: 64, utility: 32 },
    { conversation: 32, utility: 64 },
  ])("honors small route output limits ($conversation/$utility) without changing history", async (limits) => {
    const f = fixture();
    const original = f.transcript.entries("r");
    const summarize = vi.fn<Parameters<typeof prepareConversationContext>[0]["summarize"]>(
      async () => "The draft remains unsent.",
    );
    await f.prepare({
      summarize,
      options: { ...options, maxOutputTokens: limits.conversation },
      summaryLimits: { contextTokens: 4_000, maxOutputTokens: limits.utility },
    });
    expect(summarize).toHaveBeenCalled();
    for (const [request] of summarize.mock.calls) {
      expect(request.maxOutputTokens).toBeLessThanOrEqual(32);
      expect(request.messages[0]?.content).toContain("Target at most 32 tokens");
    }
    expect(f.state()?.stats.compaction.status).toBe("completed");
    expect(f.transcript.entries("r")).toEqual(original);
  });

  it("removes private summary text from public runs and forgotten/portable context", async () => {
    const f = fixture();
    await f.prepare();
    const run = {
      runId: "r",
      goal: "Draft",
      pageIds: [],
      status: "completed" as const,
      createdAt: 1,
      config: { contextCompaction: f.state(), context: "source" },
    };
    expect(presentRun(run).config).not.toHaveProperty("contextCompaction");
    expect(redactedPageRecallConfig(run.config).contextCompaction).toBeUndefined();
  });
});

describe("agent loop compaction dispatch", () => {
  it("recovers a provider context overflow through bounded compaction while retaining the failed invoice", async () => {
    const f = fixture();
    let mainCalls = 0;
    const onModelFailure = vi.fn(),
      onStep = vi.fn();
    const toolCallStep = vi.fn(async (request: Parameters<NonNullable<ModelClient["toolCallStep"]>>[0]) => {
      if (Object.keys(request.tools).length && ++mainCalls === 1)
        throw new AuxError("model_error", "Maximum context length exceeded");
      return {
        durationMs: 1,
        inputTokens: 100,
        outputTokens: 10,
        message: { role: "assistant" as const, content: "Complete" },
        toolCalls: [],
        text: Object.keys(request.tools).length
          ? "Done"
          : "The draft remains unsent. Review the original account and sources.",
        finishReason: "stop",
      };
    });
    const result = await runAgentLoop({
      runId: "r",
      threadId: "chat",
      modelId: "model",
      model: { toolCallStep },
      tools: {
        probe: {
          description: "Read",
          byline: "Read",
          inputSchema: (await import("zod")).z.object({}),
          execute: async () => ({ output: "read" }),
        },
      },
      deps: {},
      transcript: f.transcript,
      contextTokens: 100_000,
      maxOutputTokens: 1_000,
      system: options.system,
      contextOwner: f.owner,
      onStep,
      onModelFailure,
    });
    expect(result.kind).toBe("done");
    expect(mainCalls).toBe(2);
    expect(onModelFailure).toHaveBeenCalledTimes(1);
    expect(onStep.mock.calls.some(([info]) => info.purpose === "compaction")).toBe(true);
    expect(f.state()?.projection).toBeDefined();
    expect(f.state()?.stats.compaction.reason).toBe("overflow");
  });

  it("never executes or persists a tool call returned by a summary-only request", async () => {
    const f = fixture(),
      execute = vi.fn();
    const toolCallStep = vi.fn(async () => ({
      durationMs: 1,
      inputTokens: 100,
      outputTokens: 10,
      message: { role: "assistant" as const, content: "Untrusted summary" },
      toolCalls: [{ toolCallId: "must-not-run", toolName: "probe", input: {} }],
      text: "Untrusted summary",
    }));
    const onStep = vi.fn();
    const result = await runAgentLoop({
      runId: "r",
      threadId: "chat",
      modelId: "model",
      model: { toolCallStep },
      tools: {
        probe: {
          description: "Read",
          byline: "Read",
          inputSchema: (await import("zod")).z.object({}),
          execute,
        },
      },
      deps: {},
      transcript: f.transcript,
      contextTokens: 14_000,
      maxOutputTokens: 1_000,
      system: options.system,
      contextOwner: f.owner,
      onStep,
    });
    expect(result.kind).toBe("failed");
    expect(execute).not.toHaveBeenCalled();
    expect(onStep).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(f.transcript.load("r"))).not.toContain("must-not-run");
  });

  it("bills summary-only calls through the same callbacks without streaming or executing them", async () => {
    const f = fixture();
    const onStep = vi.fn(),
      onText = vi.fn(),
      beforeModelCall = vi.fn(),
      afterModelCall = vi.fn();
    const toolCallStep = vi.fn(async (request: Parameters<NonNullable<ModelClient["toolCallStep"]>>[0]) => ({
      durationMs: 1,
      inputTokens: 0,
      outputTokens: 10,
      message: { role: "assistant" as const, content: "Complete" },
      toolCalls: [],
      text: Object.keys(request.tools).length ? "Done" : "Prepared a draft; no send occurred.",
      finishReason: "stop",
    }));
    const result = await runAgentLoop({
      runId: "r",
      threadId: "chat",
      modelId: "model",
      model: { toolCallStep },
      tools: {
        probe: {
          description: "Read",
          byline: "Read",
          inputSchema: (await import("zod")).z.object({}),
          execute: async () => ({ output: "read" }),
        },
      },
      deps: {},
      transcript: f.transcript,
      contextTokens: 14_000,
      maxOutputTokens: 1_000,
      system: options.system,
      contextOwner: f.owner,
      onStep,
      onText,
      beforeModelCall,
      afterModelCall,
    });
    expect(result.kind).toBe("done");
    expect(onStep.mock.calls.some(([info]) => info.purpose === "compaction")).toBe(true);
    expect(beforeModelCall).toHaveBeenCalledTimes(toolCallStep.mock.calls.length);
    expect(afterModelCall).toHaveBeenCalledTimes(toolCallStep.mock.calls.length);
    expect(
      toolCallStep.mock.calls
        .filter(([request]) => !Object.keys(request.tools).length)
        .every(([request]) => request.onText === undefined),
    ).toBe(true);
    expect(f.state()?.stats.observedInputTokens).toBe(0);
    expect(
      f.transcript
        .load("r")
        .filter((message) => JSON.stringify(message).includes("Prepared a draft; no send occurred.")),
    ).toHaveLength(0);
  });

  it("recognizes explicit overflow through wrapped errors without classifying rate limits", () => {
    expect(contextOverflow({ cause: { code: "context_length_exceeded" } })).toBe(true);
    expect(contextOverflow(new Error("Maximum context length exceeded"))).toBe(true);
    expect(contextOverflow(new Error("Rate limit exceeded"))).toBe(false);
    const cyclic: { cause?: unknown } = {};
    cyclic.cause = cyclic;
    expect(contextOverflow(cyclic)).toBe(false);
  });
});

it("preserves exact filtered schema bytes through completed and failed compaction", async () => {
  for (const fail of [false, true]) {
    const f = fixture();
    f.owner.control.pending = {
      id: "manual",
      reason: "manual",
      cancel: new AbortController(),
    };
    const optionsWithTools = { ...options, toolsBytes: 1234 };
    const work = f.prepare({
      options: optionsWithTools,
      ...(fail
        ? {
            summarize: async () => {
              throw new Error("Unavailable summary");
            },
          }
        : {}),
    });
    const error: unknown = await work.then(
      () => undefined,
      (failure: unknown) => failure,
    );
    expect(error instanceof Error ? error.message : undefined).toBe(fail ? "Unavailable summary" : undefined);
    expect(f.state()?.toolsBytes).toBe(1234);
    expect(f.state()?.stats.compaction.status).toBe(fail ? "failed" : "completed");
  }
});
