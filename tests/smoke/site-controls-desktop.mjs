// Current-site trust/data controls with an isolated profile and synthetic page.
import {createRequire} from 'node:module';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';

const root=resolve(import.meta.dirname,'../..');
const {_electron}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const electron=createRequire(join(root,'apps/desktop/package.json'))('electron');
const dir=mkdtempSync(join(tmpdir(),'aux-site-controls-'));
const server=createServer((req,res)=>{res.setHeader('Set-Cookie','auxSite=session; SameSite=Lax; Path=/');res.setHeader('Content-Type','text/html');res.end('<title>Aux site controls fixture</title><h1>Private site data</h1>');});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://localhost:${server.address().port}`;
mkdirSync(join(dir,'data'),{recursive:true});
writeFileSync(join(dir,'data/site-permissions.json'),JSON.stringify({[base]:{notifications:'deny',geolocation:'allow'}}));
let app;
try{
  app=await _electron.launch({executablePath:electron,args:[join(root,'apps/desktop'),'--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}});
  let shell;for(let i=0;i<100;i++){shell=app.windows().find(page=>page.url().includes('renderer/index.html'));if(shell)break;await new Promise(resolve=>setTimeout(resolve,100));}assert.ok(shell);shell.setDefaultTimeout(15000);
  await shell.locator('.aux-home').waitFor();await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
  const target=await shell.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base);
  await poll(shell,async id=>(await window.aux.invoke('pages.list',{})).some(page=>page.pageId===id&&!page.loading),target.pageId);
  // The toolbar hides over a loaded page until the pointer approaches it —
  // pointerenter holds it open, same as a real hover.
  await shell.locator('.main-col > .toolbar').dispatchEvent('pointerenter');
  await shell.locator('button[aria-label="Site controls"]:visible').click();
  const dialog=shell.getByRole('dialog',{name:base});await dialog.waitFor();
  await dialog.getByText('Local connection',{exact:true}).first().waitFor();
  await dialog.getByText('1 cookie stored for this address',{exact:true}).waitFor();
  await dialog.getByText('Notifications',{exact:true}).waitFor();
  await dialog.getByText('Blocked',{exact:true}).waitFor();
  await dialog.getByText('Location',{exact:true}).waitFor();
  await dialog.getByText('Allowed',{exact:true}).waitFor();
  mkdirSync(join(root,'release/test-artifacts'),{recursive:true});
  await shell.screenshot({path:join(root,'release/test-artifacts/aux-site-controls.png')});
  await dialog.getByRole('button',{name:'Reset Notifications',exact:true}).click();
  await dialog.getByText('Notifications will ask again.',{exact:true}).waitFor();
  assert.deepEqual((await shell.evaluate(id=>window.aux.siteInfo(id),target.pageId)).permissions,{geolocation:'allow'});
  await app.evaluate(({dialog})=>{dialog.showMessageBox=async()=>({response:1,checkboxChecked:false});});
  await dialog.getByRole('button',{name:'Clear…',exact:true}).click();
  await dialog.getByText('0 cookies stored for this address',{exact:true}).waitFor();
  await dialog.getByText('Cookies and stored website data cleared.',{exact:false}).waitFor();
  await dialog.getByRole('button',{name:'Close site controls',exact:true}).click();
  await shell.locator('button[aria-label="Site controls"]:visible').waitFor();
  await shell.waitForFunction(()=>document.activeElement?.getAttribute('aria-label')==='Site controls');
  assert.equal(await shell.evaluate(()=>document.activeElement?.getAttribute('aria-label')),'Site controls');
  console.log('Current-site connection, cookie and permission state is inspectable; permission reset and guarded site-data clearing refresh the accessible shell surface.');
}finally{await app?.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));rmSync(dir,{recursive:true,force:true});}
