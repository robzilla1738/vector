import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { constructAwaitedOperation } from "./owned-operation-construction";
import { ActionMenu, DetailPane, ListRow, TextField } from "../ui";
import { shellIconGlobe } from "./icons";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { BrowsingMemoryPage, BrowsingMemoryPolicy, WorkspaceMemory } from "@aux/contracts";
import { memorySourceExcluded } from "@aux/contracts/memory-context";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { useBrowsingMemoryControl } from "./BrowsingMemoryControls";
import { MemoryRecoveryNotice } from "./MemoryRecoveryNotice";

type Owner = { active: boolean; workspaceId: string; revision: number; privateMode: boolean; loadScope: object };
type Saved = { workspaceId: string; policy: BrowsingMemoryPolicy; pages: BrowsingMemoryPage[] };
export function BrowsingMemory({ memory }: { memory: WorkspaceMemory }) {
  return <BrowsingMemoryContent key={memory.workspaceId} memory={memory} />;
}

function BrowsingMemoryPageRow({ page, selected, description, busy, select, open, forget, validate }: {
  page: BrowsingMemoryPage; selected: boolean; description: ReactNode; busy: boolean;
  validate(page: BrowsingMemoryPage): void; select(page: BrowsingMemoryPage): void; open(page: BrowsingMemoryPage): void; forget(page: BrowsingMemoryPage): unknown;
}) {
  const original={...page};
  const activation=useRef<(()=>void)|null>(null);
  const [menuAttach,menuRun]=useBrowsingMemoryControl("toggle-browsing-memory-actions",page.memoryId,()=>{validate(original);if(!activation.current)throw new Error("Choose the current page actions.");activation.current();});
  const [choiceAttach,choiceRun]=useBrowsingMemoryControl("select-browsing-memory-page",page.memoryId,()=>select(original));
  const [visitAttach,visitRun]=useBrowsingMemoryControl("open-browsing-memory-page",page.memoryId,()=>open(original));
  const [removeAttach,removeRun]=useBrowsingMemoryControl("forget-browsing-memory-page",page.memoryId,()=>forget(original));
  return <ListRow title={page.title} leading={shellIconGlobe} selected={selected} description={description}
    openRef={choiceAttach} onOpen={choiceRun} trailing={<ActionMenu label={`Actions for ${page.title}`} triggerControl={(node,activate)=>{activation.current=node?activate:null;menuAttach(node);}} onTrigger={menuRun} actions={[
      {label:"Open page",controlRef:visitAttach,onSelect:visitRun},
      {label:"Forget",danger:true,disabled:busy,controlRef:removeAttach,onSelect:removeRun},
    ]} />} />;
}

function BrowsingMemoryContent({ memory }: { memory: WorkspaceMemory }) {
  const privateMode=bridge.privateMode;
  const [loaded, setLoaded] = useState<{owner:Owner;value:Saved} | null>(null);
  const [error, setError] = useState("");
  const [busyOwner, setBusyOwner] = useState<Owner | null>(null);
  const busy = !!busyOwner && busyOwner.active && busyOwner.workspaceId===memory.workspaceId && busyOwner.revision===memory.revision && busyOwner.privateMode===privateMode;
  const [query, setQuery] = useState("");
  const [clearSnapshot, setClearSnapshot] = useState<Saved|null>(null);

  const [needsFreshBackup, setNeedsFreshBackup] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pending = useRef<Owner | null>(null), sequence = useRef(0);
  const [refresh, setRefresh] = useState(0);
  const loadScope=useMemo(()=>({workspaceId:memory.workspaceId,revision:memory.revision,privateMode,refresh}),[memory.workspaceId,memory.revision,privateMode,refresh]);
  const lifetime=useRef<Owner>({...loadScope,active:false,loadScope});
  const saved=loaded?.owner.loadScope===loadScope?loaded.value:null;
  const confirmClear=!!saved && clearSnapshot===saved;
  const committedSaved=useRef<Saved|null>(null);
  useLayoutEffect(()=>{
    const owner={...loadScope,active:true,loadScope};lifetime.current=owner;
    return()=>{owner.active=false;};
  },[loadScope]);
  useLayoutEffect(()=>{committedSaved.current=saved;},[saved]);
  const workspaceCurrent=useCallback(()=>{
    const layout=useStore.getState().layout;
    return [...layout.spaces,...(layout.archivedSpaces??[])].some(space=>space.workspaceId===memory.workspaceId);
  },[memory.workspaceId]);
  function current(record?: BrowsingMemoryPage, allowUnloaded=false) {
    const owner=lifetime.current;
    if(bridge.privateMode || !owner.active || owner.workspaceId!==memory.workspaceId || owner.revision!==memory.revision ||
       !workspaceCurrent() || committedSaved.current!==saved || (!allowUnloaded && loaded?.owner!==owner))
      throw new Error("The browsing memory changed. Choose its current control.");
    if(record && !saved?.pages.some(page=>page.memoryId===record.memoryId && page.url===record.url && page.title===record.title && page.firstVisitedAt===record.firstVisitedAt && page.lastVisitedAt===record.lastVisitedAt))
      throw new Error("The remembered page changed. Choose its current control.");
    return owner;
  }
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "workspace.browsingMemory.updated" && event.payload.workspaceId === memory.workspaceId) setRefresh(value => value + 1);
  }), [memory.workspaceId]);
  useEffect(() => {
    if(bridge.privateMode)return;
    if(!workspaceCurrent()){setError("The browsing memory Space changed. Choose its current control.");return;}
    const owner=lifetime.current, version = ++sequence.current;
    setError("");
    void call("workspaces.browsingMemory.get", { workspaceId: memory.workspaceId }).then(value => { if(!owner.active || bridge.privateMode || version!==sequence.current)return;if(!workspaceCurrent())throw new Error("The browsing memory Space retired. Choose its current control.");if(value.workspaceId!==owner.workspaceId)throw new Error("The browsing memory belongs to a different Space. Retry its current Space.");setLoaded({owner,value}); }).catch(reason => { if (owner.active && !bridge.privateMode && workspaceCurrent() && version === sequence.current) setError(String(reason)); });
    return () => { ++sequence.current; };
  }, [loadScope,memory.workspaceId,workspaceCurrent]);
  function change(method: "workspaces.browsingMemory.set" | "workspaces.browsingMemory.forget", params: Record<string, unknown>) {
    const owner=current();
    if (pending.current===owner) throw new Error("Browsing memory is still updating.");
    pending.current = owner; setBusyOwner(owner); setError("");
    const version=++sequence.current;
    const prior = saved;
    return constructAwaitedOperation(() => call(method, { workspaceId: memory.workspaceId, ...params }), value => {
      if(value.workspaceId!==owner.workspaceId)throw new Error("The browsing memory update belongs to a different Space.");
      if(!owner.active || owner!==lifetime.current || owner.workspaceId!==memory.workspaceId || owner.revision!==memory.revision || bridge.privateMode || sequence.current!==version || !workspaceCurrent())return value;
      if (prior?.pages.length && value.pages.length < prior.pages.length) setNeedsFreshBackup(true);
      setLoaded({owner,value}); setClearSnapshot(null);return value;
    }, reason => { if(owner.active && !bridge.privateMode && workspaceCurrent() && sequence.current===version)setError(errorMessage(reason)); throw reason; }, () => { if(pending.current===owner){pending.current=null;setBusyOwner(current=>current===owner?null:current);} },()=>owner.active && owner===lifetime.current && !bridge.privateMode && workspaceCurrent());
  }
  const selected = saved?.pages.find(page => page.memoryId === selectedId);
  const openSource = (url: string) => { try { const parsed = new URL(url); if (["http:", "https:"].includes(parsed.protocol)) void useStore.getState().newTab(parsed.href).catch(errToast); } catch { /* Invalid stored addresses cannot navigate. */ } };
  const visiblePages = saved?.pages.filter(page => `${page.title} ${page.url}`.toLowerCase().includes(query.trim().toLowerCase())) ?? [];
  const [toggleAttach,toggleRun]=useBrowsingMemoryControl("toggle-browsing-memory",memory.workspaceId,()=>{current();if(!saved)throw new Error("Load browsing memory first.");return change("workspaces.browsingMemory.set",{policy:{...saved.policy,enabled:!saved.policy.enabled}});});
  const [retentionAttach,retentionRun]=useBrowsingMemoryControl("set-browsing-memory-retention",memory.workspaceId,element=>{current();const days=Number((element as HTMLSelectElement).value);if(!saved||![7,30,90].includes(days))throw new Error("Choose an available retention period.");return change("workspaces.browsingMemory.set",{policy:{...saved.policy,retentionDays:days}});});
  const [discloseAttach,discloseRun]=useBrowsingMemoryControl("toggle-browsing-memory-pages",memory.workspaceId,element=>{current();const details=element.parentElement as HTMLDetailsElement;details.open=!details.open;});
  const [prepareAttach,prepareRun]=useBrowsingMemoryControl("prepare-forget-browsing-memory",memory.workspaceId,()=>{current();if(!saved?.pages.length||pending.current===lifetime.current)throw new Error("Choose current saved pages.");setClearSnapshot(saved);});
  const [confirmAttach,confirmRun]=useBrowsingMemoryControl("confirm-forget-browsing-memory",memory.workspaceId,()=>{current();if(!confirmClear||!saved?.pages.length)throw new Error("Confirm the current saved pages first.");return change("workspaces.browsingMemory.forget",{});});
  const [cancelAttach,cancelRun]=useBrowsingMemoryControl("cancel-forget-browsing-memory",memory.workspaceId,()=>{current();setClearSnapshot(null);});
  const [retryAttach,retryRun]=useBrowsingMemoryControl("retry-browsing-memory-load",memory.workspaceId,()=>{current(undefined,true);if(!error||pending.current===lifetime.current)throw new Error("Choose the current Retry control.");setRefresh(value=>value+1);});
  const selectedRecord=selected?{...selected}:undefined;
  const [visitSelectedAttach,visitSelectedRun]=useBrowsingMemoryControl("open-browsing-memory-page",selected?.memoryId??memory.workspaceId,()=>{if(!selectedRecord)throw new Error("Choose a saved page.");current(selectedRecord);openSource(selectedRecord.url);});
  const [closeAttach,closeRun]=useBrowsingMemoryControl("close-browsing-memory-detail",selected?.memoryId??memory.workspaceId,()=>{const owner=current(selectedRecord), target=opener.current;setSelectedId(null);requestAnimationFrame(()=>{if(owner.active && owner===lifetime.current && target?.isConnected)target.focus();});});
  if(bridge.privateMode)return <p {...staticHintProps}>Browsing memory is unavailable in private browsing.</p>;
  return <section className="browsing-memory" aria-label="Browsing memory">
    <h4>Browsing memory</h4>
    <p {...staticHintProps}>Optionally remember page titles and addresses from foreground tabs in this Space. Query strings and fragments are removed. Page contents and forms are not read. Private windows and agent tabs are excluded.</p>
    {needsFreshBackup && <MemoryRecoveryNotice />}
    {saved ? <>
      <label className="memory-use-toggle"><input ref={toggleAttach} type="checkbox" checked={saved.policy.enabled} disabled={busy} onChange={toggleRun}/><span>Remember pages I browse<small>{saved.policy.enabled ? "Recent page references may be included in new replies in this Space." : "Off. No new visits are remembered or included in replies."}</small></span></label>
      {saved.policy.enabled && memory.enabled === false && <p {...staticHintProps}>Space memory is paused above. Recording and use are paused too.</p>}
      <label className="browsing-retention">Keep remembered pages for<select ref={retentionAttach} aria-label="Browsing memory retention" disabled={busy} value={saved.policy.retentionDays} onChange={retentionRun}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
      <p {...staticHintProps}>Up to 200 recent pages per Space. Shortening retention removes older entries. Pausing keeps saved entries until they expire. Excluded sites are not remembered or used.</p>
      <details><summary ref={discloseAttach} onClick={event=>{event.preventDefault();discloseRun(event);}}>Remembered pages · {saved.pages.length}</summary>
        <TextField type="search" aria-label="Search remembered pages" placeholder="Search titles and addresses…" value={query} onChange={event => setQuery(event.target.value)}/>
        <div className="browsing-memory-list">{visiblePages.map(page => <BrowsingMemoryPageRow key={page.memoryId} page={page} selected={selectedId===page.memoryId} busy={busy} validate={current}
          description={<><span className="memory-match-source">{page.url}</span><span>{new Date(page.lastVisitedAt).toLocaleDateString()}{memorySourceExcluded(memory,page.url)?" · Site excluded":""}</span></>}
          select={record=>{current(record);opener.current=document.activeElement as HTMLElement;setSelectedId(record.memoryId);}}
          open={record=>{current(record);openSource(record.url);}} forget={record=>{current(record);return change("workspaces.browsingMemory.forget",{memoryId:record.memoryId});}} />)}</div>
        {selected && <DetailPane title={selected.title} metadata="Page reference · This Space" actions={<button ref={visitSelectedAttach} {...smallButtonProps} onClick={visitSelectedRun}>Open page</button>} closeRef={closeAttach} onClose={closeRun}>
          <div className="memory-note-metadata"><span className="meta-k">Source</span><span className="meta-v selectable">{selected.url}</span><span className="meta-k">Last visited</span><span className="meta-v">{new Date(selected.lastVisitedAt).toLocaleString()}</span><span className="meta-k">Use</span><span className="meta-v">{memorySourceExcluded(memory, selected.url) ? "Site excluded" : !saved.policy.enabled || memory.enabled === false ? "Paused" : "Available in this Space"}</span></div>
          <p {...staticHintProps}>Only this page’s title and address are remembered. No page contents or forms were captured.</p>
        </DetailPane>}
        {!!saved.pages.length && !visiblePages.length && <p {...staticHintProps}>No pages match “{query}”.</p>}
        {!saved.pages.length && <p {...staticHintProps}>No remembered pages. When enabled, spend a few seconds browsing a tab to remember it.</p>}
        {saved.pages.length > 0 && <div {...staticRowProps}>{confirmClear ? <><span {...staticHintProps}>Forget all {saved.pages.length} saved page references?</span><button {...smallButtonProps} disabled={busy} ref={confirmAttach} onClick={confirmRun}>Forget all</button><button {...smallGhostButtonProps} disabled={busy} ref={cancelAttach} onClick={cancelRun}>Cancel</button></> : <button {...smallGhostButtonProps} disabled={busy} ref={prepareAttach} onClick={prepareRun}>Forget all remembered pages…</button>}</div>}
        <p {...staticHintProps}>Revisiting a forgotten page can remember it again. Exclude its site to prevent this. Earlier replies retain the context they used.</p>
      </details>
    </> : !error && <output {...staticHintProps} data-block>Loading browsing memory…</output>}
    {error && <p className="field-error" role="alert">{error} <button {...smallGhostButtonProps} disabled={busy} ref={retryAttach} onClick={retryRun}>Retry</button></p>}
  </section>;
}
