import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AutofillProfile } from "@aux/contracts";
import { bridge } from "../bridge";
import { guardCommandCompletion } from "../command-completion";
import { useScopedCommandControls } from "../scoped-command-controls";
const FIELDS: { key: keyof AutofillProfile; label: string; auto?: string }[] = [
  { key: "name", label: "Name", auto: "name" },
  { key: "email", label: "Email", auto: "email" },
  { key: "phone", label: "Phone", auto: "tel" },
  { key: "organization", label: "Organization", auto: "organization" },
  { key: "street", label: "Street address", auto: "street-address" },
  { key: "city", label: "City", auto: "address-level2" },
  { key: "region", label: "State or region", auto: "address-level1" },
  { key: "postal", label: "ZIP or postal code", auto: "postal-code" },
  { key: "country", label: "Country", auto: "country-name" },
];
type Owner = { active: boolean; pending: boolean; identity: object };
/** Contact/address data only; original explicit form filling excludes credentials/payment. */
export function AutofillSetting({
  value,
  onSave,
  active = true,
}: {
  value: AutofillProfile | undefined;
  onSave: (next: AutofillProfile) => Promise<unknown>;
  active?: boolean;
}) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode,
    kind = bridge.windowKind;
  const snapshot = JSON.stringify(value ?? {});
  const identity = useMemo(
    () => ({ snapshot, windowId, privateMode, kind, active }),
    [snapshot, windowId, privateMode, kind, active],
  );
  const owner = useRef<Owner>({ active: false, pending: false, identity });
  useLayoutEffect(() => {
    const original = { active: true, pending: false, identity };
    owner.current = original;
    return () => {
      original.active = false;
    };
  }, [identity]);
  const current = useCallback(
    (original: Owner) =>
      original.active &&
      owner.current === original &&
      original.identity === identity &&
      active &&
      !privateMode &&
      kind === "normal" &&
      !bridge.privateMode &&
      bridge.windowId === windowId &&
      bridge.windowKind === kind,
    [identity, active, privateMode, kind, windowId],
  );
  const [editing, setEditing] = useState<{ owner: Owner; draft: AutofillProfile } | null>(null);
  const [failure, setFailure] = useState<{ owner: Owner; message: string } | null>(null);
  const [pending, setPending] = useState<Owner | null>(null);
  const draft = editing?.owner.active && editing.owner.identity === identity ? editing.draft : null;
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const busy = pending?.active && pending.identity === identity;
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const scopeId = useId();
  const [publish, run] = useScopedCommandControls(scopeId, () => {
    const original = owner.current;
    return current(original) ? () => current(original) : undefined;
  });
  function requireOwner() {
    const original = owner.current;
    if (!current(original) || original.pending) throw new Error("Choose the current personal info control.");
    return original;
  }
  function start() {
    const original = requireOwner();
    const next = { ...value };
    draftRef.current = next;
    setEditing({ owner: original, draft: next });
    setFailure(null);
  }
  function cancel() {
    requireOwner();
    draftRef.current = null;
    setEditing(null);
    setFailure(null);
  }
  function change(key: keyof AutofillProfile, text: string) {
    const original = requireOwner();
    if (!draftRef.current) return;
    const next = { ...draftRef.current, [key]: text };
    draftRef.current = next;
    setEditing({ owner: original, draft: next });
  }
  function save() {
    const original = requireOwner(),
      savedDraft = draftRef.current;
    if (!savedDraft) throw new Error("Edit the current personal info first.");
    original.pending = true;
    setPending(original);
    setFailure(null);
    const delivering = () => current(original) && draftRef.current === savedDraft;
    const completion = (async () => {
      try {
        const clean = {} as AutofillProfile;
        for (const field of FIELDS) {
          const text = savedDraft[field.key]?.trim();
          if (text) clean[field.key] = text;
        }
        const ack = await onSave(clean);
        if (delivering()) {
          if (ack === false)
            setFailure({ owner: original, message: "Personal info wasn’t saved. Try again." });
          else {
            draftRef.current = null;
            setEditing(null);
          }
        }
        return ack;
      } catch (reason) {
        if (delivering())
          setFailure({ owner: original, message: reason instanceof Error ? reason.message : String(reason) });
        throw reason;
      } finally {
        original.pending = false;
        setPending((previous) => (previous === original ? null : previous));
      }
    })();
    return guardCommandCompletion(completion, delivering);
  }
  const filled = FIELDS.filter((field) => value?.[field.key]?.trim());
  const disabled = !active || privateMode || kind !== "normal";
  return (
    <div className="autofill-setting">
      {!draft && (
        <div className="row">
          {filled.length ? (
            <span className="hint">
              {filled.length} detail{filled.length === 1 ? "" : "s"} saved —{" "}
              {filled
                .slice(0, 3)
                .map((field) => field.label.toLowerCase())
                .join(", ")}
              {filled.length > 3 ? "…" : ""}
            </span>
          ) : (
            <span className="hint">
              No personal info saved. Forms fill only when you choose Fill personal info.
            </span>
          )}
          <button
            ref={(element) => publish("edit", "edit-personal-info", element, start)}
            className="btn sm"
            disabled={disabled}
            data-command-id="edit-personal-info"
            onClick={(event) => run("edit-personal-info", event)}
          >
            {filled.length ? "Edit" : "Add personal info"}
          </button>
        </div>
      )}
      {draft && (
        <form
          ref={(element) => publish("save", "save-personal-info", element, save)}
          className="autofill-editor"
          data-command-id="save-personal-info"
          onSubmit={(event) => {
            event.preventDefault();
            run("save-personal-info", event);
          }}
        >
          {FIELDS.map((field) => (
            <label className="autofill-field" key={field.key}>
              <span>{field.label}</span>
              <input
                className="field-input"
                autoComplete={field.auto}
                disabled={busy || disabled}
                value={draft[field.key] ?? ""}
                onChange={(event) => change(field.key, event.target.value)}
              />
            </label>
          ))}
          <div className="row">
            <button className="btn sm" type="submit" disabled={busy || disabled}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              ref={(element) => publish("cancel", "cancel-personal-info", element, cancel)}
              className="btn sm ghost"
              type="button"
              data-command-id="cancel-personal-info"
              disabled={busy || disabled}
              onClick={(event) => run("cancel-personal-info", event)}
            >
              Cancel
            </button>
          </div>
          {error && (
            <p className="field-error" role="alert">
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
