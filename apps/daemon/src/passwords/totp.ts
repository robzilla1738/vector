import { createHmac } from 'node:crypto';

// Independently implemented from RFC6238 and Google's public Key URI format.
// Never return provisioning keys or embed their values in errors.
export function oneTimeCode(provisioning: string, now = Date.now()) {
  let secret = provisioning.trim();
  let algorithm = 'sha1';
  let digits = 6;
  let period = 30;
  if (/^otpauth:/i.test(secret)) {
    const uri = new URL(secret);
    if (uri.protocol !== 'otpauth:' || uri.hostname !== 'totp')
      throw new Error('Choose a time-based one-time code key.');
    for (const name of ['secret', 'algorithm', 'digits', 'period'])
      if (uri.searchParams.getAll(name).length > 1)
        throw new Error('This one-time code setup has duplicate options.');
    secret = uri.searchParams.get('secret') ?? '';
    algorithm = (uri.searchParams.get('algorithm') ?? 'SHA1').toLowerCase();
    digits = Number(uri.searchParams.get('digits') ?? '6');
    period = Number(uri.searchParams.get('period') ?? '30');
  }
  if (
    !['sha1', 'sha256', 'sha512'].includes(algorithm) ||
    ![6, 8].includes(digits) ||
    !Number.isInteger(period) ||
    period < 1 ||
    period > 300 ||
    !Number.isSafeInteger(now) ||
    now < 0
  )
    throw new Error('This one-time code setup uses unsupported options.');
  secret = secret.replace(/\s/g, '').toUpperCase();
  const unpadded = secret.replace(/=+$/, '');
  const remainder = unpadded.length % 8;
  if (
    !/^[A-Z2-7]+={0,6}$/.test(secret) ||
    unpadded.length > 4096 ||
    ![0, 2, 4, 5, 7].includes(remainder) ||
    (secret.includes('=') && secret.length % 8 !== 0)
  )
    throw new Error('Enter a valid Base32 one-time code key.');
  const bytes: number[] = [];
  let accumulator = 0;
  let bits = 0;
  for (const char of unpadded) {
    accumulator =
      (accumulator << 5) | 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'.indexOf(char);
    bits += 5;
    if (bits >= 8) {
      bits -= 8;
      bytes.push((accumulator >>> bits) & 255);
      accumulator &= (1 << bits) - 1;
    }
  }
  if (accumulator !== 0 || bytes.length < 10)
    throw new Error('Enter a valid one-time code key of at least 80 bits.');
  const key = Buffer.from(bytes);
  const counter = Buffer.alloc(8);
  const step = Math.floor(now / 1000 / period);
  counter.writeBigUInt64BE(BigInt(step));
  let digest: Buffer | undefined;
  try {
    digest = createHmac(algorithm, key).update(counter).digest();
    const offset = (digest[digest.length - 1] ?? 0) & 15;
    const truncated = digest.readUInt32BE(offset) & 0x7fffffff;
    return {
      code: String(truncated % 10 ** digits).padStart(digits, '0'),
      expiresAt: (step + 1) * period * 1000,
      period,
    };
  } finally {
    key.fill(0);
    bytes.fill(0);
    counter.fill(0);
    digest?.fill(0);
  }
}
