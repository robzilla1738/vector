// Host-only: runs every provider CLI transform against copies of the sealed candidate's real files.
import {requireInput} from '../../../scripts/lib/inputs.mjs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {SourceTextModule, runInNewContext} from 'node:vm';
import test from 'node:test';
import {FORBIDDEN} from './borrowed-identity-removal.mjs';
import {AGENT_PATH, AGENT_LIST_EDITS, CONNECT_DIALOG_EDITS, CONNECT_DIALOG_PATH, DAEMON_EDITS, FORBIDDEN_DIALOG,
  integrateAgentList, integrateConnectDialog, integrateDaemon} from './integration.mjs';

const apps = `${requireInput('candidateApp')}/Contents/Resources/aux/apps`;
const sources = {
  daemon: `${apps}/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs`,
  list: `${apps}/extension/dist/${AGENT_PATH}`,
  dialog: `${apps}/extension/dist/${CONNECT_DIALOG_PATH}`,
};
const sha = text => createHash('sha256').update(text).digest('hex');
const before = Object.fromEntries(Object.entries(sources).map(([key, file]) => [key, sha(readFileSync(file))]));
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-provider-integration-'));
test.after(() => {
  rmSync(scratch, {recursive: true, force: true});
  for (const [key, file] of Object.entries(sources)) assert.equal(sha(readFileSync(file)), before[key], `the candidate ${key} file is unchanged`);
});
const copy = key => { const file = path.join(scratch, path.basename(sources[key])); copyFileSync(sources[key], file); return readFileSync(file, 'utf8'); };
const input = {daemon: copy('daemon'), list: copy('list'), dialog: copy('dialog')};
const output = {daemon: integrateDaemon(input.daemon), list: integrateAgentList(input.list), dialog: integrateConnectDialog(input.dialog)};
const count = (text, needle) => text.split(needle).length - 1;
const check = (name, text) => {
  const file = path.join(scratch, `${name}.mjs`);
  writeFileSync(file, text);
  const result = spawnSync(process.execPath, ['--check', file], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stderr);
  new SourceTextModule(text);
};

test('inputs are the sealed candidate files', () => {
  assert.equal(sha(input.daemon), '101a65a26aac8a1ab2d966672ff6fdfc5475d8558f8162fd22b7f1eddb885b76');
  for (const rule of DAEMON_EDITS) assert.equal(count(input.daemon, rule.find), rule.count, rule.name);
  for (const rule of CONNECT_DIALOG_EDITS) assert.equal(count(input.dialog, rule.find), rule.count, rule.name);
});

test('daemon: borrowed identities gone, every hook in place, still parses', () => {
  check('entry', output.daemon);
  for (const marker of FORBIDDEN) assert.equal(count(output.daemon, marker), 0, marker);
  for (const rule of DAEMON_EDITS) assert.equal(count(output.daemon, rule.replace), 1, rule.name);
  assert.equal(count(output.daemon, 'auxProviderCli'), 17);
  // The loader runs before any use and resolves beside the entry.
  assert.ok(output.daemon.indexOf('const auxProviderCli=') < output.daemon.indexOf('auxProviderCli.'));
  assert.equal(count(output.daemon, 'new URL("./provider-cli/aux-daemon.mjs",import.meta.url)'), 1);
  // Every daemon identifier the injected code names is declared in the entry.
  for (const name of ['createAssistantMessageEventStream', 'validateToolArguments', 'prepareToolCallArguments', 'auxExecuteRegisteredBrowserTool',
    'isConnectedFromLocalhost', 'isLoopbackHost']) assert.equal(count(output.daemon, `function ${name}(`), 1, name);
  for (const name of ['EventBus', 'AUX_HOME_PATH', 'PORT', 'modelRuntime']) assert.ok(new RegExp(`[,\\s]${name}[,=]`).test(output.daemon), name);
  assert.ok(output.daemon.includes('default as path}from"node:path"'));
  assert.throws(() => integrateDaemon(output.daemon), /drift/);
});

test('daemon: the MCP branch of the auth middleware, run in isolation', async () => {
  const start = output.daemon.indexOf('daemonAuthMiddleware=()=>') + 'daemonAuthMiddleware='.length;
  const end = output.daemon.indexOf('}}));function isPrivilegedExtensionMv3ApiMethod', start) + 1;
  const calls = [];
  const sandbox = {
    URL,
    isConnectedFromLocalhost: context => context.local,
    isLoopbackHost: host => host === '127.0.0.1:21520',
    auxProviderCli: {isMcpPath: pathname => pathname.startsWith('/mcp/v1/'), handleMcp: async raw => { calls.push(raw); return 'mcp-response'; }},
    verifyDaemonAuthHttpRequest: async () => { calls.push('daemon-auth'); return false; },
    publicPaths: [],
  };
  const middleware = runInNewContext(`(${output.daemon.slice(start, end)})`, sandbox)();
  const context = (url, headers = {}, local = true) => ({local, req: {url, method: 'POST', raw: {url}, header: name => headers[name]}, json: (body, status) => ({body, status})});
  const next = () => { calls.push('next'); };
  assert.equal(await middleware(context('http://127.0.0.1:21520/mcp/v1/turn1', {host: '127.0.0.1:21520'}), next), 'mcp-response');
  assert.equal((await middleware(context('http://127.0.0.1:21520/mcp/v1/turn1', {host: '127.0.0.1:21520', origin: 'https://evil.example'}), next)).status, 403);
  assert.equal((await middleware(context('http://127.0.0.1:21520/mcp/v1/turn1', {host: '127.0.0.1:21520', 'sec-fetch-site': 'cross-site'}), next)).status, 403);
  assert.equal((await middleware(context('http://127.0.0.1:21520/mcp/v1/turn1', {host: 'evil.example'}), next)).status, 403);
  assert.equal((await middleware(context('http://127.0.0.1:21520/mcp/v1/turn1', {host: '127.0.0.1:21520'}, false), next)).status, 403);
  // Every other path still needs the daemon session token.
  assert.equal((await middleware(context('http://127.0.0.1:21520/trpc/x', {host: '127.0.0.1:21520'}), next)).status, 401);
  assert.deepEqual(calls.map(call => typeof call === 'string' ? call : call.url), ['http://127.0.0.1:21520/mcp/v1/turn1', 'daemon-auth']);
});

test('daemon: the chat-turn branch hands the session tools to the CLI, run in isolation', async () => {
  const start = output.daemon.indexOf('if(auxProviderCli.owns(Cn.provider))return modelRuntime.streamSimple(');
  const statement = output.daemon.slice(start, output.daemon.indexOf('let ai=Cn.provider===`aux`?', start));
  const calls = [];
  const tool = {name: 'repl'};
  const Ci = {state: {tools: [tool], messages: ['m']}, beforeToolCall: async (call, signal) => ['before', call, signal], afterToolCall: async call => ['after', call],
    processEvents: async event => ['event', event]};
  const sandbox = {
    auxProviderCli: {owns: provider => provider === 'claude-code'},
    modelRuntime: {streamSimple: (model, context, options) => { calls.push([model, context, options]); return 'cli-stream'; }},
    Ci, ti: {systemPrompt: 'session prompt'},
    validateToolArguments: (entry, args) => ['validated', entry.name, args],
    prepareToolCallArguments: (entry, call) => call.arguments,
    auxExecuteRegisteredBrowserTool: (prepared, operation) => operation(),
  };
  const streamFn = runInNewContext(`(async(Cn,ni,ri)=>{${statement}return 'supplied path'})`, sandbox);
  assert.equal(await streamFn({provider: 'openai'}, {}, {}), 'supplied path');
  assert.equal(await streamFn({provider: 'claude-code'}, {messages: []}, {signal: 's'}), 'cli-stream');
  const scope = calls[0][2].auxProviderCli;
  assert.equal(calls[0][2].signal, 's');
  assert.deepEqual(scope.tools(), [tool]);
  assert.equal(JSON.stringify(scope.context()), JSON.stringify({systemPrompt: 'session prompt', messages: ['m'], tools: [tool]}));
  assert.equal(JSON.stringify(scope.prepareArguments(tool, {arguments: {a: 1}})), JSON.stringify(['validated', 'repl', {a: 1}]));
  assert.deepEqual(await scope.beforeToolCall('call', 'signal'), ['before', 'call', 'signal']);
  assert.deepEqual(await scope.afterToolCall('call'), ['after', 'call']);
  assert.equal(scope.execute, sandbox.auxExecuteRegisteredBrowserTool);
  assert.deepEqual(await scope.emit({type: 'tool_execution_start'}), ['event', {type: 'tool_execution_start'}], 'CLI tool activity reaches the Agent as tool events');
});

test('daemon: shutdown awaits the provider CLIs, run in isolation', async () => {
  const start = output.daemon.indexOf('function auxCreateDaemonShutdown(deps) {');
  const source = output.daemon.slice(start, output.daemon.indexOf('\n}\n', start) + 2);
  const order = [];
  const sandbox = {auxShutdownDiagnostic: label => order.push(label), auxDaemonClosing: false, AUX_SHUTDOWN_BUDGET_MS: 15000, setTimeout, clearTimeout, Promise, AggregateError, Error, Object};
  const shutdown = runInNewContext(`(${source})`, sandbox);
  const stop = name => () => { order.push(name); };
  let stopped;
  const exited = new Promise(resolve => {
    shutdown({fetch() {}, websockets: () => null, http: () => null, closeReadiness() {}, clearBootstrapTimer() {}, bootstrap: () => undefined,
      stopIntervals: stop('intervals'), stopRefresh: stop('refresh'), stopProductivity: stop('productivity'), stopChannels: stop('channels'), stopOutbox: stop('outbox'),
      stopBackground: stop('background'), stopComputerUse: stop('computer-use'), stopCoder: stop('coder'), terminateExec: stop('exec'), killCommands: stop('commands'),
      stopProviderCli: () => new Promise(resolve => setTimeout(() => { stopped = true; resolve(); }, 20)), stopTelemetry: stop('telemetry'), closeBroker: stop('broker'),
      hold: () => 1, releaseHold() {}, exit: () => resolve(order), budgetExceeded() {}, unknown: error => { throw error; }}).start();
  });
  await exited;
  assert.equal(stopped, true);
  assert.ok(order.indexOf('provider-cli.settled') < order.indexOf('producers.settled'), 'provider CLIs settle before transports close');
  // The real deps object passes the instance's stop().
  assert.equal(count(output.daemon, 'stopProviderCli:()=>auxProviderCli.stop()'), 1);
});

test('Agent provider list: CLI rows in, OAuth-only rows out, still parses', () => {
  check('list', output.list);
  const list = JSON.parse(output.list.slice(output.list.indexOf('var Zf=') + 7, output.list.indexOf(']', output.list.indexOf('var Zf=')) + 1));
  for (const id of ['claude-code', 'openai-codex', 'cursor-cli', 'grok-cli', 'opencode-cli', 'meta', 'kimi-coding']) assert.ok(list.includes(id), id);
  for (const id of ['meta-muse', 'xai-grok-oauth', 'kimi-code', 'github-copilot', 'copilot-cli']) assert.ok(!list.includes(id), `${id} is not a fixed row`);
  for (const id of ['cursor-cli', 'grok-cli', 'opencode-cli', 'copilot-cli', 'gemini-cli']) assert.equal(count(output.list, `"${id}":{name:`), 1, id);
  assert.equal(count(output.list, 'Aux support is not verified yet'), 0);
  assert.equal(count(output.list, 'Reuse your Claude Pro or Max subscription'), 0);
  assert.equal(count(output.list, 'Reuse your ChatGPT Plus or Pro subscription'), 0);
  assert.throws(() => integrateAgentList(output.list), /drift/);
  assert.equal(AGENT_LIST_EDITS.length, 3);
});

test('connect dialogs: ChatGPT and Claude are CLI status rows built from the supplied parts', () => {
  check('dialog', output.dialog);
  for (const marker of FORBIDDEN_DIALOG) assert.equal(count(output.dialog, marker), 0, marker);
  for (const id of ['openai-codex', 'claude-code', 'cursor-cli', 'grok-cli', 'opencode-cli', 'copilot-cli', 'gemini-cli']) assert.equal(count(output.dialog, `(0,e.jsx)(auxCliDialog,{provider:"${id}"})`), 1, id);
  // Models are local agents or API keys: no in-app subscription sign-in dialog is left.
  for (const id of ['github-copilot', 'meta-muse', 'xai-grok-oauth', 'kimi-code']) assert.equal(count(output.dialog, `(P,{provider:"${id}"`), 0, id);
  assert.equal(count(output.dialog, 'auxCliDialog=({provider:t})=>{'), 1);
  // The dialog's free names are the chunk's own imports and declarations.
  const imported = new Set([...output.dialog.matchAll(/import\{([^}]*)\}from/g)].flatMap(match => match[1].split(',').map(part => part.trim().split(/\s+as\s+/).pop())));
  for (const name of ['st', 'z', 'S', 'D', 'W', 'b', 'v', 're']) assert.ok(imported.has(name), name);
  for (const name of ['P', 'I', 'A', 'w', '_', 'e']) assert.ok(new RegExp(`(?:[,;]|var )${name}=`).test(output.dialog), name);
  // The tRPC procedures the dialog calls are the ones the daemon adds.
  assert.equal(count(output.dialog, 'a.models.providerCliStatus.queryOptions('), 1);
  assert.equal(count(output.dialog, 'a.models.providerCliRefresh.mutationOptions()'), 1);
  assert.equal(count(output.daemon, 'providerCliStatus:accountProcedure.query('), 1);
  assert.equal(count(output.daemon, 'providerCliRefresh:accountProcedure.mutation('), 1);
  assert.throws(() => integrateConnectDialog(output.dialog), /drift/);
});
