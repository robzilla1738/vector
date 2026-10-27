#!/usr/bin/env python3
"""Export the Aux Chromium tree as a reproducible delta, or apply/verify it.

export  <src> <dest>   write base.json, aux.patch (tracked changes), added.tar.gz
                       (untracked additions) and manifest.json (sha256 of every
                       changed path). Reads the checkout only; never touches its index.
verify  <src> <dest>   replay aux.patch onto the base commit in a temporary index and
                       check every resulting blob, plus the archive, against the manifest.
apply   <src> <dest>   apply onto a clean checkout of the base commit, then verify.
"""
import hashlib, json, os, subprocess, sys, tarfile, tempfile
from pathlib import Path

BASE = '0e66b94549a8bd85f03fbdf189b752d6e7b63c32'  # Chromium 155.0.8059.85
SKIP = ('__pycache__/', '.pyc', '.DS_Store')


def git(src, *args, env=None, data=None):
    return subprocess.run(['git', '-C', str(src), *args], check=True, capture_output=True,
                          input=data, env=env).stdout


def sha(path):
    h = hashlib.sha256()
    with open(path, 'rb') as stream:
        for block in iter(lambda: stream.read(1 << 20), b''):
            h.update(block)
    return h.hexdigest()


def changes(src):
    out = git(src, 'status', '--porcelain=v1', '-z', '--untracked-files=all', '--', '.', ':!out')
    tracked, added, deleted = [], [], []
    items = out.split(b'\0')
    i = 0
    while i < len(items) and items[i]:
        code, path = items[i][:2].decode(), items[i][3:].decode()
        if code[0] == 'R':
            i += 1  # rename source follows; both sides are covered by the diff
        if not any(s in path or path.endswith(s) for s in SKIP):
            if code == '??':
                added.append(path)
            elif 'D' in code:
                deleted.append(path)
            else:
                tracked.append(path)
        i += 1
    return sorted(tracked), sorted(added), sorted(deleted)


def export(src, dest):
    if git(src, 'rev-parse', 'HEAD').decode().strip() != BASE:
        raise SystemExit('Checkout HEAD is not the pinned base')
    dest.mkdir(parents=True, exist_ok=True)
    tracked, added, deleted = changes(src)
    (dest/'aux.patch').write_bytes(git(src, 'diff', 'HEAD', '--binary', '--full-index', '--', '.', ':!out'))
    with tarfile.open(dest/'added.tar.gz', 'w:gz') as archive:
        for path in added:
            info = archive.gettarinfo(src/path, arcname=path)
            info.uid = info.gid = 0
            info.uname = info.gname = ''
            info.mtime = 0
            if not info.isfile():
                archive.addfile(info)  # symlinks keep their target text
                continue
            with open(src/path, 'rb') as stream:
                archive.addfile(info, stream)
    manifest = {'base': BASE, 'deleted': deleted,
                'files': {p: sha(src/p) for p in tracked + added if (src/p).is_file()}}
    (dest/'manifest.json').write_text(json.dumps(manifest, indent=1, sort_keys=True) + '\n')
    (dest/'base.json').write_text(json.dumps({'chromium': '155.0.8059.85', 'commit': BASE,
        'tracked': len(tracked), 'added': len(added), 'deleted': len(deleted)}, indent=1) + '\n')
    print(json.dumps({'tracked': len(tracked), 'added': len(added), 'deleted': len(deleted)}))


def verify(src, dest):
    manifest = json.loads((dest/'manifest.json').read_text())
    with tempfile.TemporaryDirectory() as scratch:
        env = {**os.environ, 'GIT_INDEX_FILE': str(Path(scratch)/'index')}
        git(src, 'read-tree', manifest['base'], env=env)
        git(src, 'apply', '--cached', '--binary', str(dest/'aux.patch'), env=env)
        staged = {}
        for line in git(src, 'ls-files', '-s', '-z', env=env).split(b'\0'):
            if line:
                meta, path = line.split(b'\t', 1)
                staged[path.decode()] = meta.split()[1].decode()
    with tarfile.open(dest/'added.tar.gz') as archive:
        archived = {m.name: hashlib.sha256(archive.extractfile(m).read()).hexdigest()
                    for m in archive.getmembers() if m.isfile()}
    bad = [p for p in manifest['deleted'] if p in staged]
    for path, digest in manifest['files'].items():
        if path in archived:
            ok = archived[path] == digest
        elif path in staged:
            blob = git(src, 'cat-file', 'blob', staged[path])
            ok = hashlib.sha256(blob).hexdigest() == digest
        else:
            ok = False
        if not ok:
            bad.append(path)
    if bad:
        raise SystemExit(f'{len(bad)} paths differ from the manifest, first: {bad[:5]}')
    print(json.dumps({'verified': len(manifest['files']), 'deleted': len(manifest['deleted'])}))


def apply(src, dest):
    if git(src, 'rev-parse', 'HEAD').decode().strip() != BASE or git(src, 'status', '--porcelain', '--', '.', ':!out'):
        raise SystemExit('Apply needs a clean checkout of the pinned base')
    git(src, 'apply', '--binary', str(dest/'aux.patch'))
    with tarfile.open(dest/'added.tar.gz') as archive:
        archive.extractall(src, filter='data')
    manifest = json.loads((dest/'manifest.json').read_text())
    bad = [p for p, d in manifest['files'].items() if not (src/p).is_file() or sha(src/p) != d]
    if bad:
        raise SystemExit(f'{len(bad)} paths differ after apply, first: {bad[:5]}')
    print(json.dumps({'applied': len(manifest['files'])}))


if __name__ == '__main__':
    if len(sys.argv) != 4 or sys.argv[1] not in ('export', 'verify', 'apply'):
        raise SystemExit(__doc__)
    {'export': export, 'verify': verify, 'apply': apply}[sys.argv[1]](Path(sys.argv[2]).resolve(), Path(sys.argv[3]).resolve())
