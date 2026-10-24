import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {SourceTextModule} from 'node:vm';
import {pathToFileURL} from 'node:url';
import {createAuxFeatureSettingsSession,transformAuxBrowserFeatureSettings,FEATURE_SETTINGS_ASSETS} from './aux-browser-feature-settings.mjs';
import {transformAuxThemeEditor} from './aux-theme-editor.mjs';
import {transformAuxRoutingSettings} from './aux-browser-routing.mjs';
const {transformAuxNavigation}=await import(process.env.AUX_NAVIGATION_ADAPTER?pathToFileURL(process.env.AUX_NAVIGATION_ADAPTER):new URL('./aux-navigation-command-bar.mjs',import.meta.url));
const sourceRoot=process.env.AUX_SUPPLIED_SOURCE_ROOT??'/Users/rcourson/Documents/Vibe/web/out/provided-source-snapshot-1.26.1016.1852/agent';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return{promise,resolve}};
const state=(revision='1',enabled=false,ownerGeneration='owner-a')=>({success:true,revision,ownerGeneration,cleanup:{enabled,inactivityDays:30}});

test('final adapter composes against pinned supplied owners, retains their bytes/classes and rejects drift',async()=>{
  for(const [key,hash] of [['appearance','5d6795dc6c007d961e8960cc41e6825634be81da00d023e179647bc22e20f318'],['general','e57dcde064f8872f2d8250123778924174deb2256d161b175cca751ef57f5ea4']]){
    const relative=FEATURE_SETTINGS_ASSETS[key],original=await readFile(`${sourceRoot}/${relative}`,'utf8');
    assert.equal(createHash('sha256').update(original).digest('hex'),hash);
    let text=original;
    for(const transform of [transformAuxNavigation,transformAuxThemeEditor,transformAuxRoutingSettings])text=transform({relative,text}).text;
    const result=transformAuxBrowserFeatureSettings({relative,text});
    assert.equal(result.anchors.length,2);new SourceTextModule(result.text);
    let restored=result.text;for(const anchor of [...result.anchors].reverse())restored=restored.replace(anchor.replace,anchor.find);
    assert.equal(restored,text); // Existing styles and component bodies untouched.
    assert.ok(!result.text.includes('<style'));
    assert.throws(()=>transformAuxBrowserFeatureSettings({relative,text:original}),/pinned anchor/);
    assert.throws(()=>transformAuxBrowserFeatureSettings({relative,text:result.text}),/pinned anchor/);
  }
});

test('cleanup publishes only after real commit and reread, and uses the refreshed CAS revision',async()=>{
  const receipt=deferred(),requests=[],states=[],errors=[];let current=state();
  const client=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>current,
    setOrganizationCleanupPolicy:async request=>{requests.push(request);if(requests.length===1)await receipt.promise;current=state(String(Number(current.revision)+1),request.enabled);return{success:true,revision:current.revision}}},'cleanup',s=>states.push(s),e=>errors.push(e));
  await client.load();const pending=client.save({enabled:true,inactivityDays:30});
  assert.equal(states.length,1);assert.equal(states[0].cleanup.enabled,false);
  await assert.rejects(client.save({enabled:false,inactivityDays:30}),/already in progress/);
  receipt.resolve();await pending;await client.save({enabled:false,inactivityDays:30});
  assert.deepEqual(requests.map(r=>[r.ownerGeneration,r.expectedRevision]),[['owner-a','1'],['owner-a','2']]);
  assert.deepEqual(states.map(s=>s.cleanup.enabled),[false,true,false]);assert.deepEqual(errors,[]);
});

test('conflict refreshes revision but refuses success; a changed owner cannot be silently adopted',async()=>{
  let current=state(),request,fail=true;const errors=[];
  const client=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>current,
    setOrganizationCleanupPolicy:async r=>{request=r;if(fail){current=state('9');return{success:false,error:'Settings changed in another window'}}return{success:true,revision:'10'}}},'cleanup',()=>{},e=>errors.push(e));
  await client.load();await assert.rejects(client.save({enabled:true,inactivityDays:30}),/another window/);
  fail=false;current=state('10',true,'owner-b');
  await assert.rejects(client.save({enabled:true,inactivityDays:30}),/Profile changed/);
  assert.equal(request.expectedRevision,'9');assert.equal(request.ownerGeneration,'owner-a');
  await assert.rejects(client.save({enabled:true,inactivityDays:30}),/Reload settings/);
  assert.equal(errors.length,2);
});

test('closing during an in-flight write cannot republish state or issue a follow-up read',async()=>{
  const receipt=deferred(),states=[];let reads=0,writes=0;
  const client=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>{reads++;return state()},
    setOrganizationCleanupPolicy:async()=>{writes++;return receipt.promise}},'cleanup',s=>states.push(s),()=>{});
  await client.load();const pending=client.save({enabled:true,inactivityDays:30});client.close();
  receipt.resolve({success:true,revision:'2'});await pending;
  assert.equal(reads,1);assert.equal(writes,1);assert.equal(states.length,1);
  await assert.rejects(client.save({enabled:false,inactivityDays:30}),/closed/);
});

test('frame changes are native partial writes; invalid cleanup values do not reach native code',async()=>{
  let current={success:true,sidebarNavigation:false,minimal:false,peekLinks:false};const requests=[],errors=[];
  const client=createAuxFeatureSettingsSession({getFramePresentation:async()=>current,setFramePresentation:async patch=>{
    requests.push(patch);current={...current,...patch};return current}},'frame',()=>{},e=>errors.push(e));
  await client.load();await client.save({peekLinks:true});assert.deepEqual(requests,[{peekLinks:true}]);
  await assert.rejects(client.save({minimal:'true'}),/Invalid/);
  const cleanup=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>state(),setOrganizationCleanupPolicy:()=>assert.fail('invalid native write')},'cleanup',()=>{},()=>{});
  await cleanup.load();for(const inactivityDays of [0,3651,1.5,NaN,'30'])await assert.rejects(cleanup.save({enabled:true,inactivityDays}),/whole number/);
});


test('cleanup scope uses native Space IDs, refuses invalid selections and preserves older caller scope',async()=>{
  const main='00000000-0000-4000-8000-000000000001',work='00000000-0000-4000-8000-000000000002';
  const spaces=[{id:main,name:'Personal',order:0},{id:work,name:'Work',order:1}];
  let current={...state(),spaces,cleanup:{enabled:false,inactivityDays:30,spaceIds:[work]}};
  const requests=[];
  const client=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>current,
    setOrganizationCleanupPolicy:async request=>{
      requests.push(request);
      current={...current,revision:String(Number(current.revision)+1),cleanup:{...current.cleanup,
        enabled:request.enabled,inactivityDays:request.inactivityDays,
        ...(Object.hasOwn(request,'spaceIds')?{spaceIds:request.spaceIds}:{})}};
      return{success:true};
    }},'cleanup',()=>{},()=>{});
  await client.load();
  await client.save({enabled:true,inactivityDays:14});
  assert.equal(Object.hasOwn(requests[0],'spaceIds'),false);
  assert.deepEqual(current.cleanup.spaceIds,[work]);
  for(const spaceIds of [[],[main,main],['wrong-profile'],[main,...Array(1024).fill(work)],'all'])
    await assert.rejects(client.save({enabled:true,inactivityDays:14,spaceIds}),/available Space/);
  assert.equal(requests.length,1);
  await client.save({enabled:true,inactivityDays:14,spaceIds:[main]});
  assert.deepEqual(current.cleanup.spaceIds,[main]);
  assert.equal(requests[1].expectedRevision,'2');
  await client.save({enabled:true,inactivityDays:14,spaceIds:null});
  assert.equal(current.cleanup.spaceIds,null);
});

test('cleanup refuses a saved scope outside the actual profile and a concurrently removed selected Space',async()=>{
  const main='00000000-0000-4000-8000-000000000001',work='00000000-0000-4000-8000-000000000002';
  let current={...state(),spaces:[{id:main,name:'Personal'}],cleanup:{enabled:true,inactivityDays:30,spaceIds:[work]}};
  const invalid=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>current},'cleanup',()=>{},()=>{});
  await assert.rejects(invalid.load(),/Invalid tab cleanup/);
  current={...state(),spaces:[{id:main,name:'Personal'},{id:work,name:'Work'}],cleanup:{enabled:true,inactivityDays:30,spaceIds:[work]}};
  let writes=0;
  const client=createAuxFeatureSettingsSession({getOrganizationSettings:async()=>current,
    setOrganizationCleanupPolicy:async()=>{writes++;current={...current,revision:'2',spaces:[{id:main,name:'Personal'}],
      cleanup:{enabled:false,inactivityDays:30,spaceIds:[]}};return{success:false,error:'Organization changed'}}},'cleanup',()=>{},()=>{});
  await client.load();
  await assert.rejects(client.save({enabled:true,inactivityDays:30,spaceIds:[work]}),/Organization changed/);
  await assert.rejects(client.save({enabled:true,inactivityDays:30,spaceIds:[work]}),/available Space/);
  assert.equal(writes,1);
});
