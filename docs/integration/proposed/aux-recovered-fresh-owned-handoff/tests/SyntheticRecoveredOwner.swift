// FIXTURE ONLY. Real durable journals, captured in-memory Security boundary.
// No original cohort is retained across the restarted coordinator boundary.
import CryptoKit
import Foundation
import Darwin
import Security
struct SyntheticFailure:Error {}
final class RecoveredFixtureBoundary:FreshInstallationSecurityBoundary {
    let review:ReviewedFreshSecurityBoundary;let root:String
    var targets=[String:Data]();var stage:Data?;var stageAdds=0;var targetAdds=0
    var duplicateStage=false
    var throwAfterSuccessfulStageAdd=false
    init(review:ReviewedFreshSecurityBoundary,root:String){self.review=review;self.root=root}
    func captures()->CallerCapturedFreshTargets {
        func r(_ role:String)->CallerCapturedFreshRead {targets[role].map{.bytes($0)} ?? .absent}
        return .init(metadata:r("metadata"),signing:r("signing"),kem:r("kem"),wrappedRoot:r("wrappedRoot"))
    }
    func captureLegacy()->CallerCapturedFreshTargets {.init(metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent)}
    func captureTargets()->CallerCapturedFreshTargets {captures()}
    func captureStage()->CallerCapturedSecureStage {stage.map{.bytes($0)} ?? .absent}
    func addStage(_ request:SensitiveFreshSecureStageAdd)throws->CapturedFreshAddStatus {
        stageAdds += 1
        let draft=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:review.transactionId).loadCurrent()!
        precondition(draft.journal.phase == .draft && draft.journal.revision==0)
        let binding=try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:draft.journal,selector:review.stage).load()!
        precondition(binding.binding.secretPayloadSha256==freshJournalHash(request.secretPayload))
        if duplicateStage{return .duplicate}
        guard stage==nil else{return .duplicate};stage=request.secretPayload
        if throwAfterSuccessfulStageAdd{throw SyntheticFailure()}
        return .added
    }
    func addTarget(_ request:FreshCreateOnlyRequest)throws->CapturedFreshAddStatus {
        targetAdds += 1
        let stored=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:review.transactionId).loadCurrent()!
        precondition(stored.journal.phase == .intent && stored.sha256==request.durableIntentSha256 && stage != nil)
        guard targets[request.row]==nil else{return .duplicate};targets[request.row]=request.payload;return .added
    }
}

private func initializeAndDiscardCohort(root:String)throws->RecoveredFixtureBoundary {
    var raw=Data(repeating:0,count:32);raw[31]=15
    let signing=try P256.Signing.PrivateKey(rawRepresentation:raw)
    raw[31]=16;let kem=try P256.KeyAgreement.PrivateKey(rawRepresentation:raw)
    let material=FreshAuthorityMaterial(kind:.softwareP256,root:Data(repeating:15,count:32),signingPrivateRepresentation:signing.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signing.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation)
    let cohort=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(material)
    let scope=String(repeating:"f",count:64)
    let absent=CallerCapturedFreshTargets(metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent)
    let scopeReview=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absent)
    let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".install.v2",account:"aux."+scope+"."+$0,accessGroup:"TEST.aux.synthetic"))}
    let journal=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:UUID().uuidString,review:scopeReview,bindings:bindings,captured:absent)
    let legacy=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".legacy",account:"aux."+scope+".legacy."+$0,accessGroup:"TEST.aux.synthetic"))}
    let stage=ReviewedFreshSecureStageSelector(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+journal.transactionId.lowercased(),accessGroup:"TEST.aux.synthetic")
    let review=try ReviewedFreshSecurityBoundary(journal:journal,legacyBindings:legacy,stage:stage,expectedReviewSha256:ReviewedFreshSecurityBoundary.digest(journal:journal,legacyBindings:legacy,stage:stage))
    let boundary=RecoveredFixtureBoundary(review:review,root:root)
    let coordinator=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:boundary)
    guard case .progressed=try coordinator.begin(cohort:cohort,review:scopeReview)else{fatalError("synthetic begin failed")}
    for _ in 0..<4{guard case .progressed=try coordinator.advanceOne()else{fatalError("synthetic write sequence failed")}}
    return boundary // No material, cohort or initial coordinator escapes.
}
private func recoveredOwner()throws->AuxOwnedCommandDispatcher {
    let url=FileManager.default.temporaryDirectory.appendingPathComponent("aux-recovered-napi-"+UUID().uuidString)
    try FileManager.default.createDirectory(at:url,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
    defer{try? FileManager.default.removeItem(at:url)}
    guard let canonical=realpath(url.path,nil)else{throw FreshCoordinatorError.binding}
    let root=String(cString:canonical);free(canonical)
    let boundary=try initializeAndDiscardCohort(root:root)
    // New coordinator knows only real durable journals, exact captured stage and
    // target bytes. Its API has no lost PreparedFreshAuxCohort argument.
    let restarted=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:boundary)
    guard case .ready(let terminal)=try restarted.advanceOne()else{fatalError("synthetic restart terminal failed")}
    let stored=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:boundary.review.transactionId).loadCurrent()!
    precondition(stored.journal.phase == .ready && boundary.stageAdds==1 && boundary.targetAdds==4)
    precondition(terminal.evidence.journalSha256==stored.sha256 && terminal.evidence.securityReviewSha256==boundary.review.reviewSha256)
    return try AuxOwnedCommandDispatcher(recoveredFreshTerminal:terminal)
}
private final class FixtureCounts {
    let lock=NSLock();var created:UInt64=0;var released:UInt64=0
}
private let fixtureCounts=FixtureCounts()
@_cdecl("AuxFixtureCreateOwner")
func auxFixtureCreateOwner(_ handle:UnsafeMutablePointer<UInt64>?)->UnsafeMutableRawPointer? {
    guard let handle else{return nil}
    do {
        let owner=try recoveredOwner()
        handle.pointee=owner.handle
        fixtureCounts.lock.lock();fixtureCounts.created += 1;fixtureCounts.lock.unlock()
        return Unmanaged.passRetained(owner).toOpaque()
    }catch{return nil}
}
@_cdecl("AuxFixtureReleaseOwner")
func auxFixtureReleaseOwner(_ pointer:UnsafeMutableRawPointer?) {
    guard let pointer else{return}
    Unmanaged<AuxOwnedCommandDispatcher>.fromOpaque(pointer).release()
    fixtureCounts.lock.lock();fixtureCounts.released += 1;fixtureCounts.lock.unlock()
}
@_cdecl("AuxFixtureCreatedCount")
func auxFixtureCreatedCount()->UInt64 {
    fixtureCounts.lock.lock();defer{fixtureCounts.lock.unlock()};return fixtureCounts.created
}
@_cdecl("AuxFixtureReleasedCount")
func auxFixtureReleasedCount()->UInt64 {
    fixtureCounts.lock.lock();defer{fixtureCounts.lock.unlock()};return fixtureCounts.released
}
