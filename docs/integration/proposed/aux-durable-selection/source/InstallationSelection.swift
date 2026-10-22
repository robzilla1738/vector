// External descriptor selection only. No consumer/admission/Keychain mutation.
import Foundation
import CryptoKit

enum InstallationSelectionError:Error {case malformed,stale,wrongPhase,wrongTerminal,unknownPointer,uninitialized}
func selectionHash(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
func selectionEncode<T:Encodable>(_ value:T)throws->Data{let encoder=JSONEncoder();encoder.outputFormatting=[.sortedKeys,.withoutEscapingSlashes];let data=try encoder.encode(value);guard data.count<=16_384 else{throw InstallationSelectionError.malformed};return data}
func selectionValidHash(_ text:String)->Bool{text.count==64 && text.allSatisfy{"0123456789abcdef".contains($0)}}
struct InstallationSelectionGeneration:Codable,Equatable {
    let generationId:String
    let stateIdentityVersion:Int
    // Content anchors only; this component does not inspect a filesystem cohort.
    let contentManifestSha256:String
    let installationCandidateSha256:String
    func validate()throws {guard let id=UUID(uuidString:generationId),id.uuidString==generationId,[1,2].contains(stateIdentityVersion),selectionValidHash(contentManifestSha256),selectionValidHash(installationCandidateSha256)else{throw InstallationSelectionError.malformed}}
}
struct InstallationSelectionPreparation {
    let previous:InstallationSelectionGeneration
    let candidate:InstallationSelectionGeneration
    let transactionId:String
    let terminalJournalSha256:String
    let selectorBindingsSha256:String
    private init(previous:InstallationSelectionGeneration,candidate:InstallationSelectionGeneration,terminal:CapturedTerminalCommandContext) {
        self.previous=previous;self.candidate=candidate;transactionId=terminal.evidence.transactionId;terminalJournalSha256=terminal.evidence.journalSha256;selectorBindingsSha256=terminal.evidence.selectorBindingsSha256
    }
    static func existing(previous:InstallationSelectionGeneration,candidate:InstallationSelectionGeneration,checkpoint:StoredInstallationCheckpoint,terminal:CapturedTerminalCommandContext)throws->Self {
        try previous.validate();try candidate.validate()
        guard previous.generationId != candidate.generationId,candidate.stateIdentityVersion==2,checkpoint.journal.phase == .ready,
              try checkpoint.journal.checkpoint().journalSha256==checkpoint.sha256,terminal.evidence.mode=="existing-migration",
              terminal.evidence.transactionId==checkpoint.journal.transactionId,terminal.evidence.journalSha256==checkpoint.sha256,
              candidate.installationCandidateSha256==checkpoint.journal.candidateSha256 else{throw InstallationSelectionError.wrongTerminal}
        let bindingHash=selectionHash(try selectionEncode(checkpoint.journal.bindings))
        guard bindingHash==terminal.evidence.selectorBindingsSha256 else{throw InstallationSelectionError.wrongTerminal}
        return .init(previous:previous,candidate:candidate,terminal:terminal)
    }
}
struct InstallationSelectionRecord:Codable {
    enum Phase:String,Codable {case prepared,selectIntent,selected,rollbackIntent,rolledBack,blocked}
    let format:String
    let transactionId:String
    let previous:InstallationSelectionGeneration
    let candidate:InstallationSelectionGeneration
    let terminalJournalSha256:String
    let selectorBindingsSha256:String
    var revision:Int
    var phase:Phase
    func encoded()throws->Data{try validate();return try selectionEncode(self)}
    func validate()throws {
        try previous.validate();try candidate.validate()
        guard format=="aux.install.selection.transaction.v1",let id=UUID(uuidString:transactionId),id.uuidString==transactionId,
              previous.generationId != candidate.generationId,candidate.stateIdentityVersion==2,selectionValidHash(terminalJournalSha256),selectionValidHash(selectorBindingsSha256),revision>=0,revision<=1_000_000 else{throw InstallationSelectionError.malformed}
    }
    static func decode(_ bytes:Data)throws->Self{
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","transactionId","previous","candidate","terminalJournalSha256","selectorBindingsSha256","revision","phase"]else{throw InstallationSelectionError.malformed}
        for key in ["previous","candidate"]{guard let row=object[key] as? [String:Any],Set(row.keys)==["generationId","stateIdentityVersion","contentManifestSha256","installationCandidateSha256"]else{throw InstallationSelectionError.malformed}}
        let value=try JSONDecoder().decode(Self.self,from:bytes);guard try value.encoded()==bytes else{throw InstallationSelectionError.malformed};return value
    }
    func authenticate(_ terminal:CapturedTerminalCommandContext)throws {
        guard terminal.evidence.mode=="existing-migration",terminal.evidence.transactionId==transactionId,terminal.evidence.journalSha256==terminalJournalSha256,terminal.evidence.selectorBindingsSha256==selectorBindingsSha256 else{throw InstallationSelectionError.wrongTerminal}
    }
}
struct StoredInstallationSelection {
    let record:InstallationSelectionRecord
    let sha256:String
    // This describes an external pointer only. No state2 acceptance is emitted.
    let state2LaunchAuthorized=false
    let writerAdmissionVerified=false
    let authorityProvenanceVerified=false
}
