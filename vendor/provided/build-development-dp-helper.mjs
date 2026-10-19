// Compile the fixed-scope approval helper; never load it or call Security APIs.
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const repository = fileURLToPath(new URL('../../', import.meta.url));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function pin(path) {
  const stat = lstatSync(path);
  if (!stat.isFile() || stat.isSymbolicLink()) throw Error('Regular helper input required');
  return { path, sha256: digest(readFileSync(path)) };
}

export function buildDevelopmentDpScopeHelper(output, nodeInclude = join(homedir(), '.aside/runtime/node/include/node')) {
  if (!output) throw Error('A new helper output directory is required');
  output = resolve(output);
  nodeInclude = realpathSync(nodeInclude);
  mkdirSync(dirname(output), { recursive: true });
  if (realpathSync(dirname(output)) !== dirname(output)) throw Error('Canonical output parent required');
  try { lstatSync(output); throw Error('Helper output already exists'); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  const sourcePaths = ['vendor/provided/native/development-dp-scope-helper.mm', 'vendor/provided/native/dp-scope-policy.h', 'vendor/provided/dp-probe-policy.json', 'docs/integration/proposed/development-dp-signing/proposal.json', 'vendor/provided/build-development-dp-helper.mjs'];
  for (const input of [...sourcePaths.map(path => join(repository, path)), nodeInclude]) {
    if (input === output || input.startsWith(output + sep)) throw Error('Helper output overlaps its inputs');
  }
  const sources = sourcePaths.map(path => ({ ...pin(join(repository, path)), path }));
  const headers = ['node_api.h', 'js_native_api.h', 'js_native_api_types.h', 'node_api_types.h'].map(name => pin(join(nodeInclude, name)));
  const policy = JSON.parse(readFileSync(join(repository, 'vendor/provided/dp-probe-policy.json')));
  if (digest(JSON.stringify(policy.core)) !== policy.approvalId || digest(policy.core.home) !== policy.core.scope) throw Error('Fixed helper policy drift');
  const definitions = readFileSync(join(repository, 'vendor/provided/native/dp-scope-policy.h'), 'utf8');
  const proposal=JSON.parse(readFileSync(join(repository,'docs/integration/proposed/development-dp-signing/proposal.json')));
  const implementation=readFileSync(join(repository,sourcePaths[0]),'utf8');
  for(const [name,value] of [['Team',proposal.identityInspection.teamId],['LeafSha1',proposal.identityInspection.publicCertificateSha1],['Group',proposal.proposedFirstAndOnlySharedGroup]])if(!implementation.includes(`constexpr char kDevelopment${name}[] = ${JSON.stringify(value)};`))throw Error('Reviewed development identity differs from helper source');
  if(proposal.exactExistingDisposableHome!==policy.core.home || proposal.exactScope!==policy.core.scope)throw Error('Development proposal must retain approved scope');
  for (const [name, value] of [['Home', policy.core.home], ['Scope', policy.core.scope], ['ApprovalId', policy.approvalId]]) {
    if (!definitions.includes(`constexpr char kDpProbe${name}[] = ${JSON.stringify(value)};`)) throw Error('Compiled helper policy differs from approval policy');
  }
  const temporary = mkdtempSync(join(dirname(output), '.dp-helper-'));
  try {
    const binary = join(temporary, 'aux-dp-scope-helper.node');
    const argv = ['xcrun', 'clang++', '-std=c++20', '-fobjc-arc', '-framework', 'Foundation', '-framework', 'Security', '-shared', '-undefined', 'dynamic_lookup', '-I', nodeInclude, join(repository, sourcePaths[0]), '-o', binary];
    execFileSync('python3', [join(repository, 'scripts/native-build.py'), ...argv], { cwd: repository, stdio: 'inherit' });
    for (const input of [...sources.map(item => ({ ...item, path: join(repository, item.path) })), ...headers]) {
      if (pin(input.path).sha256 !== input.sha256) throw Error('Helper source/header changed during compilation');
    }
    execFileSync('/usr/bin/codesign', ['--verify', '--strict', binary], { stdio: 'pipe' });
    const artifact = pin(binary);
    const receipt = { version: 1, implementation:'development-dp-scope-helper', expectedTeam:proposal.identityInspection.teamId,expectedLeafSha1:proposal.identityInspection.publicCertificateSha1,expectedGroup:proposal.proposedFirstAndOnlySharedGroup, buildExitCode: 0, scope: policy.core.scope, approvalId: policy.approvalId, sources, headers, argv, signatureVerified: true, nativeLoaded: false, dpCallsExecuted: false, output: { path: join(output, 'aux-dp-scope-helper.node'), sha256: artifact.sha256 } };
    writeFileSync(join(temporary, 'dp-scope-helper-receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
    // Never replace an existing build or an installed app.
    try { lstatSync(output); throw Error('Helper output appeared during compilation'); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
    renameSync(temporary, output);
    return { output, receipt: join(output, 'dp-scope-helper-receipt.json'), dpCallsExecuted: false };
  } catch (error) {
    rmSync(temporary, { recursive: true, force: true });
    throw error;
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(buildDevelopmentDpScopeHelper(process.argv[2], process.argv[3])));
}
