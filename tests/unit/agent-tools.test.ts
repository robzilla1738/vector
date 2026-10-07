import { describe, expect, it } from "vitest";
import { buildToolManifest, type LoopToolContext, type LoopToolDeps } from "@aux/runtime";

function ctx(deps: LoopToolDeps, extra: Partial<LoopToolContext> = {}): LoopToolContext {
  return { runId: "run-1", threadId: "chat-1", turnId: "run-1", callCount: 1, goalTurn: 1, deps, ...extra };
}

const manifest = buildToolManifest();

it("limits model Goal updates to pause or blocker reports and forwards the durable turn", async () => {
  const seen: unknown[] = [];
  const deps: LoopToolDeps = {
    goalUpdate: async (input, context) => {
      seen.push({ ...input, runId: context.runId, turn: context.goalTurn });
      return { status: "still_active", remaining: 2 };
    },
  };
  expect(manifest["goal_update"]!.requiresSoloCall).toBe(true);
  expect(
    await manifest["goal_update"]!.execute(
      { status: "blocked", blocker: "Login needed" },
      ctx(deps, { goalTurn: 7 }),
    ),
  ).toEqual({ output: { status: "still_active", remaining: 2 } });
  expect(seen).toEqual([{ status: "blocked", blocker: "Login needed", runId: "run-1", turn: 7 }]);
  await expect(manifest["goal_update"]!.execute({ status: "completed" }, ctx(deps))).rejects.toThrow();
  await expect(
    manifest["goal_update"]!.execute({ status: "paused", budget: { maxTokens: 99 } }, ctx(deps)),
  ).rejects.toThrow();
  await expect(manifest["goal_update"]!.execute({ status: "paused" }, ctx({}))).rejects.toThrow(
    /not available/,
  );
});

describe("governed coding manifest", () => {
  it("forwards ranged reads and versioned writes to the shared governed boundary", async () => {
    const calls: unknown[] = [];
    const deps: LoopToolDeps = {
      codingTool: async (name, input, context) => {
        calls.push({ name, input, toolCallId: context.toolCallId });
        return { output: { accepted: true } };
      },
    };
    await manifest.read_file!.execute(
      { path: "/project/a.ts", startLine: 4, endLine: 8 },
      ctx(deps, { toolCallId: "read-1" }),
    );
    await manifest.edit_file!.execute(
      { path: "/project/a.ts", oldText: "old", newText: "new", expectedVersion: "version" },
      ctx(deps, { toolCallId: "edit-1" }),
    );
    expect(calls).toEqual([
      { name: "read_file", input: { path: "/project/a.ts", startLine: 4, endLine: 8 }, toolCallId: "read-1" },
      {
        name: "edit_file",
        input: { path: "/project/a.ts", oldText: "old", newText: "new", expectedVersion: "version" },
        toolCallId: "edit-1",
      },
    ]);
    await expect(
      manifest.edit_file!.execute({ path: "/project/a.ts", oldText: "old", newText: "new" }, ctx(deps)),
    ).rejects.toThrow();
    await expect(manifest.read_file!.execute({ path: "/project/a.ts" }, ctx({}))).rejects.toThrow(
      /unavailable/,
    );
  });
});

describe("S5 manifest — bash / history / memory (06-X)", () => {
  it("bash forwards to the seatbelt dep and parks transparently", async () => {
    const park = { park: { kind: "action-confirmation" as const, instruction: "approve net?" } };
    const bash = async () => park;
    const out = await manifest["bash"]!.execute(
      { command: "echo hi", network: true },
      ctx({ bash: bash as LoopToolDeps["bash"] }),
    );
    expect(out).toEqual(park);
    await expect(manifest["bash"]!.execute({ command: "ls" }, ctx({}))).rejects.toThrow(/not available/);
    await expect(manifest["bash"]!.execute({ command: "  " }, ctx({}))).rejects.toThrow();
  });

  it("history_search routes the query and schema-caps the limit", async () => {
    const seen: { query?: string; limit?: number } = {};
    const deps: LoopToolDeps = {
      historySearch: async (query, limit) => {
        seen.query = query;
        seen.limit = limit;
        return {
          mode: "semantic",
          message: "Local history matches.",
          entries: [{ url: "https://a.dev", title: "A", visitedAt: 1 }],
        };
      },
    };
    const out = (await manifest["history_search"]!.execute({ query: "a.dev", limit: 50 }, ctx(deps))) as {
      output: { entries: unknown[] };
    };
    expect(seen).toEqual({ query: "a.dev", limit: 50 });
    expect(out.output.entries).toHaveLength(1);
    await expect(
      manifest["history_search"]!.execute({ query: "a.dev", limit: 99 }, ctx(deps)),
    ).rejects.toThrow();
    await expect(manifest["history_search"]!.execute({ query: "x" }, ctx({}))).rejects.toThrow(
      /not available/,
    );
  });

  it("memory_search routes with run context", async () => {
    const seen: { query?: string; runId?: string } = {};
    const deps: LoopToolDeps = {
      memorySearch: async (query, c) => {
        seen.query = query;
        seen.runId = c.runId;
        return [{ title: "t", url: "https://a.dev", text: "snippet", capturedAt: 2 }];
      },
    };
    const out = (await manifest["memory_search"]!.execute({ query: "report" }, ctx(deps))) as {
      output: { memories: { capturedAt: number }[] };
    };
    expect(seen).toEqual({ query: "report", runId: "run-1" });
    expect(out.output.memories[0]!.capturedAt).toBe(2);
    await expect(manifest["memory_search"]!.execute({ query: "x" }, ctx({}))).rejects.toThrow(
      /not available/,
    );
  });
});

describe("S5 manifest — subagent cells (06-Y)", () => {
  it("subagent spawns, subagent_wait waits, send steers, stop cancels", async () => {
    const calls: string[] = [];
    const subagents: LoopToolDeps["subagents"] = {
      spawnCell: async (input) => {
        calls.push(`spawn:${input.goal}`);
        return { cellId: "cell-1" };
      },
      waitCell: async (cellId, ms) => {
        calls.push(`wait:${cellId}:${ms}`);
        return { state: "completed", result: { ok: 1 } };
      },
      sendCell: async (cellId, text) => {
        calls.push(`send:${cellId}:${text}`);
      },
      cancelCell: async (cellId) => {
        calls.push(`stop:${cellId}`);
      },
    };
    const c = ctx({ subagents });
    expect(await manifest["subagent"]!.execute({ goal: "find the invoice", profile: "explorer" }, c)).toEqual(
      { output: { cellId: "cell-1" } },
    );
    expect(await manifest["subagent_wait"]!.execute({ cellId: "cell-1", timeoutMs: 5000 }, c)).toEqual({
      output: { state: "completed", result: { ok: 1 } },
    });
    expect(
      await manifest["subagent_send"]!.execute({ cellId: "cell-1", message: "also check spam" }, c),
    ).toEqual({ output: { sent: "cell-1" } });
    expect(await manifest["subagent_stop"]!.execute({ cellId: "cell-1" }, c)).toEqual({
      output: { stopped: "cell-1" },
    });
    expect(calls).toEqual([
      "spawn:find the invoice",
      "wait:cell-1:5000",
      "send:cell-1:also check spam",
      "stop:cell-1",
    ]);
  });

  it("subagent tools fail honestly without a backend", async () => {
    const c = ctx({});
    await expect(manifest["subagent"]!.execute({ goal: "x" }, c)).rejects.toThrow(/unavailable/);
    await expect(manifest["subagent_wait"]!.execute({ cellId: "c" }, c)).rejects.toThrow(/unavailable/);
    await expect(manifest["subagent_send"]!.execute({ cellId: "c", message: "x" }, c)).rejects.toThrow(
      /unavailable/,
    );
    await expect(manifest["subagent_stop"]!.execute({ cellId: "c" }, c)).rejects.toThrow(/unavailable/);
  });
});

describe("S5 manifest — routine_update + notification (06-X)", () => {
  it("routine_update routes the patch and propagates a park", async () => {
    const seen: Record<string, unknown>[] = [];
    const park = {
      park: { kind: "action-confirmation" as const, instruction: "Confirm changing the routine?" },
    };
    const deps: LoopToolDeps = {
      routineUpdate: async (input) => {
        seen.push({ ...input });
        return park;
      },
    };
    const out = await manifest["routine_update"]!.execute(
      { routineId: "r1", trigger: { kind: "schedule" }, paused: true },
      ctx(deps),
    );
    expect(out).toEqual(park);
    expect(seen[0]).toMatchObject({ routineId: "r1", paused: true });
    await expect(
      manifest["routine_update"]!.execute({ routineId: "r1", title: "x" }, ctx({})),
    ).rejects.toThrow(/not available/);
  });

  it("notification posts to the dep and stays a no-dep no-op for hosts without notices", async () => {
    const seen: { text?: string; runId?: string } = {};
    const deps: LoopToolDeps = {
      notify: async ({ text }, c) => {
        seen.text = text;
        seen.runId = c.runId;
      },
    };
    expect(await manifest["notification"]!.execute({ text: "done soon" }, ctx(deps))).toEqual({
      output: { posted: true },
    });
    expect(seen).toEqual({ text: "done soon", runId: "run-1" });
    // No dep wired → still succeeds (a notice is best-effort).
    expect(await manifest["notification"]!.execute({ text: "hi" }, ctx({}))).toEqual({
      output: { posted: true },
    });
  });
});
