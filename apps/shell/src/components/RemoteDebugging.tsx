import { useCallback, useEffect, useRef, useState } from "react";
import type { RemoteDebuggingState } from "@aux/contracts/remote-debugging";
import { bridge } from "../bridge";
import { SettingsField } from "../settings/primitives";
import { Switch } from "../ui";

function listenerLabel(state: RemoteDebuggingState | null): string {
  if (!state) return "Checking the native listener…";
  switch (state.state) {
    case "listening":
      return `Listening on ${state.address}`;
    case "managed-disabled":
      return "Remote debugging is disabled by your administrator.";
    case "unavailable":
      return "The native remote debugging listener is unavailable.";
    case "starting":
      return "Starting the native listener…";
    case "stopping":
      return "Closing the native listener…";
    case "failed":
      return "The native listener could not start. Turn it off before retrying.";
    case "off":
      return "Remote debugging is off.";
  }
}

export function RemoteDebugging() {
  const [state, setState] = useState<RemoteDebuggingState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const epoch = useRef(0);
  const pending = useRef(false);
  const refresh = useCallback(async () => {
    if (pending.current) return;
    const request = ++epoch.current;
    try {
      const next = await bridge.invoke("settings.remoteDebugging.get", {});
      if (request === epoch.current) {
        setState(next);
        setError("");
      }
    } catch (cause) {
      if (request === epoch.current) setError(cause instanceof Error ? cause.message : String(cause));
    }
  }, []);
  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      ++epoch.current;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);
  useEffect(() => {
    if (state?.state !== "starting" && state?.state !== "stopping") return;
    const timer = window.setTimeout(() => void refresh(), 250);
    return () => window.clearTimeout(timer);
  }, [state, refresh]);
  const change = async (enabled: boolean) => {
    const request = ++epoch.current;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      // The native ACK follows actual bind/close completion. Keep the saved
      // switch value until then, rather than pretending a preference is live.
      const next = await bridge.invoke("settings.remoteDebugging.set", { enabled });
      if (request === epoch.current) setState(next);
    } catch (cause) {
      if (request === epoch.current) setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      pending.current = false;
      if (request === epoch.current) {
        setBusy(false);
        void refresh();
      }
    }
  };
  return (
    <div>
      <SettingsField
        label="Remote debugging"
        description="Allow Playwright, Puppeteer and other local CDP clients to control Aux through its loopback port. Off by default."
        searchTerms={["Developers", "CDP", "Playwright", "Puppeteer", "9222"]}
      >
        <Switch
          aria-label="Remote debugging"
          checked={state?.enabled ?? false}
          disabled={
            busy ||
            !state?.available ||
            !state.canChange ||
            state.state === "starting" ||
            state.state === "stopping"
          }
          onChange={(event) => void change(event.currentTarget.checked)}
        />
      </SettingsField>
      <p role="status" className="hint">
        {listenerLabel(state)}
      </p>
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
