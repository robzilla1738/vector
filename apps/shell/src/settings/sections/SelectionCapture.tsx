import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CaptureHotkeySchema,
  SelectionCaptureSettingsSchema,
  readSelectionCaptureSettings,
  bindingLabel,
  captureShortcutConflict,
  type CaptureHotkey,
  type SelectionCaptureSettings as Preferences,
  type ShortcutOverrides,
} from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { useSettingsSaveOwner, type SettingsSaveOwner } from "./use-settings-save-owner";
import { useScopedCommandControls } from "../../scoped-command-controls";
import { PreferenceAction } from "./preference-command";
import { bindingFromKeydown } from "../../components/ShortcutsSetting";
import { SettingsField, SettingsSection } from "../primitives";
import { SettingsGroup, Switch } from "../../ui";
import { SelectionActionEditor, type ActionEdit, type ActionDraft } from "./SelectionActionEditor";
import "./SelectionCapture.css";
import { shellIconAgentSm } from "../../ui/icons";
import {
  staticPrimaryButtonProps as auxClassPrimaryButtonProps,
  staticGhostButtonProps as auxClassGhostButtonProps,
} from "../../ui/class-props";
import { nativeAlertRoleProps } from "../../ui/native-attribute-props";

export interface SelectionCaptureNativeStatus {
  /** A native registration result is meaningful only for the current saved revision. */
  revision: number;
  selectionDoubleTap: { registered: boolean; error?: string };
  regionCapture: { registered: boolean; error?: string };
}

function Hotkey({
  label,
  value,
  disabled,
  active,
  onChange,
  current,
  scopeId,
}: {
  label: string;
  value: CaptureHotkey | null;
  disabled: boolean;
  active: boolean;
  onChange(value: CaptureHotkey | null): void;
  current(): boolean;
  scopeId: string;
}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setRecording(false);
  }, [active, disabled, current]);
  const requireCurrent = () => {
    if (!active || disabled || !current())
      throw new Error("Choose the current Selection & Capture shortcut.");
  };
  return (
    <div className="row wrap">
      <kbd>{value ? bindingLabel(value, bridge.platform) : "Off"}</kbd>
      <PreferenceAction
        command="record-selection-capture-shortcut"
        scopeId={scopeId}
        {...smallButtonProps}
        disabled={disabled}
        aria-label={`Record ${label}`}
        aria-pressed={recording}
        invoke={() => {
          requireCurrent();
          setError("");
          setRecording(true);
        }}
        onBlur={() => setRecording(false)}
        onKeyDown={(event) => {
          if (!recording || !active || disabled || !current()) return;
          event.preventDefault();
          event.stopPropagation();
          if (event.key === "Escape") {
            setRecording(false);
            return;
          }
          const binding = bindingFromKeydown(event, bridge.platform);
          const parsed = CaptureHotkeySchema.safeParse(
            binding && {
              key: binding.key,
              command: !!binding.command,
              ctrl: !!binding.ctrl,
              alt: !!binding.alt,
              shift: !!binding.shift,
            },
          );
          if (!parsed.success) {
            setError("Use Command, Control, or Option with a letter, number, Space, or function key.");
            return;
          }
          onChange(parsed.data);
          setRecording(false);
          setError("");
        }}
      >
        {recording ? "Press shortcut · Esc cancels" : "Record shortcut"}
      </PreferenceAction>
      {value && (
        <PreferenceAction
          command="disable-selection-capture-shortcut"
          scopeId={scopeId}
          {...smallGhostButtonProps}
          disabled={disabled}
          invoke={() => {
            requireCurrent();
            onChange(null);
          }}
        >
          Turn off
        </PreferenceAction>
      )}
      {error && <span {...nativeAlertRoleProps}>{error}</span>}
    </div>
  );
}

export function SelectionCaptureSettings({
  active,
  settings,
  onSave,
  nativeStatus,
}: {
  active: boolean;
  settings: Record<string, unknown>;
  onSave(patch: Record<string, unknown>, present?: () => boolean): Promise<boolean>;
  nativeStatus?: SelectionCaptureNativeStatus;
}) {
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const connected = useStore((state) => state.connected);
  const sourceScope = useMemo(
    () => ({ windowId, kind, privateMode, connected }),
    [windowId, kind, privateMode, connected],
  );
  const [acknowledged, setAcknowledged] = useState<{ scope: typeof sourceScope; value: Preferences } | null>(
    null,
  );
  const observed = useMemo(
    () => readSelectionCaptureSettings(settings.selectionCapture),
    [settings.selectionCapture],
  );
  const saved =
    acknowledged?.scope === sourceScope && observed.revision < acknowledged.value.revision
      ? acknowledged.value
      : observed;
  const savedKey = JSON.stringify(saved);
  const unavailable = !active || privateMode || kind !== "normal";
  const acknowledgedKey = acknowledged?.scope === sourceScope ? JSON.stringify(acknowledged.value) : null;
  const pendingSave = useRef<{ owner: SettingsSaveOwner; baseKey: string; expectedKey: string } | null>(null);
  const receipt = pendingSave.current;
  // The runtime broadcasts persisted settings before replying to the save request.
  // Exact pending or previously acknowledged values retain the live save owner.
  const ownBroadcast =
    !!receipt?.owner.active &&
    receipt.owner.pending &&
    (receipt.expectedKey === savedKey || acknowledgedKey === savedKey);
  const ownerSavedKey = ownBroadcast ? receipt.baseKey : savedKey;
  const identity = useMemo(
    () => [active, ownerSavedKey, windowId, kind, privateMode, connected],
    [active, ownerSavedKey, windowId, kind, privateMode, connected],
  );
  const admitted = useCallback(
    () =>
      active &&
      !privateMode &&
      kind === "normal" &&
      bridge.windowKind === kind &&
      !bridge.privateMode &&
      useStore.getState().connected === connected,
    [active, privateMode, kind, connected],
  );
  const [getOwner, current, busy, error, fail, clearFailure, perform] = useSettingsSaveOwner(
    identity,
    windowId,
    privateMode,
    admitted,
    true,
  );
  const requireCurrent = () => {
    const original = getOwner();
    if (!current(original) || original.pending)
      throw new Error("Choose the current Selection & Capture control.");
    return original;
  };
  const scopeId = useId();
  const [publish, run] = useScopedCommandControls(scopeId, () => {
    const original = getOwner();
    return current(original) ? () => current(original) : undefined;
  });
  const [draft, setDraft] = useState<Preferences>(saved);
  const [baseKey, setBaseKey] = useState(savedKey);
  const setError = (message: string) => (message ? fail(getOwner(), message) : clearFailure());
  const [message, setMessage] = useState("");
  const [editor, setEditorValue] = useState<ActionEdit | null>(null);
  const editorRef = useRef(editor);
  const setEditor = useCallback((value: ActionEdit | null) => {
    editorRef.current = value;
    setEditorValue(value);
  }, []);
  const baseRef = useRef(saved);
  const removalFocus = useRef<{ windowId: string; savedKey: string } | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const dirty = JSON.stringify(draft) !== baseKey;
  const changedElsewhere = !ownBroadcast && savedKey !== baseKey && saved.revision >= draft.revision;
  useEffect(() => {
    if (!dirty && !busy && saved.revision >= draft.revision) {
      draftRef.current = saved;
      baseRef.current = saved;
      setDraft(saved);
      setBaseKey(savedKey);
    }
  }, [saved, savedKey, dirty, busy, draft.revision]);
  useLayoutEffect(() => {
    const target = removalFocus.current;
    if (editor || !target) return;
    removalFocus.current = null;
    if (
      active &&
      !privateMode &&
      kind === "normal" &&
      bridge.windowId === target.windowId &&
      savedKey === target.savedKey
    )
      addButton.current?.focus();
  }, [editor, active, privateMode, kind, savedKey]);
  const update = (patch: Partial<Preferences>) => {
    requireCurrent();
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next;
    setDraft(next);
    setMessage("");
    setError("");
  };
  useEffect(() => {
    if (unavailable || (editor && editor.windowId !== windowId)) setEditor(null);
  }, [unavailable, windowId, editor, setEditor]);
  const openAction = (action: Preferences["actions"][number] | null, trigger: HTMLButtonElement) => {
    const owner = requireCurrent();
    setError("");
    setEditor({
      key: crypto.randomUUID(),
      kind: action ? "edit" : "add",
      action: action ?? {
        id: crypto.randomUUID(),
        name: "New action",
        enabled: true,
        template: "Explain this selection.\n\n{text}",
      },
      position: action ? saved.actions.findIndex((item) => item.id === action.id) : saved.actions.length,
      base: saved,
      owner,
      windowId,
      connected,
      returnFocus: { current: trigger },
    });
  };
  const closeEditor = (edit: ActionEdit) => {
    if (editorRef.current === edit && !edit.owner.pending) setEditor(null);
  };
  const commitAction = (
    edit: ActionEdit,
    value: ActionDraft,
    valueRef: { current: ActionDraft },
    operation: "save" | "remove",
  ) => {
    const original = requireCurrent();
    if (
      !connected ||
      editorRef.current !== edit ||
      !current(edit.owner) ||
      JSON.stringify(edit.base) !== savedKey
    )
      throw new Error("This action changed in another window. Reload the saved action before trying again.");
    if (value.action.id !== edit.action.id)
      throw new Error("Choose the original Selection & Capture action.");
    const actions = saved.actions.filter((action) => action.id !== edit.action.id);
    if (edit.kind === "edit" && actions.length !== saved.actions.length - 1)
      throw new Error("The original Selection & Capture action is unavailable.");
    if (edit.kind === "add" && actions.length !== saved.actions.length)
      throw new Error("The new Selection & Capture action identity is already used.");
    if (operation === "save") actions.splice(value.position, 0, value.action);
    const submitted = SelectionCaptureSettingsSchema.parse({ ...saved, actions });
    const next = readSelectionCaptureSettings({ ...submitted, revision: submitted.revision + 1 });
    pendingSave.current = { owner: original, baseKey: savedKey, expectedKey: JSON.stringify(next) };
    return perform(
      original,
      value,
      valueRef,
      (present) => onSave({ selectionCapture: submitted }, () => present() && editorRef.current === edit),
      () => {
        if (editorRef.current !== edit) return;
        const previous = draftRef.current;
        const rebased: Preferences = { ...next };
        for (const key of ["inlineAssist", "selectionDoubleTap", "regionCapture"] as const) {
          if (JSON.stringify(previous[key]) !== JSON.stringify(baseRef.current[key])) {
            if (key === "inlineAssist") rebased.inlineAssist = previous.inlineAssist;
            else rebased[key] = previous[key];
          }
        }
        setAcknowledged({ scope: sourceScope, value: next });
        baseRef.current = next;
        draftRef.current = rebased;
        setDraft(rebased);
        setBaseKey(JSON.stringify(next));
        setMessage("Saved for this Profile. New selections use these actions.");
        if (operation === "remove") removalFocus.current = { windowId, savedKey: JSON.stringify(next) };
        setEditor(null);
      },
      "This action was not saved. Your edits are still here.",
      {
        accepted: (ack) => !!ack,
        rejected: (reason) =>
          reason instanceof Error ? reason.message : "This action was not saved. Your edits are still here.",
      },
    );
  };
  const validation = SelectionCaptureSettingsSchema.safeParse(draft);
  const conflict = captureShortcutConflict(
    draft,
    settings.shortcutOverrides as ShortcutOverrides | undefined,
    bridge.platform,
  );
  const save = () => {
    if (editorRef.current) throw new Error("Finish the original selection action editor first.");
    const original = requireCurrent(),
      savedDraft = draftRef.current;
    const saveValidation = SelectionCaptureSettingsSchema.safeParse(savedDraft);
    if (
      changedElsewhere ||
      !saveValidation.success ||
      captureShortcutConflict(
        savedDraft,
        settings.shortcutOverrides as ShortcutOverrides | undefined,
        bridge.platform,
      )
    )
      return;
    setMessage("");
    const refusal = "Selection & Capture was not saved. Your edits are still here.";
    const next = readSelectionCaptureSettings({
      ...saveValidation.data,
      revision: saveValidation.data.revision + 1,
    });
    const receipt = { owner: original, baseKey: savedKey, expectedKey: JSON.stringify(next) };
    pendingSave.current = receipt;
    return perform(
      original,
      savedDraft,
      draftRef,
      (present) => onSave({ selectionCapture: saveValidation.data }, present),
      () => {
        setAcknowledged({ scope: sourceScope, value: next });
        baseRef.current = next;
        draftRef.current = next;
        setDraft(next);
        setBaseKey(JSON.stringify(next));
        setMessage("Saved for this Profile. New selections use these actions.");
      },
      refusal,
      {
        accepted: (ack) => !!ack,
        rejected: (reason) => (reason instanceof Error ? reason.message : refusal),
      },
    );
  };
  const registration = (key: "selectionDoubleTap" | "regionCapture") => {
    if (!saved[key]) return "Off. No capture shortcut requested.";
    if (!nativeStatus || nativeStatus.revision !== saved.revision)
      return "Saved request. Native shortcut registration has not been confirmed.";
    const status = nativeStatus[key];
    return status.registered
      ? "Registered for this Profile."
      : status.error || "Shortcut unavailable. Choose another shortcut and save again.";
  };
  const saveControls = (
    <>
      {changedElsewhere && dirty && (
        <p {...nativeAlertRoleProps}>
          These settings changed in another window. Your edits are preserved; reload the saved version before
          editing again.
        </p>
      )}
      {!validation.success && <p {...nativeAlertRoleProps}>{validation.error.issues[0]?.message}</p>}
      {conflict && <p {...nativeAlertRoleProps}>{conflict}</p>}
      {error && <p {...nativeAlertRoleProps}>{error}</p>}
      {message && <output>{message}</output>}
      <div className="settings-editor-actions">
        <PreferenceAction
          command="save-selection-capture-settings"
          scopeId={scopeId}
          {...auxClassPrimaryButtonProps}
          disabled={
            busy || unavailable || !!editor || !dirty || changedElsewhere || !validation.success || !!conflict
          }
          invoke={save}
        >
          {busy ? "Saving…" : "Save Selection & Capture"}
        </PreferenceAction>
        {(dirty || changedElsewhere) && (
          <PreferenceAction
            command="reload-selection-capture-settings"
            scopeId={scopeId}
            {...auxClassGhostButtonProps}
            disabled={busy || unavailable}
            invoke={() => {
              requireCurrent();
              draftRef.current = saved;
              baseRef.current = saved;
              setDraft(saved);
              setBaseKey(savedKey);
              setError("");
              setMessage("Saved settings reloaded. Unsaved edits discarded.");
            }}
          >
            Reload saved settings
          </PreferenceAction>
        )}
      </div>
    </>
  );
  return (
    <SettingsSection name="Selection & Capture" hidden={!active} className="selection-capture-settings">
      <SettingsField
        layout="feature"
        label="Ask about what you select"
        target="Selection & Capture overview"
        hint="Select text or capture a region, then ask Aux to explain, translate, or turn it into a draft. You review it before sending."
        details={
          <img
            className="setting-illustration"
            src="/settings/selection.webp"
            width={288}
            height={160}
            alt=""
            loading="lazy"
            decoding="async"
          />
        }
      >
        <span className="hint">Available outside Private windows.</span>
      </SettingsField>
      <SettingsGroup title="Text selection">
        <SettingsField
          label="Selection actions"
          hint="Customize the actions in your selection menu. No page scripts or template commands run."
          searchTerms={["Lasso", "prompt", "template", "sort", "double tap"]}
        >
          <ol className="selection-action-list">
            {saved.actions.map((action) => (
              <li className="selection-action-row" key={action.id}>
                <span className="selection-action-glyph" aria-hidden="true">
                  {shellIconAgentSm}
                </span>
                <span className="selection-action-title">{action.name}</span>
                {!action.enabled && <span className="selection-action-state">Off</span>}
                <button
                  {...smallButtonProps}
                  type="button"
                  aria-label={`Edit ${action.name}`}
                  aria-haspopup="dialog"
                  aria-expanded={editor?.kind === "edit" && editor.action.id === action.id}
                  disabled={busy || unavailable}
                  onClick={(event) => openAction(action, event.currentTarget)}
                >
                  ⋯
                </button>
              </li>
            ))}
          </ol>
          <button
            ref={(element) => {
              addButton.current = element;
              publish("add", "add-selection-action", element, () => {
                if (!element) throw new Error("Choose the original Add selection action control.");
                openAction(null, element);
              });
            }}
            {...smallButtonProps}
            disabled={busy || unavailable || saved.actions.length >= 12}
            data-command-id="add-selection-action"
            aria-haspopup="dialog"
            aria-expanded={editor?.kind === "add"}
            onClick={(event) => run("add-selection-action", event)}
          >
            Add selection action
          </button>
        </SettingsField>
        <SettingsField
          compact
          label="Selection double-tap shortcut"
          hint="Press the same shortcut twice to open the selection menu."
        >
          <Hotkey
            label="selection double-tap shortcut"
            value={draft.selectionDoubleTap}
            disabled={busy || unavailable}
            active={active}
            current={current}
            scopeId={scopeId}
            onChange={(selectionDoubleTap) => update({ selectionDoubleTap })}
          />
          <output {...staticHintProps}>{registration("selectionDoubleTap")}</output>
        </SettingsField>
      </SettingsGroup>
      <SettingsGroup title="Screen capture">
        <SettingsField
          compact
          label="Region-capture shortcut"
          hint="Requests an explicit region picker. Review the captured image in the chat draft before sending it."
        >
          <Hotkey
            label="region-capture shortcut"
            value={draft.regionCapture}
            disabled={busy || unavailable}
            active={active}
            current={current}
            scopeId={scopeId}
            onChange={(regionCapture) => update({ regionCapture })}
          />
          <output {...staticHintProps}>{registration("regionCapture")}</output>
        </SettingsField>
      </SettingsGroup>
      <SettingsGroup>
        <SettingsField
          compact
          label="Inline assist"
          hint="On explicit request, read a non-sensitive editable web field, draft a replacement, and apply it only after your review. Turn off to block new capture, drafting and insertion."
        >
          <Switch
            aria-label="Enable inline assist"
            checked={draft.inlineAssist}
            disabled={busy || unavailable}
            controlRef={(element) =>
              publish("inline", "toggle-inline-assist", element, () =>
                update({ inlineAssist: !draftRef.current.inlineAssist }),
              )
            }
            data-command-id="toggle-inline-assist"
            onChange={(event) => run("toggle-inline-assist", event)}
          />
        </SettingsField>
      </SettingsGroup>
      <p className="hint">
        Actions only prepare an editable chat draft. Nothing is sent until you send it. Capture respects the
        source site’s policy.
      </p>
      {saveControls}
      {editor && !unavailable && editor.windowId === windowId && (
        <SelectionActionEditor
          key={editor.key}
          edit={editor}
          connected={connected}
          busy={busy || editor.owner.pending}
          error={error}
          current={() => editorRef.current === editor && current(editor.owner)}
          conflict={!ownBroadcast && JSON.stringify(editor.base) !== savedKey}
          count={saved.actions.length}
          onClose={() => closeEditor(editor)}
          onResume={() => {
            if (editorRef.current !== editor || editor.owner.pending || !connected) return;
            const owner = requireCurrent();
            if (JSON.stringify(editor.base) !== savedKey) return;
            setEditor({ ...editor, owner, connected });
          }}
          onCommit={(value, valueRef, operation) => commitAction(editor, value, valueRef, operation)}
          onReload={(value) => {
            if (editorRef.current !== editor || editor.owner.pending || !connected) return;
            requireCurrent();
            const action =
              editor.kind === "add"
                ? value.action
                : saved.actions.find((item) => item.id === editor.action.id);
            if (!action) {
              setError("The original action was removed. Cancel this editor to continue.");
              return;
            }
            setEditor({
              ...editor,
              key: crypto.randomUUID(),
              action,
              base: saved,
              owner: getOwner(),
              position:
                editor.kind === "add"
                  ? Math.min(value.position, saved.actions.length)
                  : saved.actions.findIndex((item) => item.id === action.id),
            });
          }}
        />
      )}
    </SettingsSection>
  );
}
