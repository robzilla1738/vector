import { AuxError } from "@aux/contracts";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";
import type { Repo } from "../store/repo.js";

/** Local and cloud processes publish into one encrypted receipt ledger. */
export class CodingProcessLedger {
  constructor(protected readonly repo: Repo) {}
  protected save(receipt: CodingProcessReceipt): void {
    const json = this.repo.protectRecordField(
      "coding_process_receipts",
      [receipt.processId],
      "receipt",
      JSON.stringify(receipt),
    );
    this.repo.db
      .prepare(
        "INSERT INTO coding_process_receipts(process_id,run_id,action_id,state,receipt) VALUES(?,?,?,?,?) ON CONFLICT(process_id) DO UPDATE SET state=excluded.state,receipt=excluded.receipt",
      )
      .run(receipt.processId, receipt.runId, receipt.actionId, receipt.state, json);
  }
  protected decode(row: { process_id: string; receipt: string }): CodingProcessReceipt {
    return JSON.parse(
      this.repo.revealRecordField("coding_process_receipts", [row.process_id], "receipt", row.receipt),
    ) as CodingProcessReceipt;
  }
  list(runId: string): CodingProcessReceipt[] {
    const rows = this.repo.db
      .prepare("SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? ORDER BY rowid")
      .all(runId) as unknown as { process_id: string; receipt: string }[];
    return rows.map((row) => this.decode(row));
  }
  recent(runId: string, limit = 12): CodingProcessReceipt[] {
    const rows = this.repo.db
      .prepare(
        "SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? ORDER BY rowid DESC LIMIT ?",
      )
      .all(runId, limit) as unknown as { process_id: string; receipt: string }[];
    return rows.reverse().map((row) => this.decode(row));
  }
  activity(runId: string): CodingProcessReceipt[] {
    const rows = this.repo.db
      .prepare(
        "SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? AND (state IN ('starting','running','uncertain') OR process_id IN (SELECT process_id FROM coding_process_receipts WHERE run_id=? ORDER BY rowid DESC LIMIT 12)) ORDER BY rowid",
      )
      .all(runId, runId) as unknown as { process_id: string; receipt: string }[];
    return rows.map((row) => this.decode(row));
  }
  unresolved(runId: string): CodingProcessReceipt[] {
    return this.withState(runId, ["starting", "uncertain"]);
  }
  interrupted(runId: string): CodingProcessReceipt[] {
    return this.withState(runId, ["interrupted"]);
  }
  private withState(runId: string, states: string[]): CodingProcessReceipt[] {
    const rows = this.repo.db
      .prepare(
        `SELECT process_id,receipt FROM coding_process_receipts WHERE run_id=? AND state IN (${states.map(() => "?").join(",")}) ORDER BY rowid`,
      )
      .all(runId, ...states) as unknown as { process_id: string; receipt: string }[];
    return rows.map((row) => this.decode(row));
  }
  receiptIds(runId: string): string[] {
    const rows = this.repo.db
      .prepare("SELECT process_id FROM coding_process_receipts WHERE run_id=? ORDER BY rowid")
      .all(runId) as unknown as { process_id: string }[];
    return rows.map((row) => row.process_id);
  }
  status(processId: string, runId: string): CodingProcessReceipt {
    const row = this.repo.db
      .prepare("SELECT process_id,receipt FROM coding_process_receipts WHERE process_id=? AND run_id=?")
      .get(processId, runId) as { process_id: string; receipt: string } | undefined;
    if (!row) throw new AuxError("not_found", "This process does not belong to the run.");
    return this.decode(row);
  }
}
