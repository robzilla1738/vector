import { staticHintProps } from "../../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../../ui/button-props";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CaptureHotkeySchema,
  SelectionCaptureSettingsSchema,
  readSelectionCaptureSettings,
  renderSelectionTemplate,
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
import { SettingsDialogControl } from "../SettingsDialogControl";
import "./SelectionCapture.css";
import {
  staticPrimaryButtonProps as auxClassPrimaryButtonProps,
  staticGhostButtonProps as auxClassGhostButtonProps,
} from "../../ui/class-props";
import { nativeAlertRoleProps, nativeCheckboxTypeProps } from "../../ui/native-attribute-props";

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

function ActionRow({
  action,
  active,
  defaultOpen,
  previewContent,
  saveControls,
  index,
  count,
  disabled,
  scopeId,
  publish,
  run,
  toggle,
  change,
  move,
  preview,
  remove,
}: {
  action: Preferences["actions"][number];
  active: boolean;
  defaultOpen: boolean;
  previewContent?: ReactNode;
  saveControls: ReactNode;
  index: number;
  count: number;
  disabled: boolean;
  scopeId: string;
  publish: ReturnType<typeof useScopedCommandControls>[0];
  run: ReturnType<typeof useScopedCommandControls>[1];
  toggle(id: string): void;
  change(id: string, patch: Partial<Preferences["actions"][number]>): void;
  move(id: string, delta: number): void;
  preview(id: string): void;
  remove(id: string): void;
}) {
  const nameInput = useRef<HTMLInputElement>(null);
  return (
    <li className="selection-action-row">
      <span>{action.name || "Untitled action"}</span>
      {!action.enabled && <span className="selection-action-state">Off</span>}
      <SettingsDialogControl
        active={active}
        defaultOpen={defaultOpen}
        label={`Edit ${action.name || "action"}`}
        action="⋯"
      >
        <div className="selection-action-editor">
          <label className="selection-action-name">
            Name
            <input
              ref={nameInput}
              aria-label={`Action ${index + 1} name`}
              maxLength={60}
              value={action.name}
              disabled={disabled}
              onChange={(event) => change(action.id, { name: event.target.value })}
            />
          </label>
          <div className="settings-editor-actions">
            <label className="settings-editor-checkbox">
              <input
                {...nativeCheckboxTypeProps}
                checked={action.enabled}
                disabled={disabled}
                ref={(element) =>
                  publish(`enabled:${action.id}`, "toggle-selection-action", element, () => toggle(action.id))
                }
                onChange={(event) => run("toggle-selection-action", event)}
              />{" "}
              Enabled
            </label>
            <PreferenceAction
              command="move-selection-action-up"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Move ${action.name || "action"} up`}
              disabled={disabled || index === 0}
              invoke={() => {
                move(action.id, -1);
                nameInput.current?.focus();
              }}
            >
              ↑
            </PreferenceAction>
            <PreferenceAction
              command="move-selection-action-down"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Move ${action.name || "action"} down`}
              disabled={disabled || index === count - 1}
              invoke={() => {
                move(action.id, 1);
                nameInput.current?.focus();
              }}
            >
              ↓
            </PreferenceAction>
          </div>
          <textarea
            aria-label={`Action ${index + 1} template`}
            maxLength={2000}
            rows={3}
            value={action.template}
            disabled={disabled}
            onChange={(event) => change(action.id, { template: event.target.value })}
          />
          <p className="hint">
            Use {"{text}"} for quoted text, {"{code}"} for code, or {"{image}"} for a capture. Edits stay in
            this draft until you save Selection &amp; Capture.
          </p>
          <div className="settings-editor-actions">
            <PreferenceAction
              command="preview-selection-action"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              disabled={disabled}
              invoke={() => preview(action.id)}
            >
              Preview {action.name || "action"}
            </PreferenceAction>
            <PreferenceAction
              command="remove-selection-action"
              scopeId={scopeId}
              {...smallGhostButtonProps}
              aria-label={`Remove ${action.name || "action"}`}
              disabled={disabled}
              invoke={() => remove(action.id)}
            >
              Remove
            </PreferenceAction>
          </div>
          {previewContent}
          {saveControls}
        </div>
      </SettingsDialogControl>
    </li>
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
  const saved = readSelectionCaptureSettings(settings.selectionCapture);
  const savedKey = JSON.stringify(saved);
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  const connected = useStore((state) => state.connected);
  const unavailable = !active || privateMode || kind !== "normal";
  const acknowledgedKey = useRef<string | null>(null);
  const pendingSave = useRef<{ owner: SettingsSaveOwner; baseKey: string; expectedKey: string } | null>(null);
  const receipt = pendingSave.current;
  // The runtime broadcasts persisted settings before replying to the save request.
  // Exact pending or previously acknowledged values retain the live save owner.
  const ownBroadcast =
    !!receipt?.owner.active &&
    receipt.owner.pending &&
    (receipt.expectedKey === savedKey || acknowledgedKey.current === savedKey);
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
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [createdActionId, setCreatedActionId] = useState<string | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const draftRef = useRef(draft);
  useLayoutEffect(() => {
    draftRef.current = draft;
  }, [draft]);
  const dirty = JSON.stringify(draft) !== baseKey;
  const changedElsewhere = !ownBroadcast && savedKey !== baseKey && saved.revision >= draft.revision;
  useEffect(() => {
    if (!dirty && !busy && saved.revision >= draft.revision) {
      setDraft(readSelectionCaptureSettings(settings.selectionCapture));
      setBaseKey(savedKey);
    }
  }, [savedKey, dirty, busy, settings.selectionCapture, saved.revision, draft.revision]);
  const update = (patch: Partial<Preferences>) => {
    requireCurrent();
    const next = { ...draftRef.current, ...patch };
    draftRef.current = next;
    setDraft(next);
    setMessage("");
    setError("");
  };
  const readAction = (id: string) => {
    requireCurrent();
    const actions = draftRef.current.actions,
      matches = actions.filter((action) => action.id === id);
    if (matches.length !== 1) throw new Error("Choose the original Selection & Capture action.");
    return { action: matches[0]!, index: actions.findIndex((action) => action.id === id) };
  };
  const updateAction = (id: string, patch: Partial<Preferences["actions"][number]>) => {
    readAction(id);
    update({
      actions: draftRef.current.actions.map((action) =>
        action.id === id ? { ...action, ...patch } : action,
      ),
    });
  };
  const move = (id: string, delta: number) => {
    const { index } = readAction(id),
      actions = [...draftRef.current.actions];
    if (index + delta < 0 || index + delta >= actions.length)
      throw new Error("Choose the current Selection & Capture position.");
    [actions[index], actions[index + delta]] = [actions[index + delta]!, actions[index]!];
    update({ actions });
  };
  const toggleAction = (id: string) => {
    requireCurrent();
    updateAction(id, { enabled: !readAction(id).action.enabled });
  };
  const moveAction = (id: string, delta: number) => {
    requireCurrent();
    move(id, delta);
  };
  const previewAction = (id: string) => {
    readAction(id);
    setPreviewId(id);
  };
  const removeAction = (id: string) => {
    readAction(id);
    update({ actions: draftRef.current.actions.filter((value) => value.id !== id) });
    addButton.current?.focus();
  };
  const validation = SelectionCaptureSettingsSchema.safeParse(draft);
  const conflict = captureShortcutConflict(
    draft,
    settings.shortcutOverrides as ShortcutOverrides | undefined,
    bridge.platform,
  );
  const save = () => {
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
        acknowledgedKey.current = JSON.stringify(next);
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
  const selectedPreview = draft.actions.find((action) => action.id === previewId);
  let preview = "";
  if (selectedPreview) {
    try {
      preview = renderSelectionTemplate(selectedPreview.template, {
        text: "A short example selection.\nconst count = 2;",
        image: "A locally captured example image",
      });
    } catch (reason) {
      preview = reason instanceof Error ? reason.message : "Invalid template.";
    }
  }
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
          disabled={busy || unavailable || !dirty || changedElsewhere || !validation.success || !!conflict}
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
          <div className="selection-capture-preview" aria-hidden="true">
            <div className="selection-preview-document">
              <span />
              <span />
              <mark>Make sense of any page.</mark>
              <span />
            </div>
            <div className="selection-preview-menu">
              <strong>Ask Aux</strong>
              <span>Explain</span>
              <span>Translate</span>
            </div>
          </div>
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
            {draft.actions.map((action, index) => (
              <ActionRow
                key={action.id}
                action={action}
                defaultOpen={action.id === createdActionId}
                saveControls={saveControls}
                active={!unavailable}
                previewContent={
                  <>
                    {selectedPreview?.id === action.id && (
                      <section aria-label="Selection action preview">
                        <strong>Local preview · example content</strong>
                        <pre style={{ whiteSpace: "pre-wrap" }}>{preview}</pre>
                        <PreferenceAction
                          command="close-selection-action-preview"
                          scopeId={scopeId}
                          {...smallGhostButtonProps}
                          invoke={() => {
                            if (!current())
                              throw new Error("Choose the current Selection & Capture preview.");
                            setPreviewId(null);
                          }}
                        >
                          Close preview
                        </PreferenceAction>
                      </section>
                    )}
                  </>
                }
                index={index}
                count={draft.actions.length}
                disabled={busy || unavailable}
                scopeId={scopeId}
                publish={publish}
                run={run}
                toggle={toggleAction}
                change={updateAction}
                move={moveAction}
                preview={previewAction}
                remove={removeAction}
              />
            ))}
          </ol>
          <button
            ref={(element) => {
              addButton.current = element;
              publish("add", "add-selection-action", element, () => {
                const id = crypto.randomUUID();
                update({
                  actions: [
                    ...draftRef.current.actions,
                    {
                      id,
                      name: "New action",
                      enabled: true,
                      template: "Explain this selection.\n\n{text}",
                    },
                  ],
                });
                setCreatedActionId(id);
              });
            }}
            {...smallButtonProps}
            disabled={busy || unavailable || draft.actions.length >= 12}
            data-command-id="add-selection-action"
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
    </SettingsSection>
  );
}
