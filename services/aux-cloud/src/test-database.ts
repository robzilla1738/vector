/** Test-only: actual migrations in an in-memory PGlite behind Neon's documented custom transport. */
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import type {AddressInfo} from 'node:net';
import {neonConfig} from '@neondatabase/serverless';
import {PGlite} from '@electric-sql/pglite';
import manifest from './schema-manifest.json';

export type Query=(text:string,values?:unknown[])=>Promise<any[]>;

export async function withMigratedDatabase(run:(query:Query,stats:{queries:number;clerkDeletes:string[];blobs:Set<string>})=>Promise<void>){
  const previous={url:process.env.DATABASE_URL,secret:process.env.AUX_AUTH_SECRET,key:process.env.AUX_DATA_ENCRYPTION_KEY,blob:process.env.BLOB_READ_WRITE_TOKEN,blobApi:process.env.VERCEL_BLOB_API_URL,clerk:process.env.CLERK_SECRET_KEY,fetch:globalThis.fetch,transport:neonConfig.fetchFunction};
  const pg=new PGlite(),stats={queries:0,clerkDeletes:[] as string[],blobs:new Set<string>()};
  process.env.DATABASE_URL='postgresql://synthetic:synthetic@offline.invalid/aux_fixture';
  process.env.AUX_AUTH_SECRET='synthetic-recovery-fixture-secret-not-a-credential';process.env.AUX_DATA_ENCRYPTION_KEY=Buffer.alloc(32,17).toString('base64');
  // A loopback Blob store holding the pathnames a test puts in stats.blobs. It answers listing
  // and deletion only; any other Blob call fails the test.
  const blobRequests:string[]=[],origin='https://fixture.public.blob.vercel-storage.com/';
  const blobStore=createServer((request,response)=>{
    blobRequests.push(`${request.method} ${request.url}`);
    const url=new URL(request.url!,'http://blob.invalid'),reply=(status:number,body:unknown)=>response.writeHead(status,{'content-type':'application/json'}).end(JSON.stringify(body));
    if(request.method==='GET'){const prefix=url.searchParams.get('prefix')??'';return reply(200,{blobs:[...stats.blobs].filter(p=>p.startsWith(prefix)).map(pathname=>({pathname,url:origin+pathname,downloadUrl:origin+pathname,size:1,uploadedAt:new Date(0).toISOString()})),hasMore:false});}
    if(request.method!=='POST'||url.pathname!=='/delete')return reply(500,{error:{code:'unexpected'}});
    let body='';request.on('data',chunk=>body+=chunk).on('end',()=>{for(const target of JSON.parse(body).urls as string[])stats.blobs.delete(target.replace(origin,''));reply(200,{});});
  });
  await new Promise<void>(resolve=>blobStore.listen(0,'127.0.0.1',resolve));
  process.env.VERCEL_BLOB_API_URL=`http://127.0.0.1:${(blobStore.address() as AddressInfo).port}`;
  process.env.BLOB_READ_WRITE_TOKEN='vercel_blob_rw_fixture_synthetic';
  // Clerk reads global fetch per call only under NODE_ENV=test; answer just user deletion.
  assert.equal(process.env.NODE_ENV,'test');
  process.env.CLERK_SECRET_KEY='sk_test_synthetic_fixture';
  globalThis.fetch=async(input:string|URL|Request,init?:RequestInit)=>{
    const url=new URL(input instanceof Request?input.url:String(input)),user=url.pathname.match(/^\/v1\/users\/([^/]+)$/);
    if(url.hostname==='api.clerk.com'&&init?.method==='DELETE'&&user){stats.clerkDeletes.push(decodeURIComponent(user[1]!));return Response.json({id:user[1],object:'user',deleted:true});}
    throw Error('Unexpected external network access');
  };
  try{
    // PGlite's PG build includes gen_random_uuid(), but no pgcrypto installer.
    // Omit only that extension-install directive; execute EVERY actual DDL file.
    const names=(await readdir(new URL('../migrations/',import.meta.url))).filter(n=>n.endsWith('.sql')).sort();
    assert.deepEqual(names,Object.keys(manifest).sort());
    for(const name of names){
      const bytes=await readFile(new URL('../migrations/'+name,import.meta.url));
      assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest[name as keyof typeof manifest]);
      let source=bytes.toString();
      if(name==='001-auth.sql'){assert.equal(source.split('CREATE EXTENSION IF NOT EXISTS pgcrypto;').length,2);source=source.replace('CREATE EXTENSION IF NOT EXISTS pgcrypto;','');}
      await pg.exec(source);
    }
    neonConfig.fetchFunction=async(_url:unknown,init:{body:string})=>{
      stats.queries++;const body=JSON.parse(init.body);assert.equal(typeof body.query,'string');assert.ok(Array.isArray(body.params));
      try{const result=await pg.query(body.query,body.params),fields=result.fields.map(f=>({name:f.name,dataTypeID:f.dataTypeID}));
        const rows=result.rows.map(row=>fields.map(f=>{const x=(row as any)[f.name];if(x==null)return null;if(f.dataTypeID===114||f.dataTypeID===3802)return JSON.stringify(x);if(typeof x==='boolean')return x?'t':'f';if(x instanceof Date)return x.toISOString().replace('T',' ').replace('Z','+00');return String(x);}));
        return Response.json({fields,rows,rowCount:result.affectedRows??result.rows.length,command:body.query.trim().split(/\s+/)[0]});
      }catch(error){const e=error as Error&{code?:string};return Response.json({message:e.message,code:e.code},{status:400});}
    };
    await run(async(text,values=[])=>(await pg.query(text,values)).rows as any[],stats);
    assert.deepEqual(blobRequests.filter(r=>!r.startsWith('GET ')&&r!=='POST /delete'),[]);
  }finally{
    await pg.close();blobStore.close();globalThis.fetch=previous.fetch;neonConfig.fetchFunction=previous.transport;
    for(const [name,value]of Object.entries({DATABASE_URL:previous.url,AUX_AUTH_SECRET:previous.secret,AUX_DATA_ENCRYPTION_KEY:previous.key,BLOB_READ_WRITE_TOKEN:previous.blob,VERCEL_BLOB_API_URL:previous.blobApi,CLERK_SECRET_KEY:previous.clerk}))if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
}
