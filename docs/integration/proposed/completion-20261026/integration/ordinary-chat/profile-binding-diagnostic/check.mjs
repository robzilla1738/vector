import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const plan=JSON.parse(fs.readFileSync(new URL('./proposal.json',import.meta.url)));
const rule=plan.rules[0],route={profileId:'synthetic-profile',accountId:7};
const native={profileId:route.profileId,boundAccountId:7,isRegularProfile:true,isOffTheRecord:false,accountAuthPaused:false,cookieRestorePending:false,browserContextId:'synthetic-context',cookieBindingEpoch:'synthetic-binding',cookieRestoreEpoch:'synthetic-restore'};
const run=(code,value)=>{try{vm.runInNewContext(code,{native:value,route});return null}catch(e){return e.message}};
assert.equal(run(rule.replace,native),null);
const changes=[['profileId','other'],['boundAccountId',8],['isRegularProfile',false],['isOffTheRecord',true],['accountAuthPaused',true],['cookieRestorePending',true],['browserContextId',''],['cookieBindingEpoch',''],['cookieRestoreEpoch','']];
for(let i=0;i<changes.length;i++){const [key,value]=changes[i],altered={...native,[key]:value};assert(run(rule.find,altered));const mask=Array(9).fill('1');mask[i]='0';assert.equal(run(rule.replace,altered),'The native browser profile binding changed. [checks='+mask.join('')+']');}
for(const key of Object.keys(native)){const altered={...native};delete altered[key];assert.equal(run(rule.find,altered)===null,run(rule.replace,altered)===null);}
console.log('Nine rejection predicates preserved; diagnostic contains only fixed label and nine booleans.');
