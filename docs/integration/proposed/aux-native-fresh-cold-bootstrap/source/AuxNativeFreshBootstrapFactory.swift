// Source-faithful generation behind the actual sealed native fresh capture.
import Foundation
import CryptoKit
import Security

enum AuxNativeFreshBootstrapFactory {
    // Actual sealed probe consumes the retained home's one initial attempt before
    // reauthentication/real five-row probes. No caller review/availability flags.
    static func prepare(capture:AuxFreshNativeSecureCapture,coldGuard:AuxFreshColdInstallerGuard)throws->PreparedFreshAuxCohort {
        try capture.takeAbsentForGeneration()
        try coldGuard.revalidate()
        let os26:Bool
        if #available(macOS 26.0, *) {os26=true}else{os26=false}
        let kind=AuxFreshInstallationFactory.selection(secureEnclaveAvailable:SecureEnclave.isAvailable,macOS26Available:os26)
        let material=try generate(kind:kind,coldGuard:coldGuard)
        let cohort=try AuxFreshFourRowPreparation.prepareGeneratedMaterial(material)
        try coldGuard.revalidate();return cohort
    }
    // Internal implementation, never an input parser/export/alternate admission.
    private static func generate(kind:FreshAuthorityKind,coldGuard:AuxFreshColdInstallerGuard)throws->FreshAuthorityMaterial {
        try coldGuard.revalidate()
        let root = SymmetricKey(size:.bits256).withUnsafeBytes { Data($0) } //0x3545c..0x35490
        switch kind {
        case .softwareP256:
            try coldGuard.revalidate()
            let signing = P256.Signing.PrivateKey(compactRepresentable:true) //0x35610/14
            try coldGuard.revalidate()
            let kem = P256.KeyAgreement.PrivateKey(compactRepresentable:true) //0x3566c/70
            return .init(kind:kind,root:root,signingPrivateRepresentation:signing.rawRepresentation,kemPrivateRepresentation:kem.rawRepresentation,signingPublicRepresentation:signing.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation)
        case .enclaveP256:
            let acl = try accessControl()
            try coldGuard.revalidate()
            let signing = try SecureEnclave.P256.Signing.PrivateKey(compactRepresentable:true,accessControl:acl,authenticationContext:nil)
            try coldGuard.revalidate()
            let kem = try SecureEnclave.P256.KeyAgreement.PrivateKey(compactRepresentable:true,accessControl:acl,authenticationContext:nil)
            return .init(kind:kind,root:root,signingPrivateRepresentation:signing.dataRepresentation,kemPrivateRepresentation:kem.dataRepresentation,signingPublicRepresentation:signing.publicKey.x963Representation,kemPublicRepresentation:kem.publicKey.x963Representation)
        case .enclavePq:
            guard #available(macOS 26.0, *) else { throw FreshFactoryError.admissionRefused }
            let acl = try accessControl()
            try coldGuard.revalidate()
            let signing = try SecureEnclave.MLDSA65.PrivateKey(accessControl:acl,authenticationContext:nil)
            try coldGuard.revalidate()
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
