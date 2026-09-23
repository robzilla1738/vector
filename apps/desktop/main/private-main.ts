import { saveWorkbookSnapshot } from "./save-workbook.js";
import { trafficLights } from "./traffic-lights.js";
import { showNavigationMenu } from "./navigation-menu.js";
import { splitRatio as normalizeSplitRatio, splitWidths } from "@aux/contracts/split-layout";
import { DEFAULT_SEARCH_ENGINE } from "@aux/contracts/search-engine";
import { SiteZoomPreferences } from "./site-zoom.js";
import { installSitePermissions } from "./site-permissions.js";
import { installRequestPolicy } from "./request-policy.js";
import { TRACKER_HOSTS } from "./tracker-hosts.js";
import { FilterLists } from "./filter-lists.js";
import { applyCosmetic, installCosmeticFilter } from "./cosmetic-filter.js";
import { HttpsFirst } from "./https-first.js";
import { createInsecureBypass } from "./insecure-bypass.js";
import { confirmDownload, downloadWarning } from "./download-guard.js";
import { offerExternalLink } from "./external-links.js";
import { wirePageFullscreen, fullscreenContents, exitPageFullscreen } from "./page-fullscreen.js";
import { pageShortcut } from "./page-shortcuts.js";
import { installNavGesture } from "./native-views.js";
import { attachToolbarEdgeWatch } from "./toolbar-edge-watch.js";
import { recolorToolbarGlass, syncToolbarGlass } from "./toolbar-glass.js";
import { boundsContaining, cssCursor, inputEventFor, readPagePointer } from "./page-pointer.js";
/**
 * Aux private browser process.
 *
 * This entry deliberately has no runtime child, CDP switch, target marker,
 * persistent Chromium partition, tab snapshot, history database, agent bridge or
 * extension loader. It reuses the real Aux renderer and tab/sidebar behavior over
 * a small in-memory page service.
 */
import { app, BaseWindow, dialog, ipcMain, Menu, nativeTheme, session, shell, WebContentsView } from "electron";
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Download, HistoryEntry, PageTarget, AuxEvent } from "@aux/contracts";
import { showPageMenu } from "./page-menu.js";
import { installHttpAuth } from "./http-auth.js";
import { printPage, savePagePdf } from "./page-output.js";
import { approveWindowUnload } from "./window-unload.js";
import { isShellDocument } from "./shell-origin.js";
import { controlDownload } from "./download-control.js";
import { retrySource } from "./download-retry.js";
import { PageFinder } from "./page-find.js";
import { readArticle } from "./read-article.js";
import { PrivateBookmarks } from "./private-bookmarks.js";
import { applyTranslationsScript, extractTextsScript, restoreOriginalScript, translateBubbleScript } from "./page-translate.js";
import { setPageZoom } from "./page-zoom.js";
import { startPreviewWatch } from "./preview-watch.js";
import { TabCatalog } from "./tabs/catalog.js";
import { TabController, type TabPorts } from "./tabs/controller.js";
const siteZoom = new SiteZoomPreferences();
import { MethodSchemas } from "@aux/contracts";
import type { TabPatch, TabRecord } from "@aux/contracts";

const scratch = mkdtempSync(join(tmpdir(), "aux-private-process-"));
const userData = join(scratch, "user-data");
mkdirSync(userData, { recursive: true, mode: 0o700 });
app.setPath("userData", userData);
app.setPath("sessionData", userData);
app.setName("Aux Private");

let win: BaseWindow | null = null;
let shellView: WebContentsView | null = null;
let activePageId: string | null = null;
let stagePageId: string | null = null;
let splitPageId: string | null = null;
let splitRatio = .5;
let stageBounds: {x:number;y:number;width:number;height:number} | null = null;
let toolbarEdge: ReturnType<typeof attachToolbarEdgeWatch> | null = null;
let stageRadius = 0;
let overlayOpen = false;
let toolbarOverlay = false;
let toolbarOverlaySeq = 0;
let shellFill = "#1c1c1e";
let chromeOnTop = false;
let exitApproved = false;
let exitPending = false;
let preparedExit: { invalidated: boolean; cleanup: () => void } | null = null;
let seq = 0;
let bootReadyResolve: (() => void) | null = null;
const bootReady = new Promise<void>(resolve => { bootReadyResolve = resolve; });

type PrivatePage = { target: PageTarget; view: WebContentsView };
const pages = new Map<string, PrivatePage>();

// ---------- tab catalog: the shared controller inside this process (§7.2) ----------
// Private mode reuses the same implementation as regular windows but keeps it
// fully in memory — no persistence worker, no history cache for closed tabs.
const PRIVATE_WINDOW_ID = "main"; // the private shell's single window id
const tabCatalog = new TabCatalog();
function broadcastTabPatch(patch: TabPatch) {
  if (!shellView || shellView.webContents.isDestroyed()) return;
  shellView.webContents.send("tabs.patch", patch);
}
function privateTabRecord(page: PrivatePage, generation = 0, createdAt = page.target.createdAt): TabRecord {
  const wc = page.view.webContents;
  const t = page.target;
  return {
    pageId: t.pageId, windowId: PRIVATE_WINDOW_ID,
    url: t.url, title: t.title, favicon: t.favicon,
    loading: t.loading === true,
    muted: !wc.isDestroyed() && wc.isAudioMuted(), audible: !wc.isDestroyed() && wc.isCurrentlyAudible(),
    canGoBack: !wc.isDestroyed() && wc.navigationHistory.canGoBack(), canGoForward: !wc.isDestroyed() && wc.navigationHistory.canGoForward(),
    popup: false, crashed: t.viewStatus === "crashed",
    ...(t.navigationError ? { navigationError: t.navigationError } : {}),
    runtimeOwned: false, generation, createdAt, lastActiveAt: t.lastActiveAt,
  };
}
function notePrivateTab(page: PrivatePage) {
  const current = tabCatalog.tab(page.target.pageId);
  if (!current) return;
  broadcastTabPatch(tabCatalog.apply([{ op: "upsert", tab: privateTabRecord(page, current.generation, current.createdAt) }]));
}
/** Opens that did not come through a typed command publish their own catalog op. */
function announcePrivateOpen(page: PrivatePage, activate: boolean) {
  broadcastTabPatch(tabCatalog.apply([
    { op: "upsert", tab: privateTabRecord(page, tabCatalog.nextGeneration(page.target.pageId)) },
    { op: "window", window: { windowId: PRIVATE_WINDOW_ID, order: [...pages.keys()], activePageId: activate ? page.target.pageId : activePageId } },
  ]));
}
/** Controller-driven closes — forgetPage must not race a second remove patch. */
const controllerClosing = new Set<string>();

const history: HistoryEntry[] = [];
const bookmarks = new PrivateBookmarks();
const downloads: Download[] = [];
const pageFinder = new PageFinder();
const liveDownloads = new Map<string, { item: Electron.DownloadItem; update(): void }>();
let permissionDecisions: Record<string,Record<string,"allow"|"deny">> = {};
const testUnloadResponses = (process.env.AUX_PRIVATE_TEST_UNLOAD_RESPONSES ?? "").split(",").map(Number).filter(value=>value===0||value===1);
// Blocking config arrives read-only from the regular process. Exceptions
// chosen inside private mode live only in this process's memory and die with
// it — they never reach privacy.json.
const privateDataDir = process.env.AUX_PRIVATE_DATA_DIR ?? "";
const privateFilterLists = privateDataDir ? new FilterLists(privateDataDir) : null;
let privateTrackerBlock = process.env.AUX_PRIVATE_TRACKER_BLOCK !== "0";
let privateBlockedCount = 0;
const privateAllowed = new Set((process.env.AUX_PRIVATE_ALLOWED ?? "").split(",").map(host => host.trim().toLowerCase()).filter(Boolean));
let privateBlockedHosts = new Set<string>(TRACKER_HOSTS);
const privateHttpsFirst = new HttpsFirst();
privateHttpsFirst.enabled = process.env.AUX_PRIVATE_HTTPS_UPGRADE !== "0";
const privateInsecureBypass = createInsecureBypass();
/** Lists parse off-thread; the built-in seed applies until they swap in. */
let privateHostsGeneration = 0;
function refreshPrivateBlockedHosts() {
  const generation = ++privateHostsGeneration;
  void privateFilterLists?.loadHostsOffThread().then(hosts => {
    if (generation !== privateHostsGeneration) return;
    const next = new Set(TRACKER_HOSTS);
    for (const host of hosts) next.add(host);
    privateBlockedHosts = next;
  }).catch(() => { /* the built-in seed still applies */ });
}
refreshPrivateBlockedHosts();
function privateTrackersAllowed(hostname: string): boolean {
  let host = hostname.toLowerCase();
  while (host) {
    if (privateAllowed.has(host)) return true;
    const dot = host.indexOf(".");
    if (dot < 0) break;
    host = host.slice(dot + 1);
  }
  return false;
}
function privateApplyCosmeticAll() {
  for (const page of pages.values()) {
    try { applyCosmetic(page.view.webContents, privateTrackerBlock && !privateTrackersAllowed(new URL(page.view.webContents.getURL()).hostname)); }
    catch { /* page mid-navigation */ }
  }
}
const testReportPath=process.env.AUX_PRIVATE_TEST_REPORT;
const testControlEvents:string[]=[];
function writeTestReport(){if(testReportPath){const temporary=`${testReportPath}.tmp`;writeFileSync(temporary,JSON.stringify({pid:process.pid,userData,remoteDebugging:app.commandLine.hasSwitch("remote-debugging-port"),pageSessionPersistent:session.fromPartition(`aux-private-pages-${process.pid}`).isPersistent(),controlEvents:testControlEvents}),{mode:0o600});renameSync(temporary,testReportPath);}}
function recordTestControl(event:string){if(!testReportPath)return;testControlEvents.push(event);writeTestReport();}

function webUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try { return ["http:","https:"].includes(new URL(value).protocol); } catch { return false; }
}
function pageUrl(value: unknown): value is string {
  if (value === "about:blank") return true;
  if (typeof value !== "string") return false;
  if (value.startsWith("view-source:")) return webUrl(value.slice(12));
  try { return ["http:","https:","file:"].includes(new URL(value).protocol); } catch { return false; }
}
function requireShell(event: Electron.IpcMainInvokeEvent) {
  if (!shellView || shellView.webContents.isDestroyed() || event.sender.id !== shellView.webContents.id) throw new Error("Untrusted private-shell request");
}
function send(type: AuxEvent["type"], payload: Record<string,unknown>) {
  if (!shellView || shellView.webContents.isDestroyed()) return;
  shellView.webContents.send("event", { seq: ++seq, ts: Date.now(), type, payload });
}
function snapshot(page: PrivatePage): PageTarget {
  const wc = page.view.webContents;
  if (!wc.isDestroyed()) {
    page.target = { ...page.target, loading: wc.isLoading(), canGoBack: wc.navigationHistory.canGoBack(), canGoForward: wc.navigationHistory.canGoForward() };
  }
  return { ...page.target };
}
function sendPage(page: PrivatePage, active = false) {
  send("page.updated", { page: snapshot(page), ...(active ? {activePageId: page.target.pageId} : {}) });
  notePrivateTab(page);
}
function applyStage(focus = false) {
  if (!win || win.isDestroyed()) return;
  const bounds = stageBounds ?? win.getContentBounds();
  let fullscreen=fullscreenContents(win);
  if(fullscreen && (overlayOpen || pages.get(stagePageId??"")?.view.webContents!==fullscreen)) {
    exitPageFullscreen(win);fullscreen=undefined;
  }
  if(fullscreen) {
    const size=win.getContentBounds();
    for(const page of pages.values()) {
      const shown=page.view.webContents===fullscreen;
      page.view.setVisible(shown);
      if(shown){page.view.setBounds({x:0,y:0,width:size.width,height:size.height});page.view.setBorderRadius(0);win.contentView.addChildView(page.view);}
    }
    toolbarEdge?.sync();
    syncToolbarGlass("private", [], false, nativeTheme.shouldUseDarkColors, nativeTheme.prefersReducedTransparency);
    return;
  }
  const visible = (id: string | null) => {
    const page=id?pages.get(id):undefined;
    return page && !page.view.webContents.isDestroyed() && page.target.viewStatus!=="crashed" && !page.target.navigationError && (page.target.url!=="about:blank" || page.target.showBlankDocument) ? page : undefined;
  };
  const primary = !overlayOpen ? visible(stagePageId) : undefined;
  const companion = primary && splitPageId!==stagePageId ? visible(splitPageId) : undefined;
  for (const page of pages.values()) {
    const shown = page===primary || page===companion;
    const rounded = page.view as WebContentsView & {setBorderRadius?(radius:number):void};
    try { rounded.setBorderRadius?.(stageRadius); } catch { /* platform support varies */ }
    const widths=splitWidths(bounds.width,splitRatio);
    page.view.setBounds(companion && shown
      ? {x:bounds.x+(page===companion?widths.left+widths.gutter:0),y:bounds.y,width:page===companion?widths.right:widths.left,height:bounds.height}
      : bounds);
    page.view.setVisible(shown);
    if (page.target.viewStatus!=="crashed") page.target={...page.target,viewStatus:shown?"visible":"hidden"};
  }
  if(focus && primary)primary.view.webContents.focus();
  if(shellView){
    const fill=toolbarOverlay?"#00000000":"#1c1c1e";
    if(shellFill!==fill){shellFill=fill;shellView.setBackgroundColor(fill);}
    if(toolbarOverlay){
      chromeOnTop=true;
      win.contentView.addChildView(shellView);
    }else if(chromeOnTop){
      chromeOnTop=false;
      for(const id of [stagePageId, splitPageId]){
        const page=id?pages.get(id):undefined;
        if(page?.view.getVisible())win.contentView.addChildView(page.view);
      }
    }
  }
  toolbarEdge?.sync();
  const open = [primary, companion].flatMap(page => page && !page.view.webContents.isDestroyed() ? [page.view.webContents] : []);
  syncToolbarGlass("private", open, toolbarOverlay, nativeTheme.shouldUseDarkColors, nativeTheme.prefersReducedTransparency);
}

function activate(pageId: string, viaController = false) {
  const page = pages.get(pageId);
  if (!page) throw new Error("Private tab not found");
  activePageId = pageId;
  stagePageId = pageId;
  page.target = {...page.target,lastActiveAt:Date.now()};
  applyStage(true);
  if (!viaController) broadcastTabPatch(tabCatalog.apply([{ op: "window", window: { windowId: PRIVATE_WINDOW_ID, order: [...pages.keys()], activePageId: pageId } }]));
  sendPage(page, true);
  return snapshot(page);
}
function wirePage(page: PrivatePage) {
  const wc = page.view.webContents;
  wirePageFullscreen(wc,()=>win?{window:win,canEnter:()=>!overlayOpen&&stagePageId===page.target.pageId,changed:()=>applyStage()}:undefined);
  wc.on("will-navigate",(event,url)=>{if(offerExternalLink(wc,stagePageId===page.target.pageId?win??undefined:undefined,url))event.preventDefault();});
  wc.on("context-menu",(_event,params)=>showPageMenu(wc,params,{
    openAsTab:(url,referrer)=>{void openPage(url,true,referrer).catch(()=>{});},
    onAudio:()=>shellView?.webContents.send("view.audio",{pageId:page.target.pageId,muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()}),
    translatePage:()=>{void runPrivatePageTranslate(page.target.pageId).catch(error=>shellView?.webContents.send("translation-changed",{pageId:page.target.pageId,error:error instanceof Error?error.message:String(error)}));},
    translateSelection:(text,x,y)=>{void runPrivateSelectionTranslate(page,text,x,y).catch(error=>shellView?.webContents.send("translation-changed",{pageId:page.target.pageId,error:error instanceof Error?error.message:String(error)}));},
  }));
  wc.on("cursor-changed",(_event,type)=>{if(toolbarOverlay)shellView?.webContents.send("page-cursor",cssCursor(type));});
  wc.on("before-input-event",(event,input)=>{
    const shortcut=pageShortcut(input);
    if(!shortcut)return;
    event.preventDefault();
    if(win)exitPageFullscreen(win);
    shellView?.webContents.send("shortcut",shortcut);
  });
  wc.once("destroyed",()=>forgetPage(page));
  installNavGesture(wc,dir=>{(dir==="back"?tabPorts.back:tabPorts.forward)(page.target.pageId);});
  installCosmeticFilter(wc,{filtered:host=>privateTrackerBlock&&!privateTrackersAllowed(host)});
  wc.setWindowOpenHandler(({url,disposition,referrer}) => {
    if(offerExternalLink(wc,stagePageId===page.target.pageId?win??undefined:undefined,url))return {action:"deny"};
    if (url !== "about:blank" && !webUrl(url)) return {action:"deny"};
    // Background native tab creation can deadlock Electron; defer that path.
    if (disposition === "background-tab") {
      setImmediate(()=>{if(win&&!win.isDestroyed())void openPage(url,false,referrer).catch(()=>{});});
      return {action:"deny"};
    }
    return {action:"allow",createWindow:options=>{
      const childContents=(options as typeof options & {webContents?:Electron.WebContents}).webContents;
      const view=new WebContentsView({webContents:childContents,webPreferences:{...options.webPreferences,session:session.fromPartition(`aux-private-pages-${process.pid}`,{cache:false}),sandbox:true,contextIsolation:true,nodeIntegration:false}});
      void view.webContents.setVisualZoomLevelLimits(1,3).catch(()=>{});
      const child=createPage(view,url,true);
      // Adopt Chromium's child unchanged so opener, POST data and blank redirects survive.
      setImmediate(()=>{
        if(view.webContents.isDestroyed())return;
        if(!win||win.isDestroyed()){view.webContents.close({waitForBeforeUnload:false});return;}
        win.contentView.addChildView(view);
        announcePrivateOpen(child, true);
        send("page.added",{page:snapshot(child),activePageId:child.target.pageId});
        activate(child.target.pageId);
      });
      return view.webContents;
    }};
  });
  wc.on("will-prevent-unload", event => {
    const response = testUnloadResponses.length ? testUnloadResponses.shift()! : win ? dialog.showMessageBoxSync(win,{type:"warning",title:"Leave website?",message:"Leave this private page?",detail:"Changes you made may not be saved.",buttons:["Stay","Leave"],defaultId:0,cancelId:0,noLink:true}) : 0;
    recordTestControl(`unload-prompt:${response}`);
    if (response === 1) event.preventDefault();
  });
  wc.on("did-start-navigation",(_event,_url,_inPlace,isMainFrame)=>{if(isMainFrame){page.target={...page.target,loading:true,navigationError:null,error:undefined,viewStatus:"hidden"};applyStage();sendPage(page);}});
  wc.on("did-fail-load",(_event,code,message,url,isMainFrame)=>{if(isMainFrame&&code!==-3){page.target={...page.target,url,title:"Page couldn’t load",loading:false,navigationError:{url,code,message,upgradedFrom:privateHttpsFirst.httpFallback(url,code)}};sendPage(page);}});
  wc.on("did-navigate",(_event,url)=>{siteZoom.apply(wc,url);page.target={...page.target,url,title:wc.getTitle()||url,documentEpoch:page.target.documentEpoch+1,loading:false,navigationError:null};if(privatePageTranslations.delete(page.target.pageId))shellView?.webContents.send("translation-changed",{pageId:page.target.pageId,lang:null,count:0});if(url!=="about:blank")history.unshift({url,title:page.target.title,pageId:page.target.pageId,visitedAt:Date.now()});sendPage(page);});
  wc.on("did-navigate-in-page",(_event,url)=>{page.target={...page.target,url,documentEpoch:page.target.documentEpoch+1};sendPage(page);});
  wc.on("page-title-updated",(_event,title)=>{page.target={...page.target,title};sendPage(page);});
  wc.on("page-favicon-updated",(_event,icons)=>{page.target={...page.target,favicon:icons[0]};sendPage(page);});
  wc.on("did-start-loading",()=>{page.target={...page.target,loading:true};shellView?.webContents.send("view.loading",{pageId:page.target.pageId,loading:true});sendPage(page);});
  wc.on("did-stop-loading",()=>{page.target={...page.target,loading:false};shellView?.webContents.send("view.loading",{pageId:page.target.pageId,loading:false});sendPage(page);});
  wc.on("render-process-gone",()=>{page.target={...page.target,viewStatus:"crashed",loading:false,error:"The renderer process crashed."};notePrivateTab(page);send("page.crashed",{pageId:page.target.pageId});});
  const audio=()=>{shellView?.webContents.send("view.audio",{pageId:page.target.pageId,muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()});notePrivateTab(page);};
  wc.on("audio-state-changed",audio);wc.on("dom-ready",audio);
}
function createPage(view: WebContentsView, url: string, showBlankDocument = false, pageId = `private-${randomUUID()}`): PrivatePage {
  const now=Date.now();
  const page:PrivatePage={view,target:{pageId,backend:"aux",targetId:pageId,url,showBlankDocument,title:url==="about:blank"?"New Tab":url,documentEpoch:0,lastRevision:0,viewStatus:"hidden",controller:"none",controllerEpoch:0,ownedByRuntime:false,createdAt:now,lastActiveAt:now,loading:url!=="about:blank",canGoBack:false,canGoForward:false,routeReason:"private-process"}};
  pages.set(pageId,page);
  wirePage(page);
  return page;
}
async function openPage(url = "about:blank", activateNow = true, referrer?: Electron.Referrer, opts?: { pageId?: string; viaController?: boolean }) {
  if (!pageUrl(url)) throw new Error("Private browsing supports web pages and explicitly opened local files.");
  if (!win) throw new Error("Private window unavailable");
  const view=new WebContentsView({webPreferences:{session:session.fromPartition(`aux-private-pages-${process.pid}`,{cache:false}),contextIsolation:true,sandbox:true,nodeIntegration:false,spellcheck:true}});
  void view.webContents.setVisualZoomLevelLimits(1,3).catch(()=>{});
  const page=createPage(view,url,false,opts?.pageId), pageId=page.target.pageId;
  win.contentView.addChildView(view);applyStage();
  if (!opts?.viaController) announcePrivateOpen(page, activateNow);
  send("page.added",{page:snapshot(page),...(activateNow?{activePageId:pageId}:{})});
  if(activateNow)activate(pageId, opts?.viaController === true);
  if(url!=="about:blank")await view.webContents.loadURL(url,referrer?{httpReferrer:referrer}:{}).catch(()=>{});
  return snapshot(page);
}
function forgetPage(page: PrivatePage) {
  const pageId=page.target.pageId;
  if(pages.get(pageId)!==page)return;
  pages.delete(pageId);
  if(stagePageId===pageId)stagePageId=null;
  if(splitPageId===pageId)splitPageId=null;
  if(win&&!win.isDestroyed())try{win.contentView.removeChildView(page.view);}catch{/* already removed */}
  if (!controllerClosing.has(pageId)) broadcastTabPatch(tabCatalog.apply([{ op: "remove", pageId }]));
  send("page.removed",{pageId});
  if(activePageId===pageId){
    const next=[...pages.values()].at(-1);activePageId=next?.target.pageId??null;
    if(win&&!win.isDestroyed()&&!exitApproved){if(next)activate(next.target.pageId);else applyStage();}
  }
}
async function closePage(pageId:string, viaController = false) {
  const page=pages.get(pageId);if(!page)return false;
  if(!await approveWindowUnload([page.view.webContents]))return false;
  if(viaController)controllerClosing.add(pageId);
  try {
    if(!page.view.webContents.isDestroyed())page.view.webContents.close({waitForBeforeUnload:false});
    forgetPage(page);
  } finally {
    controllerClosing.delete(pageId);
  }
  return true;
}

const tabPorts: TabPorts = {
  mintPageId: () => `private-${randomUUID()}`,
  windowOf: pageId => pages.has(pageId) ? PRIVATE_WINDOW_ID : undefined,
  open: async ({ pageId, url, activate }) => {
    await openPage(url, activate, undefined, { pageId, viaController: true });
  },
  close: pageId => closePage(pageId, true),
  focus: pageId => { activate(pageId, true); },
  navigate: (pageId, url) => {
    const page = pages.get(pageId);
    if (!page) throw new Error("Private tab not found");
    if (!pageUrl(url)) throw new Error("Unsupported private-page address");
    void page.view.webContents.loadURL(url).catch(() => {});
  },
  back: pageId => { const wc = pages.get(pageId)?.view.webContents; if (wc?.navigationHistory.canGoBack()) wc.navigationHistory.goBack(); },
  forward: pageId => { const wc = pages.get(pageId)?.view.webContents; if (wc?.navigationHistory.canGoForward()) wc.navigationHistory.goForward(); },
  reload: (pageId, hard) => { const wc = pages.get(pageId)?.view.webContents; if (hard) wc?.reloadIgnoringCache(); else wc?.reload(); },
  stop: pageId => pages.get(pageId)?.view.webContents.stop(),
  setMuted: (pageId, muted) => { const wc = pages.get(pageId)?.view.webContents; wc?.setAudioMuted(muted); },
  move: () => { throw new Error("Private windows cannot move tabs to another window."); },
};
const tabController = new TabController({ catalog: tabCatalog, ports: tabPorts, publish: broadcastTabPatch });

installHttpAuth({
  owner: contents => [...pages.values()].some(page=>page.view.webContents.id===contents.id) ? "private" : null,
  requireShell: event => {requireShell(event);return "private";},
  changed: () => {if(shellView&&!shellView.webContents.isDestroyed())shellView.webContents.send("http-auth-changed");},
});

function configurePermissions() {
  const ses=session.fromPartition(`aux-private-pages-${process.pid}`,{cache:false});
  installSitePermissions(ses, {
    owner: contents => [...pages.values()].some(page => page.view.webContents === contents) ? win ?? undefined : undefined,
    read: () => permissionDecisions,
    save: value => { permissionDecisions = value; },
    privateMode: true,
  });
  installRequestPolicy(ses, {
    httpsUpgrade: details => privateHttpsFirst.upgrade(details.url),
    blockingEnabled: () => privateTrackerBlock,
    blockedHosts: () => privateBlockedHosts,
    hostAllowed: privateTrackersAllowed,
    onBlocked: () => { privateBlockedCount += 1; },
  });
  // Same per-host, session-only certificate bypass as regular browsing —
  // decisions stay in this process's memory and die with the window.
  ses.setCertificateVerifyProc((request, callback) =>
    callback(privateInsecureBypass.has(request.hostname) ? 0 : -3));
  ses.on("will-download",(_event,item,contents)=>{
    if(!win){item.cancel();return;}
    const filename=item.getFilename(),sourceUrl=retrySource(item.getURLChain()[0] ?? item.getURL());
    // Electron shows this save panel itself, asynchronously; a sync dialog here
    // would freeze every private window and its network callbacks meanwhile.
    item.setSaveDialogOptions({title:"Save private download",message:"This file will be saved to disk and stays after private browsing ends.",defaultPath:join(app.getPath("downloads"),filename)});
    const record:Download={id:randomUUID(),sourceUrl,pageId:[...pages.values()].find(page=>page.view.webContents.id===contents?.id)?.target.pageId,filename,path:"",size:0,totalBytes:item.getTotalBytes()||undefined,state:"started",startedAt:Date.now(),paused:false,canResume:false,canCancel:true};downloads.unshift(record);shellView?.webContents.send("download",record);
    const warning=downloadWarning(filename,sourceUrl);
    // Same local protection as regular downloads; the choice lives only in
    // this window's memory — nothing is persisted or reported.
    if(warning){record.warning=warning;void confirmDownload(win,item,filename,sourceUrl,warning);}
    const update = () => {
      record.path=item.getSavePath()||record.path;
      record.size=item.getReceivedBytes();record.totalBytes=item.getTotalBytes()||undefined;
      record.state=item.getState();record.paused=item.isPaused();record.canResume=item.canResume();
      shellView?.webContents.send("download",{...record});
    };
    liveDownloads.set(record.id, { item, update });
    item.on("updated",update);
    item.once("done",(_done,state)=>{liveDownloads.delete(record.id);record.path=item.getSavePath()||record.path;record.size=item.getReceivedBytes();record.state=state;record.endedAt=Date.now();record.paused=false;record.canResume=false;record.canCancel=false;shellView?.webContents.send("download",{...record});});
  });
}

function registerIpc() {
  ipcMain.handle("api.invoke",async(event,method:string,params:Record<string,unknown>={})=>{
    requireShell(event);
    const get=()=>{const id=String(params.pageId??"");const page=pages.get(id);if(!page)throw new Error("Private tab not found");return page;};
    if (method.startsWith("bookmarks.")) {
      const result = bookmarks.invoke(method, params);
      if (method !== "bookmarks.list" && method !== "bookmarks.folders.list") send("bookmarks.changed", { bookmarks: bookmarks.list() });
      return result;
    }
    switch(method){
      case "workspace.get":return {pages:[...pages.values()].map(snapshot),sets:[],members:[],runs:[],sessions:[],activePageId,lastSeq:seq,restoringTabs:false};
      case "settings.get":return {theme:"system",tabLayout:"vertical",sidebarAppearance:"solid",sidebarBlur:0,sidebarOpacity:90,searchEngine:DEFAULT_SEARCH_ENGINE,modelConfigured:false,privateBrowsing:true};
      case "downloads.list":return [...downloads];
      case "downloads.remove": {
        const {ids}=MethodSchemas["downloads.remove"].parse(params);
        const selected=new Set(ids);
        const removed=downloads.filter(item=>selected.has(item.id)&&["completed","cancelled","interrupted"].includes(item.state)&&!liveDownloads.has(item.id)).map(item=>item.id);
        const removing=new Set(removed);
        for(let index=downloads.length-1;index>=0;index--)if(removing.has(downloads[index]!.id))downloads.splice(index,1);
        if(removed.length)send("downloads.removed",{ids:removed});
        return {removed};
      }
      case "programs.list":return [];
      case "history.list": {
        const q=String(params.query??"").toLowerCase();
        const before=params.before as {visitedAt:number;url:string}|undefined;
        return history.filter(item=>(!q||`${item.title} ${item.url}`.toLowerCase().includes(q))
          &&(params.since===undefined||item.visitedAt>=Number(params.since))
          &&(!before||item.visitedAt<before.visitedAt||(item.visitedAt===before.visitedAt&&item.url<before.url)))
          .sort((a,b)=>b.visitedAt-a.visitedAt||(a.url<b.url?1:a.url>b.url?-1:0)).slice(0,Number(params.limit??100));
      }
      case "history.remove": {
        const index=history.findIndex(item=>item.url===params.url&&item.visitedAt===params.visitedAt);
        if(index>=0)history.splice(index,1);
        send("history.changed",{});return {removed:index>=0};
      }
      case "history.clear": {
        const range = MethodSchemas["history.clear"].parse(params);
        let removed = 0;
        for (let index = history.length - 1; index >= 0; index--) {
          const item = history[index]!;
          if ((range.since === undefined || item.visitedAt >= range.since) && (range.before === undefined || item.visitedAt < range.before)) {
            history.splice(index, 1); removed++;
          }
        }
        send("history.changed", {}); return {ok:true, removed};
      }
      case "pages.open":return openPage(typeof params.url==="string"?params.url:"about:blank",params.activate!==false);
      case "pages.list":return [...pages.values()].map(snapshot);
      case "pages.activate":return activate(String(params.pageId));
      case "pages.close":return {ok:await closePage(String(params.pageId))};
      case "pages.navigate":{const page=get();const url=String(params.url??"");if(!pageUrl(url))throw new Error("Unsupported private-page address");await page.view.webContents.loadURL(url);return snapshot(page);}
      case "pages.back":{const page=get();if(page.view.webContents.navigationHistory.canGoBack())page.view.webContents.goBack();return snapshot(page);}
      case "pages.forward":{const page=get();if(page.view.webContents.navigationHistory.canGoForward())page.view.webContents.goForward();return snapshot(page);}
      case "pages.reload":{const page=get();page.view.webContents.reload();return snapshot(page);}
      case "pages.stop":{const page=get();page.view.webContents.stop();return snapshot(page);}
      case "pages.zoom": {
        const contents = get().view.webContents;
        const options = MethodSchemas["pages.zoom"].parse(params);
        const result = setPageZoom(contents, options);
        if (options.level !== undefined || options.delta !== undefined || options.reset || options.direction) siteZoom.remember(contents.getURL(), result.level);
        return result;
      }
      case "pages.find": {
        const page = get(), bounds = page.view.getBounds();
        return pageFinder.find(page.view.webContents, String(params.text ?? ""), {
          forward: params.forward !== false, findNext: params.findNext === true,
          visible: page.view.getVisible() && bounds.width > 0 && bounds.height > 0,
        });
      }
      case "pages.stopFind": { pageFinder.stop(get().view.webContents, params.action === "keep" ? "keep" : "clear"); return { ok: true }; }
      default:throw new Error("This action is unavailable in private browsing.");
    }
  });
  ipcMain.handle("ui.setStage",(event,pageId:string|null,bounds:{x:number;y:number;width:number;height:number},split?:string|null,radius?:number,ratio?:number)=>{requireShell(event);stagePageId=pageId&&pages.has(pageId)?pageId:null;splitPageId=split&&pages.has(split)?split:null;stageBounds=bounds;splitRatio=normalizeSplitRatio(ratio);if(Number.isFinite(radius))stageRadius=Math.max(0,Math.min(24,Math.round(radius!)));applyStage();return true;});
  ipcMain.handle("ui.overlay",(event,open:boolean)=>{requireShell(event);overlayOpen=open;applyStage();return true;});
  ipcMain.handle("ui.toolbarOverlay",(event,open:unknown,ticket:unknown)=>{
    requireShell(event);
    const seq=typeof ticket==="number"&&Number.isFinite(ticket)?ticket:0;
    if(seq<toolbarOverlaySeq)return false;
    toolbarOverlaySeq=seq;toolbarOverlay=open===true;applyStage();return true;
  });
  ipcMain.handle("ui.trafficLights",(event,visible:unknown)=>{requireShell(event);if(process.platform==="darwin"&&win)win.setWindowButtonVisibility(visible!==false);return true;});
  ipcMain.on("ui.pagePointer",(event,value:unknown)=>{
    if(!toolbarOverlay||overlayOpen||!win||win.isDestroyed())return;
    try{requireShell(event as Electron.IpcMainInvokeEvent);}catch{return;}
    const message=readPagePointer(value);if(!message)return;
    const visible=[splitPageId,stagePageId].flatMap(id=>{
      const page=id?pages.get(id):undefined;
      if(!page?.view.getVisible())return [];
      return [{page,...page.view.getBounds()}];
    });
    const hit=boundsContaining(message.x,message.y,visible);
    if(!hit||hit.page.view.webContents.isDestroyed())return;
    const input=inputEventFor(message,hit.x,hit.y);
    if(!input)return;
    if(message.kind==="down")hit.page.view.webContents.focus();
    hit.page.view.webContents.sendInputEvent(input);
  });
  ipcMain.handle("ui.focusShell",event=>{requireShell(event);shellView?.webContents.focus();});
  let previewWatch:{pageId:string;stop:()=>void}|null=null;
  const clearPreviewWatch=()=>{previewWatch?.stop();previewWatch=null;};
  ipcMain.handle("ui.watchPreview",async(event,pageId:unknown)=>{
    requireShell(event);
    if(typeof pageId!=="string")return false;
    if(previewWatch?.pageId===pageId)return true;
    clearPreviewWatch();
    const page=pages.get(pageId);
    if(!page||page.view.webContents.isDestroyed())return false;
    const sender=event.sender;
    const stop=startPreviewWatch({
      pageId,
      contents:page.view.webContents,
      capture:()=>page.view.webContents.capturePage(),
      send:frame=>{if(!sender.isDestroyed())sender.send("preview-frame",frame);},
      stopped:()=>sender.isDestroyed()||page.view.webContents.isDestroyed(),
    });
    previewWatch={pageId,stop};
    return true;
  });
  ipcMain.handle("ui.unwatchPreview",(event,pageId:unknown)=>{requireShell(event);if(!previewWatch||typeof pageId!=="string"||previewWatch.pageId===pageId)clearPreviewWatch();return true;});
  ipcMain.handle("ui.preview",async(event,pageId:string)=>{requireShell(event);const page=pages.get(pageId);if(!page)return null;try{return (await page.view.webContents.capturePage()).resize({width:240}).toDataURL();}catch{return null;}});
  ipcMain.handle("ui.tabAudio",event=>{requireShell(event);return Object.fromEntries([...pages].map(([id,page])=>[id,{muted:page.view.webContents.isAudioMuted(),audible:page.view.webContents.isCurrentlyAudible()}]));});
  ipcMain.handle("ui.tabCommand", (event, envelope: unknown) => { requireShell(event); return tabController.execute(envelope, PRIVATE_WINDOW_ID); });
  ipcMain.handle("ui.tabsSnapshot", event => { requireShell(event); return tabCatalog.snapshot(); });
  ipcMain.handle("ui.tabsSince", (event, version: unknown) => { requireShell(event); return tabCatalog.since(typeof version === "number" ? version : -1); });
  ipcMain.handle("ui.setTabMuted",(event,pageId:string,muted:boolean)=>{requireShell(event);const page=pages.get(pageId);if(!page)throw new Error("Private tab not found");page.view.webContents.setAudioMuted(muted);shellView?.webContents.send("view.audio",{pageId,muted,audible:page.view.webContents.isCurrentlyAudible()});});
  ipcMain.handle("ui.navigationMenu",(event,pageId:string,direction:unknown)=>{
    requireShell(event);
    if(direction!=="back"&&direction!=="forward")throw new Error("Choose a history direction.");
    const page=pages.get(pageId);
    if(!page)throw new Error("This tab is no longer open.");
    return showNavigationMenu(page.view.webContents,direction);
  });
  ipcMain.handle("ui.hardReload",(event,pageId:string)=>{requireShell(event);pages.get(pageId)?.view.webContents.reloadIgnoringCache();return true;});
  ipcMain.handle("ui.closeWindow",event=>{requireShell(event);win?.close();return true;});
  ipcMain.handle("ui.print",(event,pageId:string)=>{requireShell(event);const page=pages.get(pageId);if(!page)throw new Error("This private tab is no longer available.");return printPage(page.view.webContents,page.target.showBlankDocument);});
  ipcMain.handle("ui.devTools",(event,pageId:string)=>{
    requireShell(event);
    const wc=pages.get(pageId)?.view.webContents;
    if(!wc||wc.isDestroyed())return false;
    wc.openDevTools({mode:"detach"});return true;
  });
  ipcMain.handle("ui.contextMenu",(event,pageId:string|null)=>{requireShell(event);const wc=pageId?pages.get(pageId)?.view.webContents:shellView?.webContents;Menu.buildFromTemplate([{role:"cut"},{role:"copy"},{role:"paste"},{role:"selectAll"},...(pageId?[{type:"separator" as const},{label:"Back",enabled:!!wc?.navigationHistory.canGoBack(),click:()=>wc?.goBack()},{label:"Forward",enabled:!!wc?.navigationHistory.canGoForward(),click:()=>wc?.goForward()},{label:"Reload",click:()=>wc?.reload()}]:[])]).popup();return true;});
  ipcMain.handle("ui.openExternal",()=>false);
  ipcMain.handle("ui.openFile",async event=>{requireShell(event);if(!win)return null;const result=await dialog.showOpenDialog(win,{title:"Open File",properties:["openFile"]});return result.canceled?null:result.filePaths[0]??null;});
  ipcMain.handle("ui.saveWorkbook",(event,content:unknown,format:unknown)=>{requireShell(event);if(!win)throw new Error("This window is unavailable.");return saveWorkbookSnapshot(win,content,true,format);});
  ipcMain.handle("ui.saveFile", async (event, name: unknown, content: unknown) => {
    requireShell(event);
    if (!win || typeof name !== "string" || typeof content !== "string") throw new Error("Invalid export content.");
    const result = await dialog.showSaveDialog(win, { title: "Export private bookmarks", message: "The exported file remains on your Mac after this private window closes.", defaultPath: join(app.getPath("downloads"), basename(name)) });
    if (result.canceled || !result.filePath) return null;
    try { await writeFile(result.filePath, content, { encoding: "utf8", mode: 0o600 }); }
    catch { throw new Error("Couldn’t save the export. Choose a writable destination and try again."); }
    return result.filePath;
  });
  ipcMain.handle("ui.savePagePdf",(event,pageId:string)=>{requireShell(event);const page=pages.get(pageId);if(!page||!win)throw new Error("Select a private page to export.");return savePagePdf(page.view.webContents,win,true,page.target.showBlankDocument);});
  ipcMain.handle("ui.downloadsSnapshot",event=>{requireShell(event);return [...downloads];});
  ipcMain.handle("ui.downloadFolder",event=>{requireShell(event);return {path:app.getPath("downloads"),custom:false};});
  ipcMain.handle("ui.chooseDownloadFolder",event=>{requireShell(event);return {path:app.getPath("downloads"),custom:false};});
  ipcMain.handle("ui.controlDownload",(event,id:unknown,action:unknown)=>{
    requireShell(event);
    const download = typeof id === "string" ? liveDownloads.get(id) : undefined;
    controlDownload(download?.item, action);
    if (download && liveDownloads.has(id as string)) download.update();
  });
  ipcMain.handle("ui.retryDownload",(event,id:unknown)=>{
    requireShell(event);
    const record = typeof id === "string" ? downloads.find(download => download.id === id) : undefined;
    const source = retrySource(record?.sourceUrl);
    if (!record || liveDownloads.has(record.id) || record.state === "completed" || !source) throw new Error("Start this download again from its private page.");
    session.fromPartition(`aux-private-pages-${process.pid}`,{cache:false}).downloadURL(source);
  });
  ipcMain.handle("app.sitePermissions",event=>{requireShell(event);return structuredClone(permissionDecisions);});
  ipcMain.handle("app.clearSitePermission",(event,origin:string,permission?:string)=>{requireShell(event);const next={...permissionDecisions};if(permission){next[origin]={...next[origin]};delete next[origin][permission];if(!Object.keys(next[origin]).length)delete next[origin];}else delete next[origin];permissionDecisions=next;return true;});
  ipcMain.handle("app.privacy",event=>{requireShell(event);return {trackerBlock:privateTrackerBlock,blocked:privateBlockedCount,allowedHosts:[...privateAllowed],httpsUpgrade:privateHttpsFirst.enabled};});
  ipcMain.handle("app.setHttpsUpgrade",(event,enabled:unknown)=>{
    requireShell(event);if(typeof enabled!=="boolean")throw new Error("Choose whether secure connections are required first.");
    privateHttpsFirst.enabled=enabled;shellView?.webContents.send("privacy-changed",{trackerBlock:privateTrackerBlock,blocked:privateBlockedCount});
    return privateHttpsFirst.enabled;
  });
  ipcMain.handle("app.setTrackerBlock",(event,enabled:unknown)=>{
    requireShell(event);if(typeof enabled!=="boolean")throw new Error("Choose whether tracker blocking is on or off.");
    privateTrackerBlock=enabled;privateApplyCosmeticAll();shellView?.webContents.send("privacy-changed",{trackerBlock:privateTrackerBlock,blocked:privateBlockedCount});
    return {trackerBlock:privateTrackerBlock,blocked:privateBlockedCount};
  });
  ipcMain.handle("app.setSiteTrackers",(event,pageId:unknown,allowed:unknown)=>{
    requireShell(event);const page=typeof pageId==="string"?pages.get(pageId):undefined;if(!page)throw new Error("This browser tab is no longer available.");
    if(typeof allowed!=="boolean")throw new Error("Choose whether this site allows trackers and ads.");
    const hostname=new URL(page.view.webContents.getURL()).hostname.toLowerCase();
    if(allowed)privateAllowed.add(hostname);else privateAllowed.delete(hostname);
    privateApplyCosmeticAll();shellView?.webContents.send("privacy-changed",{trackerBlock:privateTrackerBlock,blocked:privateBlockedCount});
    return {hostname,allowed:privateTrackersAllowed(hostname)};
  });
  ipcMain.handle("app.removeAllowedHost",(event,hostname:unknown)=>{requireShell(event);if(typeof hostname!=="string"||!hostname)throw new Error("Choose a website exception to remove.");privateAllowed.delete(hostname.toLowerCase());privateApplyCosmeticAll();return [...privateAllowed];});
  ipcMain.handle("app.useHttp",(event,pageId:unknown,url:unknown)=>{
    requireShell(event);const page=typeof pageId==="string"?pages.get(pageId):undefined;if(!page)throw new Error("This browser tab is no longer available.");
    if(typeof url!=="string")throw new Error("An address is required.");
    let target:URL;try{target=new URL(url);}catch{throw new Error("Invalid address.");}
    if(target.protocol!=="http:")throw new Error("Only unencrypted addresses can be continued to.");
    privateHttpsFirst.allowHttp(target.hostname);
    void page.view.webContents.loadURL(target.href).catch(()=>{});
    return true;
  });
  ipcMain.handle("app.proceedInsecure",(event,url:unknown)=>{
    requireShell(event);if(typeof url!=="string")throw new Error("An HTTPS address is required.");
    privateInsecureBypass.proceed(url);
    return true;
  });
  ipcMain.handle("app.filterLists",event=>{requireShell(event);return privateFilterLists?privateFilterLists.status(TRACKER_HOSTS.size):{sources:[],hosts:0,builtinHosts:TRACKER_HOSTS.size};});
  ipcMain.handle("app.updateFilters",async event=>{requireShell(event);if(!privateFilterLists)throw new Error("Filter lists are unavailable.");const status=await privateRequest<unknown>("aux-private-filters",{action:"update"},"Filter updates are unavailable while the regular browser is offline.");refreshPrivateBlockedHosts();return status;});
  ipcMain.handle("app.addFilterSource",async(event,name:unknown,url:unknown)=>{requireShell(event);const sources=await privateRequest<unknown>("aux-private-filters",{action:"add",args:{name,url}},"Filter updates are unavailable while the regular browser is offline.");refreshPrivateBlockedHosts();return sources;});
  ipcMain.handle("app.removeFilterSource",async(event,id:unknown)=>{requireShell(event);const sources=await privateRequest<unknown>("aux-private-filters",{action:"remove",args:{id}},"Filter updates are unavailable while the regular browser is offline.");refreshPrivateBlockedHosts();return sources;});
  ipcMain.handle("app.clearSiteData",async(event,pageId:string)=>{
    requireShell(event);const page=pages.get(pageId);if(!page||!win)return false;
    const wc=page.view.webContents;const url=new URL(wc.getURL());if(!['http:','https:'].includes(url.protocol))throw new Error("Choose an HTTP or HTTPS website.");const origin=url.origin;
    const {response}=await dialog.showMessageBox(win,{type:"warning",title:"Clear private website data",message:`Clear cookies and stored data for ${origin}?`,detail:"This can sign you out and remove locally saved work in this private window. Other open pages for this site can recreate data; reload them after clearing.",buttons:["Cancel","Clear website data"],defaultId:0,cancelId:0,noLink:true});
    if(response!==1)return false;
    if(!pages.has(pageId)||wc.isDestroyed()||new URL(wc.getURL()).origin!==origin)throw new Error("The tab changed while confirmation was open. Choose the website again.");
    await wc.session.clearData({origins:[origin],originMatchingMode:"origin-in-all-contexts",dataTypes:["cookies","localStorage","indexedDB","fileSystems","serviceWorkers","webSQL"]});return true;
  });
  ipcMain.handle("app.siteInfo",async(event,pageId:string)=>{
    requireShell(event);
    const page=pages.get(pageId);if(!page)throw new Error("This browser tab is no longer available.");
    const wc=page.view.webContents, url=new URL(wc.getURL());
    if(!['http:','https:'].includes(url.protocol))throw new Error("Site controls are available for HTTP and HTTPS websites.");
    const cookies=await wc.session.cookies.get({url:url.href});
    if(wc.isDestroyed()||pages.get(pageId)!==page||wc.getURL()!==url.href)throw new Error("The page changed. Open site controls again.");
    const local=['localhost','127.0.0.1','[::1]'].includes(url.hostname);
    return {pageId,url:url.href,origin:url.origin,title:wc.getTitle(),security:url.protocol==='https:'?'secure':local?'local':'insecure',cookieCount:cookies.length,permissions:{...permissionDecisions[url.origin]},trackersAllowed:privateTrackersAllowed(url.hostname)};
  });
  ipcMain.handle("ui.setAppearance",(event,theme:"system"|"dark"|"light",translucent=false)=>{requireShell(event);nativeTheme.themeSource=theme;const glass=translucent&&!nativeTheme.prefersReducedTransparency&&process.platform==="darwin";win?.setVibrancy(glass?"under-window":null);shellView?.setBackgroundColor(glass?"#00000000":nativeTheme.shouldUseDarkColors?"#1c1c1e":"#e4e4e1");recolorToolbarGlass(nativeTheme.shouldUseDarkColors, nativeTheme.prefersReducedTransparency);return true;});

  ipcMain.handle("ui.readArticle",(event,pageId:string)=>{
    requireShell(event);const page=pages.get(pageId);
    if(!page)throw new Error("Open a webpage to use Reader view.");
    return readArticle(page.view.webContents,()=>pages.get(pageId)===page);
  });
  ipcMain.handle("ui.translatePage",(event,pageId:unknown)=>{requireShell(event);return runPrivatePageTranslate(String(pageId));});
  ipcMain.handle("ui.showOriginal",(event,pageId:unknown)=>{requireShell(event);return runPrivateShowOriginal(String(pageId));});
  const downloadedFile=(path:unknown)=>{
    if(typeof path!=="string"||!downloads.some(download=>download.path===path&&download.state==="completed"))throw new Error("Choose a completed download from this private window.");
    return path;
  };
  ipcMain.handle("ui.openPath",(event,path:unknown)=>{requireShell(event);return shell.openPath(downloadedFile(path));});
  ipcMain.handle("ui.revealPath",(event,path:unknown)=>{requireShell(event);shell.showItemInFolder(downloadedFile(path));return true;});
  for(const name of ["ui.saveCloudExport","ui.saveStoredArtifact","ui.selectRepository","ui.createProject","ui.checkLocalPreview","ui.registerCloudPreview","ui.projectFileHistory","ui.readProjectFileVersion","ui.listProjectFiles","ui.createProjectFile","ui.readProjectFile","ui.saveProjectFile","ui.listProjectCommands","ui.runProjectCommand","ui.stopProjectCommand","ui.runProjectServiceStack","ui.stopProjectServiceStack","ui.listProjects","ui.inspectProject","ui.pickEvidenceDocument","ui.pickEvidenceImage","app.agentConfig","app.agentConnections","app.agentClients","app.revokeAgentConnection","app.extensions","app.installUnpackedExtension","app.setExtensionEnabled","app.removeExtension","app.dataDir","app.exportDiagnostics","app.exportRuntimeBackup","app.stageRuntimeRestore","app.cancelRuntimeRestore","app.runtimeRestoreStatus","app.healthSummary","app.clearHealth"]){ipcMain.handle(name,()=>{throw new Error("This action is unavailable in private browsing.");});}
}

async function prepareExit(){
  await bootReady;
  if(preparedExit)return !preparedExit.invalidated;
  if(exitPending)return false;
  exitPending=true;
  const entries=[...pages.values()];const documents=entries.map(page=>({page,epoch:page.target.documentEpoch,url:page.target.url}));let invalidated=false;
  const samePages=()=>{const current=[...pages.values()];return !invalidated&&current.length===entries.length&&current.every((page,index)=>{const document=documents[index];return !!document&&page===entries[index]&&page.target.documentEpoch===document.epoch&&page.target.url===document.url&&!page.view.webContents.isDestroyed();});};
  const invalidate=(reason:string)=>{invalidated=true;recordTestControl(`prepare:invalidated:${reason}`);if(preparedExit)preparedExit.invalidated=true;};
  const listeners=entries.map(page=>({page,navigate:()=>invalidate(`navigate:${page.target.url}`),destroyed:()=>invalidate(`destroyed:${page.target.url}`)}));
  const cleanup=()=>{for(const listener of listeners){listener.page.view.webContents.removeListener("did-start-navigation",listener.navigate);listener.page.view.webContents.removeListener("destroyed",listener.destroyed);}};
  try{
    recordTestControl("prepare:start");
    for(const page of entries){const approved=await approveWindowUnload([page.view.webContents]);recordTestControl(`prepare:unload:${page.target.url}:${approved}`);if(!approved)return false;}
    if(!samePages()){recordTestControl("prepare:changed");return false;}
    for(const listener of listeners){listener.page.view.webContents.on("did-start-navigation",listener.navigate);listener.page.view.webContents.on("destroyed",listener.destroyed);}
    preparedExit={invalidated:false,cleanup};win?.hide();return true;
  }finally{exitPending=false;}
}
function abortPreparedExit(){const pending=preparedExit;if(!pending)return;preparedExit=null;pending.cleanup();win?.show();win?.focus();}
function commitPreparedExit(){const pending=preparedExit;if(!pending||pending.invalidated){abortPreparedExit();return false;}preparedExit=null;pending.cleanup();exitApproved=true;app.quit();return true;}
async function requestExit(){if(!await prepareExit()){abortPreparedExit();return;}commitPreparedExit();}

// Translation and filter-list mutations run in the regular process over the
// child-IPC channel — translate.* calls so page text is never persisted, and
// filter ops so the shared cache stays single-writer.
const pendingParent=new Map<string,{resolve:(value:unknown)=>void;reject:(error:Error)=>void;timer:NodeJS.Timeout}>();
let privateRequestSeq=0;
function privateRequest<T>(type:"aux-private-translate"|"aux-private-filters",payload:Record<string,unknown>,unavailable:string,timeoutMs=120000):Promise<T>{
  if(!process.send||!process.connected)return Promise.reject(new Error(unavailable));
  const requestId=`${process.pid}:${++privateRequestSeq}`;
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{pendingParent.delete(requestId);reject(new Error("The request timed out."));},timeoutMs);
    pendingParent.set(requestId,{resolve:resolve as (value:unknown)=>void,reject,timer});
    process.send!({type,requestId,...payload},(error:Error|null)=>{
      if(!error)return;
      clearTimeout(timer);pendingParent.delete(requestId);
      reject(new Error(`${unavailable} The regular browser isn't responding.`));
    });
  });
}
const privateTranslate=<T>(method:"translate.page"|"translate.text",params:Record<string,unknown>)=>
  privateRequest<T>("aux-private-translate",{method,params},"Translation is unavailable — private browsing has no model connection.");

const privatePageTranslations=new Map<string,{lang:string;count:number;truncated?:boolean}>();
function privateTranslateTarget():string{
  const locale=app.getLocale()||"en";
  try{return new Intl.DisplayNames([locale],{type:"language"}).of(locale.split("-")[0]!)??"English";}
  catch{return "English";}
}
async function runPrivatePageTranslate(pageId:string){
  const page=pages.get(pageId);
  if(!page)throw new Error("This private page is no longer available.");
  const wc=page.view.webContents;
  const url=wc.getURL();
  if(!/^https?:/.test(url))throw new Error("Open a web page to translate.");
  if(/\.pdf($|[?#])/i.test(url))throw new Error("PDF documents can't be translated in place.");
  shellView?.webContents.send("translation-changed",{pageId,pending:true});
  const extracted=await wc.executeJavaScript(extractTextsScript(),true) as {texts?:string[];title?:string};
  if(!extracted?.texts?.length)throw new Error("No readable text was found on this page.");
  const result=await privateTranslate<{lang:string;translations:string[];truncated:boolean}>("translate.page",{texts:extracted.texts,target:privateTranslateTarget(),context:(extracted.title??"").slice(0,200)});
  if(wc.isDestroyed()||wc.getURL()!==url)throw new Error("The page changed while translating.");
  const applied=await wc.executeJavaScript(applyTranslationsScript(result.translations),true) as {applied:number;expired:boolean};
  if(applied.expired)throw new Error("The page changed while translating.");
  const state={lang:result.lang,count:applied.applied,truncated:result.truncated};
  privatePageTranslations.set(pageId,{lang:result.lang,count:applied.applied});
  shellView?.webContents.send("translation-changed",{pageId,...state});
  return state;
}
async function runPrivateSelectionTranslate(page:PrivatePage,text:string,x:number,y:number){
  const result=await privateTranslate<{lang:string;translation:string}>("translate.text",{text:text.slice(0,12000),target:privateTranslateTarget(),context:page.view.webContents.getTitle().slice(0,200)});
  if(page.view.webContents.isDestroyed())return;
  await page.view.webContents.executeJavaScript(translateBubbleScript(x,y,result.lang,privateTranslateTarget(),result.translation),true).catch(()=>{});
}
async function runPrivateShowOriginal(pageId:string){
  const page=pages.get(pageId);
  if(!page)return 0;
  const restored=await page.view.webContents.executeJavaScript(restoreOriginalScript(),true).catch(()=>0) as number;
  privatePageTranslations.delete(pageId);
  shellView?.webContents.send("translation-changed",{pageId,lang:null,count:0});
  return restored;
}

process.on("message",message=>{
  const value=message as {type?:string;requestId?:string;action?:string;ok?:boolean;result?:unknown;error?:string};
  if((value?.type==="aux-private-translate-result"||value?.type==="aux-private-filters-result")&&value.requestId){
    const pending=pendingParent.get(value.requestId);
    if(!pending)return;
    pendingParent.delete(value.requestId);clearTimeout(pending.timer);
    if(value.ok)pending.resolve(value.result);else pending.reject(new Error(value.error??"The request failed."));
    return;
  }
  if(value?.type!=="aux-private-control"||!value.requestId)return;
  void (async()=>{
    let ok=false;
    if(value.action==="prepare")ok=await prepareExit();
    else if(value.action==="validate")ok=!!preparedExit&&!preparedExit.invalidated;
    else if(value.action==="abort"){abortPreparedExit();ok=true;}
    else if(value.action==="commit")ok=commitPreparedExit();
    recordTestControl(`${value.action}:${ok}`);
    try{process.send?.({type:"aux-private-control-result",requestId:value.requestId,ok},()=>{});}catch{/* parent already exited */}
  })();
});

async function boot(){
  const shellSession=session.fromPartition(`aux-private-shell-${process.pid}`,{cache:false});
  configurePermissions();registerIpc();
  win=new BaseWindow({width:1320,height:900,minWidth:900,minHeight:620,title:"Aux — Private",titleBarStyle:"hiddenInset",trafficLightPosition:trafficLights,roundedCorners:true,backgroundColor:"#1c1c1e"});
  shellView=new WebContentsView({webPreferences:{preload:join(import.meta.dirname,"..","preload","index.cjs"),session:shellSession,additionalArguments:["--aux-private-renderer"],contextIsolation:true,sandbox:true,nodeIntegration:false}});
  shellView.setBackgroundColor("#1c1c1e");win.contentView.addChildView(shellView);
  toolbarEdge=attachToolbarEdgeWatch(win,shellView.webContents,()=>({page:!!stagePageId&&!overlayOpen,stage:stageBounds}));
  const layout=()=>{if(win&&shellView){const {width,height}=win.getContentBounds();shellView.setBounds({x:0,y:0,width,height});applyStage();}};win.on("resize",layout);layout();
  // Swipe and app-command share the page-level overscroll port so history
  // navigation behaves the same however the gesture arrives.
  win.on("swipe",(_event,direction)=>{if(direction==="left"||direction==="right")(direction==="left"?tabPorts.forward:tabPorts.back)(stagePageId??"");});
  win.on("app-command",(_event,command)=>{if(command==="browser-backward")tabPorts.back(stagePageId??"");else if(command==="browser-forward")tabPorts.forward(stagePageId??"");});
  const devUrl=process.env.VITE_DEV_SERVER_URL;const shellFile=join(import.meta.dirname,"..","renderer","index.html");const allowed=(url:string)=>isShellDocument(url,shellFile,devUrl);
  shellView.webContents.on("will-navigate",(event,url)=>{if(!allowed(url))event.preventDefault();});shellView.webContents.setWindowOpenHandler(()=>({action:"deny"}));
  // The shell is chrome UI only — a crashed renderer reloads and reconverges
  // from the private catalog; page WebContents live in their own processes.
  shellView.webContents.on("render-process-gone",()=>{const shell=shellView;if(shell&&!shell.webContents.isDestroyed())shell.webContents.reload();});
  if(devUrl)await shellView.webContents.loadURL(devUrl);else await shellView.webContents.loadFile(shellFile);
  const initial=(webUrl(process.env.AUX_PRIVATE_TEST_INITIAL_URL)?process.env.AUX_PRIVATE_TEST_INITIAL_URL:process.argv.find(webUrl))??"about:blank";const initialPage=await openPage(initial,true);
  if(process.env.AUX_PRIVATE_TEST_DIRTY==="1")await pages.get(initialPage.pageId)?.view.webContents.executeJavaScript(`const field=document.querySelector('textarea,input,[contenteditable=true]');if(field){if('value' in field)field.value='Synthetic private draft';else field.textContent='Synthetic private draft';field.dispatchEvent(new Event('input',{bubbles:true}));}`,true);
  win.on("close",event=>{if(!exitApproved){event.preventDefault();void requestExit();}});win.on("closed",()=>{toolbarEdge?.stop();toolbarEdge=null;win=null;});
  const sendShortcut=(key:string,opt:{shift?:boolean;alt?:boolean}={})=>()=>shellView?.webContents.send("shortcut",{key,meta:true,shift:!!opt.shift,alt:!!opt.alt});
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {label:"Aux Private",submenu:[{role:"about",label:"About Aux"},{type:"separator"},{role:"quit",label:"Close Private Window"}]},
    {label:"File",submenu:[
      {label:"New Tab",accelerator:"CmdOrCtrl+T",click:sendShortcut("t")},
      {label:"Open File…",accelerator:"CmdOrCtrl+O",click:sendShortcut("o")},
      {type:"separator"},
      {label:"Close Tab",accelerator:"CmdOrCtrl+W",click:sendShortcut("w")},
      {label:"Close Window",accelerator:"CmdOrCtrl+Shift+W",click:()=>win?.close()},
      {type:"separator"},
      {label:"Print…",accelerator:"CmdOrCtrl+P",click:sendShortcut("p")},
      {label:"Save Page as PDF…",accelerator:"CmdOrCtrl+Shift+P",click:sendShortcut("p",{shift:true})},
    ]},
    {label:"Edit",submenu:[
      {role:"undo"},{role:"redo"},{type:"separator"},{role:"cut"},{role:"copy"},{role:"paste"},{role:"pasteAndMatchStyle"},{role:"selectAll"},
      {type:"separator"},
      {label:"Find…",accelerator:"CmdOrCtrl+F",click:sendShortcut("f")},
      {label:"Find Next",accelerator:"CmdOrCtrl+G",click:sendShortcut("g")},
      {label:"Find Previous",accelerator:"CmdOrCtrl+Shift+G",click:sendShortcut("g",{shift:true})},
    ]},
    {label:"View",submenu:[
      {label:"Reload",accelerator:"CmdOrCtrl+R",click:sendShortcut("r")},
      {label:"Hard Reload",accelerator:"CmdOrCtrl+Shift+R",click:sendShortcut("r",{shift:true})},
      {type:"separator"},
      {label:"Actual Size",accelerator:"CmdOrCtrl+0",click:sendShortcut("0")},
      {label:"Zoom In",accelerator:"CmdOrCtrl+Plus",click:sendShortcut("+")},
      {label:"Zoom Out",accelerator:"CmdOrCtrl+-",click:sendShortcut("-")},
      {type:"separator"},
      {label:"Reader View",accelerator:"CmdOrCtrl+Alt+R",click:sendShortcut("r",{alt:true})},
      {label:"Toggle Sidebar",accelerator:"CmdOrCtrl+S",click:sendShortcut("s")},
      {label:"Tab Overview",accelerator:"CmdOrCtrl+Shift+O",click:sendShortcut("o",{shift:true})},
      {type:"separator"},
      {label:"Developer Tools",accelerator:"CmdOrCtrl+Alt+I",click:sendShortcut("i",{alt:true})},
      {role:"togglefullscreen"},
    ]},
    {label:"Navigate",submenu:[
      {label:"Open Address",accelerator:"CmdOrCtrl+L",click:sendShortcut("l")},
      {label:"Back",accelerator:"CmdOrCtrl+[",click:sendShortcut("[")},
      {label:"Forward",accelerator:"CmdOrCtrl+]",click:sendShortcut("]")},
      {type:"separator"},
      {label:"Bookmark This Page",accelerator:"CmdOrCtrl+D",click:sendShortcut("d")},
      {label:"Bookmark All Tabs",accelerator:"CmdOrCtrl+Shift+D",click:sendShortcut("d",{shift:true})},
      {type:"separator"},
      {label:"History",accelerator:"CmdOrCtrl+Y",click:sendShortcut("y")},
      {label:"Downloads",accelerator:"CmdOrCtrl+Shift+J",click:sendShortcut("j",{shift:true})},
    ]},
    {label:"Window",submenu:[{role:"minimize"},{role:"zoom"},{type:"separator"},{role:"front"}]},
  ]));
  win.show();
  bootReadyResolve?.();bootReadyResolve=null;try{process.send?.({type:"aux-private-ready"},()=>{});}catch{/* direct private launch */}
  writeTestReport();if(testReportPath&&process.env.AUX_PRIVATE_TEST_EXIT==="1")setTimeout(()=>{exitApproved=true;app.quit();},50);
}

app.whenReady().then(boot).catch(error=>{console.error("private boot failed",error);app.exit(1);});
app.on("before-quit",event=>{if(!exitApproved){event.preventDefault();void requestExit();}});
app.on("window-all-closed",()=>{if(exitApproved)app.quit();});
app.on("will-quit",()=>{recordTestControl("closing");try{process.send?.({type:"aux-private-closing"},()=>{});}catch{/* direct private launch */}rmSync(scratch,{recursive:true,force:true});});
