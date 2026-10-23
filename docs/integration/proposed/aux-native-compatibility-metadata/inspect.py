#!/usr/bin/env python3
"""Read public Mach-O headers/load commands only; never execute native code."""
from pathlib import Path
import argparse
import hashlib
import json
import struct


def version(value):
    return '.'.join(map(str, (value >> 16, (value >> 8) & 255, value & 255)))


def slices(data, start=0, size=None):
    size = len(data) if size is None else size
    magic = data[start:start + 4]
    if magic in (b'\xca\xfe\xba\xbe', b'\xca\xfe\xba\xbf'):
        wide = magic[-1] == 191
        count = struct.unpack_from('>I', data, start + 4)[0]
        if not 0 < count <= 32:
            raise ValueError('fat slice count')
        records = []
        for index in range(count):
            cursor = start + 8 + index * (32 if wide else 20)
            values = struct.unpack_from('>iiQQII' if wide else '>iiIII', data, cursor)
            offset, length = values[2:4]
            if offset + length > size:
                raise ValueError('fat slice range')
            records += slices(data, start + offset, length)
        return records
    formats = {b'\xcf\xfa\xed\xfe': ('<', 32), b'\xce\xfa\xed\xfe': ('<', 28),
               b'\xfe\xed\xfa\xcf': ('>', 32), b'\xfe\xed\xfa\xce': ('>', 28)}
    if magic not in formats:
        return []
    endian, header_size = formats[magic]
    _, cpu, subtype, filetype, count, command_bytes, flags = struct.unpack_from(endian + 'IiiIIII', data, start)
    if not 0 <= count <= 65536 or header_size + command_bytes > size:
        raise ValueError('load command range')
    cursor = start + header_size
    end = cursor + command_bytes
    build = []
    dependencies = []
    for _ in range(count):
        command, length = struct.unpack_from(endian + 'II', data, cursor)
        if length < 8 or cursor + length > end:
            raise ValueError('load command size')
        if command == 0x32:
            platform, minimum, sdk, tools = struct.unpack_from(endian + 'IIII', data, cursor + 8)
            build.append({'command': 'LC_BUILD_VERSION', 'platform': platform,
                          'minimumOS': version(minimum), 'sdk': version(sdk)})
        elif command == 0x24:
            minimum, sdk = struct.unpack_from(endian + 'II', data, cursor + 8)
            build.append({'command': 'LC_VERSION_MIN_MACOSX', 'platform': 1,
                          'minimumOS': version(minimum), 'sdk': version(sdk)})
        elif command in (0xC, 0x80000018, 0x8000001F, 0x20, 0x80000023):
            name_offset = struct.unpack_from(endian + 'I', data, cursor + 8)[0]
            if not 0 < name_offset < length:
                raise ValueError('dependency name')
            dependencies.append(data[cursor + name_offset:cursor + length].split(b'\0', 1)[0].decode())
        cursor += length
    architecture = {0x100000C: 'arm64', 0x1000007: 'x86_64', 12: 'arm', 7: 'x86'}.get(cpu, hex(cpu))
    return [{'architecture': architecture, 'cpuSubtype': subtype, 'fileType': filetype,
             'build': build, 'dependencies': dependencies}]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--artifact-root', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    root = args.artifact_root.resolve()
    candidate = Path('out/provided-candidate-aux-recovery-enrollment/Aux.app')
    snapshot = Path('out/provided-source-snapshot-1.26.1016.1852')
    extra = [snapshot / path for path in (
        'runtime/node/bin/node', 'daemon/Contents/MacOS/aside-daemon', 'cli/Contents/MacOS/aside',
        'computer-use/Contents/MacOS/aside-computer-use', 'daemon/Contents/Resources/native/aside-native.node',
        'daemon/Contents/Resources/native/node-pty/prebuilds/darwin-arm64/pty.node',
        'daemon/Contents/Resources/native/node-pty/prebuilds/darwin-arm64/spawn-helper')]
    extra.append(Path('out/aux-runtime-utilities-atomic-v4/aux-runtime-owned.node'))
    paths = [(p, 'actual-packaged-candidate') for p in sorted((root / candidate).rglob('*')) if p.is_file() and not p.is_symlink()]
    paths += [(root / p, 'supplied-source-or-retained-proposal') for p in extra]
    records = []
    for path, cohort in paths:
        with path.open('rb') as stream:
            magic = stream.read(4)
            if magic not in (b'\xca\xfe\xba\xbe', b'\xca\xfe\xba\xbf', b'\xcf\xfa\xed\xfe', b'\xce\xfa\xed\xfe', b'\xfe\xed\xfa\xcf', b'\xfe\xed\xfa\xce'):
                continue
            stream.seek(0)
            data = stream.read()
        records.append({'path': str(path.relative_to(root)), 'cohort': cohort, 'bytes': len(data),
                        'sha256': hashlib.sha256(data).hexdigest(), 'slices': slices(data)})
    versions = [tuple(map(int, build['minimumOS'].split('.'))) for record in records for item in record['slices'] if item['architecture'] == 'arm64' for build in item['build'] if build['platform'] == 1]
    result = {'format': 'aux.native.compatibility.metadata.v1', 'nativeExecution': False,
              'scope': 'Actual candidate Mach-O files plus exact supplied critical inputs and retained own-runtime proposal; symlink aliases omitted',
              'candidate': str(candidate), 'records': records, 'machOFiles': len(records),
              'maximumDeclaredArm64MacOSMinimum': '.'.join(map(str, max(versions))),
              'runtimeCompatibilityProven': False, 'newNativeMainBuilt': False}
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({key: result[key] for key in ('machOFiles', 'maximumDeclaredArm64MacOSMinimum', 'runtimeCompatibilityProven')}))


if __name__ == '__main__':
    main()
