import { createWork } from './in-app-profiles.mjs';
export const journey={id:'link-routing',title:'External rule selection, native Profile delivery and in-app trust exclusions',features:['linkRouting'],devAcceptance:['linkRouting','profiles','spaces','littleWindow'],needs:['accessibility','screen-recording'],model:'none',launch:{},timeoutMs:120_000,owner:'L6'};
export async function run(t) {
  let work;
  await t.step('create routing destination',{kind:'ui',features:['linkRouting']},async()=>{work=await createWork(t);await t.ax.key('command+,','hid');await t.ax.press({name:'Link Routing',scope:'shell',index:0});return {ax:await t.ax.dump(),rpc:{destination:work.profile.id}};});
  await t.step('create exact-host rule through editor and test precedence',{kind:'ui',features:['linkRouting']},async()=>{
    await t.ax.press({name:'Add rule',scope:'shell',index:0});
    await t.ax.type('127.0.0.1',{name:'Routing pattern',scope:'shell',index:0});
    await t.ax.press({name:'Destination Profile',scope:'shell',index:0});await t.ax.key('w','hid');await t.ax.key('return','hid');
    await t.ax.press({name:'Save rule',scope:'shell',index:0});
    await t.ax.press({name:'Links opened inside Aux',scope:'shell',index:0}); await t.ax.key('end','hid'); await t.ax.key('return','hid');
    await t.ax.type(`${t.fixture.url}/red`,{name:'URL to test',scope:'shell',index:0});await t.ax.press({name:'Test',scope:'shell',index:0});
    await t.ax.waitFor({name:work.profile.id,match:'contains',scope:'shell'});
    return {ax:await t.ax.dump(),rpc:{ruleDestination:work.profile.id}};
  });
  await t.step('native external receipt delivers only to Work',{kind:'rpc',features:['linkRouting']},async()=>{
    const prior=new Set((await work.rpc('pages.list')).map(page=>page.pageId));
    await t.app.openExternal(`${t.fixture.url}/red`);
    const opened=await t.until('routed Work page',async()=>(await work.rpc('pages.list')).find(page=>!prior.has(page.pageId)&&page.url===`${t.fixture.url}/red`));
    await t.assert.rejects(t.rpc('pages.observe',{pageId:opened.pageId}),{code:'target_detached'});
    return {rpc:{pageId:opened.pageId,profile:work.profile.id,crossRuntimeObserveDenied:true}};
  });
  const remove=t.fixture.route('/routing-opener',(_req,res)=>res.end(`<title>Opener preservation</title><a target="_blank" rel="noopener" href="${t.fixture.url}/blue">Cross-site new tab</a><button onclick="window.child=window.open('/red','oauth');document.querySelector('output').textContent=child?'Opener retained':'Failed'">OAuth popup</button><output></output><form method="post" action="/routing-post" target="_blank"><button>Submit POST</button></form>`));
  const post=t.fixture.route('/routing-post',(req,res)=>res.end(`<title>POST preserved</title><p>${req.method}</p>`),{method:'POST'});
  try {
    const sourceUrl=`${t.fixture.url.replace('127.0.0.1','localhost')}/routing-opener`;
    const page=await t.rpc('pages.open',{url:sourceUrl,activate:true});
    await t.step('different-site gesture without opener routes to Work',{kind:'ui',features:['linkRouting']},async()=>{
      const previous=new Set((await work.rpc('pages.list')).map(page=>page.pageId));
      await t.ax.press({name:'Cross-site new tab',scope:'page',index:0});
      const opened=await t.until('Work cross-site page',async()=>(await work.rpc('pages.list')).find(page=>!previous.has(page.pageId)&&page.url===`${t.fixture.url}/blue`));
      await t.assert.rejects(t.rpc('pages.observe',{pageId:opened.pageId}),{code:'target_detached'});
      return {ax:await t.ax.dump(),rpc:{pageId:opened.pageId,profile:work.profile.id}};
    });
    await t.rpc('pages.activate',{pageId:page.pageId});
    await t.step('opener and POST new tabs remain in initiating Profile',{kind:'ui',features:['linkRouting']},async()=>{
    await t.ax.press({name:'OAuth popup',scope:'page',index:0});
    await t.until('retained opener',async()=>/Opener retained/.test(JSON.stringify(await t.rpc('pages.observe',{pageId:page.pageId}))));
    await t.ax.press({name:'Submit POST',scope:'page',index:0});
    await t.until('POST target retained',async()=>(await t.rpc('pages.list')).some(page=>page.url===`${t.fixture.url.replace('127.0.0.1','localhost')}/routing-post`));
    return {ax:await t.ax.dump(),rpc:{openerRetained:true,postRetained:true,profile:'default'}};
  });}finally{remove();post();}
}
