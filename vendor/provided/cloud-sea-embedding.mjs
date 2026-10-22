/** Grow only the final SEA reservation, relocating the trailing LINKEDIT data.
 * Restricted to the supplied thin arm64 layout; no code/data section moves,
 * executable launch or signing. Unknown load commands fail closed. */
import { injectMachOSeaBlob } from '../aside/lib/sea.mjs';

function sections(binary) {
  if (binary.readUInt32LE(0) !== 0xfeedfacf) throw Error('Expected a thin64 Mach-O');
  const result=new Map();let at=32;
  for(let n=0;n<binary.readUInt32LE(16);n++){
    const command=binary.readUInt32LE(at),size=binary.readUInt32LE(at+4);
    if(size<8||at+size>binary.length)throw Error('Invalid Mach-O load command');
    if(command===0x19){
      const segment=binary.toString('latin1',at+8,at+24).replace(/\0+$/,'');
      for(let i=0,offset=at+72;i<binary.readUInt32LE(at+64);i++,offset+=80){
        const name=binary.toString('latin1',offset,offset+16).replace(/\0+$/,'');
        const fileOffset=binary.readUInt32LE(offset+48),length=Number(binary.readBigUInt64LE(offset+40));
        if(segment==='NODE_SEA'||!fileOffset)continue;
        if(offset+80>at+size||fileOffset+length>binary.length||result.has(segment+'/'+name))throw Error('Invalid Mach-O section');
        result.set(segment+'/'+name,{address:binary.readBigUInt64LE(offset+32),bytes:binary.subarray(fileOffset,fileOffset+length)});
      }
    }
    at+=size;
  }
  return result;
}
export function embedCloudSeaBlob(original,blob) {
  const binary=Buffer.from(original);
  try{return injectMachOSeaBlob(binary,blob);}
  catch(error){if(!/^Blob is \d+ bytes larger than the reserved \d+$/.test(error.message))throw error;}
  if(original.readUInt32LE(4)!==0x100000c)throw Error('SEA growth requires the pinned arm64 layout');
  const commands=[],segments=[];let at=32;
  const names=offset=>original.toString('latin1',offset,offset+16).replace(/\0+$/,'');
  for(let n=0;n<original.readUInt32LE(16);n++){
    const command=original.readUInt32LE(at),size=original.readUInt32LE(at+4);
    if(size<8||at+size>32+original.readUInt32LE(20))throw Error('Invalid SEA load commands');
    commands.push({command,at,size});
    if(command===0x19)segments.push({at,name:names(at+8),vmaddr:Number(original.readBigUInt64LE(at+24)),vmsize:Number(original.readBigUInt64LE(at+32)),fileoff:Number(original.readBigUInt64LE(at+40)),filesize:Number(original.readBigUInt64LE(at+48))});
    at+=size;
  }
  const sea=segments.find(s=>s.name==='NODE_SEA'),link=segments.find(s=>s.name==='__LINKEDIT');
  if(!sea||!link||segments.at(-1)!==link||segments.at(-2)!==sea||link.fileoff+link.filesize!==original.length||link.vmaddr!==sea.vmaddr+sea.vmsize||link.fileoff!==sea.fileoff+sea.vmsize||original.readUInt32LE(link.at+64)!==0)throw Error('Unsupported SEA reservation layout');
  const delta=Math.ceil((blob.length-(link.fileoff-sea.fileoff))/16384)*16384;
  if(delta<=0||delta>16*1024*1024)throw Error('Invalid SEA reservation growth');
  const output=Buffer.alloc(original.length+delta);
  original.copy(output,0,0,link.fileoff);original.copy(output,link.fileoff+delta,link.fileoff);
  output.writeBigUInt64LE(BigInt(sea.vmsize+delta),sea.at+32);
  output.writeBigUInt64LE(BigInt(link.vmaddr+delta),link.at+24);
  output.writeBigUInt64LE(BigInt(link.fileoff+delta),link.at+40);
  const shift=(offset,length=0)=>{
    const value=original.readUInt32LE(offset);if(!value)return;
    if(value<link.fileoff||value+length>original.length)throw Error('Unexpected metadata offset during SEA growth');
    output.writeUInt32LE(value+delta,offset);
  };
  for(const c of commands){
    if(c.command===0x19)continue;
    if([0x80000034,0x80000033,0x26,0x29,0x1d].includes(c.command)){
      if(c.size!==16)throw Error('Unexpected LINKEDIT command size');shift(c.at+8,original.readUInt32LE(c.at+12));
    }else if(c.command===0x2){
      if(c.size!==24)throw Error('Unexpected symbol command size');shift(c.at+8,original.readUInt32LE(c.at+12)*16);shift(c.at+16,original.readUInt32LE(c.at+20));
    }else if(c.command===0xb){
      if(c.size!==80)throw Error('Unexpected dynamic symbol command size');
      for(const offset of [32,40,48,56,64,72])shift(c.at+offset);
    }else if(c.command===0x80000028){
      if(Number(original.readBigUInt64LE(c.at+8))>=sea.fileoff)throw Error('Unexpected entrypoint during SEA growth');
    }else if(![0xe,0x1b,0x32,0x2a,0xc].includes(c.command))throw Error('Unsupported load command during SEA growth: '+c.command.toString(16));
  }
  injectMachOSeaBlob(output,blob);
  if(!output.subarray(link.fileoff+delta).equals(original.subarray(link.fileoff)))throw Error('SEA growth changed trailing metadata payload');
  const before=sections(original),after=sections(output);
  if(before.size!==after.size)throw Error('SEA growth changed native section inventory');
  for(const[name,input]of before){const actual=after.get(name);if(!actual||actual.address!==input.address||!actual.bytes.equals(input.bytes))throw Error('SEA growth changed supplied native code/data: '+name);}
  return output;
}
