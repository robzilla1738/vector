#!/usr/bin/env node
// Applies component transforms to a staged release app and prints what changed as JSON.
// Each transform is count-checked and throws on any mismatch, so a drifted input stops the release.
//
//   node scripts/release/transforms.mjs <staged Aux.app>
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { repoRoot } from '../lib/repo-root.mjs';
import { RUNTIME_FILES, AGENT_PATH, CONNECT_DIALOG_PATH, integrateDaemon, integrateAgentList, integrateConnectDialog }
  from '../../vendor/provided/provider-cli/integration.mjs';
import { DAEMON_FILES as AGENT_DAEMON_FILES, EXTENSION_EDITS as AGENT_EXTENSION_EDITS, UI_FILE as AGENT_UI_FILE,
  integrateDaemon as integrateAgentDaemon, integrateExtensionChunk as integrateAgentChunk } from '../../vendor/provided/agent/integration.mjs';
import { EDITS as POLISH_EDITS, integratePolish } from '../../vendor/provided/polish/integration.mjs';

const app = process.argv[2];
if (!app) throw new Error('usage: transforms.mjs <staged Aux.app>');
const daemon = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources';
const agent = 'Contents/Resources/aux/apps/extension/dist';

// [label, repository source, staged destination]. New files only: an existing destination stops the release.
const ADDITIONS = [
  ...RUNTIME_FILES.map(file => ['provider CLI runtime', `vendor/provided/provider-cli/${file}`, `${daemon}/node-development/provider-cli/${file}`]),
  ...AGENT_DAEMON_FILES.map(file => ['agent runtime', `vendor/provided/agent/${file}`, `${daemon}/node-development/aux-agent/${file}`]),
  ['agent UI', `vendor/provided/agent/${AGENT_UI_FILE}`, `${agent}/assets/${AGENT_UI_FILE}`],
];

// [label, relative file, async (text) => text]. Lanes add their transforms here.
const TRANSFORMS = [
  ['provider CLIs: daemon hooks, no borrowed sign-in', `${daemon}/node-development/aux-native-entry.mjs`, integrateDaemon],
  ['provider CLIs: Agent provider list', `${agent}/${AGENT_PATH}`, integrateAgentList],
  ['provider CLIs: connect dialogs', `${agent}/${CONNECT_DIALOG_PATH}`, integrateConnectDialog],
  ['agent: daemon profile, home thread and identity', `${daemon}/node-development/aux-native-entry.mjs`, integrateAgentDaemon],
  ...Object.keys(AGENT_EXTENSION_EDITS).map(chunk => [`agent: ${chunk}`, `${agent}/${chunk}`, text => integrateAgentChunk(chunk, text)]),
  ...Object.keys(POLISH_EDITS).map(chunk => [`polish: ${chunk}`, `${agent}/${chunk}`, text => integratePolish(chunk, text)]),
];

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
process.stdout.write(JSON.stringify(applied));
