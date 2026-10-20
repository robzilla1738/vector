#!/usr/bin/env python3
"""Verify static supplied-source pins and replay only inside a temporary tree."""
import argparse
import hashlib
import json
from pathlib import Path
import struct
import subprocess
import tempfile


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--native-root', type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    evidence = json.loads((here / 'source-evidence.json').read_text())
    manifest = json.loads((here / 'manifest.json').read_text())
    binary = Path(evidence['originalBinary']['path']).read_bytes()
    assert sha(binary) == evidence['originalBinary']['sha256']
    for item in evidence['ranges']:
        start, end = int(item['start'], 16), int(item['endExclusive'], 16)
        assert sha(binary[start:end]) == item['bytesSha256']
        assert sha((here / item['file']).read_bytes()) == item['assemblySha256']
    for item in evidence['strings']:
        address = int(item['address'], 16)
        assert binary[address:address + 200].split(b'\0')[0].decode() == item['text']
    for item in evidence['readOnlyFiles']:
        assert sha(Path(item['path']).read_bytes()) == item['sha256'], item['path']
    qword = lambda address: struct.unpack_from('<Q', binary, address)[0] & 0xfffffffff
    word = lambda address: struct.unpack_from('<I', binary, address)[0]

    def branch_target(address):
        instruction = word(address)
        assert instruction & 0xfc000000 == 0x94000000
        immediate = instruction & 0x3ffffff
        if immediate & 0x2000000:
            immediate -= 0x4000000
        return address + (immediate << 2)

    assert qword(0xe1afe60 + 8) == 0x4104d10
    assert qword(0xe1afed0 + 8) == 0x41052a8
    assert branch_target(0x41051e8) == 0x77d8500
    assert branch_target(0x41055b0) == 0x77d8500
    assert word(0x41051e4) == 0x52800022  # setting ALLOW = 1
    assert word(0x41055ac) == 0x52800002  # setting DEFAULT = 0
    assert word(0x77d854c) == 0x528000c3  # original NOTIFICATIONS type = 6
    assert word(0x2d8cca0) == 0x528000c1  # base::Value dictionary = 6
    assert word(0x2d8ccbc) == 0x52800004  # registration flags = 0
    assert word(0x2d8ccc0) == 0x52800005  # additional registration operand = 0
    with tempfile.TemporaryDirectory(prefix='aux-notification-contract-') as directory:
        temporary = Path(directory)
        for item in manifest['files']:
            baseline = (args.native_root / item['path']).read_bytes()
            assert sha(baseline) == item['baselineSha256'], item['path']
            target = temporary / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline)
        subprocess.run(['git', 'apply', '--check', str(here / 'native.patch')],
                       cwd=temporary, check=True)
        subprocess.run(['git', 'apply', str(here / 'native.patch')],
                       cwd=temporary, check=True)
        for item in manifest['files']:
            output = (temporary / item['path']).read_bytes()
            assert sha(output) == item['outputSha256'], item['path']
            assert output == (here / 'source' / item['path']).read_bytes()
    print('PASS: original byte/registration/call pins and three-file temporary replay; no permission operation')


if __name__ == '__main__':
    main()
