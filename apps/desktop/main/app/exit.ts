import { app, globalShortcut } from "electron";
import { cancelDictation } from "../dictation.js";
import { channel } from "../runtime/supervisor.js";
import { flushTabPatches } from "../tabs/publish.js";
import { browserStore } from "../tabs/store.js";
import { approveWindowUnload } from "../window-unload.js";
import { type RegularWindowState, focusedRegularWindow, regularWindows } from "../windows/registry.js";
import { PRIMARY_WINDOW_ID } from "./bootstrap.js";
import { preparePrivateWindows, privateChildRunning, privateChildren, signalPrivateControl } from "./private-windows.js";
import { browserHealth, projectCommands, registry } from "./services.js";

export let exitApproved = false;
export let exitPending = false;
export const closingRegularWindows = new Set<string>();

export async function requestRegularWindowClose(state: RegularWindowState) {
  if (closingRegularWindows.has(state.id) || !regularWindows.has(state.id)) return;
  closingRegularWindows.add(state.id);
  const entries = registry.all().filter(entry => (entry.windowId ?? PRIMARY_WINDOW_ID) === state.id);
  const contents = entries.map(entry => entry.view.webContents);
  let changed = false;
  const invalidate = () => { changed = true; };
  for (const contentsItem of contents) {
    contentsItem.on("did-start-navigation", invalidate);
    contentsItem.on("destroyed", invalidate);
  }
  try {
    if (!await approveWindowUnload(contents, () => !changed)) return;
    const latest = registry.all().filter(entry => (entry.windowId ?? PRIMARY_WINDOW_ID) === state.id);
    if (changed || latest.length !== entries.length || latest.some((entry, index) => entry !== entries[index])) return;
    state.closeApproved = true;
    state.win.close();
  } finally {
    for (const contentsItem of contents) {
      contentsItem.removeListener("did-start-navigation", invalidate);
      contentsItem.removeListener("destroyed", invalidate);
    }
    closingRegularWindows.delete(state.id);
  }
}

export async function requestExit(includePrivateWindows = false) {
  if (exitPending) return;
  exitPending = true;
  const entries = registry.all();
  const contents = entries.map(entry => entry.view.webContents);
  let changed = false;
  const invalidate = () => { changed = true; };
  for (const wc of contents) {
    wc.on('did-start-navigation', invalidate);
    wc.on('destroyed', invalidate);
  }
  try {
    if (!await approveWindowUnload(contents, () => !changed)) return;
    // A newly opened/removed page invalidates the exit agreement.
    const current = registry.all();
    if (changed || current.length !== entries.length || current.some((entry,index) => entry !== entries[index])) return;
    const coordinatingPrivate = includePrivateWindows && [...privateChildren.keys()].some(privateChildRunning);
    const priorFocused = focusedRegularWindow();
    if (coordinatingPrivate) for (const state of regularWindows.values()) state.win.hide();
    const privatePrepared = includePrivateWindows ? await preparePrivateWindows() : [];
    if (privatePrepared === null) {
      for (const state of regularWindows.values()) state.win.show();
      priorFocused?.win.focus();
      return;
    }
    const latest = registry.all();
    if (changed || latest.length !== entries.length || latest.some((entry,index) => entry !== entries[index])) {
      for (const child of privatePrepared) signalPrivateControl(child, "abort");
      for (const state of regularWindows.values()) state.win.show();
      priorFocused?.win.focus();
      return;
    }
    exitApproved = true;
    flushTabPatches();
    await Promise.race([browserStore.flush().catch(() => {}), new Promise(resolve => setTimeout(resolve, 1500))]);
    for (const child of privatePrepared) signalPrivateControl(child, "commit");
    try { channel?.notify("app.closing"); } catch { /* Runtime already gone. */ }
    app.quit();
  } finally {
    for (const wc of contents) {
      wc.removeListener('did-start-navigation', invalidate);
      wc.removeListener('destroyed', invalidate);
    }
    exitPending = false;
  }
}
export function installExitHandlers() {
  app.on('before-quit', event => {
    if (!exitApproved) { event.preventDefault(); void requestExit(true); }
  });
  app.on("window-all-closed", () => {
    app.quit();
  });
  app.on("will-quit", () => {
    globalShortcut.unregisterAll();
    browserHealth.stop();
    projectCommands.shutdown();
    cancelDictation();
    // the forked runtime gets SIGTERM via process tree teardown; make it explicit
    try {
      channel?.notify("app.quitting");
    } catch {
      /* already gone */
    }
  });
}
