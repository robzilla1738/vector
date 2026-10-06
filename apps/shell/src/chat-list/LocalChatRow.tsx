import { memo, useSyncExternalStore } from "react";
import { STATUS_LABEL } from "../run-status";
import { isLive, useStore } from "../store";
import { hostOf } from "../workspace";
import {
  shellIconAgentSm,
  shellIconAlert,
  shellIconChat,
  shellIconCheck,
  shellIconCircle,
} from "../ui/icons";

const ago = (ts: number) => {
  const m = Math.floor((Date.now() - ts) / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
};

const minuteListeners = new Set<() => void>();
let minuteTimer: number | undefined;
/** One shared minute clock, running only while some row shows a relative time. */
const subscribeMinute = (listener: () => void) => {
  minuteListeners.add(listener);
  minuteTimer ??= window.setInterval(() => {
    for (const notify of minuteListeners) notify();
  }, 60_000);
  return () => {
    minuteListeners.delete(listener);
    if (!minuteListeners.size) {
      window.clearInterval(minuteTimer);
      minuteTimer = undefined;
    }
  };
};
const currentMinute = () => Math.floor(Date.now() / 60_000);
function Ago({ ts }: { ts: number }) {
  useSyncExternalStore(subscribeMinute, currentMinute);
  return <span className="nums">{ago(ts)}</span>;
}

/** Memoized so a ticking run only re-renders its own row. */
export const LocalChatRow = memo(function LocalChatRow({ runId }: { runId: string }) {
  const r = useStore((s) => s.runs.find((run) => run.runId === runId));
  const page = useStore((s) => s.pages.byId[r?.pageIds[0] ?? ""]);
  if (!r) return null;
  const live = isLive(r);
  return (
    <button
      className={`run-row ${live ? "live" : ""}`}
      onClick={() => useStore.getState().setRailView({ kind: "run", runId: r.runId })}
      title={r.goal}
    >
      <span className={`run-row-ico ${r.status}`}>
        {r.status === "completed"
          ? shellIconCheck
          : r.status === "failed"
            ? shellIconAlert
            : r.status === "needs_input"
              ? shellIconChat
              : live
                ? shellIconAgentSm
                : shellIconCircle}
      </span>
      <span className="run-row-main">
        <span className="run-row-title">{r.goal}</span>
        <span className="run-row-sub">
          <span className={`st mini ${r.status}`}>{STATUS_LABEL[r.status]}</span>
          {page && <span className="h">{hostOf(page.url)}</span>}
          <Ago ts={r.createdAt} />
        </span>
      </span>
    </button>
  );
});
