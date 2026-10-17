import { withRunAuthorityMutation } from "../../services/overnight-authority.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, MethodSchemas } from "@aux/contracts";
import { advanceManagedRecoveryGeneration } from "../../services/managed-recovery-generation.js";
import { attemptFreshManagedBackup } from "../../services/runtime-backup.js";

async function h_memory_pipeline_policy(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Space memory is managed in Aux.");
  if (
    [
      "memory.pipeline.setPolicy",
      "memory.pipeline.reindex",
      "memory.pipeline.edit",
      "memory.pipeline.revert",
      "memory.pipeline.review",
      "memory.pipeline.forget",
    ].includes(ctx.method)
  )
    return withRunAuthorityMutation(ctx.s.repo, () => retired_h_memory_pipeline_policy(ctx));
  return retired_h_memory_pipeline_policy(ctx);
}

async function retired_h_memory_pipeline_policy(ctx: MethodCtx): Promise<unknown> {
  const { method, params, revokeWorkspaceContext, s } = ctx;
  const pipeline = s.memoryPipeline;
  if (!pipeline)
    throw new AuxError("backend_unavailable", "Protected Space memory requires the Aux desktop app.");
  const changed = async (value: unknown) => {
    await revokeWorkspaceContext(params.workspaceId, false);
    s.events.emit("workspace.memory.updated", { workspaceId: params.workspaceId });
    return value;
  };
  if (method === "memory.pipeline.policy") return pipeline.policy(params.workspaceId);
  if (method === "memory.pipeline.setPolicy")
    return changed(pipeline.setPolicy(params.workspaceId, params.enabled));
  if (method === "memory.pipeline.extractRun") {
    const result = await pipeline.extractRun(params.workspaceId, params.runId);
    return changed(result);
  }
  if (method === "memory.pipeline.documents") return pipeline.documents(params.workspaceId);
  if (method === "memory.pipeline.edit") return changed(await pipeline.editClaim(params));
  if (method === "memory.pipeline.sources") return pipeline.sources(params.workspaceId);
  if (method === "memory.pipeline.inbox") return pipeline.inbox(params.workspaceId);
  if (method === "memory.pipeline.claims") return pipeline.claims(params.workspaceId);
  if (method === "memory.pipeline.history") return pipeline.history(params.workspaceId);
  if (method === "memory.pipeline.activity") return pipeline.activity(params.workspaceId);
  if (method === "memory.pipeline.reindex") return changed(await pipeline.reindex(params.workspaceId));
  if (method === "memory.pipeline.revert")
    return changed(await pipeline.revert(params.workspaceId, params.revisionId));
  if (method === "memory.pipeline.review")
    return changed(await pipeline.review(params.workspaceId, params.claimId, params.decision));
  if (method === "memory.pipeline.overview") return pipeline.overview(params.workspaceId);
  if (method === "memory.pipeline.search") return pipeline.search(params.workspaceId, params.query);
  let advanced = false;
  let generation: ReturnType<typeof advanceManagedRecoveryGeneration> | undefined;
  let result: Awaited<ReturnType<typeof pipeline.forget>>;
  try {
    result = await pipeline.forget(params, async () => {
      generation = advanceManagedRecoveryGeneration(s.settings.all().dataDir);
      advanced = true;
      await s.contentMemory?.invalidateDerivatives();
    });
  } catch (error) {
    if (advanced)
      throw new AuxError(
        "conflict",
        "Memory removal could not be confirmed. Older managed backups were invalidated; review Memory and create a fresh local backup.",
      );
    throw error;
  }
  const response = result.forgotten || result.activityRemoved ? changed(result) : result;
  if (generation) await attemptFreshManagedBackup(s.repo, s.settings.all().dataDir, generation);
  return response;
}

function pastePipeline(ctx: MethodCtx) {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Pasted Memory is reviewed in Aux.");
  if (!ctx.s.memoryPipeline)
    throw new AuxError("backend_unavailable", "Protected Memory requires the Aux desktop app.");
  return ctx.s.memoryPipeline;
}
async function h_memory_paste_preview(ctx: MethodCtx): Promise<unknown> {
  return pastePipeline(ctx).previewPaste(MethodSchemas["memory.paste.preview"].parse(ctx.params));
}
async function h_memory_paste_commit(ctx: MethodCtx): Promise<unknown> {
  const pipeline = pastePipeline(ctx),
    input = MethodSchemas["memory.paste.commit"].parse(ctx.params);
  const result = await pipeline.commitPaste(input);
  ctx.s.events.emit("workspace.memory.updated", { workspaceId: input.workspaceId });
  return result;
}
async function h_memory_paste_status(ctx: MethodCtx): Promise<unknown> {
  return pastePipeline(ctx).pasteStatus(MethodSchemas["memory.paste.status"].parse(ctx.params).workspaceId);
}

export const memoryMethods: Partial<Record<MethodName, MethodHandler>> = {
  "memory.paste.preview": h_memory_paste_preview,
  "memory.paste.commit": h_memory_paste_commit,
  "memory.paste.status": h_memory_paste_status,
  "memory.pipeline.policy": h_memory_pipeline_policy,
  "memory.pipeline.setPolicy": h_memory_pipeline_policy,
  "memory.pipeline.extractRun": h_memory_pipeline_policy,
  "memory.pipeline.sources": h_memory_pipeline_policy,
  "memory.pipeline.inbox": h_memory_pipeline_policy,
  "memory.pipeline.claims": h_memory_pipeline_policy,
  "memory.pipeline.history": h_memory_pipeline_policy,
  "memory.pipeline.activity": h_memory_pipeline_policy,
  "memory.pipeline.reindex": h_memory_pipeline_policy,
  "memory.pipeline.documents": h_memory_pipeline_policy,
  "memory.pipeline.edit": h_memory_pipeline_policy,
  "memory.pipeline.revert": h_memory_pipeline_policy,
  "memory.pipeline.review": h_memory_pipeline_policy,
  "memory.pipeline.overview": h_memory_pipeline_policy,
  "memory.pipeline.search": h_memory_pipeline_policy,
  "memory.pipeline.forget": h_memory_pipeline_policy,
};
