#!/usr/bin/env python3
"""Verify only pinned static inputs and disposable patch replay."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--native-root', type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    manifest = json.loads((here / 'manifest.json').read_text())
    evidence = json.loads((here / 'source-evidence.json').read_text())
    binary = Path(evidence['originalBinary']['path']).read_bytes()
    assert sha(binary) == evidence['originalBinary']['sha256']
    for item in evidence['ranges']:
        start, end = int(item['start'], 16), int(item['endExclusive'], 16)
        assert sha(binary[start:end]) == item['bytesSha256']
        assert sha((here / item['file']).read_bytes()) == item['assemblySha256']
    for address, label in evidence['utf16Labels'].items():
        start = int(address, 16)
        assert binary[start:start + len(label) * 2].decode('utf-16-le') == label
    decompile = evidence['decompile']
    assert sha(Path(decompile['path']).read_bytes()) == decompile['sha256']
    for item in evidence['unchangedConfirmationPrimitive']:
        assert sha((args.native_root / item['path']).read_bytes()) == item['sha256']
    with tempfile.TemporaryDirectory(prefix='aux-chat-confirmation-') as directory:
        temporary = Path(directory)
        for item in manifest['files']:
            baseline = (args.native_root / item['path']).read_bytes()
            assert sha(baseline) == item['baselineSha256']
            target = temporary / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline)
        subprocess.run(['git', 'apply', '--unsafe-paths', str(here / 'native.patch')],
                       cwd=temporary, check=True)
        for item in manifest['files']:
            output = (temporary / item['path']).read_bytes()
            assert sha(output) == item['outputSha256']
            assert output == (here / 'source' / item['path']).read_bytes()
    print('PASS: original ranges/labels/primitive and single-file patch replay; no native mutation')


if __name__ == '__main__':
    main()
