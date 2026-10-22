import {applyAuxBillingReturnFallback} from '../../../../../vendor/provided/aux-billing-return-fallback.mjs';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {applyAuxUiOriginIdentity,assertAuxUiOriginPairing} from '../../../../../vendor/provided/aux-ui-origin-identity.mjs';
const hash=x=>createHash('sha256').update(x).digest('hex');
const base='out/provided-reuse-aux-runtime-envelope/ui';
const report=JSON.parse(await readFile(base+'/manifest.json','utf8')).components.agent;
const files=structuredClone(report.files), contents=new Map(), originals=new Map();
for(const path of ['manifest.json','assets/chat-wBzshK0k.js','assets/artifact-test-CdjpLuI1.js','background.js','assets/strip-markdown-DRcmtuJc.js','assets/add-on-credits-dialog-Dn5FxOyZ.js']){
 const file=files.find(f=>f.path===path),data=await readFile(base+'/agent/'+path,'utf8'),original=await readFile(report.inputRoot+'/'+path,'utf8');
 assert.equal(hash(data),file.outputSha256);assert.equal(hash(original),file.sourceSha256);contents.set(path,data);originals.set(path,original);
}
const mf=files.find(f=>f.path==='manifest.json'),version=mf.anchors.at(-1);
assert.equal(contents.get('manifest.json').split(version.replace).length-1,1);
contents.set('manifest.json',contents.get('manifest.json').replace(version.replace,version.find));mf.outputSha256=hash(contents.get('manifest.json'));
const fingerprint=()=>hash(JSON.stringify(files.map(f=>[f.path,f.outputSha256]).sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:0)));
const ledgerPath='vendor/provided/agent-revisions.json',ledger=JSON.parse(await readFile(ledgerPath,'utf8'));
assert.equal(ledger.at(-1).revision,9);assert.equal(fingerprint(),ledger.at(-1).fingerprint);
for(const path of ['manifest.json','assets/chat-wBzshK0k.js','assets/artifact-test-CdjpLuI1.js']){
 const result=applyAuxUiOriginIdentity({component:'agent',path,text:contents.get(path),original:originals.get(path)},{enableCloud:true,profile:'development'});
 assert.equal(result.anchors.length,1);contents.set(path,result.text);files.find(f=>f.path===path).outputSha256=hash(result.text);
}
const billingPath='assets/add-on-credits-dialog-Dn5FxOyZ.js';
const billing=applyAuxBillingReturnFallback({component:'agent',path:billingPath,text:contents.get(billingPath),original:originals.get(billingPath)},{enableCloud:true,profile:'development'});
assert.equal(billing.anchors.length,1);contents.set(billingPath,billing.text);files.find(f=>f.path===billingPath).outputSha256=hash(billing.text);
const pairing=assertAuxUiOriginPairing({manifestText:contents.get('manifest.json'),manifestOriginal:originals.get('manifest.json'),callers:['background.js','assets/strip-markdown-DRcmtuJc.js'].map(path=>({path,text:contents.get(path),original:originals.get(path)}))},{enableCloud:true,profile:'development'});
ledger.push({...ledger.at(-1),revision:10,fingerprint:fingerprint()});
await writeFile(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
await writeFile('out/aux-ui-origins-revision-review.json',JSON.stringify({priorRevision:9,priorFingerprint:ledger.at(-2).fingerprint,review:ledger.at(-1),changedPaths:['manifest.json','assets/chat-wBzshK0k.js','assets/artifact-test-CdjpLuI1.js',billingPath],pairing},null,2)+'\n');
console.log(JSON.stringify({review:ledger.at(-1),pairing}));
