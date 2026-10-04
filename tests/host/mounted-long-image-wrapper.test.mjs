import {test,mock} from 'node:test';
import assert from 'node:assert/strict';
let original,receipt,reason,calls=0;
const replacement=mock.module('./lib/mounted-image-appearance.mjs',{exports:{captureLongNamedMountedImageAppearance:async t=>{calls++;assert.equal(t,original);if(reason)throw reason;return receipt}}});
const {journey,run,requireMountedLongImageAppearance,MOUNTED_LONG_IMAGE_APPEARANCE_ID}=await import('./appearance-journeys/mounted-long-image-appearance.mjs');
test('fixed long image dispatch requires exact appearance ID and original pair request',()=>{
 requireMountedLongImageAppearance({journeyId:MOUNTED_LONG_IMAGE_APPEARANCE_ID,appearance:true,pair:'/original/pair-request.json'});
 for(const delta of [{journeyId:'mounted-image-appearance'},{appearance:false},{pair:undefined},{pair:{}},{pair:''}])assert.throws(()=>requireMountedLongImageAppearance({journeyId:MOUNTED_LONG_IMAGE_APPEARANCE_ID,appearance:true,pair:'/original/pair-request.json',...delta}));
});
test('fresh-profile metadata and original helper callback carry AX RPC and all visual limitations',async()=>{
 calls=0;reason=undefined;receipt={ax:{original:true},rpc:{original:true},status:'observed-visual-only',qualification:'none',privateImageIdentity:'unobserved'};let observed;
 original={appearanceEnabled:true,signal:new AbortController().signal,step:async(name,options,action)=>{assert.equal(options.kind,'ui');assert.deepEqual(options.features,['electronMigration']);assert.match(name,/long local chooser/);observed=await action();assert.ok(observed.ax&&observed.rpc)}};
 await run(original);assert.equal(calls,1);assert.equal(observed,receipt);assert.equal(observed.privateImageIdentity,'unobserved');assert.equal(observed.qualification,'none');
 assert.equal(journey.id,'mounted-long-image-appearance');assert.equal(journey.model,'loopback');assert.equal(journey.timeoutMs,150000);assert.deepEqual(journey.launch,{});assert.deepEqual(journey.needs,['accessibility','screen-recording']);assert.equal(journey.devAcceptance,undefined);
});
test('ordinary aborted and original helper failure never lose their original boundary or debt',async()=>{
 calls=0;await assert.rejects(run({appearanceEnabled:false,step:()=>assert.fail('ordinary step')}));assert.equal(calls,0);
 const controller=new AbortController(),abort=new Error('original abort');controller.abort(abort);await assert.rejects(run({appearanceEnabled:true,signal:controller.signal,step:()=>assert.fail('aborted step')}),error=>error===abort);assert.equal(calls,0);
 reason=new AggregateError([new Error('primary'),new Error('original image cleanup debt')],'original debt');original={appearanceEnabled:true,signal:new AbortController().signal,step:async(_name,_options,action)=>action()};await assert.rejects(run(original),error=>error===reason);assert.equal(calls,1);
});
process.on('exit',()=>replacement.restore());
