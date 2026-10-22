// Inactive coordinator. Instantiating with real boundary would execute Security;
// no runtime entrypoint/activation exists, and tests use only a captured fake.
import Foundation

enum FreshCoordinatorError:Error {case existingJournal,missingJournal,binding,stageOutcome}
enum FreshCoordinatorOutcome {
    case progressed(StoredFreshInstallationCheckpoint)
    case unresolved(String)
    case blocked(StoredFreshInstallationCheckpoint)
    case ready(AuxInstallationCommandCore)
}
final class FreshSecurityStepCoordinator {
    private let root:String
    private let boundary:FreshInstallationSecurityBoundary
    init(canonicalDisposableRoot:String,boundary:FreshInstallationSecurityBoundary) {
        root=canonicalDisposableRoot;self.boundary=boundary
    }
    private func store()throws->PrivateFreshInstallationJournalStore {
        try .init(canonicalDisposableRoot:root,transactionId:boundary.review.transactionId)
    }
    private func blocked(_ stored:StoredFreshInstallationCheckpoint,_ reason:String)throws->FreshCoordinatorOutcome {
        guard stored.journal.phase != .ready else{throw FreshCoordinatorError.binding}
        if stored.journal.phase == .blocked{return .blocked(stored)}
        var j=stored.journal;j.revision += 1;j.phase = .blocked;j.failure=reason
        return .blocked(try store().commit(j,expectedHead:stored.sha256))
    }
    private func validateJournal(_ j:FreshInstallationJournal)throws {
        try j.validate()
        guard j.transactionId==boundary.review.transactionId,j.scope==boundary.review.scope,j.bindings==boundary.review.targetBindings,j.candidateSha256==boundary.review.candidateSha256,j.targetHashes==boundary.review.targetHashes,j.publicDescriptor==boundary.review.publicDescriptor else{throw FreshCoordinatorError.binding}
    }
    private func allAbsent(_ captures:CallerCapturedFreshTargets)->Bool {
        freshRoles.allSatisfy{if case .absent=captures.value($0){return true};return false}
    }
    // A separate native boundary must authorize this previously never-used scope
    // before generation. The supplied cohort was already created externally.
    func begin(cohort:PreparedFreshAuxCohort,review:CallerAssertedNeverUsedScopeReview)throws->FreshCoordinatorOutcome {
        guard review.scope==boundary.review.scope else{throw FreshCoordinatorError.binding}
        let journalStore=try store()
        guard try journalStore.loadCurrent()==nil else{throw FreshCoordinatorError.existingJournal}
        let actualReview=CallerAssertedNeverUsedScopeReview(reviewId:review.reviewId,scope:review.scope,history:review.history,custody:review.custody,legacyArtifacts:boundary.captureLegacy())
        let journal=try FreshInstallationTransaction.prepare(candidate:cohort,transactionId:boundary.review.transactionId,review:actualReview,bindings:boundary.review.targetBindings,captured:boundary.captureTargets())
        try validateJournal(journal)
        guard case .absent=boundary.captureStage() else{throw FreshCoordinatorError.stageOutcome}
        // Real durable draft precedes binding file and any fifth/target Add.
        let stored=try journalStore.commit(journal,expectedHead:nil)
        let intent=try FreshSecureStage.prepareAdd(cohort:cohort,journal:journal,checkpoint:stored.acknowledgement,selector:boundary.review.stage,capturedStage:.absent)
        let bindingStore=try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:journal,selector:boundary.review.stage)
        let binding=try bindingStore.publish(intent.binding)
        let request=try intent.addRequest(checkpoint:binding.acknowledgement)
        let status:CapturedFreshAddStatus
        do {status=try boundary.addStage(request)} catch {return .unresolved("stage-add-outcome-unknown-no-replay")}
        guard case .added=status else{return try blocked(stored,"stage-add-failed-or-duplicate")}
        do {
            _ = try FreshSecureStage.restore(journal:journal,checkpoint:stored.acknowledgement,selector:boundary.review.stage,binding:binding.binding,stageCheckpoint:binding.acknowledgement,captured:boundary.captureStage())
        } catch {return try blocked(stored,"stage-readback-failed")}
        return .progressed(stored)
    }
    // Restart NEVER generates authority or submits a fifth Add. Loaded target
    // intents are observation-only; pending absence is unresolved, not retry.
    func advanceOne()throws->FreshCoordinatorOutcome {
        let journalStore=try store()
        guard let stored=try journalStore.loadCurrent() else{throw FreshCoordinatorError.missingJournal}
        let j=stored.journal;try validateJournal(j)
        if j.phase == .blocked{return .blocked(stored)}
        guard allAbsent(boundary.captureLegacy()) else{return try blocked(stored,"legacy-artifact-or-unavailable")}
        let bindingStore=try PrivateFreshSecureStageBindingStore(canonicalDisposableRoot:root,journal:j,selector:boundary.review.stage)
        guard let binding=try bindingStore.load() else{return .unresolved("stage-binding-missing")}
        let stageCapture=boundary.captureStage()
        if case .absent=stageCapture{return .unresolved("stage-absent-no-replay")}
        let restored:RestoredFreshSecureStage
        do {restored=try FreshSecureStage.restore(journal:j,checkpoint:stored.acknowledgement,selector:boundary.review.stage,binding:binding.binding,stageCheckpoint:binding.acknowledgement,captured:stageCapture)}
        catch {return try blocked(stored,"stage-invalid-or-unavailable")}
        let targets=boundary.captureTargets()
        switch j.phase {
        case .intent:
            switch try restored.observeInterruptedIntent(journal:j,checkpoint:stored.acknowledgement,captured:targets) {
            case .unresolved:return .unresolved("target-add-outcome-unknown-no-replay")
            case .advanced(let next):return .progressed(try journalStore.commit(next,expectedHead:stored.sha256))
            case .blocked(let next):return .blocked(try journalStore.commit(next,expectedHead:stored.sha256))
            }
        case .awaitingReadback:
            let next=try FreshInstallationTransaction.readback(j,checkpoint:stored.acknowledgement,captured:targets)
            let nextStored=try journalStore.commit(next,expectedHead:stored.sha256)
            return next.phase == .blocked ? .blocked(nextStored):.progressed(nextStored)
        case .draft:
            let ticket:RestoredFreshIntent
            do {ticket=try restored.prepareNextIntent(journal:j,checkpoint:stored.acknowledgement,stageCheckpoint:binding.acknowledgement,captured:targets)}
            catch {return try blocked(stored,"target-preflight-failed")}
            let intended=try journalStore.commit(ticket.journal,expectedHead:stored.sha256)
            let request=try ticket.takeRequest(checkpoint:intended.acknowledgement)
            let status:CapturedFreshAddStatus
            do {status=try boundary.addTarget(request)} catch {return try blocked(intended,"target-add-outcome-unknown")}
            let next=try FreshInstallationTransaction.recordAdd(intended.journal,checkpoint:intended.acknowledgement,status:status)
            let recorded=try journalStore.commit(next,expectedHead:intended.sha256)
            if next.phase == .blocked{return .blocked(recorded)}
            let readback=try FreshInstallationTransaction.readback(next,checkpoint:recorded.acknowledgement,captured:boundary.captureTargets())
            let checked=try journalStore.commit(readback,expectedHead:recorded.sha256)
            return readback.phase == .blocked ? .blocked(checked):.progressed(checked)
        case .ready:return .ready(try Self.terminalCore(stored:stored,targets:targets))
        case .blocked:return .blocked(stored)
        }
    }
    // Secure stage has already authenticated the exact candidate digest/authority.
    // Fresh candidate regeneration is unnecessary; captured ready targets suffice.
    private static func terminalCore(stored:StoredFreshInstallationCheckpoint,targets:CallerCapturedFreshTargets)throws->AuxInstallationCommandCore {
        let j=stored.journal
        guard j.phase == .ready,try j.checkpoint().journalSha256==stored.sha256 else{throw FreshCoordinatorError.binding}
        var rows=[String:Data]()
        for role in freshRoles {
            guard case .bytes(let data)=targets.value(role),freshJournalHash(data)==j.targetHashes[role] else{throw FreshCoordinatorError.binding}
            rows[role]=data
        }
        let metadata=try InstallationAuthorityMetadata(json:rows["metadata"]!)
        guard metadata.scheme.rawValue==j.publicDescriptor["scheme"],let sig=Data(base64Encoded:j.publicDescriptor["sig_pub"]!),let kem=Data(base64Encoded:j.publicDescriptor["kem_pub"]!) else{throw FreshCoordinatorError.binding}
        let authority:AuxCapturedCommandAuthority
        switch metadata.scheme {
        case .p256:authority=try .p256(metadata:metadata,signingPrivate:rows["signing"]!,signingPublic:sig,kemPrivate:rows["kem"]!,kemPublic:kem,wrappedRoot:rows["wrappedRoot"]!)
        case .pq:
            guard #available(macOS 26.0, *) else{throw FreshCoordinatorError.binding}
            authority=try .pq(metadata:metadata,signingPrivate:rows["signing"]!,signingPublic:sig,kemPrivate:rows["kem"]!,kemPublic:kem,wrappedRoot:rows["wrappedRoot"]!)
        }
        return .init(context:.installed(authority))
    }
}
