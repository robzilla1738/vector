"""Link the actual daemon closure with the paired capture receiver, unsigned."""
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
OUT = Path('/private/tmp/aux-ui-native-capture-transport-daemon-link-20261024-a2')
OUT.mkdir(mode=0o700)
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
manifest = REPO / 'docs/integration/proposed/standard-profile-isolation/integration/daemon-link-a6-inputs.json'
predecessor = json.loads(manifest.read_text())
plan = json.loads((HERE / 'source-plan.json').read_text())
checked = json.loads((HERE / 'actual-typecheck-a2.json').read_text())
compiled = json.loads((HERE / 'actual-compile-a1.json').read_text())
assert checked['passed'] and checked['sourcePlanSha256'] == sha(HERE / 'source-plan-before-exclusivity-fix.json')
assert checked['cppCompileReceiptSha256'] == sha(HERE / 'actual-compile-a1.json')
assert compiled['passed'] and len(compiled['results']) == 4
old_plan = json.loads((HERE / 'source-plan-before-exclusivity-fix.json').read_text())
old_files = {row['path']: row for row in old_plan['files']}
for row in plan['files']:
    if row['path'] != 'AuxOwnedCommandDispatcher.swift':
        assert row == old_files[row['path']]
    else:
        assert len(row['anchors']) == len(old_files[row['path']]['anchors']) + 1
        assert row['anchors'][1:] == old_files[row['path']]['anchors']
changed = {row['input']: row for row in plan['files']}
replacement, sources = {}, []
for row in plan['swiftSources']:
    assert sha(row['path']) == row['sha256']
    successor = changed.get(row['path'])
    path, expected = (successor['output'], successor['outputSha256']) if successor else (row['path'], row['sha256'])
    assert sha(path) == expected
    replacement[row['predecessor']] = path
    sources.append({'predecessor': row['predecessor'], 'predecessorSha256': row['predecessorSha256'],
                    'path': path, 'sha256': expected, 'changed': path != row['predecessor']})
assert len(sources) == 48 and sum(row['changed'] for row in sources) == 5
original = predecessor['commands'][0]
old_peer = [arg for arg in original if arg.endswith('/peer-transport.o')]
assert len(old_peer) == 1
peer = Path(compiled['results'][-1]['command'][compiled['results'][-1]['command'].index('-o') + 1])
assert compiled['results'][-1]['name'] == 'daemon-AuxNativePeerTransport'
assert sha(peer) == compiled['results'][-1]['objectSha256']
replacement[old_peer[0]] = str(peer)
args = [replacement.get(arg, arg) for arg in original]
args[args.index('-o') + 1] = str(OUT / 'Aux Daemon')
args[args.index('-module-cache-path') + 1] = str(OUT / 'module-cache')
assert '-no_adhoc_codesign' in args
assert sum(arg.endswith('.swift') for arg in args) == 48
assert sum(arg.endswith('.o') for arg in args) == 14
frozen = {}
for arg in args:
    path = Path(arg)
    if path.is_file():
        frozen[str(path)] = sha(path)
for name, expected in predecessor['frozenFiles'].items():
    if name in original and name not in replacement:
        assert sha(name) == expected
inputs = {'format': 'aux.ui-native-capture-transport.daemon-link-inputs.v1',
          'predecessorManifest': str(manifest), 'predecessorManifestSha256': sha(manifest),
          'sourcePlanSha256': sha(HERE / 'source-plan.json'),
          'typecheckReceiptSha256': sha(HERE / 'actual-typecheck-a2.json'),
          'compileReceiptSha256': sha(HERE / 'actual-compile-a1.json'),
          'predecessorTypecheckOnly': True,
          'successorTypecheckedByThisFullCompile': True,
          'command': args, 'sources': sources, 'frozenCommandFiles': frozen,
          'nativeObjectCount': 14, 'swiftSourceCount': 48,
          'replacedNativeObject': old_peer[0], 'replacementNativeObject': str(peer),
          'output': str(OUT), 'signed': False, 'executed': False}
(HERE / 'daemon-link-inputs.json').write_text(json.dumps(inputs, indent=2) + '\n')
run = subprocess.run(args, capture_output=True)
(OUT / 'stdout.txt').write_bytes(run.stdout)
(OUT / 'stderr.txt').write_bytes(run.stderr)
result = {'format': 'aux.ui-native-capture-transport.daemon-link.actual.v1',
          'passed': run.returncode == 0, 'exitCode': run.returncode,
          'inputsSha256': sha(HERE / 'daemon-link-inputs.json'), 'output': str(OUT),
          'signed': False, 'executed': False, 'nativeApiExecuted': False,
          'browserFullyLinked': False, 'packageIntegrated': False,
          'migrationActivationAuthorized': False, 'runtimeAcceptance': False}
if run.returncode == 0:
    binary = OUT / 'Aux Daemon'
    symbols = subprocess.run(['/usr/bin/nm', '-gU', str(binary)], check=True, capture_output=True).stdout
    (OUT / 'symbols.txt').write_bytes(symbols)
    required = b'_AuxBeginPreparedUiCapture'
    assert len([line for line in symbols.splitlines() if line.split()[-1:] == [required]]) == 1
    undefined = subprocess.run(['/usr/bin/nm', '-u', str(binary)], check=True, capture_output=True).stdout
    assert required not in undefined
    (OUT / 'undefined.txt').write_bytes(undefined)
    load = subprocess.run(['/usr/bin/otool', '-l', str(binary)], check=True, capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    (OUT / 'load-commands.txt').write_bytes(load)
    result.update({'binarySha256': sha(binary), 'captureEntryDefinitionCount': 1,
                   'captureEntryUndefined': False, 'codeSignatureLoadCommandPresent': False,
                   'symbolsSha256': sha(OUT / 'symbols.txt')})
for path, expected in frozen.items():
    assert sha(path) == expected
(HERE / 'actual-daemon-link-a2.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result), flush=True)
if run.returncode:
    lines = run.stderr.decode(errors='replace').splitlines()
    print('\n'.join(line for line in lines if 'error:' in line or 'undefined' in line.lower() or 'Aux' in line)[:8000], flush=True)
    raise SystemExit(run.returncode)
