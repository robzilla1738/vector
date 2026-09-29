/**
 * Request-path EGRESS authority. The native throttle must defer agent-attributed
 * requests until this service answers and must check again at every redirect.
 * No request bytes or protected specimens are persisted or passed to audit.
 */
import { createHash, randomUUID } from "node:crypto";
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
interface ActiveLease {
  lease: EgressLease; specimens: Specimen[];
  memoryFingerprints: Set<string>; revoked: boolean; initialNavigationStarted: boolean;
}

const MEMORY_WINDOW = 12;
function textFingerprints(text: string): Set<string> {
  const normalized = text.normalize("NFKC").replace(/\s+/gu, " ");
  const hashes = new Set<string>();
  for (let at = 0; at + MEMORY_WINDOW <= normalized.length; at++)
    hashes.add(createHash("sha256").update(normalized.slice(at, at + MEMORY_WINDOW)).digest("hex"));
  return hashes;
}

function inspectableText(raw: string): string[] {
  const variants = [raw];
  for (let depth = 0; depth < 2; depth++) {
    try { variants.push(decodeURIComponent(variants.at(-1)!.replace(/\+/g, "%20"))); }
    catch { break; }
  }
  // Common body/query encoding. Decoded data remains ephemeral and bounded.
  const encodedVariants = variants.slice(); // Decoding appends to variants; iterate the original inputs once.
  for (const text of encodedVariants) for (const candidate of text.match(/[A-Za-z0-9+/_-]{16,}={0,2}/g) ?? []) {
    const decoded = Buffer.from(candidate, "base64");
    if (decoded.length >= MEMORY_WINDOW && decoded.length <= MAX_REQUEST_BYTES)
      variants.push(decoded.toString("utf8"));
  }
  return [...new Set(variants)];
}

function phraseHashes(text: string): Set<string> {
  const words = text.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const hashes = new Set<string>();
  for (let at = 0; at + 4 <= words.length; at++) {
    const phrase = words.slice(at, at + 4).join(" ");
    if (phrase.length >= 20) hashes.add(createHash("sha256").update(phrase).digest("hex"));
  }
  return hashes;
}

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
  private readonly memoryByRun = new Map<string, Set<string>>();
  private readonly pageTextByRun = new Map<string, Map<string, Set<string>>>();
  constructor(private readonly authority: {
    currentTaskRevision(runId: string): number | null;
    audit(decision: EgressDecision, evidence: EgressAuditEvidence): void;
    now(): number;
  }) {}

  issue(input: Omit<EgressLease, "leaseId" | "issuedAt" | "expiresAt"> & { durationMs?: number }): EgressLease {
    const now = this.authority.now();
    const sourceOrigin = input.sourceOrigin === "aux://blank" ? "aux://blank" : exactOrigin(input.sourceOrigin);
    if (!sourceOrigin || this.authority.currentTaskRevision(input.runId) !== input.taskRevision)
      throw new Error("Cannot issue egress authority for an invalid or stale run.");
    if (sourceOrigin === "aux://blank" ? !input.initialDestination || !exactOrigin(input.initialDestination) : !!input.initialDestination)
      throw new Error("Initial navigation authority requires a blank page and exact HTTP(S) target.");
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
    const memoryFingerprints = this.memoryByRun.get(lease.runId) ?? new Set<string>();
    this.memoryByRun.set(lease.runId, memoryFingerprints);
    this.leases.set(lease.leaseId, { lease, specimens: [], memoryFingerprints, revoked: false, initialNavigationStarted: false });
    return lease;
  }

  /** Renewal never changes identity or recipients; the owner rechecks its claim. */
  renew(leaseId: string): EgressLease {
    const active = this.leases.get(leaseId);
    if (!active || active.revoked || active.lease.expiresAt <= this.authority.now()
      || this.authority.currentTaskRevision(active.lease.runId) !== active.lease.taskRevision)
      throw new Error("Egress lease is unavailable.");
    active.lease = { ...active.lease, expiresAt: this.authority.now() + MAX_LEASE_MS };
    return { ...active.lease };
  }

  /** Page prose is untrusted, not a secret. Cross-origin reuse needs review. */
  notePageText(leaseId: string, text: string): void {
    const active = this.leases.get(leaseId);
    if (!active || active.revoked) throw new Error("Egress lease is unavailable.");
    this.noteRunPageText(active.lease.runId, active.lease.sourceOrigin, text);
  }

  noteRunPageText(runId: string, sourceOrigin: string, text: string): void {
    if (exactOrigin(sourceOrigin) !== sourceOrigin) throw new Error("Page evidence needs an exact origin.");
    if (Buffer.byteLength(text) > MAX_REQUEST_BYTES) {
      this.revokeRun(runId);
      throw new Error("Page evidence exceeds the inspectable request bound.");
    }
    const sources = this.pageTextByRun.get(runId) ?? new Map<string, Set<string>>();
    const hashes = sources.get(sourceOrigin) ?? new Set<string>();
    for (const hash of phraseHashes(text)) hashes.add(hash);
    sources.set(sourceOrigin, hashes);
    this.pageTextByRun.set(runId, sources);
    if (sources.size > 32 || [...sources.values()].reduce((sum, set) => sum + set.size, 0) > 16_384) {
      this.revokeRun(runId);
      throw new Error("Page evidence exceeds the inspectable request bound.");
    }
  }

  /** Protect excerpts of recalled memory without retaining its plaintext. */
  protectMemory(leaseId: string, text: string): void {
    const active = this.leases.get(leaseId);
    if (!active || active.revoked) throw new Error("Egress lease is unavailable.");
    this.protectRunMemory(active.lease.runId, text);
  }

  protectRunMemory(runId: string, text: string): void {
    if (text.length < MEMORY_WINDOW || Buffer.byteLength(text) > MAX_REQUEST_BYTES) {
      this.revokeRun(runId);
      throw new Error("Protected memory is outside the inspectable request bound.");
    }
    const fingerprints = this.memoryByRun.get(runId) ?? new Set<string>();
    for (const hash of textFingerprints(text)) fingerprints.add(hash);
    this.memoryByRun.set(runId, fingerprints);
    if (fingerprints.size > 262_144) {
      this.revokeRun(runId);
      throw new Error("Protected memory exceeds the inspectable request bound.");
    }
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
    if (active) {
      active.revoked = true; active.specimens.length = 0;
    }
  }

  revokeRun(runId: string): void {
    for (const [id, active] of this.leases) if (active.lease.runId === runId) this.revoke(id);
    this.memoryByRun.get(runId)?.clear();
    this.memoryByRun.delete(runId);
    this.pageTextByRun.delete(runId);
  }

  /** Raw URL and complete bounded request body stay in the trusted process only. */
  decide(raw: EgressRequestEvidence, body = "", approvedRequest = false): EgressDecision {
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
      || evidence.observedAt > this.authority.now() + 1000
      || this.authority.currentTaskRevision(evidence.runId) !== active.lease.taskRevision)
      decision = deny("stale_lease");
    else if (["profileId", "runId", "taskId", "taskRevision", "tabId", "frameId", "documentToken", "documentEpoch"].some(key =>
      (active.lease as unknown as Record<string, unknown>)[key] !== (evidence as unknown as Record<string, unknown>)[key]))
      decision = deny("identity_mismatch");
    else if (!dest) decision = deny("invalid_destination");
    else if (source === "aux://blank" && (
      evidence.kind === "navigation"
        ? active.initialNavigationStarted || evidence.method !== "GET" || evidence.byteCount !== 0
          || !!active.lease.initialDestination && evidence.destination !== active.lease.initialDestination
        : evidence.kind !== "redirect" || !active.initialNavigationStarted
    )) decision = deny("identity_mismatch");
    else if (!evidence.bodyComplete || evidence.byteCount > MAX_REQUEST_BYTES || Buffer.byteLength(body) > MAX_REQUEST_BYTES
      || Buffer.byteLength(body) !== evidence.byteCount)
      decision = deny("incomplete_body");
    else {
      const outbound = evidence.destination + "\n" + body;
      const inspected = inspectableText(outbound);
      const memoryOverlap = active.memoryFingerprints.size > 0 && inspected.some(text =>
        [...textFingerprints(text)].some(hash => active.memoryFingerprints.has(hash)));
      const found = overlap(active.specimens, outbound) ?? (memoryOverlap ? "memory" : null);
      const outboundPhrases = new Set(inspected.flatMap(text => [...phraseHashes(text)]));
      const pageSource = [...(this.pageTextByRun.get(evidence.runId) ?? [])].find(([origin, hashes]) =>
        origin !== dest && [...outboundPhrases].some(hash => hashes.has(hash)))?.[0];
      if (memoryOverlap || found && dest !== source) decision = deny("protected_overlap", memoryOverlap ? "memory" : found!);
      else if (!approvedRequest && pageSource) decision = { ...deny("page_content_overlap"), sourceOrigin: pageSource };
      else if (source === "aux://blank" && dest === exactOrigin(active.lease.initialDestination!))
        decision = { status: "allow", reason: "authorized_recipient", leaseId: evidence.leaseId, sourceOrigin: source, destinationOrigin: dest };
      else if (dest === source) decision = { status: "allow", reason: "same_origin", leaseId: evidence.leaseId, sourceOrigin: source, destinationOrigin: dest };
      else if (!approvedRequest && !active.lease.recipientOrigins.includes(dest)) decision = deny("recipient_denied");
      else decision = { status: "allow", reason: "authorized_recipient", leaseId: evidence.leaseId, sourceOrigin: source, destinationOrigin: dest };
    }
    if (decision.status === "allow" && source === "aux://blank" && evidence.kind === "navigation")
      active!.initialNavigationStarted = true;
    this.authority.audit(decision, {
      leaseId: evidence.leaseId, profileId: evidence.profileId, runId: evidence.runId,
      kind: evidence.kind, method: evidence.method, byteCount: evidence.byteCount,
      ...(dest ? { destinationOrigin: dest } : {}),
    });
    return decision;
  }
}
