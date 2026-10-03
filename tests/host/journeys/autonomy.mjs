import { captureHomeJourneyState } from '../lib/home-capture.mjs';
import { revealSettingsControl } from '../lib/settings-control.mjs';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';

const shell = (name, role = 'AXButton', index = 0) => ({ name, role, match: 'exact', scope: 'shell', index });
const page = (name, role = 'AXTextField', index = 0) => ({ name, role, match: 'exact', scope: 'page', index });
async function replace(t, name, value, index = 0, role = 'AXTextField') {
  const target = shell(name, role, index);
  await t.ax.focus(target); await t.ax.key('command+a', 'hid'); await t.ax.type(String(value));
}
async function choose(t, name, text, index = 0) {
  const target = shell(name, 'AXPopUpButton', index);
  await t.ax.press(target); await t.ax.type(text); await t.ax.key('return', 'hid');
}
async function command(t, text) {
  await t.ax.key('command+k', 'hid'); await t.ax.type(text); await t.ax.key('return', 'hid');
}
async function startRecording(t) {
  const reveal = shell('Show sidebar');
  if ((await t.ax.query(reveal)).length) await t.ax.press(reveal);
  await t.ax.waitFor(shell('Record a demonstration'));
  await t.ax.press(shell('Record a demonstration'));
  await t.ax.waitFor(shell('Demonstration recording', 'AXGroup'));
  await t.ax.waitFor(shell('Stop'));
}
async function exportRecording(t, name) {
  const path = join(t.app.userDataDir, `${name}.json`);
  await t.ax.press(shell('Export demonstration'));
  await t.ax.savePanel(path);
  await t.until('human demonstration export exists', async () => existsSync(path));
  const raw = readFileSync(path, 'utf8');
  t.assert.ok(Buffer.byteLength(raw) <= 256_000, 'Synthetic demonstration export must be bounded');
  return { recording: JSON.parse(raw), raw };
}
function fixtureRoutes(t) {
  const posted = [];
  let drift = false;
  const html = (title, body) => `<!doctype html><meta charset="utf-8"><title>${title}</title><style>body{font:18px system-ui;padding:30px}input,button{font:inherit;margin:12px}</style>${body}`;
  t.fixture.route('/demo-secret', html('Aux synthetic secure controls', '<label>Fixture password<input id="fixture-password" type="password" autocomplete="current-password"></label><label>Fixture OTP<input id="fixture-otp" autocomplete="one-time-code"></label><label>Fixture card<input id="fixture-card" autocomplete="section-billing cc-number"></label><button>Ambiguous</button><button>Ambiguous</button>'));
  t.fixture.route('/demo-form', () => html('Aux company form', `<form action="/demo-review" method="get"><label>Company<input id="company" name="company"></label><button id="${drift ? 'continue-new' : 'continue'}" type="submit">Continue</button></form>`));
  t.fixture.route('/demo-review', (_request, _response, url) => {
    const company = url.searchParams.get('company') ?? '';
    t.assert.match(company, /^[A-Za-z0-9 -]{0,100}$/);
    return html('Aux company review', `<h1>Review ${company}</h1><form method="post" action="/demo-submit"><input type="hidden" name="company" value="${company}"><button id="send" type="submit">Send company</button></form>`);
  });
  t.fixture.route('/demo-submit', async (request, response) => {
    let body = ''; for await (const chunk of request) { body += chunk; t.assert.ok(body.length <= 1000); }
    const company = new URLSearchParams(body).get('company');
    t.assert.match(company, /^[A-Za-z0-9 -]{1,100}$/); posted.push(company);
    response.writeHead(303, { location: `/demo-done?company=${encodeURIComponent(company)}` }); response.end();
  }, { method: 'POST' });
  t.fixture.route('/demo-done', (_request, _response, url) => html('Aux company done', `<h1 id="done">Done: ${url.searchParams.get('company')}</h1>`));
  return { posted, drift: value => { drift = value; } };
}
async function settleReplay(t, runId) {
  await t.until('governed replay settles', async () => {
    const { run } = await t.rpc('runs.get', { runId });
    if (run.status === 'needs_input' && (await t.ax.query(shell('Allow'))).length) await t.ax.press(shell('Allow'));
    return ['completed', 'failed', 'cancelled'].includes(run.status);
  });
  return (await t.rpc('runs.get', { runId })).run;
}
async function openSkills(t) {
  await command(t, 'Tasks');
  await t.ax.waitFor(shell('Search Skills', 'AXTextField'));
}
async function recordAndReview(t, workspaceId, fixture, title = 'Aux company Skill') {
  const opened = await t.rpc('pages.open', { url: `${t.fixture.url}/demo-form`, activate: true });
  await t.ax.waitFor(page('Company'));
  const task = await t.rpc('tasks.create', { workspaceId, title: 'Company submission fixture', objective: 'Submit the independently reviewed company variable',
    criteria: [{ criterionId: 'done', description: 'Company appears in Done', verification: 'manual' }],
    resources: [{ resourceId: 'company-tab', kind: 'page', locator: opened.pageId, label: 'Company form', access: 'read' }] });
  await startRecording(t);
  await t.ax.click(page('Company'));
  await t.ax.type('Acme');
  await t.ax.click(page('Continue', 'AXButton'));
  await t.ax.waitFor(page('Send company', 'AXButton'));
  await t.ax.click(page('Send company', 'AXButton'));
  await t.until('actual human Acme POST', async () => fixture.posted.includes('Acme'));
  await t.ax.press(shell('Pause')); await t.ax.press(shell('Resume')); await t.ax.press(shell('Stop'));
  await t.ax.waitFor(shell('Skill name', 'AXTextField'));
  const { recording, raw } = await exportRecording(t, 'aux-clean-capture');
  await replace(t, 'Skill name', title);
  await choose(t, 'Saved task', task.title);
  let targetIndex = 0, inputIndex = 0, urlIndex = 0, plainReview = 0, inputReview = 0;
  for (const step of recording.steps) {
    if (step.kind === 'navigate') {
      await replace(t, 'Reviewed URL template', step.url.replaceAll('Acme', '{{company}}'), urlIndex++); continue;
    }
    const unique = step.target.candidates.find(candidate => candidate.matches === 1 && candidate.selector.startsWith('css:'));
    t.assert.ok(unique, 'Synthetic controls must have a genuinely unique observed CSS target');
    await choose(t, 'Target', unique.selector, targetIndex++);
    if (step.kind === 'input') {
      await replace(t, 'Variable name', 'company', inputIndex++);
      await t.ax.press(shell('I reviewed this target and variable', 'AXCheckBox', inputReview++));
    } else await t.ax.press(shell('I reviewed this target', 'AXCheckBox', plainReview++));
  }
  await replace(t, 'Final success element', '#done');
  await t.ax.press(shell('Save as Skill'));
  await t.until('reviewed paused Skill saved', async () => (await t.rpc('routines.list', { workspaceId })).some(routine => routine.title === title && routine.replay?.sourceRecordingId === recording.id));
  const routine = (await t.rpc('routines.list', { workspaceId })).find(routine => routine.title === title);
  t.assert.equal(routine.paused, true); t.assert.equal(routine.replay.format, 2); t.assert.equal(routine.replay.state, 'untested');
  t.assert.ok(!JSON.stringify(routine.replay.steps).includes('Acme'));
  await t.ax.key('escape', 'hid');
  await openSkills(t);
  return { routine, task, pageId: opened.pageId, recording, raw };
}
async function testAndActivate(t, routineId, workspaceId, value) {
  await replace(t, 'Test value for company', value);
  await t.ax.press(shell('Run replay test'));
  let routine;
  await t.until('separate replay test identity persisted', async () => {
    routine = (await t.rpc('routines.get', { routineId })).routine;
    return routine.replay?.state === 'testing' && !!routine.replay.testRunId;
  });
  const run = await settleReplay(t, routine.replay.testRunId);
  t.assert.equal(run.status, 'completed', run.error);
  await t.ax.press(shell('Check test result'));
  await t.until('exact replay test marked passed', async () => (await t.rpc('routines.get', { routineId })).routine.replay.state === 'tested');
  await t.ax.press(shell('Review activation'));
  await t.ax.waitFor(shell('Activate reviewed Skill'));
  await t.ax.press(shell('Activate reviewed Skill'));
  await t.until('person activates tested current revision', async () => !(await t.rpc('routines.get', { routineId })).routine.paused);
  return { run, routine: (await t.rpc('routines.get', { routineId })).routine, workspaceId };
}
async function demonstration(t) {
  const fixture = fixtureRoutes(t);
  const workspace = (await t.rpc('workspaces.list'))[0] ?? await t.rpc('workspaces.create', { name: 'Aux demonstration fixture' });
  t.assert.ok(workspace);
  await t.step('trusted isolated recording filters synthetic secrets and exposes ambiguity without taking browser control', { kind: 'ui', features: ['demonstrationSkills'] }, async () => {
    const opened = await t.rpc('pages.open', { url: `${t.fixture.url}/demo-secret`, activate: true });
    await t.ax.waitFor({ ...page('Fixture password'), subrole: 'AXSecureTextField' });
    const before = (await t.rpc('pages.list')).find(item => item.pageId === opened.pageId);
    await startRecording(t);
    for (const [name, role, text] of [['Fixture password', 'AXTextField', 'synthetic-password-931'], ['Fixture OTP', 'AXTextField', 'synthetic-otp-822'], ['Fixture card', 'AXTextField', 'synthetic-card-744']]) {
      // A physical click also transfers native first-responder ownership from
      // the shell recording button to the actual page surface.
      await t.ax.click({ ...page(name, role), ...(name === 'Fixture password' ? { subrole: 'AXSecureTextField' } : {}) });
      await t.ax.type(text);
    }
    await t.ax.click(page('Ambiguous', 'AXButton'));
    await t.ax.press(shell('Stop'));
    const exported = await exportRecording(t, 'aux-secret-filter');
    for (const secret of ['synthetic-password-931', 'synthetic-otp-822', 'synthetic-card-744']) t.assert.ok(!exported.raw.includes(secret));
    t.assert.deepEqual(new Set(exported.recording.steps.filter(step => step.kind === 'credentialFill').map(step => step.secretType)), new Set(['password', 'otp', 'payment']), `Recorded kinds: ${JSON.stringify(exported.recording.steps.map(step => ({ kind: step.kind, ...(step.kind === 'credentialFill' ? { secretType: step.secretType } : {}) })))}`);
    t.assert.ok(exported.recording.steps.some(step => step.kind === 'click' && step.target.candidates.every(candidate => candidate.matches > 1)));
    const after = (await t.rpc('pages.list')).find(item => item.pageId === opened.pageId);
    t.assert.equal(after.controller, before.controller); t.assert.equal(after.controllerEpoch, before.controllerEpoch);
    await t.assert.rejects(t.rpc('recorder.get', { recordingId: exported.recording.id }), /permission_denied/);
    await captureHomeJourneyState(t, 'demonstration-secret-absence-ambiguity', 'demonstration-filtered-secret-ambiguity-review');
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.ax.press(shell('Discard'));
    return { ax, rpc: { before, after, filteredKinds: exported.recording.steps.map(step => step.kind) } };
  });
  let reviewed;
  await t.step('record multi-page Acme form and save reviewed variables with a separate final oracle', { kind: 'ui', features: ['demonstrationSkills'] }, async () => {
    reviewed = await recordAndReview(t, workspace.workspaceId, fixture);
    await captureHomeJourneyState(t, 'demonstration-reviewed-paused-skill', 'demonstration-reviewed-paused-skill');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { routine: reviewed.routine, actualPosts: [...fixture.posted] } };
  });
  await t.step('test Globex through governed approvals and observe exactly one real POST before activating', { kind: 'ui', features: ['demonstrationSkills', 'automations'] }, async () => {
    const result = await testAndActivate(t, reviewed.routine.routineId, workspace.workspaceId, 'Globex');
    t.assert.deepEqual(fixture.posted, ['Acme', 'Globex']);
    await captureHomeJourneyState(t, 'demonstration-globex-done-tested', 'demonstration-governed-test-completed');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { ...result, actualPosts: [...fixture.posted] } };
  });
  await t.step('selector drift parks the actual Skill, proposes no work, and requires person diff approval and a fresh test', { kind: 'ui', features: ['demonstrationSkills', 'automations'] }, async () => {
    fixture.drift(true);
    await replace(t, 'company', 'Drifted'); await t.ax.press(shell('Run now'));
    let occurrence;
    await t.until('drifted replay fails and Skill pauses', async () => {
      const detail = await t.rpc('routines.get', { routineId: reviewed.routine.routineId });
      occurrence = detail.runs[0]; return detail.routine.paused && detail.routine.replay.state === 'needs_repair';
    });
    const postedBefore = [...fixture.posted];
    await choose(t, 'Step to repair', reviewed.routine.replay.steps.find(step => step.op === 'click' && step.target === 'css:#continue').id);
    await replace(t, 'Proposed selector', 'css:#continue-new'); await t.ax.press(shell('Propose target repair'));
    t.assert.deepEqual(fixture.posted, postedBefore);
    await captureHomeJourneyState(t, 'demonstration-review-repair-diff', 'demonstration-selector-repair-diff');
    await t.ax.press(shell('Approve this diff and require retest'));
    const changed = (await t.rpc('routines.get', { routineId: reviewed.routine.routineId })).routine;
    t.assert.equal(changed.paused, true); t.assert.equal(changed.replay.state, 'untested');
    const tested = await testAndActivate(t, changed.routineId, workspace.workspaceId, 'Repaired');
    t.assert.equal(fixture.posted.at(-1), 'Repaired');
    await captureHomeJourneyState(t, 'demonstration-repaired-retest', 'demonstration-repair-retested');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { occurrence, changed, tested, actualPosts: [...fixture.posted] } };
  });
}
const PRICED_ROUTE = 'meta/muse-spark-1.3-contributor';
function readNight(t, query) {
  const db = new DatabaseSync(join(t.app.userDataDir, 'Default/Aux Runtime Data/aux-state.sqlite'), { readOnly: true });
  try { return query(db); } finally { db.close(); }
}
const queueRows = t => readNight(t, db => db.prepare('SELECT id,kind,status,created_by,run_id,window_end,foreground FROM night_queue ORDER BY created_at,id').all());
async function queueUI(t, kind, name, limit = '0.5', parameters = {}) {
  const existing = new Set(queueRows(t).map(item => item.id));
  await command(t, 'Queue for tonight');
  await t.ax.waitFor(shell('Queue for tonight'));
  await choose(t, 'Work', kind);
  if (name) await choose(t, kind, name);
  for (const [name, value] of Object.entries(parameters)) await replace(t, `Overnight value for ${name}`, value);
  await replace(t, 'Task limit ($)', limit, 0, 'AXIncrementor');
  await t.ax.press(shell('Queue for tonight'));
  const expectedKind = { Goal: 'goal', Skill: 'routine', 'Consolidate Space memory': 'memory.consolidate', 'Reindex Space memory': 'memory.reindex' }[kind];
  await t.until('person queue acknowledgement persisted exactly one new selected work item', async () => {
    const added = queueRows(t).filter(item => !existing.has(item.id));
    t.assert.ok(added.length <= 1, 'One person submission must not queue duplicate work.');
    if (!added.length) return false;
    t.assert.equal(added[0].created_by, 'person');
    t.assert.equal(added[0].kind, expectedKind);
    return true;
  });
}
const localMinute = minutes => {
  const date = new Date(Date.now() + minutes * 60_000);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
async function replaceTime(t, name, value) {
  const [hours, minutes] = value.split(':').map(Number);
  const meridiem = shell(`AM/PM ${name}`, 'AXIncrementor');
  const hasMeridiem = (await t.ax.query(meridiem)).length > 0;
  for (const [part, text] of [['Hours', String(hasMeridiem ? hours % 12 || 12 : hours)], ['Minutes', String(minutes).padStart(2, '0')]]) {
    await t.ax.click(shell(`${part} ${name}`, 'AXIncrementor'));
    await t.ax.type(text);
  }
  if (hasMeridiem) {
    await t.ax.click(meridiem);
    await t.ax.type(hours < 12 ? 'a' : 'p');
  }
  await t.ax.key('tab', 'hid');
  await t.until(`actual ${name} time control reads ${value}`, async () => {
    const [control] = await t.ax.query(shell(name, 'AXTimeField'));
    return control?.names?.includes(value) || control?.value === value;
  });
}
export async function nightSettingsUI(t, { enabled = true, nightly = '0.01', task = '0.01', outside = false } = {}) {
  await t.ax.key('command+,', 'hid');
  await t.ax.press(shell('Automations'));
  await t.ax.waitFor(shell('Enable overnight work', 'AXCheckBox'));
  const enabledControl = shell('Enable overnight work', 'AXCheckBox');
  const node = (await t.ax.query(enabledControl))[0];
  t.assert.equal(typeof node?.checked, 'boolean', 'Native overnight checkbox state is unavailable.');
  if (node.checked !== enabled) await t.ax.press(enabledControl);
  const start = localMinute(outside ? 5 : -5), end = localMinute(outside ? 10 : 5);
  await replaceTime(t, 'Start', start);
  await replaceTime(t, 'End', end);
  await replace(t, 'Nightly limit ($)', nightly, 0, 'AXIncrementor');
  await replace(t, 'Per-task limit ($)', task, 0, 'AXIncrementor');
  await t.ax.press(shell('Save night shift settings'));
  await t.until('person night shift settings persisted after native authority acknowledgement', async () => {
    const saved = (await t.rpc('settings.get', {})).nightShift;
    return saved?.enabled === enabled && saved.start === start && saved.end === end
      && saved.nightlyUsd === Number(nightly) && saved.perTaskUsd === Number(task);
  });
  await t.ax.waitFor(shell('Save night shift settings'));
  await t.ax.key('escape', 'hid');
}
async function overnight(t) {
  const workspace = (await t.rpc('workspaces.list'))[0] ?? await t.rpc('workspaces.create', { name: 'Aux overnight fixture' });
  t.assert.ok(workspace);
  t.fixture.route('/night-read', '<!doctype html><title>Aux overnight fixture</title><h1 id="ready">Synthetic overnight read</h1>');
  const opened = await t.rpc('pages.open', { url: `${t.fixture.url}/night-read`, activate: true });
  let goal, queued;
  await t.ax.key('command+,', 'hid');
  await t.ax.press(shell('General'));
  const background = shell('Keep Aux running after closing all windows', 'AXCheckBox');
  const backgroundControl = await revealSettingsControl(t, background, 'General settings');
  if (!backgroundControl.checked) await t.ax.press(background);
  await t.ax.key('escape', 'hid');
  t.assert.match(execFileSync('/usr/bin/pmset', ['-g', 'batt'], { encoding: 'utf8' }), /AC Power/, 'Native overnight power proof requires AC power');
  const powerBefore = execFileSync('/usr/bin/pmset', ['-g', 'assertions'], { encoding: 'utf8' });
  const scheduledBefore = execFileSync('/usr/bin/pmset', ['-g', 'sched'], { encoding: 'utf8' });
  await t.step('owner-only overnight endpoints refuse external queue and unscoped proposals without creating work', { kind: 'ui', features: ['overnightReview'] }, async () => {
    const before = queueRows(t);
    for (const method of ['nightShift.queue', 'nightShift.propose']) await t.assert.rejects(t.rpc(method, { payload: { kind: 'memory.reindex', workspaceId: workspace.workspaceId }, budgetUsd: 0.5 }), /permission_denied/);
    t.assert.deepEqual(queueRows(t), before);
    await command(t, 'Review overnight');
    await captureHomeJourneyState(t, 'overnight-person-only-refusals', 'overnight-inbox-person-only-refusals');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { before, after: queueRows(t) } };
  });
  await t.step('person queues real leased Space memory work and observes its completed Inbox row', { kind: 'ui', features: ['overnightReview', 'memory'] }, async () => {
    await nightSettingsUI(t, { enabled: false, nightly: '0.5', task: '0.5' });
    await queueUI(t, 'Consolidate Space memory');
    const before = queueRows(t); t.assert.equal(before.at(-1).created_by, 'person'); t.assert.equal(before.at(-1).status, 'queued');
    await nightSettingsUI(t, { nightly: '0.5', task: '0.5' });
    await t.until('real memory consolidation finishes', async () => queueRows(t).find(item => item.id === before.at(-1).id)?.status === 'done');
    await command(t, 'Review overnight');
    await t.ax.waitFor(shell('done', 'AXStaticText'));
    await captureHomeJourneyState(t, 'overnight-memory-done', 'overnight-memory-work-completed');
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { before, after: queueRows(t), power: execFileSync('/usr/bin/pmset', ['-g', 'assertions'], { encoding: 'utf8' }) } };
  });
  await t.step('an actual always-confirm Skill action waits for morning, and person Apply opens its real foreground approval', { kind: 'ui', features: ['overnightReview', 'demonstrationSkills'] }, async () => {
    await nightSettingsUI(t, { enabled: false, nightly: '0.5', task: '0.5' });
    const fixture = fixtureRoutes(t);
    const reviewed = await recordAndReview(t, workspace.workspaceId, fixture, 'Aux overnight governed Skill');
    await testAndActivate(t, reviewed.routine.routineId, workspace.workspaceId, 'Daytest');
    const beforePosts = fixture.posted.length;
    await queueUI(t, 'Skill', 'Aux overnight governed Skill', '0.5', { company: 'Morning' });
    const item = queueRows(t).at(-1);
    await nightSettingsUI(t, { nightly: '0.5', task: '0.5' });
    let parked;
    await t.until('real overnight action is parked', async () => {
      parked = queueRows(t).find(row => row.id === item.id);
      return parked?.status === 'parked';
    });
    const detail = await t.rpc('runs.get', { runId: parked.run_id });
    t.assert.equal(detail.run.status, 'needs_input'); t.assert.equal(detail.run.config.nightShiftItemId, item.id);
    t.assert.equal(fixture.posted.length, beforePosts, 'No always-confirm POST may execute overnight');
    t.assert.equal((await t.ax.query(shell('Allow'))).length, 0, 'Background confirmation stays in Inbox');
    await nightSettingsUI(t, { outside: true, nightly: '0.5', task: '0.5' });
    await t.until('closed current window requires review', async () => queueRows(t).find(row => row.id === item.id)?.status === 'needs_review');
    t.assert.equal((await t.rpc('runs.get', { runId: parked.run_id })).run.status, 'needs_input');
    await command(t, 'Review overnight'); await t.ax.waitFor(shell('Apply'));
    await captureHomeJourneyState(t, 'overnight-real-approval-waits', 'overnight-morning-approval-awaiting-person');
    const ax = await t.ax.dump({ scope: 'shell' });
    await t.ax.press(shell('Apply')); await t.ax.waitFor(shell('Allow'));
    const foreground = (await t.rpc('runs.get', { runId: parked.run_id })).run;
    t.assert.ok(!foreground.config.nightShiftItemId); t.assert.equal(fixture.posted.length, beforePosts);
    await t.ax.press(shell('Allow'));
    const completed = await settleReplay(t, parked.run_id); t.assert.equal(completed.status, 'completed');
    t.assert.deepEqual(fixture.posted.slice(beforePosts), ['Morning']);
    await captureHomeJourneyState(t, 'overnight-person-applied-done', 'overnight-person-approved-completed');
    return { ax, rpc: { parked, foreground, completed, actualPosts: fixture.posted, power: execFileSync('/usr/bin/pmset', ['-g', 'assertions'], { encoding: 'utf8' }) } };
  });
  await t.step('standard SDK usage creates an actual priced ledger call and nightly cap blocks the next model dispatch', { kind: 'ui', features: ['overnightReview', 'goals'] }, async () => {
    await nightSettingsUI(t, { enabled: false });
    await t.rpc('settings.set', { modelProvider: 'openai-compatible', compatibleEndpoint: t.model.endpoint, plannerModel: PRICED_ROUTE });
    const task = await t.rpc('tasks.create', { workspaceId: workspace.workspaceId, title: 'Aux overnight priced read', objective: 'Read the attached synthetic page, then report its heading.', criteria: [{ criterionId: 'heading', description: 'Report Synthetic overnight read', verification: 'browser' }], resources: [{ resourceId: 'night-page', kind: 'page', label: 'Synthetic overnight page', locator: opened.pageId, access: 'read' }] });
    goal = await t.rpc('goals.create', { workspaceId: workspace.workspaceId, chatId: `task:${task.taskId}`, objective: task.objective, budget: { maxCostUsd: 0.5 } });
    t.model.respond(payload => {
      const tool = payload.tools?.find(entry => /snapshot|observe/.test(entry.function.name));
      t.assert.ok(tool, 'Actual runtime must expose its own page observation tool');
      return { content: null, tool_calls: [{ id: 'night-read-1', type: 'function', function: { name: tool.function.name, arguments: JSON.stringify({ pageId: opened.pageId }) } }], usage: { prompt_tokens: 200_000, completion_tokens: 200_000, total_tokens: 400_000 } };
    });
    const callsBefore = t.model.calls.length;
    await queueUI(t, 'Goal', goal.objective, '0.01');
    queued = queueRows(t).at(-1); t.assert.equal(queued.created_by, 'person');
    await nightSettingsUI(t);
    let ledger;
    await t.until('actual priced model ledger is persisted', async () => {
      queued = queueRows(t).find(item => item.id === queued.id);
      if (!queued.run_id) return false;
      ledger = readNight(t, db => db.prepare('SELECT model_id,input_tokens,output_tokens,cost_usd,cost_estimated FROM model_calls WHERE run_id=? ORDER BY created_at').all(queued.run_id));
      return ledger.length > 0;
    });
    t.assert.equal(ledger[0].model_id, PRICED_ROUTE); t.assert.equal(ledger[0].cost_usd, 0.06); t.assert.equal(ledger[0].cost_estimated, 1);
    await t.until('nightly cap parks or fails actual run before another call', async () => {
      const { run } = await t.rpc('runs.get', { runId: queued.run_id });
      return ['needs_input', 'failed', 'cancelled', 'paused'].includes(run.status);
    });
    t.assert.equal(t.model.calls.length - callsBefore, 1);
    await command(t, 'Review overnight');
    await captureHomeJourneyState(t, 'overnight-real-priced-cap', 'overnight-priced-budget-refusal');
    const scheduledAfter = execFileSync('/usr/bin/pmset', ['-g', 'sched'], { encoding: 'utf8' });
    t.assert.equal(scheduledAfter, scheduledBefore);
    return { ax: await t.ax.dump({ scope: 'shell' }), rpc: { queued, ledger, route: t.model.calls.at(-1).model, powerBefore, powerAfter: execFileSync('/usr/bin/pmset', ['-g', 'assertions'], { encoding: 'utf8' }), scheduledBefore, scheduledAfter } };
  });
}
export const journeys = [
  { journey: { id: 'demonstration-skill', title: 'Record, review, test and repair a real multi-page Skill', features: ['demonstrationSkills'], devAcceptance: ['demonstrationSkills', 'automations'], needs: ['accessibility', 'screen-recording'], model: 'none', launch: {}, timeoutMs: 240000, owner: 'L11' }, run: demonstration },
  { journey: { id: 'overnight-review', title: 'Queue real overnight work and review actual priced budget refusal', features: ['overnightReview'], devAcceptance: ['overnightReview', 'automations', 'memory', 'goals'], needs: ['accessibility', 'screen-recording'], model: 'loopback', launch: {}, timeoutMs: 240000, owner: 'L11' }, run: overnight },
];
