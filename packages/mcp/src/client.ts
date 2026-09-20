import {resolveRuntimeDescriptor} from '@vector/contracts/installation';
import {AuxClient,AuxRpcError,readRuntimeDescriptor,type AuxConnection} from '@aux-browser/sdk';

export type RuntimeDescriptor=AuxConnection&{pid:number};
export function readDescriptor():RuntimeDescriptor{return readRuntimeDescriptor(resolveRuntimeDescriptor()) as RuntimeDescriptor;}

let cached:RuntimeDescriptor|null=null;
function descriptor():RuntimeDescriptor{if(!cached)cached=readDescriptor();return cached;}
export function resetDescriptorCache(){cached=null;}

export async function rpc<T=unknown>(method:string,params:unknown={}):Promise<T>{
  const scopedToken=process.env.AUX_MCP_TOKEN;
  if(process.env.AUX_MCP_TOOL_PREFIX==='aux'&&!scopedToken)throw new Error('This Aux MCP configuration predates scoped connections. Recreate it in Aux Settings.');
  const connection=descriptor();const client=new AuxClient({...connection,token:scopedToken||connection.token});
  try{return await client.call(method as never,params as never) as T;}
  catch(error){if(error instanceof AuxRpcError&&error.code==='transport_error')cached=null;if(error instanceof AuxRpcError)throw new Error(`${error.code}: ${error.message}`);throw error;}
}
