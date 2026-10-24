"""Assemble the complete inactive feature tuple; never launch or sign it."""
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
SCOPE = HERE.parents[1] / 'standard-profile-isolation'
spec = importlib.util.spec_from_file_location('package_helpers', SCOPE / 'runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
BASE = ROOT / 'out/provided-candidate-standard-profile-drafts-20261024'
OUT = ROOT / 'out/provided-candidate-desktop-completion-20261024-a3'
RES = Path('Contents/Resources/aux')
DAEMON = Path('apps/daemon/Aux Daemon.app/Contents')
SOURCE = DAEMON / 'Resources/node-development/index.mjs'
ENTRY = DAEMON / 'Resources/node-development/aux-native-entry.mjs'
LOADER = DAEMON / 'Resources/native/aux-owned-native.cjs'
BUILD = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/unsigned-feature-completion-browser-build-20261024-a3b/receipt.json')
PROJECTION = HERE.parent / 'productivity-adapter-pairing-a2/actual-projection.json'
STAGE = HERE.parent / 'completion-batch-a2/actual-ui-stage-a1.json'
LINK = SCOPE / 'ui-native-capture-transport-a1/actual-daemon-link-a3.json'


def native_rows(rows):
    """Translate only the native inventory's explicit size/type representation."""
    return [{key: ('link' if value == 'symlink' and key == 'type' else value)
             for key, value in row.items() if key != 'bytes'} for row in rows]


def guarded_target(app, relative):
    target = app / relative
    for parent in [target, *target.parents]:
        if parent == app:
            break
        p.require(not parent.is_symlink(), 'Replacement cannot traverse a link: ' + str(parent))
    p.require(target.is_file(), 'Existing regular replacement required: ' + str(target))
    return target


def main():
    p.require(not OUT.exists(), 'Fresh inactive output required')
    predecessor = p.read(BASE / 'receipt.json')
    p.require(p.sha(BASE / 'receipt.json') == '3fd0400a7b36ccabb8194dbc88b64ba1629867c23b529db7899e262781f6da13',
              'Exact completed predecessor required')
    p.require(predecessor['passed'] and all(predecessor[key] is False for key in p.FLAGS), 'Inactive predecessor required')
    before = p.inventory(BASE / 'Aux.app')
    p.require(before == predecessor['files'] and p.digest(before) == predecessor['inventorySha256'], 'Actual predecessor differs')
    old = {row['path']: row for row in before}
    build = p.read(BUILD)
    p.require(build['passed'] and build['allInspectedMachoUnsigned'] and build['machoCount'] == 16 and
              build['appLeafCount'] == 416 and build['productSigned'] is False and build['appExecuted'] is False,
              'Successful complete unsigned browser build required')
    pins = p.read(HERE / 'full-native-input-pins-a1.json')
    p.require(build['nativeInputPinsSha256'] == p.sha(HERE / 'full-native-input-pins-a1.json') and
              pins['authorityWireVersion'] == 6, 'Exact wire6 browser inputs required')
    native_root = Path(build['source'])
    for name, expected in pins['files'].items():
        p.require(p.sha(native_root / name) == expected, 'Native build input changed: ' + name)
    native = Path(build['appPath'])
    expected_native = native_rows(p.read(BUILD.parent / 'app-inventory.json'))
    p.require(p.inventory(native) == expected_native, 'Actual complete native app differs')
    prior_native_receipt = Path(pins['predecessorNativeReceipt'])
    p.require(p.sha(prior_native_receipt) == pins['predecessorNativeReceiptSha256'], 'Preserved native predecessor differs')
    # The package still contains a8; authenticate that exact original subtree.
    a8 = native_root.parent / 'unsigned-standard-profile-browser-build-20261024-a8/app-inventory.json'
    p.require(all(old.get(row['path']) == row for row in native_rows(p.read(a8))), 'Packaged native baseline differs')

    stage = p.read(STAGE)
    p.require(stage['passed'] and stage['agentRevision'] == 29 and stage['stylesAssetsFontsModesAndOtherBytesPreserved'], 'Reviewed complete UI required')
    stage_root = Path(stage['output'])
    p.require(p.sha(stage_root / 'manifest.json') == stage['stageManifestSha256'], 'UI stage receipt differs')
    ui = p.inventory(stage_root / 'agent')
    ui_prefix = str(RES / 'apps/extension/dist') + '/'
    p.require({row['path'] for row in ui} == {name.removeprefix(ui_prefix) for name in old if name.startswith(ui_prefix)}, 'UI coverage differs')
    projection = p.read(PROJECTION)
    p.require(projection['passed'] and projection['actualLatestPackageLeavesMatch'] and
              projection['allOtherLatestSourceBytesPreserved'] and projection['independentEntryMatchesProjection'] and
              projection['nativeApiChanged'] is False and projection['helperBundleDeltaAnchorsPerLeaf'] == 1,
              'Actual latest cumulative source projection required')
    projected = Path(projection['output'])
    p.require(p.sha(projected / 'composition.json') == projection['compositionSha256'], 'Source composition differs')
    p.require(p.sha(BASE / 'Aux.app' / RES / SOURCE) == projection['priorSourceSha256'] and
              p.sha(BASE / 'Aux.app' / RES / ENTRY) == projection['priorEntrySha256'], 'Source predecessor differs')
    p.require(p.sha(BASE / 'Aux.app' / RES / LOADER) == projection['loaderSha256'], 'Original loader differs')
    link = p.read(LINK)
    daemon = Path(link['output']) / 'Aux Daemon'
    p.require(link['passed'] and link['postLinkVerificationPassed'] and not link['codeSignatureLoadCommandPresent'] and
              not link['executed'] and p.sha(daemon) == link['binarySha256'], 'Actual unsigned wire6 daemon required')
    link_inputs = SCOPE / 'ui-native-capture-transport-a1/daemon-link-inputs.json'
    p.require(p.sha(link_inputs) == link['inputsSha256'], 'Daemon link inputs differ')
    transport_plan = SCOPE / 'ui-native-capture-transport-a1/source-plan.json'
    p.require(p.read(link_inputs)['sourcePlanSha256'] == p.sha(transport_plan) and
              p.read(transport_plan)['authorityWireVersion'] == pins['authorityWireVersion'],
              'Browser/daemon authority wire mismatch')

    replacements = []

    def replace(relative, source, expected=None):
        row = old[str(relative)]
        item = p.ref(source)
        if expected is not None:
            p.require(item['sha256'] == expected, 'Selected output differs')
        p.require(row['type'] == 'file', 'Replacement must retain regular type')
        if row['sha256'] != item['sha256']:
            replacements.append(dict(path=str(relative), previousSha256=row['sha256'], input=item, mode=row['mode']))

    for row in expected_native:
        p.require(row['path'] in old and row['type'] == old[row['path']]['type'] and row['mode'] == old[row['path']]['mode'], 'Native coverage/mode changed')
        if row['type'] == 'link':
            p.require(old[row['path']] == row, 'Native link changed')
        else:
            replace(Path(row['path']), native / row['path'], row['sha256'])
    for row in ui:
        p.require(row['mode'] == old[ui_prefix + row['path']]['mode'], 'UI mode changed')
        replace(RES / 'apps/extension/dist' / row['path'], stage_root / 'agent' / row['path'], row['sha256'])
    replace(RES / SOURCE, projected / 'index.mjs', projection['sourceSha256'])
    replace(RES / ENTRY, projected / 'projected-entry/aux-native-entry.mjs', projection['entrySha256'])
    replace(RES / DAEMON / 'MacOS/aux-daemon', daemon, link['binarySha256'])
    p.require(len({row['path'] for row in replacements}) == len(replacements), 'Duplicate replacement')
    ui_changes = [row['path'].removeprefix(ui_prefix) for row in replacements if row['path'].startswith(ui_prefix)]
    p.require(all(name.endswith('.js') or name == 'manifest.json' for name in ui_changes), 'Styles/art/fonts cannot change')
    inputs = [p.ref(path) for path in [__file__, p.LEGACY, SCOPE / 'runtime-package-a1/runtime_package.py', BASE / 'receipt.json',
              BUILD, BUILD.parent / 'app-inventory.json', HERE / 'full-native-input-pins-a1.json', STAGE, stage_root / 'manifest.json',
              PROJECTION, projected / 'composition.json', LINK, link_inputs, transport_plan]]
    inputs += [row['input'] for row in replacements]
    review = dict(format='aux.desktop-completion.package.review.v1', base=str(BASE / 'Aux.app'), output=str(OUT),
                  predecessorReceipt=p.ref(BASE / 'receipt.json'), nativeBuild=p.ref(BUILD), uiStage=p.ref(STAGE),
                  daemonLink=p.ref(LINK), sourceProjection=p.ref(PROJECTION), replacements=replacements, inputs=inputs,
                  authorityWireVersion=6, coldFeatureEnabled=False, runtimeAcceptance=False, **{key:False for key in p.FLAGS})
    p.write_new(HERE / 'package-review.json', review)
    temporary = Path(tempfile.mkdtemp(prefix='.aux-desktop-completion-', dir=OUT.parent))
    try:
        app = temporary / 'Aux.app'
        subprocess.run(['/bin/cp', '-cRpP', str(BASE / 'Aux.app'), str(app)], check=True)
        for row in replacements:
            target = guarded_target(app, row['path'])
            p.require(p.sha(target) == row['previousSha256'], 'Copied predecessor differs')
            shutil.copyfile(p.pin(row['input']), target)
            target.chmod(row['mode'])
        marker = app / RES / 'bundle.json'
        bundle = p.read(marker)
        records = {row['path']: row for row in bundle['files']}
        for row in replacements:
            if row['path'].startswith(str(RES) + '/'):
                relative = row['path'].removeprefix(str(RES) + '/')
                p.require(records[relative]['sha256'] == row['previousSha256'], 'Resource metadata predecessor differs')
                records[relative].update(sha256=row['input']['sha256'], changeKinds=['integration'])
        bundle.update(finalApp=str(OUT / 'Aux.app'), productionReady=False,
                      adaptationInputsScope='Historical stage records retained; current exact tuple is featureCompletionIntegration')
        bundle['featureCompletionIntegration'] = dict(review=p.ref(HERE / 'package-review.json'),
            sourceProjection=review['sourceProjection'], nativeBuild=review['nativeBuild'], daemonLink=review['daemonLink'],
            uiStage=review['uiStage'], authorityWireVersion=6, latestCumulativeSourcePreserved=True,
            actualRuntimeAcceptancePending=True, migrationActivationAuthorized=False, **{key:False for key in p.FLAGS})
        marker.write_text(json.dumps(bundle, indent=2) + '\n')
        after = p.inventory(app)
        changed = {row['path'] for row in replacements} | {str(RES / 'bundle.json')}
        p.require(len(after) == len(before) and [row for row in before if row['path'] not in changed] ==
                  [row for row in after if row['path'] not in changed], 'Unrelated app/CLI/runtime/style bytes changed')
        actual = {row['path']: row for row in after}
        for row in replacements:
            p.require(actual[row['path']] == dict(path=row['path'], type='file', sha256=row['input']['sha256'], mode=row['mode']), 'Replacement differs')
        for row in bundle['files']:
            leaf = actual.get(str(RES / row['path']))
            kind = 'link' if row['type'] == 'symlink' else row['type']
            p.require(leaf and leaf['type'] == kind and ('mode' not in row or leaf['mode'] == row['mode']) and
                      (leaf.get('sha256') == row.get('sha256') if kind == 'file' else leaf['target'] == row.get('linkTarget', row.get('target'))),
                      'Delivered resource metadata differs: ' + row['path'])
        for item in inputs:
            p.pin(item)
        result = dict(format='aux.desktop-completion.package.inactive.v1', passed=True, files=after,
            inventorySha256=p.digest(after), review=p.ref(HERE / 'package-review.json'), replacements=len(replacements),
            stylesAssetsFontsCliAndUnrelatedResourcesPreserved=True, runtimeAcceptance=False, **{key:False for key in p.FLAGS})
        p.write_new(temporary / 'receipt.json', result)
        temporary.rename(OUT)
        p.write_new(HERE / 'actual-package-a1.json', dict(passed=True, app=str(OUT / 'Aux.app'),
            receipt=p.ref(OUT / 'receipt.json'), inventorySha256=result['inventorySha256'], leaves=len(after),
            replacements=len(replacements), runtimeAcceptance=False, **{key:False for key in p.FLAGS}))
        print(json.dumps({'passed':True, 'app':str(OUT / 'Aux.app'), 'leaves':len(after), 'replacements':len(replacements)}))
    except Exception as error:
        p.write_new(temporary / 'failure.json', dict(passed=False, error=str(error), productExecuted=False))
        raise


if __name__ == '__main__':
    main()
