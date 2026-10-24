#!/usr/bin/env python3
"""Exact inactive resource successor of the completed v11 app; never launch/sign."""
import argparse
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
SCOPE = HERE.parent
BASE = ROOT / 'out/provided-candidate-standard-profile-finish-20261024'
OUT = ROOT / 'out/provided-candidate-standard-profile-resources-20261024'
RES = Path('Contents/Resources/aux')
DAEMON = 'apps/daemon/Aux Daemon.app/Contents/'
SOURCE = DAEMON + 'Resources/node-development/index.mjs'
ENTRY = DAEMON + 'Resources/node-development/aux-native-entry.mjs'
ADDON = DAEMON + 'Resources/native/provided-native.node'
SKILL = DAEMON + 'Resources/static/skills/builtin/chrome/SKILL.md'
UI = ['assets/-types-Wy38XkNB.js', 'assets/queries-ldd77hNk.js',
      'background.js', 'content/content.js', 'manifest.json']
FLAG_KEYS = ['testable', 'runtimeAuthorityGranted', 'appExecuted',
             'productSigned', 'acceptedAppReplaced']
LEGACY = ROOT / 'docs/integration/proposed/profile-isolation-delivery/package/assemble.py'
spec = importlib.util.spec_from_file_location('resource_inventory', LEGACY)
inventory_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(inventory_module)
inventory, digest = inventory_module.inventory, inventory_module.digest


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


def no_links(path, root):
    require(path.is_relative_to(root), 'Path escapes reviewed root')
    for part in [root, *list(path.parents)[:len(path.relative_to(root).parts)-1], path]:
        require(not part.is_symlink(), 'Linked resource input: ' + str(part))


def base_receipt():
    path = BASE / 'receipt.json'
    require(sha(path) == '098761236ab2507fccc0151d49f95b2f4646f69b4e26f1199badcae902853a6f',
            'Exact completed v11 package receipt required')
    receipt = read(path)
    require(receipt['passed'] is True and all(receipt[key] is False for key in FLAG_KEYS),
            'Inactive unexecuted base required')
    require(digest(receipt['files']) == receipt['inventorySha256'] ==
            '2996f0f4c6fdf7352d1c653cfaa777c9933076e79f38a284e6a67ea1554e3157',
            'Completed original inventory differs')
    require(inventory(BASE / 'Aux.app') == receipt['files'], 'Actual base app differs from completed inventory')
    return receipt


def replay(text, anchors):
    for edit in anchors:
        require(edit['count'] == 1 and text.count(edit['find']) == 1,
                'Exact count-one source edit required')
        text = text.replace(edit['find'], edit['replace'])
    return text


def prepare():
    require(not OUT.exists() and not (HERE/'review.json').exists(), 'Fresh output/review required')
    original = base_receipt()
    base = BASE/'Aux.app'/RES
    entries = {item['path']: item for item in original['files']}
    inputs = [ref(__file__), ref(LEGACY), ref(BASE/'receipt.json'),
              ref(SCOPE/'package-v11/source-pair-final.json'),
              ref(SCOPE/'integration/daemon-link-a6-inputs.json'),
              ref(SCOPE/'integration/daemon-link-a6-passed.json'),
              ref(SCOPE/'integration/browser-build-a8-passed.json'),
              ref(SCOPE/'integration/browser-native-bridge-a8-a3.json'),
              ref(SCOPE/'ui-peer-identity-a1/actual-stages-a1.json'),
              ref(SCOPE/'ui-peer-identity-a1/inputs.json'),
              ref(SCOPE/'daemon-addon-retirement-a1/actual-stage-a2.json'),
              ref(SCOPE/'ui-peer-identity-a1/browser-skill-a1.json')]
    operations = []

    def replace(relative, source):
        source = Path(source).absolute()
        old = entries[str(RES/relative)]
        require(old['type'] == 'file' and old['mode'] == 0o644, 'Only existing same-mode text resources may change')
        item = ref(source)
        require(item['sha256'] != old['sha256'], 'Unchanged replacement refused')
        inputs.append(item)
        operations.append(dict(path=relative, previousSha256=old['sha256'],
                               input=item, mode=0o644))

    ui_actual = read(inputs[8]['path'])
    require(ui_actual['passed'] is True and ui_actual['productExecuted'] is False,
            'Actual completed UI stages required')
    ui_stage = Path(next(row['output'] for row in ui_actual['reports'] if row['featureProfile']=='desktop-v1'))
    ui_manifest = ui_stage/'manifest.json'
    inputs.append(ref(ui_manifest))
    ui_report = read(ui_manifest)['components']['agent']
    current_ui = inventory(ui_stage/'agent')
    require(all(item['type']=='file' for item in current_ui), 'UI links or special leaves refused')
    require({item['path']:item['sha256'] for item in current_ui} ==
            {item['path']:item['outputSha256'] for item in ui_report['files']}, 'Complete current UI inventory differs')
    packaged_ui = {name.removeprefix('Contents/Resources/aux/apps/extension/dist/'):item
                   for name,item in entries.items() if name.startswith('Contents/Resources/aux/apps/extension/dist/')}
    require(set(packaged_ui)=={item['path'] for item in current_ui}, 'New UI changes delivered file coverage')
    differences = []
    for item in current_ui:
        prior = packaged_ui[item['path']]
        require(item['mode']==prior['mode'], 'UI mode changed')
        if item['sha256'] != prior['sha256']:
            differences.append(item['path'])
    require(sorted(differences)==sorted(UI), 'UI delta extends beyond exact four scripts/revision')
    old_manifest, new_manifest = read(base/'apps/extension/dist/manifest.json'), read(ui_stage/'agent/manifest.json')
    require(old_manifest.pop('version')=='1.26.1016.1869' and new_manifest.pop('version')=='1.26.1016.1871'
            and old_manifest==new_manifest, 'UI permission/identity drift')
    for name in UI:
        replace('apps/extension/dist/'+name, ui_stage/'agent'/name)

    retirement = read(SCOPE/'daemon-addon-retirement-a1/actual-stage-a2.json')
    require(retirement['passed'] is True and retirement['cliPreservedByteForByte'] is True
            and retirement['productExecuted'] is False, 'Actual scoped daemon retirement required')
    app_stage = Path(retirement['output'])
    inputs.append(ref(app_stage/'manifest.json'))
    require(sha(app_stage/'manifest.json')==retirement['stageManifestSha256'], 'Daemon stage association changed')
    require(retirement['removed']==[dict(component='daemon',path='Contents/Resources/native/provided-native.node',
            sha256=entries[str(RES/ADDON)]['sha256'])], 'Exact obsolete addon removal required')
    require(not (app_stage/ADDON).exists(), 'Retired daemon addon retained')
    replace(SKILL, app_stage/SKILL)

    projection_path = SCOPE/'daemon-projection-v6/actual-projection-a6.json'
    projection = read(projection_path)
    require(projection['passed'] is True and projection['totalAnchorCountPerLeaf']==199
            and projection['appendedAnchorCountPerLeaf']==2 and projection['productExecuted'] is False,
            'Actual two-edit vendor privilege successor required')
    projection_root = Path(projection['output'])
    composition_path = projection_root/'composition.json'
    require(sha(composition_path)==projection['compositionSha256'], 'Source composition changed')
    composition = read(composition_path)
    inputs += [ref(projection_path), ref(composition_path), ref(projection_root/'source-receipt.json'),
               ref(projection_root/'projected-entry/results.json')]
    anchors = []
    for folder in ['vendor-entitlement-removal-a1','vendor-experimental-removal-a1']:
        path = SCOPE/folder/'source/anchors.json'
        inputs.append(ref(path))
        value = read(path)
        require(len(value)==1, 'Exactly one edit per privilege removal')
        anchors += value
    old_pair = read(SCOPE/'package-v11/source-pair-final.json')
    for kind, relative, name in [('source',SOURCE,'index.mjs'),('entry',ENTRY,'projected-entry/aux-native-entry.mjs')]:
        source = projection_root/name
        before = (base/relative).read_text()
        require(hashlib.sha256(before.encode()).hexdigest()==old_pair[kind+'Sha256'], 'Original paired leaf differs')
        require(replay(before,anchors).encode()==source.read_bytes(), 'Independent exact vendor-edit replay differs')
        require(sha(source)==projection[kind+'Sha256'], 'Projected source hash differs')
        require(projection_root.joinpath(name).read_bytes()==Path(composition['files'][0 if kind=='source' else 1]['output']).read_bytes(),
                'Ordinary and independent entry derivation differ')
        replace(relative,source)
    source_receipt, entry_receipt = read(projection_root/'source-receipt.json'), read(projection_root/'projected-entry/results.json')
    require(source_receipt['passed'] is True and source_receipt['coldRefusalPreserved'] is True
            and source_receipt['nativeAbiChanged'] is False and entry_receipt['passed'] is True
            and entry_receipt['defaultEntryRefusalPreserved'] is True and entry_receipt['executed'] is False,
            'Refused ordinary and dormant independent source required')
    require(entry_receipt['sourceSha256']==projection['sourceSha256']
            and entry_receipt['entrySha256']==projection['entrySha256']
            and entry_receipt['sourceReceiptSha256']==sha(projection_root/'source-receipt.json'), 'Independent entry receipt mismatch')
    for kind, relative in [('daemon',DAEMON+'MacOS/aux-daemon'),('loader',DAEMON+'Resources/native/aux-owned-native.cjs'),
                           ('pty',DAEMON+'Resources/native/node-pty/prebuilds/darwin-arm64/pty.node')]:
        require(sha(base/relative)==old_pair[kind+'Sha256'], 'Unchanged native boundary differs: '+kind)
    require(entry_receipt['loaderSha256']==old_pair['loaderSha256']==projection['loaderSha256'], 'Fixed native loader changed')

    # Current provenance is captured without relabelling historical stage inputs.
    command = ['node','--input-type=module','-e',
               "import {providedStageInputs} from './scripts/lib/provided-stage-inputs.mjs';process.stdout.write(JSON.stringify(providedStageInputs))"]
    paths = json.loads(subprocess.check_output(command,cwd=ROOT,text=True))
    adaptation = [ref(ROOT/path) for path in paths]
    inputs += adaptation
    by_path = {}
    for item in inputs:
        require(item['path'] not in by_path or by_path[item['path']]==item, 'Conflicting frozen input')
        by_path[item['path']] = item
    pair = copy.deepcopy(old_pair)
    pair.update(source=str(projection_root/'index.mjs'),sourceSha256=projection['sourceSha256'],
                entry=str(projection_root/'projected-entry/aux-native-entry.mjs'),entrySha256=projection['entrySha256'],
                sourceCompositionReceiptSha256=projection['compositionSha256'],
                sourceReceiptSha256=projection['sourceReceiptSha256'],entryReceiptSha256=projection['entryReceiptSha256'],
                predecessorSourcePairSha256=sha(SCOPE/'package-v11/source-pair-final.json'),
                nativeAbiChanged=False,nativeHostApiChanged=False,pairedModuleAbiChanged=False,nativePairingPending=False,
                pairProducer=ref(__file__),pairProducerInputs={'projection':ref(projection_path),'predecessor':ref(SCOPE/'package-v11/source-pair-final.json')},
                pairingScope='Two literal predicate edits; existing native owner, loader, PTY and executable unchanged; no runtime acceptance')
    write_new(HERE/'source-pair.json',pair)
    old_bundle = read(base/'bundle.json')
    write_new(HERE/'predecessor-bundle.json',old_bundle)
    by_path[str(HERE/'source-pair.json')] = ref(HERE/'source-pair.json')
    by_path[str(HERE/'predecessor-bundle.json')] = ref(HERE/'predecessor-bundle.json')
    review = dict(format='aux.exact-resource-successor.review.v1',base=str(BASE/'Aux.app'),output=str(OUT),
                  baselineReceipt=ref(BASE/'receipt.json'),baselineInventorySha256=original['inventorySha256'],
                  inputs=list(by_path.values()),replacements=operations,removal=dict(path=ADDON,previousSha256=entries[str(RES/ADDON)]['sha256']),
                  sourcePair=ref(HERE/'source-pair.json'),projection=ref(projection_path),uiStage=ref(ui_manifest),
                  adaptationInputs=adaptation,productExecuted=False,runtimeAuthorityGranted=False,testable=False)
    require(len(operations)==8 and len({item['path'] for item in operations})==8, 'Exactly eight unique replacements required')
    write_new(HERE/'review.json',review)
    print('Prepared exact eight-resource/one-addon successor; native bytes and authority unchanged',flush=True)


def metadata(bundle, review):
    pair = read(pin(review['sourcePair']))
    prior_hash = digest(bundle)
    records = {item['path']:item for item in bundle['files']}
    require(len(records)==len(bundle['files']), 'Duplicate delivered metadata')
    for item in review['replacements']:
        record = records[item['path']]
        require(record['sha256']==item['previousSha256'], 'Metadata predecessor differs')
        record.update(sha256=item['input']['sha256'],mode=item['mode'],changeKinds=['integration'])
    removal = review['removal']
    require(records[removal['path']]['sha256']==removal['previousSha256'], 'Metadata removal differs')
    bundle['files'] = [item for item in bundle['files'] if item['path']!=removal['path']]
    bundle['excludedFiles'].append(dict(source=removal['path'],sha256=removal['previousSha256'],
         reason='Obsolete state-v2 daemon common addon; fixed linked Aux owner is required'))
    for component in bundle['components']:
        if component['target']=='apps/daemon/Aux Daemon.app':
            component['records']-=1
    bundle['finalApp']=str(OUT/'Aux.app')
    bundle['productionReady']=False
    entry = bundle['nativeEntryProjection']
    entry.update(sourceSha256=pair['sourceSha256'],sourceReceiptSha256=pair['sourceReceiptSha256'],entryReceiptSha256=pair['entryReceiptSha256'])
    for item in entry['files']:
        if item['path']==ENTRY:
            item.update(sha256=pair['entrySha256'],bytes=Path(pair['entry']).stat().st_size)
    for field in ['finalLocalNativeReplacement','successorIntegration']:
        for item in bundle[field].get('replacements',[]):
            for changed in review['replacements']:
                if item['path']==changed['path']:
                    item.update(previousSha256=changed['previousSha256'],input=changed['input']['path'],sha256=changed['input']['sha256'])
    bundle['finalLocalNativeReplacement']['nativeEntryProjection']=copy.deepcopy(entry)
    bundle['successorIntegration'].pop('baselineMetadata',None)
    bundle['successorIntegration'].update(sourcePairSha256=review['sourcePair']['sha256'],
        predecessorMetadataSha256=prior_hash,historyScope='Earlier native/resource integration; current source/resource association follows')
    feature = bundle['browserFeatureIntegration']
    feature['predecessorFeatureStage']=feature.pop('featureStage')
    feature['resourceStage']=review['uiStage']
    feature['daemonComposition']=ref(Path(pair['source']).parent/'composition.json')
    for item in feature['replacements']:
        for changed in review['replacements']:
            if item['path']==changed['path']:
                item.update(input=changed['input']['path'],sha256=changed['input']['sha256'])
    bundle['resourceSuccessorIntegration']=dict(format='aux.inactive-resource-successor.v1',review=ref(HERE/'review.json'),
        predecessorReceipt=review['baselineReceipt'],sourcePair=review['sourcePair'],
        replacements=review['replacements'],removed=review['removal'],currentAdaptationInputs=review['adaptationInputs'],
        testable=False,runtimeAuthorityGranted=False,appExecuted=False,productSigned=False,acceptedAppReplaced=False)
    return bundle


def assemble():
    review_path=HERE/'review.json'
    review=read(review_path)
    require(review['format']=='aux.exact-resource-successor.review.v1' and review['output']==str(OUT)
            and review['base']==str(BASE/'Aux.app') and not OUT.exists(), 'Exact fresh reserved candidate required')
    for item in review['inputs']:
        pin(item)
    before=base_receipt()['files']
    OUT.parent.mkdir(parents=True,exist_ok=True)
    temporary=Path(tempfile.mkdtemp(prefix='.aux-resource-successor-',dir=OUT.parent))
    try:
        app=temporary/'Aux.app'
        shutil.copytree(BASE/'Aux.app',app,symlinks=True)
        require(inventory(app)==before,'Copied app differs before resource overlay')
        for item in review['replacements']:
            source=pin(item['input'])
            target=app/RES/item['path']
            no_links(target,app)
            require(sha(target)==item['previousSha256'],'Destination predecessor changed')
            shutil.copyfile(source,target)
            target.chmod(item['mode'])
        removal=review['removal']
        target=app/RES/removal['path']
        no_links(target,app)
        require(sha(target)==removal['previousSha256'],'Wrong addon removal')
        target.unlink()
        marker=app/RES/'bundle.json'
        marker.write_text(json.dumps(metadata(read(marker),review),indent=2)+'\n')
        after=inventory(app)
        changed={str(RES/item['path']) for item in review['replacements']}|{str(RES/removal['path']),str(RES/'bundle.json')}
        require([item for item in before if item['path'] not in changed]==
                [item for item in after if item['path'] not in changed],
                'Unrelated native/CLI/UI/runtime leaf changed')
        require(len(after)==len(before)-1,'Unexpected file coverage change')
        actual={item['path']:item for item in after}
        for item in review['replacements']:
            require(actual[str(RES/item['path'])]==dict(path=str(RES/item['path']),type='file',sha256=item['input']['sha256'],mode=item['mode']),
                    'Actual replaced leaf differs')
        bundle=read(marker)
        for item in bundle['files']:
            leaf=actual.get(str(RES/item['path']))
            require(leaf is not None and leaf['type']==item['type'] and leaf['mode']==item['mode']
                    and (leaf.get('sha256')==item.get('sha256') if leaf['type']=='file' else leaf['target']==item['target']),
                    'Delivered metadata does not describe actual leaf: '+item['path'])
        for item in review['inputs']:
            pin(item)
        require(inventory(BASE/'Aux.app')==before,'Original base app changed during copy')
        result=dict(format='aux.exact-resource-successor.inactive-package.v1',passed=True,reviewSha256=sha(review_path),
                    predecessorReceiptSha256=review['baselineReceipt']['sha256'],sourcePairSha256=review['sourcePair']['sha256'],
                    files=after,inventorySha256=digest(after),exactResourceReplacements=8,exactObsoleteAddonRemovals=1,
                    nativeAndCliBytesUnchanged=True,unrelatedUiCssAssetsUnchanged=True,
                    **{key:False for key in FLAG_KEYS})
        write_new(temporary/'receipt.json',result)
        temporary.rename(OUT)
        write_new(HERE/'actual-package.json',dict(format='aux.resource-package.actual.v1',passed=True,app=str(OUT/'Aux.app'),
                    receipt=ref(OUT/'receipt.json'),inventorySha256=result['inventorySha256'],leaves=len(after),
                    exactReplacements=8,exactRemovals=1,**{key:False for key in FLAG_KEYS}))
        print('Assembled exact inactive resource successor; no app execution or signing',flush=True)
    except Exception as error:
        write_new(temporary/'failure.json',dict(passed=False,error=str(error),productExecuted=False,testable=False))
        print('Failed candidate retained at '+str(temporary),file=sys.stderr)
        raise


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['prepare','assemble'])
    args=parser.parse_args()
    (prepare if args.command=='prepare' else assemble)()
