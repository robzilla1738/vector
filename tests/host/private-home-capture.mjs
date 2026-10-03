import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { createJourneyApp, readPrivateAppObservation } from './lib/app.mjs';
import { createAxClient } from './lib/ax.mjs';
import { createEvidence } from './lib/evidence.mjs';
import { createPrivateAppearanceProvenance } from './lib/appearance-provenance.mjs';
import { retainPackagedRuntimePair } from './lib/packaged-runtime-pair-artifact.mjs';

// Kept alive on cleanup debt. There is no public authority or cached PID signal.
const quarantined = new Set();
const errorRecord = error => error ? { name: error.name, message: error.message, stack: error.stack } : null;
async function boundedClose(promise) {
  let timer;
  try { return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Original input helper close receipt deadline; artifact retained')), 20000); })]); }
  finally { clearTimeout(timer); }
}
/** Separate observation-only capture, deliberately absent from qualification.
 * Only the integrator's externally approved pair/helper audits admit launch.
 * This function is never invoked merely by importing the module. */
export async function capturePrivateHome({ admission, outputDir }) {
  const directory = resolve(outputDir); mkdirSync(directory, { mode: 0o700 });
  const pair = retainPackagedRuntimePair(admission);
  let app, helper, evidence, primary, helperReceipt, browserReceipt, candidate;
  const steps = [], cleanupFailures = [];
  try {
    app = createJourneyApp({ appPath: pair.bundle, admittedPair: pair });
    await app.startPrivateObservation();
    const owner = readPrivateAppObservation(app, pair); candidate = structuredClone(owner.candidate);
    helper = await createAxClient(owner.pid, { compilerArtifact: pair.compilerArtifact });
    const appearance = createPrivateAppearanceProvenance({ outputDir: directory, app, admittedPair: pair, helper });
    evidence = createEvidence(directory, helper, () => appearance);
    const disclosure = { name: 'Private browsing', match: 'exact', scope: 'shell', index: 0 };
    const search = { name: 'Search or address. Press Tab to switch mode.', match: 'exact', scope: 'shell', index: 0 };
    await helper.waitFor(disclosure, 'visible', 20000);
    await helper.waitFor(search, 'enabled', 20000);
    readPrivateAppObservation(app, pair).assertLive();
    await evidence.capture('private-home-ready', { windowId: owner.windowId, state: 'private-home-ready' });
    steps.push({ name: 'Observed private Home disclosure and enabled search', status: 'passed', ax: await helper.dump() });
    await helper.focus(search);
    assert.equal((await helper.query(search))[0]?.focused, true, 'Private search must accept real native focus');
    await evidence.capture('private-home-search-focused', { windowId: owner.windowId, state: 'private-home-search-focused' });
    steps.push({ name: 'Original private search receives native focus', status: 'passed', ax: await helper.dump() });
    pair.validate();
  } catch (error) { primary = error; }
  finally {
    if (helper) {
      try {
        helperReceipt = await boundedClose(helper.close());
        assert.equal(helperReceipt.reaped, true, 'Original helper is not proven reaped');
        assert.equal(helperReceipt.clean, true, 'Original helper cleanup failed');
      } catch (error) { cleanupFailures.push(error); }
    }
    if (app) {
      try {
        browserReceipt = await app.quit();
        assert.ok(browserReceipt && (browserReceipt.code !== null || browserReceipt.signal !== null), 'Original private browser close receipt missing');
      } catch (error) { cleanupFailures.push(error); }
    }
    if ((!helper || helperReceipt?.reaped) && (!app || browserReceipt)) pair.release();
    else quarantined.add({ pair, app, helper, primary, cleanupFailures });
  }
  const report = { schema: 1, kind: 'aux-private-observation', runtimeStatus: 'inactive-private', qualification: 'none', features: ['electronMigration'],
    productIdentity: pair.productIdentity, native: pair.native, shellDigest: pair.shellDigest,
    ...(candidate ? { harnessCommit: candidate.harnessCommit, moduleSha256: candidate.moduleSha256 } : {}),
    provenanceProducers: { helperSha256: pair.compilerArtifact.artifact.binarySha256, helperSourceSha256: pair.compilerArtifact.artifact.sourceSha256, nativeSnapshotVersion: 1 },
    packagedRuntimeArtifact: pair.artifact, captures: evidence?.captures ?? [], steps,
    error: errorRecord(primary), cleanup: { helper: helperReceipt ? { ...helperReceipt, primary: errorRecord(helperReceipt.primary) } : null, browser: browserReceipt ?? null,
      failures: cleanupFailures.map(errorRecord), artifactRetained: (!helperReceipt?.reaped && !!helper) || (!browserReceipt && !!app) } };
  writeFileSync(join(directory, 'manifest.json'), JSON.stringify(report, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  if (primary || cleanupFailures.length) throw new AggregateError([...(primary ? [primary] : []), ...cleanupFailures], 'Private Home diagnostic capture failed; original manifest retained');
  return report;
}
