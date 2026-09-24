import { useEffect, useState } from "react";
import type { ContentMemoryMatch, ContentMemoryPolicy, WorkspaceMemory } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";

export function ContentMemory({ memory }: { memory: WorkspaceMemory }) {
  const [policy, setPolicy] = useState<ContentMemoryPolicy | null>(null);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<ContentMemoryMatch[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "workspace.contentMemory.updated" && event.payload.workspaceId === memory.workspaceId)
      setRevision(value => value + 1);
  }), [memory.workspaceId]);
  useEffect(() => {
    let live = true;
    void call("workspaces.contentMemory.policy", { workspaceId: memory.workspaceId })
      .then(value => { if (live) setPolicy(value); })
      .catch(reason => { if (live) setError(String(reason)); });
    return () => { live = false; };
  }, [memory.workspaceId, revision]);
  useEffect(() => {
    let live = true;
    const term = query.trim();
    if (!term || !policy?.enabled) { setMatches([]); return; }
    const timer = setTimeout(() => {
      void call("workspaces.contentMemory.search", { workspaceId: memory.workspaceId, query: term })
        .then(value => { if (live) setMatches(value); })
        .catch(reason => { if (live) setError(String(reason)); });
    }, 180);
    return () => { live = false; clearTimeout(timer); };
  }, [memory.workspaceId, policy?.enabled, query, revision]);
  async function change(next: ContentMemoryPolicy) {
    setBusy(true); setError("");
    try {
      const saved = await call("workspaces.contentMemory.setPolicy", { workspaceId: memory.workspaceId, policy: next });
      setPolicy(saved);
      setMatches([]);
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  }
  async function forget(memoryId?: string) {
    setBusy(true); setError("");
    try {
      await call("workspaces.contentMemory.forget", { workspaceId: memory.workspaceId, memoryId });
      setMatches(current => current.filter(item => !!memoryId && item.memoryId !== memoryId));
      setConfirmClear(false);
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  }
  return <section className="browsing-memory" aria-label="Page-content recall">
    <h4>Page-content recall</h4>
    <p className="hint">Use a tab’s “Remember article” action to save readable text in this Space. Aux only captures an active HTTPS article after you confirm its site. Saved content stays protected on this device and expires automatically.</p>
    {policy && <>
      <label className="memory-use-toggle"><input type="checkbox" checked={policy.enabled} disabled={busy} onChange={event => void change({ ...policy, enabled: event.target.checked })}/><span>Use remembered article content<small>{policy.enabled ? "Search and capture are available for allowed sites." : "Paused. Saved articles remain until they expire or you forget them."}</small></span></label>
      {memory.enabled === false && <p className="hint">Space memory is paused above. Article capture and search are unavailable.</p>}
      <label className="browsing-retention">Keep remembered articles for<select aria-label="Page-content retention" disabled={busy} value={policy.retentionDays} onChange={event => void change({ ...policy, retentionDays: Number(event.target.value) as 30 | 90 })}><option value={30}>30 days</option><option value={90}>90 days</option></select></label>
      <details><summary>Allowed sites · {policy.allowedOrigins.length}</summary>
        <p className="hint">Only articles from these exact sites can be saved. Removing a site deletes its saved content from this Space.</p>
        <div className="browsing-memory-list">{policy.allowedOrigins.map(origin => <article key={origin}><span>{origin}</span><button className="btn sm ghost" disabled={busy} onClick={() => void change({ ...policy, allowedOrigins: policy.allowedOrigins.filter(item => item !== origin) })}>Remove site</button></article>)}</div>
        {!policy.allowedOrigins.length && <p className="hint">No sites allowed yet. Confirm “Remember article” on an active tab to add one.</p>}
      </details>
      <input className="field-input" type="search" aria-label="Search remembered articles" placeholder="Search remembered articles…" value={query} onChange={event => setQuery(event.target.value)} disabled={!policy.enabled || memory.enabled === false}/>
      {query.trim() && policy.enabled && !matches.length && <p className="hint">No matching remembered articles.</p>}
      <div className="browsing-memory-list">{matches.map(item => <article key={item.memoryId}>
        <button className="browsing-memory-page" title={item.url} onClick={() => { void useStore.getState().newTab(item.url).catch(errToast); }}><b>{item.title}</b><small>{item.url}</small><span>{item.snippet}</span></button>
        <span className="hint">{new Date(item.capturedAt).toLocaleDateString()}</span>
        <button className="btn sm ghost" disabled={busy} onClick={() => void forget(item.memoryId)}>Forget</button>
      </article>)}</div>
      <div className="row">{confirmClear ? <><span className="hint">Forget all saved articles in this Space?</span><button className="btn sm" disabled={busy} onClick={() => void forget()}>Forget all</button><button className="btn sm ghost" disabled={busy} onClick={() => setConfirmClear(false)}>Cancel</button></> : <button className="btn sm ghost" disabled={busy} onClick={() => setConfirmClear(true)}>Forget all remembered articles…</button>}</div>
    </>}
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}
