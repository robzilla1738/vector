#!/usr/bin/env python3
"""Freeze exact actual95354 lineage and the two reviewed source substitutions."""
import hashlib
import json
import subprocess
from pathlib import Path
H = Path(__file__).resolve().parent
W = H.parents[3]
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
OLD = Path('/private/tmp/aux-native-current-entry-reader-20261023')
OUT = Path('/private/tmp/aux-native-pty-coherent-main-20261023')

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
p = json.loads((W / 'docs/integration/proposed/aux-native-current-entry-reader-build/inputs.json').read_text())
r = json.loads((OLD / 'results.json').read_text())
assert r['passed'] and r['inputsUnchanged'] and (r['results'] == [{'command': 11, 'exitCode': 0}])
assert sha(OLD / 'Aux Daemon') == r['executableSha256'] == '0c335eb4102383f8b9b020fcb2cc7554ddd57ef5957b8549d20eaa60e3c0644e'
files = {str(ROOT / k): v for (k, v) in p['sourceFiles'].items()}
files.update(p['externalReferences'])
files.update({str(Path(p['nodeTree']) / k): v for (k, v) in p['nodeArchives'].items()})
files[str(ROOT / p['nodeReceipt'])] = p['nodeReceiptSha256']
files[str(Path(p['nodeTree']) / 'config.gypi')] = p['nodeConfigSha256']
for name in ['results.json', 'original-verified-plan.json', 'Aux Daemon']:
    files[str(OLD / name)] = sha(OLD / name)
objects = {k: sha(OLD / k) for k in p['objects']}
assert objects == p['objects']
for (k, v) in objects.items():
    files[str(OLD / k)] = v
host = W / 'docs/integration/proposed/aux-native-pty-helper-host/source/AuxDevelopmentWorkerHost.cc'
loader = W / 'docs/integration/proposed/aux-native-authenticated-pty-helper/source/AuxSignedFreshBootstrapPolicyLoader.swift'
headers = [host.with_name('AuxNativePtyReservation.h'), loader.with_name('AuxAuthenticatedPtyHelper.h')]
for f in [host, loader, *headers]:
    files[str(f)] = sha(f)
commands = json.loads((OLD / 'original-verified-plan.json').read_text())['commands']
compile = [v.replace(str(OLD), str(OUT)) for v in commands[2]]
compile[compile.index('-c') + 1] = str(host)
compile[2:2] = ['-I', str(loader.parent), '-MMD', '-MF', str(OUT / 'host.d')]
link = [v.replace(str(OLD), str(OUT)) for v in r['commands'][0]]
oldloader = str(ROOT / 'docs/integration/proposed/aux-native-embedded-pty-policy/source/AuxSignedFreshBootstrapPolicyLoader.swift')
assert link.count(oldloader) == 1
link[link.index(oldloader)] = str(loader)
link += ['-Xlinker', '-no_adhoc_codesign']
assert sum((v.endswith('.swift') for v in link)) == 46
for v in link:
    if v.endswith('.swift'):
        files[v] = sha(Path(v))
reader = [v for v in link if 'AuxSealedNativeDaemonEntry.swift' in v]
assert len(reader) == 1 and sha(Path(reader[0])) == p['readerSha256']
toolPaths = {name: subprocess.check_output(['xcrun', '--find', name], text=True).strip() for name in ['clang++', 'swiftc', 'ld', 'nm', 'otool']}
assert compile[:2] == ['xcrun', 'clang++']
assert link[:2] == ['xcrun', 'swiftc']
compile[:2] = [toolPaths['clang++']]
link[:2] = [toolPaths['swiftc']]
for tool in toolPaths.values():
    files[tool] = sha(Path(tool))
for (path, expected) in files.items():
    assert sha(Path(path)) == expected, path
pins = {
    'format': 'aux.pty-coherent-native-main.inputs.v1',
    'output': str(OUT),
    'priorOutput': str(OLD),
    'frozenFiles': files,
    'reusedObjects': {k: v for (k, v) in objects.items() if k != '2.o'},
    'recompiledObject': '2.o',
    'compile': compile,
    'link': link,
    'nodeArchivesChecked': len(p['nodeArchives']),
    'predecessorSourceFilesChecked': len(p['sourceFiles']),
    'sourceSubstitutions': {'host': str(host), 'policyLoader': str(loader)},
    'fixedReaderPreserved': [v for v in link if 'AuxSealedNativeDaemonEntry.swift' in v],
    'automaticAdHocSigningDisabled': True,
    'toolPaths': toolPaths,
}
(H / 'inputs.json').write_text(json.dumps(pins, indent=2) + '\n')
print('Frozen', len(files), 'inputs; exact10 reused objects; one CPP compile and46Swift link; no executable invocation')
