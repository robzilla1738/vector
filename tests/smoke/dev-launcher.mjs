// Exercise the same startup path as pnpm dev with synthetic data and no secrets.
import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdtempSync,readFileSync,writeFileSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
const root=resolve(import.meta.dirname,'../..');
const {chromium}=createRequire(join(root,'packages/chromium-driver/package.json'))('playwright-core');
const dir=mkdtempSync(join(tmpdir(),'aux-dev-start-'));
const env={PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'};
let child,browser,output='';
const preload=join(root,'apps/desktop/dist/preload/index.cjs');
const previousPreload=readFileSync(preload);
const stale='throw new Error("Aux stale preload sentinel");';
writeFileSync(preload,stale);

const server=createServer((req,res)=>res.end('<title>Aux development navigation</title><h1>Ready to browse</h1>'));
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const start=()=>{output='';child=spawn(process.execPath,['scripts/dev.mjs','--electron','--use-mock-keychain'],{cwd:root,env,stdio:['ignore','pipe','pipe']});child.stdout.on('data',d=>output+=d);child.stderr.on('data',d=>output+=d);return new Promise(r=>child.once('exit',(code,signal)=>r({code,signal})));};
try {
 const exited=start();
 const deadline=Date.now()+60000;const portFile=join(dir,'data','devtools-port');
 while(!existsSync(portFile)) {assert.equal(child.exitCode,null,output);assert.ok(Date.now()<deadline,output);await new Promise(r=>setTimeout(r,100));}
 browser=await chromium.connectOverCDP(`http://127.0.0.1:${readFileSync(portFile,'utf8')}`);
 let page;
 while(!page){page=browser.contexts().flatMap(c=>c.pages()).find(p=>p.url().startsWith('http://127.0.0.1:5197/'));assert.ok(Date.now()<deadline,output);if(!page)await new Promise(r=>setTimeout(r,100));}
 await page.locator('.aux-home').waitFor();
 assert.ok(!readFileSync(preload,'utf8').includes('Aux stale preload sentinel'),'launch must regenerate its entrypoints from source');
 assert.equal(await page.locator('img.aux-mark').evaluate(img=>img.complete&&img.naturalWidth>0),true);
 await page.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),`http://127.0.0.1:${server.address().port}/`);
 await page.getByText('Aux development navigation',{exact:true}).first().waitFor();
 assert.ok(!output.includes('fixtures up'),'normal browser launch should not start fixture servers');
 await browser.close();browser=null;child.kill('SIGTERM');await exited;
 // Occupied renderer port must stop startup, not attach Aux to an unrelated server.
 const occupied=createServer((req,res)=>res.end('Unrelated local server'));
 await new Promise(r=>occupied.listen(5197,'127.0.0.1',r));
 try {const failed=await start();assert.equal(failed.code,1,output);assert.match(output,/Aux could not start/);assert.ok(!output.includes('Aux desktop (Chromium-first)'));}finally{await new Promise(r=>occupied.close(r));}
 console.log('Development startup, artwork loading, browsing, shutdown and occupied-port failure verified.');
} finally {if(readFileSync(preload,'utf8')===stale)writeFileSync(preload,previousPreload);await browser?.close();child?.kill('SIGTERM');server.closeAllConnections();await new Promise(r=>server.close(r));rmSync(dir,{recursive:true,force:true});}
