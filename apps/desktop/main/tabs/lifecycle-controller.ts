import { browserHealth, offscreen } from "../app/services.js";
import { liveDownloads } from "../downloads/controller.js";
import { destroyPageView } from "../native-views.js";
import { FROZEN_DISCARD_MS, IDLE_FREEZE_MS, canDiscard, canFreeze, createPausedAgentTracker } from "../page-lifecycle.js";
import { captureScrollPosition, hasPageWork } from "../page-suspension.js";
import { sitePermissions } from "../privacy/state.js";
import type { ViewEntry } from "../target-registry.js";
import { stateForEntry } from "../windows/registry.js";
import { rememberClosedHistory, rememberScroll } from "./materialize.js";
import { noteTab } from "./publish.js";

export const idleFreezeTimers=new Map<string,NodeJS.Timeout>();
export const idleDiscardTimers=new Map<string,NodeJS.Timeout>();
export const frozenPages=new Set<string>();
export const desiredFrozenPages=new Set<string>();
/** Views being discarded — onDestroyed keeps the catalog record, the tab
 *  becomes a discarded placeholder rather than a removal. */
export const discarding=new Set<string>();

export const pausedAgent=createPausedAgentTracker();
export const lifecycleOperations=new Map<string,Promise<void>>();
export function setPageFrozen(entry:ViewEntry,frozen:boolean){
  if(entry.popup||entry.view.webContents.isDestroyed())return Promise.resolve();
  if(frozen)desiredFrozenPages.add(entry.pageId);else desiredFrozenPages.delete(entry.pageId);
  const previous=lifecycleOperations.get(entry.pageId)??Promise.resolve();
  const operation=previous.catch(()=>{}).then(async()=>{
    const shouldFreeze=desiredFrozenPages.has(entry.pageId);if(entry.view.webContents.isDestroyed()||frozenPages.has(entry.pageId)===shouldFreeze)return;
    if (shouldFreeze) {
      const busy = await hasPageWork(entry.view.webContents);
      const state = stateForEntry(entry);
      const wc = entry.view.webContents;
      let mediaAllowed = false;
      try { mediaAllowed = Object.entries(sitePermissions[new URL(wc.getURL()).origin] ?? {}).some(([permission, decision]) => permission.startsWith("media:") && decision === "allow"); } catch { /* no website origin */ }
      if (!canFreeze({
        popup: !!entry.popup, runtimeOwned: !!entry.runtimeOwned, agentPaused: pausedAgent.isPaused(entry.pageId),
        focused: state?.focusedPageId === entry.pageId, split: state?.splitPageId === entry.pageId,
        offscreenHold: offscreen.holds(entry.pageId),
        downloading: [...liveDownloads.values()].some(download => download.snapshot().pageId === entry.pageId),
        mediaAllowed, busy, audible: wc.isCurrentlyAudible(), loading: wc.isLoading(), captured: wc.isBeingCaptured(), destroyed: wc.isDestroyed(),
      }) || !desiredFrozenPages.has(entry.pageId)) {
        desiredFrozenPages.delete(entry.pageId);
        if (state && state.focusedPageId !== entry.pageId && state.splitPageId !== entry.pageId) scheduleIdleFreeze(entry);
        return;
      }
    }
    try{await entry.view.webContents.debugger.sendCommand('Page.setWebLifecycleState',{state:shouldFreeze?'frozen':'active'});if(shouldFreeze){frozenPages.add(entry.pageId);scheduleIdleDiscard(entry);}else frozenPages.delete(entry.pageId);noteTab(entry.pageId,{lifecycle:shouldFreeze?"frozen":"live"});}catch{browserHealth.noteSuspensionFailure();desiredFrozenPages.delete(entry.pageId);frozenPages.delete(entry.pageId);}
  }).finally(()=>{if(lifecycleOperations.get(entry.pageId)===operation)lifecycleOperations.delete(entry.pageId);});
  lifecycleOperations.set(entry.pageId,operation);
  return operation;
}
export function wakePage(entry?:ViewEntry){if(!entry)return Promise.resolve();const timer=idleFreezeTimers.get(entry.pageId);if(timer)clearTimeout(timer);idleFreezeTimers.delete(entry.pageId);const discard=idleDiscardTimers.get(entry.pageId);if(discard)clearTimeout(discard);idleDiscardTimers.delete(entry.pageId);return setPageFrozen(entry,false);}
export function scheduleIdleFreeze(entry:ViewEntry){
  if(entry.popup||offscreen.holds(entry.pageId)||entry.view.webContents.isDestroyed()||frozenPages.has(entry.pageId)||idleFreezeTimers.has(entry.pageId))return;
  if(entry.runtimeOwned&&!pausedAgent.isPaused(entry.pageId))return;
  const timer=setTimeout(()=>{idleFreezeTimers.delete(entry.pageId);const state=stateForEntry(entry),wc=entry.view.webContents;if(!state||wc.isDestroyed())return;if(entry.runtimeOwned&&!pausedAgent.isPaused(entry.pageId))return;if(state.focusedPageId===entry.pageId||state.splitPageId===entry.pageId||offscreen.holds(entry.pageId))return;if(wc.isCurrentlyAudible()||wc.isLoading()){scheduleIdleFreeze(entry);return;}void setPageFrozen(entry,true);},IDLE_FREEZE_MS);timer.unref();idleFreezeTimers.set(entry.pageId,timer);
}
/** Frozen this long without a wake → destroy the renderer; the catalog record
 *  stays so the tab reloads lazily on activation (BR-03 memory floor). */
export function scheduleIdleDiscard(entry:ViewEntry){
  if(entry.popup||entry.runtimeOwned||idleDiscardTimers.has(entry.pageId))return;
  const timer=setTimeout(()=>{
    idleDiscardTimers.delete(entry.pageId);
    // Serialize with any in-flight freeze for the same page.
    const previous=lifecycleOperations.get(entry.pageId)??Promise.resolve();
    const operation=previous.catch(()=>{}).then(()=>discardPageView(entry)).finally(()=>{if(lifecycleOperations.get(entry.pageId)===operation)lifecycleOperations.delete(entry.pageId);});
    lifecycleOperations.set(entry.pageId,operation);
  },FROZEN_DISCARD_MS);timer.unref();idleDiscardTimers.set(entry.pageId,timer);
}
export async function discardPageView(entry:ViewEntry){
  const pageId=entry.pageId;
  const state=stateForEntry(entry);
  const wc=entry.view.webContents;
  if(!frozenPages.has(pageId)||wc.isDestroyed())return;
  if(!canDiscard({popup:!!entry.popup,runtimeOwned:!!entry.runtimeOwned,agentPaused:pausedAgent.isPaused(pageId),focused:state?.focusedPageId===pageId,split:state?.splitPageId===pageId,offscreenHold:offscreen.holds(pageId),downloading:[...liveDownloads.values()].some(download=>download.snapshot().pageId===pageId),destroyed:wc.isDestroyed()}))return;
  if(!state)return;
  rememberScroll(entry,await captureScrollPosition(wc));
  rememberClosedHistory(entry);
  discarding.add(pageId);
  try{await destroyPageView(entry,state.win);}finally{discarding.delete(pageId);}
}
export function forgetPageLifecycle(pageId:string){const timer=idleFreezeTimers.get(pageId);if(timer)clearTimeout(timer);idleFreezeTimers.delete(pageId);const discard=idleDiscardTimers.get(pageId);if(discard)clearTimeout(discard);idleDiscardTimers.delete(pageId);desiredFrozenPages.delete(pageId);frozenPages.delete(pageId);lifecycleOperations.delete(pageId);pausedAgent.forget(pageId);}

/** Wake only a page that is frozen or on its way to freezing. */
export const wakeIfIdle = (entry: ViewEntry) => {
  if (frozenPages.has(entry.pageId) || desiredFrozenPages.has(entry.pageId) || idleFreezeTimers.has(entry.pageId) || idleDiscardTimers.has(entry.pageId)) void wakePage(entry);
};
