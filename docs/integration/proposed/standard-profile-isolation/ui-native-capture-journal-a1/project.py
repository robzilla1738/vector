"""Project a native-only capture journal into the actual current dispatcher."""
import difflib
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
inputs = json.loads((HERE / 'inputs.json').read_text())
for row in inputs['sourceFiles']:
    assert sha(row['path']) == row['sha256']
original_path = Path(inputs['dispatcher'])
source = original_path.read_text()
insertion = (HERE / 'source/journal.inc.swift').read_text() + '\n'
anchor = '    func withContext<T>(_ handle:UInt64,_ action:(AuxInstallationCommandCore)throws->T)throws->T {'
assert source.count(anchor) == 1
anchors = []
if 'import Darwin\n' not in source:
    before, after = 'import CryptoKit\n', 'import CryptoKit\nimport Darwin\n'
    assert source.count(before) == 1
    source = source.replace(before, after)
    anchors.append({'find': before, 'replace': after, 'count': 1})
source = source.replace(anchor, insertion + anchor)
anchors.append({'find': anchor, 'replace': insertion + anchor, 'count': 1})
target = HERE / 'source/AuxOwnedCommandDispatcher.swift'
target.write_text(source)
row = {'path': str(original_path), 'inputSha256': sha(original_path),
       'output': str(target), 'outputSha256': sha(target), 'anchors': anchors}
files = [row]
patches = list(difflib.unified_diff(original_path.read_text().splitlines(True), source.splitlines(True),
                                  fromfile='a/AuxOwnedCommandDispatcher.swift',
                                  tofile='b/AuxOwnedCommandDispatcher.swift'))
def project_guard(filename, anchor, insertion):
    original = Path(next(row['path'] for row in inputs['sourceFiles']
                         if Path(row['path']).name == filename))
    before = original.read_text()
    assert before.count(anchor) == 1
    after = before.replace(anchor, insertion + anchor)
    output = HERE / 'source' / filename
    output.write_text(after)
    files.append({'path': str(original), 'inputSha256': sha(original),
                  'output': str(output), 'outputSha256': sha(output),
                  'anchors': [{'find': anchor, 'replace': insertion + anchor, 'count': 1}]})
    patches.extend(difflib.unified_diff(before.splitlines(True), after.splitlines(True),
                                       fromfile='a/' + filename, tofile='b/' + filename))
project_guard('AuxBrowserFreshRootAdmission.swift', '    func receipt()throws->Data {', '''    // Read-only: journal copies cannot invalidate the fresh PREPARED inventory.
    func verifyUiCaptureJournalAdmission()throws {
        guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}
        lock.lock();defer{lock.unlock()}
        try validateLocked()
        guard phase == .admitted else{throw AuxFreshColdGuardError.path}
    }
''')
project_guard('AuxFreshColdInstallerGuard.swift', '    func browserStartupReceipt()throws->Data {', '''    func verifyUiCaptureJournalAdmission()throws {
        try revalidate()
        try browserAdmission.verifyUiCaptureJournalAdmission()
        try revalidate()
    }
''')
project_guard('AuxNativeFreshStageCoordinator.swift', '    func browserStartupReceipt()throws->Data {', '''    func verifyUiCaptureJournalAdmission()throws {
        try revalidateNativeStageBinding()
        try coldGuard.verifyUiCaptureJournalAdmission()
        try revalidateNativeStageBinding()
    }
''')
(HERE / 'source-plan.json').write_text(json.dumps({
    'format': 'aux.ui-native-capture-journal.source.v1', 'files': files,
    'inputsSha256': sha(HERE / 'inputs.json'),
    'privateStoreOnly': True, 'activationAuthorized': False}, indent=2) + '\n')
(HERE / 'native.patch').write_text(''.join(patches))
print(json.dumps({'projectedFiles': len(files), 'countedAnchors': sum(len(row['anchors']) for row in files),
                  'actualNativeSourceUnchanged': sha(original_path) == row['inputSha256']}))
