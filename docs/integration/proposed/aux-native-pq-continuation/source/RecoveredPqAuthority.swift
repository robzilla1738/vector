// Source port of observed SE-MLKEM import/encapsulation/decapsulation only.
// COMPILE-ONLY evidence: none of these functions has been executed.
// No generate(), accessControl-key factory, Keychain query or authority fallback.
import Foundation
import CryptoKit

@available(macOS 26.0, *)
struct ExistingPqAuthority {
    private let key: SecureEnclave.MLKEM768.PrivateKey
    let publicKey: Data
    init(metadata: InstallationAuthorityMetadata, privateRepresentation: Data, expectedPublicKey: Data) throws {
        guard metadata.scheme == .pq, metadata.storage == .secureEnclave else { throw EnvelopePortError.unsupportedAuthority }
        guard !privateRepresentation.isEmpty, privateRepresentation.count <= 16_384 else { throw EnvelopePortError.malformedRecord }
        key = try SecureEnclave.MLKEM768.PrivateKey(dataRepresentation:privateRepresentation, authenticationContext:nil) // Original0x3c3f0.
        publicKey = key.publicKey.rawRepresentation // Original public getter/rawRepresentation0x39e44/0x39e4c.
        guard publicKey == expectedPublicKey else { throw EnvelopePortError.authorityMismatch }
    }
    var publicFingerprint: String { SHA256.hash(data:publicKey).map{String(format:"%02x",$0)}.joined() }
    func open(_ envelope: PqDkEnvelope, context: Data) throws -> Data {
        let wrappingKey = try key.decapsulate(envelope.encapsulatedKey) // Original0x3d000 directly returns SymmetricKey.
        let box = try ChaChaPoly.SealedBox(nonce:ChaChaPoly.Nonce(data:envelope.nonce), ciphertext:envelope.ciphertextAndTag.dropLast(16), tag:envelope.ciphertextAndTag.suffix(16))
        // Original return slot→frame+c8→open using:x2. No application HKDF.
        let root = try ChaChaPoly.open(box, using:wrappingKey, authenticating:context)
        guard root.count == 32 else { throw EnvelopePortError.rootMismatch }; return root
    }
    func wrapAuxV2(root: Data) throws -> PqDkEnvelope {
        guard root.count == 32 else { throw EnvelopePortError.rootMismatch }
        let result = try key.publicKey.encapsulate() // Original0x36c74/0x36c88. Existing authority public key only.
        // Original EncapsulationResult.sharedSecret0x382a4→seal using:x1 at0x38344.
        let sealed = try ChaChaPoly.seal(root, using:result.sharedSecret, authenticating:AuxNativePqEnvelopeV2.context)
        return try PqDkEnvelope(version:.auxV2, encapsulatedKey:result.encapsulated, nonce:sealed.nonce.withUnsafeBytes{Data($0)}, ciphertextAndTag:sealed.ciphertext+sealed.tag)
    }
}

@available(macOS 26.0, *)
enum AuxNativePqEnvelopeV2 {
    static let context = Data("aux.wrap.dk.v2".utf8) // PQ context is AAD; not an invented P256-style KDF.
    static func open(_ envelope: PqDkEnvelope, authority: ExistingPqAuthority) throws -> Data {
        guard envelope.version == .auxV2 else { throw EnvelopePortError.unsupportedFormat }
        return try authority.open(envelope, context:context)
    }
}
