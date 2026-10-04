import { staticMenuItemProps } from "../ui/class-props";
import { errorMessage } from "../error-message";
import { executeCommand } from "../commands";
import { runCommand } from "../commands";
import { useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import type { PageTarget, TabNameSuggestion } from "@aux/contracts";
import { memorySensitivityReason } from "@aux/contracts/memory-sensitivity";
import { normalizeTabName } from "@aux/contracts/tab-name-rule";
import { bridge, inNativeHost } from "../bridge";
import { call, errToast, tabCommand, toast, useStore } from "../store";
import { canSplitPage, groupedTabs, hostOf, isPinned, tabLabel, tabsInSpace } from "../workspace";
import { Menu } from "../ui";
import { TabAudioButton } from "./TabAudioButton";
import { shellIconAgentSm, shellIconClose, shellIconCopy, shellIconFolder, shellIconFolderClosed, shellIconLeft, shellIconPause, shellIconPin, shellIconPlusSm, shellIconReloadSm, shellIconRight, shellIconSidebarSm, shellIconSplit } from "./icons";
import { useShortcutLabels } from "../use-shortcut-label";
import { useFeature } from "../use-feature";

export function TabMenu({ page, selectedPages = [page], onSelectionDone, x, y, onClose: finishClose }: { page: PageTarget; selectedPages?: PageTarget[]; onSelectionDone?: () => void; x: number; y: number; onClose: () => void }) {
  const key = useShortcutLabels();
  const recordEnabled = useFeature("demonstrationSkills") && !bridge.privateMode;
  const lifecycleEnabled = useFeature("tabLifecycle");
  const aiNamingEnabled = useFeature("aiTabNaming") && !bridge.privateMode;
  const bulk = selectedPages.length > 1;
  const selectedIds = selectedPages.map(item => item.pageId);
  const layout = useStore(state => state.layout);
  const horizontal = useStore(state => state.settings.tabLayout === "horizontal");
  const closing = useStore(state => state.closingTabs);
  const activePageId = useStore(state => state.activePageId);
  const splitPageId = useStore(state => state.splitPageId);
  const activePage = useStore(state => state.pages.find(item => item.pageId === activePageId));
  const tabSound = useStore(state => state.tabAudio[page.pageId]);
  const ref = useRef<HTMLDialogElement>(null);
  const [moving, setMoving] = useState(false);
  const [remembering, setRemembering] = useState(false);
  const [naming, setNaming] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [nameBusy, setNameBusy] = useState(false);
  const [nameError, setNameError] = useState("");
  const [suggestion, setSuggestion] = useState<TabNameSuggestion | null>(null);
  const nameRequest = useRef(0);
  const nameInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const moveButton = useRef<HTMLButtonElement>(null);
  const rememberButton = useRef<HTMLButtonElement>(null);
  const moveSearch = useRef<HTMLInputElement>(null);
  const firstDestination = useRef<HTMLButtonElement>(null);
  const [windows, setWindows] = useState<Awaited<ReturnType<typeof bridge.windows>>>([]);
  const mountedFocus = useRef(false);
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
    && page.url.startsWith("https://") && !memorySensitivityReason(page.url, page.title);
  const spaceTabIds = useStore(useShallow(state => {
    const raw = tabsInSpace(layout, state.pages, spaceId);
    return (horizontal ? groupedTabs(layout, raw) : raw).map(item => item.pageId);
  }));
  const pageIndex = spaceTabIds.indexOf(page.pageId);
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
  const firstDestinationKey = otherFolders[0] ? `folder:${otherFolders[0].id}`
    : hasFolder && matches("Remove from folder") ? "remove"
    : otherSpaces[0] ? `space:${otherSpaces[0].id}`
    : canMoveWindow && matches("New window") ? "new-window"
    : otherWindows[0] ? `window:${otherWindows[0].id}` : "";
  useEffect(() => {
    if (!mountedFocus.current) { mountedFocus.current = true; return; }
    if (naming) nameInput.current?.focus();
    else if (remembering) rememberButton.current?.focus();
    else if (moving) moveSearch.current?.focus();
    else moveButton.current?.focus();
  }, [moving, remembering, naming]);

  useEffect(() => () => { nameRequest.current++; }, []);

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
    finishClose();
    void Promise.resolve().then(work).catch(errToast);
  }

  function openNaming() {
    const saved = layout.tabNames?.[page.pageId];
    setNameDraft(saved?.url === page.url ? saved.title : "");
    setSuggestion(null);
    setNameError("");
    setNaming(true);
  }

  function closeNaming() {
    nameRequest.current++;
    setNameBusy(false);
    setNaming(false);
  }

  function saveName() {
    const name = nameDraft;
    const source = suggestion;
    action(() => {
      if (source) {
        const current = useStore.getState().pages.find(item => item.pageId === page.pageId);
        if (!current || current.title !== source.sourceTitle || current.documentEpoch !== source.documentEpoch)
          throw new Error("The page changed. Review its title before applying the suggestion.");
      }
      useStore.getState().setTabName(page.pageId, page.url, name);
      toast("Tab label saved");
    });
  }

  async function suggestName() {
    const request = ++nameRequest.current;
    setNameBusy(true); setNameError(""); setSuggestion(null);
    try {
      const result = await call("agent.tabName.suggest", {
        pageId: page.pageId, expectedUrl: page.url, expectedDocumentEpoch: page.documentEpoch,
      });
      if (request !== nameRequest.current) return;
      const current = useStore.getState().pages.find(item => item.pageId === page.pageId);
      if (!current || current.url !== result.sourceUrl || current.title !== result.sourceTitle
        || current.documentEpoch !== result.documentEpoch) throw new Error("The page changed while Aux suggested a name. Try again.");
      setSuggestion(result);
      setNameDraft(result.name);
    } catch (error) {
      if (request === nameRequest.current) setNameError(errorMessage(error));
    } finally {
      if (request === nameRequest.current) setNameBusy(false);
    }
  }

  async function rememberPage() {
    const workspaceId = space?.workspaceId;
    if (!workspaceId) return;
    if (memorySensitivityReason(page.url, page.title)) throw new Error("This sensitive page cannot be saved to Memory.");
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

  return <Menu menuRef={ref} className="menu ctx-menu tab-menu" label="Tab actions" point={{ x, y }} onClose={finishClose} returnFocus={previous} onMenuKeyDown={event => {
    if (naming && event.key === "Escape") { event.preventDefault(); event.stopPropagation(); closeNaming(); return; }
    if (moving && (event.key === "Escape" || (event.key === "ArrowLeft" && !(event.target instanceof HTMLInputElement)))) { event.preventDefault(); event.stopPropagation(); setMoving(false); setQuery(""); return; }
  }}>
    {naming ? <>
      <button className="menu-item tab-menu-back" role="menuitem" onClick={closeNaming}>{shellIconLeft}<span className="t">Back to tab actions</span></button>
      <div className="menu-label">Name this tab</div>
      <p className="menu-empty">Use a short label in your tab strip. The page title stays unchanged.</p>
      <input ref={nameInput} className="tab-menu-search" aria-label="Tab label" maxLength={60} value={nameDraft} disabled={nameBusy}
        placeholder={tabLabel(layout, page)} onChange={event => { setNameDraft(event.target.value); setSuggestion(null); }}
        onKeyDown={event => { if (event.key === "Enter" && normalizeTabName(nameDraft) && !nameBusy) {
          event.preventDefault(); saveName();
        } }} />
      {aiNamingEnabled && <p className="menu-empty">AI sees this page title and site domain. Review its suggestion before saving.</p>}
      {nameError && <p className="menu-empty" role="alert">{nameError}</p>}
      {suggestion && <p className="menu-empty">Suggested from “{suggestion.sourceTitle}” · {hostOf(suggestion.sourceUrl)}</p>}
      {aiNamingEnabled && <button {...staticMenuItemProps} role="menuitem" disabled={nameBusy} onClick={() => void suggestName()}>{shellIconAgentSm}<span className="t">{nameBusy ? "Suggesting…" : "Suggest with AI"}</span></button>}
      <button {...staticMenuItemProps} role="menuitem" disabled={nameBusy || !normalizeTabName(nameDraft)} onClick={saveName}>Save tab label</button>
      {layout.tabNames?.[page.pageId]?.url === page.url && <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => useStore.getState().setTabName(page.pageId, page.url, null))}>Use page title again</button>}
    </> : remembering ? <>
      <div className="menu-label">Remember page content</div>
      <p className="menu-empty">Save readable article text from {hostOf(page.url)} in {space?.name}. This allows this site in the Space until you remove it in Space memory. Aux checks the captured text for financial, health, login and identity details before saving it. Forms and private pages are excluded.</p>
      <button ref={rememberButton} {...staticMenuItemProps} role="menuitem" onClick={() => action(rememberPage)}>Remember this article</button>
      <button {...staticMenuItemProps} role="menuitem" onClick={() => setRemembering(false)}>Cancel</button>
    </> : moving ? <>
      <button className="menu-item tab-menu-back" role="menuitem" onClick={() => { setMoving(false); setQuery(""); }}>{shellIconLeft}<span className="t">{bulk ? `Move ${selectedIds.length} tabs` : "Move tab"}</span></button>
      <input ref={moveSearch} className="tab-menu-search" aria-label="Find a folder, Space or window" placeholder="Find a destination…" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => {
        if (event.key === "ArrowDown") { event.preventDefault(); firstDestination.current?.focus(); }
        if (event.key === "Enter" && !event.nativeEvent.isComposing && query.trim()) {
          const destinations = ref.current?.querySelectorAll<HTMLButtonElement>('[data-destination]');
          if (destinations?.length === 1) { event.preventDefault(); destinations[0]?.click(); }
        }
      }} />
      {otherFolders.length > 0 && <div className="menu-label">Folders in this Space</div>}
      {otherFolders.map(folder => <button ref={firstDestinationKey === `folder:${folder.id}` ? firstDestination : undefined} className="menu-item" role="menuitem" data-destination key={folder.id} onClick={() => action(() => move(spaceId, folder.id))}>{shellIconFolderClosed}<span className="t">{folder.name}</span></button>)}
      {hasFolder && matches("Remove from folder") && <button ref={firstDestinationKey === "remove" ? firstDestination : undefined} {...staticMenuItemProps} role="menuitem" data-destination onClick={() => action(() => move(spaceId, null))}>Remove from folder</button>}
      {otherSpaces.length > 0 && <div className="menu-label">Spaces</div>}
      {otherSpaces.map(space => <button ref={firstDestinationKey === `space:${space.id}` ? firstDestination : undefined} className="menu-item" role="menuitem" data-destination key={space.id} data-space={space.color} onClick={() => action(() => move(space.id))}><span className="space-dot"/><span className="t">{space.name}</span></button>)}
      {canMoveWindow && <>
        <div className="menu-label">Windows</div>
        {matches("New window") && <button ref={firstDestinationKey === "new-window" ? firstDestination : undefined} {...staticMenuItemProps} role="menuitem" data-destination onClick={() => action(() => moveWindow())}>{shellIconPlusSm}<span className="t">New window</span></button>}
        {otherWindows.map(window => <button key={window.id} ref={firstDestinationKey === `window:${window.id}` ? firstDestination : undefined} {...staticMenuItemProps} role="menuitem" data-destination title={window.title} onClick={() => action(() => moveWindow(window.id))}><span className="t">{window.title}</span><span className="muted">{window.tabCount} tabs</span></button>)}
      </>}
      {!otherFolders.length && !otherSpaces.length && !(hasFolder && matches("Remove from folder")) && !(canMoveWindow && (otherWindows.length || matches("New window"))) && <p className="menu-empty">No matching destinations</p>}
    </> : <>

    {bulk && <div className="menu-label">{selectedIds.length} tabs selected</div>}
    {!bulk && <>
    <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => tabCommand({ kind: "reload", pageId: page.pageId }))}>{shellIconReloadSm}<span className="t">Reload</span>{key("reload") && <kbd>{key("reload")}</kbd>}</button>
    {recordEnabled && web && !page.ownedByRuntime && <button {...staticMenuItemProps} role="menuitem" disabled={page.controller === "agent" || page.controller === "external"} data-command-id="record-demonstration" onClick={() => action(() => executeCommand("record-demonstration", { payload: { pageId: page.pageId } }))}>Record a demonstration</button>}
    <TabAudioButton pageId={page.pageId} title={tabLabel(layout, page)} menu onDone={finishClose} />
    {lifecycleEnabled && inNativeHost && !bridge.privateMode && web && page.pageId !== activePageId && !page.ownedByRuntime && page.lifecycle !== "discarded" &&
      <button {...staticMenuItemProps} role="menuitem" disabled={!!tabSound?.audible || page.controller === "agent" || page.controller === "external"}
        title="Sleep a clean background tab. It reloads when opened. Unsaved work and audio stay awake."
        onClick={() => action(async () => {
          const result = await bridge.tabSleep(page.pageId, page.url);
          if (!result.slept) throw new Error(result.reason ?? "Chromium kept this tab awake.");
          toast("Tab sleeping. It will reload when you open it.");
        })}>{shellIconPause}<span className="t">Sleep tab</span></button>}
    {web && <>
      <button {...staticMenuItemProps} role="menuitem" onClick={openNaming}>{shellIconAgentSm}<span className="t">Name tab…</span></button>
      <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => useStore.getState().duplicateTab(page.pageId))}>{shellIconCopy}<span className="t">Duplicate tab</span></button>
      <button {...staticMenuItemProps} role="menuitem" onClick={() => action(async () => { await navigator.clipboard.writeText(page.url); toast("URL copied"); })}>{shellIconCopy}<span className="t">Copy URL</span></button>
      <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => useStore.getState().togglePin({ url: page.url, title: page.title || hostOf(page.url) }, spaceId))}>{shellIconPin}<span className="t">{pinned ? "Unpin" : "Pin to space"}</span></button>
    </>}
    {rememberable && <button {...staticMenuItemProps} role="menuitem" onClick={() => setRemembering(true)}>{shellIconCopy}<span className="t">Remember article in {space?.name}…</span></button>}
    {activePageId && activePageId !== page.pageId && spaceId === layout.activeSpaceId && (splitPageId === page.pageId || (canSplitPage(page) && canSplitPage(activePage))) && <button {...staticMenuItemProps} role="menuitem" data-command-id={splitPageId === page.pageId ? "split-separate" : "split-add"} onClick={() => action(() => runCommand(splitPageId === page.pageId ? "split-separate" : "split-add", { payload: { pageId: page.pageId } }))}>{shellIconSplit}<span className="t">{splitPageId === page.pageId ? "Close split view" : "Open beside current tab"}</span></button>}
    </>}
    {horizontal && <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => { useStore.getState().moveTabs(selectedIds, spaceId, { name: "New group" }); onSelectionDone?.(); })}>{shellIconFolderClosed}<span className="t">New tab group</span></button>}
    {canMove && <button ref={moveButton} {...staticMenuItemProps} role="menuitem" aria-haspopup="menu" onClick={() => setMoving(true)} onKeyDown={event => { if (event.key === "ArrowRight") { event.preventDefault(); setMoving(true); } }}>{shellIconFolder}<span className="t">{bulk ? "Move selected tabs…" : "Move tab…"}</span>{shellIconRight}</button>}
    <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => call("settings.set", { tabLayout: horizontal ? "vertical" : "horizontal" }))}>{shellIconSidebarSm}<span className="t">{horizontal ? "Show Tabs Vertically" : "Show Tabs Horizontally"}</span></button>
    <div className="menu-sep" />
    {bulk ? <button {...staticMenuItemProps} role="menuitem" onClick={() => action(async () => {
      if (await useStore.getState().closeTabs(selectedIds)) onSelectionDone?.();
    })}>{shellIconClose}<span className="t">Close selected tabs</span></button> : <>
    <button {...staticMenuItemProps} role="menuitem" onClick={() => action(() => useStore.getState().closeTab(page.pageId))}>{shellIconClose}<span className="t">Close tab</span>{key("close-tab") && <kbd>{key("close-tab")}</kbd>}</button>
    <button {...staticMenuItemProps} role="menuitem" disabled={closing || spaceTabIds.length < 2} onClick={() => action(() => closeRelated(false))}>{shellIconClose}<span className="t">Close other tabs</span></button>
    {horizontal && pageIndex >= 0 && pageIndex < spaceTabIds.length - 1 && <button {...staticMenuItemProps} role="menuitem" disabled={closing} onClick={() => action(() => closeRelated(true))}>{shellIconClose}<span className="t">Close tabs to the right</span></button>}
    </>}
    </>}
  </Menu>;
}
