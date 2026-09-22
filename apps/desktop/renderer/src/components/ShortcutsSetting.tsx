import { useEffect, useState } from "react";
import {
  bindingKey,
  bindingLabel,
  effectiveShortcuts,
  shortcutConflicts,
  type ShortcutBinding,
  type ShortcutCommandDef,
  type ShortcutOverrides,
} from "@aux/contracts";
import { bridge } from "../bridge";

const MODIFIER_KEYS = new Set(["meta", "control", "shift", "alt"]);

/** A recorded keydown → registry binding. Bare letters stay null so typing can't be shadowed. */
export function bindingFromKeydown(event: Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "shiftKey" | "altKey">, platform: string): ShortcutBinding | null {
  const key = event.key.toLowerCase().replace(/^arrow/, "");
  if (MODIFIER_KEYS.has(key)) return null;
  const command = event.metaKey || (event.ctrlKey && platform !== "darwin");
  const ctrl = event.ctrlKey && platform === "darwin";
  if (!command && !ctrl && !event.altKey && !/^f([1-9]|1[0-9]|2[0-4])$/.test(key)) return null;
  return {
    key,
    ...(command ? { command: true } : {}),
    ...(ctrl ? { ctrl: true } : {}),
    ...(event.shiftKey ? { shift: true } : {}),
    ...(event.altKey ? { alt: true } : {}),
  };
}

interface PendingConflict {
  id: string;
  binding: ShortcutBinding;
  rivals: ShortcutCommandDef[];
}

/**
 * One editable row per registry command. Recording captures the next chord;
 * a colliding chord explains which command holds it and offers to take it —
 * stealing writes the rival's remaining bindings as its override, so the
 * chord only ever resolves to one command.
 */
export function ShortcutsSetting({ value, onSave }: { value: ShortcutOverrides; onSave: (value: ShortcutOverrides) => Promise<boolean> }) {
  const [recording, setRecording] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConflict | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const platform = bridge.platform;
  const defs = effectiveShortcuts(value);
  const conflicts = shortcutConflicts(defs);

  const save = async (next: ShortcutOverrides) => {
    if (busy) return;
    setBusy(true); setError("");
    try { if (!(await onSave(next))) setError("The shortcuts weren’t saved. Try again."); }
    catch { setError("The shortcuts weren’t saved. Try again."); }
    finally { setBusy(false); }
  };

  useEffect(() => {
    if (!recording) return;
    const onKeydown = (event: KeyboardEvent) => {
      // Capture phase + preventDefault keeps the recorded chord from also
      // firing the browser command it would normally trigger.
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") { setRecording(null); return; }
      const binding = bindingFromKeydown(event, platform);
      if (!binding) return;
      setRecording(null);
      const rivals = shortcutConflicts(effectiveShortcuts({ ...value, [recording]: [binding] }))
        .find(entry => bindingKey(entry.binding) === bindingKey(binding))
        ?.commands.filter(def => def.id !== recording) ?? [];
      if (rivals.length) setPending({ id: recording, binding, rivals });
      else void save({ ...value, [recording]: [binding] });
    };
    const cancel = () => setRecording(null);
    window.addEventListener("keydown", onKeydown, true);
    window.addEventListener("blur", cancel);
    return () => { window.removeEventListener("keydown", onKeydown, true); window.removeEventListener("blur", cancel); };
  });

  const steal = (entry: PendingConflict) => {
    const next: ShortcutOverrides = { ...value, [entry.id]: [entry.binding] };
    const chord = bindingKey(entry.binding);
    for (const rival of entry.rivals) next[rival.id] = rival.bindings.filter(b => bindingKey(b) !== chord);
    setPending(null);
    void save(next);
  };

  const reset = (id: string) => {
    const next = { ...value };
    delete next[id];
    void save(next);
  };

  return <div className="shortcuts-setting">
    <ul className="shortcut-list">
      {defs.map(def => {
        const overridden = value[def.id] !== undefined;
        return <li key={def.id} className="shortcut-row">
          <span className="shortcut-label">{def.label}</span>
          <span className="shortcut-chords">
            {def.bindings.length
              ? def.bindings.map(b => <kbd key={bindingKey(b)}>{bindingLabel(b, platform)}</kbd>)
              : <span className="hint">No shortcut</span>}
          </span>
          {recording === def.id
            ? <output className="hint shortcut-recording">Press keys… Esc cancels</output>
            : <button className="btn sm ghost" disabled={busy || recording !== null} onClick={() => { setPending(null); setRecording(def.id); }}>Change</button>}
          {overridden && <button className="btn sm ghost" disabled={busy} aria-label={`Reset ${def.label} shortcut`} onClick={() => reset(def.id)}>Reset</button>}
        </li>;
      })}
    </ul>
    {pending && <p className="field-error" role="alert">
      {bindingLabel(pending.binding, platform)} is used by {pending.rivals.map(def => `“${def.label}”`).join(", ")}.
      <button className="btn sm" disabled={busy} onClick={() => steal(pending)}>Assign anyway — remove it there</button>
      <button className="btn sm ghost" disabled={busy} onClick={() => setPending(null)}>Cancel</button>
    </p>}
    {conflicts.length > 0 && <p className="field-error" role="alert">
      {conflicts.map(entry => `${bindingLabel(entry.binding, platform)} is bound to ${entry.commands.map(def => `“${def.label}”`).join(" and ")}`).join("; ")} — the first command wins; reassign one.
    </p>}
    {error && <p className="field-error" role="alert">{error}</p>}
    {Object.keys(value).length > 0 && <button className="btn sm ghost" disabled={busy} onClick={() => void save({})}>Reset all shortcuts</button>}
  </div>;
}
