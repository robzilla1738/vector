// External migration-tool source only. No registration, Security executor or state I/O.
import Foundation
import CryptoKit

enum AuxCredentialCopyError:Error {case label,review,capture,checkpoint,phase}
func credentialCopyHash(_ data:Data)->String{SHA256.hash(data:data).map{String(format:"%02x",$0)}.joined()}
enum CapturedAuxCredentialRow {case missing,bytes(Data),inaccessible(Int32),invalid}
enum CapturedAuxCredentialAddStatus {case added,duplicate,failure(Int32)}
// Deliberately no update/delete method and no original/default-group reader.
protocol AuxCopyOnlyCredentialBoundary {
    func addTarget(_ target:AuxSecureStoreSelector,bytes:Data)throws->CapturedAuxCredentialAddStatus
    func readSource(_ source:AuxSecureStoreSelector)->CapturedAuxCredentialRow
    func readTarget(_ target:AuxSecureStoreSelector)->CapturedAuxCredentialRow
}
struct CapturedHistoricalAuxCredentialBinding {
    // Explicit source-version review, never probing both spellings as fallback.
    enum SuffixVersion:String,Codable {case originalLogicalLabelsMappedInsideAux,auxLogicalLabelsMappedInsideAux}
    static let scope="dbca8cbbce80cb5eb3f2f89043330556fdbf2350f3c057a69d6e10e6b3d11476"
    static let group="9F2JXY8TCK.dev.aux.dp."+scope
    let source:AuxSecureStoreSelector;let target:AuxSecureStoreSelector
    let logicalKeyHash:String;let suffixVersion:SuffixVersion
    private init(source:AuxSecureStoreSelector,target:AuxSecureStoreSelector,logicalKeyHash:String,suffixVersion:SuffixVersion){self.source=source;self.target=target;self.logicalKeyHash=logicalKeyHash;self.suffixVersion=suffixVersion}
    // This creates a selector candidate from public static evidence. It is NOT
    // entitlement, row ownership, user approval or exclusive writer provenance.
    static func reviewedDisposable(logicalKey:String,suffixVersion:SuffixVersion)throws->Self {
        guard AuxSourceKnownLogicalKeyFamilies.reviewedV2().allows(logicalKey)else{throw AuxCredentialCopyError.label}
        var old=logicalKey
        if suffixVersion == .originalLogicalLabelsMappedInsideAux && old.hasPrefix("aux.") {old="aside."+old.dropFirst(4)}
        let original="aux."+scope+"."+old
        let target=try ReviewedAuxSecureStoreScope(scope:scope,accessGroup:group,sourceKnownFamilies:.reviewedV2()).selector(logicalKey)
        let source=AuxSecureStoreSelector(service:original,account:original,accessGroup:group)
        guard source != target else{throw AuxCredentialCopyError.review}
        return .init(source:source,target:target,logicalKeyHash:credentialCopyHash(Data(logicalKey.utf8)),suffixVersion:suffixVersion)
    }
    var sha256:String {
        let fields=["format":"aux.captured.credential-binding.v1","scope":Self.scope,"logicalKeyHash":logicalKeyHash,"suffixVersion":suffixVersion.rawValue,"sourceService":source.service,"sourceAccount":source.account,"sourceGroup":source.accessGroup,"targetService":target.service,"targetAccount":target.account,"targetGroup":target.accessGroup]
        return credentialCopyHash(try! JSONSerialization.data(withJSONObject:fields,options:[.sortedKeys,.withoutEscapingSlashes]))
    }
}
struct AuxCredentialCopyJournal:Codable,Equatable {
    enum Phase:String,Codable {case draft,intent,verified,blocked}
    let format:String;let transactionId:String;let bindingHash:String;let payloadHash:String;let payloadBytes:Int
    var phase:Phase;var revision:Int;var reason:String?
    func canonicalBytes()throws->Data {let e=JSONEncoder();e.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];return try e.encode(self)}
}
// Captured bytes only. This type expressly does not certify fsync, provenance or custody.
struct CapturedCredentialCopyCheckpoint {
    fileprivate let bytes:Data
    init(capturedCanonicalBytes:Data)throws {
        guard capturedCanonicalBytes.count<=16_384 else{throw AuxCredentialCopyError.checkpoint}
        let value=try JSONDecoder().decode(AuxCredentialCopyJournal.self,from:capturedCanonicalBytes)
        guard try value.canonicalBytes()==capturedCanonicalBytes else{throw AuxCredentialCopyError.checkpoint};bytes=capturedCanonicalBytes
    }
}
enum AuxCredentialCopyOutcome {case verified(AuxCredentialCopyJournal),unresolved(AuxCredentialCopyJournal),blocked(AuxCredentialCopyJournal),refused}
final class PreparedCapturedAuxCredentialCopy {
    private let binding:CapturedHistoricalAuxCredentialBinding
    private let payload:Data // Never encoded, written to disk or returned in receipts.
    private let lock=NSRecursiveLock()
    private var journal:AuxCredentialCopyJournal
    private var addAvailable:Bool
    private init(binding:CapturedHistoricalAuxCredentialBinding,payload:Data,journal:AuxCredentialCopyJournal,addAvailable:Bool){self.binding=binding;self.payload=payload;self.journal=journal;self.addAvailable=addAvailable}
    private static func bytes(_ row:CapturedAuxCredentialRow)throws->Data {
        guard case .bytes(let data)=row,data.count<=16_384 else{throw AuxCredentialCopyError.capture};return data
    }
    static func prepare(binding:CapturedHistoricalAuxCredentialBinding,source:CapturedAuxCredentialRow,target:CapturedAuxCredentialRow)throws->Self {
        let payload=try bytes(source)
        guard case .missing=target else{throw AuxCredentialCopyError.capture}
        return .init(binding:binding,payload:payload,journal:.init(format:"aux.credential.copy-only.v1",transactionId:UUID().uuidString.lowercased(),bindingHash:binding.sha256,payloadHash:credentialCopyHash(payload),payloadBytes:payload.count,phase:.draft,revision:0,reason:nil),addAvailable:true)
    }
    // Restart receives fresh explicit captures; hash-only journal cannot restore
    // a lost secret. Any restored record is observation-only, even a draft.
    static func restore(binding:CapturedHistoricalAuxCredentialBinding,capturedJournal:Data,source:CapturedAuxCredentialRow)throws->Self {
        let checkpoint=try CapturedCredentialCopyCheckpoint(capturedCanonicalBytes:capturedJournal)
        let j=try JSONDecoder().decode(AuxCredentialCopyJournal.self,from:checkpoint.bytes),payload=try bytes(source)
        guard j.format=="aux.credential.copy-only.v1",UUID(uuidString:j.transactionId)?.uuidString.lowercased()==j.transactionId,j.bindingHash==binding.sha256,
              j.payloadHash==credentialCopyHash(payload),j.payloadBytes==payload.count,(0...3).contains(j.revision),
              (j.phase != .draft || j.revision==0),(j.phase != .intent || j.revision==1),(j.phase != .verified || (1...2).contains(j.revision)),
              (j.phase != .blocked || (j.revision>=1 && ["source-changed-or-unavailable","target-conflict","target-unavailable","verified-target-missing","target-not-absent","add-duplicate","add-failed"].contains(j.reason ?? ""))),(j.phase == .blocked || j.reason==nil) else{throw AuxCredentialCopyError.checkpoint}
        return .init(binding:binding,payload:payload,journal:j,addAvailable:false)
    }
    func checkpointBytes()throws->Data {lock.lock();defer{lock.unlock()};return try journal.canonicalBytes()}
    // Host must durably write/read back draft, then intent before attemptAdd.
    // Matching captured bytes are not themselves a claim of durable storage.
    func prepareIntent(afterDraft checkpoint:CapturedCredentialCopyCheckpoint)throws->AuxCredentialCopyJournal {
        lock.lock();defer{lock.unlock()}
        guard addAvailable,journal.phase == .draft,try checkpoint.bytes==journal.canonicalBytes()else{throw AuxCredentialCopyError.phase}
        journal.phase = .intent;journal.revision += 1;return journal
    }
    private func blocked(_ reason:String)->AuxCredentialCopyOutcome {journal.phase = .blocked;journal.revision += 1;journal.reason=reason;addAvailable=false;return .blocked(journal)}
    private func observe(_ source:CapturedAuxCredentialRow,_ target:CapturedAuxCredentialRow)->AuxCredentialCopyOutcome {
        if journal.phase == .blocked{return .blocked(journal)}
        guard case .bytes(let old)=source,old.count==journal.payloadBytes,credentialCopyHash(old)==journal.payloadHash else{return blocked("source-changed-or-unavailable")}
        switch target {
        case .missing:return journal.phase == .verified ? blocked("verified-target-missing"):.unresolved(journal)
        case .bytes(let current):
            guard current.count==journal.payloadBytes,credentialCopyHash(current)==journal.payloadHash else{return blocked("target-conflict")}
            if journal.phase != .verified {journal.phase = .verified;journal.revision += 1};journal.reason=nil;addAvailable=false;return .verified(journal)
        case .inaccessible,.invalid:return blocked("target-unavailable")
        }
    }
    func attemptAdd(afterIntent checkpoint:CapturedCredentialCopyCheckpoint,boundary:AuxCopyOnlyCredentialBoundary)throws->AuxCredentialCopyOutcome {
        lock.lock();defer{lock.unlock()}
        guard addAvailable,journal.phase == .intent,try checkpoint.bytes==journal.canonicalBytes()else{return .refused}
        addAvailable=false // Consume BEFORE executor: errors and reentry never replay.
        let source=boundary.readSource(binding.source),target=boundary.readTarget(binding.target)
        guard case .bytes(let current)=source,current==payload else{return blocked("source-changed-or-unavailable")}
        guard case .missing=target else{return blocked("target-not-absent")}
        let status:CapturedAuxCredentialAddStatus
        do{status=try boundary.addTarget(binding.target,bytes:payload)}catch{return .unresolved(journal)}
        switch status {
        case .duplicate:return blocked("add-duplicate")
        case .failure:return blocked("add-failed")
        case .added:return observe(boundary.readSource(binding.source),boundary.readTarget(binding.target))
        }
    }
    // Restart/unknown-outcome reconciliation is read-only and never calls Add.
    func reconcile(source:CapturedAuxCredentialRow,target:CapturedAuxCredentialRow)->AuxCredentialCopyOutcome {
        lock.lock();defer{lock.unlock()};addAvailable=false
        return observe(source,target)
    }
}
