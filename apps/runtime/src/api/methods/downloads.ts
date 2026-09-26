import type { MethodCtx, MethodHandler } from "./context.js";
import type { MethodName } from "@aux/contracts";
import { AuxError, EventTypes } from "@aux/contracts";

async function h_downloads_list(ctx: MethodCtx): Promise<unknown> {
  const { s } = ctx;
  return s.repo.listDownloads();
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
  "downloads.remove": h_downloads_remove,
};
