"""Internal fixed-name cleanup, only after original App proves process retirement.

Inherited FDs 3/4/5 are the original root/profile/channel. No path or PID input.
The original native writer holds an exclusive kernel lock until State destruction.
"""
import ctypes
import fcntl
import hashlib
import json
import os
import stat
import sys

NAME = 'native-appearance-channel.jsonl'
RETIRED = 'native-appearance-channel.retired.jsonl'
KEYS = {'rootDevice', 'rootInode', 'profileDevice', 'profileInode',
        'fileDevice', 'fileInode', 'size', 'sha256'}


def require(value, message):
    if not value:
        raise RuntimeError(message)


def main():
    require(sys.platform == 'darwin', 'Darwin original rename API required')
    raw = sys.stdin.buffer.read(2049)
    require(len(raw) <= 2048, 'Cleanup input exceeded bound')
    pairs = json.loads(raw, object_pairs_hook=lambda rows: rows)
    require(isinstance(pairs, list) and len(pairs) == len(KEYS), 'Closed cleanup fields required')
    value = dict(pairs)
    require(len(value) == len(pairs) and set(value) == KEYS, 'Duplicate or foreign cleanup field')
    for key in KEYS - {'sha256'}:
        require(isinstance(value[key], str) and value[key].isascii() and value[key].isdigit()
                and str(int(value[key])) == value[key] and 0 < int(value[key]) <= (1 << 64) - 1,
                'Original positive integer pin required')
    require(isinstance(value['sha256'], str) and len(value['sha256']) == 64
            and all(c in '0123456789abcdef' for c in value['sha256']), 'Original byte pin required')
    require(int(value['size']) <= 2097152, 'Original file exceeded bound')

    def same(info, prefix, directory):
        require((stat.S_ISDIR(info.st_mode) if directory else stat.S_ISREG(info.st_mode))
                and info.st_uid == os.getuid() and stat.S_IMODE(info.st_mode) == (0o700 if directory else 0o600)
                and info.st_dev == int(value[prefix + 'Device']) and info.st_ino == int(value[prefix + 'Inode'])
                and (directory or info.st_nlink == 1), 'Original held identity changed')

    def directories():
        same(os.fstat(3), 'root', True)
        same(os.fstat(4), 'profile', True)
        same(os.stat('profile', dir_fd=3, follow_symlinks=False), 'profile', True)

    def channel(name):
        directories()
        same(os.fstat(5), 'file', False)
        same(os.stat(name, dir_fd=3, follow_symlinks=False), 'file', False)
        require(os.fstat(5).st_size == int(value['size']), 'Original size changed')
        data = os.pread(5, int(value['size']) + 1, 0)
        require(len(data) == int(value['size']) and hashlib.sha256(data).hexdigest() == value['sha256'],
                'Original signed bytes changed')

    channel(NAME)
    # Live writers refuse even if the process-level caller is mistaken.
    fcntl.flock(5, fcntl.LOCK_EX | fcntl.LOCK_NB)
    moved = False
    libc = ctypes.CDLL(None, use_errno=True)
    rename = libc.renameatx_np
    rename.argtypes = [ctypes.c_int, ctypes.c_char_p, ctypes.c_int, ctypes.c_char_p, ctypes.c_uint]
    rename.restype = ctypes.c_int

    def exclusive(source, target):
        require(rename(3, source.encode('ascii'), 3, target.encode('ascii'), 4) == 0,
                'Original exclusive retirement rename refused: ' + str(ctypes.get_errno()))

    try:
        channel(NAME)
        exclusive(NAME, RETIRED)
        moved = True
        channel(RETIRED)
        # Never delete an unexpected replacement that was moved by a race.
        os.unlink(RETIRED, dir_fd=3)
        moved = False
        os.fsync(3)
        directories()
        try:
            os.stat(NAME, dir_fd=3, follow_symlinks=False)
        except FileNotFoundError:
            pass
        else:
            raise RuntimeError('Foreign channel appeared during original retirement')
        sys.stdout.write('{"producer":"aux-original-appearance-channel-retirement","version":1,"removed":true}\n')
    except BaseException:
        if moved:
            # Exclusive restoration cannot overwrite a new or unknown owner.
            exclusive(RETIRED, NAME)
            os.fsync(3)
        raise
    finally:
        fcntl.flock(5, fcntl.LOCK_UN)


if __name__ == '__main__':
    main()
