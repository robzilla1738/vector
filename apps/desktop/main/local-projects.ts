import {checkLocalPreview} from './local-preview.js';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {createHash,randomUUID} from 'node:crypto';
import {chmod,copyFile,lstat,mkdir, readFile, readdir, rename, unlink, writeFile, realpath} from 'node:fs/promises';
import {basename, isAbsolute, join, resolve} from 'node:path';
import {LocalProjectSchema,ProjectCommitRequestSchema,ProjectGithubStatusSchema,type LocalProject, type RepositorySelection, type ProjectInspection, type ProjectCommand, type ProjectCommitRequest, type ProjectCommitResult, type ProjectReviewContext, type ProjectReviewSummary, type ProjectGithubStatus, type ProjectIncidentReport, type ProjectCommandTask} from '@aux/contracts';
import {inspectProjectEnvironment} from './project-environment.js';
const exec = promisify(execFile);
const ID = /^[a-f0-9-]{36}$/;
// Fixed executable, no shell, no ambient Git configuration/authentication or lazy fetch.
const env = {PATH:'/usr/bin:/bin', GIT_CONFIG_NOSYSTEM:'1', GIT_CONFIG_GLOBAL:'/dev/null',
  GIT_TERMINAL_PROMPT:'0', GIT_NO_LAZY_FETCH:'1', LC_ALL:'C', GIT_OPTIONAL_LOCKS:'0'};
const safe = ['--no-optional-locks','-c','core.fsmonitor=false','-c','core.hooksPath=/dev/null',
  '-c','credential.helper=','-c','protocol.allow=never','-c','submodule.recurse=false','-c','core.quotePath=true'];

async function git(path:string, args:string[], filters:string[]=[]):Promise<string> {
  const result=await exec('/usr/bin/git',[...safe,...filters,'-C',path,...args],{env,timeout:30000,maxBuffer:256*1024,encoding:'utf8'});
  return result.stdout;
}
async function gitDifference(path:string,args:string[],filters:string[]):Promise<string>{
  try{return (await exec('/usr/bin/git',[...safe,...filters,'-C',path,...args],{env,timeout:30000,maxBuffer:2*1024*1024,encoding:'utf8'})).stdout;}
  catch(error){const value=error as {code?:number;stdout?:string};if(value.code===1&&typeof value.stdout==='string')return value.stdout;throw error;}
}
const sha256=(value:string)=>createHash('sha256').update(value).digest('hex');
async function disableFilters(path:string):Promise<string[]> {
  let names:string;
  try { names=await git(path,['config','--name-only','--get-regexp','^filter\\..*\\.(smudge|clean|process|required)$']); }
  catch(error) { if((error as {code?:number}).code===1) return []; throw error; }
  return names.trim().split('\n').filter(Boolean).flatMap(key=>['-c',`${key}=${key.endsWith('.required')?'false':''}`]);
}

/** Desktop-selected repositories only. No general command or filesystem capability. */
export class LocalProjects {
  private previewChecks=new Set<string>();
  private selections=new Map<string,RepositorySelection>();
  constructor(private root:string) {}
  private async init() { await mkdir(this.root,{recursive:true,mode:0o700});this.root=await realpath(this.root); }
  private directory(id:string) { if(!ID.test(id)) throw new Error('Invalid project identity');return join(this.root,id); }
  private async save(project:LocalProject) {
    const directory=this.directory(project.projectId);await mkdir(directory,{recursive:true,mode:0o700});
    const path=join(directory,'project.json');const temporary=path+'.'+randomUUID()+'.tmp';await writeFile(temporary,JSON.stringify(project),{mode:0o600});await rename(temporary,path);
  }
  async list():Promise<LocalProject[]> {
    await this.init();
    const projects:LocalProject[]=[];
    for(const id of await readdir(this.root)) {
      if(!ID.test(id)) continue;
      try { projects.push(await this.get(id)); } catch { /* A damaged record is not authority for another path. */ }
    }
    return projects.sort((a,b)=>b.createdAt-a.createdAt);
  }
  private async get(id:string):Promise<LocalProject> {
    await this.init();
    const project=LocalProjectSchema.parse(JSON.parse(await readFile(join(this.directory(id),'project.json'),'utf8')));
    if(project.projectId!==id || project.path!==join(this.directory(id),'checkout')) throw new Error('Project location does not match its saved identity');
    return project;
  }
  async select(directory:string):Promise<RepositorySelection> {
    try {
      const path=await realpath((await git(directory,['rev-parse','--show-toplevel'])).trim());
      const commit=(await git(path,['rev-parse','--verify','HEAD^{commit}'])).trim();
      if(!/^[a-f0-9]{40,64}$/.test(commit)) throw new Error('Invalid commit');
      const status=await git(path,['status','--short','--branch','--untracked-files=normal'],await disableFilters(path));
      const selected={selectionId:randomUUID(),name:basename(path),path,commit,status};
      this.selections.clear();this.selections.set(selected.selectionId,selected);return selected;
    } catch { throw new Error('Choose a local Git checkout with a saved commit. Git must be installed; inspection must finish within 30 seconds and 256 KB.'); }
  }
  async create(selectionId:string):Promise<LocalProject> {
    await this.init();
    const selected=this.selections.get(selectionId);
    if(!selected) throw new Error('Select the repository again before creating a checkout.');
    this.selections.delete(selectionId); // One picker selection authorizes one creation.
    const id=randomUUID();
    const project:LocalProject={projectId:id,name:selected.name,sourcePath:selected.path,path:join(this.directory(id),'checkout'),
      branch:`codex/aux-${id.slice(0,8)}`,baseCommit:selected.commit,createdAt:Date.now(),state:'creating'};
    await this.save(project);
    try {
      // Use the reviewed commit even if the source branch moves after selection.
      await git(selected.path,['worktree','add','-b',project.branch,project.path,selected.commit],await disableFilters(selected.path));
      project.state='ready';await this.save(project);return project;
    } catch {
      project.state='failed';project.error='Checkout setup did not finish. Any partial checkout is retained for recovery; the original checkout was not reset.';
      await this.save(project);throw new Error(project.error);
    }
  }
  async createBlank(input:string):Promise<LocalProject>{
    await this.init();
    const name=input.trim();
    if(!/^[A-Za-z0-9][A-Za-z0-9._ -]{0,79}$/.test(name)||name==='.'||name==='..')throw new Error('Use a project name up to 80 characters with letters, numbers, spaces, dots, dashes or underscores.');
    const id=randomUUID(),branch=`codex/aux-${id.slice(0,8)}`,path=join(this.directory(id),'checkout');
    const project:LocalProject={projectId:id,name,sourcePath:path,path,branch,baseCommit:'0'.repeat(40),createdAt:Date.now(),state:'creating'};
    await this.save(project);
    try{
      await mkdir(path,{recursive:true,mode:0o700});
      await exec('/usr/bin/git',[...safe,'init','--quiet',`--initial-branch=${branch}`,path],{env,timeout:30000,maxBuffer:256*1024,encoding:'utf8'});
      const tree=(await git(path,['hash-object','-w','-t','tree','/dev/null'])).trim();
      if(!/^[a-f0-9]{40,64}$/.test(tree))throw new Error('Git did not create a valid empty project tree.');
      const identityEnv={...env,GIT_AUTHOR_NAME:'Aux',GIT_AUTHOR_EMAIL:'aux@localhost',GIT_COMMITTER_NAME:'Aux',GIT_COMMITTER_EMAIL:'aux@localhost'};
      const commit=(await exec('/usr/bin/git',[...safe,'-c','commit.gpgSign=false','-C',path,'commit-tree',tree,'-m','Initial Aux project'],{env:identityEnv,timeout:30000,maxBuffer:256*1024,encoding:'utf8'})).stdout.trim();
      if(!/^[a-f0-9]{40,64}$/.test(commit))throw new Error('Git did not create a valid project baseline.');
      await git(path,['update-ref',`refs/heads/${branch}`,commit]);
      project.baseCommit=commit;project.state='ready';await this.save(project);return project;
    }catch{
      project.state='failed';project.error='Blank project setup did not finish. Its partial files are retained for recovery; no external checkout was changed.';
      await this.save(project);throw new Error(project.error);
    }
  }
  async checkPreview(id:string,url:string){
    if(this.previewChecks.has(id))throw new Error('A preview check is already in progress for this project.');
    this.previewChecks.add(id);
    try{await this.get(id);const preview=await checkLocalPreview(url);const project=await this.get(id);project.preview=preview;await this.save(project);return preview;}
    finally{this.previewChecks.delete(id);}
  }
  async files(id:string):Promise<{path:string;files:string[]}>{
    const project=await this.get(id);
    if(await realpath(project.path)!==project.path||await realpath((await git(project.path,['rev-parse','--show-toplevel'])).trim())!==project.path)throw new Error('Checkout was replaced');
    const files=[...new Set((await git(project.path,['ls-files','--cached','--others','--exclude-standard','-z'],await disableFilters(project.path))).split('\0').filter(Boolean))].sort();
    if(files.length>5000)throw new Error('This checkout has more than 5,000 files. Use your external editor.');
    return {path:project.path,files};
  }
  async allowFileCreation(id:string,name:string):Promise<void>{
    const project=await this.get(id);
    try{await git(project.path,['check-ignore','--no-index','-q','--',name]);}
    catch(error){if((error as {code?:number}).code===1)return;throw error;}
    throw new Error('This path is ignored by Git. Choose a file that can appear in checkout changes.');
  }
  async githubIdentity(id:string):Promise<{owner:string;repository:string;remoteUrl:string;branch:string;baseCommit:string;headCommit:string}>{
    const project=await this.get(id);const raw=(await git(project.path,['config','--get','remote.origin.url'])).trim();
    const match=/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+?)(?:\.git)?$/.exec(raw);
    if(!match)throw new Error('This checkout’s origin is not a recognized github.com repository.');
    const headCommit=(await git(project.path,['rev-parse','--verify','HEAD^{commit}'])).trim();
    if(!/^[a-f0-9]{40,64}$/.test(headCommit))throw new Error('Git did not return a valid local commit.');
    return {owner:match[1]!,repository:match[2]!,remoteUrl:`https://github.com/${match[1]}/${match[2]}`,branch:project.branch,baseCommit:project.baseCommit,headCommit};
  }
  async recordGithubStatus(id:string,value:ProjectGithubStatus){
    const status=ProjectGithubStatusSchema.parse(value);const identity=await this.githubIdentity(id);
    if(status.owner!==identity.owner||status.repository!==identity.repository||status.branch!==identity.branch||status.baseCommit!==identity.baseCommit||status.headCommit!==identity.headCommit)throw new Error('The checkout changed while GitHub status was being checked. Check it again.');
    const project=await this.get(id);project.github={...status,issues:status.issues.map(issue=>({...issue,body:null}))};await this.save(project);return status;
  }
  async writeIncidentReport(id:string,input:{task:ProjectCommandTask;page:{pageId:string;url:string;title:string};console:{level:string;message:string;atMs?:number}[];network:{method:string;status?:number;url:string;durationMs?:number;startedAt?:number}[];operations?:string},commands:ProjectCommand[]):Promise<ProjectIncidentReport>{
    const inspection=await this.inspect(id);const generatedAt=Date.now();const clean=(value:string,limit=4000)=>value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').slice(0,limit);const quote=(value:string)=>clean(value).split('\n').map(line=>`    ${line}`).join('\n')||'    (none)';const safeUrl=(value:string)=>{try{const url=new URL(value);url.username='';url.password='';url.hash='';const keys=[...new Set(url.searchParams.keys())];url.search=keys.length?'?'+keys.map(key=>`${encodeURIComponent(key)}=%5Bredacted%5D`).join('&'):'';return url.href;}catch{return '(invalid URL)';}};
    const recent=commands.filter(command=>command.projectId===id).sort((a,b)=>b.startedAt-a.startedAt).slice(0,10);
    const lines=[`# ${clean(inspection.project.name,200)} incident snapshot`,'',`Generated: ${new Date(generatedAt).toISOString()}`,`Task: ${clean(input.task.title,200)} (revision ${input.task.taskRevision})`,`Page: ${clean(input.page.title,500)}`,`URL: ${clean(safeUrl(input.page.url),2048)}`,`Checkout branch: ${clean(inspection.project.branch,200)}`,`Baseline: ${inspection.project.baseCommit}`,'','## Working tree','',quote(inspection.status),'','## Changes from baseline','',quote(inspection.changes.error??inspection.changes.patch.slice(0,128*1024)),'','## Browser console',''];
    if(input.console.length)for(const entry of input.console.slice(-100))lines.push(`- ${entry.atMs?new Date(entry.atMs).toISOString()+' ':''}[${clean(entry.level,40)}] ${clean(entry.message,4000)}`);else lines.push('No console messages were captured.');
    lines.push('','## Browser network','');if(input.network.length)for(const entry of input.network.slice(-100))lines.push(`- ${clean(entry.method,20)} ${entry.status??'—'} ${clean(safeUrl(entry.url),2048)}${entry.durationMs!=null?` · ${Math.round(entry.durationMs)} ms`:''}`);else lines.push('No network responses were captured.');
    lines.push('','## Recent local commands','');if(recent.length)for(const command of recent)lines.push(`### ${new Date(command.startedAt).toISOString()} · ${command.state}`,'',`Mode: ${command.mode}${command.exitCode!=null?` · exit ${command.exitCode}`:''}`,'',quote(command.command),'',quote(command.output.slice(-8000)),'');else lines.push('No local commands were recorded.','');
    if(inspection.project.github)lines.push('## GitHub delivery state','',`Repository: ${clean(inspection.project.github.owner,200)}/${clean(inspection.project.github.repository,200)}`,`Checked head: ${inspection.project.github.headCommit}`,`Remote head present: ${inspection.project.github.headPresent?'yes':'no'}`,`Check runs: ${inspection.project.github.checkRuns.length?inspection.project.github.checkRuns.slice(0,20).map(run=>`${clean(run.name,200)}=${clean(run.conclusion??run.status,80)}`).join('; '):'none reported'}`,`Open pull requests: ${inspection.project.github.pullRequests.length?inspection.project.github.pullRequests.slice(0,10).map(pull=>`#${pull.number} ${clean(pull.title,500)}`).join('; '):'none found for this branch'}`,`Recent open issues: ${inspection.project.github.issues.length?inspection.project.github.issues.slice(0,10).map(issue=>`#${issue.number} ${clean(issue.title,500)}`).join('; '):'none returned'}`,`Checked: ${new Date(inspection.project.github.checkedAt).toISOString()}`,'');
    lines.push('## Connected operations health','',input.operations?clean(input.operations,32*1024):'No connected operations status was available.','');
    lines.push('## Limits','',`This is a dated local snapshot. It contains at most 100 recent console messages, 100 network responses, 10 project commands, 10 Sentry issues and the latest Vercel deployment summary. It does not prove root cause, current health or that a later fix worked.`,'');
    const content=lines.join('\n');const path=join(this.directory(id),`incident-${generatedAt}.md`);const temporary=path+'.'+randomUUID()+'.tmp';await writeFile(temporary,content,{mode:0o600});await rename(temporary,path);
    const preparedFixContent=[
      `# Prepared local fix`,'',
      `Generated: ${new Date(generatedAt).toISOString()}`,`Incident snapshot: ${path}`,'',
      'This companion stays on this Mac. It does not push, deploy, open a pull request, mutate cloud resources, or apply a remote change.','',
      '## Suggested next local steps','',
      '1. Inspect checkout changes in Aux Files.','2. Apply a bounded edit in the isolated checkout.','3. Run a local check from Commands.','4. Review the patch in Changes before any local commit.','',
      '## Incident summary','',
      `Task: ${clean(input.task.title,200)} (revision ${input.task.taskRevision})`,`Page: ${clean(input.page.title,500)}`,`URL: ${clean(safeUrl(input.page.url),2048)}`,`Console messages: ${input.console.length}`,`Network responses: ${input.network.length}`,'',
    ].join('\n');
    const preparedFixPath=join(this.directory(id),`incident-${generatedAt}-prepared-fix.md`);const preparedTmp=preparedFixPath+'.'+randomUUID()+'.tmp';await writeFile(preparedTmp,preparedFixContent,{mode:0o600});await rename(preparedTmp,preparedFixPath);
    return {projectId:id,generatedAt,path,content,page:input.page,consoleCount:input.console.length,networkCount:input.network.length,preparedFixPath,preparedFixContent};
  }
  async inspect(id:string):Promise<ProjectInspection> {
    const project=await this.get(id);
    try {
      if(await realpath(project.path)!==project.path || await realpath((await git(project.path,['rev-parse','--show-toplevel'])).trim())!==project.path) throw new Error('Checkout was replaced');
      const status=await git(project.path,['status','--short','--branch','--untracked-files=normal'],await disableFilters(project.path));
      if(project.state!=='ready') { project.state='ready';delete project.error;await this.save(project); }
      let changes:ProjectInspection['changes'];let changedPaths:string[]=[];
      try {
        if(!/^[a-f0-9]{40,64}$/.test(project.baseCommit)) throw new Error('Invalid base commit');
        const filters=await disableFilters(project.path);
        // Diff the reviewed baseline against working files, including staged and
        // committed changes. Never execute repository diff drivers or textconv.
        const patch=await git(project.path,['diff','--no-ext-diff','--no-textconv','--no-color',
          '--no-renames','--ignore-submodules=all',project.baseCommit,'--'],filters);
        const untracked=(await git(project.path,['ls-files','--others','--exclude-standard','-z'],filters)).split('\0').filter(Boolean);
        const tracked=(await git(project.path,['diff','--name-only','--no-ext-diff','--no-textconv','--no-renames','--ignore-submodules=all','-z',project.baseCommit,'--'],filters)).split('\0').filter(Boolean);changedPaths=[...new Set([...tracked,...untracked])];
        changes={patch,untracked};
      } catch {
        changes={patch:'',untracked:[],error:'Change preview is unavailable. Output is limited to 256 KB and 30 seconds; inspect larger changes in your editor.'};
      }
      return {project,status,inspectedAt:Date.now(),environment:await inspectProjectEnvironment(project.path,changedPaths),changes};
    } catch { throw new Error('This checkout is unavailable or could not be inspected. Its saved record and files have been retained.'); }
  }
  private async stageSnapshot(id:string,project:LocalProject,filters:string[]):Promise<{tree:string;indexPath:string}>{
    const indexPath=join(this.directory(id),`snapshot-index-${randomUUID()}`);const snapshotEnv={...env,GIT_INDEX_FILE:indexPath};
    try{
      await exec('/usr/bin/git',[...safe,...filters,'-C',project.path,'read-tree','HEAD'],{env:snapshotEnv,timeout:30000,maxBuffer:256*1024,encoding:'utf8'});
      await exec('/usr/bin/git',[...safe,...filters,'-C',project.path,'add','-A','--','.'],{env:snapshotEnv,timeout:30000,maxBuffer:2*1024*1024,encoding:'utf8'});
      const tree=(await exec('/usr/bin/git',[...safe,...filters,'-C',project.path,'write-tree'],{env:snapshotEnv,timeout:30000,maxBuffer:256*1024,encoding:'utf8'})).stdout.trim();
      if(!/^[a-f0-9]{40,64}$/.test(tree))throw new Error('Git did not return a valid snapshot tree.');
      return {tree,indexPath};
    }catch(error){await unlink(indexPath).catch(()=>{});throw error;}
  }
  async snapshotTree(id:string):Promise<string>{
    const project=await this.get(id);const snapshot=await this.stageSnapshot(id,project,await disableFilters(project.path));
    try{return snapshot.tree;}finally{await unlink(snapshot.indexPath).catch(()=>{});}
  }
  async writeReviewSummary(id:string,inspection:ProjectInspection,commands:ProjectCommand[],context?:ProjectReviewContext):Promise<ProjectReviewSummary>{
    const project=await this.get(id);
    if(inspection.project.projectId!==project.projectId||inspection.project.baseCommit!==project.baseCommit)throw new Error('Refresh the checkout before preparing its review summary.');
    const generatedAt=Date.now();const filters=await disableFilters(project.path);const snapshot=await this.stageSnapshot(id,project,filters);await unlink(snapshot.indexPath).catch(()=>{});const snapshotTree=snapshot.tree;
    const clean=(value:string)=>value.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,'').trim();
    const block=(value:string,limit:number)=>clean(value).slice(-limit).split('\n').map(line=>'    '+line).join('\n')||'    (none)';
    const recent=commands.filter(command=>command.projectId===id).sort((a,b)=>b.startedAt-a.startedAt).slice(0,10);
    const task=context??recent.find(command=>command.task)?.task;
    const reasons:string[]=[];let patch='';let patchError:string|undefined;
    const currentTree=(await git(project.path,['rev-parse','--verify','HEAD^{tree}'])).trim();
    const currentHead=(await git(project.path,['rev-parse','--verify','HEAD^{commit}'])).trim();
    if(snapshotTree===currentTree)reasons.push('No uncommitted checkout changes are present.');
    if(inspection.changes.error)patchError=inspection.changes.error;
    else try{
      patch=await gitDifference(project.path,['diff','--binary','--full-index','--no-ext-diff','--no-textconv','--no-renames','--ignore-submodules=all',project.baseCommit,'--'],filters);
      if(Buffer.byteLength(patch)>2*1024*1024)throw new Error('The portable patch exceeds the 2 MB handoff limit.');
      for(const name of inspection.changes.untracked){
        const info=await lstat(join(project.path,name));
        if(!info.isFile())throw new Error(`Untracked path ${name} is not a regular file and cannot be included in the portable patch.`);
        patch+=await gitDifference(project.path,['diff','--no-index','--binary','--full-index','--no-ext-diff','--no-textconv','--','/dev/null',name],filters);
        if(Buffer.byteLength(patch)>2*1024*1024)throw new Error('The portable patch exceeds the 2 MB handoff limit.');
      }
    }catch(error){patch='';patchError=error instanceof Error?error.message:'The portable patch could not be prepared.';}
    if(patchError)reasons.push(patchError);
    if(!inspection.changes.patch&&!inspection.changes.untracked.length&&!reasons.includes('No uncommitted checkout changes are present.'))reasons.push('No working-tree changes are present.');
    if(recent.some(command=>command.state==='running'||command.state==='stopping'))reasons.push('A local command or service is still active.');
    const latestCheck=recent.find(command=>command.mode==='command'&&(!task||(command.task?.taskId===task.taskId&&command.task.taskRevision===task.taskRevision)));
    if(!latestCheck||latestCheck.state!=='succeeded')reasons.push('No successful latest bounded check is recorded.');
    else if(latestCheck.verificationError)reasons.push(latestCheck.verificationError);
    else if(latestCheck.verifiedTree!==snapshotTree)reasons.push(latestCheck.verifiedTree?'The latest successful check ran against different checkout contents.':'The latest successful check has no checkout fingerprint. Run it again before handoff.');
    if(project.preview&&project.preview.state!=='responding')reasons.push('The most recent local preview check did not succeed.');
    if(inspection.environment.javascript?.error)reasons.push(inspection.environment.javascript.error);
    if(inspection.environment.python?.error)reasons.push(inspection.environment.python.error);
    const readiness={state:reasons.length?'needs_attention' as const:'ready' as const,reasons};
    const title=clean(task?.title||`${project.name} changes`).slice(0,72)||`${project.name} changes`;
    const lines=[`# ${clean(project.name)} change review`,'',`Generated: ${new Date(generatedAt).toISOString()}`,`Branch: ${clean(project.branch)}`,`Baseline: ${project.baseCommit}`,'',
      '## Project environment','',
      ...(inspection.environment.javascript?[`- JavaScript/TypeScript: ${inspection.environment.javascript.manager}${inspection.environment.javascript.lockfile?` (${inspection.environment.javascript.lockfile})`:''}; ${inspection.environment.javascript.dependenciesPresent?'node_modules detected':'dependencies not prepared'}`]:[]),
      ...(inspection.environment.python?[`- Python${inspection.environment.python.frameworks.length?` (${inspection.environment.python.frameworks.join(', ')})`:''}: ${inspection.environment.python.manager} (${inspection.environment.python.manifests.join(', ')}); ${inspection.environment.python.environmentPresent?'.venv detected':'environment not prepared'}`]:[]),
      ...(inspection.environment.rust?[`- Rust: ${inspection.environment.rust.manifest}${inspection.environment.rust.workspace?`; Cargo workspace with ${inspection.environment.rust.members.length} detected crates`:''}${inspection.environment.rust.binary?'; runnable binary detected':''}`]:[]),
      ...(inspection.environment.go?[`- Go: ${inspection.environment.go.module??inspection.environment.go.manifest}${inspection.environment.go.workspace?`; Go workspace with ${inspection.environment.go.workspace.modules.length} detected modules`:''}${inspection.environment.go.binary?'; runnable main package detected':''}`]:[]),
      ...inspection.environment.unsupported.map(item=>`- ${clean(item.ecosystem)}: ${item.markers.map(clean).join(', ')}; guided setup unavailable, reviewed manual commands used`),
      ...(!inspection.environment.javascript&&!inspection.environment.python&&!inspection.environment.rust&&!inspection.environment.go&&!inspection.environment.unsupported.length?['- No recognized project manifest detected; reviewed manual commands used.']:[]),
      ...inspection.environment.tools.map(tool=>`- ${clean(tool.command)}: ${tool.available?clean(tool.version??'available'):'unavailable'}`),'','## Delivery readiness','',`State: ${readiness.state==='ready'?'Ready for local review':'Needs attention'}`,...(reasons.length?reasons.map(reason=>`- ${clean(reason)}`):['- Fresh changes, a portable patch and a successful latest bounded check are present.']),'',
      '## Working tree','',block(inspection.status,64*1024),'','## Changes from baseline','',inspection.changes.error?clean(inspection.changes.error):block(inspection.changes.patch,256*1024),''];
    if(inspection.changes.untracked.length)lines.push('## Untracked files','',...inspection.changes.untracked.map(name=>`- ${clean(name).replace(/^[-*+] /,'\\$&')}`),'');
    lines.push('## Command evidence','');
    if(!recent.length)lines.push('No local commands have been recorded for this checkout.','');
    for(const command of recent){
      lines.push(`### ${new Date(command.startedAt).toISOString()} · ${command.state.replaceAll('_',' ')}`,'',
        `Task: ${command.task?`${clean(command.task.title)} (revision ${command.task.taskRevision})`:'No task binding recorded'}`,
        `Mode: ${command.mode}`,`Exit: ${command.exitCode==null?'not recorded':command.exitCode}`,
        `Checkout fingerprint: ${command.verifiedTree??command.verificationError??'not recorded'}`,'','Command:','',block(command.command,8000),'','Output excerpt:','',block(command.output,8000),'');
    }
    if(project.preview)lines.push('## Local preview check','',`URL: ${clean(project.preview.url)}`,`State: ${project.preview.state}`,`Checked: ${new Date(project.preview.checkedAt).toISOString()}`,`Result: ${clean(project.preview.message)}`,'');
    if(project.github){const current=project.github.headCommit===currentHead;lines.push('## GitHub repository check','',`Repository: ${clean(project.github.owner)}/${clean(project.github.repository)}`,`Connected account: ${clean(project.github.account)}`,`Access: ${project.github.permissions.push?'write':'read-only'}`,`Snapshot: ${current?'matches current local HEAD':'stale — local HEAD changed after this check'}`,`Baseline on GitHub: ${project.github.basePresent?'yes':'no'}`,`Checked local head on GitHub: ${project.github.headPresent?'yes':'no'}`,`Commit status: ${project.github.checks?`${clean(project.github.checks.state)} (${project.github.checks.total})`:'not available'}`,`Check runs: ${project.github.checkRuns.length?project.github.checkRuns.map(run=>`${clean(run.name)}=${clean(run.conclusion??run.status)}`).join('; '):'none reported'}`,`Open pull requests: ${project.github.pullRequests.length?project.github.pullRequests.map(pull=>`#${pull.number} ${clean(pull.title)} (${clean(pull.base)} ← ${clean(pull.head)})`).join('; '):'none found for this branch'}`,`Recent open issues: ${project.github.issues.length?project.github.issues.map(issue=>`#${issue.number} ${clean(issue.title)}`).join('; '):'none returned'}`,`Checked: ${new Date(project.github.checkedAt).toISOString()}`,'');}
    lines.push('## Review notes','',`This summary describes local state at ${new Date(generatedAt).toISOString()}. It does not create a commit, push a branch, open a pull request, or prove that later changes passed these commands.`,'');
    const content=lines.join('\n');
    const successful=recent.filter(command=>command.mode==='command'&&command.state==='succeeded'&&command.verifiedTree===snapshotTree&&(!task||(command.task?.taskId===task.taskId&&command.task.taskRevision===task.taskRevision)));
    const draftLines=['# Draft pull request','',`Title: ${title}`,'','Status: Local handoff only — no commit, push or pull request has been created.','','## Summary','',context?.objective?clean(context.objective):`Prepare the reviewed ${clean(project.name)} changes.`, '', '## Change scope','',block(inspection.status,64*1024),'','## Validation',''];
    if(successful.length)for(const command of successful)draftLines.push(`- Succeeded: ${clean(command.command)}`);
    else draftLines.push('- No successful bounded check is recorded.');
    if(project.preview)draftLines.push(`- Preview ${project.preview.state}: ${clean(project.preview.url)} (${new Date(project.preview.checkedAt).toISOString()})`);
    draftLines.push('','## Readiness','',readiness.state==='ready'?'Ready for local review.':'Needs attention before delivery.',...reasons.map(reason=>`- ${clean(reason)}`),'','## Reviewer note','','Generated from the isolated checkout. Review the patch and evidence; this draft does not establish remote delivery.','');
    const draftContent=draftLines.join('\n');
    const directory=this.directory(id),path=join(directory,'review-summary.md'),draftPath=join(directory,'pull-request-draft.md'),patchPath=join(directory,'changes.patch');
    const atomic=async(file:string,value:string)=>{const temporary=file+'.'+randomUUID()+'.tmp';await writeFile(temporary,value,{mode:0o600});await rename(temporary,file);};
    await atomic(path,content);await atomic(draftPath,draftContent);if(!patchError)await atomic(patchPath,patch);else await unlink(patchPath).catch(()=>{});
    const artifacts=[{name:'review-summary.md',sha256:sha256(content),byteLength:Buffer.byteLength(content)},{name:'pull-request-draft.md',sha256:sha256(draftContent),byteLength:Buffer.byteLength(draftContent)},...(!patchError?[{name:'changes.patch',sha256:sha256(patch),byteLength:Buffer.byteLength(patch)}]:[])];
    const manifest=JSON.stringify({format:'aux-local-delivery-v1',projectId:id,branch:project.branch,baseCommit:project.baseCommit,snapshotTree,generatedAt,task:task?{taskId:task.taskId,revision:task.taskRevision,title:task.title}:undefined,verification:latestCheck?.verifiedTree===snapshotTree?{commandId:latestCheck.commandId,tree:latestCheck.verifiedTree,recordedAt:latestCheck.verificationRecordedAt}:undefined,readiness,artifacts},null,2)+'\n';
    const manifestPath=join(directory,'delivery-manifest.json');await atomic(manifestPath,manifest);
    return {projectId:id,generatedAt,path,content,title,snapshotTree,readiness,patch:{...(!patchError?{path:patchPath,content:patch,sha256:sha256(patch),byteLength:Buffer.byteLength(patch)}:{}),complete:!patchError,...(patchError?{error:patchError}:{})},draft:{path:draftPath,content:draftContent,sha256:sha256(draftContent)},manifestPath,manifestSha256:sha256(manifest)};
  }
  async commit(id:string,input:ProjectCommitRequest,commands:ProjectCommand[],context:ProjectReviewContext):Promise<ProjectCommitResult>{
    const request=ProjectCommitRequestSchema.parse(input);const project=await this.get(id);const inspection=await this.inspect(id);const review=await this.writeReviewSummary(id,inspection,commands,context);
    if(review.patch.sha256!==request.expectedPatchHash||review.snapshotTree!==request.expectedTree)throw new Error('The checkout changed after the delivery handoff. Prepare it again before committing.');
    if(review.readiness.state!=='ready')throw new Error(`Prepare the checkout before committing: ${review.readiness.reasons.join(' ')}`);
    const filters=await disableFilters(project.path);const snapshot=await this.stageSnapshot(id,project,filters);
    try{
      if(snapshot.tree!==request.expectedTree)throw new Error('The checkout changed while the commit was being prepared. Prepare the handoff again.');
      const previousCommit=(await git(project.path,['rev-parse','--verify','HEAD^{commit}'])).trim();
      const ref=(await git(project.path,['symbolic-ref','-q','HEAD'])).trim();
      if(ref!==`refs/heads/${project.branch}`)throw new Error('The managed checkout is no longer on its saved branch.');
      const indexValue=(await git(project.path,['rev-parse','--git-path','index'])).trim();const indexPath=isAbsolute(indexValue)?indexValue:resolve(project.path,indexValue);
      const indexRecoveryPath=join(this.directory(id),`index-before-commit-${Date.now()}-${randomUUID()}`);await copyFile(indexPath,indexRecoveryPath);await chmod(indexRecoveryPath,0o600);
      const identityEnv={...env,GIT_AUTHOR_NAME:request.authorName,GIT_AUTHOR_EMAIL:request.authorEmail,GIT_COMMITTER_NAME:request.authorName,GIT_COMMITTER_EMAIL:request.authorEmail};
      const commit=(await exec('/usr/bin/git',[...safe,'-c','commit.gpgSign=false','-C',project.path,'commit-tree',snapshot.tree,'-p',previousCommit,'-m',request.message],{env:identityEnv,timeout:30000,maxBuffer:256*1024,encoding:'utf8'})).stdout.trim();
      if(!/^[a-f0-9]{40,64}$/.test(commit))throw new Error('Git did not create a valid local commit.');
      const replacement=indexPath+`.aux-${randomUUID()}`;
      try{
        await copyFile(snapshot.indexPath,replacement);await rename(replacement,indexPath);
        await exec('/usr/bin/git',[...safe,'-C',project.path,'update-ref',ref,commit,previousCommit],{env,timeout:30000,maxBuffer:256*1024,encoding:'utf8'});
      }catch(error){await unlink(replacement).catch(()=>{});await copyFile(indexRecoveryPath,indexPath);throw error;}
      const actual=(await git(project.path,['rev-parse','--verify','HEAD^{commit}'])).trim();const tree=(await git(project.path,['rev-parse','--verify','HEAD^{tree}'])).trim();
      if(actual!==commit||tree!==snapshot.tree)throw new Error('The local commit needs inspection; its recorded identity did not match the prepared snapshot.');
      return {projectId:id,commit,previousCommit,tree,message:request.message,authorName:request.authorName,authorEmail:request.authorEmail,committedAt:Date.now(),indexRecoveryPath};
    }finally{await unlink(snapshot.indexPath).catch(()=>{});}
  }
}
