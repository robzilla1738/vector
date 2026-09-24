import { app, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { log } from './bootstrap.js';

const CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000;
let configured = false;
let checking = false;
let manual = false;

/** Local unsigned packages have no feed; only a packaged signed lane can check. */
export function updatesAvailableForBuild() {
  return process.platform === 'darwin' && app.isPackaged && existsSync(join(process.resourcesPath, 'app-update.yml'));
}

function explain(title: string, message: string) {
  void dialog.showMessageBox({ type: 'info', title, message, buttons: ['OK'], noLink: true });
}

export async function checkForAuxUpdates(requestedByHuman = false) {
  if (!updatesAvailableForBuild()) {
    if (requestedByHuman) explain('Aux updates unavailable', 'This local build has no signed update feed.');
    return;
  }
  if (checking) {
    if (requestedByHuman) explain('Aux is checking', 'An update check is already in progress.');
    return;
  }
  manual = requestedByHuman;
  checking = true;
  try { await autoUpdater.checkForUpdates(); }
  catch (error) {
    log('update check failed', String(error));
    if (manual) explain('Aux update check failed', 'Aux could not check for an update. Your browsing session is unaffected.');
    manual = false;
  } finally { checking = false; }
}

export function installUpdates() {
  if (!updatesAvailableForBuild() || configured) return;
  configured = true;
  autoUpdater.autoDownload = true;
  // Install only after Aux's normal quit path approves dirty tabs and flushes its catalog.
  // Never call quitAndInstall: it closes windows before Aux's before-quit guard.
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-available', info => log('Aux update available', info.version));
  autoUpdater.on('update-not-available', () => {
    if (manual) explain('Aux is up to date', 'No newer Aux update is available.');
    manual = false;
  });
  autoUpdater.on('update-downloaded', info => {
    log('Aux update downloaded', info.version);
    explain('Aux update ready', 'The update will install after you quit Aux normally. Open Aux again to use it.');
    manual = false;
  });
  autoUpdater.on('error', error => {
    log('Aux update error', String(error));
    if (manual) explain('Aux update failed', 'Aux could not download the update. Your browsing session is unaffected.');
    manual = false;
  });
  const first = setTimeout(() => void checkForAuxUpdates(), 30_000);
  first.unref();
  const recurring = setInterval(() => void checkForAuxUpdates(), CHECK_INTERVAL_MS);
  recurring.unref();
  app.once('will-quit', () => { clearTimeout(first); clearInterval(recurring); });
}
