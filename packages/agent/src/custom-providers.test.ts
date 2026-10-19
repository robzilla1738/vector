import assert from 'node:assert/strict';
import {
  chmodSync,
  mkdtempSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { CustomProviders } from './custom-providers.js';
import type { AgentStorage } from './storage.js';

function fixture() {
  const home = mkdtempSync(join(tmpdir(), 'aux-custom-providers-'));
  const store = {
    home,
    requireAccount: (id: number) => {
      assert.ok([1, 2].includes(id));
    },
    accountHome: (id: number) => join(home, String(id)),
  } as AgentStorage;
  return {
    home,
    providers: new CustomProviders(store),
    close: () => rmSync(home, { recursive: true, force: true }),
  };
}
const model = {
  id: 'fixture-model',
  name: 'Fixture model',
  inputModalities: ['text', 'image', 'pdf'],
  contextWindow: 128000,
  outputLimit: 8192,
  reasoning: true,
  thinkingLevels: ['off', 'low', 'high'],
  thinkingLevelMapping: { off: 'none', low: 'low', high: 'high' },
  costs: { inputPerMillion: 0.1, outputPerMillion: 0.2 },
};
const config = {
  name: 'Fixture provider',
  baseUrl: 'https://example.invalid/v1',
  apiStyle: 'openai-responses',
  models: [model],
};
test('one private snapshot preserves write-only secrets, metadata and account isolation', () => {
  const f = fixture();
  try {
    const rows = f.providers.set(1, {
      'custom-fixture': {
        ...config,
        apiKey: 'fixture-secret-api',
        headers: {
          Authorization: 'fixture-header-secret',
          'X-Tenant': 'fixture-tenant',
        },
      },
    });
    const publicText = JSON.stringify(rows);
    assert.equal(publicText.includes('fixture-secret-api'), false);
    assert.equal(publicText.includes('fixture-header-secret'), false);
    assert.equal(publicText.includes('fixture-tenant'), false);
    assert.deepEqual(rows[0]?.headerNames, ['Authorization', 'X-Tenant']);
    assert.deepEqual(rows[0]?.models, [model]);
    assert.equal(rows[0]?.hasApiKey, true);
    assert.equal(
      statSync(join(f.home, '1/custom-provider-secrets.json')).mode & 0o777,
      0o600,
    );
    assert.deepEqual(f.providers.list(2), []);
    f.providers.set(1, {
      'custom-fixture': {
        ...config,
        preserveHeaderNames: ['authorization', 'X-Tenant'],
      },
    });
    assert.equal(
      f.providers.resolve(1, 'custom-fixture').apiKey,
      'fixture-secret-api',
    );
    assert.equal(
      f.providers.resolve(1, 'custom-fixture').headers.Authorization,
      'fixture-header-secret',
    );
    assert.equal(
      f.providers.redact(
        1,
        'fixture-secret-api fixture-header-secret fixture-tenant',
      ),
      '[redacted] [redacted] [redacted]',
    );
    f.providers.set(1, {
      'custom-fixture': {
        ...config,
        removeApiKey: true,
        preserveHeaderNames: ['X-Tenant'],
      },
    });
    assert.equal(f.providers.resolve(1, 'custom-fixture').apiKey, undefined);
    assert.deepEqual(f.providers.get(1, 'custom-fixture')?.headerNames, [
      'X-Tenant',
    ]);
    assert.deepEqual(f.providers.remove(1, 'custom-fixture'), {
      removed: true,
    });
    assert.equal(f.providers.get(1, 'custom-fixture'), null);
    assert.throws(() => f.providers.resolve(1, 'custom-fixture'), /Configure/);
  } finally {
    f.close();
  }
});
test('whole-batch validation preserves the original snapshot on conflict or invalid metadata', () => {
  const f = fixture();
  try {
    f.providers.set(1, { 'custom-fixture': config });
    assert.throws(
      () =>
        f.providers.set(1, {
          'custom-fixture': { ...config, createOnly: true },
        }),
      /already configured/,
    );
    const path = join(f.home, '1/custom-provider-secrets.json'),
      before = readFileSync(path, 'utf8');
    assert.throws(
      () =>
        f.providers.set(1, {
          'custom-fixture': { ...config, name: 'Changed' },
          'custom-another': { ...config, preserveHeaderNames: ['missing'] },
        }),
      /preserved header/,
    );
    assert.equal(readFileSync(path, 'utf8'), before);
    for (const bad of [
      { ...config, baseUrl: 'http://outside.invalid' },
      { ...config, baseUrl: 'https://user:secret@example.invalid/v1' },
      { ...config, baseUrl: 'https://example.invalid/#fragment' },
      { ...config, headers: { constructor: 'fixture-secret' } },
      { ...config, models: [model, model] },
      { ...config, models: [{ ...model, reasoning: false }] },
      {
        ...config,
        models: [
          { ...model, thinkingLevelMapping: { high: 'invented-effort' } },
        ],
      },
    ])
      assert.throws(() => f.providers.set(1, { 'custom-fixture': bad }));
    assert.throws(() => f.providers.set(1, { openai: config }));
    assert.equal(readFileSync(path, 'utf8'), before);
    f.providers.set(1, {
      'custom-local': {
        ...config,
        apiStyle: 'openai-compatible',
        baseUrl: 'http://127.0.0.1:9999/v1',
        models: [
          { ...model, thinkingLevelMapping: { high: 'provider-specific' } },
        ],
      },
    });
    assert.equal(
      f.providers.resolve(1, 'custom-local').models[0]?.thinkingLevelMapping
        ?.high,
      'provider-specific',
    );
  } finally {
    f.close();
  }
});
test('unsafe owner-file permissions, symbolic links and malformed snapshots fail closed', () => {
  const f = fixture();
  try {
    f.providers.set(1, { 'custom-fixture': config });
    const path = join(f.home, '1/custom-provider-secrets.json');
    chmodSync(path, 0o644);
    assert.throws(() => f.providers.list(1), /owner-only/);
    chmodSync(path, 0o600);
    renameSync(path, `${path}.real`);
    symlinkSync(`${path}.real`, path);
    assert.throws(() => f.providers.list(1), /unavailable or invalid/);
    unlinkSync(path);
    renameSync(`${path}.real`, path);
    writeFileSync(path, 'invalid-json', { mode: 0o600 });
    assert.throws(
      () => f.providers.set(1, { 'custom-fixture': config }),
      /unavailable or invalid/,
    );
    assert.equal(readFileSync(path, 'utf8'), 'invalid-json');
  } finally {
    f.close();
  }
});
