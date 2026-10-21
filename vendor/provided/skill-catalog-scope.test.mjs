import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { adaptDaemonCode } from './daemon-adapter.mjs';
const approvedCodeSha256 = 'd5133e910653114e22484906ac524dacf449d6fc69f20837c610207f9ba6f465';
import { transformProvidedNativeUi } from './native-ui-compat.mjs';

const source = process.env.AUX_PROVIDED_DAEMON_CODE;
const assets = process.env.AUX_PROVIDED_AGENT_ASSETS;
const rows = [
  { name: 'password-manager', path: 'builtin/password-manager', enabled: true },
  { name: 'apple-passwords', path: 'builtin/apple-passwords', enabled: true },
  { name: 'bitwarden', path: 'builtin/bitwarden', enabled: true },
  { name: 'password-manager', path: 'user/password-manager', enabled: true },
  { name: 'aside', path: 'builtin/aside', enabled: true },
];
const retained = rows.slice(1);

test('production adapter excludes retired builtin catalog and product router', { skip: !source }, () => {
  const active = adaptDaemonCode(readFileSync(source, 'utf8'));
  assert.equal(active.sha256, approvedCodeSha256);
  assert.equal(active.code.includes('passwordManager:passwordManagerRouter'), false);
  const { code } = active;
  const displayStart = code.indexOf('getSkillDisplayName=') + 'getSkillDisplayName='.length;
  const displayEnd = code.indexOf('.join(` `)}', displayStart) + '.join(` `)}'.length;
  const display = runInNewContext(`(${code.slice(displayStart, displayEnd)})`, { UPPERCASE_SKILL_NAME_WORDS: new Set() });
  assert.equal(display(rows[4]), 'Aux');
  assert.equal(display({ name: 'aside', path: 'user/aside' }), 'Aside');
  const start = code.indexOf('listSkills:skillScopeProcedure.query');
  const end = code.indexOf(',createSkill:', start);
  assert.ok(start >= 0 && end > start);
  const routes = runInNewContext(`({${code.slice(start, end)}})`, {
    skillScopeProcedure: { query: (handler) => handler },
    path: { join: (...parts) => parts.join('/') }, getAccountRoot: () => '/fixture',
    collectImmediateSkills: () => rows, collectSkillsForSettings: () => rows,
    getBuiltinSkillPaths: () => new Set(), existsSync: () => true,
    isAuxSkill: () => true, dedupeSkillsByRuntimePriority: (value) => value,
    toListedSkill: (value) => value, markOverriddenSkills: (value) => value,
  });
  const ctx = { accountId: 0, skillsDir: '/fixture/skills' };
  for (const handler of Object.values(routes)) {
    assert.deepEqual(Array.from(handler({ ctx }), (row) => row.path), retained.map((row) => row.path));
  }
});

test('actual Agent Settings selector excludes exact Vault path and display helper preserves IDs', { skip: !assets }, () => {
  const catalog = transformProvidedNativeUi({ component: 'agent', path: 'assets/skills-CfSQ7MCw.js', text: readFileSync(join(assets, 'skills-CfSQ7MCw.js'), 'utf8') });
  const selector = catalog.anchors.find((anchor) => anchor.kind === 'owner-scope').replace;
  const options = runInNewContext(selector, {
    a: { projects: { listSkillsForSettings: { queryOptions: (_input, options) => options } } },
    i: 0, be: (value) => ({ skills: value, marker: 'preserved' }),
  });
  const result = options.select(rows);
  assert.deepEqual(Array.from(result.skills, (row) => row.path), retained.map((row) => row.path));
  assert.equal(result.marker, 'preserved');
  const display = transformProvidedNativeUi({ component: 'agent', path: 'assets/utils-WfPpT5w5.js', text: readFileSync(join(assets, 'utils-WfPpT5w5.js'), 'utf8') });
  const helper = runInNewContext(display.text.replace('export{s as n,E as t};', 'E;'));
  assert.equal(helper(rows[4]), 'Aux');
  assert.equal(helper({ name: 'aside', path: 'user/aside' }), 'Aside');
  assert.equal(helper(rows[1]), 'Apple Passwords');
  assert.equal(helper(rows[2]), 'Bitwarden');
  assert.equal(rows[4].name, 'aside');
  assert.equal(rows[4].path, 'builtin/aside');
});
