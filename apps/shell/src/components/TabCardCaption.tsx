import type { PageTarget } from "@aux/contracts";
import { hostOf, tabLabel } from "../workspace";
import { useStore } from "../store";
import { FavIcon } from "./SiteTile";
import { I } from "./icons";
import "./TabCardCaption.css";

/** Identical recorded page identity in the overview and delayed hover preview. */
export function TabCardCaption({ page, space, pinned = false }: { page: PageTarget; space?: string; pinned?: boolean }) {
  const title = useStore(state => tabLabel(state.layout, page));
  return <span className="tab-card-caption">
    <span className="tab-card-heading"><FavIcon url={page.url} src={page.favicon} size="sm" />
      <span className="tab-card-title">{title}</span>
      {pinned && <span role="img" className="tab-card-pin" aria-label="Pinned">{I.pin}</span>}
    </span>
    <span className="tab-card-domain">{page.url === "about:blank" ? "New Tab" : hostOf(page.url)}{space ? ` · ${space}` : ""}</span>
    {page.viewStatus === "crashed" ? <span className="tab-card-status">Page stopped responding</span> : page.loading ? <span className="tab-card-status">Loading…</span> : null}
  </span>;
}
