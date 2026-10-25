from pathlib import Path
import hashlib,json,subprocess,tempfile
P=Path(__file__).resolve().parent
sha=lambda b:hashlib.sha256(b).hexdigest()
plan=json.loads((P/'source-plan.json').read_text())
for f in plan['files']:
 b=Path(f['path']).read_bytes();assert sha(b)==f['inputSha256'];s=b.decode()
 for a in f['anchors']:assert s.count(a['find'])==a['count'];s=s.replace(a['find'],a['replace'])
 assert sha(s.encode())==f['outputSha256']==sha(Path(f['source']).read_bytes())
policy=(P/'source/AuxFreshBootstrapPolicy.swift').read_text();loader=(P/'source/AuxSignedFreshBootstrapPolicyLoader.swift').read_text();parent=P/'source/AuxAuthenticatedChildParentPolicyReader.swift'
strict=Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/aux-native-p256-envelope-port/source/EnvelopeRecords.swift')
strictText=strict.read_text()
def func(source,name):
 a=source.index('    private static func '+name+'(');opening=source.index('{',a)
 depth=0;quoted=False;escaped=False
 for z in range(opening,len(source)):
  c=source[z]
  if quoted:
   if escaped:escaped=False
   elif c=='\\':escaped=True
   elif c=='"':quoted=False
   continue
  if c=='"':quoted=True
  elif c=='{':depth+=1
  elif c=='}':
   depth-=1
   if depth==0:return source[a:z+1]+'\n'
 raise AssertionError(name)
helpers='enum FixtureLoader {\n'+''.join(func(loader,n) for n in ['canonical','metadata','sameEntry','preparePrivateControlParents','privateInventory'])+'}\n'
# The exact extracted filesystem owner is reachable only after signature and
# native OS capture in production. This extension exposes it solely inside the
# generated synthetic fixture; it changes no shipped source/API.
helpers+='extension FixtureLoader {static func prepare(_ n:AuxNativeCurrentUserLocation)throws {try preparePrivateControlParents(n)}}\n'
# Exercise the actual v9 pure decoder branch with one explicitly recorded test
# adapter replacing only its native OS lookup with a synthetic captured home.
a=policy.index('        if object["format"] as? String=="aux.fresh.bootstrap.policy.v9" {');z=policy.index('\n#endif',a)
branch=policy[a:z];assert branch.count('AuxNativeCurrentUserLocation.capture()')==1
branch=branch.replace('AuxNativeCurrentUserLocation.capture()','AuxNativeCurrentUserLocation.deriveFixedRoots(canonicalHome:syntheticHome,uid:getuid())')
branch=branch.replace('validAccessGroup(group)','AuxFreshBootstrapPolicyContents.validAccessGroup(group)').replace('==authoritySelection','==AuxFreshBootstrapPolicyContents.authoritySelection')
fixtureDecode='''func fixtureV9(_ bytes:Data,syntheticHome:String)throws->AuxFreshBootstrapPolicyContents {
 let object=try strictEnvelopeObject(bytes)
 guard let roleText=object["role"] as? String,let role=AuxFreshBootstrapPolicyContents.Role(rawValue:roleText) else{throw AuxFreshBootstrapPolicyError.policy}
'''+branch+'\n throw AuxFreshBootstrapPolicyError.policy\n}\n'
main='''
func rejects(_ body:()throws->Void)->Bool {do{try body();return false}catch{return true}}
let fm=FileManager.default
let scope="/private/tmp/aux-user-location-fixture-"+UUID().uuidString.lowercased(),homeSuffix="/synthetic-home"
try fm.createDirectory(atPath:scope,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? fm.removeItem(atPath:scope)}
let home=scope+homeSuffix
let native=try AuxNativeCurrentUserLocation.deriveFixedRoots(canonicalHome:home,uid:getuid())
precondition(native.dataRoot==home+"/Library/Application Support/Aux Browser/User Data")
precondition(native.controlRoot==native.supportRoot+"/Control" && native.taskRoot==native.supportRoot+"/Tasks")
precondition(native.cacheRoot==home+"/Library/Caches/Aux Browser")
for invalid in ["","/","relative","/private/../home","/private//home","/private/home/",String(repeating:"x",count:4097)] {
 precondition(rejects{_ = try AuxNativeCurrentUserLocation.deriveFixedRoots(canonicalHome:invalid,uid:getuid())})
}
let base:[String:Any] = ["format":"aux.fresh.bootstrap.policy.v9","role":"daemon","accessGroup":"9F2JXY8TCK.dev.aux.local","authoritySelection":AuxFreshBootstrapPolicyContents.authoritySelection,"nativeHostLayout":"embedded-daemon","taskLayout":"aux.native.task-control-split.v1","storageLocation":["format":AuxNativeCurrentUserLocation.format]]
let v9=try fixtureV9(JSONSerialization.data(withJSONObject:base),syntheticHome:home)
precondition(v9.nativeUserLocation==native && v9.browserStartupRoots==[native.dataRoot,native.cacheRoot] && v9.canonicalPrivateParent==native.controlRoot)
try validateFreshBootstrapRebuiltDaemonRoute(v9)
var unknown=base;unknown["canonicalPrivateParent"]="/arbitrary"
precondition(rejects{_ = try fixtureV9(JSONSerialization.data(withJSONObject:unknown),syntheticHome:home)})
var nested=base;nested["storageLocation"]=["format":AuxNativeCurrentUserLocation.format,"home":"/arbitrary"]
precondition(rejects{_ = try fixtureV9(JSONSerialization.data(withJSONObject:nested),syntheticHome:home)})
let fixed:[String:Any] = ["format":"aux.fresh.bootstrap.policy.v8","role":"daemon","canonicalPrivateParent":scope+"/fixed-control","canonicalTaskParent":scope+"/fixed-tasks","accessGroup":"9F2JXY8TCK.dev.aux.local","authoritySelection":AuxFreshBootstrapPolicyContents.authoritySelection,"nativeHostLayout":"embedded-daemon","taskLayout":"aux.native.task-control-split.v1","browserStartup":["format":"aux.browser.ordinary-root-lease.v1","dataRoot":scope+"/fixed-data","cacheRoot":scope+"/fixed-cache"]]
let v8=try AuxFreshBootstrapPolicyContents.decode(JSONSerialization.data(withJSONObject:fixed))
precondition(v8.nativeUserLocation==nil && v8.canonicalPrivateParent==scope+"/fixed-control")
func mkdir(_ path:String)throws {try fm.createDirectory(atPath:path,withIntermediateDirectories:true,attributes:[.posixPermissions:0o700]);try fm.setAttributes([.posixPermissions:0o700],ofItemAtPath:path)}
for path in [native.supportRoot,native.dataRoot,native.cacheRoot] {try mkdir(path)}
try FixtureLoader.prepare(native)
precondition(fm.fileExists(atPath:native.controlRoot) && fm.fileExists(atPath:native.taskRoot))
let synthetic=Data("synthetic-preserved-state".utf8)
try synthetic.write(to:URL(fileURLWithPath:native.controlRoot+"/record.fixture"))
try FixtureLoader.prepare(native)
let preserved=try Data(contentsOf:URL(fileURLWithPath:native.controlRoot+"/record.fixture"));precondition(preserved==synthetic)
try fm.removeItem(atPath:native.taskRoot)
precondition(rejects{try FixtureLoader.prepare(native)});precondition(!fm.fileExists(atPath:native.taskRoot))
try fm.removeItem(atPath:native.controlRoot)
try synthetic.write(to:URL(fileURLWithPath:native.dataRoot+"/legacy.fixture"))
precondition(rejects{try FixtureLoader.prepare(native)})
precondition(!fm.fileExists(atPath:native.controlRoot) && !fm.fileExists(atPath:native.taskRoot))
try fm.removeItem(atPath:native.dataRoot+"/legacy.fixture")
try synthetic.write(to:URL(fileURLWithPath:native.cacheRoot+"/legacy.fixture"))
precondition(rejects{try FixtureLoader.prepare(native)})
precondition(!fm.fileExists(atPath:native.controlRoot) && !fm.fileExists(atPath:native.taskRoot))
print("PASS: synthetic fixed suffix/v9 fields; actual v8 decode; empty control creation; existing/partial/unknown data-cache preservation")
'''
with tempfile.TemporaryDirectory(prefix='aux-user-location-compile-') as t:
 t=Path(t)
 for f in plan['files']:(t/Path(f['path']).name).write_bytes(Path(f['path']).read_bytes())
 subprocess.run(['git','apply','--check',str(P/'source.patch')],cwd=t,check=True)
 subprocess.run(['git','apply',str(P/'source.patch')],cwd=t,check=True)
 for f in plan['files']:assert sha((t/Path(f['path']).name).read_bytes())==f['outputSha256']
 q=subprocess.run(['/usr/bin/swiftc','-typecheck','-D','AUX_BROWSER_ONLY_NATIVE_STARTUP',str(P/'source/AuxFreshBootstrapPolicy.swift'),str(parent),str(strict)],capture_output=True,text=True)
 if q.returncode: print(q.stderr);q.check_returncode()
 harness=policy+'\n'+strictText+'\n'+helpers+'\n'+fixtureDecode+main
 source=t/'fixture.swift';source.write_text(harness);exe=t/'fixture'
 q=subprocess.run(['/usr/bin/swiftc','-D','AUX_BROWSER_ONLY_NATIVE_STARTUP',str(source),'-o',str(exe)],capture_output=True,text=True)
 if q.returncode: print(q.stderr);q.check_returncode()
 ran=subprocess.run([str(exe)],capture_output=True,text=True)
 if ran.returncode: print(ran.stderr);ran.check_returncode()
 print(ran.stdout.strip())
 (P/'focused-check.json').write_text(json.dumps(dict(format='aux.native-current-user-location.focused-check.v1',sourcePlanSha256=sha((P/'source-plan.json').read_bytes()),harnessSha256=sha(harness.encode()),strictJsonSourceSha256=sha(strict.read_bytes()),countedAnchors=sum(len(f['anchors']) for f in plan['files']),policyAndParentTypecheck=True,independentPatchApplication=True,result=ran.stdout.strip(),fixtureAdapter='Only native getpwuid_r capture in extracted v9 decoder branch replaced with synthetic captured home; actual product capture unexecuted. Filesystem owner extracted unchanged.',realUserHomeQueried=False,ownerDataAccessed=False,signaturesExecuted=False,browserOrDaemonLaunched=False),indent=2)+'\n')
