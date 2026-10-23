// Actual shared generated-UI checker boundary with deliberately invalid metadata.
import assert from 'node:assert/strict';
import {readFile,lstat} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {providedRecoveryEnrollmentUiResources} from '../../../../scripts/lib/provided-ui.mjs';
const output='/Users/rcourson/Documents/Vibe/web/out/aux-enrollment-ui-review-20261022';
const text=await readFile(new URL('../../../../scripts/check-provided.mjs',import.meta.url),'utf8');
const start=text.indexOf("  const enrollment = component === 'agent' ?"),end=text.indexOf('  for (const file of report.files.filter(file => !file.generatedBy)) {');assert(start>0&&end>start);
const boundary=Function('return async function({component,report,root,providedRecoveryEnrollmentUiResources,join,lstat,readFile,safe,hash}){const stateIdentityVersion=2;'+text.slice(start,end)+'}')();
const original=JSON.parse(await readFile(join(output,'ui/manifest.json'),'utf8')).components.agent;
const base={component:'agent',root:join(output,'ui/agent'),providedRecoveryEnrollmentUiResources,join,lstat,readFile,safe:p=>typeof p==='string'&&p&&!p.startsWith('/')&&!p.split('/').some(x=>['','.','..'].includes(x)),hash:b=>createHash('sha256').update(b).digest('hex')};
let report=structuredClone(original);report.files=report.files.filter(x=>x.path!=='assets/aux-sync-recovery-enrollment.js');await assert.rejects(boundary({...base,report}),/Missing or additional generated/);
report=structuredClone(original);report.files.push({...report.files.find(x=>x.generatedBy),path:'assets/unreviewed-extra.js'});await assert.rejects(boundary({...base,report}),/Missing or additional generated/);
report=structuredClone(original);report.files.find(x=>x.generatedBy).sourceSha256='0'.repeat(64);await assert.rejects(boundary({...base,report}),/source\/hash\/mode/);
console.log(JSON.stringify({format:'aux.enrollment-ui.generated-boundary-check.v1',rejected:['missing-fixed-asset','extra-generated-asset','forged-source-pin'],successfulStageMutated:false,uiEvaluated:false}));
