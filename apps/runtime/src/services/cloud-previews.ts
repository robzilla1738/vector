import { randomUUID } from "node:crypto";
import { AuxError } from "@aux/contracts";
import {
  CloudPreviewBindingSchema,
  CloudPreviewSchema,
  type CloudListener,
  type CloudPreviewBinding,
} from "@aux/contracts/cloud-preview";
import type { CodingProcessReceipt } from "@aux/contracts/coding-processes";
import type { NativeBridge } from "../native.js";
import type { CloudExecutionContext } from "./cloud-execution.js";

type Preview = {
  binding: CloudPreviewBinding;
  token: string;
  result?: ReturnType<typeof CloudPreviewSchema.parse>;
  retiring: boolean;
  nativeClosed: boolean;
  check: () => void;
  admission?: Promise<boolean>;
  closing?: Promise<void>;
};
export class CloudPreviews {
  private readonly previews = new Map<string, Preview>();
  private readonly closed = new Map<string, string>();
  private opening: Promise<unknown> = Promise.resolve();
  constructor(
    private readonly deps: {
      context: CloudExecutionContext;
      native: Pick<NativeBridge, "cloudPreview" | "cloudPreviewClose" | "turnSourceContext">;
      current(token: string, signal?: AbortSignal): Promise<void>;
      process(processId: string): CodingProcessReceipt;
      listeners(
        process: CodingProcessReceipt,
        port: number,
        token: string,
        signal?: AbortSignal,
      ): Promise<CloudListener[]>;
      expose(port: number, token: string, signal?: AbortSignal, fence?: () => void): Promise<string>;
      hide(port: number): Promise<void>;
      authorize(
        input: { processId: string; port: number },
        context: CloudExecutionContext,
        process: CodingProcessReceipt,
        listener: CloudListener,
        token: string,
      ): Promise<() => void>;
    },
  ) {}
  open(input: { processId: string; port: number }, token: string, signal?: AbortSignal) {
    const work = this.opening.then(() => this.openOriginal(input, token, signal));
    this.opening = work.catch(() => {});
    return work;
  }
  private async openOriginal(
    input: { processId: string; port: number },
    token: string,
    signal?: AbortSignal,
  ) {
    if (
      !this.deps.native.cloudPreview ||
      !this.deps.native.cloudPreviewClose ||
      !this.deps.native.turnSourceContext
    )
      throw new AuxError("capability_unsupported", "Native cloud Preview is unavailable.");
    if (!Number.isInteger(input.port) || input.port < 1 || input.port > 65535)
      throw new AuxError("invalid_params", "Choose a valid server port.");
    await this.deps.current(token, signal);
    for (const preview of this.previews.values())
      if (preview.binding.listener.port === input.port) {
        if (
          preview.token === token &&
          preview.binding.processId === input.processId &&
          preview.result &&
          !preview.retiring &&
          (await this.admit(preview.binding.previewId, token))
        )
          return preview.result;
        throw new AuxError("conflict", "The original Preview on this port still needs to close.");
      }
    const process = this.deps.process(input.processId);
    if (process.state !== "running" || !process.execution?.commandId || !process.execution.supervisor)
      throw new AuxError(
        "ref_stale",
        "Preview requires the original running command and process ownership proof.",
      );
    const listeners = await this.deps.listeners(process, input.port, token, signal);
    if (listeners.length !== 1)
      throw new AuxError(
        "needs_input",
        "The selected command must own one server listening on this port on all interfaces.",
      );
    const listener = listeners[0]!;
    const fence = await this.deps.authorize(input, this.deps.context, process, listener, token);
    await this.deps.current(token, signal);
    fence();
    let preview: Preview | undefined;
    try {
      const url = await this.deps.expose(input.port, token, signal, fence);
      const binding = CloudPreviewBindingSchema.parse({
        previewId: randomUUID(),
        processId: input.processId,
        execution: process.execution,
        listener,
        url,
      });
      preview = { binding, token, retiring: false, nativeClosed: false, check: fence };
      this.previews.set(binding.previewId, preview);
      if (!(await this.admit(binding.previewId, token)))
        throw new AuxError("ref_stale", "The original Preview source or listener changed.");
      fence();
      const result = CloudPreviewSchema.parse(await this.deps.native.cloudPreview({ ...binding, token }));
      if (
        result.previewId !== binding.previewId ||
        result.processId !== binding.processId ||
        result.url !== binding.url
      )
        throw new AuxError("ref_stale", "Another cloud listener returned the Preview surface.");
      await this.deps.current(token, signal);
      fence();
      if (!(await this.admit(binding.previewId, token)))
        throw new AuxError("ref_stale", "The cloud listener retired while its Preview opened.");
      preview.result = result;
      return result;
    } catch (error) {
      try {
        if (preview) await this.close(preview.binding.previewId, token);
        else await this.deps.hide(input.port);
      } catch (cleanup) {
        throw new AggregateError([error, cleanup], "Original cloud Preview cleanup is still owned.");
      }
      throw error;
    }
  }
  async admit(previewId: string, token: string): Promise<boolean> {
    const preview = this.previews.get(previewId);
    if (!preview || preview.token !== token || preview.retiring) return false;
    if (preview.admission) return preview.admission;
    const work = (async () => {
      try {
        preview.check();
        await this.deps.current(token);
        const process = this.deps.process(preview.binding.processId);
        if (
          process.state !== "running" ||
          JSON.stringify(CloudPreviewBindingSchema.shape.execution.parse(process.execution)) !==
            JSON.stringify(preview.binding.execution)
        )
          return false;
        const listeners = await this.deps.listeners(process, preview.binding.listener.port, token);
        await this.deps.current(token);
        preview.check();
        return (
          !preview.retiring &&
          this.previews.get(previewId) === preview &&
          listeners.length === 1 &&
          JSON.stringify(listeners[0]) === JSON.stringify(preview.binding.listener)
        );
      } catch {
        return false;
      }
    })();
    preview.admission = work;
    try {
      return await work;
    } finally {
      if (preview.admission === work) preview.admission = undefined;
    }
  }
  async close(previewId: string, token: string): Promise<void> {
    if (this.closed.get(previewId) === token) return;
    const preview = this.previews.get(previewId);
    if (!preview || preview.token !== token)
      throw new AuxError("ref_stale", "Original cloud Preview ownership is unavailable.");
    if (preview.closing) return preview.closing;
    preview.retiring = true;
    const closing = (async () => {
      if (!preview.nativeClosed) {
        const result = await this.deps.native.cloudPreviewClose?.({ previewId, token });
        if (!result?.closed)
          throw new AuxError("backend_unavailable", "Native Preview retirement is not acknowledged.");
        preview.nativeClosed = true;
      }
      await this.deps.hide(preview.binding.listener.port);
      this.previews.delete(previewId);
      this.closed.set(previewId, token);
      if (this.closed.size > 128) this.closed.delete(this.closed.keys().next().value!);
    })();
    preview.closing = closing;
    try {
      await closing;
    } finally {
      if (preview.closing === closing) preview.closing = undefined;
    }
  }
  async closeProcess(processId: string): Promise<void> {
    await this.opening;
    const results = await Promise.allSettled(
      [...this.previews.values()]
        .filter((preview) => preview.binding.processId === processId)
        .map((preview) => this.close(preview.binding.previewId, preview.token)),
    );
    const errors = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (errors.length) throw new AggregateError(errors, "Cloud Preview retirement remains pending.");
  }
  async closeAll(): Promise<void> {
    await this.opening;
    const results = await Promise.allSettled(
      [...this.previews.values()].map((preview) => this.close(preview.binding.previewId, preview.token)),
    );
    const errors = results.flatMap((result) => (result.status === "rejected" ? [result.reason] : []));
    if (errors.length) throw new AggregateError(errors, "Cloud Preview retirement remains pending.");
  }
}
