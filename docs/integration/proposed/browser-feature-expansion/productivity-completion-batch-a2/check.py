"""Replay the narrow native patch without compiling or editing Chromium."""
import hashlib
import json
import subprocess
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
sha = lambda data: hashlib.sha256(data).hexdigest()
plan = json.loads((HERE / 'source-plan.json').read_text())
root = Path(plan['root'])
with tempfile.TemporaryDirectory(prefix='aux-productivity-completion-replay-') as directory:
    tree = Path(directory)
    subprocess.run(['git', 'init', '-q', str(tree)], check=True)
    for row in plan['files']:
        original = (root / row['path']).read_bytes()
        assert sha(original) == row['inputSha256']
        text = original.decode()
        for anchor in row['anchors']:
            assert text.count(anchor['find']) == anchor['count']
            text = text.replace(anchor['find'], anchor['replace'])
        assert sha(text.encode()) == row['outputSha256']
        assert Path(row['source']).read_bytes() == text.encode()
        target = tree / row['path']
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(original)
    subprocess.run(['git', '-C', str(tree), 'add', '--all'], check=True)
    for args in [['--check'], []]:
        subprocess.run(['git', '-C', str(tree), 'apply', *args, str(HERE / 'native.patch')], check=True)
    for row in plan['files']:
        assert sha((tree / row['path']).read_bytes()) == row['outputSha256']
        assert sha((root / row['path']).read_bytes()) == row['inputSha256']
    subprocess.run(['git', '-C', str(tree), 'apply', '--reverse', '--check', str(HERE / 'native.patch')], check=True)
receipt = {'format': 'aux.productivity-completion.replay.actual.v2', 'passed': True,
           'sourcePlanSha256': sha((HERE / 'source-plan.json').read_bytes()),
           'patchSha256': sha((HERE / 'native.patch').read_bytes()), 'files': len(plan['files']),
           'exactReplayPassed': True, 'reverseCheckPassed': True,
           'nativeCheckoutChanged': False, 'nativeBuildRun': False,
           'productExecuted': False, 'providerRequests': 0, 'runtimeAcceptance': False}
(HERE / 'actual-replay-a1.json').write_text(json.dumps(receipt, indent=2) + '\n')
print(json.dumps(receipt))
