import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, EventTypes, type Download } from "@aux/contracts";
import { PageClaimStore } from "../../agent/durable.js";

async function h_downloads_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.repo.listDownloads();
}
async function h_downloads_projectNative(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external || s.featureHost !== "chromium-fork")
    throw new AuxError("permission_denied", "Native download projection requires the Aux browser shell");
  const p = params as Download & { tabUrl: string; downloadRoot: string };
  const existing = s.repo.downloadStep(p.id);
  const matches = s.pages
    .list()
    .filter((page) => page.backend === "aux" && page.viewStatus !== "detached" && page.url === p.tabUrl);
  const candidate = matches.length === 1 ? matches[0] : undefined;
  const claim = candidate && new PageClaimStore(s.repo.db).activeForPage(candidate.pageId);
  const run = claim && s.repo.getRun(claim.runId);
  const pageId =
    existing?.pageId ??
    (candidate?.controller === "agent" &&
    claim &&
    run?.status === "running" &&
    claim.createdAt <= p.startedAt &&
    (run.startedAt ?? run.createdAt) <= p.startedAt
      ? candidate.pageId
      : undefined);
  const info = {
    id: p.id,
    sourceUrl: p.sourceUrl,
    filename: p.filename,
    path: p.path,
    size: p.size,
    totalBytes: p.totalBytes,
    startedAt: p.startedAt,
    endedAt: p.endedAt,
    downloadRoot: p.downloadRoot,
  };
  if (!existing) s.pages.onNativeDownloadStarted(pageId, info);
  if (p.state === "completed" || p.state === "interrupted" || p.state === "cancelled")
    await s.pages.onNativeDownload(pageId, { ...info, state: p.state });
  else if (existing) s.repo.saveDownload({ ...info, pageId, state: p.state });
  return { accepted: true };
}
async function h_downloads_remove(ctx: MethodCtx): Promise<unknown> {
  const { client, params, s } = ctx;
  if (client.external) throw new AuxError("permission_denied", "Manage downloads in Aux.");
  const removed = s.repo.removeFinishedDownloads(params.ids);
  if (removed.length) s.checkpointDeletedData?.();
  if (removed.length) s.events.emit(EventTypes.DownloadsRemoved, { ids: removed });
  return { removed };
}

export const downloadsMethods: Partial<Record<MethodName, MethodHandler>> = {
  "downloads.list": h_downloads_list,
  "downloads.projectNative": h_downloads_projectNative,
  "downloads.remove": h_downloads_remove,
};
