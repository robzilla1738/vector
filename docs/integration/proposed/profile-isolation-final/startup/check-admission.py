#!/usr/bin/env python3
"""Actual fresh admission algorithm with refusal-only synthetic policy double; not Security acceptance."""
import pathlib,subprocess,tempfile,json,hashlib
here=pathlib.Path(__file__).resolve().parent
source=here/'source/AuxBrowserFreshRootAdmission.swift'
stubs='''import Foundation
import Darwin
enum AuxFreshColdGuardError:Error{case path,metadata,installerBusy,io(Int32),wrongProcess}
enum AuxFreshColdBootstrapError:Error{case legacyOrUnknownExistingState}
struct AuxFreshBootstrapPolicyContents{let browserStartupRoots:[String]?}
final class AuxAuthenticatedFreshBootstrapPolicy {
 let contents:AuxFreshBootstrapPolicyContents;let policySha256=String(repeating:"1",count:64)
 init(_ roots:[String]){contents = .init(browserStartupRoots:roots)}
 func revalidateCurrentIdentity()throws{} // Explicit synthetic double; never a signed grant.
}
'''
fixture='''
func expect(_ b:Bool,_ m:String){precondition(b,m)}
var template=Array("/private/tmp/aux-browser-admission-fixture-XXXXXX".utf8CString)
guard let allocated=mkdtemp(&template)else{fatalError("mkdtemp")}
let base=String(cString:allocated)
defer{try? FileManager.default.removeItem(atPath:base)}
func directory(_ suffix:String)throws->(String,Int32){let p=base+"/"+suffix;guard mkdir(p,0o700)==0 else{throw AuxFreshColdGuardError.io(errno)};let fd=open(p,O_RDONLY|O_DIRECTORY|O_CLOEXEC);guard fd>=0 else{throw AuxFreshColdGuardError.io(errno)};return(p,fd)}
let (d,df)=try directory("data"),(c,cf)=try directory("cache")
defer{close(df);close(cf)}
let policy=AuxAuthenticatedFreshBootstrapPolicy([d,c])
let lease=try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:7,data:df,cache:cf)
expect(try lease.receipt().count==72,"fixed receipt")
try lease.revalidate()
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:7,data:df,cache:cf);fatalError("existing marker adopted")}catch{}
let (d2,df2)=try directory("other-data"),(c2,cf2)=try directory("other-cache")
defer{close(df2);close(cf2)}
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:policy,generation:7,data:df2,cache:cf2);fatalError("path mismatch accepted")}catch{}
try Data("existing".utf8).write(to:URL(fileURLWithPath:d2+"/Local State"))
do{_ = try AuxBrowserFreshRootAdmission.acquire(policy:AuxAuthenticatedFreshBootstrapPolicy([d2,c2]),generation:8,data:df2,cache:cf2);fatalError("nonempty root adopted")}catch{}
expect(!FileManager.default.fileExists(atPath:c2+"/.aux-browser-startup-lease.v1"),"second marker untouched on preflight failure")
try Data("changed".utf8).write(to:URL(fileURLWithPath:d+"/.aux-browser-startup-lease.v1"))
do{try lease.revalidate();fatalError("marker mutation accepted")}catch{}
print("PASS: empty-pair admission, fixed receipt, existing-marker/path/nonempty rejection and mutation refusal; synthetic policy only")
'''
pin=hashlib.sha256(source.read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='aux-browser-admission-compile-') as d:
 p=pathlib.Path(d)/'main.swift';p.write_text(stubs+'\n'+source.read_text()+'\n'+fixture)
 run=subprocess.run(['/usr/bin/xcrun','swift',str(p)],capture_output=True,text=True)
 receipt={'passed':run.returncode==0,'exitCode':run.returncode,'stdout':run.stdout,'stderr':run.stderr,'sourceSha256':pin,'liveSecurity':False,'realBrowserRootAccess':False,'syntheticPolicyDouble':True}
 (here/'evidence/admission-fixture.json').write_text(json.dumps(receipt,indent=2)+'\n')
 print(json.dumps(receipt));raise SystemExit(run.returncode)
