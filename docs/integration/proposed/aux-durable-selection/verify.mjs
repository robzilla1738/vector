import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const root=new URL('../../../../',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');
const manifest=JSON.parse(await readFile(new URL('source-continuation.json',import.meta.url)));assert.equal(manifest.format,'aux.durable.selection.source.v1');
const baseline=await readFile(new URL(manifest.baseline,root)),successor=await readFile(new URL(manifest.successor,root)),continuation=await readFile(new URL(manifest.continuation,root));assert.equal(hash(baseline),manifest.baselineSha256);assert.equal(hash(successor),manifest.successorSha256);assert.equal(continuation.length,manifest.appendedBytes);assert.deepEqual(Buffer.concat([baseline,continuation]),successor);
const pins=JSON.parse(await readFile(new URL('source-pins.json',import.meta.url)));for(const entry of pins.files)assert.equal(hash(await readFile(new URL(entry.path,root))),entry.sha256,entry.path);
console.log('PASS: exact private-store baseline + selection continuation and all source/design pins.');
