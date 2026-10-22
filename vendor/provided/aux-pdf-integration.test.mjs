import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, mkdir, copyFile, appendFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import vm from 'node:vm';
import { auxPdfIntegrationArtifact } from './aux-pdf-artifact.mjs';
import { buildDaemonNodeDevelopment } from './daemon-node-development.mjs';
import { pdfEdits } from './daemon-adapter.mjs';

test('actual supplied daemon routes synchronous PDF to the pinned Aux-only module', async () => {
  const repository = new URL('../../', import.meta.url);
  const artifact = await auxPdfIntegrationArtifact();
  const original = await readFile(new URL('out/provided-source-snapshot-1.26.1016.1852/daemon/Contents/MacOS/aside-daemon', repository));
  const development = buildDaemonNodeDevelopment(original, { enableCloud: true, profile: 'development' }, 'aux-v1', 2);
  const script = development.files.find(file => file.path.endsWith('/node-development/index.mjs')).bytes.toString();
  const body = script.match(/function loadPdfBinding\(\)\{[^}]+\}/g);
  assert.equal(body?.length, 1);
  assert(body[0].includes('path.join(__auxDaemonResources,`native/aux-pdf.cjs`)'));
  const seaBody = pdfEdits.find(edit => edit.name === 'Aux-only synchronous PDF module').to;
  const home = await mkdtemp(path.join(tmpdir(), 'aux-pdf-route-'));
  const require = createRequire(import.meta.url);
  try {
    const resources = path.join(home, 'Aux Daemon.app', 'Contents', 'Resources');
    const native = path.join(resources, 'native');
    await mkdir(native, { recursive: true });
    for (const name of ['aux-pdf.cjs', 'aux-pdf-pins.cjs']) await copyFile(new URL('vendor/provided/' + name, repository), path.join(native, name));
    const modulePath = path.join(native, 'aux-pdf.node');
    await copyFile(new URL(artifact.repositorySource, repository), modulePath);
    const context = {
      path, require$2: require, __auxDaemonResources: resources,
      process: { execPath: path.join(resources, '..', 'MacOS', 'aux-daemon') },
      loadBinding() { throw Error('Credential/native command loader must not run for PDF'); },
    };
    const pdf = vm.runInNewContext(body[0] + ';loadPdfBinding()', context);
    assert.equal(typeof pdf.fillFormFields, 'function');
    assert.throws(() => pdf.extractText(), /PDF operation requires an input object/);
    assert.equal(vm.runInNewContext(seaBody + ';loadPdfBinding()', context), pdf);
    await appendFile(modulePath, Buffer.from([0]));
    delete require.cache[require.resolve(path.join(native, 'aux-pdf.cjs'))];
    assert.throws(() => require(path.join(native, 'aux-pdf.cjs')), /Aux PDF module size\/type mismatch/);
  } finally { await rm(home, { recursive: true, force: true }); }
});
