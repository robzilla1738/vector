import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore, call } from "../store";
import { bridge, inElectron } from "../bridge";

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export function Overview() {
  const pages = useStore(useShallow((s) => s.pages.filter((p) => p.viewStatus !== "background")));
  const activePageId = useStore((s) => s.activePageId);
  const activate = useStore((s) => s.activate);
  const [shots, setShots] = useState<Record<string, string>>({});

  useEffect(() => {
    let live = true;
    const grab = async () => {
      const next: Record<string, string> = {};
      for (const p of pages) {
        try {
          if (p.backend === "chrome") {
            // borrowed tabs have no native view — capture through the driver
            const c = await call<{ dataUrl?: string }>("pages.capture", { pageId: p.pageId });
            if (c.dataUrl) next[p.pageId] = c.dataUrl;
          } else {
            const d = await bridge.preview(p.pageId);
            if (d) next[p.pageId] = d;
          }
        } catch {
          /* page raced away — next pass gets it */
        }
      }
      if (live) setShots(next);
    };
    void grab();
    const t = setInterval(grab, 3000);
    return () => {
      live = false;
      clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages.map((p) => p.pageId).join(",")]);

  return (
    <div className="overview fade-in">
      <div className="ov-grid">
        {pages.map((p) => (
          <div key={p.pageId} className={`ov-card ${p.pageId === activePageId ? "active" : ""}`} onClick={() => void activate(p.pageId)}>
            <div className="ov-shot">
              {shots[p.pageId] ? <img src={shots[p.pageId]} alt="" /> : <span>{p.loading ? "loading…" : p.backend === "chrome" ? "chrome tab" : "no preview"}</span>}
              {p.backend === "chrome" && <span className="ov-src">chrome</span>}
            </div>
            <div className="ov-meta">
              {p.favicon && <img className="ov-fav" src={p.favicon} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
              <span className="t">{p.title || "New tab"}</span>
            </div>
            <div className="ov-meta" style={{ paddingTop: 0 }}>
              <span className="u">{host(p.url)}</span>
            </div>
          </div>
        ))}
        {pages.length === 0 && <div style={{ color: "var(--ink-2)" }}>No open pages.</div>}
      </div>
    </div>
  );
}
