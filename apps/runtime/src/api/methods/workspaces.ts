import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName, WorkspaceMemory } from "@aux/contracts";
import { AuxError } from "@aux/contracts";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import { advanceManagedRecoveryGeneration } from "../../services/managed-recovery-generation.js";

async function h_workspaces_create(ctx: MethodCtx): Promise<unknown> {
  const { params, tasks } = ctx;
  return tasks.createWorkspace(params.name);
}
async function h_workspaces_list(ctx: MethodCtx): Promise<unknown> {
  const { scope, tasks } = ctx;
  return scope
    ? tasks.workspaces().filter((workspace) => workspace.workspaceId === scope.workspaceId)
    : tasks.workspaces();
}
async function h_workspaces_folders(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, workspaceFolders } = ctx;
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Local folder access is managed in Aux Settings.");
  if (method === "workspaces.folders.inspect") return workspaceFolders.inspect(params.workspaceId, params.path, params.access);
  if (method === "workspaces.folders.add") return workspaceFolders.add(params.workspaceId, params.path, params.access, params.expectedDigest);
  if (method === "workspaces.folders.list") return workspaceFolders.list(params.workspaceId);
  return workspaceFolders.archive(params.workspaceId, params.folderId);
}
async function h_command_escalations(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, commandEscalations } = ctx;
  if (client.external || client.codeMode)
    throw new AuxError("permission_denied", "Command exceptions require review in local Aux Settings.");
  if (method === "commands.escalations.list") return commandEscalations.list(params.workspaceId);
  if (method === "commands.escalations.revoke") return commandEscalations.revoke(params.requestId);
  return commandEscalations.decide(params.requestId, params.decision, params.prefixRule);
}
async function h_workspaces_memory_search(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Search Space memory in Aux.");
  return tasks.searchWorkspaceMemory(params.query);
}
async function h_workspaces_browsingMemory_get(ctx: MethodCtx): Promise<unknown> {
  const { browsingMemory, client, method, params, revokeWorkspaceContext, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Browsing memory is managed in Aux.");
  if (method === "workspaces.browsingMemory.get") return browsingMemory.get(params.workspaceId);
  if (method === "workspaces.browsingMemory.set") {
    const prior = browsingMemory.policy(params.workspaceId);
    if (params.policy.retentionDays < prior.retentionDays && browsingMemory.get(params.workspaceId).pages.length)
      advanceManagedRecoveryGeneration(s.settings.all().dataDir);
    const result = browsingMemory.setPolicy(params.workspaceId, params.policy);
    if ((prior.enabled && !result.policy.enabled) || result.policy.retentionDays < prior.retentionDays)
      revokeWorkspaceContext(params.workspaceId, true);
    s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId });
    return result;
  }
  if (method === "workspaces.browsingMemory.record")
    return browsingMemory.record(
      params.workspaceId,
      s.pages.get(params.pageId),
      params.expectedDocumentEpoch,
    );
  const saved = browsingMemory.get(params.workspaceId).pages;
  if (saved.some(page => !params.memoryId || page.memoryId === params.memoryId))
    advanceManagedRecoveryGeneration(s.settings.all().dataDir);
  const result = browsingMemory.forget(params.workspaceId, params.memoryId);
  revokeWorkspaceContext(params.workspaceId, true);
  s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId });
  return result;
}
async function h_workspaces_contentMemory_policy(ctx: MethodCtx): Promise<unknown> {
  const { client, method, params, revokeArticleRuns, s, spaces } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Page-content memory is managed in Aux.");
  const store = s.contentMemory;
  if (!store)
    throw new AuxError("backend_unavailable", "Protected page-content memory requires the Aux desktop app.");
  if (method === "workspaces.contentMemory.policy") return store.policy(params.workspaceId);
  if (method === "workspaces.contentMemory.setPolicy") {
    const prior = store.policy(params.workspaceId);
    let advanced = false;
    let result: Awaited<ReturnType<typeof store.setPolicy>>;
    try {
      result = await store.setPolicy(params.workspaceId, params.policy,
        () => { advanceManagedRecoveryGeneration(s.settings.all().dataDir); advanced = true; });
    } catch (error) {
      if (advanced) throw new AuxError("conflict", "Article removal could not be confirmed. Older managed backups were invalidated; review saved articles and create a fresh local backup.");
      throw error;
    }
    if (
      !result.enabled ||
      result.retentionDays < prior.retentionDays ||
      prior.allowedOrigins.some((origin) => !result.allowedOrigins.includes(origin))
    )
      revokeArticleRuns(params.workspaceId);
    s.runs.redactForgottenArticleOutputs(params.workspaceId);
    s.checkpointDeletedData?.();
    s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
    return result;
  }
  if (method === "workspaces.contentMemory.search") return store.search(params.workspaceId, params.query);
  if (method === "workspaces.contentMemory.get") {
    const body = await store.get(params.workspaceId, params.memoryId);
    if (!body) return null;
    const { memoryId, profileId, workspaceId, pageId, documentEpoch, url, title, capturedAt, text } = body;
    return { memoryId, profileId, workspaceId, pageId, documentEpoch, url, title, capturedAt, text };
  }
  if (method === "workspaces.contentMemory.forget") {
    let advanced = false;
    let forgotten: number;
    try {
      forgotten = await store.forget(params.workspaceId, params.memoryId,
        () => { advanceManagedRecoveryGeneration(s.settings.all().dataDir); advanced = true; });
    } catch (error) {
      if (advanced) throw new AuxError("conflict", "Article Forget could not be confirmed. Older managed backups were invalidated; review saved articles and create a fresh local backup.");
      throw error;
    }
    revokeArticleRuns(params.workspaceId, params.memoryId);
    s.runs.redactForgottenArticleOutputs(params.workspaceId);
    s.checkpointDeletedData?.();
    s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
    return { forgotten };
  }
  const page = s.pages.get(params.pageId);
  if (!spaces.list().some((space) => space.workspaceId === params.workspaceId && !space.archived))
    throw new AuxError("permission_denied", "Choose an active Space for this article.");
  if (
    !s.native?.captureReadablePage ||
    page.backend !== "aux" ||
    page.ownedByRuntime ||
    page.documentEpoch !== params.expectedDocumentEpoch ||
    page.url !== params.expectedUrl
  )
    throw new AuxError("conflict", "The selected document changed. Select the current page and retry.");
  store.assertCaptureEligible({ workspaceId: params.workspaceId, url: page.url, title: page.title });
  const captured = await s.native.captureReadablePage(page.pageId, params.workspaceId, params.expectedUrl);
  if (memorySensitivityReason(captured.url, captured.title) || memoryContentSensitivityReason(captured.text))
    throw new AuxError("permission_denied", "Sensitive pages cannot be saved to Memory.");
  const current = s.pages.get(page.pageId);
  if (
    current.documentEpoch !== page.documentEpoch ||
    current.sessionId !== page.sessionId ||
    current.url !== page.url ||
    current.backend !== "aux" ||
    current.ownedByRuntime
  )
    throw new AuxError("conflict", "The document changed during capture. Try again.");
  const saved = await store.saveEligible({
    workspaceId: params.workspaceId,
    pageId: page.pageId,
    documentEpoch: page.documentEpoch,
    sessionId: page.sessionId,
    ...captured,
  }, () => {
    const live = s.pages.get(page.pageId);
    return live.documentEpoch === page.documentEpoch && live.sessionId === page.sessionId &&
      live.url === page.url && live.backend === "aux" && !live.ownedByRuntime;
  });
  s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
  return { memoryId: saved.memoryId, capturedAt: saved.capturedAt, title: saved.title, url: saved.url };
}
async function h_workspaces_memory_get(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
  return tasks.workspaceMemory(params.workspaceId);
}
async function h_workspaces_memory_set(ctx: MethodCtx): Promise<unknown> {
  const { client, params, revokeWorkspaceContext, s, tasks } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
  const prior = tasks.workspaceMemory(params.workspaceId);
  const items = (params.items ?? prior.items ?? []) as NonNullable<WorkspaceMemory["items"]>;
  const removesText = !!prior.content && !params.content.includes(prior.content);
  const removesItem = (prior.items ?? []).some(old => !items.some(item => item.itemId === old.itemId
    && item.content === old.content && item.sourceUrl === old.sourceUrl));
  const addsExclusion = ((params.excludedOrigins ?? []) as string[])
    .some(origin => !(prior.excludedOrigins ?? []).includes(origin));
  let advanced = false;
  const beforeSave = prior.revision === params.expectedRevision && (removesText || removesItem || addsExclusion)
    ? () => { advanceManagedRecoveryGeneration(s.settings.all().dataDir); advanced = true; } : undefined;
  let memory: ReturnType<typeof tasks.setWorkspaceMemory>;
  try {
    memory = tasks.setWorkspaceMemory(
      params.workspaceId,
      params.expectedRevision,
      params.content,
      params.enabled,
      params.items,
      params.excludedOrigins,
      beforeSave,
    );
  } catch (error) {
    if (advanced) throw new AuxError("conflict", "Memory update could not be confirmed. Older managed backups were invalidated; review Memory and create a fresh local backup.");
    throw error;
  }
  revokeWorkspaceContext(params.workspaceId, false);
  s.runs.redactForgottenArticleOutputs(params.workspaceId);
  return memory;
}

export const workspacesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "workspaces.create": h_workspaces_create,
  "workspaces.list": h_workspaces_list,
  "workspaces.folders.inspect": h_workspaces_folders,
  "workspaces.folders.add": h_workspaces_folders,
  "workspaces.folders.list": h_workspaces_folders,
  "workspaces.folders.archive": h_workspaces_folders,
  "commands.escalations.list": h_command_escalations,
  "commands.escalations.decide": h_command_escalations,
  "commands.escalations.revoke": h_command_escalations,
  "workspaces.memory.search": h_workspaces_memory_search,
  "workspaces.browsingMemory.get": h_workspaces_browsingMemory_get,
  "workspaces.browsingMemory.set": h_workspaces_browsingMemory_get,
  "workspaces.browsingMemory.record": h_workspaces_browsingMemory_get,
  "workspaces.browsingMemory.forget": h_workspaces_browsingMemory_get,
  "workspaces.contentMemory.policy": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.setPolicy": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.capture": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.search": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.get": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.forget": h_workspaces_contentMemory_policy,
  "workspaces.memory.get": h_workspaces_memory_get,
  "workspaces.memory.set": h_workspaces_memory_set,
};
