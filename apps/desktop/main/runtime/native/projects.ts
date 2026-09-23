import { type ProjectCommandTask, RpcChannel, TaskSchema } from "@aux/contracts";
import { dialog } from "electron";
import { PRIMARY_WINDOW_ID } from "../../app/bootstrap.js";
import { localProjects, projectCommands, projectFiles } from "../../app/services.js";
import { normalizeLocalPreviewUrl } from "../../local-preview.js";
import { assertProjectEditable, projectCommandsActive, requireCurrentTask, savingProjects, withProjectLock } from "../../projects/lock.js";
import { focusedRegularWindow, stateForWindowId } from "../../windows/registry.js";
import { requireRuntime, runtimeInvoke } from "../supervisor.js";
import { onNative } from "./validate.js";

export function registerProjectMethods(ch: RpcChannel) {
  onNative(ch,'native.developmentProjects',async ({projectIds})=>{
    const ids=new Set(projectIds);
    return (await localProjects.list()).filter(project=>ids.has(project.projectId));
  });
  onNative(ch,'native.inspectProject',({projectId})=>localProjects.inspect(projectId));
  onNative(ch,'native.githubProject',({projectId})=>localProjects.githubIdentity(projectId));
  onNative(ch,'native.recordGithubStatus',input=>{return localProjects.recordGithubStatus(input.projectId,input.status);});
  onNative(ch,'native.writeIncidentReport',async input=>{
    const task=input.task;
    requireRuntime('Runtime not connected');const changed='The task or checkout attachment changed. Prepare the incident snapshot again.';
    await requireCurrentTask({taskId:task.taskId,expectedRevision:task.taskRevision},input.projectId,{revision:changed,detached:changed});
    const page={pageId:String(input.page.pageId).slice(0,200),url:String(input.page.url).slice(0,8192),title:String(input.page.title).slice(0,1000)};
    const consoleLines=(Array.isArray(input.console)?input.console:[]).slice(-100).filter(item=>item&&typeof item.level==='string'&&typeof item.message==='string').map(item=>({level:item.level.slice(0,40),message:item.message.slice(0,8000),...(typeof item.atMs==='number'?{atMs:item.atMs}:{})}));
    const network=(Array.isArray(input.network)?input.network:[]).slice(-100).filter(item=>item&&typeof item.method==='string'&&typeof item.url==='string').map(item=>({method:item.method.slice(0,20),url:item.url.slice(0,8192),...(typeof item.status==='number'?{status:item.status}:{}),...(typeof item.durationMs==='number'?{durationMs:item.durationMs}:{}),...(typeof item.startedAt==='number'?{startedAt:item.startedAt}:{})}));
    const operations=typeof input.operations==='string'?input.operations.slice(0,32*1024):undefined;
    return localProjects.writeIncidentReport(input.projectId,{task,page,console:consoleLines,network,operations},projectCommands.list(input.projectId));
  });
  onNative(ch,'native.listProjectFiles',async ({projectId})=>(await localProjects.files(projectId)).files);
  onNative(ch,'native.readProjectFile',input=>{return projectFiles.read(input.projectId,input.name);});
  onNative(ch,'native.projectSnapshotTree',({projectId})=>localProjects.snapshotTree(projectId));
  const confirmProjectChange=async(input:{projectId:string;name:string;content:string;task:ProjectCommandTask},create:boolean)=>{
    const task=input.task;const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');
    const project=(await localProjects.inspect(input.projectId)).project;
    const preview=input.content.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').slice(0,6000);
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:create?'Create project file':'Save agent file change',message:`${create?'Create':'Replace'} ${input.name} in the isolated checkout?`,
      detail:`Task: ${task.title} · Revision ${task.taskRevision}\nProject: ${project.name}\nPath: ${project.path}/${input.name}\nSize: ${Buffer.byteLength(input.content,'utf8').toLocaleString()} bytes\n\nContent preview${input.content.length>preview.length?' (truncated)':''}:\n${preview||'(Empty file)'}\n\nAux keeps recovery data for replacements. This does not change the original checkout, commit, push, or publish.`,
      buttons:['Cancel',create?'Create file':'Save change'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;
    requireRuntime('Runtime not connected');
    const current=TaskSchema.parse(await runtimeInvoke('tasks.prepareLocalCommand', {taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId}));
    if(current.revision!==task.taskRevision)throw new Error('Task revision changed; review the request again.');
    return task;
  };
  onNative(ch,'native.writeProjectFile',async input=>{
    
    if((await projectFiles.read(input.projectId,input.name)).sha256!==input.expectedHash)throw new Error('The file changed outside the agent session. Read it again before proposing a save.');
    assertProjectEditable(input.projectId,'saving');
    if(!await confirmProjectChange(input,false))return null;
    return withProjectLock(input.projectId,async()=>{assertProjectEditable(input.projectId,'saving');return projectFiles.save(input.projectId,input.name,input.expectedHash,input.content);});
  });
  onNative(ch,'native.createProjectFile',async input=>{
    assertProjectEditable(input.projectId,'creating');if(!await confirmProjectChange(input,true))return null;
    return withProjectLock(input.projectId,async()=>{assertProjectEditable(input.projectId,'creating');const created=await projectFiles.create(input.projectId,input.name);if(!input.content)return created;return projectFiles.save(input.projectId,input.name,created.sha256,input.content);});
  });
  const confirmProjectFileLifecycle=async(input:{projectId:string;name:string;nextName?:string;expectedHash:string;task:ProjectCommandTask},action:'rename'|'delete')=>{
    const task=input.task;const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');
    const project=(await localProjects.inspect(input.projectId)).project;const file=await projectFiles.read(input.projectId,input.name);
    if(file.sha256!==input.expectedHash)throw new Error('The file changed outside the agent session. Read it again before proposing this change.');
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:action==='rename'?'Rename agent project file':'Delete agent project file',message:action==='rename'?`Rename ${input.name} to ${input.nextName}?`:`Delete ${input.name} from the isolated checkout?`,
      detail:`Task: ${task.title} · Revision ${task.taskRevision}\nProject: ${project.name}\nCheckout: ${project.path}\nExpected file: ${input.expectedHash}\n\nAux will preserve the current file in recovery history. This does not change the original checkout, commit, push, or publish.`,
      buttons:['Cancel',action==='rename'?'Rename file':'Delete file'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;requireRuntime('Runtime not connected');
    const current=TaskSchema.parse(await runtimeInvoke('tasks.prepareLocalCommand', {taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId}));
    if(current.revision!==task.taskRevision)throw new Error('Task revision changed; review the request again.');
    return task;
  };
  onNative(ch,'native.renameProjectFile',async input=>{
    
    assertProjectEditable(input.projectId,'renaming');
    if(!await confirmProjectFileLifecycle(input,'rename'))return null;
    return withProjectLock(input.projectId,async()=>{assertProjectEditable(input.projectId,'renaming');return projectFiles.move(input.projectId,input.name,input.nextName,input.expectedHash);});
  });
  onNative(ch,'native.deleteProjectFile',async input=>{
    
    assertProjectEditable(input.projectId,'deleting');
    if(!await confirmProjectFileLifecycle(input,'delete'))return null;
    return withProjectLock(input.projectId,async()=>{assertProjectEditable(input.projectId,'deleting');return projectFiles.remove(input.projectId,input.name,input.expectedHash);});
  });
  onNative(ch,'native.projectCommands',({projectId})=>projectCommands.list(projectId));
  onNative(ch,'native.runProjectCommand',async input=>{
    const {command,mode}=input;const task=input.task;
    const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');const project=(await localProjects.inspect(input.projectId)).project;
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:mode==='service'?'Start agent-requested service':'Run agent-requested command',message:mode==='service'?'Keep this task service running?':'Run this task command?',
      detail:`Task: ${task.title} · Revision ${task.taskRevision}\n\n${command}\n\nWorking directory: ${project.path}\n\nThis is not a sandbox. The command can change local files and access the network. Aux uses a separate HOME and does not supply model credentials. Output is saved locally.`,buttons:['Cancel',mode==='service'?'Start service':'Run command'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;requireRuntime('Runtime not connected');
    const current=TaskSchema.parse(await runtimeInvoke('tasks.prepareLocalCommand', {taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId}));
    if(savingProjects.has(input.projectId))throw new Error('Wait for the file change before starting a command.');
    return projectCommands.start(project,command,{taskId:current.taskId,taskRevision:current.revision,title:current.title,workspaceId:current.workspaceId},mode);
  });
  onNative(ch,'native.approveCloudCommand',async input=>{
    const task=input.task;
    const {environment}=input;
    const remoteName=environment.remoteName.slice(0,200),runtime=environment.runtime.slice(0,100),region=environment.region.slice(0,100);if(!remoteName||!runtime||!region)throw new Error('Cloud environment details are invalid.');
    const {executable,args,mode}=input;const timeoutMinutes=input.timeoutMinutes===undefined?undefined:Math.max(5,Math.min(45,Math.trunc(input.timeoutMinutes)));
    const state=focusedRegularWindow();if(!state)throw new Error('Aux window is unavailable');state.win.show();state.win.focus();
    const command=[executable,...args].map(value=>/[\s"'\\]/.test(value)?JSON.stringify(value):value).join(' ').slice(0,8000);
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:mode==='service'?'Start agent-requested cloud service':'Run agent-requested cloud command',message:mode==='service'?'Start this service in the task cloud environment?':'Run this command in the task cloud environment?',detail:`Task: ${task.title} · Revision ${task.taskRevision}\nEnvironment: ${remoteName}\nRuntime: ${runtime} · ${region}${timeoutMinutes?` · ${timeoutMinutes}-minute limit`:''}\n\n${command}\n\nThis runs in the existing Vercel Sandbox and may consume billable compute and network. Aux will save the command state and output. It does not receive browser cookies, model credentials or local environment variables.`,buttons:['Cancel',mode==='service'?'Start service':'Run command'],defaultId:0,cancelId:0,noLink:true});
    return answer.response===1;
  });
  onNative(ch,'native.approveProjectPreview',async input=>{
    const task=input.task;const url=normalizeLocalPreviewUrl(input.url).href;
    const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');const project=(await localProjects.inspect(input.projectId)).project;
    const answer=await dialog.showMessageBox(state.win,{type:'question',title:'Open agent local preview',message:`Allow this task to open ${url}?`,detail:`Task: ${task.title} · Revision ${task.taskRevision}\nProject: ${project.name}\n\nAux will send a cookie-free loopback check, then open a browser tab only after a successful response. This grants this connection access to that preview tab until Aux restarts or the connection is revoked.`,buttons:['Cancel','Check and open'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;requireRuntime('Runtime not connected');
    await requireCurrentTask({taskId:task.taskId,expectedRevision:task.taskRevision},input.projectId,{revision:'Task revision changed; review the preview request again.',detached:'The checkout is no longer attached to this task.'});
    return localProjects.checkPreview(input.projectId,url);
  });
  onNative(ch,'native.stopProjectCommand',input=>{return projectCommands.stop(input.projectId,input.commandId);});
  onNative(ch,'native.prepareProjectReview',async input=>{const task=input.task;return localProjects.writeReviewSummary(input.projectId,await localProjects.inspect(input.projectId),projectCommands.list(input.projectId),task);});
  onNative(ch,'native.commitProject',async input=>{
    const request=input.request;const task=input.task;
    const state=stateForWindowId(PRIMARY_WINDOW_ID);if(!state)throw new Error('Aux window is unavailable');
    if(projectCommandsActive(input.projectId))throw new Error('Stop local commands and services before creating a commit.');
    if(savingProjects.has(input.projectId))throw new Error('Wait for the file change before creating a commit.');
    const review=await localProjects.writeReviewSummary(input.projectId,await localProjects.inspect(input.projectId),projectCommands.list(input.projectId),task);
    if(review.readiness.state!=='ready'||review.patch.sha256!==request.expectedPatchHash||review.snapshotTree!==request.expectedTree)throw new Error('The prepared handoff changed. Prepare it again before creating a commit.');
    const project=(await localProjects.inspect(input.projectId)).project;
    const answer=await dialog.showMessageBox(state.win,{type:'warning',title:'Create local commit',message:`Create a commit on ${project.branch}?`,detail:`Task: ${task.title} · Revision ${task.taskRevision}\n\n${request.message}\n\nAuthor: ${request.authorName} <${request.authorEmail}>\nPatch: ${request.expectedPatchHash}\n\nThis creates one local commit in Aux’s isolated checkout. It does not push, publish, or open a pull request. Repository hooks, commit signing, credential helpers, and network protocols are disabled.`,buttons:['Cancel','Create local commit'],defaultId:0,cancelId:0,noLink:true});
    if(answer.response!==1)return null;requireRuntime('Runtime not connected');
    const current=TaskSchema.parse(await runtimeInvoke('tasks.prepareLocalCommand', {taskId:task.taskId,expectedRevision:task.taskRevision,projectId:input.projectId}));
    if(current.revision!==task.taskRevision||!current.resources.some(resource=>resource.kind==='repository'&&resource.projectId===input.projectId))throw new Error('The task or checkout attachment changed. Review the commit again.');
    if(projectCommandsActive(input.projectId)||savingProjects.has(input.projectId))throw new Error('The checkout became busy. Review the commit again.');
    return localProjects.commit(input.projectId,request,projectCommands.list(input.projectId),task);
  });
}
