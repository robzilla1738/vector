import {createHash,randomBytes,randomUUID} from 'node:crypto';
import {posix} from 'node:path';
import {mkdir,readFile,readdir,rm,stat} from 'node:fs/promises';
import {Sandbox,type Command} from '@vercel/sandbox';
import {CloudCommandRecordSchema,CloudEnvironmentSchema,CloudReconnectStatusSchema,CloudTaskResultSchema,AuxError,type CloudCommandRecord,type CloudEnvironment,type CloudCommandResult,type CloudFile,type CloudFileEntry,type CloudReconnectStatus,type CloudTaskResult} from '@aux/contracts';
import type {Repo} from '../store/repo.js';
import type {SettingsService} from './settings.js';

const KEY='cloudEnvironments';
const COMMANDS_KEY='cloudCommandHistory';
const MAX_OUTPUT=128*1024;
const ROOT='/vercel/sandbox';
const MAX_FILE=256*1024;
const PREVIEW_PROXY_PORT=3999;
const PREVIEW_PROXY_PATH=`${ROOT}/.aux/preview-proxy.mjs`;
const RESULT_WRITER_PATH=`${ROOT}/.aux/write-result.mjs`;
const MAX_EXPORT=100*1024*1024;
const CLOUD_POLICY={maxActiveEnvironments:3,maxRetainedPerTask:2,maxSessionMinutes:45,maxLifetimeCpuMs:90*60_000,maxLifetimeEgressBytes:1024*1024*1024,defaultCleanupHours:24,maxCleanupHours:72,currencyBudgetAvailable:false} as const;
const CLEANUP_CHECKPOINT_GRACE_MS=24*60*60*1000;
const ACTIVE_PROVIDER_STATES=new Set(['pending','running','stopping','snapshotting']);
type CloudTaskBrief={taskId:string;revision:number;title:string;objective:string;criteria:{criterionId:string;description:string;verification:string}[]};
const PREVIEW_PROXY_SOURCE=`import http from 'node:http';
import net from 'node:net';
const targetPort=Number(process.env.AUX_PREVIEW_TARGET_PORT);
const listenPort=Number(process.env.AUX_PREVIEW_PROXY_PORT);
const expected=process.env.AUX_PREVIEW_SECRET;
const allowed=request=>request.headers['x-aux-preview-token']===expected;
const forwardedHeaders=request=>{const headers={...request.headers};delete headers['x-aux-preview-token'];delete headers.connection;delete headers['proxy-connection'];return headers;};
const server=http.createServer((request,response)=>{
  if(!allowed(request)){response.writeHead(401,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store','www-authenticate':'Bearer'});response.end('Aux preview authorization required.');return;}
  const upstream=http.request({host:'127.0.0.1',port:targetPort,method:request.method,path:request.url,headers:forwardedHeaders(request)},upstreamResponse=>{
    response.writeHead(upstreamResponse.statusCode||502,upstreamResponse.headers);upstreamResponse.pipe(response);
  });
  upstream.on('error',()=>{if(!response.headersSent)response.writeHead(502,{'content-type':'text/plain; charset=utf-8','cache-control':'no-store'});response.end('The preview service is not responding yet.');});
  request.pipe(upstream);
});
server.on('upgrade',(request,socket,head)=>{
  if(!allowed(request)){socket.end('HTTP/1.1 401 Unauthorized\\r\\nConnection: close\\r\\n\\r\\n');return;}
  const upstream=net.connect(targetPort,'127.0.0.1',()=>{
    const lines=[(request.method||'GET')+' '+(request.url||'/')+' HTTP/'+request.httpVersion];
    for(let index=0;index<request.rawHeaders.length;index+=2){const name=request.rawHeaders[index];if(name.toLowerCase()==='x-aux-preview-token')continue;lines.push(name+': '+request.rawHeaders[index+1]);}
    lines.push('','');upstream.write(lines.join('\\r\\n'));if(head.length)upstream.write(head);socket.pipe(upstream).pipe(socket);
  });
  upstream.on('error',()=>socket.destroy());socket.on('error',()=>upstream.destroy());
});
server.listen(listenPort,'0.0.0.0');`;
const RESULT_WRITER_SOURCE=`import {readFile,writeFile,rename,lstat,realpath} from 'node:fs/promises';
import {resolve,relative,isAbsolute} from 'node:path';
const root=process.cwd(),aux=resolve(root,'.aux');
let input='';for await(const chunk of process.stdin){input+=chunk;if(Buffer.byteLength(input)>1024*1024)throw new Error('Result input exceeds 1 MB.');}
const task=JSON.parse(await readFile(resolve(aux,'task.json'),'utf8'));const value=JSON.parse(input||'{}');
const text=(name,limit)=>{const item=value[name];if(typeof item!=='string'||!item.trim()||item.length>limit)throw new Error(name+' must be non-empty and at most '+limit+' characters.');return item.trim();};
if(!['completed','needs_input','failed'].includes(value.status))throw new Error('status must be completed, needs_input or failed.');
const allowedCriteria=new Set((task.criteria||[]).map(item=>item.criterionId));const criteria=Array.isArray(value.criteria)?value.criteria:[];
if(criteria.length>20)throw new Error('At most 20 criterion claims are allowed.');const seen=new Set();for(const item of criteria){if(!item||!allowedCriteria.has(item.criterionId)||seen.has(item.criterionId)||!['met','not_met','needs_review'].includes(item.status)||typeof item.summary!=='string'||!item.summary.trim()||item.summary.length>2000)throw new Error('A criterion claim is invalid.');seen.add(item.criterionId);}
const artifacts=Array.isArray(value.artifacts)?value.artifacts:[];if(artifacts.length>50)throw new Error('At most 50 artifacts are allowed.');for(const item of artifacts){if(!item||typeof item.path!=='string'||typeof item.label!=='string'||!item.label.trim()||item.label.length>200)throw new Error('An artifact declaration is invalid.');const path=resolve(root,item.path);if(isAbsolute(item.path)||relative(root,path).startsWith('..'))throw new Error('Artifact paths must stay inside the workspace.');const [stat,actual]=await Promise.all([lstat(path),realpath(path)]);if(!stat.isFile()||stat.isSymbolicLink()||relative(root,actual).startsWith('..'))throw new Error('Declared artifacts must be regular workspace files.');}
let localRequest;if(value.localRequest!==undefined){const item=value.localRequest;if(!item||!['browser','credential','approval','file','question'].includes(item.kind)||typeof item.prompt!=='string'||!item.prompt.trim()||item.prompt.length>2000||item.resourceId!==undefined&&(typeof item.resourceId!=='string'||!item.resourceId.trim()||item.resourceId.length>100))throw new Error('localRequest is invalid.');localRequest={kind:item.kind,prompt:item.prompt.trim(),...(item.resourceId?{resourceId:item.resourceId.trim()}:{})};}
if(value.status==='needs_input'&&!localRequest)throw new Error('needs_input requires localRequest.');if(value.status!=='needs_input'&&localRequest)throw new Error('localRequest is only valid with needs_input.');
const result={format:'aux-cloud-result-v1',taskId:task.taskId,taskRevision:task.taskRevision,sourceTree:task.sourceTree,...(task.authority?.leaseId?{leaseId:task.authority.leaseId}:{}),status:value.status,summary:text('summary',4000),criteria:criteria.map(item=>({criterionId:item.criterionId,status:item.status,summary:item.summary.trim()})),artifacts:artifacts.map(item=>({path:item.path,label:item.label.trim()})),...(localRequest?{localRequest}:{}),updatedAt:Date.now()};
const temporary=resolve(aux,'result.json.tmp');await writeFile(temporary,JSON.stringify(result,null,2)+'\\n',{mode:0o600});await rename(temporary,resolve(aux,'result.json'));process.stdout.write(JSON.stringify({written:true,status:result.status,updatedAt:result.updatedAt})+'\\n');`;

export class CloudEnvironmentService{
  private writes:Promise<unknown>=Promise.resolve();
  private cleanupRunning=false;
  private activeCommandIds=new Set<string>();
  private retentionPreserver?: (record:CloudEnvironment)=>Promise<'preserved'|'none'>;
  constructor(private repo:Repo,private settings:SettingsService,private provider:{get:typeof Sandbox.get;list:typeof Sandbox.list;create:typeof Sandbox.create}=Sandbox){const timer=setInterval(()=>void this.reconcileDue().catch(()=>{}),60_000);timer.unref();queueMicrotask(()=>void this.reconcileDue().catch(()=>{}));}
  setRetentionPreserver(preserver:(record:CloudEnvironment)=>Promise<'preserved'|'none'>){this.retentionPreserver=preserver;}
  async list(taskId:string){await this.reconcileDue();return this.records().filter(item=>item.taskId===taskId&&item.status!=='deleted').sort((a,b)=>b.updatedAt-a.updatedAt);}
  async create(input:{taskId:string;taskRevision:number;projectId:string;runtime:CloudEnvironment['runtime'];region:string;port:number;timeoutMinutes:number;cleanupHours:number}){
    const retained=this.records().filter(record=>record.taskId===input.taskId&&(record.status==='running'||record.status==='stopped'));if(retained.length>=CLOUD_POLICY.maxRetainedPerTask)throw new AuxError('conflict',`This task already retains ${CLOUD_POLICY.maxRetainedPerTask} cloud environments. Delete one before creating another.`);
    const credentials=this.settings.vercelSandboxCredentials();let active=0;const existing=await this.provider.list({...credentials,namePrefix:'aux-',tags:{product:'aux'}});for await(const remote of existing){if(ACTIVE_PROVIDER_STATES.has(remote.status)&&++active>=CLOUD_POLICY.maxActiveEnvironments)throw new AuxError('conflict',`Aux limits this account to ${CLOUD_POLICY.maxActiveEnvironments} active cloud environments. Stop or delete one before creating another.`);}
    const environmentId=randomUUID();const remoteName=`aux-${input.taskId.slice(0,8)}-${environmentId.slice(0,8)}`;const started=Date.now();
    try{
      const cleanupAt=started+Math.min(input.cleanupHours,CLOUD_POLICY.maxCleanupHours)*60*60*1000;
      const common={...credentials,name:remoteName,region:input.region as never,ports:[],timeout:input.timeoutMinutes*60_000,persistent:true,snapshotExpiration:7*24*60*60*1000,keepLastSnapshots:{count:1},tags:{product:'aux',task:input.taskId.slice(0,64),'cleanup-at':String(cleanupAt)}};
      const sandbox=input.runtime==='universal'
        ? await this.provider.create({...common,image:'vercel/sandbox/universal:latest'})
        : await this.provider.create({...common,runtime:input.runtime});
      const record:CloudEnvironment=CloudEnvironmentSchema.parse({environmentId,provider:'vercel',remoteName,taskId:input.taskId,taskRevision:input.taskRevision,projectId:input.projectId,runtime:input.runtime,region:sandbox.region||input.region,port:input.port,timeoutMinutes:input.timeoutMinutes,status:'running',createdAt:started,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),cleanupAt,cleanupState:'scheduled'});await this.save(record);return record;
    }catch(error){const message=error instanceof Error?error.message:String(error);const record=CloudEnvironmentSchema.parse({environmentId,provider:'vercel',remoteName,taskId:input.taskId,taskRevision:input.taskRevision,projectId:input.projectId,runtime:input.runtime,region:input.region,port:input.port,status:'error',createdAt:started,updatedAt:Date.now(),lastError:message.slice(0,1000)});await this.save(record);throw new Error(`Cloud environment creation failed: ${message}`);}
  }
  async run(record:CloudEnvironment,executable:string,args:string[]):Promise<CloudCommandResult>{
    this.requireLive(record);this.requireSourceReady(record);const startedAt=Date.now();const commandId=randomUUID();const base={commandId,environmentId:record.environmentId,taskId:record.taskId,projectId:record.projectId,executable,args,mode:'command' as const,startedAt,stdout:'',stderr:''};await this.saveCommand({...base,status:'running'});this.activeCommandIds.add(commandId);let dispatchStarted=false;
    try{const sandbox=await this.runningSandbox(record);dispatchStarted=true;const command=await sandbox.runCommand(executable,args,{timeoutMs:10*60_000});const [stdout,stderr]=await Promise.all([command.stdout(),command.stderr()]);const next=CloudEnvironmentSchema.parse({...record,status:'running',region:sandbox.region||record.region,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:this.previewUrl(record,sandbox),lastError:undefined});const finishedAt=Date.now();const result:CloudCommandResult={...base,environment:next,status:command.exitCode===0?'completed':'failed',finishedAt,exitCode:command.exitCode,stdout:stdout.slice(-MAX_OUTPUT),stderr:stderr.slice(-MAX_OUTPUT),...(command.durationMs!=null?{durationMs:command.durationMs}:{})};await Promise.all([this.save(next),this.saveCommand(result)]);return result;
    }catch(error){const message=error instanceof Error?error.message:String(error);await this.saveCommand({...base,status:dispatchStarted?'uncertain':'failed',finishedAt:Date.now(),stderr:message.slice(0,MAX_OUTPUT),...(dispatchStarted?{lastError:'Aux lost confirmation after sending this command. Inspect the remote workspace before deciding whether to run it again.'}: {})});throw error;}finally{this.activeCommandIds.delete(commandId);}
  }
  async commands(record:CloudEnvironment){
    const records=this.commandRecords().filter(item=>item.taskId===record.taskId&&item.environmentId===record.environmentId).sort((a,b)=>b.startedAt-a.startedAt).slice(0,50);
    for(const saved of records.filter(item=>item.status==='running'&&!item.providerCommandId&&!this.activeCommandIds.has(item.commandId)))await this.saveCommand(CloudCommandRecordSchema.parse({...saved,status:'uncertain',finishedAt:Date.now(),lastError:'Aux restarted or lost the provider response before it saved a remote command identity. Inspect the remote workspace before deciding whether to run this command again.'}));
    const running=records.filter(item=>item.status==='running'&&item.providerCommandId);
    if(!running.length||record.status==='deleted')return records;
    const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});
    for(const saved of running)try{const command=await sandbox.getCommand(saved.providerCommandId!);const output=await this.commandOutput(command);const exitCode=command.exitCode;const next=CloudCommandRecordSchema.parse({...saved,status:exitCode===null?'running':exitCode===0?'completed':'failed',...(exitCode===null?{}:{exitCode,finishedAt:Date.now()}),...(command.durationMs!=null?{durationMs:command.durationMs}:{}),stdout:output.stdout||saved.stdout,stderr:output.stderr||saved.stderr,lastError:undefined});await this.saveCommand(next);}catch(error){await this.saveCommand(CloudCommandRecordSchema.parse({...saved,lastError:`Provider status refresh failed: ${error instanceof Error?error.message:String(error)}`.slice(0,1000)}));}
    return this.commandRecords().filter(item=>item.taskId===record.taskId&&item.environmentId===record.environmentId).sort((a,b)=>b.startedAt-a.startedAt).slice(0,50);
  }
  getCommand(taskId:string,environmentId:string,commandId:string){const record=this.commandRecords().find(item=>item.taskId===taskId&&item.environmentId===environmentId&&item.commandId===commandId);if(!record)throw new AuxError('not_found','Cloud command does not belong to this task and environment.');return record;}
  async startService(record:CloudEnvironment,executable:string,args:string[],timeoutMinutes:number){
    this.requireLive(record);this.requireSourceReady(record);const commandId=randomUUID();const startedAt=Date.now();const base={commandId,environmentId:record.environmentId,taskId:record.taskId,projectId:record.projectId,executable,args,mode:'service' as const,startedAt,stdout:'',stderr:''};await this.saveCommand({...base,status:'running'});this.activeCommandIds.add(commandId);let dispatchStarted=false;
    try{const sandbox=await this.runningSandbox(record);dispatchStarted=true;const command=await sandbox.runCommand({cmd:executable,args,cwd:ROOT,detached:true,timeoutMs:timeoutMinutes*60_000});const next=CloudCommandRecordSchema.parse({...base,providerCommandId:command.cmdId,status:'running',startedAt:command.startedAt||startedAt});await Promise.all([this.saveCommand(next),this.save(CloudEnvironmentSchema.parse({...record,status:'running',updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:this.previewUrl(record,sandbox),lastError:undefined}))]);return next;
    }catch(error){const message=error instanceof Error?error.message:String(error);const uncertain=dispatchStarted;await this.saveCommand(CloudCommandRecordSchema.parse({...base,status:uncertain?'uncertain':'failed',finishedAt:Date.now(),stderr:message.slice(0,MAX_OUTPUT),...(uncertain?{lastError:'Aux lost confirmation after starting this service. Inspect the remote environment before deciding whether to start it again.'}: {})}));throw error;}finally{this.activeCommandIds.delete(commandId);}
  }
  async refreshCommand(record:CloudEnvironment,saved:CloudCommandRecord){this.requireLive(record);if(!saved.providerCommandId)return saved;const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});const command=await sandbox.getCommand(saved.providerCommandId);const output=await this.commandOutput(command);const exitCode=command.exitCode;const next=CloudCommandRecordSchema.parse({...saved,status:exitCode===null?'running':exitCode===0?'completed':'failed',...(exitCode===null?{}:{exitCode,finishedAt:Date.now()}),...(command.durationMs!=null?{durationMs:command.durationMs}:{}),stdout:output.stdout||saved.stdout,stderr:output.stderr||saved.stderr,lastError:undefined});await this.saveCommand(next);return next;}
  async stopCommand(record:CloudEnvironment,saved:CloudCommandRecord){this.requireLive(record);if(!saved.providerCommandId||saved.status!=='running')return saved;const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});const command=await sandbox.getCommand(saved.providerCommandId);await command.kill('SIGTERM');const output=await this.commandOutput(command);const next=CloudCommandRecordSchema.parse({...saved,status:'stopped',finishedAt:Date.now(),stdout:output.stdout,stderr:output.stderr});await this.saveCommand(next);return next;}
  async refresh(record:CloudEnvironment){this.requireLive(record);try{const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});let status:CloudEnvironment['status']=sandbox.status==='stopped'?'stopped':sandbox.status==='failed'||sandbox.status==='aborted'?'error':'running';const blocked=this.budgetReason(sandbox);if(blocked&&status==='running'){await sandbox.stop();status='stopped';}const next=CloudEnvironmentSchema.parse({...record,status,authority:status==='running'?record.authority??'local':'local',region:sandbox.region||record.region,updatedAt:Date.now(),expiresAt:status==='running'?sandbox.expiresAt?.getTime():undefined,previewUrl:status==='running'?this.previewUrl(record,sandbox):record.previewUrl,totalCpuMs:sandbox.totalActiveCpuDurationMs,totalIngressBytes:sandbox.totalIngressBytes,totalEgressBytes:sandbox.totalEgressBytes,budgetBlockedReason:blocked,lastError:status==='error'?`Vercel session is ${sandbox.status}.`:undefined});await this.save(next);return next;}catch(error){const message=error instanceof Error?error.message:String(error);const next=CloudEnvironmentSchema.parse({...record,status:'error',updatedAt:Date.now(),lastError:`Provider refresh failed: ${message}`.slice(0,1000)});await this.save(next);return next;}}
  async resume(record:CloudEnvironment){this.requireLive(record);const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});const blocked=this.budgetReason(sandbox);if(blocked){await this.save(CloudEnvironmentSchema.parse({...record,status:'stopped',updatedAt:Date.now(),totalCpuMs:sandbox.totalActiveCpuDurationMs,totalIngressBytes:sandbox.totalIngressBytes,totalEgressBytes:sandbox.totalEgressBytes,budgetBlockedReason:blocked}));throw new AuxError('conflict',blocked);}await sandbox.runCommand('/usr/bin/true',[],{timeoutMs:30_000});const next=CloudEnvironmentSchema.parse({...record,status:'running',region:sandbox.region||record.region,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:record.previewProtected?undefined:record.previewUrl,previewProxyCommandId:record.previewProtected?undefined:record.previewProxyCommandId,totalCpuMs:sandbox.totalActiveCpuDurationMs,totalIngressBytes:sandbox.totalIngressBytes,totalEgressBytes:sandbox.totalEgressBytes,budgetBlockedReason:undefined,lastError:undefined});await this.save(next);return next;}
  async files(record:CloudEnvironment,relativePath:string):Promise<CloudFileEntry[]>{this.requireLive(record);const clean=this.relativePath(relativePath),path=this.remotePath(clean);const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});if(clean)await this.assertRemotePath(sandbox,clean,'directory');const entries=await sandbox.fs.readdir(path,{withFileTypes:true});const output:CloudFileEntry[]=[];for(const entry of entries.slice(0,500)){if(entry.isSymbolicLink())continue;const childRelative=posix.join(clean,entry.name);if(entry.isDirectory()){output.push({path:childRelative,name:entry.name,kind:'directory'});continue;}if(!entry.isFile())continue;const stat=await sandbox.fs.stat(this.remotePath(childRelative));output.push({path:childRelative,name:entry.name,kind:'file',size:stat.size,modifiedAt:stat.mtimeMs});}return output.sort((a,b)=>a.kind===b.kind?a.name.localeCompare(b.name):a.kind==='directory'?-1:1);}
  async readFile(record:CloudEnvironment,relativePath:string):Promise<CloudFile>{this.requireLive(record);const clean=this.relativePath(relativePath);if(!clean)throw new AuxError('invalid_params','Choose a remote file.');const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});const stat=await this.assertRemotePath(sandbox,clean,'file');if(stat.size>MAX_FILE)throw new AuxError('conflict','Remote files larger than 256 KB are not opened in Aux.');const content=await sandbox.fs.readFile(this.remotePath(clean),'utf8');if(content.includes('\0'))throw new AuxError('conflict','Binary remote files are not opened in Aux.');return {path:clean,content,size:stat.size,modifiedAt:stat.mtimeMs};}
  async taskResult(record:CloudEnvironment){
    const entries=await this.files(record,'.aux');if(!entries.some(entry=>entry.kind==='file'&&entry.name==='result.json'))return null;
    const file=await this.readFile(record,'.aux/result.json');let value:unknown;try{value=JSON.parse(file.content);}catch{throw new AuxError('conflict','The cloud task result is not valid JSON.');}
    const parsed=CloudTaskResultSchema.safeParse(value);if(!parsed.success)throw new AuxError('conflict','The cloud task result does not match the Aux result contract.');const result=parsed.data;if(result.taskId!==record.taskId||result.taskRevision!==record.taskRevision||!record.sourceTree||result.sourceTree!==record.sourceTree)throw new AuxError('conflict','The cloud task result does not match this task revision and uploaded source tree.');if(record.leaseId&&result.leaseId!==record.leaseId)throw new AuxError('conflict','The cloud task result was not produced under this environment’s current task authority lease.');
    const criteria=new Set(result.criteria.map(item=>item.criterionId));if(criteria.size!==result.criteria.length)throw new AuxError('conflict','The cloud task result repeats a criterion.');
    const normalized={...result,artifacts:result.artifacts.map(item=>{const path=this.relativePath(item.path);if(!path)throw new AuxError('conflict','A cloud task result artifact path is invalid.');return {...item,path};})};
    await this.save(CloudEnvironmentSchema.parse({...record,lastResultStatus:result.status,lastResultSummary:result.summary,lastResultUpdatedAt:result.updatedAt,localRequest:result.localRequest,updatedAt:Date.now()}));return normalized;
  }
  async handoff(record:CloudEnvironment,task:CloudTaskBrief){
    this.requireSourceReady(record);if(!record.sourceTree||record.taskRevision!==task.revision)throw new AuxError('conflict','Upload the current checkout and task brief before handing off this task.');if(record.authority==='cloud'&&record.leaseId)return record;
    const sandbox=await this.runningSandbox(record);const leaseId=randomUUID(),authorityGrantedAt=Date.now();await sandbox.mkDir(`${ROOT}/.aux`);await Promise.all([sandbox.fs.writeFile(`${ROOT}/.aux/task.json`,this.taskBrief(task,record.sourceTree,record.syncedAt??authorityGrantedAt,leaseId,authorityGrantedAt),'utf8'),sandbox.fs.writeFile(RESULT_WRITER_PATH,RESULT_WRITER_SOURCE,'utf8')]);const next=CloudEnvironmentSchema.parse({...record,authority:'cloud',leaseId,authorityGrantedAt,localRequest:undefined,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),lastError:undefined});await this.save(next);return next;
  }
  async handoffAndStart(record:CloudEnvironment,task:CloudTaskBrief,executable:string,args:string[],timeoutMinutes:number){
    const environment=await this.handoff(record,task);
    const command=await this.startService(environment,executable,args,timeoutMinutes);
    return{environment,command};
  }
  async openTerminal(record:CloudEnvironment){const sandbox=await this.runningSandbox(record);const session=await sandbox.openInteractive();const environment=CloudEnvironmentSchema.parse({...record,status:'running',region:sandbox.region||record.region,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:this.previewUrl(record,sandbox),lastError:undefined});await this.save(environment);return{terminalId:randomUUID(),environmentId:record.environmentId,url:session.url,token:session.token,cwd:ROOT,environment};}
  async openPreview(record:CloudEnvironment){
    this.requireSourceReady(record);const sandbox=await this.runningSandbox(record);
    await sandbox.update({ports:[]});
    if(record.previewProxyCommandId){try{const old=await sandbox.getCommand(record.previewProxyCommandId);if(old.exitCode===null)await old.kill('SIGTERM');}catch{/* previous session or command already ended */}}
    await sandbox.mkDir(`${ROOT}/.aux`);await sandbox.fs.writeFile(PREVIEW_PROXY_PATH,PREVIEW_PROXY_SOURCE,'utf8');
    const token=randomBytes(32).toString('base64url');
    const proxy=await sandbox.runCommand({cmd:'node',args:[PREVIEW_PROXY_PATH],cwd:ROOT,env:{AUX_PREVIEW_SECRET:token,AUX_PREVIEW_TARGET_PORT:String(record.port),AUX_PREVIEW_PROXY_PORT:String(PREVIEW_PROXY_PORT)},detached:true,timeoutMs:45*60_000});
    const ready=await sandbox.runCommand({cmd:'node',args:['-e',"const http=require('http');let attempts=0;const check=()=>{const request=http.request({host:'127.0.0.1',port:Number(process.env.AUX_PREVIEW_PROXY_PORT),headers:{'x-aux-preview-token':process.env.AUX_PREVIEW_SECRET}},response=>process.exit(response.statusCode===401?1:0));request.on('error',()=>{if(++attempts<20)setTimeout(check,100);else process.exit(1)});request.end()};check()"],cwd:ROOT,env:{AUX_PREVIEW_SECRET:token,AUX_PREVIEW_PROXY_PORT:String(PREVIEW_PROXY_PORT)},timeoutMs:5_000});
    if(ready.exitCode!==0){await proxy.kill('SIGTERM').catch(()=>{});throw new Error('The protected preview gateway did not become ready. No public preview route was opened.');}
    await sandbox.update({ports:[PREVIEW_PROXY_PORT]});const url=sandbox.domain(PREVIEW_PROXY_PORT);
    const environment=CloudEnvironmentSchema.parse({...record,status:'running',region:sandbox.region||record.region,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:url,previewProtected:true,previewProxyCommandId:proxy.cmdId,lastError:undefined});await this.save(environment);return{environment,url,token};
  }
  async exportWorkspace(record:CloudEnvironment){
    const sandbox=await this.runningSandbox(record);const stamp=Date.now();const filename=`aux-${record.remoteName}-${stamp}.tar.gz`;const remotePath=`/tmp/${filename}`;
    const command=await sandbox.runCommand('/bin/tar',['-czf',remotePath,'--exclude=.git','--exclude=node_modules','--exclude=.aux/preview-proxy.mjs','.'],{timeoutMs:10*60_000});if(command.exitCode!==0)throw new Error(`Cloud export failed: ${(await command.stderr()).slice(-2000)}`);
    const remoteStat=await sandbox.fs.stat(remotePath);if(!remoteStat.isFile()||remoteStat.size>MAX_EXPORT){await sandbox.fs.rm(remotePath,{force:true});throw new AuxError('conflict','Cloud workspace exports are limited to 100 MB. Remove large generated files and try again.');}
    const directory=`${this.settings.all().dataDir}/cloud-exports`;await mkdir(directory,{recursive:true,mode:0o700});await this.pruneExports(directory);const path=`${directory}/${randomUUID()}.tar.gz`;
    try{const downloaded=await sandbox.downloadFile({path:remotePath},{path});if(!downloaded)throw new Error('The remote archive disappeared before download.');const localStat=await stat(path);if(!localStat.isFile()||localStat.size>MAX_EXPORT)throw new Error('The downloaded cloud archive is invalid or too large.');const environment=CloudEnvironmentSchema.parse({...record,status:'running',updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:this.previewUrl(record,sandbox),exportedAt:Date.now(),exportedBytes:localStat.size,lastError:undefined});await this.save(environment);return{environment,path,filename,bytes:localStat.size};}catch(error){await rm(path,{force:true});throw error;}finally{await sandbox.fs.rm(remotePath,{force:true}).catch(()=>{});}
  }
  async downloadResultArtifact(record:CloudEnvironment,artifactPath:string,resultUpdatedAt:number){
    const sandbox=await this.runningSandbox(record);const clean=this.relativePath(artifactPath);if(!clean)throw new AuxError('invalid_params','Choose a declared result artifact.');
    const remote=this.remotePath(clean);const remoteStat=await this.assertRemotePath(sandbox,clean,'file');
    const limit=25*1024*1024;if(remoteStat.size>limit)throw new AuxError('conflict','Individual cloud result artifacts are limited to 25 MB. Export the workspace to review larger output.');
    const directory=`${this.settings.all().dataDir}/cloud-exports`;await mkdir(directory,{recursive:true,mode:0o700});await this.pruneExports(directory);const path=`${directory}/${randomUUID()}.artifact`;
    try{const downloaded=await sandbox.downloadFile({path:remote},{path});if(!downloaded)throw new AuxError('not_found','The declared cloud result artifact no longer exists. Refresh the worker result.');const local=await stat(path);if(!local.isFile()||local.size>limit)throw new AuxError('conflict','The downloaded cloud result artifact is invalid or too large.');const sha256=createHash('sha256').update(await readFile(path)).digest('hex');const filename=posix.basename(clean).replace(/[^A-Za-z0-9._-]+/g,'-').slice(0,180)||'aux-cloud-result';return{environment:record,resultUpdatedAt,artifactPath:clean,path,filename,bytes:local.size,sha256};}catch(error){await rm(path,{force:true});throw error;}
  }
  async stageResultArtifacts(record:CloudEnvironment,result:CloudTaskResult){
    const staged:{path:string;filename:string;artifactPath:string;label:string;bytes:number;sha256:string}[]=[];let total=0;
    try{for(const artifact of result.artifacts){const item=await this.downloadResultArtifact(record,artifact.path,result.updatedAt);total+=item.bytes;if(total>50*1024*1024)throw new AuxError('conflict','Cloud result artifacts are limited to 50 MB total. Save selected artifacts or export the workspace instead.');staged.push({...item,label:artifact.label});}return staged;}
    catch(error){await Promise.all(staged.map(item=>rm(item.path,{force:true})));throw error;}
  }
  async inventory(){
    const local=new Map(this.records().filter(record=>record.status!=='deleted').map(record=>[record.remoteName,record]));const environments=[];const seen=new Set<string>();let truncated=false;let activeCount=0;
    const result=await this.provider.list({...this.settings.vercelSandboxCredentials(),namePrefix:'aux-',tags:{product:'aux'}});
    for await(const remote of result){seen.add(remote.name);if(ACTIVE_PROVIDER_STATES.has(remote.status))activeCount++;if(environments.length>=200){truncated=true;continue;}const record=local.get(remote.name);environments.push({remoteName:remote.name,status:remote.status,createdAt:remote.createdAt,updatedAt:remote.updatedAt,...(remote.region?{region:remote.region}:{}),...(remote.runtime?{runtime:remote.runtime}:{}),...(remote.timeout?{timeoutMinutes:Math.ceil(remote.timeout/60_000)}:{}),...(remote.vcpus?{vcpus:remote.vcpus}:{}),...(remote.memory?{memoryMb:remote.memory}:{}),managed:!!record,...(record?{environmentId:record.environmentId,taskId:record.taskId}:{})});}
    const missingRecords=[...local.values()].filter(record=>!seen.has(record.remoteName)).slice(0,200);return{checkedAt:Date.now(),environments,missingRecords,truncated,activeCount,policy:CLOUD_POLICY};
  }
  async cleanupOrphan(remoteName:string,expectedUpdatedAt:number){
    if(this.records().some(record=>record.remoteName===remoteName&&record.status!=='deleted'))throw new AuxError('conflict','This sandbox is still attached to an Aux task. Delete it from that task instead.');
    const result=await this.provider.list({...this.settings.vercelSandboxCredentials(),namePrefix:remoteName,tags:{product:'aux'}});let match:{name:string;updatedAt:number}|undefined;
    for await(const remote of result){if(remote.name===remoteName){match=remote;break;}}
    if(!match)throw new AuxError('not_found','This orphaned sandbox no longer exists. Refresh the account inventory.');
    if(match.updatedAt!==expectedUpdatedAt)throw new AuxError('conflict','This sandbox changed after the inventory check. Refresh before deleting it.');
    const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:remoteName,resume:false});await sandbox.delete({deleteOrphanSnapshots:true});return{remoteName,deleted:true as const};
  }
  async forgetMissing(record:CloudEnvironment,expectedUpdatedAt:number){
    if(record.updatedAt!==expectedUpdatedAt)throw new AuxError('conflict','This cloud record changed after the inventory check. Refresh before removing it.');
    const result=await this.provider.list({...this.settings.vercelSandboxCredentials(),namePrefix:record.remoteName,tags:{product:'aux'}});for await(const remote of result){if(remote.name===record.remoteName)throw new AuxError('conflict','This sandbox still exists at the provider. Refresh its state or delete it normally.');}
    const next=CloudEnvironmentSchema.parse({...record,status:'deleted',authority:'local',updatedAt:Date.now(),expiresAt:undefined,previewUrl:undefined,previewProxyCommandId:undefined,lastError:'The provider resource was already absent; its local record was removed.'});await this.save(next);return next;
  }
  async sync(record:CloudEnvironment,files:{name:string;content:string}[],skippedFiles:string[],sourceTree:string,task:{taskId:string;revision:number;title:string;objective:string;criteria:{criterionId:string;description:string;verification:string}[]}){
    this.requireLive(record);const paths=files.map(file=>this.relativePath(file.name));if(paths.some((path,index)=>!path||path!==files[index]!.name))throw new AuxError('invalid_params','A local project path could not be transferred safely.');
    const sandbox=await this.runningSandbox(record);const uploading=CloudEnvironmentSchema.parse({...record,taskRevision:task.revision,syncState:'uploading',pendingSourceTree:sourceTree,updatedAt:Date.now(),lastError:undefined});await this.save(uploading);
    try{let syncedBytes=0;
      const current=new Set(paths);for(const previous of record.syncedPaths??[])if(!current.has(previous))await sandbox.fs.rm(this.remotePath(previous),{force:true}).catch(()=>{});
      for(let index=0;index<files.length;index+=50){const batch=files.slice(index,index+50).map(file=>{const content=Buffer.from(file.content);syncedBytes+=content.byteLength;return {path:this.remotePath(file.name),content};});await sandbox.writeFiles(batch);}
      await sandbox.mkDir(`${ROOT}/.aux`);
      const syncedAt=Date.now();
      await sandbox.fs.writeFile(`${ROOT}/.aux/source.json`,JSON.stringify({format:'aux-cloud-source-v2',taskId:record.taskId,taskRevision:task.revision,projectId:record.projectId,sourceTree,syncedAt,files:paths.length,skipped:skippedFiles.length})+'\n','utf8');
      await Promise.all([sandbox.fs.writeFile(`${ROOT}/.aux/task.json`,this.taskBrief(task,sourceTree,syncedAt),'utf8'),sandbox.fs.writeFile(RESULT_WRITER_PATH,RESULT_WRITER_SOURCE,'utf8')]);
      const next=CloudEnvironmentSchema.parse({...uploading,status:'running',authority:'local',leaseId:undefined,authorityGrantedAt:undefined,updatedAt:Date.now(),expiresAt:sandbox.expiresAt?.getTime(),previewUrl:this.previewUrl(record,sandbox),syncedAt:Date.now(),syncedFiles:files.length,syncedBytes,skippedFiles:skippedFiles.slice(0,200),syncedPaths:paths,sourceTree,syncState:'ready',pendingSourceTree:undefined,lastError:undefined});await this.save(next);return next;
    }catch(error){const message=error instanceof Error?error.message:String(error);await this.save(CloudEnvironmentSchema.parse({...uploading,syncState:'failed',updatedAt:Date.now(),lastError:`Source upload did not finish: ${message}`.slice(0,1000)}));throw error;}
  }
  async stop(record:CloudEnvironment){this.requireLive(record);const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});const result=await sandbox.stop();const snapshot=result.snapshot as {id?:string;snapshotId?:string}|undefined;const next=CloudEnvironmentSchema.parse({...record,status:'stopped',authority:'local',updatedAt:Date.now(),snapshotId:snapshot?.id??snapshot?.snapshotId,activeCpuMs:result.activeCpuDurationMs,ingressBytes:result.networkTransfer?.ingress,egressBytes:result.networkTransfer?.egress,expiresAt:undefined});await this.save(next);return next;}
  async delete(record:CloudEnvironment){if(record.status!=='deleted'){const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});await sandbox.delete({deleteOrphanSnapshots:true});}const next=CloudEnvironmentSchema.parse({...record,status:'deleted',authority:'local',updatedAt:Date.now(),expiresAt:undefined,cleanupState:undefined,cleanupError:undefined});await this.save(next);return next;}
  get(taskId:string,environmentId:string){const record=this.records().find(item=>item.environmentId===environmentId&&item.taskId===taskId);if(!record)throw new AuxError('not_found','Cloud environment does not belong to this task.');return record;}
  reconnectStatus(taskId:string):CloudReconnectStatus{
    const environments=this.records().filter(item=>item.taskId===taskId&&item.status!=='deleted');
    let credentialsAvailable=true;
    let note='Local reconnect status only. Aux did not resume, stop, delete or inventory remote sandboxes.';
    try{this.settings.vercelSandboxCredentials();}
    catch(error){
      credentialsAvailable=false;
      note=`${error instanceof Error?error.message:String(error)} Local records were not changed. Re-enter Vercel in Connections. Encrypted credentials were not moved.`;
    }
    return CloudReconnectStatusSchema.parse({
      checkedAt:Date.now(),
      credentialsAvailable,
      environments:environments.map(item=>CloudEnvironmentSchema.parse({
        ...item,
        reconnectState:credentialsAvailable?(item.desktopClosedAt?'desktop_closed':'live'):'credentials_unavailable',
      })),
      note,
    });
  }
  private relativePath(value:string){const normalized=posix.normalize(`/${value.replaceAll('\\','/')}`).slice(1);if(normalized==='.'||normalized==='')return'';if(normalized.startsWith('../')||normalized.includes('/../'))throw new AuxError('invalid_params','Remote path must stay inside the workspace.');return normalized;}
  private remotePath(value:string){const relative=this.relativePath(value);return relative?`${ROOT}/${relative}`:ROOT;}
  private async assertRemotePath(sandbox:Sandbox,relativePath:string,kind:'file'|'directory'){
    const parts=this.relativePath(relativePath).split('/').filter(Boolean);let path=ROOT,stat:Awaited<ReturnType<Sandbox['fs']['lstat']>>|undefined;
    for(let index=0;index<parts.length;index++){path=posix.join(path,parts[index]!);stat=await sandbox.fs.lstat(path);if(stat.isSymbolicLink())throw new AuxError('conflict','Remote paths cannot pass through symbolic links.');if(index<parts.length-1&&!stat.isDirectory())throw new AuxError('conflict','A remote path parent is not a directory.');}
    if(!stat||(kind==='file'?!stat.isFile():!stat.isDirectory()))throw new AuxError('conflict',kind==='file'?'Only regular remote files can be opened.':'Only regular remote directories can be opened.');return stat;
  }
  private previewUrl(record:CloudEnvironment,sandbox:Sandbox){return record.previewProtected?sandbox.domain(PREVIEW_PROXY_PORT):record.previewUrl;}
  private budgetReason(sandbox:Sandbox){if((sandbox.totalActiveCpuDurationMs??0)>=CLOUD_POLICY.maxLifetimeCpuMs)return`This environment reached Aux's ${CLOUD_POLICY.maxLifetimeCpuMs/60_000}-minute lifetime CPU limit. Export or delete it instead of resuming.`;if((sandbox.totalEgressBytes??0)>=CLOUD_POLICY.maxLifetimeEgressBytes)return`This environment reached Aux's 1 GB lifetime egress limit. Export or delete it instead of resuming.`;return undefined;}
  private enforceBudget(sandbox:Sandbox){const reason=this.budgetReason(sandbox);if(reason)throw new AuxError('conflict',reason);}
  private async runningSandbox(record:CloudEnvironment){this.requireLive(record);if(record.status!=='running')throw new AuxError('conflict','Resume this cloud environment explicitly before starting compute or transferring files.');const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});if(sandbox.status!=='running')throw new AuxError('conflict',`The provider reports this environment as ${sandbox.status}. Refresh its state, then resume it explicitly before continuing.`);this.enforceBudget(sandbox);return sandbox;}
  async reconcileDue(now=Date.now()){
    if(this.cleanupRunning)return;this.cleanupRunning=true;
    try{for(const record of this.records()){
      if(record.status==='deleted'||!record.cleanupAt||record.cleanupAt>now)continue;
      if(record.cleanupLastAttemptAt&&now-record.cleanupLastAttemptAt<15*60_000)continue;
      const deleting=CloudEnvironmentSchema.parse({...record,cleanupState:'deleting',cleanupLastAttemptAt:now,cleanupError:undefined,updatedAt:now});await this.save(deleting);
      try{const sandbox=await this.provider.get({...this.settings.vercelSandboxCredentials(),name:record.remoteName,resume:false});
        if(record.authority==='cloud'){
          let preservationError:string|undefined;
          let retentionResultState:CloudEnvironment['retentionResultState']='none';
          try{retentionResultState=await this.retentionPreserver?.(deleting)??'none';}catch(error){retentionResultState='failed';preservationError=(error instanceof Error?error.message:String(error)).slice(0,1000);}
          const stopped=sandbox.status==='stopped'?undefined:await sandbox.stop();const snapshot=stopped?.snapshot as {id?:string;snapshotId?:string}|undefined;
          await this.save(CloudEnvironmentSchema.parse({...deleting,status:'stopped',authority:'local',updatedAt:Date.now(),expiresAt:undefined,cleanupAt:now+CLEANUP_CHECKPOINT_GRACE_MS,cleanupState:'scheduled',cleanupError:preservationError,retentionResultState,retentionResultCheckedAt:Date.now(),snapshotId:snapshot?.id??snapshot?.snapshotId??record.snapshotId,activeCpuMs:stopped?.activeCpuDurationMs??record.activeCpuMs,ingressBytes:stopped?.networkTransfer?.ingress??record.ingressBytes,egressBytes:stopped?.networkTransfer?.egress??record.egressBytes,lastError:preservationError?'Aux checkpointed this cloud-owned task, but could not preserve its worker result yet: '+preservationError:'Aux checkpointed this cloud-owned task at its retention limit, preserved any available worker result and kept the checkpoint for 24 hours.'}));
          continue;
        }
        if(record.retentionResultState!=='preserved'&&record.retentionResultState!=='none')await this.retentionPreserver?.(deleting);
        await sandbox.delete({deleteOrphanSnapshots:true});await this.save(CloudEnvironmentSchema.parse({...deleting,status:'deleted',authority:'local',updatedAt:Date.now(),expiresAt:undefined,cleanupState:undefined,cleanupError:undefined,lastError:'Deleted automatically at the scheduled retention limit.'}));}
      catch(error){await this.save(CloudEnvironmentSchema.parse({...deleting,cleanupState:'failed',cleanupError:(error instanceof Error?error.message:String(error)).slice(0,1000),updatedAt:Date.now()}));}
    }}finally{this.cleanupRunning=false;}
  }
  private async pruneExports(directory:string){const cutoff=Date.now()-24*60*60*1000;for(const name of await readdir(directory)){const path=`${directory}/${name}`;try{const item=await stat(path);if(item.isFile()&&item.mtimeMs<cutoff)await rm(path,{force:true});}catch{/* another save may have consumed it */}}}
  private taskBrief(task:CloudTaskBrief,sourceTree:string,syncedAt:number,leaseId?:string,authorityGrantedAt?:number){return JSON.stringify({format:'aux-cloud-task-v1',taskId:task.taskId,taskRevision:task.revision,title:task.title,objective:task.objective,criteria:task.criteria.map(item=>({criterionId:item.criterionId,description:item.description,verification:item.verification})),sourceTree,...(leaseId?{authority:{owner:'cloud',leaseId,grantedAt:authorityGrantedAt??Date.now()}}:{}),resultContract:{path:'.aux/result.json',writer:'Send a JSON object on stdin to: node .aux/write-result.mjs',format:'aux-cloud-result-v1',note:'The writer fills task, revision, tree, lease and timestamp from this brief, validates bounded claims and artifact paths, and writes atomically. Aux treats all output as evidence for human review and never auto-accepts criteria. Use status needs_input plus localRequest when work needs the local browser, a credential, approval, a local file or a user answer. Never place a secret in localRequest.',required:['status','summary'],statuses:['completed','needs_input','failed'],localRequestKinds:['browser','credential','approval','file','question'],criterionStatuses:['met','not_met','needs_review']},syncedAt},null,2)+'\n';}
  private async commandOutput(command:Command){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),1200);let stdout='',stderr='';try{for await(const line of command.logs({signal:controller.signal})){if(line.stream==='stdout')stdout=(stdout+line.data).slice(-MAX_OUTPUT);else stderr=(stderr+line.data).slice(-MAX_OUTPUT);}}catch(error){if(!controller.signal.aborted)throw error;}finally{clearTimeout(timer);}return{stdout,stderr};}
  private requireLive(record:CloudEnvironment){if(record.status==='deleted'||record.status==='error')throw new AuxError('conflict','This cloud environment is unavailable.');}
  private requireSourceReady(record:CloudEnvironment){if(record.syncState==='uploading'||record.syncState==='failed')throw new AuxError('conflict','The previous source upload did not finish. Upload the current checkout again before starting work.');}
  private records(){const value=this.repo.getSetting<unknown>(KEY);if(!Array.isArray(value))return[];return value.flatMap(item=>{const parsed=CloudEnvironmentSchema.safeParse(item);return parsed.success?[parsed.data]:[];});}
  private commandRecords(){const value=this.repo.getSetting<unknown>(COMMANDS_KEY);if(!Array.isArray(value))return[];return value.flatMap(item=>{const parsed=CloudCommandRecordSchema.safeParse(item);return parsed.success?[parsed.data]:[];});}
  private save(record:CloudEnvironment){const write=this.writes.then(()=>{const records=this.records().filter(item=>item.environmentId!==record.environmentId);records.push(record);this.repo.setSetting(KEY,records.slice(-200));});this.writes=write.catch(()=>{});return write;}
  private saveCommand(record:CloudCommandRecord){const parsed=CloudCommandRecordSchema.parse(record);const write=this.writes.then(()=>{const records=this.commandRecords().filter(item=>item.commandId!==parsed.commandId);records.push(parsed);this.repo.setSetting(COMMANDS_KEY,records.slice(-500));});this.writes=write.catch(()=>{});return write;}
}

export function markCloudDesktopClosed(repo:Repo,now=Date.now()){
  const value=repo.getSetting<unknown>(KEY);
  if(!Array.isArray(value))return;
  const next=value.flatMap(item=>{
    const parsed=CloudEnvironmentSchema.safeParse(item);
    if(!parsed.success)return [];
    if(parsed.data.status==='deleted')return [parsed.data];
    return [CloudEnvironmentSchema.parse({...parsed.data,desktopClosedAt:now,reconnectState:'desktop_closed' as const})];
  });
  repo.setSetting(KEY,next.slice(-200));
}
