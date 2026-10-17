import { staticFieldInputProps, staticFieldErrorProps } from "../ui/class-props";
import { staticHintProps } from "../ui/class-props";
import { smallButtonProps, smallGhostButtonProps } from "../ui/button-props";
import { ExtensionShortcuts } from "../features/extensions/ExtensionShortcuts";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { nativeStatusRoleProps, nativeAlertRoleProps } from "../ui/native-attribute-props";

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
  commandId,
  featuredCommands,
  renderFeaturedCommand,
  disabled = false,
}: {
  value: ShortcutOverrides;
  active?: boolean;
  commandId?: string;
  featuredCommands?: readonly string[];
  renderFeaturedCommand?: (id: string, control: ReactNode) => ReactNode;
  disabled?: boolean;
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
    if (busy || disabled || !active) return;
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
    if (!active || !recording || disabled) return;
    // The recorder must receive chords before native app accelerators.
    void bridge.setShortcuts([]).catch(() => setError("Couldn't start shortcut recording. Try again."));
    return () => {
      void bridge
        .setShortcutOverrides(value)
        .catch(() => setError("Couldn't restore shortcuts. Reopen Settings."));
    };
  }, [active, recording, value, disabled]);

  useEffect(() => {
    if (!active || !recording || disabled) return;
    const onKeydown = (event: KeyboardEvent) => {
      if (
        (commandId || featuredCommands) &&
        event.key === "Tab" &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        setRecording(null);
        return;
      }
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
    if (!active || disabled) setRecording(null);
  }, [active, disabled]);

  useEffect(() => {
    setRecording(null);
    setPending(null);
  }, [commandId, featuredCommands]);

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
  const orderedDefs = featuredCommands
    ? featuredCommands.flatMap((id) => defs.filter((def) => def.id === id))
    : defs;
  const visibleDefs = orderedDefs.filter(
    (def) =>
      (!commandId || def.id === commandId) &&
      `${def.label} ${def.bindings.map((binding) => bindingLabel(binding, platform)).join(" ")}`
        .toLocaleLowerCase()
        .includes(featuredCommands ? "" : query.trim().toLocaleLowerCase()),
  );
  return (
    <div
      className={`shortcuts-setting${commandId ? " shortcut-single" : ""}${featuredCommands ? " shortcut-featured" : ""}`}
    >
      {commandId || featuredCommands ? (
        visibleDefs.map((def) => {
          const control = (
            <div className="shortcut-single-control" key={def.id}>
              <input
                readOnly
                spellCheck={false}
                autoComplete="off"
                aria-label={`Change ${def.label} shortcut`}
                placeholder={recording === def.id ? "Press keys…" : "Not set"}
                value={
                  recording === def.id
                    ? ""
                    : def.bindings.map((binding) => bindingLabel(binding, platform)).join(", ")
                }
                disabled={busy || disabled}
                onFocus={() => {
                  setPending(null);
                  setRecording(def.id);
                }}
                onClick={() => {
                  setPending(null);
                  setRecording(def.id);
                }}
                onBlur={() => setRecording(null)}
              />
              {value[def.id] !== undefined && (
                <button
                  {...smallGhostButtonProps}
                  disabled={busy || disabled}
                  aria-label={`Reset ${def.label} shortcut`}
                  onClick={() => reset(def.id)}
                >
                  Reset
                </button>
              )}
            </div>
          );
          return featuredCommands && renderFeaturedCommand ? renderFeaturedCommand(def.id, control) : control;
        })
      ) : (
        <>
          <p {...staticHintProps}>Make Aux feel familiar. Your shortcuts are saved for this Profile.</p>
          <div className="field-row">
            <button {...smallButtonProps} disabled={busy || disabled} onClick={exportFile}>
              Export shortcuts
            </button>
            <button
              {...smallButtonProps}
              disabled={busy || disabled}
              onClick={() => importInput.current?.click()}
            >
              Import shortcuts
            </button>
            <input
              ref={importInput}
              hidden
              type="file"
              accept="application/json,.json"
              aria-label="Import shortcuts"
              disabled={busy || disabled}
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
            {...staticFieldInputProps}
            aria-label="Find keyboard shortcut"
            placeholder="Find a command or shortcut…"
            value={query}
            disabled={recording !== null}
            onChange={(event) => setQuery(event.target.value)}
          />
          {!visibleDefs.length && (
            <p {...staticHintProps} {...nativeStatusRoleProps}>
              No matching shortcuts. Try another command name.
            </p>
          )}
          <ul className="shortcut-list">
            {visibleDefs.map((def) => {
              const overridden = value[def.id] !== undefined;
              return (
                <li key={def.id} className="shortcut-row">
                  <span className="shortcut-label">
                    <span {...staticHintProps}>
                      {COMMANDS.find((command) => command.id === def.id)?.section}
                    </span>{" "}
                    {def.label}
                  </span>
                  <span className="shortcut-chords">
                    {def.bindings.length ? (
                      def.bindings.map((b) => <kbd key={bindingKey(b)}>{bindingLabel(b, platform)}</kbd>)
                    ) : (
                      <span {...staticHintProps}>No shortcut</span>
                    )}
                  </span>
                  {recording === def.id ? (
                    <output className="hint shortcut-recording">Press keys… Esc cancels</output>
                  ) : (
                    <button
                      {...smallGhostButtonProps}
                      aria-label={`Change ${def.label} shortcut`}
                      disabled={busy || disabled || recording !== null}
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
                      disabled={busy || disabled}
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
        </>
      )}
      {pending && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {bindingLabel(pending.binding, platform)} is used by{" "}
          {pending.rivals.map((def) => `“${def.label}”`).join(", ")}.
          <button {...smallButtonProps} disabled={busy || disabled} onClick={() => steal(pending)}>
            Assign anyway — remove it there
          </button>
          <button {...smallGhostButtonProps} disabled={busy || disabled} onClick={() => setPending(null)}>
            Cancel
          </button>
        </p>
      )}
      {conflicts.length > 0 && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {conflicts
            .map(
              (entry) =>
                `${bindingLabel(entry.binding, platform)} is bound to ${entry.ids.map((id) => `“${defs.find((def) => def.id === id)?.label ?? id}”`).join(" and ")}`,
            )
            .join("; ")}{" "}
          — the first command wins; reassign one.
        </p>
      )}
      {notice && <output {...staticHintProps}>{notice}</output>}
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
      {!commandId && !featuredCommands && Object.keys(value).length > 0 && (
        <button {...smallGhostButtonProps} disabled={busy || disabled} onClick={() => void save({})}>
          Reset all shortcuts
        </button>
      )}
      {!commandId && !featuredCommands && <ExtensionShortcuts active={active} />}
    </div>
  );
}
