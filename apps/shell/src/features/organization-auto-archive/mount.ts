import type { FeatureMount } from "../registry";
import { call, useStore } from "../../store";
import { archiveSettings, installAutoArchive, ARCHIVE_POLICIES } from "../../auto-archive";
import { showOrganizationEditor } from "../organization-state";
import { ArchivePolicyOverlay } from "../organization-overlays";
import { AutoArchiveEducation } from "../../components/AutoArchiveEducation";

export const mount: FeatureMount = {
  feature: "autoArchive", boot: installAutoArchive, overlays: [ArchivePolicyOverlay], sidebarItems: [AutoArchiveEducation],
  commands: {
    "acknowledge-auto-archive": async state => {
      await call("settings.set", { autoArchive: { ...archiveSettings(state.settings.autoArchive), acknowledged: true } });
      await useStore.getState().refresh();
    },
    "configure-auto-archive": (state, invocation) => {
      const payload = invocation.payload;
      showOrganizationEditor({ kind: "archive-policy", spaceId: payload && "spaceId" in payload ? payload.spaceId ?? state.layout.activeSpaceId : state.layout.activeSpaceId });
    },
    "set-auto-archive-policy": async (_state, invocation) => {
      const payload = invocation.payload;
      if (!payload || !("archiveHours" in payload) || !ARCHIVE_POLICIES.includes(payload.archiveHours)) throw new Error("Choose an archive policy.");
      const state = useStore.getState();
      if (!state.layout.spaces.some(space => space.id === payload.spaceId)) throw new Error("This Space is no longer available.");
      const settings = archiveSettings(state.settings.autoArchive);
      await call("settings.set", { autoArchive: { acknowledged: true, bySpace: { ...settings.bySpace, [payload.spaceId]: payload.archiveHours } } });
      await useStore.getState().refresh();
    },
  },
};
