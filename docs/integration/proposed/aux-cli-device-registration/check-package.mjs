import assert from 'node:assert/strict';
import {readFile, writeFile} from 'node:fs/promises';
import {createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {SourceTextModule} from 'node:vm';
import {isBuiltin} from 'node:module';
import {findMachOSeaSection, readSeaBlob} from '../../../../vendor/aside/lib/sea.mjs';
import {assertAuxVisualAssets} from '../../../../scripts/lib/aux-identity-contract.mjs';
import {AUX_COLD_ENTRY_REFUSAL} from '../../../../vendor/provided/aux-cold-entry-admission.mjs';

const root = new URL('../../../../', import.meta.url);
const app = new URL('out/provided-candidate-aux-cli-registration/Aux.app/', root);
const oldApp = new URL('out/provided-candidate-aux-cli-admission/Aux.app/', root);
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = async url => JSON.parse(await readFile(url, 'utf8'));
const receiptBytes = await readFile(new URL('../package.json', app));
const receipt = JSON.parse(receiptBytes);
const prior = await json(new URL('../package.json', oldApp));
assert.equal(receipt.identityProfile, 'aux-v1');
assert.equal(receipt.stateIdentityVersion, 2);
assert.equal(receipt.signed, false);
assert.equal(receipt.developmentDpLayout, true);
for (const key of ['nativeReceiptSha256', 'compositionSha256', 'boundaryReceiptSha256'])
  assert.equal(receipt[key], prior[key], key + ' unchanged');
const visualPath = 'Contents/Resources/aux/apps/extension/dist/';
const visual = await assertAuxVisualAssets({agentRoot: decodeURIComponent(new URL(visualPath, app).pathname).replace(/\/$/, ''), assetIdentity: 'aux'});
const priorVisual = await assertAuxVisualAssets({agentRoot: decodeURIComponent(new URL(visualPath, oldApp).pathname).replace(/\/$/, ''), assetIdentity: 'aux'});
assert.deepEqual(visual, priorVisual);
assert.equal(visual.actualFiles, 135);
assert.equal(visual.cssFiles, 5);
const binary = await readFile(new URL('Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea', app));
const section = findMachOSeaSection(binary);
const code = readSeaBlob(binary.subarray(section.offset, section.offset + section.size)).code;
const pins = await json(new URL('./inputs.json', import.meta.url));
const original = await readFile(new URL('./original-function.js.txt', import.meta.url), 'utf8');
const replacement = await readFile(new URL('./replacement-function.js.txt', import.meta.url), 'utf8');
assert.equal(sha(replacement), pins.replaceSha256);
assert.equal(code.includes(original), false);
assert.equal(code.split(replacement).length - 1, 1);
assert.ok(code.startsWith('#!/usr/bin/env node\n' + AUX_COLD_ENTRY_REFUSAL));
const parsed = new SourceTextModule(code);
assert.ok(parsed.dependencySpecifiers.every(isBuiltin));
const frameworkHash = createHash('sha256');
for await (const chunk of createReadStream(new URL('Contents/Frameworks/Aux Framework.framework/Aux Framework', app))) frameworkHash.update(chunk);
const frameworkSha256 = frameworkHash.digest('hex');
const native = await json(new URL('out/aux-lifecycle-native-build.json', root));
assert.equal(frameworkSha256, native.files.find(file => file.path.endsWith('/Aux Framework')).sha256);
const wrapper = await readFile(new URL('Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli', app));
const priorWrapper = await readFile(new URL('Contents/Resources/aux/apps/cli/Aux CLI.app/Contents/MacOS/aux-cli', oldApp));
assert.deepEqual(wrapper, priorWrapper);
const evidence = {
  version: 1, app: decodeURIComponent(app.pathname).replace(/\/$/, ''),
  packageSha256: sha(receiptBytes), cliSeaSha256: sha(binary), cliCodeSha256: sha(code),
  registrationFunctionSha256: sha(replacement), registrationFunctionCount: 1,
  originalRegistrationFunctionAbsent: true, macStatusSchemePairingPackaged: true,
  visualFiles: visual.actualFiles, cssFiles: visual.cssFiles, visualMatchesPredecessor: true,
  nativeFrameworkSha256: frameworkSha256, nativeFrameworkMatchesUnchangedBuild: true,
  preHomeWrapperUnchanged: true, coldEntryRefusalFirst: true, builtinOnlyStaticImports: true,
  applicationExecuted: false, keychainOperationInvoked: false, signed: false,
  runtimeAcceptance: false, acceptedAppReplaced: false,
};
await writeFile(new URL('./package-evidence.json', import.meta.url), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify(evidence, null, 2));
