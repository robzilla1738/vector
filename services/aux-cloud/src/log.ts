import type { Context } from 'hono';

export const safeLabel=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9_.]{1,64}$/.test(value)?value:undefined;
/** One JSON line per event, tied to the platform request id. Never pass bodies, tokens, emails or IP addresses. */
export function logEvent(level:'error'|'warn',c:Context,event:string,fields:Record<string,unknown>={}) {
  console[level](JSON.stringify({event,requestId:c.get('requestId')??c.req.header('x-vercel-id')??null,path:c.req.routePath,...fields}));
}
