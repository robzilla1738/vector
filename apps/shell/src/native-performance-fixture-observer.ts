const operations = new Set([
  "prepareCdpStopMeasurement",
  "prepareCdpTakeoverMeasurement",
  "completeCdpRetirementMeasurement",
  "prepareGuestSplitDropPresentation",
  "prepareGuestDividerFramePresentation",
  "prepareGuestTabSwitchPresentation",
  "completeGuestPresentation",
  "prepareAuxWarmWindow",
  "completeAuxWarmWindow",
  "prepareLittleWindowPresentation",
  "completeLittleWindowPresentation",
  "sampleShellMemory",
  "prepareOrganizationAutoArchiveWork",
  "prepareOrganizationLiveFolderWork",
  "completeOrganizationWork",
]);

/** Private owned-fixture long poll; no timers, selectors, effects or public RPC. */
export function startNativePerformanceFixtureObserver(request: (method: string) => Promise<unknown>) {
  let live = true,
    sequence = 0;
  const run = async () => {
    try {
      while (live && sequence < 4000) {
        const next = await request("performanceFixtureNextRequest");
        if (!live) return;
        if (!next || typeof next !== "object" || Array.isArray(next)) return;
        const value = next as Record<string, unknown>;
        if (
          Object.keys(value).sort().join(",") !== "operation,sequence" ||
          typeof value.operation !== "string" ||
          !operations.has(value.operation) ||
          value.sequence !== String(sequence + 1)
        )
          return;
        sequence++;
        // Native emits the genuine reply with sequence before this resolves.
        // Physical input is performed by the harness only after actual Ready.
        await request(value.operation);
      }
    } catch {
      // Missing/refused private observation cannot produce any measurements.
    }
  };
  void run();
  return () => {
    live = false;
  };
}
