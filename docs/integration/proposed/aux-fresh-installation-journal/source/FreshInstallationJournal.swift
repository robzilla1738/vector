// Fresh-only pure reducer. No Security calls, filesystem I/O or activation.
import Foundation
import CryptoKit

enum FreshJournalError: Error { case malformed, binding, observation, candidate, checkpoint, phase }
struct FreshTargetSelector: Codable, Equatable {
    let service:String; let account:String; let accessGroup:String
}
struct FreshTargetBinding: Codable, Equatable { let row:String; let target:FreshTargetSelector }
enum CallerCapturedFreshRead { case absent, bytes(Data), unavailable(Int32), invalid }
struct CallerCapturedFreshTargets {
    let metadata:CallerCapturedFreshRead; let signing:CallerCapturedFreshRead
    let kem:CallerCapturedFreshRead; let wrappedRoot:CallerCapturedFreshRead
    func value(_ role:String)->CallerCapturedFreshRead {
        switch role { case "metadata":return metadata;case "signing":return signing;case "kem":return kem;default:return wrappedRoot }
    }
}
// Explicit claims from a reviewed external admission boundary, not native proof.
struct CallerAssertedNeverUsedScopeReview {
    enum History { case neverUsed, knownExisting, unknown }
    enum CustodyAssertion { case exclusiveStoppedStartup, unavailable }
    let reviewId:String; let scope:String; let history:History; let custody:CustodyAssertion
    let legacyArtifacts:CallerCapturedFreshTargets
    func validate()throws {
        guard let uuid=UUID(uuidString:reviewId),uuid.uuidString==reviewId,freshHashValid(scope),
              history == .neverUsed,custody == .exclusiveStoppedStartup,
              freshRoles.allSatisfy({if case .absent=legacyArtifacts.value($0){return true};return false})
        else{throw FreshJournalError.observation}
    }
}
struct AssertedFreshDurableCheckpoint { let journalSha256:String } // Caller assertion, not fsync or writer custody proof.
struct FreshInstallationJournal: Codable {
    enum Phase:String,Codable { case draft,intent,awaitingReadback,ready,blocked }
    let format:String; let transactionId:String; let scope:String; let newScopeReviewId:String
    let candidateSha256:String; let bindings:[FreshTargetBinding]
    let publicDescriptor:[String:String]; let targetHashes:[String:String]
    let legacyObservedAbsentRoles:[String]
    let initialObservedAbsentRoles:[String] // Captured assertions; no original payload hashes exist.
    var revision:Int; var phase:Phase; var intended:[String]; var verified:[String]; var failure:String?
    func encoded()throws->Data {
        try validate();let e=JSONEncoder();e.outputFormatting=[.sortedKeys,.withoutEscapingSlashes]
        let data=try e.encode(self);guard data.count<=16_384 else{throw FreshJournalError.malformed};return data
    }
    func checkpoint()throws->AssertedFreshDurableCheckpoint { .init(journalSha256:freshJournalHash(try encoded())) }
    static func decode(_ data:Data)throws->Self {
        let o=try strictEnvelopeObject(data)
        let keys:Set<String>=["format","transactionId","scope","newScopeReviewId","candidateSha256","bindings","publicDescriptor","targetHashes","initialObservedAbsentRoles","legacyObservedAbsentRoles","revision","phase","intended","verified"]
        guard Set(o.keys)==keys || Set(o.keys)==keys.union(["failure"]),let bindings=o["bindings"] as? [[String:Any]],bindings.count==4 else{throw FreshJournalError.malformed}
        for b in bindings { guard Set(b.keys)==["row","target"],let t=b["target"] as? [String:Any],Set(t.keys)==["service","account","accessGroup"] else{throw FreshJournalError.malformed} }
        let j=try JSONDecoder().decode(Self.self,from:data);try j.validate();return j
    }
    func validate()throws {
        guard format=="aux.install.fresh.journal.v1",let uuid=UUID(uuidString:transactionId),uuid.uuidString==transactionId,
              UUID(uuidString:newScopeReviewId)?.uuidString==newScopeReviewId,freshHashValid(scope),freshHashValid(candidateSha256),revision>=0,revision<=1_000_000,
              initialObservedAbsentRoles==freshRoles,legacyObservedAbsentRoles==freshRoles,Set(targetHashes.keys)==Set(freshRoles),targetHashes.values.allSatisfy(freshHashValid),
              Set(publicDescriptor.keys)==["scheme","sig_pub","kem_pub"], ["p256_v1","pq_v1"].contains(publicDescriptor["scheme"]!),
              ["sig_pub","kem_pub"].allSatisfy({ key in guard let s=publicDescriptor[key],let d=Data(base64Encoded:s)else{return false};return !d.isEmpty && d.count<=8192 && d.base64EncodedString()==s }),
              intended.count<=4,verified.count<=intended.count,intended.count-verified.count<=1,
              intended==Array(freshRoles.prefix(intended.count)),verified==Array(freshRoles.prefix(verified.count)),
              failure==nil || (phase == .blocked && !failure!.isEmpty && failure!.utf8.count<=128) else{throw FreshJournalError.malformed}
        try freshValidateBindings(bindings,scope:scope)
        switch phase {
        case .draft:guard intended==verified && verified.count<4 && failure==nil else{throw FreshJournalError.malformed}
        case .intent,.awaitingReadback:guard intended.count==verified.count+1 && failure==nil else{throw FreshJournalError.malformed}
        case .ready:guard verified==freshRoles && failure==nil else{throw FreshJournalError.malformed}
        case .blocked:guard failure != nil else{throw FreshJournalError.malformed}
        }
    }
}
let freshRoles=["metadata","signing","kem","wrappedRoot"]
func freshJournalHash(_ data:Data)->String { SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined() }
private func freshHashValid(_ s:String)->Bool { s.utf8.count==64 && s.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)} }
private func freshValidateBindings(_ bindings:[FreshTargetBinding],scope:String)throws {
    guard bindings.map(\.row)==freshRoles else{throw FreshJournalError.binding}
    var distinct=Set<String>()
    for b in bindings {
        let t=b.target
        guard [t.service,t.account,t.accessGroup].allSatisfy({ !$0.isEmpty && $0.utf8.count<=512 && !$0.utf8.contains(0) && !$0.lowercased().contains("aside") }),
              t.service.hasPrefix("aux."+scope+"."),t.account.hasPrefix("aux."+scope+"."),
              distinct.insert(try JSONEncoder().encode([t.service,t.account,t.accessGroup]).base64EncodedString()).inserted else{throw FreshJournalError.binding}
    }
}
private func freshPayloads(_ c:PreparedFreshAuxCohort)->[String:Data] { ["metadata":c.targetPayloads.metadata,"signing":c.targetPayloads.signing,"kem":c.targetPayloads.kem,"wrappedRoot":c.targetPayloads.wrappedRoot] }
private func freshCandidateHash(_ c:PreparedFreshAuxCohort)throws->String {
    guard c.sameRootVerified,c.signingContinuityVerified,!c.commitAuthorized,!c.persistencePerformed else{throw FreshJournalError.candidate}
    let hashes=freshPayloads(c).mapValues(freshJournalHash)
    guard hashes==c.targetPayloadHashes else{throw FreshJournalError.candidate}
    return freshJournalHash(try JSONSerialization.data(withJSONObject:["format":"aux.install.fresh.cohort.v1","targets":hashes,"public":c.publicDescriptor],options:[.sortedKeys,.withoutEscapingSlashes]))
}
struct FreshCreateOnlyRequest {
    let transactionId:String;let row:String;let selector:FreshTargetSelector;let payload:Data;let durableIntentSha256:String
    let operation="add-only-if-absent";let overwritePermitted=false;let deletePermitted=false
}
enum FreshIntentObservation {
    case advanced(FreshInstallationJournal) // Exact target observed; writer identity is unknown.
    case unresolved(FreshInstallationJournal) // Pending absent; no retry or revision advance.
    case blocked(FreshInstallationJournal)
}
enum CapturedFreshAddStatus { case added, duplicate, failed(Int32) }
enum FreshInstallationTransaction {
    static func prepare(candidate:PreparedFreshAuxCohort,transactionId:String,review:CallerAssertedNeverUsedScopeReview,bindings:[FreshTargetBinding],captured:CallerCapturedFreshTargets)throws->FreshInstallationJournal {
        try review.validate()
        // A blocked/unavailable read is not absence, and produces no fresh journal.
        guard freshRoles.allSatisfy({if case .absent=captured.value($0){return true};return false}) else{throw FreshJournalError.observation}
        let j=FreshInstallationJournal(format:"aux.install.fresh.journal.v1",transactionId:transactionId,scope:review.scope,newScopeReviewId:review.reviewId,candidateSha256:try freshCandidateHash(candidate),bindings:bindings,publicDescriptor:candidate.publicDescriptor,targetHashes:candidate.targetPayloadHashes,legacyObservedAbsentRoles:freshRoles,initialObservedAbsentRoles:freshRoles,revision:0,phase:.draft,intended:[],verified:[],failure:nil)
        try j.validate();return j
    }
    private static func checked(_ j:FreshInstallationJournal,_ checkpoint:AssertedFreshDurableCheckpoint)throws { try j.validate();guard try j.checkpoint().journalSha256==checkpoint.journalSha256 else{throw FreshJournalError.checkpoint} }
    private static func fail(_ j:FreshInstallationJournal,_ reason:String)->FreshInstallationJournal { var n=j;n.revision += 1;n.phase = .blocked;n.failure=reason;return n }
    private static func captureFailure(_ j:FreshInstallationJournal,_ captured:CallerCapturedFreshTargets,includingPending:Bool)->String? {
        for role in freshRoles {
            let shouldExist=j.verified.contains(role)||(includingPending && j.intended.last==role)
            switch captured.value(role) {
            case .absent:if shouldExist{return "missing:"+role}
            case .bytes(let bytes):if !shouldExist || bytes.count>16_384 || freshJournalHash(bytes) != j.targetHashes[role]{return "collision-or-change:"+role}
            case .unavailable:return "unavailable:"+role
            case .invalid:return "invalid:"+role
            }
        };return nil
    }
    static func intendNext(_ j:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,captured:CallerCapturedFreshTargets)throws->FreshInstallationJournal {
        try checked(j,checkpoint);guard j.phase == .draft else{throw FreshJournalError.phase}
        if let reason=captureFailure(j,captured,includingPending:false){return fail(j,reason)}
        var n=j;n.revision += 1;n.phase = .intent;n.intended.append(freshRoles[n.verified.count]);return n
    }
    static func addRequest(_ j:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,candidate:PreparedFreshAuxCohort,captured:CallerCapturedFreshTargets)throws->FreshCreateOnlyRequest {
        try checked(j,checkpoint);guard j.phase == .intent,try freshCandidateHash(candidate)==j.candidateSha256 else{throw FreshJournalError.candidate}
        guard captureFailure(j,captured,includingPending:false)==nil else{throw FreshJournalError.observation}
        let role=j.intended.last!,b=j.bindings.first{$0.row==role}!
        return .init(transactionId:j.transactionId,row:role,selector:b.target,payload:freshPayloads(candidate)[role]!,durableIntentSha256:checkpoint.journalSha256)
    }
    static func recordAdd(_ j:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,status:CapturedFreshAddStatus)throws->FreshInstallationJournal {
        try checked(j,checkpoint);guard j.phase == .intent else{throw FreshJournalError.phase}
        switch status {
        case .duplicate:return fail(j,"add-duplicate:"+j.intended.last!)
        case .failed:return fail(j,"add-failed:"+j.intended.last!)
        case .added:var n=j;n.revision += 1;n.phase = .awaitingReadback;return n
        }
    }
    static func readback(_ j:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,captured:CallerCapturedFreshTargets)throws->FreshInstallationJournal {
        try checked(j,checkpoint);guard j.phase == .awaitingReadback else{throw FreshJournalError.phase}
        if let reason=captureFailure(j,captured,includingPending:true){return fail(j,reason)}
        var n=j;n.revision += 1;n.verified.append(n.intended.last!);n.phase=n.verified.count==4 ? .ready:.draft;return n
    }
    // Observation-only recovery after crash between Add and status checkpoint.
    // Does not emit Add, infer writer identity or restore private candidate bytes.
    static func reconcileIntent(_ j:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint,captured:CallerCapturedFreshTargets)throws->FreshIntentObservation {
        try checked(j,checkpoint);guard j.phase == .intent else{throw FreshJournalError.phase}
        let pending=j.intended.last!
        for role in freshRoles {
            let shouldExist=j.verified.contains(role)||role==pending
            switch captured.value(role) {
            case .absent:
                if j.verified.contains(role){return .blocked(fail(j,"missing:"+role))}
            case .bytes(let bytes):
                if !shouldExist || bytes.count>16_384 || freshJournalHash(bytes) != j.targetHashes[role] {
                    return .blocked(fail(j,"collision-or-change:"+role))
                }
            case .unavailable:return .blocked(fail(j,"unavailable:"+role))
            case .invalid:return .blocked(fail(j,"invalid:"+role))
            }
        }
        if case .absent=captured.value(pending){return .unresolved(j)}
        var n=j;n.revision += 1;n.verified.append(pending);n.phase=n.verified.count==4 ? .ready:.draft
        return .advanced(n)
    }
    // Explicit abandonment policy when no later reconciliation is desired. Never replay Add.
    static func interruptIntent(_ j:FreshInstallationJournal,checkpoint:AssertedFreshDurableCheckpoint)throws->FreshInstallationJournal {
        try checked(j,checkpoint);guard j.phase == .intent else{throw FreshJournalError.phase};return fail(j,"interrupted-add-outcome-unknown")
    }
}
