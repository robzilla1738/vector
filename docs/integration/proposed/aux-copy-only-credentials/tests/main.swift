import Foundation
var checks=0
func check(_ value:Bool){precondition(value);checks += 1}
func refuse(_ action:()throws->Void){do{try action();preconditionFailure("invalid copy capture accepted")}catch{checks += 1}}
func isVerified(_ value:AuxCredentialCopyOutcome)->Bool{if case .verified=value{return true};return false}
func isBlocked(_ value:AuxCredentialCopyOutcome)->Bool{if case .blocked=value{return true};return false}
func isUnresolved(_ value:AuxCredentialCopyOutcome)->Bool{if case .unresolved=value{return true};return false}
func isRefused(_ value:AuxCredentialCopyOutcome)->Bool{if case .refused=value{return true};return false}
let binding=try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"aux.csk_7",suffixVersion:.originalLogicalLabelsMappedInsideAux)
check(binding.source.service=="aux."+CapturedHistoricalAuxCredentialBinding.scope+".aside.csk_7");check(binding.source.account==binding.source.service && binding.source.accessGroup==CapturedHistoricalAuxCredentialBinding.group)
check(binding.target.service.hasPrefix("aux."+CapturedHistoricalAuxCredentialBinding.scope+".secure.v2.") && binding.target.accessGroup==binding.source.accessGroup)
let aux=try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"aux.csk_7",suffixVersion:.auxLogicalLabelsMappedInsideAux);check(aux.source.service.hasSuffix(".aux.csk_7") && aux.sha256 != binding.sha256)
let mcp=try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"mcp:7:server",suffixVersion:.originalLogicalLabelsMappedInsideAux);check(mcp.source.service.hasSuffix(".mcp:7:server"))
refuse{_ = try CapturedHistoricalAuxCredentialBinding.reviewedDisposable(logicalKey:"aux.install.meta",suffixVersion:.originalLogicalLabelsMappedInsideAux)}
let secret=Data([0xff,0,0x88,0x41]) // Opaque nonUTF8, never persisted/logged.
final class CapturedBoundary:AuxCopyOnlyCredentialBoundary {
 var source:CapturedAuxCredentialRow;var target:CapturedAuxCredentialRow = .missing;var adds=0;var throwsAfterAdd=false;var status:CapturedAuxCredentialAddStatus = .added;var reenter:(()->Void)?
 init(_ source:Data){self.source = .bytes(source)}
 func addTarget(_ target:AuxSecureStoreSelector,bytes:Data)throws->CapturedAuxCredentialAddStatus{adds += 1;reenter?();switch status{case .added:self.target = .bytes(bytes);default:break};if throwsAfterAdd{throw AuxCredentialCopyError.capture};return status}
 func readSource(_ s:AuxSecureStoreSelector)->CapturedAuxCredentialRow{source}
 func readTarget(_ s:AuxSecureStoreSelector)->CapturedAuxCredentialRow{target}
}
func prepared()->PreparedCapturedAuxCredentialCopy{try! .prepare(binding:binding,source:.bytes(secret),target:.missing)}
func intent(_ p:PreparedCapturedAuxCredentialCopy)throws->CapturedCredentialCopyCheckpoint{
 let draft=try CapturedCredentialCopyCheckpoint(capturedCanonicalBytes:p.checkpointBytes());let record=try p.prepareIntent(afterDraft:draft);let bytes=try record.canonicalBytes();check(!bytes.contains(0xff));check(String(data:bytes,encoding:.utf8) != nil);return try .init(capturedCanonicalBytes:bytes)
}
let p=prepared(),backend=CapturedBoundary(secret),ack=try intent(p)
backend.reenter={check(isRefused(try! p.attemptAdd(afterIntent:ack,boundary:backend)))}
check(isVerified(try p.attemptAdd(afterIntent:ack,boundary:backend)));check(backend.adds==1);check(isRefused(try p.attemptAdd(afterIntent:ack,boundary:backend)));check(backend.adds==1)
if case .bytes(let value)=backend.target{check(value==secret)}else{preconditionFailure()};if case .bytes(let value)=backend.source{check(value==secret)}else{preconditionFailure()}
let ready=try p.checkpointBytes();check(isVerified(p.reconcile(source:.bytes(secret),target:.bytes(secret))));check(try p.checkpointBytes()==ready)
check(isBlocked(p.reconcile(source:.bytes(secret),target:.missing)));check(isBlocked(p.reconcile(source:.bytes(secret),target:.bytes(secret))))
let uncertain=prepared(),unknown=CapturedBoundary(secret);unknown.throwsAfterAdd=true;let unknownAck=try intent(uncertain)
check(isUnresolved(try uncertain.attemptAdd(afterIntent:unknownAck,boundary:unknown)));check(unknown.adds==1)
let checkpoint=try uncertain.checkpointBytes(),restored=try PreparedCapturedAuxCredentialCopy.restore(binding:binding,capturedJournal:checkpoint,source:.bytes(secret))
check(isRefused(try restored.attemptAdd(afterIntent:unknownAck,boundary:unknown)));check(unknown.adds==1);check(isVerified(restored.reconcile(source:.bytes(secret),target:unknown.target)));check(unknown.adds==1)
let absent=try PreparedCapturedAuxCredentialCopy.restore(binding:binding,capturedJournal:checkpoint,source:.bytes(secret));check(isUnresolved(absent.reconcile(source:.bytes(secret),target:.missing)));check(isRefused(try absent.attemptAdd(afterIntent:unknownAck,boundary:unknown)));check(unknown.adds==1)
let conflict=prepared(),conflictBackend=CapturedBoundary(secret),conflictAck=try intent(conflict);conflictBackend.target = .bytes(Data([1]));check(isBlocked(try conflict.attemptAdd(afterIntent:conflictAck,boundary:conflictBackend)));check(conflictBackend.adds==0)
let inaccessible=prepared(),inaccessibleBackend=CapturedBoundary(secret),inaccessibleAck=try intent(inaccessible);inaccessibleBackend.source = .inaccessible(-1);check(isBlocked(try inaccessible.attemptAdd(afterIntent:inaccessibleAck,boundary:inaccessibleBackend)));check(inaccessibleBackend.adds==0)
let duplicate=prepared(),duplicateBackend=CapturedBoundary(secret),duplicateAck=try intent(duplicate);duplicateBackend.status = .duplicate;check(isBlocked(try duplicate.attemptAdd(afterIntent:duplicateAck,boundary:duplicateBackend)));check(duplicateBackend.adds==1)
refuse{_ = try PreparedCapturedAuxCredentialCopy.restore(binding:aux,capturedJournal:checkpoint,source:.bytes(secret))}
refuse{_ = try PreparedCapturedAuxCredentialCopy.restore(binding:binding,capturedJournal:checkpoint,source:.missing)}
refuse{_ = try PreparedCapturedAuxCredentialCopy.prepare(binding:binding,source:.inaccessible(-1),target:.missing)}
refuse{_ = try PreparedCapturedAuxCredentialCopy.prepare(binding:binding,source:.bytes(secret),target:.inaccessible(-1))}
let failed=prepared(),failedBackend=CapturedBoundary(secret),failedAck=try intent(failed);failedBackend.status = .failure(-1);check(isBlocked(try failed.attemptAdd(afterIntent:failedAck,boundary:failedBackend)));check(failedBackend.adds==1)
var corrupt=try JSONDecoder().decode(AuxCredentialCopyJournal.self,from:checkpoint);corrupt.phase = .blocked;corrupt.revision=2;corrupt.reason="not-a-fixed-status";refuse{_ = try PreparedCapturedAuxCredentialCopy.restore(binding:binding,capturedJournal:corrupt.canonicalBytes(),source:.bytes(secret))}
print("\(checks) copy-only selector/opaque-byte/one-shot/restart/refusal checks; captured boundary only, zero Security calls or secret filesystem writes")
