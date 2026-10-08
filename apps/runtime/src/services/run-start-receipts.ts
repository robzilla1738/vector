import { AuxError, newRunId, type Run } from "@aux/contracts";
import type { Repo } from "../store/repo.js";

export interface RunStartRequest {
  requestId: string;
  digest: string;
  windowId: string;
  chatId: string;
  current(): Promise<void>;
}
type Receipt = {
  requestId: string;
  digest: string;
  windowId: string;
  chatId: string;
  runId: string;
  state: "reserved" | "accepted" | "abandoned";
};
export type StartReconciliation =
  { status: "accepted"; run: Run } | { status: "not_started" | "removed"; run: null };

/** First-send receipts contain no prompt. Accepted and abandoned identities survive chat deletion. */
export class RunStartReceipts {
  private readonly temporary = new Map<string, Receipt>();
  private readonly unknownTemporary = new Set<string>();
  private readonly inFlight = new Map<string, Promise<Run>>();
  constructor(private repo: Repo) {}

  private reserve(request: RunStartRequest, privateTask: boolean, reconcile = false): Receipt {
    const saved =
      this.temporary.get(request.requestId) ??
      (this.repo.db
        .prepare(
          "SELECT request_id AS requestId, digest, window_id AS windowId, chat_id AS chatId, run_id AS runId, state FROM run_start_receipts WHERE request_id=?",
        )
        .get(request.requestId) as Receipt | undefined);
    if (this.unknownTemporary.has(request.requestId) || (reconcile && privateTask && !saved)) {
      this.unknownTemporary.add(request.requestId);
      throw new AuxError(
        "conflict",
        "Aux can no longer verify this temporary send. Check Chats before starting a new chat.",
      );
    }
    if (saved) {
      if (
        saved.digest !== request.digest ||
        saved.chatId !== request.chatId ||
        (!reconcile && saved.windowId !== request.windowId)
      )
        throw new AuxError("conflict", "This send belongs to its original message, options and Aux window.");
      return saved;
    }
    const receipt: Receipt = {
      requestId: request.requestId,
      digest: request.digest,
      windowId: request.windowId,
      chatId: request.chatId,
      runId: newRunId(),
      state: "reserved",
    };
    if (privateTask) this.temporary.set(receipt.requestId, receipt);
    else
      this.repo.db
        .prepare(
          "INSERT INTO run_start_receipts(request_id,digest,window_id,chat_id,run_id,state) VALUES(?,?,?,?,?,?)",
        )
        .run(
          receipt.requestId,
          receipt.digest,
          receipt.windowId,
          receipt.chatId,
          receipt.runId,
          receipt.state,
        );
    return receipt;
  }

  private state(receipt: Receipt, state: Receipt["state"]) {
    receipt.state = state;
    if (this.temporary.has(receipt.requestId)) this.temporary.set(receipt.requestId, receipt);
    else
      this.repo.db
        .prepare("UPDATE run_start_receipts SET state=? WHERE request_id=?")
        .run(state, receipt.requestId);
  }

  async start(
    request: RunStartRequest,
    privateTask: boolean,
    dispatch: (runId: string) => Promise<Run>,
  ): Promise<Run> {
    await request.current();
    const receipt = this.reserve(request, privateTask);
    const pending = this.inFlight.get(request.requestId);
    if (pending) return pending;
    if (receipt.state === "abandoned")
      throw new AuxError(
        "cancelled",
        "This send was recovered without starting. Send the draft again as a new message.",
      );
    if (receipt.state === "accepted") {
      const run = this.repo.getRun(receipt.runId);
      if (!run)
        throw new AuxError("not_found", "The original chat was removed. This send will not recreate it.");
      return run;
    }
    const operation = Promise.resolve()
      .then(async () => {
        try {
          await request.current();
          const run = await dispatch(receipt.runId);
          if (run.runId !== receipt.runId) {
            this.state(receipt, "accepted");
            throw new AuxError(
              "conflict",
              "This send returned an unexpected chat identity. Check Chats before sending again.",
            );
          }
          this.state(receipt, "accepted");
          return run;
        } catch (error) {
          const run = this.repo.getRun(receipt.runId);
          if (run) {
            this.state(receipt, "accepted");
            return run;
          }
          throw error;
        }
      })
      .finally(() => this.inFlight.delete(request.requestId));
    this.inFlight.set(request.requestId, operation);
    return operation;
  }

  async reconcile(request: RunStartRequest, privateTask: boolean): Promise<StartReconciliation> {
    await request.current();
    // Reconciliation can only read or abandon; a new native window never dispatches the old request.
    let receipt = this.reserve(request, privateTask, true);
    const pending = this.inFlight.get(request.requestId);
    if (pending) {
      // Wait for admission as well as dispatch; a negative receipt must fence every late original send.
      try {
        await pending;
      } catch {
        /* The persisted acceptance marker is authoritative. */
      }
      await request.current();
      receipt = this.reserve(request, privateTask, true);
    }
    if (receipt.state === "accepted") {
      const run = this.repo.getRun(receipt.runId);
      if (run && (run.config?.chatId ?? run.runId) !== receipt.chatId)
        throw new AuxError("conflict", "The original chat identity changed.");
      return run ? { status: "accepted", run } : { status: "removed", run: null };
    }
    this.state(receipt, "abandoned");
    return { status: "not_started", run: null };
  }

  clearTemporary() {
    this.temporary.clear();
    this.unknownTemporary.clear();
  }
}
