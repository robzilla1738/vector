import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=path.dirname(new URL(import.meta.url).pathname);
const e=JSON.parse(fs.readFileSync(path.join(root,'source-evidence.json')));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
let checked=0,settings;
for(const p of e.packs){
 const bytes=fs.readFileSync(p.path);assert.equal(bytes.length,p.bytes);assert.equal(sha(bytes),p.sha256);assert.equal(bytes.readUInt32LE(0),5);
 const n=bytes.readUInt16LE(8);
 for(let i=0;i<n;i++){
  const id=bytes.readUInt16LE(12+6*i),start=bytes.readUInt32LE(14+6*i),end=bytes.readUInt32LE(20+6*i);
  const raw=bytes.subarray(start,end);const data=raw[0]===0x1e&&raw[1]===0x9b?zlib.brotliDecompressSync(raw.subarray(8)):raw[0]===0x1f&&raw[1]===0x8b?zlib.gunzipSync(raw):raw;
  assert(!data.includes('openBrowserImportWindow'));assert(!data.includes(Buffer.from('openBrowserImportWindow','utf16le')));checked++;
  if(p.path.endsWith('/resources.pak')&&id===e.settingsResource.id){assert.equal(start,e.settingsResource.start);assert.equal(end,e.settingsResource.end);assert.equal(sha(raw),e.settingsResource.rawSha256);assert.equal(sha(data),e.settingsResource.decodedSha256);settings=data;}
 }
}
assert(settings);
for(const s of e.snippets){const b=settings.subarray(s.offset,s.offset+s.bytes);assert.equal(sha(b),s.sha256);assert.deepEqual(b,fs.readFileSync(path.join(root,'evidence',s.file)));}
const thin=fs.readFileSync(e.thinPath);assert.equal(sha(thin),e.thinSha256);const sections=[];let pos=32;
for(let i=0;i<thin.readUInt32LE(16);i++){const cmd=thin.readUInt32LE(pos),size=thin.readUInt32LE(pos+4);if(cmd===0x19){for(let j=0;j<thin.readUInt32LE(pos+64);j++){const s=pos+72+j*80;sections.push({va:Number(thin.readBigUInt64LE(s+32)),size:Number(thin.readBigUInt64LE(s+40)),off:thin.readUInt32LE(s+48)});}}pos+=size;}
for(const r of e.ranges){const a=Number(r.start),b=Number(r.end),s=sections.find(s=>s.va<=a&&b<=s.va+s.size);assert(s);assert.equal(sha(thin.subarray(s.off+a-s.va,s.off+b-s.va)),r.sha256);assert.equal(sha(fs.readFileSync(path.join(root,'evidence',r.listing))),r.listingSha256);}
for(const p of e.currentNativeInputs)assert.equal(sha(fs.readFileSync(p.path)),p.sha256);
process.stdout.write(`PASS: ${checked} exact supplied resources decoded; matching Settings stock route and native initialize pins; no source mutation/runtime\n`);
