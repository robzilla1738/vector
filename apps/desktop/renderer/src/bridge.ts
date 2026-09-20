/**
 * Typed access to the preload bridge. In a plain browser (vite dev without
 * electron) we expose a stub so the UI renders for visual development; in
 * `--mode mock` main.tsx installs a scripted bridge before this module reads
 * window.vector (see mock/bridge.ts).
 */
import type { VectorEvent, Download, LocalProject, RepositorySelection, ProjectInspection, ProjectCommand, ProjectFile, LocalPreviewCheck, ProjectCommandContext, ProjectServiceStackRequest, ProjectFileHistory, ProjectFileVersionSnapshot, ProjectReviewSummary, ProjectCommitRequest, ProjectCommitResult, AgentConnection, AgentConnectionScope } from "@vector/contracts";

export interface StageBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface HttpAuthRequest { id:string; origin:string;  proxy:boolean; realm:string; retry:boolean }
export interface BrowserExtension { key:string;id?:string;name:string;version:string;permissions:string[];enabled:boolean;loaded:boolean;managed:boolean;source:"managed"|"environment";error?:string }
export interface BrowserSiteInfo {
  pageId:string;url:string;origin:string;title:string;
  security:"secure"|"local"|"insecure";
  cookieCount:number;
  permissions:Record<string,"allow"|"deny">;
}
export interface BrowserHealthSummary {
  recordingSince?:number;latestAt?:number;samples:number;sessions:number;observedMinutes:number;spanDays:number;sevenDaySpan:boolean;startupMs?:number;
  cpuPercent:{p50:number;p95:number;max:number};memoryMb:{p50:number;p95:number;max:number};eventLoopLagMs:{p50:number;p95:number;max:number};maxWindows:number;maxPages:number;maxSuspendedPages:number;pageCrashes:number;pageUnresponsive:number;suspensionFailures:number;
}
export const emptyBrowserHealthSummary=():BrowserHealthSummary=>({samples:0,sessions:0,observedMinutes:0,spanDays:0,sevenDaySpan:false,cpuPercent:{p50:0,p95:0,max:0},memoryMb:{p50:0,p95:0,max:0},eventLoopLagMs:{p50:0,p95:0,max:0},maxWindows:0,maxPages:0,maxSuspendedPages:0,pageCrashes:0,pageUnresponsive:0,suspensionFailures:0});

export type ReaderNode = string | {tag:string;href?:string;children:ReaderNode[]};
export interface ReaderArticle { title:string;byline:string;site:string;url:string;minutes:number;content:ReaderNode }

export interface VectorBridge {
  privateMode: boolean;
  windowId: string;
  invoke(method: string, params?: unknown): Promise<unknown>;
  onEvent(cb: (e: VectorEvent) => void): () => void;
  onRuntimeStatus(cb: (status: { connected: boolean; detail?: string }) => void): () => void;
  onShortcut(cb: (s: { key: string; meta: boolean; shift: boolean; alt: boolean; ctrl?: boolean }) => void): () => void;
  onDownload(cb: (d: unknown) => void): () => void;
  retryDownload(id:string):Promise<void>;
  tabAudio():Promise<Record<string,{muted:boolean;audible:boolean}>>;
  setTabMuted(pageId:string,muted:boolean):Promise<void>;
  onAudio(cb:(state:{pageId:string;muted:boolean;audible:boolean;removed?:boolean})=>void):()=>void;
  downloadFolder():Promise<{path:string;custom:boolean;error?:string}>;
  chooseDownloadFolder(reset?:boolean):Promise<{path:string;custom:boolean;error?:string}>;
  downloadsSnapshot(): Promise<Download[]>;
  controlDownload(id: string, action: "pause" | "resume" | "cancel"): Promise<void>;
  onLoading(cb: (s: { pageId: string; loading: boolean }) => void): () => void;
  /** position the visible native page; `radius` rounds the view to match the stage card */
  setStage(pageId: string | null, bounds: StageBounds, split?: string | null, radius?: number): Promise<boolean>;
  overlay(open: boolean): Promise<boolean>;
  preview(pageId: string): Promise<string | null>;
  contextMenu(pageId: string | null): Promise<boolean>;
  openExternal(url: string): Promise<unknown>;
  registerCloudPreview(url:string,token:string):Promise<boolean>;
  revealPath(p: string): Promise<boolean>;
  openPath(p: string): Promise<string>;
  saveFile(name: string, content: string): Promise<string | null>;
  saveCloudExport(sourcePath:string,suggestedName:string):Promise<string|null>;
  saveStoredArtifact(artifactId:string,suggestedName:string):Promise<string|null>;
  savePagePdf(pageId: string): Promise<string | null>;
  printPage(pageId: string): Promise<boolean>;
  devTools(pageId: string): Promise<boolean>;
  readArticle(pageId:string):Promise<ReaderArticle>;
  hardReload(pageId: string): Promise<boolean>;
  closeWindow(): Promise<boolean>;
  selectRepository(): Promise<RepositorySelection | null>;
  createProject(id: string): Promise<LocalProject>;
  createBlankProject(name:string):Promise<LocalProject>;
  checkLocalPreview(id:string,url:string):Promise<LocalPreviewCheck>;
  projectFileHistory(id:string,name:string):Promise<ProjectFileHistory>;
  readProjectFileVersion(id:string,name:string,versionId:string):Promise<ProjectFileVersionSnapshot>;
  listProjectFiles(id:string):Promise<string[]>;
  createProjectFile(id:string,name:string):Promise<ProjectFile>;
  readProjectFile(id:string,name:string):Promise<ProjectFile>;
  saveProjectFile(id:string,name:string,hash:string,content:string):Promise<ProjectFile&{recoveryPath:string}>;
  renameProjectFile(id:string,name:string,nextName:string,hash:string):Promise<ProjectFile&{recoveryPath:string}>;
  deleteProjectFile(id:string,name:string,hash:string):Promise<{name:string;recoveryPath:string}|null>;
  openProjectFileExternal(id:string,name:string,context:ProjectCommandContext):Promise<boolean>;
  prepareProjectReview(id:string,context:ProjectCommandContext):Promise<ProjectReviewSummary>;
  commitProject(id:string,request:ProjectCommitRequest,context:ProjectCommandContext):Promise<ProjectCommitResult|null>;
  listProjectCommands(id: string): Promise<ProjectCommand[]>;
  runProjectCommand(id: string, command: string, context: ProjectCommandContext,mode?:"command"|"service"): Promise<ProjectCommand|null>;
  stopProjectCommand(projectId: string, id: string): Promise<ProjectCommand>;
  runProjectServiceStack(id:string,request:ProjectServiceStackRequest,context:ProjectCommandContext):Promise<ProjectCommand[]|null>;
  stopProjectServiceStack(projectId:string,stackId:string):Promise<ProjectCommand[]>;
  listProjects(): Promise<LocalProject[]>;
  inspectProject(id: string): Promise<ProjectInspection>;
  pickEvidenceDocument(): Promise<{ filename: string; content: string } | null>;
  openFile(): Promise<string | null>;
  agentConfig(input:{name:string;client:"codex"|"claude";scope:AgentConnectionScope}): Promise<{ command: string; args: string[]; env: Record<string, string>; connection: AgentConnection }>;
  agentConnections():Promise<AgentConnection[]>;
  agentClients():Promise<{client:"codex"|"claude";installed:boolean;version?:string;error?:string}[]>;
  revokeAgentConnection(connectionId:string):Promise<AgentConnection>;
  extensions():Promise<BrowserExtension[]>;
  installUnpackedExtension():Promise<BrowserExtension|null>;
  setExtensionEnabled(key:string,enabled:boolean):Promise<BrowserExtension>;
  removeExtension(key:string):Promise<boolean>;
  dataDir(): Promise<string>;
  exportDiagnostics():Promise<string|null>;
  exportRuntimeBackup():Promise<{path:string;bytes:number;sha256:string;artifactFiles:number;missingArtifacts:number}|null>;
  stageRuntimeRestore():Promise<{staged:true;schemaVersion:number;bytes:number;sha256:string;artifactFiles:number;missingArtifacts:number}|null>;
  cancelRuntimeRestore():Promise<{cancelled:true}>;
  runtimeRestoreStatus():Promise<{pending:boolean;lastAppliedAt?:number}>;
  healthSummary():Promise<BrowserHealthSummary>;
  clearHealth():Promise<BrowserHealthSummary>;
  httpAuthRequests():Promise<HttpAuthRequest[]>;
  respondHttpAuth(id:string,credentials:{username:string;password:string}|null):Promise<boolean>;
  onHttpAuthChanged(cb:()=>void):()=>void;
  clearSiteData(pageId: string): Promise<boolean>;
  siteInfo(pageId: string): Promise<BrowserSiteInfo>;
  sitePermissions(): Promise<Record<string, Record<string, "allow" | "deny">>>;
  clearSitePermission(origin: string, permission?: string): Promise<boolean>;
  setAppearance(theme: "system" | "dark" | "light", translucent?: boolean, windowControls?: boolean): Promise<boolean>;
}

const noop = () => () => {};
const stub: VectorBridge = {
  privateMode: false,
  windowId: "main",
  invoke: async () => {
    throw new Error("Aux bridge unavailable — running outside Electron");
  },
  onEvent: noop,
  onRuntimeStatus: noop,
  onShortcut: noop,
  onDownload: noop,
  onLoading: noop,
  retryDownload: async()=>{throw new Error("Download retry requires Aux desktop");},
  tabAudio:async()=>({}),
  setTabMuted:async()=>{throw new Error("Tab audio requires Aux desktop");},
  onAudio:noop,
  downloadFolder: async()=>{throw new Error("Download folders require Aux desktop");},
  chooseDownloadFolder: async()=>{throw new Error("Download folders require Aux desktop");},
  downloadsSnapshot: async () => [],
  controlDownload: async () => { throw new Error("Download control requires Aux desktop"); },
  setStage: async () => true,
  overlay: async () => true,
  preview: async () => null,
  contextMenu: async () => true,
  openExternal: async (url) => window.open(url, "_blank"),
  registerCloudPreview:async()=>{throw new Error('Protected cloud previews require Aux desktop');},
  revealPath: async () => true,
  openPath: async () => "",
  saveFile: async () => null,
  saveCloudExport:async()=>{throw new Error('Cloud export requires Aux desktop');},
  saveStoredArtifact:async()=>{throw new Error('Artifact export requires Aux desktop');},
  savePagePdf: async () => { throw new Error("PDF export requires the desktop browser"); },
  printPage: async () => true,
  devTools: async () => true,
  readArticle:async()=>{throw new Error("Reader view requires Aux desktop");},
  hardReload: async () => true,
  closeWindow: async () => true,
  openFile: async () => null,
    selectRepository: async () => null,
    createProject: async () => { throw new Error("Local projects require Aux desktop"); },
    createBlankProject: async () => { throw new Error("Local projects require Aux desktop"); },
    checkLocalPreview: async () => {throw new Error('Preview checks require Aux desktop');},
    projectFileHistory: async () => {throw new Error('File recovery requires Aux desktop');},
    readProjectFileVersion: async () => {throw new Error('File recovery requires Aux desktop');},
    listProjectFiles: async () => [],
    createProjectFile: async () => {throw new Error("File creation requires Aux desktop");},
    readProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    saveProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    renameProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    deleteProjectFile: async () => {throw new Error('File editing requires Aux desktop');},
    openProjectFileExternal: async () => {throw new Error('External editing requires Aux desktop');},
    prepareProjectReview: async () => {throw new Error('Project review requires Aux desktop');},
    commitProject: async () => {throw new Error('Local commits require Aux desktop');},
    listProjectCommands: async () => [],
    runProjectCommand: async () => { throw new Error("Local commands require Aux desktop"); },
    stopProjectCommand: async () => { throw new Error("Local commands require Aux desktop"); },
    runProjectServiceStack: async () => { throw new Error("Local service stacks require Aux desktop"); },
    stopProjectServiceStack: async () => { throw new Error("Local service stacks require Aux desktop"); },
    listProjects: async () => [],
    inspectProject: async () => { throw new Error("Local projects require Aux desktop"); },
    pickEvidenceDocument: async () => null,
  agentConfig: async () => { throw new Error("Agent connection setup requires the Aux desktop app"); },
  agentConnections: async()=>[],
  agentClients:async()=>[],
  revokeAgentConnection: async()=>{throw new Error("Agent connection setup requires the Aux desktop app");},
  extensions:async()=>[],
  installUnpackedExtension:async()=>{throw new Error("Extension installation requires Aux desktop");},
  setExtensionEnabled:async()=>{throw new Error("Extension management requires Aux desktop");},
  removeExtension:async()=>false,
  dataDir: async () => "",
  exportDiagnostics:async()=>null,
  exportRuntimeBackup:async()=>null,
  stageRuntimeRestore:async()=>null,
  cancelRuntimeRestore:async()=>({cancelled:true}),
  runtimeRestoreStatus:async()=>({pending:false}),
  healthSummary:async()=>emptyBrowserHealthSummary(),
  clearHealth:async()=>emptyBrowserHealthSummary(),
  httpAuthRequests: async()=>[],
  respondHttpAuth: async()=>false,
  onHttpAuthChanged: noop,
  clearSiteData: async () => false,
  siteInfo: async () => { throw new Error("Site controls require Aux desktop"); },
  sitePermissions: async () => ({}),
  clearSitePermission: async () => true,
  setAppearance: async () => true,
};

type W = Window & { vector?: VectorBridge; __vectorMock?: boolean };
const w = window as unknown as W;

export const bridge: VectorBridge = w.vector ?? stub;
/** true only inside the real Electron shell — native page views exist */
export const inElectron = !!w.vector && !w.__vectorMock;
/** scripted bridge for visual development and screenshots */
export const inMock = !!w.__vectorMock;
