import { ProjectCommandContextSchema, ProjectCommandSchema, ProjectCommitRequestSchema, ProjectServiceStackRequestSchema, TaskSchema } from "@aux/contracts";
import { dialog, shell } from "electron";
import { localProjects, projectCommands, projectFiles } from "../app/services.js";
import { assertProjectEditable, projectCommandsActive, requireCurrentTask, savingProjects, withProjectLock } from "../projects/lock.js";
import { requireRuntime, runtimeInvoke } from "../runtime/supervisor.js";
import { handleShell } from "../windows/registry.js";

export function wireProjectsIpc() {
  handleShell("ui.selectRepository", async state => {
    const result = await dialog.showOpenDialog(state.win, { title: "Select a local repository", properties: ["openDirectory"] });
    return result.canceled || !result.filePaths[0] ? null : localProjects.select(result.filePaths[0]);
  });
  handleShell("ui.createProject", (_, id: string) => localProjects.create(id));
  handleShell("ui.createBlankProject", (_, name: string) => localProjects.createBlank(name));
  handleShell("ui.listProjects", () => localProjects.list());
  handleShell("ui.inspectProject", (_, id: string) => localProjects.inspect(id));
  handleShell("ui.checkLocalPreview", (_, id: string, url: string) => localProjects.checkPreview(id,url));
  handleShell("ui.listProjectFiles", async (_, id: string) => (await localProjects.files(id)).files);
  handleShell("ui.readProjectFile", (_, id: string, name: string) => projectFiles.read(id,name));
  handleShell("ui.createProjectFile", async (_, id: string, name: string) => {
    assertProjectEditable(id,"creating");
    return withProjectLock(id,()=>projectFiles.create(id,name),"A file is already being saved in this project.");
  });
  handleShell("ui.projectFileHistory", (_, id: string, name: string) => projectFiles.history(id,name));
  handleShell("ui.readProjectFileVersion", (_, id: string, name: string, versionId: string) => projectFiles.readVersion(id,name,versionId));
  handleShell("ui.saveProjectFile", async (_, id: string, name: string, hash: string, content: string) => {
    assertProjectEditable(id,"saving");
    return withProjectLock(id,()=>projectFiles.save(id,name,hash,content),"A file is already being saved in this project.");
  });
  handleShell("ui.renameProjectFile", async (_, id: string, name: string, nextName: string, hash: string) => {
    assertProjectEditable(id,"renaming");
    return withProjectLock(id,()=>projectFiles.move(id,name,nextName,hash));
  });
  handleShell("ui.deleteProjectFile", async (state, id: string, name: string, hash: string) => {
    assertProjectEditable(id,"deleting");
    if(savingProjects.has(id))throw new Error("A file is already being changed in this project.");
    const file=await projectFiles.read(id,name);
    if(file.sha256!==hash)throw new Error('The file changed outside Aux. Reload it before deleting.');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Delete checkout file',message:`Delete ${name} from this isolated checkout?`,detail:'Aux will retain a recovery copy outside the Git working tree. The original repository checkout is not changed.',buttons:['Cancel','Delete file'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;
    return withProjectLock(id,()=>projectFiles.remove(id,name,hash));
  });
  handleShell("ui.openProjectFileExternal", async (_, id: string, name: string, context: unknown) => {
    requireRuntime('Runtime not connected');
    await requireCurrentTask(ProjectCommandContextSchema.parse(context),id,{revision:'The task revision changed. Reopen it before editing outside Aux.',detached:'Attach this checkout to the current task before editing outside Aux.'});
    const path=await projectFiles.externalPath(id,name);const error=await shell.openPath(path);
    if(error)throw new Error(`Couldn’t open this file in its default app: ${error}`);return true;
  });
  handleShell("ui.prepareProjectReview", async (_, id: string, context: unknown) => {
    requireRuntime('Runtime not connected');
    const task=await requireCurrentTask(ProjectCommandContextSchema.parse(context),id,{revision:'The task revision changed. Reopen it before preparing delivery.',detached:'Attach this checkout to the current task before preparing delivery.'});
    const inspection=await localProjects.inspect(id);
    return localProjects.writeReviewSummary(id,inspection,projectCommands.list(id),{taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,workspaceId:task.workspaceId});
  });
  handleShell("ui.commitProject", async (state, id: string, input: unknown, context: unknown) => {
    requireRuntime('Runtime not connected');const request=ProjectCommitRequestSchema.parse(input);const selection=ProjectCommandContextSchema.parse(context);
    const currentTask=()=>requireCurrentTask(selection,id,{revision:'The task revision changed. Reopen it before creating a commit.',detached:'Attach this checkout to the current task before creating a commit.'});
    if(projectCommandsActive(id))throw new Error('Stop local commands and services before creating a commit.');
    if(savingProjects.has(id))throw new Error('Wait for the file change before creating a commit.');
    const task=await currentTask();const reviewContext={taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,workspaceId:task.workspaceId};const inspected=await localProjects.inspect(id);
    const review=await localProjects.writeReviewSummary(id,inspected,projectCommands.list(id),reviewContext);
    if(review.readiness.state!=='ready'||review.patch.sha256!==request.expectedPatchHash||review.snapshotTree!==request.expectedTree)throw new Error('The prepared handoff changed. Prepare it again before creating a commit.');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Create local commit',message:`Create a commit on ${inspected.project.branch}?`,detail:`Task: ${task.title} · Revision ${task.revision}\nBranch: ${inspected.project.branch}\n\n${request.message}\n\nAuthor: ${request.authorName} <${request.authorEmail}>\nPatch: ${request.expectedPatchHash}\n\nThis creates one local commit in Aux’s isolated checkout. It does not push, publish, or open a pull request. Repository hooks, commit signing, credential helpers, and network protocols are disabled.`,buttons:['Cancel','Create local commit'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;const refreshed=await currentTask();
    if(refreshed.revision!==task.revision||projectCommandsActive(id)||savingProjects.has(id))throw new Error('The task or checkout changed. Review the commit again.');
    return localProjects.commit(id,request,projectCommands.list(id),reviewContext);
  });
  handleShell("ui.listProjectCommands", (_, id: string) => projectCommands.list(id));
  handleShell("ui.stopProjectCommand", (_, projectId: string, id: string) => projectCommands.stop(projectId,id));
  handleShell("ui.stopProjectServiceStack", (_, projectId:string,stackId:string) => projectCommands.stopStack(projectId,stackId));
  handleShell("ui.runProjectCommand", async (state, id: string, input: string, context: unknown, requestedMode: unknown) => {
    const command = ProjectCommandSchema.shape.command.parse(input);
    const mode = ProjectCommandSchema.shape.mode.parse(requestedMode);
    const selection = ProjectCommandContextSchema.parse(context);
    requireRuntime('Runtime not connected');
    const prepare=async()=>TaskSchema.parse(await runtimeInvoke('tasks.prepareLocalCommand', {...selection,projectId:id}));
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
  handleShell("ui.runProjectServiceStack", async(state, id:string,input:unknown,context:unknown) => {
    const request=ProjectServiceStackRequestSchema.parse(input);const selection=ProjectCommandContextSchema.parse(context);
    requireRuntime('Runtime not connected');
    const prepare=async()=>TaskSchema.parse(await runtimeInvoke('tasks.prepareLocalCommand', {...selection,projectId:id}));
    const reviewed=await prepare();const inspected=await localProjects.inspect(id);
    const ordered=request.commands.map((command,index)=>`${index+1}. ${command}`).join('\n');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Start local service stack',message:`Start ${request.commands.length} services in this checkout?`,detail:`Task: ${reviewed.title} · Revision ${reviewed.revision}\n\n${ordered}\n\nWorking directory: ${inspected.project.path}\n\nAux starts these commands in the shown order and keeps separate output for each. If a service fails, the remaining stack stops. This is not a sandbox: commands can change files and access the network. Aux uses a separate HOME and does not supply model credentials.`,buttons:['Cancel','Start services'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;if(savingProjects.has(id))throw new Error('Wait for the file save before starting services.');
    const current=await localProjects.inspect(id);const task=await prepare();if(savingProjects.has(id))throw new Error('Wait for the file save before starting services.');
    return projectCommands.startStack(current.project,request.commands,{taskId:task.taskId,taskRevision:task.revision,title:task.title,workspaceId:task.workspaceId},request.label);
  });
}
