import Foundation
import CryptoKit
func admission(_ row: FreshRowObservation = .absent, reviewed: Bool = true) -> CallerAssertedFreshAdmission {
    .init(scope:String(repeating:"a",count:64),metadata:row,signing:.absent,kem:.absent,wrappedRoot:.absent,newScopeExplicitlyReviewed:reviewed)
}
for position in 0..<4 {
for row in [FreshRowObservation.present,.unavailable,.invalid] {
    let rows = (0..<4).map { $0 == position ? row : FreshRowObservation.absent }
    let rejected = CallerAssertedFreshAdmission(scope:String(repeating:"a",count:64),metadata:rows[0],signing:rows[1],kem:rows[2],wrappedRoot:rows[3],newScopeExplicitlyReviewed:true)
    do { _ = try AuxFreshInstallationFactory.prepare(admission:rejected,secureEnclaveAvailable:true,macOS26Available:true); fatalError("accepted nonabsence") } catch FreshFactoryError.admissionRefused {} // Must fail before hardware path.
}
}
do { _ = try AuxFreshInstallationFactory.prepare(admission:admission(reviewed:false),secureEnclaveAvailable:true,macOS26Available:true); fatalError("unreviewed") } catch FreshFactoryError.admissionRefused {}
precondition(AuxFreshInstallationFactory.selection(secureEnclaveAvailable:false,macOS26Available:true) == .softwareP256)
precondition(AuxFreshInstallationFactory.selection(secureEnclaveAvailable:true,macOS26Available:false) == .enclaveP256)
precondition(AuxFreshInstallationFactory.selection(secureEnclaveAvailable:true,macOS26Available:true) == .enclavePq)
let fresh = try AuxFreshInstallationFactory.prepare(admission:admission(),secureEnclaveAvailable:false,macOS26Available:true)
precondition(fresh.root.count == 32 && fresh.kind == .softwareP256 && !fresh.persistencePerformed && !fresh.absenceProvenanceVerified)
let signing = try P256.Signing.PrivateKey(rawRepresentation:fresh.signingPrivateRepresentation)
let kem = try P256.KeyAgreement.PrivateKey(rawRepresentation:fresh.kemPrivateRepresentation)
precondition(signing.publicKey.x963Representation == fresh.signingPublicRepresentation && kem.publicKey.x963Representation == fresh.kemPublicRepresentation)
let message = Data("synthetic-fresh-authority".utf8)
let signature = try signing.signature(for:message)
precondition(signing.publicKey.isValidSignature(signature,for:message))
precondition(fresh.initializationReply["scheme"] == "p256_v1")
print("fresh admission/software authority checks passed; hardware compile only")
