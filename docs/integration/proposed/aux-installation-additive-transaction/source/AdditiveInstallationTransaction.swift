// External pure state machine. Captures and durable acknowledgements are supplied
// by a separately reviewed caller; this file executes no Security or filesystem I/O.
import Foundation
import CryptoKit

enum AdditiveTransactionError:Error { case malformedJournal, wrongCandidate, wrongCheckpoint, wrongPhase, invalidBindings, originalChanged, targetNotAbsent, inconsistentCapture }
struct TransactionSelector:Codable,Equatable {
    let service:String;let account:String;let accessGroup:String
}
struct InstallationRowBinding:Codable {
    let row:String;let original:TransactionSelector;let target:TransactionSelector
}
struct AssertedDurableCheckpoint { let journalSha256:String } // Assertion, not proof of fsync.
struct AdditiveInstallationJournal:Codable {
    enum Phase:String,Codable { case draft,intent,awaitingReadback,ready,blocked,abandoned }
    let format:String
    let transactionId:String
    let candidateSha256:String
    let bindings:[InstallationRowBinding]
    let originalHashes:[String:String]
    let targetHashes:[String:String]
    var revision:Int
    var phase:Phase
    var intended:[String]
    var verified:[String]
    var failure:String?
    func encoded()throws->Data {
        let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        let bytes=try encoder.encode(self);guard bytes.count<=16_384 else{throw AdditiveTransactionError.malformedJournal};return bytes
    }
    func checkpoint()throws->AssertedDurableCheckpoint { .init(journalSha256:transactionHash(try encoded())) }
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","transactionId","candidateSha256","bindings","originalHashes","targetHashes","revision","phase","intended","verified"] || Set(object.keys)==["format","transactionId","candidateSha256","bindings","originalHashes","targetHashes","revision","phase","intended","verified","failure"],
              let bindings=object["bindings"] as? [[String:Any]],bindings.count==4 else { throw AdditiveTransactionError.malformedJournal }
        for binding in bindings {
            guard Set(binding.keys)==["row","original","target"] else { throw AdditiveTransactionError.malformedJournal }
            for key in ["original","target"] { guard let selector=binding[key] as? [String:Any],Set(selector.keys)==["service","account","accessGroup"] else { throw AdditiveTransactionError.malformedJournal } }
        }
        let journal=try JSONDecoder().decode(Self.self,from:bytes);try journal.validate();return journal
    }
    fileprivate func validate()throws {
        let roles=transactionRoles
        func hash(_ value:String)->Bool { value.count==64 && value.allSatisfy{"0123456789abcdef".contains($0)} }
        guard format=="aux.install.additive.journal.v1",UUID(uuidString:transactionId) != nil,revision>=0,revision<=1_000_000,
              hash(candidateSha256),Set(originalHashes.keys)==Set(roles),Set(targetHashes.keys)==Set(roles),
              originalHashes.values.allSatisfy(hash),targetHashes.values.allSatisfy(hash),
              intended==Array(roles.prefix(intended.count)),verified==Array(roles.prefix(verified.count)),
              intended.count<=4,verified.count<=intended.count,intended.count-verified.count<=1,
              failure==nil || (failure!.utf8.count<=256 && phase == .blocked) else { throw AdditiveTransactionError.malformedJournal }
        try validateBindings(bindings)
        switch phase {
        case .draft:guard intended.count==verified.count && verified.count<4 else{throw AdditiveTransactionError.malformedJournal}
        case .intent,.awaitingReadback:guard intended.count==verified.count+1 else{throw AdditiveTransactionError.malformedJournal}
        case .ready:guard verified.count==4 else{throw AdditiveTransactionError.malformedJournal}
        case .blocked,.abandoned:break
        }
    }
}
struct PreparedAddOnlyRequest {
    let transactionId:String;let row:String;let selector:TransactionSelector
    let payload:Data
    let operation="add-only-if-absent"
    let intentCheckpointSha256:String
    let overwritePermitted=false
    let deletePermitted=false
}
struct CapturedReadbackReceipt {
    let transactionId:String;let candidateSha256:String;let journalSha256:String
    let capturedOriginalHashes:[String:String];let capturedTargetHashes:[String:String]
    let persistencePerformedByThisTool=false
    let activeSelectionPerformed=false
    let authorityProvenanceVerified=false
}
private let transactionRoles=["metadata","signing","kem","wrappedRoot"]
private func transactionHash(_ data:Data)->String { SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined() }
private func validateBindings(_ bindings:[InstallationRowBinding])throws {
    guard bindings.map(\.row)==transactionRoles else{throw AdditiveTransactionError.invalidBindings}
    var original=Set<String>(),target=Set<String>()
    func identity(_ selector:TransactionSelector)throws->String {
        guard [selector.service,selector.account,selector.accessGroup].allSatisfy({ !$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0) })else{throw AdditiveTransactionError.invalidBindings}
        return try String(data:JSONEncoder().encode([selector.service,selector.account,selector.accessGroup]),encoding:.utf8)!
    }
    for binding in bindings {
        guard binding.target.service.hasPrefix("aux."),binding.target.account.hasPrefix("aux."),
              ![binding.target.service,binding.target.account,binding.target.accessGroup].contains(where:{$0.lowercased().contains("aside")}),
              original.insert(try identity(binding.original)).inserted,target.insert(try identity(binding.target)).inserted else{throw AdditiveTransactionError.invalidBindings}
    }
    guard original.isDisjoint(with:target)else{throw AdditiveTransactionError.invalidBindings}
}
private func payloads(_ candidate:PreparedInstallationCandidate)->[String:Data] {
    ["metadata":candidate.metadataBytes,"signing":candidate.signingRepresentation,"kem":candidate.kemRepresentation,"wrappedRoot":candidate.wrappedRootV2]
}
private func candidateHash(_ candidate:PreparedInstallationCandidate)throws->String {
    var fields=payloads(candidate).mapValues(transactionHash)
    for (role,hash) in candidate.originalRowHashes { fields["original."+role]=hash }
    fields["channel"]=candidate.sourceChannel;fields["format"]=candidate.format
    fields["signingPublic"]=transactionHash(candidate.signingPublicKey);fields["kemPublic"]=transactionHash(candidate.kemPublicKey)
    return transactionHash(try JSONSerialization.data(withJSONObject:fields,options:[.sortedKeys,.withoutEscapingSlashes]))
}
private func captured(_ rows:CapturedInstallationRows,_ role:String)->CapturedInstallRead { rows.result(InstallationRow(rawValue:role)!) }
private func checked(_ journal:AdditiveInstallationJournal,_ checkpoint:AssertedDurableCheckpoint)throws {
    try journal.validate();guard try journal.checkpoint().journalSha256==checkpoint.journalSha256 else{throw AdditiveTransactionError.wrongCheckpoint}
}
private func blocked(_ journal:AdditiveInstallationJournal,_ reason:String)->AdditiveInstallationJournal { var next=journal;next.revision += 1;next.phase = .blocked;next.failure=reason;return next }
private func originalFailure(_ journal:AdditiveInstallationJournal,_ rows:CapturedInstallationRows)->String? {
    for role in transactionRoles {
        switch captured(rows,role) {
        case .data(let data):if data.count>16_384 || transactionHash(data) != journal.originalHashes[role]{return "original-changed:"+role}
        case .missing:return "original-missing:"+role
        case .securityFailure(let status):return "original-blocked:"+role+":"+String(status)
        case .invalidSuccessResult:return "original-invalid:"+role
        }
    };return nil
}

enum AdditiveInstallationTransaction {
    // Pure cross-component binding check; does not authorize persistence/admission.
    static func validateCandidateBinding(_ journal:AdditiveInstallationJournal,candidate:PreparedInstallationCandidate)throws {
        try journal.validate()
        guard candidate.sameRootVerified,candidate.signingContinuityVerified,!candidate.persistencePerformed,!candidate.commitAuthorized,
              try candidateHash(candidate)==journal.candidateSha256,
              candidate.originalRowHashes==journal.originalHashes,
              payloads(candidate).mapValues(transactionHash)==journal.targetHashes else{throw AdditiveTransactionError.wrongCandidate}
    }
    static func prepare(candidate:PreparedInstallationCandidate,transactionId:String,bindings:[InstallationRowBinding],originals:CapturedInstallationRows,targets:CapturedInstallationRows)throws->AdditiveInstallationJournal {
        guard candidate.sameRootVerified,candidate.signingContinuityVerified,!candidate.persistencePerformed,!candidate.commitAuthorized else{throw AdditiveTransactionError.wrongCandidate}
        let journal=AdditiveInstallationJournal(format:"aux.install.additive.journal.v1",transactionId:transactionId,candidateSha256:try candidateHash(candidate),bindings:bindings,originalHashes:candidate.originalRowHashes,targetHashes:payloads(candidate).mapValues(transactionHash),revision:0,phase:.draft,intended:[],verified:[],failure:nil)
        try journal.validate()
        if let failure=originalFailure(journal,originals){return blocked(journal,failure)}
        for role in transactionRoles { switch captured(targets,role) {
        case .missing:break
        case .data:return blocked(journal,"target-collision:"+role)
        case .securityFailure(let status):return blocked(journal,"target-blocked:"+role+":"+String(status))
        case .invalidSuccessResult:return blocked(journal,"target-invalid:"+role)
        }};return journal
    }
    static func intendNext(_ journal:AdditiveInstallationJournal,checkpoint:AssertedDurableCheckpoint,originals:CapturedInstallationRows,targets:CapturedInstallationRows)throws->AdditiveInstallationJournal {
        try checked(journal,checkpoint);guard journal.phase == .draft else{throw AdditiveTransactionError.wrongPhase}
        let reconciled=try reconcile(journal,checkpoint:checkpoint,originals:originals,targets:targets)
        if reconciled.phase == .blocked{return reconciled}
        var next=journal;next.revision += 1;next.phase = .intent;next.failure=nil;next.intended.append(transactionRoles[next.verified.count]);return next
    }
    static func addRequest(_ journal:AdditiveInstallationJournal,checkpoint:AssertedDurableCheckpoint,candidate:PreparedInstallationCandidate,originals:CapturedInstallationRows,targets:CapturedInstallationRows)throws->PreparedAddOnlyRequest {
        try checked(journal,checkpoint);guard journal.phase == .intent,try candidateHash(candidate)==journal.candidateSha256,
            payloads(candidate).mapValues(transactionHash)==journal.targetHashes,candidate.originalRowHashes==journal.originalHashes else{throw AdditiveTransactionError.wrongCandidate}
        if originalFailure(journal,originals) != nil{throw AdditiveTransactionError.originalChanged}
        let role=journal.intended.last!
        for entry in transactionRoles {
            switch captured(targets,entry) {
            case .missing:guard !journal.verified.contains(entry)else{throw AdditiveTransactionError.inconsistentCapture}
            case .data(let bytes):guard bytes.count<=16_384,journal.verified.contains(entry),transactionHash(bytes)==journal.targetHashes[entry]else{throw AdditiveTransactionError.targetNotAbsent}
            default:throw AdditiveTransactionError.inconsistentCapture
            }
        }
        return .init(transactionId:journal.transactionId,row:role,selector:journal.bindings.first{$0.row==role}!.target,payload:payloads(candidate)[role]!,intentCheckpointSha256:checkpoint.journalSha256)
    }
    static func capturedAddStatus(_ journal:AdditiveInstallationJournal,checkpoint:AssertedDurableCheckpoint,status:OSStatus)throws->AdditiveInstallationJournal {
        try checked(journal,checkpoint);guard journal.phase == .intent else{throw AdditiveTransactionError.wrongPhase}
        guard status==0 else{return blocked(journal,"add-status:"+journal.intended.last!+":"+String(status))}
        var next=journal;next.revision += 1;next.phase = .awaitingReadback;return next
    }
    // Explicit restart/readback reconciliation of an unblocked journal only.
    // A blocked failure is terminal except for abandon, even if later captures
    // look favorable. Only a journaled intent can explain a matching new target.
    static func reconcile(_ journal:AdditiveInstallationJournal,checkpoint:AssertedDurableCheckpoint,originals:CapturedInstallationRows,targets:CapturedInstallationRows)throws->AdditiveInstallationJournal {
        try checked(journal,checkpoint);guard journal.phase != .abandoned,journal.phase != .blocked else{throw AdditiveTransactionError.wrongPhase}
        if let failure=originalFailure(journal,originals){return blocked(journal,failure)}
        var observed=journal.verified
        for role in transactionRoles { switch captured(targets,role) {
        case .data(let bytes):
            guard bytes.count<=16_384,journal.intended.contains(role),transactionHash(bytes)==journal.targetHashes[role]else{return blocked(journal,"target-unknown:"+role)}
            if !observed.contains(role){observed.append(role)}
        case .missing:
            if journal.verified.contains(role){return blocked(journal,"target-lost:"+role)}
            if journal.phase == .awaitingReadback && journal.intended.contains(role){return blocked(journal,"target-missing-after-success:"+role)}
        case .securityFailure(let status):return blocked(journal,"target-blocked:"+role+":"+String(status))
        case .invalidSuccessResult:return blocked(journal,"target-invalid:"+role)
        }}
        var next=journal;next.revision += 1;next.verified=observed;next.failure=nil
        next.phase=observed.count==4 ? .ready:(observed.count==journal.intended.count ? .draft:.intent)
        return next
    }
    static func verifiedReceipt(_ journal:AdditiveInstallationJournal,checkpoint:AssertedDurableCheckpoint,originals:CapturedInstallationRows,targets:CapturedInstallationRows)throws->CapturedReadbackReceipt {
        try checked(journal,checkpoint);guard journal.phase == .ready,originalFailure(journal,originals)==nil else{throw AdditiveTransactionError.wrongPhase}
        for role in transactionRoles {guard case .data(let bytes)=captured(targets,role),bytes.count<=16_384,transactionHash(bytes)==journal.targetHashes[role]else{throw AdditiveTransactionError.inconsistentCapture}}
        return .init(transactionId:journal.transactionId,candidateSha256:journal.candidateSha256,journalSha256:checkpoint.journalSha256,capturedOriginalHashes:journal.originalHashes,capturedTargetHashes:journal.targetHashes)
    }
    static func abandon(_ journal:AdditiveInstallationJournal,checkpoint:AssertedDurableCheckpoint)throws->AdditiveInstallationJournal {
        try checked(journal,checkpoint);var next=journal;next.revision += 1;next.phase = .abandoned;next.failure=nil;return next
    }
}
