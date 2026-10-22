import { Hono } from 'hono';
import { sql } from './db';
import { isInternalRequest } from './internal-auth';
import manifest from './schema-manifest.json';

type Migration={name:string;sha256:string};
export function createReadinessRoutes(inspect:()=>Promise<Migration[]>=async()=>(await sql`SELECT name,sha256 FROM aux_migrations`).map(row=>({name:String(row.name),sha256:String(row.sha256)}))) {
  return new Hono().get('/readiness',async c=>{
    if(!isInternalRequest(c.req.header('authorization')))return c.json({error:'Unauthorized'},401);
    try {
      const rows=await inspect(),applied=new Map(rows.map(row=>[row.name,row.sha256]));
      const mismatches=Object.entries(manifest).filter(([name,sha])=>applied.get(name)!==sha).length;
      // A newer database may include additive migrations during a rollback.
      return c.json({service:'aux-cloud',status:mismatches?'degraded':'ready',database:'reachable',schema:mismatches?'mismatch':'current',mismatches},mismatches?503:200);
    }catch{return c.json({service:'aux-cloud',status:'degraded',database:'unavailable'},503);}
  });
}
export const readinessRoutes=createReadinessRoutes();
