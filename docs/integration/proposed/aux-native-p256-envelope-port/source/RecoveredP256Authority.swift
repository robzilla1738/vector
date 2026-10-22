// Reconstructed from observed import/agreement call sites, not original source.
// Deliberately accepts existing representations only. No generate/init/reset or
// Keychain/query API is present. Importing an enclave key may require authority;
// that branch must not execute without separate authorization.
import Foundation
import CryptoKit

struct ExistingP256Authority {
    private enum Handle { case software(P256.KeyAgreement.PrivateKey), enclave(SecureEnclave.P256.KeyAgreement.PrivateKey) }
    private let handle: Handle
    let publicKey: Data
    init(metadata: InstallationAuthorityMetadata, privateRepresentation: Data, expectedPublicKey: Data) throws {
        guard metadata.scheme == .p256 else { throw EnvelopePortError.pqNotRecovered }
        switch metadata.storage {
        case .software:
            guard privateRepresentation.count == 32 else { throw EnvelopePortError.malformedRecord }
            let key = try P256.KeyAgreement.PrivateKey(rawRepresentation: privateRepresentation) //0x3c534
            handle = .software(key); publicKey = key.publicKey.x963Representation
        case .secureEnclave:
            guard !privateRepresentation.isEmpty, privateRepresentation.count <= 16_384 else { throw EnvelopePortError.malformedRecord }
            let key = try SecureEnclave.P256.KeyAgreement.PrivateKey(dataRepresentation: privateRepresentation, authenticationContext: nil) //0x3c7d8
            handle = .enclave(key); publicKey = key.publicKey.x963Representation
        }
        guard publicKey == expectedPublicKey else { throw EnvelopePortError.authorityMismatch }
    }
    func wrappingKey(peer: Data, context: Data) throws -> SymmetricKey {
        let peerKey = try P256.KeyAgreement.PublicKey(x963Representation: peer)
        let shared: SharedSecret
        switch handle {
        case .software(let key): shared = try key.sharedSecretFromKeyAgreement(with: peerKey) //0x3d554
        case .enclave(let key): shared = try key.sharedSecretFromKeyAgreement(with: peerKey) //0x3d614
        }
        return shared.hkdfDerivedSymmetricKey(using: SHA256.self, salt: Data(), sharedInfo: context, outputByteCount: 32) //0x3d840/0x3daf4
    }
    var publicFingerprint: String { SHA256.hash(data: publicKey).map { String(format:"%02x",$0) }.joined() }
}

func openP256Envelope(_ envelope: P256DkEnvelope, authority: ExistingP256Authority, context: Data) throws -> Data {
    let key = try authority.wrappingKey(peer: envelope.ephemeralPublicKey, context: context)
    let box = try ChaChaPoly.SealedBox(nonce: ChaChaPoly.Nonce(data: envelope.nonce), ciphertext: envelope.ciphertextAndTag.dropLast(16), tag: envelope.ciphertextAndTag.suffix(16))
    let root = try ChaChaPoly.open(box, using: key, authenticating: context) // Original CryptoKit container API; per-scheme call routing is audited separately.
    guard root.count == 32 else { throw EnvelopePortError.rootMismatch }; return root
}
