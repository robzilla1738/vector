import { resolveDatabasePath } from "@aux/contracts/installation";
import { omitMemoryRestoreTransition } from "./space-memory-restore.js";
import { memoryRestoreSources } from "./memory-restore-sources.js";
import { inspectLegacyArticleHistory } from "./legacy-memory-retirement.js";
import { TranscriptStore } from "../agent/loop/transcript.js";
import { ConversationBranches } from "./conversation-branches.js";
import { retireDesktopTranscript } from "./desktop-context-retirement.js";
import {
  currentSpaceMemory,
  omitDerivedAndSpaceMemory,
  retainSpaceMemory,
  spaceMemoryDigest,
} from "./space-memory-backup.js";
import type { MemoryPipeline } from "./memory-pipeline.js";
import { digest as bytesDigest } from "@aux/contracts/util/digest";
import { digestFile as digest } from "@aux/contracts/util/digest-file";
import { randomUUID } from "node:crypto";
import {
  constants,
  existsSync,
  openSync,
  closeSync,
  writeFileSync,
  fsyncSync,
  fstatSync,
  lstatSync,
  renameSync,
  unlinkSync,
} from "node:fs";
import {
  chmod,
  copyFile,
  lstat,
  mkdir,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import { DatabaseSync, backup } from "node:sqlite";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import {
  SCHEMA_VERSION,
  openDb,
  financialTablesForDatabase,
  documentTablesForDatabase,
  desktopTablesForDatabase,
  googleTablesForDatabase,
  xTablesForDatabase,
  connectorTransferTablesForDatabase,
  channelTablesForDatabase,
  discardIncompleteDocumentSnapshots,
} from "../store/db.js";
import { Repo } from "../store/repo.js";
import { protectedRunFamily, retireProtectedGeneratedTask } from "./run-lineage.js";
import { sanitizePortablePageRecall } from "@aux/contracts/portable-page-recall";
import {
  authenticateConnectorTransfers,
  encryptedFieldsForDatabase,
  type FieldCodec,
} from "../store/field-codec.js";
import { authenticateTaskEvidenceProtection } from "../store/task-evidence-protection.js";
import { transformDocumentFields, protectLegacyDocumentCollections } from "../store/document-fields.js";
import { minimizedObservationArtifactBytes } from "./observation-artifact-minimization.js";
import {
  assertManagedRecoveryGeneration,
  ensureManagedRecoveryGeneration,
  type ManagedRecoveryGeneration,
} from "./managed-recovery-generation.js";

const MAX_BACKUP_BYTES = 2 * 1024 * 1024 * 1024,
  MAX_ARTIFACT_BYTES = 1024 * 1024 * 1024,
  MAX_ARTIFACTS = 10_000;
const BACKUP_PREFIX = "aux-runtime-";
const RETENTION_KEY = "backupRetentionKeep";
export const BACKUP_KEEP_OPTIONS = [3, 5, 10, 20] as const;
export type BackupKeep = (typeof BACKUP_KEEP_OPTIONS)[number];
export function backupRetention(repo: Repo): { keep: BackupKeep } {
  const value = repo.getSetting<unknown>(RETENTION_KEY);
  return { keep: value === 3 || value === 5 || value === 10 || value === 20 ? value : 10 };
}
export function setBackupRetention(repo: Repo, keep: BackupKeep) {
  repo.setSetting(RETENTION_KEY, keep);
  return { keep };
}
export async function listRuntimeBackups(dataDir: string) {
  const current = ensureManagedRecoveryGeneration(dataDir);
  const backups = join(dataDir, "backups");
  let names: string[] = [];
  try {
    names = (await readdir(backups, { withFileTypes: true }))
      .filter((item) => item.isDirectory() && item.name.startsWith(BACKUP_PREFIX))
      .map((item) => item.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return [];
  }
  const listed: {
    path: string;
    name: string;
    createdAt: number;
    bytes: number;
    schemaVersion: number;
    sha256: string;
    artifactFiles: number;
    missingArtifacts: number;
    restorable: boolean;
  }[] = [];
  for (const name of names.sort().reverse()) {
    const root = join(backups, name);
    try {
      const manifest = await readManifest(root);
      const info = await stat(join(root, "state.sqlite"));
      listed.push({
        path: root,
        name,
        createdAt: manifest.createdAt,
        bytes: info.size + manifest.artifacts.reduce((sum, item) => sum + item.bytes, 0),
        schemaVersion: manifest.schemaVersion,
        sha256: manifest.database.sha256,
        artifactFiles: manifest.artifacts.length,
        missingArtifacts: manifest.missingArtifacts,
        restorable:
          manifest.recoveryGeneration?.lineageId === current.lineageId &&
          manifest.recoveryGeneration?.generation === current.generation,
      });
    } catch {
      /* Incomplete folders without a valid manifest are skipped. */
    }
  }
  assertManagedRecoveryGeneration(dataDir, current);
  return listed;
}
export async function deleteRuntimeBackup(dataDir: string, name: string, expectedSha256: string) {
  if (!/^aux-runtime-[A-Za-z0-9._-]{1,160}$/.test(name)) throw new Error("Choose a listed Aux backup.");
  const listed = (await listRuntimeBackups(dataDir)).find(
    (item) => item.name === name && item.sha256 === expectedSha256,
  );
  if (!listed) throw new Error("This backup changed or is no longer available. Refresh the list.");
  const info = await lstat(listed.path);
  if (info.isSymbolicLink() || !info.isDirectory()) throw new Error("This backup folder is no longer valid.");
  await rm(listed.path, { recursive: true, force: false });
  return { deleted: true as const };
}
type ManifestArtifact = { artifactId: string; relativePath: string; bytes: number; sha256: string };
type BackupManifest = {
  formatVersion: 1;
  createdAt: number;
  schemaVersion: number;
  database: { bytes: number; sha256: string };
  artifacts: ManifestArtifact[];
  missingArtifacts: number;
  recoveryGeneration?: ManagedRecoveryGeneration;
};

/** Authenticate every protected value before publishing a copy or pending restore. */
function authenticateProtectedCopy(db: DatabaseSync, cipher?: FieldCodec) {
  authenticateConnectorTransfers(db, cipher);
  const marker = db.prepare("SELECT value FROM aux_meta WHERE key='field_codec_v3'").get();
  if (!marker) return;
  if (!cipher)
    throw new Error("This encrypted backup requires the original Profile key or reviewed recovery.");
  authenticateTaskEvidenceProtection(db, cipher);
  const proof = db.prepare("SELECT value FROM aux_meta WHERE key='portable_profile_proof_v3'").get() as
    { value: string } | undefined;
  if (
    proof &&
    cipher.decrypt("aux_meta", JSON.stringify(["portable_profile_proof_v3"]), "value", proof.value) !==
      "aux-portable-profile-v3"
  )
    throw new Error("The encrypted backup belongs to another Profile.");
  for (const [table, columns] of Object.entries(encryptedFieldsForDatabase(db))) {
    const info = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string; pk: number }[];
    const identity = info
      .filter((item) => item.pk > 0)
      .sort((a, b) => a.pk - b.pk)
      .map((item) => item.name);
    if (!identity.length || columns.some((column) => !info.some((item) => item.name === column)))
      throw new Error("The encrypted backup schema is invalid.");
    const rows = db
      .prepare(`SELECT ${[...new Set([...identity, ...columns])].join(",")} FROM ${table}`)
      .all() as Record<string, unknown>[];
    for (const row of rows) {
      const id = JSON.stringify(identity.map((column) => row[column]));
      for (const column of columns) {
        const value = row[column];
        if (value === null || value === undefined) continue;
        if (typeof value !== "string") throw new Error("The encrypted backup contains a non-text value.");
        cipher.decrypt(table, id, column, value);
      }
    }
  }
  transformDocumentFields(db, cipher, "authenticate");
}

function validateDatabase(path: string) {
  const db = new DatabaseSync(path, { readOnly: true });
  try {
    const version = (db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version;
    if (![2, 3, 4, 5, 6, 7, 8, 9, 10, 11, SCHEMA_VERSION].includes(version))
      throw new Error(`This backup uses unsupported database schema ${version}.`);
    if (
      !db.prepare("SELECT 1 FROM sqlite_schema WHERE name='aux_meta'").get() ||
      (db.prepare("SELECT value FROM aux_meta WHERE key='schema'").get() as { value: string } | undefined)
        ?.value !== "aux-v3"
    )
      throw new Error("The selected file is not an Aux database.");
    const check = db.prepare("PRAGMA quick_check").get() as { quick_check: string };
    if (check["quick_check"] !== "ok")
      throw new Error("The selected backup failed SQLite integrity checking.");
    for (const table of ["kv", "pages", "runs", "tasks", "artifacts"])
      if (!db.prepare("SELECT 1 FROM sqlite_schema WHERE type='table' AND name=?").get(table))
        throw new Error(`The selected file is missing the ${table} table.`);
    if (
      db
        .prepare(
          "SELECT 1 FROM sqlite_schema WHERE (type IN ('trigger','view') OR upper(coalesce(sql,'')) LIKE '%VIRTUAL TABLE%') AND name NOT LIKE 'history_fts%' LIMIT 1",
        )
        .get()
    )
      throw new Error("The selected backup contains unsupported executable database schema.");
    financialTablesForDatabase(db);
    documentTablesForDatabase(db);
    channelTablesForDatabase(db);
    desktopTablesForDatabase(db);
    googleTablesForDatabase(db);
    xTablesForDatabase(db);
    connectorTransferTablesForDatabase(db);
    return version;
  } finally {
    db.close();
  }
}
function safeRelative(value: unknown) {
  if (typeof value !== "string" || !value || value.length > 1024 || isAbsolute(value))
    throw new Error("The backup contains an invalid artifact path.");
  const normalized = value.replaceAll("\\", "/");
  if (normalized.split("/").some((part) => !part || part === "." || part === ".."))
    throw new Error("The backup contains an unsafe artifact path.");
  return normalized;
}
async function readBoundedManifest(handle: Awaited<ReturnType<typeof open>>, size: number) {
  if (!Number.isSafeInteger(size) || size < 0 || size > 10 * 1024 * 1024)
    throw new Error("The backup manifest is invalid.");
  const buffer = Buffer.alloc(size + 1);
  let offset = 0;
  while (offset < buffer.length) {
    const result = await handle.read(buffer, offset, buffer.length - offset, offset);
    if (!result.bytesRead) break;
    offset += result.bytesRead;
  }
  if (offset !== size) throw new Error("The backup manifest changed while reading.");
  return buffer.subarray(0, offset);
}
async function readManifest(root: string): Promise<BackupManifest> {
  const path = join(root, "manifest.json"),
    handle = await open(path, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const before = await handle.stat();
    if (!before.isFile()) throw new Error("The backup manifest is invalid.");
    const bytes = await readBoundedManifest(handle, before.size),
      [after, named] = await Promise.all([handle.stat(), lstat(path)]);
    for (const value of [after, named])
      if (
        !value.isFile() ||
        value.isSymbolicLink() ||
        value.dev !== before.dev ||
        value.ino !== before.ino ||
        value.size !== before.size ||
        value.mtimeMs !== before.mtimeMs ||
        value.ctimeMs !== before.ctimeMs
      )
        throw new Error("The backup manifest changed while reading.");
    return parseManifest(bytes.toString("utf8"));
  } finally {
    await handle.close();
  }
}
function parseManifest(text: string): BackupManifest {
  const value = JSON.parse(text) as Partial<BackupManifest>;
  if (
    value.formatVersion !== 1 ||
    typeof value.createdAt !== "number" ||
    typeof value.schemaVersion !== "number" ||
    !value.database ||
    typeof value.database.bytes !== "number" ||
    typeof value.database.sha256 !== "string" ||
    !Array.isArray(value.artifacts) ||
    value.artifacts.length > MAX_ARTIFACTS ||
    typeof value.missingArtifacts !== "number"
  )
    throw new Error("This is not a supported Aux runtime backup.");
  const ids = new Set<string>(),
    paths = new Set<string>();
  for (const item of value.artifacts) {
    if (
      !item ||
      typeof item.artifactId !== "string" ||
      !/^[A-Za-z0-9_-]{1,128}$/.test(item.artifactId) ||
      typeof item.bytes !== "number" ||
      item.bytes < 0 ||
      typeof item.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(item.sha256)
    )
      throw new Error("The backup manifest contains an invalid artifact.");
    const rel = safeRelative(item.relativePath);
    if (ids.has(item.artifactId) || paths.has(rel))
      throw new Error("The backup manifest repeats an artifact.");
    ids.add(item.artifactId);
    paths.add(rel);
  }
  return value as BackupManifest;
}

export async function createRuntimeBackup(
  repo: Repo,
  dataDir: string,
  opts: {
    maxBackupBytes?: number;
    interrupt?: () => void;
    expectedRecoveryGeneration?: ManagedRecoveryGeneration;
    requireCompleteArtifacts?: boolean;
  } = {},
) {
  const maxBytes = opts.maxBackupBytes ?? MAX_BACKUP_BYTES,
    keep = backupRetention(repo).keep;
  const recoveryGeneration = ensureManagedRecoveryGeneration(dataDir);
  if (opts.expectedRecoveryGeneration)
    assertManagedRecoveryGeneration(dataDir, opts.expectedRecoveryGeneration);
  const backups = join(dataDir, "backups");
  await mkdir(backups, { recursive: true, mode: 0o700 });
  await mkdir(resolve(dataDir, "artifacts"), { recursive: true, mode: 0o700 });
  const createdAt = Date.now(),
    root = join(
      backups,
      `${BACKUP_PREFIX}${new Date(createdAt).toISOString().replace(/[:.]/g, "-")}-${randomUUID().slice(0, 8)}`,
    ),
    database = join(root, "state.sqlite"),
    artifactRoot = await realpath(resolve(dataDir, "artifacts"));
  await mkdir(root, { recursive: true, mode: 0o700 });
  try {
    await backup(repo.db, database);
    await chmod(database, 0o600);
    const sanitized = new DatabaseSync(database);
    try {
      discardIncompleteDocumentSnapshots(sanitized);
      authenticateProtectedCopy(sanitized, repo.columnCipher);
      if (repo.columnCipher) protectLegacyDocumentCollections(sanitized, repo.columnCipher);
      omitDerivedAndSpaceMemory(sanitized);
      sanitized.prepare("DELETE FROM kv WHERE key='setting:gatewayApiKey'").run();
      const copied = new Repo(sanitized, repo.columnCipher);
      omitMemoryRestoreTransition(copied);
      const legacy = await inspectLegacyArticleHistory(
        copied,
        new TranscriptStore(sanitized, repo.columnCipher),
        {},
        () => {
          opts.interrupt?.();
          assertManagedRecoveryGeneration(dataDir, recoveryGeneration);
        },
      );
      sanitizePortablePageRecall(
        sanitized,
        repo.columnCipher,
        (ids) => protectedRunFamily(new Repo(sanitized, repo.columnCipher), ids),
        (runId, source) => {
          const copied = new Repo(sanitized, repo.columnCipher);
          retireProtectedGeneratedTask(copied, runId, source);
          if (source === "desktop") retireDesktopTranscript(copied, runId);
        },
        () => {
          legacy.check();
          return legacy.runIds;
        },
        (originals) => {
          legacy.check();
          return legacy.dependentRunIds(originals);
        },
      );
      new ConversationBranches(copied).purgeRevoked();
      if (repo.columnCipher && sanitized.prepare("SELECT 1 FROM aux_meta WHERE key='field_codec_v3'").get())
        sanitized
          .prepare(
            "INSERT INTO aux_meta(key,value) VALUES('portable_profile_proof_v3',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
          )
          .run(
            repo.columnCipher.encrypt(
              "aux_meta",
              JSON.stringify(["portable_profile_proof_v3"]),
              "value",
              "aux-portable-profile-v3",
            ),
          );
      sanitized.exec("VACUUM");
    } finally {
      sanitized.close();
    }
    opts.interrupt?.();
    const databaseInfo = await stat(database);
    if (!databaseInfo.isFile()) throw new Error("The runtime database backup is invalid or exceeds 2 GB.");
    if (databaseInfo.size > maxBytes)
      throw new Error("Not enough free space for a complete runtime backup. Free disk space and try again.");
    const schemaVersion = validateDatabase(database);
    const snapshot = new DatabaseSync(database, { readOnly: true });
    let rows: { artifact_id: string; path: string }[];
    try {
      rows = snapshot
        .prepare("SELECT artifact_id,path FROM artifacts WHERE status='complete' ORDER BY created_at")
        .all() as { artifact_id: string; path: string }[];
    } finally {
      snapshot.close();
    }
    if (rows.length > MAX_ARTIFACTS)
      throw new Error(
        `The runtime has more than ${MAX_ARTIFACTS} artifact records; remove old task data before creating a portable backup.`,
      );
    const artifacts: ManifestArtifact[] = [];
    let missingArtifacts = 0,
      totalBytes = databaseInfo.size,
      artifactBytes = 0;
    for (const row of rows) {
      try {
        const source = await realpath(row.path),
          rel = relative(artifactRoot, source);
        if (!rel || rel === ".." || rel.startsWith(`..${sep}`)) throw new Error("outside artifact root");
        const info = await lstat(source);
        if (info.isSymbolicLink() || !info.isFile()) throw new Error("not regular");
        if (artifactBytes + info.size > MAX_ARTIFACT_BYTES)
          throw new Error("Aux artifact backups are limited to 1 GB. Remove old artifacts and try again.");
        if (totalBytes + info.size > maxBytes)
          throw new Error(
            "Not enough free space for a complete runtime backup. Free disk space and try again.",
          );
        const relativePath = safeRelative(rel),
          target = join(root, "artifacts", relativePath);
        await mkdir(dirname(target), { recursive: true, mode: 0o700 });
        await copyFile(source, target);
        await chmod(target, 0o600);
        artifacts.push({
          artifactId: row.artifact_id,
          relativePath,
          bytes: info.size,
          sha256: await digest(target),
        });
        artifactBytes += info.size;
        totalBytes += info.size;
      } catch (error) {
        if (
          error instanceof Error &&
          (error.message.includes("limited to 1 GB") || error.message.includes("Not enough free space"))
        )
          throw error;
        missingArtifacts++;
      }
    }
    if (opts.requireCompleteArtifacts && missingArtifacts)
      throw new Error(
        "A complete current-generation backup could not be issued because evidence files are missing.",
      );
    assertManagedRecoveryGeneration(dataDir, recoveryGeneration);
    const manifest: BackupManifest = {
      formatVersion: 1,
      createdAt,
      schemaVersion,
      database: { bytes: databaseInfo.size, sha256: await digest(database) },
      artifacts,
      missingArtifacts,
      recoveryGeneration,
    };
    await writeFile(join(root, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", {
      encoding: "utf8",
      mode: 0o600,
    });
    assertManagedRecoveryGeneration(dataDir, recoveryGeneration);
    const entries = (await readdir(backups, { withFileTypes: true }))
      .filter((item) => item.isDirectory() && item.name.startsWith(BACKUP_PREFIX))
      .map((item) => item.name)
      .sort()
      .reverse();
    for (const name of entries.slice(keep)) await rm(join(backups, name), { recursive: true, force: true });
    return {
      path: root,
      createdAt,
      bytes: totalBytes,
      schemaVersion,
      sha256: manifest.database.sha256,
      artifactFiles: artifacts.length,
      missingArtifacts,
    };
  } catch (error) {
    await rm(root, { recursive: true, force: true });
    throw error;
  }
}

/** Forget has already committed; issuance failure leaves the generation advanced and restores refused. */
export async function issueFreshManagedBackup(
  repo: Repo,
  dataDir: string,
  generation: ManagedRecoveryGeneration,
) {
  return createRuntimeBackup(repo, dataDir, {
    expectedRecoveryGeneration: generation,
    requireCompleteArtifacts: true,
  });
}

export async function attemptFreshManagedBackup(
  repo: Repo,
  dataDir: string,
  generation: ManagedRecoveryGeneration,
) {
  try {
    await issueFreshManagedBackup(repo, dataDir, generation);
    return true;
  } catch {
    // Forget is irreversible. A failed snapshot must leave the old generation
    // refused, while Settings offers an explicit retry for the current state.
    process.stderr.write(
      "[runtime] fresh managed backup was not issued; review recovery status in Settings.\n",
    );
    return false;
  }
}

/** Exact managed inventory admission; never accepts a caller-selected path. */
export async function stageListedRuntimeRestore(
  dataDir: string,
  name: string,
  expectedSha256: string,
  cipher?: FieldCodec,
  memory?: MemoryPipeline,
) {
  if (memory)
    return memory.ownOrdinaryRestore(dataDir, (signal) =>
      stageListedRuntimeRestoreOwned(dataDir, name, expectedSha256, cipher, memory, signal),
    );
  return stageListedRuntimeRestoreOwned(dataDir, name, expectedSha256, cipher);
}

async function stageListedRuntimeRestoreOwned(
  dataDir: string,
  name: string,
  expectedSha256: string,
  cipher?: FieldCodec,
  memory?: MemoryPipeline,
  signal?: AbortSignal,
) {
  if (!/^aux-runtime-[A-Za-z0-9._-]{1,160}$/.test(name) || !/^[a-f0-9]{64}$/.test(expectedSha256))
    throw new Error("Choose the original managed backup.");
  signal?.throwIfAborted();
  const generation = ensureManagedRecoveryGeneration(dataDir);
  const item = (await listRuntimeBackups(dataDir)).find(
    (value) => value.name === name && value.sha256 === expectedSha256 && value.restorable,
  );
  signal?.throwIfAborted();
  if (!item) throw new Error("This backup changed or is no longer available. Refresh the list.");
  const canonicalRoot = await realpath(item.path);
  const paths = [item.path, join(item.path, "manifest.json"), join(item.path, "state.sqlite")];
  const handles: Awaited<ReturnType<typeof open>>[] = [];
  let primary: unknown,
    failed = false;
  let admitted:
    | (Awaited<ReturnType<typeof stageRuntimeRestoreSource>> & {
        source: { path: string; name: string; sha256: string };
      })
    | undefined;
  try {
    for (const [index, path] of paths.entries())
      handles.push(
        await open(
          path,
          constants.O_RDONLY | constants.O_NOFOLLOW | (index === 0 ? constants.O_DIRECTORY : 0),
        ),
      );
    const identities = await Promise.all(handles.map((handle) => handle.stat()));
    if (
      !identities[0]!.isDirectory() ||
      !identities[1]!.isFile() ||
      identities[1]!.size > 10 * 1024 * 1024 ||
      !identities[2]!.isFile() ||
      identities[2]!.size > MAX_BACKUP_BYTES
    )
      throw new Error("The reviewed backup file inventory is invalid.");
    const originalManifest = await readBoundedManifest(handles[1]!, identities[1]!.size);
    const manifestHash = bytesDigest(originalManifest);
    const current = async () => {
      signal?.throwIfAborted();
      assertManagedRecoveryGeneration(dataDir, generation);
      for (const [index, path] of paths.entries()) {
        const [named, retained] = await Promise.all([lstat(path), handles[index]!.stat()]),
          original = identities[index]!;
        for (const value of [named, retained])
          if (
            value.isSymbolicLink() ||
            value.dev !== original.dev ||
            value.ino !== original.ino ||
            value.mode !== original.mode ||
            value.uid !== original.uid ||
            value.size !== original.size ||
            value.mtimeMs !== original.mtimeMs ||
            value.ctimeMs !== original.ctimeMs
          )
            throw new Error("The reviewed backup changed before staging. Refresh the list.");
      }
      if (
        (await realpath(item.path)) !== canonicalRoot ||
        bytesDigest(await readBoundedManifest(handles[1]!, identities[1]!.size)) !== manifestHash ||
        (await digest(paths[2]!)) !== expectedSha256
      )
        throw new Error("The reviewed backup changed before staging. Refresh the list.");
      assertManagedRecoveryGeneration(dataDir, generation);
    };
    await current();
    const manifest = parseManifest(originalManifest.toString("utf8"));
    if (manifest.database.sha256 !== expectedSha256)
      throw new Error("The reviewed backup changed before staging. Refresh the list.");
    const artifacts = await Promise.all(
      manifest.artifacts.map(async (artifact) => {
        const path = join(item.path, "artifacts", safeRelative(artifact.relativePath));
        const info = await lstat(path),
          resolved = await realpath(path),
          rel = relative(join(canonicalRoot, "artifacts"), resolved);
        if (info.isSymbolicLink() || !info.isFile() || rel === ".." || rel.startsWith(`..${sep}`))
          throw new Error("A reviewed backup artifact is unavailable.");
        return { path, resolved, info };
      }),
    );
    const finalCurrent = async () => {
      await current();
      for (const artifact of artifacts) {
        const info = await lstat(artifact.path);
        if (
          info.isSymbolicLink() ||
          !info.isFile() ||
          (await realpath(artifact.path)) !== artifact.resolved ||
          info.dev !== artifact.info.dev ||
          info.ino !== artifact.info.ino ||
          info.size !== artifact.info.size ||
          info.mtimeMs !== artifact.info.mtimeMs ||
          info.ctimeMs !== artifact.info.ctimeMs ||
          info.mode !== artifact.info.mode ||
          info.uid !== artifact.info.uid
        )
          throw new Error("A reviewed backup artifact changed before staging.");
      }
      await current();
    };
    const result = await stageRuntimeRestoreSource(
      dataDir,
      item.path,
      cipher,
      memory,
      {
        expectedSha256,
        current,
        finalCurrent,
        manifest,
      },
      signal,
    );
    admitted = { ...result, source: { path: item.path, name: item.name, sha256: manifest.database.sha256 } };
  } catch (error) {
    primary = error;
    failed = true;
  }
  const cleanup = await Promise.allSettled(handles.map((handle) => handle.close()));
  const failures = cleanup
    .filter((result): result is PromiseRejectedResult => result.status === "rejected")
    .map((result) => result.reason);
  if (failures.length)
    throw new AggregateError(
      failed ? [primary, ...failures] : failures,
      "The original restore request and source-handle cleanup did not settle.",
    );
  if (failed) throw primary;
  return admitted!;
}

export async function stageRuntimeRestore(
  dataDir: string,
  sourcePath: string,
  cipher?: FieldCodec,
  memory?: MemoryPipeline,
) {
  return stageRuntimeRestoreSource(dataDir, sourcePath, cipher, memory);
}
function commitManagedRestoreDescriptor(
  dataDir: string,
  path: string,
  text: string,
  generation: ManagedRecoveryGeneration,
) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  let descriptor: number | undefined,
    identity: ReturnType<typeof fstatSync> | undefined,
    renamed = false,
    primary: unknown,
    failed = false;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    identity = fstatSync(descriptor);
    writeFileSync(descriptor, text, { encoding: "utf8" });
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    assertManagedRecoveryGeneration(dataDir, generation);
    renameSync(temporary, path);
    renamed = true;
    assertManagedRecoveryGeneration(dataDir, generation);
  } catch (error) {
    primary = error;
    failed = true;
  }
  const cleanup: unknown[] = [];
  if (descriptor !== undefined)
    try {
      closeSync(descriptor);
    } catch (error) {
      cleanup.push(error);
    }
  if (failed && identity) {
    const original = renamed ? path : temporary;
    try {
      const now = lstatSync(original);
      if (now.dev !== identity.dev || now.ino !== identity.ino || !now.isFile() || now.isSymbolicLink())
        throw new Error("The original pending restore descriptor changed; cleanup is retained.");
      unlinkSync(original);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") cleanup.push(error);
    }
  }
  if (cleanup.length)
    throw new AggregateError(
      [primary, ...cleanup],
      "The original restore publication and descriptor cleanup did not settle.",
    );
  if (failed) throw primary;
}
async function stageRuntimeRestoreSource(
  dataDir: string,
  sourcePath: string,
  cipher?: FieldCodec,
  memory?: MemoryPipeline,
  managed?: {
    expectedSha256: string;
    current(): Promise<void>;
    finalCurrent(): Promise<void>;
    manifest: BackupManifest;
  },
  signal?: AbortSignal,
): Promise<{
  staged: true;
  schemaVersion: number;
  bytes: number;
  sha256: string;
  artifactFiles: number;
  missingArtifacts: number;
}> {
  if (memory && !signal) {
    return memory.ownOrdinaryRestore(dataDir, (signal) =>
      stageRuntimeRestoreSource(dataDir, sourcePath, cipher, memory, managed, signal),
    );
  }
  const check = () => signal?.throwIfAborted();
  const current = async () => {
    check();
    await managed?.current();
    check();
  };
  const finalCurrent = async () => {
    check();
    await managed?.finalCurrent();
    check();
  };
  await current();
  if (memory) await clearPendingRestoreFiles(dataDir);
  check();
  const root = await realpath(sourcePath),
    rootInfo = await lstat(root);
  if (rootInfo.isSymbolicLink() || !rootInfo.isDirectory())
    throw new Error("Choose an Aux runtime backup folder.");
  const manifest = managed?.manifest ?? (await readManifest(root)),
    sourceDatabase = await realpath(join(root, "state.sqlite"));
  ensureManagedRecoveryGeneration(dataDir);
  assertManagedRecoveryGeneration(dataDir, manifest.recoveryGeneration);
  const preservedMemory = memory ? await memory.ordinaryRestoreMemory() : undefined;
  const memorySourceDigest = preservedMemory ? spaceMemoryDigest(preservedMemory) : undefined;
  if (!memory && existsSync(resolveDatabasePath(dataDir))) {
    const current = new DatabaseSync(resolveDatabasePath(dataDir), { readOnly: true });
    try {
      if (
        current.prepare("SELECT 1 FROM memory_files UNION SELECT 1 FROM memory_history LIMIT 1").get() ||
        (desktopTablesForDatabase(current).length &&
          current.prepare("SELECT 1 FROM desktop_context_captures LIMIT 1").get())
      )
        throw new Error("Authenticate current Space memory before staging this restore.");
    } finally {
      current.close();
    }
  }
  const databaseRel = relative(root, sourceDatabase);
  if (databaseRel === ".." || databaseRel.startsWith(`..${sep}`))
    throw new Error("The backup database escapes its folder.");
  const databaseInfo = await lstat(sourceDatabase);
  if (
    databaseInfo.isSymbolicLink() ||
    !databaseInfo.isFile() ||
    databaseInfo.size !== manifest.database.bytes ||
    (await digest(sourceDatabase)) !== manifest.database.sha256
  )
    throw new Error("The backup database failed its integrity check.");
  if (managed && manifest.database.sha256 !== managed.expectedSha256)
    throw new Error("The reviewed backup changed before staging. Refresh the list.");
  await current();
  let schemaVersion = validateDatabase(sourceDatabase);
  if (schemaVersion !== manifest.schemaVersion)
    throw new Error("The backup schema does not match its manifest.");

  const pendingDatabase = join(dataDir, "pending-runtime-restore.sqlite");
  const pendingArtifacts = join(dataDir, "pending-runtime-restore-artifacts");
  const temporaryDatabase = `${pendingDatabase}.${randomUUID()}.tmp`;
  const temporaryArtifacts = `${pendingArtifacts}.${randomUUID()}.tmp`;
  await mkdir(temporaryArtifacts, { recursive: true, mode: 0o700 });
  const published: { path: string; dev: number; ino: number }[] = [];
  let memoryTransition: { operationId: string; check(): void } | undefined;
  try {
    await current();
    await copyFile(sourceDatabase, temporaryDatabase);
    if (managed && (await digest(temporaryDatabase)) !== managed.expectedSha256)
      throw new Error("The reviewed database changed while copying.");
    await current();
    await chmod(temporaryDatabase, 0o600);
    const needsDesktopMigration = Boolean(
      preservedMemory &&
      (preservedMemory.desktop.generations.length ||
        preservedMemory.desktop.captures.length ||
        preservedMemory.desktop.retired.length),
    );
    const staged = needsDesktopMigration ? openDb(temporaryDatabase) : new DatabaseSync(temporaryDatabase);
    let omittedArtifacts: Set<string>;
    let artifactRows: Map<string, { pageId: string | null; mediaType: string; path: string }>;
    try {
      discardIncompleteDocumentSnapshots(staged);
      authenticateProtectedCopy(staged, cipher);
      if (preservedMemory) retainSpaceMemory(staged, preservedMemory);
      else omitDerivedAndSpaceMemory(staged);
      staged.prepare("DELETE FROM kv WHERE key='setting:gatewayApiKey'").run();
      const copied = new Repo(staged, cipher);
      omitMemoryRestoreTransition(copied);
      const copiedSources = memory ? await memoryRestoreSources(copied, check) : undefined;
      const legacy = await inspectLegacyArticleHistory(copied, new TranscriptStore(staged, cipher), {}, () =>
        assertManagedRecoveryGeneration(dataDir, manifest.recoveryGeneration),
      );
      copiedSources?.check();
      omittedArtifacts = sanitizePortablePageRecall(
        staged,
        cipher,
        (ids) => protectedRunFamily(new Repo(staged, cipher), ids),
        (runId, source) => {
          const copied = new Repo(staged, cipher);
          retireProtectedGeneratedTask(copied, runId, source);
          if (source === "desktop") retireDesktopTranscript(copied, runId);
        },
        () => {
          legacy.check();
          return legacy.runIds;
        },
        (originals) => {
          legacy.check();
          return legacy.dependentRunIds(originals);
        },
      );
      new ConversationBranches(copied).purgeRevoked();
      if (memory && signal && copiedSources && memorySourceDigest)
        memoryTransition = await memory.prepareOrdinaryRestoreCopy(
          copied,
          dataDir,
          temporaryDatabase,
          temporaryArtifacts,
          memorySourceDigest,
          copiedSources,
          signal,
        );
      check();
      const rows = staged
        .prepare(
          "SELECT artifact_id AS artifactId,page_id AS pageId,media_type AS mediaType,path FROM artifacts",
        )
        .all() as { artifactId: string; pageId: string | null; mediaType: string; path: string }[];
      artifactRows = new Map(rows.map((row) => [row.artifactId, row]));
    } finally {
      staged.close();
    }

    schemaVersion = validateDatabase(temporaryDatabase);
    const portableArtifacts = manifest.artifacts.filter((item) => !omittedArtifacts.has(item.artifactId));
    const stagedArtifacts: ManifestArtifact[] = [];
    const stagedPaths = new Set<string>();
    let artifactBytes = 0;
    for (const item of portableArtifacts) {
      check();
      memoryTransition?.check();
      const rel = safeRelative(item.relativePath);
      const metadata = artifactRows.get(item.artifactId);
      if (!metadata) throw new Error(`Backup artifact ${item.artifactId} has no database record.`);
      const sourcePath = join(root, "artifacts", rel);
      const linkInfo = await lstat(sourcePath);
      if (linkInfo.isSymbolicLink())
        throw new Error(`Backup artifact ${item.artifactId} is a symbolic link.`);
      const source = await realpath(sourcePath),
        sourceRel = relative(join(root, "artifacts"), source);
      if (sourceRel === ".." || sourceRel.startsWith(`..${sep}`))
        throw new Error("A backup artifact escapes its folder.");
      const info = await lstat(source);
      if (!info.isFile() || info.size !== item.bytes || (await digest(source)) !== item.sha256)
        throw new Error(`Backup artifact ${item.artifactId} failed its integrity check.`);
      const evidencePath = /-observation-r\d+\.json$/.test(metadata.path) ? metadata.path : rel;
      const candidate =
        metadata.mediaType === "application/json" && /-observation-r\d+\.json$/.test(evidencePath);
      if (candidate && info.size > 4 * 1024 * 1024)
        throw new Error("An observation artifact is too large to minimize.");
      const original = candidate ? await readFile(source) : undefined;
      const minimized = original
        ? minimizedObservationArtifactBytes({ ...metadata, path: evidencePath }, original)
        : undefined;
      const transformed = !!minimized && !!original && !minimized.equals(original);
      const bytes = minimized?.length ?? info.size;
      artifactBytes += bytes;
      if (artifactBytes > MAX_ARTIFACT_BYTES) throw new Error("Aux artifact restores are limited to 1 GB.");
      const stagedDigest = minimized ? bytesDigest(minimized) : item.sha256;
      let targetRel = rel;
      const current = join(dataDir, "artifacts", rel);
      try {
        const currentInfo = await lstat(current);
        if (currentInfo.isSymbolicLink() || !currentInfo.isFile())
          throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
        const currentDigest = await digest(current);
        if (currentInfo.size !== bytes || currentDigest !== stagedDigest) {
          if (!transformed || currentInfo.size !== item.bytes || currentDigest !== item.sha256)
            throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
          // Preserve the current profile's file for its recovery snapshot.
          targetRel = safeRelative(join(dirname(rel), `${item.artifactId}-minimized-observation.json`));
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      const targetCurrent = join(dataDir, "artifacts", targetRel);
      try {
        const existing = await lstat(targetCurrent);
        if (
          existing.isSymbolicLink() ||
          !existing.isFile() ||
          existing.size !== bytes ||
          (await digest(targetCurrent)) !== stagedDigest
        )
          throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
      if (stagedPaths.has(targetRel))
        throw new Error("The backup maps multiple artifacts to one restored file.");
      stagedPaths.add(targetRel);
      const target = join(temporaryArtifacts, targetRel);
      await mkdir(dirname(target), { recursive: true, mode: 0o700 });
      if (minimized) await writeFile(target, minimized, { mode: 0o600 });
      else await copyFile(source, target);
      await chmod(target, 0o600);
      if (managed && (await digest(target)) !== stagedDigest)
        throw new Error("A reviewed backup artifact changed while copying.");
      const stagedItem: ManifestArtifact = {
        artifactId: item.artifactId,
        relativePath: targetRel,
        bytes,
        sha256: await digest(target),
      };
      stagedArtifacts.push(stagedItem);
    }

    const prepared = new DatabaseSync(temporaryDatabase);
    try {
      const included = new Set(stagedArtifacts.map((item) => item.artifactId));
      const update = prepared.prepare(
        "UPDATE artifacts SET path=?,size=?,status='complete' WHERE artifact_id=?",
      );
      const missing = prepared.prepare("UPDATE artifacts SET path=?,status='failed' WHERE artifact_id=?");
      for (const item of stagedArtifacts)
        update.run(join(dataDir, "artifacts", item.relativePath), item.bytes, item.artifactId);
      for (const row of prepared.prepare("SELECT artifact_id FROM artifacts").all() as {
        artifact_id: string;
      }[])
        if (!included.has(row.artifact_id))
          missing.run(join(dataDir, "artifacts", "missing", row.artifact_id), row.artifact_id);
      prepared.exec("VACUUM");
    } finally {
      prepared.close();
    }
    const stagedInfo = await stat(temporaryDatabase),
      sha256 = await digest(temporaryDatabase),
      artifactInfo = managed ? await stat(temporaryArtifacts) : undefined;
    await finalCurrent();
    await rm(pendingArtifacts, { recursive: true, force: true });
    await rename(temporaryArtifacts, pendingArtifacts);
    if (managed) {
      published.push({ path: pendingArtifacts, dev: artifactInfo!.dev, ino: artifactInfo!.ino });
      await finalCurrent();
    }
    if (memory && memory.currentStateDigest() !== memorySourceDigest)
      throw new Error("Space memory changed while restore was staged. Prepare the restore again.");
    check();
    memoryTransition?.check();
    await rename(temporaryDatabase, pendingDatabase);
    check();
    memoryTransition?.check();
    if (managed) published.push({ path: pendingDatabase, dev: stagedInfo.dev, ino: stagedInfo.ino });
    const recoveryGeneration = assertManagedRecoveryGeneration(dataDir, manifest.recoveryGeneration);
    const descriptor =
      JSON.stringify(
        {
          version: 2,
          createdAt: Date.now(),
          schemaVersion,
          bytes: stagedInfo.size,
          sha256,
          artifactFiles: stagedArtifacts,
          recoveryGeneration,
          memorySourceDigest,
          memoryTransitionId: memoryTransition?.operationId,
          memoryPhase: memoryTransition ? "ready" : undefined,
        },
        null,
        2,
      ) + "\n";
    if (managed) {
      await finalCurrent();
      for (const original of published) {
        const now = lstatSync(original.path);
        if (now.dev !== original.dev || now.ino !== original.ino || now.isSymbolicLink())
          throw new Error("The original staged restore files changed before publication.");
      }
      commitManagedRestoreDescriptor(
        dataDir,
        join(dataDir, "pending-runtime-restore.json"),
        descriptor,
        recoveryGeneration,
      );
    } else
      await writeFile(join(dataDir, "pending-runtime-restore.json"), descriptor, {
        encoding: "utf8",
        mode: 0o600,
      });
    check();
    memoryTransition?.check();
    return {
      staged: true as const,
      schemaVersion,
      bytes: stagedInfo.size + artifactBytes,
      sha256,
      artifactFiles: stagedArtifacts.length,
      missingArtifacts: manifest.missingArtifacts,
    };
  } catch (error) {
    // Keys are retired before their only exact cleanup journal or files disappear.
    if (memory) {
      try {
        await memory.cleanupOrdinaryRestore(dataDir);
      } catch (cleanup) {
        throw new AggregateError(
          [error, cleanup],
          "Original restore and detached-factor cleanup did not settle.",
        );
      }
    }
    const cleanup = await Promise.allSettled([
      rm(temporaryDatabase, { force: true }),
      rm(temporaryArtifacts, { recursive: true, force: true }),
    ]);
    const failures = cleanup
      .filter((value): value is PromiseRejectedResult => value.status === "rejected")
      .map((value) => value.reason);
    if (published.length || failures.length) {
      const retained = new AggregateError(
        [error, ...failures],
        `${error instanceof Error ? error.message : "Restore failed."} Original published staged files remain cleanup debt.`,
      );
      Object.assign(retained, { cleanupDebt: published });
      throw retained;
    }
    throw error;
  }
}

export async function cancelRuntimeRestore(dataDir: string, memory?: MemoryPipeline) {
  if (memory) await memory.cancelOrdinaryRestore(dataDir);
  else {
    const path = resolveDatabasePath(dataDir);
    if (existsSync(path)) {
      const db = new DatabaseSync(path, { readOnly: true });
      try {
        if (db.prepare("SELECT 1 FROM aux_meta WHERE key='space_memory_restore_v1'").get())
          throw new Error("Authenticate original Space memory before cancelling its staged factors.");
      } finally {
        db.close();
      }
    }
  }
  return clearPendingRestoreFiles(dataDir);
}

async function clearPendingRestoreFiles(dataDir: string) {
  await Promise.all([
    rm(join(dataDir, "pending-runtime-restore.sqlite"), { force: true }),
    rm(join(dataDir, "pending-runtime-restore-artifacts"), { recursive: true, force: true }),
    rm(join(dataDir, "pending-runtime-restore.json"), { force: true }),
  ]);
  return { cancelled: true as const };
}

type PendingRestore = {
  version: 2;
  createdAt: number;
  schemaVersion: number;
  bytes: number;
  sha256: string;
  artifactFiles: ManifestArtifact[];
  recoveryGeneration?: ManagedRecoveryGeneration;
  recoveryPackage?: boolean;
  recoveryProfileId?: string;
  memorySourceDigest?: string;
  memoryTransitionId?: string;
  memoryPhase?: "ready";
};

export async function runtimeRestoreStatus(dataDir: string) {
  let lastAppliedAt: number | undefined;
  try {
    const value = JSON.parse(await readFile(join(dataDir, "runtime-restore-status.json"), "utf8")) as {
      lastAppliedAt?: unknown;
    };
    if (typeof value.lastAppliedAt === "number" && Number.isFinite(value.lastAppliedAt))
      lastAppliedAt = value.lastAppliedAt;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  const generation = ensureManagedRecoveryGeneration(dataDir);
  const backups = await listRuntimeBackups(dataDir);
  assertManagedRecoveryGeneration(dataDir, generation);
  return {
    pending: existsSync(join(dataDir, "pending-runtime-restore.json")),
    ...(lastAppliedAt ? { lastAppliedAt } : {}),
    managedRecovery: {
      generation: generation.generation,
      freshBackupIssued: backups.some((item) => item.restorable && item.missingArtifacts === 0),
    },
  };
}

function hasOriginalMemoryTransition(dbPath: string) {
  if (!existsSync(dbPath)) return false;
  const db = new DatabaseSync(dbPath, { readOnly: true });
  try {
    return !!db.prepare("SELECT 1 FROM aux_meta WHERE key='space_memory_restore_v1'").get();
  } finally {
    db.close();
  }
}

/** Apply a user-staged restore before opening the runtime's active database. */
export async function applyPendingRuntimeRestore(dataDir: string, dbPath: string, profileId?: string) {
  const metadataPath = join(dataDir, "pending-runtime-restore.json");
  if (!existsSync(metadataPath)) return { applied: false as const };
  // A separate SQLite database provides a cross-process startup lock, released
  // by the OS on crash. Never swap a database while another runtime owns it.
  const lockPath = join(dataDir, "runtime-restore-lock.sqlite");
  const lock = new DatabaseSync(lockPath);
  let operationId: string | undefined;
  let authenticatedStartupMayClean = false;
  try {
    await chmod(lockPath, 0o600);
    lock.exec("PRAGMA busy_timeout=5000; BEGIN EXCLUSIVE");
    if (!existsSync(metadataPath)) return { applied: false as const };
    const descriptorPath = join(dataDir, "runtime.json");
    try {
      const descriptor = JSON.parse(await readFile(descriptorPath, "utf8")) as { pid?: unknown };
      if (Number.isInteger(descriptor.pid) && Number(descriptor.pid) > 0) {
        try {
          process.kill(Number(descriptor.pid), 0);
          throw new Error("Quit the running Aux runtime before applying a staged restore.");
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ESRCH") throw error;
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    authenticatedStartupMayClean = true;
    const metadata = JSON.parse(await readFile(metadataPath, "utf8")) as Partial<PendingRestore>;
    if (
      metadata.version !== 2 ||
      !Number.isInteger(metadata.createdAt) ||
      !Number.isInteger(metadata.schemaVersion) ||
      !Number.isInteger(metadata.bytes) ||
      typeof metadata.sha256 !== "string" ||
      !/^[a-f0-9]{64}$/.test(metadata.sha256) ||
      !Array.isArray(metadata.artifactFiles) ||
      metadata.artifactFiles.length > MAX_ARTIFACTS
    )
      throw new Error("The staged runtime restore metadata is invalid.");
    if (
      typeof metadata.memoryTransitionId === "string" &&
      /^[a-f0-9-]{36}$/.test(metadata.memoryTransitionId)
    )
      operationId = metadata.memoryTransitionId;
    if (
      metadata.memoryTransitionId &&
      (metadata.memoryPhase !== "ready" || !/^[a-f0-9-]{36}$/.test(metadata.memoryTransitionId))
    )
      throw new Error("Detached Space memory restore is not ready.");
    if (metadata.recoveryPackage) {
      if (!profileId || metadata.recoveryProfileId !== profileId)
        throw new Error("The staged recovery Profile or Space-memory inventory is invalid.");
      if (existsSync(dbPath) && (await digest(dbPath)) !== metadata.sha256) {
        const current = new DatabaseSync(dbPath, { readOnly: true });
        try {
          for (const table of ["workspaces", "runs", "artifacts", "content_memory"])
            if (current.prepare(`SELECT 1 FROM ${table} LIMIT 1`).get())
              throw new Error("The recovery destination is no longer empty.");
        } finally {
          current.close();
        }
      }
    } else {
      try {
        assertManagedRecoveryGeneration(dataDir, metadata.recoveryGeneration);
      } catch (error) {
        if (metadata.memoryTransitionId && hasOriginalMemoryTransition(dbPath))
          return { applied: false as const, cleanupRequired: true as const, operationId };
        throw error;
      }
    }
    const pendingDatabase = join(dataDir, "pending-runtime-restore.sqlite");
    const dbInfo = await lstat(pendingDatabase);
    if (
      dbInfo.isSymbolicLink() ||
      !dbInfo.isFile() ||
      dbInfo.size !== metadata.bytes ||
      (await digest(pendingDatabase)) !== metadata.sha256 ||
      validateDatabase(pendingDatabase) !== metadata.schemaVersion
    )
      throw new Error("The staged runtime database failed validation.");
    const alreadySwapped = existsSync(dbPath) && (await digest(dbPath)) === metadata.sha256;
    if (!alreadySwapped && !metadata.recoveryPackage && metadata.memorySourceDigest) {
      const current = new DatabaseSync(dbPath, { readOnly: true });
      try {
        if (spaceMemoryDigest(currentSpaceMemory(current)) !== metadata.memorySourceDigest) {
          if (metadata.memoryTransitionId && hasOriginalMemoryTransition(dbPath))
            return { applied: false as const, cleanupRequired: true as const, operationId };
          throw new Error("Space memory changed after restore was staged. Prepare the restore again.");
        }
      } finally {
        current.close();
      }
    }
    const stagedRoot = join(dataDir, "pending-runtime-restore-artifacts");
    const artifactRoot = join(dataDir, "artifacts");
    await mkdir(artifactRoot, { recursive: true, mode: 0o700 });
    const stagedRootInfo = await lstat(stagedRoot);
    if (stagedRootInfo.isSymbolicLink() || !stagedRootInfo.isDirectory())
      throw new Error("The staged artifact folder is invalid.");
    if ((await lstat(artifactRoot)).isSymbolicLink())
      throw new Error("The Aux artifact folder is a symbolic link.");
    const resolvedStagedRoot = await realpath(stagedRoot),
      resolvedArtifactRoot = await realpath(artifactRoot);
    const ids = new Set<string>(),
      paths = new Set<string>();
    for (const item of metadata.artifactFiles) {
      if (
        !item ||
        typeof item.artifactId !== "string" ||
        !/^[A-Za-z0-9_-]{1,128}$/.test(item.artifactId) ||
        !Number.isInteger(item.bytes) ||
        item.bytes < 0 ||
        typeof item.sha256 !== "string" ||
        !/^[a-f0-9]{64}$/.test(item.sha256)
      )
        throw new Error("The staged restore has invalid artifact metadata.");
      const rel = safeRelative(item.relativePath);
      if (ids.has(item.artifactId) || paths.has(rel))
        throw new Error("The staged restore repeats an artifact.");
      ids.add(item.artifactId);
      paths.add(rel);
      const source = join(stagedRoot, rel),
        sourceInfo = await lstat(source),
        resolved = await realpath(source);
      if (
        sourceInfo.isSymbolicLink() ||
        relative(resolvedStagedRoot, resolved).startsWith("..") ||
        !sourceInfo.isFile() ||
        sourceInfo.size !== item.bytes ||
        (await digest(source)) !== item.sha256
      )
        throw new Error(`Staged artifact ${item.artifactId} failed validation.`);
      const target = join(artifactRoot, rel);
      await mkdir(dirname(target), { recursive: true, mode: 0o700 });
      const parent = await realpath(dirname(target));
      if (relative(resolvedArtifactRoot, parent).startsWith(".."))
        throw new Error("An artifact destination escapes Aux storage.");
      try {
        const current = await lstat(target);
        if (
          current.isSymbolicLink() ||
          !current.isFile() ||
          current.size !== item.bytes ||
          (await digest(target)) !== item.sha256
        )
          throw new Error(`Artifact ${item.artifactId} conflicts with existing Aux data.`);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      }
    }
    // A crash after the atomic database swap can leave the pending marker.
    // All artifacts must still be present before that marker is retired.
    if (alreadySwapped) {
      for (const item of metadata.artifactFiles)
        if (!existsSync(join(artifactRoot, safeRelative(item.relativePath))))
          throw new Error(`Restored artifact ${item.artifactId} is missing.`);
      await finishRestore(dataDir, Date.now());
      return { applied: true as const, recovered: true as const };
    }
    const recoveryRoot = join(
      dataDir,
      "recovery",
      `runtime-${new Date().toISOString().replace(/[:.]/g, "-")}-${randomUUID()}`,
    );
    await mkdir(recoveryRoot, { recursive: true, mode: 0o700 });
    if (existsSync(dbPath)) {
      const previous = new DatabaseSync(dbPath);
      try {
        await backup(previous, join(recoveryRoot, "state.sqlite"));
      } finally {
        previous.close();
      }
      const recoveryCopy = new DatabaseSync(join(recoveryRoot, "state.sqlite"));
      try {
        omitDerivedAndSpaceMemory(recoveryCopy);
        recoveryCopy.exec("VACUUM");
      } finally {
        recoveryCopy.close();
      }
      await chmod(join(recoveryRoot, "state.sqlite"), 0o600);
    }
    for (const item of metadata.artifactFiles) {
      const target = join(artifactRoot, safeRelative(item.relativePath));
      if (existsSync(target)) continue;
      const temporary = `${target}.${randomUUID()}.tmp`;
      try {
        await copyFile(join(stagedRoot, item.relativePath), temporary);
        await chmod(temporary, 0o600);
        if ((await digest(temporary)) !== item.sha256)
          throw new Error(`Artifact ${item.artifactId} changed during restore.`);
        await rename(temporary, target);
      } finally {
        await rm(temporary, { force: true });
      }
    }
    const temporaryDatabase = `${dbPath}.${randomUUID()}.restore`;
    try {
      await copyFile(pendingDatabase, temporaryDatabase);
      await chmod(temporaryDatabase, 0o600);
      if ((await digest(temporaryDatabase)) !== metadata.sha256)
        throw new Error("The staged database changed during restore.");
      await Promise.all([rm(`${dbPath}-wal`, { force: true }), rm(`${dbPath}-shm`, { force: true })]);
      const stagedFd = openSync(temporaryDatabase, constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        fsyncSync(stagedFd);
      } finally {
        closeSync(stagedFd);
      }
      await rename(temporaryDatabase, dbPath);
      const directoryFd = openSync(dirname(dbPath), constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        fsyncSync(directoryFd);
      } finally {
        closeSync(directoryFd);
      }
    } finally {
      await rm(temporaryDatabase, { force: true });
    }
    await finishRestore(dataDir, Date.now());
    return { applied: true as const, recoveryPath: recoveryRoot };
  } catch (error) {
    // Only the authenticated native owner may interpret this metadata and settle abandoned/applied keys.
    if (authenticatedStartupMayClean && hasOriginalMemoryTransition(dbPath))
      return { applied: false as const, cleanupRequired: true as const, operationId };
    throw error;
  } finally {
    try {
      lock.exec("ROLLBACK");
    } catch {
      /* No transaction after a failed BEGIN. */
    }
    lock.close();
  }
}

async function finishRestore(dataDir: string, lastAppliedAt: number) {
  const status = join(dataDir, "runtime-restore-status.json");
  await writeFile(status, JSON.stringify({ lastAppliedAt }) + "\n", { mode: 0o600 });
  await clearPendingRestoreFiles(dataDir);
}
