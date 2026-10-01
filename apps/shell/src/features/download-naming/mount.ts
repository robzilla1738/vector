import { DownloadNamingSettingsSchema } from "@aux/contracts";
import { call, useStore } from "../../store";
import type { FeatureMount } from "../registry";
import { DownloadNamingSettings } from "./Settings";
import { bootDownloadRenames, undoDownloadRename } from "./state";
export const mount: FeatureMount = {
  feature: "smartDownloadNames",
  boot: bootDownloadRenames,
  settingsSections: [{ category: "Downloads", component: DownloadNamingSettings }],
  commands: {
    "undo-download-rename": (_state, invocation) =>
      undoDownloadRename(
        invocation.payload && "receiptId" in invocation.payload ? invocation.payload.receiptId : undefined,
      ),
    "set-download-naming": async (_state, invocation) => {
      if (!invocation.payload || !("downloadNaming" in invocation.payload))
        throw new Error("Choose download naming preferences first.");
      return call("settings.set", {
        downloadNaming: DownloadNamingSettingsSchema.parse(invocation.payload.downloadNaming),
      });
    },
    "show-download-settings": (state) => {
      useStore.setState({ settingsCategory: "Downloads" });
      state.setOverlay("settings");
    },
  },
};
