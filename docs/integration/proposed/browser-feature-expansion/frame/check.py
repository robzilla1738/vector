#!/usr/bin/env python3
"""Replay this exact inactive proposal; never mutate the selected native tree."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import tempfile

root = Path(__file__).resolve().parent
manifest = json.loads((root / 'files.json').read_text())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


assert sha(root / 'native.patch') == manifest['patchSha256']
with tempfile.TemporaryDirectory(prefix='aux-frame-replay-') as temp:
    tree = Path(temp)
    for record in manifest['files']:
        rel = Path(record['path'])
        assert not rel.is_absolute() and '..' not in rel.parts
        assert sha(root / 'source' / rel) == record['sourceSha256']
        if record['baselineSha256']:
            old = root / 'baseline' / rel
            assert sha(old) == record['baselineSha256']
            assert sha(Path(manifest['selectedNativeRoot']) / rel) == record['baselineSha256']
            (tree / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(old, tree / rel)
        else:
            assert not (Path(manifest['selectedNativeRoot']) / rel).exists()
    subprocess.run(['git', 'apply', '--check', str(root / 'native.patch')], cwd=tree, check=True)
    subprocess.run(['git', 'apply', str(root / 'native.patch')], cwd=tree, check=True)
    for record in manifest['files']:
        assert sha(tree / record['path']) == record['sourceSha256']
print(json.dumps({'sourceReplay': 'passed', 'files': len(manifest['files']),
                  'nativeTreeMutated': False, 'appRun': False}))
