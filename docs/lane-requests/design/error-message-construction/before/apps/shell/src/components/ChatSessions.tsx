import "./ChatSessions.css";
import { ActionMenu } from "../ui";
import { STATUS_LABEL } from "../run-status";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ConversationSummary } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { readChatFolders, writeChatFolder, removeChatFolder, moveChatToFolder, type ChatFolder } from "../chat-folders";
import { shellIconArchive, shellIconChats, shellIconClose, shellIconDown, shellIconFolder, shellIconPencil, shellIconRight, shellIconTrash } from "./icons";

/** Shared session organization for both sidebar layouts. Folder entries belong to this browser profile. */
export function ChatSessions({ compact = false }: { compact?: boolean }) {
  const active = useStore(s => s.mode === "conversation" ? s.conversationId : null);
  const runRevision = useStore(s => s.runs.map(run => `${run.runId}:${run.status}:${run.endedAt ?? ""}`).join("|"));
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ConversationSummary[]>([]);
  const [archived, setArchived] = useState(false);
  const [organization, setOrganization] = useState(() => readChatFolders(localStorage));
  const [editing, setEditing] = useState<ChatFolder | null>(null);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [chatName, setChatName] = useState("");
  const [moving, setMoving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const root = useRef<HTMLDivElement>(null);
  const projectSelectors = useRef(new Map<string, HTMLSelectElement>());
  const actionTriggers = useRef(new Map<string, HTMLButtonElement>());
  const folderTriggers = useRef(new Map<string, HTMLButtonElement>());
  const headingTrigger = useRef<HTMLButtonElement>(null);
  const editingOrigin = useRef<{ kind: "folder" | "heading"; id?: string }>({ kind: "heading" });
  const focusReturn = useRef<{ kind: "chat" | "folder" | "heading"; id?: string } | null>(null);
  useLayoutEffect(() => {
    if (!focusReturn.current || renaming || moving || deleting || editing) return;
    const { kind, id } = focusReturn.current;
    const target = kind === "chat" ? actionTriggers.current.get(id ?? "")
      : kind === "folder" ? folderTriggers.current.get(id ?? "") : headingTrigger.current;
    (target?.isConnected ? target : root.current?.querySelector<HTMLButtonElement>(".session-open") ?? headingTrigger.current)
      ?.focus({ preventScroll: true });
    focusReturn.current = null;
  }, [rows, renaming, moving, deleting, editing]);
  useEffect(() => { if (moving) projectSelectors.current.get(moving)?.focus(); }, [moving]);
  function dismiss(chatId: string) {
    focusReturn.current = { kind: "chat", id: chatId };
    setMoving(null); setDeleting(null); setRenaming(null);
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
  }, [archived, runRevision, revision]);
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
      focusReturn.current = { kind: "chat", id: item.chatId };
      setRows(items => items.filter(row => row.chatId !== item.chatId)); setDeleting(null); setMoving(null);
    } catch (reason) { errToast(reason); }
    finally { pending.current = false; setBusy(false); }
  }
  function edit(folder?: ChatFolder) {
    editingOrigin.current = folder ? { kind: "folder", id: folder.id } : { kind: "heading" };
    setEditing(folder ?? { id: crypto.randomUUID(), name: "", collapsed: false }); setName(folder?.name ?? "");
  }
  function finishEdit() { focusReturn.current = editingOrigin.current; setEditing(null); }
  const showHistory = () => { useStore.getState().openConversation(null); useStore.setState({ conversationId: "history" }); };
  const visibleRows = compact ? rows.slice(0, 3) : rows;
  async function rename(item: ConversationSummary) {
    if (!chatName.trim() || pending.current) return;
    pending.current = true; setBusy(true);
    try {
      const changed = await call("conversations.rename", { chatId: item.chatId, title: chatName.trim() });
      setRows(current => current.map(row => row.chatId === changed.chatId ? changed : row));
      focusReturn.current = { kind: "chat", id: item.chatId };
      setRenaming(null);
    } catch (error) { errToast(error); }
    finally { pending.current = false; setBusy(false); }
  }
  const renderChat = (item: ConversationSummary) => <div className={`session-item${active === item.chatId ? " active" : ""}`} key={item.chatId} onKeyDown={event => { if (event.key === "Escape" && (moving === item.chatId || deleting === item.chatId || renaming === item.chatId)) { event.preventDefault(); event.stopPropagation(); dismiss(item.chatId); } }}>
    <div className={`session-row${active === item.chatId ? " active" : ""}`}>
      <button className="session-open" aria-current={active === item.chatId ? "page" : undefined} title={item.title} onClick={() => useStore.getState().openConversation(item.latestRun.runId)}>{item.title || "New chat"}</button>
      <div className="session-actions">
        {!["completed", "cancelled"].includes(item.latestRun.status) && <span className={`session-status ${item.latestRun.status}`} role="status" title={STATUS_LABEL[item.latestRun.status]} aria-label={STATUS_LABEL[item.latestRun.status]} />}
        <ActionMenu label={`Actions for ${item.title || "New chat"}`} triggerRef={node => { if (node) actionTriggers.current.set(item.chatId, node); else actionTriggers.current.delete(item.chatId); }} actions={[
          { label: "Rename", icon: shellIconPencil, disabled: busy, onSelect: () => { setRenaming(item.chatId); setChatName(item.title); setMoving(null); setDeleting(null); } },
          { label: "Move to project", icon: shellIconFolder, disabled: busy, onSelect: () => { setMoving(item.chatId); setDeleting(null); setRenaming(null); } },
          { label: archived ? "Restore chat" : "Archive chat", icon: shellIconArchive, disabled: busy, onSelect: () => { void mutate(item, false); } },
          { label: "Delete chat…", icon: shellIconTrash, danger: true, disabled: busy, onSelect: () => { setDeleting(item.chatId); setMoving(null); setRenaming(null); } },
        ]}/>
      </div>
    </div>
    {renaming === item.chatId && <form className="session-editor" onSubmit={event => { event.preventDefault(); void rename(item); }}>
      <input autoFocus aria-label="Conversation name" maxLength={160} value={chatName} onChange={event => setChatName(event.target.value)} />
      <button className="btn sm" disabled={busy || !chatName.trim()}>Save</button><button className="btn sm ghost" type="button" onClick={() => dismiss(item.chatId)}>Cancel</button>
    </form>}
    <div className={`session-disclosure${moving === item.chatId ? " open" : ""}`} aria-hidden={moving !== item.chatId} inert={moving !== item.chatId}><div><label className="session-move">Project<select ref={node => { if (node) projectSelectors.current.set(item.chatId, node); else projectSelectors.current.delete(item.chatId); }} aria-label={`Project for ${item.title}`} value={organization.members[item.chatId] && organization.folders.some(f => f.id === organization.members[item.chatId]) ? organization.members[item.chatId] : ""} onChange={event => { organize(() => moveChatToFolder(localStorage, item.chatId, event.target.value)); focusReturn.current = { kind: "chat", id: item.chatId }; setMoving(null); }}><option value="">No project</option>{organization.folders.map(folder => <option key={folder.id} value={folder.id}>{folder.name}</option>)}</select></label></div></div>
    <div className={`session-disclosure${deleting === item.chatId ? " open" : ""}`} aria-hidden={deleting !== item.chatId} inert={deleting !== item.chatId}><div><div className="session-confirm" role="group" aria-label={`Delete ${item.title} permanently?`}><span>Delete this chat permanently?</span><button className="btn ghost danger" disabled={busy} onClick={() => void mutate(item, true)}>Delete permanently</button><button className="btn ghost" onClick={() => dismiss(item.chatId)}>Cancel</button></div></div></div>
  </div>;
  return <div ref={root} className="chat-sessions" aria-busy={loading}>
    <div className="session-heading"><span>{archived ? "Archived chats" : compact ? "Recent" : "Chats"}</span><ActionMenu label="Chat options" triggerRef={node => { headingTrigger.current = node; }} actions={[
      { label: "New chat project", icon: shellIconFolder, onSelect: () => edit() },
      { label: archived ? "Active chats" : "Archived chats", icon: shellIconArchive, onSelect: () => { setArchived(!archived); setRows([]); } },
      { label: "All chats", icon: shellIconChats, onSelect: showHistory },
    ]}/></div>
    {(organization.folders.length > 0 || editing) && <div className="session-heading"><span>Projects</span></div>}
    {editing && <form className="session-editor" onSubmit={event => { event.preventDefault(); if (!name.trim()) return; organize(() => writeChatFolder(localStorage, { ...editing, name: name.trim() })); finishEdit(); }}>
      <input autoFocus aria-label="Chat project name" placeholder="Project name" maxLength={80} value={name} onChange={event => setName(event.target.value)} onKeyDown={event => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); finishEdit(); } }} />
      <button className="btn" disabled={!name.trim()}>Save</button><button type="button" className="btn ghost" onClick={finishEdit}>Cancel</button>
    </form>}
    {organization.folders.map(folder => {
      const children = visibleRows.filter(row => organization.members[row.chatId] === folder.id);
      return <div className="session-folder" key={folder.id}>
        <div className="session-row"><button className="session-folder-toggle" aria-expanded={!folder.collapsed} onClick={() => organize(() => writeChatFolder(localStorage, { ...folder, collapsed: !folder.collapsed }))}>{folder.collapsed ? shellIconRight : shellIconDown}<span>{folder.name}</span><small>{rows.filter(row => organization.members[row.chatId] === folder.id).length}</small></button><div className="session-actions"><ActionMenu label={`Actions for project ${folder.name}`} triggerRef={node => { if (node) folderTriggers.current.set(folder.id, node); else folderTriggers.current.delete(folder.id); }} actions={[
          { label: "Rename project", icon: shellIconPencil, onSelect: () => edit(folder) },
          { label: "Remove folder; keep chats", icon: shellIconClose, onSelect: () => organize(() => removeChatFolder(localStorage, folder.id)) },
        ]}/></div></div>
        {!folder.collapsed && <div className="session-folder-chats">{children.map(renderChat)}{!children.length && !compact && <p className="session-empty">Use a chat’s menu to move it here.</p>}</div>}
      </div>;
    })}

    {visibleRows.filter(row => !organization.folders.some(folder => folder.id === organization.members[row.chatId])).map(renderChat)}
    {compact && rows.length > 3 && <button className="sb-link sb-show-all" onClick={showHistory}>All chats {shellIconRight}</button>}
    {loading && !rows.length && <output className="session-empty" data-block>Loading chats…</output>}
    {!loading && !error && !rows.length && <p className="session-empty">{archived ? "No archived chats." : "Your sessions will appear here."}</p>}
    {error && <p className="session-empty" role="alert">{error}<button className="btn ghost" onClick={() => setRevision(value => value + 1)}>Retry</button></p>}
  </div>;
}
