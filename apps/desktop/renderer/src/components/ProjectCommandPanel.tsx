import {useCallback,useEffect,useState,useRef} from 'react';
import type {ProjectCommand,LocalPreviewCheck,ProjectEnvironment,ProjectEnvironmentSuggestion,ProjectIncidentReport,ResponseRecord,Task} from '@vector/contracts';
import {bridge} from '../bridge';
import {useStore} from '../store';

type PreviewLink={pageId:string;url:string};
type ConsoleLine={level:string;message:string;atMs?:number};
type PreviewDiagnostics={pageId:string;refreshedAt:number;console:ConsoleLine[];network:ResponseRecord[]};

const previewLinkKey=(projectId:string)=>`aux.project-preview.${projectId}`;
function readPreviewLink(projectId:string):PreviewLink|null{
  try{
    const value=JSON.parse(localStorage.getItem(previewLinkKey(projectId))??'null') as Partial<PreviewLink>|null;
    return value&&typeof value.pageId==='string'&&typeof value.url==='string'?{pageId:value.pageId,url:value.url}:null;
  }catch{return null;}
}
function savePreviewLink(projectId:string,link:PreviewLink){
  try{localStorage.setItem(previewLinkKey(projectId),JSON.stringify(link));}catch{/* Diagnostics remain available for this session. */}
}
function displayUrl(value:string){
  try{const url=new URL(value);return `${url.host}${url.pathname}${url.search}`;}catch{return value;}
}
function time(value?:number){return value?new Date(value).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'}):'';}
function serviceSuggestions(environment:ProjectEnvironment|null){
  if(!environment)return [];
  const all:ProjectEnvironmentSuggestion[]=[
    ...(environment.javascript?.suggestions??[]),
    ...(environment.javascript?.workspace?.packages.flatMap(item=>item.suggestions)??[]),
    ...(environment.python?.suggestions??[]),...(environment.rust?.suggestions??[]),...(environment.go?.suggestions??[]),
    ...(environment.additional?.flatMap(item=>item.suggestions)??[]),
  ];
  return [...new Map(all.filter(item=>item.intent==='service').map(item=>[item.command,item])).values()];
}

export function ProjectCommandPanel({projectId,disabled,task}:{projectId:string;disabled:boolean;task:Task}){
  const [runs,setRuns]=useState<ProjectCommand[]>([]);
  const [command,setCommand]=useState('');
  const commandRef=useRef<HTMLTextAreaElement>(null);
  const [service,setService]=useState(false);
  const [stackCommands,setStackCommands]=useState<string[]>([]);
  const [environment,setEnvironment]=useState<ProjectEnvironment|null>(null);
  const [preview,setPreview]=useState('');
  const [check,setCheck]=useState<LocalPreviewCheck|null>(null);
  const [previewLink,setPreviewLink]=useState<PreviewLink|null>(()=>readPreviewLink(projectId));
  const [diagnostics,setDiagnostics]=useState<PreviewDiagnostics|null>(null);
  const [diagnosticsError,setDiagnosticsError]=useState('');
  const [diagnosticsBusy,setDiagnosticsBusy]=useState(false);
  const [incident,setIncident]=useState<ProjectIncidentReport|null>(null);
  const pages=useStore(state=>state.pages);
  const previewEdited=useRef(false);
  const autoRefreshKey=useRef('');
  const previousActive=useRef(new Set<string>());
  useEffect(()=>{setPreviewLink(readPreviewLink(projectId));setDiagnostics(null);setDiagnosticsError('');setStackCommands([]);autoRefreshKey.current='';previousActive.current=new Set();},[projectId]);
  const refreshEnvironment=useCallback(async()=>setEnvironment((await bridge.inspectProject(projectId)).environment),[projectId]);
  useEffect(()=>{let active=true;void Promise.all([bridge.listProjects(),bridge.inspectProject(projectId)]).then(([projects,inspection])=>{if(!active)return;setEnvironment(inspection.environment);const saved=projects.find(project=>project.projectId===projectId)?.preview;if(saved){setCheck(saved);if(!previewEdited.current)setPreview(saved.url);}}).catch(error=>{if(active)setError(String(error));});return()=>{active=false;};},[projectId]);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  useEffect(()=>{
    let stopped=false;let timer:ReturnType<typeof setTimeout>;
    async function refresh(){try{const next=await bridge.listProjectCommands(projectId);if(!stopped){setRuns(next);const activeNow=new Set(next.filter(run=>run.state==='running'||run.state==='stopping').map(run=>run.commandId));const finished=[...previousActive.current].some(id=>!activeNow.has(id));previousActive.current=activeNow;if(finished)void refreshEnvironment().catch(error=>setError(String(error)));}}catch(error){if(!stopped)setError(String(error));}finally{if(!stopped)timer=setTimeout(refresh,1000);}}
    void refresh();return()=>{stopped=true;clearTimeout(timer);};
  },[projectId,refreshEnvironment]);
  async function action(work:()=>Promise<void>){setBusy(true);setError('');try{await work();}catch(error){setError(error instanceof Error?error.message:String(error));}finally{setBusy(false);}}
  const linkedPage=previewLink?pages.find(page=>page.pageId===previewLink.pageId):undefined;
  const previewReady=!!linkedPage&&linkedPage.url===previewLink?.url;
  const refreshDiagnostics=useCallback(async(pageId:string)=>{
    setDiagnosticsBusy(true);setDiagnosticsError('');
    try{
      const [consoleResult,networkResult]=await Promise.all([
        bridge.invoke('pages.console',{pageId,limit:40}) as Promise<{lines:ConsoleLine[]}>,
        bridge.invoke('pages.network',{pageId,limit:40}) as Promise<ResponseRecord[]>,
      ]);
      setDiagnostics({pageId,refreshedAt:Date.now(),console:consoleResult.lines,network:networkResult});
    }catch(error){setDiagnosticsError(error instanceof Error?error.message:String(error));}
    finally{setDiagnosticsBusy(false);}
  },[]);
  useEffect(()=>{
    if(!previewReady||linkedPage.loading)return;
    const key=`${linkedPage.pageId}:${linkedPage.documentEpoch}`;
    if(autoRefreshKey.current===key)return;
    autoRefreshKey.current=key;void refreshDiagnostics(linkedPage.pageId);
  },[linkedPage?.pageId,linkedPage?.documentEpoch,linkedPage?.loading,previewReady,refreshDiagnostics]);
  const active=runs.filter(run=>run.state==='running'||run.state==='stopping');
  const runningCommand=active.some(run=>run.mode==='command');
  const runningServices=active.filter(run=>run.mode==='service').length;
  const tools=new Map(environment?.tools.map(item=>[item.command,item]));
  const loadSuggestion=(suggestion:ProjectEnvironmentSuggestion)=>{setCommand(suggestion.command);setService(suggestion.intent==='service');requestAnimationFrame(()=>commandRef.current?.focus());};
  const suggestionAvailable=(suggestion:ProjectEnvironmentSuggestion)=>{const executable=suggestion.command.split(/\s/,1)[0]??'';return executable.startsWith('.')||tools.get(executable)?.available!==false;};
  const detectedServices=serviceSuggestions(environment).filter(suggestionAvailable);
  const detectedServiceKey=detectedServices.map(item=>item.command).join('\n');
  useEffect(()=>{setStackCommands(detectedServices.slice(0,4).map(item=>item.command));},[projectId,detectedServiceKey]);
  const orderedStackCommands=detectedServices.filter(item=>stackCommands.includes(item.command)).map(item=>item.command);
  const stacks=[...runs.reduce((groups,run)=>{if(!run.stackId)return groups;const group=groups.get(run.stackId)??[];group.push(run);groups.set(run.stackId,group);return groups;},new Map<string,ProjectCommand[]>()).entries()]
    .map(([stackId,members])=>({stackId,members:members.sort((a,b)=>(a.stackOrder??0)-(b.stackOrder??0))})).sort((a,b)=>Math.max(...b.members.map(item=>item.startedAt))-Math.max(...a.members.map(item=>item.startedAt))).slice(0,5);
  return <section className="field" aria-label="Project commands">
    <p className="hint">Task: {task.title} · Saved revision {task.revision}. Approval binds this command to that revision; later edits do not retarget it.</p>
    <section className="project-environment" aria-label="Project environment">
      <div className="project-environment-head"><div><strong>Project environment</strong><p className="hint">Detected from fixed root manifests. Aux does not run repository code during inspection.</p></div><button className="btn sm" disabled={busy} onClick={()=>void refreshEnvironment().catch(error=>setError(String(error)))}>Refresh</button></div>
      {!environment?<p className="hint">Inspecting manifests and local runtimes…</p>:!environment.javascript&&!environment.python&&!environment.rust&&!environment.go&&!environment.additional?.length&&!environment.unsupported.length?<p className="hint">No recognized project manifest was found. Enter a reviewed command manually.</p>:<>
        <div className="project-environment-tools">{environment.tools.map(item=><span key={item.command} className={item.available?'available':'unavailable'}>{item.command}{item.available?item.version?` · ${item.version}`:' · available':' · unavailable'}</span>)}</div>
        {environment.javascript&&<div className="project-environment-stack"><div><strong>JavaScript / TypeScript</strong><span className="hint">{environment.javascript.manager}{environment.javascript.lockfile?` · ${environment.javascript.lockfile}`:''}{environment.javascript.workspace?` · workspace (${environment.javascript.workspace.patterns.join(', ')})`:''} · {environment.javascript.dependenciesPresent?'node_modules detected':'dependencies not prepared'}</span>{environment.javascript.error&&<span role="alert">{environment.javascript.error}</span>}</div><div className="row">{environment.javascript.suggestions.map(suggestion=><button key={suggestion.id} className="btn sm" disabled={!suggestionAvailable(suggestion)} title={suggestionAvailable(suggestion)?`Load: ${suggestion.command}`:'Required tool is unavailable'} onClick={()=>loadSuggestion(suggestion)}>{suggestion.label}</button>)}</div></div>}
        {environment.javascript?.workspace?.packages.length?<details className="project-workspace-packages"><summary>{environment.javascript.workspace.packages.length} workspace {environment.javascript.workspace.packages.length===1?'package':'packages'} · {environment.javascript.workspace.packages.filter(item=>item.affected).length} affected</summary>{environment.javascript.workspace.affectedSuggestion&&<div className="project-workspace-action"><p className="hint">Loads checks for affected packages and internal dependents. Review the combined command before running.</p><button className="btn sm" onClick={()=>loadSuggestion(environment.javascript!.workspace!.affectedSuggestion!)}>{environment.javascript.workspace.affectedSuggestion.label}</button></div>}{environment.javascript.workspace.packages.map(item=><div className="project-environment-stack" key={item.path}><div><strong>{item.name}{item.affected?' · Affected':''}</strong><span className="hint">{item.path} · {item.scripts.length?item.scripts.join(', '):'No scripts'}{item.reasons.length?` · ${item.reasons.join('; ')}`:''}</span></div><div className="row">{item.suggestions.map(suggestion=><button key={suggestion.id} className="btn sm" disabled={!suggestionAvailable(suggestion)} title={suggestionAvailable(suggestion)?`Load: ${suggestion.command}`:'Required tool is unavailable'} onClick={()=>loadSuggestion(suggestion)}>{suggestion.label}</button>)}</div></div>)}</details>:null}
        {environment.python&&<div className="project-environment-stack"><div><strong>Python{environment.python.frameworks.length?` · ${environment.python.frameworks.map(name=>name[0]!.toUpperCase()+name.slice(1)).join(' · ')}`:''}</strong><span className="hint">{environment.python.manager} · {environment.python.manifests.join(', ')} · {environment.python.environmentPresent?'.venv detected':'environment not prepared'}</span>{environment.python.error&&<span role="alert">{environment.python.error}</span>}</div><div className="row">{environment.python.suggestions.map(suggestion=><button key={suggestion.id} className="btn sm" disabled={!suggestionAvailable(suggestion)} title={suggestionAvailable(suggestion)?`Load: ${suggestion.command}`:'Required tool is unavailable'} onClick={()=>loadSuggestion(suggestion)}>{suggestion.label}</button>)}</div></div>}
        {environment.rust&&<div className="project-environment-stack"><div><strong>Rust{environment.rust.workspace?' · Cargo workspace':''}</strong><span className="hint">{environment.rust.manifest}{environment.rust.locked?' · locked':''}{environment.rust.members.length?` · ${environment.rust.members.length} crates`:''}{environment.rust.binary?' · runnable binary detected':''}</span>{environment.rust.error&&<span role="alert">{environment.rust.error}</span>}</div><div className="row">{environment.rust.suggestions.map(suggestion=><button key={suggestion.id} className="btn sm" disabled={!suggestionAvailable(suggestion)} title={suggestionAvailable(suggestion)?`Load: ${suggestion.command}`:'cargo is unavailable'} onClick={()=>loadSuggestion(suggestion)}>{suggestion.label}</button>)}{environment.rust.affectedSuggestion&&<button className="btn sm" disabled={!suggestionAvailable(environment.rust.affectedSuggestion)} onClick={()=>loadSuggestion(environment.rust!.affectedSuggestion!)}>{environment.rust.affectedSuggestion.label}</button>}</div>{environment.rust.members.length>0&&<details><summary>{environment.rust.members.filter(item=>item.affected).length} affected crates</summary>{environment.rust.members.map(item=><span className="hint" key={item.path}>{item.name} · {item.path}{item.affected?` · ${item.reasons.join('; ')}`:''}</span>)}</details>}</div>}
        {environment.go&&<div className="project-environment-stack"><div><strong>Go{environment.go.workspace?' · Go workspace':''}</strong><span className="hint">{environment.go.module??environment.go.manifest}{environment.go.workspace?` · ${environment.go.workspace.modules.length} modules`:''}{environment.go.binary?' · runnable main package detected':''}</span>{environment.go.error&&<span role="alert">{environment.go.error}</span>}</div><div className="row">{environment.go.suggestions.map(suggestion=><button key={suggestion.id} className="btn sm" disabled={!suggestionAvailable(suggestion)} title={suggestionAvailable(suggestion)?`Load: ${suggestion.command}`:'go is unavailable'} onClick={()=>loadSuggestion(suggestion)}>{suggestion.label}</button>)}{environment.go.workspace?.affectedSuggestion&&<button className="btn sm" disabled={!suggestionAvailable(environment.go.workspace.affectedSuggestion)} onClick={()=>loadSuggestion(environment.go!.workspace!.affectedSuggestion!)}>{environment.go.workspace.affectedSuggestion.label}</button>}</div>{environment.go.workspace?.modules.length?<details><summary>{environment.go.workspace.modules.filter(item=>item.affected).length} affected modules</summary>{environment.go.workspace.modules.map(item=><span className="hint" key={item.path}>{item.module} · {item.path}{item.affected?` · ${item.reasons.join('; ')}`:''}</span>)}</details>:null}</div>}
        {environment.additional?.map(item=><div className="project-environment-stack" key={item.ecosystem}><div><strong>{item.ecosystem}</strong><span className="hint">{item.description} · {item.manifests.join(', ')}</span>{item.error&&<span role="alert">{item.error}</span>}</div><div className="row">{item.suggestions.map(suggestion=><button key={suggestion.id} className="btn sm" disabled={!suggestionAvailable(suggestion)} title={suggestionAvailable(suggestion)?`Load: ${suggestion.command}`:'Required tool is unavailable'} onClick={()=>loadSuggestion(suggestion)}>{suggestion.label}</button>)}</div></div>)}
        {environment.unsupported.map(item=><div className="project-environment-stack" key={item.ecosystem}><div><strong>{item.ecosystem}</strong><span className="hint">{item.markers.join(', ')} · guided setup unavailable</span><span className="hint">{item.reason}</span></div></div>)}
        <p className="hint">A choice only loads its exact command below. Review and run still requires native confirmation and may execute package scripts or use the network.</p>
      </>}
    </section>
    {detectedServices.length>=2&&<section className="project-service-stack" aria-label="Local service stack">
      <div className="project-environment-head"><div><strong>Run services together</strong><p className="hint">Starts selected services in the shown order. Each keeps its own status and output.</p></div><span className="hint">{orderedStackCommands.length}/4 selected</span></div>
      <ol>{detectedServices.slice(0,8).map(suggestion=><li key={suggestion.command}><label><input type="checkbox" checked={stackCommands.includes(suggestion.command)} disabled={busy||(!stackCommands.includes(suggestion.command)&&stackCommands.length>=4)} onChange={event=>setStackCommands(current=>event.target.checked?[...current,suggestion.command]:current.filter(command=>command!==suggestion.command))}/><span><strong>{suggestion.label}</strong><code>{suggestion.command}</code></span></label></li>)}</ol>
      <button className="btn sm" disabled={disabled||busy||orderedStackCommands.length<2||runningServices+orderedStackCommands.length>4} onClick={()=>void action(async()=>{await bridge.runProjectServiceStack(projectId,{label:'Local services',commands:orderedStackCommands},{taskId:task.taskId,expectedRevision:task.revision});setRuns(await bridge.listProjectCommands(projectId));})}>Review and start {orderedStackCommands.length} services</button>
    </section>}
    <label className="field">Command<textarea ref={commandRef} aria-label="Local command" value={command} maxLength={8000} rows={2} onChange={event=>setCommand(event.target.value)} placeholder="Enter a build, check, or local server command" /></label>
    <label className="row project-command-mode"><input type="checkbox" disabled={busy} checked={service} onChange={event=>setService(event.target.checked)} /> Keep running as a local service</label>
    <p className="hint">Runs locally after native confirmation. Not sandboxed; commands can modify files and use the network. Separate HOME, no inherited model credentials, no interactive input or detached background services. {service?`Keeps running until stopped or Aux quits. Files remain editable. ${runningServices}/4 service slots are active.`:'Stops after 10 minutes or when Aux quits. One check can run while local services stay active.'}</p>
    <button className="btn sm" disabled={disabled||busy||!command.trim()||(service?runningServices>=4:runningCommand)} onClick={()=>void action(async()=>{await bridge.runProjectCommand(projectId,command,{taskId:task.taskId,expectedRevision:task.revision},service?'service':'command');setRuns(await bridge.listProjectCommands(projectId));})}>Review and run</button>
    {error&&<p role="alert">{error}</p>}
    {stacks.map(({stackId,members})=>{const stackActive=members.some(run=>run.state==='running'||run.state==='stopping');const restartable=!stackActive&&members.some(run=>run.state==='interrupted'||run.state==='failed')&&members.every(run=>run.task?.taskId===task.taskId&&run.task.taskRevision===task.revision);return <section className="project-stack-status" key={stackId} aria-label={`${members[0]?.stackLabel??'Local services'} status`}>
      <div><strong>{members[0]?.stackLabel??'Local services'}</strong><span className="hint">{members.map(run=>`${run.stackOrder!=null?run.stackOrder+1+'. ':''}${run.state.replaceAll('_',' ')}`).join(' · ')}</span></div>
      {stackActive&&<button className="btn sm" disabled={busy||members.some(run=>run.state==='stopping')} onClick={()=>void action(async()=>{await bridge.stopProjectServiceStack(projectId,stackId);setRuns(await bridge.listProjectCommands(projectId));})}>{members.some(run=>run.state==='stopping')?'Stopping…':'Stop stack'}</button>}
      {restartable&&<button className="btn sm" disabled={disabled||busy||runningServices+members.length>4} onClick={()=>void action(async()=>{await bridge.runProjectServiceStack(projectId,{label:members[0]?.stackLabel??'Local services',commands:members.map(run=>run.command)},{taskId:task.taskId,expectedRevision:task.revision});setRuns(await bridge.listProjectCommands(projectId));})}>Review and restart stack</button>}
    </section>;})}
    {runs.map(run=><details key={run.commandId} className="project-command" open={run.state==='running'||run.state==='stopping'?true:undefined}>
      <summary><span>{run.stackOrder!=null?`${run.stackOrder+1}. `:''}{run.mode==='service'?'Service · ':''}{run.state.replaceAll('_',' ')}{run.exitCode!=null?` · exit ${run.exitCode}`:''}</span> · {new Date(run.startedAt).toLocaleString()}</summary>
      <p className="hint">{run.task?`${run.task.title} · Task revision ${run.task.taskRevision}${run.task.taskId!==task.taskId?" · Another task":run.task.taskRevision!==task.revision?" · Earlier revision":""}`:"Legacy project command · No task binding recorded"}</p>
      {run.mode==='command'&&run.state==='succeeded'&&<p className="hint">{run.verifiedTree?`Verified checkout ${run.verifiedTree.slice(0,12)}`:run.verificationError??'Checkout fingerprint was not recorded. Run this check again before handoff.'}</p>}
      <pre className="evidence-text">{run.command}</pre>
      {run.truncated&&<p className="hint">Earlier output omitted; showing the latest 128K characters.</p>}
      <pre className="project-diff" tabIndex={0} aria-label="Command output">{run.output||(run.state==='running'?'Waiting for output…':'No output was recorded.')}</pre>
      {(run.state==='running'||run.state==='stopping')&&<button className="btn sm" disabled={busy||run.state==='stopping'} onClick={()=>void action(async()=>{await bridge.stopProjectCommand(projectId,run.commandId);setRuns(await bridge.listProjectCommands(projectId));})}>{run.state==='stopping'?'Stopping…':run.mode==='service'?'Stop service':'Stop command'}</button>}
      {run.state==='interrupted'&&<><p className="hint">Completion was not recorded. Nothing was restarted automatically. After a force quit, verify external processes before running again.</p>{!run.stackId&&run.mode==='service'&&run.task?.taskId===task.taskId&&run.task.taskRevision===task.revision&&<button className="btn sm" disabled={disabled||busy||runningServices>=4} onClick={()=>void action(async()=>{await bridge.runProjectCommand(projectId,run.command,{taskId:task.taskId,expectedRevision:task.revision},'service');setRuns(await bridge.listProjectCommands(projectId));})}>Review and restart service</button>}{run.mode==='service'&&run.task&&(run.task.taskId!==task.taskId||run.task.taskRevision!==task.revision)&&<p className="hint">This service belongs to another or earlier task revision. Review its command in the current task before running it again.</p>}</>}
    </details>)}
    <label className="field">Local preview URL<input aria-label="Local preview URL" value={preview} onChange={event=>{previewEdited.current=true;setPreview(event.target.value);setCheck(null);}} placeholder="http://localhost:3000" /></label>
    <p className="hint">Checks send a local GET without browser cookies and do not follow redirects. A response confirms this URL answered, not that it belongs to this command or that the app works correctly.</p>
    {check&&<div role="status" className="hint"><strong>{check.state==='responding'?'Responded successfully':check.state==='http_error'?'HTTP response needs attention':'Not reachable'}{check.statusCode?` · HTTP ${check.statusCode}`:''}</strong><p>{check.message}</p><p>Last checked {new Date(check.checkedAt).toLocaleString()}. This is a dated check, not live monitoring.</p></div>}
    <div className="row"><button className="btn sm" disabled={busy||!preview.trim()} onClick={()=>void action(async()=>setCheck(await bridge.checkLocalPreview(projectId,preview)))}>Check preview</button>
    <button className="btn sm" disabled={busy||!preview.trim()} onClick={()=>void action(async()=>{
      const result=await bridge.checkLocalPreview(projectId,preview);setCheck(result);
      if(result.state!=='responding')return;
      const current=previewLink&&useStore.getState().pages.find(page=>page.pageId===previewLink.pageId&&page.url===result.url);
      const page=current?(await bridge.invoke('pages.reload',{pageId:current.pageId}),await useStore.getState().activate(current.pageId),current):await useStore.getState().newTab(result.url);
      if(page){const link={pageId:page.pageId,url:result.url};setPreviewLink(link);savePreviewLink(projectId,link);setDiagnostics(null);autoRefreshKey.current='';useStore.getState().setOverlay(null);}
    })}>Check & open preview</button></div>
    {previewLink&&<section className="project-diagnostics" aria-label="Preview diagnostics">
      <div className="project-diagnostics-head"><div><strong>Preview diagnostics</strong><p className="hint">Console and network activity from the linked Aux preview tab.</p></div><div className="row">
        {previewReady&&<button className="btn sm" onClick={()=>void useStore.getState().activate(linkedPage.pageId)}>Open tab</button>}
        {previewReady&&<button className="btn sm" disabled={busy} onClick={()=>void action(async()=>setIncident(await bridge.invoke('development.prepareIncidentFix',{taskId:task.taskId,expectedRevision:task.revision,projectId,pageId:linkedPage.pageId}) as ProjectIncidentReport))}>Prepare incident snapshot</button>}
        <button className="btn sm" disabled={!previewReady||diagnosticsBusy} onClick={()=>previewReady&&void refreshDiagnostics(linkedPage.pageId)}>{diagnosticsBusy?'Refreshing…':'Refresh'}</button>
      </div></div>
      {!linkedPage&&<p className="hint" role="status">The linked preview tab was closed. Check and open the preview again to resume diagnostics.</p>}
      {linkedPage&&linkedPage.url!==previewLink.url&&<p className="hint" role="status">The linked tab navigated to {displayUrl(linkedPage.url)}. Diagnostics are paused until you check and open {displayUrl(previewLink.url)} again.</p>}
      {diagnosticsError&&<p role="alert">{diagnosticsError}</p>}
      {incident&&<div className="field" role="status"><strong>Incident snapshot saved</strong><span className="hint">{incident.consoleCount} console messages · {incident.networkCount} network responses · {new Date(incident.generatedAt).toLocaleString()}</span><div className="row"><button className="btn sm" onClick={()=>void bridge.openPath(incident.path)}>Open report</button>{incident.preparedFixPath&&<button className="btn sm" onClick={()=>void bridge.openPath(incident.preparedFixPath)}>Open prepared local fix</button>}</div><span className="hint">The prepared fix stays on this Mac. It does not push, deploy, open a pull request or mutate cloud resources.</span></div>}
      {previewReady&&diagnostics&&diagnostics.pageId===linkedPage.pageId&&<>
        <p className="hint">Captured {diagnostics.console.length} console {diagnostics.console.length===1?'message':'messages'} and {diagnostics.network.length} recent network {diagnostics.network.length===1?'response':'responses'} · refreshed {time(diagnostics.refreshedAt)}.</p>
        <div className="project-diagnostic-grid">
          <section aria-label="Preview console"><h4>Console</h4>{diagnostics.console.length?<ol>{diagnostics.console.map((line,index)=><li key={`${line.atMs??0}:${index}`} className={/error/i.test(line.level)?'diagnostic-error':/warn/i.test(line.level)?'diagnostic-warning':''}><span>{line.level}</span><code>{line.message}</code><time>{time(line.atMs)}</time></li>)}</ol>:<p className="hint">No console messages captured.</p>}</section>
          <section aria-label="Preview network"><h4>Network</h4>{diagnostics.network.length?<ol>{diagnostics.network.map(response=><li key={response.requestId} className={(response.status??0)>=400?'diagnostic-error':''}><span>{response.method} {response.status??'—'}</span><code title={response.url}>{displayUrl(response.url)}</code><time>{response.durationMs!=null?`${Math.round(response.durationMs)} ms`:time(response.startedAt)}</time></li>)}</ol>:<p className="hint">No network responses captured yet.</p>}</section>
        </div>
      </>}
    </section>}
  </section>;
}
