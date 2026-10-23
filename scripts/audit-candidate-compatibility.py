#!/usr/bin/env python3
"""Inventory the actual candidate's Mach-O requirements without executing it.

Use the existing reviewed metadata decoder; historical audit inputs stay intact.
This reports declared requirements, never runtime compatibility or readiness.
"""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
DECODER = REPO / 'docs/integration/proposed/aux-native-compatibility-metadata/inspect.py'
spec = importlib.util.spec_from_file_location('aux_macho_metadata', DECODER)
metadata = importlib.util.module_from_spec(spec)
spec.loader.exec_module(metadata)
MAGICS = {b'\xca\xfe\xba\xbe', b'\xca\xfe\xba\xbf', b'\xcf\xfa\xed\xfe',
          b'\xce\xfa\xed\xfe', b'\xfe\xed\xfa\xcf', b'\xfe\xed\xfa\xce'}


def inspect(candidate):
    if candidate.is_symlink() or not candidate.is_dir() or candidate.suffix != '.app':
        raise ValueError('An explicit regular .app candidate is required')
    root = candidate.resolve()
    current = root
    for part in ('Contents', 'Resources', 'aux', 'bundle.json'):
        current /= part
        if current.is_symlink():
            raise ValueError('Candidate marker must not traverse symlinks')
    marker_bytes = current.read_bytes()
    marker = json.loads(marker_bytes)
    if marker.get('implementation') != 'supplied' or Path(marker.get('finalApp', '')).resolve() != root:
        raise ValueError('Candidate marker/path mismatch')
    records, links = [], []
    for path in sorted(root.rglob('*')):
        if path.is_symlink():
            links.append(str(path.relative_to(root)))
            continue
        if not path.is_file():
            continue
        with path.open('rb') as stream:
            if stream.read(4) not in MAGICS:
                continue
            stream.seek(0)
            data = stream.read()
        records.append({'path': str(path.relative_to(root)), 'bytes': len(data),
                        'sha256': hashlib.sha256(data).hexdigest(), 'slices': metadata.slices(data)})
    architectures = {}
    for record in records:
        for item in record['slices']:
            mac = [x for x in item['build'] if x['platform'] == 1]
            entry = architectures.setdefault(item['architecture'], {'files': 0, 'maximumDeclaredMinimum': None,
                                                                     'limitingPaths': [], 'missingMacOSMetadata': []})
            entry['files'] += 1
            if not mac:
                entry['missingMacOSMetadata'].append(record['path'])
            for build in mac:
                value = tuple(map(int, build['minimumOS'].split('.')))
                previous = entry['maximumDeclaredMinimum']
                if previous is None or value > tuple(map(int, previous.split('.'))):
                    entry['maximumDeclaredMinimum'] = build['minimumOS']
                    entry['limitingPaths'] = [record['path']]
                elif build['minimumOS'] == previous:
                    entry['limitingPaths'].append(record['path'])
    if not records:
        raise ValueError('Candidate contains no recognized Mach-O artifacts')
    return {'format': 'aux.candidate.compatibility.v1', 'candidate': str(root),
            'bundleManifestSha256': hashlib.sha256(marker_bytes).hexdigest(),
            'decoderSha256': hashlib.sha256(DECODER.read_bytes()).hexdigest(),
            'machOFiles': len(records), 'architectures': architectures, 'records': records,
            'symlinkAliasesOmitted': links, 'nativeExecution': False, 'runtimeCompatibilityProven': False,
            'scope': 'Declared Mach-O requirements only. Optional bundled binaries count; architecture presence does not establish whole-app support.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('candidate', type=Path)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    report = inspect(args.candidate)
    with args.output.open('x') as output:
        output.write(json.dumps(report, indent=2) + '\n')
    print(json.dumps({key: report[key] for key in ('machOFiles', 'architectures', 'runtimeCompatibilityProven')}))


if __name__ == '__main__':
    main()
