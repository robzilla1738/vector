import { createHash } from "node:crypto";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import {
  AgentConnectionService,
  EventBus,
  ExternalSessionService,
  Repo,
  SettingsService,
  TaskService,
  openDb,
} from "@aux/runtime";
import { RunService } from "../../apps/runtime/src/services/runs.js";
import { BudgetsService } from "../../apps/runtime/src/services/budgets.js";
import { ArtifactStore } from "../../apps/runtime/src/services/artifacts.js";
import { PageService } from "../../apps/runtime/src/services/pages.js";
import { SetService } from "../../apps/runtime/src/services/sets.js";
import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { NullNativeBridge } from "../../apps/runtime/src/native.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { budgetLineage } from "../fixtures/budget-lineage.js";
import type { ChannelAudioInput } from "../../apps/runtime/src/services/audio-transcription.js";

const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
async function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "aux-voice-run-")),
    repo = new Repo(openDb(":memory:")),
    events = new EventBus(repo);
  vi.stubEnv("AUX_SPEND_LEDGER_PATH", join(directory, "spend.sqlite"));
  vi.stubEnv("AUX_PROGRAM_SPEND_CAP_USD", "1");
  const settings = new SettingsService(repo, join(directory, "settings.json"), {
    AI_GATEWAY_API_KEY: "fixture-key",
  });
  await settings.set({ transcriptionModel: "openai/whisper-1" });
  const network = vi.fn<typeof fetch>().mockImplementation(async (url) =>
    String(url).endsWith("/models")
      ? Response.json({
          data: [
            {
              id: "openai/whisper-1",
              type: "transcription",
              supported_specifications: ["v4"],
              pricing: { transcription_duration_cost_per_second: ".0001" },
            },
          ],
        })
      : Response.json({
          text: "synthetic voice",
          segments: [],
          language: "en",
          warnings: [],
          providerMetadata: { gateway: { cost: 0 } },
        }),
  );
  vi.stubGlobal("fetch", network);
  const mentions = fixtureTurnMentions((id) => repo.getPage(id)),
    native = new NullNativeBridge();
  const pages = new PageService({
    repo,
    events,
    turnMentions: mentions,
    native,
    drivers: () => ({ aux: null, chrome: null }),
  });
  const snapshots = new DocumentSnapshots(repo);
  const runs = new RunService({
    repo,
    events,
    pages,
    settings,
    turnMentions: mentions,
    nativeAvailable: () => false,
    sets: new SetService(repo, events, pages),
    artifacts: new ArtifactStore(join(directory, "artifacts"), repo, events),
    documentSnapshots: snapshots,
    budgets: new BudgetsService(repo.db, () => settings.budgetLimits(), budgetLineage(repo)),
  });
  const tasks = new TaskService(repo, events),
    workspace = tasks.createWorkspace("Voice fixture");
  const task = tasks.create({
    workspaceId: workspace.workspaceId,
    title: "Voice",
    objective: "Read audio",
    criteria: [{ criterionId: "voice", description: "Read", verification: "manual" }],
  });
  const connection = new AgentConnectionService(repo).create({
    name: "Voice peer",
    client: "telegram",
    scope: { kind: "task", workspaceId: workspace.workspaceId, taskId: task.taskId },
  }).connection;
  const sessions = new ExternalSessionService(repo, events, mentions, async (_connectionId, runId) =>
    runs.retireExternalUtilityOperations(runId),
  );
  const runId = sessions.ensure({ connectionId: connection.connectionId, scope: connection.scope })!;
  closes.push(async () => {
    await runs.close();
    await snapshots.close();
    await settings.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  const bytes = Uint8Array.from(Buffer.from("RIFF1234WAVE-audio-fixture")),
    sha256 = createHash("sha256").update(bytes).digest("hex");
  const input: ChannelAudioInput = {
    runId,
    bytes,
    sha256,
    mediaType: "audio/wav",
    signal: new AbortController().signal,
    source: {
      connectionId: "channel",
      connectionRevision: "revision",
      peerKey: "peer",
      messageKey: "message",
      attachmentKey: "attachment",
      provider: "telegram",
      conversationId: "conversation",
    },
    beforeDispatch: vi.fn(async () => {}),
    recordReceipt: vi.fn(async () => {}),
    checkCurrent: () => {},
  };
  const authorize = vi.fn(async () => {}),
    inspectAudio = vi.fn(async () => ({
      sourceSha256: sha256,
      mediaType: "audio/wav",
      decodedFrames: 48000,
      sampleRate: 48000,
      channels: 1,
      durationSeconds: 1,
      complete: true as const,
    }));
  const transcribe = () =>
    runs.externalUtilitySession(runId, input.checkCurrent, (signal) =>
      runs.transcribeChannelAudio({
        ...input,
        signal: AbortSignal.any([signal, input.signal]),
        inspectAudio,
        authorize,
      }),
    );
  return { runs, repo, input, network, authorize, inspectAudio, transcribe };
}
it("funds and settles one original channel audio call with observed zero and unknown tokens", async () => {
  const f = await fixture();
  expect(await f.transcribe()).toMatchObject({ text: "synthetic voice", costUsd: 0, costEstimated: false });
  const calls = f.repo.listModelCalls(f.input.runId);
  expect(calls).toHaveLength(1);
  expect(calls[0]).toMatchObject({ costUsd: 0, costEstimated: false, modelId: "openai/whisper-1" });
  expect(calls[0]!.inputTokens).toBeUndefined();
  expect(calls[0]!.outputTokens).toBeUndefined();
  expect(f.input.beforeDispatch).toHaveBeenCalledOnce();
  expect(f.input.recordReceipt).toHaveBeenCalledWith(
    expect.objectContaining({ dispatched: true, costUsd: 0 }),
  );
  expect(f.authorize).toHaveBeenCalledTimes(2);
  expect(f.runs.coordinator.controls.has(f.input.runId)).toBe(false);
});
it("joins the original dispatched request and settles its uncertainty when the external session retires", async () => {
  const f = await fixture();
  f.network.mockImplementation(async (url, init) => {
    if (String(url).endsWith("/models"))
      return Response.json({
        data: [
          {
            id: "openai/whisper-1",
            type: "transcription",
            supported_specifications: ["v4"],
            pricing: { transcription_duration_cost_per_second: ".0001" },
          },
        ],
      });
    return new Promise<Response>((_resolve, reject) =>
      init!.signal!.addEventListener("abort", () => reject(new Error("aborted original fetch")), {
        once: true,
      }),
    );
  });
  const pending = f.transcribe();
  const rejected = pending.catch((error: unknown) => error);
  await vi.waitFor(() => expect(f.input.beforeDispatch).toHaveBeenCalledOnce());
  await f.runs.retireExternalUtilityOperations(f.input.runId);
  expect(await rejected).toBeInstanceOf(Error);
  expect(f.input.recordReceipt).toHaveBeenCalledWith(
    expect.objectContaining({ dispatched: true, costEstimated: true }),
  );
  expect(f.repo.listModelCalls(f.input.runId)).toHaveLength(1);
  expect(f.repo.listModelCalls(f.input.runId)[0]).toMatchObject({ costEstimated: true });
  expect(f.repo.listModelCalls(f.input.runId)[0]!.costUsd).toBeUndefined();
});
