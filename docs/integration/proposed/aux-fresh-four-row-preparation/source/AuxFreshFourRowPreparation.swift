// Inactive memory-only fresh cohort; not a migration receipt or storage writer.
import Foundation
import CryptoKit

struct FreshFourRowPayloads {
    let metadata: Data
    let signing: Data
    let kem: Data
    let wrappedRoot: Data
}
struct PreparedFreshAuxCohort {
    let targetPayloads: FreshFourRowPayloads // Sensitive: never log or use as a receipt.
    let publicDescriptor: [String:String]
    let targetPayloadHashes: [String:String]
    let sameRootVerified: Bool
    let signingContinuityVerified: Bool
    let persistencePerformed = false
    let absenceProvenanceVerified = false
    let commitAuthorized = false
    fileprivate init(payloads: FreshFourRowPayloads, material: FreshAuthorityMaterial) {
        targetPayloads = payloads; publicDescriptor = material.initializationReply
        func digest(_ value:Data)->String { SHA256.hash(data:value).map{String(format:"%02x",$0)}.joined() }
        targetPayloadHashes = ["metadata":digest(payloads.metadata),"signing":digest(payloads.signing),"kem":digest(payloads.kem),"wrappedRoot":digest(payloads.wrappedRoot)]
        sameRootVerified = true; signingContinuityVerified = true
    }
}
enum AuxFreshFourRowPreparation {
    // Production-host wrapper supplies the actual capability policy; no CLI flags.
    // Invocation still requires independently enforced fresh admission/custody.
    static func prepareForCurrentHost(admission: CallerAssertedFreshAdmission) throws -> PreparedFreshAuxCohort {
        try admission.validate()
        let os26: Bool
        if #available(macOS 26.0, *) { os26 = true } else { os26 = false }
        let fresh = try AuxFreshInstallationFactory.prepare(admission:admission,secureEnclaveAvailable:SecureEnclave.isAvailable,macOS26Available:os26)
        return try prepareGeneratedMaterial(fresh)
    }
    // Trusted in-process fixture/integration seam. This is NOT an input parser.
    // Raw material possession does not prove new-scope absence or provenance.
    static func prepareGeneratedMaterial(_ fresh: FreshAuthorityMaterial) throws -> PreparedFreshAuxCohort {
        guard fresh.root.count == 32 else { throw EnvelopePortError.rootMismatch }
        let pq = fresh.kind == .enclavePq
        let metadataBytes = try JSONSerialization.data(withJSONObject:["scheme":pq ? "pq_v1":"p256_v1","key_storage":fresh.kind == .softwareP256 ? "software":"secure_enclave"],options:[.sortedKeys])
        let metadata = try InstallationAuthorityMetadata(json:metadataBytes)
        let challenge = Data("aux.fresh.authority.continuity.v2".utf8)
        let wrapped: Data
        switch fresh.kind {
        case .softwareP256, .enclaveP256:
            let signing = try ExistingP256SigningAuthority(metadata:metadata,privateRepresentation:fresh.signingPrivateRepresentation,expectedPublicKey:fresh.signingPublicRepresentation)
            let kem = try ExistingP256Authority(metadata:metadata,privateRepresentation:fresh.kemPrivateRepresentation,expectedPublicKey:fresh.kemPublicRepresentation)
            guard try signing.verifies(signature:signing.signature(for:challenge),challenge:challenge) else { throw EnvelopePortError.authorityMismatch }
            let envelope = try AuxNativeEnvelopeV2.wrap(root:fresh.root,existingPublicKey:kem.publicKey)
            guard try AuxNativeEnvelopeV2.open(envelope,authority:kem) == fresh.root else { throw EnvelopePortError.rootMismatch }
            wrapped = try envelope.auxJson()
            // Validate through actual strict Aux-v2 command authority constructor.
            _ = try AuxCapturedCommandAuthority.p256(metadata:metadata,signingPrivate:fresh.signingPrivateRepresentation,signingPublic:fresh.signingPublicRepresentation,kemPrivate:fresh.kemPrivateRepresentation,kemPublic:fresh.kemPublicRepresentation,wrappedRoot:wrapped)
        case .enclavePq:
            guard #available(macOS 26.0, *) else { throw EnvelopePortError.unsupportedAuthority }
            let signing = try ExistingPqSigningAuthority(metadata:metadata,privateRepresentation:fresh.signingPrivateRepresentation,expectedPublicKey:fresh.signingPublicRepresentation)
            let kem = try ExistingPqAuthority(metadata:metadata,privateRepresentation:fresh.kemPrivateRepresentation,expectedPublicKey:fresh.kemPublicRepresentation)
            guard try signing.verifies(signature:signing.signature(for:challenge),challenge:challenge) else { throw EnvelopePortError.authorityMismatch }
            let envelope = try kem.wrapAuxV2(root:fresh.root)
            guard try AuxNativePqEnvelopeV2.open(envelope,authority:kem) == fresh.root else { throw EnvelopePortError.rootMismatch }
            wrapped = try envelope.auxJson()
            _ = try AuxCapturedCommandAuthority.pq(metadata:metadata,signingPrivate:fresh.signingPrivateRepresentation,signingPublic:fresh.signingPublicRepresentation,kemPrivate:fresh.kemPrivateRepresentation,kemPublic:fresh.kemPublicRepresentation,wrappedRoot:wrapped)
        }
        return .init(payloads:.init(metadata:metadataBytes,signing:fresh.signingPrivateRepresentation,kem:fresh.kemPrivateRepresentation,wrappedRoot:wrapped),material:fresh)
    }
}
