import { staticFieldProps, staticFieldErrorProps } from "../ui/class-props";
import { staticRowProps, staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useState } from "react";
import { bridge, inNativeHost } from "../bridge";
import { toast, useStore } from "../store";
import { nativeAlertRoleProps } from "../ui/native-attribute-props";

export function PasswordTransferSetting() {
  const [passphrase, setPassphrase] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function transfer(kind: "export" | "import") {
    setBusy(true);
    setError("");
    try {
      if (kind === "export") {
        const result = await bridge.passwordExport(passphrase);
        if (result)
          toast(
            `Encrypted password file saved to ${result.path}. ${result.exported} saved password${result.exported === 1 ? "" : "s"}${result.skipped ? `; ${result.skipped} unsupported item${result.skipped === 1 ? "" : "s"} not exported` : ""}.`,
          );
      } else {
        const result = await bridge.passwordImport(passphrase);
        if (result)
          toast(
            `${result.added} password${result.added === 1 ? "" : "s"} imported${result.skipped ? `; ${result.skipped} skipped` : ""}.`,
          );
      }
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setPassphrase("");
      setBusy(false);
    }
  }

  return (
    <div {...staticFieldProps}>
      <div {...staticRowProps}>
        <button
          {...smallButtonProps}
          disabled={!inNativeHost}
          onClick={() =>
            void useStore
              .getState()
              .newTab("chrome://password-manager/settings")
              .catch((reason) => setError(String(reason)))
          }
        >
          Manage saved passwords
        </button>
      </div>
      <p {...staticHintProps}>
        Import or export Chromium Profile passwords in a passphrase-encrypted Aux file. Export requires device
        authentication. The passwords never pass through the page or agent runtime.
      </p>
      <div {...staticRowProps}>
        <input
          type="password"
          aria-label="Password transfer passphrase"
          autoComplete="new-password"
          minLength={12}
          maxLength={200}
          value={passphrase}
          onChange={(event) => setPassphrase(event.target.value)}
          placeholder="Transfer passphrase (12+ characters)"
          disabled={busy || !inNativeHost}
        />
        <button
          {...smallButtonProps}
          disabled={busy || !inNativeHost || passphrase.length < 12}
          onClick={() => void transfer("export")}
        >
          Export…
        </button>
        <button
          {...smallButtonProps}
          disabled={busy || !inNativeHost || passphrase.length < 12}
          onClick={() => void transfer("import")}
        >
          Import…
        </button>
      </div>
      {error && (
        <p {...staticFieldErrorProps} {...nativeAlertRoleProps}>
          {error}
        </p>
      )}
    </div>
  );
}
