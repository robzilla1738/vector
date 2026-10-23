#!/usr/bin/env python3
"""Compose exact checked source/object successors into one inactive link plan."""
import hashlib
import json
import sys
from pathlib import Path

H = Path(__file__).resolve().parent
R = H.parents[4]
def read(path):
    return json.loads(Path(path).read_text())
def sha(path):
    with open(path, 'rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()

broker_receipt = Path(sys.argv[1]).resolve()
broker = read(broker_receipt)
assert broker['passed'] and broker['inputsUnchanged']
base_path = R / 'docs/integration/proposed/final-completion/native-build/inputs.json'
base = read(base_path)
roots_path = R / 'docs/integration/proposed/profile-isolation-next/browser-roots/evidence/native-compile.json'
roots = read(roots_path)
assert roots['passed'] and roots['inputsUnchanged']
archives = read(H / 'evidence/archives.json')
pty = read(H / 'evidence/pty-link.json')
assert archives['passed'] and pty['passed'] and pty['codeSignatureAbsent']
out = Path('/private/tmp/aux-profile-continuation-link-20261023')
assert not out.exists()
objects = {name: item['source'] for name, item in base['objectInputs'].items()}
expected = {item['source']: item['sha256'] for item in base['objectInputs'].values()}
host_command = next(c['command'] for c in broker['commands'] if c['name'] == 'worker-host')
objects['2.o'] = host_command[host_command.index('-o') + 1]
expected[objects['2.o']] = broker['objectSha256']
for key, role in [('9.o','daemon-AuxNativePeerTransport'), ('10.o','daemon-AuxNativeParentConnectionBridge'), ('11.o','daemon-AuxBrowserPrivateRoots')]:
    command = next(c['command'] for c in roots['commands'] if c['name'] == role)
    objects[key] = command[command.index('-o') + 1]
    expected[objects[key]] = roots['objectHashes'][role]
swift_command = next(c['command'] for c in broker['commands'] if c['name'] == 'swift-whole-module')
swift = [v for v in swift_command if v.endswith('.swift')]
assert len(swift) == 47 and len(set(Path(v).name for v in swift)) == 47
swift_by_name = {Path(v).name: v for v in swift}
archive_by_name = {Path(a['path']).name: a for a in archives['archives']}
extra_archive_manifest = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else None
if extra_archive_manifest:
    extra = read(extra_archive_manifest)
    assert extra['passed'] and extra['version'] == '1.2.1'
    assert extra['deploymentTarget'] == '13.5'
    assert Path(extra['path']).name == 'libbrotli.a'
    archive_by_name['libbrotli.a'] = extra
link = []
for value in base['link']:
    name = Path(value).name
    if value.endswith('.swift'):
        link.append(swift_by_name.pop(name))
    elif value.endswith('.o'):
        link.append(objects[name])
    elif value.endswith('.a') and name in archive_by_name:
        link.append(archive_by_name[name]['path'])
    else:
        link.append(value.replace(base['output'], str(out)))
assert set(swift_by_name) == {'AuxNativeTaskLayout.swift'}
link.extend([swift_by_name['AuxNativeTaskLayout.swift'], objects['11.o']])
assert link.count('-no_adhoc_codesign') == 1
assert sum(v.endswith('.swift') for v in link) == 47
assert sum(v.endswith('.o') for v in link) == 12
frozen = dict(broker['frozenFiles'])
for value in link:
    if value.endswith(('.a', '.swift', '.o')):
        digest = sha(value)
        if value.endswith('.a'):
            entry = archive_by_name.get(Path(value).name)
            pin = entry['sha256'] if entry else base['frozenFiles'][value]
        elif value.endswith('.o'):
            pin = expected[value]
        else:
            pin = broker['frozenFiles'][value]
        assert digest == pin, value
        frozen[value] = digest
for path in [base_path, roots_path, broker_receipt, H / 'evidence/archives.json', H / 'evidence/pty-link.json', H / 'prepare-daemon.py', H / 'link-daemon.py']:
    frozen[str(path)] = sha(path)
frozen[pty['module']] = pty['moduleSha256']
if extra_archive_manifest:
    frozen[str(extra_archive_manifest)] = sha(extra_archive_manifest)
pins = dict(format='aux.profile-isolation.continuation.link-inputs.v1', output=str(out),
            commands=[link], frozenFiles=frozen, module=pty['module'],
            dyldInfo=base['tools']['dyld_info'], otool=base['tools']['otool'],
            nm=base['tools']['nm'],
            privateDefinitions=base['swiftInternalDefinitions']+['_AuxNativeContextCopyStorageRoots'],
            swiftSourceCount=47, nativeObjectCount=12, acceptedAppChanged=False,
            policyFormat='aux.fresh.bootstrap.policy.v6', activated=False,
            staticBrotliSourceVersion='1.2.1' if extra_archive_manifest else '1.2.0',
            staticBrotliUpgradePending=extra_archive_manifest is None)
(H / 'daemon-inputs.json').write_text(json.dumps(pins, indent=2) + '\n')
print('Prepared pinned47-source/12-object unsigned link; not activated or release-ready')
