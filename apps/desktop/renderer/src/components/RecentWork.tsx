import { bridge } from "../bridge";
import { useEffect, useState } from "react";
import type { ConversationSummary } from "@vector/contracts";
import { call, useStore } from "../store";
import { ConversationDrafts } from "./ConversationDrafts";
import { mergeHistory } from "./ConversationHistory";
import { draftKey } from "../conversation-drafts";

/** Fetch durable chat titles and archive state only when Recent is opened. */
export function RecentWork() {
  const [items, setItems] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const drafts = useStore(state => state.conversationDrafts);
  useEffect(() => {
    const update = () => setRefresh(value => value + 1);
    window.addEventListener("focus", update);
    const off=bridge.onEvent(event=>{if(event.type==="conversation.changed"||event.type==="conversation.deleted")update();});
    return () => {window.removeEventListener("focus", update);off();};
  }, []);
  useEffect(() => {
    let live = true;
    setLoading(true); setError("");
    void call<ConversationSummary[]>("conversations.list", {limit: 3, archived: false})
      .then(found => { if (live) { mergeHistory(found.map(item => item.latestRun)); setItems(found); } })
      .catch(reason => { if (live) setError(String(reason)); })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [refresh]);
  return <section className="home-recent" aria-label="Recent work">
    {items.map(item => <button key={item.chatId} onClick={() => useStore.getState().openConversation(item.latestRun.runId)}><span>{item.title}{drafts[draftKey(item.chatId)]?.trim() && <small>Draft</small>}</span><time dateTime={new Date(item.updatedAt).toISOString()}>{new Date(item.updatedAt).toLocaleDateString(undefined, {month:"short",day:"numeric"})}</time></button>)}
    <ConversationDrafts limit={3} compact exclude={items.map(item => item.chatId)} />
    {loading && !items.length && <p className="hint" role="status">Loading recent work…</p>}
    {!loading && !error && !items.length && <p className="hint">Your recent conversations will appear here.</p>}
    {error && <p className="field-error" role="alert">Recent work couldn’t be loaded. <button className="btn sm ghost" title={error} onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
  </section>;
}
