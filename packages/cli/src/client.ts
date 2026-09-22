import {join} from 'node:path';
import {resolveDataDirectory,resolveRuntimeDescriptor} from '@aux/contracts/installation';
import {AuxClient,readRuntimeDescriptor,type AuxConnection} from '@aux/sdk';

export type RuntimeDescriptor=AuxConnection&{pid:number};

export function descriptorPath():string{return join(resolveDataDirectory(),'runtime.json');}
export function readDescriptor():RuntimeDescriptor{return readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;}

export async function rpc<T=unknown>(method:string,params:unknown={}):Promise<T>{
  const client=new AuxClient(readDescriptor());
  return client.call(method as never,params as never) as Promise<T>;
}

export async function* events(lastSeq=0):AsyncGenerator<{seq:number;type:string;payload:unknown;ts:number;runId?:string}>{
  let seq=lastSeq;
  for(;;){try{const result=await rpc<{events:{seq:number;type:string;payload:unknown;ts:number;runId?:string}[];lastSeq:number}>('events.since',{sinceSeq:seq,limit:500});for(const event of result.events)yield event;seq=result.lastSeq;}catch{await new Promise(resolve=>setTimeout(resolve,1000));}await new Promise(resolve=>setTimeout(resolve,400));}
}
