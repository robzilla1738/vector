import { AuxError } from "@aux/contracts";
import type { MethodCtx } from "./context.js";
import { downloadNaming } from "../../features/download-naming/boot.js";
function service(ctx: MethodCtx) {
  if (ctx.client.external || ctx.client.codeMode || ctx.s.featureHost !== "chromium-fork")
    throw new AuxError("permission_denied", "Manage download names in Aux.");
  return downloadNaming(ctx.s);
}
async function h_downloads_completedNative(ctx: MethodCtx) {
  return service(ctx).completed(ctx.params);
}
async function h_downloads_undoRename(ctx: MethodCtx) {
  return service(ctx).undo(ctx.params.receiptId);
}
async function h_downloads_renameReceipts(ctx: MethodCtx) {
  return service(ctx).receipts();
}
export const downloadNamingMethods = {
  "downloads.completedNative": h_downloads_completedNative,
  "downloads.undoRename": h_downloads_undoRename,
  "downloads.renameReceipts": h_downloads_renameReceipts,
};
