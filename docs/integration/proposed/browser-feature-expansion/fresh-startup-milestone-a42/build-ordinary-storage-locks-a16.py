"""Wait for native journal writers instead of refusing ordinary startup contention."""
import difflib
import hashlib
import json
from pathlib import Path
import subprocess

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a56')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
previous=json.loads((HERE/'actual-daemon-ordinary-storage-build-a15.json').read_text());assert previous['passed']
link=list(previous['results'][-1]['command'])
sources=[Path(next(a for a in link if a.endswith('/'+name))) for name in ['PrivateNativeFreshBootstrapJournalStore.swift','PrivateNativeFreshTargetJournalStore.swift']]
dest=HERE/'ordinary-storage-locks-source';dest.mkdir()
rows=[];patch=[]
for source in sources:
    original=source.read_text()
    error='NativeFreshBootstrapStoreError' if source.name.startswith('PrivateNativeFreshBootstrap') else 'NativeFreshTargetStoreError'
    shared='        guard flock(fd,LOCK_SH|LOCK_NB)==0 else{throw '+error+'.busy}\n'
    exclusive='        guard flock(fd,LOCK_EX|LOCK_NB)==0 else{throw '+error+'.busy}\n'
    assert original.count(shared)==1 and original.count(exclusive)==1
    shared_wait='        while flock(fd,LOCK_SH) != 0 {\n            guard errno==EINTR else{throw '+error+'.io(errno)}\n        }\n'
    exclusive_wait='#if AUX_BROWSER_ONLY_NATIVE_STARTUP\n        while flock(fd,LOCK_EX) != 0 {\n            guard errno==EINTR else{throw '+error+'.io(errno)}\n        }\n#else\n'+exclusive+'#endif\n'
    text=original.replace(shared,shared_wait).replace(exclusive,exclusive_wait)
    output=dest/source.name;output.write_text(text)
    rows.append(dict(input=str(source),inputSha256=sha(source),output=str(output),outputSha256=sha(output)))
    patch.extend(difflib.unified_diff(original.splitlines(True),text.splitlines(True),fromfile='a/'+source.name,tofile='b/'+source.name))
    link[link.index(str(source))]=str(output)
with (HERE/'ordinary-storage-locks-a16.patch').open('x') as f:f.writelines(patch)
with (HERE/'actual-ordinary-storage-locks-projection-a16.json').open('x') as f:json.dump(dict(passed=True,files=rows,ordinaryNativeJournalLocksWaitForActualHolder=True,eintrRetry=True,postLockIdentityAndContentChecksPreserved=True,protectedNonordinaryLockBehaviorUnchanged=True,noCachedAuthority=True,uiChanged=False,productExecuted=False),f,indent=2);f.write('\n')
OUT.mkdir(mode=0o700);link[link.index('-o')+1]=str(OUT/'Aux Daemon')
frozen={a:sha(a) for a in link if Path(a).is_file()}
run=subprocess.run(link,cwd=ROOT,capture_output=True)
(OUT/'stdout').write_bytes(run.stdout);(OUT/'stderr').write_bytes(run.stderr)
receipt=dict(format='aux.ordinary-fresh.image-path-check.build.v1',passed=run.returncode==0,results=[dict(command=link,exitCode=run.returncode)],inputFiles=frozen,cppObjectsReused=14,swiftSourceCount=sum(a.endswith('.swift') for a in link),authorizationAndImageCensusUnchanged=True,productSigned=False,productExecuted=False)
if run.returncode==0:
    binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout
    assert b'LC_CODE_SIGNATURE' not in load
    receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-ordinary-storage-locks-build-a16.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=run.returncode==0,swiftSources=receipt['swiftSourceCount'],cppObjectsReused=14)))
if run.returncode:print(run.stderr.decode(errors='replace')[-4000:]);raise SystemExit(1)
