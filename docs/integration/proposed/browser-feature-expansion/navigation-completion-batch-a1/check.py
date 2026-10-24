"""Check exact native replay without editing Chromium or executing the product."""
import hashlib
import json
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
revision = sys.argv[1] if len(sys.argv) == 2 else 'a1'
assert revision in ['a1', 'a2', 'a3', 'a4']
OUT = Path('/private/tmp/aux-navigation-completion-replay-20261024-' + revision)
OUT.mkdir(mode=0o700)
TREE = OUT / 'tree'
TREE.mkdir()
sha = lambda path: hashlib.sha256(Path(path).read_bytes()).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
for row in plan['files']:
    assert sha(ROOT / row['path']) == row['inputSha256']
    assert sha(row['output']) == row['outputSha256']
    text = (ROOT / row['path']).read_text()
    for anchor in row['anchors']:
        assert text.count(anchor['find']) == anchor['count'] == 1
        text = text.replace(anchor['find'], anchor['replace'])
    assert text == Path(row['output']).read_text()
    target = TREE / row['path']
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes((ROOT / row['path']).read_bytes())


def git(*args):
    return subprocess.run(['git', '-C', str(TREE), *map(str, args)], check=True, capture_output=True)


git('init', '-q')
git('apply', '--check', HERE / 'native.patch')
git('apply', HERE / 'native.patch')
for row in plan['files']:
    assert sha(TREE / row['path']) == row['outputSha256']
    assert sha(ROOT / row['path']) == row['inputSha256']
git('apply', '--reverse', '--check', HERE / 'native.patch')
receipt = {'format': 'aux.navigation-completion.replay.actual.v1', 'passed': True,
           'sourcePlanSha256': sha(HERE / 'source-plan.json'), 'patchSha256': sha(HERE / 'native.patch'),
           'output': str(OUT), 'files': len(plan['files']),
           'countedAnchors': sum(len(row['anchors']) for row in plan['files']),
           'exactReplayPassed': True, 'reverseCheckPassed': True,
           'nativeRootChanged': False, 'nativeCompiled': False,
           'productExecuted': False, 'runtimeAccepted': False}
(HERE / ('actual-replay-' + revision + '.json')).write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
