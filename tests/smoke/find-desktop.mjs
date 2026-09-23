import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,rmSync,writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
const root=join(dirname(fileURLToPath(import.meta.url)),'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const temp=mkdtempSync(join(tmpdir(),'aux-find-'));let app, page;
const server=createServer((req,res)=>{res.setHeader('Content-Type','text/html');res.end(`<!doctype html><title>Reading ${req.url}</title><style>body{font:24px system-ui;padding:48px}p{margin:70px 0}</style><h1>Reading fixture</h1>${Array.from({length:req.url==='/one'?3:1},(_,i)=>`<p>Visible needle ${i+1}</p>`).join('')}<p hidden>needle hidden</p><script>const hiddenNeedle='needle';</script>`);});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url=`http://127.0.0.1:${server.address().port}`;
try{
 app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:temp,TMPDIR:temp,AUX_PROFILE_DIR:join(temp,'profile'),AUX_DATA_DIR:join(temp,'data'),AUX_LOAD_DOTENV:'0'},timeout:30000});
 for(let i=0;i<100;i++){page=app.windows().find(p=>p.url().includes('renderer/index.html'));if(page)break;await new Promise(r=>setTimeout(r,100));}
 assert.ok(page);page.setDefaultTimeout(12000);await page.locator('.aux-home').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
 const first=await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),url+'/one');
 await page.getByText('Reading /one',{exact:true}).waitFor();
 await app.evaluate(({webContents})=>{for(const wc of webContents.getAllWebContents()){wc.__findResults=[];wc.on('found-in-page',(_e,r)=>wc.__findResults.push(r));}});
 await page.keyboard.press('Meta+f');const field=page.getByRole('textbox',{name:'Find in page',exact:true});await field.fill('needle');
 await page.locator('.fb-n').filter({hasText:'1 of 3'}).waitFor();
 await page.getByRole('button',{name:'Next match',exact:true}).click();await page.locator('.fb-n').filter({hasText:'2 of 3'}).waitFor();
 await page.getByRole('button',{name:'Previous match',exact:true}).click();await page.locator('.fb-n').filter({hasText:'1 of 3'}).waitFor();
 await field.fill('no match');await page.locator('.fb-n').filter({hasText:'No results'}).waitFor();
 await field.fill('needle');await page.locator('.fb-n').filter({hasText:'1 of 3'}).waitFor();
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),url+'/two');
 await page.getByText('Reading /two',{exact:true}).waitFor();await page.locator('.fb-n').filter({hasText:'1 of 1'}).waitFor();
 await page.getByText('Reading /one',{exact:true}).click();await page.locator('.fb-n').filter({hasText:'1 of 3'}).waitFor();
 await page.evaluate(({pageId,url})=>window.aux.invoke('pages.navigate',{pageId,url}),{pageId:first.pageId,url:url+'/updated'});
 await page.locator('.fb-n').filter({hasText:'1 of 1'}).waitFor();
 // Log actual native searches to verify debounce/retry cancellation, not just hidden UI.
 await app.evaluate(({webContents})=>{for(const wc of webContents.getAllWebContents()){if(wc.getURL().includes('/updated')){const find=wc.findInPage.bind(wc);wc.__findCalls=[];wc.findInPage=(text,options)=>{wc.__findCalls.push(text);return find(text,options);};}}});
 await field.fill('cancel-before-debounce');await field.press('Escape');await field.waitFor({state:'hidden'});
 await new Promise(r=>setTimeout(r,1400));
 const searches=await app.evaluate(({webContents})=>webContents.getAllWebContents().find(w=>w.getURL().includes('/updated')).__findCalls);
 assert.ok(!searches.includes('cancel-before-debounce'),'Closing cancels pending native search');
 await page.keyboard.press('Meta+f');await field.fill('needle');await page.locator('.fb-n').filter({hasText:'1 of 1'}).waitFor();
 await field.fill('');await page.waitForFunction(()=>document.querySelector('.fb-n')?.textContent==='');
 await field.fill('needle');await page.locator('.fb-n').filter({hasText:'1 of 1'}).waitFor();
 // Zoom remains functional with an open Find bar and is reset before exit.
 await page.keyboard.press('Meta+=');
 let zoom=await app.evaluate(({webContents})=>webContents.getAllWebContents().find(w=>w.getURL().includes('/updated')).getZoomLevel());assert.ok(zoom>0);
 await page.keyboard.press('Meta+0');zoom=await app.evaluate(({webContents})=>webContents.getAllWebContents().find(w=>w.getURL().includes('/updated')).getZoomLevel());assert.equal(zoom,0);
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});const png=await app.evaluate(async ({BaseWindow,desktopCapturer})=>{
   const sourceId=BaseWindow.getAllWindows()[0].getMediaSourceId();
   const sources=await desktopCapturer.getSources({types:['window'],thumbnailSize:{width:2400,height:1888}});
   return sources.find(source=>source.id===sourceId)?.thumbnail.toPNG().toString('base64');
 });assert.ok(png);writeFileSync(join(root,'release/test-artifacts/aux-find-page.png'),Buffer.from(png,'base64'));
 console.log('PASS: visible-text counts, next/previous, no results, tab switch, navigation, clear/close cancellation and zoom');
}catch(error){console.error('views',await app?.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].contentView.children.map(v=>({url:v.webContents?.getURL(),bounds:v.getBounds(),visible:v.getVisible()}))));console.error('Find state',await page?.locator('.fb-n').textContent().catch(()=>''),await app?.evaluate(({webContents})=>webContents.getAllWebContents().map(w=>({url:w.getURL(),results:w.__findResults}))));throw error;}finally{if(app)await app.close();await new Promise(r=>server.close(r));rmSync(temp,{recursive:true,force:true});}
