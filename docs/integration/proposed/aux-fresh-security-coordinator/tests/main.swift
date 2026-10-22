import Foundation
import Darwin
import Security
struct SyntheticFailure:Error {}
final class CapturedBoundary:FreshInstallationSecurityBoundary {
    let review:ReviewedFreshSecurityBoundary;let root:String
    var targets=[String:Data]();var stage:Data?;var stageAdds=0;var targetAdds=0
    var duplicateStage=false
    var throwAfterSuccessfulStageAdd=false
    var throwAfterSuccessfulTargetAdd=false
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
        guard targets[request.row]==nil else{return .duplicate};targets[request.row]=request.payload
        if throwAfterSuccessfulTargetAdd{throw SyntheticFailure()}
        return .added
    }
}
let raw=FileManager.default.temporaryDirectory.appendingPathComponent("aux-fresh-executor-"+UUID().uuidString).path
try FileManager.default.createDirectory(atPath:raw,withIntermediateDirectories:false,attributes:[.posixPermissions:0o700])
defer{try? FileManager.default.removeItem(atPath:raw)}
let canonical=realpath(raw,nil)!,root=String(cString:canonical);free(canonical)
let scope=String(repeating:"f",count:64)
let fresh=try AuxFreshInstallationFactory.prepare(admission:.init(scope:scope,metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent,newScopeExplicitlyReviewed:true),secureEnclaveAvailable:false,macOS26Available:false)
let cohort=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(fresh)
let absence=CallerCapturedFreshTargets(metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent)
let scopeReview=CallerAssertedNeverUsedScopeReview(reviewId:UUID().uuidString,scope:scope,history:.neverUsed,custody:.exclusiveStoppedStartup,legacyArtifacts:absence)
func setup()throws->(FreshInstallationJournal,ReviewedFreshSecurityBoundary,CapturedBoundary) {
    let bindings=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".install.v2",account:"aux."+scope+"."+$0,accessGroup:"TEST.aux.synthetic"))}
    let journal=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:UUID().uuidString,review:scopeReview,bindings:bindings,captured:absence)
    let legacy=freshRoles.map{FreshTargetBinding(row:$0,target:.init(service:"aux."+scope+".legacy",account:"aux."+scope+".legacy."+$0,accessGroup:"TEST.aux.synthetic"))}
    let stage=ReviewedFreshSecureStageSelector(service:"aux."+scope+".install.secure-stage.v1",account:"aux."+scope+".fresh."+journal.transactionId.lowercased(),accessGroup:"TEST.aux.synthetic")
    let review=try ReviewedFreshSecurityBoundary(journal:journal,legacyBindings:legacy,stage:stage,expectedReviewSha256:ReviewedFreshSecurityBoundary.digest(journal:journal,legacyBindings:legacy,stage:stage))
    return (journal,review,CapturedBoundary(review:review,root:root))
}
let (_,review,boundary)=try setup()
let coordinator=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:boundary)
guard case .progressed=try coordinator.begin(cohort:cohort,review:scopeReview) else{fatalError("begin failed")}
for _ in 0..<4 {guard case .progressed=try coordinator.advanceOne() else{fatalError("target progress failed")}}
guard case .ready(let terminal)=try FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:boundary).advanceOne() else{fatalError("terminal failed")}
precondition(terminal.evidence.mode=="recovered-fresh" && terminal.evidence.transactionId==review.transactionId && terminal.evidence.securityReviewSha256==review.reviewSha256)
let rootReply=try strictEnvelopeObject(Data(terminal.core.run(command:"dk-unwrap").utf8))
precondition(rootReply["dk"] as? String==fresh.root.base64EncodedString() && boundary.stageAdds==1 && boundary.targetAdds==4 && boundary.stage != nil)
let query=ExactFreshDataProtectionBoundary.readQuery(review.targetBindings[0].target)
precondition(query[kSecUseDataProtectionKeychain as String] as? Bool==true && query[kSecAttrAccessGroup as String] as? String=="TEST.aux.synthetic")
precondition({if case .unavailable=ExactFreshDataProtectionBoundary.captured(status:errSecInteractionNotAllowed,result:nil){return true};return false}())
// Loaded durable stage binding with absent stage NEVER repeats fifth Add.
let (missingJournal,missingReview,missingBoundary)=try setup()
let missingStore=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:missingJournal.transactionId)
let missingDraft=try missingStore.commit(missingJournal,expectedHead:nil)
let missingIntent=try FreshSecureStage.prepareAdd(cohort:cohort,journal:missingJournal,checkpoint:missingDraft.acknowledgement,selector:missingReview.stage,capturedStage:.absent)
_ = try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:missingJournal,selector:missingReview.stage).publish(missingIntent.binding)
guard case .unresolved=try FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:missingBoundary).advanceOne() else{fatalError("absent stage replayed")}
precondition(missingBoundary.stageAdds==0 && missingBoundary.targetAdds==0)
// Crash after fifth Add is observed; first-target uncertain absence is not replay.
missingBoundary.stage=try missingIntent.addRequest(checkpoint:missingIntent.binding.assertedCheckpoint()).secretPayload
let targetIntent=try FreshInstallationTransaction.intendNext(missingJournal,checkpoint:missingDraft.acknowledgement,captured:absence)
let durableIntent=try missingStore.commit(targetIntent,expectedHead:missingDraft.sha256)
let resumed=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:missingBoundary)
guard case .unresolved=try resumed.advanceOne() else{fatalError("unknown absent target retried")}
precondition(missingBoundary.targetAdds==0)
let original=try FreshInstallationTransaction.addRequest(targetIntent,checkpoint:durableIntent.acknowledgement,candidate:cohort,captured:absence)
missingBoundary.targets["metadata"]=original.payload // synthetic crash-after-Add/before-status observation
guard case .progressed=try resumed.advanceOne() else{fatalError("matching target observation failed")}
precondition(missingBoundary.targetAdds==0)
let (_,_,duplicateBoundary)=try setup();duplicateBoundary.duplicateStage=true
let duplicate=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:duplicateBoundary)
guard case .blocked=try duplicate.begin(cohort:cohort,review:scopeReview) else{fatalError("duplicate stage accepted")}
guard case .blocked=try duplicate.advanceOne() else{fatalError("blocked stage resumed")}
precondition(duplicateBoundary.stageAdds==1 && duplicateBoundary.targetAdds==0)
// A transport exception after successful fifth Add retains draft/binding.
let (_,_,throwingBoundary)=try setup();throwingBoundary.throwAfterSuccessfulStageAdd=true
let throwing=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:throwingBoundary)
guard case .unresolved=try throwing.begin(cohort:cohort,review:scopeReview) else{fatalError("unknown stage outcome terminally blocked")}
let unknownStored=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:throwingBoundary.review.transactionId).loadCurrent()!
precondition(unknownStored.journal.phase == .draft && unknownStored.journal.revision==0 && throwingBoundary.stageAdds==1 && throwingBoundary.targetAdds==0)
let recreated=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:throwingBoundary)
guard case .progressed=try recreated.advanceOne() else{fatalError("matching stage outcome could not resume")}
precondition(throwingBoundary.stageAdds==1 && throwingBoundary.targetAdds==1)
// Target exception after success retains its durable intent for observation.
let (_,_,targetThrowingBoundary)=try setup()
let targetThrowing=FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:targetThrowingBoundary)
_ = try targetThrowing.begin(cohort:cohort,review:scopeReview)
targetThrowingBoundary.throwAfterSuccessfulTargetAdd=true
guard case .unresolved=try targetThrowing.advanceOne() else{fatalError("unknown target outcome blocked")}
let intendedStored=try PrivateFreshInstallationJournalStore(canonicalDisposableRoot:root,transactionId:targetThrowingBoundary.review.transactionId).loadCurrent()!
precondition(intendedStored.journal.phase == .intent && targetThrowingBoundary.targetAdds==1)
guard case .progressed=try FreshSecurityStepCoordinator(canonicalDisposableRoot:root,boundary:targetThrowingBoundary).advanceOne() else{fatalError("matching target outcome could not resume")}
precondition(targetThrowingBoundary.targetAdds==1 && targetThrowingBoundary.stageAdds==1)
// On-disk files contain only nonsecret journals/binding/locks, no stage payload.
for url in FileManager.default.enumerator(at:URL(fileURLWithPath:root),includingPropertiesForKeys:nil)!.allObjects as! [URL] {
    var directory:ObjCBool=false
    if FileManager.default.fileExists(atPath:url.path,isDirectory:&directory),!directory.boolValue {
        let text=String(decoding:try Data(contentsOf:url),as:UTF8.self)
        precondition(!text.contains(fresh.root.base64EncodedString()) && !text.contains(cohort.targetPayloads.signing.base64EncodedString()) && !text.contains("\"payloads\""))
    }
}
print("fresh exact-selector adapter compiled; synthetic coordinator durable order/restart/terminal/retention checks passed; no Security calls")
