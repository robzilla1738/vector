import {resolveRuntimeDescriptor} from '@aux/contracts/installation';
import {AuxError,type AuxErrorCode} from '@aux/contracts';
import {AuxClient,AuxRpcError,readRuntimeDescriptor,type AuxConnection} from '@aux/sdk';

export type RuntimeDescriptor=AuxConnection&{pid:number};
export function readDescriptor():RuntimeDescriptor{return readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;}

let cached:RuntimeDescriptor|null=null;
function descriptor():RuntimeDescriptor{if(!cached)cached=readDescriptor();return cached;}
export function resetDescriptorCache(){cached=null;}

const AUX_CODES=new Set<string>(['not_found','invalid_params','target_detached','ref_stale','target_ambiguous','backend_unavailable','capability_unsupported','step_failed','condition_timeout','cancelled','model_error','model_output_invalid','needs_input','conflict','permission_denied','assertion_failed','operation_not_found','internal'] satisfies AuxErrorCode[]);

export async function rpc<T=unknown>(method:string,params:unknown={}):Promise<T>{
  const scopedToken=process.env.AUX_MCP_TOKEN;
  if(!scopedToken)throw new Error('Aux MCP requires a generated scoped AUX_MCP_TOKEN. Create the connection in Aux Settings.');
  const connection=descriptor();const client=new AuxClient({...connection,token:scopedToken});
  try{return await client.call(method as never,params as never) as T;}
  catch(error){
    if(error instanceof AuxRpcError&&error.code==='transport_error')cached=null;
    if(error instanceof AuxRpcError)throw AUX_CODES.has(error.code)?new AuxError(error.code as AuxErrorCode,error.message,error.detail):new AuxError('backend_unavailable',`${error.code}: ${error.message}`);
    throw error;
  }
}
