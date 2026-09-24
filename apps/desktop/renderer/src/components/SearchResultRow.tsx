import type { ReactNode } from "react";
import "./SearchResultRow.css";

/** Literal matching only: source titles and queries are never interpreted as markup. */
function Match({ text, query }: { text: string; query: string }) {
  const needle = query.trim().replace(/^[@/]/, "").trim();
  if (!needle) return <>{text}</>;
  const match = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "iu").exec(text);
  if (!match) return <>{text}</>;
  const index = match.index;
  return <>{text.slice(0, index)}<mark>{text.slice(index, index + needle.length)}</mark>{text.slice(index + needle.length)}</>;
}

/** Presentation only; each search owner retains its keyboard/selection controller. */
export function SearchResultRow({ id, title, detail, icon, selected, query, trailing, className = "", onHover, onSelect }: {
  id: string; title: string; detail?: string; icon: ReactNode; selected: boolean;
  query: string; trailing?: ReactNode; className?: string; onHover: () => void; onSelect: () => void;
}) {
  return <div id={id} role="option" aria-selected={selected}
    className={`search-result-row ${selected ? "sel" : ""} ${className}`}
    onMouseMove={onHover} onClick={onSelect}>
    <span className="search-result-icon">{icon}</span>
    <span className="search-result-copy">
      <span className="search-result-title t"><Match text={title} query={query} /></span>
      {detail && <span className="search-result-detail d"><Match text={detail} query={query} /></span>}
    </span>
    {trailing && <span className="search-result-action">{trailing}</span>}
  </div>;
}
