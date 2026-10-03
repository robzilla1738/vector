import { memo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { availableConversationPage } from "../conversation-page";
import { useStore } from "../store";
import { hostOf } from "../workspace";
import { Popover } from "../ui/popover";
import { shellIconCheck, shellIconDown, shellIconGlobe } from "./icons";
import "./ContextPicker.css";

const availablePage = availableConversationPage;

const BrowserContextChoice = memo(function BrowserContextChoice({ pageId, value, onSelect }: { pageId: string; value: string; onSelect(value: string): void }) {
  const page = useStore(state => state.pages.find(item => item.pageId === pageId && availablePage(item)));
  if (!page) return null;
  return <button type="button" className="context-choice" title={page.title ? `${page.title}\n${page.url}` : page.url} aria-pressed={value === pageId} onClick={() => onSelect(pageId)}>
    <span><strong>{page.title || page.url}</strong><small>{hostOf(page.url)}</small></span>{value === pageId && shellIconCheck}
  </button>;
});

export function BrowserContextPicker({ value, onChange, linkedPageId, disabled = false, allowNew = true }: {
  value: string; onChange(value: string): void; linkedPageId?: string; disabled?: boolean; allowNew?: boolean;
}) {
  const activePageId = useStore(state => state.activePageId);
  const [query, setQuery] = useState("");
  const active = useStore(state => state.pages.find(page => page.pageId === activePageId && availablePage(page)));
  const linked = useStore(state => state.pages.find(page => page.pageId === linkedPageId && availablePage(page)));
  const chosen = useStore(state => state.pages.find(page => page.pageId === value && availablePage(page)));
  const label = value === "none" ? (allowNew ? "Add browser context" : "Choose a browser tab") : value === "active" ? (active ? `Current tab: ${active.title || active.url}` : "Current tab: no website") : value === "linked" ? (linked ? `Conversation tab: ${linked.title || linked.url}` : "Conversation tab unavailable") : chosen?.title || chosen?.url || "Selected tab unavailable — choose another";
  const matches = useStore(useShallow(state => state.pages.filter(page => availablePage(page)
    && `${page.title} ${page.url}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map(page => page.pageId)));
  return <Popover label="Browser context" disabled={disabled} className="browser-context-trigger" trigger={<>{shellIconGlobe}<span title={label}>{label}</span>{shellIconDown}</>}>{close => {
    const select = (next: string) => { onChange(next); setQuery(""); close(); };
    const choice = (key: string, title: string, subtitle?: string, unavailable = false) => <button type="button" key={key} className="context-choice" disabled={unavailable} title={subtitle ? `${title}\n${subtitle}` : title} aria-pressed={value === key} onClick={() => select(key)}><span><strong>{title}</strong>{subtitle && <small>{subtitle}</small>}</span>{value === key && shellIconCheck}</button>;
    return <><input type="search" aria-label="Find browser context" placeholder="Find a tab…" value={query} onChange={event => setQuery(event.target.value)}/>
      {!query && <>{allowNew && choice("none", "No browser context", "Chat without attaching a tab")}{choice("active", "Current tab", active?.title || "No website open", !active)}{(linked || value === "linked") && choice("linked", "Conversation tab", linked?.title || "Unavailable", !linked)}</>}
      <section className="context-picker-group" aria-label="Open browser tabs"><p>Open tabs</p>{matches.map(pageId => <BrowserContextChoice key={pageId} pageId={pageId} value={value} onSelect={select} />)}{!matches.length && <p>No matching available tabs.</p>}</section>
    </>;
  }}</Popover>;
}
