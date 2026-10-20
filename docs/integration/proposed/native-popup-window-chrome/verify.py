#!/usr/bin/env python3
"""Pinned source/selector verification and disposable patch replay only."""
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
    qword = lambda address: struct.unpack_from('<Q', binary, address)[0] & 0xfffffffff
    word = lambda address: struct.unpack_from('<I', binary, address)[0]

    def page(address, instruction):
        immediate = ((instruction >> 5) & 0x7ffff) << 2 | ((instruction >> 29) & 3)
        if immediate & 0x100000:
            immediate -= 0x200000
        return (address & ~4095) + (immediate << 12)

    for item in evidence['ranges']:
        start, end = int(item['start'], 16), int(item['endExclusive'], 16)
        assert sha(binary[start:end]) == item['bytesSha256']
        assert sha((here / item['file']).read_bytes()) == item['assemblySha256']
    for item in evidence['windowClassTable']:
        reference = qword(int(item['tableSlot'], 16))
        actual_class = qword(reference)
        data = qword(actual_class + 32) & ~7
        name = qword(data + 24)
        assert reference == int(item['classRef'], 16)
        assert actual_class == int(item['class'], 16)
        assert data == int(item['data'], 16)
        assert name == int(item['nameAddress'], 16)
        assert binary[name:name + 100].split(b'\0')[0].decode() == item['name']
    for item in evidence['selectors']:
        call = int(item['call'], 16)
        stub = page(call, word(call)) + ((word(call + 4) >> 10) & 4095)
        slot = page(stub, word(stub)) + (((word(stub + 4) >> 10) & 4095) * 8)
        name = qword(slot)
        assert stub == int(item['stub'], 16)
        assert slot == int(item['selectorSlot'], 16)
        assert name == int(item['selectorAddress'], 16)
        assert binary[name:name + 100].split(b'\0')[0].decode() == item['name']
        assert sha(binary[call:call + 12]) == item['trampolineSha256']
        assert sha(binary[stub:stub + 20]) == item['stubSha256']
    assert list(struct.unpack_from('<QQQ', binary, 0xd3a8540)) == evidence['buttonTypes']
    assert evidence['buttonTypes'] == [0, 1, 2]
    sdk = evidence['appKitStyleHeader']
    assert sha(Path(sdk['path']).read_bytes()) == sdk['sha256']
    for item in evidence['nativeReadOnlyReferences']:
        assert sha((args.native_root / item['path']).read_bytes()) == item['sha256']
    with tempfile.TemporaryDirectory(prefix='aux-popup-chrome-') as directory:
        temporary = Path(directory)
        for item in manifest['files']:
            baseline = (args.native_root / item['path']).read_bytes()
            assert sha(baseline) == item['baselineSha256']
            target = temporary / item['path']
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(baseline)
        subprocess.run(['git', 'apply', str(here / 'native.patch')], cwd=temporary, check=True)
        for item in manifest['files']:
            actual = (temporary / item['path']).read_bytes()
            assert sha(actual) == item['outputSha256']
            assert actual == (here / 'source' / item['path']).read_bytes()
    print('PASS: original byte/selector/class/style pins and three-file replay; no native mutation')


if __name__ == '__main__':
    main()
