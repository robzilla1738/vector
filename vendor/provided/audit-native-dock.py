#!/usr/bin/env python3
"""Read-only static anchors from the supplied arm64 native framework.

Never loads/runs the framework. Raw instruction anchors retain their scope;
recovered function roles are in the companion document, not asserted here.
"""
import hashlib
import json
import mmap
import struct
import sys

PINNED_ARM64 = '64c6c8a366d36d4c86b429de2f7fb0b7103099317f0a84f1cfded1bc87f4b31c'
with open(sys.argv[1], 'rb') as source:
    with mmap.mmap(source.fileno(), 0, access=mmap.ACCESS_READ) as data:
        if data[:4] != bytes.fromhex('cafebabe'):
            raise ValueError('Expected supplied universal Mach-O')
        count = struct.unpack_from('>I', data, 4)[0]
        arm = None
        for index in range(count):
            cpu, subtype, offset, size, align = struct.unpack_from('>IIIII', data, 8 + index * 20)
            if cpu == 0x100000c:
                arm = (offset, size)
        if arm is None:
            raise ValueError('Missing arm64 slice')
        offset, size = arm
        view = memoryview(data)[offset:offset + size]
        digest = hashlib.sha256(view).hexdigest()
        if digest != PINNED_ARM64:
            view.release()
            raise ValueError('Supplied native framework hash mismatch')
        ranges = [
            ('dock-state-handler', 0x814c024, 0x814c18c),
            ('dock-add-handler', 0x814c190, 0x814c1bc),
            ('dock-presence-primitive', 0x303395c, 0x3033a18),
            ('import-input-handler-prefix', 0x4276580, 0x42769b0),
        ]
        anchors = [{'name': name, 'arm64RvaStart': hex(start),
                    'arm64RvaEndExclusive': hex(end),
                    'sha256': hashlib.sha256(view[start:end]).hexdigest()}
                   for name, start, end in ranges]
        instructions = [(0x814c044, 0x96bb9e46), (0x814c050, 0x1a9f07f7),
                        (0x814c0e4, 0x1a9f17e8), (0x814c1a4, 0x94000358)]
        for address, expected in instructions:
            if struct.unpack_from('<I', view, address)[0] != expected:
                raise ValueError(f'Instruction drift at {address:x}')
        report = {'arm64Sha256': digest, 'arm64SliceOffset': offset, 'arm64SliceBytes': size,
                  'anchors': anchors,
                  'dockStateFields': {'supported': 'true', 'isAdded': 'status != 1', 'canAdd': 'status == 1'},
                  'statusValues': {'readFailure': 0, 'absent': 1, 'present': 2},
                  'limits': 'Bounded static raw instructions; no target execution or OS state reads. Dock primitive role inferred from matching upstream implementation and observed call chain. Import prefix does not prove absence of later or inherited gesture guards.'}
        view.release()
        print(json.dumps(report, indent=2))
