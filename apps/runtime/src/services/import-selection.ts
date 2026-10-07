import {
  AuxError,
  type BrowserExportFormat,
  type BrowserExportSource,
  type NativeBrowserImportDiscovery,
  type NativeBrowserImportSelection,
} from "@aux/contracts";
import type { NativeBridge } from "../native.js";

/** Read-only picker jobs retain their original document until real native completion. */
export class BrowserImportSelections {
  private closed = false;
  private readonly jobs = new Map<string, { token: string; receipt: NativeBrowserImportSelection }>();
  private readonly starts = new Set<Promise<void>>();
  constructor(
    private readonly deps: {
      native?: NativeBridge;
      owner(token: string): Promise<void>;
      publish(token: string, discovery: NativeBrowserImportDiscovery): NativeBrowserImportDiscovery;
    },
  ) {}
  private bridge() {
    const n = this.deps.native;
    if (!n?.browserImportExportPoll || !n.browserImportExportCancel)
      throw new AuxError(
        "backend_unavailable",
        "Browser import selections require the original native source picker.",
      );
    return {
      poll: n.browserImportExportPoll.bind(n),
      cancel: n.browserImportExportCancel.bind(n),
    };
  }
  selectExport(input: { sourceId: BrowserExportSource; format: BrowserExportFormat }, token: string) {
    return this.start(token, () => {
      const native = this.deps.native;
      if (!native?.browserImportSelectExport)
        throw new AuxError(
          "backend_unavailable",
          "Browser import selections require the original native source picker.",
        );
      return native.browserImportSelectExport({ ...input, token });
    });
  }
  selectWindow(input: { sourceId: "safari" }, token: string) {
    return this.start(token, () => {
      const native = this.deps.native;
      if (!native?.browserImportSelectWindow)
        throw new AuxError("backend_unavailable", "Safari tabs require the original native window review.");
      return native.browserImportSelectWindow({ ...input, token });
    });
  }
  private async start(token: string, dispatch: () => Promise<NativeBrowserImportSelection>) {
    if (this.closed) throw new AuxError("cancelled", "Browser import selection is closing.");
    await this.deps.owner(token);
    if (this.closed) throw new AuxError("cancelled", "Browser import selection closed.");
    for (const [id, job] of this.jobs) if (job.receipt.done || job.receipt.unknown) this.jobs.delete(id);
    if (this.jobs.size || this.starts.size)
      throw new AuxError("conflict", "Join the original browser import selection first.");
    let receipt: NativeBrowserImportSelection | undefined;
    this.bridge();
    const pending = dispatch().then((result) => {
      receipt = result;
      this.jobs.set(result.selectionId, { token, receipt: result });
    });
    this.starts.add(pending);
    try {
      await pending;
      if (this.closed)
        throw new AuxError("cancelled", "Browser import selection closed during native selection.");
      await this.deps.owner(token);
      if (this.closed)
        throw new AuxError("cancelled", "Browser import selection closed during owner validation.");
      if (!receipt) throw new AuxError("internal", "Native import selection returned no receipt.");
      return { selectionId: receipt.selectionId };
    } catch (error) {
      if (receipt) {
        const job = this.jobs.get(receipt.selectionId);
        if (job && !job.receipt.done && !job.receipt.unknown) {
          try {
            job.receipt = await this.bridge().cancel(receipt.selectionId);
          } catch (cancelError) {
            throw new AggregateError(
              [error, cancelError],
              "The original browser selection was retired but native cancellation is unconfirmed.",
            );
          }
        }
      }
      throw error;
    } finally {
      this.starts.delete(pending);
    }
  }
  async status(id: string, token: string, cancel = false) {
    const job = this.jobs.get(id);
    if (!job) throw new AuxError("not_found", "No original browser import selection with that identity.");
    await this.deps.owner(token);
    if (!cancel && token !== job.token)
      throw new AuxError("ref_stale", "Return to the original browser import document.");
    const receipt = await (cancel ? this.bridge().cancel(id) : this.bridge().poll(id));
    if (receipt.selectionId !== id)
      throw new AuxError("conflict", "Native import selection identity changed.");
    job.receipt = receipt;
    await this.deps.owner(token);
    let sources: NativeBrowserImportDiscovery["sources"] | undefined;
    if (!cancel && receipt.done && receipt.discovery) {
      await this.deps.owner(job.token);
      if (this.closed) throw new AuxError("cancelled", "Browser import selection closed before publishing.");
      sources = this.deps.publish(job.token, receipt.discovery).sources;
    }
    return {
      selectionId: id,
      unknown: receipt.unknown,
      done: receipt.done,
      sources,
      error: receipt.error?.message,
    };
  }
  async close() {
    this.closed = true;
    const failures: unknown[] = [];
    for (const result of await Promise.allSettled(this.starts))
      if (result.status === "rejected") failures.push(result.reason);
    for (const [id, job] of this.jobs) {
      try {
        if (!job.receipt.done && !job.receipt.unknown) job.receipt = await this.bridge().cancel(id);
        while (!job.receipt.done && !job.receipt.unknown) {
          await new Promise<void>((resolve) => setTimeout(resolve, 100));
          job.receipt = await this.bridge().poll(id);
          if (job.receipt.selectionId !== id)
            throw new AuxError("conflict", "Native import selection identity changed during close.");
        }
        // A lost picker has no accepted destination writes. Preserve its unknown
        // receipt without inventing native completion or repeating the selection.
      } catch (error) {
        failures.push(error);
      }
    }
    if (failures.length)
      throw new AggregateError(failures, "Native browser import selections could not be joined.");
  }
}
