#!/usr/bin/env python3
"""Project a reviewed feature composition into the isolated native tree.

Run with scripts/native-build.py. Historical source/build receipts are never
rewritten. The before-images and journal make this projection recoverable.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import stat


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def relative(value):
    parsed = PurePosixPath(value)
    if parsed.is_absolute() or '..' in parsed.parts or str(parsed) != value:
        raise ValueError('Noncanonical relative path: ' + value)
    return parsed


def contained_regular(root, name):
    relative(name)
    target = root / name
    current = root
    for part in PurePosixPath(name).parts:
        current /= part
        if current.is_symlink():
            raise ValueError('Symlink in source path: ' + name)
    if not target.resolve().is_relative_to(root) or not target.is_file():
        raise ValueError('Missing or outside regular source: ' + name)
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--native-root', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[1]
    native = Path(args.native_root).resolve()
    # This feature composition must never mutate the owner's Chromium checkout.
    permitted = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
    if native != permitted or not native.is_dir():
        raise ValueError('Only the recorded isolated native tree is permitted')
    manifest_path = Path(args.manifest).resolve()
    if not manifest_path.is_relative_to(repo):
        raise ValueError('Manifest must be a repository-owned artifact')
    manifest = json.loads(manifest_path.read_text())
    if manifest.get('format') != 'aux.browser-features.composition.v1':
        raise ValueError('Unknown composition format')
    entries = manifest.get('files')
    if not isinstance(entries, list) or not entries:
        raise ValueError('Nonempty complete source composition required')
    prepared = []
    names = set()
    for entry in entries:
        name = entry['path']
        relative(name)
        if not name.startswith('chrome/') or name in names:
            raise ValueError('Unsupported or duplicate source path: ' + name)
        names.add(name)
        supplied = contained_regular(repo, entry['source'])
        if digest(supplied) != entry['afterSha256']:
            raise ValueError('Proposal hash differs: ' + name)
        target = native / name
        current = native
        for part in PurePosixPath(name).parts:
            current /= part
            if current.is_symlink():
                raise ValueError('Symlink in native destination: ' + name)
        if target.exists() and not target.is_file():
            raise ValueError('Destination is not a regular file: ' + name)
        before = digest(target) if target.exists() else None
        if before != entry.get('beforeSha256'):
            raise ValueError('Native predecessor differs: ' + name)
        mode = stat.S_IMODE(target.stat().st_mode) if target.exists() else 0o644
        prepared.append((entry, supplied, target, mode))
    report = {
        'format': 'aux.browser-features.projection.v1',
        'manifestSha256': digest(manifest_path),
        'nativeRoot': str(native),
        'dryRun': not args.apply,
        'prepared': True,
        'applied': False,
        'appExecuted': False,
        'signed': False,
        'changes': [dict(entry, mode=mode) for entry, _, _, mode in prepared],
    }
    if not args.apply:
        print(json.dumps({'prepared': True, 'dryRun': True, 'files': len(prepared)}))
        return
    output = Path(args.output).resolve()
    if output.exists() or output.is_relative_to(native):
        raise ValueError('Fresh receipt directory outside native tree required')
    output.mkdir(parents=True)
    for entry, _, target, mode in prepared:
        if target.exists():
            backup = output / 'before' / entry['path']
            backup.parent.mkdir(parents=True, exist_ok=True)
            backup.write_bytes(target.read_bytes())
            backup.chmod(mode)
    journal = output / 'projection.json'
    journal.write_text(json.dumps(report, indent=2) + '\n')
    applied = []
    try:
        # Revalidate the complete read set before the first mutation.
        for entry, supplied, target, _ in prepared:
            now = digest(target) if target.exists() else None
            if now != entry.get('beforeSha256') or digest(supplied) != entry['afterSha256']:
                raise ValueError('Input changed after preflight: ' + entry['path'])
        for entry, supplied, target, mode in prepared:
            target.parent.mkdir(parents=True, exist_ok=True)
            temporary = target.with_name(target.name + '.aux-feature-projection')
            if temporary.exists() or temporary.is_symlink():
                raise ValueError('Unexpected projection temporary: ' + str(temporary))
            with temporary.open('xb') as handle:
                handle.write(supplied.read_bytes())
                handle.flush()
                os.fsync(handle.fileno())
            temporary.chmod(mode)
            os.replace(temporary, target)
            applied.append(entry['path'])
            report['appliedPaths'] = applied
            journal.write_text(json.dumps(report, indent=2) + '\n')
        for entry, _, target, _ in prepared:
            if digest(target) != entry['afterSha256']:
                raise ValueError('Post-projection hash differs: ' + entry['path'])
        report['applied'] = True
    except Exception as error:
        # Do not overwrite an unexpected writer while attempting a rollback.
        # Keep the exact before-images and partial journal for explicit recovery.
        report['error'] = str(error)
        raise
    finally:
        journal.write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps({'prepared': True, 'applied': True, 'files': len(applied), 'receipt': str(journal)}))


if __name__ == '__main__':
    main()
