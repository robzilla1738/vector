import { app, dialog } from "electron";
import { chmodSync, lstatSync, realpathSync } from "node:fs";
import { cp, writeFile } from "node:fs/promises";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { DATA_DIR } from "../app/bootstrap.js";
import { browserHealth, extensionManager } from "../app/services.js";
import { buildDiagnosticReport } from "../diagnostics.js";
import { profileSession } from "../native-views.js";
import { runtimeRestoreStatus } from "../runtime-restore.js";
import { channel, requireRuntime, runtimeInvoke, runtimeReady } from "../runtime/supervisor.js";
import { handleShell, regularWindows } from "../windows/registry.js";

export function wireBackupIpc() {
  handleShell('app.exportDiagnostics', async state => {
    const invoke=async(method:string,params:Record<string,unknown>={})=>{if(!channel)return null;try{return await runtimeInvoke(method, params, 15_000);}catch{return null;}};
    const [runtime,settings,workspaces,runs,pages]=await Promise.all([invoke('runtime.describe'),invoke('settings.get'),invoke('workspaces.list'),invoke('runs.list',{limit:500}),invoke('pages.list',{includeDetached:true})]);
    const workspaceList=Array.isArray(workspaces)?workspaces:[];const taskGroups=await Promise.all(workspaceList.map(item=>{const workspaceId=item&&typeof item==='object'&&'workspaceId' in item?(item as {workspaceId?:unknown}).workspaceId:undefined;return typeof workspaceId==='string'?invoke('tasks.list',{workspaceId,includeArchived:true,limit:500}):null;}));
    const report=buildDiagnosticReport({appVersion:app.getVersion(),packaged:app.isPackaged,platform:process.platform,arch:process.arch,versions:{electron:process.versions.electron,chrome:process.versions.chrome,node:process.versions.node},runtimeConnected:!!channel&&runtimeReady,runtime,settings,workspaces:workspaceList,tasks:taskGroups.flatMap(value=>Array.isArray(value)?value:[]),runs:Array.isArray(runs)?runs:[],pages:Array.isArray(pages)?pages:[],extensions:extensionManager.list(profileSession()),regularWindows:regularWindows.size,health:browserHealth.summary()});
    const result=await dialog.showSaveDialog(state.win,{title:'Save Aux support report',defaultPath:join(app.getPath('downloads'),`aux-support-${new Date().toISOString().slice(0,10)}.json`),filters:[{name:'JSON report',extensions:['json']}]});
    if(result.canceled||!result.filePath)return null;try{await writeFile(result.filePath,JSON.stringify(report,null,2)+'\n',{encoding:'utf8',mode:0o600});chmodSync(result.filePath,0o600);return result.filePath;}catch{throw new Error('Couldn’t save the support report. Choose a writable destination and try again.');}
  });
  handleShell('app.exportRuntimeBackup', async state => {
    requireRuntime('The Aux runtime is not connected.');const backup=await runtimeInvoke('installation.createBackup', {}, 120_000) as {path:string;createdAt:number;bytes:number;schemaVersion:number;sha256:string;artifactFiles:number;missingArtifacts:number};const root=realpathSync(join(DATA_DIR,'backups')),source=realpathSync(backup.path),rel=relative(root,source),info=lstatSync(source);if(rel==='..'||rel.startsWith(`..${sep}`)||info.isSymbolicLink()||!info.isDirectory())throw new Error('The runtime returned an invalid backup folder.');const result=await dialog.showOpenDialog(state.win,{title:'Choose where to save the Aux recovery folder',defaultPath:app.getPath('downloads'),properties:['openDirectory','createDirectory']});if(result.canceled||!result.filePaths[0])return null;const parent=resolve(result.filePaths[0]),dataRelative=relative(resolve(DATA_DIR),parent);if(!dataRelative||(dataRelative!=='..'&&!dataRelative.startsWith(`..${sep}`)&&!isAbsolute(dataRelative)))throw new Error('Choose a folder outside the active Aux data directory.');const destination=join(parent,`Aux Task Data Backup ${new Date(backup.createdAt).toISOString().replace(/[:.]/g,'-')}`);await cp(source,destination,{recursive:true,errorOnExist:true,force:false});return{path:destination,bytes:backup.bytes,sha256:backup.sha256,artifactFiles:backup.artifactFiles,missingArtifacts:backup.missingArtifacts};
  });
  handleShell('app.stageRuntimeRestore', async state => {
    requireRuntime('The Aux runtime is not connected.');const selected=await dialog.showOpenDialog(state.win,{title:'Choose an Aux task data backup folder',properties:['openDirectory']});if(selected.canceled||!selected.filePaths[0])return null;const decision=await dialog.showMessageBox(state.win,{type:'warning',title:'Restore Aux task data on next launch?',message:'Replace Aux runtime data after you quit and reopen?',detail:'This restores tasks, conversations, evidence, browsing records, runtime preferences and available durable artifact files from the selected recovery folder. It does not restore website cookies, saved browser sign-ins, extensions, downloads, local project files, cloud resources or encrypted credentials. Aux keeps a recovery copy of the current runtime database. Continue using Aux only if you are comfortable that later runtime changes will be replaced on the next launch.',buttons:['Cancel','Stage restore'],defaultId:0,cancelId:0,noLink:true});if(decision.response!==1)return null;return runtimeInvoke('installation.stageRestore', {path:selected.filePaths[0]}, 120_000);
  });
  handleShell('app.cancelRuntimeRestore', async () => {requireRuntime('The Aux runtime is not connected.');return runtimeInvoke('installation.cancelRestore');});
  handleShell('app.runtimeRestoreStatus', () => runtimeRestoreStatus(DATA_DIR));
  handleShell('app.healthSummary', () => browserHealth.summary());
  handleShell('app.clearHealth', () => browserHealth.clear());
}
