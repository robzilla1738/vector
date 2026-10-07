import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas, HostMethods } from "@aux/contracts";
import { lineageRuns } from "../../services/run-lineage.js";
import { summarizeModelUsage } from "../../services/model-usage.js";
import { projectRunTranscript } from "../../services/run-transcript.js";
import { assertRunAnswerable, currentRunSuspension } from "../../services/run-suspension.js";

async function branchOwner(ctx: MethodCtx) {
  const token = ctx.client.nativeTurnContext, native = ctx.s.native;
  const read = native?.turnSourceContext;
  if (ctx.client.external || ctx.client.codeMode || !token || !read)
    throw new AuxError("permission_denied", "Branch history from the original Aux window.");
  const original = await read.call(native, token);
  const current = async () => {
    const owner = await read.call(native, token);
    if (owner.windowId !== original.windowId)
      throw new AuxError("permission_denied", "The original conversation window changed.");
  };
  return { windowId: original.windowId, current };
}
async function h_runs_branch(ctx: MethodCtx): Promise<unknown> {
  const input = MethodSchemas["runs.branch"].parse(ctx.params);
  const owner = await branchOwner(ctx);
  return ctx.s.runs.branch(input.runId, input.mode, owner.windowId, owner.current);
}

async function h_runs_branch_list(ctx: MethodCtx): Promise<unknown> {
  const owner = await branchOwner(ctx);
  await owner.current();
  const drafts = ctx.s.runs.branches.list();
  await owner.current();
  return drafts;
}

async function h_runs_start(ctx: MethodCtx): Promise<unknown> {
  if (
    ctx.params.executionTarget === "cloud" &&
    (ctx.client.external || ctx.client.codeMode || !ctx.client.nativeTurnContext)
  )
    throw new AuxError("permission_denied", "Choose Run in cloud from the original Aux conversation.");
  if (ctx.client.external && ctx.params.mentions?.length)
    throw new AuxError("permission_denied", "Mention sources through the Aux composer.");
  const { client, params, s } = ctx;
  if (client.external && params.contextMemoryIds?.length)
    throw new AuxError(
      "permission_denied",
      "Protected article context can only be sent from the Aux window.",
    );
  if (client.external && params.defaultWorkspaceId)
    throw new AuxError("permission_denied", "Conversation Space defaults are set through the Aux browser.");
  if (ctx.scope) {
    if (!ctx.externalRunId || !client.connectionId || !params.taskId || params.expectedRevision === undefined)
      throw new AuxError("permission_denied", "A run requires its original external task session.");
    if (params.setId || params.chatId || params.contextPageRefs?.length)
      throw new AuxError(
        "permission_denied",
        "External runs use the saved task conversation and its authorized page sources.",
      );
    const { taskId, expectedRevision, goal, ...options } = MethodSchemas["runs.start"].parse(params);
    const prepared = ctx.tasks.prepareRun(taskId!, expectedRevision!, options.context, ctx.externalRunId);
    const pages =
      options.pageIds ??
      (options.pageId
        ? [options.pageId]
        : ctx.tasks
            .get(taskId!)
            .resources.filter((resource) => resource.kind === "page")
            .map((resource) => resource.locator));
    for (const pageId of pages) ctx.requireScopedPage(ctx.scope, pageId, client.connectionId);
    return s.runs.start({
      ...options,
      ...prepared,
      goal,
      pageIds: pages,
      externalConnectionId: client.connectionId,
      externalParentRunId: ctx.externalRunId,
    });
  }
  const branch = params.chatId ? s.runs.branches.get(params.chatId) : undefined;
  const owner = branch ? await branchOwner(ctx) : undefined;
  const branchOriginal = owner ? async () => {
    await owner.current();
    const selectedPages = params.pageIds ?? (params.pageId ? [params.pageId] : []);
    for (const pageId of selectedPages)
      if (s.pages.get(pageId).windowId !== owner.windowId)
        throw new AuxError("permission_denied", "Select tabs from this Aux window, or remove their context, before sending the draft.");
  } : undefined;
  return s.runs.start({
    ...MethodSchemas["runs.start"].parse(params),
    nativeTurnContext: client.nativeTurnContext,
    branchOriginal,
  });
}
async function h_runs_retry(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external && s.runs.coordinator.get(params.runId).config?.contextMemoryIds?.length)
    throw new AuxError(
      "permission_denied",
      "Protected article context can only be retried from the Aux window.",
    );
  return s.runs.retry(params.runId, params.pageId, client.nativeTurnContext);
}
async function h_runs_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s, suspensions } = ctx;
  const run = s.runs.coordinator.get(params.runId);
  const calls = lineageRuns(s.repo, run.runId).flatMap((runId) => s.repo.listModelCalls(runId));
  const steps = s.repo.listSteps(run.runId);
  return {
    run,
    steps,
    modelCalls: calls.length,
    usage: summarizeModelUsage(calls),
    transcript: projectRunTranscript(run, s.artifacts.list({ runId: run.runId }), steps),
    suspension: currentRunSuspension(run, suspensions.pending(run.runId)),
  };
}
async function h_runs_list(ctx: MethodCtx): Promise<unknown> {
  const { params, s, scope, scopedTasks } = ctx;
  const p = MethodSchemas["runs.list"].parse(params);
  const listed = s.runs.coordinator.list(p.limit, p);
  if (!scope) return listed;
  const taskIds = new Set(scopedTasks(scope).map((task) => task.taskId));
  return listed.filter((run) => !!run.config?.taskId && taskIds.has(run.config.taskId));
}
async function h_runs_context_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.context(params.chatId);
}
async function h_runs_context_set(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.setContext(params);
}
async function h_runs_pause(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.pause(params.runId);
}
async function h_runs_resume(ctx: MethodCtx): Promise<unknown> {
  const { params, s, client } = ctx;
  if (client.nativeRunResume) {
    if (client.external || client.codeMode)
      throw new AuxError("permission_denied", "Run control must come from the Aux owner interface.");
    const original = structuredClone(s.runs.coordinator.get(params.runId));
    if (original.status !== "paused")
      throw new AuxError("ref_stale", "This original run is no longer paused.");
    if (!s.native?.egressResumeRun)
      throw new AuxError("capability_unsupported", "Native run control is unavailable.");
    HostMethods["native.egressResumeRun"].result.parse(
      await s.native.egressResumeRun({ runId: original.runId, ticketId: client.nativeRunResume }),
    );
    const current = s.runs.coordinator.get(original.runId);
    if (current.status !== "paused" || JSON.stringify(current) !== JSON.stringify(original))
      throw new AuxError("ref_stale", "This paused run changed while returning control.");
  } else if (s.native) {
    if (!s.native.egressCheckRunResume)
      throw new AuxError("capability_unsupported", "Native run control is unavailable.");
    const original = structuredClone(s.runs.coordinator.get(params.runId));
    HostMethods["native.egressCheckRunResume"].result.parse(
      await s.native.egressCheckRunResume({ runId: original.runId }),
    );
    if (JSON.stringify(s.runs.coordinator.get(original.runId)) !== JSON.stringify(original))
      throw new AuxError("ref_stale", "This run changed while checking its native control.");
  }
  return s.runs.resume(params.runId);
}
async function h_runs_cancel(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const original = s.repo.getRun(params.runId);
  const connectionId = original?.config?.externalConnectionId;
  if (connectionId) {
    if (ctx.scope && ctx.client.connectionId !== connectionId)
      throw new AuxError("permission_denied", "Stop requires this original external connection.");
    if (!s.agentConnections || !s.externalSessions)
      throw new AuxError("backend_unavailable", "Original external session retirement is unavailable.");
    s.agentConnections.revoke(connectionId);
    await s.externalSessions.end(connectionId, "cancelled", ctx.client.external ? "External session stopped" : "Stopped by user");
    return s.runs.coordinator.get(params.runId);
  }
  return s.runs.cancel(params.runId);
}
async function h_runs_continue_budget(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Review and continue budgets through the Aux window.");
  const p = MethodSchemas["runs.continueBudget"].parse(ctx.params);
  return ctx.s.runs.continueBudget(p.runId, p.suspensionId, p.limits);
}
async function h_runs_use_local_execution(ctx: MethodCtx): Promise<unknown> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Continue locally from the original Aux window.");
  const p = MethodSchemas["runs.useLocalExecution"].parse(ctx.params);
  const native = ctx.s.native;
  if (!native?.turnSourceContext)
    throw new AuxError("capability_unsupported", "Original Aux window authority is unavailable.");
  return ctx.s.runs.useLocalExecution(p.runId, p.suspensionId, token, async () => {
    await native.turnSourceContext!(token);
  });
}
async function h_runs_retry_cloud_setup(ctx: MethodCtx): Promise<unknown> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Retry Cloud setup from the original Aux window.");
  const p = MethodSchemas["runs.retryCloudSetup"].parse(ctx.params);
  const native = ctx.s.native;
  if (!native?.turnSourceContext)
    throw new AuxError("capability_unsupported", "Original Aux window authority is unavailable.");
  return ctx.s.runs.retryCloudSetup(p.runId, p.suspensionId, token, async () => {
    await native.turnSourceContext!(token);
  });
}
async function h_runs_answer(ctx: MethodCtx): Promise<unknown> {
  const { client, params: p, s, suspensions } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Answers and mentions must come from the Aux composer.");
  const run = s.runs.coordinator.get(p.runId);
  const pending = suspensions.pending(p.runId);
  assertRunAnswerable(run, pending, p.expectedSuspensionId);
  return s.runs.coordinator.answerWithMentions(p.runId, p.answer, p.mentions ?? [], () => {
    assertRunAnswerable(
      s.runs.coordinator.get(p.runId),
      suspensions.pending(p.runId),
      p.expectedSuspensionId,
    );
  });
}
async function h_runs_queue(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Queue conversation messages in Aux.");
  return s.runs.messages.queue(params);
}
async function h_runs_steer(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Steer conversation runs in Aux.");
  if (params.expectedTurnId !== params.runId)
    throw new AuxError("conflict", "The active turn changed. Review it before steering.");
  if (params.clientUserMessageId && params.clientUserMessageId !== params.messageId)
    throw new AuxError("conflict", "clientUserMessageId must match the message id it sends.");
  if (s.repo.getRun(params.runId)?.config?.subagentProfile)
    throw new AuxError(
      "conflict",
      "Subagent turns take instructions through subagents.sendMessage, not user steering.",
    );
  return s.runs.messages.steer(params);
}
async function h_runs_messages_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Conversation messages are available in Aux.");
  return s.runs.messages.list(params.chatId);
}
async function h_runs_messageStatus(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external)
    throw new AuxError("permission_denied", "Message delivery status is available in Aux.");
  return s.runs.messages.messageStatus(params.nonce) ?? null;
}
async function h_runs_message_cancel(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Cancel queued messages in Aux.");
  return s.runs.messages.cancel(params.messageId);
}
async function h_runs_events(ctx: MethodCtx): Promise<unknown> {
  const { client, eventVisible, params, s, scope } = ctx;
  const p = params as { runId?: string; sinceSeq: number; limit: number; streamId?: string };
  const out = s.events.since(p.sinceSeq, p.limit, p.runId, p.streamId);
  if (!scope || out.resync) return out;
  // lastSeq still advances: filtered events were durably read and skipped.
  return { ...out, events: out.events.filter((event) => eventVisible(scope, client.connectionId, event)) };

  // artifacts
}

export const runsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "runs.start": h_runs_start,
  "runs.retry": h_runs_retry,
  "runs.branch": h_runs_branch,
  "runs.branch.list": h_runs_branch_list,
  "runs.get": h_runs_get,
  "runs.list": h_runs_list,
  "runs.context.get": h_runs_context_get,
  "runs.context.set": h_runs_context_set,
  "runs.pause": h_runs_pause,
  "runs.resume": h_runs_resume,
  "runs.cancel": h_runs_cancel,
  "runs.answer": h_runs_answer,
  "runs.continueBudget": h_runs_continue_budget,
  "runs.useLocalExecution": h_runs_use_local_execution,
  "runs.retryCloudSetup": h_runs_retry_cloud_setup,
  "runs.queue": h_runs_queue,
  "runs.steer": h_runs_steer,
  "runs.messages.list": h_runs_messages_list,
  "runs.messageStatus": h_runs_messageStatus,
  "runs.message.cancel": h_runs_message_cancel,
  "runs.events": h_runs_events,
  "events.since": h_runs_events,
};
