// External, memory-only migration preparation. Never discovers or reads rows.
import Foundation
import CryptoKit

enum InstallationRow: String, CaseIterable { case metadata, signing, kem, wrappedRoot }
struct CapturedInstallationRows {
    let metadata: CapturedInstallRead
    let signing: CapturedInstallRead
    let kem: CapturedInstallRead
    let wrappedRoot: CapturedInstallRead
    func result(_ row:InstallationRow) -> CapturedInstallRead {
        switch row { case .metadata:return metadata;case .signing:return signing;case .kem:return kem;case .wrappedRoot:return wrappedRoot }
    }
}
struct BlockedInstallationRow { let row:InstallationRow;let status:OSStatus }
enum InstallationInspection {
    case allAbsent // Observation only: never permission to initialize.
    case partial(missing:[InstallationRow])
    case blocked([BlockedInstallationRow])
    case invalid
    case complete(CompleteCapturedInstallation)
}
struct CompleteCapturedInstallation {
    let authorityMetadata:InstallationAuthorityMetadata
    fileprivate let metadataBytes:Data
    fileprivate let signingBytes:Data
    fileprivate let kemBytes:Data
    fileprivate let wrappedBytes:Data
    fileprivate init(metadata:InstallationAuthorityMetadata, rows:[InstallationRow:Data]) {
        authorityMetadata=metadata;metadataBytes=rows[.metadata]!;signingBytes=rows[.signing]!;kemBytes=rows[.kem]!;wrappedBytes=rows[.wrappedRoot]!
    }
}
func inspectCapturedInstallation(_ rows:CapturedInstallationRows) -> InstallationInspection {
    var data:[InstallationRow:Data]=[:],missing:[InstallationRow]=[],blocked:[BlockedInstallationRow]=[];var invalid=false
    for row in InstallationRow.allCases {
        switch rows.result(row) {
        case .data(let bytes):
            if bytes.isEmpty || bytes.count>16_384 { invalid=true };data[row]=bytes
        case .missing:missing.append(row)
        case .securityFailure(let status):blocked.append(.init(row:row,status:status))
        case .invalidSuccessResult:invalid=true
        }
    }
    // Unknown access always takes precedence; never project it into absence.
    if !blocked.isEmpty { return .blocked(blocked) }
    if invalid { return .invalid }
    if missing.count==4 { return .allAbsent }
    if !missing.isEmpty { return .partial(missing:missing) }
    do {
        let metadata=try InstallationAuthorityMetadata(json:data[.metadata]!)
        switch metadata.scheme {
        case .p256:guard try P256DkEnvelope(json:data[.wrappedRoot]!).version == .legacyV1 else { return .invalid }
        case .pq:guard try PqDkEnvelope(json:data[.wrappedRoot]!).version == .legacyV1 else { return .invalid }
        }
        return .complete(.init(metadata:metadata,rows:data))
    } catch { return .invalid }
}

struct ExpectedInstallationPublicKeys { let signing:Data;let kem:Data }
struct PreparedInstallationCandidate {
    let format="aux.install.prepared.v2"
    let sourceChannel:String
    // Original authority metadata is unchanged; wrap version is an independent field.
    let metadataBytes:Data
    let signingRepresentation:Data
    let kemRepresentation:Data
    let wrappedRootV2:Data
    let originalRowHashes:[String:String]
    let signingPublicKey:Data
    let kemPublicKey:Data
    let signingContinuityVerified:Bool
    let sameRootVerified:Bool
    let persistencePerformed=false
    let authorityProvenanceVerified=false
    let commitAuthorized=false
    var publicCommandReply:[String:String] { ["scheme":scheme,"sig":signingPublicKey.base64EncodedString(),"kem":kemPublicKey.base64EncodedString()] }
    var initializationPublicReply:[String:String] { ["scheme":scheme,"sig_pub":signingPublicKey.base64EncodedString(),"kem_pub":kemPublicKey.base64EncodedString()] }
    private let scheme:String
    fileprivate init(snapshot:CompleteCapturedInstallation, channel:LegacyInstallationChannel, signingPublic:Data, kemPublic:Data, wrapped:Data) {
        sourceChannel=channel == .normal ? "normal":"canary"
        metadataBytes=snapshot.metadataBytes;signingRepresentation=snapshot.signingBytes;kemRepresentation=snapshot.kemBytes;wrappedRootV2=wrapped
        signingPublicKey=signingPublic;kemPublicKey=kemPublic;scheme=snapshot.authorityMetadata.scheme.rawValue
        signingContinuityVerified=true;sameRootVerified=true
        func digest(_ bytes:Data)->String { SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined() }
        originalRowHashes=["metadata":digest(snapshot.metadataBytes),"signing":digest(snapshot.signingBytes),"kem":digest(snapshot.kemBytes),"wrappedRoot":digest(snapshot.wrappedBytes)]
    }
}

// Explicit software lane used by synthetic checks. Hardware paths cannot be
// selected by passing different metadata to this function.
func prepareSoftwareP256Installation(_ snapshot:CompleteCapturedInstallation, channel:LegacyInstallationChannel, expected:ExpectedInstallationPublicKeys, verificationChallenge:Data) throws -> PreparedInstallationCandidate {
    guard snapshot.authorityMetadata.scheme == .p256, snapshot.authorityMetadata.storage == .software else { throw EnvelopePortError.unsupportedAuthority }
    return try prepareP256Captured(snapshot,channel:channel,expected:expected,verificationChallenge:verificationChallenge)
}

// COMPILE-ONLY in this proposal; no enclave import/sign/agreement has executed.
func prepareEnclaveP256Installation(_ snapshot:CompleteCapturedInstallation, channel:LegacyInstallationChannel, expected:ExpectedInstallationPublicKeys, verificationChallenge:Data) throws -> PreparedInstallationCandidate {
    guard snapshot.authorityMetadata.scheme == .p256, snapshot.authorityMetadata.storage == .secureEnclave else { throw EnvelopePortError.unsupportedAuthority }
    return try prepareP256Captured(snapshot,channel:channel,expected:expected,verificationChallenge:verificationChallenge)
}
private func prepareP256Captured(_ snapshot:CompleteCapturedInstallation, channel:LegacyInstallationChannel, expected:ExpectedInstallationPublicKeys, verificationChallenge:Data) throws -> PreparedInstallationCandidate {
    guard !verificationChallenge.isEmpty, verificationChallenge.count<=65_536 else { throw EnvelopePortError.malformedRecord }
    let signing=try ExistingP256SigningAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.signingBytes,expectedPublicKey:expected.signing)
    let kem=try ExistingP256Authority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.kemBytes,expectedPublicKey:expected.kem)
    let signature=try signing.signature(for:verificationChallenge)
    guard try signing.verifies(signature:signature,challenge:verificationChallenge) else { throw EnvelopePortError.authorityMismatch }
    let prepared=try prepareP256Rewrap(legacy:P256DkEnvelope(json:snapshot.wrappedBytes),channel:channel,authority:kem)
    guard prepared.rootVerified else { throw EnvelopePortError.rootMismatch }
    return PreparedInstallationCandidate(snapshot:snapshot,channel:channel,signingPublic:signing.publicKey,kemPublic:kem.publicKey,wrapped:try prepared.envelope.auxJson())
}

// COMPILE-ONLY; no PQ, enclave or KEM operation has executed in this proposal.
@available(macOS 26.0, *)
func preparePqInstallation(_ snapshot:CompleteCapturedInstallation, channel:LegacyInstallationChannel, expected:ExpectedInstallationPublicKeys, verificationChallenge:Data) throws -> PreparedInstallationCandidate {
    guard snapshot.authorityMetadata.scheme == .pq, snapshot.authorityMetadata.storage == .secureEnclave,
          !verificationChallenge.isEmpty, verificationChallenge.count<=65_536 else { throw EnvelopePortError.unsupportedAuthority }
    let signing=try ExistingPqSigningAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.signingBytes,expectedPublicKey:expected.signing)
    let kem=try ExistingPqAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.kemBytes,expectedPublicKey:expected.kem)
    guard try signing.verifies(signature:signing.signature(for:verificationChallenge),challenge:verificationChallenge) else { throw EnvelopePortError.authorityMismatch }
    let prepared=try preparePqRewrap(legacy:PqDkEnvelope(json:snapshot.wrappedBytes),channel:channel,authority:kem)
    guard prepared.rootVerified else { throw EnvelopePortError.rootMismatch }
    return PreparedInstallationCandidate(snapshot:snapshot,channel:channel,signingPublic:signing.publicKey,kemPublic:kem.publicKey,wrapped:try prepared.envelope.auxJson())
}

// Reviewed same-file continuation: only this source can invoke the fileprivate
// verified candidate constructor. No random wrapping occurs during recovery.
func recoverSoftwareP256Installation(_ rows:CapturedInstallationRows,archive:InstallationCandidateArchive,expectedCandidateSha256:String,verificationChallenge:Data)throws->PreparedInstallationCandidate {
    guard archive.candidateSha256==expectedCandidateSha256,
          case .complete(let snapshot)=inspectCapturedInstallation(rows),snapshot.authorityMetadata.scheme == .p256,snapshot.authorityMetadata.storage == .software,
          !verificationChallenge.isEmpty,verificationChallenge.count<=65_536 else{throw InstallationCandidateRecoveryError.wrongBinding}
    func digest(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
    let originals=["metadata":snapshot.metadataBytes,"signing":snapshot.signingBytes,"kem":snapshot.kemBytes,"wrappedRoot":snapshot.wrappedBytes]
    guard originals.mapValues(digest)==archive.originalRowHashes else{throw InstallationCandidateRecoveryError.originalChanged}
    let signing=try ExistingP256SigningAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.signingBytes,expectedPublicKey:archive.signingPublicKey)
    let kem=try ExistingP256Authority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.kemBytes,expectedPublicKey:archive.kemPublicKey)
    guard try signing.verifies(signature:signing.signature(for:verificationChallenge),challenge:verificationChallenge)else{throw EnvelopePortError.authorityMismatch}
    let channel:LegacyInstallationChannel=archive.sourceChannel == "normal" ? .normal:.canary
    let legacy=try P256DkEnvelope(json:snapshot.wrappedBytes),replacement=try P256DkEnvelope(json:archive.wrappedRootV2)
    guard replacement.version == .auxV2 else{throw EnvelopePortError.unsupportedFormat}
    var old=try openP256Envelope(legacy,authority:kem,context:channel.context)
    defer{old.resetBytes(in:0..<old.count)}
    var new=try AuxNativeEnvelopeV2.open(replacement,authority:kem)
    defer{new.resetBytes(in:0..<new.count)}
    guard old.count==32,new.count==32,zip(old,new).reduce(UInt8(0),{$0 | ($1.0 ^ $1.1)})==0 else{throw EnvelopePortError.rootMismatch}
    let candidate=PreparedInstallationCandidate(snapshot:snapshot,channel:channel,signingPublic:signing.publicKey,kemPublic:kem.publicKey,wrapped:archive.wrappedRootV2)
    guard try migrationCandidateDigest(candidate)==expectedCandidateSha256 else{throw InstallationCandidateRecoveryError.wrongBinding}
    return candidate
}

// COMPILE-ONLY explicit hardware lane; never selected by a software fallback.
func recoverEnclaveP256Installation(_ rows:CapturedInstallationRows,archive:InstallationCandidateArchive,expectedCandidateSha256:String,verificationChallenge:Data)throws->PreparedInstallationCandidate {
    guard archive.candidateSha256==expectedCandidateSha256,
          case .complete(let snapshot)=inspectCapturedInstallation(rows),snapshot.authorityMetadata.scheme == .p256,snapshot.authorityMetadata.storage == .secureEnclave,
          !verificationChallenge.isEmpty,verificationChallenge.count<=65_536 else{throw InstallationCandidateRecoveryError.wrongBinding}
    func digest(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
    let originals=["metadata":snapshot.metadataBytes,"signing":snapshot.signingBytes,"kem":snapshot.kemBytes,"wrappedRoot":snapshot.wrappedBytes]
    guard originals.mapValues(digest)==archive.originalRowHashes else{throw InstallationCandidateRecoveryError.originalChanged}
    let signing=try ExistingP256SigningAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.signingBytes,expectedPublicKey:archive.signingPublicKey)
    let kem=try ExistingP256Authority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.kemBytes,expectedPublicKey:archive.kemPublicKey)
    guard try signing.verifies(signature:signing.signature(for:verificationChallenge),challenge:verificationChallenge)else{throw EnvelopePortError.authorityMismatch}
    let channel:LegacyInstallationChannel=archive.sourceChannel == "normal" ? .normal:.canary
    let legacy=try P256DkEnvelope(json:snapshot.wrappedBytes),replacement=try P256DkEnvelope(json:archive.wrappedRootV2)
    guard replacement.version == .auxV2 else{throw EnvelopePortError.unsupportedFormat}
    var old=try openP256Envelope(legacy,authority:kem,context:channel.context)
    defer{old.resetBytes(in:0..<old.count)}
    var new=try AuxNativeEnvelopeV2.open(replacement,authority:kem)
    defer{new.resetBytes(in:0..<new.count)}
    guard old.count==32,new.count==32,zip(old,new).reduce(UInt8(0),{$0 | ($1.0 ^ $1.1)})==0 else{throw EnvelopePortError.rootMismatch}
    let candidate=PreparedInstallationCandidate(snapshot:snapshot,channel:channel,signingPublic:signing.publicKey,kemPublic:kem.publicKey,wrapped:archive.wrappedRootV2)
    guard try migrationCandidateDigest(candidate)==expectedCandidateSha256 else{throw InstallationCandidateRecoveryError.wrongBinding}
    return candidate
}

// COMPILE-ONLY macOS26 MLDSA65 + MLKEM768 existing-authority recovery.
// Uses original direct KEM output for ChaChaPoly; no P256 HKDF substitution.
@available(macOS 26.0, *)
func recoverPqInstallation(_ rows:CapturedInstallationRows,archive:InstallationCandidateArchive,expectedCandidateSha256:String,verificationChallenge:Data)throws->PreparedInstallationCandidate {
    guard archive.candidateSha256==expectedCandidateSha256,
          case .complete(let snapshot)=inspectCapturedInstallation(rows),snapshot.authorityMetadata.scheme == .pq,snapshot.authorityMetadata.storage == .secureEnclave,
          !verificationChallenge.isEmpty,verificationChallenge.count<=65_536 else{throw InstallationCandidateRecoveryError.wrongBinding}
    func digest(_ bytes:Data)->String{SHA256.hash(data:bytes).map{String(format:"%02x",$0)}.joined()}
    let originals=["metadata":snapshot.metadataBytes,"signing":snapshot.signingBytes,"kem":snapshot.kemBytes,"wrappedRoot":snapshot.wrappedBytes]
    guard originals.mapValues(digest)==archive.originalRowHashes else{throw InstallationCandidateRecoveryError.originalChanged}
    let signing=try ExistingPqSigningAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.signingBytes,expectedPublicKey:archive.signingPublicKey)
    let kem=try ExistingPqAuthority(metadata:snapshot.authorityMetadata,privateRepresentation:snapshot.kemBytes,expectedPublicKey:archive.kemPublicKey)
    guard try signing.verifies(signature:signing.signature(for:verificationChallenge),challenge:verificationChallenge)else{throw EnvelopePortError.authorityMismatch}
    let channel:LegacyInstallationChannel=archive.sourceChannel == "normal" ? .normal:.canary
    let legacy=try PqDkEnvelope(json:snapshot.wrappedBytes),replacement=try PqDkEnvelope(json:archive.wrappedRootV2)
    guard replacement.version == .auxV2 else{throw EnvelopePortError.unsupportedFormat}
    var old=try kem.open(legacy,context:channel.context)
    defer{old.resetBytes(in:0..<old.count)}
    var new=try AuxNativePqEnvelopeV2.open(replacement,authority:kem)
    defer{new.resetBytes(in:0..<new.count)}
    guard old.count==32,new.count==32,zip(old,new).reduce(UInt8(0),{$0 | ($1.0 ^ $1.1)})==0 else{throw EnvelopePortError.rootMismatch}
    let candidate=PreparedInstallationCandidate(snapshot:snapshot,channel:channel,signingPublic:signing.publicKey,kemPublic:kem.publicKey,wrapped:archive.wrappedRootV2)
    guard try migrationCandidateDigest(candidate)==expectedCandidateSha256 else{throw InstallationCandidateRecoveryError.wrongBinding}
    return candidate
}
