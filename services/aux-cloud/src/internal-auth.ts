import { timingSafeEqual } from 'node:crypto';

function bearerMatches(authorization:string|undefined, expected:string|undefined) {
  const actual=authorization?.startsWith('Bearer ')?authorization.slice(7):undefined;
  return !!expected&&!!actual&&Buffer.byteLength(expected)===Buffer.byteLength(actual)&&timingSafeEqual(Buffer.from(expected),Buffer.from(actual));
}
// Vercel Cron sends CRON_SECRET; only maintenance accepts it.
export const isInternalRequest=(authorization:string|undefined)=>bearerMatches(authorization,process.env.CRON_SECRET);
// The external monitor holds its own token, never the cron secret.
export const isReadinessRequest=(authorization:string|undefined)=>bearerMatches(authorization,process.env.AUX_READINESS_SECRET);
