import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_artifacts_list(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  const artifacts = s.artifacts.list(params as never);
  if (!client.external) return artifacts;
  const images = s.runs.images.privateArtifactIds();
  return artifacts.filter((artifact) => !images.has(artifact.artifactId));
}
async function h_artifacts_read(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external && s.runs.images.privateArtifactIds().has(params.artifactId))
    throw new AuxError("permission_denied", "Conversation image snapshots are inspected in Aux.");
  return s.artifacts.read(params.artifactId);

  // programs
}

export const artifactsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "artifacts.list": h_artifacts_list,
  "artifacts.read": h_artifacts_read,
};
