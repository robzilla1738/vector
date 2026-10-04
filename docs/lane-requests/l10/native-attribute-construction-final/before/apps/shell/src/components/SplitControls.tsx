import { useStore } from "../store";
import { visibleSplitGroup } from "../features/surfaces/split-actions";
import { runCommand } from "../commands";
import { FavIcon } from "./SiteTile";
export function SplitControls() {
  const layout = useStore(state => state.layout), pageId = useStore(state => state.activePageId);
  const pages = useStore(state => state.pages), mode = useStore(state => state.mode);
  const group = visibleSplitGroup(layout, pageId);
  if (mode !== "focus" || !group) return null;
  const panes = group.panes.map(id => pages.find(page => page.pageId === id)).filter(page => !!page);
  return <section className="sb-split-pair" aria-label="Split view">
    <span className="sb-split-pair-title"><span className="split-favicons">{panes.map(page => <FavIcon key={page.pageId} url={page.url} src={page.favicon} size="sm" />)}</span>{panes.length} tabs in split view</span>
    <button type="button" data-command-id="split-swap" aria-label="Swap split sides" onClick={() => runCommand("split-swap")}>Swap</button>
    <button type="button" data-command-id="split-flip" aria-label="Flip split layout" onClick={() => runCommand("split-flip")}>Flip</button>
    <button type="button" data-command-id="split-separate" aria-label="Separate split tabs" onClick={() => runCommand("split-separate")}>Separate</button>
    <button type="button" data-command-id="split-close" aria-label="Close split pane" onClick={() => runCommand("split-close")}>Close pane</button>
  </section>;
}
