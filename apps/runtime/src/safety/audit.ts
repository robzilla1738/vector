import type { DatabaseSync } from "node:sqlite";
import type { SqliteColumnCipher } from "../store/sqlite-protection.js";

/** Security decisions are durable and never include page text, credentials, or model prompts. */
export class SafetyAuditStore {
  constructor(
    private readonly db: DatabaseSync,
    private readonly columnCipher?: SqliteColumnCipher,
  ) {}

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
    if (!this.columnCipher) {
      this.db
        .prepare("INSERT INTO safety_audit(kind,payload,recorded_at) VALUES(?,?,?)")
        .run(type, payload, recordedAt);
      return;
    }
    const nested = this.db.isTransaction;
    this.db.exec(nested ? "SAVEPOINT aux_safety_audit" : "BEGIN IMMEDIATE");
    try {
      const seq = Number(
        this.db
          .prepare("INSERT INTO safety_audit(kind,payload,recorded_at) VALUES(?,?,?)")
          .run(type, "", recordedAt).lastInsertRowid,
      );
      this.db
        .prepare("UPDATE safety_audit SET payload=? WHERE seq=?")
        .run(this.columnCipher.encrypt("safety_audit", JSON.stringify([seq]), "payload", payload), seq);
      this.db.exec(nested ? "RELEASE aux_safety_audit" : "COMMIT");
    } catch (error) {
      this.db.exec(nested ? "ROLLBACK TO aux_safety_audit" : "ROLLBACK");
      if (nested) this.db.exec("RELEASE aux_safety_audit");
      throw error;
    }
  }
}
