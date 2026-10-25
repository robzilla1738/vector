from pathlib import Path
import hashlib,json,subprocess,tempfile
P=Path(__file__).resolve().parent
SOURCE=Path('/Users/rcourson/Documents/Vibe/web/docs/integration/proposed/browser-feature-expansion/fresh-startup-milestone-a42/ordinary-storage-source/AuxBrowserFreshRootAdmission.swift')
sha=lambda b:hashlib.sha256(b).hexdigest()
b=SOURCE.read_bytes();assert sha(b)=='244c9d61dd1cf36610bc616cfd772d03c5fc313063613b6950c2b6a8f9fdde5f'
s=b.decode();prefix='''            try metadata(fd,directory:true);try pathIdentity(paths[i],fd);try noSupervisedMarker(fd)
            var st=stat();let status=fstatat(fd,marker,&st,AT_SYMLINK_NOFOLLOW)
            guard status==0 || errno==ENOENT else{throw AuxFreshColdGuardError.io(errno)};existing.append(status==0)
        }
'''
old=prefix+'''        guard existing[0]==existing[1] else{throw AuxFreshColdGuardError.path}
        let reopening=existing[0]
        for root in roots {
'''
new=prefix+'''        guard existing[0]==existing[1] else{throw AuxFreshColdGuardError.path}
        let reopening=existing[0]
        if !reopening {
            // Refusing an unknown/legacy root must not first create a marker
            // inside it. Check both real retained roots before changing either;
            // the existing post-lock inventory still checks again for races.
            for root in roots{try inventory(root,allowed:[".",".."])}
        }
        for root in roots {
'''
assert s.count(old)==1;updated=s.replace(old,new)
(P/'AuxBrowserFreshRootAdmission.swift').write_text(updated)
plan=dict(format='aux.ordinary-legacy-refusal-no-mutation.v1',files=[dict(path=str(SOURCE),inputSha256=sha(b),outputSha256=sha(updated.encode()),source=str(P/'AuxBrowserFreshRootAdmission.swift'),anchors=[dict(find=old,replace=new,count=1)])],nativeExecuted=False,signatureOrPolicyChecksChanged=False,existingStateAdopted=False)
(P/'source-plan.json').write_text(json.dumps(plan,indent=2)+'\n')
def func(text,name):
 a=text.index('    private static func '+name+'(');z=text.find('\n    private static func ',a+1)
 if z<0:z=text.index('\n    deinit',a)
 return text[a:z]+'\n'
def harness(source):
 start=source.index('        guard existing[0]==existing[1]',source.index('private static func acquireOrdinary'))
 end=source.index('        let installation=try ordinaryInstallation(policy)',start)
 snippet=source[start:end]
 # Exact actual fresh-branch inventory, after marker creation/locking; policy
 # hashing and signature/peer lifecycle are outside this filesystem fixture.
 post='            for root in roots{try inventory(root,allowed:[".","..",marker])}'
 assert source[source.index('private static func acquireOrdinary'):].count(post)==1
 head='''import Foundation
import Darwin
enum AuxFreshColdGuardError: Error { case io(Int32),metadata,path,installerBusy }
enum AuxFreshColdBootstrapError: Error {case legacyOrUnknownExistingState}
enum Harness {
 static let marker=".aux-browser-ordinary-lease.v1"
 static func prepare(_ roots:[Int32],existing:[Bool])throws {
  var markers=[Int32]();defer {for fd in markers{close(fd)}}
'''
 return head+snippet+'        if !reopening {\n'+post+'\n        }\n }\n'+func(source,'metadata')+func(source,'entry')+func(source,'inventory')+'}\n'+SWIFT
SWIFT='''
let fm=FileManager.default
let root="/private/tmp/aux-legacy-refusal-fixture-"+UUID().uuidString.lowercased()
try fm.createDirectory(atPath:root,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer {try? fm.removeItem(atPath:root)}
let data=root+"/data",cache=root+"/cache"
for p in [data,cache] {try fm.createDirectory(atPath:p,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])}
let paths=[data,cache]
func run(_ existing:[Bool])->Bool {
 var fds=[Int32]();defer {for fd in fds{close(fd)}}
 for p in paths {let fd=open(p,O_RDONLY|O_DIRECTORY|O_NOFOLLOW|O_CLOEXEC);precondition(fd>=0);fds.append(fd)}
 do {try Harness.prepare(fds,existing:existing);return true}catch{return false}
}
func markers()->[Bool] {paths.map{fm.fileExists(atPath:$0+"/"+Harness.marker)}}
func clear()throws {for p in paths {for name in try fm.contentsOfDirectory(atPath:p){try fm.removeItem(atPath:p+"/"+name)}}}
let sentinel=Data("synthetic-preserved-legacy".utf8)
try sentinel.write(to:URL(fileURLWithPath:data+"/legacy.fixture"));try fm.setAttributes([.posixPermissions:0o600],ofItemAtPath:data+"/legacy.fixture")
precondition(!run([false,false]));let dataRead=try Data(contentsOf:URL(fileURLWithPath:data+"/legacy.fixture"));precondition(dataRead==sentinel)
let baseline=CommandLine.arguments.contains("baseline")
precondition(markers()==(baseline ? [true,true]:[false,false]))
if baseline {print("BASELINE CONFIRMED: refused legacy root still has two new markers; sentinel unchanged")}
else {
 try clear()
 try sentinel.write(to:URL(fileURLWithPath:cache+"/legacy.fixture"))
 precondition(!run([false,false]));precondition(markers()==[false,false]);let cacheRead=try Data(contentsOf:URL(fileURLWithPath:cache+"/legacy.fixture"));precondition(cacheRead==sentinel)
 try clear();precondition(run([false,false]));precondition(markers()==[true,true])
 try clear();try Data().write(to:URL(fileURLWithPath:data+"/"+Harness.marker));try fm.setAttributes([.posixPermissions:0o600],ofItemAtPath:data+"/"+Harness.marker)
 precondition(!run([true,false]));precondition(markers()==[true,false])
 print("PATCHED PASS: data/cache legacy refusal adds no marker; empty roots prepare; partial pair unchanged")
}
'''
with tempfile.TemporaryDirectory(prefix='aux-legacy-refusal-check-') as t:
 t=Path(t);results={}
 for label,text in [('baseline',s),('patched',updated)]:
  code=harness(text);source=t/(label+'.swift');source.write_text(code);exe=t/label
  compiled=subprocess.run(['/usr/bin/swiftc',str(source),'-o',str(exe)],capture_output=True,text=True)
  if compiled.returncode: print(compiled.stderr);compiled.check_returncode()
  q=subprocess.run([str(exe)]+(['baseline'] if label=='baseline' else []),check=True,capture_output=True,text=True)
  results[label]=dict(harnessSha256=sha(code.encode()),result=q.stdout.strip(),actualNativePreparationAndInventoryExtracted=True)
  print(q.stdout.strip())
(P/'focused-check.json').write_text(json.dumps(dict(format='aux.ordinary-legacy-refusal.fixture.v1',sourcePlanSha256=sha((P/'source-plan.json').read_bytes()),results=results,syntheticDirectoriesOnly=True,ownerDataAccessed=False,browserLaunched=False,nativeDaemonExecuted=False,policySignatureOrPeerProven=False),indent=2)+'\n')
