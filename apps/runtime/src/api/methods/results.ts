import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { GeneratedResults } from "../../services/generated-results.js";
import { SavedResults } from "../../services/saved-results.js";

async function h_results_generate(ctx: MethodCtx): Promise<unknown> {
  const { client, params, requireScopedTask, s, scope } = ctx;
  if (client.external) {
    if (!scope || !params.taskId || !params.expectedRevision)
      throw new AuxError("permission_denied", "Generated results require a scoped task and revision.");
    const task = requireScopedTask(scope, params.taskId);
    if (task.revision !== params.expectedRevision)
      throw new AuxError("conflict", "Task revision changed; refresh it before generating a result.");
    if ((task.conversationId ?? `task:${task.taskId}`) !== params.chatId)
      throw new AuxError("permission_denied", "This conversation does not belong to the scoped task.");
  }
  const generated = await new GeneratedResults(s.repo, s.artifacts).generate(params);
  s.events.emit("conversation.context.changed", { chatId: params.chatId });
  return generated;
}
async function h_results_generated_get(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Preview generated results in Aux.");
  return new GeneratedResults(s.repo, s.artifacts).get(params.artifactId);
}
async function h_results_generated_versions(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Inspect generated result versions in Aux.");
  return new GeneratedResults(s.repo, s.artifacts).versions(params.artifactId);
}
async function h_results_search(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Search saved results in Aux.");
  return new SavedResults(s.repo, s.artifacts).search(params.query, params.limit);
}
async function h_results_read(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Preview saved results in Aux.");
  return new SavedResults(s.repo, s.artifacts).read(params.artifactId);
}
async function h_results_available(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Inspect saved results in Aux.");
  return new SavedResults(s.repo, s.artifacts).available(params.drafts);
}
async function h_results_saveVersion(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Save edited results in Aux.");
  const saved = new SavedResults(s.repo, s.artifacts).saveVersion(params);
  s.events.emit("conversation.context.changed", { chatId: params.chatId });
  return saved;
}

export const resultsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "results.generate": h_results_generate,
  "results.generated.get": h_results_generated_get,
  "results.generated.versions": h_results_generated_versions,
  "results.search": h_results_search,
  "results.read": h_results_read,
  "results.available": h_results_available,
  "results.saveVersion": h_results_saveVersion,
};
