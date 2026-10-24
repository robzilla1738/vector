import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';

const here=new URL('./',import.meta.url),ledgerPath=new URL('../../../../../vendor/provided/agent-revisions.json',import.meta.url);
const hash=value=>createHash('sha256').update(value).digest('hex');
const preflight=JSON.parse(await readFile(new URL('actual-ui-preflight-a1.json',here),'utf8'));
const composition=JSON.parse(await readFile(new URL('actual-ui-composition-a1.json',here),'utf8'));
assert.equal(preflight.passed,false);assert.equal(preflight.expectedReviewRequired,true);
assert.equal(composition.passed,true);assert.equal(composition.fullFeatureComposition,true);
assert.match(preflight.observedFingerprint,/^[a-f0-9]{64}$/);
const before=await readFile(ledgerPath),ledger=JSON.parse(before);
assert.equal(ledger.at(-1).revision,29);
const review={revision:30,profile:'development',identityProfile:'aux-v1',stateIdentityVersion:2,
 featureProfile:'desktop-v1',fingerprint:preflight.observedFingerprint};
ledger.push(review);
const adapters={};
for(const file of ['aux-ui-draft-capture.mjs','aux-ui-draft-closure.mjs','aux-ui-draft-closure-runtime.js.txt'])
 adapters[file]=hash(await readFile(new URL('../../../../../vendor/provided/'+file,import.meta.url)));
const next=JSON.stringify(ledger,null,2)+'\n';
const receipt={format:'aux.feature-completion.ui-revision-review.v1',previousLedgerSha256:hash(before),
 nextLedgerSha256:hash(next),preflightSha256:hash(await readFile(new URL('actual-ui-preflight-a1.json',here))),
 compositionSha256:hash(await readFile(new URL('actual-ui-composition-a1.json',here))),review,adapters,
 candidateDeltaStillRequiresVerification:true,productExecuted:false};
await writeFile(new URL('revision-review.json',here),JSON.stringify(receipt,null,2)+'\n');
await writeFile(ledgerPath,next);
console.log(JSON.stringify(receipt));
