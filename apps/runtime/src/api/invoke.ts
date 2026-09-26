import type { AgentConnectionScope, AuxEvent, MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas, requireAuxMethod } from "@aux/contracts";
import { RuntimeAuthorization } from "./authorization.generated.js";
import { buildMethodDeps } from "./methods/context.js";
import type { MethodCtx, Services } from "./methods/context.js";
import { METHODS } from "./methods/index.js";
export type { Services } from "./methods/context.js";

/** Validates params against MethodSchemas and dispatches to domain handlers. */
export function makeInvoker(s: Services) {
  const deps = buildMethodDeps(s, invoke);
  const { codeMode, eventVisible, requireScopedPage, requireScopedTask, scopedPageIds, subagents, turnTabs } =
    deps;
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

    // S6.7 — a scoped connection's work lands on its first-class session run:
    // presence in Tasks, and the runId that stamps approvals/effect decisions.
    const externalRunId =
      scope && client.connectionId
        ? s.externalSessions?.ensure({ connectionId: client.connectionId, scope })
        : undefined;

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
        if (externalRunId && client.connectionId) s.externalSessions?.notePage(client.connectionId, pageId);
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

    const ctx: MethodCtx = {
      ...deps,
      method: method as MethodName,
      params,
      client,
      scope,
      host,
      invoke,
      externalRunId,
      withExternalPage,
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

    return METHODS[method as MethodName](ctx);
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
