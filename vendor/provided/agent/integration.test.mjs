// Host-only: runs the Agent transforms against the sealed candidate's real files, after the
// release package edits and the provider CLI integration, exactly as transforms.mjs does.
import {requireInput} from '../../../scripts/lib/inputs.mjs';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {integrateDaemon as integrateProviderDaemon} from '../provider-cli/integration.mjs';
import {DAEMON_EDITS, EXTENSION_EDITS, UI_FILE, integrateDaemon, integrateExtensionChunk} from './integration.mjs';

const app = requireInput('candidateApp');
const apps = `${app}/Contents/Resources/aux/apps`;
const entry = `${apps}/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs`;
const dist = `${apps}/extension/dist`;
const packageEdits = JSON.parse(readFileSync(new URL('../../../scripts/release/package-edits.json', import.meta.url), 'utf8')).edits;
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-agent-integration-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));

/** A component file as the release stages it: package edits applied in order. */
function staged(file) {
  let text = readFileSync(file, 'utf8');
  const relative = path.relative(app, file);
  for (const rule of packageEdits) if (rule.target === relative && text.includes(rule.find)) text = text.split(rule.find).join(rule.replace);
  return text;
}
const checkModule = (name, text) => {
  const file = path.join(scratch, name.replaceAll('/', '_').replace(/\.js$/, '.mjs'));
  writeFileSync(file, text);
  const result = spawnSync(process.execPath, ['--check', file], {encoding: 'utf8'});
  assert.equal(result.status, 0, `${name} parses as a module: ${result.stderr}`);
};

test('the daemon entry takes every agent edit once and still parses', () => {
  const before = integrateProviderDaemon(staged(entry));
  const after = integrateDaemon(before);
  for (const rule of DAEMON_EDITS) assert.ok(after.includes(rule.replace), rule.name);
  assert.match(after, /function auxAgentView\(/);
  assert.throws(() => integrateDaemon(after), /already/);
  checkModule('entry.mjs', after);
});

test('every extension chunk takes its edits once and still parses', () => {
  for (const relative of Object.keys(EXTENSION_EDITS)) {
    const before = staged(path.join(dist, relative));
    assert.equal(/\b[Aa]uxAgent[A-Z]\w*/.test(before), false, `${relative} has no aux agent names of its own`);
    const after = integrateExtensionChunk(relative, before);
    for (const rule of EXTENSION_EDITS[relative]) assert.ok(after.includes(rule.replace), `${relative}: ${rule.name}`);
    checkModule(relative, after);
    assert.throws(() => integrateExtensionChunk(relative, after), /already|drift/, 'a second run never applies twice');
  }
});

test('the UI module imports only chunks the candidate ships, by names they export', () => {
  const source = readFileSync(new URL(`./${UI_FILE}`, import.meta.url), 'utf8');
  checkModule(UI_FILE, source);
  const imports = [...source.matchAll(/import \{([^}]+)\} from "\.\/([^"]+)"/g)];
  assert.equal(imports.length, 8, 'every import is checked');
  for (const [, names, chunk] of imports) {
    const text = readFileSync(path.join(dist, 'assets', chunk), 'utf8');
    const exported = new Set([...text.matchAll(/export\{([^}]*)\}/g)].at(-1)[1].split(',').map(item => item.trim().split(' as ').at(-1)));
    for (const name of names.split(',')) assert.ok(exported.has(name.trim().split(' as ')[0]), `${chunk} exports ${name.trim()}`);
  }
  const exports = [...source.matchAll(/export (?:function|const) (\w+)/g)].map(match => match[1]);
  const imported = Object.values(EXTENSION_EDITS).flat().flatMap(rule => [...rule.replace.matchAll(/import\{([^}]+)\}from"\.\/aux-agent-ui\.js"/g)].flatMap(match => match[1].split(',')));
  for (const name of imported) assert.ok(exports.includes(name), `${UI_FILE} exports ${name}`);
});
