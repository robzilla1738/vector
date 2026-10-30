/** Fake provider CLI for tests. argv[2] is the CLI name; FAKE_CLI_MODE picks the state:
 * ready | signed-out | crash | slow | malformed | warming. Output shapes mirror the real CLIs'
 * status output observed on 2026-10-28, their documented stream formats, the Codex app-server
 * schema (codex 0.165.0) and the Agent Client Protocol (`gemini`). */
import {appendFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {createInterface} from 'node:readline';

const [, , name, ...args] = process.argv;
const mode = process.env.FAKE_CLI_MODE ?? 'ready';
const log = record => process.env.FAKE_CLI_LOG && appendFileSync(process.env.FAKE_CLI_LOG, JSON.stringify({name, ...record}) + '\n');
const out = record => process.stdout.write(typeof record === 'string' ? record + '\n' : JSON.stringify(record) + '\n');
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const has = flag => args.includes(flag);
const linger = () => {
  // A grandchild in the same process group, as real CLIs spawn MCP bridges and shells.
  const child = spawn('/bin/sleep', ['300'], {stdio: 'ignore'});
  if (process.env.FAKE_CLI_PIDFILE) writeFileSync(process.env.FAKE_CLI_PIDFILE, String(child.pid));
  setInterval(() => {}, 1000);
};
const crash = () => { process.stderr.write('fatal: provider crashed\n'); process.exit(3); };

log({args, cwd: process.cwd(), hasToken: !!process.env.AUX_MCP_TOKEN, auxLeak: Object.keys(process.env).filter(key => key.startsWith('AUX_') && key !== 'AUX_MCP_TOKEN')});

const versions = {codex: 'codex-cli 0.164.0', claude: '2.1.308 (Claude Code)', 'cursor-agent': '2026.10.22-27dcf5f', grok: 'grok 1.0.67 (2fe064390d07) [stable]', opencode: 'opencode v2.2.0', gemini: '0.12.0'};
if (has('--version')) { if (mode === 'crash') crash(); out(versions[name] ?? 'unknown 0'); process.exit(0); }

async function status() {
  if (mode === 'slow') { await sleep(60000); return; }
  if (mode === 'crash') crash();
  const ready = mode === 'ready';
  switch (name) {
    case 'codex': process.stderr.write(ready ? 'Logged in using ChatGPT\n' : 'Not logged in\n'); process.exit(ready ? 0 : 1); break;
    case 'claude': out(JSON.stringify(ready ? {loggedIn: true, authMethod: 'claude.ai', apiProvider: 'firstParty', email: 'person@example.com', subscriptionType: 'max'} : {loggedIn: false, authMethod: 'none', apiProvider: 'firstParty'}, null, 2)); process.exit(ready ? 0 : 1); break;
    case 'cursor-agent': out(JSON.stringify(ready ? {status: 'authenticated', isAuthenticated: true, userInfo: {email: 'person@example.com', teamName: 'Team'}} : {status: 'unauthenticated', isAuthenticated: false})); process.exit(0); break;
    case 'grok': if (ready) { out('You are logged in with grok.com.\n\nDefault model: grok-4.7\n\nAvailable models:\n  * grok-4.7 (default)\n  - grok-4.6'); process.exit(0); } process.stderr.write('Not logged in. Run grok login.\n'); process.exit(1); break;
    case 'opencode':
      if (mode === 'warming') {
        const marker = process.env.FAKE_CLI_LOG + '.warm';
        if (!existsSync(marker)) { writeFileSync(marker, '1'); process.stderr.write('Location plugins did not finish activating\n'); process.exit(1); }
      }
      out(ready || mode === 'warming' ? 'OpenCode Go        API key                     stored\nOpenAI             OpenAI                      stored' : ''); process.exit(0); break;
  }
}

const configFile = () => has('--mcp-config') ? args[args.indexOf('--mcp-config') + 1] : existsSync('opencode.json') ? 'opencode.json' : null;
if (configFile()) log({config: readFileSync(configFile(), 'utf8'), configMode: statSync(configFile()).mode & 0o777});

async function claudeLike() {
  if (name === 'claude') {
    let input = '';
    for await (const chunk of process.stdin) input += chunk;
    const content = JSON.parse(input).message.content;
    log({prompt: content.find(part => part.type === 'text').text, images: content.filter(part => part.type === 'image').length});
  }
  out({type: 'system', subtype: 'init', session_id: 'session-1'});
  if (mode === 'crash') crash();
  if (mode === 'slow') return linger();
  if (mode === 'malformed') { out('not json at all'); out('[1,2,3]'); out('{"type":"stream_event"'); process.exit(0); }
  if (mode === 'signed-out') { out({type: 'result', subtype: 'success', is_error: true, result: 'Invalid API key · Please run /login'}); process.exit(1); }
  out({type: 'stream_event', event: {type: 'message_start', message: {id: 'm1'}}});
  out({type: 'stream_event', event: {type: 'content_block_delta', delta: {type: 'text_delta', text: 'Hello '}}});
  out({type: 'stream_event', event: {type: 'content_block_delta', delta: {type: 'text_delta', text: 'world'}}});
  out({type: 'assistant', message: {id: 'm1', content: [{type: 'text', text: 'Hello world'}]}});
  out({type: 'assistant', message: {id: 'm2', content: [{type: 'tool_use', id: 't1', name: 'mcp__aux__open_tab', input: {url: 'https://example.com'}}]}});
  out({type: 'user', message: {content: [{type: 'tool_result', tool_use_id: 't1', content: [{type: 'text', text: 'opened'}]}]}});
  out({type: 'result', subtype: 'success', is_error: false, result: 'Hello world', usage: {input_tokens: 3}});
}

async function cursor() {
  out({type: 'system', subtype: 'init', session_id: 'chat-1'});
  if (mode === 'crash') crash();
  if (mode === 'slow') return linger();
  if (mode === 'malformed') { out('garbage'); process.exit(0); }
  out({type: 'assistant', message: {content: [{type: 'text', text: 'Hel'}]}});
  out({type: 'assistant', message: {content: [{type: 'text', text: 'lo'}]}});
  out({type: 'assistant', message: {content: [{type: 'text', text: 'Hello'}]}});
  out({type: 'tool_call', subtype: 'started', call_id: 'c1', tool_call: {mcpToolCall: {name: 'aux-open_tab', args: {url: 'https://example.com'}}}});
  out({type: 'tool_call', subtype: 'completed', call_id: 'c1', tool_call: {mcpToolCall: {name: 'aux-open_tab', result: {success: {content: 'opened'}}}}});
  out({type: 'result', subtype: 'success', is_error: false, result: 'Hello'});
}

async function grok() {
  if (args[0] === 'mcp') { mkdirSync('.grok', {recursive: true}); writeFileSync('.grok/config.toml', `# ${args.join(' ')}\n`); process.exit(0); }
  const file = args[args.indexOf('--prompt-file') + 1];
  log({prompt: readFileSync(file, 'utf8')});
  if (mode === 'crash') crash();
  if (mode === 'slow') return linger();
  if (mode === 'malformed') { out('{{{'); process.exit(2); }
  out({type: 'text_delta', delta: 'Grok '});
  out({type: 'text_delta', delta: 'here'});
  out({type: 'tool_call', id: 'g1', name: 'mcp__aux__read_page'});
  out({type: 'tool_result', id: 'g1', output: 'page'});
  out({type: 'done'});
}

async function opencode() {
  if (mode === 'crash') crash();
  if (mode === 'slow') return linger();
  if (mode === 'malformed') { out('<html>'); process.exit(0); }
  out({type: 'text', sessionID: 'ses_1', part: {id: 'p1', text: 'Open'}});
  out({type: 'text', sessionID: 'ses_1', part: {id: 'p1', text: 'OpenCode'}});
  out({type: 'tool_use', sessionID: 'ses_1', part: {callID: 'o1', tool: 'aux_open_tab', state: {status: 'running', input: {}}}});
  out({type: 'tool_use', sessionID: 'ses_1', part: {callID: 'o1', tool: 'aux_open_tab', state: {status: 'completed', output: 'ok'}}});
  out({type: 'step_finish', sessionID: 'ses_1', part: {reason: 'stop', tokens: {input: 1}}});
}

/** An ACP agent: one session, a streamed reply, a tool call that asks permission. */
async function acpAgent() {
  if (mode === 'crash') crash();
  const input = createInterface({input: process.stdin});
  const update = (sessionId, value) => out({jsonrpc: '2.0', method: 'session/update', params: {sessionId, update: value}});
  let prompt;
  for await (const line of input) {
    const message = JSON.parse(line);
    log({rpc: message.method ?? 'response', params: message.params, result: message.result});
    const reply = result => out({jsonrpc: '2.0', id: message.id, result});
    if (message.method === 'initialize') reply({protocolVersion: 1, authMethods: [], agentCapabilities: {loadSession: true, mcpCapabilities: {http: true}, promptCapabilities: {image: true}}});
    else if (message.method === 'session/new') {
      if (mode === 'signed-out') out({jsonrpc: '2.0', id: message.id, error: {code: -32000, message: 'Authentication required'}});
      else reply({sessionId: 'acp-1'});
    } else if (message.method === 'session/load') {
      update('acp-1', {sessionUpdate: 'agent_message_chunk', content: {type: 'text', text: 'REPLAYED'}});
      reply(null);
    } else if (message.method === 'session/prompt') {
      prompt = message.id;
      if (mode === 'slow') { linger(); continue; }
      if (mode === 'malformed') { out('nope'); process.exit(0); }
      update('acp-1', {sessionUpdate: 'agent_message_chunk', content: {type: 'text', text: 'Gem'}});
      update('acp-1', {sessionUpdate: 'agent_message_chunk', content: {type: 'text', text: 'ini'}});
      update('acp-1', {sessionUpdate: 'tool_call', toolCallId: 'a1', title: 'Run touch notes.txt', kind: 'execute', status: 'pending', rawInput: {command: 'touch notes.txt'}});
      out({jsonrpc: '2.0', id: 700, method: 'session/request_permission', params: {sessionId: 'acp-1', toolCall: {toolCallId: 'a1', title: 'Run touch notes.txt', kind: 'execute', rawInput: {command: 'touch notes.txt'}},
        options: [{optionId: 'yes', name: 'Allow', kind: 'allow_once'}, {optionId: 'no', name: 'Reject', kind: 'reject_once'}]}});
    } else if (message.id === 700) {
      update('acp-1', {sessionUpdate: 'tool_call_update', toolCallId: 'a1', status: message.result.outcome.optionId === 'yes' ? 'completed' : 'failed', content: [{type: 'content', content: {type: 'text', text: 'ran'}}]});
      out({jsonrpc: '2.0', id: prompt, result: {stopReason: 'end_turn'}});
    } else if (message.method === 'session/cancel') out({jsonrpc: '2.0', id: prompt, result: {stopReason: 'cancelled'}});
  }
}

async function codexAppServer() {
  if (mode === 'crash') crash();
  const input = createInterface({input: process.stdin});
  const note = (method, params) => out({method, params});
  for await (const line of input) {
    let message;
    try { message = JSON.parse(line); } catch { continue; }
    log({rpc: message.method ?? 'response', params: message.params, result: message.result});
    if (message.method === 'initialize') out({id: message.id, result: {codexHome: '/x', platformFamily: 'unix', platformOs: 'macos', userAgent: 'fake'}});
    else if (message.method === 'model/list') out({id: message.id, result: message.params.cursor
      ? {data: [{id: 'gpt-5.4-mini', displayName: 'GPT-5.4 mini', hidden: false, supportedReasoningEfforts: [{reasoningEffort: 'low', description: ''}], inputModalities: ['text']}], nextCursor: null}
      : {data: [{id: 'gpt-5.5', displayName: 'GPT-5.5', hidden: false, supportedReasoningEfforts: ['minimal', 'low', 'medium', 'high', 'xhigh'].map(reasoningEffort => ({reasoningEffort, description: ''}))},
        {id: 'secret-model', displayName: 'Hidden', hidden: true, supportedReasoningEfforts: []}], nextCursor: 'page-2'}});
    else if (message.method === 'thread/resume') {
      if (message.params.threadId !== 'thr_1') { out({id: message.id, error: {code: -32600, message: `no rollout found for thread id ${message.params.threadId}`}}); continue; }
      out({id: message.id, result: {thread: {id: 'thr_1'}}});
    } else if (message.method === 'thread/start') {
      if (mode === 'signed-out') { out({id: message.id, error: {code: -32000, message: 'Not logged in. Please sign in with codex login.'}}); continue; }
      out({id: message.id, result: {thread: {id: 'thr_1'}}});
      note('thread/started', {thread: {id: 'thr_1'}});
    } else if (message.method === 'turn/start') {
      out({id: message.id, result: {turn: {id: 'turn_1', items: [], status: 'inProgress'}}});
      note('turn/started', {threadId: 'thr_1', turn: {id: 'turn_1', items: [], status: 'inProgress'}});
      if (mode === 'slow') { linger(); continue; }
      if (mode === 'malformed') { out('%%%'); out('"string"'); process.exit(0); }
      note('item/agentMessage/delta', {threadId: 'thr_1', turnId: 'turn_1', itemId: 'i1', delta: 'Co'});
      note('item/agentMessage/delta', {threadId: 'thr_1', turnId: 'turn_1', itemId: 'i1', delta: 'dex'});
      note('item/started', {threadId: 'thr_1', turnId: 'turn_1', startedAtMs: 1, item: {type: 'mcpToolCall', id: 'x1', server: 'aux', tool: 'open_tab', arguments: {}, status: 'inProgress'}});
      out({id: 900, method: 'item/commandExecution/requestApproval', params: {threadId: 'thr_1', turnId: 'turn_1', itemId: 'x2', command: 'touch notes.txt', cwd: '/tmp'}});
    } else if (message.id === 900) {
      note('item/completed', {threadId: 'thr_1', turnId: 'turn_1', completedAtMs: 2, item: {type: 'mcpToolCall', id: 'x1', server: 'aux', tool: 'open_tab', arguments: {}, status: 'completed', result: {content: []}}});
      note('turn/completed', {threadId: 'thr_1', turn: {id: 'turn_1', items: [], status: 'completed'}});
    } else if (message.method === 'turn/interrupt') {
      out({id: message.id, result: {}});
      note('turn/completed', {threadId: 'thr_1', turn: {id: 'turn_1', items: [], status: 'interrupted'}});
    }
  }
}

const isStatus = {codex: args[0] === 'login', claude: args[0] === 'auth', 'cursor-agent': args[0] === 'status', grok: args[0] === 'models', opencode: args[0] === 'auth'}[name];
if (isStatus) await status();
else if (name === 'codex' && args[0] === 'app-server') await codexAppServer();
else if (name === 'claude') await claudeLike();
else if (name === 'cursor-agent') await cursor();
else if (name === 'grok') await grok();
else if (name === 'opencode') await opencode();
else if (name === 'gemini') await acpAgent();
