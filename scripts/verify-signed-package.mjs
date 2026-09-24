#!/usr/bin/env node
// Local release-qualification gate. No publishing or profile mutation.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

if (process.platform !== 'darwin') throw new Error('Signed Aux verification requires macOS.');
const root = resolve(import.meta.dirname, '..');
const release = join(root, 'release');
const directory = process.arch === 'x64' ? 'mac' : `mac-${process.arch}`;
const bundle = resolve(process.argv[2] ?? join(release, directory, 'Aux Browser.app'));
const resources = join(bundle, 'Contents/Resources');
const run = (command, args) => {
  const result = spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (result.error || result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed: ${result.error?.message ?? result.stderr}`);
  return `${result.stdout}${result.stderr}`;
};
assert.ok(existsSync(bundle), `Aux app missing: ${bundle}`);
const plist = JSON.parse(run('plutil', ['-convert', 'json', '-o', '-', join(bundle, 'Contents/Info.plist')]));
assert.equal(plist.CFBundleIdentifier, 'dev.aux.browser');
assert.equal(plist.CFBundleExecutable, 'Aux Browser');
run('codesign', ['--verify', '--deep', '--strict', '--verbose=2', bundle]);
const signature = run('codesign', ['-dv', '--verbose=4', bundle]);
assert.match(signature, /Authority=Developer ID Application:/);
assert.match(signature, /TeamIdentifier=[A-Z0-9]+/);
const team = signature.match(/TeamIdentifier=([A-Z0-9]+)/)?.[1];
if (process.env.AUX_EXPECTED_TEAM_ID) assert.equal(team, process.env.AUX_EXPECTED_TEAM_ID);
for (const name of ['aux-dictation', 'liquid-glass.node']) {
  const binary = join(resources, 'app.asar.unpacked/dist/main', name);
  assert.ok(existsSync(binary), `Native Aux component missing: ${binary}`);
  run('codesign', ['--verify', '--strict', binary]);
}
run('xcrun', ['stapler', 'validate', bundle]);
run('spctl', ['--assess', '--type', 'execute', '--verbose=2', bundle]);
const feed = readFileSync(join(resources, 'app-update.yml'), 'utf8');
assert.match(feed, /provider:\s*generic/);
const url = feed.match(/url:\s*['"]?([^\s'"\n]+)/)?.[1];
assert.ok(url, 'Signed app has no update URL');
const parsed = new URL(url);
assert.equal(parsed.protocol, 'https:');
assert.equal(parsed.username, '');
assert.equal(parsed.password, '');
const metadata = readFileSync(join(release, 'latest-mac.yml'), 'utf8');
assert.match(metadata, /\.zip(?:\s|$)/m);
assert.match(metadata, /sha512:/);
assert.ok(readdirSync(release).some(file => file.endsWith('.dmg')));
assert.ok(readdirSync(release).some(file => file.endsWith('.zip')));
console.log(JSON.stringify({ bundle, bundleId: plist.CFBundleIdentifier, team, feed: parsed.href,
  signed: true, nestedCodeVerified: true, notarized: true, gatekeeperAccepted: true,
  updateMetadataPresent: true, updateDeliveryTested: false }, null, 2));
