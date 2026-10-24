"""Exact new-file replay and actual native API/dependency pin verification."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path
HERE = Path(__file__).resolve().parent
plan = json.loads((HERE/'source-plan.json').read_text())
root = Path(plan['nativeRoot'])
sha = lambda data: hashlib.sha256(data).hexdigest()
for row in plan['nativeDependencies']:
    assert sha((root/row['path']).read_bytes()) == row['sha256'], row['path']
for row in plan['consumedNativeApi']:
    data = (root/row['path']).read_bytes()
    assert sha(data) == row['sha256']
    for anchor in row['anchors']:
        assert data.decode().count(anchor['find']) == anchor['count'] == 1
scratch = Path(tempfile.mkdtemp(prefix='aux-native-ui-controller-replay-', dir='/private/tmp'))
git = lambda *args: subprocess.run(['git','-C',str(scratch),*map(str,args)],check=True,capture_output=True)
git('init','-q')
git('apply','--check',HERE/'native.patch')
git('apply',HERE/'native.patch')
for row in plan['files']:
    assert row['create'] and row['inputSha256'] is None and not (root/row['path']).exists()
    assert sha((scratch/row['path']).read_bytes()) == row['outputSha256']
    assert sha(Path(row['output']).read_bytes()) == row['outputSha256']
git('add','--all')
git('diff','--cached','--check')
git('apply','--reverse','--check',HERE/'native.patch')
source = (HERE/'source/chrome/browser/aux/ui_storage_migration_controller.cc').read_text()
assert 'ExecuteJavaScriptForTests' not in source and 'AUX_SEALED_NATIVE_COLD_ENTRY' not in source
assert 'CommitAuxUiPreferenceMigration(' not in source
assert source.count('peer::ExchangeNativeSelectedUiCaptureFrame(t.next)') == 1
assert '.Set("qualified", false)' in source and '.Set("activationAuthorized", false)' in source
assert 'ReadDict(self->frames_[index]->result_json)' in source
result = {'format':'aux.native-profile-migration-controller.source-check.actual.v1',
          'sourcePlanSha256':sha((HERE/'source-plan.json').read_bytes()),'patchSha256':sha((HERE/'native.patch').read_bytes()),
          'newNativeFiles':len(plan['files']),'nativeDependencyPins':len(plan['nativeDependencies']),
          'consumedApiAnchors':sum(len(row['anchors']) for row in plan['consumedNativeApi']),
          'replayDirectory':str(scratch),'exactReplayPassed':True,'reverseCheckPassed':True,
          'nativeCheckoutChanged':False,'nativeCompiled':False,'productExecuted':False,
          'captureQualified':False,'targetImportExecuted':False,'activationAuthorized':False}
(HERE/'actual-source-check-a5.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result))
