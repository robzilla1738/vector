"""Fixed controlled-fixture metadata writer. No native process/UI operations."""
import hashlib
import json
import os
import re
import stat
import sys
import uuid


def unique(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('duplicate fixed metadata field')
        result[key] = value
    return result


def owned_directory(info):
    return stat.S_ISDIR(info.st_mode) and info.st_uid == os.geteuid() and stat.S_IMODE(info.st_mode) == 0o700


def same_directory(fd, parent, name, original):
    current = os.fstat(fd)
    path = os.stat(name, dir_fd=parent, follow_symlinks=False)
    if not all(owned_directory(info) for info in (original, current, path)) or any(
        (info.st_dev, info.st_ino) != (original.st_dev, original.st_ino) for info in (current, path)
    ):
        raise ValueError('original owned directory replaced')


def publish(request):
    if set(request) != {'fixtureRoot', 'build'}:
        raise ValueError('fixed request fields required')
    root_path = request['fixtureRoot']
    if not isinstance(root_path, str) or not re.fullmatch(r'/(?:private/)?tmp/aux-native-journey-[A-Za-z0-9_-]{1,100}', root_path):
        raise ValueError('fixed owned fixture required')
    name = os.path.basename(root_path)
    canonical_parent = os.path.realpath('/tmp')
    if canonical_parent != '/private/tmp' or os.path.realpath(root_path) != canonical_parent + '/' + name:
        raise ValueError('canonical private fixture required')
    build = request['build']
    fields = {'producer', 'version', 'kind', 'trial', 'helperBinarySha256', 'helperSourceSha256', 'helperImageUuid'}
    if not isinstance(build, dict) or set(build) != fields or build['producer'] != 'aux-native-startup-build' or type(build['version']) is not int or build['version'] != 1 or build['kind'] not in ('aux', 'stock'):
        raise ValueError('invalid fixed build metadata')
    for key, count in [('trial', 32), ('helperBinarySha256', 64), ('helperSourceSha256', 64), ('helperImageUuid', 32)]:
        if not isinstance(build[key], str) or not re.fullmatch('[a-f0-9]{' + str(count) + '}', build[key]) or set(build[key]) == {'0'}:
            raise ValueError('missing original build pin')
    payload = json.dumps(build, sort_keys=True, separators=(',', ':')).encode('ascii')
    parent = root = profile = fd = None
    temporary = 'startup-build-' + uuid.uuid4().hex + '.tmp'
    try:
        parent = os.open(canonical_parent, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
        root = os.open(name, os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=parent)
        profile = os.open('profile', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=root)
        original_root, original_profile = os.fstat(root), os.fstat(profile)
        def validate():
            same_directory(root, parent, name, original_root)
            same_directory(profile, root, 'profile', original_profile)
        validate()
        fd = os.open(temporary, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW | os.O_CLOEXEC, 0o600, dir_fd=root)
        os.fchmod(fd, 0o600)
        original = os.fstat(fd)
        if not stat.S_ISREG(original.st_mode) or original.st_uid != os.geteuid() or original.st_nlink != 1:
            raise ValueError('invalid fixed metadata file')
        offset = 0
        while offset < len(payload):
            written = os.write(fd, payload[offset:])
            if written <= 0:
                raise OSError('incomplete metadata publication')
            offset += written
        os.fsync(fd)
        validate()
        # Exclusive directory-relative publication: existing regular files or
        # symlinks are never replaced, and original directory FDs remain held.
        os.link(temporary, 'startup-build.json', src_dir_fd=root, dst_dir_fd=root, follow_symlinks=False)
        os.unlink(temporary, dir_fd=root)
        os.fsync(root)
        validate()
        final = os.stat('startup-build.json', dir_fd=root, follow_symlinks=False)
        current = os.fstat(fd)
        if (final.st_dev, final.st_ino) != (original.st_dev, original.st_ino) or (current.st_dev, current.st_ino) != (original.st_dev, original.st_ino) or final.st_nlink != 1 or stat.S_IMODE(final.st_mode) != 0o600 or final.st_size != len(payload):
            raise ValueError('published metadata identity changed')
        return {'producer': 'aux-startup-build-writer', 'version': 1, 'sha256': hashlib.sha256(payload).hexdigest(), 'bytes': len(payload)}
    finally:
        if root is not None:
            try:
                os.unlink(temporary, dir_fd=root)
            except FileNotFoundError:
                pass
        for held in (fd, profile, root, parent):
            if held is not None:
                os.close(held)


if __name__ == '__main__':
    if len(sys.argv) != 1:
        raise ValueError('no path, filename or operation selectors')
    raw = sys.stdin.buffer.read(8193)
    if not raw or len(raw) > 8192:
        raise ValueError('bounded metadata request required')
    request = json.loads(raw, object_pairs_hook=unique)
    print(json.dumps(publish(request), sort_keys=True, separators=(',', ':')))
