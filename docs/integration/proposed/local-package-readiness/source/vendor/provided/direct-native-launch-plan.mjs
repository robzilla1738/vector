/** Derive argv only. Does not validate signatures, grant authority, or launch. */
import { createHash } from 'node:crypto';
import path from 'node:path';

const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const normalizedAbsolute = value => typeof value === 'string' &&
  path.isAbsolute(value) && path.normalize(value) === value;
const digest = value => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

export function directNativeLaunchPlan(handoffBytes, expectedSha256) {
  if (!Buffer.isBuffer(handoffBytes) || !digest(expectedSha256) ||
      hash(handoffBytes) !== expectedSha256) {
    throw Error('Exact accepted handoff bytes/hash required');
  }
  const handoff = JSON.parse(handoffBytes.toString('utf8'));
  if (handoff.version !== 1 ||
      handoff.kind !== 'inherited-signed-preview-launch-handoff' ||
      handoff.authorityProofInherited !== true ||
      !digest(handoff.receiptSha256) || !digest(handoff.scope)) {
    throw Error('Existing inherited authority handoff required');
  }
  const { app, home, profile, scope } = handoff;
  if (![app, home, profile].every(normalizedAbsolute) ||
      path.basename(app) !== 'Aux.app' ||
      profile !== path.join(home, 'preview-profile-local-browser-pass') ||
      hash(home) !== scope) {
    throw Error('Original explicit app/home/profile/scope required');
  }
  const originalCommand = ['node', 'scripts/aux.mjs', '--home', home,
    '--profile', profile, '--app', app, '--', '--new-window', 'chrome://newtab/'];
  if (JSON.stringify(handoff.command) !== JSON.stringify(originalCommand)) {
    throw Error('Unchanged reviewed preview command required');
  }
  const environment = handoff.environment;
  if (!environment || environment.HOME !== home ||
      environment.CFFIXED_USER_HOME !== home ||
      environment.AUX_ENABLE_PROVIDED_NATIVE_CARRIER !== '1' ||
      environment.AUX_NATIVE_KEYCHAIN_SCOPE !== scope ||
      Object.keys(environment).sort().join(',') !==
          ['AUX_ENABLE_PROVIDED_NATIVE_CARRIER', 'AUX_NATIVE_KEYCHAIN_SCOPE',
            'CFFIXED_USER_HOME', 'HOME'].sort().join(',')) {
    throw Error('Unchanged reviewed preview environment required');
  }
  const removeEnvironment = ['AUX_ENABLE_PROVIDED_AGENT_INBOX_KEYCHAIN',
    'AUX_PROVIDED_DP_PROBE', 'AUX_DP_PROBE_APPROVED',
    'AUX_DP_PROBE_OPERATION', 'AUX_PROVIDED_NATIVE_LOAD_ONLY'];
  if (JSON.stringify(handoff.removeEnvironment) !== JSON.stringify(removeEnvironment)) {
    throw Error('Original runtime/probe exclusions required');
  }
  return {
    version: 1,
    kind: 'direct-native-preview-launch-plan',
    parentHandoffSha256: expectedSha256,
    receiptPath: handoff.receiptPath,
    receiptSha256: handoff.receiptSha256,
    requiresAcceptedReceiptValidation: true,
    app, home, profile, scope,
    command: [path.join(app, 'Contents/MacOS/Aux'), `--user-data-dir=${profile}`,
      '--no-first-run', '--no-default-browser-check', '--use-mock-keychain',
      '--new-window', 'chrome://newtab/'],
    // The old Node launcher supplied AUX_HOME; native startup uses it directly.
    environment: { ...environment, AUX_HOME: home },
    removeEnvironment: [...removeEnvironment],
    processLifetimeOwnerRequired: true,
    installed: false,
    launched: false,
    authorityOperationsPerformed: false,
  };
}
