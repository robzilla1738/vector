import { Hono } from 'hono';
import { createHash } from 'node:crypto';
import { sql } from './db';
import { isReadinessRequest } from './internal-auth';
import manifest from './schema-manifest.json';
import { launchCapabilities } from './launch-mode';

const schemaIdentity={requiredMigrations:Object.keys(manifest).length,schemaManifestSha256:createHash('sha256').update(JSON.stringify(manifest)).digest('hex')};
type Migration={name:string;sha256:string};
export function createReadinessRoutes(inspect:()=>Promise<Migration[]>=async()=>(await sql`SELECT name,sha256 FROM aux_migrations`).map(row=>({name:String(row.name),sha256:String(row.sha256)}))) {
  return new Hono().get('/readiness',async c=>{
    if(!isReadinessRequest(c.req.header('authorization')))return c.json({error:'Unauthorized'},401);
    try {
      const rows=await inspect(),applied=new Map(rows.map(row=>[row.name,row.sha256]));
      const mismatches=Object.entries(manifest).filter(([name,sha])=>applied.get(name)!==sha).length;
      // A newer database may include additive migrations during a rollback.
      return c.json({...launchCapabilities(),...schemaIdentity,service:'aux-cloud',status:mismatches?'degraded':'ready',database:'reachable',schema:mismatches?'mismatch':'current',mismatches},mismatches?503:200);
    }catch{return c.json({...launchCapabilities(),...schemaIdentity,service:'aux-cloud',status:'degraded',database:'unavailable'},503);}
  });
}
export const readinessRoutes=createReadinessRoutes();
