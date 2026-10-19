'use strict';
const fs = require('node:fs/promises');
const { constants } = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { seedBundledRuntime } = require('./runtime-seed.cjs');
async function readRegular(p) {
  const h = await fs.open(p, constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  try {
    const s = await h.stat();
    if (!s.isFile() || (s.mode & 0o022) || s.size > 8 * 1024 * 1024) throw new Error('Unsafe bundled runtime metadata');
    return await h.readFile();
  } finally { await h.close(); }
}
let active;
module.exports = function provisionBundledRuntime(destination) {
  if (active) return active;
  active = (async () => {
    const directory = await fs.realpath(__dirname), root = path.resolve(directory, '../../../../../..');
    if (directory !== path.join(root, 'apps/daemon/Aux Daemon.app/Contents/Resources/native')) throw new Error('Unexpected runtime bootstrap bundle layout');
    if (!process.env.AUX_HOME || !path.isAbsolute(process.env.AUX_HOME)) throw new Error('Absolute AUX_HOME required');
    const home = await fs.realpath(process.env.AUX_HOME);
    if (path.resolve(destination) !== path.join(home, 'runtime')) throw new Error('Runtime destination must be the canonical private home cache');
    const bytes = await readRegular(path.join(directory, 'runtime-source-pins.json'));
    if (crypto.createHash('sha256').update(bytes).digest('hex') !== '7fa5c41acab7c3e9c052bf44b9daa4c0892e717f70718ca9f6a65b030e13bba8') throw new Error('Runtime source inventory mismatch');
    const report = JSON.parse(await readRegular(path.join(root, 'provenance/distribution-manifest.json')));
    if (typeof report.runtimeRoot !== 'string' || !path.isAbsolute(report.runtimeRoot) || !report.runtimeRoot.endsWith('/Contents/Resources/aux/agent-runtime')) throw new Error('Invalid bundled runtime text relocation root');
    const pins = JSON.parse(bytes);
    if (pins.sourceVersion !== '1.26.1019.335' || pins.files.length !== 10929 || pins.files.filter((e) => e.anchors?.length).length !== 9) throw new Error('Unexpected supplied runtime inventory');
    return seedBundledRuntime({ source: path.join(root, 'agent-runtime'), home, bundleRuntimeRoot: report.runtimeRoot, pins });
  })();
  return active.finally(() => { active = undefined; });
};
