import { randomUUID } from "node:crypto";
import { closeSync, existsSync, fsyncSync, lstatSync, openSync, readFileSync, renameSync, unlinkSync, writeSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { join } from "node:path";

export type ManagedRecoveryGeneration = { lineageId: string; generation: number };
const NAME = "managed-recovery-generation.json";
const SENTINEL = "managed-recovery-initialized";
const UUID = /^[a-f0-9-]{36}$/;

function ownedFile(path: string): boolean {
  const info = lstatSync(path);
  return info.isFile() && !info.isSymbolicLink() && (info.mode & 0o077) === 0
    && (!process.getuid || info.uid === process.getuid());
}

function read(dataDir: string): ManagedRecoveryGeneration | undefined {
  const path = join(dataDir, NAME);
  const sentinel = join(dataDir, SENTINEL);
  if (!existsSync(path)) {
    if (existsSync(sentinel)) throw new Error("The managed recovery generation anchor is missing; restore is refused.");
    return undefined;
  }
  const info = lstatSync(path);
  if (!existsSync(sentinel) || !ownedFile(sentinel) || !ownedFile(path) || info.size > 1024)
    throw new Error("The managed recovery generation anchor is invalid.");
  let value: unknown;
  try { value = JSON.parse(readFileSync(path, "utf8")); }
  catch { throw new Error("The managed recovery generation anchor is invalid."); }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("The managed recovery generation anchor is invalid.");
  const item = value as Record<string, unknown>;
  if (item.version !== 1 || typeof item.lineageId !== "string" || !UUID.test(item.lineageId)
    || !Number.isSafeInteger(item.generation) || Number(item.generation) < 0)
    throw new Error("The managed recovery generation anchor is invalid.");
  return { lineageId: item.lineageId, generation: Number(item.generation) };
}

function write(dataDir: string, value: ManagedRecoveryGeneration): void {
  const path = join(dataDir, NAME), temporary = `${path}.${randomUUID()}.tmp`;
  const fd = openSync(temporary, "wx", 0o600);
  try {
    writeSync(fd, JSON.stringify({ version: 1, ...value }) + "\n");
    fsyncSync(fd);
  } finally { closeSync(fd); }
  try { renameSync(temporary, path); }
  finally { if (existsSync(temporary)) unlinkSync(temporary); }
  const directory = openSync(dataDir, "r");
  try { fsyncSync(directory); }
  finally { closeSync(directory); }
}

function initialize(dataDir: string): ManagedRecoveryGeneration {
  const sentinel = join(dataDir, SENTINEL);
  const fd = openSync(sentinel, "wx", 0o600);
  try { writeSync(fd, "initialized\n"); fsyncSync(fd); }
  finally { closeSync(fd); }
  const created = { lineageId: randomUUID(), generation: 0 };
  write(dataDir, created);
  return created;
}

function locked<T>(dataDir: string, work: () => T): T {
  const db = new DatabaseSync(join(dataDir, "managed-recovery-lock.sqlite"));
  try {
    db.exec("PRAGMA busy_timeout=5000; BEGIN EXCLUSIVE");
    try { return work(); }
    finally { db.exec("ROLLBACK"); }
  } finally { db.close(); }
}

/** A newly created Profile gets a lineage; an existing missing anchor is never trusted at restore. */
export function ensureManagedRecoveryGeneration(dataDir: string): ManagedRecoveryGeneration {
  return locked(dataDir, () => {
    const prior = read(dataDir);
    if (prior) return prior;
    return initialize(dataDir);
  });
}

export function currentManagedRecoveryGeneration(dataDir: string): ManagedRecoveryGeneration {
  const value = read(dataDir);
  if (!value) throw new Error("The managed recovery generation anchor is missing; restore is refused.");
  return value;
}

/** Advance before deleting claims so a crash cannot make an older managed backup restorable. */
export function advanceManagedRecoveryGeneration(dataDir: string): ManagedRecoveryGeneration {
  return locked(dataDir, () => {
    const prior = read(dataDir) ?? initialize(dataDir);
    if (prior.generation === Number.MAX_SAFE_INTEGER) throw new Error("Managed recovery generation exhausted.");
    const next = { lineageId: prior.lineageId, generation: prior.generation + 1 };
    write(dataDir, next);
    return next;
  });
}

export function assertManagedRecoveryGeneration(dataDir: string, candidate: unknown,
  allowLegacyAtGenerationZero = false): ManagedRecoveryGeneration {
  const current = currentManagedRecoveryGeneration(dataDir);
  if (candidate === undefined && allowLegacyAtGenerationZero && current.generation === 0) return current;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate))
    throw new Error("This managed backup predates the current recovery generation and cannot be restored.");
  const value = candidate as Record<string, unknown>;
  if (value.lineageId !== current.lineageId || value.generation !== current.generation)
    throw new Error("This managed backup predates the current recovery generation and cannot be restored.");
  return current;
}
