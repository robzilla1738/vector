// Pure v2 target progress; no disk record grants native admission or authority.
import Foundation

enum NativeFreshTargetError:Error{case record,binding,phase,checkpoint,consumed}
struct NativeFreshTargetJournal:Codable,Equatable {
    enum Phase:String,Codable{case draft,intent,awaitingReadback,ready,blocked}
    let format:String;let transactionId:String;let reservationSha256:String
    let policySha256:String;let scope:String;let initialJournalSha256:String
    var revision:Int;var phase:Phase;var intended:[String];var verified:[String]
    var lastAddStatus:Int32?;var failure:String?
    func validate()throws {
        func hash(_ value:String)->Bool{value.utf8.count==64 && value.utf8.allSatisfy{(48...57).contains($0)||(97...102).contains($0)}}
        guard format=="aux.install.native-fresh.targets-journal.v2",UUID(uuidString:transactionId)?.uuidString==transactionId,
              [reservationSha256,policySha256,scope,initialJournalSha256].allSatisfy(hash),revision>=0,revision<=1_000_000,
              intended==Array(nativeFreshBootstrapRoles.prefix(intended.count)),verified==Array(nativeFreshBootstrapRoles.prefix(verified.count)),
              intended.count<=4,verified.count<=intended.count,intended.count-verified.count<=1,
              failure==nil || (phase == .blocked && !failure!.isEmpty && failure!.utf8.count<=128)else{throw NativeFreshTargetError.record}
        switch phase {
        case .draft:guard intended==verified,verified.count<4,lastAddStatus==nil,failure==nil else{throw NativeFreshTargetError.record}
        case .intent:guard intended.count==verified.count+1,lastAddStatus != 0,failure==nil else{throw NativeFreshTargetError.record}
        case .awaitingReadback:guard intended.count==verified.count+1,lastAddStatus==0,failure==nil else{throw NativeFreshTargetError.record}
        case .ready:guard verified==nativeFreshBootstrapRoles,lastAddStatus==nil,failure==nil else{throw NativeFreshTargetError.record}
        case .blocked:guard failure != nil else{throw NativeFreshTargetError.record}
        }
    }
    func encoded()throws->Data{try validate();let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];let bytes=try encoder.encode(self);guard bytes.count<=16_384 else{throw NativeFreshTargetError.record};return bytes}
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes),required:Set<String>=["format","transactionId","reservationSha256","policySha256","scope","initialJournalSha256","revision","phase","intended","verified"]
        guard required.isSubset(of:Set(object.keys)),Set(object.keys).isSubset(of:required.union(["lastAddStatus","failure"]))else{throw NativeFreshTargetError.record}
        let journal=try JSONDecoder().decode(Self.self,from:bytes);try journal.validate();return journal
    }
}
enum NativeFreshTargetPreparation{case intended(NativeFreshTargetJournal),unresolved,blocked(NativeFreshTargetJournal)}
enum NativeFreshReadyObservation{case usable,unresolved,blocked(String)}
enum NativeFreshTargetObservation{case advanced(NativeFreshTargetJournal),unresolved,blocked(NativeFreshTargetJournal)}
enum NativeFreshTargetTransaction {
    static func initial(_ initial:NativeFreshBootstrapJournal,sha256:String)throws->NativeFreshTargetJournal {
        try initial.validate();guard try nativeBootstrapHash(initial.encoded())==sha256 else{throw NativeFreshTargetError.binding}
        let journal=NativeFreshTargetJournal(format:"aux.install.native-fresh.targets-journal.v2",transactionId:initial.transactionId,reservationSha256:initial.reservationSha256,policySha256:initial.policySha256,scope:initial.scope,initialJournalSha256:sha256,revision:0,phase:.draft,intended:[],verified:[],lastAddStatus:nil,failure:nil)
        try journal.validate();return journal
    }
    static func validateBinding(_ journal:NativeFreshTargetJournal,initial:NativeFreshBootstrapJournal,initialSha256:String)throws {
        try journal.validate();try initial.validate()
        guard try nativeBootstrapHash(initial.encoded())==initialSha256,journal.initialJournalSha256==initialSha256,journal.transactionId==initial.transactionId,journal.reservationSha256==initial.reservationSha256,journal.policySha256==initial.policySha256,journal.scope==initial.scope else{throw NativeFreshTargetError.binding}
    }
    static func block(_ journal:NativeFreshTargetJournal,_ reason:String)->NativeFreshTargetJournal{var next=journal;next.revision += 1;next.phase = .blocked;next.failure=reason;return next}
    private static func failure(_ journal:NativeFreshTargetJournal,initial:NativeFreshBootstrapJournal,captured:[String:AuxNativeFreshTargetRead],pendingMayExist:Bool)->String? {
        guard Set(captured.keys)==Set(nativeFreshBootstrapRoles)else{return "capture-inventory-mismatch"}
        for row in nativeFreshBootstrapRoles {
            let required=journal.verified.contains(row),pending=pendingMayExist && journal.intended.last==row
            switch captured[row]! {
            case .absent:if required{return "verified-missing:"+row}
            case .bytes(let bytes):if (!required && !pending) || bytes.isEmpty || bytes.count>16_384 || nativeBootstrapHash(bytes) != initial.targetHashes[row]{return "collision-or-change:"+row}
            case .unavailable:continue // Not absence, success or permanent corruption.
            case .invalid:return "invalid:"+row
            }
        };return nil
    }
    private static func unavailable(_ captured:[String:AuxNativeFreshTargetRead])->Bool {
        captured.values.contains{if case .unavailable=$0{return true};return false}
    }
    static func intend(_ journal:NativeFreshTargetJournal,initial:NativeFreshBootstrapJournal,captured:[String:AuxNativeFreshTargetRead])throws->NativeFreshTargetPreparation {
        try journal.validate();guard journal.phase == .draft else{throw NativeFreshTargetError.phase}
        if let reason=failure(journal,initial:initial,captured:captured,pendingMayExist:false){return .blocked(block(journal,reason))}
        if unavailable(captured){return .unresolved}
        var next=journal;next.revision += 1;next.phase = .intent;next.intended.append(nativeFreshBootstrapRoles[next.verified.count]);return .intended(next)
    }
    static func recordAdd(_ journal:NativeFreshTargetJournal,status:AuxNativeFreshTargetAddStatus)throws->NativeFreshTargetJournal {
        try journal.validate();guard journal.phase == .intent,journal.lastAddStatus==nil else{throw NativeFreshTargetError.phase}
        var next=journal;next.revision += 1
        switch status{case .added:next.phase = .awaitingReadback;next.lastAddStatus=0;case .duplicate:next.lastAddStatus = -25299;case .failed(let code):guard code != 0 else{throw NativeFreshTargetError.record};next.lastAddStatus=code}
        try next.validate();return next
    }
    // Loaded intent/awaiting-readback is OBSERVATION ONLY. Pending absence never
    // authorizes a new ticket/Add; matching bytes do not claim who wrote them.
    static func observe(_ journal:NativeFreshTargetJournal,initial:NativeFreshBootstrapJournal,captured:[String:AuxNativeFreshTargetRead])throws->NativeFreshTargetObservation {
        try journal.validate();guard journal.phase == .intent || journal.phase == .awaitingReadback else{throw NativeFreshTargetError.phase}
        if let reason=failure(journal,initial:initial,captured:captured,pendingMayExist:true){return .blocked(block(journal,reason))}
        if unavailable(captured){return .unresolved}
        guard case .bytes=captured[journal.intended.last!]! else{return .unresolved}
        var next=journal;next.revision += 1;next.verified.append(next.intended.last!);next.lastAddStatus=nil;next.phase=next.verified.count==4 ? .ready:.draft
        return .advanced(next)
    }
    static func readyObservation(_ journal:NativeFreshTargetJournal,initial:NativeFreshBootstrapJournal,captured:[String:AuxNativeFreshTargetRead])throws->NativeFreshReadyObservation {
        try journal.validate();guard journal.phase == .ready else{throw NativeFreshTargetError.phase}
        if let reason=failure(journal,initial:initial,captured:captured,pendingMayExist:false){return .blocked(reason)}
        return unavailable(captured) ? .unresolved:.usable
    }
}
