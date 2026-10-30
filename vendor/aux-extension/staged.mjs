// Test helper: an extension file as the release hands it to the Aux-owned replacements, that is
// after the package edits and every transform scripts/release/transforms.mjs runs before them.
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {repoRoot} from '../../scripts/lib/repo-root.mjs';
import {AGENT_PATH, CONNECT_DIALOG_PATH, integrateAgentList, integrateConnectDialog} from '../provided/provider-cli/integration.mjs';
import {EXTENSION_EDITS, integrateExtensionChunk} from '../provided/agent/integration.mjs';
import {EDITS as POLISH_EDITS, integratePolish} from '../provided/polish/integration.mjs';

const DIST = 'Contents/Resources/aux/apps/extension/dist';
const packageEdits = JSON.parse(readFileSync(path.join(repoRoot, 'scripts/release/package-edits.json'), 'utf8')).edits;

/** `relative` is dist-relative (assets/…); `candidate` the sealed Aux.app. */
export function stagedText(candidate, relative) {
  const target = `${DIST}/${relative}`;
  let text = readFileSync(path.join(candidate, target), 'utf8');
  for (const rule of packageEdits) if (rule.target === target) text = text.split(rule.find).join(rule.replace);
  if (relative === AGENT_PATH) text = integrateAgentList(text);
  if (relative === CONNECT_DIALOG_PATH) text = integrateConnectDialog(text);
  if (EXTENSION_EDITS[relative]) text = integrateExtensionChunk(relative, text);
  if (POLISH_EDITS[relative]) text = integratePolish(relative, text);
  return text;
}
