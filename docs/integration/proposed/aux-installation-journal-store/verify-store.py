#!/usr/bin/env python3
"""Static journal-store boundary/pin verification; no filesystem mutation."""
import hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parent
manifest=json.loads((ROOT/'source-pins.json').read_text())
for item in manifest['files']:
    data=(ROOT/item['path']).read_bytes()
    assert len(data)<=1024*1024 and hashlib.sha256(data).hexdigest()==item['sha256']
source=(ROOT/'source/PrivateInstallationJournalStore.swift').read_text()
for token in ['O_NOFOLLOW','O_EXCL','AT_SYMLINK_NOFOLLOW','LOCK_EX|LOCK_NB','fsync(fd)','renameat(directoryFD,temporary,directoryFD,"HEAD.json")','current?.sha256==expected','old.phase != .blocked || next.phase == .abandoned','try syncFile(staged.file)','acl_get_fd_np(fd,ACL_TYPE_EXTENDED)']:
    assert token in source
assert not re.search(r'\bSecItem\w*\s*\(|\bunlink(?:at)?\s*\(|\brmdir\s*\(|PrivateKey\(',source)
assert 'try Self.sync(directoryFD)' in source
assert 'try journal.encoded()==bytes' in source
print('PASS: pinned typed journal storage, no-follow/private/CAS/fsync/retention boundaries and no Security or deletion executor.')
