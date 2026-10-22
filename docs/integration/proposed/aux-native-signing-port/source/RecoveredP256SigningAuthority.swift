// Existing signing authority only. No factory, storage I/O or command dispatcher.
import Foundation
import CryptoKit

struct ExistingP256SigningAuthority {
    private enum Handle {
        case software(P256.Signing.PrivateKey)
        case enclave(SecureEnclave.P256.Signing.PrivateKey)
    }
    private let handle: Handle
    let publicKey: Data
    init(metadata: InstallationAuthorityMetadata, privateRepresentation: Data, expectedPublicKey: Data) throws {
        guard metadata.scheme == .p256 else { throw EnvelopePortError.unsupportedAuthority }
        switch metadata.storage {
        case .software:
            let key = try P256.Signing.PrivateKey(rawRepresentation:privateRepresentation) // 0x40f58
            handle = .software(key); publicKey = key.publicKey.x963Representation
        case .secureEnclave:
            let key = try SecureEnclave.P256.Signing.PrivateKey(dataRepresentation:privateRepresentation, authenticationContext:nil) // 0x4133c
            handle = .enclave(key); publicKey = key.publicKey.x963Representation
        }
        guard publicKey == expectedPublicKey else { throw EnvelopePortError.authorityMismatch }
    }
    var publicKeyBase64: String { publicKey.base64EncodedString() }
    func signature(for challenge: Data) throws -> Data {
        // Original calls the DataProtocol overload, not Digest. CryptoKit hashes
        // P256 input internally. Do not prehash, add a domain or convert to P1363.
        switch handle {
        case .software(let key): return try key.signature(for:challenge).derRepresentation // 0x40fc0/0x41028
        case .enclave(let key): return try key.signature(for:challenge).derRepresentation // 0x4142c/0x4163c
        }
    }
    func signatureReply(for challenge: Data) throws -> [String:String] {
        ["signature":try signature(for:challenge).base64EncodedString()]
    }
    func verifies(signature: Data, challenge: Data) throws -> Bool {
        let key = try P256.Signing.PublicKey(x963Representation:publicKey)
        return key.isValidSignature(try P256.Signing.ECDSASignature(derRepresentation:signature), for:challenge)
    }
}
