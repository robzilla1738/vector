/** Run one chat turn through a provider's official CLI and yield Aux events (stream.mjs).
 * The CLI uses the user's own login; Aux passes no provider credential. Browser tools are
 * offered through the daemon's per-turn MCP endpoint (design.md, "Browser tools"). */
import {mkdirSync, rmSync, writeFileSync, chmodSync} from 'node:fs';
import path from 'node:path';
import {providerById} from './catalog.mjs';
import {PARSERS} from './stream.mjs';
import {launch, lines, terminate, capture} from './process.mjs';

export const MCP_SERVER_NAME = 'aux';
export const MCP_TOKEN_ENV = 'AUX_MCP_TOKEN';
const DEFAULT_IDLE_MS = 180000;

/** Per-turn private working directory (0700). The CLI's cwd; holds MCP config files. */
export function prepareRunDirectory(root, turnId) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(turnId)) throw Error('Invalid turn id');
  const directory = path.join(root, turnId);
  mkdirSync(directory, {recursive: true, mode: 0o700});
  chmodSync(directory, 0o700);
  return directory;
}
export const removeRunDirectory = directory => rmSync(directory, {recursive: true, force: true});

const writePrivate = (file, content) => { mkdirSync(path.dirname(file), {recursive: true, mode: 0o700}); writeFileSync(file, content, {mode: 0o600}); };

/** MCP wiring for each CLI. The token travels in the environment wherever the CLI's config
 * supports env interpolation; Grok's project config takes a literal header. */
export function mcpSetup(driver, {url, token, cwd}) {
  if (!url) return {args: [], env: {}, setup: []};
  const env = {[MCP_TOKEN_ENV]: token};
  switch (driver) {
    case 'codex-app-server':
      return {env, setup: [], args: ['-c', `mcp_servers.${MCP_SERVER_NAME}.url=${JSON.stringify(url)}`, '-c', `mcp_servers.${MCP_SERVER_NAME}.bearer_token_env_var=${JSON.stringify(MCP_TOKEN_ENV)}`]};
    case 'claude-stream-json': {
      const file = path.join(cwd, '.aux-mcp.json');
      writePrivate(file, JSON.stringify({mcpServers: {[MCP_SERVER_NAME]: {type: 'http', url, headers: {Authorization: `Bearer \${${MCP_TOKEN_ENV}}`}}}}));
      return {env, setup: [], args: ['--mcp-config', file, '--strict-mcp-config', '--allowedTools', `mcp__${MCP_SERVER_NAME}`]};
    }
    case 'cursor-stream-json':
      writePrivate(path.join(cwd, '.cursor', 'mcp.json'), JSON.stringify({mcpServers: {[MCP_SERVER_NAME]: {url, headers: {Authorization: `Bearer \${env:${MCP_TOKEN_ENV}}`}}}}));
      return {env, setup: [], args: ['--approve-mcps']};
    case 'grok-streaming-json':
      return {env, args: ['--allow', `mcp__${MCP_SERVER_NAME}`],
        setup: [['mcp', 'add', '--scope', 'project', '--transport', 'http', '--header', `Authorization: Bearer ${token}`, MCP_SERVER_NAME, url]]};
    case 'opencode-json':
      writePrivate(path.join(cwd, 'opencode.json'), JSON.stringify({$schema: 'https://opencode.ai/config.json',
        permission: {edit: 'deny', bash: 'deny'},
        mcp: {[MCP_SERVER_NAME]: {type: 'remote', url, enabled: true, headers: {Authorization: `Bearer {env:${MCP_TOKEN_ENV}}`}}}}));
      return {env, setup: [], args: []};
  }
  return {args: [], env: {}, setup: []};
}

/** argv for the line-oriented drivers. Returns {args, stdin} (stdin text or null). */
export function buildArgs(driver, {prompt, model, cwd, systemPrompt}, mcpArgs = []) {
  switch (driver) {
    case 'claude-stream-json':
      return {stdin: prompt, args: ['-p', '--output-format', 'stream-json', '--verbose', '--include-partial-messages',
        '--no-session-persistence', '--permission-mode', 'dontAsk', '--tools', '', ...mcpArgs,
        ...(model ? ['--model', model] : []), ...(systemPrompt ? ['--append-system-prompt', systemPrompt] : [])]};
    case 'cursor-stream-json':
      return {stdin: null, args: ['-p', '--output-format', 'stream-json', '--stream-partial-output', '--workspace', cwd,
        '--trust', '--sandbox', 'enabled', ...mcpArgs, ...(model ? ['--model', model] : []), prompt]};
    case 'grok-streaming-json': {
      const file = path.join(cwd, 'prompt.txt');
      writePrivate(file, prompt);
      return {stdin: null, args: ['--prompt-file', file, '--output-format', 'streaming-json', '--include-partial-messages',
        '--cwd', cwd, '--permission-mode', 'dontAsk', '--no-subagents', ...mcpArgs, ...(model ? ['--model', model] : []),
        ...(systemPrompt ? ['--rules', systemPrompt] : [])]};
    }
    case 'opencode-json':
      return {stdin: null, args: ['run', '--standalone', '--format', 'json', '--title', 'Aux', ...mcpArgs, ...(model ? ['--model', model] : []), prompt]};
  }
  throw Error(`No line driver for ${driver}`);
}

/** Small push/pull queue so the generator can await child events. */
function queue() {
  const items = [];
  let wake, closed = false;
  return {
    push(item) { if (!closed) { items.push(item); wake?.(); } },
    close() { closed = true; wake?.(); },
    async *drain() {
      for (;;) {
        while (items.length) yield items.shift();
        if (closed) return;
        await new Promise(resolve => { wake = resolve; });
        wake = undefined;
      }
    },
  };
}

/**
 * Run one turn. options: {provider, file, prompt, cwd, env, model?, systemPrompt?, mcp?: {url, token},
 * signal?, idleTimeoutMs?}. Yields events; the last one is always `done` or `error`. The child
 * process group is gone when the generator returns, including on early `return()` by the caller.
 */
export async function* runTurn(options) {
  const entry = providerById(options.provider);
  if (!entry?.driver) throw Error(`No Aux driver for ${options.provider}`);
  const mcp = mcpSetup(entry.driver, {...options.mcp, cwd: options.cwd});
  const env = {...options.env, ...mcp.env};
  for (const args of mcp.setup) {
    const result = await capture(options.file, args, {cwd: options.cwd, env, timeoutMs: 15000});
    if (result.exitCode !== 0) { yield {type: 'error', code: 'mcp-setup', message: `Could not connect Aux tools to ${entry.product}.`}; return; }
  }
  if (entry.driver === 'codex-app-server') yield* runCodex(entry, options, env, mcp.args);
  else yield* runLines(entry, options, env, mcp.args);
}

async function* supervise(child, options, parser, onLine, onAbort, hooks = {}) {
  const events = queue();
  const stderr = [];
  let malformed = 0, valid = 0, idle, ended = false, cancelled = false;
  const emit = list => {
    for (const event of list) {
      if (ended) return;
      events.push(event);
      if (event.type === 'done' || event.type === 'error') { ended = true; clearTimeout(idle); events.close(); }
    }
  };
  hooks.emit = emit;
  const arm = () => {
    clearTimeout(idle);
    idle = setTimeout(() => { emit([{type: 'error', code: 'stalled', message: 'The provider stopped responding.'}]); terminate(child); }, options.idleTimeoutMs ?? DEFAULT_IDLE_MS);
  };
  const abort = () => {
    if (ended || cancelled) return;
    cancelled = true;
    if (!onAbort) { terminate(child); return; }
    // Ask the CLI to stop the turn itself; force the process group down if it does not.
    const force = setTimeout(() => terminate(child), 3000);
    force.unref?.();
    Promise.resolve(onAbort()).catch(() => {});
  };
  options.signal?.addEventListener('abort', abort, {once: true});
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', chunk => { stderr.push(chunk); while (stderr.length > 1 && stderr.join('').length > 8192) stderr.shift(); });
  arm();
  const reader = (async () => {
    for await (const line of lines(child.stdout)) {
      arm();
      let record;
      try { record = JSON.parse(line); } catch { malformed++; continue; }
      if (!record || typeof record !== 'object' || Array.isArray(record)) { malformed++; continue; }
      valid++;
      emit(onLine(record));
    }
  })().catch(() => {});
  const exited = new Promise(resolve => {
    child.once('close', (code, signal) => resolve({exitCode: code ?? (signal ? 128 : -1)}));
    child.once('error', error => { emit([{type: 'error', code: 'spawn', message: error.message}]); resolve({exitCode: -1}); });
  });
  exited.then(async ({exitCode}) => {
    await reader;
    if (cancelled) emit([{type: 'done', reason: 'cancelled'}]);
    if (!valid && malformed) emit([{type: 'error', code: 'malformed', message: `The provider's output could not be read (${malformed} line(s)).`}]);
    const tail = stderr.join('') + (malformed ? `\n${malformed} unreadable line(s) from the provider.` : '');
    emit(parser.finish({exitCode, stderr: tail}));
    emit([{type: 'error', code: 'exit', message: 'The provider ended unexpectedly.'}]);
  });
  if (options.signal?.aborted) abort();
  try {
    for await (const event of events.drain()) yield event;
  } finally {
    options.signal?.removeEventListener('abort', abort);
    clearTimeout(idle);
    await terminate(child);
  }
}

async function* runLines(entry, options, env, mcpArgs) {
  const {args, stdin} = buildArgs(entry.driver, options, mcpArgs);
  const child = launch(options.file, args, {cwd: options.cwd, env, stdin: stdin === null ? 'ignore' : 'pipe'});
  if (stdin !== null) { child.stdin.on('error', () => {}); child.stdin.end(stdin); }
  const parser = PARSERS[entry.driver]();
  yield* supervise(child, options, parser, record => parser.push(record));
}

const APPROVALS = new Set(['item/commandExecution/requestApproval', 'item/fileChange/requestApproval', 'item/permissions/requestApproval', 'applyPatchApproval', 'execCommandApproval']);

/** Codex `app-server` over stdio JSON-RPC: initialize, thread/start, turn/start, turn/interrupt. */
async function* runCodex(entry, options, env, mcpArgs) {
  const child = launch(options.file, ['app-server', ...mcpArgs], {cwd: options.cwd, env, stdin: 'pipe'});
  child.stdin.on('error', () => {});
  const parser = PARSERS[entry.driver]();
  const pending = new Map();
  let nextId = 1, threadId, turnId;
  const write = message => { if (child.stdin.writable) child.stdin.write(JSON.stringify(message) + '\n'); };
  const request = (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, {resolve, reject}); write({id, method, params}); });
  const onLine = message => {
    if (message.id !== undefined && !message.method) {
      const waiter = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) waiter?.reject(Object.assign(Error(message.error.message ?? 'Codex request failed'), {rpc: message.error}));
      else waiter?.resolve(message.result);
      return [];
    }
    if (message.id !== undefined && message.method) {
      // Server requests: Aux never grants shell, file or permission escalation from a chat turn.
      if (APPROVALS.has(message.method)) write({id: message.id, result: {decision: 'decline'}});
      else write({id: message.id, error: {code: -32601, message: 'Not supported by Aux'}});
      return [];
    }
    if (message.method === 'turn/started') turnId = message.params?.turn?.id ?? turnId;
    return parser.push(message);
  };
  const interrupt = () => threadId && turnId ? request('turn/interrupt', {threadId, turnId}).catch(() => {}) : undefined;
  const hooks = {};
  const generator = supervise(child, options, parser, onLine, interrupt, hooks);
  const start = (async () => {
    await request('initialize', {clientInfo: {name: 'aux', title: 'Aux', version: options.clientVersion ?? '1.0.0'}});
    write({method: 'initialized'});
    const thread = await request('thread/start', {cwd: options.cwd, ephemeral: true, approvalPolicy: 'never', sandbox: 'read-only',
      ...(options.model ? {model: options.model} : {}), ...(options.systemPrompt ? {developerInstructions: options.systemPrompt} : {})});
    threadId = thread?.thread?.id;
    const turn = await request('turn/start', {threadId, input: [{type: 'text', text: options.prompt}]});
    turnId = turn?.turn?.id ?? turnId;
    if (options.signal?.aborted) await interrupt();
  })();
  start.catch(error => {
    const message = /auth|login|sign/i.test(error.message) ? `Codex is not signed in. Run ${entry.login} in Terminal.` : error.message;
    hooks.emit?.([{type: 'error', code: 'codex', message}]);
    terminate(child);
  });
  yield* generator;
}
