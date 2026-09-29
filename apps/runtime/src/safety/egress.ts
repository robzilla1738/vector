/**
 * Request-path EGRESS authority. The native throttle must defer agent-attributed
 * requests until this service answers and must check again at every redirect.
 * No request bytes or protected specimens are persisted or passed to audit.
 */
import { randomUUID } from "node:crypto";
import {
  EgressLeaseSchema, EgressRequestEvidenceSchema,
  type EgressDecision, type EgressLease, type EgressRequestEvidence,
} from "@aux/contracts";

export type ProtectedClass = "credential" | "memory" | "file" | "form";
const MAX_SPECIMENS = 64;
const MAX_SPECIMEN_LENGTH = 256;
const MAX_REQUEST_BYTES = 64 * 1024;
const MAX_LEASE_MS = 30_000;

export interface EgressAuditEvidence {
  leaseId: string; profileId: string; runId: string; kind: EgressRequestEvidence["kind"];
  method: EgressRequestEvidence["method"]; byteCount: number; destinationOrigin?: string;
}

interface Specimen { value: string; dataClass: ProtectedClass }
interface ActiveLease { lease: EgressLease; specimens: Specimen[]; revoked: boolean }

function exactOrigin(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (url.username || url.password) return null;
    return url.origin;
  } catch { return null; }
}

function variants(value: string): string[] {
  // URL and form encoders use both %20 and +. Base64 captures common encoded
  // query/body exfiltration without recording or logging the original value.
  const encoded = encodeURIComponent(value);
  const byteEncoded = [...Buffer.from(value, "utf8")].map(byte => `%${byte.toString(16).toUpperCase().padStart(2, "0")}`).join("");
  return [value, encoded, encoded.replace(/%20/g, "+"), byteEncoded,
    Buffer.from(value, "utf8").toString("base64"),
    Buffer.from(value, "utf8").toString("base64url")];
}

function overlap(specimens: readonly Specimen[], outbound: string): ProtectedClass | null {
  const representations = [outbound];
  for (let depth = 0; depth < 2; depth++) {
    try { representations.push(decodeURIComponent(representations.at(-1)!.replace(/\+/g, "%20"))); }
    catch { break; }
  }
  for (const specimen of specimens) {
    if (representations.some(request => variants(specimen.value).some(value => request.includes(value)))) return specimen.dataClass;
  }
  return null;
}

/** One process lifetime only. A restart loses leases and fails closed. */
export class AgentEgressGuard {
  private readonly leases = new Map<string, ActiveLease>();
  constructor(private readonly authority: {
    currentTaskRevision(runId: string): number | null;
    audit(decision: EgressDecision, evidence: EgressAuditEvidence): void;
    now(): number;
  }) {}

  issue(input: Omit<EgressLease, "leaseId" | "issuedAt" | "expiresAt"> & { durationMs?: number }): EgressLease {
    const now = this.authority.now();
    const sourceOrigin = exactOrigin(input.sourceOrigin);
    if (!sourceOrigin || this.authority.currentTaskRevision(input.runId) !== input.taskRevision)
      throw new Error("Cannot issue egress authority for an invalid or stale run.");
    const recipientOrigins = input.recipientOrigins.map(raw => {
      const normalized = exactOrigin(raw);
      if (!normalized || normalized !== raw) throw new Error("Recipient must be an exact HTTP(S) origin.");
      return normalized;
    });
    const { durationMs, ...identity } = input;
    const lease = EgressLeaseSchema.parse({
      ...identity, sourceOrigin, recipientOrigins,
      leaseId: randomUUID(), issuedAt: now,
      expiresAt: now + Math.min(Math.max(durationMs ?? MAX_LEASE_MS, 1), MAX_LEASE_MS),
    });
    this.leases.set(lease.leaseId, { lease, specimens: [], revoked: false });
    return lease;
  }

  /** Register only protected values actually used or observed by this run. */
  taint(leaseId: string, value: string, dataClass: ProtectedClass): void {
    const active = this.leases.get(leaseId);
    if (!active || active.revoked || active.lease.expiresAt <= this.authority.now())
      throw new Error("Egress lease is unavailable.");
    if (value.length < 12 || value.length > MAX_SPECIMEN_LENGTH || active.specimens.length >= MAX_SPECIMENS) {
      this.revoke(leaseId);
      throw new Error("Protected value is outside the inspectable request bound.");
    }
    active.specimens.push({ value, dataClass });
  }

  revoke(leaseId: string): void {
    const active = this.leases.get(leaseId);
    if (active) { active.revoked = true; active.specimens.length = 0; }
  }

  revokeRun(runId: string): void {
    for (const [id, active] of this.leases) if (active.lease.runId === runId) this.revoke(id);
  }

  /** Raw URL and complete bounded request body stay in the trusted process only. */
  decide(raw: EgressRequestEvidence, body = ""): EgressDecision {
    const evidence = EgressRequestEvidenceSchema.parse(raw);
    const active = this.leases.get(evidence.leaseId);
    const dest = exactOrigin(evidence.destination);
    const source = active?.lease.sourceOrigin;
    const deny = (reason: EgressDecision["reason"], protectedClass?: ProtectedClass): EgressDecision => ({
      status: "deny", reason, leaseId: evidence.leaseId,
      ...(source ? { sourceOrigin: source } : {}),
      ...(dest ? { destinationOrigin: dest } : {}),
      ...(protectedClass ? { protectedClass } : {}),
    });
    let decision: EgressDecision;
    if (!active) decision = deny("missing_lease");
    else if (active.revoked) decision = deny("revoked_lease");
    else if (active.lease.expiresAt <= this.authority.now()
      || evidence.observedAt < active.lease.issuedAt
      || this.authority.currentTaskRevision(evidence.runId) !== active.lease.taskRevision)
      decision = deny("stale_lease");
    else if (["profileId", "runId", "taskRevision", "tabId", "frameId", "documentEpoch"].some(key =>
      (active.lease as unknown as Record<string, unknown>)[key] !== (evidence as unknown as Record<string, unknown>)[key]))
      decision = deny("identity_mismatch");
    else if (!dest) decision = deny("invalid_destination");
    else if (!evidence.bodyComplete || evidence.byteCount > MAX_REQUEST_BYTES || Buffer.byteLength(body) > MAX_REQUEST_BYTES
      || Buffer.byteLength(body) !== evidence.byteCount)
      decision = deny("incomplete_body");
    else {
      const found = overlap(active.specimens, evidence.destination + "\n" + body);
      if (found && dest !== source) decision = deny("protected_overlap", found);
      else if (dest === source) decision = { status: "allow", reason: "same_origin", leaseId: evidence.leaseId, sourceOrigin: source, destinationOrigin: dest };
      else if (!active.lease.recipientOrigins.includes(dest)) decision = deny("recipient_denied");
      else decision = { status: "allow", reason: "authorized_recipient", leaseId: evidence.leaseId, sourceOrigin: source, destinationOrigin: dest };
    }
    this.authority.audit(decision, {
      leaseId: evidence.leaseId, profileId: evidence.profileId, runId: evidence.runId,
      kind: evidence.kind, method: evidence.method, byteCount: evidence.byteCount,
      ...(dest ? { destinationOrigin: dest } : {}),
    });
    return decision;
  }
}
