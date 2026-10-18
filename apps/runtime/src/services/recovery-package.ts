import { channelTablesForDatabase, financialTablesForDatabase } from "../store/db.js";
import { omitDerivedAndSpaceMemory } from "./space-memory-backup.js";
import { digest as sha } from "@aux/contracts/util/digest";
import { createCipheriv, createDecipheriv, randomBytes, randomUUID, scryptSync } from "node:crypto";
import { lstat, mkdir, readFile, realpath, rename, rm, writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { dirname, join, relative, resolve, sep } from "node:path";
import type { NativeBridge } from "../native.js";
import type { Repo } from "../store/repo.js";
import { encryptedFieldsForDatabase, FieldCodec } from "../store/field-codec.js";
import { recodeTaskEvidenceProtection } from "../store/task-evidence-protection.js";
import { transformDocumentFields, documentFieldTables } from "../store/document-fields.js";
import { ContentMemoryStore, type RecoveryPageMemory } from "./content-memory.js";
import { MemoryPipeline, type RecoverySpaceMemory } from "./memory-pipeline.js";

import { ChannelConnectionEnvelopeSchema, StoredChannelPeerSchema } from "./channel-store.js";

const MAX_DATABASE = 32 * 1024 * 1024;
const MAX_PACKAGE = 64 * 1024 * 1024;
const MAX_FILE = 96 * 1024 * 1024;
const MAX_ARTIFACT_BYTES = 32 * 1024 * 1024;
const reviews = new Map<string, { path: string; sha256: string; profileId: string; expiresAt: number }>();
const EXCLUSIONS = [
  "Chromium cookies, passwords and browser Profile stores",
  "Keychain credentials and connector tokens",
  "active connection, site and tool grants (records retained as revoked)",
  "automatic routines and goals resume paused for review",
  "retired Space-memory generations and deleted data",
] as const;
type Artifact = { id: string; path: string; bytes: string; sha256: string };
type Manifest = {
  version: 1;
  createdAt: number;
  sourceProfileId: string;
  sqliteBytes: number;
  sqliteTables: string[];
  artifactIds: string[];
  spaceMemory: { workspaceId: string; files: string[] }[];
  pageMemoryCount: number;
  excluded: typeof EXCLUSIONS;
};
type Payload = {
  manifest: Manifest;
  sqlite: string;
  artifacts: Artifact[];
  pageMemory: RecoveryPageMemory[];
  spaceMemory: RecoverySpaceMemory[];
};
type PackageFile = {
  format: "aux-recovery";
  version: 1;
  kdf: "scrypt-N32768-r8-p1";
  salt: string;
  iv: string;
  tag: string;
  ciphertext: string;
};
type SerializableDatabase = DatabaseSync & { serialize(): Uint8Array; deserialize(data: Uint8Array): void };
const serializable = (db: DatabaseSync): SerializableDatabase => db as SerializableDatabase;
/** Serialized WAL snapshots have mode bytes 2/2, which cannot open as detached memory databases. */
const detachedSnapshot = (bytes: Uint8Array): Buffer => {
  const copy = Buffer.from(bytes);
  if (copy.length < 100 || copy.subarray(0, 16).toString("ascii") !== "SQLite format 3\0")
    throw new Error("Recovery SQLite snapshot is invalid.");
  copy[18] = 1;
  copy[19] = 1;
  return copy;
};
const decode = (value: string) => {
  const bytes = Buffer.from(value, "base64");
  if (bytes.toString("base64") !== value) throw new Error("Recovery package is invalid.");
  return bytes;
};
const key = (phrase: string, salt: Buffer) =>
  scryptSync(phrase, salt, 32, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });

async function requireOwnerAuth(native: NativeBridge, purpose: "export" | "restore") {
  if (
    !native.recoveryOwnerAuth ||
    (await native.recoveryOwnerAuth({ version: 1, purpose })).approved !== true
  )
    throw new Error("Device authentication is required for protected recovery.");
}

/** Translate only selected fields in an explicit, authenticated cross-Profile recovery. */
function recodeSnapshot(db: DatabaseSync, cipher: FieldCodec, direction: "encrypt" | "decrypt"): string[] {
  const fields = encryptedFieldsForDatabase(db);
  const tables = [...Object.keys(fields), ...financialTablesForDatabase(db)];
  tables.push(...transformDocumentFields(db, cipher, direction));
  recodeTaskEvidenceProtection(db, cipher, direction);
  for (const [table, columns] of Object.entries(fields)) {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string; pk: number }[];
    const identity = info
      .filter((item) => item.pk > 0)
      .sort((a, b) => a.pk - b.pk)
      .map((item) => item.name);
    if (!identity.length || columns.some((column) => !info.some((item) => item.name === column)))
      throw new Error("Recovery found a changed encrypted SQLite schema.");
    const rows = db
      .prepare(`SELECT rowid AS aux_rowid,${[...new Set([...identity, ...columns])].join(",")} FROM ${table}`)
      .all() as (Record<string, unknown> & { aux_rowid: number })[];
    for (const row of rows) {
      const id = JSON.stringify(identity.map((column) => row[column]));
      const updates = columns.filter((column) => row[column] !== null && row[column] !== undefined);
      if (!updates.length) continue;
      const values = updates.map((column) => {
        if (typeof row[column] !== "string") throw new Error("Recovery found a non-text encrypted field.");
        return cipher[direction](table, id, column, row[column]);
      });
      db.prepare(`UPDATE ${table} SET ${updates.map((column) => `${column}=?`).join(",")} WHERE rowid=?`).run(
        ...values,
        row.aux_rowid,
      );
    }
  }
  if (direction === "decrypt")
    db.prepare("DELETE FROM aux_meta WHERE key IN ('field_codec_v3','portable_profile_proof_v3')").run();
  else
    db.prepare(
      "INSERT INTO aux_meta(key,value) VALUES('field_codec_v3','1') ON CONFLICT(key) DO UPDATE SET value=excluded.value",
    ).run();
  db.prepare("DELETE FROM kv WHERE key='setting:gatewayApiKey'").run();
  return tables;
}

function requireQuiescent(db: DatabaseSync) {
  if (
    db
      .prepare(
        "SELECT 1 FROM runs WHERE status IN ('queued','planning','running','paused','needs_input') LIMIT 1",
      )
      .get() ||
    db.prepare("SELECT 1 FROM action_intents WHERE status IN ('pending','uncertain') LIMIT 1").get() ||
    db.prepare("SELECT 1 FROM coding_repl_cells WHERE status IN ('running','parked') LIMIT 1").get() ||
    db.prepare("SELECT 1 FROM coding_file_receipts WHERE status IN ('pending','uncertain') LIMIT 1").get() ||
    db
      .prepare(
        "SELECT 1 FROM coding_process_receipts WHERE state IN ('starting','running','uncertain') LIMIT 1",
      )
      .get() ||
    db
      .prepare("SELECT 1 FROM coder_worktree_receipts WHERE state IN ('pending','uncertain') LIMIT 1")
      .get() ||
    db
      .prepare(
        "SELECT 1 FROM run_messages WHERE status IN ('accepted','delivering','needs_attention') LIMIT 1",
      )
      .get() ||
    db
      .prepare(
        "SELECT 1 FROM operation_invocations WHERE status IN ('running','interrupted') OR effect_outcome='unknown' LIMIT 1",
      )
      .get()
  )
    throw new Error(
      "Settle or review active work and uncertain actions before exporting a recovery package.",
    );
}

function rebindProfile(db: DatabaseSync, source: string, destination: string) {
  const rebindJson = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(rebindJson);
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => {
        if ((key === "profileId" || key === "profile_id") && typeof entry === "string") {
          if (entry !== source) throw new Error("Recovery JSON includes another Profile identity.");
          return [key, destination];
        }
        return [key, rebindJson(entry)];
      }),
    );
  };
  for (const item of db
    .prepare(
      "SELECT name FROM sqlite_schema WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE 'history_fts%'",
    )
    .all() as { name: string }[]) {
    if (!/^[a-z][a-z0-9_]*$/.test(item.name)) throw new Error("Recovery SQLite table name is unsafe.");
    const columns = db.prepare(`PRAGMA table_info(${item.name})`).all() as { name: string }[];
    for (const column of columns) {
      if (!/^[a-z][a-z0-9_]*$/.test(column.name)) throw new Error("Recovery SQLite column name is unsafe.");
      const rows = db
        .prepare(
          `SELECT rowid AS aux_rowid,${column.name} AS value FROM ${item.name} WHERE ${column.name} IS NOT NULL`,
        )
        .all() as { aux_rowid: number; value: unknown }[];
      for (const row of rows) {
        if (typeof row.value !== "string" || (row.value[0] !== "{" && row.value[0] !== "[")) continue;
        let parsed: unknown;
        try {
          parsed = JSON.parse(row.value);
        } catch {
          continue;
        }
        const updated = rebindJson(parsed);
        if (JSON.stringify(updated) !== JSON.stringify(parsed))
          db.prepare(`UPDATE ${item.name} SET ${column.name}=? WHERE rowid=?`).run(
            JSON.stringify(updated),
            row.aux_rowid,
          );
      }
    }
    if (!columns.some((column) => column.name === "profile_id")) continue;
    if (db.prepare(`SELECT 1 FROM ${item.name} WHERE profile_id<>? LIMIT 1`).get(source))
      throw new Error("Recovery package contains another Profile's data.");
    db.prepare(`UPDATE ${item.name} SET profile_id=? WHERE profile_id=?`).run(destination, source);
  }
  for (const row of db
    .prepare(
      "SELECT key FROM kv WHERE key LIKE 'setting:pageMemoryFactorName:%' OR key LIKE 'setting:pageMemoryRetiredFactors:%'",
    )
    .all() as { key: string }[])
    db.prepare("DELETE FROM kv WHERE key=?").run(row.key);
  db.prepare("DELETE FROM ai_result_cache").run();
  db.prepare("DELETE FROM content_memory").run();
  db.prepare("UPDATE calendar_connections SET account_key_lookup=account_key").run();
  const at = Date.now();
  for (const table of [
    "calendar_task_grants",
    "vault_items",
    "vault_grants",
    "agent_connections",
    "plugin_skill_grants",
  ])
    db.prepare(`UPDATE ${table} SET revoked_at=? WHERE revoked_at IS NULL`).run(at);
  if (channelTablesForDatabase(db).length) {
    for (const row of db.prepare("SELECT connection_id,body FROM channel_connections").all() as {
      connection_id: string;
      body: string;
    }[]) {
      const envelope = ChannelConnectionEnvelopeSchema.parse(JSON.parse(row.body));
      const connection = { ...envelope.connection, enabled: false, revision: randomUUID(), updatedAt: at };
      db.prepare(
        "UPDATE channel_connections SET enabled=0,revision=?,body=?,updated_at=? WHERE connection_id=?",
      ).run(connection.revision, JSON.stringify({ ...envelope, connection }), at, row.connection_id);
    }
    for (const row of db.prepare("SELECT connection_id,peer_key,body FROM channel_peers").all() as {
      connection_id: string;
      peer_key: string;
      body: string;
    }[]) {
      const peer = StoredChannelPeerSchema.parse(JSON.parse(row.body));
      const { authorityId: _authority, requestId: _request, expiresAt: _expiry, ...record } = peer;
      db.prepare("UPDATE channel_peers SET body=? WHERE connection_id=? AND peer_key=?").run(
        JSON.stringify({ ...record, state: peer.state === "blocked" ? "blocked" : "pending", updatedAt: at }),
        row.connection_id,
        row.peer_key,
      );
    }
    db.prepare("DELETE FROM channel_cursors").run();
    db.prepare(
      "UPDATE channel_messages SET state='retired' WHERE state IN ('pending','admitting','running','queued')",
    ).run();
    db.prepare(
      "UPDATE channel_outbox SET state=CASE WHEN state='sending' THEN 'unknown' ELSE 'failed' END,updated_at=? WHERE state IN ('pending','sending')",
    ).run(at);
  }
  db.prepare("UPDATE calendar_connections SET state='needs_reauth' WHERE revoked_at IS NULL").run();
  db.prepare("UPDATE outbound_mcp_servers SET state='revoked' WHERE state='approved'").run();
  db.prepare("UPDATE safety_approval_requests SET state='cancelled' WHERE state='pending'").run();
  db.prepare(
    "UPDATE safety_send_journal SET state='cancelled' WHERE state IN ('queued','offline','sending')",
  ).run();
  db.prepare("UPDATE hooks SET trust='revoked' WHERE trust='approved'").run();
  db.prepare("UPDATE routines SET paused=1 WHERE paused=0").run();
  db.prepare(
    "UPDATE routine_runs SET status='needs_review' WHERE status IN ('queued','running','waiting_input')",
  ).run();
  db.prepare("UPDATE goals SET status='paused' WHERE status IN ('starting','active','needs_input')").run();
}

async function readArtifacts(db: DatabaseSync, dataDir: string): Promise<Artifact[]> {
  const rows = db
    .prepare("SELECT artifact_id AS id,path FROM artifacts WHERE status='complete' ORDER BY artifact_id")
    .all() as { id: string; path: string }[];
  if (!rows.length) return [];
  const root = await realpath(resolve(dataDir, "artifacts"));
  const output: Artifact[] = [];
  let total = 0;
  for (const row of rows) {
    const original = await lstat(row.path);
    const path = await realpath(row.path);
    const rel = relative(root, path);
    const info = await lstat(path);
    if (!rel || rel === ".." || rel.startsWith(`..${sep}`) || original.isSymbolicLink() || !info.isFile())
      throw new Error("Recovery found an unsafe or missing artifact.");
    total += info.size;
    if (total > MAX_ARTIFACT_BYTES)
      throw new Error("Recovery artifacts exceed the 32 MB reviewed size cap. No export was created.");
    const bytes = await readFile(path);
    output.push({ id: row.id, path: rel, bytes: bytes.toString("base64"), sha256: sha(bytes) });
  }
  return output;
}

function seal(payload: Payload, phrase: string): Buffer {
  const plain = Buffer.from(JSON.stringify(payload));
  if (plain.length > MAX_PACKAGE)
    throw new Error("Recovery package exceeds the 64 MB reviewed size cap. No export was created.");
  const salt = randomBytes(16),
    iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(phrase, salt), iv);
  cipher.setAAD(Buffer.from("aux-recovery:v1"));
  const ciphertext = Buffer.concat([cipher.update(plain), cipher.final()]);
  const file: PackageFile = {
    format: "aux-recovery",
    version: 1,
    kdf: "scrypt-N32768-r8-p1",
    salt: salt.toString("base64"),
    iv: iv.toString("base64"),
    tag: cipher.getAuthTag().toString("base64"),
    ciphertext: ciphertext.toString("base64"),
  };
  return Buffer.from(JSON.stringify(file));
}

async function openPackage(path: string, phrase: string): Promise<{ payload: Payload; sha256: string }> {
  const info = await lstat(path);
  if (info.isSymbolicLink() || !info.isFile() || info.size > MAX_FILE)
    throw new Error("Choose a regular Aux recovery package no larger than 96 MB.");
  const bytes = await readFile(path);
  let file: Partial<PackageFile>;
  try {
    file = JSON.parse(bytes.toString("utf8")) as Partial<PackageFile>;
  } catch {
    throw new Error("Recovery package is invalid.");
  }
  if (
    file.format !== "aux-recovery" ||
    file.version !== 1 ||
    file.kdf !== "scrypt-N32768-r8-p1" ||
    typeof file.salt !== "string" ||
    typeof file.iv !== "string" ||
    typeof file.tag !== "string" ||
    typeof file.ciphertext !== "string"
  )
    throw new Error("Recovery package version is unsupported.");
  const salt = decode(file.salt),
    iv = decode(file.iv),
    tag = decode(file.tag),
    ciphertext = decode(file.ciphertext);
  if (salt.length !== 16 || iv.length !== 12 || tag.length !== 16 || ciphertext.length > MAX_PACKAGE)
    throw new Error("Recovery package is invalid or too large.");
  let payload: Payload;
  try {
    const decipher = createDecipheriv("aes-256-gcm", key(phrase, salt), iv);
    decipher.setAAD(Buffer.from("aux-recovery:v1"));
    decipher.setAuthTag(tag);
    payload = JSON.parse(
      Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8"),
    ) as Payload;
  } catch {
    throw new Error("The recovery phrase is wrong or the package was changed.");
  }
  if (
    payload.manifest?.version !== 1 ||
    !Array.isArray(payload.artifacts) ||
    !Array.isArray(payload.pageMemory) ||
    !Array.isArray(payload.spaceMemory) ||
    typeof payload.sqlite !== "string" ||
    JSON.stringify(payload.manifest.excluded) !== JSON.stringify(EXCLUSIONS)
  )
    throw new Error("Recovery package manifest is invalid.");
  return { payload, sha256: sha(bytes) };
}

export async function exportRecoveryPackage(
  repo: Repo,
  native: NativeBridge,
  dataDir: string,
  profileId: string,
  phrase: string,
) {
  if (!repo.columnCipher || !profileId || phrase.length < 16 || phrase.length > 200)
    throw new Error("Recovery needs a protected Profile and a phrase of 16 to 200 characters.");
  await requireOwnerAuth(native, "export");
  const pageStore = new ContentMemoryStore(repo, native, profileId);
  const memory = new MemoryPipeline(repo, native, profileId);
  const sourceCipher = await FieldCodec.create(native, profileId, false);
  const pageMemory = await pageStore.recoverySnapshot();
  const spaceMemoryGeneration = memory.currentStateDigest();
  const spaceMemory = await memory.recoverySnapshot();
  requireQuiescent(repo.db);
  const pages = (repo.db.prepare("PRAGMA page_count").get() as { page_count: number }).page_count;
  const pageSize = (repo.db.prepare("PRAGMA page_size").get() as { page_size: number }).page_size;
  if (pages * pageSize > MAX_DATABASE)
    throw new Error("Recovery database exceeds the 32 MB reviewed size cap. No export was created.");
  const serialized = detachedSnapshot(serializable(repo.db).serialize());
  if (serialized.length > MAX_DATABASE)
    throw new Error("Recovery database exceeds the 32 MB reviewed size cap. No export was created.");
  const db = new DatabaseSync(":memory:");
  let payload: Payload;
  try {
    serializable(db).deserialize(serialized);
    requireQuiescent(db);
    const artifacts = await readArtifacts(db, dataDir);
    const tables = recodeSnapshot(db, sourceCipher, "decrypt");
    db.prepare("DELETE FROM content_memory").run();
    omitDerivedAndSpaceMemory(db);
    const manifest: Manifest = {
      version: 1,
      createdAt: Date.now(),
      sourceProfileId: profileId,
      sqliteBytes: serializable(db).serialize().length,
      sqliteTables: tables,
      artifactIds: artifacts.map((item) => item.id),
      spaceMemory: spaceMemory.map((item) => ({ workspaceId: item.workspaceId, files: item.verifiedFiles })),
      pageMemoryCount: pageMemory.length,
      excluded: EXCLUSIONS,
    };
    payload = {
      manifest,
      sqlite: Buffer.from(serializable(db).serialize()).toString("base64"),
      artifacts,
      pageMemory,
      spaceMemory,
    };
  } finally {
    db.close();
    pageStore.close();
  }
  const bytes = seal(payload, phrase);
  const directory = join(dataDir, "recovery-exports");
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const path = join(directory, `aux-recovery-${new Date().toISOString().replace(/[:.]/g, "-")}.auxrec`);
  if (memory.currentStateDigest() !== spaceMemoryGeneration)
    throw new Error("Space memory changed during recovery export. Prepare the export again.");
  await writeFile(path, bytes, { flag: "wx", mode: 0o600 });
  if (memory.currentStateDigest() !== spaceMemoryGeneration) {
    await rm(path, { force: true });
    throw new Error("Space memory changed during recovery export. Prepare the export again.");
  }
  return { path, sha256: sha(bytes), manifest: payload.manifest };
}

export async function inspectRecoveryPackage(path: string, phrase: string, profileId: string) {
  if (!profileId) throw new Error("Review recovery in the destination Profile.");
  const { payload, sha256 } = await openPackage(path, phrase);
  for (const [token, review] of reviews) if (review.expiresAt <= Date.now()) reviews.delete(token);
  if (reviews.size >= 32) reviews.delete(reviews.keys().next().value!);
  const reviewToken = randomUUID();
  reviews.set(reviewToken, { path, sha256, profileId, expiresAt: Date.now() + 10 * 60_000 });
  return { sha256, reviewToken, manifest: payload.manifest };
}

/** Stage a fully rebound database and sealed Space memory. Startup applies it before opening either store. */
export async function stageRecoveryPackage(
  repo: Repo,
  native: NativeBridge,
  dataDir: string,
  profileId: string,
  path: string,
  phrase: string,
  expectedSha256: string,
  reviewToken: string,
  interrupt?: () => void,
) {
  const review = reviews.get(reviewToken);
  if (
    !review ||
    review.path !== path ||
    review.sha256 !== expectedSha256 ||
    review.profileId !== profileId ||
    review.expiresAt <= Date.now()
  )
    throw new Error("Review this recovery package again before staging it.");
  if (!repo.columnCipher || !profileId) throw new Error("Recovery needs a protected destination Profile.");
  await requireOwnerAuth(native, "restore");
  if (
    repo.db.prepare("SELECT 1 FROM workspaces LIMIT 1").get() ||
    repo.db.prepare("SELECT 1 FROM runs LIMIT 1").get() ||
    repo.db.prepare("SELECT 1 FROM artifacts LIMIT 1").get() ||
    repo.db.prepare("SELECT 1 FROM content_memory LIMIT 1").get()
  )
    throw new Error("Use a new, empty Profile for recovery.");
  for (const name of [
    "pending-runtime-restore.json",
    "pending-runtime-restore.sqlite",
    "pending-runtime-restore-artifacts",
  ]) {
    try {
      await lstat(join(dataDir, name));
      throw new Error("Finish or cancel the existing restore first.");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
  const { payload, sha256 } = await openPackage(path, phrase);
  if (sha256 !== expectedSha256) throw new Error("The reviewed recovery package changed.");
  const { manifest } = payload;
  if (
    !manifest.sourceProfileId ||
    manifest.sourceProfileId === profileId ||
    manifest.pageMemoryCount !== payload.pageMemory.length ||
    JSON.stringify(manifest.artifactIds) !== JSON.stringify(payload.artifacts.map((item) => item.id)) ||
    JSON.stringify(manifest.spaceMemory) !==
      JSON.stringify(
        payload.spaceMemory.map((item) => ({ workspaceId: item.workspaceId, files: item.verifiedFiles })),
      )
  )
    throw new Error("Recovery package inventory is invalid.");
  const serialized = detachedSnapshot(decode(payload.sqlite));
  if (serialized.length !== manifest.sqliteBytes || serialized.length > MAX_DATABASE)
    throw new Error("Recovery database inventory is invalid.");
  const db = new DatabaseSync(":memory:");
  const staging = join(dataDir, `pending-recovery-${randomBytes(8).toString("hex")}`);
  await mkdir(staging, { mode: 0o700 });
  try {
    serializable(db).deserialize(serialized);
    const sourceTables = manifest.sqliteTables;
    if (!Array.isArray(sourceTables) || sourceTables.some((table) => typeof table !== "string"))
      throw new Error("Recovery SQLite inventory is invalid.");
    rebindProfile(db, manifest.sourceProfileId, profileId);
    if (
      JSON.stringify([...sourceTables].sort()) !==
      JSON.stringify(
        [
          ...Object.keys(encryptedFieldsForDatabase(db)),
          ...financialTablesForDatabase(db),
          ...documentFieldTables(db),
        ].sort(),
      )
    )
      throw new Error("Recovery SQLite inventory is invalid.");
    recodeSnapshot(db, repo.columnCipher, "encrypt");
    const stagedRepo = new (
      repo.constructor as new (db: DatabaseSync, cipher: typeof repo.columnCipher) => Repo
    )(db, repo.columnCipher);
    const pageStore = new ContentMemoryStore(stagedRepo, native, profileId);
    await pageStore.importRecoverySnapshot(payload.pageMemory);
    pageStore.close();
    const spaceMemory = new MemoryPipeline(stagedRepo, native, profileId);
    await spaceMemory.importRecoverySnapshot(payload.spaceMemory);
    interrupt?.();
    const artifactRoot = join(staging, "artifacts");
    await mkdir(artifactRoot, { mode: 0o700 });
    const files: { artifactId: string; relativePath: string; bytes: number; sha256: string }[] = [];
    const seen = new Set<string>();
    for (const artifact of payload.artifacts) {
      const bytes = decode(artifact.bytes);
      if (
        !artifact.id ||
        !artifact.path ||
        artifact.path.includes("\\") ||
        artifact.path.split("/").some((p) => !p || p === "." || p === "..") ||
        seen.has(artifact.path) ||
        sha(bytes) !== artifact.sha256
      )
        throw new Error("Recovery artifact inventory is invalid.");
      seen.add(artifact.path);
      const target = join(artifactRoot, artifact.path);
      await mkdir(dirname(target), { recursive: true, mode: 0o700 });
      await writeFile(target, bytes, { flag: "wx", mode: 0o600 });
      db.prepare("UPDATE artifacts SET path=?,size=? WHERE artifact_id=? AND status='complete'").run(
        join(dataDir, "artifacts", artifact.path),
        bytes.length,
        artifact.id,
      );
      files.push({
        artifactId: artifact.id,
        relativePath: artifact.path,
        bytes: bytes.length,
        sha256: artifact.sha256,
      });
    }
    const expected = (
      db.prepare("SELECT artifact_id FROM artifacts WHERE status='complete' ORDER BY artifact_id").all() as {
        artifact_id: string;
      }[]
    ).map((row) => row.artifact_id);
    if (JSON.stringify(expected) !== JSON.stringify(files.map((item) => item.artifactId)))
      throw new Error("Recovery omitted a complete artifact.");
    const database = Buffer.from(serializable(db).serialize());
    await writeFile(join(staging, "state.sqlite"), database, { flag: "wx", mode: 0o600 });
    const pending = join(dataDir, "pending-runtime-restore.json");
    const stagedFiles = files;
    await rename(join(staging, "state.sqlite"), join(dataDir, "pending-runtime-restore.sqlite"));
    await rename(artifactRoot, join(dataDir, "pending-runtime-restore-artifacts"));
    await writeFile(
      pending,
      JSON.stringify(
        {
          version: 2,
          createdAt: Date.now(),
          schemaVersion: (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version,
          bytes: database.length,
          sha256: sha(database),
          artifactFiles: stagedFiles,
          recoveryPackage: true,
          recoveryProfileId: profileId,
        },
        null,
        2,
      ),
      { flag: "wx", mode: 0o600 },
    );
    reviews.delete(reviewToken);
    return {
      staged: true as const,
      artifactFiles: files.length,
      spaceCount: payload.spaceMemory.length,
      pageMemoryCount: payload.pageMemory.length,
    };
  } catch (error) {
    await Promise.all(
      ["pending-runtime-restore.sqlite", "pending-runtime-restore-artifacts"].map((name) =>
        rm(join(dataDir, name), { recursive: true, force: true }),
      ),
    );
    throw error;
  } finally {
    db.close();
    await rm(staging, { recursive: true, force: true });
  }
}
