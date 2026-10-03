#!/usr/bin/env node
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { AUX_FEATURES } from '../../../packages/contracts/dist/aux-features.js';

export const FEATURE_JOURNEYS = {
  'shortcut-registry': ['commandRegistry'],
  'sidebar-modes': ['floatingSidebar', 'autoHideToolbar', 'layouts'],
  'minimal-ui': ['minimalUi'], 'cross-window': ['windowSync'], 'command-bar-modes': ['commandBar'],
  'split-fluid': ['splitView'], 'pinned-live': ['pinnedApps', 'liveFolders', 'folders', 'tabSections'],
  'smart-download-rename': ['smartDownloadNames'], 'in-app-profiles': ['profiles'], 'extension-actions': ['extensions'],
  'link-routing': ['linkRouting'], 'cli-open': ['cliOpen'], applescript: ['appleScript'], 'little-window': ['littleWindow'],
  'organization-work-performance': ['autoArchive'],
  'auto-archive': ['autoArchive', 'archive'], 'tab-mentions': ['tabMentions'], pip: ['pictureInPicture'],
  'agent-site-permissions': ['agentSitePermissions'], 'demonstration-skill': ['demonstrationSkills'], 'overnight-review': ['overnightReview'],
};
export const LEGACY_FEATURES = ['sitePermissions', 'reader', 'inboundAgents', 'electronMigration', 'quickAsk', 'aiTranslate',
  'httpsFirst', 'contentBlocking', 'pageZoom', 'automations', 'spaces', 'outboundMcp', 'aiTidy', 'tabLifecycle', 'peek', 'titleRules', 'aiTabNaming'];
export const TARGET_FEATURES = [...new Set([...Object.values(FEATURE_JOURNEYS).flat(), ...LEGACY_FEATURES])].sort();

export async function journeyRegistry(directory = import.meta.dirname) {
  const entries = [];
  for (const file of readdirSync(directory).filter(file => file.endsWith('.mjs') && file !== 'index.mjs').sort()) {
    const path = resolve(directory, file);
    const module = await import(pathToFileURL(path).href);
    if (module.journey) entries.push({ journey: module.journey, run: module.run, path });
    else if (module.journeys) entries.push(...module.journeys.map(entry => ({ ...entry, path })));
    else throw new Error(`${file} does not register a journey`);
  }
  return entries;
}

export function checkJourneyRegistry(entries, targets = TARGET_FEATURES) {
  const ids = new Set();
  for (const entry of entries) {
    const { journey, run, path } = entry;
    assert.match(journey.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid journey ID');
    assert.ok(!ids.has(journey.id), `Duplicate journey: ${journey.id}`);
    ids.add(journey.id);
    assert.equal(typeof run, 'function', `${journey.id} has no runner`);
    assert.ok(Array.isArray(journey.features) && journey.features.length && new Set(journey.features).size === journey.features.length,
      `${journey.id} has invalid feature coverage`);
    assert.ok(journey.features.every(feature => Object.hasOwn(AUX_FEATURES, feature)), `${journey.id} covers an unknown feature`);
    assert.ok(Array.isArray(journey.needs), `${journey.id} has no needs declaration`);
    assert.ok(['none', 'loopback'].includes(journey.model), `${journey.id} has an invalid model transport`);
    assert.ok(Number.isFinite(journey.timeoutMs) && journey.timeoutMs > 0, `${journey.id} has no deadline`);
    assert.ok(typeof journey.owner === 'string' && journey.owner, `${journey.id} has no owner`);
    const source = readFileSync(path, 'utf8');
    assert.ok(!/console\.log\(\s*["'`](?:Open|Click|Choose|Press)\b/.test(source) || journey.needs.includes('owner-presence'),
      `${journey.id} contains an undeclared operator prompt`);
  }
  const missing = targets.filter(feature => !entries.some(entry => entry.journey.features.includes(feature) &&
    !entry.journey.needs.includes('owner-presence')));
  assert.deepEqual(missing, [], `Features without unattended journeys: ${missing.join(', ')}`);
  return { journeys: entries.length, features: targets.length };
}

if (process.argv[1] && existsSync(process.argv[1]) && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1])) {
  const entries = await journeyRegistry();
  if (process.argv.includes('--check')) {
    const root = resolve(import.meta.dirname, '../../..');
    const records = JSON.parse(readFileSync(resolve(root, 'docs/qualification.json'), 'utf8'));
    const targets = [...new Set([...TARGET_FEATURES, ...Object.keys(records.features)])];
    console.log(JSON.stringify(checkJourneyRegistry(entries, targets)));
  } else console.log(JSON.stringify(entries.map(entry => entry.journey), null, 2));
}
