import { createHash } from "node:crypto";
import { z } from "zod";
import { AuxError, type LiveFolder, type LiveFolderItem } from "@aux/contracts";
import type { OutboundMcpService } from "./outbound-mcp.js";
export const GITHUB_MCP_URL="https://api.githubcopilot.com/mcp/";
function decoded(result:{output:string;isError:boolean}):unknown {
 if(result.isError||Buffer.byteLength(result.output)>128000)throw new AuxError("backend_unavailable","GitHub MCP could not refresh this folder.");
 try {
  const envelope=z.object({content:z.array(z.object({type:z.string(),text:z.string().optional()}).passthrough()).max(100),isError:z.boolean().optional()}).passthrough().parse(JSON.parse(result.output));
  if(envelope.isError)throw new Error("MCP error");
  const blocks=envelope.content.filter(block=>block.type==="text");
  if(blocks.length!==1||!blocks[0]?.text)throw new Error("Missing structured GitHub result");
  return JSON.parse(blocks[0].text) as unknown;
 }catch {throw new AuxError("backend_unavailable","GitHub MCP returned an invalid bounded result.");}
}
const itemSchema=z.object({title:z.string().max(10000),html_url:z.string().max(8192),number:z.number().int().positive(),updated_at:z.string().max(100).optional()}).passthrough();
function rows(value:unknown):LiveFolderItem[] {
 const payload=z.object({items:z.array(itemSchema).max(100)}).passthrough().safeParse(value);
 if(!payload.success)throw new AuxError("backend_unavailable","GitHub MCP returned invalid search results.");
 return payload.data.items.slice(0,25).map(item=>{
  const url=new URL(item.html_url);
  if(url.protocol!=="https:"||url.hostname!=="github.com"||url.username||url.password||url.port||url.search||url.hash||!/^\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/(?:issues|pull)\/[1-9][0-9]*$/.test(url.pathname)||Number(url.pathname.split("/").at(-1))!==item.number)
   throw new AuxError("backend_unavailable","GitHub MCP returned an unexpected issue or pull-request URL.");
  return {id:createHash("sha256").update(url.href).digest("hex"),url:url.href,title:item.title.slice(0,500)||"Untitled GitHub item",
   subtitle:`${url.pathname.split("/").slice(1,3).join("/")} #${item.number}`,unread:true,
   updatedAt:item.updated_at&&Number.isFinite(Date.parse(item.updated_at))?Date.parse(item.updated_at):0};
 });
}
/** Shared OAuth transport and toggles own account authority; no duplicated credential or REST path. */
export class GithubMcpSource {
 constructor(private readonly resolveMcp:()=>OutboundMcpService){}
 private get mcp(){return this.resolveMcp();}
 async items(source:Extract<LiveFolder,{kind:"github"}>,workspaceId:string,current:()=>Promise<void>,signal?:AbortSignal):Promise<LiveFolderItem[]> {
  const server=this.mcp.get(source.config.connectionId);
  if(server.workspaceId!==workspaceId||server.state!=="active"||server.source.kind!=="remote"||server.source.auth!=="oauth"||server.source.url!==GITHUB_MCP_URL)
   throw new AuxError("needs_input","Connect the official GitHub OAuth service for this Space in Settings → Plugins.");
  const original=JSON.stringify([server.sourceDigest,server.workspaceId]);
  const check=async()=>{
   signal?.throwIfAborted();await current();
   const latest=this.mcp.get(server.serverId);
   if(latest.state!=="active"||JSON.stringify([latest.sourceDigest,latest.workspaceId])!==original)
    throw new AuxError("ref_stale","The original GitHub connection changed.");
  };
  await check();await this.mcp.listTools(server.serverId);await check();
  const call=async(name:string,args:Record<string,unknown>)=>{
   const currentServer=this.mcp.get(server.serverId);
   if(!currentServer.toolNames.includes(name)||currentServer.disabledTools.includes(name))
    throw new AuxError("needs_input",`Enable GitHub’s ${name} tool in Settings → Plugins to refresh this folder.`);
   await check();
   const result=await this.mcp.callTool(server.serverId,name,args,{workspaceId},signal,async()=>{await check();return ()=>signal?.throwIfAborted();});
   await check();return decoded(result);
  };
  const account=z.object({login:z.string().regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/)}).passthrough().safeParse(await call("get_me",{}));
  if(!account.success)throw new AuxError("backend_unavailable","GitHub MCP did not identify the connected account.");
  const query=source.config.source==="query"?source.config.query!:({"awaiting-review":`is:open review-requested:${account.data.login}`,"open-prs":`is:open author:${account.data.login}`,"assigned-issues":`is:open assignee:${account.data.login}`})[source.config.source];
  const tools=source.config.source==="assigned-issues"?["search_issues"]:source.config.source!=="query"?["search_pull_requests"]:/\b(?:is|type):pr\b/.test(query)?["search_pull_requests"]:/\b(?:is|type):issue\b/.test(query)?["search_issues"]:["search_issues","search_pull_requests"];
  const found:LiveFolderItem[]=[];
  for(const tool of tools)found.push(...rows(await call(tool,{query,perPage:25,sort:"updated",order:"desc"})));
  await check();
  return [...new Map(found.map(item=>[item.url,item])).values()].sort((a,b)=>b.updatedAt-a.updatedAt||a.url.localeCompare(b.url)).slice(0,25);
 }
}
