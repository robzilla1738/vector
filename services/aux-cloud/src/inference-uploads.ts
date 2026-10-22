/** One-use private model inputs. URLs and provider credentials never cross this boundary. */
import { createHash } from 'node:crypto';
import { get, del } from '@vercel/blob';
import { HTTPException } from 'hono/http-exception';
import { sql } from './db';

export const MAX_INFERENCE_BYTES = 20 * 1024 * 1024;
type InputRow = { id: string; user_id: string; pathname: string; content_type: string; expected_size: number | string; expected_sha256: string };
export type InferenceInput = { id: string; bytes: Buffer; mimeType: string };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(status: 400 | 404 | 409 | 413, message: string): never { throw new HTTPException(status, { message }); }

export function assertInputSignature(bytes: Uint8Array, mime: string) {
  const b = Buffer.from(bytes), ascii = (start: number, end: number) => b.subarray(start, end).toString('ascii');
  const valid = mime === 'image/png' ? b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))
    : mime === 'image/jpeg' ? b[0] === 255 && b[1] === 216 && b[2] === 255
    : mime === 'image/webp' ? ascii(0,4) === 'RIFF' && ascii(8,12) === 'WEBP'
    : mime === 'audio/webm' ? b.subarray(0,4).equals(Buffer.from([26,69,223,163]))
    : ['audio/mp4','audio/m4a','audio/x-m4a'].includes(mime) ? ascii(4,8) === 'ftyp'
    : ['audio/mpeg','audio/mp3'].includes(mime) ? ascii(0,3) === 'ID3' || (b[0] === 255 && (b[1]! & 224) === 224)
    : ['audio/wav','audio/x-wav'].includes(mime) ? ascii(0,4) === 'RIFF' && ascii(8,12) === 'WAVE'
    : mime === 'audio/ogg' ? ascii(0,4) === 'OggS'
    : mime === 'audio/flac' ? ascii(0,4) === 'fLaC' : false;
  if (!valid) invalid(400, 'Model input bytes do not match the supported MIME type.');
}

/** Exported for focused integrity tests; production paths come exclusively from owned DB rows. */
export async function readVerifiedInferenceInput(row: InputRow, load: typeof get = get): Promise<InferenceInput> {
  const size = Number(row.expected_size);
  if (!Number.isSafeInteger(size) || size < 1 || size > MAX_INFERENCE_BYTES) invalid(413, 'Model input exceeds 20 MiB.');
  const blob = await load(row.pathname, { access: 'private', useCache: false, abortSignal: AbortSignal.timeout(120_000) });
  if (!blob || blob.statusCode !== 200) invalid(409, 'Private model input is unavailable.');
  if (blob.blob.size !== size || blob.blob.contentType.split(';')[0] !== row.content_type) {
    await blob.stream.cancel(); invalid(409, 'Private model input metadata changed.');
  }
  const reader = blob.stream.getReader(), chunks: Buffer[] = [], hash = createHash('sha256');
  let received = 0;
  try {
    for (;;) {
      const next = await reader.read(); if (next.done) break;
      received += next.value.byteLength;
      if (received > size) { await reader.cancel(); invalid(413, 'Model input exceeds its reservation.'); }
      hash.update(next.value); chunks.push(Buffer.from(next.value));
    }
  } finally { reader.releaseLock(); }
  if (received !== size || hash.digest('hex') !== row.expected_sha256) invalid(409, 'Private model input failed integrity verification.');
  const bytes = Buffer.concat(chunks); assertInputSignature(bytes, row.content_type);
  return { id: row.id, bytes, mimeType: row.content_type };
}

/** Claim all IDs atomically before reading; another request cannot reuse an input during inference. */
export async function withInferenceUploads<T>(userId: string, ids: string[], run: (inputs: InferenceInput[]) => Promise<T>, dependencies = { query: sql, load: get, remove: del }): Promise<T> {
  const query = dependencies.query;
  if (!ids.length) return run([]);
  if (ids.length > 16 || new Set(ids).size !== ids.length || ids.some(id => !uuid.test(id))) invalid(400, 'Invalid private model input references.');
  const results = await query.transaction([
    query`SELECT pg_advisory_xact_lock(hashtextextended(${userId},0))`,
    query`UPDATE aux_attachments SET state='failed',expires_at=greatest(expires_at,now()+interval '3 minutes') WHERE id=ANY(${ids}::uuid[]) AND user_id=${userId} AND purpose='inference' AND state='ready' AND expires_at>now()
      AND (SELECT count(*) FROM aux_attachments WHERE id=ANY(${ids}::uuid[]) AND user_id=${userId} AND purpose='inference' AND state='ready' AND expires_at>now())=${ids.length}
      RETURNING id,user_id,pathname,content_type,expected_size,expected_sha256`,
  ]);
  const rows = results[1] as InputRow[];
  if (rows.length !== ids.length) invalid(404, 'Private model input not found or already consumed.');
  try {
    if (rows.reduce((sum,row) => sum + Number(row.expected_size), 0) > MAX_INFERENCE_BYTES) invalid(413, 'Combined model inputs exceed 20 MiB.');
    const inputs: InferenceInput[] = [];
    for (const id of ids) inputs.push(await readVerifiedInferenceInput(rows.find(row => row.id === id)!, dependencies.load));
    return await run(inputs);
  } finally {
    // Keep failed rows when Blob deletion fails: scheduled cleanup retries after the TTL.
    // Cleanup failures must not turn a successful paid inference into a replayable request.
    await Promise.allSettled(rows.map(async row => {
      await dependencies.remove(row.pathname);
      // Retain the tombstone until expiry: an issued signed PUT may still complete late.
    }));
  }
}
