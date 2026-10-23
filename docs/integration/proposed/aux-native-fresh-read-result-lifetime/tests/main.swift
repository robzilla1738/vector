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
struct AuxInstallationCommandCore{func run(command:String,input:String="")->String{FX.commands += 1;let response="reply-"+String(FX.commands);FX.afterCommand?();return response}}
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
var assertions=0
func check(_ b:Bool){precondition(b);assertions += 1}
func make()throws->AuxOwnedCommandDispatcher{try .init(scopedTerminal:.init(nativeFreshRuntime:NativeFreshRuntimeCapturedContext()))}
func run(_ owner:AuxOwnedCommandDispatcher,_ command:String="secure-read",_ input:String="{}") -> String {
 command.utf8CString.withUnsafeBufferPointer { c in
  input.utf8CString.withUnsafeBufferPointer { i in
   let reply=auxNativeContextRun(owner.handle,UnsafeRawPointer(c.baseAddress!).assumingMemoryBound(to:UInt8.self),c.count-1,UnsafeRawPointer(i.baseAddress!).assumingMemoryBound(to:UInt8.self),i.count-1)!
   defer{auxNativeResultFree(reply)}
   return String(cString:reply)
  }
 }
}
FX.reset()
do{
 let owner=try make()
 FX.afterCommand={check(auxNativeContextObserveOperationState(owner.handle)==1);FX.guardLive=false}
 check(run(owner).contains("outcome unknown"));check(FX.commands==1)
 check(auxNativeContextObserveOperationState(owner.handle)==2) // Completed, not still running.
 check(run(owner).contains("before command"));check(FX.commands==1) // Still locked, no replay.
 FX.guardLive=true;FX.afterCommand=nil
 check(run(owner)=="reply-1");check(FX.commands==1) // Actual retained response only.
 check(auxNativeContextObserveOperationState(owner.handle)==0)
 check(run(owner)=="reply-2");check(FX.commands==2) // New explicit request after consumption.
 check(auxNativeContextRetire(owner.handle)==0)
}
FX.reset()
do{
 let owner=try make();FX.afterCommand={FX.guardLive=false}
 check(run(owner,"public-keys").contains("outcome unknown"));check(FX.commands==1)
 FX.guardLive=true;FX.afterCommand=nil
 check(run(owner,"keys-status")=="reply-2");check(FX.commands==2) // Different explicit command only.
 check(auxNativeContextRetire(owner.handle)==0)
}
FX.reset()
do{
 let owner=try make();FX.afterCommand={FX.guardLive=false}
 check(run(owner).contains("outcome unknown"));check(FX.commands==1)
 check(auxNativeContextRetire(owner.handle ) == -3) // Unavailable close retains result/owner.
 check(auxNativeContextObserveOperationState(owner.handle)==2)
 FX.guardLive=true;FX.afterCommand=nil
 FX.onGuard={
  check(auxNativeContextObserveOperationState(owner.handle)==1)
  check(auxNativeContextRetire(owner.handle ) == -2) // Actual reentrant retirement, no mutex held.
 }
 check(auxNativeContextRetire(owner.handle)==0) // Genuine read-only reconciliation at close.
 check(auxNativeContextObserveOperationState(owner.handle ) == -1)
 check(FX.commands==1)
}
FX.reset()
do{
 let owner=try make();FX.afterCommand={FX.guardLive=false}
 check(run(owner,"secure-save").contains("outcome unknown"));check(FX.commands==1)
 check(auxNativeContextObserveOperationState(owner.handle)==3)
 FX.guardLive=true;FX.afterCommand=nil
 check(run(owner,"secure-save").contains("outcome unknown"));check(FX.commands==1)
 check(auxNativeContextRetire(owner.handle ) == -3);check(auxNativeContextObserveOperationState(owner.handle)==3)
}
FX.reset()
do{
 let owner=try make();FX.afterCommand={FX.guardLive=false}
 check(run(owner).contains("outcome unknown"))
 FX.guardError=AuxFreshColdGuardError.peer(-2)
 check(run(owner).contains("before command"));check(auxNativeContextObserveOperationState(owner.handle)==4)
 FX.guardLive=true;FX.afterCommand=nil
 check(run(owner).contains("retiring"));check(FX.commands==1)
 check(auxNativeContextRetire(owner.handle ) == -3)
}
FX.reset()
do {
 let owner=try make();let handle=owner.handle
 FX.onContextDeinit={check(auxNativeContextObserveOperationState(handle ) == -1)}
 check(auxNativeContextRetire(handle)==0) // Entry destructor may reenter after registry unlock.
 FX.onContextDeinit=nil
}
FX.reset()
do {
 var owner:AuxOwnedCommandDispatcher?=try make();let handle=owner!.handle
 FX.onContextDeinit={check(auxNativeContextObserveOperationState(handle ) == -1)}
 owner=nil // Owner deinit closes/removes Entry; its context destructor can observe safely.
 FX.onContextDeinit=nil
}
print("PASS:\(assertions) actual C run/read-reconciliation/retire/lifecycle assertions; fake effects only; protected calls0")
