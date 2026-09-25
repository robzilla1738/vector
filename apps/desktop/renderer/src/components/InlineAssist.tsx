import { useEffect, useRef, useState } from "react";
import { InlineAssistTextSchema, type InlineAssistCapture } from "@aux/contracts";
import { call, toast, useStore } from "../store";
import { I } from "./icons";
import "./inline-assist.css";

/** In-flow editor; the browser page remains visible while a person reviews the draft. */
export function InlineAssist() {
  const activePage = useStore(s => s.pages.find(page => page.pageId === s.activePageId));
  const setOverlay = useStore(s => s.setOverlay);
  const initial = useRef(activePage ? { pageId: activePage.pageId, url: activePage.url, documentEpoch: activePage.documentEpoch } : null);
  const [capture, setCapture] = useState<InlineAssistCapture | null>(null);
  const captureId = useRef<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"draft" | "apply" | null>(null);
  const [instruction, setInstruction] = useState("Improve clarity and tone without changing the meaning.");
  const [replacement, setReplacement] = useState("");
  const [drafted, setDrafted] = useState(false);
  const [error, setError] = useState("");
  const stale = !!capture && (!activePage || activePage.pageId !== capture.pageId || activePage.url !== capture.url
    || activePage.documentEpoch !== capture.documentEpoch);

  useEffect(() => {
    const page = initial.current;
    if (!page) { setError("Select a web page and focus a text field before opening Assist writing."); setLoading(false); return; }
    let live = true;
    void call("agent.inlineAssist.capture", { pageId: page.pageId, expectedUrl: page.url,
      expectedDocumentEpoch: page.documentEpoch }).then(result => {
      if (!live) { void call("agent.inlineAssist.cancel", { captureId: result.captureId }); return; }
      captureId.current = result.captureId;
      setCapture(result);
    }).catch(reason => {
      if (live) setError(reason instanceof Error ? reason.message : String(reason));
    }).finally(() => { if (live) setLoading(false); });
    return () => {
      live = false;
      if (captureId.current) void call("agent.inlineAssist.cancel", { captureId: captureId.current }).catch(() => {});
    };
  }, []);

  function close() { setOverlay(null); }
  async function draft() {
    if (!capture || stale || busy) return;
    setBusy("draft"); setError(""); setDrafted(false);
    try {
      const result = await call("agent.inlineAssist.draft", { captureId: capture.captureId, instruction });
      setReplacement(result.replacement); setDrafted(true);
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(null); }
  }
  async function apply() {
    if (!capture || !drafted || stale || busy) return;
    setBusy("apply"); setError("");
    try {
      await call("agent.inlineAssist.apply", { captureId: capture.captureId, replacement });
      toast("Text applied. Use Undo in the page to revert it.");
      close();
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { setBusy(null); }
  }

  return <section className="shelf slide-up inline-assist" aria-label="Assist writing">
    <div className="shelf-head"><span>{I.agentSm} Assist writing</span><span className="sp" />
      <button className="icon-btn sm" aria-label="Close Assist writing" onClick={close}>{I.close}</button></div>
    <div className="inline-assist-body">
      {loading ? <output>Reading the focused field…</output> : capture ? <>
        <p className="inline-assist-context">{capture.fieldLabel} · {capture.origin} · {capture.mode === "selection" ? "Replace selection" : "Replace field text"}</p>
        <p className="inline-assist-disclosure">Drafting sends this field’s text, your instruction, and the site domain to your model provider. The page changes only when you select Apply.</p>
        <div className="inline-assist-preview"><strong>Current text</strong><p>{capture.sourceText || "(empty field)"}</p></div>
        <label className="inline-assist-label">What should Aux change?<textarea value={instruction} maxLength={1000} disabled={busy !== null || stale}
          onChange={event => setInstruction(event.target.value)} /></label>
        {drafted && <label className="inline-assist-label">Review and edit the draft<textarea aria-label="Proposed field text" value={replacement}
          maxLength={Math.min(12_000, capture.maxReplacementLength ?? 12_000)} disabled={busy !== null || stale} onChange={event => setReplacement(event.target.value)} /></label>}
        {stale && <p role="alert">The page changed. Select the field and start again.</p>}
        {error && <p role="alert">{error}</p>}
        <div className="inline-assist-actions">
          <button className="btn sm" disabled={busy !== null || stale || instruction.trim().length < 2} onClick={() => void draft()}>{busy === "draft" ? "Drafting…" : drafted ? "Redraft" : "Draft with AI"}</button>
          {drafted && <button className="btn sm primary" disabled={busy !== null || stale || !InlineAssistTextSchema.safeParse(replacement).success || replacement.length > (capture.maxReplacementLength ?? 12_000)}
            onClick={() => void apply()}>{busy === "apply" ? "Applying…" : "Apply to field"}</button>}
          <button className="btn sm ghost" onClick={close}>Cancel</button>
        </div>
      </> : <><p role="alert">{error || "No editable field was found."}</p><button className="btn sm" onClick={close}>Close</button></>}
    </div>
  </section>;
}
