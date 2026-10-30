/** Daemon side of the provider CLIs (design.md, "Integration"). The release build copies this
 * folder beside aux-native-entry.mjs and the composed entry calls one instance from its model
 * manager, model runtime, tRPC router, auth middleware and shutdown (integration.mjs). It reads
 * no credential: detection runs --version, the CLI's own status command and Codex's model list,
 * and a turn runs the CLI with the user's own login, its own actions asked through Aux's approvals. */
import {execFile} from 'node:child_process';
import {createHash, randomBytes, randomUUID, timingSafeEqual} from 'node:crypto';
import {fastModel, modelSpecs, providerById, settingsRow} from './catalog.mjs';
import {detectAll, childEnvironment, resolveCommand} from './detect.mjs';
import {acpAnswers, runTurn, prepareRunDirectory, removeRunDirectory, claudePermissionRequest, claudePermissionAnswer, PERMISSION_TOOL} from './drivers.mjs';
import {createLocalAgents, parseCommand, resolveProgram, showCommand} from './local-agents.mjs';
import {terminateAll, installExitCleanup} from './process.mjs';

/** pi-ai `api` id of every CLI-backed model; the wrapped model runtime routes it here. */
export const API = 'aux-provider-cli';
/** Daemon provider id → CLI id. Codex and Claude Code take over the supplied subscription rows. */
export const DAEMON_PROVIDERS = Object.freeze({'openai-codex': 'codex', 'claude-code': 'claude', 'cursor-cli': 'cursor',
  'grok-cli': 'grok', 'opencode-cli': 'opencode', 'copilot-cli': 'copilot', 'gemini-cli': 'gemini', 'local-agent-cli': 'local'});
/** The Agent's browser tools a CLI turn may call over MCP. Shell and file tools stay off. */
export const MCP_TOOLS = Object.freeze(['repl', 'webfetch', 'websearch', 'get_time']);
export const MCP_PATH = /^\/mcp\/v1\/([A-Za-z0-9_-]{1,80})\/?$/;
const MCP_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
// Settings checks reuse a result for 30 s, or 2 s while a CLI is signed out or failing so a
// window-focus check sees a fresh `claude auth login`; model lists and chat reuse it for 5 min,
// so CLIs are not started in the background on every inventory read. A sign-in error drops it
// at once. Re-checks reuse the login-shell PATH for 5 min.
const CACHE_MS = 30000, RECHECK_MS = 2000, PASSIVE_MS = 5 * 60000, TOKEN_TTL_MS = 30 * 60000, MAX_BODY = 4 << 20, MAX_HISTORY = 60000;
// Threads whose CLI session Aux keeps for the next turn; the oldest one's folder goes first.
const MAX_SESSIONS = 32;
const COST = Object.freeze({input: 0, output: 0, cacheRead: 0, cacheWrite: 0});
const THINKING_LEVELS = new Set(['minimal', 'low', 'medium', 'high', 'xhigh', 'max']);

const owns = id => typeof id === 'string' && Object.hasOwn(DAEMON_PROVIDERS, id);
const entryFor = id => owns(id) ? providerById(DAEMON_PROVIDERS[id]) : undefined;
const efforts = spec => (spec.efforts ?? []).filter(level => THINKING_LEVELS.has(level));
const capability = (entry, spec) => ({name: spec.name ?? (spec.id === 'default' ? `${entry.product} default` : spec.id), reasoning: efforts(spec).length > 0,
  vision: entry.images && spec.vision !== false, contextWindow: spec.contextWindow ?? entry.contextWindow});
const modelInfo = (provider, entry, spec) => {
  const {name, reasoning, vision, contextWindow} = capability(entry, spec);
  return {id: spec.id, name, provider, reasoning, contextWindow, maxTokens: 32000, availableThinkingLevels: ['off', ...efforts(spec)],
    supportsFastMode: false, supportsVision: vision, isCustom: false};
};
const piModel = (provider, entry, spec) => {
  const {name, reasoning, vision, contextWindow} = capability(entry, spec);
  return {id: spec.id, name, api: API, provider, baseUrl: '', reasoning, input: vision ? ['text', 'image'] : ['text'], cost: {...COST}, contextWindow, maxTokens: 32000};
};
const digest = token => createHash('sha256').update(token).digest();
const json = (body, status = 200) => new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}});
const ok = (id, result) => ({jsonrpc: '2.0', id, result});
const rpcError = (id, code, message) => ({jsonrpc: '2.0', id, error: {code, message}});
const message = error => error instanceof Error ? error.message : String(error);

const textOf = (content, image = '[image omitted]') => typeof content === 'string' ? content : Array.isArray(content)
  ? content.map(part => part?.type === 'text' ? part.text : part?.type === 'image' ? image : '').filter(Boolean).join('\n') : '';
const imagesOf = message => (Array.isArray(message?.content) ? message.content : [])
  .filter(part => part?.type === 'image' && part.data).map(part => ({data: part.data, mimeType: part.mimeType ?? 'image/png'}));
const conversation = context => (context?.messages ?? []).filter(entry => entry && entry.role !== 'system');

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

/** One prompt for a CLI that has no session for this thread yet: the latest user message, after
 * the earlier conversation when there is one (the newest `limit` characters). `attached`: the
 * latest message's images travel beside the text. */
export function buildPrompt(context, {limit = MAX_HISTORY, attached = false} = {}) {
  const messages = conversation(context);
  const last = messages.findLastIndex(entry => entry.role === 'user');
  const request = last >= 0 ? textOf(messages[last].content, attached ? '' : undefined) : '';
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

// "Authentication error" is what the panel's error card files under sign-in problems.
const notReady = (entry, found) => entry.id === 'local' ? 'Add a local agent in Settings › Models.' : found?.state === 'signed-out'
  ? `Authentication error: ${entry.product} is not signed in. Run ${entry.login} in Terminal, then check again in Settings › Models.`
  : !found || found.state === 'not-installed' ? `Install ${entry.product} to use your ${entry.label} plan in Aux.`
  : found.detail ?? `${entry.product} is not ready.`;
const SIGNED_OUT = /not (?:logged|signed) in|not authenticated|auth(?:entication)? required|log ?in required|unauthori[sz]ed|run \S+ (?:auth )?login|\/login\b/i;

/** The Aux tool call an approval request is checked as, so Aux's permission rules and approval
 * card see a CLI's own shell, file and fetch actions as the Agent's own. */
function auxToolCall(request) {
  switch (request.kind) {
    case 'command': return ['bash', {command: request.command, ...(request.cwd ? {cwd: request.cwd} : {})}];
    case 'write': return ['edit_file', {path: request.path}];
    case 'read': return ['read_file', {path: request.path}];
    case 'fetch': return ['webfetch', {url: request.url}];
  }
  return [request.name ?? 'tool', request.input ?? {}];
}
const toolName = name => String(name ?? 'tool').replace(/^(?:mcp__aux__|aux[._-])/, '');
const outputText = value => typeof value === 'string' ? value : Array.isArray(value?.content) ? textOf(value.content) : JSON.stringify(value ?? '');

/** One daemon instance. Options exist for tests: detection, turn runner, environment and clock. */
export function createAuxProviderCli({detect = detectAll, run = runTurn, env = () => process.env, now = Date.now, cacheMs = CACHE_MS, passiveMs = PASSIVE_MS, log = console, answers = acpAnswers} = {}) {
  let snapshot = null, pending = null, config = {}, local = null;
  const listeners = new Map(), turns = new Map(), sessions = new Map();
  const detection = id => snapshot?.providers.find(found => found.id === DAEMON_PROVIDERS[id]);
  const runnable = id => detection(id)?.state === 'ready';
  const settled = () => !snapshot || snapshot.providers.every(found => found.state === 'ready' || found.state === 'not-installed');
  const fresh = (maxAge = cacheMs) => !!snapshot && now() - snapshot.checkedAt < maxAge;
  const key = () => JSON.stringify(snapshot?.providers.map(found => [found.id, found.state, found.version ?? null, found.models ?? null]) ?? null);

  /** The added commands, as the local provider's models. A command is never run to detect it. */
  function localDetection() {
    const agents = local?.list() ?? [];
    return {id: 'local', state: agents.length ? 'ready' : 'not-installed', path: null, models: agents.map(({id, name}) => ({id, name}))};
  }

  /** Detect every CLI at most once per cache period; concurrent callers share one run. */
  function refresh({force = false, maxAge = cacheMs} = {}) {
    if (!force && fresh(maxAge)) return Promise.resolve(snapshot);
    if (pending) return pending;
    const before = key();
    pending = (async () => {
      const reuse = snapshot?.directories.length && now() - snapshot.pathCheckedAt < passiveMs;
      try {
        const result = await detect({env: env(), previous: snapshot?.providers, ...(reuse ? {searchDirectories: snapshot.directories} : {})});
        snapshot = {checkedAt: now(), pathCheckedAt: reuse ? snapshot.pathCheckedAt : now(), directories: result.directories,
          providers: [...result.providers.filter(found => found.id !== 'local'), localDetection()]};
      } catch (error) {
        log.warn?.('[provider-cli] detection failed', message(error));
        snapshot = {checkedAt: now(), pathCheckedAt: snapshot?.pathCheckedAt ?? 0, directories: snapshot?.directories ?? [], providers: snapshot?.providers ?? []};
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

  const specs = id => modelSpecs(entryFor(id), detection(id));
  const models = () => Object.keys(DAEMON_PROVIDERS).filter(runnable).flatMap(id => specs(id).map(spec => modelInfo(id, entryFor(id), spec)));
  /** Replace any supplied model for a CLI-owned provider with the CLI's own models. */
  function decorateModels(list) {
    background();
    return [...list.filter(model => !owns(model.provider)), ...models()];
  }

  /** Settings inventory: CLI providers are connected while their CLI is ready. Copilot and Gemini
   * appear only when their CLI is installed, unconnected while it fails. `notify` re-publishes the
   * inventory after a detection changes what it would contain. */
  function decorateInventory(value, accountId, notify) {
    if (notify) listeners.set(accountId ?? null, notify);
    const connectedProviders = value.connectedProviders.filter(entry => !owns(entry.providerId));
    const visibleModelIdsByProvider = {...value.visibleModelIdsByProvider};
    for (const id of Object.keys(DAEMON_PROVIDERS)) {
      delete visibleModelIdsByProvider[id];
      const found = detection(id);
      if (runnable(id)) {
        connectedProviders.push({providerId: id, type: 'cli', linked: true, state: 'active'});
        visibleModelIdsByProvider[id] = specs(id).map(spec => spec.id);
      } else if (entryFor(id).hiddenUnlessInstalled && found && found.state !== 'not-installed') {
        connectedProviders.push({providerId: id, type: 'cli', linked: false, state: 'active'});
      }
    }
    return {...value, availableModels: decorateModels(value.availableModels), connectedProviders, visibleModelIdsByProvider};
  }

  /** The quick model for titles and file names: the provider's own, on a CLI. A selection on
   * another provider stays as it is. */
  function quickModel(selection) {
    if (!selection || !owns(selection.provider)) return selection;
    const modelId = fastModel(entryFor(selection.provider), detection(selection.provider));
    return modelId ? {...selection, modelId} : selection;
  }

  async function resolveModel(modelId, provider) {
    if (snapshot) background(); else await refresh();
    if (!runnable(provider)) return undefined;
    const spec = specs(provider).find(candidate => candidate.id === modelId);
    return spec ? {model: piModel(provider, entryFor(provider), spec), apiKey: ''} : undefined;
  }

  /** The kept CLI session of one Aux thread: its folder (the CLI's cwd, which Claude Code keys
   * sessions by), the CLI's session id and how many messages that session has seen. */
  function sessionFor(provider, sessionId) {
    const key = createHash('sha256').update(`${provider}\0${sessionId}`).digest('hex').slice(0, 32);
    const state = sessions.get(key) ?? {key};
    sessions.delete(key);
    sessions.set(key, state);
    for (const [old, value] of sessions) {
      if (sessions.size <= MAX_SESSIONS) break;
      sessions.delete(old);
      if (value.cwd) try { removeRunDirectory(value.cwd); } catch {}
    }
    return state;
  }

  /** Gate one tool call through the session's own hooks; an open approval card holds the turn. */
  async function gate(turn, toolCall) {
    const {scope, controller: {signal}} = turn;
    const call = {assistantMessage: {role: 'assistant', content: [toolCall], timestamp: now()}, toolCall, args: toolCall.arguments, context: scope.context?.()};
    turn.waiting++;
    try {
      return {call, verdict: await scope.beforeToolCall?.(call, signal)};
    } finally {
      turn.waiting--;
    }
  }
  /** A CLI's own action, asked as the matching Aux tool call. Without the session's hooks the answer is no. */
  async function approve(turn, request) {
    if (!turn.scope?.beforeToolCall) return {allow: false, reason: 'Aux cannot ask for approval here.'};
    const [name, args] = auxToolCall(request);
    try {
      const {verdict} = await gate(turn, {type: 'toolCall', id: `aux_cli_${randomUUID().replaceAll('-', '')}`, name, arguments: args});
      return verdict?.block ? {allow: false, reason: verdict.reason} : {allow: true};
    } catch (error) {
      return {allow: false, reason: message(error)};
    }
  }

  /** Turn folder (the thread's kept folder, or a private one removed with the turn) and, when the
   * turn carries the Agent's tools, a turn token and MCP URL. */
  function openTurn(scope, session, driver) {
    const root = typeof config.runRoot === 'function' ? config.runRoot() : config.runRoot;
    if (!root) throw Error('Provider CLIs are not started.');
    const id = randomUUID().replaceAll('-', ''), cwd = prepareRunDirectory(root, session?.key ?? id);
    if (session) session.cwd = cwd;
    const turn = {scope, controller: new AbortController(), waiting: 0, permissionTool: driver === 'claude-stream-json'};
    let mcp;
    if (scope?.tools && config.mcpOrigin) {
      const token = randomBytes(32).toString('base64url');
      Object.assign(turn, {digest: digest(token), expires: now() + TOKEN_TTL_MS});
      turns.set(id, turn);
      mcp = {url: `${config.mcpOrigin}/mcp/v1/${id}`, token};
    }
    return {id, cwd, mcp, approve: request => approve(turn, request), paused: () => turn.waiting > 0, close() {
      turns.delete(id);
      turn.controller.abort(Error('The turn ended.'));
      if (!session) try { removeRunDirectory(cwd); } catch {}
    }};
  }

  /** CLI tool activity as the Agent's own tool events, so the panel draws its tool cards. */
  function toolEvents(scope) {
    const open = new Map();
    const send = event => { if (scope?.emit) Promise.resolve().then(() => scope.emit(event)).catch(() => {}); };
    const end = (id, output, isError) => {
      const name = open.get(id);
      open.delete(id);
      send({type: 'tool_execution_end', toolCallId: `cli_${id}`, toolName: name, result: {content: [{type: 'text', text: outputText(output)}], details: {}}, isError});
    };
    return {
      push(event) {
        if (event.phase === 'start' && !open.has(event.id)) {
          open.set(event.id, toolName(event.name));
          send({type: 'tool_execution_start', toolCallId: `cli_${event.id}`, toolName: open.get(event.id), args: event.input ?? {}});
        } else if (event.phase === 'end' && open.has(event.id)) end(event.id, event.output, event.isError === true);
      },
      close: isError => { for (const id of [...open.keys()]) end(id, '', isError); },
    };
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
      let turn, terminal, session;
      const entry = entryFor(model.provider), scope = options.auxProviderCli, tools = toolEvents(scope);
      try {
        if (!entry) { terminal = failure(`No provider CLI owns ${model.provider}.`); return; }
        await refresh({maxAge: passiveMs});
        const found = detection(model.provider);
        if (!runnable(model.provider)) { terminal = failure(notReady(entry, found)); return; }
        const added = entry.id === 'local' ? local?.find(model.id) : undefined;
        if (entry.id === 'local' && !added) { terminal = failure('That local agent was removed. Choose another model.'); return; }
        // Chat turns keep one CLI session per thread; quick calls (titles, names) run fresh.
        session = scope && options.sessionId ? sessionFor(model.provider, options.sessionId) : undefined;
        turn = openTurn(scope, session, entry.driver);
        const messages = conversation(context);
        const spec = specs(model.provider).find(candidate => candidate.id === model.id) ?? {id: model.id};
        const request = {provider: entry.id, file: added?.file ?? found.path, acpArgs: added?.args, cwd: turn.cwd, env: childEnvironment(env(), snapshot.directories),
          systemPrompt: systemPromptOf(context), model: model.id === 'default' ? undefined : model.id,
          effort: efforts(spec).includes(options.reasoning) ? options.reasoning : undefined, keep: !!session,
          mcp: turn.mcp, signal: options.signal, clientVersion: config.version, approve: turn.approve, paused: turn.paused,
          folders: scope?.folders?.() ?? []};
        const attempt = resume => {
          const unseen = resume ? messages.slice(session.sent) : messages;
          return run({...request, resume, prompt: buildPrompt({messages: unseen}, {attached: entry.images}),
            images: entry.images ? imagesOf(unseen.findLast(message => message.role === 'user')) : []});
        };
        // The CLI's session continues only while it has seen every message but the new ones.
        const continued = session?.cli && messages.length > session.sent && messages[session.sent - 1]?.role === 'assistant';
        let cliSession;
        for (const resume of continued ? [session.cli, undefined] : [undefined]) {
          let progressed = false;
          terminal = undefined;
          for await (const event of attempt(resume)) {
            if (event.type === 'session') cliSession = event.id;
            else if (event.type === 'text') { progressed = true; append('text', event.delta); }
            else if (event.type === 'reasoning') { progressed = true; append('thinking', event.delta); }
            else if (event.type === 'tool') { progressed = true; tools.push(event); }
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
          // A CLI that cannot find or load its earlier session starts again with the whole thread.
          if (!resume || progressed || terminal?.type === 'done') break;
        }
        terminal ??= failure(`${entry.product} ended without a reply.`);
        if (session) Object.assign(session, terminal.type === 'done' ? {cli: cliSession ?? session.cli, sent: messages.length + 1} : {cli: undefined});
      } catch (error) {
        terminal = failure(message(error));
      } finally {
        tools.close(terminal?.type !== 'done');
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
  const PERMISSION_SCHEMA = {type: 'object', properties: {tool_name: {type: 'string'}, input: {type: 'object'}, tool_use_id: {type: 'string'}}, required: ['tool_name', 'input']};
  const listed = turn => [...available(turn).map(tool => ({name: tool.name, description: tool.description ?? '', inputSchema: schema(tool.parameters)})),
    ...(turn.permissionTool ? [{name: PERMISSION_TOOL, description: 'Aux asks the user before Claude Code runs one of its own tools.', inputSchema: PERMISSION_SCHEMA}] : [])];
  const schema = parameters => ({type: 'object', ...JSON.parse(JSON.stringify(parameters ?? {}))});
  const toolResult = (value, isError) => ({isError, content: (value?.content ?? []).flatMap(part =>
    part?.type === 'text' ? [{type: 'text', text: String(part.text ?? '')}]
    : part?.type === 'image' && part.data ? [{type: 'image', data: part.data, mimeType: part.mimeType ?? 'image/png'}] : [])});

  /** One tool call through the Agent's own path: argument validation, before/after hooks and the
   * browser-tool owner wrapper the session passes in `scope`. */
  async function callTool(turn, {name, arguments: args = {}} = {}) {
    if (name === PERMISSION_TOOL && turn.permissionTool) {
      const decision = await approve(turn, claudePermissionRequest(args));
      return {isError: false, content: [{type: 'text', text: claudePermissionAnswer(decision.allow, args.input, decision.reason)}]};
    }
    const tool = available(turn).find(entry => entry.name === name);
    if (!tool) return toolResult({content: [{type: 'text', text: `Unknown tool: ${name}`}]}, true);
    const {scope, controller: {signal}} = turn;
    const toolCall = {type: 'toolCall', id: `aux_cli_${randomUUID().replaceAll('-', '')}`, name, arguments: args};
    try {
      const parsed = scope.prepareArguments ? scope.prepareArguments(tool, toolCall) : args;
      const {call, verdict} = await gate(turn, {...toolCall, arguments: parsed});
      if (verdict?.block) return toolResult({content: [{type: 'text', text: verdict.reason || 'Tool execution was blocked.'}]}, true);
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
        case 'tools/list': return ok(id, {tools: listed(turn)});
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
    // Sliding expiry: a long turn, or one held on an approval card, keeps its token while in use.
    turn.expires = now() + TOKEN_TTL_MS;
    if (request.method !== 'POST') return new Response(null, {status: 405, headers: {allow: 'POST'}});
    const body = await request.text();
    if (body.length > MAX_BODY) return json(rpcError(null, -32600, 'Request too large'), 413);
    let parsed;
    try { parsed = JSON.parse(body); } catch { return json(rpcError(null, -32700, 'Parse error'), 400); }
    const replies = (await Promise.all((Array.isArray(parsed) ? parsed : [parsed]).map(entry => answer(turn, entry)))).filter(Boolean);
    if (!replies.length) return new Response(null, {status: 202});
    return json(Array.isArray(parsed) ? replies : replies[0]);
  }

  /** A command as the exact program and arguments Aux would run; nothing is started. */
  async function checkLocalAgent(command) {
    await refresh({maxAge: passiveMs});
    const [program, ...args] = parseCommand(command);
    const file = resolveProgram(program, snapshot.directories, resolveCommand);
    return {file, args, command: showCommand([file, ...args])};
  }
  /** After the person confirmed the command: it has to answer as an ACP agent to be kept. */
  async function addLocalAgent({name, command}) {
    if (!local) throw Error('Provider CLIs are not started.');
    const {file, args} = await checkLocalAgent(command);
    const root = typeof config.runRoot === 'function' ? config.runRoot() : config.runRoot;
    const cwd = prepareRunDirectory(root, `probe-${randomUUID().replaceAll('-', '')}`);
    try {
      if (!await answers(file, args, {env: childEnvironment(env(), snapshot.directories), cwd}))
        throw Error('That command didn’t answer as an ACP agent. Check its flags: most agents need one such as --acp.');
    } finally {
      removeRunDirectory(cwd);
    }
    const id = local.add({name: String(name).trim().slice(0, 64) || showCommand([file]), file, args});
    await refresh({force: true});
    return {id, agents: localAgents()};
  }
  const localAgents = () => (local?.list() ?? []).map(({id, name, file, args}) => ({id, name, command: showCommand([file, ...args])}));

  return Object.freeze({
    owns, providerIds: () => Object.keys(DAEMON_PROVIDERS), quickModel,
    localAgents, checkLocalAgent, addLocalAgent,
    async removeLocalAgent(id) {
      local?.remove(id);
      await refresh({force: true});
      return {agents: localAgents()};
    },
    /** Opens Terminal for a login command the person copied; Aux never runs it for them. */
    openTerminal: () => new Promise(resolve => execFile('/usr/bin/open', ['-a', 'Terminal'], error => resolve({opened: !error}))),
    refresh, status: async ({refresh: force = false} = {}) => {
      await refresh({force, maxAge: settled() ? cacheMs : RECHECK_MS});
      return {checkedAt: snapshot.checkedAt, rows: rows()};
    },
    inventoryKey: () => { background(); return key(); },
    decorateModels, decorateInventory, resolveModel, wrapRuntime, stream,
    isMcpPath: pathname => typeof pathname === 'string' && pathname.startsWith('/mcp/v1/'), handleMcp,
    /** Daemon start: where turns run, the MCP origin, the abrupt-exit cleanup, and the first
     * detection, so Settings and the first send do not wait for it. */
    start({runRoot, mcpOrigin, version, localAgentsFile} = {}) {
      config = {runRoot, mcpOrigin, version};
      if (localAgentsFile) local = createLocalAgents(localAgentsFile);
      installExitCleanup();
      refresh().catch(() => {});
    },
    /** Daemon shutdown: revoke every turn token, stop every CLI process group, remove the kept folders. */
    async stop() {
      for (const turn of turns.values()) turn.controller.abort(Error('Aux is shutting down.'));
      turns.clear();
      await terminateAll();
      for (const {cwd} of sessions.values()) if (cwd) try { removeRunDirectory(cwd); } catch {}
      sessions.clear();
    },
    liveTurns: () => turns.size,
  });
}
