"""Bind the completed identity, canonical icon and minimum-OS source joins."""
from pathlib import Path
import argparse
import hashlib
import json

ROOT = Path('/Users/rcourson/Documents/Vibe/web')
HERE = Path(__file__).resolve().parent
APP = ROOT / 'out/provided-candidate-completion-20261026-a1/Aux.app'
parser = argparse.ArgumentParser()
parser.add_argument('--catalog-receipt', type=Path)
parser.add_argument('--parent-receipt', type=Path, default=APP.parent / 'receipt.json')
parser.add_argument('--paired-receipt', type=Path, default=HERE / 'paired-source-a8.json')
parser.add_argument('--ui-receipt', type=Path, default=HERE / 'ui-source-a5.json')
parser.add_argument('--extension-receipt', type=Path, default=HERE / 'extension-source-a1.json')
parser.add_argument('--declaration-receipt', type=Path)
parser.add_argument('--receipt-directory', default='pre-sign-resource-delta-a2')
parser.add_argument('--output', type=Path, required=True)
args = parser.parse_args()
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
inputs = {}


def ref(path):
    path = Path(path).resolve(strict=True)
    if not path.is_file() or path.is_symlink():
        raise ValueError('Pinned regular input required')
    item = {'path': str(path), 'sha256': sha(path)}
    if item['path'] in inputs and inputs[item['path']] != item:
        raise ValueError('Conflicting source pin')
    inputs[item['path']] = item
    return item


def load(path):
    item = ref(path)
    return json.loads(Path(item['path']).read_text())


parent_ref = ref(args.parent_receipt)
parent = load(parent_ref['path'])
if parent['passed'] is not True or parent['productSigned'] or parent['appExecuted'] or parent['app'] != str(APP):
    raise ValueError('Exact unsigned unlaunched assembly required')
old = {row['path']: row for row in parent['files']}
replacements = {}


def add(relative, source, expected):
    item = ref(source)
    if item['sha256'] != expected:
        raise ValueError('Generated output changed: ' + item['path'])
    previous = old[relative]
    if previous['type'] != 'file' or sha(APP / relative) != previous['sha256']:
        raise ValueError('Current resource preimage changed: ' + relative)
    if previous['sha256'] == expected:
        return
    if relative in replacements:
        raise ValueError('Duplicate resource destination')
    replacements[relative] = dict(relative=relative, source=item['path'], sha256=expected,
                                  previousSha256=previous['sha256'], mode=previous['mode'])


core = load(args.paired_receipt)
ui = load(args.ui_receipt)
extension = load(args.extension_receipt)
for receipt in [core, ui, extension]:
    if receipt['passed'] is not True:
        raise ValueError('Completed source composition required')
    for generator in receipt['generators']:
        if ref(ROOT / generator['path'])['sha256'] != generator['sha256']:
            raise ValueError('Composition generator changed')
core_paths = {
    'index.mjs': 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/index.mjs',
    'aux-native-entry.mjs': 'Contents/Resources/aux/apps/daemon/Aux Daemon.app/Contents/Resources/node-development/aux-native-entry.mjs',
    'background.js': 'Contents/Resources/aux/apps/extension/dist/background.js'}
if {Path(row['path']).name for row in core['files']} != set(core_paths):
    raise ValueError('Complete paired entry and Agent background required')
for row in core['files']:
    add(core_paths[Path(row['path']).name], row['path'], row['outputSha256'])
for receipt in [ui, extension]:
    for row in receipt['files']:
        add(row['path'], row['output'], row['outputSha256'])
if args.catalog_receipt:
    catalog = load(args.catalog_receipt)
    if catalog['format'] != 'aux.canonical-icon-catalog.build.v1' or not catalog['passed'] or catalog['appChanged']:
        raise ValueError('Actual isolated canonical catalog build required')
    for item in [*catalog['sources'], *catalog['sourceMetadata'], catalog['generator'], *catalog['rasters']]:
        if ref(item['path']) != item:
            raise ValueError('Canonical icon lineage changed')
    for row in catalog['replacements']:
        if row['previousSha256'] != old[row['path']]['sha256']:
            raise ValueError('Icon catalog preimage changed')
        add(row['path'], row['input'], row['sha256'])
if args.declaration_receipt:
    declaration = load(args.declaration_receipt)
    if declaration['applied'] or declaration['minimum'] != '27.0.0' or not declaration['otherPlistValuesPreserved']:
        raise ValueError('Exact unapplied derived OS/type-description proposal required')
    if ref(declaration['actualMachOAudit']['path']) != declaration['actualMachOAudit']:
        raise ValueError('Actual compatibility audit changed')
    add('Contents/Info.plist', declaration['output'], declaration['outputSha256'])
ref(__file__)
ref(HERE / 'restage-resources.py')
result = dict(format='aux.completion.resource-delta-plan.v1', app=str(APP),
              parentReceipt=parent_ref, receiptDirectory=args.receipt_directory,
              replacements=list(replacements.values()), inputPins=list(inputs.values()),
              nativeExecutableChanges=False, profileOrCredentialMigration=False,
              signed=False, executed=False, runtimeAccepted=False)
with args.output.open('x') as stream:
    json.dump(result, stream, indent=2)
    stream.write('\n')
print(json.dumps({'plan': str(args.output.resolve()), 'sha256': sha(args.output),
                  'replacements': len(replacements), 'executed': False}))
