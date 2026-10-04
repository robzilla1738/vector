import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { ExtensionShortcuts } from "../features/extensions/ExtensionShortcuts";
import { useEffect, useRef, useState } from "react";
import {
  bindingKey,
  bindingLabel,
  effectiveShortcuts,
  type ShortcutBinding,
  type ShortcutCommandDef,
  type ShortcutOverrides,
} from "@aux/contracts/shortcut-defs";
import { bridge } from "../bridge";
import {
  bindingFromKeydown,
  exportShortcuts,
  importShortcuts,
  platformConflicts,
  reservedShortcut,
  shortcutWarning,
} from "../features/commands/shortcut-settings";
import { FeatureSettings } from "../features/registry";
import { COMMANDS } from "@aux/contracts";

export { bindingFromKeydown } from "../features/commands/shortcut-settings";

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
export function ShortcutsSetting({
  value,
  onSave,
  active = true,
}: {
  value: ShortcutOverrides;
  active?: boolean;
  onSave: (value: ShortcutOverrides) => Promise<boolean>;
}) {
  const importInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [recording, setRecording] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingConflict | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const platform = bridge.platform;
  const defs = effectiveShortcuts(value);
  const conflicts = platformConflicts(value, platform);
  const [notice, setNotice] = useState("");

  const save = async (next: ShortcutOverrides) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (!(await onSave(next))) setError("The shortcuts weren’t saved. Try again.");
    } catch {
      setError("The shortcuts weren’t saved. Try again.");
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (!active || !recording) return;
    // The recorder must receive chords before native app accelerators.
    void bridge.setShortcuts([]).catch(() => setError("Couldn't start shortcut recording. Try again."));
    return () => {
      void bridge
        .setShortcutOverrides(value)
        .catch(() => setError("Couldn't restore shortcuts. Reopen Settings."));
    };
  }, [active, recording, value]);

  useEffect(() => {
    if (!active || !recording) return;
    const onKeydown = (event: KeyboardEvent) => {
      // Capture phase + preventDefault keeps the recorded chord from also
      // firing the browser command it would normally trigger.
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        setRecording(null);
        return;
      }
      const binding = bindingFromKeydown(event, platform);
      if (!binding) return;
      const reserved = reservedShortcut(binding, platform);
      if (reserved) {
        setError(reserved);
        return;
      }
      setNotice(shortcutWarning(binding, platform) ?? "");
      setRecording(null);
      const rivalIds =
        platformConflicts({ ...value, [recording]: [binding] }, platform).find((entry) =>
          entry.ids.includes(recording),
        )?.ids ?? [];
      const rivals = defs.filter((def) => def.id !== recording && rivalIds.includes(def.id));
      if (rivals.length) setPending({ id: recording, binding, rivals });
      else void save({ ...value, [recording]: [binding] });
    };
    const cancel = () => setRecording(null);
    window.addEventListener("keydown", onKeydown, true);
    window.addEventListener("blur", cancel);
    return () => {
      window.removeEventListener("keydown", onKeydown, true);
      window.removeEventListener("blur", cancel);
    };
  });

  useEffect(() => {
    if (!active) setRecording(null);
  }, [active]);

  const steal = (entry: PendingConflict) => {
    const next: ShortcutOverrides = { ...value, [entry.id]: [entry.binding] };
    const chord = bindingKey(entry.binding);
    for (const rival of entry.rivals) next[rival.id] = rival.bindings.filter((b) => bindingKey(b) !== chord);
    setPending(null);
    void save(next);
  };

  const reset = (id: string) => {
    const next = { ...value };
    delete next[id];
    void save(next);
  };

  const exportFile = () => {
    const url = URL.createObjectURL(new Blob([exportShortcuts(value)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "aux-shortcuts.json";
    link.click();
    URL.revokeObjectURL(url);
  };
  const visibleDefs = defs.filter((def) =>
    `${def.label} ${def.bindings.map((binding) => bindingLabel(binding, platform)).join(" ")}`
      .toLocaleLowerCase()
      .includes(query.trim().toLocaleLowerCase()),
  );
  return (
    <div className="shortcuts-setting">
      <p className="hint">Make Aux feel familiar. Your shortcuts are saved for this Profile.</p>
      <div className="field-row">
        <button {...smallButtonProps} disabled={busy} onClick={exportFile}>
          Export shortcuts
        </button>
        <button {...smallButtonProps} disabled={busy} onClick={() => importInput.current?.click()}>
          Import shortcuts
        </button>
        <input
          ref={importInput}
          hidden
          type="file"
          accept="application/json,.json"
          aria-label="Import shortcuts"
          disabled={busy}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file)
              void file
                .text()
                .then((text) => save(importShortcuts(text, platform)))
                .catch((error) =>
                  setError(error instanceof Error ? error.message : "Couldn't import shortcuts."),
                );
          }}
        />
      </div>
      <input
        className="field-input"
        aria-label="Find keyboard shortcut"
        placeholder="Find a command or shortcut…"
        value={query}
        disabled={recording !== null}
        onChange={(event) => setQuery(event.target.value)}
      />
      {!visibleDefs.length && (
        <p className="hint" role="status">
          No matching shortcuts. Try another command name.
        </p>
      )}
      <ul className="shortcut-list">
        {visibleDefs.map((def) => {
          const overridden = value[def.id] !== undefined;
          return (
            <li key={def.id} className="shortcut-row">
              <span className="shortcut-label">
                <span className="hint">{COMMANDS.find((command) => command.id === def.id)?.section}</span>{" "}
                {def.label}
              </span>
              <span className="shortcut-chords">
                {def.bindings.length ? (
                  def.bindings.map((b) => <kbd key={bindingKey(b)}>{bindingLabel(b, platform)}</kbd>)
                ) : (
                  <span className="hint">No shortcut</span>
                )}
              </span>
              {recording === def.id ? (
                <output className="hint shortcut-recording">Press keys… Esc cancels</output>
              ) : (
                <button
                  {...smallGhostButtonProps}
                  aria-label={`Change ${def.label} shortcut`}
                  disabled={busy || recording !== null}
                  onClick={() => {
                    setPending(null);
                    setRecording(def.id);
                  }}
                >
                  Change
                </button>
              )}
              {overridden && (
                <button
                  {...smallGhostButtonProps}
                  disabled={busy}
                  aria-label={`Reset ${def.label} shortcut`}
                  onClick={() => reset(def.id)}
                >
                  Reset
                </button>
              )}
            </li>
          );
        })}
      </ul>
      {active && <FeatureSettings category="Keyboard shortcuts" />}
      {pending && (
        <p className="field-error" role="alert">
          {bindingLabel(pending.binding, platform)} is used by{" "}
          {pending.rivals.map((def) => `“${def.label}”`).join(", ")}.
          <button {...smallButtonProps} disabled={busy} onClick={() => steal(pending)}>
            Assign anyway — remove it there
          </button>
          <button {...smallGhostButtonProps} disabled={busy} onClick={() => setPending(null)}>
            Cancel
          </button>
        </p>
      )}
      {conflicts.length > 0 && (
        <p className="field-error" role="alert">
          {conflicts
            .map(
              (entry) =>
                `${bindingLabel(entry.binding, platform)} is bound to ${entry.ids.map((id) => `“${defs.find((def) => def.id === id)?.label ?? id}”`).join(" and ")}`,
            )
            .join("; ")}{" "}
          — the first command wins; reassign one.
        </p>
      )}
      {notice && <output className="hint">{notice}</output>}
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
      {Object.keys(value).length > 0 && (
        <button {...smallGhostButtonProps} disabled={busy} onClick={() => void save({})}>
          Reset all shortcuts
        </button>
      )}
      <ExtensionShortcuts active={active} />
    </div>
  );
}
