import { useEffect, useRef, useState } from "react";
import { bridge, inNativeHost, type BrowserExtension } from "../bridge";
import { storeExtensionId } from "../store-extension-id";
import { NativeDialog } from "./NativeDialog";

export function Extensions() {
  const storeHost = inNativeHost;
  const [items, setItems] = useState<BrowserExtension[]>([]);
  const [storeInput, setStoreInput] = useState("");
  const [removeTarget, setRemoveTarget] = useState<BrowserExtension | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const pending = useRef(false);
  const revision = useRef(0);

  useEffect(() => {
    let live = true;
    const load = () => {
      if (pending.current) return;
      const request = ++revision.current;
      setLoading(true);
      void bridge
        .extensions()
        .then((next) => {
          if (live && request === revision.current) {
            setItems(next);
            setError("");
          }
        })
        .catch((reason) => {
          if (live && request === revision.current) setError(String(reason));
        })
        .finally(() => {
          if (live && request === revision.current) setLoading(false);
        });
    };
    load();
    window.addEventListener("focus", load);
    return () => {
      live = false;
      window.removeEventListener("focus", load);
    };
  }, [refresh]);

  async function action(work: () => Promise<void>) {
    if (pending.current) return;
    pending.current = true;
    ++revision.current;
    setBusy(true);
    setLoading(false);
    setError("");
    setMessage("");
    try {
      await work();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    } finally {
      try {
        setItems(await bridge.extensions());
      } catch (reason) {
        setError((current) => current || String(reason));
      }
      pending.current = false;
      setBusy(false);
    }
  }

  const parsedStoreId = storeExtensionId(storeInput);
  return (
    <section className="field extensions-settings" aria-label="Extensions">
      <div className="drawer-section">Extensions</div>
      {storeHost ? (
        <>
          <p>
            Install extensions from the Chrome Web Store into this browser Profile. Chromium reviews their
            requested access before installation.
          </p>
          <div className="extension-toolbar">
            <label htmlFor="extension-store-input">Store link or extension ID</label>
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
              className="btn"
              disabled={busy || !parsedStoreId}
              onClick={() =>
                void action(async () => {
                  const id = storeExtensionId(storeInput);
                  if (!id) throw new Error("Enter a Chrome Web Store link or extension ID.");
                  const installed = await bridge.installStoreExtension(id);
                  setStoreInput("");
                  setMessage(`${installed.name} installed.`);
                })
              }
            >
              Install from Store…
            </button>
          </div>
          <p className="hint">
            Store extensions update through Chromium. Use Check for update to request an immediate check.
          </p>
        </>
      ) : (
        <>
          <p>Add an unpacked Chrome extension to this profile. Extensions run in regular windows only.</p>
          <div className="extension-toolbar">
            <button
              className="btn"
              disabled={busy}
              onClick={() =>
                void action(async () => {
                  const installed = await bridge.installUnpackedExtension();
                  if (installed) setMessage(`${installed.name} installed.`);
                })
              }
            >
              Install unpacked extension…
            </button>
          </div>
          <details className="extension-compatibility">
            <summary>Compatibility and updates</summary>
            <p className="hint">
              Electron supports part of the Chrome extension API. Store installation and native messaging are
              available in the Chromium browser.
            </p>
            <p className="hint">
              Aux keeps its own copy of unpacked extensions. Choose Update to replace that copy after
              reviewing its declared access.
            </p>
          </details>
        </>
      )}
      <div className="extension-toolbar">
        <button
          className="btn sm ghost"
          disabled={busy || loading}
          onClick={() => setRefresh((value) => value + 1)}
        >
          Refresh
        </button>
      </div>
      {error && (
        <p className="hint err" role="alert">
          {error}
        </p>
      )}
      {message && (
        <output className="hint" data-block>
          {message}
        </output>
      )}
      <div
        role="group"
        className="extension-list"
        aria-label="Installed extensions"
        aria-busy={loading || busy}
      >
        {loading && !items.length ? (
          <output className="hint" data-block>
            Loading extensions…
          </output>
        ) : (
          !items.length && !error && <p className="hint">No extensions installed.</p>
        )}
        {items.map((extension) => (
          <article
            className="extension-row"
            key={`${extension.source}:${extension.key}`}
            aria-label={extension.name}
          >
            <div className="extension-copy">
              <div>
                <strong>{extension.name}</strong>
                <span className="extension-version">{extension.version}</span>
              </div>
              <span className="hint">
                {extension.loaded
                  ? "Enabled"
                  : extension.error
                    ? "Couldn’t load"
                    : extension.enabled
                      ? "Not loaded"
                      : "Disabled"}
                {!extension.managed ? " · Managed outside Aux" : ""}
              </span>
              {extension.error && (
                <details className="extension-details">
                  <summary>Load details</summary>
                  <p className="hint err">{extension.error}</p>
                </details>
              )}
              <details className="extension-details">
                <summary>Declared access</summary>
                <p className="hint extension-permissions">
                  {extension.permissions.length
                    ? extension.permissions.join(", ")
                    : "No permissions declared."}
                </p>
              </details>
            </div>
            {extension.managed && (
              <div className="extension-actions">
                {storeHost && extension.source === "store" && extension.enabled && (
                  <button
                    className="btn sm"
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await bridge.showExtensionAction(extension.key);
                      })
                    }
                  >
                    Open action
                  </button>
                )}
                {!storeHost && extension.enabled && !extension.loaded && (
                  <button
                    className="btn sm"
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        await bridge.setExtensionEnabled(extension.key, true);
                        setMessage(`${extension.name} loaded.`);
                      })
                    }
                  >
                    Retry
                  </button>
                )}
                <button
                  className="btn sm"
                  disabled={busy}
                  onClick={() =>
                    void action(async () => {
                      const next = await bridge.setExtensionEnabled(extension.key, !extension.enabled);
                      setMessage(`${next.name} ${next.enabled ? "enabled" : "disabled"}.`);
                    })
                  }
                >
                  {extension.enabled ? "Disable" : "Enable"}
                </button>
                {storeHost && extension.source === "store" ? (
                  <>
                    <button
                      className="btn sm ghost"
                      disabled={busy}
                      onClick={() =>
                        void action(async () => {
                          const updated = await bridge.checkStoreExtensionUpdate(extension.key);
                          setMessage(
                            updated.version === extension.version
                              ? `Update check finished for ${extension.name}.`
                              : `${extension.name} updated to ${updated.version}.`,
                          );
                        })
                      }
                    >
                      Check for update
                    </button>
                    <button
                      className="btn sm ghost"
                      disabled={busy || !extension.enabled}
                      onClick={() =>
                        void action(async () => {
                          await bridge.reloadExtension(extension.key);
                          setMessage(`${extension.name} restarted.`);
                        })
                      }
                    >
                      Restart
                    </button>
                  </>
                ) : (
                  <button
                    className="btn sm ghost"
                    disabled={busy}
                    onClick={() =>
                      void action(async () => {
                        const updated = await bridge.updateUnpackedExtension(extension.key);
                        if (updated) setMessage(`${updated.name} updated to ${updated.version}.`);
                      })
                    }
                  >
                    Update…
                  </button>
                )}
                <button className="btn sm ghost" disabled={busy} onClick={() => setRemoveTarget(extension)}>
                  Remove
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
      {removeTarget && (
        <NativeDialog
          label={`Remove ${removeTarget.name}?`}
          onClose={() => setRemoveTarget(null)}
          className="sheet pop-in"
        >
          <h3>Remove {removeTarget.name}?</h3>
          <p>
            The extension will stop running in this Profile. Its installed files and site data will be
            removed.
          </p>
          <div className="extension-confirm-actions">
            <button className="btn ghost" disabled={busy} onClick={() => setRemoveTarget(null)}>
              Cancel
            </button>
            <button
              className="btn danger"
              disabled={busy}
              onClick={() => {
                const target = removeTarget;
                setRemoveTarget(null);
                void action(async () => {
                  if (await bridge.removeExtension(target.key)) setMessage(`${target.name} removed.`);
                });
              }}
            >
              Remove extension
            </button>
          </div>
        </NativeDialog>
      )}
    </section>
  );
}
