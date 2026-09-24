// A scoped MCP browser write must bind to the saved task and survive in the native journal.
import { createRequire } from 'node:module';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import assert from 'node:assert/strict';
import { closeAux, launchApp, shellWindow } from './launch.mjs';

const root=resolve(import.meta.dirname,'../..');
const mcpRequire=createRequire(join(root,'packages/mcp/package.json'));
const {Client}=mcpRequire('@modelcontextprotocol/sdk/client/index.js');
const {StdioClientTransport}=mcpRequire('@modelcontextprotocol/sdk/client/stdio.js');
const temporary=mkdtempSync(join(tmpdir(),'aux-browser-journal-'));
let clicks=0;
const site=createServer((request,response)=>{
  if(request.method==='POST'&&request.url==='/clicked'){
    clicks++;
    response.writeHead(200,{'content-type':'application/json'}).end(JSON.stringify({clicks}));
    return;
  }
  response.writeHead(200,{'content-type':'text/html'}).end(`<!doctype html><title>Journal fixture</title>
    <button id="act" onclick="fetch('/clicked',{method:'POST'}).then(()=>document.body.dataset.done='yes')">Act</button>`);
});
await new Promise(resolveListen=>site.listen(0,'127.0.0.1',resolveListen));
const url=`http://127.0.0.1:${site.address().port}/`;
let app,client;
try{
  app=await launchApp({args:['--use-mock-keychain'],env:{
    PATH:process.env.PATH,HOME:temporary,TMPDIR:temporary,
    AUX_PROFILE_DIR:join(temporary,'profile'),AUX_DATA_DIR:join(temporary,'data'),AUX_LOAD_DOTENV:'0',
  }});
  const shell=await shellWindow(app);
  await shell.locator('.app').waitFor();
  const setup=await shell.evaluate(async fixtureUrl=>{
    await window.aux.invoke('settings.set',{effectGrants:['effect:read','effect:write']});
    const page=await window.aux.invoke('pages.open',{url:fixtureUrl,activate:true});
    const workspace=await window.aux.invoke('workspaces.create',{name:'Browser journal fixture'});
    const task=await window.aux.invoke('tasks.create',{
      workspaceId:workspace.workspaceId,title:'Click once',objective:'Perform one fixture action',
      criteria:[{criterionId:'clicked',description:'The fixture recorded one action',verification:'manual'}],
      resources:[{resourceId:'fixture-page',kind:'page',locator:page.pageId,label:'Fixture page'}],
    });
    const config=await window.aux.agentConfig({name:'Browser journal smoke',client:'codex',
      scope:{kind:'task',workspaceId:workspace.workspaceId,taskId:task.taskId}});
    return {page,task,config};
  },url);
  await shell.waitForFunction(pageId=>window.aux.invoke('pages.list',{}).then(pages=>pages.some(page=>page.pageId===pageId&&!page.loading)),setup.page.pageId);
  client=new Client({name:'aux-browser-journal-smoke',version:'1.0.0'});
  await client.connect(new StdioClientTransport({command:setup.config.command,args:setup.config.args,
    env:{PATH:process.env.PATH,HOME:temporary,TMPDIR:temporary,...setup.config.env},stderr:'pipe'}));
  const program={pageId:setup.page.pageId,taskId:setup.task.taskId,expectedRevision:setup.task.revision,
    steps:[{id:'act',op:'click',target:'css:#act'}]};
  const first=await client.callTool({name:'aux_page_execute',arguments:program});
  assert.ok(!first.isError,JSON.stringify(first));
  const deadline=Date.now()+5000;
  while(clicks!==1&&Date.now()<deadline)await new Promise(resolveWait=>setTimeout(resolveWait,25));
  assert.equal(clicks,1);
  const repeat=await client.callTool({name:'aux_page_execute',arguments:program});
  assert.equal(repeat.isError,true,'A repeated logical action must not dispatch');
  assert.equal(clicks,1);
  const db=new DatabaseSync(join(temporary,'data','aux-state.sqlite'),{readOnly:true});
  try{
    const intent=db.prepare('SELECT task_id AS taskId,task_revision AS taskRevision,status,run_id AS runId FROM action_intents WHERE page_id=?').get(setup.page.pageId);
    assert.equal(intent?.taskId,setup.task.taskId);
    assert.equal(intent?.taskRevision,setup.task.revision);
    assert.equal(intent?.status,'confirmed');
    assert.equal(intent?.runId,`direct:${setup.page.pageId}`);
  }finally{db.close();}
  console.log('Native task-scoped MCP browser write was journaled once with exact task identity.');
}finally{
  await client?.close().catch(()=>{});
  if(app)await closeAux(app).catch(()=>{});
  site.closeAllConnections();
  await new Promise(resolveClose=>site.close(resolveClose));
  rmSync(temporary,{recursive:true,force:true});
}
