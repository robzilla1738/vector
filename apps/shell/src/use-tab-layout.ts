import { useShallow } from "zustand/react/shallow";
import { useStore } from "./store";
import type { Layout } from "./workspace";

/** List placement changes independently of per-page names and native focus receipts. */
export function useTabLayout(): Layout {
  return useStore(
    useShallow(({ layout }) => ({
      spaces: layout.spaces,
      archivedSpaces: layout.archivedSpaces,
      activeSpaceId: layout.activeSpaceId,
      order: layout.order,
      tabSpace: layout.tabSpace,
      tabFolder: layout.tabFolder,
      folders: layout.folders,
      pins: layout.pins,
    })),
  );
}
