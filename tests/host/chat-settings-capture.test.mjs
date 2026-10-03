import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { captureFreshChat, captureSettingsRail, observedRailOrientation } from './lib/chat-settings-capture.mjs';

function fixture({ queue = true, row = true, downloads = false } = {}) {
  const events = [], settings = { modelConfigured: true }, runs = [];
  let focused = 'Reply to conversation';
  const t = { appearanceEnabled: true, narrowEnabled: true, app: { pid: 711 }, assert,
    rpc: async method => method === 'settings.get' ? { ...settings } : method === 'runs.list' ? [...runs] : [],
    ax: { pid: 711, windows: async () => [{ id: 73, layer: 0, width: 810, height: 700 }],
      query: async selector => {
        if (selector.name === 'Queue for tonight' && !queue || selector.name === 'Downloads' && !downloads) return [];
        const x = row && selector.name === 'Appearance' ? 110 : 10;
        const y = !row && selector.name === 'Appearance' ? 80 : 40;
        return [{ name: selector.name, focused: focused === selector.name, enabled: true, frame: { x, y, width: 100, height: 40 } }];
      },
      waitFor: async selector => events.push(['wait', selector.name]),
      click: async selector => { focused = selector.name; events.push(['click', selector.name]); },
      focus: async selector => { focused = selector.name; events.push(['focus', selector.name]); },
      key: async key => { events.push(['key', key]); focused = key === 'escape' ? 'Queue for tonight' : key === 'right' ? 'Appearance' : downloads ? 'Downloads' : 'General'; },
      dump: async () => ({ controlled: true }) },
    capture: async (name, options) => events.push(['capture', name, options]),
    step: async (name, _options, effect) => { const result = await effect(); events.push(['step', name, result]); return result; } };
  return { t, events, settings, runs };
}

test('ordinary and non-narrow paths perform no added effects', async () => {
  const { t, events } = fixture(); t.appearanceEnabled = false;
  await captureFreshChat(t); await captureSettingsRail(t, 'vertical');
  t.appearanceEnabled = true; t.narrowEnabled = false;
  await captureSettingsRail(t, 'vertical'); assert.deepEqual(events, []);
});

test('fresh welcome and actual Queue open preserve unsubmitted runs and restore focus', async () => {
  const { t, events, runs } = fixture();
  assert.deepEqual(await captureFreshChat(t), { queueFooter: 'observed-unsubmitted' });
  assert.deepEqual(events.filter(row => row[0] === 'capture').map(row => row[1]),
    ['first-chat-fresh-welcome-focused', 'first-chat-fresh-queue-footer', 'first-chat-queue-unsubmitted', 'first-chat-queue-focus-returned']);
  assert.deepEqual(events.filter(row => row[0] === 'click').map(row => row[1]), ['Queue for tonight']);
  assert.deepEqual(events.filter(row => row[0] === 'key').map(row => row[1]), ['escape']);
  assert.deepEqual(runs, []);
  assert.equal(events.at(-1)[1], 'Reply to conversation');
});

test('unavailable Queue stays pending with only the genuine welcome capture', async () => {
  const { t, events } = fixture({ queue: false });
  assert.deepEqual(await captureFreshChat(t), { queueFooter: 'pending-unavailable' });
  assert.equal(events.filter(row => row[0] === 'capture').length, 1);
  assert.equal(events.filter(row => row[0] === 'click').length, 0);
});

test('unfocused welcome and retired original capture owner refuse', async () => {
  for (const type of ['focus', 'retired']) {
    const { t } = fixture();
    if (type === 'focus') await t.ax.focus({ name: 'foreign' });
    else t.ax.windows = async () => { t.app.pid++; return [{ id: 73, layer: 0, width: 810, height: 700 }]; };
    await assert.rejects(captureFreshChat(t), /genuinely focus|owner changed/);
  }
});

test('Queue capture and focus restoration retain both original failures', async () => {
  const { t } = fixture(); const primary = new Error('original capture'), cleanup = new Error('original escape');
  t.capture = async name => { if (name === 'first-chat-queue-unsubmitted') throw primary; };
  t.ax.key = async () => { throw cleanup; };
  await assert.rejects(captureFreshChat(t), error => error instanceof AggregateError && error.errors[0] === primary && error.errors[1] === cleanup);
});

test('actual row moves Right and Home to observed available controls then restores search', async () => {
  for (const downloads of [false, true]) {
    const { t, events } = fixture({ downloads });
    assert.deepEqual(await captureSettingsRail(t, 'vertical'), { settingsRow: 'observed-row' });
    assert.deepEqual(events.filter(row => row[0] === 'key').map(row => row[1]), ['right', 'home']);
    assert.equal(events.filter(row => row[0] === 'capture').length, 3);
    assert.equal(events.filter(row => row[0] === 'click').length, 0);
    assert.equal(events.at(-1)[1], 'Search settings');
  }
});

test('observed column is explicit pending and never relabeled a row', async () => {
  const { t, events } = fixture({ row: false });
  assert.deepEqual(await captureSettingsRail(t, 'horizontal'), { settingsRow: 'pending-observed-column' });
  assert.equal(events.filter(row => row[0] === 'key' || row[0] === 'capture').length, 0);
  assert.equal(events.at(-1)[2].rpc.settingsRow, 'pending-observed-column');
});

test('malformed or overlapping frame hints cannot prove responsive geometry', () => {
  const row = (x, y, width = 100) => ({ frame: { x, y, width, height: 40 } });
  assert.throws(() => observedRailOrientation(row(10, 40, 0), row(110, 40)), /positive finite/);
  assert.throws(() => observedRailOrientation(row(10, 40), row(30, 40)), /does not prove/);
  assert.throws(() => observedRailOrientation(row(NaN, 40), row(110, 40)), /positive finite/);
});

test('every original journey assertion remains byte-restorable after removing capture adapters', () => {
  for (const file of ['first-chat', 'layout-modes']) {
    let source = readFileSync(new URL(`./journeys/${file}.mjs`, import.meta.url), 'utf8');
    if (file === 'first-chat') source = source.replace("import { captureFreshChat } from '../lib/chat-settings-capture.mjs';\n", '').replace('    const freshAppearance = await captureFreshChat(t);\n', '').replace('return { freshAppearance, ax:', 'return { ax:');
    else source = source.replace("import { captureSettingsRail } from '../lib/chat-settings-capture.mjs';\n", '').replace('    await captureSettingsRail(t, layout);\n', '');
    const originalSha256 = {
      'first-chat': '283eda569124e7b03c81ec4ddf3425cbcbc22ee4115ef33a0e1df8aa263f17ce',
      'layout-modes': '843a66aecd25c3d05ddbb0f7acb38872f981a637f3ebf0952174a31da3dfa4a0',
    }[file];
    assert.equal(createHash('sha256').update(source).digest('hex'), originalSha256);
  }
});
