import {spawn,type ChildProcess} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {mkdirSync,readdirSync,readFileSync,writeFileSync,renameSync} from 'node:fs';
import {join} from 'node:path';
import {ProjectCommandSchema,type ProjectCommand,type LocalProject,type ProjectCommandTask} from '@aux/contracts';
const MAX_OUTPUT=128*1024;
const MAX_SERVICES=4;
type Active={child:ChildProcess;record:ProjectCommand;timeout?:NodeJS.Timeout;flush?:NodeJS.Timeout;kill?:NodeJS.Timeout;reason?:'canceled'|'timed_out'|'failed'};
type StackMetadata={stackId:string;stackLabel:string;stackOrder:number};
/** Explicit human-approved local commands. This is not a filesystem/network sandbox. */
export class ProjectCommands {
  private records=new Map<string,ProjectCommand>();
  private active=new Map<string,Active>();
  constructor(private root:string,private duration=10*60*1000,private completionTree?:((projectId:string)=>Promise<string>)){
    mkdirSync(root,{recursive:true,mode:0o700});
    for(const file of readdirSync(root)){
      if(!/^[a-f0-9-]{36}\.json$/.test(file))continue;
      try{
        const record=ProjectCommandSchema.parse(JSON.parse(readFileSync(join(root,file),'utf8')));
        if(file!==record.commandId+'.json')continue;
        if(record.state==='running'||record.state==='stopping'){
          record.state='interrupted';record.finishedAt=Date.now();
          record.output+='\nAux restarted before recording completion. The previous process state is unknown; nothing was restarted.\n';this.save(record);
        }
        this.records.set(record.commandId,record);
      }catch{/* Invalid records never authorize process control. Keep files for recovery. */}
    }
  }
  private save(record:ProjectCommand){
    const path=join(this.root,record.commandId+'.json');
    writeFileSync(path+'.tmp',JSON.stringify(record),{mode:0o600});renameSync(path+'.tmp',path);
  }
  list(projectId:string){return [...this.records.values()].filter(r=>r.projectId===projectId).sort((a,b)=>b.startedAt-a.startedAt).map(r=>({...r}));}
  start(project:LocalProject,command:string,task?:ProjectCommandTask,mode:ProjectCommand['mode']='command',stack?:StackMetadata):ProjectCommand{
    if(typeof command!=='string'||!command.trim()||command.length>8000||command.includes('\0'))throw new Error('Enter a command of at most 8,000 characters.');
    const activeForProject=[...this.active.values()].filter(item=>item.record.projectId===project.projectId);
    if(activeForProject.some(item=>item.record.command===command&&item.record.mode===mode))throw new Error(mode==='service'?'This service is already running in this checkout.':'This command is already running in this checkout.');
    if(mode==='service'&&activeForProject.filter(item=>item.record.mode==='service').length>=MAX_SERVICES)throw new Error(`Stop a service before starting another. Aux supports up to ${MAX_SERVICES} services per checkout.`);
    if(mode==='command'&&activeForProject.some(item=>item.record.mode==='command'))throw new Error('Wait for the current command to finish or stop it before starting another check.');
    const commandId=randomUUID();
    const record:ProjectCommand={commandId,projectId:project.projectId,command,task,mode,cwd:project.path,startedAt:Date.now(),state:'running',output:'',truncated:false,...stack};
    // Persist intent before executing. Isolated HOME prevents automatic shell/profile
    // loading of personal configuration; commands still have ordinary OS access.
    const home=join(this.root,'homes',project.projectId);mkdirSync(home,{recursive:true,mode:0o700});
    this.save(record);this.records.set(commandId,record);
    const child=spawn('/bin/sh',['-c',command],{cwd:project.path,detached:true,stdio:['ignore','pipe','pipe'],env:{
      PATH:process.env.PATH||'/usr/bin:/bin',HOME:home,TMPDIR:home,LANG:'en_US.UTF-8',TERM:'dumb',NO_COLOR:'1',CI:'1',GIT_TERMINAL_PROMPT:'0',
    }});
    const active:Active={child,record,timeout:mode==='service'?undefined:setTimeout(()=>this.terminate(commandId,'timed_out'),this.duration)};
    this.active.set(commandId,active);
    const append=(text:string)=>{
      record.output+=text;
      if(record.output.length>MAX_OUTPUT){record.output=record.output.slice(-MAX_OUTPUT);record.truncated=true;}
      if(!active.flush)active.flush=setTimeout(()=>{active.flush=undefined;this.persist(active);},150);
    };
    child.stdout?.setEncoding('utf8').on('data',append);child.stderr?.setEncoding('utf8').on('data',append);
    child.on('error',error=>append(`\nCould not run command: ${error.message}\n`));
    child.once('exit',()=>this.signal(active,'SIGKILL'));
    child.on('close',code=>{void this.finalize(active,code);});
    return {...record};
  }
  private async finalize(active:Active,code:number|null){
      const {record}=active;const commandId=record.commandId;
      const interrupted=()=>record.state==='interrupted';
      clearTimeout(active.timeout);clearTimeout(active.flush);clearTimeout(active.kill);
      this.signal(active,'SIGKILL'); // Clean up descendants that outlive their shell.
      const finalState=active.reason||(code===0?'succeeded':'failed');
      if(!interrupted()&&finalState==='succeeded'&&record.mode==='command'&&this.completionTree){
        try{
          const tree=await this.completionTree(record.projectId);
          if(!interrupted()){record.verifiedTree=tree;record.verificationRecordedAt=Date.now();delete record.verificationError;}
        }catch{
          if(!interrupted())record.verificationError='Aux could not fingerprint the checkout after this check finished.';
        }
      }
      if(!interrupted())record.state=finalState;
      record.exitCode=code;record.finishedAt=Date.now();this.active.delete(commandId);this.persist(active);
      if(record.stackId&&active.reason!=='canceled'&&record.state!=='succeeded')this.stopStackSiblings(record.projectId,record.stackId,commandId);
  }
  startStack(project:LocalProject,commands:string[],task:ProjectCommandTask,label='Local services'){
    if(commands.length<2||commands.length>MAX_SERVICES)throw new Error(`Choose between 2 and ${MAX_SERVICES} service commands.`);
    if(new Set(commands).size!==commands.length)throw new Error('Each service command must be unique.');
    const activeServices=[...this.active.values()].filter(item=>item.record.projectId===project.projectId&&item.record.mode==='service');
    if(activeServices.length+commands.length>MAX_SERVICES)throw new Error(`Stop a service before starting this stack. Aux supports up to ${MAX_SERVICES} services per checkout.`);
    for(const command of commands)if(activeServices.some(item=>item.record.command===command))throw new Error(`A selected service is already running: ${command}`);
    const stackId=randomUUID();const started:ProjectCommand[]=[];
    try{
      for(const [stackOrder,command] of commands.entries())started.push(this.start(project,command,task,'service',{stackId,stackLabel:label,stackOrder}));
      return started;
    }catch(error){for(const record of started)this.terminate(record.commandId,'canceled');throw error;}
  }
  private persist(active:Active){
    try{this.save(active.record);}catch{
      active.reason='failed';active.record.state='failed';
      active.record.output+='\nAux could not save command output. Execution was stopped; this result may not survive restart.\n';
      this.signal(active,'SIGKILL');
    }
  }
  private signal(active:Active,signal:NodeJS.Signals){if(active.child.pid)try{process.kill(-active.child.pid,signal);}catch{/* Process group already exited. */}}
  private terminate(id:string,reason:'canceled'|'timed_out'){
    const active=this.active.get(id);if(!active)return;
    active.reason=reason;active.record.state='stopping';this.persist(active);this.signal(active,'SIGTERM');
    if(!active.kill)active.kill=setTimeout(()=>this.signal(active,'SIGKILL'),750);
  }
  stop(projectId:string,id:string){
    const record=this.records.get(id);if(!record||record.projectId!==projectId)throw new Error('Command does not belong to this project.');
    this.terminate(id,'canceled');return {...record};
  }
  private stopStackSiblings(projectId:string,stackId:string,except?:string){
    for(const [id,item] of this.active)if(id!==except&&item.record.projectId===projectId&&item.record.stackId===stackId)this.terminate(id,'canceled');
  }
  stopStack(projectId:string,stackId:string){
    const records=this.list(projectId).filter(record=>record.stackId===stackId);
    if(!records.length)throw new Error('Service stack does not belong to this project.');
    this.stopStackSiblings(projectId,stackId);
    return this.list(projectId).filter(record=>record.stackId===stackId);
  }
  shutdown(){
    for(const active of this.active.values()){
      clearTimeout(active.timeout);clearTimeout(active.flush);clearTimeout(active.kill);this.signal(active,'SIGKILL');
      active.record.state='interrupted';active.record.finishedAt=Date.now();this.persist(active);
    }
  }
}
