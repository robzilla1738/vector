import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";

async function h_workspace_get(ctx: MethodCtx): Promise<unknown> {
  const { client, s, scope, scopedPageIds, scopedTasks } = ctx;
  const listed = scope
    ? s.pages.list().filter((page) => scopedPageIds(scope, client.connectionId).has(page.pageId))
    : s.pages.list();
  // A tab that still had a renderer stays out of this snapshot until reload.
  // Showing the session-restore placeholder would report it as sleeping.
  const livePages = scope
    ? listed
    : listed.filter((page) => s.pages.restoredTabShown(page.pageId, page.lifecycle));
  // Saved tabs without a native target belong in the owner's strip. They are
  // presentation placeholders; pages.list and scoped clients remain live only.
  const pages = scope
    ? livePages
    : [
        ...livePages,
        ...s.pages.recoveryTabs().flatMap((tab) => {
          if (listed.some((page) => page.pageId === tab.pageId)) return [];
          if (!s.pages.restoredTabShown(tab.pageId, "placeholder")) return [];
          const previous = s.repo.getPage(tab.pageId);
          return previous
            ? [
                {
                  ...previous,
                  url: tab.url,
                  title: tab.title,
                  windowId: tab.windowId,
                  lifecycle: "placeholder" as const,
                  viewStatus: "hidden" as const,
                  loading: false,
                },
              ]
            : [];
        }),
      ];
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
