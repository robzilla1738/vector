import { nativeDocumentSource } from "./document-source.js";
import { exportTaskReceipt } from "../../services/task-receipt-export.js";
import { withTaskAuthorityMutation } from "../../services/overnight-authority.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, taskMatchesQuery } from "@aux/contracts";

async function h_tasks_receipt(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  const receipt = taskEvidence.receipt(params.taskId, params.revision);
  return client.external
    ? {
        ...receipt,
        undoReviews: [],
        browserChanges: receipt.browserChanges.map(({ before: _before, after: _after, ...change }) => change),
        tabChanges: receipt.tabChanges.map(({ url: _url, ...change }) => change),
        groupChanges: [],
        remoteActions: receipt.remoteActions.map(
          ({ browserObserved: _browserObserved, ...change }) => change,
        ),
        bookmarkChanges: receipt.bookmarkChanges.map(({ url: _url, title: _title, ...change }) => change),
        downloadChanges: receipt.downloadChanges.map(
          ({ filename: _filename, sourceUrl: _sourceUrl, path: _path, ...change }) => change,
        ),
        historyChanges: receipt.historyChanges.map(({ url: _url, title: _title, ...change }) => change),
      }
    : receipt;
}
async function h_tasks_exportReceipt(ctx: MethodCtx): Promise<unknown> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Export this receipt from its original Aux window.");
  return exportTaskReceipt(
    {
      repo: ctx.s.repo,
      evidence: ctx.taskEvidence,
      documents: ctx.s.documentSnapshots,
      artifacts: ctx.s.artifacts,
    },
    ctx.params,
    { token, signal: AbortSignal.timeout(75_000) },
  );
}
async function h_tasks_undoBrowserChange(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Undo requires the Aux desktop interface");
  return taskEvidence.undoBrowserChange(params);
}
async function h_tasks_undoRunBrowserChanges(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Undo requires the Aux desktop interface");
  return taskEvidence.undoRunBrowserChanges(params);
}
async function h_tasks_undoBookmarkChange(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Undo requires the Aux desktop interface");
  return taskEvidence.undoBookmarkChange(params);
}
async function h_tasks_undoDownloadChange(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Download cleanup requires the Aux desktop interface");
  return taskEvidence.undoDownloadChange(params);
}
async function h_tasks_undoHistoryChange(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "History cleanup requires the Aux desktop interface");
  return taskEvidence.undoHistoryChange(params);
}
async function h_tasks_verifyCriterion(ctx: MethodCtx): Promise<unknown> {
  const { params, taskEvidence } = ctx;
  return taskEvidence.verifyCriterion(params);
}
async function h_tasks_replaceAgent(ctx: MethodCtx): Promise<unknown> {
  const { client, params, requireScopedPage, scope } = ctx;
  const pageIds = params.pageIds ?? (params.pageId ? [params.pageId] : []);
  if (scope && Array.isArray(pageIds))
    for (const pageId of pageIds) requireScopedPage(scope, pageId, client.connectionId);

  if (["tasks.replaceAgent"].includes(ctx.method))
    return withTaskAuthorityMutation(ctx.s.repo, ctx.params.taskId, () => retired_h_tasks_replaceAgent(ctx));
  return retired_h_tasks_replaceAgent(ctx);
}

async function retired_h_tasks_replaceAgent(ctx: MethodCtx): Promise<unknown> {
  const { params, s, tasks } = ctx;
  const details = tasks.details(params.taskId);
  for (const { run } of details.runs) {
    if (run.runId !== ctx.externalRunId && ["queued", "planning", "running", "paused", "needs_input"].includes(run.status))
      await s.runs.cancel(run.runId);
  }
  const pageIds = params.pageIds ?? (params.pageId ? [params.pageId] : []);
  return s.runs.start({
    ...tasks.prepareRun(params.taskId, params.expectedRevision, params.context, ctx.externalRunId),
    ...(ctx.scope && ctx.client.connectionId ? {externalConnectionId: ctx.client.connectionId, externalParentRunId: ctx.externalRunId} : {}),
    pageIds,
    modelId: params.modelId,
    nativeTurnContext: ctx.client.nativeTurnContext,
  });
}
async function h_tasks_recordEvidence(ctx: MethodCtx): Promise<unknown> {
  const { client, params, taskEvidence } = ctx;
  return taskEvidence.recordNote(params, client.external ? "external_client" : "desktop_user");
}
async function h_tasks_importDocumentEvidence(ctx: MethodCtx): Promise<unknown> {
  const { source, context } = nativeDocumentSource(ctx, ctx.params);
  return ctx.taskEvidence.importDocument(ctx.params, source, context);
}
async function h_tasks_importTextEvidence(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external)
    throw new AuxError("permission_denied", "Document import requires the Aux desktop interface.");
  return ctx.taskEvidence.importText(ctx.params);
}
async function h_tasks_readDocumentEvidence(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Inspect document snapshots in Aux.");
  return ctx.taskEvidence.readDocument(ctx.params);
}
async function h_tasks_captureEvidence(ctx: MethodCtx): Promise<unknown> {
  const { params, taskEvidence } = ctx;
  return taskEvidence.capture(params);
}
async function h_tasks_reviewCriterion(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, taskEvidence } = ctx;
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
async function h_tasks_create(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  if (
    client.external &&
    Array.isArray(params.resources) &&
    params.resources.some((resource: { access?: string }) => resource.access === "write")
  ) {
    throw new AuxError("permission_denied", "Write access on task resources can only be set in Aux.");
  }
  return tasks.create(params, client.external ? "external" : "desktop");
}
async function h_tasks_promote(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Save a conversation as a task in Aux.");
  return tasks.promote(params);
}
async function h_tasks_get(ctx: MethodCtx): Promise<unknown> {
  const { params, taskEvidence, tasks } = ctx;
  const details = tasks.details(params.taskId);
  return {
    ...details,
    children: details.children.map((child) => ({
      ...child,
      receiptStatus: taskEvidence.receipt(child.task.taskId).status,
    })),
  };
}
async function h_tasks_list(ctx: MethodCtx): Promise<unknown> {
  const { params, scope, scopedTasks, tasks } = ctx;
  return scope
    ? scopedTasks(scope)
        .filter(
          (task) => (params.includeArchived || task.state === "open") && taskMatchesQuery(task, params.query),
        )
        .slice(0, params.limit)
    : tasks.list(params);
}
async function h_tasks_update(ctx: MethodCtx): Promise<unknown> {
  const { client, params } = ctx;
  if (
    client.external &&
    Array.isArray(params.resources) &&
    params.resources.some((resource: { access?: string }) => resource.access === "write")
  ) {
    throw new AuxError("permission_denied", "Write access on task resources can only be set in Aux.");
  }

  if (["tasks.update"].includes(ctx.method))
    return withTaskAuthorityMutation(ctx.s.repo, ctx.params.taskId, () => retired_h_tasks_update(ctx));
  return retired_h_tasks_update(ctx);
}

async function retired_h_tasks_update(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  return tasks.update(params, client.external ? "external" : "desktop");
}
async function h_tasks_archive(ctx: MethodCtx): Promise<unknown> {
  if (["tasks.archive"].includes(ctx.method))
    return withTaskAuthorityMutation(ctx.s.repo, ctx.params.taskId, () => retired_h_tasks_archive(ctx));
  return retired_h_tasks_archive(ctx);
}

async function retired_h_tasks_archive(ctx: MethodCtx): Promise<unknown> {
  const { params, tasks } = ctx;
  return tasks.archive(params.taskId, params.expectedRevision, params.archived);
}
async function h_tasks_start(ctx: MethodCtx): Promise<unknown> {
  if (ctx.params.agentMode !== undefined && (ctx.client.external || ctx.client.codeMode))
    throw new AuxError("permission_denied", "Choose this run’s mode through the Aux composer.");
  const { params, s, tasks } = ctx;
  const { taskId, expectedRevision, ...options } = params;
  return s.runs.start({ ...options, ...tasks.prepareRun(taskId, expectedRevision, options.context, ctx.externalRunId), nativeTurnContext: ctx.client.nativeTurnContext,
    ...(ctx.scope && ctx.client.connectionId ? {externalConnectionId: ctx.client.connectionId, externalParentRunId: ctx.externalRunId} : {}) });
}

export const tasksMethods: Partial<Record<MethodName, MethodHandler>> = {
  "tasks.receipt": h_tasks_receipt,
  "tasks.exportReceipt": h_tasks_exportReceipt,
  "tasks.undoBrowserChange": h_tasks_undoBrowserChange,
  "tasks.undoRunBrowserChanges": h_tasks_undoRunBrowserChanges,
  "tasks.undoBookmarkChange": h_tasks_undoBookmarkChange,
  "tasks.undoDownloadChange": h_tasks_undoDownloadChange,
  "tasks.undoHistoryChange": h_tasks_undoHistoryChange,
  "tasks.verifyCriterion": h_tasks_verifyCriterion,
  "tasks.replaceAgent": h_tasks_replaceAgent,
  "tasks.recordEvidence": h_tasks_recordEvidence,
  "tasks.importDocumentEvidence": h_tasks_importDocumentEvidence,
  "tasks.importTextEvidence": h_tasks_importTextEvidence,
  "tasks.readDocumentEvidence": h_tasks_readDocumentEvidence,
  "tasks.captureEvidence": h_tasks_captureEvidence,
  "tasks.reviewCriterion": h_tasks_reviewCriterion,
  "tasks.reconcileAction": h_tasks_reviewCriterion,
  "tasks.reconcileOperation": h_tasks_reviewCriterion,
  "tasks.create": h_tasks_create,
  "tasks.promote": h_tasks_promote,
  "tasks.get": h_tasks_get,
  "tasks.list": h_tasks_list,
  "tasks.update": h_tasks_update,
  "tasks.archive": h_tasks_archive,
  "tasks.start": h_tasks_start,
};
