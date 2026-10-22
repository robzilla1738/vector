import { parseBuffer } from 'music-metadata';
import { HTTPException } from 'hono/http-exception';
const reject = (): never => { throw new HTTPException(400, { message: 'Audio must be a valid recording no longer than 30 minutes.' }); };
function opusSeconds(packet: Buffer) {
  if (!packet.length) return reject();
  const config = packet[0]! >> 3, code = packet[0]! & 3;
  const milliseconds = config >= 16 ? 2.5 * (1 << (config & 3)) : config >= 12 ? 10 * (1 << (config & 1)) : (config & 3) === 3 ? 60 : 10 * (1 << (config & 3));
  const frames = code === 0 ? 1 : code === 3 ? (packet[1] ?? 0) & 63 : 2;
  if (!frames || milliseconds * frames > 120) return reject();
  return milliseconds * frames / 1000;
}
/** Count encoded Opus packets, not forgeable Ogg granule positions. */
export function oggOpusSeconds(bytes: Buffer) {
  let offset = 0, total = 0, granuleSeconds = 0, serial: number | undefined, opus = false, packet: Buffer[] = [], packetBytes = 0;
  while (offset < bytes.length) {
    if (offset + 27 > bytes.length || bytes.toString('ascii',offset,offset+4) !== 'OggS' || bytes[offset+4] !== 0) return reject();
    const granule=bytes.readBigUInt64LE(offset+6); if(granule!==0xffffffffffffffffn){if(granule>86400000n)return reject();granuleSeconds=Math.max(granuleSeconds,Number(granule)/48000);}
    const current = bytes.readUInt32LE(offset+14); if (serial !== undefined && serial !== current) return reject(); serial = current;
    const segments = bytes[offset+26]!, header = offset + 27 + segments;
    if (header > bytes.length) return reject(); let cursor = header;
    for (let index=0; index<segments; index++) {
      const length = bytes[offset+27+index]!;
      if (cursor+length > bytes.length || packetBytes+length > 65536) return reject();
      packet.push(bytes.subarray(cursor,cursor+length)); packetBytes += length; cursor += length;
      if (length < 255) {
        const complete = Buffer.concat(packet);
        if (!opus) { if (complete.toString('ascii',0,8) !== 'OpusHead') return reject(); opus = true; }
        else if (complete.toString('ascii',0,8) !== 'OpusTags') total += opusSeconds(complete);
        packet = []; packetBytes = 0;
      }
    }
    offset = cursor; if (total > 1800) return reject();
  }
  if (!opus || packetBytes || total <= 0) return reject(); return Math.max(total,granuleSeconds);
}
function vint(bytes: Buffer, position: number, keepMarker = false) {
  if (position >= bytes.length || bytes[position] === 0) return reject();
  let width = 1, marker = 128; while (!(bytes[position]! & marker)) { width++; marker >>= 1; }
  if (width > (keepMarker ? 4 : 8) || position+width > bytes.length) return reject();
  let value = BigInt(keepMarker ? bytes[position]! : bytes[position]! & (marker-1));
  for (let i=1;i<width;i++) value=(value<<8n)|BigInt(bytes[position+i]!);
  const unknown = !keepMarker && value === (1n << BigInt(7*width))-1n;
  if (!unknown && value > BigInt(Number.MAX_SAFE_INTEGER)) return reject();
  return {width,value:unknown ? -1 : Number(value)};
}
/** MediaRecorder WebM commonly has no Duration. Walk bounded EBML blocks and count Opus frames. */
export function webmOpusSeconds(bytes: Buffer) {
  let total=0, opus=false, blocks=0, scale=1000000, maximumTicks=0, declaredTicks=0;
  const containers = new Set([0x1a45dfa3,0x18538067,0x1549a966,0x1654ae6b,0xae,0x1f43b675,0xa0]);
  const walk=(start:number,end:number,depth:number,clusterTime=0)=>{
    if(depth>8)return reject();let cursor=start;
    while(cursor<end){
      const id=vint(bytes,cursor,true);cursor+=id.width;const size=vint(bytes,cursor);cursor+=size.width;
      const stop=size.value<0?end:cursor+size.value;if(stop>end||stop<cursor)return reject();
      if(containers.has(id.value))walk(cursor,stop,depth+1,id.value===0x1f43b675?0:clusterTime);
      else if(id.value===0xe7||id.value===0x2ad7b1){if(stop-cursor>6||stop===cursor)return reject();let value=0;for(let n=cursor;n<stop;n++)value=value*256+bytes[n]!;if(id.value===0xe7)clusterTime=value;else{if(value<1)return reject();scale=value;}}
      else if(id.value===0x4489){const value=stop-cursor===4?bytes.readFloatBE(cursor):stop-cursor===8?bytes.readDoubleBE(cursor):NaN;if(!Number.isFinite(value)||value<0)return reject();declaredTicks=Math.max(declaredTicks,value);}
      else if(id.value===0x86){if(bytes.toString('ascii',cursor,stop)!=='A_OPUS')return reject();opus=true;}
      else if(id.value===0xa3||id.value===0xa1){
        if(++blocks>1000000)return reject();const track=vint(bytes,cursor);const flags=cursor+track.width+2;
        if(flags>=stop)return reject();maximumTicks=Math.max(maximumTicks,clusterTime+bytes.readInt16BE(cursor+track.width));const lacing=(bytes[flags]!>>1)&3,packetStart=flags+1;
        if(lacing){if(packetStart>=stop)return reject();total+=(bytes[packetStart]!+1)*0.120;} // Conservative maximum per laced Opus packet.
        else total+=opusSeconds(bytes.subarray(packetStart,stop));
        if(total>1800)return reject();
      }
      cursor=stop;
    }
  };
  walk(0,bytes.length,0);const timeline=Math.max(maximumTicks*scale/1e9+0.120,declaredTicks*scale/1e9);if(!opus||total<=0||timeline>1800)return reject();return Math.max(total,timeline);
}
export async function audioReservationSeconds(bytes: Buffer, mimeType: string) {
  let seconds: number | undefined;
  try {
    seconds = mimeType==='audio/webm' ? webmOpusSeconds(bytes) : mimeType==='audio/ogg' ? oggOpusSeconds(bytes)
      : (await parseBuffer(bytes,{mimeType,size:bytes.length},{duration:true,skipCovers:true})).format.duration;
  } catch { return reject(); }
  if(typeof seconds!=='number'||!Number.isFinite(seconds)||seconds<=0||seconds>1800)return reject();
  // Container timing is not sufficient to cheaply validate hostile non-Opus media. Reserve
  // the full accepted window for those formats; valid native Opus captures reserve exact packets.
  return ['audio/webm','audio/ogg'].includes(mimeType) ? Math.min(1800,Math.ceil(seconds)+1) : 1800;
}
