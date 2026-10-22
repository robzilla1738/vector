/** Static build input only. Never loads native code or starts a daemon. */
import { readFile, lstat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import pins from './aux-pdf-pins.cjs';

const repository = new URL('../../', import.meta.url);
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
export async function auxPdfIntegrationArtifact() {
  const generatedFrom = 'docs/integration/proposed/aux-pdf-lifetime/runtime-evidence.json';
  const evidence = JSON.parse(await readFile(new URL(generatedFrom, repository), 'utf8'));
  const repositorySource = 'out/aux-pdf-lifetime/aux-pdf.node';
  if (evidence.format !== 'aux.pdf.lifetime.runtime.evidence.v2' || evidence.module.path !== repositorySource ||
      evidence.module.sha256 !== pins.sha256 || evidence.module.bytes !== pins.bytes ||
      evidence.actualPdfiumLinked !== true || evidence.actualFrozenNodeFixturePassed !== true ||
      evidence.pdfNativeAdmissionClosure !== true || evidence.nativeApi.javascriptExportsAdded !== false ||
      evidence.scope.originalAddonExecuted !== false || evidence.scope.protectedSecurityOperations !== false) throw Error('Aux PDF build evidence mismatch');
  for (const source of evidence.currentSources) {
    if (typeof source.path !== 'string' || !source.path.startsWith('docs/integration/proposed/') || source.path.split('/').includes('..') ||
        digest(await readFile(new URL(source.path, repository))) !== source.sha256) throw Error('Aux PDF source/config changed; rebuild and review the artifact');
  }
  const file = fileURLToPath(new URL(repositorySource, repository)), stat = await lstat(file);
  if (!stat.isFile() || stat.isSymbolicLink() || stat.nlink !== 1 || (stat.mode & 0o022) || stat.size !== pins.bytes) throw Error('Unsafe Aux PDF build artifact');
  const bytes = await readFile(file);
  if (digest(bytes) !== pins.sha256) throw Error('Aux PDF build artifact changed');
  return { bytes, repositorySource, generatedFrom };
}
