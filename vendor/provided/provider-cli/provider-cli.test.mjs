import assert from 'node:assert/strict';
import {chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {PROVIDERS, providerById, parseAuthStatus, settingsRow, detectAll, childEnvironment, runTurn,
  prepareRunDirectory, removeRunDirectory, liveChildren, terminateAll, PARSERS, userLoginPath} from './index.mjs';

const fixture = fileURLToPath(new URL('./fixtures/fake-cli.mjs', import.meta.url));
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-provider-cli-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));
const bin = path.join(scratch, 'bin'), empty = path.join(scratch, 'empty');
for (const directory of [bin, empty]) prepareRunDirectory(scratch, path.basename(directory));
for (const name of ['codex', 'claude', 'cursor-agent', 'grok', 'opencode']) {
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
  assert.equal(ready.runnable, true);
  assert.match(ready.actions[0].text, /claude auth logout/);
  assert.equal(settingsRow(providerById('copilot'), {state: 'not-installed'}).hidden, true);
  assert.equal(settingsRow(providerById('copilot'), {state: 'ready'}).runnable, false);
  for (const entry of PROVIDERS) assert.ok(entry.login && entry.install.url.startsWith('https://'));
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
  assert.equal(ready.copilot.state, 'not-installed');
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
  for (const flag of ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages', '--strict-mcp-config', '--no-session-persistence']) assert.ok(args.includes(flag), flag);
  assert.equal(args[args.indexOf('--allowedTools') + 1], 'mcp__aux');
  assert.equal(claude.log[1].prompt, 'open example.com', 'prompt arrives on stdin, not argv');
  assert.ok(!args.includes('open example.com'));
  const config = readFileSync(args[args.indexOf('--mcp-config') + 1], 'utf8');
  assert.ok(config.includes('${AUX_MCP_TOKEN}') && !config.includes('turn-token-123'), 'token stays in the environment');
  assert.equal(statSync(args[args.indexOf('--mcp-config') + 1]).mode & 0o777, 0o600);
  assert.equal(claude.log[0].hasToken, true);
  assert.deepEqual(claude.log[0].auxLeak, []);

  const cursor = await run('cursor', 'ready');
  assert.equal(texts(cursor.events), 'Hello');
  assert.equal(cursor.events.find(e => e.type === 'tool' && e.phase === 'end').output.content, 'opened');
  assert.ok(existsSync(path.join(cursor.ctx.cwd, '.cursor/mcp.json')));
  assert.ok(cursor.log[0].args.includes('--approve-mcps') && cursor.log[0].args.includes('--trust'));

  const grok = await run('grok', 'ready');
  assert.equal(texts(grok.events), 'Grok here');
  assert.deepEqual(grok.log[0].args.slice(0, 4), ['mcp', 'add', '--scope', 'project']);
  assert.equal(grok.log.find(entry => entry.prompt).prompt, 'open example.com');
  assert.equal(terminal(grok.events).type, 'done');

  const opencode = await run('opencode', 'ready');
  assert.equal(texts(opencode.events), 'OpenCode');
  assert.deepEqual(opencode.events.filter(e => e.type === 'tool').map(e => e.phase), ['start', 'end']);
  assert.deepEqual(opencode.log[0].args.slice(0, 4), ['run', '--standalone', '--format', 'json']);
  assert.match(readFileSync(path.join(opencode.ctx.cwd, 'opencode.json'), 'utf8'), /\{env:AUX_MCP_TOKEN\}/);

  const codex = await run('codex', 'ready');
  assert.equal(texts(codex.events), 'Codex');
  assert.equal(codex.events[0].type, 'session');
  assert.deepEqual(terminal(codex.events), {type: 'done', reason: 'end'});
  const rpc = codex.log.filter(entry => entry.rpc);
  assert.deepEqual(rpc.slice(0, 4).map(entry => entry.rpc), ['initialize', 'initialized', 'thread/start', 'turn/start']);
  assert.equal(rpc[2].params.approvalPolicy, 'never');
  assert.deepEqual(rpc.find(entry => entry.result?.decision).result, {decision: 'decline'}, 'approval requests are declined');
  assert.ok(codex.log[0].args.includes('mcp_servers.aux.bearer_token_env_var="AUX_MCP_TOKEN"'));
  assert.ok(!codex.log[0].args.join(' ').includes('turn-token-123'));
  for (const result of [claude, cursor, grok, opencode, codex]) assert.equal(result.events.filter(e => e.type === 'done' || e.type === 'error').length, 1);
  assert.equal(liveChildren().length, 0);
});

test('signed-out, crash and malformed streams end in one error', async () => {
  const codex = await run('codex', 'signed-out');
  assert.equal(terminal(codex.events).type, 'error');
  assert.match(terminal(codex.events).message, /codex login/);
  const claude = await run('claude', 'signed-out');
  assert.match(terminal(claude.events).message, /login/);
  for (const provider of ['claude', 'cursor', 'grok', 'opencode', 'codex']) {
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
  for (const provider of ['claude', 'cursor', 'grok', 'opencode', 'codex']) {
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
