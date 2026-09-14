import { useEffect, useState } from "react";
import { useStore, call } from "../store";
import type { HistoryEntry } from "@vector/contracts";

export function History() {
  const setOverlay = useStore((s) => s.setOverlay);
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    void call<HistoryEntry[]>("history.list", { query: q || undefined, limit: 200 }).then(setItems);
  }, [q]);

  return (
    <div className="overlay-scrim fade-in" onMouseDown={() => setOverlay(null)}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input autoFocus value={q} placeholder="Search history…" onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Escape" && setOverlay(null)} />
        <div className="palette-list">
          {items.map((h, i) => (
            <div key={i} className="pal-item" onClick={() => {
              setOverlay(null);
              void call("pages.open", { url: h.url, backend: "vector", activate: true });
            }}>
              <span className="t">{h.title || h.url}</span>
              <span className="d">{new Date(h.visitedAt).toLocaleString()}</span>
            </div>
          ))}
          {items.length === 0 && <div className="pal-item"><span className="t" style={{ color: "var(--ink-2)" }}>No history</span></div>}
        </div>
      </div>
    </div>
  );
}
