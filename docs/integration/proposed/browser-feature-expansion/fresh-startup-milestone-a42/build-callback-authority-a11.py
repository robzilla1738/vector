"""Validate the exact active callback owner without opening a nested command."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a51')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
previous=json.loads((HERE/'actual-daemon-startup-diagnostics-build-a10.json').read_text())
assert previous['passed']
link=list(previous['results'][-1]['command'])
source=Path(next(a for a in link if a.endswith('/AuxOwnedCommandDispatcher.swift')))
original=source.read_text()
before='''        do {
            try withEntry(handle,guardGenericAction:false){entry in try requireFreshGuard(entry,moment:.beforeAction)}
            return 0
'''
after='''        do {
            guard getpid()==process else{throw AuxNativeFreshGuardProcessError.wrongProcess}
            let active=Thread.current.threadDictionary[threadKey] as? [UInt64:Int] ?? [:]
            if active[handle,default:0]>0 {
                // An authenticated account-lock callback may perform guarded
                // filesystem writes. Its outer withEntry already holds this
                // exact entry's execution lock and active lifetime on this
                // thread. Revalidate it; do not open a nested command or return
                // a cached admission result. Command re-entry stays forbidden.
                condition.lock()
                guard let entry=entries[handle] else{condition.unlock();throw AuxDispatcherLifetimeError.invalidHandle}
                guard entry.phase == .open,entry.active>0 else{condition.unlock();throw AuxDispatcherLifetimeError.retiring}
                condition.unlock()
                try requireFreshGuard(entry,moment:.beforeAction)
            }else{
                try withEntry(handle,guardGenericAction:false){entry in try requireFreshGuard(entry,moment:.beforeAction)}
            }
            return 0
'''
assert original.count(before)==1
text=original.replace(before,after)
dest=HERE/'callback-authority-source'/source.name
dest.parent.mkdir()
dest.write_text(text)
with (HERE/'callback-authority-a11.patch').open('x') as f:f.writelines(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+source.name,tofile='b/'+source.name))
with (HERE/'actual-callback-authority-projection-a11.json').open('x') as f:json.dump(dict(passed=True,input=str(source),inputSha256=sha(source),output=str(dest),outputSha256=sha(dest),onlyAuthorityValidationReentry=True,actualFreshGuardStillRuns=True,otherCommandReentryStillRefused=True,pidAndPhaseAndActiveLifetimeRequired=True,uiChanged=False,productExecuted=False),f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700)
link[link.index(str(source))]=str(dest)
link[link.index('-o')+1]=str(OUT/'Aux Daemon')
frozen={a:sha(a) for a in link if Path(a).is_file()}
run=subprocess.run(link,cwd=ROOT,capture_output=True)
(OUT/'stdout').write_bytes(run.stdout);(OUT/'stderr').write_bytes(run.stderr)
receipt=dict(format='aux.ordinary-fresh.callback-authority.build.v1',passed=run.returncode==0,results=[dict(command=link,exitCode=run.returncode)],inputFiles=frozen,cppObjectsReused=14,swiftSourceCount=sum(a.endswith('.swift') for a in link),policyUnchanged=True,productSigned=False,productExecuted=False)
if run.returncode==0:
    binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-callback-authority-build-a11.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=run.returncode==0,swiftSources=receipt['swiftSourceCount'],cppObjectsReused=14)))
if run.returncode:
    print(run.stderr.decode(errors='replace')[-4000:]);raise SystemExit(1)
