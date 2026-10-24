#!/usr/bin/env python3
"""Pair and assemble the exact inactive memory-v2/Computer Use successor."""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
SCOPE = HERE.parent
BASE = ROOT / 'out/provided-candidate-standard-profile-resources-20261024'
OUT = ROOT / 'out/provided-candidate-standard-profile-runtimes-20261024'
RES = Path('Contents/Resources/aux')
DAEMON = 'apps/daemon/Aux Daemon.app/Contents/'
SOURCE = DAEMON + 'Resources/node-development/index.mjs'
ENTRY = DAEMON + 'Resources/node-development/aux-native-entry.mjs'
HELPER = 'apps/computer-use/Aux Computer Use.app/Contents/MacOS/aux-computer-use'
FLAGS = ['testable', 'runtimeAuthorityGranted', 'appExecuted', 'productSigned', 'acceptedAppReplaced']
LEGACY = ROOT / 'docs/integration/proposed/profile-isolation-delivery/package/assemble.py'
spec = importlib.util.spec_from_file_location('runtime_inventory', LEGACY)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
inventory, digest = module.inventory, module.digest


def require(value, message):
    if not value:
        raise ValueError(message)


def sha(path):
    value = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            value.update(chunk)
    return value.hexdigest()


def read(path):
    return json.loads(Path(path).read_text())


def write_new(path, value):
    with Path(path).open('x') as stream:
        stream.write(json.dumps(value, indent=2) + '\n')


def ref(path):
    path = Path(path).absolute()
    require(path.is_file() and not path.is_symlink(), 'Regular frozen input required: ' + str(path))
    return dict(path=str(path), sha256=sha(path))


def pin(item):
    require(ref(item['path']) == item, 'Frozen input changed: ' + item['path'])
    return Path(item['path'])


def base_receipt():
    require(sha(BASE/'receipt.json') == 'edbae95a34ffe128f11781248cf2026934b5a2e01de52cb28ab95e6f08d9edcd',
            'Exact completed resource predecessor required')
    receipt = read(BASE/'receipt.json')
    require(receipt['passed'] is True and all(receipt[key] is False for key in FLAGS), 'Inactive predecessor required')
    require(digest(receipt['files']) == receipt['inventorySha256'] ==
            '34a31e763be5c1aa110d36f2e69294439bb7e230b5e04b9ddaea476e59ea6c9d', 'Predecessor inventory differs')
    require(inventory(BASE/'Aux.app') == receipt['files'], 'Actual predecessor app differs')
    return receipt


def replay(text, anchors):
    for item in anchors:
        require(isinstance(item['count'], int) and item['count'] > 0 and
                text.count(item['find']) == item['count'], 'Counted memory integration differs')
        text = text.replace(item['find'], item['replace'])
    return text


def prepare():
    require(not OUT.exists() and not (HERE/'review.json').exists(), 'Fresh output/review required')
    receipt = base_receipt()
    base = BASE/'Aux.app'/RES
    entries = {item['path']: item for item in receipt['files']}
    memory = SCOPE/'memory-runtime-v2-a1'
    inputs = [ref(__file__), ref(LEGACY), ref(BASE/'receipt.json'), ref(SCOPE/'resource-package-a1/source-pair.json')]
    replacements, moves, removals = [], [], []

    def previous(relative):
        item = entries[str(RES/relative)]
        require(item['type'] == 'file', 'Regular predecessor required')
        return item

    def replace(relative, source):
        old, item = previous(relative), ref(source)
        require(old['sha256'] != item['sha256'], 'Unchanged replacement refused')
        inputs.append(item)
        replacements.append(dict(path=relative, previousSha256=old['sha256'], input=item, mode=old['mode']))

    projection_path = memory/'actual-projection-a1.json'
    projection = read(projection_path)
    require(projection['passed'] is True and projection['totalAnchorCountPerLeaf'] == 216 and
            projection['appendedAnchorCountPerLeaf'] == 17 and projection['nativeApiChanged'] is False and
            projection['originalIndependentEntryMatches'] is True and projection['productExecuted'] is False,
            'Complete independently projected v7 source required')
    projection_root = Path(projection['output'])
    inputs += [ref(projection_path), ref(memory/'source/anchors.json'), ref(projection_root/'composition.json'),
               ref(projection_root/'source-receipt.json'), ref(projection_root/'projected-entry/results.json')]
    require(sha(projection_root/'composition.json') == projection['compositionSha256'] and
            sha(projection_root/'source-receipt.json') == projection['sourceReceiptSha256'] and
            sha(projection_root/'projected-entry/results.json') == projection['entryReceiptSha256'], 'Projection receipt changed')
    anchors = read(memory/'source/anchors.json')
    require(len(anchors) == 9 and sum(item['count'] for item in anchors) == 17, 'Exact memory source delta required')
    old_pair = read(SCOPE/'resource-package-a1/source-pair.json')
    for kind, relative, name in [('source', SOURCE, 'index.mjs'), ('entry', ENTRY, 'projected-entry/aux-native-entry.mjs')]:
        source = projection_root/name
        require(sha(base/relative) == old_pair[kind+'Sha256'], 'Predecessor source pair differs')
        require(replay((base/relative).read_text(), anchors).encode() == source.read_bytes(), 'Independent memory anchor replay differs')
        require(sha(source) == projection[kind+'Sha256'], 'Projected source hash differs')
        require(b'native/memory-bootstrap.cjs' not in source.read_bytes(), 'Legacy bootstrap caller retained')
        replace(relative, source)
    source_receipt = read(projection_root/'source-receipt.json')
    entry_receipt = read(projection_root/'projected-entry/results.json')
    require(source_receipt['passed'] is True and source_receipt['coldRefusalPreserved'] is True and
            source_receipt['nativeAbiChanged'] is False and entry_receipt['passed'] is True and
            entry_receipt['defaultEntryRefusalPreserved'] is True and entry_receipt['executed'] is False and
            entry_receipt['sourceSha256'] == projection['sourceSha256'] and
            entry_receipt['entrySha256'] == projection['entrySha256'] and
            entry_receipt['loaderSha256'] == old_pair['loaderSha256'] == projection['loaderSha256'], 'Dormant-entry association differs')
    composition = read(projection_root/'composition.json')
    for item in composition['currentMemoryInputs']:
        pin(item)
        inputs.append(item)
    for kind, relative in [('daemon', DAEMON+'MacOS/aux-daemon'), ('loader', DAEMON+'Resources/native/aux-owned-native.cjs'),
                           ('pty', DAEMON+'Resources/native/node-pty/prebuilds/darwin-arm64/pty.node')]:
        require(sha(base/relative) == old_pair[kind+'Sha256'], 'Retained native tuple differs: '+kind)

    stage_actual = read(memory/'actual-static-stage-a1.json')
    manifest = Path(stage_actual['manifestPath'])
    require(stage_actual['passed'] is True and stage_actual['componentCoverageRecheckedAfterExternalManifestPlacement'] is True and
            sha(manifest) == stage_actual['manifestSha256'], 'Complete external-manifest memory stage required')
    # Reuse the actual standalone format-aware checker, without staging all unrelated runtimes.
    command = '''import fs from 'node:fs/promises';
import {verifyAuxMemoryV2Stage} from './vendor/provided/aux-memory-runtime-v2-stage.mjs';
const report=JSON.parse(await fs.readFile(process.argv[1],'utf8'));
const pinned=JSON.parse(await fs.readFile('docs/source/provided-runtime-inputs.json','utf8')).components.memory;
await verifyAuxMemoryV2Stage({input:{...pinned,inputRoot:report.inputRoot},outputRoot:report.outputRoot,report});'''
    subprocess.run(['node', '--input-type=module', '-e', command, str(manifest)], cwd=ROOT, check=True)
    memory_report = read(manifest)
    inputs += [ref(memory/'actual-static-stage-a1.json'), ref(manifest), ref(memory/'source/stage-plan.json'),
               ref(ROOT/'vendor/provided/aux-memory-runtime-v2-stage.mjs')]
    for file in memory_report['files']:
        if file['type'] != 'file':
            continue
        old_path, new_path = 'memory-distribution/'+file['sourcePath'], 'memory-distribution/'+file['path']
        old = previous(old_path)
        require(old['sha256'] == file['sourceSha256'] and old['mode'] == file['mode'], 'Original packaged memory provenance differs')
        source = Path(stage_actual['outputRoot'])/file['path']
        require(sha(source) == file['outputSha256'], 'Staged memory payload changed')
        if old_path != new_path:
            require(str(RES/new_path) not in entries, 'Memory destination already exists')
            item = ref(source)
            inputs.append(item)
            moves.append(dict(previousPath=old_path, path=new_path, previousSha256=old['sha256'], input=item, mode=old['mode']))
        elif old['sha256'] != file['outputSha256']:
            replace(new_path, source)

    helper_path = SCOPE/'computer-use-module-identity-a1/actual-stage-a1.json'
    helper = read(helper_path)
    helper_root = Path(helper['outputRoot'])
    helper_manifest = helper_root.parent/'manifest.json'
    require(helper['passed'] is True and helper['productExecuted'] is False and helper['signed'] is False and
            helper['differences'] == ['Contents/MacOS/aux-computer-use'] and
            sha(helper_manifest) == helper['manifestSha256'], 'Exact Computer Use stage required')
    for record in read(helper_manifest)['files']:
        if record['path'] == 'Contents/MacOS/aux-computer-use':
            continue
        require(sha(helper_root/record['path']) == record['outputSha256'] ==
                sha(base/'apps/computer-use/Aux Computer Use.app'/record['path']), 'Unrelated helper resource differs')
    inputs += [ref(helper_path), ref(helper_manifest), ref(SCOPE/'computer-use-module-identity-a1/source/patch-plan.json')]
    require(sha(helper_root/'Contents/MacOS/aux-computer-use') == helper['binarySha256'], 'Helper binary association differs')
    replace(HELPER, helper_root/'Contents/MacOS/aux-computer-use')
    for name in ['memory-bootstrap.cjs', 'memory-seed.cjs', 'memory-pins.json']:
        relative = DAEMON+'Resources/native/'+name
        old = previous(relative)
        removals.append(dict(path=relative, previousSha256=old['sha256'], reason='Replaced by fixed native-owned memory-v2 source/seed integration'))
    require(len(replacements) == 4 and len(moves) == 3 and len(removals) == 3, 'Exact finite runtime successor required')
    pair = copy.deepcopy(old_pair)
    pair.update(source=str(projection_root/'index.mjs'), sourceSha256=projection['sourceSha256'],
                entry=str(projection_root/'projected-entry/aux-native-entry.mjs'), entrySha256=projection['entrySha256'],
                sourceCompositionReceiptSha256=projection['compositionSha256'], sourceReceiptSha256=projection['sourceReceiptSha256'],
                entryReceiptSha256=projection['entryReceiptSha256'], predecessorSourcePairSha256=sha(SCOPE/'resource-package-a1/source-pair.json'),
                nativeAbiChanged=False, nativeHostApiChanged=False, pairedModuleAbiChanged=False, nativePairingPending=False,
                pairProducer=ref(__file__), pairingScope='Existing broker/root API; unchanged native tuple, independent exact memory-v2 entry projection; no runtime acceptance')
    write_new(HERE/'source-pair.json', pair)
    inputs.append(ref(HERE/'source-pair.json'))
    paths = json.loads(subprocess.check_output(['node', '--input-type=module', '-e',
        "import {providedStageInputs} from './scripts/lib/provided-stage-inputs.mjs';process.stdout.write(JSON.stringify(providedStageInputs))"], cwd=ROOT, text=True))
    adaptation = [ref(ROOT/path) for path in paths]
    inputs += adaptation
    unique = {}
    for item in inputs:
        require(item['path'] not in unique or unique[item['path']] == item, 'Conflicting frozen input')
        unique[item['path']] = item
    write_new(HERE/'review.json', dict(format='aux.exact-runtime-successor.review.v1', base=str(BASE/'Aux.app'), output=str(OUT),
        baselineReceipt=ref(BASE/'receipt.json'), baselineInventorySha256=receipt['inventorySha256'], inputs=list(unique.values()),
        replacements=replacements, moves=moves, removals=removals, sourcePair=ref(HERE/'source-pair.json'),
        memoryStage=ref(manifest), helperStage=ref(helper_manifest), composition=ref(projection_root/'composition.json'),
        adaptationInputs=adaptation, **{key:False for key in FLAGS}))
    print('Prepared exact memory-v2/Computer Use package; native tuple and UI unchanged', flush=True)


def metadata(bundle, review):
    pair = read(pin(review['sourcePair']))
    previous_digest = digest(bundle)
    records = {item['path']:item for item in bundle['files']}
    require(len(records) == len(bundle['files']), 'Duplicate metadata path')
    for item in review['replacements']:
        record = records[item['path']]
        require(record['sha256'] == item['previousSha256'], 'Metadata replacement predecessor differs')
        record.update(sha256=item['input']['sha256'], mode=item['mode'], changeKinds=['identity', 'integration'])
    for item in review['moves']:
        record = records.pop(item['previousPath'])
        require(record['sha256'] == item['previousSha256'], 'Metadata move predecessor differs')
        record.update(path=item['path'], sha256=item['input']['sha256'], mode=item['mode'], changeKinds=['identity', 'integration'],
                      source='distribution/memory/'+item['path'].removeprefix('memory-distribution/'), previousSource=record.get('source'))
        records[item['path']] = record
    for item in review['removals']:
        record = records.pop(item['path'])
        require(record['sha256'] == item['previousSha256'], 'Metadata removal predecessor differs')
        bundle['excludedFiles'].append(dict(source=item['path'], sha256=item['previousSha256'], reason=item['reason']))
    bundle['files'] = sorted(records.values(), key=lambda item:item['path'])
    for component in bundle['components']:
        if component['target'] == 'apps/daemon/Aux Daemon.app':
            component['records'] -= 3
    bundle.update(finalApp=str(OUT/'Aux.app'), productionReady=False,
                  adaptationInputsScope='Historical source stage; current paired runtime integration inputs are in runtimeSuccessorIntegration')
    entry = bundle['nativeEntryProjection']
    entry.update(sourceSha256=pair['sourceSha256'], sourceReceiptSha256=pair['sourceReceiptSha256'], entryReceiptSha256=pair['entryReceiptSha256'])
    for item in entry['files']:
        if item['path'] == ENTRY:
            item.update(sha256=pair['entrySha256'], bytes=Path(pair['entry']).stat().st_size)
    bundle['finalLocalNativeReplacement']['nativeEntryProjection'] = copy.deepcopy(entry)
    for field in ['finalLocalNativeReplacement', 'successorIntegration', 'browserFeatureIntegration']:
        for item in bundle[field].get('replacements', []):
            for change in review['replacements']:
                if item['path'] == change['path']:
                    item.update(input=change['input']['path'], sha256=change['input']['sha256'])
    bundle['successorIntegration'].update(sourcePairSha256=review['sourcePair']['sha256'], predecessorMetadataSha256=previous_digest,
        historyScope='Earlier native/resource integration; current runtime-v2/source association is recorded below')
    bundle['browserFeatureIntegration']['daemonComposition'] = review['composition']
    bundle['resourceSuccessorIntegration']['historyScope'] = 'Completed preceding resource successor; retained for provenance, superseded paths are recorded in runtimeSuccessorIntegration'
    bundle['runtimeSuccessorIntegration'] = dict(format='aux.inactive-runtime-successor.v1', review=ref(HERE/'review.json'),
        predecessorReceipt=review['baselineReceipt'], predecessorMetadataSha256=previous_digest, sourcePair=review['sourcePair'],
        memoryStage=review['memoryStage'], helperStage=review['helperStage'], replacements=review['replacements'], moves=review['moves'],
        removed=review['removals'], currentAdaptationInputs=review['adaptationInputs'], **{key:False for key in FLAGS})
    return bundle


def changed_paths(review):
    return {str(RES/'bundle.json')} | {str(RES/item['path']) for item in review['replacements']+review['removals']} | \
        {str(RES/item[key]) for item in review['moves'] for key in ['path','previousPath']}


def verify_delta(before, after, review):
    changed = changed_paths(review)
    require([item for item in before if item['path'] not in changed] ==
            [item for item in after if item['path'] not in changed], 'Unrelated native/CLI/UI/runtime leaf changed')
    require(len(after) == len(before)-3, 'Unexpected runtime file coverage')
    actual = {item['path']:item for item in after}
    for item in review['replacements']+review['moves']:
        require(actual[str(RES/item['path'])] == dict(path=str(RES/item['path']), type='file',
                sha256=item['input']['sha256'], mode=item['mode']), 'Changed runtime leaf differs')
    require(all(str(RES/item['path']) not in actual for item in review['removals']) and
            all(str(RES/item['previousPath']) not in actual for item in review['moves']), 'Obsolete runtime leaf retained')


def assemble():
    review = read(HERE/'review.json')
    require(review['format'] == 'aux.exact-runtime-successor.review.v1' and review['base'] == str(BASE/'Aux.app') and
            review['output'] == str(OUT) and not OUT.exists(), 'Fresh reserved successor required')
    for item in review['inputs']:
        pin(item)
    before = base_receipt()['files']
    temporary = Path(tempfile.mkdtemp(prefix='.aux-runtime-successor-', dir=OUT.parent))
    try:
        app = temporary/'Aux.app'
        shutil.copytree(BASE/'Aux.app', app, symlinks=True)
        require(inventory(app) == before, 'Copied predecessor differs before overlay')
        for item in review['replacements']+review['moves']:
            previous = item.get('previousPath', item['path'])
            old, target = app/RES/previous, app/RES/item['path']
            require(old.is_file() and not old.is_symlink() and sha(old) == item['previousSha256'], 'Actual predecessor leaf differs')
            if previous != item['path']:
                require(not target.exists(), 'New runtime leaf already exists')
                old.unlink()
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(pin(item['input']), target)
            target.chmod(item['mode'])
        for item in review['removals']:
            target = app/RES/item['path']
            require(target.is_file() and not target.is_symlink() and sha(target) == item['previousSha256'], 'Seed helper removal differs')
            target.unlink()
        marker = app/RES/'bundle.json'
        marker.write_text(json.dumps(metadata(read(marker), review), indent=2)+'\n')
        after = inventory(app)
        verify_delta(before, after, review)
        actual = {item['path']:item for item in after}
        for item in read(marker)['files']:
            leaf = actual.get(str(RES/item['path']))
            kind = 'link' if item['type'] == 'symlink' else item['type']
            require(leaf is not None and leaf['type'] == kind and ('mode' not in item or leaf['mode'] == item['mode']) and
                    (leaf.get('sha256') == item.get('sha256') if kind == 'file' else
                     leaf['target'] == item.get('linkTarget', item.get('target'))), 'Delivered metadata differs: '+item['path'])
        for item in review['inputs']:
            pin(item)
        result = dict(format='aux.exact-runtime-successor.inactive-package.v1', passed=True, reviewSha256=sha(HERE/'review.json'),
            predecessorReceiptSha256=review['baselineReceipt']['sha256'], sourcePairSha256=review['sourcePair']['sha256'],
            files=after, inventorySha256=digest(after), exactReplacements=4, exactRelocations=3, exactSeedHelperRemovals=3,
            nativeBrowserDaemonPtyLoaderAndCliUnchanged=True, allUiCssAssetsUnchanged=True, **{key:False for key in FLAGS})
        write_new(temporary/'receipt.json', result)
        temporary.rename(OUT)
        write_new(HERE/'actual-package.json', dict(format='aux.runtime-package.actual.v1', passed=True, app=str(OUT/'Aux.app'),
            receipt=ref(OUT/'receipt.json'), inventorySha256=result['inventorySha256'], leaves=len(after),
            exactReplacements=4, exactRelocations=3, exactSeedHelperRemovals=3, **{key:False for key in FLAGS}))
        print('Assembled inactive runtime successor; UI unchanged, no app execution or signing', flush=True)
    except Exception as error:
        write_new(temporary/'failure.json', dict(passed=False, error=str(error), productExecuted=False, testable=False))
        print('Failed candidate retained at '+str(temporary), file=sys.stderr)
        raise


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['prepare','assemble'])
    args = parser.parse_args()
    (prepare if args.command == 'prepare' else assemble)()
