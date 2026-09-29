import { createCipheriv, createDecipheriv, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  originOfAddress,
  AuxError,
  VaultExportSchema,
  VaultTransferPackageSchema,
  VaultTransferPassphraseSchema,
  type VaultAccessRecord,
  type VaultGrant,
  type VaultItem,
  type VaultStatus,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";

const LOCK_KEY = "vaultLock";
const UNLOCK_KEY = "vaultUnlockUntil";
const SECRET_PREFIX = "v";

function secretName(itemId: string): string {
  const name = `${SECRET_PREFIX}${itemId.replace(/-/g, "")}`;
  if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(name)) throw new AuxError("invalid_params", "Invalid vault item.");
  return name;
}

function digestPassphrase(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

/** Authenticates a portable transfer without writing secrets to any profile. */
export function verifyVaultTransfer(pkgInput: unknown, passphrase: string): { items: number } {
  return { items: decryptVaultTransfer(pkgInput, passphrase).items.length };
}

function decryptVaultTransfer(pkgInput: unknown, passphrase: string) {
  VaultTransferPassphraseSchema.parse(passphrase);
  const pkg = VaultTransferPackageSchema.parse(pkgInput);
  try {
    const decipher = createDecipheriv("aes-256-gcm", digestPassphrase(passphrase, Buffer.from(pkg.salt, "hex")), Buffer.from(pkg.nonce, "hex"));
    decipher.setAAD(Buffer.from("aux-vault-transfer:v1"));
    decipher.setAuthTag(Buffer.from(pkg.tag, "hex"));
    const plain = Buffer.concat([decipher.update(Buffer.from(pkg.ciphertext, "base64")), decipher.final()]);
    try { return VaultExportSchema.parse(JSON.parse(plain.toString("utf8"))); }
    finally { plain.fill(0); }
  } catch {
    throw new AuxError("invalid_params", "The vault package or transfer passphrase is invalid.");
  }
}

function rowItem(repo: Repo, row: Record<string, unknown>): VaultItem {
  const id = [String(row.item_id)];
  const reveal = (column: string) => row[column] == null ? undefined :
    repo.revealRecordField("vault_items", id, column, String(row[column]));
  return {
    itemId: String(row.item_id),
    label: reveal("label")!,
    kind: row.kind === "secret" ? "secret" : "password",
    username: reveal("username"),
    accountLabel: reveal("account_label"),
    origin: reveal("origin")!,
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    revokedAt: row.revoked_at == null ? undefined : Number(row.revoked_at),
    expiresAt: row.expires_at == null ? undefined : Number(row.expires_at),
  };
}

function rowGrant(repo: Repo, row: Record<string, unknown>): VaultGrant {
  const id = [String(row.grant_id)];
  const reveal = (column: string) => row[column] == null ? undefined :
    repo.revealRecordField("vault_grants", id, column, String(row[column]));
  return {
    grantId: String(row.grant_id),
    itemId: String(row.item_id),
    credentialRef: String(row.credential_ref),
    taskId: row.task_id ? String(row.task_id) : undefined,
    workspaceId: row.workspace_id ? String(row.workspace_id) : undefined,
    origin: reveal("origin")!,
    accountLabel: reveal("account_label"),
    createdAt: Number(row.created_at),
    expiresAt: Number(row.expires_at),
    revokedAt: row.revoked_at == null ? undefined : Number(row.revoked_at),
    lastUsedAt: row.last_used_at == null ? undefined : Number(row.last_used_at),
    useCount: Number(row.use_count ?? 0),
  };
}

export class VaultService {
  constructor(private repo: Repo, private native?: NativeBridge) {}

  private requireNative() {
    if (!this.native?.available()) throw new AuxError("backend_unavailable", "The agent vault requires the Aux desktop app.");
  }

  private record(action: VaultAccessRecord["action"], opts: { itemId?: string; grantId?: string; taskId?: string; origin?: string; detail?: string; actor?: VaultAccessRecord["actor"] } = {}) {
    this.repo.db.exec("SAVEPOINT vault_access_record");
    try {
      const result = this.repo.db.prepare("INSERT INTO vault_access(item_id,grant_id,action,actor,task_id,origin,detail,recorded_at) VALUES(?,?,?,?,NULL,NULL,NULL,?)")
        .run(opts.itemId ?? null, opts.grantId ?? null, action, opts.actor ?? "desktop_user", Date.now());
      const seq = Number(result.lastInsertRowid);
      this.repo.db.prepare("UPDATE vault_access SET task_id=?,origin=?,detail=? WHERE seq=?")
        .run(opts.taskId ?? null,
          opts.origin == null ? null : this.repo.protectRecordField("vault_access", [seq], "origin", opts.origin),
          opts.detail == null ? null : this.repo.protectRecordField("vault_access", [seq], "detail", opts.detail), seq);
      this.repo.db.exec("RELEASE vault_access_record");
    } catch (error) {
      this.repo.db.exec("ROLLBACK TO vault_access_record");
      this.repo.db.exec("RELEASE vault_access_record");
      throw error;
    }
  }

  status(now = Date.now()): VaultStatus {
    const lock = this.repo.getSetting<{ salt: string; hash: string }>(LOCK_KEY);
    const until = this.repo.getSetting<number>(UNLOCK_KEY);
    const itemCount = (this.repo.db.prepare("SELECT count(*) AS n FROM vault_items WHERE revoked_at IS NULL").get() as { n: number }).n;
    let available = true;
    let error: string | undefined;
    try { this.requireNative(); }
    catch (reason) { available = false; error = reason instanceof Error ? reason.message : String(reason); }
    const locked = !!lock && !(typeof until === "number" && until > now);
    return { configured: !!lock || itemCount > 0, locked, unlockedUntil: !locked && typeof until === "number" ? until : undefined, itemCount, available, error };
  }

  private assertUnlocked(now = Date.now()) {
    if (!this.repo.getSetting(LOCK_KEY)) throw new AuxError("conflict", "Set a vault passphrase before saving or filling credentials.");
    const status = this.status(now);
    if (status.locked) throw new AuxError("conflict", "Unlock the agent vault before filling or saving credentials.");
    if (!status.available) throw new AuxError("backend_unavailable", status.error ?? "The agent vault is unavailable.");
  }

  list(includeRevoked = false): VaultItem[] {
    const sql = includeRevoked
      ? "SELECT * FROM vault_items ORDER BY updated_at DESC, item_id"
      : "SELECT * FROM vault_items WHERE revoked_at IS NULL ORDER BY updated_at DESC, item_id";
    return (this.repo.db.prepare(sql).all() as Record<string, unknown>[]).map(row => rowItem(this.repo, row));
  }

  async save(input: { label: string; kind?: "password" | "secret"; username?: string; accountLabel?: string; origin: string; secret: string; expiresAt?: number }): Promise<VaultItem> {
    this.assertUnlocked();
    this.requireNative();
    const origin = originOfAddress(input.origin);
    if (!origin) throw new AuxError("invalid_params", "Save credentials for an http(s) site address without embedded passwords.");
    if (!input.secret.trim() || input.secret.length > 4096) throw new AuxError("invalid_params", "Enter a credential up to 4096 characters.");
    const now = Date.now();
    const item: VaultItem = {
      itemId: crypto.randomUUID(),
      label: input.label.trim(),
      kind: input.kind ?? "password",
      username: input.username?.trim() || undefined,
      accountLabel: input.accountLabel?.trim() || undefined,
      origin,
      createdAt: now,
      updatedAt: now,
      expiresAt: input.expiresAt,
    };
    await this.native!.storeSecret(secretName(item.itemId), input.secret);
    this.repo.db.prepare("INSERT INTO vault_items(item_id,label,kind,username,account_label,origin,created_at,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?)")
      .run(item.itemId, this.repo.protectRecordField("vault_items", [item.itemId], "label", item.label), item.kind,
        item.username == null ? null : this.repo.protectRecordField("vault_items", [item.itemId], "username", item.username),
        item.accountLabel == null ? null : this.repo.protectRecordField("vault_items", [item.itemId], "account_label", item.accountLabel),
        this.repo.protectRecordField("vault_items", [item.itemId], "origin", item.origin),
        item.createdAt, item.updatedAt, item.expiresAt ?? null);
    this.record("save", { itemId: item.itemId, origin: item.origin, detail: item.label });
    return item;
  }

  lock(passphrase?: string, now = Date.now()): VaultStatus {
    if (passphrase) {
      if (passphrase.length < 8) throw new AuxError("invalid_params", "Choose a vault passphrase with at least 8 characters.");
      const salt = randomBytes(16);
      const hash = digestPassphrase(passphrase, salt);
      this.repo.setSetting(LOCK_KEY, { salt: salt.toString("hex"), hash: hash.toString("hex") });
    } else if (!this.repo.getSetting(LOCK_KEY)) {
      throw new AuxError("invalid_params", "Set a vault passphrase the first time you lock it.");
    }
    this.repo.setSetting(UNLOCK_KEY, 0);
    this.record("lock", { detail: passphrase ? "passphrase set" : "locked" });
    return this.status(now);
  }

  unlock(passphrase: string, ttlMs = 15 * 60_000, now = Date.now()): VaultStatus {
    const lock = this.repo.getSetting<{ salt: string; hash: string }>(LOCK_KEY);
    if (!lock) throw new AuxError("conflict", "The agent vault does not have a passphrase yet.");
    const actual = digestPassphrase(passphrase, Buffer.from(lock.salt, "hex"));
    const expected = Buffer.from(lock.hash, "hex");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      this.record("denied", { detail: "unlock" });
      throw new AuxError("permission_denied", "That vault passphrase did not match.");
    }
    this.repo.setSetting(UNLOCK_KEY, now + ttlMs);
    this.record("unlock");
    return this.status(now);
  }

  grant(input: { itemId: string; origin: string; taskId?: string; workspaceId?: string; ttlMs?: number }): VaultGrant {
    this.assertUnlocked();
    const item = this.item(input.itemId);
    if (item.revokedAt) throw new AuxError("conflict", "This vault item was revoked. Save a replacement credential.");
    if (item.expiresAt && item.expiresAt <= Date.now()) throw new AuxError("conflict", "This vault item expired. Save a replacement credential.");
    const origin = originOfAddress(input.origin);
    if (!origin) throw new AuxError("invalid_params", "Grants must name an http(s) origin without credentials.");
    if (origin !== item.origin) throw new AuxError("conflict", "This credential belongs to a different site.");
    const now = Date.now();
    const grant: VaultGrant = {
      grantId: crypto.randomUUID(),
      itemId: item.itemId,
      credentialRef: `cref_${randomBytes(16).toString("hex")}`,
      taskId: input.taskId,
      workspaceId: input.workspaceId,
      origin,
      accountLabel: item.accountLabel,
      createdAt: now,
      expiresAt: now + (input.ttlMs ?? 30 * 60_000),
      useCount: 0,
    };
    this.repo.db.prepare("INSERT INTO vault_grants(grant_id,item_id,credential_ref,task_id,workspace_id,origin,account_label,created_at,expires_at,use_count) VALUES(?,?,?,?,?,?,?,?,?,0)")
      .run(grant.grantId, grant.itemId, grant.credentialRef, grant.taskId ?? null, grant.workspaceId ?? null,
        this.repo.protectRecordField("vault_grants", [grant.grantId], "origin", grant.origin),
        grant.accountLabel == null ? null : this.repo.protectRecordField("vault_grants", [grant.grantId], "account_label", grant.accountLabel),
        grant.createdAt, grant.expiresAt);
    this.record("grant", { itemId: item.itemId, grantId: grant.grantId, taskId: grant.taskId, origin });
    return grant;
  }

  renewGrant(input: { grantId: string; ttlMs?: number }): VaultGrant {
    this.assertUnlocked();
    const grantRow = this.repo.db.prepare("SELECT * FROM vault_grants WHERE grant_id=?").get(input.grantId) as Record<string, unknown> | undefined;
    if (!grantRow) throw new AuxError("not_found", "That vault grant was not found.");
    const grant = rowGrant(this.repo, grantRow);
    const item = this.item(grant.itemId);
    const now = Date.now();
    if (grant.revokedAt || item.revokedAt) throw new AuxError("conflict", "This credential grant was revoked. Save a replacement instead of duplicating the secret.");
    if (item.expiresAt && item.expiresAt <= now) throw new AuxError("conflict", "This vault item expired. Save a replacement credential.");
    const next: VaultGrant = { ...grant, expiresAt: now + (input.ttlMs ?? 30 * 60_000) };
    this.repo.db.prepare("UPDATE vault_grants SET expires_at=? WHERE grant_id=?").run(next.expiresAt, next.grantId);
    this.record("grant", { itemId: item.itemId, grantId: next.grantId, taskId: next.taskId, origin: next.origin, detail: "renewed without duplicating the secret" });
    return next;
  }

  expiredGrants(now = Date.now()): VaultGrant[] {
    const rows = this.repo.db.prepare(`SELECT g.* FROM vault_grants g JOIN vault_items i ON i.item_id=g.item_id
      WHERE g.revoked_at IS NULL AND i.revoked_at IS NULL AND g.expires_at<=?
      AND (i.expires_at IS NULL OR i.expires_at>?)
      ORDER BY g.expires_at DESC`).all(now, now) as Record<string, unknown>[];
    return rows.map(row => rowGrant(this.repo, row));
  }

  grants(filter: { taskId?: string; origin?: string; accountLabels?: string[] } = {}): VaultGrant[] {
    const now = Date.now();
    let sql = "SELECT * FROM vault_grants WHERE revoked_at IS NULL AND expires_at > ?";
    const args: Array<string | number> = [now];
    if (filter.taskId) { sql += " AND (task_id IS NULL OR task_id=?)"; args.push(filter.taskId); }
    const all = (this.repo.db.prepare(`${sql} ORDER BY created_at DESC`).all(...args) as Record<string, unknown>[])
      .map(row => rowGrant(this.repo, row)).filter(grant => !filter.origin || grant.origin === filter.origin);
    // A declared account boundary (from a routine) hides every grant that is
    // not one of its labeled accounts — unlabeled grants are never in scope.
    if (filter.accountLabels?.length) {
      const allowed = new Set(filter.accountLabels);
      return all.filter(grant => !!grant.accountLabel && allowed.has(grant.accountLabel));
    }
    return all;
  }

  history(itemId?: string, limit = 50): VaultAccessRecord[] {
    const rows = (itemId
      ? this.repo.db.prepare("SELECT * FROM vault_access WHERE item_id=? ORDER BY seq DESC LIMIT ?").all(itemId, limit)
      : this.repo.db.prepare("SELECT * FROM vault_access ORDER BY seq DESC LIMIT ?").all(limit)) as Record<string, unknown>[];
    return rows.map(row => ({
      seq: Number(row.seq),
      itemId: row.item_id ? String(row.item_id) : undefined,
      grantId: row.grant_id ? String(row.grant_id) : undefined,
      action: row.action as VaultAccessRecord["action"],
      actor: row.actor as VaultAccessRecord["actor"],
      taskId: row.task_id ? String(row.task_id) : undefined,
      origin: row.origin == null ? undefined : this.repo.revealRecordField("vault_access", [Number(row.seq)], "origin", String(row.origin)),
      detail: row.detail == null ? undefined : this.repo.revealRecordField("vault_access", [Number(row.seq)], "detail", String(row.detail)),
      recordedAt: Number(row.recorded_at),
    }));
  }

  revoke(input: { itemId?: string; grantId?: string }): { ok: true } {
    const now = Date.now();
    if (input.grantId) {
      const grant = this.repo.db.prepare("SELECT * FROM vault_grants WHERE grant_id=?").get(input.grantId) as Record<string, unknown> | undefined;
      if (!grant) throw new AuxError("not_found", "That vault grant was not found.");
      this.repo.db.prepare("UPDATE vault_grants SET revoked_at=? WHERE grant_id=?").run(now, input.grantId);
      this.record("revoke", { itemId: String(grant.item_id), grantId: input.grantId, origin: rowGrant(this.repo, grant).origin });
      return { ok: true };
    }
    if (!input.itemId) throw new AuxError("invalid_params", "Choose a vault item or grant to revoke.");
    const item = this.item(input.itemId);
    this.repo.db.prepare("UPDATE vault_items SET revoked_at=? WHERE item_id=?").run(now, item.itemId);
    this.repo.db.prepare("UPDATE vault_grants SET revoked_at=? WHERE item_id=? AND revoked_at IS NULL").run(now, item.itemId);
    void this.native?.storeSecret(secretName(item.itemId), "").catch(() => undefined);
    this.record("delete", { itemId: item.itemId, origin: item.origin });
    return { ok: true };
  }

  async revealForFill(credentialRef: string, info: { pageId: string; runId?: string; origin: string; target?: string; taskId?: string; accountLabels?: string[] }): Promise<string> {
    this.assertUnlocked();
    this.requireNative();
    const origin = originOfAddress(info.origin);
    if (!origin) throw new AuxError("conflict", "Trusted fill needs an http(s) page without embedded credentials.");
    const grantRow = this.repo.db.prepare("SELECT * FROM vault_grants WHERE credential_ref=?").get(credentialRef) as Record<string, unknown> | undefined;
    if (!grantRow) {
      this.record("denied", { origin, detail: "unknown reference", actor: "runtime" });
      throw new AuxError("not_found", "That vault reference is not valid. Grant access again from the vault.");
    }
    const grant = rowGrant(this.repo, grantRow);
    const item = this.item(grant.itemId);
    const now = Date.now();
    if (grant.revokedAt || item.revokedAt) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "revoked" });
      throw new AuxError("permission_denied", "This credential grant was revoked. Save the account again without duplicating the action.");
    }
    if (grant.expiresAt <= now || (item.expiresAt && item.expiresAt <= now)) {
      this.record("expire", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime" });
      throw new AuxError("permission_denied", "This credential grant expired. Unlock the vault and grant access again. Aux will not retry the write.");
    }
    if (grant.origin !== origin || item.origin !== origin) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "origin mismatch" });
      throw new AuxError("conflict", "This credential is for a different site.");
    }
    if (info.accountLabels?.length && !(grant.accountLabel && info.accountLabels.includes(grant.accountLabel))) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "account outside the declared boundary" });
      throw new AuxError("permission_denied", "This credential is outside the labeled accounts this run declared. Update the account selection and run again.");
    }
    if (grant.taskId && grant.taskId !== info.taskId) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "task mismatch" });
      throw new AuxError("conflict", "This credential grant belongs to a different task.");
    }
    const stored = await this.native!.readSecret(secretName(item.itemId));
    if (!stored.value) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, actor: "runtime", detail: "missing secret" });
      throw new AuxError("conflict", "The saved credential could not be read. Re-enter it in the vault.");
    }
    this.repo.db.prepare("UPDATE vault_grants SET last_used_at=?, use_count=use_count+1 WHERE grant_id=?").run(now, grant.grantId);
    this.record("fill", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId ?? grant.taskId, actor: "runtime", detail: info.target });
    return stored.value;
  }

  private item(itemId: string): VaultItem {
    const row = this.repo.db.prepare("SELECT * FROM vault_items WHERE item_id=?").get(itemId) as Record<string, unknown> | undefined;
    if (!row) throw new AuxError("not_found", "That vault item was not found.");
    return rowItem(this.repo, row);
  }

  /** Replace an item's secret in place — the update-prompt path. */
  async updateSecret(itemId: string, secret: string): Promise<VaultItem> {
    this.assertUnlocked();
    this.requireNative();
    if (!secret.trim() || secret.length > 4096) throw new AuxError("invalid_params", "Enter a credential up to 4096 characters.");
    const item = this.item(itemId);
    if (item.revokedAt) throw new AuxError("conflict", "This credential was revoked. Save it as a new item.");
    await this.native!.storeSecret(secretName(item.itemId), secret);
    this.repo.db.prepare("UPDATE vault_items SET updated_at=? WHERE item_id=?").run(Date.now(), item.itemId);
    this.record("save", { itemId: item.itemId, origin: item.origin, detail: "credential updated" });
    return this.item(item.itemId);
  }

  // ---------- human credential experience ----------

  /** Cryptographically generated password — same entropy class as the secrets it protects. */
  generate(length = 20): string {
    const size = Math.min(64, Math.max(12, Math.floor(length)));
    const alphabet = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%^&*-+";
    const bytes = randomBytes(size);
    let out = "";
    for (const byte of bytes) out += alphabet[byte % alphabet.length];
    return out;
  }

  /** Password items saved for an exact page origin — metadata only, never secrets. */
  itemsForOrigin(origin: string): VaultItem[] {
    const normalized = originOfAddress(origin);
    if (!normalized) return [];
    return (this.repo.db.prepare("SELECT * FROM vault_items WHERE revoked_at IS NULL AND kind='password' ORDER BY updated_at DESC").all() as Record<string, unknown>[])
      .map(row => rowItem(this.repo, row)).filter(item => item.origin === normalized);
  }

  /**
   * Whether an item's stored secret already equals a submitted value — lets the
   * save offer stay silent when nothing changed. A comparison, not a reveal:
   * the secret never leaves the store boundary and nothing is recorded.
   */
  async secretMatches(itemId: string, secret: string): Promise<boolean> {
    this.assertUnlocked();
    this.requireNative();
    const item = this.item(itemId);
    if (item.revokedAt) return false;
    const stored = await this.native!.readSecret(secretName(item.itemId));
    return !!stored.value && stored.value === secret;
  }

  /**
   * Human trusted fill: resolves the secret for an explicit item+origin pair.
   * Origin equality is exact — a lookalike host or a different frame origin is
   * a mismatch, and the reveal is recorded the same way grant fills are.
   */
  async revealForHumanFill(itemId: string, info: { pageId: string; origin: string }): Promise<{ username?: string; secret: string }> {
    this.assertUnlocked();
    this.requireNative();
    const origin = originOfAddress(info.origin);
    if (!origin) throw new AuxError("conflict", "Trusted fill needs an http(s) page without embedded credentials.");
    const item = this.item(itemId);
    if (item.revokedAt) {
      this.record("denied", { itemId, origin, detail: "revoked" });
      throw new AuxError("permission_denied", "This credential was revoked. Save a replacement.");
    }
    if (item.expiresAt && item.expiresAt <= Date.now()) {
      this.record("expire", { itemId, origin });
      throw new AuxError("permission_denied", "This credential expired. Save a replacement.");
    }
    if (item.origin !== origin) {
      this.record("denied", { itemId, origin, detail: "origin mismatch" });
      throw new AuxError("conflict", "This credential belongs to a different site.");
    }
    const stored = await this.native!.readSecret(secretName(item.itemId));
    if (!stored.value) {
      this.record("denied", { itemId, origin, detail: "missing secret" });
      throw new AuxError("conflict", "The saved credential could not be read. Re-enter it in the vault.");
    }
    this.record("fill", { itemId, origin, detail: `human fill on ${info.pageId}` });
    return { username: item.username, secret: stored.value };
  }

  /** Export every live item with its secret — explicit user action, unlocked vault required. */
  async exportItems(): Promise<{ exportedAt: number; items: { label: string; kind: string; username?: string; accountLabel?: string; origin: string; secret: string; expiresAt?: number }[] }> {
    this.assertUnlocked();
    this.requireNative();
    const items = this.list();
    const out: { label: string; kind: string; username?: string; accountLabel?: string; origin: string; secret: string; expiresAt?: number }[] = [];
    for (const item of items) {
      const stored = await this.native!.readSecret(secretName(item.itemId));
      if (!stored.value) continue;
      out.push({ label: item.label, kind: item.kind, username: item.username, accountLabel: item.accountLabel, origin: item.origin, secret: stored.value, expiresAt: item.expiresAt });
    }
    this.record("fill", { detail: `exported ${out.length} item(s)` });
    return { exportedAt: Date.now(), items: out };
  }

  /** Secrets only leave the runtime in a passphrase-encrypted, authenticated package. */
  async exportEncrypted(passphrase: string) {
    VaultTransferPassphraseSchema.parse(passphrase);
    const salt = randomBytes(16);
    const nonce = randomBytes(12);
    const key = digestPassphrase(passphrase, salt);
    const cipher = createCipheriv("aes-256-gcm", key, nonce);
    cipher.setAAD(Buffer.from("aux-vault-transfer:v1"));
    const plain = Buffer.from(JSON.stringify(VaultExportSchema.parse(await this.exportItems())), "utf8");
    if (plain.length > 3_000_000) throw new AuxError("invalid_params", "The vault export is too large.");
    const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
    return VaultTransferPackageSchema.parse({ format: "aux-vault-transfer", version: 1,
      kdf: "scrypt-n16384-r8-p1", cipher: "aes-256-gcm", salt: salt.toString("hex"),
      nonce: nonce.toString("hex"), tag: cipher.getAuthTag().toString("hex"),
      ciphertext: ciphertext.toString("base64") });
  }

  async importEncrypted(input: { passphrase: string; package: unknown }) {
    return this.importItems(decryptVaultTransfer(input.package, input.passphrase));
  }

  /** Import exported items — duplicates (same origin+username+label) are skipped. */
  async importItems(input: { items: { label?: string; kind?: string; username?: string; accountLabel?: string; origin: string; secret: string; expiresAt?: number }[] }): Promise<{ added: number; skipped: number }> {
    this.assertUnlocked();
    this.requireNative();
    const existing = new Set(this.list(true).map(item => `${item.origin}${item.username ?? ""}${item.label}`));
    let added = 0;
    let skipped = 0;
    for (const entry of input.items.slice(0, 500)) {
      const label = (entry.label ?? "").trim() || (entry.username ?? "Credential").slice(0, 80);
      const key = `${entry.origin}${entry.username ?? ""}${label}`;
      if (!entry.origin || !entry.secret?.trim() || existing.has(key)) { skipped++; continue; }
      try {
        await this.save({ label, kind: entry.kind === "secret" ? "secret" : "password", username: entry.username, accountLabel: entry.accountLabel, origin: entry.origin, secret: entry.secret, expiresAt: entry.expiresAt });
        existing.add(key);
        added++;
      } catch { skipped++; }
    }
    this.record("save", { detail: `imported ${added} item(s)` });
    return { added, skipped };
  }
}
