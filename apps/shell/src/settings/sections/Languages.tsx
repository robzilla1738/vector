import { useEffect, useRef, useState } from "react";
import { bridge, inMock, inNativeHost } from "../../bridge";

type Languages = Awaited<ReturnType<typeof bridge.languagePreferences>>;

const COMMON = ["en-US", "en-GB", "es-ES", "fr", "de", "it", "pt-BR", "ja", "ko", "zh-CN", "zh-TW", "hi", "ar"];

function name(code: string) {
  try {
    const display = new Intl.DisplayNames([navigator.language], { type: "language" }).of(code);
    return display && display !== code ? `${display} (${code})` : code;
  } catch { return code; }
}

export function LanguagesSetting({ active }: { active: boolean }) {
  const [value, setValue] = useState<Languages | null>(null);
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
    void bridge.languagePreferences()
      .then(result => { if (token === request.current) setValue(result); })
      .catch(reason => { if (token === request.current) setError(String(reason)); });
    return () => { ++request.current; };
  }, [active, available, retry]);

  async function save(selected: string[]) {
    if (busy || value?.managed) return;
    const token = ++request.current;
    setBusy(true);
    setError("");
    try {
      const saved = await bridge.languagePreferences(selected);
      if (token === request.current) setValue(saved);
      setInput("");
    } catch (reason) {
      if (token === request.current) setError(reason instanceof Error ? reason.message : String(reason));
    } finally { setBusy(false); }
  }

  if (bridge.privateMode) return <span className="hint">Languages follow the regular Profile and cannot be changed in Private mode.</span>;
  if (!available) return <span className="hint">Available in the Aux desktop app.</span>;
  if (!value) return <span className="hint">{error || "Reading languages…"} {error && <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button>}</span>;
  const editable = !busy && !value.managed;
  return <div className="settings-startup">
    {value.managed && <span className="hint">Managed by your organization</span>}
    {value.forced.length > 0 && <span className="hint">Required by policy: {value.forced.map(name).join(", ")}</span>}
    <div className="settings-startup-pages">
      {value.selected.map((code, index) => <div className="row" key={code}>
        <span className="hint grow">{name(code)}</span>
        <button className="btn sm ghost" aria-label={`Move ${code} up`} disabled={!editable || index === 0} onClick={() => {
          const next = [...value.selected]; const previous = next[index - 1]!; next[index - 1] = next[index]!; next[index] = previous;
          void save(next);
        }}>↑</button>
        <button className="btn sm ghost" aria-label={`Move ${code} down`} disabled={!editable || index === value.selected.length - 1} onClick={() => {
          const next = [...value.selected]; const following = next[index + 1]!; next[index + 1] = next[index]!; next[index] = following;
          void save(next);
        }}>↓</button>
        <button className="btn sm ghost" aria-label={`Remove ${code}`} disabled={!editable || value.selected.length === 1} onClick={() => void save(value.selected.filter(item => item !== code))}>Remove</button>
      </div>)}
      <form className="row" onSubmit={event => {
        event.preventDefault();
        const code = input.trim();
        if (!/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/.test(code)) { setError("Enter a language code such as es-ES."); return; }
        if (value.selected.some(item => item.toLowerCase() === code.toLowerCase())) { setError("That language is already listed."); return; }
        if (value.selected.length >= 20) { setError("Languages are limited to 20."); return; }
        void save([...value.selected, code]);
      }}>
        <input className="field-input grow" aria-label="Language code" list="aux-common-languages" placeholder="Add a language, e.g. es-ES" value={input} disabled={!editable} onChange={event => setInput(event.target.value)} />
        <datalist id="aux-common-languages">{COMMON.map(code => <option value={code} key={code}>{name(code)}</option>)}</datalist>
        <button className="btn sm" type="submit" disabled={!editable || !input.trim()}>Add</button>
      </form>
    </div>
    {error && <span role="alert" className="field-error">{error} <button className="btn sm ghost" onClick={() => setRetry(current => current + 1)}>Retry</button></span>}
  </div>;
}
