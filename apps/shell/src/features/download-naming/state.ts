import { create } from "zustand";
import { DownloadRenameReceiptSchema, type DownloadRenameReceipt } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call, errToast, toast } from "../../store";
import { executeCommand } from "../../commands";
export const useDownloadRenames = create<{ receipts: DownloadRenameReceipt[] }>(() => ({ receipts: [] }));
export async function refreshDownloadRenames() {
  const receipts = await call("downloads.renameReceipts", {});
  useDownloadRenames.setState({ receipts });
}
export async function undoDownloadRename(receiptId?: string) {
  if (!receiptId) {
    await refreshDownloadRenames();
    receiptId = useDownloadRenames.getState().receipts[0]?.receiptId;
  }
  if (!receiptId) throw new Error("There is no recent download rename to undo.");
  const result = await call("downloads.undoRename", { receiptId });
  if (result.status === "conflict")
    throw new Error(
      "The file changed or its original name is taken. Rename it in Finder after reviewing it.",
    );
  if (result.status === "expired")
    throw new Error("Undo is available for 24 hours after a download is renamed.");
  await refreshDownloadRenames();
  return result;
}
export function bootDownloadRenames() {
  let live = true;
  void refreshDownloadRenames().catch(errToast);
  const off = bridge.onEvent((event) => {
    if (!live) return;
    if (event.type === "download.renamed") {
      const parsed = DownloadRenameReceiptSchema.safeParse(event.payload);
      if (!parsed.success) return;
      const receipt = parsed.data;
      useDownloadRenames.setState((state) => ({
        receipts: [receipt, ...state.receipts.filter((item) => item.downloadId !== receipt.downloadId)],
      }));
      toast(`Renamed to ${receipt.filename}`, "info", {
        label: "Undo",
        run: () => {
          void executeCommand("undo-download-rename", { payload: { receiptId: receipt.receiptId } }).catch(
            errToast,
          );
        },
      });
    }
    if (event.type === "download.renameUndone") void refreshDownloadRenames().catch(errToast);
  });
  return () => {
    live = false;
    off();
    useDownloadRenames.setState({ receipts: [] });
  };
}
