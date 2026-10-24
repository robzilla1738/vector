#!/usr/bin/env python3
"""Fresh inactive versioned-preference/CLI Worker successor; no native or UI-style change."""
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
SCOPE = HERE.parent
ROOT = HERE.parents[4]
spec = importlib.util.spec_from_file_location('runtime_package_helpers', SCOPE/'runtime-package-a1/runtime_package.py')
p = importlib.util.module_from_spec(spec)
spec.loader.exec_module(p)
BASE = ROOT/'out/provided-candidate-standard-profile-ui-20261024'
OUT = ROOT/'out/provided-candidate-standard-profile-state-20261024'
RES = Path('Contents/Resources/aux')
UI = Path('apps/extension/dist')
stage = Path('/private/tmp/aux-ui-storage-stage-20261024-a1/desktop-v1')

p.require(not OUT.exists() and not (HERE/'package-review.json').exists(), 'Fresh exact successor required')
p.require(p.sha(BASE/'receipt.json') == '151a2962070aec277dc751763365d582dd7daf83ae02de89e43dcc3888816b58', 'Exact completed runtime predecessor required')
receipt = p.read(BASE/'receipt.json')
p.require(receipt['passed'] is True and all(receipt[key] is False for key in p.FLAGS) and
          p.digest(receipt['files']) == receipt['inventorySha256'] == '2ac280556fb8fe5041d56324ef40c1478bba094c215d2648af5a007c4a9e74f7', 'Inactive predecessor inventory differs')
before = p.inventory(BASE/'Aux.app')
p.require(before == receipt['files'], 'Actual predecessor app differs')
prior = {row['path']:row for row in before}
inputs = [p.ref(__file__), p.ref(SCOPE/'runtime-package-a1/runtime_package.py'), p.ref(p.LEGACY),
          p.ref(BASE/'receipt.json'), p.ref(HERE/'inputs.json'), p.ref(HERE/'actual-stages-a1.json'),
          p.ref(HERE/'actual-focused-a1.json'), p.ref(stage/'manifest.json')]
source_report = p.read(stage/'manifest.json')['components']['agent']
p.require(p.read(HERE/'actual-stages-a1.json')['passed'] is True and
          p.read(HERE/'actual-focused-a1.json')['passed'] is True, 'Actual supplied stage/focused checks required')
stage_leaves = p.inventory(stage/'agent')
p.require(all(row['type'] == 'file' for row in stage_leaves) and
          {row['path']:row['sha256'] for row in stage_leaves} ==
          {row['path']:row['outputSha256'] for row in source_report['files']}, 'Complete UI stage inventory differs')
old_ui = {name.removeprefix(str(RES/UI)+'/'):row for name,row in prior.items() if name.startswith(str(RES/UI)+'/')}
p.require(set(old_ui) == {row['path'] for row in stage_leaves}, 'UI file coverage changed')
expected = {row['path'] for row in p.read(HERE/'inputs.json')['files']} | {'manifest.json'}
replacements = []
for row in stage_leaves:
    old = old_ui[row['path']]
    p.require(row['mode'] == old['mode'], 'UI mode changed')
    if row['sha256'] != old['sha256']:
        item = p.ref(stage/'agent'/row['path'])
        inputs.append(item)
        replacements.append(dict(path=str(UI/row['path']), previousSha256=old['sha256'], input=item, mode=old['mode']))
p.require({row['path'].removeprefix(str(UI)+'/') for row in replacements} == expected and len(replacements) == 11,
          'Exact ten-script/revision delta required')
old_manifest = p.read(BASE/'Aux.app'/RES/UI/'manifest.json')
new_manifest = p.read(stage/'agent/manifest.json')
p.require(old_manifest.pop('version') == '1.26.1016.1873' and new_manifest.pop('version') == '1.26.1016.1875' and
          old_manifest == new_manifest, 'Manifest identity/permissions changed beyond revision')
cli_here = SCOPE/'cli-worker-settlement-a1'
cli_actual = p.read(cli_here/'actual-stage-a1.json')
cli_manifest = Path(cli_actual['output'])/'manifest.json'
p.require(cli_actual['passed'] is True and cli_actual['cliExecuted'] is False and
          cli_actual['defaultColdRefusalPreserved'] is True and cli_actual['nativeApiChanged'] is False and
          p.sha(cli_manifest) == cli_actual['manifestSha256'] and
          cli_actual['changedCliLeaves'] == ['Contents/MacOS/aux-cli'], 'Exact guarded CLI stage required')
cli_relative = 'apps/cli/Aux CLI.app/Contents/MacOS/aux-cli-sea'
cli_input = Path(cli_actual['output'])/'cli/Aux CLI.app/Contents/MacOS/aux-cli'
p.require(p.sha(cli_input) == cli_actual['cliBinarySha256'], 'CLI stage binary differs')
old_cli = prior[str(RES/cli_relative)]
p.require(old_cli['type'] == 'file' and old_cli['sha256'] != cli_actual['cliBinarySha256'], 'Changed original CLI SEA required')
cli_source = p.ref(cli_input)
replacements.append(dict(path=cli_relative, previousSha256=old_cli['sha256'], input=cli_source, mode=old_cli['mode']))
inputs += [cli_source,p.ref(cli_here/'actual-stage-a1.json'),p.ref(cli_here/'actual-source-a1.json'),p.ref(cli_manifest)]
p.require(len(replacements) == 12, 'Eleven UI/revision plus one CLI SEA replacement required')
paths = json.loads(subprocess.check_output(['node','--input-type=module','-e',
    "import {providedStageInputs} from './scripts/lib/provided-stage-inputs.mjs';process.stdout.write(JSON.stringify(providedStageInputs))"],cwd=ROOT,text=True))
adaptation = [p.ref(ROOT/name) for name in paths]
inputs += adaptation
unique = {}
for item in inputs:
    p.require(item['path'] not in unique or unique[item['path']] == item, 'Conflicting frozen inputs')
    unique[item['path']] = item
review = dict(format='aux.ui-storage-cli-package.review.v1', base=str(BASE/'Aux.app'), output=str(OUT),
              predecessorReceipt=p.ref(BASE/'receipt.json'), predecessorInventorySha256=receipt['inventorySha256'],
              stage=p.ref(stage/'manifest.json'), inputs=list(unique.values()), replacements=replacements,
              currentAdaptationInputs=adaptation, **{key:False for key in p.FLAGS})
p.write_new(HERE/'package-review.json',review)
temporary = Path(tempfile.mkdtemp(prefix='.aux-ui-storage-cli-successor-',dir=OUT.parent))
try:
    app = temporary/'Aux.app'
    # APFS copy-on-write clone; the final complete inventory proves every leaf.
    # -P preserves links rather than following them; -p preserves source modes.
    subprocess.run(['/bin/cp','-cRpP',str(BASE/'Aux.app'),str(app)],check=True)
    for item in replacements:
        target = app/RES/item['path']
        p.require(target.is_file() and not target.is_symlink() and p.sha(target) == item['previousSha256'], 'Overlay predecessor differs')
        target.write_bytes(p.pin(item['input']).read_bytes())
        target.chmod(item['mode'])
    marker = app/RES/'bundle.json'
    bundle = p.read(marker)
    old_metadata_sha = p.sha(marker)
    records = {row['path']:row for row in bundle['files']}
    for item in replacements:
        p.require(records[item['path']]['sha256'] == item['previousSha256'], 'Marker predecessor differs')
        records[item['path']].update(sha256=item['input']['sha256'],changeKinds=['identity'])
    bundle.update(finalApp=str(OUT/'Aux.app'),productionReady=False,
                  adaptationInputsScope='Historical source stage; current UI/CLI inputs are in uiStorageCliIntegration')
    feature = bundle['browserFeatureIntegration']
    feature['predecessorResourceStage'] = feature['resourceStage']
    feature['resourceStage'] = review['stage']
    bundle['uiStorageCliIntegration'] = dict(format='aux.ui-storage-cli-package.integration.v1',review=p.ref(HERE/'package-review.json'),
        predecessorReceipt=review['predecessorReceipt'],predecessorMetadataSha256=old_metadata_sha,stage=review['stage'],
        replacements=replacements,currentAdaptationInputs=adaptation,nativeAndDaemonSourceUnchanged=True,cliSeaOnlyChanged=True,
        **{key:False for key in p.FLAGS})
    bundle['uiPreferenceMigration'] = dict(format='aux.ui-preference-migration.v1',
        targetKeys=[dict(storage=row['storage'],key=row['toKey'],kind=row['kind']) for row in p.read(HERE/'inputs.json')['mappings']],
        offlineImporter=p.ref(ROOT/'vendor/provided/aux-ui-storage-migration.mjs'),
        existingProfileMigrationRequired=True,realStorageMigrationExecuted=False,runtimeAcceptance=False)
    bundle['cliWorkerSettlement'] = dict(sourceEvidence=p.ref(cli_here/'actual-source-a1.json'),
        stageEvidence=p.ref(cli_here/'actual-stage-a1.json'),sourceSha256=cli_actual['cliSourceSha256'],
        originalWorkerBodyPreserved=True,defaultColdRefusalPreserved=True,nativeApiChanged=False,
        realWorkerOrNativeCommandExecuted=False,runtimeAcceptance=False)
    marker.write_text(json.dumps(bundle,indent=2)+'\n')
    after = p.inventory(app)
    changed = {str(RES/'bundle.json')} | {str(RES/item['path']) for item in replacements}
    p.require(len(before) == len(after) == 11187 and
              [row for row in before if row['path'] not in changed] == [row for row in after if row['path'] not in changed],
              'Unrelated native/source/CLI/runtime/style/resource changed')
    actual = {row['path']:row for row in after}
    for item in replacements:
        p.require(actual[str(RES/item['path'])] == dict(path=str(RES/item['path']),type='file',sha256=item['input']['sha256'],mode=item['mode']),
                  'Actual changed UI leaf differs')
    for row in bundle['files']:
        leaf = actual.get(str(RES/row['path']))
        kind = 'link' if row['type'] == 'symlink' else row['type']
        p.require(leaf is not None and leaf['type'] == kind and ('mode' not in row or leaf['mode'] == row['mode']) and
                  (leaf.get('sha256') == row.get('sha256') if kind == 'file' else leaf['target'] == row.get('linkTarget',row.get('target'))),
                  'Delivered marker differs: '+row['path'])
    for item in review['inputs']:
        p.pin(item)
    result = dict(format='aux.ui-storage-cli-package.inactive.v1',passed=True,reviewSha256=p.sha(HERE/'package-review.json'),
        predecessorReceiptSha256=review['predecessorReceipt']['sha256'],files=after,inventorySha256=p.digest(after),
        exactReplacements=12,browserDaemonNativeRuntimeUnchanged=True,cliSeaOnlyChanged=True,allStylesheetsAndAssetsUnchanged=True,
        **{key:False for key in p.FLAGS})
    p.write_new(temporary/'receipt.json',result)
    temporary.rename(OUT)
    p.write_new(HERE/'actual-package-a1.json',dict(format='aux.ui-storage-cli-package.actual.v1',passed=True,app=str(OUT/'Aux.app'),
        receipt=p.ref(OUT/'receipt.json'),inventorySha256=result['inventorySha256'],leaves=len(after),exactReplacements=12,
        browserDaemonNativeRuntimeUnchanged=True,cliSeaOnlyChanged=True,allStylesheetsAndAssetsUnchanged=True,**{key:False for key in p.FLAGS}))
    print('Assembled inactive UI preference/CLI Worker successor; no activation, signing or styling change',flush=True)
except Exception as error:
    p.write_new(temporary/'failure.json',dict(passed=False,error=str(error),productExecuted=False))
    print('Failed candidate retained at '+str(temporary),file=sys.stderr)
    raise
