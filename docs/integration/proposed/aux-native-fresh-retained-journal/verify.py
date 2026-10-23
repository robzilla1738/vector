#!/usr/bin/env python3
"""Verify the exact physical journal-root ownership correction."""
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO = HERE.parents[3]


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    pins = json.loads((HERE / 'inputs.json').read_text())
    parent = REPO / pins['predecessor']
    for item in pins['files']:
        before = (parent / 'source' / item['name']).read_bytes()
        assert sha(before) == item['inputSha256']
        after = before.decode()
        for edit in item['edits']:
            assert after.count(edit['find']) == edit['count'] == 1
            after = after.replace(edit['find'], edit['replace'])
        actual = (HERE / 'source' / item['name']).read_bytes()
        assert actual == after.encode()
        assert sha(actual) == item['outputSha256']
    assert sha((HERE / 'retained-root.patch').read_bytes()) == pins['patchSha256']
    for item in pins['checks']:
        assert sha((HERE / item['path']).read_bytes()) == item['sha256']
    for item in pins['dependencies']:
        assert sha((REPO / item['path']).read_bytes()) == item['sha256']
    store = (HERE / 'source/PrivateNativeFreshBootstrapJournalStore.swift').read_text()
    assert store.index('try Self.requireRootIdentity(canonicalDisposableRoot,fd:rootFD)') < store.index('mkdirat(rootFD,name,0o700)')
    assert 'rootFD=fcntl(retainedRootDescriptor,F_DUPFD_CLOEXEC,0)' in store
    producer = (HERE / 'source/AuxNativeFreshStageCoordinator.swift').read_text()
    assert producer.count('capture.home.duplicateDirectoryForNativeBootstrap()') == 1
    assert producer.count('retainedRootDescriptor:retainedRoot') == 1
    print('PASS: exact retained-root duplicate and pre-mutation inode binding; source only')


if __name__ == '__main__':
    main()
