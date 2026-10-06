import type { DatabaseSync } from "node:sqlite";

/** Security decisions are durable and never include page text, credentials, or model prompts. */
export class SafetyAuditStore {
  constructor(private readonly db: DatabaseSync) {}

  record(event: Record<string, unknown>): void {
    const { kind, at, ...rest } = event;
    const safe = Object.fromEntries(
      Object.entries(rest).filter(([key]) =>
        [
          "action",
          "effect",
          "origin",
          "recipient",
          "source",
          "access",
          "reason",
          "status",
          "profileId",
          "scope",
          "policySource",
          "provenance",
          "approvalId",
          "grantId",
          "decision",
          "count",
        ].includes(key),
      ),
    );
    if (Array.isArray(event.findings))
      safe.findings = event.findings.slice(0, 8).map((value) => {
        const finding = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
        return { category: finding.category, severity: finding.severity };
      });
    const type = typeof kind === "string" ? kind : "origin_policy";
    const payload = JSON.stringify(safe).slice(0, 4096);
    const recordedAt = typeof at === "number" ? at : Date.now();
    this.db
      .prepare("INSERT INTO safety_audit(kind,payload,recorded_at) VALUES(?,?,?)")
      .run(type, payload, recordedAt);
  }
}
