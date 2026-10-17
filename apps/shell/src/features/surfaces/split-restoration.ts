import { useStore, errToast } from "../../store";
import {
  commitSplit,
  localSplitPage,
  splitOperationPending,
  onSplitOperationsSettled,
} from "./split-actions";

/** Organization survives restart; recreate its native pair once pages return. */
export function restoreNativeSplits() {
  let live = true,
    pending = false;
  const attempted = new Set<string>();
  const restore = () => {
    const state = useStore.getState();
    if (
      !live ||
      pending ||
      splitOperationPending() ||
      !state.connected ||
      state.restoringTabs ||
      !state.catalogVersion
    )
      return;
    const pairs = (state.layout.splitGroups ?? []).filter(
      (group) => group.panes.length === 2 && group.panes.every(localSplitPage),
    );
    const missing = pairs.filter((group) => {
      const pages = group.panes.map((id) => state.pages.byId[id ?? ""]!);
      return pages.every((page) => !page.split);
    });
    if (!missing.length) return;
    const signature = JSON.stringify(missing);
    if (attempted.has(signature)) return;
    attempted.add(signature);
    pending = true;
    // Existing native pairs remain intact. Serialized split ACKs and current
    // organization/ownership checks also protect restoration from moved tabs.
    const nativePrevious = {
      ...state.layout,
      splitGroups: (state.layout.splitGroups ?? []).filter((group) => !missing.includes(group)),
    };
    void commitSplit(state.layout, state.layout, nativePrevious, () => live)
      .catch((error) => {
        if (live) errToast(error);
      })
      .finally(() => {
        pending = false;
        if (live) restore();
      });
  };
  const off = useStore.subscribe(restore);
  const offSettled = onSplitOperationsSettled(restore);
  restore();
  return () => {
    live = false;
    off();
    offSettled();
  };
}
