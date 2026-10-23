// Actual dispatcher lifecycle/guard code with explicit fake command authority,
// current-binding validator and account lock. No real guard/Security/OS calls.
import Foundation
enum FixtureError:Error{case unavailable,operation}
enum AuxFreshColdGuardError:Error{case peer(Int32),path,metadata,wrongProcess,other}
enum AuxRuntimeCaptureError:Error{case unavailable,policy,missing,invalid,changed,other}
enum NativeFreshRuntimeConsumerError:Error{case binding,busy}
enum AuxFreshBootstrapPolicyError:Error{case signature,other}
enum NativeFreshBootstrapError:Error{case binding,record,other}
enum NativeFreshTargetError:Error{case binding,other}
enum AuxAccountsCskError:Error{case unavailable}
enum FX {
 static var guardLive=true,commands=0,checks=0
 static var guardError:Error=AuxFreshColdGuardError.peer(1)
 static var afterLock:(()->Void)?
 static var afterCommand:(()->Void)?
 static var onGuard:(()->Void)?
 static var onContextDeinit:(()->Void)?
 static func reset(){guardLive=true;commands=0;checks=0;afterLock=nil;afterCommand=nil;onGuard=nil;onContextDeinit=nil;guardError=AuxFreshColdGuardError.peer(1)}
}
final class NativeFreshRuntimeCapturedContext {
 deinit{FX.onContextDeinit?()}
 func revalidateCurrentCommandBinding()throws{FX.checks += 1;let callback=FX.onGuard;FX.onGuard=nil;callback?();if !FX.guardLive{throw FX.guardError}}
}
struct AuxInstallationCommandCore{func run(command:String,input:String="")->String{FX.commands += 1
 let response:String
 switch command {
 case "cdp-sign":response="{\"signature\":\"AQID\"}"
 case "get-public-keys":response="{\"scheme\":\"p256_v1\",\"sig\":\"AQI=\",\"kem\":\"AwQ=\"}"
 case "inbox-key-v2":response="{\"key\":\""+Data(repeating:0x33,count:32).base64EncodedString()+"\"}"
 default:response="{\"error\":\"unexpected fixture command\"}"
 }
 FX.afterCommand?();return response}}
struct AuxRuntimeCapturedCommandContext{let core=AuxInstallationCommandCore()}
final class AuxSecureStoreCommandCore {
 func run(command:String,input:String)->String{FX.commands += 1;let response="reply-"+String(FX.commands);FX.afterCommand?();return response}
 func withAccountRegistryLock<T>(_ body:()throws->T)throws->T{FX.afterLock?();return try body()}
}
struct ScopedAuxCommandContext {
 let installation=AuxInstallationCommandCore()
 let secureStore=AuxSecureStoreCommandCore()
 let nativeFreshRuntime:NativeFreshRuntimeCapturedContext?
 static func nativeFresh(_ captured:NativeFreshRuntimeCapturedContext)throws->Self{.init(nativeFreshRuntime:captured)}
}
final class WeakCaptured{weak var value:NativeFreshRuntimeCapturedContext?;init(_ value:NativeFreshRuntimeCapturedContext){self.value=value}}

var providerReferences=0
func AuxRetainPreparedFreshRuntimeProvider(_ id:UInt64)->Int32{guard id==42 else{return -1};providerReferences += 1;return 0}
func AuxReleasePreparedFreshRuntimeProvider(_ id:UInt64){precondition(id==42);providerReferences -= 1}
func AuxCreatePreparedFreshRuntimeOwner(_ id:UInt64,_ handle:UnsafeMutablePointer<UInt64>?,_ retained:UnsafeMutablePointer<UnsafeMutableRawPointer?>?)->Int32 {
 guard id==42,let handle,let retained else{return -1}
 let owner=try! AuxOwnedCommandDispatcher(scopedTerminal:.init(nativeFreshRuntime:NativeFreshRuntimeCapturedContext()))
 handle.pointee=owner.handle;retained.pointee=Unmanaged.passRetained(owner).toOpaque();return 0
}
var assertions=0
func check(_ b:Bool){precondition(b);assertions += 1}
let message=Array("Aux Daemon Auth v1\0".utf8)+Array(repeating:UInt8(0x55),count:32)
func nonce(_ value:UInt8)->[UInt8]{Array(repeating:value,count:16)}
func operation(_ h:UInt64,_ seq:UInt64,_ n:UInt8,_ kind:Int,_ body:[UInt8]?=nil)->(Int32,Data) {
 let token=nonce(n);var output=Array(repeating:UInt8(0xaa),count:8192);var count:UInt32=0
 let status=token.withUnsafeBufferPointer{token in output.withUnsafeMutableBufferPointer{output->Int32 in
  switch kind {
  case 0:return (body ?? message).withUnsafeBufferPointer{AuxBeginPreparedDaemonSignature(h,seq,token.baseAddress,$0.baseAddress,output.baseAddress,8192,&count)}
  case 1:return AuxBeginPreparedDaemonPublicKeys(h,seq,token.baseAddress,output.baseAddress,8192,&count)
  case 2:return AuxBeginPreparedDaemonInboxKey(h,seq,token.baseAddress,output.baseAddress,8192,&count)
  default:return AuxObservePreparedDaemonAuthority(h,seq,token.baseAddress,output.baseAddress,8192,&count)
  }
 }}
 check(count<=8192);if status != 0{check(count==0)}
 return(status,Data(output.prefix(Int(count))))
}
func ack(_ h:UInt64,_ seq:UInt64,_ n:UInt8)->Int32{nonce(n).withUnsafeBufferPointer{AuxAckPreparedDaemonAuthority(h,seq,$0.baseAddress)}}
func create()->UInt64{let h=AuxCreatePreparedDaemonAuthority(42);check(h != 0);return h}
FX.reset()
do {
 let h=create()
 var invalid=message;invalid[0]=0
 check(operation(h,1,1,0,invalid).0 == -1);check(FX.commands==0)
 check(operation(h,1,1,0).1==Data([1,2,3]));check(FX.commands==1)
 check(operation(h,1,1,0).1==Data([1,2,3]));check(FX.commands==1) // Cached with real owner revalidation.
 check(operation(h,1,2,0).0==3);check(operation(h,1,1,1).0==3)
 check(operation(h,2,2,1).0==2) // No next request before ACK.
 check(ack(h,1,1)==0);check(ack(h,1,1)==0)
 check(operation(h,1,1,3).1==Data([1,2,3])) // Lost ACK reply remains observable.
 check(operation(h,2,2,1).0==0);check(FX.commands==2)
 check(operation(h,1,1,0).0==3);check(FX.commands==2) // High-watermark, no old replay.
 check(ack(h,2,2)==0)
 check(operation(h,3,3,2).1==Data(repeating:0x33,count:32));check(FX.commands==3)
 check(ack(h,3,3)==0);check(AuxClosePreparedDaemonAuthority(h)==0);AuxReleasePreparedDaemonAuthority(h)
 check(providerReferences==0)
}
FX.reset()
do {
 let h=create();FX.afterCommand={FX.guardLive=false}
 check(operation(h,1,7,0).0==1);check(FX.commands==1)
 check(operation(h,1,7,0).0==1);check(ack(h,1,7)==1)
 check(operation(h,2,8,1).0==2);check(operation(h,1,7,3).0==1);check(FX.commands==1)
 FX.guardLive=true;FX.afterCommand=nil
 check(operation(h,1,7,3).1==Data([1,2,3]));check(FX.commands==1)
 FX.guardLive=false
 check(operation(h,1,7,0).0==1);check(FX.commands==1) // Cached material withheld while unavailable.
 FX.guardLive=true
 check(operation(h,1,7,0).1==Data([1,2,3]));check(FX.commands==1)
 check(ack(h,1,7)==0);check(AuxClosePreparedDaemonAuthority(h)==0);AuxReleasePreparedDaemonAuthority(h)
 check(providerReferences==0)
}
FX.reset()
do {
 let h=create()
 for i in 1...70 { // Sustained auth lifetime beyond removed32-entry cap.
  check(operation(h,UInt64(i),UInt8(i),1).0==0)
  check(ack(h,UInt64(i),UInt8(i))==0)
 }
 check(FX.commands==70)
 check(operation(h,72,72,1).0==5);check(FX.commands==70) // Non-next never retires latest.
 check(operation(h,70,70,3).0==0)
 check(AuxClosePreparedDaemonAuthority(h)==0);AuxReleasePreparedDaemonAuthority(h);check(providerReferences==0)
}
FX.reset()
do {
 let h=create();FX.afterCommand={check(AuxClosePreparedDaemonAuthority(h)==1)}
 check(operation(h,1,9,0).0==3);check(FX.commands==1)
 FX.afterCommand=nil;check(AuxClosePreparedDaemonAuthority(h)==0);AuxReleasePreparedDaemonAuthority(h);check(providerReferences==0)
}
FX.reset()
do {
 let h=create();check(operation(h,1,10,2).0==0)
 FX.guardLive=false;FX.guardError=AuxFreshColdGuardError.peer(-2)
 check(operation(h,1,10,3).0==3) // Proven loss closes and wipes owned cache; no material output.
 check(AuxClosePreparedDaemonAuthority(h)==2);AuxReleasePreparedDaemonAuthority(h)
 check(providerReferences==1) // Actual unresolved owner/provider remains retained.
}
print("PASS:\(assertions) actual finite backend/dispatcher sequence ACK cached-guard recovery and lifecycle assertions; fake authority/provider effects only")
