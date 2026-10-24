import json,hashlib
from pathlib import Path
here=Path(__file__).resolve().parent
source=Path('/private/tmp/aux-browser-features-async-daemon-20261023-a2/index.mjs')
entry=Path('/private/tmp/aux-browser-features-async-daemon-20261023-a2/projected-entry/aux-native-entry.mjs')
s=source.read_text(); changes=[]
def edit(old,new,reason):
 global s
 assert s.count(old)==1,(reason,s.count(old),old[:100])
 changes.append(dict(find=old,replace=new,count=1,reason=reason));s=s.replace(old,new)
def section(start,end):
 i=s.index(start);j=s.index(end,i);return s[i:j]
helper=(here/'source/background-writer-lifetimes.js').read_text()
edit('function auxBrokerBoundary(){',helper+'\nfunction auxBrokerBoundary(){','Native-backed finite background lifetimes; root must stop before broker close')
for name in ['mergeMigrationEntry','markExternalStorageComplete','ensureProjectV6SessionAlias']:
 start='function auxCompleted_'+name+'('
 i=s.index(start);j=s.index('auxBrokerBoundary().noteUntracked();',i)
 assert j-i<300
 old=s[i:j+len('auxBrokerBoundary().noteUntracked();')]
 edit(old,old.replace('auxBrokerBoundary().noteUntracked();',''),'Synchronous '+name+' stays inside its existing native synchronous reservation')
edit('(auxBrokerBoundary().noteUntracked(),tryMigrateStateDb(Cn))','auxBackgroundWriters().run(()=>tryMigrateStateDb(Cn))','Retain actual synchronous SQLite migration and using-disposal through its async return')
old='function enqueue(Cn,ei){const auxDispatch=()=>{auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();return ei()};'
new='function enqueue(Cn,ei){auxBackgroundWriters().assertOpen();const auxDispatch=()=>auxBackgroundWriters().isClosing()?Promise.resolve():auxBackgroundWriters().run(ei);'
edit(old,new,'Track real queued/no-runtime sync execution, refuse new admission and skip unstarted queued work')
edit('function startWatchers(Cn){auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();','function startWatchers(Cn){auxBackgroundWriters().assertOpen();','Existing native watcher reservation lasts until actual Chokidar close, including replaced watchers')
edit('ii=ni=>{try{auxBrokerBoundary().assertOwner()}catch{return}runtimes.get(Cn)===ei','ii=ni=>{try{auxBackgroundWriters().assertOpen()}catch{return}runtimes.get(Cn)===ei','Prevent old watcher callbacks from admitting sync during pre-broker drain')
edit('function runDreaming(Cn){auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();','function runDreaming(Cn){auxBackgroundWriters().assertOpen();','Dream admission is explicit')
edit('let ni=runDreamingPass(Cn).finally(()=>activeDreams.delete(ei));','let ni=auxBackgroundWriters().run(()=>runDreamingPass(Cn)).finally(()=>activeDreams.delete(ei));','Keep native reservation through actual prompt/tools and history writes')
edit('});try{await Di.prompt({role:`user`,content:buildDreamingUserPrompt','});const auxReleaseDream=auxBackgroundWriters().agent(Di);try{await Di.prompt({role:`user`,content:buildDreamingUserPrompt','Abort actual dreaming Agent on stop, never use abort as settlement')
edit('}finally{ki()}await saveDreamState(Cn.accountRoot','}finally{ki();auxReleaseDream()}await saveDreamState(Cn.accountRoot','Release Agent abort registration after prompt, keep outer write lifetime')
# The raced model resolver is non-cancellable. Preserve timeout semantics only
# after the physical losing resolver settles (its rejection is still observed).
edit('}).finally(()=>clearTimeout(pi));li={provider:hi.model.provider','}).finally(async()=>{clearTimeout(pi);await Promise.allSettled([ui])});li={provider:hi.model.provider','A taxonomy timeout does not abandon the actual model-resolution reader') if '}).finally(()=>clearTimeout(pi));li={provider:hi.model.provider' in s else None
old='],new Promise' # exact source has the race array; targeted finalizer below
if ']).finally(()=>clearTimeout(pi));li={provider:hi.model.provider' in s:
 edit(']).finally(()=>clearTimeout(pi));li={provider:hi.model.provider',']).finally(async()=>{clearTimeout(pi);await Promise.allSettled([ui])});li={provider:hi.model.provider','Retain non-cancellable model resolver after timeout')
edit('xi=setTimeout(()=>ci?.abort(),18e4);try{await ci.prompt','xi=setTimeout(()=>ci?.abort(),18e4);const auxReleaseTaxonomy=auxBackgroundWriters().agent(ci);try{await ci.prompt','Track taxonomy Agent cancellation before actual prompt')
edit('}finally{clearTimeout(xi),bi()}let Si=ci.state.messages','}finally{clearTimeout(xi),bi();auxReleaseTaxonomy()}let Si=ci.state.messages','Release taxonomy Agent registration after actual prompt')
edit('"session.dispose":()=>{incrementSessionCount(Cn.accountRoot).catch(Cn=>{logger.error(`[MemoryHook] incrementSessionCount failed: ${Cn}`)})}', '"session.dispose":()=>incrementSessionCount(Cn.accountRoot).catch(Cn=>{logger.error(`[MemoryHook] incrementSessionCount failed: ${Cn}`);throw Cn})','Return memory counter write to hook owner and preserve failure')
edit('flush({accountId:Cn,sessionId:ei}){try{auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked()}catch{return}deliverToSelf(Cn,ei,BACKGROUND_PROCESS_KIND,()=>takePending(Cn,ei)).catch','flush({accountId:Cn,sessionId:ei}){try{auxBackgroundWriters().assertOpen()}catch{return}auxBackgroundWriters().run(()=>deliverToSelf(Cn,ei,BACKGROUND_PROCESS_KIND,()=>takePending(Cn,ei))).catch','Retain background delivery tail; run continuation tracked by server separately')
# Session admission, physical run and actual disposal are separate owners.
edit('AgentSessionServer=class{#e=', 'AgentSessionServer=class{#auxClosing=false;#auxDisposals=new Map;#auxDrain;#e=','Retain concurrent disposals and explicit server admission')
edit('async#h(Cn,ei){assertSessionCanStart(Cn,ei);','async#h(Cn,ei){if(this.#auxClosing)throw Error(`AUX_AGENT_ADMISSION_CLOSED`);assertSessionCanStart(Cn,ei);','Refuse new loads while closing')
edit('let ni=await this.#i(Cn,ei),ri;try{assertSessionCanStart(Cn,ei);','let ni=await this.#i(Cn,ei),ri;try{if(this.#auxClosing)throw Error(`AUX_AGENT_ADMISSION_CLOSED`);assertSessionCanStart(Cn,ei);','Dispose an agent loaded after close; never publish it')
edit('async resumeRun(Cn,ei){let ti=entryKey','async resumeRun(Cn,ei){if(this.#auxClosing)throw Error(`AUX_AGENT_ADMISSION_CLOSED`);let ti=entryKey','Refuse new recovery work')
edit('recoverInterruptedRuns(Cn){let ei=Promise.resolve().then(()=>this.#u(Cn));','recoverInterruptedRuns(Cn){if(this.#auxClosing)throw Error(`AUX_AGENT_ADMISSION_CLOSED`);let ei=Promise.resolve().then(()=>this.#u(Cn));','Close recovery producer admission')
edit('try{assertSessionCanStart(Cn,ei),this.#S(ri),','try{if(this.#auxClosing)throw Error(`AUX_AGENT_ADMISSION_CLOSED`);assertSessionCanStart(Cn,ei),this.#S(ri),','Recheck admission after actual semaphore acquisition')
edit('let ci=(async()=>{let ii=Date.now(),ai=ri.agent.agent.state.messages.length','let ci=auxBackgroundWriters().run(async()=>{let ii=Date.now(),ai=ri.agent.agent.state.messages.length','Native reservation owns physical Agent run and final hooks')
edit('ri.agent.agent.state.isStreaming||this.#w(ri)}})();ri.runningPromise=ci','ri.agent.agent.state.isStreaming||this.#w(ri)}});ri.runningPromise=ci','Retain actual run Promise without changing startRun early-return behavior')
edit('#w(Cn){if(Cn.cleanupTimer&&=', '#w(Cn){if(this.#auxClosing){this.#S(Cn);return}if(Cn.cleanupTimer&&=','Do not rearm idle timers while actual drain is closing sessions')
edit('async disposeSession(Cn,ei,ti={}){let ni=entryKey(Cn,ei);','''disposeSession(Cn,ei,ti={}){const key=entryKey(Cn,ei);let pending=this.#auxDisposals.get(key);if(pending)return pending;pending=auxBackgroundWriters().cleanup(()=>this.auxDisposeSessionBody(Cn,ei,ti));this.#auxDisposals.set(key,pending);pending.then(()=>this.#auxDisposals.delete(key),()=>this.#auxDisposals.delete(key));return pending}async auxDisposeSessionBody(Cn,ei,ti={}){let ni=entryKey(Cn,ei);''','Retain already removed entry until physical disposal finishes; deduplicate concurrent disposal')
edit('async disposeAll(){await Promise.all([...this.#e.values()].map(Cn=>this.disposeSession(Cn.accountId,Cn.sessionId)))}','''async disposeAll(){await Promise.all([...this.#e.values()].map(Cn=>this.disposeSession(Cn.accountId,Cn.sessionId)))}auxCloseAdmissionAndDrain(){if(this.#auxDrain)return this.#auxDrain;this.#auxClosing=true;this.#auxDrain=(async()=>{const errors=[];for(const entry of this.#e.values()){this.#S(entry);entry.fanout.closeAll()}do{const results=await Promise.allSettled([...this.#t.values(),...this.#n.values(),...this.#r.values(),...this.#auxDisposals.values(),...[...this.#e.values()].map(entry=>this.disposeSession(entry.accountId,entry.sessionId))]);for(const result of results)if(result.status==='rejected')errors.push(result.reason)}while(this.#t.size||this.#n.size||this.#r.size||this.#auxDisposals.size||this.#e.size);if(errors.length)throw new AggregateError(errors,`Aux agent sessions did not settle`);})();this.#auxDrain.catch(()=>{});return this.#auxDrain}''','Drain real load/recovery/resume/run/disposal owners, including in-flight publication')
edit('async reloadLoadedAgentSession(Cn,ei){let ti=entryKey(Cn,ei);','reloadLoadedAgentSession(Cn,ei){return auxBackgroundWriters().run(()=>this.auxReloadLoadedAgentSession(Cn,ei))}async auxReloadLoadedAgentSession(Cn,ei){let ti=entryKey(Cn,ei);','Retain in-flight agent reload through physical old/new disposal')
edit('let ri=ni.agent,ii=await this.#i(Cn,ei);ni.unsubscribe(),ni.agent=ii,','let ri=ni.agent,ii=await this.#i(Cn,ei);if(this.#auxClosing||this.#e.get(ti)!==ni){await ii.dispose({closeOwnedTabs:!1});return}ni.unsubscribe(),ni.agent=ii,','Never publish a reloaded agent into a closed or removed session')
edit('throw ri?.(),await ni.dispose().catch(()=>{}),Cn','ri?.();try{await ni.dispose()}catch(cleanupError){throw new AggregateError([Cn,cleanupError],`Aux unpublished agent disposal failed`)}throw Cn','Do not hide failed unpublished-agent disposal from pending load outcome')
# Preserve original cleanup ordering but wait every disposer even after failure.
old=section('async dispose(Cn={}){this.#n=!0,this.execSessions.dispose()', 'async refreshMcpTools()')
new='''async dispose(Cn={}){this.#n=true;const errors=[];const settle=async callback=>{try{await callback()}catch(error){errors.push(error)}};await settle(()=>this.execSessions.dispose());this.#$();this.#t=[];await settle(()=>this.hooks.trigger(`session.dispose`,{},void 0));await settle(()=>this.#D?.shutdown());const results=await Promise.allSettled(this.agent.state.tools.map(tool=>Promise.resolve().then(()=>tool.dispose?.())));for(const result of results)if(result.status===`rejected`)errors.push(result.reason);await settle(()=>this.browser?.dispose(Cn));if(errors.length)throw new AggregateError(errors,`Aux session disposal failed`)}'''
edit(old,new,'Wait all actual tool/browser/hook cleanup; native exec descendant proof remains independent')
edit('(auxBrokerBoundary().assertOwner(),auxBrokerBoundary().noteUntracked(),GlobalAgentSessionServer.connect(ei,ti,oi,ni))','auxBackgroundWriters().run(()=>GlobalAgentSessionServer.connect(ei,ti,oi,ni))','Track websocket connect plus server-owned physical background work')
edit('(auxBrokerBoundary().assertOwner(),auxBrokerBoundary().noteUntracked(),GlobalAgentSessionServer.handleCommand(ti,ai,oi.command,oi.commandId,ei))','auxBackgroundWriters().run(()=>GlobalAgentSessionServer.handleCommand(ti,ai,oi.command,oi.commandId,ei))','Track explicit command plus separately retained actual Agent run')
# Skill tool lifecycle: retain unknown native descendant custody until integrator
# has actual subprocess proof; do not falsely clear it on the execFile callback.
old=section('async function extractSkillArchive(Cn,ei){','async function extractArgs(')
new=old.replace('async function extractSkillArchive(Cn,ei){auxBrokerBoundary().assertOwner();auxBrokerBoundary().noteUntracked();','async function extractSkillArchive(Cn,ei){return auxBackgroundWriters().run(async()=>{auxBrokerBoundary().noteUntracked();const controller=new AbortController,release=auxBackgroundWriters().aborter(controller);')
pipeline='await stream$6.promises.pipeline(stream$6.Readable.fromWeb(Cn.body),auxBrokerBoundary().outputStream(()=>fs$12.createWriteStream(ti)));'
assert new.count(pipeline)==1
new=new.replace(pipeline,'')
new=new.replace(';try{let Cn=await readHead$1(ti,4)', ';try{await stream$6.promises.pipeline(stream$6.Readable.fromWeb(Cn.body),auxBrokerBoundary().outputStream(()=>fs$12.createWriteStream(ti)),{signal:controller.signal});let Cn=await readHead$1(ti,4)')
new=new.replace('runArchiveTool(ai,ii?[`-Z1`,ti]:[`-tf`,ti])','runArchiveTool(ai,ii?[`-Z1`,ti]:[`-tf`,ti],controller.signal)').replace('runArchiveTool(ai,ii?[`-Z`,`--h`,`--t`,ti]:[`-tvf`,ti])','runArchiveTool(ai,ii?[`-Z`,`--h`,`--t`,ti]:[`-tvf`,ti],controller.signal)').replace('runArchiveTool(ai,await extractArgs(ai,ti,ni,si,ri))','runArchiveTool(ai,await extractArgs(ai,ti,ni,si,ri),controller.signal)')
new=new.replace('for(let Cn of ui)await fs$10.rename','for(let Cn of ui){controller.signal.throwIfAborted();await fs$10.rename').replace('path$13.join(ei,Cn))}finally{','path$13.join(ei,Cn))}}finally{')
tail='await fs$10.rm(ti,{force:!0}),await fs$10.rm(ri,{force:!0}),await fs$10.rm(ni,{recursive:!0,force:!0})}}'
assert new.endswith(tail)
new=new[:-len(tail)]+'''const results=await Promise.allSettled([fs$10.rm(ti,{force:true}),fs$10.rm(ri,{force:true}),fs$10.rm(ni,{recursive:true,force:true})]);release();const errors=results.filter(result=>result.status==='rejected').map(result=>result.reason);if(errors.length)throw new AggregateError(errors,'Aux skill archive cleanup failed')}})}'''
# Body absence occurs before files/controllers can be owned.
new=new.replace('const controller=new AbortController,release=auxBackgroundWriters().aborter(controller);let ti=', 'if(!Cn.body)throw new AnthropicError(`skill download response had no body`);const controller=new AbortController,release=auxBackgroundWriters().aborter(controller);let ti=')
new=new.replace('if(!Cn.body)throw new AnthropicError(`skill download response had no body`);let ni=', 'let ni=')
new=new.replace('const controller=new AbortController,release=', 'const auxBody=Cn.body,controller=new AbortController,release=')
new=new.replace('stream$6.Readable.fromWeb(Cn.body)', 'stream$6.Readable.fromWeb(auxBody)')
assert new.count('await stream$6.promises.pipeline(')==1
edit(old,new,'Await pipeline close, actual tool close and every cleanup; keep unknown descendant marker')
edit('async function runArchiveTool(Cn,ei){try{let{stdout:ti}=await execFileAsync$4(Cn,ei);return ti}', 'async function runArchiveTool(Cn,ei,signal){try{if(signal)return await auxRunSkillArchiveTool(Cn,ei,signal);let{stdout:ti}=await execFileAsync$4(Cn,ei);return ti}','Signal-aware extraction waits actual child close as well as callback')
# pin inputs/output; never replace live selected source
sha=lambda b:hashlib.sha256(b).hexdigest()
inputs=[]
for kind,p in [('source',source),('entry',entry)]:
 original=p.read_text();out=original
 for change in changes:
  assert out.count(change['find'])==1,(kind,change['reason'])
  out=out.replace(change['find'],change['replace'])
 inputs.append(dict(kind=kind,path=str(p),inputSha256=sha(original.encode()),outputSha256=sha(out.encode())))
(here/'source/changes.json').write_text(json.dumps(changes,indent=2)+'\n')
(here/'manifest.json').write_text(json.dumps(dict(version=1,daemonInputs=inputs,changeCount=len(changes),remainingLiteralUnknown=inputs and s.count('auxBrokerBoundary().noteUntracked()'),sourceFiles={str(p.relative_to(here)):sha(p.read_bytes()) for p in [here/'source/background-writer-lifetimes.js',here/'source/changes.json',here/'source/aux-background-writers.mjs',here/'generate.py',here/'check.mjs']}),indent=2)+'\n')
print('generated',len(changes),'changes; remaining literal unknown',s.count('auxBrokerBoundary().noteUntracked()'))
