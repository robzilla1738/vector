import { withRunAuthorityMutation } from "../../services/overnight-authority.js";
import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName, WorkspaceMemory } from "@aux/contracts";
import { normalWindowOwner } from "./normal-window-owner.js";
import { AuxError, MethodSchemas } from "@aux/contracts";
import { memoryOrigin } from "@aux/contracts/memory-context";
import { memoryContentSensitivityReason, memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import { advanceManagedRecoveryGeneration } from "../../services/managed-recovery-generation.js";
import { attemptFreshManagedBackup } from "../../services/runtime-backup.js";

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
  if (method === "workspaces.folders.inspect")
    return workspaceFolders.inspect(params.workspaceId, params.path, params.access);
  if (method === "workspaces.folders.add")
    return workspaceFolders.add(params.workspaceId, params.path, params.access, params.expectedDigest, {
      name: params.name,
      icon: params.icon,
      color: params.color,
    });
  if (method === "workspaces.folders.list") return workspaceFolders.list(params.workspaceId);
  return workspaceFolders.archive(params.workspaceId, params.folderId);
}
async function h_workspaces_memory_search(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Search Space memory in Aux.");
  return tasks.searchWorkspaceMemory(params.query);
}
async function h_workspaces_browsingMemory_get(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external) throw new AuxError("permission_denied", "Browsing memory is managed in Aux.");
  if (["workspaces.browsingMemory.set", "workspaces.browsingMemory.forget"].includes(ctx.method))
    return withRunAuthorityMutation(ctx.s.repo, () => retired_h_workspaces_browsingMemory_get(ctx));
  return retired_h_workspaces_browsingMemory_get(ctx);
}

async function retired_h_workspaces_browsingMemory_get(ctx: MethodCtx): Promise<unknown> {
  const { browsingMemory, method, params, revokeWorkspaceContext, s } = ctx;
  if (method === "workspaces.browsingMemory.get") return browsingMemory.get(params.workspaceId);
  if (method === "workspaces.browsingMemory.set") {
    const prior = browsingMemory.policy(params.workspaceId);
    const generation =
      params.policy.retentionDays < prior.retentionDays && browsingMemory.get(params.workspaceId).pages.length
        ? advanceManagedRecoveryGeneration(s.settings.all().dataDir)
        : undefined;
    const result = browsingMemory.setPolicy(params.workspaceId, params.policy);
    if ((prior.enabled && !result.policy.enabled) || result.policy.retentionDays < prior.retentionDays)
      await revokeWorkspaceContext(params.workspaceId, true);
    s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId });
    if (generation) await attemptFreshManagedBackup(s.repo, s.settings.all().dataDir, generation);
    return result;
  }
  if (method === "workspaces.browsingMemory.record")
    return browsingMemory.record(
      params.workspaceId,
      s.pages.get(params.pageId),
      params.expectedDocumentEpoch,
    );
  const saved = browsingMemory.get(params.workspaceId).pages;
  const generation = saved.some((page) => !params.memoryId || page.memoryId === params.memoryId)
    ? advanceManagedRecoveryGeneration(s.settings.all().dataDir)
    : undefined;
  const result = browsingMemory.forget(params.workspaceId, params.memoryId);
  await revokeWorkspaceContext(params.workspaceId, true);
  s.events.emit("workspace.browsingMemory.updated", { workspaceId: params.workspaceId });
  if (generation) await attemptFreshManagedBackup(s.repo, s.settings.all().dataDir, generation);
  return result;
}
async function h_workspaces_contentMemory_policy(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external) throw new AuxError("permission_denied", "Page-content memory is managed in Aux.");
  if (["workspaces.contentMemory.setPolicy", "workspaces.contentMemory.forget"].includes(ctx.method))
    return withRunAuthorityMutation(ctx.s.repo, () => retired_h_workspaces_contentMemory_policy(ctx));
  return retired_h_workspaces_contentMemory_policy(ctx);
}

async function retired_h_workspaces_contentMemory_policy(ctx: MethodCtx): Promise<unknown> {
  const { method, params, revokeArticleRuns, s, spaces } = ctx;
  const store = s.contentMemory;
  if (!store)
    throw new AuxError("backend_unavailable", "Protected page-content memory requires the Aux desktop app.");
  if (method === "workspaces.contentMemory.policy") {
    const policy = store.policy(params.workspaceId);
    if (policy.enabled) void store.prewarm(params.workspaceId).catch(() => {});
    return policy;
  }
  if (method === "workspaces.contentMemory.setPolicy") {
    const prior = store.policy(params.workspaceId);
    let advanced = false;
    let generation: ReturnType<typeof advanceManagedRecoveryGeneration> | undefined;
    let result: Awaited<ReturnType<typeof store.setPolicy>>;
    try {
      result = await store.setPolicy(params.workspaceId, params.policy, async () => {
        generation = advanceManagedRecoveryGeneration(s.settings.all().dataDir);
        advanced = true;
        const allowedOrigins = params.policy.allowedOrigins.map(memoryOrigin);
        if (
          !params.policy.enabled ||
          (prior.originScope === "safe-sites" &&
            (params.policy.originScope ?? "safe-sites") !== "safe-sites") ||
          params.policy.retentionDays < prior.retentionDays ||
          prior.allowedOrigins.some((origin) => !allowedOrigins.includes(origin))
        ) {
          await s.runs.retireArticleTransferSources(params.workspaceId);
          await revokeArticleRuns(params.workspaceId);
        }
      });
    } catch (error) {
      if (advanced)
        throw new AuxError(
          "conflict",
          "Article removal could not be confirmed. Older managed backups were invalidated; review saved articles and create a fresh local backup.",
        );
      throw error;
    }
    if (
      !result.enabled ||
      (prior.originScope === "safe-sites" && result.originScope !== "safe-sites") ||
      result.retentionDays < prior.retentionDays ||
      prior.allowedOrigins.some((origin) => !result.allowedOrigins.includes(origin))
    )
      await revokeArticleRuns(params.workspaceId);
    await s.runs.redactForgottenArticleOutputs(params.workspaceId);
    s.checkpointDeletedData?.();
    s.events.emit("workspace.contentMemory.updated", {
      workspaceId: params.workspaceId,
      policyChanged: true,
    });
    if (generation) await attemptFreshManagedBackup(s.repo, s.settings.all().dataDir, generation);
    return result;
  }
  if (method === "workspaces.contentMemory.embeddingModels") return store.embeddingModels(params.workspaceId);
  if (method === "workspaces.contentMemory.semanticSearch")
    return store.semanticSearch(params.workspaceId, params.query);
  if (method === "workspaces.contentMemory.list") return store.list(params.workspaceId, params);
  if (method === "workspaces.contentMemory.search") return store.search(params.workspaceId, params.query);
  if (method === "workspaces.contentMemory.get") {
    const body = await store.get(params.workspaceId, params.memoryId);
    if (!body) return null;
    const { memoryId, profileId, workspaceId, pageId, documentEpoch, url, title, capturedAt, text } = body;
    return { memoryId, profileId, workspaceId, pageId, documentEpoch, url, title, capturedAt, text };
  }
  if (method === "workspaces.contentMemory.forget") {
    let advanced = false;
    let generation: ReturnType<typeof advanceManagedRecoveryGeneration> | undefined;
    let forgotten: number;
    try {
      forgotten = await store.forget(params.workspaceId, params.memoryId, async () => {
        generation = advanceManagedRecoveryGeneration(s.settings.all().dataDir);
        advanced = true;
        await s.runs.retireArticleTransferSources(params.workspaceId, params.memoryId);
        await revokeArticleRuns(params.workspaceId, params.memoryId);
      });
    } catch (error) {
      if (advanced)
        throw new AuxError(
          "conflict",
          "Article Forget could not be confirmed. Older managed backups were invalidated; review saved articles and create a fresh local backup.",
        );
      throw error;
    }
    await s.runs.redactForgottenArticleOutputs(params.workspaceId);
    s.checkpointDeletedData?.();
    s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
    if (generation) await attemptFreshManagedBackup(s.repo, s.settings.all().dataDir, generation);
    return { forgotten };
  }
  const page = { ...s.pages.get(params.pageId) };
  if (!spaces.list().some((space) => space.workspaceId === params.workspaceId && !space.archived))
    throw new AuxError("permission_denied", "Choose an active Space for this article.");
  if (
    !s.native?.captureReadablePage ||
    page.backend !== "aux" ||
    page.ownedByRuntime ||
    !!page.agentIsolation ||
    !["normal", "little"].includes(page.windowKind ?? "") ||
    page.workspaceId !== params.workspaceId ||
    !page.windowId ||
    page.viewStatus !== "visible" ||
    page.loading ||
    !!page.navigationError ||
    !["none", "human"].includes(page.controller) ||
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
    current.ownedByRuntime ||
    !!current.agentIsolation ||
    current.windowKind !== page.windowKind ||
    current.windowId !== page.windowId ||
    current.workspaceId !== params.workspaceId ||
    current.viewStatus !== "visible" ||
    current.loading ||
    !["none", "human"].includes(current.controller)
  )
    throw new AuxError("conflict", "The document changed during capture. Try again.");
  const saved = await store.saveEligible(
    {
      workspaceId: params.workspaceId,
      pageId: page.pageId,
      documentEpoch: page.documentEpoch,
      sessionId: page.sessionId,
      ...captured,
    },
    () => {
      const live = s.pages.get(page.pageId);
      return (
        live.documentEpoch === page.documentEpoch &&
        live.sessionId === page.sessionId &&
        live.url === page.url &&
        live.backend === "aux" &&
        !live.ownedByRuntime &&
        !live.agentIsolation &&
        live.windowKind === page.windowKind &&
        live.windowId === page.windowId &&
        live.workspaceId === params.workspaceId &&
        live.viewStatus === "visible" &&
        !live.loading &&
        ["none", "human"].includes(live.controller)
      );
    },
  );
  s.events.emit("workspace.contentMemory.updated", { workspaceId: params.workspaceId });
  return { memoryId: saved.memoryId, capturedAt: saved.capturedAt, title: saved.title, url: saved.url };
}
async function h_workspaces_memory_get(ctx: MethodCtx): Promise<unknown> {
  const { client, params, tasks } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
  return tasks.workspaceMemory(params.workspaceId);
}
async function h_workspaces_memory_set(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external) throw new AuxError("permission_denied", "Workspace memory is managed in Aux.");
  await ctx.s.memoryPipeline?.retireWorkspace(ctx.params.workspaceId);
  if (["workspaces.memory.set"].includes(ctx.method))
    return withRunAuthorityMutation(ctx.s.repo, () => retired_h_workspaces_memory_set(ctx));
  return retired_h_workspaces_memory_set(ctx);
}

async function retired_h_workspaces_memory_set(ctx: MethodCtx): Promise<unknown> {
  const { params, revokeWorkspaceContext, s, tasks } = ctx;
  const prior = tasks.workspaceMemory(params.workspaceId);
  const items = (params.items ?? prior.items ?? []) as NonNullable<WorkspaceMemory["items"]>;
  const removesText = !!prior.content && !params.content.includes(prior.content);
  const removesItem = (prior.items ?? []).some(
    (old) =>
      !items.some(
        (item) =>
          item.itemId === old.itemId && item.content === old.content && item.sourceUrl === old.sourceUrl,
      ),
  );
  const addsExclusion = ((params.excludedOrigins ?? []) as string[]).some(
    (origin) => !(prior.excludedOrigins ?? []).includes(origin),
  );
  let advanced = false;
  let generation: ReturnType<typeof advanceManagedRecoveryGeneration> | undefined;
  const beforeSave =
    prior.revision === params.expectedRevision && (removesText || removesItem || addsExclusion)
      ? () => {
          generation = advanceManagedRecoveryGeneration(s.settings.all().dataDir);
          advanced = true;
        }
      : undefined;
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
    if (advanced)
      throw new AuxError(
        "conflict",
        "Memory update could not be confirmed. Older managed backups were invalidated; review Memory and create a fresh local backup.",
      );
    throw error;
  }
  if (removesText || removesItem || addsExclusion)
    await s.memoryPipeline?.retireOwnerDerivatives(params.workspaceId);
  await s.contentMemory?.invalidateDerivatives();
  await revokeWorkspaceContext(params.workspaceId, false);
  await s.runs.redactForgottenArticleOutputs(params.workspaceId);
  if (generation) await attemptFreshManagedBackup(s.repo, s.settings.all().dataDir, generation);
  return memory;
}

async function h_workspaces_memory_setDocument(ctx: MethodCtx): Promise<unknown> {
  const owner = await normalWindowOwner(ctx);
  const input = MethodSchemas["workspaces.memory.setDocument"].parse(ctx.params);
  await ctx.s.memoryPipeline?.retireWorkspace(input.workspaceId);
  return withRunAuthorityMutation(ctx.s.repo, async () => {
    await owner.current();
    const prior = ctx.tasks.workspaceMemory(input.workspaceId);
    const previous = prior.documents?.find((document) => document.path === input.path);
    let generation: ReturnType<typeof advanceManagedRecoveryGeneration> | undefined;
    const beforeSave =
      previous && (input.content === null || !input.content.includes(previous.content))
        ? () => {
            generation = advanceManagedRecoveryGeneration(ctx.s.settings.all().dataDir);
          }
        : undefined;
    let memory: WorkspaceMemory;
    try {
      memory = ctx.tasks.setWorkspaceMemoryDocument(input, beforeSave);
    } catch (error) {
      if (generation)
        throw new AuxError(
          "conflict",
          "Memory update could not be confirmed. Review Memory and create a fresh local backup.",
        );
      throw error;
    }
    if (previous && (input.content === null || !input.content.includes(previous.content)))
      await ctx.s.memoryPipeline?.retireOwnerDerivatives(input.workspaceId);
    await ctx.s.contentMemory?.invalidateDerivatives();
    await ctx.revokeWorkspaceContext(input.workspaceId, false);
    await ctx.s.runs.redactForgottenArticleOutputs(input.workspaceId);
    if (generation) await attemptFreshManagedBackup(ctx.s.repo, ctx.s.settings.all().dataDir, generation);
    return memory;
  });
}

export const workspacesMethods: Partial<Record<MethodName, MethodHandler>> = {
  "workspaces.create": h_workspaces_create,
  "workspaces.list": h_workspaces_list,
  "workspaces.folders.inspect": h_workspaces_folders,
  "workspaces.folders.add": h_workspaces_folders,
  "workspaces.folders.list": h_workspaces_folders,
  "workspaces.folders.archive": h_workspaces_folders,
  "workspaces.memory.search": h_workspaces_memory_search,
  "workspaces.browsingMemory.get": h_workspaces_browsingMemory_get,
  "workspaces.browsingMemory.set": h_workspaces_browsingMemory_get,
  "workspaces.browsingMemory.record": h_workspaces_browsingMemory_get,
  "workspaces.browsingMemory.forget": h_workspaces_browsingMemory_get,
  "workspaces.contentMemory.policy": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.setPolicy": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.capture": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.embeddingModels": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.semanticSearch": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.list": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.search": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.get": h_workspaces_contentMemory_policy,
  "workspaces.contentMemory.forget": h_workspaces_contentMemory_policy,
  "workspaces.memory.get": h_workspaces_memory_get,
  "workspaces.memory.set": h_workspaces_memory_set,
  "workspaces.memory.setDocument": h_workspaces_memory_setDocument,
};
