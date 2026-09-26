import { ActionMenu, Checkbox, DetailPane, ListRow, Select, TextField } from "./ui";
import { I } from "./icons";
import { MemoryExclusions } from "./MemoryExclusions";
import { memorySourceExcluded } from "@aux/contracts/memory-context";
import { useEffect, useRef, useState } from "react";
import type { WorkspaceMemory, WorkspaceMemoryItem } from "@aux/contracts";
import { call } from "../store";
import { useMemoryDrafts } from "../memory-drafts";

type NoteDraft = { itemId: string; content: string; sourceUrl: string; expires: string; selectionTruncated?: boolean };
const dateValue = (at?: number) => at === undefined ? "" : new Date(at).toLocaleDateString("en-CA");

export function MemoryItems({ memory, disabled, onSaved }: { memory: WorkspaceMemory; disabled: boolean; onSaved(memory: WorkspaceMemory): void }) {
  const key = `item:${memory.workspaceId}`;
  const savedDraft = useMemoryDrafts(state => state.drafts[key]);
  let draft: NoteDraft | null = null;
  try { const value = savedDraft ? JSON.parse(savedDraft.content) : null; if (value && typeof value.itemId === "string" && typeof value.content === "string" && typeof value.sourceUrl === "string" && typeof value.expires === "string") draft = value; } catch { /* Old or incomplete draft stays recoverable in storage. */ }
  const noteInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!draft) return;
    const frame = requestAnimationFrame(() => noteInput.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [draft?.itemId]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailOpener = useRef<HTMLElement | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const [error, setError] = useState("");
  const [latest, setLatest] = useState<WorkspaceMemory | null>(null);
  const items = memory.items ?? [];
  const selectedItem = items.find(item => item.itemId === selectedId);
  const noteStatus = (item: WorkspaceMemoryItem) => item.expiresAt !== undefined && item.expiresAt <= Date.now() ? "Expired" : !item.enabled ? "Paused" : memorySourceExcluded(memory, item.sourceUrl) ? "Source site excluded" : memory.enabled === false ? "Space memory paused" : "Used in this Space";
  const visibleItems = items.filter(item => `${item.content} ${item.sourceUrl ?? ""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (filter === "all" || (filter === "active" ? noteStatus(item) === "Used in this Space" : noteStatus(item) !== "Used in this Space")));
  const write = (value: NoteDraft | null, revision = savedDraft?.revision ?? memory.revision) => useMemoryDrafts.getState().write(key, value ? { content: JSON.stringify(value), revision } : null);
  const edit = (item?: WorkspaceMemoryItem) => { setError(""); setLatest(null); write({ itemId: item?.itemId ?? crypto.randomUUID(), content: item?.content ?? "", sourceUrl: item?.sourceUrl ?? "", expires: dateValue(item?.expiresAt) }, memory.revision); };

  const persist = async (next: WorkspaceMemoryItem[], base = memory, finishDraft = false) => {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const saved = await call("workspaces.memory.set", { workspaceId: memory.workspaceId, expectedRevision: base.revision, content: base.content, items: next });
      if (finishDraft) write(null);
      else if (savedDraft?.revision === base.revision && draft) write(draft, saved.revision);
      setLatest(null); onSaved(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      try { const current = await call("workspaces.memory.get", { workspaceId: memory.workspaceId }); if (current.revision !== base.revision) setLatest(current); } catch { /* Keep the draft during disconnection. */ }
    } finally { pending.current = false; setBusy(false); }
  };
  const save = (base = memory) => {
    if (!draft) return;
    const content = draft.content.trim();
    if (content.length > 2000) { setError("Shorten this selection to 2,000 characters before saving the note."); return; }
    if (!content) { setError("Write a note before saving."); return; }
    let sourceUrl: string | undefined;
    if (draft.sourceUrl.trim()) {
      try { const url = new URL(draft.sourceUrl.trim()); if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error(); sourceUrl = url.href; }
      catch { setError("Use a web source address without credentials, or leave it blank."); return; }
    }
    const expiresAt = draft.expires ? new Date(`${draft.expires}T23:59:59`).getTime() : undefined;
    if (expiresAt !== undefined && !Number.isFinite(expiresAt)) { setError("Choose a valid expiry date."); return; }
    const currentItems = base.items ?? [], existing = currentItems.find(item => item.itemId === draft.itemId);
    const item = { itemId: draft.itemId, content, sourceUrl, expiresAt, enabled: existing?.enabled ?? true, createdAt: existing?.createdAt ?? Date.now(), updatedAt: Date.now() };
    const next = existing ? currentItems.map(value => value.itemId === item.itemId ? item : value) : [...currentItems, item];
    void persist(next, { ...base, revision: latest ? base.revision : savedDraft?.revision ?? base.revision }, true);
  };
  return <section className="memory-items" aria-label="Saved memory notes">
    <div className="conversation-documents-head"><div><b>Individual notes</b><small>Preferences and facts you choose to keep in this Space.</small></div><button className="btn sm" disabled={disabled || busy || !!draft || items.length >= 40} onClick={() => edit()}>Add note</button></div>
    {!!items.length && <div className="memory-list-tools"><TextField type="search" aria-label="Search memory notes" placeholder="Find a note…" value={query} onChange={event => setQuery(event.target.value)} />
      <Select aria-label="Filter memory notes" value={filter} onChange={event => setFilter(event.target.value)}><option value="all">All notes</option><option value="active">Used in replies</option><option value="excluded">Paused or excluded</option></Select></div>}
    <div className="memory-items-list">{visibleItems.map(item => <ListRow key={item.itemId} title={item.content} leading={I.folder} selected={selectedId === item.itemId}
      description={`${noteStatus(item)} · Updated ${new Date(item.updatedAt).toLocaleDateString()}`}
      onOpen={() => { detailOpener.current = document.activeElement as HTMLElement; setSelectedId(item.itemId); }}
      trailing={<><Checkbox aria-label={`Use note: ${item.content.slice(0, 80)}`} checked={item.enabled} disabled={disabled || busy || !!draft} onChange={event => void persist(items.map(value => value.itemId === item.itemId ? { ...value, enabled: event.target.checked, updatedAt: Date.now() } : value))} />
        <ActionMenu label={`Actions for note: ${item.content.slice(0, 80)}`} actions={[
          {label:"Edit",disabled:disabled || busy || !!draft,onSelect:()=>edit(item)},
          {label:"Delete",danger:true,disabled:disabled || busy || !!draft,onSelect:()=>void persist(items.filter(value=>value.itemId!==item.itemId))},
        ]} /></>} />)}</div>
    {!!items.length && !visibleItems.length && <output className="hint" data-block>No notes match these filters.</output>}
    {selectedItem && <DetailPane title="Memory note" metadata={noteStatus(selectedItem)} onClose={() => { setSelectedId(null); requestAnimationFrame(() => detailOpener.current?.focus()); }}>
      <p className="memory-note-content selectable">{selectedItem.content}</p>
      <dl className="memory-note-metadata"><dt>Scope</dt><dd>This Space</dd><dt>Source</dt><dd className="selectable">{selectedItem.sourceUrl || "Added directly"}</dd><dt>Expires</dt><dd>{selectedItem.expiresAt === undefined ? "No expiry" : new Date(selectedItem.expiresAt).toLocaleDateString()}</dd><dt>Updated</dt><dd>{new Date(selectedItem.updatedAt).toLocaleString()}</dd></dl>
    </DetailPane>}
    {!items.length && !draft && <p className="hint">No individual notes yet. Aux only saves notes you explicitly add here.</p>}
    {draft && <form className="memory-note-form" onSubmit={event => { event.preventDefault(); save(); }}>
      <p className="hint">Review before saving · {draft.content.length.toLocaleString()}/2,000 characters{draft.content.length > 2000 ? " · Shorten this selection to keep the useful part." : ""}{draft.selectionTruncated ? " · The page supplied only the first part of the selection." : ""}</p>
      <label>Note<textarea ref={noteInput} aria-label="Memory note" value={draft.content} maxLength={2000} disabled={disabled || busy} onChange={event => write({ ...draft!, content: event.target.value })}/></label>
      <label>Source address <span className="hint">optional</span><input type="url" aria-label="Memory source address" value={draft.sourceUrl} maxLength={2048} disabled={disabled || busy} onChange={event => write({ ...draft!, sourceUrl: event.target.value })}/></label>
      <label>Use until <span className="hint">leave blank to keep using</span><input type="date" aria-label="Memory expiry date" value={draft.expires} disabled={disabled || busy} onChange={event => write({ ...draft!, expires: event.target.value })}/></label>
      <div className="capture-actions"><button type="button" className="btn sm ghost" disabled={busy} onClick={() => { write(null); setError(""); setLatest(null); }}>Discard draft</button><button className="btn sm" disabled={disabled || busy || !!latest}>{busy ? "Saving…" : "Save note"}</button></div>
    </form>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {latest && <div className="memory-conflict"><strong>Memory changed elsewhere</strong><p>Your draft is preserved. Latest saved version of this note:</p><pre>{latest.items?.find(item => item.itemId === draft?.itemId)?.content ?? "This note is not in the saved list."}</pre><div className="row"><button className="btn sm" disabled={busy} onClick={() => { onSaved(latest); setLatest(null); setError(""); if (draft) write(draft, latest.revision); }}>Load latest list</button>{draft && <button className="btn sm" disabled={busy} onClick={() => save(latest)}>Save my note against latest</button>}</div></div>}
    <MemoryExclusions memory={memory} disabled={disabled || busy || !!draft} onSaved={saved => {
      if (draft && savedDraft?.revision === memory.revision) write(draft, saved.revision);
      onSaved(saved);
    }}/>
    {items.length > 0 && <p className="hint">Pausing, expiry and deletion affect new replies. Earlier task records retain the memory they used.</p>}
  </section>;
}
