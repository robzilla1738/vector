/**
 * Aux private browser process.
 *
 * This entry deliberately has no runtime child, CDP switch, target marker,
 * persistent Chromium partition, tab snapshot, history database, agent bridge or
 * extension loader. It reuses the real Aux renderer and tab/sidebar behavior over
 * a small in-memory page service.
 */
import { app, BaseWindow, dialog, ipcMain, Menu, nativeTheme, session, WebContentsView } from "electron";
import { mkdtempSync, mkdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import type { Download, HistoryEntry, PageTarget, VectorEvent } from "@vector/contracts";
import { approveWindowUnload } from "./window-unload.js";
import { isShellDocument } from "./shell-origin.js";

const scratch = mkdtempSync(join(tmpdir(), "aux-private-process-"));
const userData = join(scratch, "user-data");
mkdirSync(userData, { recursive: true, mode: 0o700 });
app.setPath("userData", userData);
app.setPath("sessionData", userData);
app.setName("Aux Private");

let win: BaseWindow | null = null;
let shellView: WebContentsView | null = null;
let activePageId: string | null = null;
let stageBounds: {x:number;y:number;width:number;height:number} | null = null;
let stageRadius = 12;
let overlayOpen = false;
let exitApproved = false;
let exitPending = false;
let preparedExit: { invalidated: boolean; cleanup: () => void } | null = null;
let seq = 0;
let bootReadyResolve: (() => void) | null = null;
const bootReady = new Promise<void>(resolve => { bootReadyResolve = resolve; });

type PrivatePage = { target: PageTarget; view: WebContentsView };
const pages = new Map<string, PrivatePage>();
const history: HistoryEntry[] = [];
const bookmarks: {url:string;title:string}[] = [];
const downloads: Download[] = [];
const permissionDecisions: Record<string,Record<string,"allow"|"deny">> = {};
const testUnloadResponses = (process.env.AUX_PRIVATE_TEST_UNLOAD_RESPONSES ?? "").split(",").map(Number).filter(value=>value===0||value===1);
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
function send(type: VectorEvent["type"], payload: Record<string,unknown>) {
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
}
function applyStage() {
  if (!win) return;
  const bounds = stageBounds ?? win.getContentBounds();
  for (const page of pages.values()) {
    const shown = !overlayOpen && page.target.pageId === activePageId;
    const rounded = page.view as WebContentsView & {setBorderRadius?(radius:number):void};
    try { rounded.setBorderRadius?.(stageRadius); } catch { /* platform support varies */ }
    page.view.setBounds(bounds);
    page.view.setVisible(shown);
    const status: PageTarget["viewStatus"] = shown ? "visible" : "hidden";
    if (page.target.viewStatus !== status) page.target = {...page.target,viewStatus:status};
  }
  if (activePageId) pages.get(activePageId)?.view.webContents.focus();
}
function activate(pageId: string) {
  const page = pages.get(pageId);
  if (!page) throw new Error("Private tab not found");
  activePageId = pageId;
  page.target = {...page.target,lastActiveAt:Date.now(),viewStatus:"visible"};
  for (const other of pages.values()) if (other !== page) other.target = {...other.target,viewStatus:"hidden"};
  applyStage();
  sendPage(page, true);
  return snapshot(page);
}
function wirePage(page: PrivatePage) {
  const wc = page.view.webContents;
  wc.setWindowOpenHandler(({url}) => { if (webUrl(url)) void openPage(url, true); return {action:"deny"}; });
  wc.on("will-prevent-unload", event => {
    const response = testUnloadResponses.length ? testUnloadResponses.shift()! : win ? dialog.showMessageBoxSync(win,{type:"warning",title:"Leave website?",message:"Leave this private page?",detail:"Changes you made may not be saved.",buttons:["Stay","Leave"],defaultId:0,cancelId:0,noLink:true}) : 0;
    recordTestControl(`unload-prompt:${response}`);
    if (response === 1) event.preventDefault();
  });
  wc.on("did-start-navigation",(_event,_url,_inPlace,isMainFrame)=>{if(isMainFrame){page.target={...page.target,loading:true,navigationError:null};sendPage(page);}});
  wc.on("did-fail-load",(_event,code,message,url,isMainFrame)=>{if(isMainFrame&&code!==-3){page.target={...page.target,url,title:"Page couldn’t load",loading:false,navigationError:{url,code,message}};sendPage(page);}});
  wc.on("did-navigate",(_event,url)=>{page.target={...page.target,url,title:wc.getTitle()||url,documentEpoch:page.target.documentEpoch+1,loading:false,navigationError:null};if(url!=="about:blank")history.unshift({url,title:page.target.title,pageId:page.target.pageId,visitedAt:Date.now()});sendPage(page);});
  wc.on("did-navigate-in-page",(_event,url)=>{page.target={...page.target,url,documentEpoch:page.target.documentEpoch+1};sendPage(page);});
  wc.on("page-title-updated",(_event,title)=>{page.target={...page.target,title};sendPage(page);});
  wc.on("page-favicon-updated",(_event,icons)=>{page.target={...page.target,favicon:icons[0]};sendPage(page);});
  wc.on("did-start-loading",()=>{page.target={...page.target,loading:true};shellView?.webContents.send("view.loading",{pageId:page.target.pageId,loading:true});sendPage(page);});
  wc.on("did-stop-loading",()=>{page.target={...page.target,loading:false};shellView?.webContents.send("view.loading",{pageId:page.target.pageId,loading:false});sendPage(page);});
  wc.on("render-process-gone",()=>{page.target={...page.target,viewStatus:"crashed",loading:false,error:"The renderer process crashed."};send("page.crashed",{pageId:page.target.pageId});});
  const audio=()=>shellView?.webContents.send("view.audio",{pageId:page.target.pageId,muted:wc.isAudioMuted(),audible:wc.isCurrentlyAudible()});
  wc.on("audio-state-changed",audio);wc.on("dom-ready",audio);
}
async function openPage(url = "about:blank", activateNow = true) {
  if (!pageUrl(url)) throw new Error("Private browsing supports web pages and explicitly opened local files.");
  if (!win) throw new Error("Private window unavailable");
  const pageId=`private-${randomUUID()}`;
  const view=new WebContentsView({webPreferences:{session:session.fromPartition(`aux-private-pages-${process.pid}`,{cache:false}),contextIsolation:true,sandbox:true,nodeIntegration:false,spellcheck:true}});
  const now=Date.now();
  const page:PrivatePage={view,target:{pageId,backend:"vector",targetId:pageId,url,title:url==="about:blank"?"New Tab":url,documentEpoch:0,lastRevision:0,viewStatus:"hidden",controller:"none",controllerEpoch:0,ownedByRuntime:false,createdAt:now,lastActiveAt:now,loading:!!url,canGoBack:false,canGoForward:false,routeReason:"private-process"}};
  pages.set(pageId,page);wirePage(page);win.contentView.addChildView(view);applyStage();
  send("page.added",{page:snapshot(page),...(activateNow?{activePageId:pageId}:{})});
  if(activateNow)activate(pageId);
  if(url!=="about:blank")await view.webContents.loadURL(url).catch(()=>{});
  return snapshot(page);
}
async function closePage(pageId:string) {
  const page=pages.get(pageId);if(!page)return false;
  if(!await approveWindowUnload([page.view.webContents]))return false;
  if(win&&!win.isDestroyed())try{win.contentView.removeChildView(page.view);}catch{/* already removed */}
  pages.delete(pageId);send("page.removed",{pageId});
  if(activePageId===pageId){const next=[...pages.values()].at(-1);activePageId=next?.target.pageId??null;if(next)activate(next.target.pageId);else applyStage();}
  return true;
}

function configurePermissions() {
  const ses=session.fromPartition(`aux-private-pages-${process.pid}`,{cache:false});
  ses.setPermissionCheckHandler((contents,permission,origin,details)=>{try{const key=permission==="media"?`media:${details.mediaType}`:permission;return permissionDecisions[new URL(details.securityOrigin||origin||contents?.getURL()||"").origin]?.[key]==="allow";}catch{return false;}});
  ses.setPermissionRequestHandler((contents,permission,callback,details)=>{
    const origin=(()=>{try{return new URL(("securityOrigin" in details&&details.securityOrigin)||details.requestingUrl||contents.getURL()).origin;}catch{return "";}})();
    const mediaTypes="mediaTypes" in details?details.mediaTypes:undefined;
    const keys=permission==="media"?[...new Set(mediaTypes??[])].filter(type=>type==="audio"||type==="video").map(type=>`media:${type}`):[permission];
    if(!origin||!keys.length||permission==="display-capture"||!win){callback(false);return;}
    const saved=permissionDecisions[origin]??{};if(keys.some(key=>saved[key]==="deny")){callback(false);return;}if(keys.every(key=>saved[key]==="allow")){callback(true);return;}
    void dialog.showMessageBox(win,{type:"question",title:"Private site permission",message:`Allow ${origin} to use ${keys.join(" and ")}?`,detail:"This decision lasts only until you close this private window.",buttons:["Don’t Allow","Allow"],defaultId:0,cancelId:0}).then(({response})=>{const decision=response===1?"allow":"deny";permissionDecisions[origin]={...saved,...Object.fromEntries(keys.map(key=>[key,decision]))};callback(decision==="allow");}).catch(()=>callback(false));
  });
  ses.on("will-download",(_event,item,contents)=>{
    if(!win){item.cancel();return;}
    const path=dialog.showSaveDialogSync(win,{title:"Save private download",defaultPath:join(app.getPath("downloads"),item.getFilename())});
    if(!path){item.cancel();return;}item.setSavePath(path);
    const record:Download={id:randomUUID(),sourceUrl:item.getURL(),pageId:[...pages.values()].find(page=>page.view.webContents.id===contents.id)?.target.pageId,filename:item.getFilename(),path,size:0,totalBytes:item.getTotalBytes()||undefined,state:"started",startedAt:Date.now(),paused:false,canResume:false,canCancel:true};downloads.unshift(record);shellView?.webContents.send("download",record);
    item.on("updated",()=>{record.size=item.getReceivedBytes();record.state=item.getState();record.paused=item.isPaused();record.canResume=item.canResume();shellView?.webContents.send("download",{...record});});
    item.once("done",(_done,state)=>{record.size=item.getReceivedBytes();record.state=state;record.endedAt=Date.now();record.paused=false;record.canResume=false;record.canCancel=false;shellView?.webContents.send("download",{...record});});
  });
}

function registerIpc() {
  ipcMain.handle("api.invoke",async(event,method:string,params:Record<string,unknown>={})=>{
    requireShell(event);
    const get=()=>{const id=String(params.pageId??"");const page=pages.get(id);if(!page)throw new Error("Private tab not found");return page;};
    switch(method){
      case "workspace.get":return {pages:[...pages.values()].map(snapshot),sets:[],members:[],runs:[],sessions:[],activePageId,lastSeq:seq,restoringTabs:false};
      case "settings.get":return {theme:"system",tabLayout:"vertical",sidebarAppearance:"translucent",sidebarBlur:24,searchEngine:"google",modelConfigured:false,privateBrowsing:true};
      case "bookmarks.list":return [...bookmarks];
      case "downloads.list":return [...downloads];
      case "programs.list":return [];
      case "history.list":{const q=String(params.query??"").toLowerCase();return history.filter(item=>!q||`${item.title} ${item.url}`.toLowerCase().includes(q)).slice(0,Number(params.limit??100));}
      case "history.clear":history.splice(0);return {ok:true};
      case "bookmarks.add":{const url=String(params.url??"");if(!webUrl(url))throw new Error("Only web bookmarks are supported");if(!bookmarks.some(item=>item.url===url))bookmarks.push({url,title:String(params.title??url)});return {ok:true};}
      case "bookmarks.remove":{const index=bookmarks.findIndex(item=>item.url===params.url);if(index>=0)bookmarks.splice(index,1);return {ok:true};}
      case "pages.open":return openPage(typeof params.url==="string"?params.url:"about:blank",params.activate!==false);
      case "pages.list":return [...pages.values()].map(snapshot);
      case "pages.activate":return activate(String(params.pageId));
      case "pages.close":return {ok:await closePage(String(params.pageId))};
      case "pages.navigate":{const page=get();const url=String(params.url??"");if(!pageUrl(url))throw new Error("Unsupported private-page address");await page.view.webContents.loadURL(url);return snapshot(page);}
      case "pages.back":{const page=get();if(page.view.webContents.navigationHistory.canGoBack())page.view.webContents.goBack();return snapshot(page);}
      case "pages.forward":{const page=get();if(page.view.webContents.navigationHistory.canGoForward())page.view.webContents.goForward();return snapshot(page);}
      case "pages.reload":{const page=get();page.view.webContents.reload();return snapshot(page);}
      case "pages.stop":{const page=get();page.view.webContents.stop();return snapshot(page);}
      case "pages.zoom":{const page=get();const reset=params.reset===true;const next=reset?0:Math.max(-5,Math.min(5,page.view.webContents.getZoomLevel()+Number(params.delta??0)));page.view.webContents.setZoomLevel(next);return {level:next};}
      case "pages.find":{const page=get();const text=String(params.text??"");if(!text)return {matches:0};return await new Promise(resolve=>{const request=page.view.webContents.findInPage(text,{forward:params.forward!==false,findNext:params.findNext===true});const found=(_event:unknown,result:{requestId:number;matches:number;activeMatchOrdinal:number;finalUpdate:boolean})=>{if(result.requestId===request&&result.finalUpdate){page.view.webContents.removeListener("found-in-page",found);resolve({matches:result.matches,activeMatch:result.activeMatchOrdinal});}};page.view.webContents.on("found-in-page",found);});}
      case "pages.stopFind":{get().view.webContents.stopFindInPage((params.action as "clearSelection"|"keepSelection"|"activateSelection")??"clearSelection");return {ok:true};}
      default:throw new Error("This action is unavailable in private browsing.");
    }
  });
  ipcMain.handle("ui.setStage",(event,pageId:string|null,bounds:{x:number;y:number;width:number;height:number},_split?:string|null,radius?:number)=>{requireShell(event);activePageId=pageId;stageBounds=bounds;if(Number.isFinite(radius))stageRadius=Math.max(0,Math.min(24,Math.round(radius!)));applyStage();return true;});
  ipcMain.handle("ui.overlay",(event,open:boolean)=>{requireShell(event);overlayOpen=open;applyStage();return true;});
  ipcMain.handle("ui.preview",async(event,pageId:string)=>{requireShell(event);const page=pages.get(pageId);if(!page)return null;try{return (await page.view.webContents.capturePage()).resize({width:240}).toDataURL();}catch{return null;}});
  ipcMain.handle("ui.tabAudio",event=>{requireShell(event);return Object.fromEntries([...pages].map(([id,page])=>[id,{muted:page.view.webContents.isAudioMuted(),audible:page.view.webContents.isCurrentlyAudible()}]));});
  ipcMain.handle("ui.setTabMuted",(event,pageId:string,muted:boolean)=>{requireShell(event);const page=pages.get(pageId);if(!page)throw new Error("Private tab not found");page.view.webContents.setAudioMuted(muted);shellView?.webContents.send("view.audio",{pageId,muted,audible:page.view.webContents.isCurrentlyAudible()});});
  ipcMain.handle("ui.hardReload",(event,pageId:string)=>{requireShell(event);pages.get(pageId)?.view.webContents.reloadIgnoringCache();return true;});
  ipcMain.handle("ui.closeWindow",event=>{requireShell(event);win?.close();return true;});
  ipcMain.handle("ui.print",(event,pageId:string)=>{requireShell(event);pages.get(pageId)?.view.webContents.print();return true;});
  ipcMain.handle("ui.devTools",()=>false);
  ipcMain.handle("ui.contextMenu",(event,pageId:string|null)=>{requireShell(event);const wc=pageId?pages.get(pageId)?.view.webContents:shellView?.webContents;Menu.buildFromTemplate([{role:"cut"},{role:"copy"},{role:"paste"},{role:"selectAll"},...(pageId?[{type:"separator" as const},{label:"Back",enabled:!!wc?.navigationHistory.canGoBack(),click:()=>wc?.goBack()},{label:"Forward",enabled:!!wc?.navigationHistory.canGoForward(),click:()=>wc?.goForward()},{label:"Reload",click:()=>wc?.reload()}]:[])]).popup();return true;});
  ipcMain.handle("ui.openExternal",()=>false);
  ipcMain.handle("ui.openFile",async event=>{requireShell(event);if(!win)return null;const result=await dialog.showOpenDialog(win,{properties:["openFile"]});return result.canceled?null:result.filePaths[0]??null;});
  ipcMain.handle("ui.savePagePdf",async(event,pageId:string)=>{requireShell(event);const page=pages.get(pageId);if(!page||!win)throw new Error("Select a private page to export");const pdf=await page.view.webContents.printToPDF({printBackground:true,preferCSSPageSize:true});const result=await dialog.showSaveDialog(win,{title:"Save Page as PDF",defaultPath:join(app.getPath("downloads"),`${page.target.title||"Aux private page"}.pdf`)});if(result.canceled||!result.filePath)return null;await writeFile(result.filePath,pdf);return result.filePath;});
  ipcMain.handle("ui.downloadsSnapshot",event=>{requireShell(event);return [...downloads];});
  ipcMain.handle("ui.downloadFolder",event=>{requireShell(event);return {path:app.getPath("downloads"),custom:false};});
  ipcMain.handle("ui.chooseDownloadFolder",event=>{requireShell(event);return {path:app.getPath("downloads"),custom:false};});
  ipcMain.handle("ui.controlDownload",()=>{throw new Error("No active private download");});
  ipcMain.handle("ui.retryDownload",()=>{throw new Error("Restart this download from its private page");});
  ipcMain.handle("app.sitePermissions",event=>{requireShell(event);return structuredClone(permissionDecisions);});
  ipcMain.handle("app.clearSitePermission",(event,origin:string,permission?:string)=>{requireShell(event);if(permission)delete permissionDecisions[origin]?.[permission];else delete permissionDecisions[origin];return true;});
  ipcMain.handle("app.clearSiteData",async(event,pageId:string)=>{
    requireShell(event);const page=pages.get(pageId);if(!page||!win)return false;
    const wc=page.view.webContents;const url=new URL(wc.getURL());if(!['http:','https:'].includes(url.protocol))throw new Error("Choose an HTTP or HTTPS website.");const origin=url.origin;
    const {response}=await dialog.showMessageBox(win,{type:"warning",title:"Clear private website data",message:`Clear cookies and stored data for ${origin}?`,detail:"This can sign you out and remove locally saved work in this private window. Other open pages for this site can recreate data; reload them after clearing.",buttons:["Cancel","Clear website data"],defaultId:0,cancelId:0,noLink:true});
    if(response!==1)return false;
    if(!pages.has(pageId)||wc.isDestroyed()||new URL(wc.getURL()).origin!==origin)throw new Error("The tab changed while confirmation was open. Choose the website again.");
    await wc.session.clearData({origins:[origin],originMatchingMode:"origin-in-all-contexts",dataTypes:["cookies","localStorage","indexedDB","fileSystems","serviceWorkers","webSQL"]});return true;
  });
  ipcMain.handle("app.siteInfo",async(event,pageId:string)=>{requireShell(event);const page=pages.get(pageId);if(!page)throw new Error("This browser tab is no longer available.");const url=new URL(page.view.webContents.getURL());if(!['http:','https:'].includes(url.protocol))throw new Error("Site controls are available for HTTP and HTTPS websites.");const cookies=await page.view.webContents.session.cookies.get({url:url.href});const local=['localhost','127.0.0.1','::1'].includes(url.hostname);return {pageId,url:url.href,origin:url.origin,title:page.view.webContents.getTitle(),security:url.protocol==='https:'?'secure':local?'local':'insecure',cookieCount:cookies.length,permissions:{...(permissionDecisions[url.origin]??{})}};});
  ipcMain.handle("ui.setAppearance",(event,theme:"system"|"dark"|"light",translucent=false)=>{requireShell(event);nativeTheme.themeSource=theme;const glass=translucent&&!nativeTheme.prefersReducedTransparency&&process.platform==="darwin";win?.setVibrancy(glass?"under-window":null);shellView?.setBackgroundColor(glass?"#00000000":nativeTheme.shouldUseDarkColors?"#1c1c1e":"#e4e4e1");return true;});
  ipcMain.handle("ui.httpAuthRequests",event=>{requireShell(event);return [];});
  ipcMain.handle("ui.respondHttpAuth",event=>{requireShell(event);return false;});
  for(const name of ["ui.readArticle","ui.saveFile","ui.saveCloudExport","ui.saveStoredArtifact","ui.openPath","ui.revealPath","ui.selectRepository","ui.createProject","ui.checkLocalPreview","ui.registerCloudPreview","ui.projectFileHistory","ui.readProjectFileVersion","ui.listProjectFiles","ui.createProjectFile","ui.readProjectFile","ui.saveProjectFile","ui.listProjectCommands","ui.runProjectCommand","ui.stopProjectCommand","ui.runProjectServiceStack","ui.stopProjectServiceStack","ui.listProjects","ui.inspectProject","ui.pickEvidenceDocument","app.agentConfig","app.agentConnections","app.agentClients","app.revokeAgentConnection","app.extensions","app.installUnpackedExtension","app.setExtensionEnabled","app.removeExtension","app.dataDir","app.exportDiagnostics","app.exportRuntimeBackup","app.stageRuntimeRestore","app.cancelRuntimeRestore","app.runtimeRestoreStatus","app.healthSummary","app.clearHealth"]){ipcMain.handle(name,()=>{throw new Error("This action is unavailable in private browsing.");});}
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

process.on("message",message=>{
  const value=message as {type?:string;requestId?:string;action?:string};
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
  win=new BaseWindow({width:1320,height:900,minWidth:900,minHeight:620,title:"Aux — Private",titleBarStyle:"hiddenInset",trafficLightPosition:{x:16,y:18},roundedCorners:true,backgroundColor:"#1c1c1e"});
  shellView=new WebContentsView({webPreferences:{preload:join(import.meta.dirname,"..","preload","index.cjs"),session:shellSession,additionalArguments:["--aux-private-renderer"],contextIsolation:true,sandbox:true,nodeIntegration:false}});
  shellView.setBackgroundColor("#1c1c1e");win.contentView.addChildView(shellView);
  const layout=()=>{if(win&&shellView){const {width,height}=win.getContentBounds();shellView.setBounds({x:0,y:0,width,height});applyStage();}};win.on("resize",layout);layout();
  const devUrl=process.env.VITE_DEV_SERVER_URL;const shellFile=join(import.meta.dirname,"..","renderer","index.html");const allowed=(url:string)=>isShellDocument(url,shellFile,devUrl);
  shellView.webContents.on("will-navigate",(event,url)=>{if(!allowed(url))event.preventDefault();});shellView.webContents.setWindowOpenHandler(()=>({action:"deny"}));
  if(devUrl)await shellView.webContents.loadURL(devUrl);else await shellView.webContents.loadFile(shellFile);
  const initial=(webUrl(process.env.AUX_PRIVATE_TEST_INITIAL_URL)?process.env.AUX_PRIVATE_TEST_INITIAL_URL:process.argv.find(webUrl))??"about:blank";const initialPage=await openPage(initial,true);
  if(process.env.AUX_PRIVATE_TEST_DIRTY==="1")await pages.get(initialPage.pageId)?.view.webContents.executeJavaScript(`const field=document.querySelector('textarea,input,[contenteditable=true]');if(field){if('value' in field)field.value='Synthetic private draft';else field.textContent='Synthetic private draft';field.dispatchEvent(new Event('input',{bubbles:true}));}`,true);
  win.on("close",event=>{if(!exitApproved){event.preventDefault();void requestExit();}});win.on("closed",()=>{win=null;});
  const sendShortcut=(key:string,opt:{shift?:boolean;alt?:boolean}={})=>()=>shellView?.webContents.send("shortcut",{key,meta:true,shift:!!opt.shift,alt:!!opt.alt});
  Menu.setApplicationMenu(Menu.buildFromTemplate([{label:"Aux Private",submenu:[{role:"about",label:"About Aux"},{type:"separator"},{role:"quit",label:"Close Private Window"}]},{label:"File",submenu:[{label:"New Tab",accelerator:"CmdOrCtrl+T",click:sendShortcut("t")},{label:"Open File…",accelerator:"CmdOrCtrl+O",click:sendShortcut("o")},{type:"separator"},{label:"Close Tab",accelerator:"CmdOrCtrl+W",click:sendShortcut("w")},{label:"Close Window",accelerator:"CmdOrCtrl+Shift+W",click:()=>win?.close()},{type:"separator"},{label:"Save Page as PDF…",accelerator:"CmdOrCtrl+Shift+P",click:sendShortcut("p",{shift:true})}]},{label:"Edit",submenu:[{role:"undo"},{role:"redo"},{type:"separator"},{role:"cut"},{role:"copy"},{role:"paste"},{role:"selectAll"},{type:"separator"},{label:"Find…",accelerator:"CmdOrCtrl+F",click:sendShortcut("f")}]},{label:"View",submenu:[{label:"Reload",accelerator:"CmdOrCtrl+R",click:sendShortcut("r")},{label:"Hard Reload",accelerator:"CmdOrCtrl+Shift+R",click:sendShortcut("r",{shift:true})},{type:"separator"},{label:"Toggle Sidebar",accelerator:"CmdOrCtrl+S",click:sendShortcut("s")},{label:"Tab Overview",accelerator:"CmdOrCtrl+Shift+O",click:sendShortcut("o",{shift:true})},{type:"separator"},{role:"togglefullscreen"}]},{label:"Window",submenu:[{role:"minimize"},{role:"zoom"},{type:"separator"},{role:"front"}]}]));
  win.show();
  bootReadyResolve?.();bootReadyResolve=null;try{process.send?.({type:"aux-private-ready"},()=>{});}catch{/* direct private launch */}
  writeTestReport();if(testReportPath&&process.env.AUX_PRIVATE_TEST_EXIT==="1")setTimeout(()=>{exitApproved=true;app.quit();},50);
}

app.whenReady().then(boot).catch(error=>{console.error("private boot failed",error);app.exit(1);});
app.on("before-quit",event=>{if(!exitApproved){event.preventDefault();void requestExit();}});
app.on("window-all-closed",()=>{if(exitApproved)app.quit();});
app.on("will-quit",()=>{recordTestControl("closing");try{process.send?.({type:"aux-private-closing"},()=>{});}catch{/* direct private launch */}rmSync(scratch,{recursive:true,force:true});});
