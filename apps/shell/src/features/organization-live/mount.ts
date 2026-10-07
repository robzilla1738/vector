import type { FeatureMount, CommandInvocation } from "../registry";
import { call, useStore, flushLayout } from "../../store";
import { persistLayout } from "../../store/persistence";
import { showOrganizationEditor } from "../organization-state";
import { OrganizationEditor } from "../organization-overlays";
function folderId(invocation: CommandInvocation) {
  const payload = invocation.payload;
  if (
    !payload ||
    !("folderId" in payload) ||
    !useStore.getState().layout.folders.some((folder) => folder.id === payload.folderId)
  )
    throw new Error("Choose an existing folder first.");
  return payload.folderId;
}

export const mount: FeatureMount = {
  feature: "liveFolders",
  overlays: [OrganizationEditor],
  commands: {
    "make-live-folder": (_state, invocation) =>
      showOrganizationEditor({ kind: "live-folder", folderId: folderId(invocation) }),
    "save-live-folder": async (_state, invocation) => {
      const id = folderId(invocation);
      const payload = invocation.payload;
      if (!payload || !("live" in payload)) throw new Error("Choose a live folder source.");
      const state = useStore.getState();
      const layout = {
        ...state.layout,
        folders: state.layout.folders.map((folder) =>
          folder.id === id ? { ...folder, live: payload.live } : folder,
        ),
      };
      useStore.setState({ layout });
      persistLayout(layout);
      await flushLayout();
      await call("liveFolders.refresh", { folderId: id });
    },
    "refresh-live-folder": (_state, invocation) =>
      call("liveFolders.refresh", { folderId: folderId(invocation) }),
    "open-live-folder-item": async (_state, invocation) => {
      const id = folderId(invocation);
      const payload = invocation.payload;
      if (!payload || !("itemId" in payload) || !payload.itemId) throw new Error("Choose a live item first.");
      const { items } = await call("liveFolders.items", { folderId: id });
      const item = items.find((item) => item.id === payload.itemId);
      const folder = useStore.getState().layout.folders.find((folder) => folder.id === id);
      if (!item || !folder) throw new Error("This live item is no longer available.");
      const page = await useStore.getState().openBackgroundTab(item.url, folder.spaceId, false);
      useStore.getState().moveTabToFolder(page.pageId, id);
      await flushLayout();
      await useStore.getState().activate(page.pageId);
      await call("liveFolders.markRead", { folderId: id, itemId: item.id });
    },

  },
};
