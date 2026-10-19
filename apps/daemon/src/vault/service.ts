import { randomUUID } from 'node:crypto';
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
  validateRecordKeys,
  vaultSchema,
} from './schema.js';

type VaultStore = Pick<
  Store,
  'requireAccount' | 'safeFile' | 'registerAccountDeletionHandler' | 'accounts'
>;
function failure(
  code:
    | 'BAD_REQUEST'
    | 'UNAUTHORIZED'
    | 'PRECONDITION_FAILED'
    | 'CONFLICT'
    | 'NOT_FOUND'
    | 'FORBIDDEN',
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
export class VaultService {
  private keys = new Map<number, Uint8Array>();
  private unregister: () => void;
  constructor(private store: VaultStore) {
    this.unregister = store.registerAccountDeletionHandler((accountId) => {
      this.lock(accountId);
    });
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
    const key = this.keys.get(accountId);
    if (!key) failure('PRECONDITION_FAILED', 'Unlock your Vault to continue.');
    return key;
  }
  status(accountId: number) {
    this.store.requireAccount(accountId);
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
      };
      envelope.vaults[vault.id] = this.encrypt(accountId, 'vault', vault, key);
      this.write(envelope);
      this.keys.set(accountId, key);
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
    const derived = passwordKey(password, envelope.kdf);
    let key: Uint8Array;
    try {
      key = open(
        envelope.passwordWrap,
        derived,
        domain(accountId, 'master/password'),
      );
    } catch {
      failure('UNAUTHORIZED', 'That password did not unlock the Vault.');
    } finally {
      if (derived) wipe(derived);
    }
    this.lock(accountId);
    this.keys.set(accountId, key);
    this.publishSecurity(accountId);
    return this.status(accountId);
  }
  lock(accountId: number) {
    const key = this.keys.get(accountId);
    if (key) {
      wipe(key);
      this.keys.delete(accountId);
    }
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
  async changePassword(
    accountId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    await cryptoReady;
    if (newPassword.length < 8)
      failure('BAD_REQUEST', 'Choose a password with at least 8 characters.');
    const envelope = this.read(accountId);
    const oldDerived = passwordKey(currentPassword, envelope.kdf);
    let master: Uint8Array;
    try {
      master = open(
        envelope.passwordWrap,
        oldDerived,
        domain(accountId, 'master/password'),
      );
    } catch {
      failure('UNAUTHORIZED', 'The current Vault password is incorrect.');
    } finally {
      wipe(oldDerived);
    }
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
      this.publishSecurity(accountId);
      return { changed: true };
    } finally {
      wipe(master);
      if (derived) wipe(derived);
    }
  }
  private encrypt(
    accountId: number,
    kind: 'vault' | 'item',
    record: VaultItem | VaultRecord,
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
    kind: 'vault' | 'item',
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
        kind === 'vault' ? vaultSchema.parse(value) : itemSchema.parse(value);
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
  clear(accountId: number) {
    this.key(accountId);
    this.lock(accountId);
    rmSync(this.file(accountId));
    this.publishSecurity(accountId);
    return { cleared: true };
  }
}
