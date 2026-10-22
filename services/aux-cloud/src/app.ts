import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { bodyLimit } from 'hono/body-limit';
import { HTTPException } from 'hono/http-exception';
import { ZodError } from 'zod';
import { authRoutes, authWebhooks, requireUser, type AuthVariables } from './auth';
import { billingRoutes, billingWebhooks } from './billing';
import { inferenceRoutes } from './inference';
import { syncRoutes } from './sync';
import { attachmentRoutes, blobCallbackRoutes } from './attachments';
import { maintenanceRoutes } from './maintenance';

export const app=new Hono<{Variables:AuthVariables}>().basePath('/api/v1');
app.use('*',bodyLimit({maxSize:4*1024*1024,onError:c=>c.json({error:'Use a private upload for payloads larger than 4 MiB.'},413)}));
app.use('*',cors({origin:origin=>{
  const allowed=(process.env.AUX_ALLOWED_ORIGINS||process.env.NEXT_PUBLIC_APP_URL||'https://app.getaux.co').split(',');
  allowed.push('chrome-extension://gokkffaiccpmoeodpmeamcjajcagjmkm');
  return allowed.includes(origin)?origin:undefined;
},allowHeaders:['Authorization','Content-Type','If-Match','If-None-Match','X-Aside-Auth-Protocol','X-Aux-Sync-Encryption'],exposeHeaders:['ETag','Content-Range','Accept-Ranges'],maxAge:600}));
app.use('*',async(c,next)=>{c.header('Cache-Control','no-store');c.header('X-Content-Type-Options','nosniff');await next();});
app.get('/health',c=>c.json({service:'aux-cloud',status:'ok',version:1}));
app.route('/auth',authRoutes);
app.route('/webhooks',billingWebhooks);
app.route('/webhooks/clerk',authWebhooks);
app.route('/',blobCallbackRoutes);
app.route('/internal',maintenanceRoutes);
app.get('/billing/plans',c=>billingRoutes.fetch(new Request(new URL('/plans',c.req.url))));
app.get('/ai/catalog/v1',c=>inferenceRoutes.fetch(new Request(new URL('/ai/catalog/v1',c.req.url))));
app.get('/ai/models/v2',c=>inferenceRoutes.fetch(new Request(new URL('/ai/models/v2',c.req.url))));
app.use('*',requireUser);
app.route('/billing',billingRoutes);
app.route('/',syncRoutes);
app.route('/',attachmentRoutes);
app.route('/',inferenceRoutes);
app.notFound(c=>c.json({error:'This Aux endpoint is not available.'},404));
app.onError((error,c)=>{
  if(error instanceof ZodError) return c.json({error:'Invalid request',fields:error.issues.map(i=>i.path.join('.'))},400);
  if(error instanceof HTTPException) return error.res?error.getResponse():c.json({error:error.message},error.status);
  // Do not log bodies, tokens, email addresses, database URLs or provider errors.
  console.error(JSON.stringify({event:'aux_request_failed',path:c.req.routePath,name:error.name}));
  return c.json({error:'The service could not complete this request. Please retry.'},503);
});
