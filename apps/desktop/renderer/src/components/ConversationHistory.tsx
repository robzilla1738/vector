import { useEffect, useRef, useState } from "react";
import type { ConversationSummary, Run } from "@vector/contracts";
import { openSavedTask } from "../task-navigation";
import { call, errToast, useStore } from "../store";
import { I } from "./icons";

export function mergeHistory(history: Run[]) {
  useStore.setState(state => ({ runs: [...state.runs, ...history.filter(run => !state.runs.some(old => old.runId === run.runId))] }));
}
export function cursor(run: Run) { return { createdAt: run.createdAt, runId: run.runId }; }
export function conversationCursor(item: ConversationSummary) { return { updatedAt: item.updatedAt, chatId: item.chatId }; }
const PAGE_SIZE = 40;

export function ConversationHistory() {
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  const load = async (append: boolean) => {
    const version = ++request.current;
    setLoading(true); setError("");
    try {
      const found = await call<ConversationSummary[]>("conversations.list", { limit: PAGE_SIZE, archived, query, ...(append && rows.length ? { before: conversationCursor(rows[rows.length - 1]!) } : {}) });
      if (version !== request.current) return;
      mergeHistory(found.map(item => item.latestRun));
      setRows(old => append ? [...old, ...found.filter(item => !old.some(row => row.chatId === item.chatId))] : found);
      setMore(found.length === PAGE_SIZE);
    } catch (error) { if (version === request.current) setError(String(error)); }
    finally { if (version === request.current) setLoading(false); }
  };
  useEffect(() => {
    ++request.current; setRows([]); setMore(false); setLoading(true); setError("");
    const timer = setTimeout(() => void load(false), 180);
    return () => { clearTimeout(timer); ++request.current; };
  }, [query, archived]);
  const mutate = async (action: "rename" | "archive" | "delete", item: ConversationSummary) => {
    setSaving(true); setError("");
    try {
      if (action === "rename") {
        const changed = await call<ConversationSummary>("conversations.rename", { chatId: item.chatId, title });
        setRows(old => old.map(row => row.chatId === item.chatId ? changed : row));
        setRenaming(null);
      } else if (action === "archive") {
        const changed = await call<ConversationSummary>("conversations.archive", { chatId: item.chatId, archived: !item.archived });
        useStore.setState(state => ({ runs: changed.archived
          ? state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId)
          : state.runs.some(run => run.runId === changed.latestRun.runId) ? state.runs : [changed.latestRun, ...state.runs] }));
        setRows(old => old.filter(row => row.chatId !== item.chatId));
      } else {
        await call("conversations.delete", { chatId: item.chatId });
        useStore.getState().setConversationDraft(item.chatId, "");
        useStore.getState().setConversationContext(item.chatId, "");
        useStore.setState(state => ({ runs: state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId) }));
        setRows(old => old.filter(row => row.chatId !== item.chatId));
        setDeleting(null);
      }
      setMenu(null);
    } catch (error) { setError(error instanceof Error ? error.message : String(error)); }
    finally { setSaving(false); }
  };
  return <section className="conversation conversation-history" aria-label="Conversation history">
    <header className="conversation-head"><h1>Chats</h1><div className="sp"/><div className="history-segment" aria-label="Conversation state"><button className={!archived ? "active" : ""} onClick={() => setArchived(false)}>Active</button><button className={archived ? "active" : ""} onClick={() => setArchived(true)}>Archived</button></div></header>
    <div className="conversation-history-list">
      <input aria-label="Search conversations" placeholder="Search all conversations…" maxLength={500} value={query} onChange={event => setQuery(event.target.value)}/>
      <p className="hint">{archived ? "Archived chats stay available until you delete them." : "Search saved prompts and responses."}</p>
      {rows.map(item => <div className="history-conversation-wrap" key={item.chatId}>
        {renaming === item.chatId ? <form className="history-rename" onSubmit={event => { event.preventDefault(); if (title.trim()) void mutate("rename", item); }}><input autoFocus aria-label="Conversation title" maxLength={160} value={title} onChange={event => setTitle(event.target.value)}/><button className="btn sm" disabled={saving || !title.trim()}>Save</button><button type="button" className="btn sm ghost" onClick={() => setRenaming(null)}>Cancel</button></form> : <>
          <button className="history-conversation" onClick={() => useStore.getState().openConversation(item.latestRun.runId)}><strong>{item.title}</strong><span>{item.taskId ? "Saved task" : item.latestRun.statusMessage ?? item.latestRun.status.replaceAll("_", " ")}</span><time>{new Date(item.updatedAt).toLocaleString()} · {item.turnCount} {item.turnCount === 1 ? "turn" : "turns"}</time></button>
          <button className="icon-btn history-actions" aria-label={`Conversation actions for ${item.title}`} aria-expanded={menu === item.chatId} onClick={() => { setMenu(value => value === item.chatId ? null : item.chatId); setDeleting(null); }}>{I.more}</button>
        </>}
        {menu === item.chatId && <div className="history-menu" role="menu">
          {item.taskId ? <button role="menuitem" onClick={() => void openSavedTask(item.taskId!).catch(errToast)}>{I.layersSm} Open saved task</button> : <>
          <button role="menuitem" onClick={() => { setTitle(item.title); setRenaming(item.chatId); setMenu(null); }}>{I.pencil} Rename</button>
          <button role="menuitem" onClick={() => void mutate("archive", item)}>{item.archived ? I.reopen : I.archive} {item.archived ? "Restore" : "Archive"}</button>
          {deleting === item.chatId ? <div className="history-delete-confirm"><span>Delete permanently?</span><button disabled={saving} onClick={() => void mutate("delete", item)}>Delete</button><button onClick={() => setDeleting(null)}>Cancel</button></div> : <button role="menuitem" className="danger" onClick={() => setDeleting(item.chatId)}>{I.trash} Delete</button>}
          </>}
        </div>}
      </div>)}
      {loading && <p role="status" className="hint">Loading conversations…</p>}
      {!loading && !error && !rows.length && <p className="hint">{query.trim() ? "No conversations match your search." : archived ? "No archived conversations." : "Your conversations will appear here."}</p>}
      {error && <p role="alert">{error} <button className="btn sm" onClick={() => void load(rows.length > 0)}>Try again</button></p>}
      {more && !error && <button className="btn" disabled={loading} onClick={() => void load(true)}>Load more conversations</button>}
    </div>
  </section>;
}
