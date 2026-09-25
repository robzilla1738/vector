import { expandedSidebar } from "./sidebar-action.mjs";
// Cross-origin sign-in and link-disposition journey using only isolated local sites.
import {poll} from './poll.mjs';
import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createServer} from 'node:http';
import assert from 'node:assert/strict';
import { launchAux } from './launch.mjs';

const dir=mkdtempSync(join(tmpdir(),'aux-auth-navigation-'));
let rpBase='';let idpBase='';let consentCookie='';
const rp=createServer((req,res)=>{
  res.setHeader('Content-Type','text/html');
  if(req.url?.startsWith('/callback')){
    const url=new URL(req.url,rpBase);res.setHeader('Set-Cookie','rp_session=synthetic; SameSite=Lax; Path=/');
    res.end(`<title>Signed in</title><body data-state="${url.searchParams.get('state')??''}">Signed in<script>opener.postMessage('sso-complete',${JSON.stringify(rpBase)});window.close()</script></body>`);return;
  }
  if(req.url==='/background') {res.end('<title>Background destination</title><body data-referrer=""><script>document.body.dataset.referrer=document.referrer</script></body>');return;}
  res.end('<title>Relying party</title><body style="padding-top:80px"><a id="background" href="/background" target="_blank">Open background</a><output></output><script>addEventListener("message",event=>{if(event.origin===location.origin)document.querySelector("output").textContent=event.data})</script>');
});
const idp=createServer((req,res)=>{
  res.setHeader('Content-Type','text/html');
  const url=new URL(req.url??'/',idpBase);
  if(url.pathname==='/authorize'){
    res.statusCode=302;res.setHeader('Set-Cookie','idp_session=synthetic; SameSite=Lax; Path=/');res.setHeader('Location',`/consent?callback=${encodeURIComponent(url.searchParams.get('callback')??'')}&state=${encodeURIComponent(url.searchParams.get('state')??'')}`);res.end();return;
  }
  if(url.pathname==='/consent'){
    consentCookie=req.headers.cookie??'';
    const callback=url.searchParams.get('callback')??'';const state=url.searchParams.get('state')??'';
    res.end(`<title>Identity provider</title><body data-referrer=""><button id="continue">Continue</button><script>document.body.dataset.referrer=document.referrer;document.querySelector('#continue').onclick=()=>location.href=${JSON.stringify(callback)}+'?state='+encodeURIComponent(${JSON.stringify(state)})</script></body>`);return;
  }
  res.end('<title>Identity provider landing</title><body data-referrer=""><script>document.body.dataset.referrer=document.referrer</script></body>');
});
await new Promise(r=>rp.listen(0,'127.0.0.1',r));rpBase=`http://127.0.0.1:${rp.address().port}`;
await new Promise(r=>idp.listen(0,'127.0.0.1',r));idpBase=`http://127.0.0.1:${idp.address().port}`;
let app;
try{
 const mark=step=>console.log(`auth-navigation: ${step}`);
 let shell;({ app, page: shell } = await launchAux({args:['--use-mock-keychain'],env:{PATH:process.env.PATH,HOME:dir,TMPDIR:dir,AUX_PROFILE_DIR:join(dir,'profile'),AUX_DATA_DIR:join(dir,'data'),AUX_LOAD_DOTENV:'0'}}));shell.setDefaultTimeout(15000);await shell.locator('.aux-home').waitFor();
 await expandedSidebar(shell);
 const opener=await shell.evaluate(url=>window.aux.invoke('pages.open',{url,activate:true}),rpBase+'/');
 await poll(shell,async id=>(await window.aux.invoke('pages.list',{})).some(page=>page.pageId===id&&!page.loading),opener.pageId);
 mark('relying party ready');
 const execute=(url,code)=>app.evaluate(({webContents},{url,code})=>webContents.getAllWebContents().find(contents=>contents.getURL()===url)?.executeJavaScript(code),{url,code});

 // A native middle-click must create a background tab and preserve the selected tab.
 const relyingParty=app.windows().find(page=>page.url()===rpBase+'/');
 assert.ok(relyingParty,'relying-party page must be attached to the native view');
 await relyingParty.getByRole('link',{name:'Open background'}).click({button:'middle'});
 mark('middle click sent');
 await poll(app,({webContents},suffix)=>webContents.getAllWebContents().some(contents=>contents.getURL().endsWith(suffix)),'/background');
 mark('background tab attached');
 await shell.locator('.tab-row').filter({hasText:'Background destination'}).waitFor();
 assert.match(await shell.locator('.tab-row.active').textContent(),/Relying party/,'background link must not steal selection');
 mark('background selection retained');
 assert.equal(await execute(rpBase+'/background','document.body.dataset.referrer'),rpBase+'/','same-origin background link keeps its referrer');
 mark('background link ready');

 // A cross-origin adopted tab keeps browser referrer policy and opener semantics.
 await execute(rpBase+'/',`window.cross=window.open(${JSON.stringify(idpBase+'/landing')},'cross');void 0`);
 await poll(app,({webContents},url)=>webContents.getAllWebContents().some(contents=>contents.getURL()===url),idpBase+'/landing');
 await shell.locator('.tab-row').filter({hasText:'Identity provider landing'}).waitFor();
 assert.equal(await execute(idpBase+'/landing','document.body.dataset.referrer'),rpBase+'/');
 assert.equal(await execute(idpBase+'/landing','!!window.opener'),true);
 await execute(idpBase+'/landing','window.close()');
 await poll(app,({webContents},url)=>!webContents.getAllWebContents().some(contents=>contents.getURL()===url),idpBase+'/landing');
 await shell.waitForFunction(()=>document.querySelector('.tab-row.active')?.textContent?.includes('Relying party'));
 mark('cross-origin adopted tab ready');

 // Representative SSO: cross-origin popup, redirect-set IdP cookie, state round-trip,
 // callback cookie in the shared profile and opener notification.
 const authorize=`${idpBase}/authorize?callback=${encodeURIComponent(rpBase+'/callback')}&state=synthetic-state`;
 await execute(rpBase+'/',`window.sso=window.open(${JSON.stringify(authorize)},'sso','popup,width=520,height=640');void 0`);
 await poll(app,({BrowserWindow},prefix)=>BrowserWindow.getAllWindows().some(window=>window.webContents.getURL().startsWith(prefix)),idpBase+'/consent');
 assert.match(consentCookie,/idp_session=synthetic/,'IdP redirect receives its SameSite cookie');
 let consent;for(let i=0;i<80;i++){consent=app.windows().find(page=>page.url().startsWith(idpBase+'/consent'));if(consent)break;await new Promise(r=>setTimeout(r,250));}
 assert.ok(consent,'consent popup must be attached as a Playwright page');assert.equal(await consent.locator('body').getAttribute('data-referrer'),rpBase+'/');
 await consent.getByRole('button',{name:'Continue'}).click();
 await poll(app,async({webContents},url)=>{const contents=webContents.getAllWebContents().find(item=>item.getURL()===url);return contents?await contents.executeJavaScript('document.querySelector("output").textContent')==='sso-complete':false;},rpBase+'/');
 await poll(app,({BrowserWindow})=>BrowserWindow.getAllWindows().length===0);
 assert.match(await execute(rpBase+'/','document.cookie'),/rp_session=synthetic/,'callback cookie is shared with the relying-party tab');
 const cookies=await app.evaluate(({session},url)=>session.fromPartition('persist:aux-default').cookies.get({url}),idpBase);
 assert.ok(cookies.some(cookie=>cookie.name==='idp_session'&&cookie.value==='synthetic'));
 assert.match(await shell.locator('.tab-row.active').textContent(),/Relying party/,'SSO popup does not replace the selected relying-party tab');
 mark('SSO ready');
 console.log('Background links preserve selection; adopted tabs preserve referrer/opener; cross-origin SSO redirects, cookies, state and popup completion remain continuous.');
}catch(error){
 console.error('auth-navigation failed before cleanup',error);throw error;
}finally{
 await app?.close();rp.closeAllConnections();idp.closeAllConnections();await Promise.all([new Promise(r=>rp.close(r)),new Promise(r=>idp.close(r))]);rmSync(dir,{recursive:true,force:true});
}
