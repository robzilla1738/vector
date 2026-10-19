import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { basename, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { transformProvidedNativeUi } from './native-ui-compat.mjs';

const digest = (text) => createHash('sha256').update(text).digest('hex');
async function* files(root) {
  for (const entry of (await readdir(root, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else if (entry.isFile() && /\.(?:js|html|json|css)$/.test(entry.name)) yield path;
  }
}
/** Static packages only: no browser profiles, accounts, state or running services. */
export async function auditNativeUi(roots) {
  const report = { version: '1.26.1016.1852', components: {} };
  for (const component of ['agent', 'vault']) {
    const root = roots[component];
    if (basename(root) !== report.version) throw new Error(`Expected pinned ${component} version`);
    const manifestText = await readFile(join(root, 'manifest.json'), 'utf8');
    const manifest = JSON.parse(manifestText);
    if (manifest.version !== report.version) throw new Error('Unexpected manifest version');
    const changed = [];
    for await (const file of files(root)) {
      const text = await readFile(file, 'utf8');
      const path = relative(root, file);
      const result = transformProvidedNativeUi({ component, path, text });
      let replayed = text;
      for (const anchor of result.anchors) {
        if (replayed.split(anchor.find).length - 1 !== anchor.count) throw new Error(`Anchor drift: ${path}`);
        replayed = replayed.split(anchor.find).join(anchor.replace);
      }
      if (replayed !== result.text) throw new Error(`Unrecorded change: ${path}`);
      if (path === 'manifest.json') JSON.parse(result.text);
      if (result.anchors.length) changed.push({ path, sourceSha256: digest(text), transformedSha256: digest(result.text), anchors: result.anchors });
    }
    report.components[component] = { manifestSha256: digest(manifestText), changed };
  }
  return report;
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error('Usage: node audit-native-ui.mjs <pinned-agent-root> <pinned-vault-root>');
  process.stdout.write(`${JSON.stringify(await auditNativeUi({ agent: process.argv[2], vault: process.argv[3] }), null, 2)}\n`);
}
