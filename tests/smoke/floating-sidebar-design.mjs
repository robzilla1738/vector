import {closeAux} from "./launch.mjs";
import {launchAux,root} from './launch.mjs';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
mkdirSync(root+'/release/test-artifacts/tabs',{recursive:true});
const dir=mkdtempSync('/tmp/aux-floating-sidebar-');
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html; charset=utf-8');res.end('<title>Floating sidebar fixture</title><style>body{margin:0;background:linear-gradient(135deg,#365170,#c0b6a8);height:200vh;font:24px sans-serif;color:white}h1{padding:100px 40px}button{position:absolute;left:600px;top:350px}</style><h1>The page stays in place</h1><button onclick="this.textContent=\'Clicked\'">Page action</button>');});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const url=`http://127.0.0.1:${server.address().port}`;
const {app,page}=await launchAux({args:['--use-mock-keychain'],env:{...process.env,AUX_PROFILE_DIR:dir+'/profile',AUX_DATA_DIR:dir+'/data',AUX_LOAD_DOTENV:'0'}});
page.setDefaultTimeout(15000);
const bounds=()=>app.evaluate(({BaseWindow},url)=>BaseWindow.getAllWindows()[0].contentView.children.find(v=>v.webContents?.getURL().startsWith(url))?.getBounds(),url);
const settle=()=>page.locator('.sidebar').evaluate(async el=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));await Promise.all(el.getAnimations().map(a=>a.finished));});
const diagnostics=async()=>({
 shell:await page.evaluate(()=>({app:document.querySelector('.app')?.className,stage:document.querySelector('.main-col')?.className,panel:document.querySelector('.sidebar')?.className,reducedTransparency:matchMedia('(prefers-reduced-transparency: reduce)').matches})),
 nativeReducedTransparency:await app.evaluate(({nativeTheme})=>nativeTheme.prefersReducedTransparency),
 views:await app.evaluate(async({BaseWindow},url)=>Promise.all(BaseWindow.getAllWindows()[0].contentView.children.filter(v=>v.webContents?.getURL().startsWith(url)).map(async v=>({url:v.webContents.getURL(),visible:v.getVisible(),bounds:v.getBounds(),glass:await v.webContents.executeJavaScript("document.getElementById('aux-sidebar-glass')?.getAttribute('style')").catch(error=>String(error))}))),url),
});
try {
 await page.locator('.aux-home').waitFor();
 await page.bringToFront();
 await page.evaluate(()=>window.aux.invoke('settings.set',{tabLayout:'vertical'}));
 await page.locator('.tabs-vertical').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setBounds({x:100,y:100,width:1200,height:800}));
 if(await page.getByRole('button',{name:'Collapse sidebar',exact:true}).isVisible())await page.getByRole('button',{name:'Collapse sidebar',exact:true}).click();
 await settle();
 const homeBefore=await page.locator('.aux-home').boundingBox();
 await page.getByRole('button',{name:'Show sidebar',exact:true}).click();await settle();
 assert.ok((await page.locator('.aux-home').boundingBox()).width < homeBefore.width,'pinned sidebar occupies its normal column');
 await page.keyboard.press('Escape');assert.equal(await page.locator('.sidebar').getAttribute('aria-hidden'),'false','Escape does not dismiss pinned sidebar');
 await page.getByRole('button',{name:'Collapse sidebar',exact:true}).click();await settle();
 await page.evaluate(()=>{if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
 await page.mouse.move(2,150);await page.locator(".sidebar.peek").waitFor();await settle();
 assert.deepEqual(await page.locator('.aux-home').boundingBox(),homeBefore);
 let panel=await page.locator('.sidebar').boundingBox();assert.equal(panel.x,8);assert.equal(panel.y,48);
 await page.mouse.move(120,180);assert.equal(await page.locator('.sidebar.peek').count(),1);
 await page.mouse.move(850,500);
 await page.waitForFunction(()=>document.querySelector('.sidebar')?.getAttribute('aria-hidden')==='true');await settle();
 assert.equal(await page.locator('.sidebar').isVisible(),false,'edge preview dismisses after pointer leaves');
 await page.mouse.move(2,150);await page.locator('.sidebar.peek').waitFor();await settle();
 await page.keyboard.press('Escape');await settle();assert.equal(await page.locator('.sidebar').isVisible(),false);
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),url);
 await page.waitForFunction(async url=>(await window.aux.invoke('pages.list',{})).some(p=>p.url.startsWith(url)&&!p.loading),url);
 await page.locator('.main-col.has-page').waitFor();
 const before=await bounds();
 assert.ok(before?.width>0&&before.height>0,'native page is attached to the stage');
 await page.locator('.toolbar').dispatchEvent('pointerenter');
 await app.evaluate(({webContents})=>webContents.getAllWebContents().find(w=>w.getType()==='window' && !w.getURL().startsWith('http://127.0.0.1:'))?.send('sidebar-edge',true));await page.locator('.sidebar.peek').waitFor();await settle();
 assert.deepEqual(await bounds(),before);
 const reducedTransparency=await page.evaluate(()=>matchMedia('(prefers-reduced-transparency: reduce)').matches);
 assert.equal(await app.evaluate(({nativeTheme})=>nativeTheme.prefersReducedTransparency),reducedTransparency,'native and renderer transparency settings agree');
 let frost=null;
 for(let attempt=0;attempt<100 && !frost && !reducedTransparency;attempt++){
  frost=await app.evaluate(async({BaseWindow},url)=>{
    const view=BaseWindow.getAllWindows()[0].contentView.children.find(v=>v.webContents?.getURL().startsWith(url)&&v.getVisible());
    return view?.webContents.executeJavaScript(`(()=>{const el=document.getElementById('aux-sidebar-glass');return el&&getComputedStyle(el).backdropFilter})()`);
  },url);
  if(!frost)await new Promise(resolve=>setTimeout(resolve,50));
 }
 if(reducedTransparency){
  const fallback=await page.locator('.sidebar.peek').evaluate(el=>({blur:getComputedStyle(el).backdropFilter,fill:getComputedStyle(el).backgroundColor}));
  assert.equal(fallback.blur,'none','Reduce Transparency removes sidebar blur');
  assert.notEqual(fallback.fill,'rgba(0, 0, 0, 0)','Reduce Transparency keeps an opaque sidebar');
 }else{
  if(!frost)console.error('glass diagnostics',JSON.stringify(await diagnostics()));
  assert.match(frost,/blur\(28px\)/);
 }
  // Hosted macOS cannot grant Screen Recording; optional compositor evidence must not block input assertions.
 const png=process.env.CI ? null : await app.evaluate(async({desktopCapturer,BaseWindow,systemPreferences})=>{if(systemPreferences.getMediaAccessStatus("screen")!=="granted")return null;const id=BaseWindow.getAllWindows()[0].getMediaSourceId();return (await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:2400,height:1600}})).find(s=>s.id===id)?.thumbnail.toPNG().toString('base64');});
 if(png)writeFileSync(root+'/release/test-artifacts/tabs/floating-sidebar.png',Buffer.from(png,'base64'));
  else await page.screenshot({path:root+'/release/test-artifacts/tabs/floating-sidebar-shell.png'});
 await page.mouse.click(800,500);await settle();
 if(await page.locator('.sidebar').isVisible())console.error('outside click diagnostics',JSON.stringify(await diagnostics()));
 assert.equal(await page.locator('.sidebar').isVisible(),false,'outside click closes panel');assert.deepEqual(await bounds(),before);
 await page.mouse.move(2,150);await page.locator('.sidebar.peek').waitFor();await settle();
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('.sidebar').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
 await page.getByRole('button',{name:'Show sidebar',exact:true}).click();assert.equal(await page.locator('.sidebar.expanded').count(),1);
 await page.getByRole('button',{name:'Collapse sidebar',exact:true}).click();
 console.log('PASS restored pinned sidebar and collapsed edge-only inset glass sidebar, stationary home and native page, live page blur, Escape/outside/toggle dismissal and reduced motion.');
} finally {await closeAux(app);server.closeAllConnections();await new Promise(r=>server.close(r));}
