import assert from 'node:assert/strict';import {readFileSync,mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {adaptDaemonCode} from '../../../../../vendor/provided/daemon-adapter.mjs';import {applyPinnedAuxCskV2} from '../../aux-csk-v2-consumer/source/adapt.mjs';import {adaptAuxLiveDkPurposes} from '../../aux-live-dk-purposes/source/adapt.mjs';import {excludeLegacyMacCrypto} from '../source/adapt.mjs';
const original=readFileSync(process.argv[2]??'/Users/rcourson/Documents/Vibe/web/out/provided-source-audit/daemon-original.mjs','utf8'),base=adaptDaemonCode(original,{},'aux-v1',2).code,csk=applyPinnedAuxCskV2({original,composed:base}).code,prepared=adaptAuxLiveDkPurposes({original,composed:csk}).code,pin=JSON.parse(readFileSync(new URL('../source-pins.json',import.meta.url))),result=excludeLegacyMacCrypto({original,composed:prepared});
assert.equal(result.activation,false);
for(const domain of pin.forbiddenDomains)assert.ok(!result.code.includes(domain));
for(const text of Object.values(pin.preservedFunctions))assert.equal(result.code.split(text).length-1,1);
// The replacements throw before any callback/authority/state dependency can run.
let rejected=0;
for(const edit of pin.edits.filter(x=>x.name.startsWith('Fail closed '))){const name=/function ([\w$]+)\(/.exec(edit.replace)[1],fn=new Function(edit.replace+';return '+name)();try{await fn();assert.fail(name+' returned')}catch(error){assert.match(error.message,/legacy cryptographic operation/);rejected++;}}
assert.equal(rejected,17);const guardSource='if(process.platform!==`darwin`)throw Error(`This Aux cryptographic runtime supports macOS only`);';assert.ok(result.code.startsWith(guardSource));assert.throws(()=>new Function('process',guardSource)({platform:'win32'}),/macOS only/);assert.throws(()=>excludeLegacyMacCrypto({original,composed:base}));
// Parse the full prepared application source without importing/running it.
const directory=mkdtempSync(path.join(tmpdir(),'aux-crypto-source-parse-'));
try{const file=path.join(directory,'prepared.mjs');writeFileSync(file,result.code,{mode:0o600});const parsed=spawnSync(process.execPath,['--check',file],{encoding:'utf8',timeout:30000});assert.equal(parsed.status,0,parsed.stderr);}finally{rmSync(directory,{recursive:true,force:true});}
console.log('crypto exclusion passed: exact full source parse;17 fail-closed functions;5 original-domain families absent;'+Object.keys(pin.preservedFunctions).length+' native/auth/storage/Sync functions unchanged');
