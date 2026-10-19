import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { generateText } from 'ai';
import { Store } from '../../../apps/daemon/src/storage/store.js';
import { contextBudget } from './compaction.js';
import { Credentials } from './credentials.js';
import { CustomProviders } from './custom-providers.js';
import {
  modelCallSettings,
  resolveModel,
  type Selection,
} from './providers.js';
import { createSchema, type Session } from './types.js';

test('custom model adapters apply actual style, private headers, limits and effort mappings without ambient keys', async () => {
  const home = mkdtempSync(join(tmpdir(), 'aux-custom-runtime-'));
  const store = new Store(home);
  const accountId = store.current();
  const providers = new CustomProviders(store);
  const credentials = new Credentials(store);
  const previousFetch = globalThis.fetch;
  try {
    for (const apiStyle of ['openai-compatible', 'openai-responses'] as const) {
      const provider = `custom-${apiStyle}`;
      providers.set(accountId, {
        [provider]: {
          name: 'Fixture',
          baseUrl: 'http://127.0.0.1:65534/v1',
          apiStyle,
          headers: { 'X-Fixture': 'private-header-value' },
          models: [
            {
              id: 'fixture-model',
              inputModalities: ['text', 'image'],
              contextWindow: 8192,
              outputLimit: 17,
              reasoning: true,
              thinkingLevels: ['low'],
              thinkingLevelMapping: {
                low: apiStyle === 'openai-compatible' ? 'vendor-low' : 'low',
              },
            },
          ],
        },
      });
      const selection: Selection = {
        provider,
        modelId: 'fixture-model',
        thinkingLevel: 'low',
        fastMode: false,
      };
      let requests = 0;
      globalThis.fetch = async (input, init) => {
        requests++;
        const url = new URL(String(input));
        assert.equal(url.origin, 'http://127.0.0.1:65534');
        const headers = new Headers(init?.headers);
        assert.equal(headers.get('authorization'), null);
        assert.equal(headers.get('x-fixture'), 'private-header-value');
        const body = JSON.parse(String(init?.body));
        assert.equal(body.model, selection.modelId);
        if (apiStyle === 'openai-compatible') {
          assert.equal(url.pathname, '/v1/chat/completions');
          assert.equal(body.max_tokens, 17);
          assert.equal(body.reasoning_effort, 'vendor-low');
          return Response.json({
            id: 'fixture',
            object: 'chat.completion',
            created: 0,
            model: selection.modelId,
            choices: [
              {
                index: 0,
                message: { role: 'assistant', content: 'Fixture completed.' },
                finish_reason: 'stop',
              },
            ],
            usage: { prompt_tokens: 2, completion_tokens: 2, total_tokens: 4 },
          });
        }
        assert.equal(url.pathname, '/v1/responses');
        assert.equal(body.max_output_tokens, 17);
        assert.equal(body.reasoning.effort, 'low');
        return Response.json({
          id: 'fixture',
          created_at: 0,
          status: 'completed',
          model: selection.modelId,
          output: [
            {
              type: 'message',
              id: 'fixture-message',
              role: 'assistant',
              status: 'completed',
              content: [
                {
                  type: 'output_text',
                  text: 'Fixture completed.',
                  annotations: [],
                },
              ],
            },
          ],
          usage: { input_tokens: 2, output_tokens: 2, total_tokens: 4 },
        });
      };
      const result = await generateText({
        model: resolveModel(store, credentials, accountId, selection),
        ...modelCallSettings(store, accountId, selection),
        prompt: 'Synthetic fixture only.',
        maxRetries: 0,
      });
      assert.equal(result.text, 'Fixture completed.');
      assert.equal(requests, 1);
      assert.equal(
        credentials.redact(accountId, 'value private-header-value'),
        'value [redacted]',
      );
      assert.throws(
        () =>
          modelCallSettings(store, accountId, {
            ...selection,
            thinkingLevel: 'high',
          }),
        /supported/,
      );
      assert.throws(
        () =>
          resolveModel(store, credentials, accountId, {
            ...selection,
            modelId: 'unlisted',
          }),
        /not in/,
      );
      const session = {
        ...createSchema.parse({
          accountId,
          model: selection,
          runtimeConfig: { contextWindowTokens: 64000 },
        }),
      } as Session;
      assert.equal(contextBudget(session, 8192).limit, 8192);
    }
  } finally {
    globalThis.fetch = previousFetch;
    credentials.oauth.close();
    store.close();
    rmSync(home, { recursive: true, force: true });
  }
});
