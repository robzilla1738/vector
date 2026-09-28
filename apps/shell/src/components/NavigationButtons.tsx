import { isHomeAddress } from "../chrome";
import type {PageTarget} from "@aux/contracts";
import {bridge,inNativeHost} from "../bridge";
import {errToast,tabCommand} from "../store";
import {I} from "./icons";
import {useShortcutLabels,withShortcut} from "../use-shortcut-label";

/** Shared browser navigation for expanded, collapsed and horizontal chrome. */
export function NavigationButtons({page,settingsRoute=false}:{page?:PageTarget;settingsRoute?:boolean}){
  const key=useShortcutLabels();
  const history=(direction:"back"|"forward")=>{
    if(!settingsRoute&&page&&inNativeHost)void bridge.navigationMenu(page.pageId,direction).catch(errToast);
  };
  return <>
    <button className="icon-btn" title={withShortcut("Back",key("back"))+(inNativeHost&&!settingsRoute?" · Right-click for history":"")} onContextMenu={event=>{event.preventDefault();event.stopPropagation();history("back");}} onKeyDown={event=>{if(event.key==="ArrowDown"&&inNativeHost&&!settingsRoute){event.preventDefault();event.stopPropagation();history("back");}}} aria-label="Back" disabled={!settingsRoute&&!page?.canGoBack} onClick={()=>settingsRoute?window.history.back():page&&void tabCommand({kind:"back",pageId:page.pageId}).catch(errToast)}>{I.back}</button>
    <button className="icon-btn" title={withShortcut("Forward",key("forward"))+(inNativeHost&&!settingsRoute?" · Right-click for history":"")} onContextMenu={event=>{event.preventDefault();event.stopPropagation();history("forward");}} onKeyDown={event=>{if(event.key==="ArrowDown"&&inNativeHost&&!settingsRoute){event.preventDefault();event.stopPropagation();history("forward");}}} aria-label="Forward" disabled={!settingsRoute&&!page?.canGoForward} onClick={()=>settingsRoute?window.history.forward():page&&void tabCommand({kind:"forward",pageId:page.pageId}).catch(errToast)}>{I.fwd}</button>
    {page?.loading&&!settingsRoute
      ?<button className="icon-btn" title="Stop loading" aria-label="Stop loading" onClick={()=>void tabCommand({kind:"stop",pageId:page.pageId}).catch(errToast)}>{I.stop}</button>
      :<button className="icon-btn" title={withShortcut(settingsRoute?"Refresh settings":"Reload",key("reload"))+(settingsRoute?"":" · Shift-click to reload without cache")} aria-label="Reload" disabled={!settingsRoute&&(!page||(!page.showBlankDocument&&isHomeAddress(page.url)))} onClick={event=>{
        if(settingsRoute){window.dispatchEvent(new Event("aux-settings-refresh"));return;}
        if(!page)return;
        void (event.shiftKey?bridge.hardReload(page.pageId):tabCommand({kind:"reload",pageId:page.pageId})).catch(errToast);
      }}>{I.reload}</button>}
  </>;
}
