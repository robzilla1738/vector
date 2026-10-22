import Foundation

enum CskHandoffStoreError:Error {case unsafePath,unsafeMetadata,io(Int32),busy,staleHead,invalidSuccessor,corruptCheckpoint}
struct CskHandoffJournal:Codable,Equatable {
    enum Phase:String,Codable {case draft,intent,verified,blocked}
    let format:String;let transactionId:String;let bindingHash:String
    let sourceHash:String;let targetHash:String;let sourceBytes:Int;let targetBytes:Int
    var phase:Phase;var revision:Int;var reason:String?
    func canonicalBytes()throws->Data {let e=JSONEncoder();e.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];return try e.encode(self)}
}
struct StoredCskHandoffCheckpoint {
    let journal:CskHandoffJournal;let sha256:String
    fileprivate init(journal:CskHandoffJournal,sha256:String){self.journal=journal;self.sha256=sha256}
}
struct CskHandoffHead:Codable {let format:String;let transactionId:String;let revision:Int;let file:String;let sha256:String}
enum CskHandoffStoreRules {
    static func hash(_ text:String)->Bool{text.utf8.count==64 && text.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}
    static func decode(_ bytes:Data)throws->CskHandoffJournal {
        let object=try strictEnvelopeObject(bytes)
        let base:Set<String>=["format","transactionId","bindingHash","sourceHash","targetHash","sourceBytes","targetBytes","phase","revision"]
        guard Set(object.keys)==base || Set(object.keys)==base.union(["reason"])else{throw CskHandoffStoreError.corruptCheckpoint}
        let j=try JSONDecoder().decode(CskHandoffJournal.self,from:bytes)
        guard try j.canonicalBytes()==bytes,j.format=="aux.csk.prepared-handoff.v2",
              UUID(uuidString:j.transactionId)?.uuidString.lowercased()==j.transactionId,
              hash(j.bindingHash),hash(j.sourceHash),hash(j.targetHash),j.sourceHash != j.targetHash,
              (1...16_384).contains(j.sourceBytes),(1...16_384).contains(j.targetBytes),(0...3).contains(j.revision),
              (j.phase != .draft || j.revision==0),(j.phase != .intent || j.revision==1),
              (j.phase != .verified || (1...2).contains(j.revision)),
              (j.phase != .blocked || j.revision>=1),
              j.phase == .blocked ? ["source-changed-or-unavailable","target-conflict-or-unauthenticated","target-unavailable","verified-target-missing","target-not-absent","add-duplicate","add-failed"].contains(j.reason ?? ""):j.reason==nil else{throw CskHandoffStoreError.corruptCheckpoint}
        return j
    }
    static func successor(_ next:CskHandoffJournal,_ old:CskHandoffJournal?)throws {
        _ = try decode(next.canonicalBytes())
        guard let old else{guard next.phase == .draft,next.revision==0 else{throw CskHandoffStoreError.invalidSuccessor};return}
        guard next.format==old.format,next.transactionId==old.transactionId,next.bindingHash==old.bindingHash,
              next.sourceHash==old.sourceHash,next.targetHash==old.targetHash,next.sourceBytes==old.sourceBytes,next.targetBytes==old.targetBytes,next.revision==old.revision+1 else{throw CskHandoffStoreError.invalidSuccessor}
        let allowed:Bool
        switch (old.phase,next.phase) {
        case (.draft,.intent),(.draft,.verified),(.draft,.blocked),(.intent,.verified),(.intent,.blocked),(.verified,.blocked):allowed=true
        default:allowed=false
        }
        guard allowed else{throw CskHandoffStoreError.invalidSuccessor}
    }
}
