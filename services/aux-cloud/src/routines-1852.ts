import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';
import { sql } from './db';
import { deviceSchema, validateDevice, type AuthVariables } from './auth';

const identifier = z.string().min(1).max(128).regex(/^[A-Za-z0-9_-]+$/);
const date = z.string().datetime({ offset: true });
const reference = z.string().min(1).max(256);
const model = z.object({ provider: z.string().max(200), modelId: z.string().min(1).max(300), thinkingLevel: z.enum(['off','minimal','low','medium','high','xhigh','max']), fastMode: z.boolean().optional() }).strict();
const sessionConfig = z.object({ model: model.optional(), harnessId: z.enum(['v1','orchestrator','worker','coder']).optional(), permissionMode: z.enum(['read-only','guard','full-access']).optional(), notificationsEnabled: z.boolean().optional() }).strict();
const origin = z.discriminatedUnion('type', [z.object({type:z.literal('user')}).strict(),z.object({type:z.literal('session-message'),sessionId:reference,messageId:z.string().min(1).max(256)}).strict(),z.object({type:z.literal('channel-message'),channelId:reference,messageId:z.string().min(1).max(256)}).strict()]);
const wire = z.object({ id: identifier, type: z.enum(['standalone','child','internal']), environment: z.enum(['device','cloud']), deviceId: z.string().uuid().nullable(), revision: z.number().int().positive(), appliedRevision: z.number().int().positive().nullable(), name: z.string().trim().min(1).max(200), prompt: z.string().trim().min(1).max(100_000), rrule: z.string().min(1).max(2000), parentSessionId: reference.nullable(), channelId: reference.nullable(), projectId: reference.nullable(), status: z.enum(['active','paused','completed','deleted']), nextRunAt: date.nullable(), pausedAt: date.nullable(), deletedAt: date.nullable(), createdAt: date, updatedAt: date, metadata: z.object({origin:origin.optional(),memoryPath:z.string().max(1024).optional()}).strict(), sessionConfig });
const creation = wire.omit({ revision:true, appliedRevision:true, updatedAt:true }).strict();
const createInput = creation.extend({ device: deviceSchema.optional() }).strict();
const patch = wire.pick({name:true,prompt:true,rrule:true,sessionConfig:true}).partial().extend({revision:z.number().int().positive(),status:z.enum(['active','paused','deleted']).optional(),device:deviceSchema.optional()}).strict();
const deviceSync = z.object({ device: deviceSchema, routines: z.array(z.object({id:identifier,revision:z.number().int().positive(),status:z.enum(['active','paused','completed','deleted']),nextRunAt:date.nullable()}).strict()).max(1000) }).strict();
const format = 'aux.routine.v2';
function failure(status:400|401|403|404|409|412|413,code:string,message:string):never { throw new HTTPException(status,{res:Response.json({error:{code,message}},{status})}); }
function record(value:unknown) {
  if (!value || typeof value!=='object' || !('format' in value) || value.format!==format) failure(409,'ROUTINE_FORMAT_UNSUPPORTED','This routine uses an unsupported older format. Its data is preserved.');
  const {format:_,...data}=value;return wire.parse(data);
}
async function ownDevice(user:string,id:string|null) {
  if(!id)failure(400,'DEVICE_REQUIRED','Choose a signed-in device.');
  const [row]=await sql`SELECT id FROM aux_sessions WHERE id=${id} AND user_id=${user} AND revoked_at IS NULL AND expires_at>now() AND device_fingerprint IS NOT NULL`;
  if(!row)failure(403,'DEVICE_UNAVAILABLE','This device is unavailable to the signed-in account.');
}
async function currentDevice(user:string,session:string,value:z.infer<typeof deviceSchema>) {
  try { validateDevice(value); } catch { failure(400,'INVALID_DEVICE','Provide a matching installation public key and fingerprint.'); }
  if(session.startsWith('clerk:'))failure(403,'DEVICE_REQUIRED','Use an installation-authenticated desktop session.');
  const [row]=await sql`SELECT id FROM aux_sessions WHERE id=${session} AND user_id=${user} AND device_fingerprint=${value.ikSigKeyFingerprint} AND revoked_at IS NULL AND expires_at>now()`;
  if(!row)failure(403,'DEVICE_UNAVAILABLE','The installation does not match the authenticated session.');
  return row.id as string;
}
export const routines1852Routes=new Hono<{Variables:AuthVariables}>();
routines1852Routes.use('*',async(c,next)=>{if(!c.get('user')?.id)throw new HTTPException(401);c.header('Cache-Control','no-store');await next();});
routines1852Routes.get('/routines',async c=>{
  const rows=await sql`SELECT payload FROM sync_entities WHERE user_id=${c.get('user').id} AND kind='routine' ORDER BY entity_id LIMIT 1001`;
  if(rows.length>1000)failure(413,'ROUTINE_LIMIT','Too many routines to synchronize.');
  const values=rows.map(row=>record(row.payload));
  if(Buffer.byteLength(JSON.stringify(values))>3*1024*1024)failure(413,'ROUTINE_LIMIT','Routine definitions exceed the bounded synchronization limit.');
  return c.json(values);
});
routines1852Routes.get('/routines/:id',async c=>{
  const id=identifier.parse(c.req.param('id')),[row]=await sql`SELECT payload FROM sync_entities WHERE user_id=${c.get('user').id} AND kind='routine' AND entity_id=${id}`;
  if(!row)failure(404,'NOT_FOUND','Routine not found.');return c.json(record(row.payload));
});
routines1852Routes.post('/routines',async c=>{
  const input=createInput.parse(await c.req.json()),{device,...body}=input,user=c.get('user');
  if(body.environment!=='device')failure(409,'CLOUD_ROUTINE_UNAVAILABLE','Cloud routine execution is unavailable. Choose a device routine.');
  await ownDevice(user.id,body.deviceId);if(device)await currentDevice(user.id,user.sessionId,device);
  const now=new Date().toISOString(),payload={format,...body,revision:1,appliedRevision:null,updatedAt:now},serialized=JSON.stringify(payload);
  const results=await sql.transaction([sql`SELECT pg_advisory_xact_lock(hashtextextended(${user.id},0))`,sql`SELECT u.id FROM aux_users u JOIN aux_sessions d ON d.user_id=u.id WHERE u.id=${user.id} AND u.deleted_at IS NULL AND d.id=${body.deviceId} AND d.revoked_at IS NULL AND d.expires_at>now() FOR SHARE OF u,d`,sql`INSERT INTO sync_entities(user_id,kind,entity_id,payload) SELECT ${user.id},'routine',${body.id},${serialized}::jsonb WHERE EXISTS(SELECT 1 FROM aux_users u JOIN aux_sessions d ON d.user_id=u.id WHERE u.id=${user.id} AND u.deleted_at IS NULL AND d.id=${body.deviceId} AND d.revoked_at IS NULL AND d.expires_at>now()) AND (SELECT count(*) FROM sync_entities WHERE user_id=${user.id} AND kind='routine')<1000 AND coalesce((SELECT sum(octet_length(payload::text)) FROM sync_entities WHERE user_id=${user.id} AND kind='routine'),0)+octet_length(${serialized}::jsonb::text)<=3145728 ON CONFLICT(user_id,kind,entity_id) DO NOTHING RETURNING payload`]);
  if(results[2][0])return c.json(record(results[2][0].payload));
  const [existing]=await sql`SELECT payload FROM sync_entities WHERE user_id=${user.id} AND kind='routine' AND entity_id=${body.id}`;
  if(!existing)failure(413,'ROUTINE_LIMIT','Routine storage limit reached.');
  const retained=record(existing.payload);
  const {revision:_,appliedRevision:__,updatedAt:___,...retainedCreation}=retained;
  if(JSON.stringify(retainedCreation)!==JSON.stringify(body))failure(409,'ROUTINE_EXISTS','A different routine already has this ID; its current definition is preserved.');
  return c.json(retained);
});
routines1852Routes.patch('/routines/:id',async c=>{
  const id=identifier.parse(c.req.param('id')),input=patch.parse(await c.req.json()),{revision,device,...changes}=input,user=c.get('user');
  if(!Object.keys(changes).length)failure(400,'EMPTY_PATCH','Choose a routine change.');
  if(device)await currentDevice(user.id,user.sessionId,device);
  const [row]=await sql`SELECT payload FROM sync_entities WHERE user_id=${user.id} AND kind='routine' AND entity_id=${id}`;
  if(!row)failure(404,'NOT_FOUND','Routine not found.');const current=record(row.payload);
  if(current.environment!=='device')failure(409,'CLOUD_ROUTINE_UNAVAILABLE','Cloud routines are preserved and unavailable.');
  if(current.revision!==revision)failure(412,'PRECONDITION_FAILED','This routine changed. Refresh before applying your change.');
  if(current.status==='deleted')failure(409,'ROUTINE_DELETED','Deleted routines cannot be reactivated.');
  const now=new Date().toISOString(),next={format,...current,...changes,revision:revision+1,updatedAt:now,...changes.status==='paused'?{pausedAt:now,nextRunAt:null}:changes.status==='deleted'?{deletedAt:now,nextRunAt:null}:changes.status==='active'?{pausedAt:null}:{}},serialized=JSON.stringify(next);
  const results=await sql.transaction([sql`SELECT pg_advisory_xact_lock(hashtextextended(${user.id},0))`,sql`SELECT id FROM aux_users WHERE id=${user.id} AND deleted_at IS NULL FOR SHARE`,sql`UPDATE sync_entities SET payload=${serialized}::jsonb WHERE user_id=${user.id} AND kind='routine' AND entity_id=${id} AND EXISTS(SELECT 1 FROM aux_users u WHERE u.id=${user.id} AND u.deleted_at IS NULL) AND payload->>'format'=${format} AND payload->>'environment'='device' AND (payload->>'revision')::bigint=${revision} AND coalesce((SELECT sum(octet_length(payload::text)) FROM sync_entities WHERE user_id=${user.id} AND kind='routine' AND entity_id<>${id}),0)+octet_length(${serialized}::jsonb::text)<=3145728 RETURNING payload`]);
  if(!results[2][0])failure(412,'PRECONDITION_FAILED','This routine changed or reached its storage bound; refresh before retrying.');return c.json(record(results[2][0].payload));
});
routines1852Routes.post('/routines/device-sync',async c=>{
  const input=deviceSync.parse(await c.req.json()),user=c.get('user'),device=await currentDevice(user.id,user.sessionId,input.device);
  if(new Set(input.routines.map(value=>value.id)).size!==input.routines.length)failure(400,'DUPLICATE_ROUTINE','Duplicate routine IDs.');
  await sql.transaction([sql`SELECT u.id FROM aux_users u JOIN aux_sessions d ON d.user_id=u.id WHERE u.id=${user.id} AND u.deleted_at IS NULL AND d.id=${device} AND d.revoked_at IS NULL AND d.expires_at>now() FOR SHARE OF u,d`,sql`WITH updates AS(SELECT * FROM jsonb_to_recordset(${JSON.stringify(input.routines)}::jsonb) AS r(id text,revision bigint,status text,"nextRunAt" text)) UPDATE sync_entities e SET payload=jsonb_set(jsonb_set(jsonb_set(jsonb_set(e.payload,'{appliedRevision}',to_jsonb(r.revision)),'{nextRunAt}',CASE WHEN e.payload->>'status'='active' AND r.status='active' THEN coalesce(to_jsonb(r."nextRunAt"),'null'::jsonb) ELSE 'null'::jsonb END),'{status}',to_jsonb(CASE WHEN e.payload->>'status'='active' AND r.status='completed' THEN 'completed' ELSE e.payload->>'status' END)),'{updatedAt}',to_jsonb(${new Date().toISOString()}::text)) FROM updates r WHERE e.user_id=${user.id} AND e.kind='routine' AND e.entity_id=r.id AND e.payload->>'format'=${format} AND e.payload->>'environment'='device' AND e.payload->>'deviceId'=${device} AND EXISTS(SELECT 1 FROM aux_users u JOIN aux_sessions d ON d.user_id=u.id WHERE u.id=${user.id} AND u.deleted_at IS NULL AND d.id=${device} AND d.revoked_at IS NULL AND d.expires_at>now()) AND (e.payload->>'revision')::bigint=r.revision AND (e.payload->'appliedRevision' IS DISTINCT FROM to_jsonb(r.revision) OR e.payload->>'nextRunAt' IS DISTINCT FROM CASE WHEN e.payload->>'status'='active' AND r.status='active' THEN r."nextRunAt" ELSE NULL END OR (e.payload->>'status'='active' AND r.status='completed'))`]);
  return c.json({ok:true});
});
routines1852Routes.put('/routines/:id',()=>failure(409,'ROUTINE_FORMAT_REQUIRED','Use the versioned routine create/update protocol. Older records are preserved.'));
routines1852Routes.delete('/routines/:id',()=>failure(409,'ROUTINE_REVISION_REQUIRED','Delete through the revision-checked routine status update.'));
