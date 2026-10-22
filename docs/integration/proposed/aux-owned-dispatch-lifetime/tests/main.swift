import Foundation
import CryptoKit
import Dispatch
import Darwin
@_silgen_name("AuxLifetimeProbeRun") func cRun(_ handle:UInt64,_ command:UnsafePointer<CChar>,_ input:UnsafePointer<CChar>)->UnsafeMutablePointer<CChar>?
@_silgen_name("AuxLifetimeProbeInvalidHandle") func cInvalid()->UnsafeMutablePointer<CChar>?
@_silgen_name("AuxLifetimeProbeRetire") func cRetire(_ handle:UInt64)->Int32
@_silgen_name("AuxLifetimeProbeFree") func cFree(_ result:UnsafeMutablePointer<CChar>?)
var checks=0
func check(_ ok:Bool){precondition(ok);checks += 1}
func json(_ pointer:UnsafeMutablePointer<CChar>?)->[String:Any] {
    precondition(pointer != nil);defer{cFree(pointer)}
    return try! JSONSerialization.jsonObject(with:Data(String(cString:pointer!).utf8)) as! [String:Any]
}
func run(_ handle:UInt64,_ command:String,_ input:String="")->[String:Any] {
    command.withCString{command in input.withCString{input in json(cRun(handle,command,input))}}
}
func capturedContext(_ byte:UInt8)throws->CapturedTerminalCommandContext {
    var raw=Data(repeating:0,count:32);raw[31]=byte
    let signer=try P256.Signing.PrivateKey(rawRepresentation:raw)
    raw[31]=byte+1;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:raw)
    let root=Data(repeating:byte,count:32)
    let candidate=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(.init(kind:.softwareP256,root:root,signingPrivateRepresentation:signer.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signer.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation))
    func captures(_ values:[String:Data])->CallerCapturedFreshTargets {
        func row(_ name:String)->CallerCapturedFreshRead { values[name].map{.bytes($0)} ?? .absent }
        return .init(metadata:row("metadata"),signing:row("signing"),kem:row("kem"),wrappedRoot:row("wrappedRoot"))
    }
    let scope=String(repeating:"e",count:64),absent=captures([:])
    let review=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
    let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".v2",account:"aux."+scope+".v2."+$0,accessGroup:"TEST.aux.synthetic"))}
    var j=try FreshInstallationTransaction.prepare(candidate:candidate,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:absent)
    var values=[String:Data]()
    for role in freshRoles {
        j=try FreshInstallationTransaction.intendNext(j,checkpoint:j.checkpoint(),captured:captures(values))
        let request=try FreshInstallationTransaction.addRequest(j,checkpoint:j.checkpoint(),candidate:candidate,captured:captures(values))
        values[role]=request.payload
        j=try FreshInstallationTransaction.recordAdd(j,checkpoint:j.checkpoint(),status:.added)
        j=try FreshInstallationTransaction.readback(j,checkpoint:j.checkpoint(),captured:captures(values))
    }
    return try .fresh(checkpoint:.init(journal:j,sha256:j.checkpoint().journalSha256),candidate:candidate,targets:captures(values))
}
let contextA=try capturedContext(15),contextB=try capturedContext(19)
let a=try AuxOwnedCommandDispatcher(capturedTerminal:contextA),b=try AuxOwnedCommandDispatcher(capturedTerminal:contextB)
let rootA=Data(repeating:15,count:32).base64EncodedString(),rootB=Data(repeating:19,count:32).base64EncodedString()
check(run(a.handle,"dk-unwrap")["dk"] as? String==rootA)
check(run(b.handle,"dk-unwrap")["dk"] as? String==rootB)
check(json(cInvalid())["error"] as? String=="Invalid dispatcher handle")
check(run(UInt64.max,"dk-unwrap")["error"] as? String=="Invalid dispatcher handle")
check(cRetire(0)==(-1))
let malformed:[UInt8]=[0xff]
let invalidUTF8=malformed.withUnsafeBufferPointer{auxNativeContextRun(a.handle,$0.baseAddress,1,nil,0)}
check(json(invalidUTF8)["error"] as? String=="Invalid native command input")
check(json(auxNativeContextRun(a.handle,nil,-1,nil,0))["error"] as? String=="Invalid native command input")
cFree(nil)
let registry=AuxCommandDispatcherRegistry.shared
try registry.withContext(b.handle){_ in
    check(cRetire(b.handle)==(-2))
    do{_ = try registry.withContext(b.handle){$0.run(command:"install-status")};fatalError("reentrant call accepted")}
    catch AuxDispatcherLifetimeError.reentrantCall{checks += 1}
}
check(registry.isAccepting(b.handle))
let entered=DispatchSemaphore(value:0),release=DispatchSemaphore(value:0),operationDone=DispatchSemaphore(value:0),retired=DispatchSemaphore(value:0)
final class ResultBox {
    private let lock=NSLock();private var text:String?
    func set(_ value:String){lock.lock();text=value;lock.unlock()}
    func get()->String?{lock.lock();defer{lock.unlock()};return text}
}
let result=ResultBox()
DispatchQueue.global().async {
    do{try registry.withContext(a.handle){core in entered.signal();precondition(release.wait(timeout:.now()+5) == .success);result.set(core.run(command:"dk-unwrap"))}}
    catch{result.set("unexpected lifetime failure")}
    operationDone.signal()
}
precondition(entered.wait(timeout:.now()+5) == .success)
DispatchQueue.global().async{precondition(cRetire(a.handle)==0);retired.signal()}
let deadline=Date().addingTimeInterval(5)
while registry.isAccepting(a.handle) && Date()<deadline {usleep(1000)}
check(!registry.isAccepting(a.handle))
check(retired.wait(timeout:.now()) == .timedOut)
check(run(a.handle,"dk-unwrap")["error"] as? String=="Dispatcher is retiring")
check(run(b.handle,"dk-unwrap")["dk"] as? String==rootB)
release.signal()
precondition(operationDone.wait(timeout:.now()+5) == .success)
precondition(retired.wait(timeout:.now()+5) == .success)
let heldReply=try JSONSerialization.jsonObject(with:Data(result.get()!.utf8)) as! [String:Any]
check(heldReply["dk"] as? String==rootA)
check(run(a.handle,"dk-unwrap")["error"] as? String=="Invalid dispatcher handle")
check(cRetire(a.handle)==(-1))
let successor=try AuxOwnedCommandDispatcher(capturedTerminal:contextB)
check(successor.handle>a.handle && successor.handle>b.handle)
check(run(a.handle,"dk-unwrap")["error"] as? String=="Invalid dispatcher handle")
// Owner destruction from inside its own lease closes new calls without waiting
// on itself or retaining an orphan open authority. Last release retires it.
var temporary:AuxOwnedCommandDispatcher?=try .init(capturedTerminal:contextA)
let temporaryHandle=temporary!.handle
try registry.withContext(temporaryHandle){core in
    temporary=nil
    check(!registry.isAccepting(temporaryHandle))
    check(run(temporaryHandle,"dk-unwrap")["error"] != nil)
    let output=try JSONSerialization.jsonObject(with:Data(core.run(command:"dk-unwrap").utf8)) as! [String:Any]
    check(output["dk"] as? String==rootA)
}
check(run(temporaryHandle,"dk-unwrap")["error"] as? String=="Invalid dispatcher handle")
check(cRetire(b.handle)==0 && cRetire(successor.handle)==0)
print("\(checks) owned C ABI/lifetime checks passed; synthetic software contexts only; no Security, host admission or NAPI activation")
