// Typed recovered-fresh terminal only. No generic core-wrapping constructor.
import Foundation

struct RecoveredFreshTerminalEvidence {
    let mode:String;let transactionId:String;let scope:String;let newScopeReviewId:String
    let journalSha256:String;let stageBindingSha256:String;let stagePayloadSha256:String
    let securityReviewSha256:String;let selectorBindingsSha256:String
}
struct RecoveredFreshTerminalCommandContext {
    let core:AuxInstallationCommandCore
    let evidence:RecoveredFreshTerminalEvidence
    private init(core:AuxInstallationCommandCore,evidence:RecoveredFreshTerminalEvidence) {self.core=core;self.evidence=evidence}
    static func validate(checkpoint stored:StoredFreshInstallationCheckpoint,review:ReviewedFreshSecurityBoundary,stageBinding:StoredSecureStageBinding,stageCapture:CallerCapturedSecureStage,targets:CallerCapturedFreshTargets)throws->Self {
        let j=stored.journal
        guard j.phase == .ready,try j.checkpoint().journalSha256==stored.sha256 else{throw FreshCoordinatorError.binding}
        guard j.transactionId==review.transactionId,j.scope==review.scope,j.bindings==review.targetBindings,j.candidateSha256==review.candidateSha256,j.targetHashes==review.targetHashes,j.publicDescriptor==review.publicDescriptor,
              try stageBinding.binding.assertedCheckpoint().bindingSha256==stageBinding.sha256 else{throw FreshCoordinatorError.binding}
        // Validates exact stage hash/all immutable journal fields and real signer,
        // KEM, strict v2 wrap; no candidate/private material is regenerated.
        _ = try FreshSecureStage.restore(journal:j,checkpoint:stored.acknowledgement,selector:review.stage,binding:stageBinding.binding,stageCheckpoint:stageBinding.acknowledgement,captured:stageCapture)
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
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        let evidence=RecoveredFreshTerminalEvidence(mode:"recovered-fresh",transactionId:j.transactionId,scope:j.scope,newScopeReviewId:j.newScopeReviewId,journalSha256:stored.sha256,stageBindingSha256:stageBinding.sha256,stagePayloadSha256:stageBinding.binding.secretPayloadSha256,securityReviewSha256:review.reviewSha256,selectorBindingsSha256:freshJournalHash(try encoder.encode(j.bindings)))
        return .init(core:.init(context:.installed(authority)),evidence:evidence)
    }
}
