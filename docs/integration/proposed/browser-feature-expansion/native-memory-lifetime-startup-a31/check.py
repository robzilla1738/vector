from pathlib import Path
import hashlib,json,subprocess,tempfile,os,copy
P=Path(__file__).resolve().parent
sha=lambda x:hashlib.sha256(x).hexdigest()
def method(s,name):
 a=s.index(name);a=s.rfind('\n',0,a)+1;o=s.index('{',a);depth=0;quoted=False;escaped=False
 for z in range(o,len(s)):
  c=s[z]
  if quoted:
   if escaped:escaped=False
   elif c=='\\':escaped=True
   elif c=='"':quoted=False
   continue
  if c=='"':quoted=True
  elif c=='{':depth+=1
  elif c=='}':
   depth-=1
   if depth==0:return s[a:z+1]+'\n'
 raise AssertionError(name)
plan=json.loads((P/'source-plan.json').read_text())
for f in plan['files']:
 original=Path(f['path']).read_bytes();assert sha(original)==f['inputSha256'];applied=original.decode()
 for anchor in f['anchors']:
  assert applied.count(anchor['find'])==anchor['count'];applied=applied.replace(anchor['find'],anchor['replace'],1)
 assert sha(applied.encode())==f['outputSha256']==sha(Path(f['source']).read_bytes())
T=(P/'source/AuxNativeTaskLayout.swift').read_text();G=(P/'source/AuxFreshColdInstallerGuard.swift').read_text()
strict=Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift').read_text()
fixture='import Foundation\nimport Darwin\nenum AuxFreshColdGuardError:Error {case metadata,path,io(Int32)}\nenum AuxFreshColdBootstrapError:Error {case legacyOrUnknownExistingState}\nenum EnvelopePortError:Error {case malformedRecord}\n'+method(strict,'func strictEnvelopeObject(')
a=T.index('    private struct MemoryHelperProcess {');b=T.index('    // Decoder yields',a)
fixture+='enum Fixture {\n'+T[a:b]
for f in ['private static func decodeMemoryHelperProcesses(','private static func memoryHelperRecordNames(','private static func memoryHelperProcesses(','private static func metadata(','private static func entry(']:fixture+=method(T,f)
fixture+='static func inspect(_ home:Int32,_ expected:Data)throws->Int {try memoryHelperProcesses(home:home,expected:expected).count}\n}\n'
fixture+='''let manifest=try JSONSerialization.jsonObject(with:Data(contentsOf:URL(fileURLWithPath:CommandLine.arguments[1]))) as! [String:Any]
let expected=Data((manifest["binding"] as! String).utf8)
for test in manifest["cases"] as! [[String:Any]] {
 let fd=open(test["path"] as! String,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC)
 guard fd>=0 else{fatalError("fixture open")};defer{close(fd)}
 do {let count=try Fixture.inspect(fd,expected)
  guard let wanted=test["count"] as? Int,count==wanted else{fatalError("expected refusal: \\(test["name"]!)")}
 }catch {guard test["count"]==nil else{fatalError("unexpected refusal: \\(test["name"]!) \\(error)")}}
}
print("actual decoder/filesystem checks passed")
'''
base={'format':'aux.memory.helper-lifetime.v1','leaseId':'12345678-1234-1234-1234-123456789abc','controlScope':'a'*64,'controlTransactionId':'ABCDEF01-1234-1234-1234-123456789ABC','controlReservationSha256':'b'*64,'policySha256':'c'*64,'transportGeneration':'18446744073709551615','accountId':'0','accountIncarnation':'ABCDEF02-1234-1234-1234-123456789ABC','profileId':'ABCDEF03-1234-1234-1234-123456789ABC','profilePathSha256':'d'*64,'recordSha256':'e'*64,'daemon':{'pid':'101','seconds':'1700000001','microseconds':'1'},'browser':{'pid':'102','seconds':'1700000002','microseconds':'2'},'phase':'spawned','helper':{'pid':'103','seconds':'1700000003','microseconds':'3'}}
binding={k:base[k] for k in ['controlScope','controlTransactionId','controlReservationSha256','policySha256']}
cases=[]
def snapshot(root):
 result={}
 for p in sorted(root.rglob('*')):
  result[str(p.relative_to(root))]=('symlink',os.readlink(p)) if p.is_symlink() else ('directory',p.stat().st_mode) if p.is_dir() else ('file',p.stat().st_mode,p.read_bytes().hex())
 return result
with tempfile.TemporaryDirectory(prefix='aux-memory-lifetime-data-only-') as td:
 root=Path(td)
 def add(name,record=base,count=None,filename=None,raw=None,kind='file',mode=0o600):
  home=root/name;home.mkdir(mode=0o700);directory=home/'.aux-memory-helper-lifetimes.v1'
  if kind!='missing':
   directory.mkdir(mode=0o700)
   file=directory/(filename or base['leaseId']+'.json')
   if kind=='symlink':file.symlink_to(root/'absent')
   elif kind!='empty':file.write_bytes(raw if raw is not None else json.dumps(record).encode());file.chmod(mode)
  case={'name':name,'path':str(home)}
  if count is not None:case['count']=count
  cases.append(case)
 add('missing',count=0,kind='missing');add('empty',count=0,kind='empty');add('spawned',count=3)
 r=copy.deepcopy(base);r['phase']='reaped';r['waitStatus']='-1';add('reaped',r,count=3)
 r=copy.deepcopy(base);r['phase']='not-spawned';del r['helper'];r['spawnError']='2';add('not-spawned',r,count=2)
 r=copy.deepcopy(base);r['phase']='prepared';del r['helper'];add('prepared-unknown',r)
 r=copy.deepcopy(base);r['accountId']='00';add('account-noncanonical',r)
 r=copy.deepcopy(base);r['accountId']='9007199254740992';add('account-out-of-range',r)
 r=copy.deepcopy(base);r['controlScope']='f'*64;add('other-root-binding',r)
 r=copy.deepcopy(base);r['transportGeneration']='0';add('zero-generation',r)
 r=copy.deepcopy(base);r['helper']['pid']='101';add('same-pid',r)
 r=copy.deepcopy(base);r['helper']['microseconds']='1000000';add('invalid-birth',r)
 r=copy.deepcopy(base);r['stdioClosed']=True;add('asserted-ready-field',r)
 add('partial-json',raw=b'{');add('duplicate-fields',raw=json.dumps(base).replace('"accountId": "0"','"accountId":"0","accountId":"1"').encode())
 add('unknown-temp-name',filename='.write-in-progress');add('symlink',kind='symlink');add('unsafe-mode',mode=0o644)
 before=snapshot(root)
 harness=root/'fixture.swift';harness.write_text(fixture)
 manifest=root/'manifest.json';manifest.write_text(json.dumps({'binding':json.dumps(binding),'cases':cases}))
 syntax=subprocess.run(['/usr/bin/swiftc','-typecheck',str(harness)],text=True,capture_output=True)
 if syntax.returncode:raise AssertionError(syntax.stderr)
 result=subprocess.run(['/usr/bin/swift',str(harness),str(manifest)],text=True,capture_output=True)
 if result.returncode:raise AssertionError(result.stderr)
 after=snapshot(root);after.pop('fixture.swift');after.pop('manifest.json');assert after==before
 # Reader is exact product code; kernel observation intentionally not replaced.
 assert 'memoryHelperPriorProcessExited' not in fixture
 assert T.count('try layout.requireNoUnresolvedMemoryHelperLifetimes()')==1
 assert G.count('try AuxNativeTaskLayout.preflightExistingPair(')==2
 lock=G.index('guard flock(installer,LOCK_EX|LOCK_NB)==0')
 assert G.index('try AuxNativeTaskLayout.preflightExistingPair(',lock)<G.index('let guardOwner=',lock)
 report={'format':'aux.memory-lifetime-startup-check.v1','cases':len(cases),'interpreterExitCode':result.returncode,'interpreterStdout':result.stdout.strip(),'noFixtureExecutable':True,'allSyntheticNamesAndBytesUnchanged':True,'kernelProcessObservationExecuted':False,'kernelCallbackShimmed':False,'helperLaunched':False,'nativeGraphTypecheckPending':True}
 (P/'focused-check.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps(report,indent=2))
