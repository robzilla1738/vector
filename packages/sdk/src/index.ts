import {existsSync,readFileSync} from 'node:fs';
import {MethodSchemas,ResultSchemas,type MethodName,type MethodParams,type MethodResult,type VectorEvent} from '@vector/contracts';
import {resolveRuntimeDescriptor} from '@vector/contracts/installation';

export interface AuxConnection{port:number;token:string;pid?:number}
export interface AuxClientOptions{timeoutMs?:number;fetch?:typeof fetch}

export class AuxRpcError extends Error{
  constructor(message:string,public readonly code:string,public readonly status?:number,public readonly detail?:unknown){super(message);this.name='AuxRpcError';}
}

export function readRuntimeDescriptor(path=resolveRuntimeDescriptor()):AuxConnection{
  if(!existsSync(path))throw new Error(`No running Aux runtime found at ${path}. Start Aux first.`);
  let value:unknown;try{value=JSON.parse(readFileSync(path,'utf8'));}catch{throw new Error(`The Aux runtime descriptor at ${path} is unreadable.`);}
  if(!value||typeof value!=='object')throw new Error(`The Aux runtime descriptor at ${path} is invalid.`);
  const record=value as Record<string,unknown>;
  if(!Number.isInteger(record.port)||Number(record.port)<1||Number(record.port)>65535||typeof record.token!=='string'||!record.token)throw new Error(`The Aux runtime descriptor at ${path} is invalid.`);
  return{port:Number(record.port),token:record.token,...(Number.isInteger(record.pid)?{pid:Number(record.pid)}:{})};
}

export class AuxClient{
  private readonly timeoutMs:number;
  private readonly fetchImpl:typeof fetch;
  constructor(private readonly connection:AuxConnection,options:AuxClientOptions={}){this.timeoutMs=options.timeoutMs??120_000;this.fetchImpl=options.fetch??fetch;}
  static running(options:AuxClientOptions&{descriptorPath?:string;token?:string}={}){const connection=readRuntimeDescriptor(options.descriptorPath);return new AuxClient({...connection,...(options.token?{token:options.token}:{})},options);}
  async call<M extends MethodName>(method:M,params:MethodParams<M>):Promise<MethodResult<M>>{
    const request=MethodSchemas[method].parse(params);
    let response:Response;try{response=await this.fetchImpl(`http://127.0.0.1:${this.connection.port}/rpc`,{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${this.connection.token}`},body:JSON.stringify({method,params:request}),signal:AbortSignal.timeout(this.timeoutMs)});}catch(error){throw new AuxRpcError(error instanceof Error?error.message:String(error),'transport_error');}
    let body:{result?:unknown;error?:{code?:string;message?:string;detail?:unknown}};try{body=await response.json() as typeof body;}catch{throw new AuxRpcError(`Aux returned a non-JSON response (HTTP ${response.status}).`,'invalid_response',response.status);}
    if(body.error)throw new AuxRpcError(body.error.message??`Aux request failed with HTTP ${response.status}.`,body.error.code??'request_failed',response.status,body.error.detail);
    if(!response.ok)throw new AuxRpcError(`Aux request failed with HTTP ${response.status}.`,'http_error',response.status);
    return ResultSchemas[method].parse(body.result) as MethodResult<M>;
  }
  async *events(lastSeq=0,options:{signal?:AbortSignal;pollMs?:number}={}):AsyncGenerator<VectorEvent>{
    let sequence=lastSeq;const pollMs=options.pollMs??400;
    while(!options.signal?.aborted){const result=await this.call('events.since',{sinceSeq:sequence,limit:500});for(const event of result.events)yield event;sequence=result.lastSeq;if(pollMs)await new Promise<void>(resolve=>{const done=()=>{clearTimeout(timer);options.signal?.removeEventListener('abort',done);resolve();};const timer=setTimeout(done,pollMs);options.signal?.addEventListener('abort',done,{once:true});});}
  }
}
