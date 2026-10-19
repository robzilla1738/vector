'use strict';
// Production integration seam, disabled until actual runtime isolation review.
// Every process/worker loads the guard BEFORE the pinned original native addon.
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const loadOnly = process.env.AUX_PROVIDED_NATIVE_LOAD_ONLY === '1';
if (!loadOnly && process.env.AUX_ENABLE_PROVIDED_NATIVE_CARRIER !== '1') {
  throw new Error('Provided native execution has not been accepted');
}
if (!process.env.AUX_HOME || !path.isAbsolute(process.env.AUX_HOME)) {
  throw new Error('Absolute AUX_HOME is required');
}
const home = fs.realpathSync(process.env.AUX_HOME);
const scope = crypto.createHash('sha256').update(home).digest('hex');
if (process.env.AUX_NATIVE_KEYCHAIN_SCOPE && process.env.AUX_NATIVE_KEYCHAIN_SCOPE !== scope) {
  throw new Error('Inherited native worker scope does not match canonical home');
}
const directory = fs.realpathSync(__dirname);
const owned = (name) => {
  const target = path.join(directory, name);
  const stat = fs.lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o022)) {
    throw new Error('Native component must be a non-shared-writable regular file');
  }
  return target;
};
// No external binding/guard path environment variable is used here.
const guard = require(owned('aux-native-guard.node'));
const status = guard.prepare(home, loadOnly);
if (status?.boundaryActive !== true || status.denyAll !== loadOnly) {
  throw new Error('Native boundary guard refused required mode');
}
process.env.AUX_HOME = home;
process.env.AUX_NATIVE_KEYCHAIN_SCOPE = scope;
const bindingPath = owned('provided-native.node');
if (crypto.createHash('sha256').update(fs.readFileSync(bindingPath)).digest('hex') !==
    'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb') {
  throw new Error('Provided native binding hash mismatch');
}
const original = require(bindingPath);
if (loadOnly) {
  // Original NAPI entry registration is allowed; original commands/PDF actions
  // are not. This mode cannot become production inside the same process.
  module.exports = Object.freeze({ get boundaryStatus() { return guard.status(); },
    run() { throw new Error('Native execution disabled in load-only mode'); },
    get pdf() { throw new Error('Native PDF execution disabled in load-only mode'); },
  });
} else {
  // Preserve all original exports, function identity and PDF behavior unchanged.
  module.exports = original;
}
