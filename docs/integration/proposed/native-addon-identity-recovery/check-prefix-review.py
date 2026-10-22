#!/usr/bin/env python3
"""Check review-only instruction predictions in memory. Never write a binary."""
import argparse
import hashlib
import json
from pathlib import Path
import struct

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source-snapshot', type=Path, required=True)
args = parser.parse_args()
plan = json.loads(Path(__file__).with_name('small-string-prefix-review.json').read_text())
assert plan['applied'] is False and plan['activationAllowed'] is False
checks = []
for role in plan['roles']:
    original = (args.source_snapshot / role['role'] / 'Contents/Resources/native/aside-native.node').read_bytes()
    assert hashlib.sha256(original).hexdigest() == role['inputSha256'], 'Original addon hash mismatch'
    predicted = bytearray(original)
    covered = set()
    for patch in role['patches']:
        start, size = patch['fileOffset'], patch['length']
        before, after = bytes.fromhex(patch['originalBytesHex']), bytes.fromhex(patch['replacementBytesHex'])
        assert len(before) == len(after) == size and size % 4 == 0
        assert original[start:start + size] == before, 'Instruction anchor drift'
        assert hashlib.sha256(before).hexdigest() == patch['originalSha256']
        assert hashlib.sha256(after).hexdigest() == patch['replacementSha256']
        assert not covered.intersection(range(start, start + size)), 'Overlapping instruction ranges'
        covered.update(range(start, start + size))
        for data, key in [(before, 'Before'), (after, 'After')]:
            registers = {}
            for old_word, word in zip(struct.unpack('<' + 'I' * (size // 4), before), struct.unpack('<' + 'I' * (size // 4), data)):
                assert (old_word & ~(0xffff << 5)) == (word & ~(0xffff << 5)), 'Non-immediate instruction change'
                rd, shift, immediate = word & 31, ((word >> 21) & 3) * 16, (word >> 5) & 0xffff
                opcode = word & 0x7f800000
                assert rd in [8, 9] and opcode in [0x52800000, 0x72800000]
                registers[rd] = ((registers.get(rd, 0) & ~(0xffff << shift)) if opcode == 0x72800000 else 0) | (immediate << shift)
            pair = registers[8].to_bytes(8, 'little') + registers[9].to_bytes(8, 'little')
            count = pair[15] & 15
            assert pair[:count].decode() == patch['decoded' + key]
            assert count == patch['utf8Bytes' + key]
            assert hex(pair[15]) == patch['swiftDiscriminator' + key]
        predicted[start:start + size] = after
    assert hashlib.sha256(predicted).hexdigest() == role['predictedPartialOutputSha256']
    assert all(i in covered for i, (a, b) in enumerate(zip(original, predicted)) if a != b)
    checks.append({'role': role['role'], 'reviewVerified': True, 'instructionCount': role['instructionCount'], 'binaryWritten': False, 'activationAllowed': False})
print(json.dumps({'checks': checks, 'runtimeAcceptance': False}))
