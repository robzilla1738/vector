import { ActionMenu, DetailPane, ListRow, TextField } from "./ui";
import { I } from "./icons";
import { useEffect, useRef, useState } from "react";
import type { ContentMemoryDocument, ContentMemoryMatch, ContentMemoryPolicy, WorkspaceMemory } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, errToast, useStore } from "../store";

export function ContentMemory({ memory }: { memory: WorkspaceMemory }) {
  return <ContentMemoryContent key={memory.workspaceId} memory={memory} />;
}

function ContentMemoryContent({ memory }: { memory: WorkspaceMemory }) {
  const [policy, setPolicy] = useState<ContentMemoryPolicy | null>(null);
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<ContentMemoryMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [document, setDocument] = useState<ContentMemoryDocument | null>(null);
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [revision, setRevision] = useState(0);
  const readSequence = useRef(0);
  const detailOpener = useRef<HTMLElement | null>(null);
  useEffect(() => bridge.onEvent(event => {
    if (event.type === "workspace.contentMemory.updated" && event.payload.workspaceId === memory.workspaceId) {
      setMatches([]);
      setDocument(null);
      setRevision(value => value + 1);
    }
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
    if (!term || !policy?.enabled) { setMatches([]); setSearching(false); return; }
    setMatches([]);
    setSearching(true);
    const timer = setTimeout(() => {
      void call("workspaces.contentMemory.search", { workspaceId: memory.workspaceId, query: term })
        .then(value => { if (live) setMatches(value); })
        .catch(reason => { if (live) setError(String(reason)); })
        .finally(() => { if (live) setSearching(false); });
    }, 180);
    return () => { live = false; clearTimeout(timer); };
  }, [memory.workspaceId, policy?.enabled, query, revision]);
  useEffect(() => {
    ++readSequence.current; setDocument(null); setBusy(false); setQuestion("");
    return () => { ++readSequence.current; };
  }, [memory.workspaceId, policy?.enabled, memory.enabled, revision]);
  async function read(memoryId: string) {
    const request = ++readSequence.current;
    detailOpener.current = window.document.activeElement as HTMLElement;
    setDocument(null); setBusy(true); setError("");
    try {
      const saved = await call("workspaces.contentMemory.get", { workspaceId: memory.workspaceId, memoryId });
      if (request !== readSequence.current) return;
      if (!saved) throw new Error("This saved article is no longer available.");
      setDocument(saved);
    } catch (reason) { if (request === readSequence.current) { setDocument(null); setError(String(reason)); } }
    finally { if (request === readSequence.current) setBusy(false); }
  }
  async function ask() {
    if (!document || !question.trim()) return;
    const run = await useStore.getState().startRun(question, { scope: "new", chatId: crypto.randomUUID(), presentation: "conversation",
      memorySource: { workspaceId: memory.workspaceId, memoryId: document.memoryId } });
    if (run) { setQuestion(""); useStore.getState().openConversation(run.runId); }
  }
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
      setDocument(null);
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
      <TextField type="search" aria-label="Search remembered articles" placeholder="Search remembered articles…" value={query} onChange={event => setQuery(event.target.value)} disabled={!policy.enabled || memory.enabled === false}/>
      {query.trim() && policy.enabled && !matches.length && <p className="hint">{searching ? "Searching remembered articles…" : "No matching remembered articles."}</p>}
      <div className="browsing-memory-list">{matches.map(item => <ListRow key={item.memoryId} title={item.title} leading={I.globe} selected={document?.memoryId === item.memoryId} disabled={busy}
        description={<><span className="memory-match-source">{item.url} · {new Date(item.capturedAt).toLocaleDateString()}</span><span className="memory-match-snippet">{item.snippet}</span></>}
        onOpen={() => void read(item.memoryId)} trailing={<ActionMenu label={`Actions for ${item.title}`} actions={[
          { label: "Read saved text", disabled: busy, onSelect: () => void read(item.memoryId) },
          { label: "Open live source", onSelect: () => { void useStore.getState().newTab(item.url).catch(errToast); } },
          { label: "Forget", danger: true, disabled: busy, onSelect: () => void forget(item.memoryId) },
        ]} />} />)}</div>
      {document && <DetailPane className="content-memory-document" title={document.title} metadata="Historical article · This Space" onClose={() => { ++readSequence.current; setDocument(null); requestAnimationFrame(() => detailOpener.current?.focus()); }}>
        <p className="hint">Saved {new Date(document.capturedAt).toLocaleString()} from {document.url}. This is a historical copy; open the source to check for updates.</p>
        <div className="content-memory-text">{document.text}</div>
        <p className="hint">Ask Aux sends up to 8,000 characters of this saved article to your selected AI provider. The saved copy may be older than the live page.</p>
        <div className="row"><input className="field-input" aria-label="Question about saved article" placeholder="Ask about this saved article…" value={question} onChange={event => setQuestion(event.target.value)}/><button className="btn sm" disabled={busy || !question.trim()} onClick={() => void ask()}>Ask Aux</button></div>
      </DetailPane>}
      <div className="row">{confirmClear ? <><span className="hint">Forget all saved articles in this Space?</span><button className="btn sm" disabled={busy} onClick={() => void forget()}>Forget all</button><button className="btn sm ghost" disabled={busy} onClick={() => setConfirmClear(false)}>Cancel</button></> : <button className="btn sm ghost" disabled={busy} onClick={() => setConfirmClear(true)}>Forget all remembered articles…</button>}</div>
    </>}
    {error && <p className="field-error" role="alert">{error}</p>}
  </section>;
}
