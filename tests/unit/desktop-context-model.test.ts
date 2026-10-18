import { sanitizePortablePageRecall } from "@aux/contracts/portable-page-recall";
import { AnswerDeltaEmitter } from "../../apps/runtime/dist/agent/answer-delta.js";
import { randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it, vi } from "vitest";
import { AuxError, type Run } from "@aux/contracts";
import { digest } from "@aux/contracts/util/digest";
import {
  desktopContextDefaults,
  type DesktopContextCapture,
  type DesktopContextNativeStatus,
  type DesktopContextSettings,
} from "@aux/contracts/desktop-context";
import type { TurnSourceContext } from "@aux/contracts/turn-source-context";
import { Repo, openDb, EventBus, TranscriptStore, runAgentLoop } from "@aux/runtime";
import { DesktopContextStore } from "../../apps/runtime/dist/services/desktop-context-store.js";
import { DesktopContextService } from "../../apps/runtime/dist/services/desktop-context.js";
import {
  DesktopContextRunSources,
  desktopRunQuotes,
} from "../../apps/runtime/dist/services/desktop-context-run-sources.js";
import { retireDesktopContextOutputs } from "../../apps/runtime/dist/services/desktop-context-retirement.js";
import { ArtifactStore } from "../../apps/runtime/dist/services/artifacts.js";
import { ConversationDocuments } from "../../apps/runtime/dist/services/conversation-documents.js";
import { DocumentSnapshots } from "../../apps/runtime/dist/services/document-snapshots.js";
import { ConversationBranches } from "../../apps/runtime/dist/services/conversation-branches.js";
import { initializeFieldCodec } from "../../apps/runtime/dist/store/field-codec.js";
import { buildToolManifest } from "../../apps/runtime/dist/agent/loop/tools.js";
import { profileSecrets } from "../support/profile-secrets.js";
const closes: (() => Promise<void>)[] = [];
afterEach(async () => {
  for (const close of closes.splice(0)) await close();
});
async function fixture() {
  const db = openDb(":memory:"),
    secrets = profileSecrets("desktop-model"),
    repo = new Repo(db, await initializeFieldCodec(db, secrets.native, "desktop-model")),
    events = new EventBus(repo),
    directory = mkdtempSync(join(tmpdir(), "aux-desktop-model-")),
    artifacts = new ArtifactStore(directory, repo, events),
    documentsStore = new DocumentSnapshots(repo),
    documents = new ConversationDocuments(repo, documentsStore),
    store = new DesktopContextStore(repo, secrets.native, "desktop-model");
  let settings: DesktopContextSettings = desktopContextDefaults(),
    now = Date.now(),
    privateProfile = false;
  let status: DesktopContextNativeStatus = {
    supported: true,
    phase: "off",
    accessibilityTrusted: true,
    ocrSupported: true,
    pickerGrantActive: false,
    leaseId: null,
    configurationRevision: 0,
    consentRevision: 0,
    dropped: 0,
    reason: "none",
  };
  let window: TurnSourceContext = {
    windowId: "original-window",
    activePageId: null,
    revision: 0,
    layout: {
      shared: {
        spaces: [{ id: "browser-space", name: "Synthetic", color: "blue", grain: 0, workspaceId: "space" }],
        archivedSpaces: [],
        pins: {},
        folders: [],
        tabSpace: {},
        order: [],
        tabFolder: {},
        tabNames: {},
        splitGroups: [],
      },
      window: { activeSpaceId: "browser-space", activeTabs: {}, splitRatio: 0.5 },
    },
  };
  const native = {
    status: vi.fn(async () => ({ ...status })),
    apps: async () => [],
    configure: vi.fn(async (value: DesktopContextSettings) => {
      status = {
        ...status,
        phase: !value.enabled ? "off" : value.paused ? "paused" : "running",
        configurationRevision: value.revision,
        leaseId: value.enabled && !value.paused ? "lease" : null,
      };
      return { ...status };
    }),
    attach: async () => {
      status = { ...status, phase: "running", leaseId: "lease", configurationRevision: settings.revision };
      return { ...status };
    },
    permission: async () => ({ ...status }),
    take: async () => null,
    validate: async () => true,
    acknowledge: async () => {},
    stop: async () => {
      status = { ...status, phase: "off", leaseId: null };
    },
  };
  const cancellations: string[] = [],
    beforeRemoval = vi.fn(async (scope: Parameters<typeof retireDesktopContextOutputs>[1]) => {
      await retire(scope);
    });
  const service = new DesktopContextService({
    store,
    native,
    settings: () => settings,
    saveSettings: (value) => {
      settings = value;
    },
    workspaceEligible: (id) => id === "space",
    sourceEligible: (capture) => !capture.documentUrl?.includes("excluded"),
    beforeChange: async (scope) => {
      await retire(scope, true);
    },
    beforeRemoval,
    changed: () => {},
    now: () => now,
  });
  const protect = vi.fn(),
    readWindow = vi.fn(async (_token: string) => window);
  const sources = () =>
    new DesktopContextRunSources({ repo, service, privateProfile, turnSourceContext: readWindow, protect });
  const owner = { runId: "run", signal: new AbortController().signal, checkOwner: vi.fn() };
  const run: Run = {
    runId: "run",
    goal: "Find the workshop time; never send messages.",
    status: "running",
    pageIds: [],
    createdAt: 1,
    config: {
      implementation: "agent-loop",
      chatId: "chat",
      contextWorkspaceId: "space",
      nativeTurnContext: randomUUID(),
      instructions: "Keep the original account.",
    },
  };
  repo.saveRun(run);
  const retire = async (scope: Parameters<typeof retireDesktopContextOutputs>[1], cancelOnly = false) =>
    retireDesktopContextOutputs(
      {
        repo,
        events,
        artifacts,
        documents,
        cancel: async (id) => {
          cancellations.push(id);
          const run = repo.getRun(id)!;
          repo.saveRun({ ...run, status: "cancelled" });
        },
        retireCompactions: async () => {},
        cancelQueue: () => {},
        purgeBranches: () => new ConversationBranches(repo).purgeRevoked(),
      },
      scope,
      { cancelOnly },
    );
  const capture = async (text = "# Workshop\nMeet on Tuesday at 10am", bundleId = "test.editor") => {
    const capture: DesktopContextCapture = {
      captureId: randomUUID(),
      workspaceId: "space",
      leaseId: "lease",
      configurationRevision: settings.revision,
      sourceEpoch: "epoch",
      app: { bundleId, displayName: "Synthetic Editor" },
      processId: 123,
      windowId: "foreign-app-window",
      capturedAt: now,
      expiresAt: now + 14 * 86400000,
      kind: "accessibility",
      text,
      selection: "",
      windowTitle: "Workshop notes",
      sha256: digest(text + "\0"),
    };
    await store.append(capture, () => {});
    return capture;
  };
  const enable = async () =>
    service.configure(
      settings.revision,
      {
        ...settings,
        enabled: true,
        workspaceId: "space",
        selectedApps: [
          { bundleId: "test.editor", displayName: "Editor" },
          { bundleId: "test.notes", displayName: "Notes" },
        ],
      },
      "real-owner-token",
      async () => {},
    );
  closes.push(async () => {
    await service.shutdown();
    await documentsStore.close();
    repo.close();
    rmSync(directory, { recursive: true, force: true });
  });
  return {
    repo,
    db,
    events,
    artifacts,
    documents,
    store,
    service,
    sources,
    owner,
    run,
    capture,
    enable,
    protect,
    readWindow,
    native,
    beforeRemoval,
    cancellations,
    retire,
    settings: () => settings,
    status: (value: Partial<DesktopContextNativeStatus>) => {
      status = { ...status, ...value };
    },
    clock: (value: number) => {
      now = value;
    },
    window: (value: TurnSourceContext) => {
      window = value;
    },
    sourceWindow: () => window,
    privateProfile: (value: boolean) => {
      privateProfile = value;
    },
  };
}
it("requires separate capture consent and never enables capture by reading ordinary Memory", async () => {
  const f = await fixture();
  f.repo.setSetting("memoryEnabled", true);
  await expect(f.sources().search({ queries: ["workshop"], mode: "lexical" }, f.owner)).rejects.toMatchObject(
    { code: "permission_denied" },
  );
  expect(f.settings().enabled).toBe(false);
  expect(f.native.configure).not.toHaveBeenCalled();
});
it("stores only exact recipes, hydrates raw quotes at the provider boundary and registers their governed egress", async () => {
  const f = await fixture();
  await f.enable();
  const capture = await f.capture(),
    sources = f.sources();
  const result = await sources.search({ queries: ["workshop"], mode: "lexical" }, f.owner);
  expect(JSON.stringify(result)).not.toContain("Tuesday");
  expect(result.items).toHaveLength(1);
  const saved = f.repo.getRun("run")!.config!.desktopContextQuotes!;
  expect(saved).toHaveLength(1);
  expect(JSON.stringify(saved)).not.toContain("Tuesday");
  const messages = await sources.project([{ role: "user", content: f.run.goal }], 24000, f.owner);
  expect(JSON.stringify(messages)).toContain("Tuesday");
  expect(JSON.stringify(messages)).toContain(capture.captureId);
  expect(f.protect).toHaveBeenCalledWith("run", expect.stringContaining("Tuesday"));
  await expect(sources.validate(f.owner)).resolves.toBeUndefined();
});
it.each(["private", "external", "other-space", "closed-window"] as const)(
  "refuses %s source authority before quote admission",
  async (change) => {
    const f = await fixture();
    await f.enable();
    await f.capture();
    if (change === "private") f.privateProfile(true);
    if (change === "external")
      f.repo.saveRun({ ...f.run, config: { ...f.run.config, externalConnectionId: "external" } });
    if (change === "other-space") {
      const window = f.sourceWindow();
      f.window({
        ...window,
        layout: { ...window.layout!, window: { ...window.layout!.window, activeSpaceId: "other" } },
      });
    }
    if (change === "closed-window")
      f.readWindow.mockRejectedValue(new AuxError("ref_stale", "Original window gone"));
    await expect(f.sources().search({ queries: ["workshop"], mode: "lexical" }, f.owner)).rejects.toThrow();
    expect(f.repo.getRun("run")!.config!.desktopContextQuotes).toBeUndefined();
  },
);
it.each(["lock", "permission", "source-key", "expiry", "consent"] as const)(
  "rejects %s changes between tool delivery and model use",
  async (change) => {
    const f = await fixture();
    await f.enable();
    const capture = await f.capture(),
      sources = f.sources();
    await sources.search({ queries: ["workshop"], mode: "lexical" }, f.owner);
    if (change === "lock") f.status({ phase: "locked" });
    if (change === "permission") f.status({ accessibilityTrusted: false });
    if (change === "source-key")
      await f.store.remove(
        "space",
        () => true,
        async () => {},
      );
    if (change === "expiry") f.clock(capture.expiresAt);
    if (change === "consent") await f.service.pause(f.settings().revision, true, "owner", async () => {});
    await expect(sources.project([], 24000, f.owner)).rejects.toThrow();
    expect(f.protect).not.toHaveBeenCalled();
  },
);
it("does not require a historical app to remain foreground and preserves exact partial long-line quotes", async () => {
  const f = await fixture();
  await f.enable();
  await f.capture("A".repeat(2000) + " workshop Tuesday " + "Z".repeat(2000));
  const sources = f.sources();
  const result = await sources.search({ queries: ["workshop"], mode: "lexical", limit: 1 }, f.owner);
  expect(result.items[0]!.quote.startOffset).toBeGreaterThan(0);
  f.status({ reason: "not-foreground" });
  expect(JSON.stringify(await sources.project([], 24000, f.owner))).toContain("Tuesday");
});
it("bounds model input without silently clipping source quotes or accepting model-selected Spaces", async () => {
  const f = await fixture();
  await f.enable();
  const capture = await f.capture(),
    sources = f.sources();
  await sources.search({ queries: ["workshop"], mode: "lexical" }, f.owner);
  await expect(sources.project([], 20, f.owner)).rejects.toMatchObject({ code: "model_error" });
  const manifest = buildToolManifest();
  expect(() =>
    manifest.desktop_context_search!.inputSchema.parse({ queries: ["workshop"], workspaceId: "other" }),
  ).toThrow();
  const read = await sources.read(
    { captureId: capture.captureId, sha256: capture.sha256, startLine: 2, limitLines: 1 },
    f.owner,
  );
  expect(read.quote.startLine).toBe(2);
  expect(read.quote.endLine).toBe(2);
});
it("fences quoted context inherited by retries, branches, artifacts and real utility operations", async () => {
  const f = await fixture();
  await f.enable();
  await f.capture();
  const sources = f.sources();
  await sources.search({ queries: ["workshop"], mode: "lexical" }, f.owner);
  f.repo.saveRun({ ...f.run, runId: "child", config: { ...f.run.config, contextRunIds: ["run"] } });
  expect(desktopRunQuotes(f.repo, "child")).toHaveLength(1);
  await expect(sources.validate({ ...f.owner, runId: "child" })).resolves.toBeUndefined();
  f.status({ phase: "locked" });
  await expect(sources.validate({ ...f.owner, runId: "child" })).rejects.toMatchObject({
    code: "permission_denied",
  });
});
it("Forget retires dependent generated content while keeping authored requests, effects, undo and real invoices", async () => {
  const f = await fixture();
  await f.enable();
  const capture = await f.capture(),
    sources = f.sources();
  await sources.search({ queries: ["workshop"], mode: "lexical" }, f.owner);
  const transcript = new TranscriptStore(f.db, f.repo.columnCipher);
  transcript.append("run", [
    { role: "user", content: "Task: " + f.run.goal + "\n\nContext: derived Tuesday text" },
    { role: "assistant", content: "Tuesday generated response" },
    { role: "user", content: "Keep the draft unsent, please." },
  ]);
  f.repo.saveCheckpoint("run:run", "loop_context", { summary: "Tuesday generated summary" });
  f.repo.saveModelCall({
    callId: "invoice",
    runId: "run",
    role: "agent",
    modelId: "configured",
    durationMs: 10,
    inputTokens: 20,
    outputTokens: 5,
    costUsd: 0.1,
    costEstimated: false,
    createdAt: 1,
  });
  f.db
    .prepare("INSERT INTO action_intents VALUES(?,?,?,?,?,?,?,?,?,?)")
    .run("effect", "key", "run", "page", 1, null, null, "uncertain", 1, "preserve undo and reconciliation");
  f.repo.saveStep({
    stepId: "undo-step",
    runId: "run",
    pageId: "page",
    op: "fill",
    inputs: { ref: "field", value: "Owner-approved value" },
    startedAt: 1,
  });
  const output = f.artifacts.save({
    runId: "run",
    label: "response.txt",
    buffer: Buffer.from("Tuesday output"),
    mediaType: "text/plain",
  });
  const descendant: Run = {
    ...f.run,
    runId: "later",
    goal: "Authored later request",
    config: { ...f.run.config, contextRunIds: ["run"], context: "Tuesday inherited report" },
  };
  f.repo.saveRun(descendant);
  transcript.append("later", [
    { role: "user", content: "Task: Authored later request\n\nContext: Tuesday inherited report" },
    { role: "assistant", content: "Tuesday derived" },
  ]);
  await f.service.forget(
    "space",
    f.settings().revision,
    capture.app.bundleId,
    undefined,
    async () => {},
    "owner",
  );
  expect(f.cancellations).toEqual(expect.arrayContaining(["run", "later"]));
  expect(f.repo.getRun("run")!.config!.desktopContextQuotes).toBeUndefined();
  expect(f.repo.getRun("later")!.config!.contextMemoryRevoked).toBe(true);
  expect(JSON.stringify(transcript.load("run"))).not.toContain("Tuesday");
  expect(JSON.stringify(transcript.load("run"))).toContain("Keep the draft unsent");
  expect(JSON.stringify(transcript.load("later"))).not.toContain("Tuesday");
  expect(f.db.prepare("SELECT count(*) n FROM model_calls").get()).toEqual({ n: 1 });
  expect(f.db.prepare("SELECT status FROM action_intents WHERE id='effect'").get()).toEqual({
    status: "uncertain",
  });
  expect(existsSync(output.path)).toBe(false);
  expect(f.repo.loadCheckpoint("run:run", "loop_context")).toBeUndefined();
  expect(f.repo.getRun("run")!.goal).toBe(f.run.goal);
  sanitizePortablePageRecall(f.db, f.repo.columnCipher);
  expect(f.db.prepare("SELECT count(*) n FROM model_calls").get()).toEqual({ n: 1 });
  expect(f.db.prepare("SELECT op FROM steps WHERE step_id='undo-step'").get()).toEqual({ op: "fill" });
  expect(f.db.prepare("SELECT status FROM action_intents WHERE id='effect'").get()).toEqual({
    status: "uncertain",
  });
});
it("per-app retirement preserves unrelated captured context and does not erase history on pause", async () => {
  const f = await fixture();
  await f.enable();
  const editor = await f.capture(),
    notes = await f.capture("Notes Thursday", "test.notes"),
    sources = f.sources();
  await sources.read(
    { captureId: editor.captureId, sha256: editor.sha256, startLine: 1, limitLines: 2 },
    f.owner,
  );
  f.repo.saveRun({ ...f.run, runId: "notes" });
  await sources.read(
    { captureId: notes.captureId, sha256: notes.sha256, startLine: 1, limitLines: 1 },
    { ...f.owner, runId: "notes" },
  );
  await f.retire({ workspaceId: "space", appBundleIds: ["test.editor"] }, true);
  expect(f.repo.getRun("run")!.config!.contextMemoryRevoked).not.toBe(true);
  expect(f.repo.getRun("notes")!.status).toBe("running");
  await f.retire({ workspaceId: "space", appBundleIds: ["test.editor"] });
  expect(f.repo.getRun("notes")!.config!.contextMemoryRevoked).not.toBe(true);
});
it("invoices a dispatched response whose final source fence fails, without appending its content or replaying tools", async () => {
  const f = await fixture(),
    transcript = new TranscriptStore(f.db);
  transcript.append("model", [{ role: "user", content: "Authored request" }]);
  const invoice = vi.fn(),
    tool = vi.fn();
  const model = {
    toolCallStep: vi.fn(async () => ({
      message: { role: "assistant" as const, content: "Never publish this source-derived response" },
      toolCalls: [],
      text: "Never publish this source-derived response",
      finishReason: "stop" as const,
      durationMs: 10,
      inputTokens: 4,
      outputTokens: 3,
    })),
  };
  await expect(
    runAgentLoop({
      model,
      modelId: "configured",
      tools: {},
      transcript,
      runId: "model",
      threadId: "chat",
      deps: {},
      validateModelResponse: async () => {
        throw new AuxError("permission_denied", "Desktop source locked");
      },
      onStep: invoice,
      beforeToolCall: tool,
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(invoice).toHaveBeenCalledOnce();
  expect(model.toolCallStep).toHaveBeenCalledOnce();
  expect(tool).not.toHaveBeenCalled();
  expect(transcript.load("model")).toEqual([{ role: "user", content: "Authored request" }]);
});

it("holds source-derived live deltas until release and discards refused drafts even on final flush", () => {
  const emit = vi.fn(),
    answer = new AnswerDeltaEmitter({ emit }, "real-run", 0);
  answer.push("Previously admitted text");
  expect(emit).toHaveBeenCalledOnce();
  answer.hold();
  answer.push("Private source draft");
  answer.flush();
  expect(emit).toHaveBeenCalledOnce();
  answer.discard();
  answer.flush();
  expect(emit).toHaveBeenCalledOnce();
  answer.hold();
  answer.push("Source proof succeeded");
  answer.release();
  expect(emit).toHaveBeenCalledTimes(2);
  expect(emit.mock.calls[1]![1]).toMatchObject({ text: "Source proof succeeded" });
});

it("joins retirement fences before a pending native owner proof can record a late admission", async () => {
  const f = await fixture();
  await f.enable();
  await f.capture();
  const sources = f.sources();
  let enter!: () => void, release!: (value: TurnSourceContext) => void;
  const pending = new Promise<void>((resolve) => {
    enter = resolve;
  });
  f.readWindow
    .mockImplementationOnce(async () => f.sourceWindow())
    .mockImplementationOnce(() => {
      enter();
      return new Promise((resolve) => {
        release = resolve;
      });
    });
  const searching = sources.search({ queries: ["workshop"], mode: "lexical" }, f.owner),
    observed = searching.catch((error: unknown) => error);
  await pending;
  await f.service.forget("space", f.settings().revision, "test.editor", undefined, async () => {}, "owner");
  release(f.sourceWindow());
  await expect(observed).resolves.toBeInstanceOf(AuxError);
  expect(f.repo.getRun("run")!.config!.desktopContextQuotes).toBeUndefined();
});
it("withdraws a response that loses its source during accounting and keeps that actual invoice", async () => {
  const f = await fixture(),
    transcript = new TranscriptStore(f.db);
  transcript.append("model", [{ role: "user", content: "Original human constraint" }]);
  let valid = true;
  const invoice = vi.fn(async () => {
    valid = false;
    throw new AuxError("permission_denied", "Source retired while receipt settled");
  });
  const model = {
    toolCallStep: vi.fn(async () => ({
      message: { role: "assistant" as const, content: "Source-derived response" },
      toolCalls: [],
      text: "Source-derived response",
      finishReason: "stop" as const,
      durationMs: 10,
      inputTokens: 4,
      outputTokens: 3,
    })),
  };
  await expect(
    runAgentLoop({
      model,
      modelId: "configured",
      tools: {},
      transcript,
      runId: "model",
      threadId: "chat",
      deps: {},
      validateModelResponse: async () => {
        if (!valid) throw new AuxError("permission_denied", "Desktop source retired");
      },
      onStep: invoice,
    }),
  ).rejects.toMatchObject({ code: "permission_denied" });
  expect(invoice).toHaveBeenCalledOnce();
  expect(transcript.load("model")).toEqual([{ role: "user", content: "Original human constraint" }]);
});

it("keeps admitted source quotes valid while new captures append during response publication", async () => {
  const f = await fixture();
  await f.enable();
  const original = await f.capture(),
    sources = f.sources();
  await sources.read(
    { captureId: original.captureId, sha256: original.sha256, startLine: 1, limitLines: 10 },
    f.owner,
  );
  const version = f.repo.getRun("run")!.config!.desktopContextQuotes![0]!.version;
  // Append during the final asynchronous native status check, after exact bytes were read.
  const status = await f.native.status();
  f.native.status
    .mockImplementationOnce(async () => status)
    .mockImplementationOnce(async () => {
      await f.capture("New unrelated capture", "test.notes");
      return status;
    });
  await expect(sources.validate(f.owner)).resolves.toBeUndefined();
  expect(f.store.sourceVersion("space", original.captureId)).toBe(version);
  await expect(sources.project([{ role: "user", content: "Continue" }], 24000, f.owner)).resolves.toEqual(
    expect.arrayContaining([
      expect.objectContaining({ role: "user", content: expect.stringContaining("Tuesday") }),
    ]),
  );
  await f.service.forget("space", f.settings().revision, "test.editor", undefined, async () => {}, "owner");
  await expect(sources.validate(f.owner)).rejects.toBeInstanceOf(AuxError);
});
