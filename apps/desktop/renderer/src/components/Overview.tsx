import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore, call, errToast } from "../store";
import { bridge, inElectron } from "../bridge";
import { hostOf } from "../workspace";
import { I } from "./icons";

/** ⌘⇧O — every tab as a card with a preview; captures once on entry, not on a timer. */
export function Overview() {
  const pages = useStore(useShallow((s) => s.pages.filter((p) => p.viewStatus !== "background" && !p.ownedByRuntime)));
  const activePageId = useStore((s) => s.activePageId);
  const activate = useStore((s) => s.activate);
  const closeTab = useStore((s) => s.closeTab);
  const newTab = useStore((s) => s.newTab);
  const setMode = useStore((s) => s.setMode);
  const previews = useStore((s) => s.previews);
  const [shots, setShots] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!inElectron) return;
    let live = true;
    void (async () => {
      const next: Record<string, string> = {};
      for (const p of pages) {
        if (previews[p.pageId] || next[p.pageId]) continue;
        try {
          if (p.backend === "chrome") {
            const c = await call<{ dataUrl?: string }>("pages.capture", { pageId: p.pageId });
            if (c.dataUrl) next[p.pageId] = c.dataUrl;
          } else {
            const d = await bridge.preview(p.pageId);
            if (d) next[p.pageId] = d;
          }
        } catch {
          /* page raced away */
        }
      }
      if (live) setShots((s) => ({ ...s, ...next }));
    })();
    return () => {
      live = false;
    };
    // capture once per set of page ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.map((p) => p.pageId).join(",")]);

  if (pages.length === 0) {
    return (
      <div className="overview">
        <div className="stage-message">
          <div className="empty-state">
            <span className="empty-ico">{I.grid}</span>
            <h2>No tabs open</h2>
            <p>Open a tab and it shows up here as a card with a live preview.</p>
            <div className="empty-actions">
              <button className="btn primary" onClick={() => void newTab()}>New Tab</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview">
      <div className="ov-head">
        <h2>{pages.length} tabs</h2>
        <span className="sp" />
        <button className="btn sm ghost" onClick={() => setMode("focus")}>Done</button>
      </div>
      <div className="ov-grid">
        {pages.map((p) => {
          const shot = shots[p.pageId] || previews[p.pageId];
          return (
            <div key={p.pageId} className={`ov-card ${p.pageId === activePageId ? "active" : ""}`} role="button" tabIndex={0}
              onClick={() => void activate(p.pageId).catch(errToast)}
              onKeyDown={(e) => { if (e.key === "Enter") void activate(p.pageId).catch(errToast); }}>
              <div className="ov-shot">
                {shot ? <img src={shot} alt="" /> : <span className="ov-fallback">{p.favicon ? <img src={p.favicon} alt="" className="ov-bigfav" /> : I.globeLg}</span>}
                {p.backend === "chrome" && <span className="ov-src">Chrome</span>}
                <button className="ov-close icon-btn sm" aria-label={`Close ${p.title}`} onClick={(e) => { e.stopPropagation(); void closeTab(p.pageId); }}>{I.close}</button>
              </div>
              <div className="ov-meta">
                {p.favicon && <img className="ov-fav" src={p.favicon} alt="" onError={(e) => (e.currentTarget.style.display = "none")} />}
                <span className="t">{p.title || "New Tab"}</span>
              </div>
              <div className="ov-url">{hostOf(p.url)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
