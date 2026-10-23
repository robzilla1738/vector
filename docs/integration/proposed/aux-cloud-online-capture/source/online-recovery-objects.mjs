import { createHash } from 'node:crypto';
import { Readable } from 'node:stream';

const MAX_OBJECTS = 100_000;
const MAX_ATTACHMENT = 100 * 1024 * 1024;
const MAX_AVATAR = 2 * 1024 * 1024;
const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
const attachmentPath = new RegExp(`^aux/${uuid}/${uuid}/content$`);
const avatarPath = new RegExp(`^avatars/${uuid}/${uuid}$`);

// The caller opens the actual repeatable-read transaction and exports THAT
// snapshot to pg_dump. A client object or these returned rows grant no isolation.
export async function readOnlineSnapshotObjects(db) {
  const result = await db.query(`
    SELECT 'attachment' AS family, pathname, content_type, expected_size, expected_sha256
      FROM aux_attachments WHERE state='ready' AND purpose<>'inference'
    UNION ALL
    SELECT 'avatar' AS family, avatar_path AS pathname, avatar_mime AS content_type,
           NULL::bigint AS expected_size, NULL::text AS expected_sha256
      FROM aux_users WHERE avatar_path IS NOT NULL
    ORDER BY pathname LIMIT 100001`);
  if (result.rows.length > MAX_OBJECTS) throw Error('Recovery object capacity requires review');
  const paths = new Set();
  return result.rows.map(row => {
    if (paths.has(row.pathname)) throw Error('Duplicate recovery object reference');
    paths.add(row.pathname);
    if (typeof row.content_type !== 'string' || !row.content_type || row.content_type.length > 255 || /[\r\n\0]/.test(row.content_type))
      throw Error('Unsupported recovery content type');
    if (row.family === 'attachment') {
      const size = Number(row.expected_size);
      if (!attachmentPath.test(row.pathname) || row.expected_size === null || !Number.isSafeInteger(size) || size < 0 || size > MAX_ATTACHMENT ||
          !/^[a-f0-9]{64}$/.test(row.expected_sha256)) throw Error('Invalid attachment recovery reference');
      return Object.freeze({ ...row, expected_size: size, maximum_size: size });
    }
    if (row.family !== 'avatar' || !avatarPath.test(row.pathname) ||
        !['image/png', 'image/jpeg', 'image/webp'].includes(row.content_type) ||
        row.expected_size !== null || row.expected_sha256 !== null) throw Error('Invalid avatar recovery reference');
    // Avatar writes use unique UUID paths, never overwrite, and enforce 2 MiB.
    // Unlike attachments, their DB rows have no size/hash. Measure and bind both
    // in the sealed manifest rather than inventing a DB commitment.
    return Object.freeze({ ...row, maximum_size: MAX_AVATAR });
  });
}

export async function* onlineBlobEntries(objects, load, expectedHostname) {
  for (let index = 0; index < objects.length; index++) {
    const reference = objects[index];
    const response = await load(reference.pathname, {
      access: 'private', useCache: false, abortSignal: AbortSignal.timeout(120_000),
    });
    if (!response || response.statusCode !== 200) throw Error('Snapshot object unavailable; online capture aborted');
    const advertised = response.headers.get('content-length');
    const contentType = response.blob.contentType?.split(';')[0];
    if (response.blob.pathname !== reference.pathname || new URL(response.blob.url).hostname !== expectedHostname ||
        contentType !== reference.content_type ||
        (advertised !== null && (!/^\d+$/.test(advertised) || !Number.isSafeInteger(Number(advertised)) ||
         Number(advertised) > reference.maximum_size ||
         (reference.expected_size !== null && Number(advertised) !== reference.expected_size)))) {
      await response.stream.cancel();
      throw Error('Snapshot object identity or advertised metadata mismatch');
    }
    let size = 0;
    const hash = createHash('sha256');
    const object = { ...reference };
    async function* checkedSource() {
      const reader = response.stream.getReader();
      let ended = false;
      try {
        for (;;) {
          const chunk = await reader.read();
          if (chunk.done) { ended = true; break; }
          size += chunk.value.byteLength;
          if (size > reference.maximum_size) throw Error('Snapshot object exceeds capture bound');
          hash.update(chunk.value);
          yield chunk.value;
        }
        const digest = hash.digest('hex');
        if ((advertised !== null && size !== Number(advertised)) ||
            (reference.expected_size !== null && size !== reference.expected_size) ||
            (reference.expected_sha256 !== null && digest !== reference.expected_sha256) ||
            (reference.family === 'avatar' && size === 0)) throw Error('Snapshot object failed full integrity check');
        object.observed_size = size;
        object.observed_sha256 = digest;
      } finally {
        try { if (!ended) await reader.cancel(); }
        finally { reader.releaseLock(); }
      }
    }
    // Delay reads/errors until writeBundle's pipeline has attached handlers;
    // eagerly composing streams could fail while it creates the sealed header.
    yield { name: `blob-${index}.bin`, source: Readable.from(checkedSource()), object };
  }
}
