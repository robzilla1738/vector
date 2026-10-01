import { AuxError } from "@aux/contracts";

async function h_download_naming(): Promise<never> {
  throw new AuxError("feature_unavailable", "Download naming is not implemented.");
}

export const downloadNamingMethods = {
  "downloads.completedNative": h_download_naming,
  "downloads.undoRename": h_download_naming,
};
