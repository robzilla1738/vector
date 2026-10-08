import { useCallback, useId, useLayoutEffect, useRef, useState } from "react";
import { bridge } from "../bridge";
import { call } from "../store";
import { guardCommandCompletion } from "../command-completion";
import { errorMessage } from "../error-message";
import { PreferenceAction, usePreferenceCommand } from "../settings/sections/preference-command";
import { smallButtonProps } from "../ui/button-props";
import { staticHintProps } from "../ui/class-props";
import { nativeCheckboxTypeProps } from "../ui/native-attribute-props";

type ReceiptOwner = { taskId: string; revision: number; current(): boolean };
type Attempt = {
  owner: ReceiptOwner;
  exportId: string;
  phase: "preparing" | "saving";
  cancellation: AbortController;
  retirement?: Promise<void>;
};
type ExportState = {
  owner: ReceiptOwner;
  phase: "idle" | "preparing" | "saving" | "cancelling";
  message: string;
  error: string;
};

function retire(attempt: Attempt): Promise<void> {
  return (attempt.retirement ??= call("tasks.exportReceipt", {
    action: "retire",
    exportId: attempt.exportId,
  }).then((result) => {
    if (result.status !== "retired" || result.exportId !== attempt.exportId)
      throw new Error("The temporary receipt export could not be retired.");
  }));
}

export function TaskReceiptExport({ owner }: { owner: ReceiptOwner }) {
  const scopeId = useId();
  const [choice, setChoice] = useState<{ owner: ReceiptOwner; include: boolean }>({ owner, include: false });
  const [state, setState] = useState<ExportState>({ owner, phase: "idle", message: "", error: "" });
  const pending = useRef<{ attempt: Attempt; completion: Promise<string | null> } | null>(null);
  const include = choice.owner === owner && choice.include;
  const visible = state.owner === owner ? state : { phase: "idle", message: "", error: "" };
  const busy = visible.phase !== "idle";
  useLayoutEffect(
    () => () => {
      const attempt = pending.current?.attempt;
      // A claimed artifact stays alive until the original native chooser/copy ACK.
      if (attempt?.owner === owner && attempt.phase === "preparing") void retire(attempt).catch(() => {});
    },
    [owner],
  );
  const select = useCallback(
    (original: HTMLInputElement, originalEvent?: Event) => {
      if (!owner.current()) throw new Error("Choose this receipt’s current control.");
      setChoice({ owner, include: originalEvent ? original.checked : !original.checked });
    },
    [owner],
  );
  const [inputRef, toggle] = usePreferenceCommand<HTMLInputElement>(
    "toggle-task-receipt-captured-text",
    scopeId,
    select,
  );
  function exportReceipt() {
    if (!owner.current()) throw new Error("Choose this receipt’s current export.");
    if (pending.current?.attempt.owner === owner) return pending.current.completion;
    const attempt: Attempt = {
      owner,
      exportId: crypto.randomUUID(),
      phase: "preparing",
      cancellation: new AbortController(),
    };
    setState({ owner, phase: "preparing", message: "", error: "" });
    let cleanupWarning = "";
    const completion = guardCommandCompletion(
      (async () => {
        try {
          const prepared = await call("tasks.exportReceipt", {
            action: "prepare",
            exportId: attempt.exportId,
            taskId: owner.taskId,
            expectedRevision: owner.revision,
            includeCapturedText: include,
          });
          if (attempt.cancellation.signal.aborted) return null;
          if (!owner.current()) throw new Error("This receipt’s export was retired before the file chooser.");
          if (prepared.status !== "prepared" || prepared.exportId !== attempt.exportId)
            throw new Error("This receipt export changed. Export the saved receipt again.");
          attempt.phase = "saving";
          setState({ owner, phase: "saving", message: "", error: "" });
          return await bridge.saveStoredArtifact(prepared.artifactId, prepared.filename);
        } catch (reason) {
          if (attempt.cancellation.signal.aborted) return null;
          throw reason;
        } finally {
          try {
            await retire(attempt);
          } catch {
            cleanupWarning = "Temporary export cleanup is pending.";
          }
        }
      })()
        .then((destination) => {
          if (owner.current())
            setState({
              owner,
              phase: "idle",
              message: [destination ? "Receipt exported." : "Export canceled.", cleanupWarning]
                .filter(Boolean)
                .join(" "),
              error: "",
            });
          return destination;
        })
        .catch((reason) => {
          if (owner.current())
            setState({
              owner,
              phase: "idle",
              message: cleanupWarning,
              error: errorMessage(reason).replace(/^Error invoking remote method [^:]+: Error: /, ""),
            });
          throw reason;
        })
        .finally(() => {
          if (pending.current?.completion === completion) pending.current = null;
        }),
      () => owner.current(),
    );
    pending.current = { attempt, completion };
    return completion;
  }
  function cancel() {
    const attempt = pending.current?.attempt;
    if (!owner.current() || attempt?.owner !== owner || attempt.phase !== "preparing")
      throw new Error("Choose this receipt’s current export preparation.");
    attempt.cancellation.abort();
    setState({ owner, phase: "cancelling", message: "", error: "" });
    return guardCommandCompletion(retire(attempt), () => owner.current());
  }
  return (
    <div className="receipt-export">
      <PreferenceAction
        {...smallButtonProps}
        command="export-task-receipt"
        scopeId={scopeId}
        disabled={busy}
        invoke={exportReceipt}
      >
        {visible.phase === "saving"
          ? "Choose where to save…"
          : busy
            ? "Preparing receipt…"
            : "Export receipt as Markdown"}
      </PreferenceAction>
      {(visible.phase === "preparing" || visible.phase === "cancelling") && (
        <PreferenceAction
          {...smallButtonProps}
          command="cancel-task-receipt-export"
          scopeId={scopeId}
          disabled={visible.phase === "cancelling"}
          invoke={cancel}
        >
          {visible.phase === "cancelling" ? "Canceling…" : "Cancel export"}
        </PreferenceAction>
      )}
      <label>
        <input
          ref={inputRef}
          data-command-id="toggle-task-receipt-captured-text"
          {...nativeCheckboxTypeProps}
          checked={include}
          disabled={busy}
          onChange={toggle}
        />{" "}
        Include captured text
      </label>
      <span {...staticHintProps}>
        Exports objective, evidence summaries and sources, reviews, unresolved actions, run history and
        recorded usage. Include captured text adds the complete saved document text and other captured
        evidence.
      </span>
      {visible.message && <output data-block>{visible.message}</output>}
      {visible.error && <p role="alert">{visible.error}</p>}
    </div>
  );
}
