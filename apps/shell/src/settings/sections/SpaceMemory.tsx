import { useEffect, useState } from "react";
import type { MemoryClaim, MemoryPipelineOverview } from "@aux/contracts";
import { bridge } from "../../bridge";
import { call } from "../../store";
import { useConfirm } from "../../ui/confirm";
import { SettingsField } from "../primitives";

type Source = { runId: string; goal: string; endedAt: number };
type Revision = { revisionId: string; capturedAt: number; claimCount: number; summary: string };

export function SpaceMemory({ workspaceId }: { workspaceId: string }) {
  const [enabled, setEnabled] = useState(false);
  const [overview, setOverview] = useState<MemoryPipelineOverview | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [inbox, setInbox] = useState<MemoryClaim[]>([]);
  const [claims, setClaims] = useState<MemoryClaim[]>([]);
  const [history, setHistory] = useState<Revision[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const { confirm, confirmation } = useConfirm();
  const sourcesWithNotes = [...new Set([...inbox, ...claims].map(note => note.sourceRunId))];

  async function forget(request: { claimId?: string; sourceRunId?: string; all?: true }, description: string) {
    if (!await confirm({ title: "Forget Space memory?", description,
      confirmLabel: "Forget permanently", cancelLabel: "Keep memory", danger: true })) return;
    await act(async () => { await call("memory.pipeline.forget", { workspaceId, ...request }); });
  }

  async function refresh(id = workspaceId) {
    const [policy, current, available, pending, accepted, revisions] = await Promise.all([
      call("memory.pipeline.policy", { workspaceId: id }),
      call("memory.pipeline.overview", { workspaceId: id }),
      call("memory.pipeline.sources", { workspaceId: id }),
      call("memory.pipeline.inbox", { workspaceId: id }),
      call("memory.pipeline.claims", { workspaceId: id }),
      call("memory.pipeline.history", { workspaceId: id }),
    ]);
    setEnabled(policy.enabled);
    setOverview(current);
    setSources(available);
    setInbox(pending);
    setClaims(accepted);
    setHistory(revisions);
    setSourceId(value => available.some(item => item.runId === value) ? value : available[0]?.runId ?? "");
  }

  useEffect(() => {
    if (!workspaceId) return;
    let live = true;
    void Promise.all([
      call("memory.pipeline.policy", { workspaceId }),
      call("memory.pipeline.overview", { workspaceId }),
      call("memory.pipeline.sources", { workspaceId }),
      call("memory.pipeline.inbox", { workspaceId }),
      call("memory.pipeline.claims", { workspaceId }),
      call("memory.pipeline.history", { workspaceId }),
    ]).then(([policy, current, available, pending, accepted, revisions]) => {
      if (!live) return;
      setEnabled(policy.enabled);
      setOverview(current);
      setSources(available);
      setInbox(pending);
      setClaims(accepted);
      setHistory(revisions);
      setSourceId(available[0]?.runId ?? "");
    }).catch(reason => {
      if (!live) return;
      if (/feature_unavailable|preview/.test(String(reason))) setPreview(true);
      else setError(String(reason));
    });
    return () => { live = false; };
  }, [workspaceId]);

  useEffect(() => bridge.onEvent(event => {
    if (event.type === "workspace.memory.updated" && event.payload.workspaceId === workspaceId)
      void refresh();
  }), [workspaceId]);

  async function act(work: () => Promise<void>) {
    setBusy(true);
    setError("");
    try { await work(); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(false); }
  }

  return <SettingsField label="Space memory" hint="Completed runs produce encrypted notes for your review. Only accepted notes appear in later runs. Memory is off by default.">
    {preview ? <p className="hint">Space memory is in preview in this build.</p> : <>
    {error && <p role="alert">{error}</p>}
    <label><input aria-label="Enable Space memory" type="checkbox" checked={enabled} disabled={!workspaceId || busy}
      onChange={event => void act(async () => {
        await call("memory.pipeline.setPolicy", { workspaceId, enabled: event.target.checked });
      })} /> Enable memory for this Space</label>
    {enabled && <>
      <div className="row">
        <select aria-label="Completed run for memory" value={sourceId} onChange={event => setSourceId(event.target.value)}>
          {sources.map(source => <option key={source.runId} value={source.runId}>{source.goal} · {source.runId}</option>)}
        </select>
        <button className="btn sm" disabled={busy || !sourceId} onClick={() => void act(async () => {
          await call("memory.pipeline.extractRun", { workspaceId, runId: sourceId });
        })}>Create review notes</button>
        <button className="btn sm" disabled={busy} onClick={() => void act(async () => {})}>Refresh memory</button>
      </div>
      {!sources.length && <p className="hint">No eligible completed runs are available for extraction. Sensitive and excluded pages are omitted.</p>}
      <p>{inbox.length} pending notes · {overview?.claimCount ?? 0} approved notes</p>
      {inbox.map(note => <fieldset className="field" key={note.claimId}>
        <legend>Memory note review</legend>
        <p>{note.text}</p>
        <p className="hint">Source run: <code>{note.sourceRunId}</code></p>
        <div className="row">
          <button className="btn sm" disabled={busy} onClick={() => void act(async () => {
            await call("memory.pipeline.review", { workspaceId, claimId: note.claimId, decision: "accept" });
          })}>Accept note</button>
          <button className="btn sm" disabled={busy} onClick={() => void act(async () => {
            await call("memory.pipeline.review", { workspaceId, claimId: note.claimId, decision: "discard" });
          })}>Discard note</button>
        </div>
      </fieldset>)}
      <p className="hint">Approved summary used in later runs</p>
      <pre>{overview?.summary || "No approved notes yet."}</pre>
      {!!sourcesWithNotes.length && <div className="row">
        <span className="hint">Remove notes from one source run and restorable revisions.</span>
        {sourcesWithNotes.map(runId => <button className="btn sm danger" key={runId} disabled={busy}
          onClick={() => void forget({ sourceRunId: runId }, `All notes from run ${runId} will be removed from current memory and every restorable revision. This cannot be undone.`)}>
          Forget run {runId}
        </button>)}
      </div>}
      {claims.map(claim => <div className="row" key={claim.claimId}>
        <span className="grow">{claim.text} <span className="hint">[run:{claim.sourceRunId}]</span></span>
        <button className="btn sm" disabled={busy} onClick={() => void forget({ claimId: claim.claimId },
          "This note will be removed from current memory and every restorable revision. This cannot be undone.")}>Forget note</button>
      </div>)}
      {(claims.length > 0 || inbox.length > 0 || history.some(revision => revision.claimCount > 0)) &&
        <button className="btn sm danger" disabled={busy} onClick={() => void forget({ all: true },
          "All pending and approved notes, including copies in restorable revisions, will be removed. This cannot be undone.")}>
          Forget all Space memory
        </button>}
      <details><summary>Memory history · {history.length} revisions</summary>
        {history.map(revision => <div className="field" key={revision.revisionId}>
          <p>{new Date(revision.capturedAt).toLocaleString()} · {revision.claimCount} notes</p>
          <pre>{revision.summary || "No approved notes."}</pre>
          <button className="btn sm" disabled={busy} onClick={() => void act(async () => {
            await call("memory.pipeline.revert", { workspaceId, revisionId: revision.revisionId });
          })}>Restore this revision</button>
        </div>)}
      </details>
    </>}
    </>}
    {confirmation}
  </SettingsField>;
}
