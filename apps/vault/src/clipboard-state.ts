export const CLIPBOARD_LIFETIME_MS = 30000;
export type ClipboardLease = {
  generation: string;
  salt: string;
  digest: string;
  deadline: number;
};
export async function clipboardDigest(value: string, salt: string) {
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(`${salt}\0${value}`),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}
export function isClipboardLease(value: unknown): value is ClipboardLease {
  if (!value || typeof value !== 'object') return false;
  const lease = value as ClipboardLease;
  return (
    typeof lease.generation === 'string' &&
    /^[0-9a-f-]{36}$/.test(lease.generation) &&
    typeof lease.salt === 'string' &&
    /^[0-9a-f-]{36}$/.test(lease.salt) &&
    typeof lease.digest === 'string' &&
    /^[0-9a-f]{64}$/.test(lease.digest) &&
    Number.isFinite(lease.deadline)
  );
}
