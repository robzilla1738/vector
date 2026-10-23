// Source-derived fresh-only component. No state reads, persistence or provenance proof.
import Foundation
import CryptoKit
import Security

enum FreshFactoryError: Error { case admissionRefused, accessControlFailed }
enum FreshRowObservation { case absent, present, unavailable, invalid }
struct CallerAssertedFreshAdmission {
    let scope: String
    let metadata: FreshRowObservation
    let signing: FreshRowObservation
    let kem: FreshRowObservation
    let wrappedRoot: FreshRowObservation
    let newScopeExplicitlyReviewed: Bool
    // Caller assertions cannot establish actual absence, custody or authorization.
    func validate() throws {
        guard newScopeExplicitlyReviewed, scope.utf8.count == 64,
              scope.utf8.allSatisfy({ (48...57).contains($0) || (97...102).contains($0) }),
              [metadata, signing, kem, wrappedRoot].allSatisfy({ if case .absent = $0 { return true }; return false })
        else { throw FreshFactoryError.admissionRefused }
    }
}
enum FreshAuthorityKind: Equatable { case softwareP256, enclaveP256, enclavePq }
struct FreshAuthorityMaterial {
    let kind: FreshAuthorityKind
    let root: Data
    let signingPrivateRepresentation: Data
    let kemPrivateRepresentation: Data
    let signingPublicRepresentation: Data
    let kemPublicRepresentation: Data
    let persistencePerformed = false
    let absenceProvenanceVerified = false
    var initializationReply: [String:String] {
        ["scheme":kind == .enclavePq ? "pq_v1":"p256_v1", "sig_pub":signingPublicRepresentation.base64EncodedString(), "kem_pub":kemPublicRepresentation.base64EncodedString()]
    }
}
enum AuxFreshInstallationFactory {
    // Original0x35498..0x354c4. Availability is supplied explicitly so tests never query hardware.
    static func selection(secureEnclaveAvailable: Bool, macOS26Available: Bool) -> FreshAuthorityKind {
        !secureEnclaveAvailable ? .softwareP256 : (macOS26Available ? .enclavePq : .enclaveP256)
    }
    static func prepare(admission: CallerAssertedFreshAdmission, secureEnclaveAvailable: Bool, macOS26Available: Bool) throws -> FreshAuthorityMaterial {
        try admission.validate() // Must precede random authority creation or Security calls.
        let kind = selection(secureEnclaveAvailable:secureEnclaveAvailable,macOS26Available:macOS26Available)
        let root = SymmetricKey(size:.bits256).withUnsafeBytes { Data($0) } //0x3545c..0x35490
        switch kind {
        case .softwareP256:
            let signing = P256.Signing.PrivateKey(compactRepresentable:true) //0x35610/14
            let kem = P256.KeyAgreement.PrivateKey(compactRepresentable:true) //0x3566c/70
            return .init(kind:kind,root:root,signingPrivateRepresentation:signing.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signing.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation)
        case .enclaveP256:
            let acl = try accessControl()
            let signing = try SecureEnclave.P256.Signing.PrivateKey(compactRepresentable:true,accessControl:acl,authenticationContext:nil)
            let kem = try SecureEnclave.P256.KeyAgreement.PrivateKey(compactRepresentable:true,accessControl:acl,authenticationContext:nil)
            return .init(kind:kind,root:root,signingPrivateRepresentation:signing.dataRepresentation,kemPrivateRepresentation:kem.dataRepresentation,signingPublicRepresentation:signing.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation)
        case .enclavePq:
            guard #available(macOS 26.0, *) else { throw FreshFactoryError.admissionRefused }
            let acl = try accessControl()
            let signing = try SecureEnclave.MLDSA65.PrivateKey(accessControl:acl,authenticationContext:nil)
            let kem = try SecureEnclave.MLKEM768.PrivateKey(accessControl:acl,authenticationContext:nil)
            return .init(kind:kind,root:root,signingPrivateRepresentation:signing.dataRepresentation,kemPrivateRepresentation:kem.dataRepresentation,signingPublicRepresentation:signing.publicKey.rawRepresentation,kemPublicRepresentation:kem.publicKey.rawRepresentation)
        }
    }
    private static func accessControl() throws -> SecAccessControl {
        var error: Unmanaged<CFError>?
        guard let value = SecAccessControlCreateWithFlags(nil,kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,.privateKeyUsage,&error) else {
            if let error { throw error.takeRetainedValue() }; throw FreshFactoryError.accessControlFailed
        }
        return value
    }
}
