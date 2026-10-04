import "./MemoryItems.css";
import { ActionMenu, Checkbox, DetailPane, ListRow, Select, TextField } from "../ui";
import { shellIconFolder } from "./icons";
import { MemoryExclusions } from "./MemoryExclusions";
import { memorySourceExcluded } from "@aux/contracts/memory-context";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { WorkspaceMemory, WorkspaceMemoryItem } from "@aux/contracts";
import { guardCommandCompletion } from "../command-completion";
import { call, useStore } from "../store";
import { bridge } from "../bridge";
import { MemoryNoteButton, useMemoryNoteControl } from "./MemoryNoteControls";
import { useMemoryDrafts } from "../memory-drafts";

type NoteDraft = { itemId: string; content: string; sourceUrl: string; expires: string; selectionTruncated?: boolean };
type Scope = {active:boolean;identity:object;pending:boolean};
function memoryOwnerKey(layout:ReturnType<typeof useStore.getState>["layout"],workspaceId:string):string|null {const matches=[...layout.spaces,...(layout.archivedSpaces??[])].filter(space=>space.workspaceId===workspaceId);return matches.length===1 && typeof matches[0]?.id==="string" && matches[0].id ? matches[0].id : null;}
const dateValue = (at?: number) => at === undefined ? "" : new Date(at).toLocaleDateString("en-CA");

function MemoryNoteRow({item,selected,description,disabled,validate,select,persist,items,edit}:{item:WorkspaceMemoryItem;selected:boolean;description:string;disabled:boolean;validate(item:WorkspaceMemoryItem):unknown;select(item:WorkspaceMemoryItem):unknown;persist(items:WorkspaceMemoryItem[]):Promise<WorkspaceMemory>;items:WorkspaceMemoryItem[];edit(item:WorkspaceMemoryItem):unknown}) {
  const original={...item};const activation=useRef<(()=>void)|null>(null);
  const [selectRef,selectRun]=useMemoryNoteControl("select-memory-note",item.itemId,()=>{validate(original);return select(original);});
  const [useRefControl,useRun]=useMemoryNoteControl("toggle-memory-note-use",item.itemId,()=>{validate(original);return persist(items.map(value=>value.itemId===original.itemId?{...value,enabled:!original.enabled,updatedAt:Date.now()}:value));});
  const [editRef,editRun]=useMemoryNoteControl("edit-memory-note",item.itemId,()=>{validate(original);return edit(original);});
  const [deleteRef,deleteRun]=useMemoryNoteControl("delete-memory-note",item.itemId,()=>{validate(original);return persist(items.filter(value=>value.itemId!==original.itemId));});
  const [menuRef,menuRun]=useMemoryNoteControl("toggle-memory-note-actions",item.itemId,()=>{validate(original);if(!activation.current)throw new Error("Choose the original note menu.");activation.current();});
  return <ListRow title={item.content} leading={shellIconFolder} selected={selected} description={description} openRef={selectRef} onOpen={selectRun} trailing={<><Checkbox controlRef={useRefControl} aria-label={`Use note: ${item.content.slice(0,80)}`} checked={item.enabled} disabled={disabled} onChange={useRun}/><ActionMenu label={`Actions for note: ${item.content.slice(0,80)}`} triggerControl={(node,activate)=>{activation.current=node?activate:null;menuRef(node);}} onTrigger={menuRun} actions={[{label:"Edit",disabled,controlRef:editRef,onSelect:editRun},{label:"Delete",danger:true,disabled,controlRef:deleteRef,onSelect:deleteRun}]}/></>}/>;
}

export function MemoryItems({ memory, disabled, onSaved }: { memory: WorkspaceMemory; disabled: boolean; onSaved(memory: WorkspaceMemory): void }) {
  const privateMode=bridge.privateMode;
  const snapshot=JSON.stringify(memory);
  const ownerKey=useStore(state=>memoryOwnerKey(state.layout,memory.workspaceId));
  const identity=useMemo(()=>({workspaceId:memory.workspaceId,revision:memory.revision,disabled,privateMode,ownerKey,snapshot}),[memory.workspaceId,memory.revision,disabled,privateMode,ownerKey,snapshot]);
  const lifetime=useRef<Scope>({active:false,identity,pending:false});
  useLayoutEffect(()=>{const owner={active:true,identity,pending:false};lifetime.current=owner;return()=>{owner.active=false;};},[identity]);
  const key = `item:${memory.workspaceId}`;
  const savedDraft = useMemoryDrafts(state => state.drafts[key]);
  let draft: NoteDraft | null = null;
  try { const value = savedDraft ? JSON.parse(savedDraft.content) : null; if (value && typeof value.itemId === "string" && typeof value.content === "string" && typeof value.sourceUrl === "string" && typeof value.expires === "string") draft = value; } catch { /* Old or incomplete draft stays recoverable in storage. */ }
  const noteInput = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!draft) return;
    const owner=lifetime.current,target=noteInput.current;
    const frame = requestAnimationFrame(() => {if(owner.active&&owner===lifetime.current&&!bridge.privateMode&&target?.isConnected)target.focus();});
    return () => cancelAnimationFrame(frame);
  }, [draft?.itemId,identity]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selection,setSelection]=useState<{identity:object;itemId:string}|null>(null);
  const selectedId=selection?.identity===identity?selection.itemId:null;
  const setSelectedId=(itemId:string|null)=>setSelection(itemId?{identity,itemId}:null);
  const detailOpener = useRef<HTMLElement | null>(null);
  const [busyOwner,setBusyOwner]=useState<Scope|null>(null);
  const busy=!!busyOwner && busyOwner.active && busyOwner.identity===identity;
  const [failure,setFailure]=useState<{identity:object;message:string}|null>(null);
  const error=failure?.identity===identity?failure.message:"";
  const setError=(message:string)=>setFailure(message?{identity,message}:null);
  const [latestRead,setLatestRead]=useState<{identity:object;value:WorkspaceMemory}|null>(null);
  const latest=latestRead?.identity===identity?latestRead.value:null;
  const setLatest=(value:WorkspaceMemory|null)=>setLatestRead(value?{identity,value}:null);
  const items = memory.items ?? [];
  const selectedItem = items.find(item => item.itemId === selectedId);
  const noteStatus = (item: WorkspaceMemoryItem) => item.expiresAt !== undefined && item.expiresAt <= Date.now() ? "Expired" : !item.enabled ? "Paused" : memorySourceExcluded(memory, item.sourceUrl) ? "Source site excluded" : memory.enabled === false ? "Space memory paused" : "Used in this Space";
  const visibleItems = items.filter(item => `${item.content} ${item.sourceUrl ?? ""}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()) && (filter === "all" || (filter === "active" ? noteStatus(item) === "Used in this Space" : noteStatus(item) !== "Used in this Space")));
  const workspaceCurrent=()=>!!ownerKey && memoryOwnerKey(useStore.getState().layout,memory.workspaceId)===ownerKey;
  function current(item?:WorkspaceMemoryItem,writing=true){
    const owner=lifetime.current;
    if(!owner.active||owner.identity!==identity||bridge.privateMode||(writing&&disabled)||JSON.stringify(memory)!==snapshot||useMemoryDrafts.getState().drafts[key]!==savedDraft)
      throw new Error("The memory note changed. Choose its current control.");
    if(!workspaceCurrent())throw new Error("The memory Space changed. Choose its current control.");
    if(item&&!items.some(value=>JSON.stringify(value)===JSON.stringify(item)))throw new Error("The memory note changed. Choose its current control.");
    return owner;
  }
  const write = (value: NoteDraft | null, revision = savedDraft?.revision ?? memory.revision) => {current();useMemoryDrafts.getState().write(key, value ? { content: JSON.stringify(value), revision } : null);};
  const edit = (item?: WorkspaceMemoryItem) => { current(item);if(draft)throw new Error("Review or discard the current draft first.");setError(""); setLatest(null); write({ itemId: item?.itemId ?? crypto.randomUUID(), content: item?.content ?? "", sourceUrl: item?.sourceUrl ?? "", expires: dateValue(item?.expiresAt) }, memory.revision); };

  const persist = (next: WorkspaceMemoryItem[], base = memory, finishDraft = false) => {
    const owner=current();if(owner.pending)throw new Error("The memory note is still saving.");
    owner.pending=true;setBusyOwner(owner);setError("");
    const delivering=()=>owner.active && owner===lifetime.current && !bridge.privateMode && !disabled && workspaceCurrent() && JSON.stringify(memory)===snapshot && useMemoryDrafts.getState().drafts[key]===savedDraft;
    const completion=(async()=>{
    try {
      const saved = await call("workspaces.memory.set", { workspaceId: memory.workspaceId, expectedRevision: base.revision, content: base.content, items: next });
      if(saved.workspaceId!==memory.workspaceId||saved.revision<=base.revision)throw new Error("The saved memory reply changed Space or revision.");
      if(!delivering())return saved;
      current();
      if (finishDraft) write(null);
      else if (savedDraft?.revision === base.revision && draft) write(draft, saved.revision);
      setLatest(null); onSaved(saved);return saved;
    } catch (reason) {
      if(!delivering())throw reason;current();
      setError(reason instanceof Error ? reason.message : String(reason));
      try { const latestValue = await call("workspaces.memory.get", { workspaceId: memory.workspaceId }); if(owner.active&&owner===lifetime.current&&!bridge.privateMode&&useMemoryDrafts.getState().drafts[key]===savedDraft&&latestValue.workspaceId===memory.workspaceId&&latestValue.revision>base.revision){current();setLatest(latestValue);} } catch { /* Keep the draft during disconnection. */ }
      throw reason;
    } finally { owner.pending=false;setBusyOwner(value=>value===owner?null:value); }
    })();
    return guardCommandCompletion(completion,delivering);
  };
  const save = (base = memory) => {
    current();if (!draft) throw new Error("Review the current note draft first.");
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
    return persist(next, { ...base, revision: latest ? base.revision : savedDraft?.revision ?? base.revision }, true);
  };
  const [filterRef,filterRun]=useMemoryNoteControl("filter-memory-notes",memory.workspaceId,element=>{current(undefined,false);const value=(element as HTMLSelectElement).value;if(!["all","active","excluded"].includes(value))throw new Error("Choose a current note filter.");setFilter(value);});
  const [closeRef,closeRun]=useMemoryNoteControl("close-memory-note-detail",selectedItem?.itemId??memory.workspaceId,()=>{const owner=current(selectedItem,false),target=detailOpener.current;setSelectedId(null);requestAnimationFrame(()=>{if(owner.active&&owner===lifetime.current&&target?.isConnected)target.focus();});});
  const [saveFormRef,saveFormRun]=useMemoryNoteControl("save-memory-note",memory.workspaceId,()=>{if(busy||latest)throw new Error("Review the current note first.");return save();});
  if(privateMode)return <p className="hint">Memory notes are unavailable in private browsing.</p>;
  return <section className="memory-items" aria-label="Saved memory notes">
    <div className="conversation-documents-head"><div><b>Individual notes</b><small>Preferences and facts you choose to keep in this Space.</small></div><MemoryNoteButton command="add-memory-note" scopeId={memory.workspaceId} invoke={()=>{if(busy||draft||items.length>=40)throw new Error("Review the current notes first.");edit();}} className="btn sm" disabled={disabled || busy || !!draft || items.length >= 40}>Add note</MemoryNoteButton></div>
    {!!items.length && <div className="memory-list-tools"><TextField type="search" aria-label="Search memory notes" placeholder="Find a note…" value={query} onChange={event => setQuery(event.target.value)} />
      <Select controlRef={filterRef} aria-label="Filter memory notes" value={filter} onChange={filterRun}><option value="all">All notes</option><option value="active">Used in replies</option><option value="excluded">Paused or excluded</option></Select></div>}
    <div className="memory-items-list">{visibleItems.map(item=><MemoryNoteRow key={item.itemId} item={item} selected={selectedId===item.itemId} description={`${noteStatus(item)} · Updated ${new Date(item.updatedAt).toLocaleDateString()}`} disabled={disabled||busy||!!draft} items={items} persist={persist} edit={edit} validate={item=>current(item,false)} select={item=>{current(item,false);detailOpener.current=document.activeElement as HTMLElement;setSelectedId(item.itemId);}}/>)}</div>
    {!!items.length && !visibleItems.length && <output className="hint" data-block>No notes match these filters.</output>}
    {selectedItem && <DetailPane title="Memory note" metadata={noteStatus(selectedItem)} closeRef={closeRef} onClose={closeRun}>
      <p className="memory-note-content selectable">{selectedItem.content}</p>
      <div className="memory-note-metadata"><span className="meta-k">Scope</span><span className="meta-v">This Space</span><span className="meta-k">Source</span><span className="meta-v selectable">{selectedItem.sourceUrl || "Added directly"}</span><span className="meta-k">Expires</span><span className="meta-v">{selectedItem.expiresAt === undefined ? "No expiry" : new Date(selectedItem.expiresAt).toLocaleDateString()}</span><span className="meta-k">Updated</span><span className="meta-v">{new Date(selectedItem.updatedAt).toLocaleString()}</span></div>
    </DetailPane>}
    {!items.length && !draft && <p className="hint">No individual notes yet. Aux only saves notes you explicitly add here.</p>}
    {draft && <form ref={saveFormRef} className="memory-note-form" onSubmit={event => { event.preventDefault();saveFormRun(event); }}>
      <p className="hint">Review before saving · {draft.content.length.toLocaleString()}/2,000 characters{draft.content.length > 2000 ? " · Shorten this selection to keep the useful part." : ""}{draft.selectionTruncated ? " · The page supplied only the first part of the selection." : ""}</p>
      <label>Note<textarea ref={noteInput} aria-label="Memory note" value={draft.content} maxLength={2000} disabled={disabled || busy} onChange={event => write({ ...draft!, content: event.target.value })}/></label>
      <label>Source address <span className="hint">optional</span><input type="url" aria-label="Memory source address" value={draft.sourceUrl} maxLength={2048} disabled={disabled || busy} onChange={event => write({ ...draft!, sourceUrl: event.target.value })}/></label>
      <label>Use until <span className="hint">leave blank to keep using</span><input type="date" aria-label="Memory expiry date" value={draft.expires} disabled={disabled || busy} onChange={event => write({ ...draft!, expires: event.target.value })}/></label>
      <div className="capture-actions"><MemoryNoteButton command="discard-memory-note-draft" scopeId={memory.workspaceId} className="btn sm ghost" disabled={busy} invoke={()=>{current();if(busy)throw new Error("Wait for the original save.");write(null);setError("");setLatest(null);}}>Discard draft</MemoryNoteButton><button className="btn sm" disabled={disabled || busy || !!latest}>{busy ? "Saving…" : "Save note"}</button></div>
    </form>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {latest && <div className="memory-conflict"><strong>Memory changed elsewhere</strong><p>Your draft is preserved. Latest saved version of this note:</p><pre>{latest.items?.find(item => item.itemId === draft?.itemId)?.content ?? "This note is not in the saved list."}</pre><div className="row"><MemoryNoteButton command="load-latest-memory-notes" scopeId={memory.workspaceId} className="btn sm" disabled={busy||disabled} invoke={()=>{current();if(busy||latest.workspaceId!==memory.workspaceId)throw new Error("Review the current saved list.");if(draft)write(draft,latest.revision);setLatest(null);setError("");onSaved(latest);}}>Load latest list</MemoryNoteButton>{draft && <MemoryNoteButton command="save-memory-note-against-latest" scopeId={memory.workspaceId} className="btn sm" disabled={busy||disabled} invoke={()=>{current();if(busy||latest.workspaceId!==memory.workspaceId)throw new Error("Review the current saved list.");return save(latest);}}>Save my note against latest</MemoryNoteButton>}</div></div>}
    <MemoryExclusions memory={memory} disabled={disabled || busy || !!draft} onSaved={saved => {
      current();if(saved.workspaceId!==memory.workspaceId)throw new Error("The memory Space changed.");
      if (draft && savedDraft?.revision === memory.revision) write(draft, saved.revision);
      onSaved(saved);
    }}/>
    {items.length > 0 && <p className="hint">Pausing, expiry and deletion affect new replies. Earlier task records retain the memory they used.</p>}
  </section>;
}
