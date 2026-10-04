import { staticHintProps } from "../ui/class-props";
import { smallGhostButtonProps } from "../ui/button-props";
import { memo, useLayoutEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageContextRef, PageTarget } from "@aux/contracts";
import { useShortcutLabel, withShortcut } from "../use-shortcut-label";
import { executeCommand } from "../commands";
import { registerScopedControl } from "../scoped-control-commands";
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
  pageId: string; selected: boolean; disabled: boolean; onToggle(pageId: string): unknown;
}) {
  const page = useStore(state => state.pages.find(item => item.pageId === pageId));
  const choice = useRef<HTMLLabelElement>(null);
  const shortcut = useShortcutLabel("toggle-browser-source");
  useLayoutEffect(() => {
    const element = choice.current?.querySelector<HTMLInputElement>('input');
    if (!element || !page || disabled) return;
    const original = sourceRef(page);
    return registerScopedControl(element, "toggle-browser-source", pageId, () => {
      const current = useStore.getState().pages.find(item => item.pageId === pageId);
      if (!current || !availableSource(current) || sourceStatus(original, [current]) !== "current") throw new Error("This browser source changed. Choose its current tab again.");
      return onToggle(pageId);
    });
  }, [page, pageId, disabled, selected, onToggle]);
  if (!page) return null;
  return <label ref={choice} className="context-choice" title={withShortcut("Select additional browser source", shortcut)}>
    <Checkbox checked={selected} disabled={disabled} data-command-id="toggle-browser-source" onChange={event => { void executeCommand("toggle-browser-source", { payload: { pageId }, nativeInputEvent: event.nativeEvent }).catch(errToast); }} />
    <span title={page.url}><strong>{page.title || hostOf(page.url)}</strong><small>{hostOf(page.url)}</small></span>
  </label>;
});

const SourceChip = memo(function SourceChip({ source, primaryPageId, disabled, busy, onRefresh, onRemove }: {
  source: PageContextRef; primaryPageId?: string; disabled: boolean; busy: boolean;
  onRefresh(pageId: string): unknown; onRemove(pageId: string): void;
}) {
  const page = useStore(state => state.pages.find(item => item.pageId === source.pageId));
  const status = useStore(state => sourceStatus(source, state.pages));
  const label = status === "missing" ? hostOf(source.url) : page?.title || hostOf(source.url);
  const updateShortcut = useShortcutLabel("update-browser-source");
  const removeShortcut = useShortcutLabel("remove-browser-source");
  const removeButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const element = removeButton.current;
    if (!element || disabled || busy) return;
    const original = JSON.stringify(source);
    return registerScopedControl(element, "remove-browser-source", source.pageId, () => {
      if (JSON.stringify(source) !== original) throw new Error("The selected source changed. Choose its current Remove control.");
      return onRemove(source.pageId);
    });
  }, [source, disabled, busy, onRemove]);
  const updateButton = useRef<HTMLButtonElement>(null);
  useLayoutEffect(() => {
    const element = updateButton.current;
    if (!element || status !== "changed" || disabled || busy || !page || !availableSource(page)) return;
    const original = sourceRef(page);
    return registerScopedControl(element, "update-browser-source", source.pageId, () => {
      const current = useStore.getState().pages.find(item => item.pageId === original.pageId);
      if (!current || !availableSource(current) || sourceStatus(original, [current]) !== "current") throw new Error("This browser tab changed. Choose its current source again.");
      return onRefresh(source.pageId);
    });
  }, [status, disabled, busy, page, source, onRefresh]);
  return <span className={status === "current" ? "" : "stale"}>
    {shellIconGlobe}<span title={source.url}>{source.pageId === primaryPageId ? `Captured source · ${label}` : label}</span>
    {status !== "current" && <small>{status === "changed" ? "Changed" : "Closed"}</small>}
    {status === "changed" && <button ref={updateButton} type="button" data-command-id="update-browser-source" disabled={disabled || busy || !!page?.loading} aria-label={`Use current ${label}`} title={withShortcut("Use this tab's current page", updateShortcut)} onClick={event => { void executeCommand("update-browser-source", { payload: { pageId: source.pageId }, nativeInputEvent: event.nativeEvent }).catch(errToast); }}>{shellIconReload}</button>}
    <button ref={removeButton} type="button" data-command-id="remove-browser-source" title={withShortcut("Remove selected browser source", removeShortcut)} disabled={disabled || busy} aria-label={`Remove ${label}`} onClick={event => { void executeCommand("remove-browser-source", { payload: { pageId: source.pageId }, nativeInputEvent: event.nativeEvent }).catch(errToast); }}>{shellIconClose}</button>
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
  const sourceScope = JSON.stringify(sources);
  const inputScope = JSON.stringify([disabled, primary, linkedPageId, sourceScope]);
  const [busy, setBusy] = useState<{ scope: string; pageId: string | null }>({ scope: inputScope, pageId: null });
  const busyPageId = busy.scope === inputScope ? busy.pageId : null;
  if (busy.scope !== inputScope) setBusy({ scope: inputScope, pageId: null });
  const request = useRef({ active: false, pending: false });
  useLayoutEffect(() => {
    const scope = { active: true, pending: false };
    request.current = scope;
    return () => { scope.active = false; };
  }, [disabled, primary, linkedPageId, sourceScope]);
  const primaryPage = useStore(state => conversationPage(state.pages, primary, activePageId, linkedPageId));
  const additionalSources = sources.filter(source => source.pageId !== primaryPage?.pageId);
  const matchingIds = useStore(useShallow(state => state.pages.filter(page => availableSource(page, primaryPage?.pageId)
    && `${page.title} ${page.url}`.toLowerCase().includes(query.toLowerCase())).map(page => page.pageId)));
  const splitCompanionId = primaryPage && splitPageId
    ? primaryPage.pageId === splitPageId ? activePageId : splitPageId
    : null;
  const splitCompanion = useStore(state => state.pages.find(page => page.pageId === splitCompanionId && availableSource(page, primaryPage?.pageId)));
  const liveSource = async (pageId: string, scope: { active: boolean }, expected?: PageContextRef) => {
    const pending = await call("browser.recovery.list", {});
    if (!scope.active) return null;
    const original = useStore.getState().pages.find(page => page.pageId === pageId);
    if (expected && (!original || sourceStatus(expected, [original]) !== "current"))
      throw new Error("This browser tab changed while updating. Choose its current source again.");
    let admitted = expected;
    const recoveries = pending.filter(tab => tab.pageId === pageId);
    if (recoveries.length > 1) throw new Error("This browser tab’s recovery is ambiguous.");
    if (recoveries.length === 1) {
      const recovery = recoveries[0]!;
      if (!original || recovery.windowId !== original.windowId) throw new Error("This browser tab’s recovery owner changed.");
      const restored = await call("browser.recovery.retry", { pageId });
      if (!scope.active) return null;
      if (!restored.ok || typeof restored.restored !== "boolean" || restored.pageId !== pageId || restored.page.pageId !== pageId
        || restored.page.windowId !== recovery.windowId || restored.page.backend !== "aux" || !availableSource(restored.page))
        throw new Error("This browser tab’s recovery was not confirmed.");
      if (restored.restored) admitted = sourceRef(restored.page);
      else if (!expected || sourceStatus(expected, [restored.page]) !== "current")
        throw new Error("This browser tab was already changed outside this recovery. Choose its current source again.");
    }
    if (!scope.active) return null;
    const live = (await call("pages.list", {})).find(item => item.pageId === pageId);
    if (!scope.active) return null;
    if (!live || !availableSource(live) || live.windowId !== original?.windowId || live.backend !== original?.backend) throw new Error("This browser tab is unavailable.");
    if (admitted && sourceStatus(admitted, [live]) !== "current") throw new Error("This browser tab changed while updating. Choose its current source again.");
    return sourceRef(live);
  };
  const update = async (pageId: string, apply: (source: PageContextRef) => PageContextRef[], expected?: PageContextRef) => {
    const scope = request.current;
    if (disabled || !scope.active || scope.pending) return;
    scope.pending = true;
    setBusy({ scope: inputScope, pageId });
    try {
      const source = await liveSource(pageId, scope, expected);
      if (source && scope.active) onSources(apply(source));
    }
    catch (error) { if (scope.active) errToast(error); }
    finally {
      if (scope.active) { scope.pending = false; setBusy({ scope: inputScope, pageId: null }); }
    }
  };
  const toggle = (pageId: string) => {
    if (disabled || !request.current.active || request.current.pending) return;
    if (sources.some(source => source.pageId === pageId)) {
      onSources(sources.filter(source => source.pageId !== pageId));
      return;
    }
    if (additionalSources.length >= 8) { errToast(new Error("Choose up to eight additional tabs.")); return; }
    const page = useStore.getState().pages.find(page => page.pageId === pageId && availableSource(page, primaryPage?.pageId));
    if (page) return update(pageId, source => [...sources, source], sourceRef(page));
  };
  const refresh = (pageId: string) => {
    const page = useStore.getState().pages.find(item => item.pageId === pageId);
    if (page && availableConversationPage(page) && !page.loading)
      return update(pageId, latest => sources.map(source => source.pageId === pageId ? latest : source), sourceRef(page));
  };

  const splitButton = useRef<HTMLButtonElement>(null);
  const splitShortcut = useShortcutLabel("toggle-browser-source");
  useLayoutEffect(() => {
    const element = splitButton.current;
    if (!element || disabled || busyPageId || !splitCompanion) return;
    const original = sourceRef(splitCompanion);
    return registerScopedControl(element, "toggle-browser-source", original.pageId, () => {
      const state = useStore.getState();
      const current = state.pages.find(page => page.pageId === original.pageId);
      if (state.activePageId !== activePageId || state.splitPageId !== splitPageId || !current || !availableSource(current) || sourceStatus(original, [current]) !== "current")
        throw new Error("The split browser source changed. Choose its current tab again.");
      return toggle(original.pageId);
    });
  });

  return <div className="conversation-browser-context">
    <div className="conversation-browser-context-controls">
      <BrowserContextPicker value={primary} onChange={value => {
        onPrimary(value);
        const chosen = conversationPage(useStore.getState().pages, value, activePageId, linkedPageId);
        if (chosen && sources.some(source => source.pageId === chosen.pageId)) onSources(sources.filter(source => source.pageId !== chosen.pageId));
      }} linkedPageId={linkedPageId} disabled={disabled} />
      {splitCompanion && !sources.some(source => source.pageId === splitCompanion.pageId) &&
        <button ref={splitButton} type="button" data-command-id="toggle-browser-source" {...smallGhostButtonProps} disabled={disabled || !!busyPageId || additionalSources.length >= 8}
          title={withShortcut(`Include ${splitCompanion.title || hostOf(splitCompanion.url)} from the current split`, splitShortcut)}
          onClick={event => { void executeCommand("toggle-browser-source", { payload: { pageId: splitCompanion.pageId }, nativeInputEvent: event.nativeEvent }).catch(errToast); }}>Add split tab</button>}
      <Popover label="Add browser tabs" disabled={disabled} trigger={<span>{busyPageId ? "Loading tab…" : `Add tabs${additionalSources.length ? ` · ${additionalSources.length}` : ""}`}</span>}>
        {() => <><input type="search" aria-label="Search browser context" placeholder="Find a tab…" value={query} onChange={event => setQuery(event.target.value)}/>
          <div role="group" aria-label="Additional browser tabs">{matchingIds.map(pageId => {
            const selected = sources.some(source => source.pageId === pageId);
            return <AdditionalTabChoice key={pageId} pageId={pageId} selected={selected} disabled={disabled || !!busyPageId || (additionalSources.length >= 8 && !selected)} onToggle={toggle} />;
          })}{!matchingIds.length && <p {...staticHintProps}>No matching available tabs.</p>}</div></>}
      </Popover>
    </div>
    {sources.length > 0 && <div role="group" className="conversation-browser-sources" aria-label="Selected browser tabs">
      {sources.map(source => <SourceChip key={source.pageId} source={source} primaryPageId={primaryPage?.pageId} disabled={disabled} busy={!!busyPageId}
        onRefresh={refresh} onRemove={id => { onSources(sources.filter(item => item.pageId !== id)); if (id === primaryPage?.pageId) onPrimary("none"); }} />)}
    </div>}
  </div>;
}
