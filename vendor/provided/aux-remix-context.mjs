import {createHash} from 'node:crypto';
export async function prepareRemixContext(args,sender,deps) {
  if(sender?.id!==deps.extensionId||sender.frameId!==0||
      typeof sender.documentId!=='string'||!sender.documentId||
      !Number.isInteger(sender.tab?.id)||!Number.isInteger(sender.tab?.windowId))
    throw Error('Remix must start from the current top-level page.');
  if(!args||typeof args!=='object'||!Array.isArray(args.attachments??[]))throw Error('Invalid Remix request.');
  const origin={tabId:sender.tab.id,windowId:sender.tab.windowId,documentId:sender.documentId};
  const attachments=[...args.attachments??[]],references=attachments.filter(item=>item?.type==='tab')
    .map(({targetId,url,documentCapability})=>({targetId,url,documentCapability}));
  if(references.length>63||references.some(item=>!item.targetId||!item.url||!item.documentCapability))
    throw Error('Select attached tabs again before using Remix.');
  const generation=deps.generation();
  // Invoke native capture synchronously, before awaited account/debugger work.
  // Native alone decides whether this worker has a real user gesture.
  const request=args.attachCurrentTab!==false
    ? deps.api.captureTabReferences({origin,references:[]})
    : deps.api.validateTabReferences({origin,references:[]});
  const initial=await request;
  if(!initial?.success||typeof initial.ownerGeneration!=='string'||
      typeof initial.targetId!=='string'||typeof initial.url!=='string')
    throw Error(initial?.error??'The originating Remix page is unavailable.');
  if(initial.url!==(sender.url||sender.tab.url)||generation!==deps.generation())
    throw Error('The originating Remix page or profile changed.');
  const account=await deps.account(),route=await deps.route();
  if(!Number.isSafeInteger(account.accountId)||!account.browserProfile?.profileId||
      route.accountId!==account.accountId||!route.profileId||generation!==deps.generation())
    throw Error('The originating Remix account changed.');
  const accountKey=value=>JSON.stringify([value.accountId,value.browserProfile?.profileId,
    value.browserProfile?.chromiumProfileId,value.browserProfile?.boundAccountId,
    value.browserProfile?.boundUserId,value.browserProfile?.profilePath]);
  const expectedAccount=accountKey(account),routeKey=value=>JSON.stringify([value.accountId,value.profileId,value.browserMode]);
  const expectedRoute=routeKey(route);
  if(args.attachCurrentTab!==false){
    const reference=initial.references?.[0];
    if(initial.references?.length!==1||reference.targetId!==initial.targetId||reference.url!==initial.url||!reference.documentCapability)
      throw Error('Could not capture the originating Remix page.');
    attachments.push({id:`tab:${initial.targetId}`,type:'tab',url:initial.url,
      name:sender.tab.title?.trim()||initial.url,targetId:initial.targetId,
      documentCapability:reference.documentCapability,faviconUrl:sender.tab.favIconUrl||undefined});
    references.push(reference);
  }
  const assertCurrent=async()=>{
    if(generation!==deps.generation()||accountKey(await deps.account())!==expectedAccount||
        routeKey(await deps.route())!==expectedRoute||generation!==deps.generation())
      throw Error('The originating Remix account changed.');
    const current=await deps.api.validateTabReferences({origin,ownerGeneration:initial.ownerGeneration,references});
    if(!current?.success||current.ownerGeneration!==initial.ownerGeneration||current.targetId!==initial.targetId||
        current.url!==initial.url||generation!==deps.generation())
      throw Error(current?.error??'The originating Remix page or attached context changed.');
  };
  await assertCurrent();
  return {origin,accountId:account.accountId,route,targetId:initial.targetId,attachments,assertCurrent};
}
export function transformAuxRemixContext({relative,text}) {
  const anchors=[];if(relative!=='background.js')return{text,anchors};
  const change=(find,replace,kind)=>{const count=text.split(find).length-1;if(count!==1)throw Error(`${kind}: expected one anchor, got ${count}`);anchors.push({kind,find,replace,count:1});text=text.replace(find,replace)};
  const start=text.indexOf('async function vb(e, t, r) {'),end=text.indexOf('\nfunction yb(e)',start);
  if(start<0||end<0)throw Error('Supplied Remix prompt handler is missing.');
  const original=text.slice(start,end);
  if(createHash('sha256').update(original).digest('hex')!=="af481bb9b0e6536a6683d9fe74a168f4349f96daa11e30e1fd027f4c8ebcaee7")throw Error('Pinned supplied Remix handler changed.');
  if(!original.includes('const n = t.tab;')||!original.includes('v = await D.sessions.createAndPrompt.mutate({'))throw Error('Supplied Remix prompt contract changed.');
  const replacement=`async function vb(e,t,r){
 const context=await prepareRemixContext(e,t,{extensionId:chrome.runtime.id,api:chrome.auxBrowserPreferences,
   generation:()=>JSON.stringify([Lt,_n]),account:()=>Xa(),route:()=>nc()});
 const {origin,accountId:s,route,targetId:l,attachments:d}=context,o=origin.tabId,i=origin.windowId,a=route.profileId,c=route.browserMode;
 const h=Date.now(),g=[...d.length>0?[{role:"user-message-metadata",attachments:d,timestamp:h-1}]:[],{role:"user",content:e.prompt,timestamp:h}];
 await context.assertCurrent();
 const v=await D.sessions.createAndPrompt.mutate({accountId:s,title:e.title,trigger:e.trigger??{type:"user",source:"remix"},activeTabTargetId:l,
   browserBinding:{profileId:a,browserMode:c,windowId:i,anchorTargetId:l},message:g});
 await context.assertCurrent();
 if(e.openSidepanel!==false){await r;await context.assertCurrent();await Vn(ub(s,l),v.id);await context.assertCurrent();await chrome.sidePanel.setOptions({tabId:o,path:\`sidepanel.html#/u/\${s}/sidepanel?sessionId=\${v.id}\`})}
 return{ok:true,sessionId:v.id};
}`;
  change(original,replacement,'aux-remix-origin-bound-session');
  // Observe immediate native side-panel refusal while the capture/account awaits.
  change('return vb(t.args, r, s).catch(o).then(n), !0;',
    's.catch(()=>{});return vb(t.args, r, s).catch(o).then(n), !0;','aux-remix-observe-panel-promise');
  const append='\n'+prepareRemixContext.toString()+'\n';text+=append;anchors.push({kind:'aux-remix-context-helper',append,count:1});
  return{text,anchors};
}
