import { ActionMenu, DetailPane, ListRow, TextField } from "../ui";
import { I } from "./icons";
import { useEffect, useRef, useState } from "react";
import type { BrowsingMemoryPage, BrowsingMemoryPolicy, WorkspaceMemory } from "@aux/contracts";
import { memorySourceExcluded } from "@aux/contracts/memory-context";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";
import { MemoryRecoveryNotice } from "./MemoryRecoveryNotice";

type Saved = { workspaceId: string; policy: BrowsingMemoryPolicy; pages: BrowsingMemoryPage[] };
export function BrowsingMemory({ memory }: { memory: WorkspaceMemory }) {
  return <BrowsingMemoryContent key={memory.workspaceId} memory={memory} />;
}

function BrowsingMemoryContent({ memory }: { memory: WorkspaceMemory }) {
  const [saved, setSaved] = useState<Saved | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [needsFreshBackup, setNeedsFreshBackup] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const pending = useRef(false), sequence = useRef(0);
  const [refresh, setRefresh] = useState(0);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "workspace.browsingMemory.updated" && event.payload.workspaceId === memory.workspaceId) setRefresh(value => value + 1);
  }), [memory.workspaceId]);
  useEffect(() => {
    const version = ++sequence.current;
    setError("");
    void call("workspaces.browsingMemory.get", { workspaceId: memory.workspaceId }).then(value => { if (version === sequence.current) setSaved(value); }).catch(reason => { if (version === sequence.current) setError(String(reason)); });
    return () => { ++sequence.current; };
  }, [memory.workspaceId, refresh]);
  async function change(method: "workspaces.browsingMemory.set" | "workspaces.browsingMemory.forget", params: Record<string, unknown>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    ++sequence.current;
    try {
      const prior = saved;
      const value = await call(method, { workspaceId: memory.workspaceId, ...params });
      if (prior?.pages.length && value.pages.length < prior.pages.length) setNeedsFreshBackup(true);
      setSaved(value); setConfirmClear(false);
    }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { pending.current = false; setBusy(false); }
  }
  const selected = saved?.pages.find(page => page.memoryId === selectedId);
  const openSource = (url: string) => { try { const parsed = new URL(url); if (["http:", "https:"].includes(parsed.protocol)) void useStore.getState().newTab(parsed.href).catch(errToast); } catch { /* Invalid stored addresses cannot navigate. */ } };
  const visiblePages = saved?.pages.filter(page => `${page.title} ${page.url}`.toLowerCase().includes(query.trim().toLowerCase())) ?? [];
  return <section className="browsing-memory" aria-label="Browsing memory">
    <h4>Browsing memory</h4>
    <p className="hint">Optionally remember page titles and addresses from foreground tabs in this Space. Query strings and fragments are removed. Page contents and forms are not read. Private windows and agent tabs are excluded.</p>
    {needsFreshBackup && <MemoryRecoveryNotice />}
    {saved ? <>
      <label className="memory-use-toggle"><input type="checkbox" checked={saved.policy.enabled} disabled={busy} onChange={event => void change("workspaces.browsingMemory.set", { policy: { ...saved.policy, enabled: event.target.checked } })}/><span>Remember pages I browse<small>{saved.policy.enabled ? "Recent page references may be included in new replies in this Space." : "Off. No new visits are remembered or included in replies."}</small></span></label>
      {saved.policy.enabled && memory.enabled === false && <p className="hint">Space memory is paused above. Recording and use are paused too.</p>}
      <label className="browsing-retention">Keep remembered pages for<select aria-label="Browsing memory retention" disabled={busy} value={saved.policy.retentionDays} onChange={event => void change("workspaces.browsingMemory.set", { policy: { ...saved.policy, retentionDays: Number(event.target.value) } })}><option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
      <p className="hint">Up to 200 recent pages per Space. Shortening retention removes older entries. Pausing keeps saved entries until they expire. Excluded sites are not remembered or used.</p>
      <details><summary>Remembered pages · {saved.pages.length}</summary>
        <TextField type="search" aria-label="Search remembered pages" placeholder="Search titles and addresses…" value={query} onChange={event => setQuery(event.target.value)}/>
        <div className="browsing-memory-list">{visiblePages.map(page => <ListRow key={page.memoryId} title={page.title} leading={I.globe} selected={selectedId === page.memoryId}
          description={<><span className="memory-match-source">{page.url}</span><span>{new Date(page.lastVisitedAt).toLocaleDateString()}{memorySourceExcluded(memory, page.url) ? " · Site excluded" : ""}</span></>}
          onOpen={() => { opener.current = document.activeElement as HTMLElement; setSelectedId(page.memoryId); }} trailing={<ActionMenu label={`Actions for ${page.title}`} actions={[
            { label: "Open page", onSelect: () => openSource(page.url) },
            { label: "Forget", danger: true, disabled: busy, onSelect: () => void change("workspaces.browsingMemory.forget", { memoryId: page.memoryId }) },
          ]} />} />)}</div>
        {selected && <DetailPane title={selected.title} metadata="Page reference · This Space" actions={<button className="btn sm" onClick={() => openSource(selected.url)}>Open page</button>} onClose={() => { setSelectedId(null); requestAnimationFrame(() => opener.current?.focus()); }}>
          <dl className="memory-note-metadata"><dt>Source</dt><dd className="selectable">{selected.url}</dd><dt>Last visited</dt><dd>{new Date(selected.lastVisitedAt).toLocaleString()}</dd><dt>Use</dt><dd>{memorySourceExcluded(memory, selected.url) ? "Site excluded" : !saved.policy.enabled || memory.enabled === false ? "Paused" : "Available in this Space"}</dd></dl>
          <p className="hint">Only this page’s title and address are remembered. No page contents or forms were captured.</p>
        </DetailPane>}
        {!!saved.pages.length && !visiblePages.length && <p className="hint">No pages match “{query}”.</p>}
        {!saved.pages.length && <p className="hint">No remembered pages. When enabled, spend a few seconds browsing a tab to remember it.</p>}
        {saved.pages.length > 0 && <div className="row">{confirmClear ? <><span className="hint">Forget all {saved.pages.length} saved page references?</span><button className="btn sm" disabled={busy} onClick={() => void change("workspaces.browsingMemory.forget", {})}>Forget all</button><button className="btn sm ghost" disabled={busy} onClick={() => setConfirmClear(false)}>Cancel</button></> : <button className="btn sm ghost" disabled={busy} onClick={() => setConfirmClear(true)}>Forget all remembered pages…</button>}</div>}
        <p className="hint">Revisiting a forgotten page can remember it again. Exclude its site to prevent this. Earlier replies retain the context they used.</p>
      </details>
    </> : !error && <output className="hint" data-block>Loading browsing memory…</output>}
    {error && <p className="field-error" role="alert">{error} <button className="btn sm ghost" disabled={busy} onClick={() => setRefresh(value => value + 1)}>Retry</button></p>}
  </section>;
}
