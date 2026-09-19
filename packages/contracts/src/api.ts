import { z } from "zod";
import {
  ArtifactSchema,
  BackendSchema,
  BookmarkSchema,
  BrowserSessionSchema,
  DownloadSchema,
  HistoryEntrySchema,
  ModelCallSchema,
  PageSetSchema,
  PageTargetSchema,
  ResultRecordSchema,
  RunSchema,
  SavedProgramSchema,
  SetMemberSchema,
  StepRecordSchema,
} from "./entities.js";
import { EventSchema } from "./events.js";
import { CompactObservationSchema, ObservationFormatSchema, ObservationSchema, ObservationRequestSchema } from "./observation.js";
import { ConditionSchema, ProgramNodeSchema, ProgramSchema, ProgramResultSchema, StepSchema } from "./program.js";
import { StateQuerySchema } from "./state.js";

const id = z.string().min(1);

/** How `pages.open` chooses between the Vector Engine and Chromium (architecture §11). */
export const EngineModeSchema = z.enum(["off", "auto", "always"]);
export type EngineMode = z.infer<typeof EngineModeSchema>;

/** pages.* */
export const PagesListParams = z.object({
  backend: BackendSchema.optional(),
  includeDetached: z.boolean().optional(),
});
export const PagesOpenParams = z.object({
  url: z.string().min(1),
  /**
   * `vector` (default) is routable: with `engineMode: "auto"` the router may
   * place the page on `vector-engine` and fall back to Chromium.
   * `vector-engine` forces the engine (no fallback); `chrome` needs an attached Chrome.
   */
  backend: BackendSchema.default("vector"),
  /** hidden/background pages never steal focus; used for worker pages. */
  background: z.boolean().default(false),
  ownedByRuntime: z.boolean().default(false),
  activate: z.boolean().optional(),
  /** chrome backend: attach an existing borrowed tab by CDP target id */
  targetId: z.string().optional(),
});
export const PagesCloseParams = z.object({ pageId: id });
export const PagesActivateParams = z.object({ pageId: id });
export const PagesNavigateParams = z.object({ pageId: id, url: z.string().min(1) });
export const PagesObserveParams = z
  .object({
    pageId: id,
    /** "compact" returns { observation: CompactObservation } — rendered text + refs, no selectors/rects */
    format: ObservationFormatSchema.optional(),
  })
  .merge(ObservationRequestSchema.partial());
/** pages.execute `returnObservation` — observe the page in the same round trip (act-and-observe). */
export const ReturnObservationSchema = z.object({
  scope: z.enum(["full", "forms", "links", "tables", "subtree"]).optional(),
  subtreeRef: z.string().optional(),
  format: ObservationFormatSchema.optional(),
  maxElements: z.number().int().positive().optional(),
  maxTextChars: z.number().int().positive().optional(),
});
export type ReturnObservation = z.infer<typeof ReturnObservationSchema>;
export const PagesExecuteParams = z.object({
  program: ProgramSchema,
  returnObservation: ReturnObservationSchema.optional(),
});
/** Named observation keys (`title`, `r12`) or CSS extract specs. */
export const ExtractFieldSchema = z.union([
  z.string().min(1),
  z.object({
    name: z.string().min(1),
    selector: z.string().optional(),
    attribute: z.string().optional(),
    all: z.boolean().optional(),
  }),
]);
export const PagesExtractParams = z.object({
  pageId: id,
  fields: z.array(ExtractFieldSchema).optional(),
});
export const PagesWaitForParams = z.object({
  pageId: id,
  condition: ConditionSchema,
});
export const PagesConsoleParams = z.object({
  pageId: id,
  since: z.number().optional(),
  limit: z.number().int().positive().max(1000).optional(),
});
export const PagesDialogParams = z.object({
  pageId: id,
  action: z.enum(["list", "accept", "dismiss"]).default("list"),
  promptText: z.string().optional(),
});
export const PagesNetworkParams = z.object({
  pageId: id,
  since: z.number().optional(),
  urlIncludes: z.string().optional(),
  limit: z.number().int().positive().max(1000).optional(),
});
export const PagesCaptureParams = z.object({
  pageId: id,
  fullPage: z.boolean().optional(),
  /** data url for transport; file for artifact storage */
  format: z.enum(["dataUrl", "artifact"]).default("dataUrl"),
});
/** Human pointer/key on the engine view. Not pages.execute — takeover must still type. */
export const PagesEngineInputParams = z.object({
  pageId: id,
  type: z.enum([
    "click",
    "pointerdown",
    "scroll",
    "key",
    "ime",
    "imePreedit",
    "select",
    "resize",
    "accessKitAction",
  ]),
  x: z.number().optional(),
  y: z.number().optional(),
  button: z.number().optional(),
  key: z.string().optional(),
  text: z.string().optional(),
  direction: z.enum(["up", "down", "top", "bottom"]).optional(),
  amount: z.number().optional(),
  start: z.number().optional(),
  end: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  name: z.string().optional(),
});
/** Display-list scene for native presentation. Not PNG. */
export const PagesSceneParams = z.object({ pageId: id });
export const PagesFindParams = z.object({
  pageId: id,
  text: z.string(),
  forward: z.boolean().default(true),
  findNext: z.boolean().default(false),
});
export const PagesStopFindParams = z.object({ pageId: id, action: z.enum(["clear", "keep"]).default("clear") });
export const PagesZoomParams = z.object({ pageId: id, level: z.number().optional(), delta: z.number().optional(), reset: z.boolean().optional() });
export const PagesTakeoverParams = z.object({ pageId: id });
export const PagesResumeParams = z.object({ pageId: id });
export const PagesOpenLiveParams = z.object({ pageId: id }).describe("focus a borrowed Chrome tab in real Chrome");

/** sets.* */
export const SetsCreateParams = z.object({
  name: z.string().min(1),
  source: z.enum(["links", "urls", "tabs", "records", "manual"]).default("manual"),
  urls: z.array(z.string()).optional(),
  pageIds: z.array(z.string()).optional(),
  records: z.array(z.record(z.string(), z.unknown())).optional(),
  /** collect links from this page into the set */
  collectFromPageId: z.string().optional(),
  linkSelector: z.string().optional(),
});
export const SetsGetParams = z.object({ setId: id });
export const SetsMapParams = z.object({
  setId: id,
  /** run this program per member; alternatively an agent goal per member. */
  program: z
    .object({
      steps: z.array(StepSchema).min(1).max(200).optional(),
      nodes: z.array(ProgramNodeSchema).min(1).max(400).optional(),
    })
    .refine((p) => (p.steps?.length ?? 0) > 0 || (p.nodes?.length ?? 0) > 0, { message: "steps or nodes required" })
    .optional(),
  programId: z.string().optional(),
  goal: z.string().optional(),
  concurrency: z.number().int().min(1).max(16).optional(),
  memberIds: z.array(z.string()).optional(),
});
export const SetsResultsParams = z.object({ setId: id, status: z.enum(["ok", "partial", "error"]).optional() });

/** runs.* */
export const RunsStartParams = z.object({
  goal: z.string().min(1),
  pageId: z.string().optional(),
  pageIds: z.array(z.string()).optional(),
  setId: z.string().optional(),
  modelId: z.string().optional(),
  maxSteps: z.number().int().positive().optional(),
  /** `0` = no per-run cap. */
  maxModelCalls: z.number().int().min(0).optional(),
  deadlineMs: z.number().int().positive().optional(),
  /** prior turns / notes the planner should see ("EARLIER IN THIS SESSION") */
  context: z.string().max(20_000).optional(),
  /** chat thread this run belongs to — groups turns into conversations */
  chatId: z.string().optional(),
});
export const RunsControlParams = z.object({ runId: id });
export const RunsGetParams = z.object({ runId: id });
export const RunsEventsParams = z.object({
  runId: z.string().optional(),
  sinceSeq: z.number().int().nonnegative().default(0),
  limit: z.number().int().positive().max(2000).default(500),
});
export const RunsAnswerParams = z.object({ runId: id, answer: z.string() });
export const RunsListParams = z.object({ limit: z.number().int().positive().max(500).default(50) });

/** artifacts.* */
export const ArtifactsListParams = z.object({ runId: z.string().optional(), pageId: z.string().optional() });
export const ArtifactsReadParams = z.object({ artifactId: id });

/** programs.* */
export const ProgramsRunParams = z.object({
  programId: id,
  pageId: id,
  parameters: z.record(z.string(), z.string()).optional(),
});
export const ProgramsSaveParams = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  /** site key the program was validated against; "*" = any */
  siteKey: z.string().default("*"),
  steps: z.array(StepSchema).min(1).max(200).optional(),
  nodes: z.array(ProgramNodeSchema).min(1).max(400).optional(),
  parameters: z.array(z.string()).default([]),
});
export const ProgramsDeleteParams = z.object({ programId: id });

/** sessions / chrome attach */
export const ChromeAttachParams = z.object({
  /** cdp port of the user's Chrome started with --remote-debugging-port */
  port: z.number().int().positive().default(9222),
});
export const ChromeOpenLiveParams = z.object({ pageId: id });

/** models / settings */
export const ModelsProbeParams = z.object({ modelId: id.optional() });
export const SettingsSetParams = z.object({
  gatewayApiKey: z.string().optional(),
  plannerModel: z.string().optional(),
  recoveryModel: z.string().optional(),
  visionModel: z.string().optional(),
  searchEngine: z.string().optional(),
  maxWorkers: z.number().int().min(1).max(16).optional(),
  perOrigin: z.number().int().min(1).max(8).optional(),
  /** `0` = no per-run cap. */
  maxModelCalls: z.number().int().min(0).max(256).optional(),
  theme: z.enum(["dark", "light"]).optional(),
  zoomFactor: z.number().optional(),
  /** Vector Engine routing: off (default, Chromium only) | auto (router) | always (engine only). */
  engineMode: EngineModeSchema.optional(),
  /** Privilege-independent effect grants. Model text cannot expand these. */
  effectGrants: z
    .array(
      z.union([
        z.string(),
        z.object({
          effect: z.enum(["read", "write", "destructive", "egress", "*"]),
          origin: z.string().optional(),
          scope: z.string().optional(),
          expiresAt: z.number().int().nonnegative().optional(),
        }),
      ]),
    )
    .optional(),
});
export const SettingsGetParams = z.object({});

/** history/bookmarks */
export const HistoryListParams = z.object({ query: z.string().optional(), limit: z.number().int().positive().max(500).default(100) });
export const BookmarkAddParams = z.object({ url: z.string().url(), title: z.string() });
export const BookmarkRemoveParams = z.object({ url: z.string().url() });

/** events */
export const EventsSinceParams = RunsEventsParams;

/** workspace snapshot for renderer sync */
export const WorkspaceGetParams = z.object({});

export const MethodSchemas = {
  "pages.list": PagesListParams,
  "pages.open": PagesOpenParams,
  "pages.close": PagesCloseParams,
  "pages.activate": PagesActivateParams,
  "pages.navigate": PagesNavigateParams,
  "pages.back": PagesCloseParams,
  "pages.forward": PagesCloseParams,
  "pages.reload": PagesCloseParams,
  "pages.stop": PagesCloseParams,
  "pages.observe": PagesObserveParams,
  "pages.execute": PagesExecuteParams,
  "pages.extract": PagesExtractParams,
  "pages.waitFor": PagesWaitForParams,
  "pages.console": PagesConsoleParams,
  "pages.dialog": PagesDialogParams,
  "pages.network": PagesNetworkParams,
  "pages.capture": PagesCaptureParams,
  "pages.scene": PagesSceneParams,
  "pages.engineInput": PagesEngineInputParams,
  "pages.find": PagesFindParams,
  "pages.stopFind": PagesStopFindParams,
  "pages.zoom": PagesZoomParams,
  "pages.takeover": PagesTakeoverParams,
  "pages.resume": PagesResumeParams,
  "pages.openLive": PagesOpenLiveParams,
  "sets.create": SetsCreateParams,
  "sets.get": SetsGetParams,
  "sets.list": z.object({}),
  "sets.map": SetsMapParams,
  "sets.results": SetsResultsParams,
  "runs.start": RunsStartParams,
  "runs.get": RunsGetParams,
  "runs.list": RunsListParams,
  "runs.pause": RunsControlParams,
  "runs.resume": RunsControlParams,
  "runs.cancel": RunsControlParams,
  "runs.answer": RunsAnswerParams,
  "runs.events": RunsEventsParams,
  "events.since": EventsSinceParams,
  "artifacts.list": ArtifactsListParams,
  "artifacts.read": ArtifactsReadParams,
  "programs.list": z.object({}),
  "programs.run": ProgramsRunParams,
  "programs.save": ProgramsSaveParams,
  "programs.delete": ProgramsDeleteParams,
  "sessions.list": z.object({}),
  "chrome.attach": ChromeAttachParams,
  "chrome.detach": z.object({}),
  "chrome.tabs": z.object({}),
  "chrome.importCookies": z.object({
    source: z.enum(["auto", "attached", "profile"]).optional(),
  }),
  "chrome.openLive": ChromeOpenLiveParams,
  "models.list": z.object({}),
  "models.probe": ModelsProbeParams,
  "settings.get": SettingsGetParams,
  "settings.set": SettingsSetParams,
  "history.list": HistoryListParams,
  "history.clear": z.object({}),
  "bookmarks.list": z.object({}),
  "bookmarks.add": BookmarkAddParams,
  "bookmarks.remove": BookmarkRemoveParams,
  "downloads.list": z.object({}),
  "workspace.get": WorkspaceGetParams,
  "bench.run": z.object({ task: z.string().optional(), repeats: z.number().int().positive().max(200).optional() }),

  /** runtime-vnext: responses, state index, datasets, operations, traces */
  "responses.list": z.object({
    pageId: id,
    since: z.number().optional(),
    urlIncludes: z.string().optional(),
    limit: z.number().int().positive().max(1000).optional(),
  }),
  "responses.body": z.object({ requestId: id }),
  "state.query": StateQuerySchema,
  "state.datasets": z.object({ runId: z.string().optional(), pageId: z.string().optional() }),
  "datasets.rows": z.object({ datasetId: id, limit: z.number().int().positive().max(5000).optional() }),
  "datasets.transform": z.object({
    datasetId: id,
    op: z.enum(["project", "filter", "sort", "dedup", "group", "limit", "export"]),
    args: z.record(z.string(), z.unknown()).optional(),
  }),
  "datasets.save": z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
    source: z.string(),
    runId: z.string().optional(),
    pageId: z.string().optional(),
    schema: z.array(z.string()).optional(),
    provenance: z.string().optional(),
  }),
  "operations.list": z.object({ siteKey: z.string().optional() }),
  "operations.get": z.object({ siteKey: z.string(), name: z.string() }),
  "operations.saveProgram": z.object({
    // pageId optional — operations bind a page per-invocation
    program: ProgramSchema.extend({ pageId: z.string().optional() }),
    siteKey: z.string(),
    name: z.string(),
    description: z.string().optional(),
    inputSchema: z.unknown().optional(),
    outputSchema: z.unknown().optional(),
    effectClass: z.enum(["read", "write", "destructive"]).optional(),
    guards: z.record(z.string(), z.unknown()).optional(),
  }),
  "operations.saveRequest": z.object({
    siteKey: z.string(),
    name: z.string(),
    description: z.string().optional(),
    method: z.string().optional(),
    url: z.string(),
    body: z.unknown().optional(),
    headers: z.record(z.string(), z.string()).optional(),
    inputSchema: z.unknown().optional(),
    outputSchema: z.unknown().optional(),
    effectClass: z.enum(["read", "write", "destructive"]).optional(),
    guards: z.record(z.string(), z.unknown()).optional(),
    validated: z.boolean().optional(),
  }),
  "operations.invoke": z.object({
    siteKey: z.string(),
    name: z.string(),
    inputs: z.record(z.string(), z.unknown()).optional(),
    pageId: z.string().optional(),
    runId: z.string().optional(),
    implId: z.string().optional(),
    /** §16.4 idempotency — a repeated requestKey returns the stored invocation */
    requestKey: z.string().optional(),
  }),
  "operations.explain": z.object({ siteKey: z.string(), name: z.string(), pageId: z.string().optional() }),
  "operations.setImplState": z.object({
    implId: id,
    state: z.enum(["candidate", "validated", "shadow", "quarantined"]),
  }),
  "operations.disable": z.object({ implId: id }),
  "operations.forget": z.object({ siteKey: z.string(), name: z.string() }),
  /** §10.3 — compile a candidate impl from a run's persisted step trace. */
  "operations.compile": z.object({ runId: id, siteKey: z.string().optional(), name: z.string().optional() }),
  "programs.validate": z.object({ program: ProgramSchema }),
  "traces.list": z.object({ since: z.number().optional(), runId: z.string().optional(), limit: z.number().int().positive().max(2000).optional() }),
  "traces.summary": z.object({ runId: id }),
  "traces.counters": z.object({}),
  "runtime.describe": z.object({}),
} as const;

export type MethodName = keyof typeof MethodSchemas;

/** Wire shapes for the result column — used for typing, validated server-side. */
export const ResultSchemas = {
  "pages.list": z.array(PageTargetSchema),
  "pages.open": PageTargetSchema,
  "pages.close": z.object({ ok: z.boolean() }),
  "pages.activate": PageTargetSchema,
  "pages.navigate": PageTargetSchema,
  "pages.back": PageTargetSchema,
  "pages.forward": PageTargetSchema,
  "pages.reload": PageTargetSchema,
  "pages.stop": PageTargetSchema,
  "pages.observe": z.union([ObservationSchema, z.object({ observation: CompactObservationSchema })]),
  "pages.execute": ProgramResultSchema.extend({
    /** present when the request carried returnObservation; full or compact per its format */
    observation: z.union([ObservationSchema, CompactObservationSchema]).optional(),
  }),
  "pages.extract": z.object({
    pageId: z.string(),
    documentEpoch: z.number(),
    revision: z.number(),
    fields: z.record(z.string(), z.unknown()),
  }),
  "pages.waitFor": z.object({
    ok: z.boolean(),
    timedOut: z.boolean(),
    detail: z.string().optional(),
    status: z.string().optional(),
  }),
  "pages.console": z.object({
    lines: z.array(z.object({ level: z.string(), message: z.string(), atMs: z.number().optional() })),
  }),
  "pages.dialog": z.object({
    ok: z.boolean().optional(),
    action: z.enum(["list", "accept", "dismiss"]).optional(),
    dialogs: z.array(z.object({ type: z.string(), message: z.string() })).optional(),
    pending: z.object({ type: z.string(), message: z.string() }).nullable().optional(),
  }),
  "pages.network": z.array(z.unknown()),
  "pages.engineInput": z.object({ ok: z.boolean() }),
  "pages.scene": z.object({
    kind: z.literal("displayList"),
    transport: z.literal("scene"),
    png: z.literal(false),
    width: z.number(),
    height: z.number(),
    itemCount: z.number(),
    items: z.array(z.record(z.string(), z.unknown())),
    page: z.union([z.string(), z.number()]).optional(),
    scale: z.number().optional(),
  }),
  "pages.capture": z.object({
    dataUrl: z.string().optional(),
    artifactId: z.string().optional(),
    width: z.number(),
    height: z.number(),
    scale: z.number(),
  }),
  "pages.find": z.object({ matches: z.number(), activeMatch: z.number().optional() }),
  "pages.stopFind": z.object({ ok: z.boolean() }),
  "pages.zoom": z.object({ level: z.number() }),
  "pages.takeover": PageTargetSchema,
  "pages.resume": PageTargetSchema,
  "pages.openLive": z.object({ ok: z.boolean() }),
  "sets.create": PageSetSchema,
  "sets.get": z.object({ set: PageSetSchema, members: z.array(SetMemberSchema) }),
  "sets.list": z.array(PageSetSchema),
  "sets.map": z.object({ runId: z.string() }),
  "sets.results": z.array(ResultRecordSchema),
  "runs.start": RunSchema,
  "runs.get": z.object({ run: RunSchema, steps: z.array(StepRecordSchema), modelCalls: z.number() }),
  "runs.list": z.array(RunSchema),
  "runs.pause": RunSchema,
  "runs.resume": RunSchema,
  "runs.cancel": RunSchema,
  "runs.answer": RunSchema,
  "runs.events": z.object({ events: z.array(EventSchema), lastSeq: z.number() }),
  "events.since": z.object({ events: z.array(EventSchema), lastSeq: z.number() }),
  "artifacts.list": z.array(ArtifactSchema),
  "artifacts.read": z.object({ artifact: ArtifactSchema, dataBase64: z.string() }),
  "programs.list": z.array(SavedProgramSchema),
  "programs.run": z.object({ runId: z.string() }),
  "programs.save": SavedProgramSchema,
  "programs.delete": z.object({ ok: z.boolean() }),
  "sessions.list": z.array(BrowserSessionSchema),
  "chrome.attach": BrowserSessionSchema,
  "chrome.detach": z.object({ ok: z.boolean() }),
  "chrome.tabs": z.array(z.object({ targetId: z.string(), url: z.string(), title: z.string(), type: z.string() })),
  "chrome.importCookies": z.object({
    ok: z.boolean(),
    source: z.enum(["attached", "profile"]),
    imported: z.number(),
    skipped: z.number(),
    domains: z.number(),
    detail: z.string().optional(),
  }),
  "chrome.openLive": z.object({ ok: z.boolean() }),
  "models.list": z.object({
    models: z.array(z.object({ id: z.string(), name: z.string().optional() })),
    source: z.enum(["gateway", "static"]),
  }),
  "models.probe": z.object({
    ok: z.boolean(),
    modelId: z.string(),
    latencyMs: z.number().optional(),
    vision: z.boolean().optional(),
    error: z.string().optional(),
  }),
  "settings.get": z.record(z.string(), z.unknown()),
  "settings.set": z.object({ ok: z.boolean() }),
  "history.list": z.array(HistoryEntrySchema),
  "history.clear": z.object({ ok: z.boolean() }),
  "bookmarks.list": z.array(BookmarkSchema),
  "bookmarks.add": z.object({ ok: z.boolean() }),
  "bookmarks.remove": z.object({ ok: z.boolean() }),
  "downloads.list": z.array(DownloadSchema),
  "workspace.get": z.object({
    pages: z.array(PageTargetSchema),
    sets: z.array(PageSetSchema),
    members: z.array(SetMemberSchema),
    runs: z.array(RunSchema),
    sessions: z.array(BrowserSessionSchema),
    activePageId: z.string().nullable(),
    lastSeq: z.number(),
  }),
  "bench.run": z.object({ reportPath: z.string() }),
  "responses.list": z.array(z.unknown()),
  "responses.body": z.object({ mediaType: z.string(), dataBase64: z.string() }),
  "state.query": z.unknown(),
  "state.datasets": z.array(z.unknown()),
  "datasets.rows": z.array(z.unknown()),
  "datasets.transform": z.unknown(),
  "datasets.save": z.unknown(),
  "operations.list": z.array(z.unknown()),
  "operations.get": z.unknown(),
  "operations.saveProgram": z.object({ operationId: z.string(), implId: z.string() }),
  "operations.saveRequest": z.object({ operationId: z.string(), implId: z.string() }),
  "operations.invoke": z.unknown(),
  "operations.explain": z.unknown(),
  "operations.setImplState": z.object({ ok: z.boolean() }),
  "operations.disable": z.object({ ok: z.boolean() }),
  "operations.forget": z.object({ ok: z.boolean() }),
  "operations.compile": z.unknown(),
  "programs.validate": z.object({ ok: z.boolean(), errors: z.array(z.string()) }),
  "traces.list": z.array(z.unknown()),
  "traces.summary": z.record(z.string(), z.unknown()),
  "traces.counters": z.record(z.string(), z.number()),
  "runtime.describe": z.unknown(),
} as const;
