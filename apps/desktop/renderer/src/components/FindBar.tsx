import { useEffect, useRef } from "react";
import { useStore, call, errToast } from "../store";
import { I } from "./icons";

/** ⌘F — in-flow strip above the page so highlighting stays live. */
export function FindBar() {
  const activePageId = useStore((s) => s.activePageId);
  const epoch = useStore(s => s.pages.find(page => page.pageId === s.activePageId)?.documentEpoch);
  const loading = useStore(s => s.pages.find(page => page.pageId === s.activePageId)?.loading);
  const setOverlay = useStore((s) => s.setOverlay);
  const text = useStore((s) => s.findText);
  const res = useStore((s) => s.findMatches);
  const find = useStore((s) => s.find);
  const ref = useRef<HTMLInputElement>(null);
  const debounce = useRef<number | null>(null);

  useEffect(() => ref.current?.select(), []);
  useEffect(() => {
    useStore.setState({ findMatches: null });
    // Allow the shell to lay out and expose the newly selected native page first.
    let frame = 0, nextFrame = 0;
    const query = useStore.getState().findText;
    if (activePageId && !loading && query) frame = requestAnimationFrame(() => {
      nextFrame = requestAnimationFrame(() => {
        if (useStore.getState().findText === query) void find(query).catch(errToast);
      });
    });
    return () => {
      cancelAnimationFrame(frame); cancelAnimationFrame(nextFrame);
      if (debounce.current) window.clearTimeout(debounce.current);
      if (activePageId) void call("pages.stopFind", { pageId: activePageId, action: "clear" }).catch(() => {});
    };
  }, [activePageId, epoch, loading, find]);

  const close = async () => {
    if (debounce.current) window.clearTimeout(debounce.current);
    setOverlay(null);
    if (activePageId) await call("pages.stopFind", { pageId: activePageId, action: "clear" }).catch(() => {});
  };
  const onChange = (v: string) => {
    useStore.setState({ findText: v, findMatches: null });
    if (debounce.current) window.clearTimeout(debounce.current);
    debounce.current = window.setTimeout(() => void find(v).catch(errToast), 80);
  };

  return (
    <div className="findbar slide-down" role="search">
      <span className="fb-ico">{I.find}</span>
      <input
        ref={ref}
        value={text}
        placeholder="Find in page"
        aria-label="Find in page"
        onFocus={(e) => e.target.select()}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (debounce.current) window.clearTimeout(debounce.current);
            void find(text, !!res, !e.shiftKey).catch(errToast);
          }
          if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); void close(); }
        }}
      />
      <span className={`fb-n nums ${res && res.matches === 0 ? "none" : ""}`} aria-live="polite">
        {res ? (res.matches === 0 ? "No results" : res.activeMatch ? `${res.activeMatch} of ${res.matches}` : `${res.matches} matches`) : ""}
      </span>
      <button className="icon-btn sm" title="Previous (⇧⌘G)" aria-label="Previous match" disabled={!res || !res.matches} onClick={() => void find(text, true, false).catch(errToast)}>{I.up}</button>
      <button className="icon-btn sm" title="Next (⌘G)" aria-label="Next match" disabled={!res || !res.matches} onClick={() => void find(text, true, true).catch(errToast)}>{I.down}</button>
      <button className="btn sm ghost" onClick={() => void close()}>Done</button>
    </div>
  );
}
