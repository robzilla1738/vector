#!/usr/bin/env node
// Required real-model acceptance. Never runs against an owner's profile/home.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';
import { Client } from '../apps/cli/dist/client.js';
import { fixtures } from './e2e/fixtures.mjs';

const root = resolve(import.meta.dirname, '..');
const options = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const name = process.argv[i];
  if (!['--profile', '--account', '--limit'].includes(name) || !process.argv[i + 1]) throw Error('Usage: AUX_HOME=<disposable home> node scripts/e2e.mjs --account N --profile ID [--limit 1..20]');
  options[name.slice(2)] = process.argv[i + 1];
}
assert(options.profile && options.account && process.env.AUX_HOME, 'Explicit disposable home/account/profile are required.');
const temporary = await realpath(tmpdir());
const home = await realpath(process.env.AUX_HOME);
const isDisposable = path => {
  const rel = relative(temporary, path);
  return !rel.startsWith('..') && !resolve(rel).startsWith(sep + '..') && rel.split(sep)[0]?.startsWith('aux-');
};
assert(isDisposable(home), 'Acceptance requires an aux-* disposable directory beneath the system temporary directory.');
const client = new Client(options.account);
const accountId = await client.account();
const registry = await client.call('accounts.summary');
const binding = registry.profileBindings.find(row => row.profileId === options.profile && row.accountId === accountId);
assert(binding?.profilePath && isDisposable(await realpath(binding.profilePath)), 'The selected account must bind to the exact disposable browser profile.');
const limit = Number(options.limit ?? 20);
assert(Number.isInteger(limit) && limit >= 1 && limit <= 20, 'Limit must be 1..20.');
const providerId = 'vercel-ai-gateway';
const model = { provider: providerId, modelId: 'meta/muse-spark-1.3-contributor', thinkingLevel: 'medium', fastMode: false };
const previous = await client.scoped('models.getCredentialStatus', { providerId });
assert(!previous.exists, 'Use a fresh disposable account without an existing provider credential.');
const environment = await readFile(join(root, '.env'), 'utf8');
const match = environment.match(/^\s*(?:export\s+)?AI_GATEWAY_API_KEY\s*=\s*(.+?)\s*$/m);
assert(match, 'AI_GATEWAY_API_KEY is missing from the workspace .env.');
let key = match[1];
if ((key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))) key = key.slice(1, -1);
assert(key.trim(), 'The configured provider key is empty.');
const site = await fixtures();
const runId = randomUUID();
const reportDirectory = join(root, 'out/acceptance', `e2e-${runId}`);
await mkdir(reportDirectory, { recursive: true, mode: 0o700 });
const report = { runId, model: `${providerId}/${model.modelId}`, startedAt: new Date().toISOString(), requested: limit, cases: [], complete: false };
const save = () => writeFile(join(reportDirectory, 'report.json'), JSON.stringify(report, null, 2) + '\n', { mode: 0o600 });
const scopes = new Set();
async function create(title, runtimeConfig) {
  const session = await client.scoped('sessions.create', { title, model, browserBinding: { profileId: options.profile, browserMode: 'default' }, ephemeral: false, permissionMode: 'full-access', ...(runtimeConfig ? { runtimeConfig } : {}) }, true);
  scopes.add(session.id);
  return session;
}
async function prompt(session, message, attachmentIds = []) {
  await client.scoped('sessions.prompt', { sessionId: session.id, message, attachmentIds, idempotencyKey: randomUUID() }, true);
  const deadline = Date.now() + 240000;
  while (Date.now() < deadline) {
    const current = await client.scoped('sessions.get', { sessionId: session.id });
    assert.deepEqual(current.model, model, 'The task must use only the required contributor model.');
    if (current.status === 'suspended') throw Error(`Task requires an unexpected human decision (${current.suspension?.kind}).`);
    if (['errored', 'aborted'].includes(current.status)) throw Error(`Task stopped with ${current.status}: ${current.error ?? 'inspect its local events'}`);
    if (current.status === 'idle') {
      const messages = await client.scoped('sessions.messages', { sessionId: session.id });
      const events = await client.scoped('sessions.eventsSince', { sessionId: session.id, cursor: 0 });
      return { answer: messages.filter(row => row.role === 'assistant').map(row => row.content).join('\n'), events, current };
    }
    await delay(300);
  }
  await client.scoped('sessions.abort', { sessionId: session.id }, true);
  throw Error('Task exceeded its four-minute deadline.');
}
function toolNames(result) { return result.events.filter(event => event.type === 'tool-started').map(event => event.data.name); }
function browserEvidence(result) {
  const names = toolNames(result);
  assert(names.includes('page_view'), 'A browser observation is required.');
  assert(names.every(name => ['browser_tabs', 'page_view', 'browser_navigate', 'browser_click', 'browser_type', 'browser_scroll'].includes(name)), 'Browser-only cases must use the actual browser tools.');
}
const browserInstruction = id => `Use only browser tools. Use one normal tab in this disposable profile and navigate it to ${site.url(id)}. Observe current element refs before acting. Do not use HTTP, shell, files, memory or other tools. `;
const has = (id, predicate) => assert(site.events(id).some(predicate), `Expected actual fixture action was not observed for ${id}.`);
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
  { title: 'Write and edit a working file', run: async s => { const r = await prompt(s, 'In your working directory use write_file to create note.md containing Shipment status: pending, then use edit_file to change pending to ready. Read the file back and report its content.'); assert((await readFile(join(home, `u/${accountId}/sessions/${s.id}/note.md`), 'utf8')).includes('Shipment status: ready')); assert(toolNames(r).includes('edit_file')); return r; } },
  { title: 'Transform a CSV with a local command', seed: { name: 'input.csv', content: 'item,quantity\ncedar,7\nbirch,12\nmaple,9\n' }, run: async s => { const r = await prompt(s, 'Use a local shell command to read input.csv in your working directory, total the quantities, and write the integer total alone to total.txt. Report the result.'); assert.equal((await readFile(join(home, `u/${accountId}/sessions/${s.id}/total.txt`), 'utf8')).trim(), '28'); assert(toolNames(r).includes('bash')); return r; } },
  { title: 'Analyze an explicit CSV attachment', attachment: { fileName: 'orders.csv', mediaType: 'text/csv', text: 'item,quantity,unit_price\nnotebook,12,7\npencil,9,5\nfolder,4,18\n' }, run: async (s, ids) => { const r = await prompt(s, 'Calculate the grand total quantity-times-unit-price across every row of the attached orders CSV. Show the arithmetic and final total.', ids); assert(/201/.test(r.answer)); return r; } },
  { title: 'Deduplicate structured attachment data', attachment: { fileName: 'records.json', mediaType: 'application/json', text: '[{"id":"A","name":"Cedar"},{"id":"A","name":"Cedar"},{"id":"B","name":"Birch"},{"id":"C","name":"Maple"}]' }, run: async (s, ids) => { const r = await prompt(s, 'Deduplicate the attached records by id, preserve first occurrence order, and use write_file to save the resulting JSON array as clean.json in your working directory.', ids); const rows = JSON.parse(await readFile(join(home, `u/${accountId}/sessions/${s.id}/clean.json`), 'utf8')); assert.deepEqual(rows.map(row => row.id), ['A','B','C']); return r; } },
  { title: 'Store durable local memory', run: async s => { const r = await prompt(s, `Use memory_operators to write acceptance-${runId}.md containing this factual note: Project Silver Orchard uses dispatch code ${site.marker}; the staging room is 42. Do not merely promise to remember it.`); const file = await client.scoped('memory.readFile', { filePath: `acceptance-${runId}.md` }); assert(file.content.includes(site.marker)); return r; } },
  { title: 'Recall memory in another conversation', run: async s => { const r = await prompt(s, 'Use semantic memory_search to find Project Silver Orchard. Report its dispatch code and staging room from the saved source.'); assert(r.answer.includes(site.marker) && /42/.test(r.answer)); return r; } },
  { title: 'Delegate and await a child task', run: async s => { const r = await prompt(s, 'Delegate to one fresh subagent this task: compute 17*6+29*2 and verify the arithmetic. Wait for that child and report its result. Use actual subagent and subagent_wait tools.'); assert(toolNames(r).includes('subagent')); assert(toolNames(r).includes('subagent_wait')); assert(/160/.test(r.answer)); return r; } },
  { title: 'Maintain a task plan', run: async s => { const r = await prompt(s, 'Use write_todos to record a three-step plan: inspect shipment, validate quantity, save report. Mark the first complete and keep the last two pending. Then report the plan.'); assert(toolNames(r).includes('write_todos')); return r; } },
  { title: 'Automatically compact and continue', runtimeConfig: { contextWindowTokens: 4096, compactionThreshold: 0.6 }, run: async s => { await prompt(s, `Remember the important dispatch code ${site.marker}. Acknowledge briefly. Background notes: ${'cedar shipment review '.repeat(380)}`); const r = await prompt(s, `Return the important dispatch code from my preceding message. Additional context: ${'review staging notes '.repeat(170)}`); assert(r.answer.includes(site.marker)); assert(r.events.some(e => e.type === 'compacted' && e.data.automatic === true), 'A real automatic compaction must occur.'); return r; } },
  { title: 'Turn a browser observation into a report', run: async s => { const r = await prompt(s, `Use browser tools to navigate one disposable tab to ${site.url('read')}, read its project code and delivery schedule, and use write_file to save a Markdown report.md in your working directory containing those observed facts. Do not use webfetch or shell for the observation.`); const text = await readFile(join(home, `u/${accountId}/sessions/${s.id}/report.md`), 'utf8'); assert(text.includes(site.marker) && /Wednesday/.test(text) && /14:30/.test(text)); assert(toolNames(r).includes('page_view') && toolNames(r).includes('write_file')); return r; } },
];
try {
  await client.scoped('models.setCredential', { providerId, credential: { type: 'api_key', key } }, true);
  key = '';
  for (const [index, test] of cases.slice(0, limit).entries()) {
    const startedAt = Date.now();
    const session = await create(`Acceptance ${index + 1}: ${test.title}`, test.runtimeConfig);
    const result = { number: index + 1, title: test.title, sessionId: session.id, passed: false };
    report.cases.push(result);
    try {
      if (test.seed) await writeFile(join(home, `u/${accountId}/sessions/${session.id}`, test.seed.name), test.seed.content, { mode: 0o600 });
      const ids = [];
      if (test.attachment) ids.push((await client.scoped('sessions.uploadAttachment', { sessionId: session.id, fileName: test.attachment.fileName, mediaType: test.attachment.mediaType, base64: Buffer.from(test.attachment.text).toString('base64'), idempotencyKey: randomUUID() }, true)).id);
      const output = await test.run(session, ids);
      result.passed = true;
      result.tools = [...new Set(toolNames(output))];
    } catch (error) {
      result.error = String(error.message).slice(0, 2000);
      throw error;
    } finally { result.durationMs = Date.now() - startedAt; await save(); }
    console.log(`${index + 1}/${limit} passed: ${test.title}`);
  }
  report.complete = limit === 20 && report.cases.every(test => test.passed);
} finally {
  for (const sessionId of scopes) await client.scoped('sessions.abort', { sessionId }, true).catch(() => {});
  await client.scoped('models.removeCredential', { providerId }, true);
  await site.close();
  report.finishedAt = new Date().toISOString();
  await save();
  console.log(`Acceptance evidence: ${reportDirectory}/report.json (full suite complete: ${report.complete})`);
}
