#!/usr/bin/env python3
"""Verify bounded static source evidence without executing target code."""
import hashlib
import json
from pathlib import Path
import struct


def sha(data):
    return hashlib.sha256(data).hexdigest()


def main():
    here = Path(__file__).resolve().parent
    evidence = json.loads((here / 'source-evidence.json').read_text())
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

    def target(address):
        instruction = struct.unpack_from('<I', binary, address)[0]
        assert instruction & 0xfc000000 == 0x94000000
        immediate = instruction & 0x3ffffff
        if immediate & 0x2000000:
            immediate -= 0x4000000
        return address + (immediate << 2)

    assert target(0x40f9fc4) == 0x40fa214
    assert target(0x40fa028) == 0x40f88d0
    assert target(0x40fa05c) == 0x40fa608
    instruction = struct.unpack_from('<I', binary, 0x40fa060)[0]
    assert instruction == 0x37000560  # TBNZ w0, bit0, cleanup at0x40fa10c
    assert target(0x40f8be0) == 0x40fa6cc
    print('PASS: supplied delivery owner, payload/mode/dispatch calls and read-only source pins; no target execution')


if __name__ == '__main__':
    main()
