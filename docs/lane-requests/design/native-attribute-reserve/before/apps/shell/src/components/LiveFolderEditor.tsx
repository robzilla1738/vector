import { staticFieldInputProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import { useEffect, useRef, useState } from "react";
import type { LiveFolder } from "@aux/contracts";
import { LiveFolderSchema } from "@aux/contracts";
import { call, useStore } from "../store";
import { executeCommand } from "../commands";
import { Dialog } from "../ui/dialog";
import { staticGhostButtonProps as auxClassGhostButtonProps, staticPrimaryButtonProps as auxClassPrimaryButtonProps } from "../ui/class-props";

export function LiveFolderEditor({ folderId, onClose }: { folderId: string; onClose: () => void }) {
  const folder = useStore(state => state.layout.folders.find(folder => folder.id === folderId));
  const [kind, setKind] = useState<LiveFolder["kind"]>(folder?.live?.kind ?? "rss");
  const [connectionId, setConnectionId] = useState(folder?.live && "connectionId" in folder.live.config ? folder.live.config.connectionId : "");
  const [source, setSource] = useState<"awaiting-review" | "open-prs" | "assigned-issues" | "query">(folder?.live?.kind === "github" ? folder.live.config.source : "awaiting-review");
  const [query, setQuery] = useState(folder?.live?.kind === "github" ? folder.live.config.query ?? "" : "");
  const [url, setUrl] = useState(folder?.live?.kind === "rss" ? folder.live.config.url : "");
  const [routineId, setRoutineId] = useState(folder?.live?.kind === "routine" ? folder.live.config.routineId : "");
  const [accounts, setAccounts] = useState<{ id: string; name: string }[]>([]);
  const [routines, setRoutines] = useState<{ id: string; name: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const trigger = useRef(document.activeElement as HTMLElement | null);
  const alive = useRef({ value: true });
  useEffect(() => { const lifetime = alive.current; lifetime.value = true; return () => { lifetime.value = false; }; }, []);
  useEffect(() => {
    let live = true;
    const load = async () => {
      try {
        if (kind === "github") { const value = await call("github.connections.list"); if (live) setAccounts(value.filter(account => account.connected).map(account => ({ id: account.id, name: account.name }))); }
        if (kind === "calendar") { const value = await call("calendar.connections.list"); if (live) setAccounts(value.connections.filter(account => account.state === "active").map(account => ({ id: account.connectionId, name: account.label }))); }
        if (kind === "routine") { const value = await call("routines.list", {}); if (live) setRoutines(value.map(routine => ({ id: routine.routineId, name: routine.title }))); }
      } catch (error) { if (live) setError(errorMessage(error)); }
    };
    void load(); return () => { live = false; };
  }, [kind]);
  const save = async () => {
    if (busy) return;
    setBusy(true); setError("");
    try {
      const live = LiveFolderSchema.parse({ kind, refreshMinutes: 15, config: kind === "rss" ? { url } : kind === "routine" ? { routineId } : kind === "calendar" ? { connectionId } : { connectionId, source, ...(source === "query" ? { query } : {}) } });
      await executeCommand("save-live-folder", { payload: { folderId, live } }); if (alive.current.value) onClose();
    } catch (error) { if (alive.current.value) setError(errorMessage(error)); }
    finally { if (alive.current.value) setBusy(false); }
  };
  return <Dialog label="Live folder source" onClose={onClose} returnFocus={trigger} className="aux-dialog-surface organization-editor">
    <h3>{folder?.name ?? "Live folder"}</h3><p {...staticHintProps}>Live items refresh every 15 minutes. Opening an item keeps it as a tab in this folder.</p>
    <label>Source<select {...staticFieldInputProps} value={kind} onChange={event => { setKind(event.target.value as LiveFolder["kind"]); setConnectionId(""); setAccounts([]); setRoutines([]); setError(""); }}><option value="rss">RSS or Atom</option><option value="github">GitHub</option><option value="calendar">Today's Calendar events with links</option><option value="routine">Agent routine</option></select></label>
    {kind === "rss" && <label>Feed URL<input {...staticFieldInputProps} type="url" value={url} placeholder="https://example.com/feed.xml" maxLength={8192} onChange={event => setUrl(event.target.value)} /></label>}
    {(kind === "github" || kind === "calendar") && <label>Account<select {...staticFieldInputProps} value={connectionId} onChange={event => setConnectionId(event.target.value)}><option value="">Choose a connected account</option>{accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select>{!accounts.length && <span {...staticHintProps}>Connect an account in Settings before adding this source.</span>}</label>}
    {kind === "github" && <><label>Items<select {...staticFieldInputProps} value={source} onChange={event => setSource(event.target.value as typeof source)}><option value="awaiting-review">Awaiting my review</option><option value="open-prs">My open PRs</option><option value="assigned-issues">Assigned issues</option><option value="query">Custom query</option></select></label>{source === "query" && <label>GitHub search query<input {...staticFieldInputProps} value={query} maxLength={1000} onChange={event => setQuery(event.target.value)} placeholder="is:pr is:open repo:owner/project" /></label>}</>}
    {kind === "routine" && <label>Routine<select {...staticFieldInputProps} value={routineId} onChange={event => setRoutineId(event.target.value)}><option value="">Choose a routine that returns URL rows</option>{routines.map(routine => <option key={routine.id} value={routine.id}>{routine.name}</option>)}</select></label>}
    {error && <p role="alert" className="error-text">{error}</p>}
    <div className="dialog-actions"><button {...auxClassGhostButtonProps} onClick={onClose}>Cancel</button><button {...auxClassPrimaryButtonProps} data-command-id="save-live-folder" disabled={busy || !folder} onClick={() => void save()}>{busy ? "Saving…" : "Save live folder"}</button></div>
  </Dialog>;
}
