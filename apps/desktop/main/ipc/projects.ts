import { ProjectCommandContextSchema, ProjectCommandSchema, ProjectCommitRequestSchema, ProjectServiceStackRequestSchema, TaskSchema } from "@aux/contracts";
import { dialog, ipcMain, shell } from "electron";
import { localProjects, projectCommands, projectFiles } from "../app/services.js";
import { savingProjects } from "../projects/lock.js";
import { channel } from "../runtime/supervisor.js";
import { requireShellUi } from "../windows/registry.js";

export function wireProjectsIpc() {
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
}
