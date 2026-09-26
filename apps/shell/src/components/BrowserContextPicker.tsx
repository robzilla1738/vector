import { useState } from "react";
import { useStore } from "../store";
import { hostOf } from "../workspace";
import { AnchoredPanel } from "./AnchoredPanel";
import { I } from "./icons";

export function BrowserContextPicker({ value, onChange, linkedPageId, disabled = false, allowNew = true }: {
  value: string; onChange(value: string): void; linkedPageId?: string; disabled?: boolean; allowNew?: boolean;
}) {
  const pages = useStore(state => state.pages);
  const activePageId = useStore(state => state.activePageId);
  const [query, setQuery] = useState("");
  const available = pages.filter(page => !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
  const active = available.find(page => page.pageId === activePageId);
  const linked = available.find(page => page.pageId === linkedPageId);
  const chosen = available.find(page => page.pageId === value);
  const label = value === "none" ? (allowNew ? "New browser tab" : "Choose a browser tab") : value === "active" ? (active ? `Current tab: ${active.title || active.url}` : "Current tab: none open") : value === "linked" ? (linked ? `Conversation tab: ${linked.title || linked.url}` : "Conversation tab unavailable") : chosen?.title || chosen?.url || "Selected tab unavailable — choose another";
  const matches = available.filter(page => `${page.title} ${page.url}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
  return <AnchoredPanel label="Browser context" disabled={disabled} className="browser-context-trigger" trigger={<>{I.globe}<span title={label}>{label}</span>{I.down}</>}>{close => {
    const select = (next: string) => { onChange(next); setQuery(""); close(); };
    const choice = (key: string, title: string, subtitle?: string) => <button type="button" key={key} className="context-choice" aria-pressed={value === key} onClick={() => select(key)}><span><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>{value === key && I.check}</button>;
    return <><input type="search" aria-label="Find browser context" placeholder="Find a tab…" value={query} onChange={event => setQuery(event.target.value)}/>
      {!query && <>{allowNew && choice("none", "New browser tab", "Start without an existing page")}{choice("active", "Current tab", active?.title || "None open")}{(linked || value === "linked") && choice("linked", "Conversation tab", linked?.title || "Unavailable")}</>}
      <section className="context-picker-group" aria-label="Open browser tabs"><p>Open tabs</p>{matches.map(page => choice(page.pageId, page.title || page.url, hostOf(page.url)))}{!matches.length && <p>No matching available tabs.</p>}</section>
    </>;
  }}</AnchoredPanel>;
}
