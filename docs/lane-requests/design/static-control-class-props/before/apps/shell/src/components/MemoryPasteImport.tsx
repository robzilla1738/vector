import { staticHintProps, staticRowProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { constructAwaitedOperation } from "./owned-operation-construction";
import { memoryControlElement, useMemoryElementControl } from "./memory-control-construction";
import { useEffect, useLayoutEffect, useMemo, useCallback, useState, type ReactNode } from "react";
import { MEMORY_PASTE_MAX_BYTES, type MemoryPastePreview, type MemoryPasteStatus, type ShellCommandId,  } from "@aux/contracts";
import { bridge } from "../bridge";
import { call, useStore } from "../store";



class PasteOwner {
  readonly workspaceId: string | null;
  readonly destinationId: string;
  readonly nativeId: string | null;
  constructor(
    readonly key: string,
    readonly snapshot?: object,
  ) {
    const [workspaceId, destinationId, nativeId] = key
      ? (JSON.parse(key) as [string | null, string, string | null, boolean])
      : [null, "", null];
    this.workspaceId = workspaceId;
    this.destinationId = destinationId;
    this.nativeId = nativeId;
  }
  current() {
    const actual = useStore
      .getState()
      .layout.spaces.filter((space) => space.workspaceId === this.destinationId);
    return (
      this.#active &&
      !bridge.privateMode &&
      !!this.destinationId &&
      actual.length === 1 &&
      actual[0]?.id === this.nativeId &&
      (!this.workspaceId || this.workspaceId === this.destinationId)
    );
  }
  nextRequest() {
    return ++this.#request;
  }
  begin() {
    if (this.#pending) return null;
    const operation = {};
    this.#pending = operation;
    return operation;
  }
  finish(operation: object) {
    if (this.#pending !== operation) return false;
    this.#pending = null;
    return true;
  }
  #active = true;
  #request = 0;
  #receiptRequest = 0;
  nextReceiptRequest() {
    return ++this.#receiptRequest;
  }
  currentReceiptRequest(request: number) {
    return this.current() && this.#receiptRequest === request;
  }
  #pending: object | null = null;
  get active() {
    return this.#active;
  }
  get request() {
    return this.#request;
  }
  retire() {
    this.#active = false;
  }
}
function PasteControl({
  command,
  scopeId,
  kind = "button",
  action,
  current,
  report,
  children,
  disabled,
  checked,
  value,
  className,
}: {
  command: ShellCommandId;
  scopeId: string;
  kind?: "button" | "select" | "checkbox";
  action(element: HTMLElement): unknown;
  current(): boolean;
  report(reason: unknown): void;
  children?: ReactNode;
  disabled?: boolean;
  checked?: boolean;
  value?: string;
  className?: string;
}) {
  const [attach, run] = useMemoryElementControl(command, scopeId, element => {
    if (!current()) throw new Error("The original Memory import controls changed.");
    return action(element);
  }, report);
  if (kind === "checkbox") return memoryControlElement("input", { type: "checkbox", ref: attach, "data-command-id": command, checked, disabled, onChange: run });
  if (kind === "select") return memoryControlElement("select", { ref: attach, "data-command-id": command, value, disabled, onChange: run }, children);
  return memoryControlElement("button", { type: "button", ref: attach, "data-command-id": command, className, disabled, onClick: run }, children);
}
/** Pasted drafts live only in this mounted form. Preview and commit are separate owner actions. */
export function MemoryPasteImport({
  workspaceId,
  onReview,
}: {
  workspaceId?: string;
  onReview?(workspaceId: string | null): void;
}) {
  const spaces = useStore((state) => state.layout.spaces);
  const destinations = spaces.filter(
    (space) => space.workspaceId && (!workspaceId || workspaceId === space.workspaceId),
  );
  const [selectedSpace, setSelectedSpace] = useState("");
  const matches = destinations.filter((space) => space.workspaceId === selectedSpace);
  const destination = matches.length === 1 ? matches[0] : undefined;
  const destinationId = destination?.workspaceId ?? "";
  const [text, setText] = useState("");
  const [previewState, publishPreview] = useState<{ owner: PasteOwner; value: MemoryPastePreview } | null>(
    null,
  );
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [policy, setPolicy] = useState<{ owner: PasteOwner; request: number; enabled: boolean } | null>(null);
  const [receiptState, publishReceipts] = useState<{ owner: PasteOwner; value: MemoryPasteStatus[] } | null>(
    null,
  );
  const [pendingState, setPendingState] = useState<{ owner: PasteOwner; operation: object } | null>(null);
  const [errorState, publishError] = useState<{ owner: PasteOwner; value: string } | null>(null);
  const privateMode = bridge.privateMode,
    nativeId = destination?.id;
  const ownerKey = String(JSON.stringify([workspaceId, destinationId, nativeId, privateMode]));
  const owner = useMemo(() => new PasteOwner(ownerKey), [ownerKey]);
  const preview = previewState?.owner === owner ? previewState.value : null;
  const receipts = receiptState?.owner === owner ? receiptState.value : [];
  const busy = pendingState?.owner === owner;
  const error = errorState?.owner === owner ? errorState.value : "";
  const setPreview = (value: MemoryPastePreview | null) => publishPreview(value ? { owner, value } : null);
  const setReceipts = (value: MemoryPasteStatus[]) => publishReceipts({ owner, value });
  const setError = (value: string) => publishError({ owner, value });
  const draft = useMemo(
    () => new PasteOwner("", { owner, text, preview, selectedIds, onReview }),
    [owner, text, preview, selectedIds, onReview],
  );
  useLayoutEffect(() => () => owner.retire(), [owner]);
  useLayoutEffect(() => () => draft.retire(), [draft]);
  const current = useCallback(() => owner.current(), [owner]);
  const controlCurrent = () => owner.active && !bridge.privateMode && (!destinationId || current());
  const enabled = policy?.owner === owner && policy.request === owner.request && policy.enabled;
  const bytes = new TextEncoder().encode(text).byteLength;
  const report = useCallback(
    (cause: unknown) => {
      if (current())
        publishError({
          owner,
          value:
            cause instanceof Error
              ? cause.message
              : "Memory import could not finish. Check its receipts before retrying.",
        });
    },
    [current, owner],
  );
  useEffect(() => {
    if (!current()) return;
    const load = () => {
      const request = owner.nextRequest();
      const receiptRequest = owner.nextReceiptRequest();
      void Promise.allSettled([
        call("memory.pipeline.policy", { workspaceId: destinationId }),
        call("memory.paste.status", { workspaceId: destinationId }),
      ]).then(([policyReply, receiptReply]) => {
        if (current() && owner.request === request) {
          if (policyReply.status === "rejected") report(policyReply.reason);
          else if (policyReply.value.workspaceId !== destinationId)
            report(new Error("Memory returned a different destination Space."));
          else setPolicy({ owner, request, enabled: policyReply.value.enabled });
        }
        if (owner.currentReceiptRequest(receiptRequest)) {
          if (receiptReply.status === "rejected") report(receiptReply.reason);
          else publishReceipts({ owner, value: receiptReply.value });
        }
      });
    };
    load();
    return bridge.onEvent((event) => {
      if (event.type === "workspace.memory.updated" && event.payload.workspaceId === destinationId) load();
    });
  }, [owner, current, report, destinationId]);
  function invalidate() {
    setPreview(null);
    setSelectedIds([]);
  }
  function work(action: (id: string, valid: () => boolean) => Promise<unknown>) {
    if (!current()) throw new Error("Choose the original current destination Space.");
    const original = owner.begin();
    if (!original) return;
    setPendingState({ owner, operation: original });
    setError("");
    const valid = () => current() && draft.active;
    return constructAwaitedOperation(() => action(destinationId, valid), value => value, undefined, () => {
          if (owner.finish(original) && current())
            setPendingState((currentPending) =>
              currentPending?.operation === original ? null : currentPending,
            );
        }, valid);
  }
  const props = {
    scopeId: destinationId || "destination",
    current: () => controlCurrent() && draft.active,
    report,
  };
  if (bridge.privateMode) return <p>Memory import is unavailable in private browsing.</p>;
  return (
    <section aria-label="Import pasted assistant notes">
      <p>
        Bring a few useful notes from another assistant. Paste plain text with one note per line, up to 40
        notes and 32 KiB. Nothing is read from your clipboard automatically.
      </p>
      <p {...staticHintProps}>
        Preview uses local checks only and makes no model call. Remove passwords, tokens, financial and health
        details. These checks cannot identify every sensitive fact; review each note yourself. Imported notes
        remain unverified and are not used by the agent until you accept them in Memory review.
      </p>
      <label>
        Destination Space
        <PasteControl
          {...props}
          command="select-memory-import-space"
          kind="select"
          value={destinationId}
          disabled={busy}
          action={(element) => {
            setSelectedSpace((element as HTMLSelectElement).value);
            onReview?.(null);
            invalidate();
            setPolicy(null);
            setReceipts([]);
            setError("");
          }}
        >
          <option value="">Choose a Space</option>
          {destinations.map((space) => (
            <option key={space.id} value={space.workspaceId}>
              {space.name}
            </option>
          ))}
        </PasteControl>
      </label>
      {!destinations.length && <p>Create or restore an active Space before importing notes.</p>}
      <label>
        Assistant notes
        <textarea
          rows={6}
          maxLength={MEMORY_PASTE_MAX_BYTES}
          value={text}
          disabled={busy}
          onChange={(event) => {
            setText(event.target.value);
            invalidate();
            setError("");
          }}
          placeholder="One useful preference or piece of project context per line"
        />
      </label>
      <p {...staticHintProps}>
        {bytes.toLocaleString()} of {MEMORY_PASTE_MAX_BYTES.toLocaleString()} bytes. Drafts and previews are
        not restored after closing this form or restarting Aux.
      </p>
      <div {...staticRowProps}>
        <PasteControl
          {...props}
          command="preview-memory-import"
          {...smallButtonProps}
          disabled={busy || !destinationId || !text.trim() || bytes > MEMORY_PASTE_MAX_BYTES}
          action={() =>
            work(async (id, valid) => {
              const result = await call("memory.paste.preview", { workspaceId: id, text });
              if (!valid()) return result;
              if (result.workspaceId !== id)
                throw new Error("Memory returned a different preview destination.");
              setPreview(result);
              setSelectedIds([]);
              return result;
            })
          }
        >
          Preview pasted notes
        </PasteControl>
        <PasteControl
          {...props}
          command="clear-memory-import-draft"
          {...smallGhostButtonProps}
          disabled={busy || (!text && !preview)}
          action={() => {
            setText("");
            invalidate();
          }}
        >
          Clear pasted draft
        </PasteControl>
      </div>
      {error && <p role="alert">{error}</p>}
      {preview?.workspaceId === destinationId &&
        (preview.status === "blocked" ? (
          <p role="alert">{preview.reason} No notes were saved.</p>
        ) : (
          <fieldset disabled={busy}>
            <legend>Review notes for {destination?.name}</legend>
            <p>
              Nothing is selected automatically. This preview expires in ten minutes or on restart. Changing
              the destination or text requires a fresh preview.
            </p>
            {preview.candidates.map((candidate) => (
              <label key={candidate.candidateId} className="field">
                <PasteControl
                  {...props}
                  command="select-memory-import-note"
                  scopeId={`${destinationId}:${candidate.candidateId}`}
                  kind="checkbox"
                  checked={selectedIds.includes(candidate.candidateId)}
                  disabled={candidate.duplicate}
                  action={() =>
                    setSelectedIds((ids) =>
                      !selectedIds.includes(candidate.candidateId)
                        ? [...ids, candidate.candidateId]
                        : ids.filter((id) => id !== candidate.candidateId),
                    )
                  }
                />
                <span>
                  {candidate.text}
                  {candidate.duplicate && (
                    <small {...staticHintProps}> · Already in Memory or repeated in this paste</small>
                  )}
                </span>
              </label>
            ))}
            {!enabled && (
              <label>
                <PasteControl
                  {...props}
                  command="enable-memory-import"
                  kind="checkbox"
                  checked={false}
                  disabled={busy}
                  action={() => {
                    return work(async (id, valid) => {
                      const request = owner.nextRequest();
                      const result = await call("memory.pipeline.setPolicy", {
                        workspaceId: id,
                        enabled: true,
                      });
                      if (valid() && owner.request === request) {
                        if (result.workspaceId !== id)
                          throw new Error("Memory returned a different policy destination.");
                        setPolicy({ owner, request: owner.request, enabled: result.enabled });
                      }
                      return result;
                    });
                  }}
                />
                Enable Memory for {destination?.name}. Only notes I later accept can be used as context.
              </label>
            )}
            <PasteControl
              {...props}
              command="commit-memory-import"
              {...smallButtonProps}
              disabled={busy || !enabled || !selectedIds.length}
              action={() =>
                work(async (id, valid) => {
                  if (policy?.owner !== owner || policy.request !== owner.request || !policy.enabled)
                    throw new Error("Wait for the current Memory policy before adding notes.");
                  const receiptRequest = owner.nextReceiptRequest();
                  const result = await call("memory.paste.commit", {
                    workspaceId: id,
                    previewId: preview.previewId,
                    selectedIds,
                  });
                  if (!valid()) return result;
                  if (result.importId !== preview.previewId)
                    throw new Error("Memory returned a different import receipt.");
                  if (owner.currentReceiptRequest(receiptRequest))
                    setReceipts(
                      [result, ...receipts.filter((item) => item.importId !== result.importId)].slice(0, 20),
                    );
                  setText("");
                  invalidate();
                  onReview?.(id);
                  return result;
                })
              }
            >
              Add {selectedIds.length} {selectedIds.length === 1 ? "note" : "notes"} to Memory review
            </PasteControl>
          </fieldset>
        ))}
      {destinationId && (
        <>
          <PasteControl
            {...props}
            command="refresh-memory-import-receipts"
            {...smallGhostButtonProps}
            disabled={busy}
            action={() =>
              work(async (id, valid) => {
                const receiptRequest = owner.nextReceiptRequest();
                const status = await call("memory.paste.status", { workspaceId: id });
                if (valid() && owner.currentReceiptRequest(receiptRequest)) {
                  setReceipts(status);
                  if (
                    preview?.status === "ready" &&
                    status.some((item) => item.importId === preview.previewId)
                  ) {
                    setText("");
                    invalidate();
                  }
                }
                return status;
              })
            }
          >
            Refresh import receipts
          </PasteControl>
        </>
      )}
      {!!receipts.length && (
        <section aria-label="Pasted Memory import receipts">
          <h4>Recent pasted imports</h4>
          {receipts.map((receipt) => (
            <p key={receipt.importId} data-import-id={receipt.importId}>
              Import {receipt.importId.slice(0, 8)} · {new Date(receipt.createdAt).toLocaleString()}:{" "}
              {receipt.added} added, {receipt.duplicates} duplicates skipped · {receipt.pending} pending,{" "}
              {receipt.accepted} approved, {receipt.restorable} in history, {receipt.removed} removed.
            </p>
          ))}
          <p {...staticHintProps}>
            Counts survive restart. Forget removes matching notes from the inbox, approved Memory and
            restorable history; receipts retain counts only. Copied offline recovery packages must be replaced
            separately after Forget.
          </p>
          {onReview && (
            <PasteControl
              {...props}
              command="review-memory-import-space"
              {...smallButtonProps}
              disabled={busy}
              action={() => onReview(destinationId)}
            >
              Review this Space’s memory
            </PasteControl>
          )}
        </section>
      )}
    </section>
  );
}
