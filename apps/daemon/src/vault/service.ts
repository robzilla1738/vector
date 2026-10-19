import { randomUUID, timingSafeEqual } from 'node:crypto';
import {
  closeSync,
  existsSync,
  fsyncSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { dirname } from 'node:path';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  createKdf,
  cryptoReady,
  domain,
  open,
  parseRecovery,
  passwordKey,
  randomKey,
  recoveryText,
  seal,
  wipe,
} from '../cipher/crypto.js';
import type { Store } from '../storage/store.js';
import type {
  EncryptedRecord,
  Envelope,
  ItemPatch,
  VaultItem,
  VaultRecord,
} from './schema.js';
import {
  envelopeSchema,
  itemSchema,
  recordId,
  validateRecordKeys,
  vaultSchema,
} from './schema.js';
import { type VaultSettings, vaultSettings } from './settings.js';

type VaultStore = Pick<
  Store,
  | 'requireAccount'
  | 'safeFile'
  | 'registerAccountDeletionHandler'
  | 'accounts'
  | 'get'
  | 'set'
>;
const passkeyRecord = z
  .object({ id: recordId, revision: z.number().int().positive() })
  .passthrough();
function failure(
  code:
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'PRECONDITION_FAILED'
    | 'CONFLICT'
    | 'NOT_FOUND'
    | 'FORBIDDEN'
    | 'TOO_MANY_REQUESTS',
  message: string,
): never {
  throw new TRPCError({ code, message });
}
function writeJson(path: string, value: unknown) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  const descriptor = openSync(temporary, 'wx', 0o600);
  try {
    writeFileSync(descriptor, JSON.stringify(value));
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
  renameSync(temporary, path);
  const directory = openSync(dirname(path), 'r');
  try {
    fsyncSync(directory);
  } finally {
    closeSync(directory);
  }
}
export interface VaultBiometryAdapter {
  status(
    accountId: number,
  ): Promise<{ available: boolean; enrolled: boolean; reason?: string }>;
  enroll(
    accountId: number,
    key: string,
  ): Promise<{ available: boolean; enrolled: boolean; reason?: string }>;
  unlock(accountId: number): Promise<{ key: string }>;
  remove(
    accountId: number,
  ): Promise<{ available: boolean; enrolled: boolean; reason?: string }>;
}
export class VaultService {
  private keys = new Map<number, Uint8Array>();
  private deadlines = new Map<
    number,
    { at: number; timer: ReturnType<typeof setTimeout> }
  >();
  settings(accountId: number): VaultSettings {
    this.store.requireAccount(accountId);
    return vaultSettings.parse(
      this.store.get(accountId, 'vaultSettings', 'preferences') ?? {},
    );
  }
  setSettings(accountId: number, value: VaultSettings) {
    this.key(accountId);
    const parsed = vaultSettings.parse(value);
    this.store.set(accountId, 'vaultSettings', 'preferences', parsed);
    this.activity(accountId);
    return parsed;
  }
  private expireIfDue(accountId: number) {
    const deadline = this.deadlines.get(accountId);
    if (deadline && deadline.at <= Date.now()) this.lock(accountId);
  }
  private activity(accountId: number) {
    const previous = this.deadlines.get(accountId);
    if (previous) clearTimeout(previous.timer);
    this.deadlines.delete(accountId);
    const minutes = this.settings(accountId).lockTimeoutMinutes;
    if (minutes <= 0 || !this.keys.has(accountId)) return;
    const at = Date.now() + minutes * 60_000;
    const timer = setTimeout(
      () => this.expireIfDue(accountId),
      minutes * 60_000,
    );
    timer.unref();
    this.deadlines.set(accountId, { at, timer });
  }

  private generations = new Map<number, number>();
  private securityHandlers = new Set<(accountId: number) => void>();
  private freshChecks = new Map<
    number,
    { failures: number; blockedUntil: number; pending: boolean }
  >();
  private unregister: () => void;
  constructor(
    private store: VaultStore,
    private biometry?: VaultBiometryAdapter,
  ) {
    this.unregister = store.registerAccountDeletionHandler(
      async (accountId) => {
        if (this.biometry) await this.removeBiometry(accountId);
        this.lock(accountId);
      },
    );
    for (const account of store.accounts()) this.publishSecurity(account.id);
  }
  private file(accountId: number) {
    return this.store.safeFile(accountId, 'vault-state.json');
  }
  private read(accountId: number) {
    const path = this.file(accountId);
    if (!existsSync(path))
      failure('PRECONDITION_FAILED', 'Set up your local Vault first.');
    const envelope = envelopeSchema.parse(
      JSON.parse(readFileSync(path, 'utf8')),
    );
    validateRecordKeys(envelope);
    if (envelope.accountId !== accountId)
      failure('FORBIDDEN', 'Vault account identity does not match.');
    return envelope;
  }
  private write(envelope: Envelope) {
    writeJson(this.file(envelope.accountId), envelope);
  }
  private publishSecurity(accountId: number) {
    writeJson(this.store.safeFile(accountId, 'security-state.json'), {
      version: 1,
      accountId,
      configured: existsSync(this.file(accountId)),
      locked: !this.keys.has(accountId),
      updatedAt: Date.now(),
    });
  }

  private key(accountId: number) {
    this.store.requireAccount(accountId);
    this.expireIfDue(accountId);
    const key = this.keys.get(accountId);
    if (!key) failure('PRECONDITION_FAILED', 'Unlock your Vault to continue.');
    this.activity(accountId);
    return key;
  }
  generation(accountId: number) {
    this.store.requireAccount(accountId);
    return this.generations.get(accountId) ?? 0;
  }
  registerSecurityChangeHandler(handler: (accountId: number) => void) {
    this.securityHandlers.add(handler);
    return () => {
      this.securityHandlers.delete(handler);
    };
  }
  private invalidateSecurity(accountId: number) {
    this.generations.set(accountId, (this.generations.get(accountId) ?? 0) + 1);
    for (const handler of this.securityHandlers) {
      try {
        handler(accountId);
      } catch {
        console.error('A Vault security-state cleanup failed.');
      }
    }
  }
  readPasskeys(accountId: number): unknown[] {
    this.key(accountId);
    return Object.values(this.read(accountId).passkeys).map((record) =>
      this.decrypt(accountId, 'passkey', record),
    );
  }
  commitPasskeys(
    accountId: number,
    expectedGeneration: number,
    mutate: (records: unknown[]) => unknown[],
  ) {
    const key = this.key(accountId);
    if (this.generation(accountId) !== expectedGeneration)
      failure(
        'CONFLICT',
        'The Vault security state changed. Verify this request again.',
      );
    const envelope = this.read(accountId);
    const result = mutate(
      Object.values(envelope.passkeys).map((record) =>
        this.decrypt(accountId, 'passkey', record),
      ),
    );
    const records = z.array(passkeyRecord).max(10000).parse(result);
    if (this.generation(accountId) !== expectedGeneration)
      failure('CONFLICT', 'The Vault security state changed while saving.');
    if (Buffer.byteLength(JSON.stringify(records)) > 16 * 1024 * 1024)
      failure('BAD_REQUEST', 'The encrypted passkey collection is too large.');
    const collection: Record<string, EncryptedRecord> = {};
    for (const record of records) {
      if (collection[record.id])
        failure('CONFLICT', 'Duplicate passkey record identity.');
      collection[record.id] = this.encrypt(accountId, 'passkey', record, key);
    }
    envelope.passkeys = collection;
    envelope.revision++;
    this.write(envelope);
  }
  async verifyFresh(
    accountId: number,
    input: { password?: string; biometric?: true },
  ) {
    await cryptoReady;
    const generation = this.generation(accountId);
    this.key(accountId);
    const check = this.freshChecks.get(accountId) ?? {
      failures: 0,
      blockedUntil: 0,
      pending: false,
    };
    if (check.pending)
      failure('CONFLICT', 'Another Vault verification is in progress.');
    if (Date.now() < check.blockedUntil)
      failure(
        'TOO_MANY_REQUESTS',
        'Wait a minute before verifying this Vault again.',
      );
    if ((typeof input.password === 'string') === (input.biometric === true))
      failure('BAD_REQUEST', 'Choose password or biometric verification.');
    this.freshChecks.set(accountId, check);
    check.pending = true;
    let master: Uint8Array | undefined;
    try {
      if (input.biometric) {
        if (!this.biometry)
          failure(
            'PRECONDITION_FAILED',
            'Biometric verification is unavailable.',
          );
        const response = await this.biometry.unlock(accountId);
        if (!/^[A-Za-z0-9+/]{43}=$/.test(response.key))
          failure(
            'UNAUTHORIZED',
            'Biometric verification returned an invalid key.',
          );
        master = new Uint8Array(Buffer.from(response.key, 'base64'));
        response.key = '';
      } else {
        master = this.passwordMaster(
          this.read(accountId),
          input.password ?? '',
        );
      }
      if (this.generation(accountId) !== generation)
        failure(
          'CONFLICT',
          'This Vault was locked or changed during verification.',
        );
      const current = this.key(accountId);
      if (master.length !== current.length || !timingSafeEqual(master, current))
        failure(
          'UNAUTHORIZED',
          'Verification did not authenticate this Vault.',
        );
      check.failures = 0;
      check.blockedUntil = 0;
      return generation;
    } catch (error) {
      check.failures++;
      if (check.failures >= 5) {
        check.blockedUntil = Date.now() + 60_000;
        check.failures = 0;
      }
      throw error;
    } finally {
      if (master) wipe(master);
      check.pending = false;
    }
  }
  status(accountId: number) {
    this.store.requireAccount(accountId);
    this.expireIfDue(accountId);
    return {
      initialized: existsSync(this.file(accountId)),
      locked: !this.keys.has(accountId),
      biometricAvailable: false,
      formatVersion: 1,
    };
  }
  async setup(accountId: number, password: string) {
    await cryptoReady;
    this.store.requireAccount(accountId);
    if (existsSync(this.file(accountId)))
      failure('CONFLICT', 'This Vault is already set up.');
    if (password.length < 8)
      failure('BAD_REQUEST', 'Choose a password with at least 8 characters.');
    const key = randomKey();
    const recovery = randomKey();
    const kdf = createKdf();
    let derived: Uint8Array | undefined;
    try {
      derived = passwordKey(password, kdf);
      const now = Date.now();
      const vault: VaultRecord = {
        id: randomUUID(),
        name: 'Personal',
        type: 'personal',
        appearance: {},
        revision: 1,
        createdAt: now,
        updatedAt: now,
      };
      const envelope: Envelope = {
        format: 'aux.vault',
        version: 1,
        accountId,
        revision: 1,
        kdf,
        passwordWrap: seal(key, derived, domain(accountId, 'master/password')),
        recoveryWrap: seal(key, recovery, domain(accountId, 'master/recovery')),
        vaults: {},
        items: {},
        history: {},
        passkeys: {},
      };
      envelope.vaults[vault.id] = this.encrypt(accountId, 'vault', vault, key);
      this.write(envelope);
      this.keys.set(accountId, key);
      this.activity(accountId);
      this.publishSecurity(accountId);
      return {
        ...this.status(accountId),
        recoveryKey: recoveryText(recovery),
        revision: 1,
      };
    } catch (error) {
      wipe(key);
      throw error;
    } finally {
      if (derived) wipe(derived);
      wipe(recovery);
    }
  }
  async unlock(accountId: number, password: string) {
    await cryptoReady;
    const envelope = this.read(accountId);
    const key = this.passwordMaster(envelope, password);
    this.lock(accountId);
    this.keys.set(accountId, key);
    this.activity(accountId);
    this.publishSecurity(accountId);
    return this.status(accountId);
  }
  lock(accountId: number) {
    const deadline = this.deadlines.get(accountId);
    if (deadline) clearTimeout(deadline.timer);
    this.deadlines.delete(accountId);
    const key = this.keys.get(accountId);
    if (key) {
      wipe(key);
      this.keys.delete(accountId);
    }
    this.invalidateSecurity(accountId);
    this.publishSecurity(accountId);
    return { locked: true };
  }
  close() {
    for (const account of this.store.accounts()) this.lock(account.id);
    this.unregister();
  }
  async verifyRecovery(accountId: number, text: string) {
    await cryptoReady;
    const envelope = this.read(accountId);
    const key = this.recoveryMaster(envelope, text);
    wipe(key);
    return { valid: true };
  }
  private recoveryMaster(envelope: Envelope, text: string) {
    let recovery: Uint8Array;
    try {
      recovery = parseRecovery(text);
    } catch {
      failure('UNAUTHORIZED', 'This recovery key could not be verified.');
    }
    try {
      return open(
        envelope.recoveryWrap,
        recovery,
        domain(envelope.accountId, 'master/recovery'),
      );
    } catch {
      failure('UNAUTHORIZED', 'This recovery key could not be verified.');
    } finally {
      wipe(recovery);
    }
  }
  async recoverPassword(accountId: number, text: string, newPassword: string) {
    await cryptoReady;
    if (newPassword.length < 8)
      failure('BAD_REQUEST', 'Choose a password with at least 8 characters.');
    const envelope = this.read(accountId);
    const master = this.recoveryMaster(envelope, text);
    const recovery = randomKey();
    const kdf = createKdf();
    let derived: Uint8Array | undefined;
    try {
      derived = passwordKey(newPassword, kdf);
      envelope.kdf = kdf;
      envelope.passwordWrap = seal(
        master,
        derived,
        domain(accountId, 'master/password'),
      );
      envelope.recoveryWrap = seal(
        master,
        recovery,
        domain(accountId, 'master/recovery'),
      );
      envelope.revision++;
      this.write(envelope);
      this.lock(accountId);
      this.keys.set(accountId, master);
      this.activity(accountId);
      this.publishSecurity(accountId);
      return { ...this.status(accountId), recoveryKey: recoveryText(recovery) };
    } catch (error) {
      wipe(master);
      throw error;
    } finally {
      if (derived) wipe(derived);
      wipe(recovery);
    }
  }
  async replaceRecoveryKey(accountId: number, currentPassword: string) {
    const generation = this.generation(accountId);
    await this.verifyFresh(accountId, { password: currentPassword });
    const master = this.key(accountId);
    if (this.generation(accountId) !== generation)
      failure('PRECONDITION_FAILED', 'Vault security changed. Try again.');
    const recovery = randomKey();
    try {
      const envelope = this.read(accountId);
      envelope.recoveryWrap = seal(
        master,
        recovery,
        domain(accountId, 'master/recovery'),
      );
      envelope.revision++;
      this.write(envelope);
      this.invalidateSecurity(accountId);
      return { recoveryKey: recoveryText(recovery) };
    } finally {
      wipe(recovery);
    }
  }
  async changePassword(
    accountId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    await cryptoReady;
    if (newPassword.length < 8)
      failure('BAD_REQUEST', 'Choose a password with at least 8 characters.');
    const envelope = this.read(accountId);
    const master = this.passwordMaster(envelope, currentPassword);
    const kdf = createKdf();
    let derived: Uint8Array | undefined;
    try {
      derived = passwordKey(newPassword, kdf);
      envelope.kdf = kdf;
      envelope.passwordWrap = seal(
        master,
        derived,
        domain(accountId, 'master/password'),
      );
      envelope.revision++;
      this.write(envelope);
      this.invalidateSecurity(accountId);
      this.publishSecurity(accountId);
      return { changed: true };
    } finally {
      wipe(master);
      if (derived) wipe(derived);
    }
  }
  private passwordMaster(envelope: Envelope, password: string) {
    const derived = passwordKey(password, envelope.kdf);
    try {
      return open(
        envelope.passwordWrap,
        derived,
        domain(envelope.accountId, 'master/password'),
      );
    } catch {
      failure('UNAUTHORIZED', 'That password did not unlock the Vault.');
    } finally {
      wipe(derived);
    }
  }
  biometricStatus(accountId: number) {
    this.store.requireAccount(accountId);
    return (
      this.biometry?.status(accountId) ??
      Promise.resolve({
        available: false,
        enrolled: false,
        reason: 'native_helper_unavailable',
      })
    );
  }
  async enrollBiometry(accountId: number, currentPassword: string) {
    await cryptoReady;
    if (!this.biometry)
      failure(
        'PRECONDITION_FAILED',
        'Touch ID requires the native secure-credential helper.',
      );
    const envelope = this.read(accountId);
    const master = this.passwordMaster(envelope, currentPassword);
    const generation = this.generations.get(accountId) ?? 0;
    try {
      const result = await this.biometry.enroll(
        accountId,
        Buffer.from(master).toString('base64'),
      );
      if ((this.generations.get(accountId) ?? 0) !== generation) {
        await this.biometry.remove(accountId);
        failure(
          'PRECONDITION_FAILED',
          'This Vault was locked while enrollment was pending. Try again.',
        );
      }
      this.store.requireAccount(accountId);
      if (!result.enrolled)
        failure(
          'PRECONDITION_FAILED',
          'Biometric enrollment was not completed.',
        );
      return result;
    } finally {
      wipe(master);
    }
  }
  async unlockBiometry(accountId: number) {
    await cryptoReady;
    if (!this.biometry)
      failure(
        'PRECONDITION_FAILED',
        'Touch ID requires the native secure-credential helper.',
      );
    this.read(accountId);
    const generation = this.generations.get(accountId) ?? 0;
    const result = await this.biometry.unlock(accountId);
    if (!/^[A-Za-z0-9+/]{43}=$/.test(result.key))
      failure(
        'UNAUTHORIZED',
        'The native helper returned an invalid Vault key.',
      );
    const master = new Uint8Array(Buffer.from(result.key, 'base64'));
    let plaintext: Uint8Array | undefined;
    let accepted = false;
    try {
      if ((this.generations.get(accountId) ?? 0) !== generation)
        failure(
          'PRECONDITION_FAILED',
          'This Vault was locked while Touch ID was pending. Try again.',
        );
      if (
        master.length !== 32 ||
        Buffer.from(master).toString('base64') !== result.key
      )
        failure(
          'UNAUTHORIZED',
          'The native helper returned an invalid Vault key.',
        );
      const envelope = this.read(accountId);
      const first = Object.values(envelope.vaults)[0];
      if (!first)
        failure(
          'PRECONDITION_FAILED',
          'Unlock with your password and create a personal Vault before using Touch ID.',
        );
      try {
        plaintext = open(
          first.sealed,
          master,
          domain(accountId, `vault/${first.id}/${first.revision}`),
        );
      } catch {
        failure(
          'UNAUTHORIZED',
          'Touch ID could not authenticate the key for this Vault.',
        );
      }
      const record = vaultSchema.parse(
        JSON.parse(new TextDecoder().decode(plaintext)),
      );
      if (record.id !== first.id || record.revision !== first.revision)
        failure(
          'UNAUTHORIZED',
          'The biometric Vault record identity does not match.',
        );
      this.lock(accountId);
      this.keys.set(accountId, master);
      this.activity(accountId);
      this.publishSecurity(accountId);
      accepted = true;
      return this.status(accountId);
    } finally {
      if (!accepted) {
        if (this.keys.get(accountId) === master) this.keys.delete(accountId);
        wipe(master);
      }
      if (plaintext) wipe(plaintext);
    }
  }
  async removeBiometry(accountId: number) {
    this.store.requireAccount(accountId);
    if (!this.biometry)
      failure(
        'PRECONDITION_FAILED',
        'Touch ID requires the native secure-credential helper.',
      );
    const result = await this.biometry.remove(accountId);
    if (result.enrolled)
      failure('PRECONDITION_FAILED', 'The biometric key could not be removed.');
    this.invalidateSecurity(accountId);
    return result;
  }
  private encrypt(
    accountId: number,
    kind: 'vault' | 'item' | 'passkey',
    record: { id: string; revision: number },
    key: Uint8Array,
  ): EncryptedRecord {
    const plaintext = new TextEncoder().encode(JSON.stringify(record));
    try {
      return {
        id: record.id,
        revision: record.revision,
        sealed: seal(
          plaintext,
          key,
          domain(accountId, `${kind}/${record.id}/${record.revision}`),
        ),
      };
    } finally {
      wipe(plaintext);
    }
  }
  private decrypt(
    accountId: number,
    kind: 'vault' | 'item' | 'passkey',
    record: EncryptedRecord,
  ) {
    const key = this.key(accountId);
    let plaintext: Uint8Array;
    try {
      plaintext = open(
        record.sealed,
        key,
        domain(accountId, `${kind}/${record.id}/${record.revision}`),
      );
    } catch {
      failure(
        'PRECONDITION_FAILED',
        'Vault data could not be authenticated. Restore a trusted backup before continuing.',
      );
    }
    try {
      const value = JSON.parse(new TextDecoder().decode(plaintext));
      const parsed =
        kind === 'vault'
          ? vaultSchema.parse(value)
          : kind === 'item'
            ? itemSchema.parse(value)
            : passkeyRecord.parse(value);
      if (parsed.id !== record.id || parsed.revision !== record.revision)
        failure('PRECONDITION_FAILED', 'Vault record identity does not match.');
      return parsed;
    } finally {
      wipe(plaintext);
    }
  }
  snapshot(accountId: number) {
    this.key(accountId);
    const envelope = this.read(accountId);
    return {
      revision: envelope.revision,
      vaults: Object.values(envelope.vaults).map((record) =>
        vaultSchema.parse(this.decrypt(accountId, 'vault', record)),
      ),
      items: Object.values(envelope.items).map((record) =>
        itemSchema.parse(this.decrypt(accountId, 'item', record)),
      ),
    };
  }
  getItem(accountId: number, itemId: string) {
    const envelope = this.read(accountId);
    const item = envelope.items[itemId];
    if (!item) failure('NOT_FOUND', 'This Vault item no longer exists.');
    return itemSchema.parse(this.decrypt(accountId, 'item', item));
  }
  autofillCandidates(accountId: number, documentUrl: string) {
    let target: URL;
    try {
      target = new URL(documentUrl);
    } catch {
      failure('BAD_REQUEST', 'A valid page address is required.');
    }
    if (
      !['http:', 'https:'].includes(target.protocol) ||
      target.username ||
      target.password
    )
      failure(
        'BAD_REQUEST',
        'Autofill candidates require an ordinary web page address.',
      );
    const snapshot = this.snapshot(accountId);
    return {
      items: snapshot.items
        .filter(
          (item) =>
            item.state === 'active' &&
            item.category === 'login' &&
            item.urls.some((value) => {
              try {
                const saved = new URL(value);
                return (
                  ['http:', 'https:'].includes(saved.protocol) &&
                  !saved.username &&
                  !saved.password &&
                  saved.origin === target.origin
                );
              } catch {
                return false;
              }
            }),
        )
        .slice(0, 100)
        .map((item) => ({
          id: item.id,
          title: item.title,
          username: item.loginFields?.username ?? '',
          revision: item.revision,
          reprompt: item.reprompt,
        })),
    };
  }
  createItems(
    accountId: number,
    fields: Omit<VaultItem, 'id' | 'revision' | 'createdAt' | 'updatedAt'>[],
  ) {
    const key = this.key(accountId);
    const envelope = this.read(accountId);
    const created: VaultItem[] = [];
    for (const data of fields) {
      if (data.reprompt)
        failure(
          'PRECONDITION_FAILED',
          'Per-item password reprompt is not available in this local Vault version.',
        );
      if (!envelope.vaults[data.vaultId])
        failure('NOT_FOUND', 'The destination Vault does not exist.');
      if (
        data.importProvenance &&
        Object.values(envelope.items).some((record) => {
          const item = itemSchema.parse(
            this.decrypt(accountId, 'item', record),
          );
          return (
            item.vaultId === data.vaultId &&
            item.importProvenance?.fingerprint ===
              data.importProvenance?.fingerprint
          );
        })
      )
        continue;
      const now = Date.now();
      const item = itemSchema.parse({
        ...data,
        id: randomUUID(),
        revision: 1,
        createdAt: now,
        updatedAt: now,
      });
      envelope.items[item.id] = this.encrypt(accountId, 'item', item, key);
      created.push(item);
    }
    if (created.length) {
      envelope.revision++;
      this.write(envelope);
    }
    return {
      items: created,
      created: created.length,
      skipped: fields.length - created.length,
      revision: envelope.revision,
    };
  }
  updateItem(
    accountId: number,
    itemId: string,
    patch: ItemPatch,
    baseRevision?: number,
  ) {
    const key = this.key(accountId);
    const envelope = this.read(accountId);
    if (patch.reprompt)
      failure(
        'PRECONDITION_FAILED',
        'Per-item password reprompt is not available in this local Vault version.',
      );
    const encrypted = envelope.items[itemId];
    if (!encrypted) failure('NOT_FOUND', 'This Vault item no longer exists.');
    if (baseRevision !== undefined && baseRevision !== encrypted.revision)
      failure('CONFLICT', 'This item changed. Reload it before saving.');
    const previous = itemSchema.parse(
      this.decrypt(accountId, 'item', encrypted),
    );
    const updated = itemSchema.parse({
      ...previous,
      ...Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ),
      id: itemId,
      revision: previous.revision + 1,
      updatedAt: Date.now(),
    });
    if (!envelope.vaults[updated.vaultId])
      failure('NOT_FOUND', 'The destination Vault does not exist.');
    const history = envelope.history[itemId] ?? [];
    envelope.history[itemId] = [...history, encrypted].slice(-1000);
    envelope.items[itemId] = this.encrypt(accountId, 'item', updated, key);
    envelope.revision++;
    this.write(envelope);
    return updated;
  }
  deleteItem(accountId: number, itemId: string) {
    this.key(accountId);
    const envelope = this.read(accountId);
    if (!envelope.items[itemId])
      failure('NOT_FOUND', 'This Vault item no longer exists.');
    delete envelope.items[itemId];
    delete envelope.history[itemId];
    envelope.revision++;
    this.write(envelope);
    return { deleted: true, revision: envelope.revision };
  }
  itemHistory(accountId: number, itemId: string) {
    this.key(accountId);
    const envelope = this.read(accountId);
    if (!envelope.items[itemId])
      failure('NOT_FOUND', 'This Vault item no longer exists.');
    return (envelope.history[itemId] ?? []).map((record) =>
      itemSchema.parse(this.decrypt(accountId, 'item', record)),
    );
  }
  restoreItem(
    accountId: number,
    itemId: string,
    revision: number,
    baseRevision: number,
  ) {
    const key = this.key(accountId);
    const envelope = this.read(accountId);
    const current = envelope.items[itemId];
    if (!current) failure('NOT_FOUND', 'This Vault item no longer exists.');
    if (current.revision !== baseRevision)
      failure('CONFLICT', 'This item changed. Reload it before restoring.');
    const historical = (envelope.history[itemId] ?? []).find(
      (record) => record.revision === revision,
    );
    if (!historical)
      failure('NOT_FOUND', 'This earlier version is no longer available.');
    const restored = itemSchema.parse({
      ...itemSchema.parse(this.decrypt(accountId, 'item', historical)),
      revision: current.revision + 1,
      updatedAt: Date.now(),
    });
    if (!envelope.vaults[restored.vaultId])
      failure(
        'CONFLICT',
        'The earlier destination Vault no longer exists. Choose another destination by editing the item.',
      );
    envelope.history[itemId] = [
      ...(envelope.history[itemId] ?? []),
      current,
    ].slice(-1000);
    envelope.items[itemId] = this.encrypt(accountId, 'item', restored, key);
    envelope.revision++;
    this.write(envelope);
    return restored;
  }
  createVault(
    accountId: number,
    fields: Pick<VaultRecord, 'name' | 'type' | 'appearance'>,
  ) {
    const key = this.key(accountId);
    const envelope = this.read(accountId);
    const now = Date.now();
    const vault = vaultSchema.parse({
      ...fields,
      id: randomUUID(),
      revision: 1,
      createdAt: now,
      updatedAt: now,
    });
    envelope.vaults[vault.id] = this.encrypt(accountId, 'vault', vault, key);
    envelope.revision++;
    this.write(envelope);
    return vault;
  }
  updateVault(
    accountId: number,
    vaultId: string,
    patch: {
      name?: string | undefined;
      appearance?: Record<string, string> | undefined;
    },
    baseRevision?: number,
  ) {
    const key = this.key(accountId);
    const envelope = this.read(accountId);
    const encrypted = envelope.vaults[vaultId];
    if (!encrypted) failure('NOT_FOUND', 'This Vault does not exist.');
    if (baseRevision !== undefined && baseRevision !== encrypted.revision)
      failure('CONFLICT', 'This Vault changed. Reload before saving.');
    const previous = vaultSchema.parse(
      this.decrypt(accountId, 'vault', encrypted),
    );
    const vault = vaultSchema.parse({
      ...previous,
      ...Object.fromEntries(
        Object.entries(patch).filter(([, value]) => value !== undefined),
      ),
      revision: previous.revision + 1,
      updatedAt: Date.now(),
    });
    envelope.vaults[vaultId] = this.encrypt(accountId, 'vault', vault, key);
    envelope.revision++;
    this.write(envelope);
    return vault;
  }
  deleteVault(accountId: number, vaultId: string) {
    this.key(accountId);
    const envelope = this.read(accountId);
    if (!envelope.vaults[vaultId])
      failure('NOT_FOUND', 'This Vault does not exist.');
    if (
      Object.values(envelope.items).some(
        (record) =>
          itemSchema.parse(this.decrypt(accountId, 'item', record)).vaultId ===
          vaultId,
      )
    )
      failure('CONFLICT', 'Move or delete this Vault’s items first.');
    delete envelope.vaults[vaultId];
    envelope.revision++;
    this.write(envelope);
    return { deleted: true };
  }
  cipherSnapshot(accountId: number) {
    const envelope = this.read(accountId);
    return {
      revision: envelope.revision,
      vaults: Object.values(envelope.vaults),
      items: Object.values(envelope.items),
    };
  }
  unlockContext(accountId: number) {
    const envelope = this.read(accountId);
    return {
      format: envelope.format,
      version: envelope.version,
      accountId,
      kdf: envelope.kdf,
      passwordWrap: envelope.passwordWrap,
      recoveryWrap: envelope.recoveryWrap,
    };
  }
  cipherPut(
    accountId: number,
    kind: 'vault' | 'item',
    record: EncryptedRecord,
    baseRevision?: number,
  ) {
    const envelope = this.read(accountId);
    if (baseRevision !== undefined && baseRevision !== envelope.revision)
      failure('CONFLICT', 'Vault data changed. Refresh before retrying.');
    const collection = kind === 'vault' ? envelope.vaults : envelope.items;
    const previous = collection[record.id];
    if (record.revision !== (previous?.revision ?? 0) + 1)
      failure('CONFLICT', 'The encrypted record revision is stale.');
    if (this.keys.has(accountId)) this.decrypt(accountId, kind, record);
    if (kind === 'item' && previous)
      envelope.history[record.id] = [
        ...(envelope.history[record.id] ?? []),
        previous,
      ].slice(-1000);
    collection[record.id] = record;
    envelope.revision++;
    this.write(envelope);
    return { revision: envelope.revision };
  }
  cipherDelete(
    accountId: number,
    kind: 'vault' | 'item',
    id: string,
    baseRevision?: number,
  ) {
    const envelope = this.read(accountId);
    if (baseRevision !== undefined && baseRevision !== envelope.revision)
      failure('CONFLICT', 'Vault data changed. Refresh before retrying.');
    const collection = kind === 'vault' ? envelope.vaults : envelope.items;
    if (!collection[id])
      failure('NOT_FOUND', 'This encrypted record does not exist.');
    if (kind === 'vault' && Object.keys(envelope.items).length)
      failure(
        'PRECONDITION_FAILED',
        'Unlock the Vault and move or remove its items before deleting it.',
      );
    delete collection[id];
    if (kind === 'item') delete envelope.history[id];
    envelope.revision++;
    this.write(envelope);
    return { deleted: true, revision: envelope.revision };
  }
  cipherHistory(accountId: number, itemId: string) {
    return this.read(accountId).history[itemId] ?? [];
  }
  async clear(accountId: number) {
    this.key(accountId);
    if (this.biometry) await this.removeBiometry(accountId);
    this.key(accountId);
    this.lock(accountId);
    rmSync(this.file(accountId));
    this.publishSecurity(accountId);
    return { cleared: true };
  }
}
