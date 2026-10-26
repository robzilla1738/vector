"""Apply one finite resource/OS-declaration delta to the unlaunched candidate."""
from pathlib import Path
import argparse
import copy
import importlib.util
import json
import os
import shutil
import sys

sys.dont_write_bytecode = True
parser = argparse.ArgumentParser()
parser.add_argument('plan', type=Path)
parser.add_argument('--plan-sha256', required=True)
args = parser.parse_args()
ROOT = Path('/Users/rcourson/Documents/Vibe/web')
APP = ROOT / 'out/provided-candidate-completion-20261026-a1/Aux.app'
RES = Path('Contents/Resources/aux')
BRAND_CATALOGS = {Path('Contents/Resources/Assets.car'), *(
    Path('Contents/Frameworks/Aux Framework.framework/Versions/155.0.8059.85/Helpers') /
    name / 'Contents/Resources/Assets.car'
    for name in ['Aux Helper (Alerts).app', 'Aux Helper (Aperitif Alerts).app'])}
helper = ROOT / 'docs/integration/proposed/standard-profile-isolation/runtime-package-a1/runtime_package.py'
spec = importlib.util.spec_from_file_location('aux_resource_delta_inventory', helper)
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
require = p.require
plan_ref = p.ref(args.plan)
require(plan_ref['sha256'] == args.plan_sha256, 'Exact reviewed resource delta plan required')
plan = p.read(args.plan)
require(plan['format'] == 'aux.completion.resource-delta-plan.v1' and plan['app'] == str(APP),
        'Exact static successor delta required')
parent_ref = plan['parentReceipt']
require(p.ref(parent_ref['path']) == parent_ref, 'Parent receipt changed')
parent = p.read(parent_ref['path'])
require(parent['passed'] is True and parent['app'] == str(APP) and
        parent['productSigned'] is False and parent['appExecuted'] is False and
        parent['CUlaunchPolicyPending'] is True, 'Unsigned unlaunched predecessor required')
before = p.inventory(APP)
require(before == parent['files'] and p.digest(before) == parent['inventorySha256'],
        'Current candidate differs from the exact predecessor')
rows = {row['path']: row for row in before}
replacements = plan['replacements']
names = [row['relative'] for row in replacements]
require(len(names) == len(set(names)), 'Duplicate replacement destination')
for row in replacements:
    relative = Path(row['relative'])
    require(not relative.is_absolute() and '..' not in relative.parts and str(relative) == row['relative'] and
            (relative.is_relative_to(RES) or relative == Path('Contents/Info.plist') or relative in BRAND_CATALOGS) and
            relative != RES / 'bundle.json', 'Confined declared resource replacement required')
    old = rows[row['relative']]
    require(old['type'] == 'file' and old['sha256'] == row['previousSha256'] and
            old['mode'] == row['mode'] and p.ref(row['source'])['sha256'] == row['sha256'],
            'Replacement preimage/source changed: ' + row['relative'])
    for directory in (APP / relative).parents:
        if directory == APP.parent:
            break
        require(not directory.is_symlink(), 'Replacement crosses a copied symlink')
for item in plan['inputPins']:
    require(p.ref(item['path']) == item, 'Resource composition input changed')
work = APP.parent / plan['receiptDirectory']
require(work.parent == APP.parent and not work.exists() and not work.is_symlink(),
        'Fresh confined resource-delta receipt directory required')
work.mkdir(mode=0o700)
receipt = dict(format='aux.completion.resource-delta.v1', app=str(APP), parentReceipt=parent_ref,
               plan=plan_ref, assemblyExecutor=p.ref(__file__), inventoryHelper=p.ref(helper),
               productSigned=False, appExecuted=False, productExecuted=False, testable=False,
               runtimeAccepted=False, productionReady=False, CUlaunchPolicyPending=True,
               acceptedAppReplaced=False, ownerStateAccessed=False, release=False)
try:
    backups = []
    for relative in [*names, str(RES / 'bundle.json')]:
        target = work / 'preimages' / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(APP / relative, target)
        require(p.sha(target) == rows[relative]['sha256'], 'Preimage backup differs')
        backups.append(dict(relative=relative, preimage=p.ref(target)))
    for row in replacements:
        target = APP / row['relative']
        temporary = target.with_name(target.name + '.aux-resource-delta')
        with temporary.open('xb') as stream:
            stream.write(Path(row['source']).read_bytes())
        temporary.chmod(row['mode'])
        require(p.sha(temporary) == row['sha256'], 'Copied replacement changed')
        os.replace(temporary, target)
    marker = APP / RES / 'bundle.json'
    bundle = p.read(marker)
    records = {row['path']: copy.deepcopy(row) for row in bundle['files']}
    actual_aux = p.inventory(APP / RES)
    require(set(records) == {row['path'] for row in actual_aux if row['path'] != 'bundle.json'},
            'Resource delta cannot add or remove undeclared packaged leaves')
    for leaf in actual_aux:
        if leaf['path'] == 'bundle.json':
            continue
        record = records[leaf['path']]
        require(record['mode'] == leaf['mode'], 'Unplanned packaged permission change')
        if leaf['type'] == 'file':
            record.update(sha256=leaf['sha256'], bytes=(APP / RES / leaf['path']).stat().st_size)
        else:
            require(record['linkTarget'] == leaf['target'], 'Unplanned packaged symlink change')
    bundle['files'] = list(records.values())
    current = bundle['currentCompletionIntegration']
    current.update(resourceDeltaPlan=plan_ref, parentInventorySha256=parent['inventorySha256'],
                   activeManifestSha256=p.digest(bundle['files']),
                   wholeAppInventoryReceipt=str(work / 'receipt.json'))
    bundle.update(fullIdentityComplete=False, runtimeAccepted=False, productionReady=False)
    temporary = marker.with_name(marker.name + '.aux-resource-delta')
    with temporary.open('x') as stream:
        json.dump(bundle, stream, indent=2)
        stream.write('\n')
    temporary.chmod(rows[str(RES / 'bundle.json')]['mode'])
    os.replace(temporary, marker)
    after = p.inventory(APP)
    after_rows = {row['path']: row for row in after}
    allowed = set(names) | {str(RES / 'bundle.json')}
    require({key: value for key, value in rows.items() if key not in allowed} ==
            {key: value for key, value in after_rows.items() if key not in allowed},
            'Unrelated candidate bytes/modes/links changed')
    for row in replacements:
        require(after_rows[row['relative']] == dict(path=row['relative'], type='file',
                    sha256=row['sha256'], mode=row['mode']), 'Final replacement differs')
    for item in plan['inputPins']:
        require(p.ref(item['path']) == item, 'Resource input changed during restaging')
    receipt.update(passed=True, files=after, inventorySha256=p.digest(after), leaves=len(after),
                   replacements=replacements, backups=backups,
                   unrelatedCandidateLeavesPreserved=True, currentManifestSha256=p.digest(bundle['files']))
    p.write_new(work / 'receipt.json', receipt)
except Exception as error:
    p.write_new(work / 'failure.json', dict(receipt, passed=False, error=str(error)))
    raise
print(json.dumps({'passed': True, 'receipt': p.ref(work / 'receipt.json'),
                  'inventorySha256': receipt['inventorySha256'], 'replacements': len(replacements)}))
