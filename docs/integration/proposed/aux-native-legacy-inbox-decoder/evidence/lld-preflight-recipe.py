#!/usr/bin/env python3
"""Single serialized link-only retry, reusing the already compiled actual TUs."""
import pathlib,subprocess,json,hashlib,shlex,sys
P=pathlib.Path(__file__).resolve().parent
R=pathlib.Path('/Users/rcourson/Documents/Code/aux-chromium-security-155/chromium/src')
B=R/'out/AuxFast'; O=pathlib.Path('/Users/rcourson/Documents/Vibe/web/out/aux-legacy-inbox-codec-check')
T=O/'lld-link';assert not T.exists();T.mkdir()
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
prior=json.loads((O/'receipt.json').read_text());assert prior['compile0ExitCode']==prior['compile1ExitCode']==prior['compile2ExitCode']==0
for name,h in prior['inputs'].items():
 if '/aux-native-legacy-inbox-decoder/source/' in name or '/aux-native-inbox-v2/source/' in name or name.endswith('legacy-inbox-test.cc'):
  assert sha(pathlib.Path(name))==h,name
cc=R/'third_party/llvm-build/Release+Asserts/bin/clang++';lld=cc.parent/'ld64.lld';ar=cc.parent/'llvm-ar'
assert sha(cc)==prior['inputs'][str(cc)]
ninja=B/'obj/crypto/crypto_unittests.ninja';text=ninja.read_text()
line=next(x for x in text.splitlines() if x.startswith('build ./crypto_unittests: link '))
deps=line.split(': link ',1)[1].split(' |',1)[0].split()
vars={}
for x in text.splitlines():
 if x.startswith('  ') and ' = ' in x:
  k,v=x.strip().split(' = ',1);vars[k]=v
assert '-fuse-ld=lld' in vars['ldflags']
# Reuse target's complete archive closure and actual Abseil source-set objects;
# omit every unit-test TU, gtest main, shared test processor and force-load flag.
libs=[B/x for x in deps if x.endswith(('.a','.rlib'))]
libs += [B/x for x in vars.get('rlibs','').split()]
libs=list(dict.fromkeys(libs))
extra=[B/x for x in deps if x.startswith('obj/third_party/abseil-cpp/') and x.endswith('.o')]
objects=[O/(str(i)+'.o') for i in range(3)]
inputs=objects+libs+extra+[cc,lld,ar,ninja,O/'receipt.json',pathlib.Path(__file__)]
member_paths=[]
for archive in libs:
 assert archive.is_file(),archive
 if archive.read_bytes()[:8]==b'!<thin>\n':
  result=subprocess.run([str(ar),'t',str(archive)],capture_output=True,text=True,check=True)
  for name in result.stdout.splitlines():
   q=pathlib.Path(name);q=q if q.is_absolute() else archive.parent/q
   assert q.is_file(),q
   member_paths.append(q)
inputs=list(dict.fromkeys(inputs+member_paths))
sdk=B/'sdk/xcode_links/MacOSX27.0.sdk'
for name in ['SDKSettings.json','System/Library/CoreServices/SystemVersion.plist']:
 if (sdk/name).is_file():inputs.append(sdk/name)
receipt={'status':'prepared','recompiledTranslationUnits':0,'priorCompileReceiptSha256':sha(O/'receipt.json'),'inputHashes':{str(x):sha(x) for x in inputs},'thinArchiveMemberCount':len(set(member_paths)),'syntheticOnly':True,'protectedLookup':False,'databaseAccess':False}
def save(): (T/'receipt.json').write_text(json.dumps(receipt,indent=2)+'\n')
flags=['--target=arm64-apple-macos','-mmacos-version-min=13.0','-isysroot',str(sdk),'-nostdlib++','-fuse-ld=lld','-Wl,-dead_strip']
command=[str(cc)]+flags+list(map(str,objects+extra+libs))+shlex.split(vars.get('libs',''))+['-o',str(T/'fixture')]
receipt['command']=command;save()
result=subprocess.run(command,cwd=B,capture_output=True,text=True);(T/'link.log').write_text(result.stdout+result.stderr);receipt['linkExitCode']=result.returncode
if result.returncode:receipt['status']='link-failed';save();sys.exit(result.returncode)
receipt['binarySha256']=sha(T/'fixture');save()
result=subprocess.run([str(T/'fixture')],cwd=T,capture_output=True,text=True);(T/'fixture.log').write_text(result.stdout+result.stderr)
receipt['fixtureExitCode']=result.returncode;receipt['status']='passed' if result.returncode==0 else 'fixture-failed'
receipt['inputsUnchangedAfterRun']=all(sha(pathlib.Path(k))==v for k,v in receipt['inputHashes'].items());save()
print(json.dumps({k:receipt[k] for k in ['status','linkExitCode','fixtureExitCode','thinArchiveMemberCount','inputsUnchangedAfterRun']}));sys.exit(result.returncode)
