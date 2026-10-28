#!/usr/bin/env node
// Applies component transforms to a staged release app and prints what changed as JSON.
// Each transform is count-checked and throws on any mismatch, so a drifted input stops the release.
//
//   node scripts/release/transforms.mjs <staged Aux.app>
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const app = process.argv[2];
if (!app) throw new Error('usage: transforms.mjs <staged Aux.app>');
const daemon = 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources';

// [label, relative file, async (text) => text]. Lanes add their transforms here.
const TRANSFORMS = [];

const applied = [];
for (const [label, relative, transform] of TRANSFORMS) {
  const file = path.join(app, relative);
  const before = readFileSync(file, 'utf8');
  const after = await transform(before);
  if (after === before) throw new Error(`${label} changed nothing in ${relative}`);
  writeFileSync(file, after);
  applied.push({ label, path: relative });
}
process.stdout.write(JSON.stringify(applied));
