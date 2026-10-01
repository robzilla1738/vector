import { openUrl, openRequest, profileListing, discoverProfiles } from '../../../packages/cli/dist/open.js';
import { createWork } from './in-app-profiles.mjs';
export const journey={id:'cli-open',title:'CLI metadata, selection and actual cold LaunchServices wait',features:['cliOpen'],devAcceptance:['cliOpen','profiles','spaces','linkRouting'],needs:['accessibility','screen-recording'],model:'none',launch:{},timeoutMs:120_000,owner:'L6'};
export async function run(t){
 let work;
 await t.step('prepare Work and its Space through Profile UI',{kind:'ui',features:['cliOpen']},async()=>{work=await createWork(t);return {ax:await t.ax.dump(),rpc:{profile:work.profile.id}};});
 const profile=await t.until('mirrored Work Space',async()=>discoverProfiles(t.app.userDataDir).find(item=>item.id===work.profile.id&&item.spaces.length));
 const space=profile.spaces[0];
 await t.step('read-only Profile discovery and selection refusals',{kind:'rpc',features:['cliOpen']},async()=>{
   const listing=await profileListing(t.app.userDataDir);t.assert.ok(listing.some(item=>item.id===work.profile.id&&item.running));
   t.assert.throws(()=>openRequest(`${t.fixture.url}/red`,{profile:'missing'},discoverProfiles(t.app.userDataDir)),/Unknown Profile/);
   t.assert.throws(()=>openRequest('javascript:alert(1)',{},discoverProfiles(t.app.userDataDir)));
   return {rpc:{listing,invalidSelectionsRefused:true}};
 });
 await t.step('cold CLI open waits for the real Work runtime and Space',{kind:'rpc',features:['cliOpen']},async()=>{
   const result=await openUrl(`${t.fixture.url}/red`,{profile:work.profile.id,space:space.id,wait:true},t.app.userDataDir,(url,background)=>t.openAux(url,{cold:true,background}));
   t.assert.equal(result.profile,work.profile.id);t.assert.equal(result.spaceId,space.id);t.assert.ok(result.pageId);
   return {rpc:{...result,coldLaunch:true}};
 });
 await t.step('warm CLI Little and background delivery keeps exact Profile',{kind:'rpc',features:['cliOpen']},async()=>{
   const result=await openUrl(`${t.fixture.url}/blue`,{profile:work.profile.id,space:space.id,little:true,background:true,wait:true},t.app.userDataDir,(url,background)=>t.openAux(url,{cold:false,background}));
   t.assert.equal(result.profile,work.profile.id);t.assert.equal(result.spaceId,space.id);return {rpc:result};
 });
}
