import { useEffect, useRef, useState } from "react";
import type { InlineAssistCapture, Run, RunTranscriptItem } from "@aux/contracts";
import { call, useStore } from "../store";
import "./TextProposal.css";

type Proposal = Extract<RunTranscriptItem, { kind: "text-proposal" }>;

/** Review happens before the only page write. Runtime rechecks the persisted proposal and captured field. */
export function TextProposal({ run, proposal, readOnly = false }: { run: Run; proposal: Proposal; readOnly?: boolean }) {
  const page = useStore((state) => state.pages.find((item) => item.pageId === state.activePageId));
  const [capture, setCapture] = useState<InlineAssistCapture | null>(null);
  const [busy, setBusy] = useState(false);
  const [inserted, setInserted] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(0);
  const pending = useRef(false);
  const stale = !!capture && (!page || page.pageId !== capture.pageId || page.url !== capture.url
    || page.documentEpoch !== capture.documentEpoch || page.controller === "agent" || page.controller === "external"
    || page.viewStatus === "detached" || page.ownedByRuntime);

  useEffect(() => () => {
    ++request.current;
    if (capture) void call("agent.inlineAssist.cancel", { captureId: capture.captureId }).catch(() => {});
  }, [capture]);

  async function review() {
    if (pending.current || readOnly || inserted || !page || page.ownedByRuntime || page.backend !== "aux"
      || page.controller === "agent" || page.controller === "external") return;
    pending.current = true;
    const version = ++request.current;
    const selected = { pageId: page.pageId, expectedUrl: page.url, expectedDocumentEpoch: page.documentEpoch };
    setBusy(true); setError("");
    try {
      const captured = await call("agent.inlineAssist.capture", selected);
      if (version !== request.current) { void call("agent.inlineAssist.cancel", { captureId: captured.captureId }).catch(() => {}); return; }
      const current = useStore.getState();
      const active = current.pages.find((item) => item.pageId === current.activePageId);
      if (!active || active.pageId !== captured.pageId || active.url !== captured.url
        || active.documentEpoch !== captured.documentEpoch) {
        void call("agent.inlineAssist.cancel", { captureId: captured.captureId }).catch(() => {});
        throw new Error("The selected page changed. Review the field again.");
      }
      setCapture(captured);
    } catch (reason) { if (version === request.current) setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { if (version === request.current) { pending.current = false; setBusy(false); } }
  }

  async function insert() {
    if (pending.current || readOnly || inserted || stale || !capture || run.status !== "completed") return;
    pending.current = true;
    const version = ++request.current;
    setBusy(true); setError("");
    try {
      const result = await call("agent.inlineAssist.apply", { captureId: capture.captureId,
        replacement: proposal.text, proposalRunId: run.runId });
      if (version === request.current && result.applied) { setInserted(true); setCapture(null); }
    } catch (reason) { if (version === request.current) setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { if (version === request.current) { pending.current = false; setBusy(false); } }
  }

  return <section className="text-proposal" aria-label="Text proposal">
    <header><strong>Text ready to insert</strong><span>From this completed run</span></header>
    <pre>{proposal.text}</pre>
    {!inserted && !capture && <button className="btn sm" disabled={busy || readOnly || !page || page.ownedByRuntime || page.backend !== "aux"}
      onClick={() => void review()}>{busy ? "Checking field…" : "Review Insert"}</button>}
    {capture && !inserted && <div className="text-proposal-review">
      <p>Insert into <strong>{capture.fieldLabel}</strong> on {capture.origin}. {capture.mode === "selection" ? "The selected text will be replaced." : "The field text will be replaced."}</p>
      <div><strong>Current text</strong><pre>{capture.sourceText || "(empty field)"}</pre></div>
      {capture.maxReplacementLength !== undefined && proposal.text.length > capture.maxReplacementLength &&
        <p role="alert">This proposal is too long for the focused field.</p>}
      {stale && <p role="alert">The page changed. Review the field again.</p>}
      <button className="btn sm primary" disabled={busy || stale || readOnly || proposal.text.length > (capture.maxReplacementLength ?? 12_000)}
        onClick={() => void insert()}>{busy ? "Inserting…" : "Insert text"}</button>
      <button className="btn sm ghost" disabled={busy} onClick={() => { setCapture(null); setError(""); }}>Cancel</button>
    </div>}
    {inserted && <output>Inserted into the page. Use Undo in that field (⌘Z) to revert the change.</output>}
    {error && <p role="alert">{error}</p>}
  </section>;
}
