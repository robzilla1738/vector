import assert from 'node:assert/strict';
import test from 'node:test';
import {create} from './tools/web.mjs';

const typebox = new Proxy({}, {get: () => () => ({})});
function searcher({credential, search}) {
  const asked = [];
  class GoogleSearchClient { search(query) { asked.push(query); return search(query); } }
  const tools = {GoogleSearchClient, models: () => ({credentials: {get: () => credential}}), buildWebSearchToolResult: ({results}) => ({details: {}, result: results})};
  const {createWebSearchTool} = create({typebox, tools});
  return {asked, run: (input, session = {id: 's'}) => createWebSearchTool({accountId: 1, session, browser: {}}).execute('id', input)};
}
const hit = {url: 'https://a.test/', title: 'A', snippet: 'a'};

test('web search asks once per distinct query and reuses a fresh result', async () => {
  const web = searcher({search: async () => [hit]});
  await web.run({objective: 'Rust  async', search_queries: ['rust async', 'tokio']});
  assert.deepEqual(web.asked, ['rust async', 'tokio']);
  await web.run({objective: 'tokio', search_queries: []});
  assert.equal(web.asked.length, 2);
});

test('an incognito search keeps nothing, and a failed one is asked again', async () => {
  const web = searcher({search: async () => [hit]});
  await web.run({objective: 'q', search_queries: []}, {id: 's', incognito: true});
  await web.run({objective: 'q', search_queries: []}, {id: 's', incognito: true});
  assert.equal(web.asked.length, 2);
  let fails = true;
  const flaky = searcher({search: async () => { if (fails) throw Error('Google Search fetch failed: 500'); return [hit]; }});
  await assert.rejects(flaky.run({objective: 'q', search_queries: []}), /no results/);
  fails = false;
  await flaky.run({objective: 'q', search_queries: []});
  assert.equal(flaky.asked.length, 2);
});

test('a limit reads plainly', async () => {
  const web = searcher({search: async () => { throw Error('Google Search returned a bot challenge. Open it.'); }});
  await assert.rejects(web.run({objective: 'q', search_queries: []}), /limiting searches from this browser.*Brave Search key/);
});

test('a saved key goes to Brave and not Google', async t => {
  const web = searcher({credential: {type: 'api_key', key: 'k'}, search: async () => []});
  t.mock.method(globalThis, 'fetch', async (url, {headers}) => {
    assert.match(String(url), /^https:\/\/api\.search\.brave\.com\/res\/v1\/web\/search\?q=q&count=6$/);
    assert.equal(headers['X-Subscription-Token'], 'k');
    return new Response(JSON.stringify({web: {results: [{url: 'https://b.test/', title: 'B', description: 'b'}]}}));
  });
  await web.run({objective: 'q', search_queries: []});
  assert.deepEqual(web.asked, []);
});
