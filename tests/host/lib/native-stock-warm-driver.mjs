import { collectWarmWindows } from './native-warm-cohort.mjs';
import { createStockWarmTrialFactory } from './native-stock-warm-trial.mjs';
export async function measureStockWarmWindows({candidate, trialConfiguration, signal, trials = 20}) {
  return collectWarmWindows('stock', {candidate, signal, trials, openTrial:createStockWarmTrialFactory(trialConfiguration)});
}
