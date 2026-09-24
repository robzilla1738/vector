// Current-source native 20/100-tab restore: logical strip, active page, and resident views.
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from 'node:http';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchApp, shellWindow } from './launch.mjs';

const server=createServer((_request,response)=>{response.setHeader('Content-Type','text/html');response.end('<title>Restored fixture</title><h1>Restored fixture</h1>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const runs=Number(process.env.AUX_RUNS??10);
const tabCount=Number(process.env.AUX_TABS??100);
const activeIndex=Math.floor(tabCount/2);
const activeId=`restore-${String(activeIndex).padStart(3,'0')}`;
const measurements={logical:[],active:[],resident:[],rssMiB:[]};
const percentile=(values,fraction)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*fraction)-1)];};
function processTreeRssMiB(rootPid){
  const rows=execFileSync('/bin/ps',['-axo','pid=,ppid=,rss='],{encoding:'utf8'}).trim().split('\n').map(line=>line.trim().split(/\s+/).map(Number));
  const family=new Set([rootPid]);
  let changed=true;while(changed){changed=false;for(const [pid,parent] of rows)if(family.has(parent)&&!family.has(pid)){family.add(pid);changed=true;}}
  return rows.filter(([pid])=>family.has(pid)).reduce((sum,[,,rss])=>sum+rss,0)/1024;
}

function seed(dir){
  const data=join(dir,'data');mkdirSync(join(data,'browser-state'),{recursive:true});
  const db=new DatabaseSync(join(data,'browser-state','browser-state.sqlite'));
  db.exec(`CREATE TABLE meta(key TEXT PRIMARY KEY,value TEXT NOT NULL);
    CREATE TABLE tabs(page_id TEXT PRIMARY KEY,window_id TEXT NOT NULL,url TEXT NOT NULL,title TEXT NOT NULL,favicon TEXT,
      loading INTEGER NOT NULL,muted INTEGER NOT NULL,audible INTEGER NOT NULL,can_back INTEGER NOT NULL,
      can_forward INTEGER NOT NULL,popup INTEGER NOT NULL,crashed INTEGER NOT NULL,runtime_owned INTEGER NOT NULL,
      nav_error_json TEXT,generation INTEGER NOT NULL,created_at INTEGER NOT NULL,last_active_at INTEGER NOT NULL,changed_version INTEGER NOT NULL);
    CREATE TABLE windows(window_id TEXT PRIMARY KEY,ord_json TEXT NOT NULL,active_page_id TEXT REFERENCES tabs(page_id) ON DELETE SET NULL);`);
  const insert=db.prepare(`INSERT INTO tabs VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
  const ids=Array.from({length:tabCount},(_,i)=>`restore-${String(i).padStart(3,'0')}`);
  db.exec('BEGIN');
  for(let i=0;i<ids.length;i++)insert.run(ids[i],'main',`${base}/tab-${i}`,`Restored ${i}`,null,0,0,0,0,0,0,0,0,null,0,i+1,i+1,1);
  db.prepare('INSERT INTO windows VALUES(?,?,?)').run('main',JSON.stringify(ids),activeId);
  db.prepare('INSERT INTO meta VALUES(?,?)').run('catalogVersion','1');
  db.exec('COMMIT');db.close();
  return data;
}

try{
  for(let i=0;i<runs;i++){
    const dir=mkdtempSync(join(tmpdir(),'aux-restore-100-'));
    const data=seed(dir);
    let app;
    try{
      const started=performance.now();
      app=await launchApp({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:data,AUX_LOAD_DOTENV:'0'}});
      const shell=await shellWindow(app);
      const snapshot=await shell.evaluate(()=>window.aux.tabsSnapshot());
      measurements.logical.push(performance.now()-started);
      assert.equal(snapshot.tabs.length,tabCount);
      assert.equal(snapshot.windows.find(window=>window.windowId==='main')?.activePageId,activeId);
      let active;for(let attempt=0;attempt<200;attempt++){active=app.windows().find(page=>page.url()===`${base}/tab-${activeIndex}`);if(active)break;await new Promise(resolve=>setTimeout(resolve,25));}
      assert.ok(active,'the active restored tab must load');
      await active.getByRole('heading',{name:'Restored fixture'}).waitFor();
      measurements.active.push(performance.now()-started);
      await new Promise(resolve=>setTimeout(resolve,1500));
      const resident=await app.evaluate(({webContents})=>webContents.getAllWebContents().filter(contents=>contents.getURL().startsWith('http://127.0.0.1:')).length);
      measurements.resident.push(resident);
      measurements.rssMiB.push(processTreeRssMiB(app.process().pid));
      assert.ok(resident<tabCount,'background restore must not materialize every tab immediately');
    }finally{await app?.close().catch(()=>{});rmSync(dir,{recursive:true,force:true});}
  }
  console.log(`${tabCount}-tab restore · logical p50 ${percentile(measurements.logical,.5).toFixed(0)}ms p95 ${percentile(measurements.logical,.95).toFixed(0)}ms [${measurements.logical.map(value=>value.toFixed(0)).join(', ')}]`);
  console.log(`${tabCount}-tab restore · active fixture p50 ${percentile(measurements.active,.5).toFixed(0)}ms p95 ${percentile(measurements.active,.95).toFixed(0)}ms [${measurements.active.map(value=>value.toFixed(0)).join(', ')}] · resident after 1.5s [${measurements.resident.join(', ')}] · process-tree RSS MiB [${measurements.rssMiB.map(value=>value.toFixed(0)).join(', ')}]`);
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
