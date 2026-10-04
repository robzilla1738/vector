import { smallButtonProps } from "../ui/button-props";
import { useEffect, useRef, useState } from "react";
import { useStore, errToast } from "../store";
import { closePeekLink, promotePeekLink } from "../peek-link";
import { PageSurface } from "./PageSurface";
import "./LinkPeek.css";

export function LinkPeek() {
  const page = useStore(state => state.pages.find(item => item.pageId === state.peekPageId));
  const id = useStore(state => state.peekPageId);
  const [busy, setBusy] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => { close.current?.focus(); }, [id]);
  const dismiss = () => { if (!busy) void closePeekLink().catch(errToast); };
  const promote = () => {
    if (busy || !page) return;
    setBusy(true);
    void promotePeekLink().catch(errToast).finally(() => setBusy(false));
  };
  return <section className="link-peek" aria-label="Link preview" onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); dismiss(); }
  }}>
    <header className="link-peek-toolbar">
      <span className="link-peek-label">Preview link</span>
      <span className="link-peek-address" title={page?.url}>{page?.title || page?.url || "Opening link…"}</span>
      <button className="btn sm primary" disabled={busy || !page} onClick={promote}>Open as tab</button>
      <button ref={close} {...smallButtonProps} disabled={busy} onClick={dismiss}>Close preview</button>
    </header>
    <div className="link-peek-page">{page ? <PageSurface page={page} /> : <output data-block>Opening link…</output>}</div>
  </section>;
}
