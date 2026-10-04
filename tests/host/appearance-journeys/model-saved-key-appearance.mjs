import { requireModelSavedKeyAppearance, captureModelSavedKeyAppearance, MODEL_SAVED_KEY_APPEARANCE_ID } from '../lib/model-saved-key-appearance.mjs';
import { configureOriginalDisposableCredentialModel } from '../lib/disposable-model-credential-configure.mjs';
export const journey = { id: MODEL_SAVED_KEY_APPEARANCE_ID, title: 'Models fixed disposable saved credential appearance',
  needs: ['accessibility', 'screen-recording'], launch: {}, timeoutMs: 150000, owner: 'Trust' };
export async function run(t) {
  requireModelSavedKeyAppearance({ journeyId: journey.id, appearance: t.appearanceEnabled, pair: t.credentialPair });
  t.signal.throwIfAborted();
  await t.step('configure original loopback before read-only saved Models appearance', { kind: 'ui', rationale: 'Retain the genuine saved receipt and masked UI without Save/removal consent or provider requests' }, async () => {
    await configureOriginalDisposableCredentialModel({ app: t.app, pair: t.credentialPair, endpointLease: t.credentialEndpoint, rpc: t.rpc });
    return captureModelSavedKeyAppearance(t);
  });
}
