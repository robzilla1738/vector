import { smallGhostButtonProps } from "../ui/button-props";
import { recentConversations } from "../conversations";
import { memo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { isLive, useStore } from "../store";
import { ChatList, type LocalChatListRow } from "./ChatList";
import { shellIconClose, shellIconLayersSm, shellIconSearch } from "../ui/icons";
import {
  staticNumericCountProps as auxClassNumericCountProps,
  staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps,
} from "../ui/class-props";

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

  const project = (ids: string[]): LocalChatListRow[] =>
    ids.flatMap((runId) => {
      const run = useStore.getState().runs.find((item) => item.runId === runId);
      return run ? [{ entry: { kind: "local-run", run } }] : [];
    });

  return (
    <div className="rail-home">
      {live.length > 0 && (
        <section className="rail-block">
          <div className="rail-label">
            <span>Live</span>
            <span {...auxClassNumericCountProps}>{live.length}</span>
          </div>
          <ChatList rows={project(live)} />
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
        <div className="rail-search" data-input-surface>
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
        ) : (
          <ChatList rows={project(past)} className="run-list" windowed={past.length > 30} rowHeight={56} />
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
