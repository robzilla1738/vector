import {afterEach,expect,it} from "vitest";
import {openDb,Repo,OutboundMcpService,EventBus,TaskService,type McpTransportProvider} from "@aux/runtime";
import {GithubMcpSource,GITHUB_MCP_URL} from "../../apps/runtime/dist/services/github-mcp-source.js";
import type {LiveFolder} from "@aux/contracts";
type Transport=Awaited<ReturnType<McpTransportProvider>>;
const cleanup:(()=>void)[]=[];
afterEach(()=>{for(const close of cleanup.splice(0))close();});
async function fixture() {
 const db=openDb(":memory:");cleanup.push(()=>db.close());const repo=new Repo(db),tasks=new TaskService(repo,new EventBus(repo));
 const workspace=tasks.createWorkspace("Original GitHub Space");
 const calls:{name:string;args:Record<string,unknown>}[]=[];
 let held:((name:string)=>Promise<void>)|undefined;
 const provider:McpTransportProvider=async server=>{
  expect(server.source).toEqual({kind:"remote",auth:"oauth",url:GITHUB_MCP_URL});
  const transport={onmessage:undefined as ((value:unknown)=>void)|undefined,start:async()=>{},close:async()=>{},
   send:async(message:{id?:number;method?:string;params?:{protocolVersion?:string;name?:string;arguments?:Record<string,unknown>}})=>{
    if(message.id===undefined)return;
    let result:unknown;
    if(message.method==="initialize")result={protocolVersion:message.params?.protocolVersion??"2025-11-25",capabilities:{tools:{}},serverInfo:{name:"official-shape-fixture",version:"1"}};
    else if(message.method==="tools/list")result={tools:["get_me","search_issues","search_pull_requests"].map(name=>({name,inputSchema:{type:"object",properties:{}}}))};
    else {
     const name=message.params?.name??"",args=message.params?.arguments??{};calls.push({name,args});await held?.(name);
     const value=name==="get_me"?{login:"fixture-person",profile_url:"https://github.com/fixture-person"}:{total_count:1,incomplete_results:false,items:[{number:3,title:"Review actual source",html_url:`https://github.com/aux/browser/${name==="search_issues"?"issues":"pull"}/3`,updated_at:"2026-10-01T12:00:00Z"}]};
     result={content:[{type:"text",text:JSON.stringify(value)}]};
    }
    queueMicrotask(()=>transport.onmessage?.({jsonrpc:"2.0",id:message.id,result}));
   }};
  return transport as unknown as Transport;
 };
 const mcp=new OutboundMcpService(repo,provider),server=await mcp.register({workspaceId:workspace.workspaceId,name:"GitHub",source:{kind:"remote",auth:"oauth",url:GITHUB_MCP_URL}});
 const github=new GithubMcpSource(()=>mcp);
 const source=(kind:Extract<LiveFolder,{kind:"github"}>["config"]["source"]):Extract<LiveFolder,{kind:"github"}>=>({kind:"github",refreshMinutes:15,config:{connectionId:server.serverId,source:kind,...(kind==="query"?{query:"repo:aux/browser is:open"}:{})}});
 return {repo,mcp,server,workspace,github,calls,source,hold:(next:(name:string)=>Promise<void>)=>{held=next;}};
}
it("refreshes all four sources through advertised OAuth tools and original Space identity",async()=>{
 const f=await fixture();
 for(const source of ["awaiting-review","open-prs","assigned-issues","query"] as const) {
  const items=await f.github.items(f.source(source),f.workspace.workspaceId,async()=>{});
  expect(items.length).toBe(source==="query"?2:1);expect(items[0]?.url).toMatch(/^https:\/\/github.com\/aux\/browser\//);
 }
 expect(f.calls.filter(call=>call.name==="get_me")).toHaveLength(4);
 expect(f.calls.filter(call=>call.name.startsWith("search_")).map(call=>call.args.query)).toEqual(["is:open review-requested:fixture-person","is:open author:fixture-person","is:open assignee:fixture-person","repo:aux/browser is:open","repo:aux/browser is:open"]);
 expect(f.calls.filter(call=>call.name.startsWith("search_")).every(call=>call.args.perPage===25)).toBe(true);
 await expect(f.github.items(f.source("open-prs"),"other-workspace",async()=>{})).rejects.toThrow(/official GitHub OAuth/);
});
it("refuses publishing an in-flight search after the shared OAuth connection is revoked",async()=>{
 const f=await fixture();let started!:()=>void,release!:()=>void;
 const entered=new Promise<void>(resolve=>{started=resolve;}),held=new Promise<void>(resolve=>{release=resolve;});
 f.hold(async name=>{if(name==="search_pull_requests"){started();await held;}});
 const pending=f.github.items(f.source("open-prs"),f.workspace.workspaceId,async()=>{});void pending.catch(()=>{});
 await entered;f.mcp.revoke(f.server.serverId);release();
 await expect(pending).rejects.toThrow(/connection changed|MCP could not|revoked|cancel/i);
 expect(f.repo.db.prepare("SELECT status FROM outbound_mcp_calls WHERE tool_name='search_pull_requests'").get()?.status).toBe("uncertain");
});
it("honors shared tool toggles and retires the original folder before any dispatch",async()=>{
 const f=await fixture();await f.mcp.listTools(f.server.serverId);
 f.mcp.setEnabled({serverId:f.server.serverId,toolName:"search_pull_requests",enabled:false,expectedRevision:f.mcp.get(f.server.serverId).toolsRevision});
 await expect(f.github.items(f.source("open-prs"),f.workspace.workspaceId,async()=>{})).rejects.toThrow(/Enable GitHub/);
 expect(f.calls.map(call=>call.name)).toEqual(["get_me"]);
 f.calls.length=0;
 await expect(f.github.items(f.source("open-prs"),f.workspace.workspaceId,async()=>{throw new Error("Original Space moved");})).rejects.toThrow("Original Space moved");
 expect(f.calls).toEqual([]);
});
