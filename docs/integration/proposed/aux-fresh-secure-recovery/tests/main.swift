import Foundation
let scope=String(repeating:"d",count:64)
let admission=CallerAssertedFreshAdmission(scope:scope,metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent,newScopeExplicitlyReviewed:true)
let fresh=try AuxFreshInstallationFactory.prepare(admission:admission,secureEnclaveAvailable:false,macOS26Available:false)
let cohort=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(fresh)
let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".install.v2",account:"aux."+scope+"."+$0,accessGroup:"TEST.aux.synthetic"))}
func captured(_ rows:[String:Data])->CallerCapturedFreshTargets {
    func r(_ role:String)->CallerCapturedFreshRead { rows[role].map{.bytes($0)} ?? .absent }
    return .init(metadata:r("metadata"),signing:r("signing"),kem:r("kem"),wrappedRoot:r("wrappedRoot"))
}
let absent=captured([:])
let review=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
var journal=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:UUID().uuidString,review:review,bindings:bindings,captured:absent)
let selector=ReviewedFreshSecureStageSelector(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+journal.transactionId.lowercased(),accessGroup:"TEST.aux.synthetic")
let intent=try FreshSecureStage.prepareAdd(cohort:cohort,journal:journal,checkpoint:journal.checkpoint(),selector:selector,capturedStage:.absent)
do { _ = try intent.addRequest(checkpoint:.init(bindingSha256:String(repeating:"0",count:64)));fatalError("unbound stage add allowed") } catch FreshSecureStageError.binding {}
// Pure asserted durable binding; fixture does not claim fsync or store custody.
let bindingCheckpoint=try intent.binding.assertedCheckpoint()
let add=try intent.addRequest(checkpoint:bindingCheckpoint)
do { _ = try intent.addRequest(checkpoint:bindingCheckpoint);fatalError("secure-stage Add replay permitted") } catch FreshSecureStageError.binding {}
precondition(!String(decoding:add.secretPayload,as:UTF8.self).contains(fresh.root.base64EncodedString()))
let secret=try strictEnvelopeObject(add.secretPayload)
let payloads=secret["payloads"] as! [String:String]
precondition(Set(payloads.keys)==Set(freshRoles) && Data(base64Encoded:payloads["wrappedRoot"]!)==cohort.targetPayloads.wrappedRoot)
do { _ = try FreshSecureStage.restore(journal:journal,checkpoint:journal.checkpoint(),selector:selector,binding:intent.binding,stageCheckpoint:bindingCheckpoint,captured:.absent);fatalError("lost stage recovered") } catch FreshSecureStageError.missing {}
// Synthetic secure-item persistence is memory only. No plaintext key/DK disk file.
let secureItem=add.secretPayload
var rows:[String:Data]=[:]
for role in freshRoles {
    let restored=try FreshSecureStage.restore(journal:journal,checkpoint:journal.checkpoint(),selector:selector,binding:intent.binding,stageCheckpoint:bindingCheckpoint,captured:.bytes(secureItem))
    let ticket=try restored.prepareNextIntent(journal:journal,checkpoint:journal.checkpoint(),stageCheckpoint:bindingCheckpoint,captured:captured(rows))
    journal=ticket.journal
    let reloaded=try FreshInstallationJournal.decode(journal.encoded())
    // A restarted uncertain intent cannot mint a new request, even if absent.
    guard case .unresolved=try restored.observeInterruptedIntent(journal:reloaded,checkpoint:reloaded.checkpoint(),captured:captured(rows)) else{fatalError("absent interrupted intent resolved")}
    do { _ = try restored.prepareNextIntent(journal:reloaded,checkpoint:reloaded.checkpoint(),stageCheckpoint:bindingCheckpoint,captured:captured(rows));fatalError("restarted intent replay permitted") } catch FreshSecureStageError.phase {}
    // Only the still-live first-attempt process ticket may dispatch once.
    let request=try ticket.takeRequest(checkpoint:reloaded.checkpoint())
    do { _ = try ticket.takeRequest(checkpoint:reloaded.checkpoint());fatalError("ticket replay permitted") } catch FreshSecureStageError.phase {}
    precondition(request.row==role)
    rows[role]=request.payload
    if role=="metadata" {
        guard case .advanced(let reconciled)=try FreshInstallationTransaction.reconcileIntent(reloaded,checkpoint:reloaded.checkpoint(),captured:captured(rows)) else{fatalError("crash-after-add reconciliation failed")}
        journal=reconciled
    } else {
        journal=try FreshInstallationTransaction.recordAdd(journal,checkpoint:journal.checkpoint(),status:.added)
        journal=try FreshInstallationTransaction.readback(journal,checkpoint:journal.checkpoint(),captured:captured(rows))
    }
}
precondition(journal.phase == .ready && rows.count==4 && secureItem==add.secretPayload) // Stage retained even on completion; no deletion adapter.
var tampered=secureItem;tampered[0] ^= 1
do { _ = try FreshSecureStage.restore(journal:journal,checkpoint:journal.checkpoint(),selector:selector,binding:intent.binding,stageCheckpoint:bindingCheckpoint,captured:.bytes(tampered));fatalError("changed stage accepted") } catch FreshSecureStageError.changed {}
do { _ = try FreshSecureStage.restore(journal:journal,checkpoint:journal.checkpoint(),selector:selector,binding:intent.binding,stageCheckpoint:bindingCheckpoint,captured:.unavailable);fatalError("unavailable stage recovered") } catch FreshSecureStageError.unavailable {}
print("secure-stage source adapter synthetic restart/continuity/retention checks passed; no Security or secret disk writes")
