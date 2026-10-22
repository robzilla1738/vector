import Foundation
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
let binding=try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"aux.csk_7",suffixVersion:.auxLogicalLabelsMappedInsideAux)
let payload=Data([1,0,255])
final class Boundary:AuxCopyOnlyCredentialBoundary {
 let queue=DispatchQueue(label:"aux.captured.reentry")
 var callback:(()->Void)?;var target:CapturedAuxCredentialRow = .missing;var adds=0
 let point:Int
 init(_ point:Int){self.point=point}
 func invoke(_ point:Int){if self.point==point{queue.sync{callback?()}}}
 func readSource(_ selector:AuxSecureStoreSelector)->CapturedAuxCredentialRow{invoke(0);return .bytes(payload)}
 func readTarget(_ selector:AuxSecureStoreSelector)->CapturedAuxCredentialRow{invoke(1);return target}
 func addTarget(_ selector:AuxSecureStoreSelector,bytes:Data)throws->CapturedAuxCredentialAddStatus{invoke(2);adds += 1;target = .bytes(bytes);return .added}
}
for point in 0...2 {
 let prepared=try PreparedCapturedAuxCredentialCopy.prepare(binding:binding,source:.bytes(payload),target:.missing)
 let draft=try CapturedCredentialCopyCheckpoint(capturedCanonicalBytes:prepared.checkpointBytes())
 let intent=try prepared.prepareIntent(afterDraft:draft)
 let ack=try CapturedCredentialCopyCheckpoint(capturedCanonicalBytes:intent.canonicalBytes())
 let boundary=Boundary(point)
 boundary.callback={
   if case .refused=prepared.reconcile(source:.missing,target:.missing){checks += 1}else{preconditionFailure("in-flight reconciliation changed phase")}
   check((try! prepared.checkpointBytes()) == (try! intent.canonicalBytes()))
 }
 if case .verified=try prepared.attemptAdd(afterIntent:ack,boundary:boundary){checks += 1}else{preconditionFailure("outer Add failed")}
 check(boundary.adds==1)
}
print("\(checks) cross-thread callback/reconciliation checks passed; synthetic captured bytes only")
