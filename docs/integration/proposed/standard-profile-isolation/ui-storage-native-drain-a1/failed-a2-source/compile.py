import hashlib,json,shlex,subprocess
from pathlib import Path
root=Path('/private/tmp/aux-chromium-recovery-snapshot-20261023/src')
repo=Path('/Users/rcourson/Documents/Vibe/web')
here=repo/'docs/integration/proposed/standard-profile-isolation/ui-storage-native-drain-a1'
plan=json.loads((here/'source-plan.json').read_text())
out=Path('/private/tmp/aux-ui-storage-native-drain-compile-20261024-a2');out.mkdir(mode=0o700)
sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest()
for row in plan['files']:
 assert sha(root/row['path'])==row['inputSha256']
 assert sha(here/'source'/row['path'])==row['outputSha256']
target='obj/components/services/storage/storage/async_dom_storage_database.o'
probe=subprocess.run([str(root/'third_party/ninja/ninja'),'-C','out/AuxFast','-t','commands',target],cwd=root,capture_output=True,check=True)
(out/'ninja-commands.bin').write_bytes(probe.stdout)
lines=[line for line in probe.stdout.splitlines() if b'async_dom_storage_database.cc' in line and b' -o '+target.encode() in line]
assert len(lines)==1,len(lines)
selected=lines[0].decode('utf-8')
(here/'compiler-command-original.txt').write_text(selected+'\n')
args=shlex.split(selected);assert Path(args[0]).name=='clang++'
cwd=root/'out/AuxFast';compiler=(cwd/args[0]).resolve();assert compiler.is_file()
index=[i for i,arg in enumerate(args) if arg.endswith('/async_dom_storage_database.cc')];assert len(index)==1
args[index[0]]=str(here/'source/components/services/storage/dom_storage/async_dom_storage_database.cc')
args[args.index('-o')+1]=str(out/'async_dom_storage_database.o')
assert '-MF' in args;args[args.index('-MF')+1]=str(out/'async_dom_storage_database.d')
args.insert(1,'-I'+str(here/'source'))
(here/'compiler-command.json').write_text(json.dumps({'cwd':str(cwd),'compilerSha256':sha(compiler),'originalTarget':target,'command':args,'output':str(out)},indent=2)+'\n')
r=subprocess.run(args,cwd=cwd,capture_output=True,text=True)
(out/'stdout.txt').write_text(r.stdout);(out/'stderr.txt').write_text(r.stderr)
result={'format':'aux.storage-db-drain.compile.actual.v1','passed':r.returncode==0,'exitCode':r.returncode,'output':str(out),'nativeRootChanged':False,'productExecuted':False,'nativeApiCallerIntegrated':False,'fullBrowserBuilt':False,'commandDiscoveryBytes':len(probe.stdout),'commandDiscoverySha256':hashlib.sha256(probe.stdout).hexdigest(),'selectedCommandDecodedStrictly':True}
if r.returncode==0:
 obj=out/'async_dom_storage_database.o';assert obj.stat().st_size>0
 result['objectSha256']=sha(obj)
 nm=subprocess.run(['/usr/bin/nm','-gU',str(obj)],capture_output=True,text=True,check=True)
 (out/'symbols.txt').write_text(nm.stdout);assert 'DrainCommitsForAuxMigration' in nm.stdout
 result['drainSymbolPresent']=True
 deps=shlex.split((out/'async_dom_storage_database.d').read_text().replace('\\\n',' ').split(':',1)[1])
 files=sorted({str((cwd/p).resolve()) for p in deps})
 result['dependencyInputs']=[{'path':p,'sha256':sha(p)} for p in files]
 for row in plan['files']:assert sha(root/row['path'])==row['inputSha256']
(here/'actual-compile-a2.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({k:v for k,v in result.items() if k!='dependencyInputs'}))
if r.returncode:print(r.stderr[:9000]);raise SystemExit(r.returncode)
