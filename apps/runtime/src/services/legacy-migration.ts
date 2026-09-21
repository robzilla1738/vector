import { chmodSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { copyFile, mkdir, readdir, rm, writeFile } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { VectorError } from "@vector/contracts";
import { defaultAuxDataDirectory, defaultLegacyVectorDataDirectory, hasLegacyCredentialFiles, resolveDatabasePath } from "@vector/contracts/installation";

const SKIP = new Set(["secrets", "gateway.key", "model.key", "runtime.json", "Cookies", "Local State", "Preferences", "Partitions"]);

export function legacyInstallationStatus(opts: { source?: string; destination?: string; home?: string; platform?: NodeJS.Platform } = {}) {
  const destination = opts.destination ?? defaultAuxDataDirectory(opts.home, opts.platform ?? process.platform);
  const source = opts.source ?? (existsSync(defaultLegacyVectorDataDirectory(opts.home)) ? defaultLegacyVectorDataDirectory(opts.home) : null);
  const dualRoots = !!(source && existsSync(source) && existsSync(destination) && resolve(source) !== resolve(destination));
  const migrated = existsSync(join(destination, "legacy-migration.json"));
  const skippedCredentials = !!(source && hasLegacyCredentialFiles(source));
  let blockedReason: string | undefined;
  if (dualRoots && !migrated) blockedReason = "Both Aux and legacy Vector data exist. Confirm an explicit migration or set AUX_DATA_DIR.";
  return { source, destination, dualRoots, skippedCredentials, migrated, blockedReason };
}

export async function migrateLegacyInstallation(opts: { confirm: true; source?: string; destination?: string; home?: string; platform?: NodeJS.Platform }) {
  const status = legacyInstallationStatus(opts);
  if (!status.source) throw new VectorError("not_found", "No legacy Vector data directory was found.");
  const source = resolve(status.source);
  const destination = resolve(opts.destination ?? status.destination);
  if (source === destination) throw new VectorError("conflict", "The source and destination are the same directory.");
  if (existsSync(join(destination, "legacy-migration.json"))) throw new VectorError("conflict", "A Vector→Aux migration already completed for this destination.");
  const destDb = existsSync(join(destination, "aux-state.sqlite")) || existsSync(join(destination, "vector.sqlite"));
  if (destDb) throw new VectorError("conflict", "The Aux data directory already has a runtime database. Set AUX_DATA_DIR if you meant to keep using it.");
  mkdirSync(destination, { recursive: true, mode: 0o700 });
  const backup = join(destination, `vector-migration-backup-${Date.now()}`);
  mkdirSync(backup, { recursive: true, mode: 0o700 });
  const skipped: string[] = [];
  const sourceDb = resolveDatabasePath(source);
  const destDbPath = join(destination, "aux-state.sqlite");
  if (existsSync(sourceDb)) {
    const db = new DatabaseSync(sourceDb, { readOnly: true });
    try {
      db.prepare("VACUUM INTO ?").run(join(backup, "state.sqlite"));
      db.prepare("VACUUM INTO ?").run(destDbPath);
    } finally { db.close(); }
    chmodSync(join(backup, "state.sqlite"), 0o600);
    chmodSync(destDbPath, 0o600);
    const cleaned = new DatabaseSync(destDbPath);
    try {
      cleaned.prepare("DELETE FROM kv WHERE key LIKE 'setting:%Key' OR key LIKE 'setting:%Credential%' OR key='setting:gatewayApiKey'").run();
      cleaned.exec("VACUUM");
    } finally { cleaned.close(); }
  }
  let artifactFiles = 0;
  const artifacts = join(source, "artifacts");
  if (existsSync(artifacts)) {
    await copyTree(artifacts, join(destination, "artifacts"), skipped);
    artifactFiles = countFiles(join(destination, "artifacts"));
  }
  for (const name of readdirSync(source)) {
    if (SKIP.has(name) || name === "artifacts" || name.endsWith(".sqlite") || name.endsWith(".sqlite-wal") || name.endsWith(".sqlite-shm")) {
      if (SKIP.has(name)) skipped.push(name);
      continue;
    }
    const from = join(source, name);
    try {
      const info = statSync(from);
      if (info.isDirectory()) await copyTree(from, join(destination, name), skipped);
      else if (info.isFile() && info.size < 32 * 1024 * 1024) {
        await copyFile(from, join(destination, name));
      } else skipped.push(name);
    } catch { skipped.push(name); }
  }
  const skippedCredentials = skipped.some(name => SKIP.has(name)) || hasLegacyCredentialFiles(source);
  const receipt = {
    source, destination, backup, copiedDatabase: existsSync(destDbPath), artifactFiles, skippedCredentials, skipped,
    createdAt: Date.now(),
    note: skippedCredentials ? "Encrypted credentials and password stores were not copied. Re-enter keys in Settings." : "No credential files were present to skip.",
  };
  await writeFile(join(destination, "legacy-migration.json"), `${JSON.stringify(receipt, null, 2)}\n`, { encoding: "utf8", mode: 0o600 });
  return { source, destination, backup, copiedDatabase: receipt.copiedDatabase, artifactFiles, skippedCredentials, skipped };
}

async function copyTree(from: string, to: string, skipped: string[]) {
  await mkdir(to, { recursive: true, mode: 0o700 });
  for (const entry of await readdir(from, { withFileTypes: true })) {
    if (SKIP.has(entry.name) || entry.name.startsWith(".")) { skipped.push(entry.name); continue; }
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    const rel = relative(from, source);
    if (!rel || rel.startsWith(`..${sep}`)) continue;
    if (entry.isDirectory()) await copyTree(source, target, skipped);
    else if (entry.isFile()) {
      try { await copyFile(source, target); } catch { skipped.push(rel); }
    }
  }
}

function countFiles(root: string): number {
  if (!existsSync(root)) return 0;
  let total = 0;
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) walk(join(dir, entry.name));
      else if (entry.isFile()) total++;
    }
  };
  walk(root);
  return total;
}

export async function removeFailedMigration(destination: string) {
  await rm(join(destination, "legacy-migration.json"), { force: true });
}
