#!/usr/bin/env node
// Preservation audit: unchanged source equality is expected, never a clean-room failure.
import { createHash } from 'node:crypto';
import { lstat, readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repository = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = resolve(process.argv[2] ?? join(repository, 'out/provided-reuse'));
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const safe = (path) => typeof path === 'string' && path && !path.startsWith('/') && !path.split('/').some((part) => ['', '.', '..'].includes(part));
async function files(root, directory = '') {
  if ((await lstat(join(root, directory))).isSymbolicLink()) throw new Error('Symlink in staged implementation');
  const result = [];
  for (const entry of await readdir(join(root, directory), { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...await files(root, path));
    else if (entry.isFile()) result.push(path);
    else throw new Error(`Nonregular staged implementation: ${path}`);
  }
  return result.sort();
}
const stack = await json(join(output, 'manifest.json'));
if (stack.version !== 1 || stack.implementation !== 'supplied') throw new Error('Not a supplied implementation stage');
const pins = await json(join(repository, 'docs/source/provided-ui-inputs.json'));
const ui = await json(join(output, 'ui/manifest.json'));
let unchanged = 0, changed = 0, css = 0;
for (const component of ['agent', 'vault']) {
  const pinned = pins.components[component], report = ui.components[component], root = join(output, 'ui', component);
  const bySource = new Map();
  for (const file of report.files) {
    const sourcePath = file.sourcePath ?? file.path;
    if (!safe(file.path) || !safe(sourcePath) || bySource.has(sourcePath)) throw new Error('Duplicate or unsafe preservation record');
    bySource.set(sourcePath, file);
  }
  if (bySource.size !== pinned.files.length) throw new Error('Missing or additional supplied UI source records');
  const actualPaths = await files(root), reportedPaths = report.files.map((file) => file.path).sort();
  if (JSON.stringify(actualPaths) !== JSON.stringify(reportedPaths)) throw new Error('Unreported staged UI files');
  for (const input of pinned.files) {
    const file = bySource.get(input.path);
    if (!file || file.sourceSha256 !== input.sourceSha256) throw new Error('UI source pin mismatch');
    const source = await readFile(join(pinned.inputRoot, input.path)), bytes = await readFile(join(root, file.path));
    if (hash(source) !== input.sourceSha256 || hash(bytes) !== file.outputSha256) throw new Error(`Preservation hash mismatch: ${component}/${file.path}`);
    if (source.equals(bytes)) unchanged++;
    else {
      changed++;
      if (!file.changeKinds.length || file.changeKinds.some((kind) => !['identity', 'branding', 'integration'].includes(kind))) throw new Error('Unclassified supplied UI change');
      if (file.anchors?.length) {
        let text = source.toString('utf8');
        for (const anchor of file.anchors) {
          if (!anchor.find || text.split(anchor.find).length - 1 !== anchor.count) throw new Error('Preservation anchor count mismatch');
          text = text.split(anchor.find).join(anchor.replace);
        }
        if (!Buffer.from(text).equals(bytes)) throw new Error('Unreported UI implementation change');
      } else if (!/^icons\/(?:icon-?\d+|favicon-(?:dark|light))\.png$/.test(input.path)) throw new Error('Unanchored UI implementation change');
    }
    if (input.path.endsWith('.css')) {
      css++;
      if (source.toString('utf8').replaceAll('data-aside-', 'data-aux-').replaceAll('Aside', 'Aux') !== bytes.toString('utf8')) throw new Error('Supplied stylesheet changed beyond font/selector identity branding');
    }
  }
}
const apps = await json(join(output, 'apps/manifest.json'));
const appPins = await json(join(repository, 'docs/source/provided-app-inputs.json'));
let appFiles = 0;
for (const component of ['daemon', 'cli']) {
  const report = apps.components[component];
  if (!safe(report.app)) throw new Error('Unsafe app report path');
  const root = join(output, 'apps', report.app);
  if (JSON.stringify(await files(root)) !== JSON.stringify(report.files.map((file) => file.path).sort())) throw new Error('Unreported app resources');
  const sources = new Map(appPins.components[component].files.map((file) => [file.path, file]));
  for (const file of [...report.files, ...report.removed]) {
    if (!safe(file.path)) throw new Error('Unsafe app resource path');
    const source = file.sourcePath ?? file.path;
    if (!file.added) {
      if (sources.get(source)?.sha256 !== (file.sourceSha256 ?? file.sha256)) throw new Error('App source pin mismatch');
      sources.delete(source);
    }
    if (file.outputSha256 && hash(await readFile(join(root, file.path))) !== file.outputSha256) throw new Error('App resource output hash mismatch');
    appFiles++;
  }
  if (sources.size) throw new Error('Unreported omitted app source resources');
}
console.log(`Preservation verified: ${unchanged} unchanged UI files; ${changed} explicitly changed; ${css} stylesheets preserve layout; ${appFiles} app resource records.`);
console.log(`Production ready: ${stack.productionReady}. This audit verifies recorded preservation, not native integration or runtime/UI acceptance.`);
