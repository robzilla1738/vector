/** Named, bounded timing policies for host-neutral reliability work. */
export async function withDeadline<T>(
  work: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  parent?: AbortSignal,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) throw new Error("Deadline must be positive");
  if (parent?.aborted) throw parent.reason ?? new Error("cancelled");
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let rejectDeadline: ((error: unknown) => void) | undefined;
  const deadline = new Promise<never>((_resolve, reject) => {
    rejectDeadline = reject;
  });
  const abort = (reason: unknown) => {
    controller.abort(reason);
    rejectDeadline?.(reason);
  };
  const onParentAbort = () => abort(parent?.reason ?? new Error("cancelled"));
  parent?.addEventListener("abort", onParentAbort, { once: true });
  timer = setTimeout(() => abort(new Error("deadline_exceeded")), timeoutMs);
  try {
    return await Promise.race([work(controller.signal), deadline]);
  } finally {
    clearTimeout(timer);
    parent?.removeEventListener("abort", onParentAbort);
  }
}
