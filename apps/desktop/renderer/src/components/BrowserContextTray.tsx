import { useEffect, useRef, useState } from "react";
import type { PageContextRef } from "@aux/contracts";
import { sourceRef, sourceStatus } from "../browser-context-sources";
import { conversationPage } from "../conversation-page";
import { useStore, call, errToast } from "../store";
import { hostOf } from "../workspace";
import { BrowserContextPicker } from "./BrowserContextPicker";
import { I } from "./icons";

/** Additional tabs are explicit live sources. Navigation requires a fresh choice. */
export function BrowserContextTray({ primary, linkedPageId, sources, onPrimary, onSources, disabled }: {
  primary: string;
  linkedPageId?: string;
  sources: PageContextRef[];
  onPrimary(value: string): void;
  onSources(value: PageContextRef[]): void;
  disabled: boolean;
}) {
  const pages = useStore(state => state.pages);
  const activePageId = useStore(state => state.activePageId);
  const splitPageId = useStore(state => state.splitPageId);
  const [query, setQuery] = useState("");
  const [busyPageId, setBusyPageId] = useState<string | null>(null);
  const primaryPage = conversationPage(pages, primary, activePageId, linkedPageId);
  const additionalSources = sources.filter(source => source.pageId !== primaryPage?.pageId);
  const available = pages.filter(page => !page.ownedByRuntime && !page.loading
    && !["crashed", "detached"].includes(page.viewStatus ?? "") && page.url.length <= 8192
    && page.pageId !== primaryPage?.pageId);
  const splitCompanionId = primaryPage && splitPageId
    ? primaryPage.pageId === splitPageId ? activePageId : splitPageId
    : null;
  const splitCompanion = available.find(page => page.pageId === splitCompanionId);
  const picker = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const close = (event: PointerEvent) => { if (!picker.current?.contains(event.target as Node)) picker.current!.open = false; };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const liveSource = async (pageId: string) => {
    const pending = await call("browser.recovery.list", {});
    if (pending.some(tab => tab.pageId === pageId)) await call("browser.recovery.retry", { pageId });
    const live = (await call("pages.list", {})).find(item => item.pageId === pageId);
    if (!live || live.ownedByRuntime || live.viewStatus === "detached" || live.viewStatus === "crashed") throw new Error("This browser tab is unavailable.");
    return sourceRef(live);
  };
  const toggle = async (pageId: string) => {
    if (disabled || busyPageId) return;
    if (sources.some(source => source.pageId === pageId)) {
      onSources(sources.filter(source => source.pageId !== pageId));
      return;
    }
    if (additionalSources.length >= 8) { errToast(new Error("Choose up to eight additional tabs.")); return; }
    const page = available.find(item => item.pageId === pageId);
    if (!page) return;
    setBusyPageId(pageId);
    try { onSources([...sources, await liveSource(pageId)]); }
    catch (error) { errToast(error); }
    finally { setBusyPageId(null); }
  };
  const refresh = async (pageId: string) => {
    const page = pages.find(item => item.pageId === pageId);
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
        const chosen = conversationPage(pages, value, activePageId, linkedPageId);
        if (chosen && sources.some(source => source.pageId === chosen.pageId)) onSources(sources.filter(source => source.pageId !== chosen.pageId));
      }} linkedPageId={linkedPageId} disabled={disabled} />
      {splitCompanion && !sources.some(source => source.pageId === splitCompanion.pageId) &&
        <button type="button" className="btn sm ghost" disabled={disabled || !!busyPageId || additionalSources.length >= 8}
          title={`Include ${splitCompanion.title || hostOf(splitCompanion.url)} from the current split`}
          onClick={() => void toggle(splitCompanion.pageId)}>Add split tab</button>}
      <details ref={picker} className="conversation-browser-add" onKeyDown={event => {
        if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); picker.current!.open = false; picker.current?.querySelector("summary")?.focus(); }
      }}>
        <summary aria-disabled={disabled || !!busyPageId} onClick={event => { if (disabled || busyPageId) event.preventDefault(); }}>{busyPageId ? "Loading tab…" : `Add tabs${additionalSources.length ? ` · ${additionalSources.length}` : ""}`}</summary>
        <div role="group" aria-label="Additional browser tabs">
          <input type="search" aria-label="Search browser context" placeholder="Find a tab…" value={query} onChange={event => setQuery(event.target.value)}/>
          {available.length ? available.filter(page => `${page.title} ${page.url}`.toLowerCase().includes(query.toLowerCase())).map(page => <label key={page.pageId}>
            <input type="checkbox" checked={sources.some(source => source.pageId === page.pageId)} disabled={disabled || !!busyPageId || (additionalSources.length >= 8 && !sources.some(source => source.pageId === page.pageId))} onChange={() => void toggle(page.pageId)} />
            <span title={page.url}>{page.title || hostOf(page.url)}<small>{hostOf(page.url)}</small></span>
          </label>) : <p>No other available browser tabs.</p>}
        </div>
      </details>
    </div>
    {sources.length > 0 && <div className="conversation-browser-sources" aria-label="Selected browser tabs">
      {sources.map(source => {
        const page = pages.find(item => item.pageId === source.pageId);
        const status = sourceStatus(source, pages);
        const label = status === "missing" ? hostOf(source.url) : page?.title || hostOf(source.url);
        return <span key={source.pageId} className={status === "current" ? "" : "stale"}>
          {I.globe}<span title={source.url}>{source.pageId === primaryPage?.pageId ? `Captured source · ${label}` : label}</span>
          {status !== "current" && <small>{status === "changed" ? "Changed" : "Closed"}</small>}
          {status === "changed" && <button type="button" disabled={disabled || !!busyPageId || !!page?.loading} aria-label={`Use current ${label}`} title="Use this tab's current page" onClick={() => void refresh(source.pageId)}>{I.reload}</button>}
          <button type="button" disabled={disabled || !!busyPageId} aria-label={`Remove ${label}`} onClick={() => { onSources(sources.filter(item => item.pageId !== source.pageId)); if (source.pageId === primaryPage?.pageId) onPrimary("none"); }}>{I.close}</button>
        </span>;
      })}
    </div>}
  </div>;
}
