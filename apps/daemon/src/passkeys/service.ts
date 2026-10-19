import {
  createHash,
  createPrivateKey,
  generateKeyPairSync,
  randomBytes,
  randomUUID,
  sign,
  verify,
} from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Cbor, cbor } from './cbor.js';
import {
  type FreshVerification,
  freshVerificationSchema,
  type PasskeyRecord,
  type PasskeyRequest,
  type PasskeyScope,
  type PasskeySummary,
  type PasskeyVaultAdapter,
  passkeyRecordSchema,
  proofSchema,
  requestSchema,
} from './schema.js';

interface Host {
  home: string;
  requireAccount(id: number): unknown;
  bindings(): { accountId: number; profileId: string }[];
}
interface Pending {
  request: PasskeyRequest;
  generation: number;
  used: boolean;
}
const hash = (value: Uint8Array | string) =>
  createHash('sha256').update(value).digest();
const b64 = (value: Uint8Array) => Buffer.from(value).toString('base64url');
function bytes(value: unknown, min = 1, max = 65536): Buffer {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]+$/.test(value))
    throw new Error('Invalid WebAuthn encoding.');
  const decoded = Buffer.from(value, 'base64url');
  if (b64(decoded) !== value || decoded.length < min || decoded.length > max)
    throw new Error('Invalid WebAuthn length.');
  return decoded;
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid WebAuthn options.');
  return value as Record<string, unknown>;
}
function list(value: unknown): Record<string, unknown>[] {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 256)
    throw new Error('Invalid credential list.');
  return value.map(object);
}
function text(value: unknown, max = 1024): string {
  if (typeof value !== 'string' || value.length > max)
    throw new Error('Invalid passkey user label.');
  return value;
}
function summary(record: PasskeyRecord): PasskeySummary {
  return {
    id: record.id,
    rpId: record.rpId,
    userName: record.userName,
    displayName: record.displayName,
    createdAt: record.createdAt,
    ...(record.lastUsedAt === undefined
      ? {}
      : { lastUsedAt: record.lastUsedAt }),
  };
}
function authData(rpId: string, flags: number, counter: number): Buffer {
  const number = Buffer.alloc(4);
  number.writeUInt32BE(counter);
  return Buffer.concat([hash(rpId), Buffer.from([flags]), number]);
}
function allowed(request: PasskeyRequest, record: PasskeyRecord): boolean {
  return (
    record.rpId === request.rpId &&
    (!list(request.options.allowCredentials).length ||
      list(request.options.allowCredentials).some(
        (c) =>
          c.type === 'public-key' && b64(bytes(c.id)) === record.credentialId,
      ))
  );
}
export class PasskeyService {
  private pending = new Map<string, Pending>();
  private replay = new Map<string, number>();
  // Incognito keys never enter the adapter, disk, snapshot or persistent index.
  private ephemeral = new Map<string, PasskeyRecord[]>();
  constructor(
    private host: Host,
    private vault: PasskeyVaultAdapter,
    private now = () => Date.now(),
  ) {}
  private scope(request: PasskeyRequest, scope: PasskeyScope) {
    this.host.requireAccount(scope.accountId);
    if (
      request.accountId !== scope.accountId ||
      request.profileId !== scope.profileId ||
      request.browserMode !== scope.browserMode ||
      !this.host
        .bindings()
        .some(
          (b) =>
            b.accountId === scope.accountId && b.profileId === scope.profileId,
        )
    )
      throw new Error('Passkey request scope changed.');
    if (
      request.expiresAt <= this.now() ||
      request.expiresAt > this.now() + 125000
    )
      throw new Error('Passkey request expired.');
  }
  private validate(request: PasskeyRequest) {
    const options = request.options;
    const origin = new URL(request.origin);
    if (
      origin.origin !== request.origin ||
      request.topOrigin !== request.origin ||
      (origin.protocol !== 'https:' &&
        !(
          origin.protocol === 'http:' &&
          ['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)
        ))
    )
      throw new Error('Unsupported passkey origin or frame.');
    // Chromium already performed public suffix and remote RP validation. These
    // local checks additionally bind the signed envelope and exact client data.
    if (
      origin.hostname !== request.rpId &&
      !origin.hostname.endsWith(`.${request.rpId}`)
    )
      throw new Error('Passkey RP does not match origin.');
    const data = object(
      JSON.parse(bytes(request.clientDataJSON, 1, 131072).toString('utf8')),
    );
    if (
      data.type !== `webauthn.${request.kind}` ||
      data.origin !== request.origin ||
      data.crossOrigin === true ||
      data.challenge !== options.challenge
    )
      throw new Error('Passkey client data mismatch.');
    bytes(options.challenge, 16, 65536);
    const extensions =
      options.extensions === undefined ? {} : object(options.extensions);
    if (
      Object.keys(extensions).some((k) => k !== 'credProps') ||
      (extensions.credProps !== undefined && extensions.credProps !== true)
    )
      throw new Error(
        'Aux Vault does not support the requested WebAuthn extension.',
      );
    if (request.kind === 'create') {
      const rp = object(options.rp),
        user = object(options.user);
      if (rp.id !== undefined && rp.id !== request.rpId)
        throw new Error('Passkey RP changed.');
      bytes(user.id, 1, 64);
      text(user.name);
      text(user.displayName);
      if (
        !list(options.pubKeyCredParams).some(
          (c) => c.type === 'public-key' && c.alg === -7,
        )
      )
        throw new Error('Aux Vault supports ES256 only.');
      if (options.attestation !== undefined && options.attestation !== 'none')
        throw new Error('Aux Vault supports none attestation only.');
      const selection =
        options.authenticatorSelection === undefined
          ? {}
          : object(options.authenticatorSelection);
      if (
        selection.authenticatorAttachment !== undefined &&
        selection.authenticatorAttachment !== 'platform'
      )
        throw new Error('Aux Vault is a platform authenticator.');
      for (const credential of list(options.excludeCredentials))
        bytes(credential.id);
    } else {
      if (options.rpId !== undefined && options.rpId !== request.rpId)
        throw new Error('Passkey RP changed.');
      for (const credential of list(options.allowCredentials))
        bytes(credential.id);
    }
  }
  begin(scope: PasskeyScope, proof: unknown) {
    for (const [id, expires] of this.replay)
      if (expires <= this.now()) this.replay.delete(id);
    for (const [id, pending] of this.pending)
      if (pending.request.expiresAt <= this.now()) this.pending.delete(id);
    const signed = proofSchema.parse(proof);
    if (
      !verify(
        'sha256',
        Buffer.from(`Aux Passkey Request v1\n${signed.payload}`),
        readFileSync(join(this.host.home, 'installation-public.pem')),
        Buffer.from(signed.signature, 'base64'),
      )
    )
      throw new Error('Invalid native passkey request proof.');
    const request = requestSchema.parse(JSON.parse(signed.payload));
    this.scope(request, scope);
    this.validate(request);
    if (scope.browserMode === 'incognito') {
      const prefix = `${scope.accountId}/${scope.profileId}/`,
        current = this.key(scope, request);
      for (const key of this.ephemeral.keys())
        if (key.startsWith(prefix) && key !== current)
          this.ephemeral.delete(key);
    }
    if (this.replay.has(request.id))
      throw new Error('Passkey request has already been completed.');
    const generation = this.vault.generation(scope.accountId);
    const previous = this.pending.get(request.id);
    if (
      previous &&
      JSON.stringify(previous.request) !== JSON.stringify(request)
    )
      throw new Error('Passkey request changed.');
    if (this.pending.size >= 128 && !previous)
      throw new Error('Too many pending passkey requests.');
    if (previous && (previous.generation !== generation || previous.used))
      throw new Error(
        'Passkey request is already in progress or Vault changed.',
      );
    if (!previous)
      this.pending.set(request.id, { request, generation, used: false });
    return {
      requestId: request.id,
      kind: request.kind,
      rpId: request.rpId,
      origin: request.origin,
      expiresAt: request.expiresAt,
      incognito: scope.browserMode === 'incognito',
      user:
        request.kind === 'create'
          ? {
              name: object(request.options.user).name,
              displayName: object(request.options.user).displayName,
            }
          : null,
      candidates:
        request.kind === 'get'
          ? this.records(scope, request)
              .filter((r) => allowed(request, r))
              .map(summary)
          : [],
    };
  }
  private key(scope: PasskeyScope, request: PasskeyRequest) {
    return `${scope.accountId}/${scope.profileId}/${request.profileSession}`;
  }
  private records(
    scope: PasskeyScope,
    request: PasskeyRequest,
  ): PasskeyRecord[] {
    return (
      scope.browserMode === 'incognito'
        ? (this.ephemeral.get(this.key(scope, request)) ?? [])
        : this.vault.readPasskeys(scope.accountId)
    ).map((r) => passkeyRecordSchema.parse(r));
  }
  cancel(scope: PasskeyScope, id: string) {
    const pending = this.pending.get(id);
    if (!pending) return false;
    this.scope(pending.request, scope);
    this.pending.delete(id);
    this.replay.set(id, pending.request.expiresAt);
    return true;
  }
  clearEphemeral(accountId: number, profileId?: string) {
    for (const key of this.ephemeral.keys())
      if (
        key.startsWith(`${accountId}/`) &&
        (!profileId || key.startsWith(`${accountId}/${profileId}/`))
      )
        this.ephemeral.delete(key);
    for (const [id, p] of this.pending)
      if (
        p.request.accountId === accountId &&
        (!profileId ||
          (p.request.profileId === profileId &&
            p.request.browserMode === 'incognito'))
      )
        this.pending.delete(id);
  }
  retirePrivateSession(
    accountId: number,
    profileId: string,
    profileSession: string,
  ) {
    this.ephemeral.delete(`${accountId}/${profileId}/${profileSession}`);
    for (const [id, p] of this.pending)
      if (
        p.request.accountId === accountId &&
        p.request.profileId === profileId &&
        p.request.profileSession === profileSession &&
        p.request.browserMode === 'incognito'
      )
        this.pending.delete(id);
  }
  async confirm(
    scope: PasskeyScope,
    id: string,
    verification: FreshVerification,
    selectedId?: string,
  ) {
    const pending = this.pending.get(id);
    if (!pending || pending.used)
      throw new Error('Passkey request is no longer active.');
    this.scope(pending.request, scope);
    if (this.vault.generation(scope.accountId) !== pending.generation)
      throw new Error('Vault state changed. Reopen this passkey request.');
    pending.used = true; // concurrent consent / failed UV cannot replay this attempt
    try {
      const generation = await this.vault.verifyFresh(
        scope.accountId,
        freshVerificationSchema.parse(verification),
      );
      if (generation !== pending.generation || this.pending.get(id) !== pending)
        throw new Error('Vault state changed during verification.');
      this.scope(pending.request, scope);
      let response: unknown;
      const mutate = (unknownRecords: unknown[]) => {
        const records = unknownRecords.map((r) => passkeyRecordSchema.parse(r));
        if (
          records.some((r) => r.recentRequests.some((prior) => prior.id === id))
        )
          throw new Error('Passkey request was already used.');
        for (const record of records)
          record.recentRequests = record.recentRequests.filter(
            (prior) => prior.expiresAt > this.now(),
          );
        if (pending.request.kind === 'create') {
          const created = this.create(pending.request, records);
          records.push(created.record);
          response = created.response;
        } else response = this.assert(pending.request, records, selectedId);
        return records;
      };
      if (scope.browserMode === 'incognito') {
        if (this.vault.generation(scope.accountId) !== generation)
          throw new Error('Vault locked.');
        this.ephemeral.set(
          this.key(scope, pending.request),
          mutate(this.records(scope, pending.request)) as PasskeyRecord[],
        );
      } else this.vault.commitPasskeys(scope.accountId, generation, mutate);
      this.pending.delete(id);
      this.replay.set(id, pending.request.expiresAt);
      return response;
    } catch (error) {
      this.pending.delete(id);
      this.replay.set(id, pending.request.expiresAt);
      throw error;
    }
  }
  private create(request: PasskeyRequest, records: PasskeyRecord[]) {
    const excluded = list(request.options.excludeCredentials);
    if (
      records.some(
        (r) =>
          r.rpId === request.rpId &&
          excluded.some((c) => b64(bytes(c.id)) === r.credentialId),
      )
    )
      throw new Error('An excluded passkey already exists.');
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'prime256v1',
    });
    const jwk = publicKey.export({ format: 'jwk' }),
      credentialId = randomBytes(32),
      user = object(request.options.user);
    const record = passkeyRecordSchema.parse({
      id: randomUUID(),
      revision: 1,
      credentialId: b64(credentialId),
      rpId: request.rpId,
      userId: b64(bytes(user.id, 1, 64)),
      userName: text(user.name),
      displayName: text(user.displayName),
      privateKey: privateKey
        .export({ format: 'der', type: 'pkcs8' })
        .toString('base64'),
      publicX: jwk.x,
      publicY: jwk.y,
      counter: 0,
      createdAt: this.now(),
      recentRequests: [{ id: request.id, expiresAt: request.expiresAt }],
    });
    const cose = cbor(
      new Map<Cbor, Cbor>([
        [1, 2],
        [3, -7],
        [-1, 1],
        [-2, bytes(jwk.x, 32, 32)],
        [-3, bytes(jwk.y, 32, 32)],
      ]),
    );
    const length = Buffer.alloc(2);
    length.writeUInt16BE(credentialId.length);
    const auth = Buffer.concat([
      authData(request.rpId, 0x45, 0),
      Buffer.alloc(16),
      length,
      credentialId,
      cose,
    ]);
    return {
      record,
      response: {
        id: record.credentialId,
        rawId: record.credentialId,
        type: 'public-key',
        authenticatorAttachment: 'platform',
        response: {
          clientDataJSON: request.clientDataJSON,
          authenticatorData: b64(auth),
          attestationObject: b64(
            cbor(
              new Map<Cbor, Cbor>([
                ['fmt', 'none'],
                ['authData', auth],
                ['attStmt', new Map()],
              ]),
            ),
          ),
          transports: ['internal'],
          publicKeyAlgorithm: -7,
          publicKey: b64(publicKey.export({ format: 'der', type: 'spki' })),
        },
        clientExtensionResults:
          request.options.extensions &&
          object(request.options.extensions).credProps
            ? { credProps: { rk: true } }
            : {},
      },
    };
  }
  private assert(
    request: PasskeyRequest,
    records: PasskeyRecord[],
    selectedId?: string,
  ) {
    const matches = records.filter((r) => allowed(request, r));
    const record = selectedId
      ? matches.find((r) => r.id === selectedId)
      : matches.length === 1
        ? matches[0]
        : undefined;
    if (!record) throw new Error('Select an available passkey.');
    if (record.counter === 4294967295)
      throw new Error('Passkey signature counter is exhausted.');
    if (record.recentRequests.length >= 128)
      throw new Error('Too many recent passkey requests.');
    record.recentRequests.push({
      id: request.id,
      expiresAt: request.expiresAt,
    });
    record.counter++;
    record.revision++;
    record.lastUsedAt = this.now();
    const auth = authData(request.rpId, 0x05, record.counter);
    const privateBytes = Buffer.from(record.privateKey, 'base64');
    try {
      const key = createPrivateKey({
        key: privateBytes,
        format: 'der',
        type: 'pkcs8',
      });
      const signature = sign(
        'sha256',
        Buffer.concat([auth, hash(bytes(request.clientDataJSON))]),
        key,
      );
      return {
        id: record.credentialId,
        rawId: record.credentialId,
        type: 'public-key',
        authenticatorAttachment: 'platform',
        response: {
          clientDataJSON: request.clientDataJSON,
          authenticatorData: b64(auth),
          signature: b64(signature),
          userHandle: record.userId,
        },
        clientExtensionResults: {},
      };
    } finally {
      privateBytes.fill(0);
    }
  }
}
