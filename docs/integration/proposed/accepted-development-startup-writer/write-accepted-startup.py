#!/usr/bin/env python3
"""Explicitly accept an already verified, existing disposable Aux scope.
Never run as part of packaging. No launch, signing, Keychain or profile creation.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import pwd
import plistlib
import re
import secrets
import stat
import subprocess

SCOPE = 'dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476'
LIMIT = 8 * 1024 * 1024
CODES = (
    '', 'Contents/Frameworks/Aux Framework.framework',
    'Contents/Resources/aux/apps/daemon/Aux Daemon.app',
    'Contents/Resources/aux/apps/cli/Aux CLI.app',
    'Contents/Resources/aux/native/Aux Native Carrier.app',
    'Contents/Resources/aux/native/libaux-native-boundary.dylib',
    'Contents/Resources/aux/apps/computer-use/Aux Computer Use.app',
)
SEALS = (
    'Contents/_CodeSignature/CodeResources',
    'Contents/Frameworks/Aux Framework.framework/Versions/Current/_CodeSignature/CodeResources',
    'Contents/Resources/aux/bundle.json',
)


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    path = Path(value)
    require(path.is_absolute() and str(path.resolve(strict=True)) == value,
            'Path must be existing and canonical')
    return path


def directory(path, private=False):
    s = path.lstat()
    require(stat.S_ISDIR(s.st_mode) and s.st_uid == os.getuid(),
            'Directory must be owned by current user without symlink')
    require(stat.S_IMODE(s.st_mode) == 0o700 if private else not s.st_mode & 0o022,
            'Directory permissions rejected')


def owned_ancestors(path):
    for item in (path, *path.parents):
        s = item.lstat()
        require(stat.S_ISDIR(s.st_mode) and s.st_uid in (0, os.getuid())
                and not s.st_mode & 0o022, 'Unsafe app/startup ancestor')


def read_pinned(path, digest, limit=LIMIT):
    require(re.fullmatch('[0-9a-f]{64}', digest) is not None, 'Invalid SHA256 pin')
    with open(path, 'rb') as source:
        data = source.read(limit + 1)
    require(len(data) <= limit and sha(data) == digest, 'Pinned input mismatch')
    return data


def code_hash(path, ignore_resources):
    args = ['/usr/bin/codesign', '--verify', '--strict', '--all-architectures']
    if ignore_resources:
        args.append('--ignore-resources')
    result = subprocess.run([*args, str(path)], capture_output=True, check=False)
    require(result.returncode == 0, 'Existing code signature verification failed')
    result = subprocess.run(['/usr/bin/codesign', '--display', '--verbose=4', str(path)],
                            capture_output=True, check=False)
    require(result.returncode == 0, 'Existing code signature inspection failed')
    hashes = re.findall(rb'^CDHash=([0-9a-f]+)$', result.stderr, re.M)
    require(len(hashes) == 1, 'Expected one current-architecture CDHash')
    return hashes[0].decode('ascii')


def publish(record):
    # Walk with directory FDs and O_NOFOLLOW; publication is an exclusive hardlink
    # of a fully written/fsynced private file, never a replacing rename.
    user_home = canonical(pwd.getpwuid(os.getuid()).pw_dir)
    owned_ancestors(user_home)
    fd = os.open(user_home, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW)
    temporary = None
    try:
        for name in ('Library', 'Application Support', 'Aux', 'DevelopmentStartup'):
            try:
                os.mkdir(name, mode=0o700, dir_fd=fd)
            except FileExistsError:
                pass
            child = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW, dir_fd=fd)
            s = os.fstat(child)
            valid = s.st_uid == os.getuid() and not s.st_mode & 0o022
            if name == 'DevelopmentStartup':
                valid = valid and stat.S_IMODE(s.st_mode) == 0o700
            if not valid:
                os.close(child)
                raise ValueError('Startup directory owner/mode rejected')
            os.close(fd)
            fd = child
        try:
            os.stat('accepted.json', dir_fd=fd, follow_symlinks=False)
        except FileNotFoundError:
            pass
        else:
            raise ValueError('Existing startup record must be separately reviewed; refusing overwrite')
        temporary = '.accepted-' + secrets.token_hex(16)
        target = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                         0o600, dir_fd=fd)
        with os.fdopen(target, 'wb') as output:
            os.fchmod(output.fileno(), 0o600)
            output.write(record)
            output.flush()
            os.fsync(output.fileno())
        os.link(temporary, 'accepted.json', src_dir_fd=fd, dst_dir_fd=fd,
                follow_symlinks=False)
        os.unlink(temporary, dir_fd=fd)
        temporary = None
        os.fsync(fd)
    finally:
        if temporary is not None:
            os.unlink(temporary, dir_fd=fd)
        os.close(fd)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--receipt', required=True)
    parser.add_argument('--receipt-sha256', required=True)
    parser.add_argument('--handoff', required=True)
    parser.add_argument('--handoff-sha256', required=True)
    parser.add_argument('--accept-existing-scope', action='store_true', required=True)
    parser.add_argument('--confirm-app-closed-and-full-inventory-verified',
                        action='store_true', required=True)
    args = parser.parse_args()
    require(os.getuid() != 0 and os.getuid() == os.geteuid(), 'Run as the normal owner')
    receipt_bytes = read_pinned(args.receipt, args.receipt_sha256)
    receipt = json.loads(receipt_bytes)
    handoff = json.loads(read_pinned(args.handoff, args.handoff_sha256))
    require(receipt.get('version') == 1 and
            receipt.get('implementation') == 'inherited-development-authority-native-reseal' and
            receipt.get('status') == 'signed-and-verified' and
            receipt.get('scope') == SCOPE and
            receipt.get('retainedHelperSignaturesVerified') == 8 and
            receipt.get('parentAppleSignaturesReused') is True and
            receipt.get('appleSigningPerformed') is False and
            receipt.get('keychainOperationsPerformed') is False and
            receipt.get('authorityProofInherited') is True and
            receipt.get('untargetedLeavesPreserved') is True,
            'Receipt is not the accepted inherited local authority contract')
    require(handoff.get('version') == 1 and
            handoff.get('kind') == 'inherited-signed-preview-launch-handoff' and
            handoff.get('scope') == SCOPE and handoff.get('authorityProofInherited') is True and
            handoff.get('receiptSha256') == args.receipt_sha256,
            'Handoff is not bound to exact receipt and scope')
    for key in ('parentSignedReceiptSha256', 'parentAuthorityReportSha256'):
        require(re.fullmatch('[0-9a-f]{64}', receipt.get(key, '')) is not None and
                receipt[key] == handoff.get(key), 'Inherited proof mismatch')
    app = canonical(handoff['app'])
    home = canonical(handoff['home'])
    data = canonical(handoff['profile'])
    require(sha(str(home).encode()) == SCOPE, 'Cannot accept a new home/scope')
    require(app == canonical(receipt['packageRoot']) / 'Aux.app', 'Final app mismatch')
    require(data == home / 'preview-profile-local-browser-pass', 'Unapproved user data directory')
    directory(home, True)
    directory(data, True)
    directory(data / 'Default', True)
    require((data / 'Default').resolve(strict=True) == data / 'Default', 'Profile symlink rejected')
    require('--profile-directory=Default' in handoff.get('command', []), 'Unexpected profile binding')
    owned_ancestors(app)
    inventory = receipt.get('finalInventory')
    require(isinstance(inventory, list) and inventory, 'Missing exact final inventory')
    index = {row['path']: row for row in inventory}
    require(len(index) == len(inventory), 'Duplicate inventory paths')
    pins = {}
    for relative in CODES:
        path = (app / relative).resolve(strict=True)
        require(path == app or path.is_relative_to(app), 'Code target escapes app')
        if path.suffix == '.app':
            info = plistlib.loads((path / 'Contents/Info.plist').read_bytes())
            executable = path / 'Contents/MacOS' / info['CFBundleExecutable']
        elif path.suffix == '.framework':
            info = plistlib.loads((path / 'Resources/Info.plist').read_bytes())
            executable = path / info['CFBundleExecutable']
        else:
            executable = path
        executable = executable.resolve(strict=True)
        require(executable.is_relative_to(app), 'Executable escapes app')
        row = index.get(str(executable.relative_to(app.parent)))
        require(isinstance(row, dict) and 'sha256' in row,
                'Executable absent from exact final inventory')
        digest = hashlib.sha256()
        with executable.open('rb') as source:
            for chunk in iter(lambda: source.read(1024 * 1024), b''):
                digest.update(chunk)
        require(digest.hexdigest() == row['sha256'], 'Executable differs from verified receipt')
        pins[relative] = code_hash(path, relative in CODES[:2])
    seals = {}
    for relative in SEALS:
        path = (app / relative).resolve(strict=True)
        require(path.is_relative_to(app), 'Seal target escapes app')
        s = path.lstat()
        require(stat.S_ISREG(s.st_mode) and s.st_uid == os.getuid() and
                not s.st_mode & 0o022 and s.st_size <= LIMIT, 'Seal owner/mode/size rejected')
        row = index.get(str(path.relative_to(app.parent)))
        require(isinstance(row, dict) and 'sha256' in row, 'Seal absent from final receipt')
        seals[relative] = sha(read_pinned(path, row['sha256']))
    record = dict(version=1, kind='aux-existing-development-scope', accepted=True,
                  app=str(app), home=str(home), userDataDir=str(data),
                  profileDirectory='Default', scope=SCOPE,
                  receiptJson=receipt_bytes.decode('utf-8'), receiptSha256=args.receipt_sha256,
                  codeDirectoryHashes=pins, resourceSealSha256=seals)
    payload = (json.dumps(record, separators=(',', ':'), ensure_ascii=False) + '\n').encode()
    require(len(payload) <= LIMIT, 'Embedded acceptance record exceeds native 8 MiB limit')
    publish(payload)
    print('Created private existing-scope startup acceptance; no app launched.')


if __name__ == '__main__':
    try:
        main()
    except (ValueError, OSError, KeyError, TypeError) as error:
        raise SystemExit('Acceptance refused: ' + str(error))
