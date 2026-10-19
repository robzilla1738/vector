// Expose the pinned supplied CLI helpers; do not replace its auth/RPC/stream code.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';

export const CLI_SOURCE_SHA256 = '013dbd114ac574df1e4c72f53fd438d4b7da4d2aebbf3c45fa22a6fb2fe1dd62';
const entrypoint = `buildProgram(actions, CLI_VERSION).parseAsync(process.argv).catch((error) => {\n\tconsole.error(error instanceof Error && error.message ? error.message : String(error));\n\tprocess.exit(1);\n});`;
export function exposeHelpers(source) {
  assert.equal(createHash('sha256').update(source).digest('hex'), CLI_SOURCE_SHA256, 'Supplied CLI source drift');
  assert.equal(source.split(entrypoint).length - 1, 1, 'CLI entrypoint count drift');
  assert.equal(source.split('export {  };').length - 1, 1, 'CLI export count drift');
  return source.replace(entrypoint, '').replace('export {  };',
    'export { createDaemonClient, createChatClient, createExecSession, resolveAccount, flushLogDump, DAEMON_BASE_URL };');
}
export async function loadSuppliedCli(sourcePath, directory, adapterUrl) {
  const original = await readFile(sourcePath, 'utf8');
  exposeHelpers(original);
  const { adaptCliCode } = await import(adapterUrl);
  const adapted = adaptCliCode(original).code;
  // Branding is separately count-checked by the production adapter. Only expose
  // helpers after it runs, retaining every supplied helper body verbatim.
  assert.equal(adapted.split(entrypoint).length - 1, 1);
  assert.equal(adapted.split('export {  };').length - 1, 1);
  const module = adapted.replace(entrypoint, '').replace('export {  };',
    'export { createDaemonClient, createChatClient, createExecSession, resolveAccount, flushLogDump, DAEMON_BASE_URL };');
  const path = join(directory, 'supplied-cli-helpers.mjs');
  await writeFile(path, module, { mode: 0o600, flag: 'wx' });
  return import(pathToFileURL(path).href);
}
