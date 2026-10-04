import { smallButtonProps } from "../../ui/button-props";
import { errorMessage } from "../../error-message";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HostMethodResult } from "@aux/contracts";
import { bridge, inNativeHost } from "../../bridge";
import { useFeature } from "../../use-feature";
import { executeCommand } from "../../commands";

type ExtensionCommand = HostMethodResult<"extensionCommands">[number];
function CommandShortcut({ command, refresh }: { command: ExtensionCommand; refresh: () => Promise<void> }) {
  const [shortcut, setShortcut] = useState(command.shortcut);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        setBusy(true);
        setError("");
        try {
          await executeCommand("set-extension-command-shortcut", {
            payload: {
              extensionId: command.extensionId,
              name: command.name,
              shortcut: shortcut.trim(),
            },
          });
          await refresh();
        } catch (reason) {
          setError(errorMessage(reason));
        } finally {
          setBusy(false);
        }
      }}
    >
      <label>
        {command.description}
        <input
          aria-label={`Shortcut for ${command.description}`}
          value={shortcut}
          onChange={(event) => setShortcut(event.target.value)}
          disabled={busy}
          autoComplete="off"
          spellCheck={false}
          placeholder={bridge.platform === "mac" ? "Command+Shift+U" : "Ctrl+Shift+U"}
        />
      </label>
      <button
        type="submit"
        {...smallButtonProps}
        disabled={busy || shortcut.trim() === command.shortcut}
        data-command-id="set-extension-command-shortcut"
      >
        Save shortcut
      </button>
      {error && (
        <p role="alert" className="hint err">
          {error}
        </p>
      )}
    </form>
  );
}
export function ExtensionShortcuts({ active = true }: { active?: boolean }) {
  const [commands, setCommands] = useState<ExtensionCommand[]>([]);
  const [error, setError] = useState("");
  const qualified = useFeature("extensions");
  const available =
    active && qualified && inNativeHost && !bridge.privateMode && bridge.windowKind === "normal";
  const requestState = useRef({ active: false, generation: 0 });
  const refresh = useCallback(async () => {
    const lifecycle = requestState.current;
    const request = ++lifecycle.generation;
    try {
      const items = await bridge.extensionCommands();
      if (lifecycle.active && request === lifecycle.generation) {
        setCommands(items);
        setError("");
      }
    } catch (reason) {
      if (lifecycle.active && request === lifecycle.generation) setError(String(reason));
      throw reason;
    }
  }, []);
  useEffect(() => {
    if (!available) return;
    const lifecycle = requestState.current;
    lifecycle.active = true;
    const load = () => {
      void refresh().catch(() => {});
    };
    load();
    window.addEventListener("focus", load);
    const stop = bridge.onExtensionActionsChanged(load);
    return () => {
      lifecycle.active = false;
      ++lifecycle.generation;
      stop();
      window.removeEventListener("focus", load);
    };
  }, [available, refresh]);
  if (!available) return null;
  return (
    <section aria-label="Extension shortcuts" className="extension-shortcuts">
      <h3>Extensions</h3>
      <p className="hint">
        Aux shortcuts take priority. Enter a Chromium shortcut, or leave it empty to unbind.
      </p>
      {error && (
        <p className="hint err" role="alert">
          {error}
        </p>
      )}
      {!commands.length && !error && <p className="hint">No extension commands available.</p>}
      {commands.map((command) => (
        <CommandShortcut
          key={`${command.extensionId}:${command.name}:${command.shortcut}`}
          command={command}
          refresh={refresh}
        />
      ))}
    </section>
  );
}
