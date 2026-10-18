import { useId, useRef, useState, type RefObject } from "react";
import {
  SelectionActionSchema,
  renderSelectionTemplate,
  type SelectionAction,
  type SelectionCaptureSettings,
} from "@aux/contracts";
import { Dialog } from "../../ui/native-dialog";
import { shellIconAgentSm } from "../../ui/icons";
import { PreferenceAction, usePreferenceCommand } from "./preference-command";
import type { SettingsSaveOwner } from "./use-settings-save-owner";

export type ActionEdit = {
  key: string;
  kind: "add" | "edit";
  action: SelectionAction;
  position: number;
  base: SelectionCaptureSettings;
  owner: SettingsSaveOwner;
  windowId: string;
  connected: boolean;
  returnFocus: RefObject<HTMLElement | null>;
};
export type ActionDraft = { action: SelectionAction; position: number };

export function SelectionActionEditor({
  edit,
  busy,
  connected,
  error,
  current,
  conflict,
  count,
  onClose,
  onResume,
  onCommit,
  onReload,
}: {
  edit: ActionEdit;
  busy: boolean;
  connected: boolean;
  error: string;
  current(): boolean;
  conflict: boolean;
  count: number;
  onClose(): void;
  onResume(): void;
  onCommit(
    value: ActionDraft,
    original: RefObject<ActionDraft>,
    operation: "save" | "remove",
  ): Promise<unknown>;
  onReload(value: ActionDraft): void;
}) {
  const [draft, setDraft] = useState<ActionDraft>({ action: edit.action, position: edit.position });
  const draftRef = useRef(draft);
  const [preview, setPreview] = useState(false);
  const [failure, setFailure] = useState("");
  const name = useRef<HTMLInputElement>(null);
  const scope = useId();
  const owned = current();
  const editable = connected && !busy && !conflict && owned;
  const validation = SelectionActionSchema.safeParse(draft.action);
  const dirty =
    edit.kind === "add" ||
    JSON.stringify(draft) !== JSON.stringify({ action: edit.action, position: edit.position });
  const requireCurrent = () => {
    if (!connected || !current() || edit.owner.pending || busy || conflict)
      throw new Error("Choose the current Selection & Capture action editor.");
  };
  const update = (next: ActionDraft) => {
    requireCurrent();
    draftRef.current = next;
    setDraft(next);
    setFailure("");
  };
  const submit = () => {
    requireCurrent();
    if (
      !SelectionActionSchema.safeParse(draftRef.current.action).success ||
      (edit.kind === "add" && count >= 12)
    )
      return;
    if (
      edit.kind === "edit" &&
      JSON.stringify(draftRef.current) === JSON.stringify({ action: edit.action, position: edit.position })
    )
      return;
    return onCommit(draftRef.current, draftRef, "save");
  };
  const [form, runSubmit] = usePreferenceCommand<HTMLFormElement>(
    "save-selection-action",
    scope,
    submit,
    (reason) => {
      if (current())
        setFailure(
          reason instanceof Error ? reason.message : "This action was not saved. Your edits are still here.",
        );
    },
  );
  const [enabledRef, toggleEnabled] = usePreferenceCommand<HTMLInputElement>(
    "toggle-selection-action",
    scope,
    () =>
      update({
        ...draftRef.current,
        action: { ...draftRef.current.action, enabled: !draftRef.current.action.enabled },
      }),
  );
  const move = (delta: number) => {
    const next = draftRef.current.position + delta;
    if (next < 0 || next >= count + (edit.kind === "add" ? 1 : 0)) return;
    update({ ...draftRef.current, position: next });
    name.current?.focus();
  };
  let previewText = "";
  if (preview) {
    try {
      previewText = renderSelectionTemplate(draft.action.template, {
        text: "A short example selection.\nconst count = 2;",
        image: "A locally captured example image",
      });
    } catch (reason) {
      previewText = reason instanceof Error ? reason.message : "Invalid template.";
    }
  }
  return (
    <Dialog
      label={edit.kind === "add" ? "Add selection action" : `Edit ${edit.action.name}`}
      className="aux-dialog-surface settings-preference-dialog selection-action-dialog"
      initialFocusRef={name}
      returnFocus={edit.returnFocus}
      onClose={onClose}
    >
      <header>
        <h3>{edit.kind === "add" ? "Add selection action" : `Edit ${edit.action.name}`}</h3>
      </header>
      <form
        ref={form}
        className="selection-action-editor"
        onSubmit={(event) => {
          event.preventDefault();
          runSubmit(event);
        }}
      >
        <div className="selection-action-heading">
          <span className="selection-action-symbol" aria-hidden="true">
            {shellIconAgentSm}
          </span>
          <label className="selection-action-name">
            <span className="sr-only">Name</span>
            <input
              ref={name}
              aria-label={`Action ${draft.position + 1} name`}
              maxLength={60}
              value={draft.action.name}
              disabled={!editable}
              onChange={(event) =>
                update({
                  ...draftRef.current,
                  action: { ...draftRef.current.action, name: event.target.value },
                })
              }
            />
          </label>
        </div>
        <div className="selection-action-kind">
          <span>Action</span>
          <span className="selection-action-kind-value">Prompt</span>
        </div>
        <label className="selection-action-template">
          <span className="sr-only">Prompt template</span>
          <textarea
            aria-label={`Action ${draft.position + 1} template`}
            maxLength={2000}
            rows={6}
            value={draft.action.template}
            disabled={!editable}
            onChange={(event) =>
              update({
                ...draftRef.current,
                action: { ...draftRef.current.action, template: event.target.value },
              })
            }
          />
        </label>
        <div className="settings-editor-actions">
          <label className="settings-editor-checkbox">
            <input
              type="checkbox"
              ref={enabledRef}
              checked={draft.action.enabled}
              disabled={!editable}
              data-command-id="toggle-selection-action"
              onChange={toggleEnabled}
            />{" "}
            Enabled
          </label>
          <PreferenceAction
            className="btn sm ghost"
            command="move-selection-action-up"
            scopeId={scope}
            aria-label={`Move ${draft.action.name || "action"} up`}
            disabled={!editable || draft.position === 0}
            invoke={() => move(-1)}
          >
            ↑
          </PreferenceAction>
          <PreferenceAction
            className="btn sm ghost"
            command="move-selection-action-down"
            scopeId={scope}
            aria-label={`Move ${draft.action.name || "action"} down`}
            disabled={!editable || draft.position === count - (edit.kind === "edit" ? 1 : 0)}
            invoke={() => move(1)}
          >
            ↓
          </PreferenceAction>
        </div>
        <p className="hint">
          Use {"{text}"} for quoted text, {"{code}"} for code, or {"{image}"} for a capture. Save changes only
          this action.
        </p>
        <div className="settings-editor-actions">
          <PreferenceAction
            className="btn sm ghost"
            command="preview-selection-action"
            scopeId={scope}
            disabled={!editable}
            invoke={() => {
              requireCurrent();
              setPreview(true);
            }}
          >
            Preview {draft.action.name || "action"}
          </PreferenceAction>
          {edit.kind === "edit" && (
            <PreferenceAction
              className="btn sm ghost"
              command="remove-selection-action"
              scopeId={scope}
              aria-label={`Remove ${draft.action.name || "action"}`}
              disabled={!editable}
              invoke={() => {
                requireCurrent();
                return onCommit(draftRef.current, draftRef, "remove");
              }}
            >
              Remove
            </PreferenceAction>
          )}
        </div>
        {preview && (
          <section aria-label="Selection action preview">
            <strong>Local preview · example content</strong>
            <pre style={{ whiteSpace: "pre-wrap" }}>{previewText}</pre>
            <PreferenceAction
              className="btn sm ghost"
              command="close-selection-action-preview"
              scopeId={scope}
              disabled={!editable}
              invoke={() => {
                requireCurrent();
                setPreview(false);
              }}
            >
              Close preview
            </PreferenceAction>
          </section>
        )}
        {(!connected || (!owned && !conflict)) && (
          <div role="status">
            <p>
              {!connected
                ? "The runtime disconnected. Your action draft is preserved and read-only."
                : "The connection changed. Resume editing to review this preserved draft before saving."}
            </p>
            {connected && !conflict && (
              <button type="button" className="btn ghost" disabled={busy} onClick={onResume}>
                Resume editing
              </button>
            )}
          </div>
        )}
        {conflict && (
          <div role="alert">
            <p>
              These settings changed in another window. Your action edits are preserved;{" "}
              {edit.kind === "add" ? "review current settings" : "reload the saved action"} before trying
              again.
            </p>
            <button
              type="button"
              className="btn ghost"
              disabled={busy || !connected}
              onClick={() => onReload(draftRef.current)}
            >
              {edit.kind === "add" ? "Review current settings" : "Reload saved action"}
            </button>
          </div>
        )}
        {edit.kind === "add" && count >= 12 && (
          <p role="alert">
            Remove a saved action before adding another. Aux supports up to twelve selection actions.
          </p>
        )}
        {!validation.success && <p role="alert">{validation.error.issues[0]?.message}</p>}
        {(error || failure) && <p role="alert">{error || failure}</p>}
        <footer className="ui-alert-actions">
          <button className="btn ghost" type="button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn primary"
            type="submit"
            data-command-id="save-selection-action"
            disabled={!editable || !validation.success || !dirty || (edit.kind === "add" && count >= 12)}
          >
            {busy ? "Saving…" : edit.kind === "add" ? "Save" : "Update"}
          </button>
        </footer>
      </form>
    </Dialog>
  );
}
