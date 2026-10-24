#!/usr/bin/env python3
"""One disposable BSD-flock interoperability check; no product/NAPI execution."""
from pathlib import Path
import errno
import fcntl
import hashlib
import json
import os
import subprocess
import tempfile

HERE = Path(__file__).resolve().parent
RECEIPT = HERE / 'flock-interop-a1.json'
assert not RECEIPT.exists()
record = {'format': 'aux.credential-flock-mechanism.actual.v1', 'passed': False,
          'productExecuted': False, 'nativeLeaseApiExecuted': False,
          'ownerStateAccessed': False, 'commands': []}


def original(fd):
    command = ['/usr/bin/lockf', '-s', '-t', '0', str(fd)]
    result = subprocess.run(command, pass_fds=(fd,), capture_output=True, timeout=5)
    record['commands'].append({'command': command, 'exitCode': result.returncode})
    assert not result.stdout and not result.stderr
    return result.returncode


try:
    with tempfile.TemporaryDirectory(prefix='aux-credential-flock-a1-') as temporary:
        path = Path(temporary) / 'disposable.lock'
        digest = hashlib.sha256(b'account:disposable-interop').hexdigest()
        marker = json.dumps({'schema': 'aux.chatgpt.auth-lock.v2', 'account': digest},
                            separators=(',', ':')).encode()
        descriptors = []
        try:
            fd = os.open(path, os.O_RDWR | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW, 0o600)
            descriptors.append(fd)
            os.write(fd, marker)
            os.fsync(fd)
            initial = os.fstat(fd)
            assert original(fd) == 0
            contender = os.open(path, os.O_RDWR | os.O_NOFOLLOW)
            descriptors.append(contender)
            try:
                fcntl.flock(contender, fcntl.LOCK_EX | fcntl.LOCK_NB)
                raise AssertionError('Original child lock was not retained by parent open description')
            except OSError as error:
                assert error.errno in (errno.EWOULDBLOCK, errno.EAGAIN)
            os.close(fd)
            descriptors.remove(fd)
            fcntl.flock(contender, fcntl.LOCK_EX | fcntl.LOCK_NB)
            legacy = os.open(path, os.O_RDWR | os.O_NOFOLLOW)
            descriptors.append(legacy)
            assert original(legacy) == 75
            os.close(contender)
            descriptors.remove(contender)
            assert original(legacy) == 0
            final = path.stat()
            assert (initial.st_dev, initial.st_ino) == (final.st_dev, final.st_ino)
            assert path.read_bytes() == marker and final.st_nlink == 1
            record.update(passed=True, originalChildLockRetainedAfterExit=True,
                          independentNativeFlockContends=True,
                          originalDescriptorHelperContends=True,
                          closeReleasesAndReacquireWorks=True,
                          permanentInodeAndMarkerUnchanged=True)
        finally:
            for fd in descriptors:
                os.close(fd)
except Exception as error:
    record['error'] = str(error)
finally:
    record['temporaryDirectoryRemoved'] = not Path(temporary).exists() if 'temporary' in globals() else True
    RECEIPT.write_text(json.dumps(record, indent=2) + '\n')
print(json.dumps(record, indent=2))
raise SystemExit(0 if record['passed'] else 1)
