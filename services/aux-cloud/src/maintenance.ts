import { Hono } from 'hono';
import { pruneAuthState,purgeDeletedUserData } from './auth';
import { cleanExpiredAttachmentUploads } from './attachments';
import { cleanOrphanSyncObjects } from './sync';
import { sql } from './db';
import { cleanRetiredSessionBlobs } from './session-sync';
import { isInternalRequest } from './internal-auth';

export const maintenanceRoutes=new Hono();
maintenanceRoutes.get('/maintenance',async c=>{
  if(!isInternalRequest(c.req.header('authorization'))) return c.json({error:'Unauthorized'},401);
  await pruneAuthState();
  const expired=process.env.BLOB_READ_WRITE_TOKEN?await cleanExpiredAttachmentUploads(50):{cleaned:0};
  const sync=await cleanOrphanSyncObjects();
  const sessions=process.env.BLOB_READ_WRITE_TOKEN?await cleanRetiredSessionBlobs():{cleaned:0};
  const users=await sql`SELECT id FROM aux_users WHERE deleted_at IS NOT NULL AND data_purged_at IS NULL ORDER BY deleted_at LIMIT 20`;
  let purged=0;
  for(const user of users) if((await purgeDeletedUserData(user.id)).complete) purged++;
  return c.json({ok:true,uploads:expired,sync,sessions,accountsPurged:purged});
});
