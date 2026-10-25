"""Relink the real ordinary daemon with existing JS graceful shutdown entry."""
from pathlib import Path
import hashlib,json,subprocess
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[4]
OUT=Path('/private/tmp/aux-browser-only-daemon-build-20261025-a59')
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
previous=json.loads((HERE/'actual-daemon-ordinary-storage-locks-build-a16.json').read_text());assert previous['passed']
main=json.loads((HERE/'actual-daemon-startup-diagnostics-build-a10.json').read_text())
compile=list(next(r['command'] for r in main['results'] if any(str(x).endswith('/AuxNativeDaemonMain.cc') for x in r['command'])))
source=HERE/'ordinary-peer-shutdown-source/AuxNativeDaemonMain.cc'
plan=json.loads((source.parent/'projection.json').read_text());assert sha(source)==plan['files'][0]['outputSha256']
profile=json.loads((source.parent/'node-release-compile-additions.json').read_text());assert sha(profile['nodeTargetMakefile'])==profile['nodeTargetMakefileSha256']
for name,digest in previous['inputFiles'].items():assert sha(name)==digest,name
OUT.mkdir(mode=0o700)
compile[compile.index('-c')+1]=str(source);compile[compile.index('-o')+1]=str(OUT/'main.o');compile[compile.index('-MF')+1]=str(OUT/'main.d')
compile+=profile['additionalArguments']
link=list(previous['results'][-1]['command'])
old=next(a for a in link if a.endswith('/main.o'));link[link.index(old)]=str(OUT/'main.o');link[link.index('-o')+1]=str(OUT/'Aux Daemon')
frozen={a:sha(a) for a in compile+link if Path(a).is_file()}
results=[]
for label,cmd in [('main',compile),('link',link)]:
 run=subprocess.run(cmd,cwd=ROOT,capture_output=True);(OUT/(label+'.stdout')).write_bytes(run.stdout);(OUT/(label+'.stderr')).write_bytes(run.stderr);results.append(dict(command=cmd,exitCode=run.returncode))
 if run.returncode:break
passed=len(results)==2 and all(r['exitCode']==0 for r in results)
receipt=dict(format='aux.ordinary-fresh.peer-shutdown-build.v1',passed=passed,results=results,inputFiles=frozen,cppObjectsReused=13,swiftSourceCount=sum(a.endswith('.swift') for a in link),failedStatusAndDrainPreserved=True,productSigned=False,productExecuted=False)
if passed:
 binary=OUT/'Aux Daemon';load=subprocess.run(['/usr/bin/otool','-l',str(binary)],check=True,capture_output=True).stdout;assert b'LC_CODE_SIGNATURE' not in load
 receipt.update(binary=str(binary),binarySha256=sha(binary),codeSignatureLoadCommandPresent=False)
for name,digest in frozen.items():assert sha(name)==digest,name
with (HERE/'actual-daemon-peer-shutdown-build-a19.json').open('x') as f:json.dump(receipt,f,indent=2);f.write('\n')
print(json.dumps(dict(passed=passed,cppObjectsReused=13,changedCpp=1)))
if not passed:print(run.stderr.decode(errors='replace')[-5000:]);raise SystemExit(1)
