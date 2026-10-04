import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
let target,receipt,reason,calls=0;
const replacement=mock.module('./lib/mounted-image-appearance.mjs',{exports:{captureMountedImageAppearance:async t=>{calls++;assert.equal(t,target);if(reason)throw reason;return receipt}}});
const {journey,run,requireMountedImageAppearance,MOUNTED_IMAGE_APPEARANCE_ID}=await import('./appearance-journeys/mounted-image-appearance.mjs');
test('closed ID requires appearance and external pair request; ordinary and malformed routes refuse',()=>{
 requireMountedImageAppearance({journeyId:MOUNTED_IMAGE_APPEARANCE_ID,appearance:true,pair:'/original/approved-request.json'});
 for(const value of [{journeyId:'first-chat',appearance:true,pair:'x'},{journeyId:MOUNTED_IMAGE_APPEARANCE_ID,appearance:false,pair:'x'},{journeyId:MOUNTED_IMAGE_APPEARANCE_ID,appearance:true},{journeyId:MOUNTED_IMAGE_APPEARANCE_ID,appearance:true,pair:{}},{journeyId:MOUNTED_IMAGE_APPEARANCE_ID,appearance:true,pair:''}])assert.throws(()=>requireMountedImageAppearance(value));
});
test('wrapper preserves original UI step receipt limitations, original context and global deadline metadata',async()=>{
 calls=0;reason=undefined;receipt={ax:{original:true},rpc:{original:true},qualification:'none',privateImageIdentity:'unobserved',status:'observed-visual-only'};let observed;
 target={appearanceEnabled:true,step:async(name,options,action)=>{assert.equal(options.kind,'ui');assert.deepEqual(options.features,['electronMigration']);assert.ok(name.includes('visual states'));observed=await action()}};
 await run(target);assert.equal(calls,1);assert.equal(observed,receipt);assert.equal(observed.qualification,'none');assert.equal(observed.privateImageIdentity,'unobserved');
 assert.equal(journey.timeoutMs,150000);assert.deepEqual(journey.launch,{});assert.equal(journey.model,'loopback');assert.deepEqual(journey.needs,['accessibility','screen-recording']);assert.equal(journey.devAcceptance,undefined);
});
test('ordinary wrapper refuses before a step and original helper primary+cleanup rejection propagates intact',async()=>{
 calls=0;await assert.rejects(run({appearanceEnabled:false,step:()=>assert.fail('ordinary step')}));assert.equal(calls,0);
 reason=new AggregateError([new Error('primary'),new Error('original file debt')],'original debt');target={appearanceEnabled:true,step:async(_n,_o,action)=>action()};await assert.rejects(run(target),error=>error===reason);assert.equal(calls,1);
});
process.on('exit',()=>replacement.restore());
