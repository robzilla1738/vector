import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdir, mkdtemp, writeFile, chmod, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {readFreshAuxLaunch} from './aux-fresh-launch.mjs';

test('fresh launch uses only the fixed private data/cache/control roots and retains them for reopen', async () => {
 const scope = await mkdtemp('/private/tmp/aux-fresh-browser-');
 try {
  const home = join(scope, 'home'), data = join(home, 'Library/Application Support/Aux');
  const cache = join(home, 'Library/Caches/Aux');
  const app = join(scope, 'Aux.app');
  const resource = join(app, 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources');
  for (const path of [home, data, cache, join(scope, 'control'), join(scope, 'tasks'), resource]) {
   await mkdir(path, {recursive:true, mode:0o700});
  }
  const bundle = {version:1, implementation:'supplied', identityProfile:'aux-v1',
   stateIdentityVersion:2, nativeStartupMode:'ordinary-fresh-v1', finalApp:app};
  const policy = {format:'aux.fresh.bootstrap.policy.v8', role:'daemon',
   canonicalPrivateParent:join(scope, 'control'), canonicalTaskParent:join(scope, 'tasks'),
   browserStartup:{format:'aux.browser.ordinary-root-lease.v1', dataRoot:data, cacheRoot:cache}};
  const file = join(resource, 'AuxFreshBootstrapPolicy.json');
  await writeFile(file, JSON.stringify(policy), {mode:0o600});
  assert.equal((await readFreshAuxLaunch(app, bundle)).profile, data);
  await writeFile(join(data, 'saved-draft.fixture'), 'retained');
  assert.equal((await readFreshAuxLaunch(app, bundle)).scope, scope);
  await writeFile(file, JSON.stringify({...policy, canonicalPrivateParent:home}));
  await assert.rejects(readFreshAuxLaunch(app, bundle), /fixed disposable roots/);
  await writeFile(file, JSON.stringify(policy));
  await chmod(cache, 0o755);
  await assert.rejects(readFreshAuxLaunch(app, bundle), /canonical private directory/);
 } finally {
  await rm(scope, {recursive:true});
 }
});
