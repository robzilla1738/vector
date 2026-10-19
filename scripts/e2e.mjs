#!/usr/bin/env node
// Real supplied-stack acceptance; preparation/check mode makes no requests.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';
import { fixtures, compactionBackground } from './e2e/fixtures.mjs';
import { exposeHelpers, loadSuppliedCli } from './e2e/supplied-cli.mjs';

const root = resolve(import.meta.dirname, '..');
const options = {};
for (let i = 2; i < process.argv.length; i++) {
  const name = process.argv[i];
  if (name === '--check') { options.check = true; continue; }
  assert(['--profile', '--account', '--limit', '--cli-source', '--adapter'].includes(name) && process.argv[i + 1], 'Usage: node scripts/e2e.mjs --cli-source PATH [--check | --account uN --profile ID [--limit 1..20]]');
  options[name.slice(2)] = process.argv[++i];
}
assert(options['cli-source'], 'Explicit pinned supplied CLI source is required.');
if (options.check) {
  exposeHelpers(await readFile(options['cli-source'], 'utf8'));
  console.log('Pinned supplied CLI helper extraction verified. No module loaded or requests made.');
  process.exit(0);
}
assert(options.profile && options.account && process.env.AUX_HOME && process.env.DAEMON_AUTH_JWT, 'Explicit disposable home/account/profile and its disposable daemon token are required.');
const temporary = await realpath(tmpdir());
const home = await realpath(process.env.AUX_HOME);
const isDisposable = path => {
  const rel = relative(temporary, path);
  return rel !== '' && !rel.startsWith('..') && !resolve(rel).startsWith(sep + '..') && rel.split(sep)[0]?.startsWith('aux-');
};
assert(isDisposable(home), 'Acceptance requires an aux-* home beneath the system temporary directory.');
assert(process.env.HOME && isDisposable(await realpath(process.env.HOME)), 'HOME must also be disposable; supplied CLI state must never resolve into the owner home.');
assert.equal(process.env.AUX_CLI_UPDATE_CHECK, '0', 'Disable supplied CLI update checks explicitly.');
assert(!process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY, 'Native diagnostic mode must be unset for acceptance.');
assert(process.env.DAEMON_BASE_URL, 'Explicit isolated daemon URL required.');
const endpoint = new URL(process.env.DAEMON_BASE_URL);
assert(endpoint.protocol === 'http:' && endpoint.hostname === '127.0.0.1' && endpoint.port === '21520' && endpoint.pathname === '/', 'Only isolated Aux loopback daemon port21520 is accepted.');
const limit = Number(options.limit ?? 20);
assert(Number.isInteger(limit) && limit >= 1 && limit <= 20, 'Limit must be1..20.');
const runId = randomUUID();
const reportDirectory = join(root, 'out/acceptance', `e2e-${runId}`);
await mkdir(reportDirectory, { recursive: true, mode: 0o700 });
const helpers = await loadSuppliedCli(options['cli-source'], reportDirectory,
  pathToFileURL(resolve(options.adapter ?? join(root, 'vendor/provided/cli-adapter.mjs'))).href);
const daemon = helpers.createDaemonClient();
const rpc = daemon.trpcClient;
const resolvedAccount = await helpers.resolveAccount(rpc, options.account);
const accountId = resolvedAccount.accountId;
const localRegistry = JSON.parse(await readFile(join(home, 'accounts.json'), 'utf8'));
assert.equal(localRegistry.accounts.find(row => row.id === accountId)?.createdAt, resolvedAccount.account.createdAt, 'Daemon account must match the actual disposable registry incarnation.');
assert.equal(localRegistry.profileAccountBindings?.[options.profile]?.accountId, accountId, 'Disposable registry must own the exact profile binding.');
const registry = await rpc.accounts.summary.query();
const binding = registry.accounts.find(row => row.id === accountId)?.profileBindings.find(row => row.profileId === options.profile);
assert(binding?.profilePath && isDisposable(await realpath(binding.profilePath)), 'Exact account binding must point to a disposable native profile.');
assert.equal((await rpc.sessions.list.query({ accountId, archived: 'include', ephemeral: 'include', parent: 'all' })).length, 0, 'Fresh account without existing sessions required.');
const browserBinding = await rpc.cli.resolveBrowserBinding.query({ accountId, profileId: options.profile });
assert(browserBinding.profileId === options.profile && browserBinding.browserMode === 'default', 'Exact ordinary profile binding required.');
const providerId = 'vercel-ai-gateway';
const model = { provider: providerId, modelId: 'meta/muse-spark-1.3-contributor', thinkingLevel: 'medium', fastMode: false };
const modelSpec = `${providerId}/${model.modelId}`;
assert(!(await rpc.models.getCredentialStatus.query({ accountId, providerId })).exists && (await rpc.models.listCredentials.query({ accountId })).length === 0, 'Fresh disposable credential store required.');
assert(process.env.AUX_E2E_GATEWAY_KEY, 'Inject AUX_E2E_GATEWAY_KEY explicitly; the harness never opens workspace/owner credential files.');
let key = process.env.AUX_E2E_GATEWAY_KEY;
delete process.env.AUX_E2E_GATEWAY_KEY;
const site = await fixtures();
const report = { runId, model: modelSpec, startedAt: new Date().toISOString(), requested: limit, cases: [], complete: false };
const save = () => writeFile(join(reportDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
const scopes = new Map();
const previousSettings = new Map();
let credentialWritten = false;
async function setting(key, value) {
  if (!previousSettings.has(key)) previousSettings.set(key, await rpc.settings.get.query({ accountId, key }));
  await rpc.settings.set.mutate({ accountId, key, value });
}
async function create(title) {
  const session = await helpers.createExecSession(rpc, resolvedAccount,
    { model: modelSpec, effort: 'medium', speed: 'default', permission: 'full-access', ephemeral: false },
    { kind: 'local' }, browserBinding);
  scopes.set(session.id, { chat: null, log: null });
  await rpc.sessions.update.mutate({ accountId, sessionId: session.id, title, runtimeConfig: { memoryExtractionDisabled: true } });
  assert(session.cwd && isDisposable(await realpath(session.cwd)), 'Actual session cwd must be disposable.');
  assert.deepEqual(session.model, model);
  const log = join(reportDirectory, `${session.id}.jsonl`);
  await writeFile(log, '', { mode: 0o600, flag: 'wx' });
  const chat = helpers.createChatClient({ sessionId: session.id,
    endpoint: `${helpers.DAEMON_BASE_URL}/agents/chat/${session.id}?accountId=${accountId}`,
    createSocket: daemon.connectWebsocketToDaemon, logDumpPath: log, onAssistantMessage() {} });
  scopes.set(session.id, { chat, log });
  return session;
}
async function prompt(session, message, attachments = []) {
  const { chat, log } = scopes.get(session.id);
  await helpers.flushLogDump(log);
  const before = (await readFile(log, 'utf8')).length;
  let finished = false;
  const watch = (async () => {
    const deadline = Date.now() + 480000;
    while (!finished) {
      await delay(500);
      if (finished) return;
      const current = await rpc.sessions.get.query({ accountId, sessionId: session.id });
      assert.deepEqual(current.model, model, 'Only required Muse contributor model permitted.');
      assert(current.status !== 'suspended', `Unexpected human decision: ${current.suspension?.kind}`);
      assert(!['errored', 'aborted', 'interrupted'].includes(current.status), `Task stopped: ${current.status}`);
      assert(Date.now() < deadline, 'Task exceeded eight-minute deadline.');
    }
  })();
  try {
    const timestamp = Date.now();
    const user = { role: 'user', content: [{ type: 'text', text: message }], timestamp };
    const bundle = attachments.length ? [{ role: 'user-message-metadata', attachments, timestamp: timestamp - 1 }, user] : user;
    await Promise.race([chat.sendMessage(bundle), watch]);
  } catch (error) {
    await rpc.sessions.abort.mutate({ accountId, sessionId: session.id });
    throw error;
  } finally { finished = true; await watch.catch(() => {}); }
  await helpers.flushLogDump(log);
  const events = (await readFile(log, 'utf8')).slice(before).split('\n').filter(Boolean).map(line => JSON.parse(line));
  assert(events.some(event => event.type === 'agent_end'), 'Actual supplied terminal event required.');
  const messages = events.filter(event => event.type === 'message_end').map(event => event.message);
  for (const event of events) {
    if (event.compactionProvider) assert.equal(`${event.compactionProvider}/${event.compactionModel}`, modelSpec);
    if (event.message?.role === 'assistant') {
      assert.equal(event.message.provider, providerId);
      assert.equal(event.message.model, model.modelId);
      assert(!event.message.errorMessage, 'Assistant reported an error; inspect private local log.');
    }
  }
  return { answer: messages.filter(row => row.role === 'assistant').flatMap(row => row.content).filter(block => block.type === 'text').map(block => block.text).join('\n'), events,
    current: await rpc.sessions.get.query({ accountId, sessionId: session.id }) };
}
function toolNames(result) { return result.events.filter(event => event.type === 'tool_execution_start').map(event => event.toolName); }
function browserEvidence(result) {
  const calls = result.events.filter(event => event.type === 'tool_execution_start');
  assert(calls.some(call => call.toolName === 'repl' && /\bsnapshot\s*\(/.test(call.args.code)), 'Actual browser snapshot through supplied REPL required.');
  assert(calls.every(call => call.toolName === 'repl'), 'Browser-only cases must use supplied browser REPL only.');
  for (const call of calls) assert(!/\b(fetch|fs|require|import|evaluate|exec|spawn)\b/.test(call.args.code), 'Browser-only REPL cannot bypass observation/action through HTTP, files, shell or arbitrary page evaluation.');
}
const browserInstruction = id => `Use only the browser REPL tool with openTab(), snapshot() and locator actions. Open one normal owned tab in this disposable profile at ${site.url(id)}. Observe fresh snapshot refs before acting and verify with snapshot after each action. Do not use fetch, evaluate, shell, files, memory or other tools. `;
const has = (id, predicate) => assert(site.events(id).some(predicate), `Expected actual fixture action missing for ${id}.`);
const working = session => session.cwd;
const cases = [
  { title: 'Read a browser page', run: async s => { const r = await prompt(s, browserInstruction('read') + 'Report its project code and delivery day/time.'); browserEvidence(r); assert(r.answer.includes(site.marker) && /Wednesday/.test(r.answer) && /14:30/.test(r.answer)); return r; } },
  { title: 'Fill and submit a local form', run: async s => { const r = await prompt(s, browserInstruction('form') + 'Save a disposable delivery for Rowan Test in Pinebrook using the form, then report the visible confirmation.'); browserEvidence(r); has('form', e => e.action === 'saved' && e.name === 'Rowan Test' && e.city === 'Pinebrook'); return r; } },
  { title: 'Change and verify a page setting', run: async s => { const r = await prompt(s, browserInstruction('toggle') + 'Enable the test notifications, then read and report their current status.'); browserEvidence(r); has('toggle', e => e.action === 'enabled'); return r; } },
  { title: 'Search a browser catalog', run: async s => { const r = await prompt(s, browserInstruction('filter') + 'Filter the catalog for Azure. Report the remaining item and count.'); browserEvidence(r); has('filter', e => e.action === 'filtered' && e.rows?.length === 1 && e.rows[0] === 'Azure notebook'); assert(/Azure notebook/i.test(r.answer)); return r; } },
  { title: 'Read a second page of data', run: async s => { const r = await prompt(s, browserInstruction('pagination') + 'Open the next record and report its species and crate quantity.'); browserEvidence(r); has('pagination', e => e.action === 'page' && e.page === 2); assert(/Cedar/.test(r.answer) && /27/.test(r.answer)); return r; } },
  { title: 'Sort a browser table', run: async s => { const r = await prompt(s, browserInstruction('sort') + 'Sort by quantity and report the smallest and largest inventory entries.'); browserEvidence(r); has('sort', e => e.action === 'sorted'); assert(/Cedar/.test(r.answer) && /Birch/.test(r.answer)); return r; } },
  { title: 'Edit a disposable basket', run: async s => { const r = await prompt(s, browserInstruction('basket') + 'Add exactly two notebooks and one pencil to the disposable test basket, then verify the counts. Do not purchase anything.'); browserEvidence(r); has('basket', e => e.action === 'basket' && e.notebook === 2 && e.pencil === 1); return r; } },
  { title: 'Create a browser list entry', run: async s => { const r = await prompt(s, browserInstruction('todo') + 'Add the task Inspect cedar shipment and verify it appears in the list.'); browserEvidence(r); has('todo', e => e.action === 'added' && e.title === 'Inspect cedar shipment'); return r; } },
  { title: 'Reveal and read hidden details', run: async s => { const r = await prompt(s, browserInstruction('details') + 'Expand dispatch details and report the reference and gate.'); browserEvidence(r); has('details', e => e.action === 'expanded'); assert(r.answer.includes(site.marker) && /7/.test(r.answer)); return r; } },
  { title: 'Follow a browser link', run: async s => { const r = await prompt(s, browserInstruction('directory') + 'Follow Cedar team details and report the contact code and storage room.'); browserEvidence(r); has('detail', e => e.action === 'visit'); assert(r.answer.includes(site.marker) && /42/.test(r.answer)); return r; } },
  { title: 'Write and edit a working file', run: async s => { const r = await prompt(s, 'In your working directory use write_file to create note.md containing Shipment status: pending, then use edit_file to change pending to ready. Read the file back and report its content.'); assert((await readFile(join(working(s), "note.md"), 'utf8')).includes('Shipment status: ready')); assert(toolNames(r).includes('write_file') && toolNames(r).includes('edit_file') && toolNames(r).includes('read_file')); return r; } },
  { title: 'Transform a CSV with a local command', seed: { name: 'input.csv', content: 'item,quantity\ncedar,7\nbirch,12\nmaple,9\n' }, run: async s => { const r = await prompt(s, 'Use a local shell command to read input.csv in your working directory, total the quantities, and write the integer total alone to total.txt. Report the result.'); assert.equal((await readFile(join(working(s), "total.txt"), 'utf8')).trim(), '28'); assert(toolNames(r).includes('bash')); return r; } },
  { title: 'Analyze an explicit CSV attachment', attachment: { fileName: 'orders.csv', mediaType: 'text/csv', text: 'item,quantity,unit_price\nnotebook,12,7\npencil,9,5\nfolder,4,18\n' }, run: async (s, ids) => { const r = await prompt(s, 'Calculate the grand total quantity-times-unit-price across every row of the attached orders CSV. Show the arithmetic and final total.', ids); assert(/201/.test(r.answer)); return r; } },
  { title: 'Deduplicate structured attachment data', attachment: { fileName: 'records.json', mediaType: 'application/json', text: '[{"id":"A","name":"Cedar"},{"id":"A","name":"Cedar"},{"id":"B","name":"Birch"},{"id":"C","name":"Maple"}]' }, run: async (s, ids) => { const r = await prompt(s, 'Deduplicate the attached records by id, preserve first occurrence order, and use write_file to save the resulting JSON array as clean.json in your working directory.', ids); const rows = JSON.parse(await readFile(join(working(s), "clean.json"), 'utf8')); assert.deepEqual(rows, [{id:'A',name:'Cedar'},{id:'B',name:'Birch'},{id:'C',name:'Maple'}]); assert(toolNames(r).includes('write_file')); return r; } },
  { title: 'Store durable local memory', run: async s => { const r = await prompt(s, `Use write_file to write ${join(memoryDirectory, `acceptance-${runId}.md`)} containing this factual note: Project Silver Orchard uses dispatch code ${site.marker}; the staging room is 42. Do not merely promise to remember it.`); const file = await rpc.memory.readFile.query({ accountId, filePath: `acceptance-${runId}.md` }); assert(file.content.includes(site.marker)); assert(toolNames(r).includes('write_file')); return r; } },
  { title: 'Recall memory in another conversation', run: async s => { const r = await prompt(s, 'Use semantic memory_search to find Project Silver Orchard. Report its dispatch code and staging room from the saved source.'); assert(r.answer.includes(site.marker) && /42/.test(r.answer)); assert(toolNames(r).includes('memory_search')); const searchResults = await rpc.memory.search.query({ accountId, queries: ['Project Silver Orchard'], maxResults: 5 }); assert(searchResults.some(hit => JSON.stringify(hit).includes(site.marker)), 'Actual indexed memory evidence required.'); return r; } },
  { title: 'Delegate and await a child task', run: async s => { const r = await prompt(s, 'Delegate to one fresh subagent this task: compute 17*6+29*2 and verify the arithmetic. Use the exact same vercel-ai-gateway/meta/muse-spark-1.3-contributor model for that child. Wait for it and report its result. Use actual subagent and subagent_wait tools.'); assert(toolNames(r).includes('subagent')); assert(toolNames(r).includes('subagent_wait')); assert(/160/.test(r.answer)); return r; } },
  { title: 'Maintain a task plan', run: async s => { const r = await prompt(s, 'Use write_todos to record a three-step plan: inspect shipment, validate quantity, save report. Mark the first complete and keep the last two pending. Then report the plan.'); assert(toolNames(r).includes('write_todos')); return r; } },
  { title: 'Automatically compact and continue', run: async s => {
    const allEvents = [];
    let output;
    for (let round = 0; round < 8; round++) {
      output = await prompt(s, `${round === 0 ? `The important dispatch code is ${site.marker}. Retain that fact.` : 'Preserve the dispatch code from the earlier conversation.'} Acknowledge briefly, without tools. Background fixture records:\n${compactionBackground(runId, round)}`);
      allEvents.push(...output.events);
      if (allEvents.some(event => event.type === 'auto_compaction_end' && event.result && !event.aborted && !event.errorMessage)) break;
    }
    assert(allEvents.some(event => event.type === 'auto_compaction_start'), 'Real automatic compaction must begin.');
    assert(allEvents.some(event => event.type === 'auto_compaction_end' && event.result && !event.aborted && !event.errorMessage), 'Real automatic compaction must finish successfully.');
    output = await prompt(s, 'Return the important dispatch code from the preceding conversation.');
    assert(output.answer.includes(site.marker));
    output.events = [...allEvents, ...output.events];
    return output;
  } },
  { title: 'Turn a browser observation into a report', run: async s => { const r = await prompt(s, `Use browser tools to navigate one disposable tab to ${site.url('read')}, read its project code and delivery schedule, and use write_file to save a Markdown report.md in your working directory containing those observed facts. Do not use webfetch or shell for the observation.`); const text = await readFile(join(working(s), "report.md"), 'utf8'); assert(text.includes(site.marker) && /Wednesday/.test(text) && /14:30/.test(text)); assert(toolNames(r).includes('repl') && toolNames(r).includes('write_file')); browserEvidence({ events: r.events.filter(e => e.type !== 'tool_execution_start' || e.toolName === 'repl') }); assert(toolNames(r).every(name => ['repl','write_file','read_file','edit_file'].includes(name))); return r; } },
];
let memoryDirectory;
try {
  await rpc.models.setAiGatewayModelIds.mutate({ accountId, providerId, modelIds: [model.modelId] });
  await setting('defaultModel', model);
  await setting('modelCategories', Object.fromEntries(['fast', 'standard', 'deep', 'visual'].map(category => [category, model])));
  // Supplied production threshold clamps to64000 tokens. No fake tiny runtime
  // window or explicit manual-compaction call may satisfy automatic acceptance.
  const compaction = await rpc.settings.get.query({ accountId, key: 'compaction' });
  await setting('compaction', { ...compaction, enabled: true, reserveTokens: 2048, keepRecentTokens: 2048,
    modelThresholdTokens: { ...compaction.modelThresholdTokens, [modelSpec]: 64000 } });
  // Configure routing before making any credential available to background work.
  credentialWritten = true;
  await rpc.models.setCredential.mutate({ accountId, providerId, credential: { type: 'api_key', key } });
  key = '';
  const available = await rpc.models.listAvailable.query({ accountId });
  assert(available.length > 0 && available.every(row => row.provider === providerId && row.id === model.modelId), 'Only Muse may be available to parent, child or background inference.');
  memoryDirectory = await rpc.memory.getDirectory.query({ accountId });
  await mkdir(memoryDirectory, { recursive: true, mode: 0o700 });
  assert(isDisposable(await realpath(memoryDirectory)), 'Actual memory directory must be disposable.');
  for (const [index, test] of cases.slice(0, limit).entries()) {
    const startedAt = Date.now();
    const result = { number: index + 1, title: test.title, passed: false };
    report.cases.push(result);
    try {
      const session = await create(`Acceptance ${index + 1}: ${test.title}`);
      result.sessionId = session.id;
      if (test.seed) await writeFile(join(working(session), test.seed.name), test.seed.content, { mode: 0o600, flag: 'wx' });
      const attachments = [];
      if (test.attachment) {
        const attachment = { id: randomUUID(), type: 'file', name: test.attachment.fileName,
          mimeType: test.attachment.mediaType, data: Buffer.from(test.attachment.text).toString('base64') };
        const uploaded = await rpc.sessions.files.uploadAttachment.mutate({ accountId, sessionId: session.id, attachment });
        assert(uploaded.path.startsWith('attachments/') && !uploaded.data, 'Actual stored attachment required.');
        attachments.push(uploaded);
      }
      const output = await test.run(session, attachments);
      // Check actual session records including children, not just a parent answer.
      const records = await rpc.sessions.list.query({ accountId, archived: 'include', ephemeral: 'include', parent: 'all' });
      for (const record of records) assert.equal(`${record.model.provider}/${record.model.modelId}`, modelSpec, 'Every disposable parent/child session must use Muse.');
      if (index === 16) assert(records.some(record => record.parentId === session.id), 'A real persisted child session is required.');
      if (index === 17) {
        const todos = output.events.filter(event => event.type === 'tool_execution_end' && event.toolName === 'write_todos')
          .flatMap(event => event.result?.details?.updatedTodos ?? []);
        assert(todos.some(todo => todo.status === 'completed') && todos.filter(todo => todo.status === 'pending').length >= 2, 'Actual completed/pending todo state required.');
      }
      result.tools = [...new Set(toolNames(output))];
      result.passed = true;
      scopes.get(session.id).chat.dispose();
      scopes.delete(session.id);
    } catch {
      result.error = 'Acceptance assertion or supplied operation failed; inspect private local raw events.';
      throw Error(`Acceptance case ${index + 1} failed: ${test.title}`);
    } finally { result.durationMs = Date.now() - startedAt; await save(); }
    console.log(`${index + 1}/${limit} passed: ${test.title}`);
  }
  report.complete = limit === 20 && report.cases.every(test => test.passed);
} finally {
  key = '';
  const cleanupErrors = [];
  for (const [sessionId, { chat }] of scopes) {
    try { await rpc.sessions.abort.mutate({ accountId, sessionId }); }
    catch { cleanupErrors.push(`abort:${sessionId}`); }
    chat?.dispose();
  }
  if (credentialWritten) {
    try {
      await rpc.models.removeCredential.mutate({ accountId, providerId });
      assert(!(await rpc.models.getCredentialStatus.query({ accountId, providerId })).exists);
      report.credentialCleanup = 'removed and verified through supplied credential API';
    } catch { cleanupErrors.push('credential removal not verified; destroy the disposable home'); }
  }
  for (const [key, value] of previousSettings) {
    try { await rpc.settings.set.mutate({ accountId, key, value }); }
    catch { cleanupErrors.push(`settings:${key}`); }
  }
  await site.close();
  report.finishedAt = new Date().toISOString();
  report.cleanupErrors = cleanupErrors;
  if (cleanupErrors.length) report.complete = false;
  await save();
  console.log(`Acceptance evidence: ${reportDirectory}/report.json (full suite complete: ${report.complete})`);
  assert.equal(cleanupErrors.length, 0, 'Disposable acceptance cleanup incomplete; inspect report.');
}
