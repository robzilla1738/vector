import { useMemo } from "react";
import type { PageTarget } from "@aux/contracts";
import { useShallow } from "zustand/react/shallow";
import { useStore } from "./store";
import { isTab } from "./workspace";

export type TabMembership = Pick<PageTarget, "pageId"> & { viewStatus: "visible"; ownedByRuntime: false };

/** Page metadata is read by each row. The lists subscribe only when their
 * membership changes, so a background title or loading event stays in its row. */
export function useTabMembership(): TabMembership[] {
  const ids = useStore(useShallow((state) => state.pages.filter(isTab).map((page) => page.pageId)));
  return useMemo(
    () => ids.map((pageId) => ({ pageId, viewStatus: "visible" as const, ownedByRuntime: false })),
    [ids],
  );
}
