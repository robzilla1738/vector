import { staticFieldErrorProps as auxReserveStaticFieldErrorProps } from "../ui/class-props";
import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  GenerateResultParamsSchema,
  type GeneratedResult,
  type GeneratedResultSummary,
  type GeneratedResultSpec,
} from "@aux/contracts";
import { bridge } from "../bridge";
import { call, toast, useStore } from "../store";
import { guardCommandCompletion } from "../command-completion";
import { useConversationOwner } from "./ConversationControls";
import { useConversationAttachmentOwner } from "./ConversationAttachmentControls";
import { ResultPreviewControl } from "./ResultPreviewControls";
import { shellIconClose } from "../ui/icons";
import { GeneratedResultEditor, GeneratedResultTable } from "./GeneratedResultEditor";
import { AnswerMarkdown } from "./AnswerMarkdown";
import { ViewerFrame } from "./ViewerFrame";
import { staticExtraSmallIconButtonProps as auxClassExtraSmallIconButtonProps } from "../ui/class-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

/** Document bodies render inert Markdown; charts embed only verified PNG bytes. */
export function GeneratedResultPreview({
  artifactId,
  chatId,
  onClose,
  onVersionSaved,
  contextDisabled = false,
}: {
  artifactId: string;
  chatId: string;
  onClose(): void;
  onVersionSaved?: (artifactId: string) => void;
  contextDisabled?: boolean;
}) {
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [versions, setVersions] = useState<GeneratedResultSummary[]>([]);
  const [image, setImage] = useState<string | null>(null);
  const [draft, setDraft] = useState<GeneratedResultSpec | null>(null);
  const [editing, setEditing] = useState(false);
  const connected = useStore((state) => state.connected);
  const conversationCurrent = useConversationOwner(chatId, connected);
  const reference = useMemo(() => ({ artifactId }), [artifactId]);
  const referenceCurrent = useConversationAttachmentOwner(conversationCurrent, [reference]);
  const current = useCallback(() => referenceCurrent(reference), [reference, referenceCurrent]);
  const published = useRef<{ result: GeneratedResult; current: () => boolean } | null>(null);
  const recordCurrent = useConversationAttachmentOwner(current, result ? [result, ...versions] : []);
  const loadedCurrent = useCallback(
    (record: GeneratedResultSummary) =>
      !!result &&
      result.chatId === chatId &&
      result.artifactId === artifactId &&
      published.current?.result === result &&
      published.current.current === current &&
      recordCurrent(record),
    [result, chatId, artifactId, current, recordCurrent],
  );
  const draftIdentity = useMemo(() => ({ draft }), [draft]);
  const draftOwner = useRef(draftIdentity);
  const pending = useRef<object | null>(null);
  const latestOperation = useRef<object | null>(null);
  const [busy, setBusy] = useState(false);
  useLayoutEffect(() => {
    draftOwner.current = draftIdentity;
  }, [draftIdentity]);
  useLayoutEffect(() => {
    pending.current = null;
    latestOperation.current = null;
    setBusy(false);
    return () => {
      pending.current = null;
      latestOperation.current = null;
    };
  }, [current]);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  useEffect(() => {
    let live = true;
    setResult(null);
    setVersions([]);
    setImage(null);
    setEditing(false);
    setError("");
    if (!current()) return;
    void Promise.all([
      call("results.generated.get", { artifactId }),
      call("results.generated.versions", { artifactId }),
    ])
      .then(([file, history]) => {
        if (!live || !current()) return;
        if (file.chatId !== chatId) throw new Error("This result belongs to another conversation.");
        published.current = { result: file, current };
        setResult(file);
        setVersions(history);
        setDraft(file.spec);
        if (file.kind === "chart" && file.artifactId === artifactId)
          void call("artifacts.read", { artifactId })
            .then((data) => {
              if (
                live &&
                current() &&
                data.artifact.mediaType === "image/png" &&
                data.artifact.size <= 5 * 1024 * 1024
              )
                setImage(`data:image/png;base64,${data.dataBase64}`);
            })
            .catch((reason) => {
              if (live && current()) setError(String(reason));
            });
      })
      .catch((reason) => {
        if (live && current()) setError(String(reason));
      });
    return () => {
      live = false;
    };
  }, [artifactId, chatId, current, loadAttempt]);
  function operation(revision: boolean) {
    if (
      !result ||
      pending.current ||
      !loadedCurrent(result) ||
      (!revision && draft !== result.spec) ||
      (revision && contextDisabled)
    )
      return;
    const original = result,
      originalDraft = draftIdentity,
      token = {};
    pending.current = token;
    latestOperation.current = token;
    setBusy(true);
    if (revision) setError("");
    const delivering = () =>
      loadedCurrent(original) &&
      latestOperation.current === token &&
      (!revision || draftOwner.current === originalDraft);
    let errorHandled = false;
    const completion = (async () => {
      try {
        const ack = revision
          ? await call(
              "results.generate",
              GenerateResultParamsSchema.parse({
                chatId,
                sourceArtifactId: original.artifactId,
                filename: original.filename,
                spec: originalDraft.draft,
              }),
            )
          : await bridge.saveStoredArtifact(original.artifactId, original.filename);
        if (delivering()) {
          if (revision) {
            const next = ack as GeneratedResult;
            toast(`${next.filename} · v${next.revision} saved`);
            onVersionSaved?.(next.artifactId);
          } else if (ack) toast("Result exported");
        }
        return ack;
      } catch (reason) {
        if (revision && delivering()) {
          setError(errorMessage(reason));
          errorHandled = true;
        }
        throw reason;
      } finally {
        if (pending.current === token) {
          pending.current = null;
          if (current()) setBusy(false);
        }
      }
    })();
    return guardCommandCompletion(completion, () => delivering() && !errorHandled);
  }
  return (
    <ViewerFrame
      label="Generated result preview"
      title={result?.filename ?? "Generated result"}
      onClose={onClose}
      closeLabel="Close result preview"
      closeControl={
        <ResultPreviewControl
          command="close-generated-result-preview"
          current={current}
          invoke={onClose}
          {...auxClassExtraSmallIconButtonProps}
          aria-label="Close result preview"
        >
          {shellIconClose}
        </ResultPreviewControl>
      }
      metadata={
        result && (
          <>
            v{result.revision} · {result.kind.toUpperCase()} ·{" "}
            {Math.max(1, Math.ceil(result.byteLength / 1024))} KB ·{" "}
            {new Date(result.createdAt).toLocaleString()}
          </>
        )
      }
      toolbar={
        result && (
          <>
            <ResultPreviewControl
              command="toggle-generated-result-source"
              current={() => loadedCurrent(result)}
              invoke={() => setEditing((value) => !value)}
              {...smallGhostButtonProps}
              disabled={busy || contextDisabled}
              aria-pressed={editing}
            >
              {editing ? "Close editor" : "Revise"}
            </ResultPreviewControl>
            <ResultPreviewControl
              command="export-generated-result"
              current={() => loadedCurrent(result) && draft === result.spec}
              invoke={() => operation(false)}
              {...smallGhostButtonProps}
              disabled={busy || draft !== result.spec}
            >
              Export file…
            </ResultPreviewControl>
          </>
        )
      }
    >
      {error && (
        <p {...nativeAlertRoleProps} {...auxReserveStaticFieldErrorProps}>
          {error}
          {!result && " "}
          {!result && (
            <button
              type="button"
              {...smallGhostButtonProps}
              onClick={() => {
                if (current()) setLoadAttempt((attempt) => attempt + 1);
              }}
            >
              Retry
            </button>
          )}
        </p>
      )}
      {!result ? (
        <output data-block {...staticHintProps}>
          {error ? "Result unavailable." : "Loading generated result…"}
        </output>
      ) : (
        <>
          <details>
            <summary>File details · version {result.revision}</summary>
            <p {...staticHintProps}>
              Generated from conversation turn {result.sourceRunId}. SHA-256 {result.sha256.slice(0, 16)}…
            </p>
          </details>
          {versions.length > 1 && (
            <nav {...staticRowProps} aria-label="Result versions">
              {versions.map((version) => (
                <ResultPreviewControl
                  command="select-generated-result-version"
                  current={() =>
                    loadedCurrent(result) &&
                    loadedCurrent(version) &&
                    version.chatId === chatId &&
                    version.rootArtifactId === result.rootArtifactId
                  }
                  invoke={() => onVersionSaved?.(version.artifactId)}
                  className="btn sm ghost"
                  key={version.artifactId}
                  disabled={version.artifactId === artifactId}
                >
                  v{version.revision}
                </ResultPreviewControl>
              ))}
            </nav>
          )}
          {draft !== result.spec && (
            <p {...staticHintProps}>
              Unsaved edits. Save a new version before exporting.{" "}
              <button
                type="button"
                {...smallGhostButtonProps}
                disabled={busy}
                onClick={() => {
                  if (loadedCurrent(result) && !pending.current) setDraft(result.spec);
                }}
              >
                Discard edits
              </button>
            </p>
          )}
          {editing ? (
            <>
              {draft && (
                <GeneratedResultEditor
                  spec={draft}
                  disabled={busy}
                  onChange={(next) => {
                    if (loadedCurrent(result) && !pending.current) setDraft(next);
                  }}
                />
              )}
              <ResultPreviewControl
                command="save-generated-result-version"
                report={false}
                current={() => loadedCurrent(result)}
                invoke={() => operation(true)}
                {...smallButtonProps}
                disabled={busy || contextDisabled}
              >
                {busy ? "Saving…" : "Save new version"}
              </ResultPreviewControl>
            </>
          ) : (
            <div className="saved-result-content">
              <h3>{result.preview.title}</h3>
              {image ? (
                <img src={image} alt={result.preview.title} style={{ maxWidth: "100%", height: "auto" }} />
              ) : result.kind === "chart" ? (
                <output {...staticHintProps}>Loading chart image…</output>
              ) : null}
              {result.spec.kind === "docx" ? (
                <>
                  <AnswerMarkdown text={result.spec.paragraphs.join("\n\n")} />
                  {result.spec.tables.map((table, index) => (
                    <GeneratedResultTable key={index} table={table} />
                  ))}
                </>
              ) : result.spec.kind === "csv" ? (
                <GeneratedResultTable table={result.spec.table} />
              ) : result.spec.kind === "xlsx" ? (
                result.spec.sheets.map((table, index) => (
                  <details key={index} open={index === 0}>
                    <summary>{table.name}</summary>
                    <GeneratedResultTable table={table} />
                  </details>
                ))
              ) : result.spec.kind === "pptx" ? (
                <>
                  <p {...staticHintProps}>Each source section spans as many slides as its content needs.</p>
                  {result.spec.slides.map((slide, index) => (
                    <details key={index} open={index === 0}>
                      <summary>
                        Section {index + 1}: {slide.title}
                      </summary>
                      <ul>
                        {slide.bullets.map((bullet, item) => (
                          <li key={item}>{bullet}</li>
                        ))}
                      </ul>
                      {slide.notes && <p {...staticHintProps}>Notes: {slide.notes}</p>}
                    </details>
                  ))}
                </>
              ) : (
                <ul>
                  {result.preview.lines.map((line, index) => (
                    <li key={index}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </ViewerFrame>
  );
}
