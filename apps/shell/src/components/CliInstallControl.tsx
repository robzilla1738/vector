import { useEffect, useRef, useState } from "react";
import { bridge } from "../bridge";
import { errorMessage } from "../error-message";
import { SettingsField } from "../settings/primitives";
import { Button } from "../ui";

/** Explicit human installation; no agent configuration or credential sharing. */
export function CliInstallControl() {
  const [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const epoch = useRef(0),
    pending = useRef(false);
  const windowId = bridge.windowId,
    kind = bridge.windowKind,
    privateMode = bridge.privateMode;
  useEffect(() => {
    ++epoch.current;
    pending.current = false;
    setBusy(false);
    setMessage("");
    setError("");
    return () => {
      ++epoch.current;
    };
  }, [windowId, kind, privateMode]);
  async function install() {
    if (
      pending.current ||
      bridge.windowId !== windowId ||
      bridge.windowKind !== kind ||
      bridge.privateMode !== privateMode
    )
      return;
    const generation = epoch.current;
    const current = () =>
      epoch.current === generation &&
      bridge.windowId === windowId &&
      bridge.windowKind === kind &&
      bridge.privateMode === privateMode;
    pending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const receipt = await bridge.invoke("developer.cli.install", {});
      if (current())
        setMessage(
          `Installed ${receipt.path}. Use aux open <url> [--profile name].${receipt.pathConfigured ? "" : " Add ~/.local/bin to PATH in your shell to use aux by name."}`,
        );
    } catch (reason) {
      if (current()) setError(errorMessage(reason));
    } finally {
      if (current()) {
        pending.current = false;
        setBusy(false);
      }
    }
  }
  return (
    <SettingsField
      layout="feature"
      label="Aux command line"
      description="Install the bundled aux launcher in ~/.local/bin. Existing commands owned by you stay unchanged."
      searchTerms={["Developers", "CLI", "terminal", "aux open"]}
      details={
        <img
          className="setting-illustration"
          src="/settings/developer.webp"
          width={288}
          height={160}
          alt=""
          loading="lazy"
          decoding="async"
        />
      }
    >
      <Button disabled={busy} onClick={() => void install()}>
        Install aux CLI
      </Button>
      {message && <p role="status">{message}</p>}
      {error && <p role="alert">{error}</p>}
    </SettingsField>
  );
}
