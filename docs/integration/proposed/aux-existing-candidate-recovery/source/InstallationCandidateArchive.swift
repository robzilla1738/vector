// External-only ciphertext/public archive; never encodes a candidate's private rows.
import Foundation
import CryptoKit

enum InstallationCandidateRecoveryError:Error { case invalidArchive, originalChanged, wrongBinding }
struct InstallationCandidateArchive {
    let wrappedRootV2:Data
    let signingPublicKey:Data
    let kemPublicKey:Data
    let sourceChannel:String
    let originalRowHashes:[String:String]
    let candidateSha256:String
    private static func hash(_ bytes:Data)->String { SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined() }
    private func body()->[String:Any] { ["format":"aux.install.candidate.archive.v1","wrappedRootV2":wrappedRootV2.base64EncodedString(),"signingPublicKey":signingPublicKey.base64EncodedString(),"kemPublicKey":kemPublicKey.base64EncodedString(),"sourceChannel":sourceChannel,"originalRowHashes":originalRowHashes,"candidateSha256":candidateSha256] }
    func encoded()throws->Data {
        var object=body();object["archiveSha256"]=Self.hash(try JSONSerialization.data(withJSONObject:object,options:[.sortedKeys,.withoutEscapingSlashes]))
        let bytes=try JSONSerialization.data(withJSONObject:object,options:[.sortedKeys,.withoutEscapingSlashes]);guard bytes.count<=16_384 else{throw InstallationCandidateRecoveryError.invalidArchive};return bytes
    }
    init(candidate:PreparedInstallationCandidate)throws {
        guard candidate.sameRootVerified,candidate.signingContinuityVerified,!candidate.persistencePerformed,!candidate.commitAuthorized else{throw InstallationCandidateRecoveryError.wrongBinding}
        wrappedRootV2=candidate.wrappedRootV2;signingPublicKey=candidate.signingPublicKey;kemPublicKey=candidate.kemPublicKey;sourceChannel=candidate.sourceChannel;originalRowHashes=candidate.originalRowHashes;candidateSha256=try migrationCandidateDigest(candidate)
        _ = try Self.decode(encoded())
    }
    private init(wrapped:Data,signing:Data,kem:Data,channel:String,hashes:[String:String],digest:String) {wrappedRootV2=wrapped;signingPublicKey=signing;kemPublicKey=kem;sourceChannel=channel;originalRowHashes=hashes;candidateSha256=digest}
    static func decode(_ bytes:Data)throws->Self {
        let object=try strictEnvelopeObject(bytes)
        guard Set(object.keys)==["format","wrappedRootV2","signingPublicKey","kemPublicKey","sourceChannel","originalRowHashes","candidateSha256","archiveSha256"],object["format"] as? String=="aux.install.candidate.archive.v1",
              let channel=object["sourceChannel"] as? String,["normal","canary"].contains(channel),let hashes=object["originalRowHashes"] as? [String:String],Set(hashes.keys)==Set(InstallationRow.allCases.map(\.rawValue)),
              let digest=object["candidateSha256"] as? String,let archiveHash=object["archiveSha256"] as? String else{throw InstallationCandidateRecoveryError.invalidArchive}
        func validHash(_ hash:String)->Bool{hash.count==64 && hash.allSatisfy{"0123456789abcdef".contains($0)}}
        guard hashes.values.allSatisfy(validHash),validHash(digest),validHash(archiveHash)else{throw InstallationCandidateRecoveryError.invalidArchive}
        func data(_ key:String)throws->Data{guard let string=object[key] as? String,let decoded=Data(base64Encoded:string),!decoded.isEmpty,decoded.base64EncodedString()==string else{throw InstallationCandidateRecoveryError.invalidArchive};return decoded}
        let archive=Self(wrapped:try data("wrappedRootV2"),signing:try data("signingPublicKey"),kem:try data("kemPublicKey"),channel:channel,hashes:hashes,digest:digest)
        guard archive.signingPublicKey.count<=8192,archive.kemPublicKey.count<=8192,
              Self.hash(try JSONSerialization.data(withJSONObject:archive.body(),options:[.sortedKeys,.withoutEscapingSlashes]))==archiveHash,
              try archive.encoded()==bytes else{throw InstallationCandidateRecoveryError.invalidArchive}
        return archive
    }
}
