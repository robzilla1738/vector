import { expandedSidebar } from "./sidebar-action.mjs";
// Real native tabs and menu recovery in an isolated development profile.
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import { launchApp, shellWindow } from './launch.mjs';
const root=resolve(import.meta.dirname,'../..');
const dir=mkdtempSync(join(tmpdir(),'aux-tab-recovery-'));
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<title>${req.url.slice(1)}</title><h1>${req.url.slice(1)}</h1>`);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
let app;
const launch=()=>launchApp({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
try {
 app=await launch();
 let page = await shellWindow(app);
 await page.locator('.aux-home').waitFor();
 await expandedSidebar(page);
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
 const pages=await page.evaluate(async base=>{const pages=[];for(const title of ['First','Research','Last','Personal'])pages.push(await window.aux.invoke('pages.open',{url:base+'/'+title,activate:true}));return pages;},base);
 await page.evaluate(id=>window.aux.invoke('pages.activate',{pageId:id}),pages[1].pageId);
 await page.waitForFunction(()=>document.querySelectorAll('.tab-row').length===4);
 // Seed after the shell flushes its pending layout on pagehide.
 await page.evaluate(pages=>window.addEventListener('pagehide',()=>localStorage.setItem(`aux.layout.v1:${window.aux.windowId}`,JSON.stringify({spaces:[{id:'work',name:'Studio',color:'slate'},{id:'personal',name:'Private',color:'slate'}],activeSpaceId:'work',order:pages.map(p=>p.pageId),tabSpace:Object.fromEntries(pages.map((p,i)=>[p.pageId,i===3?'personal':'work'])),pins:{},folders:[{id:'research',name:'Research folder',spaceId:'work',collapsed:false}],tabFolder:{[pages[1].pageId]:'research'}})),{once:true}),pages);
 await page.reload();
 await page.getByRole('group',{name:'Research folder',exact:true}).waitFor();
 await page.locator('.tab-row').filter({hasText:'Research'}).click();
 await page.getByRole('button',{name:'Close Research',exact:true}).click();
 await page.waitForFunction(()=>!Array.from(document.querySelectorAll('.tab-title')).some(el=>el.textContent==='Research'));
 await page.getByTitle('Switch space',{exact:true}).click();
 await page.getByRole('menuitemradio').filter({hasText:'Private'}).first().click();
 await page.locator('.tab-title').getByText('Personal',{exact:true}).waitFor();
 await app.evaluate(({Menu})=>{const item=Menu.getApplicationMenu().items.flatMap(item=>item.submenu?.items??[]).find(item=>item.label==='Reopen Closed Tab');if(!item)throw new Error('Menu missing');item.click();});
 await page.getByRole('group',{name:'Research folder',exact:true}).locator('.tab-title').getByText('Research',{exact:true}).waitFor();
 const others=[pages[0].pageId,pages[2].pageId,pages[3].pageId];
 let layout,lastSnap;for(let i=0;i<160;i++){
   const snap=await page.evaluate(()=>JSON.parse(localStorage.getItem(`aux.layout.v1:${window.aux.windowId}`)));
   lastSnap=snap;
   const restored=snap?.order?.[1];
   if(snap&&snap.activeSpaceId==='work'&&restored===pages[1].pageId&&snap.tabFolder[restored]==='research'&&JSON.stringify(snap.order.filter(id=>id!==restored))===JSON.stringify(others)){layout=snap;break;}
   await new Promise(r=>setTimeout(r,250));
 }
 assert.ok(layout,'reopened tab restores the closed tab id, position and folder so its history and records re-attach; last layout: '+JSON.stringify(lastSnap));
 const restored=layout.order[1];assert.equal(restored,pages[1].pageId,'reopen restores the closed tab id so its history and records re-attach');
 assert.equal(layout.tabFolder[restored],'research');
 assert.deepEqual(layout.order.filter(id=>id!==restored),[pages[0].pageId,pages[2].pageId,pages[3].pageId]);
 assert.ok(await page.locator('.tab-row.active').filter({hasText:'Research'}).count());
 await page.screenshot({path:join(root,'release/test-artifacts/aux-tab-recovery.png')});
 await page.locator('.tab-row').filter({hasText:'First'}).getByRole('button',{name:'Close First',exact:true}).click();await page.waitForFunction(()=>!Array.from(document.querySelectorAll('.tab-title')).some(el=>el.textContent==='First'));
 const before=await page.evaluate(()=>window.aux.invoke('pages.list',{}));await page.waitForFunction(id=>!JSON.parse(localStorage.getItem(`aux.layout.v1:${window.aux.windowId}`)).order.includes(id),pages[0].pageId,{timeout:3000});const layoutBeforeRestart=await page.evaluate(()=>JSON.parse(localStorage.getItem(`aux.layout.v1:${window.aux.windowId}`)));
 await app.close(); app=await launch();
 page=undefined;page = await shellWindow(app);
 await page.locator('.app-body').waitFor();
 await page.getByRole('group',{name:'Research folder',exact:true}).locator('.tab-title').getByText('Research',{exact:true}).waitFor();
 let after;for(let i=0;i<120&&!after;i++){
   const list=await page.evaluate(()=>window.aux.invoke('pages.list',{}));
   if(Array.isArray(list)&&list.length===before.length&&before.every(p=>list.some(q=>q.pageId===p.pageId&&q.documentEpoch>p.documentEpoch)))after=list;
   else await new Promise(r=>setTimeout(r,500));
 }
 assert.ok(after,'restored pages must carry bumped document epochs');
 assert.deepEqual(after.map(p=>p.pageId).sort(),before.map(p=>p.pageId).sort());
 for(const prior of before)assert.ok(after.find(p=>p.pageId===prior.pageId).documentEpoch>prior.documentEpoch,'reopened documents must invalidate prior observations');
 await page.getByTitle('Switch space',{exact:true}).click();await page.getByRole('menuitemradio').filter({hasText:'Private'}).first().click();
 await page.locator('.tab-title').getByText('Personal',{exact:true}).waitFor();
 await app.evaluate(({Menu})=>{Menu.getApplicationMenu().items.flatMap(item=>item.submenu?.items??[]).find(item=>item.label==='Reopen Closed Tab').click();});await page.locator('.tab-row.active').filter({hasText:'First'}).waitFor();
 let reopen;for(let i=0;i<120&&!reopen;i++){
   const snap=await page.evaluate(async()=>{
     const layout=JSON.parse(localStorage.getItem(`aux.layout.v1:${window.aux.windowId}`));
     const list=await window.aux.invoke('pages.list',{});
     const first=list.find(item=>item.title==='First');
     return first?{pageId:first.pageId,order:layout.order,tabSpace:layout.tabSpace[first.pageId],tabFolder:layout.tabFolder[first.pageId]}:null;
   });
   if(snap&&snap.order[0]===snap.pageId&&snap.tabSpace==='work'&&snap.tabFolder===undefined&&JSON.stringify(snap.order.filter(id=>id!==snap.pageId))===JSON.stringify(layoutBeforeRestart.order))reopen=snap;
   else await new Promise(r=>setTimeout(r,500));
 }
 assert.ok(reopen,'reopened tab restores position, space and placement after restart');
 assert.equal(reopen.pageId,pages[0].pageId,'reopen restores the closed tab id so its history and records re-attach');
 await page.screenshot({path:join(root,'release/test-artifacts/aux-tab-recovery-after-restart.png')});
 console.log('Closed-tab recovery survives full app restart while preserving tab identity for open pages and restoring space, folder and position with fresh documents.');
} finally {await app?.close();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
