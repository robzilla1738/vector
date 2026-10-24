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
insertion = (HERE / 'source/journal.inc.swift').read_text()
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
(HERE / 'source-plan.json').write_text(json.dumps({
    'format': 'aux.ui-native-capture-journal.source.v1', 'files': [row],
    'inputsSha256': sha(HERE / 'inputs.json'),
    'privateStoreOnly': True, 'activationAuthorized': False}, indent=2) + '\n')
patch = difflib.unified_diff(original_path.read_text().splitlines(True), source.splitlines(True),
                             fromfile='a/AuxOwnedCommandDispatcher.swift',
                             tofile='b/AuxOwnedCommandDispatcher.swift')
(HERE / 'native.patch').write_text(''.join(patch))
print(json.dumps({'projectedFiles': 1, 'countedAnchors': len(anchors),
                  'actualNativeSourceUnchanged': sha(original_path) == row['inputSha256']}))
