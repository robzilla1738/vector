import { normalWindowOwner } from "./normal-window-owner.js";
import { runningCompactionOwner } from "./run-compaction-owner.js";
import { presentRun } from "../../services/run-presentation.js";
import { createHash } from "node:crypto";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName, MethodParams } from "@aux/contracts";
import { AuxError, MethodSchemas, HostMethods } from "@aux/contracts";
import { lineageRuns } from "../../services/run-lineage.js";
import { summarizeModelUsage } from "../../services/model-usage.js";
import { projectRunTranscript } from "../../services/run-transcript.js";
import { assertRunAnswerable, currentRunSuspension } from "../../services/run-suspension.js";

async function branchOwner(ctx: MethodCtx) {
  const token = ctx.client.nativeTurnContext,
    native = ctx.s.native;
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

async function startRequest(ctx: MethodCtx, input: MethodParams<"runs.start">) {
  if (!input.requestId || !input.chatId)
    throw new AuxError("invalid_params", "A recoverable send needs its original conversation identity.");
  if (input.setId) throw new AuxError("invalid_params", "Composer sends belong to a single conversation.");
  const pages = input.pageIds ?? (input.pageId ? [input.pageId] : []);
  if (pages.some((pageId) => !input.contextPageRefs?.some((ref) => ref.pageId === pageId)))
    throw new AuxError("invalid_params", "A recoverable send needs the exact selected tab identities.");
  const token = ctx.client.nativeTurnContext,
    native = ctx.s.native;
  const read = native?.turnSourceContext;
  if (ctx.client.external || ctx.client.codeMode || !token || !read)
    throw new AuxError("permission_denied", "Recover this send in its original Aux window.");
  const original = await read.call(native, token);
  const { requestId, ...message } = input;
  return {
    requestId,
    windowId: original.windowId,
    chatId: input.chatId,
    digest: createHash("sha256").update(JSON.stringify(message)).digest("hex"),
    current: async () => {
      const current = await read.call(native, token);
      if (current.windowId !== original.windowId)
        throw new AuxError("permission_denied", "The original Aux window changed.");
    },
  };
}

async function h_runs_reconcile_start(ctx: MethodCtx): Promise<unknown> {
  const input = MethodSchemas["runs.reconcileStart"].parse(ctx.params);
  const request = await startRequest(ctx, input);
  const result = await ctx.s.runs.reconcileStart({ ...input, startRequest: request });
  return result.status === "accepted" ? { ...result, run: presentRun(result.run) } : result;
}

async function h_runs_start(ctx: MethodCtx): Promise<unknown> {
  const parsed = MethodSchemas["runs.start"].parse(ctx.params);
  const request = parsed.requestId ? await startRequest(ctx, parsed) : undefined;
  if (
    (ctx.params.projectRoot || ctx.params.packageNames?.length || ctx.params.profile) &&
    (ctx.client.external || ctx.client.codeMode)
  )
    throw new AuxError("permission_denied", "Choose coding profiles and packages through Aux.");
  if (ctx.params.agentMode !== undefined && (ctx.client.external || ctx.client.codeMode))
    throw new AuxError("permission_denied", "Choose this run’s mode through the Aux composer.");
  if (
    ctx.params.executionTarget === "cloud" &&
    (ctx.client.external || ctx.client.codeMode || !ctx.client.nativeTurnContext)
  )
    throw new AuxError("permission_denied", "Choose Run in cloud from the original Aux conversation.");
  if (ctx.client.external && ctx.params.mentions?.length)
    throw new AuxError("permission_denied", "Mention sources through the Aux composer.");
  const { client, params, s } = ctx;
  if (client.external && params.contextMemoryRefs?.length)
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
    return presentRun(
      await s.runs.start({
        ...options,
        ...prepared,
        goal,
        pageIds: pages,
        externalConnectionId: client.connectionId,
        externalParentRunId: ctx.externalRunId,
      }),
    );
  }
  const branch = params.chatId ? s.runs.branches.get(params.chatId) : undefined;
  const owner = branch ? await branchOwner(ctx) : undefined;
  const branchOriginal = owner
    ? async () => {
        await owner.current();
        const selectedPages = params.pageIds ?? (params.pageId ? [params.pageId] : []);
        for (const pageId of selectedPages)
          if (s.pages.get(pageId).windowId !== owner.windowId)
            throw new AuxError(
              "permission_denied",
              "Select tabs from this Aux window, or remove their context, before sending the draft.",
            );
      }
    : undefined;
  return presentRun(
    await s.runs.start({
      ...parsed,
      startRequest: request,
      nativeTurnContext: client.nativeTurnContext,
      branchOriginal,
    }),
  );
}
async function h_runs_retry(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external && s.runs.coordinator.get(params.runId).config?.contextMemoryIds?.length)
    throw new AuxError(
      "permission_denied",
      "Protected article context can only be retried from the Aux window.",
    );
  return presentRun(await s.runs.retry(params.runId, params.pageId, client.nativeTurnContext));
}
async function h_runs_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s, suspensions } = ctx;
  const run = s.runs.coordinator.get(params.runId);
  const calls = lineageRuns(s.repo, run.runId).flatMap((runId) => s.repo.listModelCalls(runId));
  const steps = s.repo.listSteps(run.runId);
  return {
    run: presentRun(run),
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
  if (!scope) return listed.map(presentRun);
  const taskIds = new Set(scopedTasks(scope).map((task) => task.taskId));
  return listed.filter((run) => !!run.config?.taskId && taskIds.has(run.config.taskId)).map(presentRun);
}
async function h_runs_context_stats(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.runs.contextStats(ctx.params.runId);
}
async function h_runs_context_compact(ctx: MethodCtx): Promise<unknown> {
  const source = ctx.s.repo.getRun(ctx.params.runId);
  if (source?.status === "running") {
    const owner = await runningCompactionOwner(ctx);
    await owner.current();
    return ctx.s.runs.compactContext(ctx.params.runId, ctx.params.expectedRevision);
  }
  const owner = await normalWindowOwner(ctx);
  await owner.current();
  const token = ctx.client.nativeTurnContext!;
  const sourceRevision = JSON.stringify(source);
  const modelGeneration = ctx.s.settings.modelCacheGeneration();
  const route = await ctx.s.settings.utilityModel(token, owner.current);
  if (
    modelGeneration !== ctx.s.settings.modelCacheGeneration() ||
    sourceRevision !== JSON.stringify(ctx.s.repo.getRun(ctx.params.runId))
  )
    throw new AuxError("conflict", "The selected conversation or model changed during compaction admission.");
  if (!route)
    throw new AuxError("backend_unavailable", "Connect a text model before compacting this conversation.");
  return ctx.s.runs.compactIdleContext(ctx.params.runId, ctx.params.expectedRevision, {
    nativeTurnContext: token,
    route,
    checkOwner: owner.current,
    authorize: async (operationId) => {
      await owner.current();
      if (route.kind === "network")
        await ctx.decideEgress({
          url: new URL(route.destination),
          action: "runs.context.compact",
          connectionId: ctx.client.connectionId,
          actor: "user",
          runId: operationId,
          threadId: source?.config?.chatId ?? ctx.params.runId,
          invocationDigest: createHash("sha256")
            .update(
              JSON.stringify([
                operationId,
                ctx.params.runId,
                ctx.params.expectedRevision,
                route.modelId,
                ctx.s.settings.modelCacheGeneration(),
              ]),
            )
            .digest("hex"),
        });
      await owner.current();
    },
  });
}
async function h_runs_context_cancelCompaction(ctx: MethodCtx): Promise<unknown> {
  const control = ctx.s.runs.coordinator.controls.get(ctx.params.runId)?.contextCompaction;
  const request = control?.active ?? control?.pending;
  if (request?.id === ctx.params.compactionId) {
    const owner = await runningCompactionOwner(ctx, ctx.params.compactionId);
    await owner.current();
    return ctx.s.runs.cancelContextCompaction(ctx.params.runId, ctx.params.compactionId);
  }
  const owner = await normalWindowOwner(ctx);
  await owner.current();
  return ctx.s.runs.cancelIdleContextCompaction(ctx.params.runId, ctx.params.compactionId);
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
  return presentRun(await s.runs.pause(params.runId));
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
  return presentRun(await s.runs.resume(params.runId));
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
    await s.externalSessions.end(
      connectionId,
      "cancelled",
      ctx.client.external ? "External session stopped" : "Stopped by user",
    );
    return presentRun(s.runs.coordinator.get(params.runId));
  }
  return presentRun(await s.runs.cancel(params.runId));
}
async function h_runs_continue_budget(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Review and continue budgets through the Aux window.");
  const p = MethodSchemas["runs.continueBudget"].parse(ctx.params);
  const token = ctx.client.nativeTurnContext;
  const native = ctx.s.native;
  return presentRun(
    await ctx.s.runs.continueBudget(
      p.runId,
      p.suspensionId,
      p.limits,
      token,
      token && native?.turnSourceContext
        ? async () => {
            await native.turnSourceContext!(token);
          }
        : undefined,
    ),
  );
}
async function h_runs_use_local_execution(ctx: MethodCtx): Promise<unknown> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Continue locally from the original Aux window.");
  const p = MethodSchemas["runs.useLocalExecution"].parse(ctx.params);
  const native = ctx.s.native;
  if (!native?.turnSourceContext)
    throw new AuxError("capability_unsupported", "Original Aux window authority is unavailable.");
  return presentRun(
    await ctx.s.runs.useLocalExecution(p.runId, p.suspensionId, token, async () => {
      await native.turnSourceContext!(token);
    }),
  );
}
async function h_runs_retry_cloud_setup(ctx: MethodCtx): Promise<unknown> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Retry Cloud setup from the original Aux window.");
  const p = MethodSchemas["runs.retryCloudSetup"].parse(ctx.params);
  const native = ctx.s.native;
  if (!native?.turnSourceContext)
    throw new AuxError("capability_unsupported", "Original Aux window authority is unavailable.");
  return presentRun(
    await ctx.s.runs.retryCloudSetup(p.runId, p.suspensionId, token, async () => {
      await native.turnSourceContext!(token);
    }),
  );
}
async function h_runs_retry_model_setup(ctx: MethodCtx): Promise<unknown> {
  const token = ctx.client.nativeTurnContext;
  if (ctx.client.external || ctx.client.codeMode || !token)
    throw new AuxError("permission_denied", "Retry model setup from the original Aux window.");
  const p = MethodSchemas["runs.retryModelSetup"].parse(ctx.params);
  const native = ctx.s.native;
  if (!native?.turnSourceContext)
    throw new AuxError("capability_unsupported", "Original Aux window authority is unavailable.");
  return presentRun(
    await ctx.s.runs.retryModelSetup(p.runId, p.suspensionId, token, async () => {
      await native.turnSourceContext!(token);
    }),
  );
}
async function h_runs_answer(ctx: MethodCtx): Promise<unknown> {
  const { client, params: p, s, suspensions } = ctx;
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Answers and mentions must come from the Aux composer.");
  const run = s.runs.coordinator.get(p.runId);
  const pending = suspensions.pending(p.runId);
  assertRunAnswerable(run, pending, p.expectedSuspensionId);
  if (!s.runs.coordinator.controls.has(p.runId)) {
    const token = client.nativeTurnContext;
    const native = s.native;
    if (client.codeMode || !token || !native?.turnSourceContext || !pending)
      throw new AuxError("permission_denied", "Resume this request from the Aux window.");
    await s.runs.coordinator.bindRestartOwner(p.runId, pending.suspensionId, token, async () => {
      await native.turnSourceContext!(token);
    });
  }
  return presentRun(
    await s.runs.coordinator.answerWithMentions(p.runId, p.answer, p.mentions ?? [], () => {
      assertRunAnswerable(
        s.runs.coordinator.get(p.runId),
        suspensions.pending(p.runId),
        p.expectedSuspensionId,
      );
    }),
  );
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
async function h_runs_messages_order(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.runs.messages.order(ctx.params.chatId);
}
async function h_runs_messages_reorder(ctx: MethodCtx): Promise<unknown> {
  return ctx.s.runs.messages.reorder(ctx.params);
}
async function h_runs_messages_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Conversation messages are available in Aux.");
  return s.repo.visibleRunMessages(params.chatId, params.runIds);
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
  "runs.reconcileStart": h_runs_reconcile_start,
  "runs.retry": h_runs_retry,
  "runs.branch": h_runs_branch,
  "runs.branch.list": h_runs_branch_list,
  "runs.get": h_runs_get,
  "runs.list": h_runs_list,
  "runs.context.stats": h_runs_context_stats,
  "runs.context.compact": h_runs_context_compact,
  "runs.context.cancelCompaction": h_runs_context_cancelCompaction,
  "runs.context.get": h_runs_context_get,
  "runs.context.set": h_runs_context_set,
  "runs.pause": h_runs_pause,
  "runs.resume": h_runs_resume,
  "runs.cancel": h_runs_cancel,
  "runs.answer": h_runs_answer,
  "runs.continueBudget": h_runs_continue_budget,
  "runs.useLocalExecution": h_runs_use_local_execution,
  "runs.retryCloudSetup": h_runs_retry_cloud_setup,
  "runs.retryModelSetup": h_runs_retry_model_setup,
  "runs.queue": h_runs_queue,
  "runs.steer": h_runs_steer,
  "runs.messages.order": h_runs_messages_order,
  "runs.messages.reorder": h_runs_messages_reorder,
  "runs.messages.list": h_runs_messages_list,
  "runs.messageStatus": h_runs_messageStatus,
  "runs.message.cancel": h_runs_message_cancel,
  "runs.events": h_runs_events,
  "events.since": h_runs_events,
};
