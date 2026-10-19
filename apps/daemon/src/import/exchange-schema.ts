import {
  createHash,
  createPrivateKey,
  createPublicKey,
  randomUUID,
  sign,
  verify,
} from 'node:crypto';
import { z } from 'zod';
import { type PasskeyRecord, passkeyRecordSchema } from '../passkeys/schema.js';
import { itemFields } from '../vault/schema.js';

const bytes = (maximum: number) =>
  z
    .string()
    .min(1)
    .max(maximum * 2)
    .refine((value) => {
      const decoded = Buffer.from(value, 'base64');
      return (
        decoded.length > 0 &&
        decoded.length <= maximum &&
        decoded.toString('base64') === value
      );
    }, 'Invalid encoded credential data.');
const metadata = z.object({
  sourceId: z.string().min(1).max(256),
  title: z.string().max(1024),
  subtitle: z.string().max(4096),
  urls: z.array(z.url().max(8192)).max(100),
  tags: z.array(z.string().max(128)).max(100),
  favorite: z.boolean(),
  createdAt: z.number().finite().nonnegative().optional(),
});
export const exchangeRecord = z.discriminatedUnion('kind', [
  metadata
    .extend({
      kind: z.literal('password'),
      username: z.string().max(65536),
      password: z.string().min(1).max(65536),
      notes: z.string().max(2_000_000).default(''),
    })
    .strict(),
  metadata
    .extend({
      kind: z.literal('passkey'),
      credentialId: bytes(1024),
      rpId: z.string().min(1).max(253),
      userName: z.string().max(1024),
      displayName: z.string().max(1024),
      userId: bytes(64),
      privateKey: bytes(4096),
    })
    .strict(),
]);
export const exchangeHelperStatus = z
  .object({
    sessionId: z.string().uuid(),
    receiptId: z.string().uuid().nullable(),
    state: z.enum([
      'waiting',
      'importing',
      'ready',
      'failed',
      'cancelled',
      'timeout',
      'succeeded',
    ]),
    createdAt: z.number(),
    updatedAt: z.number(),
    passwordTotal: z.number().int().nonnegative(),
    passkeyTotal: z.number().int().nonnegative(),
    passwordCompleted: z.number().int().nonnegative(),
    passkeyCompleted: z.number().int().nonnegative(),
    unsupported: z.record(z.string().max(64), z.number().int().nonnegative()),
    cursor: z.number().int().min(0).max(10000),
  })
  .strict();
export const exchangeBatch = z
  .object({
    sessionId: z.string().uuid(),
    receiptId: z.string().uuid(),
    cursor: z.number().int().min(0).max(10000),
    records: z.array(exchangeRecord).max(32),
    done: z.boolean(),
  })
  .strict();
export function passwordFields(
  record: Extract<z.infer<typeof exchangeRecord>, { kind: 'password' }>,
  vaultId: string,
) {
  const urls = [...new Set(record.urls)].sort();
  for (const value of urls) {
    const url = new URL(value);
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      throw new Error('Unsupported credential scope address.');
  }
  const item = itemFields.parse({
    vaultId,
    category: 'login',
    title: record.title.trim() || 'Imported login',
    subtitle: record.subtitle,
    urls,
    tags: [...new Set(record.tags)].sort(),
    favorite: record.favorite,
    notes: record.notes,
    loginFields: { username: record.username, password: record.password },
    sections: [],
    state: 'active',
    reprompt: false,
    agentAccessPolicy: 'while-unlocked',
  });
  return {
    ...item,
    importProvenance: {
      source: 'native-credential-exchange',
      fingerprint: createHash('sha256')
        .update(JSON.stringify(item))
        .digest('hex'),
      ...(record.createdAt !== undefined
        ? { originalCreatedAt: String(record.createdAt) }
        : {}),
    },
  };
}
export function importedPasskey(
  record: Extract<z.infer<typeof exchangeRecord>, { kind: 'passkey' }>,
): PasskeyRecord {
  const rp = new URL(`https://${record.rpId}`);
  if (
    rp.hostname !== record.rpId.toLowerCase() ||
    rp.port ||
    rp.username ||
    rp.password ||
    rp.pathname !== '/' ||
    rp.search ||
    rp.hash
  )
    throw new Error('Invalid imported relying party.');
  const bytes = Buffer.from(record.privateKey, 'base64');
  try {
    const key = createPrivateKey({ key: bytes, format: 'der', type: 'pkcs8' });
    if (
      key.asymmetricKeyType !== 'ec' ||
      key.asymmetricKeyDetails?.namedCurve !== 'prime256v1'
    )
      throw new Error('Unsupported imported key algorithm.');
    const publicKey = createPublicKey(key),
      jwk = publicKey.export({ format: 'jwk' });
    const probe = Buffer.from('Aux credential exchange key validation v1');
    if (!verify('sha256', probe, publicKey, sign('sha256', probe, key)))
      throw new Error('Inconsistent imported key pair.');
    return passkeyRecordSchema.parse({
      id: randomUUID(),
      revision: 1,
      credentialId: Buffer.from(record.credentialId, 'base64').toString(
        'base64url',
      ),
      rpId: rp.hostname,
      userId: Buffer.from(record.userId, 'base64').toString('base64url'),
      userName: record.userName,
      displayName: record.displayName,
      privateKey: key
        .export({ format: 'der', type: 'pkcs8' })
        .toString('base64'),
      publicX: jwk.x,
      publicY: jwk.y,
      counter: 0,
      createdAt: record.createdAt ?? Date.now(),
      recentRequests: [],
    });
  } finally {
    bytes.fill(0);
  }
}
