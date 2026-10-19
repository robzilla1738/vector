import {
  createHmac,
  generateKeyPairSync,
  randomBytes,
  randomUUID,
  timingSafeEqual,
  verify,
} from 'node:crypto';
import {
  chmodSync,
  existsSync,
  lstatSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { AUTH_DOMAIN, AUTH_SCHEME, clientKindSchema } from '@aux/contracts';
export class Authority {
  private challenges = new Map<
    string,
    { bytes: Buffer; kind: string; expires: number }
  >();
  private secret: Buffer;
  private publicKey: string;
  constructor(
    home: string,
    private now = () => Date.now(),
  ) {
    const privatePath = join(home, 'installation-private.pem'),
      publicPath = join(home, 'installation-public.pem');
    for (const name of [
      'installation-private.pem',
      'installation-public.pem',
      'session-secret',
    ]) {
      const path = join(home, name);
      if (existsSync(path) && lstatSync(path).isSymbolicLink())
        throw new Error('Installation identity must be a regular file');
    }
    if (!existsSync(privatePath)) {
      const pair = generateKeyPairSync('ec', {
        namedCurve: 'prime256v1',
        privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
        publicKeyEncoding: { format: 'pem', type: 'spki' },
      });
      writeFileSync(privatePath, pair.privateKey, { mode: 0o600, flag: 'wx' });
      writeFileSync(publicPath, pair.publicKey, { mode: 0o644, flag: 'wx' });
    }
    chmodSync(privatePath, 0o600);
    this.publicKey = readFileSync(publicPath, 'utf8');
    const secretPath = join(home, 'session-secret');
    if (!existsSync(secretPath))
      writeFileSync(secretPath, randomBytes(32), { mode: 0o600, flag: 'wx' });
    chmodSync(secretPath, 0o600);
    this.secret = readFileSync(secretPath);
  }
  challenge(kind: unknown) {
    const parsed = clientKindSchema.parse(kind);
    for (const [id, item] of this.challenges)
      if (item.expires <= this.now()) this.challenges.delete(id);
    const oldest = this.challenges.keys().next().value;
    if (this.challenges.size >= 1024 && oldest) this.challenges.delete(oldest);
    const challengeId = randomUUID(),
      bytes = randomBytes(32);
    this.challenges.set(challengeId, {
      bytes,
      kind: parsed,
      expires: this.now() + 30_000,
    });
    return { challengeId, challenge: bytes.toString('base64') };
  }
  session(id: string, signature: string) {
    const item = this.challenges.get(id);
    this.challenges.delete(id);
    if (!item || item.expires <= this.now()) return null;
    try {
      if (
        !verify(
          'sha256',
          Buffer.concat([Buffer.from(AUTH_DOMAIN), item.bytes]),
          this.publicKey,
          Buffer.from(signature, 'base64'),
        )
      )
        return null;
    } catch {
      return null;
    }
    const now = Math.floor(this.now() / 1000),
      payload = {
        iss: 'aux-daemon',
        aud: 'aux-daemon-localhost',
        sub: item.kind,
        iat: now,
        exp: now + 86400,
      };
    const body = `${Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')}.${Buffer.from(JSON.stringify(payload)).toString('base64url')}`;
    return {
      access_token: `${body}.${this.mac(body).toString('base64url')}`,
      expiresInSeconds: 86400,
      token_type: AUTH_SCHEME,
    };
  }
  private mac(body: string) {
    return createHmac('sha256', this.secret).update(body).digest();
  }
  verify(token: string): string | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const [head, payload, signature] = parts as [string, string, string],
        expected = this.mac(`${head}.${payload}`),
        actual = Buffer.from(signature, 'base64url');
      if (
        actual.length !== expected.length ||
        !timingSafeEqual(actual, expected)
      )
        return null;
      const h = JSON.parse(Buffer.from(head, 'base64url').toString()),
        p = JSON.parse(Buffer.from(payload, 'base64url').toString());
      if (
        h.alg !== 'HS256' ||
        p.iss !== 'aux-daemon' ||
        p.aud !== 'aux-daemon-localhost' ||
        !clientKindSchema.safeParse(p.sub).success ||
        !Number.isFinite(p.exp) ||
        p.exp <= Math.floor(this.now() / 1000)
      )
        return null;
      return p.sub;
    } catch {
      return null;
    }
  }
  authorization(value: string | undefined) {
    const prefix = `${AUTH_SCHEME} `;
    return value?.startsWith(prefix)
      ? this.verify(value.slice(prefix.length))
      : null;
  }
}
