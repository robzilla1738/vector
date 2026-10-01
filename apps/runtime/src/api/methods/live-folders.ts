import { AuxError } from "@aux/contracts";

async function h_live_folders(): Promise<never> {
  throw new AuxError("feature_unavailable", "Live folders are not implemented.");
}

export const liveFolderMethods = {
  "liveFolders.items": h_live_folders,
  "liveFolders.refresh": h_live_folders,
  "liveFolders.markRead": h_live_folders,
  "github.connections.list": h_live_folders,
  "github.connections.connect": h_live_folders,
  "github.connections.revoke": h_live_folders,
};
