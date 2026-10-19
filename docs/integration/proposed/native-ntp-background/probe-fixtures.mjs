// Executes only the original fixed body-style expression with authored objects.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const original = fs.readFileSync(new URL('./original-body-background-probe.js', import.meta.url), 'utf8');
const cpp = fs.readFileSync(new URL('./port/chrome/browser/ui/views/frame/aux_ntp_transition_state.cc', import.meta.url), 'utf8');
const embedded = cpp.split('uR"AUXPROBE(\n')[1].split(')AUXPROBE"')[0];
assert.equal(embedded, original);
for (const [color, expected] of [
  ['transparent', false], ['rgba(0, 0, 0, 0)', false], ['', false],
  ['rgba(1,2,3,0.49)', false], ['rgba(1,2,3,0.5)', true],
  ['rgb(1 2 3 / 49%)', false], ['color(srgb 0 0 0 / 50%)', true],
  ['rgb(1,2,3)', true], ['rgba(1,2,3,nan)', true],
]) {
  assert.equal(vm.runInNewContext(original, {document: {body: {}}, getComputedStyle: () => ({backgroundColor: color})}, {timeout: 100}), expected, color);
}
assert.equal(vm.runInNewContext(original, {document: {body: null}}, {timeout: 100}), false);
console.log('Original fixed probe: exact embedded bytes and11authored style fixtures PASS');
