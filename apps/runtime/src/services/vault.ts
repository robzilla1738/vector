import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import {
  originOfAddress,
  VectorError,
  type VaultAccessRecord,
  type VaultGrant,
  type VaultItem,
  type VaultStatus,
} from "@vector/contracts";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";

const LOCK_KEY = "vaultLock";
const UNLOCK_KEY = "vaultUnlockUntil";
const SECRET_PREFIX = "v";

function secretName(itemId: string): string {
  const name = `${SECRET_PREFIX}${itemId.replace(/-/g, "")}`;
  if (!/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(name)) throw new VectorError("invalid_params", "Invalid vault item.");
  return name;
}

function digestPassphrase(passphrase: string, salt: Buffer): Buffer {
  return scryptSync(passphrase, salt, 32, { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
}

function rowItem(row: Record<string, unknown>): VaultItem {
  return {
    itemId: String(row.item_id),
    label: String(row.label),
    kind: row.kind === "secret" ? "secret" : "password",
    username: row.username ? String(row.username) : undefined,
    accountLabel: row.account_label ? String(row.account_label) : undefined,
    origin: String(row.origin),
    createdAt: Number(row.created_at),
    updatedAt: Number(row.updated_at),
    revokedAt: row.revoked_at == null ? undefined : Number(row.revoked_at),
    expiresAt: row.expires_at == null ? undefined : Number(row.expires_at),
  };
}

function rowGrant(row: Record<string, unknown>): VaultGrant {
  return {
    grantId: String(row.grant_id),
    itemId: String(row.item_id),
    credentialRef: String(row.credential_ref),
    taskId: row.task_id ? String(row.task_id) : undefined,
    workspaceId: row.workspace_id ? String(row.workspace_id) : undefined,
    origin: String(row.origin),
    accountLabel: row.account_label ? String(row.account_label) : undefined,
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
    if (!this.native?.available()) throw new VectorError("backend_unavailable", "The agent vault requires the Aux desktop app.");
  }

  private record(action: VaultAccessRecord["action"], opts: { itemId?: string; grantId?: string; taskId?: string; origin?: string; detail?: string; actor?: VaultAccessRecord["actor"] } = {}) {
    this.repo.db.prepare("INSERT INTO vault_access(item_id,grant_id,action,actor,task_id,origin,detail,recorded_at) VALUES(?,?,?,?,?,?,?,?)")
      .run(opts.itemId ?? null, opts.grantId ?? null, action, opts.actor ?? "desktop_user", opts.taskId ?? null, opts.origin ?? null, opts.detail ?? null, Date.now());
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
    if (!this.repo.getSetting(LOCK_KEY)) throw new VectorError("conflict", "Set a vault passphrase before saving or filling credentials.");
    const status = this.status(now);
    if (status.locked) throw new VectorError("conflict", "Unlock the agent vault before filling or saving credentials.");
    if (!status.available) throw new VectorError("backend_unavailable", status.error ?? "The agent vault is unavailable.");
  }

  list(includeRevoked = false): VaultItem[] {
    const sql = includeRevoked
      ? "SELECT * FROM vault_items ORDER BY updated_at DESC, item_id"
      : "SELECT * FROM vault_items WHERE revoked_at IS NULL ORDER BY updated_at DESC, item_id";
    return (this.repo.db.prepare(sql).all() as Record<string, unknown>[]).map(rowItem);
  }

  async save(input: { label: string; kind?: "password" | "secret"; username?: string; accountLabel?: string; origin: string; secret: string; expiresAt?: number }): Promise<VaultItem> {
    this.assertUnlocked();
    this.requireNative();
    const origin = originOfAddress(input.origin);
    if (!origin) throw new VectorError("invalid_params", "Save credentials for an http(s) site address without embedded passwords.");
    if (!input.secret.trim() || input.secret.length > 4096) throw new VectorError("invalid_params", "Enter a credential up to 4096 characters.");
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
      .run(item.itemId, item.label, item.kind, item.username ?? null, item.accountLabel ?? null, item.origin, item.createdAt, item.updatedAt, item.expiresAt ?? null);
    this.record("save", { itemId: item.itemId, origin: item.origin, detail: item.label });
    return item;
  }

  lock(passphrase?: string, now = Date.now()): VaultStatus {
    if (passphrase) {
      if (passphrase.length < 8) throw new VectorError("invalid_params", "Choose a vault passphrase with at least 8 characters.");
      const salt = randomBytes(16);
      const hash = digestPassphrase(passphrase, salt);
      this.repo.setSetting(LOCK_KEY, { salt: salt.toString("hex"), hash: hash.toString("hex") });
    } else if (!this.repo.getSetting(LOCK_KEY)) {
      throw new VectorError("invalid_params", "Set a vault passphrase the first time you lock it.");
    }
    this.repo.setSetting(UNLOCK_KEY, 0);
    this.record("lock", { detail: passphrase ? "passphrase set" : "locked" });
    return this.status(now);
  }

  unlock(passphrase: string, ttlMs = 15 * 60_000, now = Date.now()): VaultStatus {
    const lock = this.repo.getSetting<{ salt: string; hash: string }>(LOCK_KEY);
    if (!lock) throw new VectorError("conflict", "The agent vault does not have a passphrase yet.");
    const actual = digestPassphrase(passphrase, Buffer.from(lock.salt, "hex"));
    const expected = Buffer.from(lock.hash, "hex");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
      this.record("denied", { detail: "unlock" });
      throw new VectorError("permission_denied", "That vault passphrase did not match.");
    }
    this.repo.setSetting(UNLOCK_KEY, now + ttlMs);
    this.record("unlock");
    return this.status(now);
  }

  grant(input: { itemId: string; origin: string; taskId?: string; workspaceId?: string; ttlMs?: number }): VaultGrant {
    this.assertUnlocked();
    const item = this.item(input.itemId);
    if (item.revokedAt) throw new VectorError("conflict", "This vault item was revoked. Save a replacement credential.");
    if (item.expiresAt && item.expiresAt <= Date.now()) throw new VectorError("conflict", "This vault item expired. Save a replacement credential.");
    const origin = originOfAddress(input.origin);
    if (!origin) throw new VectorError("invalid_params", "Grants must name an http(s) origin without credentials.");
    if (origin !== item.origin) throw new VectorError("conflict", "This credential belongs to a different site.");
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
      .run(grant.grantId, grant.itemId, grant.credentialRef, grant.taskId ?? null, grant.workspaceId ?? null, grant.origin, grant.accountLabel ?? null, grant.createdAt, grant.expiresAt);
    this.record("grant", { itemId: item.itemId, grantId: grant.grantId, taskId: grant.taskId, origin });
    return grant;
  }

  renewGrant(input: { grantId: string; ttlMs?: number }): VaultGrant {
    this.assertUnlocked();
    const grantRow = this.repo.db.prepare("SELECT * FROM vault_grants WHERE grant_id=?").get(input.grantId) as Record<string, unknown> | undefined;
    if (!grantRow) throw new VectorError("not_found", "That vault grant was not found.");
    const grant = rowGrant(grantRow);
    const item = this.item(grant.itemId);
    const now = Date.now();
    if (grant.revokedAt || item.revokedAt) throw new VectorError("conflict", "This credential grant was revoked. Save a replacement instead of duplicating the secret.");
    if (item.expiresAt && item.expiresAt <= now) throw new VectorError("conflict", "This vault item expired. Save a replacement credential.");
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
    return rows.map(rowGrant);
  }

  grants(filter: { taskId?: string; origin?: string } = {}): VaultGrant[] {
    const now = Date.now();
    let sql = "SELECT * FROM vault_grants WHERE revoked_at IS NULL AND expires_at > ?";
    const args: Array<string | number> = [now];
    if (filter.taskId) { sql += " AND (task_id IS NULL OR task_id=?)"; args.push(filter.taskId); }
    if (filter.origin) { sql += " AND origin=?"; args.push(filter.origin); }
    return (this.repo.db.prepare(`${sql} ORDER BY created_at DESC`).all(...args) as Record<string, unknown>[]).map(rowGrant);
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
      origin: row.origin ? String(row.origin) : undefined,
      detail: row.detail ? String(row.detail) : undefined,
      recordedAt: Number(row.recorded_at),
    }));
  }

  revoke(input: { itemId?: string; grantId?: string }): { ok: true } {
    const now = Date.now();
    if (input.grantId) {
      const grant = this.repo.db.prepare("SELECT * FROM vault_grants WHERE grant_id=?").get(input.grantId) as Record<string, unknown> | undefined;
      if (!grant) throw new VectorError("not_found", "That vault grant was not found.");
      this.repo.db.prepare("UPDATE vault_grants SET revoked_at=? WHERE grant_id=?").run(now, input.grantId);
      this.record("revoke", { itemId: String(grant.item_id), grantId: input.grantId, origin: String(grant.origin) });
      return { ok: true };
    }
    if (!input.itemId) throw new VectorError("invalid_params", "Choose a vault item or grant to revoke.");
    const item = this.item(input.itemId);
    this.repo.db.prepare("UPDATE vault_items SET revoked_at=? WHERE item_id=?").run(now, item.itemId);
    this.repo.db.prepare("UPDATE vault_grants SET revoked_at=? WHERE item_id=? AND revoked_at IS NULL").run(now, item.itemId);
    void this.native?.storeSecret(secretName(item.itemId), "").catch(() => undefined);
    this.record("delete", { itemId: item.itemId, origin: item.origin });
    return { ok: true };
  }

  async revealForFill(credentialRef: string, info: { pageId: string; runId?: string; origin: string; target?: string; taskId?: string }): Promise<string> {
    this.assertUnlocked();
    this.requireNative();
    const origin = originOfAddress(info.origin);
    if (!origin) throw new VectorError("conflict", "Trusted fill needs an http(s) page without embedded credentials.");
    const grantRow = this.repo.db.prepare("SELECT * FROM vault_grants WHERE credential_ref=?").get(credentialRef) as Record<string, unknown> | undefined;
    if (!grantRow) {
      this.record("denied", { origin, detail: "unknown reference", actor: "runtime" });
      throw new VectorError("not_found", "That vault reference is not valid. Grant access again from the vault.");
    }
    const grant = rowGrant(grantRow);
    const item = this.item(grant.itemId);
    const now = Date.now();
    if (grant.revokedAt || item.revokedAt) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "revoked" });
      throw new VectorError("permission_denied", "This credential grant was revoked. Save the account again without duplicating the action.");
    }
    if (grant.expiresAt <= now || (item.expiresAt && item.expiresAt <= now)) {
      this.record("expire", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime" });
      throw new VectorError("permission_denied", "This credential grant expired. Unlock the vault and grant access again. Aux will not retry the write.");
    }
    if (grant.origin !== origin || item.origin !== origin) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "origin mismatch" });
      throw new VectorError("conflict", "This credential is for a different site.");
    }
    if (grant.taskId && grant.taskId !== info.taskId) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId, actor: "runtime", detail: "task mismatch" });
      throw new VectorError("conflict", "This credential grant belongs to a different task.");
    }
    const stored = await this.native!.readSecret(secretName(item.itemId));
    if (!stored.value) {
      this.record("denied", { itemId: item.itemId, grantId: grant.grantId, origin, actor: "runtime", detail: "missing secret" });
      throw new VectorError("conflict", "The saved credential could not be read. Re-enter it in the vault.");
    }
    this.repo.db.prepare("UPDATE vault_grants SET last_used_at=?, use_count=use_count+1 WHERE grant_id=?").run(now, grant.grantId);
    this.record("fill", { itemId: item.itemId, grantId: grant.grantId, origin, taskId: info.taskId ?? grant.taskId, actor: "runtime", detail: info.target });
    return stored.value;
  }

  private item(itemId: string): VaultItem {
    const row = this.repo.db.prepare("SELECT * FROM vault_items WHERE item_id=?").get(itemId) as Record<string, unknown> | undefined;
    if (!row) throw new VectorError("not_found", "That vault item was not found.");
    return rowItem(row);
  }
}
