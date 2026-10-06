import type { FeatureMount } from "../registry";
import { useStore } from "../../store";
import { showOrganizationEditor } from "../organization-state";
import { ArchiveOverlay } from "../organization-overlays";

export const mount: FeatureMount = {
  feature: "archive",
  overlays: [ArchiveOverlay],
  commands: {
    "show-archived-tabs": () => showOrganizationEditor({ kind: "archive" }),
    "archive-restore": async (_state, invocation) => {
      const payload = invocation.payload;
      const entry =
        payload &&
        "archiveId" in payload &&
        useStore.getState().layout.archivedTabs?.find((entry) => entry.archiveId === payload.archiveId);
      if (!entry) throw new Error("Choose an archived tab first.");
      return (await import("../../archive-actions")).restoreArchivedTab(entry);
    },
    "archive-restore-all": async () => (await import("../../archive-actions")).restoreAllArchivedTabs(),
    "archive-delete": async (_state, invocation) => {
      const payload = invocation.payload;
      if (!payload || !("archiveId" in payload)) throw new Error("Choose an archived tab first.");
      await (await import("../../archive-actions")).deleteArchivedTab(payload.archiveId);
    },
    "archive-undo": async (_state, invocation) => {
      const payload = invocation.payload;
      if (!payload || !("batchId" in payload)) throw new Error("Choose an archive batch first.");
      return (await import("../../archive-actions")).undoArchiveBatch(payload.batchId);
    },
  },
};
