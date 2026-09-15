import { useShallow } from "zustand/react/shallow";
import { useStore, call, toast, errToast } from "../store";
import { SiteTile } from "./SiteTile";
import { ResizeHandle } from "./ResizeHandle";
import { I } from "./icons";
import type { PageTarget } from "@vector/contracts";

const ctlColor: Record<string, string> = {
  human: "var(--warn)",
  agent: "var(--accent)",
  external: "var(--accent)",
};

function SbTab({ p, active }: { p: PageTarget; active: boolean }) {
  const activate = useStore((s) => s.activate);
  const crashed = p.viewStatus === "crashed";
  return (
    <div
      className={`sb-tab ${active ? "active" : ""} ${crashed ? "crashed" : ""}`}
      onClick={() => void activate(p.pageId).catch(errToast)}
      onAuxClick={(e) => {
        if (e.button === 1) {
          e.preventDefault();
          void call("pages.close", { pageId: p.pageId }).catch(errToast);
        }
      }}
      title={crashed ? `Crashed — ${p.url}` : p.url}
    >
      <span className="fav">
        {crashed ? I.alert : p.loading ? <span className="spin" /> : p.favicon ? <img src={p.favicon} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} /> : I.globe}
      </span>
      <span className="t">{p.title || p.url || "New Tab"}</span>
      {p.controller !== "none" && <span className="ctl-dot" style={{ background: ctlColor[p.controller] }} />}
      {p.backend === "chrome" && <span className="badge-agent">Chrome</span>}
      <button
        className="x"
        title="Close tab (⌘W)"
        aria-label="Close tab"
        onClick={(e) => {
          e.stopPropagation();
          void call("pages.close", { pageId: p.pageId }).catch(errToast);
        }}
      >
        {I.close}
      </button>
    </div>
  );
}

export function Sidebar() {
  const pages = useStore(useShallow((s) => s.pages.filter((p) => p.viewStatus !== "background" && !p.ownedByRuntime)));
  const sets = useStore((s) => s.sets);
  const members = useStore((s) => s.members);
  const activePageId = useStore((s) => s.activePageId);
  const activeSetId = useStore((s) => s.activeSetId);
  const sessions = useStore((s) => s.sessions);
  const setMode = useStore((s) => s.setMode);
  const mode = useStore((s) => s.mode);
  const setOverlay = useStore((s) => s.setOverlay);
  const refreshResults = useStore((s) => s.refreshResults);
  const bookmarks = useStore((s) => s.bookmarks);
  const sidebarWidth = useStore((s) => s.sidebarWidth);
  const setSidebarWidth = useStore((s) => s.setSidebarWidth);
  const chrome = sessions.find((s) => s.backend === "chrome");
  const pins = bookmarks.slice(0, 6);
  const newTab = () => void call("pages.open", { url: "about:blank", backend: "vector", activate: true }).catch(errToast);

  return (
    <div className="sidebar">
      <div className="sb-top">
        <span className="sp" />
        <button className="icon-btn" title="New tab (⌘T)" aria-label="New tab" onClick={newTab}>
          {I.plus}
        </button>
      </div>
      {pins.length > 0 && (
        <div className="sb-pins">
          {pins.map((b) => (
            <SiteTile
              key={b.url}
              url={b.url}
              title={b.title}
              onClick={() => void call("pages.open", { url: b.url, backend: "vector", activate: true }).catch(errToast)}
            />
          ))}
        </div>
      )}
      <div className="sb-tabs">
        <div className="sb-label">Tabs</div>
        {pages.map((p) => (
          <SbTab key={p.pageId} p={p} active={p.pageId === activePageId && mode === "focus"} />
        ))}
        <button className="sb-newtab" onClick={newTab}>
          {I.plus} New Tab
        </button>
        {sets.length > 0 && (
          <>
            <div className="sb-label">Sets</div>
            {sets.map((st) => {
              const n = members.filter((m) => m.setId === st.setId).length || st.memberIds.length;
              return (
                <button
                  key={st.setId}
                  className={`sb-tab ${activeSetId === st.setId && mode === "table" ? "active" : ""}`}
                  onClick={() => {
                    void refreshResults(st.setId).then(() => setMode("table"));
                  }}
                >
                  <span className="fav">{I.layers}</span>
                  <span className="t">{st.name}</span>
                  <span className="sb-count">{n}</span>
                </button>
              );
            })}
          </>
        )}
      </div>
      <div className="sb-foot">
        {chrome && (
          <button
            className={`session-pill ${chrome.status === "connected" ? "" : "off"}`}
            title={
              chrome.status === "connected"
                ? `Chrome attached${chrome.detail ? ` — ${chrome.detail}` : ""}`
                : "Chrome not attached — click to attach (CDP :9222)"
            }
            onClick={() => {
              if (chrome.status === "connected") return;
              void call("chrome.attach", { port: 9222 })
                .then(() => toast("Chrome attached"))
                .catch(errToast);
            }}
          >
            {I.chrome}
            <span className="dot" />
            Chrome
          </button>
        )}
        <span className="sp" />
        <button className="icon-btn" title="History (⌘Y)" aria-label="History" onClick={() => setOverlay("history")}>
          {I.clock}
        </button>
        <button className="icon-btn" title="Downloads (⌘⇧J)" aria-label="Downloads" onClick={() => setOverlay("downloads")}>
          {I.download}
        </button>
        <button className="icon-btn" title="Settings (⌘,)" aria-label="Settings" onClick={() => setOverlay("settings")}>
          {I.gear}
        </button>
      </div>
      <ResizeHandle side="left" value={sidebarWidth} min={176} max={360} reset={216} onResize={setSidebarWidth} />
    </div>
  );
}
