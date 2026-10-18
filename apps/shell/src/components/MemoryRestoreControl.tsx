import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { memoryClaimText, type MemoryRevisionPreview } from "@aux/contracts";
import { bridge } from "../bridge";
import { call } from "../store";
import { errorMessage } from "../error-message";
import { Dialog } from "../ui/dialog";
import { PreferenceAction } from "../settings/sections/preference-command";
import { MemoryDocument } from "./MemoryDocument";

type Props = {
  workspaceId: string;
  revisionId: string;
  disabled: boolean;
  current(): boolean;
  restore(preview: MemoryRevisionPreview): Promise<void>;
};

export function MemoryRestoreControl(props: Props) {
  return (
    <MemoryRestoreReview
      key={JSON.stringify([props.workspaceId, props.revisionId, bridge.windowId, bridge.privateMode])}
      {...props}
    />
  );
}

function MemoryRestoreReview({ workspaceId, revisionId, disabled, current, restore }: Props) {
  const scope = useId();
  const windowId = bridge.windowId;
  const owner = useRef({ active: true }).current;
  const parentCurrent = useRef(current);
  useLayoutEffect(() => {
    parentCurrent.current = current;
  }, [current]);
  useLayoutEffect(() => {
    owner.active = true;
    return () => {
      owner.active = false;
    };
  }, [owner]);
  const owns = () =>
    owner.active && !bridge.privateMode && bridge.windowId === windowId && parentCurrent.current();
  const [preview, setPreview] = useState<MemoryRevisionPreview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const epoch = useRef(0);
  useEffect(
    () =>
      bridge.onEvent((event) => {
        if (event.type === "workspace.memory.updated" && event.payload.workspaceId === workspaceId) {
          epoch.current++;
          setPreview(null);
          setError("");
        }
      }),
    [workspaceId],
  );
  const read = async () => {
    if (!owns() || disabled || pending.current) return;
    pending.current = true;
    const request = epoch.current;
    setBusy(true);
    try {
      const value = await call("memory.pipeline.previewRevision", { workspaceId, revisionId });
      if (!owns() || request !== epoch.current) return;
      if (value.workspaceId !== workspaceId || value.revisionId !== revisionId)
        throw new Error("The original Memory revision changed.");
      setPreview(value);
      setError("");
    } catch (reason) {
      if (owns() && request === epoch.current) setError(errorMessage(reason));
    } finally {
      pending.current = false;
      if (owns()) setBusy(false);
    }
  };
  const apply = async () => {
    if (!owns() || !preview || !preview.changes.length || disabled || pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      await restore(preview);
      if (owns()) {
        setPreview(null);
        setError("");
      }
    } catch (reason) {
      if (owns()) setError(errorMessage(reason));
    } finally {
      pending.current = false;
      if (owns()) setBusy(false);
    }
  };
  return (
    <>
      <PreferenceAction
        className="btn sm"
        command="restore-space-memory-revision"
        scopeId={scope}
        disabled={disabled || busy || bridge.privateMode}
        invoke={read}
      >
        {busy && !preview ? "Reading changes…" : "Restore this revision"}
      </PreferenceAction>
      {!preview && error && <p role="alert">{error}</p>}
      {preview && owns() && (
        <Dialog
          label="Review Memory restoration"
          className="aux-dialog-surface popup-material memory-restore-dialog"
          onClose={() => {
            if (!busy) setPreview(null);
          }}
        >
          <header>
            <h3>Review Memory restoration</h3>
            <p>Review the approved notes that will be added, changed or removed.</p>
          </header>
          {error && <p role="alert">{error}</p>}
          <div className="memory-restore-changes">
            {!preview.changes.length && (
              <p className="hint">The approved notes already match this revision.</p>
            )}
            {preview.changes.map((change) => (
              <section
                key={change.claimId}
                className="memory-restore-change"
                aria-label={`Changes in ${change.path}`}
              >
                <h4>
                  {change.path} · {change.before ? (change.after ? "Changed" : "Removed") : "Added"}
                </h4>
                <div>
                  <section>
                    <h5>Current</h5>
                    {change.before ? (
                      <MemoryDocument text={memoryClaimText(change.before)} />
                    ) : (
                      <p className="hint">No note.</p>
                    )}
                  </section>
                  <section>
                    <h5>After restoring</h5>
                    {change.after ? (
                      <MemoryDocument text={memoryClaimText(change.after)} />
                    ) : (
                      <p className="hint">This note will be removed.</p>
                    )}
                  </section>
                </div>
                <details>
                  <summary>Original source quote</summary>
                  <p>
                    {(change.after ?? change.before)!.source?.quote ?? (change.after ?? change.before)!.text}
                  </p>
                </details>
              </section>
            ))}
          </div>
          <footer>
            <PreferenceAction
              className="btn ghost"
              command="cancel-memory-revision-restore"
              scopeId={scope}
              disabled={busy}
              invoke={() => setPreview(null)}
            >
              Cancel
            </PreferenceAction>
            <PreferenceAction
              className="btn"
              command="refresh-memory-revision-preview"
              scopeId={scope}
              disabled={busy || disabled}
              invoke={read}
            >
              Refresh changes
            </PreferenceAction>
            <PreferenceAction
              className="btn primary"
              command="confirm-memory-revision-restore"
              scopeId={scope}
              disabled={busy || disabled || !preview.changes.length}
              invoke={apply}
            >
              {busy ? "Working…" : "Restore approved notes"}
            </PreferenceAction>
          </footer>
        </Dialog>
      )}
    </>
  );
}
