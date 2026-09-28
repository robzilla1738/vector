import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_memory_pipeline_policy(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, revokeWorkspaceContext, s } = ctx;
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Space memory is managed in Aux.");
  const pipeline = s.memoryPipeline;
  if (!pipeline)
    throw new AuxError("backend_unavailable", "Protected Space memory requires the Aux desktop app.");
  const changed = (value: unknown) => {
    revokeWorkspaceContext(params.workspaceId, false);
    s.events.emit("workspace.memory.updated", { workspaceId: params.workspaceId });
    return value;
  };
  if (method === "memory.pipeline.policy") return pipeline.policy(params.workspaceId);
  if (method === "memory.pipeline.setPolicy") return changed(pipeline.setPolicy(params.workspaceId, params.enabled));
  if (method === "memory.pipeline.extractRun") {
    const result = await pipeline.extractRun(params.workspaceId, params.runId);
    return result.extracted ? changed(result) : result;
  }
  if (method === "memory.pipeline.sources") return pipeline.sources(params.workspaceId);
  if (method === "memory.pipeline.inbox") return pipeline.inbox(params.workspaceId);
  if (method === "memory.pipeline.claims") return pipeline.claims(params.workspaceId);
  if (method === "memory.pipeline.history") return pipeline.history(params.workspaceId);
  if (method === "memory.pipeline.revert") return changed(await pipeline.revert(params.workspaceId, params.revisionId));
  if (method === "memory.pipeline.review") return changed(await pipeline.review(params.workspaceId, params.claimId, params.decision));
  if (method === "memory.pipeline.overview") return pipeline.overview(params.workspaceId);
  if (method === "memory.pipeline.search") return pipeline.search(params.workspaceId, params.query);
  const result = await pipeline.forget(params);
  return result.forgotten ? changed(result) : result;
}

export const memoryMethods: Partial<Record<MethodName, MethodHandler>> = {
  "memory.pipeline.policy": h_memory_pipeline_policy,
  "memory.pipeline.setPolicy": h_memory_pipeline_policy,
  "memory.pipeline.extractRun": h_memory_pipeline_policy,
  "memory.pipeline.sources": h_memory_pipeline_policy,
  "memory.pipeline.inbox": h_memory_pipeline_policy,
  "memory.pipeline.claims": h_memory_pipeline_policy,
  "memory.pipeline.history": h_memory_pipeline_policy,
  "memory.pipeline.revert": h_memory_pipeline_policy,
  "memory.pipeline.review": h_memory_pipeline_policy,
  "memory.pipeline.overview": h_memory_pipeline_policy,
  "memory.pipeline.search": h_memory_pipeline_policy,
  "memory.pipeline.forget": h_memory_pipeline_policy,
};
