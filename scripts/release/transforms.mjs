#!/usr/bin/env node
// Applies component transforms to a staged release app and prints what changed as JSON.
// Each transform is count-checked and throws on any mismatch, so a drifted input stops the release.
//
//   node scripts/release/transforms.mjs <staged Aux.app>
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../lib/repo-root.mjs';
import { RUNTIME_FILES, AGENT_PATH, CONNECT_DIALOG_PATH, integrateDaemon, integrateAgentList, integrateConnectDialog }
  from '../../vendor/provided/provider-cli/integration.mjs';
import { DAEMON_FILES as AGENT_DAEMON_FILES, EXTENSION_EDITS as AGENT_EXTENSION_EDITS, UI_FILE as AGENT_UI_FILE,
  integrateDaemon as integrateAgentDaemon, integrateExtensionChunk as integrateAgentChunk } from '../../vendor/provided/agent/integration.mjs';
import { RUNTIME_FILES as AUX_DAEMON_FILES, integrateDaemon as integrateAuxDaemon } from '../../vendor/aux-daemon/integration.mjs';
import { EDITS as POLISH_EDITS, integratePolish } from '../../vendor/provided/polish/integration.mjs';
import { BUILTIN_SKILLS_DIR, SKILL_FILES, assertSameSkillFiles, replaceSkillFile } from '../../vendor/aux-skills/integration.mjs';
import { COMPONENTS, GLOBALS_CSS, LICENSE as STYLES_LICENSE, NEWTAB_PAGE, REMOVED_FILES as STYLES_REMOVED, integrateComponents, integrateNewTab,
  integrateStyles } from '../../vendor/aux-extension/integration.mjs';

const app = process.argv[2];
if (!app) throw new Error('usage: transforms.mjs <staged Aux.app>');
const daemon = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources';
const agent = 'Contents/Resources/aux/apps/extension/dist';

// [label, repository source, staged destination]. New files only: an existing destination stops the release.
const ADDITIONS = [
  ...RUNTIME_FILES.map(file => ['provider CLI runtime', `vendor/provided/provider-cli/${file}`, `${daemon}/node-development/provider-cli/${file}`]),
  ...AGENT_DAEMON_FILES.map(file => ['agent runtime', `vendor/provided/agent/${file}`, `${daemon}/node-development/aux-agent/${file}`]),
  ['agent UI', `vendor/provided/agent/${AGENT_UI_FILE}`, `${agent}/assets/${AGENT_UI_FILE}`],
  ...AUX_DAEMON_FILES.map(file => ['Aux daemon routers', `vendor/aux-daemon/${file}`, `${daemon}/node-development/aux-daemon/${file}`]),
  ['Agent extension styles: Geist license', `vendor/aux-extension/${STYLES_LICENSE.source}`, `${agent}/${STYLES_LICENSE.target}`],
];

// [label, relative file, async (text) => text]. Lanes add their transforms here.
const TRANSFORMS = [
  ['provider CLIs: daemon hooks, no borrowed sign-in', `${daemon}/node-development/aux-native-entry.mjs`, integrateDaemon],
  ['provider CLIs: Agent provider list', `${agent}/${AGENT_PATH}`, integrateAgentList],
  ['provider CLIs: connect dialogs', `${agent}/${CONNECT_DIALOG_PATH}`, integrateConnectDialog],
  ['agent: daemon profile, home thread and identity', `${daemon}/node-development/aux-native-entry.mjs`, integrateAgentDaemon],
  ['Aux daemon routers: the root router goes through the dispatcher', `${daemon}/node-development/aux-native-entry.mjs`, integrateAuxDaemon],
  ...Object.keys(AGENT_EXTENSION_EDITS).map(chunk => [`agent: ${chunk}`, `${agent}/${chunk}`, text => integrateAgentChunk(chunk, text)]),
  ...Object.keys(POLISH_EDITS).map(chunk => [`polish: ${chunk}`, `${agent}/${chunk}`, text => integratePolish(chunk, text)]),
  ...SKILL_FILES.map(file => [`built-in skills: ${file}`, `${daemon}/${BUILTIN_SKILLS_DIR}/${file}`, text => replaceSkillFile(file, text)]),
  ['Agent extension styles: Aux-owned tokens, fonts and base styles', `${agent}/${GLOBALS_CSS}`, integrateStyles],
  ['Agent extension styles: New Tab first-paint tokens and fonts', `${agent}/${NEWTAB_PAGE}`, integrateNewTab],
  // Last, so they apply to the text every earlier edit to the same chunk (polish, provider CLIs) left.
  ...Object.keys(COMPONENTS).map(chunk => [`Agent extension components: ${chunk}`, `${agent}/${chunk}`, text => integrateComponents(chunk, text)]),
];

// [label, staged file]. Supplied files Aux may not ship; a missing file stops the release.
const REMOVALS = STYLES_REMOVED.map(file => ['Agent extension styles: the supplied display font', `${agent}/${file}`]);

assertSameSkillFiles(path.join(app, daemon, BUILTIN_SKILLS_DIR));
const applied = [];
for (const [label, source, relative] of ADDITIONS) {
  const file = path.join(app, relative);
  if (existsSync(file)) throw new Error(`${label}: ${relative} already exists`);
  mkdirSync(path.dirname(file), { recursive: true });
  copyFileSync(path.join(repoRoot, source), file);
  applied.push({ label, path: relative, added: true });
}
for (const [label, relative, transform] of TRANSFORMS) {
  const file = path.join(app, relative);
  const before = readFileSync(file, 'utf8');
  const after = await transform(before);
  if (after === before) throw new Error(`${label} changed nothing in ${relative}`);
  writeFileSync(file, after);
  applied.push({ label, path: relative });
}
for (const [label, relative] of REMOVALS) {
  const file = path.join(app, relative);
  if (!existsSync(file)) throw new Error(`${label}: ${relative} is missing`);
  rmSync(file);
  applied.push({ label, path: relative, removed: true });
}
process.stdout.write(JSON.stringify(applied));
