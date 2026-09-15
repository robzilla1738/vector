import { useEffect, useRef } from "react";
import { useStore, call, errToast } from "../store";
import { I } from "./icons";

/** ⌘F — in-flow strip above the page so highlighting stays live. */
export function FindBar() {
  const activePageId = useStore((s) => s.activePageId);
  const setOverlay = useStore((s) => s.setOverlay);
  const text = useStore((s) => s.findText);
  const res = useStore((s) => s.findMatches);
  const find = useStore((s) => s.find);
  const ref = useRef<HTMLInputElement>(null);
  const debounce = useRef<number | null>(null);

  useEffect(() => ref.current?.select(), []);
  useEffect(() => {
    return () => {
      const id = useStore.getState().activePageId;
      if (id) void call("pages.stopFind", { pageId: id, action: "clear" }).catch(() => {});
    };
  }, []);

  const close = async () => {
    if (activePageId) await call("pages.stopFind", { pageId: activePageId, action: "clear" }).catch(() => {});
    setOverlay(null);
  };
  const onChange = (v: string) => {
    useStore.setState({ findText: v });
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
          if (e.key === "Enter") void find(text, true, !e.shiftKey).catch(errToast);
          if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); void close(); }
        }}
      />
      <span className={`fb-n nums ${res && res.matches === 0 ? "none" : ""}`} aria-live="polite">
        {res ? (res.matches === 0 ? "No results" : `${res.activeMatch ?? 0} of ${res.matches}`) : ""}
      </span>
      <button className="icon-btn sm" title="Previous (⇧⌘G)" aria-label="Previous match" disabled={!res || !res.matches} onClick={() => void find(text, true, false).catch(errToast)}>{I.up}</button>
      <button className="icon-btn sm" title="Next (⌘G)" aria-label="Next match" disabled={!res || !res.matches} onClick={() => void find(text, true, true).catch(errToast)}>{I.down}</button>
      <button className="btn sm ghost" onClick={() => void close()}>Done</button>
    </div>
  );
}
