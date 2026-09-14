import { useEffect, useRef } from "react";
import { useStore, call, errToast } from "../store";
import { I } from "./icons";

export function FindBar() {
  const activePageId = useStore((s) => s.activePageId);
  const setOverlay = useStore((s) => s.setOverlay);
  const text = useStore((s) => s.findText);
  const res = useStore((s) => s.findMatches);
  const find = useStore((s) => s.find);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => ref.current?.select(), []);

  // whatever closes the bar (Esc, overlay switch, tab close) clears the find
  useEffect(() => {
    return () => {
      const id = useStore.getState().activePageId;
      if (id) void call("pages.stopFind", { pageId: id, action: "clear" }).catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = async () => {
    if (activePageId) await call("pages.stopFind", { pageId: activePageId, action: "clear" }).catch(() => {});
    setOverlay(null);
  };

  return (
    <div className="findbar fade-in">
      <span className="fb-ico">{I.search}</span>
      <input
        ref={ref}
        value={text}
        placeholder="Find in page"
        onFocus={(e) => e.target.select()}
        onChange={(e) => void find(e.target.value).catch(errToast)}
        onKeyDown={(e) => {
          if (e.key === "Enter") void find(text, true, !e.shiftKey).catch(errToast);
          if (e.key === "Escape") void close();
        }}
      />
      <span className={`n ${res && res.matches === 0 ? "none" : ""}`}>
        {res ? (res.matches === 0 ? "No results" : `${res.activeMatch ?? 0}/${res.matches}`) : ""}
      </span>
      <button className="icon-btn sm" title="Previous (⇧⌘G)" disabled={!res || !res.matches} onClick={() => void find(text, true, false).catch(errToast)}>
        {I.up}
      </button>
      <button className="icon-btn sm" title="Next (⌘G)" disabled={!res || !res.matches} onClick={() => void find(text, true, true).catch(errToast)}>
        {I.down}
      </button>
      <button className="icon-btn sm" title="Done (Esc)" onClick={() => void close()}>{I.close}</button>
    </div>
  );
}
