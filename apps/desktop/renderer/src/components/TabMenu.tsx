import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PageTarget } from "@aux/contracts";
import { bridge, inNativeHost } from "../bridge";
import { requestStageReport } from "../stage-obstruction";
import { call, errToast, tabCommand, toast, useStore } from "../store";
import { canSplitPage, groupedTabs, hostOf, isPinned, tabsInSpace } from "../workspace";
import { moveMenuFocus } from "../keyboard-list";
import { useMenuDismiss } from "../use-menu-dismiss";
import { positionContextMenu } from "../position-context-menu";
import { TabAudioButton } from "./TabAudioButton";
import { I } from "./icons";
import { useShortcutLabels } from "../use-shortcut-label";
import { useDismissable } from "../use-dismissable";

export function TabMenu({ page, selectedPages = [page], onSelectionDone, x, y, onClose: finishClose }: { page: PageTarget; selectedPages?: PageTarget[]; onSelectionDone?: () => void; x: number; y: number; onClose: () => void }) {
  const key = useShortcutLabels();
  const bulk = selectedPages.length > 1;
  const selectedIds = selectedPages.map(item => item.pageId);
  const layout = useStore(state => state.layout);
  const horizontal = useStore(state => state.settings.tabLayout === "horizontal");
  const closing = useStore(state => state.closingTabs);
  const pages = useStore(state => state.pages);
  const activePageId = useStore(state => state.activePageId);
  const splitPageId = useStore(state => state.splitPageId);
  const ref = useRef<HTMLDivElement>(null);
  const onClose = useMenuDismiss(ref, finishClose);
  const closeRef = useRef(onClose); closeRef.current = onClose;
  const [moving, setMoving] = useState(false);
  const [remembering, setRemembering] = useState(false);
  const [query, setQuery] = useState("");
  const moveButton = useRef<HTMLButtonElement>(null);
  const [windows, setWindows] = useState<Awaited<ReturnType<typeof bridge.windows>>>([]);
  useEffect(() => {
    if (!inNativeHost || bridge.privateMode) return;
    let live = true;
    void bridge.windows().then(windows => { if (live) setWindows(windows); }).catch(errToast);
    return () => { live = false; };
  }, []);
  const previous = useRef(document.activeElement as HTMLElement | null);
  const spaceId = layout.tabSpace[page.pageId] ?? layout.activeSpaceId;
  const space = layout.spaces.find(item => item.id === spaceId);
  const rememberable = !bulk && inNativeHost && !bridge.privateMode && page.backend === "aux"
    && !page.ownedByRuntime && page.pageId === activePageId && !!space?.workspaceId
    && page.url.startsWith("https://");
  const rawTabs = tabsInSpace(layout, pages, spaceId);
  const spaceTabs = horizontal ? groupedTabs(layout, rawTabs) : rawTabs;
  const pageIndex = spaceTabs.findIndex(item => item.pageId === page.pageId);
  const folders = layout.folders.filter(folder => folder.spaceId === spaceId);
  const currentFolder = layout.tabFolder[page.pageId];
  const hasFolder = selectedPages.some(item => !!layout.tabFolder[item.pageId]);
  const pinned = isPinned(layout, spaceId, page.url);
  const web = /^https?:/.test(page.url);
  const matches = (text: string) => text.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
  const otherFolders = folders.filter(folder => (bulk || folder.id !== currentFolder) && matches(folder.name));
  const otherSpaces = layout.spaces.filter(space => space.id !== spaceId && matches(space.name));
  const otherWindows = windows.filter(window => matches(window.title));
  const canMoveWindow = inNativeHost && !bridge.privateMode;
  const canMove = folders.some(folder => folder.id !== currentFolder) || hasFolder || layout.spaces.length > 1 || canMoveWindow;
  useEffect(() => {
    if (remembering) ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    else if (moving) ref.current?.querySelector<HTMLInputElement>("input")?.focus();
    else moveButton.current?.focus();
  }, [moving, remembering]);

  useLayoutEffect(() => {
    const menu = ref.current;
    if (!menu) return;
    positionContextMenu(menu, x, y);
    requestStageReport();
  }, [x, y, folders.length, layout.spaces.length, windows.length, moving, remembering, query]);

  useEffect(() => {
    const outside = (event: MouseEvent) => { if (!ref.current?.contains(event.target as Node)) closeRef.current(); };
    document.addEventListener("mousedown", outside);
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", outside);
      requestStageReport();
      if (previous.current?.isConnected) previous.current.focus();
    };
  }, []);
  useDismissable(true, () => closeRef.current());

  async function closeRelated(following: boolean) {
    const state = useStore.getState();
    const currentSpace = state.layout.tabSpace[page.pageId] ?? state.layout.activeSpaceId;
    const raw = tabsInSpace(state.layout, state.pages, currentSpace);
    const tabs = horizontal ? groupedTabs(state.layout, raw) : raw;
    const index = tabs.findIndex(item => item.pageId === page.pageId);
    if (index < 0) return;
    const targets = following ? tabs.slice(index + 1) : tabs.filter(item => item.pageId !== page.pageId);
    await state.closeTabs(targets.map(item => item.pageId));
  }

  async function moveWindow(windowId?: string) {
    if (bulk) { await useStore.getState().moveTabsToWindow(selectedIds, windowId); onSelectionDone?.(); }
    else await useStore.getState().moveTabToWindow(page.pageId, windowId);
  }

  function move(space: string, folder?: string | null) {
    if (bulk) { useStore.getState().moveTabs(selectedIds, space, folder); onSelectionDone?.(); }
    else if (folder !== undefined) useStore.getState().moveTabToFolder(page.pageId, folder);
    else useStore.getState().moveTabToSpace(page.pageId, space);
  }

  function action(work: () => unknown | Promise<unknown>) {
    onClose();
    void Promise.resolve().then(work).catch(errToast);
  }

  async function rememberPage() {
    const workspaceId = space?.workspaceId;
    if (!workspaceId) return;
    const bound = await bridge.bindTabSpace(page.pageId, spaceId);
    if (bound.workspaceId !== workspaceId) throw new Error("The selected Space changed. Open the tab menu and try again.");
    const origin = new URL(page.url).origin;
    const policy = await call("workspaces.contentMemory.policy", { workspaceId });
    if (!policy.enabled || !policy.allowedOrigins.includes(origin)) {
      await call("workspaces.contentMemory.setPolicy", { workspaceId, policy: {
        ...policy, enabled: true, allowedOrigins: [...new Set([...policy.allowedOrigins, origin])],
      } });
    }
    const saved = await call("workspaces.contentMemory.capture", {
      workspaceId, pageId: page.pageId, expectedDocumentEpoch: page.documentEpoch, expectedUrl: page.url,
    });
    toast(`Remembered “${saved.title}” in ${space?.name}`);
  }

  return <div ref={ref} className="menu ctx-menu tab-menu" role="menu" style={{ left: x, top: y }} onKeyDown={event => {
    if(event.key==="Tab"){event.preventDefault();onClose();return;}
    if (moving && (event.key === "Escape" || (event.key === "ArrowLeft" && !(event.target instanceof HTMLInputElement)))) { event.preventDefault(); event.stopPropagation(); setMoving(false); setQuery(""); return; }
    moveMenuFocus(event);
  }}>
    {remembering ? <>
      <div className="menu-label">Remember page content</div>
      <p className="menu-empty">Save readable article text from {hostOf(page.url)} in {space?.name}. This allows this site in the Space until you remove it in Space memory. Forms and private pages are excluded.</p>
      <button className="menu-item" role="menuitem" onClick={() => action(rememberPage)}>Remember this article</button>
      <button className="menu-item" role="menuitem" onClick={() => setRemembering(false)}>Cancel</button>
    </> : moving ? <>
      <button className="menu-item tab-menu-back" role="menuitem" onClick={() => { setMoving(false); setQuery(""); }}>{I.left}<span className="t">{bulk ? `Move ${selectedIds.length} tabs` : "Move tab"}</span></button>
      <input className="tab-menu-search" aria-label="Find a folder, Space or window" placeholder="Find a destination…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.key === "ArrowDown") { event.preventDefault(); ref.current?.querySelector<HTMLElement>('[data-destination]')?.focus(); }
        if (event.key === "Enter" && !event.nativeEvent.isComposing && query.trim()) {
          const destinations = ref.current?.querySelectorAll<HTMLButtonElement>('[data-destination]');
          if (destinations?.length === 1) { event.preventDefault(); destinations[0]?.click(); }
        }
      }} />
      {otherFolders.length > 0 && <div className="menu-label">Folders in this Space</div>}
      {otherFolders.map(folder => <button className="menu-item" role="menuitem" data-destination key={folder.id} onClick={() => action(() => move(spaceId, folder.id))}>{I.folderClosed}<span className="t">{folder.name}</span></button>)}
      {hasFolder && matches("Remove from folder") && <button className="menu-item" role="menuitem" data-destination onClick={() => action(() => move(spaceId, null))}>Remove from folder</button>}
      {otherSpaces.length > 0 && <div className="menu-label">Spaces</div>}
      {otherSpaces.map(space => <button className="menu-item" role="menuitem" data-destination key={space.id} data-space={space.color} onClick={() => action(() => move(space.id))}><span className="space-dot"/><span className="t">{space.name}</span></button>)}
      {canMoveWindow && <>
        <div className="menu-label">Windows</div>
        {matches("New window") && <button className="menu-item" role="menuitem" data-destination onClick={() => action(() => moveWindow())}>{I.plusSm}<span className="t">New window</span></button>}
        {otherWindows.map(window => <button key={window.id} className="menu-item" role="menuitem" data-destination title={window.title} onClick={() => action(() => moveWindow(window.id))}><span className="t">{window.title}</span><span className="muted">{window.tabCount} tabs</span></button>)}
      </>}
      {!otherFolders.length && !otherSpaces.length && !(hasFolder && matches("Remove from folder")) && !(canMoveWindow && (otherWindows.length || matches("New window"))) && <p className="menu-empty">No matching destinations</p>}
    </> : <>

    {bulk && <div className="menu-label">{selectedIds.length} tabs selected</div>}
    {!bulk && <>
    <button className="menu-item" role="menuitem" onClick={() => action(() => tabCommand({ kind: "reload", pageId: page.pageId }))}>{I.reloadSm}<span className="t">Reload</span>{key("reload") && <kbd>{key("reload")}</kbd>}</button>
    <TabAudioButton pageId={page.pageId} title={page.title || "New Tab"} menu onDone={onClose} />
    {web && <>
      <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().duplicateTab(page.pageId))}>{I.copy}<span className="t">Duplicate tab</span></button>
      <button className="menu-item" role="menuitem" onClick={() => action(async () => { await navigator.clipboard.writeText(page.url); toast("URL copied"); })}>{I.copy}<span className="t">Copy URL</span></button>
      <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().togglePin({ url: page.url, title: page.title || hostOf(page.url) }, spaceId))}>{I.pin}<span className="t">{pinned ? "Unpin" : "Pin to space"}</span></button>
    </>}
    {rememberable && <button className="menu-item" role="menuitem" onClick={() => setRemembering(true)}>{I.copy}<span className="t">Remember article in {space?.name}…</span></button>}
    {activePageId && activePageId !== page.pageId && spaceId === layout.activeSpaceId && (splitPageId === page.pageId || (canSplitPage(page) && canSplitPage(pages.find(item => item.pageId === activePageId)))) && <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().setSplitPage(splitPageId === page.pageId ? null : page.pageId))}>{I.split}<span className="t">{splitPageId === page.pageId ? "Close split view" : "Open beside current tab"}</span></button>}
    </>}
    {horizontal && <button className="menu-item" role="menuitem" onClick={() => action(() => { useStore.getState().moveTabs(selectedIds, spaceId, { name: "New group" }); onSelectionDone?.(); })}>{I.folderClosed}<span className="t">New tab group</span></button>}
    {canMove && <button ref={moveButton} className="menu-item" role="menuitem" aria-haspopup="menu" onClick={() => setMoving(true)} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); setMoving(true); } }}>{I.folder}<span className="t">{bulk ? "Move selected tabs…" : "Move tab…"}</span>{I.right}</button>}
    <button className="menu-item" role="menuitem" onClick={() => action(() => call("settings.set", { tabLayout: horizontal ? "vertical" : "horizontal" }))}>{I.sidebarSm}<span className="t">{horizontal ? "Show Tabs Vertically" : "Show Tabs Horizontally"}</span></button>
    <div className="menu-sep" />
    {bulk ? <button className="menu-item" role="menuitem" onClick={() => action(async () => {
      if (await useStore.getState().closeTabs(selectedIds)) onSelectionDone?.();
    })}>{I.close}<span className="t">Close selected tabs</span></button> : <>
    <button className="menu-item" role="menuitem" onClick={() => action(() => useStore.getState().closeTab(page.pageId))}>{I.close}<span className="t">Close tab</span>{key("close-tab") && <kbd>{key("close-tab")}</kbd>}</button>
    <button className="menu-item" role="menuitem" disabled={closing || spaceTabs.length < 2} onClick={() => action(() => closeRelated(false))}>{I.close}<span className="t">Close other tabs</span></button>
    {horizontal && pageIndex >= 0 && pageIndex < spaceTabs.length - 1 && <button className="menu-item" role="menuitem" disabled={closing} onClick={() => action(() => closeRelated(true))}>{I.close}<span className="t">Close tabs to the right</span></button>}
    </>}
    </>}
  </div>;
}
