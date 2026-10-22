#!/usr/bin/env python3
"""Verify proposal snapshots/anchors and replay only in a disposable directory."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--native-root', type=Path,
                        help='Optional read-only comparison to the exact proposal baseline')
    options = parser.parse_args()
    root = Path(__file__).resolve().parent
    manifest = json.loads((root / 'manifest.json').read_text())
    patch = (root / 'native.patch').read_bytes()
    assert sha(patch) == manifest['patchSha256']
    total = 0
    with tempfile.TemporaryDirectory(prefix='aux-pref-identity-') as temporary:
        sandbox = Path(temporary).resolve()
        for item in manifest['files']:
            path = Path(item['path'])
            assert not path.is_absolute() and '..' not in path.parts
            baseline = (root / 'baseline' / path).read_bytes()
            output = (root / 'source' / path).read_bytes()
            assert sha(baseline) == item['baselineSha256'], path
            assert sha(output) == item['outputSha256'], path
            if options.native_root:
                assert (options.native_root / path).read_bytes() == baseline, path
            text = baseline.decode()
            for edit in item['edits']:
                assert text.count(edit['find']) == edit['count'], (path, edit['find'])
                assert edit['find'].startswith('"aside.') and edit['find'].endswith('"')
                assert edit['replace'] == edit['find'].replace('"aside.', '"aux.', 1)
                total += edit['count']
                text = text.replace(edit['find'], edit['replace'])
            assert text.encode() == output, path
            target = sandbox / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline)
        environment = {key: value for key, value in os.environ.items()
                       if not key.startswith('GIT_')}
        environment['GIT_CEILING_DIRECTORIES'] = str(sandbox)
        subprocess.run(['git', 'apply', '--check', '-'], input=patch,
                       cwd=sandbox, env=environment, check=True, capture_output=True)
        subprocess.run(['git', 'apply', '-'], input=patch,
                       cwd=sandbox, env=environment, check=True, capture_output=True)
        for item in manifest['files']:
            assert (sandbox / item['path']).read_bytes() == (root / 'source' / item['path']).read_bytes()
    print(json.dumps({'files': len(manifest['files']), 'keys': len(manifest['keys']),
                      'quotedReplacements': total, 'snapshotReplay': True,
                      'sharedNativeChanged': False, 'compiled': False}))


if __name__ == '__main__':
    main()
