import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { openDb, Repo } from '../../../apps/runtime/dist/index.js';
import { SettingsService } from '../../../apps/runtime/dist/services/settings.js';
import { modelFixtureEnvironment } from './model-fixture-environment.mjs';
test('genuine Settings stays unconfigured until explicit loopback setup despite inherited synthetic credentials', async () => {
 const dir=mkdtempSync(join(tmpdir(),'aux-model-hermetic-control-'));
 const repo=new Repo(openDb(':memory:'));
 try {
  const inherited={AI_GATEWAY_API_KEY:'synthetic-only',AUX_PLANNER_MODEL:'synthetic-external'};
  const original=new SettingsService(repo,join(dir,'original.json'),inherited);
  assert.equal(original.all().modelConfigured,true,'Original inherited fixture reproduces unwanted configured state');
  const settings=new SettingsService(repo,join(dir,'owned.json'),modelFixtureEnvironment(inherited));
  assert.equal(settings.all().modelConfigured,false);
  await settings.set({modelProvider:'openai-compatible',compatibleEndpoint:'http://127.0.0.1:1/v1',plannerModel:'synthetic-loopback'});
  assert.equal(settings.all().modelConfigured,true);
  assert.equal(settings.all().modelProvider,'openai-compatible');
 } finally {repo.close();rmSync(dir,{recursive:true,force:true});}
});
