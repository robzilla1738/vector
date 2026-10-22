'use strict';
// PDF-only native route. No installation binding, interposer or credential API.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
function owned(name) {
  const file = path.join(__dirname, name), stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o022)) throw Error('Unsafe Aux PDF resource');
  return file;
}
const pins = require(owned('aux-pdf-pins.cjs'));
const file = owned('aux-pdf.node');
const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW | fs.constants.O_NONBLOCK);
try {
  const before = fs.fstatSync(fd);
  if (!before.isFile() || before.nlink !== 1 || (before.mode & 0o022) || before.size !== pins.bytes) throw Error('Aux PDF module size/type mismatch');
  const bytes = fs.readFileSync(fd), after = fs.fstatSync(fd), entry = fs.lstatSync(file);
  if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size || before.mtimeMs !== after.mtimeMs ||
      before.ctimeMs !== after.ctimeMs || entry.dev !== after.dev || entry.ino !== after.ino ||
      crypto.createHash('sha256').update(bytes).digest('hex') !== pins.sha256) throw Error('Aux PDF module integrity mismatch');
} finally { fs.closeSync(fd); }
const pdf = require(file).pdf;
const descriptors = pdf && Object.getOwnPropertyDescriptors(pdf);
if (!descriptors || pins.methods.some(name => typeof descriptors[name]?.value !== 'function')) throw Error('Aux PDF module contract mismatch');
module.exports = pdf;
