import { acceleratorFor, shortcutById } from "@aux/contracts";
import { globalShortcut } from "electron";
import { randomUUID } from "node:crypto";
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { DATA_DIR, log } from "../app/bootstrap.js";
import { menuShortcuts } from "../app/menu.js";
import { createRegularWindow } from "../windows/create.js";
import { type RegularWindowState, regularWindows } from "../windows/registry.js";

export const QUICK_ASK_ACCELERATOR = "CommandOrControl+Shift+Space";
export const quickAskPreferences = join(DATA_DIR,"quick-ask.json");
export let quickAskShortcutEnabled = false, quickAskShortcutError = "", quickAskAccelerator = QUICK_ASK_ACCELERATOR;
try {
  const saved = JSON.parse(readFileSync(quickAskPreferences,"utf8")) as { enabled?: unknown; accelerator?: unknown };
  quickAskShortcutEnabled = saved.enabled === true;
  if (typeof saved.accelerator === "string" && saved.accelerator) quickAskAccelerator = saved.accelerator;
} catch {}
export function quickAskShortcutStatus() { return {enabled:quickAskShortcutEnabled,registered:globalShortcut.isRegistered(quickAskAccelerator),error:quickAskShortcutError}; }
export function registerQuickAsk(accelerator:string) { return globalShortcut.register(accelerator,()=>{void openQuickAsk().catch(error=>log("Quick Ask could not open",String(error)));}); }
export function persistQuickAsk() { const temp=`${quickAskPreferences}.tmp`;writeFileSync(temp,JSON.stringify({enabled:quickAskShortcutEnabled,accelerator:quickAskAccelerator}),{mode:0o600});renameSync(temp,quickAskPreferences); }
/** The registry's current quick-ask binding → the accelerator the global hook uses. */
export function retuneQuickAskShortcut() {
  const binding = shortcutById("quick-ask", menuShortcuts)?.bindings[0];
  const next = binding ? acceleratorFor(binding) : QUICK_ASK_ACCELERATOR;
  if (next === quickAskAccelerator) return;
  if (quickAskShortcutEnabled) {
    const previous = quickAskAccelerator;
    globalShortcut.unregister(previous);
    quickAskAccelerator = next;
    if (!registerQuickAsk(next)) {
      quickAskAccelerator = previous;
      registerQuickAsk(previous);
      quickAskShortcutError = "This shortcut is unavailable, possibly because another app is using it.";
      return;
    }
    quickAskShortcutError = "";
  }
  else quickAskAccelerator = next;
  try { persistQuickAsk(); } catch (error) { log("Quick Ask shortcut preference could not be saved", String(error)); }
}
export function configureQuickAskShortcut(enabled:boolean, persist=true) {
  const previouslyEnabled=quickAskShortcutEnabled, previouslyRegistered=globalShortcut.isRegistered(quickAskAccelerator);
  if(enabled && !previouslyRegistered) {
    if(!registerQuickAsk(quickAskAccelerator)) {
      quickAskShortcutError="This shortcut is unavailable, possibly because another app is using it.";
      throw new Error(quickAskShortcutError);
    }
  }
  if(!enabled)globalShortcut.unregister(quickAskAccelerator);
  quickAskShortcutEnabled=enabled;quickAskShortcutError="";
  if(persist)try{persistQuickAsk();}
  catch(error){
    quickAskShortcutEnabled=previouslyEnabled;
    if(!previouslyRegistered)globalShortcut.unregister(quickAskAccelerator);
    else if(!globalShortcut.isRegistered(quickAskAccelerator))registerQuickAsk(quickAskAccelerator);
    quickAskShortcutError="The shortcut preference could not be saved.";throw new Error(quickAskShortcutError,{cause:error});
  }
  return quickAskShortcutStatus();
}

export let openingQuickAsk: Promise<RegularWindowState> | null = null;
export async function openQuickAsk() {
  const existing = [...regularWindows.values()].find(state => state.quickAsk);
  if (existing) { existing.win.show(); existing.win.focus(); existing.shellView.webContents.focus(); return; }
  if (!openingQuickAsk) openingQuickAsk = createRegularWindow(`quick-${randomUUID()}`, true);
  try { const state = await openingQuickAsk; state.win.show(); state.win.focus(); state.shellView.webContents.focus(); }
  finally { openingQuickAsk = null; }
}
