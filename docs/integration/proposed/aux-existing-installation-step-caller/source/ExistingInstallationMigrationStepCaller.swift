// External existing-authority caller only. No fresh mode, reset, deletion,
// active-selection switch or claim that caller admission/custody is supplied.
import Foundation
import CryptoKit

protocol ExistingInstallationSecurityBoundary {
    func captureOriginals(_ review:ReviewedInstallationSelectorBindings)throws->CapturedInstallationRows
    func captureTargets(_ review:ReviewedInstallationSelectorBindings)throws->CapturedInstallationRows
    func addOnly(_ request:PreparedAddOnlyRequest,review:ReviewedInstallationSelectorBindings)throws->OSStatus
}
// Concrete adapter, intentionally without a default caller/dispatcher activation.
struct ReviewedExistingInstallationSecurityAdapter:ExistingInstallationSecurityBoundary {
    func captureOriginals(_ review:ReviewedInstallationSelectorBindings)throws->CapturedInstallationRows { ExternalInstallationSecurityExecutor.captureOriginals(review) }
    func captureTargets(_ review:ReviewedInstallationSelectorBindings)throws->CapturedInstallationRows { ExternalInstallationSecurityExecutor.captureTargets(review) }
    func addOnly(_ request:PreparedAddOnlyRequest,review:ReviewedInstallationSelectorBindings)throws->OSStatus { try ExternalInstallationSecurityExecutor.addOnly(request,review:review) }
}
enum ExistingInstallationStepError:Error { case inconsistentBinding,alreadyStarted,notStarted,busy,staleStep }
struct AuthenticatedInstallationReadback {
    let capturedReceipt:CapturedReadbackReceipt
    let publicCommandReply:[String:String]
    let initializationPublicReply:[String:String]
    let signingAndRootAuthenticated:Bool
    let sameRootByVerifiedCandidateLineage:Bool
    let authorityProvenanceVerified=false
    let activeSelectionPerformed=false
    fileprivate init(receipt:CapturedReadbackReceipt,candidate:PreparedInstallationCandidate) {
        capturedReceipt=receipt;publicCommandReply=candidate.publicCommandReply;initializationPublicReply=candidate.initializationPublicReply
        signingAndRootAuthenticated=true;sameRootByVerifiedCandidateLineage=true
    }
}
enum ExistingInstallationStepResult {
    case progress(StoredInstallationCheckpoint)
    case stopped(StoredInstallationCheckpoint)
    case uncertainAdd(StoredInstallationCheckpoint,row:String)
    case authenticated(StoredInstallationCheckpoint,AuthenticatedInstallationReadback)
}

final class ExistingInstallationMigrationStepCaller {
    private let candidate:PreparedInstallationCandidate
    private let review:ReviewedInstallationSelectorBindings
    private let bindings:[InstallationRowBinding]
    private let store:PrivateInstallationJournalStore
    private let security:ExistingInstallationSecurityBoundary
    private let challenge:Data
    private let inProcessStep=NSLock() // Same instance only; never all-writer custody.
    init(candidate:PreparedInstallationCandidate,review:ReviewedInstallationSelectorBindings,bindings:[InstallationRowBinding],store:PrivateInstallationJournalStore,security:ExistingInstallationSecurityBoundary,readbackChallenge:Data)throws {
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        guard try Self.hash(encoder.encode(bindings))==review.reviewSha256,
              candidate.sameRootVerified,candidate.signingContinuityVerified,!candidate.persistencePerformed,!candidate.commitAuthorized,
              !readbackChallenge.isEmpty,readbackChallenge.count<=65_536 else{throw ExistingInstallationStepError.inconsistentBinding}
        self.candidate=candidate;self.review=review;self.bindings=bindings;self.store=store;self.security=security;challenge=readbackChallenge
    }
    private static func hash(_ bytes:Data)->String { SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined() }
    private var payloadHashes:[String:String] { ["metadata":candidate.metadataBytes,"signing":candidate.signingRepresentation,"kem":candidate.kemRepresentation,"wrappedRoot":candidate.wrappedRootV2].mapValues(Self.hash) }
    private func bound(_ checkpoint:StoredInstallationCheckpoint)throws {
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        guard checkpoint.journal.originalHashes==candidate.originalRowHashes,checkpoint.journal.targetHashes==payloadHashes,
              try Self.hash(encoder.encode(checkpoint.journal.bindings))==review.reviewSha256 else{throw ExistingInstallationStepError.inconsistentBinding}
    }
    private func stopped(_ checkpoint:StoredInstallationCheckpoint)->Bool { checkpoint.journal.phase == .blocked || checkpoint.journal.phase == .abandoned }
    private func capture()throws->(CapturedInstallationRows,CapturedInstallationRows) { (try security.captureOriginals(review),try security.captureTargets(review)) }
    private func persist(_ next:AdditiveInstallationJournal,after previous:StoredInstallationCheckpoint)throws->StoredInstallationCheckpoint { try store.commit(next,expectedHead:previous.sha256) }
    private func block(_ current:StoredInstallationCheckpoint,reason:String)throws->StoredInstallationCheckpoint {
        var next=current.journal;next.revision += 1;next.phase = .blocked;next.failure=reason;return try persist(next,after:current)
    }
    private func reconcile(_ current:StoredInstallationCheckpoint,captures:(CapturedInstallationRows,CapturedInstallationRows))throws->StoredInstallationCheckpoint {
        try persist(AdditiveInstallationTransaction.reconcile(current.journal,checkpoint:current.acknowledgement,originals:captures.0,targets:captures.1),after:current)
    }
    // Captured readback bytes are first checked against the candidate and journal;
    // then REAL recovered imports/signature verification/Aux-v2 open execute.
    // No injected validator or Boolean can stand in for these operations.
    private func authenticate(_ current:StoredInstallationCheckpoint,captures:(CapturedInstallationRows,CapturedInstallationRows))throws->ExistingInstallationStepResult {
        let receipt=try AdditiveInstallationTransaction.verifiedReceipt(current.journal,checkpoint:current.acknowledgement,originals:captures.0,targets:captures.1)
        func bytes(_ role:InstallationRow)throws->Data { guard case .data(let bytes)=captures.1.result(role)else{throw EnvelopePortError.malformedRecord};return bytes }
        do {
            let metadata=try InstallationAuthorityMetadata(json:bytes(.metadata))
            switch metadata.scheme {
            case .p256:
                let signer=try ExistingP256SigningAuthority(metadata:metadata,privateRepresentation:bytes(.signing),expectedPublicKey:candidate.signingPublicKey)
                let kem=try ExistingP256Authority(metadata:metadata,privateRepresentation:bytes(.kem),expectedPublicKey:candidate.kemPublicKey)
                guard try signer.verifies(signature:signer.signature(for:challenge),challenge:challenge)else{throw EnvelopePortError.authorityMismatch}
                let envelope=try P256DkEnvelope(json:bytes(.wrappedRoot));guard envelope.version == .auxV2 else{throw EnvelopePortError.unsupportedFormat}
                var root=try AuxNativeEnvelopeV2.open(envelope,authority:kem);defer{root.resetBytes(in:0..<root.count)}
                guard root.count==32 else{throw EnvelopePortError.rootMismatch}
            case .pq:
                if #available(macOS 26.0, *) {
                    let signer=try ExistingPqSigningAuthority(metadata:metadata,privateRepresentation:bytes(.signing),expectedPublicKey:candidate.signingPublicKey)
                    let kem=try ExistingPqAuthority(metadata:metadata,privateRepresentation:bytes(.kem),expectedPublicKey:candidate.kemPublicKey)
                    guard try signer.verifies(signature:signer.signature(for:challenge),challenge:challenge)else{throw EnvelopePortError.authorityMismatch}
                    let envelope=try PqDkEnvelope(json:bytes(.wrappedRoot));guard envelope.version == .auxV2 else{throw EnvelopePortError.unsupportedFormat}
                    var root=try AuxNativePqEnvelopeV2.open(envelope,authority:kem);defer{root.resetBytes(in:0..<root.count)}
                    guard root.count==32 else{throw EnvelopePortError.rootMismatch}
                } else { throw EnvelopePortError.unsupportedAuthority }
            }
            return .authenticated(current,.init(receipt:receipt,candidate:candidate))
        } catch { return .stopped(try block(current,reason:"target-authentication-failed")) }
    }
    // Creates only a journal; any initial capture failure is durably blocked.
    // Existing originals are mandatory. Absent originals never enter fresh mode.
    func start(transactionId:String)throws->ExistingInstallationStepResult {
        guard inProcessStep.try()else{throw ExistingInstallationStepError.busy};defer{inProcessStep.unlock()}
        guard try store.loadCurrent()==nil else{throw ExistingInstallationStepError.alreadyStarted}
        let captures=try capture()
        let journal=try AdditiveInstallationTransaction.prepare(candidate:candidate,transactionId:transactionId,bindings:bindings,originals:captures.0,targets:captures.1)
        let stored=try store.commit(journal,expectedHead:nil)
        return stopped(stored) ? .stopped(stored):.progress(stored)
    }
    // At most ONE create-only Security add per explicit invocation. External
    // admission/custody and truthful capture provenance remain caller obligations.
    func performOneStep()throws->ExistingInstallationStepResult {
        guard inProcessStep.try()else{throw ExistingInstallationStepError.busy};defer{inProcessStep.unlock()}
        guard var current=try store.loadCurrent()else{throw ExistingInstallationStepError.notStarted};try bound(current)
        if stopped(current){return .stopped(current)} // No Security capture or retry.
        let enteredPhase=current.journal.phase
        var captures=try capture()
        if enteredPhase == .draft {
            current=try persist(AdditiveInstallationTransaction.intendNext(current.journal,checkpoint:current.acknowledgement,originals:captures.0,targets:captures.1),after:current)
            if stopped(current){return .stopped(current)}
            captures=try capture()
        }
        // A durable intent is ALWAYS reconciled before a new add. A matching
        // target after an uncertain prior add is observed, never added again.
        current=try reconcile(current,captures:captures)
        if stopped(current){return .stopped(current)}
        if current.journal.phase == .ready{return try authenticate(current,captures:captures)}
        if current.journal.phase != .intent{return .progress(current)}
        // An intent loaded on entry may already have reached Security before a
        // lost response/crash. Absence cannot prove no prior attempt occurred.
        // Only the intent newly persisted by THIS invocation can issue Add.
        if enteredPhase == .intent{return .uncertainAdd(current,row:current.journal.intended.last!)}
        let request=try AdditiveInstallationTransaction.addRequest(current.journal,checkpoint:current.acknowledgement,candidate:candidate,originals:captures.0,targets:captures.1)
        // Detect cooperative journal progress before the OS operation. This is
        // NOT an atomic fence covering the external Keychain operation/writers.
        guard try store.loadCurrent()?.sha256==current.sha256 else{throw ExistingInstallationStepError.staleStep}
        let status:OSStatus
        do { status=try security.addOnly(request,review:review) }
        catch { return .uncertainAdd(current,row:request.row) } // Intent preserved; never blindly retry.
        current=try persist(AdditiveInstallationTransaction.capturedAddStatus(current.journal,checkpoint:current.acknowledgement,status:status),after:current)
        if stopped(current){return .stopped(current)}
        captures=try capture()
        current=try reconcile(current,captures:captures)
        if stopped(current){return .stopped(current)}
        if current.journal.phase == .ready{return try authenticate(current,captures:captures)}
        return .progress(current)
    }
}
