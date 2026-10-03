import assert from 'node:assert/strict';
import test from 'node:test';
import { requireUpdatedSourceRun } from './saved-source-update.mjs';
const source = { pageId: 'original-source', url: 'http://127.0.0.1:73/update', sessionId: 'native-current-document', documentEpoch: 4 };
const run = () => ({ pageIds: [source.pageId], config: { contextPageRefs: [{ ...source, selectedAt: 1 }], mentions: [] } });
test('updated source retains exact original URL/document/session and no mention grant', () => requireUpdatedSourceRun(run(), source));
test('genuine protected copy remains bound to exact original source snapshot', () => {
  const value = run(); value.pageIds = ['protected-copy'];
  value.config.isolatedPageSources = [{ sourcePageId: source.pageId, pageId: 'protected-copy', url: source.url }];
  requireUpdatedSourceRun(value, source);
});
test('same-URL document/session replacement or old source URL refuses', () => {
  for (const change of [{ documentEpoch: 3 }, { sessionId: 'previous-session' }, { url: 'http://127.0.0.1:73/old' }, { pageId: 'foreign' }]) {
    const value = run(); Object.assign(value.config.contextPageRefs[0], change);
    assert.throws(() => requireUpdatedSourceRun(value, source));
  }
});
test('missing or ambiguous context refs and additional page scopes refuse', () => {
  for (const modify of [value => { value.config.contextPageRefs = []; }, value => { value.config.contextPageRefs.push({ ...source }); }, value => { value.pageIds.push('foreign'); }]) {
    const value = run(); modify(value); assert.throws(() => requireUpdatedSourceRun(value, source));
  }
});
test('act mention, foreign/duplicate/missing copy provenance cannot pass as source update', () => {
  const changes = [value => { value.config.mentions = [{ kind: 'tab', access: 'act', pageId: source.pageId }]; },
    value => { value.config.isolatedPageSources[0].sourcePageId = 'foreign'; },
    value => { value.config.isolatedPageSources.push({ ...value.config.isolatedPageSources[0] }); },
    value => { value.config.isolatedPageSources[0].url = 'http://127.0.0.1:73/old'; },
    value => { value.pageIds = [source.pageId]; }];
  for (const modify of changes) {
    const value = run(); value.pageIds = ['protected-copy'];
    value.config.isolatedPageSources = [{ sourcePageId: source.pageId, pageId: 'protected-copy', url: source.url }];
    modify(value); assert.throws(() => requireUpdatedSourceRun(value, source));
  }
});
