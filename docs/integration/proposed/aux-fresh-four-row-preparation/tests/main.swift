import Foundation
import CryptoKit
let admission = CallerAssertedFreshAdmission(scope:String(repeating:"b",count:64),metadata:.absent,signing:.absent,kem:.absent,wrappedRoot:.absent,newScopeExplicitlyReviewed:true)
let material = try AuxFreshInstallationFactory.prepare(admission:admission,secureEnclaveAvailable:false,macOS26Available:false)
let cohort = try AuxFreshFourRowPreparation.prepareGeneratedMaterial(material)
let p = cohort.targetPayloads
let metadata = try InstallationAuthorityMetadata(json:p.metadata)
precondition(metadata.scheme == .p256 && metadata.storage == .software)
let authority = try AuxCapturedCommandAuthority.p256(metadata:metadata,signingPrivate:p.signing,signingPublic:material.signingPublicRepresentation,kemPrivate:p.kem,kemPublic:material.kemPublicRepresentation,wrappedRoot:p.wrappedRoot)
let core = AuxInstallationCommandCore(context:.installed(authority))
func reply(_ command:String, _ input:String = "") throws -> [String:Any] { try JSONSerialization.jsonObject(with:Data(core.run(command:command,input:input).utf8)) as! [String:Any] }
let initialized = try reply("install-init")
precondition(initialized["sig_pub"] as? String == cohort.publicDescriptor["sig_pub"] && initialized["kem_pub"] as? String == cohort.publicDescriptor["kem_pub"])
let root = try reply("dk-unwrap")
precondition(root["dk"] as? String == material.root.base64EncodedString())
let challenge = Data("synthetic-real-command-core".utf8)
let signatureReply = try reply("cdp-sign","{\"challenge\":\"\(challenge.base64EncodedString())\"}")
let signature = try P256.Signing.ECDSASignature(derRepresentation:Data(base64Encoded:signatureReply["signature"] as! String)!)
let publicKey = try P256.Signing.PublicKey(x963Representation:material.signingPublicRepresentation)
precondition(publicKey.isValidSignature(signature,for:challenge))
precondition(cohort.targetPayloadHashes.count == 4 && cohort.sameRootVerified && cohort.signingContinuityVerified && !cohort.commitAuthorized && !cohort.persistencePerformed)
let descriptor = try JSONSerialization.data(withJSONObject:cohort.publicDescriptor,options:[.sortedKeys])
precondition(!String(decoding:descriptor,as:UTF8.self).contains(material.root.base64EncodedString()))
let mismatched = FreshAuthorityMaterial(kind:.softwareP256,root:material.root,signingPrivateRepresentation:material.signingPrivateRepresentation,kemPrivateRepresentation:material.kemPrivateRepresentation,signingPublicRepresentation:Data(),kemPublicRepresentation:material.kemPublicRepresentation)
do { _ = try AuxFreshFourRowPreparation.prepareGeneratedMaterial(mismatched); fatalError("mismatched public accepted") } catch EnvelopePortError.authorityMismatch {}
print("fresh four-row software generation → v2 wrap → real command core continuity passed; no storage/hardware execution")
