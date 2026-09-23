import { useEffect, useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { readChatFolders, writeChatFolder, removeChatFolder, moveChatToFolder, type ChatFolder } from "../chat-folders";
import { I } from "./icons";

/** Shared session organization for both sidebar layouts. Folder entries belong to this browser profile. */
export function ChatSessions() {
  const active = useStore(s => s.mode === "conversation" ? s.conversationId : null);
  const runs = useStore(s => s.runs);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const [archived, setArchived] = useState(false);
  const [organization, setOrganization] = useState(() => readChatFolders(localStorage));
  const [editing, setEditing] = useState<ChatFolder | null>(null);
  const [name, setName] = useState("");
  const [moving, setMoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => { if (moving) root.current?.querySelector<HTMLSelectElement>(".session-disclosure.open select")?.focus(); }, [moving]);
  function dismiss(element: HTMLElement) {
    element.closest(".session-item")?.querySelector<HTMLButtonElement>(".session-actions [aria-expanded=true]")?.focus();
    setMoving(null); setDeleting(null);
  }
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const refresh = () => setOrganization(readChatFolders(localStorage));
    window.addEventListener("storage", refresh);
    window.addEventListener("aux-chat-folders", refresh);
    return () => { window.removeEventListener("storage", refresh); window.removeEventListener("aux-chat-folders", refresh); };
  }, []);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "conversation.changed" || event.type === "conversation.deleted") setRevision(value => value + 1);
  }), []);
  useEffect(() => {
    let live = true;
    setLoading(true);
    const timer = setTimeout(() => void (async () => {
      try {
        const found: ConversationSummary[] = [];
        let before: { updatedAt: number; chatId: string } | undefined;
        for (;;) {
          const next = await call("conversations.list", { archived, limit: 200, ...(before ? { before } : {}) });
          if (!live) return;
          found.push(...next);
          if (next.length < 200) break;
          const last = next[next.length - 1]!;
          before = { updatedAt: last.updatedAt, chatId: last.chatId };
        }
        setRows(found); setError("");
      } catch (reason) { if (live) setError(reason instanceof Error ? reason.message : String(reason)); }
      finally { if (live) setLoading(false); }
    })(), 100);
    return () => { live = false; clearTimeout(timer); };
  }, [archived, runs, revision]);
  function organize(work: () => void) {
    try { work(); window.dispatchEvent(new Event("aux-chat-folders")); } catch (reason) { errToast(reason); }
  }
  async function mutate(item: ConversationSummary, remove: boolean) {
    if (pending.current) return;
    pending.current = true; setBusy(true);
    try {
      if (remove) {
        await call("conversations.delete", { chatId: item.chatId });
        organize(() => moveChatToFolder(localStorage, item.chatId, ""));
      } else await call("conversations.archive", { chatId: item.chatId, archived: !archived });
      useStore.setState(state => ({ runs: [...(!remove && archived ? [item.latestRun] : []), ...state.runs.filter(run => (run.config?.chatId ?? run.runId) !== item.chatId)] }));
      setRows(items => items.filter(row => row.chatId !== item.chatId)); setDeleting(null); setMoving(null);
    } catch (reason) { errToast(reason); }
    finally { pending.current = false; setBusy(false); }
  }
  function edit(folder?: ChatFolder) { setEditing(folder ?? { id: crypto.randomUUID(), name: "", collapsed: false }); setName(folder?.name ?? ""); }
  const renderChat = (item: ConversationSummary) => <div className={`session-item${active === item.chatId ? " active" : ""}`} key={item.chatId} onKeyDown={event => { if (event.key === "Escape" && (moving === item.chatId || deleting === item.chatId)) { event.preventDefault(); event.stopPropagation(); dismiss(event.currentTarget); } }}>
    <div className={`session-row${active === item.chatId ? " active" : ""}`}>
      <button className="session-open" aria-current={active === item.chatId ? "page" : undefined} title={item.title} onClick={() => useStore.getState().openConversation(item.latestRun.runId)}>{item.title || "New chat"}</button>
      <div className="session-actions">
        <button className="icon-btn" aria-label={`Move ${item.title} to project`} title="Move to project" aria-expanded={moving === item.chatId} onClick={() => { setMoving(moving === item.chatId ? null : item.chatId); setDeleting(null); }}>{I.folder}</button>
        <button className="icon-btn" disabled={busy} aria-label={`${archived ? "Restore" : "Archive"} ${item.title}`} title={archived ? "Restore chat" : "Archive chat"} onClick={() => void mutate(item, false)}>{I.archive}</button>
        <button className="icon-btn" disabled={busy} aria-label={`Delete ${item.title}`} title="Delete chat" aria-expanded={deleting === item.chatId} onClick={() => { setDeleting(deleting === item.chatId ? null : item.chatId); setMoving(null); }}>{I.trash}</button>
      </div>
    </div>
    <div className={`session-disclosure${moving === item.chatId ? " open" : ""}`} aria-hidden={moving !== item.chatId} inert={moving !== item.chatId}><div><label className="session-move">Project<select aria-label={`Project for ${item.title}`} value={organization.members[item.chatId] && organization.folders.some(f => f.id === organization.members[item.chatId]) ? organization.members[item.chatId] : ""} onChange={event => { organize(() => moveChatToFolder(localStorage, item.chatId, event.target.value)); setMoving(null); }}><option value="">No project</option>{organization.folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label></div></div>
    <div className={`session-disclosure${deleting === item.chatId ? " open" : ""}`} aria-hidden={deleting !== item.chatId} inert={deleting !== item.chatId}><div><div className="session-confirm" role="group" aria-label={`Delete ${item.title} permanently?`}><span>Delete this chat permanently?</span><button className="btn ghost danger" disabled={busy} onClick={() => void mutate(item, true)}>Delete permanently</button><button className="btn ghost" onClick={event => dismiss(event.currentTarget)}>Cancel</button></div></div></div>
  </div>;
  return <div ref={root} className="chat-sessions" aria-busy={loading}>
    <div className="session-heading"><span>Projects</span><button className="icon-btn" aria-label="New chat project" title="New project" onClick={() => edit()}>{I.plusSm}</button></div>
    {editing && <form className="session-editor" onSubmit={event => { event.preventDefault(); if (!name.trim()) return; organize(() => writeChatFolder(localStorage, { ...editing, name: name.trim() })); setEditing(null); }}>
      <input autoFocus aria-label="Chat project name" placeholder="Project name" maxLength={80} value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === "Escape") { event.stopPropagation(); setEditing(null); } }} />
      <button className="btn" disabled={!name.trim()}>Save</button><button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
    </form>}
    {organization.folders.map(folder => {
      const children = rows.filter(row => organization.members[row.chatId] === folder.id);
      return <div className="session-folder" key={folder.id}>
        <div className="session-row"><button className="session-folder-toggle" aria-expanded={!folder.collapsed} onClick={() => organize(() => writeChatFolder(localStorage, { ...folder, collapsed: !folder.collapsed }))}>{folder.collapsed ? I.right : I.down}<span>{folder.name}</span><small>{children.length}</small></button><div className="session-actions"><button className="icon-btn" aria-label={`Rename project ${folder.name}`} onClick={() => edit(folder)}>{I.pencil}</button><button className="icon-btn" aria-label={`Remove project ${folder.name}`} title="Remove folder; keep chats" onClick={() => organize(() => removeChatFolder(localStorage, folder.id))}>{I.close}</button></div></div>
        {!folder.collapsed && <div className="session-folder-chats">{children.map(renderChat)}{!children.length && <p className="session-empty">Move chats here using their folder button.</p>}</div>}
      </div>;
    })}
    <div className="session-heading"><span>{archived ? "Archived chats" : "Chats"}</span><button className="session-archive-toggle" aria-pressed={archived} onClick={() => { setArchived(!archived); setRows([]); setMoving(null); setDeleting(null); }}>{archived ? "Active" : "Archived"}</button></div>
    {rows.filter(row => !organization.folders.some(folder => folder.id === organization.members[row.chatId])).map(renderChat)}
    {loading && !rows.length && <output className="session-empty" data-block>Loading chats…</output>}
    {!loading && !error && !rows.length && <p className="session-empty">{archived ? "No archived chats." : "Your sessions will appear here."}</p>}
    {error && <p className="session-empty" role="alert">{error}<button className="btn ghost" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
  </div>;
}
