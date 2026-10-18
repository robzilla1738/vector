import { staticFieldInputProps, staticFieldErrorProps } from "../ui/class-props";
import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useCallback, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { AutofillProfile } from "@aux/contracts";
import { bridge } from "../bridge";
import { useSettingsSaveOwner, type SettingsSaveOwner } from "../settings/sections/use-settings-save-owner";
import { useScopedCommandControls } from "../scoped-command-controls";
import { nativeButtonTypeProps as auxNativeButtonTypeProps } from "../ui/native-attribute-props";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";
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
const SAVE_POLICY = {
  accepted: (ack: unknown) => ack !== false,
  rejected: (reason: unknown) => errorMessage(reason),
};
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
    () => [snapshot, windowId, privateMode, kind, active],
    [snapshot, windowId, privateMode, kind, active],
  );
  const admitted = useCallback(
    () => active && !privateMode && kind === "normal" && !bridge.privateMode && bridge.windowKind === kind,
    [active, privateMode, kind],
  );
  const [getOwner, current, busy, error, , clearFailure, perform] = useSettingsSaveOwner(
    identity,
    windowId,
    privateMode,
    admitted,
  );
  const [editing, setEditing] = useState<{ owner: SettingsSaveOwner; draft: AutofillProfile } | null>(null);
  const draft = editing?.owner.active && editing.owner.identity === identity ? editing.draft : null;
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const scopeId = useId();
  const [publish, run] = useScopedCommandControls(scopeId, () => {
    const original = getOwner();
    return current(original) ? () => current(original) : undefined;
  });
  function requireOwner() {
    const original = getOwner();
    if (!current(original) || original.pending) throw new Error("Choose the current personal info control.");
    return original;
  }
  function start() {
    const original = requireOwner();
    const next = { ...value };
    draftRef.current = next;
    setEditing({ owner: original, draft: next });
    clearFailure();
  }
  function cancel() {
    requireOwner();
    draftRef.current = null;
    setEditing(null);
    clearFailure();
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
    return perform(
      original,
      savedDraft,
      draftRef,
      () => {
        const clean = {} as AutofillProfile;
        for (const field of FIELDS) {
          const text = savedDraft[field.key]?.trim();
          if (text) clean[field.key] = text;
        }
        return onSave(clean);
      },
      () => {
        draftRef.current = null;
        setEditing(null);
      },
      "Personal info wasn’t saved. Try again.",
      SAVE_POLICY,
    );
  }

  const filled = FIELDS.filter((field) => value?.[field.key]?.trim());
  const disabled = !active || privateMode || kind !== "normal";
  return (
    <div className="autofill-setting">
      {!draft && (
        <div className="row wrap">
          {filled.length ? (
            <span {...staticHintProps}>
              {filled.length} detail{filled.length === 1 ? "" : "s"} saved —{" "}
              {filled
                .slice(0, 3)
                .map((field) => field.label.toLowerCase())
                .join(", ")}
              {filled.length > 3 ? "…" : ""}
            </span>
          ) : (
            <span {...staticHintProps}>
              No personal info saved. Forms fill only when you choose Fill personal info.
            </span>
          )}
          <button
            ref={(element) => publish("edit", "edit-personal-info", element, start)}
            {...smallButtonProps}
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
                {...staticFieldInputProps}
                autoComplete={field.auto}
                disabled={busy || disabled}
                value={draft[field.key] ?? ""}
                onChange={(event) => change(field.key, event.target.value)}
              />
            </label>
          ))}
          <div {...staticRowProps}>
            <button {...smallButtonProps} type="submit" disabled={busy || disabled}>
              {busy ? "Saving…" : "Save"}
            </button>
            <button
              ref={(element) => publish("cancel", "cancel-personal-info", element, cancel)}
              {...smallGhostButtonProps}
              {...auxNativeButtonTypeProps}
              data-command-id="cancel-personal-info"
              disabled={busy || disabled}
              onClick={(event) => run("cancel-personal-info", event)}
            >
              Cancel
            </button>
          </div>
          {error && (
            <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
              {error}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
