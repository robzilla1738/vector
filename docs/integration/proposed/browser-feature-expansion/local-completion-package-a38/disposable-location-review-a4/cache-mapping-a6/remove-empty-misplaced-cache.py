"""Remove only the verified-empty cache child created by this failed test."""
from pathlib import Path
import ctypes
import errno
import json
import os
import stat
import subprocess

HERE = Path(__file__).resolve().parent
SCOPE = HERE.parent
created = json.loads((SCOPE / 'created-disposable-scope.json').read_text())
cache = created['roots'][1]
assert cache['path'] == '/Users/rcourson/Library/Caches/Aux Browser A38 Disposable'
app = '/Users/rcourson/Documents/Vibe/web/out/provided-candidate-local-completion-20261025-a38/Aux.app/'
processes = subprocess.run(['ps', '-axo', 'comm='], check=True, capture_output=True, text=True).stdout.splitlines()
assert not any(name.startswith(app) for name in processes), 'Candidate code must be stopped'
ninja = Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src/out/AuxFast/obj/chrome/common/constants.ninja')
defines = next(line for line in ninja.read_text().splitlines() if line.startswith('defines ='))
assert 'AUX_BROWSER_ONLY_NATIVE_STARTUP=1' in defines, 'Correct mapping must be compiled in'
output = HERE / 'actual-empty-cache-child-removal.json'
assert not output.exists(), 'Fresh one-shot removal receipt required'
libc = ctypes.CDLL(None, use_errno=True)
libc.acl_get_fd_np.argtypes = [ctypes.c_int, ctypes.c_int]
libc.acl_get_fd_np.restype = ctypes.c_void_p
libc.acl_valid.argtypes = [ctypes.c_void_p]
libc.acl_get_entry.argtypes = [ctypes.c_void_p, ctypes.c_int, ctypes.POINTER(ctypes.c_void_p)]
libc.acl_free.argtypes = [ctypes.c_void_p]

def private_directory(fd):
    value = os.fstat(fd)
    assert stat.S_ISDIR(value.st_mode) and value.st_uid == cache['uid'] and stat.S_IMODE(value.st_mode) == 0o700
    ctypes.set_errno(0)
    acl = libc.acl_get_fd_np(fd, 0x100)
    if not acl:
        assert ctypes.get_errno() == errno.ENOENT
    else:
        try:
            entry = ctypes.c_void_p()
            assert libc.acl_valid(acl) == 0
            ctypes.set_errno(0)
            assert libc.acl_get_entry(acl, 0, ctypes.byref(entry)) == -1 and ctypes.get_errno() == errno.EINVAL and entry.value is None
        finally:
            libc.acl_free(acl)
    return value

parent = child = None
result = dict(passed=False, removed=False, ownedDisposableOnly=True, fileContentsRead=False,
              recursiveRemoval=False, originalFolderTouched=False, release=False)
try:
    parent = os.open(cache['path'], os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC)
    before = private_directory(parent)
    assert (before.st_dev, before.st_ino) == (cache['device'], cache['inode'])
    child = os.open('User Data', os.O_RDONLY | os.O_DIRECTORY | os.O_NOFOLLOW | os.O_CLOEXEC, dir_fd=parent)
    entry = private_directory(child)
    result['childBefore'] = dict(device=entry.st_dev, inode=entry.st_ino, uid=entry.st_uid, mode=stat.S_IMODE(entry.st_mode))
    with os.scandir(child) as entries:
        assert next(entries, None) is None, 'Nonempty child must remain untouched'
    named = os.stat('User Data', dir_fd=parent, follow_symlinks=False)
    assert (named.st_dev, named.st_ino) == (entry.st_dev, entry.st_ino)
    os.rmdir('User Data', dir_fd=parent)  # Atomic refusal if a child appeared.
    result['removed'] = True
    os.fsync(parent)
    after = private_directory(parent)
    assert (after.st_dev, after.st_ino) == (before.st_dev, before.st_ino)
    try:
        os.stat('User Data', dir_fd=parent, follow_symlinks=False)
        raise AssertionError('Misplaced child still exists')
    except FileNotFoundError:
        pass
    result.update(passed=True, childWasEmpty=True, cacheInodePreserved=True, misplacedChildAbsent=True)
finally:
    if child is not None:
        os.close(child)
    if parent is not None:
        os.close(parent)
    output.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
