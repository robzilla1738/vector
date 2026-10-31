// Host-only: runs transforms.mjs on a minimal staged app holding only the candidate files it touches.
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {copyFileSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import test from 'node:test';
import {requireInput} from '../lib/inputs.mjs';
import {repoRoot} from '../lib/repo-root.mjs';
import {RUNTIME_FILES} from '../../vendor/provided/provider-cli/integration.mjs';
import {DAEMON_FILES as AGENT_FILES, EXTENSION_EDITS as AGENT_EDITS, UI_FILE as AGENT_UI} from '../../vendor/provided/agent/integration.mjs';
import {RUNTIME_FILES as AUX_DAEMON_FILES} from '../../vendor/aux-daemon/integration.mjs';
import {ASSET_FILES as POLISH_ASSETS, EDITS as POLISH_EDITS} from '../../vendor/provided/polish/integration.mjs';
import {DOMPURIFY_CHUNK} from '../../vendor/provided/polish/dompurify.mjs';
import {BUILTIN_SKILLS_DIR, SKILL_FILES, SKILL_ICONS, frontMatter} from '../../vendor/aux-skills/integration.mjs';
import {COMPONENTS, GLOBALS_CSS, LICENSE as STYLES_LICENSE, NEWTAB_PAGE, REMOVED_ASSETS, REMOVED_CHUNKS, REMOVED_FILES as STYLES_REMOVED, ROUTES, integrateNewTab, integrateStyles, readComponent,
  readRoute}
  from '../../vendor/aux-extension/integration.mjs';

const candidate = requireInput('candidateApp');
const daemon = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development';
const dist = 'Contents/Resources/aux/apps/extension/dist';
const agentChunks = Object.keys(AGENT_EDITS).map(chunk => `${dist}/${chunk}`);
const polishChunks = Object.keys(POLISH_EDITS).map(chunk => `${dist}/${chunk}`);
const skills = `${path.dirname(daemon)}/${BUILTIN_SKILLS_DIR}`;
const skillFiles = SKILL_FILES.map(file => `${skills}/${file}`);
const componentChunks = Object.keys(COMPONENTS).map(chunk => `${dist}/${chunk}`);
const routeChunks = Object.keys(ROUTES).map(chunk => `${dist}/${chunk}`);
const purifyChunk = `${dist}/${DOMPURIFY_CHUNK}`;
const earlier = [`${dist}/assets/strip-markdown-DRcmtuJc.js`, ...agentChunks, ...polishChunks];
const touched = [`${daemon}/aux-native-entry.mjs`, `${dist}/assets/strip-markdown-DRcmtuJc.js`, `${dist}/assets/connect-dialog-CacgpFap.js`, ...agentChunks, ...polishChunks, purifyChunk,
  ...componentChunks.filter(chunk => !earlier.includes(chunk)), ...routeChunks.filter(chunk => !earlier.includes(chunk))];
const newTab = `${dist}/${NEWTAB_PAGE}`;
// The release applies package edits before the transforms; stage the touched files the same way.
const packageEdits = JSON.parse(readFileSync(path.join(repoRoot, 'scripts/release/package-edits.json'), 'utf8')).edits;
const scratch = mkdtempSync(path.join(tmpdir(), 'aux-release-transforms-'));
test.after(() => rmSync(scratch, {recursive: true, force: true}));
const app = path.join(scratch, 'Aux.app');
const packageEdited = relative => {
  let text = readFileSync(path.join(candidate, relative), 'utf8');
  for (const rule of packageEdits) if (rule.target === relative) text = text.split(rule.find).join(rule.replace);
  return text;
};
for (const relative of [...touched, newTab]) {
  mkdirSync(path.dirname(path.join(app, relative)), {recursive: true});
  writeFileSync(path.join(app, relative), packageEdited(relative));
}
// The extension stylesheet and the font the styles drop (not JavaScript, so outside `touched`).
const styleFiles = [GLOBALS_CSS, ...STYLES_REMOVED].map(file => `${dist}/${file}`);
for (const relative of styleFiles) copyFileSync(path.join(candidate, relative), path.join(app, relative));
// The chunks Aux doesn't ship, and the sealed chunks whose deps tables still name them.
const removedFiles = [...REMOVED_CHUNKS, ...REMOVED_ASSETS].map(file => `${dist}/${file}`);
for (const relative of removedFiles) copyFileSync(path.join(candidate, relative), path.join(app, relative));
const x64Pty = ['pty.node', 'spawn-helper'].map(file => `${path.dirname(daemon)}/native/node-pty/prebuilds/darwin-x64/${file}`);
for (const relative of x64Pty) {
  mkdirSync(path.dirname(path.join(app, relative)), {recursive: true});
  copyFileSync(path.join(candidate, relative), path.join(app, relative));
}
// The whole sealed skills tree, with the glob package edits (icon host) applied.
cpSync(path.join(candidate, skills), path.join(app, skills), {recursive: true});
const stagedSkill = file => {
  let text = readFileSync(path.join(candidate, skills, file), 'utf8');
  for (const rule of packageEdits) if (path.matchesGlob(`${skills}/${file}`, rule.target)) text = text.split(rule.find).join(rule.replace);
  return text;
};
for (const file of SKILL_FILES) writeFileSync(path.join(app, skills, file), stagedSkill(file));
const transform = () => spawnSync(process.execPath, [path.join(repoRoot, 'scripts/release/transforms.mjs'), app], {encoding: 'utf8'});

test('transforms.mjs adds the provider CLI, agent and Aux daemon files and applies every transform once', async () => {
  const result = transform();
  assert.equal(result.status, 0, result.stderr);
  const applied = JSON.parse(result.stdout);
  assert.deepEqual(applied.filter(entry => entry.added).map(entry => path.basename(entry.path)), [...RUNTIME_FILES, ...AGENT_FILES, AGENT_UI, ...POLISH_ASSETS, ...AUX_DAEMON_FILES.map(file => path.basename(file)), ...SKILL_ICONS, STYLES_LICENSE.target]);
  assert.deepEqual(applied.filter(entry => !entry.added && !entry.removed && !entry.label.endsWith('out of the deps')).map(entry => entry.path), [...touched.slice(0, 3), touched[0], touched[0], ...agentChunks, ...polishChunks, purifyChunk, ...skillFiles, styleFiles[0], newTab, ...componentChunks, ...routeChunks]);
  assert.deepEqual(applied.filter(entry => entry.removed).map(entry => entry.path), [...x64Pty, ...styleFiles.slice(1), ...removedFiles]);
  for (const file of removedFiles) assert.ok(!existsSync(path.join(app, file)), file);
  // Nothing left in the bundle names a chunk that is gone, in an import or a Vite deps table.
  for (const name of readdirSync(path.join(app, dist, 'assets')).filter(file => file.endsWith('.js'))) {
    const text = readFileSync(path.join(app, dist, 'assets', name), 'utf8');
    for (const chunk of REMOVED_CHUNKS) assert.ok(!text.includes(chunk.slice('assets/'.length)), `${name} names ${chunk}`);
  }
  for (const file of styleFiles.slice(1)) assert.ok(!existsSync(path.join(app, file)), file);
  assert.equal(readFileSync(path.join(app, styleFiles[0]), 'utf8'), integrateStyles(readFileSync(path.join(candidate, styleFiles[0]), 'utf8')));
  assert.deepEqual(readFileSync(path.join(app, dist, STYLES_LICENSE.target)), readFileSync(path.join(repoRoot, 'vendor/aux-extension', STYLES_LICENSE.source)));
  // The New Tab and components went in last, onto the text the package edits and polish left.
  assert.equal(readFileSync(path.join(app, newTab), 'utf8'), integrateNewTab(packageEdited(newTab)));
  for (const [map, read] of [[COMPONENTS, readComponent], [ROUTES, readRoute]])
    for (const [chunk, blocks] of Object.entries(map)) {
      const text = readFileSync(path.join(app, dist, chunk), 'utf8');
      for (const {file} of blocks) assert.equal(text.split(read(file)).length - 1, 1, `${chunk}: ${file}`);
    }
  for (const file of skillFiles) assert.deepEqual(readFileSync(path.join(app, file)), readFileSync(path.join(repoRoot, 'vendor/aux-skills/builtin', path.relative(skills, file))), file);
  assert.deepEqual(readFileSync(path.join(app, dist, 'assets', AGENT_UI)), readFileSync(path.join(repoRoot, 'vendor/provided/agent', AGENT_UI)));
  for (const file of RUNTIME_FILES) {
    assert.deepEqual(readFileSync(path.join(app, daemon, 'provider-cli', file)), readFileSync(path.join(repoRoot, 'vendor/provided/provider-cli', file)), file);
  }
  for (const relative of touched) assert.equal(spawnSync(process.execPath, ['--check', path.join(app, relative)]).status, 0, relative);
  // The composed entry loads the module by this URL; it resolves to the staged copy and imports cleanly.
  const entry = path.join(app, daemon, 'aux-native-entry.mjs');
  assert.ok(readFileSync(entry, 'utf8').includes('await import(new URL("./provider-cli/aux-daemon.mjs",import.meta.url))'));
  const staged = await import(new URL('./provider-cli/aux-daemon.mjs', pathToFileURL(entry)).href);
  const instance = staged.createAuxProviderCli({detect: async () => ({directories: [], providers: []})});
  assert.equal((await instance.status()).rows['claude-code'].state, 'not-installed');
  const agent = await import(new URL('./aux-agent/aux-agent.mjs', pathToFileURL(entry)).href);
  for (const file of AUX_DAEMON_FILES) {
    assert.deepEqual(readFileSync(path.join(app, daemon, 'aux-daemon', file)), readFileSync(path.join(repoRoot, 'vendor/aux-daemon', file)), file);
  }
  assert.ok(readFileSync(entry, 'utf8').includes('auxRouter=router(auxOwnedDaemon.compose({'));
  const dispatcher = await import(new URL('./aux-daemon/dispatcher.mjs', pathToFileURL(entry)).href);
  assert.deepEqual((await dispatcher.createAuxOwnedDaemon()).owned(), {});
  assert.equal(agent.createAuxAgent({control: () => scratch, task: () => scratch, shared: () => scratch}).read(1).name, 'Aux');
});

test('a second run stops: the runtime files already exist', () => {
  const result = transform();
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /already exists/);
});

test('every supplied built-in skill has a rewrite with the same front matter, and nothing extra', () => {
  const supplied = readdirSync(path.join(candidate, skills), {recursive: true}).filter(file => file.endsWith('.md')).sort();
  assert.deepEqual([...SKILL_FILES], supplied);
  assert.equal(supplied.filter(file => path.basename(file) === 'SKILL.md').length, 51);
  for (const file of SKILL_FILES.filter(file => path.basename(file) === 'SKILL.md')) {
    const ours = readFileSync(path.join(repoRoot, 'vendor/aux-skills/builtin', file), 'utf8');
    assert.equal(frontMatter(ours), frontMatter(stagedSkill(file)), file);
    assert.notEqual(ours, stagedSkill(file), file);
  }
});

test('the release carries current DOMPurify, its own skill icons and no x64 node-pty', () => {
  const chunk = readFileSync(path.join(app, purifyChunk), 'utf8');
  assert.equal(chunk.includes('3.4.12'), false);
  assert.ok(chunk.startsWith('import auxDomPurify from"./aux-dompurify.js";'));
  assert.ok(readFileSync(path.join(app, dist, 'assets/aux-dompurify.js'), 'utf8').startsWith('/*! @license DOMPurify 3.4.17'));
  assert.equal(SKILL_ICONS.length, 46);
  for (const icon of SKILL_ICONS) assert.ok(existsSync(path.join(app, dist, 'builtin-skills/v1', icon)), icon);
  for (const relative of x64Pty) assert.equal(existsSync(path.join(app, relative)), false, relative);
  const entry = readFileSync(path.join(app, daemon, 'aux-native-entry.mjs'), 'utf8');
  assert.equal(entry.includes('127.0.0.1:9/'), false);
  assert.equal(entry.includes('createSttHttpRouter'), false);
  for (const gone of ['install.ps1', 'install.sh', 'fetchRelease', 'getWindowsCliInstallation', 'aux-unavailable/releases', 'verifyDaemonDevAuthToken', 'billing/embedded-checkout', 'files\\/metadata$']) assert.equal(entry.includes(gone), false, gone);
});
