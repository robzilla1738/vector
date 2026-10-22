import Foundation
import CryptoKit

var checks = 0
func check(_ value: Bool, _ message: String) { precondition(value, message); checks += 1 }
func object(_ value: String) -> [String: Any] { try! JSONSerialization.jsonObject(with: Data(value.utf8)) as! [String: Any] }
func error(_ core: AuxInstallationCommandCore, _ command: String, _ input: String = "") -> String? {
    object(core.run(command: command, input: input))["error"] as? String
}
func fixture(_ byte: UInt8) throws -> (AuxInstallationCommandCore, Data, Data) {
    var scalar = Data(repeating: 0, count: 32); scalar[31] = byte
    let signing = try P256.Signing.PrivateKey(rawRepresentation: scalar)
    scalar[31] = byte + 1
    let agreement = try P256.KeyAgreement.PrivateKey(rawRepresentation: scalar)
    let root = Data(repeating: byte, count: 32)
    let envelope = try AuxNativeEnvelopeV2.wrap(root: root, existingPublicKey: agreement.publicKey.x963Representation)
    let metadata = try InstallationAuthorityMetadata(json: Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8))
    let a = try AuxCapturedCommandAuthority.p256(metadata: metadata,
        signingPrivate: signing.rawRepresentation, signingPublic: signing.publicKey.x963Representation,
        kemPrivate: agreement.rawRepresentation, kemPublic: agreement.publicKey.x963Representation,
        wrappedRoot: envelope.auxJson())
    return (AuxInstallationCommandCore(context: .installed(a)), root, signing.publicKey.x963Representation)
}
let (core, root, pub) = try fixture(7)
let (other, otherRoot, _) = try fixture(11)
let status = object(core.run(command: "install-status"))
check(status["installed"] as? Bool == true && status["scheme"] as? String == "p256_v1", "status shape")
check(object(core.run(command: "keys-status"))["keysInstalled"] == nil, "do not invent alias schema")
let publicReply = object(core.run(command: "get-public-keys", input: "{}"))
check(Set(publicReply.keys) == ["scheme", "sig", "kem"] && publicReply["sig"] as? String == pub.base64EncodedString(), "public shape and same signing authority")
let initial = object(core.run(command: "install-init"))
check(Set(initial.keys) == ["scheme", "sig_pub", "kem_pub"] && initial["sig_pub"] as? String == publicReply["sig"] as? String, "existing init shape")
check(object(core.run(command: "dk-unwrap"))["dk"] as? String == root.base64EncodedString(), "same root unwrap")
let challenge = Data("synthetic non-32-byte challenge".utf8)
let input = "{\"challenge\":\"\(challenge.base64EncodedString())\"}"
let encoded = object(core.run(command: "cdp-sign", input: input))["signature"] as! String
let signature = try P256.Signing.ECDSASignature(derRepresentation: Data(base64Encoded: encoded)!)
check(try P256.Signing.PublicKey(x963Representation: pub).isValidSignature(signature, for: challenge), "same key DER signature")
check(object(other.run(command: "dk-unwrap"))["dk"] as? String == otherRoot.base64EncodedString(), "second captured context")
check(object(core.run(command: "dk-unwrap"))["dk"] as? String == root.base64EncodedString(), "no global context bleed")
for invalid in ["{\"challenge\":\"YQ==\",\"challenge\":\"Yg==\"}", "{\"challenge\":\"YQ==\",\"extra\":1}", "{\"challenge\":\"YQ\"}", "{\"challenge\":\"\"}", "[]"] {
    check(error(core, "cdp-sign", invalid) == "Invalid native command input", "strict challenge parser")
}
check(error(core, "dk-unwrap", "{\"key\":1}") != nil, "no extra parameters")
check(error(AuxInstallationCommandCore(), "install-status") == "Installation context is not configured", "unconfigured refuses")
let absent = AuxInstallationCommandCore(context: .absent)
check(object(absent.run(command: "install-status"))["installed"] as? Bool == false, "explicit absent")
check(error(absent, "install-init") == "Fresh installation coordinator is unavailable", "no fresh authority fallback")
check(error(AuxInstallationCommandCore(context: .unavailable), "install-init") == "Installation authority is unavailable", "unavailable does not create")
check(error(core, "install-destroy") == "Installation destruction coordinator is unavailable", "no fake destroy")
check(error(core, "not-a-command") == "Unknown command: not-a-command", "unknown error envelope")

// A valid legacy-shaped record must be rejected BEFORE authority admission.
var scalar = Data(repeating: 0, count: 32); scalar[31] = 19
let sign = try P256.Signing.PrivateKey(rawRepresentation: scalar)
scalar[31] = 20; let kem = try P256.KeyAgreement.PrivateKey(rawRepresentation: scalar)
let meta = try InstallationAuthorityMetadata(json: Data("{\"scheme\":\"p256_v1\",\"key_storage\":\"software\"}".utf8))
let env = try AuxNativeEnvelopeV2.wrap(root: root, existingPublicKey: kem.publicKey.x963Representation)
var legacy = try strictEnvelopeObject(env.auxJson()); legacy.removeValue(forKey: "format"); legacy["scheme"] = "p256_v1"
do {
    _ = try AuxCapturedCommandAuthority.p256(metadata: meta, signingPrivate: sign.rawRepresentation,
        signingPublic: sign.publicKey.x963Representation, kemPrivate: kem.rawRepresentation,
        kemPublic: kem.publicKey.x963Representation, wrappedRoot: JSONSerialization.data(withJSONObject: legacy))
    fatalError("legacy envelope admitted")
} catch { checks += 1 }
// Authenticated ciphertext and expected public identity are enforced at admission.
var tampered = try strictEnvelopeObject(env.auxJson())
var ciphertext = Data(base64Encoded: tampered["ciphertext"] as! String)!
ciphertext[0] ^= 1; tampered["ciphertext"] = ciphertext.base64EncodedString()
for (expected, record) in [(sign.publicKey.x963Representation, try JSONSerialization.data(withJSONObject: tampered)), (pub, try env.auxJson())] {
    do {
        _ = try AuxCapturedCommandAuthority.p256(metadata: meta, signingPrivate: sign.rawRepresentation,
            signingPublic: expected, kemPrivate: kem.rawRepresentation,
            kemPublic: kem.publicKey.x963Representation, wrappedRoot: record)
        fatalError("invalid captured authority admitted")
    } catch { checks += 1 }
}
print("\(checks) synthetic software command checks passed; no storage, enclave, PQ or addon execution")
