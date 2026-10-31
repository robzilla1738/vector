// Test-only: what parity-harness.mjs does beyond the tRPC scenarios, once against the supplied bundle
// and once against Aux's. Each step takes the harness and returns JSON: every agent tool for each
// kind of session and through its execute path, the extension bridge end to end, the MCP manager
// and connection state, and Context Awareness. The supplied run's results are the references in
// fixtures/aux-daemon/; AUX_RECORD_FIXTURES=1 rewrites them from a sealed candidate.
import {createServer} from 'node:http';
import {mkdirSync, rmSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {SERVICE_STEPS} from './parity-steps-services.mjs';

/** A schema as JSON, with its symbol keys (TypeBox's kind and optional marks) as text. */
function plain(value) {
  if (Array.isArray(value)) return value.map(plain);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries([...Object.entries(value).map(([key, entry]) => [key, plain(entry)]),
    ...Object.getOwnPropertySymbols(value).map(symbol => [symbol.description, plain(value[symbol])])].sort(([a], [b]) => a.localeCompare(b)));
}
const describeTool = ({execute, parameters, dispose, ...tool}) => ({...tool, parameters: plain(parameters), execute: typeof execute, dispose: typeof dispose});

/** A tool context as the agent builds one (Thread.ctx), over a stand-in browser and hooks. */
function toolContext({daemon, trace}, session, extra = {}) {
  const context = {
    accountId: 0, session, accountRoot: daemon.getAccountTaskRoot(0), sessionDir: daemon.getSessionTaskDir(session, 0), settings: daemon.settings(0),
    hooks: {trigger: async (name, input) => { trace.push(['hook', name, input]); }}, agentState: {messages: []},
    models: {listAvailable: async () => [{provider: 'test', id: 'small', name: 'Small'}, {provider: 'test', id: 'large', name: 'Large'}]},
    browser: {state: {tabs: []}, extensionBridgeRoute: undefined,
      fetch: async url => { trace.push(['browser.fetch', String(url)]); return new Response('<html></html>', {headers: {'content-type': 'text/html'}}); },
      getCookiesForUrl: async url => { trace.push(['browser.cookies', url]); return 'a=b'; }},
    get toolState() { return this.session.toolState; },
    setToolState(update) { this.session = {...this.session, toolState: update(this.session.toolState)}; },
    getModelSelection: () => ({provider: 'test', modelId: 'test'}),
    suspend: async (kind, id, request) => {
      trace.push(['suspend', kind, id, request]);
      if (kind === 'ask-user-question') return {answers: request.questions.map(question => ({header: question.header, answer: 'Yes'}))};
      return kind === 'action-confirmation' ? (request.title === 'Stop' ? {verdict: 'deny', instruction: ' Do something else. '} : {verdict: 'confirm'}) : {verdict: 'allow'};
    },
    execSessions: {signal: new AbortController().signal, beginSpawn: () => ({starting() {}, attach() {}, cancelBeforeLaunch: () => true, unknown() {}}), get(id) {
      if (id !== 7) throw Error(`no exec session ${id}`);
      return {id, tty: true, interact: async request => { trace.push(['interact', request]); return request.input ? {text: 'done', status: 'exited', exitCode: 0} : {text: '', status: 'running'}; }};
    }},
    ...extra,
  };
  return context;
}

const MODEL = {provider: 'test', modelId: 'test', thinkingLevel: 'medium'};
const SESSION_KINDS = {
  root: {}, readOnly: {permissionMode: 'read-only'}, guard: {permissionMode: 'guard'}, incognito: {incognito: true}, ephemeral: {ephemeral: true},
  cli: {trigger: {type: 'user', source: 'cli'}}, onboarding: {trigger: {type: 'user', source: 'onboarding'}}, sidechat: {parentId: 'parent0000000000', trigger: {type: 'sidechat'}},
  subagent: {parentId: 'parent0000000000', trigger: {type: 'subagent', profile: 'default'}}, readOnlySubagent: {parentId: 'parent0000000000', trigger: {type: 'subagent', readOnly: true}},
  forkSelf: {parentId: 'parent0000000000', trigger: {type: 'subagent', profile: 'fork_self'}}, routine: {routineId: 'routine000000000', trigger: {type: 'routine'}},
  routineChild: {routineId: 'routine000000000', parentId: 'parent0000000000', trigger: {type: 'routine'}},
  finalConfirm: {runtimeConfig: {finalConfirm: true}}, coder: {harnessId: 'coder'}, channel: {trigger: {type: 'v2-channel', channelId: 'c 1'}},
};

/** Each toolset the agent harnesses build, for each kind of session. */
function toolLists(harness) {
  const {daemon} = harness;
  const base = daemon.SessionStore.insert(0, {title: 'Tool lists', model: MODEL});
  // Most tools repeat across the lists, so a list holds indexes into one catalog.
  const lists = {}, catalog = [], seen = new Map();
  const entry = tool => {
    const described = describeTool(tool), key = JSON.stringify(described);
    if (!seen.has(key)) seen.set(key, catalog.push(described) - 1);
    return seen.get(key);
  };
  const list = (name, build) => {
    try {
      lists[name] = build().map(entry);
    } catch (error) {
      lists[name] = {error: error.message};
    }
  };
  for (const [kind, overrides] of Object.entries(SESSION_KINDS)) {
    const session = {...base, ...overrides, runtimeConfig: {...base.runtimeConfig, ...overrides.runtimeConfig}};
    const context = () => toolContext(harness, session);
    list(`agent/${kind}`, () => daemon.createAgentToolset(context()));
    list(`channel/${kind}`, () => daemon.createChannelTools(context()));
    list(`coder/${kind}`, () => daemon.createCoderTools(context()));
  }
  // Aux Code offers start_coder; it is an experiment, off by default.
  daemon.settings(0).set('experimental', experimental => ({...experimental, auxCode: true}));
  list('agent/aux code', () => daemon.createAgentToolset(toolContext(harness, base)));
  list('coder/aux code', () => daemon.createCoderTools(toolContext(harness, base)));
  daemon.settings(0).set('experimental', experimental => ({...experimental, auxCode: false}));
  const context = toolContext(harness, base);
  list('orchestrator', () => daemon.createOrchestratorTools(context));
  list('alone', () => [daemon.createHistoryReadTool({accountId: 0}), daemon.createHistorySearchTool({accountId: 0, contextAwareness: true}), daemon.createHistorySearchTool({accountId: 0, contextAwareness: false}),
    daemon.createWriteFileTool(context, {overwrite: true}), daemon.createBashTool(context), daemon.createBashTool(context, {moveToBackground: () => {}}), daemon.structuredOutputTool({type: 'object', properties: {a: {type: 'string'}}}, () => {}),
    daemon.createStartCoderTool(context), daemon.createActionConfirmationTool(context), daemon.createWorkflowTool(context),
    ...Object.values(daemon.createBackgroundProcessTools(context)), ...Object.values(daemon.createAutomationTools(context)), ...Object.values(daemon.createMemoryTools(context)),
    daemon.createMemoryReadTool(context), daemon.createFdTool(context), daemon.createRgTool(context), daemon.createRoutineNotifyParentTool(context), daemon.createRoutineUpdateTool(context),
    daemon.createNotificationTool(context)]);
  return {catalog, lists};
}

/** Text the tools write or return that differs between runs for reasons of no interest. */
const scrub = (value, port) => JSON.parse(JSON.stringify(value ?? null).replaceAll(`127.0.0.1:${port}`, '<server>').replaceAll(new Date(performance.timeOrigin).toISOString().slice(0, 10), '<today>')
  .replace(/__AUX_OUTPUT_END_[0-9a-f-]+__/g, '<marker>').replace(/"id":"[\w-]{21}"/g, '"id":"<citation>"').replace(/source_id=\\"[\w-]{21}\\"/g, 'source_id=<citation>')
  .replace(/\b(rg|fd)-\d+-[\w-]+\.txt/g, '$1-output.txt').replace(/wf-[0-9a-f]{8}/g, '<workflow>').replace(/"elapsedMs":[\d.e-]+/g, '"elapsedMs":0'));

/** Runs `tool` on each input; a tool's throw is an output too. */
async function runTool(results, port, tool, inputs, label = tool.name, signal) {
  for (const input of inputs) {
    let output;
    try {
      output = {value: await tool.execute(`call-${results.length}`, input, signal)};
    } catch (error) {
      output = {error: error.message, code: error.code};
    }
    results.push(scrub({tool: label, input, ...output}, port));
  }
}

/** The local server webfetch reads, so nothing leaves the machine. */
function fixtureServer() {
  const server = createServer((request, response) => {
    const pages = {
      '/page': [200, {'content-type': 'text/html'}, '<html><head><title>A page</title><meta name="description" content="About"></head><body><article><h1>Heading</h1><p>Text with <img src="/a.png"> and more words for the reader to find.</p></article></body></html>'],
      '/json': [200, {'content-type': 'application/json'}, '{"a":1}'],
      '/missing': [404, {'content-type': 'text/plain'}, 'nope'],
      '/file': [200, {'content-type': 'application/zip', 'content-disposition': 'attachment; filename="r e.zip"'}, 'zipped'],
      '/huge': [200, {'content-type': 'text/plain', 'content-length': '9000000'}, 'x'],
      '/moved': [302, {location: '/page'}, ''],
    };
    const [status, headers, body] = pages[new URL(request.url, 'http://x').pathname] ?? pages['/missing'];
    response.writeHead(status, headers);
    response.end(request.headers.cookie ? `${body}cookie:${request.headers.cookie}` : body);
  });
  return new Promise(resolve => { server.listen(0, '127.0.0.1', () => resolve(server)); });
}

async function runTools(harness) {
  const {daemon, home} = harness, results = [];
  const server = await fixtureServer(), port = server.address().port, url = pathname => `http://127.0.0.1:${port}${pathname}`;
  daemon.settings(0).set('experimental', experimental => ({...experimental, auxCode: true}));
  const session = daemon.SessionStore.insert(0, {title: 'Tool runs', permissionMode: 'full-access', model: MODEL});
  const context = toolContext(harness, session);
  const run = (tool, inputs, label, signal) => runTool(results, port, tool, inputs, label, signal);
  const work = path.join(home, 'work');
  mkdirSync(path.join(work, 'skill'), {recursive: true});
  writeFileSync(path.join(work, 'a.txt'), Array.from({length: 40}, (_, index) => `line ${index + 1}`).join('\n'));
  writeFileSync(path.join(work, 'crlf.txt'), '﻿one\r\ntwo\r\n');
  writeFileSync(path.join(work, 'long.txt'), 'x'.repeat(70_000));
  writeFileSync(path.join(work, 'many.txt'), 'y\n'.repeat(5000));
  writeFileSync(path.join(work, 'doc.docx'), 'x');
  writeFileSync(path.join(work, 'skill/SKILL.md'), '---\nname: Plants\nicon: leaf\n---\nBody\n');
  writeFileSync(path.join(work, 'image.png'), Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64'));

  await run(daemon.createGetTimeTool(), [{}]);
  await run(daemon.createTodosTool(context), [{todos: [{id: '1', content: 'One', status: 'pending'}], merge: false}, {todos: [{id: '1', content: 'One', status: 'completed'}, {id: '2', content: 'Two', status: 'in_progress'}]}, {todos: [], merge: false}]);

  await run(daemon.createWriteFileTool(context), [{file_path: `${work}/new/deep.txt`, content: 'hello'}, {file_path: `${work}/new/deep.txt`, content: 'again'}, {file_path: work, content: 'x'}, {file_path: 'tmp/from-tool.txt', content: 'in the task'}]);
  await run(daemon.createWriteFileTool(context, {overwrite: true}), [{file_path: `${work}/new/deep.txt`, content: 'replaced'}], 'write_file overwrite');
  await run(daemon.createEditFileTool(context), [
    {path: `${work}/crlf.txt`, edits: [{oldText: 'two', newText: 'three'}]}, {path: `${work}/crlf.txt`, edits: [], appendText: 'four\n'}, {path: `${work}/crlf.txt`, edits: []},
    {path: `${work}/crlf.txt`, edits: [{oldText: 'absent', newText: 'x'}]}, {path: `${work}/nope.txt`, edits: [{oldText: 'a', newText: 'b'}]}, {path: 'tmp/from-tool.txt', edits: [{oldText: 'in', newText: 'on'}]},
  ]);

  await run(daemon.createWebFetchTool({...context, browser: undefined}), [{url: 'ftp://x'}, {url: url('/json')}, {url: url('/missing')}, {url: url('/page')}, {url: url('/page'), include_images: true}, {url: url('/file')}, {url: url('/huge')}, {url: url('/moved')}]);
  await run(daemon.createWebFetchTool(context), [{url: url('/page'), useCookies: true}], 'webfetch cookies');
  await run(daemon.createWebSearchTool({...context, browser: undefined}), [{objective: 'x', search_queries: ['a', 'b', 'c']}], 'websearch no browser');
  await run(daemon.createWebSearchTool(context), [{objective: 'plants', search_queries: ['a', 'b', 'c']}]);

  await run(daemon.createAskUserQuestionTool(context), [{questions: [{question: 'Q?', header: 'Q', options: []}]}]);
  await run(daemon.createActionConfirmationTool(context), [{title: 'Go', message: 'Do it', artifact: {type: 'gmail-draft', data: {}}}, {title: 'Go', message: 'Do it'}, {title: 'Stop', message: 'Do it', artifact: {type: 'gmail-draft', data: {}}}]);
  await run(daemon.createNotificationTool(context), [{title: 'T', message: 'M'}]);

  await run(daemon.createMemoryReadTool(context), [{queries: ['plants']}, {queries: ['plants'], from: '2026-01-01', to: '2026-02-01', max_results: 2}]);
  await run(daemon.createMemoryReadTool(toolContext(harness, {...session, incognito: true})), [{queries: ['plants']}], 'memory_search incognito');
  const memory = daemon.createMemoryTools(context);
  await run(memory.memory_write, [{path: 'plants.md', content: '# Plants\n\nFerns\n\n## History\n\nOld\n'}, {path: 'plants.md', append: 'Moss'}, {path: 'plants.md', edits: [{oldText: 'Ferns', newText: 'Palms'}]}, {path: 'plants.md'},
    {path: 'plants.md', append: 'a', content: 'b'}, {path: 'notes.txt', content: 'x'}, {path: 'episodic/2026-02-03.md', append: 'Day'}, {path: 'plants.md', content: '# Plants\n\nPalms\n\n## History\n\nOld\n'}, {path: 'absent.md', edits: [{oldText: 'a', newText: 'b'}]}, {path: '../escape.md', content: 'x'}]);
  await run(memory.memory_read, [{path: 'garden'}, {path: 'plants.md'}, {path: 'plants.md', history: true}, {path: 'plants.md', offset: 2, limit: 2}, {path: 'absent.md'}, {path: 'episodic'}]);

  await run(daemon.createRoutineUpdateTool(context), [{mode: 'update', id: 'absent'}, {mode: 'create', name: 'Check', prompt: 'Look', rrule: 'FREQ=DAILY', permissionMode: 'guard'}]);
  const routine = results.at(-1).value?.details?.routineId;
  await run(daemon.createRoutineUpdateTool(context), [{mode: 'update', id: routine, name: 'Check again', notificationsEnabled: false}, {mode: 'delete', id: routine}]);
  await run(daemon.createRoutineUpdateTool(toolContext(harness, {...session, routineId: 'r'})), [{mode: 'create'}], 'routine_update in a routine');
  await run(daemon.createRoutineNotifyParentTool(toolContext(harness, {...session, routineId: 'r', parentId: 'absent'})), [{message: 'Done'}]);

  daemon.settings(0).set('contextAwareness', awareness => ({...awareness, enabled: true}));
  const search = daemon.createHistorySearchTool({accountId: 0, contextAwareness: true});
  await run(search, [{}, {queries: ['  Plant ', 'plant']}, {from: '2026-02-01', to: '2026-01-01'}, {domain: 'not a domain'}, {domain: 'example.com', limit: 2}, {app: 'Slack'}, {queries: ['x'], app: 'Chrome', offset: 1}]);
  await run(daemon.createHistorySearchTool({accountId: 0, contextAwareness: false}), [{}, {queries: ['x']}], 'history_search browser only');
  await run(daemon.createHistoryReadTool({accountId: 0}), [{ids: ['e:absent']}, {ids: ['s:absent'], match: 'x', contextLines: 2, offset: 1}]);
  daemon.settings(0).set('contextAwareness', awareness => ({...awareness, enabled: false}));
  await run(daemon.createHistoryReadTool({accountId: 0}), [{ids: ['e:absent']}], 'history_read off');

  const subagent = daemon.createSubagentTool(context, ['code_explorer']);
  await run(subagent, [{action: 'request_approval'}, {action: 'request_approval', task_id: 'absent', request_id: 'r'}, {action: 'list_models', query: 'x', limit: 1}, {action: 'list_models'}, {action: 'spawn'}, {action: 'spawn', description: 'd', prompt: 'p', model: {provider: 'a', modelId: 'b'}, model_category: 'fast'},
    {action: 'spawn', description: 'd', prompt: 'p', model: {provider: 'a', modelId: ' '}}, {action: 'spawn', description: 'd', prompt: 'p', subagent_profile: 'code_explorer'}, {action: 'resume'}, {action: 'resume', task_id: 'absent', prompt: 'more'}, {action: 'nope', x: 1}]);
  await run(daemon.createSubagentWaitTool(context), [{task_ids: []}, {task_ids: ['absent']}]);
  const message = daemon.createMessageAgentTool(context);
  await run(message, [{action: 'list'}, {message: 'hi'}, {to: 'absent'}, {to: 'absent', message: 'hi'}]);
  await run(daemon.createMessageAgentTool(toolContext(harness, {...session, parentId: 'parent0000000000', trigger: {type: 'subagent', readOnly: true}})), [{to: 'other', message: 'hi'}], 'message_agent read-only');
  await run(daemon.createStartCoderTool({...context, session: {...session, permissionMode: 'read-only'}}), [{description: 'Fix it', prompt: 'Fix'}]);

  await run(daemon.structuredOutputTool({type: 'object'}, value => results.push({captured: value})), [{a: 1}], 'structured_output');
  await run(daemon.createReplTool({run: async (code, options) => { harness.trace.push(['repl', code, Object.keys(options)]); return code === 'bad' ? {error: 'failed', content: [{type: 'text', text: 'partial'}]} : {content: [{type: 'text', text: 'x'.repeat(40)}]}; }}), [{code: 'ok'}, {code: 'bad'}]);

  const automations = daemon.createAutomationTools(context);
  await run(automations.automation_create, [{title: 'x', prompt: 'p', interval: 'soon'}, {title: 'x', prompt: 'p', interval: '1s'}, {title: 'x', prompt: '  ', interval: '30m'}, {title: 'Check\n  CI', prompt: 'Look', interval: '30m', max_runs: 2}]);
  await run(automations.automation_list, [{}]);
  await run(automations.automation_delete, [{ids: []}, {ids: ['au-9']}, {ids: ['au-1', 'au-1']}]);
  await run(automations.automation_list, [{}]);

  // Browser-only mode offers no MCP tools, so these run past the gate; the wrapper is what's compared.
  harness.supervise(true);
  const mcpTools = daemon.createMcpAgentTools({callTool: async (server, name, input) => {
    if (name === 'boom') throw Error('MCP failed');
    return {content: [{type: 'text', text: `${server}/${name}:${JSON.stringify(input)}`}], isError: name === 'bad'};
  }}, [{serverName: 'srv', tool: {name: 'ok', inputSchema: {type: 'object', properties: {a: {type: 'string', pattern: 'a\\_b\\\\_c'}}}}}, {serverName: 'srv', tool: {name: 'ok', title: 'Same', description: 'd', inputSchema: {type: 'object'}}},
    {serverName: 'srv', tool: {name: 'bad', inputSchema: {type: 'object'}}}, {serverName: 'srv', tool: {name: 'boom', inputSchema: {type: 'object'}}}]);
  harness.supervise(false);
  results.push({mcpTools: mcpTools.map(describeTool)});
  for (const tool of mcpTools) await run(tool, [{a: 'b'}]);

  // Past the supervised-task gate: each command is shown by the refusal, or answered below.
  harness.supervise(true);
  await run(daemon.createReadFileTool({context, autoResizeImages: false}), [
    {path: `${work}/a.txt`}, {path: `${work}/a.txt`, offset: 5, limit: 3}, {path: `${work}/a.txt`, offset: 999}, {path: `${work}/nope.txt`}, {path: work}, {path: `${work}/doc.docx`},
    {path: `${work}/long.txt`}, {path: `${work}/many.txt`}, {path: `${work}/skill/SKILL.md`}, {path: `${work}/image.png`},
  ]);
  await run(daemon.createReadFileTool({context, autoResizeImages: true}), [{path: `${work}/image.png`}], 'read_file resized');
  const channel = daemon.createChannelTools(toolContext(harness, {...session, trigger: {type: 'v2-channel', channelId: 'c 1'}}));
  await run(channel.find(tool => tool.name === 'read_file'), [{path: '/channels/c%201/transcript.txt'}, {path: `${work}/a.txt`, limit: 1}], 'read_file on a channel');
  await run(channel.find(tool => tool.name === 'get_time'), [{path: '/channels/c%201/transcript.txt'}], 'get_time on a channel');
  const guarded = toolContext(harness, {...session, permissionMode: 'guard', cwd: work}), full = toolContext(harness, {...session, cwd: work});
  await run(daemon.createBashTool(guarded), [{title: 't', command: 'sleep 60'}, {title: 't', command: 'sleep 60 && ls'}, {title: 't', command: 'ls', timeout_ms: 1000}, {title: 't', command: 'ls', tty: true}, {title: 't', command: 'ls', yield_ms: 300}]);
  await run(daemon.createBashTool(guarded, {moveToBackground: () => {}}), [{title: 't', command: 'sleep 60'}, {title: 't', command: 'ls'}], 'bash in the background');
  await run(daemon.createTerminalInteractTool(guarded), [{exec_session_id: 1}, {exec_session_id: 7}, {exec_session_id: 7, input: 'x\r'}, {exec_session_id: 7, signal: 'kill', wait_ms: 1}, {exec_session_id: 7, resize: {cols: 80, rows: 24}, wait_ms: 90000}]);
  const processes = daemon.createBackgroundProcessTools(guarded);
  await run(processes.bg_start, [{command: 'ls', title: 'List'}, {command: 'ls', title: 'List', working_dir: 'absent'}]);
  await run(processes.bg_monitor, [{command: 'ls', description: 'Watch'}, {command: 'ls', description: 'Watch', timeout_ms: 1}]);
  await run(processes.bg_status, [{id: 'bt-9'}]);
  await run(processes.bg_list, [{}]);
  await run(processes.bg_kill, [{ids: []}, {ids: ['bt-9']}]);
  for (const answer of ['', 'a.txt:1:line 1\n', `${Array.from({length: 3000}, (_, index) => `f${index}.txt`).join('\n')}\n`, 'a.txt\nsub/b.txt\nsub/deep/c.md\n']) {
    harness.answerExecFile(answer);
    await run(daemon.createRgTool(guarded), [{pattern: 'line'}, {pattern: 'x', path: 'skill', glob: '*.md', file_type: 'md', case_sensitive: true, fixed_strings: true, hidden: true, context: 99, limit: 9999}, {pattern: 'x', case_sensitive: false, context: 0}]);
    await run(daemon.createFdTool(guarded), [{}, {type: 'file'}, {type: 'directory'}, {extension: '.md'}, {extension: 'md', max_depth: 1}, {pattern: 'a', limit: 1}, {pattern: '*.md', glob: true, hidden: true, path: '.'}]);
  }
  harness.answerExecFile(undefined);
  await run(daemon.createRgTool(guarded), [{pattern: 'refused'}]);
  await run(daemon.createWorkflowTool(full), [{script: 'return 1'}, {script: 'return 1', args: '{"a":1}'}, {script: 'return 2', background: true}]);
  // The background run reports to its task; that report lands in the account files.
  await new Promise(resolve => setTimeout(resolve, 200));
  harness.supervise(false);
  server.close();
  // Named at random; the results above already show what went in.
  rmSync(path.join(context.sessionDir, 'tmp'), {recursive: true, force: true});
  return {results, trace: harness.trace.splice(0).map(entry => scrub(entry, port))};
}

const ROUTE = {accountId: 0, profileId: 'Default', browserMode: 'default'};
const TARGET = {targetId: 'target-1'};
/** One request per command the daemon sends, and what a stand-in extension answers it with. */
const COMMANDS = [
  ['Aux.listTabs', {accountId: 0}, {items: [{id: '1', targetId: 'target-1', url: 'https://a.example/', title: 'A', faviconUrl: '', active: true, windowId: 1}]}],
  ['Aux.listTabs', {extensionId: 'abcdefghijklmnopabcdefghijklmnop'}, {items: []}], ['Aux.listTabs', {extensionId: 'NOT-AN-ID'}],
  ['Aux.ownsTarget', TARGET, {owned: true}], ['Aux.ownsTarget', {targetId: '  '}],
  ['Aux.createAgentTab', {url: 'https://a.example/', active: false}, {targetId: 'target-2', tabId: 2, windowId: 1}],
  ['Aux.resolveBindingWindow', {}, {status: 'resolved', windowId: 1, diagnostics: {windowCount: 1, windowCountByType: {normal: 1}}}],
  ['Aux.searchHistory', {query: ' plants ', maxResults: 5}, {items: [{id: 'h1', url: 'https://example.com/ferns', title: 'Ferns', lastVisitTime: 1767000000000, visitCount: 3},
    {id: 'h2', url: 'https://example.com/moss?token=secret', title: '', lastVisitTime: 1767000001000, visitCount: 1}, {id: 'h3', url: 'file:///etc/hosts', title: 'Hosts', lastVisitTime: 1767000002000, visitCount: 1}, {id: 'h4', url: 'https://other.example/x', title: 'Other', lastVisitTime: 1767000003000, visitCount: 1}, {id: 'h5', url: 'https://example.com/latest', title: 'Latest', lastVisitTime: 1767300000000, visitCount: 1}]}],
  ['Aux.getThirdPartyCookies', {}, {value: 'allow', levelOfControl: 'controllable_by_this_extension', isAvailable: true}], ['Aux.setThirdPartyCookies', {value: 'block'}, {success: true}], ['Aux.setThirdPartyCookies', {value: 'maybe'}],
  ['Aux.ensureTabInAiTabsGroup', TARGET, {success: true, groupId: 4}], ['Aux.controlTab', {action: 'open', url: 'https://a.example/'}, {success: true, action: 'open', targetId: 'target-3'}],
  ['Aux.controlTab', {action: 'close', targetId: 'target-1', skipIfActive: true}, {success: true, action: 'close'}], ['Aux.controlTab', {action: 'dance'}],
  ['Aux.waitForDownload', {startedAfterMs: 1, timeoutMs: 100}, {downloadId: 1, absolutePath: '/tmp/x', suggestedFilename: 'x'}],
  ['Aux.showNotification', {title: 'T', message: 'M', type: 'basic'}, {notificationId: 'n1'}], ['Aux.showNotification', {title: '', message: 'M'}],
  ['Aux.playNotificationSound', {sound: 'success'}, {ok: true}], ['Aux.playNotificationSound', {sound: 'notification', customSound: {mimeType: 'audio/mpeg', data: 'AAAA'}}, {ok: true}],
  ['Aux.grantNotificationPermission', TARGET, {success: true}], ['Aux.revokeNotificationPermission', {origin: 'https://a.example'}, {revoked: true}], ['Aux.clearAiTabsGroup', {keepTargetIds: ['target-1']}, {success: true, closedCount: 0}],
  ['Aux.callExtensionMV3Api', {method: 'tabs.query', args: [{}]}, {tabs: []}], ['Aux.callExtensionMV3Api', {method: 'identity.getAuthToken', args: []}],
  ['Aux.validateTabReferences', {references: [{targetId: 'target-1', url: 'https://a.example/', documentCapability: '00000000-0000-4000-8000-000000000000'}]}, {valid: true}],
  ['Aux.routeBrowserLink', {operation: 'list'}, {items: []}], ['Aux.routeBrowserLink', {operation: 'list', extra: 1}], ['Aux.nope', {}],
];

/** A stand-in extension: registers, answers commands from `answers`, and keeps what it receives. */
function extension(url, route, connectionId, answers, options) {
  const socket = new WebSocket(url, options), frames = [], {promise: registered, resolve, reject} = Promise.withResolvers();
  const client = {socket, frames, registered, closed: new Promise(done => { socket.addEventListener('close', ({code, reason}) => { resolve(); done({code, reason}); }); }),
    send: message => socket.send(typeof message === 'string' ? message : JSON.stringify(message))};
  socket.addEventListener('error', () => reject(Error('socket failed')));
  socket.addEventListener('open', () => client.send({method: 'register', connectionId, route}));
  socket.addEventListener('message', ({data}) => {
    const message = JSON.parse(data);
    frames.push(message);
    if (message.method === 'registered') resolve();
    if (message.method === 'ping') client.send({method: 'pong'});
    if (message.method === 'cancelCommand') client.send({id: message.id, result: null, error: 'cancelled'});
    if (message.method !== 'runCommand') return;
    const reply = answers(message.command);
    if (reply !== undefined) client.send({id: message.id, result: null, ...reply});
  });
  return client;
}

/** The bridge end to end: the real router on a local socket, with stand-in extensions. */
async function runBridge(harness) {
  const {daemon} = harness, bridge = daemon.globalExtensionBridge, results = [];
  const schema = parser => { try { return daemon.toJSONSchema(parser, {unrepresentable: 'any'}); } catch (error) { return `unconvertible: ${error.message}`; } };
  const schemas = namespace => Object.fromEntries(Object.entries(namespace).filter(([, value]) => value?.safeParse).map(([name, value]) => [name, schema(value)]));
  const reference = {commands: schemas(daemon.ExtensionBridgeCommand), protocol: schemas(daemon.ExtensionBridgeProtocol), parses: COMMANDS.map(([method, params]) => {
    const command = {method, params}, parsed = daemon.ExtensionBridgeCommand.extensionRequestSchema.safeParse(command);
    return {command, data: parsed.data, issues: parsed.error?.issues.length, protocol: daemon.ExtensionBridgeProtocol.commandRequestSchema.safeParse({command, route: {}}).success};
  })};

  const connections = [];
  const unsubscribe = bridge.onConnect(({accountId, profileId, connectionId}) => connections.push(['connect', accountId, profileId, connectionId]));
  bridge.onDisconnect(({profileId, connectionId}) => connections.push(['disconnect', profileId, connectionId]));
  const router = bridge.createRouter(), local = {incoming: {socket: {remoteAddress: '127.0.0.1', remoteFamily: 'IPv4', remotePort: 50000}}};
  const server = daemon.serve({hostname: '127.0.0.1', port: 0, overrideGlobalObjects: false, fetch: router.fetch, websocket: {server: new daemon.import_websocket_server.default({noServer: true})}});
  await new Promise(resolve => { server.once('listening', resolve); });
  const url = `ws://127.0.0.1:${server.address().port}/extension`;
  const http = async (name, path, init) => {
    const response = await router.request(path, init, local);
    results.push({http: name, status: response.status, body: await response.text()});
  };
  const post = (command, route, headers = {}) => ({method: 'POST', headers: {'content-type': 'application/json', ...headers}, body: JSON.stringify({command, route})});
  const attempt = async (name, work) => {
    try {
      results.push({step: name, value: await work() ?? null});
    } catch (error) {
      results.push({step: name, error: error.message, name: error.name});
    }
  };
  // Waiting for a connection that never comes: the harness clock stands still unless moved.
  const waiting = async work => {
    let moved = 0;
    const tick = setInterval(() => { moved += 500; harness.advance(500); }, 2);
    await work();
    clearInterval(tick);
    harness.advance(-moved);
  };
  const statuses = async label => {
    await http(`${label}: all`, '/');
    await http(`${label}: profile`, '/?accountId=0&profileId=Default');
    await http(`${label}: any account`, '/?profileId=Default');
  };

  await statuses('before');
  await http('bad mode', '/?browserMode=nope');
  const answers = new Map(COMMANDS.filter(([, , answer]) => answer).map(([method, , answer]) => [method, {result: answer}]));
  const first = extension(url, ROUTE, 'connection-1', command => command.params?.noReply ? undefined : answers.get(command.method) ?? {result: {echo: command}});
  await first.registered;
  await statuses('connected');
  harness.supervise(true);
  for (const [method, params] of COMMANDS) await attempt(method, () => daemon.sendCommandToExtension({method, params}, {...ROUTE, windowId: 3}));
  await attempt('no route', () => daemon.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}));
  await attempt('account only', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {accountId: 0}));
  await waiting(() => attempt('incognito', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {...ROUTE, browserMode: 'incognito', timeoutMs: 1})));

  // Failure, timeout and cancellation.
  answers.set('Aux.ownsTarget', {error: 'target is gone'});
  await attempt('extension error', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, ROUTE));
  answers.delete('Aux.ownsTarget');
  const silent = {method: 'Aux.ownsTarget', params: {...TARGET, noReply: true}};
  await attempt('timeout', () => bridge.sendCommandToExtension(silent, {...ROUTE, timeoutMs: 20}));
  await attempt('timeout, not logged', () => bridge.sendCommandToExtension(silent, {...ROUTE, timeoutMs: 20, logTimeout: false}));
  await attempt('download timeout margin', () => bridge.sendCommandToExtension({method: 'Aux.waitForDownload', params: {timeoutMs: 1, noReply: true}}, {...ROUTE, signal: AbortSignal.timeout(500)}));
  const aborted = new AbortController();
  setTimeout(() => aborted.abort(), 20);
  await attempt('cancelled', () => bridge.sendCommandToExtension(silent, {...ROUTE, signal: aborted.signal}));
  await attempt('already cancelled', () => bridge.sendCommandToExtension(silent, {...ROUTE, signal: aborted.signal}));
  await attempt('cancelled with no reason', () => { const signal = new AbortController(); setTimeout(() => signal.abort(Error('stopped')), 10); return bridge.sendCommandToExtension(silent, {...ROUTE, signal: signal.signal}); });
  await attempt('write fails', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {...ROUTE, auxManagedWrite: () => { throw Error('write refused'); }}));
  await attempt('close without a task', () => bridge.auxCloseBoundBrowserTask(1, {}, {}));
  await attempt('close a task', () => bridge.auxCloseBoundBrowserTask('task-1', {id: 'context'}, {...ROUTE, connectionId: 'connection-1', windowId: 3}));
  await attempt('bound timeout', () => { const cancelled = []; return bridge.sendCommandToExtension(silent, {...ROUTE, timeoutMs: 20, auxBoundBrowserAction: true, auxCancelBoundBrowserAction: error => cancelled.push(error.message)}).finally(() => results.push({cancelled})); });
  await attempt('bound cancelled', async () => { try { await bridge.sendCommandToExtension(silent, {...ROUTE, auxBoundBrowserAction: true, signal: AbortSignal.timeout(20)}); } catch (error) { return {message: error.message, settled: error.auxBrowserActionSettled}; } });
  answers.set('Aux.ownsTarget', {error: 'settled failure'});
  await attempt('bound error', async () => { try { await bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {...ROUTE, auxBoundBrowserAction: true}); } catch (error) { return {message: error.message, settled: error.auxBrowserActionSettled}; } });
  answers.delete('Aux.ownsTarget');

  // Messages that are not for anyone, and browser action events.
  const events = [];
  const handler = ({message, connection}) => { events.push([message.taskId, message.event.method, connection.connectionId]); throw Error('a handler failed'); };
  daemon.auxBrowserEventHandlers.add(handler);
  first.send('not json');
  first.send({id: 9999, result: 'stray'});
  first.send({method: 'aux.browserActionEvent', taskId: 'task-1', context: {}, event: {method: 'Page.loaded'}});
  await attempt('still working', () => bridge.sendCommandToExtension({method: 'Aux.listTabs', params: {accountId: 0}}, ROUTE));
  daemon.auxBrowserEventHandlers.delete(handler);

  // The routes.
  await http('command', '/command', post({method: 'Aux.listTabs', params: {accountId: 0}}, ROUTE));
  await http('bad command', '/command', post({method: 'Aux.nope', params: {}}, ROUTE));
  await http('pick directory, no origin', '/command', post({method: 'Aux.pickDirectory', params: {prompt: 'Pick'}}, ROUTE));
  await http('open url, foreign origin', '/command', post({method: 'Aux.openProfileUrl', params: {url: 'https://a.example/'}}, ROUTE, {origin: 'https://evil.example'}));
  const trusted = `chrome-extension://${[...daemon.allowedExtensionOrigins][0]?.split('//')[1] ?? 'x'}`;
  await http('open url, trusted origin', '/command', post({method: 'Aux.openProfileUrl', params: {url: 'https://a.example/'}}, ROUTE, {origin: trusted}));
  await http('remote caller', '/command', post({method: 'Aux.listTabs', params: {}}, ROUTE));
  const remote = await router.request('/command', post({method: 'Aux.listTabs', params: {}}, ROUTE), {incoming: {socket: {remoteAddress: '192.0.2.10', remoteFamily: 'IPv4', remotePort: 50000}}});
  results.push({http: 'from another machine', status: remote.status, body: await remote.text()});
  await attempt('open url, no profile', () => bridge.sendCommandToExtension({method: 'Aux.openProfileUrl', params: {url: 'https://a.example/'}}, {browserMode: 'default', accountId: 5, timeoutMs: 1}));

  // The bundle's own callers.
  const session = daemon.SessionStore.insert(0, {title: 'Bridge calls', model: MODEL, permissionMode: 'full-access'});
  const context = toolContext(harness, {...session, browserBinding: {profileId: 'Default', browserMode: 'default', windowId: 3}});
  const tool = async (name, execute) => attempt(name, execute);
  await tool('notification', () => daemon.createNotificationTool(context).execute('n', {title: 'T', message: 'M', silent: true}));
  daemon.attentionByAccountId.set(0, new Map([['surface', {sessionId: session.id, visible: true, focused: true, updatedAt: Date.now()}]]));
  await tool('notification, session on screen', () => daemon.createNotificationTool(context).execute('n', {title: 'T', message: 'M'}));
  daemon.attentionByAccountId.delete(0);
  daemon.settings(0).set('contextAwareness', awareness => ({...awareness, enabled: true}));
  await tool('history with captures', () => daemon.createHistorySearchTool({accountId: 0, contextAwareness: true, extensionBridgeRoute: () => ROUTE}).execute('h', {domain: 'example.com'}));
  await tool('history with queries', () => daemon.createHistorySearchTool({accountId: 0, contextAwareness: true, extensionBridgeRoute: () => ROUTE}).execute('h', {queries: ['Ferns'], limit: 1, offset: 1}));
  daemon.settings(0).set('contextAwareness', awareness => ({...awareness, enabled: false}));
  await tool('history', () => daemon.createHistorySearchTool({accountId: 0, contextAwareness: false, extensionBridgeRoute: () => ROUTE}).execute('h', {queries: ['plants'], domain: 'example.com'}));
  await tool('history recent', () => daemon.createHistorySearchTool({accountId: 0, contextAwareness: false, extensionBridgeRoute: () => ROUTE}).execute('h', {limit: 2}));
  await tool('open tabs', () => daemon.listOpenTabs(0, 'Default'));

  // Binding a CLI task to a browser window.
  const bind = async (name, answer, ...args) => {
    if (answer) answers.set('Aux.resolveBindingWindow', answer);
    await attempt(`bind: ${name}`, () => daemon.resolveCliBrowserBinding(0, ...args));
  };
  const diagnostics = {windowCount: 2, windowCountByType: {normal: 2, popup: 1}, tabCount: 3};
  await attempt('profiles', () => daemon.listCliBrowserProfiles(0));
  await bind('ok', {result: {status: 'ok', via: 'last-focused', windowId: 3, anchorTargetId: 'target-1', diagnostics}});
  await bind('ok, named', {result: {status: 'ok', via: 'single-window', windowId: 4, diagnostics: {...diagnostics, lastFocusedError: 'x'}}}, 'Default');
  await bind('unknown profile', undefined, 'Elsewhere');
  await bind('no window', {result: {status: 'no-normal-window', diagnostics}});
  await bind('tabs, no window', {result: {status: 'tabs-without-normal-window', diagnostics}});
  await bind('ambiguous', {result: {status: 'ambiguous-windows', candidateWindowIds: [1, 2], diagnostics}});
  await bind('malformed', {result: {status: 'nonsense'}});
  await bind('command error', {error: 'handler blew up'});
  await bind('unsupported', {error: 'Unsupported command: Aux.resolveBindingWindow'});
  const legacyWindows = [{id: 1, type: 'normal', state: 'normal', focused: false, tabs: [{id: 1}]}, {id: 3, type: 'normal', state: 'normal', focused: true, tabs: [{id: 2}]}, {id: 9, type: 'popup', tabs: []}];
  const mv3 = reply => answers.set('Aux.callExtensionMV3Api', reply);
  mv3({result: legacyWindows});
  await bind('legacy', {error: daemon.RESOLVE_BINDING_UNSUPPORTED_MESSAGE});
  answers.set('Aux.listTabs', {result: {items: [{id: '2', targetId: 'target-9', url: 'https://a.example/', title: 'A', faviconUrl: '', active: false, windowId: 3}, {id: '3', targetId: 'target-8', url: 'https://a.example/', title: 'A', faviconUrl: '', active: true, windowId: 3}]}});
  await bind('legacy, anchored');
  mv3({result: [legacyWindows[2]]});
  await bind('legacy, no window');
  mv3({result: 'not windows'});
  await bind('legacy, malformed');
  mv3({error: 'no windows api'});
  await bind('legacy, failed');
  answers.delete('Aux.callExtensionMV3Api');
  answers.delete('Aux.resolveBindingWindow');
  answers.set('Aux.listTabs', {result: COMMANDS[0][2]});
  const failing = async (name, method) => {
    const send = bridge.sendCommandToExtension;
    let calls = 0;
    bridge.sendCommandToExtension = async (...args) => { calls += 1; return method(calls, ...args); };
    await bind(name);
    bridge.sendCommandToExtension = send;
    results.push({calls});
  };
  const ok = {status: 'ok', via: 'focused-flag', windowId: 3, diagnostics};
  await failing('replaced, then fine', calls => { if (calls === 1) throw Error(daemon.BRIDGE_CONNECTION_REPLACED_MESSAGE); return ok; });
  await failing('replaced twice', () => { throw Error(daemon.BRIDGE_CONNECTION_REPLACED_MESSAGE); });
  await failing('not connected', () => { throw Error('Chrome extension not connected for the requested browser profile'); });
  await failing('disconnected', () => { throw Error('extension disconnected'); });
  await failing('timed out', () => { throw Error('extension request timeout: Aux.resolveBindingWindow'); });
  const cli = {...session, trigger: {type: 'user', source: 'cli'}, browserBinding: null};
  answers.set('Aux.resolveBindingWindow', {result: ok});
  await attempt('restore a CLI task', async () => (await daemon.restoreCliBrowserBinding(0, cli)).browserBinding);
  await attempt('restore a bound CLI task', async () => (await daemon.restoreCliBrowserBinding(0, {...cli, browserBinding: {profileId: 'Default', windowId: 3}})).browserBinding);
  await attempt('restore an old CLI task', async () => (await daemon.restoreCliBrowserBinding(0, {...session, trigger: undefined, title: 'Aux CLI', ephemeral: true, incognito: false})).browserBinding);
  await attempt('restore a task bound to a mode', async () => (await daemon.restoreCliBrowserBinding(0, {...cli, browserBinding: {profileId: 'Default', browserMode: 'incognito', windowId: 3}})).browserBinding);
  await attempt('restore another task', async () => (await daemon.restoreCliBrowserBinding(0, session)).browserBinding);
  results.push({cli: [{trigger: {type: 'user', client: 'cli'}}, {trigger: {type: 'user'}}, {title: 'Aux CLI', ephemeral: true, incognito: true}].map(daemon.isCliSession)});
  harness.supervise(false);
  await attempt('bound, no route', () => bridge.sendCommandToExtension({method: 'Aux.listTabs', params: {}}, {}));
  await attempt('bound, not a browser action', () => bridge.sendCommandToExtension({method: 'Aux.nope', params: {}}, ROUTE));
  harness.supervise(true);

  // Replacing, duplicates, ambiguity and disconnection.
  first.send({method: 'register', connectionId: 'again', route: ROUTE});
  results.push({closed: await first.closed});
  const second = extension(url, ROUTE, 'connection-2', () => undefined);
  await second.registered;
  const pending = bridge.sendCommandToExtension(silent, ROUTE).catch(error => error.message);
  await new Promise(resolve => setTimeout(resolve, 20));
  const replacement = extension(url, ROUTE, 'connection-3', command => ({result: {connection: 3, method: command.method}}));
  await replacement.registered;
  results.push({pending: await pending, closed: await second.closed});
  const other = extension(url, {...ROUTE, profileId: 'Work', accountId: 0}, 'connection-4', () => ({result: {connection: 4}}));
  await other.registered;
  await attempt('two profiles', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {accountId: 0}));
  await attempt('profiles, two', () => daemon.listCliBrowserProfiles(0));
  await attempt('bind, two profiles', () => daemon.resolveCliBrowserBinding(0));
  await attempt('the right one', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {accountId: 0, profileId: 'Work'}));
  results.push({profiles: bridge.listConnectedProfiles(0), incognito: bridge.listConnectedProfiles(0, 'incognito'), other: bridge.listConnectedProfiles(5)});
  const going = bridge.sendCommandToExtension(silent, {accountId: 0, profileId: 'Work'}).catch(error => error.message);
  await new Promise(resolve => setTimeout(resolve, 20));
  other.socket.close();
  results.push({pending: await going});
  await statuses('one left');
  unsubscribe();
  const late = extension(url, {...ROUTE, profileId: 'Late'}, 'connection-5', () => undefined);
  await late.registered;
  const stopping = bridge.sendCommandToExtension(silent, {accountId: 0, profileId: 'Late'}).catch(error => error.message);
  await new Promise(resolve => setTimeout(resolve, 20));
  await bridge.stop();
  results.push({stopped: await stopping, closed: await Promise.all([late.closed, replacement.closed]), connectionCount: bridge.connections.size});
  await attempt('bind, no profiles', () => daemon.resolveCliBrowserBinding(0));
  // Profiles the account registry knows, none of them running.
  const registry = daemon.AccountRegistry, getAll = registry.getAll, registered = bindings => { registry.getAll = () => ({...getAll.call(registry), profileAccountBindings: bindings}); };
  registered({P: {accountId: 0, profileId: 'P', profileIndex: 2}, Q: {accountId: 0, profileId: 'Q', profilePath: '/profiles/Work Folder'}, R: {accountId: 1, profileId: 'R'}});
  await attempt('bind, two registered', () => daemon.resolveCliBrowserBinding(0));
  await attempt('profiles, registered', () => daemon.listCliBrowserProfiles(0));
  registered({P: {accountId: 0, profileId: 'P', profileIndex: 2}});
  await waiting(() => attempt('bind, one registered, not running', () => daemon.resolveCliBrowserBinding(0)));
  registry.getAll = getAll;
  await attempt('profiles, none', () => daemon.listCliBrowserProfiles(0));
  await waiting(async () => {
    await attempt('no connection', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, ROUTE));
    await attempt('no connection, cancelled', () => bridge.sendCommandToExtension({method: 'Aux.ownsTarget', params: TARGET}, {...ROUTE, signal: AbortSignal.timeout(5)}));
  });
  const foreign = extension(url, ROUTE, 'connection-6', () => undefined, {headers: {origin: 'https://evil.example'}});
  results.push({closed: await foreign.closed});
  await new Promise(resolve => { server.close(resolve); server.closeAllConnections?.(); });
  harness.supervise(false);
  const frames = client => client.frames.filter(frame => frame.method !== 'ping');
  return {reference, trace: {results: JSON.parse(JSON.stringify(results)), connections, events, frames: [first, second, replacement, other, late].map(frames)}};
}

const MCP_TOOLS = [{name: 'echo', description: 'Echoes', inputSchema: {type: 'object', properties: {a: {type: 'string'}}}}, {name: 'fails', inputSchema: {type: 'object'}}, {name: 'drops', inputSchema: {type: 'object'}}];

/** Stand-ins for remote MCP servers, by host, speaking JSON-RPC over plain JSON replies. */
function mcpServers(calls, onList) {
  const rpc = (id, result) => Response.json({jsonrpc: '2.0', id, result}, {headers: {'mcp-session-id': 'session-1'}});
  const respond = ({id, method, params}) => {
    if (method === 'initialize') return rpc(id, {protocolVersion: params.protocolVersion, capabilities: {tools: {}}, serverInfo: {name: 'stand-in', version: '1'}});
    if (id === undefined) return new Response(null, {status: 202});
    if (method === 'tools/list') return params?.cursor ? rpc(id, {tools: MCP_TOOLS.slice(1)}) : rpc(id, {tools: MCP_TOOLS.slice(0, 1), nextCursor: 'page-2'});
    if (params?.name === 'fails') return Response.json({jsonrpc: '2.0', id, error: {code: -32000, message: 'tool refused'}});
    if (params?.name === 'drops') return new Response('gone', {status: 500});
    return rpc(id, {content: [{type: 'text', text: JSON.stringify(params)}]});
  };
  return async (url, options = {}) => {
    const target = new URL(url instanceof Request ? url.url : url), body = options.body ? JSON.parse(options.body) : undefined;
    if (target.hostname.endsWith('.invalid')) throw Object.assign(TypeError('fetch failed'), {cause: Error('ENOTFOUND')});
    if (!target.hostname.endsWith('.test')) return undefined;
    calls.push([target.href, options.method ?? 'GET', body?.method ?? null, new Headers(options.headers).get('x-key')]);
    if (target.hostname === 'slow.test') throw Error('request timed out');
    if (target.hostname === 'raced.test' && body?.method === 'tools/list') onList?.();
    if (target.hostname === 'denied.test') return new Response('no', {status: 401});
    if (target.hostname === 'teapot.test') return new Response('no', {status: 418});
    return options.method === 'POST' ? respond(body) : new Response(null, {status: 405});
  };
}

/** The MCP manager and each server's connection state, over the stand-in servers. */
async function runMcp(harness) {
  const {daemon} = harness, results = [], calls = [];
  const attempt = async (name, work) => {
    try {
      results.push({step: name, value: await work() ?? null});
    } catch (error) {
      results.push({step: name, error: error.message, name: error.constructor.name, cause: error.cause?.message});
    }
  };
  const http = (host, auth = {type: 'none'}, enabled = true) => ({enabled, transport: 'streamable-http', url: `https://${host}/mcp`, auth});
  const servers = {ok: http('ok.test', {type: 'headers', headers: {'x-key': 'k'}}), off: http('off.test', undefined, false), denied: http('denied.test'), slow: http('slow.test'), gone: http('gone.invalid'), teapot: http('teapot.test'),
    raced: http('raced.test'), oauth: http('denied.test', {type: 'auto'}), authed: http('ok.test', {type: 'auto'}), plain: {enabled: true, transport: 'stdio', command: 'node', args: ['server.js'], env: {A: '1'}}};
  // A server edited while its tools are being listed: the old list is not saved over the new settings.
  harness.answerFetch(mcpServers(calls, () => daemon.settings(0).set('mcp', mcp => { mcp.servers.raced.url += '/edited'; return mcp; })));
  daemon.settings(0).set('mcp', mcp => ({...mcp, servers: {...mcp.servers, ...servers}}));
  const inventories = () => Object.fromEntries(Object.entries(daemon.settings(0).get('mcp').inventories).map(([name, {tools}]) => [name, tools.map(tool => tool.name)]));

  const manager = new daemon.McpManager({servers}, {accountId: 0, startupTimeoutMs: 500, toolTimeoutMs: 500});
  await attempt('listTools', async () => { const {tools, failures} = await manager.listTools(); return {tools: tools.map(({serverName, tool}) => `${serverName}/${tool.name}`), failures}; });
  harness.supervise(true);
  await attempt('initialize', () => manager.initialize({ok: {tools: MCP_TOOLS}, off: {tools: MCP_TOOLS}}).map(tool => tool.name));
  harness.supervise(false);
  await attempt('testConnection', () => manager.testConnection('ok'));
  await attempt('testConnection, unknown', () => manager.testConnection('absent'));
  await attempt('testConnection, off', () => manager.testConnection('off'));
  await attempt('testConnection, refused', () => manager.testConnection('plain'));
  await attempt('callTool', () => manager.callTool('ok', 'echo', {a: 'b'}));
  await attempt('callTool, unknown', () => manager.callTool('absent', 'echo', {}));
  await attempt('callTool, tool error', () => manager.callTool('ok', 'fails', {}));
  await attempt('callTool, server error', () => manager.callTool('ok', 'drops', {}));
  await attempt('callTool, reconnects', () => manager.callTool('ok', 'echo', {a: 'again'}));
  await attempt('callTool, cannot connect', () => manager.callTool('gone', 'echo', {}));
  await attempt('callTool, cancelled', () => manager.callTool('ok', 'echo', {}, AbortSignal.abort()));
  await attempt('shutdown', () => manager.shutdown());
  await attempt('listTools, closed', () => manager.listTools());
  await attempt('callTool, closed', () => manager.callTool('ok', 'echo', {}));

  for (const name of Object.keys(servers)) {
    await attempt(`${name}: status`, () => daemon.getMcpConnectionStatus(0, name));
    await attempt(`${name}: inspect`, () => daemon.inspectMcpConnection(0, name));
    await attempt(`${name}: status after`, () => daemon.getMcpConnectionStatus(0, name));
    await attempt(`${name}: connect`, () => daemon.connectMcpServer(0, name));
    await attempt(`${name}: cancel`, () => daemon.cancelMcpConnection(0, name));
    daemon.forgetMcpConnectionStatus(0, name);
    await attempt(`${name}: status forgotten`, () => daemon.getMcpConnectionStatus(0, name));
    await attempt(`${name}: disconnect`, () => daemon.disconnectMcpServer(0, name));
    await attempt(`${name}: status disconnected`, () => daemon.getMcpConnectionStatus(0, name));
  }
  await attempt('unknown: status', () => daemon.getMcpConnectionStatus(0, 'absent'));
  await attempt('unknown: inspect', () => daemon.inspectMcpConnection(0, 'absent'));
  await attempt('unknown: connect', () => daemon.connectMcpServer(0, 'absent'));
  await attempt('unknown flow', () => daemon.finishMcpOAuthFlow('no-such-state', 'code'));
  await attempt('together', () => Promise.all([daemon.inspectMcpConnection(0, 'ok'), daemon.cancelMcpConnection(0, 'ok'), daemon.getMcpConnectionStatus(0, 'ok')]));
  results.push({inventories: inventories()});
  daemon.settings(0).set('mcp', mcp => { delete mcp.inventories.ok; mcp.toolInventoryMigrationVersion = undefined; return mcp; });
  await attempt('migrate', () => daemon.migrateLegacyMcpInventories(0));
  await attempt('migrate again', () => daemon.migrateLegacyMcpInventories(0));
  const {servers: after, toolInventoryMigrationVersion} = daemon.settings(0).get('mcp');
  results.push({enabled: Object.fromEntries(Object.entries(after).map(([name, server]) => [name, server.enabled])), toolInventoryMigrationVersion, inventories: inventories()});
  daemon.settings(0).set('mcp', mcp => { for (const name of Object.keys(servers)) { delete mcp.servers[name]; delete mcp.inventories[name]; } return mcp; });
  harness.answerFetch(undefined);
  return {results, calls};
}

/** Context Awareness beyond the ledger's rows: the capture policy and the history tools' text. */
async function runContext(harness) {
  const {daemon} = harness, at = Date.parse('2026-01-01T12:00:00.000Z'), results = {};
  const set = change => daemon.settings(0).set('contextAwareness', awareness => ({...awareness, ...change}));
  const allowed = {};
  const check = (name, change, ...inputs) => {
    set(change);
    allowed[name] = inputs.map(input => daemon.isCaptureAllowed(0, input));
  };
  const rules = [{scope: 'app', bundleId: 'com.blocked.App', behavior: 'do_not_observe'}, {scope: 'app', bundleId: 'com.fine.App', behavior: 'observe'},
    {scope: 'url', urlDomain: 'secret.example', behavior: 'do_not_observe'}, {scope: 'url', urlDomain: 'fine.example', behavior: 'observe'}];
  const inputs = [undefined, {}, {url: 'https://a.example/x'}, {url: 'not a url'}, {typedText: true}, {bundleId: 'com.blocked.App'}, {bundleId: 'com.fine.App'}, {url: 'https://www.secret.example/x'}, {url: 'https://fine.example/'}];
  check('off', {enabled: false}, ...inputs);
  check('on', {enabled: true, pausedUntil: null, captureTypedText: true, rules}, ...inputs);
  check('typed text off', {captureTypedText: false}, ...inputs);
  check('paused', {pausedUntil: Date.now() + 60000}, ...inputs);
  check('pause over', {pausedUntil: Date.now() - 1, captureTypedText: true}, ...inputs);
  set({enabled: false, pausedUntil: null, rules: []});
  results.allowed = allowed;
  const tomatoes = 'https://example.com/tomatoes';
  results.captured = [[[], {}], [[tomatoes, 'https://never.example/'], {}], [[tomatoes], {from: at * 2}], [[tomatoes], {to: 1}]].map(([urls, range]) => [...daemon.findCapturedUrls(0, urls, range)]);
  const footprint = daemon.getContextAwarenessFootprint(0, 1), {dbBytes, ...sizes} = footprint;
  results.footprint = {keys: Object.keys(footprint), cached: daemon.getContextAwarenessFootprint(0, 2) === footprint, stale: daemon.getContextAwarenessFootprint(0, 4e5) === footprint, fileBytes: sizes.fileBytes};

  const event = (id, extra = {}) => ({type: 'event', id, kind: 'page.visit', appName: 'Safari', occurredAt: at + id.length * 60000, windowTitle: `Window ${id}`, url: `https://example.com/${id}`, snippet: `Snippet of ${id}`, ...extra});
  const visit = (name, extra = {}) => ({type: 'visit', url: `https://example.com/${name}`, title: name, at: at - 3600000, visitCount: 1, ...extra});
  const summary = (id, extra = {}) => ({type: 'summary', id, title: `About ${id}`, description: 'What happened in this window.', windowFrom: at - 864e5, windowTo: at - 863e5, ...extra});
  const rows = [event('a'), event('bb', {evidence: `⟨e:bb⟩ 2026 Snippet of bb`}), event('ccc', {snippet: 'Snippet of bb'}), event('dddd', {firstOccurredAt: at, stay: {from: at, to: at + 1}}), summary('s1'), summary('s2', {evidence: 'Evidence text'}), visit('v1', {visitCount: 3}), visit('v2')];
  const repeat = event('bb', {id: 'bb', evidence: undefined, snippet: 'Snippet of bb'});
  const huge = event('huge', {evidence: '語'.repeat(20000)});
  const search = [
    [[], {limit: 5}], [[], {limit: 5, contextAwareness: true}], [[], {limit: 5, moreBelow: true}], [[], {limit: 5, moreBelow: true, nextTo: at}], [rows, {limit: 5, offset: 99}], [rows, {limit: 5, offset: 99, moreBelow: true, nextTo: at}],
    [rows, {limit: 20}], [rows, {limit: 3}], [rows, {limit: 3, offset: 1}], [rows, {limit: 3, offset: 0}], [rows, {limit: 20, moreBelow: true}], [rows, {limit: 20, nextTo: at + 5}], [rows, {limit: 3, nextTo: at + 86400000}], [[...rows, repeat], {limit: 20}],
    [[huge, ...rows], {limit: 20}], [rows, {limit: 20, maxBytes: 600}], [rows, {limit: 20, maxBytes: 300}], [rows, {limit: 20, maxBytes: 300, offset: 2}], [[event('z')], {limit: 0}],
  ];
  results.search = search.map(([list, options]) => daemon.formatHistorySearch(list, options));
  results.rowAt = [...rows].map(daemon.historyRowAt);
  const read = extra => ({id: 'e1', sameAs: [], kind: 'page.visit', appName: 'Safari', occurredAt: at, lastOccurredAt: at, offset: 0, lineCount: 3, remainingLines: 0, content: 'Line one', ...extra});
  const summaryRead = extra => ({id: 's1', type: 'summary', title: 'T', windowFrom: at, windowTo: at + 1, offset: 0, lineCount: 1, remainingLines: 0, content: 'Body', ...extra});
  results.read = [[], [read()], [read({notice: 'Careful.'})], [read({remainingLines: 4, nextOffset: 9})], [read({remainingLines: 4, since: 'e0', changes: {added: 1, removed: 2}})], [summaryRead({remainingLines: 2, since: 'x', nextOffset: 3})], [read({truncated: true})],
    [read({content: '', offset: 9})], [read({content: '', truncated: true})], [read({content: '', match: 'x', hasAvailableText: true})], [read({content: '', match: 'x'})], [read({content: ''})], [read({content: '', lineCount: 0})], [read({sameAs: ['e2'], domain: 'a.example', windowTitle: 'W'}), summaryRead()]]
    .map(daemon.formatHistoryRead);
  return results;
}

export const STEPS = {toolLists, tools: runTools, bridge: runBridge, mcp: runMcp, context: runContext, ...SERVICE_STEPS};
