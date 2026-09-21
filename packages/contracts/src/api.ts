import { ModelProviderSchema, ModelCredentialSchema } from "./model-providers.js";
import { z } from "zod";

import { isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR } from "./search-engine.js";
export const SearchEngineTemplateSchema = z.string().trim().max(2048).refine(isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR);

import {
  ArtifactSchema,
  BackendSchema,
  BookmarkSchema, BookmarkFolderPathSchema,
  BrowserSessionSchema,
  ConversationSummarySchema,
  DownloadSchema,
  HistoryEntrySchema,
  ModelCallSchema,
  ModelUsageSummarySchema,
  PageSetSchema,
  PageTargetSchema,
  ResponseRecordSchema,
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
import { TaskSchema, TaskCreateParams, TaskPromoteParams, TaskUpdateParams, WorkspaceSchema, WorkspaceMemorySchema, WorkspaceMemoryItemSchema, BrowsingMemoryPolicySchema, WorkspaceBrowsingMemorySchema, EvidenceCommandParams, EvidenceNoteParams, EvidenceCaptureParams, EvidenceDocumentParams, CriterionReviewParams, TaskReconcileParams, TaskReconcileOperationParams,
  TaskEvidenceSchema, CriterionReviewSchema, TaskReceiptSchema } from "./tasks.js";
import { AgentConnectionCreateParams, AgentConnectionSchema } from "./agent-connections.js";
import {
  VaultAccessRecordSchema, VaultGrantParams, VaultGrantSchema, VaultItemSchema, VaultLockParams, VaultSaveParams, VaultStatusSchema, VaultUnlockParams,
} from "./vault.js";
import {
  RoutineCreateParams, RoutineFromResultParams, RoutineRunParams, RoutineRunSchema, RoutineSchema, RoutineUpdateParams,
} from "./routines.js";
import { BrowserSpaceSchema, SpaceInputSchema, SpaceColorSchema } from "./spaces.js";
import {CloudEnvironmentSchema,CloudCommandRecordSchema,CloudCommandResultSchema,CloudFileEntrySchema,CloudFileSchema,CloudTerminalSessionSchema,CloudPreviewSessionSchema,CloudWorkspaceExportSchema,CloudProviderInventorySchema,CloudTaskResultSchema,CloudResultArtifactExportSchema,PreservedCloudResultSchema} from './cloud.js';
import {LocalProjectSchema,ProjectInspectionSchema,ProjectCommandSchema,ProjectFileSchema,ProjectReviewSummarySchema,ProjectCommitRequestSchema,ProjectCommitResultSchema,LocalPreviewCheckSchema,ProjectGithubStatusSchema,ProjectIncidentReportSchema} from "./local-projects.js";

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
  /** Desktop shell owner. Ordinary API clients omit this. */
  windowId: z.string().min(1).optional(),
  /**
   * Omit for routing. `vector` explicitly selects embedded Chromium.
   * `vector-engine` forces the engine (no fallback); `chrome` needs an attached Chrome.
   */
  backend: BackendSchema.optional(),
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
  expectedDocumentEpoch: z.number().int().nonnegative().optional(),
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
export const PagesZoomParams = z.object({ pageId: id, level: z.number().optional(), delta: z.number().optional(), reset: z.boolean().optional(), direction: z.enum(["in", "out"]).optional() });
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
  /** Desktop default for a new conversation; never reassigns an existing conversation. */
  defaultWorkspaceId: id.optional(),
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
export const RunsListParams = z.object({
  limit: z.number().int().positive().max(500).default(50),
  before: z.object({ createdAt: z.number().finite(), runId: z.string().min(1) }).optional(),
  chatId: z.string().min(1).optional(),
  query: z.string().max(500).optional(),
  groupByChat: z.boolean().optional(),
});
export const ConversationContextEntrySchema = z.object({
  runId: id,
  goal: z.string(),
  summary: z.string(),
  status: z.string(),
  createdAt: z.number(),
  included: z.boolean(),
});
export const ConversationContextSchema = z.object({
  chatId: id,
  historyEnabled: z.boolean(),
  entries: z.array(ConversationContextEntrySchema),
});
export type ConversationContext = z.infer<typeof ConversationContextSchema>;
export const RunsContextGetParams = z.object({ chatId: id });
export const RunsContextSetParams = z.object({
  chatId: id,
  historyEnabled: z.boolean().optional(),
  runId: id.optional(),
  included: z.boolean().optional(),
}).refine(value => value.historyEnabled !== undefined || (value.runId && value.included !== undefined), { message: "historyEnabled or runId/included is required" });
export const PreparedConversationSchema = z.object({
  chatId: id, title: z.string(), attachmentCount: z.number().int().positive(), updatedAt: z.number().finite(),
});
export type PreparedConversation = z.infer<typeof PreparedConversationSchema>;
export const ConversationsListParams = z.object({
  workspaceId: id.optional(),
  limit: z.number().int().positive().max(200).default(40),
  before: z.object({ updatedAt: z.number().finite(), chatId: id }).optional(),
  query: z.string().max(500).optional(),
  archived: z.boolean().default(false),
});
export const ConversationRenameParams = z.object({ chatId: id, title: z.string().trim().min(1).max(160) });
export const ConversationArchiveParams = z.object({ chatId: id, archived: z.boolean() });
export const ConversationDeleteParams = z.object({ chatId: id });
export const ConversationAttachmentSchema = z.object({
  sourceUrl: z.string().optional(),
  sourceTruncated: z.boolean().optional(),
  attachmentId: id,
  filename: z.string().min(1).max(255),
  excerpt: z.string().max(1000),
  byteLength: z.number().int().nonnegative(),
  createdAt: z.number(),
  included: z.boolean(),
});
export type ConversationAttachment = z.infer<typeof ConversationAttachmentSchema>;
export const ConversationAttachmentsSchema = z.object({ chatId: id, attachments: z.array(ConversationAttachmentSchema) });
export const ConversationAttachmentAddParams = z.object({
  chatId: id,
  filename: z.string().min(1).max(255).regex(/^[^/\\\x00-\x1f]+\.(txt|md|csv|json|docx|xlsx|pdf)$/i),
  content: z.string().max(512 * 1024).refine(value => !value.includes("\0") && new TextEncoder().encode(value).length <= 512 * 1024, "Use a UTF-8 text document up to 512 KB"),
});
export const ConversationAttachmentControlParams = z.object({ chatId: id, attachmentId: id });
export const ConversationAttachmentToggleParams = ConversationAttachmentControlParams.extend({ included: z.boolean() });
export const ConversationImageSchema = z.object({
  imageId:id, artifactId:id, filename:z.string(), width:z.number().int().positive(), height:z.number().int().positive(),
  byteLength:z.number().int().nonnegative(), sourceUrl:z.string().optional(), createdAt:z.number(), included:z.boolean(),
});
export type ConversationImage = z.infer<typeof ConversationImageSchema>;
const ConversationImagesSchema = z.object({chatId:id,images:z.array(ConversationImageSchema)});
const ConversationImageControl = z.object({chatId:id,imageId:id});
export const ConversationArtifactSchema = z.object({
  artifactId: id,
  runId: id,
  filename: z.string().min(1).max(255),
  mediaType: z.string().min(1).max(120),
  excerpt: z.string().max(1000),
  byteLength: z.number().int().nonnegative(),
  createdAt: z.number(),
  turnGoal: z.string().max(400),
  included: z.boolean(),
});
export type ConversationArtifact = z.infer<typeof ConversationArtifactSchema>;
export const SavedResultSchema = z.object({ artifactId:id,runId:id,chatId:id,filename:z.string(),mediaType:z.string(),byteLength:z.number(),createdAt:z.number(),conversationTitle:z.string(),turnGoal:z.string() });
export type SavedResult = z.infer<typeof SavedResultSchema>;
export const ConversationArtifactsSchema = z.object({ chatId: id, artifacts: z.array(ConversationArtifactSchema) });
export const ConversationArtifactToggleParams = z.object({ chatId: id, artifactId: id, included: z.boolean() });
export const ConversationSourceSchema = z.object({
  sourceId: id,
  runId: id,
  pageId: id,
  url: z.string().url().max(4000),
  title: z.string().max(1000),
  observedAt: z.number(),
  documentEpoch: z.number(),
  revision: z.number(),
});
export type ConversationSource = z.infer<typeof ConversationSourceSchema>;
export const ConversationSourcesSchema = z.object({ chatId: id, sources: z.array(ConversationSourceSchema).max(200) });
export const ConversationWorkspaceSchema = z.object({ memoryPreview: z.string().optional(), browsingPreview: z.string().optional(), chatId: id, taskId: id.optional(), assigned: z.boolean().optional(), workspace: WorkspaceSchema.nullable(), memory: WorkspaceMemorySchema.nullable() });
export const ConversationWorkspaceSetParams = z.object({ chatId: id, workspaceId: id.nullable() });

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
  modelProvider: ModelProviderSchema.optional(),
  modelCredential: ModelCredentialSchema.optional(),
  compatibleEndpoint: z.string().trim().max(2048).optional(),
  gatewayApiKey: z.string().optional(),
  githubCredential: z.string().max(1000).optional(),
  vercelCredential: z.string().max(1000).optional(),
  vercelTeamId: z.string().max(200).optional(),
  vercelProjectId: z.string().max(200).optional(),
  sentryCredential: z.string().max(1000).optional(),
  sentryOrganization: z.string().max(200).optional(),
  sentryProject: z.string().max(200).optional(),
  plannerModel: z.string().optional(),
  recoveryModel: z.string().optional(),
  visionModel: z.string().optional(),
  searchEngine: SearchEngineTemplateSchema.optional(),
  maxWorkers: z.number().int().min(1).max(16).optional(),
  perOrigin: z.number().int().min(1).max(8).optional(),
  /** `0` = no per-run cap. */
  maxModelCalls: z.number().int().min(0).max(256).optional(),
  theme: z.enum(["system", "dark", "light"]).optional(),
  sidebarAppearance: z.enum(["solid", "translucent"]).optional(),
  sidebarBlur: z.number().min(0).max(40).optional(),
  sidebarOpacity: z.number().min(40).max(100).optional(),
  tabLayout: z.enum(["vertical", "horizontal"]).optional(),
  zoomFactor: z.number().optional(),
  /** Vector Engine routing: off (default, Chromium only) | auto (router) | always (engine only). */
  engineMode: EngineModeSchema.optional(),
  /** Origins/hosts qualified for automatic Vector Engine routing. */
  engineCohorts: z.array(z.string().min(1)).max(256).optional(),
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
export const HistoryListParams = z.object({
  query: z.string().max(1000).optional(),
  limit: z.number().int().positive().max(500).default(100),
  since: z.number().finite().nonnegative().optional(),
  before: z.object({ visitedAt: z.number().finite().nonnegative(), url: z.string().min(1) }).optional(),
});
const WebBookmarkSchema = z.object({
  url: z.string().url().max(8192).refine(value => { try { const url=new URL(value); return ["http:","https:"].includes(url.protocol)&&!url.username&&!url.password; } catch { return false; } }, "Use a web address without credentials."),
  title: z.string().max(1000), folderPath: BookmarkFolderPathSchema.optional(),
});
export const BookmarkAddParams = z.object({ url: z.string().url(), title: z.string(), folderPath: BookmarkFolderPathSchema.optional() });
export const BookmarkUpdateParams = BookmarkAddParams.extend({
  originalUrl: z.string().url(),
  url: z.string().max(8192).url().refine(value => { try { const url=new URL(value); return ["http:","https:"].includes(url.protocol)&&!url.username&&!url.password; } catch { return false; } }, "Use a web address without credentials."),
  title: z.string().trim().min(1).max(1000),
  expected: z.object({ title: z.string(), folderPath: BookmarkFolderPathSchema.optional() }),
});
export const BookmarkRemoveParams = z.object({ url: z.string().url() });

export const PageWindowMoveParams = z.object({
  pageId: id,
  activate: z.boolean().optional(),
  windowId: id.optional(),
  spaceId: id,
  folder: z.object({ id: id, name: z.string().max(200), spaceId: id, collapsed: z.boolean() }).optional(),
});
export type PageWindowMove = z.infer<typeof PageWindowMoveParams>;

/** events */
export const EventsSinceParams = RunsEventsParams;

/** workspace snapshot for renderer sync */
export const WorkspaceGetParams = z.object({});

export const MethodSchemas = {
  "tasks.recordEvidence": EvidenceNoteParams,
  "tasks.captureEvidence": EvidenceCaptureParams,
  "tasks.importDocumentEvidence": EvidenceDocumentParams,
  "tasks.importCommandEvidence": EvidenceCommandParams,
  "tasks.prepareLocalCommand": z.object({taskId:z.string().min(1),expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "tasks.reviewCriterion": CriterionReviewParams,
  "tasks.reconcileAction": TaskReconcileParams,
  "tasks.reconcileOperation": TaskReconcileOperationParams,
  "tasks.receipt": z.object({ taskId: id, revision: z.number().int().positive().optional() }),
  "workspaces.create": z.object({ name: z.string().trim().min(1).max(100) }),
  "spaces.list": z.object({}),
  "spaces.import": z.object({ spaces: z.array(SpaceInputSchema).max(500) }),
  "spaces.create": z.object({ name: z.string().trim().min(1).max(100), color: SpaceColorSchema }),
  "spaces.update": z.object({ id: id, name: z.string().trim().min(1).max(100).optional(), color: SpaceColorSchema.optional(), archived: z.boolean().optional() }),
  "workspaces.list": z.object({}),
  "workspaces.browsingMemory.get": z.object({ workspaceId: id }),
  "workspaces.browsingMemory.set": z.object({ workspaceId: id, policy: BrowsingMemoryPolicySchema }),
  "workspaces.browsingMemory.record": z.object({ workspaceId: id, pageId: id, expectedDocumentEpoch: z.number().int().nonnegative() }),
  "workspaces.browsingMemory.forget": z.object({ workspaceId: id, memoryId: id.optional() }),
  "workspaces.memory.get": z.object({ workspaceId: id }),
  "workspaces.memory.search": z.object({query:z.string().trim().min(1).max(1000)}),
  "workspaces.memory.set": z.object({ workspaceId: id, expectedRevision: z.number().int().nonnegative(), content: z.string().max(16_000), enabled:z.boolean().optional(), items:z.array(WorkspaceMemoryItemSchema).max(40).optional(), excludedOrigins:z.array(z.string().max(2048)).max(100).optional() }),
  "tasks.create": TaskCreateParams,
  "tasks.promote": TaskPromoteParams,
  "tasks.update": TaskUpdateParams,
  "tasks.get": z.object({ taskId: id }),
  "tasks.list": z.object({ query:z.string().trim().max(1000).optional(), workspaceId: id.optional(), includeArchived: z.boolean().default(false), limit: z.number().int().min(1).max(500).default(100) }),
  "tasks.archive": z.object({ taskId: id, expectedRevision: z.number().int().positive(), archived: z.boolean() }),
  "tasks.start": RunsStartParams.omit({ goal: true, setId: true }).extend({ taskId: id, expectedRevision: z.number().int().positive() }),
  "development.projects": z.object({taskId:id,expectedRevision:z.number().int().positive()}).strict(),
  "development.inspect": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "development.githubStatus": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "development.operationsStatus": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "development.incidentReport": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),pageId:id}).strict(),
  "development.files": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "development.readFile": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),name:z.string().min(1).max(1024)}).strict(),
  "development.writeFile": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),name:z.string().min(1).max(1024),expectedHash:z.string().regex(/^[a-f0-9]{64}$/),content:z.string().max(256*1024)}).strict(),
  "development.createFile": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),name:z.string().min(1).max(1024),content:z.string().max(256*1024)}).strict(),
  "development.renameFile": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),name:z.string().min(1).max(1024),nextName:z.string().min(1).max(1024),expectedHash:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),
  "development.deleteFile": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),name:z.string().min(1).max(1024),expectedHash:z.string().regex(/^[a-f0-9]{64}$/)}).strict(),
  "development.commands": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "development.runCommand": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),command:z.string().min(1).max(8000),mode:z.enum(['command','service']).default('command')}).strict(),
  "development.openPreview": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),url:z.string().min(1).max(2048)}).strict(),
  "development.stopCommand": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),commandId:z.string().uuid()}).strict(),
  "development.review": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).strict(),
  "development.commit": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid()}).extend(ProjectCommitRequestSchema.shape).strict(),
  "cloud.environments": z.object({taskId:id,expectedRevision:z.number().int().positive()}).strict(),
  "cloud.create": z.object({taskId:id,expectedRevision:z.number().int().positive(),projectId:z.string().uuid(),runtime:z.enum(['universal','node24','node22','python3.13']).default('universal'),region:z.string().regex(/^[a-z]{3}\d$/).default('iad1'),port:z.number().int().min(1024).max(65535).default(3000),timeoutMinutes:z.number().int().min(5).max(45).default(15),cleanupHours:z.number().int().min(1).max(72).default(24)}).strict(),
  "cloud.runCommand": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),executable:z.string().regex(/^[A-Za-z0-9._/+:-]{1,200}$/),args:z.array(z.string().max(2000)).max(100).default([])}).strict(),
  "cloud.startService": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),executable:z.string().regex(/^[A-Za-z0-9._/+:-]{1,200}$/),args:z.array(z.string().max(2000)).max(100).default([]),timeoutMinutes:z.number().int().min(5).max(45).default(15)}).strict(),
  "cloud.commands": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.refreshCommand": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),commandId:z.string().uuid()}).strict(),
  "cloud.stopCommand": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),commandId:z.string().uuid()}).strict(),
  "cloud.refresh": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.resume": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.files": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),path:z.string().max(1024).default('')}).strict(),
  "cloud.readFile": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),path:z.string().min(1).max(1024)}).strict(),
  "cloud.taskResult": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.handoff": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.handoffAndStart": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),executable:z.string().regex(/^[A-Za-z0-9._/+:-]{1,200}$/),args:z.array(z.string().max(2000)).max(100).default([]),timeoutMinutes:z.number().int().min(5).max(45).default(15)}).strict(),
  "cloud.importTaskResult": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.preserveTaskResult": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.downloadResultArtifact": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),artifactPath:z.string().min(1).max(1024),expectedResultUpdatedAt:z.number().int().nonnegative()}).strict(),
  "cloud.openTerminal": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.openPreview": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.exportWorkspace": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.inventory": z.object({taskId:id,expectedRevision:z.number().int().positive()}).strict(),
  "cloud.cleanupOrphan": z.object({taskId:id,expectedRevision:z.number().int().positive(),remoteName:z.string().regex(/^aux-[A-Za-z0-9-]{1,100}$/),expectedUpdatedAt:z.number().int().nonnegative()}).strict(),
  "cloud.forgetMissing": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid(),expectedUpdatedAt:z.number().int().nonnegative()}).strict(),
  "cloud.syncProject": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.stop": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "cloud.delete": z.object({taskId:id,expectedRevision:z.number().int().positive(),environmentId:z.string().uuid()}).strict(),
  "installation.createBackup": z.object({}).strict(),
  "installation.stageRestore": z.object({path:z.string().min(1).max(4096)}).strict(),
  "installation.cancelRestore": z.object({}).strict(),
  "installation.legacyStatus": z.object({}).strict(),
  "installation.migrateLegacy": z.object({confirm:z.literal(true),destination:z.string().min(1).max(4096).optional()}).strict(),
  "vault.status": z.object({}),
  "vault.list": z.object({includeRevoked:z.boolean().default(false)}),
  "vault.save": VaultSaveParams,
  "vault.lock": VaultLockParams,
  "vault.unlock": VaultUnlockParams,
  "vault.grant": VaultGrantParams,
  "vault.revoke": z.object({itemId:id.optional(),grantId:id.optional()}).strict().refine(value=>!!value.itemId||!!value.grantId, "Choose a vault item or grant to revoke"),
  "vault.history": z.object({itemId:id.optional(),limit:z.number().int().min(1).max(200).default(50)}),
  "vault.grants": z.object({taskId:id.optional(),origin:z.string().url().optional()}),
  "routines.list": z.object({workspaceId:id.optional(),includeArchived:z.boolean().default(false),limit:z.number().int().min(1).max(200).default(50)}),
  "routines.get": z.object({routineId:id}),
  "routines.create": RoutineCreateParams,
  "routines.fromResult": RoutineFromResultParams,
  "routines.update": RoutineUpdateParams,
  "routines.pause": z.object({routineId:id,expectedRevision:z.number().int().positive(),paused:z.boolean()}),
  "routines.archive": z.object({routineId:id,expectedRevision:z.number().int().positive(),archived:z.boolean()}),
  "routines.run": RoutineRunParams,
  "routines.runs": z.object({routineId:id,limit:z.number().int().min(1).max(100).default(30)}),
  "routines.reconcile": z.object({routineRunId:id,outcome:z.enum(["applied","not_applied"]),note:z.string().min(1).max(4000)}).strict(),
  "routines.due": z.object({now:z.number().optional()}),
  "agentConnections.list": z.object({}),
  "agentConnections.create": AgentConnectionCreateParams,
  "agentConnections.revoke": z.object({ connectionId: z.string().uuid() }).strict(),
  "pages.list": PagesListParams,
  "pages.open": PagesOpenParams,
  "pages.close": PagesCloseParams,
  "pages.activate": PagesActivateParams,
  "pages.moveToWindow": PageWindowMoveParams,
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
  "runs.retry": RunsControlParams.extend({pageId:id.optional()}),
  "runs.get": RunsGetParams,
  "runs.list": RunsListParams,
  "runs.context.get": RunsContextGetParams,
  "runs.context.set": RunsContextSetParams,
  "conversations.list": ConversationsListParams,
  "conversations.prepared": z.object({}),
  "conversations.get": z.object({chatId:id}),
  "conversations.rename": ConversationRenameParams,
  "conversations.archive": ConversationArchiveParams,
  "conversations.delete": ConversationDeleteParams,
  "conversations.images.get": z.object({chatId:id}),
  "conversations.images.add": z.object({chatId:id,filename:z.string().trim().min(1).max(255).default("Page capture.png"),dataUrl:z.string().max(4_200_000),sourceUrl:z.string().max(8192).optional()}),
  "conversations.images.read": ConversationImageControl,
  "conversations.images.toggle": ConversationImageControl.extend({included:z.boolean()}),
  "conversations.images.remove": ConversationImageControl,
  "conversations.attachments.get": z.object({ chatId: id }),
  "conversations.attachments.read": ConversationAttachmentControlParams,
  "conversations.attachments.add": ConversationAttachmentAddParams,
  "conversations.attachments.page": z.object({ chatId: id, pageId: id, expectedDocumentEpoch: z.number().int().nonnegative() }),
  "conversations.attachments.toggle": ConversationAttachmentToggleParams,
  "conversations.attachments.remove": ConversationAttachmentControlParams,
  "results.search": z.object({query:z.string().trim().min(1).max(300),limit:z.number().int().min(1).max(30).default(12)}),
  "results.read": z.object({artifactId:id}),
  "conversations.artifacts.get": z.object({ chatId: id }),
  "conversations.artifacts.toggle": ConversationArtifactToggleParams,
  "conversations.sources.get": z.object({ chatId: id }),
  "conversations.workspace.get": z.object({ chatId: id }),
  "conversations.workspace.set": ConversationWorkspaceSetParams,
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
  "github.probe": z.object({}),
  "vercel.probe": z.object({}),
  "vercel.projects": z.object({teamId:z.string().max(200).optional()}).strict(),
  "sentry.probe": z.object({}),
  "sentry.projects": z.object({organization:z.string().min(1).max(200)}).strict(),
  "settings.get": SettingsGetParams,
  "settings.set": SettingsSetParams,
  "browser.recovery.list": z.object({}),
  "browser.recovery.retry": z.object({pageId:id}),
  "history.list": HistoryListParams,
  "history.clear": z.object({
    since: z.number().finite().nonnegative().optional(),
    before: z.number().finite().nonnegative().optional(),
  }).strict().refine(value => value.since === undefined || value.before === undefined || value.since <= value.before, "History range must end after it starts"),
  "history.remove": z.object({ url: z.string().min(1), visitedAt: z.number().finite().nonnegative() }),
  "bookmarks.list": z.object({}),
  "bookmarks.folders.list": z.object({}),
  "bookmarks.folders.create": z.object({ path: BookmarkFolderPathSchema.min(1) }),
  "bookmarks.folders.rename": z.object({ path: BookmarkFolderPathSchema.min(1), name: z.string().trim().min(1).max(200) }),
  "bookmarks.folders.remove": z.object({ path: BookmarkFolderPathSchema.min(1) }),
  "bookmarks.add": BookmarkAddParams,
  "bookmarks.update": BookmarkUpdateParams,
  "bookmarks.move": z.object({
    bookmarks: z.array(z.object({ url: z.string().min(1).max(8192), folderPath: BookmarkFolderPathSchema })).min(1).max(10000),
    folderPath: BookmarkFolderPathSchema,
    createFolder: z.boolean().optional(),
  }),
  "bookmarks.import": z.object({ bookmarks: z.array(WebBookmarkSchema).max(10000), folders: z.array(BookmarkFolderPathSchema.min(1)).max(10000).optional() }),
  "bookmarks.saveFolder": z.object({ name:z.string().trim().min(1).max(200), bookmarks:z.array(WebBookmarkSchema.omit({folderPath:true})).min(1).max(10000) }),
  "bookmarks.remove": BookmarkRemoveParams,
  "downloads.list": z.object({}),
  "downloads.remove": z.object({ ids: z.array(z.string().min(1).max(200)).min(1).max(200) }),
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
  "tasks.recordEvidence": TaskEvidenceSchema,
  "tasks.captureEvidence": TaskEvidenceSchema,
  "tasks.importDocumentEvidence": TaskEvidenceSchema,
  "tasks.importCommandEvidence": TaskEvidenceSchema,
  "tasks.prepareLocalCommand": TaskSchema,
  "tasks.reviewCriterion": CriterionReviewSchema,
  "tasks.reconcileAction": z.object({ ok: z.literal(true) }),
  "tasks.reconcileOperation": z.object({ ok: z.literal(true) }),
  "tasks.receipt": TaskReceiptSchema,
  "workspaces.create": WorkspaceSchema,
  "spaces.list": z.array(BrowserSpaceSchema),
  "spaces.import": z.array(BrowserSpaceSchema),
  "spaces.create": z.array(BrowserSpaceSchema),
  "spaces.update": z.array(BrowserSpaceSchema),
  "workspaces.list": z.array(WorkspaceSchema),
  "workspaces.browsingMemory.get": WorkspaceBrowsingMemorySchema,
  "workspaces.browsingMemory.set": WorkspaceBrowsingMemorySchema,
  "workspaces.browsingMemory.record": z.object({ recorded: z.boolean() }),
  "workspaces.browsingMemory.forget": WorkspaceBrowsingMemorySchema,
  "workspaces.memory.get": WorkspaceMemorySchema,
  "workspaces.memory.search": z.array(z.object({workspaceId:id,name:z.string(),excerpt:z.string(),enabled:z.boolean()})),
  "workspaces.memory.set": WorkspaceMemorySchema,
  "tasks.create": TaskSchema,
  "tasks.promote": TaskSchema,
  "tasks.update": TaskSchema,
  "tasks.archive": TaskSchema,
  "tasks.list": z.array(TaskSchema),
  "tasks.get": z.object({ task: TaskSchema, revisions: z.array(TaskSchema), runs: z.array(z.object({ run: RunSchema, currentRevision: z.boolean() })), children:z.array(z.object({task:TaskSchema,depth:z.number().int().min(1).max(4),latestRun:z.object({runId:z.string(),status:z.string(),taskRevision:z.number().int().positive().optional()}).optional(),cloudAuthority:z.object({environmentId:z.string().uuid(),remoteName:z.string()}).optional(),receiptStatus:z.enum(['in_progress','uncertain','accepted','not_met','needs_review']).optional()})).default([]) }),
  "tasks.start": RunSchema,
  "development.projects": z.array(LocalProjectSchema),
  "development.inspect": ProjectInspectionSchema,
  "development.githubStatus": ProjectGithubStatusSchema,
  "development.operationsStatus": z.object({checkedAt:z.number(),vercel:z.object({project:z.object({id:z.string(),name:z.string(),framework:z.string().nullable(),updatedAt:z.number(),teamId:z.string().nullable()}),deployments:z.array(z.object({id:z.string(),name:z.string(),url:z.string().url(),state:z.string(),target:z.string().nullable(),createdAt:z.number(),readyAt:z.number().nullable()}))}).optional(),sentry:z.object({organization:z.string(),project:z.object({id:z.string(),name:z.string(),slug:z.string(),platform:z.string().nullable(),organization:z.string()}),issues:z.array(z.object({id:z.string(),shortId:z.string(),title:z.string(),level:z.string(),status:z.string(),count:z.number(),users:z.number(),firstSeen:z.string(),lastSeen:z.string(),permalink:z.string()}))}).optional(),unavailable:z.array(z.string())}),
  "development.incidentReport": ProjectIncidentReportSchema,
  "development.files": z.array(z.string()),
  "development.readFile": ProjectFileSchema,
  "development.writeFile": ProjectFileSchema.extend({recoveryPath:z.string()}).nullable(),
  "development.createFile": ProjectFileSchema.extend({recoveryPath:z.string().optional()}).nullable(),
  "development.renameFile": ProjectFileSchema.extend({recoveryPath:z.string()}).nullable(),
  "development.deleteFile": z.object({name:z.string(),recoveryPath:z.string()}).nullable(),
  "development.commands": z.array(ProjectCommandSchema),
  "development.runCommand": ProjectCommandSchema.nullable(),
  "development.openPreview": z.object({check:LocalPreviewCheckSchema,page:PageTargetSchema.optional()}).nullable(),
  "development.stopCommand": ProjectCommandSchema,
  "development.review": ProjectReviewSummarySchema,
  "development.commit": ProjectCommitResultSchema.nullable(),
  "cloud.environments": z.array(CloudEnvironmentSchema),
  "cloud.create": CloudEnvironmentSchema,
  "cloud.runCommand": CloudCommandResultSchema,
  "cloud.startService": CloudCommandRecordSchema,
  "cloud.commands": z.array(CloudCommandRecordSchema),
  "cloud.refreshCommand": CloudCommandRecordSchema,
  "cloud.stopCommand": CloudCommandRecordSchema,
  "cloud.refresh": CloudEnvironmentSchema,
  "cloud.resume": CloudEnvironmentSchema,
  "cloud.files": z.array(CloudFileEntrySchema),
  "cloud.readFile": CloudFileSchema,
  "cloud.taskResult": CloudTaskResultSchema.nullable(),
  "cloud.handoff": CloudEnvironmentSchema,
  "cloud.handoffAndStart": z.object({environment:CloudEnvironmentSchema,command:CloudCommandRecordSchema}),
  "cloud.importTaskResult": z.object({evidence:z.array(TaskEvidenceSchema),imported:z.number().int().nonnegative()}),
  "cloud.preserveTaskResult": z.object({result:PreservedCloudResultSchema,preserved:z.boolean()}),
  "cloud.downloadResultArtifact": CloudResultArtifactExportSchema,
  "cloud.openTerminal": CloudTerminalSessionSchema,
  "cloud.openPreview": CloudPreviewSessionSchema,
  "cloud.exportWorkspace": CloudWorkspaceExportSchema,
  "cloud.inventory": CloudProviderInventorySchema,
  "cloud.cleanupOrphan": z.object({remoteName:z.string(),deleted:z.literal(true)}),
  "cloud.forgetMissing": CloudEnvironmentSchema,
  "cloud.syncProject": CloudEnvironmentSchema,
  "cloud.stop": CloudEnvironmentSchema,
  "cloud.delete": CloudEnvironmentSchema,
  "installation.createBackup": z.object({path:z.string(),createdAt:z.number(),bytes:z.number().int().nonnegative(),schemaVersion:z.number().int().positive(),sha256:z.string().regex(/^[a-f0-9]{64}$/),artifactFiles:z.number().int().nonnegative(),missingArtifacts:z.number().int().nonnegative()}),
  "installation.stageRestore": z.object({staged:z.literal(true),schemaVersion:z.number().int().positive(),bytes:z.number().int().nonnegative(),sha256:z.string().regex(/^[a-f0-9]{64}$/),artifactFiles:z.number().int().nonnegative(),missingArtifacts:z.number().int().nonnegative()}),
  "installation.cancelRestore": z.object({cancelled:z.literal(true)}),
  "installation.legacyStatus": z.object({
    source: z.string().nullable(),
    destination: z.string(),
    dualRoots: z.boolean(),
    skippedCredentials: z.boolean(),
    migrated: z.boolean(),
    blockedReason: z.string().optional(),
  }),
  "installation.migrateLegacy": z.object({
    source: z.string(),
    destination: z.string(),
    backup: z.string(),
    copiedDatabase: z.boolean(),
    artifactFiles: z.number().int().nonnegative(),
    skippedCredentials: z.boolean(),
    skipped: z.array(z.string()),
  }),
  "vault.status": VaultStatusSchema,
  "vault.list": z.array(VaultItemSchema),
  "vault.save": VaultItemSchema,
  "vault.lock": VaultStatusSchema,
  "vault.unlock": VaultStatusSchema,
  "vault.grant": VaultGrantSchema,
  "vault.revoke": z.object({ok:z.literal(true)}),
  "vault.history": z.array(VaultAccessRecordSchema),
  "vault.grants": z.array(VaultGrantSchema),
  "routines.list": z.array(RoutineSchema),
  "routines.get": z.object({routine:RoutineSchema,runs:z.array(RoutineRunSchema)}),
  "routines.create": RoutineSchema,
  "routines.fromResult": RoutineSchema,
  "routines.update": RoutineSchema,
  "routines.pause": RoutineSchema,
  "routines.archive": RoutineSchema,
  "routines.run": RoutineRunSchema,
  "routines.runs": z.array(RoutineRunSchema),
  "routines.reconcile": RoutineRunSchema,
  "routines.due": z.array(RoutineRunSchema),
  "agentConnections.list": z.array(AgentConnectionSchema),
  "agentConnections.create": z.object({ connection: AgentConnectionSchema, token: z.string().min(1) }),
  "agentConnections.revoke": AgentConnectionSchema,
  "pages.list": z.array(PageTargetSchema),
  "pages.open": PageTargetSchema,
  "pages.close": z.object({ ok: z.boolean() }),
  "pages.activate": PageTargetSchema,
  "pages.moveToWindow": PageTargetSchema,
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
  "pages.network": z.array(ResponseRecordSchema),
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
  "runs.retry": RunSchema,
  "runs.get": z.object({ run: RunSchema, steps: z.array(StepRecordSchema), modelCalls: z.number(), usage: ModelUsageSummarySchema }),
  "runs.list": z.array(RunSchema),
  "runs.context.get": ConversationContextSchema,
  "runs.context.set": ConversationContextSchema,
  "conversations.list": z.array(ConversationSummarySchema),
  "conversations.prepared": z.array(PreparedConversationSchema),
  "conversations.get": ConversationSummarySchema.nullable(),
  "conversations.rename": ConversationSummarySchema,
  "conversations.archive": ConversationSummarySchema,
  "conversations.delete": z.object({ ok: z.literal(true), deletedRuns: z.number().int().nonnegative() }),
  "conversations.images.get": ConversationImagesSchema,
  "conversations.images.add": ConversationImagesSchema,
  "conversations.images.read": z.object({image:ConversationImageSchema,dataUrl:z.string()}),
  "conversations.images.toggle": ConversationImagesSchema,
  "conversations.images.remove": ConversationImagesSchema,
  "conversations.attachments.get": ConversationAttachmentsSchema,
  "conversations.attachments.read": z.object({ attachment: ConversationAttachmentSchema, content: z.string(), contextCharacters: z.number().int().nonnegative(), contextText: z.string().optional(), contextTotalCharacters: z.number().int().nonnegative().optional() }),
  "conversations.attachments.add": ConversationAttachmentsSchema,
  "conversations.attachments.page": ConversationAttachmentsSchema,
  "conversations.attachments.toggle": ConversationAttachmentsSchema,
  "conversations.attachments.remove": ConversationAttachmentsSchema,
  "results.search": z.array(SavedResultSchema),
  "results.read": z.object({artifactId:id,chatId:id,filename:z.string(),mediaType:z.string(),content:z.string(),createdAt:z.number()}),
  "conversations.artifacts.get": ConversationArtifactsSchema,
  "conversations.artifacts.toggle": ConversationArtifactsSchema,
  "conversations.sources.get": ConversationSourcesSchema,
  "conversations.workspace.get": ConversationWorkspaceSchema,
  "conversations.workspace.set": ConversationWorkspaceSchema,
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
    source: z.enum(["gateway", "static", "configured"]),
  }),
  "models.probe": z.object({
    ok: z.boolean(),
    modelId: z.string(),
    latencyMs: z.number().optional(),
    vision: z.boolean().optional(),
    error: z.string().optional(),
  }),
  "github.probe": z.object({login:z.string(),accountId:z.number().int(),name:z.string().nullable(),avatarUrl:z.string().url(),scopes:z.array(z.string()),checkedAt:z.number()}),
  "vercel.probe": z.object({user:z.object({id:z.string(),name:z.string(),email:z.string()}),teams:z.array(z.object({id:z.string(),name:z.string(),slug:z.string()})),checkedAt:z.number()}),
  "vercel.projects": z.array(z.object({id:z.string(),name:z.string(),framework:z.string().nullable(),updatedAt:z.number(),teamId:z.string().nullable()})),
  "sentry.probe": z.object({organizations:z.array(z.object({id:z.string(),name:z.string(),slug:z.string(),regionUrl:z.string().url()})),checkedAt:z.number()}),
  "sentry.projects": z.array(z.object({id:z.string(),name:z.string(),slug:z.string(),platform:z.string().nullable(),organization:z.string()})),
  "settings.get": z.record(z.string(), z.unknown()),
  "settings.set": z.object({ ok: z.boolean() }),
  "browser.recovery.list": z.array(z.object({pageId:id,url:z.string(),title:z.string(),windowId:id,error:z.string().optional(),retrying:z.boolean()})),
  "browser.recovery.retry": z.object({ok:z.boolean(),pageId:id}),
  "history.list": z.array(HistoryEntrySchema),
  "history.clear": z.object({ ok: z.boolean(), removed: z.number().int().nonnegative() }),
  "history.remove": z.object({ removed: z.boolean() }),
  "bookmarks.list": z.array(BookmarkSchema),
  "bookmarks.folders.list": z.array(BookmarkFolderPathSchema),
  "bookmarks.folders.create": z.array(BookmarkFolderPathSchema),
  "bookmarks.folders.rename": z.array(BookmarkFolderPathSchema),
  "bookmarks.folders.remove": z.array(BookmarkFolderPathSchema),
  "bookmarks.add": z.object({ ok: z.boolean() }),
  "bookmarks.update": z.object({ ok: z.boolean() }),
  "bookmarks.move": z.object({ moved: z.number().int().nonnegative() }),
  "bookmarks.import": z.object({ added: z.number().int(), skipped: z.number().int() }),
  "bookmarks.saveFolder": z.object({ added: z.number().int(), skipped: z.number().int() }),
  "bookmarks.remove": z.object({ ok: z.boolean() }),
  "downloads.list": z.array(DownloadSchema),
  "downloads.remove": z.object({ removed: z.array(z.string()) }),
  "workspace.get": z.object({
    restoringTabs:z.boolean().optional(),
    pendingRestoreTabs:z.array(z.object({pageId:id,windowId:id})).optional(),
    tabPlacements: z.record(z.string(), PageWindowMoveParams.pick({ spaceId: true, folder: true })).optional(),
    pages: z.array(PageTargetSchema),
    sets: z.array(PageSetSchema),
    members: z.array(SetMemberSchema),
    runs: z.array(RunSchema),
    sessions: z.array(BrowserSessionSchema),
    activePageId: z.string().nullable(),
    lastSeq: z.number(),
  }),
  "bench.run": z.object({ reportPath: z.string() }),
  "responses.list": z.array(ResponseRecordSchema),
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

export type MethodParams<M extends MethodName> = z.input<(typeof MethodSchemas)[M]>;
export type MethodResult<M extends MethodName> = z.output<(typeof ResultSchemas)[M]>;
