import { smallGhostButtonProps } from "../ui/button-props";
import { STATUS_LABEL } from "../run-status";
import { recentConversations } from "../conversations";
import { memo, useState, useSyncExternalStore } from "react";
import { useShallow } from "zustand/react/shallow";
import { isLive, useStore } from "../store";
import { hostOf } from "../workspace";
import { VirtualList } from "./VirtualList";
import {
  shellIconAgentSm,
  shellIconAlert,
  shellIconChat,
  shellIconCheck,
  shellIconCircle,
  shellIconClose,
  shellIconLayersSm,
  shellIconSearch,
} from "../ui/icons";
import {
  staticNumericCountProps as auxClassNumericCountProps,
  staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps,
} from "../ui/class-props";

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
const RunRow = memo(function RunRow({ runId }: { runId: string }) {
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

const SetRow = memo(function SetRow({ setId }: { setId: string }) {
  const set = useStore((s) => s.sets.find((item) => item.setId === setId));
  const members = useStore(useShallow((s) => s.members.filter((member) => member.setId === setId)));
  const setRailView = useStore((s) => s.setRailView);
  if (!set) return null;
  const done = members.filter((member) => member.status === "completed").length;
  return (
    <button className="run-row" onClick={() => setRailView({ kind: "set", setId })}>
      <span className="run-row-ico set">{shellIconLayersSm}</span>
      <span className="run-row-main">
        <span className="run-row-title">{set.name}</span>
        <span className="run-row-sub nums">
          {done}/{members.length || set.memberIds.length} members
        </span>
      </span>
      <span className="mini-grid" aria-hidden>
        {(members.length ? members : set.memberIds.map((id) => ({ memberId: id, status: "queued" })))
          .slice(0, 24)
          .map((member) => (
            <i key={member.memberId} className={member.status} />
          ))}
      </span>
    </button>
  );
});

/** One entry per recent conversation; full history remains searchable from Chats. */
export function RailHistory() {
  const [q, setQ] = useState("");
  const live = useStore(
    useShallow((s) =>
      recentConversations(s.runs)
        .filter(isLive)
        .map((run) => run.runId),
    ),
  );
  const sets = useStore(useShallow((s) => s.sets.map((set) => set.setId)));
  const past = useStore(
    useShallow((s) => {
      const f = q.trim().toLowerCase();
      const matches = new Set(
        s.runs
          .filter(
            (run) =>
              run.goal.toLowerCase().includes(f) || (run.statusMessage ?? "").toLowerCase().includes(f),
          )
          .map((run) => run.config?.chatId ?? run.runId),
      );
      return recentConversations(s.runs)
        .filter((run) => !isLive(run) && (!f || matches.has(run.config?.chatId ?? run.runId)))
        .map((run) => run.runId);
    }),
  );

  return (
    <div className="rail-home">
      {live.length > 0 && (
        <section className="rail-block">
          <div className="rail-label">
            <span>Live</span>
            <span {...auxClassNumericCountProps}>{live.length}</span>
          </div>
          {live.map((runId) => (
            <RunRow key={runId} runId={runId} />
          ))}
        </section>
      )}
      {sets.length > 0 && (
        <section className="rail-block">
          <div className="rail-label">
            <span>Sets</span>
            <span {...auxClassNumericCountProps}>{sets.length}</span>
          </div>
          {sets.map((setId) => (
            <SetRow key={setId} setId={setId} />
          ))}
        </section>
      )}
      <section className="rail-block grow">
        <div className="rail-label">
          <span>Recent conversations</span>
          <span {...auxClassNumericCountProps}>{past.length}</span>
        </div>
        <div className="rail-search">
          {shellIconSearch}
          <input
            value={q}
            placeholder="Find a recent conversation"
            aria-label="Find a recent conversation"
            onChange={(e) => setQ(e.target.value)}
          />
          {q && (
            <button {...auxClassExtraSmallIconButtonProps} aria-label="Clear" onClick={() => setQ("")}>
              {shellIconClose}
            </button>
          )}
        </div>
        {past.length === 0 ? (
          <div className="rail-empty small">
            {q
              ? "No recent conversations match."
              : "Nothing yet. Ask for something below — the agent works in this window, on your tabs."}
          </div>
        ) : past.length > 30 ? (
          <VirtualList
            items={past}
            rowHeight={56}
            className="run-list virtual"
            keyOf={(runId) => runId}
            renderRow={(runId) => <RunRow runId={runId} />}
          />
        ) : (
          <div className="run-list">
            {past.map((runId) => (
              <RunRow key={runId} runId={runId} />
            ))}
          </div>
        )}
        <button
          {...smallGhostButtonProps}
          onClick={() => {
            useStore.getState().openConversation(null);
            useStore.setState({ conversationId: "history" });
          }}
        >
          Browse all conversations
        </button>
      </section>
    </div>
  );
}
