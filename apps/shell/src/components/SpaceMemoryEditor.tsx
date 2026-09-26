import { BrowsingMemory } from "./BrowsingMemory";
import { ContentMemory } from "./ContentMemory";
import { MemoryItems } from "./MemoryItems";
import { useRef, useState } from "react";
import type { WorkspaceMemory } from "@aux/contracts";
import { call } from "../store";
import { useMemoryDrafts } from "../memory-drafts";
import "./SpaceMemoryEditor.css";

export function SpaceMemoryEditor({ memory, disabled = false, onSaved }: {
  memory: WorkspaceMemory; disabled?: boolean; onSaved(memory: WorkspaceMemory): void;
}) {
  const draft = useMemoryDrafts(state => state.drafts[memory.workspaceId]);
  const storageError = useMemoryDrafts(state => state.storageError);
  const [overviewOpen, setOverviewOpen] = useState(!!memory.content || !!draft);
  const [busy, setBusy] = useState(false);
  const pending=useRef(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<WorkspaceMemory | null>(null);
  const content = draft?.content ?? memory.content;
  const changed = content !== memory.content;
  const edit = (content: string) => useMemoryDrafts.getState().write(memory.workspaceId,
    { content, revision: draft?.revision ?? memory.revision });

  async function save(revision = draft?.revision ?? memory.revision) {
    if(pending.current)return;
    pending.current=true;setBusy(true); setError("");
    try {
      const saved = await call("workspaces.memory.set", { workspaceId: memory.workspaceId, expectedRevision: revision, content });
      const current = useMemoryDrafts.getState().drafts[memory.workspaceId];
      if (current?.content === content) useMemoryDrafts.getState().write(memory.workspaceId, null);
      else if (current?.revision === revision) useMemoryDrafts.getState().write(memory.workspaceId, { ...current, revision: saved.revision });
      setConflict(null); onSaved(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
      try {
        const latest = await call("workspaces.memory.get", { workspaceId: memory.workspaceId });
        if (latest.revision !== revision) setConflict(latest);
      } catch { /* Preserve the draft and original save error while disconnected. */ }
    } finally { pending.current=false;setBusy(false); }
  }

  async function setEnabled(enabled:boolean) {
    if(pending.current)return;
    pending.current=true;setBusy(true);setError("");
    try {
      const saved=await call("workspaces.memory.set",{workspaceId:memory.workspaceId,expectedRevision:memory.revision,content:memory.content,enabled});
      const current=useMemoryDrafts.getState().drafts[memory.workspaceId];
      if(current?.revision===memory.revision)useMemoryDrafts.getState().write(memory.workspaceId,{...current,revision:saved.revision});
      onSaved(saved);
    } catch(reason){setError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;setBusy(false);}
  }

  return <div className="space-memory-editor">
    <label className="memory-use-toggle"><input type="checkbox" checked={memory.enabled!==false} disabled={disabled||busy} onChange={event=>void setEnabled(event.target.checked)}/><span>Use Space memory in new replies<small>{memory.enabled===false?"Paused. Saved memory stays available; recording and use in new replies stop.":"Saved notes and enabled browsing memory can inform conversations and tasks in this Space."}</small></span></label>
    <details className="memory-overview" open={overviewOpen}><summary onClick={event => { event.preventDefault(); setOverviewOpen(value => !value); }}>Space overview{changed ? " · Unsaved" : ""}</summary>
    <textarea aria-label="Space memory" value={content} maxLength={16_000} disabled={disabled || busy}
      placeholder="Project context, preferences, and decisions worth keeping…" onChange={event => edit(event.target.value)} />
    <div className="space-memory-editor-actions"><span className="hint">{changed ? "Unsaved notes" : memory.content ? "Saved notes" : "No saved notes"} · {content.length.toLocaleString()}/16,000</span><span className="sp" />
      {content && <button className="btn sm ghost" disabled={disabled || busy} onClick={() => edit("")}>Clear notes</button>}
      {draft && <button className="btn sm ghost" disabled={disabled || busy} onClick={() => { useMemoryDrafts.getState().write(memory.workspaceId, null); setConflict(null); setError(""); }}>Discard draft</button>}
      <button className="btn sm" disabled={disabled || busy || !changed} onClick={() => void save()}>{busy ? "Saving…" : "Save notes"}</button>
    </div>
    {!content && memory.content && <p className="hint">Save to remove these notes from future context. Earlier task records retain their original snapshots.</p>}
    {memory.updatedAt && <p className="hint">Saved {new Date(memory.updatedAt).toLocaleString()} · Written by you · {memory.enabled===false?"Paused for future replies":"Used in this Space"}.</p>}
    {memory.enabled===false&&<p className="hint">Pausing applies to new context. Active runs and earlier task records retain their existing snapshots.</p>}
    </details>
    <MemoryItems memory={memory} disabled={disabled || busy} onSaved={saved => {
      const current = useMemoryDrafts.getState().drafts[memory.workspaceId];
      if (current?.revision === memory.revision && saved.content === memory.content) useMemoryDrafts.getState().write(memory.workspaceId, { ...current, revision: saved.revision });
      onSaved(saved);
    }}/>
    <BrowsingMemory key={memory.workspaceId} memory={memory}/>
    <ContentMemory key={`content-${memory.workspaceId}`} memory={memory}/>
    {storageError && <output data-block className="hint">Your draft is available in this window but could not be saved for restart.</output>}
    {error && <p role="alert" className="field-error">{error}</p>}
    {conflict && <div className="memory-conflict"><strong>These notes changed elsewhere</strong><p>Your draft is preserved. Review the latest saved notes before choosing which version to keep.</p><pre>{conflict.content || "No saved notes"}</pre><div className="row">
      <button className="btn sm" disabled={disabled || busy} onClick={() => { useMemoryDrafts.getState().write(memory.workspaceId, null); onSaved(conflict); setConflict(null); setError(""); }}>Use saved notes</button>
      <button className="btn sm" disabled={disabled || busy} onClick={() => void save(conflict.revision)}>Save my notes instead</button>
    </div></div>}
  </div>;
}
