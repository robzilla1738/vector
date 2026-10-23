import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
// Check the actual selected root graph, including when this check is reviewed
// from an isolated worktree before its two-file check update is integrated.
const root = '/Users/rcourson/Documents/Vibe/web';
const here = join(root, 'docs/integration/proposed/aux-native-main-package-integration');
const { verifyBuildReceipt, verifyNativeMainPackageInput } = await import(pathToFileURL(join(here, 'source/native-main-package.mjs')));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const pins = JSON.parse(await readFile(join(here, 'inputs.json')));
const receiptPath = resolve(here, pins.buildReceipt);
const receipt = await readFile(receiptPath);
assert.equal(sha(receipt), pins.buildReceiptSha256);
assert.equal(verifyBuildReceipt(receipt).passed, true);
assert.throws(() => verifyBuildReceipt(Buffer.from(receipt.toString().replace('"passed": true', '"passed": false'))));
const metadata = JSON.parse(await readFile(join(here, 'metadata.json')));
const entryPatch = JSON.parse(await readFile(join(root, 'docs/integration/proposed/aux-native-current-entry-package/package-metadata.json')));
for (const file of metadata.files) {
  // The original reviewed postimage remains immutable historical evidence.
  let expected = await readFile(join(here, 'source', file.path), 'utf8');
  assert.equal(sha(expected), file.outputSha256);
  let finalHash = file.outputSha256;
  if (file.path === entryPatch.path) {
    assert.equal(entryPatch.sourceSha256, file.outputSha256);
    for (const edit of entryPatch.edits) {
      assert.equal(expected.split(edit.find).length - 1, edit.count);
      expected = expected.replace(edit.find, edit.replace);
    }
    finalHash = entryPatch.outputSha256;
  }
  assert.equal(sha(expected), finalHash);
  const actual = await readFile(join(root, file.path), 'utf8');
  assert.equal(sha(actual), finalHash);
  assert.equal(actual, expected);
}
const args = { repositoryRoot: root, receiptPath,
  compositionBytes: await readFile(join(root, 'out/native-reuse-composition-aux-parent-swift-runtime/manifest.json')),
  stage: { identityProfile: 'aux-v1', stateIdentityVersion: 2 } };
await assert.rejects(verifyNativeMainPackageInput({ ...args, stage: { ...args.stage, stateIdentityVersion: 1 } }));
await assert.rejects(verifyNativeMainPackageInput({ ...args, compositionBytes: Buffer.from('{}') }));
const evidence = await verifyNativeMainPackageInput(args);
assert.equal(evidence.authorityGranted, false);
assert.equal(evidence.coldHookEnabled, false);
assert.equal(evidence.fixedNativeEntryReaderSha256, pins.fixedNativeEntryReaderSha256);
console.log(JSON.stringify({ format: 'aux.selected-native-main.package-check.v1', passed: true,
  selectedReceiptSha256: pins.buildReceiptSha256, actualReceiptAndOutputReadOnly: true,
  sourceFiles: evidence.sourceFiles, exactFinalPackageComposition: true,
  patchFiles: metadata.files.length, packageProduced: false, executableRun: false }, null, 2));
