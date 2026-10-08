import { createHash } from "node:crypto";
import { AuxError, type CodingProcessView, type MethodName } from "@aux/contracts";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";
import type { MethodCtx, MethodHandler, Services } from "./context.js";
function requirePerson(ctx: MethodCtx): void {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Review coding activity through Aux.");
  if (!ctx.s.repo.getRun(ctx.params.runId)) throw new AuxError("not_found", "Coding run not found.");
}
function processView(receipt: CodingProcessReceipt): CodingProcessView {
  const {
    processId,
    runId,
    actionId,
    command,
    workdir,
    startedAt,
    endedAt,
    state,
    exitCode,
    signal,
    execution,
  } = receipt;
  return {
    processId,
    runId,
    actionId,
    command,
    workdir,
    startedAt,
    endedAt,
    state,
    exitCode,
    signal,
    execution,
  };
}
function files(ctx: MethodCtx) {
  requirePerson(ctx);
  if (!ctx.s.codingFiles) throw new AuxError("capability_unsupported", "Coding files are unavailable.");
  return ctx.s.codingFiles;
}
function processes(ctx: MethodCtx) {
  requirePerson(ctx);
  if (!ctx.s.codingProcesses)
    throw new AuxError("capability_unsupported", "Coding processes are unavailable.");
  return ctx.s.codingProcesses;
}
async function h_coding_activity(ctx: MethodCtx) {
  requirePerson(ctx);
  const rows = ctx.s.repo.db
    .prepare("SELECT receipt_id,status FROM coding_file_receipts WHERE run_id=? ORDER BY created_at,rowid")
    .all(ctx.params.runId);
  return {
    fileRevision: createHash("sha256").update(JSON.stringify(rows)).digest("hex"),
    processes: processes(ctx).activity(ctx.params.runId).map(processView),
    agents: ctx.s.subagents?.listForParent(ctx.params.runId) ?? [],
  };
}
async function h_coding_changes(ctx: MethodCtx) {
  return files(ctx).changeViews(ctx.params.runId, ctx.params);
}
async function h_coding_undo(ctx: MethodCtx) {
  let service = files(ctx);
  const receipts = ctx.params.receiptIds.map((id: string) => service.get(id, ctx.params.runId));
  if (
    receipts.some(
      (receipt: import("@aux/contracts/coding-files").CodingFileReceipt) =>
        receipt.execution?.backend === "cloud",
    )
  ) {
    const retained = ctx.s.cloudCoding?.retainedFiles(ctx.params.runId);
    if (!retained)
      throw new AuxError(
        "ref_stale",
        "The original cloud session has ended; these files cannot be undone in another VM.",
      );
    service = retained;
  }
  const token = ctx.client.nativeTurnContext;
  const native = ctx.s.native;
  if (!token || !native?.turnSourceContext)
    throw new AuxError("permission_denied", "Undo these changes from the original Aux window.");
  const original = await native.turnSourceContext(token);
  const verifyOwner = async () => {
    const current = await native.turnSourceContext!(token);
    if (current.windowId !== original.windowId)
      throw new AuxError("permission_denied", "The original undo window changed.");
  };
  return service.undo(
    { actionId: ctx.params.actionId, receiptIds: ctx.params.receiptIds },
    { runId: ctx.params.runId, actor: "user", verifyOwner },
  );
}
async function h_coding_processes(ctx: MethodCtx) {
  return processes(ctx).list(ctx.params.runId).map(processView);
}
async function h_coding_logs(ctx: MethodCtx) {
  const service = processes(ctx);
  const receipt = service.status(ctx.params.processId, ctx.params.runId);
  return receipt.execution?.backend === "cloud"
    ? service.remoteLogs(ctx.params.processId, ctx.params.runId, ctx.params.cursor)
    : service.logs(ctx.params.processId, ctx.params.runId, ctx.params.cursor);
}
async function h_coding_stop(ctx: MethodCtx) {
  let service:
    | NonNullable<Services["codingProcesses"]>
    | import("../../services/cloud-processes.js").CloudCodingProcesses = processes(ctx);
  const receipt = service.status(ctx.params.processId, ctx.params.runId);
  if (receipt.execution?.backend === "cloud") {
    if (!["starting", "running", "uncertain"].includes(receipt.state)) return processView(receipt);
    const retained = ctx.s.cloudCoding?.retainedProcesses(ctx.params.runId);
    if (!retained)
      throw new AuxError(
        "operation_uncertain",
        "The original cloud process is unavailable; its Stop cannot be confirmed through another session.",
      );
    service = retained;
  }
  return processView(await service.stop(ctx.params.processId, ctx.params.runId));
}
function cloudPreviewOwner(ctx: MethodCtx) {
  requirePerson(ctx);
  const token = ctx.client.nativeTurnContext;
  const service = ctx.s.cloudCoding;
  const run = ctx.s.repo.getRun(ctx.params.runId)!;
  if (!token || !service)
    throw new AuxError("permission_denied", "Open Preview from its original Aux window.");
  return {
    service,
    token,
    context: { runId: run.runId, threadId: run.config?.chatId ?? run.runId, turnId: run.runId },
  };
}
async function h_coding_preview(ctx: MethodCtx) {
  const { service, token, context } = cloudPreviewOwner(ctx);
  const capabilities = await ctx.s.nativeIdentity;
  if (
    !capabilities?.methods.includes("native.cloudPreview") ||
    !capabilities.methods.includes("native.cloudPreviewClose")
  )
    throw new AuxError("capability_unsupported", "This browser build does not implement cloud Preview.");
  return service.preview(context, { processId: ctx.params.processId, port: ctx.params.port }, token);
}
async function h_coding_previewClose(ctx: MethodCtx) {
  const { service, token, context } = cloudPreviewOwner(ctx);
  return service.closePreview(context, ctx.params.previewId, token);
}
async function recoveryOwner(ctx: MethodCtx) {
  requirePerson(ctx);
  const token = ctx.client.nativeTurnContext;
  const native = ctx.s.native;
  if (!token || !native?.turnSourceContext)
    throw new AuxError("permission_denied", "Inspect coding recovery through the original Aux window.");
  const owner = await native.turnSourceContext(token);
  const original = async () => {
    const current = await native.turnSourceContext!(token);
    if (current.windowId !== owner.windowId)
      throw new AuxError("permission_denied", "The original recovery window changed.");
  };
  if (!ctx.s.coderWorktrees)
    throw new AuxError("capability_unsupported", "Coding worktree recovery is unavailable.");
  return {
    service: ctx.s.coderWorktrees,
    context: {
      runId: ctx.params.runId,
      actionId: ctx.params.actionId ?? `inspect:${ctx.params.cellId}`,
      actor: "user" as const,
      original,
    },
  };
}
async function h_coding_worktreeInspect(ctx: MethodCtx) {
  const { service, context } = await recoveryOwner(ctx);
  return service.inspectRecovery(ctx.params.cellId, context);
}
async function h_coding_worktreeArchive(ctx: MethodCtx) {
  const { service, context } = await recoveryOwner(ctx);
  return service.archiveRecovery(ctx.params.cellId, ctx.params.expectedDigest, context);
}
export const codingMethods: Partial<Record<MethodName, MethodHandler>> = {
  "coding.activity": h_coding_activity,
  "coding.worktreeInspect": h_coding_worktreeInspect,
  "coding.worktreeArchive": h_coding_worktreeArchive,
  "coding.changes": h_coding_changes,
  "coding.undo": h_coding_undo,
  "coding.processes": h_coding_processes,
  "coding.logs": h_coding_logs,
  "coding.stop": h_coding_stop,
  "coding.preview": h_coding_preview,
  "coding.previewClose": h_coding_previewClose,
};
