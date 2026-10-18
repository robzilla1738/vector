import { currentSpaceMemory, spaceMemoryDigest } from "./space-memory-backup.js";
import { assertManagedRecoveryGeneration } from "./managed-recovery-generation.js";
import { DatabaseSync } from "node:sqlite";
import { resolveDatabasePath } from "@aux/contracts/installation";
import { z } from "zod";
import { randomUUID } from "node:crypto";
import { existsSync, lstatSync, openSync, closeSync, fsyncSync, constants, realpathSync } from "node:fs";
import { readFile, rm } from "node:fs/promises";
import { join, dirname } from "node:path";
import { digest } from "@aux/contracts/util/digest";
import type { Repo } from "../store/repo.js";
import type { NativeBridge } from "../native.js";
import {
  SpaceMemoryStore,
  type PreparedMemoryGeneration,
  type MemoryGeneration,
  type MemoryRevision,
} from "./space-memory-store.js";

const KEY = "space_memory_restore_v1";
const generation = z
  .object({ generation: z.string().regex(/^g-[a-f0-9-]{36}$/), keyName: z.string().min(1).max(128) })
  .strict();
const identity = z
  .object({
    name: z.string().regex(/^pending-runtime-restore(?:\.sqlite|-artifacts)(?:\.[a-f0-9-]{36}\.tmp)?$/),
    dev: z.number(),
    ino: z.number(),
  })
  .strict();
const transition = z
  .object({
    version: z.literal(1),
    operationId: z.string().uuid(),
    profileId: z.string().min(1).max(512),
    role: z.enum(["source", "destination"]),
    phase: z.enum(["preparing", "ready"]),
    sourceDigest: z.string().regex(/^[a-f0-9]{64}$/),
    proofDigest: z.string().regex(/^[a-f0-9]{64}$/),
    database: identity,
    artifacts: identity,
    spaces: z
      .array(
        z
          .object({
            workspaceId: z.string().min(1).max(200),
            prior: generation,
            next: generation,
            rowsDigest: z.string().regex(/^[a-f0-9]{64}$/),
            logicalDigest: z.string().regex(/^[a-f0-9]{64}$/),
            retired: z.boolean(),
          })
          .strict(),
      )
      .max(4096),
  })
  .strict();
export type SpaceMemoryRestoreTransition = z.infer<typeof transition>;
type Secrets = Pick<NativeBridge, "storeSecret" | "readSecret">;

export function memoryRestoreTransition(repo: Repo): SpaceMemoryRestoreTransition | undefined {
  const row = repo.db
    .prepare(
      "SELECT CASE WHEN length(CAST(value AS BLOB))<=8388608 THEN value END AS value FROM aux_meta WHERE key=?",
    )
    .get(KEY) as { value: string | null } | undefined;
  if (!row) return;
  if (!row.value) throw new Error("Space memory restore metadata exceeds its ownership budget.");
  if (!repo.columnCipher) throw new Error("Space memory restore requires original protected storage.");
  return transition.parse(
    JSON.parse(repo.columnCipher.decrypt("aux_meta", JSON.stringify([KEY]), "value", row.value)),
  );
}
function commitMetadata(repo: Repo, work: () => void) {
  if (repo.db.isTransaction)
    throw new Error("Space memory restore ownership requires an independent durable commit.");
  const prior = (repo.db.prepare("PRAGMA synchronous").get() as { synchronous: number }).synchronous;
  repo.db.exec("PRAGMA synchronous=FULL");
  try {
    repo.db.exec("BEGIN IMMEDIATE");
    try {
      work();
      repo.db.exec("COMMIT");
    } catch (error) {
      if (repo.db.isTransaction) repo.db.exec("ROLLBACK");
      throw error;
    }
  } finally {
    repo.db.exec(`PRAGMA synchronous=${prior}`);
  }
}

function save(repo: Repo, value: SpaceMemoryRestoreTransition) {
  if (!repo.columnCipher) throw new Error("Space memory restore requires original protected storage.");
  const encoded = repo.columnCipher.encrypt(
    "aux_meta",
    JSON.stringify([KEY]),
    "value",
    JSON.stringify(transition.parse(value)),
  );
  commitMetadata(repo, () =>
    repo.db.prepare("INSERT OR REPLACE INTO aux_meta(key,value) VALUES(?,?)").run(KEY, encoded),
  );
}
export function omitMemoryRestoreTransition(repo: Repo) {
  repo.db.prepare("DELETE FROM aux_meta WHERE key=?").run(KEY);
}
function rowsDigest(repo: Repo, workspaceId: string) {
  return digest(
    JSON.stringify([
      repo.db
        .prepare(
          "SELECT name,generation,key_name,content FROM memory_files WHERE workspace_id=? ORDER BY name",
        )
        .all(workspaceId),
      repo.db
        .prepare(
          "SELECT revision_id,captured_at,generation,key_name,content FROM memory_history WHERE workspace_id=? ORDER BY revision_id",
        )
        .all(workspaceId),
    ]),
  );
}
export function preparedMemoryDigest(prepared: PreparedMemoryGeneration) {
  return digest(
    JSON.stringify([
      [...prepared.files].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0)),
      [...prepared.history].sort((a, b) =>
        a.revision_id < b.revision_id ? -1 : a.revision_id > b.revision_id ? 1 : 0,
      ),
    ]),
  );
}

export function memoryLogicalDigest(files: Map<string, string>, history: MemoryRevision[]) {
  return digest(
    JSON.stringify([
      [...files]
        .filter(([name]) => name !== "history.json.enc")
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
      history,
    ]),
  );
}

/** Metadata only. Source bodies stay under disposable per-Space generation keys. */
export class SpaceMemoryRestore {
  private store: SpaceMemoryStore;
  constructor(
    private repo: Repo,
    private secrets: Secrets,
    private profileId: string,
    private dataDir: string,
  ) {
    this.store = new SpaceMemoryStore(repo, secrets, profileId);
  }
  begin(sourceDigest: string, proofDigest: string, database: string, artifacts: string) {
    if (memoryRestoreTransition(this.repo))
      throw new Error("Retire the original staged Space memory before preparing another restore.");
    const file = (name: string) => {
      const stat = lstatSync(join(this.dataDir, name));
      if (stat.isSymbolicLink()) throw new Error("The original restore path is a symbolic link.");
      return { name, dev: stat.dev, ino: stat.ino };
    };
    const value: SpaceMemoryRestoreTransition = {
      version: 1,
      operationId: randomUUID(),
      profileId: this.profileId,
      role: "source",
      phase: "preparing",
      sourceDigest,
      proofDigest,
      database: file(database),
      artifacts: file(artifacts),
      spaces: [],
    };
    save(this.repo, value);
    return value.operationId;
  }
  private source(operationId: string) {
    const value = memoryRestoreTransition(this.repo);
    if (
      !value ||
      value.operationId !== operationId ||
      value.role !== "source" ||
      value.profileId !== this.profileId
    )
      throw new Error("The original Space memory restore owner changed.");
    for (const item of value.spaces)
      for (const name of [item.prior, item.next])
        if (name.keyName !== this.store.keyName(item.workspaceId, name.generation))
          throw new Error("Space memory restore key ownership changed.");
    return value;
  }
  checkFiles(operationId: string) {
    const value = this.source(operationId);
    for (const item of [value.database, value.artifacts]) {
      const canonical = item.name.includes("-artifacts")
        ? "pending-runtime-restore-artifacts"
        : "pending-runtime-restore.sqlite";
      const present = [item.name, canonical].filter((name) => existsSync(join(this.dataDir, name)));
      if (!present.length) throw new Error("Original restore preparation files are missing.");
      for (const name of present) {
        const stat = lstatSync(join(this.dataDir, name));
        if (stat.isSymbolicLink() || stat.dev !== item.dev || stat.ino !== item.ino)
          throw new Error("Original restore preparation file identity changed.");
      }
    }
  }

  plan(
    operationId: string,
    prepared: PreparedMemoryGeneration,
    prior: MemoryGeneration,
    logicalDigest: string,
  ) {
    const value = this.source(operationId);
    if (value.phase !== "preparing" || value.spaces.some((item) => item.workspaceId === prepared.workspaceId))
      throw new Error("The original detached Space memory plan changed.");
    const { generation, keyName } = prepared;
    value.spaces.push({
      workspaceId: prepared.workspaceId,
      prior,
      next: { generation, keyName },
      rowsDigest: preparedMemoryDigest(prepared),
      logicalDigest,
      retired: false,
    });
    save(this.repo, value);
  }
  ready(operationId: string, destination: Repo) {
    const value = this.source(operationId);
    for (const item of value.spaces)
      if (rowsDigest(destination, item.workspaceId) !== item.rowsDigest)
        throw new Error("The detached Space memory rows changed before readiness.");
    save(destination, { ...value, role: "destination", phase: "ready" });
    save(this.repo, { ...value, phase: "ready" });
  }
  private assertNotActive(keyName: string) {
    const check = (db: import("node:sqlite").DatabaseSync) => {
      if (
        db
          .prepare(
            "SELECT 1 FROM memory_files WHERE key_name=? UNION SELECT 1 FROM memory_history WHERE key_name=? LIMIT 1",
          )
          .get(keyName, keyName)
      )
        throw new Error("An active Space memory factor cannot be cancelled.");
    };
    check(this.repo.db);
    const path = resolveDatabasePath(this.dataDir);
    if (existsSync(path)) {
      const active = new DatabaseSync(path, { readOnly: true });
      try {
        check(active);
      } finally {
        active.close();
      }
    }
  }

  async cancel() {
    const value = memoryRestoreTransition(this.repo);
    if (!value) return;
    this.source(value.operationId);
    for (const item of value.spaces) {
      this.assertNotActive(item.next.keyName);
      await this.secrets.storeSecret(item.next.keyName, "");
      if ((await this.secrets.readSecret(item.next.keyName)).value)
        throw new Error(
          "Detached Space memory cleanup is unconfirmed; original cleanup ownership is retained.",
        );
      this.source(value.operationId);
    }
    await this.removeFiles(value);
    this.source(value.operationId);
    omitMemoryRestoreTransition(this.repo);
  }
  private async removeFiles(value: SpaceMemoryRestoreTransition) {
    for (const item of [value.database, value.artifacts]) {
      for (const name of [
        item.name,
        item.name.includes("-artifacts")
          ? "pending-runtime-restore-artifacts"
          : "pending-runtime-restore.sqlite",
      ]) {
        const path = join(this.dataDir, name);
        if (!existsSync(path)) continue;
        const stat = lstatSync(path);
        if (stat.isSymbolicLink() || stat.dev !== item.dev || stat.ino !== item.ino)
          throw new Error("Original staged Space memory files changed; cleanup ownership is retained.");
        await rm(path, { recursive: stat.isDirectory(), force: false });
      }
    }
    const descriptor = join(this.dataDir, "pending-runtime-restore.json");
    if (existsSync(descriptor)) {
      const metadata = JSON.parse(await readFile(descriptor, "utf8")) as { memoryTransitionId?: string };
      if (metadata.memoryTransitionId !== value.operationId)
        throw new Error("Original staged restore descriptor changed; cleanup ownership is retained.");
      await rm(descriptor);
    }
  }

  private durableAppliedDatabase(value: SpaceMemoryRestoreTransition) {
    const row = (this.repo.db.prepare("PRAGMA database_list").all() as { name: string; file: string }[]).find(
      (item) => item.name === "main",
    );
    const actual = resolveDatabasePath(this.dataDir);
    if (!row?.file || realpathSync(row.file) !== realpathSync(actual))
      throw new Error("Applied Space memory must be finalized by its actual active database.");
    save(this.repo, value);
    const checkpoint = this.repo.db.prepare("PRAGMA wal_checkpoint(FULL)").get() as {
      busy: number;
      log: number;
      checkpointed: number;
    };
    if (checkpoint.busy || (checkpoint.log >= 0 && checkpoint.log !== checkpoint.checkpointed))
      throw new Error("Applied Space memory is not durably checkpointed.");
    for (const path of [actual, dirname(actual)]) {
      const fd = openSync(path, constants.O_RDONLY | constants.O_NOFOLLOW);
      try {
        fsyncSync(fd);
      } finally {
        closeSync(fd);
      }
    }
  }

  async startup(deferred?: { operationId?: string }) {
    const value = memoryRestoreTransition(this.repo);
    if (!value) {
      if (deferred) throw new Error("Original deferred Space memory restore owner is missing.");
      return;
    }
    if (deferred && (!deferred.operationId || deferred.operationId !== value.operationId))
      throw new Error("Original deferred Space memory restore operation is unverified.");
    if (value.profileId !== this.profileId) throw new Error("Space memory restore Profile changed.");
    if (value.role === "source") {
      if (deferred) {
        await this.cancel();
        return;
      }
      if (value.phase === "preparing") {
        await this.cancel();
        return;
      }
      const path = join(this.dataDir, "pending-runtime-restore.json");
      if (!existsSync(path)) {
        await this.cancel();
        return;
      }
      const descriptor = JSON.parse(await readFile(path, "utf8")) as { memoryTransitionId?: string };
      if (descriptor.memoryTransitionId !== value.operationId)
        throw new Error("The staged Space memory owner changed.");
      let stale = spaceMemoryDigest(currentSpaceMemory(this.repo.db)) !== value.sourceDigest;
      try {
        assertManagedRecoveryGeneration(
          this.dataDir,
          (descriptor as { recoveryGeneration?: { lineageId: string; generation: number } })
            .recoveryGeneration,
        );
      } catch {
        stale = true;
      }
      if (stale) await this.cancel();
      return;
    }
    if (value.phase !== "ready") throw new Error("Unprepared Space memory cannot become active.");
    const assertApplied = () => {
      if (JSON.stringify(memoryRestoreTransition(this.repo)) !== JSON.stringify(value))
        throw new Error("Applied Space memory restore ownership changed.");
      for (const item of value.spaces)
        if (
          this.store.generation(item.workspaceId)?.generation !== item.next.generation ||
          rowsDigest(this.repo, item.workspaceId) !== item.rowsDigest
        )
          throw new Error("Applied Space memory generation identity changed.");
    };
    // Authenticate every new generation before erasing even the first prior key.
    for (const item of value.spaces) {
      if (
        item.prior.keyName !== this.store.keyName(item.workspaceId, item.prior.generation) ||
        item.next.keyName !== this.store.keyName(item.workspaceId, item.next.generation) ||
        this.store.generation(item.workspaceId)?.generation !== item.next.generation ||
        rowsDigest(this.repo, item.workspaceId) !== item.rowsDigest
      )
        throw new Error("Applied Space memory generation identity changed.");
      const opened = await this.store.read(item.workspaceId);
      assertApplied();
      if (
        opened.prior?.keyName !== item.next.keyName ||
        memoryLogicalDigest(opened.files, opened.history) !== item.logicalDigest
      )
        throw new Error("Applied Space memory is not authenticated.");
    }
    assertApplied();
    this.durableAppliedDatabase(value);
    for (const item of value.spaces) {
      assertApplied();
      if (item.retired) continue;
      if (
        this.repo.db
          .prepare(
            "SELECT 1 FROM memory_files WHERE key_name=? UNION SELECT 1 FROM memory_history WHERE key_name=? LIMIT 1",
          )
          .get(item.prior.keyName, item.prior.keyName)
      )
        throw new Error("The prior Space memory factor is still active.");
      const old = (await this.secrets.readSecret(item.prior.keyName)).value;
      assertApplied();
      if (old) {
        try {
          await this.secrets.storeSecret(item.prior.keyName, "");
        } catch (error) {
          if ((await this.secrets.readSecret(item.prior.keyName)).value) throw error;
        }
        if ((await this.secrets.readSecret(item.prior.keyName)).value)
          throw new Error("The applied prior Space memory retirement is unconfirmed.");
      }
      assertApplied();
      item.retired = true;
      save(this.repo, value);
    }
    await this.removeFiles(value);
    omitMemoryRestoreTransition(this.repo);
  }
}
