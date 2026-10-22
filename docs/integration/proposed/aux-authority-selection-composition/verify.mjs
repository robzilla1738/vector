import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {composePrivateInstallationJournalStore} from './composition.mjs';
const repo=new URL('../../../../',import.meta.url),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const {source,outputPath}=await composePrivateInstallationJournalStore();assert.deepEqual(await readFile(outputPath),source);
const pins=JSON.parse(await readFile(new URL('source-pins.json',import.meta.url)));for(const pin of pins.files)assert.equal(hash(await readFile(new URL(pin.path,repo))),pin.sha256,pin.path);
console.log('PASS: exact baseline + two continuations compose one logical store; source pins match.');
