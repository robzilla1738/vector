// Human click to correct native WebContentsView placement; compositor paint is a separate gate.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { launchAux } from './launch.mjs';

const dir=mkdtempSync(join(tmpdir(),'aux-tab-activation-'));
const server=createServer((request,response)=>{const red=request.url==='/red';response.setHeader('Content-Type','text/html');response.end(`<title>${red?'Red':'Blue'} activation</title><style>html,body{margin:0;height:100%;background:${red?'red':'blue'}}</style><h1>${red?'Red':'Blue'} activation</h1>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const percentile=(values,fraction)=>{const sorted=[...values].sort((a,b)=>a-b);return sorted[Math.min(sorted.length-1,Math.ceil(sorted.length*fraction)-1)];};
let app;
try{
  let shell;({app,page:shell}=await launchAux({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}}));
  await shell.locator('.app').waitFor();
  await shell.evaluate(()=>window.aux.invoke('settings.set',{tabLayout:'horizontal'}));
  for(const color of ['red','blue']){
    const ack=await shell.evaluate(url=>window.aux.tabCommand({kind:'open',url,activate:true}),`${base}/${color}`);
    assert.equal(ack.status,'applied');
    let page;for(let attempt=0;attempt<100;attempt++){page=app.windows().find(window=>window.url()===`${base}/${color}`);if(page)break;await new Promise(resolve=>setTimeout(resolve,25));}
    assert.ok(page,`${color} native page must exist`);
    await page.waitForLoadState();
    assert.equal(await page.locator('h1').textContent(),`${color==='red'?'Red':'Blue'} activation`);
  }
  const strip=shell.getByRole('tablist',{name:'Browser tabs'});
  await strip.getByRole('tab',{name:'Red activation'}).waitFor();
  const samples=[];
  for(let i=0;i<20;i++){
    const color=i%2===0?'red':'blue';
    const target=`${base}/${color}`;
    await app.evaluate(({BaseWindow},targetUrl)=>{
      const win=BaseWindow.getAllWindows()[0];
      const shellView=win.contentView.children.find(view=>view.webContents?.getURL().includes('renderer/index.html'));
      const targetView=win.contentView.children.find(view=>view.webContents?.getURL()===targetUrl);
      if(!shellView||!targetView||targetView.getVisible())throw new Error('Native tab was not hidden before activation');
      globalThis.__auxTabPlacement=new Promise((resolve,reject)=>{
        let start=0;
        const timeout=setTimeout(()=>{cleanup();reject(new Error('Native tab did not become visible'));},5000);
        const onInput=(_event,input)=>{if(input.type==='mouseDown'&&!start)start=performance.now();};
        const poll=()=>{if(start&&targetView.getVisible()){const elapsed=performance.now()-start;cleanup();resolve(elapsed);return;}timer=setTimeout(poll,1);};
        let timer=setTimeout(poll,1);
        const cleanup=()=>{clearTimeout(timeout);clearTimeout(timer);shellView.webContents.off('input-event',onInput);};
        shellView.webContents.on('input-event',onInput);
      });
      return true;
    },target);
    await strip.getByRole('tab',{name:`${color==='red'?'Red':'Blue'} activation`}).click();
    samples.push(await app.evaluate(async()=>{try{return await globalThis.__auxTabPlacement;}finally{delete globalThis.__auxTabPlacement;}}));
    const snapshot=await shell.evaluate(()=>window.aux.tabsSnapshot());
    assert.equal(snapshot.tabs.find(tab=>tab.pageId===snapshot.windows[0].activePageId)?.url,target);
  }
  console.log(`Human click to native tab placement · p50 ${percentile(samples,.5).toFixed(1)}ms p95 ${percentile(samples,.95).toFixed(1)}ms [${samples.map(value=>value.toFixed(1)).join(', ')}]`);
}finally{await app?.close().catch(()=>{});server.closeAllConnections();await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});}
