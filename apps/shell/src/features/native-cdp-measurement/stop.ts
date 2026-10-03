/** Fixed native fixture bridge; measurement does not grant Stop authority. */
declare global {
  interface Window {
    __auxNativeMeasuredStop?: (originalEvent: Event, runId: string) => Promise<void>;
  }
}

/**
 * Called synchronously by the original registered control callback. Keep the
 * outer control token/pending/error/finally owner and its original Promise.
 * Keyboard and programmatic invocations never manufacture an input event.
 */
export function performStopWork(
  runId: string,
  originalEvent: Event | undefined,
  ordinaryStopWork: () => Promise<unknown>,
): Promise<unknown> {
  const binding = window.__auxNativeMeasuredStop;
  if (originalEvent && binding) return binding(originalEvent, runId);
  return ordinaryStopWork();
}
