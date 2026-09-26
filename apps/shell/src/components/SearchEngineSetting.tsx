import { useEffect, useState } from "react";
import { DEFAULT_SEARCH_ENGINE, isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR } from "@aux/contracts/search-engine";

const ENGINES = [
  { name: "DuckDuckGo", url: DEFAULT_SEARCH_ENGINE },
  { name: "Google", url: "https://www.google.com/search?q=%s" },
  { name: "Bing", url: "https://www.bing.com/search?q=%s" },
];

export function SearchEngineSetting({ value, onSave }: { value: string; onSave: (value: string) => Promise<boolean> }) {
  const [custom, setCustom] = useState(!ENGINES.some(engine => engine.url === value));
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { setDraft(value); setCustom(!ENGINES.some(engine => engine.url === value)); }, [value]);
  const save = async (next: string) => {
    if (busy) return;
    const template = next.trim();
    if (!isSearchEngineTemplate(template)) { setError(SEARCH_ENGINE_TEMPLATE_ERROR); return; }
    setBusy(true); setError("");
    try {
      if (!await onSave(template)) setError("The search engine wasn’t saved. Try again.");
      else { setDraft(template); setCustom(!ENGINES.some(engine => engine.url === template)); }
    } catch { setError("The search engine wasn’t saved. Try again."); }
    finally { setBusy(false); }
  };
  return <div className="search-engine-setting">
    <div className="search-engine-choices" role="group" aria-label="Search engine">
      {ENGINES.map(engine => <button key={engine.name} className="btn sm" disabled={busy} aria-pressed={value === engine.url} onClick={() => void save(engine.url)}>{engine.name}</button>)}
      <button className="btn sm ghost" disabled={busy} aria-expanded={custom} onClick={() => setCustom(current => !current)}>Custom…</button>
    </div>
    {custom && <div className="search-engine-custom">
      <label htmlFor="search-engine-template">Search URL</label>
      <div className="row"><input id="search-engine-template" aria-describedby="search-engine-help" value={draft} disabled={busy} onChange={event => { setDraft(event.target.value); setError(""); }} onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); void save(draft); } }}/><button className="btn sm" disabled={busy || draft.trim() === value} onClick={() => void save(draft)}>{busy ? "Saving…" : "Save"}</button></div>
      <p id="search-engine-help" className="hint">Use %s where the search terms belong.</p>
    </div>}
    {error && <p className="field-error" role="alert">{error}</p>}
  </div>;
}
