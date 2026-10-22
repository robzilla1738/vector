import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { withInferenceUploads, readVerifiedInferenceInput, assertInputSignature, MAX_INFERENCE_BYTES } from './inference-uploads';
import { oggOpusSeconds, webmOpusSeconds, audioReservationSeconds } from './audio-duration';

const owner='00000000-0000-4000-8000-000000000001', other='00000000-0000-4000-8000-000000000002', id='00000000-0000-4000-8000-000000000003';
const png=Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),Buffer.alloc(4*1024*1024)]);
const row={id,user_id:owner,pathname:`aux/${owner}/${id}/content`,content_type:'image/png',expected_size:png.length,expected_sha256:createHash('sha256').update(png).digest('hex')};
function loader(bytes=png): typeof import('@vercel/blob').get { return (async()=>({statusCode:200,blob:{size:bytes.length,contentType:'image/png'},stream:new ReadableStream({start(c){c.enqueue(bytes);c.close();}})})) as unknown as typeof import('@vercel/blob').get; }
test('private large input integrity bounds reads and verifies MIME/hash before model dispatch',async()=>{
 assert.equal((await readVerifiedInferenceInput(row,loader())).bytes.length,png.length);
 await assert.rejects(readVerifiedInferenceInput({...row,expected_sha256:'a'.repeat(64)},loader()),/integrity/);
 await assert.rejects(readVerifiedInferenceInput({...row,expected_size:MAX_INFERENCE_BYTES+1},loader()),/20 MiB/);
 assert.throws(()=>assertInputSignature(Buffer.from('not a png'),'image/png'),/MIME/);
});
test('actual upload migration and production claim transaction deny cross-owner/replay and always delete after callback failure',async()=>{
 const pg=new PGlite();try{
  await pg.exec('CREATE TABLE aux_users(id uuid PRIMARY KEY);');
  await pg.exec(await readFile(new URL('../migrations/004-attachments.sql',import.meta.url),'utf8'));
  await pg.exec(await readFile(new URL('../migrations/011-inference-uploads.sql',import.meta.url),'utf8'));
  await pg.query('INSERT INTO aux_users VALUES($1),($2)',[owner,other]);
  await pg.query("INSERT INTO aux_attachments(id,user_id,pathname,name,content_type,expected_size,expected_sha256,purpose,state,expires_at) VALUES($1,$2,$3,'fixture',$4,$5,$6,'inference','ready',now()+interval '15 minutes')",[id,owner,row.pathname,row.content_type,row.expected_size,row.expected_sha256]);
  type Query={text:string;values:unknown[]};
  const query=((strings:TemplateStringsArray,...values:unknown[])=>({text:strings.reduce((s,p,i)=>s+p+(i<values.length?`$${i+1}`:''),''),values})) as unknown as typeof import('./db').sql;
  query.transaction=(async(queries:Query[])=>pg.transaction(async tx=>{const rows=[];for(const q of queries)rows.push((await tx.query(q.text,q.values)).rows);return rows;})) as unknown as typeof query.transaction;
  const removed:string[]=[],deps={query,load:loader(),remove:async(path:string|string[])=>{removed.push(String(path));}};
  let dispatched=false;
  await assert.rejects(withInferenceUploads(other,[id],async()=>{dispatched=true;},deps),/not found/);assert.equal(dispatched,false);assert.deepEqual(removed,[]);
  await assert.rejects(withInferenceUploads(owner,[id],async inputs=>{assert.equal(inputs[0]!.bytes.length,png.length);throw Error('synthetic downstream failure');},deps),/downstream/);
  assert.deepEqual(removed,[row.pathname]);
  await assert.rejects(withInferenceUploads(owner,[id],async()=>{},deps),/already consumed/);
  assert.equal((await pg.query<{state:string}>('SELECT state FROM aux_attachments WHERE id=$1',[id])).rows[0]!.state,'failed');
  // Tombstones survive until token expiry, then existing maintenance selects them even
  // after a successful delete. Ready, abandoned inference files must be selected too.
  await pg.query("UPDATE aux_attachments SET state='ready',expires_at=now()-interval '1 second' WHERE id=$1",[id]);
  const cleanupSource=await readFile(new URL('./attachments.ts',import.meta.url),'utf8');
  const cleanup=cleanupSource.slice(cleanupSource.indexOf('export async function cleanExpiredAttachmentUploads'));
  const select=cleanup.match(/sql`(SELECT id, pathname[\s\S]*?)`/)![1]!.replace('${limit}','$1');
  assert.equal((await pg.query(select,[50])).rows.length,1);
 }finally{await pg.close();}
});
function oggPage(packet:Buffer){const lengths:number[]=[];for(let n=packet.length;n>=255;n-=255)lengths.push(255);lengths.push(packet.length%255);const head=Buffer.alloc(27+lengths.length);head.write('OggS');head[26]=lengths.length;lengths.forEach((n,i)=>head[27+i]=n);return Buffer.concat([head,packet]);}
const element=(idBytes:number[],content:Buffer)=>{if(content.length>=127)throw Error('fixture too large');return Buffer.concat([Buffer.from(idBytes),Buffer.from([128|content.length]),content]);};
test('packet-based native WebM without Duration and channel Ogg ignore forged container timing',async()=>{
 const head=oggPage(Buffer.from('OpusHeadfixture')),packet=oggPage(Buffer.from([0xf8,0])); //20ms one frame.
 const ogg=Buffer.concat([head,...Array.from({length:4500},()=>packet)]);
 assert.ok(Math.abs(oggOpusSeconds(ogg)-90)<0.001);assert.equal(await audioReservationSeconds(ogg,'audio/ogg'),91);
 const codec=element([0x86],Buffer.from('A_OPUS')),track=element([0xae],codec),tracks=element([0x16,0x54,0xae,0x6b],track);
 const block=element([0xa3],Buffer.from([0x81,0,0,0,0xf8,0]));
 const webm=Buffer.concat([Buffer.from([0x1a,0x45,0xdf,0xa3,0x80]),Buffer.from([0x18,0x53,0x80,0x67,0xff]),tracks,...Array.from({length:4500},()=>block)]);
 assert.ok(Math.abs(webmOpusSeconds(webm)-90)<0.001);assert.equal(await audioReservationSeconds(webm,'audio/webm'),91);
 assert.throws(()=>oggOpusSeconds(Buffer.concat([head,oggPage(Buffer.from([0xff,63]))])),/valid recording/);
 assert.throws(()=>webmOpusSeconds(webm.subarray(0,webm.length-1)),/valid recording/);
});
