import test from 'node:test';
import assert from 'node:assert/strict';
import { embedCloudSeaBlob } from './cloud-sea-embedding.mjs';
import { findMachOSeaSection } from '../aside/lib/sea.mjs';

function fixture(){
  const b=Buffer.alloc(32768+128),commands=[];let at=32;
  b.writeUInt32LE(0xfeedfacf);b.writeUInt32LE(0x100000c,4);
  function segment(name,fileoff,filesize,vmaddr,vmsize,section){
    const size=section?152:72;b.writeUInt32LE(0x19,at);b.writeUInt32LE(size,at+4);b.write(name,at+8);
    for(const[offset,value]of [[24,vmaddr],[32,vmsize],[40,fileoff],[48,filesize]])b.writeBigUInt64LE(BigInt(value),at+offset);
    if(section){b.writeUInt32LE(1,at+64);b.write(section.name,at+72);b.write(name,at+88);b.writeBigUInt64LE(BigInt(vmaddr+section.offset-fileoff),at+104);b.writeBigUInt64LE(BigInt(section.size),at+112);b.writeUInt32LE(section.offset,at+120);}
    commands.push(at);at+=size;
  }
  segment('__TEXT',0,16384,0x100000000,16384,{name:'__text',offset:4096,size:128});
  segment('NODE_SEA',16384,20,0x100004000,16384,{name:'__NODE_SEA_BLOB',offset:16384,size:20});
  segment('__LINKEDIT',32768,128,0x100008000,16384);
  const metadata=at;b.writeUInt32LE(0x80000034,at);b.writeUInt32LE(16,at+4);b.writeUInt32LE(32768,at+8);b.writeUInt32LE(128,at+12);at+=16;
  b.writeUInt32LE(4,16);b.writeUInt32LE(at-32,20);b.fill(0x53,4096,4224);b.fill(0x6d,32768);
  return {b,metadata};
}
test('larger SEA preserves native bytes and relocates only bounded trailing metadata',()=>{
  const {b,metadata}=fixture(),original=Buffer.from(b),blob=Buffer.alloc(20000,0x71),out=embedCloudSeaBlob(b,blob);
  assert.deepEqual(b,original);assert.equal(out.length,b.length+16384);
  assert.deepEqual(out.subarray(4096,4224),b.subarray(4096,4224));
  assert.deepEqual(out.subarray(49152),b.subarray(32768));
  assert.equal(out.readUInt32LE(metadata+8),49152);
  const section=findMachOSeaSection(out);assert.deepEqual(out.subarray(section.offset,section.offset+section.size),blob);
  assert.deepEqual(embedCloudSeaBlob(b,Buffer.alloc(10)).length,b.length);
  const unknown=Buffer.from(b);unknown.writeUInt32LE(0x777,metadata);assert.throws(()=>embedCloudSeaBlob(unknown,blob),/Unsupported load command/);
  const offset=Buffer.from(b);offset.writeUInt32LE(4000,metadata+8);assert.throws(()=>embedCloudSeaBlob(offset,blob),/Unexpected metadata offset/);
});
