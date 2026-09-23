// Synthetic HTTP auth only. No real account or credential store access.
import {mkdtempSync,rmSync,mkdirSync,readdirSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import {poll} from './poll.mjs';
import { launchAux } from './launch.mjs';
const root=resolve(import.meta.dirname,'../..');
const dir=mkdtempSync(join(tmpdir(),'aux-http-auth-'));
const password='synthetic-password-aux-74931';
const expected='Basic '+Buffer.from('fixture:'+password).toString('base64');
const server=createServer((req,res)=>{
 if(req.url.startsWith('/protected')&&req.headers.authorization!==expected){res.writeHead(401,{'WWW-Authenticate':'Basic realm="Aux protected fixture"'});res.end('Sign-in required');return;}
 res.setHeader('Content-Type','text/html');res.end('<title>Protected fixture</title><h1>Welcome fixture</h1>');
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://localhost:${server.address().port}`,other=`http://127.0.0.1:${server.address().port}`;
let app;
try{
 let page;({ app, page } = await launchAux({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}}));page.setDefaultTimeout(15000);await page.locator('.aux-home').waitFor();
 await app.evaluate(({BaseWindow})=>BaseWindow.getAllWindows()[0].setSize(1200,944));
 // Opening may remain pending until the HTTP authentication callback completes.
 const opening=page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),base+'/protected').catch(()=>null);
 let dialog=page.getByRole('dialog',{name:'Sign in to website',exact:true});await dialog.waitFor();
 assert.equal(await dialog.locator('.http-auth-origin').innerText(),base);
 await dialog.getByLabel('Username',{exact:true}).fill('fixture');await dialog.getByLabel('Password',{exact:true}).fill('wrong');
 await dialog.getByRole('button',{name:'Sign in',exact:true}).click();await dialog.getByText('The previous credentials were not accepted. Try again.').waitFor();
 assert.equal(await dialog.getByLabel('Password',{exact:true}).inputValue(),'');
 await dialog.getByLabel('Password',{exact:true}).fill(password);
 await page.reload();await dialog.waitFor();assert.equal(await dialog.getByLabel('Password',{exact:true}).inputValue(),'','shell reload keeps request but discards typed credentials');
 await dialog.getByLabel('Username',{exact:true}).fill('fixture');await dialog.getByLabel('Password',{exact:true}).fill(password);
 await dialog.getByRole('button',{name:'Sign in',exact:true}).click();await dialog.waitFor({state:'hidden'});await opening;
 await poll(page,async base=>(await window.aux.invoke('pages.list',{})).some(p=>p.url===base+'/protected'&&!p.loading),base);
 assert.equal(await app.evaluate(async({webContents},base)=>webContents.getAllWebContents().find(w=>w.getURL()===base+'/protected').executeJavaScript('document.querySelector("h1").textContent'),base),'Welcome fixture');
 const cancelled=page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),other+'/protected').catch(()=>null);
 await dialog.waitFor();const request=(await page.evaluate(()=>window.aux.httpAuthRequests()))[0];
 mkdirSync(join(root,'release/test-artifacts'),{recursive:true});await page.screenshot({path:join(root,'release/test-artifacts/aux-http-auth.png')});
 await dialog.getByRole('button',{name:'Cancel',exact:true}).click();await dialog.waitFor({state:'hidden'});await cancelled;
 await assert.rejects(page.evaluate(id=>window.aux.respondHttpAuth(id,{username:'fixture',password:'late'}),request.id),/ended/);
 const previousContents=await app.evaluate(({webContents})=>webContents.getAllWebContents().map(w=>w.id));
 const leaving=page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),other+'/protected?again').catch(()=>null);
 await dialog.waitFor();
 await app.evaluate(async({webContents},{other,previousContents})=>{const wc=webContents.getAllWebContents().find(w=>!previousContents.includes(w.id));if(!wc)throw new Error('Missing new protected page');await wc.loadURL(other+'/public')},{other,previousContents});
 await dialog.waitFor({state:'hidden'});await leaving;assert.deepEqual(await page.evaluate(()=>window.aux.httpAuthRequests()),[]);
 await app.close();app=null;
 function check(path){for(const entry of readdirSync(path,{withFileTypes:true})){const child=join(path,entry.name);if(entry.isDirectory())check(child);else if(entry.isFile()){const data=readFileSync(child);assert.equal(data.includes(Buffer.from(password)),false,`credential leaked into ${entry.name}`);assert.equal(data.includes(Buffer.from(expected)),false,`auth header leaked into ${entry.name}`)}}}
 check(join(dir,'data'));
 console.log('Protected-page sign-in, rejected credentials/retry, shell-reload recovery, cancellation, stale-response rejection, navigation cancellation and no runtime-data credential persistence pass.');
}finally{await app?.close();server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
