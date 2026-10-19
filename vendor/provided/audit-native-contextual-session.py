#!/usr/bin/env python3
"""Read-only original registration/dispatch audit; never loads target code."""
import argparse
import hashlib
import json
import mmap
import struct
from pathlib import Path

SLICE_OFFSET = 273940480
SLICE_SIZE = 249334160
SLICE_SHA = '64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c'
RUNS = {
    'getPlaceholderConfig': (0xEAD8118, 0x46AEC1C, 0xE26FA18, 0x4285B58),
    'getRecentTabs': (0xEAD8130, 0x46AEC6C, 0xE26FA88, 0x4285E20),
    'getTabPreview': (0xEAD8148, 0x46AECBC, 0xE26FAF8, 0x42860E8),
    'getInputState': (0xEAD8160, 0x46AED0C, 0xE26FB68, 0x42864AC),
    'createSession': (0xEAD7FC8, 0x46AE7BC, 0xE26F3F8, 0x427FDC0),
    'notifySessionStarted': (0xEAD8178, 0x46AED5C, 0xE26FBD8, 0x4286780),
    'notifySessionAbandoned': (0xEAD8190, 0x46AEDAC, 0xE26FC48, 0x42869E0),
    'addFileContext': (0xEAD81A8, 0x46AEDFC, 0xE26FCB8, 0x4286C40),
    'openLensSearch': (0xEAD8220, 0x46AEF8C, 0xE26FEE8, 0x4288500),
}


def audit(path):
    with path.open('rb') as source, mmap.mmap(
            source.fileno(), 0, access=mmap.ACCESS_READ) as data:
        arm = data[SLICE_OFFSET:SLICE_OFFSET + SLICE_SIZE]
        assert hashlib.sha256(arm).hexdigest() == SLICE_SHA, 'Original slice drift'
        def u32(offset):
            return struct.unpack_from('<I', arm, offset)[0]
        def pointer(offset):
            return struct.unpack_from('<Q', arm, offset)[0] & 0xFFFFFFFFF
        for name, (table, factory, vtable, run) in RUNS.items():
            name_address = pointer(table)
            expected = ('asideOmnibox.' + name).encode() + b'\0'
            assert bytes(arm[name_address:name_address + len(expected)]) == expected
            assert pointer(table - 8) == factory
            found = False
            for offset in range(factory, factory + 64, 4):
                instruction = u32(offset)
                if instruction & 0x9F00001F != 0x90000008:
                    continue
                immediate = ((instruction >> 29) & 3) | (((instruction >> 5) & 0x7FFFF) << 2)
                if immediate & (1 << 20):
                    immediate -= 1 << 21
                add = u32(offset + 4)
                if add & 0xFFC003FF == 0x91000108:
                    found |= (offset & ~4095) + (immediate << 12) + ((add >> 10) & 4095) == vtable
            assert found, name + ' factory/vtable drift'
            assert pointer(vtable + 8) == run, name + ' Run drift'
        # Real openLensSearch dispatch: session handler +0x88, delegate +0x68,
        # model +0x28; BL native OmniboxEditModel at RVA0x7bb6630.
        assert u32(0x42885E4) == 0xF9404408
        assert u32(0x42885E8) == 0xF9403508
        assert u32(0x42885F0) == 0xF9401500
        call = u32(0x42885FC)
        assert call & 0xFC000000 == 0x94000000
        immediate = call & 0x3FFFFFF
        if immediate & (1 << 25):
            immediate -= 1 << 26
        assert 0x42885FC + immediate * 4 == 0x7BB6630
        result = {name: {'table': hex(v[0]), 'factory': hex(v[1]),
                         'vtable': hex(v[2]), 'run': hex(v[3])}
                  for name, v in RUNS.items()}
        result['openLensSearchBodySha256'] = hashlib.sha256(
            arm[0x4288500:0x4288774]).hexdigest()
        # Bounded ADRP/ADD source anchors recover exact original object keys.
        keys = {
            0x428F320: 'toolMode', 0x428F51C: 'modelMode',
            0x428FBE8: 'maxInstances', 0x428FC7C: 'imageGenUploadActive',
            0x4290278: 'key', 0x4290280: 'value',
            0x4290350: 'internalTabId', 0x42903EC: 'tabId',
            0x42905E4: 'lastActiveMs', 0x4290F14: 'texts',
            0x4290F7C: 'changeTextAnimationIntervalMs',
            0x4291008: 'fadeTextAnimationDurationMs',
            0x42914D4: 'hasPreview', 0x4291524: 'previewDataUrl',
            0x42915C4: 'available', 0x4291614: 'state',
        }
        for offset, text in keys.items():
            adrp, add = u32(offset), u32(offset + 4)
            assert adrp & 0x9F000000 == 0x90000000
            assert add & 0xFFC00000 == 0x91000000
            assert (add >> 5) & 31 == adrp & 31
            immediate = ((adrp >> 29) & 3) | (((adrp >> 5) & 0x7FFFF) << 2)
            if immediate & (1 << 20): immediate -= 1 << 21
            address = (offset & ~4095) + (immediate << 12) + ((add >> 10) & 4095)
            expected = text.encode() + b'\0'
            assert arm[address:address + len(expected)] == expected, text
        result['objectKeyInstructionAnchors'] = {hex(k): v for k, v in keys.items()}
        result['converterRanges'] = {
            name: {'start': hex(start), 'size': size,
                   'sha256': hashlib.sha256(arm[start:start + size]).hexdigest()}
            for name, start, size in [
                ('uploadStatus', 0x428C6CC, 1156),
                ('fileContextAdded', 0x428CBEC, 664),
                ('uploadError', 0x428E780, 0x440),
                ('inputState', 0x428EC64, 0x1028),
                ('toolModelParams', 0x428FE00, 0x51C),
                ('tabInfo', 0x429031C, 0x330),
                ('placeholderReply', 0x4290E80, 0x260),
                ('previewAndInputStateReply', 0x42914A0, 0x220)]
        }
        return result


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('framework', type=Path)
    args = parser.parse_args()
    print(json.dumps(audit(args.framework), indent=2))
