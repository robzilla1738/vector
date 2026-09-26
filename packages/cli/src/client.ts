import {join} from 'node:path';
import type {AuxEvent} from '@aux/contracts';
import {resolveDataDirectory,resolveRuntimeDescriptor} from '@aux/contracts/installation';
import {AuxClient,readRuntimeDescriptor,type AuxConnection} from '@aux/sdk';

export type RuntimeDescriptor=AuxConnection&{pid:number};

export function descriptorPath():string{return join(resolveDataDirectory(),'runtime.json');}
export function readDescriptor():RuntimeDescriptor{return readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;}

export async function rpc<T=unknown>(method:string,params:unknown={}):Promise<T>{
  const client=new AuxClient(readDescriptor());
  return client.call(method as never,params as never) as Promise<T>;
}

/** Durable event stream (D9): pins the streamId, skips resync pages after anchoring at the head. */
export async function* events(lastSeq=0):AsyncGenerator<AuxEvent>{
  let seq=lastSeq;let streamId:string|undefined;
  for(;;){try{const result=await rpc<{streamId:string;events:AuxEvent[];lastSeq:number;resync?:boolean}>('events.since',{sinceSeq:seq,limit:500,...(streamId?{streamId}:{})});if(result.resync){seq=result.lastSeq;streamId=result.streamId;}else{streamId??=result.streamId;for(const event of result.events)yield event;seq=result.lastSeq;}}catch{await new Promise(resolve=>setTimeout(resolve,1000));}await new Promise(resolve=>setTimeout(resolve,400));}
}
