import type {PageTarget} from "@aux/contracts";
import {bridge,inNativeHost} from "../bridge";
import {errToast,tabCommand} from "../store";
import {I} from "./icons";
import {useShortcutLabels,withShortcut} from "../use-shortcut-label";

/** Shared browser navigation for expanded, collapsed and horizontal chrome. */
export function NavigationButtons({page}:{page?:PageTarget}){
  const key=useShortcutLabels();
  const history=(direction:"back"|"forward")=>{
    if(page&&inNativeHost)void bridge.navigationMenu(page.pageId,direction).catch(errToast);
  };
  return <>
    <button className="icon-btn" title={withShortcut("Back",key("back"))+(inNativeHost?" · Right-click for history":"")} onContextMenu={event=>{event.preventDefault();history("back");}} onKeyDown={event=>{if(event.key==="ArrowDown"&&inNativeHost){event.preventDefault();event.stopPropagation();history("back");}}} aria-label="Back" disabled={!page?.canGoBack} onClick={()=>page&&void tabCommand({kind:"back",pageId:page.pageId}).catch(errToast)}>{I.back}</button>
    <button className="icon-btn" title={withShortcut("Forward",key("forward"))+(inNativeHost?" · Right-click for history":"")} onContextMenu={event=>{event.preventDefault();history("forward");}} onKeyDown={event=>{if(event.key==="ArrowDown"&&inNativeHost){event.preventDefault();event.stopPropagation();history("forward");}}} aria-label="Forward" disabled={!page?.canGoForward} onClick={()=>page&&void tabCommand({kind:"forward",pageId:page.pageId}).catch(errToast)}>{I.fwd}</button>
    {page?.loading
      ?<button className="icon-btn" title="Stop loading" aria-label="Stop loading" onClick={()=>void tabCommand({kind:"stop",pageId:page.pageId}).catch(errToast)}>{I.stop}</button>
      :<button className="icon-btn" title={`${withShortcut("Reload",key("reload"))} · Shift-click to reload without cache`} aria-label="Reload" disabled={!page||(!page.showBlankDocument&&(!page.url||page.url==="about:blank"))} onClick={event=>{
        if(!page)return;
        void (event.shiftKey?bridge.hardReload(page.pageId):tabCommand({kind:"reload",pageId:page.pageId})).catch(errToast);
      }}>{I.reload}</button>}
  </>;
}
