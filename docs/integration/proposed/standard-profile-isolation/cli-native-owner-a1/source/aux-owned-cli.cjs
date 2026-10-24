'use strict';
// Native bootstrap must register this exact actual Environment first. No addon,
// carrier, environment-selected path or installation authority fallback exists.
const path = require('node:path');
const binding = process._linkedBinding('aux_owned_native');
const descriptors = Object.getOwnPropertyDescriptors(binding);
if (typeof descriptors.run?.value !== 'function' || typeof descriptors.assertBrokerOwner?.value !== 'function' ||
    typeof descriptors.withBrokerSync?.value !== 'function') throw Error('Aux CLI native owner is unavailable');
const run = descriptors.run.value.bind(binding);
const assertOwner = descriptors.assertBrokerOwner.value.bind(binding);
const sync = descriptors.withBrokerSync.value.bind(binding);
let pdf;
const facade = {run(command, input) { assertOwner(); return run(command, input); }};
Object.defineProperty(facade, 'pdf', {enumerable: true, get() {
  assertOwner();
  if (!pdf) {
    // Same packaged PDF-only loader and image used by the retained daemon host.
    // The native CLI embedding must seal/preload it before capturing its owner.
    const actual = require(path.resolve(__dirname, '../../../../../daemon/Aux Daemon.app/Contents/Resources/native/aux-pdf.cjs'));
    const names = ['extractText','fillFormFields','getFormFields','merge','renderPages','rotate','split'];
    const fields = actual && Object.getOwnPropertyDescriptors(actual);
    if (!fields || names.some(name => typeof fields[name]?.value !== 'function')) throw Error('Aux CLI PDF contract is incomplete');
    pdf = Object.freeze(Object.fromEntries(names.map(name => [name, (...args) => {
      assertOwner();
      return sync(() => { assertOwner(); return Reflect.apply(fields[name].value, actual, args); });
    }])));
  }
  assertOwner(); return pdf;
}});
module.exports = Object.freeze(facade);
