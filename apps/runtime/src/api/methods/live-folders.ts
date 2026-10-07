import { AuxError, type MethodName } from "@aux/contracts";
import type { MethodCtx, MethodHandler } from "./context.js";
import { liveFolderServices } from "../../services/live-folder-services.js";

async function h_liveFolder(ctx: MethodCtx): Promise<unknown> {
  if (ctx.client.external || ctx.client.codeMode)
    throw new AuxError("permission_denied", "Live folders and GitHub connections are managed in Aux.");
  const { folders } = liveFolderServices(ctx);
  switch (ctx.method) {
    case "liveFolders.items":
      return folders.items(ctx.params.folderId);
    case "liveFolders.refresh":
      return folders.refresh(ctx.params.folderId);
    case "liveFolders.markRead":
      return folders.markRead(ctx.params.folderId, ctx.params.itemId);
    default:
      throw new AuxError("invalid_params", "Unknown live-folder method.");
  }
}

export const liveFolderMethods: Partial<Record<MethodName, MethodHandler>> = {
  "liveFolders.items": h_liveFolder,
  "liveFolders.refresh": h_liveFolder,
  "liveFolders.markRead": h_liveFolder,
};
