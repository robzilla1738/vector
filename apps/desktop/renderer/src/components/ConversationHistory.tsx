import { bridge } from "../bridge";
import { moveListFocus } from "../keyboard-list";
import { useEffect, useRef, useState } from "react";
import type { ConversationSummary, Run } from "@aux/contracts";
import { openSavedTask } from "../task-navigation";
import { call, errToast, useStore } from "../store";
import { I } from "./icons";
import { ConversationDrafts } from "./ConversationDrafts";
import { draftKey } from "../conversation-drafts";
import { AnswerMarkdown } from "./AnswerMarkdown";

import { mergeHistory } from "../run-history";
import { useDismissable } from "../use-dismissable";
export { mergeHistory };
export function cursor(run: Run) { return { createdAt: run.createdAt, runId: run.runId }; }
export function conversationCursor(item: ConversationSummary) { return { updatedAt: item.updatedAt, chatId: item.chatId }; }
const PAGE_SIZE = 40;

export function ConversationHistory() {
  const drafts = useStore(state => state.conversationDrafts);
  const space = useStore(state => state.layout.spaces.find(item => item.id === state.layout.activeSpaceId));
  const [currentSpaceOnly, setCurrentSpaceOnly] = useState(false);
  const workspaceId = currentSpaceOnly ? space?.workspaceId : undefined;
  const [query, setQuery] = useState("");
  const [archived, setArchived] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const rowsRef=useRef(rows);rowsRef.current=rows;
  const loadingRequest=useRef(false);
  const search=useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const pending = useRef(false);
  const retryAppend = useRef(false);
  const retryRefresh=useRef(false);
  const list = useRef<HTMLDivElement>(null);
  const view = useRef(`${workspaceId ?? "all"}:${archived}:${query}`);
  view.current = `${workspaceId ?? "all"}:${archived}:${query}`;
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [renaming, setRenaming] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const request = useRef(0);
  const load = async (append: boolean, refresh = false) => {
    if ((pending.current || loadingRequest.current) && !refresh) return;
    loadingRequest.current=true;
    const version = ++request.current;
    retryAppend.current = append;retryRefresh.current=refresh;
    setLoading(true); setError("");
    try {
      const target=refresh ? Math.max(PAGE_SIZE,rowsRef.current.length) : PAGE_SIZE;
      const found:ConversationSummary[]=[];
      let before=append && rowsRef.current.length ? conversationCursor(rowsRef.current[rowsRef.current.length-1]!) : undefined;
      let hasMore=false;
      do {
        const limit=Math.min(200,target-found.length);
        const page=await call<ConversationSummary[]>("conversations.list",{limit,archived,query,workspaceId,...(before ? {before} : {})});
        if(version!==request.current)return;
        found.push(...page);hasMore=page.length===limit;
        if(!hasMore || !page.length)break;
        before=conversationCursor(page[page.length-1]!);
      } while(found.length<target);
      const scroll=list.current;
      const top=scroll?.getBoundingClientRect().top ?? 0;
      const anchor=refresh ? Array.from(scroll?.querySelectorAll<HTMLElement>("[data-chat-id]") ?? []).find(row=>row.getBoundingClientRect().bottom>top) : undefined;
      const anchorId=anchor?.dataset.chatId,anchorTop=anchor?.getBoundingClientRect().top;
      const scrollTop=scroll?.scrollTop;
      mergeHistory(found.map(item => item.latestRun));
      setRows(old => append ? [...old, ...found.filter(item => !old.some(row => row.chatId === item.chatId))] : found);
      setMore(hasMore);
      if(anchorId && anchorTop!==undefined)requestAnimationFrame(()=>{
        if(version!==request.current || !scroll || scroll.scrollTop!==scrollTop)return;
        const replacement=Array.from(scroll.querySelectorAll<HTMLElement>("[data-chat-id]")).find(row=>row.dataset.chatId===anchorId);
        if(replacement)scroll.scrollTop+=replacement.getBoundingClientRect().top-anchorTop;
      });
    } catch (error) { if (version === request.current) setError(String(error)); }
    finally { if (version === request.current) {setLoading(false);loadingRequest.current=false;} }
  };
  useEffect(() => {
    ++request.current; loadingRequest.current=false; setMenu(null); setRenaming(null); setDeleting(null); setActionError(""); setRows([]); setMore(false); setLoading(true); setError("");
    const timer = setTimeout(() => void load(false), 180);
    return () => { clearTimeout(timer); ++request.current; };
  }, [query, archived, workspaceId]);
  useEffect(()=>{
    let timer:ReturnType<typeof setTimeout>|undefined;
    const off=bridge.onEvent(event=>{
      if(event.type!=="conversation.deleted"&&event.type!=="conversation.changed")return;
      if(event.type==="conversation.deleted")setRows(rows=>rows.filter(row=>row.chatId!==event.payload.chatId));
      ++request.current;
      clearTimeout(timer);timer=setTimeout(()=>void load(false,true),100);
    });
    return()=>{off();clearTimeout(timer);};
  },[archived,query,workspaceId]);
  useEffect(() => {
    if (!menu) return;
    const close = (event: PointerEvent) => { if (!(event.target as Element).closest?.(".history-menu, .history-actions")) setMenu(null); };
    list.current?.querySelector<HTMLButtonElement>(".history-menu button")?.focus();
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [menu]);
  useDismissable(!!menu, () => {
    list.current?.querySelector<HTMLButtonElement>('.history-actions[aria-expanded="true"]')?.focus();
    setMenu(null); setDeleting(null);
  });
  const mutate = async (action: "rename" | "archive" | "delete", item: ConversationSummary) => {
    if (pending.current) return;
    pending.current = true;
    const origin = view.current;
    ++request.current; loadingRequest.current=false;
    setLoading(false); setSaving(true); setActionError("");
    try {
      if (action === "rename") {
        const changed = await call<ConversationSummary>("conversations.rename", { chatId: item.chatId, title });
        if (view.current === origin) { setRows(old => old.map(row => row.chatId === item.chatId ? changed : row)); setRenaming(null); }
      } else if (action === "archive") {
        const changed = await call<ConversationSummary>("conversations.archive", { chatId: item.chatId, archived: !item.archived });
        useStore.setState(state => ({ runs: changed.archived
          ? state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId)
          : state.runs.some(run => run.runId === changed.latestRun.runId) ? state.runs : [changed.latestRun, ...state.runs] }));
        if (view.current === origin) setRows(old => old.filter(row => row.chatId !== item.chatId));
      } else {
        await call("conversations.delete", { chatId: item.chatId });
        useStore.getState().setConversationDraft(item.chatId, "");
        useStore.getState().setConversationContext(item.chatId, "");
        useStore.setState(state => ({ runs: state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId) }));
        if (view.current === origin) setRows(old => old.filter(row => row.chatId !== item.chatId));
        setDeleting(null);
      }
      setMenu(null);
    } catch (error) { if (view.current === origin) setActionError(error instanceof Error ? error.message : String(error)); }
    finally { pending.current = false; setSaving(false); }
  };
  return <section className="conversation conversation-history" aria-label="Conversation history">
    <header className="conversation-head"><h1>Chats</h1><div className="sp"/><div className="history-segment" aria-label="Conversation state"><button disabled={saving} aria-pressed={!archived} className={!archived ? "active" : ""} onClick={() => setArchived(false)}>Active</button><button disabled={saving} aria-pressed={archived} className={archived ? "active" : ""} onClick={() => setArchived(true)}>Archived</button></div></header>
    <div className="conversation-history-list" ref={list} onKeyDown={event=>moveListFocus(event,".history-conversation")}>
      <div className="history-toolbar">
      <label className="history-search">{I.search}
      <input ref={search} disabled={saving} onKeyDown={event=>{if(event.nativeEvent.isComposing)return;if(event.key==="ArrowDown"){event.preventDefault();list.current?.querySelector<HTMLButtonElement>(".history-conversation")?.focus();}else if(event.key==="Enter" && !loading && rows[0]){event.preventDefault();useStore.getState().openConversation(rows[0].latestRun.runId);}}} aria-label="Search conversations" placeholder="Search chats…" maxLength={500} value={query} onChange={event => setQuery(event.target.value)}/>
      </label>
      {space?.workspaceId && <div className="history-space-filter" role="group" aria-label="Conversation Space filter">
        <button className="btn sm ghost" disabled={saving} aria-pressed={!currentSpaceOnly} onClick={() => setCurrentSpaceOnly(false)}>All Spaces</button>
        <button className="btn sm ghost" disabled={saving} aria-pressed={currentSpaceOnly} title={space.name} onClick={() => setCurrentSpaceOnly(true)}>{space.name}</button>
      </div>}
      <div className="history-view-tools"><div className="history-segment" role="group" aria-label="Chat layout"><button aria-label="Grid view" aria-pressed={viewMode === "grid"} className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>{I.grid}</button><button aria-label="List view" aria-pressed={viewMode === "list"} className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>{I.result}</button></div></div>
      </div>
      {(archived || workspaceId) && <p className="hint history-scope-note">{archived ? "Archived chats stay available until you delete them." : "Searching this Space. Unsent drafts are available in All Spaces."}</p>}
      {!archived && !workspaceId && <ConversationDrafts query={query} exclude={rows.map(row => row.chatId)} />}
      {actionError && <p className="field-error" role="alert">{actionError} <button className="btn sm ghost" onClick={() => setActionError("")}>Dismiss</button></p>}
      <div className={`history-items ${viewMode}`}>
      {rows.map(item => <div className="history-conversation-wrap" data-chat-id={item.chatId} key={item.chatId}>
        {renaming === item.chatId ? <form className="history-rename" onSubmit={event => { event.preventDefault(); if (title.trim()) void mutate("rename", item); }}><input autoFocus aria-label="Conversation title" maxLength={160} value={title} onChange={event => setTitle(event.target.value)}/><button className="btn sm" disabled={saving || !title.trim()}>Save</button><button type="button" className="btn sm ghost" onClick={() => setRenaming(null)}>Cancel</button></form> : <>
          <button disabled={saving} className="history-conversation" onClick={() => useStore.getState().openConversation(item.latestRun.runId)}><strong>{item.title}</strong><span>{drafts[draftKey(item.chatId)]?.trim() ? `Draft · ${drafts[draftKey(item.chatId)]}` : item.taskId ? "Saved task" : item.latestRun.statusMessage ?? item.latestRun.status.replaceAll("_", " ")}</span><time>{new Date(item.updatedAt).toLocaleString()} · {item.turnCount} {item.turnCount === 1 ? "turn" : "turns"}</time></button>
          {viewMode === "grid" && <div className="history-card-preview home-excerpt" inert><AnswerMarkdown text={drafts[draftKey(item.chatId)]?.trim() || (typeof item.latestRun.result?.answer === "string" ? item.latestRun.result.answer : item.latestRun.statusMessage || item.latestRun.goal)} /></div>}
          <button disabled={saving} className="icon-btn history-actions" aria-label={`Conversation actions for ${item.title}`} aria-expanded={menu === item.chatId} onClick={() => { setMenu(value => value === item.chatId ? null : item.chatId); setDeleting(null); }}>{I.more}</button>
        </>}
        {menu === item.chatId && <div className="history-menu" role="menu" tabIndex={-1} aria-label="Conversation actions" onKeyDown={event => moveListFocus(event, "button")}>
          {item.taskId ? <button role="menuitem" disabled={saving} onClick={() => void openSavedTask(item.taskId!).catch(errToast)}>{I.layersSm} Open saved task</button> : <>
          <button role="menuitem" disabled={saving} onClick={() => { setTitle(item.title); setRenaming(item.chatId); setMenu(null); }}>{I.pencil} Rename</button>
          <button role="menuitem" disabled={saving} onClick={() => void mutate("archive", item)}>{item.archived ? I.reopen : I.archive} {item.archived ? "Restore" : "Archive"}</button>
          {deleting === item.chatId ? <div className="history-delete-confirm"><span>Delete permanently?</span><button disabled={saving} onClick={() => void mutate("delete", item)}>Delete</button><button onClick={() => setDeleting(null)}>Cancel</button></div> : <button role="menuitem" disabled={saving} className="danger" onClick={() => setDeleting(item.chatId)}>{I.trash} Delete</button>}
          </>}
        </div>}
      </div>)}
      </div>
      {loading && <p role="status" className="hint">Loading conversations…</p>}
      {!loading && !error && !rows.length && <p className="hint">{query.trim() ? "No conversations match your search." : archived ? "No archived conversations." : workspaceId ? "No saved conversations in this Space yet." : "Your conversations will appear here."}</p>}
      {error && <p role="alert">{error} <button className="btn sm" onClick={() => void load(retryAppend.current,retryRefresh.current)}>Try again</button></p>}
      {more && !error && <button className="btn" disabled={loading} onClick={() => void load(true)}>Load more conversations</button>}
    </div>
  </section>;
}
