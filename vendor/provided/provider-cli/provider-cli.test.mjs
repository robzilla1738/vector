import assert from 'node:assert/strict';
import {chmodSync, existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {PROVIDERS, providerById, parseAuthStatus, settingsRow, detectAll, childEnvironment, runTurn,
  prepareRunDirectory, removeRunDirectory, liveChildren, terminateAll, PARSERS, userLoginPath} from './index.mjs';
import {launch} from './process.mjs';

const fixture = fileURLToPath(new URL('./fixtures/fake-cli.mjs', import.meta.url));
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-provider-cli-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));
const bin = path.join(scratch, 'bin'), empty = path.join(scratch, 'empty');
for (const directory of [bin, empty]) prepareRunDirectory(scratch, path.basename(directory));
for (const name of ['codex', 'claude', 'cursor-agent', 'grok', 'opencode', 'gemini']) {
  const shim = path.join(bin, name);
  writeFileSync(shim, `#!/bin/sh\nexec "${process.execPath}" "${fixture}" ${name} "$@"\n`);
  chmodSync(shim, 0o755);
}
// A foreign `agent` on PATH must not be mistaken for Cursor.
writeFileSync(path.join(empty, 'agent'), '#!/bin/sh\necho "some other agent 1.0"\n');
chmodSync(path.join(empty, 'agent'), 0o755);

let counter = 0;
function context(mode, extra = {}) {
  const id = `t${++counter}`;
  const logFile = path.join(scratch, `${id}.log`);
  const env = childEnvironment({...process.env, FAKE_CLI_MODE: mode, FAKE_CLI_LOG: logFile, FAKE_CLI_PIDFILE: path.join(scratch, `${id}.pid`), AUX_SECRET_SAMPLE: 'x'}, [bin, '/usr/bin', '/bin']);
  return {id, env, logFile, pidFile: path.join(scratch, `${id}.pid`), cwd: prepareRunDirectory(scratch, `run-${id}`), ...extra};
}
const readLog = file => existsSync(file) ? readFileSync(file, 'utf8').trim().split('\n').map(line => JSON.parse(line)) : [];
async function collect(provider, mode, options = () => ({})) {
  const ctx = context(mode);
  const file = path.join(bin, providerById(provider).commands[0]);
  const events = [];
  for await (const event of runTurn({provider, file, prompt: 'open example.com', cwd: ctx.cwd, env: ctx.env,
    mcp: {url: 'http://127.0.0.1:21520/mcp/v1/profile-1', token: 'turn-token-123'}, idleTimeoutMs: 30000, ...options(ctx)})) events.push(event);
  return {events, ctx, log: readLog(ctx.logFile)};
}
const run = (provider, mode, options = () => ({})) => collect(provider, mode, options);
const texts = events => events.filter(event => event.type === 'text').map(event => event.delta).join('');
const terminal = events => events.at(-1);
const alive = pid => { try { process.kill(pid, 0); return true; } catch { return false; } };
const waitFor = async (predicate, ms = 15000) => { const end = Date.now() + ms; while (!predicate() && Date.now() < end) await new Promise(r => setTimeout(r, 20)); return predicate(); };

test('status parsing matches the real CLI output observed on 2026-10-28', () => {
  assert.equal(parseAuthStatus('codex', {exitCode: 0, stdout: '', stderr: 'Logged in using ChatGPT\n'}).state, 'ready');
  assert.equal(parseAuthStatus('codex', {exitCode: 1, stdout: '', stderr: 'Not logged in\n'}).state, 'signed-out');
  const claude = parseAuthStatus('claude', {exitCode: 0, stdout: JSON.stringify({loggedIn: true, authMethod: 'claude.ai', email: 'robert@example.com', subscriptionType: 'enterprise'})});
  assert.deepEqual(claude, {state: 'ready', account: {method: 'claude.ai', email: 'r…@example.com', plan: 'enterprise'}});
  assert.equal(parseAuthStatus('cursor', {exitCode: 0, stdout: JSON.stringify({isAuthenticated: false})}).state, 'signed-out');
  const grok = parseAuthStatus('grok', {exitCode: 0, stdout: 'You are logged in with grok.com.\n\nDefault model: grok-4.7\n\nAvailable models:\n  * grok-4.7 (default)\n  - grok-4.7-build-fast\n'});
  assert.deepEqual([grok.state, grok.account.method, grok.models, grok.defaultModel], ['ready', 'grok.com', ['grok-4.7', 'grok-4.7-build-fast'], 'grok-4.7']);
  assert.deepEqual(parseAuthStatus('opencode', {exitCode: 1, stdout: '', stderr: 'Location plugins did not finish activating'}), {state: 'error', detail: 'OpenCode is still starting. Try again.', retry: true});
  assert.equal(parseAuthStatus('opencode', {exitCode: 0, stdout: '\n'}).state, 'signed-out');
  assert.equal(parseAuthStatus('claude', {exitCode: 0, stdout: 'not json'}).state, 'error');
  assert.equal(parseAuthStatus('codex', {timedOut: true}).state, 'error');
});

test('settings rows: not installed, signed out, ready, hidden Copilot', () => {
  const codex = providerById('codex');
  const missing = settingsRow(codex, {state: 'not-installed'});
  assert.deepEqual(missing.actions.map(action => action.kind), ['link', 'copy']);
  assert.equal(missing.actions[1].command, 'brew install --cask codex');
  const out = settingsRow(codex, {state: 'signed-out', version: '0.164.0'});
  assert.deepEqual(out.actions.map(action => action.command).filter(Boolean), ['codex login', 'codex login']);
  const ready = settingsRow(providerById('claude'), {state: 'ready', account: {email: 'r…@example.com'}});
  assert.deepEqual(ready.models, ['claude-sonnet-5', 'claude-opus-5-5', 'claude-haiku-5-5']);
  assert.match(ready.actions[0].text, /claude auth logout/);
  assert.equal(settingsRow(providerById('copilot'), {state: 'not-installed'}).hidden, true);
  assert.match(settingsRow(providerById('copilot'), {state: 'ready'}).message, /run copilot login/, 'no status command: the row names the login');
  for (const entry of PROVIDERS.filter(({id}) => id !== 'local')) assert.ok(entry.driver && entry.login && entry.install.url.startsWith('https://'), entry.id);
});

test('detection: ready, signed out, missing, crash, slow, warming, foreign binary', async () => {
  const detect = async (mode, searchDirectories = [bin], extra = {}) => {
    const ctx = context(mode);
    const result = await detectAll({env: ctx.env, searchDirectories, statusTimeoutMs: 15000, versionTimeoutMs: 15000, ...extra});
    return Object.fromEntries(result.providers.map(entry => [entry.id, entry]));
  };
  const ready = await detect('ready');
  assert.deepEqual(['codex', 'claude', 'cursor', 'grok', 'opencode'].map(id => ready[id].state), ['ready', 'ready', 'ready', 'ready', 'ready']);
  assert.equal(ready.codex.version, '0.164.0');
  assert.equal(ready.cursor.path, path.join(bin, 'cursor-agent'));
  assert.equal(ready.claude.account.email, 'p…@example.com');
  assert.deepEqual(ready.codex.models, [{id: 'gpt-5.5', name: 'GPT-5.5', efforts: ['minimal', 'low', 'medium', 'high', 'xhigh'], vision: true},
    {id: 'gpt-5.4-mini', name: 'GPT-5.4 mini', efforts: ['low'], vision: false}], 'every model/list page, hidden models left out');
  assert.equal(ready.gemini.state, 'ready');
  assert.equal(ready.copilot.state, 'not-installed');
  const again = await detect('ready', [bin], {previous: Object.values(ready), providers: [providerById('codex')]});
  assert.equal(again.codex.models, ready.codex.models, 'a re-check with the same version reuses the model list');
  const signedOut = await detect('signed-out');
  assert.deepEqual(['codex', 'claude', 'cursor', 'grok', 'opencode'].map(id => signedOut[id].state), Array(5).fill('signed-out'));
  const missing = await detect('ready', [empty]);
  assert.ok(Object.values(missing).every(entry => entry.state === 'not-installed'));
  assert.match(missing.cursor.detail, /is not Cursor CLI/);
  const crash = await detect('crash');
  assert.ok(['codex', 'claude', 'cursor', 'grok', 'opencode'].every(id => crash[id].state === 'error'));
  const started = Date.now();
  const slow = await detect('slow', [bin], {statusTimeoutMs: 1500});
  assert.ok(Date.now() - started < 30000);
  assert.ok(['codex', 'claude', 'cursor', 'grok', 'opencode'].every(id => slow[id].state === 'error' && /timed out/.test(slow[id].detail)));
  const warming = await detect('warming');
  assert.equal(warming.opencode.state, 'ready');
  assert.equal(liveChildren().length, 0);
});

test('login PATH comes from the first shell that answers', async () => {
  const silent = path.join(scratch, 'silent-shell'), real = path.join(scratch, 'real-shell');
  writeFileSync(silent, '#!/bin/sh\nexit 0\n');
  writeFileSync(real, '#!/bin/sh\necho "rc noise"\necho __AUX_PATH_START__\necho /x/bin:/opt/homebrew/bin\necho __AUX_PATH_END__\n');
  chmodSync(silent, 0o755); chmodSync(real, 0o755);
  assert.equal(await userLoginPath({shells: [silent, real], env: {PATH: '/usr/bin:/bin'}}), '/x/bin:/opt/homebrew/bin');
  assert.equal(await userLoginPath({shells: [silent, 'relative-shell'], env: {PATH: '/usr/bin:/bin'}}), null);
});

test('child environment drops Aux secrets and nested-agent markers', () => {
  const env = childEnvironment({HOME: '/h', AUX_SESSION: 's', CLAUDECODE: '1', CODEX_SANDBOX_NETWORK_DISABLED: '1', LANG: 'C'}, ['/a', '/b'], {AUX_MCP_TOKEN: 't'});
  assert.deepEqual(env, {HOME: '/h', LANG: 'C', PATH: '/a:/b', TERM: 'dumb', NO_COLOR: '1', AUX_MCP_TOKEN: 't'});
});

test('ready turns stream text, tools and one terminal event for every driver', async () => {
  const claude = await run('claude', 'ready');
  assert.equal(texts(claude.events), 'Hello world');
  assert.deepEqual(claude.events.filter(e => e.type === 'tool').map(e => [e.phase, e.id]), [['start', 't1'], ['end', 't1']]);
  assert.deepEqual(terminal(claude.events).type, 'done');
  const args = claude.log[0].args;
  for (const flag of ['-p', '--input-format', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--strict-mcp-config', '--no-session-persistence']) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf('--allowedTools') + 1], 'mcp__aux');
  assert.equal(args[args.indexOf('--permission-prompt-tool') + 1], 'mcp__aux__permission', 'Claude Code asks Aux before its own tools');
  assert.equal(args[args.indexOf('--permission-mode') + 1], 'manual');
  assert.ok(!args.includes('--tools'));
  assert.equal(claude.log.find(entry => entry.prompt).prompt, 'open example.com', 'prompt arrives on stdin, not argv');
  assert.ok(!args.includes('open example.com'));
  const {config, configMode} = claude.log.find(entry => entry.config);
  assert.ok(config.includes('${AUX_MCP_TOKEN}') && !config.includes('turn-token-123'), 'token stays in the environment');
  assert.equal(JSON.parse(config).mcpServers.aux.timeout, 86400000, 'an open approval card does not time the tool call out');
  assert.equal(configMode, 0o600);
  assert.ok(!existsSync(args[args.indexOf('--mcp-config') + 1]), 'the turn removes its config');
  assert.equal(claude.log[0].hasToken, true);
  assert.deepEqual(claude.log[0].auxLeak, []);

  const cursor = await run('cursor', 'ready');
  assert.equal(texts(cursor.events), 'Hello');
  assert.equal(cursor.events.find(e => e.type === 'tool' && e.phase === 'end').output.content, 'opened');
  assert.ok(!existsSync(path.join(cursor.ctx.cwd, '.cursor/mcp.json')));
  assert.ok(cursor.log[0].args.includes('--approve-mcps'));
  assert.equal(cursor.log[0].args[cursor.log[0].args.indexOf('--mode') + 1], 'ask', "Cursor's own tools stay read-only");

  const grok = await run('grok', 'ready');
  assert.equal(texts(grok.events), 'Grok here');
  assert.deepEqual(grok.log[0].args.slice(0, 4), ['mcp', 'add', '--scope', 'project']);
  assert.equal(grok.log.find(entry => entry.prompt).prompt, 'open example.com');
  assert.equal(terminal(grok.events).type, 'done');
  assert.ok(!existsSync(path.join(grok.ctx.cwd, '.grok/config.toml')), 'the bearer token goes with the turn');

  const opencode = await run('opencode', 'ready');
  assert.equal(texts(opencode.events), 'OpenCode');
  assert.deepEqual(opencode.events.filter(e => e.type === 'tool').map(e => e.phase), ['start', 'end']);
  assert.deepEqual(opencode.log[0].args.slice(0, 4), ['run', '--standalone', '--format', 'json']);
  const opencodeConfig = JSON.parse(opencode.log.find(entry => entry.config).config);
  assert.equal(opencodeConfig.mcp.aux.headers.Authorization, 'Bearer {env:AUX_MCP_TOKEN}');
  assert.deepEqual(opencodeConfig.permission, {edit: 'ask', bash: 'ask'});

  const codex = await run('codex', 'ready');
  assert.equal(texts(codex.events), 'Codex');
  assert.equal(codex.events[0].type, 'session');
  assert.deepEqual(terminal(codex.events), {type: 'done', reason: 'end'});
  const rpc = codex.log.filter(entry => entry.rpc);
  assert.deepEqual(rpc.slice(0, 4).map(entry => entry.rpc), ['initialize', 'initialized', 'thread/start', 'turn/start']);
  assert.deepEqual([rpc[2].params.approvalPolicy, rpc[2].params.sandbox, rpc[2].params.ephemeral], ['on-request', 'read-only', true]);
  assert.deepEqual(rpc.find(entry => entry.result?.decision).result, {decision: 'decline'}, 'with no one to ask, approval requests are declined');
  assert.ok(codex.log[0].args.includes('mcp_servers.aux.bearer_token_env_var="AUX_MCP_TOKEN"'));
  assert.ok(codex.log[0].args.includes('mcp_servers.aux.tool_timeout_sec=86400'));
  assert.ok(!codex.log[0].args.join(' ').includes('turn-token-123'));

  const acp = await run('gemini', 'ready', () => ({systemPrompt: 'You are Aux.'}));
  assert.equal(texts(acp.events), 'Gemini');
  assert.deepEqual(acp.events.filter(e => e.type === 'tool').map(e => [e.phase, e.id, e.isError ?? null]), [['start', 'a1', null], ['end', 'a1', true]], 'refused when no one can approve');
  assert.deepEqual(terminal(acp.events), {type: 'done', reason: 'end'});
  const calls = acp.log.filter(entry => entry.rpc);
  assert.deepEqual(calls.slice(0, 3).map(entry => entry.rpc), ['initialize', 'session/new', 'session/prompt']);
  assert.deepEqual(calls[1].params.mcpServers, [{type: 'http', name: 'aux', url: 'http://127.0.0.1:21520/mcp/v1/profile-1', headers: [{name: 'Authorization', value: 'Bearer turn-token-123'}]}]);
  assert.match(calls[2].params.prompt[0].text, /^<aux-instructions>\nYou are Aux\.\n<\/aux-instructions>$/);
  assert.deepEqual(calls.find(entry => entry.result?.outcome).result, {outcome: {outcome: 'selected', optionId: 'no'}});
  for (const result of [claude, cursor, grok, opencode, codex, acp]) assert.equal(result.events.filter(e => e.type === 'done' || e.type === 'error').length, 1);
  assert.equal(liveChildren().length, 0);
});

test('signed-out, crash and malformed streams end in one error', async () => {
  const codex = await run('codex', 'signed-out');
  assert.equal(terminal(codex.events).type, 'error');
  assert.match(terminal(codex.events).message, /codex login/);
  const claude = await run('claude', 'signed-out');
  assert.match(terminal(claude.events).message, /login/);
  const acp = await run('gemini', 'signed-out');
  assert.match(terminal(acp.events).message, /^Gemini CLI is not signed in \(Authentication required\)\. Run gemini in Terminal\.$/);
  for (const provider of ['claude', 'cursor', 'grok', 'opencode', 'codex', 'gemini']) {
    const crash = await run(provider, 'crash');
    assert.equal(terminal(crash.events).type, 'error', provider);
    assert.match(terminal(crash.events).message, /provider crashed|ended/, provider);
    const malformed = await run(provider, 'malformed');
    const last = terminal(malformed.events);
    assert.equal(last.type, 'error', provider);
    assert.match(last.message, /unreadable|could not be read|ended/, provider);
    assert.equal(malformed.events.filter(e => e.type === 'done' || e.type === 'error').length, 1, provider);
  }
  assert.equal(liveChildren().length, 0);
});

test('Stop cancels a slow turn and kills the whole process group', async () => {
  for (const provider of ['claude', 'cursor', 'grok', 'opencode', 'codex', 'gemini']) {
    const controller = new AbortController();
    let pidFile;
    const result = collect(provider, 'slow', ctx => { pidFile = ctx.pidFile; return {signal: controller.signal}; });
    assert.ok(await waitFor(() => pidFile && existsSync(pidFile)), `${provider} started its grandchild`);
    const grandchild = Number(readFileSync(pidFile, 'utf8'));
    assert.ok(alive(grandchild));
    controller.abort();
    const {events, log} = await result;
    assert.deepEqual(terminal(events), {type: 'done', reason: 'cancelled'}, provider);
    assert.ok(await waitFor(() => !alive(grandchild)), `${provider} grandchild was killed`);
    if (provider === 'codex') assert.ok(log.some(entry => entry.rpc === 'turn/interrupt'), 'Codex is asked to interrupt first');
    if (provider === 'gemini') assert.ok(log.some(entry => entry.rpc === 'session/cancel'), 'an ACP agent is asked to cancel first');
  }
  assert.equal(liveChildren().length, 0);
});

test('idle timeout, early consumer exit and Quit leave no child behind', async () => {
  const stalled = await run('claude', 'slow', () => ({idleTimeoutMs: 300}));
  assert.deepEqual([terminal(stalled.events).type, terminal(stalled.events).code], ['error', 'stalled']);

  const ctx = context('slow');
  const turn = runTurn({provider: 'cursor', file: path.join(bin, 'cursor-agent'), prompt: 'x', cwd: ctx.cwd, env: ctx.env, idleTimeoutMs: 30000});
  assert.equal((await turn.next()).value.type, 'session');
  assert.ok(await waitFor(() => existsSync(ctx.pidFile)));
  await turn.return();
  assert.ok(await waitFor(() => !alive(Number(readFileSync(ctx.pidFile, 'utf8')))));

  const quit = context('slow');
  const pending = runTurn({provider: 'opencode', file: path.join(bin, 'opencode'), prompt: 'x', cwd: quit.cwd, env: quit.env, idleTimeoutMs: 30000});
  const first = pending.next();
  assert.ok(await waitFor(() => existsSync(quit.pidFile)));
  assert.equal(liveChildren().length, 1);
  await terminateAll(500);
  assert.ok(await waitFor(() => !alive(Number(readFileSync(quit.pidFile, 'utf8')))));
  await first;
  for await (const event of pending) if (event.type === 'error' || event.type === 'done') break;
  assert.equal(liveChildren().length, 0);
  removeRunDirectory(quit.cwd);
  assert.ok(!existsSync(quit.cwd));
});

test('parsers keep exactly one terminal event and tolerate unknown records', () => {
  for (const make of Object.values(PARSERS)) {
    const parser = make();
    assert.deepEqual(parser.push({type: 'unknown-record'}), []);
    const finished = parser.finish({exitCode: 2, stderr: 'boom'});
    assert.equal(finished.length, 1);
    assert.equal(finished[0].type, 'error');
    assert.deepEqual(parser.push({type: 'result', subtype: 'success'}), []);
    assert.deepEqual(parser.finish({exitCode: 0}), []);
  }
});

test('CLI actions ask Aux; a turn waiting on the answer is not idle', async t => {
  // The idle timer runs on a mock clock that moves only while a card is open, so a slow fake CLI
  // can't trip it and the card can stay open for many idle periods in no real time.
  t.mock.timers.enable({apis: ['setTimeout']});
  const asked = [];
  let waiting = 0;
  const approve = async request => { asked.push(request); waiting++; t.mock.timers.tick(7000); waiting--; return {allow: true}; };
  const options = () => ({approve, paused: () => waiting > 0, idleTimeoutMs: 700});
  const codex = await run('codex', 'ready', options);
  assert.deepEqual(terminal(codex.events), {type: 'done', reason: 'end'}, 'no stall while the card is open');
  assert.deepEqual(codex.log.find(entry => entry.result?.decision).result, {decision: 'accept'});
  const acp = await run('gemini', 'ready', options);
  assert.equal(acp.events.find(e => e.type === 'tool' && e.phase === 'end').isError, false);
  assert.deepEqual(acp.log.find(entry => entry.result?.outcome).result, {outcome: {outcome: 'selected', optionId: 'yes'}});
  assert.deepEqual(asked.map(request => [request.kind, request.command]), [['command', 'touch notes.txt'], ['command', 'touch notes.txt']]);
  const unpaused = await run('codex', 'ready', () => ({...options(), paused: () => false}));
  assert.equal(terminal(unpaused.events).code, 'stalled', 'the same wait with nothing paused is a stall');
});

test('resume continues the CLI session; one that cannot be found fails as resume', async () => {
  const codex = await run('codex', 'ready', () => ({resume: 'thr_1', keep: true, effort: 'high', images: [{data: 'AAAA', mimeType: 'image/png'}]}));
  assert.equal(texts(codex.events), 'Codex');
  const rpc = codex.log.filter(entry => entry.rpc);
  assert.deepEqual(rpc.slice(2, 4).map(entry => entry.rpc), ['thread/resume', 'turn/start']);
  assert.deepEqual(rpc[3].params.input, [{type: 'text', text: 'open example.com'}, {type: 'image', url: 'data:image/png;base64,AAAA'}]);
  assert.equal(rpc[3].params.effort, 'high');
  assert.deepEqual(codex.events[0], {type: 'session', id: 'thr_1'});
  const lost = await run('codex', 'ready', () => ({resume: 'thr_gone'}));
  assert.equal(terminal(lost.events).code, 'resume');

  const acp = await run('gemini', 'ready', () => ({resume: 'acp-1', systemPrompt: 'You are Aux.'}));
  assert.equal(texts(acp.events), 'Gemini', 'the replayed history is not shown again');
  assert.deepEqual(acp.log.filter(entry => entry.rpc).map(entry => entry.rpc).slice(1, 3), ['session/load', 'session/prompt']);
  assert.equal(acp.log.find(entry => entry.rpc === 'session/prompt').params.prompt.length, 1, 'a resumed session already has the instructions');

  const claude = await run('claude', 'ready', () => ({resume: 'session-1', keep: true, effort: 'max', images: [{data: 'AAAA', mimeType: 'image/png'}]}));
  const args = claude.log[0].args;
  assert.deepEqual([args[args.indexOf('--resume') + 1], args[args.indexOf('--effort') + 1], args.includes('--no-session-persistence')], ['session-1', 'max', false]);
  assert.equal(claude.log.find(entry => entry.prompt).images, 1);
  const opencode = await run('opencode', 'ready', () => ({resume: 'ses_1', images: [{data: 'AAAA', mimeType: 'image/png'}], systemPrompt: 'You are Aux.'}));
  const openArgs = opencode.log[0].args;
  assert.equal(openArgs[openArgs.indexOf('--session') + 1], 'ses_1');
  assert.match(openArgs[openArgs.indexOf('--file') + 1], /aux-image-1\.png$/);
  assert.deepEqual(JSON.parse(opencode.log.find(entry => entry.config).config).instructions.map(file => path.basename(file)), ['aux-instructions.md']);
  assert.deepEqual(readdirSync(opencode.ctx.cwd), [], 'images, instructions and config go with the turn');
});

test('a CLI dies with the daemon: closing fd 3 kills its whole process group', async () => {
  const child = launch('/bin/sh', ['-c', 'sleep 300 & echo $!; wait']);
  const [line] = await new Promise(resolve => child.stdout.once('data', chunk => resolve(String(chunk).trim().split('\n'))));
  const grandchild = Number(line);
  assert.ok(alive(grandchild));
  child.stdio[3].destroy();
  assert.ok(await waitFor(() => !alive(grandchild)), 'the grandchild went too');
  assert.ok(await waitFor(() => child.exitCode !== null || child.signalCode !== null));
});

import {buildArgs} from './drivers.mjs';

test('folders granted in Settings › Agent reach Cursor and Grok Build too', () => {
  for (const driver of ['cursor-stream-json', 'grok-streaming-json']) {
    const {args} = buildArgs(driver, {prompt: 'p', cwd: mkdtempSync(path.join(tmpdir(), 'aux-folders-')), folders: ['/a', '/b']}, {args: []});
    assert.deepEqual(args.flatMap((arg, index) => arg === '--add-dir' ? [args[index + 1]] : []), ['/a', '/b'], driver);
  }
});

test('folders granted in Settings › Agent reach Claude Code', () => {
  const {args} = buildArgs('claude-stream-json', {prompt: 'p', cwd: '/run', folders: ['/a', '/b']}, {args: []});
  assert.deepEqual(args.filter((arg, index) => arg === '--add-dir' || args[index - 1] === '--add-dir'), ['--add-dir', '/a', '--add-dir', '/b']);
});
