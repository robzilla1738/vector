import { moveListFocus } from "../keyboard-list";
import { useStore } from "../store";
import { hostOf } from "../workspace";
import { CLOSED_TAB_LIMIT } from "../closed-tabs";
import { I } from "./icons";
import { useShortcutLabels } from "../use-shortcut-label";
import { memo, type RefObject } from "react";

const ClosedTabRow = memo(function ClosedTabRow({ tabId, groupCount, firstInGroup, location, archived, busy, rowRef }: {
  tabId: string; groupCount: number; firstInGroup: boolean; location: string; archived: boolean;
  busy: boolean; rowRef?: RefObject<HTMLButtonElement | null>;
}) {
  const tab = useStore(state => state.closedTabs.find(item => item.pageId === tabId));
  if (!tab) return null;
  return <div className="library-item">
    <button ref={rowRef} className="library-open" disabled={busy} title={tab.url} onClick={() => void useStore.getState().reopenClosedTab(tab.pageId)}>
      <span className="library-title">{tab.title || hostOf(tab.url)}</span><span className="library-url">{tab.url}</span>
      <span className="hint">{location}{archived ? " · Space will be restored" : ""} · {new Date(tab.closedAt).toLocaleString()}</span>
    </button>
    {firstInGroup && groupCount > 1 && <button className="btn sm" disabled={busy} onClick={() => void useStore.getState().reopenClosedTab(tab.pageId, true)}>Reopen group · {groupCount}</button>}
    <button className="btn sm" disabled={busy} aria-label={`Reopen ${tab.title || hostOf(tab.url)}`} onClick={() => void useStore.getState().reopenClosedTab(tab.pageId)}>{I.reopen} Reopen</button>
  </div>;
});
import { useShallow } from "zustand/react/shallow";

export function RecentlyClosed({ query, firstOpenRef }: { query: string; firstOpenRef?: RefObject<HTMLButtonElement | null> }) {
  const key = useShortcutLabels();
  useStore(useShallow(state => state.closedTabs.map(tab => JSON.stringify([
    tab.pageId, tab.title, tab.url, tab.closedAt, tab.spaceId, tab.folderId, tab.groupId,
  ]))));
  const closedTabs = useStore.getState().closedTabs;
  const layout = useStore(state => state.layout);
  const busy = useStore(state => state.reopeningTab);
  const spaces = [...layout.spaces, ...(layout.archivedSpaces ?? [])];
  const q = query.trim().toLocaleLowerCase();
  const items = [...closedTabs].reverse().filter(tab => `${tab.title} ${tab.url} ${spaces.find(space => space.id === tab.spaceId)?.name ?? ""}`.toLocaleLowerCase().includes(q));
  return <>
    <p className="library-message hint">Your last {CLOSED_TAB_LIMIT} closed tabs, kept for up to 30 days. Reopening restores the address and its place in the sidebar.</p>
    <div className="palette-list" id="library-results" role="tabpanel" aria-labelledby="library-closed" onKeyDown={event=>moveListFocus(event,".library-open")}>
      {!items.length && <p className="pal-empty">{q ? "No closed tabs match." : `Tabs you close will appear here.${key("reopen-closed-tab") ? ` Reopen the most recent with ${key("reopen-closed-tab")}.` : ""}`}</p>}
      {items.map((tab, index) => {
        const groupCount = tab.groupId ? closedTabs.filter(item => item.groupId === tab.groupId).length : 0;
        const firstInGroup = tab.groupId && !items.slice(0, index).some(item => item.groupId === tab.groupId);
        const space = spaces.find(space => space.id === tab.spaceId);
        const archived = layout.archivedSpaces?.some(space => space.id === tab.spaceId);
        const folder = layout.folders.find(folder => folder.id === tab.folderId && folder.spaceId === tab.spaceId);
        return <ClosedTabRow key={tab.pageId} tabId={tab.pageId} groupCount={groupCount} firstInGroup={!!firstInGroup}
          location={`${space?.name ?? "Current Space"}${folder ? ` / ${folder.name}` : ""}`}
          archived={!!archived} busy={busy} rowRef={index === 0 ? firstOpenRef : undefined} />;
      })}
    </div>
  </>;
}
