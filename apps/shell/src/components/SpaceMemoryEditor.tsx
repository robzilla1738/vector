import { memoryControlElement, useMemoryElementControl } from "./memory-control-construction";
import { BrowsingMemory } from "./BrowsingMemory";
import { ContentMemory } from "./ContentMemory";
import { MemoryItems } from "./MemoryItems";
import { MemoryRecoveryNotice } from "./MemoryRecoveryNotice";
import { useEffect, useLayoutEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import type { WorkspaceMemory } from "@aux/contracts";
import { call } from "../store";
import { useMemoryDrafts } from "../memory-drafts";


import { bridge } from "../bridge";
import type { ShellCommandId } from "@aux/contracts";
import "./SpaceMemoryEditor.css";

function MemoryControl({ command, scopeId, action, disabled = false, children, summary = false, checkbox = false, checked = false, className, onError, inputId }: {
  command: ShellCommandId; scopeId: string; onError(reason: unknown): void; action(): unknown; disabled?: boolean; children?: ReactNode;
  inputId?: string; summary?: boolean; checkbox?: boolean; checked?: boolean; className?: string;
}) {
  const [ref, invoke] = useMemoryElementControl(command, scopeId, action, onError, summary, false);
  if (summary) return memoryControlElement("summary", { "data-command-id": command, ref, onClick: invoke }, children);
  if (checkbox) return memoryControlElement("input", { "data-command-id": command, id: inputId, ref, type: "checkbox", checked, disabled, onChange: invoke });
  return memoryControlElement("button", { "data-command-id": command, ref, className: className ?? "btn sm", disabled, onClick: invoke }, children);
}

export function SpaceMemoryEditor({ memory, disabled = false, onSaved }: {
  memory: WorkspaceMemory; disabled?: boolean; onSaved(memory: WorkspaceMemory): void;
}) {
  const draft = useMemoryDrafts(state => state.drafts[memory.workspaceId]);
  const storageError = useMemoryDrafts(state => state.storageError);
  const [overviewOpen, setOverviewOpen] = useState(!!memory.content || !!draft);
  const [busy, setBusy] = useState(false);
  const pending=useRef(false);
  const mounted = useRef(true);
  const snapshot = JSON.stringify([memory, disabled]);
  const scope = useMemo(() => ({ active: false }), [snapshot]);
  useLayoutEffect(() => { scope.active = true; return () => { scope.active = false; }; }, [scope]);
  const enabledId = useId();
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const scopeCurrent = () => mounted.current && scope.active && !disabled && !bridge.privateMode;
  const assertCurrent = () => { if (!scopeCurrent()) throw new Error("The Space notes changed. Choose their current control."); };
  const assertDraft = () => {
    assertCurrent();
    if (JSON.stringify(useMemoryDrafts.getState().drafts[memory.workspaceId]) !== JSON.stringify(draft))
      throw new Error("The draft changed. Choose its current control.");
  };
  const [error, setError] = useState("");
  const [errorSnapshot, setErrorSnapshot] = useState(snapshot);
  const [conflict, setConflict] = useState<WorkspaceMemory | null>(null);
  const [conflictSnapshot, setConflictSnapshot] = useState(snapshot);
  const currentConflict = conflictSnapshot === snapshot ? conflict : null;
  const [needsFreshBackup, setNeedsFreshBackup] = useState(false);
  const noteRemoved = (saved: WorkspaceMemory) =>
    !!memory.content && !saved.content.includes(memory.content)
    || (memory.items ?? []).some(old => !(saved.items ?? []).some(item => item.itemId === old.itemId
      && item.content === old.content && item.sourceUrl === old.sourceUrl))
    || (saved.excludedOrigins ?? []).some(origin => !(memory.excludedOrigins ?? []).includes(origin));
  const controlError = (reason: unknown) => { if (!mounted.current || !scope.active) return; setErrorSnapshot(snapshot); setError(reason instanceof Error ? reason.message : String(reason)); };
  const content = draft?.content ?? memory.content;
  const changed = content !== memory.content;
  const edit = (content: string) => useMemoryDrafts.getState().write(memory.workspaceId,
    { content, revision: draft?.revision ?? memory.revision });

  async function save(revision = draft?.revision ?? memory.revision) {
    assertDraft();
    if(pending.current)return;
    pending.current=true;setBusy(true); setError("");
    try {
      const saved = await call("workspaces.memory.set", { workspaceId: memory.workspaceId, expectedRevision: revision, content });
      if (!scopeCurrent()) return saved;
      const current = useMemoryDrafts.getState().drafts[memory.workspaceId];
      if (current?.content === content && current.revision === (draft?.revision ?? memory.revision)) useMemoryDrafts.getState().write(memory.workspaceId, null);
      else if (current?.revision === (draft?.revision ?? memory.revision)) useMemoryDrafts.getState().write(memory.workspaceId, { ...current, revision: saved.revision });
      if (noteRemoved(saved)) setNeedsFreshBackup(true);
      setConflict(null); onSaved(saved); return saved;
    } catch (reason) {
      if (!scopeCurrent()) throw reason;
      setErrorSnapshot(snapshot); setError(reason instanceof Error ? reason.message : String(reason));
      try {
        const latest = await call("workspaces.memory.get", { workspaceId: memory.workspaceId });
        if (scopeCurrent() && latest.revision !== revision) { setConflictSnapshot(snapshot); setConflict(latest); }
      } catch { /* Preserve the draft and original save error while disconnected. */ }
    } finally { pending.current=false; if (mounted.current) setBusy(false); }
  }

  async function setEnabled(enabled:boolean) {
    assertDraft();
    if(pending.current)return;
    pending.current=true;setBusy(true);setError("");
    try {
      const saved=await call("workspaces.memory.set",{workspaceId:memory.workspaceId,expectedRevision:memory.revision,content:memory.content,enabled});
      if (!scopeCurrent()) return saved;
      const current=useMemoryDrafts.getState().drafts[memory.workspaceId];
      if(current?.revision===memory.revision)useMemoryDrafts.getState().write(memory.workspaceId,{...current,revision:saved.revision});
      onSaved(saved); return saved;
    } catch(reason){if (!scopeCurrent()) throw reason; setErrorSnapshot(snapshot);setError(reason instanceof Error?reason.message:String(reason));}
    finally{pending.current=false;if (mounted.current) setBusy(false);}
  }

  return <div className="space-memory-editor">
    {needsFreshBackup && <MemoryRecoveryNotice />}
    <label className="memory-use-toggle" htmlFor={enabledId}><MemoryControl onError={controlError} command="toggle-space-memory-enabled" inputId={enabledId} scopeId={memory.workspaceId} checkbox checked={memory.enabled!==false} disabled={disabled||busy} action={() => setEnabled(memory.enabled === false)} /><span>Use Space memory in new replies<small>{memory.enabled===false?"Paused. Saved memory stays available; recording and use in new replies stop.":"Saved notes and enabled browsing memory can inform conversations and tasks in this Space."}</small></span></label>
    <details className="memory-overview" open={overviewOpen}><MemoryControl onError={controlError} command="toggle-space-memory-overview" scopeId={memory.workspaceId} summary action={() => { if (!mounted.current || !scope.active || bridge.privateMode) throw new Error("The Space changed."); setOverviewOpen(value => !value); }}>Space overview{changed ? " · Unsaved" : ""}</MemoryControl>
    <textarea aria-label="Space memory" value={content} maxLength={16_000} disabled={disabled || busy}
      placeholder="Project context, preferences, and decisions worth keeping…" onChange={event => edit(event.target.value)} />
    <div className="space-memory-editor-actions"><span className="hint">{changed ? "Unsaved notes" : memory.content ? "Saved notes" : "No saved notes"} · {content.length.toLocaleString()}/16,000</span><span className="sp" />
      {content && <MemoryControl onError={controlError} command="clear-space-memory-draft" scopeId={memory.workspaceId} className="btn sm ghost" disabled={disabled || busy} action={() => { assertDraft(); edit(""); }}>Clear notes</MemoryControl>}
      {draft && <MemoryControl onError={controlError} command="discard-space-memory-draft" scopeId={memory.workspaceId} className="btn sm ghost" disabled={disabled || busy} action={() => { assertDraft(); useMemoryDrafts.getState().write(memory.workspaceId, null); setConflict(null); setError(""); }}>Discard draft</MemoryControl>}
      <MemoryControl onError={controlError} command="save-space-memory" scopeId={memory.workspaceId} disabled={disabled || busy || !changed} action={() => save()}>{busy ? "Saving…" : "Save notes"}</MemoryControl>
    </div>
    {!content && memory.content && <p className="hint">Save to remove these notes from future context. Earlier task records retain their original snapshots.</p>}
    {memory.updatedAt && <p className="hint">Saved {new Date(memory.updatedAt).toLocaleString()} · Written by you · {memory.enabled===false?"Paused for future replies":"Used in this Space"}.</p>}
    {memory.enabled===false&&<p className="hint">Pausing applies to new context. Active runs and earlier task records retain their existing snapshots.</p>}
    </details>
    <MemoryItems memory={memory} disabled={disabled || busy} onSaved={saved => {
      const current = useMemoryDrafts.getState().drafts[memory.workspaceId];
      if (current?.revision === memory.revision && saved.content === memory.content) useMemoryDrafts.getState().write(memory.workspaceId, { ...current, revision: saved.revision });
      if (noteRemoved(saved)) setNeedsFreshBackup(true);
      onSaved(saved);
    }}/>
    <BrowsingMemory key={memory.workspaceId} memory={memory}/>
    <ContentMemory key={`content-${memory.workspaceId}`} memory={memory}/>
    {storageError && <output data-block className="hint">Your draft is available in this window but could not be saved for restart.</output>}
    {error && errorSnapshot === snapshot && <p role="alert" className="field-error">{error}</p>}
    {currentConflict && currentConflict.workspaceId === memory.workspaceId && <div className="memory-conflict"><strong>These notes changed elsewhere</strong><p>Your draft is preserved. Review the latest saved notes before choosing which version to keep.</p><pre>{currentConflict.content || "No saved notes"}</pre><div className="row">
      <MemoryControl onError={controlError} command="use-saved-space-memory" scopeId={memory.workspaceId} disabled={disabled || busy} action={() => { assertDraft(); useMemoryDrafts.getState().write(memory.workspaceId, null); onSaved(currentConflict); setConflict(null); setError(""); }}>Use saved notes</MemoryControl>
      <MemoryControl onError={controlError} command="overwrite-space-memory" scopeId={memory.workspaceId} disabled={disabled || busy} action={() => save(currentConflict.revision)}>Save my notes instead</MemoryControl>
    </div></div>}
  </div>;
}
