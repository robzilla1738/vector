#!/usr/bin/env python3
"""Actual authority implementation; synthetic native owner callbacks, no protected IO."""
from pathlib import Path
import tempfile,subprocess,json,hashlib
here=Path(__file__).resolve().parent
source=here/'source/AuxPreparedDaemonAuthority.swift'
parser=here.parents[4]/'docs/integration/proposed/aux-native-parent-strict-json/source/chrome/browser/aux/native_peer_policy/AuxStrictEnvelopeObject.swift'
stubs='''import Foundation
import Darwin
final class AuxOwnedCommandDispatcher {let handle:UInt64;init(_ handle:UInt64){self.handle=handle}}
final class AuxCommandDispatcherRegistry {
 static let shared=AuxCommandDispatcherRegistry()
 var closed=Set<UInt64>();var callback:(()->Void)?;var fail=false
 func browserStartupReceipt(_ h:UInt64)throws->Data {callback?();if fail{throw NSError(domain:"synthetic",code:1)};return Data(repeating:1,count:72)}
 func closeBrowserAdmission(_ h:UInt64)->Int32{closed.insert(h);return 1}
}
var retired=Set<UInt64>()
func AuxReleasePreparedFreshRuntimeProvider(_ id:UInt64){}
func AuxRetainPreparedFreshRuntimeProvider(_ id:UInt64)->Int32{0}
func AuxCreatePreparedFreshRuntimeOwner(_ id:UInt64,_ handle:UnsafeMutablePointer<UInt64>,_ retained:UnsafeMutablePointer<UnsafeMutableRawPointer?>)->Int32{handle.pointee=id;retained.pointee=Unmanaged.passRetained(AuxOwnedCommandDispatcher(id)).toOpaque();return 0}
func auxNativeContextRun(_ h:UInt64,_ c:UnsafePointer<UInt8>,_ n:Int,_ i:UnsafePointer<UInt8>,_ count:Int)->UnsafeMutablePointer<CChar>?{nil}
func auxNativeResultFree(_ p:UnsafeMutablePointer<CChar>){free(p)}
func auxNativeContextObserveOperationState(_ h:UInt64)->Int32{0}
func auxNativeContextValidateCurrentAuthority(_ h:UInt64)->Int32{AuxCommandDispatcherRegistry.shared.closed.contains(h) ? 3:0}
func auxNativeContextRetire(_ h:UInt64)->Int32{retired.insert(h);return 0}
'''
fixture='''
func expect(_ b:Bool,_ m:String){precondition(b,m)}
func request(_ id:UInt64)->(Int32,UInt32){var nonce=[UInt8](repeating:7,count:16),out=[UInt8](repeating:0,count:8192),n:UInt32=0;let status=AuxBeginPreparedBrowserStartup(id,1,&nonce,&out,8192,&n);return(status,n)}
let normal=AuxCreatePreparedDaemonAuthority(101)
expect(request(normal).0==0,"normal receipt")
expect(AuxClosePreparedDaemonAuthority(normal)==1,"issued grant retained")
expect(AuxCommandDispatcherRegistry.shared.closed.contains(101),"normal cancellation closes admission")
expect(!retired.contains(101),"does not retire browser owner")
expect(request(normal).0==3,"later grant refused")
let racing=AuxCreatePreparedDaemonAuthority(102)
AuxCommandDispatcherRegistry.shared.callback={expect(AuxClosePreparedDaemonAuthority(racing)==1,"in-flight close pending")}
let result=request(racing)
expect(result.0==3 && result.1==0,"raced receipt not published")
expect(AuxCommandDispatcherRegistry.shared.closed.contains(102) && !retired.contains(102),"race owner retained and closed")
AuxCommandDispatcherRegistry.shared.callback=nil;AuxCommandDispatcherRegistry.shared.fail=true
let failed=AuxCreatePreparedDaemonAuthority(103)
expect(request(failed).0==4,"failed receipt cached")
expect(AuxClosePreparedDaemonAuthority(failed)==1 && !retired.contains(103),"unknown failed attempt retained")
let unused=AuxCreatePreparedDaemonAuthority(104)
expect(AuxClosePreparedDaemonAuthority(unused)==0 && retired.contains(104),"never-attempted ordinary close unchanged")
print("PASS: grant cancellation, in-flight cancellation suppresses publication, failed attempt retains owner, unused close preserved; synthetic owner callbacks")
'''
pin=hashlib.sha256(source.read_bytes()).hexdigest()
with tempfile.TemporaryDirectory(prefix='aux-authority-cancellation-') as d:
 p=Path(d)/'main.swift';p.write_text(stubs+'\n'+parser.read_text()+'\n'+source.read_text()+'\n'+fixture)
 run=subprocess.run(['/usr/bin/xcrun','swift',str(p)],capture_output=True,text=True)
 receipt={'passed':run.returncode==0,'exitCode':run.returncode,'stdout':run.stdout,'stderr':run.stderr,'sourceSha256':pin,'syntheticNativeOwner':True,'protectedIO':False}
 (here/'evidence').mkdir(exist_ok=True);(here/'evidence/cancellation.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt));raise SystemExit(run.returncode)
