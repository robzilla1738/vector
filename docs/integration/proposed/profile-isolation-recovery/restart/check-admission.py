#!/usr/bin/env python3
"""Actual fresh admission algorithm with refusal-only synthetic policy double; not Security acceptance."""
import pathlib,subprocess,tempfile,json,hashlib
here=pathlib.Path(__file__).resolve().parent
source=here/'source/AuxBrowserFreshRootAdmission.swift'
stubs='''import Foundation
import Darwin
enum AuxFreshColdGuardError:Error{case path,metadata,installerBusy,io(Int32),wrongProcess}
enum AuxFreshColdBootstrapError:Error{case legacyOrUnknownExistingState}
struct AuxFreshBootstrapPolicyContents{let browserStartupRoots:[String]?;let browserPreparedRecovery=true}
final class AuxAuthenticatedFreshBootstrapPolicy {
 let contents:AuxFreshBootstrapPolicyContents;let policySha256=String(repeating:"1",count:64)
 init(_ roots:[String]){contents = .init(browserStartupRoots:roots)}
 func revalidateCurrentIdentity()throws{} // Explicit synthetic double; never a signed grant.
}
'''
fixture='''
func expect(_ b:Bool,_ m:String){precondition(b,m)}
var template=Array("/private/tmp/aux-browser-recovery-fixture-XXXXXX".utf8CString)
guard let allocated=mkdtemp(&template)else{fatalError("mkdtemp")}
let base=String(cString:allocated)
defer{try? FileManager.default.removeItem(atPath:base)}
func directory(_ suffix:String)throws->(String,Int32){let p=base+"/"+suffix;guard mkdir(p,0o700)==0 else{throw AuxFreshColdGuardError.io(errno)};let fd=open(p,O_RDONLY|O_DIRECTORY|O_CLOEXEC);guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};return(p,fd)}
let (d,df)=try directory("data"),(c,cf)=try directory("cache")
defer{close(df);close(cf)}
let policy=AuxAuthenticatedFreshBootstrapPolicy([d,c])
var lease:AuxBrowserFreshRootAdmission?=try .acquire(policy:policy,generation:7,data:df,cache:cf)
try lease!.revalidate()
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:8,data:df,cache:cf);fatalError("live lock bypassed")}catch{}
lease=nil // Simulates pre-grant interruption only; no browser grant was published.
lease=try .acquire(policy:policy,generation:8,data:df,cache:cf)
let receipt=try lease!.receipt();expect(receipt.count==72 && receipt.first==8,"current-generation receipt")
expect(try lease!.receipt()==receipt,"same-owner repeated receipt")
lease=nil
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:9,data:df,cache:cf);fatalError("admitted session reopened without drain")}catch{}
let (x,xf)=try directory("other-data"),(y,yf)=try directory("other-cache")
defer{close(xf);close(yf)}
let other=AuxAuthenticatedFreshBootstrapPolicy([x,y])
var interrupted:AuxBrowserFreshRootAdmission?=try .acquire(policy:other,generation:7,data:xf,cache:yf)
try interrupted!.revalidate();interrupted=nil
try Data("unexpected profile data".utf8).write(to:URL(fileURLWithPath:x+"/Local State"))
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:other,generation:8,data:xf,cache:yf);fatalError("nonempty recovery admitted")}catch{}
try FileManager.default.removeItem(atPath:x+"/Local State") // Synthetic fixture file only.
let marker="/.aux-browser-startup-lease.v2"
try Data("partial".utf8).write(to:URL(fileURLWithPath:y+marker))
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:other,generation:8,data:xf,cache:yf);fatalError("partial marker admitted")}catch{}
print("PASS: live exclusion, interrupted prepared-pair recovery/current generation, idempotent same-owner grant, admitted/nonempty/partial refusal; synthetic policy only")
'''
pin=hashlib.sha256(source.read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='aux-browser-admission-compile-') as d:
 p=pathlib.Path(d)/'main.swift';p.write_text(stubs+'\n'+(here.parents[4]/'docs/integration/proposed/aux-native-parent-strict-json/source/chrome/browser/aux/native_peer_policy/AuxStrictEnvelopeObject.swift').read_text()+'\n'+source.read_text()+'\n'+fixture)
 run=subprocess.run(['/usr/bin/xcrun','swift',str(p)],capture_output=True,text=True)
 receipt={'passed':run.returncode==0,'exitCode':run.returncode,'stdout':run.stdout,'stderr':run.stderr,'sourceSha256':pin,'liveSecurity':False,'realBrowserRootAccess':False,'syntheticPolicyDouble':True}
 (here/'evidence/admission-fixture.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps(receipt));raise SystemExit(run.returncode)
