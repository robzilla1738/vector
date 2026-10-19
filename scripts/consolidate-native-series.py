#!/usr/bin/env python3
"""Prepare and reapply area patches from a validated disposable native proof."""
import argparse
import hashlib
import io
import json
from pathlib import Path
import stat
import subprocess
import tarfile


def git(directory, *arguments):
    return subprocess.run(['git', '-C', str(directory), *arguments], check=True,
                          stdout=subprocess.PIPE, stderr=subprocess.PIPE).stdout


def area(path):
    if path.endswith(('BUILD.gn', '.gni')) or path.startswith(('build/', 'chrome/app/', 'chrome/installer/', 'tools/gritsettings/')):
        return '0001-build-branding.patch'
    if path.startswith('chrome/browser/aux/') or '/devtools/' in path or path.startswith('components/aux_adblock/public/'):
        return '0002-platform-auth.patch'
    if '/extensions/api/aux_' in path or path.startswith(('components/aux_adblock/', 'chrome/renderer/aux_')):
        return '0003-private-apis-filtering.patch'
    if path.startswith(('chrome/browser/ui/', 'ui/color/')):
        return '0004-native-ui.patch'
    return '0005-upstream-integration.patch'


def file_state(path):
    if not path.exists():
        return None
    if path.is_symlink() or not path.is_file():
        raise ValueError(f'Expected ordinary source file: {path}')
    return hashlib.sha256(path.read_bytes()).hexdigest(), bool(path.stat().st_mode & stat.S_IXUSR)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--proof', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--proposed-delta', action='append', default=[], help='Explicit uncompiled proposals overlaid after source comparison')
    args = parser.parse_args()
    proof = args.proof.resolve(strict=True)
    output = args.output.resolve()
    if output == proof or proof in output.parents:
        parser.error('Output must be outside the input proof directory.')
    report = json.loads((proof / 'report.json').read_text())
    if not report['comparisonPerformed'] or report['firstFailure'] or report['mismatches']:
        parser.error('A completed matching reconstruction is required.')
    output.mkdir(parents=True, exist_ok=False)
    tree = proof / 'tree'
    git(tree, 'add', '--all')
    final_tree = git(tree, 'write-tree').decode().strip()
    baseline = report['baselineTree']
    changed = git(tree, 'diff', '--no-renames', '--name-only', '-z', baseline, final_tree).decode().split('\0')
    areas = {}
    for path in filter(None, changed):
        areas.setdefault(area(path), []).append(path)
    manifest = {'upstreamBase': report['upstreamBase'], 'proofRevision': report['workspaceRevision'],
                'sourceComparisonBeforeProposals': True, 'proposedDeltas': args.proposed_delta,
                'areaPaths': areas, 'patches': {}, 'limits': ['Prepared artifacts only; no native source mutation or build.',
                'Declared proposals need enabled compilation and runtime observation.', 'Retired paths remain excluded pending integrator/owner review.']}
    for name, paths in sorted(areas.items()):
        data = git(tree, 'diff', '--binary', '--no-renames', baseline, final_tree, '--', *paths)
        (output / name).write_bytes(data)
        manifest['patches'][name] = {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'paths': len(paths)}
    names = sorted(areas)
    (output / 'series').write_text('\n'.join(names) + '\n')
    fresh = output / 'reapply-tree'
    fresh.mkdir()
    included = set(json.loads((proof / 'included-paths.json').read_text()))
    with tarfile.open(fileobj=io.BytesIO(git(tree, 'archive', '--format=tar', baseline))) as archive:
        for member in archive:
            if member.isdir():
                continue
            if member.name not in included or not member.isfile():
                raise ValueError(f'Unexpected baseline member: {member.name}')
            target = fresh / member.name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(archive.extractfile(member).read())
            target.chmod(member.mode)
    git(fresh, 'init', '-q')
    for name in names:
        git(fresh, 'apply', '--check', str(output / name))
        git(fresh, 'apply', '--whitespace=nowarn', str(output / name))
    mismatches = sorted(path for path in included if file_state(fresh / path) != file_state(tree / path))
    if mismatches:
        raise ValueError(f'Area reconstruction differs: {mismatches}')
    for name in reversed(names):
        git(fresh, 'apply', '--reverse', '--check', str(output / name))
        git(fresh, 'apply', '--reverse', '--whitespace=nowarn', str(output / name))
    git(fresh, 'add', '--all')
    restored = git(fresh, 'write-tree').decode().strip()
    if restored != baseline:
        raise ValueError('Area reversal did not restore the exact baseline tree.')
    manifest['forwardCheck'] = {'paths': len(included), 'mismatches': []}
    manifest['reverseCheck'] = {'baselineTree': restored, 'matches': True}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(json.dumps({'patches': len(names), 'comparedPaths': len(included), 'forward': True, 'reverse': True}))


if __name__ == '__main__':
    main()
