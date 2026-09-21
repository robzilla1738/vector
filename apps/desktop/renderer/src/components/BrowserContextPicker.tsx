import { useStore } from "../store";

export function BrowserContextPicker({ value, onChange, linkedPageId, disabled = false, allowNew = true }: {
  value: string; onChange(value: string): void; linkedPageId?: string; disabled?: boolean; allowNew?: boolean;
}) {
  const pages = useStore(state => state.pages);
  const activePageId = useStore(state => state.activePageId);
  const available = pages.filter(page => !page.ownedByRuntime && !["crashed", "detached"].includes(page.viewStatus ?? ""));
  const active = available.find(page => page.pageId === activePageId);
  const linked = available.find(page => page.pageId === linkedPageId);
  const missing = !["active", "linked", "none"].includes(value) && !available.some(page => page.pageId === value);
  return <select aria-label="Browser context" value={value} disabled={disabled} onChange={event => onChange(event.target.value)}>
    {(allowNew || value === "none") && <option value="none" disabled={!allowNew}>{allowNew ? "New browser tab" : "Choose a browser tab"}</option>}
    <option value="active">{active ? `Current tab: ${active.title || active.url}` : "Current tab: none open"}</option>
    {value === "linked" || linked ? <option value="linked">{linked ? `Conversation tab: ${linked.title || linked.url}` : "Conversation tab unavailable"}</option> : null}
    {missing && <option value={value}>Selected tab unavailable — choose another</option>}
    {available.filter(page => page.pageId !== linkedPageId).map(page => <option key={page.pageId} value={page.pageId}>{page.title || page.url}</option>)}
  </select>;
}
