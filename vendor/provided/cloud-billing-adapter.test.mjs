import assert from 'node:assert/strict';
import test from 'node:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { cloudBillingCopyPath, transformCloudBillingCopy } from './cloud-billing-adapter.mjs';

const original = readFileSync(new URL(`../../out/provided-source-snapshot-1.26.1016.1852/agent/${cloudBillingCopyPath}`, import.meta.url), 'utf8');
const pins = JSON.parse(readFileSync(new URL('../../docs/source/provided-ui-inputs.json', import.meta.url), 'utf8'));
const input = { component: 'agent', path: cloudBillingCopyPath, text: original };
test('actual pinned pricing component changes only the incorrect discount copy', () => {
  const pin = pins.components.agent.files.find(file => file.path === cloudBillingCopyPath);
  assert.equal(createHash('sha256').update(original).digest('hex'), pin.sourceSha256);
  const result = transformCloudBillingCopy(input);
  assert.equal(result.anchors.length, 1);
  const [anchor] = result.anchors;
  assert.equal(anchor.count, 1);
  assert.equal(original.split(anchor.find).length - 1, 1);
  assert.equal(result.text, original.replace(anchor.find, anchor.replace));
  assert.equal(result.text.includes('(-20% off)'), false);
  assert.equal(result.text.includes('children:"Save yearly"'), true);
  execFileSync(process.execPath, ['--input-type=module', '--check'], { input: result.text, stdio: ['pipe', 'pipe', 'pipe'] });
});
test('copy adapter refuses source drift and leaves other roles unchanged', () => {
  assert.throws(() => transformCloudBillingCopy({ ...input, text: original.replace('(-20% off)', 'changed') }), /anchor changed/);
  assert.throws(() => transformCloudBillingCopy({ ...input, text: original + 'children:"(-20% off)"' }), /anchor changed/);
  assert.equal(transformCloudBillingCopy({ ...input, component: 'vault' }).text, original);
  assert.equal(transformCloudBillingCopy({ ...input, path: 'assets/other.js' }).text, original);
});
