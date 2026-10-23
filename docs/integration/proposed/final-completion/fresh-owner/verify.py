#!/usr/bin/env python3
"""Count/hash-bound successor review, no native execution or state access."""
import difflib,hashlib,json,pathlib
p=pathlib.Path(__file__).resolve().parent;r=p.parents[4]
def sha(x):return hashlib.sha256(x.read_bytes()).hexdigest()
m=json.loads((p/'integration.json').read_text());patch=''
for old,record in m['replacements'].items():
 baseline=p/'baseline'/pathlib.Path(old).name;successor=r/record['successor']
 assert sha(r/old)==sha(baseline)==record['beforeSha256'],old
 assert sha(successor)==record['afterSha256'],record['successor']
 patch+=''.join(difflib.unified_diff(baseline.read_text().splitlines(True),successor.read_text().splitlines(True),fromfile='a/'+old,tofile='b/'+record['successor']))
assert patch==(p/'source.patch').read_text()
f=(p/'source/AuxFreshNativeHome.swift').read_text();q=(p/'source/AuxResumedFreshNativeHome.swift').read_text();l=(p/'source/AuxNativeFreshReservationLeaseRegistry.swift').read_text()
for text in [f,q]:
 assert text.count('private let creatorProcess = getpid()')==1
 assert 'deinit {\n        // Int32 descriptors' in text
 deinit=text[text.index('    deinit {\n        // Int32 descriptors'):text.index('    private func requireOwnerProcess()')]
 assert deinit.index('guard creatorProcess == getpid() else { return }')<deinit.index('close(homeFD)')
 assert 'func validateRetainedIdentity() throws {\n        try requireOwnerProcess()' in text
 assert 'func duplicateDirectoryForNativeBootstrap() throws -> Int32 {\n        try requireOwnerProcess()' in text
assert 'func claimInitialAuthorityGenerationAttempt() throws {\n        try requireOwnerProcess()\n        generationAttemptLock.takeUnretainedValue().lock()' in f
assert 'func readExistingInitialJournal() throws -> StoredNativeFreshBootstrapJournal {\n        try requireOwnerProcess()' in q
assert 'let state = try currentRegistry()\n        try proposed.requireOwnerProcess()\n        let reservation = try metadata' in q
assert 'let selected = try currentState()\n        var parent = stat()' in l
assert 'static func requireCurrentProcess() throws' in l
assert 'private static let registryLock' not in q and 'private static let lock = NSLock()' not in l
print('PASS: three exact predecessor/successor hashes, full patch replay and guarded owner/registry entrypoints; no runtime acceptance')
