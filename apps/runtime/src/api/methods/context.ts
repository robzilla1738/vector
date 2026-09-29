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
import { DecisionJournal, decide } from "../../safety/decide.js";
import type { DriverSet, PageService } from "../../services/pages.js";
import type { EventBus } from "../../events.js";
import { GoalService } from "../../services/goals.js";
import { CommandEscalationService } from "../../services/command-escalation.js";
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
import { startSkillReplay } from "../../services/skill-replay.js";
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
  featureHost?: AuxFeatureHost;
  featureProfileId?: string;
  featureStages?: Promise<AuxFeatureOverrides>;
  pages: PageService;
  sets: SetService;
  runs: RunService;
  goals?: GoalService;
  commandEscalations?: CommandEscalationService;
  artifacts: ArtifactStore;
  settings: SettingsService;
  events: EventBus;
  repo: Repo;
  agentConnections?: AgentConnectionService;
  /** S6.7 — scoped connections own first-class session runs. */
  externalSessions?: import("../../services/external-sessions.js").ExternalSessionService;
  mcpTransportProvider?: McpTransportProvider;
  mcpOAuth?: McpOAuthService;
  outboundMcp?: OutboundMcpService;
  hooks?: HookService;
  hookExecutor?: HookExecutor;
  workspaceFolders?: WorkspaceFolderService;
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
  chromeAttach: (port: number) => Promise<unknown>;
  chromeDetach: () => Promise<unknown>;
  chromeTabs: () => Promise<unknown>;
  importCookies: (opts: { source?: "auto" | "attached" | "profile" }) => Promise<unknown>;
  browserImport?: BrowserImporter;
  benchRun: (task?: string, repeats?: number) => Promise<unknown>;
}

/** Lazily build the shared importer — it needs live driver/page handles, not config. */
export function browserImporter(s: Services): BrowserImporter {
  if (s.browserImport) return s.browserImport;
  s.browserImport = new BrowserImporter({
    repo: s.repo,
    native: s.native,
    emit: (type, payload) => s.events.emit(type, payload),
    chromeTabs: async () => (await s.chromeTabs()) as { url: string; title: string; type: string }[],
    openTab: async (url) => {
      await s.pages.open({ url, background: true, ownedByRuntime: false });
    },
  });
  return s.browserImport;
}

export interface ClientCtx {
  external: boolean;
  connectionId?: string;
  scope?: AgentConnectionScope;
  codeMode?: true;
}

export type InvokeFn = (method: string, params: unknown, client?: ClientCtx) => Promise<unknown>;

export type MethodDeps = ReturnType<typeof buildMethodDeps>;

export interface MethodCtx extends MethodDeps {
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
  ) => Promise<T>;
}

export type MethodHandler = (ctx: MethodCtx) => Promise<unknown>;

/** Per-invoker collaborators shared by every domain handler. */
export function buildMethodDeps(s: Services, invoke: InvokeFn) {
  const outboundMcp = s.outboundMcp ?? new OutboundMcpService(s.repo, s.mcpTransportProvider);
  const subagents = s.subagents ?? new SubagentService(s.repo, s.events, s.runs);
  const customization = new SiteCustomization(s.repo.db, s.featureProfileId ?? "default");
  const commandRanking = new CommandRankingStore(s.repo, s.featureProfileId ?? "default");
  const tasks = new TaskService(s.repo, s.events);
  const connectorCatalog = new ConnectorCatalogService({
    repo: s.repo,
    tasks,
    settings: s.settings,
    calendar: s.calendar,
    mcp: outboundMcp,
  });
  const browsingMemory = new BrowsingMemory(s.repo);
  browsingMemory.prune();
  const revokeWorkspaceContext = (workspaceId: string, browsingOnly: boolean) => {
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
        s.runs.cancel(
          row.runId,
          "Workspace context changed before this turn finished. Review and retry with current sources.",
        );
    }
  };
  const revokeArticleRuns = (workspaceId: string, memoryId?: string) => {
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
        s.runs.cancel(
          row.runId,
          "A selected saved article was forgotten or its access changed. Start a new turn with current sources.",
        );
    }
  };
  const spaces = new SpaceService(s.repo, s.events);
  const taskEvidence = new TaskEvidenceService(s.repo, s.events, s.pages, s.native, s.downloadsDir);
  const vault = s.vault ?? new VaultService(s.repo, s.native);
  const translate = new TranslateService(s.settings);
  const safetyAudit = new SafetyAuditStore(s.repo.db, s.repo.columnCipher);
  const approvals = new ApprovalStore(s.repo.db, (event) => safetyAudit.record(event), s.repo.columnCipher);
  const suspensions = new SuspensionStore(s.repo.db, (event) => safetyAudit.record(event));
  const decisions = new DecisionJournal(s.repo.db);
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
  }) => {
    const threadId = input.threadId ?? `rpc:${input.connectionId ?? "internal"}`;
    const decision = await decide(
      {
        profileId: s.featureProfileId ?? "default",
        scope: input.taskId
          ? { kind: "task" as const, id: input.taskId }
          : { kind: "workspace" as const, id: "rpc" },
        actor: "external_token",
        effect: "egress",
        category: "external_tool",
        action: input.action,
        origin: input.url.origin,
        destination: input.url.href.slice(0, 2048),
        dataClasses: [],
        provenance: "template",
        invocationDigest: createHash("sha256")
          .update(JSON.stringify([input.action, input.url.href]))
          .digest("hex"),
        turnId: threadId,
        threadId,
        ...(input.runId ? { runId: input.runId } : {}),
        requestedAt: Date.now(),
      },
      {
        approvals,
        journal: decisions,
        managedRules: () => OriginRuleSchema.array().parse(s.repo.getSetting("managedOriginPolicies") ?? []),
        userRules: () => s.settings.originPolicies(),
        localCeiling: (action) => s.settings.safetyCeiling(action.effect),
        settingsGrants: () => s.settings.effectGrants(),
        audit: (event) => safetyAudit.record({ ...event }),
      },
      { phase: "dispatch", headless: true },
    );
    if (decision.status !== "allow")
      throw new AuxError(
        "permission_denied",
        decision.status === "deny"
          ? decision.guidance
          : "Egress requires an approval that must be granted in Aux.",
      );
    return decision;
  };
  const substituteRoutine = (objective: string, parameters: Record<string, string>) =>
    objective.replace(/\{\{([A-Za-z][A-Za-z0-9_]{0,40})\}\}/g, (_, name: string) => parameters[name] ?? "");
  const routines =
    s.routines ??
    new RoutineService(s.repo, s.events, async (routine, parameters) => {
      if (!routine.sourceTaskId)
        throw new AuxError("conflict", "This routine has no saved task. Run it from a conversation in Aux.");
      const details = tasks.details(routine.sourceTaskId);
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
      if (!pageIds.length)
        throw new AuxError(
          "conflict",
          "Attach an open browser tab to the source task before this routine can run.",
        );
      if (routine.replay) {
        const started = startSkillReplay({ repo: s.repo, pages: s.pages, events: s.events,
          routine, pageId: pageIds[0]!, parameters });
        return { chatId: details.task.conversationId, runId: started.runId };
      }
      const prepared = tasks.prepareRun(routine.sourceTaskId, details.task.revision);
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
    });
  const plugins = new PluginService(s.repo, routines);
  const goals = s.goals ?? new GoalService(s.repo, s.runs);
  const commandEscalations = s.commandEscalations ?? new CommandEscalationService(s.repo);
  const hooks = s.hooks ?? new HookService(s.repo);
  const workspaceFolders = s.workspaceFolders ?? new WorkspaceFolderService(s.repo);
  const zap = s.zap ?? new ZapService(s.repo, s.native, s.featureProfileId ?? "default");
  const scopedTasks = (scope: AgentConnectionScope) =>
    scope.kind === "task"
      ? tasks.descendants(scope.taskId)
      : tasks.list({ workspaceId: scope.workspaceId, includeArchived: true, limit: 500 });
  const sessionPageIds = (sessionId: string): Set<string> =>
    new Set(
      s.pages
        .list()
        .filter((page) => page.sessionId === sessionId)
        .map((page) => page.pageId),
    );
  const requireScopedTask = (scope: AgentConnectionScope, taskId: string) => {
    const task = tasks.get(taskId);
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
  s.events.subscribe((event) => {
    if (event.type.startsWith("task.") || event.type.startsWith("run.") || event.type.startsWith("page."))
      taskPages.clear();
  });
  const turnTabs = new AgentTurnTabs(s.pages, (page) => {
    s.repo.upsertPage({ ...page, ownedByRuntime: false });
    page.ownedByRuntime = false;
    void s.pages.activate(page.pageId).catch(() => {});
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
                  const runs = tasks
                    .details(task.taskId)
                    .runs.filter((item) => item.currentRevision)
                    .flatMap((item) => item.run.pageIds);
                  return [...resources, ...runs];
                }),
              ),
            };
      taskPages.set(key, cached);
    }
    return connectionId ? new Set([...cached.pages, ...turnTabs.pageIds(connectionId)]) : cached.pages;
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
  const codeMode = new AgentCodeMode((method, params, client) =>
    invoke(
      method,
      params,
      client as { external: boolean; connectionId?: string; scope?: AgentConnectionScope; codeMode?: true },
    ),
  );
  const historyProjection = new HistoryProjection(s.repo, s.featureProfileId ?? "default");
  return {
    s,
    outboundMcp,
    subagents,
    customization,
    commandRanking,
    tasks,
    connectorCatalog,
    browsingMemory,
    revokeWorkspaceContext,
    revokeArticleRuns,
    spaces,
    taskEvidence,
    vault,
    translate,
    safetyAudit,
    approvals,
    suspensions,
    decisions,
    decideEgress,
    substituteRoutine,
    routines,
    plugins,
    goals,
    commandEscalations,
    hooks,
    workspaceFolders,
    zap,
    scopedTasks,
    sessionPageIds,
    requireScopedTask,
    scopedPageIds,
    scopedTaskIds,
    taskWorkspaceId,
    runScopeRefs,
    eventVisible,
    requireScopedPage,
    turnTabs,
    codeMode,
    historyProjection,
  };
}
