import {access} from 'node:fs/promises';
import {constants} from 'node:fs';
import {delimiter,join} from 'node:path';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';

const run=promisify(execFile);
export type AgentClientInstallation={client:'codex'|'claude';installed:boolean;version?:string;error?:string};

async function executable(name:string,pathValue:string){for(const directory of pathValue.split(delimiter).filter(Boolean)){const path=join(directory,name);try{await access(path,constants.X_OK);return path;}catch{/* keep searching */}}}

export async function detectAgentClients(pathValue=process.env.PATH??''):Promise<AgentClientInstallation[]>{
  return Promise.all((['codex','claude'] as const).map(async client=>{
    const path=await executable(client,pathValue);if(!path)return{client,installed:false};
    try{const {stdout,stderr}=await run(path,['--version'],{timeout:3000,maxBuffer:16*1024,env:{PATH:pathValue,LANG:process.env.LANG??'en_US.UTF-8'}});const version=(stdout||stderr).trim().replace(/[\r\n]+/g,' ').slice(0,160);return{client,installed:true,...(version?{version}:{})};}
    catch(error){return{client,installed:true,error:(error instanceof Error?error.message:String(error)).slice(0,300)};}
  }));
}
