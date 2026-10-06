import { useEffect } from "react";
import { inMock } from "../bridge";
import { useStore, LIVE_RUN } from "../store";

export function useMockRailScenario() {
  // mock mode: honour ?rail=1 / set scenario once the first snapshot lands, so
  // screenshots of the agent rail are deterministic
  useEffect(() => {
    if (!inMock) return;
    const q = new URLSearchParams(location.search);
    const unsub = useStore.subscribe((s, prev) => {
      if (!s.connected || prev.connected) return;
      const st = useStore.getState();
      const previewChat = q.get("chat");
      const previewRun = previewChat
        ? st.runs.find((run) => (run.config?.chatId ?? run.runId) === previewChat)
        : undefined;
      if (previewRun) st.openConversation(previewRun.runId);
      else if (q.get("scenario") === "set" && st.sets[0])
        st.openRail({ kind: "set", setId: st.sets[0].setId });
      else if (q.get("rail") === "1") {
        const live = st.runs.find((r) => LIVE_RUN.has(r.status));
        st.openRail(live ? { kind: "run", runId: live.runId } : { kind: "home" });
      }
    });
    return unsub;
  }, []);
}
