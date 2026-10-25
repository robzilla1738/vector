import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, writeFile, readdir, rm} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readNativeUserAuxLaunch} from './aux-user-launch.mjs';
import {assertAuxLaunchIdentity, assertNativeUserAuxLaunchIdentity} from './aux-launch-identity.mjs';

test('native-user attempt is distinct from legacy acceptance and fixed disposable startup', () => {
  const bundle = {version:1, implementation:'supplied', identityProfile:'aux-v1',
    stateIdentityVersion:2, nativeStartupMode:'ordinary-user-v1'};
  assert.equal(assertNativeUserAuxLaunchIdentity(bundle).service, 'aux-daemon');
  assert.throws(() => assertAuxLaunchIdentity(bundle), /unaccepted migration/);
  for (const delta of [{stateIdentityVersion:1}, {nativeStartupMode:'ordinary-fresh-v1'},
    {identityProfile:'compatibility'}]) {
    assert.throws(() => assertNativeUserAuxLaunchIdentity({...bundle, ...delta}));
  }
});

test('package preflight never selects user roots, and launcher overrides refuse before state creation', async () => {
  const scope = await mkdtemp('/private/tmp/aux-user-launch-fixture-');
  try {
    const app = join(scope, 'Aux.app');
    const resource = join(app, 'Contents/Resources/aux');
    const daemon = join(resource, 'apps/daemon/Aux Daemon.app/Contents/Resources');
    await mkdir(daemon, {recursive:true, mode:0o700});
    const bundle = {version:1, implementation:'supplied', identityProfile:'aux-v1',
      stateIdentityVersion:2, nativeStartupMode:'ordinary-user-v1'};
    const policy = {format:'aux.fresh.bootstrap.policy.v9', role:'daemon',
      accessGroup:'9F2JXY8TCK.dev.aux.local', authoritySelection:'aux.fresh.authority.host-availability.v1',
      nativeHostLayout:'embedded-daemon', taskLayout:'aux.native.task-control-split.v1',
      storageLocation:{format:'aux.current-os-user-location.v1'}};
    const path = join(daemon, 'AuxFreshBootstrapPolicy.json');
    await writeFile(join(resource, 'bundle.json'), JSON.stringify(bundle), {mode:0o600});
    await writeFile(path, JSON.stringify(policy), {mode:0o600});
    assert.deepEqual(await readNativeUserAuxLaunch(app, bundle), {
      identity:{identityProfile:'aux-v1', stateIdentityVersion:2, service:'aux-daemon'}});
    const script = fileURLToPath(new URL('../aux.mjs', import.meta.url));
    for (const extra of [['--temp-profile'], ['--home', join(scope, 'forbidden-home')],
      ['--profile', join(scope, 'forbidden-profile')], ['--no-browser'], ['--', '--user-data-dir=forbidden']]) {
      const result = spawnSync(process.execPath, [script, '--app', app, ...extra], {encoding:'utf8'});
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /native-user candidate/);
      assert.deepEqual(await readdir(scope), ['Aux.app']);
    }
    await writeFile(path, JSON.stringify({...policy, canonicalPrivateParent:scope}));
    await assert.rejects(readNativeUserAuxLaunch(app, bundle), /fixed native-user location policy/);
    await writeFile(path, JSON.stringify({...policy, storageLocation:{...policy.storageLocation, home:scope}}));
    await assert.rejects(readNativeUserAuxLaunch(app, bundle), /fixed native-user location policy/);
  } finally {
    await rm(scope, {recursive:true});
  }
});
