import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";

type Startup = Awaited<ReturnType<typeof bridge.startupPreferences>>;
type Mode = Startup["mode"];

const PAGE_MODES: Mode[] = ["pages", "continue-and-pages"];

export function ordinaryWebUrl(value: string): string | null {
  const input = value.trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(input) && !/^https?:\/\//i.test(input)) return null;
  if (input.startsWith("//")) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.href.length > 2048) return null;
    return url.href;
  } catch { return null; }
}

export function StartupSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<Startup | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const request = useRef(0);
  const available = inNativeHost || inMock;

  useEffect(() => {
    if (!active || !available || bridge.privateMode) return;
    const token = ++request.current;
    setError("");
    void bridge.startupPreferences()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason)); });
    return () => { ++request.current; };
  }, [active, available, retry]);

  async function save(next: Pick<Startup, "mode" | "urls">) {
    if (busy || value?.managed) return false;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      const saved = await bridge.startupPreferences(next);
      if (token === request.current) setValue(saved);
      return true;
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
      return false;
    } finally { setBusy(false); }
  }

  if (bridge.privateMode) return <span className="hint">Startup uses your regular Profile and cannot be changed in Private mode.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!value) return <span className="hint">{error || "Reading startup preference…"} {error && <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button>}</span>;
  const editable = !busy && !value.managed;
  return <div className="settings-startup">
    <select aria-label="On startup" value={value.mode} disabled={!editable} onChange={event => void save({ mode: event.target.value as Mode, urls: value.urls })}>
      <option value="new-tab">Open a new tab</option>
      <option value="continue">Continue where you left off</option>
      <option value="pages" disabled={!value.urls.length}>Open specific pages</option>
      <option value="continue-and-pages" disabled={!value.urls.length}>Continue and open specific pages</option>
    </select>
    {value.managed && <span className="hint">Managed by your organization</span>}
    <div className="settings-startup-pages">
      {value.urls.map(url => <div className="row" key={url}>
        <span className="hint mono selectable grow">{url}</span>
        <button className="btn sm ghost" aria-label={`Remove startup page ${url}`} disabled={!editable} onClick={() => {
          const urls = value.urls.filter(item => item !== url);
          const mode = !urls.length && PAGE_MODES.includes(value.mode)
            ? value.mode === "pages" ? "new-tab" : "continue"
            : value.mode;
          void save({ mode, urls });
        }}>Remove</button>
      </div>)}
      <form className="row" onSubmit={event => {
        event.preventDefault();
        const url = ordinaryWebUrl(input);
        if (!url) { setError("Enter an ordinary http or https page URL."); return; }
        if (value.urls.includes(url)) { setError("That startup page is already listed."); return; }
        if (value.urls.length >= 20) { setError("Startup pages are limited to 20."); return; }
        const mode = PAGE_MODES.includes(value.mode) ? value.mode : "pages";
        void save({ mode, urls: [...value.urls, url] }).then(ok => { if (ok) setInput(""); });
      }}>
        <input className="field-input grow" aria-label="Startup page URL" type="text" inputMode="url" placeholder="https://example.com" value={input} disabled={!editable} onChange={event => setInput(event.target.value)} />
        <button className="btn sm" type="submit" disabled={!editable || !input.trim()}>Add page</button>
      </form>
    </div>
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
