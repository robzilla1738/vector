import { memo, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageContextRef, PageTarget } from "@aux/contracts";
import { sourceRef, sourceStatus } from "../browser-context-sources";
import { availableConversationPage, conversationPage } from "../conversation-page";
import { useStore, call, errToast } from "../store";
import { hostOf } from "../workspace";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { Popover } from "../ui/popover";
import "./ContextPicker.css";
import { Checkbox } from "../ui";
import { shellIconClose, shellIconGlobe, shellIconReload } from "./icons";

const availableSource = (page: PageTarget, primaryPageId?: string) => availableConversationPage(page) && !page.loading && page.url.length <= 8192
  && page.pageId !== primaryPageId;

const AdditionalTabChoice = memo(function AdditionalTabChoice({ pageId, selected, disabled, onToggle }: {
  pageId: string; selected: boolean; disabled: boolean; onToggle(pageId: string): void;
}) {
  const page = useStore(state => state.pages.find(item => item.pageId === pageId));
  if (!page) return null;
  return <label className="context-choice">
    <Checkbox checked={selected} disabled={disabled} onChange={() => onToggle(pageId)} />
    <span title={page.url}><strong>{page.title || hostOf(page.url)}</strong><small>{hostOf(page.url)}</small></span>
  </label>;
});

const SourceChip = memo(function SourceChip({ source, primaryPageId, disabled, busy, onRefresh, onRemove }: {
  source: PageContextRef; primaryPageId?: string; disabled: boolean; busy: boolean;
  onRefresh(pageId: string): void; onRemove(pageId: string): void;
}) {
  const page = useStore(state => state.pages.find(item => item.pageId === source.pageId));
  const status = useStore(state => sourceStatus(source, state.pages));
  const label = status === "missing" ? hostOf(source.url) : page?.title || hostOf(source.url);
  return <span className={status === "current" ? "" : "stale"}>
    {shellIconGlobe}<span title={source.url}>{source.pageId === primaryPageId ? `Captured source · ${label}` : label}</span>
    {status !== "current" && <small>{status === "changed" ? "Changed" : "Closed"}</small>}
    {status === "changed" && <button type="button" disabled={disabled || busy || !!page?.loading} aria-label={`Use current ${label}`} title="Use this tab's current page" onClick={() => onRefresh(source.pageId)}>{shellIconReload}</button>}
    <button type="button" disabled={disabled || busy} aria-label={`Remove ${label}`} onClick={() => onRemove(source.pageId)}>{shellIconClose}</button>
  </span>;
});

/** Additional tabs are explicit live sources. Navigation requires a fresh choice. */
export function BrowserContextTray({ primary, linkedPageId, sources, onPrimary, onSources, disabled }: {
  primary: string;
  linkedPageId?: string;
  sources: PageContextRef[];
  onPrimary(value: string): void;
  onSources(value: PageContextRef[]): void;
  disabled: boolean;
}) {
  const activePageId = useStore(state => state.activePageId);
  const splitPageId = useStore(state => state.splitPageId);
  const [query, setQuery] = useState("");
  const [busyPageId, setBusyPageId] = useState<string | null>(null);
  const primaryPage = useStore(state => conversationPage(state.pages, primary, activePageId, linkedPageId));
  const additionalSources = sources.filter(source => source.pageId !== primaryPage?.pageId);
  const matchingIds = useStore(useShallow(state => state.pages.filter(page => availableSource(page, primaryPage?.pageId)
    && `${page.title} ${page.url}`.toLowerCase().includes(query.toLowerCase())).map(page => page.pageId)));
  const splitCompanionId = primaryPage && splitPageId
    ? primaryPage.pageId === splitPageId ? activePageId : splitPageId
    : null;
  const splitCompanion = useStore(state => state.pages.find(page => page.pageId === splitCompanionId && availableSource(page, primaryPage?.pageId)));
  const liveSource = async (pageId: string) => {
    const pending = await call("browser.recovery.list", {});
    if (pending.some(tab => tab.pageId === pageId)) await call("browser.recovery.retry", { pageId });
    const live = (await call("pages.list", {})).find(item => item.pageId === pageId);
    if (!live || !availableSource(live)) throw new Error("This browser tab is unavailable.");
    return sourceRef(live);
  };
  const toggle = async (pageId: string) => {
    if (disabled || busyPageId) return;
    if (sources.some(source => source.pageId === pageId)) {
      onSources(sources.filter(source => source.pageId !== pageId));
      return;
    }
    if (additionalSources.length >= 8) { errToast(new Error("Choose up to eight additional tabs.")); return; }
    const page = useStore.getState().pages.find(item => item.pageId === pageId && availableSource(item, primaryPage?.pageId));
    if (!page) return;
    setBusyPageId(pageId);
    try { onSources([...sources, await liveSource(pageId)]); }
    catch (error) { errToast(error); }
    finally { setBusyPageId(null); }
  };
  const refresh = async (pageId: string) => {
    const page = useStore.getState().pages.find(item => item.pageId === pageId);
    if (!page || disabled || busyPageId) return;
    setBusyPageId(pageId);
    try {
      const latest = await liveSource(pageId);
      onSources(sources.map(source => source.pageId === pageId ? latest : source));
    }
    catch (error) { errToast(error); }
    finally { setBusyPageId(null); }
  };

  return <div className="conversation-browser-context">
    <div className="conversation-browser-context-controls">
      <BrowserContextPicker value={primary} onChange={value => {
        onPrimary(value);
        const chosen = conversationPage(useStore.getState().pages, value, activePageId, linkedPageId);
        if (chosen && sources.some(source => source.pageId === chosen.pageId)) onSources(sources.filter(source => source.pageId !== chosen.pageId));
      }} linkedPageId={linkedPageId} disabled={disabled} />
      {splitCompanion && !sources.some(source => source.pageId === splitCompanion.pageId) &&
        <button type="button" className="btn sm ghost" disabled={disabled || !!busyPageId || additionalSources.length >= 8}
          title={`Include ${splitCompanion.title || hostOf(splitCompanion.url)} from the current split`}
          onClick={() => void toggle(splitCompanion.pageId)}>Add split tab</button>}
      <Popover label="Add browser tabs" disabled={disabled} trigger={<span>{busyPageId ? "Loading tab…" : `Add tabs${additionalSources.length ? ` · ${additionalSources.length}` : ""}`}</span>}>
        {() => <><input type="search" aria-label="Search browser context" placeholder="Find a tab…" value={query} onChange={event => setQuery(event.target.value)}/>
          <div role="group" aria-label="Additional browser tabs">{matchingIds.map(pageId => {
            const selected = sources.some(source => source.pageId === pageId);
            return <AdditionalTabChoice key={pageId} pageId={pageId} selected={selected} disabled={disabled || !!busyPageId || (additionalSources.length >= 8 && !selected)} onToggle={id => void toggle(id)} />;
          })}{!matchingIds.length && <p className="hint">No matching available tabs.</p>}</div></>}
      </Popover>
    </div>
    {sources.length > 0 && <div role="group" className="conversation-browser-sources" aria-label="Selected browser tabs">
      {sources.map(source => <SourceChip key={source.pageId} source={source} primaryPageId={primaryPage?.pageId} disabled={disabled} busy={!!busyPageId}
        onRefresh={id => void refresh(id)} onRemove={id => { onSources(sources.filter(item => item.pageId !== id)); if (id === primaryPage?.pageId) onPrimary("none"); }} />)}
    </div>}
  </div>;
}
