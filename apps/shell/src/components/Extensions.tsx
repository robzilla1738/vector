import { staticHintProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { errorMessage } from "../error-message";
import { useEffect, useState } from "react";
import { useStore as useBoundStore } from "zustand";
import { bridge, inNativeHost, type BrowserExtension } from "../bridge";
import { executeCommand, runCommand } from "../commands";
import { storeExtensionId } from "../store-extension-id";
import { useFeature } from "../use-feature";
import { extensionInventory, refreshExtensions } from "../features/extensions/extension-inventory";

export function Extensions() {
  const available = useFeature("extensions");
  const enabled = inNativeHost && !bridge.privateMode && bridge.windowKind === "normal" && available;
  const { items, busy, loading, error, message } = useBoundStore(extensionInventory);
  const [storeInput, setStoreInput] = useState("");
  const [removeTarget, setRemoveTarget] = useState<BrowserExtension | null>(null);
  useEffect(() => {
    if (!enabled) return;
    void refreshExtensions();
    const refresh = () => {
      if (!extensionInventory.getState().busy) void refreshExtensions();
    };
    const stop = bridge.onExtensionActionsChanged(refresh);
    window.addEventListener("focus", refresh);
    return () => {
      stop();
      window.removeEventListener("focus", refresh);
    };
  }, [enabled]);
  if (!enabled) return null;
  const id = storeExtensionId(storeInput);
  return (
    <section className="field extensions-settings" aria-label="Extensions">
      <div className="drawer-section">Extensions</div>
      <p>
        Extensions run in this browser Profile. Their permissions and site access are managed by Chromium.
      </p>
      <div className="extension-toolbar">
        <label htmlFor="extension-store-input">Chrome Web Store link or extension ID</label>
        <input
          id="extension-store-input"
          className="field-input extension-store-input"
          value={storeInput}
          onChange={(event) => setStoreInput(event.target.value)}
          placeholder="Paste a Chrome Web Store link"
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="button"
          className="btn"
          disabled={busy || !id}
          data-command-id="install-store-extension"
          onClick={() => {
            if (id) runCommand("install-store-extension", { payload: { extensionId: id } });
          }}
        >
          Install from Store
        </button>
        <button
          type="button"
          className="btn ghost"
          disabled={busy}
          data-command-id="install-unpacked-extension"
          onClick={() => runCommand("install-unpacked-extension")}
        >
          Install unpacked extension…
        </button>
      </div>
      <p {...staticHintProps}>
        Store extensions update through Chromium. Unpacked extensions remain linked to the folder you choose.
        Native tab groups are separate from Aux folders.
      </p>
      {message && <output {...staticHintProps}>{message}</output>}
      {error && (
        <p className="hint err" role="alert">
          {error}
        </p>
      )}
      <section className="extension-list" aria-label="Installed extensions" aria-busy={busy || loading}>
        {loading && <p {...staticHintProps}>Loading extensions…</p>}
        {!loading && !items.length && !error && (
          <p {...staticHintProps}>
            No extensions installed. Choose a Store extension or an unpacked folder to get started.
          </p>
        )}
        {items.map((extension) => (
          <article className="extension-row" key={extension.key} aria-label={extension.name}>
            <div className="extension-copy">
              <strong>{extension.name}</strong> <span className="extension-version">{extension.version}</span>
              <p {...staticHintProps}>
                {extension.enabled ? "Enabled" : "Disabled"}
                {!extension.managed ? " · Managed outside Aux" : ""}
              </p>
              {extension.error && <p className="hint err">{extension.error}</p>}
              <details className="extension-details">
                <summary>Permissions</summary>
                <p className="hint extension-permissions">
                  {extension.permissions.length
                    ? extension.permissions.join(", ")
                    : "No additional permissions requested."}
                </p>
              </details>
            </div>
            {extension.managed && (
              <div className="extension-actions">
                <button
                  type="button"
                  {...smallGhostButtonProps}
                  disabled={busy}
                  data-command-id="set-extension-enabled"
                  onClick={() =>
                    runCommand("set-extension-enabled", {
                      payload: { extensionId: extension.key, enabled: !extension.enabled },
                    })
                  }
                >
                  {extension.enabled ? "Disable" : "Enable"}
                </button>
                <button
                  type="button"
                  {...smallGhostButtonProps}
                  disabled={busy || !extension.enabled}
                  data-command-id="reload-extension"
                  onClick={() => runCommand("reload-extension", { payload: { extensionId: extension.key } })}
                >
                  Restart
                </button>
                <button
                  type="button"
                  {...smallGhostButtonProps}
                  disabled={busy}
                  data-command-id="update-extension"
                  onClick={() =>
                    runCommand("update-extension", {
                      payload: { extensionId: extension.key, source: extension.source },
                    })
                  }
                >
                  {extension.source === "store" ? "Check for update" : "Update from folder…"}
                </button>
                <button
                  type="button"
                  {...smallGhostButtonProps}
                  disabled={busy}
                  onClick={() => setRemoveTarget(extension)}
                >
                  Remove…
                </button>
              </div>
            )}
          </article>
        ))}
      </section>
      {removeTarget && (
        <div className="extension-confirm" role="alertdialog" aria-label={`Remove ${removeTarget.name}`}>
          <strong>Remove {removeTarget.name}?</strong>
          <p>
            The extension will stop running in this Profile. Chromium will remove its installed files and site
            data.
          </p>
          <div className="extension-confirm-actions">
            <button
              type="button"
              className="btn"
              disabled={busy}
              data-command-id="remove-extension"
              onClick={async () => {
                try {
                  await executeCommand("remove-extension", { payload: { extensionId: removeTarget.key } });
                  setRemoveTarget(null);
                } catch (reason) {
                  extensionInventory.setState({
                    error: errorMessage(reason),
                  });
                }
              }}
            >
              Remove extension
            </button>
            <button type="button" className="btn ghost" disabled={busy} onClick={() => setRemoveTarget(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
