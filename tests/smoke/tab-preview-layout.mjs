import {launchAux,root} from './launch.mjs';
import {mkdtempSync,mkdirSync,writeFileSync} from 'node:fs';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
mkdirSync(root+'/release/test-artifacts/tabs',{recursive:true});
const dir=mkdtempSync('/tmp/aux-preview-layout-');
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<title>Preview ${req.url.slice(1)}</title><style>body{margin:0;background:#142b49;color:white;font:24px sans-serif}header{padding:40px}button{margin:80px}</style><header>Preview ${req.url.slice(1)} — stable page layout</header><button>Page control</button>`);});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const {app,page}=await launchAux({args:['--use-mock-keychain'],env:{...process.env,AUX_PROFILE_DIR:dir+'/profile',AUX_DATA_DIR:dir+'/data',AUX_LOAD_DOTENV:'0'}});
page.setDefaultTimeout(15000);
const bounds=()=>app.evaluate(({BaseWindow},url)=>{
 const view=BaseWindow.getAllWindows()[0].contentView.children.find(v=>v.webContents?.getURL()===url);
 return view.getBounds();
},base+'/Two');
try {
 await page.locator('.aux-home').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setBounds({x:100,y:100,width:1200,height:800}));
 await page.evaluate(()=>window.aux.invoke('settings.set',{tabLayout:'vertical'}));
 await page.locator('.tabs-vertical').waitFor();
 if(await page.getByRole('button',{name:'Show sidebar',exact:true}).isVisible())await page.getByRole('button',{name:'Show sidebar',exact:true}).click();
 for(const name of ['One','Two'])await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/'+name);
 await page.waitForFunction(async url=>(await window.aux.invoke('pages.list',{})).some(p=>p.url===url&&!p.loading),base+'/Two');
 await page.locator('.sidebar').evaluate(el=>Promise.all(el.getAnimations().map(a=>a.finished)));
 for(const layout of ['vertical','horizontal']) {
  await page.evaluate(tabLayout=>window.aux.invoke('settings.set',{tabLayout}),layout);
  await page.locator('.tabs-'+layout).waitFor();
  await page.waitForTimeout(300);
  const before=await bounds();
  const target=layout==='vertical'?page.locator('.sidebar .tab-row').filter({hasText:'Preview One'}):page.locator('.horizontal-tab-select').filter({hasText:'Preview One'});
  await target.hover();
  const preview=page.getByRole('tooltip');await preview.waitFor();
  const initial=await preview.boundingBox();
  await preview.locator('img').waitFor();
  await page.waitForFunction(()=>document.querySelector('.tab-preview img')?.complete);
  const loaded=await preview.boundingBox();
  assert.equal(loaded.height,initial.height,'thumbnail arrival must not resize the card');
  assert.deepEqual(await bounds(),before,'preview must not move/resize the native web page');
  const viewport=await page.evaluate(()=>({width:innerWidth,height:innerHeight}));
  assert.ok(loaded.x>=8&&loaded.y>=8&&loaded.x+loaded.width<=viewport.width-7&&loaded.y+loaded.height<=viewport.height-7);
  // Hosted macOS cannot grant Screen Recording; optional compositor evidence must not block input assertions.
  const png=process.env.CI ? null : await app.evaluate(async({desktopCapturer,BaseWindow,systemPreferences})=>{if(systemPreferences.getMediaAccessStatus("screen")!=="granted")return null;const id=BaseWindow.getAllWindows()[0].getMediaSourceId();return (await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:2400,height:1600}})).find(s=>s.id===id)?.thumbnail.toPNG().toString('base64');});
  if(png)writeFileSync(root+`/release/test-artifacts/tabs/preview-${layout}.png`,Buffer.from(png,'base64'));
  else await page.screenshot({path:root+`/release/test-artifacts/tabs/preview-${layout}-shell.png`});
  await page.keyboard.press('Escape');await preview.waitFor({state:'hidden'});
  assert.deepEqual(await bounds(),before,'dismissing must not move the native web page');
  await page.mouse.move(1100,700);
 }
 console.log('PASS vertical/horizontal previews: native bounds unchanged, thumbnail height stable, viewport containment and Escape dismissal.');
} finally {await app.evaluate(({app})=>app.exit(0)).catch(()=>{});server.closeAllConnections();await new Promise(r=>server.close(r));}
