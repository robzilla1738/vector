// Compile-only: no Secure Enclave/MLDSA operation has been executed.
import Foundation
import CryptoKit

@available(macOS 26.0, *)
struct ExistingPqSigningAuthority {
    private let key: SecureEnclave.MLDSA65.PrivateKey
    let publicKey: Data
    init(metadata: InstallationAuthorityMetadata, privateRepresentation: Data, expectedPublicKey: Data) throws {
        guard metadata.scheme == .pq else { throw EnvelopePortError.unsupportedAuthority }
        // Original checks scheme before storage; pq_v1 selects MLDSA65 (not P256)
        // and imports the existing enclave representation with nil auth context.
        key = try SecureEnclave.MLDSA65.PrivateKey(dataRepresentation:privateRepresentation, authenticationContext:nil) // 0x40e9c
        publicKey = key.publicKey.rawRepresentation // 0x42690/0x42698
        guard publicKey == expectedPublicKey else { throw EnvelopePortError.authorityMismatch }
    }
    var publicKeyBase64: String { publicKey.base64EncodedString() }
    func signature(for challenge: Data) throws -> Data {
        // Original DataProtocol overload, no context argument or application hash.
        try key.signature(for:challenge) // 0x40ec0; returned Data goes straight to base64.
    }
    func signatureReply(for challenge: Data) throws -> [String:String] {
        ["signature":try signature(for:challenge).base64EncodedString()]
    }
    func verifies(signature: Data, challenge: Data) throws -> Bool {
        try MLDSA65.PublicKey(rawRepresentation:publicKey).isValidSignature(signature, for:challenge)
    }
}
