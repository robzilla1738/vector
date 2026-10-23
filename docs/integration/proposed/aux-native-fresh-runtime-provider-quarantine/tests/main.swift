// Explicit fake terminal/crypto/OS graph. Only the actual provider registry and
// its mutable creation/close/quarantine transitions are under test.
import Foundation
import Darwin

enum FakeFailure:Error{case invalid}
enum AuxDispatcherLifetimeError:Error{case invalidHandle,reentrantRetirement,retiring}
final class FakeNativeContext{}
struct NativeFreshTerminalSelection{let context:FakeNativeContext}
enum Effects {
    static var capture:(()->Void)?
    static var scoped:(()->Void)?
    static var owner:(()->Void)?
    static var revalidate:(()throws->Void)?
    static var retire:(()->Void)?
    static var retireError:Error?
    static var retireCalls=0
    static func clear(){capture=nil;scoped=nil;owner=nil;revalidate=nil;retire=nil;retireError=nil;retireCalls=0}
}
final class NativeFreshRuntimeCapturedContext {
    let terminal:NativeFreshTerminalSelection
    init(_ terminal:NativeFreshTerminalSelection){self.terminal=terminal}
    static func capture(_ terminal:NativeFreshTerminalSelection)throws->NativeFreshRuntimeCapturedContext{Effects.capture?();return .init(terminal)}
    func revalidate()throws{try Effects.revalidate?()}
}
struct ScopedAuxCommandContext {
    let captured:NativeFreshRuntimeCapturedContext
    static func nativeFresh(_ captured:NativeFreshRuntimeCapturedContext)throws->Self{Effects.scoped?();return .init(captured:captured)}
}
struct AuxOSJobCustody{}
struct AuxAppKitUtilityBoundary{init(custody:AuxOSJobCustody){}}
struct AuxMacOSUtilityCommandCore{init(boundary:AuxAppKitUtilityBoundary){}}
final class AuxOwnedCommandDispatcher {
    static var next:UInt64=1
    let handle:UInt64
    let context:FakeNativeContext
    init(scopedTerminal:ScopedAuxCommandContext,macOSUtilities:AuxMacOSUtilityCommandCore)throws{
        context=scopedTerminal.captured.terminal.context;handle=Self.next;Self.next += 1;Effects.owner?()
    }
    func retire()throws{Effects.retireCalls += 1;Effects.retire?();if let error=Effects.retireError{throw error}}
}
final class WeakContext{weak var value:FakeNativeContext?;init(_ value:FakeNativeContext){self.value=value}}
func prepare()throws->(AuxPreparedFreshRuntimeProvider,WeakContext){
    let context=FakeNativeContext(),weak=WeakContext(context)
    return (try .prepare(terminal:.init(context:context)),weak)
}
var checks=0
func check(_ condition:Bool){precondition(condition);checks += 1}
func refused(_ provider:AuxPreparedFreshRuntimeProvider){
    var handle:UInt64=99;var pointer:UnsafeMutableRawPointer?
    check(AuxCreatePreparedFreshRuntimeOwner(provider.nativeHandle,&handle,&pointer) != 0)
    check(handle==0 && pointer==nil)
}
Effects.clear()
var unknownHandle:UInt64=99;var unknownPointer:UnsafeMutableRawPointer?
check(AuxCreatePreparedFreshRuntimeOwner(UInt64.max,&unknownHandle,&unknownPointer) != 0)
check(unknownHandle==0 && unknownPointer==nil)
check(AuxRetainPreparedFreshRuntimeProvider(UInt64.max) != 0)
for phase in ["capture","scoped","owner","revalidate"]{
    Effects.clear()
    var pair: (AuxPreparedFreshRuntimeProvider,WeakContext)?=try prepare()
    let weak=pair!.1
    let close={check(pair!.0.closeCreationAdmission()==1)}
    switch phase{case "capture":Effects.capture=close;case "scoped":Effects.scoped=close;case "owner":Effects.owner=close;default:Effects.revalidate={close()}}
    refused(pair!.0)
    check(Effects.retireCalls==1)
    check(pair!.0.closeCreationAdmission()==0)
    check(AuxRetainPreparedFreshRuntimeProvider(pair!.0.nativeHandle) != 0)
    Effects.clear();pair=nil
    check(weak.value==nil)
}
// A validation failure after construction must not publish a nonnil owner.
Effects.clear()
var invalidPair:(AuxPreparedFreshRuntimeProvider,WeakContext)?=try prepare()
Effects.revalidate={throw FakeFailure.invalid}
refused(invalidPair!.0);check(Effects.retireCalls==1)
check(invalidPair!.0.closeCreationAdmission()==0)
Effects.clear();let invalidWeak=invalidPair!.1;invalidPair=nil;check(invalidWeak.value==nil)
for failure in [AuxDispatcherLifetimeError.reentrantRetirement as Error,AuxDispatcherLifetimeError.retiring as Error,FakeFailure.invalid as Error]{
    Effects.clear()
    var pair:(AuxPreparedFreshRuntimeProvider,WeakContext)?=try prepare()
    let id=pair!.0.nativeHandle,weak=pair!.1
    Effects.capture={check(AuxClosePreparedFreshRuntimeCreation(id)==1)}
    Effects.retire={check(AuxClosePreparedFreshRuntimeCreation(id)==1)}
    Effects.retireError=failure
    refused(pair!.0)
    check(AuxClosePreparedFreshRuntimeCreation(id)==2)
    check(Effects.retireCalls==1)
    Effects.clear();pair=nil
    check(weak.value != nil) // actual quarantine owns exact context after last reference
    check(AuxClosePreparedFreshRuntimeCreation(id)==2)
    check(AuxRetainPreparedFreshRuntimeProvider(id) != 0)
}
// Exact invalidHandle is the existing dispatcher's already-gone observation.
Effects.clear()
var gone:(AuxPreparedFreshRuntimeProvider,WeakContext)?=try prepare();let goneId=gone!.0.nativeHandle
Effects.capture={check(AuxClosePreparedFreshRuntimeCreation(goneId)==1)}
Effects.retireError=AuxDispatcherLifetimeError.invalidHandle
refused(gone!.0);check(AuxClosePreparedFreshRuntimeCreation(goneId)==0)
Effects.clear();let goneWeak=gone!.1;gone=nil;check(goneWeak.value==nil)
print("PASS:\(checks) actual provider creation/close/late-retirement registry checks; explicit fake identity/crypto/OS graph; no protected effects")
