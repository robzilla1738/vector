'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { seedBundledMemory } = require('./memory-seed.cjs');
module.exports = async function provisionBundledMemory() {
  const directory = await fs.realpath(__dirname);
  const root = path.resolve(directory, '../../../../../..');
  if (directory !== path.join(root, 'apps/daemon/Aux Daemon.app/Contents/Resources/native')) throw new Error('Unexpected memory bootstrap bundle layout');
  if (!process.env.AUX_HOME || !path.isAbsolute(process.env.AUX_HOME)) throw new Error('Absolute AUX_HOME required for cache provisioning');
  const manifest = await fs.readFile(path.join(directory, 'memory-pins.json'));
  if (crypto.createHash('sha256').update(manifest).digest('hex') !== 'd73016f00854deed3b33fd65e95205b21a372e70faf480b261865283ff6a427d') throw new Error('Memory pin inventory mismatch');
  return seedBundledMemory({ source: path.join(root, 'memory-distribution'), home: process.env.AUX_HOME, entries: JSON.parse(manifest) });
};
