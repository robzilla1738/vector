"""Counted additive record-journal projection over the actual paired v6 daemon."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[4]
PREVIOUS = HERE.parent / 'ui-native-capture-transport-a1/daemon-link-inputs.json'
previous = json.loads(PREVIOUS.read_text())
row = next(r for r in previous['sources'] if Path(r['path']).name == 'AuxOwnedCommandDispatcher.swift')
source = Path(row['path'])
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
assert sha(source) == row['sha256']
anchors = [
    {'find': '        var uiCaptureDownload:UiCaptureDownload? = nil',
     'replace': '        var uiCaptureDownload:UiCaptureDownload? = nil\n        var uiTransactionUpload:UiTransactionUpload? = nil\n        var uiTransactionDownload:UiTransactionDownload? = nil', 'count': 1},
    {'find': '        static func list(context:NativeFreshStagedContext)throws->[String] {',
     'replace': (HERE / 'records.inc.swift').read_text() + '\n        static func list(context:NativeFreshStagedContext)throws->[String] {', 'count': 1},
    {'find': '    private enum UiCaptureFrameError:Error {case invalid,conflict,incomplete,unknown}',
     'replace': (HERE / 'frame-state.inc.swift').read_text() + '\n    private enum UiCaptureFrameError:Error {case invalid,conflict,incomplete,unknown}', 'count': 1},
    {'find': '                default:throw UiCaptureFrameError.invalid',
     'replace': (HERE / 'frames.inc.swift').read_text() + '                default:throw UiCaptureFrameError.invalid', 'count': 1}]
data = source.read_text()
for a in anchors:
    assert data.count(a['find']) == a['count']
    data = data.replace(a['find'], a['replace'], a['count'])
out = HERE / 'source/AuxOwnedCommandDispatcher.swift'
out.parent.mkdir(exist_ok=True)
out.write_text(data)
plan = {'format': 'aux.ui-transaction-record-journal.source.v1',
        'predecessorManifest': str(PREVIOUS), 'predecessorManifestSha256': sha(PREVIOUS),
        'files': [{'path': source.name, 'input': str(source), 'inputSha256': row['sha256'],
                   'output': str(out), 'outputSha256': sha(out), 'anchors': anchors}],
        'authorityWireVersion': 6, 'additiveCaptureFrameOpcodes': [7, 8, 9, 10, 11, 12],
        'recordCountLimit': 64, 'aggregatePayloadBytesLimit': 67108864,
        'nativeCompiled': False, 'productExecuted': False, 'migrationActivationAuthorized': False}
(HERE / 'source-plan.json').write_text(json.dumps(plan, indent=2) + '\n')
print(json.dumps({'files': 1, 'anchors': len(anchors), 'outputSha256': sha(out)}))
