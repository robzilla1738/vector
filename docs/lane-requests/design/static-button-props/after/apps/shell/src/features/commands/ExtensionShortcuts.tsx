import { smallGhostButtonProps } from "../../ui/button-props";
import { useEffect, useState } from "react";
import {
  acceleratorFor,
  bindingLabel,
  effectiveShortcuts,
  matchShortcut,
  type ShortcutOverrides,
  type ShortcutBinding,
} from "@aux/contracts";
import { bridge } from "../../bridge";
import { useStore } from "../../store";
import { bindingFromKeydown, reservedShortcut } from "./shortcut-settings";

export type ExtensionCommand = { extensionId: string; name: string; description: string; shortcut: string };
export function ExtensionShortcuts({
  active,
  commands,
  onSave,
  loading = false,
  loadError = "",
}: {
  active: boolean;
  commands: readonly ExtensionCommand[];
  onSave: (command: ExtensionCommand, shortcut: string) => Promise<boolean>;
  loading?: boolean;
  loadError?: string;
}) {
  const [recording, setRecording] = useState<ExtensionCommand | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!active || !recording) return;
    void bridge.setShortcuts([]).catch(() => setError("Couldn't start shortcut recording. Try again."));
    return () => {
      void bridge
        .setShortcutOverrides((useStore.getState().settings.shortcutOverrides as ShortcutOverrides) ?? {})
        .catch(() => setError("Couldn't restore shortcuts. Reopen Settings."));
    };
  }, [active, recording]);
  useEffect(() => {
    if (!active || !recording) return;
    const keydown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.key === "Escape") {
        setRecording(null);
        return;
      }
      const binding = bindingFromKeydown(event, bridge.platform);
      if (!binding) return;
      const refusal = reservedShortcut(binding, bridge.platform);
      if (refusal) {
        setError(refusal);
        return;
      }
      const rival = matchShortcut(
        effectiveShortcuts(useStore.getState().settings.shortcutOverrides as ShortcutOverrides | undefined),
        {
          key: binding.key,
          meta: !!binding.command,
          ctrl: !!binding.ctrl,
          shift: !!binding.shift,
          alt: !!binding.alt,
        },
        { platform: bridge.platform },
      );
      if (rival) {
        setError(
          `${bindingLabel(binding, bridge.platform)} is used by ${rival.label}. Change the Aux shortcut first.`,
        );
        return;
      }
      const shortcut = extensionAccelerator(binding);
      setRecording(null);
      setBusy(true);
      setError("");
      void onSave(recording, shortcut)
        .then((ok) => {
          if (!ok) throw new Error("Shortcut unavailable");
        })
        .catch(() => setError("The extension shortcut wasn't saved. Choose another shortcut or try again."))
        .finally(() => setBusy(false));
    };
    window.addEventListener("keydown", keydown, true);
    return () => window.removeEventListener("keydown", keydown, true);
  }, [active, recording, onSave]);
  return (
    <section aria-label="Extensions shortcuts">
      <h3>Extensions</h3>
      {loading && <output className="hint">Loading extension shortcuts…</output>}
      {loadError && (
        <p className="field-error" role="alert">
          {loadError}
        </p>
      )}
      {!loading && !loadError && !commands.length && !error && (
        <p className="hint">Installed extensions with keyboard commands appear here.</p>
      )}
      <ul className="shortcut-list">
        {commands.map((command) => (
          <li className="shortcut-row" key={`${command.extensionId}:${command.name}`}>
            <span className="shortcut-label">{command.description || command.name}</span>
            <span className="shortcut-chords">
              <kbd>{command.shortcut || "No shortcut"}</kbd>
            </span>
            {recording === command ? (
              <output className="hint">Press keys… Esc cancels</output>
            ) : (
              <button
                {...smallGhostButtonProps}
                disabled={busy || !!recording}
                aria-label={`Change ${command.description || command.name} extension shortcut`}
                onClick={() => {
                  setError("");
                  setRecording(command);
                }}
              >
                Change
              </button>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p className="field-error" role="alert">
          {error}
        </p>
      )}
    </section>
  );
}
export const extensionAccelerator = (binding: ShortcutBinding) =>
  acceleratorFor(binding).replace("CmdOrCtrl", bridge.platform === "darwin" ? "Command" : "Ctrl");
