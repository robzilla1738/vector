import { bridge } from "../bridge";
import { useEffect, useState } from "react";
import type { ConversationSummary, Routine } from "@aux/contracts";
import { call, errToast, useStore } from "../store";
import { ConversationDrafts } from "./ConversationDrafts";
import { mergeHistory } from "../run-history";
import { draftKey } from "../conversation-drafts";
import { AnswerPreview } from "./surfaces";
import { openSavedTask } from "../task-navigation";
import { STATUS_LABEL } from "../run-status";
import { I } from "./icons";

function previewText(item: ConversationSummary, draft?: string) {
  if (draft?.trim()) return draft.trim();
  const run = item.latestRun;
  if (typeof run.result?.answer === "string" && run.result.answer.trim()) return run.result.answer;
  if (run.status === "failed") return "This chat couldn’t finish. Open it to review or retry.";
  if (run.status === "cancelled") return "This chat was cancelled.";
  if (run.status === "interrupted") return "This chat was interrupted. Open it to continue.";
  return run.statusMessage || run.goal;
}

/** Home previews use durable chat titles and results, never invented activity. */
export function RecentWork() {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [tab, setTab] = useState<"chats" | "routines">("chats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const drafts = useStore(state => state.conversationDrafts);
  const layout = useStore(state => state.layout);
  const workspaceId = layout.spaces.find(space => space.id === layout.activeSpaceId)?.workspaceId;
  useEffect(() => {
    const update = () => setRefresh(value => value + 1);
    window.addEventListener("focus", update);
    const off=bridge.onEvent(event=>{if(event.type==="conversation.changed"||event.type==="conversation.deleted")update();});
    return () => {window.removeEventListener("focus", update);off();};
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true); setError("");
    const fetch = tab === "chats"
      ? call("conversations.list", {limit: 3, archived: false})
        .then(found => { if (live) { mergeHistory(found.map(item => item.latestRun)); setItems(found); } })
      : (workspaceId ? call("routines.list", {workspaceId, includeArchived: false}) : Promise.resolve([]))
        .then(found => { if (live) setRoutines(found); });
    void fetch
      .catch(reason => { if (live) setError(String(reason)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [refresh, tab, workspaceId]);
  const count = tab === "chats" ? items.length : routines.length;
  return <section className="home-history" aria-label="Recent work">
    <header className="home-section-head">
      <div className="history-segment" role="group" aria-label="Recent work view" onKeyDown={event => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "chats" : event.key === "End" ? "routines" : tab === "chats" ? "routines" : "chats";
        setTab(next);
        event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[next === "chats" ? 0 : 1]?.focus();
      }}>
        <button className={tab === "chats" ? "active" : ""} aria-pressed={tab === "chats"} onClick={() => setTab("chats")}>Chats</button>
        <button className={tab === "routines" ? "active" : ""} aria-pressed={tab === "routines"} onClick={() => setTab("routines")}>Routines</button>
      </div>
      <button className="home-all" onClick={() => {
        if (tab === "routines") useStore.getState().setOverlay("tasks");
        else { useStore.getState().openConversation(null); useStore.setState({conversationId: "history"}); }
      }}>{tab === "chats" ? "All Chats" : "Manage routines"}{I.right}</button>
    </header>
    <div className="home-cards" aria-busy={loading}>
      {tab === "chats" ? items.map(item => <article className="home-card" key={item.chatId}>
        <div className="home-card-meta"><time dateTime={new Date(item.updatedAt).toISOString()}>{new Date(item.updatedAt).toLocaleDateString(undefined, {month: "short", day: "numeric"})}</time><span>{drafts[draftKey(item.chatId)]?.trim() ? "Draft" : STATUS_LABEL[item.latestRun.status]}</span></div>
        <h3><button className="home-card-open" onClick={() => useStore.getState().openConversation(item.latestRun.runId)}>{item.title}</button></h3>
        <div className="home-excerpt" inert><AnswerPreview text={previewText(item, drafts[draftKey(item.chatId)])}/></div>
      </article>) : routines.slice(0, 3).map(item => <article className="home-card" key={item.routineId}>
        <div className="home-card-meta"><span>{item.paused ? "Paused" : item.trigger.kind === "manual" ? "On demand" : "Scheduled"}</span></div>
        <h3><button className="home-card-open" onClick={() => item.sourceTaskId ? void openSavedTask(item.sourceTaskId).catch(errToast) : useStore.getState().setOverlay("tasks")}>{item.title}</button></h3>
        <p className="home-excerpt">{item.objective}</p>
      </article>)}
      {!loading && !error && !count && <div className="home-empty"><p>{tab === "chats" ? "Your conversations will appear here." : "Your saved routines will appear here."}</p><button className="btn ghost" onClick={() => tab === "chats" ? useStore.getState().openConversation(null) : useStore.getState().setOverlay("tasks")}>{I.plusSm}{tab === "chats" ? "New chat" : "Create a task"}</button></div>}
    </div>
    {tab === "chats" && <ConversationDrafts limit={3} compact exclude={items.map(item => item.chatId)} />}
    {loading && !count && <output className="hint" data-block>Loading recent work…</output>}
    {error && <p className="field-error" role="alert">Recent work couldn’t be loaded. <button className="btn sm ghost" title={error} onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
  </section>;
}
