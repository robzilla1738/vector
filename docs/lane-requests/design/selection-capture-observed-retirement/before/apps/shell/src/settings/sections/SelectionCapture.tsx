import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  CaptureHotkeySchema, SelectionCaptureSettingsSchema, readSelectionCaptureSettings, renderSelectionTemplate,
  bindingLabel, captureShortcutConflict, type CaptureHotkey, type SelectionCaptureSettings as Preferences,
  type ShortcutOverrides,
} from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { guardCommandCompletion } from "../../command-completion";
import { useScopedCommandControls } from "../../scoped-command-controls";
import { PreferenceAction } from "./preference-command";
import { bindingFromKeydown } from "../../components/ShortcutsSetting";
import { SettingsField, SettingsSection } from "../primitives";

export interface SelectionCaptureNativeStatus {
  /** A native registration result is meaningful only for the current saved revision. */
  revision: number;
  selectionDoubleTap: { registered: boolean; error?: string };
  regionCapture: { registered: boolean; error?: string };
}

function Hotkey({ label, value, disabled, active, onChange, current, scopeId }: {
  label: string; value: CaptureHotkey | null; disabled: boolean; active: boolean; onChange(value: CaptureHotkey | null): void; current(): boolean; scopeId: string;
}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setRecording(false); }, [active, disabled, current]);
  const requireCurrent = () => { if (!active || disabled || !current()) throw new Error("Choose the current Selection & Capture shortcut."); };
  return <div className="row wrap">
    <kbd>{value ? bindingLabel(value, bridge.platform) : "Off"}</kbd>
    <PreferenceAction command="record-selection-capture-shortcut" scopeId={scopeId} className="btn sm" disabled={disabled} aria-label={`Record ${label}`} aria-pressed={recording}
      invoke={() => { requireCurrent(); setError(""); setRecording(true); }} onBlur={() => setRecording(false)}
      onKeyDown={event => {
        if (!recording || !active || disabled || !current()) return;
        event.preventDefault(); event.stopPropagation();
        if (event.key === "Escape") { setRecording(false); return; }
        const binding = bindingFromKeydown(event, bridge.platform);
        const parsed = CaptureHotkeySchema.safeParse(binding && { key: binding.key, command: !!binding.command,
          ctrl: !!binding.ctrl, alt: !!binding.alt, shift: !!binding.shift });
        if (!parsed.success) { setError("Use Command, Control, or Option with a letter, number, Space, or function key."); return; }
        onChange(parsed.data); setRecording(false); setError("");
      }}>{recording ? "Press shortcut · Esc cancels" : "Record shortcut"}</PreferenceAction>
    {value && <PreferenceAction command="disable-selection-capture-shortcut" scopeId={scopeId} className="btn sm ghost" disabled={disabled} invoke={() => { requireCurrent(); onChange(null); }}>Turn off</PreferenceAction>}
    {error && <span role="alert">{error}</span>}
  </div>;
}

export function SelectionCaptureSettings({ active, settings, onSave, nativeStatus }: {
  active: boolean; settings: Record<string, unknown>; onSave(patch: Record<string, unknown>): Promise<boolean>;
  nativeStatus?: SelectionCaptureNativeStatus;
}) {
  const saved = readSelectionCaptureSettings(settings.selectionCapture);
  const savedKey = JSON.stringify(saved);
  const windowId = bridge.windowId, kind = bridge.windowKind, privateMode = bridge.privateMode;
  const connected = useStore(state => state.connected);
  const unavailable = !active || privateMode || kind !== "normal";
  const identity = useMemo(() => ({ active, savedKey, windowId, kind, privateMode, connected }), [active, savedKey, windowId, kind, privateMode, connected]);
  const owner = useRef({ active: false, pending: false, identity });
  useLayoutEffect(() => {
    const original = { active: true, pending: false, identity };
    owner.current = original;
    return () => { original.active = false; };
  }, [identity]);
  const current = useCallback((original = owner.current) => original.active && original === owner.current && original.identity === identity && active && !privateMode && kind === "normal" && bridge.windowId === windowId && bridge.windowKind === kind && !bridge.privateMode && useStore.getState().connected === connected, [identity, active, privateMode, kind, windowId, connected]);
  const requireCurrent = () => { const original = owner.current; if (!current(original) || original.pending) throw new Error("Choose the current Selection & Capture control."); return original; };
  const scopeId = useId();
  const [publish, run] = useScopedCommandControls(scopeId, () => {
    const original = owner.current;
    return current(original) ? () => current(original) : undefined;
  });
  const [draft, setDraft] = useState<Preferences>(saved);
  const [baseKey, setBaseKey] = useState(savedKey);
  const [pendingOwner, setPendingOwner] = useState<typeof owner.current | null>(null);
  const busy = !!pendingOwner?.active && pendingOwner.identity === identity;
  const [failure, setFailure] = useState<{owner: typeof owner.current; message: string}|null>(null);
  const error = failure?.owner.active && failure.owner.identity === identity ? failure.message : "";
  const setError = (message: string) => setFailure(message ? {owner: owner.current, message} : null);
  const [message, setMessage] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const draftRef = useRef(draft);
  useLayoutEffect(() => { draftRef.current = draft; }, [draft]);
  const dirty = JSON.stringify(draft) !== baseKey;
  const changedElsewhere = savedKey !== baseKey && saved.revision >= draft.revision;
  useEffect(() => {
    if (!dirty && !busy && saved.revision >= draft.revision) { setDraft(readSelectionCaptureSettings(settings.selectionCapture)); setBaseKey(savedKey); }
  }, [savedKey, dirty, busy, settings.selectionCapture, saved.revision, draft.revision]);
  const update = (patch: Partial<Preferences>) => { requireCurrent(); const next = { ...draftRef.current, ...patch }; draftRef.current = next; setDraft(next); setMessage(""); setError(""); };
  const readAction = (id: string) => {
    requireCurrent();
    const actions = draftRef.current.actions, matches = actions.filter(action => action.id === id);
    if (matches.length !== 1) throw new Error("Choose the original Selection & Capture action.");
    return { action: matches[0]!, index: actions.findIndex(action => action.id === id) };
  };
  const updateAction = (id: string, patch: Partial<Preferences["actions"][number]>) => {
    readAction(id);
    update({ actions: draftRef.current.actions.map(action => action.id === id ? { ...action, ...patch } : action) });
  };
  const move = (id: string, delta: number) => {
    const { index } = readAction(id), actions = [...draftRef.current.actions];
    if (index + delta < 0 || index + delta >= actions.length) throw new Error("Choose the current Selection & Capture position.");
    [actions[index], actions[index + delta]] = [actions[index + delta]!, actions[index]!];
    update({ actions });
  };
  const validation = SelectionCaptureSettingsSchema.safeParse(draft);
  const conflict = captureShortcutConflict(draft, settings.shortcutOverrides as ShortcutOverrides | undefined, bridge.platform);
  const save = () => {
    const original = requireCurrent(), savedDraft = draftRef.current;
    const saveValidation = SelectionCaptureSettingsSchema.safeParse(savedDraft);
    if (changedElsewhere || !saveValidation.success || captureShortcutConflict(savedDraft, settings.shortcutOverrides as ShortcutOverrides | undefined, bridge.platform)) return;
    original.pending = true; setPendingOwner(original); setError(""); setMessage("");
    const delivering = () => current(original) && draftRef.current === savedDraft;
    const completion = (async () => {
      try {
        const ack = await onSave({ selectionCapture: saveValidation.data });
        if (delivering()) {
          if (!ack) { setError("Selection & Capture was not saved. Your edits are still here."); return ack; }
          const next = { ...saveValidation.data, revision: saveValidation.data.revision + 1 };
          draftRef.current = next; setDraft(next); setBaseKey(JSON.stringify(next)); setMessage("Saved for this Profile. New selections use these actions.");
        }
        return ack;
      } catch (reason) {
        if (delivering()) setError(reason instanceof Error ? reason.message : "Selection & Capture was not saved. Your edits are still here.");
        throw reason;
      } finally {
        original.pending = false;
        setPendingOwner(previous => previous === original ? null : previous);
      }
    })();
    return guardCommandCompletion(completion, delivering);
  };
  const registration = (key: "selectionDoubleTap" | "regionCapture") => {
    if (!saved[key]) return "Off. No capture shortcut requested.";
    if (!nativeStatus || nativeStatus.revision !== saved.revision) return "Saved request. Native shortcut registration has not been confirmed.";
    const status = nativeStatus[key];
    return status.registered ? "Registered for this Profile." : status.error || "Shortcut unavailable. Choose another shortcut and save again.";
  };
  const selectedPreview = draft.actions.find(action => action.id === previewId);
  let preview = "";
  if (selectedPreview) {
    try { preview = renderSelectionTemplate(selectedPreview.template, { text: "A short example selection.\nconst count = 2;", image: "A locally captured example image" }); }
    catch (reason) { preview = reason instanceof Error ? reason.message : "Invalid template."; }
  }
  return <SettingsSection name="Selection & Capture" hidden={!active}>
    <p className="hint">Actions open an editable chat draft. Nothing is sent to a model until you send it. Capture is unavailable in Private windows and must respect the source site’s policy.</p>
    <SettingsField label="Selection actions" hint="Order controls the selection menu. Use {text} for quoted text, {code} for quoted code, or {image} for a captured image. No page scripts or template commands run." searchTerms={["Lasso", "prompt", "template", "sort", "double tap"]}>
      <ol className="plain-list">
        {draft.actions.map((action, index) => <li key={action.id} className="field">
          <div className="row wrap">
            <label><input type="checkbox" checked={action.enabled} disabled={busy || unavailable} ref={element => publish(`enabled:${action.id}`, "toggle-selection-action", element, () => { requireCurrent(); updateAction(action.id, { enabled: !readAction(action.id).action.enabled }); })} onChange={event => run("toggle-selection-action", event)}/> Enabled</label>
            <input aria-label={`Action ${index + 1} name`} maxLength={60} value={action.name} disabled={busy || unavailable} onChange={event => updateAction(action.id, { name: event.target.value })}/>
            <PreferenceAction command="move-selection-action-up" scopeId={scopeId} className="btn sm ghost" aria-label={`Move ${action.name || "action"} up`} disabled={busy || unavailable || index === 0} invoke={() => { requireCurrent(); move(action.id, -1); }}>↑</PreferenceAction>
            <PreferenceAction command="move-selection-action-down" scopeId={scopeId} className="btn sm ghost" aria-label={`Move ${action.name || "action"} down`} disabled={busy || unavailable || index === draft.actions.length - 1} invoke={() => { requireCurrent(); move(action.id, 1); }}>↓</PreferenceAction>
            <PreferenceAction command="preview-selection-action" scopeId={scopeId} className="btn sm ghost" disabled={busy || unavailable} invoke={() => { readAction(action.id); setPreviewId(action.id); }}>Preview {action.name || "action"}</PreferenceAction>
            <PreferenceAction command="remove-selection-action" scopeId={scopeId} className="btn sm ghost" aria-label={`Remove ${action.name || "action"}`} disabled={busy || unavailable} invoke={() => { readAction(action.id); update({ actions: draftRef.current.actions.filter(value => value.id !== action.id) }); addButton.current?.focus(); }}>Remove</PreferenceAction>
          </div>
          <textarea aria-label={`Action ${index + 1} template`} maxLength={2000} rows={3} value={action.template} disabled={busy || unavailable} onChange={event => updateAction(action.id, { template: event.target.value })}/>
        </li>)}
      </ol>
      <button ref={element => { addButton.current = element; publish("add", "add-selection-action", element, () => update({ actions: [...draftRef.current.actions, { id: crypto.randomUUID(), name: "New action", enabled: true, template: "Explain this selection.\n\n{text}" }] })); }} className="btn sm" disabled={busy || unavailable || draft.actions.length >= 12} data-command-id="add-selection-action" onClick={event => run("add-selection-action", event)}>Add selection action</button>
      {selectedPreview && <section aria-label="Selection action preview"><strong>Local preview · example content</strong><pre style={{ whiteSpace: "pre-wrap" }}>{preview}</pre><PreferenceAction command="close-selection-action-preview" scopeId={scopeId} className="btn sm ghost" invoke={() => { if (!current()) throw new Error("Choose the current Selection & Capture preview."); setPreviewId(null); }}>Close preview</PreferenceAction></section>}
    </SettingsField>
    <SettingsField label="Selection double-tap shortcut" hint="Press the same shortcut twice to request the selection menu. The native handler must ignore held keys; no selection is captured by this settings page.">
      <Hotkey label="selection double-tap shortcut" value={draft.selectionDoubleTap} disabled={busy || unavailable} active={active} current={current} scopeId={scopeId} onChange={selectionDoubleTap => update({ selectionDoubleTap })}/>
      <output className="hint">{registration("selectionDoubleTap")}</output>
    </SettingsField>
    <SettingsField label="Region-capture shortcut" hint="Requests an explicit region picker. Review the captured image in the chat draft before sending it.">
      <Hotkey label="region-capture shortcut" value={draft.regionCapture} disabled={busy || unavailable} active={active} current={current} scopeId={scopeId} onChange={regionCapture => update({ regionCapture })}/>
      <output className="hint">{registration("regionCapture")}</output>
    </SettingsField>
    <SettingsField label="Inline assist" hint="On explicit request, read a non-sensitive editable web field, draft a replacement, and apply it only after your review. Turn off to block new capture, drafting and insertion.">
      <label><input type="checkbox" checked={draft.inlineAssist} disabled={busy || unavailable} ref={element => publish("inline", "toggle-inline-assist", element, () => update({ inlineAssist: !draftRef.current.inlineAssist }))} data-command-id="toggle-inline-assist" onChange={event => run("toggle-inline-assist", event)}/> Enable inline assist</label>
    </SettingsField>
    {changedElsewhere && dirty && <p role="alert">These settings changed in another window. Your edits are preserved; reload the saved version before editing again.</p>}
    {!validation.success && <p role="alert">{validation.error.issues[0]?.message}</p>}
    {conflict && <p role="alert">{conflict}</p>}
    {error && <p role="alert">{error}</p>}
    {message && <output>{message}</output>}
    <div className="row wrap"><PreferenceAction command="save-selection-capture-settings" scopeId={scopeId} className="btn primary" disabled={busy || unavailable || !dirty || changedElsewhere || !validation.success || !!conflict} invoke={save}>{busy ? "Saving…" : "Save Selection & Capture"}</PreferenceAction>
      {(dirty || changedElsewhere) && <PreferenceAction command="reload-selection-capture-settings" scopeId={scopeId} className="btn ghost" disabled={busy || unavailable} invoke={() => { requireCurrent(); draftRef.current = saved; setDraft(saved); setBaseKey(savedKey); setError(""); setMessage("Saved settings reloaded. Unsaved edits discarded."); }}>Reload saved settings</PreferenceAction>}</div>
  </SettingsSection>;
}
