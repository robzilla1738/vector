// Exact logical source assembly, not runtime concatenation or access bypass.
import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const repo=new URL('../../../../',import.meta.url),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
export async function composePrivateInstallationJournalStore(){
 const manifest=JSON.parse(await readFile(new URL('composition.json',import.meta.url)));
 assert.equal(manifest.format,'aux.authority.selection.store.composition.v1');assert.deepEqual(manifest.inputs.map(input=>input.role),['baseline','candidate-recovery','durable-selection']);assert.equal(manifest.logicalSource,'PrivateInstallationJournalStore.swift');assert.equal(manifest.definitionCount,1);
 const parts=[];for(const input of manifest.inputs){const bytes=await readFile(new URL(input.path,repo));assert.equal(bytes.length,input.bytes);assert.equal(hash(bytes),input.sha256,input.path);parts.push(bytes);}
 const source=Buffer.concat(parts);assert.equal(source.length,manifest.output.bytes);assert.equal(hash(source),manifest.output.sha256);assert.equal((source.toString().match(/final class PrivateInstallationJournalStore\b/g)??[]).length,1);return {source,outputPath:new URL(manifest.output.path,repo)};
}
