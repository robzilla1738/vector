import { createElement, lazy, Suspense } from "react";
import { call, useStore } from "../../store";
import type { FeatureMount } from "../registry";
const DownloadNamingSettings = lazy(() =>
  import("./Settings").then((module) => ({ default: module.DownloadNamingSettings })),
);
function DownloadNamingSection() {
  return createElement(
    Suspense,
    { fallback: createElement("output", null, "Loading download naming settings…") },
    createElement(DownloadNamingSettings),
  );
}
import { bootDownloadRenames, undoDownloadRename } from "./state";
export const mount: FeatureMount = {
  feature: "smartDownloadNames",
  boot: bootDownloadRenames,
  settingsSections: [{ category: "Downloads", component: DownloadNamingSection }],
  commands: {
    "undo-download-rename": (_state, invocation) =>
      undoDownloadRename(
        invocation.payload && "receiptId" in invocation.payload ? invocation.payload.receiptId : undefined,
      ),
    "set-download-naming": async (_state, invocation) => {
      if (!invocation.payload || !("downloadNaming" in invocation.payload))
        throw new Error("Choose download naming preferences first.");
      const { DownloadNamingSettingsSchema } = await import("@aux/contracts/download-naming");
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
