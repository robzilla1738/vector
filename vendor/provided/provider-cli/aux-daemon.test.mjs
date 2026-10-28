// Hermetic: the daemon glue against fake CLIs and stubbed daemon hooks. No real CLI, no prompt.
import assert from 'node:assert/strict';
import {chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {API, DAEMON_PROVIDERS, MCP_TOOLS, buildPrompt, createAuxProviderCli, systemPromptOf} from './aux-daemon.mjs';
import {detectAll, liveChildren} from './index.mjs';

const fixture = fileURLToPath(new URL('./fixtures/fake-cli.mjs', import.meta.url));
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-provider-daemon-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));
const bin = path.join(scratch, 'bin'), runs = path.join(scratch, 'runs');
for (const directory of [bin, runs]) mkdirSync(directory);
for (const name of ['codex', 'claude', 'cursor-agent', 'grok', 'opencode']) {
  writeFileSync(path.join(bin, name), `#!/bin/sh\nexec "${process.execPath}" "${fixture}" ${name} "$@"\n`);
  chmodSync(path.join(bin, name), 0o755);
}

/** pi-ai's AssistantMessageEventStream contract: push events, end, result() is the final message. */
class TestStream {
  events = [];
  ended = false;
  #resolve;
  #result = new Promise(resolve => { this.#resolve = resolve; });
  push(event) { this.events.push(event); if (event.type === 'done') this.#resolve(event.message); if (event.type === 'error') this.#resolve(event.error); }
  end() { this.ended = true; }
  result() { return this.#result; }
}

let mode = 'ready', detections = 0;
const instance = (options = {}) => createAuxProviderCli({
  detect: async args => { detections++; return detectAll({...args, searchDirectories: [bin, '/usr/bin', '/bin'], statusTimeoutMs: 15000, versionTimeoutMs: 15000}); },
  env: () => ({...process.env, FAKE_CLI_MODE: mode, AUX_SECRET_SAMPLE: 'x'}),
  log: {warn() {}},
  ...options,
});
const piStream = async (cli, model, context, options = {}) => {
  const stream = cli.stream(model, context, options, () => new TestStream());
  const message = await stream.result();
  await new Promise(resolve => setImmediate(resolve));
  return {stream, message, types: stream.events.map(event => event.type)};
};

test('prompt and system prompt come from both pi context shapes', () => {
  assert.equal(systemPromptOf({systemPrompt: 'Be brief.'}), 'Be brief.');
  assert.equal(systemPromptOf({messages: [{role: 'system', content: 'From message'}]}), 'From message');
  assert.equal(buildPrompt({messages: [{role: 'system', content: 'x'}, {role: 'user', content: [{type: 'text', text: 'Open example.com'}]}]}), 'Open example.com');
  const prompt = buildPrompt({messages: [
    {role: 'user', content: 'First'}, {role: 'assistant', content: [{type: 'thinking', thinking: 'hm'}, {type: 'text', text: 'Answer'}]},
    {role: 'toolResult', toolName: 'repl', content: [{type: 'text', text: 'page'}]}, {role: 'user', content: [{type: 'text', text: 'Second'}, {type: 'image', data: 'x'}]}]});
  assert.match(prompt, /^Conversation so far:\n\nUser: First\n\nAssistant: Answer\n\nResult of repl: page\n\nReply to the latest message:\n\nSecond\n\[image omitted\]$/);
  assert.ok(buildPrompt({messages: [{role: 'user', content: 'a'.repeat(100)}, {role: 'user', content: 'now'}]}, 20).includes('…'));
});

test('status rows, inventory, models and resolution follow detection', async () => {
  mode = 'ready';
  const cli = instance(), notified = [];
  const status = await cli.status();
  assert.deepEqual(Object.keys(status.rows), Object.keys(DAEMON_PROVIDERS));
  for (const id of ['openai-codex', 'claude-code', 'cursor-cli', 'grok-cli', 'opencode-cli']) assert.equal(status.rows[id].state, 'ready', id);
  assert.equal(status.rows['claude-code'].account.email, 'p…@example.com');
  assert.equal(status.rows['copilot-cli'].hidden, true);
  assert.equal(JSON.stringify(status).includes(bin), false, 'no binary path reaches the extension');

  const supplied = {subscriptionPlan: null, availableModels: [{id: 'claude-sonnet-4-6', provider: 'claude-code'}, {id: 'gpt-x', provider: 'openai'}],
    connectedProviders: [{providerId: 'claude-code', type: 'oauth', linked: true, state: 'active'}, {providerId: 'openai', type: 'api_key', state: 'active'}],
    visibleModelIdsByProvider: {'claude-code': ['claude-sonnet-4-6'], openai: ['gpt-x']}};
  const inventory = cli.decorateInventory(supplied, 7, () => notified.push(7));
  assert.deepEqual(inventory.connectedProviders.filter(entry => entry.type === 'cli').map(entry => entry.providerId), ['openai-codex', 'claude-code', 'cursor-cli', 'grok-cli', 'opencode-cli']);
  assert.ok(!inventory.connectedProviders.some(entry => entry.type === 'oauth'), 'a stored borrowed-client credential no longer connects Claude');
  assert.deepEqual(inventory.visibleModelIdsByProvider['claude-code'], ['sonnet', 'opus', 'haiku']);
  assert.deepEqual(inventory.visibleModelIdsByProvider['grok-cli'], ['grok-4.7', 'grok-4.6']);
  assert.deepEqual(inventory.visibleModelIdsByProvider['opencode-cli'], ['default']);
  assert.ok(!inventory.availableModels.some(model => model.id === 'claude-sonnet-4-6'));
  assert.ok(inventory.availableModels.some(model => model.id === 'gpt-x'));
  assert.deepEqual(inventory.availableModels.find(model => model.provider === 'claude-code'),
    {id: 'sonnet', name: 'Claude Sonnet', provider: 'claude-code', reasoning: false, contextWindow: 200000, maxTokens: 32000, availableThinkingLevels: ['off'], supportsFastMode: false, supportsVision: false, isCustom: false});

  const resolved = await cli.resolveModel('gpt-5.5', 'openai-codex');
  assert.equal(resolved.apiKey, '');
  assert.deepEqual([resolved.model.api, resolved.model.provider, resolved.model.id], [API, 'openai-codex', 'gpt-5.5']);
  assert.equal(await cli.resolveModel('claude-sonnet-4-6', 'claude-code'), undefined);
  assert.equal(await cli.resolveModel('anything', 'copilot-cli'), undefined, 'Copilot has no driver');
  assert.equal(cli.owns('openai'), false);
  assert.equal(cli.owns('claude-code'), true);

  mode = 'signed-out';
  const before = detections;
  await cli.status({refresh: true});
  assert.equal(detections, before + 1);
  assert.deepEqual(notified, [7], 'a changed detection re-publishes the inventory');
  const signedOut = cli.decorateInventory(supplied, 7);
  assert.ok(!signedOut.connectedProviders.some(entry => entry.type === 'cli'));
  assert.equal(signedOut.visibleModelIdsByProvider['claude-code'], undefined);
  assert.equal(await cli.resolveModel('sonnet', 'claude-code'), undefined);
  assert.equal(cli.inventoryKey(), cli.inventoryKey(), 'stable while cached');
  await cli.status();
  assert.equal(detections, before + 1, 'cached for 30 s');
  assert.deepEqual(liveChildren(), []);
});

test('the wrapped model runtime streams a real (fake) CLI turn and leaves other models alone', async () => {
  mode = 'ready';
  const cli = instance();
  cli.start({runRoot: runs});
  const runtime = {calls: [], stream(model) { this.calls.push(['stream', model.id]); return 'pi'; }, streamSimple(model) { this.calls.push(['streamSimple', model.id]); return 'pi'; }};
  cli.wrapRuntime(runtime, () => new TestStream());
  assert.equal(runtime.streamSimple({id: 'gpt-x', api: 'openai-responses', provider: 'openai'}, {}, {}), 'pi');
  assert.deepEqual(runtime.calls, [['streamSimple', 'gpt-x']]);

  const stream = runtime.streamSimple({id: 'sonnet', api: API, provider: 'claude-code'}, {messages: [{role: 'system', content: 'Aux system'}, {role: 'user', content: 'open example.com'}]}, {});
  const message = await stream.result();
  assert.equal(message.stopReason, 'stop');
  assert.deepEqual(message.content.map(part => part.type), ['text', 'thinking']);
  assert.equal(message.content[0].text, 'Hello world');
  assert.match(message.content[1].thinking, /Using open_tab/);
  assert.equal(message.usage.input, 3);
  assert.deepEqual(stream.events.map(event => event.type), ['start', 'text_start', 'text_delta', 'text_delta', 'text_end', 'thinking_start', 'thinking_delta', 'thinking_end', 'done']);
  assert.equal(readdirSync(runs).length, 0, 'the turn folder is removed');
  assert.deepEqual(liveChildren(), []);

  mode = 'signed-out';
  await cli.status({refresh: true});
  const out = await piStream(cli, {id: 'sonnet', api: API, provider: 'claude-code'}, {messages: [{role: 'user', content: 'hi'}]});
  assert.deepEqual(out.types, ['start', 'error']);
  assert.equal(out.message.stopReason, 'error');
  assert.equal(out.message.errorMessage, 'Claude Code is not signed in. Run claude auth login in Terminal.');
  assert.equal(out.stream.ended, true);
});

test('a CLI that reports a sign-in error flips the row to re-check', async () => {
  mode = 'ready';
  let calls = 0;
  const cli = instance({run: async function* () { calls++; yield {type: 'error', code: 'exit', message: 'Invalid API key · Please run /login'}; }});
  cli.start({runRoot: runs});
  const out = await piStream(cli, {id: 'sonnet', api: API, provider: 'claude-code'}, {messages: [{role: 'user', content: 'hi'}]});
  assert.equal(calls, 1);
  assert.equal(out.message.errorMessage, 'Claude Code is not signed in. Run claude auth login in Terminal.');
  const before = detections;
  await cli.status();
  assert.equal(detections, before + 1, 'the cached ready state is dropped');
});

test('per-turn MCP endpoint: token, scope, the Agent tool path, revocation', async () => {
  mode = 'ready';
  const log = [];
  const tool = name => ({name, description: `${name} tool`, parameters: {type: 'object', properties: {url: {type: 'string'}}, [Symbol('kind')]: 'Object'},
    execute: async (id, args, signal, update) => { log.push(['execute', name, id.startsWith('aux_cli_'), args, signal instanceof AbortSignal, typeof update]); return {content: [{type: 'text', text: `ran ${name}`}, {type: 'image', data: 'AAAA', mimeType: 'image/png'}], details: {}}; }});
  const tools = [tool('repl'), tool('websearch'), tool('terminal'), tool('write_file'), tool('blocked_by_hook')];
  let seen, outcome;
  const scope = {
    tools: () => [...tools, {...tool('get_time'), name: 'get_time'}],
    context: () => ({messages: []}),
    prepareArguments: (entry, call) => { log.push(['prepare', entry.name, call.name]); return {...call.arguments, prepared: true}; },
    beforeToolCall: async call => { log.push(['before', call.toolCall.name, call.assistantMessage.content.length]); return call.args.url === 'blocked' ? {block: true, reason: 'Needs confirmation.'} : undefined; },
    afterToolCall: async call => { log.push(['after', call.toolCall.name, call.isError]); return undefined; },
    execute: (prepared, operation) => { log.push(['owner', prepared.tool.name]); return operation(); },
  };
  const cli = instance({run: async function* (request) {
    seen = request;
    const post = (body, token = request.mcp.token, init = {}) => cli.handleMcp(new Request(request.mcp.url, {method: 'POST', headers: {authorization: `Bearer ${token}`, 'content-type': 'application/json'}, body: JSON.stringify(body), ...init}));
    const rpc = async body => (await post(body)).json();
    outcome = {
      init: await rpc({jsonrpc: '2.0', id: 1, method: 'initialize', params: {protocolVersion: '2025-03-26'}}),
      note: (await post({jsonrpc: '2.0', method: 'notifications/initialized'})).status,
      list: await rpc({jsonrpc: '2.0', id: 2, method: 'tools/list'}),
      call: await rpc({jsonrpc: '2.0', id: 3, method: 'tools/call', params: {name: 'repl', arguments: {url: 'https://example.com'}}}),
      blocked: await rpc({jsonrpc: '2.0', id: 4, method: 'tools/call', params: {name: 'repl', arguments: {url: 'blocked'}}}),
      shell: await rpc({jsonrpc: '2.0', id: 5, method: 'tools/call', params: {name: 'terminal', arguments: {}}}),
      unknown: await rpc({jsonrpc: '2.0', id: 6, method: 'resources/list'}),
      wrongToken: (await post({jsonrpc: '2.0', id: 7, method: 'tools/list'}, 'x'.repeat(43))).status,
      noToken: (await cli.handleMcp(new Request(request.mcp.url, {method: 'POST', body: '{}'}))).status,
      otherTurn: (await cli.handleMcp(new Request(request.mcp.url.replace(/[^/]+$/, 'someone-else'), {method: 'POST', headers: {authorization: `Bearer ${request.mcp.token}`}, body: '{}'}))).status,
      get: (await cli.handleMcp(new Request(request.mcp.url, {headers: {authorization: `Bearer ${request.mcp.token}`}}))).status,
      parse: (await post(undefined, request.mcp.token, {body: '{oops'})).status,
      live: cli.liveTurns(),
    };
    yield {type: 'text', delta: 'done'};
    yield {type: 'done', reason: 'end'};
  }});
  cli.start({runRoot: runs, mcpOrigin: 'http://127.0.0.1:21520'});
  const out = await piStream(cli, {id: 'sonnet', api: API, provider: 'claude-code'}, {messages: [{role: 'user', content: 'go'}]}, {auxProviderCli: scope});

  assert.equal(out.message.content[0].text, 'done');
  assert.match(seen.mcp.url, /^http:\/\/127\.0\.0\.1:21520\/mcp\/v1\/[0-9a-f]{32}$/);
  assert.match(seen.mcp.token, /^[A-Za-z0-9_-]{43}$/);
  assert.equal(seen.env.AUX_SECRET_SAMPLE, undefined, 'no Aux variable reaches the CLI');
  assert.equal(seen.cwd.startsWith(runs), true);
  assert.equal(existsSync(seen.cwd), false, 'the turn folder is removed');
  assert.equal(outcome.init.result.protocolVersion, '2025-03-26');
  assert.equal(outcome.init.result.serverInfo.name, 'aux');
  assert.equal(outcome.note, 202);
  assert.deepEqual(outcome.list.result.tools.map(entry => entry.name), ['repl', 'websearch', 'get_time']);
  assert.deepEqual(outcome.list.result.tools[0].inputSchema, {type: 'object', properties: {url: {type: 'string'}}});
  assert.deepEqual(outcome.call.result, {isError: false, content: [{type: 'text', text: 'ran repl'}, {type: 'image', data: 'AAAA', mimeType: 'image/png'}]});
  assert.deepEqual(outcome.blocked.result, {isError: true, content: [{type: 'text', text: 'Needs confirmation.'}]});
  assert.equal(outcome.shell.result.isError, true, 'shell tools are not offered');
  assert.equal(outcome.unknown.error.code, -32601);
  assert.deepEqual([outcome.wrongToken, outcome.noToken, outcome.otherTurn, outcome.get, outcome.parse, outcome.live], [401, 401, 401, 405, 400, 1]);
  assert.deepEqual(log, [
    ['prepare', 'repl', 'repl'], ['before', 'repl', 1], ['owner', 'repl'], ['execute', 'repl', true, {url: 'https://example.com', prepared: true}, true, 'function'], ['after', 'repl', false],
    ['prepare', 'repl', 'repl'], ['before', 'repl', 1],
  ]);
  assert.equal(cli.liveTurns(), 0);
  const revoked = await cli.handleMcp(new Request(seen.mcp.url, {method: 'POST', headers: {authorization: `Bearer ${seen.mcp.token}`}, body: JSON.stringify({jsonrpc: '2.0', id: 1, method: 'tools/list'})}));
  assert.equal(revoked.status, 401, 'the token dies with its turn');
  assert.deepEqual(MCP_TOOLS, ['repl', 'webfetch', 'websearch', 'get_time']);
  assert.equal(cli.isMcpPath('/mcp/v1/abc'), true);
  assert.equal(cli.isMcpPath('/mcp/oauth/callback'), false);
});

test('turns without the Agent tools get no MCP; stop() revokes tokens and stops CLIs', async () => {
  mode = 'ready';
  let request;
  const cli = instance({run: async function* (value) { request = value; yield {type: 'done', reason: 'cancelled'}; }});
  cli.start({runRoot: runs, mcpOrigin: 'http://127.0.0.1:21520'});
  const out = await piStream(cli, {id: 'default', api: API, provider: 'opencode-cli'}, {systemPrompt: 'Title this', messages: [{role: 'user', content: 'x'}]});
  assert.equal(request.mcp, undefined);
  assert.equal(request.model, undefined, 'the CLI default model passes no --model');
  assert.equal(request.systemPrompt, 'Title this');
  assert.equal(out.message.stopReason, 'aborted');
  await cli.stop();
  assert.equal(cli.liveTurns(), 0);
  assert.deepEqual(liveChildren(), []);
  const unstarted = instance();
  const failed = await piStream(unstarted, {id: 'sonnet', api: API, provider: 'claude-code'}, {messages: []});
  assert.equal(failed.message.errorMessage, 'Provider CLIs are not started.');
});
