// Inactive source-only secret staging adapter. No filesystem or Security API calls.
import Foundation
import CryptoKit

enum FreshSecureStageError:Error { case binding, record, missing, unavailable, changed, phase }
enum CallerCapturedSecureStage { case absent, bytes(Data), unavailable, invalid }
struct ReviewedFreshSecureStageSelector {
    let service:String;let account:String;let accessGroup:String
    func validate(_ journal:FreshInstallationJournal)throws {
        try journal.validate()
        guard service=="aux."+journal.scope+".install.secure-stage.v1",
              account=="aux."+journal.scope+".fresh."+journal.transactionId.lowercased(),
              !accessGroup.isEmpty,accessGroup.utf8.count<=512,!accessGroup.utf8.contains(0),!accessGroup.lowercased().contains("aside"),
              journal.bindings.allSatisfy({$0.target.accessGroup==accessGroup && ($0.target.service != service || $0.target.account != account)})
        else{throw FreshSecureStageError.binding}
    }
}
struct FreshSecureStageBinding:Codable {
    let format:String;let transactionId:String;let scope:String;let candidateSha256:String
    let initialDraftSha256:String;let secretPayloadSha256:String
    let service:String;let account:String;let accessGroup:String
    func encoded()throws->Data {
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];return try encoder.encode(self)
    }
    func assertedCheckpoint()throws->AssertedDurableFreshStageBinding { .init(bindingSha256:freshJournalHash(try encoded())) }
    func validate(journal:FreshInstallationJournal,selector:ReviewedFreshSecureStageSelector,checkpoint:AssertedDurableFreshStageBinding)throws {
        // Bind ALL immutable journal fields, not merely candidate/transaction IDs.
        var initial=journal;initial.revision=0;initial.phase = .draft;initial.intended=[];initial.verified=[];initial.failure=nil
        guard try freshJournalHash(initial.encoded())==initialDraftSha256 else{throw FreshSecureStageError.binding}
        guard format=="aux.install.fresh.secure-stage.binding.v1",transactionId==journal.transactionId,scope==journal.scope,candidateSha256==journal.candidateSha256,
              service==selector.service,account==selector.account,accessGroup==selector.accessGroup,
              [initialDraftSha256,secretPayloadSha256].allSatisfy({$0.utf8.count==64 && $0.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}),
              try freshJournalHash(encoded())==checkpoint.bindingSha256 else{throw FreshSecureStageError.binding}
    }
}
struct AssertedDurableFreshStageBinding { let bindingSha256:String } // External durable-store assertion only.
struct PreparedSensitiveFreshStageIntent {
    let binding:FreshSecureStageBinding // Nonsecret record that must be durable BEFORE stage Add.
    fileprivate let secretPayload:Data
    fileprivate let selector:ReviewedFreshSecureStageSelector
    func addRequest(checkpoint:AssertedDurableFreshStageBinding)throws->SensitiveFreshSecureStageAdd {
        guard try binding.assertedCheckpoint().bindingSha256==checkpoint.bindingSha256 else{throw FreshSecureStageError.binding}
        return .init(selector:selector,secretPayload:secretPayload,intentJournalSha256:binding.initialDraftSha256)
    }
}
struct SensitiveFreshSecureStageAdd {
    let selector:ReviewedFreshSecureStageSelector
    let secretPayload:Data // Keychain-only proposal; NEVER write to filesystem/log/receipt.
    let intentJournalSha256:String
    let operation="add-only-if-absent"
    let deletePermitted=false;let overwritePermitted=false
}
struct RestoredFreshSecureStage {
    fileprivate let payloads:[String:Data]
    fileprivate let transactionId:String
    fileprivate let candidateSha256:String
    fileprivate let stageBinding:FreshSecureStageBinding
    fileprivate init(payloads:[String:Data],journal:FreshInstallationJournal,binding:FreshSecureStageBinding) {
        self.payloads=payloads;transactionId=journal.transactionId;candidateSha256=journal.candidateSha256;stageBinding=binding
    }
    // Only a NEW draft→intent transition in this process can mint a one-shot ticket.
    // A restored .intent never produces Add, even when pending is captured absent.
    func prepareNextIntent(journal:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,stageCheckpoint:AssertedDurableFreshStageBinding,captured:CallerCapturedFreshTargets)throws->RestoredFreshIntent {
        try journal.validate()
        try stageBinding.validate(journal:journal,selector:.init(service:stageBinding.service,account:stageBinding.account,accessGroup:stageBinding.accessGroup),checkpoint:stageCheckpoint)
        guard journal.phase == .draft,journal.transactionId==transactionId,journal.candidateSha256==candidateSha256 else{throw FreshSecureStageError.phase}
        let intended=try FreshInstallationTransaction.intendNext(journal,checkpoint:checkpoint,captured:captured)
        guard intended.phase == .intent else{throw FreshSecureStageError.changed}
        let row=intended.intended.last!,selector=intended.bindings.first{$0.row==row}!.target
        return RestoredFreshIntent(journal:intended,payload:payloads[row]!,selector:selector)
    }
    func observeInterruptedIntent(journal:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,captured:CallerCapturedFreshTargets)throws->FreshIntentObservation {
        try stageBinding.validate(journal:journal,selector:.init(service:stageBinding.service,account:stageBinding.account,accessGroup:stageBinding.accessGroup),checkpoint:stageBinding.assertedCheckpoint())
        guard journal.transactionId==transactionId,journal.candidateSha256==candidateSha256 else{throw FreshSecureStageError.binding}
        return try FreshInstallationTransaction.reconcileIntent(journal,checkpoint:checkpoint,captured:captured)
    }
}
// Process-local, non-Codable, single-use ticket. No persisted journal can recreate it.
final class RestoredFreshIntent {
    let journal:FreshInstallationJournal
    private let payload:Data;private let selector:FreshTargetSelector;private var consumed=false
    private let lock=NSLock()
    fileprivate init(journal:FreshInstallationJournal,payload:Data,selector:FreshTargetSelector) {self.journal=journal;self.payload=payload;self.selector=selector}
    func takeRequest(checkpoint:AssertedFreshDurableCheckpoint)throws->FreshCreateOnlyRequest {
        lock.lock();defer{lock.unlock()}
        guard !consumed,try journal.checkpoint().journalSha256==checkpoint.journalSha256 else{throw FreshSecureStageError.phase}
        consumed=true // Fail closed even if external dispatch/result is subsequently lost.
        return .init(transactionId:journal.transactionId,row:journal.intended.last!,selector:selector,payload:payload,durableIntentSha256:checkpoint.journalSha256)
    }

}
enum FreshSecureStage {
    private static func candidateHash(hashes:[String:String],publicDescriptor:[String:String])throws->String {
        freshJournalHash(try JSONSerialization.data(withJSONObject:["format":"aux.install.fresh.cohort.v1","targets":hashes,"public":publicDescriptor],options:[.sortedKeys,.withoutEscapingSlashes]))
    }
    static func prepareAdd(cohort:PreparedFreshAuxCohort,journal:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,selector:ReviewedFreshSecureStageSelector,capturedStage:CallerCapturedSecureStage)throws->PreparedSensitiveFreshStageIntent {
        try selector.validate(journal)
        guard journal.phase == .draft,journal.revision==0,journal.intended.isEmpty,
              try journal.checkpoint().journalSha256==checkpoint.journalSha256 else{throw FreshSecureStageError.phase}
        guard case .absent=capturedStage else{throw FreshSecureStageError.changed}
        let p=cohort.targetPayloads
        let payloads=["metadata":p.metadata,"signing":p.signing,"kem":p.kem,"wrappedRoot":p.wrappedRoot]
        let hashes=payloads.mapValues(freshJournalHash)
        guard hashes==journal.targetHashes,cohort.publicDescriptor==journal.publicDescriptor,
              try candidateHash(hashes:hashes,publicDescriptor:cohort.publicDescriptor)==journal.candidateSha256 else{throw FreshSecureStageError.changed}
        let bindingObjects=try JSONSerialization.jsonObject(with:JSONEncoder().encode(journal.bindings))
        let record:[String:Any]=["format":"aux.install.fresh.secure-stage.v1","transactionId":journal.transactionId,"scope":journal.scope,"candidateSha256":journal.candidateSha256,"bindings":bindingObjects,"publicDescriptor":journal.publicDescriptor,"targetHashes":hashes,"payloads":payloads.mapValues{$0.base64EncodedString()}]
        let data=try JSONSerialization.data(withJSONObject:record,options:[.sortedKeys,.withoutEscapingSlashes])
        guard data.count<=16_384 else{throw FreshSecureStageError.record}
        let binding=FreshSecureStageBinding(format:"aux.install.fresh.secure-stage.binding.v1",transactionId:journal.transactionId,scope:journal.scope,candidateSha256:journal.candidateSha256,initialDraftSha256:checkpoint.journalSha256,secretPayloadSha256:freshJournalHash(data),service:selector.service,account:selector.account,accessGroup:selector.accessGroup)
        return .init(binding:binding,secretPayload:data,selector:selector)
    }
    static func restore(journal:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,selector:ReviewedFreshSecureStageSelector,binding:FreshSecureStageBinding,stageCheckpoint:AssertedDurableFreshStageBinding,captured:CallerCapturedSecureStage)throws->RestoredFreshSecureStage {
        try selector.validate(journal)
        guard journal.phase != .blocked,try journal.checkpoint().journalSha256==checkpoint.journalSha256 else{throw FreshSecureStageError.phase}
        try binding.validate(journal:journal,selector:selector,checkpoint:stageCheckpoint)
        let bytes:Data
        switch captured {case .bytes(let b):bytes=b;case .absent:throw FreshSecureStageError.missing;case .unavailable:throw FreshSecureStageError.unavailable;case .invalid:throw FreshSecureStageError.record}
        guard freshJournalHash(bytes)==binding.secretPayloadSha256 else{throw FreshSecureStageError.changed}
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","transactionId","scope","candidateSha256","bindings","publicDescriptor","targetHashes","payloads"],
              object["format"] as? String=="aux.install.fresh.secure-stage.v1",object["transactionId"] as? String==journal.transactionId,
              object["scope"] as? String==journal.scope,object["candidateSha256"] as? String==journal.candidateSha256,
              object["publicDescriptor"] as? [String:String]==journal.publicDescriptor,object["targetHashes"] as? [String:String]==journal.targetHashes,
              let bindingObject=object["bindings"],let encoded=object["payloads"] as? [String:String],Set(encoded.keys)==Set(freshRoles) else{throw FreshSecureStageError.record}
        let bindings=try JSONDecoder().decode([FreshTargetBinding].self,from:JSONSerialization.data(withJSONObject:bindingObject))
        guard bindings==journal.bindings else{throw FreshSecureStageError.binding}
        var payloads:[String:Data]=[:]
        for role in freshRoles {
            guard let text=encoded[role],let data=Data(base64Encoded:text),!data.isEmpty,data.count<=16_384,data.base64EncodedString()==text,freshJournalHash(data)==journal.targetHashes[role] else{throw FreshSecureStageError.changed}
            payloads[role]=data
        }
        guard try candidateHash(hashes:journal.targetHashes,publicDescriptor:journal.publicDescriptor)==journal.candidateSha256 else{throw FreshSecureStageError.changed}
        try validateAuthority(payloads,journal:journal)
        return .init(payloads:payloads,journal:journal,binding:binding)
    }
    private static func validateAuthority(_ payloads:[String:Data],journal:FreshInstallationJournal)throws {
        let metadataBytes=payloads["metadata"]!
        guard Set(try strictEnvelopeObject(metadataBytes).keys)==["scheme","key_storage"] else{throw FreshSecureStageError.record}
        let metadata=try InstallationAuthorityMetadata(json:metadataBytes)
        guard metadata.scheme.rawValue==journal.publicDescriptor["scheme"],let sig=Data(base64Encoded:journal.publicDescriptor["sig_pub"]!),let kem=Data(base64Encoded:journal.publicDescriptor["kem_pub"]!) else{throw FreshSecureStageError.changed}
        let challenge=Data("aux.fresh.secure-stage.continuity.v1".utf8)
        let authority:AuxCapturedCommandAuthority
        switch metadata.scheme {
        case .p256:
            let signer=try ExistingP256SigningAuthority(metadata:metadata,privateRepresentation:payloads["signing"]!,expectedPublicKey:sig)
            guard try signer.verifies(signature:signer.signature(for:challenge),challenge:challenge) else{throw FreshSecureStageError.changed}
            authority=try .p256(metadata:metadata,signingPrivate:payloads["signing"]!,signingPublic:sig,kemPrivate:payloads["kem"]!,kemPublic:kem,wrappedRoot:payloads["wrappedRoot"]!)
        case .pq:
            guard #available(macOS 26.0, *) else{throw FreshSecureStageError.record}
            let signer=try ExistingPqSigningAuthority(metadata:metadata,privateRepresentation:payloads["signing"]!,expectedPublicKey:sig)
            guard try signer.verifies(signature:signer.signature(for:challenge),challenge:challenge) else{throw FreshSecureStageError.changed}
            authority=try .pq(metadata:metadata,signingPrivate:payloads["signing"]!,signingPublic:sig,kemPrivate:payloads["kem"]!,kemPublic:kem,wrappedRoot:payloads["wrappedRoot"]!)
        }
        // Constructor already imports exact public authority and opens strict v2 wrap.
        let reply=try strictEnvelopeObject(Data(AuxInstallationCommandCore(context:.installed(authority)).run(command:"dk-unwrap").utf8))
        guard Set(reply.keys)==["dk"],let text=reply["dk"] as? String,let root=Data(base64Encoded:text),root.count==32 else{throw FreshSecureStageError.changed}
    }
}
