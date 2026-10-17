import { useEffect, useRef, useState } from "react";
import { useStore, call } from "../store";
import { bridge, inNativeHost } from "../bridge";
import {
  deliverRunAttention,
  foregroundRunId,
  matchesRunAttentionActivation,
  RunNotificationGate,
  type OwnerNotice,
} from "../agent/run-notifications";
import {
  onInAppNoticePreferenceChange,
  readInAppNoticePreference,
  readSystemTaskNotices,
  readTaskFocusMode,
  readTaskSound,
  readTaskNoticeKinds,
} from "../agent/run-notice-preference";

import { playTaskSound } from "../agent/task-sound";

export function useRunAttention() {
  const [runNotice, setRunNotice] = useState<OwnerNotice | null>(null);
  const [noticePreference, setNoticePreference] = useState(readInAppNoticePreference);
  const notificationGate = useRef<RunNotificationGate | null>(null);
  if (!notificationGate.current)
    notificationGate.current = new RunNotificationGate({
      getRun: (runId) => call("runs.get", { runId }),
      emit: async (notice) => {
        const sound = readTaskSound();
        if (sound !== "off" && !readTaskFocusMode() && !document.hasFocus())
          void playTaskSound(sound).catch(() => {});
        await deliverRunAttention(notice, {
          showInApp: setRunNotice,
          native: inNativeHost ? (payload) => bridge.showRunAttention(payload) : undefined,
          systemEnabled: readSystemTaskNotices(),
          focusMode: readTaskFocusMode(),
          windowFocused: document.hasFocus(),
          windowId: bridge.windowId,
        });
      },
    });
  const foregroundRun = useStore((state) => foregroundRunId(state));
  useEffect(
    () =>
      onInAppNoticePreferenceChange(() => {
        const current = readInAppNoticePreference();
        setNoticePreference(current);
        const kinds = readTaskNoticeKinds();
        setRunNotice((notice) =>
          current === "off" ||
          readTaskFocusMode() ||
          (notice && !(notice.kind === "completed" ? kinds.completion : kinds.attention))
            ? null
            : notice,
        );
      }),
    [],
  );
  useEffect(() => {
    const off = bridge.onRunAttentionActivated(({ runId, identity, windowId }) => {
      if (bridge.privateMode || windowId !== bridge.windowId) return;
      void call("runs.get", { runId })
        .then((current) => {
          if (!matchesRunAttentionActivation(current, { runId, identity, windowId })) return;
          setRunNotice(null);
          useStore.getState().openConversation(runId);
          void bridge.focusShell().catch(() => {});
        })
        .catch(() => {});
    });
    return off;
  }, []);
  useEffect(() => {
    if (runNotice?.runId === foregroundRun && document.hasFocus()) setRunNotice(null);
  }, [foregroundRun, runNotice]);
  useEffect(() => {
    const check = () => {
      const current = foregroundRunId(useStore.getState());
      setRunNotice((notice) => (notice?.runId === current ? null : notice));
    };
    window.addEventListener("focus", check);
    return () => window.removeEventListener("focus", check);
  }, []);
  return { runNotice, setRunNotice, noticePreference, foregroundRun, notificationGate };
}
