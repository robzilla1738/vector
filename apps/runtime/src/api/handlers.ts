import { GeneratedResults } from "../services/generated-results.js";
import { SavedResults } from "../services/saved-results.js";
import { BROWSING_CONTEXT_MARKER, BrowsingMemory } from "../services/browsing-memory.js";
import { ContentMemoryStore } from "../services/content-memory.js";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import {
  EventTypes,
  MethodSchemas,
  newProgramId,
  originOfAddress,
  OriginRuleSchema,
  RoutineShareEnvelopeSchema,
  RoutineShareSchema,
  taskMatchesQuery,
  AuxError,
  requireAuxMethod,
  type AuxFeatureHost,
  type AuxFeatureOverrides,
  type Condition,
  type MethodName,
} from "@aux/contracts";
import { RuntimeAuthorization } from "./authorization.generated.js";
import type { PageService } from "../services/pages.js";
import type { SetService } from "../services/sets.js";
import type { RunService } from "../services/runs.js";
import type { ArtifactStore } from "../services/artifacts.js";
import type { SettingsService } from "../services/settings.js";
import type { ResponseStore } from "../services/responses.js";
import type { OperationService } from "../services/operations.js";
import type { StateService } from "../services/state.js";
import type { Tracer } from "../services/tracing.js";
import type { EventBus } from "../events.js";
import type { Repo } from "../store/repo.js";

import { wireObservation } from "../services/observation-wire.js";
import { accessibilityHtml } from "../services/observation-render.js";
import { chromeBookmarkFiles, readChromeBookmarksFile } from "../services/chrome-bookmarks.js";
import { BrowserImporter } from "../services/browser-import.js";
import type { DriverSet } from "../services/pages.js";

import { TaskService } from "../services/tasks.js";
import { DurableWriteLedger } from "../agent/durable.js";
import { programContainsOperationCalls, programHasConsequentialSteps } from "../services/pages/executor.js";
import { SpaceService } from "../services/spaces.js";
import { TaskEvidenceService } from "../services/task-evidence.js";
import { summarizeModelUsage } from "../services/model-usage.js";
import type { AgentConnectionService } from "../services/agent-connections.js";
import type { CalendarConnectionService } from "../services/calendar-connections.js";
import type { AgentConnectionScope, AuxEvent } from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import {
  cancelRuntimeRestore,
  createRuntimeBackup,
  deleteRuntimeBackup,
  listRuntimeBackups,
  backupRetention,
  setBackupRetention,
  stageRuntimeRestore,
} from "../services/runtime-backup.js";
import { VaultService } from "../services/vault.js";
import { RoutineService } from "../services/routines.js";
import { PluginService } from "../services/plugins.js";
import { GoalService } from "../services/goals.js";
import { HookService } from "../services/hooks.js";
import { ZapService } from "../services/zap.js";
import { TranslateService } from "../services/translate.js";
import { ApprovalStore } from "../safety/approval.js";
import { SafetyAuditStore } from "../safety/audit.js";
import { SuspensionStore } from "../safety/suspensions.js";
import { decide, DecisionJournal } from "../safety/decide.js";
import { AgentCodeMode } from "../agent/code-mode.js";
import { proposeTabTidy } from "../agent/tidy.js";
import { suggestTabName } from "../agent/tab-name.js";
import { HistoryProjection } from "../services/history-projection.js";
import { AgentWebTools, permittedWebUrl } from "../agent/web-tools.js";
import { AgentImageTools } from "../agent/image-tools.js";
import { SpendLedger } from "../store/spend-ledger.js";
import { authorizeProgram } from "../agent/permissions.js";
import { AgentTurnTabs } from "../agent/turn-tabs.js";
import { siteExportUrl } from "../agent/site-adapters.js";
import { OutboundMcpService, type McpTransportProvider } from "../services/outbound-mcp.js";
import { ConnectorCatalogService } from "../services/connectors.js";
import type { MemoryPipeline } from "../services/memory-pipeline.js";
import { SubagentService } from "../services/subagents.js";
import { SiteCustomization } from "../services/site-customization.js";
import { CommandRankingStore } from "../services/command-ranking.js";

export interface Services {
  featureHost?: AuxFeatureHost;
  featureProfileId?: string;
  featureStages?: Promise<AuxFeatureOverrides>;
  pages: PageService;
  sets: SetService;
  runs: RunService;
  artifacts: ArtifactStore;
  settings: SettingsService;
  events: EventBus;
  repo: Repo;
  agentConnections?: AgentConnectionService;
  mcpTransportProvider?: McpTransportProvider;
  /** Shared with the agent loop's REPL cell surface — created once in main.ts. */
  subagents?: SubagentService;
  calendar?: CalendarConnectionService;
  native?: NativeBridge;
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
function browserImporter(s: Services): BrowserImporter {
  if (s.browserImport) return s.browserImport;
  s.browserImport = new BrowserImporter({
    repo: s.repo,
    emit: (type, payload) => s.events.emit(type, payload),
    chromeTabs: async () => (await s.chromeTabs()) as { url: string; title: string; type: string }[],
    openTab: async (url) => {
      await s.pages.open({ url, background: true, ownedByRuntime: false });
    },
  });
  return s.browserImport;
}

/** Validates params against MethodSchemas and dispatches to services. */
export function makeInvoker(s: Services) {
  const outboundMcp = new OutboundMcpService(s.repo, s.mcpTransportProvider);
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
        `SELECT run_id AS runId, config FROM runs
      WHERE status IN ('queued','planning','running','paused','needs_input')
      AND json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.contextWorkspaceId')=?`,
      )
      .all(workspaceId) as { runId: string; config: string | null }[];
    for (const row of rows) {
      const config = row.config
        ? (JSON.parse(row.config) as { context?: string; contextBrowsingMemory?: boolean })
        : {};
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
        `SELECT run_id AS runId, config FROM runs
      WHERE status IN ('queued','planning','running','paused','needs_input')
      AND json_extract(CASE WHEN json_valid(config) THEN config ELSE '{}' END,'$.contextWorkspaceId')=?`,
      )
      .all(workspaceId) as { runId: string; config: string | null }[];
    for (const row of rows) {
      const ids = row.config
        ? (JSON.parse(row.config) as { contextMemoryIds?: string[] }).contextMemoryIds
        : undefined;
      if (ids?.length && (!memoryId || ids.includes(memoryId)))
        s.runs.cancel(
          row.runId,
          "A selected saved article was forgotten or its access changed. Start a new turn with current sources.",
        );
    }
  };
  const spaces = new SpaceService(s.repo, s.events);
  const taskEvidence = new TaskEvidenceService(s.repo, s.events, s.pages);
  const vault = s.vault ?? new VaultService(s.repo, s.native);
  const translate = new TranslateService(s.settings);
  const safetyAudit = new SafetyAuditStore(s.repo.db);
  const approvals = new ApprovalStore(s.repo.db, (event) => safetyAudit.record(event));
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
        decision.status === "deny" ? decision.guidance : "Egress requires an approval that must be granted in Aux.",
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
  const goals = new GoalService(s.repo, s.runs);
  const hooks = new HookService(s.repo);
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
    if (event.type.startsWith("task.") || event.type.startsWith("run.") || event.type.startsWith("page.")) taskPages.clear();
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
          ? { at: Date.now(), taskIds: new Set(scopedTasks(scope).map((task) => task.taskId)), pages: sessionPageIds(scope.sessionId) }
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
      | { workspace_id: string }
      | undefined;
    taskWorkspace.set(taskId, { at: Date.now(), workspaceId: row?.workspace_id });
    return row?.workspace_id;
  };
  const runScopeRefs = (runId: string): { taskId?: string; pageIds: string[] } | undefined => {
    const hit = runRefs.get(runId);
    if (hit && Date.now() - hit.at < 1_000) return hit;
    const row = s.repo.db.prepare("SELECT page_ids, config FROM runs WHERE run_id=?").get(runId) as
      | { page_ids: string; config: string | null }
      | undefined;
    if (!row) return undefined;
    let taskId: string | undefined;
    try {
      taskId = (JSON.parse(row.config ?? "{}") as { taskId?: string }).taskId;
    } catch {
      /* malformed config — no task ref */
    }
    let pageIds: string[] = [];
    try {
      pageIds = JSON.parse(row.page_ids) as string[];
    } catch {
      /* malformed */
    }
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
  const eventVisible = (scope: AgentConnectionScope, connectionId: string | undefined, event: AuxEvent): boolean => {
    const pages = scopedPageIds(scope, connectionId);
    const taskIds = scopedTaskIds(scope);
    const p = (event.payload ?? {}) as Record<string, unknown>;
    const str = (v: unknown) => (typeof v === "string" ? v : undefined);
    const runObj = (p.run ?? undefined) as { runId?: string; pageIds?: string[]; config?: { taskId?: string } } | undefined;
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
  async function invoke(
    method: string,
    rawParams: unknown,
    client: { external: boolean; connectionId?: string; scope?: AgentConnectionScope; codeMode?: true } = {
      external: true,
    },
  ): Promise<unknown> {
    const schema = MethodSchemas[method as MethodName];
    if (!schema) throw new AuxError("not_found", `unknown method ${method}`);
    const policy = RuntimeAuthorization[method as MethodName];
    if (client.external && policy.auth === "aux-webui") {
      throw new AuxError("permission_denied", `${method} is managed in Aux.`);
    }
    const host = s.featureHost ?? "electron";
    requireAuxMethod(method, host, await s.featureStages);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = schema.parse(rawParams ?? {});

    const scope = client.external ? client.scope : undefined;
    if (scope) {
      if (method === "agent.js.run" || method === "agent.js.reset") {
        // The code-mode host calls this same invoker with the same client.
        // Each nested method is checked against the connection's scope.
      } else if (
        [
          "pages.close",
          "pages.moveToWindow",
          "pages.navigate",
          "pages.back",
          "pages.forward",
          "pages.reload",
          "pages.stop",
          "pages.resume",
        ].includes(method) ||
        (method === "pages.dialog" && params.action && params.action !== "list")
      )
        throw new AuxError("permission_denied", "Use a task-bound pages.execute program for browser actions");
      if (method === "workspaces.create" || method === "pages.open" || method === "runs.start") {
        throw new AuxError("permission_denied", "This scoped connection cannot expand its own authority");
      }
      if (method === "tasks.create") {
        if (scope.kind === "workspace" || scope.kind === "session") {
          if (params.workspaceId !== scope.workspaceId)
            throw new AuxError(
              "permission_denied",
              "This connection cannot create tasks outside its workspace",
            );
          if (params.parentTaskId) requireScopedTask(scope, params.parentTaskId);
        } else {
          if (typeof params.parentTaskId !== "string")
            throw new AuxError("permission_denied", "A task-scoped connection can only create a child task");
          const parent = requireScopedTask(scope, params.parentTaskId);
          if (params.workspaceId !== parent.workspaceId)
            throw new AuxError("permission_denied", "A child task must remain in its parent workspace");
        }
        if (params.resources?.length)
          throw new AuxError(
            "permission_denied",
            "Attach browser pages and local projects in Aux before using them through this connection",
          );
      } else if (method.startsWith("tasks.") && typeof params.taskId === "string") {
        requireScopedTask(scope, params.taskId);
        if (method === "tasks.update" && params.resources !== undefined)
          throw new AuxError(
            "permission_denied",
            "Scoped connections cannot change task resource authority; attach or remove resources in Aux",
          );
      } else if (
        (method === "calendar.taskGrants.list" || method === "calendar.taskEvents.list") &&
        typeof params.taskId === "string"
      ) {
        requireScopedTask(scope, params.taskId);
      } else if (
        method === "agent.web.fetch" ||
        method === "agent.web.search" ||
        method === "agent.images.generate" ||
        method === "agent.turn.open" ||
        method === "agent.turn.end" ||
        method.startsWith("agent.turn.clipboard.")
      ) {
        if (!params.taskId || !params.expectedRevision)
          throw new AuxError("invalid_params", "Scoped agent tools require a task ID and revision.");
        const task = requireScopedTask(scope, params.taskId);
        if (method !== "agent.turn.end" && task.revision !== params.expectedRevision)
          throw new AuxError("conflict", "Task revision changed; refresh it before using agent tools.");
      } else if (method === "sites.read") {
        requireScopedTask(scope, params.taskId);
        requireScopedPage(scope, params.pageId, client.connectionId);
      } else if (method.startsWith("pages.") && method !== "pages.list") {
        const pageId = typeof params.pageId === "string" ? params.pageId : params.program?.pageId;
        if (typeof pageId !== "string") throw new AuxError("permission_denied", "A scoped page is required");
        requireScopedPage(scope, pageId, client.connectionId);
        if (method === "pages.execute" || method === "pages.cuaExecute") {
          if (typeof params.taskId !== "string" || typeof params.expectedRevision !== "number")
            throw new AuxError("invalid_params", "Scoped page programs require taskId and expectedRevision");
          requireScopedTask(scope, params.taskId);
        }
      } else if (method === "results.generate") {
        if (!params.taskId || !params.expectedRevision)
          throw new AuxError("invalid_params", "Scoped generated results require a task ID and revision.");
        const task = requireScopedTask(scope, params.taskId);
        if (task.revision !== params.expectedRevision)
          throw new AuxError("conflict", "Task revision changed; refresh it before generating a result.");
        if ((task.conversationId ?? `task:${task.taskId}`) !== params.chatId)
          throw new AuxError("permission_denied", "This conversation does not belong to the scoped task.");
      } else if (method.startsWith("runs.") && method !== "runs.list") {
        const run = typeof params.runId === "string" ? s.repo.getRun(params.runId) : undefined;
        if (!run?.config?.taskId)
          throw new AuxError(
            "permission_denied",
            "This connection can only access runs belonging to its task scope",
          );
        requireScopedTask(scope, run.config.taskId);
      } else if (method.startsWith("subagents.")) {
        const parentRunId =
          method === "subagents.createGroup"
            ? params.parentRunId
            : subagents.view(params.groupId ?? subagents.groupIdForAgent(params.agentId)).group.parentRunId;
        const parent = s.repo.getRun(parentRunId);
        if (!parent?.config?.taskId)
          throw new AuxError("permission_denied", "Subagents require a scoped parent task.");
        requireScopedTask(scope, parent.config.taskId);
        if (
          (method === "subagents.spawn" || method === "subagents.forkSelf") &&
          params.pageIds.some((pageId: string) => !scopedPageIds(scope, client.connectionId).has(pageId))
        )
          throw new AuxError("permission_denied", "A subagent page is outside this connection's scope.");
      } else if (method === "mcp.tools.call") {
        if (params.context.workspaceId !== scope.workspaceId)
          throw new AuxError("permission_denied", "MCP tool calls cannot leave this connection's Space.");
        const taskId = params.context.taskId ?? (scope.kind === "task" ? scope.taskId : undefined);
        const task = taskId ? requireScopedTask(scope, taskId) : undefined;
        if (params.context.revision !== undefined && params.context.revision !== task?.revision)
          throw new AuxError("conflict", "The MCP task revision changed. Review the current task.");
        params.context = {
          workspaceId: scope.workspaceId,
          ...(task ? { taskId: task.taskId, revision: task.revision } : {}),
        };
      } else if (method === "plugins.skills.read") {
        const task = requireScopedTask(scope, params.taskId);
        if (task.revision !== params.expectedRevision)
          throw new AuxError("conflict", "Task revision changed; refresh it before reading the Skill.");
      } else if (
        ![
          "workspaces.list",
          "tasks.list",
          "pages.list",
          "workspace.get",
          "runs.list",
          "runtime.describe",
          "events.since",
          "runs.events",
        ].includes(method)
      ) {
        throw new AuxError("permission_denied", "This method is outside the connection's task scope");
      }
      if (method === "tasks.start" && Array.isArray(params.pageIds))
        for (const pageId of params.pageIds) requireScopedPage(scope, pageId, client.connectionId);
    }

    const withExternalPage = async <T>(
      pageId: string,
      action: () => Promise<T>,
      taskId?: string,
      internalAutomation = false,
    ): Promise<T> => {
      const automated = client.external || internalAutomation;
      const release = automated
        ? s.runs.pageOwnership.tryAcquire({
            pageId,
            actor: "external",
            taskId,
            connectionId: client.connectionId,
          })
        : undefined;
      try {
        if (automated && s.pages.get(pageId).controller === "human")
          throw new AuxError(
            "conflict",
            "A person controls this tab; return control before an automated action",
          );
        return await action();
      } finally {
        release?.();
      }
    };

    // Chromium's BookmarkModel is the only bookmark tree in a browser Profile.
    // SQLite remains a standalone/Electron backend and an offline-article cache.
    if (
      host === "chromium-fork" &&
      method.startsWith("bookmarks.") &&
      method !== "bookmarks.offline.set" &&
      method !== "bookmarks.offline.get"
    ) {
      if (!s.native?.bookmarksInvoke)
        throw new AuxError("backend_unavailable", "Chromium BookmarkModel is unavailable.");
      if (
        client.external &&
        [
          "bookmarks.folders.create",
          "bookmarks.folders.rename",
          "bookmarks.folders.remove",
          "bookmarks.update",
          "bookmarks.move",
          "bookmarks.saveFolder",
        ].includes(method)
      )
        throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
      const result = await s.native.bookmarksInvoke(method, params);
      if (method === "bookmarks.list") {
        return (result as { url: string; readingList?: boolean }[]).map((item) => ({
          ...item,
          offline: item.readingList && !!s.repo.getBookmarkArticle(item.url),
        }));
      }
      if (method === "bookmarks.remove" || (method === "bookmarks.readingList" && !params.readingList)) {
        const remaining = (await s.native.bookmarksInvoke("bookmarks.list", {})) as {
          url: string;
          readingList?: boolean;
        }[];
        if (!remaining.some((item) => item.url === params.url && item.readingList))
          s.repo.deleteBookmarkArticle(params.url);
      }
      if (method === "bookmarks.update") s.repo.moveBookmarkArticle(params.originalUrl, params.url);
      return result;
    }

    switch (method as MethodName) {
      case "zap.list":
      case "zap.grant":
      case "zap.update":
      case "zap.revoke": {
        if (client.external)
          throw new AuxError("permission_denied", "Zap site changes require the Aux desktop user.");
        if (method === "zap.list") return zap.list();
        if (method === "zap.grant") return zap.grant(params.origin);
        if (method === "zap.update") return zap.update(params);
        return zap.revoke(params.origin, params.expectedRevision);
      }
      case "agent.js.run":
        return codeMode.run(params, client);
      case "agent.js.reset":
        return codeMode.reset(client, params.sessionId);
      case "agent.tidy.propose": {
        if (client.external)
          throw new AuxError("permission_denied", "Tab Tidy suggestions must be requested in Aux.");
        const model = s.settings.model();
        if (!model)
          throw new AuxError("backend_unavailable", "Connect a model in Settings before using AI Tidy.");
        const proposal = await proposeTabTidy(params, s.pages.list(), model, s.settings.agentRoute("fast"));
        s.events.emit("agent.tidy.proposed", {
          tabCount: proposal.pages.length,
          groupCount: proposal.groups.length,
          modelId: proposal.modelId,
        });
        return proposal;
      }
      case "agent.tabName.suggest": {
        if (client.external) throw new AuxError("permission_denied", "Tab names must be requested in Aux.");
        const model = s.settings.model();
        if (!model)
          throw new AuxError(
            "backend_unavailable",
            "Connect a model in Settings before suggesting a tab name.",
          );
        const suggestion = await suggestTabName(
          params,
          s.pages.list().find((page) => page.pageId === params.pageId),
          model,
          s.settings.agentRoute("fast"),
        );
        s.events.emit("agent.tabName.suggested", { pageId: suggestion.pageId, modelId: suggestion.modelId });
        return suggestion;
      }
      case "agent.inlineAssist.capture":
        if (client.external)
          throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
        return s.pages.captureInlineAssist(params);
      case "agent.inlineAssist.draft": {
        if (client.external)
          throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
        const model = s.settings.model();
        if (!model)
          throw new AuxError(
            "backend_unavailable",
            "Connect a model in Settings before drafting field text.",
          );
        return s.pages.draftInlineAssist(params, model, s.settings.agentRoute("fast"));
      }
      case "agent.inlineAssist.apply":
        if (client.external)
          throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
        return s.pages.applyInlineAssist(params);
      case "agent.inlineAssist.cancel":
        if (client.external)
          throw new AuxError("permission_denied", "Inline assist requires the Aux desktop interface.");
        return s.pages.cancelInlineAssist(params);
      case "agent.web.fetch":
      case "agent.web.search": {
        let threadId: string | undefined;
        if (params.taskId)
          threadId = tasks.details(params.taskId).task.conversationId ?? `task:${params.taskId}`;
        // Every hop — the entry URL and each redirect — passes decide() and
        // the egress grants before a cookieless request leaves the runtime.
        const web = new AgentWebTools(
          async (url) => {
            await decideEgress({ url, action: method, taskId: params.taskId, connectionId: client.connectionId, threadId });
            return authorizeProgram([{ id: "web-egress", op: "navigate", url: url.href }], s.settings.effectGrants())
              .ok;
          },
        );
        if (method === "agent.web.fetch") return web.fetch(params.url);
        const engine =
          s.featureHost === "chromium-fork" ? await s.native?.searchEngineGet?.() : s.settings.searchEngine();
        if (!engine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
        return web.search(params.query, engine);
      }
      case "agent.images.generate": {
        await decideEgress({
          url: new URL("https://ai-gateway.vercel.sh"),
          action: "agent.images.generate",
          taskId: params.taskId,
          connectionId: client.connectionId,
        });
        const permitted = authorizeProgram(
          [{ id: "image-egress", op: "navigate", url: "https://ai-gateway.vercel.sh" }],
          s.settings.effectGrants(),
        );
        if (!permitted.ok)
          throw new AuxError("permission_denied", "AI Gateway egress is not granted for image generation.");
        const key = s.settings.gatewayKey();
        if (!key)
          throw new AuxError(
            "backend_unavailable",
            "Connect AI Gateway in Settings before generating an image.",
          );
        const ledger = new SpendLedger();
        try {
          return await AgentImageTools.withGateway(key, s.artifacts, ledger).generate(
            params.prompt,
            params.taskId,
          );
        } finally {
          ledger.close();
        }
      }
      case "agent.turn.open": {
        const task = tasks.get(params.taskId);
        if (task.revision !== params.expectedRevision)
          throw new AuxError("conflict", "Task revision changed; refresh it before opening a turn tab.");
        const url = permittedWebUrl(params.url);
        await decideEgress({
          url,
          action: "agent.turn.open",
          taskId: params.taskId,
          connectionId: client.connectionId,
          threadId: task.conversationId ?? `task:${params.taskId}`,
        });
        if (
          !authorizeProgram([{ id: "turn-egress", op: "navigate", url: url.href }], s.settings.effectGrants())
            .ok
        )
          throw new AuxError("permission_denied", `Web egress is not granted for ${url.origin}.`);
        return turnTabs.open({
          connectionId: client.connectionId ?? (client.external ? "owner" : "internal"),
          taskId: params.taskId,
          turnId: params.turnId,
          url: url.href,
          skipIfActive: params.skipIfActive,
        });
      }
      case "agent.turn.end":
        return turnTabs.end(
          client.connectionId ?? (client.external ? "owner" : "internal"),
          params.taskId,
          params.turnId,
        );
      case "agent.turn.clipboard.write":
        return turnTabs.writeClipboard(
          client.connectionId ?? (client.external ? "owner" : "internal"),
          params.taskId,
          params.turnId,
          params.text,
        );
      case "agent.turn.clipboard.read":
        return {
          text: turnTabs.readClipboard(
            client.connectionId ?? (client.external ? "owner" : "internal"),
            params.taskId,
            params.turnId,
          ),
        };
      case "agent.turn.clipboard.paste": {
        const text = turnTabs.readClipboard(
          client.connectionId ?? (client.external ? "owner" : "internal"),
          params.taskId,
          params.turnId,
        );
        return invoke(
          "pages.execute",
          {
            taskId: params.taskId,
            expectedRevision: params.expectedRevision,
            program: {
              pageId: params.pageId,
              ...(params.documentEpoch === undefined ? {} : { documentEpoch: params.documentEpoch }),
              steps: [{ id: "turn-clipboard-paste", op: "type", target: params.target, value: text }],
            },
          },
          client,
        );
      }
      case "sites.read": {
        const previewGranted =
          !!client.connectionId && turnTabs.owns(client.connectionId, params.taskId, params.pageId);
        tasks.preparePageAccess(params.taskId, params.expectedRevision, params.pageId, false, previewGranted);
        const exportUrl = siteExportUrl(params);
        const grants = s.settings.effectGrants();
        if (
          !authorizeProgram(
            [{ id: "site-read", op: "extract", fields: [{ name: "content" }] }],
            grants,
            exportUrl.origin,
          ).ok ||
          !authorizeProgram([{ id: "site-egress", op: "navigate", url: exportUrl.href }], grants).ok
        )
          throw new AuxError(
            "permission_denied",
            `Site export needs read and egress grants for ${exportUrl.origin}.`,
          );
        const result = await s.pages.readSiteContent(params, (url) => {
          const current = s.settings.effectGrants();
          return (
            authorizeProgram(
              [{ id: "site-read", op: "extract", fields: [{ name: "content" }] }],
              current,
              url.origin,
            ).ok && authorizeProgram([{ id: "site-egress", op: "navigate", url: url.href }], current).ok
          );
        });
        tasks.preparePageAccess(params.taskId, params.expectedRevision, params.pageId, false, previewGranted);
        if (
          !authorizeProgram(
            [{ id: "site-read", op: "extract", fields: [{ name: "content" }] }],
            s.settings.effectGrants(),
            exportUrl.origin,
          ).ok ||
          !authorizeProgram(
            [{ id: "site-egress", op: "navigate", url: exportUrl.href }],
            s.settings.effectGrants(),
          ).ok
        )
          throw new AuxError("permission_denied", "The site read grant changed during extraction.");
        return result;
      }
      case "calendar.connections.list":
        if (client.external) throw new AuxError("permission_denied", "Calendar accounts are managed in Aux.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.list();
      case "calendar.auth.start":
        if (client.external)
          throw new AuxError("permission_denied", "Calendar accounts are connected in Aux.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.start();
      case "calendar.connections.revoke":
        if (client.external) throw new AuxError("permission_denied", "Calendar accounts are managed in Aux.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.revoke(params.connectionId);
      case "calendar.events.list":
        if (client.external)
          throw new AuxError("permission_denied", "Calendar reads require an Aux account grant.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.events(params);
      case "calendar.taskGrants.list":
        if (client.external && !scope)
          throw new AuxError("permission_denied", "Calendar task grants require a scoped connection.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.taskGrants(params.taskId);
      case "calendar.taskGrants.create":
        if (client.external)
          throw new AuxError("permission_denied", "Calendar task grants are managed in Aux.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.grantTask(params.taskId, params.expectedRevision, params.connectionId);
      case "calendar.taskGrants.revoke":
        if (client.external)
          throw new AuxError("permission_denied", "Calendar task grants are managed in Aux.");
        if (!s.calendar) throw new AuxError("backend_unavailable", "Calendar connections are unavailable.");
        return s.calendar.revokeTaskGrant(params.taskId, params.grantId);
      case "calendar.taskEvents.list":
        if (client.external && !scope)
          throw new AuxError("permission_denied", "Calendar task reads require a scoped connection.");
        if (!s.operations) throw new AuxError("backend_unavailable", "Calendar operations are unavailable.");
        return (await s.operations.invokeCalendarTaskEvents(params)).result;
      case "connectors.catalog":
        if (client.external)
          throw new AuxError("permission_denied", "Connector accounts and grants are reviewed in Aux.");
        return connectorCatalog.list(params);
      case "agentConnections.list":
        if (client.external)
          throw new AuxError("permission_denied", "Connections can only be managed in Aux Settings");
        if (!s.agentConnections)
          throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
        return s.agentConnections.list();
      case "agentConnections.create":
        if (client.external)
          throw new AuxError("permission_denied", "Connections can only be created in Aux Settings");
        if (!s.agentConnections)
          throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
        return s.agentConnections.create(params);
      case "agentConnections.revoke":
        if (client.external)
          throw new AuxError("permission_denied", "Connections can only be revoked in Aux Settings");
        if (!s.agentConnections)
          throw new AuxError("backend_unavailable", "Agent connection management is unavailable");
        return s.agentConnections.revoke(params.connectionId);
      case "mcp.servers.register":
      case "mcp.bundles.inspect":
      case "mcp.servers.list":
      case "mcp.servers.approve":
      case "mcp.servers.revoke":
      case "mcp.tools.list":
      case "mcp.grants.create":
      case "mcp.grants.list":
      case "mcp.grants.revoke":
      case "mcp.tools.call": {
        if (method !== "mcp.tools.call" && (client.external || client.codeMode))
          throw new AuxError("permission_denied", "MCP connections are managed in Aux.");
        if (method === "mcp.tools.call" && (client.external || client.codeMode) && !scope)
          throw new AuxError("permission_denied", "MCP tool calls require a scoped connection.");
        if (method === "mcp.bundles.inspect") return outboundMcp.inspectBundle(params.path);
        if (method === "mcp.servers.register") return outboundMcp.register(params);
        if (method === "mcp.servers.list") return outboundMcp.list(params.workspaceId);
        if (method === "mcp.servers.approve")
          return outboundMcp.approve(params.serverId, params.expectedDigest);
        if (method === "mcp.servers.revoke") return outboundMcp.revoke(params.serverId);
        if (method === "mcp.tools.list") return outboundMcp.listTools(params.serverId);
        if (method === "mcp.grants.create") return outboundMcp.grant(params);
        if (method === "mcp.grants.list") return outboundMcp.grants(params.serverId);
        if (method === "mcp.grants.revoke") return outboundMcp.revokeGrant(params.grantId);
        return outboundMcp.callTool(params.grantId, params.arguments, params.context);
      }
      case "subagents.createGroup":
      case "subagents.spawn":
      case "subagents.forkSelf":
      case "subagents.sendMessage":
      case "subagents.getGroup":
      case "subagents.cancel": {
        if (client.external && !scope)
          throw new AuxError("permission_denied", "Subagents require a scoped connection.");
        if (method === "subagents.createGroup") return subagents.createGroup(params);
        if (method === "subagents.spawn") return subagents.spawn(params);
        if (method === "subagents.forkSelf") return subagents.forkSelf(params);
        if (method === "subagents.sendMessage")
          return subagents.sendMessage(params.agentId, params.expectedRunId, params.text);
        if (method === "subagents.getGroup") return subagents.view(params.groupId);
        return subagents.cancel(params.agentId);
      }
      case "plugins.inspect":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.inspect(params.path);
      case "goals.create":
      case "goals.get":
      case "goals.list":
      case "goals.start":
      case "goals.pause":
      case "goals.resume":
      case "goals.cancel": {
        if (client.external) throw new AuxError("permission_denied", "Goals are managed in Aux.");
        if (method === "goals.create") return goals.create(params);
        if (method === "goals.get") return goals.get(params.goalId);
        if (method === "goals.list") return goals.list(params.workspaceId, params.limit);
        if (method === "goals.start") return goals.start(params.goalId, params.pageIds);
        if (method === "goals.pause") return goals.pause(params.goalId);
        if (method === "goals.resume") return goals.resume(params.goalId);
        return goals.cancel(params.goalId);
      }
      case "hooks.register":
      case "hooks.get":
      case "hooks.list":
      case "hooks.approve":
      case "hooks.revoke":
      case "hooks.invocations": {
        if (client.external) throw new AuxError("permission_denied", "Hooks are managed in Aux.");
        if (method === "hooks.register") return hooks.register(params);
        if (method === "hooks.get") return hooks.get(params.hookId);
        if (method === "hooks.list") return hooks.list(params.workspaceId);
        if (method === "hooks.approve") return hooks.approve(params.hookId, params.expectedDigest);
        if (method === "hooks.revoke") return hooks.revoke(params.hookId);
        return hooks.invocations(params.hookId, params.limit);
      }
      case "plugins.install":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.install(params.path, params.workspaceId, params.expectedDigest);
      case "plugins.list":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.list(params);
      case "plugins.assets":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.assets(params.pluginId);
      case "plugins.skills.grant":
        if (client.external) throw new AuxError("permission_denied", "Skill access is granted in Aux.");
        return plugins.grantSkill(params);
      case "plugins.skills.grants":
        if (client.external) throw new AuxError("permission_denied", "Skill access is managed in Aux.");
        return plugins.skillGrants(params.pluginId);
      case "plugins.skills.revoke":
        if (client.external) throw new AuxError("permission_denied", "Skill access is revoked in Aux.");
        return plugins.revokeSkill(params.grantId);
      case "plugins.skills.read":
        if (scope) requireScopedTask(scope, params.taskId);
        return plugins.readSkill(params);
      case "plugins.uninstall":
        if (client.external) throw new AuxError("permission_denied", "Plugins are managed in Aux.");
        return plugins.uninstall(params.pluginId);
      case "tasks.receipt":
        return taskEvidence.receipt(params.taskId, params.revision);
      case "tasks.verifyCriterion":
        return taskEvidence.verifyCriterion(params);
      case "tasks.replaceAgent": {
        const details = tasks.details(params.taskId);
        for (const { run } of details.runs) {
          if (["queued", "planning", "running", "paused", "needs_input"].includes(run.status))
            s.runs.cancel(run.runId);
        }
        const pageIds = params.pageIds ?? (params.pageId ? [params.pageId] : []);
        if (scope && Array.isArray(pageIds))
          for (const pageId of pageIds) requireScopedPage(scope, pageId, client.connectionId);
        return s.runs.start({
          ...tasks.prepareRun(params.taskId, params.expectedRevision, params.context),
          pageIds,
          modelId: params.modelId,
        });
      }
      case "tasks.recordEvidence":
        return taskEvidence.recordNote(params, client.external ? "external_client" : "desktop_user");
      case "tasks.importDocumentEvidence":
        if (client.external)
          throw new AuxError("permission_denied", "Document import requires the Aux desktop interface");
        return taskEvidence.importDocument(params);
      case "tasks.captureEvidence":
        return taskEvidence.capture(params);
      case "tasks.reviewCriterion":
      case "tasks.reconcileAction":
      case "tasks.reconcileOperation": {
        if (client.external)
          throw new AuxError(
            "permission_denied",
            "Human review and reconciliation require the Aux desktop interface",
          );
        return method === "tasks.reviewCriterion"
          ? taskEvidence.review(params)
          : method === "tasks.reconcileAction"
            ? taskEvidence.reconcile(params)
            : taskEvidence.reconcileOperation(params);
      }
      case "workspaces.create":
        return tasks.createWorkspace(params.name);
      case "spaces.list":
        return spaces.list();
      case "spaces.import":
        return spaces.import(params.spaces);
      case "spaces.create":
        return spaces.create(params.name, params.color, params.grain);
      case "spaces.update": {
        const { id, ...patch } = params;
        return spaces.update(id, patch);
      }
      case "workspaces.list":
        return scope
          ? tasks.workspaces().filter((workspace) => workspace.workspaceId === scope.workspaceId)
          : tasks.workspaces();
      case "workspaces.memory.search":
        if (client.external) throw new AuxError("permission_denied", "Search Space memory in Aux.");
        return tasks.searchWorkspaceMemory(params.query);
      case "memory.pipeline.policy":
      case "memory.pipeline.setPolicy":
      case "memory.pipeline.extractRun":
      case "memory.pipeline.overview":
      case "memory.pipeline.search":
      case "memory.pipeline.forget": {
        if (client.external || client.codeMode)
          throw new AuxError("permission_denied", "Space memory is managed in Aux.");
        const pipeline = s.memoryPipeline;
        if (!pipeline)
          throw new AuxError("backend_unavailable", "Protected Space memory requires the Aux desktop app.");
        if (method === "memory.pipeline.policy") return pipeline.policy(params.workspaceId);
        if (method === "memory.pipeline.setPolicy")
          return pipeline.setPolicy(params.workspaceId, params.enabled);
        if (method === "memory.pipeline.extractRun")
          return pipeline.extractRun(params.workspaceId, params.runId);
        if (method === "memory.pipeline.overview") return pipeline.overview(params.workspaceId);
        if (method === "memory.pipeline.search") return pipeline.search(params.workspaceId, params.query);
        const result = await pipeline.forget(params);
        revokeWorkspaceContext(params.workspaceId, false);
        s.events.emit("workspace.memory.updated", { workspaceId: params.workspaceId });
        return result;
      }
      case "workspaces.browsingMemory.get":
      case "workspaces.browsingMemory.set":
      case "workspaces.browsingMemory.record":
      case "workspaces.browsingMemory.forget": {
        if (client.external) throw new AuxError("permission_denied", "Browsing memory is managed in Aux.");
        if (method === "workspaces.browsingMemory.get") return browsingMemory.get(params.workspaceId);
        if (method === "workspaces.browsingMemory.set") {
          const prior = browsingMemory.policy(params.workspaceId);
          const result = browsingMemory.setPolicy(params.workspaceId, params.policy);
          if ((prior.enabled && !result.policy.enabled) || result.policy.retentionDays < prior.retentionDays)
            revokeWorkspaceContext(params.workspaceId, true);
          s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId });
          return result;
        }
        if (method === "workspaces.browsingMemory.record")
          return browsingMemory.record(
            params.workspaceId,
            s.pages.get(params.pageId),
            params.expectedDocumentEpoch,
          );
        const result = browsingMemory.forget(params.workspaceId, params.memoryId);
        revokeWorkspaceContext(params.workspaceId, true);
        s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId });
        return result;
      }
      case "workspaces.contentMemory.policy":
      case "workspaces.contentMemory.setPolicy":
      case "workspaces.contentMemory.capture":
      case "workspaces.contentMemory.search":
      case "workspaces.contentMemory.get":
      case "workspaces.contentMemory.forget": {
        if (client.external)
          throw new AuxError("permission_denied", "Page-content memory is managed in Aux.");
        const store = s.contentMemory;
        if (!store)
          throw new AuxError(
            "backend_unavailable",
            "Protected page-content memory requires the Aux desktop app.",
          );
        if (method === "workspaces.contentMemory.policy") return store.policy(params.workspaceId);
        if (method === "workspaces.contentMemory.setPolicy") {
          const prior = store.policy(params.workspaceId);
          const result = store.setPolicy(params.workspaceId, params.policy);
          if (
            !result.enabled ||
            result.retentionDays < prior.retentionDays ||
            prior.allowedOrigins.some((origin) => !result.allowedOrigins.includes(origin))
          )
            revokeArticleRuns(params.workspaceId);
          s.runs.redactForgottenArticleOutputs(params.workspaceId);
          s.checkpointDeletedData?.();
          s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
          return result;
        }
        if (method === "workspaces.contentMemory.search")
          return store.search(params.workspaceId, params.query);
        if (method === "workspaces.contentMemory.get") {
          const body = await store.get(params.workspaceId, params.memoryId);
          if (!body) return null;
          const { memoryId, profileId, workspaceId, pageId, documentEpoch, url, title, capturedAt, text } =
            body;
          return { memoryId, profileId, workspaceId, pageId, documentEpoch, url, title, capturedAt, text };
        }
        if (method === "workspaces.contentMemory.forget") {
          const forgotten = store.forget(params.workspaceId, params.memoryId);
          revokeArticleRuns(params.workspaceId, params.memoryId);
          s.runs.redactForgottenArticleOutputs(params.workspaceId);
          s.checkpointDeletedData?.();
          s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
          return { forgotten };
        }
        const page = s.pages.get(params.pageId);
        if (!spaces.list().some((space) => space.workspaceId === params.workspaceId && !space.archived))
          throw new AuxError("permission_denied", "Choose an active Space for this article.");
        if (
          !s.native?.captureReadablePage ||
          page.backend !== "aux" ||
          page.ownedByRuntime ||
          page.documentEpoch !== params.expectedDocumentEpoch ||
          page.url !== params.expectedUrl
        )
          throw new AuxError("conflict", "The selected document changed. Select the current page and retry.");
        const policy = store.policy(params.workspaceId);
        const origin = new URL(params.expectedUrl).origin;
        if (!policy.enabled || !policy.allowedOrigins.includes(origin))
          throw new AuxError(
            "permission_denied",
            "Allow this site for page-content recall in the selected Space first.",
          );
        const captured = await s.native.captureReadablePage(
          page.pageId,
          params.workspaceId,
          params.expectedUrl,
        );
        const current = s.pages.get(page.pageId);
        if (
          current.documentEpoch !== page.documentEpoch ||
          current.sessionId !== page.sessionId ||
          current.url !== page.url ||
          current.backend !== "aux" ||
          current.ownedByRuntime
        )
          throw new AuxError("conflict", "The document changed during capture. Try again.");
        const saved = await store.saveEligible({
          workspaceId: params.workspaceId,
          pageId: page.pageId,
          documentEpoch: page.documentEpoch,
          sessionId: page.sessionId,
          ...captured,
        });
        s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
        return { memoryId: saved.memoryId, capturedAt: saved.capturedAt, title: saved.title, url: saved.url };
      }
      case "workspaces.memory.get":
        if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
        return tasks.workspaceMemory(params.workspaceId);
      case "workspaces.memory.set": {
        if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
        const memory = tasks.setWorkspaceMemory(
          params.workspaceId,
          params.expectedRevision,
          params.content,
          params.enabled,
          params.items,
          params.excludedOrigins,
        );
        revokeWorkspaceContext(params.workspaceId, false);
        s.runs.redactForgottenArticleOutputs(params.workspaceId);
        return memory;
      }
      case "tasks.create":
        if (
          client.external &&
          Array.isArray(params.resources) &&
          params.resources.some((resource: { access?: string }) => resource.access === "write")
        ) {
          throw new AuxError("permission_denied", "Write access on task resources can only be set in Aux.");
        }
        return tasks.create(params);
      case "tasks.promote": {
        if (client.external) throw new AuxError("permission_denied", "Save a conversation as a task in Aux.");
        return tasks.promote(params);
      }
      case "tasks.get": {
        const details = tasks.details(params.taskId);
        return {
          ...details,
          children: details.children.map((child) => ({
            ...child,
            receiptStatus: taskEvidence.receipt(child.task.taskId).status,
          })),
        };
      }
      case "tasks.list":
        return scope
          ? scopedTasks(scope)
              .filter(
                (task) =>
                  (params.includeArchived || task.state === "open") && taskMatchesQuery(task, params.query),
              )
              .slice(0, params.limit)
          : tasks.list(params);
      case "tasks.update":
        if (
          client.external &&
          Array.isArray(params.resources) &&
          params.resources.some((resource: { access?: string }) => resource.access === "write")
        ) {
          throw new AuxError("permission_denied", "Write access on task resources can only be set in Aux.");
        }
        return tasks.update(params);
      case "tasks.archive":
        return tasks.archive(params.taskId, params.expectedRevision, params.archived);
      case "tasks.start": {
        const { taskId, expectedRevision, ...options } = params;
        return s.runs.start({ ...options, ...tasks.prepareRun(taskId, expectedRevision, options.context) });
      }
      case "installation.createBackup":
        if (client.external)
          throw new AuxError("permission_denied", "Runtime backups require an explicit action in Aux.");
        return createRuntimeBackup(s.repo, s.settings.all().dataDir);
      case "installation.listBackups":
        if (client.external && client.scope)
          throw new AuxError("permission_denied", "Runtime backups require an explicit action in Aux.");
        return listRuntimeBackups(s.settings.all().dataDir);
      case "installation.deleteBackup":
        if (client.external)
          throw new AuxError("permission_denied", "Delete backups from the Aux settings window.");
        return deleteRuntimeBackup(s.settings.all().dataDir, params.name, params.expectedSha256);
      case "installation.backupRetention":
        if (client.external && client.scope)
          throw new AuxError("permission_denied", "Runtime backups require an explicit action in Aux.");
        return backupRetention(s.repo);
      case "installation.setBackupRetention":
        if (client.external) throw new AuxError("permission_denied", "Backup retention is managed in Aux.");
        return setBackupRetention(s.repo, params.keep);
      case "installation.stageRestore":
        if (client.external)
          throw new AuxError("permission_denied", "Runtime restore requires an explicit action in Aux.");
        return stageRuntimeRestore(s.settings.all().dataDir, params.path);
      case "installation.cancelRestore":
        if (client.external)
          throw new AuxError("permission_denied", "Runtime restore requires an explicit action in Aux.");
        return cancelRuntimeRestore(s.settings.all().dataDir);
      case "vault.status":
      case "vault.list":
      case "vault.save":
      case "vault.lock":
      case "vault.unlock":
      case "vault.grant":
      case "vault.renewGrant":
      case "vault.expiredGrants":
      case "vault.revoke":
      case "vault.history":
      case "vault.grants":
      case "vault.generate":
      case "vault.itemsForOrigin":
      case "vault.fill":
      case "vault.export":
      case "vault.import":
      case "vault.update":
      case "vault.secretMatches": {
        const vaultRead =
          method === "vault.status" ||
          method === "vault.list" ||
          method === "vault.history" ||
          method === "vault.grants" ||
          method === "vault.expiredGrants" ||
          method === "vault.generate" ||
          method === "vault.itemsForOrigin";
        if (client.external && (client.scope || !vaultRead))
          throw new AuxError("permission_denied", "The agent vault can only be managed in Aux.");
        if (method === "vault.status") return vault.status();
        if (method === "vault.list") return vault.list(params.includeRevoked);
        if (method === "vault.save") return vault.save(params);
        if (method === "vault.lock") return vault.lock(params.passphrase);
        if (method === "vault.unlock") return vault.unlock(params.passphrase, params.ttlMs);
        if (method === "vault.grant") return vault.grant(params);
        if (method === "vault.renewGrant") return vault.renewGrant(params);
        if (method === "vault.expiredGrants") return vault.expiredGrants();
        if (method === "vault.revoke") return vault.revoke(params);
        if (method === "vault.history") return vault.history(params.itemId, params.limit);
        if (method === "vault.generate") return { password: vault.generate(params.length) };
        if (method === "vault.itemsForOrigin") return vault.itemsForOrigin(params.origin);
        if (method === "vault.fill") return vault.revealForHumanFill(params.itemId, params);
        if (method === "vault.export") return vault.exportEncrypted(params.passphrase);
        if (method === "vault.import") return vault.importEncrypted(params);
        if (method === "vault.update") return vault.updateSecret(params.itemId, params.secret);
        if (method === "vault.secretMatches")
          return { matches: await vault.secretMatches(params.itemId, params.secret) };
        const origin = params.origin ? originOfAddress(params.origin) : undefined;
        if (params.origin && !origin)
          throw new AuxError("invalid_params", "Grants must name an http(s) origin without credentials.");
        return vault.grants({ taskId: params.taskId, origin });
      }
      case "routines.list":
      case "routines.suggest":
      case "routines.get":
      case "routines.create":
      case "routines.fromResult":
      case "routines.update":
      case "routines.pause":
      case "routines.archive":
      case "routines.run":
      case "routines.runs":
      case "routines.outcome":
      case "routines.reconcile":
      case "routines.due":
      case "routines.ingestEvent":
      case "routines.alerts":
      case "routines.inbox":
      case "routines.inboxRead":
      case "routines.export":
      case "routines.exportSkill":
      case "routines.importSkill":
      case "routines.import":
      case "routines.compare": {
        const routineRead =
          method === "routines.list" ||
          method === "routines.suggest" ||
          method === "routines.get" ||
          method === "routines.runs" ||
          method === "routines.alerts" ||
          method === "routines.inbox" ||
          method === "routines.compare" ||
          method === "routines.export" ||
          method === "routines.exportSkill";
        if (client.external && (client.scope || !routineRead))
          throw new AuxError("permission_denied", "Routines are managed in Aux.");
        if (method === "routines.list") return routines.list(params);
        if (method === "routines.suggest") return routines.suggest(params);
        if (method === "routines.get") return routines.get(params.routineId);
        if (method === "routines.create") return routines.create(params);
        if (method === "routines.fromResult") return routines.fromResult(params);
        if (method === "routines.update") return routines.update(params);
        if (method === "routines.pause")
          return routines.pause(params.routineId, params.expectedRevision, params.paused);
        if (method === "routines.archive")
          return routines.archive(params.routineId, params.expectedRevision, params.archived);
        if (method === "routines.run") return routines.run(params);
        if (method === "routines.runs") return routines.runs(params.routineId, params.limit);
        if (method === "routines.outcome") return routines.outcome(params.routineRunId, taskEvidence);
        if (method === "routines.reconcile")
          return routines.reconcile(params.routineRunId, params.outcome, params.note);
        if (method === "routines.alerts") return routines.alerts(params.limit);
        if (method === "routines.inbox") return routines.inbox(params);
        if (method === "routines.inboxRead") return routines.markInboxRead(params.routineRunId);
        if (method === "routines.ingestEvent") return routines.ingestEvent(params);
        if (method === "routines.compare") return routines.compare(params.leftRunId, params.rightRunId);
        if (method === "routines.export") return routines.exportRoutines(params.routineIds);
        if (method === "routines.exportSkill") return routines.exportSkillDocument(params.routineId);
        if (method === "routines.importSkill")
          return routines.importSkillDocument(params.path, params.workspaceId);
        if (method === "routines.import") {
          let shares = params.routines;
          if (!shares) {
            let raw: unknown;
            try {
              raw = JSON.parse(await readFile(params.path!, "utf8"));
            } catch (error) {
              throw new AuxError(
                "invalid_params",
                `Couldn't read the routine file. ${error instanceof Error ? error.message : String(error)}`,
              );
            }
            const envelope = RoutineShareEnvelopeSchema.safeParse(raw);
            shares = envelope.success
              ? envelope.data.routines
              : Array.isArray(raw)
                ? raw.map((item) => RoutineShareSchema.parse(item))
                : [];
            if (!shares.length)
              throw new AuxError(
                "invalid_params",
                "That file doesn't contain routines. Export routines from Aux first.",
              );
          }
          return routines.importRoutines(shares, params.workspaceId);
        }
        return routines.due(params.now);
      }
      // pages
      case "pages.list":
        return scope
          ? s.pages
              .list(params as never)
              .filter((page) => scopedPageIds(scope, client.connectionId).has(page.pageId))
          : s.pages.list(params as never);
      case "pages.open":
        return s.pages.open(params as never);
      case "pages.close":
        return withExternalPage(params.pageId, () => s.pages.close(params.pageId));
      case "pages.moveToWindow": {
        if (client.external)
          throw new AuxError("permission_denied", "Move tabs through the Aux browser interface.");
        const space = spaces.list().find((space) => space.id === params.spaceId && !space.archived);
        if (!space) throw new AuxError("conflict", "Restore the tab’s space before moving it.");
        if (params.folder && params.folder.spaceId !== params.spaceId)
          throw new AuxError("invalid_params", "The tab folder belongs to another space.");
        return s.pages.moveToWindow(params, space);
      }
      case "pages.reconcileWrite": {
        if (scope)
          throw new AuxError("permission_denied", "Only the Aux owner can reconcile an uncertain action");
        const ledger = new DurableWriteLedger(s.repo.db);
        const pending = ledger
          .unresolved(`direct:${params.pageId}`)
          .filter((intent) => !intent.taskId && (!params.intentId || intent.id === params.intentId));
        if (!pending.length) throw new AuxError("conflict", "No unresolved direct action on this page");
        const note = JSON.stringify({
          actor: client.external ? "owner_token" : "desktop_user",
          evidence: params.evidence,
          recordedAt: Date.now(),
        });
        for (const intent of pending) ledger.reconcile(intent.id, params.outcome, note);
        return { reconciled: pending.map((intent) => intent.id) };
      }
      case "pages.activate":
        return withExternalPage(params.pageId, () => s.pages.activate(params.pageId));
      case "pages.navigate":
        return withExternalPage(params.pageId, () => s.pages.navigate(params.pageId, params["url" as never]));
      case "pages.back":
        return withExternalPage(params.pageId, () => s.pages.back(params.pageId));
      case "pages.forward":
        return withExternalPage(params.pageId, () => s.pages.forward(params.pageId));
      case "pages.reload":
        return withExternalPage(params.pageId, () => s.pages.reload(params.pageId));
      case "pages.stop":
        return withExternalPage(params.pageId, () => s.pages.stop(params.pageId));
      case "pages.observe": {
        const { format, ...req } = params as { format?: "full" | "compact" } & Record<string, unknown>;
        return wireObservation(await s.pages.observe(params.pageId, req as never), format);
      }
      case "pages.cuaExecute": {
        const current = await s.pages.viewport(params.program.pageId);
        const expected = params.expectedViewport;
        if (
          current.documentEpoch !== params.program.documentEpoch ||
          current.width !== expected.width ||
          current.height !== expected.height ||
          current.scale !== expected.scale
        )
          throw new AuxError(
            "conflict",
            "The viewport changed since capture. Capture the page again before pixel actions.",
          );
        const { expectedViewport: _expectedViewport, ...request } = params;
        return invoke("pages.execute", request, client);
      }
      case "pages.execute": {
        // `call` nodes dispatch through PageService's operation-registry
        // hook ("host/name" explicitly, or bare name → page's host).
        // The owner bearer token (CLI, desktop) authors programs directly and may
        // run page script. A scoped agent connection is limited to its task and
        // never gets evaluate/eval: page access is not code-execution authority.
        const p = params as {
          program: Parameters<PageService["execute"]>[0];
          taskId?: string;
          expectedRevision?: number;
          returnObservation?: { format?: "full" | "compact" } & Record<string, unknown>;
          safety?: import("../execution/executor.js").ExecContext["safety"];
        };
        if (client.external && p.safety)
          throw new AuxError("permission_denied", "Final approval metadata comes from the Aux interface.");
        if ((scope || client.codeMode) && programContainsOperationCalls(p.program))
          throw new AuxError(
            "permission_denied",
            "Code mode and scoped connections use typed page steps, not operation calls",
          );
        const consequential = programHasConsequentialSteps(p.program);
        const previewGranted =
          !!client.connectionId &&
          !!p.taskId &&
          turnTabs.owns(client.connectionId, p.taskId, p.program.pageId);
        let validateBeforeJournal: (() => void) | undefined;
        let validateDuringExecution: (() => void) | undefined;
        if (p.taskId) {
          if (p.expectedRevision === undefined)
            throw new AuxError("invalid_params", "Task-bound page programs require expectedRevision");
          tasks.preparePageAccess(
            p.taskId,
            p.expectedRevision,
            p.program.pageId,
            consequential,
            previewGranted,
          );
          const taskId = p.taskId,
            revision = p.expectedRevision;
          validateBeforeJournal = () => {
            tasks.preparePageAccess(taskId, revision, p.program.pageId, consequential, previewGranted);
          };
          validateDuringExecution = () => {
            tasks.confirmPageExecution(taskId, revision);
          };
        } else if (p.expectedRevision !== undefined)
          throw new AuxError("invalid_params", "expectedRevision requires taskId");
        // act-and-observe (speed P0-2): the caller sees the resulting state in
        // the same round trip via a same-lane follow-up observe
        // (PageService.execute).
        const { format, ...req } = p.returnObservation ?? {};
        const { observation, ...result } = await withExternalPage(
          p.program.pageId,
          () =>
            s.pages.execute(
              p.program,
              {
                allowEval: !scope && !client.codeMode,
                taskId: p.taskId,
                taskRevision: p.expectedRevision,
                safety: p.safety,
                beforeJournal: validateBeforeJournal,
                checkValid: validateDuringExecution,
              },
              { returnObservation: p.returnObservation ? (req as never) : undefined },
            ),
          p.taskId,
        );
        if (!p.returnObservation) return result;
        const wire = observation
          ? wireObservation(observation, format as "full" | "compact" | undefined)
          : undefined;
        return { ...result, observation: wire && "observation" in wire ? wire.observation : wire };
      }
      case "pages.extract": {
        const p = params as {
          pageId: string;
          fields?: Array<string | { name: string; selector?: string; attribute?: string; all?: boolean }>;
        };
        return s.pages.extract(p.pageId, p.fields);
      }
      case "pages.elementInfo": {
        const obs = await s.pages.observe(params.pageId, {});
        if (params.expectedDocumentEpoch !== undefined && obs.documentEpoch !== params.expectedDocumentEpoch)
          throw new AuxError("conflict", "The page changed since capture. Observe it again.");
        const candidates = obs.content.elements
          .filter((element) => {
            const rect = element.rect;
            return (
              rect &&
              params.x >= rect.x &&
              params.x <= rect.x + rect.w &&
              params.y >= rect.y &&
              params.y <= rect.y + rect.h
            );
          })
          .sort((a, b) => a.rect!.w * a.rect!.h - b.rect!.w * b.rect!.h);
        const element = candidates[0];
        return {
          pageId: params.pageId,
          documentEpoch: obs.documentEpoch,
          revision: obs.revision,
          element: element
            ? { ...element, ...(element.type === "password" ? { value: undefined } : {}) }
            : null,
        };
      }
      case "pages.accessibilityHtml": {
        const { pageId, ...options } = params;
        const obs = await s.pages.observe(pageId, options);
        return {
          pageId,
          documentEpoch: obs.documentEpoch,
          revision: obs.revision,
          text: accessibilityHtml(obs),
        };
      }
      case "pages.read": {
        const obs = await s.pages.observe(params.pageId, {});
        const query = params.query;
        let value: unknown;
        if (query.kind === "title") value = obs.content.title;
        else if (query.kind === "url") value = obs.content.url;
        else if (query.kind === "text") value = obs.content.text;
        else {
          const extracted = await s.pages.extract(params.pageId, [
            {
              name: "value",
              selector: query.selector,
              ...(query.kind === "attribute" ? { attribute: query.name } : { all: true }),
            },
          ]);
          if (extracted.documentEpoch !== obs.documentEpoch)
            throw new AuxError("conflict", "The page changed while reading it.");
          value =
            query.kind === "count"
              ? Array.isArray(extracted.fields.value)
                ? extracted.fields.value.length
                : 0
              : extracted.fields.value;
        }
        return { pageId: params.pageId, documentEpoch: obs.documentEpoch, revision: obs.revision, value };
      }
      case "pages.waitFor": {
        const p = params as { pageId: string; condition: Condition };
        return s.pages.waitFor(p.pageId, p.condition);
      }
      case "pages.console": {
        const p = params as { pageId: string; since?: number; limit?: number };
        return s.pages.console(p.pageId, p);
      }
      case "pages.dialog": {
        const p = params as { pageId: string; action?: "list" | "accept" | "dismiss"; promptText?: string };
        return p.action && p.action !== "list"
          ? withExternalPage(p.pageId, () => s.pages.dialog(p.pageId, p.action!, p.promptText))
          : s.pages.dialog(p.pageId, "list", p.promptText);
      }
      case "pages.network": {
        const p = params as { pageId: string; since?: number; urlIncludes?: string; limit?: number };
        if (s.pages.network) return s.pages.network(p.pageId, p);
        if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
        await s.responses.flush();
        return s.responses.list(p.pageId, p);
      }
      case "pages.capture":
        return s.pages.capture(params.pageId, params as never);
      case "pages.find": {
        const p = params as { pageId: string; text: string; forward: boolean; findNext: boolean };
        return withExternalPage(p.pageId, () => s.pages.find(p.pageId, p.text, p.forward, p.findNext));
      }
      case "pages.stopFind": {
        const p = params as { pageId: string; action: "clear" | "keep" };
        return withExternalPage(p.pageId, () => s.pages.stopFind(p.pageId, p.action));
      }
      case "pages.zoom": {
        const p = params as {
          pageId: string;
          level?: number;
          delta?: number;
          reset?: boolean;
          direction?: "in" | "out";
        };
        return withExternalPage(p.pageId, () =>
          s.pages.zoom(p.pageId, p.level, p.delta, p.reset, p.direction),
        );
      }
      case "pages.takeover":
        return s.pages.takeover(params.pageId);
      case "pages.pickElement": {
        if (client.external)
          throw new AuxError("permission_denied", "Element picks are interactive and run in Aux.");
        return s.pages.pickElement(params.pageId, { timeoutMs: params.timeoutMs });
      }
      case "customization.zap.pick":
        return s.pages.pickZap(params.pageId, params.expectedDocumentEpoch, params.timeoutMs);
      case "customization.zap.list":
        return customization.list(params.origin);
      case "customization.zap.add": {
        const count = await s.pages.countZapMatches(
          params.pageId,
          params.expectedDocumentEpoch,
          params.origin,
          params.selector,
        );
        return customization.add(params.origin, params.selector, count);
      }
      case "customization.zap.remove":
        return { removed: customization.remove(params.ruleId) };
      case "customization.css.get":
        return customization.getCss(params.origin);
      case "customization.css.set":
        return customization.setCss(params.origin, params.css);
      case "customization.css.effective":
        return { origin: params.origin, css: customization.effectiveCss(params.origin) };
      case "customization.css.apply": {
        const page = s.pages.get(params.pageId);
        const origin = new URL(page.url).origin;
        return s.pages.applyUserCss(
          params.pageId,
          params.expectedDocumentEpoch,
          customization.effectiveCss(origin),
        );
      }
      case "pages.resume":
        return s.pages.resume(params.pageId);
      case "pages.openLive": {
        return withExternalPage(params.pageId, async () => {
          const page = s.pages.get(params.pageId);
          const chrome = s.drivers().chrome;
          if (page.backend === "chrome" && chrome?.activateTarget) {
            await chrome.activateTarget(page.targetId);
            return { ok: true };
          }
          if (page.backend === "aux") {
            await s.pages.activate(page.pageId);
            return { ok: true };
          }
          throw new AuxError(
            "capability_unsupported",
            `cannot focus a ${page.backend} page's native surface`,
          );
        });
      }

      // sets
      case "sets.create":
        return s.sets.create(params as never);
      case "sets.get":
        return s.sets.get(params.setId);
      case "sets.list":
        return s.sets.list();
      case "sets.map":
        return s.runs.mapSet(params as never);
      case "sets.results": {
        const p = params as { setId: string; status?: "ok" | "partial" | "error" };
        return s.sets.results(p.setId, p.status);
      }

      // runs
      case "runs.start": {
        if (client.external && params.contextMemoryIds?.length)
          throw new AuxError(
            "permission_denied",
            "Protected article context can only be sent from the Aux window.",
          );
        if (client.external && params.defaultWorkspaceId)
          throw new AuxError(
            "permission_denied",
            "Conversation Space defaults are set through the Aux browser.",
          );
        return s.runs.start(params as never);
      }
      case "runs.retry": {
        if (client.external && s.runs.coordinator.get(params.runId).config?.contextMemoryIds?.length)
          throw new AuxError(
            "permission_denied",
            "Protected article context can only be retried from the Aux window.",
          );
        return s.runs.retry(params.runId, params.pageId);
      }
      case "runs.get": {
        const run = s.runs.coordinator.get(params.runId);
        const calls = s.repo.listModelCalls(run.runId);
        return {
          run,
          steps: s.repo.listSteps(run.runId),
          modelCalls: calls.length,
          usage: summarizeModelUsage(calls),
        };
      }
      case "runs.list": {
        const p = MethodSchemas["runs.list"].parse(params);
        const listed = s.runs.coordinator.list(p.limit, p);
        if (!scope) return listed;
        const taskIds = new Set(scopedTasks(scope).map((task) => task.taskId));
        return listed.filter((run) => !!run.config?.taskId && taskIds.has(run.config.taskId));
      }
      case "runs.context.get":
        return s.runs.context(params.chatId);
      case "runs.context.set":
        return s.runs.setContext(params);
      case "conversations.list":
        return s.runs.conversations(params);
      case "conversations.prepared":
        if (client.external)
          throw new AuxError("permission_denied", "Unsent conversations are available in Aux.");
        return s.repo.preparedConversations();
      case "conversations.images.get":
        return s.runs.images.list(params.chatId);
      case "conversations.images.add":
        return s.runs.images.add(params);
      case "conversations.images.read":
        return s.runs.images.read(params.chatId, params.imageId);
      case "conversations.images.toggle":
        return s.runs.images.toggle(params.chatId, params.imageId, params.included);
      case "conversations.images.remove": {
        const removed = s.runs.images.remove(params.chatId, params.imageId);
        s.checkpointDeletedData?.();
        return removed;
      }
      case "conversations.get":
        return s.runs.conversation(params.chatId);
      case "conversations.rename":
        return s.runs.renameConversation(params.chatId, params.title);
      case "conversations.archive":
        return s.runs.archiveConversation(params.chatId, params.archived);
      case "conversations.delete": {
        const deleted = s.runs.deleteConversation(params.chatId);
        s.checkpointDeletedData?.();
        return deleted;
      }
      case "conversations.attachments.read":
        if (client.external) throw new AuxError("permission_denied", "Inspect document snapshots in Aux.");
        return s.runs.readAttachment(params);
      case "conversations.attachments.get":
        return s.runs.attachments(params.chatId);
      case "conversations.attachments.page":
        if (client.external) throw new AuxError("permission_denied", "Attach page snapshots in Aux.");
        return s.runs.attachPage(params);
      case "conversations.attachments.add":
        return s.runs.addAttachment(params);
      case "conversations.attachments.toggle":
        return s.runs.toggleAttachment(params);
      case "conversations.attachments.remove": {
        const attachments = s.runs.removeAttachment(params);
        s.checkpointDeletedData?.();
        return attachments;
      }
      case "results.generate":
        if (client.external) {
          if (!scope || !params.taskId || !params.expectedRevision)
            throw new AuxError("permission_denied", "Generated results require a scoped task and revision.");
          const task = requireScopedTask(scope, params.taskId);
          if (task.revision !== params.expectedRevision)
            throw new AuxError("conflict", "Task revision changed; refresh it before generating a result.");
          if ((task.conversationId ?? `task:${task.taskId}`) !== params.chatId)
            throw new AuxError("permission_denied", "This conversation does not belong to the scoped task.");
        }
        {
          const generated = await new GeneratedResults(s.repo, s.artifacts).generate(params);
          s.events.emit("conversation.context.changed", { chatId: params.chatId });
          return generated;
        }
      case "results.generated.get":
        if (client.external) throw new AuxError("permission_denied", "Preview generated results in Aux.");
        return new GeneratedResults(s.repo, s.artifacts).get(params.artifactId);
      case "results.generated.versions":
        if (client.external)
          throw new AuxError("permission_denied", "Inspect generated result versions in Aux.");
        return new GeneratedResults(s.repo, s.artifacts).versions(params.artifactId);
      case "results.search":
        if (client.external) throw new AuxError("permission_denied", "Search saved results in Aux.");
        return new SavedResults(s.repo, s.artifacts).search(params.query, params.limit);
      case "results.read":
        if (client.external) throw new AuxError("permission_denied", "Preview saved results in Aux.");
        return new SavedResults(s.repo, s.artifacts).read(params.artifactId);
      case "results.available":
        if (client.external) throw new AuxError("permission_denied", "Inspect saved results in Aux.");
        return new SavedResults(s.repo, s.artifacts).available(params.drafts);
      case "results.saveVersion":
        if (client.external) throw new AuxError("permission_denied", "Save edited results in Aux.");
        {
          const saved = new SavedResults(s.repo, s.artifacts).saveVersion(params);
          s.events.emit("conversation.context.changed", { chatId: params.chatId });
          return saved;
        }
      case "conversations.artifacts.get":
        return s.runs.conversationArtifacts(params.chatId);
      case "conversations.artifacts.toggle":
        return s.runs.toggleConversationArtifact(params);
      case "conversations.sources.get": {
        const result = await s.runs.conversationSources(params.chatId);
        return client.external
          ? {
              ...result,
              sources: result.sources.filter(
                (source) => source.kind !== "calendar" && source.kind !== "memory",
              ),
            }
          : result;
      }
      case "conversations.workspace.get":
        return s.runs.conversationWorkspace(params.chatId);
      case "conversations.workspace.set":
        return s.runs.setConversationWorkspace(params);
      case "runs.pause":
        return s.runs.pause(params.runId);
      case "runs.resume":
        return s.runs.resume(params.runId);
      case "runs.cancel":
        return s.runs.cancel(params.runId);
      case "runs.answer": {
        const p = params as { runId: string; answer: string };
        return s.runs.coordinator.answer(p.runId, p.answer);
      }
      case "runs.queue":
        if (client.external) throw new AuxError("permission_denied", "Queue conversation messages in Aux.");
        return s.runs.messages.queue(params);
      case "runs.steer":
        if (client.external) throw new AuxError("permission_denied", "Steer conversation runs in Aux.");
        if (params.expectedTurnId !== params.runId)
          throw new AuxError("conflict", "The active turn changed. Review it before steering.");
        if (params.clientUserMessageId && params.clientUserMessageId !== params.messageId)
          throw new AuxError("conflict", "clientUserMessageId must match the message id it sends.");
        if (s.repo.getRun(params.runId)?.config?.subagentProfile)
          throw new AuxError("conflict", "Subagent turns take instructions through subagents.sendMessage, not user steering.");
        return s.runs.messages.steer(params);
      case "runs.messages.list":
        if (client.external)
          throw new AuxError("permission_denied", "Conversation messages are available in Aux.");
        return s.runs.messages.list(params.chatId);
      case "runs.messageStatus":
        if (client.external)
          throw new AuxError("permission_denied", "Message delivery status is available in Aux.");
        return s.runs.messages.messageStatus(params.nonce) ?? null;
      case "safety.approvals.pending":
        if (client.external)
          throw new AuxError("permission_denied", "Approval requests are available in Aux.");
        return approvals.pending(params.threadId);
      case "safety.approvals.decide": {
        if (client.external)
          throw new AuxError("permission_denied", "Only the Aux interface can decide an approval.");
        approvals.decideLocal(params.decision, params.expectedTurnId);
        const approved = params.decision.decision === "accept" || params.decision.decision === "acceptForSession";
        const resolved = suspensions.resolveByApprovalId(params.decision.approvalId, approved ? "answered" : "cancelled");
        // The parked run waits on an answer — wake it with the decision so the
        // planner sees consent (retries through decide() and is authorized) or
        // refusal (chooses a different action) instead of a silent timeout.
        if (resolved) {
          try {
            s.runs.coordinator.answer(resolved.runId, approved
              ? "The user approved the requested action."
              : "The user declined the requested action. Do not retry it; choose a different action.");
          } catch {
            /* the run ended between park and decision */
          }
        }
        return { ok: true };
      }
      case "safety.grants.list":
        if (client.external) throw new AuxError("permission_denied", "Safety grants are managed in Aux.");
        return approvals.listGrants(params.profileId);
      case "safety.grants.revoke":
        if (client.external) throw new AuxError("permission_denied", "Safety grants are managed in Aux.");
        return { revoked: approvals.revoke(params) };
      case "runs.message.cancel":
        if (client.external) throw new AuxError("permission_denied", "Cancel queued messages in Aux.");
        return s.runs.messages.cancel(params.messageId);
      case "runs.events":
      case "events.since": {
        const p = params as { runId?: string; sinceSeq: number; limit: number };
        const out = s.events.since(p.sinceSeq, p.limit, p.runId);
        if (!scope) return out;
        // lastSeq still advances: filtered events were durably read and skipped.
        return { ...out, events: out.events.filter((event) => eventVisible(scope, client.connectionId, event)) };
      }

      // artifacts
      case "artifacts.list": {
        const artifacts = s.artifacts.list(params as never);
        if (!client.external) return artifacts;
        const images = s.runs.images.privateArtifactIds();
        return artifacts.filter((artifact) => !images.has(artifact.artifactId));
      }
      case "artifacts.read":
        if (client.external && s.runs.images.privateArtifactIds().has(params.artifactId))
          throw new AuxError("permission_denied", "Conversation image snapshots are inspected in Aux.");
        return s.artifacts.read(params.artifactId);

      // programs
      case "programs.list":
        return s.repo.listPrograms();
      case "programs.run":
        return s.runs.runProgram(params as never);
      case "programs.save": {
        const p = params as {
          name: string;
          description?: string;
          siteKey: string;
          steps?: unknown[];
          nodes?: unknown[];
          parameters: string[];
        };
        if (!p.steps?.length && !p.nodes?.length)
          throw new AuxError("invalid_params", "programs.save needs steps or nodes");
        const program = {
          programId: newProgramId(),
          name: p.name,
          description: p.description,
          version: 1,
          siteKey: p.siteKey,
          parameters: p.parameters,
          // stepsJson holds {steps,nodes} — legacy rows hold a bare steps array
          stepsJson: JSON.stringify(
            p.nodes?.length ? { steps: p.steps ?? [], nodes: p.nodes } : (p.steps ?? []),
          ),
          useCount: 0,
          createdAt: Date.now(),
        };
        s.repo.saveProgram(program);
        return program;
      }
      case "programs.delete": {
        s.repo.deleteProgram(params.programId);
        return { ok: true };
      }

      // sessions / chrome
      case "sessions.list":
        return s.repo.listSessions();
      case "chrome.attach":
        return s.chromeAttach((params as { port: number }).port);
      case "chrome.detach":
        return s.chromeDetach();
      case "chrome.tabs":
        return s.chromeTabs();
      case "chrome.importCookies":
        return s.importCookies(params);
      case "import.preview":
        return browserImporter(s).preview();
      case "import.run":
        return browserImporter(s).start(MethodSchemas["import.run"].parse(params));
      case "import.status":
        return browserImporter(s).status(MethodSchemas["import.status"].parse(params).jobId);
      case "import.cancel":
        return browserImporter(s).cancel(MethodSchemas["import.cancel"].parse(params).jobId);
      case "chrome.importBookmarks": {
        const p = MethodSchemas["chrome.importBookmarks"].parse(params);
        const files = chromeBookmarkFiles(p.profile);
        if (!files.length) {
          throw new AuxError(
            "not_found",
            p.profile
              ? `Chromium profile "${p.profile}" has no bookmarks store`
              : "no Chrome, Chromium, or Edge profile with bookmarks found on this machine",
          );
        }
        const seen = new Set<string>();
        const bookmarks = files
          .flatMap((f) => readChromeBookmarksFile(f.path))
          .filter((b) => !seen.has(b.url) && !!seen.add(b.url))
          .slice(0, 10000);
        const result = s.repo.importBookmarks(bookmarks);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return {
          ok: true,
          imported: result.added,
          skipped: result.skipped,
          profiles: files.map((f) => f.profile),
          detail: `read ${files.length} Chromium profile${files.length === 1 ? "" : "s"} (${files.map((f) => f.profile).join(", ")})`,
        };
      }
      case "chrome.openLive": {
        const page = s.pages.get(params.pageId);
        const chrome = s.drivers().chrome;
        if (page.backend !== "chrome") throw new AuxError("invalid_params", "not a chrome page");
        await chrome?.activateTarget?.(page.targetId);
        return { ok: true };
      }

      // models / settings
      case "translate.page":
        return translate.page(params.texts, params.target, params.context);
      case "translate.text":
        return translate.text(params.text, params.target, params.context);
      case "models.list":
        return s.settings.listModels();
      case "models.probe":
        return s.settings.probe((params as { modelId?: string }).modelId);
      case "settings.get": {
        const settings = s.settings.all();
        if (s.featureHost !== "chromium-fork") return settings;
        const searchEngine = await s.native?.searchEngineGet?.();
        if (!searchEngine) throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
        const searchSuggestions = await s.native?.searchSuggestionsGet?.();
        if (searchSuggestions === undefined)
          throw new AuxError("backend_unavailable", "Profile search suggestions are unavailable.");
        return { ...settings, searchEngine, searchSuggestions };
      }
      case "command.ranking.list":
        return commandRanking.list();
      case "command.ranking.record":
        return commandRanking.record(params.query, params.candidateKey, params.source);
      case "command.ranking.clear":
        return commandRanking.clear();
      case "settings.set": {
        const patch = { ...params };
        let searchEngine: string | undefined;
        let searchSuggestions: boolean | undefined;
        if (
          s.featureHost === "chromium-fork" &&
          (patch.searchEngine !== undefined || patch.searchSuggestions !== undefined)
        ) {
          if (Object.keys(patch).length !== 1)
            throw new AuxError(
              "invalid_params",
              "Save Profile search preferences separately from other settings.",
            );
          if (patch.searchEngine !== undefined) {
            if (!s.native?.searchEngineSet)
              throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
            await s.native.searchEngineSet(patch.searchEngine);
            searchEngine = await s.native.searchEngineGet?.();
            if (!searchEngine)
              throw new AuxError("backend_unavailable", "Profile search engine is unavailable.");
            delete patch.searchEngine;
          } else if (patch.searchSuggestions !== undefined) {
            if (!s.native?.searchSuggestionsSet)
              throw new AuxError("backend_unavailable", "Profile search suggestions are unavailable.");
            await s.native.searchSuggestionsSet(patch.searchSuggestions);
            searchSuggestions = await s.native.searchSuggestionsGet?.();
            if (searchSuggestions === undefined)
              throw new AuxError("backend_unavailable", "Profile search suggestions are unavailable.");
            delete patch.searchSuggestions;
          }
        }
        const r = Object.keys(patch).length ? await s.settings.set(patch as never) : { ok: true as const };
        // worker limits apply live — no restart needed
        s.runs.refreshPool();
        s.events.emit(EventTypes.SettingsChanged, {
          settings: {
            ...s.settings.all(),
            ...(searchEngine ? { searchEngine } : {}),
            ...(searchSuggestions !== undefined ? { searchSuggestions } : {}),
          },
        });
        return r;
      }

      case "browser.recovery.list":
      case "browser.recovery.retry": {
        if (client.external) throw new AuxError("permission_denied", "Restore browsing sessions in Aux.");
        return method === "browser.recovery.list"
          ? s.pages.recoveryTabs()
          : s.pages.retryRestore(params.pageId);
      }
      // history / bookmarks
      case "history.projectSnapshot": {
        if (client.external)
          throw new AuxError(
            "permission_denied",
            "Only the native HistoryService can project browsing history.",
          );
        const result = historyProjection.snapshot(params);
        if (result.accepted && result.committed) {
          s.checkpointDeletedData?.();
          s.events.emit("history.changed", {});
        }
        return result;
      }
      case "history.projectDelta": {
        if (client.external)
          throw new AuxError(
            "permission_denied",
            "Only the native HistoryService can project browsing history.",
          );
        const result = historyProjection.delta(params);
        if (result.accepted) {
          if (params.removals.length || params.clearRange) s.checkpointDeletedData?.();
          s.events.emit("history.changed", {});
        }
        return result;
      }
      case "history.list": {
        if (host === "chromium-fork" && !historyProjection.isCurrentSessionReady()) return [];
        return s.repo.listHistory(params.query, params.limit, params);
      }
      case "history.clear": {
        if (client.external)
          throw new AuxError("permission_denied", "Manage browsing history in Aux Library.");
        let removed: number;
        if (historyProjection.isAuthoritative()) {
          if (!s.native?.historyClear)
            throw new AuxError("backend_unavailable", "Chromium HistoryService is unavailable.");
          removed = (await s.native.historyClear(params)).removed;
        } else removed = s.repo.clearHistory(params);
        if (removed && !historyProjection.isAuthoritative()) s.checkpointDeletedData?.();
        if (!historyProjection.isAuthoritative()) s.events.emit("history.changed", {});
        return { ok: true, removed };
      }
      case "history.remove": {
        if (client.external)
          throw new AuxError("permission_denied", "Manage browsing history in Aux Library.");
        let removed: boolean;
        if (historyProjection.isAuthoritative()) {
          if (!s.native?.historyRemove)
            throw new AuxError("backend_unavailable", "Chromium HistoryService is unavailable.");
          removed = (await s.native.historyRemove(params.url, params.visitedAt)).removed;
        } else removed = s.repo.removeHistory(params.url, params.visitedAt);
        if (removed && !historyProjection.isAuthoritative()) s.checkpointDeletedData?.();
        if (!historyProjection.isAuthoritative()) s.events.emit("history.changed", {});
        return { removed };
      }
      case "bookmarks.list":
        return s.repo.listBookmarks();
      case "bookmarks.folders.list":
        return s.repo.bookmarkFolders();
      case "bookmarks.folders.create":
      case "bookmarks.folders.rename":
      case "bookmarks.folders.remove": {
        if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
        const folders =
          method === "bookmarks.folders.create"
            ? s.repo.createBookmarkFolder(params.path)
            : method === "bookmarks.folders.rename"
              ? s.repo.renameBookmarkFolder(params.path, params.name)
              : s.repo.removeBookmarkFolder(params.path);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return folders;
      }
      case "bookmarks.add": {
        const p = MethodSchemas["bookmarks.add"].parse(params);
        s.repo.addBookmark(p.url, p.title, p.folderPath, p.readingList);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.readingList": {
        const p = MethodSchemas["bookmarks.readingList"].parse(params);
        s.repo.setReadingList(p.url, p.readingList, p.title);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.markRead": {
        const p = MethodSchemas["bookmarks.markRead"].parse(params);
        s.repo.markBookmarkRead(p.url, p.read);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.offline.set": {
        const p = MethodSchemas["bookmarks.offline.set"].parse(params);
        const saved =
          host === "chromium-fork" && s.native?.bookmarksInvoke
            ? ((await s.native.bookmarksInvoke("bookmarks.list", {})) as {
                url: string;
                readingList?: boolean;
              }[])
            : s.repo.listBookmarks();
        if (!saved.some((item) => item.url === p.url && item.readingList))
          throw new AuxError(
            "permission_denied",
            "Save the page to the reading list before keeping an offline copy.",
          );
        s.repo.saveBookmarkArticle(p.url, p.article);
        s.events.emit("bookmarks.changed", {
          bookmarks:
            host === "chromium-fork"
              ? saved.map((item) => ({
                  ...item,
                  offline: item.readingList && !!s.repo.getBookmarkArticle(item.url),
                }))
              : s.repo.listBookmarks(),
        });
        return { ok: true };
      }
      case "bookmarks.offline.get": {
        const p = MethodSchemas["bookmarks.offline.get"].parse(params);
        return s.repo.getBookmarkArticle(p.url) ?? { article: null, savedAt: null };
      }
      case "bookmarks.update": {
        if (client.external) throw new AuxError("permission_denied", "Edit bookmarks in Aux Library.");
        s.repo.updateBookmark(MethodSchemas["bookmarks.update"].parse(params));
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "bookmarks.move": {
        if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
        const result = s.repo.moveBookmarks(MethodSchemas["bookmarks.move"].parse(params));
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return result;
      }
      case "bookmarks.saveFolder": {
        if (client.external) throw new AuxError("permission_denied", "Organize bookmarks in Aux Library.");
        const p = MethodSchemas["bookmarks.saveFolder"].parse(params);
        const result = s.repo.saveBookmarkFolder(p.name, p.bookmarks);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return result;
      }
      case "bookmarks.import": {
        const p = MethodSchemas["bookmarks.import"].parse(params);
        const result = s.repo.importBookmarks(p.bookmarks, p.folders);
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return result;
      }
      case "bookmarks.remove": {
        s.repo.removeBookmark((params as { url: string }).url);
        s.checkpointDeletedData?.();
        s.events.emit("bookmarks.changed", { bookmarks: s.repo.listBookmarks() });
        return { ok: true };
      }
      case "downloads.list":
        return s.repo.listDownloads();
      case "downloads.remove": {
        if (client.external) throw new AuxError("permission_denied", "Manage downloads in Aux.");
        const removed = s.repo.removeFinishedDownloads(params.ids);
        if (removed.length) s.checkpointDeletedData?.();
        if (removed.length) s.events.emit(EventTypes.DownloadsRemoved, { ids: removed });
        return { removed };
      }

      case "workspace.get": {
        const pages = scope
          ? s.pages.list().filter((page) => scopedPageIds(scope, client.connectionId).has(page.pageId))
          : s.pages.list();
        const taskIds = scope ? new Set(scopedTasks(scope).map((task) => task.taskId)) : null;
        const runs = s.runs.coordinator
          .list(50)
          .filter((run) => !taskIds || (!!run.config?.taskId && taskIds.has(run.config.taskId)));
        return {
          restoringTabs: s.pages.isRestoringTabs,
          pendingRestoreTabs: scope
            ? []
            : s.pages.recoveryTabs().map((tab) => ({ pageId: tab.pageId, windowId: tab.windowId })),
          tabPlacements: scope
            ? {}
            : Object.fromEntries(
                pages.flatMap((page) => {
                  const placement = s.repo.getSetting(`tab-placement:${page.pageId}`);
                  return placement ? [[page.pageId, placement]] : [];
                }),
              ),
          pages,
          sets: scope ? [] : s.sets.list(),
          members: scope ? [] : s.sets.list().flatMap((set) => s.repo.listMembers(set.setId)),
          runs,
          sessions: scope ? [] : s.repo.listSessions(),
          activePageId: pages.some((page) => page.pageId === s.pages.activePageId)
            ? s.pages.activePageId
            : null,
          lastSeq: s.repo.lastSeq(),
        };
      }

      case "bench.run": {
        const p = params as { task?: string; repeats?: number };
        return s.benchRun(p.task, p.repeats);
      }

      // ---- runtime-vnext: response capture / state / datasets / operations / traces ----
      case "responses.list": {
        if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
        await s.responses.flush(); // capture persists asynchronously — readers see everything landed so far
        return s.responses.list(params.pageId, params as never);
      }
      case "responses.body": {
        if (!s.responses) throw new AuxError("backend_unavailable", "response capture not wired");
        await s.responses.flush();
        const b = s.responses.body(params.requestId);
        if (!b) throw new AuxError("not_found", `no captured body for ${params.requestId}`);
        return { mediaType: b.mediaType, dataBase64: b.buffer.toString("base64") };
      }
      case "state.query": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        if (params.entity === "responses") await s.responses?.flush();
        return s.state.query(params);
      }
      case "state.datasets": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        return s.state.listDatasets(params as never);
      }
      case "datasets.rows": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        const p = params as { datasetId: string; limit?: number };
        return s.state.rows(p.datasetId).slice(0, p.limit ?? 5000);
      }
      case "datasets.transform": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        const p = params as { datasetId: string; op: string; args?: Record<string, unknown> };
        return s.state.transform(p.datasetId, p.op, p.args);
      }
      case "datasets.save": {
        if (!s.state) throw new AuxError("backend_unavailable", "state index not wired");
        return s.state.saveDataset(params as never);
      }
      case "operations.list": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.list((params as { siteKey?: string }).siteKey);
      }
      case "operations.get": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string };
        return s.operations.get(p.siteKey, p.name);
      }
      case "operations.saveProgram": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.saveFromProgram(params as never);
      }
      case "operations.saveRequest": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.saveRequestImpl(params as never);
      }
      case "operations.invoke": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { pageId?: string };
        return p.pageId
          ? withExternalPage(p.pageId, () => s.operations!.invoke(params as never), undefined, true)
          : s.operations.invoke(params as never);
      }
      case "operations.explain": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string; pageId?: string };
        return s.operations.explain(p.siteKey, p.name, { pageId: p.pageId });
      }
      case "operations.setImplState": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { implId: string; state: "candidate" | "validated" | "shadow" | "quarantined" };
        return s.operations.setImplState(p.implId, p.state);
      }
      case "operations.disable": {
        // quarantine is the disable — the impl stays on record but never routes
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.setImplState((params as { implId: string }).implId, "quarantined");
      }
      case "operations.forget": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        const p = params as { siteKey: string; name: string };
        return s.operations.forget(p.siteKey, p.name);
      }
      case "operations.compile": {
        if (!s.operations) throw new AuxError("backend_unavailable", "operation registry not wired");
        return s.operations.compileFromRun(params as { runId: string; siteKey?: string; name?: string });
      }
      case "programs.validate": {
        // schema already parsed — add structural checks the schema can't express
        const p = (params as { program: unknown }).program;
        const errors: string[] = [];
        const prog = p as { steps?: { id: string; op: string }[]; nodes?: unknown[] };
        if (!prog.steps?.length && !prog.nodes?.length) errors.push("program has neither steps nor nodes");
        const ids = new Set<string>();
        for (const st of prog.steps ?? []) {
          if (ids.has(st.id)) errors.push(`duplicate step id ${st.id}`);
          ids.add(st.id);
        }
        (prog.steps ?? []).forEach((st, i, arr) => {
          if (st.op === "expectDownload" && i === arr.length - 1)
            errors.push("expectDownload must precede the trigger step");
        });
        return { ok: errors.length === 0, errors };
      }
      case "traces.list": {
        if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
        const p = params as { since?: number; runId?: string; limit?: number };
        return s.tracer.spansSince(p.since ?? 0, p.limit ?? 500, p.runId);
      }
      case "traces.summary": {
        if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
        return s.tracer.summary((params as { runId: string }).runId);
      }
      case "traces.counters": {
        if (!s.tracer) throw new AuxError("backend_unavailable", "tracing not wired");
        return s.tracer.counters(); // flushes the in-memory increments first
      }
      case "runtime.describe": {
        // capability surface for external clients — what this runtime can do (§16.2)
        const backends = [...new Set(s.repo.listPages({ includeDetached: true }).map((p) => p.backend))];
        return {
          version: 1,
          featureStages: await s.featureStages,
          methods: Object.keys(MethodSchemas).sort(),
          entities: [
            "pages",
            "sets",
            "runs",
            "programs",
            "operations",
            "datasets",
            "responses",
            "artifacts",
            "observations",
            "spans",
          ],
          programForms: { steps: true, nodes: true },
          nodeKinds: [
            "step",
            "let",
            "if",
            "forEach",
            "until",
            "observe",
            "assert",
            "emit",
            "checkpoint",
            "return",
            "call",
          ],
          implKinds: ["browser-program", "session-request"],
          effectClasses: ["read", "write", "destructive"],
          implStates: ["candidate", "validated", "shadow", "quarantined"],
          stateEntities: ["controls", "records", "responses", "artifacts", "operations", "datasets"],
          // §16.2 — clients must not assume capabilities the backend lacks
          backends,
          limits: {
            maxStepsPerProgram: 200,
            maxNodesPerProgram: 400,
            maxForEachConcurrency: 8,
            defaultNodeBudget: 2000,
            defaultIterationBudget: 500,
            observeMaxElements: 120,
            observeMaxTextChars: 6000,
          },
          features: {
            responseCapture: !!s.responses,
            operationRegistry: !!s.operations,
            stateIndex: !!s.state,
            tracing: !!s.tracer,
            chromeAttach: true,
            takeover: true,
            // Runs are crash-safe (the ledger marks them interrupted) but NOT
            // resumable after a restart; program checkpoints (`resumeFrom`)
            // are the only resume primitive. Advertise exactly that.
            checkpointResume: false,
            programCheckpoints: true,
            invocationIdempotency: true,
            webmcpTools: false,
            bidi: true,
            crashReview: true,
          },
        };
      }
    }
  }
  return Object.assign(invoke, {
    eventVisible: (scope: AgentConnectionScope, connectionId: string | undefined, event: AuxEvent) =>
      eventVisible(scope, connectionId, event),
    dispose: async () => {
      turnTabs.dispose();
      await turnTabs.endAll();
      codeMode.disposeAll();
    },
  });
}
