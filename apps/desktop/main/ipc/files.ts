import { app, dialog, shell } from "electron";
import { lstatSync, realpathSync } from "node:fs";
import { copyFile, rm, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve, sep } from "node:path";
import { DATA_DIR } from "../app/bootstrap.js";
import { downloadLocation } from "../app/services.js";
import { readEvidenceDocument } from "../document-evidence.js";
import { readEvidenceImage } from "../image-evidence.js";
import { openablePath } from "../open-path-policy.js";
import { channel, runtimeInvoke } from "../runtime/supervisor.js";
import { saveWorkbookSnapshot } from "../save-workbook.js";
import { handleShell } from "../windows/registry.js";

export function wireFilesIpc() {
  handleShell("ui.pickEvidenceImage", async state => {
    const result = await dialog.showOpenDialog(state.win, { title: "Choose an image", properties: ["openFile"],
      filters: [{ name: "Images (up to 16 MB)", extensions: ["png", "jpg", "jpeg", "webp"] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    return readEvidenceImage(result.filePaths[0]);
  });
  handleShell("ui.pickEvidenceDocument", async state => {
    const result = await dialog.showOpenDialog(state.win, { title: "Attach a document", properties: ["openFile"],
      filters: [{ name: "Documents", extensions: ["txt", "md", "csv", "json", "docx", "xlsx", "pdf"] }, { name: "PDF, Word & Excel (up to 16 MB)", extensions: ["pdf", "docx", "xlsx"] }, { name: "Text documents (up to 512 KB)", extensions: ["txt", "md", "csv", "json"] }] });
    if (result.canceled || !result.filePaths[0]) return null;
    return readEvidenceDocument(result.filePaths[0]);
  });
  handleShell("ui.openFile", async state => {
    const r = await dialog.showOpenDialog(state.win, { title: "Open File", properties: ["openFile"] });
    return r.canceled || r.filePaths.length === 0 ? null : r.filePaths[0];
  });
  handleShell("ui.openPluginDirectory", async state => {
    const r = await dialog.showOpenDialog(state.win, {
      title: "Choose a Claude Code plugin directory",
      properties: ["openDirectory"],
    });
    return r.canceled || r.filePaths.length === 0 ? null : r.filePaths[0];
  });
  const openRoots = () => [DATA_DIR, downloadLocation.status().path, app.getPath("downloads")];
  handleShell("ui.revealPath", (_, p: unknown) => {
    const target = openablePath(p, openRoots()) ?? (typeof p === "string" && isAbsolute(p) ? p : null);
    if (!target) return false;
    // revealing selects the item in Finder; it never launches it
    shell.showItemInFolder(target);
    return true;
  });
  handleShell("ui.openPath", async (_, p: unknown) => {
    const target = openablePath(p, openRoots());
    if (!target) return "Aux opens documents from its downloads and workspace folders only. Use Reveal to show this file in Finder.";
    return shell.openPath(target);
  });
  handleShell("ui.saveWorkbook", (state, content:unknown,format:unknown) => saveWorkbookSnapshot(state.win,content,false,format));
  handleShell("ui.saveFile", async (state, name: string, content: string) => {
    if (typeof name !== "string" || typeof content !== "string") throw new Error("Invalid export content");
    const leaf = basename(name);
    const safeName = leaf && leaf !== "." && leaf !== ".." ? leaf : "export";
    const r = await dialog.showSaveDialog(state.win, { defaultPath: join(app.getPath("downloads"), safeName) });
    if (r.canceled || !r.filePath) return null;
    try { await writeFile(r.filePath, content, "utf8"); }
    catch { throw new Error("Couldn’t save the export. Choose a writable destination and try again."); }
    return r.filePath;
  });
  handleShell('ui.saveCloudExport', async(state, sourcePath:unknown,suggestedName:unknown) => {
    const root=resolve(DATA_DIR,'cloud-exports');
    if(typeof sourcePath!=='string'||typeof suggestedName!=='string')throw new Error('Invalid cloud export.');
    let source:string;try{source=realpathSync(sourcePath);}catch{throw new Error('The cloud export is no longer available.');}
    const rel=relative(realpathSync(root),source);const stat=lstatSync(source);if(rel==='..'||rel.startsWith(`..${sep}`)||stat.isSymbolicLink()||!stat.isFile()||stat.size>100*1024*1024)throw new Error('The cloud export is outside Aux storage or too large.');
    const safeName=basename(suggestedName).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,180)||'aux-cloud-workspace.tar.gz';
    try{const result=await dialog.showSaveDialog(state.win,{title:'Save cloud workspace',defaultPath:join(app.getPath('downloads'),safeName),filters:[{name:'Compressed archive',extensions:['gz']} ]});if(result.canceled||!result.filePath)return null;await copyFile(source,result.filePath);return result.filePath;}finally{await rm(source,{force:true});}
  });
  handleShell('ui.saveStoredArtifact', async(state, artifactId:unknown,suggestedName:unknown) => {
    if(!channel||typeof artifactId!=='string'||typeof suggestedName!=='string'||artifactId.length>200)throw new Error('Invalid saved artifact request.');
    const value=await runtimeInvoke('artifacts.read', {artifactId}, 30_000) as {artifact?:{artifactId?:string;size?:number};dataBase64?:string};
    if(value.artifact?.artifactId!==artifactId||typeof value.artifact.size!=='number'||value.artifact.size>25*1024*1024||typeof value.dataBase64!=='string')throw new Error('The saved artifact is unavailable or too large.');
    const data=Buffer.from(value.dataBase64,'base64');if(data.length!==value.artifact.size)throw new Error('The saved artifact failed integrity validation.');
    const safeName=basename(suggestedName).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,180)||'aux-task-artifact';const result=await dialog.showSaveDialog(state.win,{title:'Save preserved task artifact',defaultPath:join(app.getPath('downloads'),safeName)});if(result.canceled||!result.filePath)return null;await writeFile(result.filePath,data);return result.filePath;
  });
  handleShell("app.dataDir", () => DATA_DIR);
}
