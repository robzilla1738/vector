// Repeatable, bounded M1 host evidence. A reference Chromium run is never a host pass.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../..');
const artifactDir = join(root, 'release/test-artifacts');
mkdirSync(artifactDir, { recursive: true });
const commands = [
  ['electron.shell-tabs', 'tests/smoke/tab-groups.mjs', 90_000],
  ['electron.unpacked-extension-lifecycle', 'tests/smoke/extensions-desktop.mjs', 120_000],
  ['electron.extension-apis-and-virtual-webauthn', 'tests/smoke/browser-compatibility-desktop.mjs', 90_000],
  ['electron.agent-control-and-private-boundary', 'tests/smoke/internal-cdp-direct.mjs', 120_000],
  ['electron.two-regular-profile-isolation', 'tests/smoke/two-profiles-desktop.mjs', 120_000],
  ['electron.foreground-input-paint', 'tests/smoke/command-bar-paint-desktop.mjs', 90_000],
  ['electron.restore-20-tabs', 'tests/smoke/restore-tabs-desktop.mjs', 120_000, { AUX_RUNS: '3', AUX_TABS: '20' }],
  ['electron.restore-100-tabs', 'tests/smoke/restore-tabs-desktop.mjs', 180_000, { AUX_RUNS: '3', AUX_TABS: '100' }],
  ['chromium-reference.synthetic-extension-apis', 'tests/smoke/chromium-extension-baseline.mjs', 90_000],
];
const startedAt = new Date().toISOString();
const sha = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).stdout.trim();
const signingIdentities = process.platform === 'darwin'
  ? spawnSync('security', ['find-identity', '-v', '-p', 'codesigning'], { encoding: 'utf8' }).stdout
  : '';
const results = [];
for (const [id, script, timeoutMs, extraEnv = {}] of commands) {
  const start = Date.now();
  const run = spawnSync(process.execPath, [join(root, script)], {
    cwd: root, env: { ...process.env, ...extraEnv }, encoding: 'utf8', timeout: timeoutMs,
    maxBuffer: 1024 * 1024,
  });
  const result = { id, command: `node ${script}`, timeoutMs, durationMs: Date.now() - start,
    status: run.error?.code === 'ETIMEDOUT' ? 'timeout' : run.status === 0 ? 'pass' : 'fail',
    exitCode: run.status, signal: run.signal, error: run.error?.message ?? null,
    output: `${run.stdout ?? ''}${run.stderr ?? ''}`.trim().slice(-12_000) };
  results.push(result);
  console.log(`${id}: ${result.status} (${result.durationMs} ms)`);
}
const readArtifact = name => {
  const path = join(artifactDir, name);
  if (!existsSync(path)) return null;
  const parsed = JSON.parse(readFileSync(path, 'utf8'));
  return parsed.at >= startedAt ? parsed : null;
};
const report = { schema: 1, startedAt, completedAt: new Date().toISOString(), sourceSha: sha,
  scope: 'Current Aux source in disposable local profiles. Synthetic tests and unsigned development Electron; Chromium is a reference, not an Aux fork.',
  results,
  probes: {
    electron: readArtifact('aux-browser-compatibility.json'),
    chromiumReference: readArtifact('aux-chromium-extension-baseline.json'),
  },
  candidateAvailability: {
    cefChromeLayer: { executable: existsSync('/tmp/aux-host-dev/Aux Host Candidate.app/Contents/MacOS/Aux Host Candidate'),
      priorFinding: 'The pinned CEF 152 prototype rendered but Cmd+T opened stock Chrome chrome outside the Aux shell; see experiments/cef-shell/README.md. No current binary was available for this run.' },
    chromeFork: { checkout: false, reason: 'No Aux //chrome fork or candidate launch command is checked into this repository. Full Chromium reference results are not fork results.' },
  },
  localPrerequisites: {
    onePasswordAppInstalled: existsSync('/Applications/1Password.app'),
    developerIdApplicationIdentityAvailable: signingIdentities.includes('Developer ID Application:'),
    currentPackageConfiguredUnsigned: readFileSync(join(root, 'apps/desktop/electron-builder.yml'), 'utf8').includes('identity: null'),
  },
  externalGates: {
    chromeWebStoreInstallUpdate: 'not run in signed Aux or any candidate',
    onePasswordSaveFillUnlock: 'not run; requires installed 1Password, account, Store extension and signed candidate',
    nativePasskeyAndSso: 'not run; virtual WebAuthn only',
    signedUpdatesAndRebase: 'not run; no distribution signing/update lane or maintained fork',
  },
};
const output = join(artifactDir, 'aux-host-comparison.json');
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`);
console.log(`Wrote ${output}`);
if (results.some(result => result.status !== 'pass')) process.exitCode = 1;
