import { useRef, useState } from "react";
import type { WorkspaceMemory } from "@aux/contracts";
import { memoryOrigin } from "@aux/contracts/memory-context";
import { call } from "../store";

export function MemoryExclusions({ memory, disabled, onSaved }: { memory: WorkspaceMemory; disabled: boolean; onSaved(memory: WorkspaceMemory): void }) {
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [stale, setStale] = useState(false);
  const pending = useRef(false);
  const origins = memory.excludedOrigins ?? [];
  async function save(next: string[]) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError(""); setStale(false);
    try {
      const saved = await call("workspaces.memory.set", { workspaceId: memory.workspaceId, expectedRevision: memory.revision, content: memory.content, excludedOrigins: next });
      setAddress(""); onSaved(saved);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); setStale(true); }
    finally { pending.current = false; setBusy(false); }
  }
  async function reload() {
    if (pending.current) return;
    pending.current = true; setBusy(true);
    try { onSaved(await call("workspaces.memory.get", { workspaceId: memory.workspaceId })); setStale(false); setError(""); }
    catch (reason) { setError(String(reason)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <details className="memory-exclusions"><summary>Excluded sites{origins.length > 0 ? ` · ${origins.length}` : ""}</summary>
    <p className="hint">Notes sourced from these addresses stay saved and searchable, but are excluded from new replies in this Space. This does not restrict browsing or explicitly attached pages.</p>
    <p className="hint">Each entry covers the exact site address shown, including its protocol and port. Subdomains are separate. Notes without a source and your Space overview are unaffected.</p>
    <form className="memory-exclusion-form" onSubmit={event => {
      event.preventDefault();
      try { const origin = memoryOrigin(address); if (origins.includes(origin)) { setError("This site is already excluded."); return; } void save([...origins, origin]); }
      catch { setError("Enter a full web address, such as https://example.com."); }
    }}><input type="url" aria-label="Site to exclude from memory" placeholder="https://example.com" value={address} maxLength={2048} disabled={disabled || busy} onChange={event => setAddress(event.target.value)}/><button className="btn sm" disabled={disabled || busy || !address.trim() || origins.length >= 100}>Exclude site</button></form>
    {origins.map(origin => <div className="memory-excluded-site" key={origin}><span>{origin}</span><button className="btn sm ghost" disabled={disabled || busy} aria-label={`Allow memory from ${origin}`} onClick={() => void save(origins.filter(value => value !== origin))}>Allow</button></div>)}
    {busy && <p className="hint" role="status">Updating exclusions…</p>}
    {error && <p className="field-error" role="alert">{error}{stale && <button className="btn sm ghost" disabled={busy} onClick={() => void reload()}>Reload saved memory</button>}</p>}
  </details>;
}
