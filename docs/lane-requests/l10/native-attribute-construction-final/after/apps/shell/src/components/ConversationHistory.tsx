import {
  staticFieldErrorProps as auxReserveStaticFieldErrorProps,
  staticHintProps as auxReserveStaticHintProps,
} from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { bridge } from "../bridge";
import { moveListFocus } from "../keyboard-list";
import { useEffect, useRef, useState } from "react";
import type { ConversationSummary, Run } from "@aux/contracts";
import { openSavedTask } from "../task-navigation";
import { call, errToast, useStore } from "../store";
import { shellIconArchive, shellIconGrid, shellIconLayersSm, shellIconMore, shellIconPencil, shellIconReopen, shellIconResult, shellIconSearch, shellIconTrash } from "./icons";
import { ConversationDrafts } from "./ConversationDrafts";
import { draftKey } from "../conversation-drafts";
import { AnswerMarkdown } from "./AnswerMarkdown";

import { mergeHistory } from "../run-history";
import { SkeletonRows } from "./Skeleton";
import { Tabs } from "../ui";
import { Menu } from "../ui/dialog";
import {
  nativeButtonTypeProps as auxNativeButtonTypeProps,
} from "../ui/native-attribute-props";
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
  const firstConversation = useRef<HTMLButtonElement>(null);
  const view = useRef(`${workspaceId ?? "all"}:${archived}:${query}`);
  view.current = `${workspaceId ?? "all"}:${archived}:${query}`;
  const [more, setMore] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const menuAnchor = useRef<HTMLButtonElement>(null);
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
        const page=await call("conversations.list",{limit,archived,query,workspaceId,...(before ? {before} : {})});
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
  const closeMenu = () => { setMenu(null); setDeleting(null); };
  const mutate = async (action: "rename" | "archive" | "delete", item: ConversationSummary) => {
    if (pending.current) return;
    pending.current = true;
    const origin = view.current;
    ++request.current; loadingRequest.current=false;
    setLoading(false); setSaving(true); setActionError("");
    try {
      if (action === "rename") {
        const changed = await call("conversations.rename", { chatId: item.chatId, title });
        if (view.current === origin) { setRows(old => old.map(row => row.chatId === item.chatId ? changed : row)); setRenaming(null); }
      } else if (action === "archive") {
        const changed = await call("conversations.archive", { chatId: item.chatId, archived: !item.archived });
        useStore.setState(state => ({ runs: changed.archived
          ? state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId)
          : state.runs.some(run => run.runId === changed.latestRun.runId) ? state.runs : [changed.latestRun, ...state.runs] }));
        if (view.current === origin) setRows(old => old.filter(row => row.chatId !== item.chatId));
      } else {
        await call("conversations.delete", { chatId: item.chatId });
        useStore.getState().setConversationDraft(item.chatId, "");
        useStore.getState().setConversationContext(item.chatId, "");
        useStore.getState().setConversationBrowserSources(item.chatId, []);
        try { localStorage.removeItem(`aux.pending-queue-message.v1:${item.chatId}`); } catch { /* Storage is optional. */ }
        useStore.setState(state => ({ runs: state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId) }));
        if (view.current === origin) setRows(old => old.filter(row => row.chatId !== item.chatId));
        setDeleting(null);
      }
      setMenu(null);
    } catch (error) { if (view.current === origin) setActionError(errorMessage(error)); }
    finally { pending.current = false; setSaving(false); }
  };
  return <section className="conversation conversation-history" aria-label="Conversation history">
    <header className="conversation-head"><h1>Chats</h1><div className="sp"/><Tabs<"active" | "archived"> label="Conversation state" value={archived ? "archived" : "active"} onChange={value => setArchived(value === "archived")}
      panelId="conversation-history-panel" className="history-segment" items={[{ value: "active", label: "Active", disabled: saving }, { value: "archived", label: "Archived", disabled: saving }]} /></header>
    <div id="conversation-history-panel" role="tabpanel" aria-labelledby={`conversation-history-panel-${archived ? "archived" : "active"}`} className="conversation-history-list" ref={list} onKeyDown={event=>moveListFocus(event,".history-conversation")}>
      <div className="history-toolbar">
      <label className="history-search">{shellIconSearch}
      <input ref={search} disabled={saving} onKeyDown={event=>{if(event.nativeEvent.isComposing)return;if(event.key==="ArrowDown"){event.preventDefault();firstConversation.current?.focus();}else if(event.key==="Enter" && !loading && rows[0]){event.preventDefault();useStore.getState().openConversation(rows[0].latestRun.runId);}}} aria-label="Search conversations" placeholder="Search chats…" maxLength={500} value={query} onChange={event => setQuery(event.target.value)}/>
      </label>
      {space?.workspaceId && <div className="history-space-filter" role="group" aria-label="Conversation Space filter">
        <button {...smallGhostButtonProps} disabled={saving} aria-pressed={!currentSpaceOnly} onClick={() => setCurrentSpaceOnly(false)}>All Spaces</button>
        <button {...smallGhostButtonProps} disabled={saving} aria-pressed={currentSpaceOnly} title={space.name} onClick={() => setCurrentSpaceOnly(true)}>{space.name}</button>
      </div>}
      <div className="history-view-tools"><Tabs<"grid" | "list"> label="Chat layout" value={viewMode} onChange={setViewMode} panelId="conversation-layout-panel" className="history-segment"
        items={[{ value: "grid", label: shellIconGrid, ariaLabel: "Grid view" }, { value: "list", label: shellIconResult, ariaLabel: "List view" }]} /></div>
      </div>
      {(archived || workspaceId) && <p className="hint history-scope-note">{archived ? "Archived chats stay available until you delete them." : "Searching this Space. Unsent drafts are available in All Spaces."}</p>}
      {!archived && !workspaceId && <ConversationDrafts query={query} exclude={rows.map(row => row.chatId)} />}
      {actionError && <p {...auxReserveStaticFieldErrorProps} role="alert">{actionError} <button {...smallGhostButtonProps} onClick={() => setActionError("")}>Dismiss</button></p>}
      <div id="conversation-layout-panel" role="tabpanel" aria-labelledby={`conversation-layout-panel-${viewMode}`} className={`history-items ${viewMode}`}>
      {rows.map((item, index) => <div className="history-conversation-wrap" data-chat-id={item.chatId} key={item.chatId}>
        {renaming === item.chatId ? <form className="history-rename" onSubmit={event => { event.preventDefault(); if (title.trim()) void mutate("rename", item); }}><input autoFocus aria-label="Conversation title" maxLength={160} value={title} onChange={event => setTitle(event.target.value)}/><button {...smallButtonProps} disabled={saving || !title.trim()}>Save</button><button {...auxNativeButtonTypeProps} {...smallGhostButtonProps} onClick={() => setRenaming(null)}>Cancel</button></form> : <>
          <button ref={index === 0 ? firstConversation : undefined} disabled={saving} className="history-conversation" onClick={() => useStore.getState().openConversation(item.latestRun.runId)}><strong>{item.title}</strong><span>{drafts[draftKey(item.chatId)]?.trim() ? `Draft · ${drafts[draftKey(item.chatId)]}` : item.taskId ? "Saved task" : item.latestRun.statusMessage ?? item.latestRun.status.replaceAll("_", " ")}</span><time>{new Date(item.updatedAt).toLocaleString()} · {item.turnCount} {item.turnCount === 1 ? "turn" : "turns"}</time></button>
          {viewMode === "grid" && <div className="history-card-preview home-excerpt" inert><AnswerMarkdown text={drafts[draftKey(item.chatId)]?.trim() || (typeof item.latestRun.result?.answer === "string" ? item.latestRun.result.answer : item.latestRun.statusMessage || item.latestRun.goal)} /></div>}
          <button disabled={saving} className="icon-btn history-actions" aria-label={`Conversation actions for ${item.title}`} aria-haspopup="menu" aria-expanded={menu === item.chatId} onClick={event => { menuAnchor.current = event.currentTarget; setMenu(value => value === item.chatId ? null : item.chatId); setDeleting(null); }}>{shellIconMore}</button>
        </>}
        {menu === item.chatId && <Menu className="history-menu" label="Conversation actions" anchor={menuAnchor} returnFocus={menuAnchor} onClose={closeMenu} onMenuKeyDown={event => event.stopPropagation()}>
          {item.taskId ? <button role="menuitem" disabled={saving} onClick={() => void openSavedTask(item.taskId!).catch(errToast)}>{shellIconLayersSm} Open saved task</button> : <>
          <button role="menuitem" disabled={saving} onClick={() => { setTitle(item.title); setRenaming(item.chatId); setMenu(null); }}>{shellIconPencil} Rename</button>
          <button role="menuitem" disabled={saving} onClick={() => void mutate("archive", item)}>{item.archived ? shellIconReopen : shellIconArchive} {item.archived ? "Restore" : "Archive"}</button>
          {deleting === item.chatId ? <div className="history-delete-confirm" role="group" aria-label="Confirm conversation deletion"><span>Delete permanently?</span><button role="menuitem" disabled={saving} onClick={() => void mutate("delete", item)}>Delete</button><button role="menuitem" onClick={() => setDeleting(null)}>Cancel</button></div> : <button role="menuitem" disabled={saving} className="danger" onClick={() => setDeleting(item.chatId)}>{shellIconTrash} Delete</button>}
          </>}
        </Menu>}
      </div>)}
      </div>
      {loading && (rows.length ? <output data-block {...auxReserveStaticHintProps}>Loading conversations…</output> : <SkeletonRows label="Loading conversations…" rows={5} tall />)}
      {!loading && !error && !rows.length && <p {...auxReserveStaticHintProps}>{query.trim() ? "No conversations match your search." : archived ? "No archived conversations." : workspaceId ? "No saved conversations in this Space yet." : "Your conversations will appear here."}</p>}
      {error && <p role="alert">{error} <button {...smallButtonProps} onClick={() => void load(retryAppend.current,retryRefresh.current)}>Try again</button></p>}
      {more && !error && <button className="btn" disabled={loading} onClick={() => void load(true)}>Load more conversations</button>}
    </div>
  </section>;
}
