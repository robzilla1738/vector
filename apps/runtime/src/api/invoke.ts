import type { AgentConnectionScope, AuxEvent, MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas, ResponseRecordSchema, requireAuxMethod } from "@aux/contracts";
import { RuntimeAuthorization } from "./authorization.generated.js";
import { buildMethodDeps } from "./methods/context.js";
import type { MethodCtx, MethodDeps, Services } from "./methods/context.js";
import { pageToolTarget } from "../safety/page-tool-access.js";
import { METHODS } from "./methods/index.js";
export type { Services } from "./methods/context.js";

/** Validates params against MethodSchemas and dispatches to domain handlers. */
export function makeInvoker(s: Services) {
  const deps = buildMethodDeps(s, invoke);

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
    if ((client.external || client.codeMode) && policy.auth === "aux-webui") {
      throw new AuxError("permission_denied", `${method} is managed in Aux.`);
    }
    const host = s.featureHost ?? "chromium-fork";
    requireAuxMethod(method, host, await s.featureStages);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = schema.parse(rawParams ?? {});

    const scope = client.external ? client.scope : undefined;
    if (
      scope &&
      client.connectionId &&
      s.agentConnections &&
      !s.agentConnections.isLive({ external: true, connectionId: client.connectionId, scope })
    ) {
      await s.externalSessions?.sweepIdle();
      throw new AuxError(
        "permission_denied",
        "This external connection expired, was revoked, or changed scope.",
      );
    }
    if (scope) {
      if (method === "agent.js.run" || method === "agent.js.reset") {
        // The code-mode host calls this same invoker with the same client.
        // Each nested method is checked against the connection's scope.
      }
      if (method === "workspaces.create" || method === "pages.moveToWindow" || method === "pages.resume" || method === "pages.takeover")
        throw new AuxError("permission_denied", "Browser organization and human control are managed in Aux.");
      if (method === "pages.open" || method === "runs.start") {
        if (!params.taskId || params.expectedRevision === undefined)
          throw new AuxError("invalid_params", "Scoped creation requires taskId and expectedRevision.");
        const task = deps.requireScopedTask(scope, params.taskId);
        if (task.revision !== params.expectedRevision)
          throw new AuxError("conflict", "Task revision changed before creating browser authority.");
        for (const pageId of params.pageIds ?? (params.pageId ? [params.pageId] : []))
          deps.requireScopedPage(scope, pageId, client.connectionId);
      } else if (method === "tasks.create") {
        if (scope.kind === "workspace" || scope.kind === "session") {
          if (params.workspaceId !== scope.workspaceId)
            throw new AuxError(
              "permission_denied",
              "This connection cannot create tasks outside its workspace",
            );
          if (params.parentTaskId) deps.requireScopedTask(scope, params.parentTaskId);
        } else {
          if (typeof params.parentTaskId !== "string")
            throw new AuxError("permission_denied", "A task-scoped connection can only create a child task");
          const parent = deps.requireScopedTask(scope, params.parentTaskId);
          if (params.workspaceId !== parent.workspaceId)
            throw new AuxError("permission_denied", "A child task must remain in its parent workspace");
        }
        if (params.resources?.length)
          throw new AuxError(
            "permission_denied",
            "Attach browser pages and local projects in Aux before using them through this connection",
          );
      } else if (method.startsWith("tasks.") && typeof params.taskId === "string") {
        deps.requireScopedTask(scope, params.taskId);
        if (method === "tasks.update" && params.resources !== undefined)
          throw new AuxError(
            "permission_denied",
            "Scoped connections cannot change task resource authority; attach or remove resources in Aux",
          );
      } else if (
        (method === "calendar.taskGrants.list" || method === "calendar.taskEvents.list") &&
        typeof params.taskId === "string"
      ) {
        deps.requireScopedTask(scope, params.taskId);
      } else if (
        method === "agent.web.fetch" ||
        method === "agent.web.search" ||
        method === "agent.tabs.list" ||
        method === "agent.images.generate" ||
        method === "agent.turn.open" ||
        method === "agent.turn.end" ||
        method.startsWith("agent.turn.clipboard.")
      ) {
        if (!params.taskId || !params.expectedRevision)
          throw new AuxError("invalid_params", "Scoped agent tools require a task ID and revision.");
        const task = deps.requireScopedTask(scope, params.taskId);
        if (method !== "agent.turn.end" && task.revision !== params.expectedRevision)
          throw new AuxError("conflict", "Task revision changed; refresh it before using agent tools.");
      } else if (method === "sites.read") {
        deps.requireScopedTask(scope, params.taskId);
        deps.requireScopedPage(scope, params.pageId, client.connectionId);
      } else if (method.startsWith("pages.") && method !== "pages.list") {
        const pageId = typeof params.pageId === "string" ? params.pageId : params.program?.pageId;
        if (typeof pageId !== "string") throw new AuxError("permission_denied", "A scoped page is required");
        deps.requireScopedPage(scope, pageId, client.connectionId);
        if (["pages.execute", "pages.cuaExecute", "pages.close", "pages.navigate", "pages.back", "pages.forward", "pages.reload", "pages.stop"].includes(method) || (method === "pages.dialog" && params.action !== "list")) {
          if (typeof params.taskId !== "string" || typeof params.expectedRevision !== "number")
            throw new AuxError("invalid_params", "Scoped page programs require taskId and expectedRevision");
          const task = deps.requireScopedTask(scope, params.taskId);
          if (task.revision !== params.expectedRevision)
            throw new AuxError("conflict", "Task revision changed before using this page.");
        }
      } else if (method === "results.generate") {
        if (!params.taskId || !params.expectedRevision)
          throw new AuxError("invalid_params", "Scoped generated results require a task ID and revision.");
        const task = deps.requireScopedTask(scope, params.taskId);
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
        deps.requireScopedTask(scope, run.config.taskId);
      } else if (method.startsWith("subagents.")) {
        const parentRunId =
          method === "subagents.createGroup"
            ? params.parentRunId
            : deps.subagents.view(params.groupId ?? deps.subagents.groupIdForAgent(params.agentId)).group
                .parentRunId;
        const parent = s.repo.getRun(parentRunId);
        if (!parent?.config?.taskId)
          throw new AuxError("permission_denied", "Subagents require a scoped parent task.");
        deps.requireScopedTask(scope, parent.config.taskId);
        if (
          (method === "subagents.spawn" || method === "subagents.forkSelf") &&
          params.pageIds.some((pageId: string) => !deps.scopedPageIds(scope, client.connectionId).has(pageId))
        )
          throw new AuxError("permission_denied", "A subagent page is outside this connection's scope.");
      } else if (method === "mcp.tools.call") {
        if (params.context.workspaceId !== scope.workspaceId)
          throw new AuxError("permission_denied", "MCP tool calls cannot leave this connection's Space.");
        const taskId = params.context.taskId ?? (scope.kind === "task" ? scope.taskId : undefined);
        const task = taskId ? deps.requireScopedTask(scope, taskId) : undefined;
        if (params.context.revision !== undefined && params.context.revision !== task?.revision)
          throw new AuxError("conflict", "The MCP task revision changed. Review the current task.");
        params.context = {
          workspaceId: scope.workspaceId,
          ...(task ? { taskId: task.taskId, revision: task.revision } : {}),
        };
      } else if (method === "plugins.skills.read") {
        const task = deps.requireScopedTask(scope, params.taskId);
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
      if (method === "tasks.start" || method === "tasks.replaceAgent") {
        if (params.contextMemoryIds?.length || params.mentions?.length || params.contextPageRefs?.length || params.defaultWorkspaceId || params.chatId || params.setId)
          throw new AuxError("permission_denied", "External runs inherit only the reviewed task context and scoped attachments.");
        for (const pageId of params.pageIds ?? (params.pageId ? [params.pageId] : [])) deps.requireScopedPage(scope, pageId, client.connectionId);
      }
    }

    // S6.7 — a scoped connection's work lands on its first-class session run:
    // presence in Tasks, and the runId that stamps approvals/effect decisions.
    const externalRunId =
      scope && client.connectionId
        ? s.externalSessions?.ensure({ connectionId: client.connectionId, scope })
        : undefined;
    if (scope && client.connectionId && s.externalSessions && !externalRunId)
      throw new AuxError("permission_denied", "This external session is no longer authorized.");

    const withExternalPage = async <T>(
      pageId: string,
      action: () => Promise<T>,
      taskId?: string,
      internalAutomation = false,
      transmission: "required" | "none" = "required",
    ): Promise<T> => {
      // A scoped agent, or internal automation, takes the tab. The unscoped
      // loopback owner is the local profile and keeps browsing while that
      // program is still waiting.
      const automated =
        internalAutomation || (client.external && (client.connectionId !== undefined || scope !== undefined));
      const release = automated
        ? s.runs.pageOwnership.tryAcquire({
            pageId,
            actor: "external",
            runId: externalRunId,
            taskId,
            connectionId: client.connectionId,
          })
        : undefined;
      let revokeEgress: (() => void) | undefined;
      try {
        if (externalRunId && client.connectionId) s.externalSessions?.notePage(client.connectionId, pageId);
        if (automated && s.pages.get(pageId).controller === "human")
          throw new AuxError(
            "conflict",
            "A person controls this tab; return control before an automated action",
          );
        // A read stays on the task page. The protected temporary tab is only
        // for a program that can change or send the document.
        if (automated && externalRunId && transmission !== "none")
          revokeEgress = await s.runs.acquireBrowserEgress?.(externalRunId, pageId);
        return await action();
      } finally {
        revokeEgress?.();
        release?.();
      }
    };

    const ctx: MethodCtx = Object.assign(Object.create(deps) as MethodDeps, {
      method: method as MethodName,
      params,
      client,
      scope,
      host,
      invoke,
      externalRunId,
      withExternalPage,
    });
    const tracked = async <T>(action: () => Promise<T>): Promise<T> => {
      if (!externalRunId || !client.connectionId || !s.externalSessions) return action();
      const startedAt = Date.now();
      try {
        const result = await action();
        s.externalSessions.noteInvocation(client.connectionId, externalRunId, method, startedAt, true);
        return result;
      } catch (error) {
        const parked = error instanceof AuxError && error.code === "needs_input" &&
          s.externalSessions.needsInput(client.connectionId, externalRunId);
        if (!parked) s.externalSessions.noteInvocation(client.connectionId, externalRunId, method, startedAt, false);
        throw error;
      }
    };

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
      const result = await tracked(() => s.native!.bookmarksInvoke!(method, params));
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

    return tracked(async () => {
      // Closing destroys the original attachment. Its handler proves exact creator ownership
      // and waits for the native close ACK; a post-close document-read fence would be invalid.
      if (scope && ctx.method === "pages.close") return METHODS[ctx.method](ctx);
      let target = pageToolTarget(ctx.method, params);
      if (externalRunId && ctx.method === "responses.body") {
        if (!s.responses) throw new AuxError("backend_unavailable", "Response capture is unavailable.");
        await s.responses.flush();
        const record = s.repo.getResponse(params.requestId);
        if (!record) throw new AuxError("not_found", "The captured response is unavailable.");
        target = { pageId: ResponseRecordSchema.parse(record).pageId, access: "read" };
      }
      if (!externalRunId || !target) return METHODS[ctx.method](ctx);
      const run = s.repo.getRun(externalRunId);
      const explicit = !!run?.config?.mentions?.length;
      const created = s.turnMentions.ownedPages(externalRunId).includes(target.pageId);
      if (explicit || created) {
        const taskRead =
          target.access === "read" && scope
            ? deps.captureScopedTaskRead(scope, target.pageId, externalRunId, client.connectionId)
            : undefined;
        ctx.taskRead = taskRead;
        const policy =
          target.access === "read"
            ? await s.pages.authorizeAgentRead(externalRunId, target.pageId, ctx.method, taskRead)
            : undefined;
        return s.turnMentions.use(
          externalRunId,
          target.pageId,
          target.access,
          async () => {
            policy?.();
            const result = await METHODS[ctx.method](ctx);
            policy?.();
            return result;
          },
          taskRead,
        );
      }
      // Source-task authorization remains the prior person-approved path.
      // A task resource is never relabelled as a run-created page or mention.
      if (!scope) throw new AuxError("permission_denied", "A current task page scope is required.");
      deps.requireScopedPage(scope, target.pageId, client.connectionId);
      const recheckSource = deps.captureScopedPageSource(scope, target.pageId, client.connectionId);
      const before = s.pages.get(target.pageId);
      const identity = { sessionId: before.sessionId, documentEpoch: before.documentEpoch, url: before.url };
      if (!identity.sessionId || before.viewStatus === "detached" || before.viewStatus === "crashed")
        throw new AuxError("target_detached", "The authorized task attachment is unavailable.");
      const taskRead =
        target.access === "read"
          ? deps.captureScopedTaskRead(scope, target.pageId, externalRunId, client.connectionId)
          : undefined;
      const recheckReadPolicy =
        target.access === "read"
          ? await s.pages.authorizeAgentRead(externalRunId, target.pageId, ctx.method, taskRead)
          : undefined;
      ctx.taskRead = taskRead;
      recheckSource();
      const ready = s.pages.get(target.pageId);
      if (
        ready.sessionId !== identity.sessionId ||
        ready.viewStatus === "detached" ||
        ready.viewStatus === "crashed" ||
        (target.access === "read" &&
          (ready.documentEpoch !== identity.documentEpoch || ready.url !== identity.url))
      )
        throw new AuxError("ref_stale", "The approved source changed while authorizing its read.");
      recheckReadPolicy?.();
      const result = await METHODS[ctx.method](ctx);
      recheckReadPolicy?.();
      deps.requireScopedPage(scope, target.pageId, client.connectionId);
      recheckSource();
      const currentRun = s.repo.getRun(externalRunId);
      if (
        !currentRun ||
        !["running", "planning", "needs_input"].includes(currentRun.status) ||
        currentRun.config?.externalConnectionId !== client.connectionId ||
        currentRun.config?.taskRevision !== run?.config?.taskRevision ||
        currentRun.config?.messageRevision !== run?.config?.messageRevision
      )
        throw new AuxError(
          "permission_denied",
          "This external tool turn ended or changed while using its source.",
        );
      if (
        client.connectionId &&
        s.agentConnections &&
        !s.agentConnections.isLive({ external: true, connectionId: client.connectionId, scope })
      )
        throw new AuxError("permission_denied", "This connection changed during the tool call.");
      const current = s.pages.get(target.pageId);
      if (
        current.sessionId !== identity.sessionId ||
        current.viewStatus === "detached" ||
        current.viewStatus === "crashed" ||
        (target.access === "read" &&
          (current.documentEpoch !== identity.documentEpoch || current.url !== identity.url))
      )
        throw new AuxError("ref_stale", "The authorized task document changed while using it.");
      return result;
    });
  }
  return Object.assign(invoke, {
    eventVisible: (scope: AgentConnectionScope, connectionId: string | undefined, event: AuxEvent) =>
      deps.eventVisible(scope, connectionId, event),
    endConnection: (connectionId: string) => deps.endConnection(connectionId),
    dispose: () => deps.dispose(),
  });
}
