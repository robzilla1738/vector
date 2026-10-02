import { useEffect, useRef, useState } from "react";
import { ObservationSchema, type Run, type RunTranscriptItem, type RunTranscriptProjection, type Suspension } from "@aux/contracts";
import { call, useStore } from "../store";
import { ViewerFrame } from "../components/ViewerFrame";
import { SuspensionPanel } from "../composer/SuspensionPanel";
import { TextProposal } from "./TextProposal";
import { ErrorItem, ToolFold, WaitingItem } from "./TranscriptActivity";
import { IsolatedArtifactHtml } from "./IsolatedArtifactHtml";

const MAX_TEXT_BYTES = 128 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_HTML_BYTES = 256 * 1024;
const IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const TEXT_TYPES = new Set(["text/plain", "text/markdown", "text/csv", "application/json"]);
const RECOVERY_GUIDANCE = {
  answer: "Answer the question to continue.",
  wait: "Resume when ready.",
  retry: "Review the failure, then retry if appropriate.",
  inspect: "Inspect the recorded work before retrying.",
  settings: "Check model settings before retrying.",
  revise: "Revise the request before retrying.",
  none: "Review the run details.",
} as const;

type ArtifactItem = Extract<RunTranscriptItem, { kind: "artifact" }>;
type CitationItem = Extract<RunTranscriptItem, { kind: "citation" }>;
type SourceRef = { pageId: string; url: string; documentEpoch: number };

/** Rehydrates from durable runs.get on mount and on status change. Stream deltas never grant citation trust. */
export function RunTranscriptDetails({ run, question, readOnly = false, answerInComposer = false }: {
  run: Run; question?: string; readOnly?: boolean; answerInComposer?: boolean;
}) {
  const [projection, setProjection] = useState<RunTranscriptProjection | null>(null);
  const [suspension, setSuspension] = useState<Suspension | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [loadError, setLoadError] = useState("");
  const [selected, setSelected] = useState<ArtifactItem | null>(null);
  const [preview, setPreview] = useState<{ text?: string; image?: string; html?: string; source?: SourceRef } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [openingSource, setOpeningSource] = useState(false);
  const previewRequest = useRef(0);

  useEffect(() => {
    let active = true;
    ++previewRequest.current;
    setProjection(null);
    setSuspension(null);
    setHydrated(false);
    setLoadError("");
    setSelected(null);
    setPreview(null);
    setError("");
    void call("runs.get", { runId: run.runId }).then((response) => {
      if (active && response.run.runId === run.runId && response.run.status === run.status) {
        if (response.transcript?.runId === run.runId) setProjection(response.transcript);
        setSuspension(response.suspension?.runId === run.runId ? response.suspension : null);
        setHydrated(true);
      }
    }).catch(() => { if (active) setLoadError("The current request could not be loaded."); });
    return () => { active = false; ++previewRequest.current; };
  }, [run.runId, run.status, run.statusMessage, refresh]);

  const artifacts = projection?.items.filter((item): item is ArtifactItem => item.kind === "artifact") ?? [];
  const proposals = projection?.items.filter((item): item is Extract<RunTranscriptItem, { kind: "text-proposal" }> => item.kind === "text-proposal") ?? [];
  const tools = projection?.items.filter((item): item is Extract<RunTranscriptItem, { kind: "tool" }> => item.kind === "tool") ?? [];
  const toolSummary = projection?.items.find((item): item is Extract<RunTranscriptItem, { kind: "tool-summary" }> => item.kind === "tool-summary");
  const waiting = projection?.items.find((item): item is Extract<RunTranscriptItem, { kind: "waiting" }> => item.kind === "waiting");
  const errorItem = projection?.items.find((item): item is Extract<RunTranscriptItem, { kind: "error" }> => item.kind === "error");
  const citations = projection?.items.filter((item) => item.kind === "citation") ?? [];
  // RunPanel already owns the actionable failure card when a typed failure exists.
  const recovery = run.failure || run.error ? undefined : projection?.items.find((item) => item.kind === "recovery");

  async function open(artifact: ArtifactItem, citation?: CitationItem) {
    if (!artifacts.some((item) => item.artifactId === artifact.artifactId)) return;
    const request = ++previewRequest.current;
    setSelected(artifact); setPreview(null); setError(""); setLoading(true);
    try {
      const response = await call("artifacts.read", { artifactId: artifact.artifactId });
      if (request !== previewRequest.current) return;
      if (response.artifact.runId !== run.runId || response.artifact.artifactId !== artifact.artifactId
        || response.artifact.status !== "complete" || response.artifact.mediaType !== artifact.mediaType
        || response.artifact.size !== artifact.size)
        throw new Error("This artifact no longer belongs to the selected run.");
      const size = response.artifact.size;
      const encoded = response.dataBase64;
      if (encoded.length > Math.ceil(Math.max(MAX_TEXT_BYTES, MAX_IMAGE_BYTES, MAX_HTML_BYTES) / 3) * 4 + 4)
        throw new Error("A safe inline preview is unavailable for this file type or size.");
      if (IMAGE_TYPES.has(artifact.mediaType) && size <= MAX_IMAGE_BYTES) {
        if (atob(encoded).length !== size) throw new Error("The saved artifact size does not match its contents.");
        setPreview({ image: `data:${artifact.mediaType};base64,${encoded}` });
      } else if ((TEXT_TYPES.has(artifact.mediaType) && size <= MAX_TEXT_BYTES)
        || (artifact.mediaType === "text/html" && size <= MAX_HTML_BYTES)
        || (citation && artifact.mediaType === "application/json" && size <= MAX_TEXT_BYTES)) {
        const limit = artifact.mediaType === "text/html" ? MAX_HTML_BYTES : MAX_TEXT_BYTES;
        if (encoded.length > Math.ceil(limit / 3) * 4 + 4)
          throw new Error("A safe inline preview is unavailable for this file type or size.");
        const raw = atob(encoded);
        if (raw.length !== size) throw new Error("The saved artifact size does not match its contents.");
        const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
        const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        if (artifact.mediaType === "text/html") setPreview({ html: text });
        else if (citation && citation.artifactId === artifact.artifactId && response.artifact.pageId
          && run.pageIds.includes(response.artifact.pageId) && artifact.mediaType === "application/json") {
          let parsed: unknown;
          try { parsed = JSON.parse(text); } catch { throw new Error("The cited page snapshot could not be read."); }
          const observation = ObservationSchema.safeParse(parsed);
          const observedText = observation.success
            ? [observation.data.content.title, ...observation.data.content.headings, observation.data.content.text].join("\n") : "";
          if (!observation.success || observation.data.pageId !== response.artifact.pageId
            || !observedText.includes(citation.quote)
            || !/^https?:\/\//i.test(observation.data.content.url))
            throw new Error("The cited page snapshot no longer matches this source.");
          setPreview({ text: observation.data.content.text,
            source: { pageId: observation.data.pageId, url: observation.data.content.url,
              documentEpoch: observation.data.documentEpoch } });
        } else setPreview({ text });
      } else {
        throw new Error("A safe inline preview is unavailable for this file type or size.");
      }
    } catch (reason) {
      if (request === previewRequest.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (request === previewRequest.current) setLoading(false);
    }
  }

  async function openSource() {
    const source = preview?.source;
    if (!source || !selected || !run.pageIds.includes(source.pageId) || openingSource) return;
    const request = previewRequest.current;
    setOpeningSource(true);
    setError("");
    try {
      const pages = await call("pages.list", {});
      if (request !== previewRequest.current) return;
      const page = pages.find((item) => item.pageId === source.pageId);
      if (!page || page.url !== source.url || page.documentEpoch !== source.documentEpoch
        || page.ownedByRuntime || (page.viewStatus !== "visible" && page.viewStatus !== "hidden")
        || (page.controller !== "human" && page.controller !== "none"))
        throw new Error("The cited page changed or is unavailable. The saved snapshot is still available above.");
      await useStore.getState().activate(source.pageId);
    } catch (reason) {
      if (request === previewRequest.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally { if (request === previewRequest.current) setOpeningSource(false); }
  }

  if (!citations.length && !artifacts.length && !proposals.length && !tools.length && !recovery && !waiting && !errorItem && run.status !== "needs_input") return null;
  return <section className="run-section transcript-details" aria-label="Run evidence and recovery">
    {waiting && waiting.state !== "needs_input" && <WaitingItem item={waiting} />}
    {run.status === "needs_input" && <SuspensionPanel run={run} suspension={suspension} hydrated={hydrated} question={question} readOnly={readOnly} answerInComposer={answerInComposer} />}
    {run.status === "needs_input" && loadError && <p role="alert">{loadError} <button className="btn sm" onClick={() => setRefresh((value) => value + 1)}>Retry loading</button></p>}
    {proposals.map((item, index) => <TextProposal key={`${run.runId}-${index}`} run={run} proposal={item} readOnly={readOnly} />)}
    <ToolFold tools={tools} summary={toolSummary} />
    {citations.length > 0 && <details className="transcript-citations"><summary>Verified evidence · {citations.length}</summary>
      <ul>{citations.map((item, index) => item.kind === "citation" && <li key={`${item.observationId}-${index}`}>
        <blockquote>{item.quote}</blockquote>
        {item.artifactId && artifacts.some((artifact) => artifact.artifactId === item.artifactId) &&
          <button className="btn sm ghost" onClick={() => void open(artifacts.find((artifact) => artifact.artifactId === item.artifactId)!, item)}>Inspect cited snapshot</button>}
      </li>)}</ul>
    </details>}
    {artifacts.length > 0 && <details className="transcript-artifacts"><summary>Saved artifacts · {artifacts.length}</summary>
      <ul>{artifacts.map((item) => <li key={item.artifactId}><button className="btn sm ghost" onClick={() => void open(item)}>
        {item.mediaType} · {Math.max(1, Math.ceil(item.size / 1024))} KB
      </button></li>)}</ul>
    </details>}
    {errorItem && (run.failure || run.error ? <details className="transcript-error-details"><summary>Error details</summary><ErrorItem item={errorItem} /></details> : <ErrorItem item={errorItem} />)}
    {recovery?.kind === "recovery" && recovery.state !== "needs_input" && !errorItem && <output className="run-failure"><strong>{recovery.state.replaceAll("_", " ")}</strong> {recovery.description} {RECOVERY_GUIDANCE[recovery.action]}</output>}
    {selected && <ViewerFrame label="Saved run artifact" title={selected.mediaType} closeLabel="Close artifact" onClose={() => { ++previewRequest.current; setSelected(null); setPreview(null); setError(""); }}
      metadata={`${Math.max(1, Math.ceil(selected.size / 1024))} KB · ${selected.artifactId}`}>
      {loading ? <output data-block>Loading artifact…</output> : preview?.image ? <img src={preview.image} alt="Saved run artifact" style={{ maxWidth: "100%" }} />
        : preview?.html !== undefined ? <IsolatedArtifactHtml key={selected.artifactId} html={preview.html} />
          : preview?.text !== undefined ? <pre>{preview.text}</pre> : null}
      {preview?.source && <button className="btn sm" disabled={openingSource} onClick={() => void openSource()}>
        {openingSource ? "Checking cited page…" : "Open cited page"}
      </button>}
      {error && <p role="alert">{error}</p>}
    </ViewerFrame>}
  </section>;
}
