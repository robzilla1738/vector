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
            ('launch-private-entitlement-check', 0x407a394, 0x407a424),
            ('launch-run-delegate-call', 0x407a594, 0x407a644),
            ('launch-chrome-delegate', 0x40c9570, 0x40c97b4),
            ('capture-webcontents-permission-call', 0x760fd90, 0x760fe5c),
            ('capture-page-authorization', 0xa286780, 0xa286ba4),
        ]
        anchors = [{'name': name, 'arm64RvaStart': hex(start),
                    'arm64RvaEndExclusive': hex(end),
                    'sha256': hashlib.sha256(view[start:end]).hexdigest()}
                   for name, start, end in ranges]
        instructions = [(0x407a3c8, 0x7104593f), (0x407a608, 0x94013bda),
                        (0x760fe10, 0x94b1da5c)]
        for address, expected in instructions:
            if struct.unpack_from('<I', view, address)[0] != expected:
                raise ValueError(f'Instruction drift at {address:x}')
        schema = b'{"name":"launchExtension","parameters":[{"name":"id","type":"string"}],"returns_async":{"name":"callback","optional":true,"parameters":[]}}'
        schema_at = data.find(schema, offset, offset + size)
        if schema_at < 0:
            raise ValueError('Original launchExtension schema missing')
        literals = {}
        for needle in [b'capture-tab-without-userinteraction', b'launchExtension', b'expose-wv', b'attachTab']:
            occurrences = []
            cursor = offset
            while True:
                cursor = data.find(needle, cursor, offset + size)
                if cursor < 0:
                    break
                occurrences.append(hex(cursor - offset))
                cursor += len(needle)
            literals[needle.decode()] = occurrences
        report = {'arm64Sha256': digest, 'arm64SliceOffset': offset, 'arm64SliceBytes': size,
                  'anchors': anchors, 'launchExtensionSchemaArm64Rva': hex(schema_at - offset),
                  'launchExtensionSchema': json.loads(schema), 'literalOccurrences': literals,
                  'limits': 'Static original Chromium153 framework. Raw literal absence does not establish missing behavior. No target execution. The newer supplied UI may target rolling/canary native features.'}
        view.release()
        print(json.dumps(report, indent=2))
