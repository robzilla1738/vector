import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { bridge } from "../../bridge";
import { useSettingsSaveOwner } from "./use-settings-save-owner";
import { usePreferenceCommand } from "./preference-command";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import "./TidyTabs.css";

export function TidyTabsSetting({
  active,
  value,
  onSave,
  onClose,
}: {
  active: boolean;
  value: string;
  onSave(prompt: string): Promise<boolean>;
  onClose(): void;
}) {
  const windowId = bridge.windowId,
    privateMode = bridge.privateMode;
  const identity = useMemo(() => ({ active, windowId, privateMode }), [active, windowId, privateMode]);
  const initial = { identity, text: value, base: value };
  const [editing, setEditing] = useState(initial);
  const draft = editing.identity === identity ? editing : initial;
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const [getOwner, current, busy, error, , clearFailure, perform] = useSettingsSaveOwner(
    identity,
    windowId,
    privateMode,
    () => active && !bridge.privateMode,
    true,
  );
  const scopeId = useId(),
    countId = useId();
  const changed = draft.text !== value;
  const replaced = value !== draft.base && !getOwner().pending;
  const editable = active && !privateMode && !busy;
  const [saveRef, runSave] = usePreferenceCommand<HTMLFormElement>("save-tidy-prompt", scopeId, () => {
    const owner = getOwner();
    if (
      !current(owner) ||
      owner.pending ||
      draftRef.current !== draft ||
      !changed ||
      replaced ||
      draft.text.length > 300
    )
      throw new Error("Choose the current Tidy Tabs prompt.");
    return perform(
      owner,
      draft,
      draftRef,
      () => onSave(draft.text),
      onClose,
      "The Tidy Tabs prompt wasn’t saved. Try again.",
    );
  });
  if (!active) return null;
  return (
    <form
      className="tidy-prompt-editor"
      ref={saveRef}
      onSubmit={(event) => {
        event.preventDefault();
        runSave(event);
      }}
    >
      <label htmlFor={countId + "-input"}>
        Prompt <span id={countId}>{draft.text.length}/300</span>
      </label>
      <textarea
        id={countId + "-input"}
        aria-label="Tidy Tabs prompt"
        aria-describedby={countId}
        maxLength={300}
        disabled={!editable || replaced}
        value={draft.text}
        placeholder="e.g. Group tabs by website name and topic."
        onChange={(event) => {
          if (!current() || getOwner().pending) return;
          const next = { identity, base: draft.base, text: event.target.value };
          draftRef.current = next;
          setEditing(next);
          clearFailure();
        }}
      />
      {replaced && (
        <p className="hint" role="status">
          This preference changed in another view. Reopen Configure to edit the latest prompt.
        </p>
      )}
      {error && (
        <p className="hint err" role="alert">
          {error}
        </p>
      )}
      <footer>
        <button {...smallGhostButtonProps} type="button" onClick={onClose}>
          Cancel
        </button>
        <button
          {...smallButtonProps}
          type="submit"
          data-command-id="save-tidy-prompt"
          disabled={!editable || !changed || replaced || draft.text.length > 300}
        >
          {busy ? "Saving…" : "Save"}
        </button>
      </footer>
    </form>
  );
}
