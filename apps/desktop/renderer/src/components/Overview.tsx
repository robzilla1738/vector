import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useStore, call, errToast } from "../store";
import { bridge } from "../bridge";

const host = (url: string) => {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
};

export function Overview() {
  const pages = useStore(useShallow((s) => s.pages.filter((p) => p.viewStatus !== "background")));
  const members = useStore((s) => s.members);
  const sets = useStore((s) => s.sets);
  const activeSetId = useStore((s) => s.activeSetId);
  const activePageId = useStore((s) => s.activePageId);
  const activate = useStore((s) => s.activate);
  const previews = useStore((s) => s.previews);
  const [shots, setShots] = useState<Record<string, string>>({});
  const set = sets.find((s) => s.setId === activeSetId);
  const setMembers = activeSetId ? members.filter((m) => m.setId === activeSetId) : [];
  const useSet = setMembers.length > 0;

  useEffect(() => {
    let live = true;
    const grab = async () => {
      const next: Record<string, string> = { ...previews };
      for (const p of pages) {
        if (next[p.pageId]) continue;
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
      if (live) setShots(next);
    };
    void grab();
    const t = setInterval(grab, 4000);
    return () => {
      live = false;
      clearInterval(t);
    };
  }, [pages, previews]);

  if (!useSet && pages.length === 0) {
    return (
      <div className="overview">
        <div className="stage-empty" style={{ position: "relative" }}>
          <div className="empty-state">
            <h2>No pages yet</h2>
            <p>Open a tab to see it here as a card with a preview.</p>
            <button className="btn primary" onClick={() => void call("pages.open", { url: "about:blank", backend: "vector", activate: true }).catch(errToast)}>
              New Tab
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overview">
      <div className="ov-grid">
        {useSet
          ? setMembers.map((m) => {
              const page = pages.find((p) => p.pageId === m.pageId);
              const shot = (m.pageId && (shots[m.pageId] || previews[m.pageId])) || undefined;
              return (
                <div
                  key={m.memberId}
                  className={`ov-card ${m.pageId && m.pageId === activePageId ? "active" : ""}`}
                  onClick={() => {
                    if (m.pageId) void activate(m.pageId);
                    else if (m.url) void call("pages.open", { url: m.url, backend: "vector", activate: true }).catch(errToast);
                  }}
                >
                  <div className="ov-shot">
                    {shot ? <img src={shot} alt="" /> : <span>{m.status === "queued" ? "queued" : page?.loading ? "loading…" : "no preview"}</span>}
                    <span className={`ov-st st ${m.status}`}>{m.status}</span>
                  </div>
                  <div className="ov-meta">
                    {page?.favicon && <img className="ov-fav" src={page.favicon} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                    <span className="t">{m.label || page?.title || set?.name || "Member"}</span>
                  </div>
                  <div className="ov-meta" style={{ paddingTop: 0 }}>
                    <span className="u">{host(m.url || page?.url || "")}</span>
                  </div>
                </div>
              );
            })
          : pages.map((p) => (
              <div key={p.pageId} className={`ov-card ${p.pageId === activePageId ? "active" : ""}`} onClick={() => void activate(p.pageId)}>
                <div className="ov-shot">
                  {shots[p.pageId] || previews[p.pageId] ? <img src={shots[p.pageId] || previews[p.pageId]} alt="" /> : <span>{p.loading ? "loading…" : p.backend === "chrome" ? "Chrome tab" : "no preview"}</span>}
                  {p.backend === "chrome" && <span className="ov-src">Chrome</span>}
                </div>
                <div className="ov-meta">
                  {p.favicon && <img className="ov-fav" src={p.favicon} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                  <span className="t">{p.title || "New Tab"}</span>
                </div>
                <div className="ov-meta" style={{ paddingTop: 0 }}>
                  <span className="u">{host(p.url)}</span>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
