import { useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";

export type PageAttachmentResult = { attached: string[]; errors: string[] };
export function AttachPage({ pages, disabled, remaining, onAttach }: { pages: PageTarget[]; disabled: boolean; remaining: number; onAttach(pages: PageTarget[]): Promise<PageAttachmentResult> }) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const available = pages.filter(page => !page.ownedByRuntime && /^https?:\/\//.test(page.url) && !["crashed", "detached"].includes(page.viewStatus));
  const found = available.filter(page => `${page.title} ${page.url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const picked = available.filter(page => selected.has(page.pageId));
  const close = () => { setOpen(false); requestAnimationFrame(() => trigger.current?.focus()); };
  async function attach() {
    if (pending.current || disabled || !picked.length || picked.length > remaining) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const result = await onAttach(picked);
      setSelected(current => new Set([...current].filter(id => !result.attached.includes(id))));
      if (result.errors.length) setError(result.errors.join("\n"));
      else { close(); setQuery(""); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)); }
    finally { pending.current = false; setBusy(false); }
  }
  return <div className="attach-page">
    <button ref={trigger} className="btn sm" aria-expanded={open} disabled={disabled || busy} onClick={() => { setOpen(value => !value); setError(""); }}>Page</button>
    {open && <div className="attach-page-picker" onKeyDown={event => {
      if (event.key === "Escape" && !event.nativeEvent.isComposing) { event.preventDefault(); event.stopPropagation(); if (!busy) close(); }
    }}>
      <input autoFocus type="search" disabled={busy} aria-label="Find tabs to attach" placeholder="Find tabs…" value={query} onChange={event => setQuery(event.target.value)}/>
      <p className="hint">Choose up to {remaining} {remaining === 1 ? "tab" : "tabs"}. Saved text snapshots stay as captured; preview shows what fits in the next reply.</p>
      <div className="attach-page-list">{found.map(page => <label className="attach-page-choice" key={page.pageId} title={page.url}>
        <input type="checkbox" checked={selected.has(page.pageId)} disabled={disabled || busy || (!selected.has(page.pageId) && picked.length >= remaining)} onChange={event => {
          const checked = event.target.checked;
          setSelected(current => { const next = new Set(current); if (checked) next.add(page.pageId); else next.delete(page.pageId); return next; });
        }}/><span><b>{page.title || new URL(page.url).hostname}</b><small>{new URL(page.url).hostname}</small></span>
      </label>)}</div>
      {!found.length && <p className="hint">{available.length ? "No matching tabs. Your selection is kept while searching." : "Open a web page to attach its text."}</p>}
      {error && <p className="hint err attach-page-error" role="alert">{error}</p>}
      <div className="row"><button className="btn sm" disabled={disabled || busy || !picked.length || picked.length > remaining} onClick={() => void attach()}>{busy ? "Attaching…" : `Attach${picked.length ? ` ${picked.length}` : " selected"} ${picked.length === 1 ? "tab" : "tabs"}`}</button><button className="btn sm ghost" disabled={busy} onClick={close}>Cancel</button></div>
    </div>}
  </div>;
}
