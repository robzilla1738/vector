import { timingSafeEqual } from 'node:crypto';

export function isInternalRequest(authorization:string|undefined) {
  const expected=process.env.CRON_SECRET, actual=authorization?.startsWith('Bearer ')?authorization.slice(7):undefined;
  return !!expected&&!!actual&&Buffer.byteLength(expected)===Buffer.byteLength(actual)&&timingSafeEqual(Buffer.from(expected),Buffer.from(actual));
}
