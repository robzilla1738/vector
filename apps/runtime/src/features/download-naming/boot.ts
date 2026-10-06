import { deferRuntimeWork, isRuntimeIdle } from "../../services/idle.js";
import { AuxError } from "@aux/contracts";
import type { Services } from "../../api/methods/context.js";
import { DownloadNamingService } from "../../services/download-naming.js";
const instances = new WeakMap<Services, DownloadNamingService>();
export function downloadNaming(services: Services): DownloadNamingService {
  const existing = instances.get(services);
  if (existing) return existing;
  const native = services.native;
  if (
    !native?.downloadRenameReceipts ||
    !native.downloadNamingCandidate ||
    !native.downloadPreviewText ||
    !native.renameDownload ||
    !native.undoDownloadRename
  )
    throw new AuxError("feature_unavailable", "Smart download naming requires the Aux native browser.");
  const service = new DownloadNamingService(
    services.repo,
    services.settings,
    {
      downloadRenameReceipts: () => native.downloadRenameReceipts!(),
      downloadNamingCandidate: (id) => native.downloadNamingCandidate!(id),
      downloadPreviewText: (id) => native.downloadPreviewText!(id),
      renameDownload: (input) => native.renameDownload!(input),
      undoDownloadRename: (id) => native.undoDownloadRename!(id),
    },
    services.events,
  );
  instances.set(services, service);
  return service;
}
export const feature = "smartDownloadNames" as const;
export const boot = (services: Services) => {
  if (services.featureHost !== "chromium-fork") return;
  return deferRuntimeWork(
    () => isRuntimeIdle(services.repo),
    async () => {
      await downloadNaming(services)
        .receipts()
        .catch((error) =>
          console.error(
            "Download receipt recovery failed",
            error instanceof AuxError ? error.code : "internal",
          ),
        );
    },
  );
};
