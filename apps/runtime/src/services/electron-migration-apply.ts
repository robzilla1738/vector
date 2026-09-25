/** Verified offline seed for a new Chromium Aux Profile. Native browser state is applied later. */
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { chmod, copyFile, lstat, mkdir, open, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { basename, dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { z } from "zod";
import { ElectronMigrationManifestSchema, type ElectronMigrationManifest } from "@aux/contracts";
import { AUX_DATABASE_NAME } from "@aux/contracts/installation";
import { SCHEMA_VERSION } from "../store/db.js";
import { electronMigrationContentHash } from "./electron-migration.js";
import { verifyVaultTransfer } from "./vault.js";

const MAX_MANIFEST = 32 * 1024 * 1024;
const MAX_VAULT = 4_100_000;
const SHA = z.string().regex(/^[a-f0-9]{64}$/);
const ReceiptSchema = z.object({
  format: z.literal("aux-chromium-profile-seed"), version: z.literal(1),
  contentHash: SHA, manifestSha256: SHA, databaseSha256: SHA, createdAt: z.number().int().nonnegative(),
  vault: z.object({ state: z.literal("pending_native_import"), sha256: SHA, items: z.number().int().min(0).max(500) }).strict().optional(),
}).strict();
export type ElectronMigrationApplyReport = { profileDir: string | null; dryRun: boolean; alreadyApplied: boolean; contentHash: string;
  schemaVersion: number; tabs: number; bookmarks: number; artifactFiles: number; vaultItems: number };

const inside = (root: string, path: string) => { const rel = relative(root, path); return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel); };
async function prospectiveReal(path: string): Promise<string> {
  let ancestor = path;
  const missing: string[] = [];
  while (true) {
    try { return resolve(await realpath(ancestor), ...missing.reverse()); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      const parent = dirname(ancestor);
      if (parent === ancestor) throw error;
      missing.push(basename(ancestor)); ancestor = parent;
    }
  }
}
async function fileHash(path: string): Promise<string> {
  return new Promise((resolveHash, reject) => {
    const hash = createHash("sha256"), stream = createReadStream(path);
    stream.on("data", chunk => hash.update(chunk)); stream.on("error", reject);
    stream.on("end", () => resolveHash(hash.digest("hex")));
  });
}
async function regular(path: string, maximum: number, expectedBytes?: number) {
  const info = await lstat(path);
  if (!info.isFile() || info.isSymbolicLink() || info.size > maximum || (expectedBytes !== undefined && info.size !== expectedBytes))
    throw new Error(`Migration file is missing, linked, or outside size limits: ${basename(path)}.`);
  return info;
}

/** Checks hashes and the copied SQLite schema before any destination file is created. */
export async function verifyElectronMigrationBundle(bundleDir: string): Promise<ElectronMigrationManifest> {
  const root = await realpath(bundleDir);
  const rootInfo = await lstat(bundleDir);
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error("Choose a regular migration bundle directory.");
  const manifestPath = join(root, "manifest.json");
  await regular(manifestPath, MAX_MANIFEST);
  const manifest = ElectronMigrationManifestSchema.parse(JSON.parse(await readFile(manifestPath, "utf8")));
  if (electronMigrationContentHash(manifest) !== manifest.contentHash) throw new Error("Migration manifest content hash does not match.");
  const tabs = new Map(manifest.tabs.map(tab => [tab.sourcePageId, tab]));
  for (const id of manifest.layout.order) if (!tabs.has(id)) throw new Error("Migration tab order refers to a missing tab.");
  for (const [spaceId, id] of Object.entries(manifest.layout.activeTabs)) if (tabs.get(id)?.spaceId !== spaceId) throw new Error("Migration active tab has a different Space.");
  for (const [left, right] of Object.entries(manifest.layout.splits)) if (!tabs.has(left) || !tabs.has(right)) throw new Error("Migration split refers to a missing tab.");
  const databasePath = join(root, manifest.database.relativePath);
  await regular(databasePath, 2 * 1024 * 1024 * 1024, manifest.database.bytes);
  if (await fileHash(databasePath) !== manifest.database.sha256) throw new Error("Migration database SHA-256 does not match.");
  for (const artifact of manifest.artifacts) {
    const path = join(root, artifact.relativePath);
    if (!inside(root, await realpath(path))) throw new Error("Migration artifact escapes its bundle.");
    await regular(path, 1024 * 1024 * 1024, artifact.bytes);
    if (await fileHash(path) !== artifact.sha256) throw new Error(`Migration artifact ${artifact.artifactId} SHA-256 does not match.`);
  }
  const db = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const version = Number((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version);
    if (version !== manifest.source.schemaVersion || version < 1 || version > SCHEMA_VERSION) throw new Error("Migration database schema version does not match this runtime.");
    if ((db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value?: string } | undefined)?.value !== "aux") throw new Error("Migration database is not an Aux database.");
    if ((db.prepare("PRAGMA quick_check").get() as { quick_check: string }).quick_check !== "ok") throw new Error("Migration database failed integrity checking.");
    if (db.prepare("SELECT 1 FROM sqlite_schema WHERE (type IN ('trigger','view') OR upper(coalesce(sql,'')) LIKE '%VIRTUAL TABLE%') AND name NOT LIKE 'history_fts%' LIMIT 1").get())
      throw new Error("Migration database contains unsupported executable schema.");
    for (const item of manifest.artifacts) {
      const row = db.prepare("SELECT path FROM artifacts WHERE artifact_id=?").get(item.artifactId) as { path: string } | undefined;
      if (!row?.path || !isAbsolute(row.path) || !row.path.endsWith(`${sep}${item.relativePath}`))
        throw new Error(`Migration artifact ${item.artifactId} is not bound to its verified file.`);
    }
    if (db.prepare("SELECT 1 FROM tabs LIMIT 1").get()) throw new Error("Migration database still has live Electron tabs.");
    if (db.prepare("SELECT 1 FROM vault_items LIMIT 1").get()) throw new Error("Migration database still has host-bound vault metadata.");
  } finally { db.close(); }
  return manifest;
}

/** Creates an isolated, atomic profile seed; it never mutates the bundle or Electron source. */
export async function applyElectronMigration(input: { bundleDir: string; profileDir: string; vaultPath?: string; vaultPassphrase?: string; dryRun?: boolean }): Promise<ElectronMigrationApplyReport> {
  const bundle = await realpath(input.bundleDir);
  const profile = resolve(input.profileDir);
  const realProfile = await prospectiveReal(profile);
  if (inside(bundle, realProfile) || inside(realProfile, bundle)) throw new Error("Choose a destination outside the migration bundle.");
  for (let ancestor = dirname(realProfile); ; ancestor = dirname(ancestor)) {
    try {
      const existingDb = await lstat(join(ancestor, AUX_DATABASE_NAME));
      if (existingDb.isFile()) throw new Error("Choose a new profile outside any existing Aux data directory.");
    } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (ancestor === dirname(ancestor)) break;
  }
  if (!!input.vaultPath !== !!input.vaultPassphrase) throw new Error("Supply both a .auxvault file and its transfer passphrase.");
  const manifest = await verifyElectronMigrationBundle(bundle);
  let vaultBytes: Buffer | undefined, vaultHash: string | undefined, vaultItems = 0;
  if (input.vaultPath) {
    const vaultPath = resolve(input.vaultPath);
    await regular(vaultPath, MAX_VAULT);
    vaultBytes = await readFile(vaultPath);
    vaultItems = verifyVaultTransfer(JSON.parse(vaultBytes.toString("utf8")), input.vaultPassphrase!).items;
    vaultHash = createHash("sha256").update(vaultBytes).digest("hex");
  }
  const report = (path: string | null, dryRun: boolean, alreadyApplied: boolean): ElectronMigrationApplyReport => ({
    profileDir: path, dryRun, alreadyApplied, contentHash: manifest.contentHash, schemaVersion: manifest.source.schemaVersion,
    tabs: manifest.tabs.length, bookmarks: manifest.bookmarks.length, artifactFiles: manifest.artifacts.length, vaultItems,
  });
  if (input.dryRun) return report(null, true, false);
  const parent = dirname(profile);
  await mkdir(parent, { recursive: true, mode: 0o700 });
  const lockPath = join(parent, `.${basename(profile)}.aux-migration.lock`);
  const lock = await open(lockPath, "wx", 0o600);
  const stage = join(parent, `.aux-profile-seed-${randomUUID()}`);
  try {
    let existing: Awaited<ReturnType<typeof lstat>> | undefined;
    try { existing = await lstat(profile); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    if (existing) {
      if (!existing.isDirectory() || existing.isSymbolicLink()) throw new Error("The destination is not a regular profile directory.");
      const receipt = ReceiptSchema.parse(JSON.parse(await readFile(join(profile, "apply-receipt.json"), "utf8")));
      if (receipt.contentHash !== manifest.contentHash || receipt.vault?.sha256 !== vaultHash) throw new Error("This profile was seeded from a different migration bundle or vault package.");
      if (await fileHash(join(profile, "manifest.json")) !== receipt.manifestSha256) throw new Error("The seeded migration manifest has changed.");
      await regular(join(profile, AUX_DATABASE_NAME), 2 * 1024 * 1024 * 1024);
      if (await fileHash(join(profile, AUX_DATABASE_NAME)) !== receipt.databaseSha256) throw new Error("The seeded profile database has changed; native apply must reconcile its receipt.");
      for (const item of manifest.artifacts) {
        const path = join(profile, item.relativePath);
        await regular(path, 1024 * 1024 * 1024, item.bytes);
        if (await fileHash(path) !== item.sha256) throw new Error("A seeded profile artifact has changed.");
      }
      if (vaultHash && await fileHash(join(profile, "vault-transfer.auxvault")) !== vaultHash) throw new Error("The staged vault package has changed.");
      return report(profile, false, true);
    }
    await mkdir(stage, { mode: 0o700 });
    const stagedDb = join(stage, AUX_DATABASE_NAME);
    await copyFile(join(bundle, manifest.database.relativePath), stagedDb);
    await chmod(stagedDb, 0o600);
    if (await fileHash(stagedDb) !== manifest.database.sha256) throw new Error("The migration database changed during copying.");
    for (const item of manifest.artifacts) {
      const target = join(stage, item.relativePath);
      await mkdir(dirname(target), { recursive: true, mode: 0o700 });
      await copyFile(join(bundle, item.relativePath), target);
      await chmod(target, 0o600);
      if (await fileHash(target) !== item.sha256) throw new Error(`Artifact ${item.artifactId} changed during copying.`);
    }
    const db = new DatabaseSync(stagedDb);
    try {
      db.exec("PRAGMA journal_mode=DELETE");
      db.exec("BEGIN IMMEDIATE");
      try {
        for (const item of manifest.artifacts) db.prepare("UPDATE artifacts SET path=? WHERE artifact_id=?").run(join(profile, item.relativePath), item.artifactId);
        db.exec("COMMIT");
      } catch (error) { db.exec("ROLLBACK"); throw error; }
      if ((db.prepare("PRAGMA quick_check").get() as { quick_check: string }).quick_check !== "ok") throw new Error("The staged profile database failed integrity checking.");
    } finally { db.close(); }
    const databaseSha256 = await fileHash(stagedDb);
    const stagedManifest = JSON.stringify(manifest, null, 2) + "\n";
    const manifestSha256 = createHash("sha256").update(stagedManifest).digest("hex");
    const receipt = ReceiptSchema.parse({ format: "aux-chromium-profile-seed", version: 1, contentHash: manifest.contentHash, manifestSha256, databaseSha256,
      createdAt: Date.now(), ...(vaultHash ? { vault: { state: "pending_native_import", sha256: vaultHash, items: vaultItems } } : {}) });
    await writeFile(join(stage, "manifest.json"), stagedManifest, { mode: 0o600 });
    await writeFile(join(stage, "apply-receipt.json"), JSON.stringify(receipt, null, 2) + "\n", { mode: 0o600 });
    if (vaultBytes) await writeFile(join(stage, "vault-transfer.auxvault"), vaultBytes, { mode: 0o600 });
    try { await lstat(profile); throw new Error("The destination profile appeared while migration was being staged."); }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    await rename(stage, profile);
    return report(profile, false, false);
  } finally {
    await rm(stage, { recursive: true, force: true });
    await lock.close();
    await rm(lockPath, { force: true });
  }
}
