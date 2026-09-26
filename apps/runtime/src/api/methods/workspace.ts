import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_workspace_get(ctx: MethodCtx): Promise<unknown> {
  const { client, s, scope, scopedPageIds, scopedTasks } = ctx;
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
    activePageId: pages.some((page) => page.pageId === s.pages.activePageId) ? s.pages.activePageId : null,
    lastSeq: s.repo.lastSeq(),
    streamId: s.repo.streamId(),
  };
}

export const workspaceMethods: Partial<Record<MethodName, MethodHandler>> = {
  "workspace.get": h_workspace_get,
};
