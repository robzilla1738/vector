import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { modelFixtureEnvironment } from './model-fixture-environment.mjs';
import { importSourceEnvironment } from './import-source-home.mjs';
test('drops every supported inherited model key without reading values', () => {
 const original = { PATH: '/synthetic/bin', AUX_RUN_ENGINE: 'agent-loop', AUX_HOST_TOKEN: 'fixture-owned' };
 for (const key of ['AI_GATEWAY_API_KEY','OPENAI_API_KEY','ANTHROPIC_API_KEY','GOOGLE_GENERATIVE_AI_API_KEY','OPENAI_COMPATIBLE_API_KEY','AUX_PLANNER_MODEL','AUX_RECOVERY_MODEL','AUX_VISION_MODEL'])
  Object.defineProperty(original,key,{enumerable:true,get(){throw new Error('Excluded value must never be read');}});
 assert.deepEqual(modelFixtureEnvironment(original), { PATH: '/synthetic/bin', AUX_RUN_ENGINE: 'agent-loop', AUX_HOST_TOKEN: 'fixture-owned' });
 assert.ok(Object.hasOwn(original,'AI_GATEWAY_API_KEY'));
});
test('keeps owned source/transport flags and strips explicit model overrides after merging', () => {
 const original = { PATH: '/synthetic/bin', AUX_RUN_ENGINE: 'agent-loop', HTTPS_PROXY: 'http://127.0.0.1:1/' };
 const result = modelFixtureEnvironment(importSourceEnvironment(modelFixtureEnvironment(original), { AUX_PLANNER_MODEL: 'synthetic-external', OPENAI_API_KEY: 'synthetic-key' }));
 assert.deepEqual(result,original);
});
test('does not widen existing source-home env admission', () => {
 assert.throws(() => importSourceEnvironment(modelFixtureEnvironment({}), { AUX_IMPORT_SOURCE_HOME: '/foreign' }));
});
test('actual App sends the same hermetic environment to child and original LS helper', () => {
 const source=readFileSync(new URL('./app.mjs',import.meta.url),'utf8');
 assert.ok(source.includes('modelFixtureEnvironment(importSourceEnvironment(modelFixtureEnvironment(process.env), launch.env))'));
 assert.ok(source.includes('env: { ...env, AUX_NATIVE_SLOT_TOKEN: slot.token }'));
 assert.ok(source.includes('helper.stdin.end(JSON.stringify({ ...env, AUX_NATIVE_SLOT_TOKEN: slot.token }))'));
});
