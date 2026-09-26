import { useState } from "react";
import { isSearchEngineTemplate, SEARCH_ENGINE_TEMPLATE_ERROR } from "@aux/contracts/search-engine";

export interface EngineRow { keyword: string; name: string; template: string }

/**
 * Keyword engines (`gh aux` → GitHub search). User rows merge over the
 * built-in list by keyword — saving an existing keyword replaces it.
 */
export function SearchEnginesSetting({ value, onSave }: { value: EngineRow[]; onSave: (value: EngineRow[]) => Promise<boolean> }) {
  const [keyword, setKeyword] = useState("");
  const [name, setName] = useState("");
  const [template, setTemplate] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async (next: EngineRow[]) => {
    if (busy) return false;
    setBusy(true); setError("");
    try {
      const ok = await onSave(next);
      if (!ok) setError("The engines weren’t saved. Try again.");
      return ok;
    } catch { setError("The engines weren’t saved. Try again."); return false; }
    finally { setBusy(false); }
  };

  const add = () => {
    const kw = keyword.trim().toLowerCase();
    if (!/^[a-z][a-z0-9_-]{0,15}$/.test(kw)) { setError("Keywords start with a letter — letters, digits, _ or - up to 16 characters."); return; }
    if (!name.trim()) { setError("Name the engine (shown beside the address chip)."); return; }
    const tpl = template.trim();
    if (!isSearchEngineTemplate(tpl)) { setError(SEARCH_ENGINE_TEMPLATE_ERROR); return; }
    setError("");
    void save([...value.filter(engine => engine.keyword !== kw), { keyword: kw, name: name.trim().slice(0, 60), template: tpl }]).then(ok => { if (ok) { setKeyword(""); setName(""); setTemplate(""); } });
  };

  return <div className="search-engines-setting">
    {value.length > 0 && <ul className="engine-list">
      {value.map(engine => <li key={engine.keyword} className="engine-row">
        <code className="engine-kw">{engine.keyword}</code>
        <span className="engine-name">{engine.name}</span>
        <span className="engine-url hint">{engine.template}</span>
        <button className="btn sm ghost" disabled={busy} aria-label={`Remove ${engine.keyword} engine`} onClick={() => void save(value.filter(item => item.keyword !== engine.keyword))}>Remove</button>
      </li>)}
    </ul>}
    <div className="engine-add">
      <div className="row">
        <input aria-label="Keyword" placeholder="kw" value={keyword} disabled={busy} onChange={event => setKeyword(event.target.value)} style={{ width: 72 }} />
        <input aria-label="Engine name" placeholder="Name" value={name} disabled={busy} onChange={event => setName(event.target.value)} style={{ width: 140 }} />
        <input className="grow" aria-label="Search URL" placeholder="https://example.com/search?q=%s" value={template} disabled={busy} onChange={event => { setTemplate(event.target.value); setError(""); }}
          onKeyDown={event => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); add(); } }} />
        <button className="btn sm" disabled={busy || !keyword.trim() || !name.trim() || !template.trim()} onClick={add}>Add</button>
      </div>
      <p className="hint">Type <code>keyword terms</code> in the address bar — e.g. <code>gh aux browser</code>. Built-ins (ddg, g, gh, mdn, npm, yt, wiki, so, maps) merge unless you override the keyword.</p>
    </div>
    {error && <p className="field-error" role="alert">{error}</p>}
  </div>;
}
