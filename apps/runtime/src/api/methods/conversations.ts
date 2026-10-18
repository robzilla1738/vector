import { presentConversation, presentRun } from "../../services/run-presentation.js";
import { nativeDocumentSource } from "./document-source.js";
import { searchConversation } from "../../services/conversation-search.js";
import type { MethodCtx, MethodHandler, Services } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError } from "@aux/contracts";

async function h_conversations_list(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.conversations(params).map(presentConversation);
}
async function h_conversations_prepared(ctx: MethodCtx): Promise<unknown> {
  const { client, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Unsent conversations are available in Aux.");
  return s.repo.preparedConversations();
}
async function h_conversations_images_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.images.list(params.chatId);
}
async function h_conversations_images_add(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.images.add(params);
}
async function h_conversations_images_read(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.images.read(params.chatId, params.imageId);
}
async function h_conversations_images_toggle(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.images.toggle(params.chatId, params.imageId, params.included);
}
async function h_conversations_images_remove(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const removed = s.runs.images.remove(params.chatId, params.imageId);
  s.checkpointDeletedData?.();
  return removed;
}
async function h_conversations_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  if (s.runs.branches.get(params.chatId) && (ctx.client.external || ctx.client.codeMode))
    throw new AuxError("permission_denied", "Review the branch draft in its original Aux window.");
  const conversation = s.runs.conversation(params.chatId);
  return conversation && "latestRun" in conversation ? presentConversation(conversation) : conversation;
}
const searches = new WeakMap<Services["repo"], Map<string, AbortController>>();
async function h_conversations_search(ctx: MethodCtx): Promise<unknown> {
  const owner = ctx.client.nativeTurnContext;
  if (!owner) return searchConversation(ctx.s.repo, ctx.params);
  let active = searches.get(ctx.s.repo);
  if (!active) {
    active = new Map();
    searches.set(ctx.s.repo, active);
  }
  active.get(owner)?.abort();
  const request = new AbortController();
  active.set(owner, request);
  try {
    return await searchConversation(ctx.s.repo, ctx.params, request.signal);
  } finally {
    if (active.get(owner) === request) active.delete(owner);
  }
}
async function h_conversations_turns(ctx: MethodCtx): Promise<unknown> {
  const window = ctx.s.repo.conversationTurnWindow(ctx.params.chatId, ctx.params.runId);
  return { ...window, runs: window.runs.map(presentRun) };
}
async function h_conversations_rename(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return presentConversation(s.runs.renameConversation(params.chatId, params.title));
}
async function h_conversations_archive(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return presentConversation(s.runs.archiveConversation(params.chatId, params.archived));
}
async function h_conversations_delete(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  await s.runs.retireConversationCompactions(params.chatId);
  await s.runs.documents.retireAndJoin(params.chatId);
  const deleted = s.runs.deleteConversation(params.chatId);
  s.checkpointDeletedData?.();
  return deleted;
}
async function h_conversations_attachments_read(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Inspect document snapshots in Aux.");
  return s.runs.readAttachment(params);
}
async function h_conversations_attachments_import(ctx: MethodCtx): Promise<unknown> {
  const { source, context } = await nativeDocumentSource(ctx, ctx.params);
  return ctx.s.runs.importAttachment(ctx.params, source, context);
}
async function h_conversations_attachments_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.attachments(params.chatId);
}
async function h_conversations_attachments_page(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Attach page snapshots in Aux.");
  return s.runs.attachPage(params);
}
async function h_conversations_attachments_add(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.addAttachment(params);
}
async function h_conversations_attachments_toggle(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.toggleAttachment(params);
}
async function h_conversations_attachments_remove(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  const attachments = s.runs.removeAttachment(params);
  s.checkpointDeletedData?.();
  return attachments;
}
async function h_conversations_artifacts_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.conversationArtifacts(params.chatId);
}
async function h_conversations_artifacts_toggle(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.toggleConversationArtifact(params);
}
async function h_conversations_sources_get(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  const result = await s.runs.conversationSources(params.chatId);
  return client.external
    ? {
        ...result,
        sources: result.sources.filter((source) => source.kind !== "calendar" && source.kind !== "memory"),
      }
    : result;
}
async function h_conversations_workspace_get(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.conversationWorkspace(params.chatId);
}
async function h_conversations_workspace_set(ctx: MethodCtx): Promise<unknown> {
  const { params, s } = ctx;
  return s.runs.setConversationWorkspace(params);
}

export const conversationsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "conversations.list": h_conversations_list,
  "conversations.prepared": h_conversations_prepared,
  "conversations.images.get": h_conversations_images_get,
  "conversations.images.add": h_conversations_images_add,
  "conversations.images.read": h_conversations_images_read,
  "conversations.images.toggle": h_conversations_images_toggle,
  "conversations.images.remove": h_conversations_images_remove,
  "conversations.get": h_conversations_get,
  "conversations.search": h_conversations_search,
  "conversations.turns": h_conversations_turns,
  "conversations.rename": h_conversations_rename,
  "conversations.archive": h_conversations_archive,
  "conversations.delete": h_conversations_delete,
  "conversations.attachments.read": h_conversations_attachments_read,
  "conversations.attachments.import": h_conversations_attachments_import,
  "conversations.attachments.get": h_conversations_attachments_get,
  "conversations.attachments.page": h_conversations_attachments_page,
  "conversations.attachments.add": h_conversations_attachments_add,
  "conversations.attachments.toggle": h_conversations_attachments_toggle,
  "conversations.attachments.remove": h_conversations_attachments_remove,
  "conversations.artifacts.get": h_conversations_artifacts_get,
  "conversations.artifacts.toggle": h_conversations_artifacts_toggle,
  "conversations.sources.get": h_conversations_sources_get,
  "conversations.workspace.get": h_conversations_workspace_get,
  "conversations.workspace.set": h_conversations_workspace_set,
};
