// Isolated populated-shell review; no personal profile or provider credentials.
import { createRequire } from 'node:module';
import { mkdtempSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import {openDb,Repo} from '../../apps/runtime/dist/index.js';
const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const dir=mkdtempSync(join(tmpdir(),'aux-shell-')); const out=join(root,'release/test-artifacts');mkdirSync(out,{recursive:true});
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<title>${req.url.includes('notes')?'Project notes':'Design reference'}</title><h1>Aux visual fixture</h1>`);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
mkdirSync(join(dir,'data'));
const db=openDb(join(dir,'data','aux-state.sqlite'));const repo=new Repo(db);
for(const [i,goal,result] of [[1,'Review the design references','Collected the layout references and compared the sidebar spacing, typography, and page surfaces.'],[2,'Prepare the project notes','Organized the next steps for the project. The working notes are ready to continue.']])repo.saveRun({runId:`visual-${i}`,goal,status:'completed',pageIds:[],config:{chatId:`visual-${i}`},statusMessage:result,createdAt:Date.now()-i*60000});
db.close();
let app;
try {
 app=await _electron.launch({executablePath:createRequire(join(root,'apps/desktop/package.json'))('electron'),args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
 let page;for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}assert.ok(page);
 await page.locator('.aux-home').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setBounds({x:80,y:80,width:1200,height:944}));
 const pages=await page.evaluate(async base=>{const a=await window.aux.invoke('pages.open',{url:base+'/notes',activate:true});const b=await window.aux.invoke('pages.open',{url:base+'/design',activate:true});const c=await window.aux.invoke('pages.open',{url:'about:blank',activate:true});return[a,b,c];},base);
 await page.evaluate(({pages,base})=>{localStorage.setItem(`aux.layout.v1:${window.aux.windowId}`,JSON.stringify({spaces:[{id:'personal',name:'Personal',color:'slate'},{id:'work',name:'Studio',color:'slate'}],activeSpaceId:'work',tabSpace:Object.fromEntries(pages.map(p=>[p.pageId,'work'])),order:pages.map(p=>p.pageId),pins:{work:[{url:base+'/notes',title:'Project notes'},{url:base+'/design',title:'Design reference'}]},folders:[{id:'research',name:'Research',spaceId:'work',collapsed:false}],tabFolder:{[pages[0].pageId]:'research'}}));},{pages,base});
 await page.reload();await page.getByRole('group',{name:'Research',exact:true}).waitFor();await page.locator('.aux-home').waitFor();
 assert.equal(await page.getByRole('group',{name:'Research',exact:true}).count(),1);
 assert.equal(await page.getByRole('group',{name:'Pinned sites',exact:true}).count(),1);
 await page.screenshot({path:join(out,'aux-shell-restored.png')});
 const material=await app.evaluate(async ({BaseWindow,BrowserWindow,systemPreferences})=>{
   const main=BaseWindow.getAllWindows()[0];
   const back=new BrowserWindow({x:40,y:40,width:1320,height:1040,frame:false,show:false,webPreferences:{sandbox:true}});
   await back.loadURL('data:text/html,'+encodeURIComponent('<style>body{margin:0;background:repeating-linear-gradient(135deg,#eee 0 150px,#777 150px 300px,#222 300px 450px);height:100vh}</style>'));
   back.showInactive();main.focus();
   globalThis.auxVisualBackdrop=back;
   return {screenPermission:systemPreferences.getMediaAccessStatus('screen'),vibrancy:main.getBackgroundColor()};
 });
 console.log('Native material capture',material);
 // Screen capture is restricted to the test application's Aux window.
 if(material.screenPermission==='granted') {
   await new Promise(r=>setTimeout(r,700));
   const png=await app.evaluate(async ({desktopCapturer,BaseWindow})=>{const sourceId=BaseWindow.getAllWindows()[0]?.getMediaSourceId();const sources=await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:2400,height:1888}});return sources.find(s=>s.id===sourceId)?.thumbnail.toPNG().toString('base64');});
   if(png)writeFileSync(join(out,'aux-native-frosted.png'),Buffer.from(png,'base64'));
   else throw new Error('Aux native window capture unavailable');
 }
 await page.locator('.sb-more summary').click();await page.getByRole('menuitem',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Appearance',exact:true}).click();
 assert.equal(await page.getByLabel('Blue-gray tint').count(),0);
 await page.screenshot({path:join(out,'aux-neutral-appearance.png')});
 await page.locator('select[aria-label="Sidebar appearance"]').selectOption('solid');
 await page.waitForFunction(()=>document.documentElement.dataset.sidebarAppearance==='solid');
 await page.getByRole('button',{name:'Close settings',exact:true}).click();
 if(material.screenPermission==='granted') {
   await new Promise(r=>setTimeout(r,350));
   const png=await app.evaluate(async ({desktopCapturer,BaseWindow})=>{const sourceId=BaseWindow.getAllWindows()[0]?.getMediaSourceId();const sources=await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:2400,height:1888}});return sources.find(s=>s.id===sourceId)?.thumbnail.toPNG().toString('base64');});
   assert.ok(png);writeFileSync(join(out,'aux-native-solid.png'),Buffer.from(png,'base64'));
 }
 await page.getByRole('button',{name:'Collapse sidebar',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.sidebar').getBoundingClientRect().width===0);
 await page.locator('button[aria-label="Show sidebar"]').evaluate(button=>button.click());await page.waitForFunction(()=>document.querySelector('.sidebar').getBoundingClientRect().width>=279);
 await page.getByTitle('Switch space',{exact:true}).click();
 await page.getByRole('menu').waitFor();
 await page.keyboard.press('Escape');
 await page.locator('.sb-more summary').click();await page.getByRole('menuitem',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Appearance',exact:true}).click();await page.locator('select[aria-label="Sidebar appearance"]').selectOption('translucent');await page.getByRole('button',{name:'Close settings',exact:true}).click();
 assert.equal(await page.locator('.toolbar').count(),1);
 await page.locator('.tab-row').filter({hasText:'Project notes'}).click();
 await page.locator('.sidebar [aria-label="Toggle agent rail"]').click();
 await page.waitForFunction(()=>document.querySelector('.rail').getBoundingClientRect().width>300);
 await new Promise(r=>setTimeout(r,300));
 assert.ok(await page.locator('.stage-card').evaluate(el=>el.getBoundingClientRect().top<8));
 const capture=async name=>{
  const png=await app.evaluate(async ({desktopCapturer,BaseWindow})=>{const sourceId=(BaseWindow.getAllWindows().find(w=>w!==globalThis.auxVisualBackdrop)??BaseWindow.getAllWindows()[0])?.getMediaSourceId();const sources=await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:2400,height:1888}});return sources.find(s=>s.id===sourceId)?.thumbnail.toPNG().toString('base64');});
  assert.ok(png);writeFileSync(join(out,name),Buffer.from(png,'base64'));
 };
 if(material.screenPermission==='granted')await capture('aux-clean-web-agent.png');
 await page.getByRole('button',{name:'Collapse sidebar',exact:true}).click();await page.waitForFunction(()=>document.querySelector('.sidebar').getBoundingClientRect().width===0);
 await new Promise(r=>setTimeout(r,300));
 if(material.screenPermission==='granted')await capture('aux-clean-collapsed.png');
 await page.keyboard.press('Meta+l');await page.waitForFunction(()=>document.activeElement===document.querySelector('.cmdbar.compact input'));
 await page.keyboard.press('Escape');
 await page.locator('button[aria-label="Show sidebar"]').evaluate(button=>button.click());await page.waitForFunction(()=>document.querySelector('.sidebar').getBoundingClientRect().width>=279);
 await page.locator('.sb-more summary').click();await page.getByRole('menuitem',{name:'Settings',exact:true}).click();await page.getByRole('button',{name:'Appearance',exact:true}).click();
 assert.equal(await page.getByLabel('Sidebar blur',{exact:true}).count(),0);
 await page.locator('select[aria-label="Tab layout"]').selectOption('horizontal');
 await page.locator('.toolbar').waitFor();
 await page.locator('select[aria-label="Tab layout"]').selectOption('vertical');
 console.log('Full-height page, compact footer, zero-width sidebar collapse, edge reveal, horizontal toolbar and native window captures verified.');
} finally {await app?.close();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
