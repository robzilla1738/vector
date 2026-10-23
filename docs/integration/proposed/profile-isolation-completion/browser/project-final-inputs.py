#!/usr/bin/env python3
"""Project the frozen final successor only after a successful coherent base build.

Run under scripts/native-build.py after the queued focused native check completes.
This does not execute GN, build, sign, or run the product.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path

p = argparse.ArgumentParser()
p.add_argument('--snapshot', required=True)
p.add_argument('--repository', required=True)
p.add_argument('--base-receipt', required=True)
a = p.parse_args()
root = Path(a.snapshot).resolve()
source = root / 'src'
repo = Path(a.repository).resolve()
if root != Path('/private/tmp/aux-chromium-recovery-snapshot-20261023'):
    raise SystemExit('Only the reviewed isolated snapshot may be changed')
sha = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
load = lambda path: json.loads(path.read_text())
base = root / a.base_receipt / 'receipt.json'
if base.parent.parent != root or not load(base).get('passed'):
    raise SystemExit('Successful coherent base receipt required')
output = root / 'final-native-input-pins.json'
if output.exists():
    raise SystemExit('Final projection already recorded; inspect instead of overwriting')
proposal = repo / 'docs/integration/proposed/profile-isolation-custody'
barrier = proposal / 'barrier'
patches = load(barrier / 'sources.json')
gn = load(barrier / 'integration/gn-registration.json')
changes = []
for name, entry in patches.items():
    changes.append((name, entry['before'], entry['after'], barrier / 'source' / name))
changes.append((gn['path'], gn['beforeSha256'], gn['afterSha256'],
                barrier / 'integration' / gn['source']))

prepared = load(root / 'build-preparation.json')
pins = {name: digest for name, digest in prepared['sharedBaseline'].items() if digest}
pins.update(prepared['changes'])
custody = load(root / 'custody-source-receipt.json')
for name, entry in custody.items():
    pins['chrome/browser/aux/' + name] = entry['afterSHA256']
for entries in load(root / 'children-messaging-source-receipt.json').values():
    for name, entry in entries.items():
        pins[name] = entry['after']
for entry in load(proposal / 'integration/gn-registration.json')['files']:
    pins[entry['path']] = entry['afterSha256']
# Check every predecessor and every source before the first mutation.
for name, digest in pins.items():
    path = source / name
    if path.is_symlink() or not path.is_file() or sha(path) != digest:
        raise SystemExit('Existing composed source differs: ' + name)
for name, before, after, supplied in changes:
    if sha(source / name) != before or supplied.is_symlink() or sha(supplied) != after:
        raise SystemExit('Final successor does not match: ' + name)
activation = load(root / 'approved-host-tool-filter-activation.json')
for name, key in [('build/toolchain/apple/linker_driver.py', 'linkerDriverSHA256'),
                  ('build/toolchain/apple/aux_host_link_filter.py', 'filterSHA256'),
                  ('build/rust/gni_impl/rustc_wrapper.py', 'rustWrapperSHA256')]:
    if sha(source / name) != activation[key]:
        raise SystemExit('Approved build-tool guard differs: ' + name)
    pins[name] = activation[key]
for name in ['host-output-allowlist.json', 'host-proc-macro-allowlist.json',
             'excluded-product-outputs.json']:
    path = source / 'build/toolchain/apple' / name
    pins[str(path.relative_to(source))] = sha(path)
pins['build/config/mac/BUILD.gn'] = sha(source / 'build/config/mac/BUILD.gn')
for name, before, after, supplied in changes:
    destination = source / name
    temporary = destination.with_name(destination.name + '.aux-final-projection')
    if temporary.exists():
        raise SystemExit('Unexpected projection temporary file')
    temporary.write_bytes(supplied.read_bytes())
    temporary.chmod(destination.stat().st_mode & 0o777)
    os.replace(temporary, destination)
    pins[name] = after
# Preserve the historical receipt separately; the successor receipt is explicit.
record = {
    'format': 'aux.chromium.final-native-inputs.v1',
    'files': dict(sorted(pins.items())),
    'baseBuildReceiptSha256': sha(base),
    'barrierSourceMapSha256': sha(barrier / 'sources.json'),
    'barrierGnMapSha256': sha(barrier / 'integration/gn-registration.json'),
    'hostToolApprovalActivationSha256': sha(root / 'approved-host-tool-filter-activation.json'),
    'successorProjection': [{'path': n, 'before': b, 'after': c} for n,b,c,_ in changes],
    'requiresFreshGnAndCommandReview': True,
    'productSigned': False,
    'appExecuted': False,
}
for name, digest in pins.items():
    if sha(source / name) != digest:
        raise SystemExit('Post-projection mismatch: ' + name)
output.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps({'manifest': str(output), 'sha256': sha(output), 'inputCount': len(pins)}))
