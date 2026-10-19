'use strict';
// Fixed supplied roles, never an environment-selected/native-module override.
const path = require('node:path');
const bindings = Object.freeze({
  daemon: Object.freeze({ suffix: '/apps/daemon/Aux Daemon.app/Contents/Resources/native', sha256: 'bfe946e05fbaf2ae68d0560258f50e63a6c3ff6da2937e0aa8f9f19016e1f7fb' }),
  cli: Object.freeze({ suffix: '/apps/cli/Aux CLI.app/Contents/Resources/native', sha256: '66368b6846d2842a5ee0ba3d5c6d5d094fd40098d7819dbb63ef17600c85c3fc' }),
});
function verifyNativeRole(directory, digest) {
  if (typeof directory !== 'string' || !path.isAbsolute(directory) || path.normalize(directory) !== directory) throw new Error('Canonical fixed native role directory required');
  const found = Object.entries(bindings).find(([, pin]) => directory.length > pin.suffix.length && directory.endsWith(pin.suffix));
  if (!found || digest !== found[1].sha256) throw new Error('Original native binding role/hash mismatch');
  return found[0];
}
module.exports = Object.freeze({ bindings, verifyNativeRole });
