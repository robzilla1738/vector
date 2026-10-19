#!/usr/bin/env python3
"""Compose a pinned follow-up atop an applied or explicitly staged native base."""
import argparse
import difflib
import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def safe(path):
    path = Path(path)
    if path.is_absolute() or '..' in path.parts or not path.parts:
        raise ValueError('Unsafe native follow-up path')
    return path


def read_source(root, path):
    absolute = root / path
    if absolute.resolve() != absolute:
        raise ValueError(f'Source traverses a symlink: {path}')
    if not absolute.exists():
        return None
    if not absolute.is_file():
        raise ValueError(f'Source is not a regular file: {path}')
    return absolute.read_bytes()


def digest(raw):
    return sha(raw) if raw is not None else None


def git(root, arguments, patch):
    environment = {key: value for key, value in os.environ.items() if not key.startswith('GIT_')}
    environment['GIT_CEILING_DIRECTORIES'] = str(root)
    return subprocess.run(['git', 'apply', *arguments, '-'], input=patch, cwd=root,
                          env=environment, check=True, capture_output=True)


def patch_paths(patch):
    if not patch:
        return set()
    result = git(Path(tempfile.gettempdir()).resolve(), ['--numstat', '-z'], patch)
    paths = set()
    for entry in result.stdout.split(b'\0'):
        if not entry:
            continue
        added, removed, name = entry.split(b'\t', 2)
        if added == b'-' or removed == b'-':
            raise ValueError('Native source patches must be text')
        paths.add(safe(name.decode()))
    return paths


def seed(root, files):
    for path, raw in files.items():
        if raw is not None:
            (root / path).parent.mkdir(parents=True, exist_ok=True)
            (root / path).write_bytes(raw)


def apply(root, patch):
    if patch:
        git(root, ['--check'], patch)
        git(root, [], patch)


def cumulative_patch(before, after):
    lines = []
    for path, raw in sorted(before.items()):
        final = after[path]
        if raw == final:
            continue
        if final is None:
            raise ValueError('Native source deletion is not supported')
        if raw is None:
            lines.extend([f'diff --git a/{path} b/{path}\n', 'new file mode 100644\n'])
        for line in difflib.unified_diff(
                raw.decode().splitlines(keepends=True) if raw is not None else [],
                final.decode().splitlines(keepends=True),
                fromfile=f'a/{path}' if raw is not None else '/dev/null',
                tofile=f'b/{path}'):
            lines.append(line if line.endswith('\n') else line + '\n\\ No newline at end of file\n')
    return ''.join(lines).encode()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('base', type=Path)
    parser.add_argument('--staged-base', action='store_true',
                        help='Replay an unapplied parent against its actual pinned shared inputs')
    parser.add_argument('--patch', type=Path, required=True)
    parser.add_argument('--metadata', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    options = parser.parse_args()
    base_directory = options.base.resolve()
    base_raw = (base_directory / 'manifest.json').read_bytes()
    base = json.loads(base_raw)
    native = Path(base['sourceRoot']).resolve()
    output = options.output.resolve()
    if output.exists() or output == native or native in output.parents or output in native.parents:
        raise ValueError('A fresh composition outside the native checkout is required')

    before = {}
    for item in base['files']:
        path = safe(item['path'])
        if path in before:
            raise ValueError(f'Duplicate parent source: {path}')
        raw = read_source(native, path)
        expected = item['sourceSha256'] if options.staged_base else item['outputSha256']
        if digest(raw) != expected:
            raise ValueError(f'{"Staged input" if options.staged_base else "Applied composition"} drift: {path}')
        before[path] = raw
    for item in base['binaryAssets']:
        path = safe(item['target'])
        expected = item['baselineSha256'] if options.staged_base else item['replacementSha256']
        if digest(read_source(native, path)) != expected:
            raise ValueError(f'Artwork differs from base: {path}')

    parent_patch = b''
    if options.staged_base:
        parent_patch = (base_directory / 'combined.patch').read_bytes()
        if sha(parent_patch) != base['combinedPatchSha256']:
            raise ValueError('Parent composition patch hash differs')
        if not patch_paths(parent_patch).issubset(before):
            raise ValueError('Parent patch modifies an unrecorded source')
    patch = options.patch.read_bytes()
    metadata_raw = options.metadata.read_bytes()
    items = json.loads(metadata_raw)['files']
    paths = patch_paths(patch)
    recorded = {safe(item['path']) for item in items}
    if paths != recorded or len(recorded) != len(items):
        raise ValueError('Follow-up patch and metadata coverage differ')
    for path in paths:
        if path not in before:
            before[path] = read_source(native, path)

    with tempfile.TemporaryDirectory(prefix='aux-native-followup-') as directory:
        copy = Path(directory).resolve()
        seed(copy, before)
        apply(copy, parent_patch)
        # In staged mode this proves every parent output, including unchanged
        # manifest sources and files created by /dev/null patch entries.
        for item in base['files']:
            if digest(read_source(copy, safe(item['path']))) != item['outputSha256']:
                raise ValueError(f'Parent output differs: {item["path"]}')
        for item in items:
            path = safe(item['path'])
            expected = item.get('baselineSha256', item.get('sourceSha256'))
            if digest(read_source(copy, path)) != expected:
                raise ValueError(f'Pinned follow-up input differs: {path}')
        apply(copy, patch)
        after = {path: read_source(copy, path) for path in before}
        for item in items:
            expected = item.get('outputSha256', item.get('proposedSha256'))
            if not expected or digest(after[safe(item['path'])]) != expected:
                raise ValueError('Follow-up output does not match its recorded implementation')
        combined = cumulative_patch(before, after)
        # Independently replay from the actual shared input, not the already
        # parent-patched copy used to validate follow-up baselines.
        with tempfile.TemporaryDirectory(prefix='aux-native-followup-replay-') as replay_directory:
            replay = Path(replay_directory).resolve()
            seed(replay, before)
            apply(replay, combined)
            for path, raw in after.items():
                if read_source(replay, path) != raw:
                    raise ValueError(f'Cumulative replay differs: {path}')
        result = dict(base)
        result.update(compiled=False, appliedToNative=False, combinedPatchSha256=sha(combined),
                      parentCompositionSha256=sha(base_raw), parentComposition=str(base_directory))
        result['steps'] = [*base['steps'], {
            'patch': str(options.patch.resolve()), 'sha256': sha(patch),
            'application': 'incremental-after-replayed-staged-base' if options.staged_base else 'incremental-after-verified-base',
            'metadataSha256': sha(metadata_raw)}]
        result['files'] = [{'path': str(path), 'sourceSha256': digest(raw),
                            'outputSha256': digest(after[path])} for path, raw in sorted(before.items())]
        result['binaryAssets'] = [dict(item) if options.staged_base else dict(
            item, baselineSha256=item['replacementSha256'], parentBaselineSha256=item['baselineSha256'])
            for item in base['binaryAssets']]
        output.mkdir(parents=True)
        (output / 'combined.patch').write_bytes(combined)
        (output / 'manifest.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'output': str(output), 'changedSources': len(paths),
                      'verifiedSources': len(before), 'stagedBase': options.staged_base,
                      'applied': False, 'compiled': False}))


if __name__ == '__main__':
    main()
