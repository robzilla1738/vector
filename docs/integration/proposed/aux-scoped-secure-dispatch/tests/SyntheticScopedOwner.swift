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
    let ready=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:journal.transactionId).loadCurrent()!
    let policy=try ImmutableAuxLogicalKeyPolicy(allowedLogicalKeys:fixtureLogicalKeys)
    let secureReview=try ReviewedAuxSecureStoreScope(scope:scope,accessGroup:stage.accessGroup,allowedLogicalKeys:fixtureLogicalKeys)
    func terminal(_ bindings:[FreshTargetBinding])throws->CapturedTerminalCommandContext {
        let j=ready.journal
        let bound=FreshInstallationJournal(format:j.format,transactionId:j.transactionId,scope:j.scope,newScopeReviewId:j.newScopeReviewId,candidateSha256:j.candidateSha256,bindings:bindings,publicDescriptor:j.publicDescriptor,targetHashes:j.targetHashes,legacyObservedAbsentRoles:j.legacyObservedAbsentRoles,initialObservedAbsentRoles:j.initialObservedAbsentRoles,revision:j.revision,phase:j.phase,intended:j.intended,verified:j.verified,failure:nil)
        return try .fresh(checkpoint:.init(journal:bound,sha256:bound.checkpoint().journalSha256),candidate:cohort,targets:boundary.captureTargets())
    }
    let captured=try terminal(bindings)
    let paired=try ScopedAuxCommandContext.capturedFresh(terminal:captured,bindings:bindings,policy:policy,boundary:CapturedCredentialBoundary(review:secureReview))
    precondition(paired.evidence.scope==scope && !paired.evidence.runtimeAdmissionVerified)
    // Even exact terminal-bound but unsafe cross-group/overlapping selectors fail.
    let physical=try secureReview.selector("fixture.credential")
    var collision=bindings
    collision[0]=FreshTargetBinding(row:"metadata",target:.init(service:physical.service,account:physical.account,accessGroup:physical.accessGroup))
    var mixedGroup=bindings
    mixedGroup[0]=FreshTargetBinding(row:"metadata",target:.init(service:bindings[0].target.service,account:bindings[0].target.account,accessGroup:"TEST.other.aux.synthetic"))
    for unsafe in [collision,mixedGroup] {
        let capturedUnsafe=try terminal(unsafe)
        var refused=false
        do{_ = try ScopedAuxCommandContext.capturedFresh(terminal:capturedUnsafe,bindings:unsafe,policy:policy,boundary:CapturedCredentialBoundary(review:secureReview))}catch{refused=true}
        precondition(refused)
    }
    return boundary // No material, cohort or initial coordinator escapes.
}

// Native finite fixture policy, never parsed from JS or process environment.
private let fixtureLogicalKeys:Set<String>=["fixture.credential","fixture.blocked","fixture.write-failure","fixture.add-race","fixture.invalid","fixture.clear-failure"]
private let secureCountLock=NSLock()
private var secureCalls:UInt64=0
private func counted(){secureCountLock.lock();secureCalls += 1;secureCountLock.unlock()}
@_cdecl("AuxFixtureSecureCallCount")
func auxFixtureSecureCallCount()->UInt64{secureCountLock.lock();defer{secureCountLock.unlock()};return secureCalls}
private final class CapturedCredentialBoundary:AuxSecureStoreBoundary {
    private let review:ReviewedAuxSecureStoreScope
    private var values=[AuxSecureStoreSelector:Data]()
    init(review:ReviewedAuxSecureStoreScope){self.review=review
        values[try! review.selector("fixture.write-failure")]=Data("retained-synthetic".utf8)
        values[try! review.selector("fixture.clear-failure")]=Data("retained-clear".utf8)
    }
    private func isKey(_ selector:AuxSecureStoreSelector,_ key:String)->Bool{selector == (try! review.selector(key))}
    func read(_ selector:AuxSecureStoreSelector)->CapturedAuxSecureRead {counted()
        if isKey(selector,"fixture.blocked"){return .failure(errSecInteractionNotAllowed)}
        if isKey(selector,"fixture.invalid"){return .invalid}
        return values[selector].map{.bytes($0)} ?? .missing
    }
    func update(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {counted()
        if isKey(selector,"fixture.write-failure"){return errSecInteractionNotAllowed}
        if values[selector]==nil{return errSecItemNotFound}
        values[selector]=data;return errSecSuccess
    }
    func add(_ selector:AuxSecureStoreSelector,data:Data)->OSStatus {counted()
        if isKey(selector,"fixture.add-race") || values[selector] != nil{return errSecDuplicateItem}
        values[selector]=data;return errSecSuccess
    }
    func clear(_ selector:AuxSecureStoreSelector)->OSStatus {counted()
        if isKey(selector,"fixture.clear-failure"){return errSecInteractionNotAllowed}
        return values.removeValue(forKey:selector)==nil ? errSecItemNotFound:errSecSuccess
    }
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
    let policy=try ImmutableAuxLogicalKeyPolicy(allowedLogicalKeys:fixtureLogicalKeys)
    let storeReview=try ReviewedAuxSecureStoreScope(scope:boundary.review.scope,accessGroup:boundary.review.stage.accessGroup,allowedLogicalKeys:fixtureLogicalKeys)
    let secure=CapturedCredentialBoundary(review:storeReview)
    let scoped=try ScopedAuxCommandContext.recoveredFresh(terminal:terminal,review:boundary.review,policy:policy,boundary:secure)
    precondition(scoped.evidence.scope==terminal.evidence.scope && scoped.evidence.securityReviewSha256==terminal.evidence.securityReviewSha256 && !scoped.evidence.runtimeAdmissionVerified)
    // Review from another transaction/group can never rebind this terminal.
    var rejected=false
    let otherJournal=FreshInstallationJournal(format:stored.journal.format,transactionId:UUID().uuidString,scope:stored.journal.scope,newScopeReviewId:stored.journal.newScopeReviewId,candidateSha256:stored.journal.candidateSha256,bindings:stored.journal.bindings,publicDescriptor:stored.journal.publicDescriptor,targetHashes:stored.journal.targetHashes,legacyObservedAbsentRoles:stored.journal.legacyObservedAbsentRoles,initialObservedAbsentRoles:stored.journal.initialObservedAbsentRoles,revision:stored.journal.revision,phase:stored.journal.phase,intended:stored.journal.intended,verified:stored.journal.verified,failure:nil)
    let otherStage=ReviewedFreshSecureStageSelector(service:boundary.review.stage.service,account:"aux."+boundary.review.scope+".fresh."+otherJournal.transactionId.lowercased(),accessGroup:boundary.review.stage.accessGroup)
    let otherReview=try ReviewedFreshSecurityBoundary(journal:otherJournal,legacyBindings:boundary.review.legacyBindings,stage:otherStage,expectedReviewSha256:ReviewedFreshSecurityBoundary.digest(journal:otherJournal,legacyBindings:boundary.review.legacyBindings,stage:otherStage))
    do{_ = try ScopedAuxCommandContext.recoveredFresh(terminal:terminal,review:otherReview,policy:policy,boundary:secure)}catch{rejected=true}
    precondition(rejected)
    return try AuxOwnedCommandDispatcher(scopedTerminal:scoped)
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
