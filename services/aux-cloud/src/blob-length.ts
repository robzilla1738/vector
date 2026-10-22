import type { GetBlobResult } from '@vercel/blob';

/** SDK2.8 synthesizes size0 when a chunked private read has no Content-Length. */
export function advertisedBlobLength(blob: Pick<GetBlobResult, 'headers'>): number | null {
  const value = blob.headers.get('content-length');
  if (value === null) return null; // Unknown length; callers must verify the actual bytes or HEAD metadata.
  if (!/^[0-9]+$/.test(value) || !Number.isSafeInteger(Number(value))) return Number.NaN;
  return Number(value);
}
