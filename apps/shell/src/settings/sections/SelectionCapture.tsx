import { useEffect, useRef, useState } from "react";
import {
  CaptureHotkeySchema, SelectionCaptureSettingsSchema, readSelectionCaptureSettings, renderSelectionTemplate,
  bindingLabel, captureShortcutConflict, type CaptureHotkey, type SelectionCaptureSettings as Preferences,
  type ShortcutOverrides,
} from "@aux/contracts";
import { bridge } from "../../bridge";
import { bindingFromKeydown } from "../../components/ShortcutsSetting";
import { SettingsField, SettingsSection } from "../primitives";

export interface SelectionCaptureNativeStatus {
  /** A native registration result is meaningful only for the current saved revision. */
  revision: number;
  selectionDoubleTap: { registered: boolean; error?: string };
  regionCapture: { registered: boolean; error?: string };
}

function Hotkey({ label, value, disabled, active, onChange }: {
  label: string; value: CaptureHotkey | null; disabled: boolean; active: boolean; onChange(value: CaptureHotkey | null): void;
}) {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { if (!active || disabled) setRecording(false); }, [active, disabled]);
  return <div className="row wrap">
    <kbd>{value ? bindingLabel(value, bridge.platform) : "Off"}</kbd>
    <button className="btn sm" disabled={disabled} aria-label={`Record ${label}`} aria-pressed={recording}
      onClick={() => { setError(""); setRecording(true); }} onBlur={() => setRecording(false)}
      onKeyDown={event => {
        if (!recording) return;
        event.preventDefault(); event.stopPropagation();
        if (event.key === "Escape") { setRecording(false); return; }
        const binding = bindingFromKeydown(event, bridge.platform);
        const parsed = CaptureHotkeySchema.safeParse(binding && { key: binding.key, command: !!binding.command,
          ctrl: !!binding.ctrl, alt: !!binding.alt, shift: !!binding.shift });
        if (!parsed.success) { setError("Use Command, Control, or Option with a letter, number, Space, or function key."); return; }
        onChange(parsed.data); setRecording(false); setError("");
      }}>{recording ? "Press shortcut · Esc cancels" : "Record shortcut"}</button>
    {value && <button className="btn sm ghost" disabled={disabled} onClick={() => onChange(null)}>Turn off</button>}
    {error && <span role="alert">{error}</span>}
  </div>;
}

export function SelectionCaptureSettings({ active, settings, onSave, nativeStatus }: {
  active: boolean; settings: Record<string, unknown>; onSave(patch: Record<string, unknown>): Promise<boolean>;
  nativeStatus?: SelectionCaptureNativeStatus;
}) {
  const saved = readSelectionCaptureSettings(settings.selectionCapture);
  const savedKey = JSON.stringify(saved);
  const [draft, setDraft] = useState<Preferences>(saved);
  const [baseKey, setBaseKey] = useState(savedKey);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const addButton = useRef<HTMLButtonElement>(null);
  const dirty = JSON.stringify(draft) !== baseKey;
  const changedElsewhere = savedKey !== baseKey && saved.revision >= draft.revision;
  useEffect(() => {
    if (!dirty && !busy && saved.revision >= draft.revision) { setDraft(readSelectionCaptureSettings(settings.selectionCapture)); setBaseKey(savedKey); }
  }, [savedKey, dirty, busy, settings.selectionCapture, saved.revision, draft.revision]);
  const update = (patch: Partial<Preferences>) => { setDraft(current => ({ ...current, ...patch })); setMessage(""); setError(""); };
  const updateAction = (index: number, patch: Partial<Preferences["actions"][number]>) =>
    update({ actions: draft.actions.map((action, at) => at === index ? { ...action, ...patch } : action) });
  const move = (index: number, delta: number) => {
    const actions = [...draft.actions];
    [actions[index], actions[index + delta]] = [actions[index + delta]!, actions[index]!];
    update({ actions });
  };
  const validation = SelectionCaptureSettingsSchema.safeParse(draft);
  const conflict = captureShortcutConflict(draft, settings.shortcutOverrides as ShortcutOverrides | undefined, bridge.platform);
  const save = async () => {
    if (busy || changedElsewhere || !validation.success || conflict) return;
    setBusy(true); setError(""); setMessage("");
    try {
      if (!await onSave({ selectionCapture: validation.data })) throw new Error("Selection & Capture was not saved. Your edits are still here.");
      const next = { ...validation.data, revision: validation.data.revision + 1 };
      setDraft(next); setBaseKey(JSON.stringify(next)); setMessage("Saved for this Profile. New selections use these actions.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Selection & Capture was not saved. Your edits are still here."); }
    finally { setBusy(false); }
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
            <label><input type="checkbox" checked={action.enabled} disabled={busy} onChange={event => updateAction(index, { enabled: event.target.checked })}/> Enabled</label>
            <input aria-label={`Action ${index + 1} name`} maxLength={60} value={action.name} disabled={busy} onChange={event => updateAction(index, { name: event.target.value })}/>
            <button className="btn sm ghost" aria-label={`Move ${action.name || "action"} up`} disabled={busy || index === 0} onClick={() => move(index, -1)}>↑</button>
            <button className="btn sm ghost" aria-label={`Move ${action.name || "action"} down`} disabled={busy || index === draft.actions.length - 1} onClick={() => move(index, 1)}>↓</button>
            <button className="btn sm ghost" disabled={busy} onClick={() => setPreviewId(action.id)}>Preview {action.name || "action"}</button>
            <button className="btn sm ghost" aria-label={`Remove ${action.name || "action"}`} disabled={busy} onClick={() => { update({ actions: draft.actions.filter(value => value.id !== action.id) }); addButton.current?.focus(); }}>Remove</button>
          </div>
          <textarea aria-label={`Action ${index + 1} template`} maxLength={2000} rows={3} value={action.template} disabled={busy} onChange={event => updateAction(index, { template: event.target.value })}/>
        </li>)}
      </ol>
      <button ref={addButton} className="btn sm" disabled={busy || draft.actions.length >= 12} onClick={() => update({ actions: [...draft.actions, { id: crypto.randomUUID(), name: "New action", enabled: true, template: "Explain this selection.\n\n{text}" }] })}>Add selection action</button>
      {selectedPreview && <section aria-label="Selection action preview"><strong>Local preview · example content</strong><pre style={{ whiteSpace: "pre-wrap" }}>{preview}</pre><button className="btn sm ghost" onClick={() => setPreviewId(null)}>Close preview</button></section>}
    </SettingsField>
    <SettingsField label="Selection double-tap shortcut" hint="Press the same shortcut twice to request the selection menu. The native handler must ignore held keys; no selection is captured by this settings page.">
      <Hotkey label="selection double-tap shortcut" value={draft.selectionDoubleTap} disabled={busy} active={active} onChange={selectionDoubleTap => update({ selectionDoubleTap })}/>
      <output className="hint">{registration("selectionDoubleTap")}</output>
    </SettingsField>
    <SettingsField label="Region-capture shortcut" hint="Requests an explicit region picker. Review the captured image in the chat draft before sending it.">
      <Hotkey label="region-capture shortcut" value={draft.regionCapture} disabled={busy} active={active} onChange={regionCapture => update({ regionCapture })}/>
      <output className="hint">{registration("regionCapture")}</output>
    </SettingsField>
    <SettingsField label="Inline assist" hint="On explicit request, read a non-sensitive editable web field, draft a replacement, and apply it only after your review. Turn off to block new capture, drafting and insertion.">
      <label><input type="checkbox" checked={draft.inlineAssist} disabled={busy} onChange={event => update({ inlineAssist: event.target.checked })}/> Enable inline assist</label>
    </SettingsField>
    {changedElsewhere && dirty && <p role="alert">These settings changed in another window. Your edits are preserved; reload the saved version before editing again.</p>}
    {!validation.success && <p role="alert">{validation.error.issues[0]?.message}</p>}
    {conflict && <p role="alert">{conflict}</p>}
    {error && <p role="alert">{error}</p>}
    {message && <output>{message}</output>}
    <div className="row wrap"><button className="btn primary" disabled={busy || !dirty || changedElsewhere || !validation.success || !!conflict} onClick={() => void save()}>{busy ? "Saving…" : "Save Selection & Capture"}</button>
      {(dirty || changedElsewhere) && <button className="btn ghost" disabled={busy} onClick={() => { setDraft(saved); setBaseKey(savedKey); setError(""); setMessage("Saved settings reloaded. Unsaved edits discarded."); }}>Reload saved settings</button>}</div>
  </SettingsSection>;
}
