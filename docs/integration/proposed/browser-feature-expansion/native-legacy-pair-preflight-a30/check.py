from pathlib import Path
import hashlib,json,subprocess,tempfile
P=Path(__file__).resolve().parent;sha=lambda b:hashlib.sha256(b).hexdigest()
plan=json.loads((P/'source-plan.json').read_text())
def method_span(s,name,prefix=''):
 a=s.index(prefix+name);a=s.rfind('\n',0,a)+1;o=s.index('{',a);depth=0;quoted=False;escaped=False
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
   if depth==0:return a,z+1
 raise AssertionError(name)
def method(s,name,prefix=''):a,z=method_span(s,name,prefix);return s[a:z]+'\n'
for f in plan['files']:
 s=Path(f['path']).read_bytes();assert sha(s)==f['inputSha256'];t=s.decode()
 for a in f['anchors']:assert t.count(a['find'])==a['count'];t=t.replace(a['find'],a['replace'])
 assert sha(t.encode())==f['outputSha256']==sha(Path(f['source']).read_bytes())
G=(P/'source/AuxFreshColdInstallerGuard.swift').read_text();T=(P/'source/AuxNativeTaskLayout.swift').read_text()
assert G.index('try AuxNativeTaskLayout.preflightExistingPair(')<G.index('let browserAdmission=try AuxBrowserFreshRootAdmission.acquire(')
B=Path('/private/tmp/aux-final-native-link/docs/integration/proposed/final-completion/fresh-owner/source')
F=B/'AuxFreshNativeHome.swift';R=B/'AuxResumedFreshNativeHome.swift';L=B/'AuxNativeFreshReservationLeaseRegistry.swift'
fresh=F.read_text();resumed=R.read_text();registry=L.read_text()
fresh=fresh[:fresh.index('final class AuxFreshNativeHome {')]+'enum AuxFreshNativeHome {static let reservationName=".aux-first-installation.v1"}\n'
a,z=method_span(resumed,'func readExistingInitialJournal(');resumed=resumed[:a]+resumed[z:]
for name in ['static func create(','static func reopen(']:
 a,z=method_span(T,name);T=T[:a]+T[z:]
strict=Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift')
# Test-only immutable synthetic policy context, NOT a native signature/admission
# producer. The actual retained-home/task codecs and filesystem methods below
# are unchanged. Live policy/peer/signature proofs are outside this fixture.
policy='''import Foundation
import Darwin
import CryptoKit
struct FixturePolicyContents {let canonicalPrivateParent:String;let canonicalTaskParent:String?;let accessGroup="synthetic-fixture"}
struct AuxAuthenticatedFreshBootstrapPolicy {
 let contents:FixturePolicyContents;let policySha256=String(repeating:"a",count:64)
 let bundlePath="/synthetic-bundle-not-executed";let hostCdHash="synthetic";let process=getpid()
 func revalidateCurrentIdentity()throws {guard getpid()==process else{throw AuxFreshColdGuardError.wrongProcess}}
}
enum AuxFreshColdBootstrapError:Error {case legacyOrUnknownExistingState}
enum NativeFreshBootstrapError:Error {case binding}
'''
error=G[G.index('enum AuxFreshColdGuardError:Error'):G.index('\nfinal class AuxLiveNativeParentConnection')]
guard='enum GuardFixture {static let installerName=".aux-native-cold-installer.v1"\n'+method(G,'private static func requireFreshParentInventory(')+method(G,'private static func requirePrivate(')+method(G,'private static func requirePath(')+'}\nextension GuardFixture {static func check(_ p:AuxAuthenticatedFreshBootstrapPolicy,_ c:Int32)throws {try requirePrivate(c,directory:true);try requirePath(p.contents.canonicalPrivateParent,fd:c);try requireFreshParentInventory(policy:p,parentFD:c)}}\n'
# Actual existing-only binding is exposed solely in this generated fixture to
# construct canonical synthetic paired records; product private API unchanged.
access='''extension AuxNativeTaskLayout {static func fixtureBinding(_ p:AuxAuthenticatedFreshBootstrapPolicy,_ h:AuxResumedFreshNativeHome)throws->(String,Data) {try binding(policy:p,scope:h.scope,transaction:h.transactionId,reservationHash:h.currentReservationSha256())}}
'''
# Actual browser marker preparation region, before any record generation. It is
# sufficient to reproduce the old mutation before the late record preflight.
browserPath=Path(__file__).resolve().parents[1]/'organization-launch-boundary-a28/AuxBrowserFreshRootAdmission.swift'
browser=browserPath.read_text();a=browser.index('        guard existing[0]==existing[1]',browser.index('private static func acquireOrdinary'));z=browser.index('        let installation=try ordinaryInstallation(policy)',a)
mark='''enum BrowserMarkerFixture {static let marker=".aux-browser-ordinary-lease.v1"
 static func prepare(_ roots:[Int32])throws {let existing=[false,false];var markers=[Int32]();defer{for fd in markers{close(fd)}}
'''+browser[a:z]+'\n }\n'+method(browser,'private static func metadata(')+method(browser,'private static func entry(')+method(browser,'private static func inventory(')+'}\n'
main='''
let fm=FileManager.default,scope="/private/tmp/aux-pair-preflight-fixture-"+UUID().uuidString.lowercased()
try fm.createDirectory(atPath:scope,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? fm.removeItem(atPath:scope)}
func mkdir(_ p:String)throws {try fm.createDirectory(atPath:p,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700]);try fm.setAttributes([.posixPermissions:0o700],ofItemAtPath:p)}
func write(_ p:String,_ bytes:Data)throws {try bytes.write(to:URL(fileURLWithPath:p));try fm.setAttributes([.posixPermissions:0o600],ofItemAtPath:p)}
func snapshot(_ p:String)throws->[String:String] {
 var result=[String:String]()
 func walk(_ dir:String,_ relative:String)throws {
  for name in try fm.contentsOfDirectory(atPath:dir).sorted() {
   let path=dir+"/"+name,key=relative+"/"+name
   var st=stat();precondition(lstat(path,&st)==0)
   if (st.st_mode&S_IFMT)==S_IFDIR {result[key]="directory";try walk(path,key)}
   else if (st.st_mode&S_IFMT)==S_IFLNK {result[key]="symlink:"+(try fm.destinationOfSymbolicLink(atPath:path))}
   else {result[key]=(try Data(contentsOf:URL(fileURLWithPath:path))).base64EncodedString()}
  }
 }
 try walk(p,"");return result
}
func fixture(_ label:String)throws->(String,AuxAuthenticatedFreshBootstrapPolicy,[String]) {
 let dir=scope+"/"+label;try mkdir(dir)
 let paths=[dir+"/control",dir+"/tasks",dir+"/data",dir+"/cache"]
 for p in paths{try mkdir(p)}
 return(dir,AuxAuthenticatedFreshBootstrapPolicy(contents:.init(canonicalPrivateParent:paths[0],canonicalTaskParent:paths[1])),paths)
}
func checked(_ policy:AuxAuthenticatedFreshBootstrapPolicy,_ paths:[String],baseline:Bool=false)throws {
 var fds=[Int32]();defer{for fd in fds{close(fd)}}
 for p in paths {let fd=open(p,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);precondition(fd>=0);fds.append(fd)}
 if baseline {try BrowserMarkerFixture.prepare(Array(fds[2...3]))}
 try GuardFixture.check(policy,fds[0])
 try AuxNativeTaskLayout.preflightExistingPair(policy:policy,retainedControlParent:fds[0],retainedTaskParent:fds[1])
}
func refusedUntouched(_ label:String,_ setup:(AuxAuthenticatedFreshBootstrapPolicy,[String])throws->Void)throws {
 let(dir,policy,paths)=try fixture(label);try setup(policy,paths);let before=try snapshot(dir)
 var refused=false;do{try checked(policy,paths)}catch{refused=true}
 precondition(refused);let after=try snapshot(dir);precondition(after==before)
}
let raw=Data("synthetic-unchanged".utf8)
let(baseDir,basePolicy,basePaths)=try fixture("baseline")
try write(basePaths[0]+"/unknown.fixture",raw)
let before=try snapshot(baseDir);var baselineRefused=false
do{try checked(basePolicy,basePaths,baseline:true)}catch{baselineRefused=true}
let after=try snapshot(baseDir);precondition(baselineRefused && before != after)
precondition(after["/data/.aux-browser-ordinary-lease.v1"] != nil && after["/cache/.aux-browser-ordinary-lease.v1"] != nil)
try refusedUntouched("unknown-control"){_,p in try write(p[0]+"/unknown.fixture",raw)}
try refusedUntouched("malformed-control"){_,p in try write(p[0]+"/.aux-first-installation.v1",Data("{}".utf8))}
try refusedUntouched("orphan-task"){_,p in try write(p[1]+"/.aux-task-installation.v1",Data("{}".utf8))}
try refusedUntouched("unknown-task"){_,p in try write(p[1]+"/unknown.fixture",raw)}
func paired(_ policy:AuxAuthenticatedFreshBootstrapPolicy,_ paths:[String],task:Bool=true)throws {
 let transaction=UUID().uuidString,name="aux-home-"+UUID().uuidString.lowercased(),home=paths[0]+"/"+name
 try mkdir(home)
 let hash=SHA256.hash(data:Data(home.utf8)).map{String(format:"%02x",$0)}.joined()
 let record=try JSONSerialization.data(withJSONObject:["format":"aux.first-installation.reservation.v1","home":name,"scope":hash,"transactionId":transaction],options:[.sortedKeys,.withoutEscapingSlashes])
 try write(paths[0]+"/.aux-first-installation.v1",record)
 if task {
  let held=open(paths[0],O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);precondition(held>=0);defer{close(held)}
  let native=try AuxResumedFreshNativeHome.reopen(policy:policy,retainedParentDescriptor:held)
  let(taskName,taskRecord)=try AuxNativeTaskLayout.fixtureBinding(policy,native)
  try write(paths[1]+"/.aux-task-installation.v1",taskRecord);try mkdir(paths[1]+"/"+taskName)
 }
}
try refusedUntouched("missing-task-pair"){p,paths in try paired(p,paths,task:false)}
try refusedUntouched("wrong-task-pair"){p,paths in try paired(p,paths);try write(paths[1]+"/.aux-task-installation.v1",Data("{}".utf8))}
let(validDir,validPolicy,validPaths)=try fixture("matching-pair");try paired(validPolicy,validPaths)
let validBefore=try snapshot(validDir);try checked(validPolicy,validPaths);let validAfter=try snapshot(validDir);precondition(validBefore==validAfter)
let(freshDir,freshPolicy,freshPaths)=try fixture("fresh-pair");let freshBefore=try snapshot(freshDir);try checked(freshPolicy,freshPaths);let freshAfter=try snapshot(freshDir);precondition(freshBefore==freshAfter)
print("PASS: old ordering mutates markers before rejection; six unknown/partial cases preserve every name/byte; matching and empty pair preflights read-only")
'''
harness=policy+'\n'+error+'\n'+fresh+'\n'+registry+'\n'+resumed+'\n'+T+'\n'+strict.read_text()+'\n'+guard+'\n'+mark+'\n'+access+main
with tempfile.TemporaryDirectory(prefix='aux-readonly-pair-check-') as d:
 t=Path(d)
 for f in plan['files']:(t/Path(f['path']).name).write_bytes(Path(f['path']).read_bytes())
 subprocess.run(['git','apply','--check',str(P/'source.patch')],cwd=t,check=True);subprocess.run(['git','apply',str(P/'source.patch')],cwd=t,check=True)
 for f in plan['files']:assert sha((t/Path(f['path']).name).read_bytes())==f['outputSha256']
 source=t/'fixture.swift';source.write_text(harness)
 q=subprocess.run(['/usr/bin/swift',str(source)],capture_output=True,text=True)
 if q.returncode:print(q.stderr);q.check_returncode()
 print(q.stdout.strip())
 (P/'focused-check-interpreter.json').write_text(json.dumps(dict(format='aux.legacy-pair-preflight.interpreter-check.v1',sourcePlanSha256=sha((P/'source-plan.json').read_bytes()),harnessSha256=sha(harness.encode()),actualSources={str(p):sha(p.read_bytes())for p in [F,R,L,strict,browserPath]},countedAnchors=3,independentPatchApplication=True,result=q.stdout.strip(),fixtureAdapter='Immutable synthetic policy/identity context only; actual retained-home/task codec, private constructors, record binding and filesystem methods unchanged. Native signatures/peer proof not exercised.',runner='/usr/bin/swift',runnerWritesHostExecutable=False,compilerDefaultSigningPerformed=False,ownerStateAccessed=False,nativeProductExecuted=False),indent=2)+'\n')
