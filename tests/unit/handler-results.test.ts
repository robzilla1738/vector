import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { ArtifactStore, EventBus, makeInvoker, openDb, OperationService, Repo, RunService, SetService, substituteParameters } from "@aux/runtime";
import type { PageService, Services, SettingsService } from "@aux/runtime";
import { MethodSchemas, ResultSchemas, RunsStartParams, type MethodName, type PageTarget, type Program } from "@aux/contracts";

/**
 * Handler results must parse against ResultSchemas — the contracts package
 * is the single source of truth clients (CLI, MCP, renderer) type against.
 * A representative set that runs without a browser: sets, runs, programs,
 * settings, history/bookmarks, workspace, describe.
 */

let dir: string;
let invoke: ReturnType<typeof makeInvoker>;
let repo: Repo;
let fixtureServices: Services;
const executed: { program: Program; ctx: unknown }[] = [];
const projectId='11111111-1111-4111-8111-111111111111';
const nativeProject={projectId,name:'fixture',sourcePath:'/source',path:'/managed/checkout',branch:'codex/aux-fixture',baseCommit:'a'.repeat(40),createdAt:1,state:'ready' as const};

beforeAll(() => {
  dir = mkdtempSync(join(tmpdir(), "aux-handlers-"));
  repo = new Repo(openDb(":memory:"));
  const events = new EventBus(repo);
  const page = {
    pageId: "p1", backend: "aux", targetId: "t1", url: "http://x.test/", title: "x",
    documentEpoch: 0, lastRevision: 0, viewStatus: "visible", controller: "none", controllerEpoch: 0,
    ownedByRuntime: false, createdAt: Date.now(), lastActiveAt: Date.now(),
  } as PageTarget;
  const pages = {
    list: () => [page],
    isRestoringTabs: false,
    recoveryTabs: () => [],
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
    maxWorkers: () => 2, perOrigin: () => 2, maxModelCalls: () => 8, model: () => null, plannerModel: () => "m",
    recoveryModel: () => undefined, visionModel: () => undefined,
    all: () => ({ plannerModel: "m", maxWorkers: 2, dataDir: dir }),
    set: () => ({ ok: true as const }),
  } as unknown as SettingsService;
  const artifacts = new ArtifactStore(dir, repo, events);
  const runs = new RunService({ repo, events, pages, sets, settings, artifacts, translateSteps: (_p, s) => s, nativeAvailable: () => false });
  const services: Services = {
    pages, sets, runs, artifacts, settings, events, repo,
    native:{available:()=>true,tabCommand:async()=>({commandId:"",status:"applied" as const,catalogVersion:0}),focusPage:async()=>({ok:true}),stopPage:async()=>({ok:true}),acquireStage:async()=>({ok:true}),releaseStage:async()=>({ok:true}),findInPage:async()=>({matches:0}),stopFind:async()=>({ok:true}),setZoom:async()=>({level:0}),setCookies:async()=>({ok:true,count:0}),storeSecret:async()=>({ok:true}),readSecret:async()=>({}),
      developmentProjects:async ids=>ids.includes(projectId)?[nativeProject]:[],inspectProject:async()=>({project:nativeProject,status:' M app.ts\n',inspectedAt:2,environment:{detectedAt:2,tools:[],unsupported:[]},changes:{patch:'diff',untracked:[]}}),githubProject:async()=>({owner:'aux',repository:'fixture',remoteUrl:'https://github.com/aux/fixture',branch:nativeProject.branch,baseCommit:nativeProject.baseCommit,headCommit:nativeProject.baseCommit}),recordGithubStatus:async(_id,status)=>status,writeIncidentReport:async input=>({projectId:input.projectId,generatedAt:2,path:'/incident.md',content:'# incident',page:input.page,consoleCount:input.console.length,networkCount:input.network.length}),listProjectFiles:async()=>['app.ts'],readProjectFile:async()=>({projectId,name:'app.ts',content:'one',sha256:'b'.repeat(64)}),writeProjectFile:async input=>{await invoke('tasks.confirmProjectInvocation',{taskId:input.task.taskId,expectedRevision:input.task.taskRevision,projectId:input.projectId,invocationId:input.task.invocationId,name:'file.write'},{external:false});return{projectId,name:input.name,content:input.content,sha256:'c'.repeat(64),recoveryPath:'/recovery'};},createProjectFile:async input=>({projectId,name:input.name,content:input.content,sha256:'d'.repeat(64)}),renameProjectFile:async input=>({projectId,name:input.nextName,content:'one',sha256:input.expectedHash,recoveryPath:'/rename-recovery'}),deleteProjectFile:async input=>({name:input.name,recoveryPath:'/delete-recovery'}),projectCommands:async()=>[],runProjectCommand:async()=>null,approveProjectPreview:async input=>({url:input.url,checkedAt:2,state:'responding',statusCode:200,message:'Received a successful HTTP response.'}),stopProjectCommand:async()=>({commandId:'22222222-2222-4222-8222-222222222222',projectId,command:'true',mode:'command',cwd:nativeProject.path,startedAt:1,finishedAt:2,state:'succeeded',exitCode:0,output:'',truncated:false}),prepareProjectReview:async()=>({projectId,generatedAt:2,path:'/review.md',content:'# review',title:'Review',snapshotTree:'e'.repeat(40),readiness:{state:'ready',reasons:[]},patch:{path:'/changes.patch',content:'diff',sha256:'a'.repeat(64),byteLength:4,complete:true},draft:{path:'/draft.md',content:'# draft',sha256:'b'.repeat(64)},manifestPath:'/manifest.json',manifestSha256:'c'.repeat(64)}),commitProject:async()=>null},
    drivers: () => ({ aux: null, chrome: null }),
    chromeAttach: async () => ({}), chromeDetach: async () => ({ ok: true }), chromeTabs: async () => [],
    importCookies: async () => ({}), benchRun: async () => ({ reportPath: "" }),
  };
  services.operations = new OperationService({ repo, events, pages });
  fixtureServices = services;
  invoke = makeInvoker(services);
});
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const call = async (method: MethodName, params: unknown = {}) => {
  const result = await invoke(method, params);
  const parsed = ResultSchemas[method].safeParse(result);
  expect(parsed.success, `${method}: ${parsed.success ? "" : JSON.stringify(parsed.error.issues.slice(0, 3))}`).toBe(true);
  return result as never;
};

describe("handler results conform to ResultSchemas", () => {
  it("uses Profile search preferences without persisting a second runtime copy", async () => {
    let selected = "https://search.example/?q=%s";
    let suggestions = false;
    const chromium = makeInvoker({
      ...fixtureServices,
      featureHost: "chromium-fork",
      featureProfileId: "regular-profile",
      native: {
        ...fixtureServices.native!,
        searchEngineGet: async () => selected,
        searchEngineSet: async template => { selected = template; return true; },
        searchSuggestionsGet: async () => suggestions,
        searchSuggestionsSet: async enabled => { suggestions = enabled; return true; },
      },
    });
    const before = repo.getSetting("searchEngine");
    expect(await chromium("settings.get", {}, { external: false })).toMatchObject({ searchEngine: selected, searchSuggestions: false });
    await chromium("settings.set", { searchEngine: "https://other.example/?q=%s" }, { external: false });
    await chromium("settings.set", { searchSuggestions: true }, { external: false });
    expect(await chromium("settings.get", {}, { external: false })).toMatchObject({ searchEngine: "https://other.example/?q=%s", searchSuggestions: true });
    expect(repo.getSetting("searchEngine")).toEqual(before);
    expect(repo.getSetting("searchSuggestions")).toBeUndefined();
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
          if (method === "bookmarks.list") return [{ nodeId: "7", url: "https://native.test/", title: "Native", createdAt: 1, folderPath: [] }];
          if (method === "bookmarks.folders.list") return [];
          return { ok: true };
        },
      },
    });
    const localCount = chromiumRepo.listBookmarks().length;
    expect(await chromium("bookmarks.list", {}, { external: false })).toMatchObject([{ nodeId: "7", url: "https://native.test/" }]);
    await chromium("bookmarks.add", { url: "https://new-native.test/", title: "Native save" }, { external: false });
    expect(calls).toEqual(["bookmarks.list", "bookmarks.add"]);
    expect(chromiumRepo.listBookmarks()).toHaveLength(localCount);
    expect(await chromium("history.list", { limit: 10 }, { external: false })).toEqual([]);
    await chromium("history.projectSnapshot", { profileId: "regular-profile", sourceGeneration: "browser", sequence: 0, batchIndex: 0, complete: true,
      visits: [{ url: "https://native-history.test/", title: "Visit", visitedAt: 123 }] }, { external: false });
    expect(await chromium("history.list", { limit: 10 }, { external: false })).toMatchObject([{ url: "https://native-history.test/" }]);
  });
  it("returns account-scoped Calendar event provenance through conversation sources", async () => {
    repo.saveRun({ runId: "calendar-source-turn", goal: "Meeting brief", status: "completed", pageIds: [], createdAt: 20,
      config: { chatId: "calendar-source-chat" } });
    repo.saveStep({ stepId: "calendar-source-step", runId: "calendar-source-turn", op: "calendar.events.list", startedAt: 21,
      outcome: { stepId: "calendar-source-step", op: "calendar.events.list", status: "ok", startedAt: 21, durationMs: 2,
        extracted: { events: [{ eventId: "event-1", title: "Meeting", start: "2026-09-25T10:00:00Z", end: "2026-09-25T11:00:00Z",
          url: "https://calendar.google.com/calendar/event?eid=one", source: { connectionId: "account-1", profileId: "profile-fixture", accountKey: "alice@example.test", fetchedAt: 22 } }] } } });
    const result = await invoke("conversations.sources.get", { chatId: "calendar-source-chat" }, { external: false }) as { sources: { kind?: string; accountKey?: string }[] };
    expect(ResultSchemas["conversations.sources.get"].safeParse(result).success).toBe(true);
    expect(result.sources).toMatchObject([{ kind: "calendar", accountKey: "alice@example.test" }]);
    const external = await invoke("conversations.sources.get", { chatId: "calendar-source-chat" }, { external: true }) as { sources: unknown[] };
    expect(external.sources).toEqual([]);
  });

  it("keeps revisioned workspace memory desktop-managed", async () => {
    const workspace = await invoke("workspaces.create", { name: "Memory workspace" }) as { workspaceId: string };
    await expect(invoke("workspaces.memory.set", { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "private workspace context" })).rejects.toThrow(/managed in Aux/i);
    const saved = await invoke("workspaces.memory.set", { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "shared workspace context" }, { external: false }) as { revision: number };
    expect(saved.revision).toBe(1);
    const read = await invoke("workspaces.memory.get", { workspaceId: workspace.workspaceId }, { external: false }) as { content: string };
    expect(read.content).toBe("shared workspace context");
  });

  it("stops pending transmission of browsing context when its source is forgotten", async () => {
    const workspace = await invoke("workspaces.create", { name: "Forget source" }) as { workspaceId: string };
    const other = await invoke("workspaces.create", { name: "Other source" }) as { workspaceId: string };
    await invoke("workspaces.browsingMemory.set", { workspaceId: workspace.workspaceId, policy: { enabled: true, retentionDays: 7 } }, { external: false });
    const recorded = await invoke("workspaces.browsingMemory.record", { workspaceId: workspace.workspaceId, pageId: "p1", expectedDocumentEpoch: 0 }, { external: false }) as { recorded: boolean };
    expect(recorded.recorded).toBe(true);
    const marker = "RECENT BROWSING IN THIS SPACE";
    repo.saveRun({ runId: "forget-active", goal: "Use saved source", status: "paused", pageIds: ["p1"], createdAt: Date.now(),
      config: { contextWorkspaceId: workspace.workspaceId, contextBrowsingMemory: true, context: `${marker}\nhttp://x.test/` } });
    repo.saveRun({ runId: "forget-other", goal: "Other Space", status: "paused", pageIds: ["p1"], createdAt: Date.now() + 1,
      config: { contextWorkspaceId: other.workspaceId, context: marker } });
    await invoke("workspaces.browsingMemory.forget", { workspaceId: workspace.workspaceId }, { external: false });
    expect(repo.getRun("forget-active")?.status).toBe("cancelled");
    expect(repo.getRun("forget-active")?.error).toMatch(/Workspace context changed/);
    expect(repo.getRun("forget-other")?.status).toBe("paused");
    expect(repo.getSetting(`browsingMemoryPages:${workspace.workspaceId}`)).toEqual([]);
    await invoke("workspaces.browsingMemory.record", { workspaceId: workspace.workspaceId, pageId: "p1", expectedDocumentEpoch: 0 }, { external: false });
    repo.saveRun({ runId: "exclude-active", goal: "Use saved source", status: "paused", pageIds: ["p1"], createdAt: Date.now() + 2,
      config: { contextWorkspaceId: workspace.workspaceId, contextBrowsingMemory: true, context: marker } });
    await invoke("workspaces.memory.set", { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "", excludedOrigins: ["http://x.test"] }, { external: false });
    expect(repo.getRun("exclude-active")?.status).toBe("cancelled");
    expect(repo.getSetting(`browsingMemoryPages:${workspace.workspaceId}`)).toEqual([]);
    expect(repo.getRun("forget-other")?.status).toBe("paused");
  });

  it("routes a task file write through the sealed native project journal", async () => {
    const workspace = await invoke("workspaces.create", { name: "Project journal" }) as { workspaceId: string };
    const task = await invoke("tasks.create", { workspaceId: workspace.workspaceId, title: "Edit file", objective: "Save app.ts",
      criteria: [{ criterionId: "file", description: "File saved", verification: "manual" }],
      resources: [{ resourceId: "repo", kind: "repository", projectId, locator: "/managed/checkout", label: "Fixture checkout", access: "write" }] }, { external: false }) as { taskId: string };
    const saved = await invoke("development.writeFile", { taskId: task.taskId, expectedRevision: 1, projectId,
      name: "app.ts", expectedHash: "b".repeat(64), content: "private fixture body" }, { external: false }) as { content: string };
    expect(saved.content).toBe("private fixture body");
    const record = repo.db.prepare("SELECT o.site_key AS site,i.status,i.effect_outcome AS outcome,i.inputs FROM operation_invocations i JOIN operations o ON o.operation_id=i.operation_id ORDER BY i.rowid DESC LIMIT 1").get() as {site:string;status:string;outcome:string;inputs:string};
    expect(record).toMatchObject({ site: "aux.project", status: "completed", outcome: "observed" });
    expect(record.inputs).toContain(task.taskId);
    expect(record.inputs).not.toContain("private fixture body");
  });

  it("workspaces/tasks persist revisions and bind a run before execution", async () => {
    const workspace = await call("workspaces.create", { name: "Test project" }) as { workspaceId: string };
    await call("workspaces.list");
    const task = await call("tasks.create", { workspaceId: workspace.workspaceId, title: "Read page", objective: "Read the page heading",
      criteria: [{ criterionId: "heading", description: "Heading cited from the page", verification: "browser" }] }) as { taskId: string };
    await call("tasks.list", { workspaceId: workspace.workspaceId });
    await call("tasks.update", { taskId: task.taskId, expectedRevision: 1, title: "Inspect heading" });
    await invoke("workspaces.memory.set", { workspaceId: workspace.workspaceId, expectedRevision: 0, content: "Cite the exact heading once." }, { external: false });
    const run = await call("tasks.start", { taskId: task.taskId, expectedRevision: 2, pageIds: ["p1"] }) as { runId: string; config: { taskId: string; taskRevision: number; chatId: string; context: string; instructions: string; contextWorkspaceId: string; contextWorkspaceRevision: number } };
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
    const set = await call("sets.create", { name: "s", source: "urls", urls: ["http://a.test/1", "http://b.test/2"] });
    await call("sets.get", { setId: (set as { setId: string }).setId });
    await call("sets.list");
    const { runId } = (await call("sets.map", { setId: (set as { setId: string }).setId, program: { steps: [{ id: "s1", op: "reload" }] }, concurrency: 1 })) as { runId: string };
    for (let i = 0; i < 100 && !["completed", "failed", "partially_completed"].includes(repo.getRun(runId)!.status); i++)
      await new Promise((r) => setTimeout(r, 10));
    await call("sets.results", { setId: (set as { setId: string }).setId });
    await call("runs.get", { runId });
    expect(["completed", "failed", "partially_completed"]).toContain(repo.getRun(runId)!.status);
  });

  it("runs.* incl. modelCalls on runs.get and control results", async () => {
    repo.saveRun({ runId: "run_x", goal: "g", status: "running", pageIds: ["p1"], createdAt: Date.now() });
    repo.saveModelCall({ callId: "model_x", runId: "run_x", role: "planner", modelId: "fixture/model", providerMetadata: { aux: { provider: "openai-compatible", destination: "http://127.0.0.1:9999" } }, durationMs: 4, inputTokens: 3, outputTokens: 2, createdAt: Date.now() });
    const got = (await call("runs.get", { runId: "run_x" })) as { modelCalls: number; usage: { modelIds: string[]; providers: string[]; destinations: string[]; costComplete: boolean } };
    expect(got).toMatchObject({ modelCalls: 1, usage: { modelIds: ["fixture/model"], providers: ["openai-compatible"], destinations: ["http://127.0.0.1:9999"], costComplete: false } });
    await call("runs.list", { limit: 10 });
    await call("runs.pause", { runId: "run_x" });
    await call("runs.resume", { runId: "run_x" });
    await call("runs.cancel", { runId: "run_x" });
    await call("runs.events", { sinceSeq: 0, limit: 50 });
    await call("events.since", { sinceSeq: 0, limit: 50 });
  });

  it("programs.* and programs.run applies {{param}} substitution", async () => {
    const saved = (await call("programs.save", {
      name: "greet",
      steps: [{ id: "s1", op: "fill", target: "css:#q", value: "hello {{who}}" }, { id: "s2", op: "navigate", url: "https://x.test/{{path}}" }],
      parameters: ["who", "path"],
    })) as { programId: string };
    await call("programs.list");
    await call("programs.validate", { program: { pageId: "p1", steps: [{ id: "a", op: "reload" }] } });

    await expect(invoke("programs.run", { programId: saved.programId, pageId: "p1", parameters: { who: "x" } })).rejects.toMatchObject({
      code: "invalid_params",
      detail: { missing: ["path"] },
    });
    executed.length = 0;
    const { runId } = (await call("programs.run", { programId: saved.programId, pageId: "p1", parameters: { who: 'Ada "the" Lovelace', path: "a/b" } })) as { runId: string };
    for (let i = 0; i < 100 && !executed.length; i++) await new Promise((r) => setTimeout(r, 5));
    const steps = executed[0]!.program.steps!;
    expect((steps[0] as { value: string }).value).toBe('hello Ada "the" Lovelace');
    expect((steps[1] as { url: string }).url).toBe("https://x.test/a/b");
    for (let i = 0; i < 100 && repo.getRun(runId)!.status === "running"; i++) await new Promise((r) => setTimeout(r, 5));
    expect(repo.getRun(runId)!.status).toBe("completed");
    await call("programs.delete", { programId: saved.programId });
  });

  it("settings / history / bookmarks / downloads / sessions / workspace / describe", async () => {
    await call("settings.get");
    await call("settings.set", { maxWorkers: 3 });
    repo.addHistory("http://x.test/", "x", "p1");
    await call("history.list", { limit: 10 });
    await call("bookmarks.add", { url: "http://x.test/", title: "x" });
    await call("bookmarks.list");
    await call("bookmarks.remove", { url: "http://x.test/" });
    await call("downloads.list");
    await call("sessions.list");
    await call("workspace.get");
    const described = await call("runtime.describe") as { features: { checkpointResume: boolean } };
    expect(described.features.checkpointResume).toBe(false);
    await expect(invoke("history.clear", {})).rejects.toMatchObject({ code: "permission_denied" });
    const cleared = await invoke("history.clear", {}, { external: false });
    expect(ResultSchemas["history.clear"].parse(cleared)).toEqual({ ok: true, removed: 1 });
  });

  it("pages.extract / waitFor / console / dialog / network", async () => {
    await expect(call("pages.extract", { pageId: "p1", fields: ["title"] })).resolves.toBeDefined();
    await expect(call("pages.waitFor", { pageId: "p1", condition: { kind: "settled" } })).resolves.toBeDefined();
    await expect(call("pages.console", { pageId: "p1" })).resolves.toBeDefined();
    await expect(call("pages.dialog", { pageId: "p1" })).resolves.toBeDefined();
    await expect(call("pages.network", { pageId: "p1" })).resolves.toBeDefined();
  });

  it("enforces task-scoped external authority before dispatch and filters shared lists", async () => {
    const firstWorkspace = await invoke("workspaces.create", { name: "Scoped" }, { external: false }) as { workspaceId: string };
    const otherWorkspace = await invoke("workspaces.create", { name: "Other" }, { external: false }) as { workspaceId: string };
    const task = await invoke("tasks.create", { workspaceId: firstWorkspace.workspaceId, title: "Scoped page", objective: "Read the attached page",
      criteria: [{ criterionId: "read", description: "Read it", verification: "browser" }],
      resources: [{ resourceId: "page", kind: "page", locator: "p1", label: "Fixture" },{resourceId:'repo',kind:'repository',projectId,locator:'/managed/checkout',label:'Fixture repo'}] }, { external: false }) as { taskId: string;revision:number };
    const other = await invoke("tasks.create", { workspaceId: otherWorkspace.workspaceId, title: "Other task", objective: "Stay private",
      criteria: [{ criterionId: "private", description: "Stay private", verification: "manual" }] }, { external: false }) as { taskId: string };
    const client = { external: true, connectionId: "connection", scope: { kind: "task" as const, workspaceId: firstWorkspace.workspaceId, taskId: task.taskId } };
    expect(await invoke("workspaces.list", {}, client)).toEqual([expect.objectContaining({ workspaceId: firstWorkspace.workspaceId })]);
    expect(await invoke("tasks.list", { includeArchived: true, limit: 100 }, client)).toEqual([expect.objectContaining({ taskId: task.taskId })]);
    expect(await invoke("pages.list", {}, client)).toEqual([expect.objectContaining({ pageId: "p1" })]);
    const workspace = await invoke("workspace.get", {}, client) as { pages: PageTarget[]; sets: unknown[]; sessions: unknown[] };
    expect(workspace.pages.map(item => item.pageId)).toEqual(["p1"]); expect(workspace.sets).toEqual([]); expect(workspace.sessions).toEqual([]);
    await expect(invoke("tasks.get", { taskId: other.taskId }, client)).rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke("pages.open", { url: "https://outside.test", background: false, ownedByRuntime: false }, client)).rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke("history.list", { limit: 10 }, client)).rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke("workspaces.create", { name: "Expanded" }, client)).rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke("tasks.create", {
      workspaceId: firstWorkspace.workspaceId,
      title: "Escaped task",
      objective: "Create a new root",
      criteria: [{ criterionId: "root", description: "Root", verification: "manual" }]
    }, client)).rejects.toMatchObject({ code: "permission_denied" });
    const child = await invoke("tasks.create", {
      workspaceId: firstWorkspace.workspaceId,
      parentTaskId: task.taskId,
      title: "Scoped child",
      objective: "Handle one bounded part",
      criteria: [{ criterionId: "child", description: "Child done", verification: "manual" }]
    }, client) as { taskId: string; parentTaskId?: string };
    expect(child.parentTaskId).toBe(task.taskId);
    const grandchild = await invoke("tasks.create", {
      workspaceId: firstWorkspace.workspaceId,
      parentTaskId: child.taskId,
      title: "Scoped grandchild",
      objective: "Handle a smaller part",
      criteria: [{ criterionId: "grandchild", description: "Grandchild done", verification: "manual" }]
    }, client) as { taskId: string; parentTaskId?: string };
    expect(grandchild.parentTaskId).toBe(child.taskId);
    expect((await invoke("tasks.list", { includeArchived: true, limit: 100 }, client) as { taskId: string }[]).map(item => item.taskId))
      .toEqual(expect.arrayContaining([task.taskId, child.taskId, grandchild.taskId]));
    await expect(invoke("tasks.create", {
      workspaceId: otherWorkspace.workspaceId,
      parentTaskId: other.taskId,
      title: "Foreign child",
      objective: "Escape",
      criteria: [{ criterionId: "escape", description: "Escape", verification: "manual" }]
    }, client)).rejects.toMatchObject({ code: "permission_denied" });
    await expect(invoke('tasks.update',{taskId:task.taskId,expectedRevision:task.revision,resources:[{resourceId:'expanded',kind:'page',locator:'outside',label:'Outside'}]},client)).rejects.toMatchObject({code:'permission_denied'});
    expect(await invoke('development.projects',{taskId:task.taskId,expectedRevision:task.revision},client)).toEqual([nativeProject]);
    expect(await invoke('development.readFile',{taskId:task.taskId,expectedRevision:task.revision,projectId,name:'app.ts'},client)).toMatchObject({content:'one'});
    await expect(invoke('development.readFile',{taskId:task.taskId,expectedRevision:task.revision,projectId:'33333333-3333-4333-8333-333333333333',name:'app.ts'},client)).rejects.toMatchObject({code:'permission_denied'});
    await expect(invoke('development.projects',{taskId:other.taskId,expectedRevision:1},client)).rejects.toMatchObject({code:'permission_denied'});
  });
});

describe("generated result authority", () => {
  it("requires a scoped task for agent generation and validates desktop results", async () => {
    repo.saveRun({runId:"generated-run",goal:"Create an export",status:"completed",pageIds:[],config:{chatId:"generated-chat"},createdAt:Date.now()});
    const params={chatId:"generated-chat",filename:"report.csv",spec:{kind:"csv",table:{name:"Report",rows:[["Name","Value"],["A",1]]}}};
    await expect(invoke("results.generate",params,{external:true})).rejects.toMatchObject({code:"permission_denied"});
    const saved=await invoke("results.generate",params,{external:false});
    expect(ResultSchemas["results.generate"].parse(saved)).toMatchObject({chatId:"generated-chat",filename:"report.csv",revision:1});
    const workspace=await invoke("workspaces.create",{name:"Generated exports"},{external:false}) as {workspaceId:string};
    const task=await invoke("tasks.create",{workspaceId:workspace.workspaceId,title:"Export",objective:"Make a report",criteria:[{criterionId:"file",description:"Create file",verification:"manual"}]},{external:false}) as {taskId:string;revision:number};
    const taskChatId=`task:${task.taskId}`;
    repo.saveRun({runId:"task-generated-run",goal:"Make a report",status:"completed",pageIds:[],config:{chatId:taskChatId,taskId:task.taskId},createdAt:Date.now()});
    const client={external:true,scope:{kind:"task" as const,workspaceId:workspace.workspaceId,taskId:task.taskId}};
    await expect(invoke("results.generate",{...params,taskId:task.taskId,expectedRevision:task.revision},client)).rejects.toMatchObject({code:"permission_denied"});
    const authorized=await invoke("results.generate",{...params,chatId:taskChatId,taskId:task.taskId,expectedRevision:task.revision},client);
    expect(ResultSchemas["results.generate"].parse(authorized)).toMatchObject({chatId:taskChatId,revision:1});
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
    expect(JSON.parse(substituteParameters('{"v":"{{a}}"}', { a: "line\nbreak" }))).toEqual({ v: "line\nbreak" });
    expect(() => substituteParameters('{"v":"{{a}} {{b}}"}', {})).toThrow(/parameters: a, b/);
    expect(substituteParameters('{"v":"plain"}', { unused: "x" })).toBe('{"v":"plain"}');
  });
});
