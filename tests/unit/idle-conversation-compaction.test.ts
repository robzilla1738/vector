import { afterEach, expect, it, vi } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AuxError, type Run } from "@aux/contracts";
import { FOUNDATION_MODEL_ID } from "@aux/contracts/native-foundation-models";
import { DEFAULT_UTILITY_MODEL_ID } from "@aux/contracts/model-registry";
import { openDb, Repo, EventBus, SettingsService, RunService, TranscriptStore } from "@aux/runtime";
import { PageService } from "../../apps/runtime/dist/services/pages.js";
import { SetService } from "../../apps/runtime/dist/services/sets.js";
import { ArtifactStore } from "../../apps/runtime/dist/services/artifacts.js";
import { DocumentSnapshots } from "../../apps/runtime/dist/services/document-snapshots.js";
import { NullNativeBridge } from "../../apps/runtime/dist/native.js";
import { BudgetsService } from "../../apps/runtime/dist/services/budgets.js";
import type { ModelClient } from "../../apps/runtime/dist/agent/model-client.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";
import {
  initialContextStats,
  boundedConversationReference,
  conversationReferenceParts,
} from "../../apps/runtime/dist/agent/loop/compaction.js";

const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of cleanup.splice(0).reverse()) await close();
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});
function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function fixture() {
  const dir = mkdtempSync(join(tmpdir(), "aux-idle-context-"));
  vi.stubEnv("AUX_SPEND_LEDGER_PATH", join(dir, "spend.sqlite"));
  const repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const settings = new SettingsService(repo, join(dir, "settings.json"), {});
  const turnMentions = fixtureTurnMentions((id) => repo.getPage(id));
  const pages = new PageService({
    repo,
    events,
    turnMentions,
    native: new NullNativeBridge(),
    drivers: () => ({ aux: null, chrome: null }),
  });
  const runs = new RunService({
    repo,
    events,
    settings,
    pages,
    turnMentions,
    sets: new SetService(repo, events, pages),
    documentSnapshots: new DocumentSnapshots(repo),
    artifacts: new ArtifactStore(dir, repo, events),
    budgets: new BudgetsService(repo.db, () => settings.budgetLimits(), budgetLineage(repo)),
    nativeAvailable: () => false,
  });
  const source: Run = {
    runId: "saved",
    goal: "Prepare the account A draft, never send it.",
    status: "completed",
    pageIds: [],
    createdAt: 1,
    config: { implementation: "agent-loop", chatId: "chat", modelId: DEFAULT_UTILITY_MODEL_ID },
    result: { report: "Draft prepared. Awaiting review." },
  };
  repo.saveRun(source);
  const transcript = new TranscriptStore(repo.db, repo.columnCipher);
  transcript.append(source.runId, [
    {
      role: "user",
      content: "Prepare the account A draft. Never send it. Quote https://example.test/source precisely.",
    },
    ...Array.from({ length: 30 }, (_, index) => ({
      role: "assistant" as const,
      content: `${index}: ${"Resolved historical reasoning. ".repeat(150)}`,
    })),
  ]);
  const original = JSON.stringify(transcript.entries(source.runId));
  let gate: ReturnType<typeof deferred> | undefined;
  let ownerLive = true;
  let fail = false;
  const entered = deferred();
  const calls = vi.fn();
  const transport: ModelClient = {
    async generateText(input) {
      await input.beforeDispatch?.();
      input.source?.checkOriginal?.();
      calls(input);
      entered.resolve();
      if (gate)
        await Promise.race([
          gate.promise,
          new Promise((_, reject) =>
            input.signal?.addEventListener("abort", () => reject(input.signal?.reason), { once: true }),
          ),
        ]);
      input.signal?.throwIfAborted();
      if (fail) throw new Error("Provider connection ended after dispatch.");
      return {
        text: "The account A draft is prepared but not sent. Exact source: https://example.test/source. Await review.",
        inputTokens: 124,
        outputTokens: 27,
        cachedInputTokens: 0,
        durationMs: 2,
        providerMetadata: { gateway: { cost: "0.001" } },
      };
    },
    async generateStructured() {
      throw new Error("Compaction must not call another agent or structured task producer.");
    },
    async listModels() {
      return [];
    },
  };
  const authorize = vi.fn(async () => {});
  const checkOwner = async () => {
    if (!ownerLive) throw new AuxError("permission_denied", "Original window retired.");
  };
  const admission = {
    route: {
      kind: "network" as const,
      model: transport,
      modelId: DEFAULT_UTILITY_MODEL_ID,
      provider: "gateway" as const,
      destination: "https://ai-gateway.vercel.sh",
    },
    nativeTurnContext: "actual-native-user-token",
    checkOwner,
    authorize,
  };
  cleanup.push(async () => {
    gate?.resolve();
    await runs.close();
    repo.close();
    rmSync(dir, { recursive: true, force: true });
  });
  const wait = async () => {
    await vi.waitFor(() =>
      expect(["completed", "failed", "cancelled"]).toContain(
        runs.contextStats(source.runId).compaction.status,
      ),
    );
  };
  return {
    repo,
    runs,
    settings,
    transcript,
    original,
    calls,
    admission,
    authorize,
    entered,
    wait,
    start: () => runs.compactIdleContext(source.runId, runs.contextStats(source.runId).revision, admission),
    hold: () => {
      gate = deferred();
      return gate;
    },
    retireOwner: () => {
      ownerLive = false;
    },
    fail: () => {
      fail = true;
    },
  };
}

it("compacts a completed chat through a real separately accounted operation without editing its transcript", async () => {
  const f = fixture();
  const queued = await f.start();
  expect(queued.compaction.status).toBe("queued");
  await f.wait();
  const stats = f.runs.contextStats("saved");
  expect(stats.compaction.status).toBe("completed");
  expect(stats.estimatedInputTokens).toBeLessThan(queued.estimatedInputTokens);
  expect(JSON.stringify(f.transcript.entries("saved"))).toBe(f.original);
  expect(f.repo.getRun("saved")?.status).toBe("completed");
  expect(f.repo.getRun("saved")?.result).toEqual({ report: "Draft prepared. Awaiting review." });
  const operations = f.repo.listRuns(20).filter((run) => run.config?.implementation === "utility-generation");
  expect(operations).toHaveLength(1);
  expect(operations[0]?.config?.contextRunIds).toEqual(["saved"]);
  expect(operations[0]?.config?.nativeTurnContext).toBe("actual-native-user-token");
  expect(
    f.calls.mock.calls.every(
      ([call]) => call.source.runId === operations[0]?.runId && call.maxAttempts === 1,
    ),
  ).toBe(true);
  expect(f.repo.listModelCalls(operations[0]!.runId).length).toBe(f.calls.mock.calls.length);
  expect(f.runs.context("chat").entries.map((entry) => entry.runId)).toEqual(["saved"]);
  const projection = f.repo.getRun("saved")!.config!.contextCompaction!.projection!;
  const reference = boundedConversationReference(
    [conversationReferenceParts(f.transcript.entries("saved"), projection)],
    6_000,
  );
  expect(reference).toContain("Never send it");
  expect(reference).toContain("https://example.test/source");
  expect(reference.length).toBeLessThanOrEqual(6_000);
});

it("joins the original idle request on Cancel and preserves its exact transcript and former projection", async () => {
  const f = fixture();
  f.hold();
  const queued = await f.start();
  await f.entered.promise;
  const cancelled = await f.runs.cancelIdleContextCompaction("saved", queued.compaction.id);
  expect(cancelled.compaction.status).toBe("cancelled");
  expect(f.repo.getRun("saved")?.config?.contextCompaction?.projection).toBeUndefined();
  expect(JSON.stringify(f.transcript.entries("saved"))).toBe(f.original);
});

it.each(["transcript", "model", "space", "owner", "todo", "new turn", "Forget"])(
  "rejects publication when %s changes during an idle summary",
  async (change) => {
    const f = fixture();
    const gate = f.hold();
    await f.start();
    await f.entered.promise;
    if (change === "transcript")
      f.transcript.append("saved", [{ role: "user", content: "Correction: account B." }]);
    if (change === "model")
      vi.spyOn(f.settings, "modelCacheGeneration").mockReturnValue("changed-model-account");
    if (change === "space") f.repo.setSetting("conversationWorkspace:chat", "different-space");
    if (change === "owner") f.retireOwner();
    if (change === "todo")
      f.repo.saveCheckpoint("run:saved", "loop_todos", { todos: ["Review a new requirement."] });
    if (change === "new turn")
      f.repo.saveRun({
        runId: "steering",
        goal: "New direction",
        status: "running",
        createdAt: 3,
        pageIds: [],
        config: { chatId: "chat" },
      });
    if (change === "Forget") {
      const run = f.repo.getRun("saved")!;
      run.config = { ...run.config, contextMemoryRevoked: true, contextCompaction: undefined };
      f.repo.saveRun(run);
    }
    gate.resolve();
    await vi.waitFor(() =>
      expect(
        f.repo
          .listRuns(20)
          .filter((run) => run.config?.implementation === "utility-generation")
          .every((run) => run.status !== "running"),
      ).toBe(true),
    );
    if (change !== "Forget") await f.wait();
    expect(f.repo.getRun("saved")?.config?.contextCompaction?.projection).toBeUndefined();
    expect(f.calls.mock.calls.length).toBe(1);
  },
);

it("records a provider failure against its real operation and does not invent a summary", async () => {
  const f = fixture();
  f.fail();
  await f.start();
  await f.wait();
  expect(f.runs.contextStats("saved").compaction.status).toBe("failed");
  expect(f.repo.getRun("saved")?.config?.contextCompaction?.projection).toBeUndefined();
  const operation = f.repo.listRuns(20).find((run) => run.config?.implementation === "utility-generation")!;
  expect(f.repo.listModelCalls(operation.runId)).toHaveLength(1);
});

it("refuses stale revisions, nonterminal turns and retired owners before model dispatch", async () => {
  const f = fixture();
  await expect(f.runs.compactIdleContext("saved", 99, f.admission)).rejects.toMatchObject({
    code: "conflict",
  });
  const run = f.repo.getRun("saved")!;
  f.repo.saveRun({ ...run, status: "needs_input" });
  await expect(f.start()).rejects.toMatchObject({ code: "conflict" });
  f.repo.saveRun(run);
  f.retireOwner();
  await expect(f.start()).rejects.toMatchObject({ code: "permission_denied" });
  expect(f.calls).not.toHaveBeenCalled();
});

it("refuses a history budget smaller than exact constraints rather than clipping them", async () => {
  const f = fixture();
  f.transcript.append("saved", [
    { role: "user", content: "Owner constraint: " + "Keep this exact constraint. ".repeat(300) },
  ]);
  await f.start();
  await f.wait();
  expect(f.runs.contextStats("saved").compaction.status).toBe("failed");
  expect(f.repo.getRun("saved")?.config?.contextCompaction?.projection).toBeUndefined();
  expect(f.transcript.load("saved").at(-1)?.content).toContain("Owner constraint");
});

it("carries the compacted reference into an actual next-turn admission and refuses later clipping", async () => {
  const f = fixture();
  await f.start();
  await f.wait();
  const start = vi
    .spyOn(f.runs.coordinator, "start")
    .mockRejectedValue(new AuxError("cancelled", "Captured admitted turn."));
  await expect(f.runs.start({ goal: "Continue with review", chatId: "chat", pageIds: [] })).rejects.toThrow(
    "Captured admitted turn",
  );
  const admitted = start.mock.calls[0]![0];
  expect(admitted.context).toContain("Historical summary");
  expect(admitted.context).toContain("Never send it");
  expect(admitted.contextRunIds).toContain("saved");
  start.mockClear();
  await expect(
    f.runs.start({
      goal: "Continue",
      chatId: "chat",
      pageIds: [],
      context: "Explicit current source. ".repeat(1_000),
    }),
  ).rejects.toThrow("cannot fit");
  expect(start).not.toHaveBeenCalled();
});

it("joins idle work on workspace Forget retirement and on runtime shutdown", async () => {
  const f = fixture();
  f.repo.setSetting("conversationWorkspace:chat", "workspace");
  f.repo.insertWorkspace("workspace", "Fixture workspace", 1);
  f.hold();
  await f.start();
  await f.entered.promise;
  await f.runs.retireWorkspaceCompactions("workspace");
  expect(f.runs.contextStats("saved").compaction.status).toBe("cancelled");
  expect(f.repo.getRun("saved")?.config?.contextCompaction?.projection).toBeUndefined();
  expect(
    f.repo
      .listRuns(20)
      .filter((run) => run.config?.implementation === "utility-generation")
      .every((run) => run.status !== "running"),
  ).toBe(true);
});

it("bounds summary chunks for a smaller on-device route independently of the conversation model", async () => {
  const f = fixture();
  await f.runs.compactIdleContext("saved", 0, {
    ...f.admission,
    route: {
      kind: "on-device",
      model: f.admission.route.model,
      modelId: FOUNDATION_MODEL_ID,
    },
  });
  await f.wait();
  expect(f.runs.contextStats("saved").compaction.status).toBe("completed");
  expect(f.calls.mock.calls.length).toBeGreaterThan(1);
  for (const [call] of f.calls.mock.calls) {
    expect(call.maxOutputTokens).toBeLessThanOrEqual(768);
    expect(Math.ceil(Buffer.byteLength(call.system + call.prompt) / 3) + call.maxOutputTokens).toBeLessThan(
      4_096,
    );
  }
});

it("preserves exact constraints when a provider change retires a completed projection", async () => {
  const f = fixture();
  await f.start();
  await f.wait();
  vi.spyOn(f.settings, "modelCacheGeneration").mockReturnValue("different-provider-account");
  const start = vi
    .spyOn(f.runs.coordinator, "start")
    .mockRejectedValue(new AuxError("cancelled", "Captured admitted turn."));
  await expect(f.runs.start({ goal: "Continue", chatId: "chat", pageIds: [] })).rejects.toThrow(
    "Captured admitted turn",
  );
  expect(start.mock.calls[0]?.[0].context).toContain("Never send it");
  expect(start.mock.calls[0]?.[0].context).not.toContain("Historical summary");
});

it("retires orphaned progress after recovery so completed chats can compact again", async () => {
  const f = fixture();
  const run = f.repo.getRun("saved")!;
  const stats = f.runs.contextStats("saved");
  run.config = {
    ...run.config,
    contextCompaction: {
      stats: {
        ...stats,
        revision: 4,
        compaction: { id: "retired-runtime-request", status: "summarizing", reason: "manual" },
      },
    },
  };
  f.repo.saveRun(run);
  expect(f.runs.contextStats("saved").compaction.status).toBe("cancelled");
  expect(f.calls).not.toHaveBeenCalled();
  await f.start();
  await f.wait();
  expect(f.runs.contextStats("saved").compaction.status).toBe("completed");
});

it("uses saved original schema bytes for idle compaction rather than the full optional catalog", async () => {
  const f = fixture();
  const run = f.repo.getRun("saved")!;
  run.config = {
    ...run.config,
    contextCompaction: {
      toolsBytes: 1234,
      stats: f.runs.contextStats(run.runId),
    },
  };
  f.repo.saveRun(run);
  await f.start();
  await f.wait();
  expect(f.repo.getRun(run.runId)?.config?.contextCompaction?.toolsBytes).toBe(1234);
});

it("estimates a historical profile using its original allowed tool schema without granting new integrations", async () => {
  const f = fixture();
  const run = f.repo.getRun("saved")!;
  run.config = {
    ...run.config,
    agentProfile: {
      name: "clock",
      prompt: "Use the clock.",
      tools: ["get_time"],
      workspace: "shared",
      packages: [],
    },
  };
  f.repo.saveRun(run);
  const { buildToolManifest } = await import("@aux/runtime");
  const { modelTools } = await import("../../apps/runtime/dist/agent/loop/loop.js");
  const { buildSystemPrompt } = await import("@aux/runtime");
  const expected = initialContextStats(run.runId, DEFAULT_UTILITY_MODEL_ID, f.transcript.load(run.runId), {
    system: buildSystemPrompt({
      hasPage: false,
      webEnabled: true,
      hasProject: false,
    }),
    toolsBytes: modelTools({ get_time: buildToolManifest().get_time! }).bytes,
    maxOutputTokens: 4000,
  });
  expect(f.runs.contextStats(run.runId).estimatedInputTokens).toBe(expected.estimatedInputTokens);
});
