#!/usr/bin/env python3
import pathlib,json,hashlib,difflib
p=pathlib.Path(__file__).resolve().parent;repo=p.parents[3]
def sha(q):return hashlib.sha256(q.read_bytes()).hexdigest()
pins=json.loads((p/'source-pins.json').read_text());assert len(pins['swiftInputs'])==42
for group in ('swiftInputs','nativeSources','baselineInputs','actualRouteEvidence'):
 for name,h in pins[group].items():assert sha(repo/name)==h,name
patch=''.join(''.join(difflib.unified_diff(f.read_text().splitlines(True),(p/'source'/f.name).read_text().splitlines(True),fromfile='baseline/'+f.name,tofile='source/'+f.name)) for f in sorted((p/'baseline').iterdir()))
assert patch==(p/'successor.patch').read_text()
s=(p/'source/AuxOwnedCommandDispatcher.swift').read_text()
assert 'Self.readOnlyCommands.contains(command)' in s
assert 'previous.command==command,previous.inputSha256==Self.requestDigest(input)' in s
assert 'try captured.revalidateCurrentCommandBinding()' in s
assert 'entry.pendingPostGuardObservation=nil;entry.retainedRead=nil' in s
assert 'catch is AuxNativeFreshGuardFailure{return -3}' in s
assert 'func observeOperationState(_ handle:UInt64)->Int32' in s
s=(p/'source/AuxDevelopmentWorkerHost.cc').read_text()
assert 'status == -3) result = AuxDevelopmentWorkerDrain::untracked' in s
assert 'status == 0 || status == -1 || status == -3' in s
print('PASS: frozen42 source pins, real native C route/read-result retention and distinct WorkerHost retirement statuses; STATIC ONLY')
