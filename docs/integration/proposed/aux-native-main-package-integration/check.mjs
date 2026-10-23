import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { verifyBuildReceipt, verifyNativeMainPackageInput } from './source/native-main-package.mjs';
const here = dirname(fileURLToPath(import.meta.url));
const root = '/Users/rcourson/Documents/Vibe/web';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const receipt = await readFile(join(here, 'evidence/build68715.json'));
assert.equal(verifyBuildReceipt(receipt).passed, true);
assert.throws(() => verifyBuildReceipt(Buffer.from(receipt.toString().replace('"passed": true', '"passed": false'))));
const metadata = JSON.parse(await readFile(join(here, 'metadata.json')));
for (const file of metadata.files) {
  let source = await readFile(join(root, file.path), 'utf8');
  const observed = sha(source);
  assert.ok([file.sourceSha256, file.outputSha256].includes(observed));
  if (observed === file.sourceSha256) {
    for (const edit of file.edits) {
      assert.equal(source.split(edit.find).length - 1, edit.count);
      source = source.replace(edit.find, edit.replace);
    }
  }
  assert.equal(sha(source), file.outputSha256);
  assert.equal(source, await readFile(join(here, 'source', file.path), 'utf8'));
}
const args = { repositoryRoot: root, receiptPath: join(here, 'evidence/build68715.json'),
  compositionBytes: await readFile(join(root, 'out/native-reuse-composition-aux-parent-swift-runtime/manifest.json')),
  stage: {identityProfile: 'aux-v1', stateIdentityVersion: 2} };
await assert.rejects(verifyNativeMainPackageInput({...args, stage: {...args.stage, stateIdentityVersion: 1}}));
await assert.rejects(verifyNativeMainPackageInput({...args, compositionBytes: Buffer.from('{}')}));
const evidence = await verifyNativeMainPackageInput(args);
assert.equal(evidence.authorityGranted, false);
assert.equal(evidence.coldHookEnabled, false);
console.log(JSON.stringify({format: 'aux.inactive-native-main.package-proposal-check.v1', passed: true,
  actualReceiptAndOutputReadOnly: true, sourceFiles: evidence.sourceFiles,
  patchFiles: metadata.files.length, packageProduced: false, executableRun: false}, null, 2));
