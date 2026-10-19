#!/usr/bin/env python3
"""Reconstruct committed native patches without modifying the product checkout."""
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import stat
import subprocess
import tarfile


def git(directory, *arguments, data=None):
    return subprocess.run(['git', '-C', str(directory), *arguments], input=data,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True).stdout


def safe_path(value):
    path = PurePosixPath(value)
    if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0] == '.git':
        raise ValueError(f'Unsafe patch path: {value}')
    return str(path)


def retired(path):
    return path.startswith(('chrome/browser/ui/aux/', 'chrome/browser/resources/aux/',
                            'chrome/browser/resources/aux_host/', 'ui/aux/generated/',
                            'resources/aux/'))


def digest(path):
    if not path.exists():
        return None
    if path.is_symlink() or not path.is_file():
        raise ValueError(f'Expected ordinary source file: {path}')
    return {'sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
            'executable': bool(path.stat().st_mode & stat.S_IXUSR)}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True, help='New disposable directory')
    parser.add_argument('--revision', default='HEAD', help='Committed workspace patch revision')
    parser.add_argument('--base', default='0e66b94549a8bd85f03fbdf189b752d6e7b63c32')
    args = parser.parse_args()
    workspace = Path(__file__).resolve().parent.parent
    source = args.source.resolve(strict=True)
    output = args.output.resolve()
    if output == source or source in output.parents:
        parser.error('Output must be outside the native checkout.')
    output.mkdir(parents=True, exist_ok=False)
    tree = output / 'tree'
    tree.mkdir()
    patches = output / 'patches'
    patches.mkdir()
    revision = git(workspace, 'rev-parse', args.revision).decode().strip()
    base = git(source, 'rev-parse', args.base).decode().strip()
    names = git(workspace, 'show', f'{revision}:chromium/patches/series').decode().splitlines()
    names = [safe_path(name.strip()) for name in names if name.strip() and not name.startswith('#')]
    paths = set()
    for index, name in enumerate(names):
        patch = git(workspace, 'show', f'{revision}:chromium/patches/{name}')
        destination = patches / f'{index:04d}.patch'
        destination.write_bytes(patch)
        rows = subprocess.run(['git', 'apply', '--numstat', '-z', str(destination)],
                              check=True, capture_output=True).stdout.split(b'\0')
        for row in rows:
            if row:
                paths.add(safe_path(row.decode().split('\t', 2)[2]))
    excluded = sorted(path for path in paths if retired(path))
    included = sorted(paths - set(excluded))
    tracked = git(source, 'ls-tree', '-r', '-z', '--name-only', base, '--', *included)
    baseline = [path.decode() for path in tracked.split(b'\0') if path]
    archive = git(source, 'archive', '--format=tar', base, '--', *baseline)
    with tarfile.open(fileobj=io.BytesIO(archive)) as entries:
        for entry in entries:
            if entry.isdir():
                continue
            name = safe_path(entry.name)
            if name not in baseline or not entry.isfile():
                raise ValueError(f'Unexpected archive member: {name}')
            target = tree / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(entries.extractfile(entry).read())
            target.chmod(entry.mode)
    git(tree, 'init', '-q')
    git(tree, 'add', '--all')
    baseline_tree = git(tree, 'write-tree').decode().strip()
    exclusions = [f'--exclude={prefix}*' for prefix in (
        'chrome/browser/ui/aux/', 'chrome/browser/resources/aux/',
        'chrome/browser/resources/aux_host/', 'ui/aux/generated/', 'resources/aux/')]
    report = {'workspaceRevision': revision, 'upstreamBase': base,
              'nativeHead': git(source, 'rev-parse', 'HEAD').decode().strip(),
              'includedPathCount': len(included), 'excludedRetiredPaths': excluded,
              'baselineTree': baseline_tree, 'comparisonPerformed': False,
              'applied': [], 'firstFailure': None, 'mismatches': [],
              'limits': ['Retired shell/generated paths excluded without reading their contents.',
                         'No native build, runtime, provenance or complete-series acceptance is implied.']}
    for index, name in enumerate(names):
        result = subprocess.run(['git', '-C', str(tree), 'apply', '--whitespace=nowarn',
                                 *exclusions, str(patches / f'{index:04d}.patch')], capture_output=True)
        if result.returncode:
            report['firstFailure'] = {'patch': name, 'diagnostic': result.stderr.decode()}
            break
        report['applied'].append(name)
    if report['firstFailure'] is None:
        report['comparisonPerformed'] = True
        for path in included:
            reconstructed = digest(tree / path)
            current = digest(source / path)
            if reconstructed != current:
                report['mismatches'].append({'path': path, 'reconstructed': reconstructed, 'current': current})
    (output / 'report.json').write_text(json.dumps(report, indent=2) + '\n')
    (output / 'included-paths.json').write_text(json.dumps(included, indent=2) + '\n')
    print(json.dumps({'report': str(output / 'report.json'), 'applied': len(report['applied']),
                      'firstFailure': report['firstFailure']['patch'] if report['firstFailure'] else None,
                      'comparisonPerformed': report['comparisonPerformed'],
                      'mismatches': len(report['mismatches']), 'excludedRetiredPaths': len(excluded)}))
    return int(report['firstFailure'] is not None or bool(report['mismatches']))


if __name__ == '__main__':
    raise SystemExit(main())
