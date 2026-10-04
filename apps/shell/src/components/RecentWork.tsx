import { smallGhostButtonProps } from "../ui/button-props";
import { bridge } from "../bridge";
import { useEffect, useState } from "react";
import type { ConversationArtifact, ConversationSummary, Routine } from "@aux/contracts";
import { call, errToast, useStore } from "../store";
import { ConversationDrafts } from "./ConversationDrafts";
import { mergeHistory } from "../run-history";
import { RecentConversationCard } from "./RecentWorkCard";
import { openSavedTask } from "../task-navigation";
import { shellIconRight } from "./icons";
import { RecentWorkEmpty } from "./RecentWorkEmpty";
import { Tabs } from "../ui";

/** Home previews use durable chat titles and results, never invented activity. */
export function RecentWork() {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [results,setResults]=useState<Record<string,ConversationArtifact>>({});
  const [routineResult, setRoutineResult] = useState<{ workspaceId?: string; items: Routine[] }>({ items: [] });
  const [tab, setTab] = useState<"chats" | "routines">("chats");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const workspaceId = useStore(state => state.layout.spaces.find(space => space.id === state.layout.activeSpaceId)?.workspaceId);
  const routines = routineResult.workspaceId === workspaceId ? routineResult.items : [];
  useEffect(() => {
    const update = () => setRefresh(value => value + 1);
    window.addEventListener("focus", update);
    const off=bridge.onEvent(event=>{if(event.type==="conversation.changed"||event.type==="conversation.deleted"||event.type==="conversation.context.changed")update();});
    return () => {window.removeEventListener("focus", update);off();};
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true); setError("");
    const fetch = tab === "chats"
      ? call("conversations.list", {limit: 3, archived: false})
        .then(async found => {
          if (!live) return;
          mergeHistory(found.map(item => item.latestRun)); setItems(found);
          const next:Record<string,ConversationArtifact>={};
          // Read summaries for only the three visible cards; never fetch artifact bytes here.
          await Promise.all(found.slice(0,3).map(async item=>{
            try { const {artifacts}=await call("conversations.artifacts.get",{chatId:item.chatId});
              const result=artifacts.filter(artifact=>artifact.runId===item.latestRun.runId).sort((a,b)=>b.createdAt-a.createdAt)[0];
              if(result)next[item.chatId]=result;
            } catch { /* The conversation preview remains available if its artifact summary fails. */ }
          }));
          if(live)setResults(next);
        })
      : (workspaceId ? call("routines.list", {workspaceId, includeArchived: false}) : Promise.resolve([]))
        .then(found => { if (live) setRoutineResult({ workspaceId, items: found }); });
    void fetch
      .catch(reason => { if (live) setError(String(reason)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [refresh, tab, workspaceId]);
  const count = tab === "chats" ? items.length : routines.length;
  return <section className="home-history" aria-label="Recent work">
    <header className="home-section-head">
      <Tabs<"chats" | "routines"> label="Recent work view" value={tab} onChange={setTab} panelId="recent-work-panel" className="history-segment"
        items={[{ value: "chats", label: "Chats" }, { value: "routines", label: "Routines" }]} />
      <button className="home-all" onClick={() => {
        if (tab === "routines") useStore.getState().setOverlay("tasks");
        else { useStore.getState().openConversation(null); useStore.setState({conversationId: "history"}); }
      }}>{tab === "chats" ? "All Chats" : "Manage routines"}{shellIconRight}</button>
    </header>
    <div id="recent-work-panel" role="tabpanel" aria-labelledby={`recent-work-panel-${tab}`} className="home-cards" aria-busy={loading}>
      {tab === "chats" ? items.map(item => <RecentConversationCard key={item.chatId} item={item} artifact={results[item.chatId]} />) : routines.slice(0, 3).map(item => <article className="home-card" key={item.routineId}>
        <div className="home-card-meta"><span>{item.paused ? "Paused" : item.trigger.kind === "manual" ? "On demand" : "Scheduled"}</span></div>
        <h3><button className="home-card-open" onClick={() => item.sourceTaskId ? void openSavedTask(item.sourceTaskId).catch(errToast) : useStore.getState().setOverlay("tasks")}>{item.title}</button></h3>
        <p className="home-excerpt">{item.objective}</p>
      </article>)}
      {!loading && !error && !count && <RecentWorkEmpty view={tab} onCreateTask={() => useStore.getState().setOverlay("tasks")} />}
    </div>
    {tab === "chats" && <ConversationDrafts limit={3} compact exclude={items.map(item => item.chatId)} />}
    {loading && !count && <output className="hint" data-block>Loading recent work…</output>}
    {error && <p className="field-error" role="alert">Recent work couldn’t be loaded. <button {...smallGhostButtonProps} title={error} onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
  </section>;
}
