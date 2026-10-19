import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { AgentEngine } from '@aux/agent';
import { initTRPC } from '@trpc/server';
import type { DaemonServices } from '../http/server.js';
import {
  type AvailableSubagentModel,
  createSubagentConfiguration,
} from './index.js';

function fixture() {
  const values = new Map<string, unknown>();
  const t = initTRPC.create();
  const store = {
    requireAccount: (id: number) => assert.ok([1, 2].includes(id)),
    get: (id: number, namespace: string, key: string) =>
      structuredClone(values.get(`${id}:${namespace}:${key}`) ?? null),
    set: (id: number, namespace: string, key: string, value: unknown) => {
      values.set(`${id}:${namespace}:${key}`, structuredClone(value));
    },
  };
  let models: AvailableSubagentModel[] = [
    {
      provider: 'custom-fixture',
      modelId: 'text-model',
      thinkingLevels: [],
      inputModalities: ['text'],
    },
    {
      provider: 'custom-fixture',
      modelId: 'visual-model',
      thinkingLevels: ['low', 'high'],
      inputModalities: ['text', 'image'],
    },
  ];
  const factory = createSubagentConfiguration(
    { store, procedure: t.procedure, t } as unknown as DaemonServices,
    {} as AgentEngine,
    () => models,
  );
  const caller = factory.router.createCaller({} as never);
  return {
    factory,
    caller,
    setModels: (next: AvailableSubagentModel[]) => {
      models = next;
    },
  };
}
const profile = {
  id: 'custom-review',
  name: 'Review',
  instructions: 'Review the supplied evidence.',
  context: 'fresh' as const,
  readOnly: true,
  allowedTools: ['read_file', 'page_view'],
};
test('account profiles are bounded, reject privilege fields/tool escapes and return detached child snapshots', async () => {
  const f = fixture();
  await f.caller.setProfile({ accountId: 1, profile, createOnly: true });
  assert.equal((await f.caller.list({ accountId: 2 })).profiles.length, 0);
  await assert.rejects(
    f.caller.setProfile({ accountId: 1, profile, createOnly: true }),
    /already exists/,
  );
  for (const tool of [
    'subagent',
    'ask_user_question',
    'request_action_confirmation',
    'invented_tool',
  ])
    await assert.rejects(
      f.caller.setProfile({
        accountId: 1,
        profile: { ...profile, allowedTools: [tool] },
      }),
      /catalog/,
    );
  await assert.rejects(
    f.caller.setProfile({
      accountId: 1,
      profile: { ...profile, permissionMode: 'full-access' } as never,
    }),
  );
  const callback = f.factory.customSubagentProfile;
  if (!callback) throw new Error('Missing callback');
  const copied = callback(1, profile.id);
  assert.ok(copied);
  copied.allowedTools?.push('bash');
  assert.deepEqual(callback(1, profile.id)?.allowedTools, profile.allowedTools);
  assert.deepEqual(Object.keys(copied).sort(), [
    'allowedTools',
    'context',
    'id',
    'instructions',
    'readOnly',
  ]);
  await f.caller.setProfile({
    accountId: 1,
    profile: {
      ...profile,
      context: 'forked',
      readOnly: false,
      allowedTools: ['write_file'],
    },
  });
  assert.equal(copied.context, 'fresh');
  assert.equal(callback(1, profile.id)?.context, 'forked');
  await f.caller.removeProfile({ accountId: 1, profileId: profile.id });
  assert.equal(callback(1, profile.id), undefined);
  assert.equal(copied.instructions, profile.instructions);
});
test('routing validates available models, advertised effort/fast/image capabilities and rechecks future children', async () => {
  const f = fixture();
  const text = {
    provider: 'custom-fixture',
    modelId: 'text-model',
    thinkingLevel: 'off' as const,
    fastMode: false,
  };
  const visual = {
    provider: 'custom-fixture',
    modelId: 'visual-model',
    thinkingLevel: 'high' as const,
    fastMode: false,
  };
  await f.caller.setRouting({ accountId: 1, routing: { fast: text, visual } });
  const callback = f.factory.subagentModel;
  if (!callback) throw new Error('Missing callback');
  assert.deepEqual(await callback(1, 'visual'), visual);
  await assert.rejects(
    f.caller.setRouting({
      accountId: 1,
      routing: { deep: { ...text, thinkingLevel: 'high' } },
    }),
    /thinking level/,
  );
  await assert.rejects(
    f.caller.setRouting({
      accountId: 1,
      routing: { fast: { ...text, fastMode: true } },
    }),
    /fast mode/,
  );
  await assert.rejects(
    f.caller.setRouting({ accountId: 1, routing: { visual: text } }),
    /image input/,
  );
  await assert.rejects(
    f.caller.setRouting({
      accountId: 1,
      routing: { standard: { ...text, modelId: 'missing' } },
    }),
    /currently configured/,
  );
  assert.deepEqual((await f.caller.list({ accountId: 1 })).routing, {
    fast: text,
    visual,
  });
  f.setModels([]);
  await assert.rejects(
    async () => callback(1, 'visual'),
    /currently configured/,
  );
  await f.caller.setRouting({ accountId: 1, routing: { visual: null } });
  await assert.rejects(async () => callback(1, 'visual'), /Choose a model/);
});
