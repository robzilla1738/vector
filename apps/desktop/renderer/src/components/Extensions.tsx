import { useEffect, useState } from "react";
import { bridge, type BrowserExtension } from "../bridge";

export function Extensions() {
  const [items, setItems] = useState<BrowserExtension[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const refresh = async () => setItems(await bridge.extensions());
  useEffect(() => { void refresh().catch(reason => setError(String(reason))); }, []);
  const install = async () => {
    setBusy(true); setError(""); setMessage("");
    try {
      const installed = await bridge.installUnpackedExtension();
      if (installed) { await refresh(); setMessage(`${installed.name} installed for regular windows.`); }
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const toggle = async (extension: BrowserExtension) => {
    setBusy(true); setError(""); setMessage("");
    try {
      const next = await bridge.setExtensionEnabled(extension.key, !extension.enabled);
      await refresh(); setMessage(`${next.name} ${next.enabled ? "enabled" : "disabled"}.`);
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };
  const remove = async (extension: BrowserExtension) => {
    setBusy(true); setError(""); setMessage("");
    try {
      if (await bridge.removeExtension(extension.key)) { await refresh(); setMessage(`${extension.name} removed.`); }
    } catch (reason) { setError(String(reason)); }
    finally { setBusy(false); }
  };

  return <section className="field extensions-settings" aria-label="Extensions">
    <div className="drawer-section">Extensions</div>
    <p>Install an unpacked Chrome extension you trust. Aux copies it into its private data directory and loads it only in regular windows.</p>
    <span className="hint">Electron implements part of the Chrome extension API. Chrome Web Store installation, automatic updates, native messaging and 1Password integration are not qualified here. An installed extension receives the access declared by its manifest.</span>
    <button className="btn" disabled={busy} onClick={() => void install()}>Install unpacked extension…</button>
    {error && <p role="alert">{error}</p>}
    {message && <p role="status">{message}</p>}
    <div className="extension-list" aria-label="Installed extensions">
      {!items.length && <span className="hint">No unpacked extensions installed.</span>}
      {items.map(extension => <article className="extension-row" key={`${extension.source}:${extension.key}`} aria-label={extension.name}>
        <div className="extension-copy">
          <div><strong>{extension.name}</strong><span className="extension-version">{extension.version}</span></div>
          <span className="hint">{extension.error ? `Couldn’t load: ${extension.error}` : extension.loaded ? "Loaded" : extension.enabled ? "Not loaded" : "Disabled"}{extension.managed ? " · managed by Aux" : " · launch configuration"}</span>
          <span className="hint extension-permissions">{extension.permissions.length ? `Declared access: ${extension.permissions.join(", ")}` : "No permissions declared"}</span>
        </div>
        {extension.managed && <div className="extension-actions">
          <button className="btn sm" disabled={busy} onClick={() => void toggle(extension)}>{extension.enabled ? "Disable" : "Enable"}</button>
          <button className="btn sm" disabled={busy} onClick={() => void remove(extension)}>Remove</button>
        </div>}
      </article>)}
    </div>
    <span className="hint">Aux uses its copied version until you remove and reinstall it. Disabling and removal persist after restart.</span>
  </section>;
}
