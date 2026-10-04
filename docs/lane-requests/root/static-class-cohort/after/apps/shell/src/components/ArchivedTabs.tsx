import { staticHintProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { useMemo } from "react";
import { useStore } from "../store";
import { executeCommand } from "../commands";
import { FavIcon } from "./SiteTile";
import { staticGrowProps as auxClassGrowProps } from "../ui/class-props";

export function ArchivedTabs({ query }: { query: string }) {
  const layout = useStore(state => state.layout);
  const entries = useMemo(() => (layout.archivedTabs ?? []).filter(entry => entry.state === "archived" && `${entry.title} ${entry.url}`.toLocaleLowerCase().includes(query.toLocaleLowerCase())).sort((a, b) => b.archivedAt - a.archivedAt), [layout.archivedTabs, query]);
  const groups = new Map<string, typeof entries>();
  for (const entry of entries) {
    const space = [...layout.spaces, ...(layout.archivedSpaces ?? [])].find(space => space.id === entry.spaceId)?.name ?? "Removed Space";
    const label = `${new Date(entry.archivedAt).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · ${space}`;
    groups.set(label, [...(groups.get(label) ?? []), entry]);
  }
  return <div className="archive-list">
    <div className="library-tools"><button {...smallButtonProps} data-command-id="archive-restore-all" disabled={!entries.length} onClick={() => void executeCommand("archive-restore-all").catch(() => undefined)}>Restore all</button><p {...staticHintProps}>Archived tabs stay here until you restore or delete them.</p></div>
    {!entries.length && <p className="library-empty">{query ? "No archived tabs match your search." : "Your archive is empty. Tabs archived from Today appear here."}</p>}
    {[...groups].map(([label, rows]) => <section key={label} aria-label={label}><h4 className="archive-day">{label}</h4>{rows.map(entry => <div key={entry.archiveId} className="library-row"><span className="library-icon"><FavIcon url={entry.url} size="sm" /></span><span {...auxClassGrowProps}><span className="archive-title">{entry.title || entry.url}</span><span className="hint archive-url">{entry.url}</span></span><button className="btn ghost sm" data-command-id="archive-restore" onClick={() => void executeCommand("archive-restore", { payload: { archiveId: entry.archiveId } }).catch(() => undefined)}>Restore</button><button className="btn ghost sm" data-command-id="archive-delete" onClick={() => void executeCommand("archive-delete", { payload: { archiveId: entry.archiveId } }).catch(() => undefined)}>Delete</button></div>)}</section>)}
  </div>;
}
