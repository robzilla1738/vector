import {afterEach,expect,it,vi} from 'vitest';
import {openDb,Repo} from '@aux/runtime';

const provider={status:'running',stop:vi.fn(),delete:vi.fn()};
import {CloudEnvironmentService,markCloudDesktopClosed} from '../../apps/runtime/src/services/cloud-environments.js';

const cleanup:(()=>void)[]=[];
afterEach(()=>{provider.status='running';provider.stop.mockReset();provider.delete.mockReset();for(const fn of cleanup.splice(0))fn();});

it('checkpoints cloud-owned work before scheduled deletion',async()=>{
  const db=openDb(':memory:');cleanup.push(()=>db.close());const repo=new Repo(db);const now=1_800_000_000_000;
  const record={environmentId:'11111111-1111-4111-8111-111111111111',provider:'vercel' as const,remoteName:'aux-task-env',taskId:'task',taskRevision:1,projectId:'22222222-2222-4222-8222-222222222222',runtime:'universal' as const,region:'iad1',port:3000,status:'running' as const,authority:'cloud' as const,leaseId:'33333333-3333-4333-8333-333333333333',createdAt:now-1000,updatedAt:now-1000,cleanupAt:now-1,cleanupState:'scheduled' as const};
  repo.setSetting('cloudEnvironments',[record]);provider.stop.mockResolvedValue({snapshot:{id:'snapshot-1'},activeCpuDurationMs:123,networkTransfer:{ingress:4,egress:5}});
  const service=new CloudEnvironmentService(repo,{vercelSandboxCredentials:()=>({token:'synthetic',teamId:'team',projectId:'project'})} as never,{get:vi.fn(async()=>provider)} as never);
  await service.reconcileDue(now);
  const saved=(repo.getSetting<unknown[]>('cloudEnvironments')![0] as Record<string,unknown>);
  expect(saved.cleanupError).toBeUndefined();
  expect(provider.stop).toHaveBeenCalledOnce();expect(provider.delete).not.toHaveBeenCalled();
  expect(saved).toMatchObject({status:'stopped',authority:'local',snapshotId:'snapshot-1',cleanupState:'scheduled',cleanupAt:now+24*60*60*1000,retentionResultState:'none',retentionResultCheckedAt:expect.any(Number)});
});

it('does not delete a retained checkpoint while result preservation is unresolved',async()=>{
  const db=openDb(':memory:');cleanup.push(()=>db.close());const repo=new Repo(db);const now=1_800_000_000_000;
  const record={environmentId:'11111111-1111-4111-8111-111111111111',provider:'vercel' as const,remoteName:'aux-task-env',taskId:'task',taskRevision:1,projectId:'22222222-2222-4222-8222-222222222222',runtime:'universal' as const,region:'iad1',port:3000,status:'stopped' as const,authority:'local' as const,createdAt:now-1000,updatedAt:now-1000,cleanupAt:now-1,cleanupState:'scheduled' as const,retentionResultState:'failed' as const};
  repo.setSetting('cloudEnvironments',[record]);
  const service=new CloudEnvironmentService(repo,{vercelSandboxCredentials:()=>({token:'synthetic',teamId:'team',projectId:'project'})} as never,{get:vi.fn(async()=>provider)} as never);
  service.setRetentionPreserver(async()=>{throw new Error('artifact copy interrupted');});
  await service.reconcileDue(now);
  const saved=(repo.getSetting<unknown[]>('cloudEnvironments')![0] as Record<string,unknown>);
  expect(provider.delete).not.toHaveBeenCalled();
  expect(saved).toMatchObject({status:'stopped',cleanupState:'failed',cleanupError:'artifact copy interrupted',retentionResultState:'failed'});
});

it('hands off exact task authority and starts one durable provider command',async()=>{
  const db=openDb(':memory:');cleanup.push(()=>db.close());const repo=new Repo(db);const now=Date.now();
  const record={environmentId:'11111111-1111-4111-8111-111111111111',provider:'vercel' as const,remoteName:'aux-task-env',taskId:'task',taskRevision:2,projectId:'22222222-2222-4222-8222-222222222222',runtime:'universal' as const,region:'iad1',port:3000,timeoutMinutes:15,status:'running' as const,authority:'local' as const,createdAt:now-1000,updatedAt:now-1000,syncedAt:now-500,syncState:'ready' as const,sourceTree:'a'.repeat(40)};
  repo.setSetting('cloudEnvironments',[record]);
  const writeFile=vi.fn();const runCommand=vi.fn(async()=>({cmdId:'provider-command',startedAt:now,exitCode:null}));
  const sandbox={status:'running',region:'iad1',expiresAt:new Date(now+15*60_000),mkDir:vi.fn(),fs:{writeFile},runCommand};
  const service=new CloudEnvironmentService(repo,{vercelSandboxCredentials:()=>({token:'synthetic',teamId:'team',projectId:'project'})} as never,{get:vi.fn(async()=>sandbox)} as never);
  const result=await service.handoffAndStart(record,{taskId:'task',revision:2,title:'Continue in cloud',objective:'Finish the bounded change.',criteria:[]},'node',['worker.mjs'],15);
  expect(result.environment).toMatchObject({authority:'cloud',leaseId:expect.any(String)});
  expect(result.command).toMatchObject({providerCommandId:'provider-command',status:'running',mode:'service',executable:'node',args:['worker.mjs']});
  expect(runCommand).toHaveBeenCalledWith(expect.objectContaining({cmd:'node',args:['worker.mjs'],detached:true,timeoutMs:15*60_000}));
  const taskWrite=writeFile.mock.calls.find(call=>String(call[0]).endsWith('/task.json'))!;
  const writerWrite=writeFile.mock.calls.find(call=>String(call[0]).endsWith('/write-result.mjs'))!;
  const taskBrief=JSON.parse(taskWrite[1] as string);
  expect(taskBrief).toMatchObject({taskId:'task',taskRevision:2,sourceTree:'a'.repeat(40),authority:{owner:'cloud',leaseId:result.environment.leaseId}});
  expect(taskBrief.resultContract.writer).toContain('node .aux/write-result.mjs');
  expect(writerWrite[1]).toContain("format:'aux-cloud-result-v1'");
});

it('refuses remote files reached through a symbolic-link parent',async()=>{
  const db=openDb(':memory:');cleanup.push(()=>db.close());const repo=new Repo(db);const now=Date.now();
  const record={environmentId:'11111111-1111-4111-8111-111111111111',provider:'vercel' as const,remoteName:'aux-task-env',taskId:'task',taskRevision:1,projectId:'22222222-2222-4222-8222-222222222222',runtime:'universal' as const,region:'iad1',port:3000,status:'running' as const,createdAt:now,updatedAt:now};
  repo.setSetting('cloudEnvironments',[record]);const readFile=vi.fn();const sandbox={fs:{lstat:vi.fn(async()=>({isSymbolicLink:()=>true,isDirectory:()=>false,isFile:()=>false,size:0,mtimeMs:now})),readFile}};
  const service=new CloudEnvironmentService(repo,{vercelSandboxCredentials:()=>({token:'synthetic',teamId:'team',projectId:'project'})} as never,{get:vi.fn(async()=>sandbox)} as never);
  await expect(service.readFile(record,'linked/report.txt')).rejects.toThrow(/symbolic links/i);
  expect(readFile).not.toHaveBeenCalled();
});

it('records desktop-closed reconnect state without calling the provider',()=>{
  const db=openDb(':memory:');cleanup.push(()=>db.close());const repo=new Repo(db);const now=1_800_000_000_000;
  const record={environmentId:'11111111-1111-4111-8111-111111111111',provider:'vercel' as const,remoteName:'aux-task-env',taskId:'task',taskRevision:1,projectId:'22222222-2222-4222-8222-222222222222',runtime:'universal' as const,region:'iad1',port:3000,status:'running' as const,createdAt:now,updatedAt:now};
  repo.setSetting('cloudEnvironments',[record]);
  const get=vi.fn();
  const service=new CloudEnvironmentService(repo,{vercelSandboxCredentials:()=>({token:'synthetic',teamId:'team',projectId:'project'})} as never,{get} as never);
  markCloudDesktopClosed(repo,now+5);
  const status=service.reconnectStatus('task');
  expect(get).not.toHaveBeenCalled();
  expect(status.credentialsAvailable).toBe(true);
  expect(status.note).toMatch(/did not resume/i);
  expect(status.environments[0]).toMatchObject({reconnectState:'desktop_closed',desktopClosedAt:now+5});
});
