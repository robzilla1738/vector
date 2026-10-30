/** Run one chat turn through a provider's official CLI and yield Aux events (stream.mjs).
 * The CLI uses the user's own login; Aux passes no provider credential. Browser tools are
 * offered through the daemon's per-turn MCP endpoint (design.md, "Browser tools"). The CLI's
 * own shell and file actions ask Aux first (`options.approve`); turns waiting on an answer
 * are not idle (`options.paused`). */
import {mkdirSync, rmSync, writeFileSync, chmodSync} from 'node:fs';
import path from 'node:path';
import {providerById} from './catalog.mjs';
import {PARSERS} from './stream.mjs';
import {launch, lines, terminate, capture} from './process.mjs';

export const MCP_SERVER_NAME = 'aux';
export const MCP_TOKEN_ENV = 'AUX_MCP_TOKEN';
/** Aux's MCP tool that answers Claude Code's permission prompts. */
export const PERMISSION_TOOL = 'permission';
const DEFAULT_IDLE_MS = 180000;
// An approval card can stay open as long as the user leaves it; the CLI must not give up first.
const APPROVAL_WAIT_S = 86400;

/** Per-turn private working directory (0700). The CLI's cwd; holds MCP config files. */
export function prepareRunDirectory(root, turnId) {
  if (!/^[A-Za-z0-9_-]{1,80}$/.test(turnId)) throw Error('Invalid turn id');
  const directory = path.join(root, turnId);
  mkdirSync(directory, {recursive: true, mode: 0o700});
  chmodSync(directory, 0o700);
  return directory;
}
export const removeRunDirectory = directory => rmSync(directory, {recursive: true, force: true});

const writePrivate = (file, content) => { mkdirSync(path.dirname(file), {recursive: true, mode: 0o700}); writeFileSync(file, content, {mode: 0o600}); return file; };
const EXTENSIONS = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/gif': 'gif', 'image/webp': 'webp'};
const writeImages = (cwd, images = []) => images.map((image, index) =>
  writePrivate(path.join(cwd, `aux-image-${index + 1}.${EXTENSIONS[image.mimeType] ?? 'png'}`), Buffer.from(image.data, 'base64')));

/** MCP wiring for each CLI. The token travels in the environment wherever the CLI's config
 * supports env interpolation; Grok's project config takes a literal header. `files` are removed
 * when the turn ends. */
export function mcpSetup(driver, {url, token, cwd}) {
  if (!url) return {args: driver === 'claude-stream-json' ? ['--permission-prompts', 'none'] : [], env: {}, setup: [], files: []};
  const env = {[MCP_TOKEN_ENV]: token};
  const server = `mcp_servers.${MCP_SERVER_NAME}`;
  switch (driver) {
    case 'codex-app-server':
      return {env, setup: [], files: [], args: ['-c', `${server}.url=${JSON.stringify(url)}`, '-c', `${server}.bearer_token_env_var=${JSON.stringify(MCP_TOKEN_ENV)}`,
        '-c', `${server}.tool_timeout_sec=${APPROVAL_WAIT_S}`]};
    case 'claude-stream-json': {
      const file = writePrivate(path.join(cwd, '.aux-mcp.json'), JSON.stringify({mcpServers: {[MCP_SERVER_NAME]: {type: 'http', url,
        headers: {Authorization: `Bearer \${${MCP_TOKEN_ENV}}`}, timeout: APPROVAL_WAIT_S * 1000}}}));
      return {env, setup: [], files: [file], args: ['--mcp-config', file, '--strict-mcp-config', '--allowedTools', `mcp__${MCP_SERVER_NAME}`,
        '--permission-prompt-tool', `mcp__${MCP_SERVER_NAME}__${PERMISSION_TOOL}`]};
    }
    case 'cursor-stream-json':
      return {env, setup: [], args: ['--approve-mcps'],
        files: [writePrivate(path.join(cwd, '.cursor', 'mcp.json'), JSON.stringify({mcpServers: {[MCP_SERVER_NAME]: {url, headers: {Authorization: `Bearer \${env:${MCP_TOKEN_ENV}}`}}}}))]};
    case 'grok-streaming-json':
      return {env, args: ['--allow', `mcp__${MCP_SERVER_NAME}`], files: [path.join(cwd, '.grok', 'config.toml')],
        setup: [['mcp', 'add', '--scope', 'project', '--transport', 'http', '--header', `Authorization: Bearer ${token}`, MCP_SERVER_NAME, url]]};
    case 'opencode-json':
      return {env, setup: [], args: [], files: [],
        config: {mcp: {[MCP_SERVER_NAME]: {type: 'remote', url, enabled: true, headers: {Authorization: `Bearer {env:${MCP_TOKEN_ENV}}`}}}}};
  }
  // ACP agents get the server and its header in session/new.
  return {env: {}, setup: [], args: [], files: []};
}

const claudeInput = (prompt, images = []) => JSON.stringify({type: 'user', message: {role: 'user', content: [{type: 'text', text: prompt},
  ...images.map(image => ({type: 'image', source: {type: 'base64', media_type: image.mimeType, data: image.data}}))]}}) + '\n';

/** argv for the line-oriented drivers. Returns {args, stdin, files} (stdin text or null). */
export function buildArgs(driver, {prompt, images, model, effort, cwd, systemPrompt, resume, keep, folders = []}, mcp = {args: []}) {
  const optional = (flag, value) => value ? [flag, value] : [];
  switch (driver) {
    case 'claude-stream-json':
      return {stdin: claudeInput(prompt, images), files: [], args: ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose',
        '--include-partial-messages', ...(keep ? [] : ['--no-session-persistence']), '--permission-mode', 'manual', ...mcp.args,
        ...folders.flatMap(folder => ['--add-dir', folder]),
        ...optional('--model', model), ...optional('--effort', effort), ...optional('--resume', resume), ...optional('--append-system-prompt', systemPrompt)]};
    case 'cursor-stream-json': {
      // Cursor reads always-applied project rules; --mode ask keeps its own tools read-only.
      const files = systemPrompt ? [writePrivate(path.join(cwd, '.cursor', 'rules', 'aux.mdc'), `---\ndescription: Aux\nalwaysApply: true\n---\n\n${systemPrompt}\n`)] : [];
      return {stdin: null, files, args: ['-p', '--output-format', 'stream-json', '--stream-partial-output', '--workspace', cwd,
        '--trust', '--mode', 'ask', '--sandbox', 'enabled', ...mcp.args, ...optional('--model', model), ...optional('--resume', resume), prompt]};
    }
    case 'grok-streaming-json': {
      const file = writePrivate(path.join(cwd, 'prompt.txt'), prompt);
      return {stdin: null, files: [file], args: ['--prompt-file', file, '--output-format', 'streaming-json', '--include-partial-messages',
        '--cwd', cwd, '--permission-mode', 'dontAsk', '--no-subagents', ...mcp.args, ...optional('--model', model),
        ...optional('--resume', resume), ...optional('--rules', systemPrompt)]};
    }
    case 'opencode-json': {
      // In `run`, an "ask" permission is answered by OpenCode itself: it rejects and the turn goes on.
      const instructions = systemPrompt ? [writePrivate(path.join(cwd, 'aux-instructions.md'), systemPrompt)] : [];
      const config = writePrivate(path.join(cwd, 'opencode.json'), JSON.stringify({$schema: 'https://opencode.ai/config.json',
        permission: {edit: 'ask', bash: 'ask'}, ...(instructions.length ? {instructions} : {}), ...mcp.config}));
      const attached = writeImages(cwd, images);
      return {stdin: null, files: [config, ...instructions, ...attached], args: ['run', '--standalone', '--format', 'json', '--title', 'Aux',
        ...mcp.args, ...optional('--model', model), ...optional('--session', resume), ...attached.flatMap(file => ['--file', file]), prompt]};
    }
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
 * Run one turn. options: {provider, file, prompt, images?, cwd, env, model?, effort?, systemPrompt?,
 * mcp?: {url, token}, resume?, keep?, approve?, paused?, signal?, idleTimeoutMs?}. `resume` is the
 * CLI session to continue; `keep` lets the CLI store the session so a later turn can. Yields
 * events; the last one is always `done` or `error`. The child process group and every file the
 * turn wrote are gone when the generator returns, including on early `return()` by the caller.
 */
export async function* runTurn(options) {
  const entry = providerById(options.provider);
  if (!entry?.driver) throw Error(`No Aux driver for ${options.provider}`);
  const mcp = mcpSetup(entry.driver, {...options.mcp, cwd: options.cwd});
  const env = {...options.env, ...mcp.env};
  const files = [...mcp.files];
  try {
    for (const args of mcp.setup) {
      const result = await capture(options.file, args, {cwd: options.cwd, env, timeoutMs: 15000});
      if (result.exitCode !== 0) { yield {type: 'error', code: 'mcp-setup', message: `Could not connect Aux tools to ${entry.product}.`}; return; }
    }
    if (entry.driver === 'codex-app-server') yield* runCodex(entry, options, env, mcp.args);
    else if (entry.driver === 'acp') yield* runAcp(entry, options, env);
    else yield* runLines(entry, options, env, mcp, files);
  } finally {
    for (const file of files) rmSync(file, {force: true});
  }
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
    idle = setTimeout(() => {
      if (options.paused?.()) return arm();
      emit([{type: 'error', code: 'stalled', message: 'The provider stopped responding.'}]);
      terminate(child);
    }, options.idleTimeoutMs ?? DEFAULT_IDLE_MS);
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

async function* runLines(entry, options, env, mcp, files) {
  const {args, stdin, files: written} = buildArgs(entry.driver, options, mcp);
  files.push(...written);
  const child = launch(options.file, args, {cwd: options.cwd, env, stdin: stdin === null ? 'ignore' : 'pipe'});
  if (stdin !== null) { child.stdin.on('error', () => {}); child.stdin.end(stdin); }
  const parser = PARSERS[entry.driver]();
  yield* supervise(child, options, parser, record => parser.push(record));
}

/** Newline-delimited JSON-RPC with a child. Codex's app-server omits the `jsonrpc` field; ACP
 * requires it. `receive` settles responses, answers the child's requests through `onRequest`
 * and returns the events for a notification. */
function rpcPeer(child, {jsonrpc, onRequest, onNotification}) {
  const pending = new Map();
  let nextId = 1;
  const write = message => { if (child.stdin.writable) child.stdin.write(JSON.stringify(jsonrpc ? {jsonrpc: '2.0', ...message} : message) + '\n'); };
  child.stdin.on('error', () => {});
  return {
    request: (method, params) => new Promise((resolve, reject) => { const id = nextId++; pending.set(id, {resolve, reject}); write({id, method, params}); }),
    notify: (method, params) => write({method, params}),
    receive(message) {
      if (message.id !== undefined && !message.method) {
        const waiter = pending.get(message.id);
        pending.delete(message.id);
        if (message.error) waiter?.reject(Object.assign(Error(message.error.message ?? 'Request failed'), {rpc: message.error}));
        else waiter?.resolve(message.result);
        return [];
      }
      if (message.id !== undefined) {
        Promise.resolve().then(() => onRequest(message))
          .then(result => write({id: message.id, result}), error => write({id: message.id, error: {code: error.rpcCode ?? -32603, message: error.message}}));
        return [];
      }
      return onNotification(message);
    },
  };
}
const unsupported = () => { throw Object.assign(Error('Not supported by Aux'), {rpcCode: -32601}); };
const deny = async () => ({allow: false});

/** Ask Aux about each request in turn; one refusal refuses the whole action. */
async function allowedAll(approve, requests) {
  for (const request of requests) if (!(await approve(request)).allow) return false;
  return true;
}

/** Codex's approval requests (protocol v2, generated by codex 0.165.0), answered by Aux. */
async function codexApproval({method, params = {}}, approve, items, cwd) {
  const command = text => ({kind: 'command', command: text ?? '', cwd: params.cwd ?? cwd, reason: params.reason ?? undefined});
  const writes = paths => (paths.length ? paths : [params.grantRoot ?? cwd]).map(file => ({kind: 'write', path: file, reason: params.reason ?? undefined}));
  switch (method) {
    case 'item/commandExecution/requestApproval':
      return {decision: await allowedAll(approve, [command(params.command)]) ? 'accept' : 'decline'};
    case 'item/fileChange/requestApproval':
      return {decision: await allowedAll(approve, writes((items.get(params.itemId)?.changes ?? []).map(change => change.path))) ? 'accept' : 'decline'};
    case 'item/permissions/requestApproval':
      return await allowedAll(approve, [{kind: 'tool', name: 'permissions', input: params.permissions ?? {}, reason: params.reason ?? undefined}])
        ? {permissions: params.permissions ?? {}, scope: 'turn'} : {permissions: {}, scope: 'turn'};
    case 'execCommandApproval':
      return {decision: await allowedAll(approve, [command([].concat(params.command ?? []).join(' '))]) ? 'approved' : 'denied'};
    case 'applyPatchApproval':
      return {decision: await allowedAll(approve, writes(Object.keys(params.fileChanges ?? {}))) ? 'approved' : 'denied'};
  }
  return unsupported();
}

const signedOutMessage = (entry, error) => error.rpc?.code === -32000 || /\bauth|\blog ?in\b|\bsign(?:ed)? ?in\b/i.test(error.message)
  ? `${entry.product} is not signed in (${error.message}). Run ${entry.login} in Terminal.` : error.message;
const startFailed = (entry, hooks, child) => error => {
  hooks.emit?.([{type: 'error', code: error.resume ? 'resume' : entry.id, message: error.resume ? error.message : signedOutMessage(entry, error)}]);
  terminate(child);
};
const resumeFailed = error => Object.assign(error, {resume: true});

/** Codex `app-server` over stdio JSON-RPC: initialize, thread/start or thread/resume, turn/start,
 * turn/interrupt. Shell and file actions outside the read-only sandbox ask Aux (on-request). */
async function* runCodex(entry, options, env, mcpArgs) {
  const child = launch(options.file, ['app-server', ...mcpArgs], {cwd: options.cwd, env, stdin: 'pipe'});
  const parser = PARSERS[entry.driver]();
  const items = new Map();
  let threadId, turnId;
  const peer = rpcPeer(child, {
    onRequest: message => codexApproval(message, options.approve ?? deny, items, options.cwd),
    onNotification: message => {
      if (message.method === 'turn/started') turnId = message.params?.turn?.id ?? turnId;
      if (message.method === 'item/started' && message.params?.item?.type === 'fileChange') items.set(message.params.item.id, message.params.item);
      return parser.push(message);
    },
  });
  const interrupt = () => threadId && turnId ? peer.request('turn/interrupt', {threadId, turnId}).catch(() => {}) : undefined;
  const hooks = {};
  const generator = supervise(child, options, parser, peer.receive, interrupt, hooks);
  const start = (async () => {
    await peer.request('initialize', {clientInfo: {name: 'aux', title: 'Aux', version: options.clientVersion ?? '1.0.0'}});
    peer.notify('initialized');
    const settings = {cwd: options.cwd, approvalPolicy: 'on-request', sandbox: 'read-only',
      ...(options.model ? {model: options.model} : {}), ...(options.systemPrompt ? {developerInstructions: options.systemPrompt} : {})};
    const thread = options.resume
      ? await peer.request('thread/resume', {threadId: options.resume, ...settings}).catch(error => { throw resumeFailed(error); })
      : await peer.request('thread/start', {...settings, ephemeral: !options.keep});
    threadId = thread?.thread?.id;
    if (options.resume) hooks.emit?.([{type: 'session', id: threadId}]);
    const input = [{type: 'text', text: options.prompt}, ...(options.images ?? []).map(image => ({type: 'image', url: `data:${image.mimeType};base64,${image.data}`}))];
    const turn = await peer.request('turn/start', {threadId, input, ...(options.effort ? {effort: options.effort} : {})});
    turnId = turn?.turn?.id ?? turnId;
    if (options.signal?.aborted) await interrupt();
  })();
  start.catch(startFailed(entry, hooks, child));
  yield* generator;
}

/** Codex's own model list (`model/list`), read once per detection. Starts no turn. */
export async function codexModels(file, {env, cwd, timeoutMs = 15000} = {}) {
  const child = launch(file, ['app-server'], {cwd, env, stdin: 'pipe'});
  const peer = rpcPeer(child, {onRequest: unsupported, onNotification: () => []});
  child.stderr.resume();
  const reader = (async () => { for await (const line of lines(child.stdout)) { try { peer.receive(JSON.parse(line)); } catch {} } })().catch(() => {});
  const timer = setTimeout(() => terminate(child, 500), timeoutMs);
  try {
    await peer.request('initialize', {clientInfo: {name: 'aux', title: 'Aux', version: '1.0.0'}});
    peer.notify('initialized');
    const models = [];
    let cursor;
    do {
      const page = await peer.request('model/list', {includeHidden: false, ...(cursor ? {cursor} : {})});
      models.push(...(page?.data ?? []));
      cursor = page?.nextCursor;
    } while (cursor);
    return models.filter(model => model?.id && !model.hidden).map(model => ({id: model.id, name: model.displayName || model.id,
      efforts: (model.supportedReasoningEfforts ?? []).map(option => option.reasoningEffort), vision: (model.inputModalities ?? ['text', 'image']).includes('image')}));
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
    await terminate(child, 500);
    await reader;
  }
}

/** Claude Code's permission-prompt input as an Aux approval request, and Claude's expected answer. */
export function claudePermissionRequest({tool_name: name = '', input = {}} = {}) {
  if (name === 'Bash') return {kind: 'command', command: input.command ?? ''};
  if (['Write', 'Edit', 'MultiEdit', 'NotebookEdit'].includes(name)) return {kind: 'write', path: input.file_path ?? input.notebook_path};
  if (['Read', 'Glob', 'Grep', 'LS'].includes(name)) return {kind: 'read', path: input.file_path ?? input.path ?? '.'};
  if (name === 'WebFetch') return {kind: 'fetch', url: input.url};
  return {kind: 'tool', name, input};
}
export const claudePermissionAnswer = (allowed, input, reason) =>
  JSON.stringify(allowed ? {behavior: 'allow', updatedInput: input ?? {}} : {behavior: 'deny', message: reason || 'Aux did not allow this action.'});

const ACP_KINDS = {execute: 'command', edit: 'write', delete: 'write', move: 'write', read: 'read', search: 'read', fetch: 'fetch'};
function acpPermissionRequest(call = {}) {
  const input = call.rawInput && typeof call.rawInput === 'object' ? call.rawInput : {};
  const kind = ACP_KINDS[call.kind] ?? 'tool';
  return {kind, name: call.title ?? 'tool', input, command: [].concat(input.command ?? call.title ?? '').join(' '),
    path: call.locations?.[0]?.path ?? input.path ?? input.file_path, url: input.url};
}
function acpChoice(options = [], allowed) {
  const kinds = allowed ? ['allow_once', 'allow_always'] : ['reject_once', 'reject_always'];
  const option = kinds.map(kind => options.find(entry => entry.kind === kind)).find(Boolean);
  return option ? {outcome: {outcome: 'selected', optionId: option.optionId}} : {outcome: {outcome: 'cancelled'}};
}

/** Any agent that speaks the Agent Client Protocol (JSON-RPC over stdio): initialize,
 * session/new or session/load, session/prompt, session/cancel. Aux offers no client file or
 * terminal access; the agent's own actions ask Aux through session/request_permission. */
async function* runAcp(entry, options, env) {
  const child = launch(options.file, entry.acpArgs, {cwd: options.cwd, env, stdin: 'pipe'});
  const parser = PARSERS.acp();
  const approve = options.approve ?? deny;
  let sessionId, loading = false;
  const peer = rpcPeer(child, {
    jsonrpc: true,
    onRequest: async ({method, params = {}}) => method === 'session/request_permission'
      ? acpChoice(params.options, (await approve(acpPermissionRequest(params.toolCall))).allow) : unsupported(),
    // session/load replays the stored conversation as updates; Aux already shows it.
    onNotification: message => loading ? [] : parser.push(message),
  });
  const hooks = {};
  const generator = supervise(child, options, parser, peer.receive, () => sessionId && peer.notify('session/cancel', {sessionId}), hooks);
  const start = (async () => {
    const init = await peer.request('initialize', {protocolVersion: 1, clientCapabilities: {fs: {readTextFile: false, writeTextFile: false}, terminal: false},
      clientInfo: {name: 'aux', title: 'Aux', version: options.clientVersion ?? '1.0.0'}});
    const capabilities = init?.agentCapabilities ?? {};
    const mcpServers = options.mcp?.url && capabilities.mcpCapabilities?.http
      ? [{type: 'http', name: MCP_SERVER_NAME, url: options.mcp.url, headers: [{name: 'Authorization', value: `Bearer ${options.mcp.token}`}]}] : [];
    if (options.resume) {
      if (!capabilities.loadSession) throw resumeFailed(Error(`${entry.product} cannot resume a session.`));
      loading = true;
      await peer.request('session/load', {sessionId: options.resume, cwd: options.cwd, mcpServers}).catch(error => { throw resumeFailed(error); });
      loading = false;
      sessionId = options.resume;
    } else {
      sessionId = (await peer.request('session/new', {cwd: options.cwd, mcpServers}))?.sessionId;
    }
    hooks.emit?.([{type: 'session', id: sessionId}]);
    const images = capabilities.promptCapabilities?.image ? options.images ?? [] : [];
    const prompt = [
      // ACP has no system-prompt field; a new session opens with Aux's instructions.
      ...(options.systemPrompt && !options.resume ? [{type: 'text', text: `<aux-instructions>\n${options.systemPrompt}\n</aux-instructions>`}] : []),
      {type: 'text', text: options.prompt + (options.images?.length > images.length ? '\n[image omitted]' : '')},
      ...images.map(image => ({type: 'image', data: image.data, mimeType: image.mimeType})),
    ];
    hooks.emit?.(parser.push({method: 'aux/prompt-result', result: await peer.request('session/prompt', {sessionId, prompt})}));
  })();
  start.catch(startFailed(entry, hooks, child));
  yield* generator;
}
