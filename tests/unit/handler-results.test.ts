import { DocumentSnapshots } from "../../apps/runtime/src/services/document-snapshots.js";
import { fixtureTurnMentions } from "../fixtures/turn-mentions.js";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  ArtifactStore,
  EventBus,
  makeInvoker,
  openDb,
  OperationService,
  Repo,
  RunService,
  SetService,
  substituteParameters,
} from "@aux/runtime";
import type { PageService, Services, SettingsService } from "@aux/runtime";
import {
  MethodSchemas,
  ResultSchemas,
  RunsStartParams,
  type MethodName,
  type PageTarget,
  type Program,
} from "@aux/contracts";

/**
 * Handler results must parse against ResultSchemas — the contracts package
 * is the single source of truth clients (CLI, MCP, renderer) type against.
 * A representative set that runs without a browser: sets, runs, programs,
 * settings, history/bookmarks, workspace, describe.
 */

let dir: string;
let invoke: ReturnType<typeof makeInvoker>;
let repo: Repo;
let fixtureTarget: PageTarget;
let fixtureServices: Services;
const executed: { program: Program; ctx: unknown }[] = [];
const projectId = "11111111-1111-4111-8111-111111111111";

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "aux-handlers-"));
  repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const page = (fixtureTarget = {
    pageId: "p1",
    backend: "aux",
    targetId: "t1",
    url: "http://x.test/",
    title: "x",
    documentEpoch: 0,
    lastRevision: 0,
    viewStatus: "visible",
    controller: "none",
    controllerEpoch: 0,
    ownedByRuntime: false,
    createdAt: Date.now(),
    lastActiveAt: Date.now(),
  } as PageTarget);
  const pages = {
    list: () => [page],
    isRestoringTabs: false,
    recoveryTabs: () => [],
    restoredTabShown: () => true,
    get: (id: string) => {
      if (id !== "p1") throw new Error(`no page ${id}`);
      return page;
    },
    isAttached: () => true,
    livePageIds: () => ["p1"],
    activePageId: "p1",
    execute: async (program: Program, ctx: unknown) => {
      executed.push({ program, ctx });
      return { status: "completed" as const, steps: [], extracted: { fields: { done: true } } };
    },
    extract: async () => ({ pageId: "p1", documentEpoch: 0, revision: 1, fields: { title: "x" } }),
    waitFor: async () => ({ ok: true, timedOut: false, detail: "ready", status: "completed" }),
    console: async () => ({ lines: [{ level: "log", message: "hi", atMs: 1 }] }),
    dialog: async () => ({ action: "list" as const, dialogs: [], pending: null }),
    network: async () => [],
  } as unknown as PageService;
  const sets = new SetService(repo, events, pages);
  const settings = {
    agentPolicy: () => ({ agentMode: "ask" }),
    maxWorkers: () => 2,
    perOrigin: () => 2,
    maxModelCalls: () => 8,
    model: () => null,
    plannerModel: () => "m",
    recoveryModel: () => undefined,
    visionModel: () => undefined,
    all: () => ({ plannerModel: "m", maxWorkers: 2, dataDir: dir }),
    set: () => ({ ok: true as const }),
  } as unknown as SettingsService;
  const artifacts = new ArtifactStore(dir, repo, events);
  const turnMentions = fixtureTurnMentions((pageId) => pages.get(pageId));
  const documentSnapshots = new DocumentSnapshots(repo);
  const runs = new RunService({
    documentSnapshots,
    turnMentions,
    repo,
    events,
    pages,
    sets,
    settings,
    artifacts,
    nativeAvailable: () => false,
  });
  // Bookmark handlers use the native BookmarkModel; keep its fixture separate
  // from the runtime repository so tests exercise the current routing.
  const nativeBookmarks = new Map<
    string,
    { nodeId: string; url: string; title: string; createdAt: number; folderPath: string[] }
  >();
  const services: Services = {
    documentSnapshots,
    turnMentions,
    pages,
    sets,
    runs,
    artifacts,
    settings,
    events,
    repo,
    native: {
      available: () => true,
      bookmarksInvoke: async (method, raw) => {
        const params = raw as { url?: string; title?: string; folderPath?: string[] };
        switch (method) {
          case "bookmarks.list":
            return [...nativeBookmarks.values()];
          case "bookmarks.add": {
            nativeBookmarks.set(params.url!, {
              nodeId: String(nativeBookmarks.size + 1),
              url: params.url!,
              title: params.title ?? "",
              createdAt: Date.now(),
              folderPath: params.folderPath ?? [],
            });
            return { ok: true };
          }
          case "bookmarks.remove":
            nativeBookmarks.delete(params.url!);
            return { ok: true };
          default:
            throw new Error(`Unsupported native bookmark fixture method: ${method}`);
        }
      },
      // Schema boundary fixture has no registered native run family. The
      // actual stopped-family refusal is exercised by native-run-resume.
      egressCheckRunResume: async ({ runId }) => {
        if (runId !== "run_x") throw new Error("No native run fixture for this identity");
        return { accepted: true as const };
      },
      permissionRetire: async () => {
        throw new Error("This fixture does not support native permission retirement");
      },
      tabCommand: async () => ({ commandId: "", status: "applied" as const, catalogVersion: 0 }),
      focusPage: async () => ({ ok: true }),
      stopPage: async () => ({ ok: true }),
      acquireStage: async () => ({ ok: true }),
      releaseStage: async () => ({ ok: true }),
      findInPage: async () => ({ matches: 0 }),
      stopFind: async () => ({ ok: true }),
      setZoom: async () => ({ level: 0 }),
      setCookies: async () => ({ ok: true, count: 0 }),
      storeSecret: async () => ({ ok: true }),
      readSecret: async () => ({}),
    },
    drivers: () => ({ aux: null, chrome: null }),
    importCookies: async () => ({}),
    benchRun: async () => ({ reportPath: "" }),
  };
  services.operations = new OperationService({ repo, events, pages });
  fixtureServices = services;
  invoke = makeInvoker(services);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const call = async (method: MethodName, params: unknown = {}) => {
  const result = await invoke(method, params);
  const parsed = ResultSchemas[method].safeParse(result);
  expect(
    parsed.success,
    `${method}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3))}`,
  ).toBe(true);
  return result as never;
};

describe("handler results conform to ResultSchemas", () => {
  it("uses Profile browser preferences without persisting a second runtime copy", async () => {
    let selected = "https://search.example/?q=%s";
    let suggestions = false;
    let memoryMinutes: import("@aux/contracts").MemorySaverSettings["minutes"] = 30;
    const chromium = makeInvoker({
      ...fixtureServices,
      featureHost: "chromium-fork",
      featureProfileId: "regular-profile",
      native: {
        ...fixtureServices.native!,
        memorySaverGet: async () => ({ minutes: memoryMinutes, managed: false }),
        memorySaverSet: async (minutes) => ({ minutes: (memoryMinutes = minutes), managed: false }),
        searchEngineGet: async () => selected,
        searchEngineSet: async (template) => {
          selected = template;
          return true;
        },
        searchSuggestionsGet: async () => suggestions,
        searchSuggestionsSet: async (enabled) => {
          suggestions = enabled;
          return true;
        },
      },
    });
    const before = repo.getSetting("searchEngine");
    expect(await chromium("settings.get", {}, { external: false })).toMatchObject({
      searchEngine: selected,
      searchSuggestions: false,
    });
    await chromium("settings.set", { searchEngine: "https://other.example/?q=%s" }, { external: false });
    await chromium("settings.set", { searchSuggestions: true }, { external: false });
    await chromium("settings.set", { memorySaverMinutes: 15 }, { external: false });
    expect(await chromium("settings.get", {}, { external: false })).toMatchObject({
      searchEngine: "https://other.example/?q=%s",
      searchSuggestions: true,
      memorySaverMinutes: 15,
      memorySaverManaged: false,
    });
    expect(repo.getSetting("memorySaverMinutes")).toBeUndefined();
    expect(repo.getSetting("searchEngine")).toEqual(before);
    expect(repo.getSetting("searchSuggestions")).toBeUndefined();
  });
  it("reads private AI settings without requesting normal-only memory saver preferences", async () => {
    let memorySaverReads = 0;
    const chromium = makeInvoker({
      ...fixtureServices,
      featureHost: "chromium-fork",
      nativeIdentity: Promise.resolve({
        buildId: "private-fixture",
        sourceCommit: "a".repeat(40),
        methods: [],
        privateSession: { id: "b830f4d9-629c-40e1-93a4-f9e981c8a8d3" },
      }),
      settings: {
        ...fixtureServices.settings,
        all: () => ({ ...fixtureServices.settings.all(), memorySaverMinutes: 30 }),
      } as SettingsService,
      native: {
        ...fixtureServices.native!,
        memorySaverGet: async () => {
          memorySaverReads++;
          throw new Error("Memory saver requires a regular profile");
        },
        searchEngineGet: async () => "https://search.example/?q=%s",
        searchSuggestionsGet: async () => false,
      },
    });
    const settings = ResultSchemas["settings.get"].parse(
      await chromium("settings.get", {}, { external: false }),
    );
    expect(settings).toMatchObject({ plannerModel: "m", searchSuggestions: false });
    expect(settings.memorySaverMinutes).toBeUndefined();
    expect(settings.memorySaverManaged).toBeUndefined();
    expect(memorySaverReads).toBe(0);
    await chromium.dispose();
  });
  it("routes Chromium bookmarks to BookmarkModel and waits for a fresh native history projection", async () => {
    const chromiumRepo = new Repo(openDb(":memory:"));
    chromiumRepo.requireChromiumHistory();
    const calls: string[] = [];
    const chromium = makeInvoker({
      ...fixtureServices,
      repo: chromiumRepo,
      events: new EventBus(chromiumRepo),
      featureHost: "chromium-fork",
      featureProfileId: "regular-profile",
      native: {
        ...fixtureServices.native!,
        bookmarksInvoke: async (method: string) => {
          calls.push(method);
          if (method === "bookmarks.list")
            return [
              { nodeId: "7", url: "https://native.test/", title: "Native", createdAt: 1, folderPath: [] },
            ];
          if (method === "bookmarks.folders.list") return [];
          return { ok: true };
        },
      },
    });
    const localCount = chromiumRepo.listBookmarks().length;
    expect(await chromium("bookmarks.list", {}, { external: false })).toMatchObject([
      { nodeId: "7", url: "https://native.test/" },
    ]);
    await chromium(
      "bookmarks.add",
      { url: "https://new-native.test/", title: "Native save" },
      { external: false },
    );
    expect(calls).toEqual(["bookmarks.list", "bookmarks.add"]);
    expect(chromiumRepo.listBookmarks()).toHaveLength(localCount);
    expect(await chromium("history.list", { limit: 10 }, { external: false })).toEqual([]);
    await chromium(
      "history.projectSnapshot",
      {
        profileId: "regular-profile",
        sourceGeneration: "browser",
        sequence: 0,
        batchIndex: 0,
        complete: true,
        visits: [{ url: "https://native-history.test/", title: "Visit", visitedAt: 123 }],
      },
      { external: false },
    );
    expect(await chromium("history.list", { limit: 10 }, { external: false })).toMatchObject([
      { url: "https://native-history.test/" },
    ]);
  });
  it("returns account-scoped Calendar event provenance through conversation sources", async () => {
    repo.saveRun({
      runId: "calendar-source-turn",
      goal: "Meeting brief",
      status: "completed",
      pageIds: [],
      createdAt: 20,
      config: { chatId: "calendar-source-chat" },
    });
    repo.saveStep({
      stepId: "calendar-source-step",
      runId: "calendar-source-turn",
      op: "calendar.events.list",
      startedAt: 21,
      outcome: {
        stepId: "calendar-source-step",
        op: "calendar.events.list",
        status: "ok",
        startedAt: 21,
        durationMs: 2,
        extracted: {
          events: [
            {
              eventId: "event-1",
              title: "Meeting",
              start: "2026-09-25T10:00:00Z",
              end: "2026-09-25T11:00:00Z",
              url: "https://calendar.google.com/calendar/event?eid=one",
              source: {
                connectionId: "account-1",
                profileId: "profile-fixture",
                accountKey: "alice@example.test",
                fetchedAt: 22,
              },
            },
          ],
        },
      },
    });
    const result = (await invoke(
      "conversations.sources.get",
      { chatId: "calendar-source-chat" },
      { external: false },
    )) as { sources: { kind?: string; accountKey?: string }[] };
    expect(ResultSchemas["conversations.sources.get"].safeParse(result).success).toBe(true);
    expect(result.sources).toMatchObject([{ kind: "calendar", accountKey: "alice@example.test" }]);
    const external = (await invoke(
      "conversations.sources.get",
      { chatId: "calendar-source-chat" },
      { external: true },
    )) as { sources: unknown[] };
    expect(external.sources).toEqual([]);
  });

  it("keeps revisioned workspace memory desktop-managed", async () => {
    const workspace = (await invoke("workspaces.create", { name: "Memory workspace" })) as {
      workspaceId: string;
    };
    await expect(
      invoke("workspaces.memory.set", {
        workspaceId: workspace.workspaceId,
        expectedRevision: 0,
        content: "private workspace context",
      }),
    ).rejects.toThrow(/managed in Aux/i);
    const saved = (await invoke(
      "workspaces.memory.set",
      { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "shared workspace context" },
      { external: false },
    )) as { revision: number };
    expect(saved.revision).toBe(1);
    const read = (await invoke(
      "workspaces.memory.get",
      { workspaceId: workspace.workspaceId },
      { external: false },
    )) as { content: string };
    expect(read.content).toBe("shared workspace context");
  });

  it("stops pending transmission of browsing context when its source is forgotten", async () => {
    const workspace = (await invoke("workspaces.create", { name: "Forget source" })) as {
      workspaceId: string;
    };
    const other = (await invoke("workspaces.create", { name: "Other source" })) as { workspaceId: string };
    await invoke(
      "workspaces.memory.set",
      { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "", enabled: true },
      { external: false },
    );
    await invoke(
      "workspaces.browsingMemory.set",
      { workspaceId: workspace.workspaceId, policy: { enabled: true, retentionDays: 7 } },
      { external: false },
    );
    Object.assign(fixtureTarget, {
      url: "https://x.test/",
      windowId: "fixture-window",
      windowKind: "normal",
      workspaceId: workspace.workspaceId,
    });
    const recorded = (await invoke(
      "workspaces.browsingMemory.record",
      { workspaceId: workspace.workspaceId, pageId: "p1", expectedDocumentEpoch: 0 },
      { external: false },
    )) as { recorded: boolean };
    expect(recorded.recorded).toBe(true);
    const marker = "RECENT BROWSING IN THIS SPACE";
    repo.saveRun({
      runId: "forget-active",
      goal: "Use saved source",
      status: "paused",
      pageIds: ["p1"],
      createdAt: Date.now(),
      config: {
        contextWorkspaceId: workspace.workspaceId,
        contextBrowsingMemory: true,
        context: `${marker}\nhttps://x.test/`,
      },
    });
    repo.saveRun({
      runId: "forget-other",
      goal: "Other Space",
      status: "paused",
      pageIds: ["p1"],
      createdAt: Date.now() + 1,
      config: { contextWorkspaceId: other.workspaceId, context: marker },
    });
    await invoke(
      "workspaces.browsingMemory.forget",
      { workspaceId: workspace.workspaceId },
      { external: false },
    );
    expect(repo.getRun("forget-active")?.status).toBe("cancelled");
    expect(repo.getRun("forget-active")?.error).toMatch(/Workspace context changed/);
    expect(repo.getRun("forget-other")?.status).toBe("paused");
    expect(repo.getSetting(`browsingMemoryPages:${workspace.workspaceId}`)).toEqual([]);
    await invoke(
      "workspaces.browsingMemory.record",
      { workspaceId: workspace.workspaceId, pageId: "p1", expectedDocumentEpoch: 0 },
      { external: false },
    );
    repo.saveRun({
      runId: "exclude-active",
      goal: "Use saved source",
      status: "paused",
      pageIds: ["p1"],
      createdAt: Date.now() + 2,
      config: { contextWorkspaceId: workspace.workspaceId, contextBrowsingMemory: true, context: marker },
    });
    await invoke(
      "workspaces.memory.set",
      {
        workspaceId: workspace.workspaceId,
        expectedRevision: 1,
        content: "",
        excludedOrigins: ["https://x.test"],
      },
      { external: false },
    );
    expect(repo.getRun("exclude-active")?.status).toBe("cancelled");
    expect(repo.getSetting(`browsingMemoryPages:${workspace.workspaceId}`)).toEqual([]);
    expect(repo.getRun("forget-other")?.status).toBe("paused");
  });

  it("workspaces/tasks persist revisions and bind a run before execution", async () => {
    const workspace = (await call("workspaces.create", { name: "Test project" })) as { workspaceId: string };
    await call("workspaces.list");
    const task = (await call("tasks.create", {
      workspaceId: workspace.workspaceId,
      title: "Read page",
      objective: "Read the page heading",
      criteria: [
        { criterionId: "heading", description: "Heading cited from the page", verification: "browser" },
      ],
    })) as { taskId: string };
    await call("tasks.list", { workspaceId: workspace.workspaceId });
    await call("tasks.update", { taskId: task.taskId, expectedRevision: 1, title: "Inspect heading" });
    await invoke(
      "workspaces.memory.set",
      { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "Cite the exact heading once." },
      { external: false },
    );
    const run = (await call("tasks.start", {
      taskId: task.taskId,
      expectedRevision: 2,
      pageIds: ["p1"],
    })) as {
      runId: string;
      config: {
        taskId: string;
        taskRevision: number;
        chatId: string;
        context: string;
        instructions: string;
        contextWorkspaceId: string;
        contextWorkspaceRevision: number;
      };
    };
    expect(run.config.taskId).toBe(task.taskId);
    expect(run.config.taskRevision).toBe(2);
    expect(run.config.chatId).toBe(`task:${task.taskId}`);
    expect(run.config.contextWorkspaceId).toBe(workspace.workspaceId);
    expect(run.config.contextWorkspaceRevision).toBe(1);
    expect(repo.getRun(run.runId)?.config?.taskId).toBe(task.taskId);
    expect(run.config.instructions).toContain("Heading cited from the page");
    expect(run.config.instructions.match(/Cite the exact heading once\./g)).toHaveLength(1);
    expect(run.config.context ?? "").not.toContain("Cite the exact heading once.");
    await call("tasks.get", { taskId: task.taskId });
    await call("runs.cancel", { runId: run.runId });
    await call("tasks.archive", { taskId: task.taskId, expectedRevision: 2, archived: true });
  });
  it("sets.*", async () => {
    const set = await call("sets.create", {
      name: "s",
      source: "urls",
      urls: ["http://a.test/1", "http://b.test/2"],
    });
    await call("sets.get", { setId: (set as { setId: string }).setId });
    await call("sets.list");
    const { runId } = (await call("sets.map", {
      setId: (set as { setId: string }).setId,
      program: { steps: [{ id: "s1", op: "reload" }] },
      concurrency: 1,
    })) as { runId: string };
    for (
      let i = 0;
      i < 100 && !["completed", "failed", "partially_completed"].includes(repo.getRun(runId)!.status);
      i++
    )
      await new Promise((r) => setTimeout(r, 10));
    await call("sets.results", { setId: (set as { setId: string }).setId });
    await call("runs.get", { runId });
    expect(["completed", "failed", "partially_completed"]).toContain(repo.getRun(runId)!.status);
  });

  it("runs.* incl. modelCalls on runs.get and control results", async () => {
    repo.saveRun({ runId: "run_x", goal: "g", status: "running", pageIds: ["p1"], createdAt: Date.now() });
    repo.saveModelCall({
      callId: "model_x",
      runId: "run_x",
      role: "planner",
      modelId: "fixture/model",
      providerMetadata: { aux: { provider: "openai-compatible", destination: "http://127.0.0.1:9999" } },
      durationMs: 4,
      inputTokens: 3,
      outputTokens: 2,
      createdAt: Date.now(),
    });
    const got = (await call("runs.get", { runId: "run_x" })) as {
      modelCalls: number;
      usage: { modelIds: string[]; providers: string[]; destinations: string[]; costComplete: boolean };
    };
    expect(got).toMatchObject({
      modelCalls: 1,
      usage: {
        modelIds: ["fixture/model"],
        providers: ["openai-compatible"],
        destinations: ["http://127.0.0.1:9999"],
        costComplete: false,
      },
    });
    await call("runs.list", { limit: 10 });
    await call("runs.pause", { runId: "run_x" });
    await expect(invoke("runs.resume", { runId: "run_x" })).rejects.toMatchObject({ code: "conflict" });
    await call("runs.cancel", { runId: "run_x" });
    await call("runs.events", { sinceSeq: 0, limit: 50 });
    await call("events.since", { sinceSeq: 0, limit: 50 });
  });

  it("programs.* and programs.run applies {{param}} substitution", async () => {
    const saved = (await call("programs.save", {
      name: "greet",
      steps: [
        { id: "s1", op: "fill", target: "css:#q", value: "hello {{who}}" },
        { id: "s2", op: "navigate", url: "https://x.test/{{path}}" },
      ],
      parameters: ["who", "path"],
    })) as { programId: string };
    await call("programs.list");
    await call("programs.validate", { program: { pageId: "p1", steps: [{ id: "a", op: "reload" }] } });

    await expect(
      invoke("programs.run", { programId: saved.programId, pageId: "p1", parameters: { who: "x" } }),
    ).rejects.toMatchObject({
      code: "invalid_params",
      detail: { missing: ["path"] },
    });
    executed.length = 0;
    const { runId } = (await call("programs.run", {
      programId: saved.programId,
      pageId: "p1",
      parameters: { who: 'Ada "the" Lovelace', path: "a/b" },
    })) as { runId: string };
    for (let i = 0; i < 100 && !executed.length; i++) await new Promise((r) => setTimeout(r, 5));
    const steps = executed[0]!.program.steps!;
    expect((steps[0] as { value: string }).value).toBe('hello Ada "the" Lovelace');
    expect((steps[1] as { url: string }).url).toBe("https://x.test/a/b");
    for (let i = 0; i < 100 && repo.getRun(runId)!.status === "running"; i++)
      await new Promise((r) => setTimeout(r, 5));
    expect(repo.getRun(runId)!.status).toBe("completed");
    await call("programs.delete", { programId: saved.programId });
  });

  it("settings / history / bookmarks / downloads / sessions / workspace / describe", async () => {
    await call("settings.get");
    await call("settings.set", { maxWorkers: 3 });
    repo.addHistory("http://x.test/", "x", "p1");
    await call("history.list", { limit: 10 });
    await call("bookmarks.add", { url: "http://x.test/", title: "x" });
    expect(await call("bookmarks.list")).toEqual([
      expect.objectContaining({ url: "http://x.test/", title: "x" }),
    ]);
    expect(repo.listBookmarks()).toEqual([]);
    await call("bookmarks.remove", { url: "http://x.test/" });
    expect(await call("bookmarks.list")).toEqual([]);
    await call("downloads.list");
    await call("sessions.list");
    await call("workspace.get");
    const described = (await call("runtime.describe")) as { features: { checkpointResume: boolean } };
    expect(described.features.checkpointResume).toBe(false);
    await expect(invoke("history.clear", {})).rejects.toMatchObject({ code: "permission_denied" });
    const cleared = await invoke("history.clear", {}, { external: false });
    expect(ResultSchemas["history.clear"].parse(cleared)).toEqual({ ok: true, removed: 1 });
  });

  it("pages.extract / waitFor / console / dialog / network", async () => {
    await expect(call("pages.extract", { pageId: "p1", fields: ["title"] })).resolves.toBeDefined();
    await expect(
      call("pages.waitFor", { pageId: "p1", condition: { kind: "settled" } }),
    ).resolves.toBeDefined();
    await expect(call("pages.console", { pageId: "p1" })).resolves.toBeDefined();
    await expect(call("pages.dialog", { pageId: "p1" })).resolves.toBeDefined();
    await expect(call("pages.network", { pageId: "p1" })).resolves.toBeDefined();
  });

  it("enforces task-scoped external authority before dispatch and filters shared lists", async () => {
    const firstWorkspace = (await invoke("workspaces.create", { name: "Scoped" }, { external: false })) as {
      workspaceId: string;
    };
    const otherWorkspace = (await invoke("workspaces.create", { name: "Other" }, { external: false })) as {
      workspaceId: string;
    };
    const task = (await invoke(
      "tasks.create",
      {
        workspaceId: firstWorkspace.workspaceId,
        title: "Scoped page",
        objective: "Read the attached page",
        criteria: [{ criterionId: "read", description: "Read it", verification: "browser" }],
        resources: [
          { resourceId: "page", kind: "page", locator: "p1", label: "Fixture" },
          {
            resourceId: "repo",
            kind: "repository",
            projectId,
            locator: "/managed/checkout",
            label: "Fixture repo",
          },
        ],
      },
      { external: false },
    )) as { taskId: string; revision: number };
    const other = (await invoke(
      "tasks.create",
      {
        workspaceId: otherWorkspace.workspaceId,
        title: "Other task",
        objective: "Stay private",
        criteria: [{ criterionId: "private", description: "Stay private", verification: "manual" }],
      },
      { external: false },
    )) as { taskId: string };
    const client = {
      external: true,
      connectionId: "connection",
      scope: { kind: "task" as const, workspaceId: firstWorkspace.workspaceId, taskId: task.taskId },
    };
    expect(await invoke("workspaces.list", {}, client)).toEqual([
      expect.objectContaining({ workspaceId: firstWorkspace.workspaceId }),
    ]);
    expect(await invoke("tasks.list", { includeArchived: true, limit: 100 }, client)).toEqual([
      expect.objectContaining({ taskId: task.taskId }),
    ]);
    expect(await invoke("pages.list", {}, client)).toEqual([expect.objectContaining({ pageId: "p1" })]);
    const workspace = (await invoke("workspace.get", {}, client)) as {
      pages: PageTarget[];
      sets: unknown[];
      sessions: unknown[];
    };
    expect(workspace.pages.map((item) => item.pageId)).toEqual(["p1"]);
    expect(workspace.sets).toEqual([]);
    expect(workspace.sessions).toEqual([]);
    await expect(invoke("tasks.get", { taskId: other.taskId }, client)).rejects.toMatchObject({
      code: "permission_denied",
    });
    await expect(
      invoke("pages.open", { url: "https://outside.test", background: false, ownedByRuntime: false }, client),
    ).rejects.toMatchObject({ code: "invalid_params" });
    await expect(invoke("history.list", { limit: 10 }, client)).rejects.toMatchObject({
      code: "permission_denied",
    });
    await expect(invoke("workspaces.create", { name: "Expanded" }, client)).rejects.toMatchObject({
      code: "permission_denied",
    });
    await expect(
      invoke(
        "tasks.create",
        {
          workspaceId: firstWorkspace.workspaceId,
          title: "Escaped task",
          objective: "Create a new root",
          criteria: [{ criterionId: "root", description: "Root", verification: "manual" }],
        },
        client,
      ),
    ).rejects.toMatchObject({ code: "permission_denied" });
    const child = (await invoke(
      "tasks.create",
      {
        workspaceId: firstWorkspace.workspaceId,
        parentTaskId: task.taskId,
        title: "Scoped child",
        objective: "Handle one bounded part",
        criteria: [{ criterionId: "child", description: "Child done", verification: "manual" }],
      },
      client,
    )) as { taskId: string; parentTaskId?: string };
    expect(child.parentTaskId).toBe(task.taskId);
    const grandchild = (await invoke(
      "tasks.create",
      {
        workspaceId: firstWorkspace.workspaceId,
        parentTaskId: child.taskId,
        title: "Scoped grandchild",
        objective: "Handle a smaller part",
        criteria: [{ criterionId: "grandchild", description: "Grandchild done", verification: "manual" }],
      },
      client,
    )) as { taskId: string; parentTaskId?: string };
    expect(grandchild.parentTaskId).toBe(child.taskId);
    expect(
      (
        (await invoke("tasks.list", { includeArchived: true, limit: 100 }, client)) as { taskId: string }[]
      ).map((item) => item.taskId),
    ).toEqual(expect.arrayContaining([task.taskId, child.taskId, grandchild.taskId]));
    await expect(
      invoke(
        "tasks.create",
        {
          workspaceId: otherWorkspace.workspaceId,
          parentTaskId: other.taskId,
          title: "Foreign child",
          objective: "Escape",
          criteria: [{ criterionId: "escape", description: "Escape", verification: "manual" }],
        },
        client,
      ),
    ).rejects.toMatchObject({ code: "permission_denied" });
    await expect(
      invoke(
        "tasks.update",
        {
          taskId: task.taskId,
          expectedRevision: task.revision,
          resources: [{ resourceId: "expanded", kind: "page", locator: "outside", label: "Outside" }],
        },
        client,
      ),
    ).rejects.toMatchObject({ code: "permission_denied" });
  });
});

describe("generated result authority", () => {
  it("requires a scoped task for agent generation and validates desktop results", async () => {
    repo.saveRun({
      runId: "generated-run",
      goal: "Create an export",
      status: "completed",
      pageIds: [],
      config: { chatId: "generated-chat" },
      createdAt: Date.now(),
    });
    const params = {
      chatId: "generated-chat",
      filename: "report.csv",
      spec: {
        kind: "csv",
        table: {
          name: "Report",
          rows: [
            ["Name", "Value"],
            ["A", 1],
          ],
        },
      },
    };
    await expect(invoke("results.generate", params, { external: true })).rejects.toMatchObject({
      code: "permission_denied",
    });
    const saved = await invoke("results.generate", params, { external: false });
    expect(ResultSchemas["results.generate"].parse(saved)).toMatchObject({
      chatId: "generated-chat",
      filename: "report.csv",
      revision: 1,
    });
    const workspace = (await invoke(
      "workspaces.create",
      { name: "Generated exports" },
      { external: false },
    )) as { workspaceId: string };
    const task = (await invoke(
      "tasks.create",
      {
        workspaceId: workspace.workspaceId,
        title: "Export",
        objective: "Make a report",
        criteria: [{ criterionId: "file", description: "Create file", verification: "manual" }],
      },
      { external: false },
    )) as { taskId: string; revision: number };
    const taskChatId = `task:${task.taskId}`;
    repo.saveRun({
      runId: "task-generated-run",
      goal: "Make a report",
      status: "completed",
      pageIds: [],
      config: { chatId: taskChatId, taskId: task.taskId },
      createdAt: Date.now(),
    });
    const client = {
      external: true,
      scope: { kind: "task" as const, workspaceId: workspace.workspaceId, taskId: task.taskId },
    };
    await expect(
      invoke("results.generate", { ...params, taskId: task.taskId, expectedRevision: task.revision }, client),
    ).rejects.toMatchObject({ code: "permission_denied" });
    const authorized = await invoke(
      "results.generate",
      { ...params, chatId: taskChatId, taskId: task.taskId, expectedRevision: task.revision },
      client,
    );
    expect(ResultSchemas["results.generate"].parse(authorized)).toMatchObject({
      chatId: taskChatId,
      revision: 1,
    });
  });
});

describe("contracts drift fixes", () => {
  it("runs.start keeps context (max 20k) instead of stripping it", () => {
    const p = RunsStartParams.parse({ goal: "g", pageId: "p1", context: "earlier turns" });
    expect(p.context).toBe("earlier turns");
    expect(RunsStartParams.safeParse({ goal: "g", context: "x".repeat(20_001) }).success).toBe(false);
    expect(Object.keys(MethodSchemas)).toContain("runs.start");
  });

  it("substituteParameters escapes values and reports every missing name", () => {
    expect(substituteParameters('{"v":"{{a}}-{{ b }}"}', { a: "1", b: 'q"x' })).toBe('{"v":"1-q\\"x"}');
    expect(JSON.parse(substituteParameters('{"v":"{{a}}"}', { a: "line\nbreak" }))).toEqual({
      v: "line\nbreak",
    });
    expect(() => substituteParameters('{"v":"{{a}} {{b}}"}', {})).toThrow(/parameters: a, b/);
    expect(substituteParameters('{"v":"plain"}', { unused: "x" })).toBe('{"v":"plain"}');
  });
});
