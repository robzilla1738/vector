"""One exact source replay; no native execution, fixture or app claim."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
root = None
for fact in plan.get('consumedNativeBackend', []):
    data = (Path(plan['physicalRoot']) / fact['path']).read_bytes()
    assert sha(data) == fact['sha256']
    for anchor in fact['anchors']:
        assert data.decode().count(anchor['find']) == anchor['count']
tree = Path(tempfile.mkdtemp(prefix='aux-known-mixture-replay-', dir='/private/tmp'))
git = lambda *args: subprocess.run(['git', '-C', str(tree), *map(str, args)], check=True, capture_output=True)
for row in plan['files']:
    original = (Path(row['inputRoot']) / row['path']).read_bytes()
    assert sha(original) == row['inputSha256']
    current = original.decode()
    for anchor in row['anchors']:
        assert anchor['count'] == current.count(anchor['find']) == 1
        current = current.replace(anchor['find'], anchor['replace'])
    assert sha(current.encode()) == row['outputSha256']
    assert (HERE / 'source' / row['path']).read_bytes() == current.encode()
    target = tree / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(original)
git('init', '-q')
git('add', '--all')
git('apply', '--check', HERE / 'native.patch')
git('apply', HERE / 'native.patch')
for row in plan['files']:
    assert sha((tree / row['path']).read_bytes()) == row['outputSha256']
git('apply', '--reverse', '--check', HERE / 'native.patch')
git('diff', '--check')
for row in plan['files']:
    assert sha((Path(row['inputRoot']) / row['path']).read_bytes()) == row['inputSha256']
result = {'format': 'aux.known-mixture.source-check.actual.v1', 'passed': True,
          'sourcePlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
          'patchSha256': sha((HERE / 'native.patch').read_bytes()),
          'files': len(plan['files']), 'countedAnchors': sum(len(row['anchors']) for row in plan['files']),
          'replayDirectory': str(tree), 'exactReplayPassed': True, 'reverseCheckPassed': True,
          'nativeCheckoutChanged': False, 'nativeCompiled': False, 'testsExecuted': False,
          'productExecuted': False, 'runtimeAcceptance': False}
(HERE / 'actual-source-check-a17d.json').write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
