import type { LocalProject, RepositorySelection, ProjectInspection, ProjectCommand, ProjectFile, LocalPreviewCheck, ProjectCommandContext, ProjectServiceStackRequest, ProjectFileHistory, ProjectFileVersionSnapshot, ProjectReviewSummary, ProjectCommitRequest, ProjectCommitResult } from "@aux/contracts";
/**
 * Preload for the Aux shell renderer. Compiled to index.cjs (CommonJS)
 * so Electron loads it as a classic preload regardless of package type.
 */
import { contextBridge, ipcRenderer } from "electron";

const windowArg = process.argv.find(value => value.startsWith("--aux-window-id="));
const windowId = windowArg ? decodeURIComponent(windowArg.slice("--aux-window-id=".length)) : "main";

const aux = {
  quickAskShortcut: (enabled?:boolean) => ipcRenderer.invoke("ui.quickAskShortcut",enabled),
  quickAskMode: process.argv.includes("--aux-quick-ask"),
  quickAsk: (action: "open"|"expand"|"dismiss"|"status") => ipcRenderer.invoke("ui.quickAsk", action),
  onQuickAskState: (cb: (compact:boolean)=>void) => { const listener=(_event:unknown,compact:boolean)=>cb(compact);ipcRenderer.on("quick-ask.state",listener);return()=>ipcRenderer.removeListener("quick-ask.state",listener); },
  browserProfiles:()=>ipcRenderer.invoke("ui.browserProfiles"),
  defaultBrowser:()=>ipcRenderer.invoke("ui.defaultBrowser"),
  autofill:(pageId:string)=>ipcRenderer.invoke("ui.autofill",pageId),
  vaultFill:(pageId:string,itemId:string)=>ipcRenderer.invoke("ui.vaultFill",pageId,itemId),
  vaultSave:(pageId:string,origin:string)=>ipcRenderer.invoke("ui.vaultSave",pageId,origin),
  vaultDismiss:(pageId:string,origin:string)=>ipcRenderer.invoke("ui.vaultDismiss",pageId,origin),
  vaultExport:(passphrase:string)=>ipcRenderer.invoke("ui.vaultExport",passphrase),
  vaultImport:(passphrase:string)=>ipcRenderer.invoke("ui.vaultImport",passphrase),
  onVaultOffer:(cb:(offer:{pageId:string;username:string;origin:string;kind:"save"|"update";itemId?:string;locked?:boolean})=>void)=>{const listener=(_event:unknown,offer:{pageId:string;username:string;origin:string;kind:"save"|"update";itemId?:string;locked?:boolean})=>cb(offer);ipcRenderer.on("vault.saveOffer",listener);return()=>ipcRenderer.removeListener("vault.saveOffer",listener);},
  setDefaultBrowser:()=>ipcRenderer.invoke("ui.setDefaultBrowser"),
  createBrowserProfile:(name:string)=>ipcRenderer.invoke("ui.createBrowserProfile",name),
  renameBrowserProfile:(id:string,name:string)=>ipcRenderer.invoke("ui.renameBrowserProfile",id,name),
  archiveBrowserProfile:(id:string,archived:boolean)=>ipcRenderer.invoke("ui.archiveBrowserProfile",id,archived),
  deleteBrowserProfile:(id:string)=>ipcRenderer.invoke("ui.deleteBrowserProfile",id),
  openBrowserProfile:(id:string)=>ipcRenderer.invoke("ui.openBrowserProfile",id),
  openBrowserProfileUrl:(id:string,url:string)=>ipcRenderer.invoke("ui.openBrowserProfileUrl",id,url),
  onPageAction: (cb: (action: import("@aux/contracts").PageQuickAction) => void) => {
    const listener = (_event: unknown, action: import("@aux/contracts").PageQuickAction) => cb(action);
    ipcRenderer.on("page.quickAction", listener);
    return () => ipcRenderer.removeListener("page.quickAction", listener);
  },
  privateMode: process.argv.includes("--aux-private") || process.argv.includes("--aux-private-renderer"),
  windowId,
  platform: process.platform,
  /** saved binding overrides — main applies them to menus and page interception */
  setShortcutOverrides: (overrides: unknown) => ipcRenderer.invoke("ui.shortcutOverrides", overrides),
  /** call a versioned runtime method */
  invoke: (method: string, params?: unknown) =>
    ipcRenderer.invoke("api.invoke", method, params ?? {}) as Promise<unknown>,

  /** runtime event stream */
  onEvent: (cb: (e: unknown) => void) => {
    const l = (_e: unknown, ev: unknown) => cb(ev);
    ipcRenderer.on("event", l);
    return () => ipcRenderer.removeListener("event", l);
  },
  onRuntimeStatus: (cb: (status: { connected: boolean; detail?: string }) => void) => {
    const listener = (_event: unknown, status: { connected: boolean; detail?: string }) => cb(status);
    ipcRenderer.on("runtime-status", listener);
    return () => ipcRenderer.removeListener("runtime-status", listener);
  },
  /** app shortcuts forwarded from focused native page views */
  onShortcut: (cb: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean; commandId?: string }) => void) => {
    const l = (_e: unknown, s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean; commandId?: string }) => cb(s);
    ipcRenderer.on("shortcut", l);
    return () => ipcRenderer.removeListener("shortcut", l);
  },
  onToolbarEdge: (cb: (near: boolean) => void) => {
    const listener = (_event: unknown, near: boolean) => cb(near);
    ipcRenderer.on("toolbar-edge", listener);
    return () => ipcRenderer.removeListener("toolbar-edge", listener);
  },
  onSidebarEdge: (cb: (near: boolean) => void) => {
    const listener = (_event: unknown, near: boolean) => cb(near);
    ipcRenderer.on("sidebar-edge", listener);
    return () => ipcRenderer.removeListener("sidebar-edge", listener);
  },
  onDownload: (cb: (d: unknown) => void) => {
    const l = (_e: unknown, d: unknown) => cb(d);
    ipcRenderer.on("download", l);
    return () => ipcRenderer.removeListener("download", l);
  },
  retryDownload: (id:string) => ipcRenderer.invoke("ui.retryDownload",id) as Promise<void>,
  tabAudio:()=>ipcRenderer.invoke('ui.tabAudio') as Promise<Record<string,{muted:boolean;audible:boolean}>>,
  tabsUnsavedWork:(tabs:{pageId:string;url:string}[])=>ipcRenderer.invoke('ui.tabsUnsavedWork',tabs) as Promise<Record<string,"clean"|"dirty"|"unknown">>,
  setTabMuted:(pageId:string,muted:boolean)=>ipcRenderer.invoke('ui.setTabMuted',pageId,muted) as Promise<void>,
  /** typed human tab commands (§7.2) — main-owned, deduplicated, ack'd */
  tabCommand:(command:import("@aux/contracts").TabCommand,catalogVersion?:number)=>ipcRenderer.invoke("ui.tabCommand",{commandId:`cmd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,10)}`,windowId,...(catalogVersion!==undefined?{catalogVersion}:{}) ,command}) as Promise<import("@aux/contracts").TabCommandAck>,
  bindTabSpace:(pageId:string,spaceId:string)=>ipcRenderer.invoke("ui.bindTabSpace",pageId,spaceId) as Promise<{spaceId:string;workspaceId:string}>,
  migrateTabSpaces:(assignments:{pageId:string;spaceId:string}[])=>ipcRenderer.invoke("ui.migrateTabSpaces",assignments) as Promise<{migrated:number}>,
  tabsSnapshot:()=>ipcRenderer.invoke("ui.tabsSnapshot") as Promise<import("@aux/contracts").TabCatalogSnapshot>,
  tabsSince:(version:number)=>ipcRenderer.invoke("ui.tabsSince",version) as Promise<{kind:"patches";patches:import("@aux/contracts").TabPatch[]}|{kind:"snapshot";snapshot:import("@aux/contracts").TabCatalogSnapshot}>,
  onTabsPatch:(cb:(patch:import("@aux/contracts").TabPatch)=>void)=>{const listener=(_event:unknown,patch:import("@aux/contracts").TabPatch)=>cb(patch);ipcRenderer.on("tabs.patch",listener);return()=>ipcRenderer.removeListener("tabs.patch",listener);},
  onTabsPlacement:(cb:(payload:{pageId:string;windowId:string;placement:import("@aux/contracts").TabPlacement})=>void)=>{const listener=(_event:unknown,payload:{pageId:string;windowId:string;placement:import("@aux/contracts").TabPlacement})=>cb(payload);ipcRenderer.on("tabs.placement",listener);return()=>ipcRenderer.removeListener("tabs.placement",listener);},
  onAudio:(cb:(state:{pageId:string;muted:boolean;audible:boolean;removed?:boolean})=>void)=>{const handler=(_event:Electron.IpcRendererEvent,state:{pageId:string;muted:boolean;audible:boolean;removed?:boolean})=>cb(state);ipcRenderer.on('view.audio',handler);return()=>{ipcRenderer.removeListener('view.audio',handler);};},
  downloadFolder: () => ipcRenderer.invoke("ui.downloadFolder") as Promise<{path:string;custom:boolean;error?:string}>,
  chooseDownloadFolder: (reset=false) => ipcRenderer.invoke("ui.chooseDownloadFolder",reset) as Promise<{path:string;custom:boolean;error?:string}>,
  downloadsSnapshot: () => ipcRenderer.invoke("ui.downloadsSnapshot"),
  controlDownload: (id: string, action: "pause" | "resume" | "cancel") => ipcRenderer.invoke("ui.controlDownload", id, action),
  onLoading: (cb: (s: { pageId: string; loading: boolean }) => void) => {
    const l = (_e: unknown, s: { pageId: string; loading: boolean }) => cb(s);
    ipcRenderer.on("view.loading", l);
    return () => ipcRenderer.removeListener("view.loading", l);
  },

  /** position the visible native page inside the stage rectangle (CSS px); `radius` rounds its corners to match the stage card */
  setStage: (pageId: string | null, bounds: { x: number; y: number; width: number; height: number }, split?: string | null, radius?: number, ratio?: number) =>
    ipcRenderer.invoke("ui.setStage", pageId, bounds, split, radius, ratio),
  /** hide native pages while a DOM overlay (palette/menus/overview) is up */
  overlay: (open: boolean) => ipcRenderer.invoke("ui.overlay", open),
  windowDrag: (phase: "start" | "move" | "end", point?: { x: number; y: number }) => ipcRenderer.send("ui.windowDrag", phase, point),
  sidebarGlass: (bounds: {x:number;y:number;width:number;height:number} | null) => ipcRenderer.invoke("ui.sidebarGlass", bounds) as Promise<boolean>,
  toolbarGlass: (visible: boolean) => ipcRenderer.invoke("ui.toolbarGlass", visible) as Promise<boolean>,
  toolbarTone: () => ipcRenderer.invoke("ui.toolbarTone") as Promise<"light" | "dark">,
  toolbarOverlay: (open: boolean, ticket: number) => ipcRenderer.invoke("ui.toolbarOverlay", open, ticket) as Promise<boolean>,
  trafficLights: (visible: boolean) => ipcRenderer.invoke("ui.trafficLights", visible) as Promise<boolean>,
  forwardPagePointer: (message: unknown) => { ipcRenderer.send("ui.pagePointer", message); },
  onPageCursor: (cb: (cursor: string) => void) => {
    const listener = (_event: unknown, cursor: string) => cb(cursor);
    ipcRenderer.on("page-cursor", listener);
    return () => ipcRenderer.removeListener("page-cursor", listener);
  },
  sidebarPeek: (open: boolean) => ipcRenderer.invoke("ui.sidebarPeek", open),
  focusShell: () => ipcRenderer.invoke("ui.focusShell") as Promise<void>,
  /** thumbnail data-url for a native page */
  preview: (pageId: string) => ipcRenderer.invoke("ui.preview", pageId) as Promise<string | null>,
  createResultPreview: (html: string) => ipcRenderer.invoke("ui.resultPreview.create", html) as Promise<string>,
  releaseResultPreview: (url: string) => ipcRenderer.invoke("ui.resultPreview.release", url) as Promise<boolean>,
  watchPreview: (pageId: string) => ipcRenderer.invoke("ui.watchPreview", pageId) as Promise<boolean>,
  unwatchPreview: (pageId: string) => ipcRenderer.invoke("ui.unwatchPreview", pageId) as Promise<boolean>,
  onPreviewFrame: (cb: (frame: { pageId: string; image: Uint8Array }) => void) => {
    const listener = (_event: unknown, frame: { pageId: string; image: Uint8Array }) => cb(frame);
    ipcRenderer.on("preview-frame", listener);
    return () => ipcRenderer.removeListener("preview-frame", listener);
  },
  contextMenu: (pageId: string | null) => ipcRenderer.invoke("ui.contextMenu", pageId),
  openExternal: (url: string) => ipcRenderer.invoke("ui.openExternal", url),
  registerCloudPreview:(url:string,token:string)=>ipcRenderer.invoke('ui.registerCloudPreview',url,token) as Promise<boolean>,
  revealPath: (p: string) => ipcRenderer.invoke("ui.revealPath", p),
  openPath: (p: string) => ipcRenderer.invoke("ui.openPath", p) as Promise<string>,
  saveWorkbook: (content:string,format:"snapshot"|"csv"="snapshot") => ipcRenderer.invoke("ui.saveWorkbook",content,format) as Promise<string|null>,
  saveFile: (name: string, content: string) => ipcRenderer.invoke("ui.saveFile", name, content) as Promise<string | null>,
  saveCloudExport:(sourcePath:string,suggestedName:string)=>ipcRenderer.invoke('ui.saveCloudExport',sourcePath,suggestedName) as Promise<string|null>,
  saveStoredArtifact:(artifactId:string,suggestedName:string)=>ipcRenderer.invoke('ui.saveStoredArtifact',artifactId,suggestedName) as Promise<string|null>,
  /** print the native page (⌘P) */
  savePagePdf: (pageId: string) => ipcRenderer.invoke("ui.savePagePdf", pageId) as Promise<string | null>,
  printPage: (pageId: string) => ipcRenderer.invoke("ui.print", pageId),
  /** Chromium devtools for the native page (⌥⌘I) */
  devTools: (pageId: string) => ipcRenderer.invoke("ui.devTools", pageId),
  /** reload bypassing cache (⇧⌘R) */
  readArticle: (pageId: string) => ipcRenderer.invoke("ui.readArticle", pageId),
  navigationMenu: (pageId:string,direction:"back"|"forward") => ipcRenderer.invoke("ui.navigationMenu",pageId,direction),
  hardReload: (pageId: string) => ipcRenderer.invoke("ui.hardReload", pageId),
  /** close the whole window (⇧⌘W, or ⌘W on the last tab) */
  closeWindow: () => ipcRenderer.invoke("ui.closeWindow"),
  windows: () => ipcRenderer.invoke("ui.windows"),
  /** file picker for ⌘O — returns a path or null */
  selectRepository: () => ipcRenderer.invoke("ui.selectRepository") as Promise<RepositorySelection | null>,
  createProject: (id: string) => ipcRenderer.invoke("ui.createProject", id) as Promise<LocalProject>,
  createBlankProject: (name: string) => ipcRenderer.invoke("ui.createBlankProject", name) as Promise<LocalProject>,
  checkLocalPreview: (id: string,url: string) => ipcRenderer.invoke("ui.checkLocalPreview",id,url) as Promise<LocalPreviewCheck>,
  projectFileHistory: (id:string,name:string) => ipcRenderer.invoke("ui.projectFileHistory",id,name) as Promise<ProjectFileHistory>,
  readProjectFileVersion: (id:string,name:string,versionId:string) => ipcRenderer.invoke("ui.readProjectFileVersion",id,name,versionId) as Promise<ProjectFileVersionSnapshot>,
  listProjectFiles: (id: string) => ipcRenderer.invoke("ui.listProjectFiles",id) as Promise<string[]>,
  createProjectFile: (id:string,name:string) => ipcRenderer.invoke("ui.createProjectFile",id,name) as Promise<ProjectFile>,
  readProjectFile: (id: string,name: string) => ipcRenderer.invoke("ui.readProjectFile",id,name) as Promise<ProjectFile>,
  saveProjectFile: (id: string,name: string,hash: string,content: string) => ipcRenderer.invoke("ui.saveProjectFile",id,name,hash,content) as Promise<ProjectFile&{recoveryPath:string}>,
  renameProjectFile: (id: string,name: string,nextName:string,hash: string) => ipcRenderer.invoke("ui.renameProjectFile",id,name,nextName,hash) as Promise<ProjectFile&{recoveryPath:string}>,
  deleteProjectFile: (id: string,name: string,hash: string) => ipcRenderer.invoke("ui.deleteProjectFile",id,name,hash) as Promise<{name:string;recoveryPath:string}|null>,
  openProjectFileExternal: (id:string,name:string,context:ProjectCommandContext) => ipcRenderer.invoke("ui.openProjectFileExternal",id,name,context) as Promise<boolean>,
  prepareProjectReview: (id:string,context:ProjectCommandContext) => ipcRenderer.invoke("ui.prepareProjectReview",id,context) as Promise<ProjectReviewSummary>,
  commitProject: (id:string,request:ProjectCommitRequest,context:ProjectCommandContext) => ipcRenderer.invoke("ui.commitProject",id,request,context) as Promise<ProjectCommitResult|null>,
  listProjectCommands: (id: string) => ipcRenderer.invoke("ui.listProjectCommands", id) as Promise<ProjectCommand[]>,
  runProjectCommand: (id: string, command: string, context: ProjectCommandContext, mode: "command"|"service" = "command") => ipcRenderer.invoke("ui.runProjectCommand", id, command, context, mode) as Promise<ProjectCommand|null>,
  stopProjectCommand: (projectId: string, id: string) => ipcRenderer.invoke("ui.stopProjectCommand", projectId, id) as Promise<ProjectCommand>,
  runProjectServiceStack: (id:string,request:ProjectServiceStackRequest,context:ProjectCommandContext) => ipcRenderer.invoke("ui.runProjectServiceStack",id,request,context) as Promise<ProjectCommand[]|null>,
  stopProjectServiceStack: (projectId:string,stackId:string) => ipcRenderer.invoke("ui.stopProjectServiceStack",projectId,stackId) as Promise<ProjectCommand[]>,
  listProjects: () => ipcRenderer.invoke("ui.listProjects") as Promise<LocalProject[]>,
  inspectProject: (id: string) => ipcRenderer.invoke("ui.inspectProject", id) as Promise<ProjectInspection>,
  pickEvidenceImage: () => ipcRenderer.invoke("ui.pickEvidenceImage") as Promise<{ filename: string; dataUrl: string } | null>,
  pickEvidenceDocument: () => ipcRenderer.invoke("ui.pickEvidenceDocument") as Promise<{ filename: string; content: string } | null>,
  openFile: () => ipcRenderer.invoke("ui.openFile") as Promise<string | null>,
  openPluginDirectory: () => ipcRenderer.invoke("ui.openPluginDirectory") as Promise<string | null>,
  agentConfig: (input:unknown) => ipcRenderer.invoke("app.agentConfig",input),
  agentConnections:()=>ipcRenderer.invoke("app.agentConnections"),
  agentClients:()=>ipcRenderer.invoke("app.agentClients"),
  revokeAgentConnection:(connectionId:string)=>ipcRenderer.invoke("app.revokeAgentConnection",connectionId),
  dictationStatus:()=>ipcRenderer.invoke("ui.dictationStatus"),
  startDictation:(id:string)=>ipcRenderer.invoke("ui.startDictation",id),
  stopDictation:(id:string)=>ipcRenderer.invoke("ui.stopDictation",id),
  cancelDictation:(id:string)=>ipcRenderer.invoke("ui.cancelDictation",id),
  onDictation:(callback:(value:unknown)=>void)=>{
    const listener=(_event:Electron.IpcRendererEvent,value:unknown)=>callback(value);
    ipcRenderer.on("dictation.event",listener);return()=>ipcRenderer.removeListener("dictation.event",listener);
  },
  extensions:()=>ipcRenderer.invoke("app.extensions"),
  installUnpackedExtension:()=>ipcRenderer.invoke("app.installUnpackedExtension"),
  updateUnpackedExtension:(key:string)=>ipcRenderer.invoke("app.updateUnpackedExtension",key),
  setExtensionEnabled:(key:string,enabled:boolean)=>ipcRenderer.invoke("app.setExtensionEnabled",key,enabled),
  removeExtension:(key:string)=>ipcRenderer.invoke("app.removeExtension",key),
  dataDir: () => ipcRenderer.invoke("app.dataDir") as Promise<string>,
  exportDiagnostics:()=>ipcRenderer.invoke('app.exportDiagnostics') as Promise<string|null>,
  exportRuntimeBackup:()=>ipcRenderer.invoke('app.exportRuntimeBackup') as Promise<{path:string;bytes:number;sha256:string;artifactFiles:number;missingArtifacts:number}|null>,
  exportMigrationLayout:(layoutJson:string)=>ipcRenderer.invoke('app.exportMigrationLayout',layoutJson) as Promise<{path:string}|null>,
  stageRuntimeRestore:()=>ipcRenderer.invoke('app.stageRuntimeRestore') as Promise<{staged:true;schemaVersion:number;bytes:number;sha256:string;artifactFiles:number;missingArtifacts:number}|null>,
  cancelRuntimeRestore:()=>ipcRenderer.invoke('app.cancelRuntimeRestore') as Promise<{cancelled:true}>,
  runtimeRestoreStatus:()=>ipcRenderer.invoke('app.runtimeRestoreStatus') as Promise<{pending:boolean;lastAppliedAt?:number}>,
  healthSummary:()=>ipcRenderer.invoke('app.healthSummary'),
  clearHealth:()=>ipcRenderer.invoke('app.clearHealth'),
  httpAuthRequests: () => ipcRenderer.invoke("ui.httpAuthRequests"),
  respondHttpAuth: (id:string,credentials:{username:string;password:string}|null) => ipcRenderer.invoke("ui.respondHttpAuth",id,credentials),
  onHttpAuthChanged: (cb:()=>void) => { const listener=()=>cb(); ipcRenderer.on('http-auth-changed',listener); return ()=>ipcRenderer.removeListener('http-auth-changed',listener); },
  clearSiteData: (pageId: string) => ipcRenderer.invoke("app.clearSiteData", pageId) as Promise<boolean>,
  siteInfo: (pageId: string) => ipcRenderer.invoke("app.siteInfo", pageId),
  siteZoom: (origin?: string) => ipcRenderer.invoke("app.siteZoom", origin),
  onSiteZoomChanged: (cb: () => void) => { const listener = () => cb(); ipcRenderer.on("site-zoom-changed", listener); return () => ipcRenderer.removeListener("site-zoom-changed", listener); },
  sitePermissions: () => ipcRenderer.invoke("app.sitePermissions") as Promise<Record<string, Record<string, "allow" | "deny">>>,
  clearSitePermission: (origin: string, permission?: string) => ipcRenderer.invoke("app.clearSitePermission", origin, permission) as Promise<boolean>,
  privacy: () => ipcRenderer.invoke("app.privacy") as Promise<{ trackerBlock: boolean; blocked: number; allowedHosts?: string[] }>,
  setTrackerBlock: (enabled: boolean) => ipcRenderer.invoke("app.setTrackerBlock", enabled) as Promise<{ trackerBlock: boolean; blocked: number }>,
  setHttpsUpgrade: (enabled: boolean) => ipcRenderer.invoke("app.setHttpsUpgrade", enabled) as Promise<boolean>,
  setSiteTrackers: (pageId: string, allowed: boolean) => ipcRenderer.invoke("app.setSiteTrackers", pageId, allowed) as Promise<{ hostname: string; allowed: boolean }>,
  removeAllowedHost: (hostname: string) => ipcRenderer.invoke("app.removeAllowedHost", hostname) as Promise<string[]>,
  filterLists: () => ipcRenderer.invoke("app.filterLists"),
  updateFilters: () => ipcRenderer.invoke("app.updateFilters"),
  addFilterSource: (name: string, url: string, kind: "hosts" | "cookie_banner" = "hosts") => ipcRenderer.invoke("app.addFilterSource", name, url, kind),
  removeFilterSource: (id: string) => ipcRenderer.invoke("app.removeFilterSource", id),
  setFilterSourceEnabled: (id: string, enabled: boolean) => ipcRenderer.invoke("app.setFilterSourceEnabled", id, enabled),
  proceedInsecure: (url: string) => ipcRenderer.invoke("app.proceedInsecure", url) as Promise<boolean>,
  useHttp: (pageId: string, url: string) => ipcRenderer.invoke("app.useHttp", pageId, url) as Promise<boolean>,
  translatePage: (pageId: string) => ipcRenderer.invoke("ui.translatePage", pageId),
  showOriginal: (pageId: string) => ipcRenderer.invoke("ui.showOriginal", pageId) as Promise<number>,
  onTranslationChanged: (cb:(payload:{pageId:string;lang?:string|null;count?:number;truncated?:boolean;pending?:boolean;error?:string})=>void) => { const listener=(_e:unknown,p:{pageId:string;lang?:string|null;count?:number;truncated?:boolean;pending?:boolean;error?:string})=>cb(p); ipcRenderer.on("translation-changed",listener); return ()=>ipcRenderer.removeListener("translation-changed",listener); },
  setAppearance: (theme: "system" | "dark" | "light", translucent = false, windowControls = true, material = "liquid-glass") => ipcRenderer.invoke("ui.setAppearance", theme, translucent, windowControls, material),
};

export type AuxBridge = typeof aux;
if (process.isMainFrame) contextBridge.exposeInMainWorld("aux", aux);
