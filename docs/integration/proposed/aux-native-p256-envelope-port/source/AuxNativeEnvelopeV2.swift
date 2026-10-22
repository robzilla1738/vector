// New explicit-format writer/reader using original CryptoKit primitives.
// No legacy context selection, state access or installation key creation.
import Foundation
import CryptoKit

enum AuxNativeEnvelopeV2 {
    static let context = Data("aux.wrap.dk.v2".utf8)
    static func open(_ envelope: P256DkEnvelope, authority: ExistingP256Authority) throws -> Data {
        guard envelope.version == .auxV2 else { throw EnvelopePortError.unsupportedFormat }
        return try openP256Envelope(envelope, authority: authority, context: context)
    }
    static func wrap(root: Data, existingPublicKey: Data) throws -> P256DkEnvelope {
        guard root.count == 32 else { throw EnvelopePortError.rootMismatch }
        let publicKey = try P256.KeyAgreement.PublicKey(x963Representation: existingPublicKey)
        let ephemeral = P256.KeyAgreement.PrivateKey() // Per-envelope ephemeral only, NEVER installation authority.
        let shared = try ephemeral.sharedSecretFromKeyAgreement(with: publicKey)
        let key = shared.hkdfDerivedSymmetricKey(using: SHA256.self, salt: Data(), sharedInfo: context, outputByteCount: 32)
        let sealed = try ChaChaPoly.seal(root, using: key, authenticating: context)
        let nonce = sealed.nonce.withUnsafeBytes { Data($0) }
        return try P256DkEnvelope(version: .auxV2, ephemeralPublicKey: ephemeral.publicKey.x963Representation, nonce: nonce, ciphertextAndTag: sealed.ciphertext + sealed.tag)
    }
}
