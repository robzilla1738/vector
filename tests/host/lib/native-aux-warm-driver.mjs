import { serializeWarmCohortReport } from './native-warm-report.mjs';
import { createAuxWarmTrialFactory } from './native-aux-warm-trial.mjs';
import { collectAuxWarmWindows } from './native-aux-warm-cohort.mjs';
/** Dedicated actual caller. This is invoked only by the sole authorized native
 * operator with independently admitted artifacts. Importing it performs no
 * launch, input, power check or measurement. The existing collector requires
 * ≥20 actual AC samples and preserves raw hardware intervals and cleanup debt. */
export async function measureAuxWarmWindows({candidate, trialConfiguration, signal, trials=20}) {
  return collectAuxWarmWindows({candidate, signal, trials,
    openTrial:createAuxWarmTrialFactory(trialConfiguration)});
}

/** Persistence boundary for the sole native operator. The raw report/error stays
 * original; explicit graph bytes are separate and never become timing authority. */
export async function captureAuxWarmWindowReport(configuration) {
  let originalReport;
  try {
    originalReport=await measureAuxWarmWindows(configuration);
    return {report:originalReport,serializedReport:serializeWarmCohortReport(originalReport)};
  } catch(primary) {
    if (originalReport !== undefined) {
      primary.originalWarmReport=originalReport;
      primary.reportPersistenceProven=false;
      throw primary;
    }
    try { primary.serializedWarmReport=serializeWarmCohortReport(primary.report ?? {status:'failed',primary}); }
    catch(serializationFailure) { primary.reportSerializationFailure=serializationFailure; }
    throw primary;
  }
}
