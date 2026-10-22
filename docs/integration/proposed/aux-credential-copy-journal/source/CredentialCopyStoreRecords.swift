import Foundation

enum AuxCredentialCopyStoreError:Error {case unsafePath,unsafeMetadata,io(Int32),busy,staleHead,invalidSuccessor,corruptCheckpoint}
struct StoredAuxCredentialCopyCheckpoint {
    let journal:AuxCredentialCopyJournal;let sha256:String
    fileprivate let bytes:Data
    fileprivate init(journal:AuxCredentialCopyJournal,sha256:String,bytes:Data){self.journal=journal;self.sha256=sha256;self.bytes=bytes}
    func capturedCheckpoint()throws->CapturedCredentialCopyCheckpoint {try .init(capturedCanonicalBytes:bytes)}
}
struct AuxCredentialCopyStoreHead:Codable {
    let format:String;let transactionId:String;let revision:Int;let file:String;let sha256:String
}
enum AuxCredentialCopyStoreRules {
    static func hash(_ text:String)->Bool{text.utf8.count==64 && text.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}
    static func decode(_ bytes:Data)throws->AuxCredentialCopyJournal {
        let object=try strictEnvelopeObject(bytes)
        let base:Set<String>=["format","transactionId","bindingHash","payloadHash","payloadBytes","phase","revision"]
        guard Set(object.keys)==base || Set(object.keys)==base.union(["reason"])else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        let j=try JSONDecoder().decode(AuxCredentialCopyJournal.self,from:bytes)
        guard try j.canonicalBytes()==bytes,j.format=="aux.credential.copy-only.v1",
              UUID(uuidString:j.transactionId)?.uuidString.lowercased()==j.transactionId,
              hash(j.bindingHash),hash(j.payloadHash),(0...16_384).contains(j.payloadBytes),(0...3).contains(j.revision),
              (j.phase != .draft || j.revision==0),(j.phase != .intent || j.revision==1),
              (j.phase != .verified || (1...2).contains(j.revision)),
              (j.phase != .blocked || j.revision>=1),
              j.phase == .blocked ? ["source-changed-or-unavailable","target-conflict","target-unavailable","verified-target-missing","target-not-absent","add-duplicate","add-failed"].contains(j.reason ?? ""):j.reason==nil else{throw AuxCredentialCopyStoreError.corruptCheckpoint}
        return j
    }
    static func successor(_ next:AuxCredentialCopyJournal,_ old:AuxCredentialCopyJournal?)throws {
        _ = try decode(next.canonicalBytes())
        guard let old else{guard next.phase == .draft,next.revision==0 else{throw AuxCredentialCopyStoreError.invalidSuccessor};return}
        guard next.format==old.format,next.transactionId==old.transactionId,next.bindingHash==old.bindingHash,
              next.payloadHash==old.payloadHash,next.payloadBytes==old.payloadBytes,next.revision==old.revision+1 else{throw AuxCredentialCopyStoreError.invalidSuccessor}
        let allowed:Bool
        switch (old.phase,next.phase) {
        case (.draft,.intent),(.draft,.verified),(.draft,.blocked),(.intent,.verified),(.intent,.blocked),(.verified,.blocked):allowed=true
        default:allowed=false
        }
        guard allowed else{throw AuxCredentialCopyStoreError.invalidSuccessor}
    }
}
