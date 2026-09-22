/** In-process SQLite fencing for one coordinator owner per task or run. */
import type { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";

export const COORDINATOR_LEASE_TTL_MS = 15 * 60_000;

export type CoordinatorLeaseRecord = {
  leaseKey: string;
  ownerId: string;
  acquiredAt: number;
  expiresAt: number;
  generation: number;
  fenced: boolean;
};

export function coordinatorOwnerId(): string {
  return `pid:${process.pid}:${randomUUID()}`;
}

export class CoordinatorLease {
  constructor(private db: DatabaseSync) {}

  acquire(leaseKey: string, ownerId: string, now = Date.now(), ttlMs = COORDINATOR_LEASE_TTL_MS): CoordinatorLeaseRecord {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const existing = this.db.prepare(
        "SELECT lease_key AS leaseKey, owner_id AS ownerId, acquired_at AS acquiredAt, expires_at AS expiresAt, generation, fenced FROM coordinator_leases WHERE lease_key=?",
      ).get(leaseKey) as CoordinatorLeaseRecord | undefined;
      if (existing && existing.ownerId !== ownerId && existing.expiresAt > now && !existing.fenced) {
        this.db.exec("ROLLBACK");
        throw new AuxError("conflict", `Coordinator lease ${leaseKey} is held until ${new Date(existing.expiresAt).toISOString()}. Stop that run or wait for the lease to expire.`);
      }
      const generation = existing ? existing.generation + (existing.ownerId === ownerId && existing.expiresAt > now && !existing.fenced ? 0 : 1) : 1;
      const fencedTakeover = !!existing && (existing.ownerId !== ownerId || existing.fenced || existing.expiresAt <= now);
      if (existing && fencedTakeover) {
        this.db.prepare("UPDATE coordinator_leases SET fenced=1 WHERE lease_key=? AND generation=?").run(leaseKey, existing.generation);
      }
      const record: CoordinatorLeaseRecord = {
        leaseKey,
        ownerId,
        acquiredAt: existing && existing.ownerId === ownerId && !fencedTakeover ? existing.acquiredAt : now,
        expiresAt: now + ttlMs,
        generation,
        fenced: false,
      };
      this.db.prepare(`INSERT INTO coordinator_leases(lease_key,owner_id,acquired_at,expires_at,generation,fenced)
        VALUES(?,?,?,?,?,0)
        ON CONFLICT(lease_key) DO UPDATE SET owner_id=excluded.owner_id, acquired_at=excluded.acquired_at,
          expires_at=excluded.expires_at, generation=excluded.generation, fenced=0`).run(
        record.leaseKey, record.ownerId, record.acquiredAt, record.expiresAt, record.generation,
      );
      this.db.exec("COMMIT");
      return record;
    } catch (error) {
      try { this.db.exec("ROLLBACK"); } catch { /* already rolled back */ }
      throw error;
    }
  }

  refresh(leaseKey: string, ownerId: string, now = Date.now(), ttlMs = COORDINATOR_LEASE_TTL_MS): void {
    const updated = this.db.prepare(
      "UPDATE coordinator_leases SET expires_at=? WHERE lease_key=? AND owner_id=? AND fenced=0",
    ).run(now + ttlMs, leaseKey, ownerId);
    if (updated.changes !== 1) throw new AuxError("conflict", "This coordinator lease was fenced or taken over.");
  }

  release(leaseKey: string, ownerId: string): void {
    this.db.prepare("DELETE FROM coordinator_leases WHERE lease_key=? AND owner_id=?").run(leaseKey, ownerId);
  }

  get(leaseKey: string): CoordinatorLeaseRecord | undefined {
    return this.db.prepare(
      "SELECT lease_key AS leaseKey, owner_id AS ownerId, acquired_at AS acquiredAt, expires_at AS expiresAt, generation, fenced FROM coordinator_leases WHERE lease_key=?",
    ).get(leaseKey) as CoordinatorLeaseRecord | undefined;
  }
}
