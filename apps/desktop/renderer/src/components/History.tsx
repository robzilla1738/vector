import { useEffect, useMemo, useRef, useState } from "react";
import type { HistoryEntry } from "@vector/contracts";
import { useStore, call } from "../store";
import { hostOf } from "../workspace";
import { TileFace } from "./SiteTile";
import { I } from "./icons";

function dayLabel(ts: number): string {
  const d = new Date(ts);
  const today = new Date();
  const diff = Math.floor((new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() - new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

/** ⌘Y — searchable history grouped by day, fully keyboard-driven. */
export function History() {
  const setOverlay = useStore((s) => s.setOverlay);
  const newTab = useStore((s) => s.newTab);
  const [items, setItems] = useState<HistoryEntry[]>([]);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      void call<HistoryEntry[]>("history.list", { query: q || undefined, limit: 200 }).then(setItems).catch(() => setItems([]));
    }, q ? 100 : 0);
    return () => window.clearTimeout(t);
  }, [q]);
  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    listRef.current?.querySelectorAll<HTMLElement>("[role=option]")[sel]?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const groups = useMemo(() => {
    const out: { label: string; items: HistoryEntry[] }[] = [];
    for (const h of items) {
      const label = dayLabel(h.visitedAt);
      const g = out[out.length - 1];
      if (g && g.label === label) g.items.push(h);
      else out.push({ label, items: [h] });
    }
    return out;
  }, [items]);

  const open = (h: HistoryEntry) => {
    setOverlay(null);
    void newTab(h.url);
  };

  let idx = -1;
  return (
    <div className="overlay-scrim fade-in" onMouseDown={() => setOverlay(null)}>
      <div className="palette pop-in" role="dialog" aria-label="History" onMouseDown={(e) => e.stopPropagation()}>
        <div className="palette-field">
          <span className="palette-ico">{I.clock}</span>
          <input
            autoFocus
            value={q}
            role="combobox"
            aria-expanded
            aria-controls="history-list"
            aria-label="Search history"
            placeholder="Search history…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOverlay(null); }
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter" && items[sel]) open(items[sel]!);
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div className="palette-list" ref={listRef} role="listbox" id="history-list">
          {groups.map((g) => (
            <div key={g.label}>
              <div className="pal-section">{g.label}</div>
              {g.items.map((h) => {
                idx += 1;
                const i = idx;
                return (
                  <div key={`${h.url}-${h.visitedAt}`} role="option" aria-selected={i === sel} className={`pal-item ${i === sel ? "sel" : ""}`} onMouseMove={() => sel !== i && setSel(i)} onClick={() => open(h)}>
                    <span className="pal-ico"><TileFace url={h.url} size="sm" /></span>
                    <span className="t">{h.title || hostOf(h.url)}</span>
                    <span className="d">{hostOf(h.url)}</span>
                    <span className="d nums">{new Date(h.visitedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {items.length === 0 && <div className="pal-empty">{q ? "No matches" : "No history yet"}</div>}
        </div>
      </div>
    </div>
  );
}
