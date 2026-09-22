import {sidebarAction} from "./sidebar-action.mjs";
// Real native downloads from a bounded local fixture; temporary files only.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,rmSync,readFileSync,unlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-downloads-'));
const payload=Buffer.alloc(524288,65);
const server=createServer((req,res)=>{
 if(req.url.startsWith('/file')) {
  res.writeHead(200,{'Content-Type':'application/octet-stream','Content-Disposition':`attachment; filename="${req.url.slice(1)}.txt"`,'Content-Length':payload.length});
  let offset=0;const timer=setInterval(()=>{if(offset>=payload.length){clearInterval(timer);res.end();return;}res.write(payload.subarray(offset,offset+8192));offset+=8192;},60);
  res.on('close',()=>clearInterval(timer));
 } else {res.setHeader('Content-Type','text/html');res.end('<title>Download fixture</title><a href="/file-one">Download one</a><a href="/file-two">Download two</a>');}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let app;
async function launch(){
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
}
try {
 await launch();
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);
 await page.locator('.aux-home').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base);
 let fixture;for(let i=0;i<100;i++){fixture=app.windows().find(p=>p.url().startsWith(base));if(fixture)break;await new Promise(r=>setTimeout(r,50));}assert.ok(fixture);
 await fixture.getByRole('link',{name:'Download one',exact:true}).click();
 await sidebarAction(page, "Downloads");
 let row=page.locator('.dl-row').filter({hasText:'file-one.txt'});
 await row.getByRole('button',{name:'Pause',exact:true}).click();
 await row.getByText('Paused',{exact:true}).waitFor();
 await page.reload();await sidebarAction(page, "Downloads");
 row=page.locator('.dl-row').filter({hasText:'file-one.txt'});
 await row.getByRole('button',{name:'Resume',exact:true}).waitFor();
 await page.screenshot({path:join(root,'release/test-artifacts/aux-download-paused.png')});
 const chosen=join(dir,'chosen-downloads');mkdirSync(chosen);
 const originalFolder=await page.evaluate(()=>window.aux.downloadFolder());
 await app.evaluate(({dialog})=>{dialog.showOpenDialog=async()=>({canceled:true,filePaths:[]});});
 await page.getByRole('button',{name:'Change folder',exact:true}).click();assert.deepEqual(await page.evaluate(()=>window.aux.downloadFolder()),originalFolder);
 await app.evaluate(({dialog},path)=>{dialog.showOpenDialog=async()=>({canceled:false,filePaths:[path]});},chosen);
 await page.getByRole('button',{name:'Change folder',exact:true}).click();await page.getByRole('button',{name:'Use default',exact:true}).waitFor();
 assert.equal((await page.evaluate(()=>window.aux.downloadFolder())).custom,true);
 await page.screenshot({path:join(root,'release/test-artifacts/aux-download-folder.png')});

 await row.getByRole('button',{name:'Resume',exact:true}).click();
 await row.getByText('Done',{exact:true}).waitFor();
 const downloads=await page.evaluate(()=>window.aux.invoke('downloads.list',{}));
 const saved=downloads.find(download=>download.filename==='file-one.txt');
 assert.ok(saved.path.startsWith(join(dir,'data','downloads')));assert.deepEqual(readFileSync(saved.path),payload);
 await fixture.getByRole('link',{name:'Download two',exact:true}).click();
 const second=page.locator('.dl-row').filter({hasText:'file-two.txt'});
 await second.getByRole('button',{name:'Cancel',exact:true}).click();
 await second.getByText('Cancelled',{exact:true}).waitFor();
 unlinkSync(saved.path);
 await row.getByRole('button',{name:'Open',exact:true}).click();
 await page.getByRole('region',{name:'Downloads',exact:true}).getByRole('alert').waitFor();
 await page.screenshot({path:join(root,'release/test-artifacts/aux-download-results.png')});
 await app.close();await launch();
 for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}
 await page.locator('.app').waitFor();assert.equal((await page.evaluate(()=>window.aux.downloadFolder())).custom,true);
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base);
 for(let i=0;i<100;i++){fixture=app.windows().find(p=>p.url().startsWith(base));if(fixture)break;await new Promise(r=>setTimeout(r,50));}
 await sidebarAction(page,'Downloads');
 const oldCancelled=page.locator('.dl-row').filter({hasText:'file-two.txt'});await oldCancelled.getByRole('button',{name:'Retry',exact:true}).click();
 const completed=page.locator('.dl-row').filter({hasText:'file-two.txt'}).first();await completed.getByText('Done',{exact:true}).waitFor();
 const latest=(await page.evaluate(()=>window.aux.invoke('downloads.list',{}))).filter(item=>item.filename==='file-two.txt').sort((a,b)=>b.startedAt-a.startedAt)[0];
 assert.equal(latest.sourceUrl,base+'/file-two');
 assert.equal(await page.locator('.dl-row').filter({hasText:'file-two.txt'}).getByText('Cancelled',{exact:true}).count(),1);
 assert.ok(latest.path.includes('/chosen-downloads/'));assert.deepEqual(readFileSync(latest.path),payload);
 rmSync(chosen,{recursive:true,force:true});
 await fixture.getByRole('link',{name:'Download two',exact:true}).click();
 await page.locator('.dl-row').filter({hasText:'file-two.txt'}).first().getByText('Interrupted',{exact:true}).waitFor();
 await page.getByRole('alert').filter({hasText:'unavailable or not writable'}).waitFor();
 await page.getByRole('button',{name:'Use default',exact:true}).click();await page.getByRole('button',{name:'Use default',exact:true}).waitFor({state:'hidden'});
 assert.equal((await page.evaluate(()=>window.aux.downloadFolder())).custom,false);
 await page.locator('.dl-row').filter({hasText:'file-two.txt'}).first().getByRole('button',{name:'Retry',exact:true}).click();
 await page.locator('.dl-row').filter({hasText:'file-two.txt'}).first().getByText('Done',{exact:true}).waitFor();
 await page.screenshot({path:join(root,'release/test-artifacts/aux-download-retry.png')});
 console.log('Native download destination selection/cancel, active destination stability, restart persistence, exact completion, unavailable folder, reset, pause/resume/cancel and missing-file feedback verified.');
} finally {await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
