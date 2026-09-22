import {it,expect} from 'vitest';
import {mkdtemp,mkdir,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {randomUUID} from 'node:crypto';
import {ProjectCommands} from '../../apps/desktop/main/project-commands.js';
import type {LocalProject} from '@aux/contracts';

it('runs explicitly, saves output, limits output, cancels and times out without automatic restart',async()=>{
 const root=await mkdtemp(join(tmpdir(),'aux-commands-'));
 const project:LocalProject={projectId:randomUUID(),name:'Fixture',sourcePath:root,path:join(root,'checkout'),branch:'fixture',baseCommit:'a'.repeat(40),createdAt:Date.now(),state:'ready'};
 await mkdir(project.path);const records=join(root,'records');let fingerprint=0;let service=new ProjectCommands(records,2000,async()=>String(++fingerprint).padStart(40,'a'));
 const wait=async(id:string)=>{for(let n=0;n<150;n++){const r=service.list(project.projectId).find(r=>r.commandId===id)!;if(!['running','stopping'].includes(r.state))return r;await new Promise(r=>setTimeout(r,20));}throw new Error('Command did not settle');};
 try{
  const run=service.start(project,'printf "working=%s\\n" "$PWD"; printf "error stream\\n" >&2');const done=await wait(run.commandId);
  expect(done.state).toBe('succeeded');expect(done.output).toContain('error stream');expect(done.cwd).toBe(project.path);expect(done.verifiedTree).toMatch(/^[a-f0-9]{40}$/);expect(done.verificationRecordedAt).toBeTypeOf('number');
  const background=await wait(service.start(project,'/bin/sleep 30 & printf background').commandId);expect(background.state).toBe('succeeded');
  const failure=await wait(service.start(project,'exit 7').commandId);expect(failure.state).toBe('failed');expect(failure.exitCode).toBe(7);
  const long=service.start(project,'/bin/sleep 30');expect(()=>service.start(project,'true')).toThrow('current command');
  expect(()=>service.stop(randomUUID(),long.commandId)).toThrow('does not belong');service.stop(project.projectId,long.commandId);expect((await wait(long.commandId)).state).toBe('canceled');
  const output=await wait(service.start(project,'/usr/bin/yes x | /usr/bin/head -c 200000').commandId);expect(output.truncated).toBe(true);expect(output.output.length).toBeLessThanOrEqual(128*1024);
  const isolated=await wait(service.start(project,'printf "%s" "$HOME"').commandId);expect(isolated.output).toContain(join(records,'homes',project.projectId));
  service.shutdown();service=new ProjectCommands(records,60);
  expect(service.list(project.projectId).some(r=>r.commandId===done.commandId&&r.output===done.output)).toBe(true);
  expect((await wait(service.start(project,'/bin/sleep 30').commandId)).state).toBe('timed_out');
  const serviceRun=service.start(project,'/bin/sleep 30',undefined,'service');const secondService=service.start(project,'/bin/sleep 29',undefined,'service');await new Promise(resolve=>setTimeout(resolve,100));
  expect(service.list(project.projectId).filter(run=>run.mode==='service'&&run.state==='running')).toHaveLength(2);
  const alongside=await wait(service.start(project,'printf check-alongside-services').commandId);expect(alongside.output).toBe('check-alongside-services');expect(()=>service.start(project,'/bin/sleep 30',undefined,'service')).toThrow('already running');
  const third=service.start(project,'/bin/sleep 28',undefined,'service'),fourth=service.start(project,'/bin/sleep 27',undefined,'service');expect(()=>service.start(project,'/bin/sleep 26',undefined,'service')).toThrow('up to 4 services');
  service.stop(project.projectId,serviceRun.commandId);expect((await wait(serviceRun.commandId)).state).toBe('canceled');expect(service.list(project.projectId).find(run=>run.commandId===secondService.commandId)?.state).toBe('running');
  for(const item of [secondService,third,fourth]){service.stop(project.projectId,item.commandId);expect((await wait(item.commandId)).state).toBe('canceled');}
  const closing=service.start(project,'/bin/sleep 30',undefined,'service');service.shutdown();expect((await wait(closing.commandId)).state).toBe('interrupted');
  const interrupted={...done,commandId:randomUUID(),state:'running'};await writeFile(join(records,interrupted.commandId+'.json'),JSON.stringify(interrupted));
  service=new ProjectCommands(records);expect(service.list(project.projectId).find(r=>r.commandId===interrupted.commandId)?.state).toBe('interrupted');
 }finally{service.shutdown();await new Promise(r=>setTimeout(r,50));await rm(root,{recursive:true,force:true});}
});
