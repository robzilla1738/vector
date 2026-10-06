import { createHash } from "node:crypto";
import {
  AuxError,
  NativeRecorderStartedSchema,
  NativeRecorderDrainSchema,
  NativeRecorderStoppedSchema,
} from "@aux/contracts";
import { RECORDER_SOURCE, type RecorderObserver } from "@aux/chromium-driver";

/** Private fixed native operations. Implementations must use authenticated host RPC. */
export interface NativeRecorderTransport {
  start(input: { pageId: string }): Promise<unknown>;
  drain(input: { pageId: string; recorderId: string }): Promise<unknown>;
  stop(input: { pageId: string; recorderId: string }): Promise<unknown>;
}
const producerSha256 = createHash("sha256").update(RECORDER_SOURCE).digest("hex");
const drained = NativeRecorderDrainSchema;
const stopped = NativeRecorderStoppedSchema;

/** Native capture only; no generic CDP method, script, context or world. */
export class NativeRecorderObserver implements RecorderObserver {
  private closed = false;
  private starting?: Promise<void>;
  private closing?: Promise<void>;
  private polling?: Promise<void>;
  private recorderId?: string;
  private documentGeneration?: bigint;
  private timer?: ReturnType<typeof setTimeout>;
  private fault?: unknown;
  private onFault?: (error: unknown) => void;
  constructor(
    private readonly transport: NativeRecorderTransport,
    private readonly pageId: string,
    private readonly current: () => boolean,
  ) {}
  private checkCurrent() {
    if (this.closed || !this.current()) throw new AuxError("target_detached", "The recording tab changed.");
  }
  start(onStep: (step: unknown) => void, onFault?: (error: unknown) => void): Promise<void> {
    if (!onFault)
      return Promise.reject(
        new AuxError("invalid_params", "Native recording needs a terminal failure handler."),
      );
    if (this.starting) return Promise.reject(new AuxError("conflict", "Recording already started."));
    this.onFault = onFault;
    this.starting = this.begin(onStep);
    return this.starting;
  }
  private async begin(onStep: (step: unknown) => void) {
    this.checkCurrent();
    const receipt = NativeRecorderStartedSchema.parse(await this.transport.start({ pageId: this.pageId }));
    // Retain the actual late receipt before checking retirement so close can
    // clean up only the recording that this request really installed.
    this.recorderId = receipt.recorderId;
    this.documentGeneration = BigInt(receipt.documentGeneration);
    if (receipt.producerSha256 !== producerSha256)
      throw new AuxError("backend_unavailable", "Native recording producer does not match this runtime.");
    this.checkCurrent();
    this.schedule(onStep);
  }
  private schedule(onStep: (step: unknown) => void) {
    if (this.closed) return;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      this.polling = this.poll(onStep);
      void this.polling.then(
        () => this.schedule(onStep),
        (error) => {
          this.fault = error;
          this.closed = true;
          // Notify only after this polling operation settled; cleanup may await it.
          try {
            this.onFault?.(error);
          } catch (notification) {
            this.fault = new AggregateError(
              [error, notification],
              "Recording failed and failure notification was rejected.",
            );
          }
        },
      );
    }, 100);
    this.timer.unref();
  }
  private async poll(onStep: (step: unknown) => void) {
    this.checkCurrent();
    if (!this.recorderId) throw new AuxError("target_detached", "Recording receipt is missing.");
    const receipt = drained.parse(
      await this.transport.drain({ pageId: this.pageId, recorderId: this.recorderId }),
    );
    this.checkCurrent();
    const next = BigInt(receipt.documentGeneration);
    if (
      receipt.recorderId !== this.recorderId ||
      this.documentGeneration === undefined ||
      next < this.documentGeneration
    )
      throw new AuxError("ref_stale", "Recording document receipt changed.");
    this.documentGeneration = next;
    if ("pending" in receipt) return;
    for (const step of receipt.events) {
      this.checkCurrent();
      onStep(step);
    }
  }
  close(): Promise<void> {
    if (this.closing) return this.closing;
    this.closed = true;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.closing = this.cleanup();
    return this.closing;
  }
  private async cleanup() {
    const errors: unknown[] = [];
    await this.starting?.catch((error) => errors.push(error));
    await this.polling?.catch((error) => {
      if (!errors.includes(error)) errors.push(error);
    });
    if (this.fault !== undefined && !errors.includes(this.fault)) errors.push(this.fault);
    if (this.recorderId) {
      try {
        stopped.parse(await this.transport.stop({ pageId: this.pageId, recorderId: this.recorderId }));
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length > 1) throw new AggregateError(errors, "Recording capture and cleanup failed.");
    if (errors.length === 1) throw errors[0];
  }
}
