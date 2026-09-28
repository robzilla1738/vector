import { useEffect, useRef, useState } from "react";
import type { Run, RunTranscriptItem, RunTranscriptProjection } from "@aux/contracts";
import { call } from "../store";
import { ViewerFrame } from "../components/ViewerFrame";

const MAX_TEXT_BYTES = 128 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
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

/** Rehydrates from durable runs.get on mount and on status change. Stream deltas never grant citation trust. */
export function RunTranscriptDetails({ run }: { run: Run }) {
  const [projection, setProjection] = useState<RunTranscriptProjection | null>(null);
  const [selected, setSelected] = useState<ArtifactItem | null>(null);
  const [preview, setPreview] = useState<{ text?: string; image?: string } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const previewRequest = useRef(0);

  useEffect(() => {
    let active = true;
    ++previewRequest.current;
    setProjection(null);
    setSelected(null);
    setPreview(null);
    setError("");
    void call("runs.get", { runId: run.runId }).then((response) => {
      if (active && response.transcript?.runId === run.runId) setProjection(response.transcript);
    }).catch(() => { /* RunPanel's existing load/failure path remains authoritative. */ });
    return () => { active = false; ++previewRequest.current; };
  }, [run.runId, run.status]);

  const artifacts = projection?.items.filter((item): item is ArtifactItem => item.kind === "artifact") ?? [];
  const citations = projection?.items.filter((item) => item.kind === "citation") ?? [];
  const recovery = projection?.items.find((item) => item.kind === "recovery");

  async function open(artifact: ArtifactItem) {
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
      if (encoded.length > Math.ceil(Math.max(MAX_TEXT_BYTES, MAX_IMAGE_BYTES) / 3) * 4 + 4)
        throw new Error("A safe inline preview is unavailable for this file type or size.");
      if (IMAGE_TYPES.has(artifact.mediaType) && size <= MAX_IMAGE_BYTES) {
        if (atob(encoded).length !== size) throw new Error("The saved artifact size does not match its contents.");
        setPreview({ image: `data:${artifact.mediaType};base64,${encoded}` });
      } else if (TEXT_TYPES.has(artifact.mediaType) && size <= MAX_TEXT_BYTES) {
        if (encoded.length > Math.ceil(MAX_TEXT_BYTES / 3) * 4 + 4)
          throw new Error("A safe inline preview is unavailable for this file type or size.");
        const raw = atob(encoded);
        if (raw.length !== size) throw new Error("The saved artifact size does not match its contents.");
        const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
        setPreview({ text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) });
      } else {
        throw new Error("A safe inline preview is unavailable for this file type or size.");
      }
    } catch (reason) {
      if (request === previewRequest.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      if (request === previewRequest.current) setLoading(false);
    }
  }

  if (!citations.length && !artifacts.length && !recovery) return null;
  return <section className="run-section transcript-details" aria-label="Run evidence and recovery">
    {citations.length > 0 && <details className="transcript-citations"><summary>Verified evidence · {citations.length}</summary>
      <ul>{citations.map((item, index) => item.kind === "citation" && <li key={`${item.observationId}-${index}`}>
        <blockquote>{item.quote}</blockquote>
        {item.artifactId && artifacts.some((artifact) => artifact.artifactId === item.artifactId) &&
          <button className="btn sm ghost" onClick={() => void open(artifacts.find((artifact) => artifact.artifactId === item.artifactId)!)}>Inspect cited snapshot</button>}
      </li>)}</ul>
    </details>}
    {artifacts.length > 0 && <details className="transcript-artifacts"><summary>Saved artifacts · {artifacts.length}</summary>
      <ul>{artifacts.map((item) => <li key={item.artifactId}><button className="btn sm ghost" onClick={() => void open(item)}>
        {item.mediaType} · {Math.max(1, Math.ceil(item.size / 1024))} KB
      </button></li>)}</ul>
    </details>}
    {recovery?.kind === "recovery" && <output className="run-failure"><strong>{recovery.state.replaceAll("_", " ")}</strong> {recovery.description} {RECOVERY_GUIDANCE[recovery.action]}</output>}
    {selected && <ViewerFrame label="Saved run artifact" title={selected.mediaType} closeLabel="Close artifact" onClose={() => { ++previewRequest.current; setSelected(null); setPreview(null); setError(""); }}
      metadata={`${Math.max(1, Math.ceil(selected.size / 1024))} KB · ${selected.artifactId}`}>
      {loading ? <output data-block>Loading artifact…</output> : error ? <p role="alert">{error}</p>
        : preview?.image ? <img src={preview.image} alt="Saved run artifact" style={{ maxWidth: "100%" }} />
          : preview?.text !== undefined ? <pre>{preview.text}</pre> : null}
    </ViewerFrame>}
  </section>;
}
