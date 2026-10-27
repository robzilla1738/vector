import { Hono } from 'hono';
import { pruneAuthState,purgeDeletedUserData } from './auth';
import { cleanExpiredAttachmentUploads, cleanExpiredFeedback } from './attachments';
import { cleanOrphanSyncObjects } from './sync';
import { sql } from './db';
import { cleanRetiredSessionBlobs } from './session-sync';
import { isInternalRequest } from './internal-auth';
import { cleanExpiredSyncRecoveryChallenges } from './sync-recovery-store';

// One failing step or account never stops the rest; the summary names what failed.
async function step<T>(failures:string[],name:string,run:()=>Promise<T>){
  try{return await run();}
  catch(error){failures.push(name);console.error(JSON.stringify({event:'aux.maintenance.step_failed',step:name,error:String(error)}));return {failed:true};}
}
async function purgeAccounts(failures:string[]){
  // Oldest attempt first, so one stuck account cannot starve the others.
  const users=await sql`SELECT id FROM aux_users WHERE deleted_at IS NOT NULL AND data_purged_at IS NULL ORDER BY purge_attempted_at NULLS FIRST,deleted_at LIMIT 20`;
  let purged=0,incomplete=0,failed=0;
  for(const user of users){
    try{if((await purgeDeletedUserData(user.id)).complete)purged++;else incomplete++;}
    catch(error){failed++;failures.push(`account:${user.id}`);console.error(JSON.stringify({event:'aux.maintenance.purge_failed',userId:user.id,error:String(error)}));}
  }
  return {purged,incomplete,failed};
}

export const maintenanceRoutes=new Hono();
maintenanceRoutes.get('/maintenance',async c=>{
  if(!isInternalRequest(c.req.header('authorization'))) return c.json({error:'Unauthorized'},401);
  const blob=!!process.env.BLOB_READ_WRITE_TOKEN,failures:string[]=[];
  const summary={
    recovery:await step(failures,'recovery',cleanExpiredSyncRecoveryChallenges),
    auth:await step(failures,'auth',async()=>{await pruneAuthState();return {ok:true};}),
    uploads:blob?await step(failures,'uploads',()=>cleanExpiredAttachmentUploads(50)):{cleaned:0},
    feedback:blob?await step(failures,'feedback',()=>cleanExpiredFeedback(50)):{cleaned:0},
    sync:await step(failures,'sync',cleanOrphanSyncObjects),
    sessions:blob?await step(failures,'sessions',cleanRetiredSessionBlobs):{cleaned:0},
    accounts:await step(failures,'accounts',()=>purgeAccounts(failures)),
  };
  const ok=failures.length===0;
  console.log(JSON.stringify({event:'aux.maintenance.completed',ok,failures,...summary}));
  return c.json({ok,failures,...summary},ok?200:500);
});
