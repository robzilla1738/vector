import type { AuxBridge } from "./bridge";

const transientFailures = new Set([
  "unavailable: Appearance target is unavailable",
  "unavailable: Native appearance is unavailable",
  "unavailable: Appearance document changed",
  "unavailable: Appearance window changed",
]);

/** Fixed native readback only; production never advertises this method. */
export function startNativeAppearanceObserver(host: Pick<AuxBridge, "appearanceSnapshot">) {
  return observeNativeAppearance(() => host.appearanceSnapshot(), transientFailures);
}

/** The private child getter has no public bridge member or caller selector. */
export function startNativePipAppearanceObserver(read: () => Promise<unknown>) {
  return observeNativeAppearance(
    read,
    new Set([
      "unavailable: PiP appearance shell changed",
      "unavailable: PiP appearance owner is unavailable",
    ]),
    "unavailable: PiP appearance owner changed or is absent",
  );
}

function observeNativeAppearance(
  read: () => Promise<unknown>,
  transient: ReadonlySet<string>,
  absent?: string,
) {
  let live = true,
    failures = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const sample = async () => {
    if (!live) return;
    try {
      await read();
      failures = 0;
    } catch (error) {
      // Retry only actual native stability refusals. Every missing observation
      // still fails capture; authorization, schema and emission limits stop us.
      if (
        !(error instanceof Error) ||
        (error.message !== absent && (!transient.has(error.message) || ++failures >= 20))
      ) {
        live = false;
      }
    }
    if (live)
      timer = setTimeout(() => {
        void sample();
      }, 500);
  };
  void sample();
  return () => {
    live = false;
    clearTimeout(timer);
  };
}
