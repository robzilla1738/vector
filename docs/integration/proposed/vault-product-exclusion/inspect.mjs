/** Reads exact supplied static bundle; compiles source syntax in memory, never executes it. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SourceTextModule } from 'node:vm';
import { findMachOSeaSection, readSeaBlob } from '../../../../vendor/aside/lib/sea.mjs';
import { propose, sha256, edits, disabledSeed } from './proposal.mjs';
const bundle = process.argv[2];
if (!bundle) throw new Error('Pass exact archived Aux Daemon.app path');
const binary = readFileSync(join(bundle, 'Contents/MacOS/aux-daemon'));
const section = findMachOSeaSection(binary);
const source = readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code;
const proposed = propose(source);
new SourceTextModule(proposed.code, { identifier: 'proposed-daemon.mjs' });
const anchors = [
  'ui=null,di=process.platform',
  'let ti=ei.filter(Cn=>Cn.name!==`password-manager`)',
  'settings:settingsRouter', 'models:modelsRouter',
  'externalPasswordManagers:externalPasswordManagersRouter',
  'trpcServer({router:asideRouter,createContext:ti})',
  'mountTrpcHttpRoutesToHono({trpcRouter:asideRouter,honoApp:ei,createTrpcContext:ti})',
  'AsideDaemonSessionToken ', 'Aside Daemon Auth v1', 'aside.dk.',
];
for (const anchor of anchors) {
  const count = source.split(anchor).length - 1;
  if (!count || proposed.code.split(anchor).length - 1 !== count) throw new Error(`Changed protected anchor ${anchor}`);
}
const seed = readFileSync(join(bundle, 'Contents/Resources/static/skills/builtin/password-manager/SKILL.md'));
console.log(JSON.stringify({ status:'static-proposal-only', baseCodeSha256:sha256(source), proposedCodeSha256:proposed.sha256, inspectedBinarySha256:sha256(binary), seedPath:'Contents/Resources/static/skills/builtin/password-manager/SKILL.md', beforeSeedSha256:sha256(seed), afterSeedSha256:sha256(disabledSeed), sourceEditCount:edits.length, countPerAnchor:1, syntaxCompiled:true, protectedAnchorsUnchanged:true, runtimeExecuted:false, binaryWritten:false, signingPerformed:false }, null, 2));
