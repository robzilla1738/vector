import { SafetyDispatchGate } from "../../safety/dispatch.js";
import { createServiceContainer, type ServiceContainer } from "../../services/container.js";
import { EffectRequestSchema, TaskReadProvenanceSchema, type ValidatedTaskRead } from "@aux/contracts";
import { AgentCodeMode } from "../../agent/code-mode.js";
import type { AgentConnectionScope, AuxEvent, AuxFeatureHost, AuxFeatureOverrides } from "@aux/contracts";
import type { AgentConnectionService } from "../../services/agent-connections.js";
import { AgentTurnTabs } from "../../agent/turn-tabs.js";
import { ApprovalStore } from "../../safety/approval.js";
import type { ArtifactStore } from "../../services/artifacts.js";
import { AuxError, OriginRuleSchema } from "@aux/contracts";
import { BROWSING_CONTEXT_MARKER, BrowsingMemory } from "../../services/browsing-memory.js";
import { BrowserImporter } from "../../services/browser-import.js";
import type { CalendarConnectionService } from "../../services/calendar-connections.js";
import { CommandRankingStore } from "../../services/command-ranking.js";
import { ConnectorCatalogService } from "../../services/connectors.js";
import { ContentMemoryStore } from "../../services/content-memory.js";
import { DecisionJournal } from "../../safety/decide.js";
import type { DriverSet, PageService } from "../../services/pages.js";
import type { EventBus } from "../../events.js";
import { GoalService } from "../../services/goals.js";
import { HistoryProjection } from "../../services/history-projection.js";
import { HookService, type HookExecutor } from "../../services/hooks.js";
import type { McpTransportProvider } from "../../services/outbound-mcp.js";
import type { MemoryPipeline } from "../../services/memory-pipeline.js";
import type { NativeBridge } from "../../native.js";
import type { OperationService } from "../../services/operations.js";
import { OutboundMcpService } from "../../services/outbound-mcp.js";
import { PluginService } from "../../services/plugins.js";
import type { Repo } from "../../store/repo.js";
import type { ResponseStore } from "../../services/responses.js";
import { RoutineService } from "../../services/routines.js";
import {
  requireRoutineTriggerPage,
  selectSkillReplayPage,
  startSkillReplay,
} from "../../services/skill-replay.js";
import type { RunService } from "../../services/runs.js";
import { WorkspaceFolderService } from "../../services/workspace-folders.js";
import { SafetyAuditStore } from "../../safety/audit.js";
import type { SetService } from "../../services/sets.js";
import type { SettingsService } from "../../services/settings.js";
import { SiteCustomization } from "../../services/site-customization.js";
import { SpaceService } from "../../services/spaces.js";
import type { StateService } from "../../services/state.js";
import { SubagentService } from "../../services/subagents.js";
import { SuspensionStore } from "../../safety/suspensions.js";
import { TaskEvidenceService } from "../../services/task-evidence.js";
import { TaskService } from "../../services/tasks.js";
import type { Tracer } from "../../services/tracing.js";
import { TranslateService } from "../../services/translate.js";
import { VaultService } from "../../services/vault.js";
import { ZapService } from "../../services/zap.js";
import { createHash } from "node:crypto";
import type { MethodName } from "@aux/contracts";
import type { McpOAuthService } from "../../services/mcp-oauth.js";

export interface Services {
  auxPackages?: import("../../services/aux-package-library.js").AuxPackageLibrary;
  turnTabs?: AgentTurnTabs;
  /** Advertise registered optional factories without constructing their services. */
  serviceAvailable?: (name: "responses" | "operations" | "state" | "tracer") => boolean;
  turnMentions: import("../../services/turn-mention-service.js").TurnMentionService;
  budgets?: import("../../services/budgets.js").BudgetsService;
  clock?: import("@aux/contracts").Clock;
  featureHost?: AuxFeatureHost;
  featureProfileId?: string;
  featureStages?: Promise<AuxFeatureOverrides>;
  nativeIdentity?: Promise<import("@aux/contracts/host-methods").HostCapabilities>;
  runtimeIdentity?: import("../runtime-identity.js").RuntimeIdentity | null;
  safetyGate?: SafetyDispatchGate;
  approvals?: ApprovalStore;
  suspensions?: SuspensionStore;
  safetyAudit?: SafetyAuditStore;
  decisions?: DecisionJournal;
  pages: PageService;
  sets: SetService;
  runs: RunService;
  goals?: GoalService;
  artifacts: ArtifactStore;
  settings: SettingsService;
  events: EventBus;
  repo: Repo;
  agentConnections?: AgentConnectionService;
  installCli?: (owner: string) => Promise<import("@aux/contracts").MethodResult<"developer.cli.install">>;
  installAgentConnection?: (
    input: unknown,
    owner: string,
  ) => Promise<import("@aux/contracts").MethodResult<"agentConnections.install">>;
  /** S6.7 — scoped connections own first-class session runs. */
  externalSessions?: import("../../services/external-sessions.js").ExternalSessionService;
  mcpTransportProvider?: McpTransportProvider;
  mcpOAuth?: McpOAuthService;
  outboundMcp?: OutboundMcpService;
  hooks?: HookService;
  hookExecutor?: HookExecutor;
  workspaceFolders?: WorkspaceFolderService;
  coderWorktrees?: import("../../services/coder-worktree-operations.js").CoderWorktreeOperations;
  codingFiles?: import("../../services/coding-files.js").CodingFilesService;
  codingProcesses?: import("../../services/coding-processes.js").CodingProcesses;
  projects?: import("../../services/projects.js").ProjectsService;
  terminals?: import("../../services/terminals.js").TerminalService;
  /** Shared with the agent loop's REPL cell surface — created once in main.ts. */
  subagents?: SubagentService;
  calendar?: CalendarConnectionService;
  native?: NativeBridge;
  downloadsDir?: string;
  contentMemory?: ContentMemoryStore;
  memoryPipeline?: MemoryPipeline;
  checkpointDeletedData?: () => void;
  vault?: VaultService;
  routines?: RoutineService;
  zap?: ZapService;
  responses?: ResponseStore;
  operations?: OperationService;
  state?: StateService;
  tracer?: Tracer;
  drivers: () => DriverSet;
  importCookies: (opts: { source?: "auto" | "profile" }) => Promise<unknown>;
  browserImport?: BrowserImporter;
  benchRun: (task?: string, repeats?: number) => Promise<unknown>;
}

const browserImporters = new WeakMap<Services, BrowserImporter>();

/** Native-only fallback for explicit fixtures; production supplies one lazy Profile importer. */
export function browserImporter(s: Services): BrowserImporter {
  if (s.browserImport) return s.browserImport;
  const existing = browserImporters.get(s);
  if (existing) return existing;
  const importer = new BrowserImporter({
    repo: s.repo,
    native: s.native,
    emit: (type, payload) => s.events.emit(type, payload),
  });
  browserImporters.set(s, importer);
  return importer;
}

export interface ClientCtx {
  external: boolean;
  /** Original native local-person invocation; supplied only by authenticated api.invoke. */
  nativePersonResume?: string;
  /** Private original local native owner intent; never API params. */
  nativeRunResume?: string;
  /** Opaque original Aux window/document capability supplied only by native api.invoke. */
  nativeTurnContext?: string;
  connectionId?: string;
  scope?: AgentConnectionScope;
  codeMode?: true;
}

export type InvokeFn = (method: string, params: unknown, client?: ClientCtx) => Promise<unknown>;

export type MethodDeps = Omit<ReturnType<typeof buildMethodDeps>, "dispose">;

export interface MethodCtx extends MethodDeps {
  taskRead?: ValidatedTaskRead;
  method: MethodName;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any;
  client: ClientCtx;
  scope?: AgentConnectionScope;
  host: NonNullable<Services["featureHost"]>;
  invoke: InvokeFn;
  /** S6.7 session run for scoped external connections — approval/provenance anchor. */
  externalRunId?: string;
  withExternalPage: <T>(
    pageId: string,
    action: () => Promise<T>,
    taskId?: string,
    internalAutomation?: boolean,
    transmission?: "required" | "none",
  ) => Promise<T>;
}

export type MethodHandler = (ctx: MethodCtx) => Promise<unknown>;

/** Per-invoker collaborators shared by every domain handler. */
interface MethodCollaborators {
  outboundMcp: OutboundMcpService;
  subagents: SubagentService;
  customization: SiteCustomization;
  commandRanking: CommandRankingStore;
  tasks: TaskService;
  connectorCatalog: ConnectorCatalogService;
  browsingMemory: BrowsingMemory;
  spaces: SpaceService;
  taskEvidence: TaskEvidenceService;
  vault: VaultService;
  translate: TranslateService;
  safetyAudit: SafetyAuditStore;
  safetyGate: SafetyDispatchGate;
  approvals: ApprovalStore;
  suspensions: SuspensionStore;
  decisions: DecisionJournal;
  routines: RoutineService;
  plugins: PluginService;
  goals: GoalService;
  hooks: HookService;
  workspaceFolders: WorkspaceFolderService;
  zap: ZapService;
  turnTabs: AgentTurnTabs;
  codeMode: AgentCodeMode;
  historyProjection: HistoryProjection;
}

export function buildMethodDeps(s: Services, invoke: InvokeFn) {
  const container: ServiceContainer<MethodCollaborators> = createServiceContainer<MethodCollaborators>({
    outboundMcp: () => s.outboundMcp ?? new OutboundMcpService(s.repo, s.mcpTransportProvider),
    subagents: () => s.subagents ?? new SubagentService(s.repo, s.events, s.runs),
    customization: () => new SiteCustomization(s.repo.db, s.featureProfileId ?? "default"),
    commandRanking: () => new CommandRankingStore(s.repo, s.featureProfileId ?? "default"),
    tasks: () => new TaskService(s.repo, s.events),
    connectorCatalog: () =>
      new ConnectorCatalogService({
        repo: s.repo,
        tasks: d.tasks,
        settings: s.settings,
        calendar: s.calendar,
        mcp: d.outboundMcp,
      }),
    browsingMemory: () => new BrowsingMemory(s.repo),
    spaces: () => new SpaceService(s.repo, s.events),
    taskEvidence: () => new TaskEvidenceService(s.repo, s.events, s.pages, s.native, s.downloadsDir),
    vault: () => s.vault ?? new VaultService(s.repo, s.native),
    translate: () => new TranslateService(s.settings),
    safetyAudit: () => s.safetyAudit ?? new SafetyAuditStore(s.repo.db),
    approvals: () =>
      s.approvals ??
      new ApprovalStore(
        s.repo.db,
        (event) => d.safetyAudit.record(event),
        (action, scope) => s.settings.allowAgentSite(action, scope),
        () => s.settings.agentPolicy(),
        (runId) => s.repo.getRun(runId),
        s.repo,
      ),
    suspensions: () =>
      s.suspensions ?? new SuspensionStore(s.repo.db, (event) => d.safetyAudit.record(event)),
    decisions: () => s.decisions ?? new DecisionJournal(s.repo.db),
    safetyGate: () =>
      s.safetyGate ??
      new SafetyDispatchGate({
        approvals: d.approvals,
        journal: d.decisions,
        suspensions: d.suspensions,
        managedRules: () => OriginRuleSchema.array().parse(s.repo.getSetting("managedOriginPolicies") ?? []),
        agentPolicy: () => s.settings.agentPolicy(),
        audit: (event) => d.safetyAudit.record({ ...event }),
        onConfirmation: (confirmation) => s.events.emit("safety.confirmation", confirmation),
      }),
    routines: () =>
      s.routines ??
      new RoutineService(
        s.repo,
        s.events,
        async (routine, parameters, context) => {
          if (!routine.sourceTaskId)
            throw new AuxError(
              "conflict",
              "This routine has no saved task. Run it from a conversation in Aux.",
            );
          const details = d.tasks.details(routine.sourceTaskId);
          const pageIds = details.task.resources
            .filter((resource) => resource.kind === "page")
            .map((resource) => resource.locator)
            .filter((pageId) => {
              try {
                return s.pages.isAttached(pageId);
              } catch {
                return false;
              }
            });
          if (context?.triggerPageId) {
            if (routine.trigger.kind !== "page_change" || context.triggerDocumentEpoch === undefined)
              throw new AuxError("conflict", "The page-change occurrence lost its exact document binding.");
            const triggerUrl = routine.trigger.url;
            const inTask = details.task.resources.some(
              (resource) =>
                (resource.kind === "page" && resource.locator === context.triggerPageId) ||
                (resource.kind === "url" && resource.locator === triggerUrl),
            );
            if (!inTask)
              throw new AuxError("conflict", "The watched tab left the source task's reviewed scope.");
            pageIds.splice(
              0,
              pageIds.length,
              requireRoutineTriggerPage(
                s.pages,
                context.triggerPageId,
                triggerUrl,
                context.triggerDocumentEpoch,
              ),
            );
          }
          if (!pageIds.length)
            throw new AuxError(
              "conflict",
              "Attach an open browser tab to the source task before this routine can run.",
            );
          if (routine.replay) {
            const pageId = selectSkillReplayPage(s.pages, pageIds, routine.replay.siteOrigin);
            const started = startSkillReplay({
              repo: s.repo,
              pages: s.pages,
              events: s.events,
              routine,
              pageId,
              parameters,
              expectedDocumentEpoch: context?.triggerDocumentEpoch,
            });
            return { chatId: details.task.conversationId, runId: started.runId };
          }
          const prepared = d.tasks.prepareRun(routine.sourceTaskId, details.task.revision);
          const run = await s.runs.start({
            ...prepared,
            goal: [
              substituteRoutine(routine.objective, parameters),
              routine.outputHint ? `Expected output: ${routine.outputHint}` : undefined,
            ]
              .filter(Boolean)
              .join("\n\n"),
            pageIds,
            accountLabels: routine.accountLabels.length ? routine.accountLabels : undefined,
            calendarGrantIds: routine.calendarGrantIds,
          });
          return { chatId: run.config?.chatId ?? details.task.conversationId, runId: run.runId };
        },
        async (runId) => {
          await s.runs.cancel(runId, "The original routine changed during launch.");
        },
      ),
    plugins: () => new PluginService(s.repo, d.routines),
    goals: () => s.goals ?? new GoalService(s.repo, s.runs),
    hooks: () => s.hooks ?? new HookService(s.repo),
    workspaceFolders: () => s.workspaceFolders ?? new WorkspaceFolderService(s.repo),
    zap: () => s.zap ?? new ZapService(s.repo, s.native, s.featureProfileId ?? "default"),
    turnTabs: () =>
      s.turnTabs ??
      new AgentTurnTabs(s.pages, (page) => {
        s.repo.upsertPage({ ...page, ownedByRuntime: false });
        page.ownedByRuntime = false;
        void s.pages.activate(page.pageId).catch(() => {});
      }),
    codeMode: () =>
      new AgentCodeMode((method, params, client) =>
        invoke(
          method,
          params,
          client as {
            external: boolean;
            connectionId?: string;
            scope?: AgentConnectionScope;
            codeMode?: true;
          },
        ),
      ),
    historyProjection: () => new HistoryProjection(s.repo, s.featureProfileId ?? "default"),
  });
  const d: MethodCollaborators = container.services;

  const revokeWorkspaceContext = async (workspaceId: string, browsingOnly: boolean) => {
    const rows = s.repo.db
      .prepare(
        `SELECT run_id AS runId FROM runs
      WHERE status IN ('queued','planning','running','paused','needs_input')
      AND json_extract(CASE WHEN json_valid((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id)) THEN (SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id) ELSE '{}' END,'$.contextWorkspaceId')=?`,
      )
      .all(workspaceId) as { runId: string }[];
    for (const row of rows) {
      const config = s.repo.getRun(row.runId)?.config ?? {};
      // Older run snapshots predate the structured provenance flag.
      if (
        !browsingOnly ||
        config.contextBrowsingMemory ||
        (config.contextBrowsingMemory === undefined && config.context?.includes(BROWSING_CONTEXT_MARKER))
      )
        await s.runs.cancel(
          row.runId,
          "Workspace context changed before this turn finished. Review and retry with current sources.",
        );
    }
  };
  const revokeArticleRuns = async (workspaceId: string, memoryId?: string) => {
    const rows = s.repo.db
      .prepare(
        `SELECT run_id AS runId FROM runs
      WHERE status IN ('queued','planning','running','paused','needs_input')
      AND json_extract(CASE WHEN json_valid((SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id)) THEN (SELECT config FROM run_lookup WHERE run_lookup.run_id=runs.run_id) ELSE '{}' END,'$.contextWorkspaceId')=?`,
      )
      .all(workspaceId) as { runId: string }[];
    for (const row of rows) {
      const ids = s.repo.getRun(row.runId)?.config?.contextMemoryIds;
      if (ids?.length && (!memoryId || ids.includes(memoryId)))
        await s.runs.cancel(
          row.runId,
          "A selected saved article was forgotten or its access changed. Start a new turn with current sources.",
        );
    }
  };

  /**
   * RPC-callable egress goes through decide() like page effects. RPC callers
   * have no approval UI, so asks collapse to a deny-with-refusal; standing
   * grants and origin rules (managed in Aux) are the consent path.
   */
  const decideEgress = async (input: {
    url: URL;
    action: string;
    taskId?: string;
    connectionId?: string;
    threadId?: string;
    runId?: string;
    actor?: import("@aux/contracts").EffectActor;
    invocationDigest?: string;
    dataClasses?: import("@aux/contracts").EffectRequest["dataClasses"];
    provenance?: import("@aux/contracts").EffectProvenance;
  }) => {
    const threadId = input.threadId ?? `rpc:${input.connectionId ?? "internal"}`;
    const request = EffectRequestSchema.parse({
      profileId: s.featureProfileId ?? "default",
      scope: input.taskId
        ? { kind: "task" as const, id: input.taskId }
        : { kind: "workspace" as const, id: "rpc" },
      actor: input.actor ?? "external_token",
      effect: "egress",
      category:
        input.action === "agent.web.fetch" || input.action === "agent.web.search"
          ? "read"
          : input.action === "agent.turn.open"
            ? "navigate"
            : "external_tool",
      action: input.action,
      origin: input.url.origin,
      destination: input.url.href.slice(0, 2048),
      dataClasses: input.dataClasses ?? [],
      provenance: input.provenance ?? "template",
      invocationDigest:
        input.invocationDigest ??
        createHash("sha256")
          .update(JSON.stringify([input.action, input.url.href]))
          .digest("hex"),
      turnId: threadId,
      threadId,
      ...(input.runId ? { runId: input.runId } : {}),
      requestedAt: Date.now(),
    });
    const authorizedBy = await d.safetyGate.checkTrustedEffect(request, {
      profileId: request.profileId,
      scope: request.scope,
      actor: request.actor,
      turnId: threadId,
      threadId,
      ...(input.runId ? { runId: input.runId } : {}),
    });
    if (!authorizedBy)
      throw new AuxError("permission_denied", "This egress has no current policy authorization.");
    return { status: "allow" as const, authorizedBy };
  };
  const substituteRoutine = (objective: string, parameters: Record<string, string>) =>
    objective.replace(/\{\{([A-Za-z][A-Za-z0-9_]{0,40})\}\}/g, (_, name: string) => parameters[name] ?? "");

  const scopedTasks = (scope: AgentConnectionScope) =>
    scope.kind === "task"
      ? d.tasks.descendants(scope.taskId)
      : d.tasks.list({ workspaceId: scope.workspaceId, includeArchived: true, limit: 500 });
  const sessionPageIds = (sessionId: string): Set<string> =>
    new Set(
      s.pages
        .list()
        .filter((page) => page.sessionId === sessionId)
        .map((page) => page.pageId),
    );
  const requireScopedTask = (scope: AgentConnectionScope, taskId: string) => {
    const task = d.tasks.get(taskId);
    const allowed =
      scope.kind === "task"
        ? scopedTasks(scope).some((candidate) => candidate.taskId === task.taskId)
        : task.workspaceId === scope.workspaceId;
    if (!allowed) throw new AuxError("permission_denied", "This connection is not authorized for that task");
    return task;
  };
  // Pages a scope's tasks authorize. Building the set reads every task's
  // details, so it is cached per scope: dropped on any task or run event and
  // rebuilt at most once a second otherwise. Preview grants are read live.
  const taskPages = new Map<string, { at: number; taskIds: Set<string>; pages: Set<string> }>();
  const stopTracking = s.events.subscribe((event) => {
    if (event.type.startsWith("task.") || event.type.startsWith("run.") || event.type.startsWith("page."))
      taskPages.clear();
  });

  const scopedPageIds = (scope: AgentConnectionScope, connectionId?: string): Set<string> => {
    const key = JSON.stringify(scope);
    let cached = taskPages.get(key);
    if (!cached || Date.now() - cached.at > 1_000) {
      cached =
        scope.kind === "session"
          ? {
              at: Date.now(),
              taskIds: new Set(scopedTasks(scope).map((task) => task.taskId)),
              pages: sessionPageIds(scope.sessionId),
            }
          : {
              at: Date.now(),
              taskIds: new Set(scopedTasks(scope).map((task) => task.taskId)),
              pages: new Set(
                scopedTasks(scope).flatMap((task) => {
                  const resources = task.resources
                    .filter((resource) => resource.kind === "page")
                    .map((resource) => resource.locator);
                  const runs = d.tasks
                    .details(task.taskId)
                    .runs.filter((item) => item.currentRevision)
                    .flatMap((item) => item.run.pageIds);
                  return [...resources, ...runs];
                }),
              ),
            };
      taskPages.set(key, cached);
    }
    return connectionId ? new Set([...cached.pages, ...d.turnTabs.pageIds(connectionId)]) : cached.pages;
  };
  /** Task ids a scope covers (workspace/session → workspace tasks; task → subtree). */
  const scopedTaskIds = (scope: AgentConnectionScope): Set<string> => {
    scopedPageIds(scope); // fills the shared index
    return taskPages.get(JSON.stringify(scope))?.taskIds ?? new Set();
  };
  const taskWorkspace = new Map<string, { at: number; workspaceId?: string }>();
  const runRefs = new Map<string, { at: number; taskId?: string; pageIds: string[] }>();
  const taskWorkspaceId = (taskId: string): string | undefined => {
    const hit = taskWorkspace.get(taskId);
    if (hit && Date.now() - hit.at < 60_000) return hit.workspaceId;
    const row = s.repo.db.prepare("SELECT workspace_id FROM tasks WHERE task_id=?").get(taskId) as
      { workspace_id: string } | undefined;
    taskWorkspace.set(taskId, { at: Date.now(), workspaceId: row?.workspace_id });
    return row?.workspace_id;
  };
  const runScopeRefs = (runId: string): { taskId?: string; pageIds: string[] } | undefined => {
    const hit = runRefs.get(runId);
    if (hit && Date.now() - hit.at < 1_000) return hit;
    const row = s.repo.getRun(runId);
    if (!row) return undefined;
    const taskId = row.config?.taskId;
    const pageIds = row.pageIds;
    const refs = { at: Date.now(), taskId, pageIds };
    runRefs.set(runId, refs);
    return refs;
  };
  /**
   * Whether a durable event is inside a scoped connection's view. Events carry
   * heterogeneous references — resolve task/page/workspace/run refs (the run
   * object on run.* events resolves inline; runId-only refs hit the store with
   * a small cache). Events with no resolvable reference are owner-level signals
   * and stay invisible to scoped clients; task scopes never widen to the
   * workspace on a bare workspaceId match.
   */
  const eventVisible = (
    scope: AgentConnectionScope,
    connectionId: string | undefined,
    event: AuxEvent,
  ): boolean => {
    const pages = scopedPageIds(scope, connectionId);
    const taskIds = scopedTaskIds(scope);
    const p = (event.payload ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : undefined);
    const runObj = (p.run ?? undefined) as
      { runId?: string; pageIds?: string[]; config?: { taskId?: string } } | undefined;
    const taskObj = (p.task ?? undefined) as { taskId?: string; workspaceId?: string } | undefined;
    const seenTaskIds = new Set<string>();
    const workspaceIds = new Set<string>();
    const taskHit = (taskId: string | undefined): boolean => {
      if (!taskId || seenTaskIds.has(taskId)) return false;
      seenTaskIds.add(taskId);
      if (taskIds.has(taskId)) return true;
      const ws = taskWorkspaceId(taskId);
      if (ws) workspaceIds.add(ws);
      return false;
    };
    const runHit = (refs: { taskId?: string; pageIds?: string[] } | undefined): boolean => {
      if (!refs) return false;
      return refs.pageIds?.some((id) => pages.has(id)) || taskHit(refs.taskId);
    };
    if (str(p.workspaceId)) workspaceIds.add(str(p.workspaceId)!);
    if (taskObj?.workspaceId) workspaceIds.add(taskObj.workspaceId);
    if (taskHit(str(p.taskId)) || taskHit(taskObj?.taskId)) return true;
    if (runHit(runObj ? { taskId: runObj.config?.taskId, pageIds: runObj.pageIds } : undefined)) return true;
    for (const runId of [event.runId, str(p.runId)]) {
      if (runId && runHit(runScopeRefs(runId))) return true;
    }
    const pageId = str(p.pageId);
    if (pageId && pages.has(pageId)) return true;
    return scope.kind !== "task" && workspaceIds.has(scope.workspaceId);
  };
  const requireScopedPage = (scope: AgentConnectionScope, pageId: string, connectionId?: string) => {
    if (!scopedPageIds(scope, connectionId).has(pageId))
      throw new AuxError("permission_denied", "Attach this page to the authorized task before using it");
  };
  const captureScopedPageSource = (scope: AgentConnectionScope, pageId: string, connectionId?: string) => {
    requireScopedPage(scope, pageId, connectionId);
    const sources = scopedTasks(scope)
      .filter((task) => task.state === "open")
      .flatMap((task) => {
        const preview = !!connectionId && d.turnTabs.owns(connectionId, task.taskId, pageId);
        const attached =
          task.resources.some((resource) => resource.kind === "page" && resource.locator === pageId) ||
          d.tasks
            .details(task.taskId)
            .runs.some((item) => item.currentRevision && item.run.pageIds.includes(pageId));
        return attached || preview
          ? [{ taskId: task.taskId, revision: task.revision, sourceOrigin: task.sourceOrigin, preview }]
          : [];
      });
    const session = scope.kind === "session" && sessionPageIds(scope.sessionId).has(pageId);
    if (!sources.length && !session)
      throw new AuxError("permission_denied", "The person-approved source page is no longer authorized.");
    return () => {
      requireScopedPage(scope, pageId, connectionId);
      if (session && scope.kind === "session" && sessionPageIds(scope.sessionId).has(pageId)) return;
      const current = sources.some((source) => {
        const task = d.tasks.get(source.taskId);
        if (
          task.revision !== source.revision ||
          task.sourceOrigin !== source.sourceOrigin ||
          task.state !== "open"
        )
          return false;
        const preview =
          source.preview && !!connectionId && d.turnTabs.owns(connectionId, task.taskId, pageId);
        try {
          d.tasks.preparePageAccess(task.taskId, source.revision, pageId, false, preview);
          return true;
        } catch (error) {
          if (error instanceof AuxError && (error.code === "permission_denied" || error.code === "conflict"))
            return false;
          throw error;
        }
      });
      if (!current)
        throw new AuxError(
          "permission_denied",
          "The source task revision or page approval changed during this tool call.",
        );
    };
  };
  const captureScopedTaskRead = (
    scope: AgentConnectionScope,
    pageId: string,
    runId: string,
    connectionId?: string,
  ): ValidatedTaskRead | undefined => {
    const run = s.repo.getRun(runId);
    const taskId = run?.config?.taskId;
    if (!taskId || run.config?.implementation !== "external-agent") return undefined;
    const task = d.tasks.get(taskId);
    if (task.state !== "open" || task.revision !== run.config.taskRevision) return undefined;
    const page = s.pages.get(pageId);
    if (!page.sessionId) throw new AuxError("target_detached", "The task read attachment is unavailable.");
    const resource = task.resources.find((item) => item.kind === "page" && item.locator === pageId);
    const preview = !!connectionId && d.turnTabs.owns(connectionId, taskId, pageId);
    const taskRun =
      !resource && !preview
        ? d.tasks
            .details(taskId)
            .runs.find((item) => item.currentRevision && item.run.pageIds.includes(pageId))
        : undefined;
    if (!resource && !preview && !taskRun) return undefined;
    const provenance = TaskReadProvenanceSchema.parse({
      authorizedBy: "task_resource",
      taskId,
      taskRevision: task.revision,
      pageId,
      sessionId: page.sessionId,
      documentEpoch: page.documentEpoch,
      sourceOrigin: task.sourceOrigin,
      source: resource
        ? { kind: "resource", resourceId: resource.resourceId }
        : preview
          ? { kind: "preview", connectionId }
          : { kind: "task_run", runId: taskRun!.run.runId },
    });
    const sourceCheck = captureScopedPageSource(scope, pageId, connectionId);
    const check = () => {
      sourceCheck();
      const current = d.tasks.get(taskId),
        currentRun = s.repo.getRun(runId),
        currentPage = s.pages.get(pageId);
      if (
        !currentRun ||
        !["running", "planning", "needs_input"].includes(currentRun.status) ||
        currentRun.config?.taskId !== taskId ||
        currentRun.config?.taskRevision !== provenance.taskRevision ||
        current.revision !== provenance.taskRevision ||
        current.state !== "open" ||
        current.sourceOrigin !== provenance.sourceOrigin ||
        currentPage.sessionId !== provenance.sessionId ||
        currentPage.documentEpoch !== provenance.documentEpoch ||
        currentPage.url !== page.url
      )
        throw new AuxError("permission_denied", "The person-approved task read source changed.");
      const source = provenance.source;
      const exists =
        source.kind === "resource"
          ? current.resources.some(
              (item) =>
                item.resourceId === source.resourceId && item.kind === "page" && item.locator === pageId,
            )
          : source.kind === "preview"
            ? d.turnTabs.owns(source.connectionId, taskId, pageId)
            : d.tasks
                .details(taskId)
                .runs.some(
                  (item) =>
                    item.currentRevision &&
                    item.run.runId === source.runId &&
                    item.run.pageIds.includes(pageId),
                );
      if (!exists) throw new AuxError("permission_denied", "This task read resource was revoked.");
    };
    check();
    return { provenance, check };
  };

  let disposal: Promise<void> | undefined;
  const helpers = {
    s,
    revokeWorkspaceContext,
    revokeArticleRuns,
    decideEgress,
    substituteRoutine,
    scopedTasks,
    sessionPageIds,
    requireScopedTask,
    scopedPageIds,
    scopedTaskIds,
    taskWorkspaceId,
    runScopeRefs,
    eventVisible,
    requireScopedPage,
    captureScopedPageSource,
    captureScopedTaskRead,
    endConnection: (connectionId: string): Promise<void> =>
      container.peek("turnTabs")?.endConnection(connectionId) ?? Promise.resolve(),
    dispose: () =>
      (disposal ??= (async () => {
        stopTracking();
        const turnTabs = container.peek("turnTabs");
        if (turnTabs && !s.turnTabs) {
          turnTabs.dispose();
          await turnTabs.endAll();
        }
        container.peek("codeMode")?.disposeAll();
      })()),
  };
  return Object.defineProperties(helpers, Object.getOwnPropertyDescriptors(d)) as typeof helpers &
    MethodCollaborators;
}
