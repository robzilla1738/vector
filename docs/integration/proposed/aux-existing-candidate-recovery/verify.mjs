import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('../../../../',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(new URL('source-continuations.json',import.meta.url)));
assert.equal(manifest.format,'aux.candidate.recovery.continuations.v1');assert.equal(manifest.files.length,3);
for(const entry of manifest.files){const baseline=await readFile(new URL(entry.baseline,root)),successor=await readFile(new URL(entry.successor,root)),continuation=await readFile(new URL(entry.continuation,root));assert.equal(hash(baseline),entry.baselineSha256);assert.equal(hash(successor),entry.successorSha256);assert.equal(continuation.length,entry.appendedBytes);assert.deepEqual(Buffer.concat([baseline,continuation]),successor);}
const pins=JSON.parse(await readFile(new URL('source-pins.json',import.meta.url)));for(const entry of pins.files)assert.equal(hash(await readFile(new URL(entry.path,root))),entry.sha256,entry.path);
console.log('PASS: three exact baseline-plus-continuation successors and all recovery source pins.');
