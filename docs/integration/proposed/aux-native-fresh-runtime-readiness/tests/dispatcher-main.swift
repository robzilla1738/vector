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
 static func reset(){guardLive=true;commands=0;checks=0;afterLock=nil;guardError=AuxFreshColdGuardError.peer(1)}
}
final class NativeFreshRuntimeCapturedContext {
 func revalidateCurrentCommandBinding()throws{FX.checks += 1;if !FX.guardLive{throw FX.guardError}}
}
struct AuxInstallationCommandCore{func run(command:String,input:String="")->String{FX.commands += 1;return "{}"}}
struct AuxRuntimeCapturedCommandContext{let core=AuxInstallationCommandCore()}
final class AuxSecureStoreCommandCore {
 func run(command:String,input:String)->String{FX.commands += 1;return "{}"}
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
func make()throws->(AuxOwnedCommandDispatcher,WeakCaptured){
 let captured=NativeFreshRuntimeCapturedContext()
 return (try AuxOwnedCommandDispatcher(scopedTerminal:.init(nativeFreshRuntime:captured)),WeakCaptured(captured))
}
func failure(_ body:()throws->Void)->AuxNativeFreshGuardFailure {
 do{try body();fatalError("accepted unavailable guard")}catch let f as AuxNativeFreshGuardFailure{return f}catch{fatalError("wrong error")}
}
func retiredRefuses(_ owner:AuxOwnedCommandDispatcher){
 check(!AuxCommandDispatcherRegistry.shared.isAccepting(owner.handle))
 do{try owner.retire();fatalError("reported drained")}catch is AuxNativeFreshGuardFailure{check(true)}catch{fatalError("lost failure")}
}
FX.reset()
do {
 let (owner,weak)=try make()
 let answer=try AuxCommandDispatcherRegistry.shared.withContext(owner.handle){$0.run(command:"fixture")}
 check(answer=="{}" && FX.commands==1 && FX.checks>=2)
 try owner.retire();check(!AuxCommandDispatcherRegistry.shared.isAccepting(owner.handle))
 _=weak
}
FX.reset()
// Both actual retryable classes refuse BEFORE action without poisoning owner.
for transient:Error in [AuxFreshColdGuardError.peer(1),AuxRuntimeCaptureError.unavailable] {
 let (owner,_)=try make();FX.guardError=transient;FX.guardLive=false
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withContext(owner.handle){$0.run(command:"fixture")}}
 check(f.moment == .beforeAction && f.disposition == .retryableNoCommand && FX.commands==0)
 check(AuxCommandDispatcherRegistry.shared.isAccepting(owner.handle))
 FX.guardLive=true
 _ = try AuxCommandDispatcherRegistry.shared.withContext(owner.handle){$0.run(command:"fixture")}
 check(FX.commands==1);try owner.retire();FX.reset()
}
func beforeLostCase()throws->WeakCaptured {
 let (owner,weak)=try make();FX.guardLive=false;FX.guardError=AuxFreshColdGuardError.peer(-2)
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withContext(owner.handle){$0.run(command:"fixture")}}
 check(f.moment == .beforeAction && f.disposition == .provenBindingLoss && FX.commands==0)
 retiredRefuses(owner);return weak
}
let beforeWeak=try beforeLostCase();check(beforeWeak.value != nil)
FX.reset()
func afterCase()throws->WeakCaptured {
 let (owner,weak)=try make()
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withContext(owner.handle){core in let answer=core.run(command:"fixture");FX.guardLive=false;return answer}}
 check(f.moment == .afterAction && f.disposition == .postOutcomeUnknown && FX.commands==1)
 retiredRefuses(owner);return weak
}
let afterWeak=try afterCase();check(afterWeak.value != nil)
FX.reset()
do {
 let (owner,_)=try make()
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withContext(owner.handle){_ -> String in FX.commands += 1;FX.guardLive=false;throw FixtureError.operation}}
 check(f.moment == .afterThrownAction && f.operationError != nil && FX.commands==1)
 retiredRefuses(owner)
}
FX.reset()
do {
 let (owner,_)=try make();FX.afterLock={FX.guardLive=false}
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withAccountRegistryLock(owner.handle){FX.commands += 1;return 0}}
 check(f.moment == .beforeAccountCallback && f.disposition == .retryableNoCommand && FX.commands==0)
 check(AuxCommandDispatcherRegistry.shared.isAccepting(owner.handle))
 FX.guardLive=true;FX.afterLock=nil
 _ = try AuxCommandDispatcherRegistry.shared.withAccountRegistryLock(owner.handle){FX.commands += 1;return 0}
 check(FX.commands==1);try owner.retire()
}
FX.reset()
do {
 let (owner,_)=try make()
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withAccountRegistryLock(owner.handle){FX.commands += 1;FX.guardLive=false;return 0}}
 check(f.moment == .afterAccountCallback && FX.commands==1)
 retiredRefuses(owner)
}
FX.reset()
do {
 let (owner,_)=try make()
 let f=failure{_ = try AuxCommandDispatcherRegistry.shared.withAccountRegistryLock(owner.handle){FX.commands += 1;FX.guardLive=false;throw FixtureError.operation}}
 check(f.moment == .afterThrownAccountCallback && f.operationError != nil)
 retiredRefuses(owner)
}
print("PASS:\(assertions) actual guarded dispatcher/retirement/account-callback assertions; explicit fake authorities; protected calls0")
