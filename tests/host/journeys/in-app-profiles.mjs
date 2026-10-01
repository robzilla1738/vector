import { createRpc } from '../lib/rpc.mjs';
import { discoverProfiles } from '../../../packages/cli/dist/open.js';
export const journey = {id:'in-app-profiles',title:'Profiles isolate cookies and runtime authority in one user-data directory',features:['profiles'],devAcceptance:['profiles','spaces'],needs:['accessibility','screen-recording'],model:'none',launch:{},timeoutMs:120_000,owner:'L6'};
export async function profileRuntime(t, name) {
  return t.until(`${name} descriptor ready`, async()=>{
    try {
      const profile = discoverProfiles(t.app.userDataDir).find(item=>item.name===name&&!item.archived);
      if(!profile)return false;
      const descriptor=await t.app.descriptor(profile.id,{timeoutMs:1000});
      const rpc=createRpc(descriptor), describe=await rpc('runtime.describe'), paired=await t.app.identity();
      t.assert.deepEqual(describe.runtimeIdentity,paired.runtime,'Profile runtime must match the actual clean candidate');
      t.assert.equal(describe.nativeIdentity?.sourceCommit,paired.native.sourceCommit);
      t.assert.equal(describe.nativeIdentity?.buildId,paired.native.buildId);
      return {profile,rpc,descriptor};
    } catch {return false;}
  },30_000);
}
export async function createWork(t, {acceptAfterCreation = true} = {}) {
  await t.ax.key('command+,','hid');
  await t.ax.waitFor({name:'Profiles',scope:'shell',index:0});
  await t.ax.press({name:'Profiles',scope:'shell',index:0});
  await t.ax.press({name:'New profile',scope:'shell',index:0});
  await t.ax.type('Work',{name:'Profile name',scope:'shell',index:0});
  await t.ax.press({name:'Create and open',scope:'shell',index:0});
  const created = await profileRuntime(t,'Work');
  const initial = await t.app.descriptor();
  t.assert.notEqual(created.descriptor.port,initial.port);
  t.assert.notEqual(created.descriptor.token,initial.token);
  return acceptAfterCreation ? acceptCreatedWork(t,created) : created;
}
export async function acceptCreatedWork(t, created) {
  // The runtime caches acceptance at startup. Only the actual UI-created Profile is eligible.
  t.app.acceptCreatedProfile(created.profile.id);
  await t.restart();
  const url = new URL('aux://open');
  url.search = new URLSearchParams({url:`${t.fixture.url}/red`,profile:created.profile.id,source:'cli'}).toString();
  await t.app.openAux(url.href);
  const ready = await profileRuntime(t,'Work');
  const personal = await t.app.descriptor();
  t.assert.notEqual(ready.descriptor.port,personal.port);
  t.assert.notEqual(ready.descriptor.token,personal.token);
  return ready;
}
export async function run(t) {
  const remove=t.fixture.route('/profile-account',(request,response)=>{const match=request.headers.cookie?.match(/fixture_account=([^;]+)/);response.end(`<title>Account ${match?.[1]??'none'}</title><p>Account ${match?.[1]??'none'}</p>`);});
  const personalSet=t.fixture.route('/profile-personal',(_request,response)=>{response.setHeader('Set-Cookie','fixture_account=personal; Path=/; HttpOnly; SameSite=Lax');response.end('<title>Personal cookie set</title>');});
  const moveFixture=t.fixture.route('/profile-move',(_request,response)=>response.end('<title>Move fixture</title><form><input aria-label=Draft></form>'));
  const workSet=t.fixture.route('/profile-work',(_request,response)=>{response.setHeader('Set-Cookie','fixture_account=work; Path=/; HttpOnly; SameSite=Lax');response.end('<title>Work cookie set</title>');});
  try {
    const personal=await t.rpc('pages.open',{url:`${t.fixture.url}/profile-personal`,activate:true});
    await t.until('Personal cookie fixture loaded',async()=>(await t.rpc('pages.list')).some(page=>page.pageId===personal.pageId&&!page.loading));
    const original=await t.app.descriptor();
    let work;
    await t.step('create Work through Profile Settings', {kind:'ui',features:['profiles']}, async()=>{
      work=await createWork(t,{acceptAfterCreation:false});
      t.assert.notEqual(work.descriptor.port,original.port);
      t.assert.notEqual(work.descriptor.token,original.token);
      return {ax:await t.ax.dump(),rpc:{profile:work.profile.id,separateRuntime:true}};
    });
    const cookie=await work.rpc('pages.open',{url:`${t.fixture.url}/profile-work`,activate:true});
    await t.until('Work cookie fixture loaded',async()=>(await work.rpc('pages.list')).some(page=>page.pageId===cookie.pageId&&!page.loading));
    const a=await t.rpc('pages.open',{url:`${t.fixture.url}/profile-account`,activate:false});
    const b=await work.rpc('pages.open',{url:`${t.fixture.url}/profile-account`,activate:true});
    await t.step('verify independent HttpOnly cookies and denied cross-runtime observation',{kind:'rpc',features:['profiles']},async()=>{
      await t.until('Personal account',async()=>/Account personal/.test(JSON.stringify(await t.rpc('pages.observe',{pageId:a.pageId}))));
      await t.until('Work account',async()=>/Account work/.test(JSON.stringify(await work.rpc('pages.observe',{pageId:b.pageId}))));
      await t.assert.rejects(t.rpc('pages.observe',{pageId:b.pageId}),{code:'target_detached'});
      await t.assert.rejects(work.rpc('pages.observe',{pageId:personal.pageId}),{code:'target_detached'});
      return {rpc:{independentCookieAccounts:true,crossRuntimeObserveDenied:true,userDataDirectoryCount:1}};
    });
    await t.step('restart actual Work with disposable development acceptance',{kind:'rpc',features:['profiles']},async()=>{
      work=await acceptCreatedWork(t,work);
      const personalAccount=await t.rpc('pages.open',{url:`${t.fixture.url}/profile-account`,activate:false});
      const workAccount=await work.rpc('pages.open',{url:`${t.fixture.url}/profile-account`,activate:true});
      await t.until('Personal cookie survives restart',async()=>/Account personal/.test(JSON.stringify(await t.rpc('pages.observe',{pageId:personalAccount.pageId}))));
      await t.until('Work cookie survives restart',async()=>/Account work/.test(JSON.stringify(await work.rpc('pages.observe',{pageId:workAccount.pageId}))));
      await t.assert.rejects(t.rpc('pages.observe',{pageId:workAccount.pageId}),{code:'target_detached'});
      return {rpc:{actualCreatedProfile:work.profile.id,restartLoadedAcceptance:true,persistedIndependentCookies:true}};
    });
    await t.step('move URL through registered tab command and unsaved-state confirmation',{kind:'ui',features:['profiles']},async()=>{
      const source=await work.rpc('pages.open',{url:`${t.fixture.url}/profile-move`,activate:true});
      await t.until('Move fixture loaded',async()=>(await work.rpc('pages.list')).some(page=>page.pageId===source.pageId&&!page.loading));
      await t.ax.type('Uncopied draft',{name:'Draft',scope:'page',index:0});
      await t.ax.contextMenu({name:'Move fixture',match:'contains',scope:'shell',index:0});
      await t.ax.press({name:'Move tab…',scope:'shell',index:0});
      const personalProfile=discoverProfiles(t.app.userDataDir).find(profile=>profile.id==='Default');
      await t.ax.press({name:`Move URL to ${personalProfile.name}`,scope:'shell',index:0});
      await t.ax.waitFor({name:'Open this URL in another Profile?',scope:'shell'});
      t.assert.match(JSON.stringify(await t.ax.dump()),/Unsaved changes and page state are not copied/);
      await t.ax.press({name:'Move URL',scope:'shell',index:0});
      const destination=await t.until('Personal URL reopened',async()=>(await t.rpc('pages.list')).find(page=>page.url===`${t.fixture.url}/profile-move`&&!page.loading));
      await t.until('Old Work source closed',async()=>!(await work.rpc('pages.list')).some(page=>page.pageId===source.pageId));
      await t.assert.rejects(work.rpc('pages.observe',{pageId:destination.pageId}),{code:'target_detached'});
      return {ax:await t.ax.dump(),rpc:{urlOnly:true,sourceClosedAfterDestinationOpened:true}};
    });
    await t.step('nested Profile Space menu and appearance controls',{kind:'ui',features:['profiles']},async()=>{
      await t.ax.press({name:'Choose Profile and Space',scope:'shell',index:0});
      await t.ax.waitFor({name:'Profiles and Spaces',scope:'shell'});
      t.assert.match(JSON.stringify(await t.ax.dump()),/Work/);
      await t.ax.press({name:'Close menu',scope:'shell',index:0});
      await t.ax.key('control+alt+2','hid');
      await t.until('Work title suffix',async()=>/ — Work/.test(JSON.stringify(await t.ax.dump())));
      await t.ax.press({name:'Choose Profile and Space',scope:'shell',index:0});
      await t.ax.press({name:'Manage Profiles…',scope:'shell',index:0});
      await t.ax.waitFor({name:'Color for Work',scope:'shell'});
      await t.ax.waitFor({name:'Icon for Work',scope:'shell'});
      return {ax:await t.ax.dump(),rpc:{profiles:discoverProfiles(t.app.userDataDir).map(({id,name})=>({id,name}))}};
    });
  } finally {remove();personalSet();workSet();moveFixture();}
}
