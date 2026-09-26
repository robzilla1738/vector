import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  MockModelClient,
  TranscriptStore,
  buildToolManifest,
  budgetToolOutputs,
  compactMessages,
  openDb,
  pruneMedia,
  runAgentLoop,
  TRANSCRIPT_COMPACT_BYTES,
  TRANSCRIPT_KEEP_TAIL,
  TURN_TOOL_BUDGET_BYTES,
  type AgentLoopOptions,
  type LoopToolDeps,
  type ModelMessage,
} from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() => { for (const fn of cleanup.splice(0).reverse()) fn(); });

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
const toolMsg = (id: string, output: unknown): ModelMessage =>
  ({ role: "tool", content: [{ type: "tool-result", toolCallId: id, toolName: "act", output: { type: "json", value: output } }] }) as ModelMessage;

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
    expect(pruneMedia({ s: "data:image/png;base64,abc", t: "x".repeat(50_000) })).toMatchObject({ s: "data:image/png;base64,abc" });
  });
});

describe("context management — per-turn tool budget", () => {
  it("keeps results under 40 KB verbatim and truncates what overflows", () => {
    const results = [
      { toolCallId: "a", toolName: "act", output: "small" },
      { toolCallId: "b", toolName: "act", output: "x".repeat(TURN_TOOL_BUDGET_BYTES - 20) },
      { toolCallId: "c", toolName: "act", output: "also small" },
    ];
    const bounded = budgetToolOutputs(results);
    expect(bounded[0]!.output).toBe("small");
    expect(bounded[1]!.output).toBe("x".repeat(TURN_TOOL_BUDGET_BYTES - 20)); // fits under the cap
    expect((bounded[2]!.output as Record<string, unknown>).truncated).toBe(true);
    expect((bounded[2]!.output as Record<string, unknown>).bytes).toBeGreaterThan(0);
    expect(bounded).toHaveLength(3); // every call keeps its slot
  });
});

describe("context management — compaction", () => {
  it("shrinks the middle of an oversized history, keeps task and tail verbatim", () => {
    const messages: ModelMessage[] = [userTask];
    for (let i = 0; i < 20; i++) messages.push(toolMsg(`t${i}`, { blob: "y".repeat(4_000) }));
    const before = JSON.stringify(messages).length;
    const compacted = compactMessages(messages);
    expect(compacted).not.toBeNull();
    expect(compacted!.messages[0]).toMatchObject({ role: "user", content: "do the task" });
    // the newest KEEP_TAIL messages are untouched
    for (let i = messages.length - TRANSCRIPT_KEEP_TAIL; i < messages.length; i++)
      expect(compacted!.messages[i]).toEqual(messages[i]);
    // the middle got placeholders and the whole thing is smaller
    const middle = (compacted!.messages[3]!.content as Record<string, unknown>[])[0]!;
    expect((middle.output as { value: { compacted?: boolean } }).value.compacted).toBe(true);
    expect(JSON.stringify(compacted!.messages).length).toBeLessThan(before);
    expect(compacted!.changed.length).toBeGreaterThan(0);
  });

  it("returns null when nothing between task and tail can shrink", () => {
    const messages: ModelMessage[] = [userTask, toolMsg("a", { ok: 1 }), toolMsg("b", { ok: 2 })];
    expect(compactMessages(messages)).toBeNull();
  });
});

describe("TranscriptStore entries/rewrite (compaction)", () => {
  it("rewrites message rows in place and survives reload", () => {
    const { transcript, db } = fixture();
    transcript.append("r1", [userTask, toolMsg("t1", { blob: "z".repeat(4_000) }), userTask]);
    const entries = transcript.entries("r1");
    expect(entries).toHaveLength(3);
    expect(entries.map((e) => e.seq)).toEqual([0, 1, 2]);
    transcript.rewrite("r1", [{ seq: entries[1]!.seq, message: toolMsg("t1", { compacted: true }) }]);
    const reloaded = new TranscriptStore(db).load("r1");
    expect((reloaded[1]!.content as Record<string, unknown>[])[0]).toMatchObject({
      output: { value: { compacted: true } },
    });
  });
});

describe("runAgentLoop — context integration", () => {
  it("prunes media and applies the tool budget before persisting results", async () => {
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
      act: async () => ({ output: { shot: `data:image/png;base64,${"B".repeat(60_000)}`, extra: "e".repeat(10_000) } }),
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

  it("truncates the overflow result when a step's outputs exceed 40 KB", async () => {
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
    const deps: LoopToolDeps = { act: async () => ({ output: "w".repeat(30_000) }) };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done" });
    const parts = transcript.load("run-1")[2]!.content as { output: { value: unknown } }[];
    expect(parts[0]!.output.value).toBe("w".repeat(30_000));
    expect(parts[1]!.output.value).toMatchObject({ truncated: true, bytes: 30_002 });
  });

  it("injects auto-recall once as a durable system message after the task", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([{ text: "done" }]);
    const deps: LoopToolDeps = {
      recall: async (query) => {
        expect(query).toBe("do the task");
        return [{ title: "Note", url: "https://example.com", text: "saved snippet" }];
      },
    };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done" });
    const messages = transcript.load("run-1");
    expect(messages[1]).toMatchObject({ role: "system" });
    expect(String(messages[1]!.content)).toMatch(/Auto-recalled memory.*Note — https:\/\/example\.com/s);
    // a second invocation does not re-inject (messages.length > 1 now)
    let calls = 0;
    const again = await runAgentLoop({
      ...baseOpts(transcript, { recall: async () => { calls++; return [{ title: "x", url: "y", text: "z" }]; } }),
      model: new MockModelClient().scriptToolSteps([{ text: "again" }]),
    });
    expect(again).toMatchObject({ kind: "done" });
    expect(calls).toBe(0);
    expect(transcript.load("run-1").filter((m) => m.role === "system")).toHaveLength(1);
  });

  it("recall failure never blocks the run", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    const model = new MockModelClient().scriptToolSteps([{ text: "done" }]);
    const deps: LoopToolDeps = { recall: async () => { throw new Error("memory down"); } };
    const outcome = await runAgentLoop({ ...baseOpts(transcript, deps), model });
    expect(outcome).toMatchObject({ kind: "done" });
    expect(transcript.load("run-1").filter((m) => m.role === "system")).toHaveLength(0);
  });

  it("compacts an oversized transcript durably before the next model call", async () => {
    const { transcript } = fixture();
    transcript.append("run-1", [userTask]);
    // >192 KB of message history across 20 tool results
    for (let i = 0; i < 20; i++)
      transcript.append("run-1", [{ role: "assistant", content: "ok" } as ModelMessage, toolMsg(`t${i}`, { blob: "y".repeat(11_000) })]);
    expect(JSON.stringify(transcript.load("run-1")).length).toBeGreaterThan(TRANSCRIPT_COMPACT_BYTES);
    const model = new MockModelClient().scriptToolSteps([{ text: "done" }]);
    const outcome = await runAgentLoop({ ...baseOpts(transcript), model });
    expect(outcome).toMatchObject({ kind: "done" });
    const reloaded = transcript.load("run-1");
    // task + newest tail verbatim; the compacted middle persists
    expect(reloaded[0]).toMatchObject({ content: "do the task" });
    const anyCompacted = reloaded.some((m) => Array.isArray(m.content) && JSON.stringify(m.content).includes('"compacted":true'));
    expect(anyCompacted).toBe(true);
    const size = JSON.stringify(reloaded.slice(0, -1)).length; // before the final assistant message
    expect(size).toBeLessThan(TRANSCRIPT_COMPACT_BYTES + 20_000);
  });
});
