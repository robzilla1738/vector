// Test-only: the steps of parity-steps.mjs for the daemon's services: the Context Awareness ledger's
// stored content, the agent server over a stand-in agent, and the model registry's catalog side.
import {createHash} from 'node:crypto';
import path from 'node:path';

const MODEL = {provider: 'test', modelId: 'test'};
const digest = value => createHash('sha256').update(value instanceof Uint8Array ? value : JSON.stringify(value)).digest('hex');

/** Each ledger table as plain rows, with bytes as their digest. */
function ledgerRows({daemon}) {
  const sql = daemon.ledgerDb(0).$client, rows = {};
  for (const table of ['events', 'blobs', 'frames', 'summaries'])
    rows[table] = sql.prepare(`select * from context_awareness_${table} order by rowid`).all().map(row => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value instanceof Uint8Array ? digest(value) : value])));
  return rows;
}

/** Runs each named call in turn, recording its value or its error. */
function recorder(results) {
  return async (step, run) => {
    try {
      if (process.env.AUX_PEEK) process.stderr.write(`# ${step}\n`);
      const value = await run();
      results.push({step, value: value === undefined ? null : value});
      return value;
    } catch (error) {
      results.push({step, error: error.message, errors: error.errors?.map(entry => entry.message)});
      return undefined;
    }
  };
}

const page = (at, content, extra = {}) => ({source: 'aux_dom', kind: 'content.snapshot', trigger: 'navigation', shape: 'aria', occurredAt: at, appName: 'Aux', bundleId: 'dev.aux.browser', windowTitle: 'Plants',
  url: 'https://example.com/plants', target: {targetId: 'tab-1'}, content, ...extra});
const native = (at, kind, content, payload = {}, extra = {}) => ({source: 'mac_ax', kind, occurredAt: at, appName: 'Notes', bundleId: 'com.example.Notes', windowTitle: 'Garden', target: {}, payload: {kind, ...payload}, ...content === undefined ? {} : {content}, ...extra});
const outline = (count, word = 'tomatoes') => Array.from({length: count}, (_, index) => `- paragraph "Line ${index} about ${word}"`).join('\n');
const axTree = (value, document = value) => `AXWindow title="Notes"\n  AXTextArea title="Note" value="${value}"\n${outline(30, 'basil')}${document === undefined ? '' : `\ndocument="${document}"`}`;

/** The ledger's write, read-content, frame, verify and clear paths, with blobs encrypted under the stage's test key. */
async function runLedger(harness) {
  const {daemon} = harness, results = [], step = recorder(results), minute = 60_000;
  performance.now = () => 0;
  const set = change => daemon.settings(0).set('contextAwareness', awareness => ({...awareness, ...change}));
  const record = (name, input, options) => step(name, () => daemon.recordContextAwarenessEvent(0, input, options));
  const rows = name => results.push({step: name, rows: ledgerRows(harness)});
  set({enabled: true, pausedUntil: null, captureTypedText: true, rules: [{scope: 'app', bundleId: 'com.blocked.App', behavior: 'do_not_observe'}, {scope: 'url', urlDomain: 'secret.example', behavior: 'do_not_observe'}]});
  await step('start from an empty ledger', () => daemon.clearContextAwarenessAndFrames(0, {kind: 'all'}));
  const start = Math.floor(Date.now() / 6e5) * 6e5 + minute;
  let at = start;
  const next = (ms = 1000) => (at += ms);

  // Pages: stored, unchanged, a small change as a diff, a rewrite, another page in the tab, a popover.
  await record('page', page(next(), outline(40)));
  await record('page unchanged', page(next(), outline(40)));
  await record('page with a small change', page(next(), `${outline(40)}\n- button "Save"`));
  await record('page rewritten', page(next(), outline(40, 'peppers')));
  await record('page at another url', page(next(), outline(40, 'peppers'), {url: 'https://example.com/other'}));
  await record('popover over the page', page(next(), '- dialog "Share"', {url: 'https://example.com/other'}));
  await record('stale keyframe', page(next(11 * minute), outline(41, 'peppers'), {url: 'https://example.com/other'}));
  // Text captures: a near duplicate shares the first blob, an exact one from another tab too.
  const article = Array.from({length: 200}, (_, index) => `Sentence ${index} of a long article about growing tomatoes at home.`).join(' ');
  await record('text capture', page(next(), article, {shape: 'text', trigger: 'discovery'}));
  await record('text near duplicate', page(next(), `${article} One more sentence.`, {shape: 'text', trigger: 'sweep'}));
  await record('text exact, other tab', page(next(), article, {shape: 'text', target: {targetId: 'tab-2'}, media: true}));
  await record('text near duplicate, other url', page(next(), `${article} Another ending.`, {shape: 'text', url: 'https://example.com/elsewhere'}));
  // Native accessibility trees, and an action on an unchanged window.
  await record('tree', native(next(), 'window.changed', outline(30), {axMode: 'fullTree'}));
  await record('tree unchanged', native(next(), 'window.changed', outline(30), {axMode: 'fullTree'}));
  await record('click, tree unchanged', native(next(), 'mouse.click', outline(30), {axMode: 'fullTree', button: 'left'}));
  await record('tree with a small change', native(next(), 'window.changed', `${outline(30)}\n- link "More"`, {axMode: 'fullTree'}));
  await record('tree truncated', native(next(), 'window.changed', `${outline(30)}\n- link "More"\n- link "Again"\n… AX tree truncated`, {axMode: 'fullTree'}));
  await record('tree truncated again', native(next(), 'window.changed', `${outline(30)}\n- link "More"\n- link "Again"\n- link "Third"\n… AX tree truncated`, {axMode: 'fullTree'}));
  // A draft typed into a field, coalesced, echoed by the app, then submitted.
  const field = {role: 'AXTextArea', title: 'Note'}, typed = (value, payload = {draft: true}, extra = {}) => native(next(), 'keyboard.text_input', value, {characterCount: value.length, ...payload}, {target: field, windowTitle: 'Draft', ...extra});
  await record('tree before the draft', native(next(), 'window.changed', axTree('hello'), {axMode: 'fullTree'}, {windowTitle: 'Draft'}));
  await record('draft', typed('hello'));
  await record('draft continued', typed('hello there'));
  await record('tree echoing the draft', native(next(), 'window.changed', axTree('hello there'), {axMode: 'fullTree'}, {windowTitle: 'Draft'}));
  await record('tree echoing without a document', native(next(), 'window.changed', axTree('hello there', null).replace('\ndocument="null"', ''), {axMode: 'fullTree'}, {windowTitle: 'Draft'}));
  await record('tree changing the document too', native(next(), 'window.changed', axTree('hello there', 'hello there and more'), {axMode: 'fullTree'}, {windowTitle: 'Draft'}));
  await record('a different draft in the field', typed('zzz something else'));
  await record('a shorter draft, still the same text', typed('zzz something'));
  await record('a shorter draft', typed('zzz s'));
  await record('much shorter', typed('z'));
  await record('draft in another field', typed('hello there friend', {draft: true}, {target: {role: 'AXTextField'}}));
  await record('draft after a window', typed('unrelated', {draft: true}, {url: 'https://example.com/a'}));
  await record('click elsewhere ends the draft', native(next(), 'mouse.click', undefined, {button: 'left'}, {windowTitle: 'Draft', target: {role: 'AXButton'}}));
  await record('draft again', typed('second'));
  await record('shift-return keeps it', native(next(), 'keyboard.submit', undefined, {key: 'return', modifiers: ['shift']}, {target: field, windowTitle: 'Draft'}));
  await record('draft goes on', typed('second line'));
  await record('submitted', typed('second line sent', {submitted: true}));
  await record('typing after sending', typed('second line sent, and more'));
  await record('return ends it', native(next(), 'keyboard.submit', undefined, {key: 'return'}, {target: field, windowTitle: 'Draft'}));
  // Selections: a burst is one event; a pause, or none selected, is not.
  const selected = (text, wait = 500) => native(next(wait), 'selection.changed', text, {characterCount: text.length}, {windowTitle: 'Selecting'});
  await record('selection', selected('Tomatoes'));
  await record('selection grows', selected('Tomatoes and basil'));
  await record('selection after a pause', selected('Peppers', 5000));
  await record('nothing selected', native(next(), 'selection.changed', undefined, {}));
  // Task boundaries, a window of the same app, and another app.
  await record('session started', native(next(), 'session.started', undefined, {reason: 'launch'}));
  await record('session event', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 's'}));
  await record('session ended', native(next(), 'session.ended', undefined, {reason: 'quit'}));
  await record('after the session', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'z'}));
  await record('idle gap starts a new sitting', native(next(31 * minute), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'p'}));
  await record('other app', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'q'}, {bundleId: 'com.example.Other', appName: 'Other'}));
  await record('win_uia', native(next(), 'mouse.drag', undefined, {button: 'left', origin: {role: 'a'}, destination: {role: 'b'}}, {source: 'win_uia'}));
  // Redaction and the capture policy.
  const secret = 'sk-ant-api03-abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJ';
  await record('secrets are redacted', page(next(), `Key ${secret} in text`, {url: 'https://example.com/x?token=abc123&utm_source=mail&id=7', windowTitle: `Title ${secret}`, target: {targetId: 'tab-3', title: secret},
    redactions: {inspected: 2, byRule: {earlier: 1}}, shape: 'text'}));
  await record('metadata is redacted', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: secret}));
  await record('an unresolvable native url is dropped', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'x'}, {url: 'not a url'}));
  await record('blocked app', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'x'}, {bundleId: 'com.blocked.App'}));
  await record('blocked url', page(next(), 'hidden', {url: 'https://www.secret.example/x'}));
  set({captureTypedText: false});
  await record('typed text off', typed('nope'));
  set({captureTypedText: true, pausedUntil: Date.now() + minute});
  await record('paused', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'x'}));
  set({pausedUntil: null});
  await record('not a valid event', {source: 'aux_dom', kind: 'nope', occurredAt: 1});
  await record('payload of another kind', native(next(), 'keyboard.shortcut', undefined, {kind: 'mouse.click'}));
  await record('held back before', native(next(), 'keyboard.shortcut', undefined, {modifiers: ['command'], key: 'x'}), {shouldCommit: () => false});
  let polls = 0;
  await record('held back after encrypting', native(next(), 'window.changed', 'A body that would be stored', {}), {shouldCommit: () => ++polls < 2});
  const {flushForAccountIfIndexed} = daemon.MemoryManager;
  daemon.MemoryManager.flushForAccountIfIndexed = async () => {};
  const racing = daemon.recordContextAwarenessEvent(0, native(next(), 'window.changed', 'Another body that would be stored', {}));
  daemon.bumpDeletionEpoch(0);
  await step('a deletion during encryption', () => racing);
  for (const [name, input] of [['browser capture', {accountId: 0, content: '- heading "Hi" [ref=e1] [focused]', title: 'Hi', url: 'https://example.com/hi', targetId: 'tab-9', capturedAt: next()}],
    ['browser capture repeated', {accountId: 0, content: '- heading "Hi" [ref=e2]', title: 'Hi', url: 'https://example.com/hi', targetId: 'tab-9', capturedAt: next()}],
    ['browser capture of text', {accountId: 0, content: 'Plain [ref=e1]', shape: 'text', url: 'https://example.com/hi', trigger: 'activation', captureMs: 3, capturedAt: next()}]])
    await step(name, () => daemon.recordCapture(input));
  const stay = {url: 'https://example.com/stay', target: {targetId: 'tab-5'}};
  const earlier = await record('a long stay', page(next(), outline(40, 'figs'), stay)), later = await record('a long stay, later', page(next(11 * minute), `${outline(40, 'figs')}\n- link "New"`, stay));
  const oneLine = await record('one very long line', page(next(), 'word '.repeat(9000), {shape: 'text', target: {targetId: 'tab-6'}, url: 'https://example.com/line'}));
  await step('browsing seen', () => [daemon.hasRecentAttendedBrowsing(0, start), daemon.hasRecentAttendedBrowsing(0, at * 2), daemon.hasRecentAttendedBrowsing(9, 0)]);
  await step('suppressions', () => daemon.suppressionSummary(0));
  await step('latest session', () => [daemon.findLatestContextAwarenessSession(0, 'com.example.Notes'), daemon.findLatestContextAwarenessSession(0, 'com.absent')]);
  rows('after writing');

  // Reading content back.
  const allEvents = daemon.ledgerDb(0).$client.prepare('select id, blob_id, url, kind from context_awareness_events order by rowid').all();
  const ids = allEvents.map(event => event.id), withBlob = allEvents.filter(event => event.blob_id).map(event => event.id);
  const read = (name, input) => step(`read: ${name}`, () => daemon.readContextAwarenessEvents(0, input));
  const contentOf = async eventIds => (await daemon.readEventContent(0, eventIds)).sort((a, b) => eventIds.indexOf(a.id) - eventIds.indexOf(b.id));
  await step('read content by event', async () => [await contentOf([]), await contentOf(withBlob), await contentOf(['absent'])]);
  await read('nothing found', {ids: ['absent']});
  await read('not valid', {ids: []});
  await read('one page', {ids: [withBlob[0]]});
  await read('with an angle-bracket id', {ids: [`⟨${withBlob[0]}⟩`]});
  await read('at an offset', {ids: [withBlob[0]], offset: 5});
  await read('past the end', {ids: [withBlob[0]], offset: 500});
  await read('a match', {ids: [withBlob[0]], match: 'LINE 7', contextLines: 1});
  await read('overlapping matches', {ids: [withBlob[0]], match: 'Line 1', contextLines: 2});
  await read('no match', {ids: [withBlob[0]], match: 'absent'});
  await read('a repeat and a diff', {ids: withBlob.slice(0, 5)});
  await read('later in a stay', {ids: [earlier.eventId, later.eventId]});
  await read('a stay, with a match', {ids: [earlier.eventId, later.eventId], match: 'New'});
  await read('a line over the read', {ids: [oneLine.eventId]});
  await read('a line over its share', {ids: [oneLine.eventId, withBlob[0]]});
  await read('many', {ids: withBlob.slice(0, 20)});
  await read('no content', {ids: ids.filter(id => !withBlob.includes(id)).slice(0, 3)});
  await step('evidence reader', async () => {
    const reader = daemon.createEvidenceReader(0), rowsWithContent = allEvents.filter(event => event.blob_id).map(event => ({blobId: event.blob_id, contentBytes: 10, source: 'aux_dom', kind: event.kind}));
    await reader.read(rowsWithContent);
    const small = daemon.createEvidenceReader(0);
    await small.read(rowsWithContent, 15);
    const late = daemon.createEvidenceReader(0, {deadline: -1}), controller = new AbortController, stopped = daemon.createEvidenceReader(0, {signal: controller.signal});
    controller.abort();
    await stopped.read(rowsWithContent);
    return {size: reader.content.size, limited: reader.limited, active: reader.active(), noDeadline: reader.timeRemaining, smallSize: small.content.size, smallLimited: small.limited, lateActive: late.active(), stoppedSize: stopped.content.size,
      projected: reader.project({...rowsWithContent[0], shape: 'aria'})?.text.slice(0, 80), none: reader.project({blobId: null}) ?? null, unread: small.project({blobId: 'absent'}) ?? null};
  });
  await step('verify every blob', () => daemon.verifyContextAwarenessStore(0, {all: true}));
  await step('verify a sample', () => daemon.verifyContextAwarenessStore(0, {sample: 3}));
  await step('verify by default', async () => (await daemon.verifyContextAwarenessStore(0)).checked);

  // Frames: blobs go cold, then seal; a window still growing keeps its last frame open.
  harness.advance(30 * minute);
  await step('seal too early', () => daemon.sealContextAwarenessFrames(0, start));
  await step('seal', () => daemon.sealContextAwarenessFrames(0, at + 15 * minute));
  rows('after sealing');
  await step('seal the idle rest', () => daemon.sealContextAwarenessFrames(0, at + 60 * minute));
  await step('seal again', () => daemon.sealContextAwarenessFrames(0, at + 60 * minute));
  rows('after sealing the rest');
  await step('read content from frames', () => contentOf(withBlob));
  await read('from a frame', {ids: withBlob.slice(0, 3)});
  await step('verify frames', () => daemon.verifyContextAwarenessStore(0, {all: true}));
  await step('a frame read from memory', async () => {
    const sqlite = daemon.ledgerDb(0).$client, frame = sqlite.prepare('select id, content from context_awareness_frames order by rowid limit 1').get();
    const member = sqlite.prepare(`select e.id as id from context_awareness_events e join context_awareness_blobs b on e.blob_id = b.id where b.frame_id = ? order by e.rowid limit 1`).get(frame.id);
    await daemon.readEventContent(0, [member.id]);
    sqlite.prepare(`update context_awareness_frames set content = x'00' where id = ?`).run(frame.id);
    const cached = await daemon.readEventContent(0, [member.id]);
    sqlite.prepare('update context_awareness_frames set content = ? where id = ?').run(frame.content, frame.id);
    return cached;
  });
  await step('compact with nothing lost', () => daemon.compactDegradedContextAwarenessFrames(0));

  // A big capture seals alone, and many captures of one window split into several frames.
  const big = 'x'.repeat(5_000_000);
  await record('a capture over the frame limit', native(at + 1000, 'window.changed', big, {}, {windowTitle: 'Big'}));
  for (let index = 0; index < 34; index += 1) await record(`small capture ${index}`, native(at + 2000 + index, 'window.changed', `Small ${index}`, {}, {windowTitle: 'Many'}));
  harness.advance(30 * minute);
  await step('seal big and many', () => daemon.sealContextAwarenessFrames(0, at + 90 * minute));
  await step('frames', () => daemon.ledgerDb(0).$client.prepare('select member_count, stored_bytes from context_awareness_frames order by rowid').all());

  // Clearing keeps what other windows still use, rewrites degraded frames and requeues summaries.
  const summaryIds = ids.slice(0, 3), sql = daemon.ledgerDb(0).$client, base = Math.floor(start / 6e5) * 6e5;
  const addSummary = sql.prepare(`insert into context_awareness_summaries (id, kind, window_from, window_to, created_at, updated_at, title, description, body, apps, domains, citations, source_ids, status, error, model, input_tokens, output_tokens)
    values (?, ?, ?, ?, ?, ?, 'T', 'D', 'B', '[]', '[]', ?, ?, ?, null, 'm', 1, 1)`);
  addSummary.run('sum-a', '10min', base, base + 6e5, base, base, JSON.stringify([{type: 'event', id: 'e1', title: 'A title', url: 'https://example.com/'}, {type: 'summary', id: 's2'}]), JSON.stringify(summaryIds), 'completed');
  addSummary.run('sum-b', '6h', base, base + 216e5, base, base, '[]', JSON.stringify(['sum-a']), 'completed');
  addSummary.run('sum-c', '10min', base + 12e5, base + 18e5, base, base, '[]', '[]', 'pending');
  await read('a summary with sources', {ids: ['sum-a', withBlob[0]]});
  await read('a summary with a match', {ids: ['sum-a'], match: 'title'});
  const clear = (name, target) => step(`clear: ${name}`, () => daemon.clearContextAwarenessAndFrames(0, target));
  const footprint = daemon.getContextAwarenessFootprint(0);
  await clear('a domain', {kind: 'domain', domain: 'example.com'});
  await step('the footprint was forgotten', () => daemon.getContextAwarenessFootprint(0) !== footprint);
  rows('after clearing a domain');
  await step('read after clearing', async () => (await contentOf(withBlob)).length);
  await clear('an application', {kind: 'application', bundleId: 'com.example.Other'});
  const session = sql.prepare('select session_id from context_awareness_events where session_id is not null order by rowid limit 1').get().session_id;
  await clear('a session', {kind: 'session', sessionId: session});
  await step('write fence', () => {
    const fence = daemon.createContextAwarenessWriteFence(0), absent = daemon.createContextAwarenessWriteFence(9), before = fence();
    daemon.bumpDeletionEpoch(0);
    return [before, fence(), absent()];
  });
  rows('after clearing an application and a session');
  await clear('a range', {kind: 'timeRange', from: start + 12 * minute, to: start + 13 * minute});
  await clear('today', {kind: 'today'});
  await step('events left', () => sql.prepare('select count(*) as count from context_awareness_events').get());
  const summarized = await record('after clearing', page(next(), outline(12, 'radish'), {target: {targetId: 'tab-10'}}));
  addSummary.run('sum-e', '10min', base + 24e5, base + 30e5, base, base, '[]', JSON.stringify([summarized.eventId]), 'pending');
  await step('retention keeps recent', () => daemon.runContextAwarenessGc(0, 30, at));
  addSummary.run('sum-d', '10min', base + 30e5, base + 36e5, base, base, '[]', '[]', 'failed');
  await step('retention drops old', () => daemon.runContextAwarenessGc(0, 1, at + 3 * 864e5));
  await step('reclaim', () => daemon.reclaimContextAwarenessSpace(0));
  await step('footprint', () => Object.keys(daemon.getContextAwarenessFootprint(0)));
  await record('kept for the comparison', page(next(), outline(12, 'radish'), {target: {targetId: 'tab-11'}}));
  await record('kept, with text', native(next(), 'window.changed', 'A tampered body', {}));
  const wrongHash = sql.prepare(`update context_awareness_blobs set content_hash = 'wrong' where id = (select blob_id from context_awareness_events where window_title = 'Plants' order by rowid desc limit 1)`);
  wrongHash.run();
  await step('verify a wrong hash', () => daemon.verifyContextAwarenessStore(0, {all: true}));
  sql.prepare(`update context_awareness_blobs set content = x'00' where id = (select blob_id from context_awareness_events where app_name = 'Notes' limit 1)`).run();
  await step('verify a tampered blob', () => daemon.verifyContextAwarenessStore(0, {all: true}));
  await step('suppressions at the end', () => daemon.suppressionSummary(0));
  rows('at the end');
  delete performance.now;
  daemon.MemoryManager.flushForAccountIfIndexed = flushForAccountIfIndexed;
  set({enabled: false, pausedUntil: null, rules: []});
  return results;
}

/** A stand-in for AgentSession that the step drives: each run waits for `finish`. */
function standInAgent(session, log, behavior = {}) {
  const listeners = new Set, ownListeners = new Set, queued = new Set, steering = new Set;
  const state = {isStreaming: false, messages: []};
  const emit = event => { for (const listener of [...listeners, ...ownListeners]) listener(event); };
  const logged = (name, value) => async (...args) => {
    log.push([name, ...args.map(arg => arg?.signal ? 'signal' : arg)]);
    return typeof value === 'function' ? value(...args) : value;
  };
  const run = name => async message => {
    log.push([name, message]);
    if (behavior.fail?.(name)) throw behavior.fail(name);
    state.isStreaming = true;
    state.messages.push({role: 'user', content: message});
    session.status = 'running';
    emit({type: 'agent_start'});
    for (const event of behavior.events ?? []) emit(event);
    await behavior.gate?.();
    emit({type: 'message_end', message: {role: 'assistant', content: [{type: 'text', text: `Done: ${name}`}], usage: {input: 1, output: 1, cacheRead: 0, cacheWrite: 0, totalTokens: 2}}});
    state.isStreaming = false;
    session.status = behavior.endStatus ?? 'idle';
    emit({type: 'agent_end', messages: []});
  };
  return {session, agent: {state, subscribe(listener) { ownListeners.add(listener); return () => ownListeners.delete(listener); }, waitForIdle: logged('waitForIdle')}, get acceptsSteering() { return behavior.acceptsSteering ?? true; },
    hooks: {trigger: async (name, input) => { log.push(['hook', name, input.parentSessionId, input.childSession.status, input.textContent]); if (behavior.hookFails) throw Error('hook failed'); }},
    execSessions: {terminateAll() { log.push(['terminateAll']); return 'terminated'; }}, subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
    changeStatus(status) { log.push(['changeStatus', status]); if (behavior.statusFails && behavior.statusFails-- > 0) throw Error('status write failed'); session.status = status; },
    prompt: run('prompt'), continue: run('continue'), steer: logged('steer', () => { if (behavior.steerFails) throw Error('steer failed'); }), followUp: logged('followUp'), resumeAfterCrash: run('resumeAfterCrash'), compact: logged('compact', () => { if (behavior.compactFails) throw Error('compact failed'); }),
    interruptSteer: logged('interruptSteer', () => behavior.interruptResult ?? 'interrupted'), abortForSteering: async () => { log.push(['abortForSteering']); behavior.onAbortForSteering?.(); },
    interrupt: logged('interrupt'), abort: logged('abort'), dispose: logged('dispose', () => { if (behavior.disposeFails) throw Error('dispose failed'); }), refreshMcpTools: logged('refreshMcpTools'), refreshBrowserBinding: logged('refreshBrowserBinding'),
    applyExecutionModel: logged('applyExecutionModel'), getRecentToolCalls: limit => [{limit}], sendSystemMessage: logged('sendSystemMessage'), appendMessage: message => log.push(['appendMessage', message]),
    hasQueuedMessage: message => queued.has(message.id), hasSteeringMessage: message => steering.has(message.id), removeQueuedMessage: logged('removeQueuedMessage', true), updateQueuedMessage: logged('updateQueuedMessage', true), moveQueuedMessage: logged('moveQueuedMessage', true),
    takeQueuedMessagesForSend: async message => behavior.noTransfer ? undefined : {messages: [message], restore() { log.push(['restore']); }}, queued, steering};
}

const socket = (frames, name, options = {}) => ({...options, send(text) {
  if (options.dead) throw Error('closed');
  const frame = JSON.parse(text);
  frames.push([name, frame.op === 'event' ? {...frame, runId: frame.runId} : frame]);
}, close(code, reason) { frames.push([name, 'closed', code, reason]); }});

/** The agent server over stand-in agents and sockets, with real tasks in the store. */
async function runAgentServer(harness) {
  const {daemon} = harness, {SessionStore} = daemon, results = [], step = recorder(results), log = [], frames = [];
  const insert = (title, extra = {}) => SessionStore.insert(0, {title, model: MODEL, ...extra});
  const behaviors = new Map, agents = new Map;
  const createAgentSession = async (accountId, sessionId) => {
    const session = SessionStore.get(accountId, sessionId);
    if (!session) throw Error(`Session not found: ${sessionId}`);
    const behavior = behaviors.get(sessionId) ?? {};
    if (behavior.createFails) throw Error('agent failed to start');
    log.push(['create', session.title]);
    const agent = standInAgent(session, log, behavior);
    agents.set(sessionId, agent);
    return agent;
  };
  const server = new daemon.AgentSessionServer({createAgentSession, idleTtlMs: 1e4, keepAliveMs: 0, replayEventsToNewSubscribers: true, eventBufferLimit: 6});
  const gate = () => {
    const {promise, resolve} = Promise.withResolvers();
    return {promise, open: resolve};
  };
  const tick = () => new Promise(resolve => setTimeout(resolve, 5));
  const idle = async id => {
    while (server.isRunning(0, id)) await tick();
  };
  const flush = name => {
    const sent = frames.splice(0);
    results.push({step: name, frames: sent.filter(([, frame]) => frame.op !== 'ping'), pinged: sent.some(([, frame]) => frame.op === 'ping'), log: log.splice(0)});
  };
  const absent = 'no-such-task';
  await step('nothing loaded', () => [server.getLoadedAgent(0, absent) ?? null, server.hasLiveActivity(0, absent), server.isRunning(0, absent), server.isSteerable(0, absent), server.isLoading(0, absent), server.getRecentToolCalls(0, absent),
    server.getRunningSessionCount(), server.getSemaphoreStats(), server.terminateExecSessions()]);
  await step('load an absent task', () => server.getAgent(0, absent));

  // A prompt through a socket: ready, ack, the run's events, a resent command, a reused id.
  const task = insert('Prompting'), a = socket(frames, 'a');
  await step('connect', () => server.connect(0, task.id, a));
  await step('prompt', () => server.handleCommand(task.id, a, {type: 'prompt', message: 'Hi'}, 'c1', 0));
  await idle(task.id);
  await step('resend', () => server.handleCommand(task.id, a, {type: 'prompt', message: 'Hi'}, 'c1', 0));
  await step('reuse the id', () => server.handleCommand(task.id, a, {type: 'prompt', message: 'Other'}, 'c1', 0));
  flush('a prompt');
  await step('after the run', () => [server.isRunning(0, task.id), server.hasLiveActivity(0, task.id), server.isSteerable(0, task.id), server.getRecentToolCalls(0, task.id), server.getRecentToolCalls(0, task.id, 1), server.getRunningSessionCount()]);

  // A second socket, and a client that reconnects at each kind of cursor.
  const held = gate();
  behaviors.set(task.id, {});
  agents.get(task.id).agent.state.messages.length = 0;
  const replays = socket(frames, 'b');
  await step('replay with no cursor', () => server.connect(0, task.id, replays));
  server.disconnect(0, task.id, replays);
  const lastEvent = () => log.length;
  await step('run for replay', async () => {
    const live = insert('Replaying'), first = socket(frames, 'c');
    behaviors.set(live.id, {gate: () => held.promise});
    await server.connect(0, live.id, first);
    await server.handleCommand(live.id, first, {type: 'prompt', message: 'Long'}, 'c1', 0);
    await tick();
    const late = socket(frames, 'late'), stale = socket(frames, 'stale');
    await server.connect(0, live.id, late);
    const runId = frames.filter(([, frame]) => frame.op === 'event').at(-1)[1].runId;
    await server.connect(0, live.id, stale, {runId, seq: 0});
    await server.connect(0, live.id, socket(frames, 'gone-run'), {runId: 'other', seq: 3});
    const midRun = [server.isRunning(0, live.id), server.hasLiveActivity(0, live.id), server.getRunningSessionCount(), server.isSteerable(0, live.id), server.getSemaphoreStats()];
    held.open();
    await idle(live.id);
    await server.connect(0, live.id, socket(frames, 'after'), {runId, seq: 1});
    await server.connect(0, live.id, socket(frames, 'after-all'), {runId, seq: 99});
    await server.connect(0, live.id, socket(frames, 'old-run'), {runId: 'old', seq: 3});
    return [midRun, lastEvent() > 0];
  });
  flush('replay');

  // A run with more events than the buffer: what fell out is a gap, live or after the run. Then one event over the byte limit.
  await step('gap', async () => {
    const live = insert('Gaps'), first = socket(frames, 'gap'), hold2 = gate(), events = [...Array(9).keys()].map(index => ({type: 'tool_execution_update', index}));
    behaviors.set(live.id, {events, gate: () => hold2.promise});
    await server.connect(0, live.id, first);
    await server.startRun(0, live.id, agentRun => agentRun.prompt('Long'));
    await tick();
    const runId = frames.filter(([, frame]) => frame.op === 'event').at(-1)[1].runId;
    await server.connect(0, live.id, socket(frames, 'gap-live'), {runId, seq: 1});
    await server.connect(0, live.id, socket(frames, 'gap-near'), {runId, seq: 9});
    hold2.open();
    await idle(live.id);
    await server.connect(0, live.id, socket(frames, 'gap-after'), {runId, seq: 1});
  });
  await step('an event over the byte limit', async () => {
    const live = insert('Huge event'), first = socket(frames, 'huge');
    flush('gaps in the replay');
    behaviors.set(live.id, {events: [{type: 'tool_execution_update', text: 'x'.repeat(2_200_000)}, {type: 'tool_execution_update', index: 1}, {type: 'tool_execution_update', text: 'y'.repeat(1_000_000)}, {type: 'tool_execution_update', text: 'z'.repeat(1_100_000)}]});
    await server.connect(0, live.id, first);
    await server.startRun(0, live.id, agentRun => agentRun.prompt('Long'));
    await idle(live.id);
    frames.splice(0);
    const runId = 'unknown', after = socket(frames, 'huge-after');
    await server.connect(0, live.id, after, {runId, seq: 1});
  });
  flush('gaps');

  // Steering and queueing.
  const steering = insert('Steering'), hold = gate(), s = socket(frames, 's');
  behaviors.set(steering.id, {gate: () => hold.promise, interruptResult: 'steered'});
  await server.connect(0, steering.id, s);
  await step('start', () => server.handleCommand(steering.id, s, {type: 'prompt', message: 'Go'}, 'c1', 0));
  await tick();
  const agent = agents.get(steering.id);
  await step('steer', () => server.handleCommand(steering.id, s, {type: 'steer', message: 'Also'}, 'c2', 0));
  await step('steer and interrupt', () => server.steer(0, steering.id, 'x'));
  await step('queue', () => server.queue(0, steering.id, 'y'));
  await step('interrupting steer', () => server.handleCommand(steering.id, s, {type: 'steer', message: {role: 'assistant'}, interrupt: true, steeringMessage: 'z'}, 'c3', 0));
  await step('interrupting steer that stops the run', async () => {
    const hold2 = gate(), live = insert('Interrupted'), held2 = socket(frames, 'i');
    behaviors.set(live.id, {gate: () => hold2.promise, onAbortForSteering: hold2.open});
    await server.connect(0, live.id, held2);
    await server.handleCommand(live.id, held2, {type: 'prompt', message: 'Go'}, 'c1', 0);
    await tick();
    agents.get(live.id).steering.add('s1');
    await server.handleCommand(live.id, held2, {type: 'steer', message: {role: 'user', id: 's1'}, interrupt: true}, 'c2', 0);
    await idle(live.id);
    const second = gate();
    behaviors.get(live.id).gate = () => second.promise;
    behaviors.get(live.id).onAbortForSteering = second.open;
    await server.handleCommand(live.id, held2, {type: 'prompt', message: 'Again'}, 'c3', 0);
    await tick();
    await server.handleCommand(live.id, held2, {type: 'steer', message: 'Stop', interrupt: true}, 'c4', 0);
    await idle(live.id);
  });
  flush('steering');
  await step('a stale turn', () => server.handleCommand(steering.id, s, {type: 'steer', message: 'Late', expectedTurnId: 'old'}, 'c4', 0));
  agent.queued.add('q1');
  agent.steering.add('q2');
  const queued = {role: 'user', id: 'q1'};
  await step('steer a queued message', () => server.steer(0, steering.id, queued));
  await step('steer with an array', () => server.steer(0, steering.id, [queued]));
  flush('steering, queued');
  hold.open();
  await idle(steering.id);
  await step('steer when idle runs', () => server.steer(0, steering.id, 'Again'));
  await idle(steering.id);
  await step('queue when idle runs', () => server.queue(0, steering.id, 'Again'));
  await idle(steering.id);
  await step('steer a queued message when idle', () => server.steer(0, steering.id, queued));
  await idle(steering.id);
  await step('a queued steer that fails goes back in the queue', async () => {
    const live = insert('Queued steer'), hold2 = gate();
    behaviors.set(live.id, {steerFails: true, gate: () => hold2.promise});
    await server.prewarm(0, live.id);
    agents.get(live.id).queued.add('q1');
    const idleOutcome = await server.steer(0, live.id, queued).catch(error => error.message);
    await idle(live.id);
    await server.startRun(0, live.id, agentRun => agentRun.prompt('Go'));
    await tick();
    const liveOutcome = await server.steer(0, live.id, queued).catch(error => error.message);
    hold2.open();
    await idle(live.id);
    behaviors.get(live.id).noTransfer = true;
    return [idleOutcome, liveOutcome, await server.steer(0, live.id, queued).catch(error => error.message)];
  });
  await step('continue', () => server.handleCommand(steering.id, s, {type: 'continue'}, 'c5', 0));
  await idle(steering.id);
  await step('an unknown command', () => server.handleCommand(steering.id, s, {type: 'dance'}, 'c6', 0));
  await idle(steering.id);
  await step('interrupt command', () => server.handleCommand(steering.id, s, {type: 'interrupt'}, 'c7', 0));
  flush('commands');

  // Failed runs, a failed status write, and a run of a worker that reports to its parent.
  const failing = insert('Failing');
  behaviors.set(failing.id, {fail: () => Error('the model failed')});
  const f = socket(frames, 'f');
  await server.connect(0, failing.id, f);
  await step('a run that fails before starting', () => server.handleCommand(failing.id, f, {type: 'prompt', message: 'Hi'}, 'c1', 0));
  await idle(failing.id);
  await step('status after', () => SessionStore.get(0, failing.id).status);
  await step('reconnect to an errored task', () => server.connect(0, failing.id, socket(frames, 'f2')));
  flush('failing');
  const worker = insert('Worker'), parent = insert('Parent');
  SessionStore.update(0, worker.id, {status: 'running', parentId: parent.id, trigger: {type: 'subagent', parentSessionId: parent.id}});
  behaviors.set(worker.id, {fail: () => 'not an error', statusFails: 1});
  await step('a worker failing', () => server.startRun(0, worker.id, agentRun => agentRun.prompt('Work'), {trigger: 'user', routineTrigger: 'schedule'}));
  await idle(worker.id);
  flush('worker');
  const pausedWorker = insert('Paused worker');
  SessionStore.update(0, pausedWorker.id, {parentId: parent.id, trigger: {type: 'subagent', parentSessionId: parent.id}});
  behaviors.set(pausedWorker.id, {endStatus: 'suspended'});
  await step('a worker that stops to ask', () => server.startRun(0, pausedWorker.id, agentRun => agentRun.prompt('Work')));
  await idle(pausedWorker.id);
  flush('worker paused');
  const routine = insert('Routine run');
  await step('a routine run', () => server.startRun(0, routine.id, agentRun => agentRun.prompt('Tick'), {routineTrigger: 'manual'}));
  await idle(routine.id);
  await step('already running', async () => {
    const hold2 = gate(), busy = insert('Busy');
    behaviors.set(busy.id, {gate: () => hold2.promise});
    await server.startRun(0, busy.id, agentRun => agentRun.prompt('One'));
    await tick();
    const outcome = await server.startRun(0, busy.id, agentRun => agentRun.prompt('Two')).catch(error => error.message);
    hold2.open();
    await idle(busy.id);
    return outcome;
  });
  await step('a task that cannot start', async () => {
    const broken = insert('Broken');
    behaviors.set(broken.id, {createFails: true});
    const outcome = await server.startRun(0, broken.id, () => {}).catch(error => [error.code, error.message]);
    return [outcome, SessionStore.get(0, broken.id).status];
  });
  await step('a run in an archived project', async () => {
    const project = daemon.ProjectStore.create(0, {id: 'gone', name: 'Gone', workspacePath: path.join(harness.home, 'gone')}), inProject = insert('In project', {projectId: project.id});
    await server.getAgent(0, inProject.id);
    daemon.ProjectStore.archive(0, project.id);
    return server.startRun(0, inProject.id, () => {}).catch(error => error.message);
  });
  flush('run failures');

  // Resuming runs left by a previous process.
  const resuming = insert('Resuming');
  SessionStore.update(0, resuming.id, {status: 'running'});
  await step('no open run', () => server.resumeRun(0, resuming.id));
  await step('status', () => SessionStore.get(0, resuming.id).status);
  await step('resume an idle task', () => server.resumeRun(0, task.id));
  const openTurn = (session, attempts = 0) => {
    SessionStore.update(0, session.id, {status: 'running'});
    SessionStore.appendMessage(0, session.id, {role: 'turn-lifecycle', event: 'started', turnId: 'turn-1', timestamp: 1});
    for (let attempt = 0; attempt < attempts; attempt += 1) SessionStore.recordTurnResumeAttempt(0, session.id);
  };
  const exhausted = insert('Out of attempts');
  openTurn(exhausted, 3);
  await step('out of attempts', async () => [await server.resumeRun(0, exhausted.id), SessionStore.getLatestTurn(0, exhausted.id)?.resumeAttempts, SessionStore.get(0, exhausted.id).status]);
  const lastAttempt = insert('Last attempt');
  openTurn(lastAttempt, 2);
  await step('the last attempt', async () => [await server.resumeRun(0, lastAttempt.id), SessionStore.getLatestTurn(0, lastAttempt.id)?.resumeAttempts]);
  await idle(lastAttempt.id);
  const unstartable = insert('Cannot resume');
  openTurn(unstartable);
  behaviors.set(unstartable.id, {createFails: true});
  await step('a resume that cannot start', async () => [await server.resumeRun(0, unstartable.id), SessionStore.get(0, unstartable.id).status]);
  const open = insert('Open run'), child = insert('Open child');
  openTurn(open);
  openTurn(child);
  SessionStore.update(0, child.id, {parentId: open.id, trigger: {type: 'subagent', parentSessionId: open.id}});
  await step('recover', async () => {
    const outcomes = await server.recoverInterruptedRuns(0);
    return Object.fromEntries(Object.entries(outcomes).map(([outcome, ids]) => [outcome, ids.length]));
  });
  await step('when recovered', () => server.whenRecovered(0));
  await idle(open.id);
  await idle(child.id);
  flush('resuming');

  // Calls beside a run.
  const calls = insert('Calls');
  await step('compact', () => server.compact(0, calls.id, {instructions: 'short'}));
  await idle(calls.id);
  const compacting = insert('Compacting');
  behaviors.set(compacting.id, {compactFails: true});
  await step('compact fails', () => server.compact(0, compacting.id));
  await step('system message, wakeup', () => server.sendSystemMessage(0, calls.id, 'Wake', {kind: 'k', mode: 'wakeup'}));
  await idle(calls.id);
  await step('system message, queue', () => server.sendSystemMessage(0, calls.id, 'Later', {kind: 'k', mode: 'queue', metadata: {a: 1}}));
  await idle(calls.id);
  await step('system message, steer', () => server.sendSystemMessage(0, calls.id, 'Steer', {kind: 'k', mode: 'steer'}));
  SessionStore.update(0, calls.id, {status: 'suspended'});
  await step('system message to a suspended task', () => server.sendSystemMessage(0, calls.id, 'Held', {kind: 'k', mode: 'queue'}));
  SessionStore.update(0, calls.id, {status: 'idle'});
  await step('system message while running', async () => {
    const hold2 = gate(), busy = insert('Messaged');
    behaviors.set(busy.id, {gate: () => hold2.promise});
    await server.startRun(0, busy.id, agentRun => agentRun.prompt('One'));
    await tick();
    await server.sendSystemMessage(0, busy.id, 'Now', {kind: 'k', mode: 'wakeup'});
    await server.sendSystemMessage(0, busy.id, 'Soon', {kind: 'k', mode: 'queue'});
    const waited = server.waitForIdle(0, busy.id), controller = new AbortController, aborted = server.waitForIdle(0, busy.id, controller.signal);
    controller.abort();
    const reason = await aborted.catch(error => error.message);
    hold2.open();
    await waited;
    await server.waitForIdle(0, busy.id, new AbortController().signal);
    return [reason, await server.waitForIdle(0, busy.id, AbortSignal.abort()).catch(error => error.message)];
  });
  await step('queued messages', async () => [await server.removeQueuedMessage(0, calls.id, 'm'), await server.updateQueuedMessage(0, calls.id, 'm', {text: 't'}), await server.moveQueuedMessage(0, calls.id, 'm', 2)]);
  await step('append while loaded', () => server.appendMessage(0, calls.id, {role: 'user', content: 'Note'}));
  const unloaded = insert('Unloaded');
  await step('append while not loaded', async () => {
    await server.appendMessage(0, unloaded.id, {role: 'user', content: [{type: 'text', text: 'Stored'}], timestamp: 1});
    return SessionStore.listAllMessages(0, unloaded.id);
  });
  await step('refresh', async () => {
    server.refreshLoadedSessionBrowserBinding(0, calls.id, {profileId: 'Default'});
    server.refreshLoadedSessionBrowserBinding(0, absent, {});
    await server.refreshLoadedSessionModel(0, calls.id, MODEL);
    await server.refreshLoadedSessionModel(0, absent, MODEL);
    const {session} = agents.get(calls.id);
    server.refreshLoadedSessionPolicy(0, calls.id, {permissionMode: session.permissionMode, permission: session.permission, runtimeConfig: {a: 1}});
    server.refreshLoadedSessionPolicy(0, calls.id, {permissionMode: 'read-only', permission: session.permission, runtimeConfig: {a: 2}});
    server.refreshLoadedSessionPolicy(0, absent, {});
    return [session.permissionMode, session.runtimeConfig];
  });
  await step('prewarm', () => server.prewarm(0, unloaded.id));
  await step('reload', async () => {
    await server.reloadLoadedAgentSession(0, calls.id);
    await server.reloadLoadedAgentSession(0, absent);
    return server.getLoadedAgent(0, calls.id) === agents.get(calls.id);
  });
  await step('reload while running', async () => {
    const hold2 = gate(), busy = insert('Reloaded');
    behaviors.set(busy.id, {gate: () => hold2.promise});
    await server.startRun(0, busy.id, agentRun => agentRun.prompt('One'));
    await tick();
    const outcome = await server.reloadLoadedAgentSession(0, busy.id).catch(error => error.message);
    hold2.open();
    await idle(busy.id);
    return outcome;
  });
  flush('calls');

  // Stopping: stored tasks, loaded ones and their workers.
  const stored = insert('Stored');
  SessionStore.update(0, stored.id, {status: 'suspended', suspension: {kind: 'ask-user-question', id: 'x', request: {}}});
  await step('interrupt a stored task', async () => [await server.interrupt(0, stored.id), SessionStore.get(0, stored.id).status, SessionStore.get(0, stored.id).suspension?.error]);
  const storedRunning = insert('Stored running');
  SessionStore.update(0, storedRunning.id, {status: 'running'});
  await step('abort a stored task', async () => [await server.abort(0, storedRunning.id), SessionStore.get(0, storedRunning.id).status, await server.abort(0, storedRunning.id), await server.interrupt(0, absent)]);
  await step('stop a tree', async () => {
    const top = insert('Top'), under = insert('Under'), hold2 = gate(), hold3 = gate();
    SessionStore.update(0, under.id, {parentId: top.id});
    behaviors.set(top.id, {gate: () => hold2.promise});
    behaviors.set(under.id, {gate: () => hold3.promise});
    await server.startRun(0, top.id, agentRun => agentRun.prompt('One'));
    await server.startRun(0, under.id, agentRun => agentRun.prompt('Two'));
    await tick();
    const interrupted = await server.interrupt(0, top.id);
    hold2.open();
    hold3.open();
    const aborted = await server.abort(0, top.id);
    await idle(top.id);
    return [interrupted, aborted];
  });
  flush('stopping');

  // Sockets that die, and tasks that may not start.
  await step('dead sockets', async () => {
    const hold2 = gate(), live = insert('Dead sockets');
    behaviors.set(live.id, {gate: () => hold2.promise});
    const dies = socket(frames, 'dies'), silent = socket(frames, 'silent', {dead: true}), stays = socket(frames, 'stays');
    await server.connect(0, live.id, silent);
    await server.connect(0, live.id, dies);
    await server.connect(0, live.id, stays);
    await server.handleCommand(live.id, dies, {type: 'prompt', message: 'Hi'}, 'c1', 0);
    await tick();
    dies.send = () => { throw Error('closed'); };
    hold2.open();
    await idle(live.id);
    await server.handleCommand(live.id, silent, {type: 'queue', message: 'x'}, 'c2', 0);
    server.disconnect(0, live.id, stays);
    server.disconnect(0, absent, stays);
  });
  await step('a command through a socket that closed', async () => {
    const live = insert('Closing');
    await server.handleCommand(live.id, socket(frames, 'never', {dead: true}), {type: 'prompt', message: 'Hi'}, 'c1', 0);
    return server.isRunning(0, live.id);
  });
  await step('an ephemeral task pending purge', async () => {
    const ephemeral = insert('Ephemeral', {ephemeral: true});
    const live = socket(frames, 'e');
    await server.connect(0, ephemeral.id, live);
    server.disconnect(0, ephemeral.id, live);
    SessionStore.update(0, ephemeral.id, {archivedAt: new Date()});
    const connected = await server.connect(0, ephemeral.id, live).catch(error => error.message.replace(ephemeral.id, '<task>'));
    const prompted = await server.startRun(0, ephemeral.id, () => {}).catch(error => error.message.replace(ephemeral.id, '<task>'));
    return [connected, prompted];
  });
  flush('sockets');

  // Disposal, on request and after the idle time.
  const disposed = insert('Disposed');
  const d = socket(frames, 'd');
  await server.connect(0, disposed.id, d);
  await step('dispose', () => server.disposeSession(0, disposed.id));
  await step('dispose again', () => server.disposeSession(0, disposed.id));
  await step('dispose a running task', async () => {
    const hold2 = gate(), busy = insert('Disposed while running');
    behaviors.set(busy.id, {gate: () => hold2.promise});
    await server.startRun(0, busy.id, agentRun => agentRun.prompt('One'));
    await tick();
    const disposal = server.disposeSession(0, busy.id, {closeOwnedTabs: true}), same = server.disposeSession(0, busy.id) === disposal;
    await tick();
    hold2.open();
    return [same, await disposal];
  });
  const quick = new daemon.AgentSessionServer({createAgentSession, idleTtlMs: 1, keepAliveMs: 1});
  const ending = insert('Idles away');
  await step('idle time', async () => {
    const live = socket(frames, 'quick');
    await quick.connect(0, ending.id, live);
    await new Promise(resolve => setTimeout(resolve, 15));
    const stayed = !!quick.getLoadedAgent(0, ending.id);
    quick.disconnect(0, ending.id, live);
    await new Promise(resolve => setTimeout(resolve, 15));
    return [stayed, !!quick.getLoadedAgent(0, ending.id)];
  });
  const instant = new daemon.AgentSessionServer({createAgentSession, idleTtlMs: 0, keepAliveMs: 0});
  await step('no idle time', async () => {
    const gone = insert('Goes at once');
    await instant.prewarm(0, gone.id);
    await tick();
    await instant.prewarm(0, gone.id);
    await tick();
    return !!instant.getLoadedAgent(0, gone.id);
  });
  await step('CLI task left suspended', async () => {
    const cli = new daemon.AgentSessionServer({createAgentSession, idleTtlMs: 1e4, keepAliveMs: 0});
    const live = insert('CLI', {trigger: {type: 'user', source: 'cli'}}), s2 = socket(frames, 'cli');
    await cli.connect(0, live.id, s2);
    SessionStore.update(0, live.id, {status: 'suspended'});
    agents.get(live.id).session.status = 'suspended';
    cli.disconnect(0, live.id, s2);
    await new Promise(resolve => setTimeout(resolve, 2100));
    const status = SessionStore.get(0, live.id).status;
    await cli.disposeAll();
    return status;
  });
  await step('disposal failure at load', async () => {
    const closing = new daemon.AgentSessionServer({createAgentSession: async (accountId, sessionId) => {
      const stand = await createAgentSession(accountId, sessionId);
      closing.auxCloseAdmissionAndDrain();
      return stand;
    }});
    return closing.getAgent(0, insert('Closes while loading').id).catch(error => error.message);
  });
  flush('disposal');

  // Shutdown: nothing new is admitted and everything settles.
  const live = insert('Shutting down');
  behaviors.set(live.id, {disposeFails: true});
  await server.connect(0, live.id, socket(frames, 'z'));
  await step('drain', () => server.auxCloseAdmissionAndDrain());
  await step('drain again', () => server.auxCloseAdmissionAndDrain());
  await step('terminate', () => server.terminateExecSessions());
  await step('after draining', async () => [await server.getAgent(0, live.id).catch(error => error.message), await server.resumeRun(0, live.id).catch(error => error.message), await server.startRun(0, live.id, () => {}).catch(error => error.message),
    (() => { try { return server.recoverInterruptedRuns(0); } catch (error) { return error.message; } })()]);
  await quick.disposeAll();
  await instant.disposeAll();
  flush('shutdown');
  await step('the daemon\'s own server', () => [daemon.GlobalAgentSessionServer.getSemaphoreStats(), daemon.GlobalAgentSessionServer.getRunningSessionCount()]);
  return results;
}

/** The model registry's catalog methods, with models.json and settings holding test data. */
async function runModelCatalog(harness) {
  const {daemon} = harness, results = [], step = recorder(results), models = daemon.models(0), {modelsJson} = models;
  const list = (name, run) => step(name, async () => {
    const value = await run();
    return {count: value.length, digest: digest(value), first: value.slice(0, 2)};
  });
  const provider = {baseUrl: 'https://models.example/v1', api: 'openai-completions', models: [{id: 'own-1', name: 'Own one'}, {id: 'gpt-4o', name: 'Renamed'}]};
  await list('built-in models', () => models.listStaticBuiltInModels());
  await list('supported', () => models.listSupported());
  await step('by provider', () => Object.fromEntries(['aux', 'anthropic', 'openai', 'openai-codex', 'claude-code', 'github-copilot', 'openrouter', 'google', 'absent', 'vercel-ai-gateway', 'xai-grok-oauth'].map(id => {
    const value = models.getBuiltInModels(id);
    return [id, {count: value.length, digest: digest(value)}];
  })));
  modelsJson.setProviderConfig('custom-provider', provider);
  modelsJson.setProviderConfig('openai', {models: [{id: 'gpt-4o', name: 'Renamed'}, {id: 'own-openai', name: 'Own'}]});
  await list('with models.json', () => models.listSupported());
  await list('custom providers', () => models.listModelsJsonProviderModels());
  await list('merged', () => models.mergeModelsJsonProviderModels('custom-provider', [{id: 'own-1', extra: true}, {id: 'listed'}]));
  await step('merged with nothing of its own', () => models.mergeModelsJsonProviderModels('nothing', [{id: 'listed'}]));
  await step('one model', () => [models.getModelsJsonProviderModel('custom-provider', 'own-1')?.id, models.getModelsJsonProviderModel('custom-provider', 'absent') ?? null, models.isDisconnectedProvider('custom-provider')]);
  await step('finding', () => [models.findSupportedModel(' own-1 ')?.provider, models.findSupportedModel('own-1', ' custom-provider ')?.id, models.findSupportedModel('own-1', 'other') ?? null, models.hasSupportedModel('own-1'), models.hasSupportedModel('absent')]);
  await step('custom models', () => {
    const custom = {id: 'mine', provider: 'custom-provider', name: 'Mine', baseUrl: 'https://models.example/v1', api: 'openai-completions', reasoning: false, contextWindow: 1000, maxTokens: 100, input: ['text'],
      cost: {input: 0, output: 0, cacheRead: 0, cacheWrite: 0}};
    models.addCustomModel(custom);
    models.addCustomModel({...custom, name: 'Mine again'});
    const added = models.listSupported().filter(model => model.id === 'mine');
    models.removeCustomModel('mine');
    return [added, models.findSupportedModel('mine') ?? null];
  });
  await list('recent', () => models.listRecentStaticBuiltInModels(new Map));
  await step('visible ids', () => [models.listVisibleModelIdsByProvider([]), Object.keys(models.listVisibleModelIdsByProvider([{providerId: 'anthropic'}, {providerId: 'openai-codex'}, {providerId: 'xai-grok-oauth'}]))]);
  await step('with a plan', () => {
    const catalog = models.openAICodexModelCatalog, {getCachedModelIds} = catalog, planIds = new Set(['gpt-5', 'gpt-4o']);
    catalog.getCachedModelIds = () => planIds;
    models.remoteCatalog.getVisibleModelIds = (providerId, options) => providerId === 'xai-grok-oauth' ? ['grok-4'] : providerId === 'openai' ? ['gpt-4o', 'gpt-5'] : providerId === 'openai-codex' ? ['gpt-5'] : options ? [] : undefined;
    const result = [models.hasOpenAICodexPlanAccess('gpt-5'), models.hasOpenAICodexModelAccess('gpt-5', 'x'), models.hasOpenAICodexPlanAccess('absent'), models.getBuiltInModels('openai-codex').map(model => model.id),
      models.listVisibleModelIdsByProvider([{providerId: 'openai-codex'}, {providerId: 'xai-grok-oauth'}, {providerId: 'anthropic'}])];
    catalog.getCachedModelIds = getCachedModelIds;
    delete models.remoteCatalog.getVisibleModelIds;
    return result;
  });
  await step('openrouter', async () => {
    const custom = {id: 'mine/one', name: 'One'};
    modelsJson.setProviderConfig('openrouter', {models: [custom]});
    const before = [models.listOpenRouterModelIds(), models.getOpenRouterCustomModels().map(model => model.id), models.getOpenRouterCustomModels(new Set(['mine/one'])).map(model => model.id)];
    await models.writeOpenRouterModelIds(['mine/one', ' mine/one ', '']);
    const after = models.listOpenRouterModelIds();
    const missing = await models.writeOpenRouterModelIds(['nobody/absent']).catch(error => error.message);
    await models.writeOpenRouterModelIds([]);
    return [before, after, missing, models.listOpenRouterModelIds(), models.filterOpenRouterModels([{provider: 'openrouter', id: 'a'}, {provider: 'other', id: 'b'}])];
  });
  await step('gateways', () => [models.listAiGatewayModelIds('vercel-ai-gateway'), models.filterAiGatewayModels([{provider: 'vercel-ai-gateway', id: 'a'}, {provider: 'other', id: 'b'}])]);
  modelsJson.removeProviderConfig('custom-provider');
  modelsJson.removeProviderConfig('openai');
  modelsJson.removeProviderConfig('openrouter');
  return results;
}

export const SERVICE_STEPS = {ledger: runLedger, agentServer: runAgentServer, modelCatalog: runModelCatalog};
