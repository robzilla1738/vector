#!/usr/bin/env python3
"""Read-only source replay and checks; never loads the product or native module."""
from pathlib import Path
import hashlib,json,subprocess
HERE=Path(__file__).resolve().parent
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
m=json.loads((HERE/'overlay.json').read_text())
for record in m['files']:
 old=(HERE/record['baseline']).read_text();new=(HERE/record['source']).read_text()
 assert sha(HERE/record['baseline'])==record['beforeSha256']
 assert sha(HERE/record['source'])==record['afterSha256']
 assert sha(Path(record['target']))==record['beforeSha256']
 for c in record['changes']:
  assert old.count(c['find'])==c['count']==1
  old=old.replace(c['find'],c['replace'])
 assert old==new
for r in m['newFiles']: assert sha(HERE/r['path'])==r['sha256']
for r in m['dependencies']: assert sha(Path(r['path']))==r['sha256']
assert sha(HERE/'changes.patch')==m['patchSha256']
core=(HERE/'source/AuxRuntimePublication.inc').read_text()
napi=(HERE/'source/AuxRuntimePublicationNapi.inc').read_text()
seed=(HERE/'source/runtime-seed.cjs').read_text()
assert core.count('renameatx_np(')==1 and 'kDestination, RENAME_EXCL)' in core
assert 'rename(' not in core and 'renameat(' not in core
assert 'lease.renamed || lease.commit_uncertain' in core
assert 'mode == Mode::kSharedUse ? LOCK_SH : LOCK_EX' in core
assert 'mutators_closed = true' in core
assert 'fsync(lease.task.fd) == 0 && current() && lease.SamePublished()' in core
assert 'work->lease.reset();' in napi and napi.index('broker_untracked=true')<napi.index('work->lease.reset();')
assert 'napi_cancel_async_work' in napi and napi.count('--captured.worker->broker_pending')==1
assert not any(x in seed for x in ['node:fs','mkdir(','rename(','unlink(','chmod(','symlink(','rm('])
for name in ['runtime-seed.cjs','runtime-bootstrap.cjs']:
 subprocess.run(['node','--check',str(HERE/'source'/name)],check=True)
print(json.dumps({'sourceReplay':True,'baselineLeaves':len(m['files']),'newNativeLeaves':len(m['newFiles']),'singleExclusiveRename':True,'jsSyntax':True,'nativeCompiled':False,'runtimeAccepted':False,'wholeWriterDrainProven':False}))
