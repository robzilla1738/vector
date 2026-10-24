"""Pin new actual native consumer sources and exact real dependency APIs."""
import difflib
import hashlib
import json
import re
from pathlib import Path
HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
sha = lambda data: hashlib.sha256(data).hexdigest()
files, patch, dependencies = [], [], {}
for path in sorted((HERE / 'source').rglob('*')):
    if not path.is_file(): continue
    name = str(path.relative_to(HERE / 'source'))
    assert not (ROOT / name).exists(), ('new owner already exists', name)
    data = path.read_bytes()
    files.append({'path': name, 'create': True, 'inputSha256': None,
                  'outputSha256': sha(data), 'output': str(path), 'anchors': []})
    patch.extend(difflib.unified_diff([], data.decode().splitlines(True),
                                    fromfile='/dev/null', tofile='b/' + name))
    for include in re.findall(r'^#include "([^"]+)"', data.decode(), re.M):
        source = ROOT / include
        if not source.exists() and include.endswith('.mojom.h'):
            source = ROOT / include[:-2]
        if source.is_file(): dependencies[str(source.relative_to(ROOT))] = sha(source.read_bytes())
required = {
 'content/public/browser/dom_storage_context.h': ['DrainLoadedAreasForAuxUiMigration('],
 'extensions/browser/script_executor.h': ['void ExecuteScript(', 'bool frame_responded = false;', 'DocumentId document_id;'],
 'extensions/browser/extension_api_frame_id_map.h': ['static DocumentId GetDocumentId(content::RenderFrameHost* render_frame_host);'],
 'extensions/browser/process_manager.h': ['const FrameSet GetAllFrames() const;', 'GetServiceWorkersForExtension('],
 'extensions/browser/api/storage/storage_frontend.h': ['void CaptureAuxUiPreferencesForMigration('],
 'components/value_store/value_store.h': ['CopyRecordsForNativeJournal() const;'],
 'chrome/browser/aux/AuxSelectedStateHome.h': ['ExchangeNativeSelectedUiCaptureFrame('],
}
api = []
for name, anchors in required.items():
    data = (ROOT / name).read_bytes(); text = data.decode()
    facts = []
    for anchor in anchors:
        assert text.count(anchor) == 1, (name, anchor, text.count(anchor))
        facts.append({'find': anchor, 'count': 1})
    api.append({'path': name, 'sha256': sha(data), 'anchors': facts})
plan = {'format': 'aux.native-profile-migration-controller.consumer.v1', 'nativeRoot': str(ROOT),
        'files': files, 'nativeDependencies': [{'path': k, 'sha256': v} for k,v in sorted(dependencies.items())],
        'consumedNativeApi': api, 'nativeCheckoutChanged': False, 'nativeCompiled': False,
        'productExecuted': False, 'captureQualified': False, 'backendWriterClosureImplemented': False,
        'targetImportImplemented': False, 'activationAuthorized': False,
        'apiRootOwner': 'existing auxBrowserPreferences.commitCommand kind prepare-ui-state-upgrade'}
(HERE / 'source-plan.json').write_text(json.dumps(plan, indent=2)+'\n')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'newNativeFiles': len(files), 'nativeDependencies': len(dependencies),
                  'consumedApiAnchors': sum(len(x['anchors']) for x in api), 'captureQualified': False}))
