/** Daemon side of the provider CLIs (design.md, "Integration"). The release build copies this
 * folder beside aux-native-entry.mjs and the composed entry calls one instance from its model
 * manager, model runtime, tRPC router, auth middleware and shutdown (integration.mjs). It reads
 * no credential: detection runs --version and the CLI's own status command, and a turn runs the
 * CLI with the user's own login. */
import {createHash, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {providerById, settingsRow} from './catalog.mjs';
import {detectAll, childEnvironment} from './detect.mjs';
import {runTurn, prepareRunDirectory, removeRunDirectory} from './drivers.mjs';
import {terminateAll, installExitCleanup} from './process.mjs';

/** pi-ai `api` id of every CLI-backed model; the wrapped model runtime routes it here. */
export const API = 'aux-provider-cli';
/** Daemon provider id → CLI id. Codex and Claude Code take over the supplied subscription rows. */
export const DAEMON_PROVIDERS = Object.freeze({'openai-codex': 'codex', 'claude-code': 'claude', 'cursor-cli': 'cursor',
  'grok-cli': 'grok', 'opencode-cli': 'opencode', 'copilot-cli': 'copilot'});
/** The Agent's browser tools a CLI turn may call over MCP. Shell and file tools stay off. */
export const MCP_TOOLS = Object.freeze(['repl', 'webfetch', 'websearch', 'get_time']);
export const MCP_PATH = /^\/mcp\/v1\/([A-Za-z0-9_-]{1,80})\/?$/;
const MCP_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
// Settings checks reuse a result for 30 s; model lists and chat reuse it for 5 min, so CLIs are
// not started in the background on every inventory read. A sign-in error drops it at once.
const CACHE_MS = 30000, PASSIVE_MS = 5 * 60000, TOKEN_TTL_MS = 30 * 60000, MAX_BODY = 4 << 20, MAX_HISTORY = 60000;
const MODEL_NAMES = {sonnet: 'Claude Sonnet', opus: 'Claude Opus', haiku: 'Claude Haiku', auto: 'Auto'};
const COST = Object.freeze({input: 0, output: 0, cacheRead: 0, cacheWrite: 0});

const owns = id => typeof id === 'string' && Object.hasOwn(DAEMON_PROVIDERS, id);
const entryFor = id => owns(id) ? providerById(DAEMON_PROVIDERS[id]) : undefined;
const modelIds = (entry, detection) => {
  const ids = detection?.models?.length ? detection.models : entry.models;
  return ids.length ? ids : ['default'];
};
const modelName = (entry, id) => id === 'default' ? `${entry.product} default` : MODEL_NAMES[id] ?? id;
const modelInfo = (provider, entry, id) => ({id, name: modelName(entry, id), provider, reasoning: false, contextWindow: 200000,
  maxTokens: 32000, availableThinkingLevels: ['off'], supportsFastMode: false, supportsVision: false, isCustom: false});
const piModel = (provider, entry, id) => ({id, name: modelName(entry, id), api: API, provider, baseUrl: '', reasoning: false,
  input: ['text'], cost: {...COST}, contextWindow: 200000, maxTokens: 32000});
const digest = token => createHash('sha256').update(token).digest();
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}});
const ok = (id, result) => ({jsonrpc: '2.0', id, result});
const rpcError = (id, code, message) => ({jsonrpc: '2.0', id, error: {code, message}});
const message = error => error instanceof Error ? error.message : String(error);

const textOf = content => typeof content === 'string' ? content : Array.isArray(content)
  ? content.map(part => part?.type === 'text' ? part.text : part?.type === 'image' ? '[image omitted]' : '').filter(Boolean).join('\n') : '';

/** The system prompt from either context shape: pi's `systemPrompt` or a leading system message. */
export function systemPromptOf(context) {
  if (typeof context?.systemPrompt === 'string') return context.systemPrompt || undefined;
  return textOf(context?.messages?.find(entry => entry?.role === 'system')?.content) || undefined;
}

const transcriptLine = entry => {
  if (entry.role === 'user') return `User: ${textOf(entry.content)}`;
  if (entry.role === 'assistant') {
    const text = (entry.content ?? []).filter(part => part?.type === 'text').map(part => part.text).join('');
    return text ? `Assistant: ${text}` : '';
  }
  if (entry.role === 'toolResult') return `Result of ${entry.toolName ?? 'a tool'}: ${textOf(entry.content).slice(0, 2000)}`;
  return '';
};

/** One prompt for a CLI that keeps no session: the latest user message, after the earlier
 * conversation when there is one (the newest MAX_HISTORY characters). */
export function buildPrompt(context, limit = MAX_HISTORY) {
  const messages = (context?.messages ?? []).filter(entry => entry && entry.role !== 'system');
  const last = messages.findLastIndex(entry => entry.role === 'user');
  const request = last >= 0 ? textOf(messages[last].content) : '';
  let history = messages.slice(0, Math.max(last, 0)).map(transcriptLine).filter(Boolean).join('\n\n');
  if (!history) return request;
  if (history.length > limit) history = `…${history.slice(-limit)}`;
  return `Conversation so far:\n\n${history}\n\nReply to the latest message:\n\n${request}`;
}

function applyUsage(output, usage) {
  if (!usage || typeof usage !== 'object') return;
  const n = value => Number.isFinite(value) ? value : 0;
  const input = n(usage.input_tokens ?? usage.input ?? usage.inputTokens), out = n(usage.output_tokens ?? usage.output ?? usage.outputTokens);
  const cacheRead = n(usage.cache_read_input_tokens ?? usage.cache?.read), cacheWrite = n(usage.cache_creation_input_tokens ?? usage.cache?.write);
  Object.assign(output.usage, {input, output: out, cacheRead, cacheWrite, totalTokens: input + out + cacheRead + cacheWrite});
}

const notReady = (entry, found) => found?.state === 'signed-out' ? `${entry.product} is not signed in. Run ${entry.login} in Terminal.`
  : !found || found.state === 'not-installed' ? `Install ${entry.product} to use your ${entry.label} plan in Aux.`
  : found.detail ?? `${entry.product} is not ready.`;
const SIGNED_OUT = /not (?:logged|signed) in|log ?in required|unauthori[sz]ed|run \S+ (?:auth )?login|\/login\b/i;

/** One daemon instance. Options exist for tests: detection, turn runner, environment and clock. */
export function createAuxProviderCli({detect = detectAll, run = runTurn, env = () => process.env, now = Date.now, cacheMs = CACHE_MS, passiveMs = PASSIVE_MS, log = console} = {}) {
  let snapshot = null, pending = null, config = {};
  const listeners = new Map(), turns = new Map();
  const detection = id => snapshot?.providers.find(found => found.id === DAEMON_PROVIDERS[id]);
  const runnable = id => detection(id)?.state === 'ready' && !!entryFor(id)?.driver;
  const fresh = (maxAge = cacheMs) => !!snapshot && now() - snapshot.checkedAt < maxAge;
  const key = () => JSON.stringify(snapshot?.providers.map(found => [found.id, found.state, found.version ?? null, found.models ?? null]) ?? null);

  /** Detect every CLI at most once per cache period; concurrent callers share one run. */
  function refresh({force = false, maxAge = cacheMs} = {}) {
    if (!force && fresh(maxAge)) return Promise.resolve(snapshot);
    if (pending) return pending;
    const before = key();
    pending = (async () => {
      try {
        const result = await detect({env: env()});
        snapshot = {checkedAt: now(), directories: result.directories, providers: result.providers};
      } catch (error) {
        log.warn?.('[provider-cli] detection failed', message(error));
        snapshot = {checkedAt: now(), directories: snapshot?.directories ?? [], providers: snapshot?.providers ?? []};
      } finally {
        pending = null;
      }
      if (key() !== before) for (const notify of listeners.values()) try { notify(); } catch {}
      return snapshot;
    })();
    return pending;
  }
  const background = () => { if (!fresh(passiveMs)) refresh({maxAge: passiveMs}).catch(() => {}); };

  function rows() {
    return Object.fromEntries(Object.entries(DAEMON_PROVIDERS).map(([id, cli]) =>
      [id, {...settingsRow(providerById(cli), detection(id) ?? {state: 'not-installed'}), providerId: id}]));
  }

  const models = () => Object.keys(DAEMON_PROVIDERS).filter(runnable)
    .flatMap(id => modelIds(entryFor(id), detection(id)).map(model => modelInfo(id, entryFor(id), model)));
  /** Replace any supplied model for a CLI-owned provider with the CLI's own models. */
  function decorateModels(list) {
    background();
    return [...list.filter(model => !owns(model.provider)), ...models()];
  }

  /** Settings inventory: CLI providers are connected while their CLI is ready. Copilot appears,
   * unconnected, only when its CLI is installed. `notify` re-publishes the inventory after a
   * detection changes what it would contain. */
  function decorateInventory(value, accountId, notify) {
    if (notify) listeners.set(accountId ?? null, notify);
    const connectedProviders = value.connectedProviders.filter(entry => !owns(entry.providerId));
    const visibleModelIdsByProvider = {...value.visibleModelIdsByProvider};
    for (const id of Object.keys(DAEMON_PROVIDERS)) {
      delete visibleModelIdsByProvider[id];
      const found = detection(id);
      if (runnable(id)) {
        connectedProviders.push({providerId: id, type: 'cli', linked: true, state: 'active'});
        visibleModelIdsByProvider[id] = modelIds(entryFor(id), found);
      } else if (entryFor(id).hiddenUnlessInstalled && found && found.state !== 'not-installed') {
        connectedProviders.push({providerId: id, type: 'cli', linked: false, state: 'active'});
      }
    }
    return {...value, availableModels: decorateModels(value.availableModels), connectedProviders, visibleModelIdsByProvider};
  }

  async function resolveModel(modelId, provider) {
    if (snapshot) background(); else await refresh();
    if (!runnable(provider)) return undefined;
    const entry = entryFor(provider);
    return modelIds(entry, detection(provider)).includes(modelId) ? {model: piModel(provider, entry, modelId), apiKey: ''} : undefined;
  }

  /** Per-turn private folder and, when the turn carries the Agent's tools, a turn token and MCP URL. */
  function openTurn(scope) {
    const root = typeof config.runRoot === 'function' ? config.runRoot() : config.runRoot;
    if (!root) throw Error('Provider CLIs are not started.');
    const id = randomUUID().replaceAll('-', ''), cwd = prepareRunDirectory(root, id), controller = new AbortController();
    let mcp;
    if (scope?.tools && config.mcpOrigin) {
      const token = randomBytes(32).toString('base64url');
      turns.set(id, {digest: digest(token), scope, controller, expires: now() + TOKEN_TTL_MS});
      mcp = {url: `${config.mcpOrigin}/mcp/v1/${id}`, token};
    }
    return {id, cwd, mcp, close() {
      turns.delete(id);
      controller.abort(Error('The turn ended.'));
      try { removeRunDirectory(cwd); } catch {}
    }};
  }

  /** pi-ai stream for one CLI turn. `createStream` is pi's createAssistantMessageEventStream. */
  function stream(model, context, options = {}, createStream) {
    const events = createStream();
    const output = {role: 'assistant', content: [], api: model.api, provider: model.provider, model: model.id,
      usage: {input: 0, output: 0, cacheRead: 0, cacheWrite: 0, totalTokens: 0, cost: {...COST, total: 0}}, stopReason: 'stop', timestamp: now()};
    let block = null, ended = false;
    const close = () => {
      if (!block) return;
      const part = output.content[block.index];
      events.push({type: `${block.kind}_end`, contentIndex: block.index, content: block.kind === 'text' ? part.text : part.thinking, partial: output});
      block = null;
    };
    const append = (kind, delta) => {
      if (!delta) return;
      if (block?.kind !== kind) {
        close();
        output.content.push(kind === 'text' ? {type: 'text', text: ''} : {type: 'thinking', thinking: ''});
        block = {kind, index: output.content.length - 1};
        events.push({type: `${kind}_start`, contentIndex: block.index, partial: output});
      }
      const part = output.content[block.index];
      if (kind === 'text') part.text += delta; else part.thinking += delta;
      events.push({type: `${kind}_delta`, contentIndex: block.index, delta, partial: output});
    };
    const finish = event => {
      if (ended) return;
      ended = true;
      close();
      if (event.type === 'done') events.push({type: 'done', reason: 'stop', message: output});
      else {
        output.stopReason = event.reason;
        output.errorMessage = event.message;
        events.push({type: 'error', reason: event.reason, error: output});
      }
      events.end();
    };
    const failure = text => ({type: 'error', reason: options.signal?.aborted ? 'aborted' : 'error', message: text});
    events.push({type: 'start', partial: output});
    // The terminal event is published only after the CLI's process group and turn folder are gone.
    (async () => {
      let turn, terminal;
      const entry = entryFor(model.provider);
      try {
        if (!entry) { terminal = failure(`No provider CLI owns ${model.provider}.`); return; }
        await refresh({maxAge: passiveMs});
        const found = detection(model.provider);
        if (!runnable(model.provider)) { terminal = failure(notReady(entry, found)); return; }
        turn = openTurn(options.auxProviderCli);
        const request = {provider: entry.id, file: found.path, cwd: turn.cwd, env: childEnvironment(env(), snapshot.directories),
          prompt: buildPrompt(context), systemPrompt: systemPromptOf(context), model: model.id === 'default' ? undefined : model.id,
          mcp: turn.mcp, signal: options.signal, clientVersion: config.version};
        for await (const event of run(request)) {
          if (event.type === 'text') append('text', event.delta);
          else if (event.type === 'reasoning') append('thinking', event.delta);
          else if (event.type === 'tool' && event.phase === 'start') append('thinking', `\nUsing ${String(event.name ?? 'a tool').replace(/^mcp__aux__/, '')}\n`);
          else if (event.type === 'done') {
            if (event.reason === 'cancelled') terminal = {type: 'error', reason: 'aborted', message: 'Stopped.'};
            else { applyUsage(output, event.usage); terminal = {type: 'done'}; }
            break;
          } else if (event.type === 'error') {
            if (SIGNED_OUT.test(event.message ?? '')) { snapshot.checkedAt = 0; terminal = failure(notReady(entry, {state: 'signed-out'})); }
            else terminal = failure(event.message || `${entry.product} failed.`);
            break;
          }
        }
        terminal ??= failure(`${entry.product} ended without a reply.`);
      } catch (error) {
        terminal = failure(message(error));
      } finally {
        turn?.close();
        finish(terminal ?? failure('The provider CLI turn failed.'));
      }
    })();
    return events;
  }

  /** Route CLI-backed models (api === API) to `stream`; every other model keeps pi's runtime. */
  function wrapRuntime(runtime, createStream) {
    for (const method of ['stream', 'streamSimple']) {
      const original = runtime[method].bind(runtime);
      runtime[method] = (model, context, options) => model?.api === API ? stream(model, context, options, createStream) : original(model, context, options);
    }
    return runtime;
  }

  const available = turn => (turn.scope.tools() ?? []).filter(tool => MCP_TOOLS.includes(tool.name));
  const schema = parameters => ({type: 'object', ...JSON.parse(JSON.stringify(parameters ?? {}))});
  const toolResult = (value, isError) => ({isError, content: (value?.content ?? []).flatMap(part =>
    part?.type === 'text' ? [{type: 'text', text: String(part.text ?? '')}]
    : part?.type === 'image' && part.data ? [{type: 'image', data: part.data, mimeType: part.mimeType ?? 'image/png'}] : [])});

  /** One tool call through the Agent's own path: argument validation, before/after hooks and the
   * browser-tool owner wrapper the session passes in `scope`. */
  async function callTool(turn, {name, arguments: args = {}} = {}) {
    const tool = available(turn).find(entry => entry.name === name);
    if (!tool) return toolResult({content: [{type: 'text', text: `Unknown tool: ${name}`}]}, true);
    const {scope, controller: {signal}} = turn;
    const toolCall = {type: 'toolCall', id: `aux_cli_${randomUUID().replaceAll('-', '')}`, name, arguments: args};
    try {
      const parsed = scope.prepareArguments ? scope.prepareArguments(tool, toolCall) : args;
      const call = {assistantMessage: {role: 'assistant', content: [toolCall], timestamp: now()}, toolCall, args: parsed, context: scope.context?.()};
      const gate = await scope.beforeToolCall?.(call, signal);
      if (gate?.block) return toolResult({content: [{type: 'text', text: gate.reason || 'Tool execution was blocked.'}]}, true);
      const execute = () => tool.execute(toolCall.id, parsed, signal, () => {});
      let value = await (scope.execute ? scope.execute({toolCall, tool, args: parsed}, execute) : execute()), isError = false;
      const after = await scope.afterToolCall?.({...call, result: value, isError}, signal);
      if (after) { value = {...value, content: after.content ?? value.content}; isError = after.isError ?? isError; }
      return toolResult(value, isError);
    } catch (error) {
      return toolResult({content: [{type: 'text', text: message(error)}]}, true);
    }
  }

  async function answer(turn, request) {
    if (!request || typeof request !== 'object' || request.jsonrpc !== '2.0' || typeof request.method !== 'string') return rpcError(request?.id ?? null, -32600, 'Invalid request');
    if (request.id === undefined) return null;
    const {id, method, params = {}} = request;
    try {
      switch (method) {
        case 'initialize':
          return ok(id, {protocolVersion: MCP_VERSIONS.includes(params.protocolVersion) ? params.protocolVersion : MCP_VERSIONS[0],
            capabilities: {tools: {listChanged: false}}, serverInfo: {name: 'aux', title: 'Aux browser', version: config.version ?? '1.0.0'}});
        case 'ping': return ok(id, {});
        case 'tools/list': return ok(id, {tools: available(turn).map(tool => ({name: tool.name, description: tool.description ?? '', inputSchema: schema(tool.parameters)}))});
        case 'tools/call': return ok(id, await callTool(turn, params));
        default: return rpcError(id, -32601, `Method not found: ${method}`);
      }
    } catch (error) {
      return rpcError(id, -32603, message(error));
    }
  }

  /** Streamable-HTTP MCP endpoint for one live turn. The caller has already limited it to loopback
   * connections with no browser origin; this checks the turn token against the path. */
  async function handleMcp(request) {
    const id = MCP_PATH.exec(new URL(request.url).pathname)?.[1], turn = id && turns.get(id);
    const token = /^Bearer\s+(\S+)$/i.exec(request.headers.get('authorization') ?? '')?.[1];
    if (turn && turn.expires < now()) turns.delete(id);
    if (!turn || !token || turn.expires < now() || !timingSafeEqual(digest(token), turn.digest)) return json({error: {code: 'UNAUTHORIZED', message: 'Missing or invalid turn token.'}}, 401);
    if (request.method !== 'POST') return new Response(null, {status: 405, headers: {allow: 'POST'}});
    const body = await request.text();
    if (body.length > MAX_BODY) return json(rpcError(null, -32600, 'Request too large'), 413);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return json(rpcError(null, -32700, 'Parse error'), 400); }
    const replies = (await Promise.all((Array.isArray(parsed) ? parsed : [parsed]).map(entry => answer(turn, entry)))).filter(Boolean);
    if (!replies.length) return new Response(null, {status: 202});
    return json(Array.isArray(parsed) ? replies : replies[0]);
  }

  return Object.freeze({
    owns, providerIds: () => Object.keys(DAEMON_PROVIDERS),
    refresh, status: async ({refresh: force = false} = {}) => { await refresh({force}); return {checkedAt: snapshot.checkedAt, rows: rows()}; },
    inventoryKey: () => { background(); return key(); },
    decorateModels, decorateInventory, resolveModel, wrapRuntime, stream,
    isMcpPath: pathname => typeof pathname === 'string' && pathname.startsWith('/mcp/v1/'), handleMcp,
    /** Daemon start: where turns run, the MCP origin, and the abrupt-exit cleanup. */
    start({runRoot, mcpOrigin, version} = {}) { config = {runRoot, mcpOrigin, version}; installExitCleanup(); },
    /** Daemon shutdown: revoke every turn token and stop every CLI process group. */
    async stop() {
      for (const turn of turns.values()) turn.controller.abort(Error('Aux is shutting down.'));
      turns.clear();
      await terminateAll();
    },
    liveTurns: () => turns.size,
  });
}
