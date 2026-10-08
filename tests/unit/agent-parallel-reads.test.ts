import { afterEach, expect, it, vi } from "vitest";
import { AuxError } from "@aux/contracts";
import {
  MockModelClient,
  TranscriptStore,
  buildToolManifest,
  openDb,
  resumeAgentLoop,
  runAgentLoop,
  type AgentLoopOptions,
  type LoopToolDeps,
  type ModelMessage,
} from "@aux/runtime";

const cleanup: (() => void)[] = [];
afterEach(() =>
  cleanup
    .splice(0)
    .reverse()
    .forEach((close) => close()),
);

function fixture(deps: LoopToolDeps, calls: MockModelClient["toolSteps"][number]["toolCalls"]) {
  const db = openDb(":memory:");
  cleanup.push(() => db.close());
  const transcript = new TranscriptStore(db);
  transcript.append("run", [{ role: "user", content: "Research these sources." }]);
  const model = new MockModelClient().scriptToolSteps([{ toolCalls: calls }, { text: "Done" }]);
  const options: AgentLoopOptions = {
    model,
    modelId: "mock",
    tools: buildToolManifest(),
    transcript,
    runId: "run",
    threadId: "chat",
    pageId: "page",
    deps,
  };
  return { options, transcript, model };
}

const fetchCall = (id: number) => ({
  toolCallId: `read-${id}`,
  toolName: "webfetch",
  input: { url: `https://example.com/${id}` },
});
const effect = {
  toolCallId: "effect",
  toolName: "act",
  input: { steps: [{ id: "click", op: "click", target: "r1" }] },
};
function toolResults(messages: ModelMessage[]) {
  return messages
    .flatMap((message) => (message.role === "tool" ? message.content : []))
    .filter((part) => part.type === "tool-result");
}

it("prepares bounded read batches in order, joins them before effects, and persists provider order", async () => {
  const trace: string[] = [];
  const releases = new Map<string, () => void>();
  let active = 0;
  let peak = 0;
  const { options, transcript } = fixture(
    {
      prepareWebFetch: async (url) => {
        const id = url.split("/").at(-1)!;
        trace.push(`prepare-${id}`);
        return {
          execute: async () => {
            trace.push(`start-${id}`);
            peak = Math.max(peak, ++active);
            await new Promise<void>((resolve) => releases.set(id, resolve));
            active--;
            trace.push(`end-${id}`);
            return { output: { url } };
          },
        };
      },
      act: async () => {
        expect(active).toBe(0);
        trace.push("effect");
        return { output: { done: true } };
      },
    },
    [...Array.from({ length: 6 }, (_, id) => fetchCall(id)), effect],
  );
  options.beforeToolCall = async (call) => {
    trace.push(`admit-${call.toolCallId}`);
  };
  const running = runAgentLoop(options);
  await vi.waitFor(() => expect(releases.size).toBe(4));
  expect(trace.slice(0, 8)).toEqual(
    Array.from({ length: 4 }, (_, id) => [`admit-read-${id}`, `prepare-${id}`]).flat(),
  );
  expect(trace).not.toContain("prepare-4");
  for (const id of [3, 2, 1, 0]) releases.get(String(id))!();
  await vi.waitFor(() => expect(releases.size).toBe(6));
  expect(trace).not.toContain("effect");
  releases.get("5")!();
  releases.get("4")!();
  await expect(running).resolves.toMatchObject({ kind: "done" });
  expect(peak).toBe(4);
  expect(trace.at(-1)).toBe("effect");
  expect(toolResults(transcript.load("run")).map((part) => part.toolCallId)).toEqual([
    "read-0",
    "read-1",
    "read-2",
    "read-3",
    "read-4",
    "read-5",
    "effect",
  ]);
});

it("parks during ordered preparation without dispatching the batch or later effects, then resumes exactly once", async () => {
  const execute = vi.fn(async () => ({ output: { read: true } }));
  const act = vi.fn(async () => ({ output: { done: true } }));
  const webFetch = vi.fn(async () => ({ output: { read: "approved" } }));
  const { options, transcript } = fixture(
    {
      prepareWebFetch: async (url) =>
        url.endsWith("/1")
          ? { park: { kind: "approval", approvalId: "review", instruction: "Review this read" } }
          : { execute },
      webFetch,
      act,
    },
    [fetchCall(0), fetchCall(1), fetchCall(2), effect],
  );
  await expect(runAgentLoop(options)).resolves.toMatchObject({ kind: "parked", toolCallId: "read-1" });
  expect(execute).not.toHaveBeenCalled();
  expect(act).not.toHaveBeenCalled();
  expect(transcript.openPark("run")?.pendingResults).toMatchObject([
    { toolCallId: "read-0", output: { interrupted: true } },
    { toolCallId: "read-1", parked: true },
    { toolCallId: "read-2", output: { interrupted: true } },
    { toolCallId: "effect", output: { interrupted: true } },
  ]);
  await expect(resumeAgentLoop(options, { accepted: true })).resolves.toMatchObject({ kind: "done" });
  expect(webFetch).toHaveBeenCalledExactlyOnceWith(
    "https://example.com/1",
    expect.objectContaining({ runId: "run" }),
  );
  expect(act).not.toHaveBeenCalled();
});

it.each(["stop", "failure"] as const)(
  "joins and records cancelled reads after %s without launching queued reads or effects",
  async (reason) => {
    const controller = new AbortController();
    const signals: AbortSignal[] = [];
    const failures: ((error: Error) => void)[] = [];
    const act = vi.fn(async () => ({ output: { done: true } }));
    const { options, transcript } = fixture(
      {
        prepareWebFetch: async (_url, ctx) => ({
          execute: async () => {
            const signal = ctx.signal!;
            signals.push(signal);
            await new Promise<void>((resolve, reject) => {
              failures.push(reject);
              signal.addEventListener("abort", () => reject(signal.reason), { once: true });
            });
            return { output: { unexpected: true } };
          },
        }),
        act,
      },
      [...Array.from({ length: 5 }, (_, id) => fetchCall(id)), effect],
    );
    options.signal = controller.signal;
    const running = runAgentLoop(options);
    await vi.waitFor(() => expect(signals).toHaveLength(4));
    const error = new AuxError("cancelled", "Read retired");
    if (reason === "stop") controller.abort(error);
    else failures[0]!(error);
    await expect(running).resolves.toMatchObject({ kind: reason === "stop" ? "failed" : "done" });
    expect(signals.every((signal) => signal.aborted)).toBe(true);
    expect(signals).toHaveLength(4);
    expect(act).not.toHaveBeenCalled();
    const results = toolResults(transcript.load("run"));
    expect(results.map((part) => part.toolCallId)).toEqual([
      "read-0",
      "read-1",
      "read-2",
      "read-3",
      "read-4",
      "effect",
    ]);
    expect(results.at(-1)).toMatchObject({ output: { value: { interrupted: true } } });
  },
);

it("keeps page observations and unprepared web reads ordered", async () => {
  const trace: string[] = [];
  const { options } = fixture(
    {
      webFetch: async (_url, ctx) => {
        expect(ctx.signal).toBe(options.signal);
        trace.push("fetch");
        return { output: { text: "source" } };
      },
      observe: async () => {
        trace.push("snapshot");
        return { text: "page", observationId: "obs", revision: 1 };
      },
      act: async () => {
        trace.push("act");
        return { output: {} };
      },
    },
    [fetchCall(0), { toolCallId: "snapshot", toolName: "snapshot", input: {} }, effect],
  );
  options.signal = new AbortController().signal;
  await runAgentLoop(options);
  expect(trace).toEqual(["fetch", "snapshot", "act"]);
});
