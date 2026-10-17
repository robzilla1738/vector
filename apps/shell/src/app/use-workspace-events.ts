import { useEffect, type RefObject } from "react";
import type { Run } from "@aux/contracts";
import { bridge } from "../bridge";
import { useStore, call, errToast } from "../store";
import { reconcileResultDrafts } from "../result-drafts";
import { foregroundRunId, type RunNotificationGate } from "../agent/run-notifications";
import {
  readInAppNoticePreference,
  readTaskFocusMode,
  readTaskNoticeKinds,
} from "../agent/run-notice-preference";

export function useWorkspaceEvents(notificationGate: RefObject<RunNotificationGate | null>) {
  // initial sync + event stream
  useEffect(() => {
    let active = true,
      checkingDrafts = false;
    const reconcileDrafts = async () => {
      if (!active || checkingDrafts || !useStore.getState().connected) return;
      checkingDrafts = true;
      try {
        await reconcileResultDrafts(async (drafts) => call("results.available", { drafts }));
      } catch (reason) {
        if (String(reason).includes("could not be removed")) errToast(reason);
      } finally {
        checkingDrafts = false;
      }
    };
    void useStore.getState().refresh().then(reconcileDrafts);
    const offEvent = bridge.onEvent((e) => {
      const candidate =
        e.type === "run.status" || e.type === "run.updated" ? (e.payload.run as Run | undefined) : undefined;
      const previous = candidate
        ? useStore.getState().runs.find((run) => run.runId === candidate.runId)
        : undefined;
      useStore.getState().applyEvent(e);
      if (
        candidate &&
        !bridge.privateMode &&
        useStore.getState().runs.find((run) => run.runId === candidate.runId)?.status === candidate.status
      ) {
        void notificationGate.current
          ?.consider(previous, candidate, () => {
            const state = useStore.getState();
            return {
              preference: readInAppNoticePreference(),
              focusMode: readTaskFocusMode(),
              kinds: readTaskNoticeKinds(),
              windowFocused: document.hasFocus(),
              foregroundRunId: foregroundRunId(state),
            };
          })
          .catch(() => {});
      }
      if (e.type === "workspace.contentMemory.updated") void reconcileDrafts();
    });
    const offTabs = bridge.onTabsPatch((patch) => useStore.getState().applyTabsPatch(patch));
    const offPlacement = bridge.onTabsPlacement((payload) => useStore.getState().applyTabsPlacement(payload));
    const offRuntime = bridge.onRuntimeStatus((status) => {
      useStore.setState({ connected: status.connected });
      if (status.connected) void useStore.getState().refresh().then(reconcileDrafts);
    });
    return () => {
      active = false;
      offEvent();
      offTabs();
      offPlacement();
      offRuntime();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
