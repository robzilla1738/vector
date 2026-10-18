import { AuxError } from "@aux/contracts";
import {
  ConnectorFileTransferRecordSchema,
  type ConnectorFileTransferRecord,
} from "@aux/contracts/connector-file-upload";
import type { Repo } from "../store/repo.js";

type Row = { transfer_id: string; run_id: string; state: string; body: string; updated_at: number };
export class ConnectorUploadStore {
  constructor(private repo: Repo) {
    if (!repo.columnCipher)
      throw new AuxError(
        "capability_unsupported",
        "Connector file transfers require encrypted local record storage.",
      );
  }
  private decode(row: Row): ConnectorFileTransferRecord {
    const value = ConnectorFileTransferRecordSchema.parse(
      JSON.parse(
        this.repo.revealRecordField("connector_file_transfers", [row.transfer_id], "body", row.body),
      ),
    );
    if (
      value.transferId !== row.transfer_id ||
      value.runId !== row.run_id ||
      value.state !== row.state ||
      value.updatedAt !== row.updated_at
    )
      throw new AuxError("permission_denied", "The protected connector transfer identity changed.");
    return value;
  }
  get(transferId: string): ConnectorFileTransferRecord {
    const row = this.repo.db
      .prepare("SELECT * FROM connector_file_transfers WHERE transfer_id=?")
      .get(transferId) as Row | undefined;
    if (!row) throw new AuxError("not_found", "This connector transfer is unavailable.");
    return this.decode(row);
  }
  list(runId: string): ConnectorFileTransferRecord[] {
    return (
      this.repo.db
        .prepare("SELECT * FROM connector_file_transfers WHERE run_id=? ORDER BY updated_at,transfer_id")
        .all(runId) as Row[]
    ).map((row) => this.decode(row));
  }
  save(input: ConnectorFileTransferRecord): void {
    const value = ConnectorFileTransferRecordSchema.parse(input);
    this.repo.db
      .prepare(
        `INSERT INTO connector_file_transfers(transfer_id,run_id,state,body,updated_at) VALUES(?,?,?,?,?)
      ON CONFLICT(transfer_id) DO UPDATE SET state=excluded.state,body=excluded.body,updated_at=excluded.updated_at WHERE connector_file_transfers.run_id=excluded.run_id`,
      )
      .run(
        value.transferId,
        value.runId,
        value.state,
        this.repo.protectRecordField(
          "connector_file_transfers",
          [value.transferId],
          "body",
          JSON.stringify(value),
        ),
        value.updatedAt,
      );
    if (JSON.stringify(this.get(value.transferId)) !== JSON.stringify(value))
      throw new AuxError("conflict", "The connector transfer's original owner changed.");
  }
  retireRestored(): void {
    const pending = this.repo.db.prepare(
      "SELECT * FROM connector_file_transfers WHERE state=? ORDER BY transfer_id LIMIT 100",
    );
    this.repo.transaction(() => {
      for (const state of ["prepared", "waiting", "running"]) {
        while (true) {
          const rows = pending.all(state) as Row[];
          if (!rows.length) break;
          for (const row of rows) {
            const value = this.decode(row);
            this.save({
              ...value,
              state: value.state === "running" ? "uncertain" : "retired",
              approval: undefined,
              updatedAt: Date.now(),
              error:
                "Recovered transfer authority is retired. Inspect the retained phase receipts; no write was replayed.",
            });
          }
        }
      }
    });
  }
  remove(runId: string): void {
    this.repo.db.prepare("DELETE FROM connector_file_transfers WHERE run_id=?").run(runId);
  }
}
