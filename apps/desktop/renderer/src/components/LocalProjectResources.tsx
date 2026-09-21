import {useEffect, useState} from 'react';
import type {LocalProject, RepositorySelection, ProjectInspection, ProjectReviewSummary, ProjectCommitResult, Task} from '@vector/contracts';
import {bridge} from '../bridge';
import {UntrackedFileReview} from './UntrackedFileReview';
import {CloudEnvironmentPanel} from './CloudEnvironmentPanel';
import {TaskWorkspace} from './TaskWorkspace';
import {useStore} from '../store';

type GithubStatus={owner:string;repository:string;remoteUrl:string;branch:string;baseCommit:string;headCommit:string;defaultBranch:string;private:boolean;account:string;permissions:{admin:boolean;maintain?:boolean;push:boolean;triage?:boolean;pull:boolean};basePresent:boolean;headPresent:boolean;checks:{state:string;total:number;updatedAt:number}|null;checkRuns:{id:number;name:string;status:string;conclusion:string|null;detailsUrl:string|null}[];pullRequests:{number:number;title:string;url:string;draft:boolean;base:string;head:string;updatedAt:string}[];issues:{number:number;title:string;url:string;body:string|null;author:string;labels:string[];updatedAt:string}[];checkedAt:number};
type OperationsStatus={checkedAt:number;vercel?:{project:{id:string;name:string;framework:string|null};deployments:{id:string;name:string;url:string;state:string;target:string|null;createdAt:number;readyAt:number|null}[]};sentry?:{organization:string;project:{id:string;name:string;slug:string;platform:string|null};issues:{id:string;shortId:string;title:string;level:string;status:string;count:number;users:number;firstSeen:string;lastSeen:string;permalink:string}[]};unavailable:string[]};

export function LocalProjectResources({task,update,onEvidenceImported}:{task:Task;update:(resources:Task['resources'])=>Promise<boolean>;onEvidenceImported?:()=>Promise<void>|void}) {
  const [projects,setProjects]=useState<LocalProject[]>([]);
  const [selection,setSelection]=useState<RepositorySelection|null>(null);
  const [newProjectName,setNewProjectName]=useState('');
  const [creatingBlank,setCreatingBlank]=useState(false);
  const [inspection,setInspection]=useState<ProjectInspection|null>(null);
  const [review,setReview]=useState<ProjectReviewSummary|null>(null);
  const [commit,setCommit]=useState<ProjectCommitResult|null>(null);
  const [commitMessage,setCommitMessage]=useState('');
  const [authorName,setAuthorName]=useState('');
  const [authorEmail,setAuthorEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [fileProject,setFileProject]=useState<string|null>(null);
  const [error,setError]=useState('');
  const [github,setGithub]=useState<Record<string,GithubStatus>>({});
  const [operations,setOperations]=useState<Record<string,OperationsStatus>>({});
  const [cloudProject,setCloudProject]=useState<string|null>(null);
  async function load(){setProjects(await bridge.listProjects());}
  useEffect(()=>{void load().catch(error=>setError(String(error)));},[task.taskId,task.revision]);
  async function action(work:()=>Promise<void>){
    setBusy(true);setError('');try{await work();}catch(error){setError((error instanceof Error?error.message:String(error)).replace(/^Error invoking remote method [^:]+: Error: /,''));}finally{setBusy(false);}
  }
  async function attach(project:LocalProject){
    if(task.resources.some(resource=>resource.projectId===project.projectId))return;
    await update([...task.resources,{resourceId:crypto.randomUUID(),kind:'repository',projectId:project.projectId,locator:project.path,label:`${project.name} · ${project.branch}`.slice(0,200),access:'write'}]);
  }
  async function attachUrl(locator:string,label:string){
    if(task.resources.some(resource=>resource.kind==='url'&&resource.locator===locator))return;
    await update([...task.resources,{resourceId:crypto.randomUUID(),kind:'url',locator,label:label.slice(0,200)}]);
  }
  function deploymentUrl(value:string){return /^https?:\/\//i.test(value)?value:`https://${value}`;}
  return <details className="local-projects"><summary>Local projects</summary><div className="field">
    <p className="hint">Attach an isolated checkout from a saved Git commit, or start a blank managed project. Setup never runs repository scripts, dependencies or commands.</p>
    <div className="row"><button className="btn sm" disabled={busy||task.state==='archived'} onClick={()=>void action(async()=>{setSelection(await bridge.selectRepository());setInspection(null);})}>Select repository</button><button className="btn sm" disabled={busy||task.state==='archived'} aria-expanded={creatingBlank} onClick={()=>setCreatingBlank(!creatingBlank)}>New blank project</button></div>
    {creatingBlank&&<form className="field" aria-label="Create blank project" onSubmit={event=>{event.preventDefault();if(!newProjectName.trim())return;void action(async()=>{const project=await bridge.createBlankProject(newProjectName);await attach(project);setNewProjectName('');setCreatingBlank(false);setInspection(await bridge.inspectProject(project.projectId));await load();});}}><strong>Blank managed project</strong><span className="hint">Creates an empty local Git baseline inside Aux. Add files with the built-in editor, then use the same commands, preview, recovery and review workflow as an imported repository. Nothing is published.</span><div className="row"><input aria-label="Blank project name" autoFocus maxLength={80} placeholder="My app" value={newProjectName} onChange={event=>setNewProjectName(event.target.value)}/><button className="btn sm" disabled={busy||!newProjectName.trim()||task.resources.length>=100}>Create and attach</button><button className="btn sm" type="button" disabled={busy} onClick={()=>setCreatingBlank(false)}>Cancel</button></div></form>}
    {selection&&<section className="task-resource" aria-label="Repository setup">
      <strong>{selection.name}</strong><span className="hint selectable">{selection.path}</span>
      <pre className="evidence-text">{selection.status}</pre>
      <span className="hint selectable">Base commit: {selection.commit}</span>
      <p className="hint">The new checkout includes this saved commit only. Staged, unstaged and untracked files are not copied. Hooks and configured filters are disabled; submodules and large-file content are not downloaded.</p>
      <div className="row"><button className="btn sm" disabled={busy||task.resources.length>=100} onClick={()=>void action(async()=>{
        let project:LocalProject;
        try { project=await bridge.createProject(selection.selectionId); } finally { setSelection(null); await load(); }
        await attach(project);
      })}>{busy?'Creating checkout…':'Create isolated checkout'}</button>
      <button className="btn sm" disabled={busy} onClick={()=>setSelection(null)}>Cancel setup</button></div>
    </section>}
    {error&&<p role="alert">{error}</p>}
    {projects.map(project=>{
      const attached=task.resources.some(resource=>resource.projectId===project.projectId);
      return <section className="task-resource" key={project.projectId} aria-label={`Local project ${project.name}`}>
        <strong>{project.name}</strong><span className="hint selectable">{project.branch} · {project.state==='ready'?'Ready':project.state==='creating'?'Setup interrupted or still in progress':'Setup incomplete'}{attached?' · Attached to this task':''}</span>
        <span className="hint selectable">{project.path}</span>
        {project.error&&<p className="hint">{project.error}</p>}
        <div className="row">
          <button className="btn sm" disabled={busy} onClick={()=>void action(async()=>{setInspection(await bridge.inspectProject(project.projectId));setReview(null);setCommit(null);await load();})}>Inspect checkout</button>
          <button className="btn sm" disabled={busy||project.state!=='ready'} onClick={()=>void action(async()=>{const current=await bridge.inspectProject(project.projectId);await bridge.revealPath(current.project.path);})}>Show in Finder</button>
          {!attached&&<button className="btn sm" disabled={busy||task.state==='archived'||task.resources.length>=100||project.state!=='ready'} onClick={()=>void action(()=>attach(project))}>Attach to task</button>}
          <button className="btn sm" disabled={project.state!=='ready'} aria-expanded={fileProject===project.projectId} onClick={()=>setFileProject(fileProject===project.projectId?null:project.projectId)}>Workspace</button>
          {attached&&<button className="btn sm" disabled={busy||project.state!=='ready'} onClick={()=>void action(async()=>{const status=await bridge.invoke('development.githubStatus',{taskId:task.taskId,expectedRevision:task.revision,projectId:project.projectId}) as GithubStatus;setGithub(current=>({...current,[project.projectId]:status}));})}>Check GitHub</button>}
          {attached&&<button className="btn sm" disabled={busy||project.state!=='ready'} onClick={()=>void action(async()=>{const status=await bridge.invoke('development.operationsStatus',{taskId:task.taskId,expectedRevision:task.revision,projectId:project.projectId}) as OperationsStatus;setOperations(current=>({...current,[project.projectId]:status}));})}>Check operations</button>}
          {attached&&<button className="btn sm" disabled={busy||project.state!=='ready'} aria-expanded={cloudProject===project.projectId} onClick={()=>setCloudProject(cloudProject===project.projectId?null:project.projectId)}>Cloud</button>}
        </div>
        {github[project.projectId]&&<section className="field" aria-label="GitHub repository status"><strong>{github[project.projectId]!.owner}/{github[project.projectId]!.repository}</strong><span className="hint">Connected as @{github[project.projectId]!.account} · {github[project.projectId]!.private?'Private':'Public'} · default {github[project.projectId]!.defaultBranch||'unknown'} · {github[project.projectId]!.permissions.push?'write access':'read-only access'}</span><span className="hint">Baseline {github[project.projectId]!.basePresent?'exists on GitHub':'not found on GitHub'} · local head {github[project.projectId]!.headPresent?'exists on GitHub':'has not been found remotely'}{github[project.projectId]!.checks?` · commit status ${github[project.projectId]!.checks!.state} (${github[project.projectId]!.checks!.total})`:''} · checked {new Date(github[project.projectId]!.checkedAt).toLocaleString()}</span>{github[project.projectId]!.checkRuns.length>0&&<span className="hint">Checks: {github[project.projectId]!.checkRuns.slice(0,8).map(run=>`${run.name} · ${run.conclusion??run.status}`).join(' · ')}</span>}{github[project.projectId]!.pullRequests.map(pull=><span className="hint" key={pull.number}>Existing {pull.draft?'draft ':''}PR #{pull.number} · {pull.title} · {pull.base} ← {pull.head}</span>)}<div className="row"><button className="btn sm" onClick={()=>void useStore.getState().newTab(github[project.projectId]!.remoteUrl).then(()=>useStore.getState().setOverlay(null))}>Open repository</button>{github[project.projectId]!.pullRequests[0]&&<button className="btn sm" onClick={()=>void useStore.getState().newTab(github[project.projectId]!.pullRequests[0]!.url).then(()=>useStore.getState().setOverlay(null))}>Open pull request</button>}</div>{github[project.projectId]!.issues.length>0&&<details><summary>Open issues · {github[project.projectId]!.issues.length}</summary>{github[project.projectId]!.issues.map(issue=>{const attachedIssue=task.resources.some(resource=>resource.kind==='url'&&resource.locator===issue.url);return <div className="task-resource" key={issue.number}><strong>#{issue.number} · {issue.title}</strong><span className="hint">@{issue.author}{issue.labels.length?` · ${issue.labels.join(', ')}`:''} · updated {issue.updatedAt?new Date(issue.updatedAt).toLocaleString():'unknown'}</span>{issue.body&&<p className="hint selectable">{issue.body.slice(0,600)}{issue.body.length>600?'…':''}</p>}<div className="row"><button className="btn sm" onClick={()=>void useStore.getState().newTab(issue.url).then(()=>useStore.getState().setOverlay(null))}>Open issue</button><button className="btn sm" disabled={busy||attachedIssue||task.state==='archived'||task.resources.length>=100} onClick={()=>void action(()=>attachUrl(issue.url,`GitHub issue #${issue.number} · ${issue.title}`))}>{attachedIssue?'Attached':'Attach to task'}</button></div></div>;})}</details>}</section>}
        {operations[project.projectId]&&<section className="field" aria-label="Deployment and incident status">
          <strong>Operations health</strong>
          {operations[project.projectId]!.vercel&&<>{(()=>{const deployment=operations[project.projectId]!.vercel!.deployments[0];if(!deployment)return <span className="hint">Vercel · {operations[project.projectId]!.vercel!.project.name} · no deployments found</span>;const url=deploymentUrl(deployment.url);const attachedDeployment=task.resources.some(resource=>resource.kind==='url'&&resource.locator===url);return <div className="task-resource"><strong>Vercel · {operations[project.projectId]!.vercel!.project.name}</strong><span className="hint">{deployment.state}{deployment.target?` · ${deployment.target}`:''} · deployed {new Date(deployment.createdAt).toLocaleString()}</span><div className="row"><button className="btn sm" onClick={()=>void useStore.getState().newTab(url).then(()=>useStore.getState().setOverlay(null))}>Open latest deployment</button><button className="btn sm" disabled={busy||attachedDeployment||task.state==='archived'||task.resources.length>=100} onClick={()=>void action(()=>attachUrl(url,`Vercel deployment · ${operations[project.projectId]!.vercel!.project.name} · ${deployment.state}`))}>{attachedDeployment?'Attached':'Attach to task'}</button></div></div>;})()}</>}
          {operations[project.projectId]!.sentry&&<><span className="hint">Sentry · {operations[project.projectId]!.sentry!.project.name} · {operations[project.projectId]!.sentry!.issues.length} recent unresolved issue{operations[project.projectId]!.sentry!.issues.length===1?'':'s'}</span>{operations[project.projectId]!.sentry!.issues.slice(0,10).map(issue=>{const attachedIssue=task.resources.some(resource=>resource.kind==='url'&&resource.locator===issue.permalink);return <div className="task-resource" key={issue.id}><strong>{issue.shortId} · {issue.title}</strong><span className="hint">{issue.level} · {issue.count} event{issue.count===1?'':'s'} · {issue.users} user{issue.users===1?'':'s'} · last seen {issue.lastSeen?new Date(issue.lastSeen).toLocaleString():'unknown'}</span><div className="row"><button className="btn sm" onClick={()=>void useStore.getState().newTab(issue.permalink).then(()=>useStore.getState().setOverlay(null))}>Open issue</button><button className="btn sm" disabled={busy||attachedIssue||task.state==='archived'||task.resources.length>=100} onClick={()=>void action(()=>attachUrl(issue.permalink,`Sentry issue ${issue.shortId} · ${issue.title}`))}>{attachedIssue?'Attached':'Attach to task'}</button></div></div>;})}</>}
          {operations[project.projectId]!.unavailable.map(message=><span className="hint" key={message}>{message}</span>)}<span className="hint">Read-only check · {new Date(operations[project.projectId]!.checkedAt).toLocaleString()}</span>
        </section>}
        {cloudProject===project.projectId&&<CloudEnvironmentPanel task={task} projectId={project.projectId} onEvidenceImported={onEvidenceImported}/>}
        {fileProject===project.projectId&&<TaskWorkspace project={project} task={task} inspection={inspection?.project.projectId===project.projectId?inspection:null} attached={attached} busy={busy} onInspect={async()=>{setInspection(await bridge.inspectProject(project.projectId));await load();}} onEvidenceImported={onEvidenceImported}/>}
      </section>;
    })}
    {inspection&&<section className="task-resource" aria-label="Checkout status"><strong>{inspection.project.name} · Working tree</strong>
      <span className="hint">Inspected {new Date(inspection.inspectedAt).toLocaleString()}. Refresh to see external edits.</span>
      <pre className="evidence-text">{inspection.status}</pre>
      <div className="row"><button className="btn sm" disabled={busy} onClick={()=>void action(async()=>setInspection(await bridge.inspectProject(inspection.project.projectId)))}>Refresh checkout status</button>
      <button className="btn sm" disabled={busy} onClick={()=>void action(async()=>{const next=await bridge.prepareProjectReview(inspection.project.projectId,{taskId:task.taskId,expectedRevision:task.revision});setReview(next);setCommit(null);setCommitMessage(next.title);setInspection(await bridge.inspectProject(inspection.project.projectId));})}>Prepare delivery handoff</button></div>
      {review&&<section className="field" aria-label="Prepared change review">
        <strong>{review.readiness.state==='ready'?'Ready for local review':'Delivery handoff needs attention'}</strong><span className="hint">{review.title} · saved locally {new Date(review.generatedAt).toLocaleString()}. No commit, push or pull request was created.</span>
        {review.readiness.reasons.length>0&&<ul className="project-handoff-reasons">{review.readiness.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>}
        <div className="row"><button className="btn sm" onClick={()=>void action(async()=>{const error=await bridge.openPath(review.path);if(error)throw new Error(error);})}>Open summary</button><button className="btn sm" onClick={()=>void action(async()=>{const error=await bridge.openPath(review.draft.path);if(error)throw new Error(error);})}>Open PR draft</button>{review.patch.complete&&review.patch.content!=null&&<button className="btn sm" onClick={()=>void action(async()=>{await bridge.saveFile(`${inspection.project.name}-changes.patch`,review.patch.content!);})}>Export patch…</button>}<button className="btn sm" onClick={()=>void action(()=>bridge.revealPath(review.manifestPath).then(()=>{}))}>Show handoff files</button></div>
        <span className="hint selectable">Manifest {review.manifestSha256.slice(0,12)}… · Draft {review.draft.sha256.slice(0,12)}…{review.patch.sha256?` · Patch ${review.patch.sha256.slice(0,12)}…`:''}</span>
        {!review.patch.complete&&<p role="alert">Portable patch unavailable: {review.patch.error}</p>}
        {review.readiness.state==='ready'&&review.patch.sha256&&<div className="project-commit-form" aria-label="Local commit details">
          <label>Commit message<input value={commitMessage} maxLength={200} onChange={event=>setCommitMessage(event.target.value)} /></label>
          <div className="project-commit-identity"><label>Author name<input value={authorName} maxLength={200} autoComplete="name" onChange={event=>setAuthorName(event.target.value)} /></label><label>Author email<input value={authorEmail} maxLength={320} type="email" autoComplete="email" onChange={event=>setAuthorEmail(event.target.value)} /></label></div>
          <p className="hint">Aux uses only the identity entered here. It does not read your global Git identity, password manager, signing keys, or credentials.</p>
          <button className="btn sm" disabled={busy||!commitMessage.trim()||!authorName.trim()||!authorEmail.trim()} onClick={()=>void action(async()=>{const result=await bridge.commitProject(inspection.project.projectId,{expectedPatchHash:review.patch.sha256!,expectedTree:review.snapshotTree,message:commitMessage,authorName,authorEmail},{taskId:task.taskId,expectedRevision:task.revision});if(result){setCommit(result);setReview(null);setInspection(await bridge.inspectProject(inspection.project.projectId));await load();}})}>Review local commit</button>
        </div>}
        <details><summary>Preview summary</summary><pre className="project-diff" tabIndex={0} aria-label="Prepared review summary">{review.content}</pre></details>
        <details><summary>Preview PR draft</summary><pre className="project-diff" tabIndex={0} aria-label="Prepared PR draft">{review.draft.content}</pre></details>
      </section>}
      {commit&&<section className="field project-commit-result" aria-label="Local commit created"><strong>Local commit created</strong><span className="hint selectable">{commit.commit.slice(0,12)} · {commit.message}</span><p className="hint">The reviewed snapshot is committed in Aux’s isolated checkout. Nothing was pushed or published.</p><button className="btn sm" onClick={()=>void action(()=>bridge.revealPath(commit.indexRecoveryPath).then(()=>{}))}>Show index recovery copy</button></section>}
      <details className="project-changes"><summary>Review changes</summary>
        <p className="hint">Compared with saved commit {inspection.project.baseCommit.slice(0,12)}. Includes committed, staged and working-tree edits. Refresh after editing. Binary content, ignored files and submodule contents are not shown.</p>
        {inspection.changes.error?<p role="alert">{inspection.changes.error}</p>:<>
          {inspection.changes.patch?<pre className="project-diff" tabIndex={0} aria-label="Changes from saved commit">{inspection.changes.patch.split('\n').map((line,index)=><span key={index} className={line.startsWith('+')&&!line.startsWith('+++')?'diff-added':line.startsWith('-')&&!line.startsWith('---')?'diff-removed':line.startsWith('@@')?'diff-location':''}>{line}{'\n'}</span>)}</pre>:<p className="hint">No tracked changes from the saved commit.</p>}
          {inspection.changes.untracked.length>0&&<UntrackedFileReview key={`${inspection.project.projectId}:${inspection.inspectedAt}`} projectId={inspection.project.projectId} names={inspection.changes.untracked}/>}
        </>}
      </details>
    </section>}
  </div></details>;
}
