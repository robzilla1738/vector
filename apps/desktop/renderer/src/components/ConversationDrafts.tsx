import { useEffect, useState } from "react";
import type { PreparedConversation } from "@vector/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";
import { conversationDraftEntries } from "../conversation-drafts";
import { I } from "./icons";

export function ConversationDrafts({ query = "", limit, compact = false, exclude = [] }: { query?: string; limit?: number; compact?: boolean; exclude?: string[] }) {
  const drafts = useStore(state => state.conversationDrafts);
  const runs = useStore(state => state.runs);
  const [discarded, setDiscarded] = useState<{ id: string | null; text: string } | null>(null);
  const [prepared, setPrepared] = useState<PreparedConversation[]>([]);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => { clearTimeout(timer); timer = setTimeout(() => setRefresh(value => value + 1), 100); };
    window.addEventListener("focus", update);
    const off = bridge.onEvent(event => {
      if (["conversation.context.changed", "conversation.deleted", "run.updated"].includes(event.type)) update();
    });
    return () => { off(); clearTimeout(timer); window.removeEventListener("focus", update); };
  }, []);
  useEffect(() => {
    let live = true;
    setError("");
    void call<PreparedConversation[]>("conversations.prepared", {})
      .then(items => { if (live) setPrepared(items); })
      .catch(() => { if (live) setError("Saved attachment drafts couldn’t be loaded."); });
    return () => { live = false; };
  }, [refresh]);
  const entries = conversationDraftEntries(drafts, runs, prepared).filter(item => !exclude.includes(item.id ?? "") && `${item.title} ${item.text}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  const shown = limit ? entries.slice(0, limit) : entries;
  if (!shown.length && !discarded && !error) return null;
  const setDraft = (id: string | null, text: string) => id ? useStore.getState().setConversationDraft(id, text) : useStore.getState().setAgentDraft(text);
  return <section className={`conversation-drafts${compact ? " compact-drafts" : ""}`} aria-label="Unsent drafts">
    <div className="drafts-heading"><h2>Unsent drafts <span className="hint">{entries.length}</span></h2><span className="hint">Saved on this Mac</span></div>
    {error && <p className="field-error" role="alert">{error} <button className="btn sm ghost" onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
    {shown.map(item => <div className="draft-row" key={item.key}>
      <button className="draft-open" onClick={() => useStore.getState().openConversationDraft(item.id)}><strong>{item.title}</strong><span>{compact && item.text.trimStart().startsWith(item.title) ? item.text.trimStart().slice(item.title.length).trim() || "Continue editing" : item.text || `${item.count} saved ${item.count === 1 ? "attachment" : "attachments"} · Add a message to continue`}</span>{!compact && <small>Continue editing {I.right}</small>}</button>
      {!!item.text.trim() && <button className="icon-btn sm" aria-label={`Discard draft text: ${item.title}`} title="Discard draft text" onClick={() => { setDraft(item.id, ""); setDiscarded({ id: item.id, text: item.text }); }}>{I.close}</button>}
    </div>)}
    {limit && entries.length > limit && <button className="btn sm ghost" onClick={() => { useStore.getState().openConversation(null); useStore.setState({ conversationId: "history" }); }}>View all {entries.length} drafts</button>}
    {discarded && <div className="draft-undo" role="status"><span>Draft text discarded. Saved messages and attachments are kept.</span><button className="btn sm" onClick={() => {
      const state = useStore.getState();
      const current = discarded.id ? state.conversationDrafts[`chat:${discarded.id}`] : state.agentDraft;
      setDraft(discarded.id, current ? `${current}\n\n${discarded.text}` : discarded.text); setDiscarded(null);
    }}>Undo</button></div>}
  </section>;
}
