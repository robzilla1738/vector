import { staticSmallIconButtonProps, staticMenuItemProps } from "../ui/class-props";
import { smallButtonProps } from "../ui/button-props";
import { lazy, Suspense, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useStore } from "../store";
import { useCommittedSurfaceWitness } from "../committed-surface-witness";
import { bridge } from "../bridge";
import { isHomeAddress } from "../chrome";
import { fromOrganizationLayout } from "../store/organization-layout";
import { Dialog, Menu } from "../ui";
import { shellIconCopy, shellIconDown, shellIconDownloadSm, shellIconLock } from "./icons";
import { runCommand } from "../commands";
import { ownPages } from "../tab-window-transfer";
import { CommandBar } from "./CommandBar";
import { littlePanel, observeLittlePanel } from "../features/little-window/ui";
import "./LittleWindow.css";
const PageSurface = lazy(() => import("./PageSurface").then(module => ({ default: module.PageSurface })));
const Downloads = lazy(() => import("./Downloads").then(module => ({ default: module.Downloads })));

export function LittleWindow() {
  const page = useStore(state => ownPages(state.pages).find(item => item.pageId === state.activePageId));
  const spaces = useStore(state => state.layout.spaces);
  const [spacesReady, setSpacesReady] = useState(false);
  const [spaceError, setSpaceError] = useState("");
  const spacesTrigger = useRef<HTMLButtonElement>(null);
  const downloadsTrigger = useRef<HTMLButtonElement>(null);
  const spacesMenu = useRef<HTMLDialogElement>(null);
  const firstSpace = useRef<HTMLButtonElement>(null);
  const panel = useSyncExternalStore(observeLittlePanel, littlePanel);
  useEffect(() => {
    let active = true;
    const refresh = () => { void bridge.organizationSnapshot().then(snapshot => {
      if (!active) return;
      if (!snapshot.layout) throw new Error("Spaces are still loading. Try again in a moment.");
      const layout = fromOrganizationLayout(snapshot.layout);
      useStore.setState(state => ({ layout: { ...state.layout, spaces: layout.spaces } }));
      setSpacesReady(true);
      setSpaceError("");
    }).catch(error => { if (active) setSpaceError(error instanceof Error ? error.message : "Spaces are unavailable. Try opening this page in Aux again."); }); };
    refresh();
    const off = bridge.onOrganizationChanged(refresh);
    return () => { active = false; off(); };
  }, []);
  const blank = !page || isHomeAddress(page.url);
  const pageSection = useRef<HTMLElement>(null);
  const committedSelection = JSON.stringify(blank ? [] : [[page!.pageId, page!.documentEpoch]]);
  useCommittedSurfaceWitness(pageSection, "stage", () => committedSelection);
  useEffect(() => {
    if (blank) requestAnimationFrame(() => useStore.getState().focusCommandBar("toolbar"));
  }, [page?.pageId, blank]);
  useEffect(() => {
    const menu = spacesMenu.current;
    if (panel !== "spaces" || !spacesReady || !menu) return;
    if (document.activeElement === menu || !menu.contains(document.activeElement)) firstSpace.current?.focus();
  }, [panel, spacesReady, spaces]);
  const host = page && /^https?:/.test(page.url) ? new URL(page.url).host : "New Little window";
  return <main className="little-window" aria-label="Little window">
    <header className="little-strip">
      <span className="little-host" title={page?.url}>{page?.url.startsWith("https:") && <span role="img" aria-label="Secure connection">{shellIconLock}</span>}{host}</span>
      <CommandBar compact />
      <button {...smallButtonProps} data-command-id="promote-tab" onClick={() => runCommand("promote-tab")}>Open in Aux</button>
      <button ref={spacesTrigger} {...staticSmallIconButtonProps} data-command-id="little-space-picker" aria-haspopup="menu" aria-label="Choose destination Space" aria-expanded={panel === "spaces"} onClick={() => runCommand("little-space-picker")}>{shellIconDown}</button>
      <button {...staticSmallIconButtonProps} data-command-id="copy-url" aria-label="Copy link" onClick={() => runCommand("copy-url")}>{shellIconCopy}</button>
      <button ref={downloadsTrigger} {...staticSmallIconButtonProps} data-command-id="little-downloads" aria-haspopup="dialog" aria-label="Downloads for this page" aria-expanded={panel === "downloads"} onClick={() => runCommand("little-downloads")}>{shellIconDownloadSm}</button>
    </header>
    {panel === "spaces" && <Menu className="little-spaces menu" label="Open in Aux Space" anchor={spacesTrigger} returnFocus={spacesTrigger} menuRef={spacesMenu} initialFocusRef={firstSpace} onClose={() => runCommand("little-space-picker")}>
      {spaceError && <p role="alert">{spaceError}</p>}
      {!spacesReady && !spaceError && <output>Loading Spaces…</output>}
      {spacesReady && spaces.map((space, index) => <button ref={index === 0 ? firstSpace : undefined} key={space.id} {...staticMenuItemProps} role="menuitem" data-command-id="promote-tab" onClick={() => { runCommand("little-space-picker"); runCommand("promote-tab", { payload: { spaceId: space.id } }); }}>{space.name}</button>)}
    </Menu>}
    {panel === "downloads" && <Dialog className="little-downloads popover" label="Downloads for this page" returnFocus={downloadsTrigger} onClose={() => runCommand("little-downloads")}><Suspense fallback={<output>Loading downloads…</output>}><Downloads tabUrl={page?.url ?? ""} onClose={() => runCommand("little-downloads")} /></Suspense></Dialog>}
    <section ref={pageSection} className="little-page" data-little-stage data-stage-dragging="false">
      {page && !isHomeAddress(page.url) ? <Suspense fallback={<output>Opening page…</output>}><PageSurface page={page} /></Suspense> : <div className="little-empty"><h1>Take a quick look</h1><p>Enter a link above. Open it in Aux when you want to keep it.</p></div>}
    </section>
  </main>;
}
