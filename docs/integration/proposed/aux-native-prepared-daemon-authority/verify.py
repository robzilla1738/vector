#!/usr/bin/env python3
import pathlib,hashlib,json,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(q):return hashlib.sha256(q.read_bytes()).hexdigest()
for path,h in json.loads((p/'inputs.json').read_text()).items():assert sha(repo/path)==h,path
s=(p/'source/AuxPreparedDaemonAuthority.swift').read_text()
assert 'message.count==51 && message.prefix(19)==daemonAuthPrefix' in s
caller=(repo/'docs/integration/proposed/complete-aux-protocol-identity/source/chrome/browser/aux/installation_auth.cc').read_text()
assert 'bytes->size() != 32' in caller and 'sizeof("Aux Daemon Auth v1\\0") - 1' in caller
assert len(b'Aux Daemon Auth v1\0')==19
assert s.count('command="')==3
assert 'entry.retiredThrough=previous.sequence' in s and 'previous.acknowledged' in s
assert 'sequence==previous.sequence+1' in s and 'previous.sequence<UInt64.max' in s
assert 'request.result = .running' in s and 'current==2{result=callPreparedDaemonAuthority' in s
assert 'auxNativeContextValidateCurrentAuthority(entry.owner.handle)' in s
assert 'memset_s(storage,count,0,count)' in s
assert s.index('let id=daemonAuthorityNext') < s.index('guard AuxRetainPreparedFreshRuntimeProvider(provider)==0')
assert 'unpublishedDaemonAuthorities' not in s
b=repo/'docs/integration/proposed/aux-native-fresh-read-result-lifetime/source/AuxOwnedCommandDispatcher.swift';f=p/'source/AuxOwnedCommandDispatcher.swift'
assert ''.join(difflib.unified_diff(b.read_text().splitlines(True),f.read_text().splitlines(True),fromfile=str(b.relative_to(repo)),tofile=str(f.relative_to(repo))))==(p/'dispatcher.patch').read_text()
print('PASS: source-pinned three fixed operations, exact Auth51 bytes, monotonic sequence/ACK, actual owner validation and owned cache wipe; STATIC ONLY')
