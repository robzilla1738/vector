#!/usr/bin/env python3
"""Read-only original content exception anchors; no target loading/execution."""
import argparse
import hashlib
import json
import mmap
from pathlib import Path
import struct

EXPECTED = '64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c'
RANGES = {
    'browserCallbackExactEligibleUrl': (0x409ED78, 0x409EE60),
    'startAttributeStamp': (0x4057C60, 0x4057CB0),
    'createRevalidation': (0x404249C, 0x4042508),
    'backgroundBypass': (0x40426E0, 0x404270C),
    'schemeAndEffectiveUrlChecks': (0x404281C, 0x4042874),
    'candidateEffectiveUrlNormalPath': (0x4042D20, 0x4042D40),
    'startHostRevalidation': (0x4043040, 0x4043070),
    'throttleExactUrlAndRevalidation': (0x4043944, 0x4043A68),
    'globalContentClientVtableProof': (0x1E60260, 0x1E60288),
    'browserClientConstructionVtable': (0x2ED2EC0, 0x2ED2EE0),
}


def audit(path):
    with path.open('rb') as source, mmap.mmap(source.fileno(), 0, access=mmap.ACCESS_READ) as raw:
        assert hashlib.sha256(raw).hexdigest() == EXPECTED
        word = lambda address: struct.unpack_from('<I', raw, address)[0]
        pointer = lambda address: struct.unpack_from('<Q', raw, address)[0] & 0xFFFFFFFFF
        assert pointer(0xE154558 + 0x8D0) == 0x409ED78
        assert word(0x409EDA8) & 0xFC000000 == 0x94000000
        immediate = word(0x409EDA8) & 0x3FFFFFF
        if immediate & (1 << 25):
            immediate -= 1 << 26
        assert 0x409EDA8 + immediate * 4 == 0x42B14C0
        # Original Start stamps attrbool+0x78 through the same vtable callback.
        assert word(0x4057C60) == 0x71000EFF  # cmp trigger,3
        assert word(0x4057C98) == 0xF9446908  # load virtual+0x8d0
        assert word(0x4057CAC) == 0x390623E0  # attr+0x78 result bool
        assert word(0x40424A4) == 0x3941E288  # revalidate bool attribute
        assert word(0x40424C4) == 0x71000D1F  # embedder trigger3
        assert word(0x4042824) == 0x2A000368  # local trusted OR HTTP(S)
        assert word(0x404286C) == 0x360025BB  # effective URL gated by local trusted
        assert word(0x4043040) == 0x3941E288  # StartHost revalidation flag
        assert word(0x4043064) == 0xF9446908  # same callback
        assert word(0x4043948) == 0x3941E116  # throttle trusted flag
        assert word(0x4043A4C) == 0xF9446908  # throttle revalidation callback
        return {'targetSha256': EXPECTED, 'targetExecuted': False,
                'originalBrowserClientVtable': '0xe154558',
                'originalCallbackSlot': '0x8d0', 'originalCallback': '0x409ed78',
                'callbackPredicate': 'current profile eligibility042b14c0 has URL AND requested GURL equals it',
                'ranges': {name: {'start': hex(start), 'endExclusive': hex(end),
                                  'sha256': hashlib.sha256(raw[start:end]).hexdigest()}
                           for name, (start, end) in RANGES.items()},
                'scope': 'bounded instructions; current155 port uncompiled and unapplied'}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('thin_arm64', type=Path)
    print(json.dumps(audit(parser.parse_args().thin_arm64), indent=2))
