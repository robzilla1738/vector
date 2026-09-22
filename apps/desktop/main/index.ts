import { saveWorkbookSnapshot } from "./save-workbook.js";
import { setWindowMaterial } from "./window-material.js";
import { showNavigationMenu } from "./navigation-menu.js";
import { splitRatio, splitWidths } from "@vector/contracts/split-layout";
import { dictationStatus, startDictation, stopDictation, cancelDictation } from "./dictation.js";
import { SiteZoomPreferences } from "./site-zoom.js";
import { installSitePermissions, permissionOrigin } from "./site-permissions.js";
import { installTrackerBlock } from "./tracker-block.js";
import { createInsecureBypass } from "./insecure-bypass.js";
import { BrowserProfiles } from "./browser-profiles.js";
import { offerExternalLink } from "./external-links.js";
import { wirePageFullscreen, fullscreenContents, exitPageFullscreen } from "./page-fullscreen.js";
import { popupCommand } from './popup-commands.js';
import { approveWindowUnload } from './window-unload.js';
import { installHttpAuth } from "./http-auth.js";
/**
 * Aux desktop — Electron main process.
 *
 * Owns: windows, native WebContentsViews, the persistent profile session,
 * downloads, context menus, keyboard forwarding, and the forked runtime.
 * The runtime (separate process) is the execution authority; this process
 * exposes native.* methods to it over fork IPC and forwards its event
 * stream to the renderer.
 */
import { app, BaseWindow, dialog, globalShortcut, ipcMain, Menu, nativeTheme, powerMonitor, safeStorage, shell, webContents as electronWebContents, WebContentsView } from "electron";
import { mkdirSync, readFileSync, existsSync, writeFileSync, chmodSync, renameSync, lstatSync, realpathSync } from "node:fs";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { copyFile, cp, rm, writeFile } from "node:fs/promises";
import { spawn as spawnProcess } from "node:child_process";
import { randomUUID } from "node:crypto";
import type { ChildProcess } from "node:child_process";
import { normalizeAuxEnvironment, MethodSchemas, RpcChannel, SidebarMaterialSchema, type SidebarMaterial, type Transport } from "@vector/contracts";
import { resolveBrowserProfileDirectory, resolveDataDirectory } from "@vector/contracts/installation";
import { TargetRegistry, type ViewEntry } from "./target-registry.js";
import { createPageView, destroyPageView, downloadsSession, profileSession, setEngineFrame } from "./native-views.js";
import { attachToolbarEdgeWatch } from "./toolbar-edge-watch.js";
import { boundsContaining, cssCursor, inputEventFor, readPagePointer } from "./page-pointer.js";
import { interruptedDownloadHistory } from "./download-recovery.js";
import { controlDownload } from "./download-control.js";
import { hasPageWork } from "./page-suspension.js";
import { setPageZoom } from "./page-zoom.js";
import { PageFinder } from "./page-find.js";
import { startPreviewWatch } from "./preview-watch.js";
import { printPage, savePagePdf } from "./page-output.js";
import { createOffscreenHolds } from "./offscreen-holds.js";
import { readArticle } from "./read-article.js";
import { ProjectFiles } from "./project-files.js";
import { DownloadLocation } from "./download-location.js";
import { retrySource } from "./download-retry.js";
import { ProjectCommands } from "./project-commands.js";
import { ProjectCommandSchema, ProjectCommandContextSchema, ProjectCommandTaskSchema, ProjectServiceStackRequestSchema, ProjectReviewContextSchema, ProjectCommitRequestSchema, ProjectGithubStatusSchema, DownloadSchema, TaskSchema, EvidenceCommandSelectionParams } from "@vector/contracts";
import { LocalProjects } from "./local-projects.js";
import { readEvidenceImage } from "./image-evidence.js";
import { readEvidenceDocument } from "./document-evidence.js";
import { SecretStore } from "./secret-store.js";
import { isShellDocument } from "./shell-origin.js";
import { rendererMayInvoke } from "./renderer-methods.js";
import { ExtensionManager } from "./extensions.js";
import { spawnRuntime } from "./runtime-proc.js";
import { normalizeLocalPreviewUrl } from "./local-preview.js";
import {buildDiagnosticReport} from './diagnostics.js';
import {applyPendingRuntimeRestore,runtimeRestoreStatus} from './runtime-restore.js';
import {BrowserHealthRecorder} from './browser-health.js';
import {detectAgentClients} from './agent-clients.js';

const CDP_PORT_FILE = "devtools-port";
const PRIMARY_WINDOW_ID = "main";
const desktopStartedAt = Date.now();

const desktopEnv = normalizeAuxEnvironment(process.env);
const PROFILE_DIR = resolveBrowserProfileDirectory(app.getPath("appData"), app.isPackaged, desktopEnv);
mkdirSync(PROFILE_DIR, { recursive: true, mode: 0o700 });
// Pin both before app readiness. Package/product renames must not select a new
// Chromium session path implicitly, or separate the user and agent profiles.
app.setPath("userData", PROFILE_DIR);
app.setPath("sessionData", PROFILE_DIR);
if (!app.requestSingleInstanceLock()) app.exit(0);
const DATA_DIR = resolveDataDirectory(desktopEnv);
mkdirSync(DATA_DIR, { recursive: true });
applyPendingRuntimeRestore(DATA_DIR);
const browserProfiles=new BrowserProfiles(desktopEnv.AUX_PROFILE_CATALOG_DIR??join(DATA_DIR,"browser-profiles"),desktopEnv.AUX_BROWSER_PROFILE_ID??"default",{dataDir:DATA_DIR,profileDir:PROFILE_DIR});
let currentProfileName = browserProfiles.read(browserProfiles.currentId).name;
const extensionManager = new ExtensionManager(DATA_DIR);
const downloadLocation = new DownloadLocation(DATA_DIR);
const localProjects = new LocalProjects(join(DATA_DIR, "projects"));
const projectCommands = new ProjectCommands(join(DATA_DIR, "project-commands"),10*60*1000,projectId=>localProjects.snapshotTree(projectId));
const projectFiles = new ProjectFiles(id => localProjects.files(id),(id,name)=>localProjects.allowFileCreation(id,name));
const savingProjects = new Set<string>();
const cloudPreviewTokens = new Map<string,string>();

const WINDOW_BG = { dark: "#171717", light: "#ffffff" } as const;

function readStoredAppearance(): { theme: "system" | "dark" | "light"; translucent: boolean; material: SidebarMaterial } {
  try {
    const raw = JSON.parse(readFileSync(join(DATA_DIR, "settings.json"), "utf8")) as { theme?: string; sidebarAppearance?: string; sidebarMaterial?: unknown };
    return { theme: raw.theme === "system" ? "system" : raw.theme === "light" ? "light" : "dark", translucent: raw.sidebarAppearance !== "solid", material: SidebarMaterialSchema.catch("liquid-glass").parse(raw.sidebarMaterial) };
  } catch {
    return { theme: "dark", translucent: true, material: "liquid-glass" };
  }
}

let requestedGlass = true;
let requestedMaterial: SidebarMaterial = "liquid-glass";
nativeTheme.on("updated", () => {
  const glass = requestedGlass && !nativeTheme.prefersReducedTransparency && process.platform === "darwin";
  for (const state of regularWindows.values()) {
    state.win.setBackgroundColor(glass ? "#00000000" : WINDOW_BG[nativeTheme.shouldUseDarkColors ? "dark" : "light"]);
    setWindowMaterial(state.win, glass ? requestedMaterial : null);
    state.shellView.setBackgroundColor(glass ? "#00000000" : WINDOW_BG[nativeTheme.shouldUseDarkColors ? "dark" : "light"]);
  }
});
function applyAppearance(theme: "system" | "dark" | "light", translucent = requestedGlass, material = requestedMaterial) {
  requestedGlass = translucent;
  requestedMaterial = material;
  nativeTheme.themeSource = theme;
  const bg = WINDOW_BG[nativeTheme.shouldUseDarkColors ? "dark" : "light"];
  const glass = translucent && !nativeTheme.prefersReducedTransparency && process.platform === "darwin";
  for (const state of regularWindows.values()) {
    try { state.win.setBackgroundColor(glass ? "#00000000" : bg); } catch { /* platform support */ }
    setWindowMaterial(state.win, glass ? requestedMaterial : null);
    state.shellView.setBackgroundColor(glass ? "#00000000" : bg);
  }
}

async function loadProfileExtensions() {
  const configured = (desktopEnv.AUX_EXTENSION_PATHS ?? "")
    .split(process.platform === "win32" ? ";" : ":")
    .map((path) => path.trim())
    .filter(Boolean);
  await extensionManager.loadAll(profileSession(), configured);
  for (const extension of extensionManager.list(profileSession())) {
    if (extension.loaded) log("loaded extension", extension.name, extension.id);
    else if (extension.error) log("extension failed", extension.name, extension.error);
  }
}

// CDP must be enabled before app ready. Port 0 → OS picks; the real port is
// written to <userData>/DevToolsActivePort. Bind loopback only (plan A22).
app.commandLine.appendSwitch("remote-debugging-address", "127.0.0.1");
app.commandLine.appendSwitch("remote-debugging-port", "0");

let win: BaseWindow | null = null;
const pendingExternalUrls: string[] = [];
let runtimeReady = false;
let shellReady = false;
let openingExternalUrls = false;

function queueExternalUrl(url: string) {
  if (!isWebUrl(url)) return;
  pendingExternalUrls.push(url);
  void flushExternalUrls();
}

async function flushExternalUrls() {
  if (!runtimeReady || !shellReady || !channel || openingExternalUrls) return;
  openingExternalUrls = true;
  try {
    while (pendingExternalUrls.length) {
      const url = pendingExternalUrls.shift()!;
      try {
        const owner = focusedRegularWindow();
        if(owner?.win.isMinimized())owner.win.restore();
        owner?.win.show();owner?.win.focus();
        const target = await channel.call("api.invoke", { method: "pages.open", params: { url, windowId: owner?.id ?? PRIMARY_WINDOW_ID }, desktopUser:true }) as { pageId: string };
        await channel.call("api.invoke", { method: "pages.activate", params: { pageId: target.pageId }, desktopUser:true });
      } catch (error) {
        log("external URL failed", new URL(url).origin, error instanceof Error ? error.message : String(error));
      }
    }
  } finally {
    openingExternalUrls = false;
  }
}

app.on("second-instance", (_event, argv) => {
  for (const value of argv) queueExternalUrl(value);
  const state = focusedRegularWindow();
  if (state?.win.isMinimized()) state.win.restore();
  state?.win.show();
  state?.win.focus();
});
app.on("open-url", (event, url) => {
  event.preventDefault();
  queueExternalUrl(url);
});
for (const value of process.argv.slice(1)) queueExternalUrl(value);
let shellView: WebContentsView | null = null;
const registry = new TargetRegistry();
const browserHealth = new BrowserHealthRecorder(DATA_DIR,desktopStartedAt,()=>app.getAppMetrics(),()=>({windows:regularWindows.size,pages:registry.all().length,suspendedPages:frozenPages.size}));
interface RegularWindowState {
  /** Native page requested by the renderer; null while shell content owns the stage. */
  stagePageId: string | null;
  quickAsk: boolean;
  id: string;
  win: BaseWindow;
  shellView: WebContentsView;
  overlayOpen: boolean;
  sidebarPeek: boolean;
  toolbarOverlay: boolean;
  toolbarOverlaySeq: number;
  paintedFill: string;
  chromeOnTop: boolean;
  stageBounds: { x: number; y: number; width: number; height: number } | null;
  focusedPageId: string | null;
  splitPageId: string | null;
  splitRatio: number;
  stageRadius: number;
  closeApproved: boolean;
  previewWatch: { pageId: string; stop: () => void } | null;
}
const regularWindows = new Map<string, RegularWindowState>();
const toolbarEdges = new Map<string, ReturnType<typeof attachToolbarEdgeWatch>>();
const pageWindowOwners = new Map<string, string>();
const stateForWindowId = (id?: string) => regularWindows.get(id ?? PRIMARY_WINDOW_ID) ?? regularWindows.get(PRIMARY_WINDOW_ID) ?? regularWindows.values().next().value;
const stateForEntry = (entry?: ViewEntry) => stateForWindowId(entry?.windowId);
const stateForShell = (contentsId: number) => [...regularWindows.values()].find(state => state.shellView.webContents.id === contentsId);
const focusedRegularWindow = () => {
  const focused = BaseWindow.getFocusedWindow();
  return [...regularWindows.values()].find(state => state.win === focused) ?? stateForWindowId(PRIMARY_WINDOW_ID);
};
const shellForPage = (pageId: string) => regularWindows.get(pageWindowOwners.get(pageId) ?? PRIMARY_WINDOW_ID)?.shellView;
const broadcastToShells = (channelName: string, payload: unknown) => {
  for (const state of regularWindows.values()) {
    if (!state.shellView.webContents.isDestroyed()) state.shellView.webContents.send(channelName, payload);
  }
};
const requireOwnedEntry = (state: RegularWindowState, pageId: unknown, message = "This browser tab is no longer available.") => {
  const entry = typeof pageId === "string" ? registry.get(pageId) : undefined;
  if (!entry || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id || entry.view.webContents.isDestroyed()) throw new Error(message);
  return entry;
};
let channel: RpcChannel | null = null;
let runtimeProcess: ChildProcess | null = null;
let runtimeGeneration = 0;
let runtimeRestartAttempt = 0;
let runtimeRestartTimer: NodeJS.Timeout | null = null;
let runtimeCdpPort = 0;
// Pointer input only lands on a visible, laid-out view. An agent lease and a
// conversation preview each keep their page visible offscreen (stage-sized,
// beneath the shell) so Chromium keeps laying it out. Any number of pages can
// be held at once. setVisible(false) stops frames and Playwright stalls.
const offscreen = createOffscreenHolds();
function clearPreviewWatch(state: RegularWindowState) {
  const watch = state.previewWatch;
  if (!watch) return;
  state.previewWatch = null;
  watch.stop();
  if (offscreen.endPreview(watch.pageId) && !state.win.isDestroyed()) applyStage(state);
}
const idleFreezeTimers=new Map<string,NodeJS.Timeout>();
const frozenPages=new Set<string>();
const desiredFrozenPages=new Set<string>();
const lifecycleOperations=new Map<string,Promise<void>>();
const IDLE_FREEZE_MS=10*60_000;
function setPageFrozen(entry:ViewEntry,frozen:boolean){
  if(entry.popup||entry.kind==='engine'||entry.view.webContents.isDestroyed())return Promise.resolve();
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
      const protectedPage = !state || state.focusedPageId === entry.pageId || state.splitPageId === entry.pageId
        || entry.runtimeOwned || offscreen.holds(entry.pageId)
        || [...liveDownloads.values()].some(download => download.snapshot().pageId === entry.pageId);
      if (busy || protectedPage || mediaAllowed || wc.isDestroyed() || wc.isLoading() || wc.isCurrentlyAudible() || wc.isBeingCaptured() || !desiredFrozenPages.has(entry.pageId)) {
        desiredFrozenPages.delete(entry.pageId);
        if (state && state.focusedPageId !== entry.pageId && state.splitPageId !== entry.pageId) scheduleIdleFreeze(entry);
        return;
      }
    }
    try{await entry.view.webContents.debugger.sendCommand('Page.setWebLifecycleState',{state:shouldFreeze?'frozen':'active'});if(shouldFreeze)frozenPages.add(entry.pageId);else frozenPages.delete(entry.pageId);}catch{browserHealth.noteSuspensionFailure();desiredFrozenPages.delete(entry.pageId);frozenPages.delete(entry.pageId);}
  }).finally(()=>{if(lifecycleOperations.get(entry.pageId)===operation)lifecycleOperations.delete(entry.pageId);});
  lifecycleOperations.set(entry.pageId,operation);
  return operation;
}
function wakePage(entry?:ViewEntry){if(!entry)return Promise.resolve();const timer=idleFreezeTimers.get(entry.pageId);if(timer)clearTimeout(timer);idleFreezeTimers.delete(entry.pageId);return setPageFrozen(entry,false);}
function scheduleIdleFreeze(entry:ViewEntry){
  if(entry.popup||entry.kind==='engine'||entry.runtimeOwned||offscreen.holds(entry.pageId)||entry.view.webContents.isDestroyed()||frozenPages.has(entry.pageId)||idleFreezeTimers.has(entry.pageId))return;
  const timer=setTimeout(()=>{idleFreezeTimers.delete(entry.pageId);const state=stateForEntry(entry),wc=entry.view.webContents;if(!state||wc.isDestroyed()||entry.runtimeOwned)return;if(state.focusedPageId===entry.pageId||state.splitPageId===entry.pageId||offscreen.holds(entry.pageId))return;if(wc.isCurrentlyAudible()||wc.isLoading()){scheduleIdleFreeze(entry);return;}void setPageFrozen(entry,true);},IDLE_FREEZE_MS);timer.unref();idleFreezeTimers.set(entry.pageId,timer);
}
function forgetPageLifecycle(pageId:string){const timer=idleFreezeTimers.get(pageId);if(timer)clearTimeout(timer);idleFreezeTimers.delete(pageId);desiredFrozenPages.delete(pageId);frozenPages.delete(pageId);lifecycleOperations.delete(pageId);}
const pageFinder = new PageFinder();

function log(...args: unknown[]) {
  process.stdout.write(`[main] ${args.join(" ")}\n`);
}

function reportRuntimeStatus(connected: boolean, detail?: string) {
  for (const state of regularWindows.values()) state.shellView.webContents.send("runtime-status", { connected, detail });
}

function sendRuntimeEvent(event: unknown) {
  const value = event as { type?: string; payload?: { pageId?: string; page?: { pageId?: string; windowId?: string } } };
  const pageId = value.payload?.page?.pageId ?? value.payload?.pageId;
  const windowId = value.payload?.page?.windowId ?? (pageId ? pageWindowOwners.get(pageId) : undefined);
  const owner = windowId ? regularWindows.get(windowId) : undefined;
  if (owner && value.type !== "page.moved") owner.shellView.webContents.send("event", event);
  else for (const state of regularWindows.values()) state.shellView.webContents.send("event", event);
  if (value.type === "page.removed" && pageId) pageWindowOwners.delete(pageId);
}

function scheduleRuntimeRestart(delayMs?: number) {
  if (exitApproved || runtimeRestartTimer) return;
  const delay = delayMs ?? Math.min(15_000, 750 * 2 ** Math.min(runtimeRestartAttempt++, 5));
  runtimeRestartTimer = setTimeout(() => {
    runtimeRestartTimer = null;
    startRuntimeProcess();
  }, delay);
}

function startRuntimeProcess() {
  if (exitApproved || runtimeProcess) return;
  const generation = ++runtimeGeneration;
  runtimeReady = false;
  reportRuntimeStatus(false, runtimeRestartAttempt ? "Reconnecting to the Aux runtime…" : undefined);
  const runtime = spawnRuntime({
    dataDir: DATA_DIR,
    cdpPort: runtimeCdpPort,
    onExit: code => {
      if (generation !== runtimeGeneration) return;
      runtimeProcess = null;
      runtimeReady = false;
      channel = null;
      log("runtime exited", code);
      reportRuntimeStatus(false, "The Aux runtime stopped. Browsing remains available while it reconnects.");
      scheduleRuntimeRestart();
    },
  });
  runtimeProcess = runtime.proc;
  const transport: Transport = {
    send: message => {
      if (!runtime.proc.connected) throw new Error("runtime IPC disconnected");
      runtime.proc.send(message as never);
    },
    onMessage: callback => runtime.proc.on("message", callback),
    onClose: callback => {
      let closed = false;
      const once = () => { if (!closed) { closed = true; callback(); } };
      runtime.proc.once("disconnect", once);
      runtime.proc.once("exit", once);
    },
  };
  const next = new RpcChannel(transport, "shell->runtime");
  channel = next;
  registerNativeHandlers(next);
  next.onNotify((type, payload) => {
    if (generation !== runtimeGeneration) return;
    if (type === "runtime.ready") {
      runtimeReady = true;
      runtimeRestartAttempt = 0;
      log("runtime ready", JSON.stringify(payload));
      reportRuntimeStatus(true);
      void flushExternalUrls();
    }
    if (type === "event") sendRuntimeEvent(payload);
  });
}

const privateChildren = new Map<ChildProcess, { ready: boolean }>();
let privateControlSequence = 0;

function openPrivateWindow() {
  const args = app.isPackaged ? ["--aux-private"] : [app.getAppPath(), "--aux-private"];
  const child = spawnProcess(app.getPath("exe"), args, { detached: true, stdio: ["ignore", "ignore", "ignore", "ipc"], env: process.env });
  privateChildren.set(child, { ready: false });
  child.on("message", message => {
    const value = message as { type?: string };
    if (value?.type === "aux-private-ready") {
      const state = privateChildren.get(child);
      if (state) state.ready = true;
    } else if (value?.type === "aux-private-closing") {
      privateChildren.delete(child);
    }
  });
  const forget = () => privateChildren.delete(child);
  child.once("exit", forget);
  child.unref();
  child.channel?.unref();
}

function privateChildRunning(child: ChildProcess) {
  if (child.exitCode !== null || !child.pid) return false;
  try { process.kill(child.pid, 0); return true; } catch { return false; }
}

function requestPrivateControl(child: ChildProcess, action: "prepare" | "validate", timeoutMs = 20000): Promise<boolean | null> {
  if (!privateChildRunning(child)) return Promise.resolve(null);
  // A live window with a lost control channel must veto whole-app Quit. Treating
  // it as gone could strand a visible private process after the regular app exits.
  if (!child.connected) return Promise.resolve(false);
  return new Promise(resolve => {
    let settled = false;
    const requestId = `${process.pid}:${++privateControlSequence}`;
    const finish = (result: boolean | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      child.removeListener("message", onMessage);
      child.removeListener("exit", onExit);
      resolve(result);
    };
    const onMessage = (message: unknown) => {
      const value = message as { type?: string; requestId?: string; ok?: boolean };
      if (value?.type === "aux-private-control-result" && value.requestId === requestId) finish(value.ok === true);
    };
    const onExit = () => finish(null);
    const timer = setTimeout(() => finish(false), timeoutMs);
    child.on("message", onMessage);
    child.once("exit", onExit);
    child.send({ type: "aux-private-control", requestId, action }, error => { if (error) finish(null); });
  });
}

function signalPrivateControl(child: ChildProcess, action: "commit" | "abort") {
  if (!privateChildRunning(child)) { privateChildren.delete(child); return; }
  if (!child.connected) return;
  child.send({ type: "aux-private-control", requestId: `${process.pid}:${++privateControlSequence}`, action }, error => {
    if (error) privateChildren.delete(child);
  });
}

async function preparePrivateWindows(): Promise<ChildProcess[] | null> {
  const prepared: ChildProcess[] = [];
  for (const child of privateChildren.keys()) {
    const result = await requestPrivateControl(child, "prepare");
    if (result === null) { privateChildren.delete(child); continue; }
    if (!result) {
      for (const accepted of prepared) signalPrivateControl(accepted, "abort");
      return null;
    }
    prepared.push(child);
  }
  for (const child of prepared) {
    const result = await requestPrivateControl(child, "validate");
    if (result === null) { privateChildren.delete(child); continue; }
    if (!result) {
      for (const accepted of prepared) signalPrivateControl(accepted, "abort");
      return null;
    }
  }
  return prepared;
}

/**
 * Only web URLs may be handed to the OS. `file:`, `smb:`, custom schemes
 * etc. reach arbitrary local handlers — never from a page or the renderer.
 */
function isWebUrl(u: unknown): u is string {
  if (typeof u !== "string") return false;
  try {
    const p = new URL(u).protocol;
    return p === "http:" || p === "https:";
  } catch {
    return false;
  }
}

function scopeRuntimeResult(method: string, result: unknown, state: RegularWindowState) {
  const owns = (page: unknown) => {
    const value = page as { windowId?: string; ownedByRuntime?: boolean };
    return value?.ownedByRuntime === true || (value?.windowId ?? PRIMARY_WINDOW_ID) === state.id;
  };
  if (method === "pages.list" && Array.isArray(result)) return result.filter(owns);
  if (method === "workspace.get" && result && typeof result === "object") {
    const workspace = result as { pages?: unknown[]; activePageId?: string | null; pendingRestoreTabs?: {pageId:string;windowId:string}[] };
    return { ...workspace, pages: (workspace.pages ?? []).filter(owns), pendingRestoreTabs:workspace.pendingRestoreTabs?.filter(tab=>tab.windowId===state.id), activePageId: state.focusedPageId };
  }
  return result;
}

const siteZoom = new SiteZoomPreferences(join(DATA_DIR, "site-zoom.json"));
const SITE_PERMISSIONS_FILE = join(DATA_DIR, "site-permissions.json");
type PermissionDecision = "allow" | "deny";
let sitePermissions: Record<string, Record<string, PermissionDecision>> = (() => {
  try {
    return JSON.parse(readFileSync(SITE_PERMISSIONS_FILE, "utf8")) as Record<string, Record<string, PermissionDecision>>;
  } catch {
    return {};
  }
})();

function saveSitePermissions(next: typeof sitePermissions) {
  const temporary = `${SITE_PERMISSIONS_FILE}.tmp`;
  writeFileSync(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
  chmodSync(temporary, 0o600);
  renameSync(temporary, SITE_PERMISSIONS_FILE);
  sitePermissions = next;
}

const PRIVACY_FILE = join(DATA_DIR, "privacy.json");
interface PrivacyState { trackerBlock: boolean }
let privacy: PrivacyState = (() => {
  try {
    const parsed = JSON.parse(readFileSync(PRIVACY_FILE, "utf8")) as Partial<PrivacyState>;
    return { trackerBlock: parsed.trackerBlock !== false };
  } catch {
    return { trackerBlock: true };
  }
})();
let blockedRequests = 0;
const insecureBypass = createInsecureBypass();

function savePrivacy(next: PrivacyState) {
  const temporary = `${PRIVACY_FILE}.tmp`;
  writeFileSync(temporary, JSON.stringify(next, null, 2), { mode: 0o600 });
  chmodSync(temporary, 0o600);
  renameSync(temporary, PRIVACY_FILE);
  privacy = next;
}

function configurePagePermissions() {
  const ses = profileSession();
  // On supported macOS releases Chromium hands modern getDisplayMedia requests to
  // the native source picker. The picker is the consent boundary: Aux never sees
  // or preselects the list of windows/screens, and every request requires a fresh
  // user choice. Older platforms fall through to this handler and fail closed.
  // Legacy chromeMediaSource getUserMedia requests still reach the media handler
  // below with an empty mediaTypes array and remain denied.
  ses.setDisplayMediaRequestHandler((request, callback) => {
    const contents = request.frame ? electronWebContents.fromFrame(request.frame) : undefined;
    const origin = permissionOrigin(request.securityOrigin);
    if (!contents || contents.isDestroyed() || !registry.byWebContentsId(contents.id)
      || !origin || !request.userGesture || !request.videoRequested) {
      callback({});
      return;
    }
    // This callback is only reached when the native picker is unavailable.
    // Never choose or enumerate a source on the site's behalf.
    callback({});
  }, { useSystemPicker: process.platform === "darwin" });
  installSitePermissions(ses, {
    owner: contents => stateForEntry(registry.byWebContentsId(contents.id))?.win,
    read: () => sitePermissions,
    save: saveSitePermissions,
  });
  installTrackerBlock(ses, {
    enabled: () => privacy.trackerBlock,
    onBlocked: () => { blockedRequests += 1; },
  });
  // Explicit per-host certificate bypass for "proceed anyway" choices this
  // session only; -3 defers to Chromium's verifier for every other request.
  ses.setCertificateVerifyProc((request, callback) =>
    callback(insecureBypass.has(request.hostname) ? 0 : -3));
}

function configureCloudPreviewHeaders(){
  profileSession().webRequest.onBeforeSendHeaders((details,callback)=>{
    let token:string|undefined;
    try{token=cloudPreviewTokens.get(new URL(details.url).origin);}catch{/* malformed request URL */}
    callback(token?{requestHeaders:{...details.requestHeaders,'X-Aux-Preview-Token':token}}:{requestHeaders:details.requestHeaders});
  });
}

function readCdpPort(): number {
  const f = join(app.getPath("userData"), "DevToolsActivePort");
  for (let i = 0; i < 50; i++) {
    if (existsSync(f)) {
      const [port] = readFileSync(f, "utf8").split("\n");
      const n = Number(port);
      if (n > 0) {
        try {
          chmodSync(f, 0o600);
        } catch {
          /* non-POSIX fs */
        }
        return n;
      }
    }
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 100);
  }
  throw new Error("DevToolsActivePort never appeared");
}

// ---------- native.* surface (called by the runtime) ----------

function notifyRuntime(type: string, payload: unknown) {
  channel?.notify(type, payload);
}

const viewHooks = {
  onExternalLink: (entry: ViewEntry, url: string) => {
    const state=stateForEntry(entry);
    // Hidden task pages cannot open applications over the user's current work.
    if(entry.runtimeOwned || (!entry.popup && state?.stagePageId!==entry.pageId))return offerExternalLink(entry.view.webContents,undefined,url);
    return offerExternalLink(entry.view.webContents,entry.popup??state?.win,url);
  },
  onFullscreenReady: (entry: ViewEntry) => {
    if(entry.popup || entry.kind === "engine")return;
    wirePageFullscreen(entry.view.webContents,()=>{
      const state=stateForEntry(entry);
      return state?{window:state.win,canEnter:()=>!state.overlayOpen&&state.stagePageId===entry.pageId&&!entry.runtimeOwned,changed:()=>applyStage(state)}:undefined;
    });
  },
  onBrowserShortcut: (entry: ViewEntry) => {const state=stateForEntry(entry);if(state&&!entry.popup)exitPageFullscreen(state.win);},
  onNavigated: (pageId: string, url: string) => {
    const entry = registry.get(pageId);
    if (entry && entry.kind !== "engine") siteZoom.apply(entry.view.webContents, url);
    notifyRuntime("view.navigated", { pageId, url });
  },
  onTitle: (pageId: string, title: string) => {
    notifyRuntime("view.titleChanged", { pageId, title });
    const state = stateForEntry(registry.get(pageId));
    if (state?.focusedPageId === pageId) updateWindowTitle(state, title);
  },
  onFavicon: (pageId: string, favicon: string) => notifyRuntime("view.faviconChanged", { pageId, favicon }),
  confirmUnload: (entry: ViewEntry) => {
    if (exitApproved || stateForEntry(entry)?.closeApproved) return true;
    const wc = entry.view.webContents;
    let site = "this page";
    try { const origin = new URL(wc.getURL()).origin; if (origin !== "null") site = origin; } catch { /* no page-supplied message */ }
    const options: Electron.MessageBoxSyncOptions = {
      type: "warning", title: "Leave website?", message: `Leave ${site}?`,
      detail: "Changes you made may not be saved.", buttons: ["Stay", "Leave"],
      defaultId: 0, cancelId: 0, noLink: true,
    };
    const owner = stateForEntry(entry)?.win;
    return (entry.popup || owner ? dialog.showMessageBoxSync(entry.popup ?? owner!, options) : 0) === 1;
  },
  onAudio: (pageId:string,state:{muted:boolean;audible:boolean})=>shellForPage(pageId)?.webContents.send('view.audio',{pageId,...state}),
  onCursor: (pageId: string, cursor: string) => {
    const state = stateForEntry(registry.get(pageId));
    if (!state?.toolbarOverlay || state.shellView.webContents.isDestroyed()) return;
    state.shellView.webContents.send("page-cursor", cssCursor(cursor));
  },
  onLoading: (pageId: string, loading: boolean) => {
    const entry=registry.get(pageId);if(loading)void wakePage(entry);else if(entry){const state=stateForEntry(entry);if(state&&state.focusedPageId!==pageId&&state.splitPageId!==pageId&&!offscreen.holds(pageId))scheduleIdleFreeze(entry);}
    shellForPage(pageId)?.webContents.send("view.loading", { pageId, loading });
    notifyRuntime("view.loading", { pageId, loading });
  },
  onNavState: (pageId: string, canGoBack: boolean, canGoForward: boolean) =>
    notifyRuntime("view.navState", { pageId, canGoBack, canGoForward }),
  onNavigationError: (pageId: string, error: { url: string; code: number; message: string } | null) => notifyRuntime("view.navigationError", { pageId, error }),
  onCrashed: (pageId: string) => { browserHealth.notePageCrash(); notifyRuntime("view.crashed", { pageId }); },
  onUnresponsive:()=>browserHealth.notePageUnresponsive(),
  onDestroyed: (pageId: string) => { const owner=shellForPage(pageId);forgetPageLifecycle(pageId); registry.remove(pageId); owner?.webContents.send('view.audio',{pageId,muted:false,audible:false,removed:true});notifyRuntime("view.removed", { pageId }); },
  onPopup: (entry: ViewEntry, activate = false) => {
    registry.add(entry);
    pageWindowOwners.set(entry.pageId, entry.windowId ?? PRIMARY_WINDOW_ID);
    const state = stateForEntry(entry);
    if (!entry.popup && state) { state.win.contentView.addChildView(entry.view); applyStage(state); }
    notifyRuntime("view.popup", { showBlankDocument: entry.showBlankDocument, pageId: entry.pageId, windowId: entry.windowId ?? PRIMARY_WINDOW_ID, marker: entry.marker, url: entry.view.webContents.getURL(), title: entry.view.webContents.getTitle(), activate });
  },
  onTakeover: (pageId: string) => {
    // acquireStage is held for the whole program, including when the human is
    // watching the same tab. Playwright clicks land as mouseDown/keyDown and
    // must not steal the page. A real click after the program still takeovers.
    if (offscreen.holds(pageId)) return;
    notifyRuntime("view.takeover", { pageId });
  },
  openAsTab: (url: string, options?: { windowId?: string; background?: boolean; referrer?: Electron.Referrer }) => {
    if (!isWebUrl(url)) return;
    setImmediate(() => {
      const state = stateForWindowId(options?.windowId);
      if (!state) return;
      const pageId = `pop_${randomUUID()}`;
      const marker = `vtab-${pageId}`;
      const entry = createPageView({
        win: state.win,
        registry,
        pageId,
        windowId: state.id,
        marker,
        url,
        background: options?.background === true,
        referrer: options?.referrer,
        hooks: viewHooks,
      });
      pageWindowOwners.set(pageId, state.id);
      applyStage(state);
      let announced = false;
      const announce = async () => {
        if (announced || entry.view.webContents.isDestroyed()) return;
        for (let attempt = 0; attempt < 20; attempt++) {
          const ready = await entry.view.webContents
            .executeJavaScript(`globalThis.__vectorTid === ${JSON.stringify(marker)}`, true)
            .catch(() => false);
          if (ready) {
            if (announced) return;
            announced = true;
            notifyRuntime("view.popup", {
              pageId,
              windowId: entry.windowId,
              marker,
              url: entry.view.webContents.getURL() || url,
              title: entry.view.webContents.getTitle(),
              activate: options?.background !== true,
            });
            return;
          }
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        log("tab marker unavailable", new URL(url).origin);
      };
      entry.view.webContents.on("dom-ready", () => void announce());
      void announce();
      if (options?.background !== true) entry.view.webContents.focus();
    });
  },
  sendShortcut: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }, pageId: string) =>
    shellForPage(pageId)?.webContents.send("shortcut", s),
  onPageAction: (action: import("@vector/contracts").PageQuickAction) => {
    const shell = shellForPage(action.pageId);
    if (!shell || shell.webContents.isDestroyed()) return;
    shell.webContents.send("page.quickAction", action);
    shell.webContents.focus();
  },
};

function registerNativeHandlers(ch: RpcChannel) {
  ch.onMethod("native.listPages", () => ({
    pages: registry.all()
      .filter(entry => entry.kind !== "engine" && !entry.view.webContents.isDestroyed())
      .map(entry => ({
        pageId: entry.pageId,
        windowId: entry.windowId ?? PRIMARY_WINDOW_ID,
        marker: entry.marker,
        showBlankDocument: entry.showBlankDocument,
        url: entry.view.webContents.getURL() || "about:blank",
        title: entry.view.webContents.getTitle(),
        active: entry.popup ? entry.popup.isFocused() : entry.pageId === stateForEntry(entry)?.focusedPageId,
      })),
  }));
  ch.onMethod("native.createPage", async (p) => {
    const { pageId, windowId, marker, url, background,ownedByRuntime, kind } = p as {
      pageId: string;
      windowId?: string;
      marker: string;
      url: string;
      background: boolean;
      ownedByRuntime?:boolean;
      kind?: "chromium" | "engine";
    };
    const requestedWindowId = windowId ?? PRIMARY_WINDOW_ID;
    const state = regularWindows.get(requestedWindowId) ?? await createRegularWindow(requestedWindowId);
    createPageView({ win: state.win, registry, pageId, windowId: state.id, marker, url, background,ownedByRuntime, kind, hooks: viewHooks });
    pageWindowOwners.set(pageId, state.id);
    applyStage(state);
    const wc = registry.get(pageId)?.view.webContents;
    if (wc) notifyRuntime("view.navState", { pageId, canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() });
    return { ok: true };
  });
  ch.onMethod("native.movePage", async (raw) => {
    const { pageId, windowId, activate = true } = raw as { pageId: string; windowId?: string; activate?: boolean };
    const entry = registry.get(pageId);
    const source = stateForEntry(entry);
    if (!entry || entry.popup || !source || entry.runtimeOwned) throw new Error("This tab cannot be moved to another window.");
    const destination = windowId ? regularWindows.get(windowId) : await createRegularWindow();
    if (!destination || destination.win.isDestroyed() || source.win.isDestroyed() || entry.view.webContents.isDestroyed()) throw new Error("The source or destination window was closed.");
    if (source.id === destination.id) return { windowId: destination.id, sourceActivePageId: source.focusedPageId };
    source.win.contentView.removeChildView(entry.view);
    try { destination.win.contentView.addChildView(entry.view); }
    catch (error) { source.win.contentView.addChildView(entry.view); throw error; }
    entry.windowId = destination.id;
    pageWindowOwners.set(pageId, destination.id);
    notifyHttpAuthChanged();
    if (source.previewWatch?.pageId === pageId) clearPreviewWatch(source);
    if (source.focusedPageId === pageId) source.focusedPageId = registry.all().find(candidate => !candidate.popup && !candidate.runtimeOwned && (candidate.windowId ?? PRIMARY_WINDOW_ID) === source.id)?.pageId ?? null;
    if (source.splitPageId === pageId) source.splitPageId = null;
    if (activate || !destination.focusedPageId) { destination.focusedPageId = pageId; destination.splitPageId = null; }
    applyStage(source); applyStage(destination);
    if (activate) { destination.win.show(); destination.win.focus(); }
    return { windowId: destination.id, sourceActivePageId: source.focusedPageId, activePageId: destination.focusedPageId };
  });
  ch.onMethod("native.closePage", async (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (entry && state) {
      if (!await destroyPageView(entry, state.win)) return { ok: false };
      registry.remove(pageId);
    }
    // a closed page can't stay focused, split, or hold the stage lease —
    // stale pointers would leave every other view hidden
    if (state?.focusedPageId === pageId) state.focusedPageId = null;
    if (state?.splitPageId === pageId) state.splitPageId = null;
    if (state?.previewWatch?.pageId === pageId) {
      state.previewWatch.stop();
      state.previewWatch = null;
    }
    offscreen.forget(pageId);
    forgetPageLifecycle(pageId);
    if (state) applyStage(state);
    return { ok: true };
  });
  ch.onMethod("native.showPage", (p) => {
    const { pageId, bounds } = p as { pageId: string; bounds: { x: number; y: number; width: number; height: number } | null };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    wakePage(entry);
    if (entry.popup) return { ok: true };
    if (bounds) {
      entry.visibleBounds = bounds;
      state.stageBounds = bounds;
      applyStage(state);
    }
    return { ok: true };
  });
  ch.onMethod("native.hidePage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (entry && !entry.popup && !offscreen.holds(pageId)){entry.view.setVisible(false);scheduleIdleFreeze(entry);}
    return { ok: true };
  });
  ch.onMethod("native.recoverPage", async (p) => {
    const { pageId, url } = p as { pageId: string; url: string };
    const entry=registry.get(pageId);await wakePage(entry);const wc = entry?.view.webContents;
    if (!wc || wc.isDestroyed()) return { ok: false };
    await wc.loadURL(url);
    return { ok: true };
  });
  ch.onMethod("native.stopPage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry=registry.get(pageId);void wakePage(entry);const wc = entry?.view.webContents;
    if (!wc) return { ok: false };
    wc.stop();
    return { ok: true };
  });
  ch.onMethod("native.focusPage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    wakePage(entry);
    if (entry.popup) { entry.popup.show(); entry.popup.focus(); return { ok: true }; }
    state.focusedPageId = pageId;
    state.win.contentView.addChildView(entry.view); // re-add → top of z-order
    applyStage(state);
    state.win.show();
    state.win.focus();
    entry.view.webContents.focus();
    const wc = entry.view.webContents;
    notifyRuntime("view.navState", { pageId, canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() });
    return { ok: true };
  });
  // A program with pointer/keyboard steps is starting on this page: keep the
  // view laid out (offscreen if it is not the focused tab). Returns at once —
  // parallel programs on different pages never wait on each other.
  ch.onMethod("native.acquireStage", (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    const state = stateForEntry(entry);
    if (!entry || !state) return { ok: false };
    offscreen.acquireStage(pageId);
    wakePage(entry);
    applyStage(state);
    return { ok: true };
  });
  ch.onMethod("native.releaseStage", (p) => {
    const { pageId } = p as { pageId: string };
    const state = stateForEntry(registry.get(pageId));
    // A preview still capturing this page keeps it laid out.
    if (offscreen.releaseStage(pageId) && state) applyStage(state);
    return { ok: true };
  });
  ch.onMethod("native.capturePage", async (p) => {
    const { pageId, scale } = p as { pageId: string; scale: number };
    const entry = registry.get(pageId);
    if (!entry) throw new Error(`no view for ${pageId}`);
    await wakePage(entry);
    const img = await entry.view.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
    if (img.isEmpty()) throw new Error("The page has no image available yet. Open the tab and try again.");
    const size = img.getSize();
    const resized = scale < 1 ? img.resize({ width: Math.round(size.width * scale) }) : img;
    return { dataUrl: resized.toDataURL(), width: resized.getSize().width, height: resized.getSize().height, scale: 1 };
  });
  ch.onMethod("native.setEngineFrame", (p) => {
    const { pageId, dataUrl } = p as { pageId: string; dataUrl: string };
    const entry = registry.get(pageId);
    if (!entry) return { ok: false };
    setEngineFrame(entry, dataUrl);
    return { ok: true };
  });
  ch.onMethod("native.openExternal", (p) => {
    const { url } = p as { url: unknown };
    if (!isWebUrl(url)) return { ok: false, error: "only http(s) URLs can be opened externally" };
    void shell.openExternal(url);
    return { ok: true };
  });
  ch.onMethod("native.findInPage", async (p) => {
    const { pageId, text, forward, findNext } = p as { pageId: string; text: string; forward: boolean; findNext: boolean };
    const entry = registry.get(pageId);
    if (!entry) return { matches: 0 };
    const bounds = entry.popup ? entry.popup.getContentBounds() : entry.view.getBounds();
    const visible = (entry.popup ? entry.popup.isVisible() : entry.view.getVisible()) && bounds.width > 0 && bounds.height > 0;
    return pageFinder.find(entry.view.webContents, text, { forward, findNext, visible });
  });
  ch.onMethod("native.stopFind", (p) => {
    const { pageId, action } = p as { pageId: string; action: "clear" | "keep" };
    const entry = registry.get(pageId);
    if (entry) pageFinder.stop(entry.view.webContents, action);
    return { ok: true };
  });
  ch.onMethod("native.setZoom", (p) => {
    const { pageId, level, delta, reset, direction } = p as { pageId: string; level?: number; delta?: number; reset?: boolean; direction?: "in" | "out" };
    const entry = registry.get(pageId);
    if (!entry) throw new Error("This tab is no longer available.");
    const result = setPageZoom(entry.view.webContents, { level, delta, reset, direction });
    if (level !== undefined || delta !== undefined || reset || direction) {
      try { siteZoom.remember(entry.view.webContents.getURL(), result.level); broadcastToShells("site-zoom-changed", {}); }
      catch { throw new Error("Page size changed, but Aux could not save this site’s zoom preference."); }
    }
    return result;
  });
  ch.onMethod("native.print", async (p) => {
    const { pageId } = p as { pageId: string };
    const entry = registry.get(pageId);
    if (!entry) throw new Error("This tab is no longer available.");
    return { ok: await printPage(entry.view.webContents, entry.showBlankDocument) };
  });
  ch.onMethod("native.setCookies", async (p) => {
    // cookie values flow through but are never logged or persisted to disk
    // beyond Chromium's own encrypted profile store
    const { cookies } = p as {
      cookies: {
        name: string;
        value: string;
        domain: string;
        path: string;
        secure: boolean;
        httpOnly: boolean;
        sameSite?: "Strict" | "Lax" | "None";
        expires?: number;
      }[];
    };
    const ses = profileSession();
    let count = 0;
    for (const c of cookies) {
      const bare = c.domain.replace(/^\./, "");
      try {
        await ses.cookies.set({
          url: `${c.secure ? "https" : "http"}://${bare}${c.path || "/"}`,
          name: c.name,
          value: c.value,
          domain: c.domain,
          path: c.path || "/",
          secure: c.secure,
          httpOnly: c.httpOnly,
          sameSite:
            c.sameSite === "None" ? "no_restriction" : c.sameSite === "Strict" ? "strict" : c.sameSite === "Lax" ? "lax" : "unspecified",
          ...(c.expires ? { expirationDate: c.expires } : {}),
        });
        count++;
      } catch {
        // a cookie that fails validation (bad domain for url etc.) is skipped,
        // not fatal to the batch
      }
    }
    return { ok: true, count };
  });
  const secrets = new SecretStore(join(DATA_DIR, "secrets"), safeStorage);
  ch.onMethod("native.storeSecret", (p) => {
    const { name, value } = p as { name: string; value: string };
    if (typeof name !== "string" || typeof value !== "string") throw new Error("Invalid credential request");
    secrets.write(name, value);
    return { ok: true };
  });
  ch.onMethod("native.readSecret", (p) => {
    const { name } = p as { name: string };
    if (typeof name !== "string") throw new Error("Invalid credential request");
    return { value: secrets.read(name) };
  });
  ch.onMethod('native.developmentProjects',async p=>{
    const ids=new Set((p as {projectIds?:unknown}).projectIds instanceof Array?(p as {projectIds:string[]}).projectIds.filter(id=>typeof id==='string'):[]);
    return (await localProjects.list()).filter(project=>ids.has(project.projectId));
  });
  ch.onMethod('native.inspectProject',p=>localProjects.inspect((p as {projectId:string}).projectId));
  ch.onMethod('native.githubProject',p=>localProjects.githubIdentity((p as {projectId:string}).projectId));
  ch.onMethod('native.recordGithubStatus',p=>{const input=p as {projectId:string;status:unknown};return localProjects.recordGithubStatus(input.projectId,ProjectGithubStatusSchema.parse(input.status));});
  ch.onMethod('native.writeIncidentReport',async p=>{
    const input=p as {projectId:string;task:unknown;page:{pageId:string;url:string;title:string};console:{level:string;message:string;atMs?:number}[];network:{method:string;status?:number;url:string;durationMs?:number;startedAt?:number}[];operations?:unknown};const task=ProjectCommandTaskSchema.parse(input.task);
    if(!channel)throw new Error('Runtime not connected');const details=await channel.call('api.invoke',{method:'tasks.get',params:{taskId:task.taskId},desktopUser:true}) as {task:unknown};const current=TaskSchema.parse(details.task);
    if(current.revision!==task.taskRevision||!current.resources.some(resource=>resource.kind==='repository'&&resource.projectId===input.projectId))throw new Error('The task or checkout attachment changed. Prepare the incident snapshot again.');
    const page={pageId:String(input.page.pageId).slice(0,200),url:String(input.page.url).slice(0,8192),title:String(input.page.title).slice(0,1000)};
    const consoleLines=(Array.isArray(input.console)?input.console:[]).slice(-100).filter(item=>item&&typeof item.level==='string'&&typeof item.message==='string').map(item=>({level:item.level.slice(0,40),message:item.message.slice(0,8000),...(typeof item.atMs==='number'?{atMs:item.atMs}:{})}));
    const network=(Array.isArray(input.network)?input.network:[]).slice(-100).filter(item=>item&&typeof item.method==='string'&&typeof item.url==='string').map(item=>({method:item.method.slice(0,20),url:item.url.slice(0,8192),...(typeof item.status==='number'?{status:item.status}:{}),...(typeof item.durationMs==='number'?{durationMs:item.durationMs}:{}),...(typeof item.startedAt==='number'?{startedAt:item.startedAt}:{})}));
    const operations=typeof input.operations==='string'?input.operations.slice(0,32*1024):undefined;
    return localProjects.writeIncidentReport(input.projectId,{task,page,console:consoleLines,network,operations},projectCommands.list(input.projectId));
  });
  ch.onMethod('native.listProjectFiles',async p=>(await localProjects.files((p as {projectId:string}).projectId)).files);
  ch.onMethod('native.readProjectFile',p=>{const input=p as {projectId:string;name:string};return projectFiles.read(input.projectId,input.name);});
  ch.onMethod('native.projectSnapshotTree',p=>localProjects.snapshotTree((p as {projectId:string}).projectId));
  const confirmProjectChange=async(input:{projectId:string;name:string;content:string;task:unknown},create:boolean)=>{
    const task=ProjectCommandTaskSchema.parse(input.task);const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');
    const project=(await localProjects.inspect(input.projectId)).project;
    const preview=input.content.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').slice(0,6000);
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:create?'Create project file':'Save agent file change',message:`${create?'Create':'Replace'} ${input.name} in the isolated checkout?`,
      detail:`Task: ${task.title} · Revision ${task.taskRevision}\nProject: ${project.name}\nPath: ${project.path}/${input.name}\nSize: ${Buffer.byteLength(input.content,'utf8').toLocaleString()} bytes\n\nContent preview${input.content.length>preview.length?' (truncated)':''}:\n${preview||'(Empty file)'}\n\nAux keeps recovery data for replacements. This does not change the original checkout, commit, push, or publish.`,
      buttons:['Cancel',create?'Create file':'Save change'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;
    if(!channel)throw new Error('Runtime not connected');
    const current=TaskSchema.parse(await channel.call('api.invoke',{method:'tasks.prepareLocalCommand',params:{taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId},desktopUser:true}));
    if(current.revision!==task.taskRevision)throw new Error('Task revision changed; review the request again.');
    return task;
  };
  ch.onMethod('native.writeProjectFile',async p=>{
    const input=p as {projectId:string;name:string;expectedHash:string;content:string;task:unknown};
    if((await projectFiles.read(input.projectId,input.name)).sha256!==input.expectedHash)throw new Error('The file changed outside the agent session. Read it again before proposing a save.');
    if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before saving a file.");
    if(!await confirmProjectChange(input,false))return null;
    if(savingProjects.has(input.projectId))throw new Error('A file is already being changed in this project.');savingProjects.add(input.projectId);
    try{if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before saving a file.");return await projectFiles.save(input.projectId,input.name,input.expectedHash,input.content);}finally{savingProjects.delete(input.projectId);}
  });
  ch.onMethod('native.createProjectFile',async p=>{
    const input=p as {projectId:string;name:string;content:string;task:unknown};if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before creating a file.");if(!await confirmProjectChange(input,true))return null;
    if(savingProjects.has(input.projectId))throw new Error('A file is already being changed in this project.');savingProjects.add(input.projectId);
    try{if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before creating a file.");const created=await projectFiles.create(input.projectId,input.name);if(!input.content)return created;return await projectFiles.save(input.projectId,input.name,created.sha256,input.content);}finally{savingProjects.delete(input.projectId);}
  });
  const confirmProjectFileLifecycle=async(input:{projectId:string;name:string;nextName?:string;expectedHash:string;task:unknown},action:'rename'|'delete')=>{
    const task=ProjectCommandTaskSchema.parse(input.task);const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');
    const project=(await localProjects.inspect(input.projectId)).project;const file=await projectFiles.read(input.projectId,input.name);
    if(file.sha256!==input.expectedHash)throw new Error('The file changed outside the agent session. Read it again before proposing this change.');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:action==='rename'?'Rename agent project file':'Delete agent project file',message:action==='rename'?`Rename ${input.name} to ${input.nextName}?`:`Delete ${input.name} from the isolated checkout?`,
      detail:`Task: ${task.title} · Revision ${task.taskRevision}\nProject: ${project.name}\nCheckout: ${project.path}\nExpected file: ${input.expectedHash}\n\nAux will preserve the current file in recovery history. This does not change the original checkout, commit, push, or publish.`,
      buttons:['Cancel',action==='rename'?'Rename file':'Delete file'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;if(!channel)throw new Error('Runtime not connected');
    const current=TaskSchema.parse(await channel.call('api.invoke',{method:'tasks.prepareLocalCommand',params:{taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId},desktopUser:true}));
    if(current.revision!==task.taskRevision)throw new Error('Task revision changed; review the request again.');
    return task;
  };
  ch.onMethod('native.renameProjectFile',async p=>{
    const input=p as {projectId:string;name:string;nextName:string;expectedHash:string;task:unknown};
    if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before renaming a file.");
    if(!await confirmProjectFileLifecycle(input,'rename'))return null;if(savingProjects.has(input.projectId))throw new Error('A file is already being changed in this project.');savingProjects.add(input.projectId);
    try{if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before renaming a file.");return await projectFiles.move(input.projectId,input.name,input.nextName,input.expectedHash);}finally{savingProjects.delete(input.projectId);}
  });
  ch.onMethod('native.deleteProjectFile',async p=>{
    const input=p as {projectId:string;name:string;expectedHash:string;task:unknown};
    if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before deleting a file.");
    if(!await confirmProjectFileLifecycle(input,'delete'))return null;if(savingProjects.has(input.projectId))throw new Error('A file is already being changed in this project.');savingProjects.add(input.projectId);
    try{if(projectCommands.list(input.projectId).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before deleting a file.");return await projectFiles.remove(input.projectId,input.name,input.expectedHash);}finally{savingProjects.delete(input.projectId);}
  });
  ch.onMethod('native.projectCommands',p=>projectCommands.list((p as {projectId:string}).projectId));
  ch.onMethod('native.runProjectCommand',async p=>{
    const input=p as {projectId:string;command:string;mode:unknown;task:unknown};const command=ProjectCommandSchema.shape.command.parse(input.command);const mode=ProjectCommandSchema.shape.mode.parse(input.mode);const task=ProjectCommandTaskSchema.parse(input.task);
    const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');const project=(await localProjects.inspect(input.projectId)).project;
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:mode==='service'?'Start agent-requested service':'Run agent-requested command',message:mode==='service'?'Keep this task service running?':'Run this task command?',
      detail:`Task: ${task.title} · Revision ${task.taskRevision}\n\n${command}\n\nWorking directory: ${project.path}\n\nThis is not a sandbox. The command can change local files and access the network. Aux uses a separate HOME and does not supply model credentials. Output is saved locally.`,buttons:['Cancel',mode==='service'?'Start service':'Run command'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;if(!channel)throw new Error('Runtime not connected');
    const current=TaskSchema.parse(await channel.call('api.invoke',{method:'tasks.prepareLocalCommand',params:{taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId},desktopUser:true}));
    if(savingProjects.has(input.projectId))throw new Error('Wait for the file change before starting a command.');
    return projectCommands.start(project,command,{taskId:current.taskId,taskRevision:current.revision,title:current.title,workspaceId:current.workspaceId},mode);
  });
  ch.onMethod('native.approveCloudCommand',async p=>{
    const input=p as {task:unknown;environment?:unknown;executable?:unknown;args?:unknown;mode?:unknown;timeoutMinutes?:unknown};const task=ProjectCommandTaskSchema.parse(input.task);
    if(!input.environment||typeof input.environment!=='object')throw new Error('Cloud environment details are missing.');const environment=input.environment as Record<string,unknown>;
    const remoteName=String(environment.remoteName??'').slice(0,200),runtime=String(environment.runtime??'').slice(0,100),region=String(environment.region??'').slice(0,100);if(!remoteName||!runtime||!region)throw new Error('Cloud environment details are invalid.');
    const executable=String(input.executable??'');const args=Array.isArray(input.args)?input.args.map(value=>String(value)):[];const mode=input.mode==='service'?'service':'command';const timeoutMinutes=typeof input.timeoutMinutes==='number'?Math.max(5,Math.min(45,Math.trunc(input.timeoutMinutes))):undefined;
    const state=focusedRegularWindow();if(!state)throw new Error('Aux window is unavailable');state.win.show();state.win.focus();
    const command=[executable,...args].map(value=>/[\s"'\\]/.test(value)?JSON.stringify(value):value).join(' ').slice(0,8000);
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:mode==='service'?'Start agent-requested cloud service':'Run agent-requested cloud command',message:mode==='service'?'Start this service in the task cloud environment?':'Run this command in the task cloud environment?',detail:`Task: ${task.title} · Revision ${task.taskRevision}\nEnvironment: ${remoteName}\nRuntime: ${runtime} · ${region}${timeoutMinutes?` · ${timeoutMinutes}-minute limit`:''}\n\n${command}\n\nThis runs in the existing Vercel Sandbox and may consume billable compute and network. Aux will save the command state and output. It does not receive browser cookies, model credentials or local environment variables.`,buttons:['Cancel',mode==='service'?'Start service':'Run command'],defaultId:0,cancelId:0,noLink:true});
    return answer.response===1;
  });
  ch.onMethod('native.approveProjectPreview',async p=>{
    const input=p as {projectId:string;url:string;task:unknown};const task=ProjectCommandTaskSchema.parse(input.task);const url=normalizeLocalPreviewUrl(input.url).href;
    const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');const project=(await localProjects.inspect(input.projectId)).project;
    const answer=await dialog.showMessageBox(state.win,{type:'question',title:'Open agent local preview',message:`Allow this task to open ${url}?`,detail:`Task: ${task.title} · Revision ${task.taskRevision}\nProject: ${project.name}\n\nAux will send a cookie-free loopback check, then open a browser tab only after a successful response. This grants this connection access to that preview tab until Aux restarts or the connection is revoked.`,buttons:['Cancel','Check and open'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;if(!channel)throw new Error('Runtime not connected');
    const details=await channel.call('api.invoke',{method:'tasks.get',params:{taskId:task.taskId},desktopUser:true}) as {task:unknown};const current=TaskSchema.parse(details.task);
    if(current.revision!==task.taskRevision)throw new Error('Task revision changed; review the preview request again.');
    if(!current.resources.some(resource=>resource.kind==='repository'&&resource.projectId===input.projectId))throw new Error('The checkout is no longer attached to this task.');
    return localProjects.checkPreview(input.projectId,url);
  });
  ch.onMethod('native.stopProjectCommand',p=>{const input=p as {projectId:string;commandId:string};return projectCommands.stop(input.projectId,input.commandId);});
  ch.onMethod('native.prepareProjectReview',async p=>{const input=p as {projectId:string;task:unknown};const task=ProjectReviewContextSchema.parse(input.task);return localProjects.writeReviewSummary(input.projectId,await localProjects.inspect(input.projectId),projectCommands.list(input.projectId),task);});
  ch.onMethod('native.commitProject',async p=>{
    const input=p as {projectId:string;request:unknown;task:unknown};const request=ProjectCommitRequestSchema.parse(input.request);const task=ProjectReviewContextSchema.parse(input.task);
    const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');
    if(projectCommands.list(input.projectId).some(command=>command.state==='running'||command.state==='stopping'))throw new Error('Stop local commands and services before creating a commit.');
    if(savingProjects.has(input.projectId))throw new Error('Wait for the file change before creating a commit.');
    const review=await localProjects.writeReviewSummary(input.projectId,await localProjects.inspect(input.projectId),projectCommands.list(input.projectId),task);
    if(review.readiness.state!=='ready'||review.patch.sha256!==request.expectedPatchHash||review.snapshotTree!==request.expectedTree)throw new Error('The prepared handoff changed. Prepare it again before creating a commit.');
    const project=(await localProjects.inspect(input.projectId)).project;
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Create local commit',message:`Create a commit on ${project.branch}?`,detail:`Task: ${task.title} · Revision ${task.taskRevision}\n\n${request.message}\n\nAuthor: ${request.authorName} <${request.authorEmail}>\nPatch: ${request.expectedPatchHash}\n\nThis creates one local commit in Aux’s isolated checkout. It does not push, publish, or open a pull request. Repository hooks, commit signing, credential helpers, and network protocols are disabled.`,buttons:['Cancel','Create local commit'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;if(!channel)throw new Error('Runtime not connected');
    const current=TaskSchema.parse(await channel.call('api.invoke',{method:'tasks.prepareLocalCommand',params:{taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId},desktopUser:true}));
    if(current.revision!==task.taskRevision||!current.resources.some(resource=>resource.kind==='repository'&&resource.projectId===input.projectId))throw new Error('The task or checkout attachment changed. Review the commit again.');
    if(projectCommands.list(input.projectId).some(command=>command.state==='running'||command.state==='stopping')||savingProjects.has(input.projectId))throw new Error('The checkout became busy. Review the commit again.');
    return localProjects.commit(input.projectId,request,projectCommands.list(input.projectId),task);
  });
}

// ---------- stage layout ----------

function windowPageTitle(state: RegularWindowState, title?: string) {
  const contents = registry.get(state.focusedPageId ?? "")?.view.webContents;
  if (!contents || contents.isDestroyed()) return "New Tab";
  const url = contents.getURL();
  if (!url || url === "about:blank") return "New Tab";
  const label = (title ?? contents.getTitle()).replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (label && label !== url) return label.slice(0, 160);
  try { return new URL(url).hostname || "New Tab"; } catch { return "New Tab"; }
}

function updateWindowTitle(state: RegularWindowState, pageTitle?: string) {
  if (state.win.isDestroyed()) return;
  const profile = currentProfileName;
  const title = state.quickAsk ? `Ask Aux — ${profile}` : `${windowPageTitle(state, pageTitle)} — Aux — ${profile}`;
  if (state.win.getTitle() !== title) state.win.setTitle(title);
}

function applyStage(state = stateForWindowId(PRIMARY_WINDOW_ID)) {
  if (!state) return;
  const syncToolbarEdge = () => toolbarEdges.get(state.id)?.sync();
  updateWindowTitle(state);
  const { win } = state;
  const bounds = state.stageBounds ?? win.getContentBounds();
  const shown = state.stagePageId;
  let fullscreen=fullscreenContents(win);
  if(fullscreen && (state.overlayOpen || registry.get(shown??"")?.view.webContents!==fullscreen)) {
    exitPageFullscreen(win);fullscreen=undefined;
  }
  if(fullscreen) {
    const size=win.getContentBounds();
    for(const entry of registry.all()) {
      if(entry.popup || (entry.windowId??PRIMARY_WINDOW_ID)!==state.id)continue;
      const shown=entry.view.webContents===fullscreen;
      entry.view.setVisible(shown);
      if(shown){wakePage(entry);entry.view.setBounds({x:0,y:0,width:size.width,height:size.height});entry.view.setBorderRadius(0);win.contentView.addChildView(entry.view);}
    }
    syncToolbarEdge();
    return;
  }
  // Deliberate two-page inspection: a split companion shares the stage beside
  // the focused page.
  const companion = state.splitPageId ? registry.get(state.splitPageId) : undefined;
  const split = shown && !state.overlayOpen && companion && companion.pageId !== shown
    && !companion.popup && !companion.runtimeOwned && companion.kind !== "engine"
    && (companion.windowId ?? PRIMARY_WINDOW_ID) === state.id
    && !companion.view.webContents.isDestroyed() && !companion.view.webContents.isCrashed()
    && (companion.showBlankDocument || (!!companion.view.webContents.getURL() && companion.view.webContents.getURL() !== "about:blank"))
    ? companion.pageId : null;
  // Working pages that are not on the stage render at stage bounds *beneath*
  // the shell view (child index 0): laid out, producing frames, receiving
  // trusted input, covered by the opaque shell. A view outside the window
  // would get an empty visible rect and Chromium collapses its viewport.
  for (const entry of registry.all()) {
    if (entry.popup) continue; // Independent windows never participate in the tab stage.
    if ((entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) continue;
    // WebContentsView.setBorderRadius exists in current Electron.
    const rounded = entry.view as { setBorderRadius?: (r: number) => void };
    if (typeof rounded.setBorderRadius === "function") {
      try {
        rounded.setBorderRadius(state.stageRadius);
      } catch {
        /* unsupported on this platform */
      }
    }
    if (entry.pageId === shown && !state.overlayOpen) {
      wakePage(entry);
      if (split) {
        const w = splitWidths(bounds.width, state.splitRatio).left;
        entry.view.setBounds({ x: bounds.x, y: bounds.y, width: w, height: bounds.height });
      } else {
        entry.view.setBounds(bounds);
      }
      entry.view.setVisible(true);
    } else if (split && entry.pageId === split) {
      wakePage(entry);
      const w = splitWidths(bounds.width, state.splitRatio).right;
      entry.view.setBounds({ x: bounds.x + bounds.width - w, y: bounds.y, width: w, height: bounds.height });
      entry.view.setVisible(true);
    } else if (offscreen.holds(entry.pageId)) {
      wakePage(entry);
      win.contentView.addChildView(entry.view, 0);
      entry.view.setBounds(bounds);
      entry.view.setVisible(true);
    } else {
      entry.view.setVisible(false);
      if(entry.pageId!==state.focusedPageId&&entry.pageId!==state.splitPageId)scheduleIdleFreeze(entry);
    }
  }
  placeChrome(state);
  syncToolbarEdge();
}

function placeChrome(state: RegularWindowState) {
  const glass = requestedGlass && !nativeTheme.prefersReducedTransparency && process.platform === "darwin";
  const fill = state.quickAsk || state.toolbarOverlay || glass ? "#00000000" : WINDOW_BG[nativeTheme.shouldUseDarkColors ? "dark" : "light"];
  if (state.paintedFill !== fill) {
    state.paintedFill = fill;
    state.shellView.setBackgroundColor(fill);
  }
  if (state.win.isDestroyed()) return;
  // The address bar lives in the shell. Raise that view while it is open so it paints over the page instead of pushing the page down.
  if (state.sidebarPeek || state.toolbarOverlay) {
    state.chromeOnTop = true;
    state.win.contentView.addChildView(state.shellView);
    return;
  }
  if (!state.chromeOnTop) return;
  state.chromeOnTop = false;
  for (const pageId of [state.stagePageId, state.splitPageId]) {
    const entry = pageId ? registry.get(pageId) : undefined;
    if (!entry || entry.popup || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) continue;
    state.win.contentView.addChildView(entry.view);
  }
}

function deliverPagePointer(state: RegularWindowState, value: unknown) {
  if (!state.toolbarOverlay || state.overlayOpen) return;
  const message = readPagePointer(value);
  if (!message) return;
  const visible = [state.splitPageId, state.stagePageId].flatMap(pageId => {
    const entry = pageId ? registry.get(pageId) : undefined;
    if (!entry || entry.popup || (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id || !entry.view.getVisible()) return [];
    return [{ entry, ...entry.view.getBounds() }];
  });
  const hit = boundsContaining(message.x, message.y, visible);
  if (!hit || hit.entry.view.webContents.isDestroyed()) return;
  const input = inputEventFor(message, hit.x, hit.y);
  if (!input) return;
  if (message.kind === "down") hit.entry.view.webContents.focus();
  hit.entry.view.webContents.sendInputEvent(input);
}

// ---------- renderer IPC ----------

  const requireShellUi = (event: Electron.IpcMainInvokeEvent) => {
    const state = stateForShell(event.sender.id);
    if (!state || event.senderFrame !== state.shellView.webContents.mainFrame
      || !isShellDocument(event.senderFrame.url, join(import.meta.dirname, "..", "renderer", "index.html"), process.env.VITE_DEV_SERVER_URL)) throw new Error("These controls require the Aux interface");
    return state;
  };

const profileLaunches=new Map<string,Promise<void>>();
function wireRendererIpc() {
  ipcMain.handle("ui.dictationStatus", event => { requireShellUi(event); return dictationStatus(); });
  ipcMain.handle("ui.startDictation", (event, id: unknown) => { const state = requireShellUi(event); return startDictation(event.sender, id, state.win); });
  ipcMain.handle("ui.stopDictation", (event, id: unknown) => { requireShellUi(event); return stopDictation(event.sender, id); });
  ipcMain.handle("ui.cancelDictation", (event, id: unknown) => { requireShellUi(event); cancelDictation(event.sender, id); });

  ipcMain.handle("ui.quickAskShortcut",(event,enabled?:unknown)=>{requireShellUi(event);if(enabled===undefined)return quickAskShortcutStatus();if(typeof enabled!=="boolean")throw new Error("Invalid shortcut preference.");return configureQuickAskShortcut(enabled);});
  ipcMain.handle("ui.quickAsk", async (event, action: string) => {
    const state = requireShellUi(event);
    if (action === "open") { await openQuickAsk(); return state.quickAsk; }
    if (action === "expand" && state.quickAsk) {
      state.quickAsk = false;
      updateWindowTitle(state);
      state.win.setMinimumSize(900,640); state.win.setSize(1200,800); state.win.center();
      state.shellView.webContents.send("quick-ask.state", false);
    } else if (action === "dismiss" && state.quickAsk) state.win.hide();
    else if (!["status","expand","dismiss"].includes(action)) throw new Error("Unknown quick assistance action.");
    return state.quickAsk;
  });
  ipcMain.handle("ui.browserProfiles",event=>{requireShellUi(event);const profiles=browserProfiles.list();const current=profiles.find(profile=>profile.current);if(current){currentProfileName=current.name;for(const state of regularWindows.values())updateWindowTitle(state);}return profiles;});
  ipcMain.handle("ui.archiveBrowserProfile",(event,id:string,archived:boolean)=>{requireShellUi(event);return browserProfiles.archive(id,archived);});
  ipcMain.handle("ui.createBrowserProfile",(event,name:unknown)=>{requireShellUi(event);return browserProfiles.create(name);});
  ipcMain.handle("ui.renameBrowserProfile",(event,id:string,name:unknown)=>{requireShellUi(event);const profiles=browserProfiles.rename(id,name);if(id===browserProfiles.currentId){currentProfileName=browserProfiles.read(id).name;for(const state of regularWindows.values())updateWindowTitle(state);}return profiles;});
  ipcMain.handle("ui.openBrowserProfile",async(event,id:string)=>{
    requireShellUi(event);
    const env=browserProfiles.environment(id,process.env);
    if(id===browserProfiles.currentId){const state=focusedRegularWindow();state?.win.show();state?.win.focus();return true;}
    let launch=profileLaunches.get(id);
    if(!launch){
      launch=new Promise<void>((resolve,reject)=>{
        const child=spawnProcess(process.execPath,app.isPackaged?[]:[app.getAppPath()],{env,detached:true,stdio:["ignore","ignore","ignore","ipc"]});
        let settled=false;
        const finish=(error?:Error)=>{
          if(settled)return;settled=true;clearTimeout(timeout);
          if(child.connected)child.disconnect();child.unref();
          if(error)reject(error);else resolve();
        };
        const timeout=setTimeout(()=>finish(new Error("This profile is taking longer to start. Check its window before trying again.")),60_000);
        child.once("error",error=>finish(error));
        child.on("message",message=>{
          if(message&&typeof message==="object"&&"type" in message&&message.type==="aux-profile-ready"&&"profileId" in message&&message.profileId===id)finish();
        });
        // A clean early exit hands the request to that profile's existing instance.
        child.once("exit",code=>finish(code===0?undefined:new Error("The profile could not start. Its browsing data has been kept; try opening it again.")));
      }).finally(()=>profileLaunches.delete(id));
      profileLaunches.set(id,launch);
    }
    await launch;
    return true;
  });
  ipcMain.on("engine-input", (event, payload: { type?: string; x?: number; y?: number; button?: number; key?: string }) => {
    const entry = registry.byWebContentsId(event.sender.id);
    if (!entry) return;
    notifyRuntime("view.engineInput", { pageId: entry.pageId, ...payload });
    viewHooks.onTakeover(entry.pageId);
  });
  ipcMain.handle("api.invoke", async (event, method: string, params: unknown) => {
    const state = requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    if (!rendererMayInvoke(method)) throw new Error("This action is not available from the Aux window.");
    if (method === "pages.open" && params && typeof params === "object") params = { ...params, windowId: state.id };
    const requestedPageId = params && typeof params === "object" && "pageId" in params ? (params as { pageId?: unknown }).pageId : undefined;
    if (typeof requestedPageId === "string") {
      const entry = registry.get(requestedPageId);
      if (entry && (entry.windowId ?? PRIMARY_WINDOW_ID) !== state.id) throw new Error("That tab belongs to another Aux window.");
    }
    if (method === "workspaces.browsingMemory.record") {
      const entry = typeof requestedPageId === "string" ? registry.get(requestedPageId) : undefined;
      if (!entry || entry.popup || entry.runtimeOwned || !state.win.isFocused() || state.overlayOpen || state.stagePageId !== requestedPageId || !entry.view.getVisible()) return { recorded: false };
    }
    if (method === "downloads.remove") {
      const selection = MethodSchemas["downloads.remove"].parse(params);
      params = { ids: selection.ids.filter(id => !liveDownloads.has(id)) };
      if (!(params as { ids: string[] }).ids.length) return { removed: [] };
    }
    if (method === "tasks.importCommandEvidence") {
      const selection = EvidenceCommandSelectionParams.parse(params);
      const command = projectCommands.list(selection.projectId).find(record => record.commandId === selection.commandId);
      if (!command || command.state === "running" || command.state === "stopping") throw new Error("Select a finished local command result.");
      params = {...selection, command};
    }
    const result = await channel.call("api.invoke", { method, params, desktopUser: true }, 60_000);
    return scopeRuntimeResult(method, result, state);
  });
  ipcMain.handle('ui.registerCloudPreview',(event,url:unknown,token:unknown)=>{
    requireShellUi(event);
    if(typeof url!=='string'||typeof token!=='string'||token.length<32||token.length>256)throw new Error('Invalid protected preview session.');
    let parsed:URL;try{parsed=new URL(url);}catch{throw new Error('Invalid protected preview address.');}
    if(parsed.protocol!=='https:'||(!parsed.hostname.endsWith('.vercel.run')&&parsed.hostname!=='vercel.run')||parsed.username||parsed.password)throw new Error('Aux only registers protected Vercel Sandbox previews.');
    if(cloudPreviewTokens.size>=32&&!cloudPreviewTokens.has(parsed.origin))cloudPreviewTokens.delete(cloudPreviewTokens.keys().next().value!);
    cloudPreviewTokens.set(parsed.origin,token);return true;
  });

  ipcMain.handle("ui.windows", event => {
    const current = requireShellUi(event);
    return [...regularWindows.values()].filter(state => state.id !== current.id && !state.quickAsk).map(state => {
      const entries = registry.all().filter(entry => !entry.popup && !entry.runtimeOwned && (entry.windowId ?? PRIMARY_WINDOW_ID) === state.id);
      return { id: state.id, title: windowPageTitle(state), tabCount: entries.length };
    });
  });
  ipcMain.handle("ui.downloadsSnapshot", async event => {
    requireShellUi(event);
    if (channel) {
      const records = DownloadSchema.array().parse(await channel.call("api.invoke", { method: "downloads.list", params: {}, desktopUser: true }));
      for (const recovered of interruptedDownloadHistory(records, new Set(liveDownloads.keys()), desktopStartedAt)) {
        notifyRuntime("view.downloadFinished", recovered);
        broadcastToShells("download", recovered);
      }
    }
    return [...liveDownloads.values()].map(download => download.snapshot());
  });
  ipcMain.handle("ui.downloadFolder", event=>{requireShellUi(event);return downloadLocation.status();});
  ipcMain.handle('ui.tabAudio',event=>{const state=requireShellUi(event);return Object.fromEntries(registry.all().filter(entry=>(entry.windowId??PRIMARY_WINDOW_ID)===state.id&&entry.kind!=='engine'&&!entry.view.webContents.isDestroyed()).map(entry=>[entry.pageId,{muted:entry.view.webContents.isAudioMuted(),audible:entry.view.webContents.isCurrentlyAudible()}]));});
  ipcMain.handle('ui.setTabMuted',(event,pageId:unknown,muted:unknown)=>{
    const state=requireShellUi(event);const entry=requireOwnedEntry(state,pageId,'This tab is not available for audio control.');
    if(entry.kind==='engine'||typeof muted!=='boolean')throw new Error('This tab is not available for audio control.');
    entry.view.webContents.setAudioMuted(muted);
    viewHooks.onAudio(entry.pageId,{muted:entry.view.webContents.isAudioMuted(),audible:entry.view.webContents.isCurrentlyAudible()});
  });
  ipcMain.handle("ui.retryDownload", async (event,id:unknown)=>{
    requireShellUi(event);
    if(typeof id!=='string'||liveDownloads.has(id))throw new Error('Stop the active transfer before retrying.');
    if(!channel)throw new Error('Runtime not connected.');
    const records=DownloadSchema.array().parse(await channel.call('api.invoke',{method:'downloads.list',params:{},desktopUser:true}));
    const record=records.find(item=>item.id===id);
    const source=retrySource(record?.sourceUrl);
    if(!record||record.state==='completed'||!source)throw new Error('This download cannot be retried here. Start it again from the original page.');
    const folder=downloadLocation.status();if(folder.error)throw new Error(folder.error);
    if(liveDownloads.has(id))throw new Error('Stop the active transfer before retrying.');
    downloadsSession().downloadURL(source);
  });
  ipcMain.handle("ui.chooseDownloadFolder", async (event, reset:unknown)=>{
    const state=requireShellUi(event);if(reset===true)return downloadLocation.choose(null);
    const result=await dialog.showOpenDialog(state.win,{title:"Choose download folder",properties:["openDirectory","createDirectory"]});
    return result.canceled||!result.filePaths[0]?downloadLocation.status():downloadLocation.choose(result.filePaths[0]);
  });
  ipcMain.handle("ui.controlDownload", (event, id: unknown, action: unknown) => {
    requireShellUi(event);
    const download = typeof id === "string" ? liveDownloads.get(id) : undefined;
    controlDownload(download?.item, action);
    if (download && liveDownloads.has(id as string)) broadcastToShells("download", download.snapshot());
  });
  ipcMain.handle("ui.setStage", (event, pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null, radius?: number, ratio?: number) => {
    const state = requireShellUi(event);
    state.stageBounds = bounds;
    state.stagePageId = pageId;
    // `null` means the selected tab currently renders shell-owned content
    // (start page, settings, overview, or renderer bootstrap). It must not
    // erase that window's durable tab selection during a shell reload.
    if (pageId) state.focusedPageId = pageId;
    state.splitPageId = split ?? null;
    state.splitRatio = splitRatio(ratio);
    if (typeof radius === "number" && Number.isFinite(radius)) state.stageRadius = Math.max(0, Math.min(24, Math.round(radius)));
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.overlay", (event, open: boolean) => {
    const state = requireShellUi(event);
    state.overlayOpen = open;
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.toolbarOverlay", (event, open: unknown, ticket: unknown) => {
    const state = requireShellUi(event);
    const seq = typeof ticket === "number" && Number.isFinite(ticket) ? ticket : 0;
    if (seq < state.toolbarOverlaySeq) return false;
    state.toolbarOverlaySeq = seq;
    state.toolbarOverlay = open === true;
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.trafficLights", (event, visible: unknown) => {
    const state = requireShellUi(event);
    if (process.platform === "darwin") state.win.setWindowButtonVisibility(visible !== false);
    return true;
  });
  ipcMain.on("ui.pagePointer", (event, value: unknown) => {
    const state = stateForShell(event.sender.id);
    if (!state || event.senderFrame !== state.shellView.webContents.mainFrame) return;
    deliverPagePointer(state, value);
  });
  ipcMain.handle("ui.sidebarPeek", (event, open: unknown) => {
    const state = requireShellUi(event);
    state.sidebarPeek = open === true;
    state.win.contentView.addChildView(state.shellView);
    if (!state.sidebarPeek) {
      for (const pageId of [state.stagePageId, state.splitPageId]) {
        const entry = pageId ? registry.get(pageId) : undefined;
        if (entry && !entry.popup && (entry.windowId ?? PRIMARY_WINDOW_ID) === state.id) state.win.contentView.addChildView(entry.view);
      }
    }
    applyStage(state);
    return true;
  });
  ipcMain.handle("ui.focusShell", event => { requireShellUi(event).shellView.webContents.focus(); });
  ipcMain.handle("ui.watchPreview", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    if (typeof pageId !== "string") return false;
    if (state.previewWatch?.pageId === pageId) return true;
    clearPreviewWatch(state);
    let entry: ViewEntry;
    try { entry = requireOwnedEntry(state, pageId); } catch { return false; }
    if (entry.popup || entry.view.webContents.isDestroyed()) return false;
    const wasVisible = entry.view.getVisible();
    let stopped = false;
    state.previewWatch = { pageId, stop: () => { stopped = true; } };
    offscreen.beginPreview(pageId);
    try {
      await wakePage(entry);
      if (stopped) return false;
      if (event.sender.isDestroyed() || entry.view.webContents.isDestroyed()) { clearPreviewWatch(state); return false; }
      applyStage(state);
      if (!wasVisible) await new Promise(resolve => setTimeout(resolve, 180));
      if (stopped) return false;
      if (event.sender.isDestroyed() || entry.view.webContents.isDestroyed()) { clearPreviewWatch(state); return false; }
      const sender = event.sender;
      const stopLoop = startPreviewWatch({
        pageId,
        capture: () => entry.view.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true }),
        send: frame => { if (!sender.isDestroyed()) sender.send("preview-frame", frame); },
        stopped: () => stopped || sender.isDestroyed() || entry.view.webContents.isDestroyed(),
      });
      if (stopped || state.previewWatch === null) { stopLoop(); return false; }
      state.previewWatch = { pageId, stop: () => { stopped = true; stopLoop(); } };
      return true;
    } catch {
      if (state.previewWatch?.pageId === pageId) clearPreviewWatch(state);
      return false;
    }
  });
  ipcMain.handle("ui.unwatchPreview", (event, pageId: unknown) => {
    const state = requireShellUi(event);
    if (state.previewWatch && (typeof pageId !== "string" || state.previewWatch.pageId === pageId)) clearPreviewWatch(state);
    return true;
  });
  ipcMain.handle("ui.preview", async (event, pageId: string) => {
    const state = requireShellUi(event);
    let entry: ViewEntry;
    try { entry = requireOwnedEntry(state, pageId); } catch { return null; }
    const reveal = !entry.popup && !entry.view.getVisible();
    if (!entry.popup) offscreen.beginPreview(entry.pageId);
    try {
      await wakePage(entry);
      if (reveal) {
        applyStage(state);
        await new Promise(resolve => setTimeout(resolve, 180));
      }
      const img = await entry.view.webContents.capturePage(undefined, { stayHidden: true, stayAwake: true });
      if (img.isEmpty()) return null;
      const size = img.getSize();
      return img.resize({ width: Math.max(320, Math.min(640, Math.round(size.width * 0.5))) }).toDataURL();
    } catch {
      return null;
    } finally {
      // Hide only when this preview was the last reason the page stayed laid out.
      if (!entry.popup && offscreen.endPreview(entry.pageId)) applyStage(state);
    }
  });
  ipcMain.handle("ui.contextMenu", (event, pageId: string | null) => {
    const state = requireShellUi(event);
    const entry = pageId ? requireOwnedEntry(state, pageId) : undefined;
    const wc = entry?.view.webContents;
    // page context → nav + edit + inspect on the page; chrome/input context
    // (null pageId) → edit roles on the focused shell + inspect the shell
    const template: Electron.MenuItemConstructorOptions[] = wc
      ? [
          { label: "Back", enabled: wc.navigationHistory.canGoBack(), click: () => wc.goBack() },
          { label: "Forward", enabled: wc.navigationHistory.canGoForward(), click: () => wc.goForward() },
          { label: "Reload", click: () => wc.reload() },
          { type: "separator" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Open DevTools", click: () => wc.openDevTools({ mode: "detach" }) },
        ]
      : [
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          { role: "selectAll" },
          { type: "separator" },
          { label: "Inspect", click: () => state.shellView.webContents.openDevTools({ mode: "detach" }) },
        ];
    Menu.buildFromTemplate(template).popup();
    return true;
  });
  ipcMain.handle("ui.openExternal", (event, url: unknown) => {
    requireShellUi(event);
    if (!isWebUrl(url)) return false;
    return shell.openExternal(url).then(() => true);
  });
  ipcMain.handle("ui.savePagePdf", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    if (typeof pageId !== "string") throw new Error("Select a browser page to export.");
    const entry=requireOwnedEntry(state,pageId);
    return savePagePdf(entry.view.webContents, state.win, false, entry.showBlankDocument);
  });
  ipcMain.handle("ui.print", (event, pageId: string) => {const entry=requireOwnedEntry(requireShellUi(event),pageId);return printPage(entry.view.webContents,entry.showBlankDocument);});
  ipcMain.handle("ui.devTools", (event, pageId: string) => {
    requireOwnedEntry(requireShellUi(event), pageId).view.webContents.openDevTools({ mode: "detach" });
    return true;
  });
  ipcMain.handle("ui.navigationMenu",(event,pageId:string,direction:unknown)=>{
    const entry=requireOwnedEntry(requireShellUi(event),pageId);
    if(direction!=="back"&&direction!=="forward")throw new Error("Choose a history direction.");
    return showNavigationMenu(entry.view.webContents,direction);
  });
  ipcMain.handle("ui.hardReload", (event, pageId: string) => {
    requireOwnedEntry(requireShellUi(event), pageId).view.webContents.reloadIgnoringCache();
    return true;
  });
  ipcMain.handle("ui.closeWindow", event => {
    requireShellUi(event).win.close();
    return true;
  });
  ipcMain.handle("ui.selectRepository", async event => {
    const state=requireShellUi(event);
    const result = await dialog.showOpenDialog(state.win, { title: "Select a local repository", properties: ["openDirectory"] });
    return result.canceled || !result.filePaths[0] ? null : localProjects.select(result.filePaths[0]);
  });
  ipcMain.handle("ui.createProject", (event, id: string) => { requireShellUi(event); return localProjects.create(id); });
  ipcMain.handle("ui.createBlankProject", (event, name: string) => { requireShellUi(event); return localProjects.createBlank(name); });
  ipcMain.handle("ui.listProjects", event => { requireShellUi(event); return localProjects.list(); });
  ipcMain.handle("ui.inspectProject", (event, id: string) => { requireShellUi(event); return localProjects.inspect(id); });
  ipcMain.handle("ui.checkLocalPreview", (event, id: string, url: string) => { requireShellUi(event); return localProjects.checkPreview(id,url); });
  ipcMain.handle("ui.listProjectFiles", async (event, id: string) => { requireShellUi(event); return (await localProjects.files(id)).files; });
  ipcMain.handle("ui.readProjectFile", (event, id: string, name: string) => { requireShellUi(event); return projectFiles.read(id,name); });
  ipcMain.handle("ui.createProjectFile", async (event, id: string, name: string) => {
    requireShellUi(event);
    if(projectCommands.list(id).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before creating a file.");
    if(savingProjects.has(id))throw new Error("A file is already being saved in this project.");
    savingProjects.add(id);
    try{return await projectFiles.create(id,name);}finally{savingProjects.delete(id);}
  });
  ipcMain.handle("ui.projectFileHistory", (event, id: string, name: string) => { requireShellUi(event); return projectFiles.history(id,name); });
  ipcMain.handle("ui.readProjectFileVersion", (event, id: string, name: string, versionId: string) => { requireShellUi(event); return projectFiles.readVersion(id,name,versionId); });
  ipcMain.handle("ui.saveProjectFile", async (event, id: string, name: string, hash: string, content: string) => {
    requireShellUi(event);
    if(projectCommands.list(id).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before saving a file.");
    if(savingProjects.has(id))throw new Error("A file is already being saved in this project.");
    savingProjects.add(id);
    try{return await projectFiles.save(id,name,hash,content);}finally{savingProjects.delete(id);}
  });
  ipcMain.handle("ui.renameProjectFile", async (event, id: string, name: string, nextName: string, hash: string) => {
    requireShellUi(event);
    if(projectCommands.list(id).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before renaming a file.");
    if(savingProjects.has(id))throw new Error("A file is already being changed in this project.");
    savingProjects.add(id);
    try{return await projectFiles.move(id,name,nextName,hash);}finally{savingProjects.delete(id);}
  });
  ipcMain.handle("ui.deleteProjectFile", async (event, id: string, name: string, hash: string) => {
    const state=requireShellUi(event);
    if(projectCommands.list(id).some(command=>['running','stopping'].includes(command.state)&&(command.mode!=='service'||command.state==='stopping')))throw new Error("Stop the project's command before deleting a file.");
    if(savingProjects.has(id))throw new Error("A file is already being changed in this project.");
    const file=await projectFiles.read(id,name);
    if(file.sha256!==hash)throw new Error('The file changed outside Aux. Reload it before deleting.');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Delete checkout file',message:`Delete ${name} from this isolated checkout?`,detail:'Aux will retain a recovery copy outside the Git working tree. The original repository checkout is not changed.',buttons:['Cancel','Delete file'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;
    savingProjects.add(id);
    try{return await projectFiles.remove(id,name,hash);}finally{savingProjects.delete(id);}
  });
  ipcMain.handle("ui.openProjectFileExternal", async (event, id: string, name: string, context: unknown) => {
    requireShellUi(event);if(!channel)throw new Error('Runtime not connected');const selection=ProjectCommandContextSchema.parse(context);
    const details=await channel.call('api.invoke',{method:'tasks.get',params:{taskId:selection.taskId},desktopUser:true}) as {task:unknown};const task=TaskSchema.parse(details.task);
    if(task.revision!==selection.expectedRevision)throw new Error('The task revision changed. Reopen it before editing outside Aux.');
    if(!task.resources.some(resource=>resource.kind==='repository'&&resource.projectId===id))throw new Error('Attach this checkout to the current task before editing outside Aux.');
    const path=await projectFiles.externalPath(id,name);const error=await shell.openPath(path);
    if(error)throw new Error(`Couldn’t open this file in its default app: ${error}`);return true;
  });
  ipcMain.handle("ui.prepareProjectReview", async (event, id: string, context: unknown) => {
    requireShellUi(event);if(!channel)throw new Error('Runtime not connected');const selection=ProjectCommandContextSchema.parse(context);
    const details=await channel.call('api.invoke',{method:'tasks.get',params:{taskId:selection.taskId},desktopUser:true}) as {task:unknown};const task=TaskSchema.parse(details.task);
    if(task.revision!==selection.expectedRevision)throw new Error('The task revision changed. Reopen it before preparing delivery.');
    if(!task.resources.some(resource=>resource.kind==='repository'&&resource.projectId===id))throw new Error('Attach this checkout to the current task before preparing delivery.');
    const inspection=await localProjects.inspect(id);
    return localProjects.writeReviewSummary(id,inspection,projectCommands.list(id),{taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,workspaceId:task.workspaceId});
  });
  ipcMain.handle("ui.commitProject", async (event, id: string, input: unknown, context: unknown) => {
    const state=requireShellUi(event);if(!channel)throw new Error('Runtime not connected');const request=ProjectCommitRequestSchema.parse(input);const selection=ProjectCommandContextSchema.parse(context);
    const currentTask=async()=>{const details=await channel!.call('api.invoke',{method:'tasks.get',params:{taskId:selection.taskId},desktopUser:true}) as {task:unknown};const task=TaskSchema.parse(details.task);if(task.revision!==selection.expectedRevision)throw new Error('The task revision changed. Reopen it before creating a commit.');if(!task.resources.some(resource=>resource.kind==='repository'&&resource.projectId===id))throw new Error('Attach this checkout to the current task before creating a commit.');return task;};
    if(projectCommands.list(id).some(command=>command.state==='running'||command.state==='stopping'))throw new Error('Stop local commands and services before creating a commit.');
    if(savingProjects.has(id))throw new Error('Wait for the file change before creating a commit.');
    const task=await currentTask();const reviewContext={taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,workspaceId:task.workspaceId};const inspected=await localProjects.inspect(id);
    const review=await localProjects.writeReviewSummary(id,inspected,projectCommands.list(id),reviewContext);
    if(review.readiness.state!=='ready'||review.patch.sha256!==request.expectedPatchHash||review.snapshotTree!==request.expectedTree)throw new Error('The prepared handoff changed. Prepare it again before creating a commit.');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Create local commit',message:`Create a commit on ${inspected.project.branch}?`,detail:`Task: ${task.title} · Revision ${task.revision}\nBranch: ${inspected.project.branch}\n\n${request.message}\n\nAuthor: ${request.authorName} <${request.authorEmail}>\nPatch: ${request.expectedPatchHash}\n\nThis creates one local commit in Aux’s isolated checkout. It does not push, publish, or open a pull request. Repository hooks, commit signing, credential helpers, and network protocols are disabled.`,buttons:['Cancel','Create local commit'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;const refreshed=await currentTask();
    if(refreshed.revision!==task.revision||projectCommands.list(id).some(command=>command.state==='running'||command.state==='stopping')||savingProjects.has(id))throw new Error('The task or checkout changed. Review the commit again.');
    return localProjects.commit(id,request,projectCommands.list(id),reviewContext);
  });
  ipcMain.handle("ui.listProjectCommands", (event, id: string) => { requireShellUi(event); return projectCommands.list(id); });
  ipcMain.handle("ui.stopProjectCommand", (event, projectId: string, id: string) => { requireShellUi(event); return projectCommands.stop(projectId,id); });
  ipcMain.handle("ui.stopProjectServiceStack",(event,projectId:string,stackId:string)=>{requireShellUi(event);return projectCommands.stopStack(projectId,stackId);});
  ipcMain.handle("ui.runProjectCommand", async (event, id: string, input: string, context: unknown, requestedMode: unknown) => {
    const state=requireShellUi(event);
    const command = ProjectCommandSchema.shape.command.parse(input);
    const mode = ProjectCommandSchema.shape.mode.parse(requestedMode);
    const selection = ProjectCommandContextSchema.parse(context);
    if(!channel)throw new Error('Runtime not connected');
    const prepare=async()=>TaskSchema.parse(await channel!.call('api.invoke',{method:'tasks.prepareLocalCommand',params:{...selection,projectId:id},desktopUser:true}));
    const reviewed=await prepare();
    const inspected = await localProjects.inspect(id);
    const answer = await dialog.showMessageBox(state.win, {type:"warning",title:mode==="service"?"Start local service":"Run local command",message:mode==="service"?"Keep this service running in the isolated checkout?":"Run this command in the isolated checkout?",
      detail: "Task: " + reviewed.title + " · Revision " + reviewed.revision + "\n\n" + command + "\n\nWorking directory: " + inspected.project.path + "\n\nThis is not a sandbox. The command can change local files and access the network. Aux uses a separate HOME and does not supply model credentials. Output is saved locally. " + (mode==="service"?"This local service keeps running until you stop it or quit Aux. Files can be edited while it runs.":"This command stops after 10 minutes or when Aux quits."),
      buttons:["Cancel",mode==="service"?"Start service":"Run command"],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;
    const current = await localProjects.inspect(id);
    if(savingProjects.has(id))throw new Error("Wait for the file save before starting a command.");
    const task=await prepare();
    if(savingProjects.has(id))throw new Error("Wait for the file save before starting a command.");
    return projectCommands.start(current.project,command,{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId},mode);
  });
  ipcMain.handle("ui.runProjectServiceStack",async(event,id:string,input:unknown,context:unknown)=>{
    const state=requireShellUi(event);const request=ProjectServiceStackRequestSchema.parse(input);const selection=ProjectCommandContextSchema.parse(context);
    if(!channel)throw new Error('Runtime not connected');
    const prepare=async()=>TaskSchema.parse(await channel!.call('api.invoke',{method:'tasks.prepareLocalCommand',params:{...selection,projectId:id},desktopUser:true}));
    const reviewed=await prepare();const inspected=await localProjects.inspect(id);
    const ordered=request.commands.map((command,index)=>`${index+1}. ${command}`).join('\n');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Start local service stack',message:`Start ${request.commands.length} services in this checkout?`,detail:`Task: ${reviewed.title} · Revision ${reviewed.revision}\n\n${ordered}\n\nWorking directory: ${inspected.project.path}\n\nAux starts these commands in the shown order and keeps separate output for each. If a service fails, the remaining stack stops. This is not a sandbox: commands can change files and access the network. Aux uses a separate HOME and does not supply model credentials.`,buttons:['Cancel','Start services'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;if(savingProjects.has(id))throw new Error('Wait for the file save before starting services.');
    const current=await localProjects.inspect(id);const task=await prepare();if(savingProjects.has(id))throw new Error('Wait for the file save before starting services.');
    return projectCommands.startStack(current.project,request.commands,{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId},request.label);
  });
  ipcMain.handle("ui.pickEvidenceImage", async event => {
    const state = requireShellUi(event);
    const result = await dialog.showOpenDialog(state.win, { title: "Choose an image", properties: ["openFile"],
      filters: [{ name: "Images (up to 16 MB)", extensions: ["png", "jpg", "jpeg", "webp"] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    return readEvidenceImage(result.filePaths[0]);
  });
  ipcMain.handle("ui.pickEvidenceDocument", async event => {
    const state=requireShellUi(event);
    const result = await dialog.showOpenDialog(state.win, { title: "Attach a document", properties: ["openFile"],
      filters: [{ name: "Documents", extensions: ["txt", "md", "csv", "json", "docx", "xlsx", "pdf"] }, { name: "PDF, Word & Excel (up to 16 MB)", extensions: ["pdf", "docx", "xlsx"] }, { name: "Text documents (up to 512 KB)", extensions: ["txt", "md", "csv", "json"] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    return readEvidenceDocument(result.filePaths[0]);
  });
  ipcMain.handle("ui.openFile", async event => {
    const state=requireShellUi(event);
    const r = await dialog.showOpenDialog(state.win, { title: "Open File", properties: ["openFile"] });
    return r.canceled || r.filePaths.length === 0 ? null : r.filePaths[0];
  });
  ipcMain.handle("ui.revealPath", (event, p: unknown) => {
    requireShellUi(event);
    if (typeof p !== "string" || !p) return false;
    shell.showItemInFolder(p);
    return true;
  });
  ipcMain.handle("ui.openPath", async (event, p: unknown) => {
    requireShellUi(event);
    if (typeof p !== "string" || !p) return "";
    return shell.openPath(p);
  });
  ipcMain.handle("ui.saveWorkbook",(event,content:unknown,format:unknown)=>{const state=requireShellUi(event);return saveWorkbookSnapshot(state.win,content,false,format);});
  ipcMain.handle("ui.saveFile", async (event, name: string, content: string) => {
    const state=requireShellUi(event);
    if (typeof name !== "string" || typeof content !== "string") throw new Error("Invalid export content");
    const leaf = basename(name);
    const safeName = leaf && leaf !== "." && leaf !== ".." ? leaf : "export";
    const r = await dialog.showSaveDialog(state.win, { defaultPath: join(app.getPath("downloads"), safeName) });
    if (r.canceled || !r.filePath) return null;
    try { await writeFile(r.filePath, content, "utf8"); }
    catch { throw new Error("Couldn’t save the export. Choose a writable destination and try again."); }
    return r.filePath;
  });
  ipcMain.handle('ui.saveCloudExport',async(event,sourcePath:unknown,suggestedName:unknown)=>{
    const state=requireShellUi(event);const root=resolve(DATA_DIR,'cloud-exports');
    if(typeof sourcePath!=='string'||typeof suggestedName!=='string')throw new Error('Invalid cloud export.');
    let source:string;try{source=realpathSync(sourcePath);}catch{throw new Error('The cloud export is no longer available.');}
    const rel=relative(realpathSync(root),source);const stat=lstatSync(source);if(rel==='..'||rel.startsWith(`..${sep}`)||stat.isSymbolicLink()||!stat.isFile()||stat.size>100*1024*1024)throw new Error('The cloud export is outside Aux storage or too large.');
    const safeName=basename(suggestedName).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,180)||'aux-cloud-workspace.tar.gz';
    try{const result=await dialog.showSaveDialog(state.win,{title:'Save cloud workspace',defaultPath:join(app.getPath('downloads'),safeName),filters:[{name:'Compressed archive',extensions:['gz']} ]});if(result.canceled||!result.filePath)return null;await copyFile(source,result.filePath);return result.filePath;}finally{await rm(source,{force:true});}
  });
  ipcMain.handle('ui.saveStoredArtifact',async(event,artifactId:unknown,suggestedName:unknown)=>{
    const state=requireShellUi(event);if(!channel||typeof artifactId!=='string'||typeof suggestedName!=='string'||artifactId.length>200)throw new Error('Invalid saved artifact request.');
    const value=await channel.call('api.invoke',{method:'artifacts.read',params:{artifactId},desktopUser:true},30_000) as {artifact?:{artifactId?:string;size?:number};dataBase64?:string};
    if(value.artifact?.artifactId!==artifactId||typeof value.artifact.size!=='number'||value.artifact.size>25*1024*1024||typeof value.dataBase64!=='string')throw new Error('The saved artifact is unavailable or too large.');
    const data=Buffer.from(value.dataBase64,'base64');if(data.length!==value.artifact.size)throw new Error('The saved artifact failed integrity validation.');
    const safeName=basename(suggestedName).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,180)||'aux-task-artifact';const result=await dialog.showSaveDialog(state.win,{title:'Save preserved task artifact',defaultPath:join(app.getPath('downloads'),safeName)});if(result.canceled||!result.filePath)return null;await writeFile(result.filePath,data);return result.filePath;
  });
  ipcMain.handle("app.dataDir", event => { requireShellUi(event); return DATA_DIR; });
  ipcMain.handle('app.exportDiagnostics',async event=>{
    const state=requireShellUi(event);
    const invoke=async(method:string,params:Record<string,unknown>={})=>{if(!channel)return null;try{return await channel.call('api.invoke',{method,params,desktopUser:true},15_000);}catch{return null;}};
    const [runtime,settings,workspaces,runs,pages]=await Promise.all([invoke('runtime.describe'),invoke('settings.get'),invoke('workspaces.list'),invoke('runs.list',{limit:500}),invoke('pages.list',{includeDetached:true})]);
    const workspaceList=Array.isArray(workspaces)?workspaces:[];const taskGroups=await Promise.all(workspaceList.map(item=>{const workspaceId=item&&typeof item==='object'&&'workspaceId' in item?(item as {workspaceId?:unknown}).workspaceId:undefined;return typeof workspaceId==='string'?invoke('tasks.list',{workspaceId,includeArchived:true,limit:500}):null;}));
    const report=buildDiagnosticReport({appVersion:app.getVersion(),packaged:app.isPackaged,platform:process.platform,arch:process.arch,versions:{electron:process.versions.electron,chrome:process.versions.chrome,node:process.versions.node},runtimeConnected:!!channel&&runtimeReady,runtime,settings,workspaces:workspaceList,tasks:taskGroups.flatMap(value=>Array.isArray(value)?value:[]),runs:Array.isArray(runs)?runs:[],pages:Array.isArray(pages)?pages:[],extensions:extensionManager.list(profileSession()),regularWindows:regularWindows.size,health:browserHealth.summary()});
    const result=await dialog.showSaveDialog(state.win,{title:'Save Aux support report',defaultPath:join(app.getPath('downloads'),`aux-support-${new Date().toISOString().slice(0,10)}.json`),filters:[{name:'JSON report',extensions:['json']}]});
    if(result.canceled||!result.filePath)return null;try{await writeFile(result.filePath,JSON.stringify(report,null,2)+'\n',{encoding:'utf8',mode:0o600});chmodSync(result.filePath,0o600);return result.filePath;}catch{throw new Error('Couldn’t save the support report. Choose a writable destination and try again.');}
  });
  ipcMain.handle('app.exportRuntimeBackup',async event=>{
    const state=requireShellUi(event);if(!channel)throw new Error('The Aux runtime is not connected.');const backup=await channel.call('api.invoke',{method:'installation.createBackup',params:{},desktopUser:true},120_000) as {path:string;createdAt:number;bytes:number;schemaVersion:number;sha256:string;artifactFiles:number;missingArtifacts:number};const root=realpathSync(join(DATA_DIR,'backups')),source=realpathSync(backup.path),rel=relative(root,source),info=lstatSync(source);if(rel==='..'||rel.startsWith(`..${sep}`)||info.isSymbolicLink()||!info.isDirectory())throw new Error('The runtime returned an invalid backup folder.');const result=await dialog.showOpenDialog(state.win,{title:'Choose where to save the Aux recovery folder',defaultPath:app.getPath('downloads'),properties:['openDirectory','createDirectory']});if(result.canceled||!result.filePaths[0])return null;const parent=resolve(result.filePaths[0]),dataRelative=relative(resolve(DATA_DIR),parent);if(!dataRelative||(dataRelative!=='..'&&!dataRelative.startsWith(`..${sep}`)&&!isAbsolute(dataRelative)))throw new Error('Choose a folder outside the active Aux data directory.');const destination=join(parent,`Aux Task Data Backup ${new Date(backup.createdAt).toISOString().replace(/[:.]/g,'-')}`);await cp(source,destination,{recursive:true,errorOnExist:true,force:false});return{path:destination,bytes:backup.bytes,sha256:backup.sha256,artifactFiles:backup.artifactFiles,missingArtifacts:backup.missingArtifacts};
  });
  ipcMain.handle('app.stageRuntimeRestore',async event=>{
    const state=requireShellUi(event);if(!channel)throw new Error('The Aux runtime is not connected.');const selected=await dialog.showOpenDialog(state.win,{title:'Choose an Aux task data backup folder',properties:['openDirectory']});if(selected.canceled||!selected.filePaths[0])return null;const decision=await dialog.showMessageBox(state.win,{type:'warning',title:'Restore Aux task data on next launch?',message:'Replace Aux runtime data after you quit and reopen?',detail:'This restores tasks, conversations, evidence, browsing records, runtime preferences and available durable artifact files from the selected recovery folder. It does not restore website cookies, saved browser sign-ins, extensions, downloads, local project files, cloud resources or encrypted credentials. Aux keeps a recovery copy of the current runtime database. Continue using Aux only if you are comfortable that later runtime changes will be replaced on the next launch.',buttons:['Cancel','Stage restore'],defaultId:0,cancelId:0,noLink:true});if(decision.response!==1)return null;return channel.call('api.invoke',{method:'installation.stageRestore',params:{path:selected.filePaths[0]},desktopUser:true},120_000);
  });
  ipcMain.handle('app.cancelRuntimeRestore',async event=>{requireShellUi(event);if(!channel)throw new Error('The Aux runtime is not connected.');return channel.call('api.invoke',{method:'installation.cancelRestore',params:{},desktopUser:true});});
  ipcMain.handle('app.runtimeRestoreStatus',event=>{requireShellUi(event);return runtimeRestoreStatus(DATA_DIR);});
  ipcMain.handle('app.healthSummary',event=>{requireShellUi(event);return browserHealth.summary();});
  ipcMain.handle('app.clearHealth',event=>{requireShellUi(event);return browserHealth.clear();});
  ipcMain.handle("app.agentConnections", async event => {
    requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    return channel.call("api.invoke", { method: "agentConnections.list", params: {}, desktopUser: true });
  });
  ipcMain.handle('app.agentClients',event=>{requireShellUi(event);return detectAgentClients();});
  ipcMain.handle("app.revokeAgentConnection", async (event, connectionId: unknown) => {
    requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    return channel.call("api.invoke", { method: "agentConnections.revoke", params: { connectionId }, desktopUser: true });
  });
  ipcMain.handle("app.extensions", event => {
    requireShellUi(event);
    return extensionManager.list(profileSession());
  });
  ipcMain.handle("app.installUnpackedExtension", async event => {
    const state = requireShellUi(event);
    const selected = await dialog.showOpenDialog(state.win, { title: "Choose an unpacked Chrome extension", properties: ["openDirectory"] });
    if (selected.canceled || !selected.filePaths[0]) return null;
    return extensionManager.install(selected.filePaths[0], profileSession(), async details => {
      const permissionDetail = details.permissions.length ? details.permissions.join("\n") : "No permissions declared in the manifest.";
      const { response } = await dialog.showMessageBox(state.win, {
        type: "warning",
        title: "Install unpacked extension?",
        message: `${details.name} ${details.version}`,
        detail: `Extensions can read or change browser data according to their manifest. Aux installs the reviewed copy in this profile.\n\nDeclared access:\n${permissionDetail}`,
        buttons: ["Cancel", "Install extension"],
        defaultId: 0,
        cancelId: 0,
        noLink: true,
      });
      return response === 1;
    });
  });
  ipcMain.handle("app.updateUnpackedExtension", async (event, key: unknown) => {
    const state = requireShellUi(event);
    if (typeof key !== "string") throw new Error("Invalid extension.");
    const selected = await dialog.showOpenDialog(state.win, { title: "Choose the updated extension folder", properties: ["openDirectory"] });
    if (selected.canceled || !selected.filePaths[0]) return null;
    return extensionManager.update(key, selected.filePaths[0], profileSession(), async details => {
      const added = details.addedPermissions.length ? details.addedPermissions.join("\n") : "No additional declared access.";
      const declared = details.permissions.length ? details.permissions.join("\n") : "No permissions declared.";
      const decision = await dialog.showMessageBox(state.win, {
        type: "warning", title: "Update extension?", message: `${details.name}: ${details.fromVersion} → ${details.version}`,
        detail: `Aux will replace its installed copy. ${details.enabled ? "The extension will restart; reload affected pages if needed." : "The extension will remain disabled."}\n\nAdditional declared access:\n${added}\n\nAll declared access:\n${declared}`,
        buttons: ["Cancel", "Update extension"], defaultId: 0, cancelId: 0, noLink: true,
      });
      return decision.response === 1;
    });
  });
  ipcMain.handle("app.setExtensionEnabled", async (event, key: unknown, enabled: unknown) => {
    requireShellUi(event);
    if (typeof key !== "string" || typeof enabled !== "boolean") throw new Error("Invalid extension state.");
    return extensionManager.setEnabled(key, enabled, profileSession());
  });
  ipcMain.handle("app.removeExtension", async (event, key: unknown) => {
    const state = requireShellUi(event);
    if (typeof key !== "string") throw new Error("Invalid extension.");
    const extension = extensionManager.list(profileSession()).find(item => item.key === key && item.managed);
    if (!extension) throw new Error("The extension is no longer installed.");
    const { response } = await dialog.showMessageBox(state.win, {
      type: "warning",
      title: "Remove extension?",
      message: `Remove ${extension.name}?`,
      detail: "Aux will delete its managed copy and the extension’s profile data may remain until browser data is cleared.",
      buttons: ["Cancel", "Remove extension"],
      defaultId: 0,
      cancelId: 0,
      noLink: true,
    });
    return response === 1 ? extensionManager.remove(key, profileSession()) : false;
  });
  ipcMain.handle("app.agentConfig", async (event, input: unknown) => {
    requireShellUi(event);
    if (!channel) throw new Error("runtime not connected");
    const entry = app.isPackaged ? join(process.resourcesPath, "mcp", "aux-mcp.mjs") : join(import.meta.dirname, "..", "mcp", "aux-mcp.mjs");
    if (!existsSync(entry)) throw new Error("The MCP bridge is missing. Rebuild the desktop application.");
    const created = await channel.call("api.invoke", { method: "agentConnections.create", params: input, desktopUser: true }) as {connection:{scope:{kind:string;workspaceId:string;taskId?:string}};token:string};
    return { command: process.execPath, args: [entry], connection: created.connection,
      env: { ELECTRON_RUN_AS_NODE: "1", AUX_DATA_DIR: DATA_DIR, AUX_MCP_TOOL_PREFIX: "aux", AUX_MCP_TOKEN: created.token,
        AUX_MCP_SCOPE_KIND: created.connection.scope.kind, AUX_MCP_WORKSPACE_ID: created.connection.scope.workspaceId,
        ...(created.connection.scope.taskId ? { AUX_MCP_TASK_ID: created.connection.scope.taskId } : {}) } };
  });
  ipcMain.handle("app.clearSiteData", async (event, pageId: unknown) => {
    const state=requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId);
    if (entry.kind === "engine") throw new Error("This browser tab is no longer available.");
    const wc = entry.view.webContents;
    const url = new URL(wc.getURL());
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error("Choose an HTTP or HTTPS website.");
    const origin = url.origin;
    const { response } = await dialog.showMessageBox(state.win, {
      type: "warning", title: "Clear website data", message: `Clear cookies and stored data for ${origin}?`,
      detail: "This can sign you out and remove locally saved work. Cookies for related subdomains are also cleared. Bookmarks, history and saved permission decisions remain. Other open pages for this site can recreate data; reload them after clearing.",
      buttons: ["Cancel", "Clear website data"], defaultId: 0, cancelId: 0, noLink: true,
    });
    if (response !== 1) return false;
    if (registry.get(entry.pageId) !== entry || wc.isDestroyed() || new URL(wc.getURL()).origin !== origin) throw new Error("The tab changed while confirmation was open. Choose the website again.");
    await wc.session.clearData({ origins: [origin], originMatchingMode: "origin-in-all-contexts",
      dataTypes: ['cookies', 'localStorage', 'indexedDB', 'fileSystems', 'serviceWorkers', 'webSQL'] });
    return true;
  });
  ipcMain.handle("app.siteInfo", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    const entry = requireOwnedEntry(state, pageId);
    if (entry.kind === "engine") throw new Error("Site controls are available for browser tabs.");
    const wc = entry.view.webContents;
    const url = new URL(wc.getURL());
    if (!["http:", "https:"].includes(url.protocol)) throw new Error("Site controls are available for HTTP and HTTPS websites.");
    const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
    const cookies = await wc.session.cookies.get({ url: url.href });
    if (wc.isDestroyed() || registry.get(entry.pageId) !== entry || wc.getURL() !== url.href) throw new Error("The page changed. Open site controls again.");
    return {
      pageId: entry.pageId, url: url.href, origin: url.origin, title: wc.getTitle(),
      security: url.protocol === "https:" ? "secure" : local ? "local" : "insecure",
      cookieCount: cookies.length,
      permissions: { ...sitePermissions[url.origin] },
    };
  });
  ipcMain.handle("ui.readArticle", async (event, pageId: unknown) => {
    const state = requireShellUi(event);
    const entry = typeof pageId === "string" ? requireOwnedEntry(state, pageId) : undefined;
    if (!entry || entry.kind === "engine") throw new Error("Open a webpage to use Reader view.");
    return readArticle(entry.view.webContents, () => registry.get(entry.pageId) === entry);
  });
  ipcMain.handle("app.siteZoom", (event, origin?: unknown) => {
    requireShellUi(event);
    if (origin !== undefined) {
      if (typeof origin !== "string") throw new Error("Choose a saved website size.");
      siteZoom.reset(origin);
      for (const entry of registry.all()) {
        const contents = entry.view.webContents;
        if (entry.kind === "engine" || contents.isDestroyed()) continue;
        try { if (new URL(contents.getURL()).origin === origin) siteZoom.apply(contents, origin); } catch {}
      }
      broadcastToShells("site-zoom-changed", {});
    }
    return siteZoom.list();
  });
  ipcMain.handle("app.sitePermissions", event => { requireShellUi(event); return sitePermissions; });
  ipcMain.handle("app.privacy", event => { requireShellUi(event); return { trackerBlock: privacy.trackerBlock, blocked: blockedRequests }; });
  ipcMain.handle("app.setTrackerBlock", (event, enabled: unknown) => {
    requireShellUi(event);
    if (typeof enabled !== "boolean") throw new Error("Choose whether tracker blocking is on or off.");
    savePrivacy({ ...privacy, trackerBlock: enabled });
    return { trackerBlock: privacy.trackerBlock, blocked: blockedRequests };
  });
  ipcMain.handle("app.proceedInsecure", (event, url: unknown) => {
    requireShellUi(event);
    if (typeof url !== "string") throw new Error("An HTTPS address is required.");
    insecureBypass.proceed(url);
    return true;
  });
  ipcMain.handle("app.clearSitePermission", (event, origin: unknown, permission?: unknown) => {
    requireShellUi(event);
    if (typeof origin !== "string" || !sitePermissions[origin]) return false;
    const next = { ...sitePermissions };
    if (typeof permission === "string") {
      next[origin] = { ...next[origin] };
      delete next[origin][permission];
      if (Object.keys(next[origin]).length === 0) delete next[origin];
    } else {
      delete next[origin];
    }
    saveSitePermissions(next);
    return true;
  });
  ipcMain.handle("ui.setAppearance", (event, theme: unknown, translucent: unknown, windowControls: unknown, material: unknown) => {
    requireShellUi(event);
    const nativeMaterial = SidebarMaterialSchema.default("liquid-glass").parse(material);
    if (process.platform === "darwin") for (const state of regularWindows.values()) state.win.setWindowButtonVisibility(windowControls !== false);
    applyAppearance(theme === "system" ? "system" : theme === "light" ? "light" : "dark", translucent === true, nativeMaterial);
    return true;
  });
}

// ---------- downloads ----------
const liveDownloads = new Map<string, { item: Electron.DownloadItem; snapshot: () => import("@vector/contracts").Download }>();

function wireDownloads() {
  downloadsSession().on("will-download", (event, item, webContents) => {
    const entry = registry.byWebContentsId(webContents?.id ?? -1);
    const filename = item.getFilename();
    const sourceUrl = retrySource(item.getURLChain()[0] ?? item.getURL());
    let savePath:string;
    try{savePath=downloadLocation.destination(filename);}catch(error){
      event.preventDefault();
      const failed={id:`dl_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,pageId:entry?.pageId,sourceUrl,filename,path:"",size:0,state:"interrupted",startedAt:Date.now(),endedAt:Date.now(),canResume:false,canCancel:false};
      notifyRuntime("view.downloadFinished",failed);broadcastToShells("download",failed);
      return;
    }
    item.setSavePath(savePath);
    const dl = {
      id: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pageId: entry?.pageId,
      filename,
      sourceUrl,
      path: savePath,
      size: 0,
      totalBytes: item.getTotalBytes() > 0 ? item.getTotalBytes() : undefined,
      startedAt: Date.now(),
    };
    const snapshot = (): import("@vector/contracts").Download => ({
      ...dl, state: item.getState(), size: item.getReceivedBytes(),
      totalBytes: item.getTotalBytes() || undefined, paused: item.isPaused(),
      canResume: item.canResume(), canCancel: true,
    });
    liveDownloads.set(dl.id, { item, snapshot });
    notifyRuntime("view.downloadStarted", { ...snapshot(), state: "started" });
    broadcastToShells("download", { ...snapshot(), state: "started" });
    item.on("updated", () => broadcastToShells("download", snapshot()));
    item.once("done", (_e, state) => {
      liveDownloads.delete(dl.id);
      const final = { ...dl, state, size: item.getReceivedBytes(), paused: false, canResume: false, canCancel: false, endedAt: Date.now() };
      notifyRuntime("view.downloadFinished", final);
      broadcastToShells("download", final);
    });
  });
}

// ---------- popup windows (window.open with window features) ----------

// ---------- boot ----------

const QUICK_ASK_ACCELERATOR = "CommandOrControl+Shift+Space";
const quickAskPreferences = join(DATA_DIR,"quick-ask.json");
let quickAskShortcutEnabled = false, quickAskShortcutError = "";
try { quickAskShortcutEnabled = JSON.parse(readFileSync(quickAskPreferences,"utf8")).enabled === true; } catch {}
function quickAskShortcutStatus() { return {enabled:quickAskShortcutEnabled,registered:globalShortcut.isRegistered(QUICK_ASK_ACCELERATOR),error:quickAskShortcutError}; }
function configureQuickAskShortcut(enabled:boolean, persist=true) {
  const previouslyEnabled=quickAskShortcutEnabled, previouslyRegistered=globalShortcut.isRegistered(QUICK_ASK_ACCELERATOR);
  if(enabled && !globalShortcut.isRegistered(QUICK_ASK_ACCELERATOR)) {
    if(!globalShortcut.register(QUICK_ASK_ACCELERATOR,()=>{void openQuickAsk().catch(error=>log("Quick Ask could not open",String(error)));})) {
      quickAskShortcutError="This shortcut is unavailable, possibly because another app is using it.";
      throw new Error(quickAskShortcutError);
    }
  }
  if(!enabled)globalShortcut.unregister(QUICK_ASK_ACCELERATOR);
  quickAskShortcutEnabled=enabled;quickAskShortcutError="";
  if(persist)try{const temp=`${quickAskPreferences}.tmp`;writeFileSync(temp,JSON.stringify({enabled}),{mode:0o600});renameSync(temp,quickAskPreferences);}
  catch(error){
    quickAskShortcutEnabled=previouslyEnabled;
    if(!previouslyRegistered)globalShortcut.unregister(QUICK_ASK_ACCELERATOR);
    else if(!globalShortcut.isRegistered(QUICK_ASK_ACCELERATOR))globalShortcut.register(QUICK_ASK_ACCELERATOR,()=>{void openQuickAsk().catch(reason=>log(String(reason)));});
    quickAskShortcutError="The shortcut preference could not be saved.";throw new Error(quickAskShortcutError,{cause:error});
  }
  return quickAskShortcutStatus();
}

let openingQuickAsk: Promise<RegularWindowState> | null = null;
async function openQuickAsk() {
  const existing = [...regularWindows.values()].find(state => state.quickAsk);
  if (existing) { existing.win.show(); existing.win.focus(); existing.shellView.webContents.focus(); return; }
  if (!openingQuickAsk) openingQuickAsk = createRegularWindow(`quick-${randomUUID()}`, true);
  try { const state = await openingQuickAsk; state.win.show(); state.win.focus(); state.shellView.webContents.focus(); }
  finally { openingQuickAsk = null; }
}

async function createRegularWindow(id = `window-${randomUUID()}`, quickAsk = false): Promise<RegularWindowState> {
  const existing = regularWindows.get(id);
  if (existing) { existing.win.show(); existing.win.focus(); return existing; }
  const { theme, translucent, material } = readStoredAppearance();
  requestedGlass = translucent;
  requestedMaterial = material;
  nativeTheme.themeSource = theme;
  const glass = translucent && !nativeTheme.prefersReducedTransparency && process.platform === "darwin";
  const backgroundColor = glass ? "#00000000" : WINDOW_BG[nativeTheme.shouldUseDarkColors ? "dark" : "light"];
  const regularWindow = new BaseWindow({
    width: quickAsk ? 580 : 1440, height: quickAsk ? 500 : 960, minWidth: quickAsk ? 420 : 900, minHeight: quickAsk ? 360 : 640,
    backgroundColor: quickAsk ? "#00000000" : backgroundColor,
    // CSS and WebContentsView alpha also need a transparent native window.
    transparent: process.platform === "darwin",
    visualEffectState: "active",
    show: !quickAsk,
    // A square system shadow sits outside the rounded panel. The panel draws its own.
    hasShadow: quickAsk ? false : undefined,
    title: `${quickAsk ? "Ask Aux" : "Aux"} — ${currentProfileName}`, titleBarStyle: "hiddenInset", trafficLightPosition: quickAsk ? { x: 30, y: 26 } : { x: 16, y: 18 }, roundedCorners: true,
  });
  const regularShell = new WebContentsView({ webPreferences: {
    preload: join(import.meta.dirname, "..", "preload", "index.cjs"),
    additionalArguments: [`--aux-window-id=${encodeURIComponent(id)}`, ...(quickAsk ? ["--aux-quick-ask"] : [])],
    contextIsolation: true, sandbox: true, nodeIntegration: false,
  }});
  regularShell.setBackgroundColor(quickAsk ? "#00000000" : backgroundColor);
  const state: RegularWindowState = { id, quickAsk, win: regularWindow, shellView: regularShell, overlayOpen: false, sidebarPeek: false, toolbarOverlay: false, toolbarOverlaySeq: 0, paintedFill: backgroundColor, chromeOnTop: false,
    stageBounds: null, stagePageId: null, focusedPageId: null, splitPageId: null, splitRatio: .5, stageRadius: 0, closeApproved: false, previewWatch: null };
  toolbarEdges.set(id, attachToolbarEdgeWatch(regularWindow, regularShell.webContents, () => ({
    page: !!state.stagePageId && !state.overlayOpen,
    stage: state.stageBounds,
  })));
  regularWindows.set(id, state);
  if (id === PRIMARY_WINDOW_ID || !win || !shellView) { win = regularWindow; shellView = regularShell; }

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const isShellUrl = (url: string) => isShellDocument(url, join(import.meta.dirname, "..", "renderer", "index.html"), devUrl);
  regularShell.webContents.on("will-navigate", (event, url) => {
    if (!isShellUrl(url)) { event.preventDefault(); log("blocked shell navigation to", url); }
  });
  regularShell.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) viewHooks.openAsTab(url, { windowId: id });
    return { action: "deny" };
  });
  regularWindow.contentView.addChildView(regularShell);
  if (!quickAsk) setWindowMaterial(regularWindow, glass ? material : null);
  const layout = () => {
    const { width, height } = regularWindow.getContentBounds();
    regularShell.setBounds({ x: 0, y: 0, width, height });
    applyStage(state);
  };
  regularWindow.on("resize", layout);
  layout();
  if (devUrl) await regularShell.webContents.loadURL(devUrl);
  else await regularShell.webContents.loadFile(join(import.meta.dirname, "..", "renderer", "index.html"));
  void regularShell.webContents.executeJavaScript(`document.documentElement.dataset.theme = ${JSON.stringify(theme)}`);
  if (desktopEnv.AUX_DEVTOOLS === "1") regularShell.webContents.openDevTools({ mode: "detach" });
  regularWindow.on("focus", () => {
    if (state.focusedPageId) notifyRuntime("view.windowFocused", {pageId: state.focusedPageId, windowId: state.id});
  });
  regularWindow.on("close", event => {
    if (exitApproved || state.closeApproved) return;
    event.preventDefault();
    if (state.quickAsk && [...regularWindows.values()].some(window => !window.quickAsk)) { state.win.hide(); return; }
    if ([...regularWindows.values()].filter(window => !window.quickAsk).length <= 1) void requestExit();
    else void requestRegularWindowClose(state);
  });
  regularWindow.on("closed", () => {
    state.previewWatch?.stop();
    if (state.previewWatch) offscreen.forget(state.previewWatch.pageId);
    state.previewWatch = null;
    toolbarEdges.get(id)?.stop();
    toolbarEdges.delete(id);
    regularWindows.delete(id);
    if (win === regularWindow || shellView === regularShell) {
      const next = regularWindows.values().next().value as RegularWindowState | undefined;
      win = next?.win ?? null;
      shellView = next?.shellView ?? null;
    }
  });
  return state;
}

async function boot() {
  const cdpPort = readCdpPort();
  runtimeCdpPort = cdpPort;
  log("cdp port", cdpPort);
  try {
    writeFileSync(join(DATA_DIR, CDP_PORT_FILE), String(cdpPort), { mode: 0o600 });
    chmodSync(join(DATA_DIR, CDP_PORT_FILE), 0o600);
  } catch {
    /* non-POSIX fs */
  }

  await loadProfileExtensions();

  await createRegularWindow(PRIMARY_WINDOW_ID);
  if(quickAskShortcutEnabled)try{configureQuickAskShortcut(true,false);}catch(error){log(String(error));}
  browserHealth.start();
  // The runtime is supervised independently from native page views. Start it
  // only after the primary owner exists so restored native pages have a host.
  startRuntimeProcess();
  configurePagePermissions();
  configureCloudPreviewHeaders();

  wireRendererIpc();
  wireDownloads();
  installMenu();
  powerMonitor.on("resume", () => {
    if (!runtimeReady || !channel) return scheduleRuntimeRestart(0);
    void channel.call("api.invoke", { method: "workspace.get", params: {}, desktopUser: true }, 10_000).catch(() => {
      runtimeProcess?.kill("SIGTERM");
    });
  });
  shellReady = true;
  void flushExternalUrls();

}

function installMenu() {
  // The internal app.name stays stable for Electron encrypted storage.
  const iconPath = process.env.VITE_DEV_SERVER_URL
    ? join(app.getAppPath(), "renderer/public/aux-icon.png")
    : join(import.meta.dirname, "../renderer/aux-icon.png");
  app.setAboutPanelOptions({ applicationName: "Aux", applicationVersion: app.getVersion(), iconPath });
  if (process.platform === "darwin" && !app.isPackaged) app.dock?.setIcon(iconPath);
  // Browser commands route through the same shortcut dispatcher the keyboard
  // uses — one code path, correct regardless of which view holds focus. The
  // menu's accelerator consumes the key before the focused webContents, so the
  // click handler routes popup-owned commands locally and main-shell commands
  // to the renderer. Independent sign-in windows must not mutate the main tab.
  const send = (key: string, opt: { shift?: boolean; alt?: boolean; ctrl?: boolean } = {}) => () =>
    {
      const shortcut = { key, meta: !opt.ctrl, shift: !!opt.shift, alt: !!opt.alt, ctrl: !!opt.ctrl };
      const focused = BaseWindow.getFocusedWindow();
      const popup = registry.all().find(entry => entry.popup === focused)?.popup;
      if (!popup || !popupCommand(popup, shortcut)) focusedRegularWindow()?.shellView.webContents.send("shortcut", shortcut);
    };
  const cmd = (label: string, key: string, accelerator: string, opt: { shift?: boolean; alt?: boolean; ctrl?: boolean } = {}) =>
    ({ label, accelerator, click: send(key, opt) }) satisfies Electron.MenuItemConstructorOptions;

  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: "Aux",
      submenu: [
        { role: "about", label: "About Aux" },
        { type: "separator" },
        { role: "hide", label: "Hide Aux" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: "Quit Aux" },
      ],
    },
    {
      label: "File",
      submenu: [
        { label: "Quick Ask", accelerator: "CmdOrCtrl+Shift+Space", click: () => { void openQuickAsk().catch(error => log("Quick Ask could not open", String(error))); } },
        { id: "new-window", label: "New Window", accelerator: "CmdOrCtrl+N", click: () => { void createRegularWindow(); } },
        cmd("New Tab", "t", "CmdOrCtrl+T"),
        { id: "new-private-window", label: "New Private Window", accelerator: "CmdOrCtrl+Shift+N", click: openPrivateWindow },
        cmd("Open File…", "o", "CmdOrCtrl+O"),
        cmd("Reopen Closed Tab", "t", "CmdOrCtrl+Shift+T", { shift: true }),
        { type: "separator" },
        cmd("Close Tab", "w", "CmdOrCtrl+W"),
        { label: "Close Window", accelerator: "CmdOrCtrl+Shift+W", click: () => (BaseWindow.getFocusedWindow() ?? win)?.close() },
        { type: "separator" },
        cmd("Print…", "p", "CmdOrCtrl+P"),
        cmd("Save Page as PDF…", "p", "CmdOrCtrl+Shift+P", { shift: true }),
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "pasteAndMatchStyle" },
        { role: "selectAll" },
        { type: "separator" },
        cmd("Find…", "f", "CmdOrCtrl+F"),
        cmd("Find Next", "g", "CmdOrCtrl+G"),
        cmd("Find Previous", "g", "CmdOrCtrl+Shift+G", { shift: true }),
      ],
    },
    {
      label: "View",
      submenu: [
        cmd("Reload", "r", "CmdOrCtrl+R"),
        cmd("Hard Reload", "r", "CmdOrCtrl+Shift+R", { shift: true }),
        { type: "separator" },
        cmd("Actual Size", "0", "CmdOrCtrl+0"),
        cmd("Zoom In", "=", "CmdOrCtrl+="),
        cmd("Zoom Out", "-", "CmdOrCtrl+-"),
        { type: "separator" },
        cmd("Reader View", "r", "CmdOrCtrl+Alt+R", { alt: true }),
        cmd("Toggle Sidebar", "s", "CmdOrCtrl+S"),
        cmd("Tab Overview", "o", "CmdOrCtrl+Shift+O", { shift: true }),
        { type: "separator" },
        cmd("Developer Tools", "i", "CmdOrCtrl+Alt+I", { alt: true }),
        cmd("View Source", "u", "CmdOrCtrl+Alt+U", { alt: true }),
        { type: "separator" },
        { role: "togglefullscreen" },
      ],
    },
    {
      label: "Navigate",
      submenu: [
        cmd("Back", "[", "CmdOrCtrl+["),
        cmd("Forward", "]", "CmdOrCtrl+]"),
        { type: "separator" },
        cmd("Select Next Tab", "right", "CmdOrCtrl+Alt+Right", { alt: true }),
        cmd("Select Previous Tab", "left", "CmdOrCtrl+Alt+Left", { alt: true }),
        { type: "separator" },
        cmd("History", "y", "CmdOrCtrl+Y"),
        cmd("Downloads", "j", "CmdOrCtrl+Shift+J", { shift: true }),
        { type: "separator" },
        cmd("Bookmark This Page", "d", "CmdOrCtrl+D"),
        cmd("Bookmark All Tabs", "d", "CmdOrCtrl+Shift+D", { shift: true }),
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "zoom" }, { type: "separator" }, { role: "front" }],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function notifyHttpAuthChanged() {
  for (const state of regularWindows.values()) {
    if (!state.shellView.webContents.isDestroyed()) state.shellView.webContents.send('http-auth-changed');
  }
}
installHttpAuth({
  owner: contents => {
    const entry = registry.byWebContentsId(contents.id);
    return entry ? entry.windowId ?? PRIMARY_WINDOW_ID : null;
  },
  requireShell: event => requireShellUi(event).id,
  changed: notifyHttpAuthChanged,
});

app.whenReady().then(boot).then(()=>{if(process.connected)process.send?.({type:"aux-profile-ready",profileId:browserProfiles.currentId},()=>{});}).catch((e) => {
  console.error("boot failed:", e);
  app.exit(1);
});

let exitApproved = false;
let exitPending = false;
const closingRegularWindows = new Set<string>();

async function requestRegularWindowClose(state: RegularWindowState) {
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

async function requestExit(includePrivateWindows = false) {
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
  // the forked runtime gets SIGTERM via process tree teardown; make it explicit
  try {
    channel?.notify("app.quitting");
  } catch {
    /* already gone */
  }
});

app.on("will-quit", () => cancelDictation());
