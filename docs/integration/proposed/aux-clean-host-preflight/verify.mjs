import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const repo=new URL('../../../../',import.meta.url),hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifest=JSON.parse(await readFile(new URL('source-pins.json',import.meta.url)));assert.equal(manifest.format,'aux.clean.host.preflight.pins.v1');
for(const entry of manifest.files)assert.equal(hash(await readFile(new URL(entry.path,repo))),entry.sha256,entry.path);
const evidence=JSON.parse(await readFile(new URL('loader-contract.json',import.meta.url)));assert.equal(evidence.format,'aux.clean.host.loader.evidence.v1');
for(const entry of evidence.records){const bytes=await readFile(new URL(entry.path,repo));assert.equal(hash(bytes),entry.sha256);const text=bytes.toString();for(const anchor of entry.anchors)assert.equal(text.split(anchor.anchor).length-1,anchor.count,entry.path);}
for(const name of ['AuxCleanHostPreflight.swift','AuxCleanHostImports.cc','AuxCleanHostSelectedBinding.swift']){const text=await readFile(new URL('source/'+name,import.meta.url),'utf8');assert(!text.toLowerCase().includes('aside'));assert(!/\bSec(?:Item(?:Add|CopyMatching|Delete|Update)|KeyCreateRandomKey)\s*\(/.test(text),'protected call in preflight');}
const fixture=await readFile(new URL('tests/main.swift',import.meta.url),'utf8');assert(!fixture.includes('AuxCleanHostPreflight.inspect('));assert(!fixture.includes('AuxObservedSelectedHostBinding.existing('));
console.log('PASS: actual loader/SDK anchors + source pins; preflight sources have no protected invocation or reference-product literal.');
